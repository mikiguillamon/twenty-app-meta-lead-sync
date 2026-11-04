import { defineApplication, FieldType } from 'twenty-sdk/define';
import { IDS } from './constants/ids.ts';

export default defineApplication({
  universalIdentifier: IDS.APPLICATION,
  displayName: 'Meta Lead Sync',
  description: 'Import Facebook and Instagram Lead Ads into Twenty People with field mapping and scheduled synchronization.',
  author: 'Just For Fun 360, S.L.',
  category: 'Sales',
  logo: 'public/logo.svg',
  websiteUrl: 'https://github.com/mikiguillamon/twenty-meta-lead-sync',
  issueReportUrl: 'https://github.com/mikiguillamon/twenty-meta-lead-sync/issues',
  applicationVariables: {
    META_SYSTEM_USER_TOKEN: {
      universalIdentifier: IDS.SYSTEM_TOKEN_VAR,
      label: 'Meta System User Token (optional)',
      description: 'Meta System User token used to access your Lead Ads pages and forms.',
      isSecret: true,
      type: FieldType.TEXT,
    },
    META_PAGE_TOKENS_JSON: {
      universalIdentifier: IDS.PAGE_TOKENS_VAR,
      label: 'Page Access Tokens by ID (optional)',
      description: 'Optional JSON object with Page IDs and their access tokens. Saving replaces the previous set.',
      isSecret: true,
      type: FieldType.TEXT,
    },
  },
});
