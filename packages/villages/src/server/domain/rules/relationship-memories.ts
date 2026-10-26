import type { MemorySource } from "../models/memories.js";
import type { RelationshipDisclosure, RelationshipEvidenceLine } from "../models/relationship-types.js";
import type { VillageState } from "../models/world.js";
import { memoryHash } from "./memory-integrity.js";
import { applyVillageMemory } from "./village-memories.js";
import { memoryProtectionContext } from "./memory-protection.js";

/** Publish already interpreted, player-heard claims after their source is acknowledged.
 * Private social authority never becomes a notebook. Forget/Correct owns every learned row.
 */
export function publishRelationshipDisclosures(
  state: VillageState,
  disclosures: readonly RelationshipDisclosure[],
  source: MemorySource,
  lines: readonly RelationshipEvidenceLine[],
  at: string,
  recordedAt: string,
): void {
  at = new Date(at).toISOString();
  recordedAt = new Date(recordedAt).toISOString();
  source = { ...source, id: Buffer.byteLength(source.id) > 160 ? "social-source:" + memoryHash(source.id) : source.id };
  for (const row of disclosures) {
    const id = "social-disclosure:" + memoryHash(row.id);
    // Check before constructing a proposal at the current collection revision. Replays after
    // Forget/Correct must neither change its fingerprint nor recreate suppressed learning.
    if (state.memoryReceipts[id]) continue;
    const cited = row.lineIds.map((id) => lines.find((line) => line.id === id));
    if (!cited.length || cited.some((line) => !line || !(line.playerHeard ?? line.heardBy.includes("player"))))
      throw new Error("The disclosed source is not available to the player.");
    const spoken = cited.filter(
      (line) => line && line.kind !== "narration" && (line.role === "user" ? "player" : line.speakerId) === row.fromId,
    );
    const quotes = row.excerpts ?? spoken.map((line) => line!.content);
    const supported =
      quotes.length > 0 &&
      quotes.length <= 2 &&
      quotes.every(
        (quote) =>
          quote.trim() && Buffer.byteLength(quote) <= 320 && spoken.some((line) => line!.content.includes(quote)),
      );
    const evidence = supported
      ? quotes.map((quote) => {
          const line = spoken.find((line) => line!.content.includes(quote))!;
          return {
            source,
            lineId: Buffer.byteLength(line.id) > 160 ? "social-line:" + memoryHash(line.id) : line.id,
            excerpt: quote,
            audience: ["player"],
          };
        })
      : [];
    const domainRef = { kind: "relationship" as const, id: memoryHash(row.id), characterId: row.fromId };
    const protection = memoryProtectionContext(state.memories, {
      knowers: ["player"],
      query: row.text,
      sourceRefs: evidence,
      domainRefs: [domainRef],
    });
    const duplicate = state.memories.records.some(
      (memory) =>
        memory.origin.id === source.id &&
        memory.text === row.text &&
        memory.knowers.player &&
        memory.domainRef?.kind === "relationship",
    );
    const oversized = Buffer.byteLength(row.text) > 600;
    if (supported && !oversized && !protection.roots.length && !duplicate)
      applyVillageMemory(
        state,
        {
          operationId: id,
          source,
          proposalId: memoryHash(row.id),
          expectedCollectionRevision: state.memories.revision,
          action: "create",
          kind: "information",
          text: row.text,
          subjects: [...new Set([row.fromId, row.toId])],
          learners: {
            player: {
              basis: "report",
              attributedTo: row.fromId,
              support: evidence,
              disclosed: { kind: row.kind, toId: row.toId },
            },
          },
          domainRef,
          screening: { disposition: "clear", protectedRoots: [], fingerprint: protection.fingerprint },
        },
        {
          source,
          evidence,
          recall: { candidates: [], targetIds: [] },
          protection,
          committedEffects: [],
          occurredAt: at,
          recordedAt,
        },
      );
    state.memoryReceipts[id] = {
      id,
      sceneId: source.sceneId ?? "",
      submissionId: source.id,
      domain: "memories",
      status: !supported || oversized || protection.roots.length ? "rejected" : "applied",
      at,
      committedAt: recordedAt,
      evidenceIds: row.lineIds,
      reason: !supported
        ? "Disclosure needs one or two bounded exact supporting quotes"
        : oversized
          ? "Disclosure exceeds the Memory text limit"
          : protection.roots.length
            ? "Player Memory correction or Forget protects this disclosure"
            : "Witnessed relationship information published",
    };
  }
}
