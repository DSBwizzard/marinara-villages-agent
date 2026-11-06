import type { VillageVenue, VillageVenueZone } from "../../packages/villages/src/server/domain/models/world.js";
import { readPlacePosition } from "../../packages/villages/src/server/domain/rules/venue-authoring.js";
import { asTrimmedString } from "../../packages/villages/src/server/domain/rules/coerce.js";
import { badRequest } from "../../packages/villages/src/server/domain/rules/errors.js";
import {
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_VENUE_NAME_LENGTH,
  MAX_VENUE_NOTE_LENGTH,
} from "../../packages/villages/src/server/domain/rules/prompt-preset.js";
import { venueFieldText, venueStringList } from "../../packages/villages/src/server/domain/rules/venue-authoring.js";
import {
  validVenueClasses,
  venueResidentIds,
  venueSpaces,
} from "../../packages/villages/src/server/domain/rules/venue-model.js";
import { randomVillageSeed } from "../../packages/villages/src/server/domain/rules/village-clock.js";
import type { VillageVenueClass } from "../../packages/villages/src/server/domain/models/world.js";
import { initializeVenueAccess } from "../../packages/villages/src/server/domain/rules/venue-access.js";
import { defaultVenueSpace } from "../../packages/villages/src/server/domain/rules/venue-model.js";
import { materializeConnections } from "../../packages/villages/src/shared/helpers/zone-contact.js";

/** Author complete fresh-format test Venues; production decoding never fills missing layouts. */
export function venueFixture(input: Partial<VillageVenue>): VillageVenue {
  const venue = {
    description: "A place in the community.",
    residentIds: [],
    classes: ["other"],
    residenceCapacity: Math.max(1, (input.residentIds?.length ?? 0) + Number(!!input.occupancy?.playerHome)),
    spaces: [],
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    presentation: { mapId: "", image: null, x: null, y: null },
    ...input,
    layoutVersion: 1,
  } as VillageVenue;
  const entrance: VillageVenueZone = {
    ...defaultVenueSpace(venue.classes![0]!),
    id: "exterior",
    name: "Entrance",
    purpose: "Arrival",
    kind: "exterior",
    description: venue.description,
    image: venue.presentation?.image ?? null,
    state: venue.exteriorState ?? defaultVenueSpace("other").state,
    seen: true,
  };
  const common = (
    venue.spaces?.length
      ? venue.spaces
      : ["private", "exterior"].includes(String((venue as any).layout))
        ? []
        : venue.classes!.map((role) => defaultVenueSpace(role, venue.description))
  ).map((space) => ({
    ...space,
    name: "Common Space",
    purpose: "Everyday activities",
    kind: space.venueClass === "residence" ? ("shared-residence" as const) : ("public" as const),
    seen: true,
  }));
  const personal = (venue.privateSpaces ?? []).map((space) => ({
    ...space,
    name: "Private Space",
    purpose: "Personal activities",
    kind: "private-residence" as const,
    seen: space.ownerId === "player",
  }));
  venue.zones = materializeConnections(
    venue.zones?.length
      ? venue.zones.some((zone) => zone.id === "exterior")
        ? venue.zones
        : [entrance, ...venue.zones]
      : [entrance, ...common, ...personal],
  );
  venue.zones = venue.zones.map((zone) =>
    zone.kind !== "exterior" && zone.connectedTo?.length === 0 ? { ...zone, connectedTo: ["exterior"] } : zone,
  );
  venue.spaces = venue.zones.filter((zone) => ["public", "shared-residence"].includes(zone.kind));
  venue.privateSpaces = venue.zones
    .filter((zone) => zone.kind === "private-residence")
    .map((zone) => ({ ...zone, ownerId: zone.ownerId ?? "" }));
  initializeVenueAccess(venue);
  return venue;
}

const asRecord = (value: unknown) => (value && typeof value === "object" ? (value as Record<string, unknown>) : {});
export function venueDraftFixture(value: unknown, existing: VillageVenue | null): VillageVenue {
  return venueFixture(venueDraft(value, existing));
}

function venueDraft(value: unknown, existing: VillageVenue | null): VillageVenue {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw badRequest("A venue must be an object.");
  }
  const record = value as Record<string, unknown>;
  const name = venueFieldText(record.name, existing?.name ?? "", MAX_VENUE_NAME_LENGTH).trim();
  if (name.length === 0 && !existing?.occupancy.homeKind) throw badRequest("Every venue needs a name.");
  const description = venueFieldText(
    record.description,
    existing?.description ?? "",
    MAX_VENUE_DESCRIPTION_LENGTH,
  ).trim();
  if (!description) throw badRequest("Approve a description before saving this venue.");
  const category = venueFieldText(record.category, existing?.category ?? "", MAX_VENUE_NOTE_LENGTH).trim();
  const form = venueFieldText(record.form, existing?.form ?? "", MAX_VENUE_NOTE_LENGTH).trim();
  if (record.classes !== undefined && !validVenueClasses(record.classes))
    throw badRequest("Choose one or two different Venue Classes.");
  if (existing && record.classes !== undefined && JSON.stringify(record.classes) !== JSON.stringify(existing.classes))
    throw badRequest("Changing Classes requires a Venue proposal.");
  const classes: VillageVenueClass[] =
    existing?.classes ?? (validVenueClasses(record.classes) ? record.classes : ["other"]);
  const requestedCapacity = record.residenceCapacity;
  if (existing && requestedCapacity !== undefined && requestedCapacity !== existing.residenceCapacity)
    throw badRequest("Changing residence capacity requires a Venue proposal.");
  if (
    requestedCapacity !== undefined &&
    (!Number.isInteger(requestedCapacity) || Number(requestedCapacity) < 1 || Number(requestedCapacity) > 4)
  )
    throw badRequest("A Residence holds between one and four people.");
  const residenceCapacity =
    existing?.residenceCapacity ?? (typeof requestedCapacity === "number" ? requestedCapacity : 1);
  const presentationValue = record.presentation;
  const presentation =
    presentationValue && typeof presentationValue === "object" && !Array.isArray(presentationValue)
      ? (presentationValue as Record<string, unknown>)
      : {};
  const x = presentation.x === undefined ? (existing?.presentation.x ?? null) : presentation.x;
  const y = presentation.y === undefined ? (existing?.presentation.y ?? null) : presentation.y;
  const position = readPlacePosition({ x, y });
  const priorSpaces = existing
    ? venueSpaces(existing)
    : classes.map((venueClass) => defaultVenueSpace(venueClass, description));
  const editableSpaceClasses = existing?.layoutVersion === 1 ? priorSpaces.map((space) => space.venueClass) : classes;
  const postedSpaces = record.spaces;
  if (
    postedSpaces !== undefined &&
    (!Array.isArray(postedSpaces) || postedSpaces.length !== editableSpaceClasses.length)
  )
    throw badRequest("Provide one scene for each Venue Class.");
  const spaces = editableSpaceClasses.map((venueClass) => {
    const prior =
      priorSpaces.find((space) => space.venueClass === venueClass) ?? defaultVenueSpace(venueClass, description);
    const posted = Array.isArray(postedSpaces)
      ? postedSpaces.find((space) => typeof space === "object" && space !== null && space.venueClass === venueClass)
      : null;
    const row = posted && typeof posted === "object" ? (posted as Record<string, unknown>) : {};
    const nextDescription = venueFieldText(row.description, prior.description, MAX_VENUE_DESCRIPTION_LENGTH).trim();
    const nextState = { ...prior.state };
    if (nextDescription !== prior.description) {
      nextState.revision++;
      nextState.updatedAt = new Date().toISOString();
    }
    return {
      ...prior,
      description: nextDescription,
      state: nextState,
    };
  });
  if (spaces.some((space) => !space.description)) throw badRequest("Approve a description for every Venue space.");
  const draft: VillageVenue = {
    zoneLayout: existing?.zoneLayout,
    layoutVersion: existing?.layoutVersion,

    zones: existing?.zones,
    archivedZones: existing?.archivedZones,
    id: (existing?.id ?? asTrimmedString(record.id)) || randomVillageSeed(),
    name,
    form,
    classes,
    spaces,
    residenceCapacity,
    residentIds: existing ? venueResidentIds(existing) : venueStringList(record.residentIds, []),
    exteriorState: existing?.exteriorState,
    privateSpaces: existing?.privateSpaces,
    archivedPrivateSpaces: existing?.archivedPrivateSpaces,
    playerSeenShared: existing?.playerSeenShared,
    playerSeenPublic: existing?.playerSeenPublic,
    playerSeenPrivateIds: existing?.playerSeenPrivateIds,

    description,
    category,
    presentation: {
      mapId: existing?.presentation.mapId ?? "",
      image: existing?.presentation.image ?? null,
      x: position.x,
      y: position.y,
    },
    occupancy: existing?.occupancy ?? {
      playerHome: asRecord(record.occupancy).playerHome === true,
      residentCharacterId: null,
      homeKind: null,
    },
    capabilities: venueStringList(record.capabilities, existing?.capabilities ?? []),
    workerIds: venueStringList(record.workerIds, existing?.workerIds ?? []),
    state: existing?.state ?? { revision: 0, updatedAt: "", recent: null },
  };
  return draft;
}
