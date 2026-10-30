import { openingPresence } from "./opening-presence.js";
import { captureSceneLayout } from "./scene-layout.js";
import type { SceneAttendance, VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { agendaAt } from "./agenda-plan.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { contactCanEnter, contactPath, sceneAccessContext } from "./venue-contact.js";
import { sceneAccessState, sceneLayoutVenue } from "./scene-layout.js";
import { MAX_ZONE_VILLAGERS } from "./venue-model.js";
import { conflict } from "./errors.js";
import { venueResidentIds } from "./venue-model.js";
import { chooseAgendaZone, resolveVenueZone, zoneClosed } from "./venue-zones.js";
import { deriveVillageMoment } from "./village-clock.js";
import { villagePresence } from "./village-projections.js";

export function captureSceneAttendance(village: VillageState, placeId: string, now: Date): SceneAttendance {
  const venue = village.venues.find((entry) => entry.id === placeId)!;
  const moment = deriveVillageMoment({
    foundedAt: village.foundedAt,
    environment: village.narrative,
    seed: village.seed,
    timeZone: village.timeZone || undefined,
    now,
  });
  const presence = villagePresence(village, moment.minuteOfDay, now);
  return {
    layout: captureSceneLayout(venue),
    capturedAt: now.toISOString(),
    occupants: village.villagers.flatMap((villager) => {
      const position = presence.get(villager.characterId);
      if (position?.id !== placeId) return [];
      const block = agendaAt(villager.agenda, moment.minuteOfDay, now, villager.ingestSchedule !== false);
      const staged = openingPresence(village, villager.characterId);
      const zone =
        resolveVenueZone(venue, position.zoneId ?? "") ??
        chooseAgendaZone(venue, villager.characterId, block?.activity, block?.zoneId, village, {
          at: now,
          relationships: village.relationshipContext,
        });
      return [
        {
          characterId: villager.characterId,
          name: villager.cardSnapshot.name,
          doing:
            staged?.activity ??
            ((block?.zoneId && block.zoneId !== zone.id) || (block?.venueId && block.venueId !== venue.id)
              ? "Taking care of their own affairs"
              : (block?.activity ?? "")),
          zoneId: zone.id,
        },
      ];
    }),
  };
}
export function sceneZoneOccupants(session: VenueScene, village: VillageState, venue: VillageVenue, zoneId: string) {
  const positions = (session.accompanying ?? []).filter((entry) => {
    const destination = resolveVenueZone(venue, entry.zoneId);
    if (venue.access) return !!destination; // Captured positions change only through recorded movement.
    return !!destination && contactCanEnter(village, venue, destination.id, entry.characterId);
  });
  const accompanying = positions.filter((entry) => entry.zoneId === zoneId).map((entry) => entry.characterId);
  return (session.sceneAttendance?.occupants ?? []).filter(
    (person) =>
      (person.zoneId === zoneId || accompanying.includes(person.characterId)) &&
      !session.departedIds?.includes(person.characterId) &&
      !positions.some((entry) => entry.characterId === person.characterId && entry.zoneId !== zoneId),
  );
}
/** Iterate escort dependencies using actual Scene positions, never background schedules. */
export function accessExits(session: VenueScene, village: VillageState, venue: VillageVenue) {
  village = sceneAccessState(village, session);
  venue = sceneLayoutVenue(venue, session);
  const context = sceneAccessContext(session, village),
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
      if (
        zone &&
        evaluateZoneAccess(venue, zone, actor, { ...context, positions, unavailable: zoneClosed(village, venue, zone) })
          .allowed
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
              Object.entries(positions).filter(
                ([id, position]) => id !== "player" && id !== actor && position === target.id,
              ).length < MAX_ZONE_VILLAGERS) &&
            evaluateZoneAccess(venue, target, actor, {
              ...context,
              positions,
              unavailable: zoneClosed(village, venue, target),
              environment: village.narrative,
            }).allowed &&
            !!contactPath(village, venue, from, target.id, actor, session),
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
