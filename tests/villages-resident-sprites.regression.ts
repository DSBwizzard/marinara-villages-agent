import { downloadSpriteImage } from "../packages/villages/src/client/shared/image-download.js";
import assert from "node:assert/strict";

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { villagesWalk } from "../packages/villages/src/client/features/scenes/villages-chat-paragraphs.ts";
import {
  selectSpriteImage,
  spriteFacing,
} from "../packages/villages/src/client/features/scenes/villages-sprite-stage.ts";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { parseVenueReply } from "../packages/villages/src/server/domain/rules/scene-reply.js";
import {
  describeSpriteExpressions,
  resolveSpriteExpression,
  resolveSceneSpriteExpressions,
  validateSpriteExpression,
} from "../packages/villages/src/server/domain/rules/sprite-expressions.js";
import {
  parseVillagesTurnBeats,
  renderVillagesTurnBeats,
} from "../packages/villages/src/server/domain/rules/turn-beats.js";
const answer = `[expression:happy] "Welcome home."\n\n[expression:unknown] "Maybe."\n\n[side] "Quiet now."`;
const beats = parseVillagesTurnBeats(answer);
assert.ok(beats);
assert.deepEqual(
  beats.map((beat) => beat.expression ?? null),
  ["happy", "unknown", null],
);
assert.equal(renderVillagesTurnBeats(beats).includes("[expression:"), false);
const walk = villagesWalk(renderVillagesTurnBeats(beats), beats);
assert.deepEqual(walk.expressions, ["happy", "unknown"]);
assert.equal(walk.asides[1]?.[0]?.text, '"Quiet now."');
assert.deepEqual(villagesWalk('"Old line."', null).expressions, [null]);
const directions = [spriteFacing(1, -1), spriteFacing(1, 0), spriteFacing(1, 2)];
assert.deepEqual(directions, ["front", "left", "right"]);
const images = [
  { view: "front" as const, label: "neutral", url: "/front-neutral" },
  { view: "front" as const, label: "happy", url: "/front-happy" },
  { view: "side" as const, label: "neutral", url: "/side-neutral" },
];
assert.deepEqual(selectSpriteImage(images, "happy", "left"), { image: images[2], mirrored: true });
assert.deepEqual(selectSpriteImage(images, "happy", "right"), { image: images[2], mirrored: false });
assert.deepEqual(selectSpriteImage(images.slice(0, 2), "happy", "left"), { image: images[1], mirrored: false });
const customImages = [
  {
    view: "side" as const,
    label: "delighted",
    expressionId: "e-custom",
    isDefault: true,
    url: "/delighted",
  },
  { view: "front" as const, label: "running", expressionId: "e-running", url: "/running" },
];
assert.equal(selectSpriteImage(customImages, "", "left")?.image.url, "/delighted");
assert.equal(selectSpriteImage(customImages, "e-running", "left")?.image.url, "/delighted");
assert.equal(
  selectSpriteImage(customImages, "pleased", "front")?.image.url,
  "/delighted",
  "unavailable labels use the default",
);
assert.equal(selectSpriteImage(customImages, "unknown", "front")?.image.url, "/delighted");
const directionalImages = [
  { view: "front" as const, label: "neutral", expressionId: "e-neutral", isDefault: true, url: "/front-default" },
  { view: "side" as const, direction: "right" as const, label: "smile", expressionId: "e-smile", url: "/side-smile" },
  {
    view: "side" as const,
    direction: "left" as const,
    label: "neutral",
    expressionId: "e-neutral",
    url: "/side-default",
  },
];
assert.deepEqual(
  selectSpriteImage(directionalImages, "e-smile", "front"),
  { image: directionalImages[0], mirrored: false },
  "player attention uses the front default when the expression has only side artwork",
);
assert.deepEqual(selectSpriteImage(directionalImages, "e-smile", "left"), {
  image: directionalImages[1],
  mirrored: true,
});
assert.deepEqual(
  selectSpriteImage(directionalImages, "missing", "right"),
  { image: directionalImages[2], mirrored: true },
  "left-facing originals mirror toward a resident on the right",
);
assert.equal(selectSpriteImage([], "e-smile", "front"), null);
const semanticSprite = {
  assetId: "villages-123e4567-e89b-42d3-a456-426614174000",
  expressions: [
    {
      view: "front" as const,
      label: "running",
      filename: "running.png",
      expressionId: "e-running",
      name: "Running",
      assetId: "villages-123e4567-e89b-42d3-a456-426614174000",
      useWhen: "Already moving quickly.",
    },
  ],
  framing: { mode: "full" as const, cropPercent: 58 },
};
assert.match(describeSpriteExpressions(semanticSprite), /Already moving quickly/);
assert.match(describeSpriteExpressions(semanticSprite), /e-running/);
const catalog = describeSpriteExpressions({
  ...semanticSprite,
  expressions: [...semanticSprite.expressions, { ...semanticSprite.expressions[0], view: "side" as const }],
});
const described = JSON.parse(catalog);
assert.deepEqual(described.views, ["front", "side"], "the writer sees every available view of one expression");
assert.equal(described.id, "e-running");
assert.equal(validateSpriteExpression(semanticSprite, "e-running"), "e-running");
assert.equal(validateSpriteExpression(semanticSprite, "running"), "", "new selections require stable IDs");
assert.equal(validateSpriteExpression(semanticSprite, "e-someone-else"), "", "another character's IDs are rejected");

const staged = parseVenueReply(
  {
    heardPlayerBy: [],
    segments: [
      { kind: "dialogue", speakerId: "resident-a", text: "Hello.", heardBy: ["resident-b"], gazeAt: "resident-b" },
      { kind: "dialogue", speakerId: "resident-b", text: "Hi.", heardBy: ["resident-a"], gazeAt: "outsider" },
      { kind: "whisper", speakerId: "resident-a", text: "Quiet.", heardBy: ["resident-b"], targetId: "resident-b" },
    ],
  },
  ["resident-a", "resident-b"],
);
assert.equal(staged.lines[0]?.gazeAt, "resident-b");
assert.equal(staged.lines[1]?.gazeAt, undefined, "unknown gaze targets cannot steer the stage");
assert.equal(staged.lines[2]?.gazeAt, "resident-b", "whispers face their target without extra model output");

const now = new Date().toISOString();
assert.equal(defaultVillageState().spriteCardFlipEnabled, true, "new Villages start with flips on");
assert.equal(
  coerceVillageState({ ...defaultVillageState(), version: 6 }).spriteCardFlipEnabled,
  true,
  "legacy Villages without a choice default to flips on",
);
assert.equal(
  coerceVillageState({ ...defaultVillageState(), version: 6, spriteCardFlipEnabled: "true" }).spriteCardFlipEnabled,
  true,
);
assert.equal(
  coerceVillageState({ ...defaultVillageState(), version: 6, spriteCardFlipEnabled: false }).spriteCardFlipEnabled,
  false,
  "saved Off stays Off",
);
const flipVillage = coerceVillageState({ ...defaultVillageState(), version: 6, spriteCardFlipEnabled: true });
assert.equal(
  coerceVillageState(JSON.parse(JSON.stringify(flipVillage))).spriteCardFlipEnabled,
  true,
  "the Village document preserves the shared setting through storage round trips",
);
const resident = {
  characterId: "a",
  addedAt: now,
  cardSnapshot: { id: "a", revision: 1, sourceStatus: "available", name: "A", capturedAt: now },
  sprite: semanticSprite,
};
assert.equal(
  coerceVillageState({ ...defaultVillageState(), version: 6, wishSystemVersion: 3, villagers: [resident] }).villagers[0]
    ?.sprite,
  null,
  "retired unversioned assignments are ignored",
);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = readFileSync(
  join(root, "packages/villages/src/client/features/residents/villages-sprite-manager.tsx"),
  "utf8",
);
assert.match(entry, /Upload images/);
assert.match(entry, /Save and use in Scenes/);
assert.match(entry, /Download saved PNG/);
assert.doesNotMatch(entry, /generate-sheet|repair-background|Suggest another pose/);
console.log("Resident expressions, stage selection, gaze, portrait fallback and retired assignments passed.");

// Engine filenames group automatically, independently of reviewed display labels.
const variantSprite = {
  ...semanticSprite,
  defaultExpressionId: "e-base",
  expressions: [
    { ...semanticSprite.expressions[0], expressionId: "e-base", spriteName: "happy", name: "Base" },
    { ...semanticSprite.expressions[0], expressionId: "e-first", spriteName: "happy_01", name: "Warm smile" },
    { ...semanticSprite.expressions[0], expressionId: "e-second", spriteName: "HAPPY_blush", name: "Bright smile" },
    { ...semanticSprite.expressions[0], expressionId: "e-side", spriteName: "happy_side", view: "side" as const },
    { ...semanticSprite.expressions[0], expressionId: "e-other", spriteName: "sad_01" },
  ],
};
const choices = [...describeSpriteExpressions(variantSprite, true).matchAll(/"id":/g)];
// Parse the actual complete catalog without splitting authored descriptions on punctuation.
const grouped = JSON.parse(
  describeSpriteExpressions({ ...variantSprite, expressions: variantSprite.expressions.slice(0, 4) }, true),
);
assert.equal(grouped.name, "happy");
assert.equal(grouped.id, "g-e-base");
assert.equal(grouped.isDefault, true);
assert.deepEqual(grouped.views, ["front", "side"]);
assert.equal(choices.length, 2, "a single suffixed sad image stays an individual choice");
assert.equal(validateSpriteExpression(variantSprite, grouped.id, false), "");
assert.equal(resolveSpriteExpression(variantSprite, grouped.id, false, "front", 0.9), "");
assert.equal(resolveSpriteExpression(variantSprite, grouped.id, true, "front", 0), "e-base");
assert.equal(resolveSpriteExpression(variantSprite, grouped.id, true, "front", 0.99), "e-second");
assert.equal(resolveSpriteExpression(variantSprite, grouped.id, true, "side", 0), "e-side");
assert.equal(
  resolveSpriteExpression(variantSprite, "e-first", true, "front", 0.99),
  "e-first",
  "concrete choices never reroll",
);
assert.ok(!describeSpriteExpressions(variantSprite, false).includes('"id":"g-'));
assert.equal(
  resolveSpriteExpression(semanticSprite, grouped.id, true, "front", 0),
  "",
  "groups cannot select another resident's artwork",
);
const cueLines = [
  { speakerId: "a", staging: [{ characterId: "a", look: { target: "villager" as const, characterId: "b" } }] },
  { speakerId: "a", expression: grouped.id, staging: [{ characterId: "a", expression: grouped.id }] },
  {
    speakerId: "a",
    expression: grouped.id,
    gazeAt: "b",
    staging: [{ characterId: "a", look: { target: "player" as const } }],
  },
];
const stageState = { a: { position: "left" as const, expression: "", look: { target: "player" as const } } };
resolveSceneSpriteExpressions(
  cueLines,
  stageState,
  () => variantSprite,
  true,
  () => 0.99,
);
assert.equal(cueLines[1].expression, "e-side", "gaze-only cues persist to later variant selection");
assert.equal(cueLines[1].staging[0].expression, "e-side", "speaker and staging share the same concrete pick");
assert.equal(cueLines[2].expression, "e-second", "explicit staging attention wins over older gaze hints");
const persisted = JSON.parse(JSON.stringify(cueLines));
resolveSceneSpriteExpressions(
  persisted,
  stageState,
  () => variantSprite,
  true,
  () => 0,
);
assert.deepEqual(persisted, cueLines, "saved concrete artwork survives reload and a different random draw");
assert.equal(defaultVillageState().spriteVariantsEnabled, true);
assert.equal(
  coerceVillageState({ ...defaultVillageState(), version: 6, spriteVariantsEnabled: false }).spriteVariantsEnabled,
  false,
);
assert.equal(
  coerceVillageState({ ...defaultVillageState(), version: 6, spriteVariantsEnabled: undefined }).spriteVariantsEnabled,
  true,
);

const globalHost = globalThis as typeof globalThis & { __MARINARA_HOST__?: unknown };
const previousHost = globalHost.__MARINARA_HOST__;
const downloads: unknown[] = [];
try {
  globalHost.__MARINARA_HOST__ = {
    api: {
      api: {
        download: async (...args: unknown[]) => {
          downloads.push(args);
        },
      },
    },
  };
  await downloadSpriteImage("/api/sprites/villages-owned/file/saved.png", "happy.png");
  assert.deepEqual(downloads, [["/sprites/villages-owned/file/saved.png", "happy.png"]]);
  globalHost.__MARINARA_HOST__ = {
    api: {
      api: {
        download: async () => {
          throw new Error("Host save failed");
        },
      },
    },
  };
  await assert.rejects(downloadSpriteImage("/api/sprites/owned/file/image.png", "image.png"), /Host save failed/);
} finally {
  globalHost.__MARINARA_HOST__ = previousHost;
}
