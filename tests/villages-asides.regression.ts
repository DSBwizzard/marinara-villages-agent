import assert from "node:assert/strict";
import {
  groupSceneAsides,
  sceneAsideAvailableHeight,
} from "../packages/villages/src/client/features/scenes/villages-aside-layout.js";
import { VENUE_SCENE_WRITING_FOUNDATION } from "../packages/villages/src/engine/packages/server/src/services/villages/narration-style.js";

const asides = [
  { speakerId: "left-outer", text: "One" },
  { speakerId: "right-inner", text: "Two" },
  { speakerId: "left-inner", text: "Three" },
  { speakerId: "right-outer", text: "Four" },
];
const positions = {
  "left-outer": { x: 0.11 },
  "left-inner": { x: 0.26 },
  "right-inner": { x: 0.74 },
  "right-outer": { x: 0.89 },
};
const groups = groupSceneAsides(asides, positions, "right-inner");
assert.deepEqual(groups.left, [asides[0], asides[2]]);
assert.deepEqual(groups.right, [asides[1], asides[3]]);
assert.equal(groups.left[0], asides[0], "grouping preserves the complete original aside");
assert.deepEqual(groupSceneAsides([{ text: "Legacy" }], positions, "left-inner").left, [{ text: "Legacy" }]);
assert.equal(
  groupSceneAsides([asides[0]!], { "left-outer": { x: 0.8 } }, "right-inner").right.length,
  1,
  "explicit movement changes the aside's side",
);
assert.equal(
  groupSceneAsides([{ speakerId: "remote" }], positions, "left-inner").right.length,
  1,
  "unstaged voices have a stable fallback",
);
assert.equal(sceneAsideAvailableHeight(450, 80, 0, 48), 316);
assert.equal(sceneAsideAvailableHeight(220, 80, 140, 48), 26, "viewport panning bounds the band");
assert.equal(sceneAsideAvailableHeight(100, 80, 0, 48), 0);
assert.match(VENUE_SCENE_WRITING_FOUNDATION, /Take natural opportunities/u);
assert.match(VENUE_SCENE_WRITING_FOUNDATION, /there is no quota/u);
assert.match(VENUE_SCENE_WRITING_FOUNDATION, /A request does not compel agreement or guarantee privacy/u);
console.log("Scene asides: independent speaker groups, movement, legacy fallback and visible-height bounds passed.");
