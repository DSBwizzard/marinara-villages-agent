import { buildVenueResponseContract } from "./venue-response-contract.js";
import { runtimeDebug } from "./runtime-debug.js";
import {
  LIVE_MEMORY_INSTRUCTION,
  bindLiveProposals,
  mergeLiveReplyProposals,
  memoryVersion,
  processLiveMemories,
  processLiveRelationships,
  liveEvidence,
  type LiveExchangeProposals,
} from "./live-memory.js";
import {
  bindWishProposals,
  processWishExchange,
  processProjectWishOutbox,
  WISH_PROPOSAL_INSTRUCTION,
  type WishProposal,
} from "./wish-progress.js";
import {
  createExchangeProcessing,
  coerceExchangeProcessing,
  dispatchExchange,
  unfinishedExchange,
  type ExchangeProcessing,
} from "./exchange-processing.js";
import { relationshipZoneController, mutateRelationships, applyRelationshipReview } from "./relationship-store.js";
import {
  relationshipWritingPrompt,
  relationshipPrompt,
  relationshipClosingNotices,
  captureRelationshipKnowledge,
} from "./relationships.js";
import {
  emptyRelationshipReview,
  parseRelationshipReview,
  substantiveContact,
  RELATIONSHIP_REVIEW_INSTRUCTION,
} from "./relationship-review.js";
import type { RelationshipReview, RelationshipEvidenceLine, RelationshipReceipt } from "./relationship-types.js";
import { renderPlayerRoleWritingContext } from "./player-role.js";
import { venueFoundingBackground } from "./venue-scene-context.js";
import { fulfillResidentWish } from "./wish-lifecycle.js";
import { zoneControllerIds } from "./venue-zones.js";
import { interpretRoomReply, dismissalDestination } from "./room-interpretation.js";
import {
  scheduleSystemComparisons,
  writeInterpretationDiagnostics,
  stopInterpretationComparisons,
  removeInterpretationDiagnostics,
} from "./interpretation-diagnostics.js";
import type { InterpretationBatch } from "./interpretation.js";
import {
  coordinateVenue,
  cancelVenueOperation,
  hasVenueOperation,
  venueCheckpoint,
  venueSavedCheckpoint,
  outsideVenueOperation,
  venueOperationSignal,
  venueOperationId,
  venueRequestMetrics,
  venueOperationSnapshot,
  assertVenueOwnership,
  sceneRevision,
  venueRefusal,
  recoverVenueOperations,
  rejectVenueCompletion,
  type VenueOperation,
} from "./venue-coordinator.js";
import {
  venueZones,
  resolveVenueZone,
  legacyZoneId,
  zoneArea,
  canOccupyZone,
  canInviteToZone,
  chooseAgendaZone,
  zoneClosed,
  venueInZone,
} from "./venue-zones.js";
import { createHash, randomUUID } from "node:crypto";
import {
  initialStaging,
  readStagingCues,
  replayStaging,
  stagingTranscriptEvents,
  stagingLayout,
  type StagingCue,
} from "../../../../shared/src/villages/scene-staging.js";
import { describeSpriteExpressions, validateSpriteExpression } from "./sprite-expressions.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { agendaAt } from "./agenda-plan.js";
import { readEffectiveVillagerCard } from "./catalog.js";
import {
  buildVenueSceneBlocks,
  venueCardProfile,
  fitVenueWritingMessages,
  EVENT_MEMORY_GUIDANCE,
  type VenueWritingBlock,
} from "./venue-writing.js";
export { venueCardProfile } from "./venue-writing.js";
import { memoryForVillager } from "./chat.js";
import { asRecord, asString, asTrimmedString } from "./coerce.js";
import { villagesConnectionIdFor } from "./connections.js";
import { VillagesRequestError, badGateway, badRequest, conflict, notFound } from "./errors.js";
import { readVillageLore } from "./lorebooks.js";
import { selectPromptMemories, selectPromptRecollections } from "./memory-selection.js";
import {
  VENUE_SCENE_WRITING_FOUNDATION,
  venueAdditionalWritingGuidance,
  venueWritingDirection,
} from "./narration-style.js";
import {
  VILLAGES_PACKAGE_ID,
  completeWithRoom,
  villagesDocuments,
  villagesLanguageModels,
  villagesLogger,
  villagesDebugAgentsEnabled,
} from "./package-runtime.js";
import { MAX_CHRONICLE_LENGTH, prependHappenings, villageCurrentSetting } from "./prompt-preset.js";
import type { VillageChronicleEntry, VillageMemoryCategory, VillageRecollection, VillageState } from "./types.js";
import { deriveVillageMoment } from "./village-clock.js";
import { type DocumentSlot, mutateDocument, mutateVillageState, readVillageState } from "./village-store.js";
import {
  decideVillageResidence,
  applyResidenceEditApproval,
  proposeVillageResidence,
  readPlayerIdentity,
  rollActiveAgendas,
  queueVillageVenueRequest,
  villagerPlaceView,
} from "./village.js";
import {
  interpretWishClaim,
  wishFingerprint,
  matchingWishReceipts,
  wishReceiptRecords,
  coerceWishApplicationProof,
  type WishCriteria,
} from "./wish-interpretation.js";
import {
  interpretProjectDraft,
  projectProposals,
  finalizeProjectDiagnostics,
  applyLegacyProjectInterpretation,
  applyProjectPickup,
} from "./project-checks.js";
import { extractJsonObject } from "./village-bootstrap.js";
import { extractSceneReply } from "./scene-reply-json.js";
import type { VenueActionResult } from "./venue-actions.js";
import { applyVenueSceneChange, readVenueSceneChange, type VenueSceneChange } from "./venue-scene-state.js";
import { venueReplyIntegrity, venueSceneHistory } from "./venue-turn-integrity.js";
import { venueClasses, venueInArea, venueResidentIds } from "./venue-model.js";
import { recordVillagerVenueImprovement } from "./venue-mailbox.js";
import { recordProjectConversation } from "./project-lifecycle.js";
import { ingestSavedProgressEvent } from "./progress-runtime.js";
import { processProjectSpeechTurn } from "./project-evidence.js";
import {
  bindProjectSpeech,
  coerceProjectSpeech,
  projectSpeechContexts,
  projectSpeechPrompt,
  type ProjectSpeechContext,
  type ProjectSpeechProposal,
} from "./project-interpretation.js";
import { readVenueRequestCore } from "./venue-requests.js";
import type { VillageVenueClass } from "./types.js";
import {
  contactNeighbors,
  contactReach,
  contactDevice,
  contactSpeech,
  readContactDelivery,
  contactPosition,
  contactPath,
  contactCanEnter,
  readContactIntent,
  readContactMoves,
  readContactRelay,
  type ContactIntent,
  type DoorwayContact,
  type ContactMove,
  type ContactRelay,
} from "./venue-contact.js";

export type VenueLine = {
  id: string;
  speakerId: string;
  name: string;
  role: "user" | "assistant";
  content: string;
  at: string;
  heardBy: string[];
  zoneId?: string;
  viaDoorway?: boolean;
  remoteDelivery?: "loud" | "device";
  contactHidden?: boolean;
  contactReport?: boolean;
  kind?: "narration" | "dialogue" | "side" | "whisper";
  expression?: string;
  gazeAt?: string;
  staging?: StagingCue[];
  targetId?: string;
  asideFor?: string;
};

export type VenueParticipant = { characterId: string; name: string; doing: string };

/** Server-only positions for one Scene across every Zone of its Venue. */
type SceneAttendance = {
  capturedAt: string;
  occupants: (VenueParticipant & { zoneId: string; availability: string })[];
};
/** Immutable room evidence for project accounting; a model verdict alone is never a receipt. */
export async function readProjectTurnEvidence(sessionId: string, submissionId: string) {
  const session = await readSession(sessionId);
  const submission = session.submissions.find((entry) => entry.id === submissionId);
  if (!submission) throw notFound("That roleplay turn was not recorded.");
  const venue = (await readVillageState()).venues.find((entry) => entry.id === session.placeId);
  const zoneId =
    submission.zoneIdAtTurn ??
    session.zoneId ??
    (venue
      ? legacyZoneId(
          venue,
          submission.areaAtTurn ?? session.area,
          session.spaceClass,
          submission.privateOwnerIdAtTurn ?? session.privateOwnerId,
        )
      : undefined);
  return {
    sessionId,
    venueId: session.placeId,
    zoneId,
    submissionId,
    mode: submission.mode,
    message: submission.message,
    at: submission.at ?? "",
    areaAtTurn: submission.areaAtTurn ?? session.area,
    activeIdsAtTurn: [
      ...new Set([
        ...(submission.activeIdsAtTurn ?? session.participants.map((participant) => participant.characterId)),
        ...(submission.speechIdsAtTurn ?? []),
      ]),
    ],
    action: submission.action ?? null,
    projectContexts: submission.projectContexts ?? [],
    projectSpeech: submission.projectSpeech ?? [],
    contextualInterpretation: submission.projectInterpretationVersion === 1,
    contextLines: session.lines
      .slice(
        0,
        Math.max(
          0,
          session.lines.findIndex((line) => submission.replyLineIds?.includes(line.id)),
        ),
      )
      .filter((line) => !line.contactHidden && !line.contactReport && line.kind !== "side" && line.kind !== "whisper"),
    lines: session.lines.filter((line) =>
      submission.replyLineIds?.length
        ? submission.replyLineIds.includes(line.id) &&
          line.role === "assistant" &&
          (submission.activeIdsAtTurn?.includes(line.speakerId) ||
            submission.speechIdsAtTurn?.includes(line.speakerId)) &&
          !line.contactHidden &&
          !line.contactReport
        : line.at === submission.at &&
          line.role === "assistant" &&
          !line.contactHidden &&
          !line.contactReport &&
          session.participants.some((participant) => participant.characterId === line.speakerId),
    ),
  };
}
type VenueSubmission = {
  wishProposals?: WishProposal[];
  wishProposalError?: string;
  processing?: ExchangeProcessing;
  id: string;
  message: string;
  mode: "chat" | "ask" | "fulfill" | "act" | "leave" | "contact";
  contact?: ContactIntent;
  speechIdsAtTurn?: string[];
  contactEvidence?: { moves: ContactMove[]; relay: ContactRelay | null };
  targetId: string;
  areaAtTurn?: VenueScene["area"];
  zoneIdAtTurn?: string;
  privateOwnerIdAtTurn?: string;
  activeIdsAtTurn?: string[];
  activeIdsAfterTurn?: string[];
  replyLineIds?: string[];
  projectContexts?: ProjectSpeechContext[];
  projectSpeech?: ProjectSpeechProposal[];
  projectInterpretationVersion?: 1;
  wishInterpretationProof?: { fingerprint: string; criteria: WishCriteria; receiptIds: string[] };
  progressProcessedAt?: string;
  progressError?: string;
  verdict: { fulfilled: boolean; reason: string } | null;
  wishId: string;
  wishMemory: string;
  action?: VenueActionResult;
  actionReplyDone?: boolean;
  sceneChange?: VenueSceneChange;
  residenceSignal?: { kind: "request" | "decision"; characterId: string; venueId: string; approved?: boolean };
  upgradeSignal?: { characterId: string; venueId: string; quote: string };
  venueRequestSignal?: {
    characterId: string;
    name: string;
    classes: VillageVenueClass[];
    quote: string;
    sourceLineId?: string;
  };
  invitationSignal?: {
    residentId: string;
    venueId: string;
    scope: "shared" | "private";
    zoneLabel?: string;
    privateSpaceId?: string;
    zoneId?: string;
    area?: VenueScene["area"];
    spaceClass?: VillageVenueClass;
    accompanies?: boolean;
    timing: "now" | "later";
    evidenceKind?: "speech" | "action";
    ownerId: string;
    quote: string;
    sourceLineId?: string;
  };
  editApprovalSignal?: {
    proposalId: string;
    residentId: string;
    approved: boolean;
    quote: string;
    sourceLineId?: string;
  };
  turnMemories?: VenueMemory[];
  recollections?: VenueRecollection[];
  liveProposals?: LiveExchangeProposals;
  wishContexts?: { actorId: string; wishId: string; fingerprint: string }[];
  requestMetrics?: ReturnType<typeof venueRequestMetrics>;
  interpretationHistory?: { at: string; domain: string; source: string; proposals: unknown }[];
  changeSequence?: number;
  recordEvents?: VenueRecordEvent[];
  at?: string;
};

type VenueMemory = { characterId: string; text: string; lineIds?: string[] };
type VenueRecollection = {
  relationshipOnly?: boolean;
  id: string;
  text: string;
  subjectCharacterIds: string[];
  knownByCharacterIds: string[];
  lineIds: string[];
};
type VenueMemoryDecision = {
  id: string;
  action: "promote" | "reject";
  recollectionIds: string[];
  reason: string;
  category?: VillageMemoryCategory;
  text?: string;
  subjectCharacterIds?: string[];
  knownByCharacterIds?: string[];
  lineIds?: string[];
};
type VenueMemoryReview = {
  applied?: boolean;
  status: "none" | "pending" | "complete";
  attempts: number;
  error: string;
  nextRecollection: number;
  decisions: VenueMemoryDecision[];
};
export type VenueRecordEvent = {
  id: string;
  kind: "memory" | "wish" | "venue" | "request" | "project" | "relationship-up" | "relationship-down";
  text: string;
  /** The exact saved memory behind a short memory receipt. Older persisted receipts may omit it. */
  detail?: string;
};
type MemoryProgress = { nextUnit: number; entries: VenueMemory[] };

/** One document is both the active transcript and the player's durable Scene archive. */
export type VenueScene = {
  version: 1;
  processingVersion?: 1;
  changeSequence?: number;
  villageSeed?: string;
  sceneRevision: number;
  operation?: VenueOperation;
  generationReceipts?: {
    operationId: string;
    attemptId: string;
    stages: string[];
    outcome: "unknown";
    acknowledgedAt: string;
  }[];
  stagingVersion?: 1;
  id: string;
  placeId: string;
  placeName: string;
  spaceClass?: VillageVenueClass;
  zoneId?: string;
  legacyCast?: boolean;
  grantedZoneIds?: string[];
  enteredFromZoneId?: string;
  dismissedZoneIds?: string[];
  pendingRoomQuestions?: string[];
  pendingProjectQuestions?: string[];
  zoneGrants?: { zoneId: string; controllerId: string; source?: "relationship" }[];
  privateSpaceId?: string;
  accompanying?: { characterId: string; zoneId: string }[];
  doorwayContacts?: DoorwayContact[];
  entryOffers?: { zoneId: string; label: string; controllerId: string; accompanies: boolean }[];
  /** Ephemeral prompt context; never stored or disclosed. */
  contactGeneration?: {
    instruction: string;
    localIds: string[];
    remoteIds: string[];
    delivery?: "voice" | "loud" | "device";
  };
  departedIds?: string[];
  area: "outside" | "shared" | "private" | "public";
  privateOwnerId: string;
  privateAccessOwnerId: string;
  startedAt: string;
  endedAt: string;
  lastActivityAt: string;
  endReason: "player" | "scene" | "inactivity" | "debug" | "";
  memoryMode: "live" | "tiered" | "turn" | "end";
  status: "opening" | "active" | "closing" | "closed";
  participants: VenueParticipant[];
  sceneAttendance?: SceneAttendance;
  activeIds: string[];
  lines: VenueLine[];
  heardHistory: { characterId: string; lineIds: string[] }[];
  submissions: VenueSubmission[];
  memories: VenueMemory[] | null;
  memoryProgress: MemoryProgress | null;
  memoryPending: boolean;
  memoryReview: VenueMemoryReview;
  relationshipReview?: { seed: string; applied: boolean; batches: RelationshipReview[]; receipts: VenueRecordEvent[] };
  recap: string;
};

/** Compatibility name for existing package integrations and saved Scene workflows. */
export type VenueSession = VenueScene;

type ActiveVenue = { sessionId: string; placeId: string };
const ACTIVE_ID = "villages-active-venue";
const SESSION_PREFIX = "villages-venue-visit-";
const SESSION_KIND = "venue-visit";
const VENUE_REPLY_MAX_TOKENS = 4_096;
const VENUE_REPLY_TEMPERATURE = 0.85;
const INACTIVITY_MS = 30 * 60 * 1000;
const ACTIVITY_WRITE_MS = 15 * 1000;

function coerceActive(value: unknown): ActiveVenue {
  const raw = asRecord(value);
  return { sessionId: asTrimmedString(raw.sessionId), placeId: asTrimmedString(raw.placeId) };
}

const activeSlot: DocumentSlot<ActiveVenue> = {
  kind: "venue-active",
  name: "Active Scene",
  description: "The one Scene the player is in.",
  coerce: coerceActive,
  label: () => "Active Scene",
};

function coerceVenueRecollection(value: unknown): VenueRecollection | null {
  const raw = asRecord(value);
  const id = asTrimmedString(raw.id);
  const text = asTrimmedString(raw.text).slice(0, MAX_CHRONICLE_LENGTH);
  const subjectCharacterIds = Array.isArray(raw.subjectCharacterIds)
    ? [...new Set(raw.subjectCharacterIds.filter((id): id is string => typeof id === "string" && !!id))]
    : [];
  const knownByCharacterIds = Array.isArray(raw.knownByCharacterIds)
    ? [...new Set(raw.knownByCharacterIds.filter((id): id is string => typeof id === "string" && !!id))]
    : [];
  const lineIds = Array.isArray(raw.lineIds)
    ? [...new Set(raw.lineIds.filter((lineId): lineId is string => typeof lineId === "string" && !!lineId))]
    : [];
  return id && text && knownByCharacterIds.length && lineIds.length
    ? { id, text, subjectCharacterIds, knownByCharacterIds, lineIds }
    : null;
}

function coerceMemoryDecision(value: unknown): VenueMemoryDecision | null {
  const raw = asRecord(value);
  const id = asTrimmedString(raw.id);
  const action = raw.action === "promote" ? "promote" : raw.action === "reject" ? "reject" : null;
  const recollectionIds = Array.isArray(raw.recollectionIds)
    ? [...new Set(raw.recollectionIds.filter((entry): entry is string => typeof entry === "string" && !!entry))]
    : [];
  if (!id || !action || !recollectionIds.length) return null;
  const category =
    raw.category === "commitment" ||
    raw.category === "personal-fact" ||
    raw.category === "preference" ||
    raw.category === "relationship" ||
    raw.category === "shared-experience"
      ? raw.category
      : undefined;
  const strings = (field: unknown) =>
    Array.isArray(field)
      ? [...new Set(field.filter((entry): entry is string => typeof entry === "string" && !!entry))]
      : undefined;
  return {
    id,
    action,
    recollectionIds,
    reason: asTrimmedString(raw.reason).slice(0, 240),
    ...(category ? { category } : {}),
    ...(asTrimmedString(raw.text) ? { text: asTrimmedString(raw.text).slice(0, MAX_CHRONICLE_LENGTH) } : {}),
    ...(strings(raw.subjectCharacterIds) ? { subjectCharacterIds: strings(raw.subjectCharacterIds) } : {}),
    ...(strings(raw.knownByCharacterIds) ? { knownByCharacterIds: strings(raw.knownByCharacterIds) } : {}),
    ...(strings(raw.lineIds) ? { lineIds: strings(raw.lineIds) } : {}),
  };
}

function coerceSession(value: unknown): VenueScene {
  const raw = asRecord(value);
  const participants = Array.isArray(raw.participants)
    ? raw.participants
        .map((value) => {
          const row = asRecord(value);
          return {
            characterId: asTrimmedString(row.characterId),
            name: asTrimmedString(row.name),
            doing: asTrimmedString(row.doing),
          };
        })
        .filter((person) => person.characterId && person.name)
    : [];
  const participantIds = new Set(participants.map((person) => person.characterId));
  const lines: VenueLine[] = Array.isArray(raw.lines)
    ? raw.lines
        .map((value) => {
          const row = asRecord(value);
          return {
            id: asTrimmedString(row.id),
            speakerId: asString(row.speakerId),
            name: asString(row.name),
            role: row.role === "user" ? ("user" as const) : ("assistant" as const),
            content: asString(row.content),
            at: asString(row.at),
            zoneId: asTrimmedString(row.zoneId) || undefined,
            ...(row.viaDoorway === true ? { viaDoorway: true } : {}),
            ...(row.remoteDelivery === "loud" || row.remoteDelivery === "device"
              ? { remoteDelivery: row.remoteDelivery }
              : {}),
            ...(row.contactHidden === true ? { contactHidden: true } : {}),
            ...(row.contactReport === true ? { contactReport: true } : {}),
            heardBy: Array.isArray(row.heardBy) ? row.heardBy.filter((id): id is string => typeof id === "string") : [],
            ...(row.kind === "narration" || row.kind === "dialogue" || row.kind === "side" || row.kind === "whisper"
              ? { kind: row.kind as VenueLine["kind"] }
              : {}),
            ...(typeof row.expression === "string" ? { expression: row.expression } : {}),
            ...(Array.isArray(row.staging) ? { staging: readStagingCues(row.staging, [...participantIds]) } : {}),
            ...(row.gazeAt === "player" || (typeof row.gazeAt === "string" && participantIds.has(row.gazeAt))
              ? { gazeAt: row.gazeAt as string }
              : {}),
            ...(typeof row.targetId === "string" ? { targetId: row.targetId } : {}),
            ...(typeof row.asideFor === "string" ? { asideFor: row.asideFor } : {}),
          };
        })
        .filter((line) => line.id && line.content)
    : [];
  return {
    version: 1,
    changeSequence: Math.max(0, Math.floor(Number(raw.changeSequence) || 0)),
    ...(raw.processingVersion === 1 ? { processingVersion: 1 as const, villageSeed: asString(raw.villageSeed) } : {}),
    sceneRevision: sceneRevision(raw),
    operation: raw.operation as VenueOperation | undefined,
    generationReceipts: Array.isArray(raw.generationReceipts)
      ? (raw.generationReceipts as VenueScene["generationReceipts"])
      : [],
    id: asTrimmedString(raw.id),
    placeId: asTrimmedString(raw.placeId),
    placeName: asTrimmedString(raw.placeName),
    zoneId: asTrimmedString(raw.zoneId) || undefined,
    enteredFromZoneId: asTrimmedString(raw.enteredFromZoneId) || undefined,
    pendingRoomQuestions: Array.isArray(raw.pendingRoomQuestions)
      ? raw.pendingRoomQuestions.filter((value): value is string => typeof value === "string").slice(0, 8)
      : [],
    pendingProjectQuestions: Array.isArray(raw.pendingProjectQuestions)
      ? raw.pendingProjectQuestions.filter((value): value is string => typeof value === "string").slice(0, 8)
      : [],
    dismissedZoneIds: Array.isArray(raw.dismissedZoneIds)
      ? raw.dismissedZoneIds.filter((id): id is string => typeof id === "string")
      : [],
    privateSpaceId: asTrimmedString(raw.privateSpaceId) || undefined,
    zoneGrants: Array.isArray(raw.zoneGrants)
      ? raw.zoneGrants
          .map(asRecord)
          .filter((grant) => typeof grant.zoneId === "string" && typeof grant.controllerId === "string")
          .map((grant) => ({
            zoneId: String(grant.zoneId),
            controllerId: String(grant.controllerId),
            source: grant.source === "relationship" ? ("relationship" as const) : undefined,
          }))
      : [],
    legacyCast: raw.legacyCast === true,
    doorwayContacts: Array.isArray(raw.doorwayContacts) ? (raw.doorwayContacts as DoorwayContact[]) : [],
    entryOffers: Array.isArray(raw.entryOffers) ? (raw.entryOffers as VenueScene["entryOffers"]) : [],
    grantedZoneIds: Array.isArray(raw.grantedZoneIds)
      ? raw.grantedZoneIds.filter((id): id is string => typeof id === "string")
      : [],
    accompanying: Array.isArray(raw.accompanying)
      ? raw.accompanying.flatMap((value) => {
          const row = asRecord(value);
          return row.characterId && row.zoneId
            ? [{ characterId: asTrimmedString(row.characterId), zoneId: asTrimmedString(row.zoneId) }]
            : [];
        })
      : [],
    departedIds: Array.isArray(raw.departedIds)
      ? raw.departedIds.filter((id): id is string => typeof id === "string")
      : [],
    spaceClass:
      raw.spaceClass === "residence" ||
      raw.spaceClass === "workplace" ||
      raw.spaceClass === "gathering" ||
      raw.spaceClass === "other"
        ? raw.spaceClass
        : undefined,
    area:
      raw.area === "outside" || raw.area === "shared" || raw.area === "private" || raw.area === "public"
        ? raw.area
        : raw.spaceClass === "residence"
          ? "shared"
          : "public",
    privateOwnerId: asTrimmedString(raw.privateOwnerId),
    privateAccessOwnerId: asTrimmedString(raw.privateAccessOwnerId),
    startedAt: asString(raw.startedAt),
    endedAt: asString(raw.endedAt),
    lastActivityAt: asString(raw.lastActivityAt) || asString(raw.startedAt),
    endReason:
      raw.endReason === "player" ||
      raw.endReason === "scene" ||
      raw.endReason === "inactivity" ||
      raw.endReason === "debug"
        ? raw.endReason
        : "",
    ...(raw.stagingVersion === 1 ? { stagingVersion: 1 as const } : {}),
    memoryMode:
      raw.memoryMode === "live"
        ? "live"
        : raw.memoryMode === "tiered"
          ? "tiered"
          : raw.memoryMode === "turn"
            ? "turn"
            : "end",
    status: raw.status === "opening" || raw.status === "closing" || raw.status === "closed" ? raw.status : "active",
    participants,
    ...(raw.sceneAttendance && typeof raw.sceneAttendance === "object"
      ? {
          sceneAttendance: {
            capturedAt: asString(asRecord(raw.sceneAttendance).capturedAt) || asString(raw.startedAt),
            occupants: (Array.isArray(asRecord(raw.sceneAttendance).occupants)
              ? (asRecord(raw.sceneAttendance).occupants as unknown[])
              : []
            ).flatMap((value) => {
              const row = asRecord(value);
              return row.characterId && row.zoneId
                ? [
                    {
                      characterId: asTrimmedString(row.characterId),
                      name: asTrimmedString(row.name),
                      doing: asString(row.doing),
                      zoneId: asTrimmedString(row.zoneId),
                      availability: asString(row.availability),
                    },
                  ]
                : [];
            }),
          },
        }
      : {}),
    activeIds: Array.isArray(raw.activeIds) ? raw.activeIds.filter((id): id is string => typeof id === "string") : [],
    lines,
    heardHistory: Array.isArray(raw.heardHistory)
      ? raw.heardHistory
          .map((value) => {
            const row = asRecord(value);
            return {
              characterId: asTrimmedString(row.characterId),
              lineIds: Array.isArray(row.lineIds)
                ? row.lineIds.filter((id): id is string => typeof id === "string")
                : [],
            };
          })
          .filter((entry) => !!entry.characterId)
      : participants.map((person) => ({
          characterId: person.characterId,
          lineIds: lines.filter((line) => line.heardBy.includes(person.characterId)).map((line) => line.id),
        })),
    submissions: Array.isArray(raw.submissions)
      ? raw.submissions
          .map((value) => {
            const row = asRecord(value);
            return {
              id: asTrimmedString(row.id),
              ...(Array.isArray(row.wishProposals) ? { wishProposals: row.wishProposals as WishProposal[] } : {}),
              ...(typeof row.wishProposalError === "string" ? { wishProposalError: row.wishProposalError } : {}),
              ...(coerceExchangeProcessing(row.processing)
                ? { processing: coerceExchangeProcessing(row.processing) }
                : {}),
              message: asString(row.message),
              ...(row.contact ? { contact: row.contact as ContactIntent } : {}),
              ...(Array.isArray(row.speechIdsAtTurn) ? { speechIdsAtTurn: row.speechIdsAtTurn as string[] } : {}),
              ...(row.contactEvidence
                ? { contactEvidence: row.contactEvidence as VenueSubmission["contactEvidence"] }
                : {}),
              mode:
                row.mode === "contact"
                  ? ("contact" as const)
                  : row.mode === "leave"
                    ? ("leave" as const)
                    : row.mode === "act"
                      ? ("act" as const)
                      : row.mode === "fulfill"
                        ? ("fulfill" as const)
                        : row.mode === "ask"
                          ? ("ask" as const)
                          : ("chat" as const),
              targetId: asString(row.targetId),
              ...(typeof row.zoneIdAtTurn === "string" ? { zoneIdAtTurn: row.zoneIdAtTurn } : {}),
              ...(row.areaAtTurn === "outside" ||
              row.areaAtTurn === "shared" ||
              row.areaAtTurn === "private" ||
              row.areaAtTurn === "public"
                ? { areaAtTurn: row.areaAtTurn as VenueScene["area"] }
                : {}),
              ...(typeof row.privateOwnerIdAtTurn === "string"
                ? { privateOwnerIdAtTurn: row.privateOwnerIdAtTurn }
                : {}),
              ...(Array.isArray(row.activeIdsAtTurn)
                ? { activeIdsAtTurn: row.activeIdsAtTurn.filter((id): id is string => typeof id === "string") }
                : {}),
              ...(Array.isArray(row.activeIdsAfterTurn)
                ? {
                    activeIdsAfterTurn: row.activeIdsAfterTurn.filter(
                      (id): id is string => typeof id === "string" && participantIds.has(id),
                    ),
                  }
                : {}),
              ...(Array.isArray(row.replyLineIds)
                ? { replyLineIds: row.replyLineIds.filter((id): id is string => typeof id === "string") }
                : {}),
              ...(typeof row.progressProcessedAt === "string" ? { progressProcessedAt: row.progressProcessedAt } : {}),
              ...(Array.isArray(row.projectContexts)
                ? {
                    projectContexts: row.projectContexts.slice(0, 100).map((value) => {
                      const context = asRecord(value);
                      return {
                        projectId: asTrimmedString(context.projectId),
                        revision: Number(context.revision),
                        phase: asTrimmedString(context.phase),
                      };
                    }),
                  }
                : {}),
              ...(Array.isArray(row.projectSpeech) ? { projectSpeech: coerceProjectSpeech(row.projectSpeech) } : {}),
              ...(row.projectInterpretationVersion === 1 ? { projectInterpretationVersion: 1 as const } : {}),
              ...(Object.hasOwn(row, "wishInterpretationProof")
                ? { wishInterpretationProof: coerceWishApplicationProof(row.wishInterpretationProof) }
                : {}),
              ...(typeof row.progressError === "string" ? { progressError: row.progressError.slice(0, 300) } : {}),
              verdict:
                row.verdict && typeof asRecord(row.verdict).fulfilled === "boolean"
                  ? {
                      fulfilled: asRecord(row.verdict).fulfilled === true,
                      reason: asString(asRecord(row.verdict).reason),
                    }
                  : null,
              wishId: asString(row.wishId),
              wishMemory: asString(row.wishMemory),
              ...(row.action ? { action: row.action as VenueActionResult } : {}),
              ...(row.actionReplyDone === true ? { actionReplyDone: true } : {}),
              ...(row.sceneChange ? { sceneChange: row.sceneChange as VenueSceneChange } : {}),
              ...(row.residenceSignal
                ? { residenceSignal: row.residenceSignal as VenueSubmission["residenceSignal"] }
                : {}),
              ...(row.upgradeSignal ? { upgradeSignal: row.upgradeSignal as VenueSubmission["upgradeSignal"] } : {}),
              ...(row.venueRequestSignal
                ? { venueRequestSignal: row.venueRequestSignal as VenueSubmission["venueRequestSignal"] }
                : {}),
              ...(row.invitationSignal
                ? { invitationSignal: row.invitationSignal as VenueSubmission["invitationSignal"] }
                : {}),
              ...(row.editApprovalSignal
                ? { editApprovalSignal: row.editApprovalSignal as VenueSubmission["editApprovalSignal"] }
                : {}),
              ...(Array.isArray(row.turnMemories) ? { turnMemories: row.turnMemories as VenueMemory[] } : {}),
              ...(asRecord(row.liveProposals).version === 1
                ? { liveProposals: structuredClone(row.liveProposals) as LiveExchangeProposals }
                : {}),
              changeSequence: Math.max(0, Math.floor(Number(row.changeSequence) || 0)),
              ...(Array.isArray(row.wishContexts)
                ? { wishContexts: row.wishContexts as VenueSubmission["wishContexts"] }
                : {}),
              ...(Array.isArray(row.requestMetrics)
                ? { requestMetrics: row.requestMetrics as VenueSubmission["requestMetrics"] }
                : {}),
              ...(Array.isArray(row.interpretationHistory)
                ? { interpretationHistory: row.interpretationHistory as VenueSubmission["interpretationHistory"] }
                : {}),
              ...(Array.isArray(row.recollections)
                ? {
                    recollections: row.recollections
                      .map(coerceVenueRecollection)
                      .filter((entry): entry is VenueRecollection => entry !== null),
                  }
                : {}),
              ...(Array.isArray(row.recordEvents) ? { recordEvents: row.recordEvents as VenueRecordEvent[] } : {}),
              ...(typeof row.at === "string" ? { at: row.at } : {}),
            };
          })
          .filter((entry) => entry.id)
      : [],
    memories: Array.isArray(raw.memories)
      ? raw.memories
          .map((value) => ({
            characterId: asTrimmedString(asRecord(value).characterId),
            text: asTrimmedString(asRecord(value).text),
            lineIds: Array.isArray(asRecord(value).lineIds)
              ? (asRecord(value).lineIds as unknown[]).filter((id): id is string => typeof id === "string")
              : [],
          }))
          .filter((entry) => entry.characterId && entry.text)
      : null,
    memoryProgress:
      raw.memoryProgress &&
      typeof asRecord(raw.memoryProgress).nextUnit === "number" &&
      Number.isFinite(asRecord(raw.memoryProgress).nextUnit)
        ? {
            nextUnit: Math.max(0, Math.floor(asRecord(raw.memoryProgress).nextUnit as number)),
            entries: Array.isArray(asRecord(raw.memoryProgress).entries)
              ? (asRecord(raw.memoryProgress).entries as unknown[])
                  .map((value) => ({
                    characterId: asTrimmedString(asRecord(value).characterId),
                    text: asTrimmedString(asRecord(value).text),
                    lineIds: Array.isArray(asRecord(value).lineIds)
                      ? (asRecord(value).lineIds as unknown[]).filter((id): id is string => typeof id === "string")
                      : [],
                  }))
                  .filter((entry) => entry.characterId && entry.text)
              : [],
          }
        : null,
    relationshipReview:
      raw.relationshipReview && typeof raw.relationshipReview === "object"
        ? (structuredClone(raw.relationshipReview) as VenueScene["relationshipReview"])
        : undefined,
    memoryPending: raw.memoryPending === true,
    memoryReview: (() => {
      const review = asRecord(raw.memoryReview);
      const status = review.status === "pending" ? "pending" : review.status === "complete" ? "complete" : "none";
      return {
        status,
        applied: review.applied === true || status === "complete",
        attempts:
          typeof review.attempts === "number" && Number.isFinite(review.attempts)
            ? Math.max(0, Math.floor(review.attempts))
            : 0,
        error: asTrimmedString(review.error).slice(0, 500),
        nextRecollection:
          typeof review.nextRecollection === "number" && Number.isFinite(review.nextRecollection)
            ? Math.max(0, Math.floor(review.nextRecollection))
            : 0,
        decisions: Array.isArray(review.decisions)
          ? review.decisions.map(coerceMemoryDecision).filter((entry): entry is VenueMemoryDecision => entry !== null)
          : [],
      };
    })(),
    recap: asString(raw.recap).slice(0, 600),
  };
}

const sessionSlot: DocumentSlot<VenueScene> = {
  kind: SESSION_KIND,
  name: "Scene",
  description: "The player's exact record of one Scene, indexed by Venue and participant.",
  coerce: coerceSession,
  label: (session) => session.placeName || "Scene",
};

async function readActive(): Promise<ActiveVenue> {
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, ACTIVE_ID);
  return coerceActive(record?.data);
}

async function readSession(id: string): Promise<VenueScene> {
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${id}`);
  if (!record) throw notFound("That Scene is no longer available.");
  return coerceSession(record.data);
}

function sceneFingerprint(session: VenueScene): string {
  return JSON.stringify([
    session.status,
    session.zoneId,
    session.area,
    session.privateOwnerId,
    session.activeIds,
    session.participants,
    session.lines.map((line) => line.id),
    session.recap,
  ]);
}

async function changeSession(id: string, change: (session: VenueScene) => void): Promise<VenueScene> {
  let result: VenueScene | null = null;
  await mutateDocument(`${SESSION_PREFIX}${id}`, sessionSlot, (session) => {
    if (session.id !== id) throw notFound("That Scene is no longer available.");
    const before = sceneFingerprint(session);
    const priorChanges = new Map(
      session.submissions.map((turn) => [
        turn.id,
        JSON.stringify([turn.processing, turn.recordEvents, turn.liveProposals]),
      ]),
    );
    change(session);
    if (session.processingVersion === 1 && session.villageSeed)
      session.submissions.forEach((turn, order) => {
        if (turn.processing || !turn.at || (turn.mode === "act" && !turn.actionReplyDone)) return;
        turn.processing = createExchangeProcessing({
          seed: session.villageSeed!,
          sceneId: id,
          submissionId: turn.id,
          order,
          lineIds: session.lines
            .filter((line) => turn.replyLineIds?.includes(line.id) || (line.role === "user" && line.at === turn.at))
            .map((line) => line.id),
          actionReceiptIds: turn.action?.happened ? [`venue-action:${turn.id}`] : [],
        });
        // Legacy fixtures retain their existing settlement path; fresh Scenes apply each exchange.
        if (session.memoryMode !== "live")
          for (const domain of ["memories", "relationships"] as const)
            turn.processing.domains[domain] = {
              ...turn.processing.domains[domain],
              status: "applied",
              reason: "No exchange-level proposals supplied",
            };
      });
    for (const turn of session.submissions)
      if (priorChanges.get(turn.id) !== JSON.stringify([turn.processing, turn.recordEvents, turn.liveProposals]))
        turn.changeSequence = session.changeSequence = (session.changeSequence ?? 0) + 1;
    if (before !== sceneFingerprint(session)) session.sceneRevision += 1;
    result = session;
  });
  return result!;
}

function pendingProgressTurns(session: VenueScene, foundedAt: string) {
  return session.submissions.filter(
    (turn) => turn.at && !turn.progressProcessedAt && (!foundedAt || Date.parse(turn.at) >= Date.parse(foundedAt)),
  );
}

/** The Scene document is the outbox. Village receipts are idempotent if the second write is interrupted. */
export async function processSavedProgressSubmission(sessionId: string, submissionId: string): Promise<void> {
  const village = await readVillageState();
  if (village.progressEngineVersion !== 1) return;
  const session = await readSession(sessionId);
  const submission = session.submissions.find((entry) => entry.id === submissionId);
  if (
    !submission ||
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
        if (state.progressEngineVersion !== 1 || state.seed !== village.seed) return;
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
  const scene = await readSession(sessionId);
  const turn = scene.submissions.find((entry) => entry.id === submissionId);
  if (!turn?.processing) return processSavedProgressSubmission(sessionId, submissionId);
  const village = await readVillageState();
  const processing = turn.processing;
  const valid =
    village.seed === processing.seed &&
    scene.villageSeed === village.seed &&
    processing.sceneId === scene.id &&
    processing.submissionId === turn.id;
  const applyProjects = async () => {
    if (!valid) return { status: "rejected" as const, reason: "Village identity changed; saved effects cannot apply" };
    await applyVenueTurnChange(scene, turn);
    await processSavedProgressSubmission(scene.id, turn.id);
    if (village.progressEngineVersion !== 1 && turn.projectInterpretationVersion === 1)
      await applyLegacyProjectInterpretation(scene.id, turn.id);
    const current = await readVillageState();
    const receiptIds = current.progressTasks.flatMap((task) =>
      task.receipts
        .filter(
          (receipt) =>
            receipt.evidence.sourceId === turn.id || processing.lineIds.includes(receipt.evidence.lineId ?? ""),
        )
        .map((receipt) => receipt.id),
    );
    return { reason: "Physical effects and saved Project interpretations checked", receiptIds };
  };
  await dispatchExchange(
    processing,
    {
      projects: applyProjects,
      wishes: async () =>
        valid ? processWishExchange(scene, turn.id) : { status: "rejected", reason: "Village identity changed" },
      memories: async () =>
        valid ? processLiveMemories(scene, turn.id) : { status: "rejected", reason: "Village identity changed" },
      relationships: async () =>
        valid ? processLiveRelationships(scene, turn.id) : { status: "rejected", reason: "Village identity changed" },
    },
    async (domain, result) => {
      await changeSession(scene.id, (saved) => {
        const entry = saved.submissions.find((entry) => entry.id === turn.id);
        if (entry?.processing?.seed === processing.seed) {
          const prior = entry.processing.domains[domain];
          if (
            (prior.status === "applied" || prior.status === "rejected") &&
            (result.status === "pending" || result.status === "failed")
          )
            return;
          entry.processing.domains[domain] = result;
        }
      });
      runtimeDebug("exchange processing", {
        sceneId: sessionId,
        submissionId,
        domain,
        interpretationVersion: processing.interpretationVersion,
        ...result,
      });
    },
  );
  await receiptForTurn(scene, turn);
}

/** Privileged diagnostics use the saved record only. A read never starts interpretation or recovery. */
export async function readSceneChanges(id: string, cursor = "", limit = 20) {
  const scene = await readSession(id);
  const village = await readVillageState();
  if (scene.villageSeed && scene.villageSeed !== village.seed)
    throw conflict("This Scene belongs to a previous village.");
  const parts = (cursor || "0:0").split(":").map(Number);
  if (parts.length > 2 || parts.some((part) => !Number.isSafeInteger(part) || part < 0))
    throw badRequest("Invalid changes cursor.");
  const [afterScene, afterNotice = 0] = parts;
  const size = Math.max(1, Math.min(50, Math.floor(Number(limit) || 20)));
  const changed = scene.submissions
    .map((turn, index) => ({ turn, sequence: turn.changeSequence || index + 1 }))
    .filter((entry) => entry.sequence > afterScene)
    .sort((a, b) => a.sequence - b.sequence);
  const turns = changed.slice(0, size);
  const notices = Object.values(village.exchangeReceipts)
    .filter(
      (receipt) =>
        receipt.notice &&
        (receipt.noticeSequence ?? 0) > afterNotice &&
        !village.dismissedNoticeIds.includes(receipt.id),
    )
    .sort((a, b) => (a.noticeSequence ?? 0) - (b.noticeSequence ?? 0));
  const page = notices.slice(0, size);
  const backgroundChecks = (await villagesDocuments().list(VILLAGES_PACKAGE_ID, "background-work"))
    .map((record) => asRecord(record.data))
    .filter((job) => job.seed === village.seed && String(job.subjectId).startsWith(`wish-change:${id}:`))
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
    activeRequest: {
      status: scene.operation?.status,
      error: scene.operation?.error,
      requests: venueRequestMetrics(scene.operation),
    },
    changes: turns.map(({ turn }) => ({
      submissionId: turn.id,
      at: turn.at,
      processing: turn.processing ?? null,
      receipts: {
        physical: turn.action ?? null,
        domainEffects: Object.values(village.exchangeReceipts).filter(
          (receipt) => receipt.sceneId === id && receipt.submissionId === turn.id,
        ),
        relationships: Object.values(village.relationshipContext?.receipts ?? {}).filter((receipt) =>
          turn.processing?.domains.relationships.receiptIds.includes(receipt.id),
        ),
        projects: village.progressTasks.flatMap((task) =>
          task.receipts.filter((receipt) => turn.processing?.domains.projects.receiptIds.includes(receipt.id)),
        ),
        memories: village.chronicle.filter(
          (memory) =>
            memory.sourceVisitId === id &&
            memory.sourceLineIds?.some((lineId) => turn.processing?.lineIds.includes(lineId)),
        ),
      },
      requests: turn.requestMetrics ?? null,
      interpretationHistory: turn.interpretationHistory ?? [],
      notices: (turn.recordEvents ?? []).filter((event) => !village.dismissedNoticeIds.includes(event.id)),
      evidence: scene.lines.filter(
        (line) => turn.processing?.lineIds.includes(line.id) || turn.liveProposals?.earlierLineIds.includes(line.id),
      ),
      interpretations: {
        source: turn.interpretationHistory?.at(-1)?.source ?? "saved narration reply",
        version: turn.processing?.interpretationVersion,
        memory: turn.liveProposals?.memoryChanges,
        relationship: turn.liveProposals?.relationshipChanges,
        wishes: turn.wishProposals,
        memoryVersions: turn.liveProposals?.memoryVersions,
      },
    })),
    notices: page.flatMap((receipt) => (receipt.notice ? [receipt.notice] : [])),
    dismissedNoticeIds: village.dismissedNoticeIds,
    unresolved: scene.submissions
      .flatMap((turn) =>
        Object.entries(turn.processing?.domains ?? {})
          .filter(([, result]) => result.status === "failed")
          .map(([domain]) => ({ submissionId: turn.id, domain })),
      )
      .slice(0, 50),
    processingSummary: sceneProcessingSummary(scene),
    nextCursor: `${sceneCursor}:${noticeCursor}`,
    hasMore: changed.length > turns.length || notices.length > page.length,
  };
}

export function sceneProcessingSummary(scene: VenueScene) {
  const domains = scene.submissions.flatMap((turn) => (turn.processing ? Object.values(turn.processing.domains) : []));
  return {
    pending: domains.filter((domain) => domain.status === "pending").length,
    failed: domains.filter((domain) => domain.status === "failed").length,
    rejected: domains.filter((domain) => domain.status === "rejected").length,
  };
}

export async function dismissSceneNotice(id: string, noticeId: string) {
  const scene = await readSession(id),
    village = await readVillageState();
  if (scene.villageSeed && scene.villageSeed !== village.seed) throw conflict("Village identity changed.");
  const known =
    scene.submissions.some((turn) => turn.recordEvents?.some((event) => event.id === noticeId)) ||
    !!village.exchangeReceipts[noticeId]?.notice;
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
  if (!turn?.processing || !turn.liveProposals || scene.memoryMode !== "live")
    throw badRequest("No saved live exchange to interpret.");
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
      const { retryBackgroundJob } = await import("./background-work.js");
      const action = venueOperationId();
      await venueCheckpoint("wish-background-retry", async () => {
        for (const record of failed) {
          const job = asRecord(record.data);
          await outsideVenueOperation(() =>
            retryBackgroundJob(record.id, Number(job.attempt), action + ":" + String(job.attempt)),
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
      temperature: 0,
      reasoningEffort: null,
      verbosity: null,
      debugMode: false,
      signal: venueOperationSignal(),
      retryEmpty: false,
    });
    const raw = extractJsonObject(completion.content ?? "");
    const value =
      domain === "memories" ? raw?.memoryChanges : domain === "wishes" ? raw?.wishChanges : raw?.relationshipChanges;
    if (
      domain !== "relationships"
        ? !Array.isArray(value)
        : !["changes", "permissions", "disclosures"].every((key) => Array.isArray(asRecord(value)[key]))
    ) {
      await rejectVenueCompletion();
      throw badGateway("Interpretation metadata is still incomplete. Another model request requires explicit retry.");
    }
    return {
      value,
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

export async function progressBacklog() {
  const village = await readVillageState();
  const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, SESSION_KIND);
  return records.flatMap((record) => {
    const session = coerceSession(record.data);
    if (session.processingVersion === 1 && session.villageSeed !== village.seed) return [];
    return session.submissions
      .filter((turn) =>
        turn.processing
          ? unfinishedExchange(turn.processing)
          : village.progressEngineVersion === 1 && pendingProgressTurns(session, village.foundedAt).includes(turn),
      )
      .map((turn) => ({
        sessionId: session.id,
        submissionId: turn.id,
        at: turn.at,
        error: turn.progressError ?? "",
      }));
  });
}

/** One startup scan, then bounded asynchronous batches; never part of the minute snapshot. */
export function startProgressRecovery(): () => void {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const start = async () => {
    try {
      await processProjectWishOutbox();
      const queue = await progressBacklog();
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

function appendLine(session: VenueScene, line: VenueLine): void {
  line.zoneId ??= session.zoneId;
  session.lines.push(line);
  for (const id of line.heardBy)
    if (!session.heardHistory.some((history) => history.characterId === id))
      session.heardHistory.push({ characterId: id, lineIds: [] });
  for (const history of session.heardHistory)
    if (line.heardBy.includes(history.characterId)) history.lineIds.push(line.id);
}

function heardLines(session: VenueScene, characterId: string): VenueLine[] {
  const ids = new Set(session.heardHistory.find((history) => history.characterId === characterId)?.lineIds ?? []);
  return session.lines.filter((line) => ids.has(line.id));
}

function captureSceneAttendance(village: VillageState, placeId: string, now: Date): SceneAttendance {
  const venue = village.venues.find((entry) => entry.id === placeId)!;
  const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now });
  return {
    capturedAt: now.toISOString(),
    occupants: village.villagers.flatMap((villager) => {
      if (villagerPlaceView(village, villager, null, moment.minuteOfDay, now)?.id !== placeId) return [];
      const block = agendaAt(villager.agenda, moment.minuteOfDay, now, villager.ingestSchedule !== false);
      const zone = chooseAgendaZone(venue, villager.characterId, block?.activity, block?.zoneId, village);
      return [
        {
          characterId: villager.characterId,
          name: villager.cardSnapshot.name,
          doing: block?.activity ?? "",
          availability: block?.status ?? "",
          zoneId: zone.id,
        },
      ];
    }),
  };
}

/** Do not disclose occupants of unseen Zones, including inside operation snapshots/checkpoints. */
export function publicSceneResponse<T>(value: T, visibleIds?: Set<string>): T {
  if (Array.isArray(value))
    return value
      .filter((entry) => !(entry && typeof entry === "object" && entry.contactHidden === true))
      .map((entry) => publicSceneResponse(entry, visibleIds)) as T;
  if (!value || typeof value !== "object" || Object.getPrototypeOf(value) !== Object.prototype) return value;
  const row = value as Record<string, unknown>;
  const visible = Array.isArray(row.participants)
    ? new Set(row.participants.map((entry) => asTrimmedString(asRecord(entry).characterId)))
    : visibleIds;
  return Object.fromEntries(
    Object.entries(
      Array.isArray(row.lines) && Array.isArray(row.submissions)
        ? { ...row, processingSummary: sceneProcessingSummary(row as VenueScene) }
        : row,
    )
      .filter(
        ([key]) =>
          ![
            "sceneAttendance",
            "contactGeneration",
            "contactEvidence",
            "contactHidden",
            "contactReport",
            "contactMoves",
            "contactRelay",
            "characterZoneId",
            "checkpoints",
            "attempts",
            "optionalAttempts",
            "wishInterpretationProof",
            "wishProposals",
            "wishContexts",
            "liveProposals",
            "interpretationHistory",
            "requestMetrics",
            "memoryChanges",
            "relationshipChanges",
            "earlierLineIds",
            "memoryVersions",
            "wishProposalError",
            "wishChanges",
            "snapshot",
          ].includes(key),
      )
      .map(([key, entry]) => [
        key,
        key === "processing" && entry
          ? {
              version: 1,
              domains: Object.fromEntries(
                Object.entries(asRecord(asRecord(entry).domains)).map(([domain, result]) => [
                  domain,
                  { status: asRecord(result).status },
                ]),
              ),
            }
          : visible && ["heardBy", "heardPlayerBy"].includes(key) && Array.isArray(entry)
            ? entry.filter((id) => visible.has(id))
            : key === "recollections" && visible && Array.isArray(entry)
              ? publicSceneResponse(
                  entry.filter((memory) => {
                    const row = asRecord(memory);
                    return ["subjectCharacterIds", "knownByCharacterIds"].every(
                      (field) =>
                        !Array.isArray(row[field]) ||
                        row[field].every((id: unknown) => typeof id === "string" && visible.has(id)),
                    );
                  }),
                  visible,
                )
              : key === "heardHistory" && visible && Array.isArray(entry)
                ? publicSceneResponse(
                    entry.filter((history) => visible.has(asTrimmedString(asRecord(history).characterId))),
                    visible,
                  )
                : publicSceneResponse(entry, visible),
      ]),
  ) as T;
}

type GreetingTrace = (stage: string, elapsedMs: number, detail?: string) => void;

type VenueReplyFailureKind =
  "invalid-json" | "invalid-segments" | "player-echo" | "repeated-question" | "residence-consent";

class VenueReplyFailure extends Error {
  constructor(readonly kind: VenueReplyFailureKind) {
    super(kind);
  }
}

function venueRepairHint(kind: VenueReplyFailureKind): string {
  if (kind === "player-echo")
    return "A resident or narration repeated the player's words. The player has already spoken; react without quoting or restating that line.";
  if (kind === "repeated-question")
    return "A resident repeated their prior question after the player answered it. Continue from the answer instead of asking it again.";
  if (kind === "residence-consent")
    return "A lasting Residence edit needs the exact required approvals. Describe a pending request, refusal, or temporary attempt, and omit sceneChange.";
  return "Return one valid JSON object with heardPlayerBy and a nonempty segments array using active resident IDs.";
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
  repairHint = "",
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
  const sharedMemories = promptMemories.filter((entry) => entry.scope === "village");
  // Only these exact witnessed lines and memory versions can support a saved proposal.
  const earlierEvidence = session.lines
    .filter((line) => !line.contactReport && line.heardBy.some((id) => audibleIds.includes(id)))
    .slice(-18);
  const optionalKnowledge: VenueWritingBlock[] = [];
  const residentContexts: string[] = [];
  const expressionContexts: string[] = [];
  const profiles = active.map((person) => {
    const resident = village.villagers.find((entry) => entry.characterId === person.characterId);
    if (!resident) return `${person.name} (${person.characterId}): no longer resident.`;
    const card = readEffectiveVillagerCard(resident);
    const sceneOccupant = session.sceneAttendance?.occupants.find((entry) => entry.characterId === person.characterId);
    const memories = promptMemories
      .filter(
        (entry) =>
          entry.scope === "private" &&
          (entry.knownByCharacterIds ?? entry.actors.map((actor) => actor.id)).includes(person.characterId),
      )
      .map((entry) => `[${entry.id}] ${entry.text}`);
    const recent = promptRecollections
      .filter((entry) => entry.knownByCharacterIds.includes(person.characterId))
      .map((entry) => entry.text);
    const spriteLabels = describeSpriteExpressions(resident.sprite);
    optionalKnowledge.push({
      text: `Only ${card.name} knows: ${memories.join("; ") || "nothing recorded"}\nRecent conversational context ${card.name} may still recall: ${recent.join("; ") || "none"}`,
      optional: "memory",
    });
    if (session.contactGeneration && session.memoryMode !== "live")
      optionalKnowledge.push({
        text: `Earlier exchanges witnessed by ${card.name}:\n${
          venueSceneHistory(
            session.lines.filter((line) => line.heardBy.includes(person.characterId)),
            player.name,
          ) || "none"
        }. The latest call is supplied separately; unseen conversations are unknown to this resident.`,
        optional: "history",
      });
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
  const history = venueSceneHistory(
    session.lines.filter(
      (line) =>
        !session.zoneId ||
        ((!line.zoneId || line.zoneId === session.zoneId) &&
          active.every((person) => line.heardBy.includes(person.characterId))),
    ),
    player.name,
  );
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
    session.memoryMode === "live"
      ? "Earlier evidence: " +
        JSON.stringify(
          earlierEvidence.map((line) => ({
            id: line.id,
            speakerId: line.role === "user" ? "player" : line.speakerId,
            kind: line.kind,
            heardBy: line.heardBy,
            text: line.content.slice(0, 500),
          })),
        ) +
        "\nExisting memories: " +
        JSON.stringify(
          promptMemories.map((memory) => ({
            id: memory.id,
            text: memory.text,
            knownByCharacterIds: memory.knownByCharacterIds ?? memory.actors.map((actor) => actor.id),
          })),
        )
      : "";
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
      repairHint
        ? `The previous draft failed validation. ${repairHint} Rewrite this same turn from the latest player input.`
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
      venueFoundingBackground(village),
      `A Venue is the place; Zones are its separate spaces, including Exterior, Common Space, and Private Space. A Scene is the whole active conversation in that Venue, continuing across Zone movement. The residents currently here are: ${audience.join(", ")}. Only server-listed residents occupy this Zone. Attendance and activities were captured at Scene start across the entire Venue. Scene-start activities describe the opening situation; witnessed developments establish what is happening now. Background agendas cannot add, remove, or move anyone during this Scene. Only evidenced movement within the Scene changes positions. A resident may leave after a clear spoken departure. Do not force a departure merely because real time passed.`,
      session.area === "outside"
        ? session.spaceClass === "residence"
          ? "The player is in this Residence's Exterior Zone, outside its interior. A resident inside may answer, remain busy, sleep through the attempt, or ignore it. Show only what the player can observe from this Zone. Never describe the player entering the Common Space or a private space without validated permission. Do not expose unseen interior details."
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
      `Shared village memories: ${sharedMemories.map((entry) => entry.text).join("; ") || "none"}`,
      `Relevant world lore: ${lore.join("\n") || "none"}`,
      ...optionalKnowledge.map((block) => block.text),
      `Earlier Scene recap: ${session.recap || "none"}. The recap may name who heard a private exchange.`,
      session.memoryMode === "live" ? "" : `Recent scene history:\n${history || "The Scene has just begun."}`,
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
        liveMemory: session.memoryMode === "live",
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
        contactFacts:
          !session.contactGeneration && (mode === "chat" || mode === "ask") && storedPlace
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
  const requestedMaxTokens = mode === "greet" ? 1_600 : VENUE_REPLY_MAX_TOKENS * (repairHint ? 2 : 1);
  const maxTokens = Math.min(model.maxOutputTokens ?? requestedMaxTokens, requestedMaxTokens);
  const fitStarted = performance.now();
  const fitted = fitVenueWritingMessages(model, blocks, input, maxTokens);
  trace?.("context fit", performance.now() - fitStarted);
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
    promptMemories,
  };
}

async function generateOnce(...args: Parameters<typeof prepareVenueTurnMessages>) {
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
    temperature: VENUE_REPLY_TEMPERATURE,
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
  const extractedContact =
    !session.contactGeneration && (mode === "chat" || mode === "ask")
      ? readContactIntent(raw?.contactIntent, message)
      : null;
  // Route a valid contact interpretation before validating its uncommitted local draft.
  if (extractedContact)
    return { ...quietContactReply("Routing the contact request.", session.activeIds), contactIntent: extractedContact };
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
    throw new VenueReplyFailure(raw ? "invalid-segments" : "invalid-json");
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
    projectContexts,
    contactIntent:
      !session.contactGeneration && (mode === "chat" || mode === "ask")
        ? readContactIntent(raw?.contactIntent, message)
        : null,
    contactMoves,
    contactRelay:
      session.contactGeneration && storedPlace
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
        ? readVenueSceneChange(raw?.sceneChange, place)
        : null,
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
        invitationZoneId !== legacyZoneId(invitedVenue, "private", "residence", invitation.entry.privateOwnerId)
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

/** One accepted scene, with no more than two language calls and no partial transcript write. */
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
      )
    : null;
  if (roomInterpretation) {
    const proposedInvitation = reply.invitationSignal;
    // Narrator metadata is a proposal, not permission. Contextual interpretation replaces its phrase gates.
    reply.invitationSignal = null;
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
  let repairHint = "";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const reply = await generateOnce(
        session,
        message,
        mode,
        targetId,
        settled,
        signal,
        trace,
        actionOutcome,
        repairHint,
      );
      const integrity = venueReplyIntegrity(message, session.lines, reply.lines);
      if (integrity) throw new VenueReplyFailure(integrity);
      const currentVillage = await readVillageState();
      const controlledVenue = currentVillage.venues.find((venue) => venue.id === session.placeId);
      const controlledZone = controlledVenue && resolveVenueZone(controlledVenue, session.zoneId ?? "");
      if (
        (session.area === "shared" ||
          session.area === "private" ||
          controlledZone?.kind === "staff" ||
          controlledZone?.kind === "restricted") &&
        reply.sceneChange
      )
        throw new VenueReplyFailure("residence-consent");
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
      return interpretRoomDraft(session, currentVillage, message, reply, mode !== "leave" && !reply.contactIntent);
    } catch (cause) {
      if (!(cause instanceof VenueReplyFailure)) throw cause;
      await rejectVenueCompletion();
      runtimeDebug("scene repair", {
        sceneId: session.id,
        reason: cause.kind,
        attempt: attempt + 1,
        repairHint: venueRepairHint(cause.kind),
      });
      villagesLogger().warn("[villages] venue scene draft rejected: %s (attempt %d)", cause.kind, attempt + 1);
      if (attempt === 1)
        throw badGateway(
          "The scene reply could not be kept accurate after two attempts. Your draft is still here; retry.",
        );
      repairHint = venueRepairHint(cause.kind);
    }
  }
  throw badGateway("The scene reply could not be kept accurate. Your draft is still here; retry.");
}

type VenueReplyLine = {
  kind: NonNullable<VenueLine["kind"]>;
  speakerId: string;
  content: string;
  heardBy: string[];
  viaDoorway?: boolean;
  remoteDelivery?: "loud" | "device";
  contactHidden?: boolean;
  contactReport?: boolean;
  expression?: string;
  gazeAt?: string;
  staging?: StagingCue[];
  targetId?: string;
  anchorIndex?: number;
};

export function parseVenueReply(
  raw: Record<string, unknown> | null,
  audience: readonly string[],
  expressionId?: (characterId: string, requested: string) => string,
): {
  lines: VenueReplyLine[];
  heardPlayerBy: string[];
} {
  const structured = Array.isArray(raw?.segments);
  const segments = structured ? raw!.segments : raw?.lines;
  if (!raw || !Array.isArray(segments) || !Array.isArray(raw.heardPlayerBy))
    throw new Error("The venue response could not be read. Try again.");
  if (!segments.length) throw new Error("The venue response contained no scene moment. Try again.");
  const allowed = new Set(audience);
  // Models sometimes put a name or an obsolete ID in optional audience fields.
  // Ignore those hints; only the cast captured at Visit may hear a line.
  const ids = (value: unknown): string[] =>
    Array.isArray(value)
      ? [...new Set(value.filter((id): id is string => typeof id === "string" && allowed.has(id)))]
      : [];
  if (segments.length > 24) throw new Error("The venue response contained too many lines.");
  const lines: VenueReplyLine[] = segments.map((value): VenueReplyLine => {
    const row = asRecord(value);
    if (
      structured &&
      row.kind !== "narration" &&
      row.kind !== "dialogue" &&
      row.kind !== "side" &&
      row.kind !== "whisper"
    )
      throw new Error("The venue response had an unknown segment kind.");
    let kind: VenueReplyLine["kind"] =
      row.kind === "narration" || row.kind === "side" || row.kind === "whisper" ? row.kind : "dialogue";
    const speakerId = asTrimmedString(row.speakerId);
    const content = asTrimmedString(row.text);
    if ((kind !== "narration" && !allowed.has(speakerId)) || !content || content.length > 2000)
      throw new Error("The venue response had an unreadable speaker or line.");
    const expression = asTrimmedString(row.expression).toLowerCase().slice(0, 40);
    const targetId = allowed.has(asTrimmedString(row.targetId)) ? asTrimmedString(row.targetId) : "";
    // An invalid whisper target must never make the whole greeting or turn fail.
    // Treat it as an ordinary spoken line, without claiming anyone heard a whisper.
    if (kind === "whisper" && !targetId) kind = "dialogue";
    const requestedGaze = asTrimmedString(row.gazeAt);
    const gazeAt =
      kind === "narration"
        ? ""
        : requestedGaze === "player" || (allowed.has(requestedGaze) && requestedGaze !== speakerId)
          ? requestedGaze
          : kind === "whisper"
            ? targetId
            : "";
    return {
      kind,
      speakerId: kind === "narration" ? "__venue_scene__" : speakerId,
      content,
      heardBy:
        kind === "narration"
          ? [...audience]
          : [...new Set([speakerId, ...ids(row.heardBy), ...(kind === "whisper" ? [targetId] : [])])],
      ...(expression ? { expression } : {}),
      ...(gazeAt ? { gazeAt } : {}),
      ...(Array.isArray(row.staging) ? { staging: readStagingCues(row.staging, audience, expressionId) } : {}),
      ...(targetId ? { targetId } : {}),
    };
  });
  if (
    lines.some((line) => line.kind === "side" || line.kind === "whisper") &&
    !lines.some((line) => line.kind === "narration" || line.kind === "dialogue")
  )
    throw new Error("The venue response had side chatter without a main line.");
  const anchored: VenueReplyLine[] = lines.map((line, index) => {
    if (line.kind !== "side" && line.kind !== "whisper") return line;
    let anchorIndex = index - 1;
    while (anchorIndex >= 0 && (lines[anchorIndex]!.kind === "side" || lines[anchorIndex]!.kind === "whisper"))
      anchorIndex -= 1;
    if (anchorIndex < 0)
      anchorIndex = lines.findIndex((candidate) => candidate.kind === "narration" || candidate.kind === "dialogue");
    return { ...line, anchorIndex };
  });
  return {
    lines: anchored,
    heardPlayerBy: ids(raw.heardPlayerBy),
  };
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

function isInactive(session: VenueScene, now = Date.now()): boolean {
  return now - Date.parse(session.lastActivityAt || session.startedAt) >= INACTIVITY_MS;
}

async function interruptInactiveVisit(id: string): Promise<void> {
  if (hasVenueOperation(id)) return;
  const closed = await changeSession(id, (state) => {
    if (state.status === "closed" || !isInactive(state) || hasVenueOperation(id)) return;
    state.status = "closed";
    state.endedAt = new Date().toISOString();
    state.endReason = "inactivity";
    const hasRecollections = sessionRecollections(state).length > 0;
    state.memoryPending =
      (state.memoryMode === "end" && state.lines.some((line) => line.role === "user")) ||
      ((state.memoryMode === "tiered" || state.relationshipReview) && hasRecollections);
    if (state.memoryMode === "tiered" || state.relationshipReview)
      state.memoryReview.status = hasRecollections ? "pending" : "complete";
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

async function clearActivePointer(id: string): Promise<void> {
  await mutateDocument(ACTIVE_ID, activeSlot, (state) => {
    if (state.sessionId === id) {
      state.sessionId = "";
      state.placeId = "";
    }
  });
}

async function refreshZoneParticipants(session: VenueScene, completing = false): Promise<VenueScene> {
  if (!completing && hasVenueOperation(session.id)) return session;
  const village = await readVillageState(),
    venue = village.venues.find((entry) => entry.id === session.placeId);
  if (!venue || session.status === "closed") return session;
  const zoneId = session.zoneId ?? legacyZoneId(venue, session.area, session.spaceClass, session.privateOwnerId);
  const zone = resolveVenueZone(venue, zoneId);
  const revoked = session.zoneGrants?.some(
    (grant) => grant.zoneId === zoneId && (!zone || !canInviteToZone(venue, zone, grant.controllerId)),
  );
  if (!zone || zoneClosed(village, venue, zone) || revoked) {
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
    session.zoneGrants?.filter((grant) => {
      const target = resolveVenueZone(venue, grant.zoneId);
      return !target || !canInviteToZone(venue, target, grant.controllerId);
    }) ?? [];
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
  const positions = (session.accompanying ?? []).filter((entry) => {
    const destination = resolveVenueZone(venue, entry.zoneId);
    return !!destination && contactCanEnter(village, venue, destination.id, entry.characterId);
  });
  const accompanying = positions.filter((entry) => entry.zoneId === zoneId).map((entry) => entry.characterId);
  const people = session.sceneAttendance!.occupants.filter(
    (person) =>
      (person.zoneId === zoneId || accompanying.includes(person.characterId)) &&
      !session.departedIds?.includes(person.characterId) &&
      !positions.some((entry) => entry.characterId === person.characterId && entry.zoneId !== zoneId),
  );
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

let navigationQueue: Promise<unknown> = Promise.resolve();
const movingSessions = new Set<string>();
function serializedNavigation<T>(operation: () => Promise<T>): Promise<T> {
  const task = navigationQueue.then(operation, operation);
  navigationQueue = task.catch(() => {});
  return task;
}
export function moveVenueZone(
  sessionId: string,
  zoneId: string,
  expectedSceneRevision?: number,
  retryOfAttemptId?: string,
  operationId = `move:${zoneId}:${expectedSceneRevision}`,
): Promise<VenueScene> {
  return coordinateVenue(sessionId, operationId, "move", { zoneId }, expectedSceneRevision, retryOfAttemptId, () =>
    serializedNavigation(async () => {
      movingSessions.add(sessionId);
      try {
        return await moveVenueZoneOnce(sessionId, zoneId);
      } finally {
        movingSessions.delete(sessionId);
      }
    }),
  );
}
async function moveVenueZoneOnce(sessionId: string, zoneId: string): Promise<VenueScene> {
  assertVenueOwnership();
  const session = await requireLiveVenueSession(sessionId);
  if (session.status !== "active") throw conflict("Wait for the current scene to finish opening.");
  if (session.submissions.some((entry) => entry.mode === "act" && entry.action && !entry.actionReplyDone))
    throw conflict("Retry the pending action reply before moving to another zone.");
  const village = await readVillageState(),
    venue = village.venues.find((entry) => entry.id === session.placeId);
  const zone = venue && resolveVenueZone(venue, zoneId);
  if (!venue || !zone) throw notFound("That zone is not in this Venue.");
  if (zoneClosed(village, venue, zone)) throw conflict("This zone is closed for Renovation.");
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
  if (
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
    state.enteredFromZoneId = state.zoneId;
    state.zoneId = zone.id;
    state.doorwayContacts = [];
    const offer = state.entryOffers?.find((entry) => entry.zoneId === zone.id);
    if (offer?.accompanies && canOccupyZone(venue, zone, offer.controllerId))
      state.accompanying = [
        ...(state.accompanying ?? []).filter((entry) => entry.characterId !== offer.controllerId),
        { characterId: offer.controllerId, zoneId: zone.id },
      ];
    state.entryOffers = state.entryOffers?.filter((entry) => entry.zoneId !== zone.id);
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
    state.lastActivityAt = new Date().toISOString();
    state.recap = "";
  });
  await markZoneSeen(moved);
  return refreshZoneParticipants(moved, true);
}

async function markZoneSeen(session: VenueScene, generateImage = true): Promise<void> {
  await mutateVillageState((state) => {
    const venue = state.venues.find((entry) => entry.id === session.placeId);
    const zone =
      venue &&
      resolveVenueZone(
        venue,
        session.zoneId ?? legacyZoneId(venue, session.area, session.spaceClass, session.privateOwnerId),
      );
    if (zone) zone.seen = true;
  });
  if (session.area === "private") await markResidenceSeen(session, generateImage);
  if (!generateImage) return;
  const village = await readVillageState(),
    venue = village.venues.find((entry) => entry.id === session.placeId),
    zone = venue && resolveVenueZone(venue, session.zoneId ?? "");
  if (zone && ["staff", "restricted"].includes(zone.kind))
    outsideVenueOperation(() => {
      void import("./location-image.js")
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
  const grantedZoneIds: string[] = [];
  const zoneGrants: { zoneId: string; controllerId: string; source?: "relationship" }[] = [];
  const ongoingController = relationshipZoneController(village.relationshipContext, village, place, zone, "player");
  if (ongoingController) {
    grantedZoneIds.push(zone.id);
    zoneGrants.push({ zoneId: zone.id, controllerId: ongoingController, source: "relationship" });
  }
  if (!canOccupyZone(place, zone, "player") && !ongoingController) {
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
  const sceneAttendance = captureSceneAttendance(village, placeId, new Date());
  const participants = sceneAttendance.occupants
    .filter((person) => person.zoneId === zone.id)
    .map(({ characterId, name, doing }) => ({ characterId, name, doing }));
  if (participants.length > 4)
    throw conflict("Five residents occupy this Zone. Edit their agendas before starting a Scene.");
  const id = randomUUID();
  const session: VenueScene = {
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
    memoryProgress: null,
    memoryPending: false,
    memoryReview: { status: "none", attempts: 0, error: "", nextRecollection: 0, decisions: [] },
    recap: "",
  };
  await mutateDocument(`${SESSION_PREFIX}${id}`, sessionSlot, (value) => Object.assign(value, session));
  await mutateDocument(ACTIVE_ID, activeSlot, (active) => {
    if (active.sessionId) throw conflict("Finish the active Scene first.");
    active.sessionId = id;
    active.placeId = placeId;
  });
  await markZoneSeen(session);
  return session;
}

export async function enterResidencePrivateSpace(
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
  const inFlight = greetingTasks.get(id);
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
  greetingTasks.set(id, { task, abort: () => controller.abort() });
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
    greetingTasks.delete(id);
  }
}

const greetingTasks = new Map<string, { task: Promise<VenueScene>; abort: () => void }>();

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
    if (state.memoryMode === "live") {
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
  if (
    reply.invitationSignal &&
    (reply.invitationSignal.timing === "later" || reply.invitationSignal.venueId !== greeted.placeId)
  )
    await recordSpokenInvitation(greeted, reply.invitationSignal);
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
  if (greeted.memoryMode === "live") await processSavedExchange(id, "greeting");
  return refreshZoneParticipants(await readSession(id), true);
}

export async function continueVenueWithoutGreeting(id: string): Promise<VenueScene> {
  await cancelVenueOperation(id);
  await requireLiveVenueSession(id);
  const session = await changeSession(id, (state) => {
    if (isInactive(state) && !hasVenueOperation(state.id))
      throw new VillagesRequestError(410, "Interrupted: Inactivity. This Scene ended while you were away.");
    if (state.status === "opening") state.status = "active";
    else if (state.status !== "active") throw conflict("That Scene has already ended.");
  });
  greetingTasks.get(id)?.abort();
  return session;
}

type SceneReply = Awaited<ReturnType<typeof generateOnce>> & { roomInterpretation?: InterpretationBatch | null };
function quietContactReply(text: string, localIds: string[]): SceneReply {
  return {
    lines: [{ kind: "narration", speakerId: "__venue_scene__", content: text, heardBy: localIds }],
    heardPlayerBy: localIds,
    projectContexts: [],
    projectSpeech: [],
    sceneChange: null,
    residenceSignal: null,
    upgradeSignal: null,
    venueRequestSignal: null,
    invitationSignal: null,
    editApprovalSignal: null,
    recap: "",
    departures: [],
    sceneEnded: false,
    recollections: [],
    wishChanges: [],
    wishContexts: [],
    memoryChanges: [],
    relationshipChanges: { changes: [], permissions: [], disclosures: [] },
    earlierLineIds: [],
    memoryVersions: {},
    contactIntent: null,
    contactMoves: [],
    contactRelay: null,
    contactEndIds: [],
  };
}

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
    throw badGateway("The contact reply could not be kept accurate. Your draft is preserved; retry.");
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
  if (intent.boundaryZoneId && !neighbors.includes(intent.boundaryZoneId))
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
    const route = contactPath(village, venue, origin, targetZone, intent.targetId);
    boundary = route?.[1] ?? "";
  }
  if (intent.kind === "knock" && delivery === "voice" && !boundary && neighbors.length > 1)
    return quietContactReply("Choose which doorway to knock or call through using Knock / Call.", scene.activeIds);
  const reachable = contactReach(village, venue, origin, delivery, intent.kind === "knock" ? boundary : "");
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
    mayComeToPlayer: !!contactPath(village, venue, contactPosition(scene, id), origin, id),
    permittedDestinations: venueZones(venue)
      .filter((zone) => {
        const path = contactPath(village, venue, contactPosition(scene, id), zone.id, id);
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
If a local or doorway responder willingly offers to fetch the addressed person, return contactRelay:{speakerId,targetId,quote:"exact unconditional spoken offer"}. Do not invent the target's response or whereabouts. The server checks a permitted route with no hop cutoff. The messenger may approach a private doorway without entering it. Do not narrate the journey as completed yet.
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
  const relay = readContactRelay(reply.contactRelay, reply.lines, village, venue, afterMoves, audience);
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
The player stays at ${origin}; permission does not move the player. A completed journey by the target to meet them can return contactMoves:[{characterId:"${relay.targetId}",zoneId:"${origin}",quote:"exact spoken agreement"}] only when a route is permitted: ${!!contactPath(village, venue, contactPosition(scene, relay.targetId), origin, relay.targetId)}.
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
};

export async function sendVenueTurn(input: VenueTurnInput) {
  const prior = (await readSession(input.sessionId)).submissions.find((entry) => entry.id === input.submissionId);
  if (prior) runtimeDebug("submission replay", { sceneId: input.sessionId, submissionId: input.submissionId });
  if (!prior) await requireLiveVenueSession(input.sessionId);
  const payload = {
    message: input.message,
    mode: input.mode,
    targetId: input.targetId,
    ...(input.contact ? { contact: input.contact } : {}),
  };
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
    { replay: !!prior },
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
    "[villages] visit close: farewellMs=%d archiveMs=%d pending=%s",
    farewellMs,
    Math.round(performance.now() - started - farewellMs),
    ending.session.memoryPending,
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
  if (movingSessions.has(input.sessionId)) throw conflict("Wait for zone navigation to finish before sending.");
  let session = await readSession(input.sessionId);
  const compatibilityWishCheck = session.memoryMode === "live" && input.mode === "fulfill";
  // Retain the old request shape while using the same witnessed reply/checking path.
  if (session.memoryMode === "live" && input.mode === "fulfill") input = { ...input, mode: "chat" };
  const prior = session.submissions.find((entry) => entry.id === input.submissionId);
  if (prior) {
    if (prior.message !== input.message || prior.mode !== input.mode || prior.targetId !== input.targetId)
      throw conflict("That submission ID belongs to a different line.");
    if (prior.mode === "act" && prior.action && !prior.actionReplyDone) {
      session = await finishActReply(session, input.submissionId, input.message, prior.action);
      await applyProjectPickup(session.id, input.submissionId);
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
    if (!prior.processing) await processLegacyProjectTurn(session, prior);
    if (
      prior.invitationSignal &&
      (prior.invitationSignal.timing === "later" || prior.invitationSignal.venueId !== session.placeId)
    )
      await recordSpokenInvitation(session, prior.invitationSignal);
    await applyTurnMemories(session, prior);
    await applyTurnRecollections(session, prior);
    const recordEvents = await receiptForTurn(session, prior);
    return {
      session: await readSession(session.id),
      verdict: prior.verdict,
      action: prior.action ?? null,
      recordEvents: prior.action?.happened
        ? [{ id: `venue-action:${input.submissionId}`, kind: "venue" as const, text: prior.action.narration }]
        : recordEvents,
    };
  }
  session = await requireLiveVenueSession(session.id);
  const admitted = venueOperationSnapshot<unknown>();
  if (admitted) session = coerceSession(admitted);
  if (session.status !== "active") throw conflict("That Scene is not active.");
  if (input.mode !== "leave" && session.zoneId) {
    const village = await readVillageState(),
      venue = village.venues.find((entry) => entry.id === session.placeId),
      zone = venue && resolveVenueZone(venue, session.zoneId);
    if (!venue || !zone || zoneClosed(village, venue, zone))
      throw conflict("This zone is closed. Move to another zone or leave the Venue.");
  }
  if (input.mode !== "leave" && !input.message.trim()) throw badRequest("Write something before sending it.");
  if (input.message.length > 4000) throw badRequest("A line can be at most 4000 characters.");
  if (input.mode === "fulfill" && session.activeIds.length === 0)
    throw badRequest("Nobody is here to fulfill a wish for.");
  if (
    input.mode !== "contact" &&
    input.targetId &&
    !session.activeIds.includes(input.targetId) &&
    !(
      (input.mode === "chat" || input.mode === "ask") &&
      session.doorwayContacts?.some((entry) => entry.characterId === input.targetId)
    )
  )
    throw badRequest("That villager is no longer in this conversation.");
  if (input.mode === "fulfill" && !input.targetId) throw badRequest("Choose one villager for Fulfill.");
  if (input.mode === "act") {
    if (input.targetId) throw badRequest("Actions are about the place, not a villager.");
    const { actAtVenue } = await import("./venue-actions.js");
    let preparedReply: Awaited<ReturnType<typeof generate>> | undefined;
    const action = await actAtVenue(session.placeId, input.message, input.submissionId, async (result) => {
      if (session.activeIds.length)
        preparedReply = await venueCheckpoint("action-reply", () =>
          generate(
            session,
            input.message,
            "act",
            "",
            null,
            venueOperationSignal() ?? AbortSignal.timeout(90_000),
            undefined,
            result.narration,
          ),
        );
    });
    const completed = await finishActReply(
      await readSession(session.id),
      input.submissionId,
      input.message,
      action,
      preparedReply,
    );
    await applyProjectPickup(session.id, input.submissionId);
    await processSavedExchange(session.id, input.submissionId);
    return {
      session: completed,
      verdict: null,
      action,
      recordEvents: action.happened
        ? [{ id: `venue-action:${input.submissionId}`, kind: "venue" as const, text: action.narration }]
        : [],
    };
  }
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
  if (!contactIntentUsed && (input.mode === "chat" || input.mode === "ask")) {
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
  if (!contactIntentUsed && reply.contactIntent) {
    contactIntentUsed = reply.contactIntent;
    reply = await contactReply(session, contactIntentUsed);
  }
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
        (zoneId) => !contactCanEnter(current, currentVenue, zoneId, reply.contactRelay!.speakerId),
      )
    ) {
      throw badGateway("The messenger's route is no longer permitted. Your draft is preserved.");
    }
    for (const move of reply.contactMoves) {
      if (
        !contactPath(current, currentVenue, contactPosition(session, move.characterId), move.zoneId, move.characterId)
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
        ...new Set(
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
      requestMetrics: venueRequestMetrics(),
      ...(reply.sceneChange ? { sceneChange: reply.sceneChange } : {}),
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
    if ((recollections.length || state.relationshipReview) && state.memoryMode === "turn") state.memoryMode = "tiered";
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
  if (!submission.processing) await processLegacyProjectTurn(updated, submission);
  if (
    submission.invitationSignal &&
    (submission.invitationSignal.timing === "later" || submission.invitationSignal.venueId !== updated.placeId)
  )
    await recordSpokenInvitation(updated, submission.invitationSignal);
  await markZoneSeen(updated, updated.zoneId === session.zoneId);
  if (projectInterpretation) {
    await finalizeProjectDiagnostics(updated.id, projectInterpretation, submission.projectSpeech ?? []);
    scheduleSystemComparisons(updated.id, projectInterpretation);
  }
  if (reply.roomInterpretation) {
    await finalizeRoomInvitationDiagnostics(updated, reply.roomInterpretation, submission.invitationSignal);
    await writeInterpretationDiagnostics(updated.id, reply.roomInterpretation.traces).catch(() => {});
    scheduleSystemComparisons(updated.id, reply.roomInterpretation);
  }
  await applyTurnMemories(updated, submission);
  await applyTurnRecollections(updated, submission);
  let recordEvents = await receiptForTurn(updated, submission);
  let finalSession = updated;
  if (updated.status === "closed") {
    finalSession = await closeVenueSession(updated.id);
    const byId = new Map([...recordEvents, ...reviewReceipts(finalSession)].map((event) => [event.id, event] as const));
    recordEvents = [...byId.values()];
  }
  return {
    session: await refreshZoneParticipants(await readSession(finalSession.id), true),
    verdict,
    action: null,
    recordEvents,
  };
}

async function finalizeRoomInvitationDiagnostics(
  scene: VenueScene,
  batch: InterpretationBatch,
  signal: VenueSubmission["invitationSignal"],
) {
  const queued = batch.traces.filter((trace) => trace.applied.startsWith("Future invitation queued"));
  if (!queued.length) return;
  if (signal && (signal.timing === "later" || signal.venueId !== scene.placeId))
    await recordSpokenInvitation(scene, signal);
  const state = await readVillageState();
  for (const trace of queued) {
    const facts = asRecord(batch.checks[batch.traces.indexOf(trace)].facts);
    const venue = state.venues.find((entry) => entry.id === facts.venueId);
    const recorded =
      signal &&
      venue?.playerInvitations?.some(
        (invitation) => invitation.sourceLineId === signal.sourceLineId && invitation.zoneId === facts.zoneId,
      );
    trace.applied = recorded
      ? `Next-visit invitation recorded using ${trace.result.source}; authority and saved evidence validated`
      : "Rejected: future invitation did not validate against saved evidence and current authority";
  }
}

function validateCurrentRoomInvitation(reply: Awaited<ReturnType<typeof generate>>, village: VillageState): void {
  const signal = reply.invitationSignal;
  if (!signal) return;
  const venue = village.venues.find((entry) => entry.id === signal.venueId);
  const zone = venue && resolveVenueZone(venue, signal.zoneId);
  if (!venue || !zone || zoneClosed(village, venue, zone) || !canInviteToZone(venue, zone, signal.residentId))
    reply.invitationSignal = null;
}

export function applyInterpretedRoomEvents(
  session: VenueScene,
  batch: InterpretationBatch | null | undefined,
  village: VillageState,
): void {
  if (!batch) return;
  session.pendingRoomQuestions = batch.checks
    .filter((_check, index) => batch.results[index].outcome === "unresolved")
    .map((check) => check.question)
    .slice(0, 8);
  const invitationCount = batch.results.filter((result) =>
    ["invite-now", "invite-later"].includes(result.outcome),
  ).length;
  for (const [index, result] of batch.results.entries()) {
    const trace = batch.traces[index],
      facts = asRecord(batch.checks[index].facts);
    const venue = village.venues.find((entry) => entry.id === (facts.venueId ?? session.placeId));
    const zone = venue && resolveVenueZone(venue, String(facts.zoneId));
    const actor = String(facts.actorId);
    trace.applied =
      result.outcome === "unresolved" ? "Unresolved; no new permission or movement was inferred" : "No new room event";
    if (["none", "unresolved"].includes(result.outcome)) continue;
    if (!venue || !zone || zoneClosed(village, venue, zone) || !canInviteToZone(venue, zone, actor)) {
      trace.applied = "Rejected: current Zone authority or availability did not validate";
      continue;
    }
    if (
      !batch.checks[index].evidence.some(
        (line) =>
          line.current &&
          result.evidenceIds.includes(line.id) &&
          (line.speakerId === actor || line.kind === "narration"),
      )
    ) {
      trace.applied = "Rejected: no witnessed current evidence from the authorized speaker";
      continue;
    }
    if (["invite-now", "invite-later"].includes(result.outcome)) {
      if (invitationCount !== 1) {
        trace.applied = "Unresolved: multiple invitation targets; clarification is needed";
        continue;
      }
      trace.applied =
        result.outcome === "invite-now" &&
        session.entryOffers?.some((offer) => offer.zoneId === zone.id && offer.controllerId === actor)
          ? `Entry offer created using ${result.source}; speaker authority validated`
          : result.outcome === "invite-later" || venue.id !== session.placeId
            ? "Future invitation queued for validation against saved speech"
            : "Rejected: no current supporting invitation evidence";
      continue;
    }
    if (result.outcome === "dismiss") {
      if (venue.id !== session.placeId) {
        trace.applied = "Rejected: dismissal concerns another Venue";
        continue;
      }
      if (session.zoneId !== zone.id) {
        trace.applied = "Rejected: player is not in the dismissed Zone";
        continue;
      }
      const destinationId = dismissalDestination(village, venue, session);
      const destination = destinationId && resolveVenueZone(venue, destinationId);
      if (!destination) {
        trace.applied = "Unresolved: no adjacent accessible exit path";
        continue;
      }
      session.enteredFromZoneId = zone.id;
      session.zoneId = destination.id;
      session.area = zoneArea(destination);
      session.spaceClass = destination.venueClass;
      session.privateOwnerId = destination.ownerId ?? "";
      session.privateSpaceId = ["private-residence", "staff", "restricted"].includes(destination.kind)
        ? destination.id
        : undefined;
      session.doorwayContacts = [];
      session.recap = "";
      trace.applied = `Moved to ${destination.name} within the same Scene using ${result.source}`;
    } else if (result.outcome === "refuse")
      trace.applied = `Entry refused using ${result.source}; current Scene permission withdrawn`;
    if (venue.id !== session.placeId) {
      trace.applied = "Refusal understood for another Venue; no current Scene access changed";
      continue;
    }
    session.dismissedZoneIds = [...new Set([...(session.dismissedZoneIds ?? []), zone.id])];
    session.entryOffers = session.entryOffers?.filter((offer) => offer.zoneId !== zone.id);
    session.grantedZoneIds = session.grantedZoneIds?.filter((id) => id !== zone.id);
    session.zoneGrants = session.zoneGrants?.filter((grant) => grant.zoneId !== zone.id);
  }
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
  const quote = signal.quote.replace(/\s+/gu, " ").toLowerCase();
  const spoken = session.lines.find(
    (line) =>
      (signal.evidenceKind === "action" ? line.kind === "narration" : line.speakerId === signal.residentId) &&
      line.content.replace(/\s+/gu, " ").toLowerCase().includes(quote) &&
      (!signal.sourceLineId || line.id === signal.sourceLineId),
  );
  if (!spoken || !quote) return;
  await mutateVillageState((state) => {
    const venue = state.venues.find((entry) => entry.id === signal.venueId);
    if (!venue) return;
    const zone = resolveVenueZone(
      venue,
      signal.zoneId ??
        legacyZoneId(venue, signal.scope === "private" ? "private" : "shared", "residence", signal.ownerId),
    );
    if (!zone || zoneClosed(state, venue, zone) || !canInviteToZone(venue, zone, signal.residentId)) return;
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
  await mutateVillageState((state) => {
    const venue = state.venues.find((entry) => entry.id === session.placeId);
    if (!venue || !venueClasses(venue).includes("residence")) return;
    if (session.zoneId) {
      const zone = resolveVenueZone(venue, session.zoneId);
      if (zone) zone.seen = true;
    } else if (session.area === "shared") venue.playerSeenShared = true;
    if (!session.zoneId && session.area === "private" && venueResidentIds(venue).includes(session.privateOwnerId))
      venue.playerSeenPrivateIds = [...new Set([...(venue.playerSeenPrivateIds ?? []), session.privateOwnerId])];
  });
  if (generateImage && session.area === "private" && session.privateOwnerId) {
    outsideVenueOperation(() => {
      void import("./location-image.js")
        .then(({ generateFirstPrivateSpaceImage }) =>
          generateFirstPrivateSpaceImage(session.placeId, session.privateOwnerId),
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
    if (state.venueEvents.some((event) => event.id === id)) return;
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
      { id, venueId: session.placeId, zoneId, venueName: venue.name, text: change.narration, at },
      ...state.venueEvents,
    ].slice(0, 200);
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

const RECOLLECTION_LIFETIME_MS = 24 * 60 * 60 * 1000;

function sameIds(left: readonly string[], right: readonly string[]): boolean {
  return [...new Set(left)].sort().join("\n") === [...new Set(right)].sort().join("\n");
}

async function applyTurnRecollections(session: VenueScene, submission: VenueSubmission): Promise<void> {
  if (session.memoryMode === "live") return;
  if (!submission.recollections?.length) return;
  const occurredAt = new Date(submission.at || Date.now()).toISOString();
  const expiry = new Date(Date.parse(occurredAt) + RECOLLECTION_LIFETIME_MS).toISOString();
  await mutateVillageState((state) => {
    const now = Date.parse(occurredAt);
    state.recollections = state.recollections.filter((entry) => Date.parse(entry.expiresAt) > now);
    for (const recollection of submission.recollections ?? []) {
      const knownByCharacterIds = recollection.knownByCharacterIds.filter((id) =>
        session.participants.some((person) => person.characterId === id),
      );
      const subjectCharacterIds = recollection.subjectCharacterIds.filter((id) =>
        session.participants.some((person) => person.characterId === id),
      );
      const lineIds = [...new Set(recollection.lineIds)];
      if (
        !recollection.text ||
        !knownByCharacterIds.length ||
        !lineIds.length ||
        lineIds.some(
          (lineId) =>
            !session.lines.some(
              (line) =>
                line.id === lineId && knownByCharacterIds.every((characterId) => line.heardBy.includes(characterId)),
            ),
        )
      )
        continue;
      if (state.recollections.some((entry) => entry.id === recollection.id)) continue;
      const normalized = recollection.text.replace(/\s+/gu, " ").trim().toLowerCase();
      const repeated = state.recollections.find(
        (entry) =>
          entry.text.replace(/\s+/gu, " ").trim().toLowerCase() === normalized &&
          sameIds(entry.subjectCharacterIds, subjectCharacterIds) &&
          sameIds(entry.knownByCharacterIds, knownByCharacterIds),
      );
      if (repeated) {
        if (repeated.sourceSubmissionIds.includes(submission.id)) continue;
        repeated.expiresAt = expiry;
        repeated.lastReinforcedAt = occurredAt;
        repeated.reinforcementCount += 1;
        repeated.sourceLineIds = [...new Set([...repeated.sourceLineIds, ...lineIds])];
        repeated.sourceSubmissionIds = [...new Set([...repeated.sourceSubmissionIds, submission.id])];
        repeated.evidence.push({ visitId: session.id, submissionId: submission.id, lineIds });
        continue;
      }
      const stored: VillageRecollection = {
        id: recollection.id,
        visitId: session.id,
        occurredAt,
        expiresAt: expiry,
        text: recollection.text,
        subjectCharacterIds,
        knownByCharacterIds,
        sourceLineIds: lineIds,
        sourceSubmissionIds: [submission.id],
        evidence: [{ visitId: session.id, submissionId: submission.id, lineIds }],
        reinforcementCount: 0,
        lastReinforcedAt: occurredAt,
      };
      state.recollections.unshift(stored);
    }
  });
}

async function applyTurnMemories(session: VenueScene, submission: VenueSubmission): Promise<void> {
  if (session.memoryMode !== "turn" || !submission.turnMemories?.length) return;
  await mutateVillageState((state) => {
    const moment = deriveVillageMoment({
      foundedAt: state.foundedAt,
      seed: state.seed,
      now: new Date(submission.at || Date.now()),
    });
    for (const memory of submission.turnMemories ?? []) {
      const person = session.participants.find((entry) => entry.characterId === memory.characterId);
      const ids = [...new Set(memory.lineIds ?? [])];
      if (
        !person ||
        !memory.text ||
        !ids.length ||
        ids.some((id) => !session.lines.some((line) => line.id === id && line.heardBy.includes(person.characterId)))
      )
        continue;
      const id = `${session.id}:turn:${submission.id}:memory:${person.characterId}`;
      if (state.chronicle.some((entry) => entry.id === id)) continue;
      state.chronicle.unshift({
        id,
        dayIndex: moment.dayIndex,
        clock: moment.dayPhase,
        occurredAt: moment.instant,
        timePrecision: "exact",
        scope: "private",
        actors: [{ id: person.characterId, name: person.name }],
        kind: "chat",
        text: memory.text,
        sourceLineIds: ids,
      });
    }
  });
}

async function receiptForTurn(session: VenueScene, submission: VenueSubmission): Promise<VenueRecordEvent[]> {
  // Domain bookkeeping can finish after the reply's original Scene object was read.
  submission = (await readSession(session.id)).submissions.find((turn) => turn.id === submission.id) ?? submission;
  const village = await readVillageState();
  const cached = (submission.recordEvents ?? []).map((event) => {
    if (event.kind !== "memory" || event.detail) return event;
    const memory = village.chronicle.find((entry) => entry.id === event.id);
    return memory ? { ...event, detail: memory.text } : event;
  });
  const events: VenueRecordEvent[] = [];
  if (village.relationshipContext && submission.liveProposals) {
    const receiptIds = new Set(submission.processing?.domains.relationships.receiptIds ?? []);
    // A retry reconstructs notices from effects committed in the relationship document.
    const receipts = Object.values(village.relationshipContext.receipts).filter((receipt) =>
      receiptIds.has(receipt.id),
    );
    events.push(...relationshipClosingNotices(receipts, village.relationshipContext, village));
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
  const change = village.venueEvents.find((entry) => entry.id === venueId);
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
  if (JSON.stringify(combined) !== JSON.stringify(submission.recordEvents))
    await changeSession(session.id, (state) => {
      const saved = state.submissions.find((entry) => entry.id === submission.id);
      if (saved) saved.recordEvents = combined;
    });
  return combined;
}

const MEMORY_REVIEW_ERROR = "This Scene is safely archived, but its memory review is still pending.";

function sessionRecollections(session: VenueScene): VenueRecollection[] {
  const seen = new Set<string>();
  const memories = session.submissions.flatMap((submission) =>
    (submission.recollections ?? []).filter((entry) => {
      if (seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    }),
  );
  if (!session.relationshipReview) return memories;
  const represented = new Set(memories.flatMap((entry) => entry.lineIds));
  const contacts: VenueRecollection[] = [];
  for (const line of session.lines) {
    if (
      line.role !== "assistant" ||
      line.kind === "narration" ||
      !line.speakerId ||
      represented.has(line.id) ||
      !/\b(?:standing permission|always welcome|whenever|anytime|from now on|revoke|no longer welcome)\b/iu.test(
        line.content,
      )
    )
      continue;
    contacts.push({
      id: session.id + ":permission-input:" + line.id,
      relationshipOnly: true,
      text: "Review any explicit standing permission independently; reject memory promotion.",
      subjectCharacterIds: [line.speakerId],
      knownByCharacterIds: [line.speakerId],
      lineIds: [line.id],
    });
    represented.add(line.id);
  }
  for (const submission of session.submissions) {
    if (submission.mode === "greet") continue;
    const ids = [submission.playerLineId, ...(submission.replyLineIds ?? [])].filter((id): id is string => !!id);
    const lines = session.lines.filter((line) => ids.includes(line.id));
    const witnesses = session.participants.filter((person) => substantiveContact(lines, person.characterId, "player"));
    if (!witnesses.length || lines.every((line) => represented.has(line.id))) continue;
    for (const person of witnesses) {
      const heard = lines.filter((line) => line.heardBy.includes(person.characterId));
      contacts.push({
        id: session.id + ":contact-input:" + submission.id + ":" + person.characterId,
        relationshipOnly: true,
        text: "Substantive contact: review warmth/trust independently; reject memory promotion.",
        subjectCharacterIds: [person.characterId],
        knownByCharacterIds: [person.characterId],
        lineIds: heard.map((line) => line.id),
      });
    }
  }
  return [...memories, ...contacts];
}

function durableMemoryId(visitId: string, recollectionIds: readonly string[]): string {
  const digest = createHash("sha256")
    .update([...recollectionIds].sort().join("\n"))
    .digest("hex")
    .slice(0, 20);
  return `${visitId}:durable:${digest}`;
}

function reviewDecisionId(visitId: string, action: "promote" | "reject", recollectionIds: readonly string[]): string {
  const digest = createHash("sha256")
    .update(`${action}\n${[...recollectionIds].sort().join("\n")}`)
    .digest("hex")
    .slice(0, 20);
  return `${visitId}:review:${digest}`;
}

function memoryReviewMessages(
  session: VenueScene,
  recollections: readonly VenueRecollection[],
  village: VillageState,
  previous: readonly VenueMemoryDecision[],
  backgroundLimit: number,
): CapabilityLanguageModelMessage[] {
  const queryWords = new Set(
    recollections.flatMap((entry) => entry.text.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ?? []),
  );
  const relevant = (texts: string[], recentFirst: boolean) =>
    texts
      .map((value, index) => ({
        value,
        index,
        score: (value.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ?? []).filter((word) => queryWords.has(word)).length,
      }))
      .sort(
        (left, right) =>
          right.score - left.score || (recentFirst ? right.index - left.index : left.index - right.index),
      )
      .slice(0, backgroundLimit)
      .sort((left, right) => left.index - right.index)
      .map((entry) => entry.value);
  const lines = new Map(session.lines.map((line) => [line.id, line]));
  const venue = village.venues.find((entry) => entry.id === session.placeId);
  const worldState = venue
    ? [
        venue.state.condition,
        ...venue.state.publicFacts,
        ...(venue.state.features ?? []).map((feature) => feature.text),
        ...venue.state.furniture.map((item) => `Present item: ${item}`),
      ].filter(Boolean)
    : [];
  return [
    {
      role: "system",
      content:
        'You adjudicate short-term conversational recollections after a Villages visit. Review EVERY supplied recollection exactly once by its batch-local index. Consolidate related recollections when they describe one event, but do not combine recollections whose witnesses did not hear the same evidence. Promote only: (1) commitments or obligations, (2) stable personal facts, (3) meaningful preferences, sensitivities, or boundaries, (4) relationship or trust changes, or (5) significant shared experiences not already represented in current world state. Reject routine timing or presence, greetings, courtesy, transient mood, weak inference, one-off jokes, duplicates, and facts already represented in world state or previous promotions. There is NO promotion quota. Return JSON only: {"decisions":[{"action":"promote","indices":[0],"reason":"brief explanation","category":"commitment|personal-fact|preference|relationship|shared-experience","text":"concise durable event"},{"action":"reject","indices":[1],"reason":"routine|transient|weak-inference|duplicate|world-state|other"}],"complete":true}. Every index must appear in exactly one decision. Do not invent evidence or indices.' +
        "\n" +
        EVENT_MEMORY_GUIDANCE +
        "\n\n" +
        (session.relationshipReview ? RELATIONSHIP_REVIEW_INSTRUCTION : ""),
    },
    {
      role: "user",
      content: JSON.stringify({
        relationshipActors: ["player", ...village.villagers.map((person) => person.characterId)],
        relationshipContext: session.participants.map((person) => relationshipPrompt(village, person.characterId)),
        controlledZones: village.venues.flatMap((place) =>
          venueZones(place).map((zone) => ({
            venueId: place.id,
            zoneId: zone.id,
            name: zone.name,
            controllers: village.villagers
              .filter((person) => canInviteToZone(place, zone, person.characterId))
              .map((person) => person.characterId),
          })),
        ),
        verifiedEffects: session.submissions
          .filter((row) => row.action || row.sceneChange || row.verdict?.fulfilled)
          .map((row) => ({
            submissionId: row.id,
            action: row.action,
            sceneChange: row.sceneChange,
            fulfilledWishId: row.verdict?.fulfilled ? row.wishId : undefined,
          })),
        visitId: session.id,
        venue: session.placeName,
        participants: session.participants,
        currentWorldState: relevant(worldState, backgroundLimit),
        existingDurableMemories: relevant(
          village.chronicle.filter((entry) => entry.kind !== "tick").map((entry) => entry.text),
          false,
        ),
        previousPromotions: relevant(
          previous.filter((entry) => entry.action === "promote").map((entry) => entry.text ?? ""),
          true,
        ),
        recollections: recollections.map((entry, index) => ({
          index,
          relationshipOnly: entry.relationshipOnly === true,
          text: entry.text,
          subjects: entry.subjectCharacterIds,
          knownBy: entry.knownByCharacterIds,
          evidence: entry.lineIds.map((lineId) => {
            const line = lines.get(lineId);
            return line
              ? {
                  id: line.id,
                  speakerId: line.role === "user" ? "player" : line.speakerId,
                  kind: line.kind,
                  playerHeard: !line.contactHidden && (line.kind !== "whisper" || line.targetId === "player"),
                  speaker: line.name || "Player",
                  text:
                    line.content.length <= 1_600
                      ? line.content
                      : `${line.content.slice(0, 800)} … ${line.content.slice(-800)}`,
                  heardBy: line.heardBy,
                }
              : { missing: true };
          }),
        })),
      }),
    },
  ];
}

function parseMemoryReview(
  raw: Record<string, unknown> | null,
  session: VenueScene,
  source: readonly VenueRecollection[],
): VenueMemoryDecision[] {
  if (raw?.complete !== true || !Array.isArray(raw.decisions)) throw new Error(MEMORY_REVIEW_ERROR);
  const lineById = new Map(session.lines.map((line) => [line.id, line]));
  const used = new Set<number>();
  const decisions: VenueMemoryDecision[] = [];
  for (const value of raw.decisions) {
    const row = asRecord(value);
    const action = row.action === "promote" ? "promote" : row.action === "reject" ? "reject" : null;
    const indices =
      Array.isArray(row.indices) &&
      row.indices.every(
        (index) => typeof index === "number" && Number.isInteger(index) && index >= 0 && index < source.length,
      )
        ? (row.indices as number[])
        : [];
    if (
      !action ||
      !indices.length ||
      indices.length !== new Set(indices).size ||
      indices.some((index) => used.has(index))
    )
      throw new Error(MEMORY_REVIEW_ERROR);
    indices.forEach((index) => used.add(index));
    const entries = indices.map((index) => source[index]!);
    const recollectionIds = entries.map((entry) => entry.id);
    const reason = asTrimmedString(row.reason).slice(0, 240) || "other";
    if (action === "reject" || entries.some((entry) => entry.relationshipOnly)) {
      decisions.push({
        id: reviewDecisionId(session.id, "reject", recollectionIds),
        action: "reject",
        recollectionIds,
        reason,
      });
      continue;
    }
    const category =
      row.category === "commitment" ||
      row.category === "personal-fact" ||
      row.category === "preference" ||
      row.category === "relationship" ||
      row.category === "shared-experience"
        ? row.category
        : null;
    const text = asTrimmedString(row.text).slice(0, MAX_CHRONICLE_LENGTH);
    const subjectCharacterIds = [...new Set(entries.flatMap((entry) => entry.subjectCharacterIds))];
    const knownByCharacterIds = entries[0]!.knownByCharacterIds.filter((id) =>
      entries.every((entry) => entry.knownByCharacterIds.includes(id)),
    );
    const lineIds = [...new Set(entries.flatMap((entry) => entry.lineIds))];
    if (
      !category ||
      !text ||
      !knownByCharacterIds.length ||
      !lineIds.length ||
      lineIds.some((lineId) => {
        const line = lineById.get(lineId);
        return !line || knownByCharacterIds.some((characterId) => !line.heardBy.includes(characterId));
      })
    )
      throw new Error(MEMORY_REVIEW_ERROR);
    decisions.push({
      id: reviewDecisionId(session.id, action, recollectionIds),
      action,
      recollectionIds,
      reason,
      category,
      text,
      subjectCharacterIds,
      knownByCharacterIds,
      lineIds,
    });
  }
  if (used.size !== source.length) throw new Error(MEMORY_REVIEW_ERROR);
  return decisions;
}

function decisionsCover(decisions: readonly VenueMemoryDecision[], source: readonly VenueRecollection[]): boolean {
  const ids = decisions.flatMap((decision) => decision.recollectionIds);
  return (
    ids.length === new Set(ids).size && ids.length === source.length && source.every((entry) => ids.includes(entry.id))
  );
}

async function generateMemoryReview(
  session: VenueScene,
  source: readonly VenueRecollection[],
  village: VillageState,
  signal: AbortSignal,
  saved: readonly VenueMemoryDecision[],
  nextRecollection: number,
  checkpoint: (decisions: VenueMemoryDecision[], next: number, relationships?: RelationshipReview) => Promise<void>,
): Promise<VenueMemoryDecision[]> {
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const outputLimit = model.maxOutputTokens ?? 16_384;
  const outputTokens = (count: number) => Math.min(outputLimit, Math.max(2_048, 512 + count * 320));
  const maxBatchSize = Math.max(1, Math.floor((outputLimit - 512) / 320));
  const decisions = [...saved];
  let fitMs = 0;
  const fits = (entries: readonly VenueRecollection[], backgroundLimit: number) => {
    const started = performance.now();
    const messages = memoryReviewMessages(session, entries, village, decisions, backgroundLimit);
    const tokens = outputTokens(entries.length);
    const fitted = model.fitContext(messages, { maxTokens: tokens });
    fitMs += performance.now() - started;
    return fitted.maxTokens === tokens && JSON.stringify(fitted.messages) === JSON.stringify(messages);
  };

  const process = async (start: number, end: number, backgroundLimit: number): Promise<void> => {
    signal.throwIfAborted();
    const batch = source.slice(start, end);
    const selectedBackground = [backgroundLimit, 16, 8, 0].find((limit) => fits(batch, limit));
    if (selectedBackground === undefined) throw new Error(MEMORY_REVIEW_ERROR);
    const messages = memoryReviewMessages(session, batch, village, decisions, selectedBackground);
    const tokens = outputTokens(batch.length);
    const started = performance.now();
    const completion = await completeWithRoom(model, messages, tokens, {
      temperature: 0.1,
      reasoningEffort: null,
      verbosity: null,
      debugMode: false,
      signal: AbortSignal.any([signal, AbortSignal.timeout(90_000)]),
    });
    villagesLogger().debug(
      "[villages] memory review batch: items=%d outputLimit=%d outputChars=%d finish=%s modelMs=%d fitMs=%d usage=%j",
      batch.length,
      tokens,
      (completion.content ?? "").length,
      completion.finishReason ?? "unknown",
      Math.round(performance.now() - started),
      Math.round(fitMs),
      completion.usage ?? {},
    );
    let fresh: VenueMemoryDecision[];
    let relationships = emptyRelationshipReview();
    try {
      if (completion.finishReason === "length") throw new Error(MEMORY_REVIEW_ERROR);
      const raw = extractJsonObject(completion.content ?? "");
      fresh = parseMemoryReview(raw, session, batch);
      if (session.relationshipReview) {
        const lineIds = new Set(batch.flatMap((entry) => entry.lineIds));
        relationships = parseRelationshipReview(
          raw?.relationshipReview,
          session.id,
          relationshipEvidence(session).filter((line) => lineIds.has(line.id)),
          village,
        );
      }
    } catch (error) {
      if (end - start === 1) throw error;
      const middle = start + Math.floor((end - start) / 2);
      await process(start, middle, backgroundLimit);
      await process(middle, end, backgroundLimit);
      return;
    }
    decisions.push(...fresh);
    await checkpoint(decisions, end, relationships);
  };

  let cursor = nextRecollection;
  while (cursor < source.length) {
    signal.throwIfAborted();
    let low = cursor + 1;
    let high = Math.min(source.length, cursor + maxBatchSize);
    const backgroundLimit = [32, 16, 8, 0].find((limit) => fits(source.slice(cursor, low), limit));
    if (backgroundLimit === undefined) throw new Error(MEMORY_REVIEW_ERROR);
    let end = low;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      if (fits(source.slice(cursor, middle), backgroundLimit)) {
        end = middle;
        low = middle + 1;
      } else high = middle - 1;
    }
    await process(cursor, end, backgroundLimit);
    cursor = end;
  }
  if (!decisionsCover(decisions, source)) throw new Error(MEMORY_REVIEW_ERROR);
  return decisions;
}

function relationshipEvidence(session: VenueScene): RelationshipEvidenceLine[] {
  return session.lines.map((line) => ({
    ...line,
    playerHeard: !line.contactHidden && (line.kind !== "whisper" || line.targetId === "player"),
  }));
}
async function commitVisitRelationships(session: VenueScene): Promise<void> {
  if (!session.relationshipReview || session.relationshipReview.applied || session.endReason === "debug") return;
  const village = await readVillageState();
  if (village.seed !== session.relationshipReview.seed) return;
  const reviews = session.relationshipReview.batches;
  const merged: RelationshipReview = {
    changes: [...new Map(reviews.flatMap((review) => review.changes).map((row) => [row.id, row])).values()],
    permissions: [...new Map(reviews.flatMap((review) => review.permissions).map((row) => [row.id, row])).values()],
    disclosures: [...new Map(reviews.flatMap((review) => review.disclosures).map((row) => [row.id, row])).values()],
  };
  const lines = relationshipEvidence(session);
  const actors = ["player", ...session.participants.map((person) => person.characterId)];
  for (const fromId of actors.filter((actor) => actor !== "player"))
    for (const toId of actors) {
      if (fromId === toId || !substantiveContact(lines, fromId, toId)) continue;
      merged.changes.push({
        id: session.id + ":contact:" + fromId + ":" + toId,
        fromId,
        toId,
        dimension: "warmth",
        amount: 0,
        ordinary: true,
        reason: "Shared substantive contact.",
        lineIds: lines.filter((line) => line.heardBy.includes(fromId)).map((line) => line.id),
        disclosed: false,
        contact: true,
      });
    }
  let receipts: RelationshipReceipt[] = [];
  const settled = await mutateRelationships(village.seed, (state) => {
    receipts = applyRelationshipReview(state, merged, village, session.id, session.endedAt);
    captureRelationshipKnowledge(state, village);
  });
  const notices = relationshipClosingNotices(receipts, settled, village);
  await changeSession(session.id, (state) => {
    if (!state.relationshipReview || state.relationshipReview.seed !== village.seed) return;
    state.relationshipReview.applied = true;
    state.relationshipReview.receipts = notices;
  });
}

async function commitMemoryReview(session: VenueScene, decisions: readonly VenueMemoryDecision[]): Promise<void> {
  const promoted = decisions.filter(
    (
      decision,
    ): decision is VenueMemoryDecision &
      Required<
        Pick<VenueMemoryDecision, "category" | "text" | "subjectCharacterIds" | "knownByCharacterIds" | "lineIds">
      > =>
      decision.action === "promote" &&
      !!decision.category &&
      !!decision.text &&
      !!decision.subjectCharacterIds &&
      !!decision.knownByCharacterIds &&
      !!decision.lineIds,
  );
  if (!promoted.length) return;
  await mutateVillageState((state) => {
    const moment = deriveVillageMoment({
      foundedAt: state.foundedAt,
      seed: state.seed,
      now: new Date(session.endedAt || Date.now()),
    });
    const fresh: VillageChronicleEntry[] = promoted
      .map((decision): VillageChronicleEntry => ({
        id: durableMemoryId(session.id, decision.recollectionIds),
        dayIndex: moment.dayIndex,
        clock: moment.dayPhase,
        occurredAt: moment.instant,
        timePrecision: "exact",
        scope: "private",
        actors: decision.knownByCharacterIds.map((characterId) => ({
          id: characterId,
          name: session.participants.find((person) => person.characterId === characterId)?.name ?? "",
        })),
        kind: "chat",
        memoryCategory: decision.category,
        subjectCharacterIds: decision.subjectCharacterIds,
        knownByCharacterIds: decision.knownByCharacterIds,
        sourceVisitId: session.id,
        sourceRecollectionIds: decision.recollectionIds,
        sourceLineIds: decision.lineIds,
        text: decision.text,
      }))
      .filter((entry) => !state.chronicle.some((saved) => saved.id === entry.id));
    state.chronicle = [...fresh, ...state.chronicle];
  });
}

async function reviewTieredMemories(id: string, signal: AbortSignal): Promise<VenueScene> {
  const started = performance.now();
  let session = await readSession(id);
  const source = sessionRecollections(session);
  if (!source.length)
    return changeSession(id, (state) => {
      state.memoryReview = {
        status: "complete",
        attempts: state.memoryReview.attempts,
        error: "",
        nextRecollection: 0,
        decisions: [],
      };
      state.memoryPending = false;
    });
  try {
    let decisions = session.memoryReview.decisions;
    if (!decisionsCover(decisions, source)) {
      const next = Math.min(session.memoryReview.nextRecollection, source.length);
      const resumable = decisionsCover(decisions, source.slice(0, next));
      await changeSession(id, (state) => {
        state.memoryReview.status = "pending";
        state.memoryReview.attempts += 1;
        state.memoryReview.error = "";
        if (!resumable) {
          state.memoryReview.decisions = [];
          state.memoryReview.nextRecollection = 0;
          if (state.relationshipReview) state.relationshipReview.batches = [];
        }
        state.memoryPending = true;
      });
      session = await readSession(id);
      decisions = await generateMemoryReview(
        session,
        source,
        await readVillageState(),
        signal,
        session.memoryReview.decisions,
        session.memoryReview.nextRecollection,
        async (progress, nextRecollection, relationships) => {
          await changeSession(id, (state) => {
            state.memoryReview.decisions = [...progress];
            state.memoryReview.nextRecollection = nextRecollection;
            if (state.relationshipReview && relationships) state.relationshipReview.batches.push(relationships);
          });
        },
      );
    }
    let memoryError: unknown;
    try {
      const latest = await readSession(id);
      if (!latest.memoryReview.applied) {
        await commitMemoryReview(latest, decisions);
        await changeSession(id, (state) => {
          state.memoryReview.applied = true;
        });
      }
    } catch (error) {
      memoryError = error;
    }
    await commitVisitRelationships(await readSession(id));
    if (memoryError) throw memoryError;
    const completed = await changeSession(id, (state) => {
      state.memoryReview.status = "complete";
      state.memoryReview.error = "";
      state.memoryPending = false;
    });
    villagesLogger().debug(
      "[villages] memory review complete: items=%d decisions=%d elapsedMs=%d",
      source.length,
      decisions.length,
      Math.round(performance.now() - started),
    );
    return completed;
  } catch (error) {
    villagesLogger().warn("[villages] memory review remains pending for %s: %s", id, String(error));
    return changeSession(id, (state) => {
      state.memoryReview.status = "pending";
      state.memoryReview.error = error instanceof Error ? error.message.slice(0, 500) : MEMORY_REVIEW_ERROR;
      state.memoryPending = true;
    });
  }
}

function reviewReceipts(session: VenueScene): VenueRecordEvent[] {
  const notices = session.relationshipReview?.applied ? session.relationshipReview.receipts : [];
  if (!session.memoryReview.applied && session.memoryReview.status !== "complete") return notices;
  return [
    ...notices,
    ...session.memoryReview.decisions
      .filter((decision) => decision.action === "promote" && !!decision.text)
      .map((decision) => ({
        id: durableMemoryId(session.id, decision.recollectionIds),
        kind: "memory" as const,
        text: `${
          decision.knownByCharacterIds
            ?.map((id) => session.participants.find((person) => person.characterId === id)?.name)
            .filter(Boolean)
            .join(", ") || "A villager"
        } remembered this exchange.`,
        detail: decision.text,
      })),
  ];
}

type MemoryUnit = {
  lineId: string;
  part: number;
  role: VenueLine["role"];
  speaker: string;
  text: string;
  heardBy: string[];
};
const MEMORY_INPUT_CEILING = 12_000;
const MEMORY_LINE_PART = 2_400;
const MEMORY_ERROR = "The conversation could not be remembered. Try ending it again.";

function memoryUnits(session: VenueScene): MemoryUnit[] {
  const heard = new Map(session.heardHistory.map((history) => [history.characterId, new Set(history.lineIds)]));
  return session.lines.flatMap((line) => {
    const heardBy = session.participants
      .map((person) => person.characterId)
      .filter((id) => heard.get(id)?.has(line.id));
    if (!heardBy.length) return [];
    const units: MemoryUnit[] = [];
    for (let offset = 0; offset < line.content.length; offset += MEMORY_LINE_PART)
      units.push({
        lineId: line.id,
        part: Math.floor(offset / MEMORY_LINE_PART) + 1,
        role: line.role,
        speaker: line.name || (line.role === "user" ? "Player" : "Scene"),
        text: line.content.slice(offset, offset + MEMORY_LINE_PART),
        heardBy,
      });
    return units;
  });
}

function memoryMessages(session: VenueScene, evidence: MemoryUnit[]): CapabilityLanguageModelMessage[] {
  return [
    {
      role: "system",
      content:
        'Distill one Scene into a SELECTIVE set of short, attributed memories, at most 8 for this evidence chunk. Evidence rows are [lineId, part, role, speaker, text, heardBy]. Keep consequential player actions, promises, relationships, and distinctive details; omit routine dialogue, repeated details, and changes already held in world state. Each memory must cite one or more lineIds heard by that character. Do not share private information with anyone who did not hear it. Return JSON only: {"memories":[{"characterId":"...","text":"...","lineIds":["..."]}],"complete":true}. Complete means you considered ALL supplied evidence, not that every line became a memory. Each text is at most 320 characters. Return "more":true only if the answer cannot hold the selected memories.' +
        "\n" +
        EVENT_MEMORY_GUIDANCE,
    },
    {
      role: "user",
      content: JSON.stringify({
        venue: session.placeName,
        participants: session.participants.map(({ characterId, name }) => ({ characterId, name })),
        evidence: evidence.map((unit) => [unit.lineId, unit.part, unit.role, unit.speaker, unit.text, unit.heardBy]),
      }),
    },
  ];
}

async function distill(session: VenueScene, signal: AbortSignal): Promise<VenueMemory[]> {
  const units = memoryUnits(session);
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("narration"),
  });
  const maxTokens = Math.min(model.maxOutputTokens ?? 2_400, 2_400);
  const saved = session.memoryProgress ?? { nextUnit: 0, entries: [] };
  let cursor = Math.max(0, Math.min(saved.nextUnit, units.length));
  const entries = [...saved.entries];
  const heardByLine = new Map<string, Set<string>>();
  for (const unit of units) heardByLine.set(unit.lineId, new Set(unit.heardBy));

  const fits = (start: number, end: number) => {
    const messages = memoryMessages(session, units.slice(start, end));
    if (messages.reduce((size, item) => size + item.content.length, 0) > MEMORY_INPUT_CEILING) return false;
    const fitted = model.fitContext(messages, { maxTokens });
    // Some providers fit by discarding earlier messages. Evidence must survive verbatim.
    return fitted.maxTokens === maxTokens && JSON.stringify(fitted.messages) === JSON.stringify(messages);
  };

  const process = async (start: number, end: number): Promise<void> => {
    signal.throwIfAborted();
    const messages = memoryMessages(session, units.slice(start, end));
    const completion = await completeWithRoom(model, messages, maxTokens, {
      temperature: 0.2,
      debugMode: false,
      signal: AbortSignal.any([signal, AbortSignal.timeout(90_000)]),
    });
    signal.throwIfAborted();
    const raw = extractJsonObject(completion.content ?? "");
    const saturated = completion.finishReason === "length" || raw?.more === true || raw?.complete !== true;
    if (saturated) {
      if (end - start < 2) {
        await rejectVenueCompletion();
        throw new Error(MEMORY_ERROR);
      }
      const middle = start + Math.floor((end - start) / 2);
      await process(start, middle);
      await process(middle, end);
      return;
    }
    if (!Array.isArray(raw?.memories)) {
      await rejectVenueCompletion();
      throw new Error(MEMORY_ERROR);
    }
    const chunkIds = new Set(units.slice(start, end).map((unit) => unit.lineId));
    const fresh: VenueMemory[] = [];
    for (const value of raw.memories) {
      const record = asRecord(value);
      const characterId = asTrimmedString(record.characterId);
      const text = asTrimmedString(record.text).slice(0, MAX_CHRONICLE_LENGTH);
      const lineIds = Array.isArray(record.lineIds)
        ? [...new Set(record.lineIds.filter((id): id is string => typeof id === "string"))]
        : [];
      if (
        !characterId ||
        !text ||
        !lineIds.length ||
        lineIds.some((id) => !chunkIds.has(id) || !heardByLine.get(id)?.has(characterId))
      ) {
        await rejectVenueCompletion();
        throw new Error(MEMORY_ERROR);
      }
      if (
        !entries.some(
          (entry) => entry.characterId === characterId && entry.text.toLowerCase() === text.toLowerCase(),
        ) &&
        !fresh.some((entry) => entry.characterId === characterId && entry.text.toLowerCase() === text.toLowerCase())
      )
        fresh.push({ characterId, text, lineIds });
    }
    entries.push(...fresh);
    cursor = end;
    await changeSession(session.id, (state) => {
      if (state.memoryPending) throw conflict("This Scene was left with memory pending.");
      state.memoryProgress = { nextUnit: cursor, entries: [...entries] };
    });
  };

  while (cursor < units.length) {
    signal.throwIfAborted();
    let end = cursor + 1;
    if (!fits(cursor, end)) throw new Error(MEMORY_ERROR);
    while (end < units.length && fits(cursor, end + 1)) end += 1;
    await process(cursor, end);
  }
  return entries;
}

export async function endVenueSession(id: string, retryOfAttemptId?: string): Promise<VenueScene> {
  return coordinateVenue(id, "memory-review", "memory", {}, undefined, retryOfAttemptId, () =>
    endVenueSessionCoordinated(id),
  );
}
async function endVenueSessionCoordinated(id: string): Promise<VenueScene> {
  const inFlight = closingTasks.get(id);
  if (inFlight) return inFlight;
  const controller = new AbortController();
  closingControllers.set(id, controller);
  const task = endVenueSessionOnce(id, controller.signal);
  closingTasks.set(id, task);
  try {
    return await task;
  } finally {
    closingTasks.delete(id);
    closingControllers.delete(id);
  }
}

/** Complete or retry a review and return only committed durable memories. */
export async function endVenueSessionWithReceipts(id: string, retryOfAttemptId?: string) {
  const session = await endVenueSession(id, retryOfAttemptId);
  return { session, recordEvents: reviewReceipts(session) };
}

/** Close a visit promptly so its final beat can be read before memory review. */
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
  if (session.memoryMode === "live") return closeLiveScene(session);
  return session.memoryMode === "tiered" || session.relationshipReview
    ? closeTieredVenueSession(session)
    : endVenueSession(id);
}

export async function closeVenueSessionWithReceipts(
  id: string,
  expectedSceneRevision?: number,
  retryOfAttemptId?: string,
) {
  const session = await closeVenueSession(id, expectedSceneRevision, retryOfAttemptId);
  return { session, recordEvents: reviewReceipts(session) };
}

const closingTasks = new Map<string, Promise<VenueScene>>();
const closingControllers = new Map<string, AbortController>();

async function closeLiveScene(session: VenueScene): Promise<VenueScene> {
  const closed = await changeSession(session.id, (state) => {
    state.status = "closed";
    state.endedAt ||= new Date().toISOString();
    state.endReason ||= "player";
    state.memoryPending = false;
    state.memoryReview.status = "complete";
  });
  await clearActivePointer(session.id);
  await pruneVenueVisits();
  return closed;
}

async function closeTieredVenueSession(session: VenueScene): Promise<VenueScene> {
  if (session.status !== "closed") {
    if (isInactive(session)) {
      await interruptInactiveVisit(session.id);
      throw new VillagesRequestError(410, "Interrupted: Inactivity. This Scene ended while you were away.");
    }
    const active = await readActive();
    if (active.sessionId !== session.id) throw conflict("That Scene is not active.");
  }
  const source = sessionRecollections(session);
  const closed = await changeSession(session.id, (state) => {
    state.status = "closed";
    state.endedAt ||= new Date().toISOString();
    state.endReason ||= "player";
    if (!source.length) {
      state.memoryReview = {
        status: "complete",
        attempts: state.memoryReview.attempts,
        error: "",
        nextRecollection: 0,
        decisions: [],
      };
      state.memoryPending = false;
    } else if (state.memoryReview.status !== "complete") {
      state.memoryReview.status = "pending";
      state.memoryPending = true;
    }
  });
  await clearActivePointer(session.id);
  const hasPlayerTurn = closed.lines.some((line) => line.role === "user");
  const hasLeaveSubmission = closed.submissions.some((submission) => submission.mode === "leave");
  if (!hasPlayerTurn && !hasLeaveSubmission) {
    const document = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${session.id}`);
    if (document) await villagesDocuments().remove(VILLAGES_PACKAGE_ID, document.id, document.revision);
  }
  await pruneVenueVisits();
  return closed;
}

async function endTieredVenueSession(session: VenueScene, signal: AbortSignal): Promise<VenueScene> {
  const closed = await closeTieredVenueSession(session);
  if (!closed.memoryPending) return closed;
  const reviewed = await reviewTieredMemories(session.id, signal);
  await pruneVenueVisits();
  return reviewed;
}

async function endVenueSessionOnce(id: string, signal: AbortSignal): Promise<VenueScene> {
  const session = await readSession(id);
  if (session.memoryMode === "live") {
    for (const turn of session.submissions.filter((turn) => turn.processing && unfinishedExchange(turn.processing)))
      await processSavedExchange(id, turn.id);
    return closeLiveScene(await readSession(id));
  }
  if (session.memoryMode === "tiered" || session.relationshipReview) return endTieredVenueSession(session, signal);
  if (session.status === "closed" && !session.memoryPending) {
    await clearActivePointer(id);
    return session;
  }
  if (session.status !== "closed") {
    if (isInactive(session)) {
      await interruptInactiveVisit(id);
      throw new VillagesRequestError(410, "Interrupted: Inactivity. This Scene ended while you were away.");
    }
    const active = await readActive();
    if (active.sessionId !== id) throw conflict("That Scene is not active.");
  }
  const closing = await changeSession(id, (state) => {
    state.status = "closing";
    state.memoryPending = false;
  });
  const hasPlayerTurn = closing.lines.some((line) => line.role === "user");
  const memories =
    closing.memoryMode === "turn"
      ? []
      : (closing.memories ?? (hasPlayerTurn && closing.participants.length > 0 ? await distill(closing, signal) : []));
  signal.throwIfAborted();
  await changeSession(id, (state) => {
    if (state.memoryPending) throw conflict("This Scene was left with memory pending.");
    state.memories = memories;
  });
  signal.throwIfAborted();
  if (memories.length)
    await mutateVillageState((state) => {
      const moment = deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now: new Date() });
      const fresh: VillageChronicleEntry[] = memories
        .map((entry, index): VillageChronicleEntry => ({
          id: `${id}:memory:${index}`,
          dayIndex: moment.dayIndex,
          clock: moment.dayPhase,
          occurredAt: moment.instant,
          timePrecision: "exact",
          scope: "private",
          actors: [
            {
              id: entry.characterId,
              name: session.participants.find((person) => person.characterId === entry.characterId)?.name ?? "",
            },
          ],
          kind: "chat",
          text: entry.text,
          sourceLineIds: entry.lineIds,
        }))
        .filter((entry) => !state.chronicle.some((saved) => saved.id === entry.id));
      state.chronicle = [...fresh, ...state.chronicle];
    });
  const closed = await changeSession(id, (state) => {
    signal.throwIfAborted();
    if (state.memoryPending) throw conflict("This Scene was left with memory pending.");
    state.status = "closed";
    state.memoryPending = false;
    state.endedAt ||= new Date().toISOString();
    state.endReason ||= "player";
  });
  await clearActivePointer(id);
  const hasLeaveSubmission = closing.submissions.some((submission) => submission.mode === "leave");
  if (!hasPlayerTurn && !hasLeaveSubmission) {
    const document = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${id}`);
    if (document) await villagesDocuments().remove(VILLAGES_PACKAGE_ID, document.id, document.revision);
  }
  await pruneVenueVisits();
  return closed;
}

/** Release the player when extraction is unavailable; the exact transcript stays retriable. */
export async function leaveVenueMemoryPending(id: string): Promise<VenueScene> {
  const current = await readSession(id);
  if (hasVenueOperation(id) && current.operation?.kind !== "memory" && current.operation?.kind !== "close")
    throw venueRefusal("SCENE_BUSY", "Wait for the scene reply before leaving with memory pending.");
  await cancelVenueOperation(id);
  return coordinateVenue(id, "leave-pending", "close", {}, undefined, undefined, () => leaveVenueMemoryPendingOnce(id));
}
async function leaveVenueMemoryPendingOnce(id: string): Promise<VenueScene> {
  const session = await readSession(id);
  if (session.memoryMode === "turn") return endVenueSession(id);
  if (session.status !== "closed" && isInactive(session)) {
    await interruptInactiveVisit(id);
    throw new VillagesRequestError(410, "Interrupted: Inactivity. This Scene ended while you were away.");
  }
  if (session.status !== "closed" && (await readActive()).sessionId !== id) throw conflict("That Scene is not active.");
  closingControllers.get(id)?.abort();
  const closed = await changeSession(id, (state) => {
    if (state.status === "closed" && !state.memoryPending) return;
    state.status = "closed";
    state.memoryPending = true;
    state.endedAt ||= new Date().toISOString();
    state.endReason ||= "player";
  });
  await clearActivePointer(id);
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
        : state.memoryMode === "live" && state.activeIds.length === 0
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
  if (!villagesDebugAgentsEnabled()) throw notFound("That debug action is unavailable.");
  await cancelVenueOperation(id);
  const session = await requireLiveVenueSession(id);
  greetingTasks.get(id)?.abort();
  closingControllers.get(id)?.abort();
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

export async function listVenueVisits(filter: { placeId?: string; characterId?: string } = {}): Promise<VenueScene[]> {
  const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, SESSION_KIND);
  return records
    .map((record) => coerceSession(record.data))
    .filter(
      (session) =>
        session.status === "closed" &&
        (!filter.placeId || session.placeId === filter.placeId) &&
        (!filter.characterId || session.participants.some((person) => person.characterId === filter.characterId)),
    )
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function readVenueVisit(id: string): Promise<VenueScene> {
  const session = await readSession(id);
  if (session.status !== "closed") throw notFound("That Scene is not in the archive.");
  return session;
}

/** Replay recent saved speech when a Builder offer was missed during a visit. */
export async function recheckRecentBuilderConversations(projectId: string): Promise<void> {
  const village = await readVillageState();
  const project = village.projects.find((entry) => entry.id === projectId);
  if (!project?.lifecycle) throw notFound("That Project is no longer available.");
  if (project.lifecycle.phase !== "builder") throw conflict("This Project is not seeking a Builder.");
  const worksiteAt = village.venues.find((entry) => entry.id === project.venueId)?.state.updatedAt ?? "";
  const since = Math.max(Date.now() - 7 * 24 * 60 * 60_000, Date.parse(worksiteAt) || 0);
  for (const session of (await listVenueVisits()).slice(0, 20)) {
    for (const submission of session.submissions) {
      if (
        (submission.mode !== "chat" && submission.mode !== "ask") ||
        !submission.at ||
        Date.parse(submission.at) < since ||
        !/\b(?:build|construct|renovate|put up)\b/iu.test(submission.message)
      )
        continue;
      const participants = new Set(session.participants.map((entry) => entry.characterId));
      const lines = session.lines
        .filter(
          (line) =>
            line.at === submission.at &&
            line.role === "assistant" &&
            !line.contactHidden &&
            !line.contactReport &&
            !line.viaDoorway &&
            participants.has(line.speakerId),
        )
        .map(({ id, speakerId, content }) => ({ id, speakerId, content }));
      if (!lines.length) continue;
      const turnStart = session.lines.findIndex((line) => line.at === submission.at && line.role === "user");
      const context = session.lines
        .slice(Math.max(0, turnStart - 8), turnStart < 0 ? 0 : turnStart)
        .filter(
          (line) => !line.contactHidden && !line.contactReport && !line.viaDoorway && participants.has(line.speakerId),
        )
        .map(({ id, speakerId, content }) => ({ id, speakerId, content }));
      await recordProjectConversation({
        projectId,
        submissionId: submission.id,
        venueId: session.placeId,
        playerMessage: submission.message,
        lines,
        context,
        at: submission.at,
      });
    }
  }
}

export async function listVenueVisitSummaries(
  filter: { placeId?: string; characterId?: string; offset?: number; limit?: number } = {},
): Promise<{
  visits: {
    id: string;
    placeId: string;
    placeName: string;
    startedAt: string;
    endedAt: string;
    endReason: VenueScene["endReason"];
    participants: VenueParticipant[];
    lineCount: number;
    memoryUnits: number;
    recollectionCount: number;
    memoryPending: boolean;
    memoryProgress: { nextUnit: number } | null;
    memoryReview: Pick<VenueMemoryReview, "status" | "attempts" | "error" | "nextRecollection">;
  }[];
  total: number;
}> {
  await pruneVenueVisits();
  const visits = await listVenueVisits(filter);
  const offset = Number.isFinite(filter.offset) ? Math.max(0, Math.floor(filter.offset!)) : 0;
  const limit = Number.isFinite(filter.limit) ? Math.min(100, Math.max(1, Math.floor(filter.limit!))) : 20;
  return {
    total: visits.length,
    visits: visits.slice(offset, offset + limit).map((visit) => ({
      id: visit.id,
      placeId: visit.placeId,
      placeName: visit.placeName,
      startedAt: visit.startedAt,
      endedAt: visit.endedAt,
      endReason: visit.endReason,
      participants: visit.participants,
      lineCount: visit.lines.length,
      memoryUnits: memoryUnits(visit).length,
      recollectionCount: sessionRecollections(visit).length,
      memoryPending: visit.memoryPending,
      memoryProgress: visit.memoryProgress ? { nextUnit: visit.memoryProgress.nextUnit } : null,
      memoryReview: {
        status: visit.memoryReview.status,
        attempts: visit.memoryReview.attempts,
        error: visit.memoryReview.error,
        nextRecollection: visit.memoryReview.nextRecollection,
      },
    })),
  };
}

export async function deleteVenueVisit(id: string): Promise<void> {
  const before = await readSession(id);
  if (before.submissions.some((turn) => turn.processing && unfinishedExchange(turn.processing)))
    throw conflict("This Scene has unfinished saved changes. Replay or explicitly resolve them before deletion.");
  for (const turn of pendingProgressTurns(before, (await readVillageState()).foundedAt))
    await processSavedProgressSubmission(id, turn.id);
  const document = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${id}`);
  if (!document || coerceSession(document.data).status !== "closed")
    throw notFound("That Scene is not in the archive.");
  if (!(await villagesDocuments().remove(VILLAGES_PACKAGE_ID, document.id, document.revision)))
    throw conflict("The Scene changed while it was being deleted. Try again.");
}

export async function deleteAllVenueVisits(): Promise<void> {
  const documents = await villagesDocuments().list(VILLAGES_PACKAGE_ID, SESSION_KIND);
  for (const document of documents)
    if (coerceSession(document.data).status === "closed") await deleteVenueVisit(coerceSession(document.data).id);
}

export async function setVenueVisitRetention(value: unknown): Promise<void> {
  const input = asRecord(value);
  const mode = input.mode;
  const count = Number(input.value);
  if (mode !== "forever" && mode !== "count" && mode !== "days") throw badRequest("Choose a Scene retention mode.");
  if (mode === "count" && (!Number.isInteger(count) || count < 1 || count > 1_000))
    throw badRequest("Keep between 1 and 1,000 Scenes.");
  if (mode === "days" && (!Number.isInteger(count) || count < 30 || count > 3_650))
    throw badRequest("Retire Scenes after 30 to 3,650 days.");
  await mutateVillageState((state) => {
    state.visitRetention = mode === "forever" ? { mode, value: 0 } : { mode, value: count };
  });
  await pruneVenueVisits();
}

export async function pruneVenueVisits(): Promise<void> {
  const village = await readVillageState();
  const retention = village.visitRetention;
  if (retention.mode === "forever") return;
  const documents = await villagesDocuments().list(VILLAGES_PACKAGE_ID, SESSION_KIND);
  const eligible = documents
    .map((document) => ({ document, session: coerceSession(document.data) }))
    .filter(
      ({ session }) =>
        session.status === "closed" &&
        !session.memoryPending &&
        !session.submissions.some((turn) => turn.processing && unfinishedExchange(turn.processing)) &&
        (village.progressEngineVersion !== 1 || pendingProgressTurns(session, village.foundedAt).length === 0),
    )
    .sort((a, b) => b.session.startedAt.localeCompare(a.session.startedAt));
  const cutoff = Date.now() - retention.value * 86_400_000;
  const expired =
    retention.mode === "count"
      ? eligible.slice(retention.value)
      : eligible.filter(({ session }) => Date.parse(session.endedAt || session.startedAt) < cutoff);
  for (const { document, session } of expired) {
    if (await villagesDocuments().remove(VILLAGES_PACKAGE_ID, document.id, document.revision))
      await removeInterpretationDiagnostics(session.id);
  }
}

/** Recover completed visit notes written before the chronicle migration, idempotently. */
export async function backfillVenueMemories(): Promise<void> {
  const village = await readVillageState();
  if (village.visitMemoryBackfilled) return;
  const visits = await listVenueVisits();
  const old = visits.filter((visit) => visit.memories?.length);
  if (!old.length) {
    if (village.setupAt || village.foundedAt)
      await mutateVillageState((state) => {
        state.visitMemoryBackfilled = true;
      });
    return;
  }
  await mutateVillageState((state) => {
    if (state.visitMemoryBackfilled) return;
    const known = new Set(state.chronicle.map((entry) => entry.id));
    const fresh: VillageChronicleEntry[] = [];
    for (const visit of old) {
      const moment = deriveVillageMoment({
        foundedAt: state.foundedAt,
        seed: state.seed,
        now: new Date(visit.endedAt || visit.startedAt),
      });
      visit.memories?.forEach((memory, index) => {
        const id = `${visit.id}:memory:${index}`;
        if (known.has(id)) return;
        known.add(id);
        fresh.push({
          id,
          dayIndex: moment.dayIndex,
          clock: moment.dayPhase,
          occurredAt: visit.endedAt || visit.startedAt,
          timePrecision: "exact",
          scope: "private",
          actors: [
            {
              id: memory.characterId,
              name: visit.participants.find((person) => person.characterId === memory.characterId)?.name ?? "",
            },
          ],
          kind: "chat",
          text: memory.text,
          sourceLineIds: memory.lineIds,
        });
      });
    }
    state.chronicle = [...fresh, ...state.chronicle];
    state.visitMemoryBackfilled = true;
  });
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
        () => (operation.kind === "memory" ? endVenueSessionCoordinated(id) : closeVenueSessionOnce(id)),
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

async function processLegacyProjectTurn(session: VenueScene, submission: VenueSubmission) {
  if (submission.mode !== "chat" && submission.mode !== "ask" && submission.mode !== "contact") return;
  await venueCheckpoint("legacy-project", async () => {
    if (submission.projectInterpretationVersion === 1) {
      await applyLegacyProjectInterpretation(session.id, submission.id);
      return true;
    }
    await recordProjectConversation({
      submissionId: submission.id,
      venueId: session.placeId,
      playerMessage: submission.message,
      lines: session.lines
        .filter(
          (line) =>
            submission.replyLineIds?.includes(line.id) &&
            !!line.speakerId &&
            !line.contactHidden &&
            !line.contactReport &&
            !line.viaDoorway,
        )
        .map((line) => ({ id: line.id, speakerId: line.speakerId, content: line.content })),
      context: session.lines
        .slice(
          0,
          session.lines.findIndex((line) => submission.replyLineIds?.includes(line.id)) +
            (submission.replyLineIds?.length ?? 0),
        )
        .slice(-12)
        .filter((line) => !!line.speakerId && !line.contactHidden && !line.contactReport && !line.viaDoorway)
        .map((line) => ({ id: line.id, speakerId: line.speakerId, content: line.content })),
      at: submission.at ?? new Date().toISOString(),
    });
    return true;
  });
}
