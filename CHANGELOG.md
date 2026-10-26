# Changelog

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
