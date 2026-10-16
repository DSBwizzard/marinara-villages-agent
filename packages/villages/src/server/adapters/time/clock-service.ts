import type { VillageRepository } from "../../domain/models/world-repository.js";
import type { VillageClockRecord, VillageClockView } from "../../../shared/contracts/clock.js";
import { ZonedDate, validTimeZone } from "../../../shared/helpers/zoned-date.js";
import { clockAdministration, type VillageClockAuthority } from "./clock-gate.js";

/** The Engine wall clock is authoritative. Sleep and downtime never require confirmation. */
export function createVillageClock(
  repository: VillageRepository,
  sources = {
    wall: () => Date.now(),
    zone: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
): VillageClockAuthority {
  let zone = sources.zone();
  let cached: VillageClockRecord | null = null;
  let cachedWorld = "";
  let tail: Promise<unknown> = Promise.resolve();
  function serial<T>(fn: () => Promise<T>): Promise<T> {
    const next = tail.then(fn, fn);
    tail = next.catch(() => {});
    return next;
  }
  function view(): VillageClockView {
    // Compatibility for older clients; this version never pauses the village.
    return { revision: cached?.revision ?? 1, timeZone: zone, paused: false, recovery: null };
  }
  async function observeUnlocked(): Promise<VillageClockView> {
    const state = await repository.readAuthority();
    const wall = sources.wall();
    const stored = state.clock;
    const world = JSON.stringify([state.seed, state.setupAt, state.timeZone]);
    if (cachedWorld !== world) cached = null;
    cachedWorld = world;
    zone = validTimeZone(state.timeZone) ? state.timeZone : sources.zone();
    if (!validTimeZone(zone)) throw new Error("The Engine host did not provide a valid timezone.");
    const previous = Math.max(
      stored ? Date.parse(stored.trustedAt) : wall,
      stored && cached?.revision === stored.revision ? Date.parse(cached.trustedAt) : wall,
    );
    const visitedDate = new ZonedDate(previous, zone);
    const key =
      String(visitedDate.getFullYear()).padStart(4, "0") +
      "-" +
      String(visitedDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(visitedDate.getDate()).padStart(2, "0");
    const currentDate = new ZonedDate(wall, zone);
    const currentKey =
      String(currentDate.getFullYear()).padStart(4, "0") +
      "-" +
      String(currentDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(currentDate.getDate()).padStart(2, "0");
    const replayUntilDate =
      currentKey < key
        ? [stored?.replayUntilDate ?? "", cached?.replayUntilDate ?? "", key].sort().at(-1)!
        : (stored?.replayUntilDate ?? "");
    const desired: VillageClockRecord = {
      revision: stored?.revision ?? 1,
      trustedAt: new Date(Math.max(wall, previous)).toISOString(),
      recovery: null,
      replayUntilDate,
      // Retain offsets from an older explicitly accepted recovery; never shift timers now.
      shiftTotalMs: stored?.shiftTotalMs ?? 0,
    };
    if (
      !stored ||
      !state.timeZone ||
      stored.recovery ||
      stored.replayUntilDate !== desired.replayUntilDate ||
      Date.parse(desired.trustedAt) - Date.parse(stored.trustedAt) >= 10_000
    ) {
      let changed = false;
      await clockAdministration(() =>
        repository.mutateAuthority((current) => {
          if (
            current.seed !== state.seed ||
            current.setupAt !== state.setupAt ||
            current.timeZone !== state.timeZone ||
            JSON.stringify(current.clock) !== JSON.stringify(stored)
          ) {
            changed = true;
            return;
          }
          current.timeZone ||= zone;
          current.clock = desired;
        }),
      );
      if (changed) {
        cached = null;
        return observeUnlocked();
      }
      const fresh = await repository.readAuthority();
      if (JSON.stringify(fresh.clock) !== JSON.stringify(desired)) {
        cached = null;
        return observeUnlocked();
      }
    }
    cached = desired;
    return view();
  }
  return {
    observe: () => serial(observeUnlocked),
    commit: (work) =>
      serial(async () => {
        await observeUnlocked();
        return work();
      }),
    now: () => new ZonedDate(sources.wall(), zone),
    shiftMs: () => cached?.shiftTotalMs ?? 0,
    // An older open client may still submit this request. It is harmless and idempotent.
    resolve: () => serial(observeUnlocked),
  };
}
