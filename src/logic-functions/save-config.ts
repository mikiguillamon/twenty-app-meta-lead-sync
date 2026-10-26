import { defineLogicFunction } from 'twenty-sdk/define';
import type { RoutePayload } from 'twenty-sdk/logic-function';
import { IDS } from '../constants/ids.ts';
import { assertAdmin, saveWorkspaceConfig } from '../lib/sync/commands.ts';
export default defineLogicFunction({
  universalIdentifier: IDS.API_SAVE_CONFIG, name: 'meta-sync-save-config', timeoutSeconds: 40,
  handler: async (event: RoutePayload) => { await assertAdmin(); return saveWorkspaceConfig(event.body); },
  httpRouteTriggerSettings: { path: '/meta-sync/save-config', httpMethod: 'POST', isAuthRequired: true },
});
