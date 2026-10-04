import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { PNG } from "pngjs";
import { chromium, expect } from "@playwright/test";
import { snapshot, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";
const require = createRequire(import.meta.url);
const { build } = require("esbuild");
mkdirSync(".build-tmp/sprite-manager", { recursive: true });
await build({
  entryPoints: [resolve("packages/villages/src/engine/packages/server/src/services/villages/sprite-manager-pixels.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: resolve(".build-tmp/sprite-manager/pixels.cjs"),
});
const { renderSpritePixels, initialSpriteFrame } = require(resolve(".build-tmp/sprite-manager/pixels.cjs"));
function pngImage(opaque = false, multiple = false) {
  const image = new PNG({ width: multiple ? 192 : 64, height: 96 });
  if (opaque) image.data.fill(255);
  for (let y = 10; y < 84; y++)
    for (let x = 12; x < 52; x++) image.data.set([225, 160, 100, 255], (y * image.width + x) * 4);
  if (multiple)
    for (let y = 8; y < 85; y++)
      for (let x = 108; x < 162; x++) image.data.set([130, 180, 220, 255], (y * image.width + x) * 4);
  return PNG.sync.write(image);
}
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync("C:/Program Files/Google/Chrome/Application/chrome.exe")
    ? { executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" }
    : {}),
});
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    const page = await browser.newPage({ viewport });
    const errors = [],
      requests = [],
      files = new Map();
    let failSave = false;
    page.on("pageerror", (error) => errors.push(error.message));
    let manager = {
      version: 1,
      artwork: [],
      expressions: [],
      assignments: [],
      framing: { mode: "full", cropPercent: 58 },
    };
    const currentSnapshot = () => ({
      ...snapshot,
      villagers: snapshot.villagers.map((resident, index) =>
        index
          ? resident
          : {
              ...resident,
              sprite: manager.assignments.length
                ? {
                    framing: manager.framing,
                    images: manager.assignments.map((assignment) => {
                      const art = manager.artwork.find((item) => item.id === assignment.artworkId);
                      return {
                        view: assignment.view,
                        expressionId: assignment.expressionId,
                        label: assignment.expressionId,
                        isDefault: assignment.expressionId === manager.defaultExpressionId,
                        url: art.rendered.url,
                      };
                    }),
                  }
                : null,
            },
      ),
    });
    function addArtwork(name, bytes) {
      const png = PNG.sync.read(bytes),
        pixels = { width: png.width, height: png.height, data: new Uint8ClampedArray(png.data) },
        id = "a-" + randomUUID();
      const frame = initialSpriteFrame(png.width, png.height),
        rendered = renderSpritePixels(pixels, frame);
      const sourceUrl = `/api/sprites/${id}/file/original.png`,
        renderedUrl = `/api/sprites/${id}/file/rendered.png`;
      files.set(sourceUrl, bytes);
      files.set(renderedUrl, PNG.sync.write({ ...rendered.image, data: Buffer.from(rendered.image.data) }));
      const art = {
        id,
        name,
        assetId: "villages-" + randomUUID(),
        source: { url: sourceUrl, width: png.width, height: png.height },
        rendered: { url: renderedUrl },
        frame,
        warnings: rendered.warnings,
      };
      manager.artwork.push(art);
      return id;
    }
    await page.route("http://villages.test/", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<style>:root{--background:#171b25;--foreground:#f4f0e8;--primary:#a7c7ff;--primary-foreground:#152132}html,body{margin:0;background:#171b25;color:#f4f0e8;font:16px Arial}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/sprites/**", (route) => {
      const bytes = files.get(new URL(route.request().url()).pathname);
      return route.fulfill({ status: bytes ? 200 : 404, contentType: "image/png", body: bytes ?? "" });
    });
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      requests.push(path);
      let value = currentSnapshot();
      if (path.endsWith("/debug/runtime")) value = { showUsageMeter: false };
      else if (path.includes("/sprites/manager")) {
        const body = route.request().method() === "POST" ? route.request().postDataJSON() : {};
        if (path.endsWith("/manager")) value = manager;
        else if (path.endsWith("/library"))
          value = {
            items: [{ filename: "full_native.png", url: "data:image/png;base64," + pngImage().toString("base64") }],
            error: "",
          };
        else {
          let addedArtworkIds;
          if (path.endsWith("/import"))
            addedArtworkIds = body.images.map((item) =>
              addArtwork(item.name, Buffer.from(item.image.split(",")[1], "base64")),
            );
          else if (path.endsWith("/adopt"))
            addedArtworkIds = body.filenames.map((name) => addArtwork(name, pngImage()));
          else if (path.endsWith("/save")) {
            if (failSave) {
              failSave = false;
              await route.fulfill({
                status: 500,
                contentType: "application/json",
                body: JSON.stringify({ error: "Storage failed; your assigned artwork is unchanged." }),
              });
              return;
            }
            const art = manager.artwork.find((item) => item.id === body.artworkId),
              png = PNG.sync.read(files.get(art.source.url));
            const rendered = renderSpritePixels(
              { width: png.width, height: png.height, data: new Uint8ClampedArray(png.data) },
              body.frame,
            );
            assert.equal(rendered.clipped, false);
            art.frame = body.frame;
            art.rendered.url = `/api/sprites/${art.id}/file/r-${randomUUID()}.png`;
            files.set(art.rendered.url, PNG.sync.write({ ...rendered.image, data: Buffer.from(rendered.image.data) }));
            const id = body.expressionId || "e-" + randomUUID(),
              expression = manager.expressions.find((item) => item.id === id);
            if (expression) Object.assign(expression, { name: body.name, useWhen: body.useWhen });
            else manager.expressions.push({ id, name: body.name, useWhen: body.useWhen });
            manager.assignments = manager.assignments.filter(
              (item) => item.expressionId !== id || item.view !== body.view,
            );
            manager.assignments.push({ expressionId: id, view: body.view, artworkId: art.id });
            manager.defaultExpressionId ??= id;
          } else if (path.endsWith("/default")) manager.defaultExpressionId = body.expressionId;
          else if (path.endsWith("/framing")) manager.framing = body;
          else if (path.endsWith("/remove")) {
            manager.artwork = manager.artwork.filter((item) => item.id !== body.artworkId);
            manager.assignments = manager.assignments.filter((item) => item.artworkId !== body.artworkId);
            manager.defaultExpressionId = manager.assignments[0]?.expressionId;
          }
          value = { manager, snapshot: currentSnapshot(), addedArtworkIds };
        }
      } else if (path.endsWith("/rooms/active")) value = { session: null };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/catalog")) value = { characters: [] };
      else if (path.endsWith("/lorebooks")) value = { books: [] };
      else if (path.endsWith("/personas")) value = { personas: [] };
      else if (path.endsWith("/interpretation-settings"))
        value = { settings: { decisionsEnabled: false }, status: { available: false } };
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(value) });
    });
    async function openManager() {
      await page.getByRole("button", { name: /^Villagers \(/ }).click();
      await page
        .getByRole("button", { name: /Sprite Manager ·/ })
        .first()
        .focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("heading", { name: "Mara’s Sprite Manager" })).toBeFocused();
    }
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: "More" }).click();
    await openManager();
    await expect(page.getByText(/No sprites assigned yet/)).toBeVisible();
    await page.getByLabel("Upload sprite images").setInputFiles([
      { name: "Composed.png", mimeType: "image/png", buffer: pngImage() },
      { name: "Angry.png", mimeType: "image/png", buffer: pngImage(true) },
      { name: "Two figures.png", mimeType: "image/png", buffer: pngImage(false, true) },
    ]);
    await expect(page.getByLabel("Expression name")).toHaveValue("Composed");
    await page.getByLabel("Use when…", { exact: true }).fill("Listening with controlled authority.");
    await expect(page.getByRole("button", { name: "Save and use in Scenes" })).toBeEnabled();
    await page.getByRole("button", { name: "Save and use in Scenes" }).click();
    await expect(page.getByRole("status")).toHaveText("Expression and artwork saved for Scenes.");
    assert.equal(manager.assignments.length, 1);
    await page.getByRole("button", { name: /Angry.png/ }).click();
    await expect(page.getByText(/This artwork has an opaque background/)).toBeVisible();
    await page.getByLabel("Facing", { exact: true }).selectOption("side");
    await page.getByLabel("Expression", { exact: true }).selectOption(manager.defaultExpressionId);
    await page.getByRole("button", { name: "Save and use in Scenes" }).click();
    await expect(page.getByRole("status")).toHaveText("Expression and artwork saved for Scenes.");
    assert.equal(manager.assignments.length, 2);
    await page.getByLabel("Scale", { exact: true }).fill("3");
    await expect(page.getByRole("button", { name: "Save and use in Scenes" })).toBeDisabled();
    await expect(page.getByText(/Artwork exceeds the safe margin/)).toBeVisible();
    await page.getByLabel("Scale", { exact: true }).fill("1");
    await page.getByRole("button", { name: /Two figures.png/ }).click();
    await page.getByText("Crop and body-height markers", { exact: true }).click();
    await page.getByLabel("Crop width", { exact: true }).fill("60");
    await page.getByLabel("Head marker (optional)", { exact: true }).fill("10");
    await page.getByLabel("Foot marker (optional)", { exact: true }).fill("84");
    await page.getByLabel("Expression name", { exact: true }).fill("Calculating");
    failSave = true;
    await page.getByRole("button", { name: "Save and use in Scenes" }).click();
    await expect(page.getByRole("alert")).toHaveText(/Storage failed/);
    assert.equal(manager.assignments.length, 2);
    await page.getByRole("button", { name: "Save and use in Scenes" }).click();
    await expect(page.getByRole("status")).toHaveText("Expression and artwork saved for Scenes.");
    await page.getByRole("button", { name: "Make default" }).click();
    await expect(page.getByRole("button", { name: "Make default" })).toBeDisabled();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download PNG" }).click();
    assert.match((await download).suggestedFilename(), /Calculating-front\.png/);
    const png = PNG.sync.read(files.get(manager.artwork[2].rendered.url));
    assert.equal(png.width, 1024);
    assert.equal(png.height, 1536);
    const previewAlpha = await page.locator(".vsm-comparison canvas").evaluate((canvas) => {
      const pixels = canvas.getContext("2d").getImageData(0, 0, 1024, 1536).data;
      let sum = 0;
      for (let i = 3; i < pixels.length; i += 4) sum += pixels[i];
      return sum;
    });
    let serverAlpha = 0;
    for (let i = 3; i < png.data.length; i += 4) serverAlpha += png.data[i];
    assert.equal(previewAlpha, serverAlpha, "preview and exported alpha agree");
    await page.getByLabel("Scale", { exact: true }).fill("0.9");
    await page.getByLabel("Scene framing", { exact: true }).selectOption("half");
    await expect(page.getByLabel("Scale", { exact: true })).toHaveValue("0.9");
    await page.getByLabel("Scale", { exact: true }).fill("1");
    await expect(page.locator(".vsm-scene[data-half=true]")).toHaveCount(2);
    await page.getByRole("button", { name: "Choose from Engine character sprites" }).click();
    await page.getByRole("checkbox", { name: "full_native.png" }).check();
    await page.getByRole("button", { name: "Add selected artwork" }).click();
    await expect(page.getByLabel("Expression name")).toHaveValue("native");
    await page.getByRole("heading", { name: "Framing", exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({
      path: resolve(`.build-tmp/sprite-manager/${viewport.width}x${viewport.height}.png`),
      fullPage: true,
    });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    assert.equal(overflow, false, "manager fits narrow screens");
    await page.getByRole("button", { name: "← Back to Villagers" }).click();
    await page
      .getByRole("button", { name: /Sprite Manager ·/ })
      .first()
      .click();
    await expect(page.getByRole("button", { name: /full_native.png/ })).toBeVisible();
    await page.getByRole("button", { name: /full_native.png/ }).click();
    await page.getByRole("button", { name: "Remove artwork" }).click();
    await expect(page.getByRole("button", { name: /full_native.png/ })).toHaveCount(0);
    assert.equal(
      requests.some((path) => /generate|cleanup|studio|directions|review/.test(path)),
      false,
      "UI has no generation or cleanup calls",
    );
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Sprite Manager browser: desktop, portrait/landscape phones, uploads, framing, expressions, failures, exports, adoption and reload passed.",
  );
} finally {
  await browser.close();
}
