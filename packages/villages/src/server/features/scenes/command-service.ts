import { zonePictureBaseline } from "../../domain/rules/zone-picture.js";
import { rememberDomainFact } from "../../domain/rules/domain-memories.js";
import { captureZoneObservation } from "../../domain/rules/zone-observation.js";
import { findLocation, sceneActorIds } from "../../domain/rules/places.js";
import { admitNpcParticipants, type NpcAdmission } from "../../domain/rules/npc-participation.js";
import { applyPlaceExchange } from "../../domain/rules/place-exchange.js";
import { requireSceneExchange, mutableSceneSubmission } from "../../domain/rules/scene-submissions.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { createHash, randomUUID } from "node:crypto";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import { SESSION_PREFIX, sessionSlot } from "../../adapters/storage/scene-slots.js";
import { createSceneHistory } from "../../adapters/storage/scene-history.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import { unfinishedExchange } from "../../domain/decoding/exchange-codec.js";
import type { InterpretationBatch } from "../../domain/models/interpretation-model.js";
import type {
  GreetingTrace,
  VenueLine,
  VenueRecordEvent,
  VenueScene,
  VenueSubmission,
} from "../../domain/models/scene-model.js";
import type { VillageState, VillageVenue } from "../../domain/models/world.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { badGateway, badRequest, conflict, notFound, VillagesRequestError } from "../../domain/rules/errors.js";
import { bindLiveProposals, createLiveEvidenceContext, liveEvidence } from "../../domain/rules/live-exchange.js";
import { sharedLoreHistory } from "../../domain/rules/scene-writing-history.js";
import { applyLiveMemories } from "../../domain/rules/live-memory-application.js";
import { bindProjectSpeech, validateProjectSpeech } from "../../domain/rules/project-interpretation.js";
import { structuralShape as projectZoneShape } from "../../domain/rules/project-structure.js";
import { rejectedInputHash, rejectedSubmission } from "../../domain/rules/rejected-submissions.js";
import { publishRelationshipDisclosures } from "../../domain/rules/relationship-memories.js";
import { filterRelationshipNotices } from "../../domain/rules/relationship-presentation.js";
import { parseRelationshipProposals, RELATIONSHIP_REVIEW_INSTRUCTION } from "../../domain/rules/relationship-review.js";
import { startingRelationshipsReady } from "../../domain/rules/relationship-rules.js";
import { assertSceneMovementCapacity, UnavailableResidentMovement } from "../../domain/rules/resident-movement.js";
import { responseDiagnostics } from "../../domain/rules/response-diagnostics.js";
import { captureSceneAttendance, sceneZoneOccupants } from "../../domain/rules/scene-attendance.js";
import { movedAttentionContacts } from "../../domain/rules/scene-attention.js";
import { sceneContinuityView, cloneSceneFacts, sceneWishEffectIds } from "../../domain/rules/scene-continuity.js";
import { sceneHaltWorldConflict } from "../../domain/rules/scene-halt-world.js";
import { provisionalSceneNarrative } from "../../domain/rules/scene-narrative-effects.js";
import { HaltedSceneTurn } from "../../domain/rules/scene-halt.js";
import { requireSceneZoneId, captureSceneLayout, sceneLayoutVenue } from "../../domain/rules/scene-layout.js";
import { SCENE_MEMORY_INSTRUCTION, sceneMemoryContext } from "../../domain/rules/scene-memories.js";
import { releaseSceneMemories } from "../../domain/rules/scene-memory-lifecycle.js";
import { appendLine } from "../../domain/rules/scene-record.js";
import { parseVenueReply, savedAccessEvents } from "../../domain/rules/scene-reply.js";
import { applyInterpretedRoomEvents } from "../../domain/rules/scene-room-application.js";
import { assertCurrentSceneGeneration, completeSceneObject } from "../../domain/rules/scene-writing-contract.js";
import {
  projectInterpretationNeedsRecovery,
  projectMetadataRejected,
  rejectProjectMetadata,
  semanticAuthorityDomain,
  semanticBlocker,
} from "../../domain/rules/semantic-continuity.js";
import {
  readSemanticEffects,
  SEMANTIC_OPERATION_BUDGET,
  semanticSocialContext,
} from "../../domain/rules/semantic-contract.js";
import { semanticPlayerMoves } from "../../domain/rules/semantic-timeline.js";
import {
  applyAccessCommand,
  claimVisitPermission,
  evaluateZoneAccess,
  managesAccess,
  readAccessCommand,
  settleStandingAccess,
} from "../../domain/rules/venue-access.js";
import {
  contactCanEnter,
  contactNeighbors,
  contactPath,
  contactPosition,
  sceneAccessContext,
  sceneMoveAccompanying,
  type ContactIntent,
} from "../../domain/rules/venue-contact.js";
import { venueClasses, venueResidentIds } from "../../domain/rules/venue-model.js";
import {
  applyVenueSceneChange,
  physicalVenueEvents,
  readVenueSceneChange,
} from "../../domain/rules/venue-scene-state.js";
import {
  canInviteToZone,
  defaultVenueZoneId,
  resolveVenueZone,
  venueInZone,
  venueZones,
  zoneArea,
  zoneClosed,
  zoneControllerIds,
} from "../../domain/rules/venue-zones.js";
import { metadataFailure, completionFailure as typedCompletionFailure } from "../../domain/rules/work-failure.js";
import { zoneEventScene } from "../../domain/rules/zone-events.js";
import { type SceneReply } from "./writing.js";
export interface SceneCommandPorts {
  readCapturedWishContexts: ReturnType<
    typeof import("../../adapters/storage/scene-wish-contexts.js").createSceneWishContexts
  >["read"];
  sceneNarrative?: import("./scene-narrative-service.js").SceneNarrative;
  applySavedStartingTies?: () => Promise<void>;
  withVillageSceneAcceptance?: typeof import("../world/village-store.js").withVillageSceneAcceptance;
  generate: typeof import("./writing.js").generate;
  VENUE_REPLY_MAX_TOKENS: typeof import("./writing.js").VENUE_REPLY_MAX_TOKENS;
  readSceneChanges: typeof import("./changes.js").readSceneChanges;
  processSavedExchange: typeof import("./progress.js").processSavedExchange;
  activeVenueSession: typeof import("./live-session.js").activeVenueSession;
  requireLiveVenueSession: typeof import("./live-session.js").requireLiveVenueSession;
  refreshZoneParticipants: typeof import("./live-session.js").refreshZoneParticipants;
  decideVillageResidence: typeof import("../venues/residences.js").decideVillageResidence;
  proposeVillageResidence: typeof import("../venues/residences.js").proposeVillageResidence;
  activationScope():
    | Pick<NonNullable<ReturnType<typeof import("../../adapters/engine/activation-scope.js").activationScope>>, "run">
    | undefined;
  bindReplayEffects: typeof import("../../adapters/engine/activation-scope.js").bindActivationService;
  sceneWork(): Pick<
    ReturnType<typeof import("./scene-work.js").sceneWork>,
    | "serializeNavigation"
    | "markMovement"
    | "clearMovement"
    | "isMoving"
    | "greetingTask"
    | "rememberGreeting"
    | "forgetGreeting"
    | "abortGreeting"
  >;
  villagesDebugAgentsEnabled: typeof import("../../adapters/engine/runtime-host.js").villagesDebugAgentsEnabled;
  villagesDocuments(): ReturnType<typeof import("../../adapters/engine/runtime-host.js").villagesDocuments>;
  villagesLogger(): Pick<
    ReturnType<typeof import("../../adapters/engine/runtime-host.js").villagesLogger>,
    "debug" | "info" | "warn"
  >;
  villagesLanguageModels(): Pick<
    ReturnType<typeof import("../../adapters/models/language-models.js").villagesLanguageModels>,
    "resolveForRequest"
  >;
  loadPrivateSpaceImages(): Promise<
    Pick<typeof import("../media/location-image.js"), "generateFirstZoneImage"> &
      Partial<Pick<typeof import("../media/location-image.js"), "requestZonePicture">>
  >;
  runtimeDebug: typeof import("../../adapters/observability/runtime-debug.js").runtimeDebug;
  assertVenueOwnership: typeof import("../../adapters/operations/operation-context.js").assertVenueOwnership;
  outsideVenueOperation: typeof import("../../adapters/operations/operation-context.js").outsideVenueOperation;
  venueOperationId: typeof import("../../adapters/operations/operation-context.js").venueOperationId;
  venueOperationSignal: typeof import("../../adapters/operations/operation-context.js").venueOperationSignal;
  venueOperationSnapshot: typeof import("../../adapters/operations/operation-context.js").venueOperationSnapshot;
  venueRefusal: typeof import("../../adapters/operations/operation-context.js").venueRefusal;
  venueRequestMetrics: typeof import("../../adapters/operations/operation-context.js").venueRequestMetrics;
  mutateDocument: typeof import("../../adapters/storage/document-store.js").mutateDocument;
  changeSession: typeof import("../../adapters/storage/scene-store.js").changeSession;
  clearActivePointer: typeof import("../../adapters/storage/scene-store.js").clearActivePointer;
  selectActiveScene: typeof import("../../adapters/storage/scene-store.js").selectActiveScene;
  readActive: typeof import("../../adapters/storage/scene-store.js").readActive;
  readSession: typeof import("../../adapters/storage/scene-store.js").readSession;
  cancelVenueOperation: typeof import("../../jobs/venue-coordinator.js").cancelVenueOperation;
  coordinateVenue: typeof import("../../jobs/venue-coordinator.js").coordinateVenue;
  hasVenueOperation: typeof import("../../jobs/venue-coordinator.js").hasVenueOperation;
  recoverVenueOperations: typeof import("../../jobs/venue-coordinator.js").recoverVenueOperations;
  rejectVenueCompletion: typeof import("../../jobs/venue-coordinator.js").rejectVenueCompletion;
  venueCheckpoint: typeof import("../../jobs/venue-coordinator.js").venueCheckpoint;
  completeWithRoom: typeof import("../generation/model-requests.js").completeWithRoom;
  rollActiveAgendas: typeof import("../residents/resident-agendas.js").rollActiveAgendas;
  bindWishProposals: typeof import("../../domain/rules/wish-progress-rules.js").bindWishProposals;
  WISH_PROPOSAL_INSTRUCTION: typeof import("../../domain/rules/wish-progress-rules.js").WISH_PROPOSAL_INSTRUCTION;
  villagesConnectionIdFor: typeof import("../settings/connections.js").villagesConnectionIdFor;
  mutateVillageState: typeof import("../world/village-store.js").mutateVillageState;
  readVillageSnapshot: typeof import("../world/village-store.js").readVillageSnapshot;
  readVillageState: typeof import("../world/village-store.js").readVillageState;
  queueVillageVenueRequest: typeof import("../venues/venue-requests.js").queueVillageVenueRequest;
}
/** Inert Scene command orchestration; callbacks retain originating feature connections. */
export function createSceneCommands({
  readCapturedWishContexts,
  sceneNarrative,
  applySavedStartingTies,
  withVillageSceneAcceptance,
  generate,
  VENUE_REPLY_MAX_TOKENS,
  readSceneChanges,
  processSavedExchange,
  activeVenueSession,
  requireLiveVenueSession,
  refreshZoneParticipants,
  decideVillageResidence,
  proposeVillageResidence,
  activationScope,
  bindReplayEffects,
  sceneWork,
  villagesDebugAgentsEnabled,
  villagesDocuments,
  villagesLogger,
  villagesLanguageModels,
  loadPrivateSpaceImages,
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
  selectActiveScene,
  readActive,
  readSession,
  cancelVenueOperation,
  coordinateVenue,
  hasVenueOperation,
  recoverVenueOperations,
  rejectVenueCompletion,
  venueCheckpoint,
  completeWithRoom,
  rollActiveAgendas,
  bindWishProposals,
  WISH_PROPOSAL_INSTRUCTION,
  villagesConnectionIdFor,
  mutateVillageState: mutateVillageStateWithoutPlaces,
  readVillageSnapshot,
  readVillageState: readVillageStateWithoutPlaces,
  queueVillageVenueRequest,
}: SceneCommandPorts) {
  const readVillageState: typeof readVillageStateWithoutPlaces = (options) =>
    readVillageStateWithoutPlaces({ ...options, memories: true });
  const mutateVillageState: typeof mutateVillageStateWithoutPlaces = (change, options) =>
    mutateVillageStateWithoutPlaces(change, { ...options, memories: true });
  async function exactWishContexts(contexts: VenueSubmission["wishContexts"], scene: VenueScene) {
    if (Array.isArray(contexts)) return contexts;
    if (!contexts) throw conflict("The saved Wish context is unavailable. Its source is retained.");
    return readCapturedWishContexts(contexts, scene);
  }
  /** Only this explicit request may replace missing/invalid metadata with another interpretation. */
  async function retrySceneChangeInterpretation(
    id: string,
    submissionId: string,
    domain: "memories" | "relationships" | "wishes" | "projects",
    retryOfAttemptId?: string,
  ) {
    return coordinateVenue(
      id,
      `change:${submissionId}:${domain}`,
      "change-interpretation",
      {
        submissionId,
        domain,
        ...((await readSession(id)).semanticVersion === 2 ? { semanticBudget: SEMANTIC_OPERATION_BUDGET } : {}),
      },
      undefined,
      retryOfAttemptId,
      () => retrySceneChangeInterpretationOnce(id, submissionId, domain),
    );
  }

  class InvalidProjectRecoveryResponse extends VillagesRequestError {
    constructor(message: string) {
      super(502, message);
    }
  }

  async function retrySceneChangeInterpretationOnce(
    id: string,
    submissionId: string,
    domain: "memories" | "relationships" | "wishes" | "projects",
    automatic = false,
  ) {
    // A failed Project proposal must be reassessed before its newly repaired application can run.
    if (domain !== "projects") await processSavedExchange(id, submissionId);
    const scene = await readSession(id),
      turn = scene.submissions.find((turn) => turn.id === submissionId);
    if (!turn?.processing || !turn.liveProposals) throw badRequest("No saved live exchange to interpret.");
    if (turn.processing.domains[domain].status !== "failed") return readSceneChanges(id);
    const village = await readVillageState();
    if (village.seed !== scene.villageSeed) throw conflict("Village identity changed.");
    const proposals = turn.liveProposals;
    const interpretationWishes = domain === "wishes" ? await exactWishContexts(turn.wishContexts, scene) : undefined;
    const originalProjectProposals = JSON.stringify(turn.projectSpeech ?? []);
    const originalSourceHash = turn.semanticProvenance?.sourceHash;
    const result = await venueCheckpoint("change-interpretation", async () => {
      const nativeMemory = sceneMemoryContext(
        village,
        ["player", ...scene.activeIds],
        turn.message,
        liveEvidence(scene, proposals)
          .map((line) => line.content)
          .join("\n"),
        sharedLoreHistory(
          scene,
          scene.lines.filter((line) => proposals.earlierLineIds.includes(line.id)),
          scene.activeIds,
        ).join("\n"),
      );
      let model = await villagesLanguageModels().resolveForRequest({
        connectionId: await villagesConnectionIdFor("system"),
      });
      let messages: CapabilityLanguageModelMessage[] = [
        {
          role: "system",
          content: `Interpret ONLY the supplied saved exchange for ${domain}. Do not rewrite narration, change physical state, or invent evidence. ${domain === "wishes" ? WISH_PROPOSAL_INSTRUCTION : domain === "projects" ? 'Return projectSpeech:[{projectId,revision,kind:"approval|builder|withdrawal",speakerId,citations:[{lineId,quote}]}]. Judge only supplied Projects and revisions against the full saved exchange. Distinguish unconditional consent and personal commitment to lead from capability, conditional willingness and refusal. One exchange can support approval and volunteering. Cite exact current saved speaker words. No speech starts or completes construction. Omit unsupported rows.' : domain === "relationships" ? RELATIONSHIP_REVIEW_INSTRUCTION.replace("Return relationshipReview:", "Return relationshipChanges:") : SCENE_MEMORY_INSTRUCTION} Use exact saved evidence IDs, not numeric indexes. Return JSON only.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            evidence: liveEvidence(scene, proposals).filter(
              (line) =>
                domain !== "wishes" || line.id === proposals.playerLineId || proposals.replyLineIds.includes(line.id),
            ),
            residents: village.villagers.map((person) => ({ id: person.characterId, name: person.cardSnapshot.name })),
            ...(domain === "memories" ? { memory: nativeMemory.envelope } : {}),
            ...(domain === "projects"
              ? {
                  projects: (turn.projectContexts ?? []).map((context) => ({
                    ...context,
                    title: village.projects.find((project) => project.id === context.projectId)?.title,
                  })),
                  originalProposals: turn.projectSpeech ?? [],
                }
              : {}),
            ...(domain === "wishes"
              ? {
                  owners: interpretationWishes,
                }
              : {}),
            ...(domain === "relationships"
              ? {
                  social: semanticSocialContext(scene, village, "", sceneContinuityView(village, scene)),
                  zones: village.venues.map((venue) => ({ id: venue.id, zones: venueZones(venue) })),
                  zoneControllers: village.venues.flatMap((venue) =>
                    venueZones(venue).map((zone) => ({
                      venueId: venue.id,
                      zoneId: zone.id,
                      controllerIds: zoneControllerIds(venue, zone),
                    })),
                  ),
                }
              : {}),
          }),
        },
      ];
      if (turn.semanticProvenance?.version === 2)
        messages[0].content +=
          " This is a v2 System-owned event. Interpret paraphrases and contextual short answers without phrase tests. No model-authored provenance or verification flags.";
      const output = turn.semanticProvenance?.version === 2 ? 4096 : VENUE_REPLY_MAX_TOKENS;
      const request = await venueCheckpoint("change-interpretation:input", async () => ({
        messages,
        connectionId: model.connectionId,
        model: model.model,
        output,
      }));
      if (model.connectionId !== request.connectionId || model.model !== request.model)
        model = await villagesLanguageModels().resolveForRequest({ connectionId: request.connectionId });
      if (model.model !== request.model) throw conflict("The saved System model changed.");
      messages = request.messages;
      const fitted = model.fitContext(messages, { maxTokens: request.output });
      if (JSON.stringify(fitted.messages) !== JSON.stringify(messages))
        throw badGateway("Saved evidence does not fit interpretation context.");
      if (
        turn.semanticProvenance?.version === 2 &&
        (fitted.estimatedTokensBefore ?? Buffer.byteLength(JSON.stringify(messages))) > 12000
      )
        throw badGateway("Saved evidence exceeds the System context budget.");
      const completion = await completeWithRoom(
        model,
        fitted.messages,
        Math.min(fitted.maxTokens ?? request.output, request.output),
        {
          responseFormat: { type: "json_object" },
          temperature: 0,
          reasoningEffort: null,
          verbosity: null,
          debugMode: false,
          signal: venueOperationSignal(),
          usagePurpose: "checks",
        },
      );
      const raw = completeSceneObject(completion.content ?? "", completion.finishReason);
      const diagnostics = responseDiagnostics(model, completion, fitted.maxTokens ?? VENUE_REPLY_MAX_TOKENS, raw);
      let value =
        domain === "memories"
          ? raw?.memoryChanges
          : domain === "wishes"
            ? raw?.wishChanges
            : domain === "projects"
              ? raw?.projectSpeech
              : raw?.relationshipChanges;
      if (turn.semanticProvenance?.version === 2) {
        const key = {
          memories: "memoryChanges",
          relationships: "relationshipChanges",
          wishes: "wishChanges",
          projects: "projectSpeech",
        }[domain];
        value = readSemanticEffects({ ...raw, sourceHash: "recovery" }, "recovery")[key];
      }
      if (
        domain !== "relationships"
          ? !Array.isArray(value)
          : !["changes", "permissions", "disclosures"].every((key) => Array.isArray(asRecord(value)[key]))
      ) {
        await rejectVenueCompletion();
        diagnostics.missingFields = [
          domain === "memories" ? "memoryChanges" : domain === "wishes" ? "wishChanges" : "relationshipChanges",
        ];
        const message = "Interpretation metadata is still incomplete. Another model request requires explicit retry.";
        const failure =
          typedCompletionFailure(completion, "change-interpretation", fitted.maxTokens ?? VENUE_REPLY_MAX_TOKENS) ??
          (!raw
            ? { cause: "invalid_json" as const, stage: "change-interpretation", message }
            : metadataFailure(message, diagnostics));
        throw Object.assign(
          domain === "projects" && automatic
            ? new InvalidProjectRecoveryResponse(failure.message)
            : badGateway(failure.message),
          { failure: { ...failure, responseDiagnostics: diagnostics } },
        );
      }
      let recoveredProjects: NonNullable<VenueSubmission["projectSpeech"]> | undefined;
      if (domain === "projects") {
        const lines = scene.lines.filter((line) => proposals.replyLineIds.includes(line.id));
        const mapped = (value as unknown[]).map((value) => {
          const row = asRecord(value);
          return {
            ...row,
            citations: Array.isArray(row.citations)
              ? row.citations.map((value) => {
                  const citation = asRecord(value);
                  return { ...citation, segment: lines.findIndex((line) => line.id === citation.lineId) };
                })
              : [],
          };
        });
        recoveredProjects = bindProjectSpeech(mapped, turn.projectContexts ?? [], lines);
        if (turn.semanticProvenance?.version === 2)
          for (const proposal of recoveredProjects)
            proposal.contextual = { version: 1, source: "system", checkId: venueOperationId() };
        if (
          mapped.length > 6 ||
          recoveredProjects.length !== mapped.length ||
          recoveredProjects.some((proposal) => !!validateProjectSpeech(proposal, lines))
        ) {
          await rejectVenueCompletion();
          throw automatic
            ? new InvalidProjectRecoveryResponse(
                "Project recovery did not cite valid saved speech and context. Retry interpretation.",
              )
            : badGateway("Project recovery did not cite valid saved speech and context. Retry interpretation.");
        }
      }
      return {
        value,
        recoveredProjects,
        responseDiagnostics: diagnostics,
        memoryContexts: { [nativeMemory.saved.protection.fingerprint]: nativeMemory.saved },
        requests: venueRequestMetrics(),
      };
    });
    await changeSession(id, (saved) => {
      if (saved.villageSeed !== village.seed) throw conflict("Village identity changed.");
      const entry = mutableSceneSubmission(saved, submissionId)!;
      if (!entry.liveProposals || entry.processing?.domains[domain].status !== "failed") return;
      if (
        domain === "projects" &&
        (JSON.stringify(entry.projectSpeech ?? []) !== originalProjectProposals ||
          entry.semanticProvenance?.sourceHash !== originalSourceHash)
      )
        throw conflict("The saved Project proposal changed during recovery.");
      entry.interpretationHistory ||= [];
      entry.interpretationHistory.push({
        at: turn.at ?? "",
        domain,
        source: "saved narration reply",
        proposals:
          domain === "wishes"
            ? entry.wishProposals
            : domain === "projects"
              ? entry.projectSpeech
              : entry.liveProposals[domain === "memories" ? "memoryChanges" : "relationshipChanges"],
      });
      entry.interpretationHistory.push({
        at: villageNow().toISOString(),
        domain,
        source: "explicit System retry",
        proposals: result.value,
        responseDiagnostics: result.responseDiagnostics,
      });
      if (domain === "wishes") {
        const bound = bindWishProposals(
          result.value,
          village,
          saved.lines,
          entry.liveProposals.playerLineId,
          entry.liveProposals.replyLineIds,
          interpretationWishes,
          entry.semanticProvenance?.version === 2,
        );
        entry.wishProposals = bound.proposals;
        entry.wishAuthority = bound.authority;
        entry.wishProposalError = bound.error;
      } else if (domain === "projects") {
        entry.projectSpeech = result.recoveredProjects ?? [];
        entry.projectInterpretationVersion = 1;
        entry.progressProcessedAt = undefined;
        entry.progressError = "";
      } else entry.liveProposals[domain === "memories" ? "memoryChanges" : "relationshipChanges"] = result.value;
      if (entry.effectFailures) delete entry.effectFailures[domain];
      if (domain === "memories") entry.liveProposals.memoryContexts = result.memoryContexts;
      entry.requestMetrics = [...(entry.requestMetrics ?? []), ...(result.requests ?? [])];
      entry.processing.domains[domain].status = "pending";
    });
    await processSavedExchange(id, submissionId);
    if (!automatic) await finishSemanticScene(id);
    return readSceneChanges(id);
  }

  function appendVenueReply(
    session: VenueScene,
    lines: ReturnType<typeof parseVenueReply>["lines"],
    at: string,
    admissions: readonly NpcAdmission[] = [],
  ): string[] {
    admitNpcParticipants(session, admissions);
    const lineIds = lines.map(() => randomUUID());
    lines.forEach((line, index) =>
      appendLine(session, {
        id: lineIds[index]!,
        speakerId: line.speakerId,
        name:
          line.kind === "narration"
            ? "Narration"
            : (session.participants.find((person) => person.characterId === line.speakerId)?.name ?? ""),
        role: line.role ?? "assistant",
        ...(line.zoneId ? { zoneId: line.zoneId } : {}),
        ...(line.soundOnly ? { soundOnly: line.soundOnly } : {}),
        ...(line.speechSource ? { speechSource: line.speechSource } : {}),
        content: line.content,
        at,
        heardBy: line.heardBy,
        ...(line.viaDoorway ? { viaDoorway: true } : {}),
        ...(line.physicalIdsAfter ? { physicalIdsAfter: line.physicalIdsAfter } : {}),
        ...(line.contactHidden ? { contactHidden: true } : {}),
        ...(line.attentionEvidence ? { attentionEvidence: true } : {}),
        ...(line.contactReport ? { contactReport: true } : {}),
        kind: line.kind,
        ...(line.delivery ? { delivery: line.delivery } : {}),
        ...(line.presentation ? { presentation: line.presentation } : {}),
        ...(line.staging?.length ? { staging: line.staging } : {}),
        ...(line.targetId ? { targetId: line.targetId } : {}),
        ...(line.anchorIndex !== undefined ? { asideFor: lineIds[line.anchorIndex]! } : {}),
      }),
    );
    return lineIds;
  }

  function validatePlaceReply(world: VillageState, scene: VenueScene, reply: SceneReply) {
    if (!reply.npcAdmissions?.length && !reply.placeDiscoveries?.length && !reply.establishmentProgress?.length) return;
    const lines = reply.lines.map((line, index) => ({
      ...line,
      id: `draft:${index}`,
      name: "",
      role: "assistant" as const,
      at: scene.startedAt,
    }));
    applyPlaceExchange(
      { ...world, worldPlaces: structuredClone(world.worldPlaces), projects: structuredClone(world.projects) },
      { ...scene, lines },
      {
        id: "validate",
        at: scene.continuity?.capturedAt ?? scene.startedAt,
        zoneIdAtTurn: scene.zoneId,
        replyLineIds: lines.map((line) => line.id),
        npcAdmissions: reply.npcAdmissions,
        placeDiscoveries: reply.placeDiscoveries,
        establishmentProgress: reply.establishmentProgress,
      },
    );
  }

  function serializedNavigation<T>(operation: () => Promise<T>): Promise<T> {
    return sceneWork().serializeNavigation(operation);
  }

  async function moveVenueZone(
    sessionId: string,
    zoneId: string,
    expectedSceneRevision?: number,
    retryOfAttemptId?: string,
    operationId?: string,
  ): Promise<VenueScene> {
    return withSceneActivation(() =>
      moveVenueZoneInActivation(sessionId, zoneId, expectedSceneRevision, retryOfAttemptId, operationId),
    );
  }

  async function moveVenueZoneInActivation(
    sessionId: string,
    zoneId: string,
    expectedSceneRevision?: number,
    retryOfAttemptId?: string,
    operationId?: string,
  ): Promise<VenueScene> {
    operationId ??= `move:${zoneId}:${expectedSceneRevision ?? (await readSession(sessionId)).sceneRevision}`;
    const saved = await readSession(sessionId);
    const receipt = saved.navigationReceipts?.find((entry) => entry.id === operationId);
    if (receipt) {
      if (receipt.destinationZoneId !== zoneId) throw conflict("That navigation ID belongs to a different Zone.");
      // A delayed retry must never move the player back after newer navigation.
      if (saved.operation?.id !== operationId || saved.operation.status === "complete")
        return requireLiveVenueSession(sessionId);
    }
    return coordinateVenue(
      sessionId,
      operationId,
      "move",
      { zoneId },
      expectedSceneRevision,
      retryOfAttemptId,
      () => {
        const work = sceneWork();
        return work.serializeNavigation(async () => {
          work.markMovement(sessionId);
          try {
            return await moveVenueZoneOnce(sessionId, zoneId);
          } finally {
            work.clearMovement(sessionId);
          }
        });
      },
      { replay: !!receipt },
    );
  }

  async function moveVenueZoneOnce(sessionId: string, zoneId: string): Promise<VenueScene> {
    assertVenueOwnership();
    let session = await requireLiveVenueSession(sessionId);
    if (!session.sceneAttendance) session = await refreshZoneParticipants(session, true);
    const operationId = venueOperationId();
    const recorded = session.navigationReceipts?.some((entry) => entry.id === operationId);
    if (recorded) {
      await markZoneSeen(session, false);
      return refreshZoneParticipants(session, true);
    }
    const blocker = semanticBlocker(session);
    if (blocker) throw conflict(blocker);
    if (session.status !== "active") throw conflict("Wait for the current scene to finish opening.");
    const village = sceneContinuityView(await readVillageState(), session),
      location = findLocation(village, session.placeId),
      venue = location && sceneLayoutVenue(location, session);
    const zone = venue && resolveVenueZone(venue, zoneId);
    if (!venue || !zone) throw notFound("That zone is not in this Venue.");
    if (!venue.access) throw conflict("That Place has no native access record.");
    if (session.zoneId === zone.id)
      return changeSession(sessionId, (state) => {
        state.navigationReceipts ??= [];
        state.navigationReceipts.push({
          id: operationId,
          originZoneId: zone.id,
          destinationZoneId: zone.id,
          at: villageNow().toISOString(),
        });
      });
    if (zoneClosed(village, venue, zone)) throw conflict("This zone is closed for Renovation.");
    const accompanying = sceneMoveAccompanying(session, venue, zone);
    if (
      !contactPath(village, venue, requireSceneZoneId(session), zone.id, "player", {
        ...session,
        accompanying,
      })
    )
      throw conflict(
        "There is no permitted connection route to that space; its controller may need to grant an invitation.",
      );
    const people = sceneZoneOccupants({ ...session, accompanying }, venue, zone.id);
    if (people.filter((person) => !person.characterId.startsWith("npc:")).length > 4)
      throw conflict("Five residents occupy this Zone in the Scene. Choose another Zone.");
    const decision = evaluateZoneAccess(venue, zone, "player", {
      ...sceneAccessContext({ ...session, accompanying }, village),
      accepting: true,
      unavailable: zoneClosed(village, venue, zone),
      environment: village.narrative,
    });
    if (!decision.allowed) throw conflict(decision.explanation);
    await changeSceneVenues(session, (state) => {
      const captured = findLocation(state, venue.id)!;
      claimVisitPermission(captured, decision.permissionId, session.id);
    });
    await mutateVillageState((state) => {
      const current = findLocation(state, venue.id);
      const target = current && resolveVenueZone(current, zone.id);
      if (!current || !target) return;
      const decision = evaluateZoneAccess(current, target, "player", {
        ...sceneAccessContext({ ...session, accompanying }, state),
        accepting: true,
        unavailable: zoneClosed(state, current, target),
        environment: state.narrative,
      });
      if (!decision.allowed) {
        if (session.continuity) return;
        throw conflict(decision.explanation);
      }
      claimVisitPermission(current, decision.permissionId, session.id);
    });
    const moved = await changeSession(sessionId, (state) => {
      if (state.navigationReceipts?.some((entry) => entry.id === operationId)) return;
      const originZoneId = requireSceneZoneId(state);
      const at = villageNow().toISOString();
      state.navigationReceipts ??= [];
      state.navigationReceipts.push({ id: operationId, originZoneId, destinationZoneId: zone.id, at });
      state.enteredFromZoneId = state.zoneId;
      state.zoneId = zone.id;
      state.accessPreviousZones ??= {};
      for (const entry of accompanying ?? []) {
        const prior = contactPosition(state, entry.characterId);
        if (prior && prior !== entry.zoneId) state.accessPreviousZones[entry.characterId] = prior;
      }
      state.accompanying = accompanying ?? [];
      state.doorwayContacts = movedAttentionContacts(venue, session, state);
      state.entryOffers = state.entryOffers?.filter((entry) => entry.zoneId !== zone.id);
      for (const person of people) {
        if (!state.participants.some((entry) => entry.characterId === person.characterId))
          state.participants.push({ characterId: person.characterId, name: person.name, doing: person.doing });
      }
      state.activeIds = people.map((person) => person.characterId);
      state.spaceClass = zone.venueClass;
      state.area = zoneArea(zone);
      state.privateOwnerId = zone.ownerId ?? "";
      state.lastActivityAt = at;
      state.recap = "";
    });
    await markZoneSeen(moved);
    return refreshZoneParticipants(moved, true);
  }

  async function markZoneSeen(session: VenueScene, generateImage = true): Promise<void> {
    if (session.continuity) {
      await changeSceneVenues(session, (state) => {
        const venue = findLocation(state, session.placeId);
        const zone = venue && resolveVenueZone(venue, requireSceneZoneId(session));
        if (venue && zone && contactCanEnter(state, venue, zone.id, "player", session)) zone.seen = true;
      });
    }
    if (!findLocation(await readVillageState(), session.placeId)) return;
    const pointer = await readActive();
    const currentScene = await readSession(session.id);
    if (
      pointer.sessionId !== session.id ||
      currentScene.status === "closed" ||
      currentScene.zoneId !== session.zoneId ||
      semanticBlocker(currentScene)
    )
      return;
    const observedVenue = findLocation(currentScene.continuity?.facts, session.placeId);
    const observed = observedVenue && resolveVenueZone(observedVenue, requireSceneZoneId(session));
    let admitted = false;
    await mutateVillageState((state) => {
      admitted = false;
      const venue = findLocation(state, session.placeId);
      const zone = venue && resolveVenueZone(venue, requireSceneZoneId(session));
      if (
        !venue ||
        !zone ||
        zoneClosed(state, venue, zone) ||
        (venue.access &&
          !evaluateZoneAccess(venue, zone, "player", {
            ...sceneAccessContext(session, state),
            unavailable: zoneClosed(state, venue, zone),
            environment: state.narrative,
          }).allowed)
      )
        return;
      zone.seen = true;
      const account =
        observed && observedVenue
          ? captureZoneObservation(observedVenue, observed)
          : captureZoneObservation(venue, zone);
      // Saved artwork follows its observed physical account, even while an old Scene owns captured facts.
      zone.observed =
        zonePictureBaseline(zone.picture?.context ?? zone.picture?.baseline ?? "") === account.context
          ? {
              ...account,
              image: zone.image,
              daylight: zone.picture?.daylight,
              night: zone.picture?.night,
              pictureContext: zone.picture?.context ?? zone.picture?.baseline,
            }
          : account;
      admitted = true;
    });
    if (!admitted) return;
    if (
      !generateImage ||
      hasVenueOperation(session.id) ||
      !findLocation(await readVillageState(), session.placeId) ||
      !(await readVillageState()).venues.some((venue) => venue.id === session.placeId)
    )
      return;
    outsideVenueOperation(() => {
      void loadPrivateSpaceImages()
        .then(({ requestZonePicture }) => requestZonePicture?.(session.placeId, requireSceneZoneId(session)))
        .catch(() => {});
    });
  }

  function enterVenue(placeId: string, requestedZoneId?: string, expectedSceneRevision?: number): Promise<VenueScene> {
    return withSceneActivation(() => enterVenueInActivation(placeId, requestedZoneId, expectedSceneRevision));
  }

  function enterVenueInActivation(
    placeId: string,
    requestedZoneId?: string,
    expectedSceneRevision?: number,
  ): Promise<VenueScene> {
    return serializedNavigation(() => enterVenueOnce(placeId, requestedZoneId, expectedSceneRevision));
  }

  async function enterVenueOnce(
    placeId: string,
    requestedZoneId?: string,
    expectedSceneRevision?: number,
  ): Promise<VenueScene> {
    const pointer = await readActive();
    if (pointer.sessionId && hasVenueOperation(pointer.sessionId))
      throw venueRefusal("SCENE_BUSY", "Wait for the scene reply before entering another Zone.");
    const existing = await activeVenueSession();
    if (!existing) {
      await applySavedStartingTies?.();
      await rollActiveAgendas();
    }
    const live = await readVillageState();
    const village = existing ? sceneContinuityView(live, existing) : live;
    const place = findLocation(village, placeId);
    if (!place) throw notFound("That place is not in this village.");
    if (!place.access) throw conflict("That Place has no native access record.");
    const discovery = live.worldPlaces.places[placeId];
    if (discovery && (!discovery.knownBy.includes("player") || !discovery.prepared))
      throw conflict("Prepare this known Place before visiting.");
    if (!existing && !startingRelationshipsReady(village))
      throw conflict(
        "Starting relationship history is not ready. Open Inspect → Relationships to check preparation, retry failed work, or clarify history before opening a Scene.",
      );
    const classes = venueClasses(place),
      spaceClass = classes.find((entry) => entry !== "residence") ?? classes[0]!;
    const requested =
      requestedZoneId ?? defaultVenueZoneId(place, spaceClass === "residence" ? "shared" : "public", spaceClass);
    let zone = resolveVenueZone(place, requested);
    if (!zone) throw notFound("That zone is not in this Venue.");
    if (zoneClosed(village, place, zone)) {
      if (
        !existing &&
        (place.constructionStatus === "worksite" ||
          village.projects.some(
            (project) =>
              project.kind === "renovation" &&
              project.venueId === place.id &&
              ["construction", "finishing"].includes(project.lifecycle?.phase ?? ""),
          ))
      )
        zone = resolveVenueZone(place, "exterior")!;
      else throw conflict("This Venue zone is closed for Renovation. Other zones remain open.");
    }
    if (existing) {
      if (existing.placeId !== placeId) throw conflict(`Finish the Scene in ${existing.placeName} first.`);
      if (existing.zoneId === zone.id) return existing;
      if (expectedSceneRevision === undefined)
        throw venueRefusal("SCENE_STALE", "Refresh this Scene before moving to another Zone.");
      return coordinateVenue(
        existing.id,
        `move:${zone.id}:${expectedSceneRevision}`,
        "move",
        { zoneId: zone.id },
        expectedSceneRevision,
        undefined,
        () => moveVenueZoneOnce(existing.id, zone.id),
      );
    }
    const gathering = village.opening?.stage === "gathering" && village.opening.communityVenueId === placeId;
    const id = gathering && village.opening!.gatheringSceneId ? village.opening!.gatheringSceneId : randomUUID();
    if (gathering)
      await mutateVillageState((state) => {
        if (state.seed !== village.seed || state.opening?.stage !== "gathering")
          throw conflict("The opening changed. Refresh the Village.");
        state.opening.gatheringSceneId ||= id;
        if (state.opening.gatheringSceneId !== id) throw conflict("The gathering is already starting.");
      });
    if (gathering) {
      const prior = await readSession(id).catch((error) => {
        if (error instanceof VillagesRequestError && error.statusCode === 404) return null;
        throw error;
      });
      if (prior) {
        if (prior.villageSeed !== village.seed || prior.placeId !== placeId)
          throw conflict("The saved gathering belongs to another Village.");
        if (prior.status === "closed" || prior.endedAt) {
          await mutateVillageState((state) => {
            if (
              state.seed === village.seed &&
              state.opening?.gatheringSceneId === id &&
              state.opening.stage === "gathering"
            )
              state.opening.stage = "complete";
          });
          return prior;
        }
        await selectActiveScene(id, placeId);
        return refreshZoneParticipants(prior);
      }
    }
    const sceneAttendance = captureSceneAttendance(village, placeId, villageNow());
    if (gathering)
      sceneAttendance.occupants = village.villagers
        .filter((resident) => village.opening!.residentIds.includes(resident.characterId))
        .map((resident) => ({
          characterId: resident.characterId,
          name: resident.cardSnapshot.name,
          doing: "at the Community gathering",
          zoneId: zone.id,
        }));
    if (
      sceneAttendance.occupants.some(
        (person) => !village.relationshipContext?.reviewedActorIds.includes(person.characterId),
      )
    )
      throw conflict("Starting relationship history needs preparation or clarification before a Scene can begin.");
    const entryAccessContext = {
      sceneId: id,
      at: new Date(sceneAttendance.capturedAt),
      positions: Object.fromEntries(sceneAttendance.occupants.map((person) => [person.characterId, person.zoneId])),
      accepting: true,
    };
    let initialPermissionId: string | undefined;
    const decision = evaluateZoneAccess(place, zone, "player", {
      ...entryAccessContext,
      relationships: village.relationshipContext,
    });
    if (!decision.allowed) {
      if (requestedZoneId) throw conflict(decision.explanation);
      zone = resolveVenueZone(place, "exterior")!;
    } else
      await mutateVillageState((state) => {
        const current = findLocation(state, place.id)!;
        const target = resolveVenueZone(current, zone!.id)!;
        const checked = evaluateZoneAccess(current, target, "player", {
          ...entryAccessContext,
          relationships: state.relationshipContext,
          unavailable: zoneClosed(state, current, target),
          environment: state.narrative,
        });
        if (!checked.allowed) throw conflict(checked.explanation);
        initialPermissionId = checked.permissionId;
      });
    const participants = sceneAttendance.occupants
      .filter((person) => person.zoneId === zone.id)
      .map(({ characterId, name, doing }) => ({ characterId, name, doing }));
    if (
      participants.filter((person) => village.villagers.some((resident) => resident.characterId === person.characterId))
        .length > 4
    )
      throw conflict("Five residents occupy this Zone. Edit their agendas before starting a Scene.");
    const session: VenueScene = {
      openingGatheringId: gathering ? village.opening!.id : undefined,
      pendingAccessClaim: initialPermissionId,
      version: 4,
      sceneRevision: 0,
      liveSceneVersion: 1,
      semanticVersion: 2,
      villageSeed: village.seed,
      id,
      placeId,
      placeName: place.name,
      zoneId: zone.id,
      accompanying: [],
      departedIds: [],
      spaceClass: zone.venueClass,
      area: zoneArea(zone),
      privateOwnerId: zone.ownerId ?? "",
      privateAccessOwnerId: "",
      startedAt: sceneAttendance.capturedAt,
      endedAt: "",
      lastActivityAt: villageNow().toISOString(),
      endReason: "",
      memoryMode: "live",
      status: participants.length === 0 && !discovery ? "active" : "opening",
      participants,
      sceneAttendance,
      activeIds: participants.map((person) => person.characterId),
      lines: [],
      submissions: [],
      recap: "",
    };
    await mutateDocument(`${SESSION_PREFIX}${id}`, sessionSlot, (value) => {
      if (gathering && value.id) return;
      Object.assign(value, session);
    });
    await selectActiveScene(id, placeId);
    const settled = await refreshZoneParticipants(session);
    await markZoneSeen(settled);
    return settled;
  }

  async function greetVenue(id: string, retryOfAttemptId?: string, recovery = false): Promise<VenueScene> {
    return withSceneActivation(() => greetVenueInActivation(id, retryOfAttemptId, recovery));
  }

  async function greetVenueInActivation(id: string, retryOfAttemptId?: string, recovery = false): Promise<VenueScene> {
    const work = sceneWork();
    const inFlight = work.greetingTask(id);
    if (inFlight) return inFlight.task;
    const started = performance.now();
    const controller = new AbortController();
    const signal = controller.signal;
    let coordinated = false;
    let stage = "session read";
    const trace: GreetingTrace = (next, elapsedMs, detail = "") => {
      stage = next;
      villagesLogger().info("[villages] greeting %s %s took %dms %s", id, next, Math.round(elapsedMs), detail);
    };
    const onAbort = () => rejectAbort(signal);
    let rejectAbort: (signal: AbortSignal) => void = () => {};
    const aborted = new Promise<never>((_resolve, reject) => {
      rejectAbort = (current) => reject(current.reason);
      signal.addEventListener("abort", onAbort, { once: true });
    });
    const task = Promise.race([
      aborted,
      Promise.resolve().then(async () => {
        const admission = await readSession(id);
        assertCurrentSceneGeneration(admission);
        signal.throwIfAborted();
        const writingInput = {
          ...sceneHearingContract(admission, "greeting"),
          semanticBudget:
            admission.operation?.id === "greeting"
              ? admission.operation.input.semanticBudget
              : SEMANTIC_OPERATION_BUDGET,
        };
        signal.throwIfAborted();
        coordinated = true;
        return coordinateVenue(
          id,
          "greeting",
          "greet",
          writingInput,
          undefined,
          retryOfAttemptId,
          () => greetVenueOnce(id, venueOperationSignal() ?? signal, trace),
          { recovery },
        );
      }),
    ]);
    work.rememberGreeting(id, task, () => {
      controller.abort();
      if (coordinated) void cancelVenueOperation(id).catch(() => {});
    });
    try {
      return await task;
    } catch (error) {
      villagesLogger().warn(
        "[villages] greeting %s failed at %s after %dms: %s",
        id,
        stage,
        Math.round(performance.now() - started),
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    } finally {
      signal.removeEventListener("abort", onAbort);
      work.forgetGreeting(id);
    }
  }

  async function greetVenueOnce(id: string, signal: AbortSignal, trace: GreetingTrace): Promise<VenueScene> {
    const readStarted = performance.now();
    const session = await requireLiveVenueSession(id);
    trace("session read", performance.now() - readStarted);
    if (session.status !== "opening") {
      const saved = session.submissions.find((row) => row.id === "greeting");
      if (saved?.semanticProvenance?.version === 2 && !saved.semanticReady) {
        await sceneNarrative?.settle(session, saved.narrativeSource);
        await processSavedExchange(id, saved.id);
        await applyVenueRequests(session, saved);
        await settleSemanticAuthority(session, saved);
        return readSession(id);
      }
      return session;
    }
    signal.throwIfAborted();
    const reply = await venueCheckpoint("greeting-reply", async () => {
      const reply = await generate(session, "", "greet", "", null, signal, trace);
      return reply;
    });
    signal.throwIfAborted();
    const greetingVillage = await readVillageState();
    validatePlaceReply(greetingVillage, session, reply);
    validateCurrentRoomInvitation(reply, greetingVillage);
    if (reply.narrativeSource?.development)
      provisionalSceneNarrative(greetingVillage, greetingVillage, reply.narrativeSource);
    const greetingWishContexts =
      Array.isArray(reply.wishChanges) && reply.wishChanges.length
        ? await exactWishContexts(reply.wishContexts, session)
        : [];
    const greeted = await changeSession(id, (state) => {
      signal.throwIfAborted();
      if (state.status !== "opening") return;
      const at = state.continuity?.capturedAt ?? state.sceneAttendance?.capturedAt ?? state.startedAt;
      const initialIds = [...state.activeIds];
      const savedLineIds = appendVenueReply(state, reply.lines, at, reply.npcAdmissions);
      {
        const wishes = bindWishProposals(
          reply.wishChanges,
          greetingVillage,
          state.lines,
          "",
          savedLineIds,
          greetingWishContexts,
          state.semanticVersion === 2,
        );
        state.submissions.push({
          id: "greeting",
          ...(session.operation?.input.sceneHearingVersion === 2 ? { sceneHearingVersion: 2 as const } : {}),
          zoneIdAtTurn: state.zoneId,
          mode: "chat",
          message: "",
          targetId: "",
          at,
          verdict: null,
          wishId: "",
          wishMemory: "",
          activeIdsAtTurn: initialIds,
          replyLineIds: savedLineIds,
          wishProposals: wishes.proposals,
          wishAuthority: wishes.authority,
          wishProposalError: wishes.error,
          wishContexts: reply.wishContexts,
          lore: reply.lore,
          semanticProvenance: reply.semanticProvenance,
          npcAdmissions: reply.npcAdmissions,
          placeDiscoveries: reply.placeDiscoveries,
          establishmentProgress: reply.establishmentProgress,
          narrativeSource: reply.narrativeSource,
          physicalContext: reply.physicalContext,
          ...(reply.placeUpdate
            ? {
                placeUpdate: reply.placeUpdate,
                physicalOutcomeVersion: 1 as const,
                action: { happened: true, ...reply.placeUpdate },
                areaAtTurn: state.area,
                zoneIdAtTurn: state.zoneId,
                privateOwnerIdAtTurn: state.privateOwnerId,
              }
            : {}),
          liveProposals: bindLiveProposals(reply, "", savedLineIds, state.lines),
          effectFailures: reply.effectFailures,

          speechCapture: reply.speechCapture,
          sceneContractVersion: reply.sceneContractVersion,
          accessEvents: savedAccessEvents(reply.roomInterpretation),
          ...(state.semanticVersion === 2
            ? {
                projectContexts: reply.projectContexts,
                projectSpeech: reply.projectSpeech.map((proposal) => ({
                  ...proposal,
                  citations: proposal.citations.map((citation) => ({
                    ...citation,
                    lineId: /^\d+$/u.test(citation.lineId)
                      ? (savedLineIds[Number(citation.lineId)] ?? "")
                      : citation.lineId,
                  })),
                })),
                projectInterpretationVersion: 1 as const,
                invitationSignal: reply.invitationSignal ?? undefined,
                residenceSignal: reply.residenceSignal ?? undefined,
                venueRequestSignal: reply.venueRequestSignal ?? undefined,
              }
            : {}),
          requestMetrics: venueRequestMetrics(),
        });
      }
      if (state.semanticVersion === 2) {
        const greeting = state.submissions.find((row) => row.id === "greeting")!;
        const sourceLineId = (actor: string, quote: string) =>
          savedLineIds[reply.lines.findIndex((line) => line.speakerId === actor && line.content.includes(quote))];
        if (greeting.venueRequestSignal)
          greeting.venueRequestSignal.sourceLineId = sourceLineId(
            greeting.venueRequestSignal.characterId,
            greeting.venueRequestSignal.quote,
          );
        state.accompanying = [
          ...(state.accompanying ?? []).filter(
            (row) => !reply.contactMoves.some((move) => move.characterId === row.characterId),
          ),
          ...reply.contactMoves.map((move) => ({ characterId: move.characterId, zoneId: move.zoneId })),
        ];
        state.departedIds = [...new Set([...(state.departedIds ?? []), ...reply.departures])];
        state.activeIds = [
          ...new Set([
            ...state.activeIds,
            ...reply.contactMoves.filter((move) => move.zoneId === state.zoneId).map((move) => move.characterId),
          ]),
        ].filter(
          (id) =>
            !state.departedIds?.includes(id) &&
            !reply.contactMoves.some((move) => move.characterId === id && move.zoneId !== state.zoneId),
        );
        state.submissions.find((row) => row.id === "greeting")!.activeIdsAfterTurn = [...state.activeIds];
      }
      if (reply.invitationSignal?.venueId === state.placeId && reply.invitationSignal.timing === "now") {
        applyImmediateZoneInvitation(state, reply.invitationSignal);
      }
      applyInterpretedRoomEvents(state, reply.roomInterpretation, greetingVillage);
      state.status = "active";
    });
    const placeTurn = greeted.submissions.find((row) => row.id === "greeting");
    if (
      placeTurn &&
      (placeTurn.npcAdmissions?.length || placeTurn.placeDiscoveries?.length || placeTurn.establishmentProgress?.length)
    )
      await mutateVillageState((state) => applyPlaceExchange(state, greeted, placeTurn));
    if (reply.semanticProvenance?.version === 2) {
      await sceneNarrative?.settle(greeted, reply.narrativeSource);
      const greeting = greeted.submissions.find((row) => row.id === "greeting");
      if (greeting) await applySavedAccessEvents(greeted, greeting);
    }
    if (reply.roomInterpretation) {
      await finalizeRoomInvitation(greeted, reply.roomInterpretation, reply.invitationSignal);
    }
    if (reply.invitationSignal) await recordSpokenInvitation(greeted, reply.invitationSignal);
    await markZoneSeen(greeted, false);
    await processSavedExchange(id, "greeting");
    const turn = (await readSession(id)).submissions.find((row) => row.id === "greeting");
    if (turn) {
      if (turn.semanticProvenance?.version === 2) await applyVenueRequests(greeted, turn);
      await settleSemanticAuthority(greeted, turn);
      if (!semanticBlocker(await readSession(id))) await markZoneSeen(greeted);
    }
    return refreshZoneParticipants(await readSession(id), true);
  }

  async function continueVenueWithoutGreeting(id: string): Promise<VenueScene> {
    return withSceneActivation(() => continueVenueWithoutGreetingInActivation(id));
  }

  async function continueVenueWithoutGreetingInActivation(id: string): Promise<VenueScene> {
    await readSession(id);
    const work = sceneWork();
    await cancelVenueOperation(id);
    await requireLiveVenueSession(id);
    const session = await changeSession(id, (state) => {
      if (state.status === "opening") state.status = "active";
      else if (state.status !== "active") throw conflict("That Scene has already ended.");
      if (state.operation?.kind === "greet" && state.operation.status === "complete") {
        state.operation.error = "";
        delete state.operation.failure;
      }
    });
    work.abortGreeting(id);
    return session;
  }

  type VenueTurnInput = {
    sessionId: string;
    message: string;
    mode: "chat" | "leave" | "contact";
    contact?: ContactIntent;
    targetId: string;
    submissionId: string;
    expectedSceneRevision?: number;
    retryOfAttemptId?: string;
    replaceOfOperationId?: string;
  };

  function assertSceneTurnMode(mode: unknown): asserts mode is VenueTurnInput["mode"] {
    if (mode !== "chat" && mode !== "contact" && mode !== "leave")
      throw conflict("Unsupported Scene action. Its saved request is preserved.");
  }

  function sceneHearingContract(scene: VenueScene, id: string) {
    const prior = scene.operation?.id === id ? scene.operation.input : scene.submissions.find((turn) => turn.id === id);
    return !prior || prior.sceneHearingVersion === 2 ? { sceneHearingVersion: 2 } : {};
  }
  function venueTurnPayload(scene: VenueScene, input: VenueTurnInput) {
    return {
      ...sceneHearingContract(scene, input.submissionId),
      message: input.message,
      mode: input.mode,
      targetId: input.targetId,
      ...(input.contact ? { contact: input.contact } : {}),
      semanticBudget:
        scene.operation?.id === input.submissionId ? scene.operation.input.semanticBudget : SEMANTIC_OPERATION_BUDGET,
    };
  }

  function unavailableTurnResult(session: VenueScene, submissionId: string) {
    return {
      session,
      turnOutcome:
        session.rejectedSubmissions?.find((row) => row.id === submissionId)?.turnOutcome ?? "occupancy-unavailable",
      verdict: null,
      action: null,
      recordEvents: [] as VenueRecordEvent[],
    };
  }

  async function sendVenueTurn(input: VenueTurnInput) {
    assertSceneTurnMode(input.mode);
    const rejected = await readSession(input.sessionId);
    if (rejectedSubmission(rejected, input.submissionId, input)) {
      if (rejected.operation?.id === input.submissionId && rejected.operation.status !== "complete")
        return coordinateVenue(
          input.sessionId,
          input.submissionId,
          "turn",
          rejected.operation.input,
          undefined,
          undefined,
          async () => unavailableTurnResult(await readSession(input.sessionId), input.submissionId),
          { replay: true, recovery: true },
        );
      return unavailableTurnResult(rejected, input.submissionId);
    }
    const scene = await readSession(input.sessionId);
    assertCurrentSceneGeneration(scene);
    const prior = scene.submissions.find((entry) => entry.id === input.submissionId);
    if (prior) runtimeDebug("submission replay", { sceneId: input.sessionId, submissionId: input.submissionId });
    if (!prior) await requireLiveVenueSession(input.sessionId);
    const payload = venueTurnPayload(scene, input);
    if (prior && JSON.stringify(prior.contact ?? null) !== JSON.stringify(input.contact ?? null))
      throw venueRefusal("SUBMISSION_MISMATCH", "That submission ID belongs to a different contact attempt.");
    if (prior && (prior.message !== input.message || prior.mode !== input.mode || prior.targetId !== input.targetId))
      throw venueRefusal("SUBMISSION_MISMATCH", "That submission ID belongs to a different line.");
    return coordinateVenue(
      input.sessionId,
      input.submissionId,
      "turn",
      payload,
      input.expectedSceneRevision,
      input.retryOfAttemptId,
      () => sendVenueTurnOnce(input),
      { replay: !!prior, replaceOfOperationId: input.replaceOfOperationId },
    );
  }

  /** Generate a final beat once, then use the ordinary visit filing path. */
  async function leaveVenueSession(
    sessionId: string,
    submissionId: string,
    message = "",
    expectedSceneRevision?: number,
    retryOfAttemptId?: string,
    replaceOfOperationId?: string,
  ) {
    const scene = await readSession(sessionId);
    assertCurrentSceneGeneration(scene);
    const prior = scene.submissions.find((entry) => entry.id === submissionId);
    if (!prior) await requireLiveVenueSession(sessionId);
    if (!prior && !findLocation(await readVillageState(), scene.placeId))
      throw conflict("This Venue is no longer available. End the Scene.");
    const payload = venueTurnPayload(scene, { sessionId, submissionId, message, mode: "leave", targetId: "" });
    return coordinateVenue(
      sessionId,
      submissionId,
      "turn",
      payload,
      expectedSceneRevision,
      retryOfAttemptId,
      () => leaveVenueSessionOnce(sessionId, submissionId, message),
      { replay: !!prior, replaceOfOperationId },
    );
  }

  async function leaveVenueSessionOnce(sessionId: string, submissionId: string, message: string) {
    const started = performance.now();
    const result = await sendVenueTurn({
      sessionId,
      submissionId,
      message,
      mode: "leave",
      targetId: "",
    });
    const farewellMs = Math.round(performance.now() - started);
    if ("turnOutcome" in result && result.turnOutcome) return result;
    const ending = await closeVenueSessionWithReceipts(sessionId);
    villagesLogger().debug(
      "[villages] Scene close: farewellMs=%d archiveMs=%d",
      farewellMs,
      Math.round(performance.now() - started - farewellMs),
    );
    const byId = new Map([...result.recordEvents, ...ending.recordEvents].map((event) => [event.id, event] as const));
    return { ...result, session: ending.session, recordEvents: [...byId.values()] };
  }

  async function sendVenueTurnOnce(input: VenueTurnInput) {
    const submittedInput = input;
    if (sceneWork().isMoving(input.sessionId)) throw conflict("Wait for zone navigation to finish before sending.");
    let session = await readSession(input.sessionId);
    if (rejectedSubmission(session, input.submissionId, input))
      return unavailableTurnResult(session, input.submissionId);
    assertCurrentSceneGeneration(session);
    const prior = session.submissions.find((entry) => entry.id === input.submissionId);
    if (!prior && session.semanticVersion === 2) {
      await finishSemanticScene(session.id);
      session = await readSession(session.id);
      if (session.status === "closed") throw conflict("This Scene has concluded.");
    }
    if (prior) {
      if (prior.message !== input.message || prior.mode !== input.mode || prior.targetId !== input.targetId)
        throw conflict("That submission ID belongs to a different line.");
      await sceneNarrative?.settle(session, prior.narrativeSource);
      try {
        await processSavedExchange(session.id, prior.id);
      } catch (error) {
        villagesLogger().warn("[villages] saved turn progress deferred for %s: %s", prior.id, String(error));
      }
      await applyVenueRequests(session, prior);
      if (
        prior.invitationSignal &&
        (prior.invitationSignal.timing === "later" || prior.invitationSignal.venueId !== session.placeId)
      )
        await recordSpokenInvitation(session, prior.invitationSignal);
      await settleSemanticAuthority(session, prior);
      await finishSemanticScene(session.id);
      if (!semanticBlocker(await readSession(session.id)))
        await markZoneSeen(session).catch((error) =>
          villagesLogger().warn("[villages] saved turn observation deferred for %s: %s", prior.id, String(error)),
        );
      const recordEvents = await receiptForTurn(session, prior);
      return {
        session: await readSession(session.id),
        verdict: prior.verdict,
        action: prior.action ?? null,
        recordEvents,
      };
    }
    session = await requireLiveVenueSession(session.id);
    const blocker = semanticBlocker(session);
    if (blocker) throw conflict(blocker);
    const admitted = venueOperationSnapshot<unknown>();
    if (admitted)
      session = { ...(await createSceneHistory(villagesDocuments()).decode(admitted)), operation: session.operation };
    if (session.status !== "active") throw conflict("That Scene is not active.");
    if (session.sceneAttendance && !session.sceneAttendance.layout) {
      const venue = findLocation(await readVillageState(), session.placeId);
      if (!venue) throw notFound("That Venue is no longer available.");
      const layout = await venueCheckpoint("scene-layout", async () => captureSceneLayout(venue));
      await changeSession(session.id, (state) => {
        if (state.sceneAttendance && !state.sceneAttendance.layout) state.sceneAttendance.layout = layout;
      });
      session = { ...session, sceneAttendance: { ...session.sceneAttendance, layout } };
    }
    let movementVenue: VillageVenue | undefined;
    if (input.mode !== "leave" && session.zoneId) {
      const village = sceneContinuityView(await readVillageState(), session),
        location = findLocation(village, session.placeId),
        venue = location && sceneLayoutVenue(location, session),
        zone = venue && resolveVenueZone(venue, session.zoneId);
      if (!venue || !zone || zoneClosed(village, venue, zone))
        throw conflict("This zone is closed. Move to another zone or leave the Venue.");
      movementVenue = venue;
    }

    if (input.mode !== "leave" && !input.message.trim()) throw badRequest("Write something before sending it.");
    if (input.message.length > 4000) throw badRequest("A line can be at most 4000 characters.");
    if (input.mode !== "contact" && input.targetId && !session.activeIds.includes(input.targetId))
      throw badRequest("That villager is no longer in this conversation.");
    await rollActiveAgendas();
    const village = await readVillageState();
    const verdict: VenueSubmission["verdict"] = null;
    const wishId = "",
      wishMemory = "";
    const responseTargetId = input.targetId || (session.activeIds.length === 1 ? session.activeIds[0]! : "");
    const eventVenue = movementVenue ?? findLocation(village, session.placeId);
    if (!eventVenue) throw conflict("This Venue is no longer available. End the Scene.");
    const eventScene = zoneEventScene(session, eventVenue!, {
      contact: input.mode === "contact",
      targetId: input.targetId || session.semanticIntent?.timeline.find((step) => step.targetId)?.targetId,
      message: input.message,
      zoneId: input.contact?.boundaryZoneId,
    });
    if (input.mode === "contact") {
      if (
        input.contact?.boundaryZoneId &&
        !contactNeighbors(
          movementVenue ?? findLocation(village, session.placeId)!,
          requireSceneZoneId(session),
          session,
        ).includes(input.contact.boundaryZoneId)
      )
        throw badRequest("Choose a directly connected Zone for that contact.");
      eventScene.contactGeneration!.instruction = `The Contact shortcut requests a ${input.contact?.kind === "knock" ? "knock" : "call"} toward ${input.contact?.boundaryZoneId || "the adjacent Zones"}. Resolve it as a current attempted action; never invent success. Explicit private or hypothetical wording still governs.`;
    }
    const hold = async (outcome: import("../../../shared/contracts/scene-turn-outcome.js").SceneTurnOutcome) => {
      assertVenueOwnership();
      venueOperationSignal()?.throwIfAborted();
      const updated = await changeSession(session.id, (saved) => {
        assertVenueOwnership(saved);
        venueOperationSignal()?.throwIfAborted();
        if (saved.sceneRevision !== session.sceneRevision)
          throw conflict("The conversation moved on. Your draft is preserved.");
        saved.rejectedSubmissions ??= [];
        if (!rejectedSubmission(saved, input.submissionId, submittedInput))
          saved.rejectedSubmissions.push({
            id: input.submissionId,
            inputHash: rejectedInputHash(submittedInput),
            sceneRevision: session.sceneRevision,
            turnOutcome: outcome,
          });
        if (saved.operation) saved.operation.turnOutcome = outcome;
      });
      await sceneNarrative?.retire(session, reply?.narrativeSource?.grant);
      return unavailableTurnResult(updated, input.submissionId);
    };
    let reply: SceneReply;
    try {
      reply = await venueCheckpoint("turn-reply", () =>
        generate(
          eventScene,
          input.message,
          input.mode === "contact" ? "chat" : input.mode,
          responseTargetId,
          null,
          venueOperationSignal(),
        ),
      );
    } catch (error) {
      if (!(error instanceof UnavailableResidentMovement) && !(error instanceof HaltedSceneTurn)) throw error;
      return hold(error instanceof HaltedSceneTurn ? error.outcome : "occupancy-unavailable");
    }

    // Validate retained replies before any effects; only the explicit Move route owns travel.
    semanticPlayerMoves(reply.semanticPlayerMoves, session, reply.lines);

    const contactSpeakers = [
      ...new Set(
        reply.lines.filter((line) => line.kind !== "narration" && !line.contactHidden).map((line) => line.speakerId),
      ),
    ];
    if (reply.contactMoves.length) {
      const current = await readVillageState(),
        currentVenue = findLocation(current, session.placeId);
      if (!currentVenue) throw conflict("The Venue changed while contact was being prepared.");
      if (
        reply.contactRelay &&
        reply.contactRelay.path.some(
          (zoneId) => !contactCanEnter(current, currentVenue, zoneId, reply.contactRelay!.speakerId, session),
        )
      ) {
        throw badGateway("The messenger's route is no longer permitted. Your draft is preserved.");
      }
      for (const move of reply.contactMoves) {
        if (
          !contactPath(
            current,
            currentVenue,
            contactPosition(session, move.characterId),
            move.zoneId,
            move.characterId,
            session,
          )
        )
          throw badGateway("The proposed contact movement was not permitted. Your draft is preserved.");
      }
      assertSceneMovementCapacity(session, reply.contactMoves);
    }
    let applicationVillage = await readVillageState();
    validateCurrentRoomInvitation(reply, sceneContinuityView(applicationVillage, session));
    const projectFailure = reply.effectFailures?.projects;

    const acceptedWishContexts =
      Array.isArray(reply.wishChanges) && reply.wishChanges.length
        ? await exactWishContexts(reply.wishContexts, session)
        : [];
    const commitTurn = async (current: VillageState) => {
      validatePlaceReply(current, session, reply);
      if (reply.narrativeSource?.development) provisionalSceneNarrative(current, current, reply.narrativeSource);
      if (sceneHaltWorldConflict(session, current, reply)) throw new HaltedSceneTurn("halt-world");
      applicationVillage = current;
      return changeSession(session.id, (state) => {
        if (state.submissions.some((entry) => entry.id === input.submissionId)) return;
        state.pendingProjectQuestions = [];
        if (state.status !== "active") throw conflict("That Scene has already ended.");
        if (state.sceneRevision !== session.sceneRevision)
          throw conflict("The conversation moved on. Try sending that line again.");
        const acceptedAt = villageNow().toISOString();
        const at = state.continuity?.capturedAt ?? state.sceneAttendance?.capturedAt ?? state.startedAt;
        state.lastActivityAt = acceptedAt;
        if (reply.contactMoves.length) {
          state.accessPreviousZones ??= {};
          for (const move of reply.contactMoves)
            state.accessPreviousZones[move.characterId] = contactPosition(state, move.characterId);
          state.accompanying = [
            ...(state.accompanying ?? []).filter(
              (entry) => !reply.contactMoves.some((move) => move.characterId === entry.characterId),
            ),
            ...reply.contactMoves.map((move) => ({ characterId: move.characterId, zoneId: move.zoneId })),
          ];
          state.doorwayContacts = (state.doorwayContacts ?? []).filter(
            (entry) => !reply.contactMoves.some((move) => move.characterId === entry.characterId),
          );
        }
        {
          if (session.operation?.input.sceneHearingVersion === 2) {
            const ended = new Set(reply.contactEndIds ?? []);
            const contacts = reply.lines
              .filter((line) => line.viaDoorway && !line.contactHidden && line.speakerId)
              .filter((line) => !ended.has(line.speakerId))
              .map((line) => ({
                characterId: line.speakerId,
                playerZoneId: state.zoneId,
                characterZoneId: line.zoneId,
                delivery: "voice" as const,
              }));
            state.doorwayContacts = [
              ...new Map(
                [...(state.doorwayContacts ?? []).filter((row) => !ended.has(row.characterId)), ...contacts].map(
                  (row) => [row.characterId, row],
                ),
              ).values(),
            ];
          }
          const identities = new Set([
            ...reply.lines
              .filter((line) => line.kind !== "narration" && !line.contactHidden)
              .map((line) => line.speakerId),
            ...reply.contactMoves.map((move) => move.characterId),
          ]);
          for (const id of identities) {
            if (state.participants.some((entry) => entry.characterId === id)) continue;
            const person = state.sceneAttendance?.occupants.find((entry) => entry.characterId === id);
            if (person)
              state.participants.push({ characterId: id, name: person.name, doing: "Answering a contact request" });
          }
        }
        const playerLineId = input.message.trim() ? randomUUID() : "";
        if (playerLineId)
          appendLine(state, {
            id: playerLineId,
            speakerId: "",
            name: "",
            role: "user",
            content: input.message,
            at,
            heardBy: reply.heardPlayerBy,
          });

        appendVenueReply(state, reply.lines, at, reply.npcAdmissions);
        const replyLineIds = state.lines.slice(-reply.lines.length).map((line) => line.id);
        const wishChanges = bindWishProposals(
          reply.wishChanges,
          applicationVillage,
          state.lines,
          playerLineId,
          replyLineIds,
          acceptedWishContexts,
          state.semanticVersion === 2,
        );
        if (reply.recap) state.recap = reply.recap;
        state.submissions.push({
          id: input.submissionId,
          ...(session.operation?.input.sceneHearingVersion === 2 ? { sceneHearingVersion: 2 as const } : {}),
          speechCapture: reply.speechCapture,
          sceneContractVersion: reply.sceneContractVersion,
          effectFailures: { ...reply.effectFailures, ...(projectFailure ? { projects: projectFailure } : {}) },
          ...{ zoneEventsVersion: 1 as const },
          message: input.message,
          mode: input.mode,
          targetId: input.targetId,
          ...(input.contact ? { contact: input.contact } : {}),
          ...{},
          ...{
            speechIdsAtTurn: contactSpeakers,
            contactEvidence: { moves: reply.contactMoves, relay: reply.contactRelay },
          },
          areaAtTurn: session.area,
          zoneIdAtTurn: session.zoneId,
          privateOwnerIdAtTurn: session.privateOwnerId,
          activeIdsAtTurn: [...session.activeIds],
          activeIdsAfterTurn: [
            ...new Set([
              ...(reply.npcAdmissions ?? []).map((admission) => admission.npc.id),
              ...session.activeIds.filter(
                (id) => !reply.contactMoves.some((move) => move.characterId === id && move.zoneId !== session.zoneId),
              ),
              ...reply.contactMoves.filter((move) => move.zoneId === session.zoneId).map((move) => move.characterId),
            ]),
          ].filter(
            (id) =>
              !reply.departures.includes(id) &&
              !reply.contactMoves.some((move) => move.characterId === id && move.zoneId !== session.zoneId),
          ),
          replyLineIds,
          projectContexts: reply.projectContexts,
          projectInterpretationVersion: 1 as const,

          projectSpeech: reply.projectSpeech.map((proposal) => ({
            ...proposal,
            citations: proposal.citations.map((citation) => ({
              ...citation,
              lineId: /^\d+$/u.test(citation.lineId) ? (replyLineIds[Number(citation.lineId)] ?? "") : citation.lineId,
            })),
          })),
          verdict,
          wishId,
          wishMemory,
          wishProposals: wishChanges.proposals,
          wishAuthority: wishChanges.authority,
          wishProposalError: wishChanges.error,
          wishContexts: reply.wishContexts,
          lore: reply.lore,
          semanticProvenance: reply.semanticProvenance,
          npcAdmissions: reply.npcAdmissions,
          placeDiscoveries: reply.placeDiscoveries,
          establishmentProgress: reply.establishmentProgress,
          narrativeSource: reply.narrativeSource,
          semanticPlayerMoves: reply.semanticPlayerMoves,
          ...(reply.sceneEnded ? { semanticConclude: true } : {}),
          physicalContext: reply.physicalContext,
          liveProposals: bindLiveProposals(reply, playerLineId, replyLineIds, state.lines),
          accessEvents: savedAccessEvents(reply.roomInterpretation),
          requestMetrics: venueRequestMetrics(),
          ...(reply.placeUpdate
            ? {
                placeUpdate: reply.placeUpdate,
                physicalOutcomeVersion: 1 as const,
                action: { happened: true, ...reply.placeUpdate },
                actionReplyDone: true,
              }
            : {}),
          ...(reply.residenceSignal ? { residenceSignal: reply.residenceSignal } : {}),
          ...(reply.venueRequestSignal
            ? {
                venueRequestSignal: {
                  ...reply.venueRequestSignal,
                  sourceLineId: reply.lines
                    .map((line, index) => ({ line, id: replyLineIds[index] }))
                    .find(
                      ({ line }) =>
                        line.speakerId === reply.venueRequestSignal?.characterId &&
                        line.content.toLowerCase().includes(reply.venueRequestSignal.quote.toLowerCase()),
                    )?.id,
                },
              }
            : {}),
          ...(reply.invitationSignal ? { invitationSignal: reply.invitationSignal } : {}),
          at,
        });
        if (reply.invitationSignal?.venueId === state.placeId && reply.invitationSignal.timing === "now") {
          applyImmediateZoneInvitation(state, reply.invitationSignal);
        }
        applyInterpretedRoomEvents(state, reply.roomInterpretation, applicationVillage);
        state.departedIds = [...new Set([...(state.departedIds ?? []), ...reply.departures])];
        state.activeIds = [
          ...new Set([
            ...state.activeIds,
            ...reply.contactMoves.filter((move) => move.zoneId === state.zoneId).map((move) => move.characterId),
          ]),
        ].filter(
          (id) =>
            !reply.departures.includes(id) &&
            !reply.contactMoves.some((move) => move.characterId === id && move.zoneId !== state.zoneId),
        );
      });
    };
    let updated: VenueScene;
    try {
      updated = withVillageSceneAcceptance
        ? await withVillageSceneAcceptance(commitTurn, {
            memories: true,
            wishEffects: (state) => sceneWishEffectIds(state, session),
            wishes: Array.isArray(reply.wishChanges)
              ? [
                  ...new Set(
                    reply.wishChanges.flatMap((row) =>
                      typeof asRecord(row).actorId === "string" ? [asRecord(row).actorId as string] : [],
                    ),
                  ),
                ]
              : [],
          })
        : await commitTurn(applicationVillage);
    } catch (error) {
      if (error instanceof HaltedSceneTurn) return hold(error.outcome);
      throw error;
    }
    const submission = updated.submissions.find((entry) => entry.id === input.submissionId)!;
    requireSceneExchange(updated, submission);
    if (
      submission.npcAdmissions?.length ||
      submission.placeDiscoveries?.length ||
      submission.establishmentProgress?.length
    )
      await mutateVillageState((state) => applyPlaceExchange(state, updated, submission));
    await sceneNarrative?.settle(updated, submission.narrativeSource);
    // Settle witnessed policy/boundary changes before this reply's visit or standing grants.
    if (reply.roomInterpretation) await recordRoomAccessEvents(updated, reply.roomInterpretation);
    try {
      await processSavedExchange(updated.id, submission.id);
    } catch (error) {
      villagesLogger().warn("[villages] saved turn progress deferred for %s: %s", submission.id, String(error));
    }
    await applyVenueRequests(updated, submission);
    if (submission.invitationSignal) await recordSpokenInvitation(updated, submission.invitationSignal);
    await markZoneSeen(updated, false).catch((error) =>
      villagesLogger().warn("[villages] saved turn observation deferred for %s: %s", submission.id, String(error)),
    );
    if (reply.roomInterpretation) {
      await finalizeRoomInvitation(updated, reply.roomInterpretation, submission.invitationSignal);
    }
    await settleSemanticAuthority(updated, submission);
    await finishSemanticScene(updated.id);
    if (!semanticBlocker(await readSession(updated.id))) await markZoneSeen(updated);
    let recordEvents = await receiptForTurn(updated, submission);
    let finalSession = updated;
    if (updated.status === "closed") {
      finalSession = await closeVenueSession(updated.id);
      const byId = new Map(
        [...recordEvents, ...(await latestSceneReceipts(finalSession))].map((event) => [event.id, event] as const),
      );
      recordEvents = [...byId.values()];
    }
    return {
      session: await refreshZoneParticipants(await readSession(finalSession.id), true),
      verdict,
      action: submission.action ?? null,
      recordEvents,
    };
  }

  /** Retain only this Scene's validated access/discovery changes in its existing private snapshot. */
  async function changeSceneVenues(scene: VenueScene, change: (state: VillageState) => void) {
    if (!scene.continuity) return;
    const current = await readVillageState();
    await changeSession(scene.id, (saved) => {
      if (!saved.continuity || saved.villageSeed !== current.seed) return;
      const view = { ...current, ...cloneSceneFacts(saved.continuity.facts) };
      change(view);
      saved.continuity.facts.venues = view.venues;
      saved.continuity.facts.worldPlaces = view.worldPlaces;
    });
  }

  async function applySavedAccessEvents(scene: VenueScene, turn: VenueSubmission) {
    const events = turn.accessEvents ?? [];
    if (events.some((event) => event.interpretationVersion !== 1 || asRecord(event.facts).semanticVersion !== 2))
      throw conflict("This saved access effect needs current evidence.");
    if (!events.length) return;
    const batch = {
      checks: events.map((event) => ({ id: event.id, facts: event.facts })),
      results: events.map((event) => ({ outcome: event.outcome, evidenceIds: event.evidenceIds })),
    } as InterpretationBatch;
    await recordRoomAccessEvents(scene, batch, turn.id);
  }

  async function recordRoomAccessEvents(
    scene: VenueScene,
    batch: InterpretationBatch,
    submissionId = scene.submissions.at(-1)?.id,
  ) {
    if (batch.checks.some((check) => asRecord(check.facts).semanticVersion !== 2))
      throw conflict("This saved access effect needs current evidence.");
    const turn = scene.submissions.find((turn) => turn.id === submissionId);
    if (!turn?.replyLineIds?.length || !turn.at) return;
    const apply = (state: VillageState) => {
      if (scene.villageSeed && state.seed !== scene.villageSeed) return;
      const initialRevisions = new Map<string, number | undefined>();
      for (const [index, result] of batch.results.entries()) {
        const check = batch.checks[index],
          facts = asRecord(check.facts),
          actor = String(facts.actorId);
        const management = asRecord(facts.accessCommand);
        if (
          !management.action &&
          !["refuse", "dismiss", "ban-zone", "ban-venue", "invite-outside-hours"].includes(result.outcome)
        )
          continue;
        const venue = findLocation(state, facts.venueId),
          zone = venue && resolveVenueZone(venue, String(facts.zoneId));
        if (!venue?.access || (!management.action && !zone && result.outcome !== "ban-venue")) continue;
        if (!initialRevisions.has(venue.id)) initialRevisions.set(venue.id, venue.access.revision);
        const operationId = management.action
          ? String(management.operationId)
          : "access-speech:" +
            createHash("sha256")
              .update(check.id + ":" + result.outcome)
              .digest("hex");
        if (venue.access.receipts[operationId]) {
          continue;
        }
        const reject = () => {
          venue.access!.receipts[operationId] = {
            fingerprint: "rejected-witnessed-event",
            revision: venue.access!.revision,
            outcome: "rejected",
          };
        };
        if (
          facts.accessRevision !== initialRevisions.get(venue.id) &&
          (typeof facts.accessRevision !== "number" ||
            venue.access.changes.some(
              (change) =>
                change.revision > Number(facts.accessRevision) &&
                change.action !== "invite" &&
                change.action !== "destinations",
            ))
        ) {
          reject();
          continue;
        }
        if (
          management.action &&
          result.outcome !== "access-management" &&
          !(management.action === "invite" && ["invite-now", "invite-later"].includes(result.outcome))
        ) {
          reject();
          continue;
        }
        const sources = result.evidenceIds
          .map((ref) => {
            const draft = /^draft:(\d+)$/u.exec(ref);
            return scene.lines.find((line) => line.id === (draft ? turn.replyLineIds[Number(draft[1])] : ref));
          })
          .filter(
            (line): line is VenueLine =>
              !!line &&
              ((line.speakerId === actor && line.kind !== "narration") ||
                (line.kind === "narration" && line.heardBy.includes(actor) && !line.contactHidden)) &&
              turn.replyLineIds.includes(line.id),
          );
        if (!sources.length) {
          reject();
          continue;
        }
        const scope = result.outcome === "ban-venue" ? null : (zone?.id ?? null);
        if (result.outcome.startsWith("ban-") && !managesAccess(venue, scope, actor)) {
          reject();
          continue;
        }
        const base = { operationId, expectedRevision: venue.access.revision, zoneId: scope, visitorId: "player" };
        try {
          if (management.action)
            applyAccessCommand(
              venue,
              readAccessCommand({ ...management, expectedRevision: venue.access.revision }),
              actor,
              turn.at,
              ["player", ...sceneActorIds(state)],
              sources.map((line) => line.id),
              state.communityVenueId,
            );
          else if (result.outcome.startsWith("ban-"))
            applyAccessCommand(
              venue,
              { ...base, action: "ban" },
              actor,
              turn.at,
              ["player", ...sceneActorIds(state)],
              sources.map((line) => line.id),
              state.communityVenueId,
            );
          else if (result.outcome === "invite-outside-hours")
            applyAccessCommand(
              venue,
              {
                ...base,
                action: "invite",
                duration: "visit",
                sceneId: venue.id === scene.placeId ? scene.id : undefined,
                accompanied: facts.accompanies === true,
                outsideHours: true,
              },
              actor,
              turn.at,
              ["player", ...sceneActorIds(state)],
              sources.map((line) => line.id),
              state.communityVenueId,
            );
          else if (venue.id === scene.placeId)
            applyAccessCommand(
              venue,
              { ...base, action: result.outcome === "dismiss" ? "leave-now" : "refuse-entry", sceneId: scene.id },
              actor,
              turn.at,
              ["player", ...sceneActorIds(state)],
              sources.map((line) => line.id),
              state.communityVenueId,
            );
          else continue;
        } catch {
          reject();
        }
      }
    };
    await changeSceneVenues(scene, apply);
    await mutateVillageState(apply);
  }

  async function finalizeRoomInvitation(
    scene: VenueScene,
    batch: InterpretationBatch,
    signal: VenueSubmission["invitationSignal"],
  ) {
    await recordRoomAccessEvents(scene, batch);
    if (signal) await recordSpokenInvitation(scene, signal);
  }

  function validateCurrentRoomInvitation(
    reply: Pick<SceneReply, "invitationSignal" | "roomInterpretation">,
    village: VillageState,
  ): void {
    const signal = reply.invitationSignal;
    if (!signal) return;
    const batch = reply.roomInterpretation;
    const invitations =
      batch?.results.flatMap((result, index) =>
        ["invite-now", "invite-later"].includes(result.outcome) ? [{ result, check: batch.checks[index] }] : [],
      ) ?? [];
    // Replayed greeting/turn checkpoints must still match exact witnessed speech.
    {
      const invitation = invitations[0];
      const facts = asRecord(invitation?.check?.facts);
      if (
        invitations.length !== 1 ||
        !invitation.check ||
        facts.actorId !== signal.residentId ||
        facts.venueId !== signal.venueId ||
        facts.zoneId !== signal.zoneId ||
        asRecord(facts.accessCommand).action !== "invite" ||
        !signal.accessOperationId ||
        asRecord(facts.accessCommand).operationId !== signal.accessOperationId ||
        invitation.result.outcome !== (signal.timing === "now" ? "invite-now" : "invite-later") ||
        !invitation.check.evidence.some(
          (line) =>
            line.current &&
            invitation.result.evidenceIds.includes(line.id) &&
            line.content === signal.quote &&
            (line.speakerId === signal.residentId || line.kind === "narration"),
        )
      ) {
        reply.invitationSignal = null;
        return;
      }
    }
    const venue = findLocation(village, signal.venueId);
    const zone = venue && resolveVenueZone(venue, signal.zoneId);
    if (!venue || !zone || zoneClosed(village, venue, zone) || !canInviteToZone(venue, zone, signal.residentId))
      reply.invitationSignal = null;
  }

  function applyImmediateZoneInvitation(
    session: VenueScene,
    signal: NonNullable<VenueSubmission["invitationSignal"]>,
  ): void {
    const zoneId = signal.zoneId;
    session.entryOffers = [
      ...(session.entryOffers ?? []).filter((entry) => entry.zoneId !== zoneId),
      {
        zoneId,
        label: signal.zoneLabel,
        controllerId: signal.residentId,
        accompanies: signal.accompanies === true,
      },
    ];
  }

  async function recordSpokenInvitation(
    session: VenueScene,
    signal: NonNullable<VenueSubmission["invitationSignal"]>,
  ): Promise<void> {
    const venue = findLocation(
      sceneContinuityView(await readVillageState(), await readSession(session.id)),
      signal.venueId,
    );
    const receipt = signal.accessOperationId && venue?.access?.receipts[signal.accessOperationId];
    if (!receipt || receipt.outcome === "rejected") throw conflict("The saved invitation needs recovery.");
  }

  async function applyVenueRequests(session: VenueScene, submission: VenueSubmission): Promise<void> {
    if (submission.venueRequestSignal) {
      const signal = submission.venueRequestSignal;
      const spoken = session.lines.find(
        (line) =>
          line.id === signal.sourceLineId &&
          line.speakerId === signal.characterId &&
          line.content.toLowerCase().includes(signal.quote.toLowerCase()),
      );
      if (spoken)
        await mutateVillageState((state) =>
          queueVillageVenueRequest(
            state,
            { name: signal.name, classes: signal.classes },
            signal.characterId,
            "chat",
            `venue-request:${submission.id}`,
            submission.at ?? villageNow().toISOString(),
            signal.quote,
          ),
        );
    }
    if (submission.residenceSignal) {
      const signal = submission.residenceSignal;
      if (signal.kind === "request") {
        try {
          await proposeVillageResidence(signal.characterId, signal.venueId, "villager", `venue-move:${submission.id}`);
        } catch (error) {
          if (submission.semanticProvenance?.version === 2) throw error;
          villagesLogger().warn("[villages] residence request was no longer valid: %s", String(error));
        }
      } else {
        try {
          await decideVillageResidence(
            signal.characterId,
            signal.approved === true,
            "villager",
            submission.semanticProvenance?.version === 2
              ? `semantic-residence:${session.id}:${submission.id}`
              : undefined,
            signal.approverId,
            signal.agreementScope,
          );
        } catch (error) {
          if (submission.semanticProvenance?.version === 2) throw error;
          villagesLogger().warn("[villages] residence decision was no longer valid: %s", String(error));
        }
      }
    }
  }

  async function recoverProjectMetadata(scene: VenueScene, turn: VenueSubmission): Promise<void> {
    if (!projectInterpretationNeedsRecovery(turn)) return;
    const village = await readVillageState();
    const citedIds = new Set(
      (turn.projectSpeech ?? []).flatMap((row) => row.citations.map((citation) => citation.lineId)),
    );
    // A partial applied outcome requires its existing receipt recovery, never a negative reinterpretation.
    if (
      village.projects.some((project) => project.lifecycle?.spokenProofs.some((proof) => citedIds.has(proof.lineId))) ||
      village.progressTasks.some((task) => task.receipts.some((receipt) => citedIds.has(receipt.evidence.lineId ?? "")))
    )
      return;
    const signature = JSON.stringify(turn.projectSpeech ?? []);
    const sourceHash = turn.semanticProvenance?.sourceHash;
    const terminalInvalid = (entry: VenueSubmission) =>
      entry.interpretationHistory?.some((row) => {
        const audit = asRecord(row.proposals);
        return (
          row.domain === "projects" &&
          row.source === "Automatic Project retry invalid" &&
          audit.sourceHash === sourceHash &&
          audit.submissionId === turn.id &&
          JSON.stringify(audit.originalProposals) === signature
        );
      });
    const started = turn.interpretationHistory?.some(
      (row) => row.domain === "projects" && row.source === "Automatic Project retry started",
    );
    if (!started) {
      await changeSession(scene.id, (saved) => {
        const entry = mutableSceneSubmission(saved, turn.id);
        if (
          !entry ||
          saved.villageSeed !== village.seed ||
          JSON.stringify(entry.projectSpeech ?? []) !== signature ||
          entry.semanticProvenance?.sourceHash !== turn.semanticProvenance?.sourceHash
        )
          throw conflict("The saved Project proposal changed during recovery.");
        entry.interpretationHistory ||= [];
        entry.interpretationHistory.push({
          at: villageNow().toISOString(),
          domain: "projects",
          source: "Automatic Project retry started",
          proposals: {
            sourceHash: entry.semanticProvenance?.sourceHash,
            originalProposals: structuredClone(entry.projectSpeech ?? []),
          },
        });
      });
      try {
        await retrySceneChangeInterpretationOnce(scene.id, turn.id, "projects", true);
      } catch (error) {
        // Only a returned, specifically invalid response permits a negative disposition.
        // Dispatch refusal, cancellation, provider and persistence errors remain blocking.
        if (!(error instanceof InvalidProjectRecoveryResponse)) throw error;
        await changeSession(scene.id, (saved) => {
          const entry = mutableSceneSubmission(saved, turn.id);
          if (
            !entry ||
            saved.villageSeed !== village.seed ||
            entry.semanticProvenance?.sourceHash !== sourceHash ||
            JSON.stringify(entry.projectSpeech ?? []) !== signature
          )
            throw conflict("The saved Project proposal changed during recovery.");
          entry.interpretationHistory ||= [];
          entry.interpretationHistory.push({
            at: villageNow().toISOString(),
            domain: "projects",
            source: "Automatic Project retry invalid",
            proposals: {
              submissionId: turn.id,
              sourceHash,
              originalProposals: structuredClone(entry.projectSpeech ?? []),
            },
          });
        });
      }
    }
    const latestScene = await readSession(scene.id),
      latestTurn = latestScene.submissions.find((row) => row.id === turn.id);
    if (!latestTurn || !terminalInvalid(latestTurn)) return;
    const latestVillage = await readVillageState();
    const latestCitedIds = new Set(
      (latestTurn?.projectSpeech ?? []).flatMap((row) => row.citations.map((citation) => citation.lineId)),
    );
    if (
      latestVillage.projects.some((project) =>
        project.lifecycle?.spokenProofs.some((proof) => latestCitedIds.has(proof.lineId)),
      ) ||
      latestVillage.progressTasks.some((task) =>
        task.receipts.some((receipt) => latestCitedIds.has(receipt.evidence.lineId ?? "")),
      )
    )
      return;
    await changeSession(scene.id, (saved) => {
      if (saved.villageSeed !== village.seed) throw conflict("Village identity changed during Project recovery.");
      const entry = mutableSceneSubmission(saved, turn.id);
      if (entry?.semanticProvenance?.sourceHash !== turn.semanticProvenance?.sourceHash)
        throw conflict("The saved Project proposal changed during recovery.");
      if (entry && terminalInvalid(entry) && projectInterpretationNeedsRecovery(entry))
        rejectProjectMetadata(
          entry,
          "Project interpretation unresolved; no additional Project effect applied",
          villageNow().toISOString(),
        );
    });
  }

  async function settleSemanticAuthority(scene: VenueScene, turn: VenueSubmission, allowProjectRecovery = true) {
    if (turn.semanticProvenance?.version !== 2) return;
    if (turn.npcAdmissions?.length || turn.placeDiscoveries?.length || turn.establishmentProgress?.length)
      await mutateVillageState((state) => applyPlaceExchange(state, scene, turn), { memories: true });
    await sceneNarrative?.settle(scene, turn.narrativeSource);
    const retainStandingAccess = async () => {
      const authority = await readVillageState();
      const receipts = Object.values(authority.exchangeReceipts).filter(
        (receipt) =>
          receipt.sceneId === scene.id &&
          receipt.submissionId === turn.id &&
          receipt.status === "applied" &&
          receipt.sceneFacts?.standingPermissions?.length,
      );
      if (!receipts.length) return;
      await changeSceneVenues(scene, (view) => {
        for (const receipt of receipts)
          for (const permission of receipt.sceneFacts!.standingPermissions!) {
            const liveVenue = findLocation(authority, permission.venueId);
            const capturedVenue = findLocation(view, permission.venueId);
            if (
              !liveVenue?.access?.receipts[permission.id] ||
              liveVenue.access.receipts[permission.id]?.outcome === "rejected" ||
              !capturedVenue?.access
            )
              throw conflict("The saved standing permission needs recovery.");
            settleStandingAccess(capturedVenue, permission, receipt.at, [
              "player",
              ...view.villagers.map((v) => v.characterId),
            ]);
            if (
              !capturedVenue.access.receipts[permission.id] ||
              capturedVenue.access.receipts[permission.id]?.outcome === "rejected"
            )
              throw conflict("The captured standing permission needs recovery.");
          }
      });
    };
    const publish = async () => {
      const currentScene = await readSession(scene.id);
      const current = currentScene.submissions.find((row) => row.id === turn.id);
      if (!current || current.semanticProvenance?.sourceHash !== turn.semanticProvenance?.sourceHash)
        throw conflict("The saved social source changed before publication.");
      const socialStatus = current.processing?.domains.relationships.status;
      const optionalSocialPending =
        current.semanticProvenance?.pipelineVersion === 3 &&
        !semanticAuthorityDomain(current, "relationships") &&
        ["pending", "failed", "rejected"].includes(socialStatus ?? "");
      let memoryResult: Partial<import("../../domain/models/exchange-model.js").DomainProcessing> | undefined;
      await mutateVillageState((state) => {
        if (state.seed !== scene.villageSeed) throw conflict("Village identity changed during source publication.");
        const saved = current.liveProposals;
        if (Array.isArray(saved?.memoryChanges) && saved.memoryChanges.length)
          memoryResult = applyLiveMemories(state, currentScene, turn.id, villageNow());
        if (saved && !optionalSocialPending) {
          const lines = createLiveEvidenceContext(currentScene, saved).lines;
          const parsed = parseRelationshipProposals(
            saved.relationshipChanges,
            scene.id + ":" + turn.id,
            lines,
            state,
            (row) => ({
              ...row,
              lineIds: (row.lineIds as unknown[]).map((ref) =>
                ref === "player" ? saved.playerLineId : typeof ref === "number" ? saved.replyLineIds[ref] : ref,
              ),
            }),
            true,
            currentScene.liveSceneVersion === 1
              ? state.relationshipContext
              : sceneContinuityView(state, currentScene).relationshipContext,
            currentScene.liveSceneVersion === 1,
          );
          // Settlement already checked private revisions; only its witnessed disclosures publish here.
          publishRelationshipDisclosures(
            state,
            parsed.review.disclosures,
            {
              kind: "scene",
              id: scene.id + ":" + turn.id,
              sceneId: scene.id,
              revision: 1,
              fingerprint: saved.sourceFingerprint,
            },
            lines,
            turn.at,
            villageNow().toISOString(),
          );
        }
        // Pending optional metadata stays recoverable without blocking independent source publication.
        if (!optionalSocialPending || socialStatus === "rejected")
          (state.socialPublications ??= {})[scene.id + ":" + turn.id] = true;
      });
      if (memoryResult)
        await changeSession(scene.id, (current) => {
          const target = mutableSceneSubmission(current, turn.id);
          if (target) {
            if (target.processing) Object.assign(target.processing.domains.memories, memoryResult);
          }
        });
    };
    if (turn.semanticReady) {
      await retainStandingAccess();
      await publish();
      return;
    }
    if (allowProjectRecovery && turn.sceneContractVersion !== 10) await recoverProjectMetadata(scene, turn);
    const currentScene = await readSession(scene.id);
    const currentTurn = currentScene.submissions.find((row) => row.id === turn.id);
    const physicalReceipt = (await readVillageState()).exchangeReceipts["venue-chat:" + scene.id + ":" + turn.id];
    const physicalRejected = physicalReceipt?.domain === "physical" && physicalReceipt.status === "rejected";
    if (turn.semanticPlayerMoves?.length && currentScene.zoneId !== turn.semanticPlayerMoves.at(-1)!.zoneId)
      throw conflict("The saved movement needs recovery before the turn can be displayed.");
    if (
      (turn.projectSpeech?.length || turn.action?.happened) &&
      currentTurn?.processing?.domains.projects.status !== "applied" &&
      !(currentTurn && projectMetadataRejected(currentTurn)) &&
      !physicalRejected
    )
      throw conflict("The saved immediate outcome needs recovery.");
    if (semanticAuthorityDomain(turn, "relationships")) {
      const result = currentTurn?.processing?.domains.relationships;
      if (result?.status !== "applied" || result.rejectedProposals?.length)
        throw conflict("The saved social outcome needs recovery.");
    }
    if (turn.accessEvents?.length) {
      const state = sceneContinuityView(await readVillageState(), currentScene);
      for (const event of turn.accessEvents) {
        const venue = findLocation(state, event.facts.venueId);
        if (!venue?.access) continue;
        const command = event.facts.accessCommand;
        const operationId =
          command?.operationId ??
          "access-speech:" +
            createHash("sha256")
              .update(event.id + ":" + event.outcome)
              .digest("hex");
        const receipt = venue.access.receipts[operationId];
        if (!receipt || receipt.outcome === "rejected") throw conflict("The saved access outcome needs recovery.");
      }
    }
    if (turn.semanticProvenance.authority?.physical && !turn.action?.happened)
      throw conflict("The saved physical outcome is missing its typed action.");
    if (turn.action?.happened) {
      const state = await readVillageState();
      if (
        !physicalRejected &&
        !state.exchangeReceipts[`venue-chat:${scene.id}:${turn.id}`]?.physicalOutcome?.actionReceipt?.happened
      )
        throw conflict("The saved physical outcome could not commit. Recover the saved request.");
    }
    await retainStandingAccess();
    await changeSession(scene.id, (saved) => {
      const entry = mutableSceneSubmission(saved, turn.id);
      if (entry?.semanticProvenance?.sourceHash === turn.semanticProvenance?.sourceHash) entry.semanticReady = true;
    });
    await publish();
  }
  async function applyVenueTurnChange(session: VenueScene, submission: VenueSubmission): Promise<void> {
    if (!submission.placeUpdate) return;
    const id = `venue-chat:${session.id}:${submission.id}`;
    await mutateVillageState((state) => {
      if (session.villageSeed && state.seed !== session.villageSeed) return;
      if (
        state.venueEvents.some((event) => event.id === id) ||
        state.exchangeReceipts[id]?.status === "applied" ||
        state.exchangeReceipts[id]?.status === "rejected"
      )
        return;
      const captured = submission.physicalContext;
      if (
        !captured?.zoneId ||
        !submission.areaAtTurn ||
        typeof submission.privateOwnerIdAtTurn !== "string" ||
        submission.semanticProvenance?.version !== 2
      )
        throw conflict("The saved physical source has no current captured Zone.");
      if (submission.physicalOutcomeVersion !== 1)
        throw conflict("The saved physical source has no current outcome receipt.");
      const zoneId = captured.zoneId,
        area = submission.areaAtTurn,
        privateOwnerId = submission.privateOwnerIdAtTurn;
      const witnesses = captured.witnessIds;
      const worksite = state.venues.some(
        (venue) => venue.id === session.placeId && venue.constructionStatus === "worksite",
      );
      const cancelled = state.projects.some(
        (project) =>
          project.kind === "new-venue" && project.venueId === session.placeId && project.status === "cancelled",
      );
      const rejectPhysical = (reason: string) => {
        const at = submission.at || villageNow().toISOString();
        state.exchangeReceipts[id] = {
          id,
          sceneId: session.id,
          submissionId: submission.id,
          domain: "physical",
          at,
          committedAt: at,
          status: "rejected",
          reason,
          evidenceIds: submission.replyLineIds ?? [],
          notice: { id, kind: "project", text: reason },
        };
      };
      if (
        submission.semanticProvenance?.preservationVersion === 1 &&
        sceneHaltWorldConflict(session, state, {
          placeUpdate: submission.placeUpdate,
          physicalContext: submission.physicalContext,
        })
      ) {
        rejectPhysical("The current state changed after acceptance; recover the saved physical outcome.");
        return;
      }
      if (worksite || cancelled) {
        rejectPhysical(
          cancelled
            ? "Project cancelled; this Scene outcome was not applied."
            : "Physical changes are unavailable at this unfinished worksite.",
        );
        return;
      }
      const controlledVenue = findLocation(state, session.placeId);
      const controlledZone = controlledVenue && resolveVenueZone(controlledVenue, zoneId);
      const capturedVenue = findLocation(session.continuity?.facts, session.placeId);
      const capturedZone = capturedVenue && resolveVenueZone(capturedVenue, zoneId);
      if (
        capturedVenue &&
        (capturedVenue.constructionStatus === "worksite" ||
          !controlledVenue ||
          !controlledZone ||
          !capturedZone ||
          JSON.stringify(projectZoneShape(controlledZone)) !== JSON.stringify(projectZoneShape(capturedZone)))
      ) {
        rejectPhysical("The Venue structure changed; this captured Scene outcome was not applied.");
        return;
      }
      if (controlledVenue && controlledZone && capturedVenue && capturedZone) {
        const authority = (venue: VillageVenue, zone: NonNullable<typeof controlledZone>) =>
          JSON.stringify({
            kind: zone.kind,
            venueClass: zone.venueClass,
            ownerId: zone.ownerId ?? "",
            controllers: [...(zone.controllerIds ?? [])].sort(),
            managers: [...(zone.access?.managerIds ?? venue.access?.managerIds ?? [])].sort(),
            residents: zone.venueClass === "residence" ? [...venueResidentIds(venue)].sort() : [],
            workers: zone.kind === "staff" ? [...(venue.workerIds ?? [])].sort() : [],
          });
        if (authority(controlledVenue, controlledZone) !== authority(capturedVenue, capturedZone)) {
          rejectPhysical("Authority over this Zone changed; this captured Scene outcome was not applied.");
          return;
        }
      }
      const change = readVenueSceneChange(
        { happened: true, ...submission.placeUpdate },
        (() => {
          const place = findLocation(sceneContinuityView(state, session), session.placeId);
          return place ? venueInZone(place, zoneId) : undefined;
        })(),
        submission.at || session.startedAt,
      );
      if (!change) return;
      const at = submission.at || villageNow().toISOString();
      const after = applyVenueSceneChange(
        state,
        session.placeId,
        change,
        session.id,
        at,
        session.spaceClass,
        area,
        privateOwnerId,
        zoneId,
        submission.physicalContext,
        sceneContinuityView(state, session).narrative?.conditions,
      );
      const venue = findLocation(state, session.placeId)!;
      state.venueEvents = [
        {
          id,
          venueId: session.placeId,
          zoneId,
          venueName: venue.name,
          text: change.narration,
          at,
          actionReceipt: {
            happened: true,
            ...change,
            submissionId: submission.id,
            witnessIds: ["player", ...witnesses],
            after,
          },
        },
        ...state.venueEvents,
      ].slice(0, 200);
      state.exchangeReceipts[id] = {
        id,
        sceneId: session.id,
        submissionId: submission.id,
        domain: "physical",
        at,
        committedAt: villageNow().toISOString(),
        status: "applied",
        evidenceIds: submission.replyLineIds ?? [],
        reason: "Confirmed physical outcome",
        physicalOutcome: state.venueEvents[0]!,
      };
      if (submission.sceneHearingVersion === 2) {
        const details = [
          ...(change.edits ?? []).map((edit) => edit.after || `Removed: ${edit.before}`),
          change.append,
          change.recent?.text,
        ]
          .filter(Boolean)
          .join(" ");
        if (details)
          rememberDomainFact(state, {
            id,
            effectId: id,
            event: true,
            at,
            recordedAt: villageNow().toISOString(),
            committedAt: state.exchangeReceipts[id]!.committedAt,
            sceneId: session.id,
            text: `${venue.name}: ${details}`,
            knowers: ["player", ...witnesses],
            subjects: [],
            domainRef: { kind: "physical", id: venue.id },
          });
      }
    });
  }

  async function receiptForTurn(
    session: VenueScene,
    submission: VenueSubmission,
    persist = true,
  ): Promise<VenueRecordEvent[]> {
    // Domain bookkeeping can finish after the reply's original Scene object was read.
    submission = (await readSession(session.id)).submissions.find((turn) => turn.id === submission.id) ?? submission;
    const village = await readVillageSnapshot();
    // Saved notices were authorized at delivery; later Forget cannot rewrite that history.
    const cached = filterRelationshipNotices(submission.recordEvents ?? []);
    if (session.status === "closed" && !village.memoryScenes[session.id]) return structuredClone(cached);
    const events: VenueRecordEvent[] = [];
    for (const receipt of Object.values(village.exchangeReceipts))
      if (receipt.sceneId === session.id && receipt.submissionId === submission.id && receipt.notice)
        events.push(receipt.notice);
    const venueId = `venue-chat:${session.id}:${submission.id}`;
    const change = physicalVenueEvents(village).find((entry) => entry.id === venueId);
    if (change) events.push({ id: venueId, kind: "venue", text: change.text });
    for (const project of village.projects) {
      const flow = project.lifecycle;
      const proofs =
        flow?.spokenProofs.filter((proof) => proof.sessionId === session.id && proof.submissionId === submission.id) ??
        [];
      if (!flow || !proofs.length) continue;
      const lineIds = new Set(proofs.map((proof) => proof.lineId));
      const id = `project:${project.id}:${submission.id}`;
      const builder = flow.candidates.find((entry) => proofs.some((proof) => proof.speakerId === entry.residentId));
      const name =
        session.participants.find((person) => person.characterId === builder?.residentId)?.name ?? "A villager";
      const text = builder
        ? `${name} agreed to build ${project.title}.`
        : flow.approvals.some((entry) => lineIds.has(entry.evidenceId))
          ? `Approval for ${project.title} was confirmed.`
          : `The commitment for ${project.title} was updated.`;
      events.push({ id, kind: "project", text });
    }
    const request = submission.residenceSignal;
    if (request?.kind === "request" && village.processedActionIds.includes(`venue-move:${submission.id}`)) {
      const name =
        session.participants.find((person) => person.characterId === request.characterId)?.name ?? "A villager";
      events.push({ id: `venue-move:${submission.id}`, kind: "request", text: `${name} asked to move.` });
    }
    const combined = [...new Map([...events, ...cached].map((event) => [event.id, event])).values()];
    if (persist && JSON.stringify(combined) !== JSON.stringify(submission.recordEvents ?? []))
      await changeSession(session.id, (state) => {
        const saved = mutableSceneSubmission(state, submission.id);
        if (saved) saved.recordEvents = combined;
      });
    return combined;
  }

  async function latestSceneReceipts(session: VenueScene): Promise<VenueRecordEvent[]> {
    const current = await readVillageSnapshot();
    // Earlier changes remain in the paged changes feed; closing acknowledges the latest exchange.
    return [
      ...new Map((session.submissions.at(-1)?.recordEvents ?? []).map((event) => [event.id, event])).values(),
    ].filter((event) => !current.dismissedNoticeIds.includes(event.id));
  }

  async function endVenueSession(id: string, retryOfAttemptId?: string): Promise<VenueScene> {
    return coordinateVenue(id, "close", "close", {}, undefined, retryOfAttemptId, () => closeVenueSessionOnce(id));
  }

  /** Close the Scene and return its committed visible changes. */
  async function endVenueSessionWithReceipts(id: string, retryOfAttemptId?: string) {
    const session = await endVenueSession(id, retryOfAttemptId);
    return { session, recordEvents: await latestSceneReceipts(session) };
  }

  /** Archive the Scene after recovering saved exchange work; no closing review. */
  async function closeVenueSession(
    id: string,
    expectedSceneRevision?: number,
    retryOfAttemptId?: string,
    abandonOperationId?: string,
  ): Promise<VenueScene> {
    const scene = await readSession(id);
    if (scene.status === "closed") return scene;
    const resumingAbandon = scene.operation?.id === "close" && !!scene.operation.checkpoints?.["abandoned-request"];
    const closeInput = resumingAbandon ? scene.operation!.input : abandonOperationId ? { abandonOperationId } : {};
    return coordinateVenue(
      id,
      "close",
      "close",
      closeInput,
      expectedSceneRevision,
      retryOfAttemptId,
      async () => {
        if (!abandonOperationId && !resumingAbandon) return closeVenueSessionOnce(id);
        const current = await readSession(id);
        const blocker = semanticBlocker(current);
        if (blocker) throw conflict(blocker);
        return closeLiveScene(current);
      },
      { abandonOfOperationId: resumingAbandon ? undefined : abandonOperationId },
    );
  }

  async function closeVenueSessionOnce(id: string): Promise<VenueScene> {
    const session = await readSession(id);
    for (const turn of session.submissions.filter((turn) => turn.processing && unfinishedExchange(turn.processing))) {
      await processSavedExchange(id, turn.id).catch((error) =>
        villagesLogger().warn("[villages] deferred Scene recovery: %s", String(error)),
      );
    }
    const recovered = await readSession(id);
    const blocker = semanticBlocker(recovered);
    if (blocker) throw conflict(blocker);
    const closed = await closeLiveScene(recovered);
    await mutateVillageState((state) => {
      if (
        state.seed === closed.villageSeed &&
        state.opening?.stage === "gathering" &&
        state.opening.gatheringSceneId === id
      )
        state.opening.stage = "complete";
    });
    return closed;
  }

  async function closeVenueSessionWithReceipts(
    id: string,
    expectedSceneRevision?: number,
    retryOfAttemptId?: string,
    abandonOperationId?: string,
  ) {
    const session = await closeVenueSession(id, expectedSceneRevision, retryOfAttemptId, abandonOperationId);
    return { session, recordEvents: await latestSceneReceipts(session) };
  }

  async function closeLiveScene(session: VenueScene): Promise<VenueScene> {
    const closed = await changeSession(session.id, (state) => {
      state.status = "closed";
      state.endedAt ||= villageNow().toISOString();
      state.endReason ||= "player";
    });
    await mutateVillageState((state) => {
      releaseSceneMemories(state, closed);
      if (
        state.seed === closed.villageSeed &&
        state.opening?.version === 3 &&
        state.opening.stage === "gathering" &&
        state.opening.gatheringSceneId === closed.id &&
        state.opening.id === closed.openingGatheringId
      )
        state.opening.stage = "complete";
    });
    await clearActivePointer(session.id, true);
    return closed;
  }

  /** Only saved local results can finish a deferred natural conclusion. */
  async function finishSemanticScene(id: string): Promise<void> {
    let scene = await readSession(id);
    const semanticTurns = scene.submissions.filter((row) => row.semanticProvenance?.version === 2);
    const authority = semanticTurns.length ? await readVillageState() : undefined;
    for (const turn of semanticTurns.filter(
      (row) => !row.semanticReady || !authority?.socialPublications?.[scene.id + ":" + row.id],
    )) {
      try {
        await settleSemanticAuthority(scene, turn, false);
      } catch (error) {
        if (asRecord(error).statusCode === 409) return;
        throw error;
      }
    }
    scene = await readSession(id);
    if (scene.submissions.some((turn) => turn.semanticConclude) && !semanticBlocker(scene)) await closeLiveScene(scene);
  }

  async function discardVenueVisitDebug(id: string): Promise<void> {
    return withSceneActivation(() => discardVenueVisitDebugInActivation(id));
  }

  async function discardVenueVisitDebugInActivation(id: string): Promise<void> {
    if (!villagesDebugAgentsEnabled()) throw notFound("That debug action is unavailable.");
    const work = sceneWork();
    await cancelVenueOperation(id);
    const session = await requireLiveVenueSession(id);
    work.abortGreeting(id);
    await sceneNarrative?.discard(session);
    await changeSession(id, (state) => {
      if (state.status === "closed") return;
      state.status = "closed";
      state.endedAt = villageNow().toISOString();
      state.endReason = "debug";
    });
    await clearActivePointer(id);
    const document = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${session.id}`);
    if (document) await villagesDocuments().remove(VILLAGES_PACKAGE_ID, document.id, document.revision);
    await mutateVillageState((state) => {
      if (state.seed === session.villageSeed) {
        delete state.memoryScenes[session.id];
      }
    });
  }

  async function recoverVenueSceneWork() {
    await recoverVenueOperations(async (id, operation) => {
      if (operation.kind === "change-interpretation")
        return coordinateVenue(
          id,
          operation.id,
          operation.kind,
          operation.input,
          undefined,
          undefined,
          () =>
            retrySceneChangeInterpretationOnce(
              id,
              String(operation.input.submissionId),
              operation.input.domain as "memories" | "relationships" | "wishes" | "projects",
            ),
          { recovery: true },
        );
      if (operation.kind === "move")
        return coordinateVenue(
          id,
          operation.id,
          "move",
          operation.input,
          undefined,
          undefined,
          () => moveVenueZoneOnce(id, String(operation.input.zoneId)),
          { recovery: true },
        );
      if (operation.kind === "turn") {
        assertSceneTurnMode(operation.input.mode);
        assertCurrentSceneGeneration(await readSession(id));
        const input = { ...operation.input, sessionId: id, submissionId: operation.id } as VenueTurnInput;
        return coordinateVenue(
          id,
          operation.id,
          operation.kind,
          operation.input,
          undefined,
          undefined,
          () =>
            input.mode === "leave"
              ? leaveVenueSessionOnce(id, input.submissionId, input.message)
              : sendVenueTurnOnce(input),
          { recovery: true, replay: true },
        );
      }
      if (operation.kind === "close")
        return coordinateVenue(
          id,
          operation.id,
          operation.kind,
          operation.input,
          undefined,
          undefined,
          () => closeVenueSessionOnce(id),
          { recovery: true },
        );
      if (operation.kind === "greet") {
        assertCurrentSceneGeneration(await readSession(id));
        return coordinateVenue(
          id,
          operation.id,
          "greet",
          operation.input,
          undefined,
          undefined,
          () => greetVenueOnce(id, venueOperationSignal()!, () => {}),
          { recovery: true },
        );
      }
    });
  }

  function withSceneActivation<T>(work: () => T): T {
    const owner = activationScope();
    return owner ? owner.run(work) : work();
  }

  /** Saved-exchange callbacks retain the selected command owner when passed to progress. */
  function sceneReplayEffects() {
    return bindReplayEffects({ applySavedAccessEvents, recordSpokenInvitation, applyVenueTurnChange, receiptForTurn });
  }
  return {
    retrySceneChangeInterpretation,
    moveVenueZone,
    enterVenue,
    greetVenue,
    continueVenueWithoutGreeting,
    sendVenueTurn,
    leaveVenueSession,
    recordRoomAccessEvents,
    recordSpokenInvitation,
    endVenueSession,
    endVenueSessionWithReceipts,
    closeVenueSession,
    closeVenueSessionWithReceipts,
    discardVenueVisitDebug,
    recoverVenueSceneWork,
    sceneReplayEffects,
    finishSemanticScene,
  };
}
export type SceneCommands = ReturnType<typeof createSceneCommands>;
