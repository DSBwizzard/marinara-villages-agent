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

export async function projectSceneResponse(...args: Parameters<SceneQueries["projectSceneResponse"]>) {
  return queriesBinding.get().projectSceneResponse(...args);
}
