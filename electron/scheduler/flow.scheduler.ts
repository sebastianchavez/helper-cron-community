/**
 * Flow scheduler – runs enabled flows on their configured schedule.
 * Uses setInterval to check every 30 seconds which flows should run.
 */

import { listEnabledFlows, FlowRow } from '../db/flow.repository';
import { executeFlowFromDb, showFlowNotification } from '../executor/flow.executor';

/** Map of flowId → last execution timestamp (Date.now()) */
const lastRunMap = new Map<string, number>();

/** Map of flowId → flag to prevent concurrent execution */
const runningMap = new Map<string, boolean>();

let schedulerTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Start the scheduler. Call after app is ready and DB is initialized.
 */
export function startFlowScheduler(): void {
  if (schedulerTimer) return; // already running

  console.log('[SCHEDULER] Starting flow scheduler (tick every 30s)');

  // Run an initial tick, then every 30 seconds
  schedulerTick();
  schedulerTimer = setInterval(schedulerTick, 30_000);
}

/**
 * Stop the scheduler (call before app quit).
 */
export function stopFlowScheduler(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  console.log('[SCHEDULER] Stopped');
}

/**
 * Force re-check (e.g. after a flow is saved/enabled).
 * Clears last-run timestamps so the next tick picks up changes immediately.
 */
export function refreshScheduler(): void {
  lastRunMap.clear();
  console.log('[SCHEDULER] Refreshed');
}

async function schedulerTick(): Promise<void> {
  try {
    const flows = listEnabledFlows();
    const now = new Date();

    for (const flow of flows) {
      if (runningMap.get(flow.id)) continue; // still executing

      if (shouldRun(flow, now)) {
        runningMap.set(flow.id, true);
        lastRunMap.set(flow.id, Date.now());

        console.log(`[SCHEDULER] Triggering flow: "${flow.name}" (${flow.id})`);

        // Run asynchronously – don't block the tick
        executeFlowFromDb(flow)
          .then(result => {
            console.log(`[SCHEDULER] Flow "${flow.name}" finished: ${result.success ? 'OK' : 'FAIL'}`);
            showFlowNotification(result);
          })
          .catch(err => {
            console.error(`[SCHEDULER] Flow "${flow.name}" crashed:`, err);
            showFlowNotification({
              success: false,
              flowName: flow.name,
              logs: [],
              error: err?.message || 'Unknown error',
            });
          })
          .finally(() => {
            runningMap.set(flow.id, false);
          });
      }
    }
  } catch (err) {
    console.error('[SCHEDULER] Tick error:', err);
  }
}

/**
 * Determine if a flow should run at this moment.
 */
function shouldRun(flow: FlowRow, now: Date): boolean {
  const scheduleType = flow.schedule_type || 'interval';

  if (scheduleType === 'interval') {
    return shouldRunInterval(flow, now);
  } else {
    return shouldRunSpecificTime(flow, now);
  }
}

function shouldRunInterval(flow: FlowRow, now: Date): boolean {
  const value = flow.interval_value || 30;
  const unit = flow.interval_unit || 'minutes';

  let intervalMs: number;
  switch (unit) {
    case 'minutes': intervalMs = value * 60_000; break;
    case 'hours':   intervalMs = value * 3_600_000; break;
    case 'days':    intervalMs = value * 86_400_000; break;
    default:        intervalMs = value * 60_000;
  }

  const lastRun = lastRunMap.get(flow.id);
  if (!lastRun) {
    // First tick after scheduler start – use last_run_at from DB if available
    if (flow.last_run_at) {
      const dbLast = new Date(flow.last_run_at).getTime();
      lastRunMap.set(flow.id, dbLast);
      return (now.getTime() - dbLast) >= intervalMs;
    }
    // Never ran – run now
    return true;
  }

  return (now.getTime() - lastRun) >= intervalMs;
}

function shouldRunSpecificTime(flow: FlowRow, now: Date): boolean {
  // Check if today's day is selected
  const days: { [key: string]: boolean } = JSON.parse(
    flow.selected_days || '{"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":false,"sun":false}'
  );

  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayKey = dayKeys[now.getDay()];

  if (!days[todayKey]) return false;

  // Check time (HH:MM)
  const [targetH, targetM] = (flow.specific_time || '09:00').split(':').map(Number);
  const nowH = now.getHours();
  const nowM = now.getMinutes();

  // Match within a 1-minute window (since we tick every 30s)
  if (nowH !== targetH || nowM !== targetM) return false;

  // Ensure we only fire once per scheduled minute
  const lastRun = lastRunMap.get(flow.id);
  if (lastRun) {
    const elapsed = now.getTime() - lastRun;
    if (elapsed < 60_000) return false; // already fired this minute
  }

  return true;
}
