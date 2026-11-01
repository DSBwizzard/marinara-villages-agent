import { mockEngineLookups, fulfill, abort } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
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
async function verifyStableLoading(viewport, spriteCount, loseImportResponse = false) {
  const touch = viewport.width < 1000;
  const page = await browser.newPage({ viewport, hasTouch: touch });
  await mockEngineLookups(page);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const cold = {
    revision: 0,
    manager: { version: 1, artwork: [], expressions: [], assignments: [], framing: { mode: "full" } },
    assignments: [],
    defaultArtworkId: "",
    useSprites: false,
    errors: {},
    files: spriteCount ? [{ filename: "full_one.png", url: mapImage }] : [],
    resident: false,
    residentToken: "",
  };
  const prepared = structuredClone(cold);
  prepared.revision = spriteCount ? 1 : 0;
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
      view: "front",
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
  let imported = false;
  await page.route("http://villages.test/", (route) =>
    fulfill(route, { contentType: "text/html", body: '<div id="app"></div>' }),
  );
  await page.route("**/api/connections", (route) => fulfill(route, { contentType: "application/json", body: "[]" }));
  await page.route("**/api/villages/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let value = cold;
    if (path.endsWith("/prepare")) {
      await importing;
      imported = true;
      if (loseImportResponse) {
        await fulfill(route, {
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "The import response was interrupted." }),
        });
        return;
      }
      value = prepared;
    } else if (path.endsWith("/save")) {
      const body = route.request().postDataJSON();
      saves.push(body);
      assert.equal(
        body.revision,
        imported ? prepared.revision : cold.revision,
        "Save uses the settled import revision.",
      );
      value = { ...prepared, revision: prepared.revision + 1, useSprites: body.useSprites };
    } else {
      assert.equal(route.request().method(), "GET", "Loading and skipping never requests analysis or applies sprites.");
      await reading;
      if (imported) value = prepared;
    }
    await fulfill(route, { contentType: "application/json", body: JSON.stringify(value) });
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
await withBrowser(browser, async () => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 568 },
    { width: 844, height: 390 },
    { width: 1440, height: 1000 },
  ]) {
    for (const spriteCount of [18, 0]) await verifyStableLoading(viewport, spriteCount);
    await verifyStableLoading(viewport, 18, true);
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
      defaultArtworkId: "",
      useSprites: false,
      errors: {},
      files: [{ filename: "full_one.png", url: "/one.png" }],
      resident: false,
      residentToken: "",
    };
    let releaseRead, releaseImport;
    let holdRead = true,
      writes = 0;
    await coldPage.route("http://villages.test/", (route) =>
      fulfill(route, { contentType: "text/html", body: '<div id="app"></div>' }),
    );
    await coldPage.route("**/api/connections", (route) =>
      fulfill(route, { contentType: "application/json", body: "[]" }),
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
      await fulfill(route, { contentType: "application/json", body: JSON.stringify(cold) }).catch(() => {});
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
    await mockEngineLookups(page);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const state = {
      revision: 1,
      manager: { version: 1, artwork: [], expressions: [], assignments: [], framing: { mode: "full" } },
      assignments: [],
      defaultArtworkId: "",
      useSprites: false,
      errors: {},
      files: [],
      resident: false,
      residentToken: "",
    };
    for (let index = 0; index < 28; index++) {
      const artworkId = "art-" + index;
      state.manager.artwork.push({
        id: artworkId,
        name: "full_expression-" + index + ".png",
        rendered: { url: mapImage },
        warnings: [],
      });
      state.assignments.push({
        artworkId,
        name: "Expression " + index,
        view: "front",
        included: true,
        approved: false,
      });
    }
    const saves = [],
      applications = [],
      requests = [];
    let failSave = false,
      loseSaveResponse = false;
    page.on("request", (request) => requests.push(request.url()));
    await page.route("http://villages.test/", (route) =>
      fulfill(route, { contentType: "text/html", body: '<div id="app"></div>' }),
    );
    await page.route("**/api/villages/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      const body = route.request().postDataJSON();
      if (path.endsWith("/save")) {
        saves.push(body);
        if (failSave) {
          failSave = false;
          state.revision++;
        }
        if (body.revision !== state.revision) {
          await fulfill(route, {
            status: 409,
            contentType: "application/json",
            body: JSON.stringify({ error: "Sprite setup changed. Reopen it before saving." }),
          });
          return;
        }
        Object.assign(state, {
          assignments: body.assignments,
          defaultArtworkId: body.defaultArtworkId,
          useSprites: body.useSprites,
        });
        state.revision++;
        if (loseSaveResponse) {
          loseSaveResponse = false;
          await fulfill(route, { contentType: "application/json", body: "{" });
          return;
        }
      } else if (path.endsWith("/apply")) applications.push(body);
      else assert.ok(path.endsWith("/settled"), "Setup only reads and saves, without AI requests");
      await fulfill(route, { contentType: "application/json", body: JSON.stringify(state) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const dialog = page.getByRole("dialog", { name: "Bupkis sprite setup", exact: true });
    const popup = page.getByRole("dialog", { name: "Bupkis sprite review", exact: true });
    const chooseSprite = async (index) => {
      await page.locator(".sprite-thumb").nth(index).click();
      await expect(popup).toBeVisible();
    };
    const closeSprite = async () => {
      await popup.getByRole("button", { name: "Done", exact: true }).click();
    };
    await page.getByRole("button", { name: "Choose Bupkis", exact: true }).click();
    await expect(dialog).toBeVisible();
    await expect(page.getByText("Use front views or side views facing right.", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Sprite analysis connection")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Analyze/ })).toHaveCount(0);
    await chooseSprite(0);
    await expect(popup.getByLabel("Use when", { exact: true })).toHaveCount(0);
    await popup.getByLabel("Expression", { exact: true }).fill("Listening");
    await popup.getByLabel("Facing", { exact: true }).selectOption("side");
    await popup.getByLabel("Default", { exact: true }).check();
    await closeSprite();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    assert.equal(state.assignments[0].view, "side");
    assert.ok(
      state.assignments.every((item) => !item.approved),
      "Closing setup only saves a draft",
    );
    state.resident = true;
    state.residentToken = "resident-token";
    await page.getByRole("button", { name: "Review resident sprites", exact: true }).click();
    await chooseSprite(1);
    await expect(popup.getByLabel("Facing", { exact: true })).toHaveValue("front");
    await closeSprite();
    await chooseSprite(2);
    await popup.getByLabel("Expression", { exact: true }).fill("");
    await closeSprite();
    await expect(page.getByRole("button", { name: "Use sprites", exact: true })).toBeDisabled();
    await chooseSprite(2);
    await popup.getByLabel("Include", { exact: true }).uncheck();
    await closeSprite();
    failSave = true;
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("changed");
    const failedSaves = saves.length;
    await page.getByRole("button", { name: "Discard edits & reload", exact: true }).click();
    assert.equal(saves.length, failedSaves, "Conflict recovery never replays a stale write");
    loseSaveResponse = true;
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("invalid or empty JSON response");
    const lostSaves = saves.length;
    await page.getByRole("button", { name: "Discard edits & reload", exact: true }).click();
    assert.equal(saves.length, lostSaves, "Lost-response recovery reads the saved draft");
    await chooseSprite(0);
    await expect(popup.getByLabel("Expression", { exact: true })).toHaveValue("Listening");
    await page.screenshot({ path: ".build-tmp/sprite-setup/manual-" + viewport.width + ".png", fullPage: true });
    await closeSprite();
    await page.getByRole("button", { name: "Use sprites", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    assert.ok(
      state.assignments.every((item) => item.approved),
      "Final action explicitly approves the complete set",
    );
    assert.equal(applications.length, 1);
    assert.deepEqual(applications[0], { revision: state.revision, residentToken: "resident-token" });
    assert.equal(requests.filter((url) => /\/analyze|\/api\/connections/.test(url)).length, 0);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Sprite setup browser: modal sprite review, prepared markers, draft persistence, final approval, manual naming, conflict recovery and portrait fallback passed on desktop/phone.",
  );
});
