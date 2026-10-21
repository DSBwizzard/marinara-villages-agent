import assert from "node:assert/strict";
import { build } from "esbuild";
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { fastExpect } from "./fixtures/fast-browser-expect.mjs";
import { mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";
const expect = fastExpect({ timeout: 10000 });
const bundle = await build({
  entryPoints: ["tests/fixtures/sprite-setup-entry.tsx"],
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
});
await mkdir(".build-tmp/sprite-setup", { recursive: true });
const browser = await chromium.launch({ headless: true });
async function verifyStableLoading(viewport, spriteCount) {
  const touch = viewport.width < 1000;
  const page = await browser.newPage({ viewport, hasTouch: touch });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const cold = {
    revision: 0,
    manager: { version: 1, artwork: [], expressions: [], assignments: [], framing: { mode: "full" } },
    assignments: [],
    suggestions: [],
    defaultArtworkId: "",
    useSprites: false,
    errors: {},
    analysisRequests: [],
    files: spriteCount ? [{ filename: "full_one.png", url: mapImage }] : [],
    resident: false,
    residentToken: "",
  };
  const prepared = structuredClone(cold);
  for (let index = 0; index < spriteCount; index++) {
    const artworkId = `art-${index}`;
    prepared.manager.artwork.push({
      id: artworkId,
      name: `Sprite ${index}`,
      rendered: { url: mapImage },
      warnings: [],
    });
    prepared.assignments.push({
      artworkId,
      name: `Sprite ${index}`,
      useWhen: "",
      direction: "front",
      included: true,
      approved: false,
    });
  }
  let releaseRead, releaseImport;
  const reading = new Promise((resolve) => {
    releaseRead = resolve;
  });
  const importing = new Promise((resolve) => {
    releaseImport = resolve;
  });
  const saves = [];
  await page.route("http://villages.test/", (route) =>
    route.fulfill({ contentType: "text/html", body: '<div id="app"></div>' }),
  );
  await page.route("**/api/connections", (route) => route.fulfill({ contentType: "application/json", body: "[]" }));
  await page.route("**/api/villages/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let value = cold;
    if (path.endsWith("/prepare")) {
      await importing;
      value = prepared;
    } else if (path.endsWith("/save")) {
      const body = route.request().postDataJSON();
      saves.push(body);
      value = { ...prepared, revision: 1, useSprites: body.useSprites };
    } else {
      assert.equal(route.request().method(), "GET", "Loading and skipping never requests analysis or applies sprites.");
      await reading;
    }
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(value) });
  });
  try {
    await page.goto("http://villages.test/");
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await page.getByRole("button", { name: "Choose Bupkis", exact: true }).click();
    await expect(page.getByText("Reading sprites…", { exact: true })).toBeVisible();
    const skip = page.getByRole("button", { name: "Add without sprites", exact: true });
    const use = page.getByRole("button", { name: "Add villager with sprites", exact: true });
    const original = await Promise.all([skip.boundingBox(), use.boundingBox()]);
    const assertStable = async () => {
      for (const [index, button] of [skip, use].entries()) {
        const box = await button.boundingBox();
        for (const key of ["x", "y", "width", "height"]) {
          assert.ok(
            Math.abs(box[key] - original[index][key]) <= 1,
            `${await button.textContent()} ${key} stays stable while sprites load.`,
          );
        }
        assert.ok(
          box.x >= 0 && box.x + box.width <= viewport.width && box.y >= 0 && box.y + box.height <= viewport.height,
          "Actions stay inside the viewport.",
        );
        assert.ok(box.height >= 44, "Actions retain a touch-sized target.");
      }
      await expect(skip).toBeEnabled();
      await expect(use).toBeDisabled();
    };
    await assertStable();
    releaseRead();
    if (spriteCount) {
      await expect(page.getByText("Preparing sprites…", { exact: true })).toBeVisible();
      await assertStable();
      releaseImport();
      await expect(page.getByText("Choose a default sprite.", { exact: true })).toBeVisible();
      await expect(page.getByText("Preparing sprites…", { exact: true })).toHaveCount(0);
    } else {
      await expect(page.getByText("No character sprites available.", { exact: true })).toBeVisible();
    }
    await assertStable();
    const main = page.locator(".villages-sprite-setup > main");
    assert.ok(
      await main.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
      "Content fits without horizontal scrolling.",
    );
    if (spriteCount) {
      assert.ok(
        await main.evaluate((node) => node.scrollHeight > node.clientHeight),
        "A full gallery scrolls inside the dialog.",
      );
      await main.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
      });
      await assertStable();
    }
    await page.screenshot({
      path: `.build-tmp/sprite-setup/stable-${viewport.width}x${viewport.height}-${spriteCount}.png`,
    });
    // A locator click would follow the moved button and miss the reported mis-tap.
    const { x, y, width, height } = original[0];
    if (touch) await page.touchscreen.tap(x + width / 2, y + height / 2);
    else await page.mouse.click(x + width / 2, y + height / 2);
    await expect(page.getByText("Bupkis added", { exact: true })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    assert.equal(saves.length, 1);
    assert.equal(saves[0].useSprites, false);
    assert.deepEqual(errors, []);
  } finally {
    releaseRead();
    releaseImport();
    await page.close();
  }
}
try {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 568 },
    { width: 844, height: 390 },
    { width: 1440, height: 1000 },
  ]) {
    for (const spriteCount of [18, 0]) await verifyStableLoading(viewport, spriteCount);
  }
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    const coldPage = await browser.newPage({ viewport });
    const cold = {
      revision: 0,
      manager: { version: 1, artwork: [], expressions: [], assignments: [], framing: { mode: "full" } },
      assignments: [],
      suggestions: [],
      defaultArtworkId: "",
      useSprites: false,
      errors: {},
      analysisRequests: [],
      files: [{ filename: "full_one.png", url: "/one.png" }],
      resident: false,
      residentToken: "",
    };
    let releaseRead, releaseImport;
    let holdRead = true,
      writes = 0;
    await coldPage.route("http://villages.test/", (route) =>
      route.fulfill({ contentType: "text/html", body: '<div id="app"></div>' }),
    );
    await coldPage.route("**/api/connections", (route) =>
      route.fulfill({ contentType: "application/json", body: "[]" }),
    );
    await coldPage.route("**/api/villages/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/prepare"))
        await new Promise((resolve) => {
          releaseImport = resolve;
        });
      else if (route.request().method() === "POST") writes++;
      else if (holdRead)
        await new Promise((resolve) => {
          releaseRead = resolve;
        });
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(cold) }).catch(() => {});
    });
    await coldPage.goto("http://villages.test/");
    await coldPage.addScriptTag({ content: bundle.outputFiles[0].text });
    await coldPage.getByRole("button", { name: "Choose Bupkis" }).click();
    await expect(coldPage.getByText("Reading sprites…", { exact: true })).toBeVisible();
    await expect(coldPage.getByRole("button", { name: "Add without sprites", exact: true })).toBeEnabled();
    await coldPage.getByRole("button", { name: "Add without sprites", exact: true }).click();
    await expect(coldPage.getByText("Bupkis added", { exact: true })).toBeVisible();
    assert.equal(await coldPage.locator("#app").getAttribute("data-sprite-revision"), "undefined");
    holdRead = false;
    releaseRead();
    for (const exit of ["Back", "Add without sprites"]) {
      await coldPage.getByRole("button", { name: "Choose Bupkis" }).click();
      await expect(coldPage.getByText("Preparing sprites…", { exact: true })).toBeVisible();
      await expect(coldPage.getByText("No character sprites available.", { exact: true })).toHaveCount(0);
      if (exit === "Back") {
        const status = await coldPage.getByText("Preparing sprites…", { exact: true }).boundingBox();
        assert.ok(status.y >= 0 && status.y + status.height <= viewport.height, "Loading status stays in view.");
        await coldPage.screenshot({ path: `.build-tmp/sprite-setup/loading-${viewport.width}.png`, fullPage: true });
      }
      await expect(coldPage.getByRole("button", { name: "Add villager with sprites", exact: true })).toBeDisabled();
      await expect(coldPage.getByRole("button", { name: exit, exact: true })).toBeEnabled();
      await coldPage.getByRole("button", { name: exit, exact: true }).click();
      await expect(coldPage.getByRole("dialog")).toHaveCount(0);
      releaseImport();
    }
    assert.equal(writes, 0, "Leaving during import never queues a stale save or activates sprites.");
    assert.equal(await coldPage.locator("#app").getAttribute("data-sprite-revision"), "undefined");
    assert.equal(
      await coldPage.locator("#app").getAttribute("data-closed-revision"),
      "undefined",
      "Back preserves a portrait-only selection without recording a sprite revision.",
    );
    await coldPage.getByRole("button", { name: "Use saved sprite choice", exact: true }).click();
    await coldPage.getByRole("button", { name: "Choose Bupkis" }).click();
    await expect(coldPage.getByText("Preparing sprites…", { exact: true })).toBeVisible();
    await coldPage.getByRole("button", { name: "Back", exact: true }).click();
    await expect(coldPage.getByRole("dialog")).toHaveCount(0);
    releaseImport();
    assert.equal(
      await coldPage.locator("#app").getAttribute("data-closed-revision"),
      "0",
      "Back refreshes an existing sprite selection after canceled imports settle.",
    );
    await coldPage.getByRole("button", { name: "Fail next addition", exact: true }).click();
    await coldPage.getByRole("button", { name: "Choose Bupkis" }).click();
    await expect(coldPage.getByText("Preparing sprites…", { exact: true })).toBeVisible();
    await coldPage.getByRole("button", { name: "Add without sprites", exact: true }).click();
    releaseImport();
    await expect(coldPage.getByText("Move-in failed.", { exact: true })).toBeVisible();
    await expect(coldPage.getByText("No character sprites available.", { exact: true })).toBeVisible();
    await coldPage.close();
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const state = {
      revision: 1,
      manager: { version: 1, artwork: [], expressions: [], assignments: [], framing: { mode: "full" } },
      assignments: [],
      suggestions: [],
      defaultArtworkId: "",
      suggestedDefaultArtworkId: "",
      useSprites: false,
      errors: {},
      analysisRequests: [],
      files: [],
      resident: false,
      residentToken: "",
    };
    for (let i = 0; i < 28; i++) {
      const artworkId = `art-${i}`;
      state.manager.artwork.push({
        id: artworkId,
        name: `full_arbitrary-${i}.png`,
        rendered: { url: mapImage },
        warnings: [],
      });
      state.assignments.push({ artworkId, name: "", useWhen: "", direction: "", included: true, approved: false });
    }
    let connectionRows = [
      { id: "vision", name: "Vision model", provider: "custom" },
      { id: "images", name: "Pictures", provider: "image_generation" },
    ];
    await page.route("**/api/connections", (route) =>
      route.fulfill({ contentType: "application/json", body: JSON.stringify(connectionRows) }),
    );
    let failSave = false;
    const saves = [];
    const applications = [];
    let analyses = 0;
    let failAt = 0;
    let holdAnalysis = false;
    let releaseAnalysis;
    const analyzedIds = [];
    const finalizations = [];
    await page.route("http://villages.test/", (route) =>
      route.fulfill({ contentType: "text/html", body: '<div id="app"></div>' }),
    );
    await page.route("http://villages.test/portrait.png", (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2400"><rect width="1600" height="2400" fill="#6085b0"/></svg>',
      }),
    );
    await page.route("**/api/villages/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      const body = route.request().postDataJSON();
      if (path.endsWith("/save")) {
        saves.push(body);
        if (failSave) {
          failSave = false;
          await route.fulfill({
            status: 409,
            contentType: "application/json",
            body: JSON.stringify({ error: "Sprite setup changed. Reopen it before saving." }),
          });
          return;
        }
        if (body.useSprites && body.validateForUse) {
          assert.ok(
            body.assignments
              .filter((item) => item.included)
              .every((item) => item.approved && item.name && item.direction),
          );
          assert.deepEqual(body.pendingSuggestionIds, []);
          assert.ok(body.assignments.some((item) => item.included && item.artworkId === body.defaultArtworkId));
        }
        assert.equal(body.revision, state.revision);
        state.revision++;
        Object.assign(state, {
          assignments: body.assignments,
          defaultArtworkId: body.defaultArtworkId,
          useSprites: body.useSprites,
        });
        state.suggestions = state.suggestions.filter((item) => body.pendingSuggestionIds.includes(item.artworkId));
      } else if (path.endsWith("/apply")) {
        applications.push(body);
        assert.equal(body.revision, state.revision);
        assert.equal(body.residentToken, state.residentToken);
      } else if (path.endsWith("/analyze")) {
        assert.equal(body.connectionId, "vision", "Only the explicitly chosen connection is used.");
        analyses++;
        assert.equal(body.artworkIds.length, 1, "Each request analyzes one sprite and returns saved progress.");
        assert.equal(body.revision, state.revision);
        const artworkId = body.artworkIds[0];
        analyzedIds.push(artworkId);
        finalizations.push(body.finalize);
        state.suggestedDefaultArtworkId = "";
        state.revision++;
        if (holdAnalysis) {
          await new Promise((resolve) => {
            releaseAnalysis = resolve;
          });
          holdAnalysis = false;
          await route.abort();
          return;
        }
        if (analyses === failAt) state.errors[artworkId] = "Analysis failed. Select this image to retry.";
        else {
          delete state.errors[artworkId];
          state.assignments = state.assignments.map((item) =>
            item.artworkId === artworkId ? { ...item, approved: false } : item,
          );
          state.suggestions = [
            ...state.suggestions.filter((item) => item.artworkId !== artworkId),
            {
              artworkId,
              name: "Relaxed " + artworkId,
              useWhen: "Relaxed or listening.",
              direction: "left",
              included: true,
            },
          ];
        }
        if (body.finalize && !state.errors[artworkId]) state.suggestedDefaultArtworkId = artworkId;
      }
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(state) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    const counts = page.locator(".sprite-counts");
    const add = page.getByRole("button", { name: "Add villager with sprites", exact: true });
    const first = page.locator(".sprite-tile");
    const popup = page.getByRole("dialog", { name: "Bupkis sprite review", exact: true });
    const dialog = page.getByRole("dialog", { name: "Bupkis sprite setup", exact: true });
    const connection = page.getByLabel("Sprite analysis connection", { exact: true });
    const closeSprite = async () => {
      if (await popup.isVisible()) await popup.getByRole("button", { name: "Done", exact: true }).click();
    };
    const chooseSprite = async (index) => {
      if (await popup.isVisible()) {
        if ((await page.locator(".sprite-thumb").nth(index).getAttribute("aria-pressed")) === "true") return;
        await closeSprite();
      }
      await page.locator(".sprite-thumb").nth(index).click();
      await expect(popup).toBeVisible();
      assert.ok(await popup.evaluate((node) => node.matches(":modal")), "Sprite editor opens as a native modal.");
    };
    const openAnalysis = async () => {
      if (!(await popup.locator(".sprite-analysis-options").evaluate((node) => node.open)))
        await popup.getByText("Analysis", { exact: true }).click();
    };
    await expect(counts).toHaveText("28 sprites · 0 ready · 28 need analysis");
    await expect(page.locator(".sprite-thumb")).toHaveCount(28);
    await expect(page.getByText("Batch edit", { exact: true })).toHaveCount(0);
    await expect(page.locator(".sprite-prepared")).toHaveCount(0);
    await expect(first).toHaveCount(0);
    await expect(add).toBeDisabled();
    assert.equal(analyses, 0, "Opening the grid never makes a model call.");
    await expect(page.getByRole("button", { name: "Analyze sprites", exact: true })).toBeDisabled();
    await expect(connection.locator("option")).toHaveCount(2);
    await connection.selectOption("vision");
    assert.equal(analyses, 0, "Selecting a connection never makes a model call.");
    await chooseSprite(0);
    await first.getByLabel("Expression", { exact: true }).fill("Listening");
    await first.getByLabel("Use when", { exact: true }).fill("Listening closely.");
    await first.getByLabel("Facing", { exact: true }).selectOption("left");
    await first.getByLabel("Default", { exact: true }).check();
    await closeSprite();
    await expect(page.locator(".sprite-thumb").first()).toContainText("Listening");
    await expect(page.locator(".sprite-thumb").first()).toContainText("Default");
    await expect(page.locator(".sprite-thumb").first()).toHaveAttribute("aria-label", "Sprite 1: Listening · Prepared");
    await expect(page.locator(".sprite-prepared")).toHaveCount(1);
    await page.getByRole("button", { name: "Back", exact: true }).click();
    assert.equal(state.assignments[0].approved, false, "Back saves manual edits without approval.");
    assert.equal(state.useSprites, false);
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await expect(connection).toHaveValue("vision");
    holdAnalysis = true;
    await page.getByRole("button", { name: "Analyze sprites", exact: true }).click();
    await expect(page.getByRole("button", { name: "Cancel analysis", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Cancel analysis", exact: true }).click();
    releaseAnalysis();
    await expect(page.getByRole("button", { name: "Cancel analysis", exact: true })).toHaveCount(0);
    assert.equal(analyses, 1, "Cancellation prevents dispatching the next sprite.");
    assert.equal(state.assignments[0].name, "Listening");
    await chooseSprite(0);
    await openAnalysis();
    await popup.getByRole("button", { name: "Analyze sprite", exact: true }).click();
    await expect(first.getByLabel("Expression", { exact: true })).toHaveValue("Relaxed art-0");
    await first.getByLabel("Use when", { exact: true }).fill("Calm and attentive.");
    await closeSprite();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    assert.equal(state.assignments[0].useWhen, "Calm and attentive.");
    assert.equal(state.assignments[0].approved, false);
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await chooseSprite(0);
    await expect(first.getByLabel("Use when", { exact: true })).toHaveValue("Calm and attentive.");
    await page.keyboard.press("Escape");
    await expect(popup).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await expect(page.locator(".sprite-thumb").first()).toBeFocused();
    await expect(add).toBeDisabled();
    failAt = analyses + 8;
    await page.getByRole("button", { name: "Analyze sprites", exact: true }).click();
    await expect(page.getByText("Analysis stopped · 7 of 27 completed this run", { exact: true })).toBeVisible();
    assert.equal(state.suggestions.length, 7, "Earlier results survive a later failure.");
    await expect(add).toBeDisabled();
    const beforeResume = analyzedIds.length;
    await page.getByRole("button", { name: "Analyze remaining", exact: true }).click();
    await expect(counts).toContainText("28 sprites · 28 ready");
    await expect(add).toBeEnabled();
    await expect(page.locator(".sprite-prepared")).toHaveCount(28);
    assert.equal(state.suggestions.length, 27);
    assert.ok(
      state.assignments.every((item) => !item.approved),
      "Analysis and preparation checkmarks never approve assignments.",
    );
    assert.ok(finalizations.slice(beforeResume, -1).every((value) => value === false));
    assert.equal(finalizations.at(-1), true);
    assert.equal(state.suggestedDefaultArtworkId, "art-27");
    assert.deepEqual(
      analyzedIds.slice(beforeResume),
      Array.from({ length: 20 }, (_, index) => `art-${index + 8}`),
      "Resume analyzes only unfinished sprites.",
    );
    await page.getByRole("button", { name: "Back", exact: true }).click();
    assert.equal(state.defaultArtworkId, "art-0", "Back preserves the manually chosen default.");
    assert.equal(state.suggestions.length, 27, "Back retains unaccepted suggestions.");
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await chooseSprite(1);
    await expect(first.getByLabel("Expression", { exact: true })).toHaveValue("Relaxed art-1");
    await first.getByLabel("Facing", { exact: true }).selectOption("right");
    await closeSprite();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    assert.equal(state.assignments[1].direction, "right");
    assert.equal(state.assignments[1].name, "Relaxed art-1");
    assert.equal(state.assignments[1].approved, false);
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await chooseSprite(1);
    await expect(first.getByLabel("Facing", { exact: true })).toHaveValue("right");
    await closeSprite();
    await page.getByRole("button", { name: "Add without sprites", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    assert.equal(state.useSprites, false);
    assert.ok(
      state.assignments.every((item) => !item.approved),
      "Portrait fallback never approves drafts.",
    );
    connectionRows = [];
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await expect(connection).toHaveCount(0);
    await chooseSprite(0);
    await openAnalysis();
    await expect(connection).toHaveValue("vision");
    await expect(connection.locator("option:checked")).toHaveText("Unavailable connection");
    await expect(popup.getByRole("button", { name: "Analyze sprite", exact: true })).toBeDisabled();
    await expect(first.getByLabel("Expression", { exact: true })).toBeEnabled();
    assert.equal(analyses, 30, "Missing connections never trigger fallback calls.");
    await closeSprite();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    state.defaultArtworkId = "";
    state.suggestedDefaultArtworkId = "art-27";
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await expect(page.locator(".sprite-thumb").last()).toContainText("Default");
    await expect(add).toBeEnabled();
    await chooseSprite(27);
    await expect(first.getByLabel("Default", { exact: true })).toBeChecked();
    await first.getByLabel("Facing", { exact: true }).selectOption("");
    await expect(page.locator(".sprite-prepared")).toHaveCount(27);
    await first.getByLabel("Facing", { exact: true }).selectOption("front");
    await first.getByLabel("Expression", { exact: true }).fill("Neutral");
    await closeSprite();
    await expect(add).toBeEnabled();
    const box = await dialog.boundingBox();
    assert.ok(Math.abs(box.x + box.width / 2 - viewport.width / 2) < 2);
    assert.ok(Math.abs(box.y + box.height / 2 - viewport.height / 2) < 2);
    assert.ok(
      await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
      "Grid dialog fits desktop and phone.",
    );
    assert.ok(
      await page.locator(".sprite-gallery").evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
      "Grid wraps without horizontal scrolling.",
    );
    const footer = await add.boundingBox();
    assert.ok(footer.y >= 0 && footer.y + footer.height <= viewport.height, "Final action stays visible.");
    const main = page.locator(".villages-sprite-setup > main");
    await main.evaluate((node) => {
      node.scrollTop = 0;
    });
    await page.screenshot({ path: `.build-tmp/sprite-setup/review-${viewport.width}.png`, fullPage: true });
    await chooseSprite(0);
    const gridScroll = await main.evaluate((node) => node.scrollTop);
    const popupBox = await popup.boundingBox();
    assert.ok(popupBox.x >= 0 && popupBox.x + popupBox.width <= viewport.width, "Popup fits viewport width.");
    assert.ok(popupBox.y >= 0 && popupBox.y + popupBox.height <= viewport.height, "Popup fits viewport height.");
    assert.ok(
      await popup.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
      "Popup content fits desktop and phone.",
    );
    assert.ok(await popup.evaluate((node) => node.contains(document.activeElement)), "Popup traps keyboard focus.");
    const radio = await first.getByLabel("Default", { exact: true }).boundingBox();
    assert.ok(radio.width <= 22 && radio.height <= 22, "Default control remains compact.");
    await page.screenshot({ path: `.build-tmp/sprite-setup/popup-${viewport.width}.png`, fullPage: true });
    await page.keyboard.press("Escape");
    await expect(popup).toHaveCount(0);
    assert.equal(await main.evaluate((node) => node.scrollTop), gridScroll, "Closing popup preserves grid position.");
    failSave = true;
    await add.click();
    await expect(page.getByRole("alert")).toContainText("Sprite setup changed.");
    await expect(add).toBeEnabled();
    assert.ok(
      state.assignments.every((item) => !item.approved),
      "Rejected saves do not approve saved drafts.",
    );
    await add.click();
    await expect(dialog).toHaveCount(0);
    assert.equal(state.useSprites, true);
    assert.ok(state.assignments.every((item) => item.approved));
    assert.equal(state.defaultArtworkId, "art-27");
    assert.equal(state.suggestions.length, 0);
    assert.equal(saves.at(-1).validateForUse, true);
    assert.equal(analyses, 30, "Accepting a review never makes another model call.");
    state.resident = true;
    state.residentToken = "resident-token";
    await page.getByRole("button", { name: "Review resident sprites", exact: true }).click();
    const useSprites = page.getByRole("button", { name: "Use sprites", exact: true });
    await chooseSprite(27);
    await first.getByLabel("Include", { exact: true }).uncheck();
    await closeSprite();
    await expect(useSprites).toBeDisabled();
    await expect(page.getByText("Choose a default sprite.", { exact: true })).toBeVisible();
    await chooseSprite(0);
    await first.getByLabel("Default", { exact: true }).check();
    await chooseSprite(1);
    await first.getByLabel("Expression", { exact: true }).fill("");
    await closeSprite();
    await expect(useSprites).toBeDisabled();
    await chooseSprite(1);
    await first.getByLabel("Include", { exact: true }).uncheck();
    await closeSprite();
    await expect(useSprites).toBeEnabled();
    await expect(page.locator(".sprite-prepared")).toHaveCount(26);
    await useSprites.click();
    await expect(dialog).toHaveCount(0);
    assert.equal(state.assignments[1].included, false);
    assert.equal(state.assignments[1].approved, false);
    assert.equal(state.assignments[27].approved, false);
    assert.equal(state.defaultArtworkId, "art-0");
    assert.equal(state.manager.artwork.length, 28, "Excluding sprites preserves artwork.");
    assert.deepEqual(applications, [{ revision: state.revision, residentToken: "resident-token" }]);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Sprite setup browser: modal sprite review, prepared markers, draft persistence, final approval, retry/cancellation and portrait fallback passed on desktop/phone.",
  );
} finally {
  await browser.close();
}
