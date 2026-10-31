import assert from "node:assert/strict";
import { mock } from "node:test";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { fixtureWish, wishTime, wishWorld } from "./helpers/social-wishes-fixture.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { validateWorldWishHistory } from "../packages/villages/src/server/adapters/storage/world-wishes.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  captureSceneContinuity,
  captureSceneWishEffect,
  sceneContinuityView,
  sceneWishEffectIds,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { mutableSocialWish } from "../packages/villages/src/server/domain/rules/social-wishes.js";
import { cloneVillageContext } from "../packages/villages/src/server/domain/rules/world-context-copy.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";

const event = (index: number) => ({
  id: "event:" + index,
  at: wishTime(),
  kind: "progress",
  text: "Exact café 東京 after-image event " + index,
  sourceId: "source:" + index,
  lineIds: ["line:" + index],
});
for (const workload of ["many-wishes", "one-long-history"] as const) {
  const f = sceneHistoryFixture(),
    repository = createVillageRepository(() => f.gate.documents);
  try {
    const world = wishWorld();
    world.villagers[0].wishes =
      workload === "many-wishes"
        ? Array.from({ length: 25_000 }, (_, index) =>
            fixtureWish({ wish: "Exact retained private desire " + index }, "wish:" + index),
          )
        : [
            {
              ...fixtureWish({ wish: "An exact shared experience" }),
              history: Array.from({ length: 25_000 }, (_, index) => event(index)),
            },
          ];
    const wishId = world.villagers[0].wishes[0].id;
    await repository.mutateAuthority((state) => {
      Object.assign(state, world);
    });
    const baseline = await repository.readAuthority({ memories: true, wishes: true }),
      scene = coerceSession({
        version: 3,
        id: "effect-context",
        villageSeed: world.seed,
        startedAt: wishTime(),
        status: "closed",
        lines: [],
        submissions: [],
      });
    scene.continuity = captureSceneContinuity(baseline, scene, Date.parse(wishTime()));
    const initialPages = f.rows.size,
      stringify = JSON.stringify;
    let serialized = 0,
      serializedHistory = false,
      maxSerialized = 0,
      maxRead = 0,
      maxWritten = 0;
    const sentinel = workload === "many-wishes" ? "Exact retained private desire 24999" : event(10_000).text;
    const spy = mock.method(JSON, "stringify", (...args: unknown[]) => {
      const text = Reflect.apply(stringify, JSON, args);
      if (typeof text === "string") {
        serialized += Buffer.byteLength(text);
        serializedHistory ||= text.includes(sentinel);
      }
      return text;
    });
    try {
      for (let index = 0; index < 20; index++) {
        f.reset();
        serialized = 0;
        serializedHistory = false;
        await repository.mutateAuthority(
          (state) => {
            const owner = state.villagers[0],
              wish = mutableSocialWish(owner.wishes[0]);
            owner.wishes[0] = wish;
            wish.revision++;
            wish.history.push(event(25_000 + index));
            const id = "effect:" + index;
            state.exchangeReceipts[id] = {
              id,
              sceneId: scene.id,
              submissionId: "turn:" + index,
              domain: "wishes",
              status: "applied",
              actorId: "a",
              wishId,
              at: wishTime(),
              committedAt: wishTime(),
              evidenceIds: ["line:" + index],
              reason: "Exact witnessed progress",
              sceneFacts: captureSceneWishEffect(state, "a", wishId),
            };
          },
          { wishes: ["a"] },
        );
        const io = f.metrics();
        maxRead = Math.max(maxRead, io.readBytes);
        maxWritten = Math.max(maxWritten, io.writtenBytes);
        maxSerialized = Math.max(maxSerialized, serialized);
        assert.ok(
          io.readBytes < 512_000 && io.writtenBytes < 512_000,
          "A new effect shares canonical history instead of copying its after-image",
        );
        assert.ok(
          serialized < 2_000_000 && !serializedHistory,
          "Publication never serializes retained Wish/event bodies",
        );
      }
    } finally {
      spy.mock.restore();
    }
    assert.ok(f.rows.size - initialPages < 500, "Twenty after-images retain only changed pages");
    const root = f.rows.get("villages-village").data;
    assert.equal(root.version, 12);
    assert.equal(root.exchangeReceipts["effect:19"].sceneFacts.wish.head.count, 1);
    assert.equal(Object.hasOwn(root.exchangeReceipts["effect:19"].sceneFacts.wish, "value"), false);
    scene.submissions = Array.from({ length: 20 }, (_, index) => ({
      id: "turn:" + index,
      at: wishTime(),
      mode: "chat",
      message: "",
    })) as any;
    // Late publication order cannot replace the last transcript effect with an earlier turn.
    const first = root.exchangeReceipts["effect:0"];
    delete root.exchangeReceipts["effect:0"];
    root.exchangeReceipts["effect:0"] = first;
    f.reset();
    const metadata = await repository.readAuthority();
    assert.deepEqual(sceneWishEffectIds(metadata, scene), ["effect:19"]);
    assert.throws(() => sceneContinuityView(metadata, scene, false).villagers[0].wishes, /not loaded/);
    await repository.mutateAuthority((state) => {
      state.name = "Ordinary metadata edit";
    });
    assert.ok(
      f.metrics().readBytes < 100_000 && f.metrics().writtenBytes < 100_000,
      "Ordinary metadata work never reads after-images",
    );
    const selected = await repository.readAuthority({ wishEffects: (state) => sceneWishEffectIds(state, scene) });
    const latest = selected.exchangeReceipts["effect:19"].sceneFacts!.wish!.value!;
    assert.equal(latest.history.at(-1)!.text, event(25_019).text);
    assert.equal(selected.exchangeReceipts["effect:0"].sceneFacts!.wish!.value, undefined);
    const copied = cloneVillageContext(selected);
    assert.strictEqual(copied.exchangeReceipts["effect:19"].sceneFacts!.wish!.value, latest);
    assert.throws(() => {
      latest.history[0].text = "Cannot mutate saved evidence";
    }, TypeError);
    const view = sceneContinuityView(selected, scene, false);
    assert.strictEqual(
      view.villagers[0].wishes.find((wish) => wish.id === wishId),
      latest,
    );
    const coldDocuments = { ...f.gate.documents },
      restarted = createVillageRepository(() => coldDocuments);
    const cold = await restarted.readAuthority({ wishEffects: ["effect:19"] });
    assert.deepEqual(cold.exchangeReceipts["effect:19"].sceneFacts!.wish!.value, latest);
    await validateWorldWishHistory(f.gate.documents, [root]);
    const repair = createRepairService({
      gate: f.gate,
      repository,
      resumeProject: async () => {},
      cancelProject: async () => {},
      replaySaved: async () => {},
      continueSaved: async () => {},
    });
    const checkpoint = await repair.createCheckpoint("Exact Wish after-images", "wish-effect-checkpoint");
    await repository.mutateAuthority((state) => {
      state.exchangeReceipts = {};
    });
    await collectRetainedStorage(f.gate);
    assert.ok(
      f.rows.has(root.exchangeReceipts["effect:19"].sceneFacts.wish.head.root.id),
      "A checkpoint independently owns its after-images",
    );
    const review = await repair.restore(checkpoint.id, "restore-wish-effects");
    await repair.apply(review.id, review.token);
    assert.deepEqual(
      (await restarted.readAuthority({ wishEffects: ["effect:19"] })).exchangeReceipts["effect:19"].sceneFacts!.wish!
        .value,
      latest,
    );
    const current = f.rows.get("villages-village").data,
      head = current.exchangeReceipts["effect:19"].sceneFacts.wish.head,
      missing = f.rows.get(head.root.id);
    f.rows.delete(head.root.id);
    const before = structuredClone(f.rows);
    await assert.rejects(restarted.readAuthority({ wishEffects: ["effect:19"] }), /missing/);
    await assert.rejects(collectRetainedStorage(f.gate), /missing/);
    await assert.rejects(repair.createCheckpoint("Missing after-image", "missing-after-image"), /missing/);
    assert.deepEqual(f.rows, before, "Missing after-image ownership holds all deletion/publication");
    f.rows.set(head.root.id, missing);
    const wrong = structuredClone(current);
    wrong.exchangeReceipts["effect:19"].sceneFacts.wish.wishId = "other-wish";
    await assert.rejects(validateWorldWishHistory(f.gate.documents, [wrong]), /identity changed/);
    console.log(JSON.stringify({ workload, effects: 20, maxRead, maxWritten, maxSerialized }));
  } finally {
    f.release();
  }
}
for (const fault of ["before", "after"] as const) {
  const f = sceneHistoryFixture(),
    repository = createVillageRepository(() => f.gate.documents);
  try {
    const world = wishWorld();
    world.villagers[0].wishes = [fixtureWish({ wish: "Original exact desire" })];
    await repository.mutateAuthority((state) => {
      Object.assign(state, world);
    });
    const update = f.documents.update;
    let armed = true;
    f.documents.update = async (input: any) => {
      if (!armed || input.id !== "villages-village") return update(input);
      armed = false;
      if (fault === "after") await update(input);
      throw new Error("Synthetic " + fault + " owner publication failure");
    };
    await assert.rejects(
      repository.mutateAuthority(
        (state) => {
          const wish = mutableSocialWish(state.villagers[0].wishes[0]);
          state.villagers[0].wishes[0] = wish;
          wish.history.push(event(1));
          wish.revision++;
          state.exchangeReceipts.receipt = {
            id: "receipt",
            sceneId: "fault-scene",
            submissionId: "turn",
            domain: "wishes",
            status: "applied",
            at: wishTime(),
            reason: "Exact after-image",
            evidenceIds: [],
            sceneFacts: captureSceneWishEffect(state, "a", wish.id),
          };
        },
        { wishes: ["a"] },
      ),
      /Synthetic/,
    );
    await collectRetainedStorage(f.gate);
    const restarted = createVillageRepository(() => ({ ...f.gate.documents }));
    const state = await restarted.readAuthority({ wishes: true, wishEffects: true });
    assert.equal(!!state.exchangeReceipts.receipt, fault === "after");
    assert.equal(state.villagers[0].wishes[0].history.length, fault === "after" ? 1 : 0);
    if (fault === "after")
      assert.equal(state.exchangeReceipts.receipt.sceneFacts!.wish!.value!.history[0].text, event(1).text);
  } finally {
    f.release();
  }
}
console.log(
  "Wish after-images: canonical sharing, selective reads, transcript order, exact immutable replay, checkpoint ownership and fail-closed cleanup passed.",
);
