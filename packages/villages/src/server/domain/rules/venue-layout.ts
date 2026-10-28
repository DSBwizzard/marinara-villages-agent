import {
  applyConnectionEdits,
  connectionProblem,
  materializeConnections,
} from "../../../shared/helpers/zone-contact.js";
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
import { readZoneLayout, zoneLayoutKey } from "../../../shared/helpers/zone-layout.js";
import { contactNeighborIds } from "../../../shared/helpers/zone-contact.js";
import { managesAccess } from "./venue-access.js";

/** Cosmetic positioning and explicit passages never edit access or an active Scene's captured layout. */
export function applyVenueZoneLayout(state: VillageState, venue: VillageVenue, value: unknown): void {
  const row = asRecord(value),
    zones = materializeConnections(venueZones(venue));
  const ids = zones.map((zone) => zone.id);
  if (ids.length > 7) throw conflict("This legacy Venue needs at most six Zones before editing its layout.");
  if (Object.keys(row).some((key) => !["base", "positions", "connections"].includes(key)))
    throw badRequest("Only Zone positions and connections may be edited here.");
  const positions = readZoneLayout(row.positions, ids);
  if (!positions || Object.keys(positions).length !== ids.length)
    throw badRequest("Place every Zone on the map without overlapping.");
  const connections = row.connections;
  if (
    !Array.isArray(connections) ||
    connections.length !== zones.length ||
    new Set(connections.map((item) => asRecord(item).id)).size !== zones.length ||
    connections.some((item) => !ids.includes(asRecord(item).id as string))
  )
    throw badRequest("Include each current Zone exactly once.");
  const next = connections.map((item) => ({
    id: asRecord(item).id as string,
    connectedTo: asRecord(item).connectedTo as string[],
  }));
  const problem = connectionProblem(next);
  if (problem) throw badRequest(problem.replaceAll("Exterior", "Entrance"));
  const changed = zones.filter(
    (zone) => JSON.stringify(contactNeighborIds(zones, zone.id)) !== JSON.stringify(contactNeighborIds(next, zone.id)),
  );
  if (changed.length) {
    if (
      !managesAccess(venue, null, "player") ||
      changed.some((zone) => zone.id !== "exterior" && !managesAccess(venue, zone.id, "player"))
    )
      throw conflict("Only the Venue and affected Zone managers may change these connections.");
    if (
      state.projects.some(
        (project) => project.venueId === venue.id && project.lifecycle && project.lifecycle.phase !== "complete",
      )
    )
      throw conflict("Finish the current Venue project before changing its connections.");
  }
  if (typeof row.base !== "string" || row.base !== zoneLayoutKey(zones, venue.zoneLayout))
    throw conflict("The layout changed. Reload the Venue before saving.");
  if (venue.constructionStatus === "worksite") throw conflict("The worksite layout belongs to its build project.");
  venue.zoneLayout = positions;
  if (changed.length) {
    venue.zones = zones.map((zone) => ({ ...zone, connectedTo: contactNeighborIds(next, zone.id) }));
    venue.spaces = venue.zones.filter((zone) => ["public", "shared-residence"].includes(zone.kind));
    venue.privateSpaces = venue.zones
      .filter((zone) => zone.kind === "private-residence")
      .map((zone) => ({ ...zone, ownerId: zone.ownerId! }));
  }
}

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
    spaces.length + rooms.length > 6
  )
    throw badRequest("Provide Zones matching its selected layout, with at most six Zones besides Entrance.");
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
    const roomSpecification = asTrimmedString(area.roomSpecification ?? (isPrivate ? area.description : ""));
    if (roomSpecification.length > 1000) throw badRequest("Room specification must be at most 1000 characters.");
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
      ...(isPrivate && ownerId !== "player" ? { roomSpecification, description: "" } : {}),
      id: asTrimmedString(area.id) || (isPrivate ? "private:base" : "common:base"),
      connectedTo: Array.isArray(area.connectedTo) ? (area.connectedTo as string[]) : undefined,
      name: asTrimmedString(area.name).slice(0, 100) || "Zone",
      purpose:
        asTrimmedString(area.purpose).slice(0, 240) ||
        (isPrivate ? "Personal space" : "Shared and everyday activities"),
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
      image: isPrivate && ownerId !== "player" ? null : image(area.image),
      seen: ownerId === "player",
      preparation: isPrivate && ownerId !== "player" ? { status: "pending" } : undefined,
    });
  }
  if (new Set(result.map((zone) => zone.id)).size !== result.length)
    throw badRequest("Every area needs a distinct ID.");
  // Older drafts retain their inferred layout. Explicit drafts must be valid.
  const connected = materializeConnections(result);
  const problem = connectionProblem(connected);
  if (problem) throw badRequest(problem);
  return connected;
}

export function validateLayoutZones(
  venue: VillageVenue,
  drafts: VillageZoneDraft[],
  classes: VillageVenueClass[],
  state: VillageState,
): void {
  if (drafts.length > 6) throw badRequest("A Venue may have at most six Zones besides Entrance.");
  if (new Set(drafts.map((zone) => zone.id)).size !== drafts.length)
    throw badRequest("Every physical zone must have a distinct ID.");
  const allowed = new Set(["exterior", ...drafts.map((zone) => zone.id)]);
  const priorIds = new Set(venueZones(venue).map((zone) => zone.id));
  for (const zone of drafts) {
    if (
      zone.connectedTo &&
      (new Set(zone.connectedTo).size !== zone.connectedTo.length ||
        zone.connectedTo.some((id) => id === zone.id || (!allowed.has(id) && !priorIds.has(id))))
    )
      throw badRequest("Connections must reference other included spaces, without duplicates.");
  }
  const currentLayout = materializeConnections(venueZones(venue));
  for (const zone of drafts) if (zone.connectedTo) zone.connectedTo = zone.connectedTo.filter((id) => allowed.has(id));
  const entrance = currentLayout.find((zone) => zone.id === "exterior")!;
  const combined = [entrance, ...drafts];
  // Old API clients may omit connections; retain exact current connections, or the legacy layout for old new-zone drafts.
  const resolved = combined.map((zone) => ({
    ...zone,
    connectedTo: zone.connectedTo ?? currentLayout.find((old) => old.id === zone.id)?.connectedTo,
  }));
  const problem = connectionProblem(materializeConnections(applyConnectionEdits(resolved, drafts)));
  if (problem) throw badRequest(problem);
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
