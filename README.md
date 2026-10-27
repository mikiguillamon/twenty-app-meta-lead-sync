# Meta Lead Sync for Twenty

Native **Meta Lead Ads → Twenty CRM** integration. No Zapier, n8n or external synchronization service required.

**Languages:** English / Español. **Current version:** 0.2.0-beta.1 (pre-release). **License:** MIT. **Compatibility tested with:** Twenty 2.50.x.

The app imports Meta Facebook/Instagram Lead Ads into Twenty People. Every workspace manages its own Meta credentials, pages, forms, field mappings, deduplication and schedule. It **does not replace or subscribe to existing Meta webhooks**.

## Features

- System User Token and optional per-Page access tokens, securely stored in Twenty application variables.
- Multiple Meta Pages and lead forms per workspace; search and enable forms individually.
- Map each form's questions to standard/custom Person fields; optional updates to existing People.
- Scheduled polling (1–60 minutes), manual synchronization and up to 90 days of history.
- Deduplication by Meta lead ID; safe reconstruction if a linked Person is deleted.
- Quota-aware backoff, a limited forced test and sanitized audit logs.
- Light/dark themes and English/Spanish in-app selector. The language defaults to the active Twenty UI language and follows changes automatically. English/Spanish overrides can be saved per user/device. Twenty 2.50 settings-tab titles remain static in English.

## Install from source (self-hosted)

Requirements: Node.js 24, Corepack/Yarn 4, Twenty 2.50.x and a workspace with application management permissions.

```bash
git clone https://github.com/mikiguillamon/twenty-app-meta-lead-sync.git
cd twenty-app-meta-lead-sync
corepack yarn install
corepack yarn typecheck
corepack yarn test
corepack yarn build
corepack yarn twenty remote:add --url https://your-twenty-server.example --as production
corepack yarn twenty app:publish --private --remote production
corepack yarn twenty app:install
```

In Twenty **Settings → Applications → Meta Lead Sync**, connect Meta, discover pages, refresh forms, configure field mappings and enable synchronization. Do not enable large historical imports before verifying your permissions and Meta usage quota.

**The public npm / Twenty Marketplace package has not been published yet.** This prerelease is private for testing. See [Public distribution checklist](docs/PUBLIC_DISTRIBUTION.md) and [Installation](docs/INSTALACION.md). Do not use plain `npm publish` as a replacement for the Twenty packaging CLI.

## Español

Meta Lead Sync es una aplicación nativa de Twenty para importar clientes potenciales de formularios Meta Lead Ads directamente a **Personas**, sin n8n ni servicios externos.

Cada workspace configura sus propias credenciales, páginas, formularios, mapeos y frecuencia. Incorpora deduplicación, histórico de hasta 90 días, protección de cuota y auditoría. **No cambia el webhook de Meta existente.**

**Idioma:** abre los ajustes de Meta Lead Sync y utiliza el selector **Language / Idioma** (English / Español). Por defecto sigue automáticamente el idioma activo de Twenty. Puedes elegir English o Español manualmente y se recuerda por usuario y dispositivo. En Twenty 2.50 los títulos de pestaña del sistema permanecen en inglés.

Instalación: consulta [la guía](docs/INSTALACION.md). Conecta tu propio servidor de Twenty con `remote:add`, publica como app privada con `app:publish --private` e instala en tu workspace.

## Privacy & security / Privacidad y seguridad

Meta credentials are secret workspace-scoped Twenty variables, never stored in KV. Non-secret configuration and execution state are kept inside Twenty. Meta form responses may contain personal data; assess access controls, storage, retention, deletion, and GDPR obligations before production. The current beta is **not a substitute for a compliance review**.

Las credenciales se guardan como variables cifradas por workspace. Las respuestas pueden contener datos personales. Revisa permisos, retención, supresión y cumplimiento normativo antes de usar la aplicación con clientes.

## Development

```bash
corepack yarn typecheck
corepack yarn test
corepack yarn build
```

See [Architecture](docs/ARQUITECTURA.md), [QA](docs/QA.md), [Changelog](CHANGELOG.md), and [Public distribution](docs/PUBLIC_DISTRIBUTION.md).

**Author:** Just For Fun 360, S.L.
