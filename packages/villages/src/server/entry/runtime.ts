import { configureRuntimeHost, villagesDocuments, villagesLogger } from "../adapters/engine/runtime-host.js";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../adapters/engine/activation-scope.js";
import { createVillageRepository } from "../adapters/storage/village-repository.js";
import { createDocumentMutator } from "../adapters/storage/document-store.js";
import { withUsagePurpose } from "../adapters/models/usage-ledger.js";
import { measurePipeline } from "../adapters/observability/pipeline-metrics.js";
import { resetRuntimeDebug, runtimeDebug } from "../adapters/observability/runtime-debug.js";
import { configureVenueOperationContext } from "../adapters/operations/operation-context.js";
import { createVenueOperationContext } from "../adapters/operations/operation-context-service.js";
import { configureBackgroundContext } from "../adapters/operations/background-context.js";
import { createBackgroundContext } from "../adapters/operations/background-context-service.js";
import { reconcileRelationships } from "../domain/rules/relationship-rules.js";
import { projectSocialActivities, reconcileSocialPlans } from "../domain/rules/social-rules.js";
import { processSocialOutbox } from "../features/residents/relationship-social.js";
import { generateVillageTownMap } from "../features/media/town-map-image.js";
import { readInterpretationSettings } from "../features/settings/interpretation-settings.js";
import { persistRelationshipAuthority, readRelationshipState } from "../features/residents/relationship-store.js";
import { configureSceneQueries, sceneQueries } from "../features/scenes/services.js";
import {
  activeVenueSession,
  listVenueVisits,
  processSavedExchange,
  readProjectTurnEvidence,
} from "../features/scenes/venue-session.js";
import { configureWorldRelationships, worldRelationships } from "../features/world/world-relationships.js";
import { createVillageStateService } from "../features/world/village-state-service.js";
import { configureVenueCommands } from "../features/venues/services.js";
import { createVenueCommands } from "../features/venues/venue-service.js";
import { createVenueZoneEdits } from "../features/venues/zone-edit-service.js";
import { configureVenueZoneEdits } from "../features/venues/zone-edits.js";
import { buildVillageSnapshot } from "../features/world/snapshot.js";
import {
  agendaBackgroundHandler,
  adaptationBackgroundHandler,
  storyBackgroundHandler,
} from "../features/world/village.js";
import { mailBackgroundHandler } from "../features/venues/venue-mailbox.js";
import { wishBackgroundHandler } from "../features/residents/wishes/wish-lifecycle.js";
import { wishCheckBackgroundHandler } from "../features/residents/wishes/wish-progress.js";
import { configureVillageStateService, mutateVillageState, readVillageState } from "../features/world/village-store.js";
import { configureTownMapGeneration } from "../jobs/town-map-generation.js";
import { createTownMapGeneration } from "../jobs/town-map-service.js";
import { configureVenueCoordinator } from "../jobs/venue-coordinator.js";
import { createVenueCoordinator } from "../jobs/venue-coordinator-service.js";
import { configureBackgroundWork } from "../jobs/background-work.js";
import { createBackgroundWork } from "../jobs/background-service.js";
import { configurePrivateSpacePreparation } from "../jobs/private-space-preparation.js";
import { createPrivateSpacePreparation } from "../jobs/private-space-service.js";
import { readVillageLore } from "../adapters/engine/lorebooks.js";
import { villagesLanguageModels } from "../adapters/models/language-models.js";
import { reportFoundingProgress } from "../features/founding/founding-progress.js";
import { completeWithRoom } from "../features/generation/model-requests.js";
import { villagesConnectionIdFor } from "../features/settings/connections.js";
import type { CapabilityRuntimeHost } from "@marinara-engine/shared";

/** Connect an application without starting jobs; activation owns the returned release. */
function connectVillagesRuntime(next: CapabilityRuntimeHost) {
  const release = configureRuntimeHost(next);
  const background = createBackgroundContext();
  const releaseBackgroundContext = configureBackgroundContext(background);
  const operations = createVenueOperationContext(villagesLogger);
  const releaseOperations = configureVenueOperationContext(operations);
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
  const releaseVillageState = configureVillageStateService(
    createVillageStateService(createVillageRepository(villagesDocuments), worldRelationships),
  );
  const releaseVenueCommands = configureVenueCommands(
    createVenueCommands({ readVillageState, mutateVillageState, buildVillageSnapshot, sceneQueries }),
  );
  const releaseZoneEdits = configureVenueZoneEdits(
    createVenueZoneEdits({ readVillageState, mutateVillageState, buildVillageSnapshot, sceneQueries }),
  );
  const releaseTownMap = configureTownMapGeneration(
    createTownMapGeneration({
      villagesDocuments,
      mutateDocument: createDocumentMutator(villagesDocuments),
      generateVillageTownMap,
      villagesLogger,
    }),
  );
  const releaseCoordinator = configureVenueCoordinator(
    createVenueCoordinator({ operations, villagesDocuments, villagesLogger, runtimeDebug, readInterpretationSettings }),
  );
  const releaseBackground = configureBackgroundWork(
    createBackgroundWork({
      villagesDocuments,
      villagesLogger,
      readVillageState,
      mutateVillageState,
      withUsagePurpose,
      measurePipeline,
      runtimeDebug,
      backgroundCalls: background.backgroundCalls,
      handlers: [
        ["wish", wishBackgroundHandler],
        ["wish-check", wishCheckBackgroundHandler],
        ["mail", mailBackgroundHandler],
        ["agenda", agendaBackgroundHandler],
        ["adaptation", adaptationBackgroundHandler],
        ["story", storyBackgroundHandler],
      ],
    }),
  );
  const releasePrivateSpaces = configurePrivateSpacePreparation(
    createPrivateSpacePreparation({
      readVillageLore,
      villagesLogger,
      villagesLanguageModels,
      reportFoundingProgress,
      completeWithRoom,
      villagesConnectionIdFor,
      mutateVillageState,
      readVillageState,
    }),
  );
  const releaseGraph = () => {
    releasePrivateSpaces();
    releaseBackground();
    releaseCoordinator();
    releaseTownMap();
    releaseZoneEdits();
    releaseVenueCommands();
    releaseVillageState();
    releaseRelationships();
    releaseQueries();
    releaseOperations();
    releaseBackgroundContext();
    release();
  };
  return { releaseGraph, invalidateHost: release };
}

/** Production uses its explicit owner; direct callers retain synchronous legacy selection. */
export function configureVillagesRuntime(next: CapabilityRuntimeHost): () => void {
  if (scopedActivation()) return connectVillagesRuntime(next).releaseGraph;
  const scope = createActivationScope();
  let graph: ReturnType<typeof connectVillagesRuntime>;
  try {
    graph = scope.run(() => connectVillagesRuntime(next));
  } catch (error) {
    scope.dispose();
    throw error;
  }
  const clearDefault = installDefaultActivation(scope, graph.invalidateHost);
  return scope.bind(() => {
    try {
      graph.releaseGraph();
    } finally {
      scope.dispose();
      clearDefault();
    }
  });
}
