import type { ReturnCatchupCapture, VillageState } from "../models/world.js";
import { cloneWorldContext } from "./world-context-copy.js";

/** Capture native departure facts; common history stays under its existing authority. */
export function captureReturnContext(state: VillageState, at: Date): ReturnCatchupCapture {
  return {
    at: at.toISOString(),
    continuityRevision: state.continuity.revision,
    episodeRevision: state.episodes.revision,
    world: cloneWorldContext({
      seed: state.seed,
      setupAt: state.setupAt,
      foundedAt: state.foundedAt,
      timeZone: state.timeZone,
      name: state.name,
      setting: state.setting,
      worldName: state.worldName,
      worldRules: state.worldRules,
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
      residentPlans: state.residentPlans,
      worldPlaces: state.worldPlaces,
      opening: state.opening,
    }),
  };
}

/** A revision alone cannot reconstruct changed private knowledge. */
export function departureContinuityAvailable(capture: ReturnCatchupCapture, current: VillageState): boolean {
  return (
    current.seed === capture.world.seed &&
    current.setupAt === capture.world.setupAt &&
    current.continuity.revision === capture.continuityRevision &&
    current.episodes.revision === capture.episodeRevision
  );
}
