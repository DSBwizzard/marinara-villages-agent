// Test cases: repair-transitions/direct-entry, repair-transitions/records, repair-transitions/save, repair-transitions/saved-refresh, repair-transitions/late-refresh, repair-transitions/pagination
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, fulfill, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { repairBrowserFixture, expect, noRepairScroll } from "./fixtures/repair-browser.fixture.mjs";
const browser = await chromium.launch({ headless: true });
await mkdir(".build-tmp/repair-captures", { recursive: true });
await withBrowser(browser, async () => {
  await runCase("repair-transitions/direct-entry", async () => {
    for (const width of [1440, 390]) {
      const f = await repairBrowserFixture(browser, width, 900, { extraMemories: 1 }),
        { page } = f;
      await page.evaluate(() => window.c.chooseTopic("all"));
      await page.getByRole("button", { name: "The workshop key", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Whose memory?", exact: true })).toBeVisible();
      const account = f.hold('record:["memory","nora"]');
      await page.getByRole("button", { name: "Repair Nora", exact: true }).click();
      await account.started;
      await expect(page.locator(".repair-record-list")).toHaveCount(0);
      account.release();
      await expect(page.getByRole("textbox", { name: "Memory", exact: true })).toHaveValue(
        "Ellis lent me the workshop key.",
      );
      const home = f.hold('record:["home","nora"]');
      await f.section("home");
      await home.started;
      await expect(page.locator(".repair-record-list")).toHaveCount(0);
      home.release();
      await expect(page.getByRole("combobox", { name: "Home", exact: true })).toHaveValue("house");
      await f.area("places");
      const venue = f.hold('record:["venue","hall"]');
      await page.getByRole("button", { name: "Hearth Alms Rooms, Venue", exact: true }).click();
      await venue.started;
      await expect(page.getByRole("button", { name: "Venue details", exact: true })).toHaveCount(0);
      venue.release();
      await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue("Hearth Alms Rooms");
      if (width > 700) await page.getByRole("button", { name: "Zones", exact: true }).click();
      else await page.getByRole("combobox", { name: "Location repairs" }).selectOption("zones");
      const zone = f.hold('record:["zone-details","hall","dining"]');
      await page.getByRole("button", { name: /Dining room/ }).click();
      await zone.started;
      await expect(page.getByRole("button", { name: "Zone details", exact: true })).toHaveCount(0);
      zone.release();
      await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue("Dining room");
      await noRepairScroll(page);
      await page.close();
    }
  });
  await runCase("repair-transitions/records", async () => {
    const f = await repairBrowserFixture(browser, 1440, 900, { extraMemories: 1 }),
      { page } = f;
    await page.getByRole("button", { name: "Repair Nora", exact: true }).click();
    await page.getByRole("button", { name: "The workshop key", exact: true }).click();
    const field = page.getByRole("textbox", { name: "Memory", exact: true });
    await field.fill("Keep the first account draft.");
    const memory = f.hold('record:["memory","remote-0"]');
    await page.getByRole("button", { name: "Remote memory 0", exact: true }).click();
    await memory.started;
    await expect(field).toHaveValue("Keep the first account draft.");
    await expect(field).toBeDisabled();
    memory.release();
    await expect(field).toHaveValue("Remote memory 0");
    await page.getByRole("button", { name: "The workshop key", exact: true }).click();
    await expect(field).toHaveValue("Keep the first account draft.");
    await f.section("agenda");
    await page.getByRole("button", { name: /Reading/ }).click();
    await expect(page.getByRole("textbox", { name: "Activity", exact: true })).toHaveValue("Reading");
    const records = f.hold("records:nora");
    await page.getByRole("button", { name: "Back to Agenda", exact: true }).click();
    await records.started;
    await expect(page.locator(".repair-editor")).toHaveCount(0);
    records.release();
    await page.getByRole("button", { name: /Meet Ellis/ }).click();
    await expect(page.getByRole("textbox", { name: "Activity", exact: true })).toHaveValue("Meet Ellis");
    await page.close();
  });
  await runCase("repair-transitions/save", async () => {
    for (const width of [1440, 390]) {
      const f = await repairBrowserFixture(browser, width, 900, { extraMemories: 1 }),
        { page } = f;
      await page.getByRole("button", { name: "Repair Nora", exact: true }).click();
      await page.getByRole("searchbox", { name: "Find a memory", exact: true }).fill("The workshop key");
      await page.getByRole("button", { name: "The workshop key", exact: true }).click();
      const field = page.getByRole("textbox", { name: "Memory", exact: true });
      await field.fill("The corrected account.");
      await page.getByRole("button", { name: "Review changes", exact: true }).click();
      const refreshed = f.hold('record:["memory","nora"]');
      await page.getByRole("button", { name: "Save changes", exact: true }).click();
      await refreshed.started;
      await expect(page.getByRole("button", { name: "Continue repairing", exact: true })).toHaveCount(0);
      await expect(page.getByRole("heading", { name: "Changes saved", exact: true })).toHaveCount(0);
      refreshed.release();
      await expect(field).toHaveValue("The corrected account.");
      await expect(page.locator(".repair-footer [role=status]")).toHaveText("Saved");
      assert.equal(
        new URL(f.calls.findLast((call) => call.path.endsWith("/records")).url).searchParams.get("query"),
        "The workshop key",
      );
      await expect(page.getByRole("button", { name: "Remote memory 0", exact: true })).toHaveCount(0);
      if (width > 700)
        await expect(page.getByRole("searchbox", { name: "Search REPAIR", exact: true })).toHaveValue("");
      await expect(page.getByRole("button", { name: "Review changes", exact: true })).toBeDisabled();
      await noRepairScroll(page);
      await page.screenshot({ path: `.build-tmp/repair-captures/${width}-saved.png` });
      await field.fill("A second correction.");
      await page.getByRole("button", { name: "Review changes", exact: true }).click();
      assert.equal(f.calls.findLast((call) => call.path.endsWith("/review")).body.expectedRecord, "saved-1");
      await page.getByRole("button", { name: "Save changes", exact: true }).click();
      await expect(field).toHaveValue("A second correction.");
      await page.getByRole("button", { name: "Forget", exact: true }).click();
      await page.getByRole("button", { name: "Review changes", exact: true }).click();
      await page.getByRole("button", { name: "Save changes", exact: true }).click();
      await expect(page.getByRole("searchbox", { name: "Find a memory", exact: true })).toBeVisible();
      await expect(field).toHaveCount(0);
      await expect(page.locator(".repair-footer [role=status]")).toHaveText("Saved");
      assert.equal(f.calls.filter((call) => call.path.endsWith("/apply")).length, 3);
      await noRepairScroll(page);
      await page.close();
    }
  });
  await runCase("repair-transitions/saved-refresh", async () => {
    const f = await repairBrowserFixture(browser),
      { page } = f;
    await f.area("world");
    await page.getByRole("button", { name: "Village setting", exact: true }).click();
    await page.getByRole("textbox", { name: "Village name", exact: true }).fill("Changed village");
    await page.getByRole("button", { name: "Review changes", exact: true }).click();
    await page.route(
      "**/api/villages/repair/records?**",
      (route) => fulfill(route, { status: 503, json: { error: "Unavailable" } }),
      { times: 1 },
    );
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("Changes saved. Could not refresh this page. Try again.");
    await expect(page.getByRole("button", { name: "Save changes", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Try again", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Village name", exact: true })).toHaveValue("Changed village");
    await page.getByRole("textbox", { name: "Village name", exact: true }).fill("Another correction");
    await page.getByRole("button", { name: "Review changes", exact: true }).click();
    await page.evaluate(() => {
      window.repairRefresh = {
        then(resolve, reject) {
          window.rejectRepairRefresh = reject;
          window.repairRefreshStarted = true;
        },
      };
    });
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.getByRole("button", { name: "Save changes", exact: true })).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.repairRefreshStarted)).toBe(true);
    await page.evaluate(() => window.rejectRepairRefresh(new Error("Snapshot refresh failed")));
    await expect(page.getByRole("alert")).toHaveText("Changes saved. Could not refresh this page. Try again.");
    await page.evaluate(() => {
      window.repairRefresh = {
        then(resolve) {
          window.nativeRefreshed = true;
          resolve(null);
        },
      };
    });
    await page.getByRole("button", { name: "Try again", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Village name", exact: true })).toHaveValue("Another correction");
    assert.equal(await page.evaluate(() => window.nativeRefreshed), true);
    assert.equal(f.calls.filter((call) => call.path.endsWith("/apply")).length, 2);
    await page.close();
  });
  await runCase("repair-transitions/late-refresh", async () => {
    const f = await repairBrowserFixture(browser),
      { page } = f;
    await page.getByRole("button", { name: "Repair Nora", exact: true }).click();
    await page.getByRole("button", { name: "The workshop key", exact: true }).click();
    await expect(page.locator(".repair-editor")).toBeVisible();
    await page.evaluate(() => {
      window.oldRepairRefresh = window.c.refreshSelected;
    });
    await page.getByRole("button", { name: "← People", exact: true }).click();
    await page.getByRole("button", { name: "Repair Ellis", exact: true }).click();
    await page.getByRole("button", { name: "A quiet afternoon", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Memory", exact: true })).toHaveValue("We read in the garden.");
    const count = f.calls.length;
    await page.evaluate(() => window.oldRepairRefresh());
    assert.equal(f.calls.length, count);
    await expect(page.getByRole("heading", { name: "Ellis", exact: true })).toBeVisible();
    await page.close();
  });
  await runCase("repair-transitions/pagination", async () => {
    const f = await repairBrowserFixture(browser, 1440, 900, { history: 57, checkpoints: 57 }),
      { page } = f;
    for (const [area, method, property] of [
      ["history", "historyPage", "historyOffset"],
      ["world", "checkpointPage", "checkpointOffset"],
    ]) {
      await f.area(area);
      if (area === "world") await page.getByRole("button", { name: "Village snapshots →" }).click();
      const older = f.hold("index");
      await page.evaluate((method) => {
        void window.c[method](50);
      }, method);
      await older.started;
      await page.evaluate((method) => window.c[method](0), method);
      const response = page.waitForResponse((response) => new URL(response.url()).searchParams.get(property) === "50");
      older.release();
      await response;
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.equal(await page.evaluate((property) => window.c.index[property], property), 0);
    }
    await page.close();
  });
});
