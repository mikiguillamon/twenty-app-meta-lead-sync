import { defineLogicFunction } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';
import { assertAdmin, dashboard } from '../lib/sync/commands.ts';
export default defineLogicFunction({
  universalIdentifier: IDS.API_STATE, name: 'meta-sync-state', timeoutSeconds: 20,
  handler: async () => { await assertAdmin(); return dashboard(); },
  httpRouteTriggerSettings: { path: '/meta-sync/state', httpMethod: 'GET', isAuthRequired: true },
});
