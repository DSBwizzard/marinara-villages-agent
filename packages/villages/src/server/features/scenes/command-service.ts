import { memoryHash } from "../../domain/rules/memory-integrity.js";
import { dueAppointment } from "../../domain/rules/agenda-overview.js";
import { recordCompletedActivity } from "../../domain/rules/activity-followup.js";
import { appendSceneInput } from "../../domain/rules/scene-input.js";
import { WorkFailureError } from "../../domain/rules/work-failure.js";
import { captureZoneObservation } from "../../domain/rules/zone-observation.js";
import { observableRoomDescription } from "../../domain/rules/zone-picture.js";
import { findLocation } from "../../domain/rules/places.js";
import { randomUUID } from "node:crypto";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import { SESSION_PREFIX, sessionSlot } from "../../adapters/storage/scene-slots.js";
import { createSceneHistory } from "../../adapters/storage/scene-history.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { GreetingTrace, VenueScene } from "../../domain/models/scene-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { badRequest, conflict, notFound, VillagesRequestError } from "../../domain/rules/errors.js";
import { startingHistoryReady } from "../../domain/rules/starting-history.js";
import { completeOpeningGathering, matchesOpeningGathering } from "../../domain/rules/opening-project.js";
import { captureSceneAttendance, sceneZoneOccupants } from "../../domain/rules/scene-attendance.js";
import { movedAttentionContacts } from "../../domain/rules/scene-attention.js";
import { sceneContinuityView, cloneSceneFacts } from "../../domain/rules/scene-continuity.js";
import { recordClosedRelationshipScene } from "../../domain/rules/continuity-library.js";
import { requireSceneZoneId, sceneLayoutVenue } from "../../domain/rules/scene-layout.js";
import { assertCurrentSceneGeneration } from "../../domain/rules/scene-writing-contract.js";
import { claimVisitPermission, evaluateZoneAccess } from "../../domain/rules/venue-access.js";
import {
  contactCanEnter,
  contactNeighbors,
  contactPath,
  contactPosition,
  sceneAccessContext,
  sceneMoveAccompanying,
  type ContactIntent,
} from "../../domain/rules/venue-contact.js";
import { venueClasses } from "../../domain/rules/venue-model.js";
import { defaultVenueZoneId, resolveVenueZone, zoneArea, zoneClosed } from "../../domain/rules/venue-zones.js";
import { metadataFailure } from "../../domain/rules/work-failure.js";
import { narrationBlocker } from "../../domain/rules/scene-submissions.js";
import { sceneTurnNotices } from "../../domain/rules/scene-public.js";
import { visibleSceneNotices } from "../../domain/rules/narration-notices.js";
import { zoneEventScene } from "../../domain/rules/zone-events.js";
export interface SceneCommandPorts {
  generate: typeof import("./writing.js").generate;
  processSavedExchange: typeof import("./progress.js").processSavedExchange;
  abandonSavedExchange: typeof import("./progress.js").abandonSavedExchange;
  activeVenueSession: typeof import("./live-session.js").activeVenueSession;
  requireLiveVenueSession: typeof import("./live-session.js").requireLiveVenueSession;
  refreshZoneParticipants: typeof import("./live-session.js").refreshZoneParticipants;
  activationScope():
    | Pick<NonNullable<ReturnType<typeof import("../../adapters/engine/activation-scope.js").activationScope>>, "run">
    | undefined;
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
  readTerminal: ReturnType<typeof import("./scene-terminal.js").createSceneTerminalStore>["read"];
  withSceneWork<T>(id: string, work: () => Promise<T>): Promise<T>;
  cancelVenueOperation: typeof import("../../jobs/venue-coordinator.js").cancelVenueOperation;
  coordinateVenue: typeof import("../../jobs/venue-coordinator.js").coordinateVenue;
  hasVenueOperation: typeof import("../../jobs/venue-coordinator.js").hasVenueOperation;
  recoverVenueOperations: typeof import("../../jobs/venue-coordinator.js").recoverVenueOperations;
  rollActiveAgendas: typeof import("../residents/resident-agendas.js").rollActiveAgendas;
  mutateVillageState: typeof import("../world/village-store.js").mutateVillageState;
  readVillageState: typeof import("../world/village-store.js").readVillageState;
}
/** Inert Scene command orchestration; callbacks retain originating feature connections. */
export function createSceneCommands({
  generate,
  processSavedExchange,
  abandonSavedExchange,
  activeVenueSession,
  requireLiveVenueSession,
  refreshZoneParticipants,
  activationScope,
  sceneWork,
  villagesDebugAgentsEnabled,
  villagesDocuments,
  villagesLogger,
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
  readTerminal,
  withSceneWork,
  cancelVenueOperation,
  coordinateVenue,
  hasVenueOperation,
  recoverVenueOperations,
  rollActiveAgendas,
  mutateVillageState: mutateVillageStateWithoutPlaces,
  readVillageState: readVillageStateWithoutPlaces,
}: SceneCommandPorts) {
  const readVillageState: typeof readVillageStateWithoutPlaces = (options) =>
    readVillageStateWithoutPlaces({ ...options, memories: true });
  const mutateVillageState: typeof mutateVillageStateWithoutPlaces = (change, options) =>
    mutateVillageStateWithoutPlaces(change, { ...options, memories: true });
  async function visibleNoticeEvents(scene: VenueScene, events: ReturnType<typeof sceneTurnNotices>) {
    if (!events.length) return events;
    const state = await readVillageStateWithoutPlaces(
      events.some((event) => event.kind === "wish") ? { memories: true } : {},
    );
    return state.seed === scene.villageSeed ? visibleSceneNotices(state, events) : [];
  }
  const requestFingerprint = (input: Pick<VenueTurnInput, "mode" | "targetId" | "message" | "contact">) =>
    memoryHash([input.mode, input.targetId, input.contact ?? null, input.message]);
  async function publishNarration(
    scene: VenueScene,
    input: VenueTurnInput,
    mode: "greet" | "chat" | "leave",
    signal?: AbortSignal,
    trace?: GreetingTrace,
  ) {
    const prior = scene.submissions.find((turn) => turn.id === input.submissionId);
    if (prior) {
      if (prior.acceptance.status === "abandoned")
        throw conflict("That saved request was abandoned. Send a new message.");
      if (prior.requestFingerprint !== requestFingerprint(input))
        throw conflict("This submission ID belongs to different input.");
    } else {
      const generated = await generate(scene, input.message, mode, signal, trace);
      assertVenueOwnership();
      signal?.throwIfAborted();
      await changeSession(scene.id, (saved) => {
        assertVenueOwnership(saved);
        signal?.throwIfAborted();
        const existing = saved.submissions.find((turn) => turn.id === input.submissionId);
        if (existing) {
          if (existing.requestFingerprint !== requestFingerprint(input))
            throw conflict("This submission ID belongs to different input.");
          return;
        }
        if (saved.sceneRevision !== generated.readset.sceneRevision)
          throw conflict("This Scene changed; the purchased response is retained.");
        saved.submissions.push({
          id: input.submissionId,
          message: input.message,
          mode: input.mode,
          targetId: input.targetId,
          requestFingerprint: requestFingerprint(input),
          at: generated.readset.capturedAt,
          acceptance: { status: "pending", rejected: [] },
          narration: { raw: generated.raw, readset: generated.readset, responseDigest: generated.responseDigest },
          lore: generated.lore,
          responseDiagnostics: generated.responseDiagnostics,
          requestMetrics: venueRequestMetrics(),
          timing: saved.operation?.timing,
          zoneIdAtTurn: generated.readset.source.scene.zoneId,
          activeIdsAtTurn: [...generated.readset.source.scene.activeIds],
        });
        appendSceneInput(saved, saved.submissions.at(-1)!);
      });
    }
    await processSavedExchange(scene.id, input.submissionId);
    const published = await readSession(scene.id),
      turn = published.submissions.find((turn) => turn.id === input.submissionId)!;
    if (turn.acceptance.status !== "applied")
      throw new WorkFailureError(metadataFailure("The saved narration needs recovery."));
    return published;
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
      if (saved.operation?.id !== operationId || saved.operation.status === "complete") {
        if (saved.status === "closed" || (await readActive()).sessionId !== sessionId)
          throw conflict("That Scene is not active.");
        if ((await readVillageState()).seed !== saved.villageSeed)
          throw conflict("That Village changed. Its saved Scene is preserved.");
        return saved;
      }
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
      await markZoneSeen(session);
      return refreshZoneParticipants(session, true);
    }
    const blocker = narrationBlocker(session);
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
    const accompanying = sceneMoveAccompanying(session, venue, zone, village),
      accessAt = sceneAccessContext(session, undefined, village.timeZone).at;
    if (
      !contactPath(
        village,
        venue,
        requireSceneZoneId(session),
        zone.id,
        "player",
        {
          ...session,
          accompanying,
        },
        accessAt,
      )
    )
      throw conflict(
        "There is no permitted connection route to that space; its controller may need to grant an invitation.",
      );
    const people = sceneZoneOccupants({ ...session, accompanying }, venue, zone.id);
    if (people.filter((person) => !person.characterId.startsWith("npc:")).length > 4)
      throw conflict("Five residents occupy this Zone in the Scene. Choose another Zone.");
    const decision = evaluateZoneAccess(venue, zone, "player", {
      ...sceneAccessContext({ ...session, accompanying }, accessAt),
      accepting: true,
      unavailable: zoneClosed(village, venue, zone),
      environment: village.narrative,
    });
    if (!decision.allowed) throw conflict(decision.explanation);
    await mutateVillageState((state) => {
      const current = findLocation(state, venue.id);
      const target = current && resolveVenueZone(current, zone.id);
      if (!current || !target) throw conflict("That Zone is no longer available.");
      const liveScene = {
        ...session,
        continuity: undefined,
        sceneAttendance: session.sceneAttendance ? { ...session.sceneAttendance, layout: undefined } : undefined,
        accompanying,
      };
      if (!contactPath(state, current, requireSceneZoneId(session), target.id, "player", liveScene, accessAt))
        throw conflict("That route is no longer permitted.");
      for (const companion of accompanying ?? []) {
        const origin = contactPosition(session, companion.characterId);
        if (
          origin !== companion.zoneId &&
          !contactPath(state, current, origin, companion.zoneId, companion.characterId, liveScene, accessAt)
        )
          throw conflict("Your escort can no longer take that route.");
      }
      const currentDecision = evaluateZoneAccess(current, target, "player", {
        ...sceneAccessContext({ ...session, accompanying }, accessAt),
        accepting: true,
        unavailable: zoneClosed(state, current, target),
        environment: state.narrative,
      });
      if (!currentDecision.allowed) throw conflict(currentDecision.explanation);
      if (decision.permissionId && currentDecision.permissionId !== decision.permissionId)
        throw conflict("That invitation changed. Refresh the Scene before moving.");
      claimVisitPermission(current, currentDecision.permissionId, session.id);
    });
    await changeSceneVenues(session, (state) => {
      const captured = findLocation(state, venue.id)!;
      claimVisitPermission(captured, decision.permissionId, session.id);
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
  async function markZoneSeen(session: VenueScene): Promise<void> {
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
      pointer.placeId !== session.placeId ||
      currentScene.status === "closed" ||
      currentScene.villageSeed !== session.villageSeed ||
      currentScene.continuity?.setupAt !== session.continuity?.setupAt ||
      currentScene.zoneId !== session.zoneId ||
      narrationBlocker(currentScene)
    )
      return;
    const at = villageNow().toISOString();
    await mutateVillageState((state) => {
      if (state.seed !== session.villageSeed || state.setupAt !== session.continuity?.setupAt) return false;
      const venue = findLocation(state, session.placeId);
      const zone = venue && resolveVenueZone(venue, requireSceneZoneId(session));
      if (
        !venue ||
        !zone ||
        zoneClosed(state, venue, zone) ||
        (venue.access &&
          !evaluateZoneAccess(venue, zone, "player", {
            ...sceneAccessContext(session, undefined, state.timeZone),
            unavailable: zoneClosed(state, venue, zone),
            environment: state.narrative,
          }).allowed)
      )
        return;
      zone.seen = true;
      zone.observed = captureZoneObservation(venue, zone, observableRoomDescription(state, venue.id, zone.id, at));
    });
  }
  async function queueZonePicture(session: VenueScene) {
    if (session.status !== "active" || hasVenueOperation(session.id)) return;
    const village = await readVillageState();
    const venue = village.venues.find((row) => row.id === session.placeId);
    if (!venue || !resolveVenueZone(venue, requireSceneZoneId(session))?.observed) return;
    outsideVenueOperation(() => {
      void loadPrivateSpaceImages()
        .then(({ requestZonePicture }) => requestZonePicture?.(session.placeId, requireSceneZoneId(session)))
        .catch(() => {});
    });
  }
  function enterVenue(
    placeId: string,
    requestedZoneId?: string,
    expectedSceneRevision?: number,
    appointmentId?: string,
  ): Promise<VenueScene> {
    return withSceneActivation(() =>
      serializedNavigation(() => enterVenueOnce(placeId, requestedZoneId, expectedSceneRevision, appointmentId)),
    );
  }
  async function enterVenueOnce(
    placeId: string,
    requestedZoneId?: string,
    expectedSceneRevision?: number,
    appointmentId?: string,
  ): Promise<VenueScene> {
    const pointer = await readActive();
    if (pointer.sessionId && hasVenueOperation(pointer.sessionId))
      throw venueRefusal("SCENE_BUSY", "Wait for the scene reply before entering another Zone.");
    const existing = await activeVenueSession();
    if (appointmentId && existing) {
      if (existing.activity?.id === appointmentId && existing.placeId === placeId) return existing;
      throw conflict(`Finish the Scene in ${existing.placeName} first.`);
    }
    if (!existing) {
      await rollActiveAgendas();
    }
    const live = await readVillageState();
    const appointment = appointmentId ? dueAppointment(live, appointmentId, villageNow()) : undefined;
    if (
      appointmentId &&
      (!appointment ||
        appointment.time.venueId !== placeId ||
        (appointment.time.zoneId ?? "exterior") !== requestedZoneId)
    )
      throw conflict("That Activity is no longer available to join.");
    const village = existing ? sceneContinuityView(live, existing) : live;
    const place = findLocation(village, placeId);
    if (!place) throw notFound("That place is not in this village.");
    if (!place.access) throw conflict("That Place has no native access record.");
    const discovery = live.worldPlaces.places[placeId];
    if (discovery && (!discovery.knownBy.includes("player") || !discovery.prepared))
      throw conflict("Prepare this known Place before visiting.");
    if (!existing && !startingHistoryReady(village))
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
      if (appointment) throw conflict("The Activity's Zone is closed.");
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
    if (gathering && appointment) throw conflict("Finish the opening gathering first.");
    const id = appointment
      ? "activity-" + memoryHash([village.seed, village.setupAt, appointment.id]).slice(0, 32)
      : gathering && village.opening!.gatheringSceneId
        ? village.opening!.gatheringSceneId
        : randomUUID();
    if (appointment) {
      const prior = await readSession(id).catch((error) => {
        if (error instanceof VillagesRequestError && error.statusCode === 404) return null;
        throw error;
      });
      if (
        (await readTerminal(id)) ||
        (prior &&
          (prior.activity?.id !== appointment.id ||
            prior.villageSeed !== village.seed ||
            prior.placeId !== placeId ||
            prior.status === "closed" ||
            prior.endedAt))
      )
        throw conflict("That Activity has already ended.");
      if (prior) {
        await selectActiveScene(id, placeId);
        return refreshZoneParticipants(prior);
      }
    }
    if (gathering) {
      const existingGathering = await withSceneWork(id, async () => {
        const current = await mutateVillageState((state) => {
          if (
            state.seed !== village.seed ||
            state.setupAt !== village.setupAt ||
            state.opening?.stage !== "gathering" ||
            state.opening.id !== village.opening!.id ||
            state.opening.communityVenueId !== placeId
          )
            throw conflict("The opening changed. Refresh the Village.");
          state.opening.gatheringSceneId ||= id;
          if (state.opening.gatheringSceneId !== id) throw conflict("The gathering is already starting.");
        });
        const prior = await readSession(id).catch((error) => {
          if (error instanceof VillagesRequestError && error.statusCode === 404) return null;
          throw error;
        });
        if (!prior) return null;
        if (!matchesOpeningGathering(current, prior))
          throw conflict("The saved Scene does not belong to this opening gathering.");
        if (prior.status === "closed" || prior.endedAt) return finishClosedScene(prior);
        await selectActiveScene(id, placeId);
        return prior;
      });
      if (existingGathering)
        return existingGathering.status === "closed" || existingGathering.endedAt
          ? existingGathering
          : refreshZoneParticipants(existingGathering);
    }
    const sceneAttendance = captureSceneAttendance(village, placeId, villageNow());
    if (
      appointment &&
      !sceneAttendance.occupants.some(
        (person) => person.characterId === appointment.resident.id && person.zoneId === zone.id,
      )
    )
      throw conflict("The Villager is not at the meeting place.");
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
      !startingHistoryReady({
        villagers: village.villagers.filter((resident) =>
          sceneAttendance.occupants.some((person) => person.characterId === resident.characterId),
        ),
        startingHistory: village.startingHistory,
      })
    )
      throw conflict("Starting relationship history needs preparation or clarification before a Scene can begin.");
    const entryAccessContext = {
      sceneId: id,
      at: new ZonedDate(
        sceneAttendance.capturedAt,
        village.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      ),
      positions: Object.fromEntries(sceneAttendance.occupants.map((person) => [person.characterId, person.zoneId])),
      accepting: true,
    };
    let initialPermissionId: string | undefined;
    const decision = evaluateZoneAccess(place, zone, "player", {
      ...entryAccessContext,
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
          unavailable: zoneClosed(state, current, target),
          environment: state.narrative,
        });
        if (!checked.allowed) throw conflict(checked.explanation);
        if (appointment && !dueAppointment(state, appointment.id, villageNow()))
          throw conflict("That Activity is no longer available to join.");
        initialPermissionId = current.access?.permissions.some(
          (grant) => grant.id === checked.permissionId && grant.duration === "visit",
        )
          ? checked.permissionId
          : undefined;
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
      ...(appointment ? { activity: appointment } : {}),
      pendingAccessClaim: initialPermissionId,
      version: 5,
      sceneRevision: 0,
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
      status: participants.length === 0 && !discovery ? "active" : "opening",
      // Pending entry cannot put the private cast into the playback index.
      participants: initialPermissionId ? [] : participants,
      sceneAttendance,
      activeIds: initialPermissionId ? [] : participants.map((person) => person.characterId),
      lines: [],
      submissions: [],
      recap: "",
    };
    const create = async () => {
      await mutateDocument(`${SESSION_PREFIX}${id}`, sessionSlot, async (value) => {
        if (appointment && value.id) throw conflict("That Activity is already starting. Try Join again.");
        if (gathering) {
          if (value.id || (await readTerminal(id)) || !matchesOpeningGathering(await readVillageState(), session))
            throw conflict("The opening changed. Refresh the Village.");
        }
        Object.assign(value, session);
      });
      await selectActiveScene(id, placeId);
    };
    if (gathering) await withSceneWork(id, create);
    else await create();
    const settled = await refreshZoneParticipants(session);
    await queueZonePicture(settled);
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
        const writingInput = {};
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
    let session = await requireLiveVenueSession(id);
    if (
      session.status !== "opening" &&
      !session.submissions.some(
        (turn) => turn.id === "greeting" && (turn.acceptance.status === "pending" || turn.acceptance.status === "held"),
      )
    )
      return session;
    session = await publishNarration(
      session,
      { sessionId: id, submissionId: "greeting", mode: "chat", targetId: "", message: "" },
      "greet",
      signal,
      trace,
    );
    return changeSession(id, (saved) => {
      if (saved.status === "opening") saved.status = "active";
    });
  }
  async function continueVenueWithoutGreeting(id: string): Promise<VenueScene> {
    return withSceneActivation(() => continueVenueWithoutGreetingInActivation(id));
  }
  async function continueVenueWithoutGreetingInActivation(id: string): Promise<VenueScene> {
    const before = await readSession(id);
    if (before.operation && before.operation.kind !== "greet" && before.operation.status !== "complete")
      throw conflict("Recover the current request before skipping the greeting.");
    const work = sceneWork();
    let expected = before.operation;
    if (expected?.kind === "greet") {
      await cancelVenueOperation(id, expected);
      const cancelled = await readSession(id);
      if (
        cancelled.operation?.id !== expected.id ||
        cancelled.operation.attemptId !== expected.attemptId ||
        cancelled.operation.status !== "complete"
      )
        throw conflict("The greeting changed before it could be skipped.");
      await abandonSavedExchange(cancelled, expected.id);
      expected = cancelled.operation;
    }
    await requireLiveVenueSession(id);
    const session = await changeSession(id, (state) => {
      if (state.operation?.token !== expected?.token || state.operation?.attemptId !== expected?.attemptId)
        throw conflict("The Scene request changed before the greeting could be skipped.");
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
  function venueTurnPayload(input: VenueTurnInput) {
    return {
      message: input.message,
      mode: input.mode,
      targetId: input.targetId,
      ...(input.contact ? { contact: input.contact } : {}),
    };
  }
  async function abandonFailedRequest(
    scene: VenueScene,
    operationId: string,
    attemptId: string | undefined,
    expected: number | undefined,
    kind: "turn" | "close",
  ) {
    const operation = scene.operation;
    if (
      !operation ||
      operation.id !== operationId ||
      operation.attemptId !== attemptId ||
      operation.status === "running" ||
      (kind === "close" && operation.status !== "interrupted") ||
      (kind === "turn" && operation.kind !== "turn") ||
      (kind === "turn" && operation.status === "complete" && !operation.error) ||
      (kind === "turn" && operation.sceneRevision !== scene.sceneRevision) ||
      scene.navigationReceipts?.some((row) => row.id === operationId) ||
      expected === undefined ||
      expected !== scene.sceneRevision
    )
      throw venueRefusal("OPERATION_INTERRUPTED", "The failed request changed. Review the Scene before continuing.");
    if ((await abandonSavedExchange(scene, operationId)) === "applied")
      throw conflict("The saved reply already committed and has been recovered. Review the Scene before continuing.");
  }
  async function sendVenueTurn(input: VenueTurnInput) {
    assertSceneTurnMode(input.mode);
    const scene = await readSession(input.sessionId);
    assertCurrentSceneGeneration(scene);
    const prior = scene.submissions.find((entry) => entry.id === input.submissionId);
    if (prior) runtimeDebug("submission replay", { sceneId: input.sessionId, submissionId: input.submissionId });
    if (!prior) await requireLiveVenueSession(input.sessionId);
    const payload = venueTurnPayload(input);
    if (prior && prior.requestFingerprint !== requestFingerprint(input))
      throw venueRefusal("SUBMISSION_MISMATCH", "That submission ID belongs to a different contact attempt.");
    if (prior && (prior.message !== input.message || prior.mode !== input.mode || prior.targetId !== input.targetId))
      throw venueRefusal("SUBMISSION_MISMATCH", "That submission ID belongs to a different line.");
    if (!prior && input.replaceOfOperationId === input.submissionId)
      throw conflict("A replacement needs a new submission ID.");
    if (!prior && input.replaceOfOperationId)
      await abandonFailedRequest(
        scene,
        input.replaceOfOperationId,
        input.retryOfAttemptId,
        input.expectedSceneRevision,
        "turn",
      );
    return coordinateVenue(
      input.sessionId,
      input.submissionId,
      "turn",
      payload,
      input.expectedSceneRevision,
      input.retryOfAttemptId,
      () => sendVenueTurnOnce(input),
      { replay: !!prior, replaceOfOperationId: prior ? undefined : input.replaceOfOperationId },
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
    if (!prior && replaceOfOperationId === submissionId) throw conflict("A replacement needs a new submission ID.");
    if (!prior && replaceOfOperationId)
      await abandonFailedRequest(scene, replaceOfOperationId, retryOfAttemptId, expectedSceneRevision, "turn");
    if (!prior) await requireLiveVenueSession(sessionId);
    if (!prior && !findLocation(await readVillageState(), scene.placeId))
      throw conflict("This Venue is no longer available. End the Scene.");
    const payload = venueTurnPayload({ sessionId, submissionId, message, mode: "leave", targetId: "" });
    return coordinateVenue(
      sessionId,
      submissionId,
      "turn",
      payload,
      expectedSceneRevision,
      retryOfAttemptId,
      () => leaveVenueSessionOnce(sessionId, submissionId, message),
      { replay: !!prior, replaceOfOperationId: prior ? undefined : replaceOfOperationId },
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
    return {
      ...result,
      session: ending.session,
      recordEvents: await visibleNoticeEvents(ending.session, [...byId.values()]),
    };
  }
  async function sendVenueTurnOnce(input: VenueTurnInput) {
    if (sceneWork().isMoving(input.sessionId)) throw conflict("Wait for Zone navigation to finish.");
    let scene = await readSession(input.sessionId);
    assertCurrentSceneGeneration(scene);
    const prior = scene.submissions.find((turn) => turn.id === input.submissionId);
    if (!prior) {
      scene = await requireLiveVenueSession(scene.id);
      const blocker = narrationBlocker(scene);
      if (blocker) throw conflict(blocker);
      if (scene.status !== "active") throw conflict("That Scene is not active.");
      if (input.mode !== "leave" && !input.message.trim()) throw badRequest("Write something before sending.");
      if (input.message.length > 4000) throw badRequest("A submission can be at most 4000 characters.");
      const snapshot = venueOperationSnapshot<unknown>();
      if (snapshot)
        scene = { ...(await createSceneHistory(villagesDocuments()).decode(snapshot)), operation: scene.operation };
    }
    const location = findLocation(await readVillageState(), scene.placeId);
    if (!location && !prior) throw conflict("This Place is unavailable; the request is retained.");
    if (
      !prior &&
      input.mode === "contact" &&
      input.contact?.boundaryZoneId &&
      !contactNeighbors(location!, requireSceneZoneId(scene), scene).includes(input.contact.boundaryZoneId)
    )
      throw badRequest("Choose a directly connected Zone for Contact.");
    const admitted = prior
      ? scene
      : zoneEventScene(scene, location!, {
          message: input.message,
          targetId: input.targetId,
          zoneId: input.contact?.boundaryZoneId,
        });
    if (input.mode === "contact" && input.contact && admitted.contactGeneration)
      admitted.contactGeneration.instruction =
        "Requested Contact shortcut: " +
        JSON.stringify({
          kind: input.contact.kind,
          targetId: input.contact.targetId || input.targetId,
          boundaryZoneId: input.contact.boundaryZoneId,
          physicalTargetId: input.contact.physicalTargetId,
          delivery: input.contact.delivery,
        }) +
        ". Resolve the authored submission naturally; do not invent success or voluntary player speech.";
    const published = await publishNarration(
      admitted,
      input,
      input.mode === "leave" ? "leave" : "chat",
      venueOperationSignal(),
    );
    if (published.status === "closed") await finishClosedScene(published);
    const turn = published.submissions.find((turn) => turn.id === input.submissionId)!;
    return { session: published, recordEvents: await visibleNoticeEvents(published, sceneTurnNotices(turn)) };
  }
  async function changeSceneVenues(scene: VenueScene, change: (state: VillageState) => void) {
    if (!scene.continuity) return;
    const current = await readVillageState();
    await changeSession(scene.id, (saved) => {
      if (
        !saved.continuity ||
        saved.villageSeed !== scene.villageSeed ||
        saved.villageSeed !== current.seed ||
        saved.continuity.setupAt !== scene.continuity?.setupAt ||
        saved.continuity.setupAt !== current.setupAt
      )
        return;
      const view = { ...current, ...cloneSceneFacts(saved.continuity.facts) };
      change(view);
      saved.continuity = {
        ...saved.continuity,
        facts: { ...saved.continuity.facts, venues: view.venues, worldPlaces: view.worldPlaces },
      };
    });
  }
  async function endVenueSession(id: string, retryOfAttemptId?: string): Promise<VenueScene> {
    return coordinateVenue(id, "close", "close", {}, undefined, retryOfAttemptId, () => closeVenueSessionOnce(id));
  }
  /** Close the Scene and return its committed visible changes. */
  async function endVenueSessionWithReceipts(id: string, retryOfAttemptId?: string) {
    const session = await endVenueSession(id, retryOfAttemptId);
    return { session, recordEvents: await visibleNoticeEvents(session, sceneTurnNotices(session.submissions.at(-1))) };
  }
  /** Archive the Scene after recovering saved exchange work; no closing review. */
  async function closeVenueSession(
    id: string,
    expectedSceneRevision?: number,
    retryOfAttemptId?: string,
    abandonOperationId?: string,
  ): Promise<VenueScene> {
    const scene = await readSession(id);
    if (scene.status === "closed" && (scene.operation?.id !== "close" || scene.operation.status === "complete"))
      return finishClosedScene(scene);
    const resumingAbandon =
      scene.operation?.id === "close" && typeof scene.operation.input.abandonOperationId === "string";
    if (abandonOperationId && !resumingAbandon)
      await abandonFailedRequest(scene, abandonOperationId, retryOfAttemptId, expectedSceneRevision, "close");
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
        const blocker = narrationBlocker(current);
        if (blocker) throw conflict(blocker);
        return closeLiveScene(current);
      },
      { abandonOfOperationId: resumingAbandon ? undefined : abandonOperationId },
    );
  }
  async function closeVenueSessionOnce(id: string): Promise<VenueScene> {
    const session = await readSession(id);
    for (const turn of session.submissions.filter((turn) => turn.acceptance.status === "pending")) {
      await processSavedExchange(id, turn.id).catch((error) =>
        villagesLogger().warn("[villages] deferred Scene recovery: %s", String(error)),
      );
    }
    const recovered = await readSession(id);
    const blocker = narrationBlocker(recovered);
    if (blocker) throw conflict(blocker);
    return closeLiveScene(recovered);
  }
  async function closeVenueSessionWithReceipts(
    id: string,
    expectedSceneRevision?: number,
    retryOfAttemptId?: string,
    abandonOperationId?: string,
  ) {
    const session = await closeVenueSession(id, expectedSceneRevision, retryOfAttemptId, abandonOperationId);
    return { session, recordEvents: await visibleNoticeEvents(session, sceneTurnNotices(session.submissions.at(-1))) };
  }
  async function closeLiveScene(session: VenueScene): Promise<VenueScene> {
    if (session.pendingAccessClaim) session = await requireLiveVenueSession(session.id);
    const closed = await changeSession(session.id, (state) => {
      state.status = "closed";
      state.endedAt ||= villageNow().toISOString();
      state.endReason ||= "player";
    });
    return finishClosedScene(closed);
  }
  async function finishClosedScene(closed: VenueScene): Promise<VenueScene> {
    const countsAsMeeting = closed.status === "closed" && ["player", "scene"].includes(closed.endReason);
    if (closed.openingGatheringId || closed.activity || countsAsMeeting)
      await mutateVillageState(
        (state) => {
          if (closed.openingGatheringId) completeOpeningGathering(state, closed);
          if (closed.activity) recordCompletedActivity(state, closed);
          if (countsAsMeeting && state.seed === closed.villageSeed && closed.endedAt)
            recordClosedRelationshipScene(state, closed);
        },
        { memories: true },
      );
    await clearActivePointer(closed.id, true);
    return closed;
  }
  async function settleScene(id: string): Promise<void> {
    const scene = await readSession(id);
    for (const turn of scene.submissions.filter((turn) => turn.acceptance.status === "pending"))
      await processSavedExchange(id, turn.id);
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
  }
  async function recoverVenueSceneWork() {
    await recoverVenueOperations(async (id, operation) => {
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
  return {
    moveVenueZone,
    enterVenue,
    greetVenue,
    continueVenueWithoutGreeting,
    sendVenueTurn,
    leaveVenueSession,
    endVenueSession,
    endVenueSessionWithReceipts,
    closeVenueSession,
    closeVenueSessionWithReceipts,
    discardVenueVisitDebug,
    recoverVenueSceneWork,
    settleScene,
  };
}
export type SceneCommands = ReturnType<typeof createSceneCommands>;
