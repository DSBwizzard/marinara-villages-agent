import type { MemoryCandidate, MemoryCollection, MemoryRecord, MemorySceneSnapshot } from "../models/memories.js";
import {
  memoryKnowerId,
  memoryObject,
  memoryRequire,
  memoryString,
  memoryTimestamp,
  validateMemoryRecord,
} from "./memory-integrity.js";
import { memoryTerms } from "./memory-protection.js";

export function captureMemoryScene(
  collection: MemoryCollection,
  sceneId: string,
  audience: string[],
  at: string,
): MemorySceneSnapshot {
  memoryString(sceneId, 160);
  memoryTimestamp(at);
  for (const id of audience) memoryKnowerId(id);
  memoryRequire(audience.length > 0 && new Set(audience).size === audience.length, "invalid Scene audience");
  return { sceneId, capturedRevision: collection.revision, capturedAt: at, audience: [...audience], before: {} };
}
export function readMemorySceneSnapshot(value: unknown): MemorySceneSnapshot {
  memoryObject(value, ["sceneId", "capturedRevision", "capturedAt", "audience", "before"]);
  memoryString(value.sceneId, 160);
  memoryTimestamp(value.capturedAt);
  memoryRequire(
    Number.isSafeInteger(value.capturedRevision) &&
      value.capturedRevision >= 0 &&
      Array.isArray(value.audience) &&
      value.audience.length > 0 &&
      new Set(value.audience).size === value.audience.length,
    "invalid Scene capture",
  );
  for (const id of value.audience) memoryKnowerId(id);
  memoryObject(value.before);
  for (const [id, record] of Object.entries(value.before)) {
    memoryString(id, 160);
    if (record === null) continue;
    validateMemoryRecord(record);
    memoryRequire(
      record.id === id &&
        record.updatedRevision <= value.capturedRevision &&
        Object.keys(record.knowers).every((knower) => value.audience.includes(knower)),
      "invalid Scene preimage",
    );
  }
  return structuredClone(value) as MemorySceneSnapshot;
}
/** Call before writes, and persist the result in the same transaction as those writes. */
export function retainMemoryScenes(
  collection: MemoryCollection,
  changedIds: string[],
  snapshots: readonly MemorySceneSnapshot[],
) {
  const byId = new Map(collection.records.map((row) => [row.id, row]));
  return snapshots.map((snapshot) => {
    memoryRequire(snapshot.capturedRevision <= collection.revision, "future Scene snapshot");
    const before = { ...snapshot.before };
    for (const id of changedIds) {
      if (Object.hasOwn(before, id)) continue;
      const record = byId.get(id);
      if (!record || record.createdRevision > snapshot.capturedRevision) continue;
      const knowers = Object.fromEntries(
        Object.entries(record.knowers).filter(([id]) => snapshot.audience.includes(id)),
      );
      if (!Object.keys(knowers).length) {
        before[id] = null;
        continue;
      }
      const retained = structuredClone({ ...record, knowers });
      for (const state of Object.values(retained.knowers))
        for (const support of state.support)
          support.audience = support.audience.filter((id) => snapshot.audience.includes(id));
      if (retained.committedEffect)
        retained.committedEffect.audience = retained.committedEffect.audience.filter((id) =>
          snapshot.audience.includes(id),
        );
      before[id] = retained;
    }
    return { ...snapshot, before };
  });
}
export function sceneMemoryCollection(collection: MemoryCollection, snapshot: MemorySceneSnapshot): MemoryCollection {
  memoryRequire(snapshot.capturedRevision <= collection.revision, "future Scene snapshot");
  const records = collection.records.flatMap((current) => {
    if (Object.hasOwn(snapshot.before, current.id))
      return snapshot.before[current.id] ? [snapshot.before[current.id]!] : [];
    if (current.createdRevision > snapshot.capturedRevision) return [];
    memoryRequire(current.updatedRevision <= snapshot.capturedRevision, "missing Scene preimage");
    return [current];
  });
  return { format: 1, revision: snapshot.capturedRevision, records };
}
/** Privileged inspection does not grant conversational knowledge. */
export function inspectMemory(collection: MemoryCollection, id: string) {
  return structuredClone(collection.records.find((row) => row.id === id) ?? null);
}
/** Deliberate privileged view. Reading suppressed knowledge never teaches it. */
export function inspectMemoryCandidates(collection: MemoryCollection, knower: string): MemoryCandidate[] {
  memoryKnowerId(knower);
  const visible = projectMemories(collection, [knower]);
  const latest = new Map<string, MemoryRecord>();
  for (const record of collection.records)
    if (record.knowers[knower]) {
      const prior = latest.get(record.rootId);
      if (!prior || record.createdRevision > prior.createdRevision) latest.set(record.rootId, record);
    }
  for (const root of collection.records) {
    const state = root.id === root.rootId && root.knowers[knower];
    if (!state || !state.forgotten) continue;
    const record = latest.get(root.id)!;
    visible.push({
      id: record.id,
      rootId: root.id,
      revision: record.revision,
      rootRevision: root.revision,
      kind: record.kind,
      text: state.repair?.text ?? record.text,
      subjects: [...record.subjects],
      occurredAt: record.occurredAt,
      recordedAt: record.recordedAt,
      ...(record.domainRef ? { domainRef: { ...record.domainRef } } : {}),
      knowers: {
        [knower]: {
          ...structuredClone(record.knowers[knower]),
          forgotten: { ...state.forgotten },
          ...(state.repair ? { repair: { ...state.repair } } : {}),
        },
      },
    });
  }
  return visible;
}
/** Pure ordinary player projection. Domain existence never supplies disclosure visibility. */
export function pagePlayerMemories(
  collection: MemoryCollection,
  request: { limit?: number; query?: string; cursor?: { revision: number; afterId: string } } = {},
) {
  const limit = request.limit ?? 50;
  memoryRequire(Number.isSafeInteger(limit) && limit > 0 && limit <= 100, "invalid page size");
  memoryRequire(!request.cursor || request.cursor.revision === collection.revision, "stale page cursor");
  const terms = memoryTerms(request.query ?? "");
  const eligible = projectMemories(collection, ["player"])
    .filter((row) => {
      const text = [
        row.text,
        row.id,
        row.rootId,
        row.domainRef?.id ?? "",
        ...Object.values(row.knowers).flatMap((state) => state.support.map((e) => e.excerpt)),
      ]
        .join(" ")
        .toLocaleLowerCase("en-US");
      return terms.every((term) => text.includes(term));
    })
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || a.id.localeCompare(b.id));
  const after = request.cursor ? eligible.findIndex((row) => row.id === request.cursor!.afterId) : -1;
  memoryRequire(!request.cursor || after >= 0, "unknown page cursor");
  const rows = eligible.slice(after + 1, after + 1 + limit);
  return {
    revision: collection.revision,
    total: eligible.length,
    rows: rows.map(({ knowers, ...row }) => ({
      ...row,
      knowledge: {
        learnedAt: knowers.player.learnedAt,
        reinforcedAt: knowers.player.reinforcedAt,
        basis: knowers.player.basis,
        ...(knowers.player.repair ? { repair: knowers.player.repair } : {}),
        ...(knowers.player.disclosed ? { disclosed: knowers.player.disclosed } : {}),
      },
    })),
    next: after + 1 + limit < eligible.length ? { revision: collection.revision, afterId: rows.at(-1)!.id } : null,
  };
}
export function playerMemoryEvidence(collection: MemoryCollection, id: string) {
  const row = projectMemories(collection, ["player"]).find((row) => row.id === id);
  return row ? structuredClone({ id: row.id, rootId: row.rootId, ...row.knowers.player }) : null;
}
/** No domain reads. Subjects, domain existence and Inspect never grant knowledge. */
export function projectMemories(collection: MemoryCollection, audience: readonly string[]): MemoryCandidate[] {
  for (const id of audience) memoryKnowerId(id);
  const records = new Map(collection.records.map((row) => [row.id, row]));
  const corrections = new Map<string, Map<string, MemoryRecord>>();
  for (const row of collection.records)
    if (row.corrects) {
      const rows = corrections.get(row.corrects) ?? new Map<string, MemoryRecord>();
      for (const id of audience)
        if (row.knowers[id] && !row.knowers[id].forgotten) {
          const prior = rows.get(id);
          if (
            !prior ||
            row.createdRevision > prior.createdRevision ||
            (row.createdRevision === prior.createdRevision && row.id < prior.id)
          )
            rows.set(id, row);
        }
      corrections.set(row.corrects, rows);
    }
  const result: MemoryCandidate[] = [];
  for (const record of collection.records) {
    const root = records.get(record.rootId)!;
    memoryRequire(root, "missing canonical root");
    const groups = new Map<string, MemoryCandidate>();
    for (const id of audience) {
      const state = record.knowers[id],
        protection = root.knowers[id];
      if (!state || !protection || state.forgotten || protection.forgotten) continue;
      const latest = corrections.get(root.id)?.get(id);
      if (latest && record.rootId === root.id && record.id !== latest.id) continue;
      const repair = protection.repair;
      const text = repair?.text ?? record.text;
      const linkVisible = (link: string | undefined) => {
        const linked = link && records.get(link),
          linkedRoot = linked && records.get(linked.rootId);
        return (
          linked &&
          linked.knowers[id] &&
          !linked.knowers[id].forgotten &&
          linkedRoot?.knowers[id] &&
          !linkedRoot.knowers[id].forgotten
        );
      };
      const key = JSON.stringify([text, !!linkVisible(record.corrects), !!linkVisible(record.resolves)]);
      let projected = groups.get(key);
      if (!projected) {
        projected = {
          id: record.id,
          rootId: record.rootId,
          revision: record.revision,
          rootRevision: root.revision,
          kind: record.kind,
          text,
          subjects: [...record.subjects],
          occurredAt: record.occurredAt,
          recordedAt: record.recordedAt,
          ...(record.domainRef ? { domainRef: { ...record.domainRef } } : {}),
          ...(linkVisible(record.corrects) ? { corrects: record.corrects } : {}),
          ...(linkVisible(record.resolves) ? { resolves: record.resolves } : {}),
          knowers: {},
        };
        groups.set(key, projected);
      }
      const { disclosed, repair: _repair, forgotten: _forgotten, ...knowledge } = state;
      projected.knowers[id] = {
        ...knowledge,
        support: repair ? [] : knowledge.support.map((e) => ({ ...e, source: { ...e.source }, audience: [id] })),
        ...(repair
          ? {
              repair: { ...repair },
              sourceRefs: state.support.map(({ source, lineId }) => ({ source: { ...source }, lineId })),
            }
          : disclosed
            ? { disclosed: { ...disclosed } }
            : {}),
      };
    }
    result.push(...groups.values());
  }
  return result;
}
