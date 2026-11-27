import { findLocation, findNpc } from "./places.js";
import { captureSceneLayout } from "./scene-layout.js";
import type { SceneAttendance, VenueScene } from "../models/scene-model.js";
import type { VillageAgendaBlock, VillageState, VillageVenue, VillagePlaceView } from "../models/world.js";
import { agendaAt } from "./agenda-plan.js";
import { agendaDateKey } from "./agenda-week.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { contactPath, physicalVenuePath, physicallyUsableZone, sceneAccessContext } from "./venue-contact.js";
import { sceneAccessState, sceneLayoutVenue } from "./scene-layout.js";
import { MAX_ZONE_VILLAGERS } from "./venue-model.js";
import { conflict } from "./errors.js";
import { openingPlayspace } from "./opening-playspace.js";
import { gatheringCast, matchesOpeningGathering } from "./opening-project.js";
import { venueResidentIds } from "./venue-model.js";
import { chooseAgendaZone, resolveVenueZone, zoneClosed } from "./venue-zones.js";
import { deriveVillageMoment } from "./village-clock.js";
import { villagePresence } from "./village-projections.js";
import { sameVisitorPhase, visitorPosition } from "./visitors.js";

export function sameSceneRoutine(village: VillageState, scene: VenueScene, actorId: string, now: Date): boolean {
  const resident = village.villagers.find((row) => row.characterId === actorId);
  if (!resident)
    return sameVisitorPhase(village, actorId, new Date(scene.sceneAttendance?.capturedAt ?? scene.startedAt), now);
  const previous = scene.continuity?.facts.villagers.find((row) => row.characterId === actorId) ?? resident;
  const timeZone = village.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const before = new ZonedDate(scene.sceneAttendance?.capturedAt ?? scene.startedAt, timeZone);
  const after = new ZonedDate(now, timeZone);
  const block = (person: typeof resident, at: Date) =>
    agendaAt(person.agenda, at.getHours() * 60 + at.getMinutes(), at);
  const date = agendaDateKey(after);
  if (agendaDateKey(before) !== date) return false;
  const captured = block(previous, before),
    current = block(resident, after);
  if (JSON.stringify(captured) === JSON.stringify(current)) return true;
  const beforeMinute = before.getHours() * 60 + before.getMinutes();
  const afterMinute = after.getHours() * 60 + after.getMinutes();
  if (
    !captured ||
    !current ||
    (!resident.agenda?.repairedDays?.includes(date) && !previous.agenda?.repairedDays?.includes(date)) ||
    afterMinute < captured.startMinute ||
    afterMinute >= captured.endMinute ||
    beforeMinute < current.startMinute ||
    beforeMinute >= current.endMinute
  )
    return false;
  // A repair can split an activity without changing what the resident is doing now.
  const meaning = ({ startMinute: _start, endMinute: _end, ...activity }: VillageAgendaBlock) =>
    JSON.stringify(activity);
  return meaning(captured) === meaning(current);
}

/** Do not invent an NPC encounter in a resident's scheduled Zone while evidenced movement puts them elsewhere. */
export function liveSceneEncounterConflicts(village: VillageState, scene: VenueScene | null, now: Date): Set<string> {
  if (!scene || scene.status === "closed" || scene.villageSeed !== village.seed) return new Set();
  const at = new ZonedDate(now, village.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const scheduled = villagePresence(village, at.getHours() * 60 + at.getMinutes(), at);
  const positions = sceneAccessContext(scene).positions ?? {};
  const moved = village.villagers
    .filter(
      (row) =>
        Object.hasOwn(positions, row.characterId) ||
        (scheduled.get(row.characterId)?.id === scene.placeId &&
          scene.continuity?.facts.villagers.some((saved) => saved.characterId === row.characterId)),
    )
    .map((row) => row.characterId);
  return new Set(
    moved.filter(
      (id) =>
        sameSceneRoutine(village, scene, id, now) &&
        (!positions[id] || scheduled.get(id)?.id !== scene.placeId || scheduled.get(id)?.zoneId !== positions[id]),
    ),
  );
}

export function captureSceneAttendance(
  village: VillageState,
  placeId: string,
  now: Date,
  positions?: ReadonlyMap<string, VillagePlaceView>,
): SceneAttendance {
  const venue = findLocation(village, placeId)!;
  const moment = deriveVillageMoment({
    foundedAt: village.foundedAt,
    environment: village.narrative,
    seed: village.seed,
    timeZone: village.timeZone || undefined,
    now,
  });
  const presence = villagePresence(village, moment.minuteOfDay, now, positions);
  const visitor = visitorPosition(village, now, presence, positions);
  return {
    layout: captureSceneLayout(venue),
    capturedAt: now.toISOString(),
    occupants: [
      ...village.villagers.flatMap((villager) => {
        const position = presence.get(villager.characterId);
        if (position?.id !== placeId) return [];
        const block = agendaAt(villager.agenda, moment.minuteOfDay, now);
        const zone =
          resolveVenueZone(venue, position.zoneId ?? "") ??
          chooseAgendaZone(venue, villager.characterId, block, block?.zoneId, village, {
            at: now,
          });
        return [
          {
            characterId: villager.characterId,
            name: villager.cardSnapshot.name,
            doing:
              (block?.zoneId && block.zoneId !== zone.id) || (block?.venueId && block.venueId !== venue.id)
                ? "Taking care of their own affairs"
                : (block?.activity ?? ""),
            zoneId: zone.id,
          },
        ];
      }),
      ...(visitor?.venueId === placeId
        ? [
            {
              characterId: visitor.person.characterId,
              name: visitor.person.cardSnapshot.name,
              doing: visitor.sleeping ? "Turning in for the night" : "Visiting",
              zoneId: visitor.zoneId,
            },
          ]
        : []),
    ],
  };
}
export function sceneZoneOccupants(session: VenueScene, venue: VillageVenue, zoneId: string) {
  const positions = (session.accompanying ?? []).filter((entry) => {
    const destination = resolveVenueZone(venue, entry.zoneId);
    return !!destination; // Captured positions change only through recorded movement.
  });
  const accompanying = positions.filter((entry) => entry.zoneId === zoneId).map((entry) => entry.characterId);
  return (session.sceneAttendance?.occupants ?? []).filter(
    (person) =>
      (person.zoneId === zoneId || accompanying.includes(person.characterId)) &&
      !session.departedIds?.includes(person.characterId) &&
      !positions.some((entry) => entry.characterId === person.characterId && entry.zoneId !== zoneId),
  );
}

export function projectLiveAttendance(village: VillageState, scene: VenueScene, venue: VillageVenue, now: Date) {
  const foundingRoster =
    matchesOpeningGathering(village, scene) &&
    !scene.submissions.some((turn) => turn.id !== "greeting" && turn.acceptance.status === "applied")
      ? village.opening!.residentIds
      : [];
  const gatheringIds = foundingRoster.filter((id) => {
    const resident = village.villagers.find((person) => person.characterId === id);
    const admitted = scene.continuity?.facts.villagers.find((person) => person.characterId === id);
    return resident && (!admitted || admitted.incarnation === resident.incarnation);
  });
  const sameRoutine = (id: string) =>
    (!foundingRoster.includes(id) || gatheringIds.includes(id)) &&
    (!!findNpc(village, id) || sameSceneRoutine(village, scene, id, now));
  const accompanying = (scene.accompanying ?? []).filter((row) => sameRoutine(row.characterId));
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
  const zoneId = scene.zoneId;
  if (
    scene.status === "opening" &&
    zoneId &&
    !scene.submissions.length &&
    gatheringIds.length &&
    openingPlayspace(village, gatheringIds, now).some((row) => row.venueId === venue.id && row.zoneIds.includes(zoneId))
  ) {
    // An unstarted gathering admits its own cast, including saves whose routine refresh already displaced it.
    attendance.occupants = gatheringCast(village, zoneId).filter(
      (person) => gatheringIds.includes(person.characterId) && !scene.departedIds?.includes(person.characterId),
    );
  } else {
    // Keep the admitted positions until the first reply or an actual Agenda transition.
    if (foundingRoster.length)
      attendance.occupants = attendance.occupants.filter(
        (person) => gatheringIds.includes(person.characterId) && !sameRoutine(person.characterId),
      );
    attendance.occupants.push(
      ...(scene.sceneAttendance?.occupants ?? []).filter(
        (person) =>
          !scene.departedIds?.includes(person.characterId) &&
          (!!findNpc(village, person.characterId) ||
            (gatheringIds.includes(person.characterId) && sameRoutine(person.characterId))),
      ),
    );
  }
  return { attendance, accompanying, departedIds: (scene.departedIds ?? []).filter(sameRoutine), sameRoutine };
}
/** Iterate escort dependencies using actual Scene positions, never background schedules. */
export function accessExits(session: VenueScene, village: VillageState, venue: VillageVenue) {
  village = sceneAccessState(village, session);
  venue = sceneLayoutVenue(venue, session);
  const context = sceneAccessContext(session, undefined, village.timeZone),
    positions = { ...context.positions };
  const exits: { actor: string; from: string; to: string; destinationVenueId?: string }[] = [];
  const departures = new Map<string, number>();
  for (const destination of Object.values(session.departureDestinations ?? {}))
    departures.set(destination.venueId, (departures.get(destination.venueId) ?? 0) + 1);
  for (let pass = 0; pass <= Object.keys(positions).length; pass++) {
    let changed = false;
    for (const [actor, from] of Object.entries(positions)) {
      if (!from || from === "exterior") continue;
      const zone = resolveVenueZone(venue, from);
      const decision =
        zone &&
        evaluateZoneAccess(venue, zone, actor, {
          ...context,
          positions,
          unavailable: zone.closed || zoneClosed(village, venue, zone),
        });
      const trespass =
        actor === "player" ? session.trespass : session.actorTrespasses?.find((row) => row.actorId === actor);
      if (
        decision?.allowed ||
        (trespass?.zoneId === from &&
          zone &&
          trespass.reason === decision?.reason &&
          physicallyUsableZone(village, venue, zone, context.at ?? new Date(session.startedAt)))
      )
        continue;
      const previous = actor === "player" ? session.enteredFromZoneId : session.accessPreviousZones?.[actor];
      const fallback = previous && previous !== from ? resolveVenueZone(venue, previous) : undefined;
      const candidates = [fallback, resolveVenueZone(venue, "exterior"), ...(venue.zones ?? [])];
      const to =
        candidates.find(
          (target) =>
            target &&
            target.id !== from &&
            (actor === "player" ||
              actor.startsWith("npc:") ||
              Object.entries(positions).filter(
                ([id, position]) => id !== "player" && !id.startsWith("npc:") && id !== actor && position === target.id,
              ).length < MAX_ZONE_VILLAGERS) &&
            evaluateZoneAccess(venue, target, actor, {
              ...context,
              positions,
              unavailable: zoneClosed(village, venue, target),
              environment: village.narrative,
            }).allowed &&
            // Forced access removal keeps physical egress; voluntary Move still checks every entered Zone.
            !!(
              contactPath(village, venue, from, target.id, actor, session, context.at) ||
              (target.id === "exterior" &&
                physicalVenuePath(
                  { ...village, narrative: undefined },
                  venue,
                  { ...session, zoneId: from },
                  target.id,
                  context.at ?? new Date(session.startedAt),
                ))
            ),
        )?.id ?? "";
      if (!to && actor === "player") continue;
      let destinationVenueId: string | undefined;
      if (!to) {
        const at = context.at ?? new Date(session.startedAt);
        const capturedIds = new Set((session.sceneAttendance?.occupants ?? []).map((person) => person.characterId));
        const otherPositions = [...villagePresence(village, at.getHours() * 60 + at.getMinutes(), at)]
          .filter(([id]) => !capturedIds.has(id))
          .map(([, position]) => position);
        const candidates = [...village.venues].sort(
          (a, b) => Number(venueResidentIds(b).includes(actor)) - Number(venueResidentIds(a).includes(actor)),
        );
        const destination = candidates.find(
          (other) =>
            other.id !== venue.id &&
            otherPositions.filter((position) => position.id === other.id && position.zoneId === "exterior").length +
              (departures.get(other.id) ?? 0) <
              MAX_ZONE_VILLAGERS,
        );
        if (!destination)
          throw conflict("No permitted destination has room for this villager. Scene positions are preserved.");
        destinationVenueId = destination.id;
        departures.set(destination.id, (departures.get(destination.id) ?? 0) + 1);
      }
      positions[actor] = to;
      exits.push({ actor, from, to, ...(destinationVenueId ? { destinationVenueId } : {}) });
      changed = true;
    }
    if (!changed) break;
  }
  return exits;
}
