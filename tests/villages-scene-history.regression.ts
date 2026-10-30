import assert from "node:assert/strict";
import { mock } from "node:test";
import { createRepairGate, configureRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { createDocumentMutator } from "../packages/villages/src/server/adapters/storage/document-store.js";
import { createSceneRepository } from "../packages/villages/src/server/adapters/storage/scene-repository.js";
import { sessionSlot } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import {
  createSceneHistory,
  sceneHistoryOwners,
  readSceneIndex,
  SCENE_STORAGE_FORMAT,
} from "../packages/villages/src/server/adapters/storage/scene-history.js";
import { createRelationshipStore } from "../packages/villages/src/server/features/residents/relationship-store-service.js";
import {
  neutralRelationship,
  relationshipKey,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";

const at = "2026-10-30T12:00:00.000Z",
  metrics: unknown[] = [];
for (const count of [1000, 10_000, 25_000]) {
  const rows = new Map<string, any>();
  let readBytes = 0,
    writtenBytes = 0;
  const documents: any = {
    getById: async (_pkg: string, id: string) => {
      const row = rows.get(id) ?? null;
      readBytes += Buffer.byteLength(JSON.stringify(row));
      return structuredClone(row);
    },
    list: async (_pkg: string, kind: string) => structuredClone([...rows.values()].filter((r) => r.kind === kind)),
    create: async (input: any) => {
      assert(!rows.has(input.id));
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(row.id, row);
      writtenBytes += Buffer.byteLength(JSON.stringify(row));
      return structuredClone(row);
    },
    update: async (input: any) => {
      const old = rows.get(input.id);
      if (!old || old.revision !== input.expectedRevision) return null;
      const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
      rows.set(row.id, row);
      writtenBytes += Buffer.byteLength(JSON.stringify(row));
      return structuredClone(row);
    },
    remove: async (_pkg: string, id: string, revision: number) =>
      rows.get(id)?.revision === revision && rows.delete(id),
  };
  const gate = createRepairGate(documents),
    release = configureRepairGate(gate),
    mutate = createDocumentMutator(() => gate.documents),
    sceneRepo = createSceneRepository({ villagesDocuments: () => gate.documents, mutateDocument: mutate }),
    social = createRelationshipStore({
      VILLAGES_PACKAGE_ID: "villages",
      villagesDocuments: () => gate.documents,
      mutateDocument: mutate,
    });
  try {
    const world = { ...defaultVillageState(), seed: "scene-history-" + count, setupAt: at };
    await documents.create({
      id: "villages-village",
      packageId: "villages",
      kind: "village",
      name: "World",
      description: "",
      data: { ...world, memories: undefined, memoryScenes: undefined, memoryReceipts: undefined, memoryHead: null },
    });
    // Native roots omit unloaded history keys rather than saving undefined placeholders.
    for (const field of ["memories", "memoryScenes", "memoryReceipts"]) delete rows.get("villages-village").data[field];
    const key = relationshipKey("ada", "player");
    await social.mutateRelationships(world.seed, (state) => {
      const edge = (state.edges[key] = { ...neutralRelationship("ada", "player"), connection: "Frozen connection" });
      for (let i = 0; i < count; i++)
        edge.records["fact:" + i] = {
          id: "fact:" + i,
          revision: 1,
          kind: "history",
          status: "stated",
          text: "Exact evidence café 🌼 " + i,
          participants: ["ada", "player"],
          knownBy: ["ada"],
          evidenceIds: ["source:" + i],
        };
    });
    world.relationshipContext = await social.readRelationshipState(world.seed);
    const scene = coerceSession({
      version: 3,
      id: "frozen",
      villageSeed: world.seed,
      status: "active",
      startedAt: at,
      lines: [],
      submissions: [],
    });
    scene.continuity = captureSceneContinuity(world, scene, Date.parse(at));
    await mutate("villages-venue-visit-frozen", sessionSlot(gate.documents), (value) => Object.assign(value, scene));
    const original = structuredClone(rows.get("villages-venue-visit-frozen").data),
      head = sceneHistoryOwners(original)[0].head;
    assert.equal(original.storageFormat, SCENE_STORAGE_FORMAT);
    for (const storageFormat of [5, 6, 7])
      assert.throws(
        () => sceneHistoryOwners({ ...original, storageFormat }),
        /unsupported Scene storage format/,
        "Old Wish proposal and inline submission formats have no legacy reader",
      );
    assert.equal(Object.hasOwn(original.continuity.facts, "relationshipContext"), false);
    assert.throws(() => coerceSession(original), /hydration/);
    const markerless = structuredClone(original);
    delete markerless.storageFormat;
    assert.throws(() => coerceSession(markerless), /hydration/);
    const index = readSceneIndex(original);
    assert.equal(index.id, "frozen");
    assert.throws(() => (index as any).continuity, /not loaded/);
    await social.mutateRelationships(world.seed, (state) => {
      state.edges[key].connection = "Later live connection";
      state.edges[key].revision++;
    });
    const live = await social.readRelationshipState(world.seed);
    await sceneRepo.readSession("frozen");
    readBytes = writtenBytes = 0;
    const stringify = JSON.stringify;
    let jsonBytes = 0;
    mock.method(JSON, "stringify", (...args: unknown[]) => {
      const value = Reflect.apply(stringify, JSON, args);
      if (typeof value === "string") jsonBytes += Buffer.byteLength(value);
      return value;
    });
    try {
      for (let i = 0; i < 20; i++) {
        await sceneRepo.changeSession("frozen", (value) => {
          value.recap = "Ordinary Scene update " + i;
        });
        const current = await sceneRepo.readSession("frozen");
        const view = sceneContinuityView({ ...world, relationshipContext: live }, current, false);
        assert.equal(view.relationshipContext!.edges[key].connection, "Frozen connection");
        assert.equal(Object.keys(view.relationshipContext!.edges[key].records).length, count);
      }
    } finally {
      mock.restoreAll();
    }
    metrics.push({ count, readBytes, writtenBytes, jsonBytes });
    assert.ok(
      readBytes < 1024 * 1024 && writtenBytes < 1024 * 1024,
      "Ordinary Scene updates cannot read/write complete captured history",
    );
    assert.ok(jsonBytes < 4 * 1024 * 1024, "Scene change detection and views cannot serialize captured history bodies");
    const native = rows.get("villages-venue-visit-frozen").data;
    await sceneRepo.changeSession("frozen", (value) => {
      value.operation = {
        id: "op",
        kind: "chat",
        input: {},
        token: "token",
        attemptId: "attempt",
        status: "interrupted",
        stage: "saved",
        startedAt: at,
        sceneRevision: value.sceneRevision,
        snapshot: structuredClone(native),
        checkpoints: {},
        attempts: {},
        error: "Held",
      };
    });
    const saved = structuredClone(rows.get("villages-venue-visit-frozen").data);
    assert.equal(sceneHistoryOwners(saved).length, 2);
    const admitted = await createSceneHistory(gate.documents).decode(saved.operation.snapshot);
    assert.equal(admitted.continuity!.facts.relationshipContext!.edges[key].connection, "Frozen connection");
    assert.deepEqual(
      saved.operation.snapshot,
      native,
      "Hydration cannot rewrite the coordinator's admitted native value",
    );
    const foreign = structuredClone(saved);
    foreign.operation.snapshot.villageSeed = "foreign";
    foreign.operation.snapshot.continuity = undefined;
    assert.throws(() => sceneHistoryOwners(foreign), /another Village/);
    const foreignSetup = structuredClone(saved);
    foreignSetup.operation.snapshot.continuity.setupAt = "foreign";
    foreignSetup.operation.snapshot.continuity.relationshipHead = null;
    assert.throws(() => sceneHistoryOwners(foreignSetup), /another world scope/);
    await collectRetainedStorage(gate);
    assert(rows.has(head.id), "A frozen Scene owns superseded live history");
    const cold = await createSceneHistory(createRepairGate(documents).documents).decode(saved);
    assert.equal(Object.keys(cold.continuity!.facts.relationshipContext!.edges[key].records).length, count);
    assert.deepEqual(cold.continuity!.facts.relationshipContext!.edges[key].records["fact:0"].knownBy, ["ada"]);
    assert.equal(
      cold.continuity!.facts.relationshipContext!.edges[key].records["fact:999"].text,
      "Exact evidence café 🌼 999",
    );
    const physicalScene = rows.get("villages-venue-visit-frozen");
    const validSceneData = structuredClone(physicalScene.data);
    rows.set("villages-active-venue", {
      id: "villages-active-venue",
      packageId: "villages",
      kind: "venue-active",
      revision: 1,
      name: "Active",
      description: "",
      data: { sessionId: "frozen", placeId: "" },
    });
    physicalScene.data = { ...validSceneData, id: "another-scene", operation: undefined };
    const mismatched = structuredClone(rows);
    await assert.rejects(sceneRepo.readActive(), /identity/);
    await assert.rejects(sceneRepo.readSession("frozen"), /identity/);
    await assert.rejects(collectRetainedStorage(gate), /identity/);
    assert.deepEqual(rows, mismatched, "A mismatched internal Scene ID cannot publish or release frozen history");
    physicalScene.data = validSceneData;
    physicalScene.kind = "unknown";
    const wrongKind = structuredClone(rows);
    await assert.rejects(sceneRepo.readActive(), /ownership/);
    await assert.rejects(collectRetainedStorage(gate), /ownership/);
    assert.deepEqual(rows, wrongKind, "The active pointer protects an owner omitted from a kind listing");
    physicalScene.kind = "venue-visit";
    rows.delete("villages-active-venue");
    const root = rows.get(head.id);
    rows.delete(head.id);
    const before = structuredClone(rows);
    await assert.rejects(createSceneHistory(gate.documents).decode(saved), /missing/);
    await assert.rejects(collectRetainedStorage(gate), /missing/);
    const repair = createRepairService({
      gate,
      repository: createVillageRepository(() => gate.documents),
      resumeProject: async () => {},
      cancelProject: async () => {},
      replaySaved: async () => {},
      continueSaved: async () => {},
    });
    await assert.rejects(repair.createCheckpoint("Missing frozen dependency", "missing-scene-head"), /missing/);
    assert.deepEqual(rows, before, "Missing frozen ownership prevents every cleanup deletion");
    rows.set(head.id, root);
    await sceneRepo.changeSession("frozen", (value) => {
      value.operation = undefined;
      value.status = "closed";
    });
    const checkpoint = await repair.createCheckpoint("Frozen Scene history", "scene-checkpoint");
    const savedScene = rows.get("villages-venue-visit-frozen");
    await gate.work(() => gate.documents.remove("villages", savedScene.id, savedScene.revision));
    await collectRetainedStorage(gate);
    assert(rows.has(head.id), "A checkpoint protects a frozen head after its physical Scene is removed");
    const review = await repair.restore(checkpoint.id, "restore-frozen-scene");
    await repair.apply(review.id, review.token);
    const restored = await sceneRepo.readSession("frozen");
    assert.equal(restored.continuity!.facts.relationshipContext!.edges[key].connection, "Frozen connection");
    assert.equal(Object.keys(restored.continuity!.facts.relationshipContext!.edges[key].records).length, count);
  } finally {
    release();
    gate.dispose();
  }
}
console.log("Frozen Scene document-store operation growth:", JSON.stringify(metrics));
