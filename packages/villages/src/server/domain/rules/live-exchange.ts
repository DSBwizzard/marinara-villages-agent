import type { LiveEvidenceContext, LiveExchangeProposals } from "../models/memory-model.js";
import type { RelationshipEvidenceLine } from "../models/relationship-types.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VenueLine } from "../models/scene-model.js";
import { asRecord } from "./coerce.js";
import { RELATIONSHIP_REVIEW_INSTRUCTION } from "./relationship-review.js";
import { coerceResponseDiagnostics, type ResponseDiagnostics } from "./response-diagnostics.js";
import { SCENE_MEMORY_INSTRUCTION } from "./scene-memories.js";
import { memoryHash } from "./memory-integrity.js";

type MemorySourceLine = Omit<VenueLine, "kind"> & { kind?: string };
const memoryEvidenceFingerprint = (line: MemorySourceLine) =>
  memoryHash([
    line.id,
    line.content,
    line.speakerId,
    line.role,
    line.kind,
    line.delivery,
    line.targetId,
    line.heardBy,
    line.soundOnly,
    line.contactHidden,
    line.attentionEvidence,
    line.contactReport,
  ]);

// Saved reviews have exact line IDs; a reply being written has only segment
// indexes. Keep the same policy without importing the review's conflicting example.
export const LIVE_RELATIONSHIP_INSTRUCTION = RELATIONSHIP_REVIEW_INSTRUCTION.replace(
  "Return relationshipReview:",
  "For relationshipChanges use:",
)
  .replace('lineIds:["exact evidence ID"]', 'lineIds:["player",0]')
  .replace(
    "Use only listed IDs and evidence in this batch.",
    'Use only listed character and Zone IDs. In every relationship lineIds array, use numeric zero-based indexes for current segments, "player" for the current player line, or exact supplied earlier evidence IDs. Do not quote numeric indexes (0 is valid; "0" is not), invent future saved line IDs, or cite unsupplied history.',
  );

export const LIVE_MEMORY_INSTRUCTION =
  SCENE_MEMORY_INSTRUCTION +
  " Return relationshipChanges:{changes:[],permissions:[],disclosures:[],intentions:[]} even when empty. Relationship proposals are independent of memories. " +
  LIVE_RELATIONSHIP_INSTRUCTION;

export function bindLiveProposals(
  reply: {
    memoryContexts?: Record<string, import("./scene-memories.js").SceneMemoryContext>;
    responseDiagnostics?: ResponseDiagnostics;
    evidenceFingerprints?: Record<string, string>;
    memoryChanges?: unknown;
    relationshipChanges?: unknown;
    earlierLineIds?: string[];
  },
  playerLineId: string,
  replyLineIds: string[],
  lines: readonly MemorySourceLine[],
): LiveExchangeProposals {
  const allowed = new Set([playerLineId, ...replyLineIds, ...(reply.earlierLineIds ?? [])]);
  const fingerprints = Object.fromEntries(
    lines.filter((row) => allowed.has(row.id)).map((row) => [row.id, memoryEvidenceFingerprint(row)]),
  );
  return {
    version: 1,
    sourceFingerprint: memoryHash(fingerprints),
    ...(reply.memoryContexts ? { memoryContexts: structuredClone(reply.memoryContexts) } : {}),
    evidenceFingerprints: fingerprints,
    ...(reply.responseDiagnostics ? { responseDiagnostics: coerceResponseDiagnostics(reply.responseDiagnostics) } : {}),
    memoryChanges: reply.memoryChanges,
    relationshipChanges: reply.relationshipChanges,
    earlierLineIds: reply.earlierLineIds ?? [],
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
          ...second.memoryChanges.map((value) => ({
            ...asRecord(value),
            learners: Object.fromEntries(
              Object.entries(asRecord(asRecord(value).learners)).map(([id, raw]) => [
                id,
                {
                  ...asRecord(raw),
                  support: Array.isArray(asRecord(raw).support)
                    ? (asRecord(raw).support as unknown[]).map((citation) => ({
                        ...asRecord(citation),
                        lineId: (remap([asRecord(citation).lineId]) as unknown[])[0],
                      }))
                    : undefined,
                },
              ]),
            ),
          })),
        ]
      : undefined;
  const a = asRecord(first.relationshipChanges),
    b = asRecord(second.relationshipChanges);
  return {
    responseDiagnostics: second.responseDiagnostics ?? first.responseDiagnostics,
    memoryChanges: memories,
    relationshipChanges: Object.fromEntries(
      ["changes", "permissions", "disclosures", "intentions"].map((key) => [
        key,
        Array.isArray(a[key]) && Array.isArray(b[key])
          ? [...a[key], ...b[key].map((value) => ({ ...asRecord(value), lineIds: remap(asRecord(value).lineIds) }))]
          : undefined,
      ]),
    ),
    earlierLineIds: [...new Set([...(first.earlierLineIds ?? []), ...(second.earlierLineIds ?? [])])],
    memoryContexts: { ...first.memoryContexts, ...second.memoryContexts },
  };
}
export function liveEvidence(scene: VenueScene, proposals: LiveExchangeProposals): RelationshipEvidenceLine[] {
  const allowed = new Set([...proposals.earlierLineIds, proposals.playerLineId, ...proposals.replyLineIds]);
  const selected = scene.lines.filter((line) => allowed.has(line.id));
  if (
    proposals.sourceFingerprint !==
    memoryHash(Object.fromEntries(selected.map((line) => [line.id, memoryEvidenceFingerprint(line)])))
  )
    throw new Error("Saved Scene source identity changed; recover saved data before replay.");
  return selected
    .filter((line) => !line.contactReport)
    .map((line) => {
      const expected = proposals.evidenceFingerprints?.[line.id];
      if (!expected || expected !== memoryEvidenceFingerprint(line))
        throw new Error("Saved Scene evidence fingerprint changed; recover saved data before replay.");
      return line;
    })
    .map((line) => ({
      ...line,
      speakerId: line.role === "user" ? "player" : line.speakerId,
      playerHeard:
        (!line.contactHidden || line.attentionEvidence === true) &&
        (line.kind !== "whisper" || line.targetId === "player"),
    }));
}

export function createLiveEvidenceContext(scene: VenueScene, proposals: LiveExchangeProposals): LiveEvidenceContext {
  const lines = Object.freeze(
    liveEvidence(scene, proposals).map((line) => Object.freeze({ ...line, heardBy: [...line.heardBy] })),
  );
  return Object.freeze({ lines, byId: new Map(lines.map((line) => [line.id, line])) });
}
