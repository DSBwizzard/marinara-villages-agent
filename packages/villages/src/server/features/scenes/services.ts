import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";

/** Narrow Scene query interface, bound by each application activation. */
export interface SceneQueries {
  activeVenueSession: typeof import("./venue-session.js").activeVenueSession;
  readProjectTurnEvidence: typeof import("./venue-session.js").readProjectTurnEvidence;
  listVenueVisits: typeof import("./venue-session.js").listVenueVisits;
  processSavedExchange: typeof import("./venue-session.js").processSavedExchange;
}
const queriesBinding = createActivationBinding<SceneQueries>("Villages Scene queries are not configured.");
export function configureSceneQueries(queries: SceneQueries) {
  return queriesBinding.configure(bindActivationService(queries));
}
export function sceneQueries(): SceneQueries {
  return queriesBinding.get();
}
