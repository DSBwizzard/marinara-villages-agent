// Test cases: repair-familiar/wide, repair-familiar/desktop, repair-familiar/laptop, repair-familiar/phone, repair-familiar/compact
import { runCase } from "../scripts/test-cases.mjs";
import { mkdir } from "node:fs/promises";
import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { repairBrowserFixture, expect, noRepairScroll } from "./fixtures/repair-browser.fixture.mjs";
const browser = await chromium.launch({ headless: true });
await mkdir(".build-tmp/repair-captures", { recursive: true });
await withBrowser(browser, async () => {
  for (const [name, width, height] of [
    ["wide", 2560, 1440],
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
        if (width > 700) expect((await page.locator(".repair-content").boundingBox()).x).toBeLessThanOrEqual(40);
        await page.screenshot({ path: `.build-tmp/repair-captures/${width}-${state}.png` });
      };
      await expect(page.locator(".repair-chrome>strong>img")).toBeVisible();
      await expect
        .poll(() =>
          page.locator(".repair-chrome>strong>img").evaluate((image) => image.complete && image.naturalWidth > 0),
        )
        .toBe(true);
      await capture("people");
      const cards = page.locator('.repair-people-directory [class$="-directory-card"]');
      await expect(cards).toHaveCount(4);
      const bounds = await cards.evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return { x: r.x, y: r.y };
        }),
      );
      expect(bounds[0].y).toBe(bounds[1].y);
      expect(bounds[2].y).toBe(bounds[3].y);
      expect(bounds[2].y).toBeGreaterThan(bounds[0].y);
      await expect(page.getByRole("button", { name: "Main menu", exact: true })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "← Return to village", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Repair Nora", exact: true }).click();
      const partner = page.getByRole("combobox", { name: "Relationship with" });
      await expect(partner).toHaveValue('["relationship","nora","player"]');
      await expect(page.getByRole("button", { name: "Back to Relationships" })).toHaveCount(0);
      const slider = page.getByRole("slider", { name: "Adjust Warmth", exact: true });
      await expect(slider).toHaveValue("50");
      await expect(page.getByRole("meter", { name: "Warmth toward the selected person" })).toHaveAttribute(
        "aria-valuenow",
        "50",
      );
      if (width >= 390) {
        const score = page.getByRole("spinbutton", { name: "Warmth", exact: true });
        const sliderBox = await slider.boundingBox();
        const scoreBox = await score.boundingBox();
        expect(scoreBox.x).toBeGreaterThan(sliderBox.x + sliderBox.width);
        expect(Math.abs(scoreBox.y - sliderBox.y)).toBeLessThan(2);
        await expect(page.getByRole("slider", { name: "Adjust Romantic interest", exact: true })).toBeInViewport({
          ratio: 1,
        });
        const tracks = await page
          .locator('.repair-field[data-score] :is(.villages-relationship-bar, input[type="range"])')
          .evaluateAll((nodes) =>
            nodes.map((node) => {
              const { x, width } = node.getBoundingClientRect();
              return { x, width };
            }),
          );
        expect(tracks).toHaveLength(3);
        expect(tracks[1]).toEqual(tracks[0]);
        expect(tracks[2]).toEqual(tracks[0]);
        await slider.click({ position: { x: sliderBox.width / 2, y: sliderBox.height / 2 } });
        await expect(slider).toHaveValue("0");
        await partner.selectOption('["relationship","nora","ellis"]');
        await expect(slider).toHaveValue("-25");
        await page.getByRole("button", { name: "Discard", exact: true }).click();
        await partner.selectOption('["relationship","nora","player"]');
        await expect(slider).toHaveValue("0");
        await page.getByRole("button", { name: "Discard", exact: true }).click();
        await expect(slider).toHaveValue("50");
      }
      await capture("relationships");
      if (name === "phone")
        await page
          .locator(".villages-repair")
          .screenshot({ path: ".build-tmp/repair-captures/390-mobile-relationship-scores.png" });
      await page.getByRole("spinbutton", { name: "Warmth", exact: true }).fill("-42");
      await expect(page.getByRole("meter", { name: "Warmth toward the selected person" })).toHaveAttribute(
        "aria-valuenow",
        "-42",
      );
      for (
        let step = 0;
        step < 3 && !(await page.getByRole("meter", { name: "Romantic interest toward the selected person" }).count());
        step++
      )
        await page.getByRole("button", { name: "Next", exact: true }).click();
      await expect(page.locator('.villages-romantic-hearts [data-fill="full"]')).toHaveCount(1);
      await expect(page.locator('.villages-romantic-hearts [data-fill="half"]')).toHaveCount(1);
      await capture("hearts");
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
      for (
        let pages = 0;
        pages < 3 && !(await page.getByRole("combobox", { name: "Location", exact: true }).count());
        pages++
      ) {
        const title = page.locator(".repair-card h2");
        const before = await title.textContent();
        await page.getByRole("button", { name: "Next", exact: true }).click();
        await expect(title).not.toHaveText(before);
      }
      await expect(page.getByRole("combobox", { name: "Location", exact: true })).toBeVisible();
      await capture("work");
      for (
        let steps = 0;
        steps < 8 && !(await page.getByRole("group", { name: "Days", exact: true }).count());
        steps++
      ) {
        await page.getByRole("button", { name: "Next", exact: true }).click();
        await page.evaluate(
          () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
      }
      await expect(page.getByRole("checkbox", { name: "Sun", exact: true })).toBeVisible();
      await capture("work-days");
      await f.section("memories");
      await page.getByRole("button", { name: "The workshop key", exact: true }).click();
      await capture("memory");
      await f.area("places");
      await page.getByRole("button", { name: "Hearth Alms Rooms, Venue", exact: true }).click();
      await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue("Hearth Alms Rooms");
      await capture("venue-details");
      if (width < 700)
        await page.getByRole("combobox", { name: "Location repairs", exact: true }).selectOption("zones");
      else
        await page
          .getByRole("navigation", { name: "Location repairs", exact: true })
          .getByRole("button", { name: "Zones", exact: true })
          .click();
      await capture("zones");
      await page.getByRole("button", { name: "Dining room", exact: true }).click();
      await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue("Dining room");
      await capture("zone");
      await page.close();
    });
});
