import assert from "node:assert/strict";
import {
  hasCompletedRoomSubmission,
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
assert.equal(
  hasCompletedRoomSubmission({ status: "closed", latestTurn: { id: "leave-once", published: true } }, "leave-once"),
  true,
  "a committed farewell can be recovered when its HTTP response is lost",
);
assert.equal(
  hasCompletedRoomSubmission({ status: "active", latestTurn: { id: "leave-once", published: true } }, "leave-once"),
  false,
  "an active Scene remains retryable",
);
assert.equal(
  hasCompletedRoomSubmission({ status: "closed", latestTurn: { id: "other-leave", published: true } }, "leave-once"),
  false,
  "a different visit ending is not presented as the local farewell",
);

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
