import type {
  MemoryCollection,
  MemoryProposal,
  MemoryRecord,
  MemoryRepair,
  MemorySceneState,
} from "../models/memories.js";
import type { VillageState } from "../models/world.js";
import {
  applyMemoryProposal,
  applyMemoryRepair,
  mergeMemoryLearning,
  type MemoryApplicationContext,
} from "./memory-application.js";
import {
  memoryObject,
  memoryRequire,
  validateMemoryRecord,
  immutableMemoryRecord,
  immutableMemoryValue,
} from "./memory-integrity.js";
import { captureMemoryScene, readMemorySceneSnapshot, sceneMemoryCollection } from "./memory-views.js";

export function readMemorySceneStates(value: unknown, collection?: MemoryCollection): VillageState["memoryScenes"] {
  memoryObject(value);
  const current = collection && new Map(collection.records.map((row) => [row.id, row]));
  return Object.fromEntries(
    Object.entries(value).map(([id, raw]) => {
      memoryObject(raw, ["snapshot", "effects"]);
      memoryObject(raw.effects);
      const snapshot = readMemorySceneSnapshot(raw.snapshot);
      memoryRequire(!collection || snapshot.capturedRevision <= collection.revision, "future Scene snapshot");
      memoryRequire(id === snapshot.sceneId, "Scene memory identity changed");
      for (const [key, record] of Object.entries(raw.effects)) {
        validateMemoryRecord(record);
        memoryRequire(
          record.id === key && Object.keys(record.knowers).every((knower) => snapshot.audience.includes(knower)),
          "invalid own-Scene memory effect",
        );
      }
      if (current) {
        const effects = raw.effects as Record<string, MemoryRecord>;
        const lookup = (key: string) =>
          effects[key] ??
          (Object.hasOwn(snapshot.before, key)
            ? snapshot.before[key]
            : (current.get(key)?.createdRevision ?? Infinity) <= snapshot.capturedRevision
              ? current.get(key)
              : undefined);
        for (const record of [...Object.values(snapshot.before), ...Object.values(effects)]) {
          if (!record) continue;
          const live = current.get(record.id);
          memoryRequire(
            live && live.rootId === record.rootId && record.updatedRevision <= collection!.revision,
            "invalid retained memory identity",
          );
          const root = lookup(record.rootId);
          memoryRequire(root && root.id === root.rootId, "missing retained memory root");
          for (const [knower, learning] of Object.entries(record.knowers)) {
            memoryRequire(root.knowers[knower], "missing retained root knower");
            if (learning.learnedVia) {
              const learned = lookup(learning.learnedVia);
              memoryRequire(learned?.corrects === root.id && learned.knowers[knower], "missing retained correction");
            }
          }
        }
      }
      return [
        id,
        {
          snapshot,
          effects: Object.fromEntries(
            Object.entries(raw.effects).map(([key, record]) => [key, immutableMemoryRecord(record)]),
          ),
        } as MemorySceneState,
      ];
    }),
  );
}

/** Receipt bodies are copy-on-write; mutable maps are detached for each authority operation. */
export function readMemoryReceipts(value: unknown): VillageState["memoryReceipts"] {
  memoryObject(value);
  return Object.fromEntries(
    Object.entries(value).map(([id, receipt]) => {
      memoryObject(receipt);
      memoryRequire(receipt.id === id && receipt.domain === "memories", "invalid encoded memory receipt");
      return [id, immutableMemoryValue(receipt)];
    }),
  ) as VillageState["memoryReceipts"];
}

/** Reserve in the Village CAS before attaching continuity to the Scene document.
 * An interrupted attachment reuses the same reservation, never a later baseline.
 */
export function reserveMemoryScene(state: VillageState, sceneId: string, at: string) {
  if (Object.hasOwn(state.memoryScenes, sceneId)) return state.memoryScenes[sceneId];
  const snapshot = captureMemoryScene(
    state.memories,
    sceneId,
    ["player", ...state.villagers.map((row) => row.characterId)],
    at,
  );
  return (state.memoryScenes[sceneId] = { snapshot, effects: {} });
}

export function sceneMemories(state: VillageState, sceneId: string): MemoryCollection {
  const held = state.memoryScenes[sceneId];
  memoryRequire(held, "Scene memory reservation is missing");
  const baseline = sceneMemoryCollection(state.memories, held.snapshot);
  const records = new Map(baseline.records.map((row) => [row.id, row]));
  for (const record of Object.values(held.effects)) records.set(record.id, record);
  return {
    ...baseline,
    revision: Object.values(held.effects).reduce(
      (revision, row) => Math.max(revision, row.updatedRevision),
      baseline.revision,
    ),
    records: [...records.values()],
  };
}

function keepResult(state: VillageState, result: ReturnType<typeof applyMemoryProposal>) {
  state.memories = result.collection;
  for (const snapshot of result.snapshots) state.memoryScenes[snapshot.sceneId].snapshot = snapshot;
}

/** Only a newly committed source in this Scene can advance its own continuity.
 * External learning/protection remains frozen; unrelated knowers never thaw.
 */
export function applyVillageMemory(state: VillageState, proposal: MemoryProposal, context: MemoryApplicationContext) {
  const own = context.source.sceneId && state.memoryScenes[context.source.sceneId];
  const prior = own && new Map(sceneMemories(state, context.source.sceneId!).records.map((row) => [row.id, row]));
  const result = applyMemoryProposal(
    state.memories,
    proposal,
    context,
    Object.values(state.memoryScenes).map((row) => row.snapshot),
  );
  if (result.status === "replayed") return result.status;
  keepResult(state, result);
  if (own) {
    const changes = result.collection.records.filter((row) => row.lastApplication.id === proposal.operationId);
    for (const changed of changes) {
      const previous = prior!.get(changed.id);
      const knowers: MemoryRecord["knowers"] = structuredClone(previous?.knowers ?? {});
      for (const id of Object.keys(proposal.learners)) {
        if (!own.snapshot.audience.includes(id) || !changed.knowers[id]) continue;
        const before = previous?.knowers[id];
        const learned = mergeMemoryLearning(before, proposal.learners[id], context.recordedAt);
        const correction =
          changed.id === changed.rootId && changes.find((row) => row.corrects === changed.id && row.knowers[id]);
        if (correction) learned.learnedVia = correction.id;
        else if (
          proposal.action === "reinforce" &&
          proposal.target &&
          changed.id === changed.rootId &&
          proposal.target?.id !== changed.id &&
          changed.knowers[id].learnedVia === proposal.target?.id
        )
          learned.learnedVia = proposal.target.id;
        knowers[id] = learned;
      }
      if (Object.keys(knowers).length) own.effects[changed.id] = { ...structuredClone(changed), knowers };
    }
  }
  return result.status;
}

export function forgetVillageMemory(state: VillageState, operation: MemoryRepair, at: string) {
  memoryRequire(operation.action === "forget", "expected Forget");
  return repairVillageMemory(state, operation, at);
}

export function correctVillageMemory(state: VillageState, operation: MemoryRepair, at: string) {
  memoryRequire(operation.action === "repair", "expected Correct");
  return repairVillageMemory(state, operation, at);
}

function repairVillageMemory(state: VillageState, operation: MemoryRepair, at: string) {
  const result = applyMemoryRepair(
    state.memories,
    operation,
    at,
    Object.values(state.memoryScenes).map((row) => row.snapshot),
  );
  keepResult(state, result);
  return result.status;
}
