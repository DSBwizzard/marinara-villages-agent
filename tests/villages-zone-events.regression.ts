import assert from "node:assert/strict";
import { venueFixture } from "./helpers/venues.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { readNarrationReply } from "../packages/villages/src/server/domain/rules/narration-contract.js";
import { narrationLines } from "../packages/villages/src/server/domain/rules/narration-lines.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { zoneEventHearingContext, zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";

const at = "2026-10-15T12:00:00Z";
const world = defaultVillageState();
world.seed = "zone-events";
world.foundedAt = world.setupAt = at;
world.venues = [
  venueFixture({
    id: "house",
    name: "House",
    classes: ["other"],
    zones: [
      { ...defaultVenueSpace("other"), id: "exterior", kind: "exterior", name: "Exterior", connectedTo: ["hall"] },
      { ...defaultVenueSpace("other"), id: "hall", kind: "public", name: "Hall", connectedTo: ["exterior", "bedroom"] },
      { ...defaultVenueSpace("other"), id: "bedroom", kind: "restricted", name: "Bedroom", connectedTo: ["hall"] },
    ],
  }),
] as typeof world.venues;
const village = coerceVillageState(world);
const venue = village.venues[0];
const base = coerceSession({
  version: 5,
  id: "events",
  villageSeed: world.seed,
  placeId: "house",
  placeName: "House",
  area: "outside",
  zoneId: "exterior",
  status: "active",
  startedAt: at,
  lastActivityAt: at,
  activeIds: ["local"],
  participants: [{ characterId: "local", name: "local", doing: "Talking" }],
  sceneAttendance: {
    capturedAt: at,
    layout: captureSceneLayout(venue),
    occupants: [
      { characterId: "local", name: "local", doing: "Talking", zoneId: "exterior" },
      { characterId: "near", name: "near", doing: "Cooking", zoneId: "hall" },
      { characterId: "far", name: "far", doing: "Reading", zoneId: "bedroom" },
    ],
  },
  lines: [],
  submissions: [],
});
const direct = zoneEventScene(base, venue);
const scene = zoneEventScene(base, venue, { targetId: "near" });
scene.contactGeneration!.hearing = undefined;
scene.contactGeneration!.actorIds!.push("far");

function routed(segments: unknown[], context = scene) {
  const reply = readNarrationReply({ segments }, context.contactGeneration!.actorIds!);
  return narrationLines(reply, context, "episode-zone-events", at, []);
}

const chain = structuredClone(venue);
chain.zones!.find((zone) => zone.id === "bedroom")!.connectedTo!.push("attic");
chain.zones!.push({
  ...defaultVenueSpace("other"),
  id: "attic",
  kind: "public",
  name: "Attic",
  connectedTo: ["bedroom"],
});
const extended = structuredClone(base);
extended.sceneAttendance!.layout = captureSceneLayout(chain);
extended.sceneAttendance!.occupants.push({
  characterId: "veryFar",
  name: "Distant resident",
  doing: "Reading",
  zoneId: "attic",
});
const distant = zoneEventScene(extended, chain, { targetId: "veryFar" });
distant.contactGeneration!.hearing = undefined;
distant.contactGeneration!.actorIds!.push("near", "far", "veryFar");
const ordinary = routed([{ kind: "dialogue", speakerId: "local", text: "PRIVATE ORDINARY WORDS" }], distant).lines[0];
assert.deepEqual(ordinary.heardBy, ["local", "player"]);
assert.deepEqual(ordinary.soundOnly?.characterIds, ["near"]);
assert(!ordinary.soundOnly?.text.includes("PRIVATE"));
const shout = routed([{ kind: "dialogue", speakerId: "local", text: "Watch out!", delivery: "shout" }], distant)
  .lines[0];
assert.deepEqual(shout.heardBy, ["local", "near", "player"]);
assert.deepEqual(shout.soundOnly?.characterIds, ["far"]);
const crash = (sourceId: string) => ({
  kind: "narration",
  text: "A crash rings out.",
  sound: { sourceId, text: "A crash.", loud: true },
});
assert.deepEqual(routed([crash("local")], distant).lines[0].soundOnly?.characterIds, ["near", "far"]);
assert.throws(() => routed([crash("veryFar")], distant), /outside hearing range/);
assert.equal(
  publicSceneResponse(
    routed([{ kind: "dialogue", speakerId: "veryFar", text: "Too far to hear.", delivery: "shout" }], distant).lines,
  ).length,
  0,
);
const called = zoneEventScene(base, venue, { targetId: "near" });
assert.deepEqual(direct.contactGeneration!.actorIds, ["local"], "Ordinary turns only offer the local cast");
assert.deepEqual(called.contactGeneration!.remoteIds, ["near"], "Direct contact admits the neighboring actor");
assert.deepEqual(
  zoneEventScene(base, venue, { message: "Local, you said Near was cooking." }).contactGeneration!.actorIds,
  ["local"],
);
for (const message of [
  "Near, what is cooking?",
  "Hello, Near!",
  "I ask Near what is cooking.",
  "I call out to Near.",
]) {
  assert.deepEqual(zoneEventScene(base, venue, { message }).contactGeneration!.remoteIds, ["near"]);
}
assert.deepEqual(
  zoneEventScene(base, venue, { message: "I tell Near's sister about the soup." }).contactGeneration!.remoteIds,
  [],
);
assert.deepEqual(zoneEventScene(base, venue, { message: "I shout, ‘Help!’" }).contactGeneration!.remoteIds, ["near"]);
assert.deepEqual(zoneEventScene(extended, chain, { targetId: "veryFar" }).contactGeneration!.remoteIds, []);
const quiet = routed([{ kind: "dialogue", speakerId: "local", text: "Private local words." }], direct).lines[0];
assert.deepEqual(quiet.heardBy, ["local", "player"]);
assert.equal(quiet.soundOnly, undefined);
const call = routed([{ kind: "dialogue", speakerId: "local", text: "Come here!", delivery: "shout" }], direct).lines[0];
assert.deepEqual(call.heardBy, ["local", "near", "player"]);
assert.equal(call.soundOnly, undefined);
assert.throws(() => routed([crash("local")], direct), /invalid narrated sound/);
const reach = zoneEventHearingContext(called, chain);
assert.match(reach, /"across":\["near"\]/);
assert.doesNotMatch(reach, /bedroom|exterior|hall|attic/, "hearing context omits hidden room identities");

for (const delivery of [undefined, "whisper", "shout"] as const) {
  for (const presentation of [undefined, "aside"] as const) {
    const { lines, labels } = routed([
      {
        kind: "dialogue",
        speakerId: "local",
        id: "reply",
        text: "A reply.",
        delivery,
        presentation,
        ...(delivery === "whisper" ? { targetId: "player" } : {}),
      },
      { kind: "narration", id: "main", text: "Water moves below." },
    ]);
    assert.equal(lines[0].id, labels.reply);
    assert.equal(lines[0].delivery, delivery);
    assert.equal(lines[0].presentation, presentation);
    assert.equal(lines[0].asideFor, presentation === "aside" || delivery === "whisper" ? labels.main : undefined);
    assert.deepEqual(lines[0].heardBy, delivery === "shout" ? ["local", "near", "player"] : ["local", "player"]);
    assert.equal(lines[0].soundOnly?.characterIds.includes("far") ?? false, delivery === "shout");
    const restored = coerceSession({ ...base, lines });
    assert.deepEqual(restored.lines, lines);
  }
}
const whisper = {
  kind: "dialogue",
  speakerId: "local",
  text: "Quietly.",
  delivery: "whisper",
  presentation: "aside",
  targetId: "player",
};
assert.equal(routed([whisper]).lines[0].presentation, "main", "an isolated audible aside remains readable");
assert.throws(() => routed([{ ...whisper, targetId: undefined }]), /whisper needs its actual target/);
assert.throws(() => routed([{ ...whisper, targetId: "near" }]), /same Zone/);
assert.throws(() => routed([{ ...whisper, speakerId: "player" }]), /cannot invent/);
assert.throws(() => readNarrationReply({ lines: [] }, ["local"]));
for (const invalid of [
  { kind: "sound", speakerId: "local", text: "Retired sound." },
  { speakerId: "local", text: "Missing required kind." },
  { kind: "dialogue", speakerId: "local", text: "Legacy loud alias.", loud: true },
  { kind: "narration", text: "Legacy flag.", soundEvent: true },
  { ...crash("local"), text: "" },
  { ...crash("local"), sound: null },
  { ...crash("local"), sound: { sourceId: "local", text: "A click.", loud: "true" } },
  { ...whisper, sound: { sourceId: "local", text: "A click." } },
])
  assert.throws(() => routed([invalid]));

const overheard = routed([
  { kind: "dialogue", speakerId: "near", text: "PRIVATE NEARBY WORDS" },
  {
    kind: "dialogue",
    speakerId: "far",
    text: "PRIVATE DISTANT WORDS",
    delivery: "shout",
    staging: [{ characterId: "far", position: "center" }],
  },
  { kind: "dialogue", speakerId: "near", text: "I'm here.", delivery: "shout" },
]);
assert.equal(overheard.lines[0].contactHidden, true);
assert.equal(overheard.lines[1].contactHidden, true);
assert.equal(overheard.lines[2].viaDoorway, true);
assert(!overheard.lines[2].contactHidden);
assert.deepEqual(overheard.lines[1].staging, []);
const restored = coerceSession({ ...base, lines: overheard.lines });
const publicView = publicSceneResponse(restored.lines);
assert.doesNotMatch(JSON.stringify(publicView), /PRIVATE|soundOnly|heardBy|"far"/);
assert.match(publicView[0].content, /indistinct/i);
assert.equal(publicView[1].id, restored.lines[1].id);

const prose = "Local sets the cup on the railing with a clink and nudges it toward you.";
const cue = "A cup clinks against a hard surface.";
const embedded = routed([
  { kind: "narration", id: "clink", text: prose, sound: { sourceId: "local", text: cue } },
  { kind: "dialogue", speakerId: "local", text: "Did you hear that?" },
]);
const persisted = coerceSession({ ...base, lines: embedded.lines }).lines;
assert.equal(persisted.length, 2);
assert.equal(persisted[0].id, embedded.labels.clink);
assert.equal(persisted[0].content, prose);
assert.deepEqual(persisted[0].heardBy, ["local", "player"]);
assert.deepEqual(persisted[0].soundOnly, { characterIds: ["near"], player: false, text: cue });
const visible = JSON.stringify(publicSceneResponse(persisted));
assert(visible.includes(prose));
assert(!visible.includes(cue), "routing text is not a duplicate public paragraph");
assert.doesNotMatch(visible, /sourceId|soundOnly/);

const crowded = structuredClone(base);
for (let index = 0; index < 12; index++)
  crowded.sceneAttendance!.occupants.push({
    characterId: "offstage" + index,
    name: "Offstage " + index,
    doing: "Reading",
    zoneId: "hall",
  });
const bounded = zoneEventScene(crowded, venue);
assert(bounded.contactGeneration!.actorIds!.length <= 4);
assert(
  zoneEventScene(crowded, venue, { message: "Offstage 11, help!" }).contactGeneration!.remoteIds.includes("offstage11"),
);
assert.equal(zoneEventScene(crowded, venue, { targetId: "offstage7" }).contactGeneration!.remoteIds[0], "offstage7");
const broadcast = routed([{ kind: "dialogue", speakerId: "local", text: "Watch out!", delivery: "shout" }], bounded);
assert.equal(broadcast.lines[0].heardBy.length, 15, "cast limits never limit delivery");
console.log("Zone event routing, private witnesses and captured movement passed.");
