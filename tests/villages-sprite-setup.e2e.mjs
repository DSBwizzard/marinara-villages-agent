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
try {
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
    const connection = page.getByLabel("Sprite analysis connection", { exact: true });
    const chooseSprite = async (index) => {
      const thumb = page.locator(".sprite-thumb").nth(index);
      if ((await thumb.getAttribute("aria-pressed")) !== "true") await thumb.click();
      await expect(first).toHaveCount(1);
    };
    const openBatch = async () => {
      if (!(await page.locator(".sprite-batch").evaluate((node) => node.open)))
        await page.getByText("Batch edit", { exact: true }).click();
    };
    await expect(counts).toHaveText("28 sprites · 0 ready · 28 need analysis");
    await expect(page.locator(".sprite-thumb")).toHaveCount(28);
    await expect(first).toHaveCount(0);
    await expect(add).toBeDisabled();
    assert.equal(analyses, 0, "Opening the grid never makes a model call.");
    await expect(page.getByRole("button", { name: "Analyze sprites", exact: true })).toBeDisabled();
    await expect(connection.locator("option")).toHaveCount(2);
    await connection.selectOption("vision");
    assert.equal(analyses, 0, "Selecting a connection never makes a model call.");
    await page.screenshot({ path: `.build-tmp/sprite-setup/grid-${viewport.width}.png`, fullPage: true });
    await chooseSprite(0);
    await first.getByLabel("Expression", { exact: true }).fill("Listening");
    await first.getByLabel("Use when", { exact: true }).fill("Listening closely.");
    await first.getByLabel("Facing", { exact: true }).selectOption("left");
    await first.getByLabel("Default", { exact: true }).check();
    await expect(counts).toContainText("28 sprites · 1 ready · 27 need analysis");
    await first.getByRole("button", { name: "Done", exact: true }).click();
    await expect(first).toHaveCount(0);
    await expect(page.locator(".sprite-thumb").first()).toContainText("Listening");
    await expect(page.locator(".sprite-thumb").first()).toContainText("Default");
    await page.getByRole("button", { name: "Back", exact: true }).click();
    assert.equal(state.assignments[0].approved, false, "Back saves manual edits without approval.");
    assert.equal(state.useSprites, false);
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await expect(connection).toHaveValue("vision");
    await openBatch();
    await page.getByLabel("Select sprite 1", { exact: true }).check();
    await page.getByRole("button", { name: "Analyze selected", exact: true }).click();
    await chooseSprite(0);
    await expect(first.getByLabel("Expression", { exact: true })).toHaveValue("Relaxed art-0");
    await first.getByLabel("Use when", { exact: true }).fill("Calm and attentive.");
    await page.getByRole("button", { name: "Back", exact: true }).click();
    assert.equal(state.assignments[0].useWhen, "Calm and attentive.");
    assert.equal(state.assignments[0].approved, false);
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await chooseSprite(0);
    await expect(first.getByLabel("Use when", { exact: true })).toHaveValue("Calm and attentive.");
    await expect(add).toBeDisabled();
    await openBatch();
    await page.getByRole("button", { name: "Select all", exact: true }).click();
    failAt = analyses + 8;
    await page.getByRole("button", { name: "Analyze selected", exact: true }).click();
    await expect(page.getByText("Analysis stopped · 7 of 28 completed this run", { exact: true })).toBeVisible();
    assert.equal(state.suggestions.length, 7, "Earlier results survive a later failure.");
    await expect(add).toBeDisabled();
    const beforeResume = analyzedIds.length;
    await page.getByRole("button", { name: "Analyze remaining", exact: true }).click();
    await expect(counts).toContainText("28 sprites · 28 ready");
    await expect(add).toBeEnabled();
    assert.equal(state.suggestions.length, 28);
    assert.ok(
      state.assignments.every((item) => !item.approved),
      "Analysis alone never approves assignments.",
    );
    assert.ok(finalizations.slice(beforeResume, -1).every((value) => value === false));
    assert.equal(finalizations.at(-1), true);
    assert.equal(state.suggestedDefaultArtworkId, "art-27");
    assert.deepEqual(
      analyzedIds.slice(beforeResume),
      Array.from({ length: 21 }, (_, index) => `art-${index + 7}`),
      "Resume analyzes only unfinished sprites.",
    );
    await expect(first.getByLabel("Default", { exact: true })).toBeChecked();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    assert.equal(state.defaultArtworkId, "art-0", "Back preserves the manually chosen default.");
    assert.equal(state.suggestions.length, 28, "Back retains unaccepted suggestions for reopening.");
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await chooseSprite(1);
    await expect(first.getByLabel("Expression", { exact: true })).toHaveValue("Relaxed art-1");
    await openBatch();
    await page.getByLabel("Batch facing", { exact: true }).selectOption("right");
    await page.getByRole("button", { name: "Select all", exact: true }).click();
    await page.getByRole("button", { name: "Apply to selected", exact: true }).click();
    await expect(first.getByLabel("Facing", { exact: true })).toHaveValue("right");
    await page.getByRole("button", { name: "Back", exact: true }).click();
    assert.ok(
      state.assignments.every((item) => item.direction === "right" && item.name && !item.approved),
      "Batch edits preserve proposed metadata as unapproved drafts.",
    );
    assert.equal(state.suggestions.length, 0);
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await chooseSprite(1);
    await expect(first.getByLabel("Facing", { exact: true })).toHaveValue("right");
    await openBatch();
    await page.getByRole("button", { name: "Select all", exact: true }).click();
    holdAnalysis = true;
    await page.getByRole("button", { name: "Analyze selected", exact: true }).click();
    await expect(page.getByRole("button", { name: "Cancel analysis", exact: true })).toBeVisible();
    await expect(add).toBeDisabled();
    await page.getByRole("button", { name: "Cancel analysis", exact: true }).click();
    releaseAnalysis();
    await expect(page.getByRole("button", { name: "Cancel analysis", exact: true })).toHaveCount(0);
    assert.equal(analyses, 31, "Cancellation prevents dispatching the next sprite.");
    assert.ok(state.assignments.every((item) => item.direction === "right"));
    await page.getByRole("button", { name: "Add without sprites", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    assert.equal(state.useSprites, false);
    assert.ok(
      state.assignments.every((item) => !item.approved),
      "Portrait fallback never approves draft sprites.",
    );
    connectionRows = [];
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await expect(connection).toHaveCount(0);
    await openBatch();
    await page.getByRole("button", { name: "Select all", exact: true }).click();
    await expect(connection).toHaveValue("vision");
    await expect(connection.locator("option:checked")).toHaveText("Unavailable connection");
    await expect(page.getByRole("button", { name: "Analyze selected", exact: true })).toBeDisabled();
    await chooseSprite(0);
    await expect(first.getByLabel("Expression", { exact: true })).toBeEnabled();
    assert.equal(analyses, 31, "A missing connection never triggers fallback calls.");
    await page.getByRole("button", { name: "Back", exact: true }).click();
    state.defaultArtworkId = "";
    state.suggestedDefaultArtworkId = "art-27";
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await expect(page.locator(".sprite-thumb").last()).toContainText("Default");
    await expect(add).toBeEnabled();
    await chooseSprite(27);
    await expect(first.getByLabel("Default", { exact: true })).toBeChecked();
    await first.getByLabel("Facing", { exact: true }).selectOption("");
    await expect(add).toBeDisabled();
    await expect(counts).toContainText("1 incomplete");
    await first.getByLabel("Facing", { exact: true }).selectOption("front");
    await first.getByLabel("Expression", { exact: true }).fill("Neutral");
    await first.getByRole("button", { name: "Done", exact: true }).click();
    await expect(add).toBeEnabled();
    const dialog = page.getByRole("dialog");
    const box = await dialog.boundingBox();
    assert.ok(Math.abs(box.x + box.width / 2 - viewport.width / 2) < 2);
    assert.ok(Math.abs(box.y + box.height / 2 - viewport.height / 2) < 2);
    assert.ok(
      await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
      "Dialog fits desktop and phone.",
    );
    assert.ok(
      await page.locator(".sprite-gallery").evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
      "Grid wraps without horizontal scrolling.",
    );
    const footer = await add.boundingBox();
    assert.ok(footer.y >= 0 && footer.y + footer.height <= viewport.height, "Final action stays visible.");
    await page.locator("main").evaluate((node) => {
      node.scrollTop = 0;
    });
    await page.screenshot({ path: `.build-tmp/sprite-setup/review-${viewport.width}.png`, fullPage: true });
    failSave = true;
    await add.click();
    await expect(page.getByRole("alert")).toContainText("Sprite setup changed.");
    await expect(add).toBeEnabled();
    assert.ok(
      state.assignments.every((item) => !item.approved),
      "A rejected final save does not approve saved drafts.",
    );
    await add.click();
    await expect(dialog).toHaveCount(0);
    assert.equal(state.useSprites, true);
    assert.ok(state.assignments.every((item) => item.approved));
    assert.equal(state.defaultArtworkId, "art-27", "Final action accepts the suggested default.");
    assert.equal(state.suggestions.length, 0);
    assert.equal(saves.at(-1).validateForUse, true);
    assert.equal(analyses, 31, "Accepting a review never makes another model call.");
    state.resident = true;
    state.residentToken = "resident-token";
    await page.getByRole("button", { name: "Review resident sprites", exact: true }).click();
    const useSprites = page.getByRole("button", { name: "Use sprites", exact: true });
    await chooseSprite(27);
    await first.getByLabel("Include", { exact: true }).uncheck();
    await expect(useSprites).toBeDisabled();
    await expect(page.getByText("Choose a default sprite.", { exact: true })).toBeVisible();
    await chooseSprite(0);
    await first.getByLabel("Default", { exact: true }).check();
    await chooseSprite(1);
    await first.getByLabel("Expression", { exact: true }).fill("");
    await expect(useSprites).toBeDisabled();
    await first.getByLabel("Include", { exact: true }).uncheck();
    await expect(useSprites).toBeEnabled();
    await useSprites.click();
    await expect(dialog).toHaveCount(0);
    assert.equal(state.assignments[1].included, false);
    assert.equal(state.assignments[1].approved, false, "Excluded incomplete sprites stay unapproved.");
    assert.equal(state.assignments[27].approved, false, "Excluded default stays unapproved.");
    assert.equal(state.defaultArtworkId, "art-0");
    assert.equal(state.manager.artwork.length, 28, "Excluding sprites preserves their artwork.");
    assert.deepEqual(applications, [{ revision: state.revision, residentToken: "resident-token" }]);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Sprite setup browser: review grid, final approval, manual/vision drafts, retry/cancellation and portrait fallback passed on desktop/phone.",
  );
} finally {
  await browser.close();
}
