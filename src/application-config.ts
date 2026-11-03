import { defineApplication, FieldType } from 'twenty-sdk/define';
import { IDS } from './constants/ids.ts';

export default defineApplication({
  universalIdentifier: IDS.APPLICATION,
  displayName: 'Meta Lead Sync',
  description: 'Sync Meta Lead Ads to Twenty People with per-workspace polling and field mapping, without changing webhooks.',
  author: 'Just For Fun 360, S.L.',
  category: 'Sales',
  aboutDescription: 'Meta Lead Sync imports Meta (Facebook and Instagram) Lead Ads into Twenty People. Configure your own Meta credentials, Pages and forms separately in each Twenty workspace. Map questions to standard or custom Person fields, run scheduled polling or a manual sync, and review sanitized execution history. Deduplication uses Meta lead IDs. No external synchronization service, no Meta webhook replacement and no subscription fees for the app. Meta API access and an authorized Meta Business account are required. Before enabling imports with real leads, review your data protection obligations, permissions, retention, and use of personal data. This app has been tested with Twenty 2.50.x; other versions are not yet certified.',
  logo: 'public/logo.svg',
  websiteUrl: 'https://github.com/mikiguillamon/twenty-meta-lead-sync',
  issueReportUrl: 'https://github.com/mikiguillamon/twenty-meta-lead-sync/issues',
  applicationVariables: {
    META_SYSTEM_USER_TOKEN: {
      universalIdentifier: IDS.SYSTEM_TOKEN_VAR,
      label: 'Meta System User Token (optional)',
      description: 'Encrypted per-workspace credential. Used directly for Lead Ads when authorized; a Page token may be resolved when needed.',
      isSecret: true,
      type: FieldType.TEXT,
    },
    META_PAGE_TOKENS_JSON: {
      universalIdentifier: IDS.PAGE_TOKENS_VAR,
      label: 'Page Access Tokens by ID (optional)',
      description: 'Encrypted JSON mapping Page IDs to Page Access Tokens. Saving replaces the previous set.',
      isSecret: true,
      type: FieldType.TEXT,
    },
  },
});
