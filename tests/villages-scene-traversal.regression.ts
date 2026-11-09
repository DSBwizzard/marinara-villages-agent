import assert from "node:assert/strict";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { fixtureWish, wishWorld } from "./helpers/social-wishes-fixture.js";
import {
  immutableSocialWishes,
  wishHistoryLoaded,
} from "../packages/villages/src/server/domain/rules/social-wishes.js";
import type { VillageWish } from "../packages/villages/src/server/domain/models/world.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";

const at = "2026-10-31T00:00:00.000Z";
function wishReceipt(sceneId: string, id: string, actorId: string, wishId: string, value?: VillageWish | null) {
  return {
    id,
    sceneId,
    submissionId: id,
    domain: "wishes" as const,
    status: "applied" as const,
    actorId,
    wishId,
    at,
    committedAt: at,
    evidenceIds: [id],
    reason: "Exact witnessed evidence",
    sceneFacts: { wish: { actorId, wishId, value } },
  };
}
for (const count of [1000, 10_000, 25_000]) {
  const world = wishWorld();
  const before = immutableSocialWishes(
    Array.from({ length: count }, (_, index) =>
      fixtureWish({ wish: "Captured private desire " + index }, "wish:" + index, at),
    ),
  );
  world.villagers[0].wishes = before;
  const scene = coerceSession({
    version: 4,
    id: "wish-growth",
    villageSeed: world.seed,
    status: "active",
    startedAt: at,
  });
  scene.continuity = captureSceneContinuity(world, scene, Date.parse(at));
  const after = immutableSocialWishes(
    before.map((wish, index) => ({ ...wish, wish: "Exact changed café 東京 desire " + index })),
  );
  world.villagers[0].wishes = after;
  for (const [index, wish] of after.entries()) {
    const id = "turn:" + index;
    world.exchangeReceipts[id] = wishReceipt(scene.id, id, "a", wish.id, wish);
    scene.submissions.push({ id, mode: "chat", message: "Exact input", at });
  }
  const originalWorld = structuredClone(world),
    originalCapture = structuredClone(scene.continuity);
  const known = new WeakSet([...before, ...after]);
  let visits = 0;
  const map = Array.prototype.map,
    iterate = Array.prototype[Symbol.iterator];
  Array.prototype.map = function (this: any[], ...args: any[]) {
    if (known.has(this[0])) visits += this.length;
    return Reflect.apply(map, this, args);
  };
  Array.prototype[Symbol.iterator] = function (this: any[], ...args: any[]) {
    if (known.has(this[0])) visits += this.length;
    return Reflect.apply(iterate, this, args);
  };
  let view;
  try {
    view = sceneContinuityView(world, scene, false);
  } finally {
    Array.prototype.map = map;
    Array.prototype[Symbol.iterator] = iterate;
  }
  assert(visits < count * 30, "Applying many Wish after-images never copies the whole library for each effect");
  assert.deepEqual(view.villagers[0].wishes, after);
  assert.deepEqual(world, originalWorld);
  assert.deepEqual(scene.continuity, originalCapture);
  console.log(
    `Scene Wish replay ${count}: ${visits} collection visits; exact after-images and frozen baseline preserved.`,
  );
}
for (const unknown of ["none", "before", "after"]) {
  const world = wishWorld();
  world.villagers[0].wishes = [
    fixtureWish({ wish: "Original first" }, "first"),
    fixtureWish({ wish: "Remove this" }, "remove"),
  ];
  world.villagers[1].wishes = [fixtureWish({ wish: "Other resident remains private" }, "other")];
  const scene = coerceSession({
    version: 4,
    id: "wish-order",
    villageSeed: world.seed,
    status: "active",
    startedAt: at,
  });
  scene.continuity = captureSceneContinuity(world, scene, Date.parse(at));
  const rows = [
    ...(unknown === "before" ? [wishReceipt(scene.id, "unknown", "a", "unloaded")] : []),
    wishReceipt(scene.id, "new-earlier", "a", "new", fixtureWish({ wish: "Earlier creation" }, "new")),
    wishReceipt(scene.id, "replace", "a", "first", fixtureWish({ wish: "Exact replacement café 🌼" }, "first")),
    wishReceipt(scene.id, "remove", "a", "remove", null),
    wishReceipt(scene.id, "append", "a", "append", fixtureWish({ wish: "Last new desire" }, "append")),
    wishReceipt(scene.id, "new-later", "a", "new", fixtureWish({ wish: "Final creation" }, "new")),
    ...(unknown === "after" ? [wishReceipt(scene.id, "unknown", "a", "unloaded")] : []),
    wishReceipt(scene.id, "foreign", "absent", "missing", fixtureWish({ wish: "Uncaptured resident" }, "missing")),
  ];
  for (const row of [...rows].reverse()) world.exchangeReceipts[row.id] = row;
  scene.submissions = rows.map((row) => ({ id: row.id, mode: "chat", message: "Exact input", at }));
  const view = sceneContinuityView(world, scene, false);
  if (unknown !== "none") {
    assert(!wishHistoryLoaded(view.villagers[0]));
    assert.throws(() => view.villagers[0].wishes, /not loaded/);
  } else {
    assert.deepEqual(
      view.villagers[0].wishes.map((wish) => [wish.id, wish.wish]),
      [
        ["first", "Exact replacement café 🌼"],
        ["new", "Final creation"],
        ["append", "Last new desire"],
      ],
    );
  }
  assert.deepEqual(view.villagers[1].wishes, world.villagers[1].wishes);
  assert.equal(world.villagers[0].wishes[0].wish, "Original first");
}
