import type { VillageVenue } from "../../../shared/contracts/village.js";
import { personalSpaceDraft } from "./villages-founding-editor.js";
import { draftZonePolicy } from "./villages-founding-zones.js";

export type InactiveFoundingZones = {
  common?: NonNullable<VillageVenue["spaces"]>;
  private?: NonNullable<VillageVenue["privateSpaces"]>;
};

export function startingZone(venue: VillageVenue, personal: boolean) {
  const gathering = venue.category === "public-center";
  const role = gathering ? "gathering" : "residence";
  const ownerId = personal ? (venue.occupancy.playerHome ? "player" : (venue.occupancy.residentCharacterId ?? "")) : "";
  return {
    ...personalSpaceDraft(),
    id: personal ? "private:base" : "common:base",
    name: personal ? "Private Space" : "Common Space",
    purpose: "",
    ownerId,
    venueClass: role as "gathering" | "residence",
    access: draftZonePolicy(venue, { ownerId, venueClass: role }, personal),
  };
}

/** Inclusion changes retain complete authored collections outside the submitted Venue. */
export function includeFoundingZone(
  venue: VillageVenue,
  inactive: InactiveFoundingZones,
  personal: boolean,
  included: boolean,
) {
  const common = venue.spaces ?? [];
  const privateSpaces = venue.privateSpaces ?? [];
  if (venue.category === "public-center" && (personal || !included))
    return {
      venue,
      inactive,
      problem: "The starting Gathering Place requires public Common Space and has no Private Space.",
    };
  if (!included && !(personal ? common : privateSpaces).length)
    return { venue, inactive, problem: "At least one Common or Private Space is required." };
  const saved = { ...inactive };
  if (personal) saved.private = included ? saved.private : privateSpaces;
  else saved.common = included ? saved.common : common;
  const spaces = personal
    ? common
    : included
      ? saved.common?.length
        ? saved.common
        : [startingZone(venue, false)]
      : [];
  const rooms = personal
    ? included
      ? saved.private?.length
        ? saved.private
        : [startingZone(venue, true)]
      : []
    : privateSpaces;
  return {
    venue: {
      ...venue,
      spaces,
      privateSpaces: rooms,
      layoutVersion: 1 as const,
      layout: spaces.length ? (rooms.length ? ("both" as const) : ("common" as const)) : ("private" as const),
    },
    inactive: saved,
    problem: "",
  };
}

/** Only unfounded drafts use the new template; never rewrite a founded world. */
export function resumeFoundingVenue(venue: VillageVenue, inactive: InactiveFoundingZones) {
  if (venue.category !== "public-center") return { venue, inactive };
  const saved = { ...inactive, ...(venue.privateSpaces?.length ? { private: venue.privateSpaces } : {}) };
  return {
    inactive: saved,
    venue: {
      ...venue,
      classes: ["gathering"] as VillageVenue["classes"],
      layoutVersion: 1 as const,
      layout: "common" as const,
      spaces: (venue.spaces?.length ? venue.spaces : [startingZone(venue, false)]).map((zone) => ({
        ...zone,
        ownerId: "",
        controllerIds: [],
        venueClass: "gathering" as const,
        access: draftZonePolicy(venue, { venueClass: "gathering" }),
      })),
      privateSpaces: [],
    },
  };
}
