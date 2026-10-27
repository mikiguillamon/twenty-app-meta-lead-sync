import { RestApiClient } from 'twenty-client-sdk/rest';
import type { PersonDraft } from '../mapping/person.ts';
import type { PersonField } from '../types.ts';
import { normalizePersonFields } from '../mapping/person.ts';
import { getObject } from '../validation.ts';

// All server-side writes use the application's own role (job may have been enqueued by a member).
// The HTTP route must authorize the initiating member separately before queueing any job.
const newClient = () => new RestApiClient({ runAs: 'application' });

function extractRecords(response: unknown, key: string): Record<string, unknown>[] {
  const o = getObject(response);
  const d = getObject(o.data);
  const source = o[key] ?? d[key] ?? o.data;
  if (Array.isArray(source)) return source.map(getObject);
  const s = getObject(source);
  if (Array.isArray(s.edges)) return s.edges.map(e => getObject(getObject(e).node));
  return [];
}
function firstRecord(response: unknown, key: string): Record<string, unknown> | undefined {
  return extractRecords(response, key)[0];
}
function personId(v: unknown): string | undefined {
  const o = getObject(v);
  return typeof o.id === 'string' ? o.id : undefined;
}

export async function getWritablePersonFields(): Promise<PersonField[]> {
  const client = newClient();
  // Use REST metadata endpoints so the app is independent of generated CoreApiClient schema.
  const objects = await client.get('/rest/metadata/objects');
  let fields: unknown;
  try { fields = await client.get('/rest/metadata/fields'); } catch { fields = undefined; }
  const candidates = normalizePersonFields(objects, fields);
  return candidates;
}

function filterEq(field: string, v: string) {
  // Twenty REST grammar uses field[eq]:value. Validate *before* interpolation to
  // prevent commas, parentheses or operators from becoming filter expressions.
  if (!['leadgenId', 'emails.primaryEmail', 'phones.primaryPhoneNumber'].includes(field)) throw new Error('Campo de filtro no permitido');
  if (!/^[A-Za-z0-9_@.+-]{1,320}$/.test(v)) throw new Error('Valor de filtro no permitido');
  return `${field}[eq]:${v}`;
}
async function findOneBy(field: 'emails.primaryEmail'|'phones.primaryPhoneNumber', value: string): Promise<string | undefined> {
  const response = await newClient().get('/rest/people', { query: { filter: filterEq(field, value), limit: '1', fields: 'id' } });
  return personId(firstRecord(response, 'people'));
}
export async function findMatchingPerson(email?: string, phone?: string): Promise<string | undefined> {
  if (email) { const existing = await findOneBy('emails.primaryEmail', email); if (existing) return existing; }
  if (phone) { const existing = await findOneBy('phones.primaryPhoneNumber', phone); if (existing) return existing; }
  return undefined;
}
/** The REST creation result is not guaranteed to use the same response envelope as a GET. */
export function createdPersonId(response: unknown): string | undefined {
  const root = getObject(response);
  const data = getObject(root.data);
  for (const item of [
    root, data, root.person, data.person, root.createPerson, data.createPerson,
    root.record, data.record, getObject(data.createPerson).data,
  ]) {
    const id = personId(item);
    if (id) return id;
  }
  return undefined;
}

/** A POST may have committed even if Twenty returns no readable ID or the response is lost. */
export class PersonCreationUncertainError extends Error {
  constructor() {
    super('Twenty podría haber creado la Persona, pero no se pudo confirmar su ID. Revisión requerida para evitar duplicados.');
    this.name = 'PersonCreationUncertainError';
  }
}

export async function createPerson(
  draft: PersonDraft,
  email?: string,
  phone?: string,
): Promise<string> {
  let response: unknown;
  try {
    response = await newClient().post('/rest/people', draft);
  } catch (error) {
    // Explicit client-side validation/authorization failures do not represent a committed write.
    // Timeouts, server failures and conflicts are ambiguous: never create the Person twice.
    const status = getObject(error).status;
    if (typeof status === 'number' && status >= 400 && status < 500 &&
        ![408, 409, 429].includes(status)) throw error;
    const recovered = await findMatchingPerson(email, phone).catch(() => undefined);
    if (recovered) return recovered;
    throw new PersonCreationUncertainError();
  }

  const id = createdPersonId(response);
  if (id) return id;
  // Twenty 2.50 installations can reply 2xx with an envelope that has no person ID.
  // Re-read by already validated identifiers instead of treating the successful POST as failed.
  const recovered = await findMatchingPerson(email, phone).catch(() => undefined);
  if (recovered) return recovered;
  throw new PersonCreationUncertainError();
}
export async function updatePerson(id: string, data: PersonDraft): Promise<void> {
  await newClient().patch(`/rest/people/${encodeURIComponent(id)}`, data);
}

type LedgerData = {
  leadgenId: string; metaPageId: string; metaFormId: string; status: 'CLAIMED'|'PROCESSED'|'FAILED'|'NEEDS_REVIEW';
  personRecordId?: string; metaCreatedAt?: string; failureReason?: string; answers?: Record<string, unknown>;
};
export type LedgerRecord = LedgerData & { id: string; updatedAt?: string };
const LEDGER_PATH = '/rest/metaSyncSubmissions';
export async function findLedger(leadId: string): Promise<LedgerRecord | undefined> {
  const response = await newClient().get(LEDGER_PATH, { query: { filter: filterEq('leadgenId',leadId), limit: '1' } });
  const row = firstRecord(response, 'metaSyncSubmissions');
  return row && typeof row.id === 'string' ? row as LedgerRecord : undefined;
}
export async function claimLedger(ledger: LedgerData): Promise<'created'|'raced'> {
  try {
    // A successful HTTP 2xx is authoritative: REST response envelopes vary across
    // Twenty versions. The caller reads the row back by its unique leadgenId.
    await newClient().post(LEDGER_PATH, { ...ledger, name: ledger.leadgenId });
    return 'created';
  } catch (e) {
    // Re-read to identify a unique-index collision; don't turn unrelated CRM errors into duplicates.
    if (await findLedger(ledger.leadgenId)) return 'raced';
    throw e;
  }
}
export async function patchLedger(id: string, data: Partial<LedgerData>): Promise<void> {
  await newClient().patch(`${LEDGER_PATH}/${encodeURIComponent(id)}`, data);
}
