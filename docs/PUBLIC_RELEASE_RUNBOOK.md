# Public release runbook · Meta Lead Sync

## Estado / Status

- El repositorio de GitHub es público y tiene licencia MIT.
- La versión actual del código usa el nombre público previsto `twenty-meta-lead-sync`, y el candidato `0.2.0-beta.6` lleva `private: false` para permitir la primera publicación controlada. El paquete privado histórico instalado en JFF se llamaba `twenty-app-meta-lead-sync-jff`; conserva los mismos identificadores internos de Twenty.
- El flujo `.github/workflows/publish.yml` **no publica automáticamente**: únicamente se ejecuta manualmente y exige seleccionar una etiqueta `vX.Y.Z`, escribir `PUBLISH`, pasar la protección del entorno `npm-publication` y superar pruebas, compilación y preflight.
- **Estado:** el usuario confirmó sesión en npm como `mikiguillamon`; `npm view twenty-meta-lead-sync version` devolvió 404 (ninguna versión pública visible, no garantiza reserva del nombre). Falta la primera publicación controlada, configurar Trusted Publisher, QA de instalación limpia y privacidad/retención.

## Paso 1 — Elegir nombre y propietario npm (acción humana)

1. Entra en https://www.npmjs.com/ e inicia sesión. Activa 2FA.
2. La titularidad será la cuenta personal de npm que ya utiliza el autor; no hace falta crear una organización.
3. El usuario ha elegido el nombre sin scope `twenty-meta-lead-sync`. Comprueba que no esté ocupado en npm y que la cuenta que inicia la primera publicación sea la propietaria prevista.
4. Conserva los `universalIdentifier` de `src/constants/ids.ts` para todas las entidades. El nombre npm puede cambiar, pero hay que comprobar la coexistencia con la app privada instalada y el proceso de migración (véase Paso 5).
5. El candidato `0.2.0-beta.6` tiene `private: false`, pero no existe disparador automático de publicación en push. No ejecutes `app:publish` sin revisar el artefacto y confirmar la acción.

## Paso 2 — Preparar la versión candidata (código, después de elegir npm)

1. El paquete candidato `twenty-meta-lead-sync@0.2.0-beta.6` está listo en el código, aún no en npm. Confirmar disponibilidad al registrar por primera vez.
2. Actualizar el README y el historial; decidir el soporte de versiones de Twenty. Actualmente el rango es `>=2.50.0 <2.51.0`, por tanto la app **no aparecerá** para versiones más nuevas sin QA y ampliación explícita.
3. Revisar la ficha pública, logo y capturas reales, sin datos de personas ni credenciales. Las imágenes del Marketplace son `8:5` (p. ej. 1600×1000) y menores de 10 MB.
4. Mantener la configuración por workspace, los secretos en variables cifradas y el funcionamiento *polling only*.
5. Ejecutar `corepack yarn install --immutable`, `corepack yarn typecheck`, `corepack yarn test`, `corepack yarn build`, `node scripts/release-preflight.mjs --public --tag vVERSION`.
6. El flujo de CI estático no sustituye una integración real con Twenty 2.50. Validar una segunda instancia/workspace limpio y el aislamiento entre workspaces.

## Paso 3 — Preparar npm Trusted Publishing (acción humana)

1. La documentación actual de Twenty recomienda publicar desde GitHub Actions mediante OIDC/provenance. No guardes `NPM_TOKEN` ni pegues secretos en el repositorio.
2. En GitHub: `Settings → Environments`, crea `npm-publication` y configura **Required reviewers** si el plan lo permite; limita la publicación a etiquetas de versión mediante reglas de deployment en el entorno.
3. Una vez publicada la primera versión, entra en npm → `twenty-meta-lead-sync` → Settings → Trusted Publisher: GitHub Actions, propietario `mikiguillamon`, repositorio `twenty-meta-lead-sync`, workflow `publish.yml` y, si pide un Environment, `npm-publication`. Para el bootstrap inicial se requiere publicación manual con tu sesión npm y 2FA, sin guardar tokens en GitHub. Después las siguientes versiones usarán OIDC/provenance.
4. La publicación verificable requiere repositorio GitHub público y un flujo con `id-token: write` (incluido). En npm se utilizará la versión actual de CLI con soporte OIDC.
5. Protege las etiquetas de release de GitHub y restringe quién puede ejecutar el workflow.

## Paso 4 — Publicación manual, después de autorizarla

1. Fusiona una PR aprobada que cambie el paquete a modo público y termine todos los controles.
2. Crea y sube una etiqueta `vX.Y.Z` exactamente coincidente con `package.json`; usa un commit que haya pasado las comprobaciones.
3. En GitHub `Actions → Publish Twenty app to npm (manual release only) → Run workflow`: **selecciona la etiqueta**, no `main`. Escribe `PUBLISH`.
4. Aprueba el entorno `npm-publication` si está protegido. Las comprobaciones fallan si la etiqueta no coincide o el paquete sigue privado. Una prerelease se publica explícitamente en el dist-tag `beta`; solo versiones estables utilizan `latest`.
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

## Primera publicación beta (acción manual y irreversible, NO ejecutada)

1. Desde el commit de la PR fusionada, ejecuta `git pull`, `corepack yarn install --immutable`, `corepack yarn typecheck`, `corepack yarn test`, `corepack yarn build`.
2. Inspecciona `.twenty/output` y el tarball de distribución; comprueba que no contiene `.env`, credenciales, logs reales o datos de personas. El CLI publica el contenido empaquetado, no el repositorio fuente sin compilar.
3. Verifica `npm whoami` (`mikiguillamon`), `npm view twenty-meta-lead-sync version` (404 esperado mientras no exista), y `node scripts/release-preflight.mjs --public --tag v0.2.0-beta.6`.
4. Solo si se aprueba el artefacto y el lanzamiento, ejecuta `corepack yarn twenty app:publish --tag beta` desde tu Mac. npm puede pedir autenticación/OTP. **Esta acción hace público el paquete y reserva su nombre**; no se puede sobrescribir la misma versión.
5. Verifica `npm view twenty-meta-lead-sync dist-tags --json` y `npm view twenty-meta-lead-sync versions --json`; `beta` debe apuntar a `0.2.0-beta.6` y `latest` no debe apuntar a ella.
6. Configura Trusted Publisher; realiza posteriormente otra beta (`0.2.0-beta.7` o superior) con un tag de Git y el workflow manual. Solo entonces tendrás provenance emitida desde GitHub.
7. La presencia en npm no implica que tu instancia JFF ya esté migrada desde el tarball; prueba el catálogo en una instancia separada.
