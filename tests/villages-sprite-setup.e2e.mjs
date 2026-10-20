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
    await expect(coldPage.getByRole("button", { name: "Add without using sprites", exact: true })).toBeEnabled();
    await coldPage.getByRole("button", { name: "Add without using sprites", exact: true }).click();
    await expect(coldPage.getByText("Bupkis added", { exact: true })).toBeVisible();
    assert.equal(await coldPage.locator("#app").getAttribute("data-sprite-revision"), "undefined");
    holdRead = false;
    releaseRead();
    for (const exit of ["Back", "Add without using sprites"]) {
      await coldPage.getByRole("button", { name: "Choose Bupkis" }).click();
      await expect(coldPage.getByText("Preparing sprites…", { exact: true })).toBeVisible();
      if (exit === "Back") {
        const status = await coldPage.getByText("Preparing sprites…", { exact: true }).boundingBox();
        assert.ok(status.y >= 0 && status.y + status.height <= viewport.height, "Loading status stays in view.");
        await coldPage.screenshot({ path: `.build-tmp/sprite-setup/loading-${viewport.width}.png`, fullPage: true });
      }
      await expect(coldPage.getByRole("button", { name: "Set up manually", exact: true })).toBeDisabled();
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
    await coldPage.getByRole("button", { name: "Add without using sprites", exact: true }).click();
    releaseImport();
    await expect(coldPage.getByText("Move-in failed.", { exact: true })).toBeVisible();
    await expect(coldPage.getByRole("button", { name: "Set up manually", exact: true })).toBeEnabled();
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
        assert.equal(body.revision, state.revision);
        state.revision++;
        Object.assign(state, {
          assignments: body.assignments,
          defaultArtworkId: body.defaultArtworkId,
          useSprites: body.useSprites,
        });
        state.suggestions = state.suggestions.filter((item) => body.pendingSuggestionIds.includes(item.artworkId));
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
    await expect(
      page.getByText("28 total · 28 need analysis · 0 need review · 0 approved", { exact: true }),
    ).toBeVisible();
    const portrait = page.locator(".sprite-portrait");
    await expect(portrait.locator("img")).toBeVisible();
    assert.ok(
      await portrait.evaluate((frame) => {
        const bounds = frame.getBoundingClientRect();
        return (
          bounds.width <= 110 &&
          bounds.height <= 110 &&
          getComputedStyle(frame).overflow === "hidden" &&
          frame.querySelector("img").offsetParent === frame
        );
      }),
      "Engine's enlarged crop stays clipped inside the compact portrait frame",
    );
    await page.screenshot({ path: `.build-tmp/sprite-setup/compact-${viewport.width}.png`, fullPage: true });
    assert.equal(analyses, 0);
    const connection = page.getByLabel("Sprite analysis connection", { exact: true });
    await expect(page.getByRole("button", { name: "Analyze sprites", exact: true })).toBeDisabled();
    await expect(connection.locator("option")).toHaveCount(2);
    await connection.selectOption("vision");
    assert.equal(analyses, 0, "Selecting a connection does not make a model call.");
    await expect(page.locator(".sprite-grid")).toHaveCount(0);
    await page.getByRole("button", { name: "Set up manually" }).click();
    await expect(page.locator(".sprite-thumb")).toHaveCount(28);
    await expect(page.locator(".sprite-tile")).toHaveCount(1);
    const first = page.locator(".sprite-tile").first();
    await first.getByLabel("Expression", { exact: true }).fill("Listening");
    await first.getByLabel("Use when", { exact: true }).fill("Listening closely.");
    await first.getByLabel("Facing", { exact: true }).selectOption("left");
    await first.getByLabel("Default", { exact: true }).check();
    await expect(
      page.getByText("28 total · 27 need analysis · 1 need review · 0 approved", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await expect(
      page.getByText("28 total · 27 need analysis · 1 need review · 0 approved", { exact: true }),
    ).toBeVisible();
    await expect(connection).toHaveValue("vision");
    assert.equal(state.assignments[0].approved, false, "Manual editing and saving do not approve a sprite.");
    await page.getByRole("button", { name: "Review sprites" }).click();
    await page.getByText("Batch edit", { exact: true }).click();
    await first.getByLabel("Select", { exact: true }).check();
    await page.getByText("Batch edit", { exact: true }).click();
    await page.getByRole("button", { name: "Analyze selected" }).click();
    await expect(page.getByRole("button", { name: "Approve sprite", exact: true })).toBeEnabled();
    await expect(first.getByLabel("Expression", { exact: true })).toHaveValue("Relaxed art-0");
    await page.getByRole("button", { name: "Approve sprite", exact: true }).click();
    await expect(first.getByLabel("Expression", { exact: true })).toHaveValue("Relaxed art-0");
    await first.getByLabel("Use when", { exact: true }).fill("Calm and attentive.");
    await expect(
      page.getByText("28 total · 27 need analysis · 1 need review · 0 approved", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await page.getByRole("button", { name: "Review sprites" }).click();
    await expect(first.getByLabel("Use when", { exact: true })).toHaveValue("Calm and attentive.");
    await expect(
      page.getByText("28 total · 27 need analysis · 1 need review · 0 approved", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Add villager", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Approve all", exact: true }).click();
    await expect(
      page.getByText("28 total · 27 need analysis · 0 need review · 1 approved", { exact: true }),
    ).toBeVisible();
    const dialog = page.getByRole("dialog");
    const box = await dialog.boundingBox();
    assert.ok(Math.abs(box.x + box.width / 2 - viewport.width / 2) < 2);
    assert.ok(Math.abs(box.y + box.height / 2 - viewport.height / 2) < 2);
    assert.ok(
      await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
      "dialog fits desktop and phone",
    );
    await page.screenshot({ path: `.build-tmp/sprite-setup/review-${viewport.width}.png`, fullPage: true });
    await page.getByRole("button", { name: "Add villager", exact: true }).click();
    await expect(page.getByText("Bupkis added", { exact: true })).toBeVisible();
    assert.equal(state.useSprites, true);
    assert.equal(state.assignments[0].useWhen, "Calm and attentive.");
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await page.getByRole("button", { name: "Review sprites" }).click();
    await page.getByText("Batch edit", { exact: true }).click();
    await page.getByRole("button", { name: "Select all", exact: true }).click();
    failAt = analyses + 8;
    await page.getByRole("button", { name: "Analyze selected" }).click();
    await expect(page.getByText("Analysis stopped · 7 of 28 completed this run", { exact: true })).toBeVisible();
    assert.equal(state.suggestions.length, 7, "Completed suggestions survive a later sprite failure.");
    const beforeResume = analyzedIds.length;
    await page.getByRole("button", { name: "Analyze remaining" }).click();
    await expect(
      page.getByText("28 total · 0 need analysis · 28 need review · 0 approved", { exact: true }),
    ).toBeVisible();
    assert.equal(state.suggestions.length, 28);
    assert.ok(finalizations.slice(beforeResume, -1).every((value) => value === false));
    assert.equal(finalizations.at(-1), true, "Only the final image completes default selection.");
    assert.equal(state.suggestedDefaultArtworkId, "art-27");
    await page.getByRole("button", { name: "Approve all", exact: true }).click();
    await expect(first.getByLabel("Default", { exact: true })).toBeChecked();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    assert.equal(state.defaultArtworkId, "art-0", "Approval preserves the manually selected default.");
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await page.getByRole("button", { name: "Review sprites" }).click();
    await page.getByText("Batch edit", { exact: true }).click();
    assert.deepEqual(
      analyzedIds.slice(beforeResume),
      Array.from({ length: 21 }, (_, index) => `art-${index + 7}`),
      "Resuming skips every saved suggestion and retries only unfinished sprites.",
    );
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(first.getByLabel("Expression", { exact: true })).toHaveValue("Relaxed art-1");
    await expect(page.locator(".sprite-tile")).toHaveCount(1);
    await page.getByLabel("Batch facing", { exact: true }).selectOption("right");
    await page.getByRole("button", { name: "Select all", exact: true }).click();
    await page.getByRole("button", { name: "Apply to selected", exact: true }).click();
    await expect(first.getByLabel("Facing", { exact: true })).toHaveValue("right");
    await expect(
      page.getByText("28 total · 0 need analysis · 28 need review · 0 approved", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    assert.ok(
      state.assignments.every((item) => item.direction === "right" && item.name),
      "Batch overrides keep proposed fields without approving them.",
    );
    assert.equal(state.suggestions.length, 0);
    assert.ok(state.assignments.every((item) => item.approved === false));
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await page.getByRole("button", { name: "Review sprites" }).click();
    await expect(first.getByLabel("Facing", { exact: true })).toHaveValue("right");
    await page.getByText("Batch edit", { exact: true }).click();
    await page.getByRole("button", { name: "Select all", exact: true }).click();
    holdAnalysis = true;
    await page.getByRole("button", { name: "Analyze selected" }).click();
    await expect(page.getByRole("button", { name: "Cancel analysis", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Cancel analysis", exact: true }).click();
    releaseAnalysis();
    await expect(page.getByRole("button", { name: "Cancel analysis", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Analyze remaining", exact: true })).toBeDisabled();
    assert.equal(analyses, 31, "Cancellation prevents dispatching the next sprite.");
    assert.ok(
      state.assignments.every((item) => item.direction === "right"),
      "Cancellation preserves reviewed assignments.",
    );
    await page.getByRole("button", { name: "Approve all", exact: true }).click();
    await expect(
      page.getByText("28 total · 0 need analysis · 0 need review · 28 approved", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Add without using sprites", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    assert.equal(state.useSprites, false);
    assert.equal(state.manager.artwork.length, 28);
    assert.equal(analyses, 31);
    connectionRows = [];
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await expect(connection).toHaveValue("vision");
    await expect(connection.locator("option:checked")).toHaveText("Unavailable connection");
    await page.getByRole("button", { name: "Review sprites" }).click();
    await page.getByText("Batch edit", { exact: true }).click();
    await page.getByRole("button", { name: "Select all", exact: true }).click();
    await expect(page.getByRole("button", { name: "Analyze selected", exact: true })).toBeDisabled();
    await expect(first.getByLabel("Expression", { exact: true })).toBeEnabled();
    assert.equal(analyses, 31, "A missing saved connection does not trigger fallback.");
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Sprite setup browser: compact preview, manual and vision review, saved drafts and portrait fallback passed on desktop/phone.",
  );
} finally {
  await browser.close();
}
