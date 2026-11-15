import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as base } from "./fixtures/villages-scene-browser.fixture.mjs";

// Test cases: village-clock, founding-timezone
const browser = await chromium.launch({
  headless: true,
});
await mkdir(".build-tmp/clock-visual", { recursive: true });
await withBrowser(browser, async () => {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, timezoneId: "Asia/Tokyo" });
    await mockEngineLookups(context);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let founding = false;
    let serverInstant = "2026-10-15T02:30:00Z";
    const state = () => {
      const value = structuredClone(base);
      value.isFounded = !founding;
      value.village.timeZone = "America/Los_Angeles";
      value.village.instant = serverInstant;
      value.clock = { revision: 2, timeZone: "America/Los_Angeles" };
      return value;
    };
    await page.route("http://villages.test/", (route) =>
      fulfill(route, {
        contentType: "text/html",
        body: "<style>html,body{margin:0;background:#171b25;color:white;font:16px Arial}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/background/presence"))
        return fulfill(route, { json: { status: "ready", snapshot: state() } });
      let value = state();
      const status = 200;
      if (path.endsWith("/rooms/active")) value = { session: null };
      else if (path.endsWith("/connections"))
        value = { systemConnectionId: "", narrationConnectionId: "", imageConnectionId: "" };
      else if (path.endsWith("/catalog")) value = { characters: [] };
      else if (path.endsWith("/personas")) value = { personas: [] };
      else if (path.endsWith("/lorebooks")) value = { books: [] };
      else if (path.endsWith("/debug/runtime")) value = { showUsageMeter: false, verbose: false, effective: false };
      else if (path.endsWith("/usage/preview")) value = { requests: 0, residents: [], dollars: null, unknownCosts: 0 };
      else if (path.endsWith("/usage"))
        value = {
          since: new Date().toISOString(),
          totals: { requests: 0, tokens: 0, dollars: 0, unknown: 0 },
          today: {},
          purposes: {},
          requests: [],
          running: 0,
        };
      else if (path.endsWith("/town-map")) value = { image: base.settings.townMapImage };
      await fulfill(route, { status, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await runCase("village-clock/" + width, async () => {
      await expect(page.locator(".marinara-capability-villages-mobile-clock")).toContainText("07:30");
      assert.ok(await page.getByRole("button", { name: /^(Open settings menu|More)$/ }).isEnabled());
      await page.screenshot({ path: ".build-tmp/clock-visual/nonblocking-" + width + ".png" });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false);
      serverInstant = "2026-10-15T05:30:00Z";
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await expect(page.locator(".marinara-capability-villages-mobile-clock")).toContainText("10:30");
    });
    await runCase("founding-timezone/" + width, async () => {
      founding = true;
      serverInstant = "2026-10-15T02:59:59Z";
      await page.clock.install({ time: new Date("2030-01-01T12:00:00Z") });
      await page.clock.pauseAt(new Date("2030-01-01T12:01:00Z"));
      await page.reload();
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      const scene = page.locator(".villages-forging-v2");
      await expect(scene.locator(".villages-founding-title")).toBeVisible();
      await expect(scene).toHaveCSS("background-image", /mari-founding-overlook-day\.webp/);
      await page.getByRole("button", { name: "START", exact: true }).click();
      await expect(page.getByRole("list", { name: "Founding phases" })).toBeVisible();
      await expect(page.getByRole("combobox", { name: "Village Timezone" })).toHaveCount(0);
      await expect(scene).toHaveAttribute("data-lighting", "day");
      await expect(scene).toHaveCSS("background-image", /mari-founding-overlook-day\.webp/);
      await page.screenshot({ path: ".build-tmp/clock-visual/founding-day-" + width + ".png" });
      await scene.getByRole("button", { name: "Let’s talk about the world" }).click();
      const world = scene.getByLabel("The larger world");
      await world.fill("A string of settlements along the coast");
      await page.clock.fastForward(2000);
      await expect(scene).toHaveAttribute("data-lighting", "night");
      await expect(scene).toHaveCSS("background-image", /mari-founding-overlook\.webp/);
      await expect(world).toHaveValue("A string of settlements along the coast");
      await page.screenshot({ path: ".build-tmp/clock-visual/founding-night-" + width + ".png" });
    });
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log("Desktop/mobile nonblocking server clock and automatic Engine founding timezone passed.");
});
