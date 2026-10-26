import { kv } from 'twenty-sdk/logic-function';
import type { HistoryEvent, MetaForm, MetaPage, SyncState, WorkspaceConfig, SyncCounters } from '../types.ts';
import { DEFAULT_CONFIG } from '../types.ts';

const configKey = 'meta-lead-sync:config:v1';
const historyKey = (formId: string) => `meta-lead-sync:history:v1:${formId}`;
const stateKey = (formId: string) => `meta-lead-sync:state:${formId}`;
const sessionKey = (runId: string) => `meta-lead-sync:run:${runId}`;

export type SyncSession = {
  runId: string; formId: string; formName: string; sinceSec: number; untilSec: number;
  startedAt: string; stats: SyncCounters; historical: boolean; retryReview: boolean;
  pageCheckpoint?: { page: number; outcomes: Record<string, 'imported'|'linked'|'duplicate'|'review'> };
  lastCommittedPage?: { page: number; after?: string };
};
export type FormRuntimeState = SyncState & { activeRunId?: string; activeStartedAt?: string };
export const loadConfig = async (): Promise<WorkspaceConfig> => (await kv.get<WorkspaceConfig>(configKey)) ?? structuredClone(DEFAULT_CONFIG);
export const saveConfig = async (config: WorkspaceConfig): Promise<void> => { await kv.set(configKey, config); };
export const loadFormState = async (formId: string): Promise<FormRuntimeState> => (await kv.get<FormRuntimeState>(stateKey(formId))) ?? {};
export const saveFormState = async (formId: string, state: FormRuntimeState): Promise<void> => { await kv.set(stateKey(formId), state); };
export const loadHistory = async (formIds: string[]): Promise<HistoryEvent[]> => {
  const perForm = await Promise.all(formIds.map(async id => (await kv.get<HistoryEvent[]>(historyKey(id))) ?? []));
  return perForm.flat().sort((a,b) => b.finishedAt.localeCompare(a.finishedAt)).slice(0,50);
};
export async function addHistory(event: HistoryEvent): Promise<void> {
  // Different forms use different KV keys: their jobs cannot clobber each other's history.
  const key = historyKey(event.formId);
  const old = (await kv.get<HistoryEvent[]>(key)) ?? [];
  await kv.set(key, [event, ...old.filter(e => e.runId !== event.runId)].slice(0, 50));
}
export const saveSession = async (session: SyncSession): Promise<void> => { await kv.set(sessionKey(session.runId), session); };
export const loadSession = async (runId: string): Promise<SyncSession | null> => kv.get<SyncSession>(sessionKey(runId));
export const deleteSession = async (runId: string): Promise<void> => { await kv.delete(sessionKey(runId)); };
export function mergeDiscoveredPages(existing: MetaPage[], discovered: MetaPage[]): MetaPage[] {
  const old = new Map(existing.map(p => [p.id, p]));
  return discovered.map(p => ({ ...p, enabled: old.get(p.id)?.enabled ?? false }));
}
export function mergeDiscoveredForms(existing: MetaForm[], discovered: Array<Omit<MetaForm, 'enabled'|'mappings'>>, pageId: string): MetaForm[] {
  const old = new Map(existing.map(f => [f.id, f]));
  const merged = discovered.map(f => {
    const current = old.get(f.id);
    const keys = new Set(f.questions.map(q => q.key));
    return { ...f, enabled: current?.enabled ?? false, updateExisting: current?.updateExisting ?? false,
      mappings: (current?.mappings ?? []).filter(r => keys.has(r.questionKey)) };
  });
  // Retain forms of other pages; pagination of a page is handled before merging.
  return [...existing.filter(f => f.pageId !== pageId), ...merged];
}
export { shouldSchedule, isRunActive, secondsForSync, sumCounters } from './policy.ts';
