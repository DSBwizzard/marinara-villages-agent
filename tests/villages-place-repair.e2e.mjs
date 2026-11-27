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
      await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue("Hearth Alms Rooms");
      if (width < 700)
        await page.getByRole("combobox", { name: "Location repairs", exact: true }).selectOption("people");
      else {
        const nav = page.getByRole("navigation", { name: "Location repairs", exact: true });
        const bounds = await nav
          .getByRole("button")
          .evaluateAll((nodes) =>
            nodes.map((el) => ({ x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y })),
          );
        assert(
          bounds.every((box, index) => box.x === bounds[0].x && (!index || box.y > bounds[index - 1].y)),
          "Venue repairs form a vertical notebook",
        );
        await nav.getByRole("button", { name: "People & roles", exact: true }).click();
      }
      await page.getByRole("button", { name: "Runs this Venue", exact: true }).click();
      await expect(page.getByRole("checkbox", { name: "Nora", exact: true })).toBeChecked();
      await noRepairScroll(page);
      if (width < 700)
        await page.getByRole("combobox", { name: "Location repairs", exact: true }).selectOption("zones");
      else
        await page
          .getByRole("navigation", { name: "Location repairs", exact: true })
          .getByRole("button", { name: "Zones", exact: true })
          .click();
      assert.equal(
        await page.locator('[class$="-venue-zones"]').evaluate((el) => getComputedStyle(el).backgroundImage),
        "none",
      );
      await page.getByRole("button", { name: "Dining room", exact: true }).click();
      await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue("Dining room");
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
