import { clickCharacterTool } from "./fixtures/browser-diagnostics.mjs";
import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }),
      errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await mockEngineLookups(page);
    let paid = 0;
    const block = { startMinute: 600, endMinute: 660, activity: "Reading by the window" };
    const resident = { characterId: "mara", agenda: null };
    await page.route("http://villages.test/", (route) =>
      fulfill(route, {
        contentType: "text/html",
        body: "<style>html,body{margin:0;background:#171b25;color:white;font:16px Arial}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      let value = structuredClone(snapshot);
      if (path.endsWith("/agendas") && url.searchParams.has("characterId")) {
        const inspect = url.searchParams.get("inspect") === "true";
        value = {
          visibility: inspect ? "inspect" : "known",
          days: [{ date: "2026-11-10", weekday: "Tuesday", blocks: inspect ? [block] : [] }],
        };
      } else if (path.endsWith("/agendas")) value = { villagers: [resident] };
      else if (path.endsWith("/relationships")) value = { profiles: [{ characterId: "mara", entries: [] }] };
      else if (path.endsWith("/usage/preview")) value = { requests: 1, residents: [], dollars: null, unknownCosts: 1 };
      else if (path.endsWith("/usage"))
        value = {
          since: new Date().toISOString(),
          totals: { requests: 0, tokens: 0, dollars: 0, unknown: 0 },
          today: {},
          purposes: {},
          requests: [],
          running: 0,
        };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/rooms/active")) value = { session: null };
      else if (path.endsWith("/catalog")) value = { characters: [] };
      else if (path.endsWith("/personas")) value = { personas: [] };
      else if (path.endsWith("/lorebooks")) value = { books: [] };
      else if (path.endsWith("/debug/runtime")) value = { showUsageMeter: false, verbose: false, effective: false };
      else if (/generate|regenerate|remap/u.test(path)) paid++;
      await fulfill(route, { contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: /^(Open settings menu|More)$/, exact: true }).click();
    await page
      .getByRole("navigation", { name: "Village navigation" })
      .getByRole("button", { name: "People", exact: true })
      .click();
    await page.getByRole("button", { name: "Open Mara profile" }).click();
    await expect(page.getByText("Reading by the window", { exact: true })).toHaveCount(0);
    await clickCharacterTool(page, "Inspect Agenda");
    await expect(page.getByText("Reading by the window", { exact: true })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "Schedule influence", exact: true })).toHaveCount(0);
    const update = page.getByRole("button", { name: "Regenerate Agenda", exact: true });
    await expect(update).toBeVisible();
    const box = await update.boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= width);
    assert.equal(paid, 0);
    await clickCharacterTool(page, "Leave Inspect");
    await expect(page.getByText("Reading by the window", { exact: true })).toHaveCount(0);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: resolve("artifacts/owned-agendas-" + width + ".png") });
    await page.close();
  }
  console.log("The profile Agenda uses one calendar for known and inspected views on desktop and phones.");
});
