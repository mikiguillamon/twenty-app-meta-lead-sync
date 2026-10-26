import { defineLogicFunction } from 'twenty-sdk/define';
import type { RoutePayload } from 'twenty-sdk/logic-function';
import { IDS } from '../constants/ids.ts';
import { assertAdmin, validateToken } from '../lib/sync/commands.ts';
export default defineLogicFunction({
  universalIdentifier: IDS.API_VALIDATE, name: 'meta-sync-validate-token', timeoutSeconds: 70,
  handler: async (event: RoutePayload) => { await assertAdmin(); return validateToken(event.body); },
  httpRouteTriggerSettings: { path: '/meta-sync/validate-token', httpMethod: 'POST', isAuthRequired: true },
});
