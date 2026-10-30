import type { VillageState } from "../models/world.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { VILLAGE_ACTIVITY_POLICY } from "../../../shared/helpers/activity-policy.js";

export type ActivityLane = "resident" | "world";
export function preferredActivityLane(state: VillageState): ActivityLane {
  const last = state.eventAttempts?.attempts.at(-1)?.origin ?? "resident";
  return last === "resident" ? "world" : "resident";
}
/** Existing accepted arrangements outrank unsolicited material, including a near start. */
export function arrangementActivityAt(state: VillageState, now: Date): number | null {
  const local = new ZonedDate(now, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const until = now.getTime() + VILLAGE_ACTIVITY_POLICY[state.backgroundPace].intervalMs;
  const times = (state.relationshipContext?.socialPlans ?? []).flatMap((plan) => {
    if (plan.kind !== "meeting" || plan.status !== "planned" || !/^\d{4}-\d{2}-\d{2}$/.test(plan.dateKey)) return [];
    const at = new ZonedDate(local, local.zone);
    const [year, month, day] = plan.dateKey.split("-").map(Number);
    at.setFullYear(year!, month! - 1, day!);
    at.setHours(0, plan.startMinute, 0, 0);
    const end = new ZonedDate(at, local.zone);
    end.setHours(0, plan.endMinute, 0, 0);
    if (end.getTime() <= at.getTime()) end.setDate(end.getDate() + 1);
    return end.getTime() > now.getTime() && at.getTime() <= until ? [Math.max(now.getTime(), at.getTime())] : [];
  });
  return times.length ? Math.min(...times) : null;
}
