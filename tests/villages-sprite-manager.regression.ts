import assert from "node:assert/strict";
import { PNG } from "pngjs";
import sharp from "sharp";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import {
  coerceVillageState,
  readVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import {
  readSpriteManager,
  importSpriteArtwork,
  adoptSpriteArtwork,
  listSpriteLibrary,
  saveSpriteArtwork,
  setSpriteDefault,
  setSpriteFraming,
  removeSpriteArtwork,
  decodeSpriteImage,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-manager.js";
import { coerceSpriteManager } from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-manager-model.js";
import {
  renderSpritePixels,
  initialSpriteFrame,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-manager-pixels.js";
import {
  describeSpriteExpressions,
  validateSpriteExpression,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-expressions.js";
import { villagesRoutes } from "../packages/villages/src/engine/packages/server/src/routes/villages.routes.js";

const records = new Map<string, any>(),
  files = new Map<string, string>();
const now = new Date().toISOString();
const village = coerceVillageState({
  wishSystemVersion: 2,
  name: "Preserved village",
  foundedAt: now,
  visitMemoryBackfilled: true,
  villagers: [
    {
      characterId: "mara",
      addedAt: now,
      cardSnapshot: {
        id: "mara",
        name: "Mara",
        revision: 1,
        capturedAt: now,
        sourceStatus: "available",
        nameColor: "",
        dialogueColor: "",
      },
      sprite: {
        assetId: "villages-123e4567-e89b-42d3-a456-426614174000",
        expressions: [{ label: "neutral", filename: "neutral.png" }],
      },
    },
  ],
});
records.set("villages-village", { id: "villages-village", data: village, revision: 1 });
records.set("sprite-studio-old", {
  id: "sprite-studio-old",
  data: { version: 2, jobs: [{ sheets: [] }] },
  revision: 1,
});
let failVillage = false,
  failUpload = false,
  cardMissing = false,
  forbidden = 0;
const release = configureVillagesRuntime({
  resources: { listCharacters: async () => [] },
  isDebugAgentsEnabled: () => false,
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  languageModels: {
    resolveForRequest: async () => {
      forbidden++;
      throw Error("No model configured");
    },
    complete: async () => {
      forbidden++;
      throw Error("No model configured");
    },
  },
  persistence: {
    documents: {
      getById: async (_pkg: string, id: string) => structuredClone(records.get(id) ?? null),
      list: async (_pkg: string, kind: string) =>
        structuredClone([...records.values()].filter((row) => row.kind === kind)),
      create: async (input: any) => {
        const row = { ...structuredClone(input), revision: 1 };
        records.set(input.id, row);
        return row;
      },
      update: async (input: any) => {
        if (failVillage && input.id === "villages-village") throw Error("Disk unavailable");
        const prior = records.get(input.id);
        if (!prior || prior.revision !== input.expectedRevision) return null;
        const row = { ...prior, ...structuredClone(input), revision: prior.revision + 1 };
        records.set(input.id, row);
        return row;
      },
    },
  },
} as any);
function sourceImage(opaque = false, wide = false) {
  const width = wide ? 240 : 64,
    height = 96;
  const png = new PNG({ width, height });
  if (opaque) png.data.fill(255);
  for (let y = 10; y < 84; y++) for (let x = 12; x < 52; x++) png.data.set([255, 0, 255, 255], (y * width + x) * 4);
  if (wide)
    for (let y = 40; y < 44; y++) for (let x = 52; x < 225; x++) png.data.set([90, 50, 180, 255], (y * width + x) * 4);
  return "data:image/png;base64," + PNG.sync.write(png).toString("base64");
}
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: any, init: any = {}) => {
  const url = new URL(String(input)),
    path = url.pathname;
  if (/generate|cleanup|connections|style|completion|review/.test(path)) {
    forbidden++;
    throw Error("Forbidden sprite request: " + path);
  }
  if (path === "/api/image-metadata/inspect") {
    const bytes = Buffer.from(JSON.parse(init.body).image.split(",")[1], "base64");
    try {
      const { width, height } = await sharp(bytes, { limitInputPixels: false }).metadata();
      return Response.json({ width, height });
    } catch {
      return new Response(null, { status: 400 });
    }
  }
  const file = path.match(/^\/api\/sprites\/([^/]+)\/file\/(.+)$/);
  if (file) {
    const image = files.get(`${file[1]}/${decodeURIComponent(file[2]!)}`);
    return image ? new Response(Buffer.from(image.split(",")[1]!, "base64")) : new Response(null, { status: 404 });
  }
  const sprite = path.match(/^\/api\/sprites\/([^/]+)(?:\/([^/]+))?$/);
  if (sprite) {
    const owner = sprite[1]!;
    if (init.method === "DELETE") {
      for (const key of files.keys()) if (key.startsWith(owner + "/" + sprite[2] + ".")) files.delete(key);
      return new Response(null, { status: 204 });
    }
    if (init.method === "POST") {
      if (failUpload) throw Error("File storage unavailable");
      const body = JSON.parse(init.body),
        extension = body.image.startsWith("data:image/jpeg")
          ? "jpeg"
          : body.image.startsWith("data:image/webp")
            ? "webp"
            : "png";
      const filename = body.expression + "." + extension;
      files.set(owner + "/" + filename, body.image);
      return Response.json({ filename });
    }
    return Response.json(
      [...files.keys()].filter((key) => key.startsWith(owner + "/")).map((key) => ({ filename: key.split("/")[1] })),
    );
  }
  if (path.startsWith("/api/characters/"))
    return cardMissing ? new Response(null, { status: 404 }) : Response.json({ id: "mara", name: "Mara" });
  return Response.json([]);
};
async function run() {
  try {
    assert.equal((await readSpriteManager("mara")).artwork.length, 0);
    assert.equal((await readVillageState()).villagers[0]!.sprite, null);
    const original = sourceImage();
    const uploaded = await importSpriteArtwork("mara", {
      images: [
        { name: "Composed.png", image: original },
        { name: "Angry.png", image: sourceImage(true) },
        { name: "Sword.png", image: sourceImage(false, true) },
      ],
    });
    assert.equal(uploaded.manager.artwork.length, 3);
    assert.equal(uploaded.manager.assignments.length, 0);
    const art = uploaded.manager.artwork[0]!;
    assert.equal(files.get(`${art.assetId}/${art.source.filename}`), original, "uploaded originals are preserved");
    const rendered = PNG.sync.read(
      Buffer.from(files.get(`${art.assetId}/${art.rendered.filename}`)!.split(",")[1]!, "base64"),
    );
    assert.equal(rendered.width, 1024);
    assert.equal(rendered.height, 1536);
    assert.ok(
      rendered.data.some((value, index) => index % 4 === 3 && value === 0),
      "output canvas is transparent",
    );
    assert.ok(
      rendered.data.some(
        (value, index) =>
          index % 4 === 0 &&
          value === 255 &&
          rendered.data[index + 1] === 0 &&
          rendered.data[index + 2] === 255 &&
          rendered.data[index + 3] === 255,
      ),
      "magenta artwork is retained",
    );
    assert.match(uploaded.manager.artwork[1]!.warnings.join(" "), /opaque background/);
    assert.match(art.warnings.join(" "), /smaller/);
    const save = (artwork: typeof art, expressionId = "", name = "Composed", view = "front", frame = artwork.frame) =>
      saveSpriteArtwork("mara", {
        artworkId: artwork.id,
        expectedUrl: artwork.rendered.url,
        expressionId,
        name,
        useWhen: "Listening with controlled authority.",
        view,
        frame,
      });
    let saved = await save(art);
    const expression = saved.manager.expressions[0]!;
    assert.equal(saved.manager.defaultExpressionId, expression.id);
    assert.equal(saved.snapshot.villagers[0]!.sprite!.images.length, 1);
    assert.match(
      describeSpriteExpressions((await readVillageState()).villagers[0]!.sprite),
      /Listening with controlled authority/,
    );
    assert.equal(
      validateSpriteExpression((await readVillageState()).villagers[0]!.sprite, expression.id),
      expression.id,
    );
    assert.equal(validateSpriteExpression((await readVillageState()).villagers[0]!.sprite, "unknown"), "");
    saved = await save(saved.manager.artwork[1]!, expression.id, "Composed", "side");
    assert.equal(saved.manager.assignments.length, 2, "front and side share an expression");
    const assigned = structuredClone(saved.manager.assignments);
    failUpload = true;
    await assert.rejects(save(saved.manager.artwork[2]!), /storage unavailable/);
    failUpload = false;
    assert.deepEqual((await readSpriteManager("mara")).assignments, assigned);
    failVillage = true;
    await assert.rejects(save(saved.manager.artwork[2]!), /Disk unavailable/);
    failVillage = false;
    assert.deepEqual((await readSpriteManager("mara")).assignments, assigned);
    await assert.rejects(
      save(saved.manager.artwork[0]!, expression.id, "Bad", "front", { ...art.frame, scale: 10 }),
      /safe margin/,
    );
    await assert.rejects(saveSpriteArtwork("mara", { artworkId: art.id, expectedUrl: "stale" }), /changed/);
    const beforeCorrupt = files.size;
    await assert.rejects(
      importSpriteArtwork("mara", {
        images: [
          { name: "Good", image: original },
          { name: "Corrupt", image: "data:image/png;base64,AAAA" },
        ],
      }),
    );
    assert.equal(files.size, beforeCorrupt, "corrupt batches are decoded before file writes");
    await assert.rejects(
      importSpriteArtwork("mara", { images: [{ image: "data:image/svg+xml;base64,AAAA" }] }),
      /PNG|format/,
    );
    const tooLarge = new PNG({ width: 1, height: 1 });
    const oversized = PNG.sync.write(tooLarge);
    oversized.writeUInt32BE(8193, 16);
    await assert.rejects(decodeSpriteImage("data:image/png;base64," + oversized.toString("base64")));
    files.set("mara/full_existing.png", original);
    files.set("mara/happy.png", original);
    assert.equal((await listSpriteLibrary("mara")).items.length, 2, "portrait and full-body library art are available");
    const adopted = await adoptSpriteArtwork("mara", { filenames: ["full_existing.png"] });
    files.delete("mara/full_existing.png");
    cardMissing = true;
    assert.ok(
      files.has(`${adopted.manager.artwork.at(-1)!.assetId}/original.png`),
      "adoption owns an independent copy",
    );
    assert.equal((await readSpriteManager("mara")).artwork.length, 4);
    assert.match((await listSpriteLibrary("mara")).error, /unavailable/);
    cardMissing = false;
    const widePixels = await decodeSpriteImage(sourceImage(false, true));
    const wideFrame = initialSpriteFrame(widePixels.width, widePixels.height);
    const marked = renderSpritePixels(widePixels, { ...wideFrame, headY: 10, footY: 84, scale: 0.2 });
    assert.equal(marked.clipped, false);
    const crop = renderSpritePixels(widePixels, { ...wideFrame, width: 55 });
    assert.ok(crop.image.data.some((value, index) => index % 4 === 3 && value === 255));
    const compact = await decodeSpriteImage(original);
    const padded = { width: 128, height: 192, data: new Uint8ClampedArray(128 * 192 * 4) };
    for (let y = 0; y < compact.height; y++)
      for (let x = 0; x < compact.width; x++)
        padded.data.set(
          compact.data.subarray((y * compact.width + x) * 4, (y * compact.width + x + 1) * 4),
          ((y + 32) * padded.width + x + 24) * 4,
        );
    assert.deepEqual(
      renderSpritePixels(compact, initialSpriteFrame(compact.width, compact.height)).image.data,
      renderSpritePixels(padded, initialSpriteFrame(padded.width, padded.height)).image.data,
      "different transparent margins produce identical visible size and foot baseline",
    );
    const current = await readSpriteManager("mara");
    const newDefault = await save(current.artwork[2]!, "", "Calculating");
    await setSpriteDefault("mara", { expressionId: newDefault.manager.expressions.at(-1)!.id });
    assert.notEqual((await readSpriteManager("mara")).defaultExpressionId, expression.id);
    await setSpriteFraming("mara", { mode: "half", cropPercent: 61 });
    assert.deepEqual((await readSpriteManager("mara")).framing, { mode: "half", cropPercent: 61 });
    const removing = (await readSpriteManager("mara")).artwork[2]!;
    await removeSpriteArtwork("mara", { artworkId: removing.id, expectedUrl: removing.rendered.url });
    assert.equal((await readSpriteManager("mara")).defaultExpressionId, expression.id);
    assert.equal((await readVillageState()).name, "Preserved village");
    assert.ok(records.has("sprite-studio-old"), "retired documents are left untouched");
    for (const format of ["jpeg", "webp"] as const) {
      const encoded = await sharp(Buffer.from(original.split(",")[1]!, "base64"))
        [format]()
        .toBuffer();
      const image = `data:image/${format};base64,${encoded.toString("base64")}`;
      const decoded = await decodeSpriteImage(image);
      assert.deepEqual([decoded.width, decoded.height], [64, 96]);
      const imported = await importSpriteArtwork("mara", { images: [{ name: `Artwork.${format}`, image }] });
      const art = imported.manager.artwork.at(-1)!;
      assert.equal(files.get(`${art.assetId}/${art.source.filename}`), image, "original format is preserved");
      assert.match(art.rendered.filename, /\.png$/);
    }
    assert.equal(
      coerceSpriteManager({ version: 1, artwork: [null, {}], expressions: [], assignments: [], framing: null })?.artwork
        .length,
      0,
    );
    const handlers = new Map<string, any>();
    files.set("mara/full_existing.png", original);
    const adoptedArt = (await readSpriteManager("mara")).artwork.find(
      (item) => item.id === adopted.addedArtworkIds[0],
    )!;
    assert.deepEqual(adoptedArt.engineSource, { characterId: "mara", filename: "full_existing.png" });
    assert.equal(adoptedArt.origin, "engine");
    await save(adoptedArt, "", "Existing Engine artwork");
    const beforeRepeat = await readSpriteManager("mara");
    const fileCount = files.size,
      revision = records.get("villages-village").revision;
    for (const repeated of [
      await adoptSpriteArtwork("mara", { filenames: ["full_existing.png"] }),
      ...(await Promise.all([
        adoptSpriteArtwork("mara", { filenames: ["full_existing.png"] }),
        adoptSpriteArtwork("mara", { filenames: ["full_existing.png"] }),
      ])),
    ]) {
      assert.deepEqual(
        repeated.manager,
        beforeRepeat,
        "retries preserve assignments, expressions, framing and artwork",
      );
      assert.deepEqual(repeated.addedArtworkIds, []);
      assert.deepEqual(repeated.selectedArtworkIds, [adoptedArt.id]);
    }
    assert.equal(files.size, fileCount, "repeat adoption writes no sprite files");
    assert.equal(records.get("villages-village").revision, revision, "known repeats do not rewrite the document");
    assert.equal(
      (await listSpriteLibrary("mara")).items.find((item) => item.filename === "full_existing.png")!.adoptedArtworkId,
      adoptedArt.id,
    );
    await assert.rejects(adoptSpriteArtwork("mara", { filenames: ["happy.png", "happy.png"] }), /different/);
    assert.equal(files.size, fileCount);
    const concurrent = await Promise.all([
      adoptSpriteArtwork("mara", { filenames: ["happy.png"] }),
      adoptSpriteArtwork("mara", { filenames: ["happy.png"] }),
    ]);
    assert.deepEqual(concurrent[0]!.selectedArtworkIds, concurrent[1]!.selectedArtworkIds);
    assert.equal(concurrent[0]!.addedArtworkIds.length, 1);
    assert.equal(concurrent[1]!.addedArtworkIds.length, 0);
    assert.equal(files.size, fileCount + 2);
    const happy = concurrent[0]!.manager.artwork.at(-1)!;
    assert.equal(
      happy.source.sha256,
      adoptedArt.source.sha256,
      "different filenames with identical bytes stay independent",
    );
    assert.notEqual(happy.id, adoptedArt.id);
    files.set("mara/new.png", original);
    const mixed = await adoptSpriteArtwork("mara", { filenames: ["happy.png", "new.png"] });
    assert.equal(mixed.addedArtworkIds.length, 1);
    assert.deepEqual(mixed.selectedArtworkIds, [happy.id, mixed.addedArtworkIds[0]]);

    // Pre-fix documents have neither origin nor Engine provenance.
    const persisted = records.get("villages-village").data.villagers[0].spriteManager;
    const legacy = persisted.artwork.find((item: any) => item.id === adoptedArt.id);
    delete legacy.engineSource;
    delete legacy.origin;
    const beforeLegacy = files.size;
    assert.equal(
      (await listSpriteLibrary("mara")).items.find((item) => item.filename === "full_existing.png")!.adoptedArtworkId,
      adoptedArt.id,
    );
    const upgraded = await adoptSpriteArtwork("mara", { filenames: ["full_existing.png"] });
    assert.deepEqual(upgraded.addedArtworkIds, []);
    assert.deepEqual(upgraded.selectedArtworkIds, [adoptedArt.id]);
    assert.equal(files.size, beforeLegacy, "legacy adoption backfills provenance without rewriting files");
    assert.deepEqual(upgraded.manager.assignments, beforeRepeat.assignments);
    assert.deepEqual(
      (await readSpriteManager("mara")).artwork.find((item) => item.id === adoptedArt.id)!.engineSource,
      adoptedArt.engineSource,
    );

    const duplicateLegacy = await importSpriteArtwork("mara", {
      images: [{ name: "full_existing.png", image: original }],
    });
    const duplicateArt = duplicateLegacy.manager.artwork.at(-1)!;
    delete records
      .get("villages-village")
      .data.villagers[0].spriteManager.artwork.find((item: any) => item.id === duplicateArt.id).origin;
    await save(duplicateArt, "", "Authored duplicate expression");
    const beforeDuplicate = await readSpriteManager("mara");
    assert.deepEqual(
      (await adoptSpriteArtwork("mara", { filenames: ["full_existing.png"] })).manager,
      beforeDuplicate,
      "existing duplicate copies and authored assignments are preserved",
    );
    const duplicateToRemove = beforeDuplicate.artwork.find((item) => item.id === duplicateArt.id)!;
    await removeSpriteArtwork("mara", { artworkId: duplicateToRemove.id, expectedUrl: duplicateToRemove.rendered.url });
    const explicit = await importSpriteArtwork("mara", { images: [{ name: "full_existing.png", image: original }] });
    const explicitArt = explicit.manager.artwork.at(-1)!;
    assert.equal(explicitArt.origin, "upload");
    const old = explicit.manager.artwork.find((item) => item.id === adoptedArt.id)!;
    await removeSpriteArtwork("mara", { artworkId: old.id, expectedUrl: old.rendered.url });
    assert.equal(
      (await listSpriteLibrary("mara")).items.find((item) => item.filename === "full_existing.png")!.adoptedArtworkId,
      undefined,
    );
    const readded = await adoptSpriteArtwork("mara", { filenames: ["full_existing.png"] });
    assert.equal(readded.addedArtworkIds.length, 1, "removal allows re-adoption without claiming deliberate uploads");
    assert.notEqual(readded.addedArtworkIds[0], explicitArt.id);
    assert.ok(files.has("mara/full_existing.png"), "removal never deletes the Engine character original");
    files.set("mara/full_existing.png", sourceImage(true));
    const unchanged = await adoptSpriteArtwork("mara", { filenames: ["full_existing.png"] });
    assert.equal(unchanged.addedArtworkIds.length, 0, "source replacement does not silently replace managed artwork");
    const replacing = unchanged.manager.artwork.find((item) => item.id === readded.addedArtworkIds[0])!;
    await removeSpriteArtwork("mara", { artworkId: replacing.id, expectedUrl: replacing.rendered.url });
    const replacement = await adoptSpriteArtwork("mara", { filenames: ["full_existing.png"] });
    assert.notEqual(replacement.manager.artwork.at(-1)!.source.sha256, adoptedArt.source.sha256);

    files.set("mara/legacy.png", original);
    const older = await importSpriteArtwork("mara", { images: [{ name: "legacy.png", image: sourceImage(true) }] });
    const olderArt = older.manager.artwork.at(-1)!;
    delete records
      .get("villages-village")
      .data.villagers[0].spriteManager.artwork.find((item: any) => item.id === olderArt.id).origin;
    files.set("mara/legacy.png", "data:image/png;base64,AAAA");
    const partiallyUnreadable = await listSpriteLibrary("mara");
    assert.equal(partiallyUnreadable.error, "");
    assert.ok(
      partiallyUnreadable.items.some((item) => item.filename === "happy.png"),
      "one unreadable legacy source does not hide usable library files",
    );
    const beforeUnreadable = await readSpriteManager("mara"),
      filesBeforeUnreadable = files.size;
    await assert.rejects(adoptSpriteArtwork("mara", { filenames: ["legacy.png"] }), /PNG|sprite/);
    assert.deepEqual(await readSpriteManager("mara"), beforeUnreadable);
    assert.equal(files.size, filesBeforeUnreadable);
    files.set("mara/legacy.png", original);
    assert.equal(
      (await listSpriteLibrary("mara")).items.find((item) => item.filename === "legacy.png")!.adoptedArtworkId,
      undefined,
      "legacy names alone do not establish identity",
    );
    assert.equal((await adoptSpriteArtwork("mara", { filenames: ["legacy.png"] })).addedArtworkIds.length, 1);
    const invalidProvenance = structuredClone(await readSpriteManager("mara"));
    invalidProvenance.artwork[0]!.engineSource = { characterId: "../mara", filename: "../bad.png" };
    assert.equal(coerceSpriteManager(invalidProvenance)!.artwork[0]!.engineSource, undefined);
    const app = Object.fromEntries(
      ["get", "post", "patch", "delete", "put"].map((method) => [
        method,
        (path: string, options: any, handler: any) => handlers.set(method + ":" + path, handler ?? options),
      ]),
    );
    await villagesRoutes(app as any);
    for (const route of [
      "get:/villagers/:characterId/sprites/studio",
      "get:/villagers/:characterId/sprites/studio/*",
      "post:/villagers/:characterId/sprites/studio",
      "post:/villagers/:characterId/sprites/studio/*",
      "post:/villagers/:characterId/sprites/generate",
    ]) {
      let status = 0;
      const reply = {
        code(n: number) {
          status = n;
          return this;
        },
        send() {
          return this;
        },
      };
      await handlers.get(route)({ params: { characterId: "mara" } }, reply);
      assert.equal(status, 410);
    }
    assert.equal(forbidden, 0, "manager operations never resolve models or call generation/cleanup services");
    console.log(
      "Sprite Manager: artwork, framing, repeat/concurrent/legacy adoption, atomic assignments, failures, retirement and zero AI requests passed.",
    );
  } finally {
    release();
    globalThis.fetch = originalFetch;
  }
}
void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
