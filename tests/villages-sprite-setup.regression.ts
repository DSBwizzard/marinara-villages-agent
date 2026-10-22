import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { PNG } from "pngjs";
import {
  createSpriteSetup,
  type SpriteSetupPorts,
} from "../packages/villages/src/server/features/media/sprite-setup-service.js";
import { createSpriteWrites } from "../packages/villages/src/server/features/media/sprite-writes.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { selectSpriteImage } from "../packages/villages/src/client/features/scenes/villages-sprite-stage.js";
import { suggestDefaultSprite } from "../packages/villages/src/server/domain/rules/sprite-default.js";
import { managerResidentSprite } from "../packages/villages/src/server/domain/rules/sprite-manager-model.js";

const documents = new Map<string, unknown>();
const imageBytes = PNG.sync.write(new PNG({ width: 64, height: 96 }));
const imageData = "data:image/png;base64," + imageBytes.toString("base64");
let village = coerceVillageState({ version: 3 });
let calls = 0,
  failImage = false,
  resolved = "",
  copied = 0;
let analysisAnswer = {
  name: "Thoughtful",
  useWhen: "Considering something carefully.",
  direction: "left",
  expression: "neutral",
  pose: "relaxed-standing",
};
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
    if (path.startsWith("/api/sprites/")) return libraryFiles.map((filename) => ({ filename }));
    throw Error(path);
  },
  villagesLanguageModels: () => ({
    resolve: async (id) => {
      resolved = id;
      return {
        chatComplete: async (messages, options) => {
          calls++;
          assert.match(messages[1].images[0], /^data:image/);
          assert.equal(options.maxTokens, 800);
          assert.ok(!JSON.stringify(messages).includes("suicejejshe"), "arbitrary filenames do not influence analysis");
          options.signal?.throwIfAborted();
          if (failImage) throw Error("provider unavailable");
          return {
            content: JSON.stringify(analysisAnswer),
          };
        },
      };
    },
  }),
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
assert.equal(calls, 0, "import never spends on vision");
assert.ok(draft.assignments.every((item) => !item.name && !item.direction));
await service.prepare("bupkis");
assert.equal(copied, 2, "opening setup reuses independent copies");
for (const connectionId of [undefined, "", "random", "pictures", "deleted"]) {
  await assert.rejects(
    service.analyze("bupkis", {
      revision: draft.revision,
      requestId: randomUUID(),
      artworkIds: [draft.assignments[0].artworkId],
      connectionId,
    }),
  );
  assert.equal(calls, 0, "invalid selection never dispatches or falls back");
  assert.equal((await service.read("bupkis")).revision, draft.revision);
}
const requestId = randomUUID();
draft = await service.analyze("bupkis", {
  revision: draft.revision,
  requestId,
  connectionId: "vision",
  artworkIds: [draft.assignments[0].artworkId],
});
assert.equal(resolved, "vision");
assert.equal(draft.suggestions[0].direction, "left");
assert.equal(draft.assignments[0].name, "", "suggestions do not activate assignments");
assert.equal(draft.suggestedDefaultArtworkId, "", "partial sets cannot suggest a default");
await service.analyze("bupkis", { revision: 0, requestId, artworkIds: [] });
assert.equal(calls, 1, "replayed request cannot repeat a purchased call");
const stale = draft.revision;
draft = await service.save("bupkis", {
  ...draft,
  assignments: draft.assignments.map((item, index) => (index ? item : { ...draft.suggestions[0], approved: false })),
  defaultArtworkId: draft.suggestions[0].artworkId,
  useSprites: true,
  pendingSuggestionIds: [],
});
assert.equal(
  (await service.read("bupkis")).assignments[0].approved,
  false,
  "Edited values remain unapproved after saving.",
);
await assert.rejects(
  service.preparedManager("bupkis", draft.revision),
  /approved default/,
  "A complete but unapproved sprite cannot become usable during founding or move-in.",
);
draft = await service.save("bupkis", {
  ...draft,
  assignments: draft.assignments.map((item, index) => (index ? item : { ...item, approved: true })),
  validateForUse: true,
});
await assert.rejects(service.save("bupkis", { ...draft, revision: stale }), /changed/);
const manager = await service.preparedManager("bupkis", draft.revision);
assert.equal(manager!.assignments.length, 1);
const document = [...documents.values()][0] as { assignments: { approved?: boolean }[] };
delete document.assignments[0].approved;
const previousDraft = await service.read("bupkis");
assert.equal(
  previousDraft.assignments[0].approved,
  false,
  "Earlier automatically completed drafts are not treated as explicit approval.",
);
assert.equal(previousDraft.assignments[0].name, "Thoughtful", "Earlier draft values remain available for review.");
await assert.rejects(service.preparedManager("bupkis", draft.revision), /approved default/);
draft = await service.save("bupkis", draft);
draft = await service.save("bupkis", {
  ...draft,
  assignments: draft.assignments.map((item, index) =>
    index
      ? {
          ...item,
          name: "Unapproved manual edit",
          useWhen: "Listening",
          direction: "front",
          approved: false,
        }
      : item,
  ),
});
assert.equal(
  (await service.preparedManager("bupkis", draft.revision))!.assignments.length,
  1,
  "An approved default cannot accidentally activate other complete but unapproved sprites.",
);
const sprite = managerResidentSprite(manager)!;
assert.equal(sprite.expressions[0].direction, "left");
const image = { view: "side" as const, direction: "left" as const, label: "thinking", url: "/sprite" };
assert.equal(selectSpriteImage([image], "thinking", "right")!.mirrored, true);
assert.equal(selectSpriteImage([image], "thinking", "left")!.mirrored, false);
assert.equal(selectSpriteImage([{ ...image, direction: "right" }], "thinking", "left")!.mirrored, true);
assert.equal(selectSpriteImage([{ ...image, view: "front", direction: "front" }], "thinking", "left")!.mirrored, false);
failImage = true;
draft = await service.analyze("bupkis", {
  revision: draft.revision,
  requestId: randomUUID(),
  connectionId: "vision",
  artworkIds: [draft.assignments[1].artworkId],
});
assert.match(draft.errors[draft.assignments[1].artworkId], /failed/);
assert.equal(draft.assignments[0].name, "Thoughtful", "failure preserves reviewed assignments");
const abort = new AbortController();
abort.abort();
await assert.rejects(
  service.analyze(
    "bupkis",
    {
      revision: draft.revision,
      requestId: randomUUID(),
      connectionId: "vision",
      artworkIds: [draft.assignments[1].artworkId],
    },
    abort.signal,
  ),
);
const before = calls;
draft = await service.save("bupkis", { ...draft, useSprites: false });
assert.equal((await service.preparedManager("bupkis", draft.revision))!.assignments.length, 0);
assert.equal((await service.read("bupkis")).manager.artwork.length, 2, "unassigned images stay available");
assert.equal(calls, before);
await assert.rejects(service.preparedManager("bupkis", draft.revision - 1), /changed/);
village = coerceVillageState({
  version: 3, socialContractVersion: 2,
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
assert.equal(village.villagers[0].spriteManager!.artwork[0].direction, "left");
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
  "Sprite setup: import, review, captioning, cancellation, revision checks and directional rendering passed.",
);

// A full run compares all successful results without purchasing a comparison call.
documents.clear();
libraryFiles.splice(0, libraryFiles.length, "full_first.png", "full_side.png", "full_best.png");
failImage = false;
calls = 0;
draft = await service.prepare("bupkis");
const [firstId, sideId, bestId] = draft.assignments.map((item) => item.artworkId);
async function analyzeOne(artworkId: string, finalize: boolean) {
  return service.analyze("bupkis", {
    revision: draft.revision,
    requestId: randomUUID(),
    connectionId: "vision",
    artworkIds: [artworkId],
    finalize,
  });
}
analysisAnswer = { ...analysisAnswer, direction: "front", pose: "other" };
draft = await analyzeOne(firstId, false);
assert.equal(draft.suggestedDefaultArtworkId, "");
analysisAnswer = { ...analysisAnswer, direction: "left", pose: "relaxed-standing" };
draft = await analyzeOne(sideId, false);
assert.equal(draft.suggestedDefaultArtworkId, "");
failImage = true;
draft = await analyzeOne(bestId, true);
assert.equal(draft.suggestedDefaultArtworkId, "", "failure must not select an early candidate");
failImage = false;
analysisAnswer = { ...analysisAnswer, direction: "front" };
draft = await analyzeOne(bestId, true);
assert.equal(draft.suggestedDefaultArtworkId, bestId, "later neutral front-facing standing image wins");
assert.equal(calls, 4, "three image calls and one explicit failed-image retry; no comparison call");
assert.equal(draft.defaultArtworkId, "", "analysis does not bypass approval");
assert.equal(
  (await service.read("bupkis")).analysisTraits?.[bestId].pose,
  "relaxed-standing",
  "traits survive reopening",
);
draft = await service.save("bupkis", { ...draft, defaultArtworkId: firstId });
draft = await analyzeOne(bestId, true);
assert.equal(draft.defaultArtworkId, firstId, "analysis preserves an explicitly selected default");
const cancellation = new AbortController();
cancellation.abort();
const beforeCancel = calls;
await assert.rejects(
  service.analyze(
    "bupkis",
    { revision: draft.revision, requestId: randomUUID(), connectionId: "vision", artworkIds: [bestId], finalize: true },
    cancellation.signal,
  ),
);
assert.equal(calls, beforeCancel);
assert.equal((await service.read("bupkis")).defaultArtworkId, firstId);

const ranked = structuredClone(draft);
ranked.analysisTraits![firstId] = { expression: "neutral", pose: "relaxed-standing" };
assert.equal(suggestDefaultSprite(ranked), firstId, "equal ranks use stable assignment order");
ranked.assignments[0].included = false;
assert.equal(suggestDefaultSprite(ranked), bestId, "excluded images cannot win");
ranked.analysisTraits![bestId].expression = "strong";
assert.equal(
  suggestDefaultSprite(ranked),
  "",
  "expressive or side-facing images are not neutral front-facing fallbacks",
);
ranked.analysisTraits![bestId].expression = "neutral";
ranked.errors[bestId] = "Analysis failed.";
assert.equal(suggestDefaultSprite(ranked), "", "failed analysis blocks final selection");
delete ranked.errors[bestId];
delete ranked.analysisTraits;
assert.equal(
  suggestDefaultSprite(ranked),
  "",
  "legacy suggestions without traits remain reviewable without guessing or paid migration",
);
console.log("Default sprite ranking, completion, retries, saved compatibility and manual preservation passed.");
