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
const spriteImage = (color) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="700"><circle cx="150" cy="100" r="65" fill="${color}"/><path d="M90 175h120l45 360H45zM105 530h35v170h-45zM160 530h35l45 170h-45z" fill="${color}"/></svg>`).toString("base64")}`;
const residentNames = ["Mara", "Eli", "Lina", "Taro"];
const residents = residentNames.map((name, index) => ({
  characterId: name.toLowerCase(),
  name,
  sprite: {
    assetId: name.toLowerCase(),
    expressions: [],
    images: [
      { view: "front", label: "neutral", url: spriteImage(["#e8ba91", "#a7cdf2", "#d9a8cd", "#bbd59a"][index]) },
    ],
    framing: { mode: "full", cropPercent: 0 },
  },
  summary: "A resident of the village.",
  tags: [],
  missing: false,
  place: null,
}));
const longGreeting =
  "The mill hums softly while dust turns in the late light, and each villager pauses to listen. ".repeat(12);
const mapImage = image("#719b77");
const place = (id, x, y) => ({
  id,
  name: id === "mill" ? "The Mill" : id === "harbour" ? "The Harbour" : "The Market",
  classes: id === "mill" ? ["workplace", "gathering"] : ["other"],
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
  projects: [],
  villageCapabilities: [],
  upgradeRequests: [],
  residences: [],
  happenings: [],
  villagers: residents,
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
    { width: 1917, height: 655, mobile: false },
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: mobile });
    const fixtureSnapshot =
      width === 800
        ? {
            ...snapshot,
            villagers: residents.map((resident, index) => (index === 3 ? { ...resident, sprite: null } : resident)),
          }
        : width === 1440
          ? {
              ...snapshot,
              settings: {
                ...snapshot.settings,
                venues: [
                  ...snapshot.settings.venues,
                  {
                    ...place("home", 0.76, 0.23),
                    name: "Mara's home",
                    classes: ["residence"],
                    residentIds: ["mara"],
                    residenceCapacity: 1,
                    occupancy: { playerHome: false, residentCharacterId: "mara", homeKind: null },
                  },
                ],
              },
            }
          : snapshot;
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let lastTurn = null;
    let lastEntry = null;
    let lastLeave = null;
    let session = {
      version: 1,
      id: "visit-1",
      placeId: "mill",
      placeName: "The Mill",
      startedAt: now,
      lastActivityAt: now,
      endedAt: "",
      status: "active",
      activeIds: residents.map((resident) => resident.characterId),
      participants: residents.map(({ characterId, name }) => ({ characterId, name, doing: "spending time here" })),
      lines: [
        {
          id: "hello",
          role: "assistant",
          speakerId: "__venue_scene__",
          name: "",
          kind: "narration",
          content: longGreeting,
          at: now,
        },
      ],
    };
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/locations/venue/home/player-move")) {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({ error: "This home has no room for another resident." }),
        });
        return;
      }
      let value = fixtureSnapshot;
      if (path.endsWith("/sprites/studio") || path.endsWith("/sprites/studio/settings"))
        value = {
          version: 1,
          settings: {
            style: "PAPERCRAFT",
            prompts: { PAPERCRAFT: "Paper", BATTLEHIGHWAY: "Angular", Custom: "" },
            connectionId: "",
          },
          jobs: [],
          connections: [],
          reference: null,
        };
      else if (path.endsWith("/rooms/active")) value = { session: null, debugDiscardEnabled: false };
      else if (path.endsWith("/rooms/archive")) value = { visits: [], total: 0 };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/personas")) value = { personas: [] };
      else if (path.endsWith("/lorebooks")) value = { books: [] };
      else if (path.endsWith("/catalog")) value = { characters: [] };
      else if (path.endsWith("/story")) value = { entries: [], total: 0 };
      else if (path.endsWith("/narration"))
        value = {
          writingGuidance: "",
          writingGuidanceMaxLength: 4000,
          tense: "present",
          person: "third",
          rating: "sfw",
        };
      else if (path.endsWith("/rooms/activity")) value = { session };
      else if (path.endsWith("/rooms") && route.request().method() === "POST") {
        lastEntry = route.request().postDataJSON();
        const visited = snapshot.settings.venues.find((venue) => venue.id === lastEntry.venueId);
        session = {
          ...session,
          placeId: visited.id,
          placeName: visited.name,
          spaceClass: lastEntry.spaceClass ?? visited.classes[0],
          area: lastEntry.entryArea ?? "public",
        };
        value = { session };
      } else if (path.endsWith("/rooms/turn")) {
        lastTurn = route.request().postDataJSON();
        const message = lastTurn.message;
        session = {
          ...session,
          lines: [
            ...session.lines,
            { id: "player", role: "user", speakerId: "", name: "", content: message, at: now },
            {
              id: "answer",
              role: "assistant",
              speakerId: "mara",
              name: "Mara",
              kind: "dialogue",
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
      } else if (path.endsWith("/rooms/leave")) {
        lastLeave = route.request().postDataJSON();
        session = { ...session, status: "closed", endedAt: now };
        value = { session, recordEvents: [] };
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
    await expect(home.locator(".marinara-capability-villages-pin-photo-card")).toHaveCount(width === 1440 ? 4 : 3);
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
    await expect(page.getByRole("button", { name: "General Settings", exact: true })).toBeVisible();
    await page.getByRole("button", { name: /^Villagers \(/u }).click();
    const studioButton = page.getByRole("button", { name: /Sprite Studio ·/u }).first();
    await studioButton.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Mara’s Sprite Studio" })).toBeFocused();
    await expect(page.getByRole("button", { name: "Review generation plan" })).toBeVisible();
    await page.getByRole("button", { name: "← Back to Villagers" }).click();
    await expect(studioButton).toBeFocused();
    await page.getByRole("button", { name: "Back to menu" }).click();
    await page.getByRole("button", { name: "Village Settings" }).click();
    await expect(page.getByRole("heading", { name: "Village Map" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Replace map" })).toBeVisible();
    await page.getByRole("button", { name: "Back to menu" }).click();
    await page.getByRole("button", { name: "DEBUG Settings" }).click();
    await expect(page.getByRole("button", { name: "Venue Visits" })).toBeVisible();
    await page.getByRole("button", { name: "Back to menu" }).click();
    await page.getByRole("button", { name: "Back to the village" }).click();
    await page.getByRole("button", { name: "Open settings menu" }).click();
    await expect(page.getByRole("button", { name: "General Settings", exact: true })).toBeVisible();
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
    const zoneNav = page.getByRole("navigation", { name: "Venue zones" });
    await expect(zoneNav.getByRole("button", { name: /Exterior/u })).toBeVisible();
    await expect(page.getByRole("button", { name: "Visit this area →" })).toBeVisible();
    await expect(page.getByRole("button", { name: "About" })).toHaveCount(0);
    await expect(page.getByText("About this area", { exact: true })).toHaveCount(0);
    if (process.env.VILLAGES_VISUAL_OUTPUT) {
      await page.screenshot({
        path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, `villages-venue-${width}x${height}.png`),
      });
    }
    await zoneNav
      .getByRole("button", { name: /interior/iu })
      .first()
      .click();
    await expect(page.getByText("Area not discovered yet")).toBeVisible();
    await expect(page.getByRole("button", { name: "Visit this area →" })).toBeEnabled();
    await page.getByRole("button", { name: "Edit Venue" }).click();
    await expect(page.getByRole("button", { name: "Close Editor" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Visit this area →" })).toHaveCount(0);
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
    await expect(page.getByRole("button", { name: "Visit this area →" })).toHaveCount(0);
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
    await page.getByRole("button", { name: "Visit this area →" }).click();
    assert.equal(lastEntry?.entryArea, "public", "zone visit enters the selected interior");
    assert.equal(lastEntry?.spaceClass, mobile ? "other" : "workplace");
    const composer = page.getByRole("textbox", { name: mobile ? "Message at The Market" : "Message at The Mill" });
    const dock = page.locator(".marinara-capability-villages-chat-vn");
    const stage = page.locator(".marinara-capability-villages-chat-stage");
    const cast = page.locator(".marinara-capability-villages-chat-cast-person");
    const reading = page.getByRole("region", { name: "Current paragraph" });
    await expect(cast).toHaveCount(4);
    const castPositions = await cast.evaluateAll((people) => people.map((person) => person.offsetLeft));
    if (process.env.VILLAGES_VISUAL_OUTPUT) {
      await page.screenshot({
        path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, `villages-room-initial-${width}x${height}.png`),
      });
    }
    await expect(cast.locator("img")).toHaveCount(width === 800 ? 3 : 4);
    if (width === 800) await expect(cast.locator(".marinara-capability-villages-avatar")).toHaveCount(1);
    const stageBox = await stage.boundingBox();
    const dockBox = await dock.boundingBox();
    assert.ok(stageBox && dockBox && stageBox.height > 0 && stageBox.y + stageBox.height <= dockBox.y + 1);
    if (width === 1917)
      assert.ok(dockBox.height <= 240, `wide reading dock includes the visible composer (${dockBox.height}px)`);
    const castBoxes = await cast.all();
    for (const person of castBoxes) {
      const box = await person.boundingBox();
      assert.ok(box && box.width > 0 && box.height > 0 && box.x >= 0 && box.x + box.width <= width);
    }
    const readingOverflow = await reading.evaluate((element) => ({
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
    }));
    assert.ok(readingOverflow.scrollHeight > readingOverflow.clientHeight, "long narration scrolls inside the dock");
    assert.ok(
      (await reading.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
        return element.scrollTop;
      })) > 0,
      "the full paragraph remains reachable by scrolling",
    );
    const historyButton = page.getByRole("button", { name: "History", exact: true });
    await expect(historyButton).toHaveCount(1);
    await historyButton.click();
    await expect(page.getByRole("log", { name: "Venue conversation history" })).toBeVisible();
    const stageWithHistory = await stage.boundingBox();
    assert.equal(stageWithHistory.height, stageBox.height, "history overlay does not shrink the stage");
    await historyButton.click();
    await expect(composer).toBeVisible();
    await page.getByRole("button", { name: "Projects", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Projects", level: 1 })).toBeVisible();
    await page.getByRole("button", { name: "Back to menu" }).click();
    await page.getByRole("button", { name: "Back to the village" }).click();
    await pin.focus();
    await page.keyboard.press("Enter");
    await doors.getByRole("button", { name: "Visit" }).click();
    await expect(composer).toBeVisible();
    await expect(page.getByRole("button", { name: /(?:Hide composer|Compose)/u })).toHaveCount(0);
    await page.getByRole("button", { name: "Venue actions" }).click();
    await expect(page.getByRole("menuitem", { name: /Leave Scene/u })).toHaveCount(0);
    await expect(page.getByRole("menuitem", { name: "End visit now" })).toBeVisible();
    await page.getByRole("button", { name: "Venue actions" }).click();
    const modeButton = () => page.getByRole("button", { name: /^Mode: /u });
    await expect(modeButton()).toHaveText("💬");
    const oneLine = await composer.evaluate((field) => {
      const style = getComputedStyle(field);
      return {
        height: field.clientHeight,
        lineHeight: Number.parseFloat(style.lineHeight),
        padding: Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom),
      };
    });
    assert.ok(
      Math.abs(oneLine.height - (oneLine.lineHeight + oneLine.padding)) <= 2,
      "empty composer is one line high",
    );
    await composer.fill("word ".repeat(100));
    const wrapped = await composer.evaluate((field) => ({
      height: field.clientHeight,
      scrollHeight: field.scrollHeight,
    }));
    assert.ok(wrapped.height > oneLine.height, "composer grows as the draft wraps");
    assert.ok(wrapped.height <= oneLine.lineHeight * 2 + oneLine.padding + 2, "composer stops at two lines");
    assert.ok(wrapped.scrollHeight > wrapped.height, "long draft scrolls inside the composer");
    await composer.fill("My response.");
    await composer.press("Escape");
    await expect(composer).toBeVisible();
    await modeButton().click();
    await expect(page.getByRole("menuitemradio", { name: "Conclude" })).toBeVisible();
    await expect(page.getByRole("menuitemradio", { name: "Act" })).toHaveCount(0);
    await historyButton.focus();
    await expect(page.getByRole("menu", { name: "Visit mode" })).toHaveCount(0);
    await modeButton().click();
    await reading.click();
    await expect(page.getByRole("menu", { name: "Visit mode" })).toHaveCount(0);
    await modeButton().click();
    await page.getByRole("menuitemradio", { name: "Conclude" }).click();
    await expect(modeButton()).toHaveText("🚪");
    assert.equal(lastLeave, null, "selecting Conclude does not leave the scene");
    await expect(composer).toHaveValue("My response.");
    await modeButton().click();
    await page.getByRole("menuitemradio", { name: "Chat" }).click();
    await expect(modeButton()).toHaveText("💬");
    await modeButton().click();
    await page.getByRole("menuitemradio", { name: "Fulfill" }).click();
    await expect(modeButton()).toHaveText("🫴");
    await page.getByRole("combobox", { name: "Whose wish you fulfilled" }).selectOption("mara");
    assert.equal(lastTurn, null, "changing modes does not send the draft");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(composer).toHaveCount(0);
    await expect(reading).toContainText("First reply.");
    assert.equal(lastTurn.mode, "fulfill");
    assert.equal(lastTurn.message, "My response.");
    await expect(reading).not.toContainText("Sixth reply.");
    assert.equal(await reading.evaluate((element) => element.scrollTop), 0, "a new paragraph starts at its top");
    assert.deepEqual(
      await cast.evaluateAll((people) => people.map((person) => person.offsetLeft)),
      castPositions,
      "a new speaker does not rearrange the four cast slots",
    );
    await expect(page.getByRole("button", { name: "Compose" })).toHaveCount(0);
    const noticeTrigger = page.getByRole("button", { name: "1 village notice" });
    if ((await noticeTrigger.getAttribute("aria-expanded")) === "false") await noticeTrigger.click();
    const memoryTrigger = page.getByRole("button", { name: "View memory: The village remembered this exchange." });
    await memoryTrigger.click();
    await expect(page.getByRole("dialog", { name: "The village remembered this exchange." })).toContainText(
      "The player answered while Mara shared a quiet aside.",
    );
    await page.getByRole("button", { name: "Close memory" }).click();
    await expect(memoryTrigger).toBeFocused();
    for (let step = 0; step < 5; step += 1) await page.getByRole("button", { name: "Next paragraph" }).click();
    await expect(reading).toContainText("Sixth reply.");
    await expect(composer).toBeVisible();
    await expect(modeButton()).toHaveText("💬");
    const asideBand = page.locator(".marinara-capability-villages-chat-vn-asides");
    await expect(asideBand).toContainText("A small aside rides with the final reply.");
    await expect(asideBand).toContainText("A quiet word stays visible too.");
    const asideOverflow = await asideBand.evaluate((element) => ({
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
    }));
    assert.ok(asideOverflow.clientHeight > 0 && asideOverflow.scrollHeight >= asideOverflow.clientHeight);
    const asideBox = await asideBand.boundingBox();
    const finalDockBox = await dock.boundingBox();
    assert.ok(
      asideBox &&
        finalDockBox &&
        asideBox.x >= 0 &&
        asideBox.x + asideBox.width <= width &&
        asideBox.y >= 0 &&
        asideBox.y + asideBox.height <= finalDockBox.y,
      `aside and whisper bubbles stay within the ${width}x${height} viewport above the dock: ${JSON.stringify({ asideBox, finalDockBox })}`,
    );
    assert.equal(
      await asideBand.evaluate((element) => getComputedStyle(element).position),
      "absolute",
      "asides float without reserving stage height",
    );
    assert.deepEqual(errors, [], `${width}×${height} renders without page errors`);
    if (process.env.VILLAGES_VISUAL_OUTPUT) {
      await page.screenshot({
        path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, `villages-room-${width}x${height}.png`),
      });
    }
    const finalLine = width === 390 ? "" : "Goodbye.";
    await composer.fill(finalLine);
    await modeButton().click();
    await page.getByRole("menuitemradio", { name: "Conclude" }).click();
    await expect(modeButton()).toHaveText("🚪");
    assert.equal(lastLeave, null, "Conclude waits for Send");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("button", { name: "Return to map" }).first()).toBeVisible();
    assert.equal(lastLeave.message, finalLine, "Conclude sends the optional final line");
    if (width === 1440) {
      await page.getByRole("button", { name: "Return to map" }).first().click();
      await home.locator('[data-pin-id="home"]').click();
      await home
        .locator(".marinara-capability-villages-doors")
        .getByRole("button", { name: /View venue/iu })
        .click();
      const headerActions = page.locator(".marinara-capability-villages-actions");
      await expect(headerActions.getByRole("button", { name: "Request to live here" })).toBeVisible();
      await expect(headerActions.getByRole("button", { name: "Edit Venue" })).toBeVisible();
      await headerActions.getByRole("button", { name: "Request to live here" }).click();
      const moveError = page.getByRole("alert");
      await expect(moveError).toHaveText("This home has no room for another resident.");
      const errorBox = await moveError.boundingBox();
      const zoneBox = await page.locator(".marinara-capability-villages-venue-zone-context").boundingBox();
      assert.ok(errorBox && zoneBox && errorBox.y + errorBox.height <= zoneBox.y, "move error appears above Zone");
      await expect(page.getByText("About this area", { exact: true })).toHaveCount(0);
    }
    await page.close();
  }
  console.log("Villages desktop parity: five viewports, four-person stage, compact reading, and map controls passed");
} finally {
  await browser.close();
}
