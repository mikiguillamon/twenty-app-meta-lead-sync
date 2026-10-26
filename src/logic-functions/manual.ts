import { defineLogicFunction } from 'twenty-sdk/define';
import type { RoutePayload } from 'twenty-sdk/logic-function';
import { IDS } from '../constants/ids.ts';
import { assertAdmin, manualSync } from '../lib/sync/commands.ts';
export default defineLogicFunction({
  universalIdentifier: IDS.API_MANUAL, name: 'meta-sync-manual', timeoutSeconds: 80,
  handler: async (event: RoutePayload) => { await assertAdmin(); return manualSync(event.body); },
  httpRouteTriggerSettings: { path: '/meta-sync/manual', httpMethod: 'POST', isAuthRequired: true },
});
