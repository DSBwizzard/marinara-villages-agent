import assert from "node:assert/strict";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { fastExpect } from "./fixtures/fast-browser-expect.mjs";
import { snapshot, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

// Full application integration stays separate from the substantial resident
// behavior suite, so unrelated settings edits need only this short journey.
const expect = fastExpect({ timeout: 15000 });
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [1917, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, hasTouch: width === 390 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("http://sprite-entry.test/", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<style>html,body{margin:0}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/villages**", (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = snapshot;
      if (path.endsWith("/debug/runtime")) value = { showUsageMeter: false };
      else if (path.endsWith("/sprites/manager"))
        value = {
          version: 1,
          artwork: [],
          expressions: [],
          assignments: [],
          framing: { mode: "full", cropPercent: 58 },
        };
      else if (path.endsWith("/rooms/active")) value = { session: null };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/catalog")) value = { characters: [] };
      else if (path.endsWith("/lorebooks")) value = { books: [] };
      else if (path.endsWith("/personas")) value = { personas: [] };
      else if (path.endsWith("/interpretation-settings"))
        value = { settings: { decisionsEnabled: false }, status: { available: false } };
      return route.fulfill({ contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://sprite-entry.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: "More", exact: true }).click();
    await page.getByRole("button", { name: /^Villagers \(/ }).click();
    await page.getByRole("button", { name: "Open Mara profile" }).click();
    await page
      .getByRole("button", { name: /Manage sprites ·/ })
      .first()
      .focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Mara’s Sprite Manager" })).toBeFocused();
    await expect(page.getByText(/No sprites assigned yet/)).toBeVisible();
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log("Full application sprite entry, keyboard focus and desktop/phone activation passed.");
