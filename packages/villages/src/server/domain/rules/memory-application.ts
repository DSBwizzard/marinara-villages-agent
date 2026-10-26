import type {
  CommittedMemoryEffect,
  MemoryCollection,
  MemoryCandidate,
  MemoryEvidence,
  MemoryLearning,
  MemoryProposal,
  MemoryRecord,
  MemoryRepair,
  MemorySceneSnapshot,
  MemorySource,
} from "../models/memories.js";
import {
  memoryHash,
  memoryKnowerId,
  memoryObject,
  memoryRequire,
  memoryString,
  memoryTimestamp,
  validateMemoryDomain,
  validateMemoryLearning,
  validateMemoryRecord,
  validateMemorySource,
} from "./memory-integrity.js";
import { checkMemoryScreening, type MemoryProtectionContext } from "./memory-protection.js";
import { retainMemoryScenes } from "./memory-views.js";

export type MemoryApplicationContext = {
  source: MemorySource;
  occurredAt: string;
  recordedAt: string;
  /** Trusted accepted evidence, projected for actual witnesses by the caller. */
  evidence: MemoryEvidence[];
  committedEffects: CommittedMemoryEffect[];
  protection: MemoryProtectionContext;
  recall: { candidates: MemoryCandidate[]; targetIds: string[] };
};
const same = (a: unknown, b: unknown) => memoryHash(a) === memoryHash(b);
export function memoryIdentity(source: MemorySource, proposalId: string, effectId?: string) {
  return "memory-" + memoryHash(effectId ? ["effect", effectId] : [source.kind, source.id, proposalId]).slice(0, 32);
}
function targetRecords(collection: MemoryCollection, target: MemoryRepair["target"]) {
  memoryObject(target, ["id", "revision", "rootRevision"]);
  const record = collection.records.find((row) => row.id === target.id);
  const root = record && collection.records.find((row) => row.id === record.rootId);
  memoryRequire(record && root, "unknown target");
  memoryRequire(record.revision === target.revision && root.revision === target.rootRevision, "stale target");
  return { record, root };
}
function replay(collection: MemoryCollection, operationId: string, fingerprint: string, targetId: string | undefined) {
  const record = collection.records.find((row) => row.id === targetId);
  if (record?.lastApplication.id !== operationId) return false;
  memoryRequire(record.lastApplication.fingerprint === fingerprint, "operation identity reused");
  return true;
}
function commit(collection: MemoryCollection, changes: MemoryRecord[], snapshots: readonly MemorySceneSnapshot[]) {
  const revision = collection.revision + 1;
  for (const record of changes) {
    record.updatedRevision = revision;
    validateMemoryRecord(record);
  }
  const replacements = new Map(changes.map((row) => [row.id, row]));
  const records = collection.records.map((row) => replacements.get(row.id) ?? row);
  const existing = new Set(collection.records.map((row) => row.id));
  records.push(...changes.filter((row) => !existing.has(row.id)));
  return {
    collection: { format: 1 as const, revision, records },
    snapshots: retainMemoryScenes(
      collection,
      changes.map((row) => row.id),
      snapshots,
    ),
    status: "applied" as const,
  };
}
export function mergeMemoryLearning(
  previous: MemoryRecord["knowers"][string] | undefined,
  learning: MemoryLearning,
  at: string,
) {
  // Retain original support and the newest exact evidence, not an exhaustive conversational bank.
  const support = previous
    ? [previous.support[0], ...learning.support]
        .filter((row, i, rows) => rows.findIndex((other) => same(row, other)) === i)
        .slice(-2)
    : learning.support;
  if (previous && !support.some((row) => same(row, previous.support[0]))) support[0] = previous.support[0];
  return {
    ...previous,
    ...structuredClone(learning),
    support: structuredClone(support),
    learnedAt: previous?.learnedAt ?? at,
    reinforcedAt: previous && previous.reinforcedAt > at ? previous.reinforcedAt : at,
  };
}
/** Pure single-proposal application. A rejected proposal does not roll back dialogue/other effects.
 * The adapter must CAS the collection and all returned active Scene snapshots atomically.
 */
export function applyMemoryProposal(
  collection: MemoryCollection,
  proposal: MemoryProposal,
  context: MemoryApplicationContext,
  snapshots: readonly MemorySceneSnapshot[] = [],
) {
  memoryObject(proposal, [
    "operationId",
    "source",
    "proposalId",
    "expectedCollectionRevision",
    "target",
    "action",
    "kind",
    "text",
    "subjects",
    "learners",
    "domainRef",
    "effectId",
    "screening",
  ]);
  memoryString(proposal.operationId, 160);
  memoryString(proposal.proposalId, 160);
  validateMemorySource(proposal.source);
  validateMemorySource(context.source);
  memoryRequire(same(proposal.source, context.source), "source identity changed");
  memoryTimestamp(context.occurredAt);
  memoryTimestamp(context.recordedAt);
  memoryRequire(context.recordedAt >= context.occurredAt, "application before occurrence");
  memoryRequire(["create", "reinforce", "correct", "resolve"].includes(proposal.action), "invalid action");
  memoryObject(proposal.learners);
  const ids = Object.keys(proposal.learners);
  memoryRequire(ids.length > 0, "missing learners");
  for (const [id, learning] of Object.entries(proposal.learners)) {
    memoryString(id, 160);
    validateMemoryLearning(learning, id);
    for (const support of learning.support)
      memoryRequire(
        same(support.source, context.source) &&
          context.evidence.some(
            (trusted) =>
              same(trusted.source, support.source) &&
              trusted.lineId === support.lineId &&
              trusted.excerpt.includes(support.excerpt) &&
              support.audience.every((viewer) => trusted.audience.includes(viewer)),
          ),
        "unaccepted evidence",
      );
  }
  if (proposal.domainRef !== undefined) validateMemoryDomain(proposal.domainRef);
  if (proposal.effectId !== undefined) memoryString(proposal.effectId, 160);
  const id = memoryIdentity(proposal.source, proposal.proposalId, proposal.effectId);
  const fingerprint = memoryHash(proposal);
  const replayId = proposal.action === "reinforce" ? proposal.target?.id : id;
  if (replay(collection, proposal.operationId, fingerprint, replayId))
    return { collection, snapshots: [...snapshots], status: "replayed" as const };
  memoryRequire(proposal.expectedCollectionRevision === collection.revision, "stale collection");
  memoryRequire((proposal.action === "create") === !proposal.target, "invalid target for action");
  const target = proposal.target && targetRecords(collection, proposal.target);
  if (target)
    memoryRequire(
      context.recall.targetIds.includes(target.record.id) &&
        context.recall.candidates.some(
          (row) =>
            ((row.id === target.record.id && row.revision === target.record.revision) ||
              (proposal.action !== "reinforce" &&
                row.rootId === target.record.id &&
                row.rootRevision === target.record.revision)) &&
            row.rootRevision === target.root.revision,
        ),
      "target not supplied by unambiguous recall",
    );
  if (proposal.action === "reinforce")
    for (const id of ids)
      if (target!.root.knowers[id]) {
        let current = target!.root;
        for (const row of collection.records)
          if (
            row.corrects === target!.root.id &&
            row.knowers[id] &&
            !row.knowers[id].forgotten &&
            (row.createdRevision > current.createdRevision ||
              (row.createdRevision === current.createdRevision && row.id < current.id))
          )
            current = row;
        memoryRequire(
          target!.record.id === current.id || target!.record.createdRevision > current.createdRevision,
          "reinforcement would restore an older correction",
        );
      }
  if (proposal.action === "reinforce")
    for (const id of ids)
      if (target!.record.knowers[id])
        memoryRequire(
          context.recall.candidates.some((row) => row.id === target!.record.id && !!row.knowers[id]),
          "reinforcement target is not current for learner",
        );
  if (proposal.action === "reinforce")
    memoryRequire(
      proposal.text === undefined &&
        proposal.kind === undefined &&
        proposal.subjects === undefined &&
        ((proposal.domainRef === undefined && proposal.effectId === undefined) ||
          (proposal.effectId === target!.record.committedEffect?.id &&
            same(proposal.domainRef, target!.record.domainRef))),
      "reinforcement cannot rewrite",
    );
  else {
    memoryString(proposal.text);
    memoryRequire(["experience", "information", "open-matter"].includes(proposal.kind), "missing memory kind");
    memoryRequire(
      Array.isArray(proposal.subjects) && new Set(proposal.subjects).size === proposal.subjects.length,
      "invalid subjects",
    );
    for (const subject of proposal.subjects) memoryString(subject, 160);
    memoryRequire(!collection.records.some((row) => row.id === id), "source outcome already recorded");
  }
  if (proposal.action === "correct")
    memoryRequire(target!.record.id === target!.root.id, "correct canonical root directly");
  if (proposal.action === "resolve")
    memoryRequire(
      target!.record.kind === "open-matter" && target!.record.id === target!.root.id,
      "resolve canonical open matter",
    );
  checkMemoryScreening(collection, context.protection, proposal.screening, {
    knowers: ids,
    query: [
      proposal.text ?? target?.record.text ?? "",
      ...Object.values(proposal.learners).flatMap((state) => state.support.map((e) => e.excerpt)),
    ].join(" "),
    targetIds: proposal.target ? [proposal.target.id] : [],
    sourceRefs: Object.values(proposal.learners).flatMap((state) =>
      state.support.map(({ source, lineId }) => ({ source, lineId })),
    ),
    domainRefs: proposal.domainRef ? [proposal.domainRef] : [],
  });
  const byRoot = new Map<string, MemoryRecord[]>();
  for (const row of collection.records) {
    const rows = byRoot.get(row.rootId) ?? [];
    rows.push(row);
    byRoot.set(row.rootId, rows);
  }
  const protectedRoots = collection.records.filter((row) => row.rootId === row.id);
  for (const root of protectedRoots)
    for (const knower of ids) {
      const state = root.knowers[knower];
      if (!state?.forgotten && !state?.repair) continue;
      const related = byRoot.get(root.id)!;
      const sameSource = related.some((row) =>
        row.knowers[knower]?.support.some((old) =>
          proposal.learners[knower].support.some(
            (incoming) =>
              old.source.kind === incoming.source.kind &&
              old.source.id === incoming.source.id &&
              old.lineId === incoming.lineId,
          ),
        ),
      );
      memoryRequire(!sameSource, "protected source replay");
      if (target?.root.id === root.id) {
        memoryRequire(!state.forgotten, "forgotten target");
        memoryRequire(
          proposal.action === "reinforce" || proposal.text === state.repair?.text || proposal.action === "resolve",
          "repaired target conflict",
        );
      }
    }
  const effect = proposal.effectId && context.committedEffects.find((row) => row.id === proposal.effectId);
  const authoritative = Object.values(proposal.learners).some((row) => row.basis === "validated-event");
  memoryRequire(
    !authoritative || !!effect || (proposal.action === "reinforce" && !!target?.record.committedEffect),
    "committed event required",
  );
  memoryRequire(
    !proposal.effectId ||
      (effect &&
        effect.status === "committed" &&
        same(effect.source, context.source) &&
        same(effect.domainRef, proposal.domainRef) &&
        effect.occurredAt === context.occurredAt &&
        effect.committedAt <= context.recordedAt &&
        ids.every((id) => effect.audience.includes(id))),
    "effect not committed or mismatched",
  );
  const application = { id: proposal.operationId, fingerprint };
  if (proposal.action === "reinforce") {
    const record = structuredClone(target!.record);
    if (effect) {
      memoryRequire(
        record.committedEffect &&
          effect.id === record.committedEffect.id &&
          effect.occurredAt === record.occurredAt &&
          effect.committedAt === record.committedEffect.committedAt,
        "reinforcement effect changed",
      );
      record.committedEffect.audience = [...new Set([...record.committedEffect.audience, ...effect.audience])];
    }
    for (const [knower, learning] of Object.entries(proposal.learners)) {
      memoryRequire(!record.knowers[knower]?.forgotten, "forgotten target");
      memoryRequire(
        learning.basis !== "validated-event" || record.committedEffect?.audience.includes(knower),
        "reinforcement lacks authority",
      );
      record.knowers[knower] = mergeMemoryLearning(record.knowers[knower], learning, context.recordedAt);
    }
    record.revision++;
    record.lastApplication = application;
    const changes = [record];
    if (target!.root.id !== record.id) {
      const root = structuredClone(target!.root);
      for (const [knower, learning] of Object.entries(proposal.learners))
        root.knowers[knower] = {
          ...mergeMemoryLearning(root.knowers[knower], learning, context.recordedAt),
          learnedVia: record.id,
        };
      root.revision++;
      root.lastApplication = application;
      changes.push(root);
    }
    return commit(collection, changes, snapshots);
  }
  const record: MemoryRecord = {
    id,
    rootId: proposal.action === "correct" ? target!.root.id : id,
    revision: 1,
    createdRevision: collection.revision + 1,
    updatedRevision: collection.revision + 1,
    kind: proposal.kind!,
    text: proposal.text!,
    subjects: [...proposal.subjects!],
    knowers: Object.fromEntries(
      Object.entries(proposal.learners).map(([knower, learning]) => [
        knower,
        mergeMemoryLearning(undefined, learning, context.recordedAt),
      ]),
    ),
    origin: structuredClone(context.source),
    occurredAt: context.occurredAt,
    recordedAt: context.recordedAt,
    ...(proposal.domainRef ? { domainRef: structuredClone(proposal.domainRef) } : {}),
    ...(effect ? { committedEffect: structuredClone(effect) } : {}),
    ...(proposal.action === "correct" ? { corrects: target!.root.id } : {}),
    ...(proposal.action === "resolve" ? { resolves: target!.record.id } : {}),
    lastApplication: application,
  };
  const changes = [record];
  if (proposal.action === "correct") {
    const root = structuredClone(target!.root);
    for (const [knower, learning] of Object.entries(proposal.learners))
      if (!root.knowers[knower])
        root.knowers[knower] = {
          ...mergeMemoryLearning(undefined, learning, context.recordedAt),
          learnedVia: record.id,
        };
    root.revision++;
    root.lastApplication = application;
    changes.push(root);
  }
  return commit(collection, changes, snapshots);
}
/** Out-of-world repair: no teaching, transcript changes, fictional evidence or gameplay writes. */
export function applyMemoryRepair(
  collection: MemoryCollection,
  operation: MemoryRepair,
  at: string,
  snapshots: readonly MemorySceneSnapshot[] = [],
) {
  memoryObject(operation, ["operationId", "expectedCollectionRevision", "target", "knowers", "action", "text"]);
  memoryString(operation.operationId, 160);
  memoryTimestamp(at);
  memoryRequire(["forget", "repair"].includes(operation.action), "invalid repair action");
  memoryRequire(
    Array.isArray(operation.knowers) &&
      operation.knowers.length > 0 &&
      new Set(operation.knowers).size === operation.knowers.length,
    "invalid repair knowers",
  );
  if (operation.action === "repair") memoryString(operation.text);
  else memoryRequire(operation.text === undefined, "forget has no replacement text");
  const fingerprint = memoryHash(operation);
  const selected = collection.records.find((row) => row.id === operation.target?.id);
  if (replay(collection, operation.operationId, fingerprint, selected?.rootId))
    return { collection, snapshots: [...snapshots], status: "replayed" as const };
  memoryRequire(operation.expectedCollectionRevision === collection.revision, "stale collection");
  const { record, root: original } = targetRecords(collection, operation.target);
  const root = structuredClone(original);
  for (const id of operation.knowers) {
    memoryKnowerId(id);
    memoryRequire(record.knowers[id] && root.knowers[id], "repair cannot teach a new knower");
    if (operation.action === "forget") root.knowers[id].forgotten = { at, operationId: operation.operationId };
    else
      root.knowers[id].repair = {
        text: operation.text!,
        at,
        operationId: operation.operationId,
        repairs: { id: record.id, revision: record.revision },
      };
  }
  root.revision++;
  root.lastApplication = { id: operation.operationId, fingerprint };
  return commit(collection, [root], snapshots);
}
