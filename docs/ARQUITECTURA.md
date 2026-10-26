# Arquitectura implantada: Meta Lead Sync para Twenty 2.50.0

## Principios

La misma app de Twenty puede registrarse en el servidor y **instalarse en cada workspace de forma independiente**. Ninguna credencial, cursor, configuración o ledger se comparte. No se utiliza n8n, Lambda externo ni suscripción a webhooks: las funciones y colas son **nativas del SDK de Twenty**.

## Persistencia

| Dato | Tecnología | Aislamiento |
|---|---|---|
| System User Token | `applicationVariables.META_SYSTEM_USER_TOKEN`, secreto | Workspace |
| Page Access Tokens explícitos | `applicationVariables.META_PAGE_TOKENS_JSON`, secreto | Workspace |
| Páginas, formularios, intervalos, mapeos | `kv` → `meta-lead-sync:config:v1` | Workspace |
| Estado de cada formulario | `kv` → `meta-lead-sync:state:<formId>` | Workspace |
| Sesión/continuaciones paginadas | `kv` → `meta-lead-sync:run:<runId>` | Workspace |
| Historial (máximo 50/formulario) | `kv` → `meta-lead-sync:history:v1:<formId>` | Workspace |
| Identificadores de leads y resultados | objeto `metaSyncSubmission`, índice único `leadgenId` | Workspace |

**Importante:** el ledger contiene respuestas originales potencialmente personales. Se declara `MetadataReadability.APPLICATION` y `MetadataWritability.APPLICATION` para que solo el rol de la aplicación lo pueda leer/escribir; **no se presenta en la navegación de usuario**. El historial accesible en el panel muestra únicamente contadores/errores saneados.

## Componentes

- `application-config`: identidad y dos variables secretas del workspace.
- `default-role`: acceso read/write a Persona y al objeto técnico, más permisos de metadatos/aplicaciones.
- `meta-submission.object` y `meta-submission-unique.index`: deduplicación persistente por Leadgen ID.
- Cinco `settings-menu-items` y sus `front-components`: Conexión, Páginas, Formularios, Mapeo, Sincronización.
- Ocho `logic-functions`: GET estado, POST validar token, descubrir páginas, descubrir formularios, guardar configuración, ejecución manual; un CRON por minuto; un job paginado por formulario.
- `lib/meta/graph`: cliente Graph API que envía Bearer en la cabecera, nunca tokens en URL, y usa cursores propios para paginar.
- `lib/mapping/person`: mapea pregunta → Person, validando tipo, opciones y campos que existen.
- `lib/twenty/api`: acceso REST a Persona/ledger como aplicación, con consultas por email y teléfono.
- `lib/sync/runner`: ejecuta un máximo de 25 leads por trabajo de página, reencolando la siguiente con retraso de 12 segundos; realiza checkpoint por lead dentro de esa página.

## Ciclo de una sincronización

1. El CRON comprueba cada minuto qué formularios habilitados han alcanzado su intervalo configurable, por defecto **5 minutos**.
2. Encola una sesión por formulario con un rango de consulta: hasta 90 días desde el primer inicio, o desde el último éxito con **5 minutos de solapamiento**. La sesión es exclusiva del workspace.
3. El job resuelve el Page Token directo o temporalmente mediante System User Token y `/me/accounts`; **no guarda el token temporal**.
4. Obtiene hasta 25 leads de `/<formId>/leads` con filtro de tiempo y cursor `after`.
5. Antes de crear cualquier Persona, reclama un registro ledger con `leadgenId` único. Valida los mapeos, localiza Persona por email/teléfono y crea o vincula (actualización opcional).
6. Guarda el resultado por lead en un checkpoint KV de esa página para no contarlo dos veces si se reintenta. Al terminar la página consolida contadores y encola la siguiente con ID estable.
7. Solo al terminar **todas** las páginas se mueve `lastSuccessAt`. Errores de Graph API transitorios (`429`/`5xx`) piden reintentos con `RetryableLogicFunctionError`. Un fallo final registra evento `FAILED` sin avanzar la marca de éxito.

## Límites explícitos de esta beta

- Máximo de **400 páginas × 25 leads** por ejecución, para impedir bucles/ejecuciones descontroladas. Al superar este límite se registra fallo sin avanzar cursor; después se debe dividir la recuperación.
- La marca persistente entre ejecuciones es temporal (`lastSuccessAt`), no el cursor opaco de Graph. Se vuelve a consultar el rango tras un fallo y el ledger evita duplicar envíos procesados.
- La deduplicación estricta es por `leadgenId` en el ledger. Una caída después de **crear la Persona pero antes de enlazar el ID** requiere recuperar por email/teléfono; no se ofrece una garantía transaccional absoluta sobre la creación de Persona. **No publicar en marketplace** sin reforzar esta reconciliación e introducir pruebas de caos.
- Requiere comprobar en el workspace real la representación de `EMAILS`, `PHONES`, campos personalizados y la disponibilidad de permisos. Las pruebas simuladas no reemplazan esa comprobación.
- No hay auto-borrado de respuestas ni consola de supresión RGPD. Requiere política de privacidad, retención, eliminación y un proceso de soporte antes de producción multicliente.
- La interfaz usa front components, que en Twenty 2.50 aún están en evolución: probar funcionamiento real después de la instalación.

## Seguridad

Los endpoints de administrador tienen `isAuthRequired: true` y vuelven a comprobar autorización con un cliente `MetadataApiClient` asociado al usuario que solicitó el cambio. Los jobs operan con el rol de la aplicación dentro del workspace. Los secretos nunca entran en `kv`, formularios, ledger ni Git; las respuestas HTTP no los muestran. Se redactan secretos, URLs, emails y teléfonos de errores operativos. **No** se llama a `/subscribed_apps` ni se crea un webhook nuevo.
