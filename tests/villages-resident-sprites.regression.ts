import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { villagesWalk } from "../packages/villages/src/engine/packages/client/src/villages-chat-paragraphs.ts";
import {
  parseVillagesTurnBeats,
  renderVillagesTurnBeats,
} from "../packages/villages/src/engine/packages/server/src/services/villages/turn-beats.ts";
import { coerceVillageState } from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.ts";
import { readSpriteExpression } from "../packages/villages/src/engine/packages/server/src/services/villages/resident-sprites.ts";
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
assert.deepEqual(saved.villagers[0]?.sprite?.framing, { mode: "half", cropPercent: 61 });
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
assert.ok(entry.includes("More starter expressions are coming."));
assert.ok(entry.includes("Download sheet and manifest"));
assert.ok(entry.includes('item.label === "neutral"'));
assert.ok(entry.includes("Approve this sprite"));

checkEngineRefusal()
  .then(() =>
    console.log(
      "Villages resident sprite regression: expression beats, legacy fallback, saved ownership, framing, creator controls and provider error ok",
    ),
  )
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
