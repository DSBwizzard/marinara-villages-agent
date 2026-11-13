import type { VillageVenue } from "../../../shared/contracts/village.js";

/** Layout identity is public; interior details and entry permission remain separate. */
export function venueDisplayZones(place: VillageVenue) {
  return (place.zones ?? []).map((zone) => {
    const exterior = zone.kind === "exterior";
    const allowed = !zone.closed && (zone.accessView?.decision.allowed ?? false);
    const restricted = !exterior && zone.accessView?.decision.mode === "permission-required";
    const accessLabel = zone.closed
      ? "Closed for renovation"
      : restricted || zone.kind === "private-residence"
        ? "Permission required"
        : allowed
          ? "Open to you"
          : "Currently unavailable";
    return {
      ...zone,
      name: exterior ? "Entrance" : zone.name,
      allowed,
      accessLabel,
    };
  });
}
export type VenueDisplayZone = ReturnType<typeof venueDisplayZones>[number];
