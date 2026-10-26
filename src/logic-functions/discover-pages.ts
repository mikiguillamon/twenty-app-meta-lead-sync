import { defineLogicFunction } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';
import { assertAdmin, discoverPagesAndSave } from '../lib/sync/commands.ts';
export default defineLogicFunction({
  universalIdentifier: IDS.API_DISCOVER_PAGES, name: 'meta-sync-discover-pages', timeoutSeconds: 120,
  handler: async () => { await assertAdmin(); return discoverPagesAndSave(); },
  httpRouteTriggerSettings: { path: '/meta-sync/discover-pages', httpMethod: 'POST', isAuthRequired: true },
});
