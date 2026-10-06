import type { VillageVenue, VillageVenueClass, VillageVenueImprovement, VillageVenueSpace } from "../models/world.js";

export const VENUE_CLASSES: readonly VillageVenueClass[] = ["residence", "workplace", "gathering", "other"];
export const MAX_VENUE_CLASSES = 2;
export const MAX_VENUE_IMPROVEMENTS = 2;
export const MAX_VENUE_RESIDENTS = 4;
export const MAX_VENUE_PRESENT_VILLAGERS = 4;

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

export function venueCapacity(venue: Pick<VillageVenue, "residenceCapacity" | "improvements">): number {
  const base = venue.residenceCapacity ?? 1;
  const bonus = (venue.improvements ?? []).reduce((sum, entry) => sum + (entry?.extraBeds ?? 0), 0);
  return Math.min(MAX_VENUE_RESIDENTS, base + bonus);
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
    state: { condition: "", items: [], publicFacts: [], features: [], traces: [], updatedAt: "" },
  };
}

export function venueSpaces(venue: VillageVenue): VillageVenueSpace[] {
  return venue.layoutVersion === 1 || venue.spaces?.length
    ? (venue.spaces ?? [])
    : venueClasses(venue).map((venueClass) => ({
        ...defaultVenueSpace(venueClass, venue.description),
        image: venue.presentation.image,
        state: {
          condition: venue.state.condition,
          items: venue.state.furniture,
          publicFacts: venue.state.publicFacts,
          features: venue.state.features ?? [],
          traces: venue.state.traces ?? [],
          updatedAt: venue.state.updatedAt,
        },
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
    state: {
      ...venue.state,
      condition: space.state.condition,
      furniture: space.state.items,
      publicFacts: space.state.publicFacts,
      features: space.state.features,
      traces: space.state.traces,
      updatedAt: space.state.updatedAt,
    },
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
    const state = venue.exteriorState ?? defaultVenueSpace("residence").state;
    return {
      ...venue,
      description: venue.form || `The approach to ${venue.name}.`,
      state: {
        ...venue.state,
        condition: state.condition,
        furniture: state.items,
        publicFacts: state.publicFacts,
        features: state.features,
        traces: state.traces,
        updatedAt: state.updatedAt,
      },
    };
  }
  if (area === "private") {
    const space = venue.privateSpaces?.find((entry) => entry.ownerId === privateOwnerId);
    if (!space) return venueInArea(venue, "outside");
    return {
      ...venue,
      description: space.description,
      presentation: { ...venue.presentation, image: space.image },
      state: {
        ...venue.state,
        condition: space.state.condition,
        furniture: space.state.items,
        publicFacts: space.state.publicFacts,
        features: space.state.features,
        traces: space.state.traces,
        updatedAt: space.state.updatedAt,
      },
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

export function validVenueImprovements(value: unknown): value is (VillageVenueImprovement | null)[] {
  return (
    Array.isArray(value) &&
    value.length === MAX_VENUE_IMPROVEMENTS &&
    value.every(
      (entry) =>
        entry === null ||
        (typeof entry === "object" &&
          typeof entry.id === "string" &&
          typeof entry.title === "string" &&
          typeof entry.description === "string" &&
          typeof entry.extraBeds === "number" &&
          Number.isInteger(entry.extraBeds) &&
          entry.extraBeds >= 0 &&
          entry.extraBeds <= MAX_VENUE_RESIDENTS - 1),
    )
  );
}
