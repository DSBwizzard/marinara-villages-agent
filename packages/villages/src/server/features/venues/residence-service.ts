import { villageNow } from "../../adapters/time/clock-gate.js";
import { randomUUID } from "node:crypto";
import type { VillageSnapshot } from "../../domain/models/world.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { assertResidenceAgreement, residenceProposal } from "../../domain/rules/residence-agreement.js";
import { completeResidenceMove } from "../../domain/rules/residence-move.js";
import { hasVenueClass, venueResidentIds } from "../../domain/rules/venue-model.js";
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

  async function movePlayerToResidence(venueId: string, sleepZoneId = ""): Promise<void> {
    await proposeVillageResidence("player", venueId, "player", "", sleepZoneId);
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
    const requestId = randomUUID();
    await mutateVillageState((state) => {
      if (sourceKey && state.processedActionIds.includes(sourceKey)) return;
      if (characterId !== "player" && !state.villagers.some((villager) => villager.characterId === characterId)) {
        throw notFound("That villager is not in this village.");
      }
      const destination = state.venues.find((venue) => venue.id === proposedVenueId);
      if (!destination) throw notFound("That place is no longer in the village.");
      if (!hasVenueClass(destination, "residence")) throw badRequest("Choose a Residence for this move.");
      if (destination.constructionStatus === "worksite") throw conflict("This Residence is still under construction.");
      const current = state.residences.find((residence) => residence.characterId === characterId);
      const currentVenueId =
        state.venues.find((venue) =>
          characterId === "player" ? venue.occupancy.playerHome : venueResidentIds(venue).includes(characterId),
        )?.id ?? "";
      if (currentVenueId === proposedVenueId) throw badRequest("That villager already lives there.");
      if (current && current.status !== "current" && !current.holdReason) {
        let stale = false;
        try {
          assertResidenceAgreement(state, current, false, villageNow().toISOString());
        } catch {
          stale = true;
        }
        if (!stale) throw conflict("That person already has a move request in progress.");
      }
      const next = residenceProposal(
        state,
        characterId,
        destination,
        requestedBy,
        villageNow().toISOString(),
        privateZoneId,
        requestId,
      );
      const index = state.residences.findIndex((residence) => residence.characterId === characterId);
      if (index < 0) state.residences.push(next);
      else state.residences[index] = next;
      if (characterId === "player") {
        let agreed = false;
        try {
          assertResidenceAgreement(state, next, true, villageNow().toISOString());
          agreed = true;
        } catch {
          /* Other household members still need to decide. */
        }
        if (agreed) {
          next.status = "moving";
          next.completesAt = villageNow().toISOString();
          completeResidenceMove(state, "player", true, villageNow());
        }
      }
      if (sourceKey) state.processedActionIds = [...state.processedActionIds, sourceKey].slice(-256);
    });
    return buildVillageSnapshot();
  }

  async function approveVillageResidence(characterValue: unknown, expectedScope?: string): Promise<VillageSnapshot> {
    return decideVillageResidence(characterValue, true, "player", undefined, undefined, expectedScope);
  }

  async function decideVillageResidence(
    characterValue: unknown,
    approved: boolean,
    actor: "player" | "villager",
    operationId?: string,
    approverId?: string,
    expectedScope?: string,
  ): Promise<VillageSnapshot> {
    const characterId = residenceCharacterId(characterValue);
    await mutateVillageState((state) => {
      if (operationId) {
        const fingerprint = JSON.stringify([characterId, approved, actor, approverId, expectedScope]);
        const prior = state.semanticRequestReceipts?.[operationId];
        if (prior && prior !== fingerprint) throw conflict("That residence decision ID belongs to another request.");
        if (prior) return;
        state.semanticRequestReceipts ??= {};
        state.semanticRequestReceipts[operationId] = fingerprint;
      }
      const residence = state.residences.find((entry) => entry.characterId === characterId);
      if (!residence || !["pending", "moving"].includes(residence.status) || residence.proposedVenueId.length === 0) {
        throw badRequest("That villager has no pending residence change.");
      }
      const approver = actor === "player" ? "player" : approverId || characterId;
      const allowed = [
        ...(residence.agreement?.requiredIds ?? []),
        ...(residence.requestedBy === "player" ? ["player"] : []),
      ];
      if (!allowed.includes(approver))
        throw conflict("Only the incoming person, housemates and destination managers may decide this move.");
      if (!expectedScope || expectedScope !== residence.agreement?.scope)
        throw conflict("This decision does not match the reviewed move. Review the current request.");
      if (!approved) {
        if (actor === "villager") residence.villagerDecision = "denied";
        state.residences = state.residences.filter((entry) => entry.characterId !== characterId);
        return;
      }
      assertResidenceAgreement(state, residence, false, villageNow().toISOString());
      if (residence.status === "moving") return;
      residence.agreement!.approvals[approver] = true;
      try {
        assertResidenceAgreement(state, residence, true, villageNow().toISOString());
      } catch {
        return;
      }
      const now = villageNow();
      residence.status = "moving";
      residence.villagerDecision = "approved";
      residence.approvedAt = now.toISOString();
      residence.completesAt = new Date(now.getTime() + (characterId === "player" ? 0 : 24 * 60 * 60_000)).toISOString();
      if (characterId === "player") completeResidenceMove(state, characterId, true, now);
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
