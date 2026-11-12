import assert from "node:assert/strict";
import { readEffectiveVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { readNarrationSubmission } from "../packages/villages/src/server/domain/decoding/narration-submission.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  createSceneWriting,
  type SceneWritingPorts,
} from "../packages/villages/src/server/features/scenes/writing-service.js";
import { scenePromptPacket } from "./fixtures/villages-scene-writing.fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";

const at = "2026-11-01T12:00:00.000Z";
const participants = ["a", "b", "remote"].map((characterId) => ({
  characterId,
  name: characterId,
  doing: "Listening",
}));
const artwork = ["happy_01", "happy_blush", "happy_side"].map((name, index) => {
  const id = "00000000-0000-4000-8000-00000000000" + (index + 1);
  const assetId = "villages-" + id;
  return {
    id: "a-" + id,
    assetId,
    origin: "upload",
    name,
    frame: { x: 0, y: 0, width: 64, height: 96, scale: 1, offsetX: 0, offsetY: 0 },
    warnings: [],
    source: {
      filename: "original.png",
      url: `/api/sprites/${assetId}/file/original.png`,
      width: 64,
      height: 96,
      sha256: "0".repeat(64),
    },
    rendered: { filename: "render.png", url: `/api/sprites/${assetId}/file/render.png` },
  };
});
const [first, second, side] = artwork.map(({ id }) => "e-" + id.slice(2));
const group = "g-" + first;
const world = coerceVillageState({
  ...defaultVillageState(),
  seed: "sprite-system",
  setupAt: at,
  foundedAt: at,
  venues: [venueFixture({ id: "studio", name: "Studio", classes: ["community"] })],
  villagers: participants.map(({ characterId, name }) => ({
    characterId,
    incarnation: "resident-" + characterId,
    letterFontId: "caveat",
    addedAt: at,
    cardSnapshot: {
      id: characterId,
      name,
      description: "A resident.",
      revision: 1,
      sourceStatus: "available",
      capturedAt: at,
    },
    ...(characterId === "a"
      ? {
          spriteManager: {
            version: 1,
            framing: { mode: "full" },
            defaultExpressionId: first,
            artwork,
            expressions: [first, second, side].map((id) => ({ id, name: "Smile" })),
            assignments: artwork.map(({ id }, index) => ({
              artworkId: id,
              expressionId: [first, second, side][index],
              view: index === 2 ? "side" : "front",
            })),
          },
        }
      : {}),
  })),
});
const venue = world.venues[0]!;
assert.equal(world.villagers[0].sprite?.expressions.length, 3, "Current Sprite Manager assignments supply the catalog");
const scene = zoneEventScene(
  coerceSession({
    version: 5,
    id: "sprite-scene",
    sceneRevision: 1,
    villageSeed: world.seed,
    placeId: venue.id,
    placeName: venue.name,
    zoneId: "exterior",
    status: "active",
    startedAt: at,
    participants,
    activeIds: ["a", "b"],
    sceneAttendance: {
      capturedAt: at,
      layout: captureSceneLayout(venue),
      occupants: participants.map((person) => ({
        ...person,
        zoneId: person.characterId === "remote" ? "community" : "exterior",
      })),
    },
    lines: [
      {
        id: "prior",
        role: "assistant",
        kind: "narration",
        speakerId: "__venue_scene__",
        name: "Narration",
        content: "A looks towards B.",
        at,
        zoneId: "exterior",
        heardBy: ["a", "b", "player"],
        staging: [{ characterId: "a", expression: side, look: { target: "villager", characterId: "b" } }],
      },
    ],
  }),
  venue,
  { targetId: "remote" },
);
assert(scene.contactGeneration?.actorIds?.includes("remote"), "The offstage actor is in the writer's scope");
const raw = {
  segments: [
    {
      id: "gesture",
      kind: "narration",
      text: "A smiles.",
      staging: [{ characterId: "a", expression: group, position: "right" }],
    },
    {
      id: "quiet",
      kind: "dialogue",
      delivery: "whisper",
      speakerId: "a",
      targetId: "b",
      text: "Keep this quiet.",
      staging: [{ characterId: "a", look: { target: "player" } }],
    },
    {
      id: "greeting",
      kind: "dialogue",
      speakerId: "a",
      text: "Hello.",
      staging: [
        { characterId: "a", expression: group },
        { characterId: "b", expression: first, look: { target: "villager", characterId: "remote" } },
        { characterId: "remote", look: { target: "player" } },
      ],
    },
    { id: "cross", kind: "narration", text: "B steps into the adjoining room.", requires: ["move-b"] },
    {
      id: "turn",
      kind: "dialogue",
      speakerId: "a",
      text: "How are you?",
      staging: [{ characterId: "a", expression: group }],
    },
    { id: "malformed", kind: "dialogue", speakerId: "a", text: "Fine.", staging: { invalid: true } },
  ],
  commands: [
    {
      id: "move-b",
      type: "move",
      who: "b",
      to: "community",
      at: "cross",
      source: [{ segment: "cross", perceive: { kind: "seen", by: ["player"] } }],
    },
  ],
};
const input = "Hello, both of you.";
const checkpoints = new Map<string, unknown>();
let calls = 0;
let unavailable = false;
const model = {
  connectionId: "narration",
  model: "fixture",
  maxOutputTokens: 4096,
  fitContext: (messages: unknown, options: object) => ({ messages, ...options, trimmed: false }),
};
const writer = createSceneWriting({
  readVillageState: async () => {
    assert(!unavailable, "Recovery must use the saved request instead of the current catalog");
    return world;
  },
  readEffectiveVillagerCard,
  readVillageLore: async () => [],
  villagesConnectionIdFor: async () => "narration",
  villagesLanguageModels: () => ({ resolveForRequest: async () => model }),
  venueOperationId: () => "sprite-request",
  venueSavedCheckpoint: (key: string) => structuredClone(checkpoints.get(key)),
  venueCheckpoint: async (key: string, work: () => Promise<unknown>) => {
    if (checkpoints.has(key)) return structuredClone(checkpoints.get(key));
    const value = await work();
    checkpoints.set(key, structuredClone(value));
    if (key.startsWith("writing-completion:")) throw Error("Completion acknowledgement lost");
    return value;
  },
  completeWithRoom: async (_model: unknown, messages: { content: string }[]) => {
    calls++;
    const catalog = scenePromptPacket(messages.map(({ content }) => content).join("\n"), "calendar").presentation;
    assert(catalog.sprites[0].expressions.includes(group));
    assert.deepEqual(catalog.state.a, { expression: side, look: { target: "villager", characterId: "b" } });
    assert.doesNotMatch(JSON.stringify(catalog), /original\.png|render\.png|happy_01|remote/);
    return { finishReason: "stop", content: JSON.stringify(raw) };
  },
  rejectVenueCompletion: () => assert.fail("Optional presentation cannot reject purchased Scene prose"),
  measurePipeline: async (_label: string, _metadata: unknown, work: () => Promise<unknown>) => work(),
  runtimeDebug() {},
} as unknown as SceneWritingPorts);

await assert.rejects(writer.generate(scene, input, "chat"), /acknowledgement lost/);
unavailable = true;
world.villagers[0].sprite = null;
world.villagers[0].spriteManager = null;
world.spriteVariantsEnabled = false;
const purchase = await writer.generate(scene, input, "chat");
assert.equal(calls, 1);
const pending = readNarrationSubmission(
  JSON.parse(
    JSON.stringify({
      id: "turn",
      mode: "chat",
      message: input,
      targetId: "",
      requestFingerprint: memoryHash(["chat", "", null, input]),
      at,
      acceptance: { status: "pending", rejected: [] },
      narration: { raw: purchase.raw, readset: purchase.readset, responseDigest: purchase.responseDigest },
    }),
  ),
);
const cold = coerceVillageState(JSON.parse(JSON.stringify(world)));
const acceptedAt = pending.narration!.readset.capturedAt;
const accepted = acceptNarration(cold, pending.narration!, pending.id, acceptedAt);
assert.equal(accepted.held, false, JSON.stringify(accepted.rejected));
const lines = accepted.episode!.segments;
assert.deepEqual(
  lines.map(({ content }) => content),
  raw.segments.map(({ text }) => text),
);
assert.deepEqual(
  lines[0].staging,
  [{ characterId: "a", expression: side }],
  "The captured side pose survives cold recovery",
);
assert.deepEqual(lines[1].staging, [], "Hidden cues cannot affect public playback");
assert.deepEqual(
  lines[2].staging,
  [{ characterId: "a", expression: side }],
  "Offstage or foreign cues do not change the pose",
);
assert.deepEqual(lines[2].heardBy, ["a", "b", "player"]);
assert.deepEqual(lines[3].physicalIdsAfter, ["a"]);
assert(
  [first, second].includes(lines[4].staging![0].expression!),
  "A departure clears the old gaze before selecting the next pose",
);
assert.deepEqual(lines[5].staging, []);
const visible = publicSceneResponse({ lines });
assert(!JSON.stringify(visible).includes(group), "Playback receives concrete artwork only");
assert(!JSON.stringify(visible).includes("Keep this quiet."));
const restarted = coerceVillageState(JSON.parse(JSON.stringify(cold)));
const replayed = acceptNarration(restarted, pending.narration!, pending.id, acceptedAt);
assert(replayed.replayed);
assert.deepEqual(replayed.episode!.segments, lines);
const sameRequest = acceptNarration(world, pending.narration!, pending.id, acceptedAt);
assert.deepEqual(
  sameRequest.episode!.segments,
  lines,
  "The admitted request selects the same pose across fresh acceptance attempts",
);
assert.equal(calls, 1);
