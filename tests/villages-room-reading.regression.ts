import assert from "node:assert/strict";
import { nextRoomReadIndex } from "../packages/villages/src/engine/packages/client/src/villages-room-reading.ts";

const visit = { roomId: "visit-a", stepCount: 47 };
assert.equal(
  nextRoomReadIndex(null, visit.roomId, visit.stepCount, 0),
  46,
  "a reopened visit starts at its latest paragraph",
);
assert.equal(nextRoomReadIndex(visit, visit.roomId, 48, 46), 47, "the optimistic player paragraph opens first");
assert.equal(
  nextRoomReadIndex({ roomId: visit.roomId, stepCount: 48 }, visit.roomId, 54, 47),
  48,
  "a six-paragraph reply opens at its first paragraph, not its sixth",
);
assert.equal(nextRoomReadIndex({ roomId: visit.roomId, stepCount: 54 }, visit.roomId, 54, 49), 49);
assert.equal(
  nextRoomReadIndex({ roomId: visit.roomId, stepCount: 48 }, visit.roomId, 47, 47),
  46,
  "a failed send clamps the reader to the restored transcript",
);
assert.equal(nextRoomReadIndex({ roomId: "opening", stepCount: 0 }, "greeting", 0, 0), 0);
assert.equal(
  nextRoomReadIndex({ roomId: "greeting", stepCount: 0 }, "greeting", 3, 0),
  0,
  "a generated greeting opens at its first paragraph",
);
assert.equal(nextRoomReadIndex({ roomId: visit.roomId, stepCount: 54 }, "visit-b", 12, 48), 11);

console.log("Villages room reading regression passed");
