import type {
  CommittedMemoryEffect,
  MemoryCandidate,
  MemoryEvidence,
  MemoryLearning,
  MemoryProposal,
  MemorySource,
} from "../models/memories.js";
import type { RelationshipEvidenceLine } from "../models/relationship-types.js";
import type { VenueLine } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { asRecord } from "./coerce.js";
import { memoryHash, memoryObject, memoryRequire, memoryString, validateMemoryLearning } from "./memory-integrity.js";
import { estimatedMemoryTokens, memoryProtectionContext, type MemoryProtectionContext } from "./memory-protection.js";
import { recallMemories } from "./memory-recall.js";

/** Saved server context for the existing System call; never Narration knowledge. */
export type SceneMemoryContext = {
  learningVersion?: 1;
  protection: MemoryProtectionContext;
  recall: { candidates: MemoryCandidate[]; targetIds: string[] };
};

export const SCENE_MEMORY_INSTRUCTION =
  'Return memoryChanges:[] or meaningful concise records {action:"create|reinforce|correct|resolve",kind?:"experience|information|open-matter",text?,subjects?:[ids],target?:{id,revision,rootRevision},learners:{characterId:{basis:"observation|report|interpretation|validated-event",attributedTo?,support:[{lineId,excerpt:"exact bounded quote"}],disclosed?:{savedField:value}}},domainRef?:{kind:"wish|project|relationship|physical",id,characterId?},effectId?,screening:{disposition:"clear|conflict|uncertain",protectedRoots:[related rootIds],fingerprint}}. Text <=600 UTF-8 bytes; each learner supplies 1-2 exact excerpts <=320 bytes. lineId is "player", current zero-based segment index, or an explicitly supplied earlier evidence ID. Include literal "player" as a learner ONLY for what the player actually heard or saw; subjects never automatically learn. Reports require the actual speaker as attributedTo and establish only what was said, not acceptance or truth. Interpretations may be mistaken; mechanical state stays authoritative. An event fact about Wish, Project, physical outcome or other game mechanics requires basis validated-event, domainRef and its exact effect receipt ID. A proposal/prepared action/draft claim is insufficient; code will require its successful committed receipt. Reinforcement changes no text/kind/subjects; target only an unambiguously supplied current record for each affected learner. Normal corrections target its canonical root; resolutions target an open matter. Never guess an ambiguous historical target or request an expansion call. Open status alone does not justify repeated mention. Use memory.administrative as administrative write constraints, never new character knowledge. Screen EVERY proposal; conflict, uncertain or inadequate screening is rejected individually, retaining dialogue and independent effects. Do not reconstruct forgotten disclosures from domain ledgers. For a genuine player disclosure about a listed Wish use its domainRef with characterId and save only actually disclosed title and status in learners.player.disclosed. For relationship preferences/boundaries/explanations use kind and toId as disclosed fields. Never infer a private title, target, status, consent or reason from context to fill these fields. Omit routine chatter, weak inference and already represented facts.';

export function sceneMemoryContext(
  state: VillageState,
  audience: string[],
  input: string,
  narration = "",
  context = "",
) {
  const budget = 1796;
  const envelopeTokens = estimatedMemoryTokens(JSON.stringify({ administrative: {}, memories: [] }));
  const protection = memoryProtectionContext(
    state.memories,
    { knowers: audience, query: input + " " + narration + " " + context.slice(-4000) },
    budget - envelopeTokens,
  );
  const recall = recallMemories(state.memories, {
    purpose: "system",
    audience,
    query: input,
    narration,
    context,
    names: Object.fromEntries(state.villagers.map((row) => [row.characterId, row.cardSnapshot.name])),
    protection,
    budget,
  });
  // The shown envelope is the complete budgeted memory portion. Server guards stay private.
  const envelope = JSON.parse(recall.serialized) as { memories: MemoryCandidate[]; administrative: unknown };
  const saved: SceneMemoryContext = {
    protection: { ...protection, roots: protection.complete ? protection.roots : [] },
    recall: { candidates: recall.candidates, targetIds: recall.targetIds },
  };
  return { envelope, saved };
}

/** Bind model-selected quotes to immutable accepted Scene bytes and actual witnesses. */
export function bindSceneMemorySuggestion(
  value: unknown,
  input: {
    source: MemorySource;
    operationId: string;
    proposalId: string;
    collectionRevision: number;
    lines: readonly (RelationshipEvidenceLine & Pick<VenueLine, "soundOnly" | "contactReport">)[];
    playerLineId: string;
    replyLineIds: string[];
    residentIds: string[];
    learningVersion?: number;
  },
): { proposal: MemoryProposal; evidence: MemoryEvidence[] } {
  memoryObject(value, [
    "action",
    "kind",
    "text",
    "subjects",
    "target",
    "learners",
    "domainRef",
    "effectId",
    "screening",
  ]);
  memoryObject(value.learners);
  const evidence: MemoryEvidence[] = [];
  const learners = Object.fromEntries(
    Object.entries(value.learners).map(([id, raw]) => {
      memoryRequire(id === "player" || input.residentIds.includes(id), "unknown learner");
      memoryObject(raw, ["basis", "attributedTo", "support", "disclosed"]);
      memoryRequire(Array.isArray(raw.support) && raw.support.length > 0 && raw.support.length <= 2, "invalid support");
      const noise: boolean[] = [];
      let reportSpeaker = raw.attributedTo;
      const support = raw.support.map((citation) => {
        memoryObject(citation, ["lineId", "excerpt"]);
        const lineId =
          citation.lineId === "player"
            ? input.playerLineId
            : typeof citation.lineId === "number"
              ? input.replyLineIds[citation.lineId]
              : citation.lineId;
        const line = input.lines.find((row) => row.id === lineId);
        memoryRequire(line && !line.contactReport, "unsupplied source line");
        const full = id === "player" ? line.playerHeard === true : line.heardBy.includes(id);
        const acoustic =
          line.soundOnly && (id === "player" ? line.soundOnly.player : line.soundOnly.characterIds.includes(id));
        noise.push((!full && !!acoustic) || (line.kind === "narration" && !!(line as VenueLine).attentionEvidence));
        const witnessed = full ? line.content : acoustic ? line.soundOnly!.text : "";
        const excerpt = citation.excerpt === undefined && input.learningVersion === 1 ? witnessed : citation.excerpt;
        memoryString(excerpt, 320);
        memoryRequire(witnessed.includes(excerpt), "unwitnessed source quotation");
        if (raw.basis === "report") {
          if (input.learningVersion === 1)
            memoryRequire(full && line.kind !== "narration", "A report requires fully heard speech");
          if (reportSpeaker === undefined && input.learningVersion === 1)
            reportSpeaker = line.role === "user" ? "player" : line.speakerId;
          memoryRequire(
            reportSpeaker === (line.role === "user" ? "player" : line.speakerId),
            "report attribution changed",
          );
        }
        const item: MemoryEvidence = {
          source: structuredClone(input.source),
          lineId,
          excerpt,
          audience: [id],
        };
        evidence.push(item);
        return item;
      });
      if (noise.every(Boolean))
        memoryRequire(
          value.text === support.map((row) => row.excerpt).join(" ") &&
            raw.basis !== "validated-event" &&
            reportSpeaker === undefined &&
            raw.disclosed === undefined &&
            value.domainRef === undefined &&
            (!Array.isArray(value.subjects) || value.subjects.length === 0),
          "Sound alone cannot establish unseen words or an authoritative event",
        );
      const learning: MemoryLearning = {
        basis: raw.basis,
        ...(reportSpeaker ? { attributedTo: reportSpeaker } : {}),
        support,
        ...(raw.disclosed ? { disclosed: structuredClone(raw.disclosed) } : {}),
      };
      validateMemoryLearning(learning, id);
      return [id, learning];
    }),
  );
  const domain = asRecord(value.domainRef),
    disclosure = learners.player?.disclosed;
  if (domain.kind === "relationship" && learners.player && input.learningVersion === 1) {
    memoryRequire(disclosure, "Relationship player learning requires disclosed fields");
    const speaker = learners.player!.attributedTo;
    memoryRequire(
      learners.player!.basis === "report" &&
        speaker !== "player" &&
        input.residentIds.includes(String(speaker)) &&
        domain.characterId === speaker,
      "Relationship disclosure requires its actual speaker",
    );
    memoryRequire(
      ["explanation", "preference", "boundary", "routine", "history", "connection", "home", "work"].includes(
        String(disclosure.kind),
      ) &&
        (disclosure.toId === "player" || input.residentIds.includes(String(disclosure.toId))),
      "Invalid relationship disclosure fields",
    );
    memoryRequire(
      !["home", "work"].includes(String(disclosure.kind)) || disclosure.toId === speaker,
      "Home and work disclosures must describe the speaker",
    );
  }
  const proposal: MemoryProposal = {
    operationId: input.operationId,
    source: structuredClone(input.source),
    proposalId: input.proposalId,
    expectedCollectionRevision: input.collectionRevision,
    action: value.action,
    learners,
    ...(value.kind !== undefined ? { kind: value.kind } : {}),
    ...(value.text !== undefined ? { text: value.text } : {}),
    ...(value.subjects !== undefined ? { subjects: structuredClone(value.subjects) } : {}),
    ...(value.target !== undefined ? { target: structuredClone(value.target) } : {}),
    ...(value.domainRef !== undefined ? { domainRef: structuredClone(value.domainRef) } : {}),
    ...(value.effectId !== undefined ? { effectId: value.effectId } : {}),
    screening: structuredClone(value.screening),
  };
  return { proposal, evidence };
}

/** Unit identity uses source coordinates and targets, never rewording or output order. */
export function sceneMemoryUnit(value: unknown, resolve: (reference: unknown) => unknown = (value) => value) {
  const row = asRecord(value);
  return memoryHash([
    row.action,
    asRecord(row.target).id,
    row.domainRef,
    Object.entries(asRecord(row.learners))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, state]) => [
        id,
        [
          ...new Set(
            (Array.isArray(asRecord(state).support) ? (asRecord(state).support as unknown[]) : []).map((citation) =>
              JSON.stringify(resolve(asRecord(citation).lineId)),
            ),
          ),
        ].sort(),
      ]),
  ]);
}

/** Only re-read applied canonical receipts authorize a corresponding event fact. */
export function committedSceneMemoryEffects(
  state: VillageState,
  sceneId: string,
  turnId: string,
  source: MemorySource,
  at: string,
): CommittedMemoryEffect[] {
  return Object.values(state.exchangeReceipts).flatMap((receipt): CommittedMemoryEffect[] => {
    if (
      receipt.sceneId !== sceneId ||
      receipt.submissionId !== turnId ||
      receipt.status !== "applied" ||
      !receipt.committedAt
    )
      return [];
    if (receipt.domain === "physical" && receipt.physicalOutcome?.actionReceipt?.happened)
      return [
        {
          status: "committed",
          id: receipt.id,
          source,
          domainRef: { kind: "physical", id: receipt.physicalOutcome.venueId },
          occurredAt: at,
          committedAt: receipt.committedAt,
          audience: receipt.physicalOutcome.actionReceipt.witnessIds ?? [],
        },
      ];
    if (receipt.domain === "wishes" && receipt.actorId && receipt.wishId && receipt.wishOutcome === "fulfilled")
      return [
        {
          status: "committed",
          id: receipt.id,
          source,
          domainRef: { kind: "wish", id: receipt.wishId, characterId: receipt.actorId },
          occurredAt: at,
          committedAt: receipt.committedAt,
          audience: receipt.wishAudience ?? [receipt.actorId],
        },
      ];
    return [];
  });
}
