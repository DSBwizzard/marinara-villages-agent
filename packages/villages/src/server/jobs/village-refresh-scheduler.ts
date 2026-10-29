import { copyDate } from "../../shared/helpers/zoned-date.js";
import { VILLAGE_ACTIVITY_POLICY } from "../../shared/helpers/activity-policy.js";
import { createActivationBinding } from "../adapters/engine/activation-scope.js";
import { villagesLogger } from "../adapters/engine/runtime-host.js";
import { onVillageClockAdvance, villageNow } from "../adapters/time/clock-gate.js";
import type { VillageState } from "../domain/models/world.js";
import { agendaBlocksFor } from "../domain/rules/agenda-week.js";
import { nextEventAttemptAt } from "../domain/rules/event-attempts.js";
import { nextClockChangeAt } from "../domain/rules/village-clock.js";
import { readVillageAuthority } from "../features/world/village-store.js";
import { reconcileVillage } from "../features/world/village.js";
import { hasVillagePresence } from "./background-work.js";

// Villages — arm one unreferenced wake for the next meaningful deadline.
//
// This timer is an optimization while Marinara is already running. Durable
// time comes from `simulatedThrough`; after shutdown the same reconciliation
// resumes from that instant when the package opens again.

export const REFRESH_MIN_DELAY_MS = 1_000;
export const REFRESH_SETTLE_MS = 250;
export const REFRESH_MAX_DELAY_MS = 24 * 60 * 60_000;
const refreshBinding = createActivationBinding<() => void>("Village refresh scheduler is not running.");

/** Re-arm the activation's existing timer after activity settings, presence or work changes. */
export function requestVillageRefresh(): void {
  refreshBinding.maybe()?.();
}

function localMinuteDeadline(now: Date, minute: number): number {
  const deadline = copyDate(now);
  deadline.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
  if (deadline.getTime() <= now.getTime()) deadline.setDate(deadline.getDate() + 1);
  return deadline.getTime();
}

/**
 * Find the next schedule, atmosphere, Wish or move deadline. The
 * calculation is exact to the stored minute and never replays every minute in
 * between.
 */
export function villageSchedulerDelayMs(
  now: Date,
  village?: Pick<VillageState, "villagers" | "residences"> & Partial<VillageState>,
  activityNotBefore = Number.NEGATIVE_INFINITY,
): number {
  if (!Number.isFinite(now.getTime())) return REFRESH_MAX_DELAY_MS;
  const deadlines = [nextClockChangeAt(now).getTime()];
  if (village?.backgroundPace) {
    const activity = nextEventAttemptAt(village as VillageState, now);
    if (activity !== null && activityNotBefore !== Number.POSITIVE_INFINITY)
      deadlines.push(activity > now.getTime() ? activity : Math.max(now.getTime(), activityNotBefore));
  }
  for (const villager of village?.villagers ?? []) {
    for (const row of villager.agenda ? agendaBlocksFor(villager.agenda, villager.ingestSchedule !== false, now) : []) {
      deadlines.push(localMinuteDeadline(now, row.startMinute), localMinuteDeadline(now, row.endMinute));
    }
  }
  for (const residence of village?.residences ?? []) {
    if (residence.status !== "moving") continue;
    const completesAt = Date.parse(residence.completesAt ?? "");
    if (Number.isFinite(completesAt) && completesAt > now.getTime()) deadlines.push(completesAt);
  }
  const next = Math.min(...deadlines);
  const delay = next - now.getTime() + REFRESH_SETTLE_MS;
  if (!Number.isFinite(delay)) return REFRESH_MAX_DELAY_MS;
  return Math.min(Math.max(delay, REFRESH_MIN_DELAY_MS), REFRESH_MAX_DELAY_MS);
}

export function startVillageRefreshScheduler(
  options: { delayMs?: (now: Date, village: VillageState) => number } = {},
): () => void {
  const delayMs = options.delayMs ?? villageSchedulerDelayMs;
  let stopped = false;
  let running = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let armRevision = 0;
  let lastActivityCheckAt = Number.NEGATIVE_INFINITY;

  const arm = (delay: number) => {
    if (stopped) return;
    timer = setTimeout(() => {
      timer = null;
      void wake();
    }, delay);
    timer.unref?.();
  };

  const armNext = async () => {
    if (stopped) return;
    const revision = ++armRevision;
    if (timer) clearTimeout(timer);
    timer = null;
    try {
      const village = await readVillageAuthority();
      if (stopped || revision !== armRevision) return;
      const now = villageNow();
      const activityNotBefore = hasVillagePresence()
        ? lastActivityCheckAt + VILLAGE_ACTIVITY_POLICY[village.backgroundPace].intervalMs
        : Number.POSITIVE_INFINITY;
      arm(options.delayMs ? delayMs(now, village) : villageSchedulerDelayMs(now, village, activityNotBefore));
    } catch (error) {
      villagesLogger().warn("[villages] could not read the next village deadline: %s", String(error));
      if (!stopped && revision === armRevision) arm(REFRESH_MAX_DELAY_MS);
    }
  };

  const wake = async () => {
    if (!stopped && !running) {
      running = true;
      try {
        lastActivityCheckAt = villageNow().getTime();
        await reconcileVillage();
      } catch (error) {
        villagesLogger().warn("[villages] could not reconcile village time: %s", String(error));
      } finally {
        running = false;
      }
    }
    await armNext();
  };

  const unsubscribe = onVillageClockAdvance(() => {
    lastActivityCheckAt = Number.NEGATIVE_INFINITY;
    void armNext();
  });
  const releaseRefresh = refreshBinding.configure(() => {
    lastActivityCheckAt = Number.NEGATIVE_INFINITY;
    void armNext();
  });
  void armNext();
  villagesLogger().debug("[villages] Continuous village reconciliation started");

  return () => {
    stopped = true;
    releaseRefresh();
    unsubscribe();
    if (timer) clearTimeout(timer);
    timer = null;
  };
}
