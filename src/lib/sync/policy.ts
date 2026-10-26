import type { SyncCounters } from '../types.ts';
import type { FormRuntimeState } from './state.ts';
export const shouldSchedule = (intervalMinutes: number, lastAttemptAt: string | undefined, nowMs: number): boolean =>
  !lastAttemptAt || !Number.isFinite(Date.parse(lastAttemptAt)) || nowMs - Date.parse(lastAttemptAt) >= intervalMinutes * 60_000;
export const isRunActive = (state: FormRuntimeState, nowMs: number): boolean =>
  !!state.activeRunId && !!state.activeStartedAt && nowMs - Date.parse(state.activeStartedAt) < 45 * 60_000;
export const secondsForSync = (lastSuccessAt: string | undefined, nowMs: number, historical: boolean): { sinceSec: number; untilSec: number } => {
  const nowSec = Math.floor(nowMs / 1000);
  const earliest = nowSec - 90 * 86400;
  const baseline = historical || !lastSuccessAt ? earliest : Math.floor(Date.parse(lastSuccessAt) / 1000) - 300;
  return { sinceSec: Math.max(earliest, Number.isFinite(baseline) ? baseline : earliest), untilSec: nowSec };
};
export const sumCounters = (a: SyncCounters, b: SyncCounters): SyncCounters => ({
  imported: a.imported + b.imported, linked: a.linked + b.linked, duplicate: a.duplicate + b.duplicate,
  review: a.review + b.review, failed: a.failed + b.failed, pages: a.pages + b.pages,
});
