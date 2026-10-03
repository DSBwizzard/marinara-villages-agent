import { agendaBlocksFor, agendaDateKey } from "./agenda-week.js";
import { routineRevision } from "./wish-policy.js";
import { canOccupyZone, venueZones, resolveVenueZone, zoneClosed } from "./venue-zones.js";
import {
  relationshipFor,
  reconcileRelationships,
  relationshipZoneController,
  mutateRelationships,
  applyRelationshipReview,
} from "./relationship-store.js";
import { parseRelationshipProposals, substantiveContact } from "./relationship-review.js";
import { asRecord } from "./coerce.js";
import { mutateVillageState } from "./village-store.js";
import type { VillageState, VillageOpportunity } from "./types.js";
import type { SocialPlan, SocialEncounter, RelationshipEvidenceLine } from "./relationship-types.js";

export type SocialOutboxEntry = {
  id: string;
  seed: string;
  at: string;
  opportunity: VillageOpportunity;
  candidates: SocialPlan[];
  proposal: { planId?: unknown; encounter?: unknown };
  requiredPlanId?: string;
  processed?: boolean;
};
function canEnter(village: VillageState, venueId: string, zoneId: string, actorId: string): boolean {
  const venue = village.venues.find((place) => place.id === venueId),
    zone = venue && resolveVenueZone(venue, zoneId);
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
      routineRevision(agenda) !== plan.revisions[actorId] ||
      !canEnter(village, plan.venueId, plan.zoneId, actorId)
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

/** Freeze a small menu of feasible plans; the Events model can choose, but cannot invent schedule slots. */
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
          if (endMinute - startMinute < 20 || (!meeting && left.venueId !== right.venueId)) continue;
          const actorIds = meeting ? [a.characterId, b.characterId] : [avoiding!.characterId];
          const location = village.venues
            .flatMap((venue) => venueZones(venue).map((zone) => ({ venue, zone })))
            .find(
              ({ venue, zone }) =>
                (meeting || venue.id !== left.venueId) &&
                zone.kind !== "exterior" &&
                actorIds.every((actorId) => canEnter(village, venue.id, zone.id, actorId)),
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

/** Only overlays valid flexible free time. The base week, work, and wish adjustments remain authoritative. */
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

/** The coordinator checks hydrated reads and then the raw Village CAS record.
 * Raw records use the frozen plan; final permissions are checked in the social outbox. */
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

function readEncounter(value: unknown, entry: SocialOutboxEntry, village: VillageState): SocialEncounter | null {
  const raw = asRecord(value),
    actors = entry.opportunity.actorIds;
  if (
    entry.opportunity.kind !== "encounter" ||
    actors.length < 2 ||
    actors.includes("player") ||
    raw.opportunityId !== entry.opportunity.id ||
    !Array.isArray(raw.lines) ||
    raw.lines.length < 2 ||
    raw.lines.length > 8
  )
    return null;
  const venue = village.venues.find((place) => place.id === entry.opportunity.venueId),
    zoneId = entry.opportunity.zoneId ?? "exterior";
  if (!venue || !actors.every((actorId) => canEnter(village, venue.id, zoneId, actorId))) return null;
  const at = new Date(entry.at),
    minute = at.getHours() * 60 + at.getMinutes();
  if (agendaDateKey(at) !== agendaDateKey(new Date()) || Date.now() - at.getTime() > 15 * 60_000) return null;
  if (
    !actors.every((actorId) => {
      const person = village.villagers.find((resident) => resident.characterId === actorId);
      const block =
        person?.agenda &&
        agendaBlocksFor(person.agenda, person.ingestSchedule !== false, at).find(
          (row) => row.startMinute <= minute && row.endMinute > minute,
        );
      // A scheduled social overlay is authoritative only while still valid.
      return (
        block?.venueId === venue.id &&
        (!block.zoneId || block.zoneId === zoneId) &&
        block.status !== "dnd" &&
        block.status !== "offline"
      );
    })
  )
    return null;
  const lines: RelationshipEvidenceLine[] = raw.lines.map((value, index) => {
    const line = asRecord(value);
    if (
      typeof line.speakerId !== "string" ||
      !actors.includes(line.speakerId) ||
      typeof line.text !== "string" ||
      !line.text.trim() ||
      line.text.length > 600
    )
      throw new Error("Invalid structured social encounter.");
    return {
      id: `${entry.id}:line:${index}`,
      speakerId: line.speakerId,
      role: "assistant",
      content: line.text.trim(),
      kind: "dialogue",
      heardBy: [...actors],
      playerHeard: false,
    };
  });
  if (new Set(lines.map((line) => line.speakerId)).size < 2) return null;
  // The model cites local indexes; convert only within this saved encounter, never into an archive.
  const proposed = asRecord(raw.relationshipReview);
  const { review, rejections } = parseRelationshipProposals(proposed, entry.id, lines, village, (row, kind) => {
    if (kind === "disclosures") throw new Error("Offscreen encounters cannot disclose information to the player.");
    if (kind === "changes" && (!actors.includes(String(row.fromId)) || !actors.includes(String(row.toId))))
      throw new Error("An offscreen encounter cannot involve an absent actor.");
    if (
      kind === "permissions" &&
      (!actors.includes(String(row.controllerId)) || !actors.includes(String(row.visitorId)))
    )
      throw new Error("An offscreen encounter cannot involve an absent actor.");
    const indices = Array.isArray(row.evidence) ? row.evidence : [];
    if (
      !indices.length ||
      indices.some((index) => !Number.isInteger(index) || Number(index) < 0 || Number(index) >= lines.length)
    )
      throw new Error("Invalid social encounter citation.");
    return { ...row, lineIds: indices.map((index) => lines[Number(index)]!.id) };
  });
  for (const fromId of actors)
    for (const toId of actors)
      if (fromId !== toId && substantiveContact(lines, fromId, toId))
        review.changes.push({
          id: entry.id + ":contact:" + fromId + ":" + toId,
          fromId,
          toId,
          dimension: "warmth",
          amount: 0,
          ordinary: true,
          reason: "Shared substantive contact.",
          lineIds: lines.map((line) => line.id),
          disclosed: false,
          contact: true,
        });
  return {
    id: entry.id,
    at: entry.at,
    venueId: venue.id,
    zoneId,
    actorIds: actors,
    lines,
    review,
    rejectedProposals: rejections,
  };
}

/** Background's Village transaction saves this outbox before any relationship document is changed. */
export async function processSocialOutbox(village: VillageState): Promise<boolean> {
  const pending = (village.socialOutbox ?? []).filter((entry) => !entry.processed).slice(0, 8);
  if (!pending.length) return false;
  for (const entry of pending) {
    if (entry.seed !== village.seed) continue;
    await mutateRelationships(village.seed, (state) => {
      const current = { ...village, relationshipContext: state };
      reconcileRelationships(state, current);
      reconcileSocialPlans(current);
      projectSocialActivities(current);
      if (state.applied[entry.id]) return;
      const plan = entry.candidates.find((candidate) => candidate.id === entry.proposal.planId);
      if (
        plan &&
        !state.applied[`social-plan-date:${plan.dateKey}`] &&
        current.storyPace !== "off" &&
        socialPlanValid(current, plan)
      ) {
        state.socialPlans.push(plan);
        state.applied[`social-plan-date:${plan.dateKey}`] = true;
      }
      let encounter: SocialEncounter | null = null;
      try {
        if (!entry.requiredPlanId || socialContinuationValid(current, entry.requiredPlanId, undefined))
          encounter = readEncounter(entry.proposal.encounter, entry, current);
      } catch {
        /* Reject invalid interpretation locally, without a paid repair. */
      }
      if (encounter && current.storyPace !== "off") {
        applyRelationshipReview(state, encounter.review, current, encounter.id, encounter.at);
        state.socialEncounters = [...state.socialEncounters, encounter].slice(-64);
        const minute = new Date(encounter.at).getHours() * 60 + new Date(encounter.at).getMinutes();
        for (const plan of state.socialPlans)
          if (
            plan.status === "planned" &&
            plan.kind === "meeting" &&
            plan.venueId === encounter.venueId &&
            plan.zoneId === encounter.zoneId &&
            plan.startMinute <= minute &&
            plan.endMinute > minute &&
            plan.actorIds.every((id) => encounter!.actorIds.includes(id))
          )
            plan.status = "completed";
      }
      state.socialPlans = state.socialPlans.slice(-64);
      state.applied[entry.id] = true;
    });
    await mutateVillageState((state) => {
      if (state.seed !== entry.seed) return;
      const saved = state.socialOutbox?.find((row) => row.id === entry.id);
      if (saved) saved.processed = true;
      state.socialOutbox = state.socialOutbox?.filter((row) => !row.processed);
    });
  }
  return true;
}
