import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { IDS } from '../../constants/ids.ts';
import type { MetaForm, PersonField, WorkspaceConfig } from '../types.ts';
import { ALLOWED_INTERVALS } from '../types.ts';
import { requireMetaId, getObject, getString } from '../validation.ts';
import { validateMappings } from '../mapping/person.ts';
import { getWritablePersonFields } from '../twenty/api.ts';
import { loadConfig, saveConfig, mergeDiscoveredPages, mergeDiscoveredForms, loadFormState, loadHistory } from './state.ts';
import { MetaGraphClient, discoverPages, parsePageTokens, resolvePageToken } from '../meta/graph.ts';
import { scheduleForm } from './runner.ts';
import { readAudit } from './audit.ts';
import { assertMetaQuotaAvailable, getActiveMetaQuota } from '../meta/rate-limit.ts';

const graph = new MetaGraphClient();
export async function assertAdmin(): Promise<void> {
  // Unlike `runAs: application`, this client is intersected with the invoking user's permissions.
  // Requires the user's APPLICATIONS flag and a session in this same workspace.
  const client = new MetadataApiClient();
  const result = await client.query({
    findOneApplication: {
      __args: { universalIdentifier: IDS.APPLICATION },
      id: true,
    },
  });
  if (!result.findOneApplication?.id) throw new Error('Acceso denegado: se requiere administrar aplicaciones.');
}

const tokensFromEnv = () => ({
  systemToken: process.env.META_SYSTEM_USER_TOKEN,
  pageTokens: parsePageTokens(process.env.META_PAGE_TOKENS_JSON),
});

export async function dashboard() {
  const config = await loadConfig();
  const states = await Promise.all(config.forms.map(async f => ({ formId: f.id, ...(await loadFormState(f.id)) })));
  let fields: PersonField[] = [];
  let metadataError: string | undefined;
  try { fields = await getWritablePersonFields(); } catch (e) { metadataError = e instanceof Error ? e.message.slice(0,180) : 'Metadata no disponible'; }
  const history = await loadHistory(config.forms.map(f => f.id));
  const audit = await readAudit(history.map(e=>e.runId).concat(states.map(s=>s.activeRunId??'').filter(Boolean)));
  return { config, states, audit, quota: await getActiveMetaQuota(), history, fields, metadataError, credentials: {
    systemConfigured: !!process.env.META_SYSTEM_USER_TOKEN,
    pageTokensConfigured: !!process.env.META_PAGE_TOKENS_JSON,
  }};
}
export async function validateToken(body: unknown) {
  const input = getObject(body);
  const token = getString(input.token, 3000);
  if (!token.startsWith('EA') || token.length < 20) throw new Error('Token Meta inválido');
  if (input.mode === 'system') {
    const pages = await graph.listManagedPages(token);
    return { ok: true, mode: 'system', pageCount: pages.length, pages: pages.map(({id,name}) => ({id,name})) };
  }
  if (input.mode === 'page') {
    const pageId = requireMetaId(input.pageId);
    return { ok: true, mode: 'page', page: await graph.pageInfo(pageId, token) };
  }
  throw new Error('Modo de autenticación no válido');
}

export async function discoverPagesAndSave() {
  const cfg = await loadConfig();
  const pages = await discoverPages(tokensFromEnv(), graph);
  if (pages.length === 0) throw new Error('Meta no devolvió páginas para estas credenciales.');
  cfg.pages = mergeDiscoveredPages(cfg.pages, pages);
  cfg.forms = cfg.forms.map(f => ({ ...f, enabled: f.enabled && cfg.pages.some(p => p.id === f.pageId && p.enabled) }));
  await saveConfig(cfg);
  return { pages: cfg.pages };
}
export async function discoverFormsAndSave(pageId: unknown) {
  const id = requireMetaId(pageId);
  const cfg = await loadConfig();
  if (!cfg.pages.some(p => p.id === id)) throw new Error('Página no registrada en este workspace.');
  const token = await resolvePageToken(id, tokensFromEnv(), graph);
  const found = await graph.listForms(id, token);
  cfg.forms = mergeDiscoveredForms(cfg.forms, found, id);
  await saveConfig(cfg);
  return { forms: cfg.forms.filter(f => f.pageId === id) };
}

/** Only update existing server-discovered ids/questions and validated targets. */
export async function saveWorkspaceConfig(body: unknown): Promise<{ config: WorkspaceConfig }> {
  const input = getObject(body);
  const requested = getObject(input.config);
  const cfg = await loadConfig();
  const minutes = requested.intervalMinutes;
  if (typeof minutes !== 'number' || !ALLOWED_INTERVALS.some(n => n === minutes)) throw new Error('Frecuencia no permitida');
  if (!Array.isArray(requested.pages) || !Array.isArray(requested.forms)) throw new Error('Configuración incompleta');
  if (requested.pages.length !== cfg.pages.length || requested.forms.length !== cfg.forms.length) throw new Error('Actualiza la configuración antes de guardarla.');
  const selectedPages = new Map(requested.pages.map(p => {const x=getObject(p);return [x.id,x];}));
  const selectedForms = new Map(requested.forms.map(f => {const x=getObject(f);return [x.id,x];}));
  if (selectedPages.size !== cfg.pages.length || selectedForms.size !== cfg.forms.length) throw new Error('IDs duplicados o desconocidos');
  const fields = await getWritablePersonFields();
  cfg.intervalMinutes = minutes as WorkspaceConfig['intervalMinutes'];
  cfg.pages = cfg.pages.map(page => {
    const target = selectedPages.get(page.id);
    if (!target || typeof target.enabled !== 'boolean') throw new Error('Página inválida');
    return { ...page, enabled: target.enabled };
  });
  cfg.forms = cfg.forms.map(form => {
    const selected = selectedForms.get(form.id);
    if (!selected || typeof selected.enabled !== 'boolean') throw new Error('Formulario inválido');
    if (!Array.isArray(selected.mappings)) throw new Error('Mapeos incompletos');
    const mappings = validateMappings(selected.mappings, form.questions, fields);
    return { ...form,
      enabled: selected.enabled && cfg.pages.some(p => p.id === form.pageId && p.enabled),
      updateExisting: selected.updateExisting === true, mappings };
  });
  await saveConfig(cfg);
  return { config: cfg };
}
export async function manualSync(body: unknown) {
  const input = getObject(body);
  const forceOnce = input.forceOnce === true;
  if (forceOnce) {
    if (input.historical === true) throw new Error('La prueba forzada no permite histórico.');
    if (!await getActiveMetaQuota()) throw new Error('La prueba forzada solo está disponible durante una pausa de Meta.');
  } else {
    await assertMetaQuotaAvailable();
  }
  const config = await loadConfig();
  const chosen = input.formId === undefined ? undefined : requireMetaId(input.formId);
  const forms = config.forms.filter(f => f.enabled && config.pages.some(p => p.id === f.pageId && p.enabled) && (!chosen || f.id === chosen));
  if (!forms.length) throw new Error('No hay formularios activos seleccionados para sincronizar.');
  if (!chosen) throw new Error('Selecciona un solo formulario para evitar superar el límite de Meta.');
  const jobs: Array<{ formId: string; queued: boolean; reason?: string; runId?: string }> = [];
  for (const form of forms) jobs.push({ formId: form.id, ...(await scheduleForm(form, { historical: input.historical === true, retryReview: input.retryReview === true, forceOnce })) });
  return { jobs };
}
