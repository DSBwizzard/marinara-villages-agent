import type { StartingHistoryState } from "../models/starting-history-model.js";
import type { VillageState } from "../models/world.js";

export const emptyStartingHistory = (): StartingHistoryState => ({
  reviewed: {},
  sourceHash: "",
  clarifications: [],
  conflicts: [],
});
export function startingHistoryReady(state: Pick<VillageState, "villagers" | "startingHistory">) {
  return state.villagers.every((person) => state.startingHistory.reviewed[person.characterId] === person.incarnation);
}
