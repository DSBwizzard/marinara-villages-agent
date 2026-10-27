import assert from "node:assert/strict";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { sceneLocationContext } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { currentScenePrompt } from "./fixtures/villages-scene-writing.fixture.js";

const at = "2026-10-23T12:00:00.000Z";
const world = coerceVillageState({
  version: 6,
  ...defaultVillageState(),
  seed: "location-regression",
  venues: [
    {
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
    },
  ],
});
const venue = world.venues[0];
const scene = coerceSession({
  version: 2,
  id: "location",
  villageSeed: world.seed,
  placeId: venue.id,
  placeName: venue.name,
  status: "active",
  startedAt: at,
  area: "shared",
  zoneId: "bar",
  semanticVersion: 2,
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
  version: 2,
  ...scene,
  activeIds: ["mari"],
  accompanying: [{ characterId: "mari", zoneId: "bar" }],
});
assert.equal(sceneLocationContext(moved, venue, ["mari"]).residents[0].location, "with player");
assert.equal(sceneLocationContext(moved, venue, ["mari"]).residents[0].zone?.id, moved.zoneId);
const reloaded = coerceSession(structuredClone(moved));
assert.deepEqual(sceneLocationContext(reloaded, venue, ["mari"]), sceneLocationContext(moved, venue, ["mari"]));

const privateScene = coerceSession({
  version: 2,
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

const card = {
  id: "mari",
  name: "Mari",
  scenario: "Mari is already seated beside the player in the booth.",
  description: "A tutor.",
  personality: "Direct.",
};
const input = '"Why not come join me here?"';
const marker = "Current physical Scene state (server authority, not shared character knowledge): ";
for (const mode of ["greet", "chat", "leave"] as const) {
  const prompt = await currentScenePrompt(world, card, mode, mode === "greet" ? "" : input, scene, {
    interactionScopeVersion: 6,
    writingContractVersion: 3,
    semanticPipelineVersion: 3,
    writingCapabilities: {
      movement: false,
      management: false,
      residences: false,
      residenceDecision: false,
      editApproval: false,
    },
  });
  const frame = prompt.split(marker)[1]?.split("\n")[0];
  assert.ok(frame, "the actual writer receives required location context even without movement metadata");
  assert.deepEqual(JSON.parse(frame), remote);
  assert.ok(
    prompt.indexOf(marker) > prompt.indexOf(card.scenario),
    "current physical authority follows card scenarios",
  );
  if (mode !== "greet")
    assert.ok(
      prompt.indexOf(marker) > prompt.indexOf(scene.lines[0].content),
      "current physical authority follows misleading earlier narration",
    );
  assert.doesNotMatch(prompt, /HIDDEN ROOM NAME|HIDDEN OCCUPANT|HIDDEN ACTIVITY/);
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
    JSON.parse(prompt.split(marker)[1].split("\n")[0]),
    sceneLocationContext(context, venue, ["mari"]),
    "the actual writer refreshes positions on arrival and movement, including legacy writing contracts",
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
  const prompt = await currentScenePrompt(world, card, mode, mode === "greet" ? "" : '"Mari?"', empty, {
    interactionScopeVersion: 6,
    writingContractVersion: 3,
    semanticPipelineVersion: 3,
    writingCapabilities: {
      movement: false,
      management: false,
      residences: false,
      residenceDecision: false,
      editApproval: false,
    },
  });
  assert.deepEqual(JSON.parse(prompt.split(marker)[1].split("\n")[0]).residents, []);
  assert(!prompt.includes(card.description), "an absent resident's profile cannot supply an invented response");
  const guard = prompt.indexOf("No resident is available in the supplied Scene cast.");
  assert(guard > prompt.indexOf(marker), "empty-cast guidance follows the authoritative physical state");
  if (mode !== "greet")
    assert(guard > prompt.indexOf(empty.lines[0].content), "misleading old narration cannot override the empty cast");
  assert.doesNotMatch(prompt, /HIDDEN ROOM NAME|HIDDEN OCCUPANT|HIDDEN ACTIVITY/);
}
console.log(
  "Scene writing locations match captured/current positions across doorway contact, movement and reload without revealing unseen rooms or occupants (provider-free).",
);
