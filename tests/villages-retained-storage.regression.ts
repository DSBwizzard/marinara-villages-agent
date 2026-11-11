// Test cases: retained-storage/checkpoint-owners, retained-storage/virtual-review, retained-storage/partial-preparation, retained-storage/shared-pages, retained-storage/foreign-owner, retained-storage/allocation-budget, retained-storage/frozen-scene, retained-storage/repeated-head, retained-storage/checkpoint-integrity, retained-storage/growth, retained-storage/payload-identity, retained-storage/continuity-owners, retained-storage/continuity-publication, retained-storage/sprite-owners, retained-storage/sprite-upload-holds, retained-storage/sprite-startup-retry, retained-storage/background-sprite-retirement
import assert from "node:assert/strict";
import { VillagesRequestError } from "../packages/villages/src/server/domain/rules/errors.js";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { authorSceneFixture, fixtureSceneState } from "./helpers/village-storage.fixture.js";
import { randomUUID } from "node:crypto";
import { runCase } from "../scripts/test-cases.mjs";
import { createRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";
import {
  collectRetainedStorage,
  createRetainedStorageCleanup,
} from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { createRepairSnapshots } from "../packages/villages/src/server/adapters/storage/repair-snapshot-store.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  memoryDigest,
  memoryPayload,
  emptyMemoryPayload,
} from "../packages/villages/src/server/adapters/storage/memory-payload-store.js";
import { createMemoryPageTracer } from "../packages/villages/src/server/adapters/storage/memory-pages.js";
import {
  encodeContinuityPages,
  traceContinuityPages,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { repairId } from "../packages/villages/src/server/domain/rules/repair-records.js";
import { nativeHistoryFixture, retainAuthoredNote } from "./helpers/continuity.fixture.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { protectContinuity, continuityHolderKey } from "../packages/villages/src/server/domain/rules/continuity.js";
import {
  continuityMemoryLibrary,
  inspectContinuityRelationships,
} from "../packages/villages/src/server/domain/rules/continuity-library.js";
import { venue } from "./fixtures/villages-projects.fixture.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { captureReturnContext } from "../packages/villages/src/server/domain/rules/return-catchup-capture.js";
import { returnCaptureRevision } from "../packages/villages/src/server/domain/rules/return-capture-revision.js";
import { residentPlanningInput } from "./fixtures/resident-planning.fixture.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import {
  createSpriteFiles,
  spriteFileId,
  spriteFileProcess,
} from "../packages/villages/src/server/adapters/storage/sprite-files.js";
import { emptySpriteManager } from "../packages/villages/src/server/domain/rules/sprite-manager-model.js";
import type { Job } from "../packages/villages/src/server/domain/models/background-model.js";
import {
  nativeBackgroundJob,
  retainBackgroundJob,
  backgroundHistoryId,
} from "../packages/villages/src/server/adapters/storage/background-responses.js";
import { backgroundSlotId } from "../packages/villages/src/server/domain/rules/background-revision.js";
import { backgroundCompletionId } from "../packages/villages/src/server/adapters/storage/background-completions.js";

const memoryTime = (hours = 0) => new Date(Date.UTC(2025, 0, 1) + hours * 3600000).toISOString();
const resident = (id: string) => ({
  characterId: id,
  incarnation: id + "-one",
  letterFontId: "caveat" as const,
  addedAt: memoryTime(),
  cardSnapshot: {
    ...snapshotFromCard(readVillagerCard({ id, comment: "", data: { name: id } }), 1),
    capturedAt: memoryTime(),
  },
  agenda: null,
});
function forget(state: VillageState, id: string, operationId: string, at: string) {
  const holder = continuityActor(state, "player")!,
    key = continuityHolderKey(holder);
  const record = state.continuity.records.find((row) => row.id === id)!;
  state.continuity = protectContinuity(
    state.continuity,
    { id, recordRevision: record.revision, heads: { [key]: record.heads[key].revision } },
    [holder],
    operationId,
    at,
    { forget: true },
  );
}

async function fixture() {
  const rows = new Map<string, any>(),
    lists: string[] = [];
  const store: any = {
    async getById(_pkg: string, id: string) {
      return structuredClone(rows.get(id) ?? null);
    },
    async list(_pkg: string, kind: string) {
      lists.push(kind);
      return [...rows.values()].filter((r) => r.kind === kind).map((r) => structuredClone(r));
    },
    async create(input: any) {
      if (input.kind === "venue-visit")
        input = { ...input, data: authorSceneFixture(rows, input.data, rows.get("villages-village")?.data) };
      assert.ok(!rows.has(input.id));
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(row.id, row);
      return structuredClone(row);
    },
    async update(input: any) {
      const old = rows.get(input.id);
      if (!old || old.revision !== input.expectedRevision) return null;
      const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
      rows.set(row.id, row);
      return structuredClone(row);
    },
    async remove(_pkg: string, id: string, revision: number) {
      if (rows.get(id)?.revision !== revision) return false;
      return rows.delete(id);
    },
  };
  const gate = createRepairGate(store),
    repo = createVillageRepository(() => gate.documents);
  const api = createRepairService({
    gate,
    repository: repo,
    resumeProject: async () => {},
    cancelProject: async () => {},
    replaySaved: async () => {},
  });
  await repo.mutateAuthority(
    (state) => {
      Object.assign(state, defaultVillageState());
      state.seed = "retained-storage";
      state.name = "Retained storage";
      state.setupAt = memoryTime();
      state.foundedAt = memoryTime();
      state.venues = [venue()];
      retainAuthoredNote(state, "first", "The player left a telescope by the window.", ["player"], memoryTime());
    },
    { memories: true },
  );
  const insert = (id: string, kind: string, data: unknown) =>
    store.create({
      id,
      kind,
      packageId: "villages",
      name: id,
      description: "",
      data,
      createdAt: memoryTime(),
      updatedAt: memoryTime(),
    });
  return { rows, lists, gate, repo, api, store, insert, head: () => rows.get("villages-village").data.memoryHead };
}
await runCase("retained-storage/sprite-owners", async () => {
  const f = await fixture(),
    files = new Map<string, string>(),
    removed: string[] = [];
  const assetId = "villages-" + randomUUID(),
    render = "r-" + randomUUID().replaceAll("-", "");
  const image = "data:image/png;base64," + Buffer.from("exact original pixels").toString("base64");
  const save = createSpriteFiles(f.gate.documents);
  const allocate = (name: string) =>
    save(assetId, name, image, async () => {
      files.set(name, image);
      return { filename: name + ".png", url: `/api/sprites/${assetId}/file/${name}.png` };
    });
  const remove = async (batch: readonly { expression: string }[]) => {
    for (const file of batch) {
      removed.push(file.expression);
      files.delete(file.expression);
    }
  };
  await f.gate.work(async () => {
    const source = await allocate("original"),
      rendered = await allocate(render);
    const manager = emptySpriteManager();
    manager.artwork.push({
      id: "a-" + randomUUID(),
      name: "Original",
      assetId,
      origin: "upload",
      source: { ...source, width: 1, height: 1, sha256: memoryDigest("exact original pixels") },
      rendered,
      frame: { x: 0, y: 0, width: 1, height: 1, scale: 1, offsetX: 0, offsetY: 0 },
      warnings: [],
    });
    await f.repo.mutateAuthority((world) => {
      world.villagers = [{ ...resident("mara"), spriteManager: manager }];
    });
  });
  const cp = await f.api.createCheckpoint("Original artwork", "sprite-original");
  const retained = structuredClone((await f.repo.readAuthority()).villagers[0].spriteManager);
  await f.repo.mutateAuthority((world) => {
    world.villagers[0].spriteManager!.artwork = [];
  });
  await collectRetainedStorage(f.gate, remove);
  assert.deepEqual(removed, [], "A manual checkpoint retains both files after artwork removal");
  const restore = await f.api.restore(cp.id, "restore-sprite-original");
  await f.api.apply(restore.id, restore.token);
  assert.deepEqual((await f.repo.readAuthority()).villagers[0].spriteManager, retained);
  assert.equal(files.get("original"), image);
  assert.equal(files.get(render), image, "Restoring JSON also restores readable exact derivative bytes");
  await f.api.deleteCheckpoint(cp.id, cp.token);
  await f.repo.mutateAuthority((world) => {
    world.villagers[0].spriteManager!.artwork = [];
  });
  const draft = await f.insert("villages-sprite-setup-held", "sprite-setup", { revision: 1, manager: retained });
  await collectRetainedStorage(f.gate, remove);
  assert.deepEqual(removed, [], "An unused setup draft protects artwork independent of assignments");
  await f.store.remove("villages", draft.id, draft.revision);
  // The successful restore's available Undo retains its previous World; it contains no artwork.
  await collectRetainedStorage(f.gate, remove);
  assert.deepEqual(new Set(removed), new Set(["original", render]));
  assert.equal(files.size, 0);
});
await runCase("retained-storage/sprite-upload-holds", async () => {
  const f = await fixture(),
    assetId = "villages-" + randomUUID();
  const name = "r-" + randomUUID().replaceAll("-", ""),
    image = "data:image/png;base64,UE5H";
  let deleted = 0;
  await assert.rejects(
    f.gate.work(() =>
      createSpriteFiles(f.gate.documents)(assetId, name, image, async () => {
        throw Error("lost upload acknowledgement");
      }),
    ),
    /lost upload/,
  );
  const id = spriteFileId(assetId, name);
  assert.equal(f.rows.get(id).data.process, spriteFileProcess);
  await collectRetainedStorage(f.gate, async () => {
    deleted++;
  });
  assert.equal(deleted, 0, "A drained or replaced activation cannot release an uncertain same-process upload");
  assert(f.rows.has(id));
  f.rows.get(id).data.process = randomUUID(); // Simulate a claim from an exited Engine process.
  const restarted = createRepairGate(f.store);
  await assert.rejects(
    collectRetainedStorage(restarted, async () => {
      throw Error("lost delete acknowledgement");
    }),
    /lost delete/,
  );
  assert(f.rows.has(id), "Failed deletion retains the allocation for reconciliation");
  await collectRetainedStorage(restarted, async () => {
    deleted++;
  });
  assert.equal(deleted, 1, "An exited producer's unowned partial upload can be reclaimed");
  assert(!f.rows.has(id));
  const orphan = "r-" + randomUUID().replaceAll("-", "");
  await f.gate.work(() => createSpriteFiles(f.gate.documents)(assetId, orphan, image, async () => {}));
  const corrupt = await f.insert("villages-sprite-setup-corrupt", "sprite-setup", {
    manager: { version: 1, artwork: [{ assetId: "foreign" }] },
  });
  await assert.rejects(
    collectRetainedStorage(f.gate, async () => {
      deleted++;
    }),
    /retained sprite asset/,
  );
  assert.equal(deleted, 1, "A malformed owner prevents every physical deletion");
  assert(f.rows.has(spriteFileId(assetId, orphan)));
  await f.store.remove("villages", corrupt.id, corrupt.revision);
  let release!: () => void;
  let enter!: () => void;
  const entered = new Promise<void>((resolve) => {
    enter = resolve;
  });
  const done = new Promise<void>((resolve) => {
    release = resolve;
  });
  const writing = f.gate.work(async () => {
    enter();
    await done;
  });
  await entered;
  await assert.rejects(collectRetainedStorage(f.gate), /work is active/);
  release();
  await writing;
});
await runCase("retained-storage/sprite-startup-retry", async () => {
  for (const integrityFailure of [false, true]) {
    const f = await fixture(),
      failures: unknown[] = [];
    const assetId = "villages-" + randomUUID(),
      expression = "r-" + randomUUID().replaceAll("-", "");
    await f.gate.work(() =>
      createSpriteFiles(f.gate.documents)(assetId, expression, "data:image/png;base64,UE5H", async () => {}),
    );
    if (integrityFailure) await f.insert("villages-sprite-setup-invalid", "sprite-setup", { manager: {} });
    let calls = 0;
    const cleanup = createRetainedStorageCleanup(
      f.gate,
      (error) => failures.push(error),
      async () => {
        if (++calls === 1) throw new VillagesRequestError(502, "Engine is not listening yet", "engine_unavailable");
      },
    );
    const stop = cleanup.start();
    try {
      await cleanup.request();
      assert.equal(failures.length, 1);
      assert(f.rows.has(spriteFileId(assetId, expression)), "A failed sweep keeps its allocation");
      const passes = f.lists.filter((kind) => kind === "repair-snapshot").length;
      for (let i = 0; i < 5; i++) {
        await f.gate.work(async () => {});
        await cleanup.request();
      }
      if (integrityFailure) {
        assert.equal(calls, 0);
        assert.equal(
          f.lists.filter((kind) => kind === "repair-snapshot").length,
          passes,
          "Integrity failures retain allocation backoff instead of rescanning on every ordinary read",
        );
      } else {
        assert.equal(calls, 2, "The next admitted idle retries temporary Engine unavailability without new allocation");
        assert(!f.rows.has(spriteFileId(assetId, expression)));
        assert.equal(
          f.lists.filter((kind) => kind === "repair-snapshot").length,
          passes + 1,
          "Successful retry restores normal allocation-based scheduling",
        );
      }
    } finally {
      stop();
      cleanup.dispose();
    }
  }
  const f = await fixture(),
    failures: unknown[] = [];
  await f.insert("villages-sprite-setup-racing-invalid", "sprite-setup", { manager: {} });
  let enter!: () => void, release!: () => void, held: Promise<void> | undefined;
  const entered = new Promise<void>((resolve) => {
    enter = resolve;
  });
  const hold = new Promise<void>((resolve) => {
    release = resolve;
  });
  const unsubscribe = f.gate.whenIdle(() => {
    held ??= f.gate.work(async () => {
      enter();
      await hold;
    });
  });
  const cleanup = createRetainedStorageCleanup(f.gate, (error) => failures.push(error));
  const stop = cleanup.start();
  try {
    await cleanup.request();
    await entered;
    assert.equal(failures.length, 1, "A newly admitted reader cannot hide the preceding integrity failure");
    const passes = f.lists.filter((kind) => kind === "repair-snapshot").length;
    release();
    await held;
    await cleanup.request();
    assert.equal(
      f.lists.filter((kind) => kind === "repair-snapshot").length,
      passes,
      "Integrity backoff remains established when another reader entered during exclusion release",
    );
  } finally {
    release();
    await held;
    unsubscribe();
    stop();
    cleanup.dispose();
  }
});
await runCase("retained-storage/continuity-owners", async () => {
  const f = await fixture();
  let id = "";
  const initial = "Aqua trusts the player to return borrowed books.";
  const privateText = "Aqua keeps an exact private recollection of their first meeting.";
  await f.repo.mutateAuthority(
    (state) => {
      state.villagers.push(resident("aqua"));
      id = retainAuthoredNote(state, "original-perspective", initial, ["aqua"], memoryTime(), {
        class: "perspective",
        owner: continuityActor(state, "aqua")!,
        about: ["player"],
        current: true,
      });
      retainAuthoredNote(state, "private-recollection", privateText, ["aqua"], memoryTime());
    },
    { memories: true },
  );
  const first = f.head();
  const checkpoint = await f.api.createCheckpoint("Private continuity owner", "continuity-owner");
  await f.repo.mutateAuthority(
    (state) => {
      retainAuthoredNote(state, "later", "Later the player bought a notebook.", ["player"], memoryTime(1));
    },
    { memories: true },
  );
  const beforeRepair = f.head();
  const record = await f.api.inspect(repairId("memory", id));
  const review = await f.api.prepare({
    operationId: "correct-perspective",
    recordId: record.id,
    expectedRecord: record.token!,
    action: "correct",
    knowers: ["aqua"],
    values: { text: "Aqua only trusts the player with common books." },
  });
  const cold = () => createVillageRepository(() => f.gate.documents).readAuthority({ memories: true });
  const perspective = async () => inspectContinuityRelationships(await cold(), "aqua", memoryTime(2))[0];
  await collectRetainedStorage(f.gate);
  assert(f.rows.has(first.id), "A manual checkpoint protects the older shared history head");
  await f.api.apply(review.id, review.token);
  assert.equal((await perspective()).text, "Aqua only trusts the player with common books.");
  const undo = await f.api.undo(review.id, "undo-perspective");
  await f.api.apply(undo.id, undo.token);
  assert.equal((await perspective()).text, initial);
  const restore = await f.api.restore(checkpoint.id, "restore-perspective");
  await f.api.apply(restore.id, restore.token);
  const restored = await cold();
  assert.equal((await perspective()).text, initial);
  assert(
    continuityMemoryLibrary(restored, { inspection: true, characterId: "aqua" }, memoryTime(2)).entries.some(
      (entry) => entry.text === privateText,
    ),
  );
  assert.equal(continuityMemoryLibrary(restored, { query: "private recollection" }, memoryTime(2)).total, 0);
  assert.equal(continuityMemoryLibrary(restored, { query: "notebook" }, memoryTime(2)).total, 0);
  const root = f.rows.get("villages-village");
  root.kind = "unknown";
  const malformed = structuredClone(f.rows);
  await assert.rejects(cold, /Village.*identity/);
  await assert.rejects(f.api.inspect(repairId("memory", id)), /Village.*identity/);
  await assert.rejects(f.api.createCheckpoint("Invalid owner", "invalid-owner"), /Village.*identity/);
  await assert.rejects(
    f.repo.mutateAuthority((state) => {
      state.name = "Unsafe publication";
    }),
    /Village.*identity/,
  );
  await assert.rejects(collectRetainedStorage(f.gate), /Village.*identity/);
  assert.deepEqual(f.rows, malformed, "A wrong-kind current owner cannot publish or release anything");
  root.kind = "village";
  const saved = root.data.memoryHead;
  root.data.memoryHead = beforeRepair;
  f.rows.delete(beforeRepair.id);
  const missing = structuredClone(f.rows);
  await assert.rejects(collectRetainedStorage(f.gate), /missing/);
  assert.deepEqual(f.rows, missing, "Missing current history prevents every deletion");
  root.data.memoryHead = saved;
});

await runCase("retained-storage/continuity-publication", async () => {
  const f = await fixture();
  const head = f.head();
  const create = f.store.create;
  let createdPages = 0;
  f.store.create = async (input: any) => {
    if (input.kind === "memory-page" && ++createdPages === 2) throw Error("Interrupted continuity publication");
    return create(input);
  };
  await assert.rejects(
    f.gate.work(() =>
      f.repo.mutateAuthority((state) => Object.assign(state, nativeHistoryFixture(state, 40)), { memories: true }),
    ),
    /Interrupted continuity publication/,
  );
  f.store.create = create;
  f.gate.dispose();
  const restarted = createRepairGate(f.store);
  const cold = createVillageRepository(() => restarted.documents);
  await collectRetainedStorage(restarted);
  assert.equal([...f.rows.values()].filter((row) => row.kind === "memory-payload-intent").length, 0);
  assert.equal([...f.rows.values()].filter((row) => row.kind === "memory-payload").length, 1);
  assert.deepEqual(f.head(), head);
  assert.equal((await cold.readAuthority({ memories: true })).continuity.records.length, 1);
  let entered!: () => void, release!: () => void;
  const atWrite = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const continueWrite = new Promise<void>((resolve) => {
    release = resolve;
  });
  f.store.create = async (input: any) => {
    if (input.kind === "memory-payload") {
      entered();
      await continueWrite;
    }
    return create(input);
  };
  const writer = restarted.work(() =>
    cold.mutateAuthority(
      (state) => {
        retainAuthoredNote(state, "later", "The telescope was returned.", ["player"], memoryTime(1));
      },
      { memories: true },
    ),
  );
  await atWrite;
  try {
    const before = structuredClone(f.rows);
    await assert.rejects(collectRetainedStorage(restarted), /work is active/);
    assert.deepEqual(f.rows, before, "Cleanup cannot release a preparation while its writer can publish");
  } finally {
    release();
    await writer;
    f.store.create = create;
  }
  await collectRetainedStorage(restarted);
  assert.equal((await cold.readAuthority({ memories: true })).continuity.records.length, 2);
});

await runCase("retained-storage/checkpoint-owners", async () => {
  const f = await fixture(),
    checkpoint = await f.api.createCheckpoint("Keep old history", "manual-history");
  const old = f.head();
  await f.repo.mutateAuthority(
    (state) => {
      retainAuthoredNote(state, "later", "The player brought the telescope outside.", ["player"], memoryTime(1));
    },
    { memories: true },
  );
  for (let i = 0; i < 11; i++) {
    const record = await f.api.inspect(repairId("world"));
    const values = Object.fromEntries(record.fields.map((field) => [field.key, field.value]));
    values.setting = `Retained physical account ${i}`;
    const review = await f.api.prepare({
      operationId: `change-${i}`,
      recordId: record.id,
      expectedRecord: record.token!,
      action: "correct",
      values,
      knowers: [],
    });
    await f.api.apply(review.id, review.token);
  }
  const first = await collectRetainedStorage(f.gate);
  assert.ok(first.removed > 0, "Superseded journal and preview bodies are reclaimable.");
  assert.ok(f.rows.has(old.id), "A manual checkpoint protects an older Memory head.");
  assert.equal([...f.rows.values()].filter((row) => row.kind === "repair-undo").length, 10);
  assert.equal((await f.api.index()).history.length, 11);
  await f.api.deleteCheckpoint(checkpoint.id, checkpoint.token);
  await collectRetainedStorage(f.gate);
  assert.equal(f.rows.has(old.id), false, "The last explicit owner can release superseded immutable history.");
  const undo = await f.api.undo("change-10", "consume-undo");
  await f.api.apply(undo.id, undo.token);
  await collectRetainedStorage(f.gate);
  assert.equal([...f.rows.values()].filter((row) => row.kind === "repair-undo").length, 9);
  assert.equal((await f.api.index()).history.length, 12);
  assert.equal((await f.repo.readAuthority({ memories: true })).continuity.records.length, 2);
  assert.equal((await collectRetainedStorage(f.gate)).removed, 0, "Repeated cleanup is idempotent.");
});
await runCase("retained-storage/virtual-review", async () => {
  const f = await fixture();
  const state = await f.repo.readAuthority({ memories: true }),
    record = await f.api.inspect(repairId("memory", state.continuity.records[0].id));
  const review = await f.api.prepare({
    operationId: "virtual-forget",
    recordId: record.id,
    expectedRecord: record.token!,
    action: "forget",
    values: {},
    knowers: ["player"],
  });
  const plan = [...f.rows.values()].find((row) => row.kind === "repair-plan")!;
  const frames = JSON.parse(plan.data.transaction.writes);
  assert.ok(
    frames.some((frame: any) => frame.memoryPages),
    "The retained review owns proposed pages before physical publication.",
  );
  await collectRetainedStorage(f.gate);
  const checkpoint = await f.api.createCheckpoint("Physical owner", "physical-owner");
  const header = [...f.rows.values()].find((row) => row.kind === "repair-checkpoint" && row.data.id === checkpoint.id)!;
  const original = header.data.snapshots;
  const proposedVillage = frames.find((frame: any) => frame.id === "villages-village").after;
  header.data.snapshots = JSON.stringify([proposedVillage]);
  const before = structuredClone(f.rows);
  await assert.rejects(collectRetainedStorage(f.gate), /owned history is missing/);
  assert.deepEqual(f.rows, before, "A virtual Plan cannot validate a missing physical checkpoint dependency.");
  header.data.snapshots = original;
  await collectRetainedStorage(f.gate);
  await f.api.apply(review.id, review.token);
  const repaired = await f.repo.readAuthority({ memories: true });
  const key = continuityHolderKey(continuityActor(repaired, "player")!);
  assert.equal(repaired.continuity.records[0].protection[key].operationId, "virtual-forget");
  assert.equal(continuityMemoryLibrary(repaired, {}, memoryTime(100)).total, 0);
});
await runCase("retained-storage/partial-preparation", async () => {
  const f = await fixture(),
    root = f.rows.get("villages-village"),
    world = memoryDigest(JSON.stringify([root.data.seed, root.data.setupAt])).slice(0, 32);
  const state = await f.repo.readAuthority({ memories: true });
  const value = { ...emptyMemoryPayload(), ...nativeHistoryFixture(state, 100) };
  const encoded = encodeContinuityPages(value, world),
    candidate = {
      id: `villages-memory-${world}-${randomUUID()}`,
      digest: memoryDigest(JSON.stringify(encoded.manifest)),
      revision: value.continuity.revision + value.episodes.revision,
    };
  await f.insert(candidate.id, "memory-payload", { format: 3, world, payload: JSON.stringify(encoded.manifest) });
  const [page, data] = [...encoded.pages][0];
  await f.insert(page, "memory-page", data);
  const intent = `villages-memory-intent-${randomUUID()}`;
  await f.insert(intent, "memory-payload-intent", {
    candidate,
    previous: f.head(),
    expectedRevision: root.revision,
    phase: "preparing",
  });
  f.gate.dispose();
  const restarted = createRepairGate(f.store);
  await collectRetainedStorage(restarted);
  assert.equal(f.rows.has(candidate.id), false);
  assert.equal(f.rows.has(page), false);
  assert.equal(f.rows.has(intent), false, "A stopped partial preparation is not a permanent recovery hold.");
  const read = await createVillageRepository(() => restarted.documents).readAuthority({ memories: true });
  assert.equal(read.continuity.records.length, 1);
  await f.insert(`villages-memory-intent-${randomUUID()}`, "memory-payload-intent", { candidate: false });
  const before = structuredClone(f.rows);
  await assert.rejects(collectRetainedStorage(restarted));
  assert.deepEqual(f.rows, before, "Malformed ownership defers the entire deletion pass.");
});
await runCase("retained-storage/shared-pages", async () => {
  const world = "a".repeat(32),
    pages = new Map<string, any>(),
    manifests: unknown[] = [];
  const state = { ...defaultVillageState(), seed: "shared-pages", setupAt: memoryTime() };
  Object.assign(state, nativeHistoryFixture(state, 1000));
  let layout;
  for (let i = 0; i < 40; i++) {
    const encoded = encodeContinuityPages(memoryPayload(state), world, layout);
    layout = encoded.layout;
    for (const row of encoded.pages) pages.set(...row);
    manifests.push(encoded.manifest);
    retainAuthoredNote(state, `append-${i}`, `New retained account ${i}`, ["player"], memoryTime(50 + i));
  }
  const reads = new Map<string, number>();
  const tracer = createMemoryPageTracer(async (id) => {
    reads.set(id, (reads.get(id) ?? 0) + 1);
    return pages.get(id) ?? null;
  });
  for (const manifest of manifests) await traceContinuityPages(manifest, world, tracer);
  assert.ok(reads.size > 50);
  assert.ok(
    [...reads.values()].every((count) => count === 1),
    "Shared pages are visited once across retained history versions.",
  );
});
await runCase("retained-storage/foreign-owner", async () => {
  const f = await fixture();
  await f.api.createCheckpoint("Another Village", "another-village");
  const head = f.head();
  await f.repo.mutateAuthority(
    (state) => {
      state.seed = "replacement-world";
      state.setupAt = memoryTime(10);
      Object.assign(state, emptyMemoryPayload());
    },
    { memories: true },
  );
  assert.equal((await f.api.index()).checkpointTotal, 0);
  await collectRetainedStorage(f.gate);
  assert.ok(f.rows.has(head.id), "UI scope filtering never releases a retained foreign-world owner.");
});
await runCase("retained-storage/allocation-budget", async () => {
  const f = await fixture(),
    failures: unknown[] = [];
  const cleanup = createRetainedStorageCleanup(f.gate, (error) => failures.push(error));
  const unsubscribe = f.gate.whenIdle(() => {
    void cleanup.request();
  });
  try {
    await cleanup.request();
    const passes = () => f.lists.filter((kind) => kind === "repair-snapshot").length;
    assert.equal(passes(), 1);
    for (let i = 0; i < 100; i++)
      await f.repo.mutateAuthority((state) => {
        state.name = `Ordinary save ${i}`;
      });
    await cleanup.request();
    assert.equal(passes(), 1, "Ordinary gameplay does not mark full retained history on each save.");
    const artifact = await f.gate.work(() =>
      createRepairSnapshots(f.gate.raw).captureOne({
        id: "unused-source",
        kind: "test",
        name: "Unused",
        description: "",
        data: { text: "x".repeat(2 * 1024 * 1024) },
      }),
    );
    await cleanup.request();
    assert.equal(passes(), 2, "Allocated bytes schedule a coalesced follow-up sweep.");
    assert.equal(f.rows.has(artifact.body), false);
    assert.deepEqual(failures, []);
    const state = await f.repo.readAuthority({ memories: true });
    const original = memoryPayload(state);
    retainAuthoredNote(state, "alternate", "The window was open.", ["player"], memoryTime(1));
    const alternate = memoryPayload(state);
    for (let i = 0; i < 3000; i++) {
      await f.gate.work(() =>
        f.repo.mutateAuthority((draft) => Object.assign(draft, i % 2 ? original : alternate), { memories: true }),
      );
      await cleanup.request();
    }
    assert.ok(passes() >= 3, "Cycling existing content-addressable heads must still allocate toward cleanup");
    const intents = [...f.rows.values()].filter((row) => row.kind === "memory-payload-intent");
    assert.ok(
      intents.reduce((sum, row) => sum + Buffer.byteLength(JSON.stringify(row.data)), 0) < 1024 * 1024,
      "Publication-intent overhead is bounded even when no new history body or page is allocated",
    );
    assert.deepEqual(failures, []);
  } finally {
    unsubscribe();
    cleanup.dispose();
  }
});
await runCase("retained-storage/frozen-scene", async () => {
  const f = await fixture();
  let id = "";
  await f.repo.mutateAuthority(
    (state) => {
      state.setting = "The earlier Village description.";
      Object.assign(state, nativeHistoryFixture(state, 200));
      id = retainAuthoredNote(state, "unique", "A single plum lantern was left here.", ["player"], memoryTime(4));
    },
    { memories: true },
  );
  const original = await f.repo.readAuthority({ memories: true });
  const scene = coerceSession({
    version: 5,
    id: "held",
    villageSeed: original.seed,
    placeId: "cafe",
    zoneId: "common",
    status: "active",
    startedAt: memoryTime(4),
  });
  scene.continuity = captureSceneContinuity(original, scene, Date.parse(memoryTime(4)));
  await f.insert("villages-venue-visit-held", "venue-visit", scene);
  assert.equal(continuityMemoryLibrary(original, { query: "plum lantern" }, memoryTime(4)).total, 1);
  await f.repo.mutateAuthority(
    (state) => {
      state.setting = "The current Village description.";
      forget(state, id, "forget-lantern", memoryTime(20));
    },
    { memories: true },
  );
  await collectRetainedStorage(f.gate);
  const cold = await createVillageRepository(() => f.gate.documents).readAuthority({ memories: true });
  const saved = fixtureSceneState(f.rows.get("villages-venue-visit-held").data, f.rows);
  const replay = sceneContinuityView(cold, saved);
  assert.equal(replay.setting, original.setting);
  assert.equal(cold.setting, "The current Village description.");
  assert.equal(continuityMemoryLibrary(replay, { query: "plum lantern" }, memoryTime(20)).total, 0);
  assert.deepEqual(cold.episodes, original.episodes, "Forgetting keeps the source receipt intact after cleanup");
});
await runCase("retained-storage/repeated-head", async () => {
  const f = await fixture();
  const checkpoint = await f.api.createCheckpoint("Corrupt reference", "repeated-head");
  const header = [...f.rows.values()].find((row) => row.kind === "repair-checkpoint" && row.data.id === checkpoint.id)!;
  const root = f.rows.get("villages-village");
  for (const field of ["digest", "revision"]) {
    const source = {
      id: root.id,
      kind: root.kind,
      name: root.name,
      description: root.description,
      data: structuredClone(root.data),
    };
    source.data.memoryHead[field] = field === "digest" ? "0".repeat(64) : source.data.memoryHead.revision + 1;
    const snapshot = await createRepairSnapshots(f.gate.raw).captureOne(source);
    header.data.snapshots = JSON.stringify([snapshot]);
    const before = structuredClone(f.rows);
    await assert.rejects(collectRetainedStorage(f.gate), /owned history reference changed/);
    assert.deepEqual(f.rows, before, "A previously visited head cannot conceal a malformed later owner.");
  }
});
await runCase("retained-storage/checkpoint-integrity", async () => {
  const f = await fixture();
  const checkpoint = await f.api.createCheckpoint("Validate all sources", "source-integrity");
  const header = [...f.rows.values()].find((row) => row.kind === "repair-checkpoint" && row.data.id === checkpoint.id)!;
  const root = f.rows.get("villages-village"),
    original = header.data.snapshots;
  const sources = await createRepairSnapshots(f.gate.raw).restore(original);
  const foreign = { ...sources[0], data: { ...root.data, seed: "foreign-owner", memoryHead: null } };
  const foreignRef = await createRepairSnapshots(f.gate.raw).captureOne(foreign);
  for (const refs of [
    "[]",
    JSON.stringify([foreignRef]),
    JSON.stringify([JSON.parse(original)[0], JSON.parse(original)[0]]),
  ]) {
    header.data.snapshots = refs;
    const before = structuredClone(f.rows);
    await assert.rejects(collectRetainedStorage(f.gate), /checkpoint|ownership/);
    assert.deepEqual(f.rows, before, "Malformed aggregate checkpoint ownership permits no deletions.");
  }
});
await runCase("retained-storage/growth", async () => {
  for (const count of [1000, 10000, 25000]) {
    const f = await fixture();
    await f.repo.mutateAuthority(
      (state) => {
        Object.assign(state, nativeHistoryFixture(state, count));
      },
      { memories: true },
    );
    await f.api.createCheckpoint("Original retained history", "growth-checkpoint");
    const initial = await collectRetainedStorage(f.gate);
    const targets = (await f.repo.readAuthority({ memories: true })).continuity.records
      .slice(0, 20)
      .map((row) => row.id);
    for (let i = 0; i < 20; i++) {
      await f.repo.mutateAuthority(
        (state) => {
          forget(state, targets[i], `forget-${i}`, memoryTime(500 + i));
        },
        { memories: true },
      );
    }
    const preserved = await f.repo.readAuthority({ memories: true });
    const pageLists = f.lists.filter((kind) => kind === "memory-page").length;
    const result = await collectRetainedStorage(f.gate);
    assert.equal(f.lists.filter((kind) => kind === "memory-page").length - pageLists, 1);
    const cold = await createVillageRepository(() => f.gate.documents).readAuthority({ memories: true });
    assert.deepEqual(cold.continuity, preserved.continuity);
    assert.deepEqual(cold.episodes, preserved.episodes);
    assert.equal(cold.continuity.records.length, count);
    assert.ok(result.removedBytes > 0);
    assert.ok(
      result.retainedBytes < initial.retainedBytes * 1.1 + 256 * 1024,
      "Current and checkpoint history share immutable pages across twenty corrections.",
    );
    console.log(
      JSON.stringify({
        workload: "retained-history",
        records: count,
        operations: 20,
        initialBytes: initial.retainedBytes,
        retainedBytes: result.retainedBytes,
        reclaimedBytes: result.removedBytes,
      }),
    );
  }
});
await runCase("retained-storage/payload-identity", async () => {
  const f = await fixture();
  await f.insert("not-a-memory-id", "memory-payload", { format: 3, payload: "{}" });
  const before = structuredClone(f.rows);
  await assert.rejects(collectRetainedStorage(f.gate), /invalid retained history identity/);
  assert.deepEqual(
    f.rows,
    before,
    "Missing namespace and malformed identity cannot jointly validate an unknown candidate.",
  );
});

await runCase("retained-storage/background-sprite-retirement", async () => {
  const f = await fixture(),
    world = await f.repo.readAuthority({ memories: true });
  const assetId = "villages-" + randomUUID();
  const source = await f.gate.work(() =>
    createSpriteFiles(f.gate.documents)(assetId, "original", "data:image/png;base64,UE5H", async () => ({
      filename: "original.png",
      url: `/api/sprites/${assetId}/file/original.png`,
    })),
  );
  const manager = emptySpriteManager();
  manager.artwork.push({
    id: "art",
    name: "Captured",
    assetId,
    origin: "upload",
    source: { ...source, width: 1, height: 1, sha256: memoryDigest("PNG") },
    rendered: source,
    frame: { x: 0, y: 0, width: 1, height: 1, scale: 1, offsetX: 0, offsetY: 0 },
    warnings: [],
  });
  const stamp = memoryTime();
  world.villagers.push({ ...resident("mara"), spriteManager: manager });
  const departure = captureReturnContext(world, new Date(stamp));
  const job = {
    instanceId: randomUUID(),
    id: "closed-sprite-job",
    seed: world.seed,
    kind: "resident-planning",
    subjectId: "mara",
    revision: "closed-input",
    attempt: 1,
    status: "failed",
    requests: 0,
    hasResult: true,
    result: {},
    steps: [],
    input: residentPlanningInput(world, "mara", stamp, "captured-sprite", {
      batchId: "historical-sprite-batch",
      captureRevision: returnCaptureRevision(departure),
      until: stamp,
      world: departure.world,
    }),
  } as Job;
  const native = nativeBackgroundJob(job),
    rootId = backgroundHistoryId(native),
    slot = backgroundSlotId(job);
  const proofId = backgroundCompletionId({ format: 1, seed: job.seed, slotId: slot, jobId: job.id });
  await retainBackgroundJob(f.gate.documents, native);
  await f.repo.mutateAuthority((state) => {
    state.backgroundReceipts[slot] = job.id;
  });
  await f.repo.mutateAuthority((state) => {
    state.backgroundReceipts[slot] = "newer-job";
  });
  const remove = f.store.remove;
  let physicalDeletes = 0;
  f.store.remove = async (pkg: string, id: string, revision: number) => {
    if (id === rootId) throw Error("Root removal failed");
    return remove(pkg, id, revision);
  };
  await assert.rejects(
    collectRetainedStorage(f.gate, async () => {
      physicalDeletes++;
    }),
    /Root removal failed/,
  );
  assert.equal(physicalDeletes, 0, "no physical dependency deletion before historical root acknowledgement");
  assert.ok(f.rows.has(rootId));
  assert.ok(f.rows.has(proofId));
  f.store.remove = remove;
  await assert.rejects(
    collectRetainedStorage(f.gate, async () => {
      assert.equal(f.rows.has(rootId), false, "the historical root is gone before any sprite deletion");
      physicalDeletes++;
      throw Error("Physical delete acknowledgement lost");
    }),
    /Physical delete acknowledgement lost/,
  );
  assert.ok(f.rows.has(proofId), "the proof survives failed dependency cleanup");
  await collectRetainedStorage(f.gate, async () => {
    assert.equal(f.rows.has(rootId), false);
    physicalDeletes++;
  });
  assert.equal(physicalDeletes, 2);
  assert.equal(f.rows.has(spriteFileId(assetId, "original")), false);
  assert.equal(f.rows.has(proofId), false, "the final proof retires after root and dependencies");
  f.gate.dispose();
});
