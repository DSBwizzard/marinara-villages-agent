import { reconcileRelationships } from "./relationship-rules.js";
import { processSocialOutbox } from "./relationship-social.js";
import { persistRelationshipAuthority, readRelationshipState } from "./relationship-store.js";
import { resetRuntimeDebug } from "./runtime-debug.js";
import { configureRuntimeHost } from "./runtime-host.js";
import { configureSceneQueries } from "./scene-queries.js";
import { projectSocialActivities, reconcileSocialPlans } from "./social-rules.js";
import { activeVenueSession, listVenueVisits, processSavedExchange, readProjectTurnEvidence } from "./venue-session.js";
import { configureWorldRelationships } from "./world-relationships.js";
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
