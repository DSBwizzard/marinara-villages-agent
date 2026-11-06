import type { VenueReplyLine } from "../packages/villages/src/server/domain/models/scene-model.js";
import type { ContactMove } from "../packages/villages/src/server/domain/rules/venue-contact.js";
import { heardLines } from "../packages/villages/src/server/domain/rules/scene-record.js";
import { applyResidentMovementTimeline } from "../packages/villages/src/server/domain/rules/resident-movement.js";
import {
  routeZoneEvents,
  zoneEventReply,
  zoneEventScene,
} from "../packages/villages/src/server/domain/rules/zone-events.js";
import type { VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { bindSceneMemorySuggestion } from "../packages/villages/src/server/domain/rules/scene-memories.js";
import assert from "node:assert/strict";
import {
  contactNeighborIds,
  materializeConnections,
  connectionProblem,
  applyConnectionEdits,
} from "../packages/villages/src/shared/helpers/zone-contact.js";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { captureSceneLayout, sceneLayoutVenue } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { parseFoundingVenueSuggestions } from "../packages/villages/src/server/domain/rules/founding-draft-rules.js";
import { readBaseVenueLayout } from "../packages/villages/src/server/domain/rules/venue-layout.js";
import { parseVenueReply } from "../packages/villages/src/server/domain/rules/scene-reply.js";

const zone = (id: string, kind: string, links: string[]) => ({
  ...defaultVenueSpace("other"),
  id,
  kind,
  name: id,
  seen: id === "exterior",
  connectedTo: links,
});
const layout: any = [
  zone("exterior", "exterior", ["kitchen"]),
  zone("bedroom", "restricted", ["kitchen"]),
  zone("kitchen", "public", ["exterior", "bedroom"]),
];
assert.equal(connectionProblem(layout), "");
assert.deepEqual(contactNeighborIds(layout, "exterior"), ["kitchen"]);
for (const spaces of [
  [zone("exterior", "exterior", ["private"]), zone("private", "restricted", ["exterior"])],
  [
    zone("exterior", "exterior", ["a", "b"]),
    zone("a", "restricted", ["exterior"]),
    zone("b", "restricted", ["exterior"]),
  ],
])
  assert.equal(connectionProblem(spaces), "");
for (const links of [["missing"], ["exterior"], ["kitchen", "kitchen"], []]) {
  const broken = structuredClone(layout);
  broken[0].connectedTo = links;
  if (!links.length) broken[2].connectedTo = ["bedroom"];
  assert.notEqual(connectionProblem(broken), "");
}
const privacyChanged = layout.map((entry: any) => ({
  ...entry,
  kind: entry.kind === "public" ? "restricted" : entry.kind,
}));
assert.deepEqual(
  contactNeighborIds(privacyChanged, "exterior"),
  ["kitchen"],
  "access never changes physical placement",
);
const draft = layout.map(({ connectedTo: _links, ...entry }: any) => entry);
assert.deepEqual(contactNeighborIds(draft, "exterior"), [], "Reading missing connections never invents passages");
assert.notEqual(connectionProblem(draft), "");
const initialized = materializeConnections(draft);
assert.deepEqual(
  initialized.map((entry: any) => entry.connectedTo),
  [["kitchen"], ["kitchen"], ["exterior", "bedroom"]],
);
assert.equal(connectionProblem(initialized), "");
assert.deepEqual(materializeConnections(initialized), initialized);
const disconnected = layout.map((entry: any) => ({ ...entry, connectedTo: [] }));
assert.deepEqual(materializeConnections(disconnected), disconnected, "An explicit empty graph stays empty");
assert.notEqual(connectionProblem(disconnected), "");
const rewired = applyConnectionEdits(layout, [
  { ...layout[0], connectedTo: ["bedroom"] },
  { ...layout[1], connectedTo: ["exterior", "kitchen"] },
]);
assert.deepEqual(contactNeighborIds(rewired, "exterior"), ["bedroom"]);

const world = defaultVillageState();
world.venues = [
  venueFixture({
    id: "house",
    name: "House",
    layoutVersion: 1,
    classes: ["other"],
    description: "Outside",
    form: "A building",
    category: "",
    spaces: [],
    residentIds: [],
    workerIds: [],
    improvements: [null, null],
    residenceCapacity: 1,
    capabilities: [],
    state: { revision: 0, updatedAt: "", recent: null },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    presentation: { image: null, x: 0, y: 0 },
    zones: layout,
  }),
] as any;
const village = coerceVillageState(world),
  venue = village.venues[0];
const missingGraph = structuredClone(world);
for (const entry of missingGraph.venues[0].zones!) delete entry.connectedTo;
const beforeMissingGraph = JSON.stringify(missingGraph);
assert.throws(() => coerceVillageState(missingGraph), /explicit connections/);
assert.equal(JSON.stringify(missingGraph), beforeMissingGraph);

const base: any = {
  version: 4,
  id: "s",
  placeId: "house",
  zoneId: "exterior",
  area: "outside",
  status: "active",
  sceneRevision: 1,
  activeIds: ["local", "sleeper"],
  participants: [
    { characterId: "local", name: "Local", doing: "Talking" },
    { characterId: "near", name: "Near", doing: "Cooking" },
    { characterId: "far", name: "Far", doing: "Reading" },
    { characterId: "sleeper", name: "Sleeper", doing: "Sleeping" },
  ],
  lines: [],
  submissions: [],
  sceneAttendance: {
    capturedAt: "2026-10-15T00:00:00Z",
    layout: captureSceneLayout(venue),
    occupants: [
      { characterId: "local", name: "Local", doing: "Talking", zoneId: "exterior" },
      { characterId: "sleeper", name: "Sleeper", doing: "Sleeping", zoneId: "exterior" },
      { characterId: "near", name: "Near", doing: "Cooking", zoneId: "kitchen" },
      { characterId: "far", name: "Far", doing: "Reading", zoneId: "bedroom" },
    ],
  },
};
const missingCapturedGraph = structuredClone(base);
for (const entry of missingCapturedGraph.sceneAttendance.layout) delete entry.connectedTo;
const beforeMissingCapturedGraph = JSON.stringify(missingCapturedGraph);
assert.throws(() => coerceSession(missingCapturedGraph), /invalid connection map/);
assert.equal(JSON.stringify(missingCapturedGraph), beforeMissingCapturedGraph);
const scene = coerceSession(base);
const changedVenue = {
  ...venue,
  zones: venue.zones?.map((entry) => ({
    ...entry,
    connectedTo: entry.id === "exterior" ? ["bedroom"] : entry.id === "bedroom" ? ["exterior", "kitchen"] : ["bedroom"],
  })),
};
assert.deepEqual(contactNeighborIds(sceneLayoutVenue(changedVenue, scene).zones!, "exterior"), ["kitchen"]);
const suggestion: any = {
  id: "house",
  name: "House",
  form: "Small building",
  description: "An entrance",
  layout: "private",
  commonName: "",
  commonDescription: "",
  privateName: "Room",
  privatePurpose: "Rest",
  privateDescription: "A quiet room.",
  connections: [["exterior", "private:base"]],
};
assert.equal(
  parseFoundingVenueSuggestions({ venues: [suggestion] }, ["house"], undefined, true)[0].connections?.length,
  1,
);
assert.throws(
  () =>
    parseFoundingVenueSuggestions({ venues: [{ ...suggestion, connections: undefined }] }, ["house"], undefined, true),
  /explicit/,
);
assert.throws(() =>
  parseFoundingVenueSuggestions(
    { venues: [{ ...suggestion, connections: [["exterior", "missing"]] }] },
    ["house"],
    undefined,
    true,
  ),
);
const privateLayout = readBaseVenueLayout(
  {
    layout: "private",
    description: "Entrance",
    privateSpaces: [
      {
        id: "a",
        name: "A",
        venueClass: "other",
        description: "A",
        controllerIds: ["player"],
        connectedTo: ["exterior"],
      },
      {
        id: "b",
        name: "B",
        venueClass: "other",
        description: "B",
        controllerIds: ["player"],
        connectedTo: ["exterior"],
      },
    ],
  },
  ["other"],
  "",
  () => null,
);
assert.deepEqual(contactNeighborIds(privateLayout, "exterior"), ["a", "b"]);
assert(!JSON.stringify(publicSceneResponse(scene)).includes("sceneAttendance"));
// A known resident's offscreen recollection remains private even after they have been introduced.
const publicMemory = publicSceneResponse({
  ...scene,
  participants: [...scene.participants],
  lines: [{ id: "secret", contactHidden: true, content: "SECRET WORDS" }],
  submissions: [
    {
      mode: "chat",

      recollections: [
        { text: "SECRET WORDS", subjectCharacterIds: ["near"], knownByCharacterIds: ["near"], lineIds: ["secret"] },
      ],
    },
  ],
} as any);
assert(!JSON.stringify(publicMemory).includes("SECRET WORDS"));

const privateRecords = publicSceneResponse({
  ...scene,
  submissions: [{ mode: "chat", zoneEventsVersion: 1, heardPlayerBy: ["local"] }],
  lines: [{ id: "visible", content: "Hi", heardBy: ["local", "near"] }],
} as any);
assert(!JSON.stringify(privateRecords).includes("heardBy"));
assert(!JSON.stringify(privateRecords).includes("heardPlayerBy"));
assert(!JSON.stringify(privateRecords).includes("heardHistory"));

function routed(
  segments: unknown[],
  context: VenueScene = zoneEventScene(scene, venue),
  moves: ContactMove[] = [],
  message = "",
) {
  const raw = {
    segments,
    wishChanges: [],
    memoryChanges: [],
    relationshipChanges: { changes: [], permissions: [], disclosures: [] },
  };
  const parsed = parseVenueReply(zoneEventReply(raw, message), ["local", "sleeper", "near", "far", "player"]);
  routeZoneEvents(raw, context, parsed, moves);
  applyResidentMovementTimeline(context, venue, parsed.lines, moves);
  return parsed;
}
const frozen = routed(
  [{ kind: "dialogue", speakerId: "local", text: "A raised warning.", delivery: "shout" }],
  zoneEventScene(scene, changedVenue),
);
assert.deepEqual(frozen.lines[0].heardBy, ["local", "sleeper", "near"], "hearing follows the captured graph");
assert.deepEqual(frozen.lines[0].soundOnly?.characterIds, ["far"]);
const sound = {
  kind: "narration",
  text: "SECRET LOCAL CAUSE. A crash rings out.",
  sound: { sourceId: "local", text: "A crash.", loud: true },
};
const localSound = routed([sound]);
assert.equal(localSound.lines.length, 1, "sound shares its source line and never shifts citations");
assert.deepEqual(localSound.lines[0].heardBy, ["local", "sleeper"]);
assert.deepEqual(localSound.lines[0].soundOnly?.characterIds, ["near", "far"]);
const stored = (lines: VenueReplyLine[]) =>
  lines.map((line, index) => ({
    ...line,
    id: "noise-" + index,
    name: "",
    at: "",
    role: line.role ?? ("assistant" as const),
  }));
const history = { ...scene, lines: stored(localSound.lines) };
assert.equal(heardLines(history, "far")[0].content, "A crash.");
assert.ok(!JSON.stringify(heardLines(history, "far")).includes("SECRET LOCAL CAUSE"));
const empty = coerceSession({
  ...base,
  activeIds: [],
  sceneAttendance: {
    ...base.sceneAttendance,
    occupants: base.sceneAttendance.occupants.filter((row: any) => row.zoneId !== "exterior"),
  },
});
const emptySound = routed(
  [{ kind: "narration", text: "A stone cracks.", sound: { sourceId: "player", text: "A crack." } }],
  zoneEventScene(empty, venue),
);
assert.deepEqual(emptySound.lines[0].heardBy, []);
assert.deepEqual(emptySound.lines[0].soundOnly?.characterIds, ["near"]);
for (const cue of [
  { sourceId: "unknown", text: "A crash." },
  { sourceId: "local", text: "x".repeat(301) },
])
  assert.throws(() => routed([{ ...sound, sound: cue }]), /invalid narrated sound/);
const remote = routed([{ kind: "dialogue", speakerId: "far", text: "SECRET OFFSCREEN WORDS", delivery: "shout" }]);
assert.equal(remote.lines[0].contactHidden, true);
assert.equal(remote.lines[0].soundOnly?.player, true);
assert.ok(
  !JSON.stringify(publicSceneResponse({ ...scene, lines: stored(remote.lines) })).includes("SECRET OFFSCREEN WORDS"),
);
const message = "CODE RED";
const shouted = routed(
  [{ kind: "dialogue", speakerId: "player", text: message, delivery: "shout" }],
  undefined,
  [],
  message,
);
assert.ok(!shouted.lines[0].heardBy.includes("far"));
const noise = shouted.lines[0].soundOnly!.text;
assert.throws(
  () =>
    bindSceneMemorySuggestion(
      {
        action: "create",
        kind: "information",
        text: message,
        subjects: [],
        learners: { far: { basis: "observation", support: [{ lineId: 0, excerpt: noise }] } },
        screening: { disposition: "clear", protectedRoots: [], fingerprint: "unused" },
      },
      {
        source: { kind: "scene", id: "noise", revision: 1, fingerprint: "a".repeat(64) },
        operationId: "noise",
        proposalId: "noise",
        collectionRevision: 0,
        lines: stored(shouted.lines),
        playerLineId: "",
        replyLineIds: ["noise-0"],
        residentIds: ["far"],
      },
    ),
  /Sound alone/,
  "sound cannot teach private words",
);
const moves: ContactMove[] = [
  {
    characterId: "far",
    zoneId: "exterior",
    segment: 1,
    path: ["bedroom", "kitchen", "exterior"],
    quote: "Far crosses into the entrance.",
  },
];
const arrival = routed(
  [
    { kind: "dialogue", speakerId: "player", text: message, delivery: "shout" },
    { kind: "narration", text: moves[0].quote },
    { kind: "dialogue", speakerId: "far", text: "I just arrived." },
  ],
  undefined,
  moves,
  message,
);
assert.ok(!arrival.lines[0].heardBy.includes("far"), "later arrival cannot hear earlier words");
assert.ok(arrival.lines[0].soundOnly?.characterIds.includes("far"));
assert.ok(arrival.lines[1].physicalIdsAfter?.includes("far"));
assert.ok(arrival.lines[2].heardBy.includes("far"));
console.log("Native sound reach, captured topology, private evidence, movement timing and Founding validation passed.");
