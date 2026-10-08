import { readStagingCues } from "../../../shared/helpers/scene-staging.js";
import type { LiveExchangeProposals } from "../models/memory-model.js";
import type { VenueOperation } from "../models/operation-model.js";
import type {
  ActiveVenue,
  SavedAccessEvent,
  VenueLine,
  VenueMemory,
  VenueRecollection,
  VenueRecordEvent,
  VenueScene,
  VenueSubmission,
} from "../models/scene-model.js";
import type { VenueActionResult } from "../models/venue-action-model.js";
import type { WishProposal } from "../models/wish-check-model.js";
import { asRecord, asString, asTrimmedString } from "../rules/coerce.js";
import { conflict } from "../rules/errors.js";
import { coerceProjectSpeech } from "../rules/project-interpretation.js";
import { MAX_CHRONICLE_LENGTH } from "../rules/prompt-preset.js";
import { sceneRevision } from "../rules/scene-revision.js";
import type { ContactIntent, DoorwayContact } from "../rules/venue-contact.js";
import type { VenueSceneChange } from "../rules/venue-scene-state.js";
import { coerceExchangeProcessing } from "./exchange-codec.js";
import { coerceWishApplicationProof } from "./wish-criteria.js";

export function coerceActive(value: unknown): ActiveVenue {
  const raw = asRecord(value);
  return { sessionId: asTrimmedString(raw.sessionId), placeId: asTrimmedString(raw.placeId) };
}
export function coerceVenueRecollection(value: unknown): VenueRecollection | null {
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
export function coerceSession(value: unknown): VenueScene {
  const raw = asRecord(value);
  if (raw.memoryMode && raw.memoryMode !== "live" && raw.status !== "closed")
    throw conflict("This Scene uses a retired memory format; its transcript must be archived before continuing.");
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
              ? { remoteDelivery: row.remoteDelivery as VenueLine["remoteDelivery"] }
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
    pendingAccessClaim: asTrimmedString(raw.pendingAccessClaim) || undefined,
    accessPreviousZones: Object.fromEntries(
      Object.entries(asRecord(raw.accessPreviousZones)).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ),
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
    memoryMode: "live",
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
              ...(row.physicalOutcomeVersion === 1 ? { physicalOutcomeVersion: 1 as const } : {}),
              ...(row.requestMode === "act" || row.requestMode === "fulfill"
                ? { requestMode: row.requestMode as "act" | "fulfill" }
                : {}),
              ...(row.movement ? { movement: row.movement as VenueSubmission["movement"] } : {}),
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
              ...(Array.isArray(row.accessEvents)
                ? { accessEvents: structuredClone(row.accessEvents).slice(0, 64) as SavedAccessEvent[] }
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
    recap: asString(raw.recap).slice(0, 600),
  };
}
