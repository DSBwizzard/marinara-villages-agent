import type { SocialEncounter } from "../../domain/models/relationship-types.js";
import type { VillageState } from "../../domain/models/world.js";
import { parseRelationshipProposals } from "../../domain/rules/relationship-review.js";
import { applyRelationshipReview, reconcileRelationships } from "../../domain/rules/relationship-rules.js";
import {
  projectSocialActivities,
  reconcileSocialPlans,
  socialContinuationValid,
  socialPlanValid,
} from "../../domain/rules/social-rules.js";
import { readEncounter } from "../../domain/rules/social-encounter.js";
import { settleStandingAccess } from "../../domain/rules/venue-access.js";
import type { mutateVillageState } from "../world/village-store.js";
import type { mutateRelationships } from "./relationship-store.js";
export type RelationshipSocialPorts = {
  mutateVillageState: typeof mutateVillageState;
  mutateRelationships: typeof mutateRelationships;
};
/** A saved social outbox settles relationships before its Village acknowledgement. */
export function createRelationshipSocial(ports: RelationshipSocialPorts) {
  const { mutateVillageState, mutateRelationships } = ports;

  async function processSocialOutbox(village: VillageState): Promise<boolean> {
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

  return { processSocialOutbox };
}
export type RelationshipSocialService = ReturnType<typeof createRelationshipSocial>;
