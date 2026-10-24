import { housingSignature } from "./development-housing.js";
import { moveConsentingActors } from "./development-consent.js";
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
  const pursuit = state.development?.residents[characterId]?.pursuits.find(
    (p) => p.status === "arranged" && p.targetVenueId === destination.id,
  );
  if (
    pursuit &&
    !moveConsentingActors(destination, pursuit.privateZoneId, characterId).every(
      (id) => pursuit.consents[id]?.decision === "agree",
    )
  )
    throw conflict("The move needs agreement from the current household and controllers.");
  assertResidencePrivateDestination(state, destination, characterId, residence.proposedPrivateZoneId);
  const beforeHousing = Object.fromEntries(state.venues.map((v) => [v.id, housingSignature(v)]));
  const completionAt = residence.completesAt;
  const old = state.venues.find((venue) => venueResidentIds(venue).includes(characterId));
  destination.layoutVersion = 1;
  destination.zones ??= venueZones(destination);
  if (old) {
    old.zones ??= venueZones(old);
    old.layoutVersion = 1;
  }
  const archivedAt = new Date(now).toISOString();
  const oldPrivate = old && personalDestinationSpace(old, characterId);
  const needsAdaptation = Boolean(
    oldPrivate &&
    (oldPrivate.state.items.length ||
      oldPrivate.state.features.length ||
      oldPrivate.description !== `A private space for this resident at ${old?.name}.`),
  );
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
          zone.seen = false;
          zone.lastObserved = undefined;
          zone.initialImageAttemptedAt = undefined;
          zone.imageInteriorKey = undefined;
          zone.state.items = [];
          zone.state.features = zone.state.features.filter((feature) => feature.sourceCharacterId !== characterId);
          zone.state.publicFacts = [];
          zone.state.traces = [];
          zone.preparation = undefined;
          zone.adaptationPending = false;
          zone.adaptationSourceArchiveAt = "";
          zone.image = null;
          zone.description = zone.roomSpecification || zone.purpose || "Vacant residential Private Space.";
        }
        const ownedIds = new Set(allOwned.map((space) => space.id));
        old.playerInvitations = old.playerInvitations?.filter((invitation) => !ownedIds.has(invitation.zoneId ?? ""));
        old.editProposals = old.editProposals?.filter((proposal) => !ownedIds.has(proposal.zoneId ?? ""));
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
    zone.image = null;
    zone.imageInteriorKey = undefined;
    zone.initialImageAttemptedAt = undefined;
    zone.lastObserved = undefined;
    destination.destinations ??= {};
    destination.destinations[characterId] = { sleep: zone.id };
    zone.seen = false;
    zone.preparation = needsAdaptation ? undefined : { status: "pending" };
    zone.adaptationPending = needsAdaptation;
    zone.adaptationSourceArchiveAt = needsAdaptation ? archivedAt : "";
  }
  destination.occupancy.residentCharacterId = destination.residentIds[0] ?? null;
  residence.venueId = destination.id;
  residence.proposedVenueId = "";
  residence.status = "current";
  residence.completesAt = "";
  keepAgendaPlaces(state);
  if (state.development) {
    state.development.housing ??= {};
    for (const home of [old, destination])
      if (home) {
        const known = state.development.housing[home.id];
        const at =
          known?.signature === beforeHousing[home.id] && !force && completionAt ? completionAt : now.toISOString();
        state.development.housing[home.id] = { signature: housingSignature(home), availableAt: at };
      }
  }
  return true;
}
