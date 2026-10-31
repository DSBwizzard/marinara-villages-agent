import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";

/** Narrow Scene query interface, bound by each application activation. */
export interface SceneQueries {
  activeVenueSession: typeof import("./live-session.js").activeVenueSession;
  readProjectTurnEvidence: import("./scene-query-service.js").SceneQueryService["readProjectTurnEvidence"];
  progressBacklog: import("./scene-query-service.js").SceneQueryService["progressBacklog"];
  readHistoryPage: import("./scene-query-service.js").SceneQueryService["readHistoryPage"];
  readPlaybackPage: import("./scene-query-service.js").SceneQueryService["readPlaybackPage"];
  projectSceneResponse: import("./scene-query-service.js").SceneQueryService["projectSceneResponse"];
  listVenueVisits: typeof import("./archive.js").listVenueVisits;
  listRetiredProjectScenes?: (seed: string) => Promise<import("../../domain/models/scene-model.js").VenueScene[]>;
  processSavedExchange: typeof import("./progress.js").processSavedExchange;
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
export async function readHistoryPage(...args: Parameters<SceneQueries["readHistoryPage"]>) {
  return queriesBinding.get().readHistoryPage(...args);
}
export async function readPlaybackPage(...args: Parameters<SceneQueries["readPlaybackPage"]>) {
  return queriesBinding.get().readPlaybackPage(...args);
}
export async function projectSceneResponse(...args: Parameters<SceneQueries["projectSceneResponse"]>) {
  return queriesBinding.get().projectSceneResponse(...args);
}
