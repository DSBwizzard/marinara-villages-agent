import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
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
  removeStudioApprovedSprite,
  recoverStudioJob,
  assignStudioCells,
  saveStudioExpression,
  clearStudioReview,
  deleteStudioArtwork,
  deleteUnusedStudioFiles,
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
const legacyAsset = "villages-" + randomUUID();
const studioId = "sprite-studio-" + createHash("sha256").update("mara:2026-09-29T00:00:00Z").digest("hex");
records.set(studioId, {
  id: studioId,
  kind: "sprite-studio",
  revision: 1,
  data: {
    version: 1,
    settings: defaultStudioState().settings,
    jobs: [
      {
        id: "old-job",
        fingerprint: "",
        createdAt: "2026-09-29T00:00:00Z",
        status: "ready",
        error: "",
        planned: 1,
        attempted: 1,
        view: "front",
        connectionId: "image",
        model: "old-model",
        sheets: [
          {
            assetId: legacyAsset,
            url: "/api/sprites/" + legacyAsset + "/file/original.png",
            width: 512,
            height: 768,
            attempts: 1,
            usage: null,
            cells: [
              {
                id: "old-happy",
                view: "front",
                label: "happy",
                pose: "Waving",
                x: 0,
                y: 0,
                width: 512,
                height: 768,
                scale: 1,
                offsetX: 0,
                offsetY: 0,
                status: "candidate",
              },
            ],
          },
        ],
      },
    ],
  },
});
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
let savedWrites = 0,
  failSaveAt = 0,
  failDelete = false;
const storedFiles = new Map<string, string>();
const deletions: string[] = [];
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
  if (path === "/api/image-metadata/inspect") {
    const legacy = Buffer.from(String(body.image ?? "").split(",")[1] ?? "", "base64")
      .toString()
      .endsWith("legacy-large");
    return Response.json(legacy ? { width: 1024, height: 1536 } : { width: 512, height: 768 });
  }
  if (path.endsWith("/file/neutral.png"))
    return new Response(Buffer.concat([Buffer.from(png.split(",")[1]!, "base64"), Buffer.from("legacy-large")]), {
      headers: { "content-type": "image/png" },
    });
  if (/^\/api\/sprites\/villages-[^/]+\/file\/original\.png$/.test(path))
    return new Response(Buffer.from(png.split(",")[1]!, "base64"), { headers: { "content-type": "image/png" } });
  if (/^\/api\/sprites\/villages-[^/]+$/.test(path) && !init?.body)
    return Response.json(
      [...storedFiles.keys()]
        .filter((key) => key.startsWith(path + "/"))
        .map((key) => ({ expression: key.split("/").at(-1), url: path + "/file/" + key.split("/").at(-1) + ".png" })),
    );
  if (init?.method === "DELETE") {
    if (failDelete) return Response.json({ error: "Locked file" }, { status: 500 });
    deletions.push(path);
    storedFiles.delete(path);
    return new Response(null, { status: 204 });
  }
  if (/^\/api\/sprites\/villages-/.test(path)) {
    savedWrites++;
    if (savedWrites === failSaveAt) return Response.json({ error: "Image disk unavailable" }, { status: 507 });
    storedFiles.set(path + "/" + body.expression, body.image);
    return Response.json({ filename: (body.expression || "original") + ".png" });
  }
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
async function generateBatch(count: number, prefix = "expression") {
  const input = {
    view: "side",
    expressions: Array.from({ length: count }, (_, i) => ({
      label: prefix + "_" + i,
      pose: i === 0 ? "Running with arms raised" : "",
    })),
  };
  const plan = await planSpriteStudio("mara", input),
    submissionId = randomUUID();
  generationRelease = undefined;
  await Promise.all([
    startSpriteStudioJob("mara", { ...input, plan, submissionId }),
    startSpriteStudioJob("mara", { ...input, plan, submissionId }),
  ]);
  for (const _sheet of plan.batches) {
    await waitForCall();
    const done = generationRelease!;
    generationRelease = undefined;
    done();
  }
  const data = await settle();
  return { input, plan, submissionId, job: data.jobs.find((job) => job.id === submissionId)! };
}
const activeSprite = () => structuredClone(records.get("villages-village").data.villagers[0].sprite);
const cellsOf = (job: any) => job.sheets.flatMap((sheet: any) => sheet.cells);
async function assignBatch(jobId: string, overrides: Record<string, string> = {}) {
  const job = (await readSpriteStudio("mara")).jobs.find((item) => item.id === jobId)!;
  return assignStudioCells("mara", {
    batchId: jobId,
    cells: cellsOf(job).map((cell: any) => ({
      id: cell.id,
      expressionId: overrides[cell.id] ?? cell.expressionId,
      expected: cell,
      ...(cell.rendered ? {} : { image: png }),
    })),
  });
}
async function main() {
  try {
    const initial = await readSpriteStudio("mara");
    assert.equal(initial.version, 2);
    assert.equal(initial.assignments.length, 1, "legacy active artwork migrated without generation");
    assert.equal(initial.jobs[0]?.model, "Existing artwork");
    assert.equal(
      initial.jobs[0]!.sheets[0]!.cells[0]!.width,
      1024,
      "legacy adjustments keep the actual source dimensions",
    );
    assert.equal(initial.jobs[0]!.sheets[0]!.baseScale, 0.5);
    assert.equal(initial.defaultExpressionId, initial.assignments[0]?.expressionId);
    assert.equal(activeSprite().expressions[0].filename, "neutral.png");
    assert.equal(
      initial.jobs.find((job) => job.id === "old-job")!.sheets[0]!.url,
      "/api/sprites/" + legacyAsset + "/file/original.png",
    );
    assert.equal(initial.jobs.find((job) => job.id === "old-job")!.sheets[0]!.cells[0]!.pending, true);
    const withoutReference = await importStudioSheet("mara", {
      image: png,
      cells: [{ view: "front", label: "nervous", x: 0, y: 0, width: 512, height: 768 }],
    });
    const importedId = withoutReference.jobs.at(-1)!.id;
    await deleteStudioArtwork("mara", { batchId: importedId, confirmed: true, deleteFiles: true });
    await captureStudioReference("mara", { image: png });
    const reference = (await readSpriteStudio("mara")).reference!;
    await assert.rejects(() => captureStudioReference("mara", { image: png }), /already/);
    const oldSprite = activeSprite();
    await removeStudioApprovedSprite("mara", {
      view: "front",
      label: "neutral",
      url: "/api/sprites/" + oldSprite.assetId + "/file/neutral.png",
    });
    assert.equal(activeSprite(), null);
    const settings = defaultStudioState().settings;
    settings.connectionId = "image";
    settings.prompts.Custom = "Ink";
    await saveSpriteStudioSettings("mara", settings);
    await assert.rejects(() => saveSpriteStudioSettings("mara", { ...settings, style: "__proto__" }));
    for (const count of [1, 5, 6, 11]) {
      const input = {
        view: "side",
        expressions: Array.from({ length: count }, (_, i) => ({ label: "pose_" + i, pose: "" })),
      };
      const plan = await planSpriteStudio("mara", input);
      assert.deepEqual(
        plan.batches.map((batch) => batch.count),
        count > 6 ? [6, 5] : [count],
      );
    }
    constrainedCanvas = true;
    const lowSource = await planSpriteStudio("mara", {
      expressions: Array.from({ length: 6 }, (_, i) => ({ label: "p_" + i })),
    });
    assert.deepEqual(
      lowSource.batches.map((batch) => batch.count),
      [6],
      "source-cell resolution does not add requests",
    );
    constrainedCanvas = false;
    const individual = await planSpriteStudio("mara", {
      individual: true,
      expressions: Array.from({ length: 5 }, (_, i) => ({ label: "p_" + i })),
    });
    assert.equal(individual.batches.length, 5);
    fallbackConfigured = true;
    await assert.rejects(() => planSpriteStudio("mara", { expressions: [{ label: "happy" }] }), /automatic fallback/);
    fallbackConfigured = false;

    const a = await generateBatch(6, "a");
    assert.equal(a.job.sheets.length, 1);
    assert.equal(a.job.style, "PAPERCRAFT");
    const callsAfterA = calls;
    await startSpriteStudioJob("mara", { ...a.input, plan: a.plan, submissionId: a.submissionId });
    assert.equal(calls, callsAfterA, "submission deduplication survives completion");
    await assert.rejects(
      () =>
        startSpriteStudioJob("mara", {
          ...a.input,
          settings: { ...settings, style: "Custom" },
          plan: a.plan,
          submissionId: a.submissionId,
        }),
      /different selection/,
    );
    await assert.rejects(
      () =>
        startSpriteStudioJob("mara", {
          ...a.input,
          expressions: [{ label: "different" }],
          plan: a.plan,
          submissionId: a.submissionId,
        }),
      /different selection/,
    );
    assert.equal(requests[0].referenceImage, reference.url);
    assert.equal(requests[0].noBackground, true);
    assert.equal(requests[0].nativeTransparentPng, true);
    assert.equal(requests[0].fullBodyExpressionMode, false);
    assert.match(requests[0].promptOverrides[0].prompt, /Running with arms raised/);
    await assignBatch(a.job.id);
    const aActive = activeSprite(),
      writesAfterA = savedWrites;
    delete records.get(studioId).data.submissions;
    failVillageWrite = true;
    const migratedReceipts = await readSpriteStudio("mara");
    assert.ok(
      migratedReceipts.submissions.some((entry) => entry.id === a.job.id),
      "existing batches migrate submission receipts",
    );
    assert.deepEqual(activeSprite(), aActive, "receipt-only migration leaves scene assignments untouched");
    failVillageWrite = false;
    assert.equal(
      aActive.defaultExpressionId,
      cellsOf(a.job)[0].expressionId,
      "first filled slot is the default when neutral is absent",
    );
    const b = await generateBatch(5, "a");
    await assignBatch(b.job.id);
    const bActive = activeSprite(),
      afterGeneration = calls,
      afterB = savedWrites;
    assert.notDeepEqual(bActive.expressions, aActive.expressions);
    await assignBatch(a.job.id);
    assert.deepEqual(
      activeSprite().expressions,
      aActive.expressions,
      "A → B → A restores exact cached image assignments",
    );
    assert.equal(savedWrites, afterB, "swapping writes no images");
    assert.equal(calls, afterGeneration, "swapping generates no images");
    assert.equal(
      activeSprite().expressions.filter((item: any) => item.label === "a_5").length,
      1,
      "batch B retained a slot absent from B",
    );
    assert.ok(writesAfterA > 0);
    const delighted = await saveStudioExpression("mara", {
      name: "Delighted",
      pose: "Clapping",
      useWhen: "Celebrating a small success.",
    });
    const delightedSlot = delighted.studio.expressions.find((slot) => slot.label === "delighted")!;
    const bCell = cellsOf((await readSpriteStudio("mara")).jobs.find((job) => job.id === b.job.id)!)[0];
    await assignStudioCells("mara", { cells: [{ id: bCell.id, expressionId: delightedSlot.id }] });
    assert.equal(
      activeSprite().expressions.find((entry: any) => entry.expressionId === delightedSlot.id).cutoutId,
      bCell.id,
    );
    assert.equal(activeSprite().expressions.find((entry: any) => entry.label === "a_0").cutoutId, cellsOf(a.job)[0].id);
    await saveStudioExpression("mara", { id: delightedSlot.id, name: "Thrilled", pose: "Clapping", useWhen: "" });
    assert.equal(
      activeSprite().expressions.find((entry: any) => entry.expressionId === delightedSlot.id).pose,
      bCell.pose,
      "scene pose describes the assigned artwork rather than a different generation hint",
    );
    assert.ok(
      activeSprite()
        .expressions.find((entry: any) => entry.expressionId === delightedSlot.id)
        .aliases.includes("delighted"),
    );
    await saveStudioExpression("mara", { defaultId: delightedSlot.id });
    assert.equal(activeSprite().defaultExpressionId, delightedSlot.id);
    await assert.rejects(() => saveStudioExpression("mara", { removeId: delightedSlot.id }), /Remove/);

    const c = await generateBatch(11, "c");
    const prior = activeSprite();
    failSaveAt = savedWrites + 2;
    await assert.rejects(() => assignBatch(c.job.id), /disk unavailable/);
    assert.deepEqual(activeSprite(), prior, "a failed second image write leaves every prior assignment intact");
    failSaveAt = 0;
    failVillageWrite = true;
    await assert.rejects(() => assignBatch(c.job.id), /kept changing/);
    assert.deepEqual(activeSprite(), prior, "a failed Village commit leaves every prior assignment intact");
    failVillageWrite = false;
    const beforeRetryWrites = savedWrites;
    await assignBatch(c.job.id);
    assert.equal(savedWrites, beforeRetryWrites, "explicit assignment retry reuses fully persisted cutouts");
    const large = await generateBatch(31, "many");
    await assignBatch(large.job.id);
    assert.equal(activeSprite().expressions.filter((entry: any) => entry.label.startsWith("many_")).length, 31);
    assert.equal(
      coerceVillageState(records.get("villages-village").data).villagers[0]!.sprite!.expressions.length,
      activeSprite().expressions.length,
    );
    assert.ok(
      requests.every((request) => request.referenceImage === reference.url),
      "all views/styles keep the original identity reference",
    );
    const standalone = await generateBatch(1, "single");
    assert.equal(standalone.job.sheets[0]?.cells.length, 1);
    const five = await generateBatch(5, "five");
    assert.equal(five.job.sheets[0]?.cells.length, 5);

    // Active assignments and the reference survive both gallery and disk cleanup.
    await assert.rejects(
      () => deleteStudioArtwork("mara", { batchId: a.job.id, confirmed: true, deleteFiles: true }),
      /in use/,
    );
    await clearStudioReview("mara");
    let data = await readSpriteStudio("mara");
    assert.ok(data.jobs.some((job) => job.id === five.job.id));
    assert.ok(data.jobs.every((job) => job.sheets.every((sheet) => sheet.cells.every((cell) => !cell.pending))));
    const beforeCleanup = deletions.length;
    await deleteUnusedStudioFiles("mara");
    assert.equal(
      deletions.length,
      beforeCleanup + 1,
      "only failed-save ownership intent is unused; inactive alternatives stay retained",
    );
    const fiveSheet = five.job.sheets[0]!;
    const firstFive = fiveSheet.cells[0]!;
    await deleteStudioArtwork("mara", { ids: [firstFive.id], confirmed: true, deleteFiles: true });
    assert.ok(
      !deletions.includes("/api/sprites/" + fiveSheet.assetId + "/original"),
      "shared original retained for four remaining cutouts",
    );
    failDelete = true;
    const partial = await deleteStudioArtwork("mara", { batchId: five.job.id, confirmed: true, deleteFiles: true });
    assert.equal(partial.failures.length, 1);
    assert.ok(!partial.studio.jobs.some((job) => job.id === five.job.id));
    failDelete = false;
    const retryCleanup = await deleteUnusedStudioFiles("mara");
    assert.equal(retryCleanup.failures.length, 0);
    assert.equal(retryCleanup.deleted, 1);
    assert.ok(!deletions.some((path) => reference.url.startsWith(path)), "reference never deleted");
    assert.ok(
      !deletions.some((path) => !path.startsWith("/api/sprites/villages-")),
      "no character-card assets touched",
    );

    // Adjustments retain both the prior cutout and its current scene assignment.
    const beforeAdjust = activeSprite(),
      originalCell = cellsOf((await readSpriteStudio("mara")).jobs.find((job) => job.id === a.job.id)!)[0];
    await editStudioCell("mara", { id: originalCell.id, cell: { ...originalCell, offsetX: 15 } });
    assert.deepEqual(activeSprite(), beforeAdjust);
    data = await readSpriteStudio("mara");
    assert.equal(cellsOf(data.jobs.find((job) => job.id === a.job.id)!).at(-1).offsetX, 15);
    assert.throws(() => validateStudioCell({ ...originalCell, width: 99999 }, a.job.sheets[0]!), /crop/);
    await discardStudioCell("mara", { id: originalCell.id });
    assert.deepEqual(activeSprite(), beforeAdjust, "clearing one review flag does not remove an active image");
    const activeEntry = activeSprite().expressions.find((entry: any) => entry.expressionId === delightedSlot.id);
    const activeUrl = "/api/sprites/" + activeEntry.assetId + "/file/" + activeEntry.filename;
    await assert.rejects(
      () =>
        removeStudioApprovedSprite("mara", {
          view: activeEntry.view,
          label: activeEntry.label,
          url: activeUrl + "-stale",
        }),
      /changed/,
    );
    await removeStudioApprovedSprite("mara", { view: activeEntry.view, label: activeEntry.label, url: activeUrl });
    assert.notEqual(
      activeSprite().defaultExpressionId,
      delightedSlot.id,
      "default falls back after removing its last view",
    );

    generationRelease = undefined;
    failGeneration = true;
    const failedInput = { expressions: [{ label: "happy", pose: "" }] },
      failedPlan = await planSpriteStudio("mara", failedInput),
      failedId = randomUUID();
    await startSpriteStudioJob("mara", { ...failedInput, plan: failedPlan, submissionId: failedId });
    await waitForCall();
    generationRelease!();
    data = await settle();
    failGeneration = false;
    assert.equal(data.jobs.find((job) => job.id === failedId)!.status, "interrupted");
    assert.match(data.jobs.find((job) => job.id === failedId)!.error, /No automatic retry/);
    await deleteStudioArtwork("mara", { batchId: failedId, confirmed: true, deleteFiles: true });
    const afterDeletedSubmission = calls;
    const replay = await startSpriteStudioJob("mara", { ...failedInput, plan: failedPlan, submissionId: failedId });
    assert.equal(
      calls,
      afterDeletedSubmission,
      "deleting a batch cannot turn a transport replay into a fresh image request",
    );
    assert.ok(!replay.jobs.some((job) => job.id === failedId));
    assert.ok(replay.submissions.some((entry) => entry.id === failedId));
    await assert.rejects(
      () => startSpriteStudioJob("mara", { expressions: [{ label: "sad" }], plan: failedPlan, submissionId: failedId }),
      /different selection/,
    );
    const stored = [...records.values()].find((row) => row.kind === "sprite-studio");
    const recoverId = randomUUID();
    stored.data.jobs.push({
      ...structuredClone(a.job),
      id: recoverId,
      status: "interrupted",
      sheets: [],
      pendingAssetId: a.job.sheets[0]!.assetId,
      pendingBatch: a.plan.batches[0],
      pendingExpressions: a.input.expressions,
    });
    const beforeRecovery = calls;
    await recoverStudioJob("mara", { id: recoverId });
    assert.equal(calls, beforeRecovery, "recovery does not generate images");
    await importStudioSheet("mara", {
      image: png,
      cells: [{ view: "side", label: "nervous", x: 0, y: 0, width: 512, height: 768 }],
    });
    assert.ok((await readSpriteStudio("mara")).expressions.some((slot) => slot.label === "nervous"));
    const side = studioPrompt({
      name: "Bird",
      appearance: "",
      style: "",
      view: "side",
      expressions: [{ label: "happy", pose: "" }],
      batch: a.plan.batches[0]!,
    });
    assert.match(side, /OFF-CANVAS TO THE RIGHT/);
    assert.match(side, /off-white/);
    console.log(
      "Sprite Studio regression passed: generation counts, optional neutral, migration, stable meanings, mixed batches, cached swaps, atomic failures, shared-file protection and cleanup retries.",
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
