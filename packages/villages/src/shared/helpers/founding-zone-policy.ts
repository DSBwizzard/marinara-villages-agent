import type { VillageVenue } from "../contracts/village.js";
import type { ZoneAccessPolicy } from "./venue-access.js";
export function draftZonePolicy(
  venue: VillageVenue,
  area: { ownerId?: string; venueClass: string },
  personal = false,
): ZoneAccessPolicy {
  const owner = area.ownerId || (venue.occupancy.playerHome ? "player" : venue.residentIds?.[0] || "");
  const occupied = venue.occupancy.playerHome || !!venue.residentIds?.length || !!venue.workerIds?.length;
  return {
    mode: occupied && (area.venueClass === "residence" || personal) ? "permission-required" : "public",
    managerIds: personal && owner ? [owner] : null,
    memberIds: personal && owner ? [owner] : [],
    memberRoles:
      !personal && area.venueClass === "residence"
        ? ["residents"]
        : personal && area.venueClass === "workplace"
          ? ["workers"]
          : [],
    inviterIds: [],
    visitorHours: "inherit",
    accompanied: false,
  };
}
