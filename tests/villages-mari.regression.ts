import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PNG } from "pngjs";
import { villagesDefinition } from "../packages/villages/package-definition.mjs";
import {
  MARI_SPRITE_NAMES,
  PROFESSOR_MARI_ID as id,
  mariSpriteFiles,
} from "../packages/villages/src/shared/helpers/professor-mari.js";
import { engineSpriteUrl, groupNumberedSpritePairs } from "../packages/villages/src/shared/helpers/sprite-variants.js";
import {
  withMariSpriteDefaults,
  MARI_VILLAGES_CONTEXT,
} from "../packages/villages/src/server/domain/rules/professor-mari.js";
import { automaticVisitorSprites } from "../packages/villages/src/server/domain/rules/visitor-sprites.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { readEffectiveVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  createSpriteSetup,
  type SpriteSetupPorts,
} from "../packages/villages/src/server/features/media/sprite-setup-service.js";
import { createSpriteWrites } from "../packages/villages/src/server/features/media/sprite-writes.js";
import { socialWorldFixture } from "./fixtures/social-world.fixture.js";

const defaults = withMariSpriteDefaults(id, null)!;
assert.equal(defaults.assignments.length, 12);
assert(defaults.assignments.every((slot) => slot.view === "front"));
assert.equal(defaults.expressions.find((row) => row.id === defaults.defaultExpressionId)?.name, "Neutral");
const groups = groupNumberedSpritePairs(defaults.expressions);
assert.equal(groups.find((group) => group.name === "Happy")?.members.length, 2);
assert.equal(groups.find((group) => group.name === "Neutral")?.members.length, 3);
assert.equal(groups.find((group) => group.name === "Thinking")?.members.length, 2);
assert(defaults.expressions.some((row) => row.name === "Playful"));
const old = automaticVisitorSprites([{ filename: "happy.webp", label: "Happy", url: "" }], [])!;
assert.deepEqual(withMariSpriteDefaults(id, old), defaults, "Untouched old automatic art adopts the final set");
for (const custom of [
  { ...old, useSprites: false },
  { ...old, lastSave: { id: "saved", digest: "digest" } },
  { ...old, defaultView: "front" as const },
  { ...old, expressions: [{ ...old.expressions[0]!, name: "My expression" }] },
  { ...old, assignments: [] },
  { ...old, framing: { mode: "half" as const } },
])
  assert.equal(withMariSpriteDefaults(id, custom), custom, "Explicit Appearance choices remain authoritative");
assert.equal(withMariSpriteDefaults("someone-else", old), old);

for (const name of MARI_SPRITE_NAMES) {
  const path = `mari-visitor-sprites/${name}.png`;
  assert(villagesDefinition.assetPaths.includes(path));
  assert(villagesDefinition.contributions.assets.paths.includes(path));
  const bytes = await readFile(new URL(`../packages/villages/${path}`, import.meta.url));
  const png = PNG.sync.read(bytes);
  assert.deepEqual([png.width, png.height], [1024, 1536]);
  assert.equal(png.data[3], 0, "Hidden corner RGB stays transparent when composited");
  if (name === "Neutral")
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      "19318dac988cfc99377da4a7c39d344f55961e0885860123f617d6ec4df6f5a6",
    );
  const file = mariSpriteFiles.find((row) => row.label === name)!;
  assert.equal(engineSpriteUrl(id, file.filename), file.url);
  assert(engineSpriteUrl("someone-else", file.filename).startsWith("/api/sprites/"));
}
assert.equal(engineSpriteUrl(id, "custom.png", "12"), `/api/sprites/${id}/file/custom.png?v=12`);

let world = socialWorldFixture();
const mari = {
  ...world.villagers[0]!,
  characterId: id,
  cardSnapshot: { ...world.villagers[0]!.cardSnapshot, id, name: "Professor Mari", scenario: "Original scenario." },
  spriteManager: old,
  sprite: null,
  visitsEnabled: true,
  visitsRevision: "mari",
};
world.visitors = [mari];
const before = structuredClone(mari.cardSnapshot);
assert.equal(readEffectiveVillagerCard(mari).scenario, "Original scenario.\n\n" + MARI_VILLAGES_CONTEXT);
assert.deepEqual(mari.cardSnapshot, before, "Effective context does not rewrite the Engine card snapshot");
assert.equal(readEffectiveVillagerCard(world.villagers[0]!).scenario, world.villagers[0]!.cardSnapshot.scenario);
const scene = coerceSession({
  version: 5,
  id: "frozen",
  villageSeed: world.seed,
  startedAt: world.setupAt,
  participants: [{ characterId: id, name: "Professor Mari", doing: "visiting" }],
  activeIds: [id],
});
scene.continuity = captureSceneContinuity(world, scene, Date.parse(world.setupAt));
assert.deepEqual(
  coerceSession(scene).continuity!.facts.visitors![0]!.spriteManager,
  old,
  "Saved Scene source art stays exact",
);
world = coerceVillageState(world);
assert.deepEqual(world.visitors![0]!.spriteManager, defaults, "Live defaults upgrade independently of captured Scenes");

const service = createSpriteSetup({
  villagesDocuments: () => ({ getById: async () => null }),
  villageEngineJson: async () => {
    throw new Error("Native card unavailable");
  },
  writes: createSpriteWrites(),
  readVillageState: async () => structuredClone(world),
  mutateVillageState: async (update) => {
    const next = structuredClone(world);
    update(next);
    world = coerceVillageState(next);
    return structuredClone(world);
  },
} as SpriteSetupPorts);
const appearance = await service.settled(id, true);
assert.equal(appearance.files.length, 12, "Bundled Appearance library works without a native card");
const expressions = defaults.expressions.map((row) => ({
  ...row,
  front: { filename: defaults.assignments.find((slot) => slot.expressionId === row.id)!.engineFilename! },
}));
const saved = await service.save(
  id,
  {
    resident: true,
    token: appearance.token,
    requestId: "final-art",
    useSprites: true,
    expressions,
    defaultExpressionId: defaults.defaultExpressionId,
  },
  new AbortController().signal,
);
assert.equal(saved.manager.assignments.length, 12);
await service.save(
  id,
  {
    resident: true,
    token: saved.token,
    requestId: "portrait",
    useSprites: false,
    expressions,
    defaultExpressionId: defaults.defaultExpressionId,
  },
  new AbortController().signal,
);
assert.equal(coerceVillageState(world).visitors![0]!.spriteManager!.useSprites, false);
console.log("Mari's final sprites preserve variants, explicit Appearance choices, captured Scenes and source cards.");
