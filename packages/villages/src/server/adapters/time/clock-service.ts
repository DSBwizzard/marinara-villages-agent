import type { VillageRepository } from "../../domain/models/world-repository.js";
import type { VillageClockRecord, VillageClockView } from "../../../shared/contracts/clock.js";
import { ZonedDate, validTimeZone } from "../../../shared/helpers/zoned-date.js";
import { clockAdministration, type VillageClockAuthority } from "./clock-gate.js";
import { badRequest, conflict } from "../../domain/rules/errors.js";

// Keep a month inside the four-digit calendar for agenda planning and ordinary ticks.
const MAX_VILLAGE_INSTANT = Date.UTC(9999, 10, 30);

/** Wall time plus a durable development advance. Operational clocks remain on the host. */
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
  const listeners = new Set<() => void>();
  function serial<T>(fn: () => Promise<T>): Promise<T> {
    const next = tail.then(fn, fn);
    tail = next.catch(() => {});
    return next;
  }
  function view(): VillageClockView {
    // Compatibility for older clients; this version never pauses the village.
    return {
      revision: cached?.revision ?? 1,
      timeZone: zone,
      paused: false,
      recovery: null,
      instant: new Date(sources.wall() + (cached?.advanceMs ?? 0)).toISOString(),
      advanceMs: cached?.advanceMs ?? 0,
      worldId: cachedWorld,
      lastAdvanceActionId: cached?.lastAdvance?.actionId,
    };
  }
  async function observeUnlocked(): Promise<VillageClockView> {
    const state = await repository.readAuthority();
    const stored = state.clock;
    const wall = sources.wall() + (stored?.advanceMs ?? 0);
    const world = JSON.stringify([state.seed, state.setupAt]);
    if (cachedWorld !== world) cached = stored;
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
      ...(stored?.advanceMs !== undefined ? { advanceMs: stored.advanceMs } : {}),
      ...(stored?.lastAdvance ? { lastAdvance: stored.lastAdvance } : {}),
      ...(stored?.advanceReceipts ? { advanceReceipts: stored.advanceReceipts } : {}),
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
        return observeUnlocked();
      }
      const fresh = await repository.readAuthority();
      if (JSON.stringify(fresh.clock) !== JSON.stringify(desired)) {
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
    now: (advanceMs = cached?.advanceMs ?? 0) => new ZonedDate(sources.wall() + advanceMs, zone),
    shiftMs: () => cached?.shiftTotalMs ?? 0,
    onAdvance(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    advanceSettled() {
      for (const listener of listeners) listener();
    },
    advance: (request, effect) =>
      serial(async () => {
        if (
          !request ||
          !Number.isSafeInteger(request.milliseconds) ||
          request.milliseconds <= 0 ||
          !Number.isSafeInteger(request.revision) ||
          typeof request.worldId !== "string" ||
          typeof request.actionId !== "string" ||
          !/^[a-zA-Z0-9-]{1,100}$/.test(request.actionId)
        )
          throw badRequest("Choose a positive duration and refresh the Village clock.");
        await observeUnlocked();
        let advanced = false;
        let committed: VillageClockRecord | null = null;
        await repository.mutateAuthority(
          (state) => {
            advanced = false;
            const clock = state.clock;
            if (JSON.stringify([state.seed, state.setupAt]) !== request.worldId || !clock)
              throw conflict("The Village changed. Refresh its clock before advancing time.");
            if (!state.foundedAt) throw badRequest("Found a Village before advancing time.");
            committed = clock;
            const receipt =
              clock.advanceReceipts?.find((entry) => entry.actionId === request.actionId) ??
              (clock.lastAdvance?.actionId === request.actionId ? clock.lastAdvance : undefined);
            if (receipt) {
              if (receipt.milliseconds !== request.milliseconds)
                throw conflict("This time request already used another duration.");
              return false;
            }
            if (clock.revision !== request.revision)
              throw conflict("Time already changed. Refresh the clock before advancing again.");
            const wall = sources.wall();
            const offset = (clock.advanceMs ?? 0) + request.milliseconds;
            const target = wall + offset;
            if (
              !Number.isSafeInteger(offset) ||
              target > MAX_VILLAGE_INSTANT ||
              !Number.isFinite(target) ||
              !Number.isSafeInteger(clock.revision + 1)
            )
              throw badRequest("That duration exceeds the Village calendar.");
            state.clock = {
              ...clock,
              revision: clock.revision + 1,
              advanceMs: offset,
              trustedAt: new Date(Math.max(target, Date.parse(clock.trustedAt))).toISOString(),
              lastAdvance: { actionId: request.actionId, milliseconds: request.milliseconds },
              advanceReceipts: [
                ...(clock.advanceReceipts ?? []),
                ...(!clock.advanceReceipts?.some((entry) => entry.actionId === clock.lastAdvance?.actionId) &&
                clock.lastAdvance
                  ? [clock.lastAdvance]
                  : []),
                { actionId: request.actionId, milliseconds: request.milliseconds },
              ],
            };
            effect?.(state, new Date(wall + (clock.advanceMs ?? 0)), new Date(target));
            committed = state.clock;
            advanced = true;
          },
          effect ? { memories: true } : undefined,
        );
        if (committed) cached = committed;
        const result = await observeUnlocked();
        if (advanced) for (const listener of listeners) listener();
        return result;
      }),
    // An older open client may still submit this request. It is harmless and idempotent.
    resolve: () => serial(observeUnlocked),
  };
}
