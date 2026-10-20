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
      state.assignments.push({ artworkId, name: "", useWhen: "", direction: "", included: true });
    }
    let analyses = 0;
    let failAt = 0;
    let holdAnalysis = false;
    let releaseAnalysis;
    const analyzedIds = [];
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
        analyses++;
        assert.equal(body.artworkIds.length, 1, "Each request analyzes one sprite and returns saved progress.");
        assert.equal(body.revision, state.revision);
        const artworkId = body.artworkIds[0];
        analyzedIds.push(artworkId);
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
        state.suggestedDefaultArtworkId = "art-0";
      }
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(state) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await expect(page.getByText("0 ready · 28 unresolved")).toBeVisible();
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
    await expect(page.locator(".sprite-grid")).toHaveCount(0);
    await page.getByRole("button", { name: "Set up manually" }).click();
    await expect(page.locator(".sprite-thumb")).toHaveCount(28);
    await expect(page.locator(".sprite-tile")).toHaveCount(1);
    const first = page.locator(".sprite-tile").first();
    await first.getByLabel("Expression", { exact: true }).fill("Listening");
    await first.getByLabel("Use when", { exact: true }).fill("Listening closely.");
    await first.getByLabel("Facing", { exact: true }).selectOption("left");
    await first.getByLabel("Default", { exact: true }).check();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await page.getByRole("button", { name: "Choose Bupkis" }).click();
    await expect(page.getByText("1 ready · 27 unresolved")).toBeVisible();
    await page.getByRole("button", { name: "Review sprites" }).click();
    await page.getByText("Batch edit", { exact: true }).click();
    await first.getByLabel("Select", { exact: true }).check();
    await page.getByText("Batch edit", { exact: true }).click();
    await page.getByRole("button", { name: "Analyze selected" }).click();
    await expect(page.getByText("1 suggestions", { exact: true })).toBeVisible();
    await expect(first.getByLabel("Expression", { exact: true })).toHaveValue("Relaxed art-0");
    await page.getByRole("button", { name: "Apply suggestions", exact: true }).click();
    await expect(first.getByLabel("Expression", { exact: true })).toHaveValue("Relaxed art-0");
    await first.getByLabel("Use when", { exact: true }).fill("Calm and attentive.");
    const dialog = page.getByRole("dialog");
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
    await expect(page.getByText("7 of 28 analyzed · Resume remaining", { exact: true })).toBeVisible();
    assert.equal(state.suggestions.length, 7, "Completed suggestions survive a later sprite failure.");
    const beforeResume = analyzedIds.length;
    await page.getByRole("button", { name: "Analyze remaining" }).click();
    await expect(page.getByText("21 of 21 analyzed", { exact: true })).toBeVisible();
    assert.equal(state.suggestions.length, 28);
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
    await expect(page.getByRole("button", { name: "Apply suggestions", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Back", exact: true }).click();
    assert.ok(
      state.assignments.every((item) => item.direction === "right" && item.name),
      "Batch overrides accept proposals without losing their other fields.",
    );
    assert.equal(state.suggestions.length, 0);
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
    await expect(page.getByRole("button", { name: "Analyze remaining", exact: true })).toBeEnabled();
    assert.equal(analyses, 31, "Cancellation prevents dispatching the next sprite.");
    assert.ok(
      state.assignments.every((item) => item.direction === "right"),
      "Cancellation preserves reviewed assignments.",
    );
    await page.getByRole("button", { name: "Add without using sprites", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    assert.equal(state.useSprites, false);
    assert.equal(state.manager.artwork.length, 28);
    assert.equal(analyses, 31);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Sprite setup browser: compact preview, manual and vision review, saved drafts and portrait fallback passed on desktop/phone.",
  );
} finally {
  await browser.close();
}
