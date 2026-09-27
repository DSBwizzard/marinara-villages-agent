import assert from "node:assert/strict";
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
import {
  readSpriteExpression,
  readSpriteView,
  spriteGenerationBody,
} from "../packages/villages/src/engine/packages/server/src/services/villages/resident-sprites.ts";
import { parseVenueReply } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-session.ts";
import { villageEngineJson } from "../packages/villages/src/engine/packages/server/src/services/villages/engine-loopback.ts";

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
assert.equal(readSpriteExpression("Very Happy"), "very_happy");
assert.throws(() => readSpriteExpression("../wrong"), /short expression name/);
assert.equal(readSpriteView(undefined), "front");
assert.equal(readSpriteView("side"), "side");
assert.throws(() => readSpriteView("back"), /front or side/);

const sideRequest = spriteGenerationBody({
  connectionId: "image-1",
  name: "Resident",
  appearance: "Dark coat",
  view: "side",
  expression: "neutral",
  referenceUrl: "/api/sprites/villages-1/file/neutral.png",
});
assert.equal(sideRequest.fullBodyExpressionMode, true);
assert.match(sideRequest.appearance, /right-facing side profile/);
assert.equal(sideRequest.neutralFullBodyReference, "/api/sprites/villages-1/file/neutral.png");
assert.equal("referenceImages" in sideRequest, false, "side generation uses one identity reference");
assert.equal(
  "referenceImages" in
    spriteGenerationBody({
      connectionId: "image-1",
      name: "Resident",
      appearance: "Dark coat",
      view: "front",
      expression: "neutral",
      referenceUrl: "/api/sprites/villages-1/file/neutral.png",
      portrait: "/api/avatars/file/resident.png",
    }),
  false,
  "an approved neutral takes priority over the portrait on regeneration",
);
const frontRequest = spriteGenerationBody({
  connectionId: "image-1",
  name: "Resident",
  appearance: "Dark coat",
  view: "front",
  expression: "neutral",
  portrait: "/api/avatars/file/resident.png",
});
assert.equal(frontRequest.fullBodyExpressionMode, false);
assert.match(frontRequest.appearance, /Face straight toward the viewer/);
assert.deepEqual(frontRequest.referenceImages, ["/api/avatars/file/resident.png"]);

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

async function checkEngineRefusal() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        error: "All full-body expression generations failed",
        failedExpressions: [{ expression: "happy", error: "Image connection accepts only one reference" }],
      }),
      { status: 500 },
    );
  try {
    await assert.rejects(
      villageEngineJson("/api/sprites/generate-sheet", { body: {} }),
      /Image connection accepts only one reference/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
}

const now = "2026-09-22T12:00:00.000Z";
const id = "resident-a";
const assetId = "villages-123e4567-e89b-42d3-a456-426614174000";
const saved = coerceVillageState({
  villagers: [
    {
      characterId: id,
      cardSnapshot: {
        id,
        revision: 1,
        sourceStatus: "missing",
        name: "Resident",
        capturedAt: now,
        appearance: "Dark coat",
      },
      sprite: {
        assetId,
        expressions: [
          { label: "neutral", filename: "neutral.png", revision: 123 },
          { label: "happy", filename: "happy.webp" },
        ],
        framing: { mode: "half", cropPercent: 61 },
      },
    },
  ],
});
assert.equal(saved.villagers[0]?.sprite?.assetId, assetId, "Village sprite survives a missing source card");
assert.equal(saved.villagers[0]?.sprite?.expressions[0]?.revision, 123);
assert.equal(saved.villagers[0]?.sprite?.expressions[0]?.view, "front", "legacy sprites remain front-facing");
assert.deepEqual(saved.villagers[0]?.sprite?.framing, { mode: "half", cropPercent: 61 });
const paired = coerceVillageState({
  villagers: [
    {
      ...saved.villagers[0],
      sprite: {
        assetId,
        sideAssetId: "villages-123e4567-e89b-42d3-a456-426614174001",
        expressions: [
          { view: "front", label: "neutral", filename: "neutral.png" },
          { view: "side", label: "neutral", filename: "side_neutral.png" },
        ],
      },
    },
  ],
});
assert.deepEqual(
  paired.villagers[0]?.sprite?.expressions.map(({ view, label }) => `${view}:${label}`),
  ["front:neutral", "side:neutral"],
);
assert.equal(paired.villagers[0]?.sprite?.sideAssetId, "villages-123e4567-e89b-42d3-a456-426614174001");
assert.equal(
  coerceVillageState({
    villagers: [{ ...paired.villagers[0], sprite: { ...paired.villagers[0]?.sprite, sideAssetId: undefined } }],
  }).villagers[0]?.sprite?.expressions.filter((entry) => entry.view === "side").length,
  0,
  "an invalid side asset cannot produce broken image URLs",
);
assert.equal(
  coerceVillageState({ villagers: [{ ...saved.villagers[0], sprite: { assetId: "../unsafe", expressions: [] } }] })
    .villagers[0]?.sprite,
  null,
);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = readFileSync(
  join(root, "packages/villages/src/engine/packages/client/src/villages-package-entry.tsx"),
  "utf8",
);
assert.ok(entry.includes("Facing villagers"));
assert.ok(entry.includes("Review candidate"));
assert.ok(entry.includes("Download both views and manifest"));
assert.ok(entry.includes('item.label === "neutral"'));
assert.ok(entry.includes("Approve this sprite"));

checkEngineRefusal()
  .then(() =>
    console.log(
      "Villages resident sprite regression: view migration, generation request, staged gaze, art fallback and creator controls ok",
    ),
  )
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
