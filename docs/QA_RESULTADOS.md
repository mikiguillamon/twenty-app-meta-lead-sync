# Informe de verificación de la entrega — 26/10/2026

## Hecho y comprobado en el entorno de creación

- [x] Implementación de código real `.ts`/`.tsx`: manifest, permisos, índice, objeto ledger, front components, lógica y cron.
- [x] Versiones fijadas en `package.json`: `twenty-sdk` y `twenty-client-sdk` **2.50.0**; compatibles según el código fuente oficial de Twenty `twenty/v2.50.0`.
- [x] Pruebas locales ejecutadas con Node 22 mediante `--experimental-strip-types` y **stubs SDK de test**: **17 pasadas / 0 fallidas**.
- [x] Test integrado, en memoria: System User Token → Page Token → petición Meta simulada → mapeo → creación Persona → ledger → cursor/estado → repetición sin duplicar.
- [x] Test integrado, en memoria: Meta `429`, reintento, historial de fallo y cursor sin avance.
- [x] Test integrado, en memoria: 2 páginas, job idempotente, contadores correctos al repetir página anterior.
- [x] `TypeScript.transpileModule` analizó **34 archivos `.ts`/`.tsx` sin errores de sintaxis**.
- [x] Mock de integración comprueba que la URL de Graph API nunca recibe el token en parámetros.

## No comprobado todavía (necesita acceso/red/servidor)

- [ ] `yarn install` con el registro real de paquetes. El contenedor de creación no tiene acceso de red a npm.
- [ ] `yarn typecheck` con las **declaraciones reales** de los paquetes 2.50.0, no con stubs.
- [ ] `yarn build` / `twenty dev:build` con el SDK instalado y el manifest validado.
- [ ] Publicación de app privada, instalación y render de front components en **Twenty 2.50.0**.
- [ ] Prueba en Meta Graph API con System User Token y Page Access Token auténticos, permisos y leads reales.
- [ ] Alta/actualización de Person y `metaSyncSubmission` con el API REST de tu workspace y campos personalizados.
- [ ] Ejecuciones programadas y convivencia entre múltiples workspaces/volúmenes.
- [ ] Seguridad/privacidad/comportamiento bajo caída de red y rate limits reales, incluida supresión RGPD.

**Resultado:** beta fuente completa con pruebas automatizadas locales, **NO afirmada como compilada ni desplegada/validada en Twenty real**. GitHub Actions (`.github/workflows/check.yml`) realizará `typecheck`, `test` y `build` en un runner con acceso a dependencias. Antes de instalar revisa los resultados de Actions. No publicar en el Marketplace hasta completar [QA.md](QA.md).
