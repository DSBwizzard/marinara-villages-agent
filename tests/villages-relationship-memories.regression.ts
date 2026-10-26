import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { publishRelationshipDisclosures } from "../packages/villages/src/server/domain/rules/relationship-memories.js";
import { projectRelationshipProfiles } from "../packages/villages/src/server/domain/rules/relationship-knowledge.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import {
  correctVillageMemory,
  forgetVillageMemory,
  reserveMemoryScene,
  sceneMemories,
} from "../packages/villages/src/server/domain/rules/village-memories.js";
const at = "2026-10-26T12:00:00.000Z",
  readAt = "2026-10-26T12:05:00.000Z";
function fixture() {
  const state = defaultVillageState();
  state.seed = "social-memory";
  state.relationshipContext = defaultRelationshipState(state.seed);
  state.villagers = ["a", "b"].map((characterId) => ({
    characterId,
    cardSnapshot: { name: characterId },
    completedWishes: [],
  })) as any;
  return state;
}
const state = fixture();
reserveMemoryScene(state, "source-scene", at);
reserveMemoryScene(state, "other-scene", at);
const source = {
  kind: "scene" as const,
  id: "source-scene:turn",
  sceneId: "source-scene",
  revision: 1,
  fingerprint: memoryHash("source"),
};
const row = {
  id: "relationship-report",
  fromId: "a",
  toId: "b",
  text: "I no longer trust Ben.",
  kind: "explanation" as const,
  lineIds: ["speech"],
};
const lines = [
  {
    id: "speech",
    speakerId: "a",
    role: "assistant" as const,
    content: row.text,
    heardBy: ["a", "player"],
    playerHeard: true,
  },
];
const publish = () => publishRelationshipDisclosures(state, [row], source, lines, at, readAt);
assert.equal(projectRelationshipProfiles(state.relationshipContext!, state)[0]!.learned.length, 0);
publish();
assert.deepEqual(
  Object.keys(state.memories.records[0]!.knowers),
  ["player"],
  "Being described never teaches the subject",
);
assert.equal(state.memories.records[0]!.knowers.player!.attributedTo, "a");
assert.equal(state.memories.records[0]!.occurredAt, at);
assert.equal(state.memories.records[0]!.knowers.player!.learnedAt, readAt);
assert.equal(sceneMemories(state, "source-scene").records.length, 1, "Only the source Scene extends its own learning");
assert.equal(sceneMemories(state, "other-scene").records.length, 0);
const saved = JSON.stringify(state.memories);
publish();
assert.equal(JSON.stringify(state.memories), saved, "Repeated publication reuses the committed Memory outcome");
const record = state.memories.records[0]!;
forgetVillageMemory(
  state,
  {
    operationId: "forget-social",
    action: "forget",
    expectedCollectionRevision: state.memories.revision,
    target: { id: record.id, revision: record.revision, rootRevision: record.revision },
    knowers: ["player"],
  },
  readAt,
);
publish();
assert.equal(state.memories.records.length, 1);
assert.equal(
  projectRelationshipProfiles(state.relationshipContext!, state)[0]!.learned.length,
  0,
  "Replaying a source cannot restore a forgotten notebook entry",
);
assert.equal(
  sceneMemories(state, "source-scene").records[0]!.knowers.player!.forgotten,
  undefined,
  "External Forget preserves the captured Scene",
);
const repaired = fixture();
publishRelationshipDisclosures(repaired, [row], source, lines, at, readAt);
const target = repaired.memories.records[0]!;
correctVillageMemory(
  repaired,
  {
    operationId: "correct-social",
    action: "repair",
    expectedCollectionRevision: repaired.memories.revision,
    target: { id: target.id, revision: target.revision, rootRevision: target.revision },
    knowers: ["player"],
    text: "Ada was uncertain about Ben.",
  },
  readAt,
);
publishRelationshipDisclosures(repaired, [row], source, lines, at, readAt);
assert.equal(
  projectRelationshipProfiles(repaired.relationshipContext!, repaired)[0]!.learned[0]!.text,
  "Ada was uncertain about Ben.",
);
assert.equal(projectRelationshipProfiles(repaired.relationshipContext!, repaired)[0]!.summary, "");
const unicode = fixture();
const long = { ...row, id: "unicode", text: "界".repeat(201) };
publishRelationshipDisclosures(unicode, [long], source, [{ ...lines[0]!, content: long.text }], at, readAt);
assert.equal(unicode.memories.records.length, 0, "Oversized optional learning does not fail social publication");
assert.equal(Object.values(unicode.memoryReceipts)[0]!.status, "rejected");
const longSource = "Unrelated opening. ".repeat(30) + "I prefer quiet visits.";
const quoted = { ...row, id: "long-quoted", text: "Ada prefers quiet visits.", excerpts: ["I prefer quiet visits."] };
publishRelationshipDisclosures(unicode, [quoted], source, [{ ...lines[0]!, content: longSource }], at, readAt);
assert.equal(
  unicode.memories.records[0]!.knowers.player!.support[0]!.excerpt,
  "I prefer quiet visits.",
  "A long source retains its supporting quote rather than unrelated opening prose",
);
const attribution = fixture();
publishRelationshipDisclosures(
  attribution,
  [{ ...row, id: "wrong-speaker", lineIds: ["a", "b"], excerpts: ["I distrust Charlie."] }],
  source,
  [
    { id: "a", speakerId: "a", role: "assistant", content: "Okay.", heardBy: ["player"], playerHeard: true },
    {
      id: "b",
      speakerId: "b",
      role: "assistant",
      content: "I distrust Charlie.",
      heardBy: ["player"],
      playerHeard: true,
    },
  ],
  at,
  readAt,
);
assert.equal(attribution.memories.records.length, 0, "A different speaker’s quote cannot support an attributed report");
assert.equal(Object.values(attribution.memoryReceipts)[0]!.status, "rejected");
console.log(
  "Relationship Memories: witnessed attribution, sparse Scene continuity, Forget/Correct, publication replay and UTF-8 limits passed.",
);
