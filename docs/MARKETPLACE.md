# Twenty Marketplace — Release acceptance and claiming

**Status:** npm package `twenty-meta-lead-sync@0.2.0-beta.8` was published with signed GitHub Actions provenance. Version `0.2.0` in this branch is a **candidate only**: not published or signed yet. Do not ship it before the tests below.

## How the catalog discovers the app

1. The public npm package must have the keyword `twenty-app`, a valid Twenty `manifest.json` and source metadata (name, description, logo and author). Community apps require the **Vetted only** filter to be disabled.
2. Twenty 2.50 syncs package metadata from the npm registry approximately hourly; admins may trigger `twenty dev:catalog-sync --remote <remote>` on a safe test instance.
3. The server filters apps by `engines.twenty`; this app currently declares `>=2.50.0 <2.51.0`, so do not promise compatibility with other versions.
4. npm search metadata can select an older `latest` dist-tag. Verify the npm search result and dist-tags before claiming. Publishing a beta to npm does not automatically promote that beta to `latest`; do not mislabel a beta as stable just to make it discoverable.

## Important: existing private JFF registration

A private TAR archive registration already uses this app's `universalIdentifier` on JFF. Twenty 2.50's `upsertFromCatalog` refuses to overwrite a registration whose `sourceType` is not NPM. This is expected; do not delete or uninstall the private JFF app merely to test registry claiming.

Use a separate clean Twenty 2.50 instance for testing the npm registration. A second workspace on the **same JFF instance is not sufficient**, because app registrations are global to the instance.

## Claim with GitHub (on clean instance)

1. Verify that the catalog includes a package version with GitHub provenance and is compatible with the isolated Twenty server.
2. Open `Settings → Developers → Apps` in the workspace intended to own the registration (requires Workspace Apps and Developers permissions).
3. Under **Claim an application**, look up `twenty-meta-lead-sync` (or `src/constants/ids.ts` application UUID). If not found, use **Sync catalog** if available and retry after sync.
4. **Claim with GitHub** using the GitHub account that owns the source repo (a collaborator is not sufficient).
5. Verify that it appears in **My apps**, has source type **NPM**, and **Distribution → Ownership** says **Claimed by this workspace**.
6. Claim is **not** an installation. Install the app in the owner workspace; then install in an independent second workspace to check credential and data isolation.

### Self-hosted GitHub OAuth requirement

On a self-hosted Twenty instance, claim requires its administrator to register a GitHub OAuth app and set `APP_CLAIM_GITHUB_CLIENT_ID` and `APP_CLAIM_GITHUB_CLIENT_SECRET`. The GitHub OAuth authorization callback is `<SERVER_URL>/application-registration-claim/github/callback`. Do not add those secrets to GitHub, source code, this repository or npm. Twenty Cloud provides these settings as part of the service.

## Release gates before 0.2.0 stable

- [ ] npm catalog entry resolves a version with provenance from `mikiguillamon/twenty-meta-lead-sync`.
- [ ] Clean installation and successful GitHub claim on separate compatible Twenty instance.
- [ ] Installation in two distinct workspaces and no shared Meta credentials, mappings, KVs or People.
- [ ] Meta System User and Page tokens tested with appropriately scoped test accounts.
- [ ] Forms, custom field mapping, history, polling, rate limiting and dedup tested with synthetic leads.
- [ ] Permission-denied flows and redacted audit logs tested.
- [ ] Retention/deletion of historical Meta answers and GDPR response documented and verified.
- [ ] README, logo, support and manifest metadata reviewed; real screenshots optional until provided, not fabricated.
- [ ] Stable `0.2.0` release approved in PR, its GitHub Release published through OIDC and npm `latest` checked.
- [ ] Existing JFF production tarball registration untouched pending explicit migration plan.

## Verification commands

```bash
npm view twenty-meta-lead-sync dist-tags --json
npm view twenty-meta-lead-sync versions --json
npm view twenty-meta-lead-sync@beta version
```

See [Public distribution checklist](PUBLIC_DISTRIBUTION.md), [QA](QA.md) and [Twenty publishing docs](https://docs.twenty.com/developers/extend/apps/operations/publishing).
