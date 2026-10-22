import type { RelationshipReceipt, RelationshipState } from "../models/relationship-types.js";
import { selectSocialRecords } from "./social-context.js";
import type { VillageState } from "../models/world.js";

/** Only the resident's own perspective and source-linked history goes to Narration. */
export function relationshipWritingPrompt(village: VillageState, fromId: string): string {
  const state = village.relationshipContext;
  const name = (id: string) =>
    id === "player"
      ? "the player"
      : (village.villagers.find((person) => person.characterId === id)?.cardSnapshot.name ?? id);
  const edges = Object.values(state?.edges ?? {}).filter((edge) => edge.fromId === fromId);
  return [
    "Your particular social perspective. Other people's private feelings are not your knowledge. Missing history establishes neither distrust nor intimacy.",
    ...edges.map((edge) =>
      JSON.stringify({
        toward: name(edge.toId),
        targetId: edge.toId,
        connection: edge.connection,
        stance: edge.stance,
        expectations: edge.expectations,
        concerns: edge.concerns,
        records: selectSocialRecords(
          Object.values(edge.records).filter((record) => !record.knownBy || record.knownBy.includes(fromId)),
          [fromId],
          [edge.connection, ...edge.concerns, ...edge.expectations].join(" "),
          600,
        ),
        definingExperiences: edge.experiences
          .slice(-4)
          .flatMap((id) =>
            state?.receipts[id] ? [{ at: state.receipts[id]!.at, reason: state.receipts[id]!.reason }] : [],
          ),
      }),
    ),
    "Your current social intentions: " + JSON.stringify(state?.intentions[fromId] ?? []),
    "Keep personality and initiative. You may initiate contact, offer something the player may decline, withdraw, refuse or end a bond. Friendship, romance and partnership require particular history; one never automatically implies another. Never decide the player's feelings, consent, speech or actions. Keep private reasons private unless you choose to communicate them. Written or spoken claims do not establish physical deeds. Explicit permissions are separate from friendship.",
  ].join("\n");
}
export const relationshipPrompt = relationshipWritingPrompt;

/** A private interpretation never produces a public notification. Disclosures are visible in their source. */
export function relationshipChangeNotices(
  _receipts: RelationshipReceipt[],
  _state: RelationshipState,
  _village: VillageState,
): { id: string; kind: "relationship-up" | "relationship-down"; text: string; detail?: string }[] {
  return [];
}
export function filterRelationshipNotices<T extends { id: string; kind: string }>(
  notices: readonly T[],
  _state: RelationshipState | undefined,
): T[] {
  return notices.filter((notice) => notice.kind !== "relationship-up" && notice.kind !== "relationship-down");
}
