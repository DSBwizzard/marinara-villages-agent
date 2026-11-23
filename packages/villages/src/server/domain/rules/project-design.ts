import { initializeVenueAccess } from "./venue-access.js";
import { applyConnectionEdits } from "../../../shared/helpers/zone-contact.js";
import { accessibleVenueRoute } from "./venue-path.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type {
  VillageState,
  VillageVenue,
  VillageProject,
  VillageProjectChange,
  VillageProjectLifecycle,
  VillageZoneDraft,
} from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { badRequest, conflict } from "./errors.js";
import { venueResidentIds, defaultVenueSpace } from "./venue-model.js";
import { venueZones } from "./venue-zones.js";
import { validateLayoutZones } from "./venue-layout.js";
import { readConnectionIds } from "./space-connections.js";
import { boundText } from "./prompt-preset.js";
import { MAX_PHYSICAL_DESIGN_LENGTH } from "../../../shared/helpers/project-design.js";
import { roomWasRemoved, WORKSITE_DESCRIPTION } from "./native-continuity.js";
import { captureProjectRoomEdits } from "./project-room-edits.js";
import { validateVenueWork } from "./venue-work.js";

export function readRenovationChange(
  state: VillageState,
  venue: VillageVenue,
  value: unknown,
  at: Date,
  prior?: VillageProjectLifecycle,
) {
  const row = asRecord(value);
  if (row.expectedZoneIds !== undefined) {
    const currentIds = venueZones(venue)
      .filter((zone) => zone.kind !== "exterior")
      .map((zone) => zone.id)
      .sort();
    if (
      !Array.isArray(row.expectedZoneIds) ||
      JSON.stringify([...row.expectedZoneIds].sort()) !== JSON.stringify(currentIds)
    )
      throw conflict("The Venue layout changed. Open the Zone again to plan this renovation.");
  }
  if (row.form !== undefined && (typeof row.form !== "string" || row.form.length > MAX_PHYSICAL_DESIGN_LENGTH))
    throw badRequest("Physical form must be at most 2000 characters.");
  const form = typeof row.form === "string" ? row.form.trim() : undefined;
  const capacity = Number(row.capacity ?? venue.residenceCapacity ?? 0);
  if (!Number.isInteger(capacity) || capacity < 0 || capacity > 4)
    throw badRequest("Residence capacity must be from zero to four.");
  const rawZones =
    row.zones ??
    prior?.change?.zones ??
    venueZones(venue)
      .filter((zone) => zone.kind !== "exterior")
      .map((zone) => ({ ...zone, description: "", purpose: undefined, roomSpecification: undefined }));
  if (!Array.isArray(rawZones) || rawZones.length > 6)
    throw badRequest("A Venue may have at most six Zones besides Entrance.");
  const zones: VillageZoneDraft[] = rawZones.map((value) => {
    const raw = asRecord(value),
      id = asTrimmedString(raw.id);
    const previous = venueZones(venue).find((zone) => zone.id === id);
    const kind = raw.kind === undefined ? (previous?.kind ?? "") : asTrimmedString(raw.kind),
      name = raw.name === undefined ? (previous?.name ?? "") : boundText(raw.name, 100).trim(),
      ownerId = raw.ownerId === undefined ? previous?.ownerId : asTrimmedString(raw.ownerId) || undefined;
    if (
      !id ||
      Buffer.byteLength(id) > 160 ||
      id === "exterior" ||
      !name ||
      !["public", "personal", "restricted"].includes(kind)
    )
      throw badRequest("Give each Zone a unique ID, name and kind.");
    if (previous?.ownerId && (ownerId !== previous.ownerId || kind !== previous.kind))
      throw conflict("Resident moves assign occupied rooms.");
    const description = previous ? "" : asTrimmedString(raw.description);
    const purpose =
      raw.purpose === undefined
        ? prior?.change?.zones?.find((zone) => zone.id === id)?.purpose
        : boundText(raw.purpose, 240);
    const roomSpecification = asTrimmedString(raw.roomSpecification);
    if (roomSpecification.length > 4000) throw badRequest("Room specification must be at most 4000 characters.");
    if (description.length > 4000) throw badRequest("Zone description must be at most 4000 characters.");
    return {
      id,
      name,
      kind: kind as VillageZoneDraft["kind"],
      description,
      ...(purpose !== undefined ? { purpose } : {}),
      ...(raw.roomSpecification !== undefined ? { roomSpecification } : {}),
      ownerId,
      controllerIds:
        raw.controllerIds === undefined
          ? previous?.controllerIds
          : Array.isArray(raw.controllerIds)
            ? raw.controllerIds.filter((id): id is string => typeof id === "string")
            : [],
      connectedTo: raw.connectedTo === undefined ? previous?.connectedTo : readConnectionIds(raw.connectedTo),
    };
  });
  const change: VillageProjectChange = {
    capacity,
    zones,
    detail: boundText(row.detail, 2000).trim(),
    ...(form !== undefined && form !== (venue.form ?? "") ? { form } : {}),
  };
  if (!change.detail) throw badRequest("Describe the physical change.");
  validateRenovationDesign(state, venue, change, at);
  const retainedZones = new Set(
    venueZones(venue)
      .filter((zone) => zone.kind === "exterior" || zones.some((draft) => draft.id === zone.id))
      .map(({ id }) => id),
  );
  const { roomEdits, roomBasis } = captureProjectRoomEdits(
    state,
    venue,
    retainedZones,
    row.roomEdits,
    at.toISOString(),
    prior,
  );
  if (roomEdits) change.roomEdits = roomEdits;
  return { change, roomBasis };
}
export function effectiveRenovationChange(
  venue: VillageVenue,
  change: VillageProjectChange,
  changedIds: readonly string[],
): VillageProjectChange {
  return {
    ...change,
    zones: change.zones?.map((draft) =>
      !changedIds.includes(draft.id) ? (venue.zones?.find((zone) => zone.id === draft.id) ?? draft) : draft,
    ),
  };
}
export function validateRenovationDesign(
  state: VillageState,
  venue: VillageVenue,
  change: VillageProjectChange,
  at: Date,
): void {
  const residents = venueResidentIds(venue).length + Number(venue.occupancy.playerHome);
  if (residents > (change.capacity ?? venue.residenceCapacity ?? 0))
    throw conflict("Keep room for the current residents.");
  const zones = change.zones ?? venueZones(venue).filter((zone) => zone.kind !== "exterior");
  const liveZones = new Set(venueZones(venue).map((zone) => zone.id));
  if (zones.some((zone) => !liveZones.has(zone.id) && roomWasRemoved(state, venue.id, zone.id)))
    throw conflict("A removed Zone ID cannot be reused. Add a new Zone.");
  for (const old of venueZones(venue).filter((zone) => zone.kind === "personal" && zone.ownerId)) {
    if (!zones.some((zone) => zone.id === old.id && zone.kind === old.kind && zone.ownerId === old.ownerId))
      throw conflict("Move residents before removing or transferring their rooms.");
  }
  validateLayoutZones(venue, zones, state);
  const proposed = structuredClone(venue);
  proposed.zones = applyConnectionEdits(
    [
      proposed.zones!.find((zone) => zone.kind === "exterior")!,
      ...zones.map((draft) => {
        const previous = proposed.zones!.find((zone) => zone.id === draft.id);
        return {
          ...defaultVenueSpace(draft.id),
          ...previous,
          ...draft,
          access:
            previous && (previous.kind !== draft.kind || previous.ownerId !== draft.ownerId)
              ? undefined
              : previous?.access,
        };
      }),
    ],
    zones,
  );
  initializeVenueAccess(proposed);
  for (const work of venue.access?.work ?? []) validateVenueWork(proposed, work);
  for (const actor of [...venueResidentIds(venue), ...(venue.occupancy.playerHome ? ["player"] : [])]) {
    for (const role of ["home", "sleep"] as const) {
      const id = venue.destinations?.[actor]?.[role];
      if (!id && role === "home") continue;
      const zone = proposed.zones.find((zone) => zone.id === id);
      // Check the permanent layout and access independently of temporary damage or construction.
      if (
        !zone ||
        zone.kind === "exterior" ||
        (zone.ownerId && zone.ownerId !== actor && venue.destinations?.[actor]?.sleep !== zone.id) ||
        !accessibleVenueRoute({ projects: [] }, proposed, actor, zone.id, new ZonedDate(at, state.timeZone), true)
      )
        throw conflict(
          "Keep every household member's home and sleeping destination accessible. Choose another destination before removing or converting its Zone.",
        );
    }
  }
}
export function plannedVenue(project: VillageProject): VillageVenue {
  const draft = project.venueDraft!;
  const entrance = {
    ...defaultVenueSpace("exterior", WORKSITE_DESCRIPTION),
    id: "exterior",
    name: "Entrance",
    kind: "exterior" as const,
    connectedTo: [],
    seen: true,
  };
  const venue: VillageVenue = {
    id: "site:" + project.id,
    name: draft.name,
    residenceCapacity: project.plan?.capacity ?? 0,
    buildProjectId: project.id,
    constructionStatus: "worksite",
    description: WORKSITE_DESCRIPTION,
    category: "",
    layoutVersion: 1,
    zones: [entrance],
    spaces: [],
    privateSpaces: [],
    residentIds: [],
    workerIds: [],
    presentation: { mapId: draft.position.mapId ?? "", image: null, x: draft.position.x, y: draft.position.y },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    capabilities: [],
  };
  initializeVenueAccess(venue);
  return venue;
}
