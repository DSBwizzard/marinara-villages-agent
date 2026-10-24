import type { VillageVenue } from "../models/world.js";
import { venueResidentIds } from "./venue-model.js";
import { venueZones } from "./venue-zones.js";
import { zoneManagers } from "./venue-access.js";
export function moveConsentingActors(venue: VillageVenue, zoneId: string, moverId: string): string[] {
  const zone = venueZones(venue).find((z) => z.id === zoneId);
  return [
    ...new Set([
      moverId,
      ...venueResidentIds(venue),
      ...(venue.occupancy.playerHome ? ["player"] : []),
      ...(venue.access?.managerIds ?? (venueResidentIds(venue).length ? venueResidentIds(venue) : ["player"])),
      ...(zone ? zoneManagers(venue, zone) : []),
    ]),
  ];
}
