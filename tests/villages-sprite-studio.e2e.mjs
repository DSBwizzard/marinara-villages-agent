import assert from "node:assert/strict";
import { PNG } from "pngjs";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve, join } from "node:path";
import { chromium, webkit, expect as baseExpect } from "@playwright/test";
const expect = baseExpect.configure({ timeout: 30000 });
const engineRoot = process.env.MARINARA_ENGINE_ROOT;
if (!engineRoot) throw new Error("Set MARINARA_ENGINE_ROOT to the isolated Engine checkout.");
const require = createRequire(join(engineRoot, "package.json"));
const { build } = require("esbuild");
const output = resolve(".build-tmp/sprite-studio-browser");
await mkdir(output, { recursive: true });
await build({
  stdin: {
    contents: `import React from "react"; import {createRoot} from "react-dom/client"; import {SpriteStudio,clearStudioMatte,renderStudioCell,studioRenderKey} from "${resolve("packages/villages/src/engine/packages/client/src/villages-sprite-studio.tsx").replaceAll("\\", "/")}"; import {SPRITE_STYLES,STUDIO_NEGATIVE_PROMPT,studioPrompt,defaultStudioState} from "${resolve("packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-model.ts").replaceAll("\\", "/")}";
import {createStudioRenderCache} from "${resolve("packages/villages/src/engine/packages/client/src/villages-sprite-render-cache.ts").replaceAll("\\", "/")}";
  window.makeRenderCache=createStudioRenderCache; window.renderKey=studioRenderKey; window.styleExamples=SPRITE_STYLES; window.studioPrompt=studioPrompt; window.studioNegativePrompt=STUDIO_NEGATIVE_PROMPT; window.defaultStudio=defaultStudioState; window.renderCell=renderStudioCell; window.clearMatte=clearStudioMatte;
  const root=createRoot(document.getElementById("root"));
  let villager={characterId:"mara",name:"Mara",sprite:null};
  const request=async(path,init)=>{const r=await fetch("/api"+path,init);const data=await r.json();if(!r.ok)throw Error(data.error);return data;};
  const open=()=>root.render(<React.StrictMode><SpriteStudio villager={villager} request={request} onSaved={next=>{villager=next;open();}} onBack={()=>root.render(<button onClick={open}>Mara · Sprite Studio</button>)} onExport={async()=>{window.exported=true}}/></React.StrictMode>);
  window.openStudio=open;open();`,
    loader: "tsx",
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: true,
  outfile: join(output, "fixture.js"),
  format: "iife",
  platform: "browser",
  jsx: "automatic",
  nodePaths: [join(engineRoot, "packages/client/node_modules"), join(engineRoot, "node_modules")],
});
await build({
  entryPoints: [resolve("packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-pixels.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: join(output, "pixels.cjs"),
});
const { processStudioCell } = createRequire(import.meta.url)(join(output, "pixels.cjs"));
const bundle = await readFile(join(output, "fixture.js"), "utf8");
const browserProfiles = [
  { name: "desktop", type: chromium, viewport: { width: 1280, height: 900 } },
  { name: "phone", type: chromium, viewport: { width: 390, height: 844 } },
];
if (process.env.STUDIO_WEBKIT === "1")
  browserProfiles.push({ name: "webkit", type: webkit, viewport: { width: 390, height: 844 } });
for (const profile of browserProfiles) {
  const browser = await profile.type.launch({
    headless: true,
    ...(profile.type === chromium && process.platform === "win32"
      ? { executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" }
      : {}),
  });
  const page = await browser.newPage({ viewport: profile.viewport }),
    errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const source = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1536;
    canvas.height = 1536;
    const c = canvas.getContext("2d");
    c.fillStyle = "#ff00ff";
    c.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 6; i++) {
      const x = (i % 3) * 512,
        y = Math.floor(i / 3) * 768;
      c.clearRect(x, y, 512, 768);
      if (i % 2) {
        c.fillStyle = "#141414";
        c.fillRect(x, y, 512, 768);
      }
      c.fillStyle = "#ff00ff";
      c.fillRect(x + 3, y + 3, 506, 762);
      c.fillStyle = "#f4ecd6";
      c.fillRect(x + 146, y + 110, 220, 540 + i * 8);
      c.fillStyle = i % 2 ? "#5278bb" : "#7a54ba";
      c.fillRect(x + 156, y + 120, 200, 520 + i * 8);
    }
    return canvas.toDataURL();
  });
  let state,
    generated = 0,
    previewed = 0,
    seq = 0;
  let planRevision = "first";
  const submittedPlans = [];
  const nativeLibrary = [];
  const cellsOf = (job) => job.sheets.flatMap((sheet) => sheet.cells);
  let textRequests = 0;
  const allCells = () => state.jobs.flatMap(cellsOf);
  const snapshot = () => ({
    characterId: "mara",
    name: "Mara",
    sprite: state.assignments.length
      ? {
          images: state.assignments.map((entry) => ({
            view: entry.view,
            expressionId: entry.expressionId,
            label: state.expressions.find((slot) => slot.id === entry.expressionId).label,
            isDefault: entry.expressionId === state.defaultExpressionId,
            url: allCells().find((cell) => cell.id === entry.cellId).rendered.url,
          })),
          framing: { mode: "full", cropPercent: 58 },
        }
      : null,
  });
  let failPlan = false,
    releasePlan;
  const initialPlan = new Promise((resolve) => {
    releasePlan = resolve;
  });
  await page.route("**/*", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/")
      return route.fulfill({
        contentType: "text/html",
        body: '<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#0c1427;padding:16px;font-family:Arial}</style></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>',
      });
    if (path === "/fixture.js") return route.fulfill({ contentType: "application/javascript", body: bundle });
    if (path === "/api/usage/preview")
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          requests: JSON.parse(route.request().postData() ?? "{}").count ?? 0,
          residents: [],
          dollars: null,
          unknownCosts: 0,
          note: "Fixture estimate",
        }),
      });
    if (!path.includes("/studio")) return route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
    const action = path.split("/studio")[1],
      body = route.request().postDataJSON() ?? {};
    if (!state)
      state = {
        ...(await page.evaluate(() => window.defaultStudio())),
        assignments: [],
        connections: [{ id: "mock", name: "Mock images", model: "fixture" }],
        reference: null,
      };
    let result = state;
    if (action === "/character-library") result = { available: true, items: nativeLibrary, error: "" };
    if (action === "/publish-plan" || action === "/restore-plan") {
      result = {
        id: "publication-" + seq++,
        token: "reviewed",
        createdAt: new Date().toISOString(),
        items: body.items.map((item) => {
          const cell = allCells().find((cell) => cell.id === item.cellId);
          return {
            ...item,
            label: cell.label,
            view: cell.view,
            sourceUrl: cell.rendered.url,
            sourceHash: "fixture",
            expected: [],
            backups: [],
            status: "pending",
          };
        }),
      };
      (state.publications ??= []).push(result);
    }
    if (action === "/publish") {
      const publication = state.publications.find((entry) => entry.id === body.id);
      for (const item of publication.items) {
        item.status = "saved";
        nativeLibrary.push({
          filename: item.name + ".png",
          expression: item.name,
          url: item.sourceUrl,
          sha256: "fixture",
          label: item.label,
          view: item.view,
        });
      }
      result = state;
    }
    if (action === "/adopt-character") {
      const cells = body.items.map((item) => {
        const original = allCells().find(
          (cell) => cell.rendered?.url === nativeLibrary.find((row) => row.filename === item.filename).url,
        );
        return {
          ...structuredClone(original),
          id: "adopted-" + seq++,
          label: item.label,
          view: item.view,
          status: "approved",
        };
      });
      state.jobs.push({
        id: "adoption-" + seq++,
        style: "Imported",
        model: "Imported",
        status: "ready",
        createdAt: new Date().toISOString(),
        sheets: [{ ...state.jobs[0].sheets[0], cells }],
      });
      for (const cell of cells) {
        state.assignments = state.assignments.filter(
          (entry) => entry.expressionId !== cell.expressionId || entry.view !== cell.view,
        );
        state.assignments.push({ cellId: cell.id, expressionId: cell.expressionId, view: cell.view });
      }
      result = { studio: state, snapshot: snapshot() };
    }
    if (action === "/settings") state.settings = body;
    if (action === "/plan") {
      previewed++;
      await initialPlan;
      if (failPlan)
        return route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "Engine connection unavailable; saved artwork remains usable." }),
        });
      result = {
        protocol: 7,
        preparationRequests: 0,
        look: {
          fingerprint: "look",
          needed: !state.looks?.length,
          cellId: state.looks?.[0]?.cellId,
          url: allCells().find((cell) => cell.id === state.looks?.[0]?.cellId)?.rendered?.url,
        },
        directions: body.expressions.map((entry) => ({
          key: entry.label,
          label: entry.label,
          text: "",
          revision: 0,
          ...(state.directions ?? []).find((row) => row.label === entry.label),
        })),
        connection: { id: "mock", name: "Mock images", model: "fixture", source: "openai" },
        batches: [],
        estimatedCost: null,
        localWorkflow: false,
      };
      for (let offset = 0; offset < body.expressions.length;) {
        const count = Math.min(body.individual ? 1 : 6, body.expressions.length - offset);
        const [cols, rows] = count === 1 ? [1, 1] : count === 2 ? [2, 1] : count < 5 ? [2, 2] : [3, 2];
        const batch = { count, cols, rows, width: 1536, height: 1536 };
        batch.request = await page.evaluate(
          ({ batch, body, offset, planRevision }) => {
            const prompt = window.studioPrompt({
              name: "Mara",
              appearance: "Test character " + planRevision,
              style: body.settings.prompts[body.settings.style],
              view: body.view,
              facingPrompt: body.settings.facingPrompts?.[body.settings.style]?.[body.view],
              expressions: body.expressions.slice(offset, offset + batch.count),
              batch,
              matteHex: "#FF00FF",
            });
            return {
              pipelineVersion: 7,
              matteHex: "#FF00FF",
              draftPrompt: prompt,
              prompt,
              negativePrompt: window.studioNegativePrompt,
              fingerprint: "fixture",
            };
          },
          { batch, body, offset, planRevision },
        );
        result.batches.push(batch);
        offset += count;
      }
    }
    if (action === "/accept-look") {
      state.looks = [{ cellId: body.cellId, fingerprint: "look", view: "side" }];
    }
    if (action === "/directions") {
      state.directions ??= [];
      if (body.operation === "prepare" || body.operation === "suggest") textRequests++;
      for (const entry of body.expressions) {
        let row = state.directions.find((row) => row.label === entry.label);
        if (!row) {
          row = { key: entry.label, label: entry.label, text: "", revision: 0 };
          state.directions.push(row);
        }
        if (body.operation === "prepare") {
          row.text = "A characterful gesture, head and attention remaining right.";
          row.revision++;
        }
        if (body.operation === "suggest")
          row.suggestion = {
            text: "She smooths her sleeve with a sheepish smile, looking right.",
            revision: row.revision,
            requestId: body.actionId,
          };
        if (body.operation === "save") {
          row.text = body.text;
          row.revision++;
          delete row.suggestion;
        }
        if (body.operation === "use") {
          row.text = row.suggestion.text;
          row.revision++;
          delete row.suggestion;
        }
        if (body.operation === "discard") delete row.suggestion;
      }
    }
    if (action === "/jobs" && !state.jobs.some((job) => job.id === body.submissionId)) {
      generated++;
      submittedPlans.push(body.plan);
      state.settings = body.settings;
      const job = {
        id: body.submissionId,
        lookFingerprint: "look",
        model: "fixture",
        style: body.settings.style,
        frozenSettings: structuredClone(body.settings),
        stylePrompt: body.settings.prompts[body.settings.style],
        createdAt: new Date().toISOString(),
        status: "ready",
        phase: "review",
        preparation: {
          status: "ready",
          attempts: [{ status: "answered", model: "fixture-system" }],
          interpretation: "Warm and grounded.",
          expressions: body.expressions.map((entry) => ({
            ...entry,
            direction: "A natural, character-specific stance.",
          })),
        },
        error: "",
        planned: body.plan.batches.length,
        attempted: body.plan.batches.length,
        view: body.view,
        sheets: [],
      };
      let offset = 0;
      for (const batch of body.plan.batches) {
        const expressions = body.expressions.slice(offset, offset + batch.count);
        offset += batch.count;
        job.sheets.push({
          assetId: "asset-" + seq++,
          url: source,
          width: 1536,
          height: 1536,
          attempts: 1,
          usage: null,
          baseScale: Math.min(512 / (1536 / batch.cols), 768 / (1536 / batch.rows)),
          cells: expressions.map((entry, i) => ({
            ...entry,
            id: "cell-" + seq++,
            view: body.view,
            x: ((i % batch.cols) * 1536) / batch.cols,
            y: (Math.floor(i / batch.cols) * 1536) / batch.rows,
            width: 1536 / batch.cols,
            height: 1536 / batch.rows,
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            cleanup: true,
            status: "candidate",
            pending: true,
          })),
        });
      }
      for (const sheet of job.sheets)
        for (const cell of sheet.cells) {
          const decoded = PNG.sync.read(Buffer.from(source.split(",")[1], "base64"));
          const processed = processStudioCell(
            { width: decoded.width, height: decoded.height, data: new Uint8ClampedArray(decoded.data) },
            sheet,
            cell,
          );
          cell.rendered = {
            url:
              "data:image/png;base64," +
              PNG.sync.write({ width: 512, height: 768, data: Buffer.from(processed.image.data) }).toString("base64"),
            assetId: sheet.assetId,
            filename: cell.id + ".png",
          };
        }
      state.jobs.push(job);
    }
    if (action === "/repair-background") {
      const job = state.jobs.find((item) => item.id === body.batchId);
      const repairedCells = [];
      for (const sheet of job.sheets)
        for (const cell of [...sheet.cells]) {
          if (cell.repairedFrom && cell.cleanupVersion === 5) continue;
          const originalId = cell.repairedFrom ?? cell.id;
          let repaired = sheet.cells.find((item) => item.repairedFrom === originalId && item.cleanupVersion === 5);
          if (!repaired) {
            repaired = {
              ...cell,
              id: "repair-" + seq++,
              repairedFrom: originalId,
              cleanupVersion: 5,
              cleanup: true,
              pending: true,
              rendered: undefined,
            };
            sheet.cells.push(repaired);
          }
          repairedCells.push({ originalId: cell.id, cellId: repaired.id });
        }
      result = { ...state, repairedCells };
    }
    if (action === "/assign") {
      for (const entry of body.cells) {
        const cell = allCells().find((cell) => cell.id === entry.id),
          job = state.jobs.find((job) => cellsOf(job).includes(cell));
        if (!cell.rendered)
          cell.rendered = { url: entry.image, filename: cell.id + ".png", assetId: "asset", fingerprint: "fixture" };
        cell.pending = false;
        state.assignments = state.assignments.filter(
          (item) => item.expressionId !== entry.expressionId || item.view !== cell.view,
        );
        state.assignments.push({ expressionId: entry.expressionId, cellId: cell.id, view: cell.view });
        job.assignments = [
          ...(job.assignments ?? []).filter(
            (item) => item.expressionId !== entry.expressionId || item.view !== cell.view,
          ),
          { expressionId: entry.expressionId, cellId: cell.id, view: cell.view },
        ];
      }
      state.defaultExpressionId ??=
        state.assignments.find((entry) => entry.expressionId === "e-neutral")?.expressionId ??
        state.assignments[0]?.expressionId;
      result = { studio: state, snapshot: snapshot() };
    }
    if (action === "/clear-review") for (const cell of allCells()) cell.pending = false;
    if (action === "/expression") {
      if (body.defaultId) state.defaultExpressionId = body.defaultId;
      else if (body.removeId) state.expressions = state.expressions.filter((slot) => slot.id !== body.removeId);
      else {
        const prior = state.expressions.find((slot) => slot.id === body.id);
        const label = (body.name || body.label).toLowerCase().replace(/\s+/g, "_");
        const next = {
          id: prior?.id ?? "e-" + label,
          label,
          name: body.name,
          pose: body.pose ?? "",
          useWhen: body.useWhen ?? body.pose ?? "",
          aliases: [label],
        };
        if (prior) Object.assign(prior, next);
        else state.expressions.push(next);
      }
      result = { studio: state, snapshot: snapshot() };
    }
    if (action === "/remove") {
      const slot = state.expressions.find((slot) => slot.label === body.label);
      state.assignments = state.assignments.filter((item) => item.expressionId !== slot.id || item.view !== body.view);
      result = { studio: state, snapshot: snapshot() };
    }
    if (action === "/delete") {
      const ids = body.batchId
        ? cellsOf(state.jobs.find((job) => job.id === body.batchId)).map((cell) => cell.id)
        : body.ids;
      if (state.assignments.some((entry) => ids.includes(entry.cellId)))
        return route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ error: "This artwork is in use." }),
        });
      for (const job of state.jobs)
        for (const sheet of job.sheets) sheet.cells = sheet.cells.filter((cell) => !ids.includes(cell.id));
      state.jobs = state.jobs.filter((job) => cellsOf(job).length);
      result = { studio: state, deleted: body.deleteFiles ? ids.length : 0, failures: [] };
    }
    if (action === "/delete-unused") result = { studio: state, deleted: 0, failures: [] };
    if (action === "/cell") {
      const sheet = state.jobs
        .flatMap((job) => job.sheets)
        .find((sheet) => sheet.cells.some((cell) => cell.id === body.id));
      sheet.cells.push({ ...body.cell, id: "adjusted-" + seq++, rendered: undefined, pending: true });
    }
    if (action === "/import")
      state.jobs.push({
        id: "import-" + seq++,
        style: "Imported",
        model: "Imported",
        createdAt: new Date().toISOString(),
        planned: 0,
        attempted: 0,
        status: "ready",
        sheets: [
          {
            assetId: "imported",
            url: body.image,
            width: 1536,
            height: 1536,
            attempts: 0,
            usage: null,
            cells: body.cells.map((cell) => ({
              ...cell,
              label: cell.label ?? cell.expression,
              id: "import-cell-" + seq++,
              expressionId: "e-" + (cell.label ?? cell.expression),
              pose: "",
              scale: 1,
              offsetX: 0,
              offsetY: 0,
              pending: true,
              status: "candidate",
            })),
          },
        ],
      });
    return route.fulfill({ contentType: "application/json", body: JSON.stringify(result) });
  });
  try {
    await page.goto("http://studio.test/");
    await expect(page.getByRole("heading", { name: "Choose look", exact: true })).toBeVisible();
    await expect.poll(() => previewed).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: "Generate neutral", exact: true })).toBeDisabled();
    releasePlan();
    await expect(page.getByRole("button", { name: "Generate neutral", exact: true })).toBeEnabled();
    await page.screenshot({ path: join(output, profile.name + "-step1-empty.png"), fullPage: true });
    await page.getByRole("button", { name: "Generate neutral", exact: true }).click();
    await expect(page.getByRole("button", { name: "Use this look →", exact: true })).toBeVisible();
    await page.screenshot({ path: join(output, profile.name + "-step1.png"), fullPage: true });
    assert.equal(generated, 1);
    await page.getByRole("button", { name: "Use this look →", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Create expressions", exact: true })).toBeVisible();
    await expect(page.getByLabel("happy pose directions")).not.toHaveValue("");
    assert.equal(generated, 1, "acceptance and automatic directions make no image requests");
    assert.equal(state.assignments.length, 0, "acceptance leaves assignments alone");
    const beforeAdd = textRequests;
    await page.getByRole("button", { name: "+ Add expression", exact: true }).click();
    await page.getByLabel("New expression name").fill("Embarrassed");
    await page
      .getByRole("form", { name: "New expression" })
      .getByRole("button", { name: "Add expression", exact: true })
      .click();
    await expect(page.getByLabel("embarrassed pose directions")).not.toHaveValue("");
    assert.equal(textRequests, beforeAdd + 1);
    const embarrassed = page.locator(".vss-direction").filter({ has: page.getByLabel("embarrassed pose directions") });
    await embarrassed.getByRole("textbox").fill("My authored gesture, still looking right.");
    await embarrassed.getByRole("button", { name: "Save directions", exact: true }).click();
    await expect(embarrassed.getByRole("textbox")).toHaveValue("My authored gesture, still looking right.");
    await embarrassed.getByRole("button", { name: "Suggest another pose · 1 text request", exact: true }).click();
    await expect(embarrassed.getByRole("button", { name: "Keep current", exact: true })).toBeVisible();
    await embarrassed.getByRole("button", { name: "Keep current", exact: true }).click();
    await expect(embarrassed.getByRole("textbox")).toHaveValue("My authored gesture, still looking right.");
    await expect(page.getByRole("button", { name: "Generate 4 expressions", exact: true })).toBeEnabled();
    await page.screenshot({ path: join(output, profile.name + "-step2.png"), fullPage: true });
    await expect(page.getByRole("button", { name: "Generate 4 expressions", exact: true })).toBeEnabled();
    await page.getByRole("button", { name: "Generate 4 expressions", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Use in Scenes", exact: true })).toBeVisible({ timeout: 30000 });
    await expect(page.locator(".vss-card")).toHaveCount(5);
    await page.getByRole("checkbox", { name: "Select happy for Scenes", exact: true }).check();
    await page.getByRole("checkbox", { name: "Select angry for Scenes", exact: true }).check();
    await page.getByRole("button", { name: "Use selected in Scenes", exact: true }).click();
    await expect(page.getByText("Assigned. These images are now used in scenes.", { exact: true })).toBeVisible();
    assert.equal(state.assignments.length, 2);
    await page.screenshot({ path: join(output, profile.name + "-step3.png"), fullPage: true });
    const beforeRegenerate = generated;
    await page
      .locator(".vss-card")
      .filter({ has: page.getByRole("checkbox", { name: "Select embarrassed for Scenes", exact: true }) })
      .getByRole("button", { name: "Regenerate", exact: true })
      .click();
    await expect(page.getByRole("button", { name: "Generate 1 expressions", exact: true })).toBeEnabled();
    assert.equal(generated, beforeRegenerate, "regenerate prepares only one expression before explicit generation");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    const pixelProof = await page.evaluate(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 4;
      canvas.height = 4;
      const c = canvas.getContext("2d");
      c.fillStyle = "#ff00ff";
      c.fillRect(0, 0, 4, 4);
      c.fillStyle = "#f4ecd6";
      c.fillRect(1, 1, 2, 2);
      window.clearMatte(c, 4, 4);
      return [c.getImageData(0, 0, 1, 1).data[3], c.getImageData(1, 1, 1, 1).data[3]];
    });
    assert.deepEqual(pixelProof, [0, 255], "cleanup preserves intentional outlines");
    const alignment = await page.evaluate(async (source) => {
      const sheet = { url: source, width: 1536, height: 1536, baseScale: 1, cells: [] };
      const baseline = [];
      for (let i = 0; i < 2; i++) {
        const canvas = await window.renderCell(
          sheet,
          {
            id: "test",
            view: "front",
            label: "happy",
            pose: "",
            x: i * 512,
            y: 0,
            width: 512,
            height: 768,
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            cleanup: true,
            status: "candidate",
          },
          true,
        );
        const rgba = canvas.getContext("2d").getImageData(0, 0, 512, 768).data;
        let bottom = -1;
        for (let y = 0; y < 768; y++) for (let x = 0; x < 512; x++) if (rgba[(y * 512 + x) * 4 + 3] > 16) bottom = y;
        baseline.push(bottom);
      }
      return baseline;
    }, source);
    assert.deepEqual(alignment, [751, 751], "distinct cell margins share the same foot baseline");
    const parityCell = {
      id: "parity",
      label: "happy",
      view: "front",
      pose: "",
      x: 0,
      y: 0,
      width: 512,
      height: 768,
      scale: 0.8,
      offsetX: 7,
      offsetY: -11,
      status: "candidate",
      cleanup: true,
    };
    const paritySheet = { url: source, width: 1536, height: 1536, baseScale: 1, cells: [parityCell] };
    const sourcePixels = PNG.sync.read(Buffer.from(source.split(",")[1], "base64"));
    const exported = processStudioCell(
      { width: sourcePixels.width, height: sourcePixels.height, data: new Uint8ClampedArray(sourcePixels.data) },
      paritySheet,
      parityCell,
    ).image;
    const preview = await page.evaluate(
      async ({ sheet, cell }) => {
        const canvas = await window.renderCell(sheet, cell, true);
        return Array.from(canvas.getContext("2d").getImageData(0, 0, 512, 768).data);
      },
      { sheet: paritySheet, cell: parityCell },
    );
    assert.deepEqual(
      Buffer.from(preview),
      Buffer.from(exported.data),
      "browser preview and server export agree for scale, offsets, cleanup and safe framing",
    );

    const cacheProof = await page.evaluate(async (source) => {
      const cache = window.makeRenderCache();
      const sheet = {
        url: source,
        source: { kind: "generated-raw", sha256: "original" },
        width: 1536,
        height: 1536,
        baseScale: 1,
        cells: [],
      };
      const cell = {
        id: "cache",
        view: "front",
        label: "happy",
        pose: "",
        x: 0,
        y: 0,
        width: 512,
        height: 768,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        status: "candidate",
      };
      let reads = 0;
      const original = CanvasRenderingContext2D.prototype.getImageData;
      CanvasRenderingContext2D.prototype.getImageData = function (...args) {
        reads++;
        return original.apply(this, args);
      };
      try {
        const [a, b] = await Promise.all([
          window.renderCell(sheet, cell, true, cache),
          window.renderCell(sheet, { ...cell, pending: true, label: "other" }, true, cache),
        ]);
        const afterShared = reads;
        a.width = 1;
        const again = await window.renderCell(sheet, cell, true, cache);
        const afterReuse = reads;
        const key = window.renderKey(sheet, cell, true);
        const variants = [
          { ...cell, scale: 0.9 },
          { ...cell, offsetX: 1 },
          { ...cell, offsetY: 1 },
          { ...cell, x: 1, width: 511 },
          { ...cell, y: 1, height: 767 },
        ];
        const changed =
          variants.every((v) => window.renderKey(sheet, v, true) !== key) &&
          window.renderKey({ ...sheet, source: { ...sheet.source, sha256: "changed" } }, cell, true) !== key &&
          window.renderKey({ ...sheet, baseScale: 0.5 }, cell, true) !== key &&
          window.renderKey(sheet, cell, false) !== key;
        await window.renderCell(sheet, { ...cell, scale: 0.9 }, true, cache);
        const invalidated = reads > afterReuse;
        cache.dispose();
        let closed = false;
        try {
          await window.renderCell(sheet, cell, true, cache);
        } catch {
          closed = true;
        }
        return {
          afterShared,
          afterReuse,
          independent: a !== b && b.width === 512 && again.width === 512,
          changed,
          invalidated,
          closed,
        };
      } finally {
        CanvasRenderingContext2D.prototype.getImageData = original;
      }
    }, source);
    assert.equal(cacheProof.afterShared, 1, "two consumers share one crop/cleanup pass");
    assert.equal(cacheProof.afterReuse, 1, "completed derivatives are reused");
    assert.equal(cacheProof.independent, true, "resizing one consumer cannot corrupt another");
    assert.equal(cacheProof.changed, true, "drawing changes invalidate render keys");
    assert.equal(cacheProof.invalidated, true);
    assert.equal(cacheProof.closed, true);

    failPlan = true;
    await page.getByRole("button", { name: "1 · Choose look", exact: true }).click();
    await page.getByLabel("Facing", { exact: true }).selectOption("front");
    await expect(page.getByRole("alert")).toContainText("Engine connection unavailable");
    await expect(page.getByRole("button", { name: "Generate neutral", exact: true })).toBeDisabled();
    await page.screenshot({ path: join(output, profile.name + "-failure.png"), fullPage: true });
    await page.getByRole("button", { name: "3 · Use in Scenes", exact: true }).click();
    await expect(page.locator(".vss-card")).toHaveCount(5);
    assert.equal(state.assignments.length, 2, "generation failure preserves assigned artwork");
    assert.ok(previewed > 0 && submittedPlans.length === 2);
    assert.deepEqual(errors, []);
    console.log(
      profile.name +
        ": three-step workflow, automatic directions, preserved edits, selective assignment and responsive layout passed",
    );
  } finally {
    await browser.close();
  }
}
