# Meta Lead Sync for Twenty

Native **Meta Lead Ads → Twenty CRM** integration. No Zapier, n8n or external synchronization service required.

**Languages:** English / Español. **Release candidate:** 0.2.0 (not yet published). **Published beta:** 0.2.0-beta.8. **License:** MIT. **Compatibility tested with:** Twenty 2.50.x.

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
git clone https://github.com/mikiguillamon/twenty-meta-lead-sync.git
cd twenty-meta-lead-sync
corepack yarn install
corepack yarn typecheck
corepack yarn test
corepack yarn build
corepack yarn twenty remote:add --url https://your-twenty-server.example --as production
corepack yarn twenty app:publish --private --remote production
corepack yarn twenty app:install
```

In Twenty **Settings → Applications → Meta Lead Sync**, connect Meta, discover pages, refresh forms, configure field mappings and enable synchronization. Do not enable large historical imports before verifying your permissions and Meta usage quota.

## Install from Twenty Marketplace (public app)

This release candidate has **not** been published as stable yet. The GitHub Actions-signed beta `0.2.0-beta.8` is available under the npm `beta` tag. For a compatible Twenty 2.50.x server, open **Settings → Applications**, disable **Vetted only** when browsing community apps, and search for **Meta Lead Sync**. If the app has not appeared, ask the server administrator to sync the app catalog.

Installation is **per workspace**: connect your own Meta credentials, select your Pages and forms, map fields, and test a manual import before enabling scheduled polling. Meta Lead Ads API permissions and access to the relevant Meta Pages are required. This app does **not** require you to replace existing Meta webhooks. Only import personal data when you have a lawful basis and an appropriate retention policy.

**For the maintainer:** the GitHub-backed npm release provides provenance needed to claim the marketplace registration in an intended owner workspace. Self-hosted instances may need GitHub claim OAuth configuration; see [Twenty publishing documentation](https://docs.twenty.com/developers/extend/apps/operations/publishing). Claiming the app is separate from installing it. Do not uninstall or migrate an existing tarball registration without confirming the registry identity in a clean Twenty instance.

See [Public release runbook](docs/PUBLIC_RELEASE_RUNBOOK.md), [Public distribution checklist](docs/PUBLIC_DISTRIBUTION.md) and [Installation](docs/INSTALACION.md). Use Twenty's packaging CLI for publishing; do not run plain `npm publish` from the source root.

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
