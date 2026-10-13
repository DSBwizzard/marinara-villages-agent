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
  const { loadEngineImageStyleSupport } =
    await import("../packages/villages/src/server/adapters/engine/image-style-profiles.js");
  const support = await loadEngineImageStyleSupport(join(engineRoot, "packages/server/dist/index.js"));
  const defaults = support.normalizeImageStyleProfileSettings(null);
  assert.ok(defaults.profiles.length > 2, "Fresh Engine built-ins are available without Illustrator settings");
  assert.ok(defaults.profiles.some((row) => row.id === defaults.defaultProfileId));
  const partial = support.normalizeImageStyleProfileSettings({
    defaultProfileId: "deleted",
    profiles: [{ id: "test-ink", name: "User ink", styleText: "Ink rendering", negativeTags: "shiny" }],
  });
  assert.equal(partial.defaultProfileId, defaults.defaultProfileId);
  for (const row of defaults.profiles) assert.ok(partial.profiles.some((other) => other.id === row.id));
  assert.ok(partial.profiles.some((row) => row.id === "test-ink"));
  for (const row of partial.profiles) {
    const geometry = "Five connected rooms around an open courtyard. Corridors follow the described layout.";
    const compiled = support.compileImagePrompt({
      kind: "background",
      prompt: geometry,
      styleProfiles: partial,
      styleProfileId: row.id,
      hardNegative: "people, text, labels",
      omitProfileSubjectTags: true,
    });
    assert.ok(
      compiled.prompt.includes("Five connected rooms around an open courtyard"),
      row.name + " preserves map geometry",
    );
    assert.match(compiled.negativePrompt, /people/);
  }
  const ink = support.compileImagePrompt({
    kind: "background",
    prompt: "Room geometry",
    styleProfiles: partial,
    styleProfileId: "test-ink",
    hardNegative: "people",
    omitProfileSubjectTags: true,
  });
  assert.match(ink.prompt, /Ink rendering/);
  assert.match(ink.negativePrompt, /shiny/);
  console.log(
    "Villages image Engine contract: identifier normalization, prefix and override lookup, public style export loading, normalized built-ins/custom profiles and scene-preserving compilation match the selected read-only built Engine; no model requests.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
