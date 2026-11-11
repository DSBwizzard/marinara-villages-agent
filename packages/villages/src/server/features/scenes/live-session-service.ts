import { captureZoneObservation } from "../../domain/rules/zone-observation.js";
import { observableRoomDescription, zonePictureContext } from "../../domain/rules/zone-picture.js";
import { findLocation } from "../../domain/rules/places.js";
import { findNpc } from "../../domain/rules/places.js";
import { randomUUID } from "node:crypto";
import { observeVillageClock, villageNow } from "../../adapters/time/clock-gate.js";
import type { VenueScene } from "../../domain/models/scene-model.js";
import { conflict } from "../../domain/rules/errors.js";
import { completeOpeningGathering } from "../../domain/rules/opening-project.js";

import {
  accessExits,
  captureSceneAttendance,
  sceneZoneOccupants,
  sameSceneRoutine,
} from "../../domain/rules/scene-attendance.js";
import { captureSceneContinuity, sceneContinuityView } from "../../domain/rules/scene-continuity.js";
import { requireSceneZoneId, captureSceneLayout } from "../../domain/rules/scene-layout.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import { narrationBlocker } from "../../domain/rules/scene-submissions.js";
import { appendLine } from "../../domain/rules/scene-record.js";
import { claimVisitPermission, evaluateZoneAccess } from "../../domain/rules/venue-access.js";
import { sceneAccessContext } from "../../domain/rules/venue-contact.js";
import { resolveVenueZone, zoneArea, zoneClosed } from "../../domain/rules/venue-zones.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
export interface LiveScenePorts {
  readActive: typeof import("../../adapters/storage/scene-store.js").readActive;
  readSession: typeof import("../../adapters/storage/scene-store.js").readSession;
  changeSession: typeof import("../../adapters/storage/scene-store.js").changeSession;
  clearActivePointer: typeof import("../../adapters/storage/scene-store.js").clearActivePointer;
  hasVenueOperation: typeof import("../../jobs/venue-coordinator.js").hasVenueOperation;
  withIdleSceneWork(id: string, work: () => Promise<void>): Promise<void>;
  readVillageState: typeof import("../world/village-store.js").readVillageState;
  mutateVillageState: typeof import("../world/village-store.js").mutateVillageState;
}
const ACTIVITY_WRITE_MS = 15 * 1000;
/** Inert active-Scene lifecycle and attendance coordination with originating connections. */
export function createLiveScenes({
  readActive,
  readSession,
  changeSession,
  clearActivePointer,
  hasVenueOperation,
  withIdleSceneWork,
  readVillageState: readVillageStateWithoutPlaces,
  mutateVillageState: mutateVillageStateWithoutPlaces,
}: LiveScenePorts) {
  const readVillageState: typeof readVillageStateWithoutPlaces = (options) =>
    readVillageStateWithoutPlaces({ ...options, memories: true });
  const mutateVillageState: typeof mutateVillageStateWithoutPlaces = (change, options) =>
    mutateVillageStateWithoutPlaces(change, { ...options, memories: true });
  async function canGenerateZonePicture(
    venueId: string,
    zoneId: string,
    guard?: (state: import("../../domain/models/world.js").VillageState) => boolean,
    fromObservation = false,
  ): Promise<boolean> {
    await observeVillageClock();
    if (fromObservation) {
      const state = await readVillageState();
      const zone = state.venues.find((row) => row.id === venueId)?.zones?.find((row) => row.id === zoneId);
      return !!zone?.observed && (!guard || guard(state));
    }
    const pointer = await readActive();
    if (!pointer.sessionId) return false;
    const scene = await readSession(pointer.sessionId),
      state = await readVillageState();
    const at = villageNow().toISOString();
    const venue = state.venues.find((row) => row.id === venueId);
    const zone = venue && resolveVenueZone(venue, zoneId);
    if (
      !venue ||
      !venue.access ||
      !zone ||
      (guard && !guard(state)) ||
      scene.status !== "active" ||
      scene.placeId !== venueId ||
      scene.zoneId !== zoneId ||
      scene.villageSeed !== state.seed ||
      (scene.continuity && scene.continuity.setupAt !== state.setupAt) ||
      narrationBlocker(scene) ||
      (scene.operation && (scene.operation.status !== "complete" || scene.operation.error)) ||
      zoneClosed(state, venue, zone) ||
      zone.observed?.context !== zonePictureContext(state, venue, zone, at)
    )
      return false;
    const captured = findLocation(scene.continuity?.facts, venueId);
    const capturedZone = captured && resolveVenueZone(captured, zoneId);
    if (captured && (!capturedZone || captured.form !== venue.form)) return false;
    if (
      !evaluateZoneAccess(venue, zone, "player", {
        ...sceneAccessContext(scene, undefined, state.timeZone),
        unavailable: zoneClosed(state, venue, zone),
        environment: state.narrative,
      }).allowed
    )
      return false;
    if ((await readActive()).sessionId !== scene.id) return false;
    const latest = await readSession(scene.id);
    return (
      latest.placeId === scene.placeId &&
      latest.zoneId === scene.zoneId &&
      latest.status === "active" &&
      !narrationBlocker(latest) &&
      (!latest.operation || (latest.operation.status === "complete" && !latest.operation.error))
    );
  }

  async function activeVenueSession(): Promise<VenueScene | null> {
    const active = await readActive();
    if (!active.sessionId) return null;
    const session = await readSession(active.sessionId);
    await observeVillageClock();
    if (session.status === "closed") {
      if (session.openingGatheringId) await mutateVillageState((state) => completeOpeningGathering(state, session));
      await clearActivePointer(session.id, true);
      return null;
    }
    if (hasVenueOperation(session.id)) return session;
    return refreshZoneParticipants(session);
  }

  async function requireLiveVenueSession(id: string): Promise<VenueScene> {
    const session = await readSession(id);
    if (session.status === "closed") throw conflict("That Scene has already ended.");
    if ((await readActive()).sessionId !== id) throw conflict("That Scene is not active.");
    return refreshZoneParticipants(session);
  }

  /** Only a deliberate client action updates this server-owned clock. */
  async function touchVenueSession(id: string): Promise<VenueScene> {
    const session = await requireLiveVenueSession(id);
    if (villageNow().getTime() - Date.parse(session.lastActivityAt) < ACTIVITY_WRITE_MS) return session;
    return changeSession(id, (state) => {
      if (state.status === "closed") throw conflict("That Scene has already ended.");
      if (villageNow().getTime() - Date.parse(state.lastActivityAt) >= ACTIVITY_WRITE_MS)
        state.lastActivityAt = villageNow().toISOString();
    });
  }

  async function refreshZoneParticipants(session: VenueScene, completing = false): Promise<VenueScene> {
    await observeVillageClock();
    if (!completing && hasVenueOperation(session.id)) return session;
    if (!completing) {
      // Durable failed work owns its admitted context even after the in-memory operation has gone.
      if (session.operation && (session.operation.status !== "complete" || session.operation.error)) return session;
      if (narrationBlocker(session)) return session;
    }
    if (session.status === "closed") return session;
    if (!session.zoneId || !session.sceneAttendance) throw conflict("That Scene has no current live admission.");
    if (!completing) {
      session = await refreshLiveScene(session);
      await withIdleSceneWork(session.id, () => rememberCurrentZone(session));
      if (hasVenueOperation(session.id)) return session;
    }
    const village = sceneContinuityView(await readVillageState(), session),
      venue = findLocation(village, session.placeId);
    if (!venue || session.status === "closed") return session;
    if (!venue.access) throw conflict("That Place has no native access record.");
    if (session.sceneAttendance && !session.sceneAttendance.layout) {
      const captured = await changeSession(session.id, (state) => {
        if (state.sceneAttendance && !state.sceneAttendance.layout)
          state.sceneAttendance.layout = captureSceneLayout(venue);
      });
      return refreshZoneParticipants(captured, completing);
    }
    if (venue.access && session.pendingAccessClaim) {
      await mutateVillageState((state) => {
        const current = findLocation(state, venue.id);
        const target = current && resolveVenueZone(current, requireSceneZoneId(session));
        if (!current) return;
        if (!target) return;
        const decision = evaluateZoneAccess(current, target, "player", {
          ...sceneAccessContext(session, undefined, state.timeZone),
          accepting: true,
          unavailable: zoneClosed(state, current, target),
          environment: state.narrative,
        });
        if (decision.allowed) claimVisitPermission(current, decision.permissionId, session.id);
      });
      const settled = await changeSession(session.id, (state) => {
        const captured = findLocation(state.continuity?.facts, venue.id);
        const target = captured && resolveVenueZone(captured, requireSceneZoneId(state));
        if (captured && target) {
          const decision = evaluateZoneAccess(captured, target, "player", {
            ...sceneAccessContext(state, undefined, village.timeZone),
            accepting: true,
          });
          if (decision.allowed) claimVisitPermission(captured, decision.permissionId, state.id);
        }
        state.pendingAccessClaim = undefined;
      });
      return refreshZoneParticipants(settled, completing);
    }
    const zoneId = requireSceneZoneId(session);
    if (venue.access && session.sceneAttendance) {
      const exits = accessExits(session, village, venue);
      if (exits.length) {
        const displaced = await changeSession(session.id, (state) => {
          // Recompute from committed positions, so retries cannot record an exit twice.
          for (const exit of accessExits(state, village, venue)) {
            const witnesses = [
              ...new Set(
                Object.entries(sceneAccessContext(state).positions ?? {})
                  .filter(([, position]) => position === exit.from || position === exit.to)
                  .map(([actor]) => actor),
              ),
            ].filter((actor) => actor !== "player");
            const playerPosition = requireSceneZoneId(state);
            appendLine(state, {
              id: randomUUID(),
              role: "assistant",
              speakerId: "__venue_scene__",
              name: "Narration",
              kind: "narration",
              content: `${exit.actor === "player" ? "You" : (state.sceneAttendance?.occupants.find((person) => person.characterId === exit.actor)?.name ?? "A visitor")} leave ${resolveVenueZone(venue, exit.from)?.name ?? "the Zone"}${exit.to ? ` and return to ${resolveVenueZone(venue, exit.to)?.name ?? "Entrance"}` : " and depart the Venue"} because access has ended.`,
              at: villageNow().toISOString(),
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
              state.recap = "";
              state.doorwayContacts = [];
            } else if (!exit.to) {
              if (exit.destinationVenueId) {
                state.departureDestinations ??= {};
                state.departureDestinations[exit.actor] = { venueId: exit.destinationVenueId, zoneId: "exterior" };
              }
              state.departedIds = [...new Set([...(state.departedIds ?? []), exit.actor])];
              state.activeIds = state.activeIds.filter((id) => id !== exit.actor);
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
    if (!session.continuity) {
      // The document exists before its expiry hold; interrupted setup can retry.
      const now = villageNow().getTime();
      if (!session.villageSeed)
        session = await changeSession(session.id, (state) => {
          state.villageSeed ||= village.seed;
        });
      let continuity!: NonNullable<VenueScene["continuity"]>;
      await mutateVillageState(
        (state) => {
          // Capture while relationship authority is hydrated. The public world
          // mutation result intentionally strips that transient context.
          continuity = captureSceneContinuity(state, session, now);
        },
        { memories: true },
      );
      session = await changeSession(session.id, (state) => {
        if (state.status === "closed" || (!completing && hasVenueOperation(session.id))) return;
        state.continuity ??= continuity;
      });
    }
    const people = sceneZoneOccupants(session, venue, zoneId);
    if (people.filter((person) => !person.characterId.startsWith("npc:")).length > 4)
      throw conflict("Five residents occupy this Zone in the Scene. Choose another Zone.");
    const activeIds = people.map((person) => person.characterId);
    if (session.zoneId === zoneId && JSON.stringify(activeIds) === JSON.stringify(session.activeIds)) return session;
    return changeSession(session.id, (state) => {
      if (!completing && hasVenueOperation(session.id)) return;
      state.zoneId = zoneId;
      for (const person of people) {
        if (!state.participants.some((entry) => entry.characterId === person.characterId))
          state.participants.push({ characterId: person.characterId, name: person.name, doing: person.doing });
      }
      if (activeIds.some((id) => !state.activeIds.includes(id))) state.recap = "";
      state.activeIds = activeIds;
    });
  }
  async function rememberCurrentZone(session: VenueScene): Promise<void> {
    if (session.status === "closed" || narrationBlocker(session) || hasVenueOperation(session.id)) return;
    const captured = findLocation(session.continuity?.facts, session.placeId);
    const source = captured && resolveVenueZone(captured, requireSceneZoneId(session));
    if (!source || !captured || (await readActive()).sessionId !== session.id) return;
    const latest = await readSession(session.id);
    if (
      latest.sceneRevision !== session.sceneRevision ||
      latest.zoneId !== session.zoneId ||
      latest.status === "closed" ||
      narrationBlocker(latest) ||
      (latest.operation && (latest.operation.status !== "complete" || latest.operation.error))
    )
      return;
    const village = await readVillageState(),
      venue = findLocation(village, session.placeId);
    const zone = venue && resolveVenueZone(venue, source.id);
    const at = villageNow();
    const access = (state: typeof village, location: NonNullable<typeof venue>, area: NonNullable<typeof zone>) =>
      evaluateZoneAccess(location, area, "player", {
        ...sceneAccessContext(latest, new ZonedDate(at, state.timeZone || "UTC")),
        unavailable: zoneClosed(state, location, area),
        environment: state.narrative,
      }).allowed;
    if (
      !zone ||
      !venue ||
      village.seed !== session.villageSeed ||
      village.setupAt !== session.continuity?.setupAt ||
      captured.form !== venue.form ||
      !access(village, venue, zone)
    )
      return;
    const instant = at.toISOString();
    const observed = captureZoneObservation(
      venue,
      zone,
      observableRoomDescription(village, venue.id, zone.id, instant),
    );
    if (zone.seen && JSON.stringify(zone.observed) === JSON.stringify(observed)) return;
    await mutateVillageState((state) => {
      const current = findLocation(state, session.placeId),
        target = current && resolveVenueZone(current, source.id);
      if (
        state.seed === session.villageSeed &&
        state.setupAt === village.setupAt &&
        current &&
        target &&
        access(state, current, target) &&
        zonePictureContext(state, current, target, instant) === observed.context
      ) {
        target.seen = true;
        target.observed = captureZoneObservation(current, target, observed.description);
      }
    });
  }

  async function refreshLiveScene(session: VenueScene): Promise<VenueScene> {
    if (session.status === "closed") return session;
    const village = await readVillageState({ memories: true });
    if (village.seed !== session.villageSeed) throw conflict("That Village changed. Its saved Scene is preserved.");
    const venue = findLocation(village, session.placeId);
    if (!venue) return session;
    if (!venue.access) throw conflict("That Place has no native access record.");
    const now = villageNow();
    const moment = (at: Date) =>
      deriveVillageMoment({
        foundedAt: village.foundedAt,
        seed: village.seed,
        environment: village.narrative,
        timeZone: village.timeZone || undefined,
        now: at,
      });
    const currentMoment = moment(now);
    const previousAt = session.sceneAttendance?.capturedAt ?? session.startedAt;
    const previousMoment = moment(new Date(previousAt));
    const sameRoutine = (id: string) => !!findNpc(village, id) || sameSceneRoutine(village, session, id, now);
    const accompanying = (session.accompanying ?? []).filter((row) => sameRoutine(row.characterId));
    const positions = new Map(
      accompanying.flatMap((row) => {
        const zone = resolveVenueZone(venue, row.zoneId);
        return zone
          ? [
              [
                row.characterId,
                {
                  id: venue.id,
                  name: venue.name,
                  kind: "venue" as const,
                  zoneId: zone.id,
                  zoneName: zone.name,
                  image: zone.image,
                },
              ] as const,
            ]
          : [];
      }),
    );
    const attendance = captureSceneAttendance(village, venue.id, now, positions);
    attendance.occupants.push(
      ...(session.sceneAttendance?.occupants ?? []).filter(
        (person) => !!findNpc(village, person.characterId) && !session.departedIds?.includes(person.characterId),
      ),
    );
    const departedIds = (session.departedIds ?? []).filter(sameRoutine);
    const continuity = captureSceneContinuity(village, session, now.getTime());
    if (
      session.continuity &&
      Math.floor(Date.parse(session.continuity.capturedAt) / 60_000) === Math.floor(now.getTime() / 60_000) &&
      JSON.stringify(session.continuity.facts) === JSON.stringify(continuity.facts) &&
      JSON.stringify(session.sceneAttendance?.occupants) === JSON.stringify(attendance.occupants)
    )
      return session;
    return changeSession(session.id, (state) => {
      if (
        state.sceneRevision !== session.sceneRevision ||
        hasVenueOperation(state.id) ||
        (state.operation && (state.operation.status !== "complete" || state.operation.error)) ||
        narrationBlocker(state)
      )
        return;
      state.sceneAttendance = attendance;
      state.continuity = continuity;
      state.accompanying = accompanying;
      state.departedIds = departedIds;
      state.departureDestinations = Object.fromEntries(
        Object.entries(state.departureDestinations ?? {}).filter(([id]) => departedIds.includes(id)),
      );
      state.doorwayContacts = (state.doorwayContacts ?? []).filter((row) => sameRoutine(row.characterId));
      const people = sceneZoneOccupants(state, venue, requireSceneZoneId(state));
      if (
        people.filter((person) => village.villagers.some((resident) => resident.characterId === person.characterId))
          .length > 4
      )
        throw conflict("This Zone is full. Move to another Zone.");
      const activeIds = people.map((row) => row.characterId);
      const departed = state.activeIds.filter((id) => !activeIds.includes(id));
      const arrived = people.filter((row) => !state.activeIds.includes(row.characterId));
      for (const person of people) {
        const existing = state.participants.findIndex((row) => row.characterId === person.characterId);
        const participant = { characterId: person.characterId, name: person.name, doing: person.doing };
        if (existing < 0) state.participants.push(participant);
        else state.participants[existing] = participant;
      }
      state.activeIds = activeIds;
      if (state.status === "opening" && activeIds.length === 0) state.status = "active";
      if (departed.length || arrived.length || currentMoment.dayIndex !== previousMoment.dayIndex) {
        // Report current presence, never fabricate witnessed departures or player activity during an absence.
        appendLine(state, {
          id: randomUUID(),
          role: "assistant",
          kind: "narration",
          speakerId: "__venue_scene__",
          name: "Narration",
          at: now.toISOString(),
          heardBy: ["player"],
          physicalIdsAfter: activeIds,
          presenceChange: true,
          content: [
            currentMoment.dayIndex !== previousMoment.dayIndex
              ? `${currentMoment.weekday}, ${currentMoment.dateLabel}, ${currentMoment.localTime}.`
              : `${currentMoment.localTime} ·`,
            ...departed.map(
              (id) =>
                `${state.participants.find((row) => row.characterId === id)?.name ?? "A resident"} is no longer here.`,
            ),
            ...arrived.map((person) => `${person.name} is here.`),
          ]
            .filter(Boolean)
            .join(" "),
        });
        state.recap = "";
      }
    });
  }
  return {
    canGenerateZonePicture,
    activeVenueSession,
    requireLiveVenueSession,
    touchVenueSession,
    refreshZoneParticipants,
  };
}
export type LiveScenes = ReturnType<typeof createLiveScenes>;
