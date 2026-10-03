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
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let showUsageMeter = true,
      usageReads = 0;
    let verbose = false,
      engineEnabled = false,
      patchCount = 0,
      failPatch = false;
    await page.route("http://villages.test/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<style>html,body{margin:0;background:#171b25;color:white;font-family:Arial}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = structuredClone(fixture);
      if (path.endsWith("/rooms/active")) value = { session: null, debugDiscardEnabled: false };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/rooms/archive")) value = { visits: [], total: 0 };
      else if (path.endsWith("/usage")) {
        usageReads++;
        value = {
          since: new Date().toISOString(),
          totals: { requests: 18, tokens: 32000, dollars: 0.42, unknown: 2 },
          today: { requests: 18, tokens: 32000, dollars: 0.42, unknown: 2 },
          purposes: {},
          running: 1,
          requests: [],
          scope: "Villages only",
          error: "",
        };
      } else if (path.endsWith("/debug/runtime")) {
        if (route.request().method() === "PATCH") {
          if (failPatch) {
            await route.fulfill({
              status: 500,
              contentType: "application/json",
              body: JSON.stringify({ error: "Could not save diagnostics" }),
            });
            return;
          }
          const body = route.request().postDataJSON();
          if (typeof body.verbose === "boolean") verbose = body.verbose;
          if (typeof body.showUsageMeter === "boolean") showUsageMeter = body.showUsageMeter;
          patchCount++;
        }
        value = { verbose, effective: verbose || engineEnabled, engineEnabled, showUsageMeter };
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: /^(Open settings menu|More)$/, exact: true }).click();
    await page.getByRole("button", { name: "DEBUG Settings", exact: true }).click();
    const meter = page.getByRole("complementary", { name: "Villages AI usage" });
    await expect(meter).toContainText("18 requests");
    const meterToggle = page.getByRole("checkbox", { name: "Show AI usage meter", exact: true });
    await expect(meterToggle).toBeChecked();
    await meterToggle.click();
    await expect(meter).toHaveCount(0);
    const readsAfterHide = usageReads;
    await page.waitForTimeout(1800);
    assert.equal(usageReads, readsAfterHide);
    await meterToggle.click();
    await expect(meter).toBeVisible();
    patchCount = 0;
    const toggle = page.getByRole("checkbox", { name: "Verbose runtime logging", exact: true });
    await expect(toggle).toBeEnabled();
    await expect(toggle).not.toBeChecked();
    await toggle.click();
    await expect.poll(() => patchCount).toBe(1);
    await expect(page.getByText("Terminal logging: on.", { exact: true })).toBeVisible();
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: /^(Open settings menu|More)$/, exact: true }).click();
    await page.getByRole("button", { name: "DEBUG Settings", exact: true }).click();
    await expect(toggle).toBeChecked();
    failPatch = true;
    await toggle.click();
    await expect(page.getByRole("alert").filter({ hasText: "Could not save diagnostics" })).toBeVisible();
    await expect(toggle).toBeChecked();
    failPatch = false;
    await toggle.click();
    await expect(page.getByText("Terminal logging: off.", { exact: true })).toBeVisible();
    engineEnabled = true;
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: /^(Open settings menu|More)$/, exact: true }).click();
    await page.getByRole("button", { name: "DEBUG Settings", exact: true }).click();
    await expect(toggle).not.toBeChecked();
    await expect(page.getByText("Terminal logging: on (also enabled by DEBUG_AGENTS).", { exact: true })).toBeVisible();
    const box = await toggle.boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= width);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("Verbose logging toggle, persistence, failed saves and layout passed on desktop and phones.");
} finally {
  await browser.close();
}
