# Meta Lead Sync for Twenty

Aplicación **nativa de Twenty CRM** para importar formularios de Meta Lead Ads (Facebook/Instagram) directamente en **Personas**, sin n8n, Zapier, Activepieces ni un servicio adicional.

**Autor:** Just For Fun 360, S.L. · **Licencia:** MIT · **Objetivo de compatibilidad:** Twenty 2.50.x · **Estado:** beta técnica 0.1.0 (para probar en un workspace de ensayo, todavía no publicar en el marketplace).

> **Importante:** Se han ejecutado 17 pruebas automatizadas locales y verificado la sintaxis del código, pero **no** ha podido ejecutarse `yarn install`, `yarn typecheck` con SDK real ni `twenty dev:build`: el entorno de creación no tiene red a npm. Tampoco se ha instalado en tu Twenty ni probado con leads reales. Revisa [el informe de QA](docs/QA_RESULTADOS.md) antes de cualquier instalación.

## Funciones incluidas

- **Configuración separada por workspace:** tokens y formularios nunca compartidos entre clientes; los secretos residen en variables cifradas de la instalación.
- **Tokens Meta:** System User Token (descubre el Page Access Token mediante `/me/accounts`) o Page Access Token para una página concreta; combinación de ambos.
- **Múltiples páginas y formularios por workspace:** descubrir páginas, descubrir sus formularios, activar/desactivar individualmente.
- **Mapeo por formulario:** cada pregunta del formulario se asigna a un campo de Persona, estándar o personalizado, con transformación de texto, número, booleano, fecha y tabla de sustitución para valores de select.
- **Polling integrado:** cada 1, 2, 5 (por defecto), 10, 15, 30 o 60 minutos; no modifica ni registra el webhook existente de Meta.
- **Importación inmediata e histórica:** botones en la interfaz para lanzar una sincronización ahora o importar leads de hasta 90 días.
- **Paginación y recuperación:** una página por trabajo, checkpoint de lote y último éxito temporal por formulario, margen de solapamiento de cinco minutos, reintentos de Meta y registros de estado.
- **Deduplicación:** objeto `Meta Submissions` con índice único por `leadgenId`; búsqueda de Persona existente por email y, después, teléfono.
- **Sin sobrescrituras por defecto:** si encuentra una Persona existente, únicamente vincula la entrega; actualizar sus campos requiere activar la opción.
- **Historial y errores:** eventos recientes en el panel y objeto de Twenty para auditar envíos.

## Datos y seguridad

- La configuración no secreta se guarda en `kv` con ámbito `WORKSPACE`, dentro de la base de datos del propio Twenty.
- Los tokens secretos se guardan exclusivamente en variables de aplicación cifradas por Twenty. No se escriben en objetos ni en `kv`.
- La app pide permisos de lectura/escritura sobre **Personas** y `Meta Submissions`, y permisos `APPLICATIONS` y `DATA_MODEL`. Este último es necesario para leer metadatos de campos personalizados con la API REST de Twenty 2.50. Revisa estos permisos antes de instalar en clientes.
- No se hace ninguna petición de suscripción a Meta ni se cambia la URL del webhook ya configurado.
- Los datos de respuestas de los formularios pueden ser personales. Aplica políticas de acceso, retención y supresión pertinentes antes de usarlo en producción.

## Ejemplo de flujo

1. Instalas la aplicación privada en el workspace `jff.leads.justforfun.es`.
2. En **Ajustes → Aplicaciones → Meta Lead Sync**, pegas tu **System User Token**.
3. Pulsa **Descubrir mis páginas**, activa las deseadas y guarda.
4. Pulsa **Buscar formularios** para cada página, activa los formularios deseados y guarda.
5. En **Mapeo**, asigna las preguntas al campo de Persona correspondiente, incluidos campos personalizados.
6. En **Sincronización**, selecciona `5 min`, guarda y pulsa **Sincronizar ahora** o **Importar histórico**.
7. Consulta **Historial** para ver éxitos/errores y revisa la Persona vinculada. El ledger interno **no se muestra en la navegación de usuarios** para proteger las respuestas personales.

## Primeros pasos

[**Instrucciones detalladas para instalar la beta en un workspace privado**](docs/INSTALACION.md)

```bash
# Desde la carpeta del proyecto, una vez instalado Node.js 24 y Yarn 4:
corepack enable
yarn install
yarn typecheck
yarn test
# Vincular el CLI al workspace desde tu Mac (no aquí en GitHub Actions):
yarn twenty remote:add --url https://jff.leads.justforfun.es --as jff
# Producir la app compilada:
yarn build
# Publicarla solo en TU servidor, de forma privada:
yarn twenty app:publish --private --remote jff
```

No hagas `npm publish` aún. La versión privada permite probar y actualizar la app sin colocarla en el marketplace.

## Estructura

```text
src/application-config.ts           Variables secretas y registro de la app
src/roles/default-role.ts           Permisos de la aplicación
src/objects/                       Registro de envíos Meta
src/indexes/                       Unicidad por leadgenId
src/front-components/              Interfaz de administración React
src/settings-menu-items/           Pestaña propia en ajustes
src/logic-functions/               Endpoints internos y cron de 1 minuto
src/lib/                           Meta Graph API, mapeo, estado, acceso Twenty
tests/                            Unitarias e integración in-memory con stubs de Twenty
docs/                             Instalación, arquitectura y checklist
```

## Estado y riesgos conocidos

Esta beta implementa el circuito principal de importación, pero necesita validación en tu servidor: instalación real, tipos de campos compuestos y específicos, paginación de Meta con formularios grandes, permisos y volumen. Los errores de JavaScript de Twenty al utilizar su importador genérico CSV no forman parte de este integrador y deben revisarse aparte.

Limitaciones intencionadas de la beta:

- Mapea a **campos de Persona**, no crea todavía Oportunidades o Empresas automáticamente (se puede ampliar).
- El panel puede mostrar únicamente los campos estándar si Twenty deniega la consulta de metadatos; se ha incluido el permiso `DATA_MODEL` para evitarlo.
- Personas sin email ni teléfono quedan registradas como `NEEDS_REVIEW` y no generan automáticamente una Persona para evitar falsos duplicados.
- La sincronización principal es **polling**, no recepción por webhook; esto respeta el webhook preexistente de Meta.
- En instalaciones con muchísimos clientes habrá que comprobar los límites y distribuir las tareas para evitar `429`.
- La beta no incluye una política automática de borrado de respuestas personales. Debe añadirse antes de ofrecerla de forma general.

[Arquitectura y decisiones](docs/ARQUITECTURA.md) · [Pruebas de aceptación](docs/QA.md) · [Publicación futura en marketplace](docs/MARKETPLACE.md)

[**Informe exacto de verificaciones locales y pruebas pendientes**](docs/QA_RESULTADOS.md)
