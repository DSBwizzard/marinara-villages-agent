import type { VillageState } from "../models/world.js";
import { badRequest, conflict } from "./errors.js";
import { keepAgendaPlaces } from "./resident-agenda.js";
import { personalDestinationSpace } from "./venue-authoring.js";
import { hasVenueClass, venueAssignedCount, venueCapacity, venueResidentIds } from "./venue-model.js";
import { venueZones } from "./venue-zones.js";
import { assertResidenceAgreement } from "./residence-agreement.js";
import { initializeVenueAccess } from "./venue-access.js";

/** Pure atomic occupancy transition shared by clock catch-up and resident development. */
export function completeResidenceMove(state: VillageState, characterId: string, force: boolean, now: Date): boolean {
  const residence = state.residences.find((entry) => entry.characterId === characterId);
  if (!residence || residence.status !== "moving") throw badRequest("That villager is not moving.");
  if (!force && Date.parse(residence.completesAt ?? "") > now.getTime()) return false;
  try {
    assertResidenceAgreement(state, residence, true, now.toISOString());
  } catch (error) {
    residence.status = "pending";
    residence.holdReason = error instanceof Error ? error.message : "Review this move before renewing agreements.";
    if (residence.agreement) residence.agreement.approvals = {};
    residence.completesAt = "";
    return false;
  }
  const destination = state.venues.find((venue) => venue.id === residence.proposedVenueId);
  if (
    !destination ||
    !hasVenueClass(destination, "residence") ||
    venueAssignedCount(destination) >= venueCapacity(destination)
  )
    throw conflict("The new venue is no longer available for this move.");
  const old = state.venues.find((venue) =>
    characterId === "player" ? venue.occupancy.playerHome : venueResidentIds(venue).includes(characterId),
  );
  destination.layoutVersion = 1;
  destination.zones ??= venueZones(destination);
  if (old) {
    old.zones ??= venueZones(old);
    old.layoutVersion = 1;
  }
  const previousHouseholds = new Map(
    [old, destination]
      .filter((venue) => !!venue)
      .map((venue) => [
        venue.id,
        [...venueResidentIds(venue), ...(venue.occupancy.playerHome ? ["player"] : [])].sort(),
      ]),
  );
  const archivedAt = new Date(now).toISOString();
  const oldPrivate = old && personalDestinationSpace(old, characterId);
  if (old) {
    const allOwned = old.zones?.filter((space) => space.ownerId === characterId) ?? [];
    if (allOwned.length) {
      old.archivedPrivateSpaces = [
        ...(old.archivedPrivateSpaces ?? []),
        ...allOwned
          .sort((a, b) => Number(b.id === oldPrivate?.id) - Number(a.id === oldPrivate?.id))
          .map((space) => ({
            ownerId: characterId,
            archivedAt,
            space: { ...structuredClone(space), ownerId: characterId },
          })),
      ].slice(-32);
      old.privateSpaces = (old.privateSpaces ?? []).filter((space) => space.ownerId !== characterId);
      if (old.layoutVersion === 1) {
        for (const zone of old.zones?.filter((zone) => zone.ownerId === characterId) ?? [])
          changeRoomOwner(old, zone, undefined);
      }
    }
    old.residentIds = venueResidentIds(old).filter((id) => id !== characterId);
    old.playerSeenPrivateIds = (old.playerSeenPrivateIds ?? []).filter((id) => id !== characterId);
    old.occupancy.residentCharacterId = old.residentIds[0] ?? null;
    if (old.destinations) delete old.destinations[characterId];
  }
  if (characterId === "player") {
    for (const venue of state.venues)
      if (venue.occupancy.playerHome) {
        venue.occupancy.playerHome = false;
        if (venue.destinations) delete venue.destinations.player;
        for (const zone of venue.zones ?? []) if (zone.ownerId === "player") zone.ownerId = undefined;
      }
    destination.occupancy.playerHome = true;
  } else destination.residentIds = [...venueResidentIds(destination), characterId];
  destination.playerSeenPrivateIds = (destination.playerSeenPrivateIds ?? []).filter((id) => id !== characterId);
  const zone = destination.zones!.find((zone) => zone.id === residence.agreement!.sleepZoneId)!;
  if (zone.kind === "private-residence") {
    if (zone.image || zone.seen)
      destination.archivedZones = [
        ...(destination.archivedZones ?? []),
        { zone: structuredClone(zone), archivedAt },
      ].slice(-64);
    changeRoomOwner(destination, zone, characterId);
    destination.destinations ??= {};
    destination.destinations[characterId] = { sleep: zone.id };
  }
  destination.destinations ??= {};
  destination.destinations[characterId] = { sleep: zone.id };
  for (const venue of [old, destination].filter((venue) => !!venue)) {
    initializeVenueAccess(venue);
    if (JSON.stringify([...venue.access!.managerIds].sort()) === JSON.stringify(previousHouseholds.get(venue.id)))
      venue.access!.managerIds = [...venueResidentIds(venue), ...(venue.occupancy.playerHome ? ["player"] : [])];
    venue.access!.revision++;
  }
  destination.occupancy.residentCharacterId = destination.residentIds[0] ?? null;
  residence.venueId = destination.id;
  residence.proposedVenueId = "";
  residence.status = "current";
  residence.completesAt = "";
  keepAgendaPlaces(state);
  return true;
}

function changeRoomOwner(
  venue: import("../models/world.js").VillageVenue,
  zone: import("../models/world.js").VillageVenueZone,
  ownerId: string | undefined,
): void {
  zone.ownerId = ownerId;
  zone.access = {
    mode: "permission-required",
    managerIds: ownerId ? [ownerId] : null,
    memberIds: ownerId ? [ownerId] : [],
    memberRoles: [],
    inviterIds: [],
    visitorHours: "always",
    accompanied: false,
  };
  for (const permission of venue.access?.permissions ?? [])
    if (permission.zoneId === zone.id) permission.revoked = true;
}
