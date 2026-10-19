import { sceneEvidencePerception } from "../packages/villages/src/server/domain/rules/scene-evidence-perception.js";
import assert from "node:assert/strict";
import { normalizeSparseSceneReply } from "../packages/villages/src/server/domain/rules/scene-writing-contract.js";
import { buildVenueResponseContract } from "../packages/villages/src/server/domain/rules/venue-response-contract.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { parseVenueReply } from "../packages/villages/src/server/domain/rules/scene-reply.js";
import {
  zoneEventScene,
  zoneEventReply,
  routeZoneEvents,
  ZONE_EVENT_CONTRACT,
  zoneEventHearingContext,
} from "../packages/villages/src/server/domain/rules/zone-events.js";
import { appendLine, heardLines } from "../packages/villages/src/server/domain/rules/scene-record.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { applyResidentMovementTimeline } from "../packages/villages/src/server/domain/rules/resident-movement.js";
import { liveEvidence } from "../packages/villages/src/server/domain/rules/live-exchange.js";
import { createSceneWriting } from "../packages/villages/src/server/features/scenes/writing-service.js";

const at = "2026-10-15T12:00:00Z";
const world = defaultVillageState();
world.seed = "zone-events";
world.foundedAt = world.setupAt = at;
world.venues = [
  {
    id: "house",
    name: "House",
    classes: ["other"],
    zones: [
      { ...defaultVenueSpace("other"), id: "exterior", kind: "exterior", name: "Exterior", connectedTo: ["hall"] },
      { ...defaultVenueSpace("other"), id: "hall", kind: "public", name: "Hall", connectedTo: ["exterior", "bedroom"] },
      { ...defaultVenueSpace("other"), id: "bedroom", kind: "restricted", name: "Bedroom", connectedTo: ["hall"] },
    ],
  },
] as typeof world.venues;
world.villagers = ["local", "near", "far"].map((id) => ({
  characterId: id,
  cardSnapshot: {
    id,
    name: id,
    description: "An individual resident.",
    capturedAt: at,
    revision: 1,
    sourceStatus: "available",
  },
  addedAt: at,
  completedWishes: [],
})) as typeof world.villagers;
const village = coerceVillageState(world);
const venue = village.venues[0];
const base = coerceSession({
  id: "events",
  villageSeed: world.seed,
  placeId: "house",
  placeName: "House",
  area: "outside",
  zoneId: "exterior",
  status: "active",
  memoryMode: "live",
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
const scene = zoneEventScene(base, venue);
const message = 'I privately think SECRET. "Aqua, help!" I turn around.';
const response = (segments: unknown[]) => ({
  segments,
  wishChanges: [],
  memoryChanges: [],
  relationshipChanges: { changes: [], permissions: [], disclosures: [] },
});
function routed(raw: ReturnType<typeof response>, text = message, moves: any[] = [], context = scene) {
  const normalized = zoneEventReply(raw, text);
  const parsed = parseVenueReply(normalized, ["local", "near", "far", "player"]);
  routeZoneEvents(raw, context, parsed, moves);
  applyResidentMovementTimeline(context, venue, parsed.lines, moves);
  return parsed;
}

// No hearing metadata is required for an ordinary local answer.
let result = routed(response([{ kind: "dialogue", speakerId: "local", text: "Hello there." }]));
assert.deepEqual(result.lines[0].heardBy, ["local", "near"]);
assert.deepEqual(result.heardPlayerBy, []);
assert.equal(result.lines.length, 1);

// Misplaced legacy side is ordinary only with an explicit nonprivate aside.
{
  const main = { kind: "narration", text: "You wait by the gate." };
  const aside = { speakerId: "local", text: "That is a confession.", delivery: "side", presentation: "aside" };
  const original = response([main, aside]);
  const normalized = normalizeSparseSceneReply(original);
  assert.equal((original.segments[1] as any).delivery, "side", "saved input remains unchanged");
  const actual = routed(normalized as any, "I wait.");
  const legacy = routed(response([main, { kind: "side", speakerId: "local", text: aside.text }]), "I wait.");
  assert.deepEqual(actual, legacy, "aside routing and anchoring match the established legacy kind");
  assert.deepEqual(actual.lines[1].heardBy, ["local", "near"]);
  assert.equal(actual.lines[1].delivery, "ordinary");
  for (const conflict of [
    { presentation: "main" },
    { presentation: undefined },
    { targetId: "player" },
    { targetId: null },
    { targetId: "" },
    { kind: "whisper" },
    { loud: true },
    { delivery: "quiet" },
    { delivery: "SIDE" },
  ])
    assert.throws(
      () => routed(normalizeSparseSceneReply(response([main, { ...aside, ...conflict }])) as any, "I wait."),
      /delivery|whisper/i,
    );
  const whisper = routed(
    normalizeSparseSceneReply(response([main, { ...aside, delivery: "whisper", targetId: "player" }])) as any,
    "I wait.",
  );
  assert.equal(whisper.lines[1].delivery, "whisper");
  assert.deepEqual(whisper.lines[1].heardBy, ["local"]);
  const shout = routed(normalizeSparseSceneReply(response([main, { ...aside, delivery: "shout" }])) as any, "I wait.");
  assert.equal(shout.lines[1].delivery, "shout");
}

// Delivery and placement are independent, including a real main-panel whisper.
for (const delivery of ["ordinary", "whisper", "shout"] as const) {
  for (const presentation of ["main", "aside"] as const) {
    const reply = routed(
      response([
        { kind: "dialogue", speakerId: "player", text: "Hello." },
        {
          kind: "dialogue",
          speakerId: "local",
          text: "A reply.",
          delivery,
          presentation,
          ...(delivery === "whisper" ? { targetId: "player" } : {}),
        },
        { kind: "narration", text: "The water moves below." },
      ]),
      "Hello.",
    );
    const line = reply.lines[1]!;
    assert.equal(line.delivery, delivery);
    assert.equal(line.presentation, presentation);
    assert.deepEqual(line.heardBy, delivery === "whisper" ? ["local"] : ["local", "near"]);
    assert.equal(line.soundOnly?.characterIds.includes("far") ?? false, delivery === "shout");
    assert.equal(
      line.anchorIndex,
      presentation === "aside" ? 2 : undefined,
      "visible bubbles anchor to visible moments, never hidden player speech",
    );
    const restored = coerceSession({
      ...base,
      lines: reply.lines.map((item, index) => ({ ...item, id: String(index), at, name: "" })),
    });
    assert.equal(restored.lines[1].delivery, delivery);
    assert.equal(restored.lines[1].presentation, presentation);
  }
}
for (const input of [
  '"Hello." I turn around. "How are you?"',
  "“Hello.” I turn around. “How are you?”",
  "'Hello.' I turn around. 'How are you?'",
  "Hello. *I turn around.* How are you?",
]) {
  const reply = routed(
    response([
      { kind: "dialogue", speakerId: "player", text: "Hello. How are you?" },
      { kind: "dialogue", speakerId: "local", text: "Fine." },
    ]),
    input,
  );
  assert.equal(reply.lines[0].content, "Hello. How are you?");
  assert.equal(reply.lines.length, 2, "fragment repair never renumbers evidence");
}
const fragments = routed(
  response([
    { kind: "dialogue", speakerId: "player", fragments: ["Hello.", "How are you?"] },
    { kind: "dialogue", speakerId: "local", text: "Fine." },
  ]),
  "Hello. I turn around. How are you?",
);
assert.equal(fragments.lines[0].content, "Hello. How are you?");
assert.throws(
  () =>
    routed(
      response([{ kind: "dialogue", speakerId: "player", fragments: ["How are you?", "Hello."] }]),
      "Hello. How are you?",
    ),
  /invented player speech/,
);
assert.throws(
  () =>
    routed(
      response([{ kind: "dialogue", speakerId: "player", text: "Hello. Who are you?" }]),
      '"Hello." I turn. "How are you?"',
    ),
  /invented player speech/,
);
const allAside = routed(
  response([
    {
      kind: "dialogue",
      speakerId: "local",
      text: "Quietly.",
      delivery: "whisper",
      presentation: "aside",
      targetId: "player",
    },
  ]),
);
assert.equal(
  allAside.lines[0].presentation,
  "main",
  "an isolated audible aside is readable without invented narration",
);
const reach = zoneEventHearingContext(scene, venue);
assert.match(reach, /wordsReach|alertOnly/);
assert.doesNotMatch(reach, /bedroom|exterior|hall/, "hearing context omits hidden room identities");
const decoratedSound = routed(
  response([
    { kind: "sound", speakerId: "local", text: "A crash.", loud: true, delivery: "whisper", presentation: "aside" },
  ]),
);
assert.deepEqual(decoratedSound.lines[0].heardBy, ["local", "near", "far"]);
assert.equal(decoratedSound.lines[0].delivery, undefined);

result = routed(
  response([
    { kind: "dialogue", speakerId: "player", text: "Aqua, help!", loud: true },
    { kind: "dialogue", speakerId: "near", text: "I'm here." },
    { kind: "dialogue", speakerId: "far", text: "PRIVATE DISTANT WORDS", loud: true },
  ]),
);
assert.deepEqual(result.lines[0].heardBy, ["local", "near"]);
assert.deepEqual(result.lines[0].soundOnly?.characterIds, ["far"]);
assert.equal(result.lines[0].role, "user");
assert(!result.lines.some((line) => line.content.includes("SECRET")));
assert.equal(result.lines[1].viaDoorway, true);
assert.equal(result.lines[1].contactHidden, false);
assert.equal(result.lines[2].contactHidden, true);
assert.deepEqual(result.lines[2].heardBy, ["near", "far"]);
assert.equal(result.lines[2].soundOnly?.player, true);
assert.equal(result.lines.length, 3, "routing never inserts evidence or renumbers segments");
assert.throws(
  () => routed(response([{ kind: "dialogue", speakerId: "player", text: "invented words" }])),
  /invented player speech/,
);
assert.throws(() => routed(response([{ kind: "whisper", speakerId: "local", text: "secret" }])), /whisper needs/i);
assert.throws(
  () =>
    routed(
      response([
        { kind: "narration", text: "You wait." },
        { kind: "whisper", speakerId: "far", targetId: "local", text: "secret" },
      ]),
    ),
  /same Zone/,
);

const saved = structuredClone(base);
for (const [index, line] of result.lines.entries())
  appendLine(saved, { ...line, id: "line" + index, name: line.speakerId, role: line.role ?? "assistant", at });
saved.submissions.push({ id: "turn", message, zoneEventsVersion: 1, mode: "chat", recollections: [], at } as any);
const restored = coerceSession(saved);
assert.equal(restored.submissions[0].zoneEventsVersion, 1);
assert.equal(restored.lines[2].soundOnly?.player, true);
assert.doesNotMatch(heardLines(restored, "far")[0].content, /Aqua, help/);
assert.match(heardLines(restored, "far")[0].content, /indistinct/);
const publicView = publicSceneResponse(restored);
assert.doesNotMatch(JSON.stringify(publicView), /PRIVATE DISTANT WORDS|soundOnly|heardHistory|heardBy|"far"/);
assert.match(JSON.stringify(publicView), /indistinct/);
const evidence = liveEvidence(restored, {
  playerLineId: "none",
  replyLineIds: restored.lines.map((line) => line.id),
  earlierLineIds: [],
} as any);
assert.equal(evidence[2].playerHeard, false, "a distant voice cannot establish player-heard words or permission");
assert(!evidence[0].heardBy.includes("far"), "a loud player call gives far listeners no word evidence");

// NPCs can originate sounds without any player speech; ordinary sound stops after one edge.
for (const loud of [false, true]) {
  const sounds = routed(
    response([{ kind: "sound", speakerId: "far", text: "A heavy crash rings out.", loud }]),
    "I wait quietly.",
  );
  assert.deepEqual(sounds.lines[0].heardBy, loud ? ["local", "near", "far"] : ["near", "far"]);
  assert.equal(sounds.lines[0].contactHidden, !loud);
  assert.equal(sounds.lines[0].speakerId, "__venue_scene__");
  assert.equal(sounds.lines[0].zoneId, "bedroom");
}
const failed = routed(
  response([{ kind: "narration", text: "The stone lands softly." }]),
  "I try to hit the railing with a stone.",
);
assert.deepEqual(failed.lines[0].heardBy, ["local"]);
assert.equal(failed.lines.length, 1, "attempts and narration produce no implicit remote sound");

// Sound metadata carries hearing without turning a physical action into a caption
// or granting remote listeners the accompanying visuals and physical evidence.
const prose = "Local sets the cup on the railing with a clink and nudges it toward you.";
const cue = "A cup clinks against a hard surface.";
const embedded = routed(
  response([
    { kind: "narration", text: prose, sound: { sourceId: "local", text: cue } },
    { kind: "dialogue", speakerId: "near", text: "Did something clink?" },
  ]),
);
assert.equal(embedded.lines.length, 2, "routing adds no sound message or evidence index");
assert.equal(embedded.lines[0].content, prose);
assert.deepEqual(embedded.lines[0].heardBy, ["local"]);
assert.deepEqual(embedded.lines[0].soundOnly, { characterIds: ["near"], player: false, text: cue });
const embeddedSaved = structuredClone(base);
embedded.lines.forEach((line, index) =>
  appendLine(embeddedSaved, {
    ...line,
    id: `embedded-${index}`,
    name: "Narration",
    role: "assistant",
    at,
  }),
);
embeddedSaved.submissions.push({
  id: "embedded",
  message: "I wait.",
  zoneEventsVersion: 1,
  mode: "chat",
  recollections: [],
  at,
} as any);
const embeddedRestored = coerceSession(embeddedSaved);
assert.equal(heardLines(embeddedRestored, "local")[0].content, prose);
assert.equal(heardLines(embeddedRestored, "near")[0].content, cue);
assert.equal(heardLines(embeddedRestored, "near")[0].id, "embedded-0");
assert(!heardLines(embeddedRestored, "far").some((line) => line.id === "embedded-0"));
const embeddedPublic = JSON.stringify(publicSceneResponse(embeddedRestored));
assert(embeddedPublic.includes(prose));
assert(!embeddedPublic.includes(cue), "routing text is not a duplicate public paragraph");
assert.doesNotMatch(embeddedPublic, /sourceId|soundOnly/);
const embeddedEvidence = liveEvidence(embeddedRestored, {
  playerLineId: "none",
  replyLineIds: ["embedded-0", "embedded-1"],
  earlierLineIds: [],
} as any);
assert.deepEqual(embeddedEvidence[0].heardBy, ["local"], "remote sound is not evidence of a handoff");

const offscreenProse = "A clatter carries from nearby, briefly interrupting the conversation.";
const offscreen = routed(
  response([
    {
      kind: "narration",
      text: offscreenProse,
      sound: { sourceId: "near", text: "A brief clatter." },
    },
  ]),
);
assert.equal(offscreen.lines[0].content, offscreenProse);
assert.deepEqual(offscreen.lines[0].heardBy, ["local"]);
assert.deepEqual(offscreen.lines[0].soundOnly?.characterIds, ["near", "far"]);
for (const sourceId of ["player", "local", "near", "far"]) {
  const loud = routed(
    response([
      {
        kind: "narration",
        text: "A crash interrupts the conversation.",
        sound: { sourceId, text: "A loud crash.", loud: true },
      },
    ]),
  );
  assert.deepEqual(loud.lines[0].heardBy, ["local"]);
  assert.deepEqual(loud.lines[0].soundOnly?.characterIds, ["near", "far"]);
}
assert.throws(
  () =>
    routed(
      response([
        {
          kind: "narration",
          text: "A faint click.",
          sound: { sourceId: "far", text: "A faint click." },
        },
      ]),
    ),
  /outside hearing range/,
);
for (const sound of [
  null,
  {},
  { sourceId: "unknown", text: "A click." },
  { sourceId: "local", text: "" },
  { sourceId: "local", text: "x".repeat(301) },
  { sourceId: "local", text: "A click.", loud: "true" },
])
  assert.throws(() => routed(response([{ kind: "narration", text: "An action.", sound }])), /invalid narrated sound/);
assert.throws(
  () =>
    routed(
      response([
        {
          kind: "dialogue",
          speakerId: "local",
          text: "Hello.",
          sound: { sourceId: "local", text: "A click." },
        },
      ]),
    ),
  /invalid narrated sound/,
);
const movingSound = routed(
  response([
    {
      kind: "narration",
      text: "Near steps onto the terrace, shoes clacking on the stone.",
      sound: { sourceId: "near", text: "Shoes clack against stone." },
    },
  ]),
  message,
  [{ characterId: "near", zoneId: "exterior", segment: 0 }],
);
assert.deepEqual(movingSound.lines[0].heardBy, ["local", "near"]);
assert.deepEqual(movingSound.lines[0].soundOnly?.characterIds, [], "movement changes the sound origin at its segment");
const moved = routed(
  response([
    { kind: "dialogue", speakerId: "far", text: "Before the move." },
    { kind: "narration", text: "Far steps from the Hall into Exterior." },
    { kind: "dialogue", speakerId: "far", text: "After the move." },
  ]),
  message,
  [
    {
      characterId: "far",
      zoneId: "exterior",
      segment: 1,
      quote: "Far steps from the Hall into Exterior.",
      path: ["bedroom", "hall", "exterior"],
    },
  ],
);
assert.equal(moved.lines[0].contactHidden, true);
assert.equal(moved.lines[2].contactHidden, false);
assert.deepEqual(moved.lines[2].heardBy, ["local", "near", "far"]);
assert.deepEqual(moved.lines[1].physicalIdsAfter, ["local", "far"]);
const changedVenue = { ...venue, zones: venue.zones!.map((zone) => ({ ...zone, connectedTo: [] })) };
const frozen = routed(
  response([{ kind: "dialogue", speakerId: "local", text: "Still connected." }]),
  message,
  [],
  zoneEventScene(base, changedVenue),
);
assert(frozen.lines[0].heardBy.includes("near"), "active Scenes retain their captured connection graph");
const crowded = structuredClone(base);
for (let index = 0; index < 12; index++)
  crowded.sceneAttendance!.occupants.push({
    characterId: "offstage" + index,
    name: "Offstage " + index,
    doing: "Reading",
    zoneId: "bedroom",
  });
const bounded = zoneEventScene(crowded, venue);
assert(bounded.contactGeneration!.remoteIds.length <= 4, "reaction opportunities use a bounded offstage cast");
assert(
  zoneEventScene(crowded, venue, { message: "Offstage 11, help!" }).contactGeneration!.remoteIds.includes("offstage11"),
  "explicitly named recipients take priority over cast rotation",
);
assert.equal(
  zoneEventScene(crowded, venue, { targetId: "offstage7" }).contactGeneration!.remoteIds[0],
  "offstage7",
  "the selected recipient takes first priority",
);
const broadcast = routed(
  response([{ kind: "dialogue", speakerId: "local", text: "Everyone, watch out!", loud: true }]),
  message,
  [],
  bounded,
);
assert.equal(broadcast.lines[0].soundOnly!.characterIds.length, 13, "a cast limit never limits sound delivery");

// Exercise the actual writer: exactly one completion, with no hearing interpreter or repair request.
let writingVersion: unknown;
let capturedManifest: unknown = {
  management: false,
  movement: true,
  residences: false,
  residenceDecision: false,
  editApproval: false,
};
let wireOverride: string | undefined;
let narrationFinish = "stop";
let allowRejection = false;
let completions = 0;
let sentPrompt = "";
let memoryProposals: unknown[] = [];
let verificationStatus: unknown = "supported";
let verificationFinish = "stop";
let checkCalls = 0;
let proposedRelationships: unknown[] = [];
let lastVerificationPayload: any;
const writing = createSceneWriting({
  refreshZoneParticipants: async () => scene,
  readEffectiveVillagerCard: (resident: any) => resident.cardSnapshot,
  readVillageLore: async () => [],
  villagesLogger: () => ({ warn() {} }),
  villagesLanguageModels: () => ({
    resolveForRequest: async () => ({
      model: "fixture",
      connectionId: "fixture",
      maxOutputTokens: 4096,
      fitContext: (messages: any[], options: any) => ({ messages, ...options }),
    }),
  }),
  measurePipeline: async (_name: any, _detail: any, run: any) => run(),
  runtimeDebug() {},
  venueOperationId: () => "turn",
  venueOperationInput: () => ({
    interactionScopeVersion: 6,
    ...(writingVersion === undefined
      ? {}
      : { writingContractVersion: writingVersion, writingCapabilities: capturedManifest }),
  }),
  venueOperationSignal: () => undefined,
  rejectVenueCompletion: async () => {
    if (allowRejection) return;
    throw Error("unexpected rejection");
  },
  completeWithRoom: async (_model: any, messages: any[], _tokens: any, options: any) => {
    completions++;
    if (messages[0].content.startsWith("Verify consequential Scene proposals")) {
      checkCalls++;
      assert.equal(options.reasoningEffort, "low");
      lastVerificationPayload = JSON.parse(messages[1].content);
      const { proposals } = lastVerificationPayload;
      return {
        finishReason: verificationFinish,
        content: JSON.stringify({ results: proposals.map((row: any) => ({ id: row.id, status: verificationStatus })) }),
      };
    }
    sentPrompt = messages.map((item) => item.content).join("\n");
    return {
      finishReason: narrationFinish,
      content:
        wireOverride ??
        JSON.stringify({
          ...response([
            { kind: "dialogue", speakerId: "player", text: "Aqua, help!" },
            { kind: "narration", text: prose, sound: { sourceId: "local", text: cue } },
            { kind: "dialogue", speakerId: "near", text: "I'm right here, what happened?" },
          ]),
          memoryChanges: memoryProposals,
          relationshipChanges: { changes: proposedRelationships, permissions: [], disclosures: [] },
        }),
    };
  },
  wishFingerprint: () => "none",
  villagesConnectionIdFor: async () => null,
  readVillageState: async () => village,
  interpretRoomReply: async () => null,
} as any);
const written = await writing.generate(scene, message, "chat", "", null);
assert.equal(written.lines[1].content, prose);
assert.deepEqual(written.lines[1].heardBy, ["local"]);
assert.equal(written.lines[1].soundOnly?.text, cue);
assert.equal(written.lines.length, 3);
assert.equal(completions, 1);
assert.match(sentPrompt, /ZONE EVENTS/);
assert.doesNotMatch(sentPrompt, /ACTION-BASED SOUND|Required top-level attentionWitnesses|acousticReplies:\[\{/);
assert(sentPrompt.includes(ZONE_EVENT_CONTRACT));
assert.doesNotMatch(sentPrompt, /Scene sound map|"positions"|far \(far\) at bedroom|"fromZoneId"/);
assert.match(sentPrompt, /source-private activity|Hearing relationships/);
assert.match(sentPrompt, /Each key occurs ONCE/);
console.log(
  "Zone events: adjacent speech/sounds, Venue-wide loud cues, player extraction, NPC initiative, private history/projection, movement, restart and single-completion writer passed (provider-free).",
);

// Contract capabilities omit unavailable jobs without changing parser/saved schemas.
const responseContext = {
  opening: false,
  conversational: true,
  liveMemory: true,
  residentControlled: false,
  recapNeeded: false,
  staging: false,
  contactFacts: "",
  invitationZones: "none",
  presentation: "",
  expressions: [],
  projects: false,
  zoneEventContract: ZONE_EVENT_CONTRACT,
};
const withoutWishes = buildVenueResponseContract({ ...responseContext, wishes: false }).join("\n");
assert.match(withoutWishes, /wishChanges:\[\]/);
assert.doesNotMatch(withoutWishes, /intent:\"reveal\|progress\|check\"/);
assert.match(buildVenueResponseContract({ ...responseContext, wishes: true }).join("\n"), /reveal\|progress\|check/);
assert.match(
  buildVenueResponseContract(responseContext).join("\n"),
  /reveal\|progress\|check/,
  "legacy callers retain Wish schema",
);
assert.doesNotMatch(withoutWishes, /heardPlayerBy and segments FIRST|Segments:.*heardBy/);
assert.match(withoutWishes, /Every knower must witness every citation/);
assert.match(withoutWishes, /Conditional willingness is not unconditional commitment/);

const memoryProposal = {
  kind: "durable",
  text: "Local is permanently timid.",
  category: "personal-fact",
  subjectCharacterIds: ["local"],
  knownByCharacterIds: ["local"],
  evidence: [1],
  memoryIds: [],
  systemVerification: "supported",
};
for (const [status, finish, expected] of [
  ["rejected", "stop", "rejected"],
  [["rejected"], "stop", "unresolved"],
  ["supported", "length", "unresolved"],
  ["supported", "stop", "supported"],
] as const) {
  memoryProposals = [{ ...memoryProposal }];
  verificationStatus = status;
  verificationFinish = finish;
  const before = checkCalls;
  const checked = await writing.generate(scene, message, "chat", "", null);
  assert.equal((checked.memoryChanges as any[])[0].systemVerification, expected);
  assert.equal(checkCalls, before + 1, "consequential proposals use one batched check");
}
memoryProposals = [{ ...memoryProposal, kind: "passing" }];
const beforePassing = checkCalls;
const passing = await writing.generate(scene, message, "chat", "", null);
assert.equal(checkCalls, beforePassing, "passing recollections require no System call");
assert.equal((passing.memoryChanges as any[])[0].systemVerification, undefined, "Narration cannot forge verification");

memoryProposals = [];
proposedRelationships = [
  {
    fromId: "local",
    toId: "player",
    dimension: "trust",
    strength: "major",
    direction: "decrease",
    ordinary: false,
    reason: "Boundary violation",
    lineIds: [2],
    evidence: [1],
  },
];
await writing.generate(scene, message, "chat", "", null);
assert.equal(
  lastVerificationPayload.proposals[0].evidence[0].id,
  2,
  "relationship verification uses exactly settlement lineIds",
);
assert.equal(lastVerificationPayload.proposals[0].evidence[0].content, "I'm right here, what happened?");
assert.equal(lastVerificationPayload.proposals[0].evidence[0].playerPerception, "full");
assert(!lastVerificationPayload.proposals[0].evidence[0].heardBy.includes("player"));

// Actual v2 writer: a complete sparse reply gains defaults, while failed or corrupt output never does.
writingVersion = 2;
memoryProposals = [];
proposedRelationships = [];
wireOverride = JSON.stringify({
  segments: [
    { kind: "dialogue", speakerId: "player", text: "Aqua, help!" },
    { kind: "narration", text: prose },
  ],
});
const sparseBefore = completions;
const sparseReply = await writing.generate(scene, message, "chat", "", null);
assert.equal(completions, sparseBefore + 1);
assert.deepEqual(sparseReply.memoryChanges, []);
assert.deepEqual(sparseReply.relationshipChanges, { changes: [], permissions: [], disclosures: [] });
assert.deepEqual(sparseReply.responseDiagnostics?.missingFields, []);
assert.doesNotMatch(sentPrompt, /include them even when empty|Return wishChanges:\[\]/i);
allowRejection = true;
narrationFinish = "length";
await assert.rejects(writing.generate(scene, message, "chat", "", null), /output limit/);
narrationFinish = "stop";
wireOverride = JSON.stringify({ segments: [{ kind: "narration", text: prose }], memoryChanges: null });
await assert.rejects(writing.generate(scene, message, "chat", "", null), /failed validation/);
const beforeInvalidAdmission = completions;
capturedManifest = { management: true };
await assert.rejects(writing.generate(scene, message, "chat", "", null), /invalid writing capability/);
writingVersion = 99;
await assert.rejects(writing.generate(scene, message, "chat", "", null), /unsupported writing contract/);
assert.equal(completions, beforeInvalidAdmission, "invalid saved contracts never dispatch a provider");

// v2 discards validated local no-ops without granting movement or additional witnesses.
writingVersion = 2;
capturedManifest = {
  management: false,
  movement: true,
  residences: false,
  residenceDecision: false,
  editApproval: false,
};
const step = "He crosses the courtyard to stand a little closer.";
const noopWire = (moves: unknown[], text = step) =>
  JSON.stringify({
    segments: [
      { kind: "dialogue", speakerId: "player", text: "Aqua, help!" },
      { kind: "narration", text },
    ],
    contactMoves: moves,
  });
wireOverride = noopWire([{ characterId: "local", zoneId: "exterior", segment: 1 }]);
const beforeNoopAttendance = structuredClone(scene.sceneAttendance);
const noMove = await writing.generate(scene, message, "chat", "", null);
assert.deepEqual(noMove.contactMoves, []);
assert.deepEqual(scene.sceneAttendance, beforeNoopAttendance);
assert.deepEqual(noMove.lines.find((line) => line.content === step)?.heardBy, ["local"]);
for (const [moves, text] of [
  [[{ characterId: "local", zoneId: "exterior", segment: 99 }], step],
  [[{ characterId: "stranger", zoneId: "exterior", segment: 1 }], step],
  [[{ characterId: "near", zoneId: "hall", segment: 1 }], "near takes a step beside the table."],
  [[{ characterId: "local", zoneId: "exterior", segment: 1 }], "He would cross the courtyard if invited."],
  [[{ characterId: "local", zoneId: "exterior", segment: 1 }], "He enters the Hall through its door."],
  [
    [
      { characterId: "local", zoneId: "exterior", segment: 1 },
      { characterId: "local", zoneId: "exterior", segment: 1 },
    ],
    step,
  ],
  [[{ characterId: "local", zoneId: "hall", segment: 1 }], "He steps through the door."],
] as const) {
  wireOverride = noopWire([...moves], text);
  await assert.rejects(
    writing.generate(scene, message, "chat", "", null),
    /failed validation|unsupported resident movement/,
  );
}
wireOverride = JSON.stringify({
  segments: [
    { kind: "dialogue", speakerId: "player", text: "Aqua, help!" },
    { kind: "narration", text: step },
    { kind: "narration", text: "near steps outside into the Exterior." },
  ],
  contactMoves: [
    { characterId: "local", zoneId: "exterior", segment: 1 },
    { characterId: "near", zoneId: "exterior", segment: 2 },
  ],
});
const mixedMoves = await writing.generate(scene, message, "chat", "", null);
assert.equal(mixedMoves.contactMoves.length, 1);
assert.equal(mixedMoves.contactMoves[0].characterId, "near");
assert.deepEqual(mixedMoves.lines[2].physicalIdsAfter, ["local", "near"]);
writingVersion = undefined;
wireOverride = noopWire([{ characterId: "local", zoneId: "exterior", segment: 1, quote: step }]);
await assert.rejects(writing.generate(scene, message, "chat", "", null), /unsupported resident movement/);

writingVersion = 2;
wireOverride = noopWire(
  [{ characterId: "local", zoneId: "exterior", segment: 1, quote: "He crosses the courtyard." }],
  "If invited, He crosses the courtyard.",
);
await assert.rejects(writing.generate(scene, message, "chat", "", null), /unsupported resident movement/);
wireOverride = noopWire(
  [{ characterId: "local", zoneId: "exterior", segment: 1 }],
  "He crosses the courtyard with a challenging grin.",
);
assert.deepEqual(
  (await writing.generate(scene, message, "chat", "", null)).contactMoves,
  [],
  "Hall is not a substring ban on challenging",
);

// Perception records only the saved player projection; model fields never grant access.
{
  const speech: any = { role: "assistant", speakerId: "local", kind: "dialogue", heardBy: ["local"] };
  assert.deepEqual(sceneEvidencePerception(speech), { playerPerception: "full" });
  assert.deepEqual(sceneEvidencePerception({ ...speech, kind: "whisper", targetId: "player" }), {
    playerPerception: "full",
  });
  assert.deepEqual(sceneEvidencePerception({ ...speech, kind: "whisper", targetId: "other", contactHidden: true }), {
    playerPerception: "none",
  });
  assert.deepEqual(sceneEvidencePerception({ ...speech, kind: "whisper", targetId: "other" }), {
    playerPerception: "none",
  });
  assert.deepEqual(
    sceneEvidencePerception({
      ...speech,
      delivery: "shout",
      contactHidden: true,
      soundOnly: { player: true, characterIds: [], text: "An indistinct voice." },
    }),
    { playerPerception: "sound-only", playerSound: "An indistinct voice." },
  );
  assert.deepEqual(sceneEvidencePerception({ ...speech, kind: "narration" }), { playerPerception: "full" });
  assert.deepEqual(sceneEvidencePerception({ ...speech, kind: "narration", contactHidden: true }), {
    playerPerception: "none",
  });
  assert.deepEqual(
    sceneEvidencePerception({ ...speech, role: "user", speakerId: "", attentionEvidence: true, contactHidden: true }),
    { playerPerception: "full" },
  );
  assert.deepEqual(sceneEvidencePerception({ ...speech, role: "user", speakerId: "", contactHidden: true }), {
    playerPerception: "none",
  });
  assert.deepEqual(sceneEvidencePerception({ ...speech, attentionEvidence: true, contactHidden: true }), {
    playerPerception: "none",
  });
  assert.deepEqual(sceneEvidencePerception({ ...speech, contactHidden: true, playerPerception: "full" } as any), {
    playerPerception: "none",
  });
  assert.deepEqual(sceneEvidencePerception({ ...speech, contactReport: true }), { playerPerception: "none" });
  const earlier = { ...speech, zoneId: "old-zone" };
  assert.deepEqual(
    sceneEvidencePerception(earlier),
    { playerPerception: "full" },
    "saved perception does not depend on the player's new Zone",
  );
}
