import type { VillageState } from "../models/world.js";
import type { VillageClockRecord } from "../../../shared/contracts/clock.js";
export function decodeVillageClock(raw: unknown): VillageClockRecord | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw !== "object") throw new Error("The saved village clock could not be read. Restore it from a backup.");
  if (Array.isArray(raw)) throw new Error("The saved village clock could not be read. Restore it from a backup.");
  const value = raw as Record<string, unknown>;
  if (
    value.advanceMs !== undefined &&
    (!Number.isSafeInteger(value.advanceMs) || Number(value.advanceMs) < 0 || Number(value.advanceMs) > 253402300799999)
  )
    throw new Error("The saved Village time advance could not be read. Restore it from a backup.");
  const lastAdvance = value.lastAdvance as VillageClockRecord["lastAdvance"];
  if (
    lastAdvance !== undefined &&
    (!lastAdvance ||
      typeof lastAdvance.actionId !== "string" ||
      !/^[a-zA-Z0-9-]{1,100}$/.test(lastAdvance.actionId) ||
      !Number.isSafeInteger(lastAdvance.milliseconds) ||
      lastAdvance.milliseconds <= 0)
  )
    throw new Error("The saved Village time request could not be read. Restore it from a backup.");
  if (
    value.shiftTotalMs !== undefined &&
    (typeof value.shiftTotalMs !== "number" || !Number.isSafeInteger(value.shiftTotalMs))
  )
    throw new Error("The saved village clock could not be read. Restore it from a backup.");
  if (
    value.replayUntilDate !== undefined &&
    value.replayUntilDate !== "" &&
    (typeof value.replayUntilDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value.replayUntilDate) ||
      !Number.isFinite(Date.parse(value.replayUntilDate + "T00:00:00Z")) ||
      new Date(value.replayUntilDate + "T00:00:00Z").toISOString().slice(0, 10) !== value.replayUntilDate)
  )
    throw new Error("The saved village clock could not be read. Restore it from a backup.");
  if (
    !Number.isSafeInteger(value.revision) ||
    Number(value.revision) < 1 ||
    typeof value.trustedAt !== "string" ||
    !Number.isFinite(Date.parse(value.trustedAt))
  )
    throw new Error("The saved village clock could not be read. Restore it from a backup.");
  let recovery: VillageClockRecord["recovery"] = null;
  if (value.recovery !== undefined && value.recovery !== null) {
    if (typeof value.recovery !== "object" || Array.isArray(value.recovery))
      throw new Error("The saved village clock recovery could not be read. Restore it from a backup.");
    const r = value.recovery as Record<string, unknown>;
    if (
      !["frozenAt", "expectedAt", "observedAt"].every(
        (key) => typeof r[key] === "string" && Number.isFinite(Date.parse(r[key] as string)),
      ) ||
      typeof r.differenceMs !== "number" ||
      !Number.isFinite(r.differenceMs)
    )
      throw new Error("The saved village clock recovery could not be read. Restore it from a backup.");
    recovery = {
      frozenAt: r.frozenAt as string,
      expectedAt: r.expectedAt as string,
      observedAt: r.observedAt as string,
      differenceMs: r.differenceMs,
    };
  }
  return {
    revision: Number(value.revision),
    trustedAt: value.trustedAt,
    recovery,
    replayUntilDate: typeof value.replayUntilDate === "string" ? value.replayUntilDate : "",
    shiftTotalMs:
      typeof value.shiftTotalMs === "number" && Number.isFinite(value.shiftTotalMs) ? value.shiftTotalMs : 0,
    ...(value.advanceMs !== undefined ? { advanceMs: Number(value.advanceMs) } : {}),
    ...(lastAdvance ? { lastAdvance: { actionId: lastAdvance.actionId, milliseconds: lastAdvance.milliseconds } } : {}),
  };
}
export function calendarReplay(state: VillageState, now: Date): boolean {
  const key =
    String(now.getFullYear()).padStart(4, "0") +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");
  return !!state.clock?.replayUntilDate && key <= state.clock.replayUntilDate;
}
