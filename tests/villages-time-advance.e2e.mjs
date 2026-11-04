import assert from "node:assert/strict";
import { resolve } from "node:path";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as fixture, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await mockEngineLookups(page);
    const initial = Date.parse("2026-10-24T12:00:00Z");
    const clock = {
      revision: 1,
      worldId: "browser-world",
      timeZone: "UTC",
      instant: new Date(initial).toISOString(),
      advanceMs: 0,
      paused: false,
      recovery: null,
    };
    const actions = [];
    const receipts = new Map();
    let failure = "stale";
    await page.route("http://villages.test/", (route) =>
      fulfill(route, {
        status: 200,
        contentType: "text/html",
        body: "<style>html,body{margin:0;background:#171b25;color:white;font-family:Arial}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      const snapshot = structuredClone(fixture);
      snapshot.clock = structuredClone(clock);
      snapshot.village.instant = clock.instant;
      let value = snapshot;
      if (path.endsWith("/background/catchup")) value = { batch: null };
      else if (path.endsWith("/rooms/active")) value = { session: null, debugDiscardEnabled: false };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/rooms/archive")) value = { visits: [], total: 0 };
      else if (path.endsWith("/debug/runtime")) value = { verbose: false, effective: false, engineEnabled: false };
      else if (path.endsWith("/clock")) {
        const actionId = new URL(route.request().url()).searchParams.get("actionId");
        value = { ...clock, ...(receipts.has(actionId) ? { advanceReceipt: receipts.get(actionId) } : {}) };
      } else if (path.endsWith("/clock/advance")) {
        const action = route.request().postDataJSON();
        actions.push(action);
        if (failure === "stale") {
          clock.revision++;
          clock.advanceMs += 86_400_000;
          clock.lastAdvanceActionId = "other-tab";
          clock.instant = new Date(initial + clock.advanceMs).toISOString();
          failure = "";
          await fulfill(route, { status: 409, json: { error: "Time already changed. Refresh the clock." } });
          return;
        }
        if (!receipts.has(action.actionId)) {
          assert.equal(action.revision, clock.revision);
          clock.revision++;
          clock.advanceMs += action.milliseconds;
          clock.lastAdvanceActionId = action.actionId;
          receipts.set(action.actionId, { actionId: action.actionId, milliseconds: action.milliseconds });
          clock.instant = new Date(initial + clock.advanceMs).toISOString();
        }
        if (failure === "after-save" || failure === "after-save-and-other") {
          if (failure === "after-save-and-other") {
            clock.revision++;
            clock.advanceMs += 60_000;
            clock.lastAdvanceActionId = "other-tab-later";
            clock.instant = new Date(initial + clock.advanceMs).toISOString();
          }
          failure = "";
          await fulfill(route, { status: 500, json: { error: "Time saved; catch-up interrupted." } });
          return;
        }
        snapshot.clock = structuredClone(clock);
        snapshot.village.instant = clock.instant;
      }
      await fulfill(route, { status: 200, json: value });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: /^(Open settings menu|More)$/, exact: true }).click();
    if (width <= 700) await page.getByRole("combobox", { name: "Section" }).selectOption("progress");
    else await page.getByRole("button", { name: "Debug", exact: true }).click();
    const panel = page.getByRole("region", { name: "Development time", exact: true });
    const advance = panel.getByRole("button", { name: "Advance time", exact: true });
    await expect(advance).toBeEnabled();
    await panel.getByRole("spinbutton", { name: "Time amount", exact: true }).fill("2.5");
    await advance.click();
    await expect(panel.getByRole("alert")).toContainText("Time already changed");
    await panel.getByRole("button", { name: "New advance", exact: true }).click();
    await advance.click();
    await expect(panel.getByRole("status")).toContainText("Time advanced");
    assert.equal(actions[1].milliseconds, 2.5 * 86_400_000);
    assert.notEqual(actions[0].actionId, actions[1].actionId, "A stale conflict has an explicit new-action escape.");
    await panel.getByRole("spinbutton", { name: "Time amount", exact: true }).fill("1.25");
    await panel.getByRole("combobox", { name: "Time unit", exact: true }).selectOption("hours");
    failure = "after-save";
    await advance.click();
    await expect(panel.getByRole("alert")).toContainText("Time saved");
    await advance.click();
    await expect(panel.getByRole("status")).toContainText("Time advanced");
    assert.deepEqual(
      actions[3],
      actions[2],
      "A post-save failure retries the original duration, revision and action identity.",
    );
    assert.equal(clock.advanceMs, 3.5 * 86_400_000 + 1.25 * 3_600_000);
    failure = "after-save-and-other";
    await advance.click();
    await expect(panel.getByRole("alert")).toContainText("Time saved");
    await advance.click();
    await expect(panel.getByRole("status")).toContainText("Time advanced");
    assert.deepEqual(actions.at(-1), actions.at(-2), "A later tab cannot prevent replaying the saved action.");
    await panel.getByRole("spinbutton", { name: "Time amount", exact: true }).fill("1.1");
    await advance.click();
    await expect(panel.getByRole("status")).toContainText("Time advanced");
    assert.equal(
      actions.at(-1).milliseconds,
      3_960_000,
      "Decimal hours round to milliseconds instead of failing on binary floating-point residue.",
    );
    for (const control of [advance, panel.getByRole("spinbutton"), panel.getByRole("combobox")]) {
      const box = await control.boundingBox();
      assert.ok(box && box.x >= 0 && box.x + box.width <= width, "Time controls fit the viewport.");
    }
    await page.screenshot({ path: `.build-tmp/time-control-${width}.png` });
    await page.close();
  }
  console.log("Custom time advances, stale conflicts, saved-request retry and desktop/phone layouts passed.");
});
