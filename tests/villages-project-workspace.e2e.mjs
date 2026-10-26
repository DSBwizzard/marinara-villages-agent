import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { currentProject, openProjectPage, projectSnapshot } from "./fixtures/villages-project-browser.fixture.mjs";

const browser = await chromium.launch({ headless: true });
const output = process.env.VILLAGES_VISUAL_OUTPUT;
if (output) await mkdir(output, { recursive: true });

try {
  for (const { width, height } of [
    { width: 1280, height: 900 },
    { width: 390, height: 740 },
    { width: 390, height: 568 },
  ]) {
    const snapshot = projectSnapshot();
    snapshot.projects = Array.from({ length: 6 }, (_, index) => ({
      ...currentProject(`draft-${index}`),
      title: `Draft ${index + 1}`,
    }));
    const active = currentProject("renovation", "renovation");
    active.title = "The Mill";
    active.status = "working";
    active.lifecycle.phase = "working";
    snapshot.projects.push(active);
    const f = await openProjectPage(browser, width, snapshot);
    const { page } = f;
    await page.setViewportSize({ width, height });
    const root = page.locator(".marinara-capability-villages-project-root");
    const board = page.getByRole("main", { name: "Projects", exact: true });
    await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
    await expect(board.getByRole("button", { name: "Map", exact: true })).toHaveCount(0);
    await expect(board.getByRole("heading", { name: "Your Projects", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Draft 1", exact: true })).toBeVisible();
    await expect(board).toContainText("1 / 2 active");
    if (output) await page.screenshot({ path: resolve(output, `projects-drafts-${width}.png`), fullPage: true });
    if (width < 700) {
      await page.getByRole("button", { name: "Next", exact: true }).click();
      await expect(page.getByRole("button", { name: "Draft 6", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Slot 2", exact: true }).click();
    }
    await expect(page.getByRole("button", { name: /Renovation.*The Mill.*Working/ })).toBeVisible();
    if (width < 700) await page.getByRole("button", { name: "Slot 1", exact: true }).click();
    await expect(page.getByRole("region", { name: "Project slot 1" })).toContainText("Empty slot");
    await expect(page.getByRole("button", { name: "New Venue", exact: true })).toBeDisabled();
    const metrics = await root.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const boardRect = element.querySelector("main").getBoundingClientRect();
      return {
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        bottom: rect.bottom,
        boardBottom: boardRect.bottom,
        viewport: innerHeight,
      };
    });
    assert(metrics.scrollHeight <= metrics.clientHeight + 1, "Projects overview does not scroll");
    assert(metrics.bottom <= metrics.viewport + 1, "Projects overview fits inside the viewport");
    assert(metrics.boardBottom <= metrics.viewport - 3, "the whole blueprint remains visible");
    const clipped = await root.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return [...element.querySelectorAll("button")]
        .filter((button) => {
          if (!button.checkVisibility()) return false;
          const rect = button.getBoundingClientRect();
          return rect.bottom > bounds.bottom + 1 || rect.top < bounds.top - 1;
        })
        .map((button) => button.textContent.trim());
    });
    assert.deepEqual(clipped, [], "visible controls are not clipped");
    if (output) await page.screenshot({ path: resolve(output, `projects-workspace-${width}.png`), fullPage: true });
    await page.close();
  }
  const legacy = projectSnapshot();
  legacy.projects = Array.from({ length: 7 }, (_, index) => ({
    ...currentProject(`old-${index}`),
    title: `Old draft ${index + 1}`,
  }));
  legacy.projects.push(
    ...Array.from({ length: 7 }, (_, index) => ({
      ...currentProject(`finished-${index}`),
      title: `Finished ${index + 1}`,
      status: "cancelled",
    })),
  );
  legacy.projects.push(
    ...Array.from({ length: 3 }, (_, index) => ({
      ...currentProject(`active-${index}`),
      title: `Active ${index + 1}`,
      status: "working",
    })),
  );
  const old = await openProjectPage(browser, 1280, legacy);
  await old.page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(old.page.getByRole("button", { name: "Old draft 7", exact: true })).toBeVisible();
  await old.page.getByRole("button", { name: "History", exact: true }).click();
  await expect(old.page.getByRole("button", { name: /Active 3/ })).toBeVisible();
  await old.page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(old.page.getByRole("button", { name: /Finished 7/ })).toBeVisible();
  await old.page.close();
  console.log("Project drafts and active slots fit on desktop and phone.");
} finally {
  await browser.close();
}
