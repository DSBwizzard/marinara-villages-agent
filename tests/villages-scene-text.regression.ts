// Test cases: scene-text/order, scene-text/private-witnesses, scene-text/rejection
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { lineStagingCues } from "../packages/villages/src/shared/helpers/scene-staging.js";
import { completeSceneObject } from "../packages/villages/src/server/domain/rules/scene-writing-contract.js";
import { readNarrationReply } from "../packages/villages/src/server/domain/rules/narration-contract.js";
import { narrationLines } from "../packages/villages/src/server/domain/rules/narration-lines.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { venueFixture } from "./helpers/venues.fixture.js";
const actors = ["reserved", "outgoing", "bystander"],
  venue = venueFixture({ id: "home", name: "Home" });
const people = actors.map((characterId) => ({ characterId, name: characterId, doing: "Talking", zoneId: "common" }));
const scene = zoneEventScene(
  coerceSession({
    version: 5,
    id: "text",
    villageSeed: "text-world",
    placeId: venue.id,
    zoneId: "common",
    status: "active",
    startedAt: "2026-11-09T12:00:00.000Z",
    participants: people,
    activeIds: actors,
    sceneAttendance: { capturedAt: "2026-11-09T12:00:00.000Z", layout: captureSceneLayout(venue), occupants: people },
  }),
  venue,
);
const route = (segments: unknown[]) =>
  narrationLines(readNarrationReply({ segments }, actors), scene, "text-episode", scene.startedAt, []).lines;
await runCase("scene-text/order", () => {
  const parsed = completeSceneObject(
    JSON.stringify({
      segments: [
        { kind: "narration", text: "She moves the chair." },
        { kind: "dialogue", speakerId: "reserved", text: 'I called it "mine".' },
        { kind: "dialogue", speakerId: "reserved", text: "Want a seat?" },
      ],
    }),
    "stop",
  );
  const lines = narrationLines(readNarrationReply(parsed, actors), scene, "mixed", scene.startedAt, []).lines;
  assert.deepEqual(
    lines.map((line) => line.kind),
    ["narration", "dialogue", "dialogue"],
  );
  assert.equal(lines[1].content, 'I called it "mine".');
  assert.equal(
    completeSceneObject(
      '{"segments":[{"kind":"dialogue","speakerId":"reserved","text":"Hello." She turns. "Again."}]}',
      "stop",
    ),
    null,
  );
});
await runCase("scene-text/private-witnesses", () => {
  const whisper = route([
    { kind: "dialogue", speakerId: "reserved", text: "An answer." },
    { kind: "dialogue", speakerId: "reserved", delivery: "whisper", targetId: "outgoing", text: "A private aside." },
  ])[1];
  assert.equal(whisper.kind, "whisper");
  assert.equal(whisper.targetId, "outgoing");
  assert(whisper.heardBy.includes("reserved") && whisper.heardBy.includes("outgoing"));
  assert(!whisper.heardBy.includes("bystander") && !whisper.heardBy.includes("player"));
  const toPlayer = route([
    { kind: "dialogue", speakerId: "reserved", delivery: "whisper", targetId: "player", text: "Just between us." },
  ])[0];
  assert.equal(toPlayer.kind, "whisper");
  assert.equal(toPlayer.targetId, "player");
  assert(toPlayer.heardBy.includes("player") && !toPlayer.heardBy.includes("bystander"));
  assert.deepEqual(lineStagingCues(toPlayer), [{ characterId: "reserved", look: { target: "player" } }]);
});
await runCase("scene-text/rejection", () => {
  for (const reply of [
    { segments: [{ kind: "dialogue", speakerId: "player", text: "Invented consent." }] },
    {
      segments: [
        { kind: "dialogue", speakerId: "reserved", delivery: "whisper", targetId: "unknown", text: "Private." },
      ],
    },
    { heardPlayerBy: ["reserved"], segments: [] },
    { segments: [{ kind: "dialogue", speakerId: "reserved", text: "Invented audience.", heardBy: ["bystander"] }] },
    { lines: [{ speakerId: "reserved", text: "Retired response" }] },
  ])
    assert.throws(
      () => readNarrationReply(reply, actors),
      "untrusted speech/audience metadata cannot enter the current reply",
    );
});
