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
export async function createPerson(draft: PersonDraft): Promise<string> {
  const response = await newClient().post('/rest/people', draft);
  const id = personId(getObject(response).data) ?? personId(getObject(response).person) ?? personId(response);
  if (!id) throw new Error('Twenty no devolvió el ID de la Persona creada');
  return id;
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
