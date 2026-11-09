import assert from "node:assert/strict";
import { fixture, renovation } from "./fixtures/villages-projects.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { expandSceneEvents } from "../packages/villages/src/server/domain/rules/scene-event-proposals.js";
import { materializeGmReply } from "../packages/villages/src/server/domain/rules/scene-gm.js";
import { semanticContext } from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import { bindSceneMemorySuggestion } from "../packages/villages/src/server/domain/rules/scene-memories.js";
import {
  bindProjectSpeech,
  validateProjectSpeech,
} from "../packages/villages/src/server/domain/rules/project-interpretation.js";
import {
  admitNarrative,
  ensureNarrative,
  readNarrativeDevelopment,
} from "../packages/villages/src/server/domain/rules/narrative-development.js";
import { semanticImmediate } from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import { readProgressInterpretation } from "../packages/villages/src/server/domain/rules/progress-engine.js";
import {
  neutralRelationship,
  defaultRelationshipState,
  relationshipKey,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";

const f = fixture(),
  projectId = await renovation(f),
  world = f.state();
world.relationshipContext = defaultRelationshipState(world.seed);
world.relationshipContext.edges[relationshipKey("a", "player")] = {
  ...neutralRelationship("a", "player"),
  revision: 7,
  concerns: ["Keep this concern"],
};
const scene = coerceSession({
  version: 4,
  semanticVersion: 2,
  id: "event-contract",
  placeId: "cafe",
  placeName: "Cafe",
  zoneId: "common",
  villageSeed: world.seed,
  status: "active",
  startedAt: world.setupAt,
  activeIds: ["a"],
  participants: [{ characterId: "a", name: "Ada" }],
  lines: [],
  submissions: [],
});
const context = semanticContext(scene, world, "Renovate", true, true);
const segments = [
  { kind: "dialogue", speakerId: "a", text: "I approve this exact design and will lead it." },
  { kind: "narration", text: "Ada marks the wooden floor with chalk." },
];
const expand = (events: unknown[], input: unknown[] = []) =>
  expandSceneEvents({ input, segments, events }, context) as any;
const quiet = expand([]);
const gestured = expand(
  [{ type: "move-request", targetId: "exterior", at: ["input:0"], value: { actors: ["a"] } }],
  [{ kind: "action", text: "I gesture for Ada to follow me outside." }],
);
assert.equal(
  (materializeGmReply(gestured, "I gesture for Ada to follow me outside.").immediateResidentMoves as any[])[0].source,
  0,
);
assert.throws(
  () => expand([{ type: "move-request", targetId: "exterior", at: [0], value: { actors: ["a"] } }]),
  /original input/u,
);
assert.deepEqual(quiet.memoryChanges, []);
assert.deepEqual(quiet.projectSpeech, []);
assert.equal(quiet.consistent, undefined);
assert.throws(() => expandSceneEvents({ input: [], segments, memoryChanges: [] }, context), /unsupported contract/u);
for (const field of ["consistent", "playerAgencyViolation", "perceptionViolation"])
  assert.throws(
    () => expandSceneEvents({ input: [], segments, [field]: { segment: 0 } }, context),
    /unsupported contract/u,
  );

const relationship = expand([
  { type: "relationship", actorId: "a", targetId: "player", at: [0], value: { stance: "Reassured" } },
]);
assert.equal(relationship.relationshipChanges.changes[0].expectedRevision, 7);
assert.deepEqual(relationship.relationshipChanges.changes[0].liveAfter.concerns, ["Keep this concern"]);
assert.equal(relationship.relationshipChanges.changes[0].sceneAfter.stance, "Reassured");
const decisions = expand(
  ["approval", "builder"].map((value) => ({ type: "project", targetId: projectId, at: [0], value })),
);
assert.equal(decisions.projectSpeech.length, 2);
assert.equal(decisions.projectSpeech[0].revision, f.get(projectId).lifecycle!.revision);
assert.equal(decisions.projectSpeech[0].citations[0].quote, segments[0].text);
const qualified = "I approve the described design. ".repeat(40) + "ONLY IF the access stays private.";
const longDecision = expandSceneEvents(
  {
    input: [],
    segments: [{ ...segments[0], text: qualified }],
    events: [{ type: "project", targetId: projectId, at: [0], value: "approval" }],
  },
  context,
) as any;
const fullSource = [{ id: "long-source", speakerId: "a", content: qualified, kind: "dialogue" }];
const longBound = bindProjectSpeech(longDecision.projectSpeech, context._projectContexts, fullSource);
assert.equal(longBound[0].citations[0].quote, qualified, "A qualification after character 1200 survives persistence");
assert.equal(validateProjectSpeech(longBound[0], fullSource), "");
const citations = Array.from({ length: 8 }, (_, index) => ({
  lineId: String(index),
  quote: index === 7 ? "Only if Mara agrees." : "The complete design term " + index,
}));
assert.deepEqual(
  readProgressInterpretation({ grade: "cited-interpretation", interpretationVersion: 1, citations }).citations,
  citations,
  "Later cited qualifications survive progress persistence",
);
assert.throws(
  () => expandSceneEvents({ input: [], segments: [{ ...segments[0], text: "x".repeat(2001) }] }, context),
  /bounds/u,
);
const departure = expand([{ type: "depart", at: [0] }]);
assert.equal(
  (
    semanticImmediate(departure.events, segments.map((line) => ({ ...line, content: line.text })) as any)
      .departures as any[]
  )[0].quote,
  segments[0].text,
);
for (const type of ["depart", "contact-end", "residence-request", "residence-decision", "venue-request", "scene-end"])
  assert.throws(() => expand([{ type, at: [0, 0] }]), /source count/u);
for (const type of ["residence-request", "residence-decision", "venue-request", "scene-end"])
  assert.throws(
    () =>
      expand([
        { type, at: [0] },
        { type, at: [0] },
      ]),
    /more than one/u,
  );
for (const value of ["conditional", "uncertain"]) {
  const held = expand([{ type: "project", targetId: projectId, at: [0], value }]);
  assert.deepEqual(held.projectSpeech, []);
  assert.equal(held.interpretationRouting[0].relevance, "uncertain");
}
assert.ok(
  expand([{ type: "project", targetId: "unsupplied", at: [0], value: "approval" }]).projectSpeech[0].rejectedEvent,
);
assert.throws(
  () => expand([{ type: "access", targetId: "common", at: [0], value: { outcome: "invite-now", actorId: "b" } }]),
  /unsupported authority/u,
);
const invitation = expand([
  { type: "access", targetId: "common", at: [0], value: { outcome: "invite-now", conditions: ["accompanied"] } },
]);
assert.equal(invitation.access[0].actorId, "a");
assert.equal(invitation.access[0].venueId, "cafe");
assert.deepEqual(invitation.access[0].conditions, ["accompanied"]);
assert.equal(invitation.access[0].duration, "visit");

const physical = expand(
  [
    {
      type: "physical",
      actorId: "player",
      at: [1],
      value: { recent: { text: "A chalk guide marks the floor." }, consent: [{ at: "input:0" }] },
    },
  ],
  [{ kind: "action", text: "I mark the floor." }],
);
assert.equal(physical.action.narration, segments[1].text);
assert.equal(
  physical.action.expectedRevision,
  world.venues[0].zones.find((zone) => zone.id === "common")!.state.revision,
);
assert.deepEqual(physical.action.consent, [{ actorId: "player", segment: "player", quote: "I mark the floor." }]);
assert.equal(materializeGmReply(physical, "I mark the floor.").intent !== undefined, true);
assert.throws(
  () => expand([{ type: "physical", actorId: "a", at: [1], value: { expectedRevision: 999 } }]),
  /unsupported fields/u,
);

const memory = expand([
  {
    type: "memory",
    at: [0],
    value: {
      kind: "information",
      text: "Ada says she approves and will lead.",
      basis: "report",
      knowers: ["a", "player"],
    },
  },
]).memoryChanges[0];
assert.equal(memory.learners.player.attributedTo, "a");
assert.equal(memory.learners.player.support[0].excerpt, segments[0].text);
assert.equal(memory.screening.fingerprint, context._memoryWrite.protection.fingerprint);
const binding = {
  source: { kind: "scene" as const, id: "turn", revision: 1, fingerprint: "a".repeat(64) },
  operationId: "operation",
  proposalId: "proposal",
  collectionRevision: 0,
  lines: [
    {
      id: "canonical",
      kind: "dialogue",
      speakerId: "a",
      role: "assistant" as const,
      content: segments[0].text,
      heardBy: ["a"],
      playerHeard: false,
    },
  ],
  playerLineId: "player-line",
  replyLineIds: ["canonical"],
  residentIds: ["a"],
};
assert.throws(() => bindSceneMemorySuggestion(memory, binding), /unwitnessed/u);
binding.lines[0].playerHeard = true;
assert.equal(Object.keys(bindSceneMemorySuggestion(memory, binding).proposal.learners).length, 2);
const acoustic = {
  id: "private-old",
  role: "assistant",
  kind: "whisper",
  speakerId: "b",
  content: "I approve this Project secretly.",
  heardBy: ["b"],
  contactHidden: true,
  soundOnly: { characterIds: ["a"], player: false, text: "An indistinct voice." },
  at: world.setupAt,
} as const;
context.history = [structuredClone(acoustic) as any];
const notConsent = expand([{ type: "project", targetId: projectId, at: [acoustic.id], value: "approval" }]);
assert.ok(notConsent.projectSpeech[0].rejectedEvent, "Acoustic-only history cannot expand into unheard consent");
const soundMemory = expand([
  {
    type: "memory",
    at: [acoustic.id],
    value: { kind: "experience", text: "An indistinct voice.", basis: "observation", knowers: ["a"] },
  },
]);
assert.equal(soundMemory.memoryChanges[0].learners.a.support[0].excerpt, "An indistinct voice.");
context.history = [
  {
    ...structuredClone(acoustic),
    kind: "dialogue",
    contactHidden: false,
    heardBy: ["a", "b"],
    soundOnly: undefined,
  } as any,
];
assert.ok(
  expand([{ type: "project", targetId: projectId, at: [acoustic.id], value: "approval" }]).projectSpeech[0]
    .rejectedEvent,
);
assert.throws(
  () => expand([{ type: "access", at: [acoustic.id], value: { outcome: "invite-now" } }]),
  /current speech/u,
);
assert.throws(() => expand([{ type: "permission", at: [acoustic.id], value: { action: "grant" } }]), /current speech/u);

const narrative = ensureNarrative(world, world.setupAt);
narrative.conditions.push({
  id: "restricted",
  revision: 2,
  situationId: "storm",
  venueId: "cafe",
  zoneId: "common",
  observation: "Broken glass blocks the floor.",
  restriction: "ordinary-use",
  remedy: "Remove all broken glass.",
  startsAt: world.setupAt,
  endsAt: new Date(Date.parse(world.setupAt) + 600_000).toISOString(),
  clearedAt: null,
});
const grant = admitNarrative(world, world.setupAt, "event-test", "scene", { venueId: "cafe", zoneId: "common" })!;
assert.ok(grant);
const circumstance = {
  type: "circumstance",
  at: [1],
  value: {
    situation: { title: "Glass", summary: "The glass remains." },
    conditions: [{ id: "restricted", observation: "The shards glint in the light." }],
  },
};
const development = (expandSceneEvents({ input: [], segments, events: [circumstance] }, context, grant) as any)
  .narrativeIntroduction.development;
assert.equal(development.conditions[0].restriction, "ordinary-use");
assert.equal(development.conditions[0].remedy, "Remove all broken glass.");
assert.equal(development.conditions[0].endsAt, narrative.conditions[0].endsAt);
assert.equal(readNarrativeDevelopment(development, grant).conditions[0].restriction, "ordinary-use");
assert.throws(
  () => expandSceneEvents({ input: [], segments, events: [circumstance, circumstance] }, context, grant),
  /more than one circumstance/u,
);
console.log(
  "Compact Scene events derive native authority and exact sources while preserving conditional decisions, private learning, action consent and acoustic boundaries.",
);
