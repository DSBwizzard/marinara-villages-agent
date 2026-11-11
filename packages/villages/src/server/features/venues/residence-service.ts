import { villageNow } from "../../adapters/time/clock-gate.js";
import { randomUUID } from "node:crypto";
import type { VillageSnapshot } from "../../domain/models/world.js";
import { completeResidenceMove, requestResidenceMove, decideResidenceMove } from "../../domain/rules/residence-move.js";
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
      requestResidenceMove(state, characterId, proposedVenueId, requestedBy, privateZoneId, requestId, villageNow());
      if (sourceKey) state.processedActionIds = [...state.processedActionIds, sourceKey].slice(-256);
    });
    return buildVillageSnapshot();
  }

  async function approveVillageResidence(characterValue: unknown, expectedScope?: string): Promise<VillageSnapshot> {
    return decideVillageResidence(characterValue, true, expectedScope);
  }

  async function decideVillageResidence(
    characterValue: unknown,
    approved: boolean,
    expectedScope?: string,
  ): Promise<VillageSnapshot> {
    const characterId = residenceCharacterId(characterValue);
    await mutateVillageState((state) => {
      decideResidenceMove(state, characterId, approved, "player", undefined, expectedScope, villageNow());
    });
    return buildVillageSnapshot();
  }

  /** The clock and debug action share the exact same atomic transition. */
  async function completeVillageResidence(
    characterValue: unknown,
    force = false,
    now = villageNow(),
  ): Promise<VillageSnapshot> {
    const characterId = residenceCharacterId(characterValue);
    await mutateVillageState((state) => {
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
