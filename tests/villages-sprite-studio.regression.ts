import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.ts";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.ts";
import {
  defaultStudioState,
  studioPrompt,
  validateStudioCell,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-model.ts";
import {
  readSpriteStudio,
  saveSpriteStudioSettings,
  planSpriteStudio,
  startSpriteStudioJob,
  importStudioSheet,
  editStudioCell,
  captureStudioReference,
  discardStudioCell,
  approveStudioCells,
  recoverStudioJob,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio.ts";

const records = new Map<string, any>();
let failVillageWrite = false;
const documents = {
  async getById(_package: string, id: string) {
    return structuredClone(records.get(id) ?? null);
  },
  async list(_package: string, kind: string) {
    return structuredClone([...records.values()].filter((row) => row.kind === kind));
  },
  async create(input: any) {
    if (records.has(input.id)) throw new Error("Exists");
    const row = { ...structuredClone(input), revision: 1 };
    records.set(input.id, row);
    return row;
  },
  async update(input: any) {
    if (failVillageWrite && input.id === "villages-village") throw new Error("Disk unavailable");
    const prior = records.get(input.id);
    if (!prior || prior.revision !== input.expectedRevision) return null;
    const row = { ...prior, ...structuredClone(input), revision: prior.revision + 1 };
    records.set(input.id, row);
    return row;
  },
};
const village = defaultVillageState();
village.villagers = coerceVillageState({
  villagers: [
    {
      characterId: "mara",
      addedAt: "2026-09-29T00:00:00Z",
      cardSnapshot: {
        id: "mara",
        revision: 1,
        name: "Mara",
        sourceStatus: "missing",
        capturedAt: "2026-09-29T00:00:00Z",
        appearance: "A bird with a blue scarf",
      },
      sprite: {
        assetId: "villages-" + randomUUID(),
        expressions: [{ label: "neutral", view: "front", filename: "neutral.png" }],
      },
    },
  ],
}).villagers;
records.set("villages-village", { id: "villages-village", data: village, revision: 1 });
const release = configureVillagesRuntime({
  resources: { listCharacters: async () => [] },
  persistence: { documents },
  isDebugAgentsEnabled: () => false,
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
} as any);
const previousFetch = globalThis.fetch;
let calls = 0,
  failGeneration = false,
  constrainedCanvas = false,
  fallbackConfigured = false,
  generationRelease: (() => void) | undefined;
const requests: any[] = [];
const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAMACAIAAABfake";
globalThis.fetch = async (url, init) => {
  const path = new URL(String(url)).pathname;
  const body = init?.body ? JSON.parse(String(init.body)) : {};
  if (path === "/api/connections")
    return Response.json([
      { id: "image", name: "Mock", provider: "image_generation", model: "test-image", isDefault: true },
      ...(fallbackConfigured
        ? [
            {
              id: "backup",
              name: "Backup",
              provider: "image_generation",
              model: "backup-image",
              fallbackForAgents: "true",
            },
          ]
        : []),
    ]);
  if (path === "/api/sprites/generate-sheet/preview")
    return Response.json({
      items: [
        {
          id: body.promptOverrides[0].id,
          width: constrainedCanvas && body.cols === 3 ? 1536 : body.cols * 512,
          height:
            constrainedCanvas && body.cols === 3 ? 1024 : constrainedCanvas && body.rows === 3 ? 1536 : body.rows * 768,
        },
      ],
    });
  if (path === "/api/sprites/generate-sheet") {
    calls++;
    requests.push(body);
    await new Promise<void>((resolve) => {
      generationRelease = resolve;
    });
    if (failGeneration) return Response.json({ error: "Provider timeout" }, { status: 504 });
    return Response.json({
      sheetBase64: png.split(",")[1],
      cells: body.expressions.map((expression: string) => ({ expression, base64: png.split(",")[1] })),
    });
  }
  if (path === "/api/image-metadata/inspect") return Response.json({ width: 512, height: 768 });
  if (/^\/api\/sprites\/villages-[^/]+\/file\/original\.png$/.test(path))
    return new Response(Buffer.from(png.split(",")[1]!, "base64"), { headers: { "content-type": "image/png" } });
  if (/^\/api\/sprites\/villages-[^/]+$/.test(path) && !init?.body)
    return Response.json([{ expression: "original", url: path + "/file/original.png" }]);
  if (/^\/api\/sprites\/villages-/.test(path))
    return Response.json({ filename: (body.expression || "original") + ".png" });
  throw new Error("Unexpected Engine call: " + path);
};
async function settle() {
  for (let i = 0; i < 100; i++) {
    const data = await readSpriteStudio("mara");
    if (!data.jobs.some((job) => job.status === "running")) return data;
    await new Promise((resolve) => setTimeout(resolve, 2));
  }
  throw new Error("Job did not finish");
}
async function waitForCall() {
  for (let i = 0; i < 100 && !generationRelease; i++) await new Promise((resolve) => setTimeout(resolve, 2));
  assert.ok(generationRelease);
}
async function main() {
  try {
    assert.equal((await readSpriteStudio("mara")).settings.style, "PAPERCRAFT");
    const settings = defaultStudioState().settings;
    settings.connectionId = "image";
    settings.prompts.Custom = "Ink";
    await saveSpriteStudioSettings("mara", settings);
    assert.equal((await readSpriteStudio("mara")).settings.prompts.Custom, "Ink");
    await assert.rejects(() => saveSpriteStudioSettings("mara", { ...settings, style: "__proto__" }));
    const input = {
      view: "front",
      expressions: ["happy", "sad", "angry", "surprised", "thinking"].map((label) => ({
        label,
        pose: label === "happy" ? "Arms raised" : "",
      })),
    };
    const plan = await planSpriteStudio("mara", input),
      submissionId = randomUUID();
    assert.equal(plan.protocol, 2);
    assert.equal(plan.batches.length, 1);
    assert.equal(plan.batches[0]?.count, 5);
    assert.equal(plan.estimatedCost, null);
    const individualPlan = await planSpriteStudio("mara", { ...input, individual: true });
    assert.deepEqual(
      individualPlan.batches.map((batch) => batch.count),
      [1, 1, 1, 1, 1],
    );
    await Promise.all([
      startSpriteStudioJob("mara", { ...input, plan, submissionId }),
      startSpriteStudioJob("mara", { ...input, plan, submissionId }),
    ]);
    await waitForCall();
    assert.equal(calls, 1);
    generationRelease!();
    let data = await settle();
    assert.equal(data.jobs.length, 1);
    assert.equal(data.jobs[0]!.sheets[0]!.cells.length, 5);
    assert.equal(data.jobs[0]!.sheets[0]!.usage, null);
    assert.match(requests[0].promptOverrides[0].prompt, /Arms raised/);
    assert.equal(requests[0].fullBodyExpressionMode, false);
    assert.equal(requests[0].noBackground, false);
    assert.equal(requests[0].nativeTransparentPng, false);
    constrainedCanvas = true;
    const split = await planSpriteStudio("mara", input);
    assert.deepEqual(
      split.batches.map((batch) => batch.count),
      [4, 1],
    );
    constrainedCanvas = false;
    fallbackConfigured = true;
    await assert.rejects(() => planSpriteStudio("mara", input), /automatic fallback/);
    fallbackConfigured = false;
    await startSpriteStudioJob("mara", { ...input, plan, submissionId });
    assert.equal(calls, 1);
    await assert.rejects(
      () => startSpriteStudioJob("mara", { ...input, expressions: [{ label: "happy" }], plan, submissionId }),
      /different selection/,
    );
    const sheet = data.jobs[0]!.sheets[0]!,
      cell = sheet.cells[0]!;
    assert.throws(() => validateStudioCell({ ...cell, width: 99999 }, sheet), /crop/);
    await editStudioCell("mara", { id: cell.id, cell: { ...cell, offsetX: 15, cleanup: true } });
    assert.equal((await readSpriteStudio("mara")).jobs[0]!.sheets[0]!.cells[0]!.offsetX, 15);
    await assert.rejects(
      () => approveStudioCells("mara", { cells: [{ id: cell.id, expected: cell, image: png }] }),
      /changed/,
    );
    const currentCell = (await readSpriteStudio("mara")).jobs[0]!.sheets[0]!.cells[0]!;
    const beforeApproval = structuredClone(records.get("villages-village").data.villagers[0].sprite);
    failVillageWrite = true;
    await assert.rejects(
      () => approveStudioCells("mara", { cells: [{ id: cell.id, expected: currentCell, image: png }] }),
      /kept changing/,
    );
    assert.deepEqual(records.get("villages-village").data.villagers[0].sprite, beforeApproval);
    failVillageWrite = false;
    await approveStudioCells("mara", { cells: [{ id: cell.id, expected: currentCell, image: png }] });
    await approveStudioCells("mara", { cells: [{ id: cell.id, expected: currentCell, image: png }] });
    assert.equal(calls, 1, "approval retry makes no image-generation call");
    assert.match(
      records.get("villages-village").data.villagers[0].sprite.expressions.find((entry: any) => entry.label === "happy")
        .filename,
      /^s-[a-f0-9]{32}\.png$/,
    );
    await discardStudioCell("mara", { id: sheet.cells[1]!.id });
    generationRelease = undefined;
    failGeneration = true;
    await startSpriteStudioJob("mara", { ...input, plan, submissionId: randomUUID() });
    await waitForCall();
    generationRelease!();
    data = await settle();
    assert.equal(calls, 2);
    assert.equal(data.jobs[1]!.status, "interrupted");
    assert.match(data.jobs[1]!.error, /No automatic retry/);
    assert.equal(data.jobs[0]!.sheets.length, 1);
    const persisted = [...records.values()].find((row) => row.kind === "sprite-studio");
    const recoverId = randomUUID();
    persisted.data.jobs.push({
      ...structuredClone(data.jobs[0]),
      id: recoverId,
      status: "interrupted",
      sheets: [],
      pendingAssetId: data.jobs[0]!.sheets[0]!.assetId,
      pendingBatch: plan.batches[0],
      pendingExpressions: input.expressions,
    });
    await recoverStudioJob("mara", { id: recoverId });
    assert.equal(calls, 2, "saved-sheet recovery makes no image-generation call");
    assert.equal((await readSpriteStudio("mara")).jobs.find((job) => job.id === recoverId)?.sheets.length, 1);
    await importStudioSheet("mara", {
      image: png,
      cells: [{ view: "side", label: "neutral", x: 0, y: 0, width: 512, height: 768 }],
    });
    await captureStudioReference("mara", { image: png });
    const ref = (await readSpriteStudio("mara")).reference!;
    assert.equal(ref.origin, "upload");
    assert.equal(
      coerceVillageState(records.get("villages-village").data).villagers[0]!.cardSnapshot.spriteReference?.url,
      ref.url,
    );
    await assert.rejects(() => captureStudioReference("mara", { image: png }), /already/);
    const stored = [...records.values()].find((row) => row.kind === "sprite-studio");
    stored.data.jobs.push({ ...structuredClone(stored.data.jobs[0]), id: randomUUID(), status: "running" });
    assert.equal((await readSpriteStudio("mara")).jobs.at(-1)?.status, "interrupted");
    assert.equal(calls, 2);
    assert.ok(!JSON.stringify(records.get("villages-village").data).includes("original.png"));
    const side = studioPrompt({
      name: "Bird",
      appearance: "",
      style: "",
      view: "side",
      expressions: [{ label: "happy", pose: "" }],
      batch: plan.batches[0]!,
    });
    assert.match(side, /OFF-CANVAS TO THE RIGHT/);
    assert.match(side, /Do NOT make eye contact/);
    assert.match(side, /off-white/);
    console.log(
      "Sprite Studio regression passed: persistence, deduplication, failures, import, geometry, frozen reference and gaze.",
    );
  } finally {
    globalThis.fetch = previousFetch;
    release();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
