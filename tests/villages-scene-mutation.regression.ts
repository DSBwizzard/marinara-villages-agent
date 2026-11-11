import assert from "node:assert/strict";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { applySceneMutation } from "../packages/villages/src/server/domain/rules/scene-mutation.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { pendingSceneSubmission } from "./helpers/narration-submission.fixture.js";

const stamp = "2026-10-06T12:00:00.000Z";
function scene() {
  return coerceSession({
    version: 5,
    id: "scene",
    placeId: "venue",
    zoneId: "exterior",
    sceneRevision: 3,
    changeSequence: 4,
    villageSeed: "seed",
    startedAt: stamp,
    participants: [],
    lines: [],
    submissions: [],
  });
}
const unchanged = scene();
assert.equal(
  applySceneMutation(unchanged, "scene", () => {}),
  false,
  "No-op skips the storage write",
);
const untouched = structuredClone(unchanged);
assert.throws(
  () => applySceneMutation(unchanged, "different", () => assert.fail("Must not invoke mutation")),
  /no longer available/,
);
assert.deepEqual(unchanged, untouched);

const damaged = scene();
const malformed = pendingSceneSubmission(damaged, "damaged", "Exact input", "reply");
malformed.message = "Changed input";
damaged.submissions.push(malformed);
const before = structuredClone(damaged);
assert.throws(
  () => applySceneMutation(damaged, "scene", () => assert.fail("Must not invoke mutation")),
  /private submission changed/,
);
assert.deepEqual(damaged, before);

const movement = scene();
assert.equal(
  applySceneMutation(movement, "scene", (saved) => {
    saved.zoneId = "common";
  }),
  undefined,
);
assert.equal(movement.sceneRevision, 4, "Visible Scene change advances its revision once");
assert.equal(movement.changeSequence, 4, "Zone movement alone creates no acceptance notice");
const activity = scene();
applySceneMutation(activity, "scene", (saved) => {
  saved.lastActivityAt = stamp;
});
assert.equal(activity.sceneRevision, 3, "Activity-only persistence does not invalidate the Scene view");

const recorded = scene();
const turn = pendingSceneSubmission(recorded, "turn-a", "Hello. (Keep the thought private.)", "reply-line");
applySceneMutation(recorded, "scene", (saved) => {
  saved.submissions.push(turn);
});
assert.equal(recorded.submissions[0].message, "Hello. (Keep the thought private.)");
assert.equal(recorded.submissions[0].narration!.readset.source.input, turn.message);
assert.equal(recorded.changeSequence, 5);
assert.equal(recorded.submissions[0].changeSequence, 5);
assert.equal(
  applySceneMutation(recorded, "scene", () => {}),
  false,
);
applySceneMutation(recorded, "scene", (saved) => {
  saved.submissions[0].acceptance = { status: "held", rejected: [{ id: "required", reason: "Needs review" }] };
});
assert.equal(recorded.submissions[0].changeSequence, 6, "A held reply advances the notice cursor");
applySceneMutation(recorded, "scene", (saved) => {
  const row = saved.submissions[0];
  row.acceptance = { status: "applied", rejected: [] };
  row.episodeId = "accepted-episode";
  row.progressProcessedAt = stamp;
});
assert.equal(recorded.changeSequence, 7);
assert.equal(recorded.submissions[0].changeSequence, 7);
assert.equal(recorded.submissions[0].message, turn.message);
assert.equal(
  applySceneMutation(recorded, "scene", () => {}),
  false,
  "No-op replay adds no acceptance notice",
);

const captured = scene();
const world = { ...defaultVillageState(), seed: captured.villageSeed!, setupAt: stamp, setting: "Original setting" };
captured.continuity = captureSceneContinuity(world, captured, Date.parse(stamp));
const original = captured.continuity;
assert.equal(
  applySceneMutation(captured, "scene", () => {}),
  false,
);
world.setting = "Corrected setting";
assert.equal(
  applySceneMutation(captured, "scene", (saved) => {
    saved.continuity = captureSceneContinuity(world, saved, Date.parse(stamp));
  }),
  undefined,
  "A changed captured basis still requires persistence",
);
assert.equal(original.facts.setting, "Original setting");
assert.equal(captured.continuity!.facts.setting, "Corrected setting");
assert.equal(captured.sceneRevision, 3);
assert.equal(
  applySceneMutation(captured, "scene", () => {}),
  false,
);
