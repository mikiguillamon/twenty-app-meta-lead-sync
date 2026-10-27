import { kv } from 'twenty-sdk/logic-function';

/** Workspace-scoped circuit breaker. Never store Meta tokens or response payloads. */
const KEY = 'meta-lead-sync:quota:v1';

export type MetaQuotaState = {
  pausedUntil: string;
  reason: 'rate_limit' | 'high_usage';
  observedAt: string;
  code?: number;
  usagePercent?: number;
};

export class MetaQuotaPausedError extends Error {
  readonly pausedUntil: string;
  constructor(pausedUntil: string) {
    super(`Meta ha limitado las solicitudes. Sincronización pausada hasta ${pausedUntil}. No reintentes manualmente.`);
    this.name = 'MetaQuotaPausedError';
    this.pausedUntil = pausedUntil;
  }
}

export const isMetaRateLimit = (status: number, code: number): boolean =>
  status === 429 || [4, 17, 32, 613, 80001, 80005].includes(code);

const parseJson = (value: string | null): unknown => {
  if (!value || value.length > 32768) return undefined;
  try { return JSON.parse(value); } catch { return undefined; }
};
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const validNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;

function businessUsage(value: unknown, depth = 0): { percent: number; recoveryMinutes: number } {
  if (depth > 3) return { percent: 0, recoveryMinutes: 0 };
  if (Array.isArray(value)) {
    return value.slice(0, 32).reduce((acc, child) => {
      const v = businessUsage(child, depth + 1);
      return { percent: Math.max(acc.percent, v.percent), recoveryMinutes: Math.max(acc.recoveryMinutes, v.recoveryMinutes) };
    }, { percent: 0, recoveryMinutes: 0 });
  }
  const data = object(value);
  const direct = Math.max(0, ...['call_count', 'total_time', 'total_cputime'].map(k => validNumber(data[k]) ?? 0));
  const recovery = validNumber(data.estimated_time_to_regain_access) ?? 0;
  const children = Object.values(data).slice(0, 32).map(x => businessUsage(x, depth + 1));
  return {
    percent: Math.max(direct, ...children.map(x => x.percent)),
    recoveryMinutes: Math.max(recovery, ...children.map(x => x.recoveryMinutes)),
  };
}

const appUsagePercent = (value: unknown): number =>
  Math.max(0, ...['call_count', 'total_time', 'total_cputime'].map(k => validNumber(object(value)[k]) ?? 0));

export async function getActiveMetaQuota(nowMs = Date.now()): Promise<MetaQuotaState | null> {
  const state = await kv.get<MetaQuotaState>(KEY);
  return state && Date.parse(state.pausedUntil) > nowMs ? state : null;
}

export async function assertMetaQuotaAvailable(nowMs = Date.now()): Promise<void> {
  const state = await getActiveMetaQuota(nowMs);
  if (state) throw new MetaQuotaPausedError(state.pausedUntil);
}

async function pauseFor(seconds: number, reason: MetaQuotaState['reason'], code?: number, usagePercent?: number): Promise<string> {
  const nowMs = Date.now();
  const requested = nowMs + Math.min(Math.max(seconds, 60), 6 * 3600) * 1000;
  const existing = await getActiveMetaQuota(nowMs);
  const untilMs = Math.max(requested, existing ? Date.parse(existing.pausedUntil) : 0);
  const pausedUntil = new Date(untilMs).toISOString();
  await kv.set(KEY, {
    pausedUntil, reason, observedAt: new Date(nowMs).toISOString(),
    ...(code !== undefined ? { code } : {}),
    ...(usagePercent !== undefined ? { usagePercent } : {}),
  } satisfies MetaQuotaState);
  return pausedUntil;
}

const retryAfterSeconds = (header: string | null, nowMs: number): number => {
  if (!header) return 0;
  const n = Number(header);
  if (Number.isFinite(n) && n > 0) return n;
  const time = Date.parse(header);
  return Number.isFinite(time) ? Math.max(0, (time - nowMs) / 1000) : 0;
};

/** Called exactly once for a throttled Meta HTTP response; no immediate retry. */
export async function registerMetaRateLimit(response: Response, code: number): Promise<string> {
  const business = businessUsage(parseJson(response.headers.get('x-business-use-case-usage')));
  const usagePercent = Math.max(
    appUsagePercent(parseJson(response.headers.get('x-app-usage'))),
    business.percent,
  );
  const baseSeconds = code === 4 ? 3600 : 1800;
  const seconds = Math.max(
    baseSeconds,
    retryAfterSeconds(response.headers.get('retry-after'), Date.now()),
    business.recoveryMinutes * 60,
  );
  return pauseFor(seconds, 'rate_limit', code, usagePercent);
}

/** Optional proactive pacing from Meta's real usage headers; no extra Graph calls. */
export async function observeMetaUsage(response: Response): Promise<void> {
  const business = businessUsage(parseJson(response.headers.get('x-business-use-case-usage')));
  const percent = Math.max(appUsagePercent(parseJson(response.headers.get('x-app-usage'))), business.percent);
  if (percent >= 90) {
    await pauseFor(percent >= 98 ? 30 * 60 : 15 * 60, 'high_usage', undefined, percent);
  }
}
