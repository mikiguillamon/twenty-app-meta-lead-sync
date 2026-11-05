# Agent notes

This is a native Twenty SDK v2.50.0 application. Preserve all `universalIdentifier` constants in `src/constants/ids.ts` across releases. Never store Meta tokens in KV, custom objects or GitHub; use encrypted `applicationVariables` only. One installation is one workspace: never share keys or records across workspaces. Never call `/{appId}/subscriptions` or `/{pageId}/subscribed_apps` without an explicit user-approved webhook migration: this app is polling-only.

Run `yarn typecheck`, `yarn test`, `yarn build` before changing the app version. Deploy privately first. Do not treat the app as marketplace-ready until `docs/QA.md` has been completed against Twenty 2.50.0, including failure, permission and Meta rate-limit tests. Prioritize atomic, idempotent sync and scoped permissions on future updates.

The public README is also used in the Twenty Marketplace: keep its links absolute and its prose user-facing. The first ordinary sync checks 24 hours; a 90-day historical import must be explicitly requested. Public releases and authorized npm dist-tag changes run through the GitHub Actions `publish.yml` trusted publisher, not a local npm token.
