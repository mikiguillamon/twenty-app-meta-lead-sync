import { kv } from 'twenty-sdk/logic-function';

export type AuditEvent = {
  at: string;
  runId: string;
  formId: string;
  level: 'INFO'|'WARN'|'ERROR';
  kind: 'QUEUED'|'PAGE'|'COMPLETED'|'FAILED'|'RATE_LIMIT'|'FORCED'|'SKIPPED';
  page?: number;
  httpStatus?: number;
  metaCode?: number;
  durationMs?: number;
  imported?: number;
  linked?: number;
  duplicate?: number;
  review?: number;
};
const key = (runId: string) => 'meta-lead-sync:audit:v1:' + runId;
const allowedId = (v: string) => /^[0-9a-f-]{36}$/i.test(v);
const allowedForm = (v: string) => /^[0-9]{5,30}$/.test(v);
const number = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
export async function appendAudit(event: Omit<AuditEvent,'at'>): Promise<void> {
  if (!allowedId(event.runId) || !allowedForm(event.formId)) return;
  // Field-by-field allowlist. Never log error.message, tokens, emails or lead bodies.
  const sanitized: AuditEvent = {
    at: new Date().toISOString(), runId:event.runId, formId:event.formId,
    kind:event.kind, level:event.level,
    ...(number(event.page)!==undefined?{page:number(event.page)}:{}),
    ...(number(event.httpStatus)!==undefined?{httpStatus:number(event.httpStatus)}:{}),
    ...(number(event.metaCode)!==undefined?{metaCode:number(event.metaCode)}:{}),
    ...(number(event.durationMs)!==undefined?{durationMs:number(event.durationMs)}:{}),
    ...(number(event.imported)!==undefined?{imported:number(event.imported)}:{}),
    ...(number(event.linked)!==undefined?{linked:number(event.linked)}:{}),
    ...(number(event.duplicate)!==undefined?{duplicate:number(event.duplicate)}:{}),
    ...(number(event.review)!==undefined?{review:number(event.review)}:{}),
  };
  const old = (await kv.get<AuditEvent[]>(key(event.runId))) ?? [];
  await kv.set(key(event.runId), [...old, sanitized].slice(-60));
}
export async function readAudit(runIds: string[]): Promise<AuditEvent[]> {
  const keys=[...new Set(runIds.filter(allowedId))].slice(0,40);
  const arrays=await Promise.all(keys.map(id=>kv.get<AuditEvent[]>(key(id))));
  return arrays.flatMap(x=>Array.isArray(x)?x:[]).filter(e=>Date.parse(e.at)>Date.now()-14*86400000)
    .sort((a,b)=>b.at.localeCompare(a.at)).slice(0,200);
}
export async function deleteAudit(runId:string):Promise<void> {
  if (allowedId(runId)) await kv.delete(key(runId));
}
