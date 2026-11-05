import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  emptyRelationshipReview,
  parseRelationshipReview,
} from "../packages/villages/src/server/domain/rules/relationship-review.js";
import { applyMemoryProposal } from "../packages/villages/src/server/domain/rules/memory-application.js";
import { memoryProposal, targetOf } from "./helpers/memories-fixture.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { projectRelationshipProfiles } from "../packages/villages/src/server/domain/rules/relationship-knowledge.js";
import { publishRelationshipDisclosures } from "../packages/villages/src/server/domain/rules/relationship-memories.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
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
    wishes: [],
  })) as any;
  return state;
}
const state = fixture();
// Compact display is saved player knowledge, independent of private attitudes.
{
  const world = fixture();
  const source = { kind: "scene" as const, id: "bond-source", revision: 1, fingerprint: memoryHash("bond") };
  const speech = {
    id: "bond-line",
    speakerId: "a",
    role: "assistant" as const,
    content: "You're a close friend. I'm comfortable with you.",
    heardBy: ["a", "player"],
    playerHeard: true,
  };
  const disclosure = {
    fromId: "a",
    toId: "player",
    text: speech.content,
    kind: "connection",
    lineIds: [speech.id],
    bond: { connection: "Close friends", condition: "At ease", tone: "steady" },
  };
  const parse = (row: unknown, lines = [speech]) =>
    parseRelationshipReview({ ...emptyRelationshipReview(), disclosures: [row] }, source.id, lines, world).disclosures;
  const parsed = parse(disclosure);
  publishRelationshipDisclosures(world, parsed, source, [speech], at, readAt);
  const profile = () => projectRelationshipProfiles(world.relationshipContext!, world)[0]!;
  assert.deepEqual(profile().bond, { connection: "Close friends", condition: "At ease", tone: "steady" });
  assert.throws(() => parse({ ...disclosure, toId: "b" }), /only the resident/);
  assert.throws(() => parse({ ...disclosure, kind: "boundary" }), /only the resident/);
  assert.throws(() => parse({ ...disclosure, bond: { connection: "Friends", tone: "steady" } }), /expressed condition/);
  assert.throws(() => parse({ ...disclosure, bond: { connection: "x".repeat(61) } }), /60/);
  assert.throws(() => parse(disclosure, [{ ...speech, playerHeard: false }]), /heard by the player/);

  const later = { ...speech, id: "space", content: "I need some space." };
  const laterSource = { ...source, id: "space-source" };
  const space = parseRelationshipReview(
    {
      ...emptyRelationshipReview(),
      disclosures: [
        {
          ...disclosure,
          lineIds: [later.id],
          text: later.content,
          bond: { condition: "Needs space", tone: "strained" },
        },
      ],
    },
    laterSource.id,
    [later],
    world,
  ).disclosures;
  const laterAt = at;
  publishRelationshipDisclosures(world, space, laterSource, [later], laterAt, readAt);
  assert.deepEqual(
    profile().bond,
    { connection: "Close friends", condition: "Needs space", tone: "strained" },
    "Condition-only speech preserves only an already known label",
  );

  const latest = world.memories.records.at(-1)!;
  correctVillageMemory(
    world,
    {
      operationId: "correct-bond",
      action: "repair",
      expectedCollectionRevision: world.memories.revision,
      target: { id: latest.id, revision: latest.revision, rootRevision: latest.revision },
      knowers: ["player"],
      text: "Ada was talking about needing more room at the table.",
    },
    readAt,
  );
  assert.equal(profile().bond, undefined, "Correcting a later source never revives an older visual condition");
  assert.equal(profile().summary, "");
  assert.ok(profile().learned.some((row) => row.text.includes("room at the table")));

  const legacy = { ...speech, id: "legacy", content: "I don't know where we stand." };
  const legacySource = { ...source, id: "legacy-source" };
  const withoutBond = parseRelationshipReview(
    {
      ...emptyRelationshipReview(),
      disclosures: [{ ...disclosure, bond: undefined, lineIds: [legacy.id], text: legacy.content }],
    },
    legacySource.id,
    [legacy],
    world,
  ).disclosures;
  publishRelationshipDisclosures(world, withoutBond, legacySource, [legacy], "2026-10-26T12:02:00.000Z", readAt);
  assert.equal(profile().bond, undefined, "A newer legacy disclosure clears compact prior knowledge");
  assert.equal(profile().summary, legacy.content);

  const forgotten = fixture();
  publishRelationshipDisclosures(forgotten, parsed, source, [speech], at, readAt);
  const target = forgotten.memories.records[0]!;
  forgetVillageMemory(
    forgotten,
    {
      operationId: "forget-bond",
      action: "forget",
      expectedCollectionRevision: forgotten.memories.revision,
      target: { id: target.id, revision: target.revision, rootRevision: target.revision },
      knowers: ["player"],
    },
    readAt,
  );
  assert.equal(projectRelationshipProfiles(forgotten.relationshipContext!, forgotten)[0]!.bond, undefined);
  publishRelationshipDisclosures(forgotten, parsed, source, [speech], at, readAt);
  assert.equal(
    projectRelationshipProfiles(forgotten.relationshipContext!, forgotten)[0]!.bond,
    undefined,
    "Replay cannot restore forgotten display metadata",
  );

  const spoofed = fixture();
  publishRelationshipDisclosures(spoofed, parsed, source, [speech], at, readAt);
  spoofed.memories.records[0]!.knowers.player!.attributedTo = "b";
  assert.equal(
    projectRelationshipProfiles(spoofed.relationshipContext!, spoofed)[0]!.bond,
    undefined,
    "Another speaker's report cannot become the resident's expressed bond",
  );
  assert.equal(
    projectRelationshipProfiles(spoofed.relationshipContext!, spoofed)[0]!.summary,
    "",
    "Fallback prose also requires the resident's own report",
  );
  const unrelated = fixture();
  publishRelationshipDisclosures(unrelated, parsed, source, [speech], at, readAt);
  const otherLine = { ...speech, id: "other-pair", content: "Ben is an old friend." };
  const otherSource = { ...source, id: "other-pair-source" };
  const otherDisclosure = parseRelationshipReview(
    {
      ...emptyRelationshipReview(),
      disclosures: [{ ...disclosure, toId: "b", bond: undefined, text: otherLine.content, lineIds: [otherLine.id] }],
    },
    otherSource.id,
    [otherLine],
    unrelated,
  ).disclosures;
  publishRelationshipDisclosures(unrelated, otherDisclosure, otherSource, [otherLine], at, readAt);
  const otherMemory = unrelated.memories.records.at(-1)!;
  correctVillageMemory(
    unrelated,
    {
      operationId: "correct-other-pair",
      action: "repair",
      expectedCollectionRevision: unrelated.memories.revision,
      target: { id: otherMemory.id, revision: otherMemory.revision, rootRevision: otherMemory.revision },
      knowers: ["player"],
      text: "Ben is a recent acquaintance.",
    },
    readAt,
  );
  assert.deepEqual(
    projectRelationshipProfiles(unrelated.relationshipContext!, unrelated)[0]!.bond,
    { connection: "Close friends", condition: "At ease", tone: "steady" },
    "Correcting a different pair does not erase the known player bond",
  );
}
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
