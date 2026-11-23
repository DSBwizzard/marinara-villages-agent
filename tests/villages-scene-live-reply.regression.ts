import assert from "node:assert/strict";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  publicSceneLiveReply,
  publicSceneAuthority,
  publicSceneHistoryPositions,
} from "../packages/villages/src/server/domain/rules/scene-public.js";
import { sceneHistoryVisits } from "../packages/villages/src/server/domain/rules/scene-history-visits.js";

const at = "2026-11-20T12:00:00Z";
const scene = coerceSession({ version: 5, id: "live", status: "active", zoneId: "entrance", startedAt: at });
scene.sceneAttendance = {
  capturedAt: at,
  occupants: [],
  layout: [
    { id: "entrance", name: "Entrance", kind: "exterior" },
    { id: "airstrip", name: "Airstrip", kind: "restricted" },
    { id: "secret", name: "UNSEEN LOCATION", kind: "restricted" },
  ],
};
const line = (id: string, content: string, zoneId = "entrance") => ({
  id,
  kind: "narration" as const,
  role: "assistant" as const,
  speakerId: "__venue_scene__",
  name: "Narration",
  content,
  at,
  zoneId,
  heardBy: ["player"],
});
scene.lines = [line("old", "Old reply."), line("arrival-b", "You arrive at Airstrip.", "airstrip")];
assert.deepEqual(
  publicSceneLiveReply(scene).lines.map((line) => line.id),
  ["arrival-b"],
);
scene.lines.push(line("arrival-a", "You arrive at Entrance."));
scene.lines.push(line("early-egress", "A visitor leaves because access has ended."));
assert.deepEqual(
  publicSceneLiveReply(scene).lines.map((line) => line.id),
  ["arrival-a"],
  "NPC egress does not replace the current player arrival",
);
scene.lines.pop();
assert.deepEqual(
  publicSceneLiveReply(scene).lines.map((line) => line.id),
  ["arrival-a"],
  "returning to A never revives its old reply",
);
scene.lines.push(line("reply-1", "First part."), line("reply-2", "Second part."), {
  ...line("private", "PRIVATE", "secret"),
  heardBy: ["mara"],
});
scene.submissions.push({
  id: "turn",
  at,
  message: "Hello",
  mode: "chat",
  targetId: "",
  requestFingerprint: "",
  acceptance: { status: "applied", rejected: [] },
  zoneIdAtTurn: "entrance",
  replyLineIds: ["reply-1", "reply-2", "private"],
  lore: [{ id: "current", bookId: "world", name: "Current reply entry", targets: ["GM"] }],
});
assert.equal(publicSceneAuthority(scene).lore[0]?.name, "Current reply entry");
assert.deepEqual(
  publicSceneLiveReply(scene).lines.map((line) => line.id),
  ["reply-1", "reply-2"],
);
scene.lines.push(line("held", "HELD"));
scene.submissions.push({
  ...scene.submissions[0],
  id: "held-turn",
  acceptance: { status: "held", rejected: [] },
  replyLineIds: ["held"],
  lore: [{ id: "held-lore", bookId: "world", name: "Held reply entry", targets: ["GM"] }],
});
assert.equal(
  publicSceneAuthority(scene).lore[0]?.name,
  "Current reply entry",
  "held requests do not replace reply lore",
);
assert.deepEqual(
  publicSceneLiveReply(scene).lines.map((line) => line.id),
  ["reply-1", "reply-2"],
  "held output never replaces a published reply",
);
scene.lines.push(line("npc-egress", "A visitor leaves because access has ended."));
assert.deepEqual(
  publicSceneLiveReply(scene).lines.map((line) => line.id),
  ["reply-1", "reply-2"],
  "a witnessed NPC egress is history, not a replacement GM reply",
);
scene.lines.pop();
const beforeRetry = publicSceneLiveReply(scene).id;
scene.submissions[0].episodeId = "replacement-episode";
assert.notEqual(
  publicSceneLiveReply(scene).id,
  beforeRetry,
  "Retry has a new presentation identity even when the submission ID stays the same",
);
scene.lines.push({ ...line("remote", "A voice nearby.", "secret"), viaDoorway: true });
scene.submissions[0].replyLineIds!.push("remote");
const positions = publicSceneHistoryPositions(scene);
const visits = sceneHistoryVisits(scene, positions);
assert.deepEqual(
  visits.map((visit) => visit.id),
  ["live", "arrival-b", "arrival-a", "arrival-a", "arrival-a", "arrival-a"],
);
assert(!JSON.stringify(visits).includes("UNSEEN"));
assert.equal(visits[1].name, "Airstrip");
assert.equal(visits.at(-1)?.name, "Entrance", "remote speech belongs to the player's visit");
assert.equal(
  visits[0].name,
  "Scene",
  "a first paid turn after a forced arrival does not mislabel the earlier location",
);
assert.notEqual(visits[0].id, visits[2].id, "repeat visits have separate identities even at the same time");
scene.lines.push(...Array.from({ length: 65 }, (_, index) => line("long-" + index, "Part " + index)));
scene.submissions.push({
  ...scene.submissions[0],
  id: "long-turn",
  replyLineIds: scene.lines.slice(-65).map((line) => line.id),
});
assert.equal(
  publicSceneLiveReply(scene).lines.length,
  65,
  "a reply is complete across the ordinary history window limit",
);
scene.lines.push(line("arrival-new", "You arrive in a new Zone.", "airstrip"));
assert.deepEqual(publicSceneAuthority(scene).lore, [], "an arrival never inherits the prior reply's Lorebook entries");
console.log(
  "Latest complete published reply, return arrivals, held/private output and player-only Zone visits passed.",
);
