import assert from "node:assert/strict";
import type { VenueLine, VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
import type { VillageChronicleEntry } from "../packages/villages/src/server/domain/models/world.js";
import {
  bindLiveProposals,
  createLiveEvidenceContext,
  liveEvidence,
  memoryVersion,
  mergeLiveReplyProposals,
} from "../packages/villages/src/server/domain/rules/live-exchange.js";

const stamp = "2026-10-07T00:00:00.000Z";
function line(id: string, extra: Partial<VenueLine> = {}): VenueLine {
  return { id, speakerId: "a", name: "Ada", role: "assistant", content: id, at: stamp, heardBy: ["a", "b"], ...extra };
}
const scene: VenueScene = {
  version: 1,
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
    line("player", { role: "user", speakerId: "player" }),
    line("hidden", { contactHidden: true }),
    line("report", { contactReport: true }),
    line("whisper-away", { kind: "whisper", targetId: "b" }),
    line("whisper-player", { kind: "whisper", targetId: "player" }),
    line("visible"),
  ],
  heardHistory: [],
  submissions: [],
  memories: null,
  recap: "This recap does not confer evidence authority.",
};
const proposals = bindLiveProposals({ earlierLineIds: ["earlier"] }, "player", [
  "hidden",
  "report",
  "whisper-away",
  "whisper-player",
  "visible",
  "absent",
]);
const evidence = liveEvidence(scene, proposals);
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

const memory: VillageChronicleEntry = {
  id: "memory",
  dayIndex: 1,
  clock: "morning",
  occurredAt: stamp,
  timePrecision: "exact",
  scope: "village",
  actors: [],
  kind: "chat",
  text: "Ada promised to bring bread.",
  knownByCharacterIds: ["a", "b"],
};
const version = memoryVersion(memory);
assert.equal(version.length, 64);
assert.equal(
  memoryVersion({ ...memory, dayIndex: 2, occurredAt: "later", sourceLineIds: ["display-context"] }),
  version,
);
for (const change of [
  { id: "different-memory" },
  { text: "Ada promised to bring milk." },
  { knownByCharacterIds: ["a"] },
  { supersededBy: "replacement" },
  { lastReinforcedAt: "later" },
])
  assert.notEqual(
    memoryVersion({ ...memory, ...change }),
    version,
    "Material corrections must invalidate a saved memory version.",
  );

const rawMemory = [{ kind: "not-yet-validated", evidence: ["player", 0] }];
const rawRelationship = { changes: [{ lineIds: ["player", 0, "earlier"] }], permissions: [], disclosures: [] };
const earlier = ["earlier"];
const versions = { memory: version };
const replyIds = ["reply"];
const bound = bindLiveProposals(
  { memoryChanges: rawMemory, relationshipChanges: rawRelationship, earlierLineIds: earlier, memoryVersions: versions },
  "player",
  replyIds,
);
assert.equal(bound.memoryChanges, rawMemory);
assert.equal(bound.relationshipChanges, rawRelationship);
assert.equal(bound.earlierLineIds, earlier);
assert.equal(bound.memoryVersions, versions);
assert.equal(bound.replyLineIds, replyIds);
assert.equal(bound.version, 1, "Binding must preserve metadata for the later authoritative processors to validate.");

const merged = mergeLiveReplyProposals(
  {
    memoryChanges: rawMemory,
    relationshipChanges: rawRelationship,
    earlierLineIds: ["earlier", "shared"],
    memoryVersions: { memory: "old" },
  },
  {
    memoryChanges: [{ evidence: ["player", 0, 2, "earlier"] }],
    relationshipChanges: { changes: [{ lineIds: ["player", 1, "shared"] }], permissions: [], disclosures: [] },
    earlierLineIds: ["shared", "other"],
    memoryVersions: { memory: version, other: "other-version" },
  },
  4,
);
assert.deepEqual(merged.memoryChanges, [rawMemory[0], { evidence: [3, 4, 6, "earlier"] }]);
assert.deepEqual(merged.relationshipChanges.changes, [rawRelationship.changes[0], { lineIds: [3, 5, "shared"] }]);
assert.deepEqual(merged.earlierLineIds, ["earlier", "shared", "other"]);
assert.deepEqual(merged.memoryVersions, { memory: version, other: "other-version" });
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
