import { describeSpriteExpressions } from "../packages/villages/src/server/domain/rules/sprite-expressions.js";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { PNG } from "pngjs";
import { selectSpriteImage } from "../packages/villages/src/client/features/scenes/villages-sprite-stage.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { managerResidentSprite } from "../packages/villages/src/server/domain/rules/sprite-manager-model.js";
import {
  createSpriteSetup,
  type SpriteSetupPorts,
} from "../packages/villages/src/server/features/media/sprite-setup-service.js";
import { createSpriteWrites } from "../packages/villages/src/server/features/media/sprite-writes.js";

const documents = new Map<string, unknown>();
const imageBytes = PNG.sync.write(new PNG({ width: 64, height: 96 }));
const imageData = "data:image/png;base64," + imageBytes.toString("base64");
let village = coerceVillageState(defaultVillageState());
let copied = 0;
const libraryFiles = ["full_suicejejshe.png", "full_defeult-1.png", "happy.png"];
let prepareGate: (() => Promise<void>) | undefined;
const service = createSpriteSetup({
  villagesDocuments: () => ({ getById: async (_pkg, id) => ({ data: structuredClone(documents.get(id)) }) }),
  mutateDocument: async (id, slot, update) => {
    const next = slot.coerce(documents.get(id));
    await update(next);
    documents.set(id, structuredClone(next));
  },
  villageEngineJson: async (path) => {
    if (path === "/api/connections/vision")
      return { provider: "custom", defaultParameters: JSON.stringify({ imageCaptioningEnabled: false }) };
    if (path === "/api/connections/pictures") return { provider: "image_generation" };
    if (path.startsWith("/api/characters/")) return { id: "bupkis" };
    if (path.startsWith("/api/sprites/"))
      return libraryFiles.map((filename, index) => ({ filename, ...(index === 0 ? { label: "Thoughtful" } : {}) }));
    throw Error(path);
  },
  villagesLanguageModels: () => assert.fail("Sprite setup must never resolve a model."),
  manager: {
    readImage: async () => imageData,
    prepareArtwork: async (name, _image, engineSource) => {
      copied++;
      await prepareGate?.();
      return {
        id: "a-" + randomUUID(),
        name,
        assetId: "villages-" + randomUUID(),
        origin: "engine",
        engineSource,
        frame: { x: 0, y: 0, width: 64, height: 96, scale: 1, offsetX: 0, offsetY: 0 },
        source: {
          filename: "original.png",
          url: "/original.png",
          width: 64,
          height: 96,
          sha256: createHash("sha256").update(imageBytes).digest("hex"),
        },
        rendered: { filename: "rendered.png", url: "/rendered.png" },
        warnings: [],
      };
    },
  },
  writes: createSpriteWrites(),
  readVillageState: async () => structuredClone(village),
  mutateVillageState: async (update) => {
    const next = structuredClone(village);
    update(next);
    village = next;
    return next;
  },
} as unknown as SpriteSetupPorts);

let draft = await service.prepare("bupkis");
assert.equal(draft.manager.artwork.length, 2, "only Engine full-body images enter setup");
assert.deepEqual(
  draft.assignments.map((item) => item.name),
  ["Thoughtful", "defeult-1"],
  "Engine labels and filenames prefill editable names",
);
assert.ok(draft.assignments.every((item) => item.view === "front" && !item.approved));
assert.equal("analyze" in service, false, "Sprite setup has no model analysis entry point");
await service.prepare("bupkis");
assert.equal(copied, 2, "opening setup reuses independent copies");
const stale = draft.revision;
draft = await service.save("bupkis", {
  ...draft,
  defaultArtworkId: draft.assignments[0].artworkId,
  useSprites: true,
  assignments: draft.assignments.map((item, index) => ({ ...item, view: index ? "front" : "side" })),
});
await assert.rejects(service.preparedManager("bupkis", draft.revision), /approved default/);
await assert.rejects(service.save("bupkis", { ...draft, revision: stale }), /changed/);
draft = await service.save("bupkis", {
  ...draft,
  assignments: draft.assignments.map((item, index) => ({ ...item, included: index === 0, approved: index === 0 })),
  validateForUse: true,
});
const manager = await service.preparedManager("bupkis", draft.revision);
assert.equal(manager!.assignments.length, 1);
const sprite = managerResidentSprite(manager)!;
assert.equal(sprite.expressions[0].view, "side");
const image = { view: "side" as const, label: "thinking", url: "/sprite" };
assert.equal(selectSpriteImage([image], "thinking", "right")!.mirrored, false);
assert.equal(selectSpriteImage([image], "thinking", "left")!.mirrored, true);
assert.equal(selectSpriteImage([{ ...image, view: "front" }], "thinking", "left")!.mirrored, false);
draft = await service.save("bupkis", { ...draft, useSprites: false });
assert.equal((await service.preparedManager("bupkis", draft.revision))!.assignments.length, 0);
assert.equal((await service.read("bupkis")).manager.artwork.length, 2, "unassigned images stay available");
await assert.rejects(service.preparedManager("bupkis", draft.revision - 1), /changed/);
village = coerceVillageState({
  ...defaultVillageState(),

  villagers: [
    {
      characterId: "bupkis",
      addedAt: new Date().toISOString(),
      cardSnapshot: {
        id: "bupkis",
        name: "Bupkis",
        revision: 1,
        capturedAt: new Date().toISOString(),
        sourceStatus: "available",
      },
      spriteManager: await service.preparedManager("bupkis", draft.revision),
    },
  ],
});
draft = await service.save("bupkis", { ...draft, useSprites: true });
const resident = await service.read("bupkis");
await service.applyResident("bupkis", { revision: draft.revision, residentToken: resident.residentToken });
assert.equal(
  village.villagers[0].spriteManager!.assignments.length,
  1,
  "deferred setup activates already-owned but unassigned artwork",
);
assert.equal(village.villagers[0].spriteManager!.assignments[0].view, "side");
await assert.rejects(
  service.applyResident("bupkis", { revision: draft.revision, residentToken: resident.residentToken }),
  /changed/,
);
const assignedBeforeRefresh = structuredClone(draft.assignments);
libraryFiles.push("full_new-art.png");
draft = await service.prepare("bupkis");
assert.equal(draft.manager.artwork.length, 3);
assert.deepEqual(draft.assignments.slice(0, 2), assignedBeforeRefresh, "new imports preserve prepared assignments");
libraryFiles.push(...Array.from({ length: 41 }, (_, index) => `full_more-${index}.png`));
draft = await service.prepare("bupkis");
assert.equal(
  draft.manager.artwork.length,
  43,
  "large sets import in bounded groups without blocking portrait fallback",
);
draft = await service.save("bupkis", { ...draft, useSprites: false });
assert.equal((await service.preparedManager("bupkis", draft.revision))!.assignments.length, 0);
// Leaving setup must not wait for a batch, dispatch the next image, or lose the finished copy.
libraryFiles.splice(0, libraryFiles.length, "full_one.png", "full_two.png");
let entered!: () => void, release!: () => void;
const started = new Promise<void>((resolve) => {
  entered = resolve;
});
const held = new Promise<void>((resolve) => {
  release = resolve;
});
prepareGate = async () => {
  entered();
  await held;
};
const firstImport = new AbortController(),
  queuedImport = new AbortController();
const beforeImports = copied;
const firstWork = service.prepare("cold-one", firstImport.signal);
await started;
const queuedWork = service.prepare("cold-two", queuedImport.signal);
const settledWork = service.settled("cold-one");
assert.equal(await service.preparedManager("cold-one"), null, "Portrait selection bypasses pending sprite import.");
assert.equal((await service.read("cold-one")).revision, 0, "Loading setup does not wait for image preparation.");
queuedImport.abort();
firstImport.abort();
release();
const [partial, cancelled] = await Promise.all([firstWork, queuedWork]);
assert.equal(copied - beforeImports, 1, "Cancelled queued work never starts another image.");
assert.equal(partial.manager.artwork.length, 1, "The image already processing is retained after leaving.");
assert.equal(
  (await settledWork).revision,
  partial.revision,
  "Returning to an existing selection uses the completed partial-import revision.",
);
assert.equal(cancelled.manager.artwork.length, 0);
assert.deepEqual(partial.errors, {}, "Cancellation is not recorded as an image failure.");
assert.equal(
  await service.preparedManager("cold-one"),
  null,
  "Late imports cannot enable sprites for a portrait selection.",
);
prepareGate = undefined;
const resumed = await service.prepare("cold-one");
assert.equal(resumed.manager.artwork.length, 2);
assert.equal(copied - beforeImports, 2, "Reopening resumes missing copies without importing completed artwork again.");
libraryFiles.splice(0, libraryFiles.length, ...Array.from({ length: 40 }, (_, index) => `full_scale-${index}.png`));
let activeImages = 0,
  peakImages = 0;
prepareGate = async () => {
  activeImages++;
  peakImages = Math.max(peakImages, activeImages);
  await new Promise<void>((resolve) => setImmediate(resolve));
  activeImages--;
};
const beforeScale = copied;
const manyCharacters = await Promise.all(Array.from({ length: 15 }, (_, index) => service.prepare(`scale-${index}`)));
assert.equal(peakImages, 1, "Fifteen characters cannot process hundreds of setup images concurrently.");
assert.equal(copied - beforeScale, 600);
assert.ok(manyCharacters.every((state) => state.manager.artwork.length === 40));
console.log(
  "Sprite setup: labeled imports, manual review, cancellation, revision checks and right-facing side sprites passed.",
);

// Stock naming needs no additional variant labels or grouping assignments.
documents.clear();
libraryFiles.splice(0, libraryFiles.length, "full_happy_01.png", "full_happy_blush.png");
const variantDraft = await service.prepare("variants");
const variantSaved = await service.save("variants", {
  ...variantDraft,
  useSprites: true,
  defaultArtworkId: variantDraft.assignments[0].artworkId,
  assignments: variantDraft.assignments.map((item) => ({
    ...item,
    included: true,
    approved: true,
    name: "Smile",
    view: "front",
  })),
  validateForUse: true,
});
const variantManager = await service.preparedManager("variants", variantSaved.revision);
assert.equal(variantManager!.assignments.length, 2, "same display label does not replace a filename variant");
const filenameSprite = managerResidentSprite(variantManager)!;
assert.deepEqual(
  filenameSprite.expressions.map((entry) => entry.spriteName),
  ["happy_01", "happy_blush"],
);
const automaticGroup = JSON.parse(describeSpriteExpressions(filenameSprite, true));
assert.equal(automaticGroup.name, "happy", "source filename grouping survives reviewed display names");
assert.equal(automaticGroup.id.startsWith("g-"), true);
