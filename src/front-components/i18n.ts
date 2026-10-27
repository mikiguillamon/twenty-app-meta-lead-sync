/**
 * UI-only translations. Never translate API keys, Meta question values, stored statuses or IDs.
 * All new user-facing frontend copy must be added to both dictionaries.
 */
export type Language = 'en' | 'es';
export type LanguageMode = Language | 'auto';
export type TranslationParams = Readonly<Record<string, string | number>>;

export const en = {
  language: 'Language',
  automaticLanguage: 'Automatic (Twenty)',
  english: 'English',
  spanish: 'Español',
  appName: 'Meta Lead Sync',
  loading: 'Loading settings and checking permissions…',
  accessFailure: 'Unable to load settings: %{reason}',
  unknownNetworkError: 'Unknown network error',
  errorPrefix: 'Error: %{reason}',
  actionComplete: 'Done.',
  configSaved: 'Settings saved to this workspace.',
  metadataError: 'Some custom fields could not be loaded: %{reason}',
  systemTokenRequired: 'Enter a System User Token',
  tokenJsonShape: 'Expected format: {"PAGE_ID":"PAGE_TOKEN"}',
  systemTokenSaved: 'System User Token verified and securely stored in this workspace.',
  pageTokensSaved: 'Page tokens verified and saved. The new JSON replaces the previous set.',
  systemTokenRemoved: 'System User Token removed from this workspace.',
  pageTokensRemoved: 'Page tokens removed from this workspace.',
  pagesRefreshed: 'Pages updated.',
  pageFormsRefreshed: 'Forms for %{page} updated.',
  mappingChangesUnsaved: 'Replacements updated. Save the mapping to apply them.',
  invalidReplacementJson: 'Invalid replacements JSON',
  queued: 'Sync queued. Refresh the status to view progress.',
  queuedHistorical: 'Historical import queued (up to 90 days).',
  statusRefreshed: 'Status and history refreshed.',
  queuedForced: 'Forced test queued (up to 25 leads).',
  connectionsTitle: 'Connect to Meta',
  systemTokenRecommended: 'System User Token (recommended)',
  tokenStored: '✓ Token saved',
  tokenMissing: '○ No token configured · Add one to connect to Meta.',
  systemTokenLabel: 'System User Token',
  validateSystemToken: 'Verify with Meta and save securely',
  deleteToken: 'Remove token',
  pageTokensOptional: 'Page Access Tokens (optional)',
  pageTokensStored: '✓ Additional tokens saved',
  pageTokensMissing: '○ No additional tokens · Optional',
  pageTokensJsonLabel: 'JSON: Page ID → token',
  validatePageTokens: 'Verify and replace all page tokens',
  removePageTokens: 'Remove page tokens',
  webhookUnchanged: 'No webhook subscriptions are created or changed. Your existing Meta webhook stays in place.',
  pagesTitle: 'Meta Pages',
  pagesDescription: 'Find Pages available to your token and choose which ones can import leads.',
  discoverPages: 'Discover my Pages',
  savePages: 'Save active Pages',
  searchPages: 'Search Pages',
  searchPagesPlaceholder: 'Name or ID…',
  pagesCounter: '%{visible} of %{total} Pages · %{active} active',
  noPages: 'No Pages found. Discover them using your connection credentials.',
  noPagesMatch: 'No Pages match your search.',
  pageIdLabel: 'Page ID: %{id}',
  updateForms: 'Refresh forms',
  formsTitle: 'Lead forms',
  formsDescription: 'Enable each form separately. Forms on the same Page may have different mappings.',
  saveForms: 'Save active forms',
  searchForms: 'Search forms',
  searchFormsPlaceholder: 'Name, ID or Page…',
  formsCounter: '%{visible} of %{total} forms · %{active} active',
  noForms: 'No forms yet. Open Pages and choose Refresh forms.',
  noFormsMatch: 'No forms match your search.',
  formSummary: 'Page: %{page} · ID: %{id} · %{status} · Questions: %{count}',
  noFormStatus: 'unknown status',
  updateExisting: 'Update fields on existing People',
  mappingTitle: 'Map fields by form',
  mappingDescription: 'Choose a Person field for each question. Custom fields are shown when accessible through the Metadata API.',
  formLabel: 'Form',
  noQuestions: 'Meta returned no questions for this form.',
  questionTypeText: 'text',
  ignoreQuestion: 'Do not import this question',
  customFieldSuffix: ' · custom',
  validOptions: 'Allowed options: %{options}',
  replacementsLabel: 'Replacements (JSON: Meta answer → Twenty value)',
  saveMapping: 'Save mappings',
  syncTitle: 'Sync and history',
  syncDescription: 'A check runs every minute, with one form processed at a time. Meta rate limits temporarily pause this workspace.',
  automaticInterval: 'Automatic interval',
  everyMinutes: 'Every %{minutes} min',
  saveFrequency: 'Save frequency',
  quotaPause: 'Meta is temporarily limiting requests. Paused until %{until} (local time).',
  quotaAdvice: 'Requests will resume after that time. Refresh the status to check again.',
  selectSyncFormLabel: 'Form to sync',
  selectSyncForm: 'Select a form (one per run)',
  retryReview: 'Retry NEEDS_REVIEW entries too (after fixing mappings)',
  syncNow: 'Sync now',
  syncHistorical: 'Import history (90 days)',
  refreshStatus: 'Refresh status',
  forceTest: 'Force test (up to 25 leads)',
  statesHeading: 'Form status · %{count}',
  inProgress: 'In progress',
  noActiveRun: 'No active run',
  lastSuccessAndAttempt: 'Last success: %{success} · Last attempt: %{attempt}',
  never: 'Never',
  noConfiguredForms: 'No forms configured.',
  auditHeading: 'Technical audit · %{count}',
  auditPeriod: 'Events from the last 14 days',
  runLabel: 'Run %{id}',
  batchLabel: 'Batch %{batch}',
  noAuditEvents: 'No audit events yet.',
  historyHeading: 'Recent runs · %{count}',
  historyCompletedAt: 'Completed',
  historyForm: 'Form',
  historyStatus: 'Status',
  historyImported: 'New',
  historyLinked: 'Linked',
  historyDuplicates: 'Duplicates',
  historyReview: 'Review',
  historyFailed: 'Failed',
  historyEmpty: 'No completed syncs yet.',
  backendNeedsReview: 'The Person could have been created but its ID could not be confirmed. Review required to prevent duplicates.',
  backendRateLimitPrefix: 'Meta request limit reached. Paused until ',
  backendImportInProgress: 'Another job is importing this lead; it will be retried.',
  backendPersonMissing: 'Twenty did not return the created Person ID',
  backendNoContact: 'This lead has no valid email or phone number and requires review.',
} as const;

export type TranslationKey = keyof typeof en;

export const es: Record<TranslationKey, string> = {
  language: 'Idioma',
  automaticLanguage: 'Automático (Twenty)',
  english: 'English',
  spanish: 'Español',
  appName: 'Meta Lead Sync',
  loading: 'Cargando configuración y verificando permisos…',
  accessFailure: 'Error de acceso o conexión: %{reason}',
  unknownNetworkError: 'Error de red desconocido',
  errorPrefix: 'Error: %{reason}',
  actionComplete: 'Acción completada.',
  configSaved: 'Configuración guardada en este workspace.',
  metadataError: 'No se pudieron cargar todos los campos personalizados: %{reason}',
  systemTokenRequired: 'Introduce un System User Token',
  tokenJsonShape: 'Formato esperado: {"PAGE_ID":"PAGE_TOKEN"}',
  systemTokenSaved: 'System User Token validado y almacenado como secreto del workspace.',
  pageTokensSaved: 'Page Tokens validados y guardados; el JSON reemplaza al conjunto anterior.',
  systemTokenRemoved: 'System User Token borrado en este workspace.',
  pageTokensRemoved: 'Page Tokens borrados en este workspace.',
  pagesRefreshed: 'Páginas actualizadas.',
  pageFormsRefreshed: 'Formularios de %{page} actualizados.',
  mappingChangesUnsaved: 'Sustituciones editadas; pulsa Guardar mapeo.',
  invalidReplacementJson: 'JSON de sustituciones inválido',
  queued: 'Trabajo de sincronización encolado. Consulta el historial después de actualizar.',
  queuedHistorical: 'Importación histórica encolada (hasta 90 días).',
  statusRefreshed: 'Estado e historial actualizados.',
  queuedForced: 'Prueba forzada encolada (hasta 25 leads).',
  connectionsTitle: 'Conexión con Meta',
  systemTokenRecommended: 'System User Token (recomendado)',
  tokenStored: '✓ Token guardado',
  tokenMissing: '○ Sin token · Añade uno para conectar con Meta.',
  systemTokenLabel: 'System User Token',
  validateSystemToken: 'Validar con Meta y guardar cifrado',
  deleteToken: 'Eliminar token',
  pageTokensOptional: 'Page Access Tokens (opcional)',
  pageTokensStored: '✓ Tokens adicionales guardados',
  pageTokensMissing: '○ Sin tokens adicionales · Opcional',
  pageTokensJsonLabel: 'JSON: ID de página → token',
  validatePageTokens: 'Validar todas y reemplazar tokens',
  removePageTokens: 'Eliminar Page Tokens',
  webhookUnchanged: 'No se crean suscripciones ni se consulta /subscribed_apps. El webhook existente de Meta permanece intacto.',
  pagesTitle: 'Páginas de Meta',
  pagesDescription: 'Descubre todas las páginas accesibles con tu token y selecciona las que importarán leads.',
  discoverPages: 'Descubrir mis páginas',
  savePages: 'Guardar páginas activas',
  searchPages: 'Buscar páginas',
  searchPagesPlaceholder: 'Nombre o ID…',
  pagesCounter: '%{visible} de %{total} páginas · %{active} activas',
  noPages: 'No hay páginas registradas. Descúbrelas usando las credenciales de Conexiones.',
  noPagesMatch: 'No hay páginas que coincidan.',
  pageIdLabel: 'Page ID: %{id}',
  updateForms: 'Actualizar formularios',
  formsTitle: 'Formularios de captación',
  formsDescription: 'Cada formulario se activa por separado. Los formularios de una misma página pueden tener asignaciones diferentes.',
  saveForms: 'Guardar formularios activos',
  searchForms: 'Buscar formularios',
  searchFormsPlaceholder: 'Nombre, ID o página…',
  formsCounter: '%{visible} de %{total} formularios · %{active} activos',
  noForms: 'No hay formularios. Ve a Páginas y pulsa Actualizar formularios.',
  noFormsMatch: 'No hay formularios que coincidan.',
  formSummary: 'Página: %{page} · ID: %{id} · %{status} · Preguntas: %{count}',
  noFormStatus: 'sin estado',
  updateExisting: 'Actualizar campos de Personas existentes',
  mappingTitle: 'Mapeo de campos por formulario',
  mappingDescription: 'Selecciona un campo de Persona para cada pregunta; los campos personalizados aparecen si la Metadata API permite su lectura.',
  formLabel: 'Formulario',
  noQuestions: 'Meta no ha devuelto las preguntas de este formulario.',
  questionTypeText: 'texto',
  ignoreQuestion: 'No importar esta pregunta',
  customFieldSuffix: ' · personalizado',
  validOptions: 'Opciones válidas: %{options}',
  replacementsLabel: 'Sustituciones (JSON de respuesta de Meta → valor de Twenty)',
  saveMapping: 'Guardar mapeo',
  syncTitle: 'Sincronización e historial',
  syncDescription: 'El cron revisa cada minuto, pero ejecuta un formulario por vez. Los límites de Meta pausan las solicitudes de este workspace.',
  automaticInterval: 'Intervalo automático',
  everyMinutes: 'Cada %{minutes} min',
  saveFrequency: 'Guardar frecuencia',
  quotaPause: 'Meta ha limitado temporalmente las solicitudes. Pausa hasta %{until} (hora local).',
  quotaAdvice: 'No se realizarán peticiones antes de esa hora. Actualiza el estado después.',
  selectSyncFormLabel: 'Formulario para sincronizar',
  selectSyncForm: 'Selecciona un formulario (uno por ejecución)',
  retryReview: 'Reprocesar también entradas NEEDS_REVIEW (tras corregir el mapeo)',
  syncNow: 'Sincronizar ahora',
  syncHistorical: 'Importar histórico (90 días)',
  refreshStatus: 'Actualizar estado',
  forceTest: 'Forzar prueba (máx. 25 leads)',
  statesHeading: 'Estado por formulario · %{count}',
  inProgress: 'En curso',
  noActiveRun: 'Sin trabajo activo',
  lastSuccessAndAttempt: 'Último éxito: %{success} · Último intento: %{attempt}',
  never: 'Nunca',
  noConfiguredForms: 'No hay formularios configurados.',
  auditHeading: 'Auditoría técnica · %{count}',
  auditPeriod: 'Eventos de los últimos 14 días',
  runLabel: 'Run %{id}',
  batchLabel: 'Lote %{batch}',
  noAuditEvents: 'Sin eventos de auditoría todavía.',
  historyHeading: 'Últimas ejecuciones · %{count}',
  historyCompletedAt: 'Finalizado',
  historyForm: 'Formulario',
  historyStatus: 'Estado',
  historyImported: 'Nuevos',
  historyLinked: 'Vinculados',
  historyDuplicates: 'Duplicados',
  historyReview: 'Revisión',
  historyFailed: 'Fallidos',
  historyEmpty: 'Todavía no se ha completado ninguna sincronización.',
  backendNeedsReview: 'Twenty podría haber creado la Persona, pero no se pudo confirmar su ID. Revisión requerida para evitar duplicados.',
  backendRateLimitPrefix: 'Límite de Meta alcanzado. Pausado hasta ',
  backendImportInProgress: 'Otro trabajo está importando este lead; se reintentará.',
  backendPersonMissing: 'Twenty no devolvió el ID de la Persona creada',
  backendNoContact: 'Este lead no tiene email o teléfono válido y requiere revisión.',
};

export const isLanguage = (input: unknown): input is Language => input === 'en' || input === 'es';
export const isLanguageMode = (input: unknown): input is LanguageMode =>
  input === 'auto' || isLanguage(input);

export const translate = (lang: Language, key: TranslationKey, params?: TranslationParams): string => {
  const source = lang === 'es' ? es : en;
  const template = source[key] ?? en[key];
  return params ? template.replace(/%\{(\w+)\}/g, (_, variable: string) => String(params[variable] ?? '')) : template;
};

/**
 * Twenty 2.50 provides the active UI locale via useLocale().
 * The locale is the viewing member's language in the current workspace,
 * which may differ between users. Unsupported locales fall back to English.
 */
export const languageFromTwentyLocale = (locale: unknown): Language =>
  typeof locale === 'string' && /^es(?:[-_]|$)/i.test(locale.trim()) ? 'es' : 'en';

export const resolveLanguage = (twentyLocale: unknown, mode: LanguageMode): Language =>
  mode === 'auto' ? languageFromTwentyLocale(twentyLocale) : mode;

/**
 * A new key intentionally ignores the 0.2.0-beta.1 manual language choice.
 * On upgrade EVERY user starts in auto mode and follows Twenty without
 * needing to clear app storage. Manual overrides remain optional.
 */
export const LANGUAGE_MODE_STORAGE_KEY = 'meta-lead-sync:language-mode:v2';
export const readLanguageMode = (storage: Pick<Storage, 'getItem'>): LanguageMode => {
  try {
    const stored = storage.getItem(LANGUAGE_MODE_STORAGE_KEY);
    return isLanguageMode(stored) ? stored : 'auto';
  } catch {
    return 'auto';
  }
};
export const writeLanguageMode = (storage: Pick<Storage, 'setItem'>, mode: LanguageMode): void => {
  try { storage.setItem(LANGUAGE_MODE_STORAGE_KEY, mode); }
  catch { /* App storage may be unavailable on some hosts. */ }
};

/** Known backend messages are localized without changing persisted error codes or raw data. */
export const translateBackendError = (lang: Language, message: string): string => {
  if (lang === 'es') return message;
  if (message.startsWith('Límite de Meta alcanzado. Pausado hasta ')) {
    return en.backendRateLimitPrefix + message.slice(es.backendRateLimitPrefix.length);
  }
  if (message === es.backendImportInProgress) return en.backendImportInProgress;
  if (message === es.backendPersonMissing) return en.backendPersonMissing;
  if (message === es.backendNeedsReview) return en.backendNeedsReview;
  if (message === es.backendNoContact) return en.backendNoContact;
  return message;
};
