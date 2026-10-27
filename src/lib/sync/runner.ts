import { enqueueJobs, RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { IDS } from '../../constants/ids.ts';
import { MetaGraphClient, MetaGraphError, parsePageTokens, resolvePageToken } from '../meta/graph.ts';
import { processLead } from './process-lead.ts';
import { assertMetaQuotaAvailable, getActiveMetaQuota, MetaQuotaPausedError } from '../meta/rate-limit.ts';
import { getWritablePersonFields } from '../twenty/api.ts';
import { blankCounters } from '../types.ts';
import { sumCounters } from './policy.ts';
import type { MetaForm, SyncCounters } from '../types.ts';
import { safeError, requireMetaId } from '../validation.ts';
import { addHistory, deleteSession, isRunActive, loadConfig, loadFormState, loadSession, saveFormState, saveSession, secondsForSync, type SyncSession } from './state.ts';

export type FormJob = { runId: string; formId: string; page: number; after?: string };
const graph = new MetaGraphClient();
const maxPages = 400; // 25 leads per page; exceeds normal run sizes -> explicit failure instead of silent truncation.

export async function scheduleForm(form: MetaForm, options: { historical?: boolean; retryReview?: boolean } = {}): Promise<{ queued: boolean; reason?: string; runId?: string }> {
  await assertMetaQuotaAvailable();
  const st = await loadFormState(form.id);
  if (isRunActive(st, Date.now())) return { queued: false, reason: 'El formulario ya tiene una importación en curso.' };
  const runId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const range = secondsForSync(st.lastSuccessAt, Date.now(), !!options.historical);
  const session: SyncSession = { runId, formId: form.id, formName: form.name, ...range,
    startedAt, stats: blankCounters(), historical: !!options.historical, retryReview: !!options.retryReview };
  await saveSession(session);
  await saveFormState(form.id, { ...st, lastAttemptAt: startedAt, activeRunId: runId, activeStartedAt: startedAt, lastError: undefined });
  try {
    await enqueueJobs({ logicFunctionUniversalIdentifier: IDS.WORKER_FORM,
      jobs: [{ jobId: `mls-${runId}-0`, payload: { runId, formId: form.id, page: 0 } satisfies FormJob }], retryLimit: 3 });
  } catch (e) {
    await saveFormState(form.id, { ...st, lastError: safeError(e) });
    await deleteSession(runId);
    throw e;
  }
  return { queued: true, runId };
}

async function finalize(session: SyncSession, failedReason?: string): Promise<void> {
  const previous = await loadFormState(session.formId);
  // Do not allow an obsolete run to move a cursor backwards.
  if (previous.activeRunId !== session.runId) return;
  const finishedAt = new Date().toISOString();
  await addHistory({ runId: session.runId, formId: session.formId, formName: session.formName, startedAt: session.startedAt,
    finishedAt, stats: session.stats, status: failedReason ? 'FAILED' : 'OK', ...(failedReason ? {reason:failedReason}: {}) });
  await saveFormState(session.formId, { ...previous, activeRunId: undefined, activeStartedAt: undefined,
    lastError: failedReason, lastResult: session.stats,
    ...(!failedReason ? { lastSuccessAt: new Date(session.untilSec * 1000).toISOString(), completedRunId: session.runId } : {}),
  });
  await deleteSession(session.runId);
}

async function continueAfterPage(session: SyncSession, job: FormJob, after?: string): Promise<void> {
  if (!after) { await finalize(session); return; }
  if (job.page >= maxPages) throw new Error('Demasiadas páginas; revisar límites del formulario');
  // Queue job ids are idempotent inside a workspace. An interrupted handler can safely re-enqueue.
  await enqueueJobs({
    logicFunctionUniversalIdentifier: IDS.WORKER_FORM,
    jobs: [{ jobId: `mls-${session.runId}-${job.page + 1}`,
      payload: { runId: job.runId, formId: job.formId, page: job.page + 1, after } satisfies FormJob }],
    retryLimit: 3, delayMs: 12_000,
  });
}

export async function runFormPage(job: FormJob, retryCount: number, maxRetries: number): Promise<{ done: boolean; stats?: SyncCounters }> {
  if (!job || typeof job.runId !== 'string' || typeof job.formId !== 'string' ||
      !Number.isInteger(job.page) || job.page < 0 || job.page > maxPages) throw new Error('Trabajo inválido');
  const cfg = await loadConfig();
  const form = cfg.forms.find(x => x.id === job.formId && x.enabled && cfg.pages.some(p => p.id === x.pageId && p.enabled));
  const session = await loadSession(job.runId);
  const state = await loadFormState(job.formId);
  if (!session || !form || state.activeRunId !== job.runId) return { done: true };
  try {
    await assertMetaQuotaAvailable();
    // A previous attempt may have already committed this page before the next enqueue failed.
    if (session.lastCommittedPage?.page === job.page) {
      await continueAfterPage(session, job, session.lastCommittedPage.after);
      return { done: !session.lastCommittedPage.after, stats: session.stats };
    }
    if (session.lastCommittedPage && session.lastCommittedPage.page > job.page) return { done: true };

    // Heartbeat: a long historical scan may exceed the initial lease. Renew on each page.
    await saveFormState(form.id, { ...state, activeStartedAt: new Date().toISOString() });
    const fields = await getWritablePersonFields();
    const directPageToken = parsePageTokens(process.env.META_PAGE_TOKENS_JSON)[form.pageId];
    const systemToken = process.env.META_SYSTEM_USER_TOKEN;
    // A system-user token assigned to the Page can read Lead Ads directly.
    // Avoid re-fetching all managed Pages for every 25-lead batch.
    const token = directPageToken || systemToken;
    if (!token) throw new Error('Falta un token de Meta para esta página.');
    let result;
    try {
      result = await graph.leadsPage(form.id, token, session.sinceSec, session.untilSec, job.after);
    } catch (e) {
      // Only an explicit access-token/permission error justifies resolving a Page token.
      // Never add more requests on throttling, network failures or Graph errors 4/613.
      if (directPageToken || !systemToken || !(e instanceof MetaGraphError) ||
          ![10, 190, 200].includes(e.code)) throw e;
      const pageToken = await resolvePageToken(form.pageId, { systemToken }, graph);
      result = await graph.leadsPage(form.id, pageToken, session.sinceSec, session.untilSec, job.after);
    }
    const checkpoint = session.pageCheckpoint?.page === job.page
      ? session.pageCheckpoint : { page: job.page, outcomes: {} as Record<string, 'imported'|'linked'|'duplicate'|'review'> };
    for (const lead of result.leads) {
      const leadId = requireMetaId(lead.id);
      if (checkpoint.outcomes[leadId]) continue; // retry: do not double-count or rewrite committed leads
      const outcome = await processLead(lead, form, fields, session.retryReview);
      checkpoint.outcomes[leadId] = outcome;
      session.pageCheckpoint = checkpoint;
      await saveSession(session); // checkpoint of a bounded 25-lead page
    }
    const pageStats = blankCounters();
    for (const outcome of Object.values(checkpoint.outcomes)) pageStats[outcome === 'review' ? 'review' : outcome]++;
    pageStats.pages = 1;
    session.stats = sumCounters(session.stats, pageStats);
    session.lastCommittedPage = { page: job.page, ...(result.after ? { after: result.after } : {}) };
    session.pageCheckpoint = undefined;
    await saveSession(session);
    await continueAfterPage(session, job, result.after);
    return { done: !result.after, stats: session.stats };
  } catch (e) {
    const reason = safeError(e);
    if (e instanceof MetaQuotaPausedError || await getActiveMetaQuota()) {
      // Abort current run without marking the cursor as successful. Cron resumes after the pause.
      await finalize(session, reason);
      return { done: true, stats: session.stats };
    }
    const retryable = (e instanceof MetaGraphError && e.retryable) ||
      reason.includes('Otro trabajo') || reason.includes('reclamado');
    if (retryable && retryCount < Math.min(maxRetries, 3)) throw new RetryableLogicFunctionError(reason);
    session.stats.failed++;
    await saveSession(session);
    await finalize(session, reason);
    // A failed run NEVER advances lastSuccessAt; subsequent cron cycles replay safely via ledger.
    return { done: true, stats: session.stats };
  }
}
