import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { publishRelationshipDisclosures } from "../packages/villages/src/server/domain/rules/relationship-memories.js";
import { projectRelationshipProfiles } from "../packages/villages/src/server/domain/rules/relationship-knowledge.js";
import {
  emptyRelationshipReview,
  parseRelationshipReview,
} from "../packages/villages/src/server/domain/rules/relationship-review.js";
import { applyMemoryProposal } from "../packages/villages/src/server/domain/rules/memory-application.js";
import { memoryProposal, targetOf } from "./helpers/memories-fixture.js";
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

// Home and work are player-heard, self-attributed claims, not live occupancy.
const places = fixture();
const home = { ...row, id: "home", fromId: "a", toId: "a", kind: "home" as const, text: "I live at the Mill." };
const homeLine = { ...lines[0]!, content: home.text };
publishRelationshipDisclosures(places, [home], source, [homeLine], at, readAt);
assert.deepEqual(projectRelationshipProfiles(places.relationshipContext!, places)[0]!.knownPlaces, [
  { kind: "home", text: home.text, at },
]);
assert.deepEqual(projectRelationshipProfiles(places.relationshipContext!, places)[1]!.knownPlaces, []);
const otherHome = { ...home, id: "other-home", text: "I live at the Harbor." };
publishRelationshipDisclosures(
  places,
  [otherHome],
  { ...source, id: "another-turn" },
  [{ ...homeLine, content: otherHome.text }],
  readAt,
  readAt,
);
assert.equal(
  projectRelationshipProfiles(places.relationshipContext!, places)[0]!.knownPlaces!.length,
  2,
  "Independent claims do not silently overwrite each other",
);
const homeRecord = places.memories.records[0]!;
correctVillageMemory(
  places,
  {
    operationId: "correct-home",
    action: "repair",
    expectedCollectionRevision: places.memories.revision,
    target: { id: homeRecord.id, revision: homeRecord.revision, rootRevision: homeRecord.revision },
    knowers: ["player"],
    text: "I used to live at the Mill.",
  },
  readAt,
);
assert.deepEqual(
  projectRelationshipProfiles(places.relationshipContext!, places)[0]!.knownPlaces!.map((item) => item.text),
  [otherHome.text],
  "A manual correction cannot reuse the old category",
);
assert.ok(
  projectRelationshipProfiles(places.relationshipContext!, places)[0]!.learned.some(
    (item) => item.text === "I used to live at the Mill.",
  ),
);
const otherRecord = places.memories.records[1]!;
forgetVillageMemory(
  places,
  {
    operationId: "forget-home",
    action: "forget",
    expectedCollectionRevision: places.memories.revision,
    target: { id: otherRecord.id, revision: otherRecord.revision, rootRevision: otherRecord.revision },
    knowers: ["player"],
  },
  readAt,
);
assert.deepEqual(projectRelationshipProfiles(places.relationshipContext!, places)[0]!.knownPlaces, []);
publishRelationshipDisclosures(
  places,
  [otherHome],
  { ...source, id: "another-turn" },
  [{ ...homeLine, content: otherHome.text }],
  readAt,
  readAt,
);
assert.deepEqual(
  projectRelationshipProfiles(places.relationshipContext!, places)[0]!.knownPlaces,
  [],
  "Replay does not restore forgotten information",
);
const privatePlace = fixture();
assert.throws(() =>
  publishRelationshipDisclosures(
    privatePlace,
    [home],
    source,
    [{ ...homeLine, playerHeard: false, heardBy: ["a"] }],
    at,
    readAt,
  ),
);
assert.deepEqual(projectRelationshipProfiles(privatePlace.relationshipContext!, privatePlace)[0]!.knownPlaces, []);
const thirdParty = { ...home, toId: "b" };
assert.throws(() =>
  parseRelationshipReview(
    { ...emptyRelationshipReview(), disclosures: [thirdParty] },
    source.id,
    [homeLine],
    privatePlace,
  ),
);
publishRelationshipDisclosures(privatePlace, [thirdParty], source, [homeLine], at, readAt);
assert.equal(
  privatePlace.memories.records.length,
  0,
  "Stored or direct third-party disclosures cannot bypass the self-subject rule",
);

const spoofed = fixture();
publishRelationshipDisclosures(spoofed, [home], source, [homeLine], at, readAt);
spoofed.memories.records[0]!.knowers.player!.basis = "observation";
delete spoofed.memories.records[0]!.knowers.player!.attributedTo;
assert.deepEqual(
  projectRelationshipProfiles(spoofed.relationshipContext!, spoofed)[0]!.knownPlaces,
  [],
  "Generic observations cannot impersonate a self-report",
);

for (const keepCategory of [true, false]) {
  const linked = fixture();
  publishRelationshipDisclosures(linked, [home], source, [homeLine], at, readAt);
  const root = linked.memories.records[0]!;
  const correction = memoryProposal(linked.memories, {
    audience: ["player"],
    text: "I moved to the Harbor.",
    patch: {
      action: "correct",
      target: targetOf(linked.memories),
      kind: "information",
      subjects: ["a"],
      domainRef: root.domainRef,
    },
  });
  correction.proposal.learners.player!.attributedTo = "a";
  if (keepCategory) correction.proposal.learners.player!.disclosed = { kind: "home", toId: "a" };
  linked.memories = applyMemoryProposal(linked.memories, correction.proposal, correction.context).collection;
  assert.deepEqual(
    projectRelationshipProfiles(linked.relationshipContext!, linked)[0]!.knownPlaces!.map((item) => item.text),
    keepCategory ? ["I moved to the Harbor."] : [],
    "Linked corrections replace the old root and use only their own category",
  );
}
