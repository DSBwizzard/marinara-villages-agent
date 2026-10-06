import type { SceneAttendance, VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { agendaAt } from "./agenda-plan.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { contactCanEnter, sceneAccessContext } from "./venue-contact.js";
import { chooseAgendaZone, resolveVenueZone, zoneClosed } from "./venue-zones.js";
import { deriveVillageMoment } from "./village-clock.js";
import { villagerPlaceView } from "./village-projections.js";

export function captureSceneAttendance(village: VillageState, placeId: string, now: Date): SceneAttendance {
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
  const context = sceneAccessContext(session, village),
    positions = { ...context.positions };
  const exits: { actor: string; from: string; to: string }[] = [];
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
      const to =
        fallback &&
        evaluateZoneAccess(venue, fallback, actor, {
          ...context,
          positions,
          unavailable: zoneClosed(village, venue, fallback),
        }).allowed
          ? fallback.id
          : "exterior";
      positions[actor] = to;
      exits.push({ actor, from, to });
      changed = true;
    }
    if (!changed) break;
  }
  return exits;
}
