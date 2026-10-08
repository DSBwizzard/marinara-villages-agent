import type { LiveEvidenceContext, LiveExchangeProposals } from "../models/memory-model.js";
import type { RelationshipEvidenceLine } from "../models/relationship-types.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageChronicleEntry } from "../models/world.js";
import { asRecord } from "./coerce.js";
import { RELATIONSHIP_REVIEW_INSTRUCTION } from "./relationship-review.js";
import { coerceResponseDiagnostics, type ResponseDiagnostics } from "./response-diagnostics.js";
import { EVENT_MEMORY_GUIDANCE } from "./venue-writing.js";
import { createHash } from "node:crypto";

// Saved reviews have exact line IDs; a reply being written has only segment
// indexes. Keep the same policy without importing the review's conflicting example.
const LIVE_RELATIONSHIP_INSTRUCTION = RELATIONSHIP_REVIEW_INSTRUCTION.replace(
  "Also return relationshipReview:",
  "For relationshipChanges use:",
)
  .replace('lineIds:["exact evidence ID"]', 'lineIds:["player",0]')
  .replace(
    "Use only listed IDs and evidence in this batch.",
    'Use only listed character and Zone IDs. In every relationship lineIds array, use numeric zero-based indexes for current segments, "player" for the current player line, or exact supplied earlier evidence IDs. Do not quote numeric indexes (0 is valid; "0" is not), invent future saved line IDs, or cite unsupplied history.',
  );

export const LIVE_MEMORY_INSTRUCTION = `Return memoryChanges:[] and relationshipChanges:{changes:[],permissions:[],disclosures:[]} even when empty. Memory proposals use {kind:"passing|durable|reinforce|supersede",text,category:"commitment|personal-fact|preference|relationship|shared-experience",subjectCharacterIds:[],knownByCharacterIds:[],evidence:["player",0],memoryIds:[]}. Numeric evidence is a zero-based segment index in this reply; "player" means the latest player line. You may also cite exact earlier evidence IDs listed below. Recaps are context, never evidence. Every knower must directly witness EVERY cited line. Use passing for useful temporary continuity (24 hours); durable only for commitments, stable personal facts, meaningful preferences/boundaries, relationship changes, or significant shared experiences. Omit greetings, filler, weak inference, transient mood, repetition and facts already represented in world state. There is NO promotion quota. For reinforcement or a correction, cite only a supplied existing durable memory ID in memoryIds; passing entries provide temporary context, not durable correction targets. Cite the durable ID with new witnessed evidence; supersede replaces an obsolete fact, reinforce preserves its text. A memory does not prove a physical action or grant authority. ${EVENT_MEMORY_GUIDANCE} Relationship proposals are independent of memories. Use evidence references in relationship lineIds in the same format as memory evidence. ${LIVE_RELATIONSHIP_INSTRUCTION}`;

export function memoryVersion(memory: VillageChronicleEntry): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        memory.id,
        memory.text,
        memory.knownByCharacterIds,
        memory.supersededBy,
        memory.lastReinforcedAt,
      ]),
    )
    .digest("hex");
}
export function bindLiveProposals(
  reply: {
    responseDiagnostics?: ResponseDiagnostics;
    memoryChanges?: unknown;
    relationshipChanges?: unknown;
    earlierLineIds?: string[];
    memoryVersions?: Record<string, string>;
  },
  playerLineId: string,
  replyLineIds: string[],
): LiveExchangeProposals {
  return {
    version: 1,
    ...(reply.responseDiagnostics ? { responseDiagnostics: coerceResponseDiagnostics(reply.responseDiagnostics) } : {}),
    memoryChanges: reply.memoryChanges,
    relationshipChanges: reply.relationshipChanges,
    earlierLineIds: reply.earlierLineIds ?? [],
    memoryVersions: reply.memoryVersions ?? {},
    playerLineId,
    replyLineIds,
  };
}
/** A relayed reply is appended after the messenger's actual delivered line. Keep its citations attached. */
export function mergeLiveReplyProposals(
  first: Parameters<typeof bindLiveProposals>[0],
  second: Parameters<typeof bindLiveProposals>[0],
  offset: number,
) {
  const remap = (value: unknown) =>
    Array.isArray(value)
      ? value.map((ref) => (ref === "player" ? offset - 1 : typeof ref === "number" ? offset + ref : ref))
      : value;
  const memories =
    Array.isArray(first.memoryChanges) && Array.isArray(second.memoryChanges)
      ? [
          ...first.memoryChanges,
          ...second.memoryChanges.map((value) => ({ ...asRecord(value), evidence: remap(asRecord(value).evidence) })),
        ]
      : undefined;
  const a = asRecord(first.relationshipChanges),
    b = asRecord(second.relationshipChanges);
  return {
    responseDiagnostics: second.responseDiagnostics ?? first.responseDiagnostics,
    memoryChanges: memories,
    relationshipChanges: Object.fromEntries(
      ["changes", "permissions", "disclosures"].map((key) => [
        key,
        Array.isArray(a[key]) && Array.isArray(b[key])
          ? [...a[key], ...b[key].map((value) => ({ ...asRecord(value), lineIds: remap(asRecord(value).lineIds) }))]
          : undefined,
      ]),
    ),
    earlierLineIds: [...new Set([...(first.earlierLineIds ?? []), ...(second.earlierLineIds ?? [])])],
    memoryVersions: { ...first.memoryVersions, ...second.memoryVersions },
  };
}
export function liveEvidence(scene: VenueScene, proposals: LiveExchangeProposals): RelationshipEvidenceLine[] {
  const allowed = new Set([...proposals.earlierLineIds, proposals.playerLineId, ...proposals.replyLineIds]);
  return scene.lines
    .filter((line) => allowed.has(line.id) && !line.contactReport)
    .map((line) => ({
      ...line,
      playerHeard: !line.contactHidden && (line.kind !== "whisper" || line.targetId === "player"),
    }));
}

export function createLiveEvidenceContext(scene: VenueScene, proposals: LiveExchangeProposals): LiveEvidenceContext {
  const lines = Object.freeze(
    liveEvidence(scene, proposals).map((line) => Object.freeze({ ...line, heardBy: [...line.heardBy] })),
  );
  return Object.freeze({ lines, byId: new Map(lines.map((line) => [line.id, line])) });
}
