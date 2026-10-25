import type { VillageState } from "../models/world.js";
import { rememberDomainFact } from "./domain-memories.js";
import { forgetVillageMemory } from "./village-memories.js";
/** Withdrawing an erroneous mechanical completion suppresses only its derived event roots.
 * Original bytes, transcripts, independent disclosures and active Scene snapshots survive. */
export function invalidateWishCompletion(state: VillageState, receiptId: string, at: string) {
  const receipt = state.exchangeReceipts[receiptId];
  if (!receipt || receipt.domain !== "wishes" || receipt.wishOutcome !== "fulfilled") return;
  receipt.wishOutcome = "corrected";
  const roots = new Set(
    state.memories.records.filter((row) => row.committedEffect?.id === receiptId).map((row) => row.rootId),
  );
  for (const id of roots) {
    const root = state.memories.records.find((row) => row.id === id)!;
    const knowers = Object.keys(root.knowers).filter((id) => !root.knowers[id].forgotten);
    if (knowers.length)
      forgetVillageMemory(
        state,
        {
          operationId: "withdraw:" + root.id,
          action: "forget",
          expectedCollectionRevision: state.memories.revision,
          target: { id: root.id, revision: root.revision, rootRevision: root.revision },
          knowers,
        },
        at,
      );
  }
}
/** Actual completion receipts outlive Scenes and delayed specialist callbacks. Native proposals
 * settle first; this local fallback only supplies missing owner learning, never player status. */
export function pendingWishMemories(state: VillageState, sceneId: string, submissionId: string) {
  return Object.values(state.exchangeReceipts).filter(
    (receipt) =>
      receipt.sceneId === sceneId &&
      receipt.submissionId === submissionId &&
      receipt.domain === "wishes" &&
      receipt.status === "applied" &&
      receipt.wishOutcome === "fulfilled" &&
      receipt.committedAt &&
      receipt.actorId &&
      receipt.wishId &&
      receipt.wishGoal &&
      !state.memories.records.some((row) => row.committedEffect?.id === receipt.id && row.knowers[receipt.actorId!]),
  );
}
export function fillCommittedWishMemories(
  state: VillageState,
  sceneId: string,
  submissionId: string,
  recordedAt: string,
) {
  for (const receipt of pendingWishMemories(state, sceneId, submissionId))
    rememberDomainFact(state, {
      id: receipt.id,
      effectId: receipt.id,
      sceneId: receipt.sceneId,
      at: receipt.at,
      recordedAt,
      committedAt: receipt.committedAt,
      text: "Wish fulfilled: " + receipt.wishGoal,
      knowers: [receipt.actorId!],
      subjects: [receipt.actorId!],
      domainRef: { kind: "wish", id: receipt.wishId!, characterId: receipt.actorId },
      event: true,
    });
}
