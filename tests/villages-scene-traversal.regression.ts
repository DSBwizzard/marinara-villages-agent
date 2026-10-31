import assert from "node:assert/strict";
import { mock } from "node:test";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { fixtureWish, wishWorld } from "./helpers/social-wishes-fixture.js";
import {
  immutableSocialWishes,
  wishHistoryLoaded,
} from "../packages/villages/src/server/domain/rules/social-wishes.js";
import type { VillageWish } from "../packages/villages/src/server/domain/models/world.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
  visibleSceneContinuity,
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
    version: 3,
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
    version: 3,
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
for (const count of [1000, 10_000, 25_000]) {
  let visits = 0;
  const world = defaultVillageState();
  world.seed = "intention-growth";
  const social = (world.relationshipContext = defaultRelationshipState(world.seed));
  const receipt = (id: string, turn: string, text = id) => ({
    sourceId: id,
    actorId: "ada",
    get sceneId() {
      visits++;
      return "scene";
    },
    get submissionId() {
      visits++;
      return turn;
    },
    at,
    sceneAfter: [
      {
        id,
        actorId: "ada",
        targetIds: ["player"],
        text,
        reason: "Witnessed",
        evidenceIds: [id],
        status: "active" as const,
      },
    ],
    liveAfter: [],
    sceneRevision: 1,
    liveRevision: 1,
    evidence: [],
  });
  social.intentionReceipts.already = receipt("already", "turn:0");
  const scene = coerceSession({ version: 3, id: "scene", villageSeed: world.seed, status: "active", startedAt: at });
  scene.continuity = captureSceneContinuity(world, scene, Date.parse(at));
  const captured = structuredClone(scene.continuity);
  social.intentionReceipts.first = receipt("first", "turn:0");
  social.intentionReceipts.second = receipt("second", "turn:0", "Exact final café 🌼 intention");
  for (let index = 1; index < count; index++)
    social.intentionReceipts["receipt:" + index] = receipt("receipt:" + index, "turn:" + index);
  social.intentionReceipts.already = receipt("already", "turn:0", "Must not overwrite captured evidence");
  social.intentionReceipts.foreign = { ...receipt("foreign", "turn:0"), sceneId: "another-scene" };
  social.intentionReceipts.excluded = receipt("excluded", "not-in-the-transcript");
  scene.submissions = Array.from({ length: count }, (_, index) => ({
    id: "turn:" + (count - index - 1),
    mode: "chat",
    message: "Exact input",
    targetId: "",
    at,
  }));
  const before = structuredClone(social);
  visits = 0;
  const entries = Object.entries;
  let scans = 0;
  const spy = mock.method(Object, "entries", (value: any) => {
    if (value === social.intentionReceipts) scans++;
    return entries(value);
  });
  let view;
  try {
    view = sceneContinuityView(world, scene, false).relationshipContext!;
  } finally {
    spy.mock.restore();
  }
  const replayVisits = visits;
  assert.equal(scans, 1, "Replay scans the ledger once, independently of transcript length");
  assert(replayVisits < count * 20, "Receipt eligibility work is linear in retained history");
  assert.equal(view.intentions.ada[0].text, "Exact final café 🌼 intention");
  assert.equal(view.intentionReceipts.already.sceneAfter[0].text, "already");
  assert(!view.intentionReceipts.foreign && !view.intentionReceipts.excluded);
  assert.deepEqual(social, before, "Replay cannot mutate current authority");
  assert.deepEqual(scene.continuity, captured, "Replay cannot mutate the captured baseline");
  console.log(
    `Scene intention replay ${count}: one ledger scan, ${replayVisits} receipt-field reads; exact order, scope and baseline preserved.`,
  );
  let narrationVisits = 0;
  scene.lines = Array.from({ length: count }, (_, index) => ({
    id: "narration:" + index,
    role: "assistant" as const,
    speakerId: "__venue_scene__",
    name: "Narration",
    get kind() {
      narrationVisits++;
      return "narration" as const;
    },
    get content() {
      assert(index >= count - 8, "Optional continuity never reads old prose outside its retained suffix");
      return "Exact café narration " + index;
    },
    at,
    heardBy: [],
  }));
  const continuity = visibleSceneContinuity(scene);
  assert.equal(narrationVisits, 8);
  assert(
    continuity.includes(
      JSON.stringify(Array.from({ length: 8 }, (_, index) => "Exact café narration " + (count - 8 + index))),
    ),
  );
}
{
  const scene = coerceSession({
    version: 3,
    id: "narration-boundaries",
    lines: [
      { id: "old", kind: "narration", role: "assistant", speakerId: "__venue_scene__", content: "Earlier." },
      {
        id: "hidden",
        kind: "narration",
        role: "assistant",
        speakerId: "__venue_scene__",
        content: "Private cause",
        contactHidden: true,
      },
      {
        id: "report",
        kind: "narration",
        role: "assistant",
        speakerId: "__venue_scene__",
        content: "Private report",
        contactReport: true,
      },
      { id: "speech", role: "assistant", speakerId: "ada", content: "Spoken words" },
      { id: "latest", kind: "narration", role: "assistant", speakerId: "__venue_scene__", content: "Latest." },
    ],
  });
  assert(visibleSceneContinuity(scene).includes(JSON.stringify(["Earlier.", "Latest."])));
  scene.lines.at(-1)!.content = "x".repeat(6001);
  assert.equal(visibleSceneContinuity(scene), "", "An oversized newest narration never falls back to older context");
  scene.lines.at(-1)!.content = "x".repeat(6000);
  const exact = visibleSceneContinuity(scene);
  assert(exact.includes(JSON.stringify(["x".repeat(6000)])) && !exact.includes("Earlier."));
}
