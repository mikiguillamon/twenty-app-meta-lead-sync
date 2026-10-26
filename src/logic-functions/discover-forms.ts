import { defineLogicFunction } from 'twenty-sdk/define';
import type { RoutePayload } from 'twenty-sdk/logic-function';
import { IDS } from '../constants/ids.ts';
import { assertAdmin, discoverFormsAndSave } from '../lib/sync/commands.ts';
import { getObject } from '../lib/validation.ts';
export default defineLogicFunction({
  universalIdentifier: IDS.API_DISCOVER_FORMS, name: 'meta-sync-discover-forms', timeoutSeconds: 120,
  handler: async (event: RoutePayload) => { await assertAdmin(); return discoverFormsAndSave(getObject(event.body).pageId); },
  httpRouteTriggerSettings: { path: '/meta-sync/discover-forms', httpMethod: 'POST', isAuthRequired: true },
});
