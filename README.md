# Meta Lead Sync for Twenty

**Meta Lead Ads → Twenty People**, natively. Import leads from Facebook and Instagram forms without Zapier, n8n or an external synchronization service.

**Languages:** English / Español · **License:** MIT · **Tested compatibility:** Twenty 2.50.x.

> **Compatibility:** this release declares `>=2.50.0 <2.51.0`. Do not assume it works with later Twenty versions until they have been tested and the compatibility range is updated.

## Install from Twenty Marketplace

1. Open **Settings → Applications** in a compatible Twenty instance.
2. Disable the **Vetted only** filter to browse community apps, and search for **Meta Lead Sync**.
3. Install the app in your workspace. Each workspace maintains its own credentials, Pages, forms, field mapping and import schedule.
4. Open **Settings → Applications → Meta Lead Sync**. Enter an authorized Meta **System User Token** and/or Page Access Tokens, then discover Pages and forms.
5. Select the forms to synchronize, map their questions to standard or custom **Person** fields and run a **manual test import**.
6. Review the results and enable scheduled polling only after confirming permissions, data mapping and Meta API limits.

If the app is missing, ask the Twenty instance administrator to synchronize the npm marketplace catalog. On self-hosted Twenty, community apps may be hidden while **Vetted only** is enabled. An app being public does **not** imply that Twenty has vetted it.

## Features

- Multiple Meta Pages and Lead Ads forms per workspace, with search and independent enable/disable controls.
- System User Tokens and optional per-Page tokens; no changes to existing Meta webhook subscriptions.
- Per-form field mapping into standard and supported custom Person fields.
- Automatic polling (1–60 minutes), manual synchronization and optional historical imports of up to 90 days.
- Deduplication using Meta lead IDs; conservative recovery when a previously linked Person has been deleted.
- Meta API quota-aware backoff, constrained forced test and sanitized audit events.
- English/Spanish interface with an automatic option following the active Twenty UI language; optional per-device override, light/dark themes. In Twenty 2.50, native settings-tab titles remain static in English.

## Requirements

- A Twenty **2.50.x** instance and a workspace with app installation permissions.
- Access to Meta Lead Ads for the relevant Pages and forms, including the required Meta Graph API permissions and a valid token.
- A lawful basis and an appropriate retention/deletion policy for any lead personal data you process.

Meta and Twenty API permissions depend on your own account and organization. The app does not obtain those permissions automatically.

## Privacy and security

- Credentials are stored as **secret, workspace-scoped Twenty application variables**. Never paste tokens into GitHub issues or public logs.
- Non-secret settings, sync cursors and deduplication metadata are kept within Twenty. Imported contact data is written to **People** in the destination workspace.
- New imports do not copy full Meta form answers into the deduplication ledger; historical data created by earlier versions may still need review.
- This app does **not** replace Meta webhooks or transmit your leads through a separate third-party sync platform. Meta and Twenty still process data under their own terms.
- Workspace administrators are responsible for access controls, lawful processing, retention, erasure requests, backups and applicable GDPR obligations. Installing this app is not a substitute for a privacy review.

## Español

Meta Lead Sync importa clientes potenciales de formularios de Facebook e Instagram directamente a **Personas** de Twenty, sin servicios intermedios.

Desde **Configuración → Aplicaciones**, desactiva **Vetted only**, busca **Meta Lead Sync** e instala la aplicación. Cada workspace configura sus propios tokens, páginas, formularios y mapeos. Haz una sincronización manual antes de activar la importación programada.

La interfaz admite español e inglés y, por defecto, sigue el idioma de Twenty. Solo se ha verificado la compatibilidad con **Twenty 2.50.x**. Las credenciales se guardan en variables secretas por workspace. Revisa el tratamiento de datos personales antes de importar leads reales.

## Install from source (self-hosted / development)

Requirements: Node.js 24, Corepack/Yarn 4, Twenty 2.50.x and application management permissions.

```bash
git clone https://github.com/mikiguillamon/twenty-meta-lead-sync.git
cd twenty-meta-lead-sync
corepack yarn install --immutable
corepack yarn typecheck
corepack yarn test
corepack yarn build
corepack yarn twenty remote:add --url https://your-twenty-server.example --as testing
corepack yarn twenty app:publish --private --remote testing
corepack yarn twenty app:install --remote testing
```

A private tarball/source installation is intended for development. To install the public npm package, use the **Marketplace** instructions instead; do not upload a private build with the same universal identifier into an instance where the npm registration already exists.

## Development, support and releases

```bash
corepack yarn install --immutable
corepack yarn check
```

Report defects at [GitHub Issues](https://github.com/mikiguillamon/twenty-meta-lead-sync/issues). For configuration details see [Installation](docs/INSTALACION.md), [Architecture](docs/ARQUITECTURA.md), [Marketplace](docs/MARKETPLACE.md), [QA](docs/QA.md) and [Changelog](CHANGELOG.md).

Releases are built and published with GitHub Actions / npm Trusted Publishing using the Twenty packaging CLI; see [Release runbook](docs/PUBLIC_RELEASE_RUNBOOK.md). Do not run plain `npm publish` from the source root.

**Author:** Just For Fun 360, S.L.
