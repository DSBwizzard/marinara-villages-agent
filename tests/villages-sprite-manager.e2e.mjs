import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { PNG } from "pngjs";
import { chromium, expect as baseExpect } from "@playwright/test";
import { snapshot, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";
const expect = baseExpect.configure({ timeout: 15000 });
const require = createRequire(import.meta.url);
const { build } = require("esbuild");
mkdirSync(".build-tmp/sprite-manager", { recursive: true });
await build({
  entryPoints: [resolve("packages/villages/src/shared/helpers/sprite-framing.ts")],
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
    { width: 1917, height: 1000 },
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
    { width: 1024, height: 768 },
    { width: 844, height: 390 },
  ]) {
    const page = await browser.newPage({ viewport, hasTouch: viewport.width < 720 });
    const errors = [],
      requests = [],
      files = new Map();
    let failSave = false,
      failUnassign = false,
      failLibrary = false;
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
    function addArtwork(name, bytes, engineSource) {
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
        engineSource,
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
          value = failLibrary
            ? ((failLibrary = false), { items: [], error: "Library temporarily unavailable." })
            : {
                items: [
                  {
                    filename: "full_native.png",
                    url: "data:image/png;base64," + pngImage().toString("base64"),
                    adoptedArtworkId: manager.artwork.find((item) => item.engineSource?.filename === "full_native.png")
                      ?.id,
                  },
                ],
                error: "",
              };
        else {
          let addedArtworkIds, selectedArtworkIds;
          if (path.endsWith("/import"))
            addedArtworkIds = body.images.map((item) =>
              addArtwork(item.name, Buffer.from(item.image.split(",")[1], "base64")),
            );
          else if (path.endsWith("/adopt")) {
            addedArtworkIds = [];
            selectedArtworkIds = body.filenames.map((name) => {
              const existing = manager.artwork.find((item) => item.engineSource?.filename === name);
              if (existing) return existing.id;
              const id = addArtwork(name, pngImage(), {
                characterId: snapshot.villagers[0].characterId,
                filename: name,
              });
              addedArtworkIds.push(id);
              return id;
            });
          } else if (path.endsWith("/save")) {
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
          } else if (path.endsWith("/unassign")) {
            if (failUnassign) {
              failUnassign = false;
              await route.fulfill({
                status: 500,
                contentType: "application/json",
                body: JSON.stringify({ error: "Assignment removal failed." }),
              });
              return;
            }
            const art = manager.artwork.find((item) => item.id === body.artworkId);
            assert.equal(body.expectedUrl, art.rendered.url);
            assert.ok(
              manager.assignments.some(
                (item) =>
                  item.artworkId === body.artworkId &&
                  item.expressionId === body.expressionId &&
                  item.view === body.view,
              ),
            );
            manager.assignments = manager.assignments.filter(
              (item) => item.expressionId !== body.expressionId || item.view !== body.view,
            );
            manager.expressions = manager.expressions.filter((item) =>
              manager.assignments.some((assignment) => assignment.expressionId === item.id),
            );
            if (!manager.assignments.some((item) => item.expressionId === manager.defaultExpressionId))
              manager.defaultExpressionId = manager.assignments[0]?.expressionId;
          } else if (path.endsWith("/default")) manager.defaultExpressionId = body.expressionId;
          else if (path.endsWith("/framing")) manager.framing = body;
          else if (path.endsWith("/remove")) {
            manager.artwork = manager.artwork.filter((item) => item.id !== body.artworkId);
            manager.assignments = manager.assignments.filter((item) => item.artworkId !== body.artworkId);
            manager.defaultExpressionId = manager.assignments[0]?.expressionId;
          }
          value = { manager, snapshot: currentSnapshot(), addedArtworkIds, selectedArtworkIds };
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
      await page.getByRole("button", { name: "Open Mara profile" }).click();
      await page
        .getByRole("button", { name: /Manage sprites ·/ })
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
    await expect(page.getByLabel("Expression name")).toHaveCSS("background-color", "rgb(55, 53, 43)");
    await page.getByLabel("Use when…", { exact: true }).fill("Listening with controlled authority.");
    await expect(page.getByRole("button", { name: "Save and use in Scenes" })).toBeEnabled();
    await page.getByRole("button", { name: "Save and use in Scenes" }).click();
    await expect(page.getByRole("status")).toHaveText("Expression and artwork saved for Scenes.");
    assert.equal(manager.assignments.length, 1);
    const feedback = page.locator(".vsm-actions").getByRole("status");
    await expect(feedback).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(feedback).toHaveCSS("padding-top", "0px");
    await expect(feedback).toHaveCSS("border-left-width", "0px");
    const feedbackBox = await feedback.boundingBox();
    assert.ok(feedbackBox.height < 60, "confirmation stays compact even on narrow screens");
    await page.locator(".vsm-actions").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: resolve(`.build-tmp/sprite-manager/confirmation-${viewport.width}x${viewport.height}.png`),
    });

    await page
      .getByRole("group", { name: "Preview screen" })
      .getByRole("button", { name: "Mobile", exact: true })
      .click();
    await expect(page.locator(".vsm-scene")).toHaveAttribute("data-mobile", "true");
    await page
      .getByRole("group", { name: "Preview screen" })
      .getByRole("button", { name: "Desktop", exact: true })
      .click();
    // Metadata-only drafts survive selection, resize, and unrelated immediate saves.
    await page.getByLabel("Expression name", { exact: true }).fill("Calm draft");
    await expect(page.getByRole("button", { name: "Discard changes" })).toBeEnabled();
    await page.getByRole("button", { name: /Angry.png/ }).click();
    await page.getByLabel("Use when…", { exact: true }).fill("Angry draft");
    await page.getByRole("button", { name: /Composed.png/ }).click();
    await expect(page.getByLabel("Expression name", { exact: true })).toHaveValue("Calm draft");
    await page.setViewportSize({ width: viewport.width > 719 ? 390 : 1024, height: 844 });
    await expect(page.getByLabel("Expression name", { exact: true })).toHaveValue("Calm draft");
    await page.setViewportSize(viewport);
    if (viewport.width === 1917) {
      const host = page.locator("marinara-capability-villages");
      await host.evaluate((element) => (element.style.width = "700px"));
      await expect(page.locator(".vsm-artwork")).toHaveCSS("display", "flex");
      await expect(page.getByLabel("Expression name", { exact: true })).toHaveValue("Calm draft");
      await host.evaluate((element) => (element.style.width = ""));
      await expect(page.locator(".vsm-artwork")).toHaveCSS("display", "grid");
    }
    assert.equal(
      await page.evaluate(() => {
        const event = new Event("beforeunload", { cancelable: true });
        window.dispatchEvent(event);
        return event.defaultPrevented;
      }),
      true,
      "closing the browser warns about unsaved drafts",
    );
    let rejectedLeave = false;
    page.once("dialog", async (dialog) => {
      rejectedLeave = true;
      await dialog.dismiss();
    });
    await page.getByRole("button", { name: "← Back to profile", exact: true }).click();
    assert.equal(rejectedLeave, true);
    await expect(page.getByLabel("Expression name", { exact: true })).toHaveValue("Calm draft");
    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: "← Back to profile", exact: true }).click();
    await expect(page.getByLabel("Expression name", { exact: true })).toHaveValue("Calm draft");
    await page.getByRole("button", { name: "Save and use in Scenes" }).click();
    await expect(page.getByRole("status")).toHaveText("Expression and artwork saved for Scenes.");
    await page.getByLabel("Expression name", { exact: true }).fill("Temporary edit");
    await page.getByRole("button", { name: "Discard changes" }).click();
    await expect(page.getByLabel("Expression name", { exact: true })).toHaveValue("Calm draft");
    await page.getByRole("button", { name: /Angry.png/ }).click();
    await expect(page.getByLabel("Use when…", { exact: true })).toHaveValue("Angry draft");
    await page.getByRole("button", { name: "Discard changes" }).click();
    await page.getByRole("button", { name: /Angry.png/ }).click();
    await expect(page.getByText(/This artwork has an opaque background/)).toBeVisible();
    await page
      .getByRole("group", { name: "Facing", exact: true })
      .getByRole("button", { name: "Side", exact: true })
      .click();
    await page.getByLabel("Expression", { exact: true }).selectOption(manager.defaultExpressionId);
    await page.getByRole("button", { name: "Save and use in Scenes" }).click();
    await expect(page.getByRole("status")).toHaveText("Expression and artwork saved for Scenes.");
    assert.equal(manager.assignments.length, 2);
    // Reproduce one artwork accidentally assigned to both Front and Side.
    await page
      .getByRole("group", { name: "Facing", exact: true })
      .getByRole("button", { name: "Front", exact: true })
      .click();
    await page.getByRole("button", { name: "Save and use in Scenes" }).click();
    await expect(page.getByRole("status")).toHaveText("Expression and artwork saved for Scenes.");
    const removeFront = page.getByRole("button", { name: /^Remove Front assignment for/ }),
      removeSide = page.getByRole("button", { name: /^Remove Side assignment for/ });
    await expect(removeFront).toBeVisible();
    await expect(removeSide).toBeVisible();
    await page.getByRole("group", { name: "Saved assignments" }).screenshot({
      path: resolve(`.build-tmp/sprite-manager/assignments-${viewport.width}x${viewport.height}.png`),
    });
    await page.getByLabel("Expression name", { exact: true }).fill("Unsaved name");
    await expect(removeFront).toBeDisabled();
    await page.getByRole("button", { name: "Discard changes" }).click();
    failUnassign = true;
    await removeFront.click();
    await expect(page.getByRole("alert")).toHaveText("Assignment removal failed.");
    assert.equal(manager.assignments.length, 2);
    await expect(removeFront).toBeEnabled();
    const artworkBeforeRemoval = structuredClone(manager.artwork);
    await removeFront.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status")).toHaveText("Front assignment removed. Artwork kept.");
    await expect(page.getByLabel("Expression", { exact: true })).toBeFocused();
    await expect(removeFront).toHaveCount(0);
    await expect(removeSide).toBeVisible();
    assert.deepEqual(manager.artwork, artworkBeforeRemoval);
    assert.equal(manager.assignments.length, 1);
    assert.equal(manager.assignments[0].view, "side");
    await expect(
      page.getByRole("group", { name: "Facing", exact: true }).getByRole("button", { name: "Side", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: /Composed.png/ }).click();
    await page.getByLabel("Expression", { exact: true }).selectOption(manager.defaultExpressionId);
    await page.getByRole("button", { name: "Save and use in Scenes" }).click();
    await expect(page.getByRole("status")).toHaveText("Expression and artwork saved for Scenes.");
    await page.getByRole("button", { name: /Angry.png/ }).click();
    await page.getByText("Advanced framing", { exact: true }).click();
    await page.getByLabel("Scale", { exact: true }).fill("3");
    await expect(page.getByRole("button", { name: "Save and use in Scenes" })).toBeDisabled();
    await expect(page.getByText(/Artwork exceeds the safe margin/)).toBeVisible();
    await page.getByLabel("Scale", { exact: true }).fill("1");
    await page.getByRole("button", { name: /Two figures.png/ }).click();

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
    const more = page.getByLabel("More artwork actions");
    await more.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".vsm-more-menu")).toBeVisible();
    await expect(page.locator(".vsm-more-menu")).toHaveCSS("position", "static");
    const menuBox = await page.locator(".vsm-more-menu").boundingBox();
    const settingsBox = await page.locator(".vsm-settings").boundingBox();
    const expressionBox = await page.getByRole("heading", { name: "Expression", exact: true }).boundingBox();
    assert.ok(
      menuBox.x >= settingsBox.x && menuBox.x + menuBox.width <= settingsBox.x + settingsBox.width + 1,
      "extra actions fit inside settings",
    );
    assert.ok(
      expressionBox.y >= menuBox.y + menuBox.height,
      "extra actions push settings down rather than covering them",
    );
    await page.locator(".vsm-more-menu").scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(`.build-tmp/sprite-manager/menu-${viewport.width}x${viewport.height}.png`) });
    await page.getByRole("button", { name: "Make default" }).click();
    await page.getByLabel("More artwork actions").click();
    await expect(page.getByRole("button", { name: "Make default" })).toBeDisabled();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download saved PNG" }).click();
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
    await expect(page.locator(".vsm-scene[data-half=true]")).toHaveCount(1);
    failLibrary = true;
    await page.getByRole("button", { name: "Character library" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByRole("alert")).toHaveText("Library temporarily unavailable.");
    await page.getByRole("button", { name: "Retry library" }).click();
    await page.getByRole("checkbox", { name: "full_native.png" }).check();
    await page.getByRole("button", { name: "Add selected artwork" }).click();
    await expect(page.getByLabel("Expression name")).toHaveValue("native");
    const artworkAfterAdoption = manager.artwork.length;
    await page.getByRole("button", { name: "Character library" }).click();
    await expect(page.getByRole("checkbox", { name: "full_native.png · Already added" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Add selected artwork" })).toBeDisabled();
    assert.equal(manager.artwork.length, artworkAfterAdoption);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Character library" })).toBeFocused();
    await page.getByRole("heading", { name: "Scene preview", exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({
      path: resolve(`.build-tmp/sprite-manager/${viewport.width}x${viewport.height}.png`),
      fullPage: true,
    });
    const actions = page.locator(".vsm-settings > .vsm-actions");
    await expect(actions).toHaveCount(1);
    await expect(page.locator(".vsm-savebar")).toHaveCount(0);
    await expect(actions).toHaveCSS("position", "static");
    await actions.scrollIntoViewIfNeeded();
    const beforeScroll = await actions.boundingBox();
    await page.getByLabel("Foot position", { exact: true }).scrollIntoViewIfNeeded();
    const afterScroll = await actions.boundingBox();
    assert.ok(afterScroll.y < beforeScroll.y - 20, "controls scroll away with settings");
    await actions.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: resolve(`.build-tmp/sprite-manager/controls-${viewport.width}x${viewport.height}.png`),
    });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    assert.equal(overflow, false, "manager fits narrow screens");
    await page.getByRole("button", { name: "← Back to profile" }).click();
    await expect(page.getByRole("button", { name: /Manage sprites ·/ }).first()).toBeFocused();
    await page
      .getByRole("button", { name: /Manage sprites ·/ })
      .first()
      .click();
    await expect(page.getByRole("button", { name: /full_native.png/ })).toBeVisible();
    await page.getByRole("button", { name: /full_native.png/ }).click();
    await page.getByRole("button", { name: "Character library" }).click();
    await expect(page.getByRole("checkbox", { name: "full_native.png · Already added" })).toBeDisabled();
    await page.getByRole("button", { name: "Close library" }).click();
    await page.getByLabel("More artwork actions").click();
    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: "Remove artwork" }).click();
    await expect(page.getByRole("button", { name: /full_native.png/ })).toHaveCount(1);
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Remove artwork" }).click();
    await expect(page.getByRole("button", { name: /full_native.png/ })).toHaveCount(0);
    await page.getByRole("button", { name: "Character library" }).click();
    await expect(page.getByRole("checkbox", { name: "full_native.png", exact: true })).toBeEnabled();
    await page.getByRole("checkbox", { name: "full_native.png", exact: true }).check();
    // Another tab adopts after this picker loads; reuse the returned artwork ID.
    addArtwork("full_native.png", pngImage(), {
      characterId: snapshot.villagers[0].characterId,
      filename: "full_native.png",
    });
    await page.getByRole("button", { name: "Add selected artwork" }).click();
    await expect(page.getByLabel("Expression name")).toHaveValue("native");
    await expect(page.getByRole("status")).toHaveText("Selected artwork is already in Sprite Manager.");
    assert.equal(manager.artwork.length, artworkAfterAdoption, "removal permits one new adoption");
    assert.equal(
      requests.some((path) => /generate|cleanup|studio|directions|review/.test(path)),
      false,
      "UI has no generation or cleanup calls",
    );
    while (manager.artwork.length) {
      const remainingArtwork = manager.artwork.length - 1;
      await page.locator(".vsm-artwork button").first().click();
      await page.getByLabel("More artwork actions").click();
      page.once("dialog", (dialog) => dialog.accept());
      await page.getByRole("button", { name: "Remove artwork" }).click();
      await expect(page.locator(".vsm-artwork button")).toHaveCount(remainingArtwork);
    }
    await expect(page.getByText(/No sprites assigned yet/)).toBeVisible();
    await expect(page.locator(".vsm > .vsm-feedback[role=status]")).toHaveText(
      "Artwork removed from Sprite Manager and its Scene assignments.",
    );
    await expect(page.locator(".vsm-actions")).toHaveCount(0);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Sprite Manager browser: desktop, portrait/landscape phones, uploads, framing, expressions, failures, exports, adoption and reload passed.",
  );
} finally {
  await browser.close();
}
