import { createFoundingProgress } from "../features/founding/founding-progress-service.js";
import { configureFoundingProgress } from "../features/founding/founding-progress.js";
import { createScenarioImprint } from "../features/founding/scenario-imprint-service.js";
import { configureScenarioImprint } from "../features/founding/scenario-imprint.js";
import { createCompactFounding } from "../features/founding/founding-compact-service.js";
import { configureCompactFounding } from "../features/founding/founding-compact.js";
import { createFoundingDrafts } from "../features/founding/founding-drafts-service.js";
import { configureFoundingDrafts } from "../features/founding/founding-drafts.js";
import { createVillageBootstrap } from "../features/founding/village-bootstrap-service.js";
import { configureVillageBootstrap } from "../features/founding/village-bootstrap.js";
import { createImageGeneration } from "../features/media/image-generation-service.js";
import { configureImageGeneration } from "../features/media/image-generation.js";
import { villageEngineJson as villageImageEngineJson } from "../adapters/engine/engine-loopback.js";
import { decodeVillageImageDataUrl } from "../adapters/engine/image-files.js";
import { villagesImageConnectionChoice } from "../features/settings/connections.js";
import { createTownMapImage } from "../features/media/town-map-image-service.js";
import { configureTownMapImage } from "../features/media/town-map-image.js";
import { readVillageVisualLoreEntries, readVillageVisualLore } from "../adapters/engine/lorebooks.js";
import { createLocationImages } from "../features/media/location-image-service.js";
import { configureLocationImages } from "../features/media/location-image.js";
import { decodeImageDataUrl } from "../features/media/location-image-codec.js";
import { assertVenueImageAccess, setVillageVenueImage } from "../features/venues/services.js";
import { createWishLifecycle } from "../features/residents/wishes/wish-lifecycle-service.js";
import { configureWishLifecycle, wishLifecycle } from "../features/residents/wishes/wish-lifecycle.js";
import { createWishProgress } from "../features/residents/wishes/wish-progress-service.js";
import { configureWishProgress, wishProgress } from "../features/residents/wishes/wish-progress.js";
import { readWishAttemptClock, wishAttemptClocks } from "../features/residents/wishes/wish-attempt-clocks.js";
import {
  readWishOutcome,
  previousFulfilledNeed,
  flushWishOutcomes,
} from "../features/residents/wishes/wish-archive.js";
import { cachedWishCriteria, interpretWishBatch } from "../features/residents/wishes/wish-interpretation.js";
import { createWishArchive } from "../features/residents/wishes/wish-archive-service.js";
import { configureWishArchive } from "../features/residents/wishes/wish-archive.js";
import { createWishInterpretation } from "../features/residents/wishes/wish-interpretation-service.js";
import { configureWishInterpretation } from "../features/residents/wishes/wish-interpretation.js";
import { createRelationshipStore } from "../features/residents/relationship-store-service.js";
import { configureRelationshipStore, mutateRelationships } from "../features/residents/relationship-store.js";
import { createRelationshipSocial } from "../features/residents/relationship-social-service.js";
import { configureRelationshipSocial } from "../features/residents/relationship-social.js";
import { createRelationships } from "../features/residents/relationship-service.js";
import { configureRelationships } from "../features/residents/relationships.js";
import { createLiveMemory } from "../features/residents/live-memory-service.js";
import { configureLiveMemory } from "../features/residents/live-memory.js";
import { createProjectLifecycle } from "../features/projects/project-lifecycle-service.js";
import { reconcileProjectLifecycles } from "../domain/rules/project-lifecycle-rules.js";
import { applyResidenceEditApproval } from "../features/venues/zone-edits.js";
import { queueVillageVenueRequest } from "../features/venues/venue-requests.js";
import { recordVillagerVenueImprovement } from "../features/venues/venue-mailbox.js";
import { WISH_PROPOSAL_INSTRUCTION } from "../domain/rules/wish-progress-rules.js";
import { bindWishProposals } from "../domain/rules/wish-progress-rules.js";
import { projectProposals } from "../domain/rules/project-check-rules.js";
import { createProjectChecks } from "../features/projects/project-check-service.js";
import { configureProjectChecks } from "../features/projects/project-checks.js";
import { pipelineSignal } from "../adapters/observability/metrics-context.js";
import { boundInterpretationEvidence } from "../domain/rules/interpretation-evidence-rules.js";
import { configureInterpretationEvidence, contextualChecks } from "../features/generation/interpretation-evidence.js";
import { createInterpretationEvidence } from "../features/generation/interpretation-evidence-service.js";
import { routeInterpretationChecks } from "../domain/rules/interpretation-routing.js";
import { recordInterpretationRouting } from "../features/generation/interpretation.js";
import { configureInterpretation, interpretChecks } from "../features/generation/interpretation.js";
import { createInterpretation } from "../features/generation/interpretation-service.js";
import { createSystemInterpretation } from "../features/generation/system-interpretation-service.js";
import { resolveVillagesDecisionBackend } from "../adapters/engine/decisions-adapter.js";
import { coordinatedOptionalCompletion, venueInterpretationSettings } from "../jobs/venue-coordinator.js";
import { interpretProjectDraft } from "../features/projects/project-checks.js";
import { finalizeProjectDiagnostics } from "../features/projects/project-checks.js";
import { saveInterpretationContext } from "../features/generation/interpretation-evidence.js";
import { writeInterpretationDiagnostics } from "../features/generation/interpretation-diagnostics.js";
import { stopInterpretationComparisons } from "../features/generation/interpretation-diagnostics.js";
import { scheduleSystemComparisons } from "../features/generation/interpretation-diagnostics.js";
import { venueCheckpoint } from "../jobs/venue-coordinator.js";
import { recoverVenueOperations } from "../jobs/venue-coordinator.js";
import { coordinateVenue } from "../jobs/venue-coordinator.js";
import { cancelVenueOperation } from "../jobs/venue-coordinator.js";
import { mutateDocument } from "../adapters/storage/document-store.js";
import { venueRequestMetrics } from "../adapters/operations/operation-context.js";
import { venueRefusal } from "../adapters/operations/operation-context.js";
import { venueOperationSnapshot } from "../adapters/operations/operation-context.js";
import { outsideVenueOperation } from "../adapters/operations/operation-context.js";
import { assertVenueOwnership } from "../adapters/operations/operation-context.js";
import { sceneWork } from "../features/scenes/scene-work.js";
import { activationScope } from "../adapters/engine/activation-scope.js";
import { proposeVillageResidence } from "../features/venues/residences.js";
import { decideVillageResidence } from "../features/venues/residences.js";
import { pruneVenueVisits } from "../features/scenes/archive.js";
import { requireLiveVenueSession } from "../features/scenes/live-session.js";
import { readSceneChanges } from "../features/scenes/changes.js";
import { VENUE_REPLY_MAX_TOKENS } from "../features/scenes/writing.js";
import { explicitSceneActions } from "../features/scenes/writing.js";
import { generateContactResponse } from "../features/scenes/writing.js";
import { generate } from "../features/scenes/writing.js";
import { interpretRoomDraft } from "../features/scenes/writing.js";
import { createSceneCommands } from "../features/scenes/command-service.js";
import { configureSceneCommands } from "../features/scenes/venue-session.js";
import { interpretRoomReply } from "../features/scenes/room-interpretation.js";
import { wishFingerprint } from "../domain/rules/wish-interpretation-rules.js";
import { rejectVenueCompletion } from "../jobs/venue-coordinator.js";
import { venueOperationSignal } from "../adapters/operations/operation-context.js";
import { venueOperationInput } from "../adapters/operations/operation-context.js";
import { venueOperationId } from "../adapters/operations/operation-context.js";
import { refreshZoneParticipants } from "../features/scenes/live-session.js";
import { createSceneWriting } from "../features/scenes/writing-service.js";
import { configureSceneWriting } from "../features/scenes/writing.js";
import { processProjectWishOutbox } from "../features/residents/wishes/wish-progress.js";
import { dispatchExchange } from "../features/scenes/exchange-processing.js";
import { processLiveRelationships } from "../features/residents/live-memory.js";
import { processLiveMemories } from "../features/residents/live-memory.js";
import { processWishExchange } from "../features/residents/wishes/wish-progress.js";
import { applyProjectPickup } from "../features/projects/project-checks.js";
import { createLiveEvidenceContext } from "../domain/rules/live-exchange.js";
import { configureProjectEvidence, processProjectSpeechTurn } from "../features/projects/project-evidence.js";
import { createProjectEvidence } from "../features/projects/project-evidence-service.js";
import { createSceneProgress } from "../features/scenes/progress-service.js";
import { configureSceneProgress } from "../features/scenes/progress.js";
import { createSceneChanges } from "../features/scenes/changes-service.js";
import { configureSceneChanges } from "../features/scenes/changes.js";
import { sceneReplayEffects } from "../features/scenes/venue-session.js";
import { createLiveScenes } from "../features/scenes/live-session-service.js";
import { configureLiveScenes } from "../features/scenes/live-session.js";
import { hasVenueOperation } from "../jobs/venue-coordinator.js";
import { createSceneQueryService } from "../features/scenes/scene-query-service.js";
import { createSceneRepository } from "../adapters/storage/scene-repository.js";
import {
  configureSceneRepository,
  readActive,
  readSession,
  changeSession,
  clearActivePointer,
} from "../adapters/storage/scene-store.js";
import { createSceneArchive } from "../features/scenes/archive-service.js";
import { configureSceneArchive } from "../features/scenes/archive.js";
import { processSavedProgressSubmission } from "../features/scenes/progress.js";
import { removeInterpretationDiagnostics } from "../features/generation/interpretation-diagnostics.js";
import { relationshipWritingPrompt } from "../domain/rules/relationship-presentation.js";
import { createFoundingSetup } from "../features/founding/founding-setup-service.js";
import { configureFoundingSetup } from "../features/founding/founding-setup.js";
import { readTownMapSubmission } from "../features/media/town-map-review.js";
import {
  configureConnectionSettings,
  readVillageConnectionSettings,
  validateVillageSetupConnections,
} from "../features/settings/connections.js";
import { createConnectionSettings } from "../features/settings/connection-service.js";
import { villagesAgentConnectionId, villagesAgentImageConnectionId } from "../adapters/engine/agent-config.js";
import {
  proposeVillage,
  proposePublicVenueNames,
  draftVillageVenueDescriptions,
  proposeHappenings,
  proposeReaction,
} from "../features/founding/village-bootstrap.js";
import { createTownMapReview } from "../features/media/town-map-review-service.js";
import { configureTownMapReview } from "../features/media/town-map-review.js";
import { createVenueRequests } from "../features/venues/venue-request-service.js";
import { configureVenueRequests } from "../features/venues/venue-requests.js";
import {
  createRenovationProject,
  draftNewVenueProject,
  draftRenovationProject,
  configureProjectLifecycle,
} from "../features/projects/project-lifecycle.js";
import { createResidentRoster } from "../features/residents/resident-roster-service.js";
import { configureResidentRoster } from "../features/residents/resident-roster.js";
import { createResidences } from "../features/venues/residence-service.js";
import {
  configureResidences,
  completeVillageResidence,
  retryResidencePrivateSpaceAdaptation,
} from "../features/venues/residences.js";
import {
  queueSharedMoveConsent,
  queueVenueCounteroffer,
  respondDueVenueMail,
} from "../features/venues/venue-mailbox.js";
import { createResidentAgendas } from "../features/residents/resident-agenda-service.js";
import {
  configureResidentAgendas,
  queueVillagerAgenda,
  backfillAgendas,
  refreshVillagerRemaps,
} from "../features/residents/resident-agendas.js";
import { readEffectiveVillagerCard } from "../adapters/engine/catalog.js";
import { readNativeScheduleSnapshot } from "../adapters/engine/native-schedules.js";
import {
  reserveInitialWishAllowance,
  correctResidentWish,
  reconcileWishLifecycle,
} from "../features/residents/wishes/wish-lifecycle.js";
import { registerInitialWish } from "../features/residents/wishes/wish-initial.js";
import { expireResidentWishes } from "../domain/rules/wish-lifecycle-rules.js";
import { parseCompactFoundingCompletion } from "../domain/rules/compact-founding-rules.js";
import { proposeCompactFounding } from "../features/founding/founding-compact.js";
import { rollActiveAgendas } from "../features/residents/agenda-roll.js";
import { createPersonaCache } from "../features/settings/persona-cache-service.js";
import { configurePersonaCache } from "../features/settings/persona-cache.js";
import { createResidentCards } from "../features/residents/resident-card-service.js";
import { configureResidentCards } from "../features/residents/resident-cards.js";
import {
  configureRuntimeHost,
  VILLAGES_PACKAGE_ID,
  villagesDocuments,
  villagesLogger,
  villagesResources,
  villagesRuntimeEpoch,
} from "../adapters/engine/runtime-host.js";
import { configureNativeSchedules } from "../adapters/engine/native-schedules.js";
import { createNativeSchedules } from "../adapters/engine/native-schedules-service.js";
import { configureGlobalGallery, uploadVillageGalleryImage } from "../adapters/engine/global-gallery.js";
import { createGlobalGallery } from "../adapters/engine/global-gallery-service.js";
import {
  bindActivationService,
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../adapters/engine/activation-scope.js";
import { createVillageRepository } from "../adapters/storage/village-repository.js";
import { createDocumentMutator } from "../adapters/storage/document-store.js";
import {
  configureUsageLedger,
  withUsagePurpose,
  trackUsage,
  inferredPurpose,
  usageProcessOwner,
  readUsageLedger,
  resetUsagePeriod as resetUsageLedgerPeriod,
  saveUsageRate as saveLedgerRate,
  saveLinkApiGroup as saveLedgerGroup,
  quoteUsageRate,
} from "../adapters/models/usage-ledger.js";
import { createUsageLedger } from "../adapters/models/usage-ledger-service.js";
import {
  villageEngineJson,
  villageEngineForm,
  villageEngineBaseUrl,
  deleteVillageSpriteFile,
} from "../adapters/engine/engine-transport.js";
import { inspectVillageImage } from "../adapters/engine/image-files.js";
import { linkApiQuote, readExchangeRate } from "../adapters/models/linkapi-pricing.js";
import { configureMetricsContext } from "../adapters/observability/metrics-context.js";
import { createMetricsContext } from "../adapters/observability/metrics-context-service.js";
import { measurePipeline } from "../adapters/observability/pipeline-metrics.js";
import { configureRuntimeDebug, readRuntimeDebug, runtimeDebug } from "../adapters/observability/runtime-debug.js";
import { createRuntimeDebug } from "../adapters/observability/runtime-debug-service.js";
import { villagesDebugAgentsEnabled } from "../adapters/engine/runtime-host.js";
import { venueDebugContext } from "../adapters/operations/operation-context.js";
import { configureVenueOperationContext } from "../adapters/operations/operation-context.js";
import { createVenueOperationContext } from "../adapters/operations/operation-context-service.js";
import { configureBackgroundContext } from "../adapters/operations/background-context.js";
import { createBackgroundContext } from "../adapters/operations/background-context-service.js";
import { reconcileRelationships } from "../domain/rules/relationship-rules.js";
import { projectSocialActivities, reconcileSocialPlans } from "../domain/rules/social-rules.js";
import { processSocialOutbox } from "../features/residents/relationship-social.js";
import { generateVillageTownMap } from "../features/media/town-map-image.js";
import { createSpriteImageDecoder } from "../features/media/sprite-image-codec.js";
import { createSpriteManager } from "../features/media/sprite-manager-service.js";
import { configureSpriteManager } from "../features/media/sprite-manager.js";
import { generateVillageImage, resolveVillageImageConnectionId } from "../features/media/image-generation.js";
import { createResidentSignatures } from "../features/residents/resident-signature-service.js";
import { configureResidentSignatures } from "../features/residents/resident-signature.js";
import { prepareSignatureImage } from "../features/residents/signature-image.js";
import { createVillageWriting } from "../features/settings/writing-settings-service.js";
import { configureVillageWriting } from "../features/settings/narration-settings.js";
import { createInterpretationSettings } from "../features/settings/interpretation-settings-service.js";
import {
  configureInterpretationSettings,
  readInterpretationSettings,
} from "../features/settings/interpretation-settings.js";
import { createUsageMeter } from "../features/settings/usage-meter-service.js";
import { configureUsageMeter } from "../features/settings/usage-meter.js";
import { createUsagePreview } from "../features/settings/usage-preview-service.js";
import { configureUsagePreview } from "../features/settings/usage-preview.js";
import { persistRelationshipAuthority, readRelationshipState } from "../features/residents/relationship-store.js";
import { configureSceneQueries, sceneQueries } from "../features/scenes/services.js";
import { createSceneWork } from "../features/scenes/scene-work-service.js";
import { configureSceneWork } from "../features/scenes/scene-work.js";
import { processSavedExchange } from "../features/scenes/progress.js";
import { activeVenueSession } from "../features/scenes/live-session.js";
import { listVenueVisits } from "../features/scenes/archive.js";
import { configureWorldRelationships, worldRelationships } from "../features/world/world-relationships.js";
import { createVillageStateService } from "../features/world/village-state-service.js";
import { configureVenueCommands } from "../features/venues/services.js";
import { createVenueCommands } from "../features/venues/venue-service.js";
import { createVenueZoneEdits } from "../features/venues/zone-edit-service.js";
import { configureVenueZoneEdits } from "../features/venues/zone-edits.js";
import { buildVillageSnapshot, configureVillageSnapshot } from "../features/world/snapshot.js";
import { createVillageSnapshot } from "../features/world/snapshot-service.js";
import { captureMissingVillagerCardColors } from "../adapters/engine/catalog.js";
import { privatePreparationRooms } from "../jobs/private-space-preparation.js";
import { configureWorldCoordination } from "../features/world/village.js";
import { createWorldCoordination } from "../features/world/village-service.js";
import { configureVenueMailbox, venueMailbox } from "../features/venues/venue-mailbox.js";
import { createVenueMailbox } from "../features/venues/venue-mailbox-service.js";
import {
  configureWishAttemptClocks,
  createWishAttemptClocks,
} from "../features/residents/wishes/wish-attempt-clocks.js";
import {
  configureVillageStateService,
  mutateVillageState,
  readVillageSnapshot,
  readVillageState,
  readVillageAuthority,
} from "../features/world/village-store.js";
import { configureTownMapGeneration } from "../jobs/town-map-generation.js";
import { createTownMapGeneration } from "../jobs/town-map-service.js";
import { configureVenueCoordinator } from "../jobs/venue-coordinator.js";
import { createVenueCoordinator } from "../jobs/venue-coordinator-service.js";
import {
  configureBackgroundWork,
  queueBackgroundJob,
  retireBackgroundResident,
  previewBackgroundJobs,
} from "../jobs/background-work.js";
import { createBackgroundWork } from "../jobs/background-service.js";
import { configurePrivateSpacePreparation } from "../jobs/private-space-preparation.js";
import { createPrivateSpacePreparation } from "../jobs/private-space-service.js";
import { readVillageLore } from "../adapters/engine/lorebooks.js";
import { villagesLanguageModels } from "../adapters/models/language-models.js";
import { reportFoundingProgress } from "../features/founding/founding-progress.js";
import { completeWithRoom, configureModelCompletions } from "../features/generation/model-requests.js";
import { createModelCompletions } from "../features/generation/completion-service.js";
import { coordinatedCompletion } from "../jobs/venue-coordinator.js";
import { configureInterpretationDiagnostics } from "../features/generation/interpretation-diagnostics.js";
import { createInterpretationDiagnostics } from "../features/generation/interpretation-diagnostics-service.js";
import { configureSystemInterpretation, systemInterpretations } from "../features/generation/system-interpretation.js";
import { villagesConnectionIdFor } from "../features/settings/connections.js";
import { createPersonaQueries } from "../features/settings/persona-service.js";
import { configurePersonaQueries, readLinkedPersona } from "../features/settings/personas.js";
import {
  findPlayerPersona,
  listPlayerPersonas,
  findVillagerCard,
  listVillagerCards,
  toCatalogEntry,
} from "../adapters/engine/catalog.js";
import { createVillageSettings } from "../features/settings/village-settings-service.js";
import { configureVillageSettings } from "../features/settings/village-settings.js";
import { runVillageBootstrap } from "../features/founding/founding-setup.js";
import { createFoundingPreparation } from "../features/founding/preparation-service.js";
import { configureFoundingPreparation, prepareFoundedVillage } from "../features/founding/preparation.js";
import { seedFoundingVenueDetails } from "../features/founding/founding-drafts.js";
import { preparePrivateSpaces } from "../jobs/private-space-preparation.js";
import {
  backgroundStatus,
  backgroundWorkSummaries,
  retryBackgroundJob,
  settleBackgroundWork,
} from "../jobs/background-work.js";
import type { CapabilityRuntimeHost } from "@marinara-engine/shared";
import { randomUUID } from "node:crypto";
import { backendWorkFor } from "./backend-work.js";

// A process identity preserves the existing saved-attempt recovery policy.
const signatureProcessOwner = randomUUID();

/** Connect an application without starting jobs; activation owns the returned release. */
function connectVillagesRuntime(next: CapabilityRuntimeHost, backendIdentity?: object) {
  const backendWork = backendWorkFor(backendIdentity ?? next.persistence?.documents);
  const releaseMetrics = configureMetricsContext(createMetricsContext());
  const release = configureRuntimeHost(next);
  const releasePersonas = configurePersonaQueries(createPersonaQueries({ findPlayerPersona, listPlayerPersonas }));
  const releaseNativeSchedules = configureNativeSchedules(createNativeSchedules({ villagesResources, villagesLogger }));
  const releaseGallery = configureGlobalGallery(createGlobalGallery({ villageEngineJson, villageEngineForm }));
  const background = createBackgroundContext();
  const releaseBackgroundContext = configureBackgroundContext(background);
  const operations = createVenueOperationContext(villagesLogger);
  const releaseOperations = configureVenueOperationContext(operations);
  const releaseSceneRepository = configureSceneRepository(
    createSceneRepository({ villagesDocuments, mutateDocument: createDocumentMutator(villagesDocuments) }),
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
      resetLedger: resetUsageLedgerPeriod,
      saveRate: saveLedgerRate,
      saveGroup: saveLedgerGroup,
      previewBackgroundJobs,
    }),
  );
  const releaseUsagePreview = configureUsagePreview(
    createUsagePreview({
      VILLAGES_PACKAGE_ID,
      villagesDocuments,
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
      outsideVenueOperation: operations.outsideVenueOperation,
      mutateDocument: createDocumentMutator(villagesDocuments),
      systemInterpretations,
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
      villagesImageConnectionChoice,
      decodeVillageImageDataUrl,
    }),
  );
  const releaseMapImages = configureTownMapImage(
    createTownMapImage({ readVillageVisualLoreEntries, generateVillageImage, inspectVillageImage }),
  );
  const releaseScenarioImprint = configureScenarioImprint(
    createScenarioImprint({ readVillageLore, villagesLanguageModels, villagesConnectionIdFor, completeWithRoom }),
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
      resolveVillagesDecisionBackend,
      trackUsage,
      venueOperationSignal,
      coordinatedOptionalCompletion,
      venueCheckpoint,
      venueInterpretationSettings,
      writeInterpretationDiagnostics,
      systemInterpretations,
      bindCallback: (callback) => (completionOwner ? completionOwner.bind(callback) : callback),
    }),
  );
  const releaseWishInterpretation = configureWishInterpretation(
    createWishInterpretation({
      VILLAGES_PACKAGE_ID,
      villagesDocuments,
      interpretChecks,
      systemInterpretations,
      bindCallback: (callback) => (completionOwner ? completionOwner.bind(callback) : callback),
    }),
  );
  const releaseSceneWork = configureSceneWork(createSceneWork(backendWork.navigation));
  const releaseWishClocks = configureWishAttemptClocks(createWishAttemptClocks());
  const releaseRelationshipStore = configureRelationshipStore(
    createRelationshipStore({
      VILLAGES_PACKAGE_ID,
      villagesDocuments,
      mutateDocument: createDocumentMutator(villagesDocuments),
    }),
  );
  const releaseRelationshipSocial = configureRelationshipSocial(
    createRelationshipSocial({ mutateVillageState, mutateRelationships }),
  );
  const releaseRelationshipViews = configureRelationships(
    createRelationships({ readVillageLore, readVillageState, mutateRelationships }),
  );
  const releaseLiveMemory = configureLiveMemory(
    createLiveMemory({ mutateVillageState, readVillageAuthority, readVillageState, mutateRelationships }),
  );
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
  const releaseFoundingProgress = configureFoundingProgress(
    createFoundingProgress({ readVillageState, mutateVillageState }),
  );
  const releaseWishArchive = configureWishArchive(
    createWishArchive({ VILLAGES_PACKAGE_ID, villagesDocuments, readVillageState, mutateVillageState }),
  );
  const releaseWishLifecycle = configureWishLifecycle(
    createWishLifecycle({
      wishAttemptClocks,
      readWishAttemptClock,
      readVillageLore,
      villagesDebugAgentsEnabled,
      villagesLogger,
      villagesLanguageModels,
      backgroundCalls: background.backgroundCalls,
      backgroundSetting: background.backgroundSetting,
      outsideVenueOperation: operations.outsideVenueOperation,
      backgroundStatus,
      queueBackgroundJob,
      settleBackgroundWork,
      completeWithRoom,
      villagesConnectionIdFor,
      mutateVillageState,
      readVillageState,
      flushWishOutcomes,
      previousFulfilledNeed,
      readWishOutcome,
    }),
  );
  const releaseWishProgress = configureWishProgress(
    createWishProgress({
      readEffectiveVillagerCard,
      backgroundCalls: background.backgroundCalls,
      backgroundSetting: background.backgroundSetting,
      outsideVenueOperation: operations.outsideVenueOperation,
      backgroundStatus,
      queueBackgroundJob,
      writeInterpretationDiagnostics,
      sceneQueries,
      mutateVillageState,
      readVillageState,
      cachedWishCriteria,
      interpretWishBatch,
    }),
  );
  const releaseProjectLifecycle = configureProjectLifecycle(
    createProjectLifecycle({
      mutateVillageState,
      villagesDebugAgentsEnabled,
      outsideVenueOperation: operations.outsideVenueOperation,
      preparePrivateSpaces,
      loadProjectWishProgress: () => import("../features/residents/wishes/wish-progress.js"),
      draftNewVenueProject,
      draftRenovationProject,
    }),
  );
  const releaseMailbox = configureVenueMailbox(
    createVenueMailbox({
      readVillageState,
      mutateVillageState,
      queueBackgroundJob,
      villagesConnectionIdFor,
      villagesLanguageModels,
      completeWithRoom,
      createRenovationProject,
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
      villagesDocuments,
      readVillageState,
      mutateVillageState,
    }),
  );
  const releaseSceneWriting = configureSceneWriting(
    createSceneWriting({
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
      wishFingerprint,
      villagesConnectionIdFor,
      readVillageState,
      interpretRoomReply,
    }),
  );
  const releaseSceneCommands = configureSceneCommands(
    createSceneCommands({
      interpretRoomDraft,
      generate,
      generateContactResponse,
      explicitSceneActions,
      VENUE_REPLY_MAX_TOKENS,
      loadBackgroundRetry: () => import("../jobs/background-work.js"),
      loadPrivateSpaceImages: () => import("../features/media/location-image.js"),
      readSceneChanges,
      processSavedExchange,
      activeVenueSession,
      requireLiveVenueSession,
      refreshZoneParticipants,
      pruneVenueVisits,
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
      scheduleSystemComparisons,
      stopInterpretationComparisons,
      writeInterpretationDiagnostics,
      saveInterpretationContext,
      completeWithRoom,
      finalizeProjectDiagnostics,
      interpretProjectDraft,
      projectProposals,
      rollActiveAgendas,
      wishFingerprint,
      bindWishProposals,
      WISH_PROPOSAL_INSTRUCTION,
      villagesConnectionIdFor,
      recordVillagerVenueImprovement,
      mutateVillageState,
      readVillageSnapshot,
      readVillageState,
      queueVillageVenueRequest,
      applyResidenceEditApproval,
    }),
  );
  const releaseSceneProgress = configureSceneProgress(
    createSceneProgress({
      readVillageState,
      readSession,
      processProjectSpeechTurn,
      mutateVillageState,
      changeSession,
      measurePipeline,
      createLiveEvidenceContext,
      applyProjectPickup,
      processWishExchange,
      processLiveMemories,
      processLiveRelationships,
      runtimeDebug,
      dispatchExchange,
      processProjectWishOutbox,
      sceneQueries,
      villagesLogger,
      ...sceneReplayEffects(),
    }),
  );
  const releaseSceneChanges = configureSceneChanges(
    createSceneChanges({
      readSession,
      readVillageSnapshot,
      readVillageState,
      mutateVillageState,
      villagesDocuments,
      processSavedExchange,
      venueRequestMetrics: operations.venueRequestMetrics,
    }),
  );
  const releaseSceneArchive = configureSceneArchive(
    createSceneArchive({
      villagesDocuments,
      readActive,
      readSession,
      readVillageState,
      mutateVillageState,
      processSavedProgressSubmission,
      removeInterpretationDiagnostics,
    }),
  );
  const releaseQueries = configureSceneQueries({
    ...createSceneQueryService({ readSession, readVillageState, villagesDocuments }),
    activeVenueSession,
    listVenueVisits,
    processSavedExchange,
  });
  const releaseProjectChecks = configureProjectChecks(
    createProjectChecks({
      readVillageState,
      mutateVillageState,
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
    createProjectEvidence({ readVillageState, mutateVillageState, sceneQueries }),
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
  const residentAgendas = createResidentAgendas({
    readVillageState,
    mutateVillageState,
    reportFoundingProgress,
    readEffectiveVillagerCard,
    reserveInitialWishAllowance,
    readVillageLore,
    queueBackgroundJob,
    backgroundWorkSummaries,
    parseCompactFoundingCompletion,
    proposeCompactFounding,
    readNativeScheduleSnapshot,
    rollActiveAgendas,
    registerInitialWish,
    correctResidentWish,
  });
  const releaseResidentAgendas = configureResidentAgendas(residentAgendas);
  const residences = createResidences({
    readVillageState,
    mutateVillageState,
    buildVillageSnapshot,
    queueSharedMoveConsent,
    outsideVenueOperation: operations.outsideVenueOperation,
    preparePrivateSpaces,
    readVillageLore,
    queueBackgroundJob,
    villagesLanguageModels,
    villagesConnectionIdFor,
    completeWithRoom,
  });
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
      readVillageState,
      mutateVillageState,
      findVillagerCard,
      queueVillagerAgenda,
      retireBackgroundResident,
    }),
  );
  const releaseVenueRequests = configureVenueRequests(
    createVenueRequests({
      mutateVillageState,
      buildVillageSnapshot,
      draftNewVenueProject,
      draftRenovationProject,
      queueVenueCounteroffer,
    }),
  );
  const releaseTownMapReview = configureTownMapReview(
    createTownMapReview({ readVillageState, mutateVillageState, buildVillageSnapshot, inspectVillageImage }),
  );
  const releaseSprites = configureSpriteManager(
    createSpriteManager({
      readVillageState,
      mutateVillageState,
      buildVillageSnapshot,
      decodeSpriteImage: createSpriteImageDecoder(inspectVillageImage),
      villageEngineJson,
      readSpriteFile: (url) => fetch(villageEngineBaseUrl() + url),
      deleteVillageSpriteFile,
      villagesLogger,
      writes: backendWork.spriteWrites,
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
      readVillageState,
      mutateVillageState,
      buildVillageSnapshot,
      readTownMapSubmission,
      readVillageConnectionSettings,
      validateVillageSetupConnections,
      readLinkedPersona,
      listVillagerCards,
      prepareFoundedVillage,
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
      mutateVillageState,
      buildVillageSnapshot,
      readLinkedPersona,
      runVillageBootstrap,
      villagesLogger,
    }),
  );
  const releaseVenueCommands = configureVenueCommands(
    createVenueCommands({ readVillageState, mutateVillageState, buildVillageSnapshot, sceneQueries }),
  );
  const releaseLocationImages = configureLocationImages(
    createLocationImages({
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
  const worldCoordination = createWorldCoordination({
    readVillageState,
    mutateVillageState,
    buildVillageSnapshot,
    villagesLogger,
    listVillagerCards,
    readEffectiveVillagerCard,
    outsideVenueOperation: operations.outsideVenueOperation,
    completeVillageResidence,
    retryResidencePrivateSpaceAdaptation,
    backfillAgendas,
    refreshVillagerRemaps,
    queueBackgroundJob,
    preparePrivateSpaces,
    proposeHappenings,
    proposeReaction,
    reconcileProjectLifecycles,
    rollActiveAgendas,
    relationshipWritingPrompt,
    expireResidentWishes,
    reconcileWishLifecycle,
    respondDueVenueMail,
  });
  const releaseWorldCoordination = configureWorldCoordination(worldCoordination);
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
        ["wish", wishLifecycle().wishBackgroundHandler],
        ["wish-check", wishProgress().wishCheckBackgroundHandler],
        ["mail", venueMailbox().mailBackgroundHandler],
        ["agenda", bindActivationService(residentAgendas.agendaBackgroundHandler)],
        ["adaptation", bindActivationService(residences.adaptationBackgroundHandler)],
        ["story", bindActivationService(worldCoordination.storyBackgroundHandler)],
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
  const releaseFounding = configureFoundingPreparation(
    createFoundingPreparation({
      readVillageState,
      mutateVillageState,
      buildVillageSnapshot,
      villagesLogger,
      seedFoundingVenueDetails,
      reportFoundingProgress,
      preparePrivateSpaces,
      backgroundStatus,
      backgroundWorkSummaries,
      retryBackgroundJob,
      settleBackgroundWork,
      queueVillagerAgenda,
    }),
  );
  const releaseGraph = () => {
    releaseSettings();
    releaseFoundingSetup();
    releaseWorldCoordination();
    releaseFounding();
    releaseBackground();
    releaseUsagePreview();
    releaseUsageMeter();
    releaseCoordinator();
    releaseInterpretationSettings();
    releaseTownMap();
    releaseZoneEdits();
    releaseSignatures();
    releaseSprites();
    releaseTownMapReview();
    releaseVenueRequests();
    releaseResidentRoster();
    releaseResidentCards();
    releasePersonaCache();
    releaseResidences();
    releaseResidentAgendas();
    releaseSceneCommands();
    releaseMailbox();
    releaseProjectLifecycle();
    releasePrivateSpaces();
    releaseSceneWriting();
    releaseSceneChanges();
    releaseSceneProgress();
    releaseProjectChecks();
    releaseProjectEvidence();
    releaseVillageSnapshot();
    releaseSceneArchive();
    releaseLocationImages();
    releaseVenueCommands();
    releaseWishProgress();
    releaseWishLifecycle();
    releaseQueries();
    releaseLiveScenes();
    releaseLiveMemory();
    releaseRelationshipViews();
    releaseWishArchive();
    releaseFoundingProgress();
    releaseWritingSettings();
    releaseVillageState();
    releaseRelationships();
    releaseRelationshipSocial();
    releaseRelationshipStore();
    releaseWishClocks();
    releaseSceneWork();
    releaseWishInterpretation();
    releaseInterpretation();
    releaseSystemInterpretation();
    releaseInterpretationEvidence();
    releaseScenarioImprint();
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
