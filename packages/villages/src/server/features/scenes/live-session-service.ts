import { randomUUID } from "node:crypto";
import { observeVillageClock, villageClockShiftMs, villageNow } from "../../adapters/time/clock-gate.js";
import type { VenueScene } from "../../domain/models/scene-model.js";
import { conflict } from "../../domain/rules/errors.js";
import { gatheringDialogueComplete } from "../../domain/rules/opening-project.js";
import { accessExits, captureSceneAttendance, sceneZoneOccupants } from "../../domain/rules/scene-attendance.js";
import { captureSceneContinuity, sceneContinuityView } from "../../domain/rules/scene-continuity.js";
import { captureSceneLayout } from "../../domain/rules/scene-layout.js";
import { agendaAt } from "../../domain/rules/agenda-plan.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import { semanticBlocker } from "../../domain/rules/semantic-continuity.js";
import { appendLine } from "../../domain/rules/scene-record.js";
import { claimVisitPermission, evaluateZoneAccess } from "../../domain/rules/venue-access.js";
import { sceneAccessContext } from "../../domain/rules/venue-contact.js";
import {
  canInviteToZone,
  legacyZoneId,
  resolveVenueZone,
  zoneArea,
  zoneClosed,
} from "../../domain/rules/venue-zones.js";
export interface LiveScenePorts {
  readActive: typeof import("../../adapters/storage/scene-store.js").readActive;
  readSession: typeof import("../../adapters/storage/scene-store.js").readSession;
  changeSession: typeof import("../../adapters/storage/scene-store.js").changeSession;
  clearActivePointer: typeof import("../../adapters/storage/scene-store.js").clearActivePointer;
  hasVenueOperation: typeof import("../../jobs/venue-coordinator.js").hasVenueOperation;
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
  readVillageState,
  mutateVillageState,
}: LiveScenePorts) {
  async function alignSceneClock(session: VenueScene): Promise<VenueScene> {
    const total = villageClockShiftMs();
    if (session.status === "closed" || (session.clockShiftMs ?? 0) === total) return session;
    return changeSession(session.id, (current) => {
      const delta = total - (current.clockShiftMs ?? 0);
      const at = Date.parse(current.lastActivityAt || current.startedAt);
      if (Number.isFinite(at)) current.lastActivityAt = new Date(at + delta).toISOString();
      current.clockShiftMs = total;
    });
  }
  async function completeGathering(session: VenueScene): Promise<void> {
    if (!session.openingGatheringId) return;
    if (session.openingReader && !gatheringDialogueComplete(session)) return;
    if (
      session.openingReader &&
      (session.status !== "closed" ||
        !session.activeIds.every((id) =>
          session.lines.some((line) => line.kind === "dialogue" && line.speakerId === id),
        ))
    )
      return;
    await mutateVillageState((state) => {
      if (
        state.seed === session.villageSeed &&
        state.opening?.stage === "gathering" &&
        state.opening.gatheringSceneId === session.id &&
        state.opening.id === session.openingGatheringId
      )
        state.opening.stage = state.opening.version === 3 ? "complete" : "conversations";
    });
  }
  async function activeVenueSession(): Promise<VenueScene | null> {
    const active = await readActive();
    if (!active.sessionId) return null;
    let session = await readSession(active.sessionId);
    if ((await observeVillageClock())?.paused) return session;
    session = await alignSceneClock(session);
    if (session.status === "closed") {
      await completeGathering(session);
      await clearActivePointer(session.id, true);
      return null;
    }
    if (hasVenueOperation(session.id)) return session;
    return refreshZoneParticipants(session);
  }

  async function requireLiveVenueSession(id: string): Promise<VenueScene> {
    const session = await alignSceneClock(await readSession(id));
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
    if ((await observeVillageClock())?.paused) return session;
    if (!completing && hasVenueOperation(session.id)) return session;
    if (session.liveSceneVersion === 1) {
      // Durable failed work owns its admitted context even after the in-memory operation has gone.
      if (session.operation && (session.operation.status !== "complete" || session.operation.error)) return session;
      if (semanticBlocker(session)) return session;
      session = await refreshLiveScene(session);
      if (hasVenueOperation(session.id)) return session;
    }
    const village = sceneContinuityView(await readVillageState(), session),
      venue = village.venues.find((entry) => entry.id === session.placeId);
    if (!venue || session.status === "closed") return session;
    if (session.sceneAttendance && !session.sceneAttendance.layout) {
      const captured = await changeSession(session.id, (state) => {
        if (state.sceneAttendance && !state.sceneAttendance.layout)
          state.sceneAttendance.layout = captureSceneLayout(venue);
      });
      return refreshZoneParticipants(captured, completing);
    }
    if (venue.access && session.pendingAccessClaim) {
      await mutateVillageState((state) => {
        const current = state.venues.find((row) => row.id === venue.id);
        const target = current && resolveVenueZone(current, session.zoneId ?? "exterior");
        if (!current) return;
        if (!target) return;
        const decision = evaluateZoneAccess(current, target, "player", {
          ...sceneAccessContext(session, state),
          accepting: true,
          unavailable: zoneClosed(state, current, target),
          environment: state.narrative,
        });
        if (decision.allowed) claimVisitPermission(current, decision.permissionId, session.id);
      });
      const settled = await changeSession(session.id, (state) => {
        const captured = state.continuity?.facts.venues.find((row) => row.id === venue.id);
        const target = captured && resolveVenueZone(captured, state.zoneId ?? "exterior");
        if (captured && target) {
          const decision = evaluateZoneAccess(captured, target, "player", {
            ...sceneAccessContext(state, village),
            accepting: true,
          });
          if (decision.allowed) claimVisitPermission(captured, decision.permissionId, state.id);
        }
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
              state.privateSpaceId = destination.kind === "private-residence" ? destination.id : undefined;
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
              (grant) =>
                grant.zoneId === id && !canInviteToZone(venue, resolveVenueZone(venue, id)!, grant.controllerId),
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
          at: villageNow().toISOString(),
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
        state.grantedZoneIds = state.grantedZoneIds?.filter(
          (id) => !invalidGrants.some((grant) => grant.zoneId === id),
        );
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
          });
      }
      session = await changeSession(session.id, (state) => {
        if (!state.sceneAttendance) state.sceneAttendance = captured;
      });
    }
    if (!session.continuity) {
      // The document exists before its expiry hold. Interrupted setup can safely
      // retry; an old Scene captures available facts once, without inventing history.
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
        { wishes: true },
      );
      session = await changeSession(session.id, (state) => {
        if (state.status === "closed" || (!completing && hasVenueOperation(session.id))) return;
        state.continuity ??= continuity;
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
      }
      if (activeIds.some((id) => !state.activeIds.includes(id))) state.recap = "";
      state.activeIds = activeIds;
    });
  }
  async function refreshLiveScene(session: VenueScene): Promise<VenueScene> {
    if (session.status === "closed") return session;
    const village = await readVillageState({ wishes: true });
    if (village.seed !== session.villageSeed) throw conflict("That Village changed. Its saved Scene is preserved.");
    const venue = village.venues.find((row) => row.id === session.placeId);
    if (!venue) return session;
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
    const sameRoutine = (id: string) => {
      const resident = village.villagers.find((row) => row.characterId === id);
      return (
        !!resident &&
        currentMoment.dayIndex === previousMoment.dayIndex &&
        JSON.stringify(
          agendaAt(
            resident.agenda,
            previousMoment.minuteOfDay,
            new Date(previousAt),
            resident.ingestSchedule !== false,
          ),
        ) ===
          JSON.stringify(agendaAt(resident.agenda, currentMoment.minuteOfDay, now, resident.ingestSchedule !== false))
      );
    };
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
        semanticBlocker(state)
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
      state.entryOffers = (state.entryOffers ?? []).filter((row) => sameRoutine(row.controllerId));
      const people = sceneZoneOccupants(state, village, venue, state.zoneId ?? "exterior");
      if (people.length > 4) throw conflict("This Zone is full. Move to another Zone.");
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
          heardBy: [],
          physicalIdsAfter: activeIds,
          content: [
            currentMoment.dayIndex !== previousMoment.dayIndex
              ? `${currentMoment.weekday}, ${currentMoment.dateLabel}, ${currentMoment.localTime}.`
              : "",
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
        state.pendingAttention = undefined;
      }
    });
  }
  return { activeVenueSession, requireLiveVenueSession, touchVenueSession, refreshZoneParticipants };
}
export type LiveScenes = ReturnType<typeof createLiveScenes>;
