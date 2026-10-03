import { PNG } from "pngjs";
import { generateResidentSprite } from "../packages/villages/src/engine/packages/server/src/services/villages/resident-sprites.ts";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.ts";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.ts";
import {
  defaultStudioState,
  SPRITE_STYLES,
  LEGACY_STUDIO_PAPERCRAFT,
  PREVIOUS_STUDIO_BATTLEHIGHWAY,
  STUDIO_FACING_PROMPTS,
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
  repairStudioBackgrounds,
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
let failSourceWrite = false;
let failPreparationReadyWrite = false;
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
    if (failSourceWrite && input.data?.jobs?.some((job: any) => job.pendingSource)) {
      throw new Error("Source metadata disk unavailable");
    }
    if (
      failPreparationReadyWrite &&
      input.data?.jobs?.some((job: any) => job.preparation?.status === "ready" && job.phase === "preparing")
    )
      throw new Error("Prepared direction write failed");
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
records.get(studioId).data.settings.prompts.PAPERCRAFT = LEGACY_STUDIO_PAPERCRAFT;
delete records.get(studioId).data.settings.styleSelection;
records.get(studioId).data.jobs[0].stylePrompt = LEGACY_STUDIO_PAPERCRAFT;
records.get(studioId).data.settings.prompts.BATTLEHIGHWAY = PREVIOUS_STUDIO_BATTLEHIGHWAY;
delete records.get(studioId).data.settings.facingPrompts;
const release = configureVillagesRuntime({
  languageModels: {
    async resolveForRequest() {
      return {
        connectionId: "system",
        model: "test-system",
        maxOutputTokens: 8192,
        fitContext: (messages: any[], options: any) => ({ messages, maxTokens: options.maxTokens }),
        async chatComplete(messages: any[]) {
          preparationCalls++;
          const input = JSON.parse(messages[1].content);
          preparationInputs.push(input);
          if (failPreparation) throw new Error("System outcome unknown");
          return {
            content: invalidPreparation
              ? ""
              : JSON.stringify({
                  interpretation: input.character.personality || "Warm and thoughtful",
                  expressions: input.expressions.map((entry: any) => ({
                    label: entry.label,
                    direction: preparedDirection || entry.userPose || "Soft eyes and a relaxed, attentive stance.",
                  })),
                }),
            usage: { inputTokens: 100, outputTokens: 50 },
          };
        },
      };
    },
  },
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
let preparationCalls = 0,
  failPreparation = false,
  invalidPreparation = false;
let preparedDirection = "";
const preparationInputs: any[] = [];
const requests: any[] = [];
let savedWrites = 0,
  failSaveAt = 0,
  failDelete = false;
const storedFiles = new Map<string, string>();
const deletions: string[] = [];
function fixture(cols = 1, rows = 1, count = 1) {
  const image = new PNG({ width: 512, height: 768 });
  for (let cell = 0; cell < count; cell++) {
    const cw = 512 / cols,
      ch = 768 / rows,
      x = (cell % cols) * cw,
      y = Math.floor(cell / cols) * ch;
    for (let py = Math.ceil(y + ch * 0.15); py < y + ch * 0.85; py++)
      for (let px = Math.ceil(x + cw * 0.25); px < x + cw * 0.75; px++) {
        const i = (py * 512 + px) * 4;
        image.data.set([52, 103, 171, 255], i);
      }
  }
  return "data:image/png;base64," + PNG.sync.write(image).toString("base64");
}
const png = fixture();
const sixPng = fixture(3, 2, 6);
let reviewCalls = 0,
  cleanupCalls = 0,
  failCleanup = false;
globalThis.fetch = async (url, init) => {
  const path = new URL(String(url)).pathname;
  const body = init?.body ? JSON.parse(String(init.body)) : {};
  if (path === "/api/connections")
    return Response.json([
      { id: "vision", name: "Vision", provider: "openai", model: "vision-model" },
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
  if (path === "/api/app-settings/ui") return Response.json({ value: null });
  if (path === "/api/sprites/generate-sheet/preview")
    return Response.json({
      items: [
        {
          id: body.promptOverrides[0].id,
          width: constrainedCanvas && body.cols * 512 > 1024 ? 1536 : body.cols * 512,
          height: constrainedCanvas && body.cols * 512 > 1024 ? 1024 : body.rows * 768,
          prompt: body.promptOverrides[0].prompt,
          negativePrompt: body.promptOverrides[0].negativePrompt,
        },
      ],
    });
  if (path === "/api/characters/mara") return Response.json({ avatarPath: "/api/avatars/file/mara.png" });
  if (path === "/api/characters/no-avatar") return Response.json({ avatarPath: "" });
  if (path === "/api/avatars/file/mara.png")
    return new Response(Buffer.from(png.split(",")[1]!, "base64"), { headers: { "content-type": "image/png" } });
  if (path === "/api/sprites/cleanup") {
    cleanupCalls++;
    if (failCleanup) return Response.json({ error: "Cleanup unavailable" }, { status: 503 });
    return Response.json({ cells: body.cells });
  }
  if (path === "/api/sprites/capabilities")
    return Response.json({ backgroundRemovalAvailable: true, backgroundRemover: { installed: false } });
  if (path === "/api/generate/raw") {
    reviewCalls++;
    return Response.json({ content: "malformed" });
  }
  if (path === "/api/sprites/generate-sheet") {
    calls++;
    requests.push(body);
    await new Promise<void>((resolve) => {
      generationRelease = resolve;
    });
    if (failGeneration) return Response.json({ error: "Provider timeout" }, { status: 504 });
    const sheet = fixture(body.cols, body.rows, body.expressions.length);
    const decoded = PNG.sync.read(Buffer.from(sheet.split(",")[1]!, "base64"));
    const cw = Math.floor(decoded.width / body.cols),
      ch = Math.floor(decoded.height / body.rows);
    const cells = body.expressions.map((expression: string, index: number) => {
      const crop = new PNG({ width: cw, height: ch });
      for (let y = 0; y < ch; y++) {
        const from = ((Math.floor(index / body.cols) * ch + y) * decoded.width + (index % body.cols) * cw) * 4;
        decoded.data.copy(crop.data, y * cw * 4, from, from + cw * 4);
      }
      return { expression, base64: PNG.sync.write(crop).toString("base64") };
    });
    return Response.json({ sheetBase64: sheet.split(",")[1], cells });
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
  if (/^\/api\/sprites\/villages-[^/]+\/file\/[a-z0-9_-]+\.png$/.test(path))
    return new Response(
      Buffer.from((storedFiles.get(path.replace("/file/", "/").replace(/\.png$/, "")) ?? png).split(",")[1]!, "base64"),
      { headers: { "content-type": "image/png" } },
    );
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
async function settle(characterId = "mara") {
  for (let i = 0; i < 1000; i++) {
    const data = await readSpriteStudio(characterId);
    if (!data.jobs.some((job) => job.status === "running")) return data;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error("Job did not finish");
}
async function waitForCall() {
  for (let i = 0; i < 100 && !generationRelease; i++) await new Promise((resolve) => setTimeout(resolve, 2));
  assert.ok(generationRelease);
}
async function generateBatch(count: number, prefix = "expression", view = "side", individual = false) {
  const input = {
    view,
    individual,
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
    assert.equal(initial.settings.prompts.PAPERCRAFT, SPRITE_STYLES.PAPERCRAFT);
    assert.equal(initial.settings.prompts.BATTLEHIGHWAY, SPRITE_STYLES.BATTLEHIGHWAY);
    assert.equal(initial.settings.facingPrompts!.PAPERCRAFT.front, STUDIO_FACING_PROMPTS.front);
    const editedSettings = {
      ...initial.settings,
      prompts: { ...initial.settings.prompts, BATTLEHIGHWAY: "My angular style with deliberately exaggerated shapes." },
      facingPrompts: {
        ...initial.settings.facingPrompts!,
        BATTLEHIGHWAY: { front: "", side: "Full right-facing profile." },
      },
    };
    await saveSpriteStudioSettings("mara", editedSettings);
    assert.deepEqual(
      (await readSpriteStudio("mara")).settings,
      editedSettings,
      "custom style and empty/custom facing survive coercion",
    );
    await assert.rejects(
      () =>
        saveSpriteStudioSettings("mara", {
          ...editedSettings,
          facingPrompts: { ...editedSettings.facingPrompts, BATTLEHIGHWAY: { front: "x".repeat(6001), side: "" } },
        }),
      /6,000/,
    );
    await saveSpriteStudioSettings("mara", initial.settings);
    assert.equal(
      initial.jobs.find((j) => j.id === "old-job")!.stylePrompt,
      LEGACY_STUDIO_PAPERCRAFT,
      "preset migration preserves historical style provenance",
    );
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
    const automatic = await planSpriteStudio("mara", {
      settings: { ...defaultStudioState().settings, connectionId: "image" },
      expressions: [{ label: "happy" }],
    });
    assert.equal(
      automatic.batches[0]!.request!.referenceRoles!.length,
      1,
      "existing avatar is captured automatically without design approval",
    );
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
    settings.styleSelection = { kind: "studio" };
    settings.connectionId = "image";
    settings.prompts.Custom = "Ink";
    await saveSpriteStudioSettings("mara", settings);
    await planSpriteStudio("mara", { expressions: [{ label: "happy" }] });
    assert.equal((await readSpriteStudio("mara")).designs!.length, 0, "no design approval is needed");
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
    await planSpriteStudio("mara", { expressions: [{ label: "happy" }] });
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
    assert.deepEqual(requests[0].referenceImages, [png]);
    assert.equal(requests[0].spriteType, "full-body");
    assert.equal(requests[0].noBackground, false);
    assert.equal(requests[0].nativeTransparentPng, false);
    assert.equal(requests[0].fullBodyExpressionMode, false);
    assert.equal(requests[0].promptOverrides[0].prompt, a.job.receipts![0].request!.prompt);
    assert.equal(requests[0].promptOverrides[0].negativePrompt, a.job.receipts![0].request!.negativePrompt);
    assert.equal(a.job.preparation!.status, "ready");
    assert.equal(a.job.preparation!.attempts.length, 1, "duplicate submissions share one preparation");
    const source = a.job.sheets[0].source!;
    assert.equal(source.kind, "generated-raw");
    assert.equal(source.matteHex, "#FF00FF");
    assert.equal(source.pipelineVersion, 5);
    assert.equal(
      source.sha256,
      createHash("sha256")
        .update(Buffer.from(sixPng.split(",")[1]!, "base64"))
        .digest("hex"),
    );
    assert.equal(
      storedFiles.get("/api/sprites/" + a.job.sheets[0].assetId + "/original"),
      sixPng,
      "source bytes are saved without cleanup",
    );
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
    for (const cell of cellsOf(records.get(studioId).data.jobs.find((j: any) => j.id === c.job.id)))
      delete cell.rendered;
    failSaveAt = savedWrites + 2;
    await assert.rejects(() => assignBatch(c.job.id), /disk unavailable/);
    assert.deepEqual(activeSprite(), prior, "a failed second image write leaves every prior assignment intact");
    failSaveAt = 0;
    failVillageWrite = true;
    await assert.rejects(() => assignBatch(c.job.id), /Disk unavailable/);
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
      requests.every((request) => request.referenceImages[0] === png),
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
    assert.ok(deletions.length > beforeCleanup, "failed-save intents and superseded derivative caches are collected");
    assert.ok(
      !deletions.includes("/api/sprites/" + large.job.sheets[0].assetId + "/original"),
      "inactive alternatives retain their original source",
    );
    const fiveSheet = five.job.sheets[0]!;
    const firstFive = fiveSheet.cells[0]!;
    await deleteStudioArtwork("mara", { ids: [firstFive.id], confirmed: true, deleteFiles: true });
    assert.ok(
      !deletions.includes("/api/sprites/" + fiveSheet.assetId + "/original"),
      "shared original retained for four remaining cutouts",
    );
    const remainingFiveFiles = records
      .get(studioId)
      .data.files.filter((f: any) => f.assetId === fiveSheet.assetId).length;
    failDelete = true;
    const partial = await deleteStudioArtwork("mara", { batchId: five.job.id, confirmed: true, deleteFiles: true });
    assert.equal(partial.failures.length, remainingFiveFiles);
    assert.ok(!partial.studio.jobs.some((job) => job.id === five.job.id));
    failDelete = false;
    const retryCleanup = await deleteUnusedStudioFiles("mara");
    assert.equal(retryCleanup.failures.length, 0);
    assert.equal(retryCleanup.deleted, remainingFiveFiles);
    assert.ok(!deletions.some((path) => reference.url.startsWith(path)), "reference never deleted");
    assert.ok(
      !deletions.some((path) => !path.startsWith("/api/sprites/villages-")),
      "no character-card assets touched",
    );

    // Batch repair retains originals, reuses clones on retry, and publishes active
    // replacements only through the existing all-images-saved assignment path.
    const beforeRepair = activeSprite();
    const repairState = await readSpriteStudio("mara");
    const repairJob = repairState.jobs.find((job) => job.id === a.job.id)!;
    const originalCount = cellsOf(repairJob).length;
    const repaired = await repairStudioBackgrounds("mara", { batchId: a.job.id });
    assert.deepEqual(activeSprite(), beforeRepair, "preparing repair keeps existing active images");
    assert.equal(repaired.repairedCells.length, originalCount);
    const repairedJob = repaired.jobs.find((job) => job.id === a.job.id)!;
    assert.equal(cellsOf(repairedJob).length, originalCount * 2);
    for (const mapping of repaired.repairedCells) {
      const cell = cellsOf(repairedJob).find((item) => item.id === mapping.cellId)!;
      assert.equal(cell.cleanup, true);
      assert.equal(cell.cleanupVersion, 5);
      assert.ok(cell.rendered?.sha256, "repair saves a newly validated derivative");
      assert.ok(cellsOf(repairedJob).some((item) => item.id === mapping.originalId));
    }
    const retriedRepair = await repairStudioBackgrounds("mara", { batchId: a.job.id });
    assert.deepEqual(retriedRepair.repairedCells, repaired.repairedCells, "retry reuses repair candidates");
    const repairedAssignments = repaired.assignments.flatMap((entry) => {
      const mapping = repaired.repairedCells.find((item) => item.originalId === entry.cellId);
      const cell = cellsOf(repairedJob).find((item) => item.id === mapping?.cellId);
      return cell ? [{ id: cell.id, expressionId: entry.expressionId, expected: cell, image: png }] : [];
    });
    assert.ok(repairedAssignments.length);
    for (const entry of repairedAssignments)
      delete cellsOf(records.get(studioId).data.jobs.find((j: any) => j.id === a.job.id)).find(
        (cell: any) => cell.id === entry.id,
      ).rendered;
    failSaveAt = savedWrites + 1;
    await assert.rejects(
      () => assignStudioCells("mara", { cells: repairedAssignments, batchId: a.job.id }),
      /disk unavailable/,
    );
    assert.deepEqual(activeSprite(), beforeRepair, "failed repair save preserves all active assignments");
    failSaveAt = 0;
    await assignStudioCells("mara", { cells: repairedAssignments, batchId: a.job.id });
    for (const entry of repairedAssignments)
      assert.equal(
        activeSprite().expressions.find(
          (item: any) => item.expressionId === entry.expressionId && item.view === entry.expected.view,
        ).cutoutId,
        entry.id,
      );
    await assert.rejects(() => repairStudioBackgrounds("mara", { batchId: "missing" }), /no longer exists/);
    // Simulate cached artwork from the prior cleanup release, including an
    // active repaired cutout. Upgrade it without mutating its saved pixels.
    const storedStudio = [...records.values()].find((record) => record.kind === "sprite-studio");
    const priorRepairJob = storedStudio.data.jobs.find((job: any) => job.id === a.job.id);
    for (const cell of cellsOf(priorRepairJob)) if (cell.repairedFrom) cell.cleanupVersion = 2;
    const priorVersionSprite = activeSprite();
    const upgraded = await repairStudioBackgrounds("mara", { batchId: a.job.id });
    assert.deepEqual(activeSprite(), priorVersionSprite, "preparing an upgrade leaves old assignments intact");
    const upgradedJob = upgraded.jobs.find((job) => job.id === a.job.id)!;
    const upgradedCells = cellsOf(upgradedJob).filter((cell: any) => cell.repairedFrom && cell.cleanupVersion === 5);
    assert.equal(upgradedCells.length, originalCount, "each root artwork gets one current-version repair");
    for (const entry of repairedAssignments) {
      const replacement = upgraded.repairedCells.find((item) => item.originalId === entry.id);
      assert.ok(replacement, "active prior-version repaired IDs map to upgraded candidates");
      assert.notEqual(replacement.cellId, entry.id);
      assert.ok(cellsOf(upgradedJob).find((cell) => cell.id === replacement.cellId)!.rendered?.sha256);
    }
    const upgradedRetry = await repairStudioBackgrounds("mara", { batchId: a.job.id });
    assert.equal(cellsOf(upgradedRetry.jobs.find((job) => job.id === a.job.id)!).length, cellsOf(upgradedJob).length);
    assert.deepEqual(upgradedRetry.repairedCells, upgraded.repairedCells);

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

    const beforeSourceFailure = activeSprite();
    const beforeSourceCalls = calls;
    failSourceWrite = true;
    const savedButInterrupted = await generateBatch(1, "source_write_failure");
    failSourceWrite = false;
    assert.equal(savedButInterrupted.job.status, "interrupted");
    assert.equal(savedButInterrupted.job.sheets.length, 0);
    assert.equal(
      storedFiles.get("/api/sprites/" + savedButInterrupted.job.pendingAssetId + "/original"),
      png,
      "paid source bytes survive a failed provenance document write",
    );
    const recoveredSource = await recoverStudioJob("mara", { id: savedButInterrupted.job.id });
    assert.equal(
      recoveredSource.jobs.find((job) => job.id === savedButInterrupted.job.id)!.sheets[0]!.source?.kind,
      "generated-raw",
    );
    assert.equal(calls, beforeSourceCalls + 1, "recovery never repeats generation");
    assert.deepEqual(activeSprite(), beforeSourceFailure);

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
      pendingSource: { ...a.job.sheets[0]!.source, sha256: "wrong" },
    });
    const beforeRecovery = calls;
    const beforeRecoveryActive = activeSprite();
    await assert.rejects(() => recoverStudioJob("mara", { id: recoverId }), /saved source changed/);
    assert.deepEqual(activeSprite(), beforeRecoveryActive);
    stored.data.jobs.find((job: any) => job.id === recoverId).pendingSource = a.job.sheets[0]!.source;
    const recovered = await recoverStudioJob("mara", { id: recoverId });
    assert.deepEqual(recovered.jobs.find((job) => job.id === recoverId)!.sheets[0]!.source, a.job.sheets[0]!.source);
    assert.deepEqual(activeSprite(), beforeRecoveryActive);
    assert.equal(calls, beforeRecovery, "recovery does not generate images");
    await importStudioSheet("mara", {
      image: png,
      cells: [{ view: "side", label: "nervous", x: 0, y: 0, width: 512, height: 768 }],
    });
    const imported = await readSpriteStudio("mara");
    assert.ok(imported.expressions.some((slot) => slot.label === "nervous"));
    assert.equal(imported.jobs.at(-1)!.sheets[0]!.source?.kind, "imported");
    assert.ok(imported.jobs.at(-1)!.sheets[0]!.source?.sha256);
    for (const view of ["front", "side"])
      for (const individual of [false, true]) {
        const workflow = await generateBatch(6, "workflow_" + view + "_" + individual, view, individual);
        assert.equal(workflow.job.attempted, individual ? 6 : 1);
        assert.equal(cellsOf(workflow.job).length, 6);
        assert.ok(cellsOf(workflow.job).every((cell: any) => cell.validation.status === "passed"));
        await assignBatch(workflow.job.id);
      }
    assert.ok(cleanupCalls > 0, "Engine built-in cleanup is used automatically");
    failCleanup = true;
    const fallback = await generateBatch(2, "cleanup_fallback");
    assert.ok(
      cellsOf(fallback.job).every((cell: any) => cell.rendered && cell.cleanupEngine === "studio"),
      "cleanup failure falls back to local matte processing",
    );
    failCleanup = false;
    const currentVillage = records.get("villages-village").data;
    currentVillage.villagers.push({
      ...structuredClone(currentVillage.villagers[0]),
      characterId: "no-avatar",
      sprite: null,
      cardSnapshot: {
        ...structuredClone(currentVillage.villagers[0].cardSnapshot),
        id: "no-avatar",
        spriteReference: undefined,
      },
    });
    const textInput = {
      settings: { ...defaultStudioState().settings, connectionId: "image" },
      view: "side",
      expressions: [{ label: "happy" }],
    };
    const textPlan = await planSpriteStudio("no-avatar", textInput);
    assert.deepEqual(textPlan.batches[0]!.request!.referenceRoles, [], "a missing avatar uses appearance text");
    generationRelease = undefined;
    await startSpriteStudioJob("no-avatar", { ...textInput, plan: textPlan, submissionId: randomUUID() });
    await waitForCall();
    generationRelease!();
    generationRelease = undefined;
    const textResult = await settle("no-avatar");
    assert.ok(textResult.jobs[0]!.sheets[0]!.cells[0]!.rendered);
    assert.deepEqual(requests.at(-1).referenceImages, []);
    assert.equal(reviewCalls, 0, "all generation, processing and assignment make zero AI review calls");
    const neutralInput = { view: "front", expressions: [{ label: "neutral" }] };
    const neutralPlan = await planSpriteStudio("mara", neutralInput),
      neutralId = randomUUID();
    generationRelease = undefined;
    await startSpriteStudioJob("mara", { ...neutralInput, plan: neutralPlan, submissionId: neutralId });
    await waitForCall();
    generationRelease!();
    generationRelease = undefined;
    await settle();
    await assignBatch(neutralId);
    const anchored = await planSpriteStudio("mara", { view: "front", expressions: [{ label: "happy" }] });
    assert.deepEqual(anchored.batches[0]!.request!.referenceRoles, [
      "original character identity",
      "styled neutral for the requested view",
    ]);
    const noOtherView = await planSpriteStudio("mara", { view: "side", expressions: [{ label: "happy" }] });
    assert.deepEqual(
      noOtherView.batches[0]!.request!.referenceRoles,
      ["original character identity"],
      "front-only neutral is optional and not used for the side view",
    );
    const beforeDesignMigration = activeSprite();
    const legacyDesign = {
      id: "uploaded-design",
      revision: 1,
      style: settings.style,
      stylePrompt: settings.prompts[settings.style],
      identityUrl: reference.url,
      side: { url: reference.url, approvedAt: "2026-09-30T00:00:00Z" },
      framing: { scale: 1, baseline: 752 },
    };
    records.get(studioId).data.designs.push(legacyDesign);
    const restoredDesign = (
      await Promise.all([readSpriteStudio("mara"), readSpriteStudio("mara"), readSpriteStudio("mara")])
    )[0]!;
    assert.ok(restoredDesign.jobs.some((job) => job.model === "Saved design" && job.view === "side"));
    assert.deepEqual(activeSprite(), beforeDesignMigration, "design gallery migration does not change assignments");
    const migratedCount = restoredDesign.jobs.length;
    assert.equal((await readSpriteStudio("mara")).jobs.length, migratedCount, "legacy design migration is idempotent");
    const designReference = await planSpriteStudio("mara", { view: "side", expressions: [{ label: "happy" }] });
    assert.equal(
      designReference.batches[0]!.request!.referenceRoles!.length,
      2,
      "a previously approved single view remains a usable optional reference",
    );
    await saveSpriteStudioSettings("mara", { ...settings, styleSelection: { kind: "default" } });
    const engineStyleReference = await planSpriteStudio("mara", { view: "side", expressions: [{ label: "happy" }] });
    assert.deepEqual(
      engineStyleReference.batches[0]!.request!.referenceRoles,
      ["original character identity"],
      "a legacy preset design does not silently become an Engine style reference",
    );
    await saveSpriteStudioSettings("mara", settings);
    const clippedImage = PNG.sync.read(Buffer.from(png.split(",")[1]!, "base64"));
    for (let x = 240; x < 270; x++) clippedImage.data.set([52, 103, 171, 255], (767 * 512 + x) * 4);
    const clippedImport = await importStudioSheet("mara", {
      image: "data:image/png;base64," + PNG.sync.write(clippedImage).toString("base64"),
      cells: [{ view: "front", label: "clipped_usable", x: 0, y: 0, width: 512, height: 768 }],
    });
    const clippedJob = clippedImport.jobs.at(-1)!;
    assert.equal(clippedJob.sheets[0]!.cells[0]!.validation!.status, "needs-review");
    await assignBatch(clippedJob.id);
    assert.ok(
      activeSprite().expressions.some((entry: any) => entry.label === "clipped_usable"),
      "framing notices require no acknowledgment checkbox",
    );
    const stale = await planSpriteStudio("mara", { expressions: [{ label: "happy" }] });
    await saveSpriteStudioSettings("mara", { ...settings, individual: true });
    await assert.rejects(
      () =>
        startSpriteStudioJob("mara", { expressions: [{ label: "happy" }], plan: stale, submissionId: randomUUID() }),
      /plan changed/,
    );
    const side = studioPrompt({
      name: "Bird",
      appearance: "",
      style: "",
      view: "side",
      expressions: [{ label: "happy", pose: "" }],
      batch: a.plan.batches[0]!,
    });
    assert.match(side, /off-screen to the right/);
    assert.match(side, /intentional character outlines/);
    assert.doesNotMatch(side, /paper-cut|off-white/);
    const beforeLegacyJobs = (await readSpriteStudio("mara")).jobs.length;
    const beforeLegacyCalls = calls;
    const legacyPromise = generateResidentSprite("mara", {
      view: "side",
      expression: "legacy_joy",
      appearance: "A bird in a coat",
      useReference: false,
    });
    while (calls === beforeLegacyCalls || !generationRelease) await new Promise((resolve) => setTimeout(resolve, 10));
    generationRelease();
    generationRelease = undefined;
    const legacySprite = await legacyPromise;
    assert.equal(legacySprite.width, 512);
    assert.equal(legacySprite.height, 768);
    const legacyJob = (await readSpriteStudio("mara")).jobs.at(-1)!;
    assert.equal((await readSpriteStudio("mara")).jobs.length, beforeLegacyJobs + 1);
    assert.equal(legacyJob.sheets[0]!.source?.pipelineVersion, 5);
    assert.deepEqual(legacyJob.receipts?.[0]?.request?.referenceRoles ?? [], []);

    const beforePreviewPreparation = preparationCalls;
    const groundedSlot = (
      await saveStudioExpression("mara", {
        name: "Quiet disappointment",
        useWhen: "Sad after a modest setback",
        pose: "Keep arms relaxed.",
      })
    ).studio.expressions.find((slot) => slot.name === "Quiet disappointment")!;
    const groundedInput = {
      view: "front",
      expressions: [{ expressionId: groundedSlot.id, label: groundedSlot.label, pose: "Keep arms relaxed." }],
    };
    const savedCard = records.get("villages-village").data.villagers[0].cardSnapshot;
    Object.assign(savedCard, {
      personality: "Sociable, street-wise, cheerful, protective of friends.",
      summary: "An adventurous day-bar owner.",
      description: "Outgoing but grounded.",
      backstory: "Travel taught her to stay composed.",
      exampleDialogue: "Well, that could have gone better.",
      appearance: "Bird with feathers along her arms. No wings on her back. Sleeveless top and trousers.",
    });
    const groundedPlan = await planSpriteStudio("mara", groundedInput);
    await planSpriteStudio("mara", groundedInput);
    assert.equal(preparationCalls, beforePreviewPreparation, "previews never prepare expressions");
    const personality = savedCard.personality;
    savedCard.personality = "Reserved and wary.";
    await assert.rejects(
      () =>
        startSpriteStudioJob("mara", {
          ...groundedInput,
          plan: groundedPlan,
          submissionId: randomUUID(),
        }),
      /plan changed/,
    );
    assert.equal(preparationCalls, beforePreviewPreparation, "stale character context is refused before spending");
    savedCard.personality = personality;
    const groundedId = randomUUID();
    failPreparation = true;
    const beforeFailureImages = calls;
    await startSpriteStudioJob("mara", { ...groundedInput, plan: groundedPlan, submissionId: groundedId });
    const failedPreparation = (await settle()).jobs.find((job) => job.id === groundedId)!;
    assert.equal(failedPreparation.phase, "preparing");
    assert.equal(failedPreparation.preparation!.status, "unknown");
    assert.equal(failedPreparation.preparation!.attempts.length, 1);
    assert.equal(calls, beforeFailureImages, "failed preparation submits no images");
    await startSpriteStudioJob("mara", { ...groundedInput, plan: groundedPlan, submissionId: groundedId });
    assert.equal(preparationCalls, beforePreviewPreparation + 1, "duplicate failed submissions never retry");
    assert.equal(preparationInputs.at(-1).character.personality, savedCard.personality);
    assert.equal(preparationInputs.at(-1).character.backstory, savedCard.backstory);
    assert.equal(preparationInputs.at(-1).character.exampleDialogue, savedCard.exampleDialogue);
    assert.equal(preparationInputs.at(-1).expressions[0].name, groundedSlot.name);
    assert.equal(preparationInputs.at(-1).expressions[0].useWhen, groundedSlot.useWhen);
    assert.equal(preparationInputs.at(-1).expressions[0].userPose, "Keep arms relaxed.");
    assert.equal(preparationInputs.at(-1).facingPrompt, STUDIO_FACING_PROMPTS.front);
    failPreparation = false;
    generationRelease = undefined;
    await recoverStudioJob("mara", { id: groundedId, retryGeneration: true });
    await waitForCall();
    generationRelease!();
    generationRelease = undefined;
    const groundedJob = (await settle()).jobs.find((job) => job.id === groundedId)!;
    assert.equal(groundedJob.preparation!.attempts.length, 2);
    assert.equal(groundedJob.preparation!.attempts[0].status, "unknown");
    assert.match(groundedJob.receipts![0].request!.prompt, /street-wise/);
    assert.match(groundedJob.receipts![0].request!.prompt, /Quiet disappointment/);
    assert.match(groundedJob.receipts![0].request!.prompt, /Sad after a modest setback/);
    assert.match(groundedJob.receipts![0].request!.prompt, /User pose constraint: Keep arms relaxed/);
    assert.match(groundedJob.receipts![0].request!.prompt, /No wings on her back/);
    assert.match(groundedJob.receipts![0].request!.prompt, /original avatar controls the visible outfit/);
    assert.match(
      groundedJob.receipts![0].request!.prompt,
      /cannot override the original outfit or explicit written anatomy/,
    );
    assert.doesNotMatch(groundedJob.receipts![0].request!.prompt, /fitting expressive body gesture/);
    assert.equal(groundedJob.phase, "review");

    // A durably saved answer can be parsed again after a metadata write fails.
    const replayPlan = await planSpriteStudio("mara", groundedInput);
    const replayId = randomUUID(),
      beforeReplayCalls = preparationCalls;
    failPreparationReadyWrite = true;
    preparedDirection = "A controlled, thoughtful stance. ".padEnd(516, "x");
    await startSpriteStudioJob("mara", { ...groundedInput, plan: replayPlan, submissionId: replayId });
    const replayInterrupted = (await settle()).jobs.find((job) => job.id === replayId)!;
    assert.equal(replayInterrupted.preparation!.attempts.at(-1)!.status, "answered");
    failPreparationReadyWrite = false;
    preparedDirection = "";
    generationRelease = undefined;
    await recoverStudioJob("mara", { id: replayId, retryGeneration: true });
    await waitForCall();
    generationRelease!();
    generationRelease = undefined;
    await settle();
    assert.equal(preparationCalls, beforeReplayCalls + 1, "saved answer recovery makes no new System call");
    const recoveredDirections = (await readSpriteStudio("mara")).jobs.find((job) => job.id === replayId)!.preparation!
      .expressions!;
    assert.equal(
      recoveredDirections[0]!.direction!.length,
      516,
      "saved over-500-character preparation is reused intact",
    );

    // Empty output is invalid and must not trigger completeWithRoom's usual empty retry.
    invalidPreparation = true;
    const invalidId = randomUUID(),
      beforeInvalidCalls = preparationCalls,
      beforeInvalidImages = calls;
    const invalidPlan = await planSpriteStudio("mara", groundedInput);
    await startSpriteStudioJob("mara", { ...groundedInput, plan: invalidPlan, submissionId: invalidId });
    const invalidJob = (await settle()).jobs.find((job) => job.id === invalidId)!;
    assert.equal(invalidJob.preparation!.status, "failed");
    assert.equal(preparationCalls, beforeInvalidCalls + 1);
    assert.equal(calls, beforeInvalidImages);
    invalidPreparation = false;
    generationRelease = undefined;
    await recoverStudioJob("mara", { id: invalidId, retryGeneration: true });
    await waitForCall();
    generationRelease!();
    generationRelease = undefined;
    await settle();

    // Retry an uncertain image using the same frozen, completed directions.
    const retryImagePlan = await planSpriteStudio("mara", groundedInput);
    const retryImageId = randomUUID(),
      beforeImagePreparation = preparationCalls;
    failGeneration = true;
    generationRelease = undefined;
    await startSpriteStudioJob("mara", { ...groundedInput, plan: retryImagePlan, submissionId: retryImageId });
    await waitForCall();
    generationRelease!();
    generationRelease = undefined;
    const imageInterrupted = (await settle()).jobs.find((job) => job.id === retryImageId)!;
    assert.equal(imageInterrupted.preparation!.status, "ready");
    assert.ok(imageInterrupted.pendingAssetId);
    failGeneration = false;
    await recoverStudioJob("mara", { id: retryImageId, retryGeneration: true });
    await waitForCall();
    generationRelease!();
    generationRelease = undefined;
    const imageRetried = (await settle()).jobs.find((job) => job.id === retryImageId)!;
    assert.equal(preparationCalls, beforeImagePreparation + 1);
    assert.equal(imageRetried.imageAttempts![0].status, "unknown");
    assert.equal(imageRetried.imageAttempts![1].status, "saved");
    assert.deepEqual(imageRetried.preparation, imageInterrupted.preparation);
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
