import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
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
  villagers: [{ characterId: "mara", name: "Mara", summary: "", tags: [], missing: false, place: null }],
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

snapshot.backgroundWork = [
  {
    id: "villages-background-" + "a".repeat(64),
    kind: "agenda",
    subjectId: "mara",
    label: "Mara's agenda",
    status: "failed",
    attempt: 2,
    completedSteps: 3,
    requests: 4,
    tokens: null,
    error: "Wednesday unavailable",
    connectionPaused: true,
  },
];
snapshot.backgroundWork[0].failedAt = "2026-09-28T12:00:00.000Z";
snapshot.backgroundWork[0].failure = { cause: "provider_exception", stage: "dispatch" };
snapshot.backgroundWork.push({
  id: "villages-background-" + "b".repeat(64),
  kind: "wish-check",
  subjectId: "finished",
  label: "Finished Wish check",
  status: "completed",
  attempt: 1,
  completedSteps: 1,
  requests: 1,
  tokens: 200,
  error: "",
  connectionPaused: false,
});
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
const errors = [],
  heartbeats = [],
  retries = [];
let acceptedRetries = 0;
try {
  await page.clock.install();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/villages**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/background/presence")) {
      heartbeats.push(route.request().postDataJSON());
      return route.fulfill({ json: { ready: true, snapshot } });
    }
    if (path.endsWith("/background/retry")) {
      const action = route.request().postDataJSON();
      retries.push(action);
      if (retries.length === 1) {
        acceptedRetries++;
        snapshot.backgroundWork[0].attempt++;
        await route.abort(); // The server accepted it but its HTTP response was lost.
        return;
      }
      assert.deepEqual(action, retries[0], "retrying a lost response retains action ID and expected attempt");
      return route.fulfill({ json: snapshot });
    }
    const response = path.endsWith("/catalog")
      ? { characters: [] }
      : path.endsWith("/agendas")
        ? { villagers: [] }
        : path.endsWith("/rooms/active")
          ? { session: null }
          : path.endsWith("/connections")
            ? {}
            : path.endsWith("/narration")
              ? { tense: "present", person: "second", rating: "sfw" }
              : snapshot;
    return route.fulfill({ json: response });
  });
  await page.route("**/api/connections", (route) => route.fulfill({ json: [] }));
  await page.route("http://villages.test/", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<style>html,body{margin:0;width:100%;height:100%;font-family:Arial}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
    }),
  );
  await page.goto("http://villages.test/");
  // HTTP LAN contexts lack randomUUID; exercise the production fallback.
  await page.evaluate(() => {
    Object.defineProperty(globalThis.crypto, "randomUUID", { value: undefined });
  });
  await page.addScriptTag({ path: resolve("packages/villages/client.js") });
  await expect.poll(() => heartbeats.some((beat) => beat.visible)).toBe(true);
  await page.getByRole("button", { name: "More" }).click();
  await expect(page.getByText("Wednesday unavailable", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Needs attention (1)" })).toBeVisible();
  await expect(page.getByText(/Background work: 0 running \/ queued, 0 paused, 1 need attention/)).toBeVisible();
  await expect(page.getByText("Finished Wish check", { exact: true })).not.toBeVisible();
  await page.getByText("Completed history (1)", { exact: true }).click();
  await expect(page.getByText("Finished Wish check", { exact: true })).toBeVisible();
  await page.getByText("Completed history (1)", { exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByText("Wednesday unavailable", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry unfinished work" })).toBeVisible();
  await expect(page.getByText(/3 reusable steps, 4 requests, token usage unavailable/)).toBeVisible();
  await page.getByRole("button", { name: "Retry unfinished work" }).click();
  await expect(page.getByRole("alert")).toContainText("Failed to fetch");
  await page.clock.fastForward(30_000);
  await expect.poll(() => heartbeats.length).toBeGreaterThan(1);
  await page.getByRole("button", { name: "Retry unfinished work" }).click();
  await expect.poll(() => retries.length).toBe(2);
  assert.equal(acceptedRetries, 1);
  await page.getByRole("button", { name: /^Villagers \(/ }).click();
  await page.getByRole("button", { name: "Open Mara profile" }).click();
  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  await expect(page.getByText("Mara's agenda", { exact: true })).toBeVisible();
  if (process.env.VILLAGES_BACKGROUND_SCREENSHOT)
    await page.screenshot({ path: process.env.VILLAGES_BACKGROUND_SCREENSHOT });
  await page.evaluate(() => {
    document.querySelector("marinara-capability-villages").style.display = "none";
  });
  await expect.poll(() => heartbeats.at(-1)?.visible).toBe(false);
  assert.deepEqual(errors, []);
  console.log(
    "Villages background UI: contextual recovery, lost response IDs, HTTP LAN, heartbeat and visibility passed",
  );
} finally {
  await browser.close();
}
