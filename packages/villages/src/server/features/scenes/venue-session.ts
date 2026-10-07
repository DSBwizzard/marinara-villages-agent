import {
  interpretRoomDraft,
  generate,
  generateContactResponse,
  explicitSceneActions,
  VENUE_REPLY_MAX_TOKENS,
  type SceneReply,
} from "./writing.js";
import { readSceneChanges } from "./changes.js";
import { processSavedExchange } from "./progress.js";
import { activeVenueSession, requireLiveVenueSession, refreshZoneParticipants } from "./live-session.js";

import { pruneVenueVisits } from "./archive.js";
import { decideVillageResidence, proposeVillageResidence } from "../venues/residences.js";
import { activationScope } from "../../adapters/engine/activation-scope.js";
import { sceneWork } from "./scene-work.js";

import {
  VILLAGES_PACKAGE_ID,
  villagesDebugAgentsEnabled,
  villagesDocuments,
  villagesLogger,
} from "../../adapters/engine/runtime-host.js";
import { villagesLanguageModels } from "../../adapters/models/language-models.js";

import { runtimeDebug } from "../../adapters/observability/runtime-debug.js";
import {
  assertVenueOwnership,
  outsideVenueOperation,
  venueOperationId,
  venueOperationSignal,
  venueOperationSnapshot,
  venueRefusal,
  venueRequestMetrics,
} from "../../adapters/operations/operation-context.js";
import { mutateDocument } from "../../adapters/storage/document-store.js";
import { changeSession, clearActivePointer, readActive, readSession } from "../../adapters/storage/scene-store.js";
import { ACTIVE_ID, SESSION_PREFIX, activeSlot, sessionSlot } from "../../adapters/storage/scene-slots.js";
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
import type { VillageState, VillageVenue, VillageVenueClass } from "../../domain/models/world.js";

import { asRecord } from "../../domain/rules/coerce.js";
import {
  badGateway,
  badRequest,
  conflict,
  notFound,
  safeFailureMessage,
  VillagesRequestError,
} from "../../domain/rules/errors.js";
import { extractJsonObject } from "../../domain/rules/json-reply.js";

import { projectSpeechContexts } from "../../domain/rules/project-interpretation.js";
import { prependHappenings } from "../../domain/rules/prompt-preset.js";
import { relationshipZoneController } from "../../domain/rules/relationship-rules.js";
import { responseDiagnostics } from "../../domain/rules/response-diagnostics.js";
import { captureSceneAttendance, sceneZoneOccupants } from "../../domain/rules/scene-attendance.js";
import { isInactive } from "../../domain/rules/scene-inactivity.js";
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
import { movementTransition, readPlayerMovement } from "../../domain/rules/venue-movement.js";

import {
  applyVenueSceneChange,
  physicalVenueEvents,
  readVenueSceneChange,
} from "../../domain/rules/venue-scene-state.js";

import { venueCardProfile } from "../../domain/rules/venue-writing.js";
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
import { knownWish, setWishJournalStatus, wishConditionRevision } from "../../domain/rules/wish-journal.js";
import { metadataFailure, completionFailure as typedCompletionFailure } from "../../domain/rules/work-failure.js";
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
import { finalizeProjectDiagnostics, interpretProjectDraft, projectProposals } from "../projects/project-checks.js";

import { rollActiveAgendas } from "../residents/agenda-roll.js";
import {
  bindLiveProposals,
  LIVE_MEMORY_INSTRUCTION,
  liveEvidence,
  memoryVersion,
  mergeLiveReplyProposals,
} from "../../domain/rules/live-exchange.js";
import { filterRelationshipNotices, relationshipChangeNotices } from "../../domain/rules/relationship-presentation.js";
import { matchingWishReceipts, wishFingerprint, wishReceiptRecords } from "../residents/wishes/wish-interpretation.js";
import { fulfillResidentWish } from "../residents/wishes/wish-lifecycle.js";
import { bindWishProposals, WISH_PROPOSAL_INSTRUCTION } from "../residents/wishes/wish-progress.js";
import { villagesConnectionIdFor } from "../settings/connections.js";
import { recordVillagerVenueImprovement } from "../venues/venue-mailbox.js";
import { mutateVillageState, readVillageSnapshot, readVillageState } from "../world/village-store.js";
import { queueVillageVenueRequest } from "../venues/venue-requests.js";
import { applyResidenceEditApproval } from "../venues/zone-edits.js";

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
  return (turn.requestMode ?? turn.mode) === mode;
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
    interactionScopeVersion: 1,
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
  // Act and Fulfill aliases use the current Chat interpretation.
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
  await rollActiveAgendas(new Date());
  const village = await readVillageState();
  const verdict: VenueSubmission["verdict"] = null;
  const wishId = "",
    wishMemory = "";
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
          null,
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

/** Transitional same-feature effects supplied only by entry while turn coordination is separated. */
export function sceneReplayEffects() {
  return { applySavedAccessEvents, recordSpokenInvitation, applyVenueTurnChange, receiptForTurn };
}
