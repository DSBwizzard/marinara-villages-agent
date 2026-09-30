import assert from "node:assert/strict";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve, join } from "node:path";
import { chromium, webkit, expect } from "@playwright/test";
const engineRoot = process.env.MARINARA_ENGINE_ROOT;
if (!engineRoot) throw new Error("Set MARINARA_ENGINE_ROOT to the isolated Engine checkout.");
const require = createRequire(join(engineRoot, "package.json"));
const { build } = require("esbuild");
const output = resolve(".build-tmp/sprite-studio-browser");
await mkdir(output, { recursive: true });
await build({
  stdin: {
    contents: `import React from "react"; import {createRoot} from "react-dom/client"; import {SpriteStudio,clearStudioMatte,renderStudioCell} from "${resolve("packages/villages/src/engine/packages/client/src/villages-sprite-studio.tsx").replaceAll("\\", "/")}"; import {SPRITE_STYLES,defaultStudioState} from "${resolve("packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-model.ts").replaceAll("\\", "/")}";
  window.styleExamples=SPRITE_STYLES; window.defaultStudio=defaultStudioState; window.renderCell=renderStudioCell; window.clearMatte=clearStudioMatte;
  const root=createRoot(document.getElementById("root"));
  let villager={characterId:"mara",name:"Mara",sprite:null};
  const request=async(path,init)=>{const r=await fetch("/api"+path,init);const data=await r.json();if(!r.ok)throw Error(data.error);return data;};
  const open=()=>root.render(<SpriteStudio villager={villager} request={request} onSaved={next=>{villager=next;open();}} onBack={()=>root.render(<button onClick={open}>Mara · Sprite Studio</button>)} onExport={async()=>{window.exported=true}}/>);
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
  const cellsOf = (job) => job.sheets.flatMap((sheet) => sheet.cells);
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
  await page.route("**/*", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/")
      return route.fulfill({
        contentType: "text/html",
        body: '<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#0c1427;padding:16px;font-family:Arial}</style></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>',
      });
    if (path === "/fixture.js") return route.fulfill({ contentType: "application/javascript", body: bundle });
    if (!path.includes("/studio")) return route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
    const action = path.split("/studio")[1],
      body = route.request().postDataJSON() ?? {};
    if (!state)
      state = {
        ...(await page.evaluate(() => window.defaultStudio())),
        assignments: [],
        connections: [{ id: "mock", name: "Mock images", model: "fixture" }],
        reference: { url: source, capturedAt: new Date().toISOString(), origin: "snapshot" },
      };
    let result = state;
    if (action === "/settings") state.settings = body;
    if (action === "/plan") {
      previewed++;
      result = {
        protocol: 2,
        connection: { id: "mock", name: "Mock images", model: "fixture", source: "openai" },
        batches: [],
        estimatedCost: null,
        localWorkflow: false,
      };
      for (let offset = 0; offset < body.expressions.length;) {
        const count = Math.min(body.individual ? 1 : 6, body.expressions.length - offset);
        const [cols, rows] = count === 1 ? [1, 1] : count === 2 ? [2, 1] : count < 5 ? [2, 2] : [3, 2];
        result.batches.push({ count, cols, rows, width: 1536, height: 1536 });
        offset += count;
      }
    }
    if (action === "/jobs" && !state.jobs.some((job) => job.id === body.submissionId)) {
      generated++;
      state.settings = body.settings;
      const job = {
        id: body.submissionId,
        model: "fixture",
        style: body.settings.style,
        createdAt: new Date().toISOString(),
        status: "ready",
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
      state.jobs.push(job);
    }
    if (action === "/repair-background") {
      const job = state.jobs.find((item) => item.id === body.batchId);
      const repairedCells = [];
      for (const sheet of job.sheets)
        for (const cell of [...sheet.cells]) {
          if (cell.repairedFrom && cell.cleanupVersion === 3) continue;
          const originalId = cell.repairedFrom ?? cell.id;
          let repaired = sheet.cells.find((item) => item.repairedFrom === originalId && item.cleanupVersion === 3);
          if (!repaired) {
            repaired = {
              ...cell,
              id: "repair-" + seq++,
              repairedFrom: originalId,
              cleanupVersion: 3,
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
    await expect(page.getByRole("heading", { name: "Mara’s Sprite Studio" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Generate", exact: true })).toBeEnabled();
    await expect(page.getByText("6 expressions · 1 image request · Cost unavailable")).toBeVisible();
    assert.equal(await page.getByRole("button", { name: "Review generation plan" }).count(), 0);
    await page.getByLabel("Art style", { exact: true }).selectOption("BATTLEHIGHWAY");
    await page.getByText("Style prompt", { exact: true }).click();
    await expect(page.getByLabel("Drawing instructions")).toContainText("Sonic Battle");
    await page.getByLabel("Art style", { exact: true }).selectOption("PAPERCRAFT");
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Saved artwork", exact: true })).toBeVisible();
    assert.equal(generated, 1);
    assert.ok(previewed >= 2, "plan refreshes automatically");
    await expect(page.locator(".vss-card")).toHaveCount(6);
    await page.getByText("Original sheet 1", { exact: true }).click();
    await expect(page.getByRole("img", { name: "Original sheet 1", exact: true })).toBeVisible();
    // Keyboard pick + slot assignment works at both viewport sizes.
    if (profile.name !== "desktop") await page.getByRole("button", { name: "Show expressions", exact: true }).click();
    await page.getByRole("button", { name: "Select front happy cutout", exact: true }).focus();
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: "Assign selected cutout to happy", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Assigned. These images are now used in scenes.", { exact: true })).toBeVisible();
    await expect(page.locator(".vss-badge")).toHaveCount(1);
    if (profile.name === "desktop") {
      await page
        .getByRole("button", { name: "Select front angry cutout", exact: true })
        .dragTo(
          page
            .locator(".vss-slot")
            .filter({ has: page.getByRole("button", { name: "Assign selected cutout to angry", exact: true }) }),
        );
      await expect(page.locator(".vss-badge")).toHaveCount(2);
    }
    await page.getByRole("button", { name: "Use this batch", exact: true }).click();
    await expect(page.locator(".vss-badge")).toHaveCount(6);
    await page.getByRole("button", { name: "Create", exact: true }).click();
    await page.getByLabel("Art style", { exact: true }).selectOption("BATTLEHIGHWAY");
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    await expect(page.locator(".vss-gallery article")).toHaveCount(2);
    await page.getByRole("button", { name: "Clear pending review", exact: true }).click();
    await page
      .locator(".vss-gallery article")
      .first()
      .getByRole("button", { name: "Use this batch", exact: true })
      .click();
    await expect(page.locator(".vss-gallery article").first().locator(".vss-badge")).toHaveCount(6);
    await page
      .locator(".vss-gallery article")
      .last()
      .getByRole("button", { name: "Use this batch", exact: true })
      .click();
    await expect(page.locator(".vss-gallery article").last().locator(".vss-badge")).toHaveCount(6);
    assert.equal(generated, 2, "batch swapping never generates");
    await expect(page.locator(".vss-card")).toHaveCount(12);
    await page.getByLabel("New expression", { exact: true }).fill("Delighted");
    await page.getByRole("button", { name: "Add expression", exact: true }).click();
    await page
      .locator(".vss-gallery article")
      .first()
      .getByRole("button", { name: "Select front happy cutout", exact: true })
      .click();
    await page.getByLabel("Assign selected cutout to", { exact: true }).selectOption("e-delighted");
    await page.getByRole("button", { name: "Assign", exact: true }).click();
    await expect(page.getByText("In use · Delighted", { exact: true })).toBeVisible();
    await page
      .locator(".vss-slot")
      .filter({ has: page.getByRole("button", { name: "Assign selected cutout to Delighted", exact: true }) })
      .getByRole("button", { name: "Use as default scene image", exact: true })
      .click();
    await expect(page.getByText("Delighted · Default", { exact: true })).toBeVisible();
    await page.screenshot({ path: join(output, profile.name + "-gallery.png"), fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.equal(overflow, false, "no horizontal overflow");
    await page
      .locator(".vss-gallery article")
      .last()
      .getByRole("button", { name: "Adjust image", exact: true })
      .first()
      .click();
    await expect(page.getByRole("heading", { name: "Adjust image · saves another cutout", exact: true })).toBeVisible();
    await page.getByLabel("Foot offset", { exact: true }).fill("-10");
    await page.getByRole("button", { name: "Save adjusted cutout", exact: true }).click();
    await expect(page.locator(".vss-card")).toHaveCount(13);
    await page.getByRole("button", { name: "In use", exact: true }).click();
    await page.getByRole("button", { name: "Remove from scenes", exact: true }).last().click();
    await page.getByRole("button", { name: /^Review/ }).click();
    // Delete the inactive second batch after removing its only assignment.
    const inactive = page.locator(".vss-gallery article").first();
    page.on("dialog", (dialog) => void dialog.accept());
    await inactive.getByRole("button", { name: "Delete batch", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".vss-gallery article")).toHaveCount(2);
    await inactive.getByRole("button", { name: "Delete batch", exact: true }).click();
    await page.getByLabel("Also delete unused files from disk", { exact: true }).check();
    await page.getByRole("button", { name: "Delete artwork", exact: true }).click();
    await expect(page.locator(".vss-gallery article")).toHaveCount(1);
    await page.getByRole("button", { name: "Delete unused files", exact: true }).click();
    await expect(page.getByText("0 unused files deleted.", { exact: true })).toBeVisible();
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
    const originalAssignments = structuredClone(state.assignments);
    await page.getByRole("button", { name: "Repair backgrounds", exact: true }).click();
    await expect(
      page.getByText("Backgrounds repaired. Original artwork retained; active sprites updated.", { exact: true }),
    ).toBeVisible();
    assert.equal(generated, 2, "batch repair makes no generation requests");
    for (const prior of originalAssignments) {
      const current = state.assignments.find(
        (entry) => entry.expressionId === prior.expressionId && entry.view === prior.view,
      );
      assert.notEqual(current.cellId, prior.cellId, "active image switches to the repaired cutout");
      assert.ok(
        allCells().some((cell) => cell.id === prior.cellId),
        "original retained",
      );
    }
    const repairedCount = allCells().length;
    await page.getByRole("button", { name: "Repair backgrounds", exact: true }).click();
    await expect(
      page.getByText("Backgrounds repaired. Original artwork retained; active sprites updated.", { exact: true }),
    ).toBeVisible();
    assert.equal(allCells().length, repairedCount, "repeated repair reuses candidates");
    await page.screenshot({ path: join(output, profile.name + "-repaired.png"), fullPage: true });
    await page.getByRole("button", { name: "← Back to Villagers" }).click();
    await page.getByRole("button", { name: "Mara · Sprite Studio" }).click();
    await expect(page.locator(".vss-gallery article")).toHaveCount(1);
    assert.deepEqual(errors, []);
    console.log(
      profile.name +
        ": automatic plans, gallery, keyboard assignment, " +
        (profile.name === "desktop" ? "dragging, " : "") +
        "cached batch swaps, defaults, adjustments, cleanup and responsive layout passed",
    );
  } finally {
    await browser.close();
  }
}
