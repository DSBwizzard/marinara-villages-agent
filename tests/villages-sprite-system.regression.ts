import assert from "node:assert/strict";
import { scenePersonReferences } from "../packages/villages/src/server/domain/rules/scene-prompt-references.js";
import { randomUUID } from "node:crypto";
import { readEffectiveVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { materializeGmReply, normalizeGmEffects } from "../packages/villages/src/server/domain/rules/scene-gm.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { semanticContext } from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import {
  readSceneSpritePresentation,
  sceneSpriteSelection,
} from "../packages/villages/src/server/domain/rules/sprite-expressions.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  createSemanticService,
  type SemanticPorts,
} from "../packages/villages/src/server/features/generation/semantic-service.js";
import {
  createSceneWriting,
  type SceneWritingPorts,
} from "../packages/villages/src/server/features/scenes/writing-service.js";
import { readStagingCues } from "../packages/villages/src/shared/helpers/scene-staging.js";
import { currentScenePrompt, scenePromptPacket } from "./fixtures/villages-scene-writing.fixture.js";
import { venueDraftFixture } from "./helpers/venues.fixture.js";

const world = defaultVillageState();
world.seed = "sprite-system";
const frame = { x: 0, y: 0, width: 64, height: 96, scale: 1, offsetX: 0, offsetY: 0 };
const assetId = "villages-" + randomUUID();
const artworkId = "a-" + randomUUID(),
  expressionId = "e-" + randomUUID();
world.villagers = [
  {
    letterFontId: "caveat",
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
assert.match(prompt, /special-sprite-label/);
assert.doesNotMatch(prompt, /original\.png|render\.png/);

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
  version: 4,
  semanticVersion: 2,
  id: "sprite-scene",
  placeId: "studio",
  zoneId: "exterior",
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
Object.assign(world, { setupAt: scene.startedAt, foundedAt: scene.startedAt, timeZone: "UTC" });
world.venues = [
  venueDraftFixture({ id: "studio", name: "Studio", description: "A quiet studio.", category: "public" }, null),
];
const selectedRemote = await currentScenePrompt(
  world,
  { id: "a", name: "A", description: "A quiet resident." } as any,
  "chat",
  "Hello.",
  {
    ...scene,
    contactGeneration: { actorIds: ["b"], localIds: ["a"], remoteIds: ["b"] } as any,
  },
);
const remotePacket = scenePromptPacket(selectedRemote);
assert.ok(!remotePacket.context.actors.some((actor: any) => actor.id === "a"));
assert.ok(
  remotePacket.presentationOnly
    .find((actor: any) => actor.actorId === "a")
    .expressions.some((expression: any) => expression.name === "special-sprite-label"),
);
assert.equal(remotePacket.presentationOnly[0].doing, undefined);
assert.equal(remotePacket.presentationOnly[0].wishes, undefined);
const checkpoints = new Map<string, unknown>();
let calls = 0;
const model = {
  connectionId: "narration",
  model: "fixture",
  maxOutputTokens: 4096,
  fitContext: (messages: unknown, options: object) => ({ messages, ...options, trimmed: false }),
};
const ports = {
  readVillageState: async () => world,
  venueOperationSignal: () => undefined,
  rejectVenueCompletion: () => assert.fail("Local validation cannot reject optional cues"),
  venueSavedCheckpoint: (key: string) => checkpoints.get(key),
  venueCheckpoint: async (key: string, work: () => Promise<unknown>) => {
    if (checkpoints.has(key)) return structuredClone(checkpoints.get(key));
    const value = await work();
    checkpoints.set(key, structuredClone(value));
    return value;
  },
  completeWithRoom: () => {
    calls++;
    assert.fail("GM validation never requests System");
  },
} as unknown as SemanticPorts;
scene.operation = { input: { semanticPipelineVersion: 3 } } as any;
const service = createSemanticService(ports);
const gmContext = semanticContext(scene, world, "A GM turn.", true);
const gmSelection = sceneSpriteSelection(scene, world);
const gmRaw = materializeGmReply(
  {
    input: [{ kind: "action", text: "A GM turn." }],
    segments: lines.map((line: any) => ({ kind: line.kind, speakerId: line.speakerId, text: line.content })),
    presentation: [
      {
        segment: 0,
        staging: [{ characterId: "a", expression: "g-e-first", look: { target: "villager", characterId: "b" } }],
      },
    ],
  },
  "A GM turn.",
);
const original = JSON.stringify(lines),
  originalRandom = Math.random;
Math.random = () => 0;
const gmFirst = await service.exchange(scene, "A GM turn.", lines, {
  raw: gmRaw,
  context: gmContext,
  presentation: gmSelection,
});
assert.equal(gmFirst.presentation?.[0].staging[0].expression, "e-side");
world.villagers[0].sprite = null;
Math.random = () => 0.999;
const gmReplayed = await service.exchange(scene, "A GM turn.", lines, {
  raw: gmRaw,
  context: gmContext,
  presentation: sceneSpriteSelection(scene, world),
});
Math.random = originalRandom;
assert.deepEqual(gmReplayed.presentation, gmFirst.presentation, "Saved GM presentation freezes concrete variants");
assert.equal(gmReplayed.sourceHash, gmFirst.sourceHash);
assert.equal(calls, 0);
assert.equal(JSON.stringify(lines), original, "Presentation cannot rewrite speech or witnesses");
world.villagers[0].sprite = sprite as any;
const context = sceneSpriteSelection(scene, world);
const alias = [{ segment: 0, staging: [{ characterId: "a", expression: "e-first" }] }];
const normalizedAlias = normalizeGmEffects({ presencePresentation: alias }, gmContext);
for (const fingerprint of [undefined, "forged"])
  assert.equal(
    normalizeGmEffects({ memoryChanges: [{ screening: { disposition: "clear", fingerprint } }] }, gmContext)
      .memoryChanges[0].screening.fingerprint,
    gmContext._memoryWrite.protection.fingerprint,
    "Scene Memory screening always binds the captured server fingerprint",
  );
assert.deepEqual(normalizedAlias.presentation, alias);
assert.equal(normalizedAlias.presencePresentation, undefined);
assert.deepEqual(
  readSceneSpritePresentation(normalizedAlias.presentation, context, lines.length),
  readSceneSpritePresentation(alias, context, lines.length),
  "The observed alias uses exactly the normal cosmetic cue validation",
);
assert.deepEqual(normalizeGmEffects({ presentation: [], presencePresentation: alias }, gmContext).presentation, []);
assert.deepEqual(
  readSceneSpritePresentation(
    normalizeGmEffects({ presencePresentation: "invalid" }, gmContext).presentation,
    context,
    lines.length,
  ),
  [],
);
assert.deepEqual(readSceneSpritePresentation(undefined, context, lines.length), []);
assert.deepEqual(readSceneSpritePresentation([{ segment: 99, staging: [] }, null], context, lines.length), []);
assert.deepEqual(
  readSceneSpritePresentation(
    [
      {
        segment: 0,
        staging: [
          {
            characterId: "a",
            expression: "another-residents-id",
            look: { target: "villager", characterId: "outsider" },
          },
          { characterId: "outsider", expression: "e-first" },
        ],
      },
    ],
    context,
    2,
  ),
  [],
);
const local = readStagingCues(gmFirst.presentation![0].staging, ["a"]);
assert.equal(local[0].look, undefined, "Offstage attention targets cannot survive the visibility filter");
assert.equal(local[0].expression, "e-side");
const admission = {
  interactionScopeVersion: 6,
  writingContractVersion: 4,
  semanticPipelineVersion: 3,
  residentActionsVersion: 2,
};
const writingScene = {
  ...scene,
  activeIds: ["a"],
  participants: scene.participants.slice(0, 1),
  sceneAttendance: {
    capturedAt: scene.startedAt,
    layout: captureSceneLayout(world.venues[0]),
    occupants: [{ characterId: "a", name: "A", zoneId: "exterior", doing: "Listening" }],
  },
  operation: { input: admission },
} as typeof scene;
for (const failure of ["none", "validation-input", "presentation-publish", "invalid-response"]) {
  const retained = new Map<string, unknown>();
  let pending = true,
    paid = 0,
    rejected = 0;
  world.villagers[0].sprite = sprite as any;
  const gmAdmission = { ...admission, writingContractVersion: 4 };
  const gmScene = {
    ...writingScene,
    id: "gm-storage-" + failure,
    operation: { input: gmAdmission },
  } as typeof scene;
  Object.assign(gmScene, zoneEventScene(gmScene, world.venues[0]));
  const gmPorts = {
    ...ports,
    villagesConnectionIdFor: async () => "narration",
    villagesLanguageModels: () => ({ resolveForRequest: async () => ({ ...model, connectionId: "narration" }) }),
    readEffectiveVillagerCard,
    readVillageLore: async () => [],
    villagesLogger: () => ({ warn: () => assert.fail("Unexpected warning") }),
    measurePipeline: async (_label: string, _metadata: unknown, work: () => Promise<unknown>) => work(),
    runtimeDebug() {},
    venueOperationId: () => gmScene.id,
    refreshZoneParticipants: async (current: unknown) => current,
    venueSavedCheckpoint: (key: string) => retained.get(key),
    venueCheckpoint: async (key: string, work: () => Promise<unknown>) => {
      if (retained.has(key)) return structuredClone(retained.get(key));
      const value = await work();
      const inputFailure = failure === "validation-input" && key.startsWith("gm:semantic-");
      const publishFailure = failure === "presentation-publish" && key.startsWith("gm-presentation:");
      if (pending && (inputFailure || publishFailure)) {
        pending = false;
        if (publishFailure) retained.set(key, structuredClone(value));
        throw Error("Checkpoint persistence unavailable");
      }
      retained.set(key, structuredClone(value));
      return value;
    },
    rejectVenueCompletion: async (_details?: unknown, options?: { stages?: string[] }) => {
      rejected++;
      for (const key of options?.stages ?? []) retained.delete(key);
    },
    completeWithRoom: async (_model: unknown, messages: { content: string }[]) => {
      paid++;
      const catalog = scenePromptPacket(
        messages.map((message) => message.content).join("\n"),
        scenePersonReferences(["a", "b"]),
      ).context.actors;
      assert.ok(
        catalog
          .find((actor: any) => actor.id === "a")
          .expressions.some((expression: any) => expression.id === "g-e-first"),
      );
      assert.doesNotMatch(JSON.stringify(catalog), /happy_01|happy_blush|"expressionId"/);
      return {
        finishReason: "stop",
        content:
          "INPUT []\n[a] Hello.\nCHANGES\n" +
          JSON.stringify({
            presentation: [
              { segment: 0, staging: [{ characterId: "a", expression: "g-e-first", look: { target: "player" } }] },
            ],
            ...(failure === "invalid-response" && paid === 1
              ? {
                  access: [
                    { actorId: "a", venueId: "missing", zoneId: "missing", outcome: "invite-now", evidence: [0] },
                  ],
                }
              : {}),
          }),
      };
    },
  };
  const gmWriter = createSceneWriting({
    ...gmPorts,
    semantic: createSemanticService(gmPorts as unknown as SemanticPorts),
  } as unknown as SceneWritingPorts);
  Math.random = () => 0;
  try {
    if (failure !== "none") {
      await assert.rejects(
        () => gmWriter.generate(gmScene, "", "chat", "", null),
        failure === "invalid-response" ? /unknown target|scope|authority/ : /Checkpoint persistence/,
      );
    } else {
      const written = await gmWriter.generate(gmScene, "", "chat", "", null);
      assert(!Object.hasOwn(written.lines[0], "expression"));
      assert(!Object.hasOwn(written.lines[0], "gazeAt"));
      assert.equal(written.lines[0].staging![0].expression, "e-first");
    }
    assert.equal(paid, 1);
    assert.equal(rejected, failure === "invalid-response" ? 1 : 0, "Storage failures cannot reject valid paid writing");
    Math.random = () => 0.999;
    const recovered = await gmWriter.generate(gmScene, "", "chat", "", null);
    assert.equal(
      paid,
      failure === "invalid-response" ? 2 : 1,
      "Only rejected model output can require another paid response",
    );
    if (failure === "presentation-publish")
      assert.equal(
        recovered.lines[0].staging![0].expression,
        "e-first",
        "A retained concrete choice survives failed root publication",
      );
  } finally {
    Math.random = originalRandom;
  }
}
console.log(
  "GM sprite selection: one response, optional cues, visibility, captured catalogs and concrete-variant recovery passed.",
);
