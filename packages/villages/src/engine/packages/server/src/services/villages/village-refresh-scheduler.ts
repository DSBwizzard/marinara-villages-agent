// Villages — arm one unreferenced wake for the next meaningful deadline.
//
// This timer is an optimization while Marinara is already running. Durable
// time comes from `simulatedThrough`; after shutdown the same reconciliation
// resumes from that instant when the package opens again.
import { villagesLogger } from "./package-runtime.js";
import type { VillageState } from "./types.js";
import { nextClockChangeAt } from "./village-clock.js";
import { agendaBlocksFor } from "./agenda-week.js";
import { readVillageState } from "./village-store.js";
import { reconcileVillage } from "./village.js";

export const REFRESH_MIN_DELAY_MS = 1_000;
export const REFRESH_SETTLE_MS = 250;
export const REFRESH_MAX_DELAY_MS = 24 * 60 * 60_000;

function localMinuteDeadline(now: Date, minute: number): number {
  const deadline = new Date(now);
  deadline.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
  if (deadline.getTime() <= now.getTime()) deadline.setDate(deadline.getDate() + 1);
  return deadline.getTime();
}

/**
 * Find the next schedule, atmosphere, wish, or planned-event deadline. The
 * calculation is exact to the stored minute and never replays every minute in
 * between.
 */
export function villageSchedulerDelayMs(
  now: Date,
  village?: Pick<VillageState, "villagers" | "scheduledEvents" | "residences" | "venueMail">,
): number {
  if (!Number.isFinite(now.getTime())) return REFRESH_MAX_DELAY_MS;
  const deadlines = [nextClockChangeAt(now).getTime()];
  for (const villager of village?.villagers ?? []) {
    for (const row of villager.agenda ? agendaBlocksFor(villager.agenda, villager.ingestSchedule !== false, now) : []) {
      deadlines.push(localMinuteDeadline(now, row.startMinute), localMinuteDeadline(now, row.endMinute));
    }
    for (const wish of villager.agenda?.wishes ?? []) {
      const expiry = Date.parse(wish.expiresAt);
      if (Number.isFinite(expiry) && expiry > now.getTime()) deadlines.push(expiry);
    }
  }
  for (const event of village?.scheduledEvents ?? []) {
    const occursAt = Date.parse(event.occursAt);
    if (Number.isFinite(occursAt) && occursAt > now.getTime()) deadlines.push(occursAt);
  }
  for (const residence of village?.residences ?? []) {
    if (residence.status !== "moving") continue;
    const completesAt = Date.parse(residence.completesAt ?? "");
    if (Number.isFinite(completesAt) && completesAt > now.getTime()) deadlines.push(completesAt);
  }
  for (const mail of village?.venueMail ?? []) {
    if (mail.status !== "awaiting-villagers") continue;
    const dueAt = Date.parse(mail.dueAt);
    if (Number.isFinite(dueAt) && dueAt > now.getTime()) deadlines.push(dueAt);
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
    try {
      const village = await readVillageState();
      arm(delayMs(new Date(), village));
    } catch (error) {
      villagesLogger().warn("[villages] could not read the next village deadline: %s", String(error));
      arm(REFRESH_MAX_DELAY_MS);
    }
  };

  const wake = async () => {
    if (!stopped && !running) {
      running = true;
      try {
        await reconcileVillage();
      } catch (error) {
        villagesLogger().warn("[villages] could not reconcile village time: %s", String(error));
      } finally {
        running = false;
      }
    }
    await armNext();
  };

  void armNext();
  villagesLogger().debug("[villages] Continuous village reconciliation started");

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    timer = null;
  };
}
