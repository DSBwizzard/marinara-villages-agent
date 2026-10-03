import { MAX_MEMORY_LENGTH } from "./memory-policy.js";
import { createHash } from "node:crypto";
import { asRecord } from "./coerce.js";
import type { VenueScene } from "./venue-session.js";
import type { VillageChronicleEntry, VillageMemoryCategory } from "./types.js";
import type { DomainProcessing } from "./exchange-processing.js";
import { mutateVillageState, readVillageState } from "./village-store.js";
import { mutateRelationships, applyRelationshipReview } from "./relationship-store.js";
import {
  parseRelationshipProposals,
  substantiveContact,
  RELATIONSHIP_REVIEW_INSTRUCTION,
} from "./relationship-review.js";
import { captureRelationshipKnowledge } from "./relationships.js";
import type { RelationshipEvidenceLine } from "./relationship-types.js";
import { deriveVillageMoment } from "./village-clock.js";
import { EVENT_MEMORY_GUIDANCE } from "./venue-writing.js";

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

export const LIVE_MEMORY_INSTRUCTION = `Return memoryChanges:[] and relationshipChanges:{changes:[],permissions:[],disclosures:[]} even when empty. Memory proposals use {kind:"passing|durable|reinforce|supersede",text,category:"commitment|personal-fact|preference|relationship|shared-experience",subjectCharacterIds:[],knownByCharacterIds:[],evidence:["player",0],memoryIds:[]}. Numeric evidence is a zero-based segment index in this reply; "player" means the latest player line. You may also cite exact earlier evidence IDs listed below. Recaps are context, never evidence. Every knower must directly witness EVERY cited line. Use passing for useful temporary continuity (24 hours); durable only for commitments, stable personal facts, meaningful preferences/boundaries, relationship changes, or significant shared experiences. Omit greetings, filler, weak inference, transient mood, repetition and facts already represented in world state. There is NO promotion quota. For reinforcement or a correction, cite the supplied existing memory ID in memoryIds, with new witnessed evidence; supersede replaces an obsolete fact, reinforce preserves its text. A memory does not prove a physical action or grant authority. ${EVENT_MEMORY_GUIDANCE} Relationship proposals are independent of memories. Use evidence references in relationship lineIds in the same format as memory evidence. ${LIVE_RELATIONSHIP_INSTRUCTION}`;

export type LiveExchangeProposals = {
  version: 1;
  memoryChanges: unknown;
  relationshipChanges: unknown;
  earlierLineIds: string[];
  memoryVersions: Record<string, string>;
  playerLineId: string;
  replyLineIds: string[];
};
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
function refs(value: unknown, proposals: LiveExchangeProposals): string[] {
  if (!Array.isArray(value) || !value.length) throw new Error("Required cited evidence absent");
  return [
    ...new Set(
      value.map((ref) => {
        const id =
          ref === "player" ? proposals.playerLineId : typeof ref === "number" ? proposals.replyLineIds[ref] : ref;
        if (
          typeof id !== "string" ||
          !id ||
          ![proposals.playerLineId, ...proposals.replyLineIds, ...proposals.earlierLineIds].includes(id)
        )
          throw new Error("Citation was not supplied in this reply context");
        return id;
      }),
    ),
  ];
}
const categories = ["commitment", "personal-fact", "preference", "relationship", "shared-experience"];
const ids = (value: unknown): string[] =>
  Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && !!id))] : [];
const sameIds = (a: string[], b: string[]) => [...a].sort().join("\n") === [...b].sort().join("\n");

export async function processLiveMemories(scene: VenueScene, submissionId: string): Promise<Partial<DomainProcessing>> {
  const turn = scene.submissions.find((turn) => turn.id === submissionId)!;
  const proposals = turn.liveProposals;
  if (!proposals || !Array.isArray(proposals.memoryChanges))
    throw new Error("Memory proposals missing or incomplete; replay saved work or explicitly retry interpretation");
  if (proposals.memoryChanges.length > 16) throw new Error("Too many memory proposals");
  if (!proposals.memoryChanges.length) return { reason: "No memory changes proposed", receiptIds: [] };
  const evidence = liveEvidence(scene, proposals);
  const byId = new Map(evidence.map((line) => [line.id, line]));
  const at = turn.at!;
  const receiptIds: string[] = [],
    errors: string[] = [];
  await mutateVillageState((state) => {
    if (state.seed !== scene.villageSeed) throw new Error("Village identity changed");
    receiptIds.length = 0;
    errors.length = 0;
    const residents = new Set(state.villagers.map((person) => person.characterId));
    if (Array.isArray(proposals.memoryChanges))
      proposals.memoryChanges.forEach((value, index) => {
        const id = `${scene.id}:${turn.id}:memory:${index}`;
        const prior = state.exchangeReceipts[id];
        if (prior) {
          receiptIds.push(id);
          if (prior.status === "rejected") errors.push(prior.reason);
          return;
        }
        let lineIds: string[] = [];
        try {
          const row = asRecord(value),
            kind = row.kind;
          if (!["passing", "durable", "reinforce", "supersede"].includes(String(kind)))
            throw new Error("Invalid memory kind");
          const text = typeof row.text === "string" ? row.text.trim() : "";
          if (text.length > MAX_MEMORY_LENGTH) throw new Error("Memory exceeds the saved text limit");
          const subjects = ids(row.subjectCharacterIds),
            knowers = ids(row.knownByCharacterIds);
          lineIds = refs(row.evidence, proposals);
          if (
            !text ||
            !knowers.length ||
            subjects.some((id) => !residents.has(id)) ||
            knowers.some((id) => !residents.has(id))
          )
            throw new Error("Memory text, subjects or witnesses invalid");
          if (lineIds.some((id) => !byId.has(id) || knowers.some((knower) => !byId.get(id)!.heardBy.includes(knower))))
            throw new Error("Memory evidence missing or not heard by every knower");
          if (!lineIds.some((id) => proposals.replyLineIds.includes(id) || id === proposals.playerLineId))
            throw new Error("Memory proposal has no new exchange evidence");
          const memoryIds = ids(row.memoryIds);
          const references = memoryIds.map((id) => state.chronicle.find((memory) => memory.id === id));
          if ((kind === "reinforce" || kind === "supersede") && !references.length)
            throw new Error("Existing memory reference absent");
          if (
            references.some(
              (memory) =>
                !memory ||
                memory.supersededBy ||
                proposals.memoryVersions[memory.id] !== memoryVersion(memory) ||
                !sameIds(memory.knownByCharacterIds ?? memory.actors.map((actor) => actor.id), knowers),
            )
          )
            throw new Error("Referenced memory changed, became obsolete, or has different witnesses");
          if (kind !== "passing" && !categories.includes(String(row.category)))
            throw new Error("Durable memory category invalid");
          const evidenceItem = { visitId: scene.id, submissionId: turn.id, lineIds };
          let savedMemory: VillageChronicleEntry | undefined;
          if (kind === "passing") {
            const expiry = new Date(Date.parse(at) + 24 * 60 * 60 * 1000).toISOString();
            if (Date.parse(expiry) > Date.now()) {
              state.recollections = state.recollections.filter((entry) => Date.parse(entry.expiresAt) > Date.now());
              const repeated = state.recollections.find(
                (entry) =>
                  entry.text.toLowerCase() === text.toLowerCase() &&
                  sameIds(entry.knownByCharacterIds, knowers) &&
                  sameIds(entry.subjectCharacterIds, subjects),
              );
              if (repeated) {
                if (Date.parse(expiry) > Date.parse(repeated.expiresAt)) repeated.expiresAt = expiry;
                if (Date.parse(at) > Date.parse(repeated.lastReinforcedAt)) repeated.lastReinforcedAt = at;
                repeated.reinforcementCount++;
                repeated.sourceLineIds = [...new Set([...repeated.sourceLineIds, ...lineIds])];
                repeated.sourceSubmissionIds.push(turn.id);
                repeated.evidence.push(evidenceItem);
              } else
                state.recollections.unshift({
                  id,
                  visitId: scene.id,
                  occurredAt: at,
                  expiresAt: expiry,
                  text,
                  subjectCharacterIds: subjects,
                  knownByCharacterIds: knowers,
                  sourceLineIds: lineIds,
                  sourceSubmissionIds: [turn.id],
                  evidence: [evidenceItem],
                  reinforcementCount: 0,
                  lastReinforcedAt: at,
                });
            }
          } else if (kind === "reinforce") {
            for (const memory of references as VillageChronicleEntry[]) {
              memory.evidenceHistory = [...(memory.evidenceHistory ?? []), evidenceItem];
              memory.sourceLineIds = [...new Set([...(memory.sourceLineIds ?? []), ...lineIds])];
              if (!memory.lastReinforcedAt || Date.parse(at) > Date.parse(memory.lastReinforcedAt))
                memory.lastReinforcedAt = at;
            }
          } else {
            const duplicate =
              kind === "durable" &&
              state.chronicle.find(
                (memory) =>
                  !memory.supersededBy &&
                  memory.text.toLowerCase() === text.toLowerCase() &&
                  sameIds(memory.knownByCharacterIds ?? [], knowers),
              );
            if (duplicate) {
              duplicate.evidenceHistory = [...(duplicate.evidenceHistory ?? []), evidenceItem];
              duplicate.sourceLineIds = [...new Set([...(duplicate.sourceLineIds ?? []), ...lineIds])];
              if (!duplicate.lastReinforcedAt || Date.parse(at) > Date.parse(duplicate.lastReinforcedAt))
                duplicate.lastReinforcedAt = at;
            } else {
              const moment = deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now: new Date(at) });
              savedMemory = {
                id,
                text,
                dayIndex: moment.dayIndex,
                clock: moment.dayPhase,
                occurredAt: at,
                timePrecision: "exact",
                scope: "private",
                kind: "chat",
                actors: knowers.map((id) => ({
                  id,
                  name: state.villagers.find((person) => person.characterId === id)!.cardSnapshot.name,
                })),
                memoryCategory: row.category as VillageMemoryCategory,
                subjectCharacterIds: subjects,
                knownByCharacterIds: knowers,
                sourceLineIds: lineIds,
                sourceVisitId: scene.id,
                evidenceHistory: [evidenceItem],
                lastReinforcedAt: at,
              };
              state.chronicle.unshift(savedMemory);
              for (const memory of references as VillageChronicleEntry[]) {
                memory.supersededBy = id;
                memory.supersededAt = at;
                memory.evidenceHistory = [...(memory.evidenceHistory ?? []), evidenceItem];
              }
            }
          }
          const visible = lineIds.every((id) => byId.get(id)?.playerHeard !== false);
          state.exchangeReceipts[id] = {
            id,
            domain: "memories",
            sceneId: scene.id,
            submissionId: turn.id,
            at,
            evidenceIds: lineIds,
            reason: "Cited memory applied",
            status: "applied",
            ...(savedMemory && visible
              ? { notice: { id, kind: "memory", text: "A memory was forged.", detail: savedMemory.text } }
              : {}),
          };
        } catch (error) {
          const reason = String(error).replace(/^Error: /u, "");
          errors.push(reason);
          state.exchangeReceipts[id] = {
            id,
            domain: "memories",
            sceneId: scene.id,
            submissionId: turn.id,
            at,
            evidenceIds: lineIds,
            reason,
            status: "rejected",
          };
        }
        receiptIds.push(id);
      });
  });
  return {
    status: errors.length ? "rejected" : "applied",
    reason: errors.join("; ") || "Cited memory proposals applied",
    receiptIds,
  };
}

export async function processLiveRelationships(
  scene: VenueScene,
  submissionId: string,
): Promise<Partial<DomainProcessing>> {
  const turn = scene.submissions.find((turn) => turn.id === submissionId)!;
  const proposals = turn.liveProposals;
  if (!proposals) throw new Error("Relationship proposals missing; explicit interpretation retry required");
  const raw = asRecord(proposals.relationshipChanges),
    lines = liveEvidence(scene, proposals);
  const village = await readVillageState();
  if (village.seed !== scene.villageSeed) throw new Error("Village identity changed");
  const { review, rejections } = parseRelationshipProposals(raw, scene.id + ":" + turn.id, lines, village, (row) => ({
    ...row,
    lineIds: refs(row.lineIds, proposals),
  }));
  const actors = [...new Set(lines.map((line) => (line.role === "user" ? "player" : line.speakerId)))].filter(
    (id) => id === "player" || village.villagers.some((person) => person.characterId === id),
  );
  for (const fromId of actors.filter((id) => id !== "player"))
    for (const toId of actors) {
      if (fromId === toId || !substantiveContact(lines, fromId, toId)) continue;
      review.changes.push({
        id: `${scene.id}:${turn.id}:contact:${fromId}:${toId}`,
        fromId,
        toId,
        dimension: "warmth",
        amount: 0,
        ordinary: true,
        reason: "Shared substantive contact.",
        lineIds: lines.filter((line) => line.heardBy.includes(fromId)).map((line) => line.id),
        disclosed: false,
        contact: true,
        contactOnly: true,
      });
    }
  const receiptIds = [...review.changes, ...review.permissions, ...review.disclosures].map((row) => row.id);
  if (!receiptIds.length)
    return {
      status: rejections.length ? "rejected" : "applied",
      reason: rejections.length ? "Relationship proposals rejected" : "No relationship changes or substantive contact",
      receiptIds,
      rejectedProposals: rejections,
    };
  await mutateRelationships(village.seed, (state) => {
    applyRelationshipReview(state, review, village, scene.id, turn.at);
    for (const id of receiptIds) {
      const receipt = state.receipts[id];
      if (!receipt || receipt.noticeSequence) continue;
      receipt.sceneId = scene.id;
      receipt.submissionId = turn.id;
      receipt.committedAt = new Date().toISOString();
      receipt.noticeSequence = ++state.noticeSequence;
    }
    captureRelationshipKnowledge(state, village);
  });
  return { reason: "Cited relationship proposals applied", receiptIds, rejectedProposals: rejections };
}
