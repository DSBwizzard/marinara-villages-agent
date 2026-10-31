// Test cases: storage-admission/module-replacement, storage-admission/disposed-write, storage-admission/epoch, storage-admission/recovery-generation, storage-admission/history-read, storage-admission/cleanup-wait, storage-admission/idle-context, storage-admission/manual-publication-gap, storage-admission/parallel-readiness, storage-admission/stale-control-read, storage-admission/page-batching, storage-admission/page-guards, storage-admission/page-overlay, storage-admission/page-acknowledgement, storage-admission/page-inflight, storage-admission/page-lifetime, storage-admission/page-inventory-integrity, storage-admission/page-replay, storage-admission/background-receipts
import assert from "node:assert/strict";
import { setImmediate as nextTurn } from "node:timers/promises";
import { runCase } from "../scripts/test-cases.mjs";
import { backendWorkFor } from "../packages/villages/src/server/entry/backend-work.js";
import {
  createRepairGate,
  createRepairAdmission,
  configureRepairGate,
} from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { addMemory, memoryTime } from "./helpers/memories-fixture.js";
import { createRepairTransactionCodec } from "../packages/villages/src/server/adapters/storage/repair-transaction-codec.js";
import { createHistoryPageWriter } from "../packages/villages/src/server/adapters/storage/memory-pages.js";
import {
  BACKGROUND_COMPLETION_KIND,
  backgroundCompletionId,
  readBackgroundCompletion,
} from "../packages/villages/src/server/adapters/storage/background-completions.js";
import { backgroundSlotId } from "../packages/villages/src/server/domain/rules/background-revision.js";

await runCase("storage-admission/background-receipts", async () => {
  const slot = backgroundSlotId({ kind: "agenda", subjectId: "resident" });
  const f = fixture(),
    gate = createRepairGate(f.store),
    repo = createVillageRepository(() => gate.documents);
  const proofs = () =>
    [...f.rows.values()].filter((row) => row.kind === BACKGROUND_COMPLETION_KIND).map(readBackgroundCompletion);
  const world = () => f.rows.get("villages-village");
  const replace = (jobId: string, expectedRevision = world().revision) =>
    gate.documents.update({
      id: world().id,
      packageId: "villages",
      expectedRevision,
      data: { ...world().data, backgroundReceipts: { [slot]: jobId } },
      updatedAt: "2026-10-31T00:00:00.000Z",
    });
  await repo.mutateAuthority((state) => {
    state.seed = "closure-world";
    state.backgroundReceipts = { [slot]: "committed-first" };
  });
  await replace("committed-first");
  assert.equal(proofs().length, 0, "unchanged receipts need no extra proof");
  assert.equal(await replace("not-written", world().revision - 1), null);
  assert.equal(proofs().length, 0, "a stale expected revision cannot manufacture closure");
  f.hook(async (id) => {
    if (id === world().id)
      assert.equal(proofs()[0].jobId, "committed-first", "proof is durable before the receipt is lost");
  });
  await replace("committed-second");
  f.hook(async () => {});
  const create = f.store.create;
  let failure: "before" | "after" | undefined = "before";
  f.store.create = async (input: any) => {
    if (input.kind !== BACKGROUND_COMPLETION_KIND || !failure) return create(input);
    const outcome = failure;
    failure = undefined;
    if (outcome === "after") await create(input);
    throw Error("Completion publication acknowledgement lost");
  };
  await assert.rejects(replace("committed-third"), /acknowledgement lost/);
  assert.equal(
    world().data.backgroundReceipts[slot],
    "committed-second",
    "failed proof publication preserves the live receipt",
  );
  const get = f.store.getById;
  const expected = backgroundCompletionId({
    format: 1,
    seed: "closure-world",
    slotId: slot,
    jobId: "committed-second",
  });
  const foreign = [...f.rows.values()].find((row) => row.kind === BACKGROUND_COMPLETION_KIND)!;
  f.store.getById = async (pkg: string, id: string) => (id === expected ? structuredClone(foreign) : get(pkg, id));
  failure = "before";
  await assert.rejects(replace("committed-third"), /completion proof changed/);
  assert.equal(
    world().data.backgroundReceipts[slot],
    "committed-second",
    "a misindexed valid proof cannot acknowledge another scope",
  );
  f.store.getById = get;
  failure = "after";
  await replace("committed-third");
  assert.deepEqual(
    proofs()
      .map((proof) => proof.jobId)
      .sort(),
    ["committed-first", "committed-second"],
  );
  f.hook(async (id) => {
    if (id === "villages-village") {
      const row = world();
      row.revision++;
      row.data.name = "Concurrent save";
    }
  });
  assert.equal(await replace("not-committed"), null);
  assert.equal(world().data.backgroundReceipts[slot], "committed-third");
  assert.equal(
    proofs().at(-1)!.jobId,
    "committed-third",
    "failed CAS may retain only an already committed positive fact",
  );
  f.hook(async () => {});
  assert.equal(await gate.documents.remove("villages", world().id, world().revision), true);
  assert.equal(proofs().length, 3, "physical World deletion also archives receipts idempotently");
  gate.dispose();

  const staged = fixture(),
    first = createRepairGate(staged.store),
    stagedRepo = createVillageRepository(() => first.documents);
  await stagedRepo.mutateAuthority((state) => {
    state.seed = "journal-world";
    state.backgroundReceipts = { [slot]: "physical-commit" };
  });
  const initial = staged.rows.get("villages-village");
  const review = await first.simulate(async () => {
    const one = await first.documents.update({
      ...initial,
      expectedRevision: initial.revision,
      data: { ...initial.data, backgroundReceipts: { [slot]: "simulation-only" } },
    });
    await first.documents.update({
      ...one!,
      expectedRevision: one!.revision,
      data: { ...one!.data, backgroundReceipts: { [slot]: "reviewed-after-image" } },
    });
  });
  assert.equal(
    [...staged.rows.values()].filter((row) => row.kind === BACKGROUND_COMPLETION_KIND).length,
    0,
    "simulated intermediate receipts never become closure proof",
  );
  staged.hook(async (id) => {
    if (id === "villages-village") throw Error("Interrupted World replay");
  });
  await assert.rejects(first.commit("receipt-journal", review.transaction), /Interrupted World replay/);
  const savedProofs = [...staged.rows.values()]
    .filter((row) => row.kind === BACKGROUND_COMPLETION_KIND)
    .map(readBackgroundCompletion);
  assert.deepEqual(
    savedProofs.map((proof) => proof.jobId),
    ["physical-commit"],
  );
  assert.equal(staged.rows.get("villages-village").data.backgroundReceipts[slot], "physical-commit");
  first.dispose();
  staged.hook(async () => {});
  const restarted = createRepairGate(staged.store);
  assert.equal(
    (await restarted.documents.getById("villages", initial.id))!.data.backgroundReceipts[slot],
    "reviewed-after-image",
  );
  assert.equal(
    [...staged.rows.values()].filter((row) => row.kind === BACKGROUND_COMPLETION_KIND).length,
    1,
    "journal restart reuses exact proof rather than treating an intermediate preview as authority",
  );
  restarted.dispose();
});

function fixture() {
  const rows = new Map<string, any>();
  const lookups: string[] = [],
    lists: string[] = [];
  let beforeUpdate: (id: string) => Promise<void> = async () => {};
  const store: any = {
    async getById(_pkg: string, id: string) {
      lookups.push(id);
      return structuredClone(rows.get(id) ?? null);
    },
    async list(_pkg: string, kind: string) {
      lists.push(kind);
      return [...rows.values()].filter((r) => r.kind === kind).map((r) => structuredClone(r));
    },
    async create(value: any) {
      assert.ok(!rows.has(value.id));
      const row = { ...structuredClone(value), revision: 1 };
      rows.set(row.id, row);
      return structuredClone(row);
    },
    async update(value: any) {
      await beforeUpdate(value.id);
      const old = rows.get(value.id);
      if (!old || old.revision !== value.expectedRevision) return null;
      const row = { ...old, ...structuredClone(value), revision: old.revision + 1 };
      rows.set(row.id, row);
      return structuredClone(row);
    },
    async remove(_pkg: string, id: string, revision: number) {
      if (rows.get(id)?.revision !== revision) return false;
      return rows.delete(id);
    },
  };
  const insert = (id: string, data: unknown, kind = "test") =>
    store.create({
      id,
      packageId: "villages",
      kind,
      name: id,
      description: "",
      data,
      createdAt: "2026-10-30T00:00:00.000Z",
      updatedAt: "2026-10-30T00:00:00.000Z",
    });
  return {
    rows,
    lookups,
    lists,
    store,
    insert,
    hook: (fn: typeof beforeUpdate) => {
      beforeUpdate = fn;
    },
  };
}
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
async function pages(f: ReturnType<typeof fixture>, count = 64, world = "a".repeat(32)) {
  const writer = createHistoryPageWriter(world);
  writer.tree(Array.from({ length: count }, (_, i) => [String(i), { text: `Exact evidence ${i} 🌲` }]));
  const rows = [];
  for (const [id, data] of writer.pages) rows.push(await f.insert(id, data, "memory-page"));
  return rows;
}
await runCase("storage-admission/page-batching", async () => {
  const f = fixture(),
    rows = await pages(f, 4_096),
    gate = createRepairGate(f.store);
  const target = await f.insert("batch-target", { value: "before" });
  const prepared = await gate.simulate(async () => {
    for (const row of rows) {
      const first = (await gate.documents.getById("villages", row.id))!;
      first.description = "Caller mutation";
      first.data = { corrupted: true };
      assert.deepEqual((await gate.documents.getById("villages", row.id))!.data, row.data);
    }
    await gate.documents.update({ ...target, expectedRevision: 1, data: { value: "after" } });
  });
  assert.equal(f.lists.filter((kind) => kind === "memory-page").length, 1);
  assert.equal(f.lookups.filter((id) => id.startsWith("villages-memory-page-")).length, 0);
  assert.equal(
    prepared.transaction.reads.filter((read) => read.id.startsWith("villages-memory-page-")).length,
    rows.length,
  );
  assert.deepEqual(prepared.transaction.lists, []);
  await pages(f, 1, "b".repeat(32));
  f.lists.length = f.lookups.length = 0;
  await gate.commit("batched-guard", prepared.transaction);
  assert.equal(f.lists.filter((kind) => kind === "memory-page").length, 1);
  assert.equal(f.lookups.filter((id) => id.startsWith("villages-memory-page-")).length, 0);
  assert.equal(f.rows.get(target.id).data.value, "after", "An unrelated page does not invalidate a per-ID review.");
  f.lists.length = f.lookups.length = 0;
  await gate.documents.getById("villages", rows[0].id);
  assert.deepEqual(f.lists, [], "Ordinary gameplay keeps selective lookups.");
  assert.deepEqual(
    f.lookups.filter((id) => id.startsWith("villages-memory-page-")),
    [rows[0].id],
  );
});
await runCase("storage-admission/page-guards", async () => {
  for (const change of ["update", "delete", "wrong-kind"] as const) {
    const f = fixture(),
      [page] = await pages(f),
      gate = createRepairGate(f.store);
    const target = await f.insert("guard-target", { value: "before" });
    const id = change === "wrong-kind" ? `villages-memory-page-${"b".repeat(32)}-${"c".repeat(64)}` : page.id;
    const prepared = await gate.simulate(async () => {
      await gate.documents.getById("villages", id);
      await gate.documents.update({ ...target, expectedRevision: 1, data: { value: "after" } });
    });
    if (change === "update") await f.store.update({ ...page, expectedRevision: 1, description: "Changed" });
    if (change === "delete") await f.store.remove("villages", id, 1);
    if (change === "wrong-kind") await f.insert(id, { collision: true }, "other-kind");
    await assert.rejects(gate.commit(`changed-${change}`, prepared.transaction), /reviewed record changed/);
    assert.equal(f.rows.get(target.id).data.value, "before");
    assert.equal(f.rows.has("villages-repair-control"), false, "Conflict is detected before journal publication.");
  }
  const f = fixture(),
    gate = createRepairGate(f.store);
  await pages(f);
  const prepared = await gate.simulate(() => gate.documents.list("villages", "memory-page"));
  await pages(f, 1, "b".repeat(32));
  await assert.rejects(gate.commit("explicit-list", prepared.transaction), /Related records changed/);
});
await runCase("storage-admission/page-overlay", async () => {
  const f = fixture(),
    rows = await pages(f, 128),
    gate = createRepairGate(f.store);
  const newPage = { ...rows[0], id: `villages-memory-page-${"b".repeat(32)}-${"c".repeat(64)}` };
  const first = await gate.simulate(async () => {
    await gate.documents.getById("villages", rows[0].id);
  });
  f.lists.length = 0;
  const staged = await gate.simulate(async () => {
    await gate.documents.update({ ...rows[0], expectedRevision: 1, description: "Staged update" });
    assert.equal((await gate.documents.getById("villages", rows[0].id))!.description, "Staged update");
    assert.equal(await gate.documents.remove("villages", rows[1].id, 1), true);
    assert.equal(await gate.documents.getById("villages", rows[1].id), null);
    await gate.documents.create(newPage);
    assert.equal((await gate.documents.getById("villages", newPage.id))!.id, newPage.id);
  }, first.transaction);
  assert.equal(
    f.lists.filter((kind) => kind === "memory-page").length,
    1,
    "Guards and simulation share one physical inventory.",
  );
  assert.equal(staged.transaction.writes.length, 3);
  assert.equal(f.rows.get(rows[0].id).description, "");
  assert.ok(f.rows.has(rows[1].id));
  assert.equal(f.rows.has(newPage.id), false);
});
await runCase("storage-admission/page-acknowledgement", async () => {
  for (const method of ["create", "update", "remove"] as const) {
    const f = fixture(),
      [page] = await pages(f);
    const gate = createRepairGate({
      ...f.store,
      async [method](...args: any[]) {
        await f.store[method](...args);
        throw Error("Write acknowledgement lost");
      },
    });
    await gate.alone(async () => {
      await gate.documents.getById("villages", page.id);
      const id = method === "create" ? `villages-memory-page-${"b".repeat(32)}-${"c".repeat(64)}` : page.id;
      if (method === "create") {
        assert.equal(await gate.documents.getById("villages", id), null);
        await assert.rejects(gate.documents.create({ ...page, id }), /acknowledgement lost/);
      } else if (method === "update") {
        await assert.rejects(
          gate.documents.update({ ...page, expectedRevision: 1, description: "Committed" }),
          /acknowledgement lost/,
        );
      } else await assert.rejects(gate.documents.remove("villages", page.id, 1), /acknowledgement lost/);
      const observed = await gate.documents.getById("villages", id);
      if (method === "remove") assert.equal(observed, null);
      else assert.equal(observed!.description, method === "update" ? "Committed" : "");
    });
    assert.equal(f.lists.filter((kind) => kind === "memory-page").length, 2);
  }
});
await runCase("storage-admission/page-inflight", async () => {
  for (const method of ["update", "remove"] as const) {
    const f = fixture(),
      [page] = await pages(f),
      entered = deferred(),
      release = deferred();
    let held = false;
    const gate = createRepairGate({
      ...f.store,
      async list(pkg: string, kind: string) {
        const rows = await f.store.list(pkg, kind);
        if (kind === "memory-page" && !held) {
          held = true;
          entered.resolve();
          await release.promise;
        }
        return rows;
      },
    });
    await gate.alone(async () => {
      const reading = gate.documents.getById("villages", page.id);
      await entered.promise;
      if (method === "update") await gate.documents.update({ ...page, expectedRevision: 1, description: "New" });
      else await gate.documents.remove("villages", page.id, 1);
      release.resolve();
      const row = await reading;
      if (method === "remove") assert.equal(row, null);
      else assert.equal(row!.description, "New");
    });
    assert.equal(f.lists.filter((kind) => kind === "memory-page").length, 2);
  }
});
await runCase("storage-admission/page-lifetime", async () => {
  const f = fixture(),
    [page] = await pages(f),
    gate = createRepairGate(f.store),
    release = deferred();
  let detached!: Promise<any>;
  await gate.alone(async () => {
    await gate.documents.getById("villages", page.id);
    detached = (async () => {
      await release.promise;
      return gate.documents.getById("villages", page.id);
    })();
  });
  await f.store.update({ ...page, expectedRevision: 1, description: "Next operation" });
  await gate.alone(async () => {
    release.resolve();
    assert.equal(
      (await detached).description,
      "Next operation",
      "An inherited async context cannot reuse an ended inventory.",
    );
  });
});
await runCase("storage-admission/page-inventory-integrity", async () => {
  for (const corruption of ["package", "kind", "duplicate"] as const) {
    const f = fixture(),
      [page] = await pages(f);
    const gate = createRepairGate({
      ...f.store,
      async list() {
        return corruption === "duplicate"
          ? [page, page]
          : [{ ...page, ...(corruption === "package" ? { packageId: "foreign" } : { kind: "other" }) }];
      },
    });
    await assert.rejects(
      gate.alone(() => gate.documents.getById("villages", page.id)),
      /inventory is invalid/,
    );
  }
});
await runCase("storage-admission/page-replay", async () => {
  const f = fixture(),
    rows = await pages(f, 512),
    admission = createRepairAdmission(),
    gate = createRepairGate(f.store, admission);
  const prepared = await gate.simulate(async () => {
    for (const row of rows) await gate.documents.update({ ...row, expectedRevision: 1, description: "Restored" });
  });
  f.hook(async (id) => {
    if (id === rows[0].id) throw Error("Interrupted replay");
  });
  await assert.rejects(gate.commit("large-page-replay", prepared.transaction), /Interrupted replay/);
  gate.dispose();
  f.hook(async () => {});
  f.lists.length = f.lookups.length = 0;
  const restarted = createRepairGate(f.store, admission);
  await restarted.documents.getById("villages", rows[0].id);
  assert.equal(f.lists.filter((kind) => kind === "memory-page").length, 1);
  assert.deepEqual(
    f.lookups.filter((id) => id.startsWith("villages-memory-page-")),
    [rows[0].id],
    "Only the final ordinary read uses a point lookup.",
  );
  for (const row of rows) assert.equal(f.rows.get(row.id).description, "Restored");
});
await runCase("storage-admission/module-replacement", async () => {
  const replacement = await import(
    new URL("../packages/villages/src/server/entry/backend-work.ts?replacement", import.meta.url).href
  );
  assert.notEqual(replacement.backendWorkFor, backendWorkFor, "Exercise independently imported module snapshots.");
  const backend = {};
  assert.equal(replacement.backendWorkFor(backend), backendWorkFor(backend));
  assert.notEqual(
    replacement.backendWorkFor({}),
    backendWorkFor(backend),
    "Independent backends keep independent admission.",
  );
});
await runCase("storage-admission/disposed-write", async () => {
  const f = fixture(),
    admission = createRepairAdmission();
  const source = await f.insert("old-publication", { value: "before" });
  const target = await f.insert("replay-target", { value: "before" });
  const old = createRepairGate(f.store, admission);
  await old.documents.getById("villages", source.id);
  const clean = (row: any) => ({
    id: row.id,
    kind: row.kind,
    name: row.name,
    description: row.description,
    data: row.data,
  });
  const codec = createRepairTransactionCodec(f.store);
  const writes = await codec.encodeWrites([
    { before: clean(target), after: { ...clean(target), data: { value: "replayed" } } },
  ]);
  await f.insert(
    "villages-repair-control",
    { version: 3, epoch: 5, pending: { id: "held-journal", writes } },
    "repair-control",
  );
  const entered = deferred(),
    release = deferred();
  f.hook(async (id) => {
    if (id === source.id) {
      entered.resolve();
      await release.promise;
    }
  });
  const late = old.documents.update({
    ...source,
    packageId: "villages",
    expectedRevision: source.revision,
    data: { value: "late" },
  });
  await entered.promise;
  old.dispose();
  const next = createRepairGate(f.store, admission);
  let deleted = false;
  await assert.rejects(
    next.alone(async () => {
      deleted = true;
    }),
    /still settling/,
  );
  await assert.rejects(next.documents.getById("villages", target.id), /still settling/);
  assert.equal(deleted, false);
  assert.equal(
    f.rows.get(target.id).data.value,
    "before",
    "Startup cannot replay a journal through old admitted work.",
  );
  release.resolve();
  await late;
  assert.equal(
    f.rows.get(source.id).data.value,
    "late",
    "Disposal does not pretend an invoked host write was cancelled.",
  );
  assert.equal((await next.documents.getById("villages", target.id))!.data.value, "replayed");
  await next.alone(async () => {
    deleted = true;
  });
  assert.equal(deleted, true);
  await assert.rejects(old.documents.getById("villages", source.id), /no longer active/);
});
await runCase("storage-admission/epoch", async () => {
  const f = fixture(),
    admission = createRepairAdmission();
  admission.epoch = 10;
  await f.insert("villages-repair-control", { version: 3, epoch: 3 }, "repair-control");
  const gate = createRepairGate(f.store, admission);
  await gate.documents.getById("villages", "missing");
  assert.equal(admission.epoch, 10, "A replacement activation cannot revive an older admitted epoch.");
});
await runCase("storage-admission/recovery-generation", async () => {
  const f = fixture(),
    admission = createRepairAdmission();
  const source = await f.insert("shared-source", { value: "before" });
  const first = createRepairGate(f.store, admission),
    next = createRepairGate(f.store, admission);
  await first.documents.getById("villages", source.id);
  await next.documents.getById("villages", source.id);
  const change = await first.simulate(async () => {
    await first.documents.update({ ...source, expectedRevision: source.revision, data: { value: "after" } });
  });
  f.hook(async (id) => {
    if (id === source.id) throw Error("journal saved before interruption");
  });
  await assert.rejects(first.commit("interrupted", change.transaction), /before interruption/);
  assert.ok(f.rows.get("villages-repair-control").data.pending);
  let admitted = false;
  await assert.rejects(
    next.alone(async () => {
      admitted = true;
    }),
    /before interruption/,
  );
  assert.equal(admitted, false, "An already initialized replacement must reconcile the newly published journal.");
  assert.equal(f.rows.get(source.id).data.value, "before");
  f.hook(async () => {});
  await next.alone(async () => {
    admitted = true;
  });
  assert.equal(admitted, true);
  assert.equal(f.rows.get(source.id).data.value, "after");
  assert.equal(f.rows.get("villages-repair-control").data.pending, undefined);
});
await runCase("storage-admission/history-read", async () => {
  const f = fixture(),
    gate = createRepairGate(f.store),
    unbind = configureRepairGate(gate);
  try {
    const repo = createVillageRepository(() => gate.documents);
    await repo.mutateAuthority(
      (state) => {
        state.seed = "read-owner";
        state.setupAt = memoryTime();
        state.memories = addMemory(state.memories, { audience: ["player"] });
      },
      { memories: true },
    );
    const entered = deferred(),
      release = deferred();
    const wrapped = {
      ...gate.documents,
      async getById(pkg: string, id: string) {
        const row = await gate.documents.getById(pkg, id);
        // Pause after per-document admission ended, before the history load continues.
        if (id === "villages-village") {
          entered.resolve();
          await release.promise;
        }
        return row;
      },
    };
    const cold = createVillageRepository(() => wrapped);
    const reading = cold.readAuthority({ memories: true });
    await entered.promise;
    await assert.rejects(
      gate.alone(async () => {}),
      /Other Village work is active/,
    );
    release.resolve();
    assert.equal((await reading).memories.records.length, 1);
  } finally {
    unbind();
  }
});
await runCase("storage-admission/cleanup-wait", async () => {
  for (const sameTurn of [false, true]) {
    const f = fixture(),
      admission = createRepairAdmission();
    const first = createRepairGate(f.store, admission),
      next = createRepairGate(f.store, admission);
    await first.documents.getById("villages", "missing");
    await next.documents.getById("villages", "missing");
    const entered = deferred(),
      release = deferred();
    const sweeping = first.alone(async () => {
      entered.resolve();
      await release.promise;
    }, "cleanup");
    if (!sameTurn) await entered.promise;
    let completed = false;
    const reading = next.documents.getById("villages", "missing").then((row) => {
      completed = true;
      return row;
    });
    await nextTurn();
    assert.equal(completed, false, "New gameplay reads wait for cleanup without a REPAIR conflict.");
    release.resolve();
    await sweeping;
    assert.equal(await reading, null);
  }
});
await runCase("storage-admission/idle-context", async () => {
  const f = fixture(),
    gate = createRepairGate(f.store);
  const source = await f.insert("idle-source", { value: "before" });
  const change = await gate.simulate(async () => {
    await gate.documents.update({ ...source, expectedRevision: source.revision, data: { value: "after" } });
  });
  let cleanup: Promise<void> | undefined;
  const unbind = gate.whenIdle(() => {
    unbind();
    cleanup = Promise.resolve().then(() => gate.alone(async () => {}));
  });
  await gate.commit("advance-epoch", change.transaction);
  assert.ok(cleanup);
  await cleanup;
});
await runCase("storage-admission/manual-publication-gap", async () => {
  const f = fixture(),
    admission = createRepairAdmission();
  await f.insert("villages-repair-control", { version: 3, epoch: 0 }, "repair-control");
  const source = await f.insert("gap-source", { value: "before" });
  const first = createRepairGate(f.store, admission),
    next = createRepairGate(f.store, admission);
  await first.documents.getById("villages", source.id);
  await next.documents.getById("villages", source.id);
  const change = await first.simulate(async () => {
    await first.documents.update({ ...source, expectedRevision: 1, data: { value: "after" } });
  });
  const entered = deferred(),
    release = deferred();
  f.hook(async (id) => {
    if (id === "villages-repair-control") {
      entered.resolve();
      await release.promise;
    }
    if (id === source.id) throw Error("effect interrupted");
  });
  const saving = assert.rejects(first.commit("publication-gap", change.transaction), /effect interrupted/);
  await entered.promise;
  await assert.rejects(next.documents.getById("villages", source.id), /REPAIR is saving/);
  release.resolve();
  await saving;
  let admitted = false;
  await assert.rejects(
    next.alone(async () => {
      admitted = true;
    }),
    /effect interrupted/,
  );
  assert.equal(admitted, false, "An older settled Control read cannot validate a later interrupted journal.");
  f.hook(async () => {});
  await next.alone(async () => {});
  assert.equal(f.rows.get(source.id).data.value, "after");
});
await runCase("storage-admission/parallel-readiness", async () => {
  const f = fixture(),
    admission = createRepairAdmission();
  const source = await f.insert("parallel-source", { value: "before" });
  const clean = {
    id: source.id,
    kind: source.kind,
    name: source.name,
    description: source.description,
    data: source.data,
  };
  const codec = createRepairTransactionCodec(f.store);
  const writes = await codec.encodeWrites([{ before: clean, after: { ...clean, data: { value: "after" } } }]);
  await f.insert(
    "villages-repair-control",
    { version: 3, epoch: 1, pending: { id: "parallel", writes } },
    "repair-control",
  );
  const entered = deferred(),
    release = deferred();
  f.hook(async (id) => {
    if (id === source.id) {
      entered.resolve();
      await release.promise;
    }
  });
  const gates = Array.from({ length: 3 }, () => createRepairGate(f.store, admission));
  const first = gates[0].documents.getById("villages", source.id);
  await entered.promise;
  const readers = gates.slice(1).map((gate) => gate.documents.getById("villages", source.id));
  release.resolve();
  assert.deepEqual(
    (await Promise.all([first, ...readers])).map((row) => row!.data.value),
    ["after", "after", "after"],
  );
});
await runCase("storage-admission/stale-control-read", async () => {
  const f = fixture(),
    admission = createRepairAdmission();
  const source = await f.insert("stale-control-source", { value: "before" });
  const first = createRepairGate(f.store, admission);
  await first.documents.getById("villages", source.id);
  const entered = deferred(),
    release = deferred();
  let held = false;
  const delayed = createRepairGate(
    {
      ...f.store,
      async getById(pkg: string, id: string) {
        const row = await f.store.getById(pkg, id);
        if (!held && id === "villages-repair-control") {
          held = true;
          entered.resolve();
          await release.promise;
        }
        return row;
      },
    },
    admission,
  );
  const reading = delayed.documents.getById("villages", source.id);
  await entered.promise;
  const change = await first.simulate(async () => {
    await first.documents.update({ ...source, expectedRevision: 1, data: { value: "after" } });
  });
  f.hook(async (id) => {
    if (id === source.id) throw Error("pending after stale read");
  });
  await assert.rejects(first.commit("stale-control", change.transaction), /pending after stale read/);
  f.hook(async () => {});
  release.resolve();
  assert.equal(
    (await reading)!.data.value,
    "after",
    "A stale no-journal read must retry against the advanced recovery epoch.",
  );
  assert.equal(f.rows.get("villages-repair-control").data.pending, undefined);
});
