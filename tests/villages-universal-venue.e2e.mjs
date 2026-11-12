import { clickCharacterTool } from "./fixtures/browser-diagnostics.mjs";
import { scenePlaybackFixtures } from "./fixtures/scene-browser.fixture.mjs";
const { authorSceneResponse } = await scenePlaybackFixtures();
import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as fixture, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({ headless: true });
const prefix = "marinara-capability-villages";
await withBrowser(browser, async () => {
  for (const width of [1366, 850, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await mockEngineLookups(page);
    const errors = [],
      writes = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
      console.error(error.message);
    });
    const snapshot = structuredClone(fixture);
    const night = width === 850;
    Object.assign(snapshot.village, {
      instant: night ? "2026-11-05T20:00:00Z" : "2026-11-05T12:00:00Z",
      timeZone: "UTC",
      hour: night ? 20 : 12,
      minute: 0,
      minuteOfDay: night ? 1200 : 720,
      localTime: night ? "20:00" : "12:00",
    });
    snapshot.isFounded = true;
    snapshot.projects = [];
    const place = snapshot.settings.venues[0];
    let session = null;
    let holdZoneSave = false,
      heldZoneSave,
      holdVenueSave = false,
      heldVenueSave;
    place.name = "Warehouse home";
    place.venueType = "Converted office residence";
    place.classes = ["residence"];
    place.residentIds = ["mara"];
    place.workerIds = ["eli"];
    place.occupancy = { playerHome: false, residentCharacterId: null, homeKind: null };
    place.residentIds = ["mara"];
    place.form = "A converted warehouse";
    place.description = "A home beside the village mill.";
    const access = (allowed, mode = "permission-required") => ({
      decision: {
        allowed,
        available: true,
        mode,
        reason: allowed ? "member" : "permission-required",
        explanation: allowed ? "Resident access" : "Permission needed",
        canManage: false,
        canInvite: false,
      },
    });
    place.zones = [
      {
        id: "exterior",
        name: "Entrance",
        kind: "exterior",
        venueClass: "residence",
        connectedTo: ["bay"],
        seen: true,
        description: "A sheltered approach.",
        image: null,
      },
      {
        id: "bay",
        name: "Main Bay",
        kind: "shared-residence",
        venueClass: "residence",
        connectedTo: ["exterior", "alcove", "workshop"],
        seen: true,
        pictureGenerateAvailable: true,
        description: "An open living area.",
        image: null,
        accessView: access(false),
      },
      {
        id: "alcove",
        name: "Sleeping Alcove",
        kind: "private-residence",
        venueClass: "residence",
        connectedTo: ["bay"],
        seen: false,
        pictureGenerateAvailable: false,
        description: "A private sleeping alcove with a blue blanket.",
        image: { id: "alcove-art", ref: "global-gallery:alcove-art", url: mapImage },
        accessView: access(false),
      },
      {
        id: "workshop",
        name: "Workshop",
        kind: "public",
        venueClass: "residence",
        connectedTo: ["bay"],
        seen: true,
        description: "A bright bench.",
        image: null,
        accessView: access(true, "public"),
      },
    ];
    snapshot.residences = [
      { characterId: "mara", venueId: place.id, proposedVenueId: place.id, status: "pending", requestedBy: "villager" },
    ];
    const otherId = snapshot.settings.venues[1].id;
    snapshot.residences.push({
      characterId: "eli",
      venueId: otherId,
      proposedVenueId: otherId,
      status: "pending",
      requestedBy: "villager",
    });
    await page.route("**/api/characters/summaries", (route) => fulfill(route, { json: [] }));
    await page.route("**/api/villages**", async (route) => {
      const request = route.request(),
        path = new URL(request.url()).pathname;
      if (request.method() !== "GET" && !path.endsWith("/background/presence") && !path.endsWith("/reconcile"))
        writes.push({ path, body: request.postDataJSON() });
      if (path.endsWith("/background/presence"))
        return fulfill(route, { json: { status: "ready", snapshot: snapshot } });
      let value = snapshot;
      if (path.endsWith("/rooms/active")) value = { session };
      else if (path.endsWith("/rooms") && request.method() === "POST") {
        session = {
          version: 2,
          id: "venue-visit",
          placeId: place.id,
          placeName: place.name,
          zoneId: "exterior",
          area: "outside",
          spaceClass: "residence",
          privateOwnerId: "",
          startedAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
          endedAt: "",
          status: "active",
          activeIds: [],
          participants: [],
          lines: [],
        };
        value = { session };
      } else if (path.endsWith("/rooms/activity")) value = { session };
      else if (/\/rooms\/(greet|turn)/.test(path)) throw Error("Unexpected generation " + path);
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/catalog")) value = { characters: [] };
      else if (path.endsWith("/personas")) value = { personas: [] };
      else if (path.endsWith("/lorebooks")) value = { books: [] };
      else if (path.endsWith("/debug/lore"))
        value = {
          scope: snapshot.worldScope,
          revision: 0,
          records: [
            { id: "zone-artwork", at: "2026-11-05T00:00:00Z", purpose: "Zone artwork", revision: 0, entries: [] },
          ],
        };
      else if (path.endsWith("/connections"))
        value = { systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" };
      else if (path.endsWith("/locations/venue/image/freeze")) {
        const body = request.postDataJSON();
        place.zones.find((zone) => zone.id === body.zoneId).freezePicture = body.frozen;
      } else if (path.endsWith("/locations/venue/image")) {
        const body = request.postDataJSON();
        const zone = place.zones.find((zone) => zone.id === body.zoneId);
        if (zone) {
          if (request.method() === "PUT") {
            zone.pictureReference = { id: "uploaded-reference", url: mapImage + "#reference" };
            zone.referencePending = true;
          } else if (request.method() === "DELETE") {
            zone.image = null;
            zone.nightImage = undefined;
            zone.pictureReference = undefined;
            zone.referencePending = false;
          } else {
            zone.image = { ref: "zone:" + zone.id, url: mapImage };
            zone.dayNight = true;
            zone.nightImage = { id: "night", url: mapImage + "#night" };
          }
        }
        if (zone) {
          zone.pictureRetryAvailable = false;
          zone.pictureProblem = undefined;
        }
      } else if (path.endsWith(`/locations/venue/${place.id}`) && request.method() === "PUT") {
        if (request.postDataJSON().name === "Taken name") {
          await fulfill(route, { status: 409, json: { error: "A venue with that name already exists." } });
          return;
        }
        place.name = request.postDataJSON().name;
        if (holdVenueSave) {
          heldVenueSave = route;
          return;
        }
      } else if (/\/venues\/[^/]+\/zones\/[^/]+\/name$/.test(path) && request.method() === "PUT") {
        const zone = place.zones.find((zone) => zone.id === decodeURIComponent(path.split("/").at(-2)));
        zone.name = request.postDataJSON().name;
        if (holdZoneSave) {
          heldZoneSave = route;
          return;
        }
      } else if (path.endsWith("/image/generate")) value = { ...snapshot };
      await fulfill(route, { json: authorSceneResponse(value, snapshot.worldScope) });
    });
    await page.route("http://venue.test/", (route) =>
      fulfill(route, {
        contentType: "text/html",
        body: `<style>:root{--background:#141b2c;--foreground:#f3f0ff;--popover:#202c44;--border:#60708e;--primary:#d2c0ff;--primary-foreground:#25183b;--muted-foreground:#c4cbd7}html,body{margin:0;width:100%;height:100%;font-family:Arial}${prefix}{display:block;height:100%}</style><header style="height:48px">Engine</header><${prefix} style="height:calc(100% - 48px)"></${prefix}>`,
      }),
    );
    await page.goto("http://venue.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await expect(page.getByRole("navigation", { name: "Village exploration" }).getByRole("button")).toHaveText([
      "Map",
      "Places",
      "People",
      "Projects",
      "More",
    ]);
    await page
      .getByRole("navigation", { name: "Village exploration" })
      .getByRole("button", { name: "Projects", exact: true })
      .click();
    await expect(page.getByRole("main", { name: "Projects" })).toBeVisible();
    await page.getByRole("button", { name: /Return to village|← Village/, exact: true }).click();
    const placesButton = page
      .getByRole("navigation", { name: "Village exploration" })
      .getByRole("button", { name: "Places", exact: true });
    await placesButton.click();
    const placesDirectory = page.getByRole("complementary", { name: "Places navigator" });
    const placesSearch = placesDirectory.getByRole("searchbox", { name: "Search places", exact: true });
    await expect(placesSearch).toBeFocused();
    await placesDirectory.getByRole("button", { name: /^(Collapse|Close) places$/ }).click();
    await expect(placesDirectory).toHaveCount(0);
    await expect(placesButton).toBeFocused();
    await placesButton.click();
    await expect(placesSearch).toBeFocused();
    await placesSearch.press("Escape");
    await expect(placesButton).toBeFocused();
    await placesButton.press("Enter");
    await expect(placesSearch).toBeFocused();
    const openProfile = async (id = place.id) => {
      const navigator = page.getByRole("complementary", { name: "Places navigator" });
      await navigator.locator(`[data-exploration-row="${id}"]`).click();
      await navigator.getByRole("button", { name: "View venue", exact: true }).click();
    };
    await openProfile();
    const profile = page.locator(`.${prefix}-venue-profile`);
    await expect(profile.getByRole("heading", { name: "Warehouse home", exact: true })).toBeVisible();
    const typeLines = await profile
      .locator(`.${prefix}-venue-metadata dd`)
      .first()
      .evaluate((entry) => {
        const range = document.createRange();
        range.setStart(entry.firstChild, 0);
        range.setEnd(entry.firstChild, "Converted".length);
        return range.getClientRects().length;
      });
    assert.equal(typeLines, 1, "Venue type words remain readable without splitting across lines");
    const desk = page.locator(`.${prefix}-desk-workspace`);
    const checkArtworkBottom = async () => {
      const margin = await desk.evaluate((root) => {
        const stage = root.querySelector(".marinara-capability-villages-desk-stage");
        const paper = root.querySelector(".marinara-capability-villages-desk-document");
        const bottom = paper.getBoundingClientRect().bottom;
        return root.getBoundingClientRect().bottom + stage.scrollHeight - stage.clientHeight - stage.scrollTop - bottom;
      });
      assert(margin >= 6, "Menu content leaves the illustrated skyline visible");
    };
    await checkArtworkBottom();
    assert(
      await desk
        .getByRole("navigation", { name: "Village navigation" })
        .evaluate((nav) => getComputedStyle(nav.closest("[data-desk]")).backgroundImage.includes("blob:")),
      "The first Places entry prepares the shared storybook background",
    );
    const deskNavigation = page.getByRole("navigation", { name: "Village navigation", exact: true });
    await deskNavigation.getByRole("button", { name: "Settings", exact: true }).click();
    await expect(desk).toHaveAttribute("data-desk", "settings");
    await deskNavigation.getByRole("button", { name: "Places", exact: true }).click();
    await expect(profile.getByRole("heading", { name: "Warehouse home", exact: true })).toBeVisible();
    await profile.getByRole("button", { name: "← Back to map", exact: true }).click();
    await expect(page.getByRole("complementary", { name: "Places navigator" })).toBeVisible();
    await expect(desk).not.toHaveAttribute("data-venue", "true");
    await checkArtworkBottom();
    await openProfile();
    let selectedVenue = place.id;
    const chooseVenue = async (id) => {
      await profile.getByRole("button", { name: "← Back to map", exact: true }).click();
      const row = page
        .getByRole("complementary", { name: "Places navigator" })
        .locator(`[data-exploration-row="${selectedVenue}"]`);
      await expect(row).toBeFocused();
      await openProfile(id);
      selectedVenue = id;
    };
    await chooseVenue(otherId);
    await expect(profile.getByRole("heading", { name: "The Harbour", exact: true })).toBeVisible();
    await chooseVenue(place.id);
    await expect(profile.getByRole("heading", { name: "Warehouse home", exact: true })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const tabs = profile.getByRole("navigation", { name: "Venue sections" });
    await expect(tabs.getByRole("button", { name: "About", exact: true })).toHaveAttribute("aria-pressed", "true");
    const about = profile.getByRole("region", { name: "About this venue" });
    await expect(about.getByRole("heading", { name: "Assigned villagers", exact: true })).toBeVisible();
    await expect(about.getByRole("listitem").filter({ hasText: "Mara" })).toContainText("Resident");
    await expect(about.getByRole("listitem").filter({ hasText: "Eli" })).toContainText("Worker");
    await expect(about.getByRole("heading", { name: /Lives here|Works here/ })).toHaveCount(0);
    await expect(profile.getByRole("button", { name: "Visit venue", exact: true })).toBeVisible();
    assert.equal(writes.length, 0);
    await tabs.getByRole("button", { name: "Zones", exact: true }).click();
    const picker = profile.getByRole("region", { name: "Zones", exact: true });
    await expect(picker.getByRole("button")).toHaveCount(4);
    await picker.getByRole("button", { name: /^Sleeping Alcove/ }).click();
    await expect(profile.locator(`.${prefix}-venue-photo img`)).toHaveAttribute(
      "src",
      width <= 704 ? place.presentation.image.url : mapImage,
    );
    await expect(profile.locator(".villages-zone-map")).toHaveCount(0);
    assert.equal(writes.length, 0, "browsing known Zone art never starts a Scene or saves a change");
    await tabs.getByRole("button", { name: "Manage", exact: true }).click();
    await profile.getByRole("button", { name: "Zone connections", exact: true }).click();
    const layout = profile.locator(".villages-zone-map");
    await expect(layout.locator("[data-layout-zone]")).toHaveCount(4);
    await expect(layout.locator("svg line")).toHaveCount(3);
    await expect(profile.getByText("Zone settings", { exact: true })).toHaveCount(0);
    await expect(profile.getByLabel("Room name", { exact: true })).toHaveCount(0);
    const manageBack = profile.getByRole("button", { name: "← Manage", exact: true });
    await manageBack.click();
    await expect(layout).toHaveCount(0);
    await tabs.getByRole("button", { name: "Zones", exact: true }).click();
    const roomButton = (name) => picker.getByRole("button", { name: new RegExp(`^${name}\\b`) });
    const editor = profile.getByRole("region", { name: "Edit room details", exact: true });
    const zoneBack = editor.getByRole("button", { name: "← Zones", exact: true });
    const roomName = editor.getByLabel("Room name", { exact: true });
    const chooseRoom = async (name) => {
      if (await zoneBack.isVisible()) await zoneBack.click();
      await roomButton(name).click();
      if (name === "Entrance") await expect(editor.getByRole("heading", { name, exact: true })).toBeVisible();
      else await expect(roomName).toHaveValue(name);
    };
    await chooseRoom("Workshop");
    await roomName.fill("Unsent Zone name");
    await roomName.press("Escape");
    await expect(roomName).toHaveValue("Workshop");
    await page
      .getByRole("navigation", { name: "Village navigation" })
      .getByRole("button", { name: "People", exact: true })
      .click();
    const peopleBook = page.getByRole("dialog", { name: "People", exact: true });
    await expect(peopleBook).toBeVisible();
    await expect(page.locator("[data-desk=people]")).toHaveAttribute("data-phase", "open");
    await page
      .getByRole("navigation", { name: "Village navigation", exact: true })
      .getByRole("button", { name: "People", exact: true })
      .focus();
    await page.keyboard.press("Escape");
    await expect(profile.getByRole("heading", { name: "Warehouse home", exact: true })).toBeVisible();
    await expect(roomName).toHaveValue("Workshop");
    await chooseRoom("Entrance");
    await expect(profile.getByText("Exterior", { exact: true })).toHaveCount(0);
    await expect(roomName).toHaveCount(0);
    await expect(profile.getByText("Access options", { exact: true })).toHaveCount(0);
    await chooseRoom("Sleeping Alcove");
    const detail = editor.locator(`.${prefix}-venue-zone-details`);
    await expect(detail.getByText("Private", { exact: true })).toHaveCount(0);
    await expect(detail.getByText("Permission needed", { exact: true })).toHaveCount(0);
    await expect(detail.getByText("Private details have not been shared with you.")).toHaveCount(0);
    const generate = detail.getByRole("button", { name: "Generate artwork", exact: true });
    await expect(generate).toBeDisabled();
    await expect(detail.getByRole("img", { name: "Sleeping Alcove at " + place.name })).toHaveAttribute(
      "src",
      mapImage,
    );
    if (process.env.VILLAGES_FEEDBACK_SCREENSHOTS) {
      await mkdir(process.env.VILLAGES_FEEDBACK_SCREENSHOTS, { recursive: true });
      await detail.screenshot({
        path: join(process.env.VILLAGES_FEEDBACK_SCREENSHOTS, "unvisited-private-" + width + ".png"),
      });
    }
    assert.equal(writes.length, 0, "browsing does not visit or generate");
    place.zones[1].accessView = access(true);
    place.zones[2].accessView = access(true);
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await chooseRoom("Main Bay");
    await expect(generate).toBeVisible();
    await expect(detail.getByLabel("Upload Main Bay reference")).toHaveCount(1);
    await expect(detail.getByRole("button", { name: "Upload reference", exact: true })).toBeVisible();
    await expect(detail.getByRole("button", { name: "Lore activity", exact: true })).toHaveCount(0);
    const updates = detail.getByRole("switch", { name: "Automatic artwork updates", exact: true });
    await expect(updates).toBeChecked();
    await updates.click();
    await expect(updates).not.toBeChecked();
    assert.equal(writes.at(-1).path, "/api/villages/locations/venue/image/freeze");
    assert.deepEqual(writes.at(-1).body, { venueId: place.id, zoneId: "bay", frozen: true });
    const freezeBox = await detail.locator(`.${prefix}-zone-picture-freeze`).boundingBox();
    const nameBox = await roomName.boundingBox();
    assert.ok(nameBox.y + nameBox.height <= freezeBox.y + 1, "Room name appears before artwork options");
    await updates.click();
    await expect(updates).toBeChecked();
    if (process.env.VILLAGES_FEEDBACK_SCREENSHOTS) {
      await mkdir(process.env.VILLAGES_FEEDBACK_SCREENSHOTS, { recursive: true });
      await detail.screenshot({
        path: join(process.env.VILLAGES_FEEDBACK_SCREENSHOTS, `zone-picture-freeze-${width}.png`),
      });
    }
    const emptyFrame = await detail.locator(`.${prefix}-zone-artwork-frame`).boundingBox();
    await generate.click();
    await expect(generate).toBeEnabled();
    assert.equal((await detail.locator(`.${prefix}-zone-artwork-frame`).boundingBox()).height, emptyFrame.height);
    assert.deepEqual(writes.at(-1), {
      path: "/api/villages/locations/venue/image",
      body: { venueId: place.id, zoneId: "bay" },
    });
    await expect(detail.getByRole("switch", { name: "Day & night", exact: true })).toHaveCount(0);
    await expect(detail.getByRole("button", { name: "View night image", exact: true })).toHaveCount(0);
    await expect(detail.getByRole("button", { name: "Refresh picture", exact: true })).toHaveCount(0);
    if (process.env.VILLAGES_FEEDBACK_SCREENSHOTS) {
      await detail.getByRole("button", { name: "Upload reference", exact: true }).scrollIntoViewIfNeeded();
      await page.screenshot({ path: join(process.env.VILLAGES_FEEDBACK_SCREENSHOTS, `room-artwork-${width}.png`) });
    }
    await detail.getByLabel("Upload Main Bay reference").setInputFiles({
      name: "zone.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB1cAAAAASUVORK5CYII=",
        "base64",
      ),
    });
    await expect.poll(() => writes.at(-1)?.body.image?.startsWith("data:image/png")).toBe(true);
    assert.equal(writes.at(-1).body.zoneId, "bay");
    await expect(detail.locator("img")).toHaveAttribute("src", mapImage + (night ? "#night" : ""));
    await expect(detail.getByRole("status")).toHaveText("Reference saved for your next visit.");
    await expect(detail.getByRole("button", { name: "Remove artwork", exact: true })).toBeEnabled();
    const actionBoxes = await Promise.all(
      ["Generate artwork", "Upload reference", "Remove artwork"].map((name) =>
        detail.getByRole("button", { name, exact: true }).boundingBox(),
      ),
    );
    if (width <= 704) {
      assert.ok(
        actionBoxes.every((box) => box.height === 44 && box.y === actionBoxes[0].y),
        "Artwork actions fit on one touch-sized row on mobile",
      );
    } else {
      assert.ok(
        actionBoxes.every((box) => box.width <= emptyFrame.width),
        "Artwork actions fit beside the image",
      );
    }
    const actions = detail.locator(`.${prefix}-zone-artwork-actions`);
    assert.ok(
      await actions
        .locator("button")
        .evaluateAll((buttons) => buttons.every((button) => button.scrollWidth <= button.clientWidth + 1)),
      "short artwork labels fit their buttons",
    );
    if (process.env.VILLAGES_FEEDBACK_SCREENSHOTS)
      await actions.screenshot({
        path: join(process.env.VILLAGES_FEEDBACK_SCREENSHOTS, `zone-artwork-actions-${width}.png`),
      });
    await expect(detail.getByText("An open living area.", { exact: true })).toHaveCount(0);
    for (const [w, h] of [
      [120, 600],
      [1600, 200],
    ]) {
      await detail.locator("img").evaluate(
        async (img, { w, h }) => {
          img.src =
            "data:image/svg+xml," +
            encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="teal"/></svg>`,
            );
          await img.decode();
        },
        { w, h },
      );
      assert.equal(
        (await detail.locator(`.${prefix}-zone-artwork-frame`).boundingBox()).height,
        emptyFrame.height,
        "portrait and wide artwork keep the frame height",
      );
      assert.equal(
        (await detail.locator(`.${prefix}-zone-artwork-frame`).boundingBox()).width,
        emptyFrame.width,
        "portrait and wide artwork keep the frame width",
      );
    }
    await detail.getByRole("button", { name: "Remove artwork", exact: true }).click();
    await expect(detail.getByRole("button", { name: "Remove artwork", exact: true })).toHaveCount(0);
    assert.equal(writes.at(-1).body.zoneId, "bay");
    await roomName.fill("  ");
    await roomName.press("Enter");
    await expect(detail.getByRole("alert")).toContainText("Give the Zone a name");
    await roomName.fill("Harbour Lounge");
    holdZoneSave = true;
    await zoneBack.click();
    await expect.poll(() => !!heldZoneSave).toBe(true);
    await expect(roomName).toHaveValue("Harbour Lounge");
    await fulfill(heldZoneSave, { json: snapshot });
    holdZoneSave = false;
    await expect(roomButton("Harbour Lounge")).toBeFocused();
    assert.deepEqual(writes.at(-1), {
      path: `/api/villages/venues/${place.id}/zones/bay/name`,
      body: { name: "Harbour Lounge" },
    });
    await expect(roomName).toHaveCount(0);
    await chooseRoom("Harbour Lounge");
    await expect(roomName).toHaveValue("Harbour Lounge");
    await expect(detail.getByRole("button", { name: "Save room name", exact: true })).toBeDisabled();
    await tabs.getByRole("button", { name: "Manage", exact: true }).click();
    await expect(profile.getByRole("heading", { name: "Assigned villagers", exact: true })).toHaveCount(0);
    await expect(profile.getByRole("button", { name: "View housing requests" })).toHaveCount(0);
    await expect(profile.getByLabel("Physical form", { exact: true })).toHaveCount(0);
    await expect(generate).toHaveCount(0);
    const nameField = profile.getByLabel("Venue name", { exact: true });
    const saveName = profile.getByRole("button", { name: "Save name", exact: true });
    await expect(saveName).toBeDisabled();
    await nameField.fill("Taken name");
    await saveName.click();
    await expect(profile.getByRole("alert")).toHaveText("A venue with that name already exists.");
    await expect(nameField).toHaveAccessibleDescription("A venue with that name already exists.");
    await expect(nameField).toHaveValue("Taken name");
    await expect(saveName).toBeEnabled();
    const beforeName = writes.length;
    await profile.getByLabel("Venue name", { exact: true }).fill("Renamed warehouse");
    await profile.getByRole("button", { name: "← Back to map", exact: true }).click();
    await page
      .getByRole("dialog", { name: "Confirm", exact: true })
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await expect(profile.getByLabel("Venue name", { exact: true })).toHaveValue("Renamed warehouse");
    await expect(profile.getByRole("heading", { name: "Warehouse home", exact: true })).toBeVisible();
    await profile.getByRole("button", { name: "Plan a renovation", exact: true }).click();
    await page
      .getByRole("dialog", { name: "Confirm", exact: true })
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await expect(profile.getByLabel("Venue name", { exact: true })).toHaveValue("Renamed warehouse");
    await profile.getByRole("button", { name: "Zone connections", exact: true }).click();
    await page
      .getByRole("dialog", { name: "Confirm", exact: true })
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await expect(profile.getByLabel("Venue name", { exact: true })).toHaveValue("Renamed warehouse");
    holdVenueSave = true;
    await profile.getByRole("button", { name: "Save name", exact: true }).click();
    await expect.poll(() => !!heldVenueSave).toBe(true);
    await expect(page.getByRole("button", { name: /Return to village|← Village/, exact: true })).toBeDisabled();
    await expect(profile.getByRole("button", { name: "Plan a renovation", exact: true })).toBeDisabled();
    await fulfill(heldVenueSave, { json: snapshot });
    holdVenueSave = false;
    await expect(profile.getByRole("heading", { name: "Renamed warehouse", exact: true })).toBeVisible();
    await expect(saveName).toBeDisabled();
    await expect(profile.getByRole("alert")).toHaveCount(0);
    await expect(profile.getByText("Venue name saved.", { exact: true })).toHaveCount(0);
    assert.deepEqual(writes.at(-1), {
      path: `/api/villages/locations/venue/${place.id}`,
      body: { name: "Renamed warehouse" },
    });
    await profile.getByRole("button", { name: "Plan a renovation", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Renovation", exact: true })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Venue", exact: true })).toHaveValue(place.id);
    assert.equal(writes.length, beforeName + 1, "planning does not submit a Project");
    await page.getByRole("button", { name: /Return to village|← Village/, exact: true }).click();
    await page
      .getByRole("navigation", { name: "Village exploration" })
      .getByRole("button", { name: "Places", exact: true })
      .click();
    await openProfile();
    if (width === 1366) {
      await page
        .getByRole("navigation", { name: "Village navigation" })
        .getByRole("button", { name: "People", exact: true })
        .click();
      await page.getByRole("button", { name: "Open Mara profile", exact: true }).click();
      const person = page.getByRole("region", { name: "Mara profile", exact: true });
      await clickCharacterTool(page, "Venue connections");
      await person.getByRole("button", { name: /Projects Open Projects/ }).click();
      await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "People", exact: true }).click();
      await page.getByRole("button", { name: "Open Mara profile", exact: true }).click();
      await clickCharacterTool(page, "Venue connections");
      await person.getByRole("button", { name: /Venue Requests Open Venue Requests/ }).click();
      await expect(page.getByRole("button", { name: "Show all requests", exact: true })).toHaveCount(0);
      await expect(page.getByRole("main").locator('[data-villager-request="residence:eli"]')).toBeVisible();
      await page
        .getByRole("navigation", { name: "Village navigation" })
        .getByRole("button", { name: "Places", exact: true })
        .click();
    }
    await expect(profile).toBeVisible();
    for (const section of ["About", "Zones", "Manage"]) {
      await tabs.getByRole("button", { name: section, exact: true }).click();
      const bounds = await profile.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width + 1, `${width}: ${section} stays inside the host`);
      for (const button of await profile.getByRole("button").all()) {
        const box = await button.boundingBox();
        if (box)
          assert.ok(box.x >= 0 && box.x + box.width <= width + 1, `${width}: ${section} control stays inside the host`);
      }
      assert.equal(
        await profile.evaluate((el) => el.scrollWidth > el.clientWidth + 1),
        false,
        `${width}: ${section} overflow`,
      );
      if (process.env.VILLAGES_FEEDBACK_SCREENSHOTS) {
        await mkdir(process.env.VILLAGES_FEEDBACK_SCREENSHOTS, { recursive: true });
        await profile.screenshot({
          path: join(process.env.VILLAGES_FEEDBACK_SCREENSHOTS, `venue-${section.toLowerCase()}-${width}.png`),
        });
      }
    }
    await page
      .getByRole("navigation", { name: "Village navigation" })
      .getByRole("button", { name: "Settings", exact: true })
      .click();
    if (width <= 700) await page.getByRole("combobox", { name: "Section" }).selectOption("village");
    else await page.getByRole("button", { name: "World Configuration", exact: true }).click();
    await expect(page.getByRole("heading", { name: "World Configuration", level: 1, exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit", exact: true })).toHaveCount(0);
    await page
      .getByRole("navigation", { name: "Village navigation" })
      .getByRole("button", { name: "Places", exact: true })
      .click();
    await expect(profile).toBeVisible();
    await expect(tabs.getByRole("button", { name: "Manage", exact: true })).toHaveAttribute("aria-pressed", "true");
    await tabs.getByRole("button", { name: "About", exact: true }).click();
    await profile.getByRole("button", { name: "Visit venue", exact: true }).click();
    const composer = page.getByRole("textbox", { name: "Message at Renamed warehouse", exact: true });
    await expect(composer).toBeVisible();
    await composer.fill("An unsent Scene draft.");
    const beforeSceneBrowse = writes.length;
    await page.getByRole("button", { name: "Venue actions", exact: true }).click();
    await page.getByRole("menuitem", { name: "View Venue", exact: true }).click();
    await expect(profile).toBeVisible();
    for (const section of ["About", "Zones", "Manage"]) {
      await tabs.getByRole("button", { name: section, exact: true }).click();
      await expect(profile).toBeVisible();
      if (process.env.VILLAGES_FEEDBACK_SCREENSHOTS) {
        await profile.screenshot({
          path: join(
            process.env.VILLAGES_FEEDBACK_SCREENSHOTS,
            "scene-venue-" + section.toLowerCase() + "-" + width + ".png",
          ),
        });
      }
    }
    await page
      .getByRole("navigation", { name: "Village navigation" })
      .getByRole("button", { name: "Projects", exact: true })
      .click();
    await expect(page.getByRole("main", { name: "Projects" })).toBeVisible();
    await page.getByRole("button", { name: "Return to Scene", exact: true }).click();
    await expect(composer).toHaveValue("An unsent Scene draft.");
    assert.deepEqual(
      writes.slice(beforeSceneBrowse).filter((write) => !write.path.endsWith("/rooms/activity")),
      [],
      "Scene-to-Venue round trip has no movement, model request or content mutation",
    );
    assert.deepEqual(errors, []);
    await page.close();
    console.log(
      `PASS ${width}px shared Venue, public graph/private details, access labels, name-only save, Projects and housing links`,
    );
  }
});
