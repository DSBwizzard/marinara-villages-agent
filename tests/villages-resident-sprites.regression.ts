import assert from "node:assert/strict";

import { selectSpriteImage } from "../packages/villages/src/client/features/scenes/villages-sprite-stage.ts";
import {
  emptySpriteManager,
  managerResidentSprite,
} from "../packages/villages/src/server/domain/rules/sprite-manager-model.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { lineStagingCues } from "../packages/villages/src/shared/helpers/scene-staging.js";
import { readNarrationReply } from "../packages/villages/src/server/domain/rules/narration-contract.js";
import {
  describeSpriteExpressions,
  resolveSpriteExpression,
  resolveSceneSpriteExpressions,
  validateSpriteExpression,
} from "../packages/villages/src/server/domain/rules/sprite-expressions.js";
const images = [
  { view: "front" as const, label: "neutral", url: "/front-neutral" },
  { view: "front" as const, label: "happy", url: "/front-happy" },
  { view: "side" as const, label: "neutral", url: "/side-neutral" },
];
const legacyManager = emptySpriteManager();
legacyManager.expressions = [
  { id: "paired", name: "Happy" },
  { id: "single", name: "Thoughtful" },
];
legacyManager.assignments = [
  { expressionId: "paired", view: "front", engineFilename: "happy.png" },
  { expressionId: "paired", view: "side", engineFilename: "happy-alt.png" },
  { expressionId: "single", view: "side", engineFilename: "thoughtful.png" },
];
legacyManager.defaultExpressionId = "paired";
legacyManager.defaultView = "side";
const storedManager = structuredClone(legacyManager);
const ordinary = managerResidentSprite(legacyManager, "resident")!;
assert.deepEqual(
  ordinary.expressions.map(({ filename, view }) => ({ filename, view })),
  [
    { filename: "happy-alt.png", view: "front" },
    { filename: "thoughtful.png", view: "front" },
  ],
);
assert.deepEqual(legacyManager, storedManager, "Reading ordinary sprites preserves all paired saved assignments");
assert.deepEqual(selectSpriteImage(images, "happy"), { image: images[1], mirrored: false });
assert.deepEqual(selectSpriteImage(images, "happy"), { image: images[1], mirrored: false });
assert.deepEqual(selectSpriteImage(images.slice(0, 2), "happy"), { image: images[1], mirrored: false });
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
assert.equal(selectSpriteImage(customImages, "")?.image.url, "/delighted");
assert.equal(selectSpriteImage(customImages, "e-running")?.image.url, "/running");
assert.equal(selectSpriteImage(customImages, "pleased")?.image.url, "/delighted", "unavailable labels use the default");
assert.equal(selectSpriteImage(customImages, "unknown")?.image.url, "/delighted");
const directionalImages = [
  { view: "front" as const, label: "neutral", expressionId: "e-neutral", isDefault: true, url: "/front-default" },
  { view: "side" as const, label: "smile", expressionId: "e-smile", url: "/side-smile" },
  {
    view: "side" as const,
    label: "neutral",
    expressionId: "e-neutral",
    url: "/side-default",
  },
];
assert.deepEqual(
  selectSpriteImage(directionalImages, "e-smile"),
  { image: directionalImages[1], mirrored: false },
  "The chosen expression is used regardless of its old facing",
);
assert.deepEqual(selectSpriteImage(directionalImages, "e-smile"), {
  image: directionalImages[1],
  mirrored: false,
});
assert.deepEqual(
  selectSpriteImage(directionalImages, "missing"),
  { image: directionalImages[0], mirrored: false },
  "Missing expressions use the ordinary default",
);
assert.equal(selectSpriteImage([], "e-smile"), null);
const exactDefaultImages = [
  { ...directionalImages[0], isDefault: false },
  { ...directionalImages[2], isDefault: true },
];
assert.equal(selectSpriteImage(exactDefaultImages, "")?.image.url, "/side-default");
assert.equal(selectSpriteImage(exactDefaultImages, "e-neutral")?.image.url, "/front-default");
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
    },
  ],
  framing: { mode: "full" as const, cropPercent: 58 },
};
assert.doesNotMatch(describeSpriteExpressions(semanticSprite), /Already moving quickly/);
assert.match(describeSpriteExpressions(semanticSprite), /e-running/);
const catalog = describeSpriteExpressions({
  ...semanticSprite,
  expressions: [...semanticSprite.expressions, { ...semanticSprite.expressions[0], view: "side" as const }],
});
const described = JSON.parse(catalog);
assert.equal(Object.hasOwn(described, "views"), false, "The writer sees one sprite pool");
assert.equal(described.id, "e-running");
assert.equal(validateSpriteExpression(semanticSprite, "e-running"), "e-running");
assert.equal(validateSpriteExpression(semanticSprite, "running"), "", "new selections require stable IDs");
assert.equal(validateSpriteExpression(semanticSprite, "e-someone-else"), "", "another character's IDs are rejected");

const staged = readNarrationReply(
  {
    segments: [
      { kind: "dialogue", delivery: "whisper", speakerId: "resident-a", text: "Quiet.", targetId: "resident-b" },
    ],
  },
  ["resident-a", "resident-b"],
);
const whisper = staged.segments[0]!;
assert.equal(whisper.kind, "dialogue");
assert.deepEqual(
  lineStagingCues({ ...whisper, kind: "whisper" }),
  [{ characterId: "resident-a", look: { target: "villager", characterId: "resident-b" } }],
  "Whispers face their target without extra model output",
);

assert.equal(defaultVillageState().spriteCardFlipEnabled, true, "new Villages start with flips on");
assert.equal(
  coerceVillageState(defaultVillageState()).spriteCardFlipEnabled,
  true,
  "Villages without a choice default to flips on",
);
assert.equal(
  coerceVillageState({ ...defaultVillageState(), spriteCardFlipEnabled: "true" }).spriteCardFlipEnabled,
  true,
);
assert.equal(
  coerceVillageState({ ...defaultVillageState(), spriteCardFlipEnabled: false }).spriteCardFlipEnabled,
  false,
  "saved Off stays Off",
);
const flipVillage = coerceVillageState({ ...defaultVillageState(), spriteCardFlipEnabled: true });
assert.equal(
  coerceVillageState(JSON.parse(JSON.stringify(flipVillage))).spriteCardFlipEnabled,
  true,
  "the Village document preserves the shared setting through storage round trips",
);
console.log("Resident expressions, stage selection, gaze and portrait fallback passed.");

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
assert.equal(Object.hasOwn(grouped, "views"), false);
assert.equal(choices.length, 2, "a single suffixed sad image stays an individual choice");
assert.equal(validateSpriteExpression(variantSprite, grouped.id, false), "");
assert.equal(resolveSpriteExpression(variantSprite, grouped.id, false, 0.9), "");
assert.equal(resolveSpriteExpression(variantSprite, grouped.id, true, 0), "e-base");
assert.equal(resolveSpriteExpression(variantSprite, grouped.id, true, 0.99), "e-side");
assert.equal(resolveSpriteExpression(variantSprite, grouped.id, true, 0), "e-base");
assert.equal(resolveSpriteExpression(variantSprite, "e-first", true, 0.99), "e-first", "concrete choices never reroll");
assert.ok(!describeSpriteExpressions(variantSprite, false).includes('"id":"g-'));
assert.equal(
  resolveSpriteExpression(semanticSprite, grouped.id, true, 0),
  "",
  "groups cannot select another resident's artwork",
);

const numberedPairs = {
  defaultExpressionId: "e-one",
  expressions: [
    { expressionId: "e-one", name: "Big_Smile_01", spriteName: "front_a", view: "front" as const },
    { expressionId: "e-one", name: "Big_Smile_01", spriteName: "side_x", view: "side" as const },
    { expressionId: "e-two", name: "BIG_SMILE_02", spriteName: "front_b", view: "front" as const },
    { expressionId: "e-three", name: "Big_Smile_03", spriteName: "front_c", view: "front" as const },
    { expressionId: "e-three", name: "Big_Smile_03", spriteName: "side_y", view: "side" as const },
  ],
};
const numberedId = "g-e-one";
assert.deepEqual(JSON.parse(describeSpriteExpressions(numberedPairs, true)), {
  id: numberedId,
  name: "Big_Smile",
  isDefault: true,
});
assert.equal(resolveSpriteExpression(numberedPairs, numberedId, true, 0.5), "e-two");
assert.equal(resolveSpriteExpression(numberedPairs, numberedId, true, 0.5), "e-two");
assert.equal(resolveSpriteExpression(numberedPairs, numberedId, false, 0.5), "");
assert.equal(resolveSpriteExpression(numberedPairs, "e-one", true, 0.99), "e-one");
const withPlainFront = {
  ...numberedPairs,
  expressions: [
    { ...numberedPairs.expressions[0], name: "Big_Smile" },
    { ...numberedPairs.expressions[4], name: "Big_Smile_03" },
  ],
};
assert.equal(resolveSpriteExpression(withPlainFront, numberedId, true, 0.99), "e-three");
assert.equal(resolveSpriteExpression(withPlainFront, numberedId, true, 0), "e-one");

const named = {
  named: true as const,
  expressions: [
    { expressionId: "e-a", name: "Happy_01", view: "front" as const },
    { expressionId: "e-b", name: "Happy_pajamas_02", view: "front" as const },
    { expressionId: "e-c", name: "Happy_pajamas_04", view: "side" as const },
    { expressionId: "e-d", name: "Happy_pajamas_05", view: "side" as const },
    { expressionId: "e-e", name: "Unhappy_pajamas_04", view: "side" as const },
    { expressionId: "e-f", name: "Happy_pajamas_talk", view: "side" as const },
  ],
};
assert.equal(resolveSpriteExpression(named, "happy_pajamas_wounded", true, 0.99), "e-d");
assert.equal(resolveSpriteExpression(named, "happy_pajamas_wounded", true, 0.99), "e-d");
assert.equal(resolveSpriteExpression(named, "happy_pajamas", false, 0.99), "e-b");
assert.equal(resolveSpriteExpression(named, "happy_formal", true, 0), "e-a");
assert.equal(resolveSpriteExpression(named, "unhappy", true, 0), "e-e");
assert.equal(resolveSpriteExpression(named, "unknown_pajamas", true, 0), "");

const cueLines = [
  { speakerId: "a", staging: [{ characterId: "a", look: { target: "villager" as const, characterId: "b" } }] },
  { speakerId: "a", staging: [{ characterId: "a", expression: grouped.id }] },
  {
    speakerId: "a",
    staging: [{ characterId: "a", expression: grouped.id, look: { target: "player" as const } }],
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
assert.equal(cueLines[1].staging[0].expression, "e-side", "Gaze-only cues persist to later variant selection");
assert.equal(cueLines[2].staging[0].expression, "e-side", "Attention does not switch sprite pools");
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
  coerceVillageState({ ...defaultVillageState(), spriteVariantsEnabled: false }).spriteVariantsEnabled,
  false,
);
assert.equal(
  coerceVillageState({ ...defaultVillageState(), spriteVariantsEnabled: undefined }).spriteVariantsEnabled,
  true,
);
