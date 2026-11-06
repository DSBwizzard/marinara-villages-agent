import { movedAttentionContacts } from "../packages/villages/src/server/domain/rules/scene-attention.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import assert from "node:assert/strict";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
const stamp = "2026-10-18T12:00:00.000Z";
const house: any = venueFixture({
  id: "house",
  name: "House",
  classes: ["community", "workplace"],
  description: "The outside.",
  category: "",
  spaces: [defaultVenueSpace("community"), defaultVenueSpace("workplace")],
  layoutVersion: 1,
  presentation: { image: null, x: 0.2, y: 0.3 },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  residentIds: [],
  workerIds: ["faraway"],
  improvements: [null, null],
  residenceCapacity: 1,
  capabilities: [],
  state: {
    revision: 0,
    recent: null,
    updatedAt: stamp,
  },
  zones: [
    { ...defaultVenueSpace("other"), id: "exterior", name: "Exterior", kind: "exterior", seen: true },
    { ...defaultVenueSpace("community"), id: "common", name: "Common Space", kind: "public", seen: true },
    { ...defaultVenueSpace("workplace"), id: "workshop", name: "Workshop", kind: "public", seen: true },
    { ...defaultVenueSpace("workplace", "SECRET OFFICE DETAILS"), id: "office", name: "Secret Office", kind: "staff" },
  ],
});

const routeScene: any = {
  zoneId: "exterior",
  activeIds: ["local"],
  departedIds: [],
  participants: [{ characterId: "listener", name: "Feddy Fastbayer" }],
  sceneAttendance: { occupants: [{ characterId: "listener", zoneId: "common" }] },
  doorwayContacts: [{ characterId: "listener", playerZoneId: "exterior", characterZoneId: "common" }],
  lines: [
    { role: "user", content: "Hello" },
    { role: "assistant", kind: "dialogue", speakerId: "listener", content: "Come in!" },
  ],
};
assert.deepEqual(movedAttentionContacts(house, routeScene, { ...routeScene, zoneId: "common" }), []);
assert.deepEqual(movedAttentionContacts(house, routeScene, { ...routeScene, zoneId: "workshop" }), []);
const local = { ...routeScene, activeIds: ["listener"], zoneId: "common", doorwayContacts: [] };
assert.deepEqual(movedAttentionContacts(house, local, { ...local, zoneId: "exterior" }), [
  { characterId: "listener", playerZoneId: "exterior", characterZoneId: "common", delivery: "voice" },
]);
for (const line of [
  { ...local.lines[1], contactHidden: true },
  { ...local.lines[1], contactReport: true },
  { ...local.lines[1], kind: "narration" },
  { ...local.lines[1], kind: "whisper" },
])
  assert.deepEqual(movedAttentionContacts(house, { ...local, lines: [line] }, { ...local, zoneId: "exterior" }), []);
console.log("Movement retains only witnessed reachable doorway conversations.");
