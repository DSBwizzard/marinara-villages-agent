import assert from "node:assert/strict";
import { fixture, renovation } from "./fixtures/villages-projects.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { sceneAppointment } from "../packages/villages/src/server/domain/rules/scene-calendar.js";
import {
  fittedNarrationReadset,
  narrationContinuityContext,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { projectSpeechContexts } from "../packages/villages/src/server/domain/rules/project-interpretation.js";

const f = fixture();
const id = await renovation(f);
const world = f.state();
const venue = world.venues[0]!;
const at = world.setupAt;
const unrelated = structuredClone(world.projects.find((project) => project.id === id)!);
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

const containsProject = (actors: string[], earlier: string, input: string, place: string) =>
  projectSpeechContexts(world, actors, earlier, input, place).some((row) => row.projectId === unrelated.id);
assert.equal(containsProject(["a"], "", "Hello", venue.id), false);
assert.equal(containsProject(["b"], "", "Hello", "elsewhere"), true);
assert.equal(containsProject(["a"], "Observatory dome", "Hello", "elsewhere"), true);
assert.equal(containsProject(["a"], "", unrelated.id, "elsewhere"), true);
assert.equal(containsProject(["a"], "", "Hello", "hill"), true);

const actor = { characterId: "a", name: "Aqua", doing: "Talking" };
const scene = zoneEventScene(
  coerceSession({
    version: 5,
    id: "context",
    sceneRevision: 1,
    villageSeed: world.seed,
    placeId: venue.id,
    zoneId: "common",
    startedAt: at,
    status: "active",
    participants: [actor],
    activeIds: [actor.characterId],
    sceneAttendance: {
      capturedAt: at,
      layout: captureSceneLayout(venue),
      occupants: [{ ...actor, zoneId: "common" }],
    },
  }),
  venue,
);
const context = (input: string) => narrationContinuityContext(world, scene, venue, "project-context", input, at);
const quiet = context("Hello."),
  relevant = context("Let's discuss the Observatory dome."),
  projectEvidence = "project-context:" + unrelated.id;
assert(!quiet.parts.some(({ block }) => block.evidenceId === projectEvidence || block.text.includes(unrelated.title)));
const part = relevant.parts.find(({ block }) => block.evidenceId === projectEvidence)!;
assert(part.block.text.includes("Build the silver observatory dome."));
assert.doesNotMatch(part.block.text, /"agreements"|"revision"|exteriorImage|pictureRevision/u);
const fitted = fittedNarrationReadset(world, relevant, [projectEvidence]);
assert.equal(fitted.projects[0].projectId, unrelated.id);
assert.equal(fitted.projects[0].revision, unrelated.lifecycle!.revision);
assert.deepEqual(fittedNarrationReadset(world, relevant, []).projects, []);

const calendar = { date: "2026-12-31", weekday: "Thursday" };
assert.equal(sceneAppointment({ when: { dayOffset: 1 } }, calendar).date, "2027-01-01");
assert.equal(sceneAppointment({ when: { weekday: "Monday" } }, calendar).date, "2027-01-04");
assert.equal(sceneAppointment({ when: { weekday: "Thursday", afterToday: true } }, calendar).date, "2027-01-07");
