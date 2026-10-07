import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";

/** Server-only collaboration used by world reads and writes; bound during application setup. */
export interface WorldRelationships {
  readRelationshipState: typeof import("../residents/relationship-store.js").readRelationshipState;
  reconcileRelationships: typeof import("../../domain/rules/relationship-rules.js").reconcileRelationships;
  persistRelationshipAuthority: typeof import("../residents/relationship-store.js").persistRelationshipAuthority;
  processSocialOutbox: typeof import("../residents/relationship-social.js").processSocialOutbox;
  projectSocialActivities: typeof import("../../domain/rules/social-rules.js").projectSocialActivities;
  reconcileSocialPlans: typeof import("../../domain/rules/social-rules.js").reconcileSocialPlans;
}

const relationships = createActivationBinding<WorldRelationships>(
  "Villages world relationship services are not configured.",
);
export function configureWorldRelationships(services: WorldRelationships): () => void {
  return relationships.configure(bindActivationService(services));
}
export function worldRelationships(): WorldRelationships {
  return relationships.get();
}
