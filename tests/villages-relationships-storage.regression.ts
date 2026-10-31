import assert from "node:assert/strict";
import { mock } from "node:test";
import { createDocumentMutator } from "../packages/villages/src/server/adapters/storage/document-store.js";
import { createRepairGate, configureRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import {
  createRelationshipPayloadStore,
  relationshipPayloadStore,
  readRelationshipRoot,
  relationshipDocumentId,
} from "../packages/villages/src/server/adapters/storage/relationship-payload-store.js";
import { createRelationshipStore } from "../packages/villages/src/server/features/residents/relationship-store-service.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import {
  defaultRelationshipState,
  neutralRelationship,
  relationshipKey,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { socialWorldFixture } from "./fixtures/social-world.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { bindLiveProposals } from "../packages/villages/src/server/domain/rules/live-exchange.js";
import { createLiveMemory } from "../packages/villages/src/server/features/residents/live-memory-service.js";

const at = "2026-10-30T10:00:00.000Z",
  metrics: unknown[] = [];
for (const count of [1000, 10_000, 25_000]) {
  const rows = new Map<string, any>(),
    scope = { seed: "relationship-native-" + count, setupAt: at };
  let readBytes = 0,
    writtenBytes = 0,
    writes = 0;
  const documents: any = {
    getById: async (_pkg: string, id: string) => {
      const row = rows.get(id) ?? null;
      readBytes += Buffer.byteLength(JSON.stringify(row));
      return structuredClone(row);
    },
    list: async (_pkg: string, kind: string) => structuredClone([...rows.values()].filter((row) => row.kind === kind)),
    create: async (value: any) => {
      if (rows.has(value.id)) throw new Error("Duplicate document");
      rows.set(value.id, structuredClone({ ...value, revision: 1 }));
      writtenBytes += Buffer.byteLength(JSON.stringify(value));
      writes++;
      return structuredClone(rows.get(value.id));
    },
    update: async (value: any) => {
      const old = rows.get(value.id);
      if (!old || old.revision !== value.expectedRevision) return null;
      rows.set(value.id, structuredClone({ ...old, ...value, revision: old.revision + 1 }));
      writtenBytes += Buffer.byteLength(JSON.stringify(value));
      writes++;
      return structuredClone(rows.get(value.id));
    },
    remove: async (_pkg: string, id: string, revision: number) =>
      rows.get(id)?.revision === revision && rows.delete(id),
  };
  await documents.create({
    id: "villages-village",
    packageId: "villages",
    kind: "village",
    revision: 1,
    name: "Synthetic world",
    description: "",
    createdAt: at,
    updatedAt: at,
    data: { version: 13, ...scope, memoryHead: null, villagers: [], wishArchiveHead: { count: 0, root: null } },
  });
  const gate = createRepairGate(documents),
    release = configureRepairGate(gate);
  const api = createRelationshipStore({
    VILLAGES_PACKAGE_ID: "villages",
    villagesDocuments: () => gate.documents,
    mutateDocument: createDocumentMutator(() => gate.documents),
  });
  const payloads = relationshipPayloadStore(gate.documents),
    id = relationshipDocumentId(scope.seed),
    key = relationshipKey("ada", "player");
  try {
    const initial = defaultRelationshipState(scope.seed);
    initial.mailThreads.personal = { id: "personal", participantIds: ["player", "ada"], revision: count, messages: [] };
    initial.edges[key] = { ...neutralRelationship("ada", "player"), revision: count };
    for (let i = 0; i < count; i++) {
      const name = "record:" + i;
      initial.edges[key].records[name] = {
        id: name,
        revision: 1,
        kind: "history",
        text: "Exact retained fact " + i,
        participants: ["ada", "player"],
        knownBy: ["ada"],
        status: "stated",
        evidenceIds: ["source:" + i],
      };
      initial.mailThreads.personal.messages.push({
        id: "letter:" + i,
        requestId: "request:" + i,
        fromId: "ada",
        toId: "player",
        text: "Exact retained letter “café 🌼” " + i,
        at,
        status: "delivered",
      });
    }
    await api.mutateRelationships(scope.seed, (state) => Object.assign(state, initial));
    const first = readRelationshipRoot(rows.get(id).data, scope).head;
    assert.ok(Object.isFrozen(first));
    assert.ok(Buffer.byteLength(JSON.stringify(rows.get(id).data)) < 600);
    const preserved = await api.readRelationshipState(scope.seed);
    const originalStringify = JSON.stringify;
    let serializedBytes = 0;
    mock.method(JSON, "stringify", (...args: unknown[]) => {
      const result = Reflect.apply(originalStringify, JSON, args);
      if (typeof result === "string") serializedBytes += Buffer.byteLength(result);
      return result;
    });
    readBytes = writtenBytes = 0;
    try {
      await api.mutateRelationships(scope.seed, (state) => {
        state.mailThreads.personal.messages.push({
          id: "letter:latest",
          requestId: "latest",
          fromId: "ada",
          toId: "player",
          text: "A newly delivered exact letter",
          at,
          status: "delivered",
        });
        state.mailThreads.personal.revision++;
      });
      await payloads.read(first, scope);
      for (let i = 0; i < 15; i++) {
        await api.mutateRelationships(scope.seed, (state) => {
          state.noticeSequence++;
        });
        await api.readRelationshipState(scope.seed);
        await payloads.read(first, scope);
      }
      const world = { ...defaultVillageState(), ...scope };
      const beforeNoop = writes;
      await api.persistRelationshipAuthority(world);
      await api.mutateRelationships(scope.seed, () => {});
      assert.equal(writes, beforeNoop, "Ordinary reconciliation and a no-op must not rewrite a history or its root");
    } finally {
      mock.restoreAll();
    }
    const ordinary = {
      count,
      ordinaryReadBytes: readBytes,
      ordinaryWrittenBytes: writtenBytes,
      ordinarySerializedBytes: serializedBytes,
    };
    assert.ok(readBytes < 400 * 1024, "Alternating current/frozen reads cannot materialize whole histories");
    assert.ok(writtenBytes < 400 * 1024, "A letter cannot rewrite the full pair/thread history");
    assert.ok(serializedBytes < 2 * 1024 * 1024, "Bounded native writes must not conceal whole-ledger JSON work");
    const current = readRelationshipRoot(rows.get(id).data, scope).head;
    const world = { ...socialWorldFixture(), ...scope };
    const snapshot = async () => ({
      ...structuredClone(world),
      relationshipContext: await api.readRelationshipState(scope.seed),
    });
    const live = createLiveMemory({
      readVillageState: snapshot,
      readVillageAuthority: snapshot,
      mutateVillageState: async (fn: any) => {
        const next = await snapshot();
        await fn(next);
        delete next.relationshipContext;
        Object.assign(world, next);
        return snapshot();
      },
      mutateRelationships: api.mutateRelationships,
    });
    const scene = coerceSession({
      version: 3,
      id: "paged-ack",
      villageSeed: scope.seed,
      status: "active",
      lines: [],
      submissions: [{ id: "turn", at }],
    });
    scene.lines = [
      {
        id: "spoken",
        speakerId: "a",
        kind: "dialogue",
        role: "assistant",
        content: "I want to see you tomorrow",
        heardBy: ["a", "player"],
        playerHeard: true,
      },
    ] as any;
    const items = [
      { id: "", targetIds: ["player"], text: "Meet tomorrow", reason: "Discussed together", status: "active" },
    ];
    scene.submissions[0]!.liveProposals = bindLiveProposals(
      {
        memoryChanges: [],
        relationshipChanges: {
          changes: [],
          permissions: [],
          disclosures: [],
          intentions: [{ actorId: "a", expectedRevision: 0, lineIds: [0], items, sceneItems: items }],
        },
      },
      "",
      ["spoken"],
      scene.lines,
    );
    assert.equal((await gate.work(() => live.processLiveRelationships(scene, "turn"))).status, "applied");
    assert.equal(
      (await gate.work(() => live.processLiveRelationships(scene, "turn"))).status,
      "applied",
      "Retry after ledger commit cannot mutate an immutable intention receipt",
    );
    const acknowledged = await api.readRelationshipState(scope.seed);
    assert.equal(acknowledged.intentionReceipts["paged-ack:turn:intentions:a"].submissionId, "turn");
    // Keep the subsequent cleanup assertions scoped to the earlier owner under test.
    await gate.work(async () => {
      const row = await gate.documents.getById("villages", id);
      await gate.documents.update({
        ...row!,
        expectedRevision: row!.revision,
        data: { format: 4, ...scope, head: current },
      });
    });
    const restarted = createRelationshipPayloadStore(gate.documents);
    const afterRestart = await restarted.read(current, scope);
    assert.equal(afterRestart.mailThreads.personal.messages.length, count + 1);
    assert.equal(Object.keys(afterRestart.edges[key].records).length, count);
    assert.deepEqual(afterRestart.edges[key].records["record:0"].knownBy, ["ada"]);
    assert.equal(afterRestart.mailThreads.personal.messages[0].text, "Exact retained letter “café 🌼” 0");
    const beforeCleanup = rows.size;
    await collectRetainedStorage(gate);
    assert.ok(rows.size < beforeCleanup);
    assert.deepEqual(
      await createRelationshipPayloadStore(gate.documents).read(current, scope),
      afterRestart,
      "Idle collection must trace nested per-edge records and per-thread messages",
    );
    assert.equal(rows.has(first.id), false, "An unowned prior version can retire while all current history survives");
    await assert.rejects(payloads.read(first, scope), /missing/);
    // A stale cached version must materialize its dependencies again, even with the same content-addressable id.
    const rematerialized = await gate.work(() => payloads.prepare(preserved, scope, first));
    assert.equal(rematerialized.id, first.id);
    assert.deepEqual(await createRelationshipPayloadStore(gate.documents).read(rematerialized, scope), preserved);
    await assert.rejects(payloads.read(current, { ...scope, setupAt: "another-setup" }), /another world/);
    metrics.push(ordinary);
  } finally {
    release();
    gate.dispose();
  }
}

// Returned and caller-owned head objects cannot reindex or poison another cached value.
{
  const rows = new Map<string, any>();
  const documents: any = {
    getById: async (_pkg: string, id: string) => structuredClone(rows.get(id) ?? null),
    create: async (row: any) => {
      const saved = structuredClone({ ...row, revision: 1 });
      rows.set(row.id, saved);
      return saved;
    },
    update: async (row: any) => {
      const saved = structuredClone({ ...rows.get(row.id), ...row, revision: row.expectedRevision + 1 });
      rows.set(row.id, saved);
      return saved;
    },
  };
  const scope = { seed: "head-alias", setupAt: at },
    store = createRelationshipPayloadStore(documents);
  const a = defaultRelationshipState(scope.seed),
    b = { ...defaultRelationshipState(scope.seed), noticeSequence: 1 };
  const headA = await store.prepare(a, scope),
    headB = await store.prepare(b, scope);
  assert.throws(() => Object.assign(headA, headB), TypeError);
  const caller = { ...headA };
  await store.read(caller, scope);
  Object.assign(caller, headB);
  await store.read(headA, scope);
  assert.equal((await store.read(headB, scope)).noticeSequence, 1);
  assert.deepEqual(await store.read(headB, scope), await createRelationshipPayloadStore(documents).read(headB, scope));
}
// Hydration and publication use the one backend captured by the CAS mutator, even if a getter changes later.
{
  const scope = { seed: "single-origin-store", setupAt: at };
  const backend = () => {
    const rows = new Map<string, any>([
      [
        "villages-village",
        {
          id: "villages-village",
          packageId: "villages",
          kind: "village",
          revision: 1,
          data: { version: 13, ...scope, memoryHead: null, villagers: [], wishArchiveHead: { count: 0, root: null } },
        },
      ],
    ]);
    const documents: any = {
      getById: async (_pkg: string, id: string) => structuredClone(rows.get(id) ?? null),
      create: async (input: any) => {
        assert(!rows.has(input.id));
        const row = { ...structuredClone(input), revision: 1 };
        rows.set(row.id, row);
        return structuredClone(row);
      },
      update: async (input: any) => {
        const old = rows.get(input.id);
        if (!old || old.revision !== input.expectedRevision) return null;
        const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
        rows.set(row.id, row);
        return structuredClone(row);
      },
    };
    return { rows, documents };
  };
  const a = backend(),
    b = backend();
  let accesses = 0;
  const getDocuments = () => (++accesses === 1 ? a.documents : b.documents);
  const api = createRelationshipStore({
    VILLAGES_PACKAGE_ID: "villages",
    villagesDocuments: getDocuments,
    mutateDocument: createDocumentMutator(getDocuments),
  });
  await api.mutateRelationships(scope.seed, (state) => {
    state.noticeSequence = 1;
  });
  assert.equal(accesses, 1, "Scope, immutable pages and owner CAS cannot select different stores");
  const root = a.rows.get(relationshipDocumentId(scope.seed));
  assert(root);
  assert.equal(b.rows.size, 1, "A later backend remains untouched");
  assert.equal(
    (await createRelationshipPayloadStore(a.documents).read(readRelationshipRoot(root.data, scope).head, scope))
      .noticeSequence,
    1,
    "Cold loading verifies owner and immutable body were committed to the same backend",
  );
}
console.log("Relationship native operation growth:", JSON.stringify(metrics));
console.log(
  "Relationship storage: bounded warm I/O and total serialization, alternating frozen/live heads, no-op publication, restart, ownership cleanup, stale-cache rematerialization and descriptor isolation passed.",
);
