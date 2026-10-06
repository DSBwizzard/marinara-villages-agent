/** Narrow Scene query interface, bound by each application activation. */
export interface SceneQueries {
  activeVenueSession: typeof import("./venue-session.js").activeVenueSession;
  readProjectTurnEvidence: typeof import("./venue-session.js").readProjectTurnEvidence;
  listVenueVisits: typeof import("./venue-session.js").listVenueVisits;
  processSavedExchange: typeof import("./venue-session.js").processSavedExchange;
}
let current: SceneQueries | null = null;
let registration = 0;
export function configureSceneQueries(queries: SceneQueries) {
  const token = ++registration;
  current = queries;
  return () => {
    if (registration === token) current = null;
  };
}
export function sceneQueries(): SceneQueries {
  if (!current) throw new Error("Villages Scene queries are not configured.");
  return current;
}
