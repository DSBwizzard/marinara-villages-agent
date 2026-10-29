import { villageNow } from "../../adapters/time/clock-gate.js";
import type { VillageResidence, VillageSnapshot } from "../../domain/models/world.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { completeResidenceMove } from "../../domain/rules/residence-move.js";
import { assertResidencePrivateDestination } from "../../domain/rules/venue-layout.js";
import { hasVenueClass, venueAssignedCount, venueCapacity, venueResidentIds } from "../../domain/rules/venue-model.js";
import { venueZones } from "../../domain/rules/venue-zones.js";
import { residenceCharacterId, residenceVenueId } from "../../domain/rules/world-input.js";
import type { buildVillageSnapshot } from "../world/snapshot.js";
import type { mutateVillageState } from "../world/village-store.js";
export interface ResidencePorts {
  mutateVillageState: typeof mutateVillageState;
  buildVillageSnapshot: typeof buildVillageSnapshot;
}
/** Residence assignment changes access and ownership, never the physical room. */
export function createResidences(ports: ResidencePorts) {
  const { mutateVillageState, buildVillageSnapshot } = ports;

  async function movePlayerToResidence(venueId: string, privateZoneId = ""): Promise<void> {
    const at = villageNow().toISOString();
    await mutateVillageState((state) => {
      const venue = state.venues.find((entry) => entry.id === venueId);
      if (!venue) throw notFound("That Residence no longer exists.");
      if (venue.constructionStatus === "worksite") throw conflict("The build project governs this unfinished site.");
      if (!hasVenueClass(venue, "residence")) throw conflict("The destination is not a Residence.");
      if (venue.occupancy.playerHome) throw conflict("You already live here.");
      if (venueResidentIds(venue).length) throw conflict("Moves into a shared Residence are not available yet.");
      const reserved = state.residences.filter(
        (entry) => entry.proposedVenueId === venue.id && entry.status === "moving",
      ).length;
      if (venueAssignedCount(venue) + reserved >= venueCapacity(venue))
        throw conflict("This Residence has no available resident slot.");
      assertResidencePrivateDestination(state, venue, "player", privateZoneId);
      for (const current of state.venues) {
        if (!current.occupancy.playerHome && current.id !== venue.id) continue;
        current.zones ??= venueZones(current);
        current.layoutVersion = 1;
        const personal = current.zones.find((zone) => zone.kind === "private-residence" && zone.ownerId === "player");
        if (personal) {
          current.archivedZones = [
            ...(current.archivedZones ?? []),
            { zone: structuredClone(personal), archivedAt: at },
          ].slice(-64);
          personal.ownerId = undefined;
          current.playerInvitations = current.playerInvitations?.filter((invite) => invite.zoneId !== personal.id);
        }
        current.occupancy.playerHome = false;
      }
      venue.occupancy.playerHome = true;
      if (privateZoneId) {
        const personal = venue.zones!.find((zone) => zone.id === privateZoneId)!;
        personal.ownerId = "player";
        personal.seen = true;
        personal.preparation = undefined;
      }
    });
  }
  async function proposeVillageResidence(
    characterValue: unknown,
    venueValue: unknown,
    requestedBy: "player" | "villager" = "player",
    sourceKey = "",
    privateZoneId = "",
  ): Promise<VillageSnapshot> {
    const characterId = residenceCharacterId(characterValue);
    const proposedVenueId = residenceVenueId(venueValue);
    await mutateVillageState((state) => {
      if (sourceKey && state.processedActionIds.includes(sourceKey)) return;
      if (!state.villagers.some((villager) => villager.characterId === characterId)) {
        throw notFound("That villager is not in this village.");
      }
      const destination = state.venues.find((venue) => venue.id === proposedVenueId);
      if (!destination) throw notFound("That place is no longer in the village.");
      if (!hasVenueClass(destination, "residence")) throw badRequest("Choose a Residence for this move.");
      if (destination.constructionStatus === "worksite") throw conflict("This Residence is still under construction.");
      const current = state.residences.find((residence) => residence.characterId === characterId);
      const currentVenueId = state.venues.find((venue) => venueResidentIds(venue).includes(characterId))?.id ?? "";
      if (currentVenueId === proposedVenueId) throw badRequest("That villager already lives there.");
      if (current?.status === "moving" || current?.status === "pending")
        throw conflict("That villager already has a move request in progress.");
      const reserved = state.residences.filter(
        (entry) =>
          entry.characterId !== characterId && entry.proposedVenueId === proposedVenueId && entry.status === "moving",
      ).length;
      if (venueAssignedCount(destination) + reserved >= venueCapacity(destination))
        throw conflict("This Residence has no available bed.");
      assertResidencePrivateDestination(state, destination, characterId, privateZoneId);
      if (venueResidentIds(destination).some((id) => id !== characterId))
        throw conflict("Moves into a shared Residence are not available yet.");
      const next: VillageResidence = {
        proposedPrivateZoneId: privateZoneId,
        venueId: currentVenueId,
        characterId,
        status: "pending",
        proposedVenueId,
        requestedAt: villageNow().toISOString(),
        requestedBy,
        villagerDecision: "pending",
      };
      const index = state.residences.findIndex((residence) => residence.characterId === characterId);
      if (index < 0) state.residences.push(next);
      else state.residences[index] = next;
      if (sourceKey) state.processedActionIds = [...state.processedActionIds, sourceKey].slice(-256);
    });
    return buildVillageSnapshot();
  }

  async function approveVillageResidence(characterValue: unknown): Promise<VillageSnapshot> {
    return decideVillageResidence(characterValue, true, "player");
  }

  async function decideVillageResidence(
    characterValue: unknown,
    approved: boolean,
    actor: "player" | "villager",
    operationId?: string,
  ): Promise<VillageSnapshot> {
    const characterId = residenceCharacterId(characterValue);
    await mutateVillageState((state) => {
      if (operationId) {
        const fingerprint = JSON.stringify([characterId, approved, actor]);
        const prior = state.semanticRequestReceipts?.[operationId];
        if (prior && prior !== fingerprint) throw conflict("That residence decision ID belongs to another request.");
        if (prior) return;
        state.semanticRequestReceipts ??= {};
        state.semanticRequestReceipts[operationId] = fingerprint;
      }
      const residence = state.residences.find((entry) => entry.characterId === characterId);
      if (!residence || residence.status !== "pending" || residence.proposedVenueId.length === 0) {
        throw badRequest("That villager has no pending residence change.");
      }
      if (residence.requestedBy === actor) throw badRequest("The requester cannot approve their own move request.");
      if (!approved) {
        if (actor === "villager") residence.villagerDecision = "denied";
        state.residences = state.residences.filter((entry) => entry.characterId !== characterId);
        return;
      }
      const nextVenue = state.venues.find((venue) => venue.id === residence.proposedVenueId);
      if (!nextVenue) throw notFound("The proposed residence is no longer in the village.");
      if (!hasVenueClass(nextVenue, "residence")) throw conflict("The destination is no longer a Residence.");
      if (nextVenue.constructionStatus === "worksite") throw conflict("This Residence is still under construction.");
      const reserved = state.residences.filter(
        (entry) =>
          entry.characterId !== characterId && entry.proposedVenueId === nextVenue.id && entry.status === "moving",
      ).length;
      if (venueAssignedCount(nextVenue) + reserved >= venueCapacity(nextVenue))
        throw conflict("This Residence has no available bed.");
      assertResidencePrivateDestination(state, nextVenue, characterId, residence.proposedPrivateZoneId);
      const now = villageNow().getTime();
      if (venueResidentIds(nextVenue).some((id) => id !== characterId)) {
        throw conflict("Moves into a shared Residence are not available yet.");
      }
      residence.status = "moving";
      residence.villagerDecision = "approved";
      residence.approvedAt = new Date(now).toISOString();
      residence.completesAt = new Date(now + 24 * 60 * 60_000).toISOString();
    });
    return buildVillageSnapshot();
  }

  /** The clock and debug action share the exact same atomic transition. */
  async function completeVillageResidence(
    characterValue: unknown,
    force = false,
    now = villageNow(),
    _queueAdaptation = true,
  ): Promise<VillageSnapshot> {
    const characterId = residenceCharacterId(characterValue);
    await mutateVillageState((state) => {
      // Only the winning mutation attempt can authorize post-save preparation.
      completeResidenceMove(state, characterId, force, now);
    });
    return buildVillageSnapshot(now);
  }

  return {
    movePlayerToResidence,
    proposeVillageResidence,
    approveVillageResidence,
    decideVillageResidence,
    completeVillageResidence,
  };
}
export type Residences = ReturnType<typeof createResidences>;
