import type { VillageState, VillageVenue, VillageVenueClass, VillageVenueFeature } from "../models/world.js";
import { asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";
import {
  boundText,
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_VENUE_NAME_LENGTH,
  MAX_VENUE_NOTE_LENGTH,
} from "./prompt-preset.js";
import { assertCanAddVillageVenue } from "./venue-capacity.js";
import { defaultVenueSpace, validVenueClasses, venueResidentIds, venueSpaces } from "./venue-model.js";
import { legacyZoneId } from "./venue-zones.js";
import { randomVillageSeed } from "./village-clock.js";

export function venueFieldText(value: unknown, fallback: string, limit: number): string {
  return value === undefined ? fallback : boundText(value, limit);
}
export function venueStringList(value: unknown, fallback: string[]): string[] {
  if (value === undefined) return [...fallback];
  if (!Array.isArray(value)) throw badRequest("Venue lists must be arrays of text.");
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => boundText(entry, MAX_VENUE_NOTE_LENGTH))
    .filter(Boolean)
    .slice(0, 24);
}
export function venueFeatures(value: unknown, existing: readonly VillageVenueFeature[]): VillageVenueFeature[] {
  if (value === undefined) return [...existing];
  if (!Array.isArray(value) || value.length > 5) throw badRequest("A venue can have at most five features.");
  const ids = new Set<string>();
  return value.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw badRequest("Each feature needs text.");
    const row = entry as Record<string, unknown>;
    const requestedId = asTrimmedString(row.id);
    const prior = existing.find((feature) => feature.id === requestedId);
    const id = prior?.id ?? randomVillageSeed();
    const text = boundText(row.text, MAX_VENUE_NOTE_LENGTH);
    if (!text || ids.has(id)) throw badRequest("Each feature needs distinct text and an identity.");
    ids.add(id);
    return {
      id,
      text,
      sourceCharacterId: prior && prior.text === text ? prior.sourceCharacterId : "",
      locked: row.locked === true,
      updatedAt:
        prior && prior.text === text && prior.locked === (row.locked === true)
          ? prior.updatedAt
          : new Date().toISOString(),
    };
  });
}
export function venueDraft(value: unknown, existing: VillageVenue | null): VillageVenue {
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
  const stateValue = record.state;
  const state =
    stateValue && typeof stateValue === "object" && !Array.isArray(stateValue)
      ? (stateValue as Record<string, unknown>)
      : {};
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
    const scene =
      row.state && typeof row.state === "object" && !Array.isArray(row.state)
        ? (row.state as Record<string, unknown>)
        : {};
    const nextDescription = venueFieldText(row.description, prior.description, MAX_VENUE_DESCRIPTION_LENGTH).trim();
    const nextState = {
      condition: venueFieldText(scene.condition, prior.state.condition, MAX_VENUE_NOTE_LENGTH),
      items: venueStringList(scene.items, prior.state.items),
      publicFacts: venueStringList(scene.publicFacts, prior.state.publicFacts),
      features: venueFeatures(scene.features, prior.state.features),
      traces: prior.state.traces,
      updatedAt: prior.state.updatedAt,
    };
    const changed =
      nextDescription !== prior.description ||
      nextState.condition !== prior.state.condition ||
      JSON.stringify(nextState.items) !== JSON.stringify(prior.state.items) ||
      JSON.stringify(nextState.publicFacts) !== JSON.stringify(prior.state.publicFacts) ||
      JSON.stringify(nextState.features) !== JSON.stringify(prior.state.features);
    if (changed) nextState.updatedAt = new Date().toISOString();
    return {
      ...prior,
      description: nextDescription,
      state: nextState,
    };
  });
  if (spaces.some((space) => !space.description)) throw badRequest("Approve a description for every Venue space.");
  const draft: VillageVenue = {
    layoutVersion: existing?.layoutVersion,
    baseClasses: existing?.baseClasses,
    zones: existing?.zones,
    archivedZones: existing?.archivedZones,
    usedInvitationIds: existing?.usedInvitationIds,
    id: (existing?.id ?? asTrimmedString(record.id)) || randomVillageSeed(),
    name,
    form,
    classes,
    spaces,
    residenceCapacity,
    residentIds: existing ? venueResidentIds(existing) : [],
    playerInvitations: existing?.playerInvitations ?? [],
    exteriorState: existing?.exteriorState,
    privateSpaces: existing?.privateSpaces,
    archivedPrivateSpaces: existing?.archivedPrivateSpaces,
    editProposals: existing?.editProposals,
    playerSeenShared: existing?.playerSeenShared,
    playerSeenPublic: existing?.playerSeenPublic,
    playerSeenPrivateIds: existing?.playerSeenPrivateIds,
    improvements: existing?.improvements ?? [null, null],
    description,
    category,
    presentation: {
      image: existing?.presentation.image ?? null,
      x: position.x,
      y: position.y,
    },
    occupancy: existing?.occupancy ?? { playerHome: false, residentCharacterId: null, homeKind: null },
    capabilities: venueStringList(record.capabilities, existing?.capabilities ?? []),
    workerIds: venueStringList(record.workerIds, existing?.workerIds ?? []),
    state: {
      condition: venueFieldText(state.condition, existing?.state.condition ?? "", MAX_VENUE_NOTE_LENGTH),
      upgrades: venueStringList(state.upgrades, existing?.state.upgrades ?? []),
      furniture: venueStringList(state.furniture, existing?.state.furniture ?? []),
      publicFacts: venueStringList(state.publicFacts, existing?.state.publicFacts ?? []),
      features: venueFeatures(state.features, existing?.state.features ?? []),
      traces: existing?.state.traces ?? [],
      updatedAt: new Date().toISOString(),
    },
  };
  // Older editors submit the single scene as `state`. Keep its Class space in
  // step so the next visit and the next edit see the same feature identities.
  if (postedSpaces === undefined && record.state !== undefined && draft.spaces?.[0]) {
    draft.spaces[0].state = {
      ...draft.spaces[0].state,
      condition: draft.state.condition,
      items: [...draft.state.furniture],
      publicFacts: [...draft.state.publicFacts],
      features: [...(draft.state.features ?? [])],
      traces: [...(draft.state.traces ?? [])],
      updatedAt: draft.state.updatedAt,
    };
  }
  return draft;
}
export function addVillageVenue(state: VillageState, draft: VillageVenue): void {
  assertCanAddVillageVenue(state, draft.classes);
  if (state.venues.some((venue) => venue.name.trim().toLowerCase() === draft.name.toLowerCase())) {
    throw badRequest("A venue with that name already exists.");
  }
  state.venues.push({
    ...draft,
    id: randomVillageSeed(),
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  });
}
export function personalDestinationSpace(venue: VillageVenue, characterId: string) {
  const id = legacyZoneId(venue, "private", "residence", characterId);
  return venue.privateSpaces?.find((space) => space.id === id);
}
/** Where a place stands, or a refusal — see `parsePlace` for why the two are exclusive. */
export function readPlacePosition(record: Record<string, unknown>): { x: number | null; y: number | null } {
  const x = record.x ?? null;
  const y = record.y ?? null;
  // Absent on BOTH counts is "not on the map yet" and is ordinary. Absent on one
  // is half a position, which is not a position: silently dropping the half that
  // arrived would move the pin to the wrong street, and inventing the other half
  // would be worse.
  if (x === null && y === null) return { x: null, y: null };
  const placed = typeof x === "number" && typeof y === "number" && x >= 0 && x <= 1 && y >= 0 && y <= 1;
  if (!placed) throw badRequest("A place's spot on the map is two fractions between 0 and 1.");
  return { x: x as number, y: y as number };
}
