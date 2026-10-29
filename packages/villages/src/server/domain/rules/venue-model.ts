import type { VillageVenue, VillageVenueClass, VillageVenueSpace } from "../models/world.js";

export const VENUE_CLASSES: readonly VillageVenueClass[] = ["residence", "workplace", "community", "other"];
export const MAX_VENUE_CLASSES = 2;
export const MAX_VENUE_RESIDENTS = 4;
export const MAX_ZONE_VILLAGERS = 4;

export function venueClasses(venue: Pick<VillageVenue, "classes" | "occupancy">): VillageVenueClass[] {
  if (venue.classes?.length) return venue.classes;
  return venue.occupancy.playerHome || venue.occupancy.residentCharacterId || venue.occupancy.homeKind
    ? ["residence"]
    : ["other"];
}

export function hasVenueClass(
  venue: Pick<VillageVenue, "classes" | "occupancy">,
  venueClass: VillageVenueClass,
): boolean {
  return venueClasses(venue).includes(venueClass);
}

export function venueResidentIds(venue: Pick<VillageVenue, "residentIds" | "occupancy">): string[] {
  return venue.residentIds ?? (venue.occupancy.residentCharacterId ? [venue.occupancy.residentCharacterId] : []);
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
    state: { revision: 0, recent: null, updatedAt: "" },
  };
}

export function venueSpaces(venue: VillageVenue): VillageVenueSpace[] {
  return venue.layoutVersion === 1 || venue.spaces?.length
    ? (venue.spaces ?? [])
    : venueClasses(venue).map((venueClass) => ({
        ...defaultVenueSpace(venueClass, venue.description),
        image: venue.presentation.image,
        state: venue.state,
      }));
}

/** Present a single scene through legacy readers without merging private and public rooms. */
export function venueInSpace(venue: VillageVenue, venueClass: VillageVenueClass): VillageVenue {
  const space = venueSpaces(venue).find((entry) => entry.venueClass === venueClass);
  if (!space) return venue;
  return {
    ...venue,
    description: space.description,
    presentation: { ...venue.presentation, image: space.image ?? venue.presentation.image },
    state: space.state,
  };
}

/** Resolve the exact area the player may observe, without leaking another room's state. */
export function venueInArea(
  venue: VillageVenue,
  area: "outside" | "shared" | "private" | "public",
  spaceClass?: VillageVenueClass,
  privateOwnerId = "",
): VillageVenue {
  if (area === "outside") {
    const exterior = venue.zones?.find((zone) => zone.kind === "exterior");
    const state = exterior?.state ?? venue.exteriorState ?? defaultVenueSpace("residence").state;
    return {
      ...venue,
      description: exterior?.description ?? venue.description,
      presentation: { ...venue.presentation, image: exterior ? exterior.image : venue.presentation.image },
      state,
    };
  }
  if (area === "private") {
    const space = venue.privateSpaces?.find((entry) => entry.ownerId === privateOwnerId);
    if (!space) return venueInArea(venue, "outside");
    return {
      ...venue,
      description: space.description,
      presentation: { ...venue.presentation, image: space.image },
      state: space.state,
    };
  }
  return spaceClass ? venueInSpace(venue, spaceClass) : venue;
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
