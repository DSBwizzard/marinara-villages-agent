import type { ReturnCatchupCapture, VillageState } from "../models/world.js";

/** Capture only the facts needed to assess an absence; the Memory ledger remains its own authority. */
export function captureReturnContext(state: VillageState, at: Date): ReturnCatchupCapture {
  return structuredClone({
    at: at.toISOString(),
    memoryRevision: state.memories.revision,
    world: {
      seed: state.seed,
      setupAt: state.setupAt,
      foundedAt: state.foundedAt,
      timeZone: state.timeZone,
      name: state.name,
      setting: state.setting,
      worldName: state.worldName,
      worldFacts: state.worldFacts,
      playerBackground: state.playerBackground,
      playerPersonaId: state.playerPersonaId,
      playerPersonaName: state.playerPersonaName,
      playerPersonaIdentity: state.playerPersonaIdentity,
      playerPersonaMissing: state.playerPersonaMissing,
      villagers: state.villagers,
      venues: state.venues,
      residences: state.residences,
      projects: state.projects,
      relationshipContext: state.relationshipContext,
      opening: state.opening,
    },
  });
}

/** A revision alone cannot reconstruct changed private knowledge. */
export function departureMemoriesAvailable(capture: ReturnCatchupCapture, current: VillageState): boolean {
  return (
    current.seed === capture.world.seed &&
    current.setupAt === capture.world.setupAt &&
    current.memories.revision === capture.memoryRevision
  );
}
