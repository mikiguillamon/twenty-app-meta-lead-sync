# Twenty Marketplace — publication, claiming and release checklist

## Current status

- The public npm prerelease `twenty-meta-lead-sync@0.2.0-beta.8` was published with GitHub Actions OIDC and signed provenance.
- The application was discovered in the npm catalog, successfully **claimed by the intended JFF owner workspace**, installed from the Marketplace and manually verified by the maintainer.
- `0.2.0` is the planned first stable release. It must be published through a GitHub Release on a commit in `main`; creating or merging a PR does not publish it.
- Compatibility declared and tested: **Twenty 2.50.x**. Do not widen `engines.twenty` without actual compatibility testing. Newer Twenty versions (including 2.55.x) are not yet certified.

## How marketplace distribution works

1. Publish with the Twenty packaging CLI through GitHub Actions. The npm package must include `twenty-app` in `keywords`, a valid `manifest.json`, and a `latest` dist-tag on the intended stable release.
2. Twenty instances discover packages via periodic npm catalog sync; users may need to disable **Vetted only** to see community applications.
3. Marketplace distribution is independent of claiming: each Twenty **instance** has its own application registration and owner workspace. Claiming does not install an app.
4. On self-hosted instances, **Claim with GitHub** requires `APP_CLAIM_GITHUB_CLIENT_ID` and `APP_CLAIM_GITHUB_CLIENT_SECRET` configured on the Twenty server, with callback `<SERVER_URL>/application-registration-claim/github/callback`. The GitHub account must own the source repository or the publishing organization.
5. A local or private **TARBALL** registration using the same application `universalIdentifier` prevents creation of a new npm registration on the same Twenty instance. Remove any obsolete private installation and its registration via the supported Twenty UI only when it is safe to do so; do not change UUIDs or edit database rows manually.

## Confirmed acceptance and remaining QA

- [x] npm prerelease built and published with GitHub Actions provenance
- [x] npm catalog discovers app and correct version
- [x] JFF claim and ownership transfer completed
- [x] Public NPM Marketplace installation verified by maintainer on Twenty 2.50.x
- [x] Static CI: typecheck, tests and build passing
- [ ] Independently verify all configurations and Meta permission combinations, polling edge cases and multi-workspace isolation before claiming broad production certification
- [ ] Review retention/deletion of old lead answers and GDPR obligations
- [ ] Add **real** gallery screenshots, without personal data, when available (optional for community listing)
- [ ] Check stable release npm provenance and `latest` dist-tag after publication

The maintainer's functional verification of the installed app is recorded as such; it must not be presented as comprehensive security, compliance or load testing.

## Publishing the stable version

After PR checks are green and the package version on `main` equals `0.2.0`:

```bash
gh auth status
git switch main
git fetch origin
git pull --ff-only origin main
git status --short
node scripts/release-preflight.mjs --public --tag v0.2.0
gh release create v0.2.0 --target "$(git rev-parse HEAD)" --title "Meta Lead Sync v0.2.0" --generate-notes --latest=true
gh run list --workflow publish.yml --limit 5
npm view twenty-meta-lead-sync dist-tags --json
```

The **stable** release must not be marked `--prerelease`. The GitHub Release `published` event invokes the npm OIDC publishing workflow and promotes `latest` to `0.2.0`.

If publication fails, diagnose the workflow before creating a different version or Release. Do not reuse a published npm version.

## References

- [Twenty app publishing and claiming](https://docs.twenty.com/developers/extend/apps/operations/publishing)
- [Twenty application metadata](https://docs.twenty.com/developers/extend/apps/config/application)
- [Project release runbook](PUBLIC_RELEASE_RUNBOOK.md)
- [QA checklist](QA.md)
