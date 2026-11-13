import assert from "node:assert/strict";
import { fixture as projectFixture } from "./fixtures/villages-projects.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import {
  fittedNarrationReadset,
  narrationContinuityContext,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { applyAcceptedSceneDelta } from "../packages/villages/src/server/domain/rules/scene-delta.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { stagingTranscriptEvents } from "../packages/villages/src/shared/helpers/scene-staging.js";
import { replayStaging } from "./helpers/scene-staging.fixture.js";

const at = "2026-11-09T21:00:00.000Z";
const state = projectFixture().state();
const venue = state.venues[0];
const person = { characterId: "a", name: "a", doing: "Reading" };
const base = coerceSession({
  version: 5,
  id: "doorway",
  villageSeed: state.seed,
  sceneRevision: 1,
  placeId: venue.id,
  zoneId: "exterior",
  status: "active",
  startedAt: at,
  activeIds: [],
  participants: [person],
  sceneAttendance: {
    capturedAt: at,
    layout: captureSceneLayout(venue),
    occupants: [{ ...person, zoneId: "common" }],
  },
});
const arrival = {
  segments: [
    { kind: "dialogue", speakerId: "a", text: "Hold on.", delivery: "shout" },
    { kind: "narration", id: "cross", text: "A steps outside to talk with you.", requires: ["move"] },
    {
      kind: "dialogue",
      speakerId: "a",
      text: "Nice to meet you.",
      staging: [{ characterId: "a", position: "center" }],
    },
  ],
  commands: [
    {
      id: "move",
      type: "move",
      who: "a",
      to: "exterior",
      at: "cross",
      source: [{ segment: "cross", perceive: { kind: "seen", by: ["player"] } }],
    },
  ],
};
function accept(raw: unknown, turn: string, startingScene = base) {
  const scene = zoneEventScene(startingScene, venue, { targetId: "a" });
  const context = narrationContinuityContext(state, scene, venue, "operation-" + turn, "Hello from outside.", at);
  const readset = fittedNarrationReadset(
    state,
    context,
    context.parts.map((part) => part.block.evidenceId!),
  );
  return acceptNarration(state, { raw, readset, responseDigest: memoryHash(raw) }, turn, at);
}
const result = accept(arrival, "arrive");
assert.equal(result.held, false, JSON.stringify(result.rejected));
const lines = result.episode!.segments;
assert.equal(lines[0].viaDoorway, true);
assert.deepEqual(lines[1].physicalIdsAfter, ["a"]);
assert.deepEqual(lines[1].heardBy, ["a", "player"], "arrival at the narration segment determines its witnesses");
assert(!lines[2].viaDoorway);
assert.equal(lines[2].staging?.length ?? 0, 0, "A resident without sprites has no concrete cue");
const reloaded = coerceSession({ ...base, lines });
assert.deepEqual(reloaded.lines[1].physicalIdsAfter, ["a"], "paragraph timing survives reload");
const frames = replayStaging(
  [],
  stagingTranscriptEvents(reloaded.lines, [
    { activeIdsAtTurn: [], activeIdsAfterTurn: ["a"], replyLineIds: reloaded.lines.map((line) => line.id) },
  ]),
);
assert.deepEqual(
  frames.map((frame) => frame.activeIds),
  [[], ["a"], ["a"]],
);

const local = zoneEventScene(reloaded, venue);
applyAcceptedSceneDelta(local, result.episode!);
const leaving = accept(
  {
    segments: [
      { kind: "dialogue", speakerId: "a", text: "I am heading back inside." },
      { kind: "narration", id: "cross", text: "A steps back into the common room.", requires: ["move"] },
      { kind: "narration", text: "You straighten your sleeve outside." },
    ],
    commands: [{ ...arrival.commands[0], to: "common" }],
  },
  "leave",
  local,
);
assert.equal(leaving.held, false, JSON.stringify(leaving.rejected));
assert.deepEqual(leaving.episode!.segments[1].physicalIdsAfter, []);
assert.deepEqual(leaving.episode!.segments[2].heardBy, ["player"], "a departed resident cannot witness later actions");
console.log("Native doorway movement, paragraph staging and witnesses passed.");
