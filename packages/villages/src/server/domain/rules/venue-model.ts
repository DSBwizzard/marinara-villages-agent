import type { VillageVenue, VillageVenueSpace } from "../models/world.js";
export const MAX_ZONE_VILLAGERS = 4;
export function venueResidentIds(venue: Pick<VillageVenue, "residentIds" | "occupancy">): string[] {
  return venue.residentIds ?? [];
}
export function venueSleepers(venue: VillageVenue, zoneId: string): string[] {
  return [...venueResidentIds(venue), ...(venue.occupancy.playerHome ? ["player"] : [])].filter(
    (id) => venue.destinations?.[id]?.sleep === zoneId,
  );
}
export function venueAssignedCount(venue: Pick<VillageVenue, "residentIds" | "occupancy">): number {
  return venueResidentIds(venue).length + Number(venue.occupancy.playerHome);
}
export function defaultVenueSpace(id = "space", description = ""): VillageVenueSpace {
  return { id, description, image: null };
}
