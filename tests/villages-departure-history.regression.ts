// Test cases: departure-history/growth, departure-history/ownership, departure-history/publication, departure-history/comparison
import assert from "node:assert/strict";
import { mock } from "node:test";
import { runCase } from "../scripts/test-cases.mjs";
import { configureRepairGate, createRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { createDocumentMutator } from "../packages/villages/src/server/adapters/storage/document-store.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { departureHistoryOwner } from "../packages/villages/src/server/adapters/storage/departure-history.js";
import { relationshipPayloadStore } from "../packages/villages/src/server/adapters/storage/relationship-payload-store.js";
import { emptyMemoryPayload } from "../packages/villages/src/server/adapters/storage/memory-payload-store.js";
import { createRelationshipStore } from "../packages/villages/src/server/features/residents/relationship-store-service.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  defaultRelationshipState,
  neutralRelationship,
  relationshipKey,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { captureReturnContext } from "../packages/villages/src/server/domain/rules/return-catchup-capture.js";
import {
  cloneVillageContext,
  sameRelationshipContext,
} from "../packages/villages/src/server/domain/rules/world-context-copy.js";
import { returnCaptureRevision } from "../packages/villages/src/server/domain/rules/return-capture-revision.js";

const at = "2026-10-30T12:00:00.000Z",
  key = relationshipKey("ada", "player");
async function fixture(count = 1000) {
  const rows = new Map<string, any>();
  let readBytes = 0,
    writtenBytes = 0,
    interruption: "before" | "after" | undefined;
  const documents: any = {
    async getById(_pkg: string, id: string) {
      const row = rows.get(id) ?? null;
      readBytes += Buffer.byteLength(JSON.stringify(row));
      return structuredClone(row);
    },
    async list(_pkg: string, kind: string) {
      return structuredClone([...rows.values()].filter((r) => r.kind === kind));
    },
    async create(input: any) {
      assert(!rows.has(input.id));
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(row.id, row);
      writtenBytes += Buffer.byteLength(JSON.stringify(row));
      return structuredClone(row);
    },
    async update(input: any) {
      const old = rows.get(input.id);
      if (!old || old.revision !== input.expectedRevision) return null;
      if (input.id === "villages-village" && interruption === "before") {
        interruption = undefined;
        throw Error("Interrupted before owner CAS");
      }
      const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
      rows.set(row.id, row);
      writtenBytes += Buffer.byteLength(JSON.stringify(row));
      if (input.id === "villages-village" && interruption === "after") {
        interruption = undefined;
        throw Error("Uncertain owner CAS response");
      }
      return structuredClone(row);
    },
    async remove(_pkg: string, id: string, revision: number) {
      return rows.get(id)?.revision === revision && rows.delete(id);
    },
  };
  const gate = createRepairGate(documents),
    release = configureRepairGate(gate);
  const repository = createVillageRepository(() => gate.documents);
  const social = createRelationshipStore({
    VILLAGES_PACKAGE_ID: "villages",
    villagesDocuments: () => gate.documents,
    mutateDocument: createDocumentMutator(() => gate.documents),
  });
  await repository.mutateAuthority((state) =>
    Object.assign(state, defaultVillageState(), { seed: "departure-" + count, setupAt: at, foundedAt: at }),
  );
  await social.mutateRelationships("departure-" + count, (state) => {
    const edge = (state.edges[key] = { ...neutralRelationship("ada", "player"), connection: "Departure connection" });
    for (let i = 0; i < count; i++)
      edge.records["fact:" + i] = {
        id: "fact:" + i,
        revision: 1,
        kind: "history",
        status: "stated",
        text: "Exact private evidence café 🌼 " + i,
        participants: ["ada", "player"],
        knownBy: ["ada"],
        evidenceIds: ["source:" + i],
      };
  });
  const captured = await social.readRelationshipState("departure-" + count);
  await repository.mutateAuthority((state) => {
    state.relationshipContext = captured;
    state.returnCatchup = { capture: captureReturnContext(state, new Date(at)) };
  });
  const repair = createRepairService({
    gate,
    repository,
    resumeProject: async () => {},
    cancelProject: async () => {},
    replaySaved: async () => {},
    continueSaved: async () => {},
  });
  const identify = (world: any) =>
    relationshipPayloadStore(gate.documents).fingerprint(world.relationshipContext, world);
  return {
    rows,
    documents,
    gate,
    repository,
    social,
    repair,
    identify,
    reset() {
      readBytes = writtenBytes = 0;
    },
    stats: () => ({ readBytes, writtenBytes }),
    interrupt(when: typeof interruption) {
      interruption = when;
    },
    close() {
      release();
      gate.dispose();
    },
    root: () => rows.get("villages-village"),
  };
}

await runCase("departure-history/growth", async () => {
  const metrics: unknown[] = [];
  for (const count of [1000, 10_000, 25_000]) {
    const f = await fixture(count);
    try {
      const initial = await f.repository.readAuthority(),
        captured = initial.returnCatchup!.capture!;
      const before = returnCaptureRevision(captured, f.identify);
      await f.social.mutateRelationships(initial.seed, (state) => {
        state.edges[key].connection = "Later connection";
        state.edges[key].revision++;
      });
      const live = await f.social.readRelationshipState(initial.seed);
      f.reset();
      const stringify = JSON.stringify,
        clone = structuredClone;
      let jsonBytes = 0;
      mock.method(JSON, "stringify", (...args: unknown[]) => {
        const output = Reflect.apply(stringify, JSON, args);
        if (typeof output === "string") jsonBytes += Buffer.byteLength(output);
        return output;
      });
      mock.method(globalThis, "structuredClone", (value: any, options?: any) => {
        assert(
          !value?.relationshipContext && !value?.returnCatchup?.capture?.world?.relationshipContext,
          "Ordinary projections cannot deep-clone a relationship history body",
        );
        return clone(value, options);
      });
      try {
        for (let i = 0; i < 20; i++) {
          await f.repository.mutateAuthority((state) => {
            state.setting = "Ordinary update " + i;
          });
          const current = await f.repository.readAuthority();
          const projection = cloneVillageContext({ ...current, relationshipContext: live });
          assert.equal(
            projection.returnCatchup!.capture!.world.relationshipContext!.edges[key].connection,
            "Departure connection",
          );
          assert.equal(returnCaptureRevision(current.returnCatchup!.capture!, f.identify), before);
          assert(!sameRelationshipContext(projection.relationshipContext, captured.world.relationshipContext));
        }
      } finally {
        mock.restoreAll();
      }
      metrics.push({ count, ...f.stats(), jsonBytes });
      assert(f.stats().readBytes < 1024 * 1024 && f.stats().writtenBytes < 1024 * 1024);
      assert(jsonBytes < 4 * 1024 * 1024, "Ordinary World work cannot serialize the complete departure history");
      assert(!Object.hasOwn(f.root().data.returnCatchup.capture.world, "relationshipContext"));
      assert.throws(() => coerceVillageState({ ...f.root().data, ...emptyMemoryPayload() }), /not loaded/);
      const cold = await createVillageRepository(() => f.documents).readAuthority();
      assert.equal(
        returnCaptureRevision(cold.returnCatchup!.capture!, f.identify),
        before,
        "Cold hydration preserves the exact comparison identity",
      );
      const edge = cold.returnCatchup!.capture!.world.relationshipContext!.edges[key];
      assert.equal(Object.keys(edge.records).length, count);
      assert.deepEqual(edge.records["fact:999"].knownBy, ["ada"]);
      assert.equal(edge.records["fact:999"].text, "Exact private evidence café 🌼 999");
    } finally {
      f.close();
    }
  }
  console.log("Departure document-store operation growth:", JSON.stringify(metrics));
});

await runCase("departure-history/ownership", async () => {
  const f = await fixture();
  try {
    const owner = departureHistoryOwner(f.root().data)!;
    await f.social.mutateRelationships(f.root().data.seed, (state) => {
      state.edges[key].connection = "New live connection";
    });
    const checkpoint = await f.repair.createCheckpoint("Departure history", "departure-checkpoint");
    await f.repository.mutateAuthority((state) => {
      delete state.returnCatchup!.capture;
    });
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(owner.head!.id), "A checkpoint owns the frozen departure after the live capture is removed");
    const retained = f.rows.get(owner.head!.id);
    f.rows.delete(owner.head!.id);
    const unchanged = structuredClone(f.rows);
    await assert.rejects(collectRetainedStorage(f.gate), /missing/);
    await assert.rejects(f.repair.restore(checkpoint.id, "missing-departure"), /missing/);
    assert.deepEqual(f.rows, unchanged, "Missing checkpoint dependencies cannot publish restoration or cleanup");
    f.rows.set(owner.head!.id, retained);
    const review = await f.repair.restore(checkpoint.id, "restore-departure");
    await f.repair.apply(review.id, review.token);
    assert.equal(
      (await f.repository.readAuthority()).returnCatchup?.capture,
      undefined,
      "Restoration keeps its established behavior of discarding the active absence capture",
    );
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(owner.head!.id), "Retained checkpoints still protect their exact departure facts");
  } finally {
    f.close();
  }
});

await runCase("departure-history/publication", async () => {
  const f = await fixture();
  try {
    const original = departureHistoryOwner(f.root().data)!;
    const change = (connection: string) =>
      f.repository.mutateAuthority((state) => {
        const next = cloneVillageContext({
          ...state,
          relationshipContext: state.returnCatchup!.capture!.world.relationshipContext,
        });
        next.relationshipContext!.edges[key].connection = connection;
        state.returnCatchup!.capture = captureReturnContext(next, new Date(at));
      });
    f.interrupt("before");
    await assert.rejects(change("Uncommitted capture"), /Interrupted/);
    assert.equal(departureHistoryOwner(f.root().data)!.head!.id, original.head!.id);
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(original.head!.id));
    f.interrupt("after");
    await assert.rejects(change("Committed capture"), /Uncertain/);
    const committed = departureHistoryOwner(f.root().data)!;
    assert.notEqual(committed.head!.id, original.head!.id);
    await collectRetainedStorage(f.gate);
    assert.equal(
      (await f.repository.readAuthority()).returnCatchup!.capture!.world.relationshipContext!.edges[key].connection,
      "Committed capture",
    );
    const native = structuredClone(f.root().data);
    native.returnCatchup.capture.world.setupAt = "foreign";
    native.returnCatchup.capture.world.relationshipHead = null;
    assert.throws(() => departureHistoryOwner(native), /ownership/);
    const saved = f.rows.get(committed.head!.id);
    f.rows.delete(committed.head!.id);
    const unchanged = structuredClone(f.rows);
    await assert.rejects(f.repository.readAuthority(), /missing/);
    await assert.rejects(f.repair.createCheckpoint("Missing", "missing-current"), /missing/);
    await assert.rejects(collectRetainedStorage(f.gate), /missing/);
    assert.deepEqual(f.rows, unchanged);
    f.rows.set(committed.head!.id, saved);
  } finally {
    f.close();
  }
});

await runCase("departure-history/comparison", async () => {
  const f = await fixture();
  try {
    const live = await f.social.readRelationshipState(f.root().data.seed);
    const capture = (await f.repository.readAuthority()).returnCatchup!.capture!;
    live.clockShiftMs = undefined;
    assert(sameRelationshipContext(live, capture.world.relationshipContext));
    const prior = f.identify({ ...capture.world, relationshipContext: live });
    assert.equal(prior, f.identify(capture.world));
    const empty = defaultRelationshipState(live.seed);
    assert.notEqual(
      f.identify({ ...capture.world, relationshipContext: empty }),
      f.identify({ ...capture.world, relationshipContext: undefined }),
    );
    assert.notEqual(
      f.identify({ ...capture.world, relationshipContext: empty }),
      f.identify({ ...capture.world, setupAt: "another-world", relationshipContext: empty }),
    );
    const before = structuredClone(f.rows);
    live.edges[key].records["fact:999"] = { ...live.edges[key].records["fact:999"], knownBy: ["ada", "player"] };
    assert(!sameRelationshipContext(live, capture.world.relationshipContext));
    assert.notEqual(f.identify({ ...capture.world, relationshipContext: live }), prior);
    assert.deepEqual(f.rows, before, "Comparison identities never publish intents or native records");
  } finally {
    f.close();
  }
});
