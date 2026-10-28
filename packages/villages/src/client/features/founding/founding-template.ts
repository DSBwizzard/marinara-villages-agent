import type { VillageVenue } from "../../../shared/contracts/village.js";
import { materializeConnections } from "../../../shared/helpers/zone-contact.js";
import { resolveZoneLayout, type ZoneLayout } from "../../../shared/helpers/zone-layout.js";
import { personalSpaceDraft } from "./villages-founding-editor.js";
import { draftZonePolicy } from "./villages-founding-zones.js";

export type InactiveFoundingZones = {
  zoneLayout?: ZoneLayout;
  common?: NonNullable<VillageVenue["spaces"]>;
  private?: NonNullable<VillageVenue["privateSpaces"]>;
};

export function startingZone(venue: VillageVenue, personal: boolean) {
  const community = venue.category === "public-center";
  const role = community ? "community" : "residence";
  const ownerId = personal ? (venue.occupancy.playerHome ? "player" : (venue.occupancy.residentCharacterId ?? "")) : "";
  return {
    ...personalSpaceDraft(),
    id: personal ? "private:base" : "common:base",
    name: personal ? "Private Space" : "Common Space",
    purpose: personal ? "Rest and personal activities" : community ? "Community gatherings" : "Everyday activities",
    description: personal
      ? venue.occupancy.playerHome
        ? "A private space for rest."
        : ""
      : community
        ? "A shared space for the community."
        : "A shared space in the residence.",
    ownerId,
    venueClass: role as "community" | "residence",
    access: draftZonePolicy(venue, { ownerId, venueClass: role }, personal),
  };
}

/** Preserve inferred legacy passages before adding an explicitly connected Zone. */
export function addFoundingZone(venue: VillageVenue, personal: boolean, id: string): VillageVenue {
  if (
    (personal && venue.category === "public-center") ||
    (venue.spaces?.length ?? 0) + (venue.privateSpaces?.length ?? 0) >= 6
  )
    return venue;
  const graph = materializeConnections([
    { id: "exterior", kind: "exterior", connectedTo: undefined as string[] | undefined },
    ...(venue.spaces ?? []).map((zone) => ({ ...zone, kind: "public" })),
    ...(venue.privateSpaces ?? []).map((zone) => ({ ...zone, kind: "restricted" })),
  ]);
  const connections = new Map(graph.map((zone) => [zone.id, zone.connectedTo]));
  const common = (venue.spaces ?? []).map((zone) => ({ ...zone, connectedTo: connections.get(zone.id) }));
  const privateZones = (venue.privateSpaces ?? []).map((zone) => ({ ...zone, connectedTo: connections.get(zone.id) }));
  const added = { ...startingZone(venue, personal), id, name: "New Zone", connectedTo: ["exterior"] };
  const spaces = personal ? common : [...common, added];
  const privateSpaces = personal ? [...privateZones, added] : privateZones;
  return {
    ...venue,
    spaces,
    privateSpaces,
    layout: spaces.length ? (privateSpaces.length ? "both" : "common") : "private",
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
      problem: "The starting Community Place requires public Common Space and has no Private Space.",
    };
  if (!included && !(personal ? common : privateSpaces).length)
    return { venue, inactive, problem: "At least one Common or Private Space is required." };
  const saved = { ...inactive, zoneLayout: { ...inactive.zoneLayout, ...venue.zoneLayout } };
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
  const ids = ["exterior", ...spaces.map((zone) => zone.id), ...rooms.map((zone) => zone.id)];
  const prune = <T extends { connectedTo?: string[] }>(zone: T): T =>
    zone.connectedTo
      ? {
          ...zone,
          connectedTo: zone.connectedTo.filter((id) => ids.includes(id)),
        }
      : zone;
  return {
    venue: {
      ...venue,
      spaces: spaces.map(prune),
      privateSpaces: rooms.map(prune),
      zoneLayout: resolveZoneLayout(ids, saved.zoneLayout),
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
  const saved = {
    ...inactive,
    ...(venue.privateSpaces?.length ? { private: venue.privateSpaces } : {}),
    zoneLayout: { ...inactive.zoneLayout, ...venue.zoneLayout },
  };
  const common = venue.spaces?.length ? venue.spaces : [startingZone(venue, false)];
  const ids = ["exterior", ...common.map((zone) => zone.id)];
  return {
    inactive: saved,
    venue: {
      ...venue,
      classes: ["community"] as VillageVenue["classes"],
      layoutVersion: 1 as const,
      layout: "common" as const,
      spaces: common.map((zone) => ({
        ...zone,
        ...(zone.connectedTo ? { connectedTo: zone.connectedTo.filter((id) => ids.includes(id)) } : {}),
        ownerId: "",
        controllerIds: [],
        venueClass: "community" as const,
        access: draftZonePolicy(venue, { venueClass: "community" }),
      })),
      privateSpaces: [],
      zoneLayout: venue.zoneLayout ? resolveZoneLayout(ids, venue.zoneLayout) : undefined,
    },
  };
}
