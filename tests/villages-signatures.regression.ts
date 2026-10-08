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
  prepareSignatureImage,
} from "../packages/villages/src/server/features/residents/signature-image.js";

const now = "2026-10-04T12:00:00.000Z";
const village = coerceVillageState({
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
assert.match(signaturePrompt(village.villagers[0]!), /exact name/);
const pixels = new PNG({ width: 600, height: 400 });
pixels.data.fill(255);
for (let y = 180; y < 220; y++) for (let x = 100; x < 500; x++) pixels.data.set([0, 0, 0, 255], (y * 600 + x) * 4);
const trimmed = trimSignaturePixels(pixels);
assert.ok(trimmed.width < 600 && trimmed.height < 100);
const png = PNG.sync.read(trimmed.bytes);
assert.equal(png.data[3], 0, "White margins become transparent");
assert.equal(png.data[(30 * png.width + 30) * 4 + 3], 255, "Dark ink survives");
assert.throws(() => trimSignaturePixels(new PNG({ width: 10, height: 10 })), /blank/);
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
    documents: {
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
    },
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
    assert.ok(jpegResult.width < 600 && jpegResult.height < 100, "JPEG providers also yield a cropped PNG derivative");
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
