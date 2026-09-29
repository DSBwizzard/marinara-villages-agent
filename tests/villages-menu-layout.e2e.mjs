import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
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
  villageCapabilities: [],
  upgradeRequests: [],
  residences: [],
  venueMail: [],
  happenings: [],
  villagers: [],
  foundingPreparation: null,
  recap: null,
  settings: {
    characterSpeechColors: false,
    visitRetention: { mode: "forever", value: 0 },
    promptKnowledge: "",
    defaultPromptKnowledge: "",
    promptBoxMaxLength: 2000,
    macros: [],
    storyPace: "off",
    storyPaces: ["off"],
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
    townMapImageSetAt: "",
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
  [/^Villagers \(/, "villagers"],
  [/^Noticeboard \(/, "noticeboard"],
  [/^Venue Requests \(/, "venueRequests"],
  [/^Projects \(/, "projects"],
  [/^Homes \(/, "homes"],
  [/^Town map$/, "map"],
  [/^Village Settings$/, "village"],
  [/^General settings$/, "general"],
  [/^DEBUG: Village Story/, "story"],
  [/^DEBUG: Venue Visits/, "chatlogs"],
  [/^DEBUG: Villager Wishes/, "agendas"],
  [/^Villager Agendas/, "schedules"],
];

try {
  for (const { width, height, foreground, surface } of [
    { width: 1366, height: 768, foreground: "#f4f0e8", surface: "#171b25" },
    { width: 1366, height: 500, foreground: "#f4f0e8", surface: "#171b25" },
    { width: 390, height: 844, foreground: "#121212", surface: "#ffffff" },
    { width: 390, height: 650, foreground: "#121212", surface: "#ffffff" },
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    let failStory = false;
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/villages**", (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/story") && failStory) {
        return route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"Story unavailable"}' });
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
                        ? { passing: [], durable: [], archives: [], pending: [] }
                        : path.endsWith("/rooms/active")
                          ? { session: null }
                          : snapshot;
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(response) });
    });
    await page.route("**/api/connections", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );
    await page.route("http://villages.test/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `<style>:root{--background:${surface};--foreground:${foreground};--popover:${surface};--border:#ccc;--primary:#8a64ff;--muted-foreground:#888}html,body{margin:0;width:100%;height:100%;font-family:Arial,sans-serif}${tag}{display:block;width:100%;height:100%}</style><${tag}></${tag}>`,
      }),
    );
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });

    const root = page.locator(`.${tag}-sectioned-menu`);
    await page.getByRole("button", { name: "Open settings menu" }).click();
    await expect(root).toBeVisible();
    await expect(root.locator(`.${tag}-menu-welcome`)).toBeVisible();
    const nav = root.getByRole("navigation", { name: "Village menu pages" });
    const main = root.locator(`.${tag}-menu-content`);
    await expect(nav).toBeVisible();
    await expect(main).toBeVisible();
    if (process.env.VILLAGES_MENU_SCREENSHOTS) {
      await page.screenshot({ path: join(process.env.VILLAGES_MENU_SCREENSHOTS, `menu-index-${width}-${height}.png`) });
    }
    for (const [name, key] of pages) {
      await nav.getByRole("button", { name }).click();
      await expect(root).toHaveAttribute("data-page", key);
      await expect(main).toBeVisible();
      if (key === "village") {
        await expect(main.getByRole("textbox", { name: "Additional writing guidance" })).toBeVisible();
        await expect(nav.getByRole("button", { name: "DEBUG: Villager reply guidance" })).toHaveCount(0);
      }
      if (process.env.VILLAGES_MENU_SCREENSHOTS && ["villagers", "projects", "village", "story"].includes(key)) {
        await page.screenshot({
          path: join(process.env.VILLAGES_MENU_SCREENSHOTS, `menu-${key}-${width}-${height}.png`),
        });
      }
      assert.ok((await main.innerText()).trim().length > 10, `${key} has visible content`);
      await expect(nav.getByRole("button", { name })).toHaveAttribute("data-active", "true");
      const { color, background, area } = await main.evaluate((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          color: style.color,
          background: getComputedStyle(element.closest(".marinara-capability-villages-sectioned-menu")).backgroundImage,
          area: rect.width * rect.height,
        };
      });
      assert.equal(color, "rgb(243, 244, 255)", `${key} has readable menu text`);
      assert.match(background, /gradient/, `${key} has the menu surface`);
      assert.ok(area > 1000, `${key} occupies a visible area`);
    }
    await root.getByRole("button", { name: "Back to menu" }).click();
    await expect(root).toHaveAttribute("data-page", "index");
    await expect(root.locator(`.${tag}-menu-welcome`)).toBeVisible();
    failStory = true;
    await nav.getByRole("button", { name: /^DEBUG: Village Story/ }).click();
    await expect(root.getByRole("alert")).toBeVisible();
    await expect(main).toBeVisible();
    failStory = false;
    await root.getByRole("button", { name: "Back to menu" }).click();
    await page.evaluate(() => document.getElementById("marinara-capability-villages-styles").remove());
    await expect.poll(() => page.locator("#marinara-capability-villages-styles").count()).toBe(1);
    await root.getByRole("button", { name: "Back to the village" }).click();
    await page.getByRole("button", { name: /^Noticeboard \(/ }).click();
    await expect(root).toHaveAttribute("data-page", "noticeboard");
    await expect(nav).toBeVisible();
    if (process.env.VILLAGES_MENU_SCREENSHOTS) {
      await page.screenshot({
        path: join(process.env.VILLAGES_MENU_SCREENSHOTS, `menu-noticeboard-${width}-${height}.png`),
      });
    }
    await page.evaluate((elementName) => {
      const old = document.querySelector(elementName);
      old.replaceWith(document.createElement(elementName));
    }, tag);
    await page.getByRole("button", { name: "Open settings menu" }).click();
    await expect(root).toHaveAttribute("data-page", "index");
    await expect(nav).toBeVisible();
    await nav.getByRole("button", { name: /^Homes \(/ }).click();
    await main.getByRole("button", { name: "Put a home on the map" }).click();
    await page.locator(`.${tag}-stage`).click({ position: { x: 80, y: 80 } });
    await expect(root).toHaveAttribute("data-page", "homes");
    await expect(main).toBeVisible();
    if (width > 700 && height > 700) {
      await root.getByRole("button", { name: "Back to menu" }).click();
      await root.getByRole("button", { name: "Back to the village" }).click();
      await page.getByRole("button", { name: "Use the whole screen" }).click();
      await expect.poll(() => page.evaluate(() => document.fullscreenElement?.tagName.toLowerCase())).toBe(tag);
      await page.getByRole("button", { name: "Open settings menu" }).click();
      await expect(root).toBeVisible();
      await expect(nav).toBeVisible();
      await expect(main).toBeVisible();
      await page.evaluate(() => document.exitFullscreen());
    }
    assert.deepEqual(errors, [], `no browser errors at ${width}×${height}`);
    await page.close();
  }
  console.log("Villages Menu: all pages visible across desktop and phone layouts.");
} finally {
  await browser.close();
}
