import type { ReturnCatchupCapture, VillageState } from "../models/world.js";
import { cloneWorldContext } from "./world-context-copy.js";

/** Capture only the facts needed to assess an absence; the Memory ledger remains its own authority. */
export function captureReturnContext(state: VillageState, at: Date): ReturnCatchupCapture {
  return {
    at: at.toISOString(),
    memoryRevision: state.memories.revision,
    world: cloneWorldContext({
      seed: state.seed,
      setupAt: state.setupAt,
      foundedAt: state.foundedAt,
      timeZone: state.timeZone,
      name: state.name,
      setting: state.setting,
      worldName: state.worldName,
      worldFacts: state.worldFacts,
      narrative: state.narrative,
      narrativeConsequence: state.narrativeConsequence,
      eventAttempts: state.eventAttempts,
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
    }),
  };
}

/** A revision alone cannot reconstruct changed private knowledge. */
export function departureMemoriesAvailable(capture: ReturnCatchupCapture, current: VillageState): boolean {
  return (
    current.seed === capture.world.seed &&
    current.setupAt === capture.world.setupAt &&
    current.memories.revision === capture.memoryRevision
  );
}
