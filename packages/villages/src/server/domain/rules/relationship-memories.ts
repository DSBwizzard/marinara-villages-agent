import type { MemorySource } from "../models/memories.js";
import type { RelationshipDisclosure, RelationshipEvidenceLine } from "../models/relationship-types.js";
import type { VillageState } from "../models/world.js";
import { memoryHash } from "./memory-integrity.js";
import { applyVillageMemory } from "./village-memories.js";
import { memoryProtectionContext } from "./memory-protection.js";
import { projectMemories } from "./memory-views.js";

export const DISCLOSURE_SUPPORT_FAILURE = "Disclosure needs one or two bounded exact supporting quotes";

function completeSpeechQuotes(lines: readonly string[]): string[] {
  const parts: string[] = [];
  for (const content of lines) {
    let part = "";
    for (const character of content) {
      if (Buffer.byteLength(part + character) > 320) {
        parts.push(part);
        if (parts.length >= 2) return [];
        part = "";
      }
      part += character;
    }
    if (!part.trim()) return [];
    parts.push(part);
    if (parts.length > 2) return [];
  }
  return parts;
}

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
    if ((row.kind === "home" || row.kind === "work") && row.fromId !== row.toId) continue;
    const id = "social-disclosure:" + memoryHash(row.id);
    // Check before constructing a proposal at the current collection revision. Replays after
    // Forget/Correct must neither change its fingerprint nor recreate suppressed learning.
    const prior = state.memoryReceipts[id];
    if (
      prior &&
      !(
        prior.status === "rejected" &&
        prior.id === id &&
        prior.domain === "memories" &&
        prior.reason === DISCLOSURE_SUPPORT_FAILURE &&
        prior.sceneId === (source.sceneId ?? "") &&
        prior.submissionId === source.id &&
        JSON.stringify(prior.evidenceIds) === JSON.stringify(row.lineIds)
      )
    )
      continue;
    const cited = row.lineIds.map((id) => lines.find((line) => line.id === id));
    if (!cited.length || cited.some((line) => !line || !(line.playerHeard ?? line.heardBy.includes("player"))))
      throw new Error("The disclosed source is not available to the player.");
    const spoken = cited.filter(
      (line) => line && line.kind !== "narration" && (line.role === "user" ? "player" : line.speakerId) === row.fromId,
    );
    // Only split complete speech; silently truncating it could discard support for the claim.
    const quotes =
      row.excerpts === undefined ? completeSpeechQuotes(spoken.map((line) => line!.content)) : row.excerpts;
    const supported =
      quotes.length > 0 &&
      quotes.length <= 2 &&
      quotes.every(
        (quote) =>
          quote.trim() && Buffer.byteLength(quote) <= 320 && spoken.some((line) => line!.content.includes(quote)),
      );
    if (prior && !supported) continue;
    // Old failed deliveries have no equal-time source order; never replace possibly newer known terms.
    if (prior && row.kind === "connection" && row.toId === "player") {
      const sourceIds = new Map(state.memories.records.map((memory) => [memory.id, memory.origin.id]));
      if (
        projectMemories(state.memories, ["player"]).some((memory) => {
          const knowledge = memory.knowers.player!;
          return (
            sourceIds.get(memory.id) !== source.id &&
            memory.occurredAt === at &&
            memory.domainRef?.kind === "relationship" &&
            memory.domainRef.characterId === row.fromId &&
            (knowledge.repair ||
              memory.id !== memory.rootId ||
              !knowledge.disclosed ||
              (knowledge.disclosed.kind === "connection" && knowledge.disclosed.toId === "player"))
          );
        })
      )
        continue;
    }
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
              disclosed: {
                kind: row.kind,
                toId: row.toId,
                ...(row.bond
                  ? {
                      ...(row.bond.connection ? { connectionLabel: row.bond.connection } : {}),
                      ...(row.bond.condition ? { conditionLabel: row.bond.condition } : {}),
                      ...(row.bond.tone ? { bondTone: row.bond.tone } : {}),
                    }
                  : {}),
              },
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
        ? DISCLOSURE_SUPPORT_FAILURE
        : oversized
          ? "Disclosure exceeds the Memory text limit"
          : protection.roots.length
            ? "Player Memory correction or Forget protects this disclosure"
            : "Witnessed relationship information published",
    };
  }
}
