/** Server-only collaboration used by world reads and writes; bound during application setup. */
export interface WorldRelationships {
  readRelationshipState: typeof import("./relationship-store.js").readRelationshipState;
  reconcileRelationships: typeof import("./relationship-rules.js").reconcileRelationships;
  persistRelationshipAuthority: typeof import("./relationship-store.js").persistRelationshipAuthority;
  processSocialOutbox: typeof import("./relationship-social.js").processSocialOutbox;
  projectSocialActivities: typeof import("./social-rules.js").projectSocialActivities;
  reconcileSocialPlans: typeof import("./social-rules.js").reconcileSocialPlans;
}

let current: WorldRelationships | null = null;
let registration = 0;
export function configureWorldRelationships(services: WorldRelationships): () => void {
  const token = ++registration;
  current = services;
  return () => {
    if (registration === token) current = null;
  };
}
export function worldRelationships(): WorldRelationships {
  if (!current) throw new Error("Villages world relationship services are not configured.");
  return current;
}
