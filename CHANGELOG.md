# Changelog

## 0.2.0-beta.8 — 2026-11-03 (candidate; unpublished)

- Replace manual PUBLISH workflow and optional npm-publication GitHub Environment with GitHub Release published trigger.
- Validate Release tag, prerelease setting, commit ancestry, package version and build before publishing via npm OIDC.
- The previous beta.7 GitHub Actions attempt failed before publishing; beta.7 is not reused.
- No changes to Meta polling, tokens, mapping, deduplication or Twenty application IDs.

## 0.2.0-beta.7 — 2026-11-03 (candidate, not yet published)

- Prepare first GitHub Actions release using npm Trusted Publishing and automatic provenance after the 0.2.0-beta.6 manual bootstrap.
- Release metadata only; unchanged Twenty app universal identifiers, Meta logic, credentials, forms, mapping and deduplication.
- Subsequent publication requires npm trusted publisher configured to GitHub workflow publish.yml with environment npm-publication.

## 0.2.0-beta.6 — 2026-11-03

- Prepare first npm public beta candidate (not yet published); version and release permissions updated without modifying Twenty's universal identifiers.
- Separate npm `beta` and `latest` dist-tags in the guarded GitHub Actions release workflow.
- Add first-publication procedure and require inspection of the built tarball before an irreversible publish.

## 0.2.0-beta.5 — 2026-11-03

- Rename the npm package and GitHub references to `twenty-meta-lead-sync`, keeping the app private and all Twenty universal identifiers untouched.
- Update Yarn workspace lockfile, release guards, documentation and marketplace metadata for renamed repository.
- No public npm publishing or changes to Meta credentials and synchronization behavior.

## 0.2.0-beta.4 — 2026-11-03

- Prepare release preflight checks and tests; public publishing remains blocked while the private package name and ownership are unresolved.
- Add a manually triggered, environment-protected npm OIDC/provenance workflow; no automatic publication and no npm secrets.
- Add source repository and issue-report metadata and clarify marketplace application-variable labels.
- Add a release runbook covering ownership, first publication, private-tarball migration, QA and historical lead privacy.

## 0.2.0-beta.3 — 2026-10-27

- Use Twenty 2.50 `useLocale()` to automatically follow the active workspace UI language (Spanish or English), including live changes.
- Default to **Automatic (Twenty)** even for users of the prior beta; manual EN/ES overrides remain possible via a new storage key.
- Unsupported Twenty locales fall back to English; no backend, credentials, or deduplication changes.

## 0.2.0-beta.2 — 2026-10-27

- Privacy hardening: stop storing Meta lead field_data in the deduplication ledger on new imports or reprocessing. Historical rows are retained pending an explicitly authorized cleanup.
- Add regression coverage ensuring no Meta answers are copied to the ledger.
- Public release preparation only; no npm publish or production configuration changes.

## 0.2.0-beta.1 — 2026-10-27

- Interfaz de configuración en inglés/español con selector por usuario y persistencia local aislada.
- Catálogo tipado de traducciones y cobertura de errores conocidos, fechas y estados.
- Títulos de menú estáticos en inglés: limitación de Twenty 2.50.
- No altera identificadores internos, tokens, configuración por workspace ni lógica de sincronización.
- Preparación de distribución pública sin publicar todavía en npm ni cambiar la identidad del paquete privado.

## 0.1.9 — 2026-10-27

- «Buscar formularios» pasa a «Actualizar formularios» para distinguir el descubrimiento en Meta de la búsqueda local.
- Separación entre guardar y el primer bloque de formularios.
- Eliminados textos redundantes de actualización de Personas y credenciales.

## 0.1.8 — 2026-10-27

- Búsqueda por nombre e identificador en páginas y formularios, contadores de elementos activos y visibles.
- Indicadores de credenciales guardadas más claros en Conexiones y textos redundantes eliminados.
- Fuerza de prueba visible solo cuando existe pausa de Meta; el servidor exige también que esa pausa esté activa. Se mantiene el límite de 25 leads y sin histórico.
- Paneles de estado, auditoría e historial plegables, con scroll interno limitado.
- Sin cambios en el sistema de deduplicación ni credenciales.

## 0.1.7 — 2026-10-27

- La sincronización comprueba si la Persona vinculada a un ledger PROCESSED sigue existiendo (GET /rest/people/:id).
- Si Twenty confirma su ausencia (404/410), reutiliza el ledger original y vuelve a importar el lead, sin borrar el índice de deduplicación.
- Las Personas existentes siguen deduplicadas; errores de permisos o red no se confunden con registros borrados.
- Si el ledger histórico no contiene un ID de Persona, se mantiene protegido para evitar creaciones ambiguas.
- Resincronizar histórico requiere seleccionar la importación histórica de 90 días; el reset de Personas no modifica el cursor.
- Pruebas de reconstrucción tras eliminación, deduplicación posterior y protección de ledger sin ID.

## 0.1.6 — 2026-10-27

- Recuperar el identificador de Persona creada aunque Twenty devuelva un envelope REST diferente o una respuesta sin ID; búsqueda posterior por email/teléfono.
- Ante resultado ambiguo, dejar el ledger en NEEDS_REVIEW y evitar un segundo POST automático.
- Regresión de importación idempotente y creación sin ID en respuesta.

## 0.1.5 — 2026-10-27

- Auditoría técnica por ejecución (runId/formId, estado, páginas, contadores, códigos HTTP/Meta), sin credenciales ni payloads.
- Vista y JSON seleccionable para investigar errores. Máximo 60 eventos por ejecución y 200 eventos por consulta; solo eventos de los últimos 14 días.
- Opción manual con confirmación que omite una sola vez la pausa local, limitada a una página de 25 leads y sin importar histórico; no evita los límites de Meta ni fuerza reintentos.
- No altera webhooks, acceso a tokens ni identidades del ledger.

## 0.1.4 — 2026-10-27

- Evita consultar /me/accounts por cada lote de 25 leads al usar System User Token; fallback de Page Token solo ante errores concretos de permisos.
- Muestra cooldown activo en hora local y desactiva botones de importación durante la pausa.
- Test de integración verifica que la sincronización directa no enumera las páginas.

## 0.1.3 — 2026-10-27

- Protección de cuota de Meta: pausa global por workspace ante error 4/613/429, respetando `Retry-After` y señales `X-App-Usage` / `X-Business-Use-Case-Usage`.
- Un formulario automático a la vez; selección individual obligatoria para sincronizaciones manuales.
- Primera sincronización ordinaria limitada a 24 horas (histórico de 90 días sigue siendo una acción explícita).
- No avanza cursores en errores de cuota ni almacena tokens; muestra pausa en los estados.
- Pruebas de cuota y rango temporal ampliadas.

## 0.1.2 — 2026-10-26

- Evita falsos conflictos de concurrencia al crear el ledger de deduplicación: una respuesta HTTP 2xx confirma la creación aunque el cuerpo REST no contenga el ID en el formato esperado.
- La lectura posterior por leadgenId se mantiene para obtener el registro y su ID, y la restricción única sigue protegiendo contra carreras reales.
- Añade una prueba de integración con respuesta mínima de Twenty y verificación de deduplicación tras el primer import.
- Cambio de bajo alcance; no altera credenciales, Meta Graph, webhooks ni registros existentes.

## 0.1.1 — 2026-10-26

- Ajustado el panel de administración a los temas claro y oscuro de Twenty mediante `useColorScheme()`.
- Paleta con contraste AA para textos, campos, botones y avisos; tarjetas, selects, checkboxes y tablas de cinco pestañas.
- Dos tests de contraste de color; sin cambios en integraciones Meta, estado ni permisos.
- Pendiente comprobar ambas apariencias visualmente en el workspace real.

## 0.1.0 — 2026-10-26

- Primera implementación **real** de la app nativa para Twenty 2.50.0, partiendo de la documentación de continuidad.
- Variables secretas per-workspace (System User Token y Page Tokens directos).
- UI nativa con cinco pestañas: Conexión, Páginas, Formularios, Mapeo, Sincronización.
- Descubrimiento de páginas/formularios; mapeo a campos de Persona predefinidos/personalizados; importación mediante polling de 1–60 minutos, valor por defecto 5.
- Jobs nativos, paginación, reintentos de Meta, checkpoint por lote, historial por formulario y ledger con índice único.
- Pruebas locales: 17 casos incluyendo integración REST/Meta simulada y control de duplicados; análisis sintáctico de 34 archivos TypeScript.
- Documentación de publicación privada, restricciones, informe QA, GitHub Actions.

**Beta no validada con una instalación o tokens reales.** Revisa `docs/QA_RESULTADOS.md`.
