import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as base } from "./fixtures/villages-scene-browser.fixture.mjs";

// Test cases: village-clock-recovery, founding-timezone
const browser = await chromium.launch({
  headless: true,
});
await mkdir(".build-tmp/clock-visual", { recursive: true });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, timezoneId: "Asia/Tokyo" });
    await mockEngineLookups(context);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let founding = false;
    let serverInstant = "2026-10-15T02:30:00Z";
    const actions = [];
    const state = () => {
      const value = structuredClone(base);
      value.isFounded = !founding;
      value.village.timeZone = "America/Los_Angeles";
      value.village.instant = serverInstant;
      value.clock = { revision: 2, timeZone: "America/Los_Angeles", paused: false, recovery: null };
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
      if (path.endsWith("/clock/recover")) {
        actions.push("unexpected recovery");
      } else if (path.endsWith("/rooms/active")) value = { session: null };
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
    await runCase("village-clock-recovery/" + width, async () => {
      const notice = page.getByRole("region", { name: "Village clock recovery" });
      await expect(notice).toHaveCount(0);
      await expect(page.locator(".marinara-capability-villages-mobile-clock")).toContainText("07:30");
      assert.ok(await page.getByRole("button", { name: /^(Open settings menu|More)$/ }).isEnabled());
      await page.screenshot({ path: ".build-tmp/clock-visual/nonblocking-" + width + ".png" });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false);
      assert.deepEqual(actions, []);
      serverInstant = "2026-10-15T05:30:00Z";
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await expect(page.locator(".marinara-capability-villages-mobile-clock")).toContainText("10:30");
      await expect(notice).toHaveCount(0);
    });
    await runCase("founding-timezone/" + width, async () => {
      founding = true;
      await page.reload();
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      const zone = page.getByRole("combobox", { name: "Village Timezone" });
      await expect(zone).toHaveValue("America/Los_Angeles");
      await zone.selectOption("Europe/London");
      await expect(zone).toHaveValue("Europe/London");
      await page.screenshot({ path: ".build-tmp/clock-visual/founding-" + width + ".png" });
      await expect
        .poll(async () =>
          page.evaluate(
            () =>
              new Promise((resolve, reject) => {
                const open = indexedDB.open("villages-founding-v3", 1);
                open.onsuccess = () => {
                  const req = open.result.transaction("drafts").objectStore("drafts").get("/api/villages");
                  req.onsuccess = () => resolve(req.result?.data?.timeZone);
                  req.onerror = () => reject(req.error);
                };
              }),
          ),
        )
        .toBe("Europe/London");
    });
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log("Desktop/mobile nonblocking server clock and fixed founding timezone defaults passed.");
} finally {
  await browser.close();
}
