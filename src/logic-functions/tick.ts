import { defineLogicFunction } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';
import { loadConfig, loadFormState, isRunActive, shouldSchedule } from '../lib/sync/state.ts';
import { scheduleForm } from '../lib/sync/runner.ts';
import { getActiveMetaQuota } from '../lib/meta/rate-limit.ts';
export default defineLogicFunction({
  universalIdentifier: IDS.CRON_TICK, name: 'meta-sync-tick', timeoutSeconds: 120,
  handler: async () => {
    const blocked = await getActiveMetaQuota();
    if (blocked) return { queued: 0, pausedUntil: blocked.pausedUntil };
    const cfg = await loadConfig();
    const queued: string[] = [];
    // Keep a single form import in flight per workspace to avoid request bursts.
    for (const f of cfg.forms.filter(x => x.enabled)) {
      if (isRunActive(await loadFormState(f.id), Date.now())) return { queued: 0, activeFormId: f.id };
    }
    for (const form of cfg.forms) {
      if (!form.enabled || !cfg.pages.some(p => p.id === form.pageId && p.enabled)) continue;
      const st = await loadFormState(form.id);
      if (isRunActive(st, Date.now()) || !shouldSchedule(cfg.intervalMinutes, st.lastAttemptAt, Date.now())) continue;
      if ((await scheduleForm(form)).queued) { queued.push(form.id); break; }
    }
    return { queued: queued.length };
  },
  cronTriggerSettings: { pattern: '* * * * *' },
});
