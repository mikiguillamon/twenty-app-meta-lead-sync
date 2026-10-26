import { defineLogicFunction } from 'twenty-sdk/define';
import type { LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { IDS } from '../constants/ids.ts';
import { runFormPage, type FormJob } from '../lib/sync/runner.ts';
export default defineLogicFunction({
  universalIdentifier: IDS.WORKER_FORM, name: 'meta-sync-form-page', timeoutSeconds: 240,
  handler: async (job: FormJob, context: LogicFunctionExecutionContext) =>
    runFormPage(job, context.retryCount, context.maxRetries),
});
