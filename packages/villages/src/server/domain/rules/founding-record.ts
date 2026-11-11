import { foundingVenueShapeProblem } from "../../../shared/helpers/founding-venues.js";
import type { VillageVenue, VillageVenueImage } from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";
import { validateStartingVenue } from "./founding-template.js";
import { isGlobalGalleryRef, MAX_VENUE_IMAGE_URL_LENGTH, MAX_VENUE_NAME_LENGTH } from "./prompt-preset.js";
import { MAX_PHYSICAL_DESIGN_LENGTH } from "../../../shared/helpers/project-design.js";
import { readPlaceDescription } from "./prompt-preset.js";
import { defaultZonePolicy, initializeVenueAccess, readVenueAccess } from "./venue-access.js";
import { readPlacePosition } from "./venue-authoring.js";
import { readBaseVenueLayout } from "./venue-layout.js";
import { validVenueClasses } from "./venue-model.js";
import { accessibleVenueRoute } from "./venue-path.js";
import { readVenueImageContext } from "./village-projections.js";
import { readZoneLayout } from "../../../shared/helpers/zone-layout.js";
import { communityVenueEligible } from "./community-venue.js";
import { captureZoneObservation } from "./zone-observation.js";

export function foundingImage(value: unknown): VillageVenueImage | null {
  if (value === null || value === undefined) return null;
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw badRequest("A founding image must come from the gallery.");
  const row = value as Record<string, unknown>;
  const ref = asTrimmedString(row.ref);
  const id = asTrimmedString(row.id);
  const url = asTrimmedString(row.url);
  if (
    !isGlobalGalleryRef(ref) ||
    id !== ref.slice("global-gallery:".length) ||
    !url ||
    url.length > MAX_VENUE_IMAGE_URL_LENGTH
  ) {
    throw badRequest("A founding image needs a valid gallery reference.");
  }
  return { ref, id, url };
}

const ids = (value: unknown, label: string): string[] => {
  if (
    !Array.isArray(value) ||
    value.some((id) => typeof id !== "string" || !id.trim()) ||
    new Set(value).size !== value.length
  )
    throw badRequest("Choose distinct " + label + " for each Venue.");
  return value as string[];
};
export function parsePlace(value: unknown): VillageVenue {
  const row = asRecord(value),
    occupancy = asRecord(row.occupancy);
  const id = asTrimmedString(row.id),
    name = asTrimmedString(row.name),
    form = asTrimmedString(row.form);
  if (!id || !name || name.length > MAX_VENUE_NAME_LENGTH)
    throw badRequest("Every Venue needs a unique ID and a name of at most 60 characters.");
  if (!form || form.length > MAX_PHYSICAL_DESIGN_LENGTH)
    throw badRequest("Describe what each Venue looks like in at most 2,000 characters.");
  const description = readPlaceDescription(row.description).trim();
  if (!description) throw badRequest("Describe each Venue's Entrance before founding.");
  if (!validVenueClasses(row.classes)) throw badRequest("Choose one or two Venue Classes.");
  if (typeof occupancy.playerHome !== "boolean") throw badRequest("Choose whether this is the player's home.");
  const playerHome = occupancy.playerHome,
    residentIds = ids(row.residentIds, "residents"),
    workerIds = ids(row.workerIds ?? [], "workers");
  const household = [...residentIds, ...(playerHome ? ["player"] : [])];
  if (
    !Number.isInteger(row.residenceCapacity) ||
    Number(row.residenceCapacity) < 1 ||
    Number(row.residenceCapacity) > 4 ||
    household.length > Number(row.residenceCapacity)
  )
    throw badRequest("A Residence holds one to four people; household assignments must fit its capacity.");
  if (household.length && !row.classes.includes("residence"))
    throw badRequest("An assigned home needs the Residence Class.");
  if (workerIds.length && !row.classes.includes("workplace")) throw badRequest("Assigned workers need a Workplace.");
  if (row.layoutVersion !== 1) throw badRequest("Choose an explicit Venue layout before founding.");
  validateStartingVenue(row);
  const zones = readBaseVenueLayout(row, row.classes, "", foundingImage, {
    founding: true,
  });
  if (zones.some((zone) => zone.ownerId && !household.includes(zone.ownerId)))
    throw badRequest("Assign private rooms only to this household's members.");
  const presentation = asRecord(row.presentation),
    position = readPlacePosition(presentation);
  const result: VillageVenue = {
    id,
    name,
    form,
    description,
    classes: row.classes,
    layoutVersion: 1,
    zones,
    spaces: zones.filter((zone) => ["public", "shared-residence"].includes(zone.kind)),
    privateSpaces: zones
      .filter((zone) => zone.kind === "private-residence")
      .map((zone) => ({ ...zone, ownerId: zone.ownerId! })),
    residentIds,
    workerIds,
    residenceCapacity: Number(row.residenceCapacity),
    occupancy: { playerHome, residentCharacterId: null, homeKind: null },
    access: readVenueAccess(row.access),
    destinations: {},
    imageContext: readVenueImageContext(row.imageContext),
    venueType: asTrimmedString(row.venueType).slice(0, 100),
    category: asTrimmedString(row.category).slice(0, 240),
    capabilities: [],
    presentation: {
      mapId: asTrimmedString(presentation.mapId),
      image: foundingImage(presentation.image),
      ...position,
    },
  };
  if (row.zoneLayout !== undefined) {
    const layout = readZoneLayout(
      row.zoneLayout,
      zones.map((zone) => zone.id),
    );
    if (!layout) throw badRequest("Zone positions must be valid and distinct.");
    result.zoneLayout = layout;
  }
  if (!household.length && !workerIds.length)
    for (const zone of zones)
      if (zone.kind !== "exterior" && !zone.access)
        zone.access = { ...defaultZonePolicy(result, zone), mode: "public" };
  initializeVenueAccess(result);
  for (const zone of zones)
    if (zone.ownerId && JSON.stringify(zone.access?.managerIds) !== JSON.stringify([zone.ownerId]))
      throw badRequest("A private room must remain controlled by its assigned person.");
  for (const [actor, raw] of Object.entries(asRecord(row.destinations))) {
    if (!result.destinations![actor]) throw badRequest("Choose destinations only for assigned residents or workers.");
    const selected = asRecord(raw);
    for (const role of ["home", "sleep", "work"] as const) {
      const target = asTrimmedString(selected[role]);
      if (!target) continue;
      const zone = zones.find((zone) => zone.id === target);
      if (
        !zone ||
        zone.kind === "exterior" ||
        zone.venueClass !== (role === "work" ? "workplace" : "residence") ||
        (zone.ownerId && zone.ownerId !== actor)
      )
        throw badRequest("Choose a suitable Zone for each destination.");
      result.destinations![actor][role] = target;
    }
  }
  for (const zone of zones) zone.observed = captureZoneObservation(result, zone, zone.description);
  return result;
}
export function parsePlaces(
  value: unknown,
  residents: ReadonlySet<string>,
  founding: true,
  communityVenueId: string,
  at = new Date(),
): VillageVenue[] {
  if (!founding) throw badRequest("Establish starting Venues through Founding.");
  if (!Array.isArray(value) || value.length > 5)
    throw badRequest("Founding supports at most four Residences and one Community Venue.");
  const venues = value.map(parsePlace),
    assigned = new Set<string>(),
    seen = new Set<string>(),
    names = new Set<string>();
  let playerHomes = 0;
  const shapeProblem = foundingVenueShapeProblem(venues, communityVenueId);
  if (shapeProblem) throw badRequest(shapeProblem);
  for (const venue of venues) {
    if (seen.has(venue.id) || names.has(venue.name.toLowerCase()))
      throw badRequest("Every Venue needs a distinct name and ID.");
    seen.add(venue.id);
    names.add(venue.name.toLowerCase());
    if (venue.presentation.x === null || venue.presentation.y === null)
      throw badRequest("Place every starting Venue on the map.");
    if (venue.occupancy.playerHome) playerHomes++;
    for (const id of venue.residentIds!) {
      if (!residents.has(id) || assigned.has(id))
        throw badRequest("Assign each founding resident to exactly one home.");
      assigned.add(id);
    }
  }
  if (playerHomes !== 1 || assigned.size < 1 || assigned.size > 3)
    throw badRequest("Founding needs one to three residents and exactly one home assignment for each person.");
  for (const venue of venues) {
    if (
      venue.workerIds?.some((id) => !assigned.has(id)) ||
      venue.zones?.some((zone) => zone.controllerIds?.some((id) => id !== "player" && !assigned.has(id)))
    )
      throw badRequest("Choose founding residents as workers and controllers.");
    for (const actor of [...venue.residentIds!, ...(venue.occupancy.playerHome ? ["player"] : [])]) {
      const sleep = venue.zones!.find((zone) => zone.id === venue.destinations?.[actor]?.sleep);
      if (!sleep || !accessibleVenueRoute({ projects: [] }, venue, actor, sleep.id, at, true))
        throw badRequest("Every household member needs an accessible sleeping destination and a route from Entrance.");
    }
  }
  const community = venues.find((venue) => venue.id === communityVenueId);
  if (
    !community ||
    community.classes!.includes("residence") ||
    community.residentIds!.length ||
    community.occupancy.playerHome ||
    community.workerIds!.length
  )
    throw badRequest("Choose a separate, non-residential Community Venue without residents or workers.");
  if (asRecord(value.find((row) => row.id === community.id)).access === undefined) community.access!.managerIds = [];
  if (
    community.access!.managerIds.length ||
    community.access!.visitorHours !== null ||
    community.access!.bans.some((ban) => ban.active) ||
    community.zones!.some(
      (zone) =>
        zone.ownerId || zone.controllerIds?.length || zone.access?.managerIds?.length || zone.access?.inviterIds.length,
    )
  )
    throw badRequest("The starting Community Venue must be unowned and always open.");
  const common = community.zones!.find(
    (zone) =>
      zone.kind === "public" &&
      zone.description.trim() &&
      !zone.ownerId &&
      !zone.controllerIds?.length &&
      zone.access?.mode === "public" &&
      !zone.access.accompanied &&
      !Array.isArray(zone.access.visitorHours) &&
      !zone.access.managerIds?.length &&
      ["player", ...assigned].every((actor) =>
        accessibleVenueRoute({ projects: [] }, community, actor, zone.id, at, true),
      ),
  );
  if (!common) throw badRequest("The starting Community Venue needs an Entrance and a usable public common Zone.");
  if (!communityVenueEligible(community))
    throw badRequest(
      "Every Community Venue Zone must be public, unowned and open without accompaniment or opening hours.",
    );
  return venues;
}

export function validateFoundingRoster(
  value: unknown,
  assigned: ReadonlySet<string>,
  available: ReadonlySet<string>,
): void {
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > 3 ||
    value.some((id) => typeof id !== "string" || !available.has(id)) ||
    new Set(value).size !== value.length
  )
    throw badRequest("Choose one to three available founding villagers.");
  if (assigned.size !== value.length || value.some((id) => !assigned.has(id)))
    throw badRequest("Assign every villager chosen on People to one Residence.");
}
