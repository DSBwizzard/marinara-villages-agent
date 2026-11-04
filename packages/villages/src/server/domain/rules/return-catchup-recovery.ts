import type { VillageState } from "../models/world.js";

/** Cancellation is safe only while every retained encounter has no committed effects. */
export function returnCatchupHasCommittedEffects(state: VillageState, batchId: string): boolean {
  return (state.socialOutbox ?? []).some(
    (entry) =>
      !entry.processed &&
      entry.catchupBatchId === batchId &&
      (!state.relationshipContext ||
        !!state.relationshipContext.applied[entry.id] ||
        Object.values(state.memoryReceipts).some((receipt) => receipt.sceneId === "offscreen:" + entry.id) ||
        Object.values(state.exchangeReceipts).some((receipt) => receipt.sceneId === "offscreen:" + entry.id)),
  );
}
