// Test cases: place-repair/desktop, place-repair/phone
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { repairBrowserFixture, expect, noRepairScroll } from "./fixtures/repair-browser.fixture.mjs";
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["phone", 390, 844],
  ])
    await runCase("place-repair/" + name, async () => {
      const f = await repairBrowserFixture(browser, width, height),
        { page } = f;
      await f.area("places");
      await page.getByRole("button", { name: "Hearth Alms Rooms, Venue", exact: true }).click();
      await page.getByRole("button", { name: "Dining room", exact: true }).click();
      await page.getByRole("button", { name: /Zone details/ }).click();
      await expect(page.getByRole("heading", { name: "Dining room", exact: true })).toBeVisible();
      await page.getByRole("textbox", { name: "Name", exact: true }).fill("Dining room and library");
      await page.getByRole("button", { name: "Review changes", exact: true }).click();
      assert.equal(
        f.calls.findLast((call) => call.path.endsWith("/review")).body.values.name,
        "Dining room and library",
      );
      await noRepairScroll(page);
      assert(!f.calls.some((call) => /explore|\/visit|\/generate/.test(call.path)));
      await page.close();
    });
});
