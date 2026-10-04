import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

// Opt-in integration QA: the Engine serves its existing shell, but this browser
// alone receives the candidate package and synthetic Village data. Nothing is installed.
const base = process.env.VILLAGES_ENGINE_URL;
if (!base) throw new Error("Set VILLAGES_ENGINE_URL to an already-running Engine for shell validation.");
const output = resolve(process.env.VILLAGES_VISUAL_OUTPUT ?? "artifacts/warm-engine-shell");
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync("C:/Program Files/Google/Chrome/Application/chrome.exe")
    ? { executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" }
    : {}),
});
const manifest = JSON.parse(readFileSync("packages/villages/manifest.json", "utf8"));
try {
  for (const viewport of [
    { width: 1917, height: 872 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport, hasTouch: viewport.width < 705 });
    const blockedWrites = [];
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      if (url.origin !== new URL(base).origin) return route.abort();
      if (path === "/api/capability-packages/villages/client")
        return route.fulfill({ contentType: "application/javascript", path: resolve("packages/villages/client.js") });
      if (/^\/api\/capability-packages\/[^/]+\/client$/.test(path))
        return route.fulfill({ contentType: "application/javascript", body: "" });
      if (path === "/api/capability-packages/installed") {
        const original = await route.fetch();
        const installed = await original.json();
        const villages = installed.find((item) => item.id === "villages");
        if (!villages) throw new Error("Running Engine has no Villages package entry for shell QA.");
        return route.fulfill({
          json: [{ ...villages, status: "active", readiness: "ready", version: manifest.version, manifest }],
        });
      }
      if (path.startsWith("/api/villages")) {
        let value = snapshot;
        if (path.endsWith("/town-map")) value = { image: mapImage };
        else if (path.endsWith("/rooms/active")) value = { session: null };
        else if (path.endsWith("/rooms/archive")) value = { visits: [], total: 0 };
        else if (path.endsWith("/catalog")) value = { characters: [] };
        else if (path.endsWith("/personas")) value = { personas: [] };
        else if (path.endsWith("/lorebooks")) value = { books: [] };
        else if (path.endsWith("/debug/runtime")) value = { showUsageMeter: false };
        return route.fulfill({ json: value });
      }
      if (path === "/api/characters/summaries") return route.fulfill({ json: [] });
      if (path === "/api/connections/refresh-local-context") return route.fulfill({ json: { updated: [] } });
      // Block every real Engine write, including automatic achievements/preferences.
      if (!["GET", "HEAD"].includes(route.request().method())) {
        blockedWrites.push({ path, method: route.request().method() });
        return route.fulfill({ json: {} });
      }
      return route.continue();
    });
    await page.goto(base);
    const openVillages = page.getByRole("tab", { name: "Open Villages", exact: true });
    try {
      await expect(openVillages).toBeVisible({ timeout: 20000 });
    } catch (error) {
      console.log(JSON.stringify({ blockedWrites }));
      throw error;
    }
    await page.keyboard.press("Escape");
    await openVillages.click();
    const home = page.locator(".marinara-capability-villages-home-full");
    await expect(home).toBeVisible({ timeout: 20000 });
    await expect(home).toHaveAttribute("data-mobile", String(viewport.width < 705));
    await expect(home.getByRole("button", { name: /^(Zoom in|Zoom out|Reset map view)$/ })).toHaveCount(0);
    for (const button of await home
      .locator(
        ".marinara-capability-villages-explore-nav button, .marinara-capability-villages-explore-notices, .marinara-capability-villages-home-bar .marinara-capability-villages-icon-button",
      )
      .all()) {
      const color = await button.evaluate((el) => getComputedStyle(el).color);
      await expect(button.locator("svg")).toHaveCSS("color", color);
    }
    await page.screenshot({ path: resolve(output, `warm-engine-map-${viewport.width}.png`) });
    await home.getByRole("button", { name: "Places", exact: true }).click();
    const panel = page.getByRole("dialog", { name: "Places", exact: true });
    await expect(panel).toBeVisible();
    const bounds = await panel.boundingBox();
    const host = await home.boundingBox();
    if (bounds.y < host.y || bounds.x < host.x || bounds.x + bounds.width > host.x + host.width + 1)
      throw new Error("Exploration panel escaped Engine's capability host.");
    await page.screenshot({ path: resolve(output, `warm-engine-places-${viewport.width}.png`) });
    await page.close();
  }
  console.log(
    "Warm exploration rendered inside the unchanged running Engine shell at desktop and mobile sizes; all Village requests mocked and all Engine writes blocked.",
  );
} finally {
  await browser.close();
}
