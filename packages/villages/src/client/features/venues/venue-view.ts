import type { VillageVenue } from "../../../shared/contracts/village.js";
import { zoneAccessStatus } from "../../shared/zone-access.js";

/** Layout identity is public; interior details and entry permission remain separate. */
export function venueDisplayZones(place: VillageVenue) {
  return (place.zones ?? []).map((zone) => {
    const { allowed, label } = zoneAccessStatus(zone);
    return {
      ...zone,
      name: zone.kind === "exterior" ? "Entrance" : zone.name,
      allowed,
      accessLabel: label,
    };
  });
}
export type VenueDisplayZone = ReturnType<typeof venueDisplayZones>[number];
