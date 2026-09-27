import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
const now = new Date().toISOString();
const image = (color) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1000"><rect width="1500" height="1000" fill="${color}"/><path d="M0 500h1500M750 0v1000" stroke="#eee1bf" stroke-width="80"/></svg>`).toString("base64")}`;
const mapImage = image("#719b77");
const place = (id, x, y) => ({
  id,
  name: id === "mill" ? "The Mill" : id === "harbour" ? "The Harbour" : "The Market",
  classes: id === "mill" ? ["workplace", "gathering"] : ["other"],
  purpose: "A place to visit.",
  category: "destination",
  description: "A village place.",
  capabilities: [],
  presentation: { image: { ref: id, url: image(id === "mill" ? "#a77a54" : "#6e91aa"), id }, x, y },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  state: { condition: "sound", upgrades: [], furniture: [], publicFacts: [], updatedAt: now },
});
const snapshot = {
  status: "ready",
  isFounded: true,
  village: {
    name: "QA Village",
    setting: "",
    dateLabel: "Today",
    weekday: "Friday",
    season: "fall",
    dayPhase: "morning",
    instant: now,
    localTime: "7:00 AM",
    minuteOfDay: 420,
    timeZone: "UTC",
    hour: 7,
    minute: 0,
    weather: "clear",
    dayIndex: 1,
    nextTransitionAt: "",
  },
  noticeboard: [{ id: "note-1", text: "Market today", author: "Mara", at: now }],
  venueRequests: [],
  upgradeRequests: [],
  residences: [],
  happenings: [],
  villagers: [],
  recap: null,
  settings: {
    promptKnowledge: "",
    defaultPromptKnowledge: "",
    promptBoxMaxLength: 1000,
    storyPace: "normal",
    venues: [place("mill", 0.04, 0.08), place("harbour", 0.96, 0.92), place("market", 0.5, 0.5)],
    homeBuildingNames: {},
    homeBuildings: [],
    defaultHomeBuilding: "small-home",
    playerPersonaId: "",
    playerPersonaName: "",
    playerPersonaMissing: false,
    selectedLorebookIds: [],
    setting: "",
    foundingReason: "",
    foundingDetails: "",
    maxPlaces: 10,
    maxVenueNameLength: 80,
    maxVenueNoteLength: 2000,
    maxVenueImageUrlLength: 2000000,
    maxVenueImageIdLength: 100,
    maxVenueImageBytes: 1000000,
    villageGalleryFolderName: "QA Village",
    visitRetention: { mode: "forever", value: 0 },
    townMapImageSetAt: now,
    townMapExpectedWidth: 1500,
    townMapExpectedHeight: 1000,
    townMapView: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
    storyPaces: [],
    macros: [],
  },
};

try {
  for (const { width, height, mobile } of [
    { width: 390, height: 844, mobile: true },
    { width: 844, height: 390, mobile: true },
    { width: 800, height: 600, mobile: false },
    { width: 1440, height: 900, mobile: false },
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: mobile });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let session = {
      version: 1,
      id: "visit-1",
      placeId: "mill",
      placeName: "The Mill",
      startedAt: now,
      lastActivityAt: now,
      endedAt: "",
      status: "active",
      activeIds: [],
      participants: [],
      lines: [
        {
          id: "hello",
          role: "assistant",
          speakerId: "__venue_scene__",
          name: "",
          kind: "narration",
          content: "Welcome to the mill.",
          at: now,
        },
      ],
    };
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = snapshot;
      if (path.endsWith("/rooms/active")) value = { session: null, debugDiscardEnabled: false };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/personas")) value = { personas: [] };
      else if (path.endsWith("/lorebooks")) value = { books: [] };
      else if (path.endsWith("/catalog")) value = { characters: [] };
      else if (path.endsWith("/story")) value = { entries: [], total: 0 };
      else if (path.endsWith("/narration"))
        value = {
          styleInstructions: "",
          defaultStyleInstructions: "",
          styleMaxLength: 1000,
          tense: "present",
          person: "third",
          rating: "sfw",
        };
      else if (path.endsWith("/rooms/activity")) value = { session };
      else if (path.endsWith("/rooms") && route.request().method() === "POST") {
        const visited = snapshot.settings.venues.find((venue) => venue.id === route.request().postDataJSON().venueId);
        session = { ...session, placeId: visited.id, placeName: visited.name };
        value = { session };
      } else if (path.endsWith("/rooms/turn")) {
        const message = route.request().postDataJSON().message;
        session = {
          ...session,
          lines: [
            ...session.lines,
            { id: "player", role: "user", speakerId: "", name: "", content: message, at: now },
            {
              id: "answer",
              role: "assistant",
              speakerId: "__venue_scene__",
              name: "",
              kind: "narration",
              content: "First reply.\n\nSecond reply.\n\nThird reply.\n\nFourth reply.\n\nFifth reply.\n\nSixth reply.",
              at: now,
            },
            {
              id: "aside",
              role: "assistant",
              speakerId: "mara",
              name: "Mara",
              kind: "side",
              content: "A small aside rides with the final reply.",
              asideFor: "answer",
              at: now,
            },
            {
              id: "whisper",
              role: "assistant",
              speakerId: "mara",
              name: "Mara",
              kind: "whisper",
              targetId: "player",
              content: "A quiet word stays visible too.",
              asideFor: "answer",
              at: now,
            },
          ],
        };
        value = {
          session,
          verdict: null,
          action: null,
          recordEvents: [
            {
              id: "memory-responsive",
              kind: "memory",
              text: "The village remembered this exchange.",
              detail: "The player answered while Mara shared a quiet aside.",
            },
          ],
        };
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.route("http://villages.test/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7;--secondary:#384253}html,body{margin:0;width:100%;height:100%;background:var(--background);color:var(--foreground);font-family:Arial,sans-serif}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const home = page.locator(".marinara-capability-villages-home-full");
    await expect(home).toHaveAttribute("data-mobile", String(mobile));
    await expect(home.locator(".marinara-capability-villages-pin-photo-card")).toHaveCount(3);
    await expect(home.locator(".marinara-capability-villages-canvas-img")).toHaveAttribute("src", mapImage);
    await expect(home.locator(`[data-pin-id="${mobile ? "market" : "mill"}"]`)).toBeInViewport();
    await expect(page.getByRole("img", { name: "Weather: clear" })).toBeVisible();
    if (!mobile) {
      await expect(page.getByRole("button", { name: "Places" })).toBeVisible();
      await expect(page.getByRole("button", { name: /whole screen/u })).toBeVisible();
      const stage = await home.locator(".marinara-capability-villages-stage").boundingBox();
      assert.ok(stage && stage.width <= width && stage.height <= height, "desktop fits the whole map");
      const bar = await home.locator(".marinara-capability-villages-home-bar").boundingBox();
      assert.ok(bar && stage.y >= bar.y + bar.height, "desktop controls sit above the map");
      await expect(home.locator('[data-pin-id="harbour"]')).toBeInViewport();
    }
    if (process.env.VILLAGES_VISUAL_OUTPUT) {
      await page.screenshot({
        path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, `villages-home-${width}x${height}.png`),
      });
    }

    await page.getByRole("button", { name: /Noticeboard \(1\)/u }).click();
    await expect(page.getByRole("heading", { name: "Noticeboard", level: 1 })).toBeVisible();
    await expect(page.getByText("Market today")).toBeVisible();
    await page.getByRole("button", { name: "Back to menu" }).click();
    await expect(page.getByRole("button", { name: "General Settings" })).toBeVisible();
    await page.getByRole("button", { name: "Village Settings" }).click();
    await expect(page.getByRole("button", { name: "Town map", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Back to menu" }).click();
    await page.getByRole("button", { name: "DEBUG Settings" }).click();
    await expect(page.getByRole("button", { name: "Venue Visits" })).toBeVisible();
    await page.getByRole("button", { name: "Back to menu" }).click();
    await page.getByRole("button", { name: "Back to the village" }).click();
    await page.getByRole("button", { name: "Open settings menu" }).click();
    await expect(page.getByRole("button", { name: "General Settings" })).toBeVisible();
    await page.getByRole("button", { name: "Back to the village" }).click();

    const visitedId = mobile ? "market" : "mill";
    const pin = home.locator(`[data-pin-id="${visitedId}"]`);
    await pin.focus();
    await page.keyboard.press("Enter");
    const doors = home.locator(".marinara-capability-villages-doors");
    await expect(doors.getByRole("button", { name: "Visit" })).toBeVisible();
    const bounds = await doors.boundingBox();
    assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width, "edge pin choices stay on screen");
    if (!mobile) {
      await home.locator('[data-pin-id="harbour"]').click();
      const harbourBounds = await doors.boundingBox();
      assert.ok(
        harbourBounds &&
          harbourBounds.x >= 0 &&
          harbourBounds.x + harbourBounds.width <= width &&
          harbourBounds.y + harbourBounds.height <= height,
        "choices at the lower right map edge stay on screen",
      );
      await pin.click();
    }
    await doors.getByRole("button", { name: /View venue/i }).click();
    await expect(page.getByText("Nobody is here right now")).toBeVisible();
    await expect(page.getByRole("button", { name: "Visit Venue" })).toBeVisible();
    await expect(page.getByRole("button", { name: "About" })).toHaveCount(0);
    if (process.env.VILLAGES_VISUAL_OUTPUT) {
      await page.screenshot({
        path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, `villages-venue-${width}x${height}.png`),
      });
    }
    if (!mobile) {
      await page.getByRole("button", { name: "Visit Venue" }).click();
      await expect(page.getByText("Choose a space")).toBeVisible();
      await expect(page.getByRole("button", { name: "Workplace space" })).toBeVisible();
    }
    await page.getByRole("button", { name: "Edit Venue" }).click();
    await expect(page.getByRole("button", { name: "Close Editor" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Visit Venue" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Back to map" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Propose Change" })).toHaveCount(0);
    if (process.env.VILLAGES_VISUAL_OUTPUT) {
      await page.screenshot({
        path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, `villages-venue-edit-${width}x${height}.png`),
      });
    }
    await page.getByRole("textbox", { name: "Name", exact: true }).fill("Unsaved venue name");
    page.once("dialog", (dialog) => void dialog.dismiss());
    await page.getByRole("button", { name: "Close Editor" }).click();
    await expect(page.getByRole("button", { name: "Close Editor" })).toBeVisible();
    page.once("dialog", (dialog) => void dialog.accept());
    await page.getByRole("button", { name: "Close Editor" }).click();
    await page.getByRole("button", { name: "Propose Change" }).click();
    await expect(page.getByRole("button", { name: "Exit Change Proposal" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit Venue" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Visit Venue" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Back to map" })).toHaveCount(0);
    if (process.env.VILLAGES_VISUAL_OUTPUT) {
      await page.screenshot({
        path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, `villages-venue-proposal-${width}x${height}.png`),
      });
    }
    await page.getByRole("textbox", { name: /Improvement title/u }).fill("Unsaved improvement");
    page.once("dialog", (dialog) => void dialog.dismiss());
    await page.getByRole("button", { name: "Exit Change Proposal" }).click();
    await expect(page.getByRole("button", { name: "Exit Change Proposal" })).toBeVisible();
    page.once("dialog", (dialog) => void dialog.accept());
    await page.getByRole("button", { name: "Exit Change Proposal" }).click();
    await page.getByRole("button", { name: "Back to map" }).click();
    await pin.focus();
    await page.keyboard.press("Enter");
    await doors.getByRole("button", { name: "Visit" }).click();
    const composer = page.getByRole("textbox", { name: mobile ? "Message at The Market" : "Message at The Mill" });
    await composer.fill("My response.");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("region", { name: "Current paragraph" })).toContainText("First reply.");
    await expect(page.getByRole("region", { name: "Current paragraph" })).not.toContainText("Sixth reply.");
    const memoryTrigger = page.getByRole("button", { name: "View memory: The village remembered this exchange." });
    await memoryTrigger.click();
    await expect(page.getByRole("dialog", { name: "The village remembered this exchange." })).toContainText(
      "The player answered while Mara shared a quiet aside.",
    );
    await page.getByRole("button", { name: "Close memory" }).click();
    await expect(memoryTrigger).toBeFocused();
    for (let step = 0; step < 5; step += 1) await page.getByRole("button", { name: "Next paragraph" }).click();
    await expect(page.getByRole("region", { name: "Current paragraph" })).toContainText("Sixth reply.");
    const asideBand = page.locator(".marinara-capability-villages-chat-vn-asides");
    await expect(asideBand).toContainText("A small aside rides with the final reply.");
    await expect(asideBand).toContainText("A quiet word stays visible too.");
    const asideOverflow = await asideBand.evaluate((element) => ({
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
    }));
    assert.ok(
      asideOverflow.scrollHeight <= asideOverflow.clientHeight + 1,
      `the ${width}x${height} two-bubble fixture is fully readable without clipping (${asideOverflow.scrollHeight}/${asideOverflow.clientHeight})`,
    );
    const asideBox = await asideBand.boundingBox();
    const composerBox = await page.locator(".marinara-capability-villages-composer").boundingBox();
    assert.ok(
      asideBox &&
        composerBox &&
        asideBox.x >= 0 &&
        asideBox.x + asideBox.width <= width &&
        asideBox.y >= 0 &&
        asideBox.y + asideBox.height <= composerBox.y,
      "aside and whisper bubbles stay visible above the composer",
    );
    assert.equal(
      await asideBand.evaluate((element) => getComputedStyle(element).position),
      mobile ? "static" : "absolute",
      "mobile asides reserve visible space while desktop asides continue floating",
    );
    assert.deepEqual(errors, [], `${width}×${height} renders without page errors`);
    if (process.env.VILLAGES_VISUAL_OUTPUT) {
      await page.screenshot({
        path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, `villages-room-${width}x${height}.png`),
      });
    }
    await page.close();
  }
  console.log("Villages desktop parity: four viewports, menu, map controls, and reply reading passed");
} finally {
  await browser.close();
}
