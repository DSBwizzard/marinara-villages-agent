import type { VillageVenue } from "../../../shared/contracts/village.js";
import { zoneAccessLabel } from "../../shared/zone-access.js";

/** Layout identity is public; interior details and entry permission remain separate. */
export function venueDisplayZones(place: VillageVenue) {
  return (place.zones ?? []).map((zone) => {
    const exterior = zone.kind === "exterior";
    const allowed = !zone.closed && (zone.accessView?.decision.allowed ?? false);
    return {
      ...zone,
      name: exterior ? "Entrance" : zone.name,
      allowed,
      accessLabel: zoneAccessLabel(zone, place),
    };
  });
}
export type VenueDisplayZone = ReturnType<typeof venueDisplayZones>[number];
