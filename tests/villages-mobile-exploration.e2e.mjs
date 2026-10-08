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
const photo = (width, height, color) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${color}"/><path d="M0 0L${width} ${height}M${width} 0L0 ${height}" stroke="white" stroke-width="30"/><rect x="${width * 0.2}" y="${height * 0.2}" width="${width * 0.6}" height="${height * 0.6}" fill="#785f99"/></svg>`).toString("base64")}`;
const residentNames = ["Mara", "Eli", "Lina", "Taro", "Noor"];
const portraitRows = [
  { id: "mara", avatarUrl: photo(1800, 3600, "#c888aa") },
  {
    id: "eli",
    avatarUrl: photo(1800, 3600, "#81b9d0"),
    avatarCrop: { srcX: 0.25, srcY: 0.2, srcWidth: 0.5, srcHeight: 0.25 },
  },
  { id: "lina", avatarUrl: photo(2400, 1600, "#d2bd79"), avatarCrop: { zoom: 2, offsetX: 15, offsetY: -10 } },
  {
    id: "taro",
    avatarUrl: photo(1800, 3600, "#96c395"),
    avatarCrop: { zoom: 1.5, offsetX: -10, offsetY: 5, fullImage: true },
  },
];
const residents = residentNames.map((name, index) => ({
  characterId: name.toLowerCase(),
  name,
  sprite: {
    assetId: name.toLowerCase(),
    expressions: [],
    images: [
      {
        view: "front",
        label: "neutral",
        url: spriteImage(["#e8ba91", "#a7cdf2", "#d9a8cd", "#bbd59a", "#c8baef"][index]),
      },
    ],
    framing: { mode: "full", cropPercent: 0 },
  },
  summary: "A resident of the village.",
  tags: [],
  missing: false,
  place: null,
}));
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

// Start with a crowded centre, plus unpositioned and edge destinations.
const P = "marinara-capability-villages";
try {
  for (const { width, height, shell } of [
    { width: 320, height: 568, shell: 120 },
    { width: 390, height: 844, shell: 144 },
    { width: 844, height: 390, shell: 80 },
    { width: 390, height: 500, shell: 144 },
    { width: 1440, height: 900, shell: 160 },
    { width: 1024, height: 768, shell: 120 },
    { width: 720, height: 900, shell: 120 },
  ]) {
    const mobile = width <= 704 || (width <= 880 && height - shell <= 512);
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: mobile });
    await page.addInitScript(() => {
      const viewport = new EventTarget();
      Object.assign(viewport, {
        width: window.innerWidth,
        height: window.innerHeight,
        offsetTop: 0,
        offsetLeft: 0,
        scale: 1,
      });
      window.explorationViewport = viewport;
      Object.defineProperty(window, "visualViewport", { configurable: true, value: viewport });
    });
    const errors = [];
    const sceneRequests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let fixture = structuredClone(snapshot);
    fixture.settings.venues = [
      { ...place("market", 0.5, 0.5), name: "Village Market" },
      { ...place("crowded", 0.51, 0.51), name: "A nearby venue with a very long readable name" },
      { ...place("unplaced", null, null), name: "Unplaced Venue", presentation: { image: null, x: null, y: null } },
      { ...place("worksite", 0.8, 0.2), name: "New Mill" },
      { ...place("edge", 0.5, 0.01), name: "Edge Venue" },
    ];
    fixture.projects = [
      {
        id: "project-1",
        venueId: "worksite",
        kind: "new-venue",
        title: "New Mill",
        lifecycle: { phase: "construction" },
      },
    ];
    fixture.villagers = residents.map((resident, index) => ({
      ...resident,
      place: index === 3 ? null : { id: "market", name: "Village Market" },
    }));
    fixture.happenings = [{ id: "event-1", text: "The market opened this morning.", at: now }];
    let servedImage = mapImage;
    let session = null;
    await page.route("**/api/characters/summaries", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(portraitRows),
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = fixture;
      if (path.endsWith("/rooms/active")) value = { session: null };
      else if (path.endsWith("/rooms/archive")) value = { visits: [], total: 0 };
      else if (path.endsWith("/town-map")) value = { image: servedImage };
      else if (path.endsWith("/catalog")) value = { characters: [] };
      else if (path.endsWith("/personas")) value = { personas: [] };
      else if (path.endsWith("/lorebooks")) value = { books: [] };
      else if (path.endsWith("/rooms") && route.request().method() === "POST") {
        sceneRequests.push(route.request().postDataJSON());
        session = {
          version: 1,
          id: "visit-1",
          placeId: "market",
          placeName: "Village Market",
          startedAt: now,
          lastActivityAt: now,
          endedAt: "",
          status: "active",
          activeIds: [],
          participants: [],
          lines: [],
        };
        value = { session };
      } else if (path.endsWith("/rooms/activity")) value = { session };
      else if (path.endsWith("/rooms/end")) {
        session = { ...session, status: "closed", endedAt: now };
        value = { session, recordEvents: [] };
      } else if (/rooms\/(greet|turn)|town-map\/generate/.test(path))
        throw Error("Unexpected generation request: " + path);
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.route("http://villages.test/", (route) =>
      route.fulfill({
        contentType: "text/html",
        body:
          "<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7;--secondary:#384253}html,body{margin:0;width:100%;height:100%;background:#111b35;color:#eef2ff;font-family:Arial,sans-serif}body{display:flex;flex-direction:column}.shell{flex:0 0 " +
          shell +
          'px;display:grid;place-items:center;border-bottom:1px solid #405984;background:#171b25}.village-slot{flex:1;min-height:0;position:relative}marinara-capability-villages{display:block;height:100%;width:100%}</style><div class="shell">Engine navigation</div><main class="village-slot"><marinara-capability-villages></marinara-capability-villages></main>',
      }),
    );
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const home = page.locator("." + P + "-home-full");
    await expect(home).toHaveAttribute("data-mobile", String(mobile));
    const nav = page.getByRole("navigation", { name: "Village exploration" });
    const canvas = home.locator("." + P + "-canvas");
    const stage = home.locator("." + P + "-stage");
    const geometry = () =>
      canvas.locator("." + P + "-canvas-img").evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return {
          left: el.style.left || rect.left + "px",
          top: el.style.top || rect.top + "px",
          width: el.style.width || rect.width + "px",
          height: el.style.height || rect.height + "px",
        };
      });
    await expect(nav.getByRole("button", { name: "Map", exact: true })).toBeVisible();
    await expect(home.getByRole("button", { name: "Events (NYI)" })).toHaveCount(0);
    for (const button of await nav.getByRole("button").all()) {
      const box = await button.boundingBox();
      assert.ok(box.height >= (mobile ? 48 : 40) && box.y + box.height <= height + 1);
    }
    await expect.poll(async () => (await geometry()).width).not.toBe("");
    const initial = await geometry();
    const initialZoom = Number(await stage.getAttribute("data-navigation-zoom"));
    const screenshot = async (name) => {
      if (process.env.VILLAGES_VISUAL_OUTPUT)
        await page.screenshot({
          path: resolve(
            process.env.VILLAGES_VISUAL_OUTPUT,
            "polaroid-map-" + name + "-" + width + "x" + height + ".png",
          ),
        });
    };
    await expect(home.getByRole("button", { name: /^(Zoom in|Zoom out|Reset map view)$/ })).toHaveCount(0);
    await expect(home.getByRole("button", { name: /^Events/ })).toHaveCount(0);
    await expect(home).toHaveCSS("background-color", "rgb(41, 37, 31)");
    const sharedMapBox = await stage.boundingBox();
    await nav.getByRole("button", { name: "Places", exact: true }).click();
    const sharedPanel = page.getByRole("dialog", { name: "Places", exact: true });
    await expect(sharedPanel).toHaveAttribute("data-layout", mobile ? "sheet" : "side");
    await expect(sharedPanel.getByRole("button", { name: /Unplaced Venue/ })).toBeVisible();
    await expect(sharedPanel.getByRole("button", { name: /very long readable name/ })).toBeVisible();
    assert.deepEqual(await stage.boundingBox(), sharedMapBox, "opening browsing never resizes the map");
    await sharedPanel.getByRole("searchbox").fill("unPLACED");
    await page.setViewportSize({ width: mobile ? 1100 : 390, height: 844 });
    await expect(sharedPanel).toHaveAttribute("data-layout", mobile ? "side" : "sheet");
    await expect(sharedPanel.getByRole("searchbox")).toHaveValue("unPLACED");
    await expect(sharedPanel.locator("." + P + "-explore-row")).toHaveCount(1);
    await sharedPanel.getByRole("button", { name: /Unplaced Venue/ }).click();
    await expect(page.getByRole("dialog", { name: "Unplaced Venue", exact: true })).toBeVisible();
    await page.setViewportSize({ width, height });
    await expect(page.getByRole("dialog", { name: "Unplaced Venue", exact: true })).toHaveAttribute(
      "data-layout",
      mobile ? "sheet" : "side",
    );
    await page.getByRole("button", { name: "Close exploration card" }).click();
    await expect(nav.getByRole("button", { name: "Places", exact: true })).toBeFocused();
    await nav.getByRole("button", { name: "Places", exact: true }).click();
    await expect(sharedPanel.getByRole("searchbox")).toHaveValue("unPLACED");
    await sharedPanel.getByRole("searchbox").fill("");
    await page.keyboard.press("Escape");
    await nav.getByRole("button", { name: "People", exact: true }).click();
    const sharedPeople = page.getByRole("dialog", { name: "People", exact: true });
    await expect(sharedPeople.getByRole("button", { name: /Taro Current location unavailable/ })).toBeEnabled();
    await sharedPeople.getByRole("searchbox").fill("Mara");
    await expect(sharedPeople.locator("." + P + "-explore-row")).toHaveCount(1);
    await sharedPeople.getByRole("button", { name: /Mara Village Market/ }).click();
    await expect(page.getByRole("heading", { name: "Mara", exact: true })).toBeVisible();
    await expect(page.getByText("No wishes shared yet", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "View Venue", exact: true }).click();
    const sharedPreview = page.getByRole("dialog", { name: "Village Market", exact: true });
    await expect(sharedPreview.getByRole("button").nth(1)).toHaveText("Visit");
    await page.keyboard.press("Escape");
    await expect(nav.getByRole("button", { name: "People", exact: true })).toBeFocused();
    await nav.getByRole("button", { name: "People", exact: true }).click();
    await sharedPeople.getByRole("searchbox").fill("");
    await page.keyboard.press("Escape");
    // Empty and no-match states stay usable on either layout.
    const savedPeople = fixture.villagers;
    fixture.villagers = [];
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await nav.getByRole("button", { name: "People", exact: true }).click();
    await expect(sharedPeople.getByRole("status")).toHaveText("Nothing to show here yet.");
    await sharedPeople.getByRole("searchbox").fill("missing name");
    await expect(sharedPeople.getByRole("status")).toHaveText("No matches. Try another name.");
    await sharedPeople.getByRole("searchbox").fill("");
    fixture.villagers = savedPeople;
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(sharedPeople.getByRole("button", { name: /Mara Village Market/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await home.getByRole("button", { name: "Notices (1)", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Noticeboard", level: 1 })).toBeVisible();
    await expect(page.locator("." + P + '-sectioned-menu[data-page="noticeboard"]')).toHaveCSS(
      "background-color",
      "rgb(41, 37, 31)",
    );
    await page.getByRole("button", { name: "Back to menu", exact: true }).click();
    await page.getByRole("button", { name: "Events", exact: true }).click();
    await expect(page.getByText("The market opened this morning.", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Back to menu", exact: true }).click();
    await page.getByRole("button", { name: "Back to the village", exact: true }).click();
    // Main navigation remains compact, readable, and inside the host at every size.
    for (const control of await home.locator("." + P + "-home-bar button, ." + P + "-explore-nav button").all()) {
      const bounds = await control.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width + 1, "toolbar control stays within the viewport");
      assert.ok(bounds.y >= shell && bounds.y + bounds.height <= height + 1, "control stays inside Villages");
    }
    await screenshot("warm-map");
    if (!mobile) {
      await expect(home.locator("." + P + "-pin-photo-card")).toHaveCount(4);
      const edgePin = home.locator('[data-pin-id="edge"]');
      await edgePin.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("dialog", { name: "Edge Venue", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Visit", exact: true })).toBeVisible();
      await screenshot("warm-preview");
      await page.keyboard.press("Escape");
      await expect(edgePin).toBeFocused();
      await nav.getByRole("button", { name: "Places", exact: true }).click();
      await sharedPanel.getByRole("button", { name: /New Mill/ }).click();
      const worksite = page.getByRole("dialog", { name: "New Mill", exact: true });
      await expect(worksite.getByRole("button", { name: "View Project", exact: true })).toBeVisible();
      await expect(worksite.getByRole("button", { name: "Visit", exact: true })).toHaveCount(0);
      assert.equal(sceneRequests.length, 0);
      await page.keyboard.press("Escape");
      await nav.getByRole("button", { name: "Places", exact: true }).click();
      await sharedPanel.getByRole("searchbox").fill("Village Market");
      await sharedPanel.getByRole("button", { name: /Village Market/ }).click();
      await sharedPreview.getByRole("button", { name: "Visit", exact: true }).click();
      await expect.poll(() => sceneRequests.length).toBe(1);
      await expect(page.getByRole("textbox", { name: "Message at Village Market" })).toBeVisible();
      await page.getByRole("button", { name: "Venue actions", exact: true }).click();
      await page.getByRole("menuitem", { name: "End Scene now", exact: true }).click();
      await page.getByRole("button", { name: "Return to map", exact: true }).click();
      await expect(home).toBeVisible();
      assert.deepEqual(errors, []);
      await page.close();
      continue;
    }
    // Distinct nearby venues never collapse into a synthetic marker.
    await expect(home.locator('[data-pin-id="market"]')).toHaveCount(1);
    await expect(home.locator('[data-pin-id="crowded"]')).toHaveCount(1);
    await expect(home.locator("[data-group-ids], ." + P + "-explore-count")).toHaveCount(0);
    // Add actual saved anchors at all four visible frame edges, including in landscape.
    const pictureBox = Object.fromEntries(Object.entries(initial).map(([key, value]) => [key, parseFloat(value)]));
    const frameBox = await canvas.boundingBox();
    for (const [id, px, py] of [
      ["left-edge", 2, frameBox.height / 2],
      ["right-edge", frameBox.width - 2, frameBox.height / 2],
      ["top-edge", frameBox.width / 2, 2],
      ["bottom-edge", frameBox.width / 2, frameBox.height - 2],
    ]) {
      const venue = place(id, (px - pictureBox.left) / pictureBox.width, (py - pictureBox.top) / pictureBox.height);
      venue.name = id + " Venue";
      venue.presentation.image.url = photo(id === "left-edge" ? 2400 : 800, id === "left-edge" ? 800 : 2400, "#7596a4");
      fixture.settings.venues.push(venue);
    }
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(home.locator('[data-pin-id="left-edge"]')).toHaveCount(1);
    const assertMapMarkers = async () => {
      const map = await geometry();
      const picture = Object.fromEntries(Object.entries(map).map(([key, value]) => [key, parseFloat(value)]));
      const frame = await canvas.boundingBox();
      const expected = fixture.settings.venues.filter(
        (v) =>
          typeof v.presentation.x === "number" &&
          typeof v.presentation.y === "number" &&
          picture.left + v.presentation.x * picture.width >= 0 &&
          picture.left + v.presentation.x * picture.width <= frame.width &&
          picture.top + v.presentation.y * picture.height >= 0 &&
          picture.top + v.presentation.y * picture.height <= frame.height,
      );
      await expect(home.locator("." + P + '-explore-marker[data-kind="place"]')).toHaveCount(expected.length);
      for (const venue of expected) {
        const marker = home.locator('[data-pin-id="' + venue.id + '"]');
        const anchor = await marker.evaluate((el) => ({
          left: parseFloat(el.parentElement.style.left),
          top: parseFloat(el.parentElement.style.top),
        }));
        assert.ok(
          Math.abs(anchor.left - (picture.left + venue.presentation.x * picture.width)) < 0.01,
          "venue anchor retains its exact x coordinate",
        );
        assert.ok(
          Math.abs(anchor.top - (picture.top + venue.presentation.y * picture.height)) < 0.01,
          "venue anchor retains its exact y coordinate",
        );
        const button = await marker.boundingBox();
        assert.equal(button.width, 64, "legacy styles cannot shrink venue buttons");
        assert.equal(button.height, 76);
        assert.ok(
          Math.abs(button.x + button.width / 2 - frame.x - anchor.left) < 0.1,
          "marker stays centered on its map anchor even at an edge",
        );
        assert.ok(
          Math.abs(button.y + button.height / 2 - frame.y - anchor.top) < 0.1,
          "marker never follows the viewport vertically",
        );
        const card = marker.locator("." + P + "-pin-photo-card");
        assert.equal((await card.boundingBox()).width, 56);
        await expect(card).toHaveCSS("background-color", "rgb(250, 244, 231)");
        await expect(card.locator("." + P + "-pin-photo-tack")).toHaveCount(0);
        await expect(card.locator("." + P + "-pin-name")).toHaveText(venue.name);
        const thumbnail = card.locator("." + P + "-pin-photo");
        const bounds = await thumbnail.boundingBox();
        assert.equal(bounds.width, 48);
        assert.equal(bounds.height, 48);
        await expect(thumbnail.locator("img")).toHaveCSS("object-fit", "contain");
        const names = fixture.villagers
          .filter((resident) => resident.place?.id === venue.id)
          .slice(0, 3)
          .map((resident) => resident.name);
        const initials = marker.locator("." + P + "-explore-initial");
        await expect(initials).toHaveCount(names.length);
        for (let i = 0; i < names.length; i++) {
          await expect(initials.nth(i)).toHaveAttribute("title", names[i]);
          await expect(initials.nth(i)).toHaveText(Array.from(names[i])[0].toLocaleUpperCase());
          const badge = await initials.nth(i).boundingBox();
          assert.equal(badge.width, 14);
          assert.equal(badge.height, 14);
        }
        await expect(marker).toHaveAttribute("aria-label", venue.name);
      }
      await expect(home.locator("." + P + "-explore-marker[data-kind=person]")).toHaveCount(0);
      await expect(home.locator("." + P + "-explore-marker ." + P + "-explore-face")).toHaveCount(0);
      await expect(canvas).toHaveCSS("overflow", "hidden");
    };
    await assertMapMarkers();
    await screenshot("map");
    const edgeMarker = home.locator('[data-pin-id="left-edge"]');
    const edgeBounds = await edgeMarker.boundingBox();
    assert.ok(edgeBounds.x < frameBox.x, "edge cards clip naturally instead of sliding inward");
    await edgeMarker.tap({ position: { x: 56, y: 38 } });
    await expect(page.getByRole("dialog", { name: "left-edge Venue" })).toBeVisible();
    assert.equal(sceneRequests.length, 0);
    await page.getByRole("button", { name: "Close exploration card" }).click();
    await nav.getByRole("button", { name: "Places", exact: true }).click();
    let sheet = page.getByRole("dialog", { name: "Places", exact: true });
    await expect(sheet.getByRole("heading", { name: "Places", exact: true })).toBeFocused();
    await expect(sheet.getByRole("button", { name: /Unplaced Venue/ })).toBeVisible();
    assert.deepEqual(await geometry(), initial, "opening a sheet never resizes the map");
    await screenshot("places");
    await sheet.getByRole("searchbox", { name: "Search places" }).fill("unPLACED");
    await expect(sheet.locator("." + P + "-explore-row")).toHaveCount(1);
    if (height >= 800) {
      const beforeKeyboard = await geometry();
      await page.evaluate((height) => {
        window.explorationViewport.height = height - 260;
        window.explorationViewport.dispatchEvent(new Event("resize"));
      }, height);
      const navBox = await nav.boundingBox();
      const searchBox = await sheet.getByRole("searchbox").boundingBox();
      assert.ok(navBox.y + navBox.height <= height - 260 + 1, "navigation stays above the search keyboard");
      assert.ok(searchBox.y + searchBox.height <= height - 260 + 1, "search stays above the keyboard");
      assert.deepEqual(await geometry(), beforeKeyboard, "visual keyboard does not move the map");
      await page.evaluate((height) => {
        window.explorationViewport.height = height;
        window.explorationViewport.dispatchEvent(new Event("resize"));
      }, height);
    }
    await sheet.getByRole("searchbox").fill("no such place");
    await expect(sheet.getByRole("status")).toHaveText("No matches. Try another name.");
    await page.keyboard.press("Escape");
    await expect(nav.getByRole("button", { name: "Places", exact: true })).toBeFocused();
    await nav.getByRole("button", { name: "People", exact: true }).click();
    sheet = page.getByRole("dialog", { name: "People", exact: true });
    await expect(sheet.getByRole("button", { name: /Taro Current location unavailable/ })).toBeEnabled();
    await expect(sheet.locator("." + P + "-explore-face img")).toHaveCount(4);
    for (const row of await sheet.locator("." + P + "-explore-row").all()) {
      const face = row.locator("." + P + "-explore-face");
      const bounds = await face.boundingBox();
      assert.equal(bounds.width, 36);
      assert.equal(bounds.height, 36);
      const rowBounds = await row.boundingBox();
      assert.ok(rowBounds.height >= 60 && rowBounds.height <= 85, "People stays a compact row list");
      await expect(face).toHaveCSS("position", "relative");
      await expect(face).toHaveCSS("overflow", "hidden");
      const cropped = face.locator('img[style*="position: absolute"]');
      if (await cropped.count())
        assert.ok(
          await cropped.evaluate((img) => img.offsetParent === img.parentElement),
          "saved rectangle crop belongs to its portrait frame",
        );
    }
    const eli = sheet.getByRole("button", { name: /Eli Village Market/ }).locator("." + P + "-explore-face img");
    await expect(eli).toHaveCSS("position", "absolute");
    assert.equal(await eli.evaluate((img) => img.style.width), "200%");
    assert.equal(await eli.evaluate((img) => img.style.height), "400%");
    await expect(sheet.getByRole("button", { name: /Lina Village Market/ }).locator("img")).toHaveCSS(
      "transform",
      /matrix\(2,/,
    );
    await expect(sheet.getByRole("button", { name: /Taro Current location unavailable/ }).locator("img")).toHaveCSS(
      "object-fit",
      "contain",
    );
    await expect(sheet.getByRole("button", { name: /Noor Village Market/ }).locator("img")).toHaveCount(0);
    await screenshot("people");
    await sheet.getByRole("button", { name: /Mara Village Market/ }).click();
    await expect(page.getByRole("heading", { name: "Mara", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "View Venue", exact: true }).click();
    sheet = page.getByRole("dialog", { name: "Village Market", exact: true });
    await expect(sheet.getByRole("button", { name: "Visit", exact: true })).toBeVisible();
    assert.equal(sceneRequests.length, 0);
    await sheet.getByRole("button", { name: "Close exploration card" }).click();
    await expect(nav.getByRole("button", { name: "People", exact: true })).toBeFocused();
    // Gesture handling uses real Chromium touch events, including anchored two-finger pinch.
    const box = await canvas.boundingBox();
    const client = await page.context().newCDPSession(page);
    const touch = (type, points) =>
      client.send("Input.dispatchTouchEvent", { type, touchPoints: points.map(([x, y], id) => ({ x, y, id })) });
    const x = box.x + box.width * 0.35,
      y = box.y + box.height * 0.25;
    await touch("touchStart", [
      [x - 15, y],
      [x + 15, y],
    ]);
    await touch("touchMove", [
      [x - 30, y],
      [x + 30, y],
    ]);
    await touch("touchEnd", []);
    await expect(stage).toHaveAttribute("data-navigation-zoom", /./);
    const afterPinch = await geometry();
    assert.notEqual(afterPinch.width, initial.width);
    const anchorX = box.width * 0.35,
      anchorY = box.height * 0.25;
    assert.ok(
      Math.abs(
        (anchorX - parseFloat(initial.left)) / parseFloat(initial.width) -
          (anchorX - parseFloat(afterPinch.left)) / parseFloat(afterPinch.width),
      ) < 0.005,
      "pinch keeps its horizontal anchor",
    );
    assert.ok(
      Math.abs(
        (anchorY - parseFloat(initial.top)) / parseFloat(initial.height) -
          (anchorY - parseFloat(afterPinch.top)) / parseFloat(afterPinch.height),
      ) < 0.005,
      "pinch keeps its vertical anchor",
    );
    await touch("touchStart", [[x, y]]);
    await touch("touchMove", [[x + 25, y + 20]]);
    await touch("touchEnd", []);
    assert.notDeepEqual(await geometry(), afterPinch, "one-finger pan moves the zoomed map");
    await assertMapMarkers();
    await screenshot("panned");

    await expect(page.getByRole("dialog")).toHaveCount(0);
    // Pinching inward is the only zoom-out interaction and remains bounded.
    await touch("touchStart", [
      [x - 30, y],
      [x + 30, y],
    ]);
    await touch("touchMove", [
      [x - 20, y],
      [x + 20, y],
    ]);
    await touch("touchEnd", []);
    const retained = await geometry();
    await nav.getByRole("button", { name: "More", exact: true }).click();
    await page.getByRole("button", { name: "Events", exact: true }).click();
    await expect(page.getByText("The market opened this morning.", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Back to menu", exact: true }).click();
    await page.getByRole("button", { name: "Back to the village", exact: true }).click();
    await expect.poll(geometry, { message: "menu roundtrip retains map view" }).toEqual(retained);
    await nav.getByRole("button", { name: "Places", exact: true }).click();
    sheet = page.getByRole("dialog", { name: "Places", exact: true });
    await sheet.getByRole("searchbox").fill("Village Market");
    await sheet.getByRole("button", { name: /Village Market/ }).click();
    await page
      .getByRole("dialog", { name: "Village Market" })
      .getByRole("button", { name: "View venue", exact: true })
      .click();
    await page.getByRole("button", { name: /Back to map/ }).click();
    await expect.poll(geometry, { message: "Venue roundtrip retains map view" }).toEqual(retained);
    await touch("touchStart", [
      [x - 60, y],
      [x + 60, y],
    ]);
    await touch("touchMove", [
      [x - 5, y],
      [x + 5, y],
    ]);
    await touch("touchEnd", []);
    assert.equal(Number(await stage.getAttribute("data-navigation-zoom")), initialZoom);
    await assertMapMarkers();
    // A worksite preview offers its existing Project action, never an invalid Visit.
    await nav.getByRole("button", { name: "Places", exact: true }).click();
    sheet = page.getByRole("dialog", { name: "Places", exact: true });
    await sheet.getByRole("searchbox").fill("New Mill");
    await sheet.getByRole("button", { name: /New Mill/ }).click();
    sheet = page.getByRole("dialog", { name: "New Mill", exact: true });
    await expect(sheet.getByRole("button", { name: "View Project", exact: true })).toBeVisible();
    await expect(sheet.getByRole("button", { name: "Visit", exact: true })).toHaveCount(0);
    await sheet.getByRole("button", { name: "Close exploration card" }).click();
    // Polling updates a selected card, closes deleted venues, and resets a replaced map.
    await nav.getByRole("button", { name: "Places", exact: true }).click();
    await page.getByRole("dialog", { name: "Places", exact: true }).getByRole("searchbox").fill("Village Market");
    await page
      .getByRole("dialog", { name: "Places", exact: true })
      .getByRole("button", { name: /Village Market/ })
      .click();
    fixture.settings.venues = fixture.settings.venues.filter((v) => v.id !== "market");
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await touch("touchStart", [
      [x - 15, y],
      [x + 15, y],
    ]);
    await touch("touchMove", [
      [x - 30, y],
      [x + 30, y],
    ]);
    await touch("touchEnd", []);
    servedImage = image("#638966");
    fixture.settings.townMapImageSetAt = new Date(Date.now() + 1000).toISOString();
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(canvas.locator("." + P + "-canvas-img")).toHaveAttribute("src", servedImage);
    await expect.poll(geometry, { message: "replacing the map resets its browsing view" }).toEqual(initial);
    fixture.settings.venues.unshift({ ...place("market", 0.5, 0.5), name: "Village Market" });
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await nav.getByRole("button", { name: "Places", exact: true }).click();
    await page.getByRole("dialog", { name: "Places", exact: true }).getByRole("searchbox").fill("Village Market");
    await page
      .getByRole("dialog", { name: "Places", exact: true })
      .getByRole("button", { name: /Village Market/ })
      .click();
    assert.equal(sceneRequests.length, 0, "all exploration remains free of scene operations");
    await screenshot("preview");
    await page
      .getByRole("dialog", { name: "Village Market" })
      .getByRole("button", { name: "Visit", exact: true })
      .click();
    await expect.poll(() => sceneRequests.length).toBe(1);
    assert.equal(sceneRequests[0].venueId, "market");
    await expect(page.getByRole("textbox", { name: "Message at Village Market" })).toBeVisible();
    await page.getByRole("button", { name: "Venue actions", exact: true }).click();
    await page.getByRole("menuitem", { name: "End Scene now", exact: true }).click();
    await page.getByRole("button", { name: "Return to map", exact: true }).click();
    await expect(home).toBeVisible();
    await expect.poll(geometry, { message: "Scene roundtrip retains map view" }).toEqual(initial);
    assert.deepEqual(errors, []);
    await client.detach();
    await page.close();
  }
  console.log(
    "Shared warm exploration: seven viewports, responsive panels, search/selection retention, focus, anchored Polaroids, gesture-only mobile map, worksites, snapshot changes and explicit Visit passed",
  );
} finally {
  await browser.close();
}
