import type {
  MemoryCollection,
  MemoryProposal,
  MemoryRecord,
  MemoryRepair,
} from "../../packages/villages/src/server/domain/models/memories.js";
import {
  applyMemoryProposal,
  type MemoryApplicationContext,
} from "../../packages/villages/src/server/domain/rules/memory-application.js";
import { memoryHash } from "../../packages/villages/src/server/domain/rules/memory-integrity.js";
import { memoryProtectionContext } from "../../packages/villages/src/server/domain/rules/memory-protection.js";
import { recallMemories } from "../../packages/villages/src/server/domain/rules/memory-recall.js";

export const memoryTime = (hours = 0) => new Date(Date.UTC(2025, 0, 1) + hours * 3600000).toISOString();
export const emptyMemories = (): MemoryCollection => ({ format: 1, revision: 0, records: [] });
export function targetOf(collection: MemoryCollection, id = collection.records[0].id) {
  const record = collection.records.find((row) => row.id === id)!;
  return {
    id,
    revision: record.revision,
    rootRevision: collection.records.find((row) => row.id === record.rootId)!.revision,
  };
}
export function memoryProposal(
  collection: MemoryCollection,
  options: {
    text?: string;
    audience?: string[];
    sourceId?: string;
    hour?: number;
    patch?: Partial<MemoryProposal>;
  } = {},
) {
  const text = options.text ?? "Aqua promised to polish the brass telescope lens before the meteor watch.";
  const audience = options.audience ?? ["aqua", "player"];
  const hour = options.hour ?? collection.revision + 1;
  const source = {
    kind: "scene" as const,
    id: options.sourceId ?? "scene-" + hour,
    revision: 1,
    fingerprint: memoryHash(text),
  };
  const support = [{ source, lineId: source.id + "-line", excerpt: text, audience }];
  const proposal: MemoryProposal = {
    operationId: source.id + "-memory",
    source,
    proposalId: "meaning-1",
    expectedCollectionRevision: collection.revision,
    action: "create",
    kind: "open-matter",
    text,
    subjects: ["aqua"],
    learners: Object.fromEntries(audience.map((id) => [id, { basis: "report", attributedTo: "aqua", support }])),
    screening: { disposition: "clear", protectedRoots: [], fingerprint: "" },
    ...options.patch,
  };
  const selector = {
    knowers: Object.keys(proposal.learners),
    query: [proposal.text ?? "", text].join(" "),
    targetIds: proposal.target ? [proposal.target.id] : [],
    sourceRefs: Object.values(proposal.learners).flatMap((state) =>
      state.support.map(({ source, lineId }) => ({ source, lineId })),
    ),
    domainRefs: proposal.domainRef ? [proposal.domainRef] : [],
  };
  const protection = memoryProtectionContext(collection, selector);
  proposal.screening = {
    disposition: "clear",
    protectedRoots: protection.roots.map((row) => row.rootId),
    fingerprint: protection.fingerprint,
  };
  const context: MemoryApplicationContext = {
    source,
    occurredAt: memoryTime(hour),
    recordedAt: memoryTime(hour + 1),
    evidence: support,
    committedEffects: [],
    protection,
    recall: recallMemories(collection, { purpose: "system", audience, query: proposal.target?.id ?? text }),
  };
  return { proposal, context };
}
export function addMemory(collection: MemoryCollection, options: Parameters<typeof memoryProposal>[1] = {}) {
  const { proposal, context } = memoryProposal(collection, options);
  return applyMemoryProposal(collection, proposal, context).collection;
}
export function memoryRepair(
  collection: MemoryCollection,
  action: MemoryRepair["action"],
  knowers = ["aqua"],
  text?: string,
  id = collection.records[0].id,
): MemoryRepair {
  return {
    operationId: "repair-" + collection.revision,
    expectedCollectionRevision: collection.revision,
    target: targetOf(collection, id),
    knowers,
    action,
    ...(text ? { text } : {}),
  };
}

/** Deterministic years of mixed conversations and offscreen activity; no provider or saved world. */
export function realisticMemoryHistory(count: number): MemoryCollection {
  const residents = ["aqua", "gidget", "ella", "milo", "sora", "tessa", "orin", "fern"];
  const places = ["orchard", "workshop", "riverbank", "greenhouse", "old station", "bakery", "music room"];
  const episodes = [
    "promised to mend the festival lantern before rehearsal",
    "shared a preference for quiet breakfasts and plum tea",
    "worried that visitors would disturb the nesting swallows",
    "considered moving closer to the orchard",
    "explained a boundary about borrowing woodworking tools",
    "reported hearing that a friend might leave after harvest",
    "helped restore the rain barrel after the afternoon storm",
    "agreed to meet again for a pottery lesson",
    "wondered whether a riverside market could work in winter",
    "described why the old song brought back a difficult journey",
    "asked for help designing a shaded place to read",
    "returned a borrowed sketchbook and thanked its owner",
  ];
  let random = 713;
  const next = () => {
    random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
    return random;
  };
  const records: MemoryRecord[] = [];
  for (let i = 0; i < count; i++) {
    const actor = residents[next() % residents.length],
      companion = residents[(residents.indexOf(actor) + 1 + (next() % 7)) % 8];
    const place = places[next() % places.length];
    const text =
      i === 0
        ? "Aqua promised to polish the brass telescope lens before the meteor watch."
        : i === 1
          ? "Ella privately concealed a stolen telescope lens in her locked attic."
          : `${actor} ${episodes[next() % episodes.length]} with ${companion} near the ${place}, during season ${Math.floor(i / 120)}.`;
    const audience =
      i === 0
        ? ["aqua", "player"]
        : i === 1
          ? ["ella"]
          : i % 5 === 0
            ? [actor]
            : i % 3 === 0
              ? [actor, companion]
              : [actor, "player"];
    const source = {
      kind: i % 3 === 0 ? ("offscreen" as const) : ("scene" as const),
      id: "history-scene-" + i,
      revision: 1,
      fingerprint: memoryHash([i, text]),
    };
    const at = memoryTime(i * 5);
    const id = "history-memory-" + i;
    const record: MemoryRecord = {
      id,
      rootId: id,
      revision: 1,
      createdRevision: i + 1,
      updatedRevision: i + 1,
      kind: i === 0 || i % 7 === 0 ? "open-matter" : i % 2 ? "information" : "experience",
      text,
      subjects: [i === 0 ? "aqua" : actor, ...(i > 1 ? [companion] : [])],
      origin: source,
      occurredAt: at,
      recordedAt: memoryTime(i * 5 + 1),
      knowers: Object.fromEntries(
        audience.map((knower) => [
          knower,
          {
            basis: i % 4 ? ("observation" as const) : ("report" as const),
            ...(i % 4 ? {} : { attributedTo: actor }),
            support: [
              {
                source,
                lineId: "line-" + i,
                excerpt: i === 0 ? "I'll polish that brass lens for our meteor watch. Bring the star chart." : text,
                audience,
              },
            ],
            learnedAt: memoryTime(i * 5 + 1),
            reinforcedAt: memoryTime(i * 5 + 1),
            ...(i > 1 && i % 41 === 0
              ? {
                  repair: {
                    text: `${actor} asked for a quiet conversation near the ${place}.`,
                    at: memoryTime(i * 5 + 2),
                    operationId: "repair-" + i,
                    repairs: { id, revision: 1 },
                  },
                }
              : {}),
            ...(i > 1 && i % 43 === 0 ? { forgotten: { at: memoryTime(i * 5 + 2), operationId: "forget-" + i } } : {}),
            ...(i > 1 && i % 11 === 0 ? { disclosed: { title: "Move to " + place, status: "considering" } } : {}),
          },
        ]),
      ),
      ...(i > 1 && i % 11 === 0
        ? { domainRef: { kind: "pursuit" as const, id: "move-" + i, characterId: actor } }
        : {}),
      lastApplication: { id: "history-application-" + i, fingerprint: memoryHash([id, text]) },
    };
    if (i > 2 && i % 100 === 0) {
      const prior = records.find((row) => row.id === records[i - 1].rootId)!;
      prior.kind = "open-matter";
      if (!prior.resolves) record.resolves = prior.id;
      record.text = `${actor} reported that the earlier arrangement was settled at the ${place}.`;
    }
    if (i > 2 && i % 101 === 0 && !record.resolves) {
      const prior = records[i - 1];
      if (!prior.corrects && !prior.resolves) {
        record.rootId = prior.id;
        record.corrects = prior.id;
        record.text = `${actor} clarified the earlier explanation: the meeting was at the ${place}.`;
        for (const [knower, state] of Object.entries(record.knowers)) {
          if (!prior.knowers[knower]) prior.knowers[knower] = { ...structuredClone(state), learnedVia: record.id };
          if (state.repair) {
            prior.knowers[knower].repair = state.repair;
            delete state.repair;
          }
          if (state.forgotten) {
            prior.knowers[knower].forgotten = state.forgotten;
            delete state.forgotten;
          }
        }
      }
    }
    records.push(record);
  }
  return { format: 1, revision: count, records };
}
import type { ExchangeEffectReceipt } from "../../packages/villages/src/server/domain/models/wish-check-model.js";
/** Actual-shaped retained native proposals accompany conversational history; no providers. */
export function realisticMemoryReceipts(collection: MemoryCollection): Record<string, ExchangeEffectReceipt> {
  return Object.fromEntries(
    collection.records.map((record) => {
      const id = record.origin.id + ":turn:memory:" + record.id;
      return [
        id,
        {
          id,
          sceneId: record.origin.id,
          submissionId: "turn",
          domain: "memories",
          status: "applied",
          at: record.occurredAt,
          committedAt: record.recordedAt,
          reason: "Cited memory applied",
          evidenceIds: [...new Set(Object.values(record.knowers).flatMap((k) => k.support.map((e) => e.lineId)))],
          memoryProposal: {
            operationId: id,
            source: record.origin,
            proposalId: record.id,
            expectedCollectionRevision: record.createdRevision - 1,
            action: record.corrects ? "correct" : record.resolves ? "resolve" : "create",
            kind: record.kind,
            text: record.text,
            subjects: record.subjects,
            learners: Object.fromEntries(
              Object.entries(record.knowers).map(([knower, learning]) => [
                knower,
                {
                  basis: learning.basis,
                  ...(learning.attributedTo ? { attributedTo: learning.attributedTo } : {}),
                  support: learning.support,
                  ...(learning.disclosed ? { disclosed: learning.disclosed } : {}),
                },
              ]),
            ),
            ...(record.domainRef ? { domainRef: record.domainRef } : {}),
            screening: { disposition: "clear", protectedRoots: [], fingerprint: record.origin.fingerprint },
          },
        } satisfies ExchangeEffectReceipt,
      ];
    }),
  );
}
