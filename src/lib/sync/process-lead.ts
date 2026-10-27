import type { MetaForm, MetaLead, PersonField } from '../types.ts';
import { safeError, requireMetaId } from '../validation.ts';
import { mapLeadToPerson } from '../mapping/person.ts';
import { findLedger, claimLedger, patchLedger, findMatchingPerson, personRecordExists, createPerson, PersonCreationUncertainError, updatePerson } from '../twenty/api.ts';

export type LeadOutcome = 'imported' | 'linked' | 'duplicate' | 'review';

/** Claim the leadgenId *before* writing CRM records. Unique index prevents parallel claims. */
export async function processLead(lead: MetaLead, form: MetaForm, fields: PersonField[], retryReview: boolean): Promise<LeadOutcome> {
  requireMetaId(lead.id);
  let ledger = await findLedger(lead.id);
  // Only a linked, confirmed-absent Person can be recovered. Never reset deduplication
  // for a legacy PROCESSED entry that has no Person ID.
  let linkedPersonWasDeleted = false;
  if (ledger?.status === 'PROCESSED') {
    if (!ledger.personRecordId || await personRecordExists(ledger.personRecordId)) return 'duplicate';
    linkedPersonWasDeleted = true;
  }
  if (ledger?.status === 'NEEDS_REVIEW' && !retryReview) return 'duplicate';
  if (ledger?.status === 'CLAIMED' && Date.now() - Date.parse(ledger.updatedAt ?? '') < 5 * 60_000) {
    throw new Error('Otro trabajo está importando este lead; se reintentará.');
  }
  const answers: Record<string, string[]> = {};
  for (const fd of lead.field_data ?? []) {
    if (fd && typeof fd.name === 'string') answers[fd.name.slice(0, 120)] = (fd.values ?? []).slice(0, 30).map(v => String(v).slice(0, 2000));
  }
  if (!ledger) {
    const claimed = await claimLedger({ leadgenId: lead.id, metaPageId: form.pageId, metaFormId: form.id,
      status: 'CLAIMED', metaCreatedAt: lead.created_time, answers });
    if (claimed === 'raced') throw new Error('Otro trabajo ha reclamado este lead; se reintentará.');
    ledger = await findLedger(lead.id);
    if (!ledger) throw new Error('No se puede recuperar el nuevo ledger.');
  } else {
    await patchLedger(ledger.id, { status: 'CLAIMED', failureReason: '', answers,
      ...(linkedPersonWasDeleted ? { personRecordId: '' } : {}) });
    if (linkedPersonWasDeleted) ledger = { ...ledger, personRecordId: undefined };
  }
  try {
    const result = mapLeadToPerson(lead, form.mappings, fields);
    if (result.issues.length) {
      await patchLedger(ledger.id, { status: 'NEEDS_REVIEW', failureReason: result.issues.join('; ').slice(0, 230) });
      return 'review';
    }
    const existing = ledger.personRecordId || await findMatchingPerson(result.email, result.phone);
    if (existing) {
      if (form.updateExisting) await updatePerson(existing, result.draft);
      await patchLedger(ledger.id, { status: 'PROCESSED', personRecordId: existing, failureReason: '' });
      return 'linked';
    }
    const personId = await createPerson(result.draft, result.email, result.phone);
    await patchLedger(ledger.id, { status: 'PROCESSED', personRecordId: personId, failureReason: '' });
    return 'imported';
  } catch (e) {
    if (e instanceof PersonCreationUncertainError) {
      await patchLedger(ledger.id, { status: 'NEEDS_REVIEW', failureReason: safeError(e) });
      return 'review';
    }
    await patchLedger(ledger.id, { status: 'FAILED', failureReason: safeError(e) });
    throw e;
  }
}
