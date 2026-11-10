import assert from "node:assert/strict";
import { fixture, renovation } from "./fixtures/villages-projects.fixture.js";
import { fixtureWish } from "./helpers/social-wishes-fixture.js";
import { addMemory, emptyMemories, memoryRepair, memoryTime } from "./helpers/memories-fixture.js";
import { applyMemoryRepair } from "../packages/villages/src/server/domain/rules/memory-application.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { sceneGmContext } from "../packages/villages/src/server/domain/rules/scene-gm.js";
import { readSceneBoundary } from "../packages/villages/src/server/domain/rules/scene-halt.js";
import { sceneAppointment } from "../packages/villages/src/server/domain/rules/scene-calendar.js";
import { semanticContext } from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import { expandSceneEvents } from "../packages/villages/src/server/domain/rules/scene-event-proposals.js";
import {
  projectSpeechContexts,
  projectSpeechPrompt,
} from "../packages/villages/src/server/domain/rules/project-interpretation.js";

const f = fixture(),
  id = await renovation(f),
  world = f.state();
const scene = coerceSession({
  version: 4,
  semanticVersion: 2,
  id: "context",
  villageSeed: world.seed,
  placeId: "elsewhere",
  startedAt: world.setupAt,
  activeIds: ["a"],
  lines: [],
  submissions: [],
});
const large = fixtureWish({ wish: "Learn glassblowing", reason: "Make a delicate vase" }, "glass");
large.conditions.push({
  id: "condition",
  quote: "Only after Mara agrees to supervise.",
  at: world.setupAt,
  sourceId: "source",
  lineIds: ["line"],
});
large.history = Array.from({ length: 40 }, (_, i) => ({
  id: "event:" + i,
  at: world.setupAt,
  kind: "progress",
  text: "A private account of the kiln trial " + i,
  sourceId: "old:" + i,
  lineIds: ["line:" + i],
}));
world.villagers[0].wishes = [large];
const quiet = semanticContext(scene, world, "Hello.", true),
  compact = sceneGmContext(quiet);
assert.equal(typeof compact.actors[0].wishes[0].evidence, "string");
assert.equal(
  compact.actors[0].wishes[0].wish,
  large.wish,
  "Background desires can still motivate spontaneous initiative",
);
assert(JSON.stringify(compact.actors[0].wishes).length < JSON.stringify(quiet.actors[0].wishes).length / 5);
const proposal = { type: "wish", actorId: "a", targetId: large.id, at: [0], value: { intent: "fulfilled" } };
const wire = {
  input: [],
  segments: [{ kind: "dialogue", speakerId: "a", text: "The vase is finished." }],
  events: [proposal],
};
assert(
  (expandSceneEvents(wire, quiet).wishChanges as any[])[0].rejectedEvent,
  "Summary-only evidence cannot authorize fulfillment",
);
for (const message of [large.id, "glassblowing", "Mara agrees", "kiln trial"]) {
  const relevant = semanticContext(scene, world, message, true),
    model = sceneGmContext(relevant);
  assert.deepEqual((model.actors[0].wishes[0].evidence as any).conditions, [large.conditions[0].quote]);
  assert.equal((model.actors[0].wishes[0].evidence as any).history.length, 40);
  assert.equal((expandSceneEvents(wire, relevant).wishChanges as any[])[0].intent, "fulfilled");
}
large.attention = { state: "foreground", reason: "Ready to try" };
assert.equal(
  semanticContext(scene, world, "Hello.", true)._wishEvidence.length,
  1,
  "Foreground initiative has full evidence without a named prompt",
);

const unrelated = structuredClone(world.projects[0]);
unrelated.id = "unrelated";
unrelated.title = "Observatory dome";
unrelated.venueId = unrelated.lifecycle!.targetVenueId = "hill";
unrelated.participantIds = [];
unrelated.requesterCharacterId = "b";
unrelated.lifecycle!.affectedIds = ["b"];
unrelated.lifecycle!.builderId = "b";
unrelated.lifecycle!.candidates = [];
unrelated.lifecycle!.change!.detail = "Build the silver observatory dome.";
world.projects.push(unrelated);
assert(!projectSpeechContexts(world, ["a"], "", "Hello", "cafe").some((row) => row.projectId === "unrelated"));
for (const args of [
  ["b", "", "Hello", "elsewhere"],
  ["a", "Observatory dome", "Hello", "elsewhere"],
  ["a", "", "unrelated", "elsewhere"],
  ["a", "", "Hello", "hill"],
])
  assert(
    projectSpeechContexts(world, [args[0]], args[1], args[2], args[3]).some((row) => row.projectId === "unrelated"),
  );
const projects = sceneGmContext(semanticContext(scene, world, "Hello", true));
assert(projects.otherProjects.some((row) => row.id === "unrelated"));
assert(!projects.projects.includes("Observatory dome"));
assert.doesNotMatch(
  projectSpeechPrompt(world, [{ projectId: id, revision: 1, phase: "planning" }]),
  /"revision"|exteriorImage|pictureRevision/u,
);

world.memories = addMemory(emptyMemories(), {
  audience: ["a", "player"],
  text: "Aqua reported a brass telescope.",
  patch: { kind: "information" },
});
world.memories = applyMemoryRepair(
  world.memories,
  memoryRepair(world.memories, "repair", ["a"], "The telescope is made of wood."),
  memoryTime(5),
).collection;
const packet = semanticContext(scene, world, "telescope", true),
  memory = sceneGmContext(packet).memory;
assert(
  memory.memories.some(
    (row) => row.text === "The telescope is made of wood." && row.knowers.a?.basis === "player-repaired",
  ),
);
assert(memory.memories.some((row) => row.text === "Aqua reported a brass telescope." && !row.knowers.a));
assert.doesNotMatch(JSON.stringify(memory), /fingerprint|support|reinforcedAt|recordedAt|operationId|sourceRefs/u);
assert(JSON.stringify(memory).length < JSON.stringify(packet.memory).length);
assert.throws(() => coerceVillageState({ ...world, version: 16 }), /fresh Village/u);

const calendar = { date: "2026-12-31", weekday: "Thursday" };
assert.equal(
  sceneAppointment({ source: "player", quote: "Tomorrow", when: { dayOffset: 1 } }, calendar).date,
  "2027-01-01",
);
assert.equal(
  sceneAppointment({ source: "player", quote: "Monday", when: { weekday: "Monday" } }, calendar).date,
  "2027-01-04",
);
assert.equal(
  sceneAppointment(
    { source: "player", quote: "next Thursday", when: { weekday: "Thursday", afterToday: true } },
    calendar,
  ).date,
  "2027-01-07",
);
const appointment = sceneAppointment(
  { source: "player", quote: "Meet today at 01:30", when: { dayOffset: 0 }, minute: 90 },
  { date: "2026-11-01", weekday: "Sunday" },
);
assert.equal(
  readSceneBoundary(
    { reason: "none", appointments: [appointment] },
    { chosenAt: "2026-11-01T09:00:00.000Z", timeZone: "America/Los_Angeles" },
    appointment.quote as string,
    [],
  )?.outcome,
  "halt-appointment",
  "Repeated DST appointments use the existing calendar policy",
);
assert.throws(() => sceneAppointment({ when: { dayOffset: 1, date: "2026-12-31" } }, calendar), /supported day/u);
console.log(
  "Scene context keeps private and repaired knowledge, spontaneous desires, complete consequential evidence and code-derived calendar dates.",
);
