import { defineApplication, FieldType } from 'twenty-sdk/define';
import { IDS } from './constants/ids.ts';

export default defineApplication({
  universalIdentifier: IDS.APPLICATION,
  displayName: 'Meta Lead Sync',
  description: 'Sync Meta Lead Ads to Twenty People with per-workspace polling and field mapping, without changing webhooks.',
  author: 'Just For Fun 360, S.L.',
  category: 'Sales',
  logo: 'public/logo.svg',
  applicationVariables: {
    META_SYSTEM_USER_TOKEN: {
      universalIdentifier: IDS.SYSTEM_TOKEN_VAR,
      label: 'Meta System User Token (opcional)',
      description: 'Secreto por workspace. La app obtiene Page Access Tokens temporalmente mediante /me/accounts.',
      isSecret: true,
      type: FieldType.TEXT,
    },
    META_PAGE_TOKENS_JSON: {
      universalIdentifier: IDS.PAGE_TOKENS_VAR,
      label: 'Page Access Tokens por ID (opcional)',
      description: 'JSON secreto con claves Page ID y valores Page Access Token; reemplaza el conjunto al guardar.',
      isSecret: true,
      type: FieldType.TEXT,
    },
  },
});
