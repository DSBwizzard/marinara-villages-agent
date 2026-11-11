export type StartingHistoryState = {
  reviewed: Record<string, string>;
  sourceHash: string;
  lore?: import("../../../shared/contracts/lore.js").LoreUse[];
  clarifications: { id: string; actorIds: string[]; text: string; at: string }[];
  conflicts: { actorIds: string[]; question: string; citations: { sourceId: string; quote: string }[] }[];
};
