import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot as fixture, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    let previews = 0,
      paid = 0;
    await page.route("http://villages.test/", (r) =>
      r.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<style>html,body{margin:0;background:#171b25;color:white;font:16px Arial}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = structuredClone(fixture);
      if (path.endsWith("/catalog")) value = { characters: [] };
      else if (path.endsWith("/personas")) value = { personas: [] };
      else if (path.endsWith("/lorebooks")) value = { books: [] };
      else if (path.endsWith("/rooms/active")) value = { session: null };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/usage/preview")) {
        previews++;
        value = {
          requests: 0,
          residents: [{ id: "a", name: "A", requests: 0 }],
          dollars: { min: 0.08, max: 0.11 },
          unknownCosts: 1,
          note: "Saved responses are reused.",
        };
      } else if (path.endsWith("/usage"))
        value = {
          since: new Date().toISOString(),
          totals: { requests: 18, tokens: 32000, dollars: 0.42, unknown: 2 },
          today: { requests: 18, tokens: 32000, dollars: 0.42, unknown: 2 },
          purposes: {},
          requests: [],
          running: 1,
          scope: "Villages only",
          bursts: [
            {
              id: "j",
              label: "A's routine profile",
              status: "queued",
              cause: "Player: regenerate Agenda",
              remainingRequests: 1,
              remainingBlocks: 12,
            },
          ],
        };
      else if (path.endsWith("/debug/runtime")) value = { showUsageMeter: true, verbose: false, effective: false };
      else if (/generate|regenerate|rooms\/turn/u.test(path)) paid++;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: /^(Open settings menu|More)$/, exact: true }).click();
    await page.getByRole("button", { name: "Village Management", exact: true }).click();
    await page.getByRole("button", { name: "Village Settings", exact: true }).click();
    await expect(page.getByText(/0 expected AI requests/).first()).toBeVisible();
    await expect(page.getByText(/1 with unknown cost/).first()).toBeVisible();
    const meter = page.getByRole("complementary", { name: "Villages AI usage" });
    await expect(meter).toContainText("18 requests");
    await page.evaluate(() => {
      const button = document.createElement("button");
      button.textContent = "Test fullscreen";
      button.style.cssText = "position:fixed;top:8px;left:8px;z-index:2147483647";
      button.onclick = () => document.querySelector("marinara-capability-villages").requestFullscreen();
      document.body.append(button);
    });
    await page.getByRole("button", { name: "Test fullscreen", exact: true }).click();
    await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
    await expect.poll(() => meter.evaluate((element) => document.fullscreenElement?.contains(element))).toBe(true);
    await meter.getByRole("button", { name: /Villages AI usage/ }).click();
    await expect(meter).toContainText("1 requests remaining");
    await expect(meter).toContainText("Player: regenerate Agenda");
    const box = await meter.boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= width + 1);
    await page.screenshot({ path: resolve("artifacts/usage-preview-" + width + ".png") });
    assert.ok(previews > 0);
    assert.equal(paid, 0);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("Preview counts, unknown costs and meter details/fullscreen layout passed on desktop and phones");
} finally {
  await browser.close();
}
