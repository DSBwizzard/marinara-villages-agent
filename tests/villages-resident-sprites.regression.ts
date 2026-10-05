import assert from "node:assert/strict";
import { parseVenueReply } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-session.ts";
import {
  describeSpriteExpressions,
  validateSpriteExpression,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-expressions.ts";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { villagesWalk } from "../packages/villages/src/engine/packages/client/src/villages-chat-paragraphs.ts";
import {
  selectSpriteImage,
  spriteFacing,
} from "../packages/villages/src/engine/packages/client/src/villages-sprite-stage.ts";
import {
  parseVillagesTurnBeats,
  renderVillagesTurnBeats,
} from "../packages/villages/src/engine/packages/server/src/services/villages/turn-beats.ts";
import { coerceVillageState } from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.ts";
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
assert.deepEqual(selectSpriteImage(images, "happy", "left"), { image: images[1], mirrored: false });
assert.deepEqual(selectSpriteImage(images, "happy", "right"), { image: images[1], mirrored: false });
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
assert.equal(selectSpriteImage(customImages, "e-running", "left")?.image.url, "/running");
assert.equal(
  selectSpriteImage(customImages, "pleased", "front")?.image.url,
  "/delighted",
  "unavailable labels use the default",
);
assert.equal(selectSpriteImage(customImages, "unknown", "front")?.image.url, "/delighted");
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
assert.equal(coerceVillageState({}).spriteCardFlipEnabled, false, "legacy Villages start with flips off");
assert.equal(coerceVillageState({ spriteCardFlipEnabled: "true" }).spriteCardFlipEnabled, false);
const flipVillage = coerceVillageState({ spriteCardFlipEnabled: true });
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
  coerceVillageState({ wishSystemVersion: 3, villagers: [resident] }).villagers[0]?.sprite,
  null,
  "retired unversioned assignments are ignored",
);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = readFileSync(
  join(root, "packages/villages/src/engine/packages/client/src/villages-sprite-manager.tsx"),
  "utf8",
);
assert.match(entry, /Upload images/);
assert.match(entry, /Save and use in Scenes/);
assert.match(entry, /Download PNG/);
assert.doesNotMatch(entry, /generate-sheet|repair-background|Suggest another pose/);
console.log("Resident expressions, stage selection, gaze, portrait fallback and retired assignments passed.");
