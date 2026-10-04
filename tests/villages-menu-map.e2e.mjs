import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
const now = new Date().toISOString();
const image = (color) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1000"><rect width="1500" height="1000" fill="${color}"/></svg>`).toString("base64")}`;
const home = {
  id: "home",
  name: "Mara's home",
  classes: ["residence"],
  category: "residence",
  description: "A lived-in home.",
  capabilities: [],
  presentation: { image: null, x: 0.2, y: 0.3 },
  occupancy: { playerHome: false, residentCharacterId: "mara", homeKind: null },
  residentIds: ["mara"],
  state: { condition: "standing", upgrades: [], furniture: [], publicFacts: [], updatedAt: now },
};
const worksite = {
  id: "worksite",
  name: "The Mill",
  classes: ["workplace"],
  category: "destination",
  description: "Under construction.",
  capabilities: [],
  presentation: { image: null, x: 0.8, y: 0.7 },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  constructionStatus: "worksite",
  buildProjectId: "project-1",
  state: { condition: "standing", upgrades: [], furniture: [], publicFacts: [], updatedAt: now },
};

try {
  for (const width of [1440, 390, 320]) {
    const mobile = width < 600;
    const page = await browser.newPage({
      viewport: mobile ? { width, height: 844 } : { width: 1440, height: 900 },
      hasTouch: mobile,
    });
    let savedImage = image("#719b77");
    let mapSetAt = now;
    let venues = [
      home,
      worksite,
      ...Array.from({ length: 14 }, (_, index) => ({
        ...home,
        id: "extra-" + index,
        name: "A long public Venue photograph name " + index,
        classes: ["other"],
        occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
        presentation: {
          image: index % 2 ? { id: "photo-" + index, ref: "photo-" + index, url: image("#6596aa") } : null,
          x: 0.18 + (index % 4) * 0.2,
          y: 0.16 + Math.floor(index / 4) * 0.2,
        },
      })),
    ];
    let failedGeneration = false;
    let staleSave = false;
    const writes = [];
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const snapshot = () => ({
      status: "ready",
      isFounded: true,
      village: {
        name: "QA Village",
        setting: "A wooded village",
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
      villagers: [],
      recap: null,
      settings: {
        promptKnowledge: "",
        defaultPromptKnowledge: "",
        promptBoxMaxLength: 1000,
        storyPace: "normal",
        venues,
        homeBuildingNames: {},
        homeBuildings: [],
        defaultHomeBuilding: "small-home",
        playerPersonaId: "",
        playerPersonaName: "",
        playerPersonaMissing: false,
        selectedLorebookIds: [],
        worldFacts: [],
        setting: "A wooded village",
        foundingReason: "",
        foundingDetails: "",
        maxPlaces: 10,
        maxVenueNameLength: 80,
        maxVenueNoteLength: 2000,
        maxVenueImageUrlLength: 2000000,
        maxVenueImageIdLength: 100,
        sceneryArtStyle: "Watercolor with clear spatial outlines",
        useVisualLoreByDefault: false,
        maxVenueImageBytes: 1000000,
        villageGalleryFolderName: "QA Village",
        visitRetention: { mode: "forever", value: 0 },
        townMapImageSetAt: mapSetAt,
        townMapImageMaxLength: 8000000,
        townMapExpectedWidth: 1500,
        townMapExpectedHeight: 1000,
        townMapZoomMin: 1,
        townMapZoomMax: 3,
        townMapZoomStep: 0.1,
        townMapView: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
        storyPaces: [],
        macros: [],
      },
    });
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = snapshot();
      let status = 200;
      if (path.endsWith("/town-map") && route.request().method() === "GET") value = { image: savedImage };
      else if (path.endsWith("/town-map") && route.request().method() === "PUT") {
        const body = route.request().postDataJSON();
        writes.push(body);
        if (staleSave) {
          status = 409;
          value = { error: "The village map changed. Reload it before saving." };
        } else {
          assert.equal(body.expectedMapSetAt, mapSetAt);
          assert.deepEqual(
            body.placements.map((entry) => entry.venueId).sort(),
            venues.map((venue) => venue.id).sort(),
          );
          savedImage = body.image;
          mapSetAt = savedImage ? new Date(Date.now() + writes.length * 1000).toISOString() : "";
          venues = venues.map((venue) => {
            const pin = body.placements.find((entry) => entry.venueId === venue.id);
            return { ...venue, presentation: { ...venue.presentation, x: pin.x, y: pin.y } };
          });
          value = snapshot();
        }
      } else if (path.endsWith("/setup/town-map/generate")) {
        const body = route.request().postDataJSON();
        assert.equal(body.sceneryArtStyle, "Watercolor with clear spatial outlines");
        assert.equal(body.useVisualLore, false);

        if (failedGeneration) {
          status = 500;
          value = { error: "Generation failed" };
        } else value = { image: image("#50769a"), width: 1500, height: 1000 };
      } else if (path.endsWith("/memories"))
        value = {
          generatedAt: now,
          residents: [],
          durable: [],
          recollections: [],
          expiredRecollectionCount: 0,
          archive: { total: 0, pendingReviewCount: 0, recent: [] },
        };
      else if (path.endsWith("/rooms/active")) value = { session: null, debugDiscardEnabled: false };
      else if (path.endsWith("/personas")) value = { personas: [] };
      else if (path.endsWith("/lorebooks")) value = { books: [] };
      else if (path.endsWith("/catalog")) value = { characters: [] };
      else if (path.endsWith("/narration"))
        value = {
          styleInstructions: "",
          defaultStyleInstructions: "",
          styleMaxLength: 1000,
          tense: "present",
          person: "third",
          rating: "sfw",
        };
      await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(value) });
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
    await expect(page.locator(".marinara-capability-villages-home-full")).toHaveAttribute(
      "data-mobile",
      String(mobile),
    );
    const visiblePhotos = page.locator(
      ".marinara-capability-villages-home-full .marinara-capability-villages-pin-photo-card",
    );
    if (!mobile) await expect(visiblePhotos).toHaveCount(16);
    else
      await expect
        .poll(
          async () => {
            const count = await visiblePhotos.count();
            return count > 0 && count <= 16;
          },
          { message: "offscreen Polaroids clip naturally while panning" },
        )
        .toBe(true);

    await expect(page.locator('[class*="pin-tack"], [class*="photo-tack"]')).toHaveCount(0);
    await expect(page.locator(".marinara-capability-villages-pin-photo svg")).toHaveCount(0);
    for (const img of await page.locator(".marinara-capability-villages-pin-photo img").all())
      await expect(img).toHaveCSS("object-fit", "contain");
    await page.getByRole("button", { name: "More" }).click();
    await expect(page.getByRole("button", { name: "Memories", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Homes", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Town map", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Village Story/u })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Noticeboard/u })).toHaveCount(0);
    await page.getByRole("button", { name: "General settings", exact: true }).click();
    await expect(page.getByRole("button", { name: "Run setup again" })).toHaveCount(0);
    await page.getByRole("button", { name: "Village Settings" }).click();
    await expect(page.getByRole("heading", { name: "Village Map" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Run setup again" })).toBeVisible();
    const mapStage = page.locator(".marinara-capability-villages-stage");
    await expect(mapStage.locator(".marinara-capability-villages-pin-photo-card")).toHaveCount(16);
    await expect(mapStage.locator('[class*="pin-tack"], [class*="photo-tack"]')).toHaveCount(0);
    await expect(mapStage.locator(".marinara-capability-villages-pin-photo-empty")).not.toHaveCount(0);
    if (process.env.VILLAGES_SCREENSHOT_DIR) {
      mkdirSync(process.env.VILLAGES_SCREENSHOT_DIR, { recursive: true });
      await mapStage.screenshot({
        path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "sixteen-polaroids-" + width + ".png"),
      });
    }
    await page.getByRole("button", { name: "Replace map" }).click();
    await expect(page.getByText("Venues will not move automatically.", { exact: false })).toBeVisible();
    failedGeneration = true;
    await page.getByRole("button", { name: "Generate replacement" }).click();
    await expect(page.getByText("Generation failed")).toBeVisible();
    assert.equal(writes.length, 0);
    failedGeneration = false;
    await page.getByRole("button", { name: "Generate replacement" }).click();
    const placement = page.locator('div[aria-label="Venue placement"]');
    await expect(placement.getByText("Mara's home")).toBeVisible();
    await expect(placement.getByText("The Mill")).toBeVisible();
    await placement
      .locator(`.marinara-capability-villages-row`)
      .filter({ hasText: "Mara's home" })
      .getByRole("button", { name: "Move photograph" })
      .click();
    const placementCanvas = page.locator(".marinara-capability-villages-canvas").first();
    const placementBounds = await placementCanvas.boundingBox();
    assert.ok(placementBounds);
    await placementCanvas.click({
      position: { x: placementBounds.width * 0.93, y: placementBounds.height * 0.92 },
    });
    await page.getByRole("button", { name: "Save map and placements" }).click();
    await expect(page.getByRole("button", { name: "Replace map" })).toBeVisible();
    assert.equal(writes.length, 1);
    assert.notEqual(writes[0].placements.find((entry) => entry.venueId === "home").x, 0.2);
    assert.equal(writes[0].placements.find((entry) => entry.venueId === "worksite").x, 0.8);
    await page.getByRole("button", { name: "Crop or fit current map" }).click();
    await page.getByRole("button", { name: "Show all of it" }).click();
    await page.getByRole("button", { name: "Save framing" }).click();
    assert.equal(writes.at(-1).view.fit, "contain");
    await page.getByRole("button", { name: "Replace map" }).click();
    await page.getByRole("button", { name: "No background image" }).click();
    await expect(placement.getByText("The Mill")).toBeVisible();
    await page.getByRole("button", { name: "Back to menu" }).click();
    await page.getByRole("button", { name: "Back to the village" }).click();
    await expect(
      page.locator(".marinara-capability-villages-home-full .marinara-capability-villages-canvas-img"),
    ).toHaveAttribute("src", savedImage);
    await page.getByRole("button", { name: "More" }).click();
    await page.getByRole("button", { name: "Village Settings" }).click();
    await page.getByRole("button", { name: "Cancel replacement" }).click();
    assert.equal(writes.length, 2);
    await page.getByRole("button", { name: "Replace map" }).click();
    await page.getByRole("button", { name: "No background image" }).click();
    await page.getByRole("button", { name: "Save map and placements" }).click();
    assert.equal(writes.at(-1).image, "");
    await page.getByRole("button", { name: "Replace map" }).click();
    const upload = page.getByLabel("Upload replacement village map");
    await upload.setInputFiles({
      name: "map.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/qX8AAAAASUVORK5CYII=",
        "base64",
      ),
    });
    await expect(placement.getByText("Mara's home")).toBeVisible();
    staleSave = true;
    await page.getByRole("button", { name: "Save map and placements" }).click();
    await expect(page.getByText("The village map changed. Reload it before saving.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel replacement" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel replacement" }).click();
    await page.getByRole("button", { name: "Back to menu" }).click();
    await page.getByRole("button", { name: "Back to the village" }).click();
    await expect(page.getByRole("button", { name: /Notices \(1\)/u })).toBeVisible();
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Villages menu/map browser: desktop and mobile navigation, generate, upload, removal, framing, sixteen Polaroids, cancel, stale save ok",
  );
} finally {
  await browser.close();
}
