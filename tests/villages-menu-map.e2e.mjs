import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { PNG } from "pngjs";
import { chromium, expect, fulfill, mockEngineLookups } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as base, image, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const P = "marinara-capability-villages";
const browser = await chromium.launch({ headless: true });
const generated = "data:image/png;base64," + PNG.sync.write(new PNG({ width: 1440, height: 900 })).toString("base64");
const html =
  "<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7;--secondary:#384253}html,body{margin:0;width:100%;height:100%;background:var(--background);color:var(--foreground);font-family:Arial,sans-serif}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>";
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width < 600 });
    await mockEngineLookups(page);
    const state = structuredClone(base);
    state.village.name = "Maple House";
    state.settings.setting = "An apartment building and its neighborhood.";
    state.settings.townMapImageMaxLength = 8000000;
    state.settings.maps[0].name = "Maple House";
    state.settings.maps.push({
      ...state.settings.maps[0],
      id: "map-street",
      name: "Maple Street",
      artwork: { id: "street-art", ref: "street-art", url: image("#50769a") },
    });
    state.settings.venues = state.settings.venues.slice(0, 2);
    state.settings.venues[0].name = "Lobby";
    state.settings.venues[1].name = "Corner Café";
    state.settings.venues[1].presentation.mapId = "map-street";
    const writes = [];
    let generation = null;
    let holdMapSave = false,
      heldMapSave;
    let statusReads = 0;
    let releaseStatus;
    const statusGate = new Promise((resolve) => {
      releaseStatus = resolve;
    });
    let session = null;
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = state;
      if (route.request().method() !== "GET" && !path.endsWith("/background/presence"))
        writes.push({ path, body: route.request().postDataJSON() });
      if (path.endsWith("/maps/generate")) {
        const body = route.request().postDataJSON();
        generation = {
          id: body.actionId,
          targetId: body.targetId,
          status: "complete",
          error: "",
          result: { image: generated, width: 1440, height: 900 },
        };
        value = generation;
      } else if (path.includes("/maps/generation/")) {
        statusReads++;
        await statusGate;
        value = generation;
      } else if (path.endsWith("/maps") && route.request().method() === "POST") {
        const body = route.request().postDataJSON();
        state.settings.maps.push({
          id: body.id,
          name: body.name,
          artwork: { id: "new-art", ref: "new-art", url: body.image },
          width: 1440,
          height: 900,
          revision: 1,
          view: body.view,
        });
      } else if (path.includes("/maps/") && route.request().method() === "PUT") {
        const body = route.request().postDataJSON();
        const map = state.settings.maps.find((map) => path.endsWith(map.id));
        assert.equal(body.expectedRevision, map.revision);
        assert.deepEqual(
          body.placements.map((pin) => pin.venueId),
          state.settings.venues.filter((venue) => venue.presentation.mapId === map.id).map((venue) => venue.id),
        );
        Object.assign(map, { name: body.name ?? map.name, view: body.view ?? map.view, revision: map.revision + 1 });
        for (const placement of body.placements) {
          const venue = state.settings.venues.find((entry) => entry.id === placement.venueId);
          if (venue) Object.assign(venue.presentation, { x: placement.x, y: placement.y });
        }
        if (holdMapSave) {
          heldMapSave = route;
          return;
        }
      } else if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity"))
        value = { session, debugDiscardEnabled: false };
      else if (path.endsWith("/changes"))
        value = {
          changes: [],
          notices: [],
          dismissedNoticeIds: [],
          nextCursor: "",
          hasMore: false,
          processingSummary: { pending: 0, failed: 0, rejected: 0 },
          unresolved: [],
        };
      else if (path.endsWith("/operation")) value = { operation: null };
      else if (path.endsWith("/connections"))
        value = { systemConnectionId: "", narrationConnectionId: "", imageConnectionId: "" };
      else if (path.endsWith("/catalog")) value = { characters: [] };
      else if (path.endsWith("/personas")) value = { personas: [] };
      else if (path.endsWith("/lorebooks")) value = { books: [] };
      else if (path.endsWith("/debug/runtime")) value = { showUsageMeter: false };
      await fulfill(route, { json: value });
    });
    await page.route("http://villages.test/", (route) => fulfill(route, { contentType: "text/html", body: html }));
    const mount = async () => {
      await page.goto("http://villages.test/");
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    };
    await mount();
    const mapImage = (name) => page.getByRole("img", { name: "A map of " + name + ".", exact: true });
    const places = page.getByRole("complementary", { name: "Places navigator" });
    await expect(page.getByRole("combobox", { name: "Displayed map" })).toHaveCount(0);
    await expect(places).toHaveCount(0);
    await expect(mapImage("Maple House")).toBeVisible();
    const originalMarker = { ...state.settings.venues[0].presentation };
    await page.getByRole("button", { name: "Move markers", exact: true }).click();
    await page.getByRole("combobox", { name: "Move Venue" }).selectOption(state.settings.venues[0].id);
    const navigationMap = page.locator("." + P + "-home-map-viewport ." + P + "-canvas");
    const mapBox = await navigationMap.boundingBox();
    await navigationMap.click({ position: { x: mapBox.width * 0.6, y: mapBox.height * 0.6 } });
    assert.equal(writes.length, 0, "marker changes are a draft until saved");
    assert.equal(
      await page.evaluate(() => window.dispatchEvent(new Event("beforeunload", { cancelable: true }))),
      false,
    );
    const draftKey = "villages-marker-draft:map-house:map-house";
    const editedPlacement = await page.evaluate(
      ([key, id]) => JSON.parse(sessionStorage.getItem(key)).placements[id],
      [draftKey, state.settings.venues[0].id],
    );
    page.once("dialog", (dialog) => dialog.accept());
    await mount();
    await page.getByRole("button", { name: "Resume marker edits", exact: true }).click();
    assert.deepEqual(
      await page.evaluate(
        ([key, id]) => JSON.parse(sessionStorage.getItem(key)).placements[id],
        [draftKey, state.settings.venues[0].id],
      ),
      editedPlacement,
      "draft survives leaving the map",
    );
    await expect(page.getByRole("combobox", { name: "Move Venue" })).toHaveValue(state.settings.venues[0].id);
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    assert.deepEqual(state.settings.venues[0].presentation, originalMarker, "cancel leaves the saved marker alone");
    await page.getByRole("button", { name: "Move markers", exact: true }).click();
    await page.getByRole("combobox", { name: "Move Venue" }).selectOption(state.settings.venues[0].id);
    await navigationMap.click({ position: { x: mapBox.width * 0.5, y: mapBox.height * 0.5 } });
    const markerButton = navigationMap.locator('[data-pin-id="' + state.settings.venues[0].id + '"]');
    await markerButton.focus();
    await page.keyboard.press("ArrowRight");
    mkdirSync(resolve(".build-tmp/multiple-maps"), { recursive: true });
    await page.screenshot({ path: resolve(".build-tmp/multiple-maps/move-" + width + ".png") });
    await page.getByRole("button", { name: "Save markers", exact: true }).click();
    const markerWrite = writes.at(-1);
    assert.equal(markerWrite.body.expectedRevision, 1);
    assert.notEqual(markerWrite.body.placements[0].x, originalMarker.x);
    assert.equal(state.settings.venues[0].presentation.x, markerWrite.body.placements[0].x);
    await expect(page.getByRole("button", { name: "Move markers", exact: true })).toBeVisible();
    Object.assign(state.settings.venues[0].presentation, { x: null, y: null });
    await mount();
    await page.getByRole("button", { name: "Move markers", exact: true }).click();
    await page.getByRole("combobox", { name: "Move Venue" }).selectOption(state.settings.venues[0].id);
    await navigationMap.focus();
    await page.keyboard.press("ArrowRight");
    await page.getByRole("button", { name: "Save markers", exact: true }).click();
    assert.equal(state.settings.venues[0].presentation.x, 0.51, "keyboard places an unplaced Venue");
    assert.equal(state.settings.venues[0].presentation.y, 0.5);
    writes.length = 0;
    await page.getByRole("button", { name: "All maps", exact: true }).click();
    await expect(page.locator("." + P + "-maps-grid button")).toHaveCount(2);
    await page.getByRole("button", { name: "Maple Street 1 Venues", exact: true }).click();
    await expect(mapImage("Maple Street")).toBeVisible();
    await expect(places).toHaveCount(0);
    await page.getByRole("button", { name: "Show places", exact: true }).click();
    await expect(page.getByRole("button", { name: /Corner Café.*Venue/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Lobby.*Workplace/ })).toHaveCount(0);
    assert.equal(
      writes.length,
      0,
      "browsing does not create a Scene or change the world: " + JSON.stringify(writes.map((write) => write.path)),
    );
    await mount();
    await expect(mapImage("Maple Street")).toBeVisible();
    await expect(places).toHaveCount(0);
    await page.getByRole("button", { name: "All maps", exact: true }).click();
    await page.getByRole("button", { name: "Manage maps", exact: true }).click();
    await page.getByRole("button", { name: "Add map", exact: true }).click();
    await page.getByRole("textbox", { name: "Map name", exact: true }).fill("Riverside");
    await expect(page.getByRole("button", { name: "Save map", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Generate artwork", exact: true }).click();
    await expect.poll(() => statusReads).toBe(1);
    await page.getByRole("button", { name: "Check map status", exact: true }).click();
    assert.equal(statusReads, 1, "manual status checks cannot overlap the running poll");
    releaseStatus();
    await expect(page.getByRole("button", { name: "Save map", exact: true })).toBeEnabled();
    const requestId = generation.id;
    await mount();
    await page.getByRole("button", { name: "All maps", exact: true }).click();
    await page.getByRole("button", { name: "Manage maps", exact: true }).click();
    await page.getByRole("button", { name: "Add map", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Map name", exact: true })).toHaveValue("Riverside");
    await expect(page.getByRole("button", { name: "Save map", exact: true })).toBeEnabled();
    assert.equal(generation.id, requestId, "reload recovers the candidate without another generation");
    await page.getByRole("button", { name: "Save map", exact: true }).click();
    await expect(page.locator("." + P + "-maps-saved-row")).toHaveCount(3);
    assert.equal(state.settings.venues.length, 2, "a map does not create Venues");
    await page.getByRole("button", { name: "Edit map", exact: true }).first().click();
    const originalPosition = { x: state.settings.venues[0].presentation.x, y: state.settings.venues[0].presentation.y };
    const marker = page.getByRole("combobox", { name: "Place marker", exact: true });
    await marker.selectOption(state.settings.venues[0].id);
    const editStage = page.locator("." + P + "-maps-editor ." + P + "-stage");
    const stageBox = await editStage.boundingBox();
    await editStage.click({ position: { x: stageBox.width * 0.2, y: stageBox.height * 0.6 } });
    await expect(marker).toHaveValue("");
    page.once("dialog", (dialog) => dialog.dismiss());
    await page
      .getByRole("navigation", { name: "Village navigation" })
      .getByRole("button", { name: "Map", exact: true })
      .click();
    await expect(page.getByRole("textbox", { name: "Map name", exact: true })).toBeVisible();
    await page.getByRole("textbox", { name: "Map name", exact: true }).fill("Maple House Interior");
    await marker.selectOption(state.settings.venues[0].id);
    holdMapSave = true;
    await page.getByRole("button", { name: "Save map", exact: true }).click();
    await expect.poll(() => !!heldMapSave).toBe(true);
    await expect(page.getByRole("button", { name: "Save settings", exact: true })).toBeDisabled();
    await expect(page.getByLabel("Village world", { exact: true })).toBeDisabled();
    await expect(page.locator("." + P + "-map-edit-canvas")).toHaveAttribute("inert", "");
    await editStage.scrollIntoViewIfNeeded();
    const heldBox = await editStage.boundingBox();
    await page.mouse.click(heldBox.x + heldBox.width * 0.75, heldBox.y + heldBox.height * 0.5);
    await expect(marker).toHaveValue(state.settings.venues[0].id);
    await fulfill(heldMapSave, { json: state });
    holdMapSave = false;
    await expect(page.locator("." + P + "-maps-saved-row").first()).toContainText("Maple House Interior");
    const savedPlacement = writes
      .findLast((write) => write.path.endsWith("/maps/map-house"))
      .body.placements.find((row) => row.venueId === state.settings.venues[0].id);
    assert.notDeepEqual(
      { x: savedPlacement.x, y: savedPlacement.y },
      originalPosition,
      "cancelled navigation preserves the unsaved placement",
    );
    session = {
      version: 2,
      id: "scene-map",
      memoryMode: "live",
      sceneRevision: 1,
      placeId: "mill",
      placeName: "Lobby",
      startedAt: now,
      lastActivityAt: now,
      endedAt: "",
      endReason: "",
      status: "active",
      activeIds: ["mara"],
      participants: [{ characterId: "mara", name: "Mara", doing: "waiting" }],
      lines: [
        {
          id: "n1",
          role: "assistant",
          speakerId: "",
          name: "",
          kind: "narration",
          content: "The lobby is quiet.",
          heardBy: ["mara"],
          at: now,
        },
      ],
      turnCount: 1,
    };
    await mount();
    const composer = page.locator("[data-villages-scene-composer]");
    await expect(composer).toBeVisible();
    await composer.fill("An unfinished thought");
    const beforeBrowsing = writes.length;
    await page.getByRole("button", { name: "Venue actions", exact: true }).click();
    await page.getByRole("menuitem", { name: "Map", exact: true }).click();
    await expect(places).toHaveCount(0);
    await page.getByRole("button", { name: "All maps", exact: true }).click();
    await page.getByRole("button", { name: "Maple Street 1 Venues", exact: true }).click();
    await expect(mapImage("Maple Street")).toBeVisible();
    await expect(places).toHaveCount(0);
    await page.getByRole("button", { name: "Show places", exact: true }).click();
    await expect(page.getByRole("button", { name: "Visit", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Return to Scene", exact: true }).click();
    await expect(composer).toHaveValue("An unfinished thought");
    assert.equal(writes.length, beforeBrowsing, "map browsing preserves the active Scene without world commands");
    await page.getByRole("button", { name: "Venue actions", exact: true }).click();
    await page.getByRole("menuitem", { name: "Map", exact: true }).click();
    await page.getByRole("button", { name: "All maps", exact: true }).click();
    mkdirSync(".build-tmp/multiple-maps", { recursive: true });
    await page.screenshot({ path: resolve(".build-tmp/multiple-maps/overview-" + width + ".png") });
    assert.ok((await page.locator("." + P + "-maps-overview").boundingBox()).width <= width);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log("Multiple maps: selection, scope, creation, recovery and active Scene browsing pass on desktop and phone.");
