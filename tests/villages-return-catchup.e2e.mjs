import assert from "node:assert/strict";
import { resolve } from "node:path";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as fixture, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await mockEngineLookups(page);
    let reads = 0;
    let continued = 0;
    let batch = {
      id: "batch",
      status: "failed",
      completed: 0,
      total: 1,
      settlementRequired: false,
      issue: "generation",
    };
    await page.route("http://villages.test/", (route) =>
      fulfill(route, {
        status: 200,
        contentType: "text/html",
        body: "<style>html,body{margin:0;font-family:Arial}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = structuredClone(fixture);
      if (path.endsWith("/background/catchup/continue")) {
        continued++;
        batch = null;
        value = { batch: null };
      } else if (path.endsWith("/background/catchup")) {
        if (++reads === 1) {
          await fulfill(route, { status: 500, json: { error: "Catch-up status is unavailable." } });
          return;
        }
        value = { batch };
      } else if (path.endsWith("/rooms/active")) value = { session: null, debugDiscardEnabled: false };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/rooms/archive")) value = { visits: [], total: 0 };
      await fulfill(route, { status: 200, json: value });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await expect(page.getByRole("alert").filter({ hasText: "Catch-up status is unavailable" })).toBeVisible();
    const dialog = page.getByRole("dialog", { name: "Returning to the Village" });
    await expect(dialog).toBeVisible({ timeout: 8000 });
    await expect(dialog).toContainText("The resident activity request did not finish");
    await expect(dialog).toContainText("additional model request");
    await expect(dialog.getByRole("button", { name: "Retry" })).toBeVisible();
    await dialog.getByRole("button", { name: "Continue to Village" }).click();
    await expect(dialog).toBeHidden();
    assert.equal(continued, 1);
    await page.close();
  }
});
