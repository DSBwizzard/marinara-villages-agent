import assert from "node:assert/strict";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const browser = await chromium.launch({
  headless: true,
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
  classes: id === "mill" ? ["workplace", "community"] : ["other"],
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
    { width: 360, height: 640, shell: 80 },
    { width: 390, height: 500, shell: 144 },
    { width: 1440, height: 900, shell: 160 },
    { width: 1024, height: 768, shell: 120 },
    { width: 720, height: 900, shell: 120 },
  ]) {
    if (process.env.VILLAGES_TEST_WIDTH && width !== Number(process.env.VILLAGES_TEST_WIDTH)) continue;
    const mobile = width <= 704;
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
    const nav = page.getByRole("navigation", { name: "Village exploration" });
    const navigator = page.getByRole("complementary", { name: "Places navigator" });
    const canvas = home.getByRole("group", { name: "Map navigation" });
    const stage = home.locator("." + P + "-stage");
    const art = canvas.locator("img").first();
    const geometry = () =>
      art.evaluate((node) => {
        const r = node.getBoundingClientRect();
        return { left: r.left, top: r.top, width: r.width, height: r.height };
      });
    const showPlaces = async () => {
      if (!(await navigator.isVisible())) await nav.getByRole("button", { name: "Places", exact: true }).click();
      await expect(navigator).toBeVisible();
    };
    const select = async (name) => {
      await showPlaces();
      await navigator.getByRole("searchbox").fill(name);
      await navigator.getByRole("button", { name: new RegExp("^" + name) }).click();
      await settleLayout();
    };
    const screenshot = async (name) => {
      if (process.env.VILLAGES_VISUAL_OUTPUT)
        await page.screenshot({
          path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, "navigator-" + name + "-" + width + "x" + height + ".png"),
        });
    };
    const settleLayout = () =>
      page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await expect(home).toHaveAttribute("data-mobile", String(mobile));
    await expect(art).toHaveAttribute("src", mapImage);
    for (const name of ["Zoom out", "Reset map view", "Zoom in"]) {
      const control = home.getByRole("button", { name, exact: true });
      if (mobile) await expect(control).toHaveCount(0);
      else await expect(control).toBeVisible();
    }
    await expect(home.locator("." + P + "-pin-photo-card")).toHaveCount(0);
    await expect(home.locator('[data-kind="person"]')).toHaveCount(0);
    const cover = async () => {
      const image = await geometry(),
        frame = await canvas.boundingBox();
      assert.ok(
        image.width + 1 >= frame.width && image.height + 1 >= frame.height,
        "map fills its available play area",
      );
      assert.ok(Math.abs(image.width / image.height - 1.5) < 0.001, "saved artwork retains its actual aspect ratio");
    };
    await cover();
    for (const control of await nav.getByRole("button").all()) {
      const b = await control.boundingBox();
      assert.ok(
        b.height >= (mobile ? 48 : 40) && b.x >= 0 && b.x + b.width <= width + 1 && b.y + b.height <= height + 1,
      );
    }
    if (!mobile) await expect(navigator).toBeVisible();
    else await expect(navigator).toHaveCount(0);
    await showPlaces();
    await expect(navigator).toHaveAttribute("data-layout", mobile ? "navigator-sheet" : "navigator-rail");
    await navigator.getByRole("searchbox").fill("unPLACED");
    await expect(navigator.locator("." + P + "-explore-row")).toHaveCount(1);
    await navigator.getByRole("button", { name: /Unplaced Venue/ }).click();
    await expect(navigator.getByRole("button", { name: "Visit", exact: true })).toBeVisible();
    await navigator.getByRole("button", { name: "View venue", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Unplaced Venue", exact: true })).toBeVisible();
    assert.equal(sceneRequests.length, 0, "selecting and reading a Venue never starts a Scene");
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await showPlaces();
    await expect(navigator.getByRole("searchbox")).toHaveValue("unPLACED");
    await page.setViewportSize({ width: mobile ? 1100 : 390, height: 844 });
    await expect(home).toHaveAttribute("data-mobile", String(!mobile));
    await showPlaces();
    await expect(navigator).toHaveAttribute("data-layout", mobile ? "navigator-rail" : "navigator-sheet");
    await expect(navigator.getByRole("searchbox")).toHaveValue("unPLACED");
    await page.setViewportSize({ width, height });
    await navigator.getByRole("searchbox").fill("missing location");
    await expect(navigator.getByRole("status")).toHaveText("No matching places.");
    await navigator.getByRole("searchbox").fill("");
    await select("Village Market");
    await expect(navigator.locator('[data-selected="true"] .' + P + "-explore-row")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const marker = home.locator('[data-pin-id="market"]');
    await expect(marker).toBeInViewport({ ratio: 1 });
    const markerBox = await marker.boundingBox();
    assert.ok(markerBox.width >= 44 && markerBox.height >= 44, "location targets remain touch sized");
    if (mobile) {
      const drawer = await navigator.boundingBox();
      assert.ok(markerBox.y + markerBox.height <= drawer.y + 1, "drawer does not cover selected map target");
    }
    await cover();
    assert.equal(sceneRequests.length, 0);
    await marker.click();
    await expect(navigator.getByRole("searchbox")).toHaveValue("");
    await expect(navigator.locator('[data-selected="true"]')).toBeInViewport();
    await screenshot("selected");
    await select("New Mill");
    await expect(navigator.getByRole("button", { name: "View Project", exact: true })).toBeVisible();
    await expect(navigator.getByRole("button", { name: "Visit", exact: true })).toHaveCount(0);
    await navigator.getByRole("searchbox").fill("");
    if (mobile) await navigator.getByRole("button", { name: "Close places" }).click();
    const client = mobile ? await page.context().newCDPSession(page) : null;
    const touch = (type, points) =>
      client.send("Input.dispatchTouchEvent", {
        type,
        touchPoints: points.map(([x, y], id) => ({ x, y, id })),
      });
    if (!mobile) await home.getByRole("button", { name: "Reset map view" }).click();
    await settleLayout();
    const initial = await geometry();
    if (mobile) {
      const frame = await canvas.boundingBox();
      const px = frame.x + frame.width * 0.5,
        py = frame.y + frame.height * 0.4;
      await touch("touchStart", [
        [px - 20, py],
        [px + 20, py],
      ]);
      await touch("touchMove", [
        [px - 30, py],
        [px + 30, py],
      ]);
      await touch("touchEnd", []);
    } else {
      await home.getByRole("button", { name: "Zoom in", exact: true }).click();
    }
    await expect
      .poll(async () => (await geometry()).width, { message: `pinch or zoom at ${width}x${height}` })
      .toBeGreaterThan(initial.width);
    await select("Village Market");
    // A new selection after zooming must become the next drag's starting view.
    const before = await geometry(),
      box = await canvas.boundingBox();
    const x = box.x + box.width * 0.25,
      y = box.y + box.height * 0.72;
    if (mobile) {
      await touch("touchStart", [[x, y]]);
      await touch("touchMove", [[x + 22, y + 12]]);
      await touch("touchEnd", []);
    } else {
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 22, y + 12, { steps: 4 });
      await page.mouse.up();
    }
    const moved = await geometry();
    const expectedLeft = Math.min(box.x, Math.max(box.x + box.width - before.width, before.left + 22));
    const expectedTop = Math.min(box.y, Math.max(box.y + box.height - before.height, before.top + 12));
    assert.ok(
      Math.abs(moved.left - expectedLeft) < 2 &&
        Math.abs(moved.top - expectedTop) < 2 &&
        Math.abs(moved.width - before.width) < 1,
      `drag starts at the selected camera rather than an old gesture: ${JSON.stringify({ width, before, moved, box })}`,
    );
    if (mobile) await navigator.getByRole("button", { name: "Close places" }).click();
    await settleLayout();
    const retained = await geometry();
    await nav.getByRole("button", { name: "More", exact: true }).click();
    await page.getByRole("button", { name: "Back to the village", exact: true }).click();
    await expect.poll(geometry).toEqual(retained);
    if (mobile) {
      await showPlaces();
      await navigator.getByRole("searchbox").fill("Village Market");
      if (height >= 640) {
        await page.evaluate((height) => {
          window.explorationViewport.height = height - 260;
          window.explorationViewport.dispatchEvent(new Event("resize"));
        }, height);
        await settleLayout();
        const n = await nav.boundingBox(),
          s = await navigator.getByRole("searchbox").boundingBox();
        const drawer = await navigator.boundingBox(),
          close = await navigator.getByRole("button", { name: "Close places" }).boundingBox();
        assert.ok(
          s.y >= drawer.y && close.y >= drawer.y,
          "short-phone search and Close remain inside the visible drawer",
        );
        assert.ok(
          n.y + n.height <= height - 260 + 1 && s.y + s.height <= height - 260 + 1,
          "search and navigation clear the keyboard",
        );
        await page.evaluate((height) => {
          window.explorationViewport.height = height;
          window.explorationViewport.dispatchEvent(new Event("resize"));
        }, height);
      }
      await navigator.getByRole("button", { name: "Close places" }).click();
    }
    await nav.getByRole("button", { name: "People", exact: true }).click();
    const people = page.getByRole("main", { name: "Villagers directory", exact: true });
    await expect(people.getByRole("button", { name: "Open Mara profile" })).toBeVisible();
    const eli = people.getByRole("button", { name: "Open Eli profile" }).locator("." + P + "-avatar img");
    await expect(eli).toHaveCSS("position", "absolute");
    assert.equal(await eli.evaluate((img) => img.style.height), "400%");
    await expect(people.getByRole("button", { name: "Open Taro profile" }).locator("img")).toHaveCSS(
      "object-fit",
      "contain",
    );
    await expect(people.getByRole("button", { name: "Open Noor profile" }).locator("img")).toHaveCount(0);
    await page.getByRole("button", { name: "Close ×", exact: true }).click();
    await showPlaces();
    await select("Village Market");
    await screenshot("visit");
    assert.equal(sceneRequests.length, 0, "search, selection, pan, zoom and People remain free of Scene requests");
    await navigator.getByRole("button", { name: "Visit", exact: true }).click();
    await expect.poll(() => sceneRequests.length).toBe(1);
    assert.equal(sceneRequests[0].venueId, "market");
    await expect(page.getByRole("textbox", { name: "Message at Village Market" })).toBeVisible();
    await page.getByRole("button", { name: "Venue actions", exact: true }).click();
    await page.getByRole("menuitem", { name: "End Scene now", exact: true }).click();
    await page.getByRole("button", { name: "Return to map", exact: true }).click();
    await expect(home).toBeVisible();
    assert.deepEqual(errors, []);
    if (client) await client.detach();
    await page.close();
  }
  console.log(
    "Location Navigator: seven viewports, saved geometry, search, responsive rail/drawer, camera gestures, worksite actions and explicit Scene entry passed",
  );
} finally {
  await browser.close();
}
