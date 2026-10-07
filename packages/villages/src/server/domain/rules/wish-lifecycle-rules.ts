import type { CapabilityLanguageModelCompletion } from "@marinara-engine/shared";
import type { WishActivity, WishAttempt } from "../models/wish-types.js";
import type { VillageState, VillageVillager, VillageWish } from "../models/world.js";
import { agendaBlocksFor, agendaDateKey, flexibleAgendaInterval } from "./agenda-week.js";
import { canOccupyZone, venueZones, zoneClosed } from "./venue-zones.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";
import { wishExpired } from "./wish-definition.js";
import { recordWishOutcome, removeWishActivities, shortWishText, routineRevision } from "./wish-policy.js";

export function expireResidentWishes(resident: VillageVillager, now: Date): void {
  if (!resident.agenda) return;
  resident.agenda.wishes = resident.agenda.wishes.filter((wish) => {
    if (!wishExpired(wish, now.getTime())) return true;
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
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12);
    const key = agendaDateKey(date),
      _weekday = VILLAGE_WEEKDAYS[(date.getDay() + 6) % 7]!;
    const minute = offset === 0 ? now.getHours() * 60 + now.getMinutes() : -1;
    const blocks = agendaBlocksFor(agenda, resident.ingestSchedule !== false, date);
    const opportunities = blocks.flatMap((entry) => {
      if (!entry.flexible || entry.status === "dnd" || entry.status === "offline") return [];
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
      const from = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, block.startMinute).getTime();
      const through = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, block.endMinute).getTime();
      const work = agenda.projectWork;
      if (work && Date.parse(work.startsAt) < through && Date.parse(work.endsAt) > from) continue;
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
        at: new Date(new Date(slot.dateKey + "T00:00:00").setMinutes(slot.startMinute)),
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
    reason: shortWishText(raw.reason, 240) || "A small personal interest",
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
  const date = new Date(`${activity.dateKey}T12:00:00`);
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
        at: new Date(new Date(activity.dateKey + "T00:00:00").setMinutes(activity.startMinute)),
      }) ||
      zoneClosed(state, venue, zone)
    )
      return false;
  }
  const destination =
    activity.venueId || state.venues.find((venue) => venue.occupancy.residentCharacterId === resident.characterId)?.id;
  const boundaries = new Set([activity.startMinute]);
  const others = state.villagers
    .filter((entry) => entry.characterId !== resident.characterId)
    .map((entry) => ({
      resident: entry,
      blocks: entry.agenda ? agendaBlocksFor(entry.agenda, entry.ingestSchedule !== false, date) : [],
    }));
  for (const other of others)
    for (const entry of other.blocks)
      if (entry.startMinute > activity.startMinute && entry.startMinute < activity.endMinute)
        boundaries.add(entry.startMinute);
  for (const at of boundaries) {
    const occupants = others.filter((other) => {
      const entry = other.blocks.find((part) => part.startMinute <= at && part.endMinute > at);
      return (
        (entry?.venueId ||
          state.venues.find((venue) => venue.occupancy.residentCharacterId === other.resident.characterId)?.id) ===
        destination
      );
    });
    if (destination && occupants.length >= 4) return false;
  }
  return true;
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
