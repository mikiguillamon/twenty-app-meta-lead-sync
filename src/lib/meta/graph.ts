import type { MetaLead, MetaPage, MetaQuestion } from '../types.ts';
import { assertMetaQuotaAvailable, isMetaRateLimit, registerMetaRateLimit, observeMetaUsage } from './rate-limit.ts';
import { getObject, getString, requireMetaId, safeError } from '../validation.ts';

export type GraphFetch = typeof fetch;
export type GraphEdge<T> = { data: T[]; paging?: { cursors?: { after?: string }; next?: string } };
export class MetaGraphError extends Error {
  readonly retryable: boolean;
  readonly status: number;
  constructor(message: string, retryable: boolean, status: number) {
    super(message); this.name = 'MetaGraphError'; this.retryable = retryable; this.status = status;
  }
}
export type DiscoveredForm = { id: string; name: string; pageId: string; status?: string; questions: MetaQuestion[] };

export class MetaGraphClient {
  private readonly request: GraphFetch;
  private readonly apiVersion: string;
  constructor(request: GraphFetch = fetch, apiVersion = 'v25.0') {
    if (!/^v\d+\.\d+$/.test(apiVersion)) throw new Error('Versión de Meta inválida');
    this.request = request; this.apiVersion = apiVersion;
  }
  private async get<T>(path: string, token: string, query: Record<string, string> = {}): Promise<T> {
    if (!token || token.length < 20) throw new MetaGraphError('Falta un Page/System Token válido.', false, 401);
    if (!/^\/(me\/accounts|[0-9]+(?:\/leadgen_forms|\/leads)?)$/.test(path)) throw new Error('Ruta Graph API prohibida');
    const url = new URL(`https://graph.facebook.com/${this.apiVersion}${path}`);
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
    await assertMetaQuotaAvailable();
    let response: Response;
    try {
      response = await this.request(url.toString(), {
        method: 'GET', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(20_000),
      });
    } catch (e) { throw new MetaGraphError(`Meta no responde: ${safeError(e)}`, true, 0); }
    const json: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = getObject(getObject(json).error);
      const code = Number(err.code || 0);
      const limited = isMetaRateLimit(response.status, code);
      if (limited) {
        const until = await registerMetaRateLimit(response, code);
        throw new MetaGraphError(`Límite de Meta alcanzado. Pausado hasta ${until}`, false, response.status);
      }
      const retryable = response.status >= 500 || [1, 2, 341].includes(code) || err.is_transient === true;
      const reason = getString(err.message, 160) || `HTTP ${response.status}`;
      throw new MetaGraphError(`Meta Graph ${response.status} (${code || 'HTTP'}): ${safeError(new Error(reason))}`, retryable, response.status);
    }
    await observeMetaUsage(response);
    return json as T;
  }
  private async allPages<T>(path: string, token: string, fields: string, transform: (x: unknown) => T): Promise<T[]> {
    const out: T[] = [];
    let after: string | undefined;
    const used = new Set<string>();
    for (let page = 0; page < 100; page++) {
      const body = await this.get<GraphEdge<unknown>>(path, token, { fields, limit: '100', ...(after ? { after } : {}) });
      if (!Array.isArray(body.data)) throw new MetaGraphError('Meta devolvió una lista inválida.', false, 502);
      out.push(...body.data.map(transform));
      const next = body.paging?.cursors?.after;
      if (!body.paging?.next) return out;
      if (!next || next.length > 2048 || used.has(next)) throw new MetaGraphError('Paginación de Meta incoherente.', true, 502);
      used.add(next);
      after = next;
    }
    throw new MetaGraphError('Hay demasiadas páginas de Meta. Limita la consulta.', true, 429);
  }
  async listManagedPages(systemUserToken: string): Promise<Array<{ id: string; name: string; token: string }>> {
    return this.allPages('/me/accounts', systemUserToken, 'id,name,access_token', x => {
      const row = getObject(x);
      return { id: requireMetaId(row.id), name: getString(row.name, 180), token: getString(row.access_token, 2048) };
    });
  }
  async pageInfo(pageId: string, token: string): Promise<{ id: string; name: string }> {
    const d = await this.get<Record<string, unknown>>(`/${requireMetaId(pageId)}`, token, { fields: 'id,name' });
    const id = requireMetaId(d.id);
    if (id !== pageId) throw new MetaGraphError('Token de página no corresponde al ID declarado.', false, 403);
    return { id, name: getString(d.name, 180) };
  }
  async listForms(pageId: string, token: string): Promise<DiscoveredForm[]> {
    return this.allPages(`/${requireMetaId(pageId)}/leadgen_forms`, token, 'id,name,status,questions', x => {
      const row = getObject(x);
      const questions = Array.isArray(row.questions) ? row.questions.map(q => {
        const v = getObject(q);
        return { key: getString(v.key, 180), label: getString(v.label, 180), type: getString(v.type, 80) };
      }).filter(q => q.key) : [];
      return { id: requireMetaId(row.id), pageId, name: getString(row.name, 180) || 'Formulario sin nombre', status: getString(row.status, 50), questions };
    });
  }
  async leadsPage(formId: string, token: string, sinceSec: number, untilSec: number, after?: string): Promise<{ leads: MetaLead[]; after?: string }> {
    if (!Number.isSafeInteger(sinceSec) || !Number.isSafeInteger(untilSec) || sinceSec > untilSec) throw new Error('Rango temporal inválido');
    if (after && (typeof after !== 'string' || after.length > 2048)) throw new Error('Cursor de Meta inválido');
    const filtering = JSON.stringify([
      { field: 'time_created', operator: 'GREATER_THAN_OR_EQUAL', value: sinceSec },
      { field: 'time_created', operator: 'LESS_THAN', value: untilSec + 1 },
    ]);
    const result = await this.get<GraphEdge<MetaLead>>(`/${requireMetaId(formId)}/leads`, token, {
      fields: 'id,created_time,field_data,form_id', limit: '25', filtering, ...(after ? { after } : {}),
    });
    if (!Array.isArray(result.data)) throw new MetaGraphError('Meta devolvió leads inválidos.', false, 502);
    const next = result.paging?.next ? result.paging?.cursors?.after : undefined;
    if (result.paging?.next && !next) throw new MetaGraphError('Falta cursor after de Meta.', true, 502);
    if (next && next === after) throw new MetaGraphError('Meta repitió el cursor.', true, 502);
    return { leads: result.data, after: next };
  }
}

export type TokenSource = { systemToken?: string; pageTokens?: Record<string, string> };
export function parsePageTokens(raw: string | undefined): Record<string, string> {
  if (!raw?.trim()) return {};
  const data: unknown = JSON.parse(raw);
  if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error('JSON de Page Tokens inválido');
  const result: Record<string, string> = {};
  for (const [id, token] of Object.entries(data)) {
    requireMetaId(id);
    if (typeof token !== 'string' || !token.startsWith('EA') || token.length < 20) throw new Error(`Page Token inválido para página ${id}`);
    result[id] = token;
  }
  return result;
}
export async function resolvePageToken(pageId: string, tokens: TokenSource, client: MetaGraphClient): Promise<string> {
  requireMetaId(pageId);
  const direct = tokens.pageTokens?.[pageId];
  if (direct) return direct;
  if (!tokens.systemToken) throw new Error('No hay System User Token ni Page Token para esta página.');
  const pages = await client.listManagedPages(tokens.systemToken);
  const page = pages.find(p => p.id === pageId);
  if (!page?.token) throw new Error('La página no está accesible o falta su Page Access Token.');
  return page.token;
}
export async function discoverPages(tokens: TokenSource, client: MetaGraphClient): Promise<MetaPage[]> {
  const combined = new Map<string, MetaPage>();
  if (tokens.systemToken) {
    for (const p of await client.listManagedPages(tokens.systemToken)) combined.set(p.id, { id: p.id, name: p.name, enabled: false });
  }
  for (const [pageId, token] of Object.entries(tokens.pageTokens ?? {})) {
    const page = await client.pageInfo(pageId, token);
    combined.set(page.id, { ...page, enabled: false });
  }
  return [...combined.values()];
}
