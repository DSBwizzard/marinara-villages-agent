import { openingPresence } from "./opening-presence.js";
import { zoneActivityFits } from "./venue-presence.js";
import { hashString } from "./village-clock.js";
import { calendarAt } from "../../../shared/helpers/zoned-date.js";
import { flexibleAgendaBlock } from "./agenda-flexibility.js";
import type { SocialPlan } from "../models/relationship-types.js";
import type { VillageState } from "../models/world.js";
import { agendaBlocksFor, agendaDateKey } from "./agenda-week.js";
import { relationshipZoneController } from "./relationship-rules.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { canOccupyZone, resolveVenueZone, venueZones, zoneClosed } from "./venue-zones.js";
import { routineRevision, routineRevisionMatches } from "./wish-policy.js";

export function canEnter(
  village: VillageState,
  venueId: string,
  zoneId: string,
  actorId: string,
  at = new Date(),
): boolean {
  const venue = village.venues.find((place) => place.id === venueId),
    zone = venue && resolveVenueZone(venue, zoneId);
  if (venue?.access)
    return (
      !!zone &&
      evaluateZoneAccess(venue, zone, actorId, {
        at,
        relationships: village.relationshipContext,
        unavailable: !!zone && zoneClosed(village, venue, zone),
      }).allowed
    );
  return (
    !!venue &&
    !!zone &&
    !zoneClosed(village, venue, zone) &&
    (canOccupyZone(venue, zone, actorId) ||
      !!relationshipZoneController(village.relationshipContext, village, venue, zone, actorId))
  );
}
export function socialPlanValid(
  village: VillageState,
  plan: SocialPlan,
  now = new Date(),
  requireFuture = true,
): boolean {
  if (
    plan.status !== "planned" ||
    plan.dateKey !== agendaDateKey(now) ||
    !plan.actorIds.length ||
    plan.actorIds.includes("player") ||
    plan.actorIds.some((id) => !!openingPresence(village, id)) ||
    plan.actorIds.length !== (plan.kind === "meeting" ? 2 : 1)
  )
    return false;
  const minute = now.getHours() * 60 + now.getMinutes();
  if (
    plan.startMinute < 0 ||
    plan.endMinute > 1440 ||
    plan.startMinute >= plan.endMinute ||
    (requireFuture && plan.startMinute <= minute)
  )
    return false;
  if (
    (village.relationshipContext?.socialPlans ?? []).some(
      (other) =>
        other.id !== plan.id &&
        other.status === "planned" &&
        other.dateKey === plan.dateKey &&
        other.startMinute < plan.endMinute &&
        other.endMinute > plan.startMinute &&
        other.actorIds.some((id) => plan.actorIds.includes(id)),
    )
  )
    return false;
  return (
    zoneActivityFits(village, plan.actorIds, plan.venueId, plan.zoneId, plan.startMinute, plan.endMinute, now) &&
    plan.actorIds.every((actorId) => {
      const actor = village.villagers.find((person) => person.characterId === actorId),
        agenda = actor?.agenda;
      if (
        !agenda ||
        !canEnter(village, plan.venueId, plan.zoneId, actorId, calendarAt(now, plan.dateKey, plan.startMinute))
      )
        return false;
      const blocks = agendaBlocksFor({ ...agenda, socialActivities: [] }, actor!.ingestSchedule !== false, now);
      let covered = plan.startMinute;
      for (const block of blocks.filter(
        (entry) => entry.endMinute > plan.startMinute && entry.startMinute < plan.endMinute,
      )) {
        if (block.startMinute > covered || !flexibleAgendaBlock(block)) return false;
        covered = Math.max(covered, block.endMinute);
      }
      return covered >= plan.endMinute;
    })
  );
}
/** Feasibility candidates are not character preferences. System chooses a plan or no change. */
export function socialPlanCandidates(village: VillageState, now = new Date()): SocialPlan[] {
  const state = village.relationshipContext,
    dateKey = agendaDateKey(now);
  if (!state || village.backgroundPace === "off" || state.applied["social-plan-date:" + dateKey]) return [];
  const minute = now.getHours() * 60 + now.getMinutes(),
    result: SocialPlan[] = [];
  const residents = village.villagers.filter(
    (resident) => resident.agenda && !openingPresence(village, resident.characterId),
  );
  const groups = residents.flatMap((resident, index) => [
    { kind: "avoidance" as const, actors: [resident] },
    ...residents.slice(index + 1).map((other) => ({ kind: "meeting" as const, actors: [resident, other] })),
  ]);
  for (const group of groups) {
    const actorIds = group.actors.map((actor) => actor.characterId);
    const blocks = group.actors.map((actor) =>
      agendaBlocksFor({ ...actor.agenda!, socialActivities: [] }, actor.ingestSchedule !== false, now).filter(
        flexibleAgendaBlock,
      ),
    );
    for (const first of blocks[0] ?? [])
      for (const second of blocks[1] ?? [first]) {
        const startMinute = Math.max(first.startMinute, second.startMinute, minute + 15);
        const endMinute = Math.min(first.endMinute, second.endMinute, startMinute + 60);
        if (endMinute - startMinute < 30) continue;
        for (const venue of village.venues)
          for (const zone of venueZones(venue)) {
            if (
              zone.kind === "exterior" ||
              !actorIds.every((actorId) =>
                canEnter(village, venue.id, zone.id, actorId, calendarAt(now, dateKey, startMinute)),
              )
            )
              continue;
            if (group.kind === "avoidance" && venue.id === first.venueId && zone.id === first.zoneId) continue;
            const plan: SocialPlan = {
              id: [village.seed, "social-plan", dateKey, group.kind, ...actorIds, venue.id, zone.id, startMinute].join(
                ":",
              ),
              dateKey,
              actorIds,
              venueId: venue.id,
              zoneId: zone.id,
              startMinute,
              endMinute,
              kind: group.kind,
              status: "planned",
              activity: group.kind === "meeting" ? "Optional shared time" : "Optional quiet time",
              reason: "Available opportunity; character choice requires System",
              revisions: Object.fromEntries(
                group.actors.map((actor) => [actor.characterId, routineRevision(actor.agenda!)]),
              ),
            };
            if (socialPlanValid(village, plan, now)) result.push(plan);
          }
      }
  }
  // Rotate bounded coverage without interpreting scores or choosing a preferred destination.
  return [...new Map(result.map((plan) => [plan.id, plan])).values()]
    .sort((a, b) => hashString(a.id) - hashString(b.id))
    .slice(0, 6);
}
export function projectSocialActivities(village: VillageState, now = new Date()): void {
  for (const resident of village.villagers) if (resident.agenda) resident.agenda.socialActivities = [];
  for (const plan of village.relationshipContext?.socialPlans ?? []) {
    if (
      !socialPlanValid(village, plan.status === "completed" ? { ...plan, status: "planned" } : plan, now, false) ||
      village.backgroundPace === "off"
    )
      continue;
    for (const actorId of plan.actorIds) {
      const resident = village.villagers.find((person) => person.characterId === actorId)!;
      resident.agenda!.socialActivities!.push({
        ...plan,
        wishId: plan.id,
        baseRevision: plan.revisions[actorId]!,
      });
    }
  }
}
export function reconcileSocialPlans(village: VillageState, now = new Date()): void {
  const minute = now.getHours() * 60 + now.getMinutes();
  for (const plan of village.relationshipContext?.socialPlans ?? []) {
    if (plan.status !== "planned") continue;
    if (
      plan.dateKey !== agendaDateKey(now) ||
      plan.endMinute <= minute ||
      village.backgroundPace === "off" ||
      !socialPlanValid(village, plan, now, false)
    )
      plan.status = "cancelled";
  }
}
export function socialContinuationValid(
  village: VillageState,
  id: string,
  saved: SocialPlan | undefined,
  now = new Date(),
): boolean {
  const plan = village.relationshipContext
    ? village.relationshipContext.socialPlans.find((row) => row.id === id)
    : saved;
  const minute = now.getHours() * 60 + now.getMinutes();
  if (
    !plan ||
    plan.id !== id ||
    plan.actorIds.some((actorId) => !!openingPresence(village, actorId)) ||
    plan.status !== "planned" ||
    plan.dateKey !== agendaDateKey(now) ||
    plan.startMinute > minute ||
    plan.endMinute <= minute
  )
    return false;
  if (village.relationshipContext) return socialPlanValid(village, plan, now, false);
  const venue = village.venues.find((place) => place.id === plan.venueId),
    zone = venue && resolveVenueZone(venue, plan.zoneId);
  return (
    !!venue &&
    !!zone &&
    !zoneClosed(village, venue, zone) &&
    plan.actorIds.every((id) => {
      const person = village.villagers.find((actor) => actor.characterId === id);
      return !!person?.agenda && routineRevisionMatches(person.agenda, plan.revisions[id]!);
    })
  );
}
