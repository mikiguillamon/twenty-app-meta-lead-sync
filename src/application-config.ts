import { defineApplication, FieldType } from 'twenty-sdk/define';
import { IDS } from './constants/ids.ts';

export default defineApplication({
  universalIdentifier: IDS.APPLICATION,
  displayName: 'Meta Lead Sync',
  description: 'Sync Meta Lead Ads to Twenty People with per-workspace polling and field mapping, without changing webhooks.',
  author: 'Just For Fun 360, S.L.',
  category: 'Sales',
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
