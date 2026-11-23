import type { VillageVenue } from "../../shared/contracts/village.js";
export function isHouse(place: Pick<VillageVenue, "residentIds" | "occupancy">): boolean {
  return place.occupancy.playerHome || !!place.residentIds?.length;
}
export function venueCapacityFor(place: VillageVenue): number {
  return Math.min(4, place.residenceCapacity ?? 0);
}
export function venueAssignedCountFor(place: VillageVenue): number {
  return (place.residentIds?.length ?? 0) + Number(place.occupancy.playerHome);
}
