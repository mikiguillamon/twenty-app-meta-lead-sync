# Public release runbook · Meta Lead Sync

## Estado / Status

- El repositorio de GitHub es público y tiene licencia MIT.
- La app privada de pruebas sigue con el nombre `twenty-app-meta-lead-sync-jff` y `private: true`.
- El flujo `.github/workflows/publish.yml` **no publica automáticamente**: únicamente se ejecuta manualmente y exige seleccionar una etiqueta `vX.Y.Z`, escribir `PUBLISH`, pasar la protección del entorno `npm-publication` y superar pruebas, compilación y preflight.
- **Aún no está lista para publicar:** falta elegir una cuenta/organización npm, confirmar nombre y disponibilidad, configurar Trusted Publisher y completar pruebas y revisión de privacidad.

## Paso 1 — Elegir nombre y propietario npm (acción humana)

1. Entra en https://www.npmjs.com/ e inicia sesión. Activa 2FA.
2. Decide si la titularidad será personal (`@mikiguillamon`, solo si corresponde a tu usuario npm real) o una organización npm de Just For Fun que hayas creado y de la que seas propietario.
3. Propuesta de nombre: `@TU_SCOPE/twenty-app-meta-lead-sync`. Comprueba que el scope te pertenece y el nombre está disponible. No asumas que tener el usuario de GitHub implica poseer el mismo scope npm.
4. Conserva los `universalIdentifier` de `src/constants/ids.ts` para todas las entidades. El nombre npm puede cambiar, pero hay que comprobar la coexistencia con la app privada instalada y el proceso de migración (véase Paso 5).
5. **No renombres el paquete por tu cuenta hasta validar la titularidad**. Este repositorio mantiene el nombre privado para que el flujo actual no se rompa.

## Paso 2 — Preparar la versión candidata (código, después de elegir npm)

1. Cambiar `package.json` a un nombre npm estable autorizado, establecer `private: false` y elegir una versión semver nueva y superior a la última beta privada que se haya distribuido.
2. Actualizar el README y el historial; decidir el soporte de versiones de Twenty. Actualmente el rango es `>=2.50.0 <2.51.0`, por tanto la app **no aparecerá** para versiones más nuevas sin QA y ampliación explícita.
3. Revisar la ficha pública, logo y capturas reales, sin datos de personas ni credenciales. Las imágenes del Marketplace son `8:5` (p. ej. 1600×1000) y menores de 10 MB.
4. Mantener la configuración por workspace, los secretos en variables cifradas y el funcionamiento *polling only*.
5. Ejecutar `corepack yarn install --immutable`, `corepack yarn typecheck`, `corepack yarn test`, `corepack yarn build`, `node scripts/release-preflight.mjs --public --tag vVERSION`.
6. El flujo de CI estático no sustituye una integración real con Twenty 2.50. Validar una segunda instancia/workspace limpio y el aislamiento entre workspaces.

## Paso 3 — Preparar npm Trusted Publishing (acción humana)

1. La documentación actual de Twenty recomienda publicar desde GitHub Actions mediante OIDC/provenance. No guardes `NPM_TOKEN` ni pegues secretos en el repositorio.
2. En GitHub: `Settings → Environments`, crea `npm-publication` y configura **Required reviewers** si el plan lo permite; limita la publicación a etiquetas de versión mediante reglas de deployment en el entorno.
3. En npm, accede a las opciones del **paquete definitivo** y configura su **Trusted Publisher**, tipo GitHub Actions. Debe apuntar exactamente al propietario/repositorio `mikiguillamon/twenty-app-meta-lead-sync` y al archivo `publish.yml`. Si npm no permite configurar un trusted publisher antes de crear la primera versión, sigue las instrucciones del servicio para el *bootstrap* del paquete; **no ejecutes una publicación improvisada desde el Mac** sin decidir antes cómo establecer el vínculo de confianza.
4. La publicación verificable requiere repositorio GitHub público y un flujo con `id-token: write` (incluido). En npm se utilizará la versión actual de CLI con soporte OIDC.
5. Protege las etiquetas de release de GitHub y restringe quién puede ejecutar el workflow.

## Paso 4 — Publicación manual, después de autorizarla

1. Fusiona una PR aprobada que cambie el paquete a modo público y termine todos los controles.
2. Crea y sube una etiqueta `vX.Y.Z` exactamente coincidente con `package.json`; usa un commit que haya pasado las comprobaciones.
3. En GitHub `Actions → Publish Twenty app to npm (manual release only) → Run workflow`: **selecciona la etiqueta**, no `main`. Escribe `PUBLISH`.
4. Aprueba el entorno `npm-publication` si está protegido. Las comprobaciones fallan si la etiqueta no coincide, el paquete sigue privado o conserva `-jff`.
5. Verifica en npm la versión publicada, la declaración de provenance y los metadatos. Un paquete publicado no puede sobrescribirse con la misma versión.
6. Twenty sincroniza el catálogo npm generalmente cada hora. También puedes solicitar `yarn twenty dev:catalog-sync --remote <remote>` donde esté disponible.

## Paso 5 — Registro en Twenty, propiedad e instalaciones

1. En el workspace que será propietario: `Settings → Developers → Apps → Claim an application`; busca el nombre npm exacto o el UUID de aplicación. Reclama con la cuenta propietaria del repositorio GitHub y comprueba la procedencia.
2. **No desinstales la beta privada actual** para hacer la reclamación. Mantener UUIDs significa que existe una única identidad de aplicación por instancia; evalúa primero la posible colisión de registro entre la beta subida por tarball y el catálogo npm. Haz la primera prueba pública en una instancia limpia de Twenty 2.50, **no** en tu JFF de producción.
3. Comprueba permisos, separación de workspace, token propio, páginas, formularios, mapeo, deduplicación, sincronización y auditoría. No uses datos reales en la instalación limpia.
4. Comprueba el Marketplace con el filtro `Vetted only` desactivado. Una app comunitaria no está necesariamente auditada por Twenty.
5. Solo después de resolver la migración del registro privado, plantea su actualización en tu instancia JFF.

## Paso 6 — Privacidad y datos existentes

- La beta nueva ya evita guardar respuestas `field_data` de Meta en el ledger al procesar nuevas importaciones; **las filas históricas aún pueden tener el campo `answers` rellenado**. No borres el ledger: su clave `leadgenId` mantiene la deduplicación.
- Preparar una limpieza explícita de `answers` **solo después de backup, evaluación de alcance y autorización**, conservando IDs, estatus, vínculo con Personas y cursores.
- Confirmar cómo se aplica el derecho de supresión y el comportamiento al desinstalar; documentar responsabilidades de cada administrador de workspace y un periodo de retención razonable.
- La auditoría por ejecución tiene límites de 14 días y 60 eventos por run, pero los registros `PROCESSED` deben conservar su identidad para deduplicar. No imponer una caducidad destructiva que genere duplicados.

## Enlaces oficiales

- https://docs.twenty.com/developers/extend/apps/operations/publishing
- https://docs.twenty.com/developers/extend/apps/config/application
- https://docs.npmjs.com/trusted-publishers
