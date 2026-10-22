import { availableProjectSupplyTransfers } from "../../domain/rules/project-supply-transfer.js";
import { releaseSceneWishes } from "../../domain/rules/scene-wish-protection.js";
import { openingPresence } from "../../domain/rules/opening-presence.js";
import {
  openingActive,
  ordinaryProjectsLocked,
  gatheringDialogueComplete,
} from "../../domain/rules/opening-project.js";
import { completeSceneObject } from "../../domain/rules/scene-writing-contract.js";
import { sceneWritingCapabilities } from "../../domain/rules/scene-compact-contract.js";
import { acousticFragment, bindAcousticPlan } from "../../domain/rules/scene-acoustics.js";
import { interpretAcoustics } from "./acoustic-interpretation.js";
import { acousticInstructions } from "./acoustic-prompt.js";
import {
  semanticBlocker,
  semanticAuthorityDomain,
  projectInterpretationNeedsRecovery,
  projectMetadataRejected,
  rejectProjectMetadata,
} from "../../domain/rules/semantic-continuity.js";
import { readSemanticEffects, SEMANTIC_OPERATION_BUDGET } from "../../domain/rules/semantic-contract.js";
import { zoneEventScene } from "../../domain/rules/zone-events.js";
import { assertSceneMovementCapacity } from "../../domain/rules/resident-movement.js";
import { captureSceneLayout, sceneLayoutVenue } from "../../domain/rules/scene-layout.js";
import { sceneContinuityView } from "../../domain/rules/scene-continuity.js";
import { villageNow, villageClockShiftMs } from "../../adapters/time/clock-gate.js";
import { type SceneReply } from "./writing.js";
import { interpretAttention } from "./attention-interpretation.js";
import {
  movedAttentionContacts,
  attentionClarificationChoices,
  bindAttentionPlan,
  holdAttentionPlan,
  validAttentionPlan,
  type AttentionPlan,
} from "../../domain/rules/scene-attention.js";
import { observePrivateInterior } from "../../domain/rules/private-interior.js";
import { claimZonePictureEntry, zonePictureContext } from "../../domain/rules/zone-picture.js";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import { ACTIVE_ID, SESSION_PREFIX, activeSlot, sessionSlot } from "../../adapters/storage/scene-slots.js";
import { unfinishedExchange } from "../../domain/decoding/exchange-codec.js";
import { coerceSession } from "../../domain/decoding/scene-codec.js";
import type { InterpretationBatch } from "../../domain/models/interpretation-model.js";
import type {
  GreetingTrace,
  VenueLine,
  VenueRecollection,
  VenueRecordEvent,
  VenueReplyLine,
  VenueScene,
  VenueSubmission,
} from "../../domain/models/scene-model.js";
import type { VillageState, VillageVenue, VillageVenueClass } from "../../domain/models/world.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { validDecisionEvidence } from "../../domain/rules/decision-candidates.js";
import {
  badGateway,
  badRequest,
  conflict,
  notFound,
  safeFailureMessage,
  VillagesRequestError,
} from "../../domain/rules/errors.js";
import {
  bindProjectSpeech,
  projectSpeechContexts,
  validateProjectSpeech,
} from "../../domain/rules/project-interpretation.js";
import { prependHappenings } from "../../domain/rules/prompt-preset.js";
import { relationshipZoneController } from "../../domain/rules/relationship-rules.js";
import { responseDiagnostics } from "../../domain/rules/response-diagnostics.js";
import { captureSceneAttendance, sceneZoneOccupants } from "../../domain/rules/scene-attendance.js";
import { appendLine } from "../../domain/rules/scene-record.js";
import { parseVenueReply, quietContactReply, savedAccessEvents } from "../../domain/rules/scene-reply.js";
import { applyInterpretedRoomEvents } from "../../domain/rules/scene-room-application.js";
import {
  applyAccessCommand,
  claimVisitPermission,
  evaluateZoneAccess,
  managesAccess,
  readAccessCommand,
} from "../../domain/rules/venue-access.js";
import {
  contactCanEnter,
  contactDevice,
  type ContactIntent,
  contactNeighbors,
  contactPath,
  contactPosition,
  contactReach,
  readContactDelivery,
  readContactRelay,
  sceneAccessContext,
} from "../../domain/rules/venue-contact.js";
import { venueClasses, venueInArea, venueResidentIds } from "../../domain/rules/venue-model.js";
import { movementTransition, assertConversationalPlayerPosition } from "../../domain/rules/venue-movement.js";
import { semanticPlayerMoves } from "../../domain/rules/semantic-timeline.js";
import {
  applyVenueSceneChange,
  physicalVenueEvents,
  readVenueSceneChange,
} from "../../domain/rules/venue-scene-state.js";
import {
  canInviteToZone,
  canOccupyZone,
  legacyZoneId,
  resolveVenueZone,
  venueInZone,
  venueZones,
  zoneArea,
  zoneClosed,
  zoneControllerIds,
} from "../../domain/rules/venue-zones.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import { readPlayerIdentity } from "../../domain/rules/village-projections.js";
import { knownWish } from "../../domain/rules/wish-journal.js";
import { metadataFailure, completionFailure as typedCompletionFailure } from "../../domain/rules/work-failure.js";
import {
  bindLiveProposals,
  liveEvidence,
  memoryVersion,
  mergeLiveReplyProposals,
} from "../../domain/rules/live-exchange.js";
import { filterRelationshipNotices, relationshipChangeNotices } from "../../domain/rules/relationship-presentation.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { createHash, randomUUID } from "node:crypto";
export interface SceneCommandPorts {
  semantic?: import("../../domain/models/semantic-model.js").SemanticInterpreter;
  interpretRoomDraft: typeof import("./writing.js").interpretRoomDraft;
  generate: typeof import("./writing.js").generate;
  generateContactResponse: typeof import("./writing.js").generateContactResponse;
  explicitSceneActions: typeof import("./writing.js").explicitSceneActions;
  VENUE_REPLY_MAX_TOKENS: typeof import("./writing.js").VENUE_REPLY_MAX_TOKENS;
  readSceneChanges: typeof import("./changes.js").readSceneChanges;
  processSavedExchange: typeof import("./progress.js").processSavedExchange;
  activeVenueSession: typeof import("./live-session.js").activeVenueSession;
  requireLiveVenueSession: typeof import("./live-session.js").requireLiveVenueSession;
  refreshZoneParticipants: typeof import("./live-session.js").refreshZoneParticipants;
  pruneVenueVisits: typeof import("./archive.js").pruneVenueVisits;
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
  villagesDocuments(): Pick<
    ReturnType<typeof import("../../adapters/engine/runtime-host.js").villagesDocuments>,
    "list" | "getById" | "remove"
  >;
  villagesLogger(): Pick<
    ReturnType<typeof import("../../adapters/engine/runtime-host.js").villagesLogger>,
    "debug" | "info" | "warn"
  >;
  villagesLanguageModels(): Pick<
    ReturnType<typeof import("../../adapters/models/language-models.js").villagesLanguageModels>,
    "resolveForRequest"
  >;
  loadBackgroundRetry(): Promise<Pick<typeof import("../../jobs/background-work.js"), "retryBackgroundJob">>;
  loadPrivateSpaceImages(): Promise<
    Pick<typeof import("../media/location-image.js"), "generateFirstPrivateSpaceImage"> &
      Partial<Pick<typeof import("../media/location-image.js"), "personalizeZoneOnEntry">>
  >;
  runtimeDebug: typeof import("../../adapters/observability/runtime-debug.js").runtimeDebug;
  assertVenueOwnership: typeof import("../../adapters/operations/operation-context.js").assertVenueOwnership;
  outsideVenueOperation: typeof import("../../adapters/operations/operation-context.js").outsideVenueOperation;
  venueOperationId: typeof import("../../adapters/operations/operation-context.js").venueOperationId;
  venueOperationSignal: typeof import("../../adapters/operations/operation-context.js").venueOperationSignal;
  venueOperationSnapshot: typeof import("../../adapters/operations/operation-context.js").venueOperationSnapshot;
  venueOperationInput: typeof import("../../adapters/operations/operation-context.js").venueOperationInput;
  venueRefusal: typeof import("../../adapters/operations/operation-context.js").venueRefusal;
  venueRequestMetrics: typeof import("../../adapters/operations/operation-context.js").venueRequestMetrics;
  mutateDocument: typeof import("../../adapters/storage/document-store.js").mutateDocument;
  changeSession: typeof import("../../adapters/storage/scene-store.js").changeSession;
  clearActivePointer: typeof import("../../adapters/storage/scene-store.js").clearActivePointer;
  readActive: typeof import("../../adapters/storage/scene-store.js").readActive;
  readSession: typeof import("../../adapters/storage/scene-store.js").readSession;
  cancelVenueOperation: typeof import("../../jobs/venue-coordinator.js").cancelVenueOperation;
  coordinateVenue: typeof import("../../jobs/venue-coordinator.js").coordinateVenue;
  hasVenueOperation: typeof import("../../jobs/venue-coordinator.js").hasVenueOperation;
  recoverVenueOperations: typeof import("../../jobs/venue-coordinator.js").recoverVenueOperations;
  rejectVenueCompletion: typeof import("../../jobs/venue-coordinator.js").rejectVenueCompletion;
  venueCheckpoint: typeof import("../../jobs/venue-coordinator.js").venueCheckpoint;
  writeInterpretationDiagnostics: typeof import("../generation/interpretation-diagnostics.js").writeInterpretationDiagnostics;
  saveInterpretationContext: typeof import("../generation/interpretation-evidence.js").saveInterpretationContext;
  completeWithRoom: typeof import("../generation/model-requests.js").completeWithRoom;
  finalizeProjectDiagnostics: typeof import("../projects/project-checks.js").finalizeProjectDiagnostics;
  interpretProjectDraft: typeof import("../projects/project-checks.js").interpretProjectDraft;
  projectProposals: typeof import("../../domain/rules/project-check-rules.js").projectProposals;
  rollActiveAgendas: typeof import("../residents/resident-agendas.js").rollActiveAgendas;
  wishFingerprint: typeof import("../../domain/rules/wish-interpretation-rules.js").wishFingerprint;
  bindWishProposals: typeof import("../../domain/rules/wish-progress-rules.js").bindWishProposals;
  WISH_PROPOSAL_INSTRUCTION: typeof import("../../domain/rules/wish-progress-rules.js").WISH_PROPOSAL_INSTRUCTION;
  villagesConnectionIdFor: typeof import("../settings/connections.js").villagesConnectionIdFor;
  recordVillagerVenueImprovement: typeof import("../venues/venue-mailbox.js").recordVillagerVenueImprovement;
  mutateVillageState: typeof import("../world/village-store.js").mutateVillageState;
  readVillageSnapshot: typeof import("../world/village-store.js").readVillageSnapshot;
  readVillageState: typeof import("../world/village-store.js").readVillageState;
  queueVillageVenueRequest: typeof import("../venues/venue-requests.js").queueVillageVenueRequest;
  applyResidenceEditApproval: typeof import("../venues/zone-edits.js").applyResidenceEditApproval;
}
/** Inert Scene command orchestration; callbacks retain originating feature connections. */
export function createSceneCommands({
  interpretRoomDraft,
  generate,
  generateContactResponse,
  explicitSceneActions,
  VENUE_REPLY_MAX_TOKENS,
  readSceneChanges,
  processSavedExchange,
  activeVenueSession,
  requireLiveVenueSession,
  refreshZoneParticipants,
  pruneVenueVisits,
  decideVillageResidence,
  proposeVillageResidence,
  activationScope,
  bindReplayEffects,
  sceneWork,
  villagesDebugAgentsEnabled,
  villagesDocuments,
  villagesLogger,
  villagesLanguageModels,
  loadBackgroundRetry,
  loadPrivateSpaceImages,
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
  semantic,
}: SceneCommandPorts) {
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
    const originalProjectProposals = JSON.stringify(turn.projectSpeech ?? []);
    const originalSourceHash = turn.semanticProvenance?.sourceHash;
    if (domain === "wishes") {
      const jobs = await villagesDocuments().list(VILLAGES_PACKAGE_ID, "background-work");
      const failed = jobs.filter((record) => {
        const job = asRecord(record.data),
          input = asRecord(job.input);
        return (
          job.kind === "wish-check" &&
          job.seed === village.seed &&
          input.sceneId === id &&
          input.submissionId === submissionId &&
          ["failed", "interrupted", "paused"].includes(String(job.status))
        );
      });
      if (failed.length) {
        const { retryBackgroundJob } = await loadBackgroundRetry();
        const action = venueOperationId();
        await venueCheckpoint("wish-background-retry", async () => {
          for (const record of failed) {
            const job = asRecord(record.data);
            await outsideVenueOperation(() =>
              retryBackgroundJob(
                record.id,
                Number(job.attempt),
                createHash("sha256")
                  .update(JSON.stringify([action, record.id, job.attempt]))
                  .digest("hex"),
              ),
            );
          }
          return true;
        });
        await processSavedExchange(id, submissionId);
        return readSceneChanges(id);
      }
    }
    const memoryIds = Object.keys(proposals.memoryVersions);
    const memories = village.chronicle.filter((memory) => memoryIds.includes(memory.id) && !memory.supersededBy);
    const result = await venueCheckpoint("change-interpretation", async () => {
      let model = await villagesLanguageModels().resolveForRequest({
        connectionId: await villagesConnectionIdFor("system"),
      });
      let messages: CapabilityLanguageModelMessage[] = [
        {
          role: "system",
          content: `Interpret ONLY the supplied saved exchange for ${domain}. Do not rewrite narration, change physical state, or invent evidence. ${domain === "wishes" ? WISH_PROPOSAL_INSTRUCTION : domain === "projects" ? 'Return projectSpeech:[{projectId,revision,kind:"approval|builder|requirements|offer",requirementId?:exact supply ID,speakerId,citations:[{lineId,quote}],checklist:[]}]. Reassess the original proposals against the FULL saved dialogue, including explicit denials and conditions. An offer means a finite contribution of the actual materials in a supplied requirement; willingness to sand, drill or hold a plank is labor, never an offer of sandpaper, oil, tools or a whole material bundle. A jug does not satisfy finishing materials. Missing any required component or explicitly denying it cannot establish that complete supply. Omit unsupported or uncertain rows; projectSpeech:[] is a valid negative result. Cite exact saved lineIds and full relevant speaker speech, preserving conditions/negation. Offers require the exact supplied requirementId; other kinds do not. Only supplied Project contexts/revisions are eligible. A promise is never a completed handoff; do not propose physical effects.' : domain === "relationships" ? 'Return relationshipChanges:{changes:[],permissions:[],disclosures:[]}. Changes use fromId,toId,dimension:"warmth|trust",strength:"minor|meaningful|major|none",direction:"increase|decrease",ordinary:boolean,reason:"brief grounded reason",lineIds:[],disclosed:boolean. Trust needs demonstrated reliability or confidence/boundary interaction. Permissions require explicit unconditional standing authority; disclosures require actual heard speech. No rewards for mere co-location.' : 'Return memoryChanges:[{kind:"passing|durable|reinforce|supersede",text,category:"commitment|personal-fact|preference|relationship|shared-experience",subjectCharacterIds:[],knownByCharacterIds:[],evidence:[],memoryIds:[]}]. Every knower must witness every citation. Verify facts against supplied evidence; a speaker denial establishes only an attributed belief/statement, never historical absence. Partial history proves no absence. Preserve qualifications and distinguish promises from deeds. Durable entries need stable facts; reinforce/supersede cite supplied matching durable memoryIds. Unsupported factual memories must be omitted.'} Use exact saved evidence IDs, not numeric indexes. Return JSON only.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            evidence: liveEvidence(scene, proposals).filter(
              (line) =>
                domain !== "wishes" || line.id === proposals.playerLineId || proposals.replyLineIds.includes(line.id),
            ),
            residents: village.villagers.map((person) => ({ id: person.characterId, name: person.cardSnapshot.name })),
            ...(domain === "memories" ? { memories } : {}),
            ...(domain === "projects"
              ? {
                  projects: (turn.projectContexts ?? []).map((context) => ({
                    ...context,
                    title: village.projects.find((project) => project.id === context.projectId)?.title,
                    supplies:
                      village.projects
                        .find((project) => project.id === context.projectId)
                        ?.lifecycle?.requirements.filter((item) => item.needed)
                        .map((item) => ({ id: item.id, title: item.title })) ?? [],
                  })),
                  originalProposals: turn.projectSpeech ?? [],
                }
              : {}),
            ...(domain === "wishes"
              ? {
                  wishes: (turn.wishContexts ?? []).flatMap((context) => {
                    const wish = village.villagers
                      .find((person) => person.characterId === context.actorId)
                      ?.agenda?.wishes.find(
                        (wish) => wish.id === context.wishId && wishFingerprint(wish) === context.fingerprint,
                      );
                    return wish ? [{ ...context, text: wish.wish }] : [];
                  }),
                }
              : {}),
            ...(domain === "relationships"
              ? {
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
          ' This is a v2 System-owned event. Interpret paraphrases and contextual short answers without phrase tests. Wish check/progress rows require criteria:{kind:"conversation|transfer|action|complex",requiresPhysical:boolean,itemName?,predicate?,target?,venueId?} for the ORIGINAL goal. Relationship changes require contact:boolean for actual substantive shared contact. Project kinds also include offer/handoff with exact requirementId; a handoff requires an actual completed local transfer from a supplied existing source. No model-authored provenance or verification flags.';
      const output = turn.semanticProvenance?.version === 2 ? 2400 : VENUE_REPLY_MAX_TOKENS;
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
          retryEmpty: false,
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
        memoryVersions: Object.fromEntries(memories.map((memory) => [memory.id, memoryVersion(memory)])),
        requests: venueRequestMetrics(),
      };
    });
    await changeSession(id, (saved) => {
      if (saved.villageSeed !== village.seed) throw conflict("Village identity changed.");
      const entry = saved.submissions.find((turn) => turn.id === submissionId)!;
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
          entry.wishContexts,
          entry.semanticProvenance?.version === 2,
        );
        entry.wishProposals = bound.proposals;
        entry.wishProposalError = bound.error;
      } else if (domain === "projects") {
        entry.projectSpeech = result.recoveredProjects ?? [];
        entry.projectInterpretationVersion = 1;
        entry.progressProcessedAt = undefined;
        entry.progressError = "";
      } else entry.liveProposals[domain === "memories" ? "memoryChanges" : "relationshipChanges"] = result.value;
      if (entry.effectFailures) delete entry.effectFailures[domain];
      if (domain === "memories") entry.liveProposals.memoryVersions = result.memoryVersions;
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
  ): string[] {
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
        ...(line.remoteDelivery ? { remoteDelivery: line.remoteDelivery } : {}),
        ...(line.contactHidden ? { contactHidden: true } : {}),
        ...(line.attentionEvidence ? { attentionEvidence: true } : {}),
        ...(line.contactReport ? { contactReport: true } : {}),
        kind: line.kind,
        ...(line.delivery ? { delivery: line.delivery } : {}),
        ...(line.presentation ? { presentation: line.presentation } : {}),
        ...(line.expression ? { expression: line.expression } : {}),
        ...(line.gazeAt ? { gazeAt: line.gazeAt } : {}),
        ...(line.staging?.length ? { staging: line.staging } : {}),
        ...(line.targetId ? { targetId: line.targetId } : {}),
        ...(line.anchorIndex !== undefined ? { asideFor: lineIds[line.anchorIndex]! } : {}),
      }),
    );
    return lineIds;
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
    const legacy = saved.submissions.find((turn) => turn.movement?.operationId === operationId)?.movement;
    if (receipt || legacy) {
      if ((receipt ?? legacy)!.destinationZoneId !== zoneId)
        throw conflict("That navigation ID belongs to a different Zone.");
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
      { replay: !!(receipt || legacy) },
    );
  }

  async function moveVenueZoneOnce(
    sessionId: string,
    zoneId: string,
    written?: { message: string; targetId: string; requestMode?: "act" | "fulfill" },
  ): Promise<VenueScene> {
    assertVenueOwnership();
    let session = await requireLiveVenueSession(sessionId);
    if (session.openingReader) throw conflict("Finish the gathering or skip the opening first.");
    if (!session.sceneAttendance) session = await refreshZoneParticipants(session, true);
    const operationId = venueOperationId();
    const recorded =
      session.navigationReceipts?.some((entry) => entry.id === operationId) ||
      session.submissions.some((turn) => turn.movement?.operationId === operationId);
    if (recorded) {
      await markZoneSeen(session, false);
      return refreshZoneParticipants(session, true);
    }
    const blocker = semanticBlocker(session);
    if (blocker) throw conflict(blocker);
    if (session.status !== "active") throw conflict("Wait for the current scene to finish opening.");
    const village = sceneContinuityView(await readVillageState(), session),
      venue = village.venues
        .map((entry) => sceneLayoutVenue(entry, session))
        .find((entry) => entry.id === session.placeId);
    const zone = venue && resolveVenueZone(venue, zoneId);
    if (!venue || !zone) throw notFound("That zone is not in this Venue.");
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
    const offered = session.entryOffers?.find((entry) => entry.zoneId === zone.id);
    const accompanying =
      offered?.accompanies &&
      canOccupyZone(venue, zone, offered.controllerId) &&
      (!venue.access || contactPosition(session, offered.controllerId) === session.zoneId)
        ? [
            ...(session.accompanying ?? []).filter((entry) => entry.characterId !== offered.controllerId),
            { characterId: offered.controllerId, zoneId: zone.id },
          ]
        : session.accompanying;
    const savedInvitation = asRecord(session.operation?.checkpoints["move-invitation"]);
    const recoveredPermission =
      typeof savedInvitation.sourceLineId === "string" &&
      venue.usedInvitationIds?.includes(savedInvitation.sourceLineId) &&
      savedInvitation.zoneId === zone.id &&
      typeof savedInvitation.residentId === "string";
    const routingVenue = recoveredPermission
      ? {
          ...venue,
          playerInvitations: [
            ...(venue.playerInvitations ?? []),
            savedInvitation as NonNullable<VillageVenue["playerInvitations"]>[number],
          ],
        }
      : venue;
    const routingScene = recoveredPermission
      ? {
          ...session,
          grantedZoneIds: [...new Set([...(session.grantedZoneIds ?? []), zone.id])],
          zoneGrants: [
            ...(session.zoneGrants ?? []),
            { zoneId: zone.id, controllerId: String(savedInvitation.residentId) },
          ],
        }
      : session;
    if (
      !contactPath(village, routingVenue, session.zoneId ?? "exterior", zone.id, "player", {
        ...routingScene,
        accompanying,
      })
    )
      throw conflict(
        "There is no permitted connection route to that space; its controller may need to grant an invitation.",
      );
    const people = sceneZoneOccupants({ ...session, accompanying }, village, venue, zone.id);
    if (people.length > 4) throw conflict("Five residents occupy this Zone in the Scene. Choose another Zone.");
    let controllerId = "";
    const priorGrant = session.zoneGrants?.find((grant) => grant.zoneId === zone.id);
    if (session.dismissedZoneIds?.includes(zone.id))
      throw conflict("Permission for this Zone was withdrawn during this Scene. Its controller can invite you again.");
    const revokedGrant =
      priorGrant &&
      (!canInviteToZone(venue, zone, priorGrant.controllerId) ||
        (priorGrant.source === "relationship" &&
          !relationshipZoneController(village.relationshipContext, village, venue, zone, "player")));
    const ongoingController = relationshipZoneController(village.relationshipContext, village, venue, zone, "player");
    if (ongoingController) controllerId = ongoingController;
    if (venue.access) {
      const decision = evaluateZoneAccess(venue, zone, "player", {
        ...sceneAccessContext({ ...session, accompanying }, village),
        accepting: true,
        unavailable: zoneClosed(village, venue, zone),
      });
      if (!decision.allowed) throw conflict(decision.explanation);
      await changeSceneVenues(session, (state) => {
        const captured = state.venues.find((row) => row.id === venue.id)!;
        claimVisitPermission(captured, decision.permissionId, session.id);
      });
      await mutateVillageState((state) => {
        const current = state.venues.find((row) => row.id === venue.id);
        const target = current && resolveVenueZone(current, zone.id);
        if (!current || !target) return;
        const decision = evaluateZoneAccess(current, target, "player", {
          ...sceneAccessContext({ ...session, accompanying }, state),
          accepting: true,
          unavailable: zoneClosed(state, current, target),
        });
        if (!decision.allowed) {
          if (session.continuity) return;
          throw conflict(decision.explanation);
        }
        claimVisitPermission(current, decision.permissionId, session.id);
      });
    } else if (
      !canOccupyZone(venue, zone, "player") &&
      !ongoingController &&
      (!session.grantedZoneIds?.includes(zone.id) || revokedGrant)
    ) {
      const invitation = await venueCheckpoint("move-invitation", async () => {
        const selected = venue.playerInvitations?.find(
          (entry) => entry.zoneId === zone.id && canInviteToZone(venue, zone, entry.residentId),
        );
        if (!selected) throw conflict("This zone needs its controller's invitation.");
        return selected;
      });
      controllerId = invitation.residentId;
      await changeSceneVenues(session, (state) => {
        const captured = state.venues.find((entry) => entry.id === venue.id)!;
        captured.playerInvitations = captured.playerInvitations?.filter(
          (row) => row.sourceLineId !== invitation.sourceLineId,
        );
        captured.usedInvitationIds = [...new Set([...(captured.usedInvitationIds ?? []), invitation.sourceLineId])];
      });
      await mutateVillageState((state) => {
        const current = state.venues.find((entry) => entry.id === venue.id);
        if (!current && session.continuity) return;
        if (!current) throw conflict("This Venue is no longer here.");
        const target = resolveVenueZone(current, zone.id);
        if (!target || zoneClosed(state, current, target) || !canInviteToZone(current, target, invitation.residentId)) {
          if (session.continuity) return;
          throw conflict("This zone's invitation is no longer valid.");
        }
        // The Village receipt closes the crash gap between consuming access and committing the scene.
        if (current.usedInvitationIds?.includes(invitation.sourceLineId)) return;
        const index =
          current.playerInvitations?.findIndex(
            (entry) =>
              entry.zoneId === zone.id &&
              entry.sourceLineId === invitation.sourceLineId &&
              entry.residentId === invitation.residentId,
          ) ?? -1;
        if (index < 0) {
          if (session.continuity) return;
          throw conflict("This zone needs its controller's invitation.");
        }
        const consumed = current.playerInvitations!.splice(index, 1)[0]!;
        current.usedInvitationIds = [...new Set([...(current.usedInvitationIds ?? []), consumed.sourceLineId])];
      });
    }
    const moved = await changeSession(sessionId, (state) => {
      if (
        state.navigationReceipts?.some((entry) => entry.id === operationId) ||
        state.submissions.some((turn) => turn.movement?.operationId === operationId)
      )
        return;
      const originZoneId = state.zoneId ?? legacyZoneId(venue, state.area, state.spaceClass, state.privateOwnerId);
      const at = villageNow().toISOString();
      // Older admitted written turns retain their saved replay contract.
      if (written) {
        const origin = resolveVenueZone(venue, originZoneId);
        const transitionLineId = randomUUID();
        appendLine(state, {
          id: transitionLineId,
          role: "assistant",
          speakerId: "__venue_scene__",
          name: "Narration",
          kind: "narration",
          content: movementTransition(
            origin?.name ?? originZoneId,
            zone.name,
            village.narrationStyle,
            readPlayerIdentity(village).name,
          ),
          at,
          heardBy: [...session.activeIds],
        });
        state.submissions.push({
          id: operationId,
          message: written?.message ?? `Move to ${zone.name}`,
          mode: "chat",
          ...(written?.requestMode ? { requestMode: written.requestMode } : {}),
          targetId: written?.targetId ?? "",
          verdict: null,
          wishId: "",
          wishMemory: "",
          areaAtTurn: state.area,
          zoneIdAtTurn: originZoneId,
          activeIdsAtTurn: [...session.activeIds],
          activeIdsAfterTurn: people.map((person) => person.characterId),
          replyLineIds: [transitionLineId],
          movement: { operationId, originZoneId, destinationZoneId: zone.id, transitionLineId },
          requestMetrics: venueRequestMetrics(),
          at,
        });
      } else {
        state.navigationReceipts ??= [];
        state.navigationReceipts.push({ id: operationId, originZoneId, destinationZoneId: zone.id, at });
      }
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
        if (!state.heardHistory.some((entry) => entry.characterId === person.characterId))
          state.heardHistory.push({ characterId: person.characterId, lineIds: [] });
      }
      state.activeIds = people.map((person) => person.characterId);
      state.privateSpaceId = ["private-residence", "staff", "restricted"].includes(zone.kind) ? zone.id : undefined;
      if (controllerId)
        state.zoneGrants = [
          ...(state.zoneGrants ?? []).filter((grant) => grant.zoneId !== zone.id),
          { zoneId: zone.id, controllerId, source: ongoingController ? "relationship" : undefined },
        ];
      state.legacyCast = false;
      state.spaceClass = zone.venueClass;
      state.area = zoneArea(zone);
      state.privateOwnerId = zone.ownerId ?? "";
      state.grantedZoneIds = [...new Set([...(state.grantedZoneIds ?? []), zone.id])];
      state.lastActivityAt = at;
      state.recap = "";
    });
    await markZoneSeen(moved);
    return refreshZoneParticipants(moved, true);
  }

  async function markZoneSeen(session: VenueScene, generateImage = true): Promise<void> {
    if (session.continuity) {
      await changeSceneVenues(session, (state) => {
        const venue = state.venues.find((entry) => entry.id === session.placeId);
        const zone = venue && resolveVenueZone(venue, session.zoneId ?? "exterior");
        if (venue && zone && contactCanEnter(state, venue, zone.id, "player", session))
          observePrivateInterior(zone, villageNow().toISOString());
      });
    }
    let admitted = false;
    await mutateVillageState((state) => {
      admitted = false;
      const venue = state.venues.find((entry) => entry.id === session.placeId);
      const zone =
        venue &&
        resolveVenueZone(
          venue,
          session.zoneId ?? legacyZoneId(venue, session.area, session.spaceClass, session.privateOwnerId),
        );
      if (
        !venue ||
        !zone ||
        zoneClosed(state, venue, zone) ||
        (venue.access &&
          !evaluateZoneAccess(venue, zone, "player", {
            ...sceneAccessContext(session, state),
            unavailable: zoneClosed(state, venue, zone),
          }).allowed)
      )
        return;
      observePrivateInterior(zone, villageNow().toISOString());
      admitted = true;
    });
    if (!admitted) return;
    if (!generateImage) return;
    const village = sceneContinuityView(await readVillageState(), await readSession(session.id)),
      venue = village.venues.find((entry) => entry.id === session.placeId),
      zone =
        venue &&
        resolveVenueZone(
          venue,
          session.zoneId ?? legacyZoneId(venue, session.area, session.spaceClass, session.privateOwnerId),
        );
    if (zone) {
      let firstEntry = false;
      await changeSession(session.id, (saved) => {
        firstEntry = false;
        firstEntry = claimZonePictureEntry(saved, zone.id);
      });
      if (!firstEntry) return;
      const entryContext = zonePictureContext(village, venue!, zone);
      outsideVenueOperation(() => {
        void loadPrivateSpaceImages()
          .then(({ personalizeZoneOnEntry }) => personalizeZoneOnEntry?.(session.placeId, zone.id, entryContext))
          .catch(() => {});
      });
    }
  }

  function enterVenue(
    placeId: string,
    spaceClass?: VillageVenueClass,
    privateOwnerId = "",
    entryArea?: "outside" | "public" | "shared" | "private",
    requestedZoneId?: string,
    expectedSceneRevision?: number,
  ): Promise<VenueScene> {
    return withSceneActivation(() =>
      enterVenueInActivation(placeId, spaceClass, privateOwnerId, entryArea, requestedZoneId, expectedSceneRevision),
    );
  }

  function enterVenueInActivation(
    placeId: string,
    spaceClass?: VillageVenueClass,
    privateOwnerId = "",
    entryArea?: "outside" | "public" | "shared" | "private",
    requestedZoneId?: string,
    expectedSceneRevision?: number,
  ): Promise<VenueScene> {
    return serializedNavigation(() =>
      enterVenueOnce(placeId, spaceClass, privateOwnerId, entryArea, requestedZoneId, expectedSceneRevision),
    );
  }

  async function enterVenueOnce(
    placeId: string,
    requestedClass?: VillageVenueClass,
    privateOwnerId = "",
    entryArea?: VenueScene["area"],
    requestedZoneId?: string,
    expectedSceneRevision?: number,
  ): Promise<VenueScene> {
    const pointer = await readActive();
    if (pointer.sessionId && hasVenueOperation(pointer.sessionId))
      throw venueRefusal("SCENE_BUSY", "Wait for the scene reply before entering another Zone.");
    const existing = await activeVenueSession();
    if (!existing) await rollActiveAgendas(villageNow());
    const live = await readVillageState();
    const village = existing ? sceneContinuityView(live, existing) : live,
      place = village.venues.find((entry) => entry.id === placeId);
    if (!place) throw notFound("That place is not in this village.");
    if (!existing && village.opening?.stage === "gathering" && placeId !== village.opening.communityVenueId)
      throw conflict("Begin at the Community gathering, or skip the opening in Projects.");
    const classes = venueClasses(place),
      spaceClass = requestedClass ?? classes.find((entry) => entry !== "residence") ?? classes[0]!;
    if (!classes.includes(spaceClass) && !requestedZoneId) throw badRequest("That Venue has no such space.");
    const requested =
      requestedZoneId ??
      legacyZoneId(place, entryArea ?? (spaceClass === "residence" ? "shared" : "public"), spaceClass, privateOwnerId);
    let zone = resolveVenueZone(place, requested);
    if (!zone && !requestedZoneId && !entryArea && place.layoutVersion === 1)
      zone = resolveVenueZone(place, "exterior");
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
              state.opening.stage = "conversations";
          });
          return prior;
        }
        await mutateDocument(ACTIVE_ID, activeSlot, (active) => {
          if (active.sessionId && active.sessionId !== id) throw conflict("Finish the active Scene first.");
          active.sessionId = id;
          active.placeId = placeId;
        });
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
    const entryAccessContext = {
      sceneId: id,
      at: new Date(sceneAttendance.capturedAt),
      positions: Object.fromEntries(sceneAttendance.occupants.map((person) => [person.characterId, person.zoneId])),
      accepting: true,
    };
    let initialPermissionId: string | undefined;
    const grantedZoneIds: string[] = [];
    const zoneGrants: { zoneId: string; controllerId: string; source?: "relationship" }[] = [];
    const ongoingController = relationshipZoneController(village.relationshipContext, village, place, zone, "player");
    if (ongoingController) {
      grantedZoneIds.push(zone.id);
      zoneGrants.push({ zoneId: zone.id, controllerId: ongoingController, source: "relationship" });
    }
    if (place.access) {
      const decision = evaluateZoneAccess(place, zone, "player", {
        ...entryAccessContext,
        relationships: village.relationshipContext,
      });
      if (!decision.allowed) {
        if (requestedZoneId || entryArea) throw conflict(decision.explanation);
        zone = resolveVenueZone(place, "exterior")!;
      } else
        await mutateVillageState((state) => {
          const current = state.venues.find((row) => row.id === place.id)!;
          const target = resolveVenueZone(current, zone!.id)!;
          const checked = evaluateZoneAccess(current, target, "player", {
            ...entryAccessContext,
            relationships: state.relationshipContext,
            unavailable: zoneClosed(state, current, target),
          });
          if (!checked.allowed) throw conflict(checked.explanation);
          initialPermissionId = checked.permissionId;
        });
    } else if (!canOccupyZone(place, zone, "player") && !ongoingController) {
      const target = zone;
      const invitation = place.playerInvitations?.find(
        (entry) => entry.zoneId === target.id && canInviteToZone(place, target, entry.residentId),
      );
      if (!invitation) {
        if (requestedZoneId || entryArea) throw conflict("This zone needs its controller's invitation.");
        zone = resolveVenueZone(place, "exterior")!;
      } else {
        await mutateVillageState((state) => {
          const current = state.venues.find((entry) => entry.id === placeId)!;
          const index =
            current.playerInvitations?.findIndex(
              (entry) =>
                entry.zoneId === target.id &&
                entry.sourceLineId === invitation.sourceLineId &&
                entry.residentId === invitation.residentId &&
                canInviteToZone(current, resolveVenueZone(current, target.id)!, entry.residentId),
            ) ?? -1;
          if (index < 0) throw conflict("That invitation has already been used.");
          const consumed = current.playerInvitations!.splice(index, 1)[0]!;
          current.usedInvitationIds = [...new Set([...(current.usedInvitationIds ?? []), consumed.sourceLineId])];
        });
        grantedZoneIds.push(target.id);
        zoneGrants.push({ zoneId: target.id, controllerId: invitation.residentId });
      }
    }
    const participants = sceneAttendance.occupants
      .filter((person) => person.zoneId === zone.id)
      .map(({ characterId, name, doing }) => ({ characterId, name, doing }));
    if (participants.length > 4)
      throw conflict("Five residents occupy this Zone. Edit their agendas before starting a Scene.");
    const introduction =
      village.opening?.version === 2 && village.opening.stage === "conversations"
        ? village.opening.residentIds.find((residentId) => {
            const meeting = openingPresence(village, residentId);
            return meeting?.venueId === placeId && meeting.zoneId === zone.id;
          })
        : undefined;
    if (introduction && (participants.length !== 1 || participants[0].characterId !== introduction))
      throw conflict("This conversation is not available alone here. Try later or skip the opening.");
    const session: VenueScene = {
      openingReader: gathering && village.opening!.version === 2 ? true : undefined,
      openingIntroductionResidentId: introduction,
      openingGatheringId: gathering ? village.opening!.id : undefined,
      pendingAccessClaim: initialPermissionId,
      version: 1,
      sceneRevision: 0,
      processingVersion: 1,
      semanticVersion: 2,
      villageSeed: village.seed,
      stagingVersion: 1,
      id,
      placeId,
      placeName: place.name,
      zoneId: zone.id,
      grantedZoneIds,
      zoneGrants,
      privateSpaceId: ["private-residence", "staff", "restricted"].includes(zone.kind) ? zone.id : undefined,
      accompanying: [],
      departedIds: [],
      spaceClass: zone.venueClass,
      area: zoneArea(zone),
      privateOwnerId: zone.ownerId ?? "",
      privateAccessOwnerId: "",
      startedAt: sceneAttendance.capturedAt,
      endedAt: "",
      lastActivityAt: villageNow().toISOString(),
      clockShiftMs: villageClockShiftMs(),
      endReason: "",
      memoryMode: "live",
      status: participants.length === 0 ? "active" : "opening",
      participants,
      sceneAttendance,
      activeIds: participants.map((person) => person.characterId),
      lines: [],
      heardHistory: participants.map((person) => ({ characterId: person.characterId, lineIds: [] })),
      submissions: [],
      memories: null,
      recap: "",
    };
    await mutateDocument(`${SESSION_PREFIX}${id}`, sessionSlot, (value) => {
      if (gathering && value.id) return;
      Object.assign(value, session);
    });
    await mutateDocument(ACTIVE_ID, activeSlot, (active) => {
      if (active.sessionId) throw conflict("Finish the active Scene first.");
      active.sessionId = id;
      active.placeId = placeId;
    });
    const settled = await refreshZoneParticipants(session);
    await markZoneSeen(settled);
    return settled;
  }

  async function enterResidencePrivateSpace(
    sessionId: string,
    ownerId: string,
    expectedSceneRevision?: number,
  ): Promise<VenueScene> {
    return withSceneActivation(() => enterResidencePrivateSpaceInActivation(sessionId, ownerId, expectedSceneRevision));
  }

  async function enterResidencePrivateSpaceInActivation(
    sessionId: string,
    ownerId: string,
    expectedSceneRevision?: number,
  ): Promise<VenueScene> {
    const session = await readSession(sessionId);
    const village = await readVillageState();
    const venue = village.venues.find((venue) => venue.id === session.placeId);
    if (!venue) throw conflict("That Residence is no longer here.");
    return moveVenueZone(sessionId, legacyZoneId(venue, "private", "residence", ownerId), expectedSceneRevision);
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
        signal.throwIfAborted();
        const writingInput =
          admission.operation?.id === "greeting"
            ? admission.operation.input
            : {
                writingContractVersion: 3,
                castLimitVersion: 1,
                playerAgencyVersion: 1,
                ...(admission.semanticVersion === 2
                  ? { semanticBudget: SEMANTIC_OPERATION_BUDGET, semanticPipelineVersion: 3, residentActionsVersion: 2 }
                  : {}),
                writingCapabilities: sceneWritingCapabilities(await readVillageState(), admission),
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
      if (session.openingReader && reply.openingContext?.gatheringComplete !== true)
        throw conflict("Finish the gathering before continuing.");
      if (
        session.openingReader &&
        !session.activeIds.every((residentId) =>
          reply.lines.some((line) => line.speakerId === residentId && line.kind === "dialogue" && line.content.trim()),
        )
      )
        throw conflict("The gathering is incomplete. Retry the opening.");
      if (session.openingIntroductionResidentId && reply.openingSignal?.kind !== "pitch")
        throw conflict("The introduction is incomplete. Retry or leave and return.");
      return reply;
    });
    signal.throwIfAborted();
    const greetingVillage = await readVillageState();
    if (
      session.openingReader &&
      !session.activeIds.every((residentId) =>
        reply.lines.some((line) => line.speakerId === residentId && line.kind === "dialogue" && line.content.trim()),
      )
    )
      throw conflict("The gathering is incomplete. Retry the opening.");
    if (session.openingIntroductionResidentId && reply.openingSignal?.kind !== "pitch")
      throw conflict("The introduction is incomplete. Retry or leave and return.");
    validateCurrentRoomInvitation(reply, greetingVillage);
    const greeted = await changeSession(id, (state) => {
      signal.throwIfAborted();
      if (state.status !== "opening") return;
      const at = villageNow().toISOString();
      const savedLineIds = appendVenueReply(state, reply.lines, at);
      {
        const wishes = bindWishProposals(
          reply.wishChanges,
          greetingVillage,
          state.lines,
          "",
          savedLineIds,
          reply.wishContexts,
          state.semanticVersion === 2,
        );
        state.submissions.push({
          id: "greeting",
          openingContext: reply.openingContext,
          openingSignal: reply.openingSignal,
          zoneIdAtTurn: state.zoneId,
          mode: "chat",
          message: "",
          targetId: "",
          at,
          verdict: null,
          wishId: "",
          wishMemory: "",
          activeIdsAtTurn: [...state.activeIds],
          replyLineIds: savedLineIds,
          wishProposals: wishes.proposals,
          wishProposalError: wishes.error,
          wishContexts: reply.wishContexts,
          semanticProvenance: reply.semanticProvenance,
          physicalContext: reply.physicalContext,
          ...(reply.sceneChange
            ? {
                sceneChange: reply.sceneChange,
                physicalOutcomeVersion: 1 as const,
                action: { happened: true, ...reply.sceneChange },
                areaAtTurn: state.area,
                zoneIdAtTurn: state.zoneId,
                privateOwnerIdAtTurn: state.privateOwnerId,
              }
            : {}),
          liveProposals: bindLiveProposals(reply, "", savedLineIds),
          effectFailures: reply.effectFailures,
          ...(asRecord(reply).projectOfferReview
            ? {
                interpretationHistory: [
                  {
                    at,
                    domain: "projects" as const,
                    source: "System offer availability review",
                    proposals: asRecord(reply).projectOfferReview,
                  },
                ],
              }
            : {}),
          speechCapture: reply.speechCapture,
          accessEvents: savedAccessEvents(reply.roomInterpretation),
          ...(reply.residentActionReceipt ? { residentActionReceipt: reply.residentActionReceipt } : {}),
          ...(state.semanticVersion === 2
            ? {
                projectContexts: reply.projectContexts,
                projectSpeech: reply.projectSpeech,
                projectInterpretationVersion: 1 as const,
                invitationSignal: reply.invitationSignal ?? undefined,
                editApprovalSignal: reply.editApprovalSignal ?? undefined,
                residenceSignal: reply.residenceSignal ?? undefined,
                upgradeSignal: reply.upgradeSignal ?? undefined,
                venueRequestSignal: reply.venueRequestSignal ?? undefined,
              }
            : {}),
          requestMetrics: venueRequestMetrics(),
        });
      }
      if (reply.invitationSignal)
        reply.invitationSignal.sourceLineId =
          savedLineIds[
            reply.lines.findIndex(
              (line) =>
                (reply.invitationSignal?.evidenceKind === "action"
                  ? line.kind === "narration"
                  : line.speakerId === reply.invitationSignal?.residentId) &&
                line.content.includes(reply.invitationSignal!.quote),
            )
          ];
      if (state.semanticVersion === 2) {
        const greeting = state.submissions.find((row) => row.id === "greeting")!;
        if (greeting.invitationSignal) greeting.invitationSignal.sourceLineId = reply.invitationSignal?.sourceLineId;
        const sourceLineId = (actor: string, quote: string) =>
          savedLineIds[reply.lines.findIndex((line) => line.speakerId === actor && line.content.includes(quote))];
        if (greeting.venueRequestSignal)
          greeting.venueRequestSignal.sourceLineId = sourceLineId(
            greeting.venueRequestSignal.characterId,
            greeting.venueRequestSignal.quote,
          );
        if (greeting.editApprovalSignal)
          greeting.editApprovalSignal.sourceLineId = sourceLineId(
            greeting.editApprovalSignal.residentId,
            greeting.editApprovalSignal.quote,
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
      }
      if (reply.invitationSignal?.venueId === state.placeId && reply.invitationSignal.timing === "now") {
        applyImmediateZoneInvitation(state, reply.invitationSignal);
      }
      applyInterpretedRoomEvents(state, reply.roomInterpretation, greetingVillage);
      state.status = "active";
    });
    if (reply.semanticProvenance?.version === 2) {
      const greeting = greeted.submissions.find((row) => row.id === "greeting");
      if (greeting) await applySavedAccessEvents(greeted, greeting);
    }
    if (reply.roomInterpretation) {
      await finalizeRoomInvitationDiagnostics(greeted, reply.roomInterpretation, reply.invitationSignal);
      await writeInterpretationDiagnostics(id, reply.roomInterpretation.traces).catch(() => {});
    }
    if (reply.invitationSignal) await recordSpokenInvitation(greeted, reply.invitationSignal);
    if (reply.editApprovalSignal) {
      const approval = reply.editApprovalSignal;
      const quote = approval.quote.replace(/\s+/gu, " ").toLowerCase();
      if (
        greeted.lines.some(
          (line) =>
            line.speakerId === approval.residentId && line.content.replace(/\s+/gu, " ").toLowerCase().includes(quote),
        )
      )
        await applyResidenceEditApproval(greeted.placeId, approval.proposalId, approval.residentId, approval.approved);
    }
    await markZoneSeen(greeted, false);
    await processSavedExchange(id, "greeting");
    const turn = (await readSession(id)).submissions.find((row) => row.id === "greeting");
    if (turn) {
      if (turn.semanticProvenance?.version === 2) await applyVenueRequests(greeted, turn);
      await settleSemanticAuthority(greeted, turn);
    }
    return refreshZoneParticipants(await readSession(id), true);
  }

  async function continueVenueWithoutGreeting(id: string): Promise<VenueScene> {
    return withSceneActivation(() => continueVenueWithoutGreetingInActivation(id));
  }

  async function continueVenueWithoutGreetingInActivation(id: string): Promise<VenueScene> {
    const pending = await readSession(id);
    if ((pending.openingReader || pending.openingIntroductionResidentId) && openingActive(await readVillageState()))
      throw conflict("Retry this introduction or skip the opening first.");
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

  /** Paid stages are checkpointed; walking any permitted route does not spend one call per door. */
  async function contactReply(scene: VenueScene, intent: ContactIntent): Promise<SceneReply> {
    const reply = await prepareContactReply(scene, intent);
    if (intent.attention) return reply;
    const village = await readVillageState();
    const evidence = reply.lines
      .filter(
        (line) =>
          !line.contactReport &&
          (!line.contactHidden ||
            (line.speakerId === reply.contactRelay?.targetId &&
              line.kind !== "narration" &&
              reply.lines.some((report) => report.contactReport && report.content.includes(line.content)))),
      )
      .map((line) => ({ ...line, contactHidden: false }));
    const speakers = [...new Set(evidence.filter((line) => line.kind !== "narration").map((line) => line.speakerId))];
    const context: VenueScene = {
      ...scene,
      activeIds: [...new Set([...scene.activeIds, ...speakers])],
      participants: [
        ...scene.participants,
        ...speakers
          .filter((id) => !scene.participants.some((person) => person.characterId === id))
          .map((id) => ({
            characterId: id,
            name: village.villagers.find((person) => person.characterId === id)?.cardSnapshot.name ?? id,
            doing: "Answering contact",
          })),
      ],
      contactGeneration: {
        localIds: scene.activeIds,
        remoteIds: speakers.filter((id) => !scene.activeIds.includes(id)),
        instruction: "Only delivered speech is witnessed; unseen gestures do not establish permission.",
      },
    };
    return interpretRoomDraft(
      context,
      village,
      intent.quote,
      {
        ...reply,
        heardPlayerBy: [
          ...new Set([...reply.heardPlayerBy, ...(reply.contactRelay ? [reply.contactRelay.targetId] : [])]),
        ],
      },
      true,
      evidence,
    );
  }

  async function prepareContactReply(scene: VenueScene, intent: ContactIntent): Promise<SceneReply> {
    const village = await readVillageState(),
      venue = village.venues.map((entry) => sceneLayoutVenue(entry, scene)).find((entry) => entry.id === scene.placeId);
    if (!venue) throw notFound("That Venue is no longer available.");
    const origin = scene.zoneId ?? "exterior",
      neighbors = contactNeighbors(venue, origin);
    if (intent.targetId && !village.villagers.some((entry) => entry.characterId === intent.targetId))
      throw badRequest("Choose a villager who still lives in the village.");
    const acoustics = intent.attention?.validation?.version === 3;
    if (
      !acoustics &&
      ((explicitSceneActions() && !intent.attention && !intent.boundaryZoneId) ||
        (intent.boundaryZoneId && !neighbors.includes(intent.boundaryZoneId)))
    )
      throw badRequest("Choose a doorway adjacent to your current Zone.");
    if (
      !acoustics &&
      intent.attention?.fragments.some((fragment) => fragment.zoneIds.some((id) => !neighbors.includes(id)))
    )
      throw conflict("The adjacent destinations changed. Your draft is preserved; send it again.");
    const established = scene.doorwayContacts?.find(
      (entry) =>
        entry.characterId === intent.targetId &&
        entry.playerZoneId === origin &&
        contactPosition(scene, entry.characterId) === entry.characterZoneId,
    );
    const delivery = intent.delivery ?? established?.delivery ?? "voice";
    const deviceFeatureId = intent.deviceFeatureId ?? established?.deviceFeatureId ?? "";
    if (delivery === "device" && !contactDevice(venue, origin, deviceFeatureId))
      throw badRequest("That communication device is not an established feature in your current Zone.");
    let boundary = intent.boundaryZoneId || (delivery === "voice" ? established?.characterZoneId : "") || "";
    if (!boundary && neighbors.length === 1) boundary = neighbors[0]!;
    if (!boundary && intent.targetId) {
      const targetZone = contactPosition(scene, intent.targetId);
      const route = contactPath(village, venue, origin, targetZone, intent.targetId, scene);
      boundary = route?.[1] ?? "";
    }
    if (intent.kind === "knock" && delivery === "voice" && !boundary && neighbors.length > 1)
      return quietContactReply("Choose which doorway to knock or call through using Knock / Call.", scene.activeIds);
    const reachable = intent.attention
      ? [...new Set(intent.attention.fragments.flatMap((fragment) => fragment.zoneIds))]
      : contactReach(
          village,
          venue,
          origin,
          delivery,
          explicitSceneActions() || intent.kind === "knock" ? boundary : "",
          explicitSceneActions(),
        );
    const remote = (scene.sceneAttendance?.occupants ?? []).filter((person) => {
      const position = contactPosition(scene, person.characterId);
      const zone = resolveVenueZone(venue, position);
      return (
        position !== origin &&
        (acoustics || reachable.includes(position)) &&
        !!zone &&
        (acoustics || !zoneClosed(village, venue, zone))
      );
    });
    runtimeDebug("contact routing", {
      sceneId: scene.id,
      origin,
      delivery,
      intendedRecipient: intent.targetId,
      physicalIds: scene.activeIds,
      possibleListeners: remote.map((person) => ({
        characterId: person.characterId,
        zoneId: contactPosition(scene, person.characterId),
        activity: person.doing,
      })),
    });
    if (!intent.attention && !remote.length && !scene.activeIds.length)
      return quietContactReply("No answer.", scene.activeIds);
    const audience = [...new Set([...scene.activeIds, ...remote.map((person) => person.characterId)])];
    const cast = [
      ...scene.participants,
      ...remote.filter((person) => !scene.participants.some((old) => old.characterId === person.characterId)),
    ];
    const destinations = audience.map((id) => ({
      characterId: id,
      mayComeToPlayer: !!contactPath(village, venue, contactPosition(scene, id), origin, id, scene),
      permittedDestinations: venueZones(venue)
        .filter((zone) => {
          const path = contactPath(village, venue, contactPosition(scene, id), zone.id, id, scene);
          return !!path && path.length > 1;
        })
        .map((zone) => zone.id),
    }));
    const context: VenueScene = {
      ...scene,
      participants: cast,
      recap: "",
      lines: scene.lines,
      contactGeneration: {
        delivery,
        ...(acoustics ? { acoustics: true, venue } : {}),
        ...(intent.attention ? { attention: intent.attention } : {}),
        ...(intent.attention
          ? {
              replyAudiences: Object.fromEntries(
                audience.map((speaker) => {
                  const from = scene.activeIds.includes(speaker) ? origin : contactPosition(scene, speaker);
                  const adjacent = contactNeighbors(venue, from);
                  return [
                    speaker,
                    audience.filter((listener) => {
                      const to = scene.activeIds.includes(listener) ? origin : contactPosition(scene, listener);
                      return from === to || adjacent.includes(to);
                    }),
                  ];
                }),
              ),
            }
          : {}),
        localIds: scene.activeIds,
        remoteIds: remote.map((person) => person.characterId),
        instruction: `CONTACT RESPONSE. This overrides generic instructions that all active IDs are in the same Zone.
The player remains in ${origin}. Local people: ${scene.activeIds.join(", ")}. Possible remote listeners: ${remote.map((person) => person.characterId).join(", ")}.
Delivery: ${delivery}. Possible listeners are NOT actual witnesses. Select heardPlayerBy and each line's heardBy only for residents who plausibly hear it, possibly only some of them. A farther loud voice can be muffled or fail to reach someone; a sleeping or absorbed resident may never notice. Do not force every occupant of a Zone to hear.
They hear the current message and ONLY earlier exchanges in their individual witnessed histories. Intended addressee: ${intent.targetId || "the ongoing conversational audience"}. Addressing is not isolation; audible bystanders may react voluntarily.
Residents retain agency and may ignore, decline, be busy, misunderstand, relay, or not hear. An acknowledgement may wake someone; witnessed developments outrank their Scene-start activity. Silence must reveal no hidden reason or attendance. Never disclose unseen descriptions, objects or other occupants. Until a validated movement completes, a remote speaker stays in their Zone and has no on-stage sprite. Remote voice replies must use an audible delivery consistent with the established channel, not an inaudible whisper. Narration describes only what the player can observe; never narrate an unseen listener hearing, waking, or being busy unless they reveal it in audible speech.
For a completed voluntary movement use the Resident movement contract below, citing its exact narration segment. Permitted arrivals: ${JSON.stringify(destinations)}. Maximum local cast is four. Position changes do not grant player entry.
${explicitSceneActions() ? "Contact attempts reach only the selected adjacent Zone. Optional words describe knocking, calling or speaking; do not assume a door exists without established context. An offer to fetch someone remains dialogue only: do not perform a farther-Zone exchange, invent their answer, or return contactRelay. The player never moves during Contact." : 'If a local or doorway responder willingly offers to fetch the addressed person, return contactRelay:{speakerId,targetId,quote:"exact unconditional spoken offer"}. Do not invent the target\'s response or whereabouts. The server checks a permitted route with no hop cutoff. The messenger may approach a private doorway without entering it. Do not narrate the journey as completed yet.'}
For an explicit end to doorway conversation return contactEnd:[{speakerId,quote:"exact spoken goodbye"}], never sceneEnded or departures for that goodbye. Invitations grant permission only; do not narrate the player entering. Do not propose physical handoffs or lasting room changes.`,
      },
    };
    if (intent.attention)
      context.contactGeneration!.instruction += `\nNATURAL ATTENTION overrides the full-message hearing and physical-action restrictions above.
The full player input is available ONLY to the local physical cast. Remote listeners may perceive only emitted fragments, never private words, causes or unseen activity. Resolve attempted sounds within this one response; attempts can fail silently. Ordinary local actions retain their normal validation and only physically present people can exchange objects.
Fragments: ${JSON.stringify(intent.attention.fragments.map((fragment) => ({ ...fragment, source: intent.quote.slice(fragment.start, fragment.end), possibleListeners: remote.filter((person) => fragment.zoneIds.includes(contactPosition(scene, person.characterId))).map((person) => person.characterId) })))}.
Return attentionWitnesses:[{id:"attention:0",emitted:true|false,heardBy:[],segment:0}]. Return one row for every fragment. segment cites a visible narration segment establishing an emitted SOUND; an attempted/failed sound is not an emitted sound. Speech needs no segment. Choose actual witnesses among each fragment's possible listeners and local IDs. Unemitted fragments have no witnesses or reactions. heardPlayerBy refers ONLY to local witnesses of the complete input. Remote speech must be justified by a fragment they heard.
Current audible fragments may support memoryChanges, relationshipChanges, wishChanges or recollections using evidence references "attention:0" etc. "player" always refers to the complete local-only input. Remote listeners never witness visible-only narration. Silence must not reveal attendance or its cause. Return no contactRelay or player movement.`;
    if (acoustics) context.contactGeneration!.instruction = acousticInstructions(scene, intent, venue);
    const reply = await venueCheckpoint(intent.attention ? "turn-reply" : "contact-response", () =>
      intent.attention
        ? generate(context, intent.quote, "chat", intent.targetId, null, venueOperationSignal())
        : generateContactResponse(context, intent.quote, intent.targetId),
    );
    // If no one acknowledges, reveal neither listeners nor the reason for silence.
    if (!intent.attention && !reply.lines.some((line) => line.kind !== "narration") && !scene.activeIds.length)
      return { ...quietContactReply("No answer.", scene.activeIds), heardPlayerBy: reply.heardPlayerBy };
    const afterMoves: VenueScene = {
      ...scene,
      activeIds: [
        ...new Set([
          ...scene.activeIds,
          ...reply.contactMoves.filter((move) => move.zoneId === origin).map((move) => move.characterId),
        ]),
      ].filter((id) => !reply.contactMoves.some((move) => move.characterId === id && move.zoneId !== origin)),
      accompanying: [
        ...(scene.accompanying ?? []).filter(
          (entry) => !reply.contactMoves.some((move) => move.characterId === entry.characterId),
        ),
        ...reply.contactMoves.map((move) => ({ characterId: move.characterId, zoneId: move.zoneId })),
      ],
    };
    const relay = explicitSceneActions()
      ? null
      : readContactRelay(reply.contactRelay, reply.lines, village, venue, afterMoves, audience);
    reply.contactRelay = relay;
    if (!relay || (intent.targetId && relay.targetId !== intent.targetId)) return reply;
    const target = scene.sceneAttendance?.occupants.find((entry) => entry.characterId === relay.targetId);
    const messenger = cast.find((entry) => entry.characterId === relay.speakerId);
    if (!target || !messenger) return reply;
    const approach = relay.path.at(-1)!;
    const relayContext: VenueScene = {
      ...afterMoves,
      participants: [messenger, target],
      recap: "",
      accompanying: [
        ...(afterMoves.accompanying ?? []).filter((entry) => entry.characterId !== relay.speakerId),
        { characterId: relay.speakerId, zoneId: approach },
      ],
      lines: scene.lines.filter(
        (line) => line.heardBy.includes(relay.speakerId) && line.heardBy.includes(relay.targetId),
      ),
      contactGeneration: {
        localIds: [relay.speakerId],
        remoteIds: [relay.targetId],
        instruction: `RELAY RESPONSE. The messenger ${relay.speakerId} has willingly travelled a validated permitted route and is now at ${approach}, addressing ${relay.targetId} across their doorway.
The target hears only the messenger's cited request. They do not hear earlier player-Zone dialogue. Produce only the target's response intended to be conveyed back to the player. Do not describe unseen private spaces, bystanders, or private activities. They may decline, send a message, invite the player, or willingly come to meet them.
The player stays at ${origin}; permission does not move the player. A completed journey by the target to meet them must use the Resident movement contract below with a cited narration segment, only when a route is permitted: ${!!contactPath(village, venue, contactPosition(scene, relay.targetId), origin, relay.targetId, scene)}.
Keep dialogue attributed to the target. The server conveys it through the messenger after their return. Do not create another relay, physical handoff, lasting change, or automatic player entry.`,
      },
    };
    const conveyed = await venueCheckpoint("contact-relay-response", () =>
      generateContactResponse(
        relayContext,
        `The player calls: ${intent.quote}\n${messenger.name} relays that request.`,
        relay.targetId,
      ),
    );
    const spoken = conveyed.lines.filter((line) => line.speakerId === relay.targetId && line.kind !== "narration");
    const hidden = conveyed.lines.map((line) => ({
      ...line,
      contactHidden: true,
      heardBy: [relay.speakerId, relay.targetId],
    }));
    const reports: VenueReplyLine[] = spoken.length
      ? spoken.map((line) => ({
          kind: "dialogue",
          speakerId: relay.speakerId,
          content: `${target.name} says: “${line.content}”`,
          contactReport: true,
          heardBy: [...afterMoves.activeIds, relay.speakerId],
          viaDoorway: !afterMoves.activeIds.includes(relay.speakerId),
        }))
      : [
          {
            kind: "dialogue",
            speakerId: relay.speakerId,
            content: "I couldn't get an answer.",
            heardBy: [...afterMoves.activeIds, relay.speakerId],
            viaDoorway: !afterMoves.activeIds.includes(relay.speakerId),
          },
        ];
    return {
      ...reply,
      lines: [
        ...reply.lines,
        {
          kind: "dialogue",
          speakerId: relay.speakerId,
          content: intent.quote,
          heardBy: [relay.speakerId, relay.targetId],
          contactHidden: true,
        },
        ...hidden,
        ...reports,
        ...conveyed.contactMoves.map((move) => ({
          kind: "narration" as const,
          speakerId: "__venue_scene__",
          content: `${target.name} comes to meet you in this Zone.`,
          heardBy: [...afterMoves.activeIds, move.characterId],
        })),
      ],
      contactMoves: [...reply.contactMoves, ...conveyed.contactMoves],
      invitationSignal: conveyed.invitationSignal ?? reply.invitationSignal,
      // Only witnessed direct speech qualifies as Project speech; a messenger's quote is not target approval.
      recollections: reply.recollections,
      ...mergeLiveReplyProposals(reply, conveyed, reply.lines.length + 1),
    };
  }

  type VenueTurnInput = {
    sessionId: string;
    message: string;
    mode: "chat" | "ask" | "fulfill" | "act" | "leave" | "contact";
    contact?: ContactIntent;
    targetId: string;
    submissionId: string;
    expectedSceneRevision?: number;
    retryOfAttemptId?: string;
    replaceOfOperationId?: string;
    attentionChoice?: { id: string; zoneId: string };
  };

  function matchesSavedTurnMode(turn: VenueSubmission, mode: VenueTurnInput["mode"]) {
    return (turn.requestMode ?? turn.mode) === mode;
  }

  async function venueTurnPayload(scene: VenueScene, input: VenueTurnInput, prior: VenueSubmission | undefined) {
    const admittedVersion =
      scene.operation?.id === input.submissionId ? scene.operation.input.interactionScopeVersion : 6;
    if (
      scene.operation?.id === input.submissionId &&
      admittedVersion === undefined &&
      (input.mode === "act" || input.mode === "fulfill")
    )
      throw venueRefusal(
        "SUBMISSION_MISMATCH",
        "This old action admission cannot be resubmitted as a current action. Its saved history is preserved.",
      );
    const writingVersion =
      scene.operation?.id === input.submissionId ? scene.operation.input.writingContractVersion : prior ? undefined : 3;
    const writingCapabilities = [2, 3].includes(Number(writingVersion))
      ? scene.operation?.id === input.submissionId
        ? scene.operation.input.writingCapabilities
        : sceneWritingCapabilities(await readVillageState(), scene)
      : undefined;
    const payload = {
      ...(scene.operation?.id === input.submissionId
        ? scene.operation.input.castLimitVersion === 1
          ? { castLimitVersion: 1 }
          : {}
        : prior
          ? {}
          : { castLimitVersion: 1 }),
      ...(scene.operation?.id === input.submissionId
        ? scene.operation.input.turnPolicyVersion === 1
          ? { turnPolicyVersion: 1 }
          : {}
        : prior
          ? {}
          : { turnPolicyVersion: 1 }),
      ...(scene.operation?.id === input.submissionId
        ? [1, 2].includes(Number(scene.operation.input.residentActionsVersion))
          ? { residentActionsVersion: scene.operation.input.residentActionsVersion }
          : {}
        : prior
          ? [1, 2].includes(Number(prior.semanticProvenance?.residentActionsVersion))
            ? { residentActionsVersion: prior.semanticProvenance?.residentActionsVersion }
            : {}
          : scene.semanticVersion === 2
            ? { residentActionsVersion: 2 }
            : {}),
      ...(scene.semanticVersion === 2
        ? scene.operation?.id === input.submissionId
          ? scene.operation.input.semanticPipelineVersion
            ? { semanticPipelineVersion: scene.operation.input.semanticPipelineVersion }
            : {}
          : prior
            ? prior.semanticProvenance?.pipelineVersion === 3
              ? { semanticPipelineVersion: 3 }
              : {}
            : { semanticPipelineVersion: 3 }
        : {}),
      ...(scene.semanticVersion === 2
        ? {
            semanticBudget:
              scene.operation?.id === input.submissionId
                ? (scene.operation.input.semanticBudget ?? SEMANTIC_OPERATION_BUDGET)
                : SEMANTIC_OPERATION_BUDGET,
          }
        : {}),
      ...(scene.operation?.id === input.submissionId
        ? scene.operation.input.playerAgencyVersion === 1
          ? { playerAgencyVersion: 1 }
          : {}
        : prior
          ? {}
          : { playerAgencyVersion: 1 }),
      message: input.message,
      mode: input.mode,
      targetId: input.targetId,
      ...(input.contact ? { contact: input.contact } : {}),
      ...(input.attentionChoice ? { attentionChoice: input.attentionChoice } : {}),
      ...(admittedVersion !== undefined ? { interactionScopeVersion: admittedVersion } : {}),
      ...(writingVersion !== undefined
        ? {
            writingContractVersion: writingVersion,
            ...([2, 3].includes(Number(writingVersion)) ? { writingCapabilities } : {}),
          }
        : {}),
    };
    return payload;
  }

  async function sendVenueTurn(input: VenueTurnInput) {
    if ((await readSession(input.sessionId)).openingReader)
      throw conflict("Continue from the gathering or skip the opening first.");
    const scene = await readSession(input.sessionId);
    const prior = scene.submissions.find((entry) => entry.id === input.submissionId);
    if (prior) runtimeDebug("submission replay", { sceneId: input.sessionId, submissionId: input.submissionId });
    if (!prior) await requireLiveVenueSession(input.sessionId);
    const payload = await venueTurnPayload(scene, input, prior);
    if (prior && JSON.stringify(prior.contact ?? null) !== JSON.stringify(input.contact ?? null))
      throw venueRefusal("SUBMISSION_MISMATCH", "That submission ID belongs to a different contact attempt.");
    if (
      prior &&
      (prior.message !== input.message || !matchesSavedTurnMode(prior, input.mode) || prior.targetId !== input.targetId)
    )
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
    const prior = scene.submissions.find((entry) => entry.id === submissionId);
    if (!prior) await requireLiveVenueSession(sessionId);
    const currentContract =
      scene.operation?.id === submissionId ? scene.operation.input.writingContractVersion === 3 : !prior;
    if (currentContract && !prior && !(await readVillageState()).venues.some((venue) => venue.id === scene.placeId))
      throw conflict("This Venue is no longer available. End the Scene.");
    const payload = currentContract
      ? await venueTurnPayload(scene, { sessionId, submissionId, message, mode: "leave", targetId: "" }, prior)
      : {
          message,
          mode: "leave",
          targetId: "",
          ...(scene.semanticVersion === 2
            ? {
                semanticBudget:
                  scene.operation?.id === submissionId
                    ? (scene.operation.input.semanticBudget ?? SEMANTIC_OPERATION_BUDGET)
                    : SEMANTIC_OPERATION_BUDGET,
              }
            : {}),
        };
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
    if (sceneWork().isMoving(input.sessionId)) throw conflict("Wait for zone navigation to finish before sending.");
    let session = await readSession(input.sessionId);
    const compatibilityWishCheck = input.mode === "fulfill";
    const requestMode = input.mode === "act" || input.mode === "fulfill" ? input.mode : undefined;
    const prior = session.submissions.find((entry) => entry.id === input.submissionId);
    if (!prior && session.semanticVersion === 2) {
      await finishSemanticScene(session.id);
      session = await readSession(session.id);
      if (session.status === "closed") throw conflict("This Scene has concluded.");
    }
    if (prior) {
      if (
        prior.message !== input.message ||
        !matchesSavedTurnMode(prior, input.mode) ||
        prior.targetId !== input.targetId
      )
        throw conflict("That submission ID belongs to a different line.");
      if (prior.movement) return { session, verdict: null, action: null, recordEvents: [] };
      try {
        await processSavedExchange(session.id, prior.id);
      } catch (error) {
        villagesLogger().warn("[villages] saved turn progress deferred for %s: %s", prior.id, String(error));
      }
      if (!prior.processing) await applyVenueTurnChange(session, prior);
      await applyVenueRequests(session, prior);
      if (
        prior.invitationSignal &&
        (prior.invitationSignal.timing === "later" || prior.invitationSignal.venueId !== session.placeId)
      )
        await recordSpokenInvitation(session, prior.invitationSignal);
      await settleSemanticAuthority(session, prior);
      await finishSemanticScene(session.id);
      await markZoneSeen(session, false).catch((error) =>
        villagesLogger().warn("[villages] saved turn observation deferred for %s: %s", prior.id, String(error)),
      );
      const recordEvents = await receiptForTurn(session, prior);
      return {
        session: await readSession(session.id),
        verdict: prior.verdict,
        action: prior.action ?? null,
        recordEvents:
          prior.action?.happened && !prior.physicalOutcomeVersion
            ? [{ id: `venue-action:${input.submissionId}`, kind: "venue" as const, text: prior.action.narration }]
            : recordEvents,
      };
    }
    session = await requireLiveVenueSession(session.id);
    const blocker = semanticBlocker(session);
    if (blocker) throw conflict(blocker);
    // Act and Fulfill aliases use the current Chat interpretation.
    if (requestMode) input = { ...input, mode: "chat" };
    const admitted = venueOperationSnapshot<unknown>();
    if (admitted) session = { ...coerceSession(admitted), operation: session.operation };
    if (session.status !== "active") throw conflict("That Scene is not active.");
    if (
      [5, 6].includes(Number(venueOperationInput()?.interactionScopeVersion)) &&
      session.sceneAttendance &&
      !session.sceneAttendance.layout
    ) {
      const venue = (await readVillageState()).venues.find((row) => row.id === session.placeId);
      if (!venue) throw notFound("That Venue is no longer available.");
      const layout = await venueCheckpoint(
        venueOperationInput()?.interactionScopeVersion === 6 ? "scene-layout" : "acoustic-layout",
        async () => captureSceneLayout(venue),
      );
      await changeSession(session.id, (state) => {
        if (state.sceneAttendance && !state.sceneAttendance.layout) state.sceneAttendance.layout = layout;
      });
      session = { ...session, sceneAttendance: { ...session.sceneAttendance, layout } };
    }
    let movementVenue: VillageVenue | undefined;
    if (input.mode !== "leave" && session.zoneId) {
      const village = sceneContinuityView(await readVillageState(), session),
        venue = village.venues
          .map((entry) => sceneLayoutVenue(entry, session))
          .find((entry) => entry.id === session.placeId),
        zone = venue && resolveVenueZone(venue, session.zoneId);
      if (!venue || !zone || zoneClosed(village, venue, zone))
        throw conflict("This zone is closed. Move to another zone or leave the Venue.");
      movementVenue = venue;
    }
    if (session.semanticVersion !== 2 && input.mode !== "leave" && movementVenue)
      assertConversationalPlayerPosition(input.message, movementVenue, session.zoneId ?? "");
    if (input.mode !== "leave" && !input.message.trim()) throw badRequest("Write something before sending it.");
    if (input.message.length > 4000) throw badRequest("A line can be at most 4000 characters.");
    if (
      session.semanticVersion === 2 &&
      semantic &&
      input.mode !== "leave" &&
      venueOperationInput()?.semanticPipelineVersion !== 3
    ) {
      const intent = await semantic.intent(session, input.message);
      if (intent.status === "unresolved") throw conflict(intent.reason || "The action needs clarification.");
      session = { ...session, semanticIntent: intent };
      semanticPlayerMoves([], session, []);
    }
    if (
      input.mode !== "contact" &&
      input.targetId &&
      !session.activeIds.includes(input.targetId) &&
      !(
        !explicitSceneActions() &&
        (input.mode === "chat" || input.mode === "ask") &&
        session.doorwayContacts?.some((entry) => entry.characterId === input.targetId)
      )
    )
      throw badRequest("That villager is no longer in this conversation.");
    await rollActiveAgendas(villageNow());
    const village = await readVillageState();
    const verdict: VenueSubmission["verdict"] = null;
    const wishId = "",
      wishMemory = "";
    const responseTargetId = input.targetId || (session.activeIds.length === 1 ? session.activeIds[0]! : "");
    let attention: AttentionPlan | undefined;
    const interactionVersion = venueOperationInput()?.interactionScopeVersion;
    const acousticContact =
      interactionVersion === 5 &&
      input.mode === "contact" &&
      readContactDelivery(input.contact ?? {}, input.message) !== "device";
    if (
      acousticContact &&
      (!input.contact?.boundaryZoneId ||
        !contactNeighbors(
          movementVenue ?? village.venues.find((row) => row.id === session.placeId)!,
          session.zoneId ?? "exterior",
          session,
        ).includes(input.contact.boundaryZoneId))
    )
      throw badRequest("Choose a directly connected space for that physical contact.");
    if (
      (interactionVersion === 2 || interactionVersion === 3 || interactionVersion === 4 || interactionVersion === 5) &&
      (input.mode === "chat" || input.mode === "ask" || acousticContact)
    ) {
      const venue = movementVenue ?? village.venues.find((entry) => entry.id === session.placeId);
      if (!venue) throw notFound("That Venue is no longer available.");
      const pending = session.pendingAttention;
      const intentKey = acousticContact
        ? JSON.stringify(["contact", input.contact?.kind, input.contact?.boundaryZoneId])
        : "say-do";
      const sameIntent = interactionVersion !== 5 || (pending?.intentKey ?? "say-do") === intentKey;
      if (input.attentionChoice) {
        if (
          !pending ||
          !sameIntent ||
          pending.id !== input.attentionChoice.id ||
          pending.message !== input.message ||
          pending.revision !== session.sceneRevision ||
          pending.originZoneId !== session.zoneId ||
          !pending.choices.some((choice) => choice.id === input.attentionChoice!.zoneId)
        )
          throw conflict("That doorway choice has changed. Your draft is preserved; send it again.");
        attention = validAttentionPlan(pending.plan, input.message, venue, session)
          ? (pending.plan.validation?.version === 3 ? bindAcousticPlan : bindAttentionPlan)(
              {
                status: "attention",
                fragments: pending.plan.fragments.map((fragment) =>
                  pending.plan.validation?.version === 3
                    ? {
                        ...acousticFragment(
                          venue,
                          session,
                          fragment,
                          fragment.delivery ?? "call",
                          fragment.outward ?? true,
                        ),
                        targetZoneId: input.attentionChoice!.zoneId,
                      }
                    : {
                        ...fragment,
                        zoneIds: fragment.zoneIds.length ? fragment.zoneIds : [input.attentionChoice!.zoneId],
                      },
                ),
              },
              input.message,
              venue,
              session,
              pending.plan.validation?.version === 2,
            )
          : holdAttentionPlan(input.message, venue, session);
      } else if (
        sameIntent &&
        pending?.message === input.message &&
        pending.revision === session.sceneRevision &&
        pending.originZoneId === session.zoneId
      ) {
        attention = pending.plan;
      } else {
        attention = await venueCheckpoint("attention-plan", () =>
          interactionVersion === 5
            ? interpretAcoustics(
                session,
                venue,
                input.message,
                acousticContact
                  ? { kind: input.contact?.kind === "knock" ? "knock" : "call", zoneId: input.contact!.boundaryZoneId }
                  : undefined,
              )
            : interpretAttention(session, venue, input.message),
        );
      }
      if (!validAttentionPlan(attention, input.message, venue, session))
        attention = holdAttentionPlan(input.message, venue, session);
      if (attention.status === "clarify") {
        const choices = attention.fragments.some((fragment) => !fragment.zoneIds.length)
          ? attentionClarificationChoices(venue, session)
          : [];
        const updated = await changeSession(session.id, (state) => {
          if (state.sceneRevision !== session.sceneRevision || state.zoneId !== session.zoneId)
            throw conflict("The Scene changed; your draft is preserved.");
          state.pendingAttention = {
            ...(interactionVersion === 5 ? { intentKey } : {}),
            id: input.submissionId,
            message: input.message,
            revision: state.sceneRevision ?? 0,
            originZoneId: state.zoneId ?? "exterior",
            plan: attention!,
            choices,
          };
        });
        return { session: updated, verdict: null, action: null, recordEvents: [] };
      }
    }
    let contactIntentUsed: ContactIntent | null =
      attention?.status === "attention" || (attention?.status === "local" && attention.validation?.version === 3)
        ? {
            kind: "call",
            ...(acousticContact ? { physicalTargetId: input.contact!.boundaryZoneId } : {}),
            targetId: input.targetId,
            boundaryZoneId: attention.fragments[0]?.zoneIds[0] ?? "",
            quote: input.message,
            delivery: "voice",
            attention,
          }
        : input.mode === "contact"
          ? {
              kind: input.contact?.kind === "call" ? "call" : "knock",
              targetId: input.targetId,
              boundaryZoneId: input.contact?.boundaryZoneId ?? "",
              quote: input.message,
              delivery: readContactDelivery(input.contact ?? {}, input.message),
              deviceFeatureId: input.contact?.deviceFeatureId,
            }
          : null;
    if (!explicitSceneActions() && !contactIntentUsed && (input.mode === "chat" || input.mode === "ask")) {
      const venue = village.venues
        .map((entry) => sceneLayoutVenue(entry, session))
        .find((entry) => entry.id === session.placeId);
      const live = (session.doorwayContacts ?? []).filter((entry) => {
        if (
          !venue ||
          entry.playerZoneId !== session.zoneId ||
          contactPosition(session, entry.characterId) !== entry.characterZoneId
        )
          return false;
        if (entry.delivery === "device" && !contactDevice(venue, session.zoneId!, entry.deviceFeatureId ?? ""))
          return false;
        return contactReach(village, venue, session.zoneId!, entry.delivery ?? "voice").includes(entry.characterZoneId);
      });
      const words = (text: string) =>
        " " +
        text
          .normalize("NFKC")
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]+/gu, " ")
          .trim() +
        " ";
      const addressed = session.participants.find((person) => words(input.message).includes(words(person.name)));
      const recipient = input.targetId || addressed?.characterId || "";
      const selected =
        live.find((entry) => entry.characterId === recipient) ??
        (!recipient || session.activeIds.includes(recipient) ? live.at(-1) : undefined);
      if (selected)
        contactIntentUsed = {
          kind: "call",
          targetId: recipient || selected.characterId,
          boundaryZoneId: selected.delivery && selected.delivery !== "voice" ? "" : selected.characterZoneId,
          quote: input.message,
          delivery: selected.delivery ?? "voice",
          deviceFeatureId: selected.deviceFeatureId,
        };
    }
    const routesZoneEvents =
      interactionVersion === 6 && (input.mode !== "leave" || venueOperationInput()?.writingContractVersion === 3);
    const eventVenue = movementVenue ?? village.venues.find((entry) => entry.id === session.placeId);
    if (routesZoneEvents && !eventVenue) throw conflict("This Venue is no longer available. End the Scene.");
    const eventScene = routesZoneEvents
      ? zoneEventScene(session, eventVenue!, {
          targetId: input.targetId || session.semanticIntent?.timeline.find((step) => step.targetId)?.targetId,
          message: input.message,
          zoneId: input.contact?.boundaryZoneId,
        })
      : session;
    if (interactionVersion === 6 && input.mode === "contact") {
      if (
        (session.semanticVersion === 2
          ? input.contact?.delivery
          : readContactDelivery(input.contact ?? {}, input.message)) === "device"
      )
        throw badRequest("Use a direct call or sound in Say / Do; device links are not part of Zone sound routing.");
      if (
        input.contact?.boundaryZoneId &&
        !contactNeighbors(
          movementVenue ?? village.venues.find((entry) => entry.id === session.placeId)!,
          session.zoneId ?? "exterior",
          session,
        ).includes(input.contact.boundaryZoneId)
      )
        throw badRequest("Choose a directly connected Zone for that contact.");
      eventScene.contactGeneration!.instruction = `The Contact shortcut requests a ${input.contact?.kind === "knock" ? "knock" : "call"} toward ${input.contact?.boundaryZoneId || "the adjacent Zones"}. Resolve it as a current attempted action; never invent success. Explicit private or hypothetical wording still governs.`;
      contactIntentUsed = null;
    }
    let reply = contactIntentUsed
      ? await contactReply(session, contactIntentUsed)
      : await venueCheckpoint("turn-reply", () =>
          generate(
            eventScene,
            input.message,
            input.mode === "contact" ? "chat" : input.mode,
            responseTargetId,
            null,
            venueOperationSignal(),
          ),
        );
    if (!explicitSceneActions() && !contactIntentUsed && reply.contactIntent) {
      contactIntentUsed = reply.contactIntent;
      reply = await contactReply(session, contactIntentUsed);
    }
    // Validate retained replies before any effects; only the explicit Move route owns travel.
    if (reply.movementIntent && reply.movementIntent.zoneId !== session.zoneId)
      throw badGateway("System invented player Zone travel. The draft is preserved.");
    semanticPlayerMoves(reply.semanticPlayerMoves, session, reply.lines);

    if (
      session.semanticVersion !== 2 &&
      contactIntentUsed &&
      /^(?:goodbye|bye|see you(?: later)?|talk (?:to you )?later)\b/iu.test(
        input.message.trim().replace(/^["“‘']+/u, ""),
      )
    ) {
      const addressedName = session.participants.find((person) =>
        input.message.toLowerCase().includes(person.name.toLowerCase()),
      );
      const endings = addressedName
        ? (session.doorwayContacts ?? []).filter((entry) => entry.characterId === addressedName.characterId)
        : (session.doorwayContacts ?? []);
      reply.contactEndIds = [...new Set([...reply.contactEndIds, ...endings.map((entry) => entry.characterId)])];
    }
    const contactSpeakers =
      contactIntentUsed || interactionVersion === 6
        ? [
            ...new Set(
              reply.lines
                .filter((line) => line.kind !== "narration" && !line.contactHidden)
                .map((line) => line.speakerId),
            ),
          ]
        : [];
    if (contactIntentUsed || reply.contactMoves.length) {
      const current = await readVillageState(),
        currentVenue = current.venues.find((entry) => entry.id === session.placeId);
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
    const applicationVillage = await readVillageState();
    validateCurrentRoomInvitation(reply, sceneContinuityView(applicationVillage, session));
    let projectFailure = reply.effectFailures?.projects;
    let projectInterpretation: Awaited<ReturnType<typeof interpretProjectDraft>> = null;
    try {
      projectInterpretation =
        session.semanticVersion === 2
          ? null
          : projectFailure
            ? null
            : input.mode === "chat" || input.mode === "ask" || input.mode === "contact"
              ? await interpretProjectDraft(
                  session,
                  applicationVillage,
                  input.message,
                  reply.lines.filter(
                    (line) =>
                      ![5, 6].includes(Number(interactionVersion)) || !line.contactHidden || line.attentionEvidence,
                  ),
                  reply.heardPlayerBy,
                  input.submissionId,
                  reply.interpretationRouting,
                  reply.projectSpeech.map((proposal) => proposal.speakerId),
                )
              : null;
    } catch (error) {
      if (venueOperationInput()?.writingContractVersion !== 3) throw error;
      projectFailure = {
        kind: "interpretation",
        message: safeFailureMessage(error).slice(0, 500),
        proposal: { projectSpeech: reply.projectSpeech, routing: reply.interpretationRouting },
      };
    }
    if (
      session.semanticVersion !== 2 &&
      (projectInterpretation || applicationVillage.projects.some((project) => project.lifecycle))
    ) {
      reply.projectSpeech = projectInterpretation ? projectProposals(projectInterpretation) : [];
      reply.projectContexts = projectSpeechContexts(
        applicationVillage,
        [...new Set(reply.lines.map((line) => line.speakerId).filter(Boolean))],
        "",
      );
    }
    const updated = await changeSession(session.id, (state) => {
      if (state.submissions.some((entry) => entry.id === input.submissionId)) return;
      state.pendingProjectQuestions = projectInterpretation
        ? projectInterpretation.checks
            .filter(
              (_check, index) =>
                projectInterpretation.results[index].outcome === "unresolved" ||
                projectInterpretation.traces[index].applied.startsWith("Unresolved"),
            )
            .map((check) => check.question)
            .slice(0, 8)
        : [];
      if (state.status !== "active") throw conflict("That Scene has already ended.");
      if (state.sceneRevision !== session.sceneRevision)
        throw conflict("The conversation moved on. Try sending that line again.");
      const at = villageNow().toISOString();
      state.pendingAttention = undefined;
      state.lastActivityAt = at;
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
      if (contactIntentUsed || interactionVersion === 6) {
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
          if (!state.heardHistory.some((entry) => entry.characterId === id))
            state.heardHistory.push({ characterId: id, lineIds: [] });
        }
        if (contactIntentUsed) {
          const venue = village.venues.find((entry) => entry.id === state.placeId)!;
          const reachable =
            attention?.status === "attention"
              ? [...new Set(attention.fragments.flatMap((fragment) => fragment.zoneIds))]
              : contactReach(
                  village,
                  venue,
                  state.zoneId ?? "exterior",
                  contactIntentUsed!.delivery ?? "voice",
                  explicitSceneActions() ? contactIntentUsed!.boundaryZoneId : "",
                  explicitSceneActions(),
                );
          state.doorwayContacts = [
            ...(state.doorwayContacts ?? []).filter(
              (entry) =>
                !reply.contactEndIds.includes(entry.characterId) &&
                !reply.contactMoves.some((move) => move.characterId === entry.characterId),
            ),
            ...contactSpeakers
              .filter(
                (id) =>
                  contactPosition(state, id) !== state.zoneId &&
                  !reply.contactEndIds.includes(id) &&
                  reachable.includes(contactPosition(state, id)),
              )
              .map((id) => ({
                characterId: id,
                playerZoneId: state.zoneId ?? "exterior",
                characterZoneId: contactPosition(state, id),
                delivery: contactIntentUsed?.delivery ?? "voice",
                ...(contactIntentUsed?.deviceFeatureId ? { deviceFeatureId: contactIntentUsed.deviceFeatureId } : {}),
              })),
          ].filter((entry, index, all) => all.findIndex((other) => other.characterId === entry.characterId) === index);
        }
      }
      let playerLineId = input.message.trim() ? randomUUID() : "";
      if (playerLineId)
        appendLine(state, {
          id: playerLineId,
          speakerId: "",
          name: "",
          role: "user",
          content: input.message,
          at,
          heardBy: contactIntentUsed
            ? reply.heardPlayerBy.filter((id) => session.activeIds.includes(id))
            : reply.heardPlayerBy,
        });
      if (contactIntentUsed && !attention) {
        runtimeDebug("contact witnesses", {
          sceneId: state.id,
          heardPlayerBy: reply.heardPlayerBy,
          lines: reply.lines.map((line) => ({ speakerId: line.speakerId, heardBy: line.heardBy })),
        });
        playerLineId = randomUUID();
        appendLine(state, {
          id: playerLineId,
          speakerId: "",
          name: "",
          role: "user",
          content: contactIntentUsed.quote,
          at,
          heardBy: reply.heardPlayerBy,
          contactHidden: true,
        });
      }
      appendVenueReply(state, reply.lines, at);
      const replyLineIds = state.lines.slice(-reply.lines.length).map((line) => line.id);
      const wishChanges = bindWishProposals(
        reply.wishChanges,
        applicationVillage,
        state.lines,
        playerLineId,
        replyLineIds,
        reply.wishContexts,
        state.semanticVersion === 2,
      );
      if (
        compatibilityWishCheck &&
        state.semanticVersion !== 2 &&
        state.lines.find((line) => line.id === playerLineId)?.heardBy.includes(input.targetId)
      ) {
        const cited = [
          playerLineId,
          ...replyLineIds.filter((id) => state.lines.find((line) => line.id === id)?.heardBy.includes(input.targetId)),
        ];
        for (const context of reply.wishContexts.filter((context) => context.actorId === input.targetId))
          if (
            !wishChanges.proposals.some(
              (proposal) => proposal.wishId === context.wishId && proposal.intent !== "reveal",
            )
          )
            wishChanges.proposals.push({ ...context, intent: "check", lineIds: cited });
      }
      const recollections: VenueRecollection[] = reply.recollections.map((memory, index) => ({
        id: `${session.id}:recollection:${input.submissionId}:${index}`,
        text: memory.text,
        subjectCharacterIds: memory.subjectCharacterIds,
        knownByCharacterIds: memory.knownByCharacterIds,
        lineIds: [
          ...new Set<string>(
            memory.evidence
              .map((ref) => (ref === "player" ? playerLineId : replyLineIds[ref]))
              .filter((id): id is string => !!id),
          ),
        ],
      }));
      if (reply.recap) state.recap = reply.recap;
      state.submissions.push({
        id: input.submissionId,
        speechCapture: reply.speechCapture,
        effectFailures: { ...reply.effectFailures, ...(projectFailure ? { projects: projectFailure } : {}) },
        ...(interactionVersion === 6 ? { zoneEventsVersion: 1 as const } : {}),
        message: input.message,
        mode: input.mode,
        ...(requestMode ? { requestMode } : {}),
        targetId: input.targetId,
        ...(input.contact ? { contact: input.contact } : {}),
        ...(attention ? { attention } : {}),
        ...(contactIntentUsed || interactionVersion === 6 || reply.contactMoves.length
          ? {
              speechIdsAtTurn: contactSpeakers,
              contactEvidence: { moves: reply.contactMoves, relay: reply.contactRelay },
            }
          : {}),
        areaAtTurn: session.area,
        zoneIdAtTurn: session.zoneId,
        privateOwnerIdAtTurn: session.privateOwnerId,
        activeIdsAtTurn: [...session.activeIds],
        activeIdsAfterTurn: [
          ...new Set([
            ...session.activeIds.filter(
              (id) => !reply.contactMoves.some((move) => move.characterId === id && move.zoneId !== session.zoneId),
            ),
            ...reply.contactMoves.filter((move) => move.zoneId === session.zoneId).map((move) => move.characterId),
          ]),
        ].filter((id) => !reply.departures.includes(id)),
        replyLineIds,
        openingContext: reply.openingContext,
        openingSignal: reply.openingSignal,
        projectContexts: reply.projectContexts,
        projectInterpretationVersion: 1 as const,
        ...(asRecord(reply).projectOfferReview
          ? {
              interpretationHistory: [
                {
                  at,
                  domain: "projects" as const,
                  source: "System offer availability review",
                  proposals: asRecord(reply).projectOfferReview,
                },
              ],
            }
          : {}),
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
        recollections,
        wishProposals: wishChanges.proposals,
        wishProposalError: wishChanges.error,
        wishContexts: reply.wishContexts,
        semanticProvenance: reply.semanticProvenance,
        semanticPlayerMoves: reply.semanticPlayerMoves,
        ...(session.semanticVersion === 2 && reply.sceneEnded ? { semanticConclude: true } : {}),
        physicalContext: reply.physicalContext,
        liveProposals: bindLiveProposals(reply, playerLineId, replyLineIds),
        accessEvents: savedAccessEvents(reply.roomInterpretation),
        ...(reply.residentActionReceipt ? { residentActionReceipt: reply.residentActionReceipt } : {}),
        requestMetrics: venueRequestMetrics(),
        ...(reply.sceneChange
          ? {
              sceneChange: reply.sceneChange,
              physicalOutcomeVersion: 1 as const,
              action: { happened: true, ...reply.sceneChange },
              actionReplyDone: true,
            }
          : {}),
        ...(reply.residenceSignal ? { residenceSignal: reply.residenceSignal } : {}),
        ...(reply.upgradeSignal ? { upgradeSignal: reply.upgradeSignal } : {}),
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
        ...(reply.invitationSignal
          ? {
              invitationSignal: {
                ...reply.invitationSignal,
                sourceLineId: reply.lines
                  .map((line, index) => ({ line, id: replyLineIds[index] }))
                  .find(
                    ({ line }) =>
                      (reply.invitationSignal?.evidenceKind === "action"
                        ? line.kind === "narration"
                        : line.speakerId === reply.invitationSignal?.residentId) &&
                      line.content.toLowerCase().includes(reply.invitationSignal.quote.toLowerCase()),
                  )?.id,
              },
            }
          : {}),
        ...(reply.editApprovalSignal
          ? {
              editApprovalSignal: {
                ...reply.editApprovalSignal,
                sourceLineId: reply.lines
                  .map((line, index) => ({ line, id: replyLineIds[index] }))
                  .find(
                    ({ line }) =>
                      line.speakerId === reply.editApprovalSignal?.residentId &&
                      line.content.toLowerCase().includes(reply.editApprovalSignal.quote.toLowerCase()),
                  )?.id,
              },
            }
          : {}),
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
      const remaining = state.sceneAttendance?.occupants.some(
        (person) => !state.departedIds?.includes(person.characterId),
      );
      if (
        session.semanticVersion !== 2 &&
        (reply.sceneEnded || (session.activeIds.length > 0 && state.activeIds.length === 0 && !remaining))
      ) {
        state.status = "closed";
        state.endedAt = at;
        state.endReason = "scene";
      }
    });
    const submission = updated.submissions.find((entry) => entry.id === input.submissionId)!;
    // Settle witnessed policy/boundary changes before this reply's visit or standing grants.
    if (reply.roomInterpretation) await recordRoomAccessEvents(updated, reply.roomInterpretation);
    try {
      await processSavedExchange(updated.id, submission.id);
    } catch (error) {
      villagesLogger().warn("[villages] saved turn progress deferred for %s: %s", submission.id, String(error));
    }
    if (!submission.processing) await applyVenueTurnChange(updated, submission);
    await applyVenueRequests(updated, submission);
    if (submission.invitationSignal) await recordSpokenInvitation(updated, submission.invitationSignal);
    await markZoneSeen(updated, false).catch((error) =>
      villagesLogger().warn("[villages] saved turn observation deferred for %s: %s", submission.id, String(error)),
    );
    if (projectInterpretation) {
      await finalizeProjectDiagnostics(
        updated.id,
        projectInterpretation,
        submission.projectSpeech ?? [],
        submission.id,
      );
    }
    if (reply.roomInterpretation) {
      await finalizeRoomInvitationDiagnostics(updated, reply.roomInterpretation, submission.invitationSignal);
      await writeInterpretationDiagnostics(updated.id, reply.roomInterpretation.traces).catch(() => {});
    }
    await settleSemanticAuthority(updated, submission);
    await finishSemanticScene(updated.id);
    let recordEvents = await receiptForTurn(updated, submission);
    let finalSession = updated;
    if (updated.status === "closed") {
      finalSession = await closeVenueSession(updated.id);
      const byId = new Map(
        [...recordEvents, ...(await sceneReceipts(finalSession))].map((event) => [event.id, event] as const),
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
      const view = { ...current, ...structuredClone(saved.continuity.facts) };
      change(view);
      saved.continuity.facts.venues = view.venues;
    });
  }

  async function applySavedAccessEvents(scene: VenueScene, turn: VenueSubmission) {
    const events = (turn.accessEvents ?? []).filter((event) => event.interpretationVersion === 1);
    if (events.length !== (turn.accessEvents ?? []).length) await holdLegacyRoomEffect(scene.id);
    if (!events.length) return;
    const batch = {
      checks: events.map((event) => ({ id: event.id, facts: event.facts })),
      results: events.map((event) => ({ outcome: event.outcome, evidenceIds: event.evidenceIds })),
      traces: events.map(() => ({ applied: "Saved access interpretation awaiting application" })),
    } as InterpretationBatch;
    await recordRoomAccessEvents(scene, batch, turn.id);
  }

  async function recordRoomAccessEvents(
    scene: VenueScene,
    batch: InterpretationBatch,
    submissionId = scene.submissions.at(-1)?.id,
  ) {
    const turn = scene.submissions.find((turn) => turn.id === submissionId);
    if (!turn?.replyLineIds?.length || !turn.at) return;
    const apply = (state: VillageState) => {
      if (scene.villageSeed && state.seed !== scene.villageSeed) return;
      const initialRevisions = new Map(state.venues.map((venue) => [venue.id, venue.access?.revision]));
      for (const [index, result] of batch.results.entries()) {
        if (!validDecisionEvidence(batch.checks[index], result)) continue;
        const check = batch.checks[index],
          facts = asRecord(check.facts),
          actor = String(facts.actorId);
        const management = asRecord(facts.accessCommand);
        if (
          !management.action &&
          !["refuse", "dismiss", "ban-zone", "ban-venue", "invite-outside-hours"].includes(result.outcome)
        )
          continue;
        const venue = state.venues.find((row) => row.id === facts.venueId),
          zone = venue && resolveVenueZone(venue, String(facts.zoneId));
        if (!venue?.access || (!management.action && !zone && result.outcome !== "ban-venue")) continue;
        const operationId = management.action
          ? String(management.operationId)
          : "access-speech:" +
            createHash("sha256")
              .update(check.id + ":" + result.outcome)
              .digest("hex");
        if (venue.access.receipts[operationId]) {
          batch.traces[index].applied = "Already settled; replay made no access change";
          continue;
        }
        const reject = (reason: string) => {
          venue.access!.receipts[operationId] = {
            fingerprint: "rejected-witnessed-event",
            revision: venue.access!.revision,
            outcome: "rejected",
          };
          batch.traces[index].applied = reason;
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
          reject("Rejected: access changed after this speech was interpreted");
          continue;
        }
        if (
          management.action &&
          result.outcome !== "access-management" &&
          !(
            facts.semanticVersion === 2 &&
            management.action === "invite" &&
            ["invite-now", "invite-later"].includes(result.outcome)
          )
        ) {
          reject("Rejected: the exact management change was not established by current speech");
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
                (facts.semanticVersion === 2 &&
                  line.kind === "narration" &&
                  line.heardBy.includes(actor) &&
                  !line.contactHidden)) &&
              turn.replyLineIds.includes(line.id),
          );
        if (!sources.length) {
          reject("Rejected: no saved current speech by the authorized actor");
          continue;
        }
        const scope = result.outcome === "ban-venue" ? null : (zone?.id ?? null);
        const speech = sources.map((line) => line.content).join(" ");
        if (
          result.outcome.startsWith("ban-") &&
          (!managesAccess(venue, scope, actor) ||
            (facts.semanticVersion !== 2 &&
              (!/\b(?:ban|banned|barred)\b/iu.test(speech) ||
                /\b(?:not banned|not ban|won't ban|would|might|if|joking)\b/iu.test(speech))))
        ) {
          reject("Rejected: a lasting ban requires explicit manager speech");
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
              ["player", ...state.villagers.map((person) => person.characterId)],
              sources.map((line) => line.id),
            );
          else if (result.outcome.startsWith("ban-"))
            applyAccessCommand(
              venue,
              { ...base, action: "ban" },
              actor,
              turn.at,
              ["player", ...state.villagers.map((person) => person.characterId)],
              sources.map((line) => line.id),
            );
          else if (result.outcome === "invite-outside-hours")
            applyAccessCommand(
              venue,
              {
                ...base,
                action: "invite",
                duration: "visit",
                sceneId: venue.id === scene.placeId ? scene.id : undefined,
                accompanied: facts.semanticVersion === 2 && facts.accompanies === true,
                outsideHours: true,
              },
              actor,
              turn.at,
              ["player", ...state.villagers.map((person) => person.characterId)],
              sources.map((line) => line.id),
            );
          else if (venue.id === scene.placeId)
            applyAccessCommand(
              venue,
              { ...base, action: result.outcome === "dismiss" ? "leave-now" : "refuse-entry", sceneId: scene.id },
              actor,
              turn.at,
              ["player", ...state.villagers.map((person) => person.characterId)],
              sources.map((line) => line.id),
            );
          else continue;
          batch.traces[index].applied = "Scoped access change recorded with current authority and saved speech";
        } catch (error) {
          reject("Rejected: " + safeFailureMessage(error));
        }
      }
    };
    await changeSceneVenues(scene, apply);
    await mutateVillageState(apply);
  }

  async function finalizeRoomInvitationDiagnostics(
    scene: VenueScene,
    batch: InterpretationBatch,
    signal: VenueSubmission["invitationSignal"],
  ) {
    await recordRoomAccessEvents(scene, batch);
    await saveInterpretationContext(scene.id, batch, scene.submissions.at(-1)?.id).catch(() => {});
    const queued = batch.traces.filter((trace) => trace.applied.startsWith("Future invitation queued"));
    if (signal) await recordSpokenInvitation(scene, signal);
    if (!queued.length) return;
    const state = await readVillageState();
    for (const trace of queued) {
      const facts = asRecord(batch.checks[batch.traces.indexOf(trace)].facts);
      const venue = state.venues.find((entry) => entry.id === facts.venueId);
      const recorded =
        signal &&
        (venue?.access
          ? venue.access.permissions.some(
              (grant) =>
                !grant.revoked &&
                grant.sourceLineIds.includes(signal.sourceLineId ?? "") &&
                grant.zoneId === facts.zoneId,
            )
          : venue?.playerInvitations?.some(
              (invitation) => invitation.sourceLineId === signal.sourceLineId && invitation.zoneId === facts.zoneId,
            ));
      trace.applied = recorded
        ? `Next-visit invitation recorded using ${trace.result.source}; authority and saved evidence validated`
        : "Rejected: future invitation did not validate against saved evidence and current authority";
    }
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
    // Completed greeting/turn checkpoints already contain the interpreted signal.
    // Replaying them bypasses the writing service, so validate its Decision binding again here.
    {
      const invitation = invitations[0];
      const facts = asRecord(invitation?.check?.facts);
      if (
        invitations.length !== 1 ||
        !invitation.check ||
        !validDecisionEvidence(invitation.check, invitation.result) ||
        facts.actorId !== signal.residentId ||
        facts.venueId !== signal.venueId ||
        facts.zoneId !== signal.zoneId ||
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
    const venue = village.venues.find((entry) => entry.id === signal.venueId);
    const zone = venue && resolveVenueZone(venue, signal.zoneId);
    if (!venue || !zone || zoneClosed(village, venue, zone) || !canInviteToZone(venue, zone, signal.residentId))
      reply.invitationSignal = null;
    else (signal as NonNullable<VenueSubmission["invitationSignal"]>).interpretationVersion = 1;
  }

  async function holdLegacyRoomEffect(sceneId: string): Promise<void> {
    await changeSession(sceneId, (state) => {
      state.pendingRoomQuestions = [
        ...new Set([
          ...(state.pendingRoomQuestions ?? []),
          "A saved access effect lacks validated interpretation evidence. Ask again to establish current permission.",
        ]),
      ].slice(-8);
    });
  }

  function applyImmediateZoneInvitation(
    session: VenueScene,
    signal: NonNullable<VenueSubmission["invitationSignal"]>,
  ): void {
    const zoneId = signal.zoneId ?? (signal.scope === "private" ? "private:" + signal.ownerId : "residence");
    session.dismissedZoneIds = session.dismissedZoneIds?.filter((id) => id !== zoneId);
    session.grantedZoneIds = [...new Set([...(session.grantedZoneIds ?? []), zoneId])];
    session.zoneGrants = [
      ...(session.zoneGrants ?? []).filter((grant) => grant.zoneId !== zoneId),
      { zoneId, controllerId: signal.residentId },
    ];
    session.entryOffers = [
      ...(session.entryOffers ?? []).filter((entry) => entry.zoneId !== zoneId),
      {
        zoneId,
        label: signal.zoneLabel ?? (signal.scope === "private" ? "Private Space" : "Common Space"),
        controllerId: signal.residentId,
        accompanies: signal.accompanies === true,
      },
    ];
  }

  async function recordSpokenInvitation(
    session: VenueScene,
    signal: NonNullable<VenueSubmission["invitationSignal"]>,
  ): Promise<void> {
    if (signal.accessOperationId) {
      const venue = sceneContinuityView(await readVillageState(), await readSession(session.id)).venues.find(
        (row) => row.id === signal.venueId,
      );
      const receipt = venue?.access?.receipts[signal.accessOperationId];
      if (!receipt || receipt.outcome === "rejected") throw conflict("The saved invitation needs recovery.");
      return;
    }
    if (signal.interpretationVersion !== 1) {
      await holdLegacyRoomEffect(session.id);
      return;
    }
    const quote = signal.quote.replace(/\s+/gu, " ").toLowerCase();
    const spoken = session.lines.find(
      (line) =>
        (signal.evidenceKind === "action" ? line.kind === "narration" : line.speakerId === signal.residentId) &&
        line.content.replace(/\s+/gu, " ").toLowerCase().includes(quote) &&
        (!signal.sourceLineId || line.id === signal.sourceLineId),
    );
    if (!spoken || !quote) return;
    const apply = (state: VillageState) => {
      if (session.villageSeed && session.villageSeed !== state.seed) return;
      const venue = state.venues.find((entry) => entry.id === signal.venueId);
      if (!venue) return;
      const zone = resolveVenueZone(
        venue,
        signal.zoneId ??
          legacyZoneId(venue, signal.scope === "private" ? "private" : "shared", "residence", signal.ownerId),
      );
      if (!zone || zoneClosed(state, venue, zone) || !canInviteToZone(venue, zone, signal.residentId)) return;
      if (venue.access) {
        const operationId = "speech:" + spoken.id + ":" + zone.id;
        if (venue.access.receipts[operationId]) return;
        if (
          signal.accessRevision === undefined ||
          venue.access.changes.some(
            (change) =>
              change.revision > signal.accessRevision! &&
              (change.zoneId === null || change.zoneId === zone.id) &&
              change.action !== "invite" &&
              change.action !== "destinations",
          )
        ) {
          venue.access.receipts[operationId] = {
            fingerprint: "obsolete-visit-speech",
            revision: venue.access.revision,
            outcome: "rejected",
          };
          return;
        }
        applyAccessCommand(
          venue,
          {
            action: "invite",
            operationId,
            expectedRevision: venue.access.revision,
            zoneId: zone.id,
            visitorId: "player",
            duration: "visit",
            accompanied: signal.accompanies === true,
            outsideHours: false,
            ...(signal.timing === "now" && venue.id === session.placeId ? { sceneId: session.id } : {}),
          },
          signal.residentId,
          spoken.at,
          ["player", ...state.villagers.map((person) => person.characterId)],
          [spoken.id],
        );
        return;
      }
      // Legacy immediate admission is captured by the current Scene's zoneGrants.
      if (signal.timing === "now" && venue.id === session.placeId) return;
      if (zone.kind === "private-residence" && signal.ownerId !== signal.residentId) return;
      if (
        venue.usedInvitationIds?.includes(spoken.id) ||
        venue.playerInvitations?.some((entry) => entry.sourceLineId === spoken.id)
      )
        return;
      venue.playerInvitations = [
        ...(venue.playerInvitations ?? []),
        {
          residentId: signal.residentId,
          zoneId: zone.id,
          privateSpaceId: ["private-residence", "staff", "restricted"].includes(zone.kind) ? zone.id : undefined,
          recordedAt: villageNow().toISOString(),
          scope: signal.scope,
          ownerId: signal.ownerId,
          sourceLineId: spoken.id,
          quote: signal.quote,
        },
      ].slice(-16);
    };
    await changeSceneVenues(session, apply);
    await mutateVillageState(apply);
  }

  async function applyVenueRequests(session: VenueScene, submission: VenueSubmission): Promise<void> {
    if (submission.venueRequestSignal && !ordinaryProjectsLocked(await readVillageState())) {
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
    if (submission.editApprovalSignal) {
      const signal = submission.editApprovalSignal;
      const quote = signal.quote.replace(/\s+/gu, " ").toLowerCase();
      if (
        session.lines.some(
          (line) =>
            line.id === signal.sourceLineId &&
            line.speakerId === signal.residentId &&
            line.content.replace(/\s+/gu, " ").toLowerCase().includes(quote),
        )
      )
        await applyResidenceEditApproval(session.placeId, signal.proposalId, signal.residentId, signal.approved);
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
          );
        } catch (error) {
          if (submission.semanticProvenance?.version === 2) throw error;
          villagesLogger().warn("[villages] residence decision was no longer valid: %s", String(error));
        }
      }
    }
    if (submission.upgradeSignal) {
      try {
        await recordVillagerVenueImprovement(
          submission.upgradeSignal.characterId,
          submission.upgradeSignal.venueId,
          submission.upgradeSignal.quote,
          `venue-upgrade:${submission.id}`,
        );
      } catch (error) {
        if (submission.semanticProvenance?.version === 2) throw error;
        villagesLogger().warn("[villages] upgrade request was no longer valid: %s", String(error));
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
        const entry = saved.submissions.find((row) => row.id === turn.id);
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
          const entry = saved.submissions.find((row) => row.id === turn.id);
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
      const entry = saved.submissions.find((row) => row.id === turn.id);
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
    if (turn.semanticProvenance?.version !== 2 || turn.semanticReady) return;
    if (allowProjectRecovery) await recoverProjectMetadata(scene, turn);
    const currentScene = await readSession(scene.id);
    const currentTurn = currentScene.submissions.find((row) => row.id === turn.id);
    if (turn.semanticPlayerMoves?.length && currentScene.zoneId !== turn.semanticPlayerMoves.at(-1)!.zoneId)
      throw conflict("The saved movement needs recovery before the turn can be displayed.");
    if (
      (turn.projectSpeech?.length || turn.action?.happened) &&
      currentTurn?.processing?.domains.projects.status !== "applied" &&
      !(currentTurn && projectMetadataRejected(currentTurn))
    )
      throw conflict("The saved immediate outcome needs recovery.");
    if (semanticAuthorityDomain(turn, "relationships")) {
      const result = currentTurn?.processing?.domains.relationships;
      if (result?.status !== "applied" || result.rejectedProposals?.some((row) => row.kind === "permissions"))
        throw conflict("The saved standing permission needs recovery.");
    }
    if (turn.accessEvents?.length) {
      const state = sceneContinuityView(await readVillageState(), currentScene);
      for (const event of turn.accessEvents) {
        const venue = state.venues.find((row) => row.id === event.facts.venueId);
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
      if (!state.exchangeReceipts[`venue-chat:${scene.id}:${turn.id}`]?.physicalOutcome?.actionReceipt?.happened)
        throw conflict("The saved physical outcome could not commit. Recover the saved request.");
    }
    await changeSession(scene.id, (saved) => {
      const entry = saved.submissions.find((row) => row.id === turn.id);
      if (entry?.semanticProvenance?.sourceHash === turn.semanticProvenance?.sourceHash) entry.semanticReady = true;
    });
  }
  async function applyVenueTurnChange(session: VenueScene, submission: VenueSubmission): Promise<void> {
    if (!submission.sceneChange) return;
    const area = submission.areaAtTurn ?? session.area;
    const zoneId = submission.physicalContext?.zoneId ?? submission.zoneIdAtTurn ?? session.zoneId;
    const witnesses = submission.physicalContext?.witnessIds ?? submission.activeIdsAtTurn ?? [];
    if (area === "private" && submission.semanticProvenance?.version !== 2) return;
    const privateOwnerId = submission.privateOwnerIdAtTurn ?? session.privateOwnerId;
    const id = `venue-chat:${session.id}:${submission.id}`;
    await mutateVillageState((state) => {
      if (session.villageSeed && state.seed !== session.villageSeed) return;
      if (state.venueEvents.some((event) => event.id === id) || state.exchangeReceipts[id]?.physicalOutcome) return;
      if (state.venues.some((venue) => venue.id === session.placeId && venue.constructionStatus === "worksite")) return;
      if (
        submission.semanticProvenance?.version !== 2 &&
        area === "shared" &&
        state.venues.some((venue) => venue.id === session.placeId && venueResidentIds(venue).length > 0)
      )
        return;
      const controlledVenue = state.venues.find((venue) => venue.id === session.placeId);
      const controlledZone = controlledVenue && resolveVenueZone(controlledVenue, zoneId ?? "");
      const capturedVenue = session.continuity?.facts.venues.find((venue) => venue.id === session.placeId);
      const capturedZone = capturedVenue && resolveVenueZone(capturedVenue, zoneId ?? "");
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
        if (authority(controlledVenue, controlledZone) !== authority(capturedVenue, capturedZone))
          throw conflict(
            "Authority over this Zone changed. The Scene is preserved; this effect cannot change the current Village.",
          );
      }
      if (
        submission.semanticProvenance?.version !== 2 &&
        (controlledZone?.kind === "staff" || controlledZone?.kind === "restricted")
      )
        return;
      const change = readVenueSceneChange(
        { happened: true, ...submission.sceneChange },
        (() => {
          const place = sceneContinuityView(state, session).venues.find((entry) => entry.id === session.placeId);
          return place
            ? zoneId
              ? venueInZone(place, zoneId)
              : venueInArea(place, area, session.spaceClass, privateOwnerId)
            : undefined;
        })(),
        witnesses,
        state.villagers.map((person) => person.characterId),
        availableProjectSupplyTransfers(state, session.placeId, zoneId, witnesses),
      );
      if (!change) return;
      const at = submission.at || villageNow().toISOString();
      applyVenueSceneChange(
        state,
        session.placeId,
        change,
        submission.id,
        at,
        session.spaceClass,
        area,
        privateOwnerId,
        zoneId,
        !!session.continuity,
      );
      const venue = state.venues.find((place) => place.id === session.placeId)!;
      const moment = deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now: new Date(at) });
      state.happenings = prependHappenings(state.happenings, [
        {
          id,
          kind: "player-action",
          actorIds: [],
          venueId: session.placeId,
          dayIndex: moment.dayIndex,
          clock: moment.dayPhase,
          occurredAt: at,
          timePrecision: "exact",
          sourceOpportunityId: "",
          narration: change.narration,
          text: change.narration,
        },
      ]);
      state.venueEvents = [
        {
          id,
          venueId: session.placeId,
          zoneId,
          venueName: venue.name,
          text: change.narration,
          at,
          // Only newly interpreted turns gain proof. Existing settled history is never backfilled.
          ...(submission.physicalOutcomeVersion === 1
            ? {
                actionReceipt: {
                  happened: true,
                  ...change,
                  submissionId: submission.id,
                  witnessIds: [...witnesses],
                  ...(change.removeItem && change.transferTo
                    ? { itemTransfer: { itemName: change.removeItem, recipientId: change.transferTo } }
                    : {}),
                },
              }
            : {}),
        },
        ...state.venueEvents,
      ].slice(0, 200);
      if (submission.physicalOutcomeVersion === 1)
        state.exchangeReceipts[id] = {
          id,
          sceneId: session.id,
          submissionId: submission.id,
          domain: "physical",
          at,
          committedAt: at,
          status: "applied",
          evidenceIds: submission.replyLineIds ?? [],
          reason: "Confirmed physical outcome",
          physicalOutcome: state.venueEvents[0]!,
        };
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
    const cached = filterRelationshipNotices(submission.recordEvents ?? [], village.relationshipContext)
      .filter(
        (event) =>
          event.kind !== "wish" ||
          (!!event.wishUpdate &&
            village.villagers.some((person) => knownWish(village, person.characterId, event.wishUpdate!.wishId))),
      )
      .map((event) => {
        if (event.kind !== "memory" || event.detail) return event;
        const memory = village.chronicle.find((entry) => entry.id === event.id);
        return memory ? { ...event, detail: memory.text } : event;
      });
    const events: VenueRecordEvent[] = [];
    if (village.relationshipContext && submission.liveProposals) {
      const receiptIds = new Set(submission.processing?.domains.relationships.receiptIds ?? []);
      // A retry reconstructs notices from effects committed in the relationship document.
      const receipts = Object.values(village.relationshipContext.receipts).filter(
        (receipt) =>
          receiptIds.has(receipt.id) || (receipt.sceneId === session.id && receipt.submissionId === submission.id),
      );
      events.push(...relationshipChangeNotices(receipts, village.relationshipContext, village));
    }
    for (const receipt of Object.values(village.exchangeReceipts))
      if (receipt.sceneId === session.id && receipt.submissionId === submission.id && receipt.notice)
        events.push(receipt.notice);
    for (const memory of submission.turnMemories ?? []) {
      const id = `${session.id}:turn:${submission.id}:memory:${memory.characterId}`;
      const saved = village.chronicle.find((entry) => entry.id === id);
      if (saved)
        events.push({
          id,
          kind: "memory",
          text: `${session.participants.find((person) => person.characterId === memory.characterId)?.name ?? "A villager"} remembered this exchange.`,
          detail: saved.text,
        });
    }
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
      const checklist = lineIds.has(flow.requirementsEvidenceId);
      const builder = flow.candidates.find((entry) => lineIds.has(entry.evidenceId));
      const name =
        session.participants.find((person) => person.characterId === builder?.residentId)?.name ?? "A villager";
      const text = checklist
        ? `The builder's checklist for ${project.title} is ready to review.`
        : builder
          ? `${name} agreed to build ${project.title}.`
          : flow.approvals.some((entry) => lineIds.has(entry.evidenceId))
            ? `Approval for ${project.title} was confirmed.`
            : `Supply progress for ${project.title} was updated.`;
      events.push({ id, kind: "project", text });
    }
    const request = submission.residenceSignal;
    if (request?.kind === "request" && village.processedOpportunityIds.includes(`venue-move:${submission.id}`)) {
      const name =
        session.participants.find((person) => person.characterId === request.characterId)?.name ?? "A villager";
      events.push({ id: `venue-move:${submission.id}`, kind: "request", text: `${name} asked to move.` });
    }
    if (submission.upgradeSignal && village.processedOpportunityIds.includes(`venue-upgrade:${submission.id}`)) {
      const name =
        session.participants.find((person) => person.characterId === submission.upgradeSignal!.characterId)?.name ??
        "A villager";
      events.push({
        id: `venue-upgrade:${submission.id}`,
        kind: "request",
        text: `${name} suggested a Venue improvement.`,
      });
    }
    const combined = [...new Map([...events, ...cached].map((event) => [event.id, event])).values()];
    if (persist && JSON.stringify(combined) !== JSON.stringify(submission.recordEvents ?? []))
      await changeSession(session.id, (state) => {
        const saved = state.submissions.find((entry) => entry.id === submission.id);
        if (saved) saved.recordEvents = combined;
      });
    return combined;
  }

  async function sceneReceipts(session: VenueScene): Promise<VenueRecordEvent[]> {
    const current = await readVillageSnapshot();
    return filterRelationshipNotices(
      [
        ...new Map(
          session.submissions.flatMap((turn) => turn.recordEvents ?? []).map((event) => [event.id, event]),
        ).values(),
      ],
      current.relationshipContext,
    ).filter(
      (event) =>
        !current.dismissedNoticeIds.includes(event.id) &&
        (event.kind !== "wish" ||
          (!!event.wishUpdate &&
            current.villagers.some((person) => knownWish(current, person.characterId, event.wishUpdate!.wishId)))),
    );
  }

  async function endVenueSession(id: string, retryOfAttemptId?: string): Promise<VenueScene> {
    return coordinateVenue(id, "close", "close", {}, undefined, retryOfAttemptId, () => closeVenueSessionOnce(id));
  }

  /** Close the Scene and return its committed visible changes. */
  async function endVenueSessionWithReceipts(id: string, retryOfAttemptId?: string) {
    const session = await endVenueSession(id, retryOfAttemptId);
    return { session, recordEvents: await sceneReceipts(session) };
  }

  /** Archive the Scene after recovering saved exchange work; no closing review. */
  async function closeVenueSession(
    id: string,
    expectedSceneRevision?: number,
    retryOfAttemptId?: string,
    abandonOperationId?: string,
  ): Promise<VenueScene> {
    const scene = await readSession(id);
    if (
      scene.openingReader &&
      openingActive(await readVillageState()) &&
      scene.status !== "closed" &&
      (scene.status !== "active" ||
        !scene.activeIds.every((residentId) =>
          scene.lines.some((line) => line.kind === "dialogue" && line.speakerId === residentId),
        ))
    )
      throw conflict("Finish the gathering or skip the opening first.");
    if (
      scene.openingReader &&
      scene.status !== "closed" &&
      openingActive(await readVillageState()) &&
      !gatheringDialogueComplete(scene)
    )
      throw conflict("Finish the gathering or skip the opening first.");
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
        state.opening.stage = "conversations";
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
    return { session, recordEvents: await sceneReceipts(session) };
  }

  async function closeLiveScene(session: VenueScene): Promise<VenueScene> {
    const closed = await changeSession(session.id, (state) => {
      state.status = "closed";
      state.endedAt ||= villageNow().toISOString();
      state.endReason ||= "player";
    });
    await mutateVillageState((state) => releaseSceneWishes(state, closed));
    await clearActivePointer(session.id);
    await pruneVenueVisits();
    return closed;
  }

  /** Only saved local results can finish a deferred natural conclusion. */
  async function finishSemanticScene(id: string): Promise<void> {
    let scene = await readSession(id);
    for (const turn of scene.submissions.filter((row) => row.semanticProvenance?.version === 2 && !row.semanticReady)) {
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
      if (state.seed === session.villageSeed) delete state.sceneWishProtections?.[session.id];
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
      if (operation.kind === "greet")
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
    enterResidencePrivateSpace,
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
