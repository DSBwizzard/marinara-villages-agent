import type {
  VillageState,
  VillageVenue,
  VillageProject,
  VillageProjectChange,
  VillageZoneDraft,
  VillageVenueClass,
} from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { badRequest, conflict } from "./errors.js";
import { validVenueClasses, venueResidentIds, defaultVenueSpace } from "./venue-model.js";
import { venueZones } from "./venue-zones.js";
import { validateLayoutZones } from "./venue-layout.js";
import { readConnectionIds } from "./space-connections.js";
import { boundText } from "./prompt-preset.js";

export function readRenovationChange(state: VillageState, venue: VillageVenue, value: unknown): VillageProjectChange {
  const row = asRecord(value);
  const classes = row.classes ?? venue.classes;
  const capacity = Number(row.capacity ?? venue.residenceCapacity ?? 1);
  if (!validVenueClasses(classes)) throw badRequest("Choose one or two Venue Classes.");
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 4)
    throw badRequest("Residence capacity must be from one to four.");
  const rawZones =
    row.zones ??
    venueZones(venue)
      .filter((zone) => zone.kind !== "exterior")
      .map((zone) => ({ ...zone, description: "", roomSpecification: undefined }));
  if (!Array.isArray(rawZones) || rawZones.length > 6)
    throw badRequest("A Venue may have at most six Zones besides Entrance.");
  const zones: VillageZoneDraft[] = rawZones.map((value) => {
    const raw = asRecord(value),
      id = asTrimmedString(raw.id);
    const previous = venueZones(venue).find((zone) => zone.id === id);
    const kind = asTrimmedString(raw.kind),
      name = boundText(raw.name, 100).trim();
    if (
      !id ||
      id === "exterior" ||
      !name ||
      !["public", "shared-residence", "private-residence", "staff", "restricted"].includes(kind)
    )
      throw badRequest("Give each Zone a unique ID, name and kind.");
    if (previous?.ownerId && (raw.ownerId !== previous.ownerId || kind !== previous.kind))
      throw conflict("Resident moves assign occupied rooms.");
    const description = asTrimmedString(raw.description);
    const roomSpecification = asTrimmedString(raw.roomSpecification);
    if (roomSpecification.length > 4000) throw badRequest("Room specification must be at most 4000 characters.");
    if (description.length > 4000) throw badRequest("Zone description must be at most 4000 characters.");
    return {
      id,
      name,
      kind: kind as VillageZoneDraft["kind"],
      venueClass: raw.venueClass as VillageVenueClass,
      description,
      preserveDescription: !description && !!previous,
      purpose: boundText(raw.purpose, 240),
      ...(raw.roomSpecification !== undefined ? { roomSpecification } : {}),
      ownerId: asTrimmedString(raw.ownerId) || undefined,
      controllerIds: Array.isArray(raw.controllerIds)
        ? raw.controllerIds.filter((id): id is string => typeof id === "string")
        : [],
      connectedTo: raw.connectedTo === undefined ? previous?.connectedTo : readConnectionIds(raw.connectedTo),
    };
  });
  const change = { classes, capacity, zones, detail: boundText(row.detail, 2000).trim() } as VillageProjectChange;
  if (!change.detail) throw badRequest("Describe the physical change.");
  validateRenovationDesign(state, venue, change);
  return change;
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
export function validateRenovationDesign(state: VillageState, venue: VillageVenue, change: VillageProjectChange): void {
  const classes = change.classes ?? venue.classes ?? ["other"];
  if (!validVenueClasses(classes)) throw conflict("Choose one or two Venue Classes.");
  const residents = venueResidentIds(venue).length + Number(venue.occupancy.playerHome);
  if (!classes.includes("residence") && residents) throw conflict("Residents must move before Residence is removed.");
  if (!classes.includes("workplace") && venue.workerIds?.length)
    throw conflict("Unassign workers before removing Workplace.");
  if (residents > (change.capacity ?? venue.residenceCapacity ?? 1))
    throw conflict("Keep room for the current residents.");
  const zones = change.zones ?? venueZones(venue).filter((zone) => zone.kind !== "exterior");
  for (const old of venueZones(venue).filter((zone) => zone.kind === "private-residence" && zone.ownerId)) {
    if (!zones.some((zone) => zone.id === old.id && zone.kind === old.kind && zone.ownerId === old.ownerId))
      throw conflict("Move residents before removing or transferring their rooms.");
  }
  validateLayoutZones(venue, zones, classes, state);
}
export function plannedVenue(project: VillageProject): VillageVenue {
  const draft = project.venueDraft!;
  const entrance = {
    ...defaultVenueSpace(draft.classes[0] ?? "other", project.plan?.exteriorDescription ?? ""),
    id: "exterior",
    name: "Entrance",
    kind: "exterior" as const,
    connectedTo: [],
    seen: true,
  };
  return {
    id: "site:" + project.id,
    name: draft.name,
    classes: draft.classes,
    residenceCapacity: project.plan?.capacity ?? 1,
    buildProjectId: project.id,
    constructionStatus: "worksite",
    form: project.plan?.form ?? draft.description,
    description: project.plan?.exteriorDescription ?? "",
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
    exteriorState: entrance.state,
    state: {
      revision: 0,
      recent: null,
      updatedAt: project.updatedAt,
    },
  };
}
