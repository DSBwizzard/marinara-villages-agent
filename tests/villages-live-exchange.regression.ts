import assert from "node:assert/strict";
import type { VenueLine, VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
import {
  bindLiveProposals,
  createLiveEvidenceContext,
  liveEvidence,
  mergeLiveReplyProposals,
} from "../packages/villages/src/server/domain/rules/live-exchange.js";

const stamp = "2026-10-07T00:00:00.000Z";
function line(id: string, extra: Partial<VenueLine> = {}): VenueLine {
  return { id, speakerId: "a", name: "Ada", role: "assistant", content: id, at: stamp, heardBy: ["a", "b"], ...extra };
}
const scene: VenueScene = {
  version: 2,
  sceneRevision: 1,
  id: "scene",
  placeId: "venue",
  placeName: "Venue",
  area: "shared",
  privateOwnerId: "",
  privateAccessOwnerId: "",
  startedAt: stamp,
  endedAt: "",
  lastActivityAt: stamp,
  endReason: "",
  memoryMode: "live",
  status: "active",
  participants: [],
  activeIds: [],
  lines: [
    line("unprovided"),
    line("earlier"),
    line("player", { role: "user", speakerId: "" }),
    line("hidden", { contactHidden: true }),
    line("report", { contactReport: true }),
    line("whisper-away", { kind: "whisper", targetId: "b" }),
    line("whisper-player", { kind: "whisper", targetId: "player" }),
    line("visible"),
  ],
  heardHistory: [],
  submissions: [],
  recap: "This recap does not confer evidence authority.",
};
const proposals = bindLiveProposals(
  { earlierLineIds: ["earlier"] },
  "player",
  ["hidden", "report", "whisper-away", "whisper-player", "visible", "absent"],
  scene.lines,
);
const evidence = liveEvidence(scene, proposals);
assert.equal(
  evidence.find((row) => row.id === "player")?.speakerId,
  "player",
  "Saved player speech has a stable social identity",
);
assert.deepEqual(
  evidence.map((row) => [row.id, row.playerHeard]),
  [
    ["earlier", true],
    ["player", true],
    ["hidden", false],
    ["whisper-away", false],
    ["whisper-player", true],
    ["visible", true],
  ],
);
assert.equal(
  evidence.find((row) => row.id === "hidden")?.content,
  "hidden",
  "Privileged processors retain unseen evidence.",
);
assert.deepEqual(evidence.find((row) => row.id === "hidden")?.heardBy, ["a", "b"]);
const context = createLiveEvidenceContext(scene, proposals);
assert(Object.isFrozen(context));
assert(Object.isFrozen(context.lines));
assert(context.lines.every(Object.isFrozen));
assert.equal(
  context.byId.get("hidden"),
  context.lines.find((row) => row.id === "hidden"),
);
assert(!context.byId.has("report") && !context.byId.has("unprovided") && !context.byId.has("absent"));
scene.lines.find((row) => row.id === "hidden")!.heardBy.push("late-witness");
assert.deepEqual(
  context.byId.get("hidden")?.heardBy,
  ["a", "b"],
  "Captured witnesses must not follow later Scene edits.",
);

assert.throws(() => liveEvidence(scene, proposals), /source identity changed/);
const rawMemory = [{ kind: "not-yet-validated", evidence: ["player", 0] }];
const rawRelationship = { changes: [{ lineIds: ["player", 0, "earlier"] }], permissions: [], disclosures: [] };
const earlier = ["earlier"];
const contexts = { memory: { proof: "captured" } } as any;
const replyIds = ["reply"];
const bound = bindLiveProposals(
  { memoryChanges: rawMemory, relationshipChanges: rawRelationship, earlierLineIds: earlier, memoryContexts: contexts },
  "player",
  replyIds,
  scene.lines,
);
assert.equal(bound.memoryChanges, rawMemory);
assert.equal(bound.relationshipChanges, rawRelationship);
assert.equal(bound.earlierLineIds, earlier);
assert.deepEqual(bound.memoryContexts, contexts);
assert.equal(bound.replyLineIds, replyIds);
assert.equal(bound.version, 1, "Binding must preserve metadata for the later authoritative processors to validate.");

const merged = mergeLiveReplyProposals(
  {
    memoryChanges: rawMemory,
    relationshipChanges: rawRelationship,
    earlierLineIds: ["earlier", "shared"],
    memoryContexts: { old: { protection: { fingerprint: "old" } } as any },
  },
  {
    memoryChanges: [
      { learners: { a: { support: ["player", 0, 2, "earlier"].map((lineId) => ({ lineId, excerpt: "quote" })) } } },
    ],
    relationshipChanges: { changes: [{ lineIds: ["player", 1, "shared"] }], permissions: [], disclosures: [] },
    earlierLineIds: ["shared", "other"],
    memoryContexts: { current: { protection: { fingerprint: "current" } } as any },
  },
  4,
);
assert.deepEqual(
  (merged.memoryChanges![1] as any).learners.a.support.map((row: any) => row.lineId),
  [3, 4, 6, "earlier"],
);
assert.deepEqual(merged.relationshipChanges.changes, [rawRelationship.changes[0], { lineIds: [3, 5, "shared"] }]);
assert.deepEqual(merged.earlierLineIds, ["earlier", "shared", "other"]);
assert.deepEqual(Object.keys(merged.memoryContexts), ["old", "current"]);
assert.deepEqual(rawMemory[0].evidence, ["player", 0]);
assert.deepEqual(rawRelationship.changes[0].lineIds, ["player", 0, "earlier"]);
const missing = mergeLiveReplyProposals(
  {},
  { memoryChanges: [], relationshipChanges: { changes: [], permissions: [], disclosures: [] } },
  1,
);
assert.equal(missing.memoryChanges, undefined);
assert.equal(
  missing.relationshipChanges.changes,
  undefined,
  "Missing metadata must remain distinguishable from an empty valid proposal list.",
);

console.log(
  "PASS pure live-exchange citation, witness, captured-evidence and correction-version rules without Engine runtime",
);
