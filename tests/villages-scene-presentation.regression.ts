import assert from "node:assert/strict";
import {
  advanceStaging,
  createStagingCursor,
  mobileSceneLayout,
  replayStaging,
  restoreStagingCursor,
  stagingCheckpoint,
  stagingLayout,
  stagingPresentation,
  type StagingEvent,
} from "../packages/villages/src/shared/helpers/scene-staging.js";

const cast = ["a", "b", "c", "d", "e", "f"];
const events: StagingEvent[] = [
  {
    beforeIds: ["a"],
    cues: [{ characterId: "a", expression: "thinking", look: { target: "direction", direction: "left" } }],
  },
  { afterIds: ["a", "b"] },
  { cues: [{ characterId: "b", position: "center", look: { target: "villager", characterId: "a" } }] },
  {
    beforeIds: ["b", "c", "d", "e"],
    cues: [{ characterId: "c", position: "left", look: { target: "villager", characterId: "b" } }],
  },
  { afterIds: ["c", "d", "e"] },
  { beforeIds: [], afterIds: ["a", "f"] },
];
const cursor = createStagingCursor(cast, cast),
  full = replayStaging(cast, events);
for (const [index, event] of events.entries()) {
  advanceStaging(cursor, event);
  const frame = stagingPresentation(cursor),
    reference = full[index];
  assert.deepEqual(frame.activeIds, reference.activeIds);
  assert.deepEqual(frame.state, Object.fromEntries(reference.activeIds.map((id) => [id, reference.state[id]])));
  assert.deepEqual(frame.desktop, stagingLayout(reference.activeIds, reference.state));
  assert.deepEqual(frame.mobile, mobileSceneLayout(reference.activeIds, reference.state, events.slice(0, index + 1)));
}
{
  const cursor = createStagingCursor(["9"], ["9", "2", "a", "3"]);
  advanceStaging(cursor, {
    beforeIds: ["9", "2"],
    cues: [{ characterId: "9", look: { target: "villager", characterId: "2" } }],
  });
  const saved = stagingCheckpoint(cursor),
    exact = JSON.stringify(saved);
  function freeze(value: any) {
    if (!value || typeof value !== "object") return;
    for (const field of Object.values(value)) freeze(field);
    Object.freeze(value);
  }
  freeze(saved);
  const restored = restoreStagingCursor(saved, ["9", "2", "a", "3"]);
  assert.deepEqual(
    stagingPresentation(restored),
    stagingPresentation(cursor),
    "Restart preserves numeric actor encounter order",
  );
  advanceStaging(restored, { beforeIds: ["a", "3"], cues: [{ characterId: "a", expression: "joined" }] });
  assert.equal(
    JSON.stringify(saved),
    exact,
    "A frozen saved checkpoint is independent of subsequent joins and gaze resets",
  );
  const detached = stagingCheckpoint(restored);
  detached.actors[0].person.expression = "external mutation";
  detached.actors[0].person.look = { target: "direction", direction: "right" };
  assert.notEqual(restored.state[detached.actors[0].id].expression, "external mutation");
  assert.equal(restored.state[detached.actors[0].id].look.target, "player");
  assert.throws(() => createStagingCursor(["unseen"], ["a"]), /Uncaptured/);
  assert.throws(() => restoreStagingCursor(saved, ["9"]), /Uncaptured/);
  const input = { characterId: "a", look: { target: "direction" as const, direction: "left" as const } };
  advanceStaging(restored, { cues: [input] });
  Object.assign(input.look, { direction: "right" });
  assert.deepEqual(restored.state.a.look, { target: "direction", direction: "left" });
}
assert.equal(cursor.state.b.look.target, "player", "An inactive observer also forgets a departed gaze target");

{
  const cursor = createStagingCursor(["a"], ["a", "b", "c"]);
  advanceStaging(cursor, {
    beforeIds: ["a"],
    cues: [{ characterId: "a", expression: "start", look: { target: "direction", direction: "left" } }],
  });
  const start = stagingPresentation(cursor),
    original = JSON.stringify(start);
  const detached = stagingPresentation(cursor);
  detached.state.a.expression = "unrelated consumer";
  if (detached.state.a.look.target === "direction") detached.state.a.look.direction = "right";
  assert.equal(cursor.state.a.expression, "start");
  assert.deepEqual(cursor.state.a.look, { target: "direction", direction: "left" });
  advanceStaging(cursor, { cues: [{ characterId: "a", expression: "aside" }], afterIds: ["a", "b", "c"] });
  const end = stagingPresentation(cursor);
  assert.equal(start.state.a.expression, "start");
  assert.equal(end.state.a.expression, "aside");
  assert.deepEqual(start.activeIds, ["a"]);
  assert.deepEqual(end.activeIds, ["a", "b", "c"]);
  assert.equal(JSON.stringify(start), original, "Later paragraph cues and joins cannot rewrite the opening frame");
  assert.equal(cursor.state.a.position, "left", "Introducing a larger cast cannot rewrite captured defaults");
}
{
  const cursor = createStagingCursor(["a"], ["a"]);
  advanceStaging(cursor, {
    beforeIds: ["a", "unseen"],
    cues: [{ characterId: "a", look: { target: "villager", characterId: "unseen" } }],
  });
  const frame = stagingPresentation(cursor);
  assert.deepEqual(frame.activeIds, ["a"]);
  assert.deepEqual(frame.state.a.look, { target: "player" });
  assert(!JSON.stringify(frame).includes("unseen"), "A presentation frame cannot disclose an unstaged gaze target");
}
{
  const cursor = createStagingCursor([], ["__proto__", "constructor"]);
  advanceStaging(cursor, { beforeIds: ["__proto__", "constructor"] });
  const frame = stagingPresentation(cursor);
  assert(
    Object.hasOwn(frame.state, "__proto__") &&
      Object.hasOwn(frame.desktop, "__proto__") &&
      Object.hasOwn(frame.mobile, "__proto__"),
  );
  assert.equal(frame.activeIds.length, 2);
}
for (const count of [1000, 10_000, 25_000]) {
  const cast = Array.from({ length: count }, (_, index) => "actor:" + index);
  const cursor = createStagingCursor([cast[0]], cast);
  let scanned = 0,
    reads = 0,
    serialized = 0;
  cursor.state = new Proxy(cursor.state, {
    ownKeys(target) {
      const keys = Reflect.ownKeys(target);
      scanned += keys.length;
      return keys;
    },
    get(target, key, receiver) {
      reads++;
      return Reflect.get(target, key, receiver);
    },
  });
  for (const id of cast) {
    advanceStaging(cursor, { beforeIds: [id] });
    const frame = stagingPresentation(cursor);
    assert.equal(Object.keys(frame.state).length, 1);
    serialized += Buffer.byteLength(JSON.stringify(frame));
  }
  assert.equal(scanned, 0, "Evaluating a moment does not enumerate the growing departed cast");
  assert(reads < count * 40, "Presentation work follows visible actors rather than encountered history");
  assert(serialized < count * 1500, "Historical frames never copy the encountered cast");
  assert.equal(cursor.index.order.size, count, "One working accumulator still retains returning actors' poses");
  console.log(
    `Scene presentation ${count}: ${reads} state reads, ${serialized} frame bytes, ${scanned} departed-cast scans.`,
  );
}
