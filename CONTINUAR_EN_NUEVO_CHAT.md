> ARCHIVO HISTÓRICO. Describe el estado anterior a la implementación. Desde la entrega del 26/10/2026 ya existen `src/`, `tests/` y `package.json`. Consulta `README.md` y `docs/QA_RESULTADOS.md` para el estado actual.

# Continuidad completa del proyecto: Meta Lead Sync for Twenty

**Fecha de traspaso:** 26 de octubre de 2026  
**Proyecto:** `twenty-app-meta-lead-sync`  
**Usuario/empresa:** Just For Fun 360, S.L.  
**OBJETIVO INMEDIATO:** Escribir el código real y entregar un ZIP de repositorio que el usuario pueda subir a GitHub. A continuación, guiar la instalación privada en un único workspace de Twenty y, tras las pruebas, preparar publicación en el marketplace.

> ADVERTENCIA IMPORTANTE: Este directorio contiene por ahora documentación de especificación, pero **no contiene código ejecutable, `package.json`, `src/` ni un ZIP funcional de la app**. Mensajes anteriores dieron por escrito el núcleo, pero la inspección del sistema de archivos confirmó que NO se llegó a guardar. La siguiente conversación debe implementar y probar el código; no afirmar que ya está hecho. El ZIP de continuidad es documentación, no la aplicación final.

## 1. Situación de la plataforma

- CRM instalado: Twenty **2.50.0**, self-hosted en Coolify Main Server.
- Repositorio de infraestructura existente: `mikiguillamon/infra-twenty-crm` (no modificar `docker-compose.coolify.yml` sin necesidad).
- URL del workspace piloto: `https://jff.leads.justforfun.es`.
- URL general Twenty: `https://app.leads.justforfun.es` / instancia alojada en `leads.justforfun.es` según la configuración actual; usar la URL real que responda.
- Identificador de la aplicación en Coolify: `xgoim3ghukiptv70rflqk5g4`.
- Twenty usa workers existentes y funciones locales (`LOGIC_FUNCTION_TYPE=LOCAL`, `CODE_INTERPRETER_TYPE=DISABLED`); no se quiere desplegar otro servicio para el conector.
- Multi-workspace habilitado. Hay un workspace de prueba Just For Fun; en el futuro cada cliente tendrá su propio workspace.
- La aplicación **se instalará y configurará en cada workspace por separado**, nunca mediante un panel de configuración central. Puede tener múltiples páginas y múltiples formularios de Meta en un solo workspace.
- El usuario quiere la UX amigable de Frappe CRM para elegir páginas, formularios y mapear preguntas a campos CRM.

## 2. Investigaciones y pruebas de autenticación Meta confirmadas

- El usuario tiene una Meta App reutilizada por varias integraciones y un **System User Token persistente** que usa satisfactoriamente en Frappe; no quiere renovaciones manuales de Page Token.
- **No tocar ni reemplazar el webhook actual** de la Meta App, ni pulsar «Connect» de AppUnite porque puede cambiar suscripciones o callback globales.
- Se verificó que el token introducido en AppUnite era EXACTAMENTE el que funciona en Frappe (longitud 208, SHA-256 igual, sin espacios).
- El servidor Twenty llama correctamente a Graph API v25.0 con ese token: `GET /{pageId}?fields=id,name` devuelve HTTP 200.
- El mismo System User Token falla en `GET /{pageId}/subscribed_apps`: Meta error `190`, subcode `2069032` y `Invalid OAuth 2.0 Access Token`.
- Falla en `GET /{pageId}/leadgen_forms`: Meta error `190`, mensaje `This method must be called with a Page Access Token`.
- El usuario confirmó que `GET /me/accounts?fields=id,name,access_token` con su **System User Token** devuelve su página y **un Page Access Token**.
- El código de Frappe CRM v1.85.0 hace exactamente esto: obtiene páginas por `/me/accounts`, utiliza `page["access_token"]` para consultar `/{pageId}/leadgen_forms` y mantiene mapeos de preguntas por formulario. Código: `https://github.com/frappe/crm/blob/v1.85.0/crm/lead_syncing/doctype/lead_sync_source/facebook.py`.
- Una implementación propia puede mantener **solo System User Token en variables secretas**, resolver por ejecución el Page Access Token de cada página de `/me/accounts`, y usarlo para endpoints que lo exigen. Opcionalmente permitir Page Token directo si el workspace prefiere ese modo.
- **No compartir tokens ni secretos entre workspaces**. La variable secreta es `WORKSPACE`, jamás `SERVER`.
- Meta Graph API puede tener restricciones por permisos y acceso Business Leads; gestionar errores y validación claramente.

## 3. Problemas de AppUnite y motivos del nuevo desarrollo

- AppUnite `appunite/meta-for-twenty-crm`, npm `@appunite/meta-leads-for-twenty` v1.1.0, licencia MIT; objetivo de comparativa, **no depender de ella**.
- Su configuración dice aceptar System User Token, pero utiliza el mismo token para consultar página, `subscribed_apps` y `leadgen_forms`; no resuelve automáticamente Page Token.
- Cron de conciliación cada hora: `0 * * * *`. El usuario exige cinco minutos por defecto, idealmente configurable hasta un minuto.
- Tiene un campo `fieldMapping` en Meta Lead Forms, pero no se comprobó un mapeo dinámico completo y funcional comparable a Frappe.
- El usuario probó Page Token directamente, pero la UX sigue siendo mala y aparecieron errores rojos al usar «Importar» en listas de objetos.
- Se confirmó que el botón «Importar» en la tabla de Twenty ejecuta su importador genérico CSV/Excel, **no** la importación desde Meta. `indexFieldMetadatas.map` corresponde al importador genérico de Twenty; aparece al tratar objetos de la app. También aparece `No Listener: tabs:outgoing.message.ready`; causa final no verificada. Los errores de la plataforma requieren auditoría separada, no confundirlos con fallos del nuevo integrador.
- No instalar AppUnite de nuevo; puede coexistir para pruebas, pero no mutar sus registros ni mezclar objetos. Nuevos objetos con nombres propios diferentes.

## 4. Requisitos funcionales aprobados

1. Una app nativa de Twenty distribuible por npm / Marketplace (`keywords: ["twenty-app"]`), instalable primero **en privado**.
2. Toda la configuración aislada por workspace, sin panel central. Una instalación puede gestionar muchas páginas y formularios de Meta.
3. Conexión Meta: System User Token (recomendado) o Page Access Token; comprobaciones claras, sin errores engañosos.
4. Página de «Conexiones»/«Páginas»: descubrir páginas accesibles mediante Graph API, seleccionar varias.
5. Pestaña «Formularios»: descubrir formularios y preguntas de cada página, activar/desactivar individualmente.
6. **Mapeo visual por formulario**, con selector de campos estándar y personalizados de Twenty. Primero soportar Persona; extensible a Oportunidad, Empresa, objetos personalizados más adelante. Respetar tipos (emails, teléfonos, nombre compuesto, texto, numerico, fecha, select, boolean, etc.). Mostrar errores y transformaciones.
7. **Polling automático nativo** cada 5 minutos por defecto (configurable 1/2/5/10/15/30/60), independiente por workspace y sin depender de n8n, Zapier, Activepieces, etc. No modificar webhook de Meta.
8. Importación manual «Sincronizar ahora», histórico de Meta hasta 90 días, cursores incrementales por formulario, paginación completa, ventana de solapamiento, reintentos.
9. Deduplicación/idempotencia por `leadgen_id` (índice único), enlazar Persona existente por email o teléfono y no duplicar ante reintentos; manejar carreras de trabajos.
10. Panel de histórico de sincronizaciones: last sync, cantidad importados, duplicados, fallidos, razones, reintentos y logs sin exponer secretos.
11. Buen aislamiento y seguridad: secretos cifrados en variables Twenty, metadatos propios del workspace, permisos mínimos, no imprimir datos personales innecesarios.
12. Preparar código, pruebas, CI básico, `README`, licencia, docs de instalación, releases/versionado, y ZIP para subir a GitHub. No publicar en npm hasta probar privado.

## 5. Capacidades SDK Twenty 2.50 verificadas

- `defineApplication` + `applicationVariables` cifradas (`isSecret:true`, `scope: WORKSPACE` por defecto). Los front components no reciben valores secretos; las logic functions reciben `process.env.META_SYSTEM_USER_TOKEN`.
- `defineSettingsMenuItem` + `defineFrontComponent` de React crean pestañas personalizadas en `Settings > Apps`; una pestaña por función: Conexiones, Páginas, Formularios, Mapeo, Sincronización e Historial.
- `RestApiClient` (`twenty-client-sdk/rest`) llama a `/s/<route>` de funciones y endpoints `/rest/...`.
- `MetadataApiClient().mutation({ updateOneApplicationVariable: ... })` permite que la interfaz escriba valores secretos declarados; la lectura devuelve valores mascarados. El rol de app y persona requiere `SystemPermissionFlag.APPLICATIONS`.
- `defineLogicFunction` admite `cronTriggerSettings: { pattern:'* * * * *' }`; el motor servidor evalúa cron por minuto. Ejemplo oficial `companion` `*/5 * * * *`.
- `kv` de `twenty-sdk/logic-function` en ámbito por defecto `WORKSPACE` persiste cursores y configuraciones no secretas. **No** guardar tokens en `kv` porque JSON no va cifrado a nivel aplicación.
- `defineObject`, `defineIndex` con `isUnique: true` para ledger Meta Submission. `MetadataWritability.APPLICATION` puede prohibir a miembros que creen/modifiquen registros técnicos de forma directa.
- Para metadatos de campos usar API REST `GET /metadata/objects` y `/metadata/fields`, protegido por `SystemPermissionFlag.DATA_MODEL`. Cuidado: distintas versiones/formato pueden responder `body.data.fields`, `body.data` o array según flag; implementar normalización robusta.
- Las tareas largas deben encolarse en lotes (con `enqueueJobs`), no sincronizar cientos de leads en una función enorme. `RetryableLogicFunctionError` para fallos transitorios. API de Twenty impone 500 requests/min por registro de aplicación, compartido entre workspaces; escalonar trabajo.
- CLI: Node `^24.5.0`, Yarn 4/Corepack, `twenty-sdk` y `twenty-client-sdk` versión **2.50.0**; `twenty-ui` 2.50.0, dependencias de desarrollo. `yarn twenty dev:build` para compilar manifest, `yarn twenty remote:add --url https://jff.leads.justforfun.es --as jff` (validar URL base real), y `yarn twenty app:publish --private --remote jff` para despliegue privado. Publicación npm posteriormente, `engines.twenty >=2.50.0 <3` sujeto a comprobación en otras versiones.
- Referencias: `https://github.com/twentyhq/twenty/tree/twenty/v2.50.0/packages/twenty-docs/developers/extend/apps/` (fuentes SDK); `https://github.com/twentyhq/twenty/blob/twenty/v2.50.0/packages/twenty-apps/public/companion/src/logic-functions/reconcileDesktopRecordings.ts`.

## 6. Diseño técnico acordado

- `src/application-config.ts`: identidad, secretos `META_SYSTEM_USER_TOKEN` y opcional `META_PAGE_TOKENS_JSON`, roles y configuración.
- `src/roles/default-role.ts`: permisos app y objetos mínimos.
- `src/front-components/`: panel React estilo Frappe.
- `src/settings-menu-items/`: navegación de ajustes.
- `src/logic-functions/`: rutas autenticadas de descubrimiento, guardado, dashboard, sincronización manual y cron; handlers de paginación en cola.
- `src/lib/meta/`: cliente Graph API que resuelve Page Token desde `/me/accounts`.
- `src/lib/twenty/`: lectura de metadatos, coerción y escritura de Personas.
- `src/lib/mapping/`: validación y transformación tipada por pregunta.
- `src/objects/` y `src/indexes/`: Meta Submission con unicidad por leadgenId, fallos y datos de origen.
- `tests/`: pruebas sobre mapping, Graph client con mock, cursor/paginación, seguridad por workspace, dedupe.
- CI GitHub Actions, LICENSE, README, documentación de instalación y marketplace.
- Lo ideal es que **el primer ZIP sea fuente completa compilable**, se pruebe `yarn install`, typecheck/tests y build; declarar cualquier paso que no pueda verificarse por ausencia de credenciales/servidor de prueba.

## 7. Archivos existentes en este paquete de continuidad

- `README.md`: descripción y diseño objetivo.
- `AGENTS.md`: pautas de desarrollo.
- `CHANGELOG.md`: historial iniciado.
- `docs/ARQUITECTURA.md`: organización técnica y decisiones.
- `docs/INSTALACION.md`: pasos previstos.
- `docs/MARKETPLACE.md`: publicación futura.
- `docs/QA.md`: criterios de aceptación.

Se inspeccionó el filesystem el 26/10/2026. **NO están `src/`, `tests/`, `package.json` ni un ZIP instalable de la aplicación.** Documentos pueden describir características en futuro/perfecto: no confundir con implementaciones ya creadas. Hay que corregir README conforme avance el código.

## 8. Instrucciones exactas para la próxima conversación

- Lee TODOS los documentos adjuntos, especialmente este fichero, `README.md`, `docs/ARQUITECTURA.md`, `docs/INSTALACION.md`, `docs/QA.md`.
- No repitas la investigación general ni vuelvas a proponer n8n, Frappe, AppUnite o otro SaaS.
- **IMPLEMENTA EL CODIGO COMPLETO REAL** de la aplicación nativa, con una beta honesta para Twenty 2.50, y empaqueta `twenty-app-meta-lead-sync.zip` para subir a GitHub.
- Comienza comprobando SDK/CLI v2.50 y genera código con definiciones reales, no placeholders que no hacen nada.
- Ejecuta pruebas y compilación según disponibilidad del entorno; reporta fallos honestamente. Si no puede validarse contra instancia real, deja claro qué queda para primera prueba.
- No modifiques ni accedas a credenciales de Meta del usuario; se introducirán luego en Twenty.
- No modifiques despliegues de producción de Coolify ni el webhook de Meta en esta fase.
- Después de entregar ZIP, guía paso a paso el alta del nuevo repositorio GitHub y despliegue privado en workspace `jff` antes de marketplace.
