import assert from "node:assert/strict";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { applySceneMutation } from "../packages/villages/src/server/domain/rules/scene-mutation.js";

// Direct domain tests: no host, document store, network, timers, or paid provider.
const stamp = "2026-10-06T12:00:00.000Z";
function scene(submissions: unknown[] = []) {
  return coerceSession({
    id: "scene",
    placeId: "venue",
    zoneId: "exterior",
    sceneRevision: 3,
    changeSequence: 4,
    processingVersion: 1,
    villageSeed: "seed",
    participants: [{ characterId: "resident", name: "Resident" }],
    lines: [
      { id: "player-line", role: "user", content: "Hello", at: stamp, heardBy: ["resident"] },
      { id: "reply-line", role: "assistant", content: "Welcome", at: stamp, heardBy: ["resident"] },
    ],
    submissions,
  });
}
const unchanged = scene();
assert.equal(
  applySceneMutation(unchanged, "scene", () => {}),
  false,
  "no-op tells storage to skip the write",
);
const untouched = structuredClone(unchanged);
assert.throws(
  () => applySceneMutation(unchanged, "different", () => assert.fail("must not invoke mutation")),
  /no longer available/,
);
assert.deepEqual(unchanged, untouched);

const movement = scene();
assert.equal(
  applySceneMutation(movement, "scene", (saved) => {
    saved.zoneId = "common";
  }),
  undefined,
);
assert.equal(movement.sceneRevision, 4, "visible Scene change advances its revision once");
assert.equal(movement.changeSequence, 4, "Zone movement alone creates no receipt notice");
const activity = scene();
applySceneMutation(activity, "scene", (saved) => {
  saved.lastActivityAt = stamp;
});
assert.equal(activity.sceneRevision, 3, "activity-only persistence does not invalidate the Scene view");

const recorded = scene();
const turn = scene([
  {
    id: "turn-a",
    mode: "chat",
    message: "Hello",
    at: stamp,
    replyLineIds: ["reply-line"],
    action: { happened: true },
    physicalOutcomeVersion: 1,
  },
]).submissions[0]!;
applySceneMutation(recorded, "scene", (saved) => {
  saved.submissions.push(turn);
});
const processing = recorded.submissions[0]!.processing!;
assert.deepEqual(processing.lineIds, ["player-line", "reply-line"]);
assert.deepEqual(processing.actionReceiptIds, ["venue-chat:scene:turn-a"]);
assert.equal(processing.sceneId, "scene");
assert.equal(processing.seed, "seed");
assert.ok(Object.values(processing.domains).every((domain) => domain.status === "pending"));
assert.equal(recorded.changeSequence, 5);
assert.equal(recorded.submissions[0]!.changeSequence, 5);
assert.equal(
  applySceneMutation(recorded, "scene", () => {}),
  false,
  "replay never duplicates initialized processing",
);
assert.equal(recorded.changeSequence, 5);
applySceneMutation(recorded, "scene", (saved) => {
  saved.submissions[0]!.processing!.domains.wishes.status = "applied";
});
assert.equal(recorded.changeSequence, 6, "committed domain bookkeeping advances the notice cursor");
assert.equal(recorded.submissions[0]!.changeSequence, 6);

const currentAction = scene();
applySceneMutation(currentAction, "scene", (saved) => {
  saved.submissions.push(
    scene([
      {
        id: "act",
        mode: "chat",
        requestMode: "act",
        at: stamp,
        message: "Act",
        action: { happened: true },
        physicalOutcomeVersion: 1,
      },
    ]).submissions[0]!,
  );
});
assert.ok(currentAction.submissions[0]!.processing, "current Act alias starts saved exchange processing");
assert.deepEqual(currentAction.submissions[0]!.processing!.actionReceiptIds, ["venue-chat:scene:act"]);
const currentProcessing = structuredClone(currentAction.submissions[0]!.processing);
assert.equal(
  applySceneMutation(currentAction, "scene", () => {}),
  false,
);
assert.deepEqual(currentAction.submissions[0]!.processing, currentProcessing);
console.log(
  "Scene mutation domain passed: no-op, identity, revision, notice ordering, replayable processing and current Act admission; no Engine or providers.",
);
