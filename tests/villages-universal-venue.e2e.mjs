import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as fixture, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({ headless: true });
const prefix = "marinara-capability-villages";
try {
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
    place.occupancy = { playerHome: false, residentCharacterId: "mara", homeKind: null };
    place.form = "A converted warehouse";
    place.description = "A home beside the village mill.";
    const state = { condition: "", items: [], features: [], publicFacts: [], traces: [], updatedAt: "" };
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
        state,
      },
      {
        id: "bay",
        name: "Main Bay",
        kind: "shared-residence",
        venueClass: "residence",
        connectedTo: ["exterior", "alcove", "workshop"],
        seen: true,
        description: "An open living area.",
        image: null,
        state,
        accessView: access(false),
      },
      {
        id: "alcove",
        name: "Sleeping Alcove",
        kind: "private-residence",
        venueClass: "residence",
        connectedTo: ["bay"],
        seen: false,
        description: "",
        image: null,
        state,
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
        state,
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
      else if (path.endsWith("/connections"))
        value = { systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" };
      else if (path.endsWith("/locations/venue/image/freeze")) {
        const body = request.postDataJSON();
        place.zones.find((zone) => zone.id === body.zoneId).freezePicture = body.frozen;
      } else if (path.endsWith("/locations/venue/image")) {
        const body = request.postDataJSON();
        const zone = place.zones.find((zone) => zone.id === body.zoneId);
        if (zone)
          zone.image = request.method() === "DELETE" ? null : { ref: "zone:" + zone.id, url: body.image || mapImage };
      } else if (path.endsWith(`/locations/venue/${place.id}`) && request.method() === "PUT") {
        place.name = request.postDataJSON().name;
        if (holdVenueSave) {
          heldVenueSave = route;
          return;
        }
      } else if (/\/venues\/[^/]+\/zones\/[^/]+$/.test(path) && request.method() === "PUT") {
        const zone = place.zones.find((zone) => zone.id === decodeURIComponent(path.split("/").at(-1)));
        zone.name = request.postDataJSON().name;
        if (holdZoneSave) {
          heldZoneSave = route;
          return;
        }
      } else if (path.endsWith("/image/generate")) value = { ...snapshot };
      await fulfill(route, { json: value });
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
    await page.getByRole("main", { name: "Projects" }).getByRole("button", { name: "Close ×", exact: true }).click();
    await page
      .getByRole("navigation", { name: "Village navigation" })
      .getByRole("button", { name: "Map", exact: true })
      .click();
    await page.getByRole("button", { name: "Places", exact: true }).click();
    const profile = page.locator(`.${prefix}-venue-profile`);
    await expect(profile.getByRole("heading", { name: "Warehouse home", exact: true })).toBeVisible();
    const typeLines = await profile
      .getByRole("region", { name: "Basic information" })
      .locator("dd")
      .first()
      .evaluate((entry) => {
        const range = document.createRange();
        range.setStart(entry.firstChild, 0);
        range.setEnd(entry.firstChild, "Converted".length);
        return range.getClientRects().length;
      });
    assert.equal(typeLines, 1, "Venue type words remain readable without splitting across lines");
    const chooseVenue = async (id, name) => {
      if (width < 700) await page.getByRole("combobox", { name: "Venue", exact: true }).selectOption(id);
      else
        await page
          .getByRole("group", { name: "Venues", exact: true })
          .getByRole("button", { name: new RegExp("^" + name) })
          .click();
    };
    await chooseVenue(otherId, "The Harbour");
    await expect(profile.getByRole("heading", { name: "The Harbour", exact: true })).toBeVisible();
    await chooseVenue(place.id, "Warehouse home");
    await expect(profile.getByRole("heading", { name: "Warehouse home", exact: true })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const tabs = profile.getByRole("navigation", { name: "Venue sections" });
    await expect(tabs.getByRole("button", { name: "About", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(profile.getByRole("button", { name: "Visit venue", exact: true })).toBeVisible();
    assert.equal(writes.length, 0);
    await tabs.getByRole("button", { name: "Zones", exact: true }).click();
    const layout = profile.locator(".villages-zone-map");
    await expect(layout.locator("[data-layout-zone]")).toHaveCount(4);
    await expect(layout.locator("svg line")).toHaveCount(3);
    await layout.locator('[data-layout-zone="workshop"]').click();
    await profile.getByLabel("Zone name", { exact: true }).fill("Unsent Zone name");
    page.once("dialog", (dialog) => dialog.dismiss());
    await chooseVenue(otherId, "The Harbour");
    await expect(profile.getByLabel("Zone name", { exact: true })).toHaveValue("Unsent Zone name");
    page.once("dialog", (dialog) => dialog.dismiss());
    await page
      .getByRole("navigation", { name: "Village navigation" })
      .getByRole("button", { name: "People", exact: true })
      .click();
    await expect(profile.getByLabel("Zone name", { exact: true })).toHaveValue("Unsent Zone name");
    page.once("dialog", (dialog) => dialog.accept());
    await page
      .getByRole("navigation", { name: "Village navigation" })
      .getByRole("button", { name: "People", exact: true })
      .click();
    const peopleBook = page.getByRole("dialog", { name: "People", exact: true });
    await expect(peopleBook).toBeVisible();
    await peopleBook.getByRole("button", { name: "Close ×", exact: true }).click();
    await expect(profile.getByRole("heading", { name: "Warehouse home", exact: true })).toBeVisible();
    await expect(profile.getByLabel("Zone name", { exact: true })).toHaveValue("Workshop");
    await layout.locator('[data-layout-zone="exterior"]').click();
    await expect(layout.locator('[data-layout-zone="exterior"]')).toContainText("Entrance");
    await expect(profile.getByText("Exterior", { exact: true })).toHaveCount(0);
    await expect(profile.getByLabel("Zone name", { exact: true })).toHaveCount(0);
    await expect(profile.getByText("Access options", { exact: true })).toHaveCount(0);
    await layout.locator('[data-layout-zone="alcove"]').click();
    const detail = profile.locator(`.${prefix}-venue-zone-details`);
    await expect(detail.getByText("Private", { exact: true })).toBeVisible();
    await expect(detail.getByText("Permission needed", { exact: true })).toBeVisible();
    await expect(detail.getByText("Private details have not been shared with you.")).toHaveCount(0);
    await expect(detail.getByRole("button", { name: "Regenerate artwork" })).toHaveCount(0);
    assert.equal(writes.length, 0, "browsing does not visit, discover or generate");
    place.zones[1].accessView = access(true);
    place.zones[2].accessView = access(true);
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(detail.getByText("Open to you", { exact: true })).toBeVisible();
    await expect(detail.getByText("Permission needed", { exact: true })).toBeVisible();
    await expect(detail.getByText("Private", { exact: true })).toBeVisible();
    await layout.locator('[data-layout-zone="bay"]').click();
    await expect(detail.getByRole("button", { name: "Regenerate artwork" })).toBeVisible();
    await expect(detail.getByLabel("Upload Main Bay artwork")).toHaveCount(1);
    await expect(detail.getByRole("button", { name: "Upload artwork", exact: true })).toBeVisible();
    const freeze = detail.getByRole("checkbox", { name: "Freeze picture", exact: true });
    await expect(freeze).not.toBeChecked();
    await freeze.click();
    await expect(freeze).toBeChecked();
    assert.equal(writes.at(-1).path, "/api/villages/locations/venue/image/freeze");
    assert.deepEqual(writes.at(-1).body, { venueId: place.id, zoneId: "bay", frozen: true });
    const freezeBox = await detail.locator(`.${prefix}-zone-picture-freeze`).boundingBox();
    const headingBox = await detail.getByRole("heading", { name: "Main Bay", exact: true }).boundingBox();
    assert.ok(freezeBox.y + freezeBox.height <= headingBox.y + 1, "freeze is above the Zone heading");
    await freeze.click();
    await expect(freeze).not.toBeChecked();
    if (process.env.VILLAGES_FEEDBACK_SCREENSHOTS) {
      await mkdir(process.env.VILLAGES_FEEDBACK_SCREENSHOTS, { recursive: true });
      await detail.screenshot({
        path: join(process.env.VILLAGES_FEEDBACK_SCREENSHOTS, `zone-picture-freeze-${width}.png`),
      });
    }
    await expect(detail.getByText("Open to you", { exact: true })).toBeVisible();
    await expect(detail.getByText("Permission needed", { exact: true })).toBeVisible();
    await expect(detail.getByText("Private", { exact: true })).toHaveCount(0);
    await detail.getByRole("button", { name: "Regenerate artwork", exact: true }).click();
    await expect(detail.getByRole("button", { name: "Remove artwork", exact: true })).toBeVisible();
    assert.deepEqual(writes.at(-1), {
      path: "/api/villages/locations/venue/image",
      body: { venueId: place.id, spaceClass: "residence", privateOwnerId: "", zoneId: "bay" },
    });
    await detail.getByLabel("Upload Main Bay artwork").setInputFiles({
      name: "zone.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB1cAAAAASUVORK5CYII=",
        "base64",
      ),
    });
    await expect.poll(() => writes.at(-1)?.body.image?.startsWith("data:image/png")).toBe(true);
    assert.equal(writes.at(-1).body.zoneId, "bay");
    await expect(detail.getByRole("button", { name: "Remove artwork", exact: true })).toBeEnabled();
    await detail.getByRole("button", { name: "Remove artwork", exact: true }).click();
    await expect(detail.getByRole("button", { name: "Remove artwork", exact: true })).toHaveCount(0);
    assert.equal(writes.at(-1).body.zoneId, "bay");
    await detail.getByLabel("Zone name", { exact: true }).fill("  ");
    await expect(detail.getByRole("button", { name: "Save zone name", exact: true })).toBeDisabled();
    await detail.getByLabel("Zone name", { exact: true }).fill("Harbour Lounge");
    holdZoneSave = true;
    await detail.getByRole("button", { name: "Save zone name", exact: true }).click();
    await expect.poll(() => !!heldZoneSave).toBe(true);
    await expect(
      page.getByRole("navigation", { name: "Village navigation" }).getByRole("button", { name: "People", exact: true }),
    ).toBeDisabled();
    await expect(tabs.getByRole("button", { name: "About", exact: true })).toBeDisabled();
    if (width < 700) await expect(page.getByRole("combobox", { name: "Venue", exact: true })).toBeDisabled();
    else
      await expect(
        page.getByRole("group", { name: "Venues" }).getByRole("button", { name: /^The Harbour/ }),
      ).toBeDisabled();
    await fulfill(heldZoneSave, { json: snapshot });
    holdZoneSave = false;
    await expect(detail.getByRole("heading", { name: "Harbour Lounge", exact: true })).toBeVisible();
    assert.deepEqual(writes.at(-1), {
      path: `/api/villages/venues/${place.id}/zones/bay`,
      body: { name: "Harbour Lounge" },
    });
    await expect(layout.locator('[data-layout-zone="bay"]')).toContainText("Harbour Lounge");
    await layout.locator('[data-layout-zone="exterior"]').click();
    await expect(detail.getByLabel("Zone name", { exact: true })).toHaveCount(0);
    await layout.locator('[data-layout-zone="bay"]').click();
    await expect(detail.getByLabel("Zone name", { exact: true })).toHaveValue("Harbour Lounge");
    await tabs.getByRole("button", { name: "Manage", exact: true }).click();
    await expect(profile.getByRole("heading", { name: "Assigned Villagers", exact: true })).toBeVisible();
    await expect(profile.getByRole("button", { name: "View housing requests" })).toBeVisible();
    await expect(profile.getByLabel("Physical form", { exact: true })).toHaveCount(0);
    await expect(profile.getByRole("button", { name: "Regenerate artwork" })).toHaveCount(0);
    const beforeName = writes.length;
    await profile.getByLabel("Venue name", { exact: true }).fill("Renamed warehouse");
    page.once("dialog", (dialog) => dialog.dismiss());
    await chooseVenue(otherId, "The Harbour");
    await expect(profile.getByLabel("Venue name", { exact: true })).toHaveValue("Renamed warehouse");
    if (width < 700) await expect(page.getByRole("combobox", { name: "Venue", exact: true })).toHaveValue(place.id);
    page.once("dialog", (dialog) => dialog.dismiss());
    await profile.getByRole("button", { name: "Plan a renovation →", exact: true }).click();
    await expect(profile.getByLabel("Venue name", { exact: true })).toHaveValue("Renamed warehouse");
    page.once("dialog", (dialog) => dialog.dismiss());
    await profile.getByRole("button", { name: "View housing requests", exact: true }).click();
    await expect(profile.getByLabel("Venue name", { exact: true })).toHaveValue("Renamed warehouse");
    holdVenueSave = true;
    await profile.getByRole("button", { name: "Save name", exact: true }).click();
    await expect.poll(() => !!heldVenueSave).toBe(true);
    await expect(
      page.getByRole("navigation", { name: "Village navigation" }).getByRole("button", { name: "Map", exact: true }),
    ).toBeDisabled();
    await expect(profile.getByRole("button", { name: "Plan a renovation →", exact: true })).toBeDisabled();
    await fulfill(heldVenueSave, { json: snapshot });
    holdVenueSave = false;
    await expect(profile.getByRole("heading", { name: "Renamed warehouse", exact: true })).toBeVisible();
    assert.deepEqual(writes.at(-1), {
      path: `/api/villages/locations/venue/${place.id}`,
      body: { name: "Renamed warehouse" },
    });
    await profile.getByRole("button", { name: "Plan a renovation →", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Renovation", exact: true })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Venue", exact: true })).toHaveValue(place.id);
    assert.equal(writes.length, beforeName + 1, "planning does not submit a Project");
    await page.getByRole("button", { name: /^Close/, exact: false }).click();
    await page
      .getByRole("navigation", { name: "Village navigation" })
      .getByRole("button", { name: "Map", exact: true })
      .click();
    await page.getByRole("button", { name: "Places", exact: true }).click();
    await tabs.getByRole("button", { name: "Manage", exact: true }).click();
    await profile.getByRole("button", { name: "View housing requests", exact: true }).click();
    await expect(page.getByText("Housing requests · Renamed warehouse", { exact: true })).toBeVisible();
    await expect(page.locator('[data-villager-request="residence:mara"]')).toBeVisible();
    await expect(page.locator('[data-villager-request="residence:eli"]')).toHaveCount(0);
    if (width === 1366) {
      await page
        .getByRole("navigation", { name: "Village navigation" })
        .getByRole("button", { name: "People", exact: true })
        .click();
      await page.getByRole("button", { name: "Open Mara profile", exact: true }).click();
      const person = page.getByRole("region", { name: "Mara profile", exact: true });
      await person
        .getByRole("navigation", { name: "Villager profile sections" })
        .getByRole("button", { name: "Venues", exact: true })
        .click();
      await person.getByRole("button", { name: /Projects Open Projects/ }).click();
      await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
      await page.getByRole("button", { name: /^Close/ }).click();
      await page.getByRole("button", { name: "People", exact: true }).click();
      await page.getByRole("button", { name: "Open Mara profile", exact: true }).click();
      await person
        .getByRole("navigation", { name: "Villager profile sections" })
        .getByRole("button", { name: "Venues", exact: true })
        .click();
      await person.getByRole("button", { name: /Venue Requests Open Venue Requests/ }).click();
      await expect(page.getByRole("button", { name: "Show all requests", exact: true })).toHaveCount(0);
      await expect(page.getByRole("main").locator('[data-villager-request="residence:eli"]')).toBeVisible();
      await page
        .getByRole("navigation", { name: "Village navigation" })
        .getByRole("button", { name: "Places", exact: true })
        .click();
      await tabs.getByRole("button", { name: "Manage", exact: true }).click();
      await profile.getByRole("button", { name: "View housing requests", exact: true }).click();
    }
    await page.getByRole("button", { name: "View Venue", exact: true }).click();
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
      .getByRole("button", { name: "More", exact: true })
      .click();
    if (width <= 700) await page.getByRole("combobox", { name: "Section" }).selectOption("village");
    else await page.getByRole("button", { name: "World Configuration", exact: true }).click();
    await expect(page.getByRole("button", { name: "Edit", exact: true })).toHaveCount(0);
    await page
      .getByRole("navigation", { name: "Village navigation" })
      .getByRole("button", { name: "Places", exact: true })
      .click();
    await expect(profile).toBeVisible();
    await expect(tabs.getByRole("button", { name: "About", exact: true })).toHaveAttribute("aria-pressed", "true");
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
    await page.getByRole("main", { name: "Projects" }).getByRole("button", { name: "Close ×", exact: true }).click();
    await page.getByRole("button", { name: "Back to Scene", exact: true }).click();
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
} finally {
  await browser.close();
}
