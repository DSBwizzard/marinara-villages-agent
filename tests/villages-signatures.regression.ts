import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { createHash } from "node:crypto";
import {
  previousSignaturePrompt,
  legacySignaturePrompt,
} from "../packages/villages/src/server/domain/rules/resident-signature-prompt.js";
import assert from "node:assert/strict";
import { PNG } from "pngjs";
import sharp from "sharp";
import { residentSignature } from "../packages/villages/src/shared/helpers/resident-signature.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  mutateVillageState,
  readVillageAuthority,
} from "../packages/villages/src/server/features/world/village-store.js";
import {
  generateResidentSignature,
  readResidentSignature,
  signaturePrompt,
} from "../packages/villages/src/server/features/residents/resident-signature.js";
import {
  trimSignaturePixels,
  trimSignatureImage,
  prepareSignatureImage,
} from "../packages/villages/src/server/features/residents/signature-image.js";

const now = "2026-10-04T12:00:00.000Z";
const village = coerceVillageState({
  ...defaultVillageState(),
  version: 5,
  wishSystemVersion: 3,
  seed: "signature-fixture",
  name: "Signature Village",
  foundedAt: now,
  villagers: [
    {
      characterId: "mara",
      addedAt: now,
      cardSnapshot: {
        id: "mara",
        name: "Mara",
        personality: "Confident, assertive and brave.",
        revision: 1,
        sourceStatus: "missing",
        capturedAt: now,
      },
    },
  ],
});
const fallback = residentSignature(village.villagers[0]!.cardSnapshot);
assert.equal(fallback.hand, "bold");
assert.deepEqual(fallback, residentSignature(structuredClone(village.villagers[0]!.cardSnapshot)));
assert.equal(residentSignature({ id: "x", name: "小雨", personality: "quiet and meticulous" }).hand, "neat");
assert.equal(residentSignature({ id: "x", name: "عائشة", personality: "playful and curious" }).name, "عائشة");
assert.equal(residentSignature({ id: "x", name: "未知", personality: "" }).hand, "flowing");
assert.match(signaturePrompt(village.villagers[0]!), /Confident, assertive and brave/);

const pixels = new PNG({ width: 600, height: 400 });
pixels.data.fill(255);
for (let y = 180; y < 220; y++) for (let x = 100; x < 500; x++) pixels.data.set([0, 0, 0, 255], (y * 600 + x) * 4);
const trimmed = trimSignaturePixels(pixels);
assert.ok(trimmed.width < 600 && trimmed.height < 100);
const png = PNG.sync.read(trimmed.bytes);
assert.equal(png.data[3], 0, "White margins become transparent");
assert.equal(png.data[(10 * png.width + 10) * 4 + 3], 255, "Dark ink survives");
assert.throws(() => trimSignaturePixels(new PNG({ width: 10, height: 10 })), /blank/);
// White paper must disappear inside and outside a mark, including matte edges.
const colored = new PNG({ width: 40, height: 60 });
colored.data.fill(255);
for (let y = 10; y < 50; y++) for (let x = 10; x < 30; x++) colored.data.set([245, 120, 20, 255], (y * 40 + x) * 4);
colored.data.set([255, 255, 255, 255], (30 * 40 + 20) * 4);
const colorCrop = PNG.sync.read(trimSignaturePixels(colored).bytes);
assert.ok(
  !colorCrop.data.some(
    (v, i) =>
      i % 4 === 0 &&
      v >= 245 &&
      colorCrop.data[i + 1]! >= 245 &&
      colorCrop.data[i + 2]! >= 245 &&
      colorCrop.data[i + 3]! > 0,
  ),
  "Enclosed white paper is transparent",
);
const ink = Array.from(colorCrop.data).findIndex((v, i) => i % 4 === 3 && v > 0) - 3;
for (const [channel, observed] of [245, 120, 20].entries()) {
  const opacity = colorCrop.data[ink + 3]! / 255;
  assert.ok(
    Math.abs(colorCrop.data[ink + channel]! * opacity + 255 * (1 - opacity) - observed) <= 1,
    "Colored ink recomposes to the provider's color on white",
  );
}
assert.equal(colorCrop.data[3], 0, "Outside white background is removed");
const nativeAlpha = new PNG({ width: 30, height: 30 });
for (let y = 10; y < 20; y++) for (let x = 10; x < 20; x++) nativeAlpha.data.set([0, 0, 0, 128], (y * 30 + x) * 4);
// A transparent corner must not prevent extraction of opaque white elsewhere.
nativeAlpha.data.set([255, 255, 255, 255], (15 * 30 + 15) * 4);
const alphaCrop = PNG.sync.read(trimSignaturePixels(nativeAlpha).bytes);
assert.equal(
  Math.max(...alphaCrop.data.filter((_, i) => i % 4 === 3)),
  128,
  "Existing translucent ink is not made opaque",
);
assert.ok(
  !alphaCrop.data.some((v, i) => i % 4 === 3 && v === 255),
  "White is removed even from a partly transparent source",
);
const matteEdge = new PNG({ width: 20, height: 20 });
matteEdge.data.fill(255);
for (let y = 5; y < 15; y++) for (let x = 5; x < 15; x++) matteEdge.data.set([230, 230, 230, 255], (y * 20 + x) * 4);
const edgeCrop = PNG.sync.read(trimSignaturePixels(matteEdge).bytes);
const faint = Array.from(edgeCrop.data).findIndex((v, i) => i % 4 === 3 && v > 0) - 3;
assert.deepEqual(
  Array.from(edgeCrop.data.slice(faint, faint + 4)),
  [0, 0, 0, 25],
  "White-matted faint ink becomes translucent dark ink without a white halo",
);
// Native colored alpha keeps its white-paper appearance, without brightening dark backdrops.
const translucentColor = new PNG({ width: 20, height: 20 });
for (let y = 5; y < 15; y++)
  for (let x = 5; x < 15; x++) translucentColor.data.set([100, 150, 200, 128], (y * 20 + x) * 4);
const translucentCrop = PNG.sync.read(trimSignaturePixels(translucentColor).bytes);
const nativeInk = Array.from(translucentCrop.data).findIndex((v, i) => i % 4 === 3 && v > 0) - 3;
for (const [channel, observed] of [100, 150, 200].entries()) {
  const opacity = translucentCrop.data[nativeInk + 3]! / 255;
  const before = (observed * 128) / 255 + 255 * (1 - 128 / 255);
  const after = translucentCrop.data[nativeInk + channel]! * opacity + 255 * (1 - opacity);
  assert.ok(Math.abs(before - after) <= 1, "Colored native alpha retains its appearance over white paper");
}
assert.ok(translucentCrop.data[nativeInk + 3]! <= 128, "Extraction cannot increase native opacity");
const darkBackdrop = 32;
assert.ok(
  (edgeCrop.data[faint]! * 25) / 255 + darkBackdrop * (1 - 25 / 255) < darkBackdrop,
  "Faint dark strokes do not leave a bright fringe on dark backgrounds",
);
for (const [width, height] of [
  [20, 200],
  [200, 20],
]) {
  const extreme = new PNG({ width, height });
  for (let y = 5; y < height - 5; y++)
    for (let x = 5; x < width - 5; x++) extreme.data.set([20, 40, 220, 255], (y * width + x) * 4);
  const cropped = trimSignaturePixels(extreme);
  assert.ok(cropped.width <= width && cropped.height <= height, "Tall and wide marks remain valid");
}
const white = new PNG({ width: 10, height: 10 });
white.data.fill(255);
assert.throws(() => trimSignaturePixels(white), /blank/);
// A photographed light paper field must not survive as a rectangular wash.
const shadedPaper = new PNG({ width: 256, height: 256 });
for (let y = 0; y < 256; y++)
  for (let x = 0; x < 256; x++) {
    const shade = 205 + Math.round((x + y) / 11);
    shadedPaper.data.set([shade, shade, shade, 255], (y * 256 + x) * 4);
  }
for (let y = 80; y < 180; y++) for (let x = 80; x < 84; x++) shadedPaper.data.set([20, 20, 20, 255], (y * 256 + x) * 4);
for (let y = 80; y < 180; y++)
  for (let x = 130; x < 134; x++) shadedPaper.data.set([20, 60, 190, 255], (y * 256 + x) * 4);
const shadedCrop = await trimSignatureImage(shadedPaper);
assert.ok(shadedCrop.width < 100 && shadedCrop.height < 140, "Light paper shading does not determine artwork bounds");
const shadedPNG = PNG.sync.read(shadedCrop.bytes);
assert.ok(
  shadedPNG.data.some((v, i) => i % 4 === 2 && v > 100 && shadedPNG.data[i - 2]! < 50 && shadedPNG.data[i + 1]! > 0),
  "Colored strokes survive paper normalization",
);
// Invisible RGB is not paper and must not affect real ink extraction.
const nativeGray = (hidden: number) => {
  const image = new PNG({ width: 256, height: 256 });
  for (let i = 0; i < image.data.length; i += 4) image.data.set([hidden, hidden, hidden, 0], i);
  for (let y = 80; y < 180; y++) for (let x = 80; x < 84; x++) image.data.set([200, 200, 200, 255], (y * 256 + x) * 4);
  return image;
};
assert.deepEqual(
  (await trimSignatureImage(nativeGray(200))).bytes,
  (await trimSignatureImage(nativeGray(255))).bytes,
  "Hidden RGB cannot change or erase native transparent ink",
);
const richResident = structuredClone(village.villagers[0]!);
richResident.cardSnapshot.backstory = "Signs fishing logs with a tiny hook.";
richResident.cardSnapshot.exampleDialogue = "Aye, leave it to me.";
richResident.cardSnapshot.description = "A fast, practical harbor worker.";
const richPrompt = signaturePrompt(richResident);
assert.match(richPrompt, /tiny hook/);
assert.match(richPrompt, /Aye, leave it to me/);

richResident.cardSnapshot.personality = '"\n'.repeat(3000) + "Secretly playful.";
assert.ok(signaturePrompt(richResident).length <= 4000, "Serialized character evidence fits the Engine contract");
assert.match(signaturePrompt(richResident), /Secretly playful/);
for (const evidence of ["Backstory:", "Voice examples:", "Summary:"]) {
  richResident.cardSnapshot.summary = "Practical but mischievous.";
  assert.ok(signaturePrompt(richResident).includes(evidence), "Escaped personality cannot remove supporting evidence");
}
richResident.cardSnapshot.name = "A".repeat(129) + "𠮷" + "B".repeat(100);
assert.ok(
  signaturePrompt(richResident).includes(JSON.stringify(richResident.cardSnapshot.name)),
  "Full supplementary-script name survives unchanged",
);
const generatedImage = `data:image/png;base64,${PNG.sync.write(pixels).toString("base64")}`;

const records = new Map<string, any>();
records.set("villages-village", { id: "villages-village", data: village, revision: 1 });
records.set("villages-connections", {
  id: "villages-connections",
  data: { imageConnectionId: "fixture-image" },
  revision: 1,
});
let failVillage = false,
  failUpload = false,
  failProvider = false,
  blankImage = false,
  requests = 0,
  uploads = 0;
let imageGate: Promise<void> | undefined;
let entered: (() => void) | undefined;
const host = {
  resources: { listCharacters: async () => [] },
  isDebugAgentsEnabled: () => false,
  logger: { warn() {}, error() {}, info() {}, debug() {}, debugOverride() {} },
  persistence: {
    documents: villageFixtureDocuments({
      getById: async (_pkg: string, id: string) => structuredClone(records.get(id) ?? null),
      list: async () => [],
      create: async (input: any) => {
        if (records.has(input.id)) throw Error("Already exists");
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
    }),
  },
};
const release = configureVillagesRuntime(host as any);
let releaseReplacement: (() => void) | undefined;
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  const path = new URL(String(url)).pathname;
  if (path === "/api/connections")
    return Response.json([{ id: "fixture-image", provider: "image_generation", model: "fixture" }]);
  if (path === "/api/characters/avatar-generation") {
    requests++;
    entered?.();
    const body = JSON.parse(String(init?.body));
    assert.deepEqual([body.width, body.height], [1536, 1024]);
    assert.match(body.appearance, /Mara/);
    assert.ok(body.appearance.length <= 4000);
    await imageGate;
    if (failProvider) return Response.json({ error: "Provider unavailable" }, { status: 503 });
    return Response.json({
      image: blankImage
        ? `data:image/png;base64,${PNG.sync.write(new PNG({ width: 10, height: 10 })).toString("base64")}`
        : generatedImage,
    });
  }
  if (path === "/api/image-metadata/inspect") return Response.json({ error: "Not found" }, { status: 404 });
  if (path === "/api/global-gallery/folders") return Response.json([{ id: "villages", name: "Villages" }]);
  if (path === "/api/global-gallery/upload") {
    uploads++;
    if (failUpload) return Response.json({ error: "Upload failed" }, { status: 503 });
    return Response.json({ id: `art-${uploads}`, url: `/api/global-gallery/art-${uploads}/file` });
  }
  throw Error("Unexpected Engine call " + path);
};
const action = (index: number, expectedAttempt: number) => ({ actionId: `signature-action-${index}`, expectedAttempt });
async function main() {
  try {
    assert.equal((await readResidentSignature("mara")).status, "local");
    assert.equal(requests, 0, "Profile reads never generate");
    records.get("villages-connections").data.imageConnectionId = "__villages_image_disabled__";
    const unavailable = await readResidentSignature("mara");
    assert.equal(unavailable.available, false);
    assert.deepEqual(unavailable.fallback, fallback);
    assert.equal(unavailable.saved, null);
    assert.equal(requests, 0);
    records.get("villages-connections").data.imageConnectionId = "fixture-image";
    const jpeg = await sharp(PNG.sync.write(pixels)).jpeg().toBuffer();
    const jpegResult = await prepareSignatureImage({
      bytes: jpeg,
      mime: "image/jpeg",
      dataUrl: `data:image/jpeg;base64,${jpeg.toString("base64")}`,
    });
    const compact = await prepareSignatureImage({
      bytes: PNG.sync.write(colored),
      mime: "image/png",
      dataUrl: `data:image/png;base64,${PNG.sync.write(colored).toString("base64")}`,
    });
    assert.ok(compact.height <= 960, "Compact artwork fits the display derivative");
    assert.ok(compact.width < compact.height, "Compact marks retain their natural proportions");
    const ring = new PNG({ width: 40, height: 40 });
    for (let y = 8; y < 32; y++)
      for (let x = 8; x < 32; x++)
        if (x < 12 || x >= 28 || y < 12 || y >= 28) ring.data.set([0, 0, 0, 128], (y * 40 + x) * 4);
    const ringBytes = PNG.sync.write(ring);
    const fittedRing = await prepareSignatureImage({
      bytes: ringBytes,
      mime: "image/png",
      dataUrl: `data:image/png;base64,${ringBytes.toString("base64")}`,
    });
    const ringPNG = PNG.sync.read(fittedRing.bytes);
    assert.equal(
      ringPNG.data[(Math.floor(ringPNG.height / 2) * ringPNG.width + Math.floor(ringPNG.width / 2)) * 4 + 3],
      0,
      "Enclosed letter holes remain transparent after resizing",
    );
    assert.ok(jpegResult.width <= 1120 && jpegResult.height <= 960, "JPEG providers yield a bounded PNG derivative");
    await assert.rejects(generateResidentSignature("mara", {}), /action ID/);
    const first = await generateResidentSignature("mara", action(1, 0));
    assert.equal(first.status, "saved");
    assert.equal(requests, 1);
    assert.equal(uploads, 2);
    assert.ok(first.saved?.image.ref.startsWith("global-gallery:"));
    assert.deepEqual(coerceVillageState(await readVillageAuthority()).villagers[0]?.signature, first.saved);
    assert.deepEqual((await generateResidentSignature("mara", action(1, 0))).saved, first.saved);
    assert.equal(requests, 1, "Lost-response replay is free");
    await assert.rejects(generateResidentSignature("mara", action(2, 0)), /changed/);
    assert.equal(requests, 1, "Stale attempts cannot spend");

    failUpload = true;
    const failedUpload = await generateResidentSignature("mara", action(2, 1));
    assert.equal(failedUpload.status, "failed");
    assert.equal(failedUpload.recoverable, true);
    assert.deepEqual(failedUpload.saved, first.saved);
    failUpload = false;
    const legacy = [...records.values()].find((row) => row.kind === "resident-signature");
    legacy.data.revision = createHash("sha256")
      .update(JSON.stringify(["Mara", village.villagers[0]!.cardSnapshot.personality]))
      .digest("hex");
    legacy.data.prompt = legacySignaturePrompt(village.villagers[0]!);
    assert.equal(
      (await readResidentSignature("mara")).recoverable,
      true,
      "Old paid responses remain recoverable after upgrade",
    );
    legacy.data.prompt = previousSignaturePrompt(village.villagers[0]!);
    legacy.data.revision = createHash("sha256").update(JSON.stringify(legacy.data.prompt)).digest("hex");
    assert.equal(
      (await readResidentSignature("mara")).recoverable,
      true,
      "Previous character-mark responses remain recoverable",
    );
    records.get("villages-connections").data.imageConnectionId = "__villages_image_disabled__";
    const recovered = await generateResidentSignature("mara", action(3, 2));
    assert.equal(recovered.status, "saved");
    assert.equal(requests, 2, "Saved paid result recovers even with images disabled");
    await assert.rejects(generateResidentSignature("mara", action(4, 3)), /disabled/);
    assert.equal(requests, 2);
    records.get("villages-connections").data.imageConnectionId = "fixture-image";
    failVillage = true;
    const failedSave = await generateResidentSignature("mara", action(4, 3));
    assert.equal(failedSave.recoverable, true);
    const uploaded = uploads;
    failVillage = false;
    assert.equal((await generateResidentSignature("mara", action(5, 4))).status, "saved");
    assert.equal(requests, 3);
    assert.equal(uploads, uploaded, "Saved gallery refs are reused after a Village write failure");

    blankImage = true;
    assert.equal((await generateResidentSignature("mara", action(6, 5))).recoverable, false);
    blankImage = false;
    assert.equal((await generateResidentSignature("mara", action(7, 6))).status, "saved");
    assert.equal(requests, 5, "Invalid output needs a deliberate new request");
    failProvider = true;
    assert.equal((await generateResidentSignature("mara", action(8, 7))).status, "failed");
    await generateResidentSignature("mara", action(8, 7));
    await readResidentSignature("mara");
    assert.equal(requests, 6, "Failed request replay and reads never retry the provider");
    failProvider = false;

    const attemptRow = [...records.values()].find((row) => row.kind === "resident-signature");
    attemptRow.data.status = "running";
    assert.equal(
      (await readResidentSignature("mara")).status,
      "interrupted",
      "A stopped request with this process owner still needs explicit recovery",
    );
    attemptRow.data.owner = "previous-process";
    assert.equal((await readResidentSignature("mara")).status, "interrupted");
    assert.equal(requests, 6);
    let unblock!: () => void, dispatch!: () => void;
    imageGate = new Promise<void>((resolve) => {
      unblock = resolve;
    });
    const dispatched = new Promise<void>((resolve) => {
      dispatch = resolve;
    });
    entered = dispatch;
    const pending = generateResidentSignature("mara", action(9, 8));
    await dispatched;
    const duplicate = generateResidentSignature("mara", action(9, 8));
    await assert.rejects(generateResidentSignature("mara", action(10, 9)), /already/);
    unblock();
    await Promise.all([pending, duplicate]);
    assert.equal(requests, 7, "Concurrent duplicate clicks share one request");
    entered = undefined;
    imageGate = undefined;

    imageGate = new Promise<void>((resolve) => {
      unblock = resolve;
    });
    const cardGate = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const oldSignature = (await readResidentSignature("mara")).saved;
    const stale = generateResidentSignature("mara", action(10, 9));
    await cardGate;
    await mutateVillageState((state) => {
      state.villagers[0]!.cardSnapshot.personality = "Quiet and shy";
    });
    const beforeUploads = uploads;
    unblock();
    const staleResult = await stale;
    assert.equal(staleResult.status, "failed");
    assert.deepEqual(staleResult.saved, oldSignature);
    assert.equal(uploads, beforeUploads);
    assert.equal(staleResult.fallback.hand, "neat");
    assert.equal(
      staleResult.recoverable,
      false,
      "Old personality artwork cannot be advertised as a free recovery for the changed card",
    );
    entered = undefined;
    imageGate = undefined;

    imageGate = new Promise<void>((resolve) => {
      unblock = resolve;
    });
    const removalGate = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const removed = generateResidentSignature("mara", action(11, 10));
    await removalGate;
    await mutateVillageState((state) => {
      state.villagers = [];
    });
    unblock();
    await assert.rejects(removed, /no longer/);
    assert.equal((await readVillageAuthority()).villagers.length, 0);
    assert.equal(uploads, beforeUploads, "Removed Villagers never receive late image effects");
    await mutateVillageState((state) => {
      state.seed = "new-signature-village";
      state.villagers = structuredClone(village.villagers);
    });
    assert.equal((await readResidentSignature("mara")).attempt, 0, "Reset Villages do not inherit request claims");
    imageGate = new Promise<void>((resolve) => {
      unblock = resolve;
    });
    const runtimeGate = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const stopped = generateResidentSignature("mara", action(12, 0));
    await runtimeGate;
    releaseReplacement = configureVillagesRuntime(host as any);
    unblock();
    await assert.rejects(stopped, /runtime is not configured/);
    assert.equal((await readResidentSignature("mara")).status, "interrupted");
    assert.equal(uploads, beforeUploads, "Package replacement fences late gallery and Village writes");
    // Supporting character evidence now fences late effects as personality does.
    let releaseEvidence!: () => void;
    imageGate = new Promise<void>((resolve) => {
      releaseEvidence = resolve;
    });
    const evidenceEntered = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const priorAttempt = (await readResidentSignature("mara")).attempt;
    const evidencePending = generateResidentSignature("mara", action(55, priorAttempt));
    await evidenceEntered;
    await mutateVillageState((state) => {
      state.villagers[0]!.cardSnapshot.backstory = "Now signs harbor logs.";
    });
    const evidenceUploads = uploads;
    releaseEvidence();
    assert.equal((await evidencePending).status, "failed");
    assert.equal(uploads, evidenceUploads, "Changed backstory fences the image before upload");
    imageGate = undefined;
    entered = undefined;

    for (const field of ["appearance", "scenario", "systemPrompt", "postHistoryInstructions"] as const) {
      let unblockField!: () => void;
      imageGate = new Promise<void>((resolve) => {
        unblockField = resolve;
      });
      const fieldEntered = new Promise<void>((resolve) => {
        entered = resolve;
      });
      const attempt = (await readResidentSignature("mara")).attempt;
      const pendingField = generateResidentSignature("mara", action(100 + attempt, attempt));
      await fieldEntered;
      await mutateVillageState((state) => {
        state.villagers[0]!.cardSnapshot[field] = `Changed ${field}`;
      });
      const beforeFieldUploads = uploads;
      unblockField();
      const result = await pendingField;
      assert.equal(result.status, "failed", `${field} fences late results`);
      assert.equal(result.recoverable, false);
      assert.equal(uploads, beforeFieldUploads);
      imageGate = undefined;
      entered = undefined;
    }
    // Full evidence, including text omitted from the provider prompt, fences recovery.
    await mutateVillageState((state) => {
      state.villagers[0]!.cardSnapshot.personality = "a".repeat(9000);
    });
    failUpload = true;
    const evidenceAttempt = (await readResidentSignature("mara")).attempt;
    assert.equal((await generateResidentSignature("mara", action(200, evidenceAttempt))).recoverable, true);
    failUpload = false;
    const unchangedPrompt = signaturePrompt((await readVillageAuthority()).villagers[0]!);
    await mutateVillageState((state) => {
      state.villagers[0]!.cardSnapshot.personality = "a".repeat(4500) + "b" + "a".repeat(4499);
    });
    assert.equal(signaturePrompt((await readVillageAuthority()).villagers[0]!), unchangedPrompt);
    assert.equal(
      (await readResidentSignature("mara")).recoverable,
      false,
      "Elided evidence changes fence paid recovery",
    );

    const requestsBeforeLongName = requests;
    await mutateVillageState((state) => {
      state.villagers[0]!.cardSnapshot.name = "a".repeat(5000);
    });
    await assert.rejects(
      generateResidentSignature("mara", action(56, (await readResidentSignature("mara")).attempt)),
      /name is too long/,
    );
    assert.equal(requests, requestsBeforeLongName, "Oversized names fail before image dispatch");
    console.log(
      "Villager signatures: stable handwriting, transparent crop, persistence, free recovery, explicit retries and late-effect fences passed",
    );
  } finally {
    globalThis.fetch = originalFetch;
    release();
    releaseReplacement?.();
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
