import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { PNG } from "pngjs";
import sharp from "sharp";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { spriteAnalysisImage } from "../packages/villages/src/server/features/media/sprite-image-codec.js";
import {
  createSpriteSetup,
  type SpriteSetupPorts,
} from "../packages/villages/src/server/features/media/sprite-setup-service.js";
import { createSpriteWrites } from "../packages/villages/src/server/features/media/sprite-writes.js";
import type { SpriteSetupDraft } from "../packages/villages/src/shared/contracts/sprites.js";

function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
async function until(check: () => boolean | Promise<boolean>) {
  const deadline = Date.now() + 10_000;
  while (!(await check())) {
    assert.ok(Date.now() < deadline, "Expected asynchronous progress did not arrive.");
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
}
const dataUrl = (bytes: Buffer, mime = "png") => `data:image/${mime};base64,${bytes.toString("base64")}`;
const pixels = (image: string) => PNG.sync.read(Buffer.from(image.split(",")[1], "base64"));
const small = PNG.sync.write(new PNG({ width: 64, height: 96 }));
const answer = JSON.stringify({
  name: "Relaxed",
  useWhen: "Calm conversation",
  direction: "front",
  expression: "neutral",
  pose: "relaxed-standing",
});

function fixture(image = dataUrl(small)) {
  const documents = new Map<string, unknown>();
  const calls: { image: string; gate: ReturnType<typeof deferred<string>> }[] = [];
  let active = 0,
    peak = 0;
  const controls: {
    read?: () => Promise<void>;
    beforeUpdate?: (next: SpriteSetupDraft) => Promise<void>;
    afterUpdate?: (next: SpriteSetupDraft) => Promise<void>;
    image: string;
  } = { image };
  let count = 4;
  const service = createSpriteSetup({
    villagesDocuments: () => ({ getById: async (_pkg, id) => ({ data: structuredClone(documents.get(id)) }) }),
    mutateDocument: async (id, slot, update) => {
      const next = slot.coerce(documents.get(id));
      await controls.beforeUpdate?.(next);
      await update(next);
      await controls.afterUpdate?.(next);
      documents.set(id, structuredClone(next));
    },
    villageEngineJson: async (path) => {
      if (path.startsWith("/api/connections/")) return { provider: "custom" };
      if (path.startsWith("/api/characters/")) return {};
      if (path.startsWith("/api/sprites/"))
        return Array.from({ length: count }, (_, index) => ({ filename: `full_${index}.png` }));
      throw Error(path);
    },
    villagesLanguageModels: () => ({
      resolve: async (id) => {
        assert.equal(id, "chosen-vision");
        return {
          chatComplete: async (messages, options) => {
            assert.equal(messages[1].images.length, 1, "Each paid call analyzes one sprite.");
            assert.equal(options.maxTokens, 800);
            assert.deepEqual(options.responseFormat, { type: "json_object" });
            const gate = deferred<string>();
            calls.push({ image: messages[1].images[0], gate });
            peak = Math.max(peak, ++active);
            try {
              return { content: await gate.promise };
            } finally {
              active--;
            }
          },
        };
      },
    }),
    manager: {
      readImage: async () => {
        await controls.read?.();
        return controls.image;
      },
      prepareArtwork: async (name, _image, engineSource) => ({
        id: engineSource.characterId + ":" + name,
        name,
        assetId: randomUUID(),
        origin: "engine",
        engineSource,
        frame: { x: 0, y: 0, width: 64, height: 96, scale: 1, offsetX: 3, offsetY: 4 },
        source: {
          filename: "original.png",
          url: "/original.png",
          width: 64,
          height: 96,
          sha256: createHash("sha256")
            .update(Buffer.from(image.split(",")[1], "base64"))
            .digest("hex"),
        },
        rendered: { filename: "rendered.png", url: "/rendered.png" },
        warnings: [],
      }),
    },
    writes: createSpriteWrites(),
    readVillageState: async () => coerceVillageState({ ...defaultVillageState(), version: 8 }),
  } as unknown as SpriteSetupPorts);
  return {
    service,
    calls,
    controls,
    peak: () => peak,
    prepare: async (character = "one", images = 4) => {
      count = images;
      return service.prepare(character);
    },
    run: (draft: SpriteSetupDraft, character = "one", signal?: AbortSignal) =>
      service.analyze(
        character,
        {
          revision: draft.revision,
          requestId: randomUUID(),
          connectionId: "chosen-vision",
          artworkIds: draft.assignments.map((item) => item.artworkId),
        },
        signal,
      ),
  };
}

// Resizing changes only the temporary input, preserves transparency/aspect ratio and normalizes orientation.
const large = await sharp({
  create: { width: 2048, height: 1536, channels: 4, background: { r: 40, g: 60, b: 80, alpha: 0.5 } },
})
  .png()
  .toBuffer();
const scaled = pixels(await spriteAnalysisImage(dataUrl(large)));
assert.deepEqual([scaled.width, scaled.height], [1024, 768]);
assert.ok(scaled.data[3] >= 127 && scaled.data[3] <= 128);
const unchanged = pixels(await spriteAnalysisImage(dataUrl(small)));
assert.deepEqual([unchanged.width, unchanged.height], [64, 96], "Small sources are not enlarged.");
const oriented = await sharp({ create: { width: 1600, height: 800, channels: 3, background: "red" } })
  .jpeg()
  .withMetadata({ orientation: 6 })
  .toBuffer();
const rotated = pixels(await spriteAnalysisImage(dataUrl(oriented, "jpeg")));
assert.deepEqual([rotated.width, rotated.height], [512, 1024], "EXIF-facing source is rotated before resizing.");
const tooLarge = await sharp({ create: { width: 4001, height: 4000, channels: 3, background: "red" } })
  .png()
  .toBuffer();
await assert.rejects(spriteAnalysisImage(dataUrl(tooLarge)), /pixel limit/);

// Reverse completion order saves each result while its sibling is still pending.
{
  const f = fixture(dataUrl(large));
  const draft = await f.prepare("one", 2);
  const original = structuredClone(draft.manager);
  const request = {
    revision: draft.revision,
    requestId: randomUUID(),
    connectionId: "chosen-vision",
    artworkIds: draft.assignments.map((item) => item.artworkId),
  };
  const work = f.service.analyze("one", request);
  await until(() => f.calls.length === 2);
  assert.equal(f.peak(), 2);
  assert.deepEqual([pixels(f.calls[0].image).width, pixels(f.calls[0].image).height], [1024, 768]);
  f.calls[1].gate.resolve(answer);
  await until(async () => (await f.service.read("one")).suggestions.length === 1);
  const partial = await f.service.read("one");
  assert.ok(request.artworkIds.includes(partial.suggestions[0].artworkId));
  assert.equal(partial.suggestedDefaultArtworkId, "");
  f.calls[0].gate.resolve(answer);
  const result = await work;
  assert.equal(result.suggestions.length, 2);
  assert.equal(
    result.revision,
    draft.revision + 4,
    "Claim, two independent saves and final selection each commit once.",
  );
  assert.equal(
    result.suggestedDefaultArtworkId,
    request.artworkIds[0],
    "Stable artwork order determines equal-ranked default.",
  );
  assert.deepEqual(result.manager, original, "Saved source metadata and framing stay unchanged.");
  assert.equal(result.defaultArtworkId, "");
  assert.ok(result.assignments.every((item) => !item.approved));
  await f.service.analyze("one", request);
  await assert.rejects(f.run(draft), /changed/);
  assert.equal(f.calls.length, 2, "Replay and stale revisions cannot purchase more calls.");
}

// Failure stops the next pair; a successful already-dispatched sibling survives.
{
  const f = fixture(),
    draft = await f.prepare();
  const work = f.run(draft);
  await until(() => f.calls.length === 2);
  f.calls[0].gate.reject(Error("provider unavailable"));
  await until(async () => Object.keys((await f.service.read("one")).errors).length === 1);
  f.calls[1].gate.resolve(answer);
  const result = await work;
  assert.equal(f.calls.length, 2);
  assert.equal(result.suggestions.length, 1);
  assert.equal(Object.keys(result.errors).length, 1);
  assert.ok(!result.errors[result.suggestions[0].artworkId]);
  assert.match(Object.values(result.errors)[0], /failed/);
  assert.equal(result.suggestedDefaultArtworkId, "");
}

// Cancellation retains a saved result but discards a late response from a provider ignoring abort.
{
  const f = fixture(),
    draft = await f.prepare(),
    cancel = new AbortController();
  const work = f.run(draft, "one", cancel.signal);
  await until(() => f.calls.length === 2);
  f.calls[0].gate.resolve(answer);
  await until(async () => (await f.service.read("one")).suggestions.length === 1);
  cancel.abort();
  f.calls[1].gate.resolve(answer);
  const result = await work;
  assert.equal(f.calls.length, 2);
  assert.equal(result.suggestions.length, 1);
  assert.match(Object.values(result.errors)[0], /cancelled/);
  assert.equal(result.suggestedDefaultArtworkId, "");
}

// Cancellation after response but before storage admission cannot save a late result or final default.
for (const duringFinalization of [false, true]) {
  const f = fixture(),
    draft = await f.prepare("one", 1),
    cancel = new AbortController();
  const entered = deferred<void>(),
    release = deferred<void>();
  f.controls.beforeUpdate = async (next) => {
    if (next.revision !== draft.revision + (duringFinalization ? 2 : 1)) return;
    f.controls.beforeUpdate = undefined;
    entered.resolve();
    await release.promise;
  };
  const work = f.run(draft, "one", cancel.signal);
  const completed = Promise.allSettled([work]);
  await until(() => f.calls.length === 1);
  f.calls[0].gate.resolve(answer);
  await entered.promise;
  cancel.abort();
  release.resolve();
  const [outcome] = await completed;
  if (duringFinalization) assert.equal(outcome.status, "rejected");
  else assert.equal(outcome.status, "fulfilled");
  const result = await f.service.settled("one");
  assert.equal(result.suggestions.length, duringFinalization ? 1 : 0);
  assert.equal(result.suggestedDefaultArtworkId, "");
}

// A sibling awaiting image preparation must not dispatch after the first fails.
{
  const f = fixture(),
    draft = await f.prepare();
  let reads = 0;
  const held = deferred<void>();
  f.controls.read = async () => {
    if (++reads === 2) await held.promise;
  };
  const work = f.run(draft);
  await until(() => f.calls.length === 1);
  f.calls[0].gate.reject(Error("provider unavailable"));
  await until(async () => Object.keys((await f.service.read("one")).errors).length === 1);
  held.resolve();
  await work;
  assert.equal(f.calls.length, 1);
}

// A failed persistence path must drain its running sibling before releasing setup ownership.
{
  const f = fixture(),
    draft = await f.prepare("one", 2);
  const work = f.run(draft);
  const outcome = Promise.allSettled([work]);
  await until(() => f.calls.length === 2);
  let failures = 0,
    settled = false;
  f.controls.afterUpdate = async () => {
    failures++;
    throw Error("storage unavailable");
  };
  f.calls[0].gate.resolve(answer);
  await until(() => failures === 2);
  const waiting = f.service.settled("one").then((value) => {
    settled = true;
    return value;
  });
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(settled, false, "Queued setup reads cannot overtake the running sibling.");
  f.controls.afterUpdate = undefined;
  f.calls[1].gate.resolve(answer);
  assert.equal((await outcome)[0].status, "rejected");
  assert.equal((await waiting).suggestions.length, 1);
}

// Global admission bounds different characters/tabs, including cancelled queued work.
{
  const f = fixture();
  const drafts = await Promise.all([f.prepare("one", 2), f.prepare("two", 2), f.prepare("three", 2)]);
  let reads = 0,
    cancelledFinished = false;
  f.controls.read = async () => {
    reads++;
  };
  const work = f.run(drafts[0]);
  await until(() => f.calls.length === 2);
  const cancel = new AbortController();
  const cancelled = f.run(drafts[1], "two", cancel.signal).then((result) => {
    cancelledFinished = true;
    return result;
  });
  await until(async () => (await f.service.read("two")).analysisRequests.length === 1);
  const queued = f.run(drafts[2], "three");
  await until(async () => (await f.service.read("three")).analysisRequests.length === 1);
  assert.equal(f.calls.length, 2);
  cancel.abort();
  await until(() => cancelledFinished);
  assert.equal((await f.service.settled("two")).suggestions.length, 0);
  assert.equal(reads, 2, "Queued cancellation finishes before unrelated running calls release their slots.");
  f.calls[1].gate.resolve(answer);
  await until(() => f.calls.length === 3);
  f.calls[0].gate.resolve(answer);
  await until(() => f.calls.length === 4);
  f.calls[2].gate.resolve(answer);
  f.calls[3].gate.resolve(answer);
  const results = await Promise.all([work, cancelled, queued]);
  assert.equal(f.peak(), 2);
  assert.equal(results[1].suggestions.length, 0, "Cancelled queued work never purchases a call.");
  assert.equal(results[2].suggestions.length, 2);
  assert.equal(reads, 4, "Cancelled queue callbacks never read an image after their slots become available.");
}

// Source integrity failures occur before a paid dispatch.
{
  const f = fixture(),
    draft = await f.prepare("one", 1);
  f.controls.image = dataUrl(Buffer.from("changed"));
  const result = await f.run(draft);
  assert.equal(f.calls.length, 0);
  assert.match(result.errors[draft.assignments[0].artworkId], /failed/);
}
console.log(
  "Sprite analysis: 1024px copies, two-call bound, independent saves, cancellation, replay and failure recovery passed.",
);
