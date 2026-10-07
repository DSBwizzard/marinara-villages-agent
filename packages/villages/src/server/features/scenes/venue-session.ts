import { sceneQueries } from "./services.js";
import { pruneVenueVisits } from "./archive.js";
import { decideVillageResidence, proposeVillageResidence } from "../venues/residences.js";
import { activationScope } from "../../adapters/engine/activation-scope.js";
import { sceneWork } from "./scene-work.js";
import {
  initialStaging,
  replayStaging,
  stagingLayout,
  stagingTranscriptEvents,
} from "../../../shared/helpers/scene-staging.js";
import { readEffectiveVillagerCard } from "../../adapters/engine/catalog.js";
import { readVillageLore } from "../../adapters/engine/lorebooks.js";
import {
  VILLAGES_PACKAGE_ID,
  villagesDebugAgentsEnabled,
  villagesDocuments,
  villagesLogger,
} from "../../adapters/engine/runtime-host.js";
import { villagesLanguageModels } from "../../adapters/models/language-models.js";
import { measurePipeline } from "../../adapters/observability/pipeline-metrics.js";
import { runtimeDebug } from "../../adapters/observability/runtime-debug.js";
import {
  assertVenueOwnership,
  outsideVenueOperation,
  venueOperationId,
  venueOperationInput,
  venueOperationSignal,
  venueOperationSnapshot,
  venueRefusal,
  venueRequestMetrics,
  venueSavedCheckpoint,
} from "../../adapters/operations/operation-context.js";
import { mutateDocument } from "../../adapters/storage/document-store.js";
import { changeSession, clearActivePointer, readActive, readSession } from "../../adapters/storage/scene-store.js";
import {
  ACTIVE_ID,
  SESSION_PREFIX,
  SESSION_KIND,
  activeSlot,
  sessionSlot,
} from "../../adapters/storage/scene-slots.js";
import { unfinishedExchange } from "../../domain/decoding/exchange-codec.js";
import { coerceSession } from "../../domain/decoding/scene-codec.js";
import type { InterpretationBatch } from "../../domain/models/interpretation-model.js";
import type {
  GreetingTrace,
  VenueLine,
  VenueRecollection,
  VenueRecordEvent,
  VenueReplyFailureKind,
  VenueReplyLine,
  VenueScene,
  VenueSubmission,
} from "../../domain/models/scene-model.js";
import type { VenueActionResult } from "../../domain/models/venue-action-model.js";
import type { WishCriteria } from "../../domain/models/wish-interpretation-model.js";
import type { VillageState, VillageVenue, VillageVenueClass } from "../../domain/models/world.js";
import { accessManagementPrompt } from "../../domain/rules/access-speech.js";
import { asRecord, asString, asTrimmedString } from "../../domain/rules/coerce.js";
import {
  badGateway,
  badRequest,
  conflict,
  notFound,
  safeFailureMessage,
  VillagesRequestError,
} from "../../domain/rules/errors.js";
import { extractJsonObject } from "../../domain/rules/json-reply.js";
import { selectPromptMemories, selectPromptRecollections } from "../../domain/rules/memory-selection.js";
import {
  VENUE_SCENE_WRITING_FOUNDATION,
  venueAdditionalWritingGuidance,
  venueWritingDirection,
} from "../../domain/rules/narration-style.js";
import { renderPlayerRoleWritingContext } from "../../domain/rules/player-role.js";
import { ingestSavedProgressEvent } from "../../domain/rules/progress-runtime.js";
import {
  bindProjectSpeech,
  projectSpeechContexts,
  projectSpeechPrompt,
} from "../../domain/rules/project-interpretation.js";
import { MAX_CHRONICLE_LENGTH, prependHappenings, villageCurrentSetting } from "../../domain/rules/prompt-preset.js";
import { relationshipZoneController } from "../../domain/rules/relationship-rules.js";
import {
  coerceResponseDiagnostics,
  responseDiagnostics,
  type ResponseDiagnostics,
  sceneMissingFields,
} from "../../domain/rules/response-diagnostics.js";
import { accessExits, captureSceneAttendance, sceneZoneOccupants } from "../../domain/rules/scene-attendance.js";
import { isInactive } from "../../domain/rules/scene-inactivity.js";
import { sceneProcessingSummary } from "../../domain/rules/scene-public.js";
import { appendLine, heardLines } from "../../domain/rules/scene-record.js";
import { extractSceneReply } from "../../domain/rules/scene-reply-json.js";
import { parseVenueReply, quietContactReply, savedAccessEvents } from "../../domain/rules/scene-reply.js";
import { applyInterpretedRoomEvents } from "../../domain/rules/scene-room-application.js";
import { describeSpriteExpressions, validateSpriteExpression } from "../../domain/rules/sprite-expressions.js";
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
  contactSpeech,
  readContactDelivery,
  readContactIntent,
  readContactMoves,
  readContactRelay,
  sceneAccessContext,
} from "../../domain/rules/venue-contact.js";
import { venueClasses, venueInArea, venueResidentIds } from "../../domain/rules/venue-model.js";
import { type MovementIntent, movementTransition, readPlayerMovement } from "../../domain/rules/venue-movement.js";
import { readVenueRequestCore } from "../../domain/rules/venue-requests.js";
import { buildVenueResponseContract } from "../../domain/rules/venue-response-contract.js";
import { venueFoundingBackground } from "../../domain/rules/venue-scene-context.js";
import {
  applyVenueSceneChange,
  physicalVenueEvents,
  readVenueSceneChange,
} from "../../domain/rules/venue-scene-state.js";
import { venueReplyIntegrity } from "../../domain/rules/venue-turn-integrity.js";
import {
  buildVenueSceneBlocks,
  fitVenueWritingMessages,
  venueCardProfile,
  type VenueWritingBlock,
} from "../../domain/rules/venue-writing.js";
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
import {
  knownWish,
  setWishJournalStatus,
  wishCheckKnowledge,
  wishConditionRevision,
} from "../../domain/rules/wish-journal.js";
import {
  metadataFailure,
  completionFailure as typedCompletionFailure,
  type WorkFailure,
} from "../../domain/rules/work-failure.js";
import {
  cancelVenueOperation,
  coordinateVenue,
  hasVenueOperation,
  recoverVenueOperations,
  rejectVenueCompletion,
  venueCheckpoint,
} from "../../jobs/venue-coordinator.js";
import {
  scheduleSystemComparisons,
  stopInterpretationComparisons,
  writeInterpretationDiagnostics,
} from "../generation/interpretation-diagnostics.js";
import { saveInterpretationContext } from "../generation/interpretation-evidence.js";
import { completeWithRoom } from "../generation/model-requests.js";
import {
  applyProjectPickup,
  finalizeProjectDiagnostics,
  interpretProjectDraft,
  projectProposals,
} from "../projects/project-checks.js";
import { processProjectSpeechTurn } from "../projects/project-evidence.js";
import { rollActiveAgendas } from "../residents/agenda-roll.js";
import {
  bindLiveProposals,
  createLiveEvidenceContext,
  LIVE_MEMORY_INSTRUCTION,
  liveEvidence,
  memoryVersion,
  mergeLiveReplyProposals,
  processLiveMemories,
  processLiveRelationships,
} from "../residents/live-memory.js";
import {
  filterRelationshipNotices,
  relationshipChangeNotices,
  relationshipWritingPrompt,
} from "../../domain/rules/relationship-presentation.js";
import {
  interpretWishClaim,
  matchingWishReceipts,
  wishFingerprint,
  wishReceiptRecords,
} from "../residents/wishes/wish-interpretation.js";
import { fulfillResidentWish } from "../residents/wishes/wish-lifecycle.js";
import {
  bindWishProposals,
  processProjectWishOutbox,
  processWishExchange,
  WISH_PROPOSAL_INSTRUCTION,
} from "../residents/wishes/wish-progress.js";
import { villagesConnectionIdFor } from "../settings/connections.js";
import { recordVillagerVenueImprovement } from "../venues/venue-mailbox.js";
import { mutateVillageState, readVillageSnapshot, readVillageState } from "../world/village-store.js";
import { queueVillageVenueRequest } from "../venues/venue-requests.js";
import { applyResidenceEditApproval } from "../venues/zone-edits.js";
import { memoryForVillager } from "./chat.js";
import { dispatchExchange } from "./exchange-processing.js";
import { interpretRoomReply } from "./room-interpretation.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { createHash, randomUUID } from "node:crypto";

export type {
  VenueLine,
  VenueParticipant,
  SceneAttendance,
  VenueSubmission,
  VenueMemory,
  VenueRecollection,
  VenueRecordEvent,
  VenueScene,
  VenueSession,
  ActiveVenue,
  GreetingTrace,
  VenueReplyFailureKind,
  VenueReplyLine,
  SavedAccessEvent,
} from "../../domain/models/scene-model.js";

export { venueCardProfile } from "../../domain/rules/venue-writing.js";

/** Older admitted requests retain their saved interaction contract during recovery. */
function explicitSceneActions(): boolean {
  const input = venueOperationInput();
  return !input || input.interactionScopeVersion === 1;
}
const VENUE_REPLY_MAX_TOKENS = 4_096;
const VENUE_REPLY_TEMPERATURE = 0.85;
const ACTIVITY_WRITE_MS = 15 * 1000;

/** The Scene document is the outbox. Village receipts are idempotent if the second write is interrupted. */
export async function processSavedProgressSubmission(sessionId: string, submissionId: string): Promise<void> {
  const village = await readVillageState();

  const session = await readSession(sessionId);
  const submission = session.submissions.find((entry) => entry.id === submissionId);
  if (
    !submission ||
    submission.movement ||
    submission.progressProcessedAt ||
    !submission.at ||
    (village.foundedAt && Date.parse(submission.at) < Date.parse(village.foundedAt))
  )
    return;
  try {
    await processProjectSpeechTurn(sessionId, submissionId);
    const hasAutomaticRoute = village.progressTasks.some((task) =>
      task.definition.phases[task.phaseIndex]?.requirements.some((requirement) =>
        requirement.routes.some(
          (route) =>
            route.automatic &&
            route.evidenceKinds?.some(
              (kind) => kind === "saved-resident-line" || (kind === "saved-venue-action" && !!submission.action),
            ),
        ),
      ),
    );
    if (hasAutomaticRoute)
      await mutateVillageState((state) => {
        if (state.seed !== village.seed) return;
        for (const line of session.lines) {
          if (
            submission.replyLineIds?.includes(line.id) &&
            !line.contactHidden &&
            !line.contactReport &&
            (submission.activeIdsAtTurn?.includes(line.speakerId) ||
              submission.speechIdsAtTurn?.includes(line.speakerId)) &&
            session.participants.some((person) => person.characterId === line.speakerId)
          )
            ingestSavedProgressEvent(state, {
              id: `visit:${sessionId}:${submissionId}:${line.id}`,
              kind: "saved-resident-line",
              at: submission.at!,
              sourceId: submissionId,
              lineId: line.id,
              speakerId: line.speakerId,
              venueId: session.placeId,
              area: submission.areaAtTurn,
              excerpt: line.content,
            });
        }
        if (submission.action)
          ingestSavedProgressEvent(state, {
            id: `visit-action:${sessionId}:${submissionId}`,
            kind: "saved-venue-action",
            at: submission.at!,
            sourceId: submissionId,
            venueId: session.placeId,
            area: submission.areaAtTurn,
            excerpt: submission.message,
          });
      });
    await changeSession(sessionId, (saved) => {
      const turn = saved.submissions.find((entry) => entry.id === submissionId);
      if (turn) {
        turn.progressProcessedAt ||= new Date().toISOString();
        turn.progressError = "";
      }
    });
  } catch (error) {
    await changeSession(sessionId, (saved) => {
      const turn = saved.submissions.find((entry) => entry.id === submissionId);
      if (turn && !turn.progressProcessedAt) turn.progressError = String(error).slice(0, 300);
    });
    throw error;
  }
}

/** Replay only saved interpretations. Effects and duplicate receipts remain in their owning documents. */
export async function processSavedExchange(sessionId: string, submissionId: string): Promise<void> {
  return measurePipeline("saved exchange", { sceneId: sessionId, submissionId }, () =>
    applySavedExchange(sessionId, submissionId),
  );
}
async function applySavedExchange(sessionId: string, submissionId: string): Promise<void> {
  const scene = await readSession(sessionId);
  const turn = scene.submissions.find((entry) => entry.id === submissionId);
  if (turn?.accessEvents?.length) await applySavedAccessEvents(scene, turn);
  if (turn?.invitationSignal) await recordSpokenInvitation(scene, turn.invitationSignal);
  if (turn?.movement) return;
  if (!turn?.processing) return processSavedProgressSubmission(sessionId, submissionId);
  const village = await readVillageState();
  const processing = turn.processing;
  const evidenceContext = turn.liveProposals ? createLiveEvidenceContext(scene, turn.liveProposals) : undefined;
  const exchangeLineIds = new Set(processing.lineIds);
  const valid =
    village.seed === processing.seed &&
    scene.villageSeed === village.seed &&
    processing.sceneId === scene.id &&
    processing.submissionId === turn.id;
  const applyProjects = async () => {
    if (!valid) return { status: "rejected" as const, reason: "Village identity changed; saved effects cannot apply" };
    await applyVenueTurnChange(scene, turn);
    if (
      turn.physicalOutcomeVersion &&
      !physicalVenueEvents(await readVillageState()).some(
        (event) => event.id === `venue-chat:${scene.id}:${turn.id}` && event.actionReceipt?.happened,
      )
    )
      return { status: "rejected" as const, reason: "The physical outcome no longer meets current state restrictions" };
    if (turn.physicalOutcomeVersion && turn.action?.happened) await applyProjectPickup(scene.id, turn.id);
    await processSavedProgressSubmission(scene.id, turn.id);
    const current = await readVillageState();
    const receiptIds = current.progressTasks.flatMap((task) =>
      task.receipts
        .filter(
          (receipt) => receipt.evidence.sourceId === turn.id || exchangeLineIds.has(receipt.evidence.lineId ?? ""),
        )
        .map((receipt) => receipt.id),
    );
    return { reason: "Physical effects and saved Project interpretations checked", receiptIds };
  };
  const updates = new Map<keyof typeof processing.domains, typeof processing.domains.projects>();
  await dispatchExchange(
    processing,
    {
      projects: applyProjects,
      wishes: async () => {
        if (!valid) return { status: "rejected", reason: "Village identity changed" };
        if (
          turn.physicalOutcomeVersion &&
          !physicalVenueEvents(await readVillageState()).some(
            (event) => event.id === `venue-chat:${scene.id}:${turn.id}` && event.actionReceipt?.happened,
          )
        )
          return updates.get("projects")?.status === "rejected"
            ? { status: "rejected", reason: "Physical outcome rejected" }
            : { status: "pending", reason: "Waiting for the physical effect and receipt to commit" };
        return processWishExchange(scene, turn.id);
      },
      memories: async () =>
        valid
          ? processLiveMemories(scene, turn.id, evidenceContext)
          : { status: "rejected", reason: "Village identity changed" },
      relationships: async () =>
        valid
          ? processLiveRelationships(scene, turn.id, evidenceContext)
          : { status: "rejected", reason: "Village identity changed" },
    },
    async (domain, result) => {
      updates.set(domain, result);
      runtimeDebug("exchange processing", {
        sceneId: sessionId,
        submissionId,
        domain,
        interpretationVersion: processing.interpretationVersion,
        ...result,
      });
    },
  );
  const recordEvents = await receiptForTurn(scene, turn, false);
  if (updates.size)
    await changeSession(scene.id, (saved) => {
      const entry = saved.submissions.find((entry) => entry.id === turn.id);
      if (entry?.processing?.seed !== processing.seed) return;
      entry.recordEvents = recordEvents;
      for (const [domain, result] of updates) {
        const prior = entry.processing.domains[domain];
        if (
          (prior.status === "applied" || prior.status === "rejected") &&
          (result.status === "pending" || result.status === "failed")
        )
          continue;
        entry.processing.domains[domain] = result;
      }
    });
}

/** Privileged diagnostics use the saved record only. A read never starts interpretation or recovery. */
export async function readSceneChanges(id: string, cursor = "", limit = 20) {
  const scene = await readSession(id);
  const village = await readVillageSnapshot();
  if (scene.villageSeed && scene.villageSeed !== village.seed)
    throw conflict("This Scene belongs to a previous village.");
  const parts = (cursor || "0:0").split(":").map(Number);
  if (parts.length > 3 || parts.some((part) => !Number.isSafeInteger(part) || part < 0))
    throw badRequest("Invalid changes cursor.");
  const [afterScene, afterNotice = 0, afterRelationship = 0] = parts;
  const size = Math.max(1, Math.min(50, Math.floor(Number(limit) || 20)));
  const changed = scene.submissions
    .map((turn, index) => ({ turn, sequence: turn.changeSequence || index + 1 }))
    .filter((entry) => entry.sequence > afterScene)
    .sort((a, b) => a.sequence - b.sequence);
  const turns = changed.slice(0, size);
  const effects = Object.values(village.exchangeReceipts);
  const effectsBySubmission = new Map<string, typeof effects>();
  for (const receipt of effects)
    if (receipt.sceneId === id) {
      const rows = effectsBySubmission.get(receipt.submissionId) ?? [];
      rows.push(receipt);
      effectsBySubmission.set(receipt.submissionId, rows);
    }
  const projectReceiptIndex = new Map(
    village.progressTasks.flatMap((task) => task.receipts.map((receipt) => [receipt.id, receipt] as const)),
  );
  const notices = effects
    .filter(
      (receipt) =>
        receipt.notice &&
        (receipt.noticeSequence ?? 0) > afterNotice &&
        !village.dismissedNoticeIds.includes(receipt.id),
    )
    .sort((a, b) => (a.noticeSequence ?? 0) - (b.noticeSequence ?? 0));
  const page = notices.slice(0, size);
  const relationshipState = village.relationshipContext;
  const relationshipReceipts = Object.values(relationshipState?.receipts ?? {})
    .filter((receipt) => (receipt.noticeSequence ?? 0) > afterRelationship)
    .sort((a, b) => a.noticeSequence! - b.noticeSequence!);
  const relationshipPage = relationshipReceipts.slice(0, size);
  const relationshipNotices = relationshipState
    ? relationshipChangeNotices(relationshipPage, relationshipState, village).filter(
        (event) => !village.dismissedNoticeIds.includes(event.id),
      )
    : [];
  const relationshipCursor =
    relationshipReceipts.length > relationshipPage.length
      ? relationshipPage.at(-1)!.noticeSequence!
      : (relationshipState?.noticeSequence ?? afterRelationship);
  const backgroundChecks = (await villagesDocuments().list(VILLAGES_PACKAGE_ID, "background-work"))
    .map((record) => asRecord(record.data))
    .filter(
      (job) =>
        job.seed === village.seed &&
        job.kind === "wish-check" &&
        (asRecord(job.input).sceneId === id || String(job.subjectId).startsWith(`wish-change:${id}:`)),
    )
    .slice(0, 50)
    .map((job) => ({
      id: job.id,
      subjectId: job.subjectId,
      status: job.status,
      requests: job.requests,
      tokens: job.usageComplete ? job.tokens : null,
      error: job.error,
    }));
  const sceneCursor = turns.at(-1)?.sequence ?? afterScene;
  const noticeCursor = notices.length > page.length ? page.at(-1)!.noticeSequence! : village.noticeSequence;
  return {
    sceneId: id,
    backgroundChecks,
    notificationDelivery: [...page, ...relationshipPage]
      .filter((receipt) => receipt.committedAt)
      .map((receipt) => ({
        receiptId: receipt.id,
        committedAt: receipt.committedAt,
        commitToFeedMs: Math.max(0, Date.now() - Date.parse(receipt.committedAt!)),
      })),
    activeRequest: {
      status: scene.operation?.status,
      error: scene.operation?.error,
      failure: scene.operation?.failure,
      requests: venueRequestMetrics(scene.operation),
    },
    changes: turns.map(({ turn }) => ({
      submissionId: turn.id,
      at: turn.at,
      processing: turn.processing ?? null,
      receipts: {
        physical: turn.action ?? null,
        movement: turn.movement ?? null,
        domainEffects: effectsBySubmission.get(turn.id) ?? [],
        relationships: (turn.processing?.domains.relationships.receiptIds ?? []).flatMap((id) =>
          relationshipState?.receipts[id] ? [relationshipState.receipts[id]] : [],
        ),
        projects: (turn.processing?.domains.projects.receiptIds ?? []).flatMap((id) =>
          projectReceiptIndex.has(id) ? [projectReceiptIndex.get(id)!] : [],
        ),
        memories: village.chronicle.filter(
          (memory) =>
            memory.sourceVisitId === id &&
            memory.sourceLineIds?.some((lineId) => turn.processing?.lineIds.includes(lineId)),
        ),
      },
      requests: turn.requestMetrics ?? null,
      responseDiagnostics: coerceResponseDiagnostics(turn.liveProposals?.responseDiagnostics) ?? null,
      interpretationHistory: turn.interpretationHistory ?? [],
      notices: filterRelationshipNotices(turn.recordEvents ?? [], village.relationshipContext)
        .filter(
          (event) =>
            event.kind !== "wish" ||
            (!!event.wishUpdate &&
              village.villagers.some((person) => knownWish(village, person.characterId, event.wishUpdate!.wishId))),
        )
        .filter((event) => !village.dismissedNoticeIds.includes(event.id)),
      evidence: scene.lines.filter(
        (line) => turn.processing?.lineIds.includes(line.id) || turn.liveProposals?.earlierLineIds.includes(line.id),
      ),
      interpretations: {
        source: turn.movement
          ? "confirmed movement; code transition"
          : (turn.interpretationHistory?.at(-1)?.source ?? "saved narration reply"),
        version: turn.processing?.interpretationVersion,
        memory: turn.liveProposals?.memoryChanges,
        relationship: turn.liveProposals?.relationshipChanges,
        wishes: turn.wishProposals,
        memoryVersions: turn.liveProposals?.memoryVersions,
      },
    })),
    notices: filterRelationshipNotices(
      [...page.flatMap((receipt) => (receipt.notice ? [receipt.notice] : [])), ...relationshipNotices],
      village.relationshipContext,
    ),
    dismissedNoticeIds: village.dismissedNoticeIds,
    unresolved: scene.submissions
      .flatMap((turn) =>
        Object.entries(turn.processing?.domains ?? {})
          .filter(([, result]) => result.status === "failed")
          .map(([domain, result]) => ({
            submissionId: turn.id,
            domain,
            reason:
              result.failure?.cause === "missing_result" || result.failure?.cause === "output_limit"
                ? "Required response metadata is missing or incomplete. Replay cannot reconstruct it; explicitly retry interpretation."
                : "Saved changes could not be applied. Replay saved work first; inspect saved diagnostics if it persists.",
          })),
      )
      .slice(0, 50),
    processingSummary: sceneProcessingSummary(scene),
    nextCursor: `${sceneCursor}:${noticeCursor}:${relationshipCursor}`,
    hasMore:
      changed.length > turns.length ||
      notices.length > page.length ||
      relationshipReceipts.length > relationshipPage.length,
  };
}

export async function dismissSceneNotice(id: string, noticeId: string) {
  const scene = await readSession(id),
    village = await readVillageState();
  if (scene.villageSeed && scene.villageSeed !== village.seed) throw conflict("Village identity changed.");
  const known =
    scene.submissions.some((turn) => turn.recordEvents?.some((event) => event.id === noticeId)) ||
    !!village.exchangeReceipts[noticeId]?.notice ||
    !!(
      village.relationshipContext &&
      relationshipChangeNotices(
        Object.values(village.relationshipContext.receipts).filter((receipt) => receipt.id === noticeId),
        village.relationshipContext,
        village,
      ).length
    );
  if (!known) throw notFound("That saved notice is unavailable.");
  await mutateVillageState((state) => {
    if (state.seed !== village.seed) throw conflict("Village identity changed.");
    if (!state.dismissedNoticeIds.includes(noticeId)) state.dismissedNoticeIds.push(noticeId);
  });
  return { dismissed: true };
}

/** An explicit free recovery request applies saved results only. */
export async function replaySceneChanges(id: string) {
  const scene = await readSession(id);
  for (const turn of scene.submissions.filter((turn) => turn.processing && unfinishedExchange(turn.processing)))
    await processSavedExchange(id, turn.id);
  return readSceneChanges(id);
}

/** Only this explicit request may replace missing/invalid metadata with another interpretation. */
export async function retrySceneChangeInterpretation(
  id: string,
  submissionId: string,
  domain: "memories" | "relationships" | "wishes",
  retryOfAttemptId?: string,
) {
  return coordinateVenue(
    id,
    `change:${submissionId}:${domain}`,
    "change-interpretation",
    { submissionId, domain },
    undefined,
    retryOfAttemptId,
    () => retrySceneChangeInterpretationOnce(id, submissionId, domain),
  );
}

async function retrySceneChangeInterpretationOnce(
  id: string,
  submissionId: string,
  domain: "memories" | "relationships" | "wishes",
) {
  await processSavedExchange(id, submissionId);
  const scene = await readSession(id),
    turn = scene.submissions.find((turn) => turn.id === submissionId);
  if (!turn?.processing || !turn.liveProposals) throw badRequest("No saved live exchange to interpret.");
  if (turn.processing.domains[domain].status !== "failed") return readSceneChanges(id);
  const village = await readVillageState();
  if (village.seed !== scene.villageSeed) throw conflict("Village identity changed.");
  const proposals = turn.liveProposals;
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
      const { retryBackgroundJob } = await import("../../jobs/background-work.js");
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
    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const messages: CapabilityLanguageModelMessage[] = [
      {
        role: "system",
        content: `Interpret ONLY the supplied saved exchange for ${domain}. Do not rewrite narration, change physical state, or invent evidence. ${domain === "wishes" ? WISH_PROPOSAL_INSTRUCTION : LIVE_MEMORY_INSTRUCTION} Use exact saved evidence IDs, not numeric indexes. Return JSON only.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          evidence: liveEvidence(scene, proposals).filter(
            (line) =>
              domain !== "wishes" || line.id === proposals.playerLineId || proposals.replyLineIds.includes(line.id),
          ),
          residents: village.villagers.map((person) => ({ id: person.characterId, name: person.cardSnapshot.name })),
          memories,
          wishes: (turn.wishContexts ?? []).flatMap((context) => {
            const wish = village.villagers
              .find((person) => person.characterId === context.actorId)
              ?.agenda?.wishes.find(
                (wish) => wish.id === context.wishId && wishFingerprint(wish) === context.fingerprint,
              );
            return wish ? [{ ...context, text: wish.wish }] : [];
          }),
          zones: village.venues.map((venue) => ({ id: venue.id, zones: venueZones(venue) })),
          zoneControllers: village.venues.flatMap((venue) =>
            venueZones(venue).map((zone) => ({
              venueId: venue.id,
              zoneId: zone.id,
              controllerIds: zoneControllerIds(venue, zone),
            })),
          ),
        }),
      },
    ];
    const fitted = model.fitContext(messages, { maxTokens: VENUE_REPLY_MAX_TOKENS });
    const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? VENUE_REPLY_MAX_TOKENS, {
      responseFormat: { type: "json_object" },
      temperature: 0,
      reasoningEffort: null,
      verbosity: null,
      debugMode: false,
      signal: venueOperationSignal(),
      retryEmpty: false,
    });
    const raw = extractJsonObject(completion.content ?? "");
    const diagnostics = responseDiagnostics(model, completion, fitted.maxTokens ?? VENUE_REPLY_MAX_TOKENS, raw);
    const value =
      domain === "memories" ? raw?.memoryChanges : domain === "wishes" ? raw?.wishChanges : raw?.relationshipChanges;
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
      throw Object.assign(badGateway(message), { failure: { ...failure, responseDiagnostics: diagnostics } });
    }
    return {
      value,
      responseDiagnostics: diagnostics,
      memoryVersions: Object.fromEntries(memories.map((memory) => [memory.id, memoryVersion(memory)])),
      requests: venueRequestMetrics(),
    };
  });
  await changeSession(id, (saved) => {
    if (saved.villageSeed !== village.seed) throw conflict("Village identity changed.");
    const entry = saved.submissions.find((turn) => turn.id === submissionId)!;
    if (!entry.liveProposals || entry.processing?.domains[domain].status !== "failed") return;
    entry.interpretationHistory ||= [];
    entry.interpretationHistory.push({
      at: turn.at ?? "",
      domain,
      source: "saved narration reply",
      proposals:
        domain === "wishes"
          ? entry.wishProposals
          : entry.liveProposals[domain === "memories" ? "memoryChanges" : "relationshipChanges"],
    });
    entry.interpretationHistory.push({
      at: new Date().toISOString(),
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
      );
      entry.wishProposals = bound.proposals;
      entry.wishProposalError = bound.error;
    } else entry.liveProposals[domain === "memories" ? "memoryChanges" : "relationshipChanges"] = result.value;
    entry.liveProposals.memoryVersions = result.memoryVersions;
    entry.requestMetrics = [...(entry.requestMetrics ?? []), ...(result.requests ?? [])];
    entry.processing.domains[domain].status = "pending";
  });
  await processSavedExchange(id, submissionId);
  return readSceneChanges(id);
}

/** One startup scan, then bounded asynchronous batches; never part of the minute snapshot. */
export function startProgressRecovery(): () => void {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const start = async () => {
    try {
      await processProjectWishOutbox();
      const queue = await sceneQueries().progressBacklog();
      const batch = async () => {
        for (const turn of queue.splice(0, 8)) {
          if (stopped) return;
          try {
            await processSavedExchange(turn.sessionId, turn.submissionId);
          } catch (error) {
            villagesLogger().warn("[villages] progress replay failed for %s: %s", turn.submissionId, String(error));
          }
        }
        if (!stopped && queue.length) timer = setTimeout(() => void batch(), 25);
      };
      if (!stopped && queue.length) timer = setTimeout(() => void batch(), 0);
    } catch (error) {
      villagesLogger().warn("[villages] progress recovery could not read visits: %s", String(error));
    }
  };
  void start();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}

/** Do not disclose occupants of unseen Zones, including inside operation snapshots/checkpoints. */

class VenueReplyFailure extends Error {
  constructor(
    readonly kind: VenueReplyFailureKind,
    readonly failure?: WorkFailure,
  ) {
    super(kind);
  }
}

/** Assemble and fit the exact live request without making a generation call. */
export async function prepareVenueTurnMessages(
  session: VenueScene,
  message: string,
  mode: "greet" | "chat" | "ask" | "fulfill" | "act" | "leave",
  targetId: string,
  settled: { fulfilled: boolean; wish: string; unresolved?: boolean; reason?: string } | null,
  signal?: AbortSignal,
  trace?: GreetingTrace,
  actionOutcome?: string,
) {
  const preparationStarted = performance.now();
  const [village, connectionId] = await Promise.all([readVillageState(), villagesConnectionIdFor("narration")]);
  signal?.throwIfAborted();
  trace?.("preparation", performance.now() - preparationStarted);
  const player = readPlayerIdentity(village);
  const now = new Date();
  const moment = deriveVillageMoment({
    foundedAt: village.foundedAt,
    seed: village.seed,
    now: session.sceneAttendance ? new Date(session.sceneAttendance.capturedAt) : new Date(session.startedAt),
  });
  const audibleIds = session.contactGeneration
    ? [...session.contactGeneration.localIds, ...session.contactGeneration.remoteIds]
    : session.activeIds;
  const active = session.participants.filter((person) => audibleIds.includes(person.characterId));
  const memoryQuery = `${session.placeName} ${message}`;
  const promptMemories = selectPromptMemories(
    village.chronicle,
    active.map((person) => person.characterId),
    memoryQuery,
    600,
  );
  const promptRecollections = selectPromptRecollections(
    village.recollections,
    active.map((person) => person.characterId),
    memoryQuery,
    400,
    now.getTime(),
  );

  // Only these exact witnessed lines and memory versions can support a saved proposal.
  const earlierEvidence = session.lines
    .filter((line) => !line.contactReport && line.heardBy.some((id) => audibleIds.includes(id)))
    .slice(-18);
  const memoryContext =
    "Selected witnessed memories (each listed once; only the named audience knows private entries; shared entries are village knowledge): " +
    JSON.stringify([
      ...promptMemories.map((memory) => ({
        kind: "durable",
        id: memory.id,
        text: memory.text,
        audience:
          memory.scope === "village"
            ? "village"
            : (memory.knownByCharacterIds ?? memory.actors.map((actor) => actor.id)),
        version: memoryVersion(memory),
      })),
      ...promptRecollections.map((memory) => ({
        kind: "passing",
        id: memory.id,
        text: memory.text,
        audience: memory.knownByCharacterIds,
        version: memory.lastReinforcedAt ?? memory.id,
      })),
    ]);
  const optionalKnowledge: VenueWritingBlock[] = [{ text: memoryContext, optional: "memory" }];
  const residentContexts: string[] = [];
  const expressionContexts: string[] = [];
  const profiles = active.map((person) => {
    const resident = village.villagers.find((entry) => entry.characterId === person.characterId);
    if (!resident) return `${person.name} (${person.characterId}): no longer resident.`;
    const card = readEffectiveVillagerCard(resident);
    const sceneOccupant = session.sceneAttendance?.occupants.find((entry) => entry.characterId === person.characterId);
    const spriteLabels = describeSpriteExpressions(resident.sprite);

    residentContexts.push(
      [
        `${card.name} (${person.characterId})`,
        relationshipWritingPrompt(village, person.characterId),
        `Activity captured at Scene start: ${sceneOccupant?.doing || person.doing || "unspecified"}; availability at Scene start: ${sceneOccupant?.availability || "unspecified"}.`,
        `Current Residence: ${
          village.venues
            .filter((venue) => venueResidentIds(venue).includes(person.characterId))
            .map((venue) => `${venue.name} (${venue.id})`)
            .join(", ") || "none"
        }.`,
        `Private current desires of ${card.name}: ${resident.agenda?.wishes.map((wish) => `[${wish.id}] ${wish.wish}`).join("; ") || "none"}. These can inform a relevant choice; they require no gesture, hint, mention, or player errand.`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    if (spriteLabels)
      expressionContexts.push(
        `Filled expressions for ${card.name}: ${spriteLabels}. Select a listed expression id using its meaning. Pose-specific pictures must match actions already occurring in the scene. Omit expression to use the default image.`,
      );
    return venueCardProfile(card, player.name, false);
  });
  const stageIds = session.participants
    .filter((person) => session.activeIds.includes(person.characterId))
    .map((person) => person.characterId);
  const stage = replayStaging(
    stageIds,
    stagingTranscriptEvents(
      session.lines.filter((line) => !session.zoneId || !line.zoneId || line.zoneId === session.zoneId),
      session.submissions,
    ),
  ).at(-1)?.state;
  const stageState = stage ?? initialStaging(stageIds);
  const layout = stagingLayout(session.activeIds, stageState);
  const audience = active.map((person) => person.characterId);
  const storedPlace = village.venues.find((venue) => venue.id === session.placeId);
  const place = storedPlace
    ? session.zoneId
      ? venueInZone(storedPlace, session.zoneId)
      : venueInArea(storedPlace, session.area, session.spaceClass, session.privateOwnerId)
    : undefined;
  const pendingMoves = village.residences.filter(
    (residence) => residence.status === "pending" && audience.includes(residence.characterId),
  );
  // Prose Events are visual only. Verified player deeds have separate receipts.
  const recentHappenings = village.venueEvents
    .filter(
      (entry) =>
        entry.venueId === session.placeId &&
        (!session.zoneId || entry.zoneId === session.zoneId) &&
        now.getTime() - Date.parse(entry.at) <= 3 * 24 * 60 * 60 * 1000,
    )
    .slice(0, 4);
  const loreStarted = performance.now();
  const lorePromise = readVillageLore(
    village.selectedLorebookIds,
    [villageCurrentSetting(village), session.placeName, active.map((person) => person.name).join(", "), message].join(
      "\n",
    ),
    signal,
    village.loreTokenBudget,
  ).then((value) => {
    trace?.("lore", performance.now() - loreStarted);
    return value;
  });
  const resolutionStarted = performance.now();
  const modelPromise = villagesLanguageModels()
    .resolveForRequest({ connectionId })
    .then((value) => {
      trace?.("model resolution", performance.now() - resolutionStarted, `${value.model} (${value.connectionId})`);
      return value;
    });
  const [lore, model] = await Promise.all([lorePromise, modelPromise]);
  signal?.throwIfAborted();
  const projectContexts =
    mode === "chat" || mode === "ask"
      ? projectSpeechContexts(
          village,
          audience,
          `${session.lines
            .filter(
              (line) =>
                (!line.zoneId || line.zoneId === session.zoneId) && audience.every((id) => line.heardBy.includes(id)),
            )
            .slice(-12)
            .map((line) => line.content)
            .join("\n")}\n${message}`,
          message,
          session.placeId,
        )
      : [];
  const pendingEdits = (storedPlace?.editProposals ?? []).filter(
    (proposal) =>
      !proposal.declined &&
      (!proposal.zoneId || proposal.zoneId === session.zoneId) &&
      (proposal.zoneId === session.zoneId ||
        proposal.target === "shared" ||
        proposal.ownerId === session.privateOwnerId),
  );
  const earlierContext =
    "Earlier evidence: " +
    JSON.stringify(
      earlierEvidence.map((line) => ({
        id: line.id,
        speakerId: line.role === "user" ? "player" : line.speakerId,
        kind: line.kind,
        heardBy: line.heardBy,
        text: line.content.slice(0, 500),
      })),
    );
  const blocksFor = (parts: string[]): VenueWritingBlock[] =>
    parts.map((text) => ({
      text,
      optional:
        optionalKnowledge.find((block) => block.text === text)?.optional ??
        (/^(Recent scene history:|Earlier Scene recap:)/u.test(text)
          ? "history"
          : /^(Shared village memories:|Only .* knows:)/u.test(text)
            ? "memory"
            : text.startsWith("Relevant world lore:")
              ? "lore"
              : undefined),
    }));
  const blocks = buildVenueSceneBlocks({
    direction: blocksFor([
      VENUE_SCENE_WRITING_FOUNDATION,
      venueWritingDirection(village.narrationStyle, player.name),
      venueAdditionalWritingGuidance(village.narrationStyle),
      mode === "greet"
        ? ""
        : "The latest player message is a completed turn. Continue after it. Never speak for the player, quote their words back as a resident, or replay a resident question they have just answered.",
      mode === "greet"
        ? "Open on a specific moment already underway in this place. Follow the residents' current activities, relationships, and cards. Do not force a welcome or a question to the player. If nobody speaks, show an observable action or change rather than generic atmosphere."
        : "",
      mode === "leave"
        ? "The player has chosen to leave now. Write a brief, grounded closing exchange: let someone present answer or say goodbye aloud, or narrate only that chosen departure if the room is empty. Do not invent the player's goodbye, further actions, or a new errand."
        : "",
    ]),
    identity: blocksFor([...profiles]),
    circumstances: blocksFor([
      `You write one shared scene in ${session.placeName}, ${village.name}. It is ${moment.localTime}. ${villageCurrentSetting(village)}`,
      `The player is ${player.name}. ${player.description}`,
      renderPlayerRoleWritingContext(village),
      session.contactGeneration?.instruction ?? "",
      `Zone: ${storedPlace ? (resolveVenueZone(storedPlace, session.zoneId ?? "")?.name ?? session.area) : session.area} (${session.zoneId ?? "legacy"}). Venue Class: ${place ? venueClasses(place).join(" / ") : "other"}. Form: ${place?.form ?? ""}. Current condition: ${place?.state.condition ?? ""}. Defining features: ${place?.state.features?.map((feature) => `${feature.id}: ${feature.text}${feature.locked ? " [locked]" : ""}`).join("; ") || "none"}. Visible traces: ${
        place?.state.traces
          ?.filter(
            (trace) => trace.kind !== "note" && (!trace.expiresAt || Date.parse(trace.expiresAt) > now.getTime()),
          )
          .map((trace) => `${trace.id}: ${trace.text}`)
          .join("; ") || "none"
      }. Items: ${place?.state.furniture.join("; ") || "none"}. Public facts: ${place?.state.publicFacts.join("; ") ?? ""}. Current state outranks older scene lines and happenings.`,
      `Approved room description: ${place?.description || "none"}. Structural Upgrades in this zone: ${
        place?.improvements
          ?.filter(Boolean)
          .map((upgrade) => upgrade!.title + ": " + upgrade!.description)
          .join("; ") || "none"
      }.`,
      place?.constructionStatus === "worksite"
        ? "This is an incomplete exterior-only worksite. Its project ledger and resident work order determine completion; neither player narration nor this scene can finish it or open its interior."
        : "",
      `Recent verified venue actions: ${recentHappenings.map((entry) => entry.text).join("; ") || "none"}`,
      accessManagementPrompt(village, audience, session.placeId),
      venueFoundingBackground(village),
      `A Venue is the place; Zones are its separate spaces, including Exterior, Common Space, and Private Space. A Scene is the whole active conversation in that Venue, continuing across Zone movement. The residents currently here are: ${audience.join(", ")}. Only server-listed residents occupy this Zone. Attendance and activities were captured at Scene start across the entire Venue. Scene-start activities describe the opening situation; witnessed developments establish what is happening now. Background agendas cannot add, remove, or move anyone during this Scene. Only evidenced movement within the Scene changes positions. A resident may leave after a clear spoken departure. Do not force a departure merely because real time passed.`,
      session.area === "outside"
        ? session.spaceClass === "residence"
          ? session.contactGeneration || !explicitSceneActions()
            ? "The player is in this Residence's Exterior Zone, outside its interior. A resident inside may answer, remain busy, sleep through the attempt, or ignore it. Show only what the player can observe from this Zone. Never describe the player entering the Common Space or a private space without validated permission. Do not expose unseen interior details."
            : "The player is in this Residence's Exterior Zone. Say / Do reaches only its current physical occupants. Use Contact to attempt attention in an adjacent Zone. Show only what the player can observe here; never invent interior replies, disclose unseen details or narrate entering another Zone."
          : "The player is in this Venue's Exterior Zone. Show only what they can observe from this Zone; do not describe them entering an interior."
        : active.length
          ? "Only the named residents may speak. Do not disclose one resident's private knowledge through another. When the player addresses someone, respond to what they said; silence alone is neither consent nor a generic substitute for an answer. Quoted dialogue is not required because each segment has an explicit kind."
          : "Nobody is present. Write one grounded scene narration, with no resident dialogue or invented witnesses.",
      ...residentContexts,
      projectSpeechPrompt(village, projectContexts),
      session.pendingProjectQuestions?.length
        ? `These Project matters remain unresolved: ${session.pendingProjectQuestions.join("; ")}. Clarify naturally; do not assume approval, commitment, or complete requirements. Do not demand formal wording.`
        : "",
      session.pendingRoomQuestions?.length
        ? `These room matters remain unresolved: ${session.pendingRoomQuestions.join("; ")}. Resolve them through natural contextual clarification before reacting as though permission or dismissal were established. Do not ask for formal permission wording.`
        : "",
      `Available venues for a requested move: ${
        village.venues
          .filter(
            (venue) =>
              venue.constructionStatus !== "worksite" &&
              !venue.occupancy.playerHome &&
              !venue.occupancy.residentCharacterId,
          )
          .map((venue) => `${venue.id}: ${venue.name}`)
          .join("; ") || "none"
      }.`,
      pendingMoves.some((move) => move.requestedBy === "player")
        ? `Pending player requests to move: ${pendingMoves
            .filter((move) => move.requestedBy === "player")
            .map((move) => `${move.characterId} to ${move.proposedVenueId}`)
            .join("; ")}.`
        : "",
      pendingEdits.length
        ? `Pending exact Residence edit proposals: ${pendingEdits.map((proposal) => `${proposal.id}: ${proposal.target} ${proposal.ownerId || "shared"}; description ${proposal.proposed.description}; condition ${proposal.proposed.state.condition}; items ${proposal.proposed.state.items.join(", ")}; public facts ${proposal.proposed.state.publicFacts.join(", ")}; features ${proposal.proposed.state.features.map((feature) => feature.text).join(", ")}; required ${proposal.requiredIds.join(", ")}; approved ${proposal.approvedIds.join(", ")}`).join(" | ")}`
        : "",
      actionOutcome
        ? `The action was checked separately. Its settled outcome is: ${actionOutcome}. React to this outcome; do not redo or contradict the action judgment.`
        : "",
      `Turn: ${mode}. Intended target: ${targetId || "anyone here"}. ${settled === null ? "" : settled.unresolved ? `The wish remains unresolved: ${settled.reason || "meaning or evidence is unclear"}. Clarify naturally through ordinary dialogue. Do not narrate a refusal or fulfillment as established.` : settled.fulfilled ? `A checked wish was fulfilled for ${targetId}: ${settled.wish}.` : "The claim was checked and did not fulfill a wish."}`,
    ]),
    conversation: blocksFor([
      `Relevant world lore: ${lore.join("\n") || "none"}`,
      ...optionalKnowledge.map((block) => block.text),
      ...active.flatMap((person) =>
        (village.wishKnowledge[person.characterId] ?? [])
          .filter((entry) => entry.status === "active")
          .map(
            (entry) =>
              `Player-known wish discoveries for ${person.characterId}/${entry.wishId}: ${JSON.stringify(
                (entry.facts ?? [])
                  .filter((fact) => !fact.supersededBy)
                  .slice(-8)
                  .map(({ id, kind, quote }) => ({ id, kind, quote })),
              )}`,
          ),
      ),
      `Earlier Scene recap: ${session.recap || "none"}. The recap may name who heard a private exchange.`,
      "",
      earlierContext,
    ]),
    authoredInstructions: blocksFor([
      ...active.map((person) => {
        const resident = village.villagers.find((entry) => entry.characterId === person.characterId);
        const card = resident ? readEffectiveVillagerCard(resident) : null;
        return card?.postHistoryInstructions
          ? `Authored post-history instructions for ${card.name}:\n${card.postHistoryInstructions.replace(/\{\{char\}\}/gi, card.name).replace(/\{\{user\}\}/gi, player.name)}`
          : "";
      }),
    ]),
    metadata: blocksFor(
      buildVenueResponseContract({
        opening: mode === "greet",
        conversational: mode === "chat" || mode === "ask",
        liveMemory: true,
        residentControlled:
          session.area === "shared" ||
          session.area === "private" ||
          !!(
            storedPlace && zoneControllerIds(storedPlace, resolveVenueZone(storedPlace, session.zoneId ?? "")!).length
          ),
        recapNeeded: session.lines.length >= 12,
        staging: session.stagingVersion === 1,
        projects: projectContexts.length > 0,
        exampleSpeakerId: stageIds[0],
        exampleWitnessIds: stageIds,
        explicitActions: explicitSceneActions(),
        contactAction: !!session.contactGeneration,
        contactFacts:
          !explicitSceneActions() && !session.contactGeneration && (mode === "chat" || mode === "ask") && storedPlace
            ? `Known villagers (not attendance): ${village.villagers.map((person) => `${person.characterId}: ${person.cardSnapshot.name}`).join("; ")}. Adjacent doorways (not attendance): ${contactNeighbors(storedPlace, session.zoneId ?? "exterior").join(", ")}. Open doorway speakers: ${(session.doorwayContacts ?? []).map((entry) => entry.characterId).join(", ")}.`
            : "",
        invitationZones: storedPlace
          ? venueZones(storedPlace)
              .filter((zone) => audience.some((id) => canInviteToZone(storedPlace, zone, id)))
              .map(
                (zone) =>
                  `${zone.id}: ${zone.name} (${zone.kind}; controllers ${audience.filter((id) => canInviteToZone(storedPlace, zone, id)).join(", ")})`,
              )
              .join("; ")
          : "none",
        presentation:
          session.stagingVersion === 1
            ? "Current presentation state: " +
              JSON.stringify(
                session.activeIds.map((characterId) => ({
                  characterId,
                  ...stageState[characterId],
                  ...layout[characterId],
                })),
              )
            : "",
        expressions: expressionContexts,
      }),
    ),
  });
  const input =
    mode === "greet"
      ? session.area === "outside"
        ? session.spaceClass === "residence"
          ? "The player arrives in this Residence's Exterior Zone, outside its interior. Show a brief moment already underway from this Zone."
          : "The player arrives in this Venue's Exterior Zone. Show a brief moment already underway from this Zone."
        : "The player enters this space. Show a brief moment already underway here."
      : mode === "leave" && !message.trim()
        ? "The player leaves without saying anything."
        : message;
  // Keep the opening brief, with enough room for reasoning models.
  const requestedMaxTokens = mode === "greet" ? 1_600 : VENUE_REPLY_MAX_TOKENS;
  const maxTokens = Math.min(model.maxOutputTokens ?? requestedMaxTokens, requestedMaxTokens);
  const fitStarted = performance.now();
  const fitted = fitVenueWritingMessages(model, blocks, input, maxTokens);
  trace?.("context fit", performance.now() - fitStarted);
  const memoryIncluded = fitted.messages.some((message) => message.content.includes(memoryContext));
  runtimeDebug("memory retrieval", {
    sceneId: session.id,
    selectedDurableIds: memoryIncluded ? promptMemories.map((memory) => memory.id) : [],
    selectedPassingIds: memoryIncluded ? promptRecollections.map((memory) => memory.id) : [],
    durableBudget: 600,
    passingBudget: 400,
    participantIds: audibleIds,
    allocation: "half equal, half shared",
  });
  return {
    fitted,
    maxTokens,
    model,
    village,
    audience,
    active,
    pendingMoves,
    storedPlace,
    place,
    projectContexts,
    earlierEvidence,
    promptMemories: memoryIncluded ? promptMemories : [],
  };
}

async function generateOnce(...args: Parameters<typeof prepareVenueTurnMessages>) {
  return measurePipeline("Scene interpretation", { sceneId: args[0].id, mode: args[2] }, () =>
    generateMeasured(...args),
  );
}
async function generateMeasured(...args: Parameters<typeof prepareVenueTurnMessages>) {
  const [session, message, mode] = args;
  const signal = args[5];
  const trace = args[6];
  const {
    fitted,
    maxTokens,
    model,
    village,
    audience,
    active,
    pendingMoves,
    storedPlace,
    place,
    projectContexts,
    earlierEvidence,
    promptMemories,
  } = await prepareVenueTurnMessages(...args);
  trace?.("model request", 0, `${model.model} (${model.connectionId})`);
  let attempts = 0;
  const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? maxTokens, {
    responseFormat: { type: "json_object" },
    temperature: VENUE_REPLY_TEMPERATURE,
    usagePurpose: "conversation",
    reasoningEffort: null,
    verbosity: null,
    debugMode: false,
    signal,
    retryEmpty: false,
    onAttempt: trace
      ? (result, elapsedMs, limit) =>
          trace(
            `model attempt ${++attempts}`,
            elapsedMs,
            `finish=${result.finishReason ?? "unknown"} limit=${limit} usage=${JSON.stringify(result.usage ?? {})}`,
          )
      : undefined,
  });
  const raw = extractSceneReply(completion.content ?? "");
  const diagnostics = responseDiagnostics(
    model,
    completion,
    fitted.maxTokens ?? maxTokens,
    raw,
    !!raw && !extractJsonObject(completion.content ?? ""),
    sceneMissingFields(raw),
  );
  const movementIntent: MovementIntent | null =
    !explicitSceneActions() && !session.contactGeneration && (mode === "chat" || mode === "ask") && place
      ? readPlayerMovement(message, place, raw?.movementIntent)
      : null;
  const extractedContact =
    !explicitSceneActions() && !session.contactGeneration && (mode === "chat" || mode === "ask")
      ? readContactIntent(raw?.contactIntent, message)
      : null;
  // Route a valid contact interpretation before validating its uncommitted local draft.
  if (extractedContact)
    return { ...quietContactReply("Routing the contact request.", session.activeIds), contactIntent: extractedContact };
  if (movementIntent)
    return { ...quietContactReply("Routing the movement request.", session.activeIds), movementIntent };
  let parsed: ReturnType<typeof parseVenueReply>;
  try {
    parsed = parseVenueReply(raw, audience, (characterId, requested) =>
      validateSpriteExpression(village.villagers.find((item) => item.characterId === characterId)?.sprite, requested),
    );
    for (const line of parsed.lines) {
      if (!line.expression) continue;
      const expression = validateSpriteExpression(
        village.villagers.find((item) => item.characterId === line.speakerId)?.sprite,
        line.expression,
      );
      if (expression) line.expression = expression;
      else delete line.expression;
    }
  } catch (cause) {
    await rejectVenueCompletion();
    runtimeDebug("scene parser rejection", {
      sceneId: session.id,
      physicalIds: session.contactGeneration?.localIds ?? session.activeIds,
      audibleIds: audience,
      reason: String(cause),
      finishReason: completion.finishReason,
      content: completion.content,
    });
    const failure = typedCompletionFailure(completion, "scene-response", fitted.maxTokens ?? maxTokens) ?? {
      cause: raw ? ("missing_result" as const) : ("invalid_json" as const),
      stage: "scene-response",
      message: raw
        ? "The Scene response did not contain valid segments; explicitly retry."
        : "The Scene response was not usable JSON; explicitly retry.",
    };
    throw new VenueReplyFailure(raw ? "invalid-segments" : "invalid-json", {
      ...failure,
      responseDiagnostics: diagnostics,
    });
  }
  if (session.contactGeneration) {
    const context = session.contactGeneration;
    for (const line of parsed.lines) {
      if (context.remoteIds.includes(line.speakerId)) {
        line.viaDoorway = true;
        if (context.delivery === "loud" || context.delivery === "device") line.remoteDelivery = context.delivery;
      }
      // Presentation never places an unseen remote listener in the player's Zone.
      line.staging = line.staging?.filter((cue) => context.localIds.includes(cue.characterId));
      if (line.kind === "narration") line.heardBy = [...context.localIds];
    }
  }
  const readSpeechSignal = (value: unknown) => {
    const entry = asRecord(value);
    const speakerId = asTrimmedString(entry.speakerId);
    const quote = asTrimmedString(entry.quote).replace(/\s+/gu, " ").toLowerCase();
    if (
      !audience.includes(speakerId) ||
      quote.length < 8 ||
      !parsed.lines.some(
        (line) => line.speakerId === speakerId && line.content.replace(/\s+/gu, " ").toLowerCase().includes(quote),
      )
    )
      return null;
    return { speakerId, entry };
  };
  const request = readSpeechSignal(raw?.residenceRequest);
  const decision = readSpeechSignal(raw?.residenceDecision);
  const upgrade = readSpeechSignal(raw?.upgradeRequest);
  const venueRequest = readSpeechSignal(raw?.venueRequest);
  const invitation = readSpeechSignal(raw?.invitation);
  const editApproval = readSpeechSignal(raw?.editApproval);
  const departures = Array.isArray(raw?.departures)
    ? [
        ...new Set(
          raw.departures
            .map(readSpeechSignal)
            .filter(
              (entry): entry is NonNullable<ReturnType<typeof readSpeechSignal>> =>
                !!entry && (!session.contactGeneration || session.contactGeneration.localIds.includes(entry.speakerId)),
            )
            .map((entry) => entry.speakerId),
        ),
      ]
    : [];
  const sceneEnded = !session.contactGeneration && !!readSpeechSignal(raw?.sceneEnded);
  const recollections: {
    text: string;
    subjectCharacterIds: string[];
    knownByCharacterIds: string[];
    evidence: (number | "player")[];
  }[] = [];
  if (mode !== "greet" && Array.isArray(raw?.recollections))
    for (const value of raw.recollections) {
      const row = asRecord(value);
      const text = asTrimmedString(row.text);
      const evidence = Array.isArray(row.evidence) ? row.evidence : [];
      const subjectCharacterIds = Array.isArray(row.subjectCharacterIds)
        ? [
            ...new Set(
              row.subjectCharacterIds.filter((id): id is string => typeof id === "string" && audience.includes(id)),
            ),
          ]
        : [];
      const knownByCharacterIds = Array.isArray(row.knownByCharacterIds)
        ? [
            ...new Set(
              row.knownByCharacterIds.filter((id): id is string => typeof id === "string" && audience.includes(id)),
            ),
          ]
        : [];
      if (
        !text ||
        text.length > MAX_CHRONICLE_LENGTH ||
        !knownByCharacterIds.length ||
        !evidence.length ||
        evidence.length > 8
      )
        continue;
      if (
        evidence.some((ref) =>
          knownByCharacterIds.some((characterId) =>
            ref === "player"
              ? !parsed.heardPlayerBy.includes(characterId)
              : !Number.isInteger(ref) ||
                (ref as number) < 0 ||
                !parsed.lines[ref as number]?.heardBy.includes(characterId),
          ),
        )
      )
        continue;
      recollections.push({
        text,
        subjectCharacterIds,
        knownByCharacterIds,
        evidence: evidence as (number | "player")[],
      });
    }
  const requestedVenueId = request ? asTrimmedString(request.entry.venueId) : "";
  const invitedVenueId = invitation ? asTrimmedString(invitation.entry.venueId) : "";
  const invitedVenue = village.venues.find((venue) => venue.id === invitedVenueId);
  let invitationScope: "shared" | "private" = invitation?.entry.scope === "private" ? "private" : "shared";
  const invitationZoneId = asTrimmedString(invitation?.entry.privateSpaceId ?? invitation?.entry.zoneId);
  const invitationZone = invitedVenue
    ? resolveVenueZone(
        invitedVenue,
        invitationZoneId ||
          legacyZoneId(
            invitedVenue,
            invitationScope === "private" ? "private" : "shared",
            "residence",
            asTrimmedString(invitation?.entry.ownerId),
          ),
      )
    : undefined;
  invitationScope =
    invitationZone?.kind === "private-residence" ? "private" : invitationZone ? "shared" : invitationScope;
  const invitationOwnerId =
    invitationScope === "private" ? (invitationZone?.ownerId ?? asTrimmedString(invitation?.entry.ownerId)) : "";
  const invitationQuote = asTrimmedString(invitation?.entry.quote).toLowerCase();
  const invitationIsFuture =
    /\b(later|tomorrow|next visit|next time|another day|anytime|when you return|come back)\b/u.test(invitationQuote);
  const invitationIsEntry = /\b(come in|come into|step in|step inside|enter|welcome inside|welcome in|visit)\b/u.test(
    invitationQuote,
  );
  const invitationTiming: "now" | "later" = invitation?.entry.timing === "now" ? "now" : "later";
  const invitationTimingSupported =
    invitationTiming === "later" ? invitationIsFuture : invitationIsEntry && !invitationIsFuture;
  const privateScopeSupported =
    invitationScope === "shared" ||
    /\b(my|mine|your)\s+(private\s+)?(room|bedroom|space|quarters)|private space\b/u.test(invitationQuote);
  const pendingDecision = decision
    ? pendingMoves.find((move) => move.characterId === decision.speakerId && move.requestedBy === "player")
    : null;
  const contactMoves =
    session.contactGeneration && storedPlace
      ? readContactMoves(raw?.contactMoves, parsed.lines, village, storedPlace, session, audience)
      : [];
  if (
    session.contactGeneration &&
    Array.isArray(raw?.contactMoves) &&
    raw.contactMoves.length !== contactMoves.length
  ) {
    await rejectVenueCompletion();
    throw badGateway("The contact reply proposed an unsupported movement. Your draft is preserved.");
  }
  return {
    ...parsed,
    interpretationRouting: raw?.interpretationRouting as unknown,
    roomEvents: raw?.roomEvents as unknown,
    projectContexts,
    contactIntent:
      !explicitSceneActions() && !session.contactGeneration && (mode === "chat" || mode === "ask")
        ? readContactIntent(raw?.contactIntent, message)
        : null,
    contactMoves,
    contactRelay:
      !explicitSceneActions() && session.contactGeneration && storedPlace
        ? readContactRelay(raw?.contactRelay, parsed.lines, village, storedPlace, session, audience)
        : null,
    contactEndIds:
      session.contactGeneration && Array.isArray(raw?.contactEnd)
        ? raw.contactEnd.flatMap((value) => {
            const row = asRecord(value),
              speakerId = asTrimmedString(row.speakerId),
              quote = asTrimmedString(row.quote);
            return audience.includes(speakerId) &&
              contactSpeech(parsed.lines, speakerId, quote) &&
              /\b(?:goodbye|bye|see you|talk (?:to you )?later|need to go|have to go|back to (?:sleep|work))\b/iu.test(
                quote,
              ) &&
              !/\b(?:don't|do not|not|if|unless)\b/iu.test(quote)
              ? [speakerId]
              : [];
          })
        : [],
    projectSpeech: bindProjectSpeech(
      raw?.projectSpeech,
      projectContexts,
      parsed.lines.map((line, index) => ({ ...line, id: String(index) })),
    ),
    sceneChange:
      !session.contactGeneration && (mode === "chat" || mode === "ask")
        ? readVenueSceneChange(
            raw?.sceneChange,
            place,
            session.activeIds,
            village.villagers.map((person) => person.characterId),
          )
        : null,
    movementIntent,
    residenceSignal:
      (mode === "chat" || mode === "ask") &&
      requestedVenueId &&
      village.venues.some((venue) => venue.id === requestedVenueId)
        ? { kind: "request" as const, characterId: request!.speakerId, venueId: requestedVenueId }
        : (mode === "chat" || mode === "ask") && pendingDecision && typeof decision!.entry.approved === "boolean"
          ? {
              kind: "decision" as const,
              characterId: decision!.speakerId,
              venueId: pendingDecision.proposedVenueId,
              approved: decision!.entry.approved === true,
            }
          : null,
    upgradeSignal:
      (mode === "chat" || mode === "ask") &&
      upgrade &&
      (place?.residentIds?.includes(upgrade.speakerId) || place?.workerIds?.includes(upgrade.speakerId))
        ? { characterId: upgrade.speakerId, venueId: place.id, quote: asTrimmedString(upgrade.entry.quote) }
        : null,
    venueRequestSignal:
      (mode === "chat" || mode === "ask") && venueRequest && readVenueRequestCore(venueRequest.entry)
        ? {
            characterId: venueRequest.speakerId,
            ...readVenueRequestCore(venueRequest.entry)!,
            quote: asTrimmedString(venueRequest.entry.quote),
          }
        : null,
    invitationSignal:
      invitation &&
      invitedVenue &&
      invitationTimingSupported &&
      !(
        invitation.entry.privateSpaceId &&
        invitation.entry.zoneId &&
        invitation.entry.privateSpaceId !== invitation.entry.zoneId
      ) &&
      !(
        invitationZoneId &&
        invitation.entry.privateOwnerId &&
        invitationZoneId !==
          legacyZoneId(invitedVenue, "private", "residence", invitation.entry.privateOwnerId as string)
      ) &&
      !/\b(no|not|never|don't|can't|cannot|won't|unless|if|maybe|perhaps)\b/iu.test(invitationQuote) &&
      privateScopeSupported &&
      !!invitationZone &&
      !zoneClosed(village, invitedVenue, invitationZone) &&
      canInviteToZone(invitedVenue, invitationZone, invitation.speakerId) &&
      (invitationScope === "shared" || invitationOwnerId === invitation.speakerId)
        ? {
            residentId: invitation.speakerId,
            venueId: invitedVenueId,
            scope: invitationScope,
            zoneLabel: invitationZone.name,
            zoneId: invitationZone?.id,
            privateSpaceId:
              invitationZone && ["private-residence", "staff", "restricted"].includes(invitationZone.kind)
                ? invitationZone.id
                : undefined,
            area: invitationZone ? zoneArea(invitationZone) : undefined,
            spaceClass: invitationZone?.venueClass,
            accompanies:
              invitation?.entry.accompanies === true &&
              /\b(with me|follow me|show you|take you|come with|let me show)\b/iu.test(invitationQuote),
            timing: invitationTiming,
            ownerId: invitationOwnerId,
            quote: asTrimmedString(invitation.entry.quote),
          }
        : null,
    editApprovalSignal:
      editApproval &&
      (place?.editProposals ?? []).some(
        (proposal) =>
          proposal.id === asTrimmedString(editApproval.entry.proposalId) &&
          !proposal.declined &&
          proposal.requiredIds.includes(editApproval.speakerId),
      ) &&
      typeof editApproval.entry.approved === "boolean"
        ? {
            proposalId: asTrimmedString(editApproval.entry.proposalId),
            residentId: editApproval.speakerId,
            approved: editApproval.entry.approved === true,
            quote: asTrimmedString(editApproval.entry.quote),
          }
        : null,
    recap: asString(raw?.recap).slice(0, 600),
    departures,
    sceneEnded,
    recollections,
    responseDiagnostics: diagnostics as ResponseDiagnostics | undefined,
    memoryChanges: raw?.memoryChanges,
    relationshipChanges: raw?.relationshipChanges,
    earlierLineIds: earlierEvidence.map((line) => line.id),
    memoryVersions: Object.fromEntries(promptMemories.map((memory) => [memory.id, memoryVersion(memory)])),
    wishChanges: raw?.wishChanges,
    wishContexts: active.flatMap((person) =>
      (village.villagers.find((resident) => resident.characterId === person.characterId)?.agenda?.wishes ?? []).map(
        (wish) => ({ actorId: person.characterId, wishId: wish.id, fingerprint: wishFingerprint(wish) }),
      ),
    ),
  };
}

/** Interpret an accepted scene without writing a partial transcript. */
async function interpretRoomDraft(
  session: VenueScene,
  currentVillage: VillageState,
  message: string,
  reply: SceneReply,
  eligible = true,
  evidenceLines = reply.lines,
) {
  const roomInterpretation = eligible
    ? await interpretRoomReply(
        session,
        currentVillage,
        message,
        evidenceLines,
        `${venueOperationId()}:${createHash("sha256").update(JSON.stringify(reply.lines)).digest("hex").slice(0, 12)}`,
        reply.heardPlayerBy,
        reply.invitationSignal ? undefined : reply.interpretationRouting,
        reply.roomEvents,
        reply.invitationSignal,
      )
    : null;
  const proposedInvitation = reply.invitationSignal;
  reply.invitationSignal = null;
  if (roomInterpretation) {
    // Narrator metadata is a proposal, not permission. Contextual interpretation replaces its phrase gates.
    const invitations = roomInterpretation.results.flatMap((result, index) =>
      ["invite-now", "invite-later"].includes(result.outcome)
        ? [{ result, check: roomInterpretation.checks[index] }]
        : [],
    );
    if (invitations.length === 1) {
      const { result, check } = invitations[0],
        facts = asRecord(check.facts);
      const controlledVenue = currentVillage.venues.find((venue) => venue.id === facts.venueId);
      const zone = controlledVenue && resolveVenueZone(controlledVenue, String(facts.zoneId));
      const actor = String(facts.actorId);
      const supporting =
        check.evidence.find(
          (line) => result.evidenceIds.includes(line.id) && line.current && line.speakerId === actor,
        ) ??
        check.evidence.find(
          (line) => result.evidenceIds.includes(line.id) && line.current && line.kind === "narration",
        );
      if (
        controlledVenue &&
        zone &&
        supporting &&
        !zoneClosed(currentVillage, controlledVenue, zone) &&
        canInviteToZone(controlledVenue, zone, actor)
      ) {
        reply.invitationSignal = {
          residentId: actor,
          venueId: controlledVenue.id,
          scope: zone.kind === "private-residence" ? "private" : "shared",
          zoneLabel: zone.name,
          zoneId: zone.id,
          privateSpaceId: ["private-residence", "staff", "restricted"].includes(zone.kind) ? zone.id : undefined,
          area: zoneArea(zone),
          spaceClass: zone.venueClass,
          accompanies:
            proposedInvitation?.residentId === actor &&
            proposedInvitation?.zoneId === zone.id &&
            proposedInvitation.accompanies === true,
          timing: result.outcome === "invite-now" ? "now" : "later",
          ownerId: zone.ownerId ?? "",
          evidenceKind: supporting.kind === "narration" ? "action" : "speech",
          quote: supporting.content,
          accessRevision: controlledVenue.access?.revision,
        };
      }
    }
  }
  return { ...reply, roomInterpretation };
}

async function generate(
  session: VenueScene,
  message: string,
  mode: "greet" | "chat" | "ask" | "fulfill" | "act" | "leave",
  targetId: string,
  settled: { fulfilled: boolean; wish: string; unresolved?: boolean; reason?: string } | null,
  signal?: AbortSignal,
  trace?: GreetingTrace,
  actionOutcome?: string,
) {
  try {
    const reply = await generateOnce(session, message, mode, targetId, settled, signal, trace, actionOutcome);
    const integrity = venueReplyIntegrity(message, session.lines, reply.lines);
    if (integrity) throw new VenueReplyFailure(integrity);
    const currentVillage = await readVillageState();
    const controlledVenue = currentVillage.venues.find((venue) => venue.id === session.placeId);
    const controlledZone = controlledVenue && resolveVenueZone(controlledVenue, session.zoneId ?? "");
    if (
      ((session.area === "shared" && controlledVenue && venueResidentIds(controlledVenue).length > 0) ||
        session.area === "private" ||
        controlledZone?.kind === "staff" ||
        controlledZone?.kind === "restricted") &&
      reply.sceneChange
    )
      throw new VenueReplyFailure("residence-consent");
    if (reply.sceneChange) {
      if (controlledVenue?.constructionStatus === "worksite") throw new VenueReplyFailure("construction-worksite");
      if (
        /^(?:i\s+)?(?:will|would|promise|plan|want|intend)\b|\b(?:yesterday|last week|earlier|elsewhere)\b/iu.test(
          message.trim(),
        )
      )
        throw new VenueReplyFailure("unsupported-physical-claim");
      if (
        reply.sceneChange.removeItem &&
        currentVillage.projects.some(
          (project) =>
            project.kind === "build-venue" &&
            project.status !== "complete" &&
            project.plan?.sources.some(
              (source) =>
                source.kind === "existing-item" &&
                source.venueId === session.placeId &&
                (!source.zoneId || source.zoneId === session.zoneId) &&
                source.itemName === reply.sceneChange!.removeItem &&
                source.remaining > 0,
            ),
        )
      )
        throw new VenueReplyFailure("reserved-project-item");
    }
    const currentSession = await refreshZoneParticipants(session, true);
    if (
      currentSession.zoneId !==
      (session.zoneId ??
        (controlledVenue
          ? legacyZoneId(controlledVenue, session.area, session.spaceClass, session.privateOwnerId)
          : undefined))
    )
      throw conflict("Room access changed while the reply was being prepared. You returned to the exterior.");
    if (reply.invitationSignal) {
      const invited = currentVillage.venues.find((venue) => venue.id === reply.invitationSignal!.venueId);
      const target = invited && resolveVenueZone(invited, reply.invitationSignal.zoneId ?? "");
      if (
        !invited ||
        !target ||
        zoneClosed(currentVillage, invited, target) ||
        !canInviteToZone(invited, target, reply.invitationSignal.residentId)
      )
        reply.invitationSignal = null;
    }
    return interpretRoomDraft(
      session,
      currentVillage,
      message,
      reply,
      mode !== "leave" && !reply.contactIntent && !reply.movementIntent,
    );
  } catch (cause) {
    if (!(cause instanceof VenueReplyFailure)) throw cause;
    await rejectVenueCompletion();
    villagesLogger().warn("[villages] scene=%s draft rejected: %s; no automatic retry", session.id, cause.kind);
    throw Object.assign(
      badGateway(`The Scene reply failed validation (${cause.kind}). Your draft is preserved; resend when ready.`),
      cause.failure ? { failure: cause.failure } : {},
    );
  }
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
      role: "assistant",
      content: line.content,
      at,
      heardBy: line.heardBy,
      ...(line.viaDoorway ? { viaDoorway: true } : {}),
      ...(line.remoteDelivery ? { remoteDelivery: line.remoteDelivery } : {}),
      ...(line.contactHidden ? { contactHidden: true } : {}),
      ...(line.contactReport ? { contactReport: true } : {}),
      kind: line.kind,
      ...(line.expression ? { expression: line.expression } : {}),
      ...(line.gazeAt ? { gazeAt: line.gazeAt } : {}),
      ...(line.staging?.length ? { staging: line.staging } : {}),
      ...(line.targetId ? { targetId: line.targetId } : {}),
      ...(line.anchorIndex !== undefined ? { asideFor: lineIds[line.anchorIndex]! } : {}),
    }),
  );
  return lineIds;
}

export async function activeVenueSession(): Promise<VenueScene | null> {
  const active = await readActive();
  if (!active.sessionId) return null;
  const session = await readSession(active.sessionId);
  if (session.status === "closed") {
    await clearActivePointer(session.id);
    return null;
  }
  if (hasVenueOperation(session.id)) return session;
  if (isInactive(session)) {
    await interruptInactiveVisit(session.id);
    const latest = await readSession(session.id).catch(() => null);
    return latest?.status === "closed" ? null : latest;
  }
  return refreshZoneParticipants(session);
}

async function interruptInactiveVisit(id: string): Promise<void> {
  if (hasVenueOperation(id)) return;
  const closed = await changeSession(id, (state) => {
    if (state.status === "closed" || !isInactive(state) || hasVenueOperation(id)) return;
    state.status = "closed";
    state.endedAt = new Date().toISOString();
    state.endReason = "inactivity";
  });
  if (closed.status !== "closed") return;
  await clearActivePointer(id);
  if (!closed.lines.some((line) => line.role === "user")) {
    const document = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${id}`);
    if (document) await villagesDocuments().remove(VILLAGES_PACKAGE_ID, document.id, document.revision);
  }
}

async function requireLiveVenueSession(id: string): Promise<VenueScene> {
  let session = await readSession(id);
  if (session.status !== "closed" && isInactive(session) && !hasVenueOperation(id)) {
    await interruptInactiveVisit(id);
    session = await readSession(id).catch(() => session);
  }
  if (
    session.endReason === "inactivity" ||
    (session.status !== "closed" && isInactive(session) && !hasVenueOperation(id))
  )
    throw new VillagesRequestError(
      410,
      "Interrupted: Inactivity. This Scene ended while you were away; its completed exchanges were saved.",
    );
  if (session.status === "closed") throw conflict("That Scene has already ended.");
  if ((await readActive()).sessionId !== id) throw conflict("That Scene is not active.");
  return refreshZoneParticipants(session);
}

/** Only a deliberate client action updates this server-owned clock. */
export async function touchVenueSession(id: string): Promise<VenueScene> {
  const session = await requireLiveVenueSession(id);
  if (Date.now() - Date.parse(session.lastActivityAt) < ACTIVITY_WRITE_MS) return session;
  return changeSession(id, (state) => {
    if (state.status === "closed") throw conflict("That Scene has already ended.");
    if (isInactive(state) && !hasVenueOperation(state.id))
      throw new VillagesRequestError(410, "Interrupted: Inactivity. This Scene ended while you were away.");
    if (Date.now() - Date.parse(state.lastActivityAt) >= ACTIVITY_WRITE_MS)
      state.lastActivityAt = new Date().toISOString();
  });
}
async function refreshZoneParticipants(session: VenueScene, completing = false): Promise<VenueScene> {
  if (!completing && hasVenueOperation(session.id)) return session;
  const village = await readVillageState(),
    venue = village.venues.find((entry) => entry.id === session.placeId);
  if (!venue || session.status === "closed") return session;
  if (venue.access && session.pendingAccessClaim) {
    await mutateVillageState((state) => {
      const current = state.venues.find((row) => row.id === venue.id)!;
      const target = resolveVenueZone(current, session.zoneId ?? "exterior");
      if (!target) return;
      const decision = evaluateZoneAccess(current, target, "player", {
        ...sceneAccessContext(session, state),
        accepting: true,
        unavailable: zoneClosed(state, current, target),
      });
      if (decision.allowed) claimVisitPermission(current, decision.permissionId, session.id);
    });
    const settled = await changeSession(session.id, (state) => {
      state.pendingAccessClaim = undefined;
    });
    return refreshZoneParticipants(settled, completing);
  }
  const zoneId = session.zoneId ?? legacyZoneId(venue, session.area, session.spaceClass, session.privateOwnerId);
  const zone = resolveVenueZone(venue, zoneId);
  if (venue.access && session.sceneAttendance) {
    const exits = accessExits(session, village, venue);
    if (exits.length) {
      const displaced = await changeSession(session.id, (state) => {
        // Recompute from committed positions, so retries cannot record an exit twice.
        for (const exit of accessExits(state, village, venue)) {
          const witnesses = [
            ...new Set(
              Object.entries(sceneAccessContext(state, village).positions ?? {})
                .filter(([, position]) => position === exit.from || position === exit.to)
                .map(([actor]) => actor),
            ),
          ].filter((actor) => actor !== "player");
          const playerPosition = state.zoneId ?? "exterior";
          appendLine(state, {
            id: randomUUID(),
            role: "assistant",
            speakerId: "__venue_scene__",
            name: "Narration",
            kind: "narration",
            content: `${exit.actor === "player" ? "You" : (state.sceneAttendance?.occupants.find((person) => person.characterId === exit.actor)?.name ?? "A visitor")} leave ${resolveVenueZone(venue, exit.from)?.name ?? "the Zone"} and return to ${resolveVenueZone(venue, exit.to)?.name ?? "Entrance"} because access has ended.`,
            at: new Date().toISOString(),
            heardBy: witnesses,
            zoneId: exit.from,
            contactHidden: exit.actor !== "player" && playerPosition !== exit.from && playerPosition !== exit.to,
          });
          state.accessPreviousZones ??= {};
          state.accessPreviousZones[exit.actor] = exit.from;
          if (exit.actor === "player") {
            const destination = resolveVenueZone(venue, exit.to)!;
            state.enteredFromZoneId = exit.from;
            state.zoneId = exit.to;
            state.area = zoneArea(destination);
            state.spaceClass = destination.venueClass;
            state.privateOwnerId = destination.ownerId ?? "";
            state.privateSpaceId = destination.kind === "private-residence" ? destination.id : undefined;
            state.recap = "";
            state.doorwayContacts = [];
          } else
            state.accompanying = [
              ...(state.accompanying ?? []).filter((row) => row.characterId !== exit.actor),
              { characterId: exit.actor, zoneId: exit.to },
            ];
        }
      });
      return refreshZoneParticipants(displaced, completing);
    }
  }
  const revoked =
    !venue.access &&
    session.zoneGrants?.some(
      (grant) => grant.zoneId === zoneId && (!zone || !canInviteToZone(venue, zone, grant.controllerId)),
    );
  if (!venue.access && (!zone || zoneClosed(village, venue, zone) || revoked)) {
    const displaced = await changeSession(session.id, (state) => {
      if (!completing && hasVenueOperation(session.id)) return;
      state.zoneId = "exterior";
      state.area = "outside";
      state.privateOwnerId = "";
      state.privateSpaceId = undefined;
      state.recap = "";
      state.legacyCast = false;
      state.grantedZoneIds = state.grantedZoneIds?.filter(
        (id) =>
          !!resolveVenueZone(venue, id) &&
          !session.zoneGrants?.some(
            (grant) => grant.zoneId === id && !canInviteToZone(venue, resolveVenueZone(venue, id)!, grant.controllerId),
          ),
      );
      state.zoneGrants = state.zoneGrants?.filter(
        (grant) =>
          !!resolveVenueZone(venue, grant.zoneId) &&
          canInviteToZone(venue, resolveVenueZone(venue, grant.zoneId)!, grant.controllerId),
      );
      appendLine(state, {
        id: randomUUID(),
        kind: "narration",
        content: "This zone is closed. You return to the exterior.",
        speakerId: "",
        name: "",
        role: "assistant",
        heardBy: [],
        at: new Date().toISOString(),
      });
    });
    return refreshZoneParticipants(displaced, completing);
  }
  const invalidGrants =
    (!venue.access
      ? session.zoneGrants?.filter((grant) => {
          const target = resolveVenueZone(venue, grant.zoneId);
          return !target || !canInviteToZone(venue, target, grant.controllerId);
        })
      : []) ?? [];
  if (invalidGrants.length) {
    const refreshed = await changeSession(session.id, (state) => {
      state.zoneGrants = state.zoneGrants?.filter(
        (grant) => !invalidGrants.some((invalid) => invalid.zoneId === grant.zoneId),
      );
      state.grantedZoneIds = state.grantedZoneIds?.filter((id) => !invalidGrants.some((grant) => grant.zoneId === id));
    });
    return refreshZoneParticipants(refreshed);
  }
  if (!session.zoneId) {
    const migrated = await changeSession(session.id, (state) => {
      if (!completing && hasVenueOperation(session.id)) return;
      state.zoneId = zoneId;
      state.legacyCast = true;
      if (state.area !== "outside") state.grantedZoneIds = [...new Set([...(state.grantedZoneIds ?? []), zoneId])];
    });
    return refreshZoneParticipants(migrated, completing);
  }
  if (!session.sceneAttendance) {
    // Older Scenes cannot reconstruct rewritten agendas. Preserve their current cast,
    // and capture unencountered residents at the original Scene time once.
    const captured = captureSceneAttendance(village, venue.id, new Date(session.startedAt));
    // An older Scene already established its visible cast. Schedule reconstruction cannot add a witness there.
    const known = new Set(session.participants.map((person) => person.characterId));
    captured.occupants = captured.occupants.filter(
      (person) => person.zoneId !== zoneId || known.has(person.characterId),
    );
    for (const person of session.participants) {
      const original = captured.occupants.find((entry) => entry.characterId === person.characterId);
      const lastZone =
        session.lines.findLast((line) => line.heardBy.includes(person.characterId))?.zoneId ?? original?.zoneId;
      captured.occupants = captured.occupants.filter((entry) => entry.characterId !== person.characterId);
      if (session.activeIds.includes(person.characterId) || (lastZone && lastZone !== zoneId))
        captured.occupants.push({
          ...person,
          zoneId: session.activeIds.includes(person.characterId) ? zoneId : lastZone!,
          availability: "",
        });
    }
    session = await changeSession(session.id, (state) => {
      if (!state.sceneAttendance) state.sceneAttendance = captured;
    });
  }
  const people = sceneZoneOccupants(session, village, venue, zoneId);
  if (people.length > 4) throw conflict("Five residents occupy this Zone in the Scene. Choose another Zone.");
  const activeIds = people.map((person) => person.characterId);
  if (session.zoneId === zoneId && JSON.stringify(activeIds) === JSON.stringify(session.activeIds)) return session;
  return changeSession(session.id, (state) => {
    if (!completing && hasVenueOperation(session.id)) return;
    state.zoneId = zoneId;
    for (const person of people) {
      if (!state.participants.some((entry) => entry.characterId === person.characterId))
        state.participants.push({ characterId: person.characterId, name: person.name, doing: person.doing });
      if (!state.heardHistory.some((entry) => entry.characterId === person.characterId))
        state.heardHistory.push({ characterId: person.characterId, lineIds: [] });
    }
    if (activeIds.some((id) => !state.activeIds.includes(id))) state.recap = "";
    state.activeIds = activeIds;
  });
}

function serializedNavigation<T>(operation: () => Promise<T>): Promise<T> {
  return sceneWork().serializeNavigation(operation);
}
export async function moveVenueZone(
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
  return coordinateVenue(sessionId, operationId, "move", { zoneId }, expectedSceneRevision, retryOfAttemptId, () => {
    const work = sceneWork();
    return work.serializeNavigation(async () => {
      work.markMovement(sessionId);
      try {
        return await moveVenueZoneOnce(sessionId, zoneId);
      } finally {
        work.clearMovement(sessionId);
      }
    });
  });
}
async function moveVenueZoneOnce(
  sessionId: string,
  zoneId: string,
  written?: { message: string; targetId: string; requestMode?: "act" | "fulfill" },
): Promise<VenueScene> {
  assertVenueOwnership();
  let session = await requireLiveVenueSession(sessionId);
  if (!session.sceneAttendance) session = await refreshZoneParticipants(session, true);
  const operationId = venueOperationId();
  const recorded = session.submissions.find((turn) => turn.movement?.operationId === operationId);
  if (recorded) {
    await markZoneSeen(session);
    return refreshZoneParticipants(session, true);
  }
  if (session.status !== "active") throw conflict("Wait for the current scene to finish opening.");
  if (session.submissions.some((entry) => entry.mode === "act" && entry.action && !entry.actionReplyDone))
    throw conflict("Retry the pending action reply before moving to another zone.");
  const village = await readVillageState(),
    venue = village.venues.find((entry) => entry.id === session.placeId);
  const zone = venue && resolveVenueZone(venue, zoneId);
  if (!venue || !zone) throw notFound("That zone is not in this Venue.");
  if (session.zoneId === zone.id) return session;
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
    await mutateVillageState((state) => {
      const current = state.venues.find((row) => row.id === venue.id)!;
      const target = resolveVenueZone(current, zone.id)!;
      const decision = evaluateZoneAccess(current, target, "player", {
        ...sceneAccessContext({ ...session, accompanying }, state),
        accepting: true,
        unavailable: zoneClosed(state, current, target),
      });
      if (!decision.allowed) throw conflict(decision.explanation);
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
    await mutateVillageState((state) => {
      const current = state.venues.find((entry) => entry.id === venue.id)!;
      const target = resolveVenueZone(current, zone.id);
      if (!target || zoneClosed(state, current, target) || !canInviteToZone(current, target, invitation.residentId))
        throw conflict("This zone's invitation is no longer valid.");
      // The Village receipt closes the crash gap between consuming access and committing the scene.
      if (current.usedInvitationIds?.includes(invitation.sourceLineId)) return;
      const index =
        current.playerInvitations?.findIndex(
          (entry) =>
            entry.zoneId === zone.id &&
            entry.sourceLineId === invitation.sourceLineId &&
            entry.residentId === invitation.residentId,
        ) ?? -1;
      if (index < 0) throw conflict("This zone needs its controller's invitation.");
      const consumed = current.playerInvitations!.splice(index, 1)[0]!;
      current.usedInvitationIds = [...new Set([...(current.usedInvitationIds ?? []), consumed.sourceLineId])];
    });
  }
  const moved = await changeSession(sessionId, (state) => {
    if (state.submissions.some((turn) => turn.movement?.operationId === operationId)) return;
    const originZoneId = state.zoneId ?? legacyZoneId(venue, state.area, state.spaceClass, state.privateOwnerId);
    const origin = resolveVenueZone(venue, originZoneId);
    const at = new Date().toISOString();
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
    state.enteredFromZoneId = state.zoneId;
    state.zoneId = zone.id;
    state.doorwayContacts = [];
    state.accessPreviousZones ??= {};
    for (const entry of accompanying ?? []) {
      const prior = contactPosition(state, entry.characterId);
      if (prior && prior !== entry.zoneId) state.accessPreviousZones[entry.characterId] = prior;
    }
    state.accompanying = accompanying ?? [];
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
      (venue.access &&
        !evaluateZoneAccess(venue, zone, "player", {
          ...sceneAccessContext(session, state),
          unavailable: zoneClosed(state, venue, zone),
        }).allowed)
    )
      return;
    zone.seen = true;
    admitted = true;
  });
  if (!admitted) return;
  if (session.area === "private") await markResidenceSeen(session, generateImage);
  if (!generateImage) return;
  const village = await readVillageState(),
    venue = village.venues.find((entry) => entry.id === session.placeId),
    zone = venue && resolveVenueZone(venue, session.zoneId ?? "");
  if (zone && ["staff", "restricted"].includes(zone.kind))
    outsideVenueOperation(() => {
      void import("../media/location-image.js")
        .then(({ generateFirstPrivateSpaceImage }) => generateFirstPrivateSpaceImage(session.placeId, zone.id))
        .catch(() => {});
    });
}

export function enterVenue(
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
  if (!existing) await rollActiveAgendas(new Date());
  const village = await readVillageState(),
    place = village.venues.find((entry) => entry.id === placeId);
  if (!place) throw notFound("That place is not in this village.");
  const classes = venueClasses(place),
    spaceClass = requestedClass ?? classes.find((entry) => entry !== "residence") ?? classes[0]!;
  if (!classes.includes(spaceClass) && !requestedZoneId) throw badRequest("That Venue has no such space.");
  const requested =
    requestedZoneId ??
    legacyZoneId(place, entryArea ?? (spaceClass === "residence" ? "shared" : "public"), spaceClass, privateOwnerId);
  let zone = resolveVenueZone(place, requested);
  if (!zone && !requestedZoneId && !entryArea && place.layoutVersion === 1) zone = resolveVenueZone(place, "exterior");
  if (!zone) throw notFound("That zone is not in this Venue.");
  if (zoneClosed(village, place, zone)) {
    if (place.constructionStatus === "worksite" && !requestedZoneId && !entryArea)
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
  const id = randomUUID();
  const sceneAttendance = captureSceneAttendance(village, placeId, new Date());
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
  const session: VenueScene = {
    pendingAccessClaim: initialPermissionId,
    version: 1,
    sceneRevision: 0,
    processingVersion: 1,
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
    lastActivityAt: new Date().toISOString(),
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

export async function enterResidencePrivateSpace(
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

export async function greetVenue(id: string, retryOfAttemptId?: string): Promise<VenueScene> {
  return withSceneActivation(() => greetVenueInActivation(id, retryOfAttemptId));
}

async function greetVenueInActivation(id: string, retryOfAttemptId?: string): Promise<VenueScene> {
  const work = sceneWork();
  const inFlight = work.greetingTask(id);
  if (inFlight) return inFlight.task;
  const started = performance.now();
  const controller = new AbortController();
  const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(28_000)]);
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
  const task = coordinateVenue(id, "greeting", "greet", {}, undefined, retryOfAttemptId, () =>
    Promise.race([greetVenueOnce(id, signal, trace), aborted]),
  );
  work.rememberGreeting(id, task, () => controller.abort());
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
    if (signal.reason instanceof DOMException && signal.reason.name === "TimeoutError")
      throw new VillagesRequestError(
        504,
        "The scene opening exceeded 28 seconds. Retry it or continue without an opening.",
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
  if (session.status !== "opening") return session;
  signal.throwIfAborted();
  const reply = await venueCheckpoint("greeting-reply", () => generate(session, "", "greet", "", null, signal, trace));
  signal.throwIfAborted();
  const greetingVillage = await readVillageState();
  validateCurrentRoomInvitation(reply, greetingVillage);
  const greeted = await changeSession(id, (state) => {
    signal.throwIfAborted();
    if (state.status !== "opening") return;
    if (isInactive(state) && !hasVenueOperation(state.id))
      throw new VillagesRequestError(410, "Interrupted: Inactivity. This Scene ended while you were away.");
    const at = new Date().toISOString();
    const savedLineIds = appendVenueReply(state, reply.lines, at);
    {
      const wishes = bindWishProposals(
        reply.wishChanges,
        greetingVillage,
        state.lines,
        "",
        savedLineIds,
        reply.wishContexts,
      );
      state.submissions.push({
        id: "greeting",
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
        liveProposals: bindLiveProposals(reply, "", savedLineIds),
        accessEvents: savedAccessEvents(reply.roomInterpretation),
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
    if (reply.invitationSignal?.venueId === state.placeId && reply.invitationSignal.timing === "now") {
      applyImmediateZoneInvitation(state, reply.invitationSignal);
    }
    applyInterpretedRoomEvents(state, reply.roomInterpretation, greetingVillage);
    state.status = "active";
  });
  if (reply.roomInterpretation) {
    await finalizeRoomInvitationDiagnostics(greeted, reply.roomInterpretation, reply.invitationSignal);
    await writeInterpretationDiagnostics(id, reply.roomInterpretation.traces).catch(() => {});
    scheduleSystemComparisons(id, reply.roomInterpretation);
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
  await markZoneSeen(greeted, greeted.zoneId === session.zoneId);
  await processSavedExchange(id, "greeting");
  return refreshZoneParticipants(await readSession(id), true);
}

export async function continueVenueWithoutGreeting(id: string): Promise<VenueScene> {
  return withSceneActivation(() => continueVenueWithoutGreetingInActivation(id));
}

async function continueVenueWithoutGreetingInActivation(id: string): Promise<VenueScene> {
  const work = sceneWork();
  await cancelVenueOperation(id);
  await requireLiveVenueSession(id);
  const session = await changeSession(id, (state) => {
    if (isInactive(state) && !hasVenueOperation(state.id))
      throw new VillagesRequestError(410, "Interrupted: Inactivity. This Scene ended while you were away.");
    if (state.status === "opening") state.status = "active";
    else if (state.status !== "active") throw conflict("That Scene has already ended.");
  });
  work.abortGreeting(id);
  return session;
}

type SceneReply = Awaited<ReturnType<typeof generateOnce>> & { roomInterpretation?: InterpretationBatch | null };

async function generateContactResponse(scene: VenueScene, message: string, targetId: string): Promise<SceneReply> {
  try {
    const reply = await generateOnce(
      scene,
      message,
      "chat",
      targetId,
      null,
      venueOperationSignal() ?? AbortSignal.timeout(90_000),
    );
    const integrity = venueReplyIntegrity(message, scene.lines, reply.lines);
    if (integrity) throw new VenueReplyFailure(integrity);
    return reply;
  } catch (cause) {
    if (!(cause instanceof VenueReplyFailure)) throw cause;
    await rejectVenueCompletion();
    runtimeDebug("contact draft rejection", { sceneId: scene.id, reason: cause.kind });
    throw Object.assign(
      badGateway("The contact reply could not be kept accurate. Your draft is preserved; retry."),
      cause.failure ? { failure: cause.failure } : {},
    );
  }
}

/** Paid stages are checkpointed; walking any permitted route does not spend one call per door. */
async function contactReply(scene: VenueScene, intent: ContactIntent): Promise<SceneReply> {
  const reply = await prepareContactReply(scene, intent);
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
    venue = village.venues.find((entry) => entry.id === scene.placeId);
  if (!venue) throw notFound("That Venue is no longer available.");
  const origin = scene.zoneId ?? "exterior",
    neighbors = contactNeighbors(venue, origin);
  if (intent.targetId && !village.villagers.some((entry) => entry.characterId === intent.targetId))
    throw badRequest("Choose a villager who still lives in the village.");
  if (
    (explicitSceneActions() && !intent.boundaryZoneId) ||
    (intent.boundaryZoneId && !neighbors.includes(intent.boundaryZoneId))
  )
    throw badRequest("Choose a doorway adjacent to your current Zone.");
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
  const reachable = contactReach(
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
    return reachable.includes(position) && !!zone && !zoneClosed(village, venue, zone);
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
      availability: person.availability,
    })),
  });
  if (!remote.length && !scene.activeIds.length) return quietContactReply("No answer.", scene.activeIds);
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
      localIds: scene.activeIds,
      remoteIds: remote.map((person) => person.characterId),
      instruction: `CONTACT RESPONSE. This overrides generic instructions that all active IDs are in the same Zone.
The player remains in ${origin}. Local people: ${scene.activeIds.join(", ")}. Possible remote listeners: ${remote.map((person) => person.characterId).join(", ")}.
Delivery: ${delivery}. Possible listeners are NOT actual witnesses. Select heardPlayerBy and each line's heardBy only for residents who plausibly hear it, possibly only some of them. A farther loud voice can be muffled or fail to reach someone; a sleeping or absorbed resident may never notice. Do not force every occupant of a Zone to hear.
They hear the current message and ONLY earlier exchanges in their individual witnessed histories. Intended addressee: ${intent.targetId || "the ongoing conversational audience"}. Addressing is not isolation; audible bystanders may react voluntarily.
Residents retain agency and may ignore, decline, be busy, misunderstand, relay, or not hear. An acknowledgement may wake someone; witnessed developments outrank their Scene-start activity. Silence must reveal no hidden reason or attendance. Never disclose unseen descriptions, objects or other occupants. A remote speaker stays in their Zone and has no on-stage sprite. Remote voice replies must use an audible delivery consistent with the established channel, not an inaudible whisper. Narration describes only what the player can observe; never narrate an unseen listener hearing, waking, or being busy unless they reveal it in audible speech.
For a completed, willingly narrated move to any permitted Zone, including approaching through an intermediate Zone, return contactMoves:[{characterId,zoneId:"exact permitted destination",quote:"their exact spoken agreement"}]; include the actual completed movement in narration. Position changes do not grant player entry. Permitted arrivals: ${JSON.stringify(destinations)}. Maximum local cast is four.
${explicitSceneActions() ? "Contact attempts reach only the selected adjacent Zone. Optional words describe knocking, calling or speaking; do not assume a door exists without established context. An offer to fetch someone remains dialogue only: do not perform a farther-Zone exchange, invent their answer, or return contactRelay. The player never moves during Contact." : 'If a local or doorway responder willingly offers to fetch the addressed person, return contactRelay:{speakerId,targetId,quote:"exact unconditional spoken offer"}. Do not invent the target\'s response or whereabouts. The server checks a permitted route with no hop cutoff. The messenger may approach a private doorway without entering it. Do not narrate the journey as completed yet.'}
For an explicit end to doorway conversation return contactEnd:[{speakerId,quote:"exact spoken goodbye"}], never sceneEnded or departures for that goodbye. Invitations grant permission only; do not narrate the player entering. Do not propose physical handoffs or lasting room changes.`,
    },
  };
  const reply = await venueCheckpoint("contact-response", () =>
    generateContactResponse(context, intent.quote, intent.targetId),
  );
  // If no one acknowledges, reveal neither listeners nor the reason for silence.
  if (!reply.lines.some((line) => line.kind !== "narration") && !scene.activeIds.length)
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
The player stays at ${origin}; permission does not move the player. A completed journey by the target to meet them can return contactMoves:[{characterId:"${relay.targetId}",zoneId:"${origin}",quote:"exact spoken agreement"}] only when a route is permitted: ${!!contactPath(village, venue, contactPosition(scene, relay.targetId), origin, relay.targetId, scene)}.
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
};

function matchesSavedTurnMode(turn: VenueSubmission, mode: VenueTurnInput["mode"]) {
  return (turn.requestMode ?? turn.mode) === mode || (!turn.requestMode && turn.mode === "chat" && mode === "fulfill");
}

export async function sendVenueTurn(input: VenueTurnInput) {
  const scene = await readSession(input.sessionId);
  const prior = scene.submissions.find((entry) => entry.id === input.submissionId);
  if (prior) runtimeDebug("submission replay", { sceneId: input.sessionId, submissionId: input.submissionId });
  if (!prior) await requireLiveVenueSession(input.sessionId);
  const payload = {
    message: input.message,
    mode: input.mode,
    targetId: input.targetId,
    ...(input.contact ? { contact: input.contact } : {}),
    ...((scene.operation?.id === input.submissionId ? scene.operation.input.interactionScopeVersion : 1) === 1
      ? { interactionScopeVersion: 1 }
      : {}),
  };
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
export async function leaveVenueSession(
  sessionId: string,
  submissionId: string,
  message = "",
  expectedSceneRevision?: number,
  retryOfAttemptId?: string,
) {
  const prior = (await readSession(sessionId)).submissions.find((entry) => entry.id === submissionId);
  if (!prior) await requireLiveVenueSession(sessionId);
  return coordinateVenue(
    sessionId,
    submissionId,
    "turn",
    { message, mode: "leave", targetId: "" },
    expectedSceneRevision,
    retryOfAttemptId,
    () => leaveVenueSessionOnce(sessionId, submissionId, message),
    { replay: !!prior },
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

async function finishActReply(
  session: VenueScene,
  submissionId: string,
  message: string,
  action: VenueActionResult,
  preparedReply?: Awaited<ReturnType<typeof generate>>,
): Promise<VenueScene> {
  await requireLiveVenueSession(session.id);
  const prior = session.submissions.find((entry) => entry.id === submissionId);
  if (prior?.actionReplyDone) return session;
  if (session.activeIds.length === 0) {
    return changeSession(session.id, (state) => {
      const entry = state.submissions.find((item) => item.id === submissionId);
      if (entry) entry.actionReplyDone = true;
    });
  }
  const reply =
    preparedReply ??
    (await venueCheckpoint("action-reply", () =>
      generate(
        session,
        message,
        "act",
        "",
        null,
        venueOperationSignal() ?? AbortSignal.timeout(90_000),
        undefined,
        action.narration,
      ),
    ));
  const currentVillage = await readVillageState();
  validateCurrentRoomInvitation(reply, currentVillage);
  const completed = await changeSession(session.id, (state) => {
    const entry = state.submissions.find((item) => item.id === submissionId);
    if (!entry || entry.actionReplyDone) return;
    const ids = appendVenueReply(state, reply.lines, new Date().toISOString());
    entry.replyLineIds = [...new Set([...(entry.replyLineIds ?? []), ...ids])];
    const playerLineId = state.lines.find((line) => line.role === "user" && line.at === entry.at)?.id ?? "";
    const wishChanges = bindWishProposals(
      reply.wishChanges,
      currentVillage,
      state.lines,
      playerLineId,
      ids,
      reply.wishContexts,
    );
    entry.wishProposals = wishChanges.proposals;
    entry.wishProposalError = wishChanges.error;
    entry.wishContexts = reply.wishContexts;
    entry.liveProposals = bindLiveProposals(reply, playerLineId, ids);
    entry.accessEvents = savedAccessEvents(reply.roomInterpretation);
    entry.requestMetrics = venueRequestMetrics();
    if (reply.invitationSignal) {
      reply.invitationSignal.sourceLineId =
        ids[
          reply.lines.findIndex(
            (line) =>
              (reply.invitationSignal?.evidenceKind === "action"
                ? line.kind === "narration"
                : line.speakerId === reply.invitationSignal?.residentId) &&
              line.content.includes(reply.invitationSignal!.quote),
          )
        ];
      entry.invitationSignal = reply.invitationSignal;
    }
    if (reply.invitationSignal?.venueId === state.placeId && reply.invitationSignal.timing === "now")
      applyImmediateZoneInvitation(state, reply.invitationSignal);
    applyInterpretedRoomEvents(state, reply.roomInterpretation, currentVillage);
    entry.actionReplyDone = true;
  });
  if (reply.roomInterpretation) await recordRoomAccessEvents(completed, reply.roomInterpretation);
  if (completed.zoneId !== session.zoneId) await markZoneSeen(completed, false);
  if (
    reply.invitationSignal &&
    (reply.invitationSignal.timing === "later" || reply.invitationSignal.venueId !== completed.placeId)
  )
    await recordSpokenInvitation(completed, reply.invitationSignal);
  if (reply.roomInterpretation) {
    await finalizeRoomInvitationDiagnostics(completed, reply.roomInterpretation, reply.invitationSignal);
    await writeInterpretationDiagnostics(session.id, reply.roomInterpretation.traces).catch(() => {});
    scheduleSystemComparisons(session.id, reply.roomInterpretation);
  }
  return refreshZoneParticipants(completed, true);
}

async function sendVenueTurnOnce(input: VenueTurnInput) {
  if (sceneWork().isMoving(input.sessionId)) throw conflict("Wait for zone navigation to finish before sending.");
  let session = await readSession(input.sessionId);
  const compatibilityWishCheck = input.mode === "fulfill";
  const requestMode = input.mode === "act" || input.mode === "fulfill" ? input.mode : undefined;
  const prior = session.submissions.find((entry) => entry.id === input.submissionId);
  if (prior) {
    if (
      prior.message !== input.message ||
      !matchesSavedTurnMode(prior, input.mode) ||
      prior.targetId !== input.targetId
    )
      throw conflict("That submission ID belongs to a different line.");
    if (prior.movement) return { session, verdict: null, action: null, recordEvents: [] };
    if (prior.mode === "act" && prior.action && !prior.actionReplyDone) {
      session = await finishActReply(session, input.submissionId, input.message, prior.action);
      await applyProjectPickup(session.id, input.submissionId);
      await processSavedExchange(session.id, input.submissionId);
      return {
        session,
        verdict: null,
        action: prior.action,
        recordEvents: prior.action.happened
          ? [{ id: `venue-action:${input.submissionId}`, kind: "venue" as const, text: prior.action.narration }]
          : [],
      };
    }
    if (prior.mode === "act" && prior.action?.happened) await applyProjectPickup(session.id, input.submissionId);
    try {
      await processSavedExchange(session.id, prior.id);
    } catch (error) {
      villagesLogger().warn("[villages] saved turn progress deferred for %s: %s", prior.id, String(error));
    }
    if (!prior.processing) await applyVenueTurnChange(session, prior);
    await applyFulfilledWish(session, prior);
    await applyVenueRequests(session, prior);
    if (
      prior.invitationSignal &&
      (prior.invitationSignal.timing === "later" || prior.invitationSignal.venueId !== session.placeId)
    )
      await recordSpokenInvitation(session, prior.invitationSignal);
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
  // New legacy submissions share Chat interpretation; saved legacy outcomes above retain their recovery.
  if (requestMode) input = { ...input, mode: "chat" };
  const admitted = venueOperationSnapshot<unknown>();
  if (admitted) session = coerceSession(admitted);
  if (session.status !== "active") throw conflict("That Scene is not active.");
  let movementVenue: VillageVenue | undefined;
  if (input.mode !== "leave" && session.zoneId) {
    const village = await readVillageState(),
      venue = village.venues.find((entry) => entry.id === session.placeId),
      zone = venue && resolveVenueZone(venue, session.zoneId);
    if (!venue || !zone || zoneClosed(village, venue, zone))
      throw conflict("This zone is closed. Move to another zone or leave the Venue.");
    movementVenue = venue;
  }
  if (input.mode !== "leave" && !input.message.trim()) throw badRequest("Write something before sending it.");
  if (input.message.length > 4000) throw badRequest("A line can be at most 4000 characters.");
  if (!explicitSceneActions() && (input.mode === "chat" || input.mode === "ask")) {
    const venue = movementVenue ?? (await readVillageState()).venues.find((entry) => entry.id === session.placeId);
    const movement = venue && readPlayerMovement(input.message, venue);
    if (movement)
      return {
        session: await moveVenueZoneOnce(session.id, movement.zoneId, { ...input, requestMode }),
        verdict: null,
        action: null,
        recordEvents: [],
      };
  }
  if (input.mode === "fulfill" && session.activeIds.length === 0)
    throw badRequest("Nobody is here to fulfill a wish for.");
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
  if (input.mode === "fulfill" && !input.targetId) throw badRequest("Choose one villager for Fulfill.");
  await rollActiveAgendas(new Date());
  const village = await readVillageState();
  let verdict: { fulfilled: boolean; reason: string } | null = null;
  let wishId = "";
  let wishMemory = "";
  let wishText = "";
  let wishInterpretation: InterpretationBatch | null = null;
  let wishUnresolved = false;
  let wishInterpretationProof: VenueSubmission["wishInterpretationProof"];
  if (input.mode === "fulfill") {
    const resident = village.villagers.find((person) => person.characterId === input.targetId);
    if (!resident) throw notFound("That villager no longer lives here.");
    const wishes = resident.agenda?.wishes ?? [];
    if (!wishes.length) throw badRequest(`${resident.cardSnapshot.name} is not waiting on anything at the moment.`);
    const player = readPlayerIdentity(village);
    const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now: new Date() });
    const judged = await venueCheckpoint("wish-verdict", () =>
      interpretWishClaim(
        {
          actorId: input.targetId,
          knowledgeByWish: Object.fromEntries(
            wishes.map((wish) => [wish.id, wishCheckKnowledge(village, input.targetId, wish.id, moment.instant)]),
          ),
          evidence: [
            ...heardLines(session, input.targetId)
              .filter(
                (line) => !line.contactHidden && !line.contactReport && line.kind !== "side" && line.kind !== "whisper",
              )
              .map((line) => ({
                id: line.id,
                speakerId: line.role === "user" ? "player" : line.speakerId,
                name: line.role === "user" ? player.name : line.name,
                content: line.content,
                kind: line.kind,
                at: line.at,
              })),
            ...(session.activeIds.includes(input.targetId)
              ? [
                  {
                    id: "scene-attendance",
                    speakerId: "player",
                    name: player.name,
                    kind: "attendance",
                    content: `Current authoritative Scene position: ${player.name} and ${resident.cardSnapshot.name} are together in this Zone.`,
                    at: new Date().toISOString(),
                  },
                ]
              : []),
          ],
          receipts: wishReceiptRecords(village, input.targetId, session),
          village: village.name,
          setting: villageCurrentSetting(village),
          moment,
          card: readEffectiveVillagerCard(resident),
          playerName: player.name,
          playerDescription: player.description,
          wishes,
          claim: input.message,
          transcript: heardLines(session, input.targetId).map((line) => ({
            role: line.role,
            content: `[Original speaker: ${line.role === "user" ? player.name : line.name}] ${line.content}`,
            at: line.at,
          })),
          happenings: wishReceiptRecords(village, input.targetId, session),
          worldState: (() => {
            const storedPlace = village.venues.find((venue) => venue.id === session.placeId);
            const place = storedPlace
              ? session.zoneId
                ? venueInZone(storedPlace, session.zoneId)
                : venueInArea(storedPlace, session.area, session.spaceClass, session.privateOwnerId)
              : undefined;
            if (!place) return [];
            return [
              `Current condition of ${place.name}: ${place.state.condition}`,
              ...place.state.publicFacts.slice(0, 12),
              ...(place.state.features ?? []).slice(0, 8).map((feature) => feature.text),
              ...place.state.furniture.slice(0, 12).map((item) => `Present item: ${item}`),
            ];
          })(),
          memory: memoryForVillager(
            village.chronicle,
            input.targetId,
            `${input.message} ${wishes.map((wish) => wish.wish).join(" ")}`,
          ),
        },
        session.id,
        input.submissionId,
      ),
    );
    verdict = judged.verdict;
    wishId = judged.wish?.id ?? "";
    wishMemory = judged.memory;
    wishText = judged.wish?.wish ?? "";
    wishInterpretation = judged.batch;
    wishUnresolved = judged.interpretationStatus === "unresolved";
    if (judged.wish) {
      const check = judged.batch.checks.find((item) => asRecord(item.facts).wishId === judged.wish!.id)!;
      wishInterpretationProof = {
        fingerprint: wishFingerprint(judged.wish),
        criteria: asRecord(check.facts).criteria as WishCriteria,
        receiptIds: asRecord(check.facts).matchingReceiptIds as string[],
      };
      const currentWish = (await readVillageState()).villagers
        .find((person) => person.characterId === input.targetId)
        ?.agenda?.wishes.find((item) => item.id === wishId);
      if (!currentWish || wishFingerprint(currentWish) !== wishInterpretationProof.fingerprint)
        throw conflict("That wish changed during interpretation. Your draft is preserved.");
    }
  }
  const responseTargetId = input.targetId || (session.activeIds.length === 1 ? session.activeIds[0]! : "");
  let contactIntentUsed: ContactIntent | null =
    input.mode === "contact"
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
    const venue = village.venues.find((entry) => entry.id === session.placeId);
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
  let reply = contactIntentUsed
    ? await contactReply(session, contactIntentUsed)
    : await venueCheckpoint("turn-reply", () =>
        generate(
          session,
          input.message,
          input.mode === "contact" ? "chat" : input.mode,
          responseTargetId,
          verdict
            ? { fulfilled: verdict.fulfilled, wish: wishText, unresolved: wishUnresolved, reason: verdict.reason }
            : null,
          venueOperationSignal() ?? AbortSignal.timeout(90_000),
        ),
      );
  if (!explicitSceneActions() && !contactIntentUsed && reply.contactIntent) {
    contactIntentUsed = reply.contactIntent;
    reply = await contactReply(session, contactIntentUsed);
  }
  if (!explicitSceneActions() && !contactIntentUsed && reply.movementIntent)
    return {
      session: await moveVenueZoneOnce(session.id, reply.movementIntent.zoneId, { ...input, requestMode }),
      verdict: null,
      action: null,
      recordEvents: [],
    };
  if (
    contactIntentUsed &&
    /^(?:goodbye|bye|see you(?: later)?|talk (?:to you )?later)\b/iu.test(input.message.trim().replace(/^["“‘']+/u, ""))
  ) {
    const addressedName = session.participants.find((person) =>
      input.message.toLowerCase().includes(person.name.toLowerCase()),
    );
    const endings = addressedName
      ? (session.doorwayContacts ?? []).filter((entry) => entry.characterId === addressedName.characterId)
      : (session.doorwayContacts ?? []);
    reply.contactEndIds = [...new Set([...reply.contactEndIds, ...endings.map((entry) => entry.characterId)])];
  }
  const contactSpeakers = contactIntentUsed
    ? [
        ...new Set(
          reply.lines.filter((line) => line.kind !== "narration" && !line.contactHidden).map((line) => line.speakerId),
        ),
      ]
    : [];
  if (contactIntentUsed) {
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
    if (
      new Set([
        ...session.activeIds.filter(
          (id) => !reply.contactMoves.some((move) => move.characterId === id && move.zoneId !== session.zoneId),
        ),
        ...reply.contactMoves.filter((move) => move.zoneId === session.zoneId).map((move) => move.characterId),
      ]).size > 4
    )
      throw badGateway("The reply would overcrowd this Zone. Your draft is preserved.");
  }
  const applicationVillage = await readVillageState();
  validateCurrentRoomInvitation(reply, applicationVillage);
  if (wishInterpretationProof) {
    const currentWish = applicationVillage.villagers
      .find((person) => person.characterId === input.targetId)
      ?.agenda?.wishes.find((wish) => wish.id === wishId);
    if (
      !currentWish ||
      wishFingerprint(currentWish) !== wishInterpretationProof.fingerprint ||
      (wishInterpretationProof.criteria.requiresPhysical &&
        !matchingWishReceipts(
          wishInterpretationProof.criteria,
          { actorId: input.targetId, receipts: wishReceiptRecords(applicationVillage, input.targetId, session) },
          currentWish,
        ).some((event) => wishInterpretationProof!.receiptIds.includes(event.id)))
    )
      throw conflict(
        "The wish or its authoritative evidence changed while the reply was prepared. Your draft is preserved.",
      );
  }
  const projectInterpretation =
    input.mode === "chat" || input.mode === "ask" || input.mode === "contact"
      ? await interpretProjectDraft(
          session,
          applicationVillage,
          input.message,
          reply.lines,
          reply.heardPlayerBy,
          input.submissionId,
          reply.interpretationRouting,
          reply.projectSpeech.map((proposal) => proposal.speakerId),
        )
      : null;
  if (projectInterpretation || applicationVillage.projects.some((project) => project.lifecycle)) {
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
    if (isInactive(state) && !hasVenueOperation(state.id))
      throw new VillagesRequestError(410, "Interrupted: Inactivity. This Scene ended while you were away.");
    if (state.sceneRevision !== session.sceneRevision)
      throw conflict("The conversation moved on. Try sending that line again.");
    const at = new Date().toISOString();
    state.lastActivityAt = at;
    if (contactIntentUsed) {
      const identities = new Set(reply.lines.filter((line) => line.kind !== "narration").map((line) => line.speakerId));
      for (const id of identities) {
        if (state.participants.some((entry) => entry.characterId === id)) continue;
        const person = state.sceneAttendance?.occupants.find((entry) => entry.characterId === id);
        if (person)
          state.participants.push({ characterId: id, name: person.name, doing: "Answering a contact request" });
        if (!state.heardHistory.some((entry) => entry.characterId === id))
          state.heardHistory.push({ characterId: id, lineIds: [] });
      }
      state.accessPreviousZones ??= {};
      for (const move of reply.contactMoves)
        state.accessPreviousZones[move.characterId] = contactPosition(state, move.characterId);
      state.accompanying = [
        ...(state.accompanying ?? []).filter(
          (entry) => !reply.contactMoves.some((move) => move.characterId === entry.characterId),
        ),
        ...reply.contactMoves.map((move) => ({ characterId: move.characterId, zoneId: move.zoneId })),
      ];
      const venue = village.venues.find((entry) => entry.id === state.placeId)!;
      const reachable = contactReach(
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
            delivery: contactIntentUsed!.delivery ?? "voice",
            ...(contactIntentUsed!.deviceFeatureId ? { deviceFeatureId: contactIntentUsed!.deviceFeatureId } : {}),
          })),
      ].filter((entry, index, all) => all.findIndex((other) => other.characterId === entry.characterId) === index);
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
    if (contactIntentUsed) {
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
    );
    if (
      compatibilityWishCheck &&
      state.lines.find((line) => line.id === playerLineId)?.heardBy.includes(input.targetId)
    ) {
      const cited = [
        playerLineId,
        ...replyLineIds.filter((id) => state.lines.find((line) => line.id === id)?.heardBy.includes(input.targetId)),
      ];
      for (const context of reply.wishContexts.filter((context) => context.actorId === input.targetId))
        if (
          !wishChanges.proposals.some((proposal) => proposal.wishId === context.wishId && proposal.intent !== "reveal")
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
      message: input.message,
      mode: input.mode,
      ...(requestMode ? { requestMode } : {}),
      targetId: input.targetId,
      ...(input.contact ? { contact: input.contact } : {}),
      ...(contactIntentUsed
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
      ...(wishInterpretationProof ? { wishInterpretationProof } : {}),
      recollections,
      wishProposals: wishChanges.proposals,
      wishProposalError: wishChanges.error,
      wishContexts: reply.wishContexts,
      liveProposals: bindLiveProposals(reply, playerLineId, replyLineIds),
      accessEvents: savedAccessEvents(reply.roomInterpretation),
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
    if (reply.sceneEnded || (session.activeIds.length > 0 && state.activeIds.length === 0 && !remaining)) {
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
  await applyFulfilledWish(updated, submission);
  if (wishInterpretation) {
    const current = await readVillageState();
    const applied = current.chronicle.some((entry) => entry.id === `${updated.id}:wish:${submission.wishId}`);
    for (const trace of wishInterpretation.traces)
      if (trace.applied === "Wish supported; awaiting current-state application")
        trace.applied = applied
          ? `Wish fulfilled using ${trace.result.source}; conditions, witnesses and current state validated`
          : "Rejected: wish or authoritative evidence changed before application";
    await writeInterpretationDiagnostics(updated.id, wishInterpretation.traces).catch(() => {});
    scheduleSystemComparisons(updated.id, wishInterpretation);
  }
  await applyVenueRequests(updated, submission);
  if (submission.invitationSignal) await recordSpokenInvitation(updated, submission.invitationSignal);
  await markZoneSeen(updated, updated.zoneId === session.zoneId);
  if (projectInterpretation) {
    await finalizeProjectDiagnostics(updated.id, projectInterpretation, submission.projectSpeech ?? [], submission.id);
    scheduleSystemComparisons(updated.id, projectInterpretation);
  }
  if (reply.roomInterpretation) {
    await finalizeRoomInvitationDiagnostics(updated, reply.roomInterpretation, submission.invitationSignal);
    await writeInterpretationDiagnostics(updated.id, reply.roomInterpretation.traces).catch(() => {});
    scheduleSystemComparisons(updated.id, reply.roomInterpretation);
  }
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
async function applySavedAccessEvents(scene: VenueScene, turn: VenueSubmission) {
  const events = turn.accessEvents ?? [];
  const batch = {
    checks: events.map((event) => ({ id: event.id, facts: event.facts })),
    results: events.map((event) => ({ outcome: event.outcome, evidenceIds: event.evidenceIds })),
    traces: events.map(() => ({ applied: "Saved access interpretation awaiting application" })),
  } as InterpretationBatch;
  await recordRoomAccessEvents(scene, batch, turn.id);
}
export async function recordRoomAccessEvents(
  scene: VenueScene,
  batch: InterpretationBatch,
  submissionId = scene.submissions.at(-1)?.id,
) {
  const turn = scene.submissions.find((turn) => turn.id === submissionId);
  if (!turn?.replyLineIds?.length || !turn.at) return;
  await mutateVillageState((state) => {
    if (scene.villageSeed && state.seed !== scene.villageSeed) return;
    const initialRevisions = new Map(state.venues.map((venue) => [venue.id, venue.access?.revision]));
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
      if (management.action && result.outcome !== "access-management") {
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
            !!line && line.speakerId === actor && line.kind !== "narration" && turn.replyLineIds.includes(line.id),
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
          !/\b(?:ban|banned|barred)\b/iu.test(speech) ||
          /\b(?:not banned|not ban|won't ban|would|might|if|joking)\b/iu.test(speech))
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
              accompanied: false,
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
  });
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

function validateCurrentRoomInvitation(reply: Pick<SceneReply, "invitationSignal">, village: VillageState): void {
  const signal = reply.invitationSignal;
  if (!signal) return;
  const venue = village.venues.find((entry) => entry.id === signal.venueId);
  const zone = venue && resolveVenueZone(venue, signal.zoneId);
  if (!venue || !zone || zoneClosed(village, venue, zone) || !canInviteToZone(venue, zone, signal.residentId))
    reply.invitationSignal = null;
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

export async function recordSpokenInvitation(
  session: VenueScene,
  signal: NonNullable<VenueSubmission["invitationSignal"]>,
): Promise<void> {
  const quote = signal.quote.replace(/\s+/gu, " ").toLowerCase();
  const spoken = session.lines.find(
    (line) =>
      (signal.evidenceKind === "action" ? line.kind === "narration" : line.speakerId === signal.residentId) &&
      line.content.replace(/\s+/gu, " ").toLowerCase().includes(quote) &&
      (!signal.sourceLineId || line.id === signal.sourceLineId),
  );
  if (!spoken || !quote) return;
  await mutateVillageState((state) => {
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
        recordedAt: new Date().toISOString(),
        scope: signal.scope,
        ownerId: signal.ownerId,
        sourceLineId: spoken.id,
        quote: signal.quote,
      },
    ].slice(-16);
  });
}

async function markResidenceSeen(session: VenueScene, generateImage = true): Promise<void> {
  let admitted = false;
  await mutateVillageState((state) => {
    admitted = false;
    const venue = state.venues.find((entry) => entry.id === session.placeId);
    if (!venue || !venueClasses(venue).includes("residence")) return;
    if (session.zoneId) {
      const zone = resolveVenueZone(venue, session.zoneId);
      if (
        !zone ||
        (venue.access &&
          !evaluateZoneAccess(venue, zone, "player", {
            ...sceneAccessContext(session, state),
            unavailable: zoneClosed(state, venue, zone),
          }).allowed)
      )
        return;
      zone.seen = true;
    } else if (session.area === "shared") venue.playerSeenShared = true;
    if (!session.zoneId && session.area === "private" && venueResidentIds(venue).includes(session.privateOwnerId))
      venue.playerSeenPrivateIds = [...new Set([...(venue.playerSeenPrivateIds ?? []), session.privateOwnerId])];
    admitted = true;
  });
  if (admitted && generateImage && session.area === "private" && session.privateOwnerId) {
    outsideVenueOperation(() => {
      void import("../media/location-image.js")
        .then(({ generateFirstPrivateSpaceImage }) =>
          generateFirstPrivateSpaceImage(
            session.placeId,
            session.zoneId ?? session.privateSpaceId ?? session.privateOwnerId,
          ),
        )
        .catch((error) => villagesLogger().warn("[villages] private-space image could not start: %s", String(error)));
    });
  }
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
          submission.at ?? new Date().toISOString(),
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
        villagesLogger().warn("[villages] residence request was no longer valid: %s", String(error));
      }
    } else {
      try {
        await decideVillageResidence(signal.characterId, signal.approved === true, "villager");
      } catch (error) {
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
      villagesLogger().warn("[villages] upgrade request was no longer valid: %s", String(error));
    }
  }
}

async function applyVenueTurnChange(session: VenueScene, submission: VenueSubmission): Promise<void> {
  if (!submission.sceneChange) return;
  const area = submission.areaAtTurn ?? session.area;
  const zoneId = submission.zoneIdAtTurn ?? session.zoneId;
  if (area === "private") return;
  const privateOwnerId = submission.privateOwnerIdAtTurn ?? session.privateOwnerId;
  const id = `venue-chat:${session.id}:${submission.id}`;
  await mutateVillageState((state) => {
    if (session.villageSeed && state.seed !== session.villageSeed) return;
    if (state.venues.some((venue) => venue.id === session.placeId && venue.constructionStatus === "worksite")) return;
    if (
      area === "shared" &&
      state.venues.some((venue) => venue.id === session.placeId && venueResidentIds(venue).length > 0)
    )
      return;
    const controlledVenue = state.venues.find((venue) => venue.id === session.placeId);
    const controlledZone = controlledVenue && resolveVenueZone(controlledVenue, zoneId ?? "");
    if (controlledZone?.kind === "staff" || controlledZone?.kind === "restricted") return;
    if (state.venueEvents.some((event) => event.id === id) || state.exchangeReceipts[id]?.physicalOutcome) return;
    const change = readVenueSceneChange(
      { happened: true, ...submission.sceneChange },
      (() => {
        const place = state.venues.find((entry) => entry.id === session.placeId);
        return place
          ? zoneId
            ? venueInZone(place, zoneId)
            : venueInArea(place, area, session.spaceClass, privateOwnerId)
          : undefined;
      })(),
      submission.activeIdsAtTurn ?? [],
      state.villagers.map((person) => person.characterId),
    );
    if (!change) return;
    if (
      change.removeItem &&
      state.projects.some(
        (project) =>
          project.kind === "build-venue" &&
          project.status !== "complete" &&
          project.plan?.sources.some(
            (source) =>
              source.kind === "existing-item" &&
              source.venueId === session.placeId &&
              (!source.zoneId || source.zoneId === zoneId) &&
              source.itemName === change.removeItem &&
              source.remaining > 0,
          ),
      )
    )
      return; // A project receipt, not a scene edit, must debit this recorded item.
    const at = submission.at || new Date().toISOString();
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
                witnessIds: [...(submission.activeIdsAtTurn ?? [])],
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

async function applyFulfilledWish(session: VenueScene, submission: VenueSubmission): Promise<boolean> {
  if (!submission.wishId) return false;
  let applied = false;
  await mutateVillageState((state) => {
    applied = false;
    const memoryId = `${session.id}:wish:${submission.wishId}`;
    if (state.correctedWishMemoryIds.includes(memoryId)) return;
    if (state.chronicle.some((entry) => entry.id === memoryId)) return;
    const resident = state.villagers.find((person) => person.characterId === submission.targetId);
    const wish = resident?.agenda?.wishes.find((entry) => entry.id === submission.wishId);
    if (!resident?.agenda || !wish) return;
    const proof = submission.wishInterpretationProof;
    if (
      proof &&
      (proof.fingerprint !== wishFingerprint(wish) ||
        (proof.criteria.conditionRevision ?? 0) !==
          wishConditionRevision(state, submission.targetId, wish, proof.criteria.conditionAt) ||
        (proof.criteria.requiresPhysical &&
          !matchingWishReceipts(
            proof.criteria,
            { actorId: submission.targetId, receipts: wishReceiptRecords(state, submission.targetId, session) },
            wish,
          ).some((event) => proof.receiptIds.includes(event.id))))
    )
      return;
    applied = true;
    const moment = deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now: new Date() });
    fulfillResidentWish(resident, wish.id, moment.instant, memoryId);
    setWishJournalStatus(state, submission.targetId, wish.id, "fulfilled");
    state.chronicle = [
      {
        id: memoryId,
        dayIndex: moment.dayIndex,
        clock: moment.dayPhase,
        occurredAt: moment.instant,
        timePrecision: "exact",
        scope: "private",
        actors: [{ id: submission.targetId, name: resident.cardSnapshot.name }],
        kind: "favour",
        weight: wish.intensity,
        text: submission.wishMemory || `${resident.cardSnapshot.name} saw their wish fulfilled.`,
      },
      ...state.chronicle,
    ];
  });
  return applied;
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
  const wishId = `${session.id}:wish:${submission.wishId}`;
  if (submission.wishId && village.chronicle.some((entry) => entry.id === wishId))
    events.push({ id: wishId, kind: "wish", text: "A villager's wish was fulfilled." });
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

export async function endVenueSession(id: string, retryOfAttemptId?: string): Promise<VenueScene> {
  return coordinateVenue(id, "close", "close", {}, undefined, retryOfAttemptId, () => closeVenueSessionOnce(id));
}

/** Close the Scene and return its committed visible changes. */
export async function endVenueSessionWithReceipts(id: string, retryOfAttemptId?: string) {
  const session = await endVenueSession(id, retryOfAttemptId);
  return { session, recordEvents: await sceneReceipts(session) };
}

/** Archive the Scene after recovering saved exchange work; no closing review. */
export async function closeVenueSession(
  id: string,
  expectedSceneRevision?: number,
  retryOfAttemptId?: string,
): Promise<VenueScene> {
  return coordinateVenue(id, "close", "close", {}, expectedSceneRevision, retryOfAttemptId, () =>
    closeVenueSessionOnce(id),
  );
}
async function closeVenueSessionOnce(id: string): Promise<VenueScene> {
  stopInterpretationComparisons(id);
  const session = await readSession(id);
  for (const turn of session.submissions.filter((turn) => turn.processing && unfinishedExchange(turn.processing))) {
    await processSavedExchange(id, turn.id).catch((error) =>
      villagesLogger().warn("[villages] deferred Scene recovery: %s", String(error)),
    );
  }
  return closeLiveScene(await readSession(id));
}

export async function closeVenueSessionWithReceipts(
  id: string,
  expectedSceneRevision?: number,
  retryOfAttemptId?: string,
) {
  const session = await closeVenueSession(id, expectedSceneRevision, retryOfAttemptId);
  return { session, recordEvents: await sceneReceipts(session) };
}

async function closeLiveScene(session: VenueScene): Promise<VenueScene> {
  const closed = await changeSession(session.id, (state) => {
    state.status = "closed";
    state.endedAt ||= new Date().toISOString();
    state.endReason ||= "player";
  });
  await clearActivePointer(session.id);
  await pruneVenueVisits();
  return closed;
}

export async function recordVenueAction(
  placeId: string,
  action: string,
  result: VenueActionResult,
  submissionId: string,
): Promise<void> {
  const session = await activeVenueSession();
  if (!session || session.placeId !== placeId || session.status !== "active")
    throw conflict("That Scene is not active.");
  const village = await readVillageState();
  await changeSession(session.id, (state) => {
    if (isInactive(state) && !hasVenueOperation(state.id))
      throw new VillagesRequestError(410, "Interrupted: Inactivity. This Scene ended while you were away.");
    if (state.submissions.some((entry) => entry.id === submissionId)) return;
    const at = new Date().toISOString();
    state.lastActivityAt = at;
    appendLine(state, {
      id: randomUUID(),
      speakerId: "",
      name: "",
      role: "user",
      content: action,
      at,
      heardBy: [...state.activeIds],
    });
    const sceneLineId = randomUUID();
    appendLine(state, {
      id: sceneLineId,
      speakerId: "__venue_scene__",
      name: "Scene",
      role: "assistant",
      content: result.narration,
      at,
      heardBy: [...state.activeIds],
    });
    const prepared = venueSavedCheckpoint<Awaited<ReturnType<typeof generate>>>("action-reply");
    if (prepared) appendVenueReply(state, prepared.lines, at);
    const preparedIds = prepared ? state.lines.slice(-prepared.lines.length).map((line) => line.id) : [];
    const wishChanges = prepared
      ? bindWishProposals(
          prepared.wishChanges,
          village,
          state.lines,
          state.lines.find((line) => line.role === "user" && line.at === at)?.id ?? "",
          preparedIds,
          prepared.wishContexts,
        )
      : { proposals: [], error: "" };
    state.submissions.push({
      id: submissionId,
      message: action,
      mode: "act",
      targetId: "",
      verdict: null,
      wishId: "",
      wishMemory: "",
      action: result,
      actionReplyDone: !!prepared || state.activeIds.length === 0,
      requestMetrics: venueRequestMetrics(),
      wishContexts: prepared?.wishContexts ?? [],
      wishProposals: wishChanges.proposals,
      wishProposalError: wishChanges.error,
      ...(prepared
        ? {
            liveProposals: bindLiveProposals(
              prepared,
              state.lines.find((line) => line.role === "user" && line.at === at)?.id ?? "",
              preparedIds,
            ),
          }
        : state.activeIds.length === 0
          ? {
              liveProposals: bindLiveProposals(
                quietContactReply("", []),
                state.lines.find((line) => line.role === "user" && line.at === at)?.id ?? "",
                [],
              ),
            }
          : {}),
      areaAtTurn: state.area,
      zoneIdAtTurn: state.zoneId,
      activeIdsAtTurn: [...state.activeIds],
      activeIdsAfterTurn: [...state.activeIds],
      replyLineIds: [
        sceneLineId,
        ...(prepared ? state.lines.slice(-prepared.lines.length).map((line) => line.id) : []),
      ],
      at,
    });
  });
  try {
    await processSavedExchange(session.id, submissionId);
  } catch (error) {
    villagesLogger().warn("[villages] saved action progress deferred for %s: %s", submissionId, String(error));
  }
}

export async function discardVenueVisitDebug(id: string): Promise<void> {
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
    state.endedAt = new Date().toISOString();
    state.endReason = "debug";
  });
  await clearActivePointer(id);
  const document = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${session.id}`);
  if (document) await villagesDocuments().remove(VILLAGES_PACKAGE_ID, document.id, document.revision);
}

/** A village reset also removes the previous village's private Scene archive. */
export async function resetVenueSessions(): Promise<void> {
  if ((await readActive()).sessionId) throw conflict("Finish the active Scene before starting the village over.");
  const documents = villagesDocuments();
  const visits = await documents.list(VILLAGES_PACKAGE_ID, SESSION_KIND);
  for (const visit of visits)
    if (!(await documents.remove(VILLAGES_PACKAGE_ID, visit.id, visit.revision)))
      throw conflict("A venue archive changed while the village was being reset. Try again.");
  const pointer = await documents.getById(VILLAGES_PACKAGE_ID, ACTIVE_ID);
  if (pointer && !(await documents.remove(VILLAGES_PACKAGE_ID, ACTIVE_ID, pointer.revision)))
    throw conflict("The active venue changed while the village was being reset. Try again.");
}

export async function recoverVenueSceneWork() {
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
            operation.input.domain as "memories" | "relationships" | "wishes",
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
    if (operation.kind === "memory" || operation.kind === "close")
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
