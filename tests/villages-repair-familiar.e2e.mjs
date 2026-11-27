// Test cases: repair-familiar/desktop, repair-familiar/laptop, repair-familiar/phone, repair-familiar/compact
import { runCase } from "../scripts/test-cases.mjs";
import { mkdir } from "node:fs/promises";
import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { repairBrowserFixture, expect, noRepairScroll } from "./fixtures/repair-browser.fixture.mjs";
const browser = await chromium.launch({ headless: true });
await mkdir(".build-tmp/repair-captures", { recursive: true });
await withBrowser(browser, async () => {
  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["laptop", 1366, 768],
    ["phone", 390, 844],
    ["compact", 320, 568],
  ])
    await runCase("repair-familiar/" + name, async () => {
      const f = await repairBrowserFixture(browser, width, height),
        { page } = f;
      const capture = async (state) => {
        await page.evaluate(
          () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
        await noRepairScroll(page);
        await page.screenshot({ path: `.build-tmp/repair-captures/${width}-${state}.png` });
      };
      await capture("people");
      await page.getByRole("button", { name: "Repair Nora", exact: true }).click();
      await f.section("home");
      await expect(page.getByRole("combobox", { name: "Home", exact: true })).toBeVisible();
      await capture("home");
      await page.getByRole("combobox", { name: "Home", exact: true }).selectOption("inn");
      if (width === 320) await page.getByRole("button", { name: "Next", exact: true }).click();
      await expect(
        page
          .getByRole("combobox", { name: "Sleeping Zone", exact: true })
          .getByRole("option", { name: "Bedroom", exact: true }),
      ).toHaveCount(0);
      await f.section("memories");
      await page.getByRole("button", { name: "The workshop key", exact: true }).click();
      await capture("memory");
      await f.area("places");
      await page.getByRole("button", { name: "Hearth Alms Rooms, Venue", exact: true }).click();
      await capture("zones");
      await page.getByRole("button", { name: "Dining room", exact: true }).click();
      await page.getByRole("button", { name: /Zone details/ }).click();
      await capture("zone");
      await page.close();
    });
});
