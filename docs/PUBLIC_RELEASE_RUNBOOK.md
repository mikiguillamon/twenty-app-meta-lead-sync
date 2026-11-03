# Public release runbook — Meta Lead Sync

## Distribution state

Meta Lead Sync is a public community Twenty app distributed as `twenty-meta-lead-sync`. Its GitHub Actions-signed npm prerelease `0.2.0-beta.8` has been imported into a Twenty 2.50.x Marketplace. The intended JFF owner workspace claimed the **NPM** registration, and the maintainer confirmed successful installation and verification. A stable `0.2.0` is prepared but has not yet been published.

The previous private tarball registration and npm catalog identity once conflicted; the migration to NPM has been completed. Do not recreate that private registration or regenerate its universal identifiers.

**Supported:** Twenty `>=2.50.0 <2.51.0`. Compatibility with later server and SDK versions requires separate testing.

## Publish workflow

The current `.github/workflows/publish.yml` runs only on a GitHub Release `published` event. It requires a release tag matching `package.json`, checks that the tag commit is on `main`, performs preflight, typecheck, tests, build, and publishes using the Twenty CLI and npm Trusted Publishing (GitHub Actions OIDC), with signed provenance.

- Prereleases (`vX.Y.Z-beta.N`) must be marked **prerelease**, and publish with npm dist-tag `beta`.
- Stable releases (`vX.Y.Z`) must **not** be marked prerelease and publish with npm dist-tag `latest`.
- The npm Trusted Publisher is configured for repository `mikiguillamon/twenty-meta-lead-sync`, workflow `publish.yml`, with **no GitHub Environment**. No `NPM_TOKEN` is necessary.
- Publishing from GitHub Actions does **not** change any running JFF installation automatically unless Twenty's own update behavior is enabled.

## Before a release

1. Review changes and release notes. Confirm the manifest still uses the immutable IDs in `src/constants/ids.ts`.
2. Verify `engines.twenty` against tested versions. Never silently claim support for a newer Twenty release.
3. Run `corepack yarn install --immutable && corepack yarn check` and `node scripts/release-preflight.mjs --public --tag vVERSION`.
4. Verify GitHub Actions status and that `main` contains the release commit.
5. Confirm new version is not already published: `npm view twenty-meta-lead-sync@VERSION version`. A 404 is expected for a new version; do not overwrite an existing one.
6. Verify README and marketplace metadata do not reveal customer information or unapproved credentials. Real screenshots only, without personal data.
7. Note explicitly any outstanding data-retention, permissions, security and multi-workspace isolation QA; maintainer verification alone is not a blanket certification.

## Create and verify a stable release using GitHub CLI

```bash
gh auth status
git switch main
git fetch origin
git pull --ff-only origin main
git status --short
node scripts/release-preflight.mjs --public --tag v0.2.0

gh release create v0.2.0 \
  --target "$(git rev-parse HEAD)" \
  --title "Meta Lead Sync v0.2.0" \
  --generate-notes

gh run list --workflow publish.yml --limit 5
npm view twenty-meta-lead-sync dist-tags --json
```

Wait for a successful npm publication before treating `0.2.0` as publicly available. Confirm provenance and package `manifest.json`, then sync the Twenty catalog and, if desired, upgrade the installed app from the UI. No forced redeploy of Twenty is required for catalog sync.

## Workspace ownership

Claiming a package gives ownership of its **registration on a specific Twenty instance**. It does not mean other Twenty instances are claimed. Workspaces on another instance can discover and install the npm package via their catalog. A self-hosted claim requires GitHub OAuth credentials on that server. Use a GitHub account that owns the source repository; for organization-owned repositories, use an organization owner.

The JFF ownership was initially assigned to the wrong workspace, then corrected using **Transfer ownership**. Future updates do not require re-claiming.

## Compatibility and privacy

This app imports Meta Lead Ads personal data directly into Twenty. Tokens are stored as secret per-workspace application variables, and new deduplication ledgers should not store full form answers. Older versions may have stored answers; manage retention/erasure according to the deployment's legal obligations. Do not indiscriminately delete deduplication ledger records because this can permit duplicate imports.

For unresolved QA, use [QA](QA.md) and [Public distribution](PUBLIC_DISTRIBUTION.md).

## External references

- https://docs.twenty.com/developers/extend/apps/operations/publishing
- https://docs.npmjs.com/trusted-publishers
