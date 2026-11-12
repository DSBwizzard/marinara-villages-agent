import type { VillageState } from "../models/world.js";
import type { ContinuityHolder } from "../models/continuity-model.js";
import { findNpc } from "./places.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";

export function continuityActor(
  state: VillageState,
  id: string,
): Extract<ContinuityHolder, { kind: "actor" }> | undefined {
  if (id === "player") return { kind: "actor", id, incarnation: memoryHash([state.seed, state.setupAt, "player"]) };
  const resident = state.villagers.find((row) => row.characterId === id);
  if (resident) {
    memoryRequire(resident.incarnation, "missing resident incarnation");
    return { kind: "actor", id, incarnation: resident.incarnation };
  }
  // Registry NPC identities are never reused or deleted within a world.
  if (findNpc(state, id)) return { kind: "actor", id, incarnation: memoryHash([state.seed, state.setupAt, id]) };
}

export function relationshipActors(state: VillageState) {
  return [
    continuityActor(state, "player")!,
    ...state.villagers.map(({ characterId: id, incarnation }) => ({ id, incarnation })),
  ];
}
