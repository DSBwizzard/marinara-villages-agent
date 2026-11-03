import type { VenueClass, VillageVenue } from "../../shared/contracts/village.js";

export function isHouse(place: Pick<VillageVenue, "classes">): boolean {
  return place.classes?.includes("residence") ?? false;
}
export function venueClassesFor(place: VillageVenue): VenueClass[] {
  return place.classes?.length ? place.classes : ["other"];
}
export function venueCapacityFor(place: VillageVenue): number {
  return Math.min(4, place.residenceCapacity ?? 1);
}
export function venueAssignedCountFor(place: VillageVenue): number {
  return (place.residentIds?.length ?? 0) + Number(place.occupancy.playerHome);
}
export function venueSpaceFor(
  place: VillageVenue,
  venueClass: VenueClass,
): NonNullable<VillageVenue["spaces"]>[number] {
  return (
    place.spaces?.find((space) => space.venueClass === venueClass) ?? {
      id: venueClass,
      venueClass,
      description: place.description,
      image: place.presentation.image,
      state: place.state,
    }
  );
}
