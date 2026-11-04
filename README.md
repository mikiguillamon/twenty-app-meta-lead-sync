# Meta Lead Sync for Twenty

Bring Facebook and Instagram Lead Ads into Twenty CRM. Connect your Meta Pages, choose which forms to import, and map responses to People fields. The app runs inside Twenty, so you don't need a separate automation platform.

Each workspace has its own Meta connection, form settings and sync schedule.

**Compatibility:** Twenty 2.50.x  
**Languages:** English and Spanish  
**License:** MIT

## Features

- Connect with a Meta System User token or Page access tokens.
- Manage several Pages and forms in the same workspace.
- Map form answers to standard and supported custom fields on People.
- Import new leads automatically, with an interval from 1 to 60 minutes.
- Run a manual sync or import up to 90 days of historical leads.
- Avoid importing the same Meta lead twice, and review sync activity and errors.
- Use the interface in English or Spanish. By default, it follows your Twenty language.

Meta Lead Sync works alongside existing Meta webhooks without changing their subscriptions.

## Installation

1. Open **Settings → Applications** in Twenty.
2. Turn off **Vetted only** to include community apps, then search for **Meta Lead Sync**.
3. Install it in your workspace.
4. Open **Connections** in the app settings and add your Meta credentials.
5. Select your Pages and forms. Map each form's questions to the appropriate People fields.
6. Run a manual import to check the results before enabling automatic synchronization.

You'll need access to the relevant Meta Pages and Lead Ads forms, including the necessary API permissions. The app has been tested with Twenty **2.50.x**. Compatibility with later versions has not been verified.

If the app isn't listed, ask your Twenty administrator to synchronize the Marketplace catalog. Community apps are not necessarily vetted by Twenty.

For a fuller walkthrough, see the [installation guide (Español)](docs/INSTALACION.md).

## Privacy and security

Meta credentials are stored as secret application variables within the workspace where you configure them. Settings and synchronization state stay in Twenty, and imported leads become People records in that workspace.

New imports don't copy complete form answers into the deduplication ledger. Older installations may still contain historical responses that require review. Workspace administrators are responsible for access rights, data retention, deletion requests and applicable privacy requirements.

## Español

Meta Lead Sync importa los contactos de formularios de Facebook e Instagram Lead Ads directamente a Personas de Twenty. Puedes conectar varias páginas, elegir los formularios que quieras utilizar, relacionar las preguntas con campos del CRM y programar la sincronización.

Para instalarla, entra en **Configuración → Aplicaciones**, desactiva el filtro **Vetted only** y busca **Meta Lead Sync**. Después configura las credenciales de Meta y haz una importación de prueba.

La aplicación admite español e inglés y utiliza por defecto el idioma de Twenty. Se ha probado con Twenty **2.50.x**.

Tienes todos los pasos en la [guía de instalación](docs/INSTALACION.md).

## Development and support

The source is available under the MIT license. To run the checks locally, use Node.js 24 and Yarn 4:

```bash
corepack yarn install --immutable
corepack yarn check
```

See the [architecture notes](docs/ARQUITECTURA.md), [testing guide](docs/QA.md), [Marketplace guide](docs/MARKETPLACE.md) and [changelog](CHANGELOG.md).

For bugs and feature requests, open an [issue on GitHub](https://github.com/mikiguillamon/twenty-meta-lead-sync/issues).

Maintained by Just For Fun 360, S.L.
