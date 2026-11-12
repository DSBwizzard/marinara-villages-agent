import assert from "node:assert/strict";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  captureSceneContinuity,
  sceneLocationContext,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  fittedNarrationReadset,
  narrationContinuityContext,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { currentScenePrompt, scenePromptPacket } from "./fixtures/villages-scene-writing.fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";

const at = "2026-10-23T12:00:00.000Z";
const card = readVillagerCard({
  id: "mari",
  data: {
    name: "Mari",
    scenario: "Mari is already seated beside the player in the booth.",
    description: "A tutor.",
    personality: "Direct.",
  },
} as any);
const world = coerceVillageState({
  ...defaultVillageState(),
  seed: "location-regression",
  setupAt: at,
  foundedAt: at,
  villagers: [
    {
      characterId: "mari",
      incarnation: "mari-one",
      letterFontId: "caveat",
      addedAt: at,
      cardSnapshot: snapshotFromCard(card, 1),
    },
    {
      characterId: "hidden",
      incarnation: "hidden-one",
      letterFontId: "caveat",
      addedAt: at,
      cardSnapshot: { id: "hidden", name: "HIDDEN OCCUPANT", revision: 1, capturedAt: at, sourceStatus: "available" },
    },
  ],
  venues: [
    venueFixture({
      id: "nook",
      name: "Booth Nook",
      classes: ["residence"],
      residentIds: ["mari"],
      zones: [
        {
          ...defaultVenueSpace("residence"),
          id: "exterior",
          name: "Entrance",
          kind: "exterior",
          seen: true,
          connectedTo: ["bar"],
        },
        {
          ...defaultVenueSpace("residence"),
          id: "bar",
          name: "Prompt Bar",
          kind: "shared-residence",
          seen: true,
          connectedTo: ["exterior", "secret-room"],
        },
        {
          ...defaultVenueSpace("residence"),
          id: "secret-room",
          name: "HIDDEN ROOM NAME",
          kind: "private-residence",
          ownerId: "mari",
          seen: false,
          connectedTo: ["bar"],
        },
      ],
    }),
  ],
});
const venue = world.venues[0];
const scene = coerceSession({
  version: 5,
  id: "location",
  villageSeed: world.seed,
  placeId: venue.id,
  placeName: venue.name,
  status: "active",
  startedAt: at,
  area: "shared",
  zoneId: "bar",
  participants: [{ characterId: "mari", name: "Mari", doing: "Talking" }],
  activeIds: [],
  sceneAttendance: {
    capturedAt: at,
    layout: captureSceneLayout(venue),
    occupants: [
      { characterId: "mari", name: "Mari", doing: "Talking", zoneId: "exterior" },
      { characterId: "hidden", name: "HIDDEN OCCUPANT", doing: "HIDDEN ACTIVITY", zoneId: "secret-room" },
    ],
  },
  lines: [
    {
      id: "old",
      role: "assistant",
      speakerId: "__venue_scene__",
      kind: "narration",
      content: "Mari slides the sketch across the booth table between you.",
      heardBy: [],
      at,
    },
  ],
  submissions: [],
});
scene.contactGeneration = {
  zoneEvents: true,
  venue,
  instruction: "",
  localIds: [],
  remoteIds: ["mari"],
  actorIds: ["mari"],
};
const before = structuredClone(scene);
const remote = sceneLocationContext(scene, venue, ["mari"]);
assert.deepEqual(remote.player.zone, { id: "bar", name: "Prompt Bar", kind: "shared-residence" });
assert.deepEqual(remote.residents, [
  {
    characterId: "mari",
    name: "Mari",
    location: "adjacent Zone, apart from player",
    zone: { id: "exterior", name: "Entrance", kind: "exterior" },
  },
]);
assert.doesNotMatch(JSON.stringify(remote), /HIDDEN|secret-room|hidden/);
assert.deepEqual(scene, before, "building writing context never repairs or rewrites saved positions");

const moved = coerceSession({
  ...scene,
  activeIds: ["mari"],
  accompanying: [{ characterId: "mari", zoneId: "bar" }],
});
assert.equal(sceneLocationContext(moved, venue, ["mari"]).residents[0].location, "with player");
assert.equal(sceneLocationContext(moved, venue, ["mari"]).residents[0].zone?.id, moved.zoneId);
const reloaded = coerceSession(structuredClone(moved));
assert.deepEqual(sceneLocationContext(reloaded, venue, ["mari"]), sceneLocationContext(moved, venue, ["mari"]));

const privateScene = coerceSession({
  ...scene,
  accompanying: [{ characterId: "mari", zoneId: "secret-room" }],
});
const privateContext = sceneLocationContext(privateScene, venue, ["mari"]);
assert.equal(privateContext.residents[0].location, "adjacent Zone, apart from player");
assert.equal(privateContext.residents[0].zone, undefined, "an unseen occupied Zone's identity stays private");
assert.doesNotMatch(JSON.stringify(privateContext), /HIDDEN|secret-room/);
assert.equal(sceneLocationContext({ ...scene, departedIds: ["mari"] }, venue, ["mari"]).residents.length, 0);
const changedVenue = structuredClone(venue);
changedVenue.zones![0].name = "LATER RENAMED ROOM";
changedVenue.zones![1].connectedTo = [];
assert.deepEqual(
  sceneLocationContext(scene, changedVenue, ["mari"]),
  remote,
  "captured Scene layout outranks later background changes",
);

const input = '"Why not come join me here?"';
const marker = '{"location":';
for (const mode of ["greet", "chat", "leave"] as const) {
  const prompt = await currentScenePrompt(world, card, mode, mode === "greet" ? "" : input, scene);
  assert.deepEqual(scenePromptPacket(prompt, "location").location, remote);
  assert.ok(
    prompt.indexOf(marker) > prompt.indexOf(card.scenario),
    "current physical authority follows card scenarios",
  );
  assert(
    !prompt.includes(scene.lines[0].content),
    "A loose saved line without an accepted episode supplies no historical evidence",
  );
  assert.doesNotMatch(prompt, /HIDDEN OCCUPANT|HIDDEN ACTIVITY/);
  assert.doesNotMatch(JSON.stringify(scenePromptPacket(prompt, "location").location), /HIDDEN ROOM NAME/);
}
for (const context of [
  { ...scene, zoneId: "exterior", area: "outside" as const, activeIds: ["mari"] },
  moved,
  privateScene,
]) {
  const prompt = await currentScenePrompt(world, card, "chat", input, {
    ...context,
    contactGeneration: scene.contactGeneration,
  });
  assert.deepEqual(
    scenePromptPacket(prompt, "location").location,
    sceneLocationContext(context, venue, ["mari"]),
    "the actual writer refreshes positions on arrival and movement, in the current GM context",
  );
}
const empty = {
  ...scene,
  zoneId: "exterior",
  area: "outside" as const,
  activeIds: [],
  participants: [],
  sceneAttendance: { ...scene.sceneAttendance!, occupants: [] },
  lines: [{ ...scene.lines[0], content: 'A message appears on the laptop: "one minute".' }],
  contactGeneration: { ...scene.contactGeneration!, localIds: [], remoteIds: [], actorIds: [] },
};
for (const mode of ["greet", "chat", "leave"] as const) {
  const prompt = await currentScenePrompt(world, card, mode, mode === "greet" ? "" : '"Mari?"', empty);
  assert.deepEqual(scenePromptPacket(prompt, "location").location.residents, []);
  assert(!prompt.includes(card.description), "an absent resident's profile cannot supply an invented response");
  assert.doesNotMatch(prompt, /HIDDEN ROOM NAME|HIDDEN OCCUPANT|HIDDEN ACTIVITY/);
}
console.log(
  "Scene writing locations match captured/current positions across doorway contact, movement and reload without revealing unseen rooms or occupants (provider-free).",
);

{
  const history = zoneEventScene({ ...moved, id: "earlier-visit", lines: [], contactGeneration: undefined }, venue);
  history.continuity = captureSceneContinuity(world, history, Date.parse(at));
  const witnessed = "Moonflower tea tastes bitter to me.";
  const submitted = witnessed + " I privately think about my favorite blend.";
  const context = narrationContinuityContext(world, history, venue, "earlier-turn", submitted, at);
  const readset = fittedNarrationReadset(
    world,
    context,
    context.parts.map((part) => part.block.evidenceId!),
  );
  const raw = {
    segments: [{ kind: "dialogue", speakerId: "mari", text: "I'll steep the next pot differently." }],
    keep: [
      {
        for: ["mari"],
        class: "information",
        text: "The player says moonflower tea tastes bitter.",
        source: [{ input: witnessed, ground: { kind: "spoken", to: ["mari"] } }],
      },
    ],
  };
  const accepted = acceptNarration(world, { raw, readset, responseDigest: memoryHash(raw) }, "earlier-submission", at);
  assert.equal(accepted.held, false, JSON.stringify(accepted.rejected));
  const before = memoryHash(world.episodes);
  const fact = await currentScenePrompt(world, card, "chat", "Which moonflower tea did I dislike?", scene);
  assert(fact.includes("The player says moonflower tea tastes bitter."));
  assert(!fact.includes(submitted));
  const prompt = await currentScenePrompt(world, card, "chat", "Quote what I said about moonflower tea.", scene);
  const interaction = scenePromptPacket(prompt, "interaction").interaction;
  assert.equal(interaction.gmPrivateInput, submitted);
  assert.deepEqual(
    interaction.groundedInput.map(({ for: holder, text }: { for: string; text: string }) => [holder, text]).sort(),
    [
      ["mari", witnessed],
      ["player", witnessed],
    ],
  );
  assert.equal(memoryHash(world.episodes), before, "Retrieval never rewrites saved evidence");
}
