import { configureRuntimeHost } from "../adapters/engine/runtime-host.js";
import { resetRuntimeDebug } from "../adapters/observability/runtime-debug.js";
import { reconcileRelationships } from "../domain/rules/relationship-rules.js";
import { projectSocialActivities, reconcileSocialPlans } from "../domain/rules/social-rules.js";
import { processSocialOutbox } from "../features/residents/relationship-social.js";
import { persistRelationshipAuthority, readRelationshipState } from "../features/residents/relationship-store.js";
import { configureSceneQueries } from "../features/scenes/services.js";
import {
  activeVenueSession,
  listVenueVisits,
  processSavedExchange,
  readProjectTurnEvidence,
} from "../features/scenes/venue-session.js";
import { configureWorldRelationships } from "../features/world/world-relationships.js";
import type { CapabilityRuntimeHost } from "@marinara-engine/shared";

/** Connect an application without starting jobs; activation owns the returned release. */
export function configureVillagesRuntime(next: CapabilityRuntimeHost): () => void {
  const release = configureRuntimeHost(next);
  resetRuntimeDebug();
  const releaseQueries = configureSceneQueries({
    activeVenueSession,
    readProjectTurnEvidence,
    listVenueVisits,
    processSavedExchange,
  });
  const releaseRelationships = configureWorldRelationships({
    readRelationshipState,
    reconcileRelationships,
    persistRelationshipAuthority,
    processSocialOutbox,
    projectSocialActivities,
    reconcileSocialPlans,
  });
  return () => {
    releaseRelationships();
    releaseQueries();
    release();
  };
}
