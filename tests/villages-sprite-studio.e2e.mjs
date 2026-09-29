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
    contents: `import React from "react"; import {createRoot} from "react-dom/client"; import {SpriteStudio,clearStudioMatte} from "${resolve("packages/villages/src/engine/packages/client/src/villages-sprite-studio.tsx").replaceAll("\\", "/")}"; import {SPRITE_STYLES} from "${resolve("packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-model.ts").replaceAll("\\", "/")}";
  window.styleExamples=SPRITE_STYLES; window.clearMatte=clearStudioMatte;
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
const browsers = [
  { name: "desktop", type: chromium, viewport: { width: 1280, height: 900 } },
  { name: "phone", type: chromium, viewport: { width: 390, height: 844 } },
];
if (process.env.STUDIO_WEBKIT === "1")
  browsers.push({ name: "webkit", type: webkit, viewport: { width: 390, height: 844 } });
for (const profile of browsers) {
  const browser = await profile.type.launch({
    headless: true,
    ...(profile.type === chromium && process.platform === "win32"
      ? { executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" }
      : {}),
  });
  const page = await browser.newPage({ viewport: profile.viewport });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const source = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 768;
    const c = canvas.getContext("2d");
    c.fillStyle = "#ff00ff";
    c.fillRect(0, 0, 512, 768);
    c.fillStyle = "#f4ecd6";
    c.fillRect(146, 110, 220, 580);
    c.fillStyle = "#5179b2";
    c.fillRect(156, 120, 200, 560);
    return canvas.toDataURL();
  });
  let state,
    generated = 0;
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/")
      return route.fulfill({
        contentType: "text/html",
        body: '<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#0c1427;padding:16px;font-family:Arial}button{font:inherit}</style></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>',
      });
    if (url.pathname === "/fixture.js") return route.fulfill({ contentType: "application/javascript", body: bundle });
    if (!url.pathname.includes("/studio"))
      return route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
    const action = url.pathname.split("/studio")[1],
      body = route.request().postData() ? JSON.parse(route.request().postData()) : {};
    if (!state) {
      const presets = await page.evaluate(() => window.styleExamples);
      state = {
        version: 1,
        settings: { style: "PAPERCRAFT", prompts: presets, connectionId: "" },
        jobs: [],
        connections: [{ id: "mock", name: "Mock images", model: "fixture" }],
        reference: { url: source, capturedAt: new Date().toISOString(), origin: "snapshot" },
      };
    }
    let result = state;
    if (action === "/settings") state.settings = body;
    if (action === "/plan")
      result = {
        protocol: 1,
        connection: { id: "mock", name: "Mock images", model: "fixture", source: "openai" },
        batches: [{ width: 512, height: 768, cols: 1, rows: 1, count: 1 }],
        estimatedCost: null,
        localWorkflow: false,
      };
    if (action === "/jobs") {
      generated++;
      state.jobs.push({
        id: "job",
        model: "fixture",
        status: "ready",
        planned: 1,
        attempted: 1,
        sheets: [
          {
            assetId: "asset",
            url: source,
            width: 512,
            height: 768,
            baseScale: 1,
            attempts: 1,
            usage: null,
            cells: [
              {
                id: "cell",
                view: "front",
                label: "neutral",
                pose: "",
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
      });
    }
    if (action === "/cell") state.jobs[0].sheets[0].cells[0] = body.cell;
    if (action === "/import") {
      assert.equal(body.cells[0].view, "side");
      state.jobs.push({
        id: "imported",
        model: "Imported",
        status: "ready",
        planned: 0,
        attempted: 0,
        sheets: [
          {
            ...state.jobs[0].sheets[0],
            assetId: "imported",
            url: body.image,
            attempts: 0,
            cells: body.cells.map((cell, index) => ({
              ...cell,
              id: "imported-" + index,
              label: cell.expression,
              pose: "",
              scale: 1,
              offsetX: 0,
              offsetY: 0,
              status: "candidate",
            })),
          },
        ],
      });
    }
    if (action === "/approve") {
      assert.equal(body.cells.length, 1);
      assert.equal(body.cells[0].expected.cleanup, true);
      state.jobs[0].sheets[0].cells[0].status = "approved";
      result = {
        studio: state,
        snapshot: {
          characterId: "mara",
          name: "Mara",
          sprite: {
            images: [{ view: "front", label: "neutral", url: body.cells[0].image }],
            framing: { mode: "full", cropPercent: 58 },
          },
        },
      };
    }
    return route.fulfill({ contentType: "application/json", body: JSON.stringify(result) });
  });
  try {
    await page.goto("http://studio.test/");
    await expect(page.getByRole("heading", { name: "Mara’s Sprite Studio" })).toBeVisible();
    await expect(page.getByLabel("Style example")).toHaveValue("PAPERCRAFT");
    await page.getByLabel("Style example").selectOption("BATTLEHIGHWAY");
    await expect(page.getByLabel("Draw it in this style")).toContainText("Sonic Battle");
    await page.getByLabel("Style example").selectOption("Custom");
    await expect(page.getByLabel("Draw it in this style")).toHaveValue("");
    await page.getByLabel("Style example").selectOption("PAPERCRAFT");
    await page.getByRole("button", { name: "Review generation plan" }).click();
    await expect(page.getByText(/Cost unavailable/)).toBeVisible();
    await page.getByRole("button", { name: "Generate selected sprites" }).click();
    await expect(page.getByRole("heading", { name: "Review candidates" })).toBeVisible();
    assert.equal(generated, 1);
    await page.getByRole("button", { name: "← Back to Villagers" }).click();
    await page.getByRole("button", { name: "Mara · Sprite Studio" }).click();
    await expect(page.getByRole("heading", { name: "Review candidates" })).toBeVisible();
    await page.getByRole("button", { name: "Edit front neutral" }).click();
    await page.getByLabel("Remove edge-connected color matte locally").check();
    await page.getByRole("button", { name: "Save crop and alignment" }).click();
    await page.getByRole("button", { name: "Select all", exact: true }).click();
    await page.getByRole("button", { name: "Approve selected (1)" }).click();
    await expect(page.getByText("Selected sprites approved.")).toBeVisible();
    await page.getByRole("button", { name: "Approved", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Approved sprites" })).toBeVisible();
    assert.equal(generated, 1);
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
    assert.deepEqual(pixelProof, [0, 255], "matte removal preserves paper border");
    const bounds = await page.locator(".vss").boundingBox();
    assert.ok(bounds.width <= profile.viewport.width);
    await page.screenshot({ path: join(output, profile.name + ".png"), fullPage: true });
    await page.getByRole("button", { name: "Create", exact: true }).click();
    await page.getByText("Import sprites or a sheet · no image calls", { exact: true }).click();
    await page
      .getByLabel("Image", { exact: true })
      .setInputFiles({ name: "sheet.png", mimeType: "image/png", buffer: Buffer.from(source.split(",")[1], "base64") });
    await page.getByLabel("Optional exported JSON manifest").setInputFiles({
      name: "sheet.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({ cells: [{ view: "side", expression: "neutral", x: 0, y: 0, width: 512, height: 768 }] }),
      ),
    });
    await page.getByRole("button", { name: "Import for review" }).click();
    await page.getByRole("button", { name: "Edit side neutral" }).click();
    await page.getByRole("button", { name: "Facing left" }).click();
    await expect(page.locator(".vss-stage canvas")).toHaveCSS("transform", "matrix(-1, 0, 0, 1, 0, 0)");
    assert.equal(generated, 1, "sheet import and mirrored preview make no generation call");
    assert.deepEqual(errors, []);
    console.log(profile.name + ": create, styles, review, reopen, matte cleanup, approve and responsive layout passed");
  } finally {
    await browser.close();
  }
}
