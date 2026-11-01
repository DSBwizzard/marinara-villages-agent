import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { readStagingCues } from "../packages/villages/src/shared/helpers/scene-staging.js";
import {
  readSceneSpritePresentation,
  sceneSpriteSelection,
} from "../packages/villages/src/server/domain/rules/sprite-expressions.js";
import {
  createSemanticService,
  type SemanticPorts,
} from "../packages/villages/src/server/features/generation/semantic-service.js";
import { currentScenePrompt } from "./fixtures/villages-scene-writing.fixture.js";
import { readEffectiveVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  createSceneWriting,
  type SceneWritingPorts,
} from "../packages/villages/src/server/features/scenes/writing-service.js";

const world = defaultVillageState();
world.seed = "sprite-system";
const frame = { x: 0, y: 0, width: 64, height: 96, scale: 1, offsetX: 0, offsetY: 0 };
const assetId = "villages-" + randomUUID();
const artworkId = "a-" + randomUUID(),
  expressionId = "e-" + randomUUID();
world.villagers = [
  {
    characterId: "a",
    addedAt: "2026-11-01T00:00:00Z",
    wishes: [],
    cardSnapshot: {
      id: "a",
      name: "A",
      description: "A quiet resident.",
      revision: 1,
      sourceStatus: "available",
      capturedAt: "2026-11-01T00:00:00Z",
    },
    spriteManager: {
      version: 1,
      framing: { mode: "full" },
      defaultExpressionId: expressionId,
      artwork: [
        {
          id: artworkId,
          assetId,
          origin: "upload",
          name: "special-sprite-label",
          frame,
          warnings: [],
          source: {
            filename: "original.png",
            url: `/api/sprites/${assetId}/file/original.png`,
            width: 64,
            height: 96,
            sha256: "0".repeat(64),
          },
          rendered: { filename: "render.png", url: `/api/sprites/${assetId}/file/render.png` },
        },
      ],
      expressions: [{ id: expressionId, name: "special-sprite-label" }],
      assignments: [{ artworkId, expressionId, view: "front" }],
    },
  },
] as any;
world.villagers = coerceVillageState(world).villagers;
assert.equal(world.villagers[0].sprite?.expressions[0].name, "special-sprite-label");
const prompt = await currentScenePrompt(world, { id: "a", name: "A", description: "A quiet resident." } as any);
assert.doesNotMatch(prompt, /special-sprite-label|Filled expressions|Current presentation state|staging:\[/);

const sprite = {
  assetId,
  defaultExpressionId: "e-neutral",
  framing: { mode: "full" },
  expressions: [
    { expressionId: "e-neutral", name: "Neutral", spriteName: "neutral", view: "front" },
    { expressionId: "e-first", name: "Smile", spriteName: "happy_01", view: "front" },
    { expressionId: "e-second", name: "Smile", spriteName: "happy_blush", view: "front" },
    { expressionId: "e-side", name: "Smile", spriteName: "happy_side", view: "side" },
  ],
};
world.villagers[0].sprite = sprite as any;
const scene = coerceSession({
  version: 3,
  semanticVersion: 2,
  id: "sprite-scene",
  placeId: "none",
  status: "active",
  startedAt: "2026-11-01T00:00:00Z",
  villageSeed: world.seed,
  participants: [
    { characterId: "a", name: "A" },
    { characterId: "b", name: "B" },
  ],
  activeIds: ["a", "b"],
  lines: [],
  submissions: [],
});
const lines = [
  { kind: "dialogue", speakerId: "a", content: "Hello, B.", heardBy: ["a", "b"] },
  { kind: "dialogue", speakerId: "a", content: "Hello again.", heardBy: ["a", "b"] },
] as any;
const checkpoints = new Map<string, unknown>();
let calls = 0,
  malformed = false;
const model = {
  connectionId: "system",
  model: "fixture",
  maxOutputTokens: 8192,
  fitContext: (messages: unknown, options: unknown) => ({ messages, ...(options as object), trimmed: false }),
};
const ports = {
  readVillageState: async () => world,
  villagesConnectionIdFor: async (purpose: string) => {
    assert.equal(purpose, "system");
    return "system";
  },
  villagesLanguageModels: () => ({ resolveForRequest: async () => model }),
  venueOperationSignal: () => undefined,
  rejectVenueCompletion: async () => {},
  venueSavedCheckpoint: (key: string) => checkpoints.get(key),
  venueCheckpoint: async (key: string, work: () => Promise<unknown>) => {
    if (checkpoints.has(key)) return structuredClone(checkpoints.get(key));
    const result = await work();
    checkpoints.set(key, structuredClone(result));
    return result;
  },
  completeWithRoom: async (_model: unknown, messages: { content: string }[]) => {
    calls++;
    const packet = JSON.parse(messages[1].content);
    assert.match(messages[0].content, /in this same response: presentation/);
    assert.equal(packet.input._presentation, undefined, "private concrete choices stay out of model context");
    assert.doesNotMatch(messages[1].content, /original\.png|\/render/);
    assert.match(packet.input.presentation.sprites[0].expressions, /g-e-first/);
    const response = {
      sourceHash: packet.sourceHash,
      consistent: true,
      authority: { physical: false, access: false, projects: false, standing: false, social: false },
      action: null,
      memoryChanges: [],
      relationshipChanges: { changes: [], permissions: [], disclosures: [] },
      wishChanges: [],
      projectSpeech: [],
      access: [],
      events: { moves: [], departures: [], contactEnd: [] },
      presentation: malformed
        ? [{ segment: 99, staging: [] }, null]
        : [
            { segment: 1, staging: [{ characterId: "a", expression: "g-e-first" }] },
            {
              segment: 0,
              staging: [
                {
                  characterId: "a",
                  expression: "g-e-first",
                  position: "right",
                  look: { target: "villager", characterId: "b" },
                },
                { characterId: "outsider", expression: "e-neutral" },
              ],
            },
          ],
    };
    if (packet.input.pipelineVersion === 3)
      Object.assign(response, {
        intent: { status: "resolved", instructions: "", action: null, movement: null, timeline: [] },
      });
    if (packet.input.residentActions)
      Object.assign(response, {
        residentActionReview: {
          version: 1,
          additionalActions: [],
          decisions: [],
          coverage: packet.input.evidence.map((_line: unknown, segment: number) => ({
            segment,
            status: "none",
            actionIds: [],
            reason: "No access action",
          })),
        },
      });
    return { finishReason: "stop", content: JSON.stringify(response) };
  },
} as unknown as SemanticPorts;
const service = createSemanticService(ports);
const original = JSON.stringify(lines);
const result = await service.exchange(scene, "I listen.", lines, null);
assert.equal(calls, 1, "presentation uses the existing System exchange only");
assert.equal(result.presentation?.length, 2);
assert.equal(result.presentation?.[0].segment, 0, "cues follow playback order, regardless of output ordering");
for (const row of result.presentation!)
  assert.equal(row.staging[0].expression, "e-side", "attention selects an eligible side variant");
assert.equal(result.presentation![0].staging[0].position, undefined, "screen movement stays in code");
assert.equal(JSON.stringify(lines), original, "presentation cannot rewrite speech or witnesses");
world.villagers[0].sprite = null;
const replay = await service.exchange(scene, "I listen.", lines, null);
assert.deepEqual(replay.presentation, result.presentation, "replay retains the concrete choice after library changes");
assert.equal(calls, 1, "recovery never buys a sprite request");
world.villagers[0].sprite = sprite as any;
malformed = true;
const invalid = await service.exchange(scene, "Other turn.", lines, null);
assert.deepEqual(invalid.presentation, [], "bad optional cues do not invalidate prose");
const context = sceneSpriteSelection(scene, world);
assert.deepEqual(
  readSceneSpritePresentation(undefined, context, lines.length),
  [],
  "missing optional presentation preserves the prose",
);
const valid = readSceneSpritePresentation(
  [
    {
      segment: 0,
      staging: [
        { characterId: "a", expression: "another-residents-id", look: { target: "villager", characterId: "outsider" } },
        { characterId: "outsider", expression: "e-first" },
      ],
    },
  ],
  context,
  2,
);
assert.deepEqual(valid, []);
const local = readStagingCues(result.presentation![0].staging, ["a"]);
assert.equal(local[0].look, undefined, "offstage attention targets cannot survive the visibility filter");
assert.equal(local[0].expression, "e-side");

// Exercise the actual writer/System connection, including unsolicited Narration cues.
malformed = false;
const admission = {
  interactionScopeVersion: 6,
  writingContractVersion: 3,
  semanticPipelineVersion: 3,
  residentActionsVersion: 2,
  writingCapabilities: { management: false, movement: false, residences: false, residenceDecision: false },
};
const writingScene = {
  ...scene,
  activeIds: ["a"],
  participants: scene.participants.slice(0, 1),
  operation: { input: admission },
} as typeof scene;
let narrationCalls = 0;
const writer = createSceneWriting({
  ...ports,
  semantic: service,
  villagesConnectionIdFor: async () => "narration",
  villagesLanguageModels: () => ({ resolveForRequest: async () => ({ ...model, connectionId: "narration" }) }),
  readEffectiveVillagerCard,
  readVillageLore: async () => [],
  villagesLogger: () => ({ warn: () => assert.fail("Unexpected warning") }),
  measurePipeline: async (_label: string, _metadata: unknown, work: () => Promise<unknown>) => work(),
  runtimeDebug() {},
  venueOperationId: () => "sprite-operation",
  venueOperationInput: () => admission,
  refreshZoneParticipants: async (current: unknown) => current,
  rejectVenueCompletion: () => assert.fail("Optional presentation cannot reject a Scene"),
  completeWithRoom: async (_model: unknown, messages: { content: string }[]) => {
    narrationCalls++;
    assert.doesNotMatch(JSON.stringify(messages), /e-first|e-neutral|happy_01|staging:\[/);
    return {
      finishReason: "stop",
      content: JSON.stringify({
        playerSpeechCapture: { status: "silent", utterances: [] },
        residentActions: [],
        heardPlayerBy: [],
        segments: [
          {
            kind: "dialogue",
            speakerId: "a",
            text: "Hello.",
            expression: "narration-forgery",
            gazeAt: "player",
            staging: [
              { characterId: "a", expression: "narration-forgery", look: { target: "direction", direction: "right" } },
            ],
          },
        ],
      }),
    };
  },
} as unknown as SceneWritingPorts);
const beforeWriting = calls;
const written = await writer.generate(writingScene, "", "chat", "", null);
assert.equal(narrationCalls, 1);
assert.equal(calls, beforeWriting + 1, "one Narration request and one existing System request complete the turn");
assert.equal(written.lines[0].expression, undefined);
assert.equal(written.lines[0].gazeAt, undefined);
assert.ok(["e-first", "e-second"].includes(written.lines[0].staging![0].expression!));
const replayed = await writer.generate(writingScene, "", "chat", "", null);
assert.deepEqual(replayed.lines, written.lines);
assert.equal(narrationCalls, 1);
assert.equal(calls, beforeWriting + 1, "replaying the complete turn buys no requests");
console.log(
  "System sprite selection: single request, Narration isolation, optional cues, visibility and saved variants passed.",
);
