import type { VillageState } from "../models/world.js";
import type { VenueScene } from "../models/scene-model.js";

/** Frozen System context includes only the idea relevant to this Scene. */
export function openingSemanticContext(state: VillageState, scene: VenueScene) {
  const opening = state.opening;
  if (!opening || ["complete", "ended"].includes(opening.stage)) return null;
  const proposal =
    opening.stage === "conversations" && scene.activeIds.length === 1
      ? opening.proposals.find(
          (entry) =>
            entry.residentId === scene.activeIds[0] &&
            !opening.reveals.some((proof) => proof.residentId === entry.residentId),
        )
      : undefined;
  const project = state.projects.find(
    (entry) => entry.id === opening.projectId && entry.status === "complete" && entry.venueId === scene.placeId && true,
  );
  return {
    id: opening.id,
    ...(opening.version === 2 && proposal && scene.openingIntroductionResidentId === proposal.residentId
      ? { requiredPitch: true }
      : {}),
    stage: opening.stage,
    projectId: opening.projectId,
    ...(opening.version === 2 && opening.stage === "gathering" && scene.id === opening.gatheringSceneId
      ? {
          gathering: opening.proposals
            .filter((p) => scene.activeIds.includes(p.residentId))
            .map(({ residentId, situation, name, description }) => ({ residentId, situation, name, description })),
        }
      : {}),
    proposal,
    firstUse: project
      ? (opening.proposals.find((entry) => entry.residentId === project.requesterCharacterId)?.firstUse ??
        project.venueDraft?.description)
      : undefined,
  };
}
