import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});

const snapshot = {
  status: "ready",
  isFounded: false,
  village: { name: "", setting: "" },
  noticeboard: [],
  venueRequests: [],
  upgradeRequests: [],
  residences: [],
  happenings: [],
  villagers: [],
  recap: null,
  settings: {
    venues: [],
    foundingReason: "",
    foundingDetails: "",
    foundingGuidance: "",
    selectedLorebookIds: [],
    loreTokenBudget: 1600,
    townMapImageSetAt: "",
    townMapView: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
    villageNameMaxLength: 80,
    foundingDetailsMaxLength: 500,
    foundingGuidanceMaxLength: 500,
  },
};

try {
  for (const { width, height, cardsPerRow } of [
    { width: 1917, height: 655, cardsPerRow: 5 },
    { width: 1366, height: 768, cardsPerRow: 5 },
    { width: 1024, height: 768, cardsPerRow: 3 },
    { width: 390, height: 844, cardsPerRow: 2 },
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/villages**", (route) => {
      const path = new URL(route.request().url()).pathname;
      const value = path.endsWith("/personas")
        ? { personas: [] }
        : path.endsWith("/lorebooks")
          ? { books: [] }
          : path.endsWith("/catalog")
            ? { characters: [] }
            : snapshot;
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.route("**/api/capability-packages/villages/assets/founding-*.jpg", (route) => {
      const file = new URL(route.request().url()).pathname.split("/").at(-1);
      return route.fulfill({
        status: 200,
        contentType: "image/jpeg",
        body: readFileSync(resolve("packages/villages", file)),
      });
    });
    await page.route("http://villages.test/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}html,body{margin:0;width:100%;height:100%;font-family:Arial,sans-serif}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });

    const root = page.locator(".marinara-capability-villages-setup-root");
    await expect(root).toBeVisible();
    await expect(root.locator(".marinara-capability-villages-mapbar")).toHaveCount(0);
    const cards = root.locator(".marinara-capability-villages-scenario-option");
    await expect(cards).toHaveCount(5);
    await expect
      .poll(() =>
        root.locator(".marinara-capability-villages-scenario-art-panel img").evaluate((img) => img.naturalWidth),
      )
      .toBeGreaterThan(0);
    const first = await cards.nth(0).boundingBox();
    const lastInRow = await cards.nth(cardsPerRow - 1).boundingBox();
    assert.ok(first && lastInRow && Math.abs(first.y - lastInRow.y) < 2, "scenario cards fit their row");
    assert.ok(first.height < 100, "scenario cards are compact");

    if (width > 1000) {
      const fit = await root.evaluate((element) => element.scrollHeight <= element.clientHeight + 1);
      assert.ok(fit, "Village Identity fits in the desktop tab without page scrolling");
      await expect(root.getByLabel("Narrative direction (optional)")).toBeInViewport();
      await expect(root.getByRole("button", { name: "Next →" })).toBeInViewport();
    }

    const premise = root.getByLabel("Scenario premise (required)");
    const direction = root.getByLabel("Narrative direction (optional)");
    const original = await premise.inputValue();
    await premise.fill("My edited premise");
    await direction.fill("Keep the story hopeful");
    await root.getByText("Pioneer", { exact: true }).click();
    await root.getByText("Rebuild", { exact: true }).click();
    await expect(premise).toHaveValue(original);
    await expect(direction).toHaveValue("Keep the story hopeful");
    await root.getByText("Custom", { exact: true }).click();
    await expect(premise).toHaveValue("");
    await premise.fill("A custom premise");
    await root.getByText("Rebuild", { exact: true }).click();
    await root.getByText("Custom", { exact: true }).click();
    await expect(premise).toHaveValue("");
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally {
  await browser.close();
}
