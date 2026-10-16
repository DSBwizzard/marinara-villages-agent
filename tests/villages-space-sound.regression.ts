import assert from "node:assert/strict";
import {
  contactNeighborIds,
  legacyContactNeighborIds,
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
import {
  acousticReach,
  acousticFragment,
  bindAcousticPlan,
} from "../packages/villages/src/server/domain/rules/scene-acoustics.js";
import { applyAcousticWitnesses } from "../packages/villages/src/server/domain/rules/acoustic-witnesses.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coercePendingAttention,
  attentionCheck,
  bindAttentionPlan,
  validAttentionPlan,
} from "../packages/villages/src/server/domain/rules/scene-attention.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { parseFoundingVenueSuggestions } from "../packages/villages/src/server/domain/rules/founding-draft-rules.js";
import { readBaseVenueLayout } from "../packages/villages/src/server/domain/rules/venue-layout.js";
import { acousticInstructions } from "../packages/villages/src/server/features/scenes/acoustic-prompt.js";
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
const older = layout.map(({ connectedTo: _links, ...entry }: any) => entry);
const migrated = materializeConnections(older);
for (const entry of older)
  assert.deepEqual(contactNeighborIds(migrated, entry.id).sort(), legacyContactNeighborIds(older, entry.id).sort());
assert.deepEqual(materializeConnections(migrated), migrated);
const rewired = applyConnectionEdits(layout, [
  { ...layout[0], connectedTo: ["bedroom"] },
  { ...layout[1], connectedTo: ["exterior", "kitchen"] },
]);
assert.deepEqual(contactNeighborIds(rewired, "exterior"), ["bedroom"]);

const world = defaultVillageState();
world.venues = [
  {
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
    state: { condition: "standing", furniture: [], upgrades: [], publicFacts: [], updatedAt: "" },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    presentation: { image: null, x: 0, y: 0 },
    zones: layout,
  },
] as any;
const village = coerceVillageState(world),
  venue = village.venues[0];
const oldWorld = structuredClone(world);
oldWorld.venues[0].zones = older;
const migratedWorld = coerceVillageState(oldWorld);
assert.deepEqual(
  migratedWorld.venues[0].zones?.map((entry) => entry.connectedTo),
  coerceVillageState(migratedWorld).venues[0].zones?.map((entry) => entry.connectedTo),
  "saved migration is stable",
);

const base: any = {
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
const scene = coerceSession(base);
const changedVenue = {
  ...venue,
  zones: venue.zones?.map((entry) => ({
    ...entry,
    connectedTo: entry.id === "exterior" ? ["bedroom"] : entry.id === "bedroom" ? ["exterior", "kitchen"] : ["bedroom"],
  })),
};
assert.deepEqual(
  acousticReach(changedVenue, scene, "exterior", "call", true).words,
  ["kitchen"],
  "active Scene retains captured layout",
);
assert.deepEqual(contactNeighborIds(sceneLayoutVenue(changedVenue, scene).zones!, "exterior"), ["kitchen"]);
assert.deepEqual(acousticReach(venue, scene, "exterior", "ordinary", false), { sound: ["kitchen"], words: [] });
assert.deepEqual(acousticReach(venue, scene, "exterior", "ordinary", true), { sound: ["kitchen"], words: ["kitchen"] });
assert.deepEqual(acousticReach(venue, scene, "exterior", "call", true), { sound: ["kitchen"], words: ["kitchen"] });
assert.deepEqual(acousticReach(venue, scene, "exterior", "shout", true), {
  sound: ["bedroom", "kitchen"],
  words: ["kitchen"],
});
assert.deepEqual(acousticReach(venue, scene, "exterior", "exceptional", true), {
  sound: ["bedroom", "kitchen"],
  words: [],
});

const message = "CODE RED";
const fragment = acousticFragment(
  venue,
  scene,
  { id: "attention:0", start: 0, end: message.length, kind: "speech" },
  "shout",
  true,
);
const plan = bindAcousticPlan({ status: "attention", fragments: [fragment] }, message, venue, scene);
const context: any = {
  ...scene,
  contactGeneration: {
    acoustics: true,
    venue,
    attention: plan,
    localIds: ["local", "sleeper"],
    remoteIds: ["near", "far"],
    instruction: "",
  },
};
const inputWitness = {
  id: "attention:0",
  emitted: true,
  heardBy: ["local", "near", "far"],
  understoodBy: ["local", "near"],
};
const noReply = () => ({ lines: [] as any[], heardPlayerBy: ["local"] });
// Ordinary local dialogue must have one coherent syntax example including the sound contract.
const greeting = '"Hey, good morning. How are you doing? Seems you uh... Had a mornings flight."';
const greetingPrompt = acousticInstructions(
  scene,
  { kind: "call", targetId: "local", boundaryZoneId: "", quote: greeting, attention: plan },
  venue,
);
const illustration = greetingPrompt.split("\n").at(-1)!;
const greetingRaw = JSON.parse(illustration.slice(illustration.indexOf("{")));
const greetingParsed = parseVenueReply(greetingRaw, ["local", "sleeper", "near", "far"]);
applyAcousticWitnesses(greetingRaw, context, greeting, greetingParsed);
assert.equal(greetingParsed.lines[0]?.content, "spoken words");
assert.deepEqual(greetingParsed.lines[0]?.heardBy, ["local"]);
for (const [row, reason] of [
  [{ ...inputWitness, id: "local" }, "fragment-id"],
  [{ ...inputWitness, emitted: undefined }, "fragment-emission"],
  [{ ...inputWitness, emitted: "true" }, "fragment-emission"],
] as const) {
  assert.throws(
    () => applyAcousticWitnesses({ attentionWitnesses: [row] }, context, greeting, noReply()),
    new RegExp(reason),
  );
}
let parsed = noReply();
// Rock impacts need narration evidence even with no local residents and no speech.
const rockMessage = "I throw a rock at another rock";
const rockScene = { ...scene, activeIds: [], participants: [] };
const rockPlan = bindAcousticPlan(
  {
    status: "attention",
    fragments: [
      acousticFragment(
        venue,
        rockScene,
        { id: "attention:0", start: 0, end: rockMessage.length, kind: "sound" },
        "call",
        false,
      ),
    ],
  },
  rockMessage,
  venue,
  rockScene,
);
const rockContext = {
  ...rockScene,
  contactGeneration: { ...context.contactGeneration, localIds: [], remoteIds: ["near", "far"], attention: rockPlan },
};
const rockPrompt = acousticInstructions(
  rockScene,
  { kind: "call", targetId: "", boundaryZoneId: "", quote: rockMessage, attention: rockPlan },
  venue,
);
const rockIllustration = rockPrompt.split("\n").at(-1)!;
const rockRaw = JSON.parse(rockIllustration.slice(rockIllustration.indexOf("{")));
assert.equal(rockRaw.attentionWitnesses[0].emitted, true);
assert.equal(rockRaw.attentionWitnesses[0].segment, 0);
assert.deepEqual(rockRaw.acousticEvents, [], "player impact is not a resident event");
rockRaw.attentionWitnesses[0].heardBy = ["near"];
applyAcousticWitnesses(rockRaw, rockContext, rockMessage, parseVenueReply(rockRaw, ["near", "far"]));
for (const segment of [undefined, "0", 9]) {
  const invalid = { ...rockRaw, attentionWitnesses: [{ ...rockRaw.attentionWitnesses[0], segment }] };
  assert.throws(
    () => applyAcousticWitnesses(invalid, rockContext, rockMessage, parseVenueReply(invalid, ["near", "far"])),
    (error: any) => error.acousticReason === "sound-event-segment" && /Nothing was applied/.test(error.message),
  );
}
for (const localIds of [[], ["local"]]) {
  const mixedScene = { ...scene, activeIds: localIds };
  const mixedPlan = {
    ...plan,
    fragments: [
      rockPlan.fragments[0],
      { ...fragment, id: "attention:1" },
      { ...rockPlan.fragments[0], id: "attention:2" },
    ],
  };
  const mixedPrompt = acousticInstructions(
    mixedScene,
    { kind: "call", targetId: "", boundaryZoneId: "", quote: rockMessage, attention: mixedPlan },
    venue,
  );
  const line = mixedPrompt.split("\n").at(-1)!;
  const mixedRaw = JSON.parse(line.slice(line.indexOf("{")));
  assert.deepEqual(
    mixedRaw.attentionWitnesses.map((row: any) => row.segment),
    [0, undefined, 1],
  );
  if (localIds.length) assert.equal(mixedRaw.acousticReplies[0].segment, 2);
  applyAcousticWitnesses(
    mixedRaw,
    {
      ...context,
      activeIds: localIds,
      contactGeneration: { ...context.contactGeneration, localIds, attention: mixedPlan },
    },
    rockMessage,
    parseVenueReply(mixedRaw, ["local", "sleeper", "near", "far"]),
  );
}
const evidence: any = {
  attentionWitnesses: [inputWitness],
  acousticReplies: [],
  recollections: [{ evidence: ["attention:0"], knownByCharacterIds: ["far"] }],
  memoryChanges: [{ evidence: ["sound:attention:0"], knownByCharacterIds: ["far"] }],
};
applyAcousticWitnesses(evidence, context, message, parsed);
assert.deepEqual(parsed.lines.find((line) => line.content === message).heardBy, ["local", "near"]);
assert(parsed.lines.some((line) => line.kind === "narration" && line.heardBy.includes("far")));
assert(
  !parsed.lines[evidence.recollections[0].evidence[0]].heardBy.includes("far"),
  "noise cannot prove knowledge of words",
);
assert(!parsed.lines[evidence.memoryChanges[0].evidence[0]].content.includes(message));
for (const witness of [
  { ...inputWitness, understoodBy: ["far"] },
  { ...inputWitness, heardBy: ["unknown"] },
  { ...inputWitness, emitted: false },
  { ...inputWitness, heardBy: ["near"], understoodBy: ["local"] },
])
  assert.throws(
    () => applyAcousticWitnesses({ attentionWitnesses: [witness], acousticReplies: [] }, context, message, noReply()),
    /unsupported/,
  );

const speechLines: any[] = [
  { kind: "dialogue", speakerId: "near", content: "A reply from the kitchen.", heardBy: [] },
  { kind: "dialogue", speakerId: "far", content: "SECRET BEDROOM WORDS", heardBy: [] },
];
const replyRows = [
  {
    segment: 0,
    delivery: "ordinary",
    outward: true,
    heardBy: ["near", "far", "local"],
    understoodBy: ["near", "far", "local"],
    playerHeard: true,
    playerUnderstood: true,
  },
  {
    segment: 1,
    delivery: "shout",
    outward: true,
    heardBy: ["near", "far", "local"],
    understoodBy: ["near", "far"],
    playerHeard: true,
    playerUnderstood: false,
  },
];
parsed = { lines: structuredClone(speechLines), heardPlayerBy: ["local"] };
applyAcousticWitnesses({ attentionWitnesses: [inputWitness], acousticReplies: replyRows }, context, message, parsed);
assert(parsed.lines[1].contactHidden);
const generic = parsed.lines.find((line) => line.content.includes("words are indistinct"));
assert(generic && !generic.heardBy.includes("sleeper"), "a sleeper gains no unsupported noise evidence");
const publicResult: any = publicSceneResponse({ ...scene, lines: parsed.lines });
assert(!JSON.stringify(publicResult).includes("SECRET BEDROOM WORDS"));
assert(publicResult.lines.some((line: any) => line.content.includes("words are indistinct")));
assert.throws(
  () =>
    applyAcousticWitnesses(
      {
        attentionWitnesses: [inputWitness],
        acousticReplies: [replyRows[0], { ...replyRows[1], playerUnderstood: true }],
      },
      context,
      message,
      { lines: structuredClone(speechLines), heardPlayerBy: [] },
    ),
  /unsupported/,
);

const silentContext = {
  ...context,
  contactGeneration: {
    ...context.contactGeneration,
    attention: bindAcousticPlan({ status: "local", fragments: [] }, "I think privately.", venue, scene),
  },
};
parsed = {
  lines: [{ kind: "dialogue", speakerId: "local", content: "I call out!", heardBy: [] }],
  heardPlayerBy: ["local"],
};
applyAcousticWitnesses(
  {
    attentionWitnesses: [],
    acousticReplies: [
      {
        segment: 0,
        delivery: "shout",
        outward: true,
        heardBy: ["local", "near", "far"],
        understoodBy: ["local", "near"],
        playerHeard: true,
        playerUnderstood: true,
      },
    ],
  },
  silentContext,
  "I think privately.",
  parsed,
);
assert(
  parsed.lines.some((line) => line.evidenceId === "reply-sound:0" && line.heardBy.includes("far")),
  "NPC sound propagates even when player input made no sound",
);

const gun = acousticFragment(venue, scene, { id: "attention:0", start: 0, end: 8, kind: "sound" }, "exceptional", true);
const gunContext = {
  ...context,
  contactGeneration: {
    ...context.contactGeneration,
    attention: bindAcousticPlan({ status: "attention", fragments: [gun] }, "I fire.", venue, scene),
  },
};
parsed = {
  lines: [{ kind: "narration", speakerId: "__venue_scene__", content: "The attempt fails silently.", heardBy: [] }],
  heardPlayerBy: [],
};
applyAcousticWitnesses(
  { attentionWitnesses: [{ id: "attention:0", emitted: false, heardBy: [], understoodBy: [] }], acousticReplies: [] },
  gunContext,
  "I fire.",
  parsed,
);
assert(!parsed.lines.some((line) => line.attentionEvidence), "failed sound leaves no auditory receipt");
const pendingPlan = bindAcousticPlan(
  { status: "clarify", fragments: [{ ...gun, zoneIds: [], wordZoneIds: [] }], question: "Which surface?" },
  "I knock.",
  venue,
  scene,
);
const pending = coercePendingAttention({
  id: "pending",
  message: "I knock.",
  revision: 1,
  originZoneId: "exterior",
  plan: pendingPlan,
  choices: [{ id: "kitchen", label: "Kitchen" }],
});
assert(pending && validAttentionPlan(pending.plan, "I knock.", venue, scene));
assert(!validAttentionPlan(pending!.plan, "Changed", venue, scene));

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
  connections: [["exterior", "private:base"]],
};
assert.equal(
  parseFoundingVenueSuggestions({ venues: [suggestion] }, ["house"], undefined, false, true)[0].connections?.length,
  1,
);
assert.throws(
  () =>
    parseFoundingVenueSuggestions(
      { venues: [{ ...suggestion, connections: undefined }] },
      ["house"],
      undefined,
      false,
      true,
    ),
  /explicit/,
);
assert.throws(() =>
  parseFoundingVenueSuggestions(
    { venues: [{ ...suggestion, connections: [["exterior", "missing"]] }] },
    ["house"],
    undefined,
    false,
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
console.log(
  "Explicit connections and sound: graph migration, snapshots, privacy-independent topology, sound/word reach, NPC propagation, hidden replies, receipt isolation, failed sounds, saved plans and founding validation passed",
);

// Legacy operations recover their original inferred graph despite later authored links.
for (const version of [undefined, 1, 2, 3, 4]) {
  const oldScene = { ...scene, operation: { kind: "turn", input: { interactionScopeVersion: version } } } as any;
  const oldLayout = sceneLayoutVenue(changedVenue, oldScene);
  assert.deepEqual(contactNeighborIds(oldLayout.zones!, "exterior"), ["kitchen"]);
}
// A known resident's offscreen recollection remains private even after they have been introduced.
const publicMemory = publicSceneResponse({
  ...scene,
  participants: [...scene.participants],
  lines: [{ id: "secret", contactHidden: true, content: "SECRET WORDS" }],
  submissions: [
    {
      attention: plan,
      recollections: [
        { text: "SECRET WORDS", subjectCharacterIds: ["near"], knownByCharacterIds: ["near"], lineIds: ["secret"] },
      ],
    },
  ],
} as any);
assert(!JSON.stringify(publicMemory).includes("SECRET WORDS"));

const npcEvent = {
  lines: [{ kind: "narration", speakerId: "__venue_scene__", content: "Local fires a gun." }],
  heardPlayerBy: [],
} as any;
applyAcousticWitnesses(
  {
    attentionWitnesses: [],
    acousticEvents: [
      {
        segment: 0,
        speakerId: "local",
        delivery: "exceptional",
        emitted: true,
        heardBy: ["local", "near", "far"],
        playerHeard: true,
      },
    ],
  },
  silentContext,
  "I think privately.",
  npcEvent,
);
assert(
  npcEvent.lines.some(
    (line: any) =>
      line.evidenceId === "reply-sound:0" && line.heardBy.includes("far") && !line.content.includes("Local fires"),
  ),
);
const noiseMemory = {
  memoryChanges: [{ text: "CODE RED", evidence: ["sound:attention:0"], knownByCharacterIds: ["far"] }],
  attentionWitnesses: [inputWitness],
  acousticReplies: [],
};
applyAcousticWitnesses(noiseMemory, context, message, noReply());
assert(!noiseMemory.memoryChanges[0].text.includes(message), "a noise-only memory cannot contain the utterance");

for (const version of [2, 3, 4]) {
  const oldScene = { ...scene, operation: { kind: "turn", input: { interactionScopeVersion: version } } } as any;
  const oldVenue = { ...venue, zones: venue.zones!.map((zone) => ({ ...zone, connectedTo: undefined })) };
  assert.deepEqual(
    attentionCheck("Hello", changedVenue, oldScene, version === 2, version === 4),
    attentionCheck("Hello", oldVenue, oldScene, version === 2, version === 4),
    "purchased old check identity ignores new links",
  );
  const saved = bindAttentionPlan({ status: "local", fragments: [] }, "Hello", oldVenue, oldScene, version === 4);
  assert(validAttentionPlan(saved, "Hello", changedVenue, oldScene), "old signed checkpoints still validate");
}

const hiddenEvent = {
  lines: [{ kind: "narration", speakerId: "__venue_scene__", content: "SECRET OFFSCREEN CAUSE" }],
  heardPlayerBy: [],
} as any;
applyAcousticWitnesses(
  {
    attentionWitnesses: [inputWitness],
    acousticEvents: [
      {
        segment: 0,
        speakerId: "far",
        delivery: "exceptional",
        emitted: true,
        heardBy: ["local", "far"],
        playerHeard: true,
      },
    ],
  },
  context,
  message,
  hiddenEvent,
);
assert.deepEqual(hiddenEvent.lines[0].heardBy, [], "noise never proves unseen event narration");
assert(!JSON.stringify(publicSceneResponse({ ...scene, lines: hiddenEvent.lines })).includes("SECRET OFFSCREEN CAUSE"));

assert.deepEqual(
  contactNeighborIds(
    sceneLayoutVenue(changedVenue, { ...scene, operation: { kind: "move", input: { zoneId: "kitchen" } } } as any)
      .zones!,
    "exterior",
  ),
  ["kitchen"],
  "new movement retains the captured explicit graph",
);

const privateRecords = publicSceneResponse({
  ...scene,
  submissions: [{ attention: plan, heardPlayerBy: ["local"] }],
  lines: [{ id: "visible", content: "Hi", heardBy: ["local", "near"] }],
  heardHistory: [{ characterId: "local", lineIds: ["visible"] }],
} as any);
assert(!JSON.stringify(privateRecords).includes("heardBy"));
assert(!JSON.stringify(privateRecords).includes("heardPlayerBy"));
assert(!JSON.stringify(privateRecords).includes("heardHistory"));

// An isolated space has no cross-space routing work and keeps its existing zero-check path.
const { interpretAcoustics } =
  await import("../packages/villages/src/server/features/scenes/acoustic-interpretation.js");
const isolated = { ...venue, zones: [zone("exterior", "exterior", [])] };
assert.equal(
  (
    await interpretAcoustics(
      { ...scene, sceneAttendance: { ...scene.sceneAttendance!, layout: captureSceneLayout(isolated) } },
      isolated,
      "Hello",
    )
  ).status,
  "local",
);

// A different resident moving in the same reply must not turn non-noticers into noise witnesses.
const { applyResidentMovementTimeline } =
  await import("../packages/villages/src/server/domain/rules/resident-movement.js");
const movedNoise = {
  lines: [
    ...structuredClone(speechLines),
    { kind: "narration", speakerId: "__venue_scene__", content: "Local steps into the kitchen.", heardBy: [] },
  ],
  heardPlayerBy: ["local"],
} as any;
const moves = [
  {
    characterId: "local",
    zoneId: "kitchen",
    segment: 2,
    quote: "Local steps into the kitchen.",
    path: ["exterior", "kitchen"],
  },
];
applyAcousticWitnesses(
  { attentionWitnesses: [inputWitness], acousticReplies: replyRows },
  context,
  message,
  movedNoise,
  moves,
);
applyResidentMovementTimeline(context, venue, movedNoise.lines, moves);
assert(
  !movedNoise.lines.find((line: any) => line.content.includes("words are indistinct")).heardBy.includes("sleeper"),
  "movement projection preserves actual sound noticing",
);

assert.throws(
  () =>
    applyAcousticWitnesses(
      {
        attentionWitnesses: [],
        acousticEvents: [
          {
            segment: 0,
            speakerId: "local",
            delivery: "exceptional",
            emitted: true,
            heardBy: ["far"],
            playerHeard: true,
          },
        ],
      },
      silentContext,
      "I think privately.",
      {
        lines: [{ kind: "narration", speakerId: "__venue_scene__", content: "Local leaves and makes a noise." }],
        heardPlayerBy: [],
      },
      [{ ...moves[0], segment: 0 }],
    ),
  /unsupported/,
  "movement and physical sound need distinct ordered segments",
);

// Doorway evidence normalizes only exact whole-input speech, never mixed/private input.
for (const mixed of [false, true]) {
  const text = mixed ? 'I think SECRET. "Hey Fedster!"' : "Hey Fedster!";
  const start = mixed ? text.indexOf("Hey") : 0;
  const f = acousticFragment(
    venue,
    scene,
    { id: "attention:0", start, end: start + 12, kind: "speech" },
    "ordinary",
    true,
  );
  const current = {
    ...context,
    contactGeneration: {
      ...context.contactGeneration,
      attention: bindAcousticPlan({ status: "attention", fragments: [f] }, text, venue, scene),
    },
  };
  const raw: any = {
    attentionWitnesses: [{ id: f.id, emitted: true, heardBy: ["near"], understoodBy: ["near"] }],
    acousticReplies: [
      {
        segment: 1,
        delivery: "ordinary",
        outward: true,
        heardBy: [],
        understoodBy: [],
        playerHeard: true,
        playerUnderstood: true,
      },
    ],
    acousticEvents: [
      { segment: 0, speakerId: "near", delivery: "ordinary", emitted: true, heardBy: ["near"], playerHeard: true },
    ],
    memoryChanges: [{ evidence: ["player", 1], knownByCharacterIds: ["near"] }],
    relationshipChanges: { changes: [{ lineIds: [1] }] },
    roomEvents: [{ evidence: [1] }],
    projectSpeech: [{ citations: [{ segment: 1 }] }],
    interpretationRouting: [{ segments: [1] }],
  };
  const parsed: any = {
    heardPlayerBy: [],
    lines: [
      { kind: "narration", content: "SECRET remote mechanism", speakerId: "__venue_scene__" },
      { kind: "dialogue", content: "Hello!", speakerId: "near" },
      { kind: "side", content: "A local aside", speakerId: "local", heardBy: [], anchorIndex: 1 },
      {
        kind: "whisper",
        content: "A local whisper",
        speakerId: "local",
        targetId: "player",
        heardBy: [],
        anchorIndex: 1,
      },
    ],
  };
  applyAcousticWitnesses(raw, current, text, parsed);
  assert.equal(parsed.lines[0].contactHidden, true);
  assert.deepEqual(parsed.lines[0].heardBy, []);
  assert.equal(parsed.lines[1].content, "A sound is audible.");
  assert.equal(parsed.lines[2].content, "Hello!");
  assert.equal(parsed.lines[3].anchorIndex, 2);
  assert.equal(parsed.lines[4].anchorIndex, 2);
  assert(parsed.lines[2].heardBy.includes("near"), "speaker knows their authored words");
  assert.equal(raw.memoryChanges[0].evidence[1], 2);
  assert.equal(raw.relationshipChanges.changes[0].lineIds[0], 2);
  assert.equal(raw.roomEvents[0].evidence[0], 2);
  assert.equal(raw.projectSpeech[0].citations[0].segment, 2);
  assert.equal(raw.interpretationRouting[0].segments[0], 2);
  const playerRef = raw.memoryChanges[0].evidence[0];
  if (mixed) assert.equal(playerRef, "player", "private/partial input is never promoted to whole-input hearing");
  else assert.equal(parsed.lines[playerRef].content, text);
  const publicLines = (publicSceneResponse({ ...scene, lines: parsed.lines }) as any).lines;
  assert(!JSON.stringify(publicLines).includes("SECRET"));
  assert.equal(publicLines.filter((line: any) => line.content === "A sound is audible.").length, 1);
}
