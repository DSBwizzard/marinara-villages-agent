import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Read-only compatibility check against a deliberately selected Engine checkout.
// Ordinary image behavior tests use the repository's locked Fastify dependency.
async function main() {
  const engineRoot = process.env.MARINARA_ENGINE_ROOT;
  assert.ok(engineRoot, "Set MARINARA_ENGINE_ROOT to the Engine checkout being compatibility-tested.");
  const source = await readFile(join(engineRoot, "packages/server/src/routes/characters.routes.ts"), "utf8");
  const squeeze = (text: string) => text.replace(/\s+/g, "");
  const rule = `name.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 120) || "character"`;
  assert.ok(squeeze(source).includes(squeeze(rule)), "Engine's avatar identifier normalization moved");
  assert.ok(
    squeeze(source).includes(squeeze('${purpose === "character-sheet" ? "character-sheet" : "avatar"}:${')),
    "Engine's avatar identifier prefix moved",
  );
  assert.ok(
    squeeze(source).includes(
      squeeze('promptOverrideById.get(avatarGenerationPromptId(body.name ?? "character", body.purpose))'),
    ),
    "Engine's avatar override lookup moved",
  );
  console.log(
    "Villages image Engine contract: identifier normalization, prefix and override lookup match the selected read-only Engine source; no model requests.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
