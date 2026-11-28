// Test cases: scene-text/order, scene-text/inline-aside, scene-text/private-witnesses, scene-text/rejection
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
import { groupSceneMoments } from "../packages/villages/src/shared/helpers/scene-speech.js";
import { decodeTaggedSceneReply } from "../packages/villages/src/server/domain/rules/tagged-scene-reply.js";
import type { NarrationReadset } from "../packages/villages/src/server/domain/models/narration-model.js";
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

  const aside = { kind: "dialogue", speakerId: "reserved", presentation: "aside" };
  const crowded = route([
    { kind: "narration", text: "Everyone gathers at the rail." },
    { ...aside, text: "One." },
    { ...aside, text: "Private.", delivery: "whisper", targetId: "outgoing" },
    { ...aside, text: "Two." },
    { ...aside, text: "Three.", delivery: "whisper", targetId: "player" },
    { ...aside, text: "Four." },
  ]);
  const visible = groupSceneMoments(crowded.filter((line) => line.heardBy.includes("player")));
  assert.deepEqual(
    visible.map(({ asides }) => asides.map((line) => line.content)),
    [["One.", "Two."], ["Four."]],
  );
  assert.equal(visible[1].line.content, "Three.");
  assert.equal(visible[1].line.delivery, "whisper");
  assert.deepEqual(visible[1].line.heardBy.toSorted(), ["player", "reserved"]);
});
await runCase("scene-text/inline-aside", () => {
  const parse = (reply: string) =>
    decodeTaggedSceneReply(reply, {
      source: { scene },
      npcCandidates: [],
      authoritativeSceneBeats: true,
    } as NarrationReadset).value!;
  const privateLine = '[reserved] [whisper outgoing]: "Just us." [aside] "Keep this close."';
  const literal = '[reserved]: "I wrote [aside] in the margin."';
  const cited = '[reserved]: "The rail is oak." [aside] "I know the carpenter."';
  const keep = '[keep]: {"for":["reserved"],"class":"information","text":"The rail is oak.","source":[{"segment":3}]}';
  const result = parse([privateLine, literal, cited, keep].join("\n"));
  const lines = route(result.segments as unknown[]);
  assert.deepEqual(
    lines.map((line) => line.content),
    [
      '"Just us."',
      '"Keep this close."',
      '"I wrote [aside] in the margin."',
      '"The rail is oak." [aside] "I know the carpenter."',
    ],
  );
  assert.equal(lines[1].presentation, "aside");
  assert.deepEqual(lines[1].heardBy.toSorted(), ["outgoing", "reserved"]);
  assert.deepEqual(lines[1].heardBy, lines[0].heardBy);
  assert.deepEqual((result.keep as { source: unknown }[])[0].source, [{ segment: "beat-3" }]);
  assert.equal((result.segments as { id: string }[])[3].id, "beat-3");
  for (const segment of [2, "beat-1-aside"]) {
    const unresolved = keep.replace('"segment":3', '"segment":' + JSON.stringify(segment));
    const reply = parse([cited, unresolved].join("\n"));
    assert.equal((reply.segments as unknown[]).length, 1);
    assert.deepEqual((reply.keep as { source: unknown }[])[0].source, [{ segment }]);
  }

  const next = "[reserved]: The rail is oak.";
  assert.deepEqual(
    route(parse([next, "[reserved] [aside]: I know the carpenter."].join("\n")).segments as unknown[]).map(
      ({ content, presentation }) => [content, presentation],
    ),
    [
      ["The rail is oak.", undefined],
      ["I know the carpenter.", "aside"],
    ],
  );
  assert.equal((parse(Array(24).fill(privateLine).join("\n")).segments as unknown[]).length, 24);
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
