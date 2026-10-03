import assert from "node:assert/strict";
import {
  mobileSceneLayout,
  mobileReadingCounter,
} from "../packages/villages/src/engine/packages/client/src/villages-mobile-scene.js";
import {
  initialStaging,
  replayStaging,
  stagingLayout,
} from "../packages/villages/src/engine/packages/shared/src/villages/scene-staging.js";

const ids = ["a", "b", "c", "d"];
for (const [count, expected] of [
  [1, [0.5]],
  [2, [0.26, 0.74]],
  [3, [0.11, 0.26, 0.74]],
  [4, [0.11, 0.26, 0.74, 0.89]],
] as const) {
  const cast = ids.slice(0, count);
  const state = initialStaging(cast);
  const before = structuredClone(state);
  const desktop = stagingLayout(cast, state);
  const mobile = mobileSceneLayout(cast, state, []);
  assert.deepEqual(
    cast.map((id) => mobile[id].x),
    [...expected],
  );
  assert.deepEqual(state, before, "mobile defaults never change saved positions");
  assert.deepEqual(stagingLayout(cast, state), desktop, "desktop projection stays unchanged");
}
const events = [
  {
    cues: [
      { characterId: "b", position: "center" as const },
      { characterId: "c", look: { target: "villager" as const, characterId: "a" } },
    ],
  },
];
const state = replayStaging(ids, events)[0].state;
const moved = mobileSceneLayout(ids, state, events);
assert.equal(moved.b.x, 0.5, "explicit center occupies the gap");
assert.equal(moved.c.facing, "left", "attention uses actual mobile group positions");
const survivors = mobileSceneLayout(["a", "c", "d"], initialStaging(ids), []);
const full = mobileSceneLayout(ids, initialStaging(ids), []);
for (const id of ["a", "c", "d"]) assert.deepEqual(survivors[id], full[id], "departures reserve slots");
assert.equal(survivors.b, undefined);
assert.equal(full.b.depth, 16);
assert.equal(full.d.depth, 16);
const five = initialStaging([...ids, "e"]);
assert.deepEqual(mobileSceneLayout(ids, five, []), full, "overflow residents do not alter four stage anchors");
const replaced = mobileSceneLayout(["a", "c", "d", "e"], five, []);
for (const id of ["a", "c", "d"])
  assert.deepEqual(replaced[id], full[id], "an arrival uses a vacant slot without moving survivors");
assert.equal(replaced.e.x, full.b.x);
const arrivalEvents = [{ beforeIds: ["a"], afterIds: ["a", "b"] }];
assert.equal(
  mobileSceneLayout(["a"], initialStaging(ids), [{ beforeIds: ["a"] }]).a.x,
  0.5,
  "future participants do not reposition the opening solo cast",
);
assert.deepEqual(
  Object.values(mobileSceneLayout(["a", "b"], initialStaging(ids), arrivalEvents)).map((slot) => slot.x),
  [0.26, 0.74],
);
assert.equal(mobileReadingCounter(0, 8, 1, 3), "Page 2/3 · paragraph 1/8");
assert.equal(mobileReadingCounter(0, 8, 0, 1), "Paragraph 1/8");
console.log(
  "Mobile groups: defaults, explicit movement, attention, departures, depth, counters and immutable state passed",
);
