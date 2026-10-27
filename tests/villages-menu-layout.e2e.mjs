import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
const tag = "marinara-capability-villages";
const snapshot = {
  status: "ready",
  isFounded: true,
  village: {
    name: "Test Village",
    setting: "A quiet village",
    dateLabel: "Day 1",
    weekday: "Monday",
    season: "Spring",
    dayPhase: "morning",
    instant: "2026-09-28T12:00:00.000Z",
    localTime: "8:00 AM",
    minuteOfDay: 480,
    timeZone: "America/Los_Angeles",
    hour: 8,
    minute: 0,
    weather: "Clear",
    dayIndex: 1,
    nextTransitionAt: "2026-09-28T18:00:00.000Z",
  },
  noticeboard: [],
  venueRequests: [],
  projects: [],
  residences: [],
  venueMail: [],
  villagers: [],
  foundingPreparation: null,
  settings: {
    characterSpeechColors: false,
    visitRetention: { mode: "forever", value: 0 },
    promptKnowledge: "",
    defaultPromptKnowledge: "",
    promptBoxMaxLength: 2000,
    macros: [],
    backgroundPace: "off",
    backgroundPaces: ["off"],
    villageNameMaxLength: 80,
    playerPersonaId: "",
    playerPersonaName: "",
    playerPersonaMissing: false,
    maxNoticeboardNotes: 12,
    maxNoticeLength: 500,
    setting: "A quiet village",
    settingMaxLength: 2000,
    foundingReason: "",
    foundingDetails: "",
    foundingGuidance: "",
    scenarioImprint: null,
    worldFacts: [],
    selectedLorebookIds: [],
    loreTokenBudget: 1600,
    loreTokenBudgetMin: 200,
    loreTokenBudgetMax: 3200,
    foundingDetailsMaxLength: 2000,
    foundingGuidanceMaxLength: 500,
    townMapLayoutPrompt: "",
    townMapNegativePrompt: "",
    venues: [],
    homeBuildingNames: {},
    maxPlaces: 20,
    maxVenueNameLength: 80,
    maxVenueNoteLength: 500,
    maxVenueImageUrlLength: 10000,
    maxVenueImageIdLength: 100,
    maxVenueImageBytes: 1000000,
    villageGalleryFolderName: "Villages",
    homeBuildings: [],
    defaultHomeBuilding: "small-home",
    setupHomeCount: 4,
    setupPlaceCount: 5,
    setupMinVillagerCount: 0,
    setupMaxVillagerCount: 3,
    maps: [
      {
        id: "map-house",
        name: "Village map",
        artwork: { ref: "map", url: mapImage },
        width: 1500,
        height: 1000,
        view: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
        revision: 1,
      },
    ],
    townMapImageMaxLength: 100000,
    townMapView: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
    townMapExpectedWidth: 1280,
    townMapExpectedHeight: 720,
    townMapGenerationWidth: 1280,
    townMapGenerationHeight: 720,
    townMapZoomMin: 1,
    townMapZoomMax: 3,
    townMapZoomStep: 0.1,
  },
};

const pages = [
  [/^Venue Requests \(/, "venueRequests"],
  [/^Projects \(/, "projects"],
  [/^Village Settings$/, "village"],
  [/^General settings$/, "general"],
  [/^DEBUG: Scenes/, "chatlogs"],
  [/^DEBUG: Progress$/, "progress"],
];

try {
  for (const { width, height, foreground, surface } of [
    { width: 1366, height: 768, foreground: "#f4f0e8", surface: "#171b25" },
    { width: 1366, height: 500, foreground: "#f4f0e8", surface: "#171b25" },
    { width: 390, height: 844, foreground: "#121212", surface: "#ffffff" },
    { width: 390, height: 650, foreground: "#121212", surface: "#ffffff" },
  ]) {
    const mobile = width <= 704;
    const page = await browser.newPage({ viewport: { width, height } });
    await mockEngineLookups(page);
    const errors = [];
    let progressReads = 0;
    let progressFails = false;
    let holdWorldSave = false,
      heldWorldSave,
      holdMapSave = false,
      heldMapSave;
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/villages**", (route) => {
      const path = new URL(route.request().url()).pathname;
      if (holdWorldSave && path.endsWith("/settings") && route.request().method() === "PATCH") {
        heldWorldSave = route;
        return;
      }
      if (holdMapSave && path.endsWith("/maps/map-house") && route.request().method() === "PUT") {
        heldMapSave = route;
        return;
      }
      if (path.endsWith("/progress/debug")) {
        progressReads += 1;
        return fulfill(route, {
          status: progressFails ? 503 : 200,
          contentType: "application/json",
          body: JSON.stringify(
            progressFails
              ? { error: "Diagnostics are offline." }
              : {
                  engineVersion: `synthetic-${progressReads}`,
                  backlog: [],
                  speechProofs: [],
                  tasks: [],
                },
          ),
        });
      }
      const response = path.endsWith("/connections")
        ? { systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" }
        : path.endsWith("/narration")
          ? {
              tense: "present",
              person: "second",
              rating: "sfw",
              writingGuidance: "",
              writingGuidanceMaxLength: 4000,
            }
          : path.endsWith("/catalog")
            ? { characters: [] }
            : path.endsWith("/personas")
              ? { personas: [] }
              : path.endsWith("/lorebooks")
                ? { books: [] }
                : path.endsWith("/story")
                  ? { entries: [], total: 0 }
                  : path.endsWith("/agendas")
                    ? { villagers: [] }
                    : path.endsWith("/rooms/archive")
                      ? { visits: [], total: 0 }
                      : path.endsWith("/memories")
                        ? {
                            generatedAt: new Date().toISOString(),
                            residents: [],
                            recollections: [],
                            durable: [],
                            expiredRecollectionCount: 0,
                            archive: { total: 0, pendingReviewCount: 0, recent: [] },
                          }
                        : path.endsWith("/rooms/active")
                          ? { session: null, debugDiscardEnabled: true }
                          : snapshot;
      return fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(response) });
    });
    await page.route("**/api/connections", (route) =>
      fulfill(route, {
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );
    await page.route("http://villages.test/", (route) =>
      fulfill(route, {
        status: 200,
        contentType: "text/html",
        body: `<style>:root{--background:${surface};--foreground:${foreground};--popover:${surface};--border:#ccc;--primary:#8a64ff;--muted-foreground:#888}html,body{margin:0;width:100%;height:100%;font-family:Arial,sans-serif}${tag}{display:block;width:100%;height:100%}</style><${tag}></${tag}>`,
      }),
    );
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });

    const root = page.locator(`.${tag}-sectioned-menu`);
    await page.getByRole("button", { name: "More" }).click();
    await expect(root).toBeVisible();
    await expect(root.locator(`.${tag}-menu-welcome`)).toBeVisible();
    await expect(root.getByRole("button", { name: "Events", exact: true })).toHaveCount(0);
    await expect(root.getByRole("button", { name: "Force Village Update", exact: true })).toHaveCount(0);
    const nav = root.getByRole("navigation", { name: "Village menu pages" });
    const main = root.locator(`.${tag}-menu-content`);
    await expect(nav).toBeVisible();
    await expect(main).toBeVisible();
    if (process.env.VILLAGES_MENU_SCREENSHOTS) {
      await page.screenshot({ path: join(process.env.VILLAGES_MENU_SCREENSHOTS, `menu-index-${width}-${height}.png`) });
    }
    for (const [name, key] of pages) {
      await nav.getByRole("button", { name }).click();
      if (key === "projects") {
        const portfolio = page.getByRole("main", { name: "Projects" });
        await expect(portfolio).toBeVisible();
        await expect(nav).toHaveCount(0);
        await expect(portfolio.getByRole("button", { name: "New Venue", exact: true })).toBeEnabled();
        await expect(portfolio.getByRole("button", { name: "Renovation", exact: true })).toBeEnabled();
        const box = await portfolio.boundingBox();
        assert.ok(box && box.x >= 0 && box.x + box.width <= width, "the dedicated portfolio fits the viewport");
        if (process.env.VILLAGES_MENU_SCREENSHOTS)
          await page.screenshot({
            path: join(process.env.VILLAGES_MENU_SCREENSHOTS, "menu-projects-" + width + "-" + height + ".png"),
          });
        await portfolio.getByRole("button", { name: /^Close/ }).click();
        await expect(root).toHaveAttribute("data-page", "index");
        continue;
      }
      await expect(root).toHaveAttribute("data-page", key);
      await expect(main).toBeVisible();
      if (key === "general") {
        await expect(main.getByRole("combobox", { name: "Resident activity and Wishes" })).toBeVisible();
      }
      if (key === "chatlogs") {
        await expect(root.getByRole("button", { name: "Force Village Update", exact: true })).toHaveCount(0);
      }
      if (key === "village") {
        await expect(main.getByRole("textbox", { name: "Additional writing guidance" })).toHaveCount(0);
        await expect(nav.getByRole("button", { name: "DEBUG: Villager reply guidance" })).toHaveCount(0);
        const worldName = main.getByRole("textbox", { name: "Village world", exact: true });
        const original = await worldName.inputValue();
        await worldName.fill("An unsaved world name");
        page.once("dialog", (dialog) => dialog.dismiss());
        await page
          .getByRole("navigation", { name: "Village navigation" })
          .getByRole("button", { name: "Map", exact: true })
          .click();
        await expect(worldName).toHaveValue("An unsaved world name");
        holdWorldSave = true;
        await worldName.locator("..").locator("..").getByRole("button", { name: "Save", exact: true }).click();
        await expect.poll(() => !!heldWorldSave).toBe(true);
        await expect(
          page
            .getByRole("navigation", { name: "Village navigation" })
            .getByRole("button", { name: "Map", exact: true }),
        ).toBeDisabled();
        await fulfill(heldWorldSave, { json: snapshot });
        holdWorldSave = false;
        await expect(worldName).toBeEnabled();
        await worldName.fill(original);
        await main.getByRole("button", { name: "Edit map", exact: true }).click();
        const mapName = main.getByRole("textbox", { name: "Map name", exact: true });
        await expect(mapName).toBeEnabled();
        await mapName.fill("An unsaved map name");
        page.once("dialog", (dialog) => dialog.dismiss());
        await page
          .getByRole("navigation", { name: "Village navigation" })
          .getByRole("button", { name: "Projects", exact: true })
          .click();
        await expect(mapName).toHaveValue("An unsaved map name");
        holdMapSave = true;
        await main.getByRole("button", { name: "Save map", exact: true }).click();
        await expect.poll(() => !!heldMapSave).toBe(true);
        await expect(
          page
            .getByRole("navigation", { name: "Village navigation" })
            .getByRole("button", { name: "Projects", exact: true }),
        ).toBeDisabled();
        await fulfill(heldMapSave, { json: snapshot });
        holdMapSave = false;
        await expect(mapName).toHaveCount(0);
      }
      if (key === "progress") {
        await expect(main.getByText("Engine version: synthetic-1", { exact: true })).toBeVisible();
        assert.equal(progressReads, 1, "opening diagnostics starts one read");
        await main.getByRole("button", { name: "Refresh diagnostics", exact: true }).click();
        await expect(main.getByText("Engine version: synthetic-2", { exact: true })).toBeVisible();
        assert.equal(progressReads, 2, "refresh starts one independent read");
        progressFails = true;
        await main.getByRole("button", { name: "Refresh diagnostics", exact: true }).click();
        await expect(main.getByRole("alert")).toHaveText("Diagnostics are offline.");
        await expect(main.getByText("Engine version: loading", { exact: true })).toBeVisible();
        assert.equal(progressReads, 3, "failed refresh is not automatically retried");
        progressFails = false;
        await main.getByRole("button", { name: "Refresh diagnostics", exact: true }).click();
        await expect(main.getByText("Engine version: synthetic-4", { exact: true })).toBeVisible();
        assert.equal(progressReads, 4, "explicit refresh recovers with one read");
        await expect(main.getByRole("alert")).toHaveText("Diagnostics are offline.");
        progressFails = true;
        await nav.getByRole("button", { name: /^Projects \(/ }).click();
        await page
          .getByRole("main", { name: "Projects" })
          .getByRole("button", { name: /^Close/ })
          .click();
        await nav.getByRole("button", { name: /^DEBUG: Progress$/ }).click();
        await expect(main.getByText("Engine version: loading", { exact: true })).toBeVisible();
        await expect(main.getByRole("alert")).toHaveText("Diagnostics are offline.");
        assert.equal(progressReads, 5, "navigation retains its single-read error policy");
      }
      if (process.env.VILLAGES_MENU_SCREENSHOTS && ["villagers", "projects", "village", "memories"].includes(key)) {
        await page.screenshot({
          path: join(process.env.VILLAGES_MENU_SCREENSHOTS, `menu-${key}-${width}-${height}.png`),
        });
      }
      assert.ok((await main.innerText()).trim().length > 10, `${key} has visible content`);
      await expect(nav.getByRole("button", { name })).toHaveAttribute("data-active", "true");
      const { contrast, area } = await main.evaluate((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const surface = getComputedStyle(element.closest(".marinara-capability-villages-sectioned-menu"));
        const luminance = (value) =>
          value
            .match(/[\d.]+/g)
            .slice(0, 3)
            .map(Number)
            .map((channel) => {
              const v = channel / 255;
              return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
            })
            .reduce((total, channel, i) => total + channel * [0.2126, 0.7152, 0.0722][i], 0);
        const a = luminance(style.color),
          b = luminance(surface.backgroundColor);
        return {
          contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
          area: rect.width * rect.height,
        };
      });
      assert.ok(contrast >= 4.5, `${key} has readable menu text`);
      assert.ok(area > 1000, `${key} occupies a visible area`);
    }
    await root.getByRole("button", { name: "Back to menu" }).click();
    await expect(root).toHaveAttribute("data-page", "index");
    await expect(root.locator(`.${tag}-menu-welcome`)).toBeVisible();
    await nav.getByRole("button", { name: /^Villagers \(/ }).click();
    await expect(page.getByRole("main", { name: "Villagers directory" })).toBeVisible();
    await expect(nav).toHaveCount(0);
    await expect(page.getByRole("searchbox", { name: "Search villagers" })).toBeVisible();
    await page.getByRole("button", { name: "Close ×" }).click();
    await page.evaluate(() => document.getElementById("marinara-capability-villages-styles").remove());
    await expect.poll(() => page.locator("#marinara-capability-villages-styles").count()).toBe(1);
    await root.getByRole("button", { name: "Back to the village" }).click();
    await expect(page.getByRole("button", { name: /^Notices \(/ })).toHaveCount(0);
    await page.evaluate((elementName) => {
      const old = document.querySelector(elementName);
      old.replaceWith(document.createElement(elementName));
    }, tag);
    await page.getByRole("button", { name: "More" }).click();
    await expect(root).toHaveAttribute("data-page", "index");
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("button", { name: /^Homes \(/ })).toHaveCount(0);
    assert.deepEqual(errors, [], `no browser errors at ${width}×${height}`);
    await page.close();
  }
  console.log("Villages Menu: all pages visible across desktop and phone layouts.");
} finally {
  await browser.close();
}
