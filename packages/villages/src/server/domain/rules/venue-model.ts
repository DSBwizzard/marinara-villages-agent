import type { VillageVenue, VillageVenueClass, VillageVenueSpace } from "../models/world.js";

export const VENUE_CLASSES: readonly VillageVenueClass[] = ["residence", "workplace", "community", "other"];
export const MAX_VENUE_CLASSES = 2;
export const MAX_VENUE_RESIDENTS = 4;
export const MAX_ZONE_VILLAGERS = 4;

export function venueClasses(venue: Pick<VillageVenue, "classes">): VillageVenueClass[] {
  return venue.classes?.length ? venue.classes : ["other"];
}

export function hasVenueClass(
  venue: Pick<VillageVenue, "classes" | "occupancy">,
  venueClass: VillageVenueClass,
): boolean {
  return venueClasses(venue).includes(venueClass);
}

export function venueResidentIds(venue: Pick<VillageVenue, "residentIds" | "occupancy">): string[] {
  return venue.residentIds ?? [];
}

export function venueCapacity(venue: Pick<VillageVenue, "residenceCapacity">): number {
  return Math.min(MAX_VENUE_RESIDENTS, venue.residenceCapacity ?? 1);
}

export function venueAssignedCount(venue: Pick<VillageVenue, "residentIds" | "occupancy">): number {
  return venueResidentIds(venue).length + Number(venue.occupancy.playerHome);
}

export function defaultVenueSpace(venueClass: VillageVenueClass, description = ""): VillageVenueSpace {
  return {
    id: venueClass,
    venueClass,
    description,
    image: null,
  };
}

export function validVenueClasses(value: unknown): value is VillageVenueClass[] {
  return (
    Array.isArray(value) &&
    value.length >= 1 &&
    value.length <= MAX_VENUE_CLASSES &&
    value.every((entry) => VENUE_CLASSES.includes(entry)) &&
    new Set(value).size === value.length
  );
}
