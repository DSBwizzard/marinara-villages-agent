import { zoneAppearanceContext, zonePictureBaseline } from "./zone-picture.js";
import {
  applyConnectionEdits,
  changedConnectionIds,
  connectionProblem,
  materializeConnections,
} from "../../../shared/helpers/zone-contact.js";
import type {
  VillageState,
  VillageVenue,
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
export function applyVenueZoneLayout(
  state: VillageState,
  venue: VillageVenue,
  value: unknown,
  sceneActive = false,
): void {
  if (sceneActive) throw conflict("End the active Scene before changing the Zone layout.");
  const row = asRecord(value),
    zones = venueZones(venue);
  const ids = zones.map((zone) => zone.id);
  if (ids.length > 7) throw conflict("A Venue may have at most six Zones besides Entrance.");
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
  const changed = changedConnectionIds(zones, next);
  if (changed.length) {
    if (
      !managesAccess(venue, null, "player") ||
      changed.some((id) => id !== "exterior" && !managesAccess(venue, id, "player"))
    )
      throw conflict("Only the Venue and affected Zone managers may change these connections.");
    if (
      state.projects.some(
        (project) =>
          project.venueId === venue.id &&
          project.lifecycle &&
          !["complete", "cancelled"].includes(project.lifecycle.phase),
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
    venue.spaces = venue.zones.filter((zone) => zone.kind !== "exterior" && zone.kind !== "personal");
    venue.privateSpaces = venue.zones
      .filter((zone) => zone.kind === "personal")
      .map((zone) => ({ ...zone, ownerId: zone.ownerId! }));
  }
}

export const VENUE_LAYOUTS = ["exterior", "common", "private", "both"] as const;
export function readBaseVenueLayout(
  value: unknown,
  residentId: string,
  image: (value: unknown) => VillageVenueImage | null,
  options: { founding?: boolean } = {},
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
  const daylight = (value: Record<string, unknown>) => {
    if (value.dayNight !== undefined && typeof value.dayNight !== "boolean")
      throw badRequest("Day & night must be on or off.");
    return {
      dayNight: value.dayNight !== false,
    };
  };
  const picture = (area: Record<string, unknown>, existing: VillageVenueImage | null) => {
    const reference = image(area.pictureReference) ?? undefined;
    const context = typeof area.pictureContext === "string" ? zonePictureBaseline(area.pictureContext) : "";
    return reference || (existing && area.daylightReady === true && context)
      ? {
          base: existing,
          daylight: !!existing && area.daylightReady === true && !!context,
          context: context || undefined,
          baseline: context || undefined,
          reference,
          referenceAppliedId: reference && area.referenceAppliedId === reference.id ? reference.id : undefined,
          dirty:
            (!!reference && area.referenceAppliedId !== reference.id) ||
            (!!context &&
              context !== zoneAppearanceContext(asTrimmedString(area.description), asTrimmedString(row.form))),
        }
      : undefined;
  };
  const result: VillageVenueZone[] = [
    {
      ...defaultVenueSpace("exterior"),
      ...daylight(row),
      id: "exterior",
      name:
        asTrimmedString(
          (Array.isArray(row.zones) ? row.zones.map(asRecord).find((zone) => zone.id === "exterior") : undefined)?.name,
        ).slice(0, 100) || "Entrance",
      kind: "exterior",
      purpose: "Arrival and approach",
      description: asTrimmedString(row.description),
      image: image(asRecord(row.presentation).image),
      picture: picture(row, image(asRecord(row.presentation).image)),
      freezePicture: row.freezePicture === true,
      seen: true,
    },
  ];
  for (const [isPrivate, raw] of [
    ...spaces.map((raw) => [false, raw] as const),
    ...rooms.map((raw) => [true, raw] as const),
  ]) {
    const area = asRecord(raw);
    const id = asTrimmedString(area.id) || (isPrivate ? "private:base" : "common:base");
    if (Buffer.byteLength(id) > 160) throw badRequest("A Zone ID must fit within 160 UTF-8 bytes.");
    const description = asTrimmedString(area.description);
    const roomSpecification = asTrimmedString(area.roomSpecification ?? (isPrivate ? area.description : ""));
    if (roomSpecification.length > 4000) throw badRequest("Room specification must be at most 4000 characters.");
    if (description.length > 4000 || (!isPrivate && !description))
      throw badRequest("Describe the Common Space in at most 4000 characters.");
    const ownerId = isPrivate
      ? (options.founding ? asTrimmedString(area.ownerId) : asTrimmedString(area.ownerId) || residentId) || undefined
      : undefined;
    const prepareInterior = isPrivate && ownerId !== "player" && !options.founding;
    const controllers = Array.isArray(area.controllerIds)
      ? [...new Set(area.controllerIds.filter((id): id is string => typeof id === "string" && !!id))]
      : [];
    result.push({
      ...defaultVenueSpace(id, prepareInterior ? "" : description),
      ...daylight(area),
      ...(prepareInterior ? { roomSpecification } : {}),
      id,
      connectedTo: Array.isArray(area.connectedTo) ? (area.connectedTo as string[]) : undefined,
      name: asTrimmedString(area.name).slice(0, 100) || "Zone",
      purpose:
        asTrimmedString(area.purpose).slice(0, 240) ||
        (isPrivate ? "Personal space" : "Shared and everyday activities"),
      access: area.access === undefined ? undefined : readZonePolicy(area.access),
      kind: isPrivate
        ? "personal"
        : area.access && asRecord(area.access).mode === "permission-required"
          ? "restricted"
          : "public",
      ownerId,
      controllerIds: controllers,
      image: image(area.image),
      picture: picture(area, image(area.image)),
      freezePicture: area.freezePicture === true,
      seen: ownerId === "player",
      preparation: prepareInterior ? { status: "pending" } : undefined,
    });
  }
  if (new Set(result.map((zone) => zone.id)).size !== result.length)
    throw badRequest("Every area needs a distinct ID.");
  // New authoring gets an initial graph; explicit passages must be valid.
  const connected = materializeConnections(result);
  const problem = connectionProblem(connected);
  if (problem) throw badRequest(problem);
  return connected;
}

export function validateLayoutZones(venue: VillageVenue, drafts: VillageZoneDraft[], state: VillageState): void {
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
  const currentLayout = venueZones(venue);
  for (const zone of drafts) if (zone.connectedTo) zone.connectedTo = zone.connectedTo.filter((id) => allowed.has(id));
  const entrance = currentLayout.find((zone) => zone.id === "exterior")!;
  const combined = [entrance, ...drafts];
  // Partial renovations preserve unchanged passages.
  const resolved = combined.map((zone) => ({
    ...zone,
    connectedTo: zone.connectedTo ?? currentLayout.find((old) => old.id === zone.id)?.connectedTo,
  }));
  const problem = connectionProblem(applyConnectionEdits(resolved, drafts));
  if (problem) throw badRequest(problem);
  for (const zone of drafts) {
    if (zone.ownerId && zone.kind !== "personal") throw badRequest("Only personal rooms have assigned residents.");
    if (
      zone.kind === "personal" &&
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
  const owners = drafts.filter((zone) => zone.kind === "personal" && zone.ownerId).map((zone) => zone.ownerId);
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
    zone.kind !== "personal" ||
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
