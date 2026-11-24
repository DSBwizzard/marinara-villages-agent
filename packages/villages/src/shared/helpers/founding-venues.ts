import type { VillageVenue } from "../contracts/village.js";
import { alwaysOpenVisitorHours } from "./venue-access.js";
import { contactNeighborIds, materializeConnections } from "./zone-contact.js";
export const FOUNDING_VENUE_LIMIT = 6;
export function foundingVenueShapeProblem(venues: readonly VillageVenue[]): string {
  if (!venues.length || venues.length > FOUNDING_VENUE_LIMIT) return "Keep one to six starting Venues.";
  if (
    venues.filter((venue) => {
      const zones = materializeConnections([
        { id: "exterior", kind: "exterior" },
        ...(venue.spaces ?? []).map((zone) => ({ ...zone, kind: "public" })),
        ...(venue.privateSpaces ?? []).map((zone) => ({ ...zone, kind: "personal" })),
      ]);
      const open = new Set(
        zones
          .filter(
            (zone) =>
              zone.id === "exterior" ||
              (zone.kind === "public" &&
                !("ownerId" in zone && zone.ownerId) &&
                (!("access" in zone) ||
                  !zone.access ||
                  (zone.access.mode === "public" &&
                    !zone.access.accompanied &&
                    alwaysOpenVisitorHours(
                      zone.access.visitorHours === "always"
                        ? null
                        : zone.access.visitorHours === "inherit"
                          ? (venue.access?.visitorHours ?? null)
                          : zone.access.visitorHours,
                    )))),
          )
          .map((zone) => zone.id),
      );
      return contactNeighborIds(zones, "exterior").some((id) => open.has(id));
    }).length < 2
  )
    return "Keep shared Zones open around the clock in at least two Venues.";
  return "";
}
