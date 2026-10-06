import type { VenueClass, VillageVenue } from "./types.js";

export function isHouse(place: Pick<VillageVenue, "occupancy" | "classes">): boolean {
  return (
    place.classes?.includes("residence") ??
    (place.occupancy.playerHome || place.occupancy.residentCharacterId !== null || place.occupancy.homeKind !== null)
  );
}
export function venueClassesFor(place: VillageVenue): VenueClass[] {
  return place.classes?.length ? place.classes : isHouse(place) ? ["residence"] : ["other"];
}
export function venueCapacityFor(place: VillageVenue): number {
  return Math.min(
    4,
    (place.residenceCapacity ?? 1) +
      (place.improvements ?? []).reduce((sum, entry) => sum + (entry?.extraBeds ?? 0), 0),
  );
}
export function venueAssignedCountFor(place: VillageVenue): number {
  return (
    (place.residentIds?.length ?? Number(Boolean(place.occupancy.residentCharacterId))) +
    Number(place.occupancy.playerHome)
  );
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
      state: {
        condition: place.state.condition,
        items: place.state.furniture,
        publicFacts: place.state.publicFacts,
        features: place.state.features ?? [],
        traces: place.state.traces ?? [],
        updatedAt: place.state.updatedAt,
      },
    }
  );
}
