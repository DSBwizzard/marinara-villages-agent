import type {
  VillageState,
  VillageVenue,
  VillageVenueClass,
  VillageVenueImage,
  VillageVenueZone,
  VillageZoneDraft,
} from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { badRequest, conflict } from "./errors.js";
import { readZonePolicy } from "./venue-access.js";
import { defaultVenueSpace, venueResidentIds } from "./venue-model.js";
import { venueZones, zoneClosed } from "./venue-zones.js";

export const VENUE_LAYOUTS = ["exterior", "common", "private", "both"] as const;
export function readBaseVenueLayout(
  value: unknown,
  classes: VillageVenueClass[],
  residentId: string,
  image: (value: unknown) => VillageVenueImage | null,
): VillageVenueZone[] {
  const row = asRecord(value);
  if (!VENUE_LAYOUTS.includes(row.layout as (typeof VENUE_LAYOUTS)[number]))
    throw badRequest("Choose the venue layout: exterior only, Common Space, Private Space, or both.");
  const layout = row.layout;
  const common = layout === "common" || layout === "both";
  const personal = layout === "private" || layout === "both";
  const spaces = Array.isArray(row.spaces) ? row.spaces : [];
  const rooms = Array.isArray(row.privateSpaces) ? row.privateSpaces : [];
  if (
    (!common && spaces.length) ||
    (common && !spaces.length) ||
    (!personal && rooms.length) ||
    (personal && !rooms.length) ||
    spaces.length + rooms.length > 24
  )
    throw badRequest("Provide Zones matching its selected layout, with at most 24 Zones.");
  const result: VillageVenueZone[] = [
    {
      ...defaultVenueSpace(classes[0]!),
      id: "exterior",
      name: "Entrance",
      kind: "exterior",
      purpose: "Arrival and approach",
      description: asTrimmedString(row.description),
      image: image(asRecord(row.presentation).image),
      seen: true,
    },
  ];
  for (const [isPrivate, raw] of [
    ...spaces.map((raw) => [false, raw] as const),
    ...rooms.map((raw) => [true, raw] as const),
  ]) {
    const area = asRecord(raw);
    const role = area.venueClass as VillageVenueClass;
    if (!classes.includes(role)) throw badRequest("Choose one of this venue's Classes for each area.");
    const description = asTrimmedString(area.description);
    if (description.length > 1000 || (!isPrivate && !description))
      throw badRequest("Describe the Common Space in at most 1000 characters.");
    const ownerId = isPrivate && role === "residence" ? residentId || undefined : undefined;
    const controllers = Array.isArray(area.controllerIds)
      ? [...new Set(area.controllerIds.filter((id): id is string => typeof id === "string" && !!id))]
      : [];
    if (area.access === undefined && isPrivate && !["residence", "workplace"].includes(role) && !controllers.length)
      throw badRequest("Choose controllers for the Private Space.");
    result.push({
      ...defaultVenueSpace(role, description),
      id: asTrimmedString(area.id) || (isPrivate ? "private:base" : "common:base"),
      name: asTrimmedString(area.name).slice(0, 100) || "Zone",
      purpose:
        asTrimmedString(area.purpose).slice(0, 240) ||
        (isPrivate ? "Personal space" : "Gathering and everyday activities"),
      access: area.access === undefined ? undefined : readZonePolicy(area.access),
      kind: isPrivate
        ? role === "residence"
          ? "private-residence"
          : role === "workplace"
            ? "staff"
            : "restricted"
        : role === "residence"
          ? "shared-residence"
          : "public",
      ownerId,
      controllerIds: controllers,
      image: image(area.image),
      seen: ownerId === "player",
      preparation:
        isPrivate && (role !== "residence" || (!!ownerId && ownerId !== "player")) ? { status: "pending" } : undefined,
    });
  }
  if (new Set(result.map((zone) => zone.id)).size !== result.length)
    throw badRequest("Every area needs a distinct ID.");
  return result;
}

export function validateLayoutZones(
  venue: VillageVenue,
  drafts: VillageZoneDraft[],
  classes: VillageVenueClass[],
  state: VillageState,
): void {
  if (new Set(drafts.map((zone) => zone.id)).size !== drafts.length)
    throw badRequest("Every physical zone must have a distinct ID.");
  for (const zone of drafts) {
    if (zone.ownerId && zone.kind !== "private-residence")
      throw badRequest("Only residential Private Spaces have assigned residents.");
    if (
      !venue.access &&
      ((zone.kind === "public" && zone.venueClass === "residence") ||
        (zone.kind === "restricted" && ["residence", "workplace"].includes(zone.venueClass)))
    )
      throw badRequest("The area access must follow its associated Class.");
    if (
      !classes.includes(zone.venueClass) ||
      ((zone.kind === "shared-residence" || zone.kind === "private-residence") && zone.venueClass !== "residence") ||
      (zone.kind === "staff" && zone.venueClass !== "workplace")
    )
      throw badRequest("Each zone must be supported by its Venue Class.");
    if (
      zone.kind === "private-residence" &&
      zone.ownerId &&
      !(venueResidentIds(venue).includes(zone.ownerId) || (zone.ownerId === "player" && venue.occupancy.playerHome))
    )
      throw badRequest("Assign a residential Private Space to a current resident, or leave it vacant.");
    if (
      !venue.access &&
      zone.kind === "restricted" &&
      (!zone.controllerIds?.length ||
        zone.controllerIds.some(
          (id) => id !== "player" && !state.villagers.some((person) => person.characterId === id),
        ))
    )
      throw badRequest("Choose current residents as private-area controllers.");
  }
  const owners = drafts.filter((zone) => zone.kind === "private-residence" && zone.ownerId).map((zone) => zone.ownerId);
  if (!venue.access && new Set(owners).size !== owners.length)
    throw badRequest("A resident may be assigned one residential Private Space.");
}

export function assertResidencePrivateDestination(
  state: VillageState,
  venue: VillageVenue,
  characterId: string,
  zoneId = "",
): void {
  if (!zoneId) return;
  const zone = venueZones(venue).find((zone) => zone.id === zoneId);
  if (
    !zone ||
    zoneClosed(state, venue, zone) ||
    zone.kind !== "private-residence" ||
    (zone.ownerId && zone.ownerId !== characterId)
  )
    throw conflict("That residential Private Space is no longer vacant.");
  if (
    state.residences.some(
      (move) =>
        move.characterId !== characterId &&
        move.proposedVenueId === venue.id &&
        move.proposedPrivateZoneId === zoneId &&
        move.status === "moving",
    )
  )
    throw conflict("That Private Space is reserved for another move.");
}
