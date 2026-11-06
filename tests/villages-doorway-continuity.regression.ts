import { venueFixture } from "./helpers/venues.fixture.js";
import assert from "node:assert/strict";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { readContactMoves } from "../packages/villages/src/server/domain/rules/venue-contact.js";
import { applyResidentMovementTimeline } from "../packages/villages/src/server/domain/rules/resident-movement.js";
import { applyAttentionWitnesses } from "../packages/villages/src/server/domain/rules/attention-witnesses.js";
import { stagingTranscriptEvents } from "../packages/villages/src/shared/helpers/scene-staging.js";
import { replayStaging } from "./helpers/scene-staging.fixture.js";
import type { VenueReplyLine } from "../packages/villages/src/server/domain/models/scene-model.js";

const state = defaultVillageState();
state.venues = [
  venueFixture({
    id: "home",
    name: "Home",
    classes: ["residence"],
    residentIds: ["buster", "other"],
    zones: [
      { ...defaultVenueSpace("other"), id: "exterior", name: "Entrance", kind: "exterior", seen: true },
      { ...defaultVenueSpace("residence"), id: "common", name: "Main Room", kind: "shared-residence" },
      {
        ...defaultVenueSpace("residence"),
        id: "private:other",
        name: "Private",
        kind: "private-residence",
        ownerId: "other",
      },
    ],
  }),
] as typeof state.venues;
const village = coerceVillageState(state);
const venue = village.venues[0];
const scene = coerceSession({
  version: 4,
  id: "doorway",
  placeId: "home",
  zoneId: "exterior",
  status: "active",
  memoryMode: "live",
  participants: [{ characterId: "buster", name: "Buster", doing: "Talking" }],
  activeIds: [],
  sceneAttendance: {
    capturedAt: new Date().toISOString(),
    occupants: [{ characterId: "buster", name: "Buster", doing: "Reading", zoneId: "common" }],
  },
  lines: [
    {
      id: "door",
      role: "assistant",
      speakerId: "__venue_scene__",
      kind: "narration",
      content: "Buster opens the door, wearing a t-shirt and sweats.",
      heardBy: [],
    },
    {
      id: "hidden",
      role: "assistant",
      speakerId: "__venue_scene__",
      kind: "narration",
      content: "PRIVATE UNSEEN ROOM",
      heardBy: ["buster"],
      contactHidden: true,
    },
  ],
});
scene.contactGeneration = {
  localIds: [],
  remoteIds: ["buster"],
  instruction: "",
  replyAudiences: { buster: ["buster"] },
};
const lines: VenueReplyLine[] = [
  { kind: "dialogue", speakerId: "buster", content: "Hold on.", heardBy: ["buster"], viaDoorway: true },
  {
    kind: "narration",
    speakerId: "__venue_scene__",
    content: "Buster steps out into the Entrance to talk with you.",
    heardBy: [],
  },
  {
    kind: "dialogue",
    speakerId: "buster",
    content: "Nice to meet you.",
    heardBy: ["buster"],
    viaDoorway: true,
    remoteDelivery: "loud",
    staging: [{ characterId: "buster", position: "center" }],
  },
];
const proposed = [{ characterId: "buster", zoneId: "exterior", segment: 1, quote: lines[1].content }];
const moves = readContactMoves(proposed, lines, village, venue, scene, ["buster"]);
assert.equal(moves.length, 1, "narrated voluntary movement does not need ceremonial spoken consent");
assert.equal(
  readContactMoves(
    [{ characterId: "buster", zoneId: "exterior", quote: "Hold on." }],
    lines,
    village,
    venue,
    scene,
    ["buster"],
    true,
  ).length,
  0,
  "new generations cannot bypass segment timing through the legacy movement shape",
);
for (const invalid of [
  { ...proposed[0], segment: 0 },
  { ...proposed[0], segment: -1 },
  { ...proposed[0], segment: 99 },
  { ...proposed[0], quote: "Buster considers stepping out." },
  { ...proposed[0], characterId: "other" },
  { ...proposed[0], zoneId: "private:other" },
])
  assert.equal(readContactMoves([invalid], lines, village, venue, scene, ["buster"]).length, 0);
assert.equal(readContactMoves([proposed[0], proposed[0]], lines, village, venue, scene, ["buster"]).length, 1);
// Saved qualification reply: intent concerns finishing a thought, not an inter-Zone move.
const savedNoopText =
  "Arun unhooks the garden gate, steps through into the courtyard and lets it swing shut behind him. He rolls a sleeve back down over a damp forearm and settles his weight evenly, the stance he takes when he intends to finish a thought out loud.";
const noopScene = structuredClone(scene);
noopScene.sceneAttendance!.occupants[0].zoneId = "exterior";
const noopLines = [{ ...lines[1], content: savedNoopText }];
const noop = { characterId: "buster", zoneId: "exterior", segment: 0, quote: savedNoopText };
assert.equal(
  readContactMoves([noop], noopLines, village, venue, noopScene, ["buster"], true, true).length,
  0,
  "legacy qualifier behavior remains unchanged",
);
const redundant = readContactMoves([noop], noopLines, village, venue, noopScene, ["buster"], true, "redundant");
assert.equal(redundant.length, 1, "a v3 local annotation is validated before being discarded");
assert.deepEqual(redundant[0].path, ["exterior"]);
for (const invalid of [
  { ...noop, characterId: "unknown" },
  { ...noop, segment: 99 },
  { ...noop, quote: "Unrelated source text" },
  { ...noop, zoneId: "missing" },
  { ...noop, zoneId: "private:other" },
])
  assert.equal(
    readContactMoves([invalid], noopLines, village, venue, noopScene, ["buster"], true, "redundant").length,
    0,
  );
for (const content of [
  "Buster intends to step out into the Entrance.",
  "Buster would step out into the Entrance.",
  "Buster steps out into the Entrance if you agree.",
]) {
  assert.equal(
    readContactMoves(
      [{ ...proposed[0], segment: 0, quote: content }],
      [{ ...lines[1], content }],
      village,
      venue,
      scene,
      ["buster"],
      true,
      "redundant",
    ).length,
    0,
    "real crossings retain hypothetical and conditional guards",
  );
}
assert.equal(
  readContactMoves([proposed[0]], lines, village, venue, scene, ["buster"], true, "redundant").length,
  1,
  "evidenced completed crossings remain available",
);
applyResidentMovementTimeline(scene, venue, lines, moves);
assert.equal(lines[0].viaDoorway, true);
assert.deepEqual(lines[1].physicalIdsAfter, ["buster"]);
assert.deepEqual(lines[1].heardBy, ["buster"], "the actor witnesses his completed movement");
assert.equal(lines[2].viaDoorway, undefined);
assert.equal(lines[2].remoteDelivery, undefined);
assert.equal(lines[2].staging?.length, 1);
const stored = lines.map((line, index) => ({
  ...line,
  id: String(index),
  name: "",
  at: "",
  role: "assistant" as const,
}));
const frames = replayStaging(
  [],
  stagingTranscriptEvents(stored, [
    { activeIdsAtTurn: [], activeIdsAfterTurn: ["buster"], replyLineIds: ["0", "1", "2"] },
  ]),
);
assert.deepEqual(
  frames.map((frame) => frame.activeIds),
  [[], ["buster"], ["buster"]],
);
const reloaded = coerceSession({ version: 4, ...scene, lines: stored });
assert.deepEqual(reloaded.lines[1].physicalIdsAfter, ["buster"], "paragraph timing survives reload");

const localScene = {
  ...scene,
  contactGeneration: undefined,
  activeIds: ["buster"],
  accompanying: [{ characterId: "buster", zoneId: "exterior" }],
};
const leaving: VenueReplyLine[] = [
  { kind: "dialogue", speakerId: "buster", content: "I am heading back inside.", heardBy: ["buster"] },
  {
    kind: "narration",
    speakerId: "__venue_scene__",
    content: "Buster steps back into the Main Room.",
    heardBy: ["buster"],
  },
  {
    kind: "narration",
    speakerId: "__venue_scene__",
    content: "You straighten your sleeve in the Entrance.",
    heardBy: ["buster"],
  },
];
const departure = readContactMoves(
  [{ characterId: "buster", zoneId: "common", segment: 1, quote: leaving[1].content }],
  leaving,
  village,
  venue,
  localScene,
  ["buster"],
);
assert.equal(departure.length, 1);
applyResidentMovementTimeline(localScene, venue, leaving, departure);
assert.deepEqual(leaving[1].physicalIdsAfter, []);
assert.deepEqual(leaving[2].heardBy, [], "a departed resident cannot witness a later local action");

const crowded = {
  ...scene,
  activeIds: ["a", "b", "c", "d"],
  accompanying: ["a", "b", "c", "d"].map((characterId) => ({ characterId, zoneId: "exterior" })),
};
assert.throws(
  () => applyResidentMovementTimeline(crowded, venue, structuredClone(lines), moves),
  /overcrowd/,
  "an arrival is checked at its segment even if someone leaves later",
);
const withBystander = {
  ...localScene,
  activeIds: ["buster", "local"],
  accompanying: ["buster", "local"].map((characterId) => ({ characterId, zoneId: "exterior" })),
  contactGeneration: {
    instruction: "",
    localIds: ["buster", "local"],
    remoteIds: [],
    replyAudiences: { local: ["buster", "local"] },
  },
};
const staleAudience: VenueReplyLine[] = [
  { kind: "narration", speakerId: "__venue_scene__", content: "Buster heads away.", heardBy: ["buster", "local"] },
  { kind: "dialogue", speakerId: "local", content: "A later local conversation.", heardBy: ["buster", "local"] },
];
applyResidentMovementTimeline(withBystander, venue, staleAudience, [
  {
    characterId: "buster",
    zoneId: "private:other",
    segment: 0,
    quote: "Buster heads away.",
    path: ["exterior", "common", "private:other"],
  },
]);
assert.deepEqual(
  staleAudience[1].heardBy,
  ["local"],
  "pre-turn audible audiences cannot keep a departed resident listening through multiple Zones",
);

const first = "City is looking to start some new growth, or at least some interesting new ideas to ramp up tourism.";
const second = "Nice to meet you, I'm LBP.";
const message = `"${first}" I offer my hand. "${second}"`;
const fragments = [first, second].map((text, index) => ({
  id: `attention:${index}`,
  start: message.indexOf(text),
  end: message.indexOf(text) + text.length,
  kind: "speech" as const,
  reach: "directed" as const,
  zoneIds: ["common"],
}));
const plan = { status: "attention" as const, fragments };
scene.contactGeneration.attention = plan;
const parsed = {
  heardPlayerBy: [],
  lines: [
    { kind: "dialogue", speakerId: "buster", content: "Buster. Good to meet you.", heardBy: ["buster"] },
  ] as VenueReplyLine[],
};
const raw = {
  attentionWitnesses: fragments.map((fragment) => ({ id: fragment.id, emitted: true, heardBy: ["buster"] })),
  memoryChanges: [
    {
      learners: {
        buster: {
          support: [
            { lineId: "attention:0", excerpt: first },
            { lineId: "attention:1", excerpt: second },
          ],
        },
      },
    },
  ],
  wishChanges: [{ evidence: ["attention:0"] }],
  relationshipChanges: { changes: [{ lineIds: ["attention:1", 0] }], permissions: [], disclosures: [] },
};
applyAttentionWitnesses(raw, scene, message, parsed);
assert.deepEqual(
  parsed.lines.slice(1).map((line) => line.content),
  [first, second],
);
assert.ok(parsed.lines.slice(1).every((line) => line.heardBy.includes("buster")));
assert.ok(!parsed.lines.slice(1).some((line) => line.content.includes("offer my hand")));
assert.deepEqual(
  raw.memoryChanges[0].learners.buster.support.map((row) => row.lineId),
  [1, 2],
);
assert.deepEqual(raw.wishChanges[0].evidence, [1]);
assert.deepEqual(raw.relationshipChanges.changes[0].lineIds, [2, 0]);
assert.deepEqual(parsed.heardPlayerBy, [], "arrival or remote speech never grants the complete local input");
console.log("Narrator continuity, witnessed speech, resident movement and paragraph staging passed.");
