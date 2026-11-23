import { defaultVillageState } from "../../packages/villages/src/server/domain/decoding/village-codec.js";
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
import { venueResidentIds } from "../../packages/villages/src/server/domain/rules/venue-model.js";
import { randomVillageSeed } from "../../packages/villages/src/server/domain/rules/village-clock.js";
import { initializeVenueAccess } from "../../packages/villages/src/server/domain/rules/venue-access.js";
import { defaultVenueSpace } from "../../packages/villages/src/server/domain/rules/venue-model.js";
import { materializeConnections } from "../../packages/villages/src/shared/helpers/zone-contact.js";
import { draftZonePolicy } from "../../packages/villages/src/shared/helpers/founding-zone-policy.js";

/** Author complete fresh-format test Venues; production decoding never fills missing layouts. */
export function venueFixture(input: Partial<VillageVenue>): VillageVenue {
  const venue = {
    description: "A place in the community.",
    residentIds: [],
    residenceCapacity: Math.max(0, (input.residentIds?.length ?? 0) + Number(!!input.occupancy?.playerHome)),
    spaces: [],
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    presentation: { mapId: "", image: null, x: null, y: null },
    ...input,
    layoutVersion: 1,
  } as VillageVenue;
  const entrance: VillageVenueZone = {
    ...defaultVenueSpace("common"),
    id: "exterior",
    name: "Entrance",
    purpose: "Arrival",
    kind: "exterior",
    description: venue.description,
    image: venue.presentation?.image ?? null,
    seen: true,
  };
  const common = (
    venue.spaces?.length
      ? venue.spaces
      : ["private", "exterior"].includes(String((venue as any).layout))
        ? []
        : [defaultVenueSpace("other", venue.description)]
  ).map((space) => ({
    ...space,
    name: "Common Space",
    purpose: "Everyday activities",
    kind: "public" as const,
    seen: true,
  }));
  const personal = (venue.privateSpaces ?? []).map((space) => ({
    ...space,
    name: "Private Space",
    purpose: "Personal activities",
    kind: "personal" as const,
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
  venue.spaces = venue.zones.filter((zone) => ["public", "public"].includes(zone.kind));
  venue.privateSpaces = venue.zones
    .filter((zone) => zone.kind === "personal")
    .map((zone) => ({ ...zone, ownerId: zone.ownerId ?? "" }));
  for (const zone of venue.zones)
    if (zone.kind !== "exterior")
      zone.access ??=
        zone.kind === "restricted"
          ? {
              ...draftZonePolicy(venue, zone),
              mode: "permission-required",
              managerIds: zone.controllerIds?.length ? zone.controllerIds : null,
              memberRoles: ["workers"],
            }
          : draftZonePolicy(venue, zone, zone.kind === "personal");
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
  const requestedCapacity = record.residenceCapacity;
  if (existing && requestedCapacity !== undefined && requestedCapacity !== existing.residenceCapacity)
    throw badRequest("Changing residence capacity requires a Venue proposal.");
  if (
    requestedCapacity !== undefined &&
    (!Number.isInteger(requestedCapacity) || Number(requestedCapacity) < 0 || Number(requestedCapacity) > 4)
  )
    throw badRequest("A Residence holds between one and four people.");
  const residenceCapacity =
    existing?.residenceCapacity ?? (typeof requestedCapacity === "number" ? requestedCapacity : 0);
  const presentationValue = record.presentation;
  const presentation =
    presentationValue && typeof presentationValue === "object" && !Array.isArray(presentationValue)
      ? (presentationValue as Record<string, unknown>)
      : {};
  const x = presentation.x === undefined ? (existing?.presentation.x ?? null) : presentation.x;
  const y = presentation.y === undefined ? (existing?.presentation.y ?? null) : presentation.y;
  const position = readPlacePosition({ x, y });
  const priorSpaces = existing?.spaces ??
    (Array.isArray(record.spaces) ? (record.spaces as VillageVenue["spaces"]) : undefined) ?? [
      defaultVenueSpace("other", description),
    ];
  const postedSpaces = record.spaces;
  const spaces = priorSpaces.map((prior) => {
    const posted = Array.isArray(postedSpaces) ? postedSpaces.find((row) => row?.id === prior.id) : null;
    return {
      ...prior,
      description: venueFieldText(posted?.description, prior.description, MAX_VENUE_DESCRIPTION_LENGTH).trim(),
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
    spaces,
    residenceCapacity,
    residentIds: existing ? venueResidentIds(existing) : venueStringList(record.residentIds, []),
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
  };
  return draft;
}

/** Complete public capacity for synthetic worlds whose subject is another feature. */
export function sharedVenuesFixture(residents = 8) {
  return [1, 2].map((index) => {
    const venue = venueFixture({
      spaces: [{ id: "community", description: "A place in the community.", image: null }],
      id: "fixture-public-" + index,
      name: "Fixture commons " + index,
    });
    const zone = venue.zones!.find((zone) => zone.kind === "public")!;
    venue.zones!.push(
      ...Array.from({ length: Math.max(0, Math.ceil(residents / 8) - 1) }, (_, i) => i + 2).map((room) => ({
        ...structuredClone(zone),
        id: "shared-" + room,
        connectedTo: ["exterior"],
      })),
    );
    venue.spaces = venue.zones!.filter((zone) => zone.kind === "public");
    return venue;
  });
}
export function defaultVillageFixture() {
  return { ...defaultVillageState(), venues: sharedVenuesFixture() };
}
