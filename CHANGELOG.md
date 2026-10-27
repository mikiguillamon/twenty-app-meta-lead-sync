# Changelog

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
