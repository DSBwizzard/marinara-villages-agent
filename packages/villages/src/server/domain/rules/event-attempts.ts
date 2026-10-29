import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { VILLAGE_ACTIVITY_POLICY } from "../../../shared/helpers/activity-policy.js";
import type { VillageState } from "../models/world.js";
import { localDateKey, planningAllowance } from "./resident-planning.js";

export type EventAttemptLedger = {
  highWaterDate: string;
  lastAttemptAt: string;
  attempts: { id: string; date: string; at: string; batchId?: string }[];
};
export const emptyEventAttempts = (): EventAttemptLedger => ({ highWaterDate: "", lastAttemptAt: "", attempts: [] });
export function activityDate(state: Pick<VillageState, "timeZone">, now: Date): string {
  return localDateKey(new ZonedDate(now, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone));
}

/** Next live admission, not an accrued credit. Catch-up has its own bounded admission window. */
export function nextEventAttemptAt(state: VillageState, now: Date): number | null {
  const policy = VILLAGE_ACTIVITY_POLICY[state.backgroundPace];
  const batch = state.returnCatchup?.batch;
  const date = activityDate(state, now);
  const ledger = state.eventAttempts ?? emptyEventAttempts();
  if (!policy.reviews || !state.setupAt || (batch && !["completed", "cancelled"].includes(batch.status))) return null;
  if (date < ledger.highWaterDate) return null;
  const last = Date.parse(ledger.lastAttemptAt);
  let next = Number.isFinite(last) ? last + policy.intervalMs : now.getTime();
  if (ledger.attempts.filter((row) => row.date === date).length >= policy.reviews) {
    const midnight = new ZonedDate(now, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    next = Math.max(next, midnight.getTime());
  }
  return next;
}
export function eventAttemptAvailable(state: VillageState, date: string, now: number, batchId?: string): boolean {
  const ledger = state.eventAttempts ?? emptyEventAttempts();
  const batch = state.returnCatchup?.batch;
  const active = batch && !["completed", "cancelled"].includes(batch.status);
  if (batchId ? !active || batch.id !== batchId || batch.status !== "running" : active) return false;
  if (batchId && batch?.budgetDate !== undefined && batch.budgetDate !== date) return false;
  if (
    batchId &&
    batch?.opportunityLimit !== undefined &&
    ledger.attempts.filter((row) => row.batchId === batchId).length >= batch.opportunityLimit
  )
    return false;
  return (
    date ===
      localDateKey(
        new ZonedDate(new Date(now).toISOString(), state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone),
      ) &&
    date >= ledger.highWaterDate &&
    planningAllowance(state.backgroundPace, state.seed, date) >
      ledger.attempts.filter((row) => row.date === date).length &&
    (batchId !== undefined ||
      !ledger.lastAttemptAt ||
      now - Date.parse(ledger.lastAttemptAt) >= VILLAGE_ACTIVITY_POLICY[state.backgroundPace].intervalMs)
  );
}
/** Durable pre-dispatch reservation; failure, no action and unknown outcomes never refund it. */
export function reserveEventAttempt(
  state: VillageState,
  id: string,
  date: string,
  now: number,
  batchId?: string,
): void {
  const ledger = (state.eventAttempts ??= emptyEventAttempts());
  if (batchId && (state.returnCatchup?.batch?.id !== batchId || state.returnCatchup.batch.status !== "running"))
    throw new Error("The catch-up batch is no longer active.");
  const existing = ledger.attempts.find((row) => row.id === id);
  if (existing) {
    if (existing.batchId !== batchId) throw new Error("Resident activity reservation belongs to another batch.");
    if (existing.date !== date) throw new Error("Resident activity reservation belongs to another date.");
    return;
  }
  if (!eventAttemptAvailable(state, date, now, batchId))
    throw new Error("Automatic resident activity budget is unavailable.");
  ledger.highWaterDate = date;
  ledger.lastAttemptAt = new Date(now).toISOString();
  ledger.attempts.push({ id, date, at: ledger.lastAttemptAt, ...(batchId ? { batchId } : {}) });
  // Retain the current day and a small audit window; highWaterDate prevents replay of retired days.
  ledger.attempts = ledger.attempts.filter((row) => row.date >= date.slice(0, 7) + "-01");
}
