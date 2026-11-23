import type { VillageVenue } from "../contracts/village.js";
import type { ZoneAccessPolicy } from "./venue-access.js";
export function draftZonePolicy(venue: VillageVenue, area: { ownerId?: string }, personal = false): ZoneAccessPolicy {
  const owner = area.ownerId || "";
  const household = venue.occupancy.playerHome || !!venue.residentIds?.length;
  const restricted = personal || (household && venue.category !== "public-center");
  return {
    mode: restricted ? "permission-required" : "public",
    managerIds: personal && owner ? [owner] : null,
    memberIds: personal && owner ? [owner] : [],
    memberRoles: !personal && household ? ["residents"] : [],
    inviterIds: [],
    visitorHours: restricted ? "always" : "inherit",
    accompanied: false,
  };
}
