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
      else if (path.endsWith("/debug/runtime")) {
        if (route.request().method() === "PATCH") {
          if (failPatch) {
            await route.fulfill({
              status: 500,
              contentType: "application/json",
              body: JSON.stringify({ error: "Could not save diagnostics" }),
            });
            return;
          }
          verbose = route.request().postDataJSON().verbose;
          patchCount++;
        }
        value = { verbose, effective: verbose || engineEnabled, engineEnabled };
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: "Open settings menu", exact: true }).click();
    await page.getByRole("button", { name: "DEBUG Settings", exact: true }).click();
    const toggle = page.getByRole("checkbox", { name: "Verbose runtime logging", exact: true });
    await expect(toggle).toBeEnabled();
    await expect(toggle).not.toBeChecked();
    await toggle.click();
    await expect.poll(() => patchCount).toBe(1);
    await expect(page.getByText("Terminal logging: on.", { exact: true })).toBeVisible();
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: "Open settings menu", exact: true }).click();
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
    await page.getByRole("button", { name: "Open settings menu", exact: true }).click();
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
