import type { VenueLine } from "../models/scene-model.js";
import type { WishProposal } from "../models/wish-check-model.js";
import type { VillageState } from "../models/world.js";
import {
  readSocialWishChanges,
  SOCIAL_WISH_INSTRUCTION,
  captureWishAuthority,
  WishInterpretationError,
  type WishAuthority,
} from "./social-wishes.js";
export const WISH_PROPOSAL_INSTRUCTION = SOCIAL_WISH_INSTRUCTION;
export function bindWishProposals(
  value: unknown,
  state: VillageState,
  lines: VenueLine[],
  playerLineId: string,
  replyLineIds: string[],
  _contexts?: unknown,
  _semantic = true,
): { proposals: WishProposal[]; authority: WishAuthority; error: string } {
  let rows: ReturnType<typeof readSocialWishChanges>;
  try {
    rows = readSocialWishChanges(value);
  } catch {
    return {
      proposals: [],
      authority: { version: 1, owners: [] },
      error: "Wish interpretation is incomplete; explicitly retry saved interpretation.",
    };
  }
  const snapshots = Array.isArray(_contexts)
    ? (_contexts as { actorId: string; wishes: import("../models/world.js").VillageWish[]; capturedAt: string }[])
    : [];
  const actors = new Set(rows.map((row) => row.actorId));
  const captured = state.villagers
    .filter((owner) => actors.has(owner.characterId))
    .map((owner) => {
      const old = snapshots.find((s) => s.actorId === owner.characterId);
      if (old && (typeof old.capturedAt !== "string" || !Array.isArray(old.wishes)))
        throw new WishInterpretationError("Saved Wish interpretation context is incomplete.");
      return {
        characterId: owner.characterId,
        cardSnapshot: { capturedAt: old ? old.capturedAt : owner.cardSnapshot.capturedAt },
        wishes: old ? old.wishes : owner.wishes,
      };
    });
  const proposals = rows.map((row) => {
    const evidence = Array.isArray(row.evidence)
      ? row.evidence.map((ref) =>
          ref === "player" ? playerLineId : typeof ref === "number" ? (replyLineIds[ref] ?? "") : ref,
        )
      : [];
    return { ...row, evidence };
  });
  return { proposals, authority: captureWishAuthority(captured, rows), error: "" };
}
