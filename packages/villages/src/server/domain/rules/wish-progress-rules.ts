import type { VenueLine } from "../models/scene-model.js";
import type { WishProposal } from "../models/wish-check-model.js";
import type { VillageState } from "../models/world.js";
import { SOCIAL_WISH_INSTRUCTION, wishFingerprint } from "./social-wishes.js";
export const WISH_PROPOSAL_INSTRUCTION = SOCIAL_WISH_INSTRUCTION;
export function bindWishProposals(
  value: unknown,
  state: VillageState,
  lines: VenueLine[],
  playerLineId: string,
  replyLineIds: string[],
  _contexts?: unknown,
  _semantic = true,
): { proposals: WishProposal[]; error: string } {
  if (!Array.isArray(value))
    return { proposals: [], error: "Wish interpretation is incomplete; explicitly retry saved interpretation." };
  const snapshots = Array.isArray(_contexts)
    ? (_contexts as { actorId: string; wishes: import("../models/world.js").VillageWish[]; capturedAt: string }[])
    : [];
  const captured = structuredClone(state.villagers).map((owner) => {
    const old = snapshots.find((s) => s.actorId === owner.characterId);
    return old
      ? {
          ...owner,
          wishes: structuredClone(old.wishes),
          cardSnapshot: { ...owner.cardSnapshot, capturedAt: old.capturedAt },
        }
      : owner;
  });
  const proposals = value.map((raw) => {
    const row = raw as import("./social-wishes.js").SocialWishChange;
    const evidence = Array.isArray(row.evidence)
      ? row.evidence.map((ref) =>
          ref === "player" ? playerLineId : typeof ref === "number" ? (replyLineIds[ref] ?? "") : ref,
        )
      : [];
    const wish = captured.find((r) => r.characterId === row.actorId)?.wishes.find((w) => w.id === row.wishId);
    return {
      actorId: row.actorId,
      wishId: row.wishId,
      fingerprint: wish ? wishFingerprint(wish) : "",
      intent: row.intent,
      lineIds: evidence,
      change: { ...row, evidence },
      captured,
    };
  });
  return { proposals, error: "" };
}
