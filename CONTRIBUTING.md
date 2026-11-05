# Contributing to Meta Lead Sync

This app is built with the Twenty 2.50 SDK. Use Node.js 24 and Yarn 4 through Corepack.

```bash
corepack enable
corepack yarn install --immutable
corepack yarn check
```

The checks cover types, automated tests and the build. Real Meta permissions, rate limits, upgrades and workspace isolation also require the manual scenarios in [docs/QA.md](docs/QA.md).

Keep the existing `universalIdentifier` values in `src/constants/ids.ts`, never commit tokens or personal lead data, and do not change existing Meta webhook subscriptions. Keep the README appropriate for the public Twenty Marketplace, using absolute links.

To publish a version, use a GitHub Release and the trusted `publish.yml` workflow. To correct an npm `latest` or `beta` pointer for an existing version, run the same workflow manually with `dist_tag` and `version`. This requires the npm Trusted Publisher permission **Allow npm dist-tag**. For instructions, see [docs/PUBLIC_RELEASE_RUNBOOK.md](docs/PUBLIC_RELEASE_RUNBOOK.md).
