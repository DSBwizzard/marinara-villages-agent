import type { VillageVenue, VillageVenueSpace } from "../models/world.js";
export const MAX_VENUE_RESIDENTS = 4;
export const MAX_ZONE_VILLAGERS = 4;
export function venueResidentIds(venue: Pick<VillageVenue, "residentIds" | "occupancy">): string[] {
  return venue.residentIds ?? [];
}
export function venueCapacity(venue: Pick<VillageVenue, "residenceCapacity">): number {
  return Math.min(MAX_VENUE_RESIDENTS, venue.residenceCapacity ?? 0);
}
export function venueAssignedCount(venue: Pick<VillageVenue, "residentIds" | "occupancy">): number {
  return venueResidentIds(venue).length + Number(venue.occupancy.playerHome);
}
export function defaultVenueSpace(id = "space", description = ""): VillageVenueSpace {
  return { id, description, image: null };
}
