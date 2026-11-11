import assert from "node:assert/strict";
import { exactInputSpan } from "../packages/villages/src/server/domain/rules/source-span.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { readNarrationReply } from "../packages/villages/src/server/domain/rules/narration-contract.js";
import { narrationLines } from "../packages/villages/src/server/domain/rules/narration-lines.js";
import {
  bindNarrationSource,
  assertNarrationSourceOrder,
  type NarrationSourceContext,
} from "../packages/villages/src/server/domain/rules/narration-sources.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { venueFixture } from "./helpers/venues.fixture.js";

const at = "2026-11-10T12:00:00.000Z";
const venue = venueFixture({ id: "cafe", name: "Cafe", classes: ["community"] });
const actor = { characterId: "resident", name: "Mara", doing: "Reading" };
const scene = zoneEventScene(
  coerceSession({
    version: 5,
    id: "scene",
    villageSeed: "world",
    placeId: venue.id,
    zoneId: "exterior",
    activeIds: ["resident"],
    participants: [actor],
    sceneAttendance: {
      capturedAt: at,
      layout: captureSceneLayout(venue),
      occupants: [{ ...actor, zoneId: "exterior" }],
    },
  }),
  venue,
);
const reply = readNarrationReply(
  {
    segments: [
      { id: "answer", kind: "dialogue", speakerId: "resident", text: "input:0" },
      { id: "crossing", kind: "narration", text: "Mara steps into the café." },
    ],
  },
  ["resident"],
);
const context = (input: string): NarrationSourceContext => ({
  seed: "world",
  operationId: "operation",
  episodeId: "episode",
  input,
  scene,
  venue,
  actors: ["player", "resident"].map((id) => ({ kind: "actor", id, incarnation: id + "-one" })),
  ...narrationLines(reply, scene, "episode", at, [], []),
  historical: {},
  native: {},
  moves: [],
});

for (const [input, quote, occurrence] of [
  ["*I wave.* “Hello.” I think about leaving.", "Hello.", undefined],
  ["No, I will not go.", "No, I will not go.", undefined],
  ["I think “hello” but say “hello”.", "hello", 2],
  ["💬 “café 👩‍🚀” *I smile.*", "café 👩‍🚀", undefined],
] as const) {
  const captured = context(input);
  const ordinary = bindNarrationSource({ input }, captured);
  assert.equal(ordinary.excerpt, input);
  assert.deepEqual(ordinary.perceptions, [], "The complete mixed submission has no implicit resident audience");
  const spoken = bindNarrationSource(
    { input: quote, occurrence, ground: { kind: "spoken", to: ["resident"] } },
    captured,
  );
  assert.equal(input.slice(spoken.range!.start, spoken.range!.end), quote);
  assert.deepEqual(
    spoken.perceptions.map((row) => row.actorId),
    ["resident"],
  );
  assert.equal(captured.lines[0].content, "input:0", "Literal response prose is never a citation");
}

const thought = context("I imagine saying “yes”; I do not say it.");
assert.deepEqual(
  bindNarrationSource({ input: "yes", ground: { kind: "private" } }, thought).perceptions.map((row) => row.actorId),
  ["player"],
);
assert.throws(() => exactInputSpan({ text: "hello" }, "I think “hello” but say “hello”."), /ambiguous/u);
assert.equal(exactInputSpan({ text: "hello", occurrence: 2 }, "hello hello").start, 6);
assert.throws(() => exactInputSpan({ text: "ana" }, "banana"), /ambiguous/);
assert.equal(exactInputSpan({ text: "ana", occurrence: 2 }, "banana").start, 3);
for (const [text, fragment] of [
  ["💬", "\udcac"],
  ["e\u0301", "e"],
  ["👩‍🚀", "👩"],
])
  assert.throws(() => exactInputSpan({ text: fragment }, text), /invalid player source/u);

const movement = context("Quiet thought. *I point inside.* Join me. Stay safe.");
movement.moves = [
  { characterId: "resident", segment: 1, zoneId: venue.zones!.find((zone) => zone.kind === "public")!.id },
];
const indicated = bindNarrationSource(
  { input: "*I point inside.*", ground: { kind: "visible-action", to: ["resident"], at: { before: "crossing" } } },
  movement,
);
const spoken = bindNarrationSource(
  { input: "Join me.", ground: { kind: "spoken", to: ["resident"], at: { before: "crossing" } } },
  movement,
);
assert.equal(indicated.perceptions[0].channel, "sight");
assert.equal(spoken.perceptions[0].channel, "words");
assert.equal(spoken.range!.start, movement.input.indexOf("Join me."));
assert.throws(
  () =>
    bindNarrationSource(
      { input: "Stay safe.", ground: { kind: "spoken", to: ["resident"], at: { after: "crossing" } } },
      movement,
    ),
  /cannot perceive/,
);
const lateThought = bindNarrationSource(
  { input: "Quiet thought.", ground: { kind: "private", at: { after: "crossing" } } },
  movement,
);
assert.throws(() => assertNarrationSourceOrder([lateThought, spoken]), /input order/);
assert.throws(() => readNarrationReply({ input: [{ text: "now" }], segments: reply.segments }, ["resident"]));
