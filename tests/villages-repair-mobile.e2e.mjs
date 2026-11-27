// Test cases: repair-mobile/compact, repair-mobile/phone
import { mkdir } from "node:fs/promises";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { repairBrowserFixture, expect, noRepairScroll } from "./fixtures/repair-browser.fixture.mjs";

const memory = {
  title:
    "Nora wants to keep the workshop running steadily as a warm, welcoming part of the village while still finding time for the people she loves.",
  summary: "Remembered by Nora, desire, 11/24/2026",
};
const browser = await chromium.launch({ headless: true });
await mkdir(".build-tmp/repair-captures", { recursive: true });
await withBrowser(browser, async () => {
  for (const [name, width, height] of [
    ["compact", 320, 568],
    ["phone", 360, 640],
  ]) {
    await runCase(`repair-mobile/${name}`, async () => {
      const f = await repairBrowserFixture(browser, width, height, {
        mobile: true,
        memoryPreview: memory,
        extraMemories: 8,
        history: 8,
        checkpoints: 8,
        jobs: [
          {
            id: "failed",
            kind: "resident-planning",
            label: "Agenda",
            status: "failed",
            error:
              "The saved routine could not be prepared. Choose Retry unfinished work to continue with the current plan.",
          },
        ],
      });
      const { page } = f;
      const fits = async () => {
        await page.evaluate(
          () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
        await noRepairScroll(page);
        const workspace = page.locator(".repair-notebook-body");
        const overflow = await workspace.evaluate((el) => ({
          x: el.scrollWidth - el.clientWidth,
          y: el.scrollHeight - el.clientHeight,
        }));
        expect(overflow.x).toBeLessThanOrEqual(1);
        expect(overflow.y).toBeLessThanOrEqual(1);
        await expect(page.getByRole("combobox", { name: "REPAIR area", exact: true })).toBeInViewport({ ratio: 1 });
      };
      await fits();
      await page.getByRole("button", { name: "Repair Nora", exact: true }).tap();
      const row = page.getByRole("button", { name: memory.title, exact: true });
      await expect(row).toBeVisible();
      const title = await row.locator("strong").boundingBox();
      const detail = await row.locator("small").boundingBox();
      expect(title.width).toBeGreaterThan(width * 0.7);
      expect(detail.y).toBeGreaterThan(title.y);
      await fits();
      await page
        .locator(".villages-repair")
        .screenshot({ path: `.build-tmp/repair-captures/${width}-mobile-memory-list.png` });
      const forgotten = page.getByRole("button", { name: "Forgotten", exact: true });
      await forgotten.tap();
      await expect(forgotten).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByText("No forgotten memories.")).toBeVisible();
      await page.getByRole("button", { name: "Remembered", exact: true }).tap();
      await expect(row).toBeVisible();
      await row.tap();
      const field = page.getByRole("textbox", { name: "Memory", exact: true });
      await field.fill("Ellis loaned me the key.");
      await fits();
      if (name === "compact") {
        await page.setViewportSize({ width, height: 425 });
        await field.scrollIntoViewIfNeeded();
        await expect(field).toBeInViewport({ ratio: 1 });
        await expect(page.getByRole("button", { name: "Review changes", exact: true })).toBeInViewport({ ratio: 1 });
        await expect(page.getByRole("button", { name: "← Return to village", exact: true })).toBeInViewport({
          ratio: 1,
        });
        await page.setViewportSize({ width, height });
        await expect(field).toHaveValue("Ellis loaned me the key.");
      }
      await page.getByRole("button", { name: "Review changes", exact: true }).tap();
      await expect(page.getByRole("button", { name: "Save changes", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Before", exact: true }).tap();
      await fits();
      await page.getByRole("button", { name: "Save changes", exact: true }).tap();
      await expect(field).toHaveValue("Ellis loaned me the key.");
      await expect(page.locator(".repair-footer")).toContainText("Saved");
      await f.section("agenda");
      await expect(page.getByRole("group", { name: "Day planner", exact: true })).toBeVisible();
      await fits();
      await f.area("places");
      await expect(page.getByRole("button", { name: "Hearth Alms Rooms, Venue", exact: true })).toBeVisible();
      await fits();
      await f.area("progress");
      await expect(page.getByRole("button", { name: "Retry unfinished work" })).toBeVisible();
      await fits();
      await f.area("history");
      await expect(page.getByRole("button", { name: "Repair 0", exact: true })).toBeVisible();
      await fits();
      await page.screenshot({ path: `.build-tmp/repair-captures/${width}-mobile-history.png` });
      await page.getByRole("button", { name: "Repair 0", exact: true }).tap();
      await fits();
      await f.area("world");
      await page.getByRole("button", { name: "Village snapshots →" }).tap();
      await page.getByRole("button", { name: "Delete Snapshot 0", exact: true }).tap();
      await expect(page.getByRole("button", { name: "Keep snapshot", exact: true })).toBeInViewport({ ratio: 1 });
      await fits();
      await page.getByRole("button", { name: "Keep snapshot", exact: true }).tap();
      await page.getByRole("button", { name: /^Snapshot 0 / }).tap();
      await expect(page.getByRole("checkbox", { name: /Replace Village progress/ })).toBeVisible();
      await fits();
      await f.area("all");
      const search = page.getByRole("searchbox", { name: "Search REPAIR", exact: true });
      await search.fill("workshop");
      await search.press("Enter");
      await expect(row).toBeInViewport({ ratio: 1 });
      await fits();
      await page.close();
    });
  }
});
