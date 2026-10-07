import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";

/** Narrow Scene query interface, bound by each application activation. */
export interface SceneQueries {
  activeVenueSession: typeof import("./live-session.js").activeVenueSession;
  readProjectTurnEvidence: import("./scene-query-service.js").SceneQueryService["readProjectTurnEvidence"];
  progressBacklog: import("./scene-query-service.js").SceneQueryService["progressBacklog"];
  listVenueVisits: typeof import("./archive.js").listVenueVisits;
  processSavedExchange: typeof import("./venue-session.js").processSavedExchange;
}
const queriesBinding = createActivationBinding<SceneQueries>("Villages Scene queries are not configured.");
export function configureSceneQueries(queries: SceneQueries) {
  return queriesBinding.configure(bindActivationService(queries));
}
export function sceneQueries(): SceneQueries {
  return queriesBinding.get();
}

/** Full server-only Scene evidence; never a client projection. */
export async function readProjectTurnEvidence(...args: Parameters<SceneQueries["readProjectTurnEvidence"]>) {
  return queriesBinding.get().readProjectTurnEvidence(...args);
}
export async function progressBacklog(...args: Parameters<SceneQueries["progressBacklog"]>) {
  return queriesBinding.get().progressBacklog(...args);
}
