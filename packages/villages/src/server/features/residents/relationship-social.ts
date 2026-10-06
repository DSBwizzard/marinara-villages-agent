import type { RelationshipEvidenceLine, SocialEncounter } from "../../domain/models/relationship-types.js";
import type { SocialOutboxEntry } from "../../domain/models/social-outbox-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { agendaBlocksFor, agendaDateKey } from "../../domain/rules/agenda-week.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { parseRelationshipProposals, substantiveContact } from "../../domain/rules/relationship-review.js";
import { applyRelationshipReview, reconcileRelationships } from "../../domain/rules/relationship-rules.js";
import {
  canEnter,
  projectSocialActivities,
  reconcileSocialPlans,
  socialContinuationValid,
  socialPlanValid,
} from "../../domain/rules/social-rules.js";
import { settleStandingAccess } from "../../domain/rules/venue-access.js";
import { mutateVillageState } from "../world/village-store.js";
import { mutateRelationships } from "./relationship-store.js";

export type { SocialOutboxEntry } from "../../domain/models/social-outbox-model.js";

export {
  socialPlanValid,
  socialPlanCandidates,
  projectSocialActivities,
  reconcileSocialPlans,
  socialContinuationValid,
} from "../../domain/rules/social-rules.js";

/** Freeze a small menu of feasible plans; the Events model can choose, but cannot invent schedule slots. */

/** Only overlays valid flexible free time. The base week, work, and wish adjustments remain authoritative. */

/** The coordinator checks hydrated reads and then the raw Village CAS record.
 * Raw records use the frozen plan; final permissions are checked in the social outbox. */

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
  if (!venue || !actors.every((actorId) => canEnter(village, venue.id, zoneId, actorId, new Date(entry.at))))
    return null;
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
      // Only an encounter accepted by the relationship transaction can settle access.
      // Its captured evidence survives retries after the original encounter window ends.
      const encounter = state.relationshipContext?.socialEncounters.find((row) => row.id === entry.id);
      if (encounter) {
        const fresh = parseRelationshipProposals(
          { changes: [], disclosures: [], permissions: encounter.review.permissions },
          encounter.id,
          encounter.lines,
          state,
        );
        for (const permission of fresh.review.permissions) {
          const venue = state.venues.find((venue) => venue.id === permission.venueId);
          if (venue?.access)
            settleStandingAccess(venue, permission, encounter.at, [
              "player",
              ...state.villagers.map((resident) => resident.characterId),
            ]);
        }
      }
      const saved = state.socialOutbox?.find((row) => row.id === entry.id);
      if (saved) saved.processed = true;
      state.socialOutbox = state.socialOutbox?.filter((row) => !row.processed);
    });
  }
  return true;
}
