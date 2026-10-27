# Public distribution checklist — Meta Lead Sync for Twenty

The current v0.1.9 deployment is a **private tarball** installed on the author's Twenty instance. Publishing to npm is a distinct distribution mechanism. Do not publish the current private package under its deployment-specific name.

## Supported distribution

- **Private / same instance:** Settings > Developers > Apps > My apps > Distribution > Copy share link. This link works for other workspaces on the **same Twenty instance only**.
- **Source / self-hosted:** Clone this repository, install with Node 24 / Yarn 4, configure a remote to their own Twenty server, then `yarn twenty app:publish --private --remote <their-server>` and `yarn twenty app:install`.
- **Marketplace / npm:** Publish a public npm package with the `twenty-app` keyword, proper Twenty manifest metadata and GitHub provenance. Twenty imports npm packages into its catalog (normally hourly). Users find community apps after disabling **Vetted only**; marketplace inclusion does not imply vetting.

## Requirements before public npm publishing

1. **Repository and package identity:** Choose an npm package name independent of JFF (for example `@your-npm-account/twenty-app-meta-lead-sync`), verify npm name ownership, and set `private: false` or remove `private`. Keep the existing application and object `universalIdentifier` values unchanged for upgrade compatibility. Verify the source GitHub repository is public before using provenance and marketplace claiming. Check source and commit history for accidentally committed secrets before switching visibility.
2. **Bilingual UI (English + Spanish):** Localized frontend strings, labels, empty/error states, status/action text; keep Meta field names, API keys, IDs, persisted states and machine codes unchanged. Twenty 2.50 settings-menu-item titles are static per manifest; choose English titles for marketplace or use a single settings component with its own localized navigation. For a per-device preference, Twenty Remote DOM supports app-scoped `localStorage`; this is not synced across devices. A per-user Twenty app variable needs additional permission configuration.
3. **Marketplace metadata:** English description, `author`, `category`, `websiteUrl`, `issueReportUrl`, appropriate `emailSupport` and `termsUrl` if an actual support address / policy exists. Add useful screenshots with `galleryImages` pointing to bundled files; recommended 8:5 ratio (e.g. 1600x1000), under 10 MB each. Check that the README no longer describes an untested 0.1.0 beta.
4. **Privacy and operational readiness:** Verify data retention / deletion for stored Meta lead answers and audit records, permissions, secure secret storage, timeout/rate-limit behavior, uninstall semantics, GDPR user rights, and documentation. Test in a second clean Twenty 2.50 workspace with distinct Meta tokens (no cross-workspace leakage).
5. **CI and signing:** Add a separate release workflow triggered by protected semver tags, use GitHub Actions and an npm **trusted publisher** with OIDC provenance; never hardcode npm access tokens. Ensure `yarn install --immutable`, typecheck, tests, build and a real Twenty integration test pass before pushing a release tag.
6. **Ownership / claiming:** After the package appears in the marketplace catalog, claim it via Settings > Developers > Apps > Claim an application > Claim with GitHub. Claiming requires valid provenance from a public GitHub repository. If the app uses no server routes it does not need an owner-workspace shared webhook resolver. Claiming is per Twenty instance.

## Publish / install command differences

```bash
# Existing private testing only
corepack yarn twenty app:publish --private --remote jff

# Future PUBLIC distribution — only after package identity / provenance readiness
corepack yarn twenty app:publish
# Use: corepack yarn twenty app:publish --tag beta for a prerelease
```

Do NOT substitute `npm publish` for the Twenty CLI publishing workflow: the CLI packages Twenty-specific manifest and application artifacts.

## References

- https://docs.twenty.com/developers/extend/apps/operations/publishing
- https://docs.twenty.com/developers/extend/apps/config/application
- https://docs.twenty.com/developers/extend/apps/layout/front-components
