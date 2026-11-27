import assert from "node:assert/strict";
import {
  isLocalRoomCompletion,
  hasPublishedRoomSubmission,
} from "../packages/villages/src/client/features/scenes/villages-room-reading.ts";

const visit = { roomId: "visit-a" };

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

console.log("Villages room reading regression passed");
assert.equal(
  hasPublishedRoomSubmission({ latestTurn: { id: "saved", published: false } }, "saved"),
  false,
  "Committed but unpublished work stays held",
);
assert.equal(hasPublishedRoomSubmission({ latestTurn: { id: "saved", published: true } }, "saved"), true);
assert.equal(
  hasPublishedRoomSubmission({ latestTurn: { id: "later", published: true } }, "saved"),
  false,
  "A different visible turn cannot prove or disprove this request",
);
