import assert from "node:assert/strict";
import { mock } from "node:test";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { fixtureWish, wishTime, wishWorld } from "./helpers/social-wishes-fixture.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";
import { createSceneArchive } from "../packages/villages/src/server/features/scenes/archive-service.js";
import { sessionSlot } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import {
  createSceneHistory,
  sceneWishOwners,
  validateSceneHistory,
  readSceneIndex,
} from "../packages/villages/src/server/adapters/storage/scene-history.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { validateWorldWishHistory } from "../packages/villages/src/server/adapters/storage/world-wishes.js";
import { captureReturnContext } from "../packages/villages/src/server/domain/rules/return-catchup-capture.js";
import { copySocialWishes, mutableSocialWish } from "../packages/villages/src/server/domain/rules/social-wishes.js";
import {
  createWishHistoryStore,
  createWishHistoryTracer,
  decodeWishHistorySync,
  encodeWishHistory,
  readWishHistoryHead,
  wishHistoryWorld,
  wishArchiveWorld,
  wishArchiveKey,
} from "../packages/villages/src/server/adapters/storage/wish-history.js";
import {
  createHistoryPageWriter,
  type MemoryPageData,
} from "../packages/villages/src/server/adapters/storage/memory-pages.js";

const scope = { seed: "wish-storage", setupAt: wishTime(), actorId: "a" };
const event = (index: number) => ({
  id: "event:" + index,
  at: wishTime(index),
  kind: "progress",
  text: "Exact private café 東京 event " + index,
  sourceId: "source:" + index,
  lineIds: ["line:" + index],
});
for (const workload of ["many-wishes", "one-long-history"] as const) {
  const f = sceneHistoryFixture(),
    store = createWishHistoryStore(f.documents);
  try {
    const input =
      workload === "many-wishes"
        ? Array.from({ length: 25_000 }, (_, index) =>
            fixtureWish({ wish: "Retained private desire " + index }, "wish:" + index),
          )
        : [
            {
              ...fixtureWish({ wish: "Retained shared experience" }, "long-history"),
              history: Array.from({ length: 25_000 }, (_, index) => event(index)),
            },
          ];
    let current = await store.prepare(input, scope, null);
    const initial = current.head!,
      initialPages = f.rows.size;
    assert.notEqual(store.fingerprint([], scope), store.fingerprint([], { ...scope, actorId: "other" }));
    assert.notEqual(store.fingerprint([], scope), store.fingerprint([], { ...scope, setupAt: wishTime(1) }));
    assert.ok(JSON.stringify(initial).length < 512, "The owner stores a compact head");
    assert.equal(JSON.stringify(initial).includes("Retained private"), false);
    const heads = [initial],
      stringify = JSON.stringify;
    let serialized = 0,
      maxRead = 0,
      maxWritten = 0,
      maxSerialized = 0;
    const originalRows = current.rows;
    const spy = mock.method(JSON, "stringify", (...args: unknown[]) => {
      const value = Reflect.apply(stringify, JSON, args);
      if (typeof value === "string") serialized += Buffer.byteLength(value);
      return value;
    });
    try {
      for (let index = 0; index < 20; index++) {
        const priorFingerprint = store.fingerprint(current.rows, scope);
        const next = copySocialWishes(current.rows);
        next[0] = mutableSocialWish(next[0]);
        next[0].revision++;
        next[0].history.push(event(25_000 + index));
        f.reset();
        serialized = 0;
        const fingerprint = store.fingerprint(next, scope);
        assert.notEqual(fingerprint, priorFingerprint, "an unpublished exact change alters its comparison identity");
        assert.deepEqual(f.metrics(), { readBytes: 0, writtenBytes: 0 }, "comparison grants no publication ownership");
        current = await store.prepare(next, scope, current.head);
        assert.equal(store.fingerprint(current.rows, scope), fingerprint, "publication preserves the exact comparison");
        heads.push(current.head!);
        const io = f.metrics();
        maxRead = Math.max(maxRead, io.readBytes);
        maxWritten = Math.max(maxWritten, io.writtenBytes);
        maxSerialized = Math.max(maxSerialized, serialized);
        assert.ok(
          io.readBytes < 512_000 && io.writtenBytes < 512_000,
          "A single change does not read or rewrite the library",
        );
        assert.ok(serialized < 1_000_000, "A single append does not serialize the complete retained history");
      }
    } finally {
      spy.mock.restore();
    }
    assert.equal(originalRows[0].history.length, workload === "one-long-history" ? 25_000 : 0);
    const cold = await createWishHistoryStore(f.documents).read(current.head, scope);
    assert.equal(cold.length, input.length);
    assert.equal(cold[0].history.length, (workload === "one-long-history" ? 25_000 : 0) + 20);
    assert.equal(cold[0].history.at(-1)!.text, event(25_019).text);
    const old = decodeWishHistorySync(initial, scope, (id) => f.rows.get(id)?.data ?? null);
    assert.deepEqual(old.rows, originalRows, "An earlier retained owner still reconstructs its original values");
    const reads = new Map<string, number>();
    const tracer = createWishHistoryTracer(async (id) => {
      reads.set(id, (reads.get(id) ?? 0) + 1);
      return f.rows.get(id)?.data ?? null;
    });
    for (const head of heads) await tracer.trace(head, scope);
    assert.ok(
      [...reads.values()].every((count) => count === 1),
      "Shared pages are traced once across many retained heads",
    );
    assert.ok(f.rows.size - initialPages < 400, "Twenty history versions add a bounded number of changed pages");
    console.log(
      JSON.stringify({ workload, count: 25_000, retainedPages: f.rows.size, maxRead, maxWritten, maxSerialized }),
    );
  } finally {
    f.release();
  }
}

for (const workload of ["many-wishes", "one-long-history"] as const) {
  const f = sceneHistoryFixture(),
    repository = createVillageRepository(() => f.gate.documents);
  try {
    const world = wishWorld();
    world.villagers[0].wishes =
      workload === "many-wishes"
        ? Array.from({ length: 25_000 }, (_, index) =>
            fixtureWish({ wish: "Retained exact desire " + index }, "wish:" + index),
          )
        : [
            {
              ...fixtureWish({ wish: "One long private history" }),
              history: Array.from({ length: 25_000 }, (_, index) => event(index)),
            },
          ];
    await repository.mutateAuthority((state) => {
      Object.assign(state, world);
    });
    const root = f.rows.get("villages-village").data;
    assert.equal(Object.hasOwn(root.villagers[0], "wishes"), false);
    f.reset();
    const metadata = await repository.readAuthority();
    assert.throws(() => metadata.villagers[0].wishes, /not loaded/);
    await repository.mutateAuthority((state) => {
      state.name = "An ordinary metadata edit";
    });
    assert.ok(
      f.metrics().readBytes < 64_000 && f.metrics().writtenBytes < 64_000,
      "Metadata operations never load private Wish bodies",
    );
    const frozenWorld = await repository.readAuthority({ memories: true, wishes: true });
    const scene = coerceSession({
      version: 3,
      id: "wish-frozen",
      villageSeed: world.seed,
      startedAt: wishTime(),
      status: "active",
      lines: [],
      submissions: [],
    });
    scene.continuity = captureSceneContinuity(frozenWorld, scene, Date.parse(wishTime()));
    const beforeCapturePages = [...f.rows.values()].filter((row) => row.kind === "memory-page").length;
    await f.mutateDocument("villages-venue-visit-wish-frozen", sessionSlot(f.gate.documents), (value) =>
      Object.assign(value, scene),
    );
    const nativeScene = structuredClone(f.rows.get("villages-venue-visit-wish-frozen").data);
    assert.deepEqual(nativeScene.continuity.facts.villagers[0].wishHead, root.villagers[0].wishHead);
    assert.equal(Object.hasOwn(nativeScene.continuity.facts.villagers[0], "wishes"), false);
    assert.equal(
      [...f.rows.values()].filter((row) => row.kind === "memory-page").length,
      beforeCapturePages,
      "A Scene capture shares the already published library.",
    );
    assert.throws(() => readSceneIndex(nativeScene).continuity, /not loaded/);
    await f.documents.create({
      id: "villages-active-venue",
      packageId: "villages",
      kind: "venue-active",
      name: "Active Scene",
      description: "",
      data: { sessionId: scene.id },
      createdAt: wishTime(),
      updatedAt: wishTime(),
    });
    const assertSceneOperationCosts = async (expectedWorld: typeof frozenWorld) => {
      await f.repository.readSession(scene.id);
      const stringify = JSON.stringify;
      let sceneSerialized = 0;
      let serializedHistory = false;
      const historySentinel = workload === "many-wishes" ? "Retained exact desire 24999" : event(24_999).text;
      const spy = mock.method(JSON, "stringify", (...args: unknown[]) => {
        const text = Reflect.apply(stringify, JSON, args);
        if (typeof text === "string") {
          sceneSerialized += Buffer.byteLength(text);
          serializedHistory ||= text.includes(historySentinel);
        }
        return text;
      });
      f.reset();
      try {
        for (let index = 0; index < 12; index++) {
          await repository.readAuthority();
          await f.repository.changeSession(scene.id, (value) => {
            value.recap = "Ordinary Scene change " + index;
          });
          const current = await f.repository.readSession(scene.id);
          const view = sceneContinuityView(expectedWorld, current, false);
          assert.equal(view.villagers[0].wishes.length, expectedWorld.villagers[0].wishes.length);
          assert.equal(view.villagers[0].wishes[0].history.length, expectedWorld.villagers[0].wishes[0].history.length);
          if (current.operation?.snapshot) {
            const admitted = await createSceneHistory(f.gate.documents).decode(current.operation.snapshot);
            assert.equal(
              admitted.continuity!.facts.villagers[0].wishes[0].history.length,
              frozenWorld.villagers[0].wishes[0].history.length,
            );
          }
          assert.throws(() => {
            current.continuity!.facts.villagers[0].wishes[0].wish = "Caller mutation";
          }, TypeError);
        }
      } finally {
        spy.mock.restore();
      }
      assert.ok(
        f.metrics().readBytes < 2_000_000 && f.metrics().writtenBytes < 1_000_000,
        "Scene metadata changes keep Wish body I/O bounded: " + JSON.stringify(f.metrics()),
      );
      assert.ok(
        sceneSerialized < 4_000_000,
        "Scene mutation detection and presentation share immutable Wish bodies: " + sceneSerialized,
      );
      assert.equal(serializedHistory, false, "Ordinary Scene operations never serialize retained private history.");
    };
    for (let index = 0; index < 12; index++) {
      f.reset();
      await repository.mutateAuthority(
        (state) => {
          const owner = state.villagers[0];
          owner.wishes[0] = mutableSocialWish(owner.wishes[0]);
          owner.wishes[0].history.push(event(25_000 + index));
          owner.wishes[0].revision++;
        },
        { wishes: ["a"] },
      );
      const metrics = f.metrics();
      assert.ok(
        metrics.readBytes < 512_000 && metrics.writtenBytes < 512_000,
        "Separate production authority operations retain the live working layout",
      );
    }
    await assertSceneOperationCosts(frozenWorld);
    const sceneWorld = await repository.readAuthority({ memories: true, wishes: true });
    await f.repository.changeSession(scene.id, (value) => {
      value.continuity = captureSceneContinuity(sceneWorld, value, Date.parse(wishTime()));
      value.operation = {
        id: "wish-held",
        kind: "chat",
        input: {},
        token: "held",
        attemptId: "held-attempt",
        status: "interrupted",
        stage: "saved",
        startedAt: wishTime(),
        sceneRevision: value.sceneRevision,
        snapshot: nativeScene,
        checkpoints: {},
        attempts: {},
        error: "Held",
      };
    });
    await repository.mutateAuthority(
      (state) => {
        const row = state.villagers[0];
        row.wishes[0] = mutableSocialWish(row.wishes[0]);
        row.wishes[0].revision++;
      },
      { wishes: ["a"] },
    );
    const distinctOwners = sceneWishOwners(f.rows.get("villages-venue-visit-wish-frozen").data).filter(
      (owner) => owner.head,
    );
    assert.equal(distinctOwners.length, 2);
    assert.notDeepEqual(
      distinctOwners[0].head,
      distinctOwners[1].head,
      "Current Scene and admitted request own distinct retained versions.",
    );
    await assertSceneOperationCosts(sceneWorld);
    const frozenHead = nativeScene.continuity.facts.villagers[0].wishHead;
    const restartedScene = await createSceneHistory(f.gate.documents).decode(nativeScene);
    assert.deepEqual(
      restartedScene.continuity!.facts.villagers[0].wishes,
      frozenWorld.villagers[0].wishes,
      "World changes cannot rewrite frozen Wishes.",
    );
    await f.repository.changeSession(scene.id, (value) => {
      value.continuity = undefined;
      value.operation = {
        id: "wish-held",
        kind: "chat",
        input: {},
        token: "held",
        attemptId: "held-attempt",
        status: "interrupted",
        stage: "saved",
        startedAt: wishTime(),
        sceneRevision: value.sceneRevision,
        snapshot: nativeScene,
        checkpoints: {},
        attempts: {},
        error: "Held",
      };
    });
    const held = f.rows.get("villages-venue-visit-wish-frozen").data;
    assert.equal(
      sceneWishOwners(held).filter((owner) => owner.head).length,
      1,
      "An admitted snapshot independently owns its frozen library.",
    );
    await collectRetainedStorage(f.gate);
    assert.ok(f.rows.has(frozenHead.root.id));
    const missing = f.rows.get(frozenHead.root.id);
    f.rows.delete(frozenHead.root.id);
    const beforeFailure = structuredClone(f.rows);
    const repair = createRepairService({
      gate: f.gate,
      repository,
      resumeProject: async () => {},
      cancelProject: async () => {},
      replaySaved: async () => {},
      continueSaved: async () => {},
    });
    await assert.rejects(validateSceneHistory(f.gate.documents, [held]), /missing/);
    await assert.rejects(collectRetainedStorage(f.gate), /missing/);
    await assert.rejects(repair.createCheckpoint("Missing frozen Wishes", "missing-frozen-wishes"), /missing/);
    assert.deepEqual(f.rows, beforeFailure, "Missing admitted Wish ownership holds every cleanup deletion.");
    f.rows.set(frozenHead.root.id, missing);
    const foreign = structuredClone(nativeScene);
    foreign.continuity.facts.villagers[0].characterId = "foreign";
    assert.throws(() => sceneWishOwners(foreign), /another owner/);
    const padded = structuredClone(nativeScene);
    padded.continuity.facts.villagers[0].characterId = " a ";
    padded.continuity.facts.villagers[0].wishHead = encodeWishHistory([fixtureWish({ wish: "Padded actor" })], {
      ...scope,
      seed: world.seed,
      setupAt: world.setupAt,
      actorId: " a ",
    }).head;
    assert.throws(() => sceneWishOwners(padded), /native Wish owner/);
    await assert.rejects(createSceneHistory(f.gate.documents).decode(padded), /native Wish owner/);
    await assert.rejects(validateSceneHistory(f.gate.documents, [padded]), /native Wish owner/);
    await f.repository.changeSession(scene.id, (value) => {
      value.operation = undefined;
      value.status = "closed";
      value.continuity = restartedScene.continuity;
    });
    const activePointer = f.rows.get("villages-active-venue");
    await f.gate.documents.remove("villages", activePointer.id, activePointer.revision);
    await f.repository.readActive();
    const archive = createSceneArchive({
      villagesDocuments: () => f.gate.documents,
      readActive: f.repository.readActive,
    });
    f.reset();
    const archived = await archive.readVenueVisit(scene.id);
    assert.equal(archived.status, "closed");
    assert.equal(archived.continuity, undefined, "Closed transcript results omit private frozen history.");
    assert.ok(f.metrics().readBytes < 64_000, "A closed transcript does not hydrate private frozen Wish bodies.");
    const checkpoint = await repair.createCheckpoint("Frozen exact Wishes", "frozen-wish-checkpoint");
    const sceneRecord = f.rows.get("villages-venue-visit-wish-frozen");
    await f.gate.documents.remove("villages", sceneRecord.id, sceneRecord.revision);
    await collectRetainedStorage(f.gate);
    assert.ok(f.rows.has(frozenHead.root.id), "A checkpoint independently owns the deleted Scene's Wishes.");
    const review = await repair.restore(checkpoint.id, "restore-frozen-wishes");
    await repair.apply(review.id, review.token);
    const restoredScene = await f.repository.readSession(scene.id);
    assert.deepEqual(restoredScene.continuity!.facts.villagers[0].wishes, frozenWorld.villagers[0].wishes);
    let capturedValues = "";
    await repository.mutateAuthority(
      (state) => {
        state.returnCatchup = { capture: captureReturnContext(state, new Date(wishTime())) };
        capturedValues = JSON.stringify(state.returnCatchup.capture!.world.villagers);
      },
      { memories: true, wishes: true },
    );
    const captured = f.rows.get("villages-village").data.returnCatchup.capture.world;
    assert.equal(
      JSON.stringify((await repository.readAuthority({ wishes: true })).returnCatchup!.capture!.world.villagers),
      capturedValues,
      "Persistence preserves the exact frozen authority serialization",
    );
    assert.equal(Object.hasOwn(captured.villagers[0], "wishes"), false);
    assert.deepEqual(captured.villagers[0].wishHead, f.rows.get("villages-village").data.villagers[0].wishHead);
    await repository.mutateAuthority((state) => {
      state.villagers = state.villagers.filter((row) => row.characterId !== "a");
    });
    assert.equal(f.rows.get("villages-village").data.wishArchiveHead.count, 1);
    await collectRetainedStorage(f.gate);
    const restarted = createVillageRepository(() => f.gate.documents);
    const restored = await restarted.readAuthority({ wishes: true });
    assert.equal(
      restored.returnCatchup!.capture!.world.villagers[0].wishes[0].history.at(-1)!.text,
      event(25_011).text,
    );
    await restarted.mutateAuthority((state) => {
      state.villagers.push(wishWorld().villagers[0]);
    });
    assert.equal(
      (await restarted.readAuthority({ wishes: ["a"] })).villagers.find((row) => row.characterId === "a")!.wishes
        .length,
      0,
      "Re-admission starts independently while earlier private history remains owned",
    );
    await validateWorldWishHistory(f.documents, [f.rows.get("villages-village").data]);
    const native = f.rows.get("villages-village");
    native.data.version = 10;
    await assert.rejects(restarted.readAuthority(), /Unsupported Village format/);
  } finally {
    f.release();
  }
}

for (const fault of ["before", "after"] as const) {
  const f = sceneHistoryFixture();
  try {
    const create = f.documents.create;
    let fail = true;
    f.documents.create = async (input: any) => {
      if (!fail) return create(input);
      fail = false;
      if (fault === "after") await create(input);
      throw new Error("Lost immutable page acknowledgement");
    };
    const store = createWishHistoryStore(f.documents),
      input = [fixtureWish({ wish: "Exact saved desire" })];
    if (fault === "before") await assert.rejects(store.prepare(input, scope, null), /acknowledgement/);
    const saved = await store.prepare(input, scope, null);
    assert.deepEqual(await createWishHistoryStore(f.documents).read(saved.head, scope), input);
    const rows = copySocialWishes(saved.rows);
    f.rows.clear();
    await assert.rejects(store.read(saved.head, scope), /missing or changed/);
    const rematerialized = await store.prepare(rows, scope, null);
    assert.deepEqual(
      await createWishHistoryStore(f.documents).read(rematerialized.head, scope),
      input,
      "An unowned cache cannot stand in for physical dependencies",
    );
  } finally {
    f.release();
  }
}

{
  const f = sceneHistoryFixture();
  try {
    const wish = fixtureWish({ wish: "Meet at the café" });
    wish.conditions = [
      { id: "condition", quote: "Only if you want to", at: wishTime(), sourceId: "source", lineIds: ["line"] },
    ];
    const encoded = encodeWishHistory([wish], scope);
    async function publish(pages: Map<string, MemoryPageData>) {
      for (const [id, data] of pages)
        await f.documents.create({
          id,
          packageId: "villages",
          kind: "memory-page",
          name: "Fixture",
          description: "",
          data,
        });
    }
    await publish(encoded.pages);
    f.reset();
    await assert.rejects(
      createWishHistoryStore(f.documents).read(encoded.head, { ...scope, actorId: "foreign" }),
      /another owner/,
    );
    assert.equal(f.metrics().readBytes, 0, "A foreign owner is rejected before storage reads");
    for (const head of [undefined, false, { ...encoded.head, count: 0 }, { ...encoded.head, format: 0 }])
      assert.throws(() => readWishHistoryHead(head, scope));
    const saved = encoded.values.get(wish.id)!.header;
    const assertUnreadable = async (head: unknown) => {
      await assert.rejects(createWishHistoryStore(f.documents).read(head, scope));
      await assert.rejects(createWishHistoryTracer(async (id) => f.rows.get(id)?.data ?? null).trace(head, scope));
    };
    const duplicate = createHistoryPageWriter(wishHistoryWorld(scope));
    const duplicateRoot = duplicate.tree([
      [wish.id, saved],
      [wish.id, saved],
    ]).root!;
    await publish(duplicate.pages);
    await assertUnreadable({ ...encoded.head, count: 2, root: duplicateRoot });
    const noncanonical = createHistoryPageWriter(wishHistoryWorld(scope));
    const paddedRoot = noncanonical.tree([
      [wish.id, { ...saved, fields: { ...saved.fields, wish: " " + saved.fields.wish } }],
    ]).root!;
    await publish(noncanonical.pages);
    await assertUnreadable({ ...encoded.head, root: paddedRoot });
    for (const invalid of ["duplicate", "padded"] as const) {
      const condition = wish.conditions[0];
      const events = createHistoryPageWriter(f.rows.get(saved.conditions.root!.id).data.world);
      const rows: [string, unknown][] =
        invalid === "duplicate"
          ? [
              [condition.id, condition],
              [condition.id, condition],
            ]
          : [[condition.id, { ...condition, quote: " " + condition.quote }]];
      const eventRoot = events.tree(rows).root!;
      await publish(events.pages);
      const owner = createHistoryPageWriter(wishHistoryWorld(scope));
      const ownerRoot = owner.tree([
        [wish.id, { ...saved, conditions: { count: rows.length, root: eventRoot } }],
      ]).root!;
      await publish(owner.pages);
      await assertUnreadable({ ...encoded.head, root: ownerRoot });
    }
    const detached = structuredClone(encoded.head!);
    const reader = createWishHistoryStore(f.documents);
    const detachedRows = await reader.read(detached, scope);
    detached.root.height++;
    assert.equal(
      (await reader.prepare(copySocialWishes(detachedRows), scope, encoded.head)).head!.root.height,
      encoded.head!.root.height,
      "A caller's mutable descriptor cannot alter a cached layout",
    );
    const archived = { actorId: scope.actorId, name: "Ada", head: encoded.head! };
    const archive = createHistoryPageWriter(wishArchiveWorld(scope));
    const archiveRoot = archive.tree([
      [wishArchiveKey(archived), archived],
      [wishArchiveKey(archived), archived],
    ]).root!;
    await publish(archive.pages);
    await assert.rejects(
      createWishHistoryTracer(async (id) => f.rows.get(id)?.data ?? null).traceArchive(
        { count: 2, root: archiveRoot },
        scope,
      ),
      /duplicate/,
    );
    const writer = createHistoryPageWriter(wishHistoryWorld(scope));
    const root = writer.tree([[wish.id, { ...saved, history: saved.conditions }]]).root!;
    await publish(writer.pages);
    const swapped = { ...encoded.head!, root };
    await assert.rejects(createWishHistoryStore(f.documents).read(swapped, scope));
    await assert.rejects(createWishHistoryTracer(async (id) => f.rows.get(id)?.data ?? null).trace(swapped, scope));
    assert.throws(() => encodeWishHistory([wish, wish], scope), /duplicate Wish identity/);
    f.rows.get(encoded.head!.root.id).data.node.content = { id: "foreign", digest: "f".repeat(64), height: 0 };
    await assert.rejects(createWishHistoryStore(f.documents).read(encoded.head, scope));
  } finally {
    f.release();
  }
}
console.log(
  "Wish canonical pages: exact history, retained versions, bounded publication, restart, acknowledgement recovery and owner binding passed.",
);

for (const fault of ["before", "after"] as const) {
  const f = sceneHistoryFixture(),
    repository = createVillageRepository(() => f.gate.documents);
  try {
    const world = wishWorld();
    world.villagers[0].wishes = [fixtureWish({ wish: "Exact publication boundary" })];
    await repository.mutateAuthority((state) => {
      Object.assign(state, world);
    });
    const update = f.documents.update;
    f.documents.update = async (input: any) => {
      if (input.id !== "villages-village") return update(input);
      if (fault === "after") await update(input);
      throw new Error("Lost Village acknowledgement");
    };
    await assert.rejects(
      repository.mutateAuthority(
        (state) => {
          state.villagers[0].wishes[0] = mutableSocialWish(state.villagers[0].wishes[0]);
          state.villagers[0].wishes[0].history.push(event(0));
        },
        { wishes: ["a"] },
      ),
      /acknowledgement/,
    );
    f.documents.update = update;
    await collectRetainedStorage(f.gate);
    const restarted = await createVillageRepository(() => f.gate.documents).readAuthority({ wishes: ["a"] });
    assert.equal(
      restarted.villagers[0].wishes[0].history.length,
      fault === "after" ? 1 : 0,
      "Restart recovers exactly the acknowledged or uncertain committed owner",
    );
  } finally {
    f.release();
  }
}
