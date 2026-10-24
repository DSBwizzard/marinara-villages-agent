import { calendarDate, calendarAt, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { CapabilityLanguageModelCompletion } from "@marinara-engine/shared";
import type { WishActivity, WishAttempt } from "../models/wish-types.js";
import type { VillageState, VillageVillager, VillageWish } from "../models/world.js";
import { flexibleAgendaBlock } from "./agenda-flexibility.js";
import { agendaBlocksFor, agendaDateKey, flexibleAgendaInterval } from "./agenda-week.js";
import { canOccupyZone, venueZones, zoneClosed } from "./venue-zones.js";
import { zoneActivityFits } from "./venue-presence.js";
import { venueResidentIds } from "./venue-model.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";
import { wishExpired } from "./wish-definition.js";
import { sceneWishProtected } from "./scene-wish-protection.js";
import { recordWishOutcome, removeWishActivities, shortWishText, routineRevision } from "./wish-policy.js";

export function expireResidentWishes(resident: VillageVillager, now: Date, state?: VillageState): void {
  if (!resident.agenda) return;
  resident.agenda.wishes = resident.agenda.wishes.filter((wish) => {
    if (!wishExpired(wish, now.getTime()) || (state && sceneWishProtected(state, resident.characterId, wish)))
      return true;
    recordWishOutcome(resident, wish, now.toISOString(), `expired:${wish.id}`, "expired");
    removeWishActivities(resident, wish.id, now);
    return false;
  });
  const today = agendaDateKey(now);
  resident.agenda.wishActivities = (resident.agenda.wishActivities ?? []).filter((entry) => entry.dateKey >= today);
}

export function fulfillResidentWish(
  resident: VillageVillager,
  wishId: string,
  at: string,
  memoryId: string,
): VillageWish | null {
  const wish = resident.agenda?.wishes.find((entry) => entry.id === wishId);
  if (!wish || !resident.agenda) return null;
  recordWishOutcome(resident, wish, at, memoryId, "fulfilled");
  resident.agenda.wishes = resident.agenda.wishes.filter((entry) => entry.id !== wishId);
  removeWishActivities(resident, wishId, new Date(at));
  return wish;
}

export type Slot = {
  dateKey: string;
  startMinute: number;
  endMinute: number;
  venueId: string;
  zoneId?: string;
  activity: string;
};

export function wishSlots(resident: VillageVillager, state: VillageState, now: Date): Slot[] {
  const agenda = resident.agenda;
  if (!agenda) return [];
  const slots: Slot[] = [];
  for (let offset = 0; offset < 7 && slots.length < 8; offset++) {
    const date = calendarDate(now, now.getFullYear(), now.getMonth(), now.getDate() + offset, 12);
    const key = agendaDateKey(date),
      _weekday = VILLAGE_WEEKDAYS[(date.getDay() + 6) % 7]!;
    const minute = offset === 0 ? now.getHours() * 60 + now.getMinutes() : -1;
    const blocks = agendaBlocksFor(agenda, resident.ingestSchedule !== false, date);
    const opportunities = blocks.flatMap((entry) => {
      if (!flexibleAgendaBlock(entry)) return [];
      const result: typeof blocks = [];
      let start = Math.max(entry.startMinute, Math.ceil((minute + 1) / 30) * 30);
      while (start + 30 <= entry.endMinute) {
        const end = Math.min(entry.endMinute, start + 60);
        result.push({ ...entry, startMinute: start, endMinute: end });
        start = end;
      }
      return result;
    });
    for (const block of opportunities) {
      if (
        [...(agenda.wishActivities ?? []), ...(agenda.socialActivities ?? [])].some(
          (entry) =>
            entry.dateKey === key && entry.startMinute < block.endMinute && entry.endMinute > block.startMinute,
        )
      )
        continue;
      if (
        block.venueId &&
        !state.venues.some((venue) => venue.id === block.venueId && venue.constructionStatus !== "worksite")
      )
        continue;
      slots.push({
        dateKey: key,
        startMinute: block.startMinute,
        endMinute: block.endMinute,
        venueId: block.venueId,
        zoneId: block.zoneId,
        activity: block.activity,
      });
      if (slots.length >= 8) break;
    }
  }
  return slots;
}

export function proposalActivity(
  raw: Record<string, unknown>,
  wish: VillageWish,
  slots: Slot[],
  resident: VillageVillager,
  state: VillageState,
): WishActivity | undefined {
  const slot = Number.isInteger(raw.slot) ? slots[(raw.slot as number) - 1] : undefined;
  if (!slot || !shortWishText(raw.activity, 240) || !resident.agenda) return undefined;
  const venueId = typeof raw.venueId === "string" ? raw.venueId : slot.venueId;
  let zoneId = typeof raw.zoneId === "string" ? raw.zoneId : slot.zoneId;
  if (venueId) {
    const venue = state.venues.find((entry) => entry.id === venueId);
    if (!venue || venue.constructionStatus === "worksite") return undefined;
    const zone =
      venueZones(venue).find((entry) => entry.id === zoneId) ??
      (zoneId ? undefined : venueZones(venue).find((entry) => entry.kind === "exterior"));
    if (
      !zone ||
      !canOccupyZone(venue, zone, resident.characterId, {
        relationships: state.relationshipContext,
        at: calendarAt(state.timeZone ? new ZonedDate(0, state.timeZone) : new Date(0), slot.dateKey, slot.startMinute),
      }) ||
      zoneClosed(state, venue, zone)
    )
      return undefined;
    zoneId = zone.id;
  } else zoneId = undefined;
  return {
    ...slot,
    venueId,
    zoneId,
    wishId: wish.id,
    activity: shortWishText(raw.activity, 240),
    baseRevision: routineRevision(resident.agenda),
  };
}

export function canApplyWishActivity(
  activity: WishActivity,
  resident: VillageVillager,
  state: VillageState,
  now: Date,
): boolean {
  if (!resident.agenda) return false;
  const today = agendaDateKey(now),
    minute = now.getHours() * 60 + now.getMinutes();
  if (activity.dateKey < today || (activity.dateKey === today && activity.startMinute <= minute)) return false;
  const date = calendarAt(now, activity.dateKey, 720);
  if (!flexibleAgendaInterval(agendaBlocksFor(resident.agenda, false, date), activity.startMinute, activity.endMinute))
    return false;
  if (activity.venueId) {
    const venue = state.venues.find((entry) => entry.id === activity.venueId),
      zone = venue && venueZones(venue).find((entry) => entry.id === activity.zoneId);
    if (
      !venue ||
      !zone ||
      venue.constructionStatus === "worksite" ||
      !canOccupyZone(venue, zone, resident.characterId, {
        relationships: state.relationshipContext,
        at: calendarAt(now, activity.dateKey, activity.startMinute),
      }) ||
      zoneClosed(state, venue, zone)
    )
      return false;
  }
  const destination =
    activity.venueId || state.venues.find((venue) => venueResidentIds(venue).includes(resident.characterId))?.id;
  return (
    !destination ||
    zoneActivityFits(
      state,
      [resident.characterId],
      destination,
      activity.zoneId ?? "exterior",
      activity.startMinute,
      activity.endMinute,
      date,
    )
  );
}

export function recordUsage(
  job: WishAttempt,
  completion: CapabilityLanguageModelCompletion | null,
  elapsedMs: number,
): void {
  const usage = (
    completion as unknown as {
      usage?: { promptTokens?: number; completionTokens?: number; inputTokens?: number; outputTokens?: number };
    }
  )?.usage;
  job.elapsedMs += elapsedMs;
  const input = usage?.inputTokens ?? usage?.promptTokens,
    output = usage?.outputTokens ?? usage?.completionTokens;
  job.inputTokens =
    typeof input === "number" && (job.calls === 1 || job.inputTokens !== null) ? (job.inputTokens ?? 0) + input : null;
  job.outputTokens =
    typeof output === "number" && (job.calls === 1 || job.outputTokens !== null)
      ? (job.outputTokens ?? 0) + output
      : null;
}
