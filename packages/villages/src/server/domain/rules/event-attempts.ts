import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { VillageState } from "../models/world.js";
import { localDateKey, planningAllowance } from "./resident-planning.js";

export type EventAttemptLedger = {
  highWaterDate: string;
  lastAttemptAt: string;
  attempts: { id: string; date: string; at: string }[];
};
export const emptyEventAttempts = (): EventAttemptLedger => ({ highWaterDate: "", lastAttemptAt: "", attempts: [] });
export function eventAttemptAvailable(state: VillageState, date: string, now: number): boolean {
  const ledger = state.eventAttempts ?? emptyEventAttempts();
  return (
    date ===
      localDateKey(
        new ZonedDate(new Date(now).toISOString(), state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone),
      ) &&
    date >= ledger.highWaterDate &&
    planningAllowance(state.backgroundPace, state.seed, date) >
      ledger.attempts.filter((row) => row.date === date).length &&
    (!ledger.lastAttemptAt || now - Date.parse(ledger.lastAttemptAt) >= 15 * 60_000)
  );
}
/** Durable pre-dispatch reservation; failure, no action and unknown outcomes never refund it. */
export function reserveEventAttempt(state: VillageState, id: string, date: string, now: number): void {
  const ledger = (state.eventAttempts ??= emptyEventAttempts());
  if (ledger.attempts.some((row) => row.id === id)) return;
  if (!eventAttemptAvailable(state, date, now)) throw new Error("Automatic resident activity budget is unavailable.");
  ledger.highWaterDate = date;
  ledger.lastAttemptAt = new Date(now).toISOString();
  ledger.attempts.push({ id, date, at: ledger.lastAttemptAt });
  // Retain the current day and a small audit window; highWaterDate prevents replay of retired days.
  ledger.attempts = ledger.attempts.filter((row) => row.date >= date.slice(0, 7) + "-01");
}
