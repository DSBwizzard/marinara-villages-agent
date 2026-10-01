import assert from "node:assert/strict";
import {
  hasCompletedRoomSubmission,
  isLocalRoomCompletion,
  nextRoomReadIndex,
} from "../packages/villages/src/engine/packages/client/src/villages-room-reading.ts";

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
assert.equal(
  nextRoomReadIndex({ roomId: visit.roomId, stepCount: 47 }, visit.roomId, 50, 46),
  47,
  "a silent farewell opens at its first generated paragraph",
);
assert.equal(
  nextRoomReadIndex({ roomId: visit.roomId, stepCount: 48 }, visit.roomId, 51, 47),
  48,
  "a spoken farewell opens after the player's final line",
);

const pendingLeave = { roomId: visit.roomId, submissionId: "leave-once" };
assert.equal(
  isLocalRoomCompletion(visit.roomId, pendingLeave),
  true,
  "a missing active-session response cannot interrupt a locally pending Leave",
);
assert.equal(
  isLocalRoomCompletion("another-visit", pendingLeave),
  false,
  "another visit is still independently checked",
);
assert.equal(isLocalRoomCompletion(visit.roomId, null), false, "an actual away or inactivity ending is not hidden");
assert.equal(
  hasCompletedRoomSubmission({ status: "closed", submissions: [{ id: "leave-once" }] }, "leave-once"),
  true,
  "a committed farewell can be recovered when its HTTP response is lost",
);
assert.equal(
  hasCompletedRoomSubmission({ status: "active", submissions: [{ id: "leave-once" }] }, "leave-once"),
  false,
  "an active Scene remains retryable",
);
assert.equal(
  hasCompletedRoomSubmission({ status: "closed", submissions: [{ id: "other-leave" }] }, "leave-once"),
  false,
  "a different visit ending is not presented as the local farewell",
);

console.log("Villages room reading regression passed");
