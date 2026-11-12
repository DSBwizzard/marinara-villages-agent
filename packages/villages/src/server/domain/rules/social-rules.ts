import { ordinaryUseRestricted } from "./narrative-environment.js";
import { zoneActivityFits } from "./venue-presence.js";
import { hashString } from "./village-clock.js";
import { calendarAt, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { flexibleAgendaBlock } from "./agenda-flexibility.js";
import type { SocialPlan } from "../models/resident-plans.js";
import type { VillageState } from "../models/world.js";
import { agendaBlocksFor, agendaDateKey } from "./agenda-week.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { resolveVenueZone, venueZones, zoneClosed } from "./venue-zones.js";
import { routineRevision, routineRevisionMatches } from "./wish-policy.js";
import { projectAgendaReservations } from "./project-focus.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { latestRelationshipScores, relationshipKey } from "./continuity.js";
const localDate = (state: VillageState, at: Date) =>
  new ZonedDate(at, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);

export function canEnter(
  village: VillageState,
  venueId: string,
  zoneId: string,
  actorId: string,
  at = new Date(),
): boolean {
  const venue = village.venues.find((place) => place.id === venueId),
    zone = venue && resolveVenueZone(venue, zoneId);
  if (ordinaryUseRestricted(village.narrative, at.toISOString(), venueId, zoneId)) return false;
  return (
    !!venue &&
    !!zone &&
    evaluateZoneAccess(venue, zone, actorId, {
      at,
      unavailable: zoneClosed(village, venue, zone),
      environment: village.narrative,
    }).allowed
  );
}
export function socialPlanValid(
  village: VillageState,
  plan: SocialPlan,
  now = new Date(),
  requireFuture = true,
): boolean {
  now = localDate(village, now);
  if (
    plan.status !== "planned" ||
    plan.dateKey !== agendaDateKey(now) ||
    plan.actors.length !== (plan.kind === "meeting" ? 2 : 1) ||
    new Set(plan.actors.map((actor) => actor.id)).size !== plan.actors.length ||
    plan.actors.some(
      (actor) =>
        actor.id === "player" ||
        !village.villagers.some(
          (resident) => resident.characterId === actor.id && resident.incarnation === actor.incarnation,
        ),
    )
  )
    return false;
  const minute = now.getHours() * 60 + now.getMinutes();
  if (
    plan.startMinute < 0 ||
    plan.endMinute > 1440 ||
    plan.endMinute - plan.startMinute < 30 ||
    plan.endMinute - plan.startMinute > 60 ||
    (requireFuture && plan.startMinute <= minute)
  )
    return false;
  if (
    village.residentPlans.plans.some(
      (other) =>
        other.id !== plan.id &&
        other.status === "planned" &&
        other.dateKey === plan.dateKey &&
        other.startMinute < plan.endMinute &&
        other.endMinute > plan.startMinute &&
        other.actors.some((actor) => plan.actors.some((party) => party.id === actor.id)),
    )
  )
    return false;
  const projected = {
    ...village,
    villagers: village.villagers.map((resident) => ({
      ...resident,
      agenda: resident.agenda ? { ...resident.agenda } : null,
    })),
  };
  projectAgendaReservations(projected);
  return (
    zoneActivityFits(
      projected,
      plan.actors.map((actor) => actor.id),
      plan.venueId,
      plan.zoneId,
      plan.startMinute,
      plan.endMinute,
      now,
    ) &&
    plan.actors.every(({ id: actorId }) => {
      const actor = village.villagers.find((person) => person.characterId === actorId),
        agenda = actor?.agenda;
      if (!agenda || !routineRevisionMatches(agenda, plan.revisions[actorId]!)) return false;
      for (let atMinute = plan.startMinute; atMinute < plan.endMinute; atMinute++)
        if (!canEnter(village, plan.venueId, plan.zoneId, actorId, calendarAt(now, plan.dateKey, atMinute)))
          return false;
      const blocks = agendaBlocksFor(
        {
          ...agenda,
          reservations: projected.villagers
            .find((resident) => resident.characterId === actorId)
            ?.agenda?.reservations?.filter((reservation) => reservation.id !== plan.id),
        },
        now,
      );
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
  now = localDate(village, now);
  const dateKey = agendaDateKey(now);
  if (village.backgroundPace === "off" || village.residentPlans.selectedDate >= dateKey) return [];
  const projected = {
    ...village,
    villagers: village.villagers.map((resident) => ({
      ...resident,
      agenda: resident.agenda ? { ...resident.agenda } : null,
    })),
  };
  projectAgendaReservations(projected);
  const minute = now.getHours() * 60 + now.getMinutes(),
    result: SocialPlan[] = [];
  const residents = projected.villagers.filter((resident) => resident.agenda);
  const groups = residents.flatMap((resident, index) => [
    { kind: "avoidance" as const, actors: [resident] },
    ...residents.slice(index + 1).map((other) => ({ kind: "meeting" as const, actors: [resident, other] })),
  ]);
  for (const group of groups) {
    const actorIds = group.actors.map((actor) => actor.characterId);
    const blocks = group.actors.map((actor) => agendaBlocksFor(actor.agenda!, now).filter(flexibleAgendaBlock));
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
              id: "",
              dateKey,
              actors: group.actors.map((actor) => ({ id: actor.characterId, incarnation: actor.incarnation })),
              venueId: venue.id,
              zoneId: zone.id,
              startMinute,
              endMinute,
              kind: group.kind,
              status: "planned",
              revisions: Object.fromEntries(
                group.actors.map((actor) => [actor.characterId, routineRevision(actor.agenda!)]),
              ),
            };
            plan.id = "social-plan-" + memoryHash([village.seed, plan]).slice(0, 32);
            if (socialPlanValid(village, plan, now)) result.push(plan);
          }
      }
  }
  const scores = latestRelationshipScores(village.continuity);
  const priority = (plan: SocialPlan) => {
    const [first, second] = plan.actors;
    if (plan.kind !== "meeting" || !first || !second) return hashString(plan.id);
    const forward = scores.get(relationshipKey(first, second))?.relationshipScore ?? 0;
    const reverse = scores.get(relationshipKey(second, first))?.relationshipScore ?? 0;
    // Either resident's reluctance matters; rotation can still outweigh even the strongest attitude.
    return hashString(plan.id) - (Math.min(forward, reverse) / 100) * 2 ** 30;
  };
  return [...new Map(result.map((plan) => [plan.id, plan])).values()]
    .sort((a, b) => priority(a) - priority(b))
    .slice(0, 6);
}
export function reconcileSocialPlans(village: VillageState, now = new Date()): boolean {
  now = localDate(village, now);
  const minute = now.getHours() * 60 + now.getMinutes();
  let changed = false;
  const plans = village.residentPlans.plans;
  for (const [index, plan] of plans.entries()) {
    if (plan.status !== "planned") continue;
    if (
      plan.dateKey !== agendaDateKey(now) ||
      plan.endMinute <= minute ||
      village.backgroundPace === "off" ||
      !socialPlanValid(village, plan, now, false)
    ) {
      plans[index] = { ...plan, status: "cancelled" };
      changed = true;
    }
  }
  const retained = plans.filter((plan) => plan.dateKey >= agendaDateKey(now));
  if (retained.length !== plans.length) {
    village.residentPlans.plans = retained;
    changed = true;
  }
  return changed;
}
export function socialContinuationValid(
  village: VillageState,
  id: string,
  saved: SocialPlan | undefined,
  now = new Date(),
): boolean {
  now = localDate(village, now);
  const plan = village.residentPlans.plans.find((row) => row.id === id);
  const minute = now.getHours() * 60 + now.getMinutes();
  if (
    !plan ||
    !saved ||
    memoryHash(plan) !== memoryHash(saved) ||
    plan.id !== id ||
    plan.status !== "planned" ||
    plan.dateKey !== agendaDateKey(now) ||
    plan.startMinute > minute ||
    plan.endMinute <= minute
  )
    return false;
  return socialPlanValid(village, plan, now, false);
}

/** The chosen captured candidate and its daily admission publish with the resident result. */
export function acceptSocialPlan(village: VillageState, candidates: SocialPlan[], id: unknown, now: Date) {
  if (id === undefined) return;
  const plan = candidates.find((candidate) => candidate.id === id);
  memoryRequire(plan, "free-time plan was not offered");
  const prior = village.residentPlans.plans.find((row) => row.id === id);
  if (prior) {
    memoryRequire(memoryHash({ ...prior, status: "planned" }) === memoryHash(plan), "free-time plan identity reused");
    return;
  }
  memoryRequire(
    village.residentPlans.selectedDate < plan.dateKey &&
      village.backgroundPace !== "off" &&
      socialPlanValid(village, plan, now),
    "free-time plan authority changed",
  );
  village.residentPlans.plans = [
    ...village.residentPlans.plans.filter((row) => row.dateKey >= plan.dateKey),
    structuredClone(plan),
  ];
  village.residentPlans.selectedDate = plan.dateKey;
  projectAgendaReservations(village);
}

/** Completing an accepted encounter never releases its remaining reserved interval. */
export function completeSocialPlan(
  village: VillageState,
  required: SocialPlan | undefined,
  actorIds: string[],
  venueId: string,
  zoneId: string,
  now: Date,
) {
  if (!required) return;
  const plan = village.residentPlans.plans.find((row) => row.id === required.id);
  memoryRequire(
    plan &&
      socialContinuationValid(village, required.id, required, now) &&
      plan.kind === "meeting" &&
      plan.venueId === venueId &&
      plan.zoneId === zoneId &&
      plan.actors.every((actor) => actorIds.includes(actor.id)),
    "accepted encounter changed its required free-time plan",
  );
  plan.status = "completed";
  projectAgendaReservations(village);
}
