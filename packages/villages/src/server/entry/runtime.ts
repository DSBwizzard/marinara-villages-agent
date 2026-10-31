import type { CapabilityRuntimeHost } from "@marinara-engine/shared";
import { randomUUID } from "node:crypto";
import {
  activationScope,
  bindActivationService,
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../adapters/engine/activation-scope.js";
import { villagesAgentConnectionId, villagesAgentImageConnectionId } from "../adapters/engine/agent-config.js";
import {
  captureMissingVillagerCardColors,
  findPlayerPersona,
  findVillagerCard,
  listPlayerPersonas,
  listVillagerCards,
  readEffectiveVillagerCard,
  toCatalogEntry,
} from "../adapters/engine/catalog.js";
import { decisionAdapterStatus, evaluateVillagesDecisions } from "../adapters/engine/decisions-adapter.js";
import { villageEngineJson as villageImageEngineJson } from "../adapters/engine/engine-loopback.js";
import {
  deleteVillageSpriteFile,
  villageEngineBaseUrl,
  villageEngineForm,
  villageEngineJson,
} from "../adapters/engine/engine-transport.js";
import { createGlobalGallery } from "../adapters/engine/global-gallery-service.js";
import { configureGlobalGallery, uploadVillageGalleryImage } from "../adapters/engine/global-gallery.js";
import { decodeVillageImageDataUrl, inspectVillageImage } from "../adapters/engine/image-files.js";
import { loadEngineImageStyleSupport } from "../adapters/engine/image-style-profiles.js";
import { readVillageLore, readVillageVisualLore, readVillageVisualLoreEntries } from "../adapters/engine/lorebooks.js";
import { createNativeSchedules } from "../adapters/engine/native-schedules-service.js";
import { configureNativeSchedules, readNativeScheduleSnapshot } from "../adapters/engine/native-schedules.js";
import {
  configureRuntimeHost,
  requireHost,
  VILLAGES_PACKAGE_ID,
  villagesDebugAgentsEnabled,
  villagesDocuments,
  villagesLogger,
  villagesResources,
  villagesRuntimeEpoch,
} from "../adapters/engine/runtime-host.js";
import { readZonePictureReference } from "../adapters/engine/zone-picture-reference.js";
import { villagesLanguageModels } from "../adapters/models/language-models.js";
import { linkApiQuote, readExchangeRate } from "../adapters/models/linkapi-pricing.js";
import { createUsageLedger } from "../adapters/models/usage-ledger-service.js";
import {
  configureUsageLedger,
  inferredPurpose,
  quoteUsageRate,
  readUsageLedger,
  resetUsagePeriod as resetUsageLedgerPeriod,
  saveLinkApiGroup as saveLedgerGroup,
  saveUsageRate as saveLedgerRate,
  trackUsage,
  usageProcessOwner,
  withUsagePurpose,
} from "../adapters/models/usage-ledger.js";
import { createMetricsContext } from "../adapters/observability/metrics-context-service.js";
import { configureMetricsContext, pipelineSignal } from "../adapters/observability/metrics-context.js";
import { measurePipeline } from "../adapters/observability/pipeline-metrics.js";
import { createRuntimeDebug } from "../adapters/observability/runtime-debug-service.js";
import { configureRuntimeDebug, readRuntimeDebug, runtimeDebug } from "../adapters/observability/runtime-debug.js";
import { createBackgroundContext } from "../adapters/operations/background-context-service.js";
import { configureBackgroundContext } from "../adapters/operations/background-context.js";
import { createVenueOperationContext } from "../adapters/operations/operation-context-service.js";
import {
  assertVenueOwnership,
  configureVenueOperationContext,
  outsideVenueOperation,
  venueDebugContext,
  venueExplicitRetry,
  venueOperationId,
  venueOperationInput,
  venueOperationSignal,
  venueOperationSnapshot,
  venueRefusal,
  venueRequestMetrics,
} from "../adapters/operations/operation-context.js";
import { createDocumentMutator, mutateDocument } from "../adapters/storage/document-store.js";
import { repairGate, withRepairWork } from "../adapters/storage/repair-gate.js";
import { createSceneRepository } from "../adapters/storage/scene-repository.js";
import { createSceneWishContexts } from "../adapters/storage/scene-wish-contexts.js";
import {
  changeSession,
  clearActivePointer,
  configureSceneRepository,
  readActive,
  readSession,
} from "../adapters/storage/scene-store.js";
import { createVillageRepository } from "../adapters/storage/village-repository.js";
import { relationshipPayloadStore } from "../adapters/storage/relationship-payload-store.js";
import { createCapturedAdmissions } from "../adapters/storage/captured-admission-store.js";
import { wishHistoryStore } from "../adapters/storage/wish-history.js";
import { configureVillageClock, villageNow } from "../adapters/time/clock-gate.js";
import { createVillageClock } from "../adapters/time/clock-service.js";
import { parseCompactFoundingCompletion } from "../domain/rules/compact-founding-rules.js";
import { boundInterpretationEvidence } from "../domain/rules/interpretation-evidence-rules.js";
import { routeInterpretationChecks } from "../domain/rules/interpretation-routing.js";
import { createLiveEvidenceContext } from "../domain/rules/live-exchange.js";
import { projectProposals } from "../domain/rules/project-check-rules.js";
import { reconcileProjectLifecycles } from "../domain/rules/project-lifecycle-rules.js";
import { reconcileRelationships } from "../domain/rules/relationship-rules.js";
import { projectSocialActivities, reconcileSocialPlans } from "../domain/rules/social-rules.js";
import { bindWishProposals, WISH_PROPOSAL_INSTRUCTION } from "../domain/rules/wish-progress-rules.js";
import { createCompactFounding } from "../features/founding/founding-compact-service.js";
import {
  configureCompactFounding,
  proposeCompactFounding,
  proposeOpeningIdea,
} from "../features/founding/founding-compact.js";
import { createFoundingDrafts } from "../features/founding/founding-drafts-service.js";
import {
  configureFoundingDrafts,
  seedFoundingVenueDetails,
  suggestStartingVenues,
} from "../features/founding/founding-drafts.js";
import { createFoundingProgress } from "../features/founding/founding-progress-service.js";
import { configureFoundingProgress, reportFoundingProgress } from "../features/founding/founding-progress.js";
import { createFoundingSetup } from "../features/founding/founding-setup-service.js";
import { configureFoundingSetup, runVillageBootstrap } from "../features/founding/founding-setup.js";
import { createFoundingSuggestions } from "../features/founding/founding-suggestions-service.js";
import { configureFoundingSuggestions } from "../features/founding/founding-suggestions.js";
import { createFoundingPreparation } from "../features/founding/preparation-service.js";
import { configureFoundingPreparation, prepareFoundedVillage } from "../features/founding/preparation.js";
import { createVillageBootstrap } from "../features/founding/village-bootstrap-service.js";
import {
  configureVillageBootstrap,
  draftVillageVenueDescriptions,
  interpretSocialSource,
  proposePublicVenueNames,
  proposeVillage,
} from "../features/founding/village-bootstrap.js";
import { createModelCompletions } from "../features/generation/completion-service.js";
import { createInterpretationDiagnostics } from "../features/generation/interpretation-diagnostics-service.js";
import {
  configureInterpretationDiagnostics,
  removeInterpretationDiagnostics,
  writeInterpretationDiagnostics,
} from "../features/generation/interpretation-diagnostics.js";
import { createInterpretationEvidence } from "../features/generation/interpretation-evidence-service.js";
import {
  configureInterpretationEvidence,
  contextualChecks,
  saveInterpretationContext,
} from "../features/generation/interpretation-evidence.js";
import { createInterpretation } from "../features/generation/interpretation-service.js";
import {
  configureInterpretation,
  interpretChecks,
  recordInterpretationRouting,
} from "../features/generation/interpretation.js";
import { completeWithRoom, configureModelCompletions } from "../features/generation/model-requests.js";
import { createSemanticService } from "../features/generation/semantic-service.js";
import { createSystemInterpretation } from "../features/generation/system-interpretation-service.js";
import { configureSystemInterpretation, systemInterpretations } from "../features/generation/system-interpretation.js";
import { createImageGeneration } from "../features/media/image-generation-service.js";
import {
  configureImageGeneration,
  generateVillageImage,
  resolveVillageImageConnectionId,
  resolveVillageImageEditing,
} from "../features/media/image-generation.js";
import { decodeImageDataUrl } from "../features/media/location-image-codec.js";
import { createLocationImages } from "../features/media/location-image-service.js";
import { configureLocationImages } from "../features/media/location-image.js";
import { createSpriteImageDecoder } from "../features/media/sprite-image-codec.js";
import { createSpriteManager } from "../features/media/sprite-manager-service.js";
import { configureSpriteManager } from "../features/media/sprite-manager.js";
import { createSpriteSetup } from "../features/media/sprite-setup-service.js";
import { configureSpriteSetup, preparedSpriteManager } from "../features/media/sprite-setup.js";
import { createTownMapImage } from "../features/media/town-map-image-service.js";
import { configureTownMapImage, generateVillageTownMap } from "../features/media/town-map-image.js";
import { createTownMapReview } from "../features/media/town-map-review-service.js";
import { configureTownMapReview, prepareVillageMap } from "../features/media/town-map-review.js";
import { createProjectChecks } from "../features/projects/project-check-service.js";
import {
  configureProjectChecks,
  finalizeProjectDiagnostics,
  interpretProjectDraft,
} from "../features/projects/project-checks.js";
import { createProjectEvidence } from "../features/projects/project-evidence-service.js";
import { configureProjectEvidence, processProjectSpeechTurn } from "../features/projects/project-evidence.js";
import { createProjectLifecycle } from "../features/projects/project-lifecycle-service.js";
import {
  cancelProject,
  configureProjectLifecycle,
  draftNewVenueProject,
  draftRenovationProject,
  resumeProject,
} from "../features/projects/project-lifecycle.js";
import { createRepairService } from "../features/repair/repair-service.js";
import {
  createRetainedStorageCleanup,
  configureRetainedStorageCleanup,
} from "../features/repair/retained-storage-cleanup.js";
import { configureRepairs } from "../features/repair/repair.js";
import { createLiveMemory } from "../features/residents/live-memory-service.js";
import {
  configureLiveMemory,
  processLiveMemories,
  processLiveRelationships,
} from "../features/residents/live-memory.js";
import { createRelationships } from "../features/residents/relationship-service.js";
import { createRelationshipSocial } from "../features/residents/relationship-social-service.js";
import { configureRelationshipSocial, processSocialOutbox } from "../features/residents/relationship-social.js";
import { createRelationshipStore } from "../features/residents/relationship-store-service.js";
import {
  configureRelationshipStore,
  mutateRelationships,
  persistRelationshipAuthority,
  readRelationshipState,
} from "../features/residents/relationship-store.js";
import { configureRelationships } from "../features/residents/relationships.js";
import { createResidentAgendas } from "../features/residents/resident-agenda-service.js";
import {
  backfillAgendas,
  configureResidentAgendas,
  queueVillagerAgenda,
  readFoundingResidentContext,
  refreshVillagerRemaps,
  rollActiveAgendas,
} from "../features/residents/resident-agendas.js";
import { createResidentCards } from "../features/residents/resident-card-service.js";
import { configureResidentCards } from "../features/residents/resident-cards.js";
import { createResidentPlanning } from "../features/residents/resident-planning-service.js";
import { createNarrative } from "../features/narrative/narrative-service.js";
import { createResidentRoster } from "../features/residents/resident-roster-service.js";
import { configureResidentRoster } from "../features/residents/resident-roster.js";
import { createResidentSignatures } from "../features/residents/resident-signature-service.js";
import { configureResidentSignatures } from "../features/residents/resident-signature.js";
import { createScheduleInfluence } from "../features/residents/schedule-influence-service.js";
import { prepareSignatureImage } from "../features/residents/signature-image.js";
import { createSocialMail } from "../features/residents/social-mail-service.js";
import { configureSocialMail } from "../features/residents/social-mail.js";
import { createStartingTies } from "../features/residents/starting-ties-service.js";
import {
  configureWishes,
  createWishes,
  processWishExchange,
  queueFoundingWish,
} from "../features/residents/wishes/service.js";
import { createSceneArchive } from "../features/scenes/archive-service.js";
import { configureSceneArchive, listVenueVisits } from "../features/scenes/archive.js";
import { createSceneChanges } from "../features/scenes/changes-service.js";
import {
  configureSceneChanges,
  continueSceneChange,
  readSceneChanges,
  replaySceneChanges,
} from "../features/scenes/changes.js";
import { createSceneCommands } from "../features/scenes/command-service.js";
import { dispatchExchange } from "../features/scenes/exchange-processing.js";
import { createLiveScenes } from "../features/scenes/live-session-service.js";
import {
  activeVenueSession,
  configureLiveScenes,
  refreshZoneParticipants,
  requireLiveVenueSession,
} from "../features/scenes/live-session.js";
import { createSceneProgress } from "../features/scenes/progress-service.js";
import { configureSceneProgress, processSavedExchange } from "../features/scenes/progress.js";
import { interpretRoomReply } from "../features/scenes/room-interpretation.js";
import { createSceneQueryService } from "../features/scenes/scene-query-service.js";
import { createSceneTerminalStore } from "../features/scenes/scene-terminal.js";
import { createProjectEvidenceIndex } from "../features/scenes/project-evidence-index.js";
import { createSceneRetirement } from "../features/scenes/scene-retirement-service.js";
import { filterRelationshipNotices } from "../domain/rules/relationship-presentation.js";
import { createSceneWork } from "../features/scenes/scene-work-service.js";
import { configureSceneWork, sceneWork } from "../features/scenes/scene-work.js";
import { configureSceneQueries, sceneQueries } from "../features/scenes/services.js";
import { createSpinoffs } from "../features/scenes/spinoff-service.js";
import { configureSpinoffs } from "../features/scenes/spinoffs.js";
import { configureSceneCommands, finishSemanticScene, sceneReplayEffects } from "../features/scenes/venue-session.js";
import { createSceneWriting } from "../features/scenes/writing-service.js";
import { createSceneNarrative } from "../features/scenes/scene-narrative-service.js";
import {
  configureSceneWriting,
  explicitSceneActions,
  generate,
  generateContactResponse,
  interpretRoomDraft,
  VENUE_REPLY_MAX_TOKENS,
} from "../features/scenes/writing.js";
import { createConnectionSettings } from "../features/settings/connection-service.js";
import {
  configureConnectionSettings,
  readVillageConnectionSettings,
  validateVillageSetupConnections,
  villagesConnectionIdFor,
  villagesImageConnectionChoice,
} from "../features/settings/connections.js";
import { createInterpretationSettings } from "../features/settings/interpretation-settings-service.js";
import {
  configureInterpretationSettings,
  readInterpretationSettings,
} from "../features/settings/interpretation-settings.js";
import { configureVillageWriting } from "../features/settings/narration-settings.js";
import { createPersonaCache } from "../features/settings/persona-cache-service.js";
import { configurePersonaCache } from "../features/settings/persona-cache.js";
import { createPersonaQueries } from "../features/settings/persona-service.js";
import { configurePersonaQueries, readLinkedPersona } from "../features/settings/personas.js";
import { createUsageMeter } from "../features/settings/usage-meter-service.js";
import { configureUsageMeter } from "../features/settings/usage-meter.js";
import { createUsagePreview } from "../features/settings/usage-preview-service.js";
import { configureUsagePreview } from "../features/settings/usage-preview.js";
import { createVillageSettings } from "../features/settings/village-settings-service.js";
import { configureVillageSettings } from "../features/settings/village-settings.js";
import { createVillageWriting } from "../features/settings/writing-settings-service.js";
import { createResidences } from "../features/venues/residence-service.js";
import {
  completeVillageResidence,
  configureResidences,
  decideVillageResidence,
  proposeVillageResidence,
} from "../features/venues/residences.js";
import { assertVenueImageAccess, configureVenueCommands, setVillageVenueImage } from "../features/venues/services.js";
import { createVenueRequests } from "../features/venues/venue-request-service.js";
import { configureVenueRequests, queueVillageVenueRequest } from "../features/venues/venue-requests.js";
import { createVenueCommands } from "../features/venues/venue-service.js";
import { createVillageSnapshot } from "../features/world/snapshot-service.js";
import { buildVillageSnapshot, configureVillageSnapshot } from "../features/world/snapshot.js";
import { createWorldCoordination } from "../features/world/village-service.js";
import { createReturnCatchup } from "../features/background/return-catchup-service.js";
import { createReturnCatchupSettlement } from "../features/background/return-catchup-settlement.js";
import { advanceReturnCatchup, configureReturnCatchup } from "../features/background/return-catchup.js";
import { createVillageStateService } from "../features/world/village-state-service.js";
import {
  configureVillageStateService,
  mutateVillageMemoryState,
  mutateVillageState,
  readVillageAuthority,
  readVillageMemoryAuthority,
  readVillageMemorySnapshot,
  readVillageMemoryState,
  readVillageSnapshot,
  readVillageState,
  withVillageSceneAcceptance,
} from "../features/world/village-store.js";
import { configureWorldCoordination } from "../features/world/village.js";
import { configureWorldRelationships, worldRelationships } from "../features/world/world-relationships.js";
import { createBackgroundWork } from "../jobs/background-service.js";
import { requestVillageRefresh } from "../jobs/village-refresh-scheduler.js";
import {
  backgroundJobSnapshot,
  backgroundWorkSummaries,
  cancelReturnCatchup,
  configureBackgroundWork,
  previewBackgroundJobs,
  hasVillagePresence,
  queueBackgroundJob,
  retireBackgroundResident,
  retryBackgroundJob,
  settleBackgroundWork,
} from "../jobs/background-work.js";
import {
  configurePrivateSpacePreparation,
  preparePrivateSpaces,
  privatePreparationRooms,
} from "../jobs/private-space-preparation.js";
import { createPrivateSpacePreparation } from "../jobs/private-space-service.js";
import { configureTownMapGeneration } from "../jobs/town-map-generation.js";
import { createTownMapGeneration } from "../jobs/town-map-service.js";
import { createVenueCoordinator } from "../jobs/venue-coordinator-service.js";
import {
  cancelVenueOperation,
  configureVenueCoordinator,
  coordinatedCompletion,
  coordinatedOptionalCompletion,
  coordinateVenue,
  hasVenueOperation,
  recoverVenueOperations,
  rejectVenueCompletion,
  venueCheckpoint,
  venueInterpretationSettings,
  venueSavedCheckpoint,
} from "../jobs/venue-coordinator.js";
import { backendWorkFor } from "./backend-work.js";

// A process identity preserves the existing saved-attempt recovery policy.
const signatureProcessOwner = randomUUID();

/** Connect an application without starting jobs; activation owns the returned release. */
function connectVillagesRuntime(next: CapabilityRuntimeHost, backendIdentity?: object) {
  const backendWork = backendWorkFor(backendIdentity ?? next.persistence?.documents);
  const releaseMetrics = configureMetricsContext(createMetricsContext());
  const release = configureRuntimeHost(next, backendWork.repairAdmission);
  const releasePersonas = configurePersonaQueries(createPersonaQueries({ findPlayerPersona, listPlayerPersonas }));
  const releaseNativeSchedules = configureNativeSchedules(createNativeSchedules({ villagesResources, villagesLogger }));
  const releaseGallery = configureGlobalGallery(createGlobalGallery({ villageEngineJson, villageEngineForm }));
  const background = createBackgroundContext();
  const releaseBackgroundContext = configureBackgroundContext(background);
  const operations = createVenueOperationContext(villagesLogger);
  const releaseOperations = configureVenueOperationContext(operations);
  const sceneRepository = createSceneRepository({
    villagesDocuments,
    mutateDocument: createDocumentMutator(villagesDocuments),
  });
  const sceneTerminals = createSceneTerminalStore({
    villagesDocuments,
    mutateDocument: createDocumentMutator(villagesDocuments),
  });
  const projectEvidenceIndex = createProjectEvidenceIndex({
    villagesDocuments,
    mutateDocument: createDocumentMutator(villagesDocuments),
  });
  const retirementOwner = activationScope();
  const logRetirementFailure = (message: string, error: unknown) => {
    if (retirementOwner?.active === false) return;
    try {
      villagesLogger().warn("[villages] %s: %s", message, String(error));
    } catch {
      /* The activation may have closed. */
    }
  };
  const retirement = bindActivationService(
    createSceneRetirement({
      villagesDocuments,
      readActive,
      readVillageState: readVillageAuthority,
      readVillageMemoryState: readVillageMemoryAuthority,
      mutateVillageMemoryState,
      hasVenueOperation,
      saveProjectEvidence: projectEvidenceIndex.save,
      saveTerminal: sceneTerminals.save,
      readTerminal: sceneTerminals.read,
      removeInterpretationDiagnostics,
      withRepairWork,
      withSceneWork: backendWork.sceneFence.run,
      withLateResponseWork: backendWork.lateResponseFence.run,
      onFailure: (id, error) => logRetirementFailure(`Scene cleanup deferred ${id}`, error),
    }),
  );
  const scheduleRetirement = (id: string) =>
    backendWork.sceneFence.defer(() => {
      if (retirementOwner?.active === false) return;
      void retirement.retire(id).catch((error) => logRetirementFailure(`Scene cleanup deferred ${id}`, error));
    });
  const scheduleRetirementScan = () =>
    backendWork.sceneFence.defer(() => {
      if (retirementOwner?.active === false) return;
      void retirement.retireSettled().catch((error) => logRetirementFailure("Scene cleanup scan deferred", error));
    });
  const releaseSceneRepository = configureSceneRepository(sceneRepository);
  const releaseSpinoffs = configureSpinoffs(
    createSpinoffs({
      repository: sceneRepository,
      readVillageState: readVillageMemoryState,
      mutateVillageState: mutateVillageMemoryState,
      persistence: () => requireHost().persistence,
      models: villagesLanguageModels,
      connectionId: () => villagesConnectionIdFor("narration"),
      now: villageNow,
      busy: hasVenueOperation,
      parseJson: (text) => requireHost().json.parseJsonish(text),
    }),
  );
  const releaseInterpretationEvidence = configureInterpretationEvidence(
    createInterpretationEvidence({
      VILLAGES_PACKAGE_ID,
      villagesDocuments,
      mutateDocument: createDocumentMutator(villagesDocuments),
    }),
  );
  const releaseUsage = configureUsageLedger(
    createUsageLedger({
      owner: usageProcessOwner,
      villagesDocuments,
      villagesLogger,
      villageEngineJson,
      backgroundCalls: background.backgroundCalls,
      venueDebugContext: operations.venueDebugContext,
      linkApiQuote,
      readExchangeRate,
    }),
  );
  const releaseInterpretationSettings = configureInterpretationSettings(
    createInterpretationSettings({
      VILLAGES_PACKAGE_ID,
      villagesDocuments,
      mutateDocument: createDocumentMutator(villagesDocuments),
    }),
  );
  const releaseUsageMeter = configureUsageMeter(
    createUsageMeter({
      readUsageLedger,
      quoteUsageRate,
      villagesConnectionIdFor,
      resetLedger: resetUsageLedgerPeriod,
      saveRate: saveLedgerRate,
      saveGroup: saveLedgerGroup,
      previewBackgroundJobs,
    }),
  );
  const releaseUsagePreview = configureUsagePreview(
    createUsagePreview({
      readVillageAuthority: () => villageRepository.readAuthority(),
      villagesLanguageModels,
      quoteUsageRate,
      previewBackgroundJobs,
      villagesConnectionIdFor,
      villagesImageConnectionChoice,
    }),
  );
  const releaseInterpretationDiagnostics = configureInterpretationDiagnostics(
    createInterpretationDiagnostics({
      villagesDocuments,
      mutateDocument: createDocumentMutator(villagesDocuments),
    }),
  );
  const releaseDebug = configureRuntimeDebug(
    createRuntimeDebug({
      villagesDebugAgentsEnabled,
      villagesDocuments,
      villagesLogger,
      venueDebugContext,
      mutateDocument: createDocumentMutator(villagesDocuments),
    }),
  );
  const completionOwner = activationScope();
  const releaseCompletions = configureModelCompletions(
    createModelCompletions({
      mutateDocument: createDocumentMutator(villagesDocuments),
      readRuntimeDebug,
      runtimeDebug,
      backgroundCalls: background.backgroundCalls,
      coordinatedCompletion,
      withUsagePurpose,
      inferredPurpose,
      villagesLogger,
      bindCallback: (callback) => (completionOwner ? completionOwner.bind(callback) : callback),
    }),
  );
  const releaseConnections = configureConnectionSettings(
    createConnectionSettings({
      VILLAGES_PACKAGE_ID,
      villagesDocuments,
      mutateDocument: createDocumentMutator(villagesDocuments),
      villageEngineJson,
      villagesAgentConnectionId,
      villagesAgentImageConnectionId,
    }),
  );
  const releaseImageGeneration = configureImageGeneration(
    createImageGeneration({
      villageEngineJson: villageImageEngineJson,
      loadEngineImageStyleSupport,
      villagesImageConnectionChoice,
      decodeVillageImageDataUrl,
    }),
  );
  const releaseMapImages = configureTownMapImage(
    createTownMapImage({ readVillageVisualLoreEntries, generateVillageImage, inspectVillageImage }),
  );
  const releaseCompactFounding = configureCompactFounding(
    createCompactFounding({
      villagesLanguageModels,
      villagesConnectionIdFor,
      completeWithRoom,
      villagesDebugAgentsEnabled,
      villagesLogger,
    }),
  );
  const releaseBootstrapRecipes = configureVillageBootstrap(
    createVillageBootstrap({
      villagesLanguageModels,
      villagesConnectionIdFor,
      completeWithRoom,
      backgroundCalls: background.backgroundCalls,
      villagesDebugAgentsEnabled,
      villagesLogger,
    }),
  );
  const releaseFoundingDrafts = configureFoundingDrafts(
    createFoundingDrafts({
      findVillagerCard,
      readLinkedPersona,
      readVillageLore,
      readVillageVisualLore,
      villagesLanguageModels,
      villagesConnectionIdFor,
      completeWithRoom,
      generateVillageImage,
      uploadVillageGalleryImage,
      decodeVillageImageDataUrl,
    }),
  );
  const releaseSystemInterpretation = configureSystemInterpretation(
    createSystemInterpretation({ villagesLanguageModels, villagesConnectionIdFor, completeWithRoom }),
  );
  const releaseInterpretation = configureInterpretation(
    createInterpretation({
      evaluateVillagesDecisions,
      decisionAdapterStatus,
      trackUsage,
      backgroundCalls: background.backgroundCalls,
      backgroundSetting: background.backgroundSetting,
      readInterpretationSettings,
      venueOperationSignal,
      coordinatedOptionalCompletion,
      venueCheckpoint,
      venueInterpretationSettings,
      writeInterpretationDiagnostics,
      systemInterpretations,
      bindCallback: (callback) => (completionOwner ? completionOwner.bind(callback) : callback),
    }),
  );
  const releaseSceneWork = configureSceneWork(createSceneWork(backendWork.navigation));
  const releaseRelationshipStore = configureRelationshipStore(
    createRelationshipStore({
      VILLAGES_PACKAGE_ID,
      villagesDocuments,
      mutateDocument: createDocumentMutator(villagesDocuments),
    }),
  );
  const relationshipSocial = createRelationshipSocial({
    withVillageSceneAcceptance: (work, options) => withRepairWork(() => withVillageSceneAcceptance(work, options)),
    readSocialEntry: (value, seed) => createCapturedAdmissions(villagesDocuments()).readSocialEntry(value, seed),
    socialIdentity: (value, scope) => createCapturedAdmissions(villagesDocuments()).socialIdentity(value, scope),
    mutateVillageState,
    mutateRelationships,
    processLiveMemories,
    readVillageSnapshot: readVillageMemorySnapshot,
    queueBackgroundJob,
    interpretSocialSource,
    afterCatchup: advanceReturnCatchup,
  });
  const releaseRelationshipSocial = configureRelationshipSocial(relationshipSocial);
  const startingTies = createStartingTies({
    withVillageSceneAcceptance,
    readVillageLore,
    readVillageState,
    mutateVillageState: mutateVillageMemoryState,
    mutateRelationships,
    queueBackgroundJob,
    settleBackgroundWork,
    villagesLanguageModels,
    villagesConnectionIdFor,
    completeWithRoom,
  });
  const personalMail = createSocialMail({
    backgroundSetting: background.backgroundSetting,
    readMailInput: (value, seed) => createCapturedAdmissions(villagesDocuments()).readMailInput(value, seed),
    withWork: withRepairWork,
    processLiveMemories,
    withVillageSceneAcceptance,
    readVillageSnapshot,
    mutateVillageState: mutateVillageMemoryState,
    mutateRelationships,
    readRelationshipState,
    queueBackgroundJob,
    retryBackgroundJob,
    backgroundWorkSummaries,
    villagesLanguageModels,
    villagesConnectionIdFor,
    completeWithRoom,
  });
  const releasePersonalMail = configureSocialMail(personalMail);
  const releaseRelationshipViews = configureRelationships(
    createRelationships({
      readVillageLore,
      readVillageState: readVillageMemoryState,
      mutateRelationships,
      prepareStartingTies: startingTies.prepare,
      clarifyStartingTies: startingTies.clarify,
      backgroundWorkSummaries,
      applySavedStartingTies: startingTies.applySaved,
    }),
  );
  const releaseLiveMemory = configureLiveMemory(
    createLiveMemory({
      mutateVillageState: mutateVillageMemoryState,
      readVillageAuthority: readVillageMemoryAuthority,
      readVillageState: readVillageMemoryState,
      mutateRelationships,
    }),
  );
  const releaseRelationships = configureWorldRelationships({
    readRelationshipState,
    processPersonalMailOutbox: personalMail.processOutbox,
    reconcileRelationships,
    persistRelationshipAuthority,
    processSocialOutbox,
    projectSocialActivities,
    reconcileSocialPlans,
  });
  const villageRepository = createVillageRepository(villagesDocuments, (message) => villagesLogger().warn(message));
  const releaseClock = configureVillageClock(createVillageClock(villageRepository));
  const releaseVillageState = configureVillageStateService(
    createVillageStateService(villageRepository, worldRelationships),
  );
  const releaseFoundingProgress = configureFoundingProgress(
    createFoundingProgress({ readVillageState, mutateVillageState }),
  );
  const wishService = createWishes({
    readVillageState,
    mutateVillageState: mutateVillageMemoryState,
    queueBackgroundJob,
    villagesLanguageModels,
    villagesConnectionIdFor,
    completeWithRoom,
  });
  const releaseWishes = configureWishes(wishService);
  const releaseProjectLifecycle = configureProjectLifecycle(
    createProjectLifecycle({
      mutateVillageState: mutateVillageMemoryState,
      villagesDebugAgentsEnabled,
      outsideVenueOperation: operations.outsideVenueOperation,
      preparePrivateSpaces,
      draftNewVenueProject,
      draftRenovationProject,
    }),
  );
  const releaseLiveScenes = configureLiveScenes(
    createLiveScenes({
      readActive,
      readSession,
      changeSession,
      clearActivePointer,
      hasVenueOperation,
      readVillageState: readVillageMemoryState,
      mutateVillageState: mutateVillageMemoryState,
    }),
  );
  const semantic = createSemanticService({
    runtimeDebug,
    venueExplicitRetry,
    venueDebugContext,
    readVillageLore,
    venueSavedCheckpoint,
    rejectVenueCompletion,
    readVillageState: readVillageMemoryState,
    villagesLanguageModels,
    villagesConnectionIdFor,
    completeWithRoom,
    venueCheckpoint,
    venueOperationSignal,
  });
  const sceneNarrative = createSceneNarrative({
    read: readVillageSnapshot,
    mutate: (work) => villageRepository.mutateAuthority(work),
    relationships: readRelationshipState,
    now: villageNow,
  });
  const releaseSceneWriting = configureSceneWriting(
    createSceneWriting({
      readCapturedWishContexts: (contexts, scene) => createSceneWishContexts(villagesDocuments()).read(contexts, scene),
      sceneNarrative,
      semantic,
      venueCheckpoint,
      venueSavedCheckpoint,
      venueExplicitRetry,
      refreshZoneParticipants,
      readEffectiveVillagerCard,
      readVillageLore,
      villagesLogger,
      villagesLanguageModels,
      measurePipeline,
      runtimeDebug,
      venueOperationId,
      venueOperationInput,
      venueOperationSignal,
      rejectVenueCompletion,
      completeWithRoom,
      villagesConnectionIdFor,
      readVillageState: readVillageMemoryState,
      interpretRoomReply,
    }),
  );
  const releaseSceneCommands = configureSceneCommands(
    createSceneCommands({
      readCapturedWishContexts: (contexts, scene) => createSceneWishContexts(villagesDocuments()).read(contexts, scene),
      sceneNarrative,
      applySavedStartingTies: startingTies.applySaved,
      withVillageSceneAcceptance,
      semantic,
      interpretRoomDraft,
      generate,
      generateContactResponse,
      explicitSceneActions,
      VENUE_REPLY_MAX_TOKENS,
      loadPrivateSpaceImages: () => import("../features/media/location-image.js"),
      readSceneChanges,
      processSavedExchange,
      activeVenueSession,
      requireLiveVenueSession,
      refreshZoneParticipants,
      decideVillageResidence,
      proposeVillageResidence,
      activationScope,
      bindReplayEffects: bindActivationService,
      sceneWork,
      villagesDebugAgentsEnabled,
      villagesDocuments,
      villagesLogger,
      villagesLanguageModels,
      runtimeDebug,
      assertVenueOwnership,
      outsideVenueOperation,
      venueOperationId,
      venueOperationSignal,
      venueOperationSnapshot,
      venueOperationInput,
      venueRefusal,
      venueRequestMetrics,
      mutateDocument,
      changeSession,
      clearActivePointer,
      readActive,
      readSession,
      cancelVenueOperation,
      coordinateVenue,
      hasVenueOperation,
      recoverVenueOperations,
      rejectVenueCompletion,
      venueCheckpoint,
      writeInterpretationDiagnostics,
      saveInterpretationContext,
      completeWithRoom,
      finalizeProjectDiagnostics,
      interpretProjectDraft,
      projectProposals,
      rollActiveAgendas,
      bindWishProposals,
      WISH_PROPOSAL_INSTRUCTION,
      villagesConnectionIdFor,
      mutateVillageState: mutateVillageMemoryState,
      readVillageSnapshot: readVillageMemorySnapshot,
      readVillageState: readVillageMemoryState,
      queueVillageVenueRequest,
    }),
  );
  const releaseSceneProgress = configureSceneProgress(
    createSceneProgress({
      withSceneWork: backendWork.sceneFence.run,
      onSettled: scheduleRetirement,
      onRecoveryFinished: scheduleRetirementScan,
      readVillageState: readVillageMemoryState,
      readSession,
      processProjectSpeechTurn,
      mutateVillageState: mutateVillageMemoryState,
      changeSession,
      measurePipeline,
      createLiveEvidenceContext,
      processWishExchange,
      processLiveMemories,
      processLiveRelationships,
      runtimeDebug,
      dispatchExchange,
      sceneQueries,
      villagesLogger,
      ...sceneReplayEffects(),
    }),
  );
  const releaseSceneChanges = configureSceneChanges(
    createSceneChanges({
      withSceneWork: backendWork.sceneFence.run,
      finishSemanticScene,
      mutateRelationships,
      changeSession,
      readSession,
      readVillageSnapshot: readVillageMemorySnapshot,
      readVillageState: readVillageMemoryState,
      mutateVillageState: mutateVillageMemoryState,
      villagesDocuments,
      processSavedExchange,
      venueRequestMetrics: operations.venueRequestMetrics,
      readTerminal: sceneTerminals.read,
    }),
  );
  const releaseSceneArchive = configureSceneArchive(
    createSceneArchive({
      villagesDocuments,
      readActive,
    }),
  );
  const releaseQueries = configureSceneQueries({
    ...createSceneQueryService({
      readSession,
      readVillageState,
      villagesDocuments,
      readRetiredProjectScenes: projectEvidenceIndex.read,
    }),
    activeVenueSession,
    listVenueVisits,
    listRetiredProjectScenes: projectEvidenceIndex.read,
    processSavedExchange,
  });
  const releaseProjectChecks = configureProjectChecks(
    createProjectChecks({
      readVillageState: readVillageMemoryState,
      mutateVillageState: mutateVillageMemoryState,
      sceneQueries,
      pipelineSignal,
      contextualChecks,
      boundInterpretationEvidence,
      routeInterpretationChecks,
      recordInterpretationRouting,
      interpretChecks,
      saveInterpretationContext,
      writeInterpretationDiagnostics,
    }),
  );
  const releaseProjectEvidence = configureProjectEvidence(
    createProjectEvidence({
      readVillageState: readVillageMemoryState,
      mutateVillageState: mutateVillageMemoryState,
      sceneQueries,
    }),
  );
  const releaseVillageSnapshot = configureVillageSnapshot(
    createVillageSnapshot({
      readVillageState,
      mutateVillageState,
      listVillagerCards,
      captureMissingVillagerCardColors,
      rollActiveAgendas,
      sceneQueries,
      backgroundWorkSummaries,
      privatePreparationRooms,
    }),
  );
  const scheduleInfluence = createScheduleInfluence({
    readVillageState,
    readNativeScheduleSnapshot,
    queueBackgroundJob,
    villagesLanguageModels,
    villagesConnectionIdFor,
    completeWithRoom,
  });
  const residentAgendas = createResidentAgendas({
    queueScheduleInfluence: scheduleInfluence.queue,
    readVillageState,
    mutateVillageState,
    reportFoundingProgress,
    readEffectiveVillagerCard,
    readVillageLore,
    queueBackgroundJob,
    backgroundWorkSummaries,
    parseCompactFoundingCompletion,
    proposeCompactFounding,
    readNativeScheduleSnapshot,
  });
  const releaseResidentAgendas = configureResidentAgendas(residentAgendas);
  const residences = createResidences({ mutateVillageState, buildVillageSnapshot });
  const releaseResidences = configureResidences(residences);
  const releasePersonaCache = configurePersonaCache(
    createPersonaCache({ readVillageState, mutateVillageState, findPlayerPersona }),
  );
  const releaseResidentCards = configureResidentCards(
    createResidentCards({
      readVillageState,
      mutateVillageState,
      buildVillageSnapshot,
      listVillagerCards,
      findVillagerCard,
      toCatalogEntry,
    }),
  );
  const releaseResidentRoster = configureResidentRoster(
    createResidentRoster({
      preparedSpriteManager,
      readVillageState,
      mutateVillageState,
      findVillagerCard,
      queueVillagerAgenda,
      queueStartingTies: startingTies.queue,
      retireBackgroundResident,
    }),
  );
  const releaseVenueRequests = configureVenueRequests(
    createVenueRequests({
      mutateVillageState: mutateVillageMemoryState,
      buildVillageSnapshot,
      draftNewVenueProject,
    }),
  );
  const releaseTownMapReview = configureTownMapReview(
    createTownMapReview({
      readVillageState,
      mutateVillageState,
      buildVillageSnapshot,
      inspectVillageImage,
      uploadVillageGalleryImage,
    }),
  );
  const spriteManagerService = createSpriteManager({
    readVillageState,
    mutateVillageState,
    buildVillageSnapshot,
    decodeSpriteImage: createSpriteImageDecoder(inspectVillageImage),
    villageEngineJson,
    readSpriteFile: (url) => fetch(villageEngineBaseUrl() + url),
    deleteVillageSpriteFile,
    villagesLogger,
    writes: backendWork.spriteWrites,
  });
  const releaseSprites = configureSpriteManager(spriteManagerService);
  const releaseSpriteSetup = configureSpriteSetup(
    createSpriteSetup({
      villagesDocuments,
      mutateDocument,
      villageEngineJson,
      villagesLanguageModels,
      manager: spriteManagerService,
      writes: backendWork.spriteWrites,
      readVillageState,
      mutateVillageState,
    }),
  );
  const releaseSignatures = configureResidentSignatures(
    createResidentSignatures({
      owner: signatureProcessOwner,
      tasks: backendWork.signatureTasks,
      villagesDocuments,
      villagesRuntimeEpoch,
      readVillageAuthority,
      mutateVillageState,
      resolveVillageImageConnectionId,
      generateVillageImage,
      prepareSignatureImage,
      uploadVillageGalleryImage,
    }),
  );
  const releaseFoundingSetup = configureFoundingSetup(
    createFoundingSetup({
      preparedSpriteManager,
      readVillageState,
      mutateVillageState: mutateVillageMemoryState,
      buildVillageSnapshot,
      prepareVillageMap,
      readVillageConnectionSettings,
      validateVillageSetupConnections,
      readLinkedPersona,
      listVillagerCards,
      prepareFoundedVillage,
      queueStartingTies: startingTies.queue,
      queueVillagerAgenda,
      queueMicrotask,
      readVillageLore,
      proposeVillage,
      proposePublicVenueNames,
      draftVillageVenueDescriptions,
    }),
  );
  const releaseWritingSettings = configureVillageWriting(
    createVillageWriting({ readVillageState, mutateVillageState }),
  );
  const releaseSettings = configureVillageSettings(
    createVillageSettings({
      activityChanged: requestVillageRefresh,
      mutateVillageState,
      buildVillageSnapshot,
      readLinkedPersona,
      runVillageBootstrap,
      villagesLogger,
    }),
  );
  const releaseVenueCommands = configureVenueCommands(
    createVenueCommands({
      readVillageState,
      mutateVillageState,
      buildVillageSnapshot,
      sceneQueries,
      withSceneNavigation: (operation) => sceneWork().serializeNavigation(operation),
    }),
  );
  const releaseLocationImages = configureLocationImages(
    createLocationImages({
      resolveVillageImageEditing,
      resolveVillageImageConnectionId,
      readZonePictureReference,
      buildVillageSnapshot,
      readVillageState,
      mutateVillageState,
      assertVenueImageAccess,
      setVillageVenueImage,
      readVillageVisualLore,
      generateVillageImage,
      uploadVillageGalleryImage,
      decodeImageDataUrl,
      villagesLogger,
    }),
  );
  const releaseFoundingSuggestions = configureFoundingSuggestions(
    createFoundingSuggestions({
      villagesDocuments,
      mutateDocument: createDocumentMutator(villagesDocuments),
      suggestStartingVenues,
      villagesLogger,
    }),
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
    createVenueCoordinator({
      withSceneWork: backendWork.sceneFence.run,
      sceneWorkBusy: backendWork.sceneFence.isBusy,
      withLateResponseWork: backendWork.lateResponseFence.run,
      withRepairWork,
      onSettled: scheduleRetirement,
      operations,
      villagesDocuments,
      villagesLogger,
      runtimeDebug,
      readInterpretationSettings,
      readTerminal: async (id) => {
        const receipt = await sceneTerminals.read(id);
        const state = await readVillageAuthority();
        if (!receipt || receipt.villageSeed !== state.seed) return null;
        return {
          ...receipt,
          recordEvents: filterRelationshipNotices(
            [...new Map(receipt.recordEvents.map((event) => [event.id, event])).values()],
            undefined,
          ).filter((event) => !state.dismissedNoticeIds.includes(event.id)),
        };
      },
    }),
  );
  const relationshipIdentity: import("../domain/rules/return-capture-revision.js").RelationshipIdentity = (world) =>
    relationshipPayloadStore(villagesDocuments()).fingerprint(world.relationshipContext, world);
  const wishIdentity: import("../domain/rules/return-capture-revision.js").WishIdentity = (rows, scope) =>
    wishHistoryStore(villagesDocuments()).fingerprint(rows, scope);
  const residentPlanning = createResidentPlanning({
    relationshipIdentity,
    wishIdentity,
    afterCatchup: advanceReturnCatchup,
    afterCatchupFailure: advanceReturnCatchup,
    applySavedStartingTies: startingTies.applySaved,
    automaticMail: personalMail.automaticOutbox,
    readVillageState,
    readEffectiveVillagerCard,
    queueBackgroundJob,
    backgroundJobSnapshot,
    villagesLanguageModels,
    villagesConnectionIdFor,
    completeWithRoom,
  });
  const narrative = createNarrative({
    relationshipIdentity,
    wishIdentity,
    read: readVillageAuthority,
    mutate: (update) => villageRepository.mutateAuthority(update),
    socialSnapshot: readVillageSnapshot,
    resident: residentPlanning.reconcile,
    queue: queueBackgroundJob,
    job: backgroundJobSnapshot,
    models: villagesLanguageModels,
    connection: villagesConnectionIdFor,
    complete: completeWithRoom,
    now: villageNow,
    afterCatchup: advanceReturnCatchup,
  });
  const worldCoordination = createWorldCoordination({
    // Memory pages/evidence depend only on saved knowledge; reading them must not
    // observe/write the clock or decode the same large authority record twice.
    readVillageAuthority: (options) => villageRepository.readAuthority({ ...options, memories: true }),
    // Manual history edits preserve current mechanics and do not reconcile the world.
    mutateMemoryAuthority: (update) => villageRepository.mutateAuthority(update, { memories: true }),
    reconcileNarrative: narrative.reconcile,
    readVillageState,
    mutateVillageState,
    buildVillageSnapshot,
    villagesLogger,
    outsideVenueOperation: operations.outsideVenueOperation,
    completeVillageResidence,
    backfillAgendas,
    refreshVillagerRemaps,
    preparePrivateSpaces,
    reconcileProjectLifecycles,
    rollActiveAgendas,
  });
  const releaseWorldCoordination = configureWorldCoordination(worldCoordination);
  const releaseRepairs = configureRepairs(
    createRepairService({
      gate: repairGate(),
      repository: villageRepository,
      resumeProject,
      cancelProject,
      replaySaved: replaySceneChanges,
      continueSaved: continueSceneChange,
    }),
  );
  const retainedCleanup = createRetainedStorageCleanup(repairGate(), (error) =>
    runtimeDebug("retained storage cleanup deferred", { error: String(error) }),
  );
  const releaseRetainedCleanup = configureRetainedStorageCleanup(retainedCleanup);
  const releaseBackground = configureBackgroundWork(
    createBackgroundWork({
      withRepairWork,
      activityChanged: requestVillageRefresh,
      readVillageAuthority,
      mutateVillageAuthority: (update, options) => villageRepository.mutateAuthority(update, options),
      villagesDocuments,
      villagesLogger,
      readVillageState,
      mutateVillageState: mutateVillageMemoryState,
      withUsagePurpose,
      measurePipeline,
      runtimeDebug,
      backgroundCalls: background.backgroundCalls,
      handlers: [
        ["starting-ties", startingTies.handler],
        ["schedule-influence", scheduleInfluence.handler],
        ["wish", wishService.handler],
        ["personal-mail", personalMail.handler],
        ["social-recovery", relationshipSocial.handler],
        ["agenda", bindActivationService(residentAgendas.agendaBackgroundHandler)],
        ["resident-planning", bindActivationService(residentPlanning.handler)],
        ["world-development", bindActivationService(narrative.handler)],
      ],
    }),
  );
  const returnSettlement = createReturnCatchupSettlement({
    socialIdentity: (value, scope) => createCapturedAdmissions(villagesDocuments()).socialIdentity(value, scope),
    relationshipIdentity,
    wishIdentity,
    gate: repairGate(),
    readSnapshot: readVillageSnapshot,
    mutate: mutateVillageMemoryState,
    processSocialOutbox,
  });
  const returnCatchup = createReturnCatchup({
    readAuthority: () => villageRepository.readAuthority({ memories: true, wishes: true }),
    mutateAuthority: (update) => villageRepository.mutateAuthority(update, { memories: true, wishes: true }),
    activityChanged: requestVillageRefresh,
    readSnapshot: readVillageSnapshot,
    mutate: mutateVillageMemoryState,
    queue: (batchId, opportunity, capture) =>
      opportunity.kind === "world"
        ? narrative.queueReturnOpportunity(batchId, opportunity, capture)
        : residentPlanning.queueReturnOpportunity(batchId, opportunity, capture),
    job: backgroundJobSnapshot,
    retryJob: retryBackgroundJob,
    cancel: cancelReturnCatchup,
    settle: returnSettlement.settle,
    reinterpret: relationshipSocial.recoverCatchup,
    hasPresence: hasVillagePresence,
    now: villageNow,
  });
  const releaseReturnCatchup = configureReturnCatchup(returnCatchup);
  const releasePrivateSpaces = configurePrivateSpacePreparation(
    createPrivateSpacePreparation({
      mutateDocument,
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
  const releaseFounding = configureFoundingPreparation(
    createFoundingPreparation({
      proposeOpeningIdea,
      backgroundJobSnapshot,
      readFoundingResidentContext,
      queueFoundingWish,
      readVillageState,
      mutateVillageState: mutateVillageMemoryState,
      buildVillageSnapshot,
      villagesLogger,
      seedFoundingVenueDetails,
      reportFoundingProgress,
      preparePrivateSpaces,
      backgroundWorkSummaries,
      retryBackgroundJob,
      settleBackgroundWork,
      queueVillagerAgenda,
    }),
  );
  const releaseGraph = () => {
    releaseRetainedCleanup();
    retainedCleanup.dispose();
    releaseRepairs();
    releaseSettings();
    releaseFoundingSetup();
    releaseWorldCoordination();
    releaseFounding();
    releaseReturnCatchup();
    releaseBackground();
    releaseUsagePreview();
    releaseUsageMeter();
    releaseCoordinator();
    releaseInterpretationSettings();
    releaseFoundingSuggestions();
    releaseTownMap();
    releaseSignatures();
    releaseSprites();
    releaseSpriteSetup();
    releaseTownMapReview();
    releaseVenueRequests();
    releaseResidentRoster();
    releaseResidentCards();
    releasePersonaCache();
    releaseResidences();
    releaseSceneCommands();
    releaseProjectLifecycle();
    releasePrivateSpaces();
    releaseSceneWriting();
    releaseSceneChanges();
    releaseSceneProgress();
    releaseProjectChecks();
    releaseProjectEvidence();
    releaseVillageSnapshot();
    releaseResidentAgendas();
    releaseSceneArchive();
    releaseLocationImages();
    releaseVenueCommands();
    releaseQueries();
    releaseLiveScenes();
    releaseLiveMemory();
    releaseRelationshipViews();
    releasePersonalMail();
    releaseWishes();
    releaseFoundingProgress();
    releaseWritingSettings();
    releaseVillageState();
    releaseClock();
    releaseRelationships();
    releaseRelationshipSocial();
    releaseRelationshipStore();
    releaseSceneWork();
    releaseInterpretation();
    releaseSystemInterpretation();
    releaseInterpretationEvidence();
    releaseCompactFounding();
    releaseBootstrapRecipes();
    releaseFoundingDrafts();
    releaseMapImages();
    releaseImageGeneration();
    releaseConnections();
    releaseCompletions();
    releaseDebug();
    releaseInterpretationDiagnostics();
    releaseUsage();
    releaseSceneRepository();
    releaseSpinoffs();
    releaseOperations();
    releaseBackgroundContext();
    releaseGallery();
    releaseNativeSchedules();
    releasePersonas();
    release();
    releaseMetrics();
  };
  return { releaseGraph, invalidateHost: release };
}

/** Production uses its explicit owner; direct callers retain synchronous legacy selection. */
export function configureVillagesRuntime(next: CapabilityRuntimeHost, backendIdentity?: object): () => void {
  if (scopedActivation()) return connectVillagesRuntime(next, backendIdentity).releaseGraph;
  const scope = createActivationScope();
  let graph: ReturnType<typeof connectVillagesRuntime>;
  try {
    graph = scope.run(() => connectVillagesRuntime(next, backendIdentity));
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
