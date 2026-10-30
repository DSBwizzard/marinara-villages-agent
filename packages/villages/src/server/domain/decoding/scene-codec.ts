import { isSceneTurnOutcome, type SceneTurnOutcome } from "../../../shared/contracts/scene-turn-outcome.js";
import { readStagingCues } from "../../../shared/helpers/scene-staging.js";
import type { LiveExchangeProposals } from "../models/memory-model.js";
import type { VenueOperation } from "../models/operation-model.js";
import type {
  ActiveVenue,
  SavedAccessEvent,
  VenueLine,
  VenueRecordEvent,
  VenueScene,
  VenueSubmission,
} from "../models/scene-model.js";
import type { VenueActionResult } from "../models/venue-action-model.js";
import type { WishProposal } from "../models/wish-check-model.js";
import { asRecord, asString, asTrimmedString } from "../rules/coerce.js";
import { conflict } from "../rules/errors.js";
import { readOpeningSignal } from "../rules/opening-project.js";
import { coerceProjectSpeech } from "../rules/project-interpretation.js";
import { immutableRelationshipState } from "../rules/relationship-rules.js";
import { coercePendingAttention } from "../rules/scene-attention.js";
import { sceneContinuityFields, type SceneContinuity } from "../rules/scene-continuity.js";
import { readSceneLayout } from "../rules/scene-layout.js";
import { sceneRevision } from "../rules/scene-revision.js";
import { reuseSceneLine } from "../rules/scene-transcript.js";
import { readWishAuthority } from "../rules/social-wishes.js";
import { reuseSceneSubmission } from "../rules/scene-submissions.js";
import type { ContactIntent, DoorwayContact } from "../rules/venue-contact.js";
import type { VenueSceneChange } from "../rules/venue-scene-state.js";
import { coerceExchangeProcessing } from "./exchange-codec.js";
import { savedVenueClassRecord } from "./venue-class-compat.js";
import { coerceVillageState } from "./village-codec.js";

export function coerceActive(value: unknown): ActiveVenue {
  const raw = asRecord(value);
  return { sessionId: asTrimmedString(raw.sessionId), placeId: asTrimmedString(raw.placeId) };
}
function readSceneContinuity(value: unknown): SceneContinuity | undefined {
  if (value === undefined) return undefined;
  const raw = asRecord(value),
    facts = asRecord(raw.facts);
  if (Object.hasOwn(raw, "relationshipHead")) throw conflict("Frozen Scene history requires explicit hydration.");
  if (
    raw.version !== 3 ||
    typeof raw.seed !== "string" ||
    facts.seed !== raw.seed ||
    typeof raw.capturedAt !== "string" ||
    !Number.isFinite(Date.parse(raw.capturedAt)) ||
    !Array.isArray(raw.receiptIds) ||
    raw.receiptIds.some((id) => typeof id !== "string") ||
    ["villagers", "venues", "residences", "venueEvents", "projects"].some((key) => !Array.isArray(facts[key]))
  )
    throw conflict("This saved Scene has an unsupported or invalid captured context. Its history is preserved.");
  // This is an already-captured projection, not an old world to migrate.
  const decoded = coerceVillageState({
    ...facts,
    version: 10,
    memories: { format: 1, revision: 0, records: [] },
    memoryScenes: {},
  });
  if (facts.relationshipContext)
    decoded.relationshipContext = immutableRelationshipState(raw.seed, facts.relationshipContext);
  const captured = Object.fromEntries(
    sceneContinuityFields.map((key) => [key, decoded[key]]),
  ) as SceneContinuity["facts"];
  return {
    version: 3,
    seed: raw.seed,
    setupAt: asString(raw.setupAt),
    capturedAt: raw.capturedAt,
    receiptIds: [...raw.receiptIds] as string[],
    facts: captured,
  };
}

export function coerceSession(value: unknown): VenueScene {
  const raw = savedVenueClassRecord(value);
  if (
    Object.hasOwn(raw, "storageFormat") ||
    Object.hasOwn(raw, "transcript") ||
    Object.hasOwn(raw, "submissionHistory")
  )
    throw conflict("Stored Scene history requires explicit hydration.");
  if (raw.version !== 3) throw conflict("Unsupported Scene format. Its saved data is preserved.");
  if (
    raw.spinoff &&
    (typeof raw.spinoff !== "object" ||
      !["prepared", "running", "returned", "resolved"].includes(String(asRecord(raw.spinoff).status)) ||
      !asRecord(raw.spinoff).id ||
      !asRecord(raw.spinoff).sessionId)
  )
    throw conflict("The saved spinoff is malformed. Its ownership must be recovered before continuing.");
  if (raw.memoryMode && raw.memoryMode !== "live" && raw.status !== "closed")
    throw conflict("This Scene uses a retired memory format and cannot continue.");
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
          const canonical = reuseSceneLine(value, participantIds);
          if (canonical) return canonical;
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
            ...(Array.isArray(row.physicalIdsAfter)
              ? {
                  physicalIdsAfter: [
                    ...new Set(
                      row.physicalIdsAfter.filter(
                        (id): id is string => typeof id === "string" && participantIds.has(id),
                      ),
                    ),
                  ],
                }
              : {}),
            ...(row.remoteDelivery === "loud"
              ? { remoteDelivery: row.remoteDelivery as VenueLine["remoteDelivery"] }
              : {}),
            ...(row.contactHidden === true ? { contactHidden: true } : {}),
            ...(row.attentionEvidence === true ? { attentionEvidence: true } : {}),
            ...(asRecord(row.speechSource).version === 3 && Array.isArray(asRecord(row.speechSource).spans)
              ? { speechSource: structuredClone(row.speechSource) as VenueLine["speechSource"] }
              : {}),
            ...(typeof asRecord(row.soundOnly).text === "string" && Array.isArray(asRecord(row.soundOnly).characterIds)
              ? {
                  soundOnly: {
                    text: asTrimmedString(asRecord(row.soundOnly).text).slice(0, 300),
                    characterIds: (asRecord(row.soundOnly).characterIds as unknown[]).filter(
                      (id): id is string => typeof id === "string",
                    ),
                    player: asRecord(row.soundOnly).player === true,
                  },
                }
              : {}),
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
            ...(row.delivery === "ordinary" || row.delivery === "whisper" || row.delivery === "shout"
              ? { delivery: row.delivery as VenueLine["delivery"] }
              : {}),
            ...(row.presentation === "main" || row.presentation === "aside"
              ? { presentation: row.presentation as VenueLine["presentation"] }
              : {}),
            ...(typeof row.asideFor === "string" ? { asideFor: row.asideFor } : {}),
          };
        })
        .filter((line) => line.id && line.content)
    : [];
  return {
    version: 3,
    ...(raw.spinoff ? { spinoff: structuredClone(raw.spinoff) as VenueScene["spinoff"] } : {}),
    changeSequence: Math.max(0, Math.floor(Number(raw.changeSequence) || 0)),
    ...(raw.semanticVersion === 2 ? { semanticVersion: 2 as const } : {}),
    ...(raw.processingVersion === 1 ? { processingVersion: 1 as const } : {}),
    ...(raw.villageSeed ? { villageSeed: asString(raw.villageSeed) } : {}),
    sceneRevision: sceneRevision(raw),
    operation: raw.operation as VenueOperation | undefined,
    rejectedSubmissions: Array.isArray(raw.rejectedSubmissions)
      ? raw.rejectedSubmissions
          .map(asRecord)
          .filter(
            (row) =>
              typeof row.id === "string" &&
              row.id.length > 0 &&
              typeof row.inputHash === "string" &&
              /^[a-f0-9]{64}$/u.test(row.inputHash) &&
              Number.isSafeInteger(row.sceneRevision) &&
              Number(row.sceneRevision) >= 0 &&
              isSceneTurnOutcome(row.turnOutcome),
          )
          .map((row) => ({
            id: String(row.id),
            inputHash: String(row.inputHash),
            sceneRevision: Number(row.sceneRevision),
            turnOutcome: row.turnOutcome as SceneTurnOutcome,
          }))
      : [],
    navigationReceipts: Array.isArray(raw.navigationReceipts)
      ? raw.navigationReceipts
          .map(asRecord)
          .filter(
            (row) =>
              typeof row.id === "string" &&
              typeof row.originZoneId === "string" &&
              typeof row.destinationZoneId === "string" &&
              typeof row.at === "string",
          )
          .map((row) => ({
            id: String(row.id),
            originZoneId: String(row.originZoneId),
            destinationZoneId: String(row.destinationZoneId),
            at: String(row.at),
          }))
      : [],
    generationReceipts: Array.isArray(raw.generationReceipts)
      ? (raw.generationReceipts as VenueScene["generationReceipts"])
      : [],
    openingGatheringId: asTrimmedString(raw.openingGatheringId) || undefined,
    openingReader: raw.openingReader === true ? true : undefined,
    openingIntroductionResidentId: asTrimmedString(raw.openingIntroductionResidentId) || undefined,
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
    pendingAccessClaim: asTrimmedString(raw.pendingAccessClaim) || undefined,
    accessPreviousZones: Object.fromEntries(
      Object.entries(asRecord(raw.accessPreviousZones)).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ),
    doorwayContacts: Array.isArray(raw.doorwayContacts) ? (raw.doorwayContacts as DoorwayContact[]) : [],
    pendingAttention: coercePendingAttention(raw.pendingAttention),
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
    ...(raw.departureDestinations
      ? {
          departureDestinations: Object.fromEntries(
            Object.entries(asRecord(raw.departureDestinations)).flatMap(([actor, value]) => {
              const row = asRecord(value);
              return actor &&
                typeof row.venueId === "string" &&
                row.venueId &&
                typeof row.zoneId === "string" &&
                row.zoneId
                ? [[actor, { venueId: row.venueId, zoneId: row.zoneId }]]
                : [];
            }),
          ),
        }
      : {}),
    departedIds: Array.isArray(raw.departedIds)
      ? raw.departedIds.filter((id): id is string => typeof id === "string")
      : [],
    spaceClass:
      raw.spaceClass === "residence" ||
      raw.spaceClass === "workplace" ||
      raw.spaceClass === "community" ||
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
    ...(raw.continuity !== undefined ? { continuity: readSceneContinuity(raw.continuity) } : {}),
    endedAt: asString(raw.endedAt),
    lastActivityAt: asString(raw.lastActivityAt) || asString(raw.startedAt),
    clockShiftMs: typeof raw.clockShiftMs === "number" && Number.isFinite(raw.clockShiftMs) ? raw.clockShiftMs : 0,
    endReason:
      raw.endReason === "player" ||
      raw.endReason === "scene" ||
      raw.endReason === "inactivity" ||
      raw.endReason === "debug"
        ? raw.endReason
        : "",
    ...(raw.stagingVersion === 1 ? { stagingVersion: 1 as const } : {}),
    memoryMode: "live",
    status: raw.status === "opening" || raw.status === "closing" || raw.status === "closed" ? raw.status : "active",
    participants,
    ...(raw.sceneAttendance && typeof raw.sceneAttendance === "object"
      ? {
          sceneAttendance: {
            ...(asRecord(raw.sceneAttendance).layout === undefined
              ? {}
              : { layout: readSceneLayout(asRecord(raw.sceneAttendance).layout) }),
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
                    },
                  ]
                : [];
            }),
          },
        }
      : {}),
    activeIds: Array.isArray(raw.activeIds) ? raw.activeIds.filter((id): id is string => typeof id === "string") : [],
    lines,
    submissions: Array.isArray(raw.submissions)
      ? raw.submissions
          .map((value) => {
            const shared = reuseSceneSubmission(value, participantIds);
            if (shared) return shared;
            const row = asRecord(value);
            return {
              id: asTrimmedString(row.id),
              ...(row.zoneEventsVersion === 1 ? { zoneEventsVersion: 1 as const } : {}),
              ...(Array.isArray(row.wishProposals) ? { wishProposals: row.wishProposals as WishProposal[] } : {}),
              ...(row.wishAuthority !== undefined ? { wishAuthority: readWishAuthority(row.wishAuthority) } : {}),
              ...(typeof row.wishProposalError === "string" ? { wishProposalError: row.wishProposalError } : {}),
              ...(coerceExchangeProcessing(row.processing)
                ? { processing: coerceExchangeProcessing(row.processing) }
                : {}),
              message: asString(row.message),
              ...(row.physicalOutcomeVersion === 1 ? { physicalOutcomeVersion: 1 as const } : {}),
              ...(row.narrativeSource
                ? { narrativeSource: structuredClone(row.narrativeSource) as VenueSubmission["narrativeSource"] }
                : {}),
              ...(row.requestMode === "act" || row.requestMode === "fulfill"
                ? { requestMode: row.requestMode as "act" | "fulfill" }
                : {}),
              ...(row.movement ? { movement: row.movement as VenueSubmission["movement"] } : {}),
              ...(row.semanticConclude === true ? { semanticConclude: true } : {}),
              ...(Array.isArray(row.semanticPlayerMoves)
                ? { semanticPlayerMoves: row.semanticPlayerMoves as VenueSubmission["semanticPlayerMoves"] }
                : {}),
              ...(row.physicalContext
                ? { physicalContext: row.physicalContext as VenueSubmission["physicalContext"] }
                : {}),
              ...(row.contact ? { contact: row.contact as ContactIntent } : {}),
              ...(row.attention ? { attention: row.attention as VenueSubmission["attention"] } : {}),
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
              openingProcessedAt: asTrimmedString(row.openingProcessedAt) || undefined,
              openingContext: row.openingContext
                ? {
                    stage: asTrimmedString(asRecord(row.openingContext).stage),
                    projectId: asTrimmedString(asRecord(row.openingContext).projectId),
                    ...(asRecord(row.openingContext).gatheringComplete === true
                      ? { gatheringComplete: true as const }
                      : {}),
                    ...(Object.hasOwn(asRecord(row.openingContext), "proposalFingerprint")
                      ? { proposalFingerprint: asTrimmedString(asRecord(row.openingContext).proposalFingerprint) }
                      : {}),
                  }
                : undefined,
              openingSignal: readOpeningSignal(row.openingSignal),
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
              ...(asRecord(row.speechCapture).version === 3 &&
              ["captured", "silent"].includes(String(asRecord(row.speechCapture).status))
                ? { speechCapture: structuredClone(row.speechCapture) as VenueSubmission["speechCapture"] }
                : {}),
              ...(row.effectFailures && typeof row.effectFailures === "object"
                ? { effectFailures: structuredClone(row.effectFailures) as VenueSubmission["effectFailures"] }
                : {}),
              ...(row.projectInterpretationVersion === 1 ? { projectInterpretationVersion: 1 as const } : {}),
              ...(Object.hasOwn(row, "wishInterpretationProof") ? {} : {}),
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
              ...(row.placeUpdate ? { placeUpdate: row.placeUpdate as VenueSceneChange } : {}),
              ...(row.residenceSignal
                ? { residenceSignal: row.residenceSignal as VenueSubmission["residenceSignal"] }
                : {}),
              ...(row.venueRequestSignal
                ? { venueRequestSignal: row.venueRequestSignal as VenueSubmission["venueRequestSignal"] }
                : {}),
              ...(row.invitationSignal
                ? { invitationSignal: row.invitationSignal as VenueSubmission["invitationSignal"] }
                : {}),
              ...(Array.isArray(row.accessEvents)
                ? { accessEvents: structuredClone(row.accessEvents).slice(0, 64) as SavedAccessEvent[] }
                : {}),
              ...(row.semanticReady === true ? { semanticReady: true } : {}),
              ...(Array.isArray(row.semanticContinuedDomains)
                ? {
                    semanticContinuedDomains:
                      row.semanticContinuedDomains as VenueSubmission["semanticContinuedDomains"],
                  }
                : {}),
              ...(asRecord(row.residentActionReceipt).version === 1
                ? {
                    residentActionReceipt: structuredClone(
                      row.residentActionReceipt,
                    ) as VenueSubmission["residentActionReceipt"],
                  }
                : {}),
              ...(asRecord(row.semanticProvenance).version === 2
                ? {
                    semanticProvenance: structuredClone(
                      row.semanticProvenance,
                    ) as import("../models/semantic-model.js").SemanticProvenance,
                  }
                : {}),
              ...(asRecord(row.liveProposals).version === 1
                ? { liveProposals: structuredClone(row.liveProposals) as LiveExchangeProposals }
                : {}),
              changeSequence: Math.max(0, Math.floor(Number(row.changeSequence) || 0)),
              ...(Array.isArray(row.wishContexts)
                ? { wishContexts: row.wishContexts as VenueSubmission["wishContexts"] }
                : {}),
              ...(row.timing && typeof row.timing === "object"
                ? { timing: row.timing as VenueSubmission["timing"] }
                : {}),
              ...(Array.isArray(row.requestMetrics)
                ? { requestMetrics: row.requestMetrics as VenueSubmission["requestMetrics"] }
                : {}),
              ...(Array.isArray(row.interpretationHistory)
                ? { interpretationHistory: row.interpretationHistory as VenueSubmission["interpretationHistory"] }
                : {}),
              ...(Array.isArray(row.recordEvents) ? { recordEvents: row.recordEvents as VenueRecordEvent[] } : {}),
              ...(typeof row.at === "string" ? { at: row.at } : {}),
            };
          })
          .filter((entry) => entry.id)
      : [],
    recap: asString(raw.recap).slice(0, 600),
  };
}
