import type { VillageState } from "../models/world.js";
import { badRequest, conflict } from "./errors.js";
import { keepAgendaPlaces } from "./resident-agenda.js";
import { personalDestinationSpace } from "./venue-authoring.js";
import { assertResidencePrivateDestination } from "./venue-layout.js";
import { hasVenueClass, venueAssignedCount, venueCapacity, venueResidentIds } from "./venue-model.js";
import { venueZones } from "./venue-zones.js";

/** Pure atomic occupancy transition shared by clock catch-up and resident development. */
export function completeResidenceMove(state: VillageState, characterId: string, force: boolean, now: Date): boolean {
  const residence = state.residences.find((entry) => entry.characterId === characterId);
  if (!residence || residence.status !== "moving") throw badRequest("That villager is not moving.");
  if (!force && Date.parse(residence.completesAt ?? "") > now.getTime()) return false;
  const destination = state.venues.find((venue) => venue.id === residence.proposedVenueId);
  if (
    !destination ||
    !hasVenueClass(destination, "residence") ||
    venueAssignedCount(destination) >= venueCapacity(destination)
  )
    throw conflict("The new venue is no longer available for this move.");
  assertResidencePrivateDestination(state, destination, characterId, residence.proposedPrivateZoneId);
  const old = state.venues.find((venue) => venueResidentIds(venue).includes(characterId));
  destination.layoutVersion = 1;
  destination.zones ??= venueZones(destination);
  if (old) {
    old.zones ??= venueZones(old);
    old.layoutVersion = 1;
  }
  const archivedAt = new Date(now).toISOString();
  const oldPrivate = old && personalDestinationSpace(old, characterId);
  if (old) {
    const allOwned = old.privateSpaces?.filter((space) => space.ownerId === characterId) ?? [];
    if (allOwned.length) {
      old.archivedPrivateSpaces = [
        ...(old.archivedPrivateSpaces ?? []),
        ...allOwned
          .sort((a, b) => Number(b.id === oldPrivate?.id) - Number(a.id === oldPrivate?.id))
          .map((space) => ({ ownerId: characterId, archivedAt, space: structuredClone(space) })),
      ].slice(-32);
      old.privateSpaces = (old.privateSpaces ?? []).filter((space) => space.ownerId !== characterId);
      if (old.layoutVersion === 1) {
        for (const zone of old.zones?.filter((zone) => zone.ownerId === characterId) ?? []) {
          zone.ownerId = undefined;
        }
        const ownedIds = new Set(allOwned.map((space) => space.id));
        old.playerInvitations = old.playerInvitations?.filter((invitation) => !ownedIds.has(invitation.zoneId ?? ""));
      }
    }
    old.residentIds = venueResidentIds(old).filter((id) => id !== characterId);
    old.playerSeenPrivateIds = (old.playerSeenPrivateIds ?? []).filter((id) => id !== characterId);
    old.occupancy.residentCharacterId = old.residentIds[0] ?? null;
    if (old.destinations) delete old.destinations[characterId];
  }
  destination.residentIds = [...venueResidentIds(destination), characterId];
  destination.playerSeenPrivateIds = (destination.playerSeenPrivateIds ?? []).filter((id) => id !== characterId);
  if (destination.layoutVersion === 1 && residence.proposedPrivateZoneId) {
    const zone = destination.zones!.find((zone) => zone.id === residence.proposedPrivateZoneId)!;
    if (zone.image || zone.seen)
      destination.archivedZones = [
        ...(destination.archivedZones ?? []),
        { zone: structuredClone(zone), archivedAt },
      ].slice(-64);
    zone.ownerId = characterId;
    destination.destinations ??= {};
    destination.destinations[characterId] = { sleep: zone.id };
  }
  destination.occupancy.residentCharacterId = destination.residentIds[0] ?? null;
  residence.venueId = destination.id;
  residence.proposedVenueId = "";
  residence.status = "current";
  residence.completesAt = "";
  keepAgendaPlaces(state);
  return true;
}
