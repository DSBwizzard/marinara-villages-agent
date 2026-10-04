import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot as fixture } from "./fixtures/villages-scene-browser.fixture.mjs";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
const screenshotDir = process.env.VILLAGES_SCREENSHOT_DIR;
if (screenshotDir) await mkdir(screenshotDir, { recursive: true });
try {
  for (const width of [1366, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const snapshot = structuredClone(fixture);
    snapshot.village.name = "Station Fields";
    snapshot.villagers = [
      { characterId: "aqua", name: "Aqua" },
      { characterId: "feddy", name: "Feddy Fastbayer" },
      { characterId: "sneak", name: "Sneak McKnickit" },
    ];
    snapshot.settings.venues = [
      {
        ...structuredClone(fixture.settings.venues[0]),
        id: "aqua-home",
        name: "Aqua's living space",
        zones: [
          {
            id: "private:base",
            name: "Signal Loft",
            kind: "private-residence",
            description: "",
            state: { items: [], publicFacts: [] },
          },
        ],
      },
    ];
    snapshot.foundingPreparation = {
      status: "pending",
      completedIds: [],
      currentId: "",
      error: "",
      venueDetailsSeeded: false,
      phase: "venues",
      stage: "model",
      modelName: "Fixture System",
      stageStartedAt: new Date().toISOString(),
      attempt: 1,
      privateSpacesReady: 0,
      privateSpacesTotal: 4,
    };
    let retries = 0;
    await page.route("http://villages.test/", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<style>html,body{margin:0;background:#171b25;color:white;font:16px Arial}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/setup/preparation/retry")) {
        retries++;
        snapshot.foundingPreparation.status = "pending";
      }
      const response = path.endsWith("/catalog")
        ? { characters: [] }
        : path.endsWith("/rooms/active")
          ? { session: null }
          : path.endsWith("/connections")
            ? { systemConnectionId: "fixture", narrationConnectionId: "fixture", imageConnectionId: "disabled" }
            : path.endsWith("/usage/preview")
              ? {
                  requests: 7,
                  residents: [],
                  dollars: null,
                  unknownCosts: 7,
                  note: "One request per unfinished space.",
                }
              : path.endsWith("/usage")
                ? { visible: false }
                : path.endsWith("/agendas")
                  ? { villagers: [] }
                  : snapshot;
      return route.fulfill({ json: response });
    });
    await page.route("**/api/connections", (route) => route.fulfill({ json: [] }));
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const root = page.locator(".villages-forging-preparing");
    await expect(root.getByRole("heading", { name: "Station Fields is settling in" })).toBeVisible();
    const details = root
      .locator("details")
      .filter({ has: page.locator("summary", { hasText: "Preparation details" }) })
      .first();
    await details.locator("summary").click();
    await expect(details).toContainText("Waiting for Fixture System to write starting venue details");
    await expect(details).toContainText("Attempt 1");
    await expect(details).not.toContainText("of 3");
    snapshot.foundingPreparation = {
      ...snapshot.foundingPreparation,
      venueDetailsSeeded: true,
      phase: "private-spaces",
      currentVenueId: "aqua-home",
      currentZoneId: "private:base",
      privateSpacesReady: 1,
    };
    await expect(details).toContainText("Waiting for Fixture System to write this private space for Signal Loft");
    await expect(root.getByText("1 of 4 private spaces ready", { exact: true })).toBeVisible();
    await expect(details).not.toContainText("PRIVATE CONTENT");
    if (screenshotDir && width !== 320)
      await page.screenshot({ path: resolve(screenshotDir, `private-preparation-${width}.png`) });
    snapshot.foundingPreparation = {
      ...snapshot.foundingPreparation,
      phase: "residents",
      currentId: "aqua",
      currentVenueId: "",
      currentZoneId: "",
      privateSpacesReady: 4,
    };
    await expect(details).toContainText("Waiting for Fixture System to write wishes and a routine profile for Aqua");
    snapshot.foundingPreparation = {
      status: "pending",
      completedIds: [],
      currentId: "",
      error: "",
      venueDetailsSeeded: true,
    };
    await expect(details).toContainText("Preparing private spaces");
    snapshot.foundingPreparation = {
      ...snapshot.foundingPreparation,
      status: "failed",
      error: "Signal Loft · Fixture System · limit 3000 · finish length: Output was truncated.",
    };
    await expect(root.getByRole("button", { name: "Retry preparation", exact: true })).toBeVisible();
    await expect(root.getByRole("alert")).toContainText("Output was truncated");
    await expect(details).toContainText("Completed work is saved");
    await root.getByRole("button", { name: "Retry preparation", exact: true }).click();
    await expect.poll(() => retries).toBe(1);
    await expect(details).toContainText("Preparing private spaces");
    assert.ok(
      await root.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
      "no horizontal overflow",
    );
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Founding preparation browser: venue/private/resident progress, legacy fallback, retry and private-content boundaries passed at desktop, 390px and 320px.",
  );
} finally {
  await browser.close();
}
