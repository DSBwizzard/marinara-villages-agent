import type { SocialPlan } from "../models/relationship-types.js";
import type { VillageState } from "../models/world.js";
import { agendaBlocksFor, agendaDateKey } from "./agenda-week.js";
import { relationshipFor, relationshipZoneController } from "./relationship-rules.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { canOccupyZone, resolveVenueZone, venueZones, zoneClosed } from "./venue-zones.js";
import { routineRevision } from "./wish-policy.js";

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
  return plan.actorIds.every((actorId) => {
    const actor = village.villagers.find((person) => person.characterId === actorId),
      agenda = actor?.agenda;
    if (
      !agenda ||
      !canEnter(
        village,
        plan.venueId,
        plan.zoneId,
        actorId,
        new Date(new Date(plan.dateKey + "T00:00:00").setMinutes(plan.startMinute)),
      )
    )
      return false;
    const blocks = agendaBlocksFor({ ...agenda, socialActivities: [] }, actor!.ingestSchedule !== false, now);
    let covered = plan.startMinute;
    for (const block of blocks.filter(
      (entry) => entry.endMinute > plan.startMinute && entry.startMinute < plan.endMinute,
    )) {
      if (block.startMinute > covered || !block.flexible || block.status === "offline" || block.status === "dnd")
        return false;
      covered = Math.max(covered, block.endMinute);
    }
    return covered >= plan.endMinute;
  });
}
export function socialPlanCandidates(village: VillageState, now = new Date()): SocialPlan[] {
  const state = village.relationshipContext,
    dateKey = agendaDateKey(now);
  if (!state || village.storyPace === "off" || state.applied[`social-plan-date:${dateKey}`]) return [];
  const result: SocialPlan[] = [],
    minute = now.getHours() * 60 + now.getMinutes();
  for (let first = 0; first < village.villagers.length; first++)
    for (let second = first + 1; second < village.villagers.length; second++) {
      const a = village.villagers[first]!,
        b = village.villagers[second]!;
      if (!a.agenda || !b.agenda) continue;
      const ab = relationshipFor(state, a.characterId, b.characterId),
        ba = relationshipFor(state, b.characterId, a.characterId);
      const meeting = ab.warmth >= 25 && ba.warmth >= 25;
      const avoiding = ab.warmth <= -25 ? a : ba.warmth <= -25 ? b : null;
      if (!meeting && !avoiding) continue;
      const aBlocks = agendaBlocksFor({ ...a.agenda, socialActivities: [] }, a.ingestSchedule !== false, now);
      const bBlocks = agendaBlocksFor({ ...b.agenda, socialActivities: [] }, b.ingestSchedule !== false, now);
      for (const left of aBlocks)
        for (const right of bBlocks) {
          if (
            !left.flexible ||
            !right.flexible ||
            [left.status, right.status].some((status) => status === "dnd" || status === "offline")
          )
            continue;
          const startMinute = Math.max(left.startMinute, right.startMinute, minute + 15),
            endMinute = Math.min(left.endMinute, right.endMinute, startMinute + 60);
          if (endMinute - startMinute < 30 || (!meeting && left.venueId !== right.venueId)) continue;
          const actorIds = meeting ? [a.characterId, b.characterId] : [avoiding!.characterId];
          const location = village.venues
            .flatMap((venue) => venueZones(venue).map((zone) => ({ venue, zone })))
            .find(
              ({ venue, zone }) =>
                (meeting || venue.id !== left.venueId) &&
                zone.kind !== "exterior" &&
                actorIds.every((actorId) =>
                  canEnter(
                    village,
                    venue.id,
                    zone.id,
                    actorId,
                    new Date(new Date(dateKey + "T00:00:00").setMinutes(startMinute)),
                  ),
                ),
            );
          if (!location) continue;
          const plan: SocialPlan = {
            id: `${village.seed}:social-plan:${dateKey}:${actorIds.join(":")}`,
            dateKey,
            actorIds,
            venueId: location.venue.id,
            zoneId: location.zone.id,
            startMinute,
            endMinute,
            activity: meeting
              ? `Spending time with ${a.cardSnapshot.name} and ${b.cardSnapshot.name}`
              : "Taking some quiet time elsewhere",
            reason: meeting ? "Enjoying a shared break" : "Choosing some distance",
            revisions: Object.fromEntries(
              actorIds.map((actorId) => [
                actorId,
                routineRevision(village.villagers.find((person) => person.characterId === actorId)!.agenda!),
              ]),
            ),
            kind: meeting ? "meeting" : "avoidance",
            status: "planned",
          };
          if (socialPlanValid(village, plan, now)) result.push(plan);
          break;
        }
      if (result.length >= 6) return result.slice(0, 6);
    }
  return [...new Map(result.map((plan) => [plan.id, plan])).values()].slice(0, 6);
}
export function projectSocialActivities(village: VillageState, now = new Date()): void {
  for (const resident of village.villagers) if (resident.agenda) resident.agenda.socialActivities = [];
  for (const plan of village.relationshipContext?.socialPlans ?? []) {
    if (
      !socialPlanValid(village, plan.status === "completed" ? { ...plan, status: "planned" } : plan, now, false) ||
      village.storyPace === "off"
    )
      continue;
    for (const actorId of plan.actorIds) {
      const resident = village.villagers.find((person) => person.characterId === actorId)!;
      resident.agenda!.socialActivities!.push({
        ...plan,
        wishId: plan.id,
        baseRevision: plan.revisions[actorId]!,
        reason: plan.reason,
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
      village.storyPace === "off" ||
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
      return !!person?.agenda && routineRevision(person.agenda) === plan.revisions[id];
    })
  );
}
