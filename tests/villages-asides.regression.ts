import assert from "node:assert/strict";
import { sceneAsideAvailableHeight } from "../packages/villages/src/client/features/scenes/villages-aside-layout.js";
import { groupSceneMoments } from "../packages/villages/src/shared/helpers/scene-speech.js";

const main = { id: "main" },
  future = { id: "future" };
const leading = { id: "leading", presentation: "aside" as const, asideFor: "future" };
const orphan = { id: "orphan", kind: "whisper", asideFor: "missing" };
const trailing = { id: "trailing", kind: "side", asideFor: "main" };
assert.deepEqual(groupSceneMoments([leading, main, orphan, future, trailing]), [
  { line: main, asides: [orphan, trailing] },
  { line: future, asides: [leading] },
]);
assert.deepEqual(groupSceneMoments([orphan, leading]), [{ line: orphan, asides: [leading] }]);
assert.deepEqual(groupSceneMoments([]), []);

assert.equal(sceneAsideAvailableHeight(450, 80, 0, 48), 316);
assert.equal(sceneAsideAvailableHeight(220, 80, 140, 48), 26, "viewport panning bounds the band");
assert.equal(sceneAsideAvailableHeight(100, 80, 0, 48), 0);
console.log("Scene aside anchors and visible-height bounds passed.");
