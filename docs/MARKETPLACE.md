# Publicación en el marketplace de Twenty

## Solo después de probar una beta privada

El paso a marketplace público **no** se realiza con el primer ZIP. Primero valida instalación, consumo, seguridad, metadatos, tokens, paginación y comportamiento de los leads con el workspace JFF y otro de ensayo.

1. Actualizar `README`, documentación, capturas, política de privacidad y soporte.
2. Decidir nombre npm estable, p. ej. `twenty-app-meta-lead-sync-jff`, y mantener sus UUID universales constantes.
3. Publicar el repositorio públicamente (si se desea provenance/verificación de propiedad con GitHub).
4. Dar acceso a npm y configurar Trusted Publisher para el repositorio GitHub.
5. Asegurar `keywords: ["twenty-app"]`, metadata del manifest, licencia MIT, compatibilidad `engines.twenty` y versionado semver.
6. Ejecutar `yarn check` contra un entorno aislado compatible; no hay que usar producción como test.
7. Ejecutar `yarn twenty app:publish` en el entorno autorizado para publicar a npm.
8. Reclamar propiedad de la aplicación en Twenty mediante GitHub, como indican los documentos de publicación de Twenty.
9. Esperar la sincronización del catálogo y comprobarla con el filtro **Vetted only** desactivado.
10. Instalar desde marketplace en un workspace diferente y repetir QA de tokens/páginas/mapeos/cron.

## Documentación oficial utilizada

- https://docs.twenty.com/developers/extend/apps/operations/publishing
- https://docs.twenty.com/developers/extend/apps/config/application
- https://docs.twenty.com/developers/extend/apps/logic/logic-functions
- https://docs.twenty.com/developers/extend/apps/logic/key-value-store
- https://docs.twenty.com/developers/extend/apps/data/objects
- https://docs.twenty.com/developers/extend/apps/config/roles
