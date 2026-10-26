import assert from "node:assert/strict";
import { tsImport } from "tsx/esm/api";
const { readBaseVenueLayout, validateLayoutZones } = await tsImport(
  "../packages/villages/src/server/domain/rules/venue-layout.ts",
  import.meta.url,
);
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect, mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import { openProjectPage, currentProject, projectSnapshot } from "./fixtures/villages-project-browser.fixture.mjs";
import { mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";
const output = process.env.VILLAGES_VISUAL_OUTPUT;
if (output) await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
async function checkMapPlacement(width, activeScene = false) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width < 700 });
  await mockEngineLookups(page);
  const snapshot = projectSnapshot();
  delete snapshot.projects[0].venueDraft.position;
  const placements = [];
  let heldPlacement;
  const session = activeScene
    ? {
        id: "project-scene",
        version: 2,
        sceneRevision: 0,
        placeId: "mill",
        placeName: "The Mill",
        zoneId: "exterior",
        area: "public",
        status: "active",
        activeIds: [],
        participants: [],
        lines: [],
        submissions: [],
        startedAt: snapshot.village.instant,
        lastActivityAt: snapshot.village.instant,
        endedAt: "",
      }
    : null;
  if (session) {
    snapshot.foundingPreparation = { status: "ready" };
    snapshot.sceneVenue = { sceneId: session.id, venue: structuredClone(snapshot.settings.venues[0]) };
    snapshot.sceneVenue.venue.zones[1].name = "Captured workshop";
    snapshot.opening = {
      id: "opening",
      version: 2,
      stage: "project",
      projectId: "canvas",
      communityVenueId: "mill",
      residentIds: ["mara"],
      heardIds: ["mara"],
      declinedIds: [],
      gatheringSceneId: "",
      action: "Choose the design, agreements and lead",
      outcome: "",
      proposals: [],
    };
  }
  const originalSession = structuredClone(session);
  const originalVenue = structuredClone(snapshot.sceneVenue);
  await page.route("**/api/villages**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    assert(!(route.request().method() !== "GET" && /\/rooms(?:\/|$)/.test(path)), "placement never mutates the Scene");
    let value = snapshot;
    if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) value = { session };
    else if (path.endsWith("/town-map")) value = { image: mapImage };
    else if (path.endsWith("/projects/canvas/place")) {
      const body = route.request().postDataJSON();
      placements.push(body);
      assert.equal(body.expectedRevision, snapshot.projects[0].lifecycle.revision);
      assert(body.requestId);
      snapshot.projects[0].venueDraft.position = { x: body.x, y: body.y };
      snapshot.projects[0].lifecycle.revision++;
      snapshot.settings.venues[0].zones[1].name = "Changed live workshop";
      if (activeScene) {
        heldPlacement = route;
        return;
      }
    }
    await fulfill(route, { json: value });
  });
  await page.route("http://project-placement.test/", (route) =>
    fulfill(route, {
      contentType: "text/html",
      body: "<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}html,body{margin:0;width:100%;height:100%;font-family:Arial}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
    }),
  );
  await page.goto("http://project-placement.test/");
  await page.addScriptTag({ path: resolve("packages/villages/client.js") });
  const openSite = async () => {
    await expect(page.getByRole("main", { name: "Projects" })).toBeVisible();
    const projects = page.getByRole("navigation", { name: "Projects", exact: true });
    if (await projects.isVisible()) await projects.getByRole("button", { name: /Canvas Tent/ }).click();
    await page.getByRole("tab", { name: "Location", exact: true }).click();
  };
  if (activeScene) {
    await expect(
      page.getByRole("button", { name: "Choose the design, agreements and lead", exact: true }),
    ).toBeVisible();
    const composer = page.getByRole("textbox", { name: "Message at The Mill", exact: true });
    await composer.fill("An unsent Scene draft.");
    await composer.evaluate((node) => {
      window.retainedComposer = node;
    });
    await page.getByRole("button", { name: "Venue actions", exact: true }).click();
    await page.getByRole("menuitem", { name: "Projects", exact: true }).click();
  } else {
    await page.getByRole("button", { name: /^(Open settings menu|More)$/ }).click();
    await page.getByRole("button", { name: /^Projects \(/ }).click();
  }
  await openSite();
  await page.getByRole("button", { name: "Choose map position", exact: true }).click();
  await expect(page.getByRole("button", { name: "Cancel placement", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cancel placement", exact: true }).click();
  await openSite();
  assert.equal(placements.length, 0, "cancelling returns to the Project without saving a position");
  if (activeScene) {
    await page.getByRole("button", { name: "Return to Scene", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Message at The Mill", exact: true })).toHaveValue(
      "An unsent Scene draft.",
    );
    await page.getByRole("button", { name: "Venue actions", exact: true }).click();
    await page.getByRole("menuitem", { name: "Projects", exact: true }).click();
    await openSite();
  }
  await page.getByRole("button", { name: "Choose map position", exact: true }).click();
  const canvas = page.getByRole("group", { name: "Map navigation" });
  await expect(canvas).toHaveAttribute("data-placing", "true");
  await expect(page.getByRole("button", { name: "Choose the design, agreements and lead", exact: true })).toHaveCount(
    0,
  );
  const art = canvas.locator("img").first();
  await expect(art).toHaveJSProperty("naturalWidth", 1500);
  await expect(page.locator(".marinara-capability-villages-stage")).toHaveAttribute("data-picture-width", /[1-9]/);
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
  await expect(page.locator('.marinara-capability-villages-stage [data-kind="person"]')).toHaveCount(0);
  if (output)
    await page.screenshot({ path: resolve(output, "projects-map-placement-" + width + ".png"), fullPage: true });
  const box = await canvas.boundingBox();
  const point = { x: box.x + box.width * 0.2, y: box.y + box.height * 0.75 };
  if (width < 700) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
  if (activeScene) {
    await expect.poll(() => !!heldPlacement).toBe(true);
    await expect(page.getByRole("button", { name: "Cancel placement", exact: true })).toBeDisabled();
    await page.mouse.click(point.x, point.y);
    assert.equal(placements.length, 1, "a pending placement cannot admit a second map click");
    await fulfill(heldPlacement, { json: snapshot });
  }
  await expect(page.getByRole("main", { name: "Projects" })).toBeVisible();
  assert.equal(placements.length, 1, "a map click or tap places the Project exactly once");
  assert(placements[0].x >= 0.03 && placements[0].x <= 0.97);
  assert(placements[0].y >= 0.03 && placements[0].y <= 0.97);
  await page.getByRole("tab", { name: "Location", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Marked on the village map");
  await expect(page.getByRole("button", { name: "Change map position", exact: true })).toBeEnabled();
  if (output) await page.screenshot({ path: resolve(output, "projects-placed-" + width + ".png"), fullPage: true });
  if (activeScene) {
    await page.getByRole("button", { name: "Return to Scene", exact: true }).click();
    const composer = page.getByRole("textbox", { name: "Message at The Mill", exact: true });
    await expect(composer).toHaveValue("An unsent Scene draft.");
    assert(await composer.evaluate((node) => node === window.retainedComposer), "the original Scene stays mounted");
    await page.getByRole("button", { name: "Mode: Say / Do. Choose mode" }).click();
    await page.getByRole("menuitemradio", { name: "Move", exact: true }).click();
    await expect(page.getByRole("combobox", { name: "Move to Zone" }).locator('option[value="work"]')).toHaveText(
      "Captured workshop",
    );
  }
  assert.deepEqual(session, originalSession, "placement and cancellation preserve the Scene's captured state");
  assert.deepEqual(snapshot.sceneVenue, originalVenue);
  await page.close();
}
try {
  for (const width of [1280, 390]) {
    await checkMapPlacement(width);
    await checkMapPlacement(width, true);
    const f = await openProjectPage(browser, width, undefined, async (path, body, snapshot) => {
      if (path === "/projects") {
        const project = currentProject("created");
        project.title = body.name;
        project.venueDraft.name = body.name;
        project.venueDraft.classes = body.classes;
        project.venueDraft.description = body.description;
        project.plan = null;
        project.lifecycle.builderId = "";
        project.lifecycle.candidates = [];
        snapshot.projects.push(project);
        return;
      }
      const [, id, action] = path.split("/").slice(1),
        project = snapshot.projects.find((p) => p.id === id);
      assert(project);
      assert(body.requestId);
      assert.equal(body.expectedRevision, project.lifecycle.revision);
      if (action === "plan") {
        project.plan = body;
        project.venueDraft.classes = body.classes;
        project.lifecycle.revision++;
      }
      if (action === "revise") {
        project.lifecycle.change = body;
        project.lifecycle.revision++;
      }
      if (action === "start") {
        project.status = project.lifecycle.phase = "working";
        project.venueId = "built";
        project.lifecycle.workOrder = {
          startsAt: "2026-10-23T12:00:00Z",
          completesAt: "2026-10-24T12:00:00Z",
          remainingMs: 86400000,
          pausedAt: "",
        };
      }
      if (action === "cancel") project.status = project.lifecycle.phase = "cancelled";
    });
    const { page } = f;
    const screenshot = async (name) => {
      if (output)
        await page.screenshot({ path: resolve(output, "projects-" + name + "-" + width + ".png"), fullPage: true });
    };
    const select = async (name) =>
      page.getByRole("navigation", { name: "Projects", exact: true }).getByRole("button", { name }).click();
    const back = async () => page.getByRole("button", { name: "‹ All Projects", exact: true }).click();
    await screenshot("index");
    await select(/Canvas Tent/);
    await expect(page.getByRole("button", { name: "Start · 24 hours", exact: true })).toBeEnabled();
    await page.getByRole("tab", { name: "Design & Spaces", exact: true }).click();
    await page.getByRole("tab", { name: "Design & Spaces", exact: true }).hover();
    const selectedContrast = await page
      .getByRole("tab", { name: "Design & Spaces", exact: true })
      .evaluate((element) => {
        const style = getComputedStyle(element);
        const luminance = (color) =>
          color
            .match(/[0-9.]+/g)
            .slice(0, 3)
            .map(Number)
            .map((channel) => {
              const value = channel / 255;
              return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
            })
            .reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
        const a = luminance(style.color),
          b = luminance(style.backgroundColor);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
    assert(selectedContrast >= 4.5, "a hovered selected tab retains readable contrast");
    await page.getByLabel("Physical design", { exact: true }).fill("An edited pavilion");
    await expect(page.getByRole("button", { name: "Start · 24 hours", exact: true })).toBeDisabled();
    await page.getByRole("tab", { name: "Location", exact: true }).click();
    await expect(page.getByRole("button", { name: "Change map position", exact: true })).toBeDisabled();
    await expect(page.getByRole("tabpanel")).toContainText("Save design to choose a map position.");
    await page.getByRole("tab", { name: "Design & Spaces", exact: true }).click();
    // Keyboard navigation changes tabs, never the design or server.
    await page.getByRole("tab", { name: "Design & Spaces", exact: true }).press("ArrowRight");
    await expect(page.getByRole("tab", { name: "People", exact: true })).toBeFocused();
    await page.getByRole("tab", { name: "Design & Spaces", exact: true }).click();
    await page.getByRole("button", { name: "Zones", exact: true }).click();
    await page
      .getByRole("navigation", { name: "Project Zones" })
      .getByRole("button", { name: /Art room/ })
      .click();
    await page.getByLabel("Zone Used For", { exact: true }).fill("Painting");
    await screenshot("zones");
    await page.getByRole("tab", { name: "People", exact: true }).click();
    await expect(
      page.getByRole("group", { name: "Willing leads" }).getByRole("button", { name: /Mara/ }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("group", { name: "Willing leads" }).getByRole("button")).toHaveCount(1);
    await screenshot("people");
    await back();
    await select(/Workshop/);
    await page.getByRole("tab", { name: "Design & Spaces", exact: true }).click();
    await expect(
      page.getByRole("group", { name: "Classes", exact: true }).getByRole("button", { name: "Community", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.getByLabel("Physical design", { exact: true }).fill("A revised workshop");
    await back();
    await select(/Canvas Tent/);
    await page.getByRole("tab", { name: "Design & Spaces", exact: true }).click();
    await page.getByRole("button", { name: "Design", exact: true }).click();
    await expect(page.getByLabel("Physical design", { exact: true })).toHaveValue("An edited pavilion");
    await page.getByRole("button", { name: "Save design", exact: true }).click();
    await expect(page.getByRole("button", { name: "Start · 24 hours", exact: true })).toBeEnabled();
    assert.equal(f.calls.length, 1, "editing, saving and navigation never start work");
    assert.equal(f.calls[0].body.expectedRevision, 1);
    assert.equal(f.calls[0].body.spaces[0].purpose, "Painting");
    await screenshot("design");
    await page.getByRole("tab", { name: "Overview & Progress", exact: true }).click();
    await expect(page.getByRole("tabpanel")).toContainText("An edited pavilion");
    await expect(page.getByRole("tabpanel")).not.toContainText("A shared art pavilion.");
    await page.getByRole("button", { name: "Start · 24 hours", exact: true }).click();
    await expect(page.locator("time")).toHaveAttribute("datetime", "2026-10-24T12:00:00Z");
    await page.getByRole("tab", { name: "Design & Spaces", exact: true }).click();
    await expect(page.getByLabel("Physical design", { exact: true })).toHaveCount(0);
    await page.getByRole("tab", { name: "Overview & Progress", exact: true }).click();
    await page.getByRole("button", { name: "Cancel Project", exact: true }).click();
    await back();
    await page.getByRole("button", { name: "History", exact: true }).click();
    await expect(
      page
        .getByRole("navigation", { name: "Project history", exact: true })
        .getByRole("button", { name: /Canvas Tent.*Cancelled/ }),
    ).toBeVisible();
    await page.getByRole("button", { name: "‹ Projects", exact: true }).click();
    await select(/Workshop/);
    await expect(page.getByLabel("Physical design", { exact: true })).toHaveValue("A revised workshop");
    await page.getByRole("button", { name: "Save design", exact: true }).click();
    assert.deepEqual(
      f.calls.at(-1).body.classes,
      ["community", "workplace"],
      "saved Classes do not reset to the live target",
    );
    // All sections fit on desktop and phone, with a single visible section.
    for (const name of ["Overview & Progress", "Design & Spaces", "People", "Location"]) {
      await page.getByRole("tab", { name, exact: true }).click();
      const box = await page.getByRole("main", { name: "Projects" }).boundingBox();
      assert(box && box.x >= 0 && box.x + box.width <= width + 1, name + " stays within the viewport");
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        name + " does not overflow",
      );
    }
    await back();
    await page.getByRole("button", { name: "New Venue", exact: true }).click();
    await page.getByLabel("Name", { exact: true }).fill("New Garden");
    await page.getByLabel("Physical design", { exact: true }).fill("A shared garden.");
    await page
      .getByRole("group", { name: "Classes", exact: true })
      .getByRole("button", { name: "Workplace", exact: true })
      .click();
    await page.getByRole("button", { name: "Create draft", exact: true }).click();
    await expect(page.getByRole("heading", { name: "New Garden", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start · 24 hours", exact: true })).toBeDisabled();
    assert.deepEqual(f.calls.find((call) => call.path === "/projects").body.classes, ["community", "workplace"]);
    await page.getByRole("tab", { name: "Design & Spaces", exact: true }).click();
    await expect(page.getByLabel("Physical design", { exact: true })).toHaveValue("A shared garden.");
    const longDesign = "A shared garden with sheltered work tables, winding paths and open planting beds. ".repeat(24);
    await page.getByLabel("Physical design", { exact: true }).fill(longDesign);
    await page.getByRole("button", { name: "Zones", exact: true }).click();
    if (width < 700)
      await page
        .getByRole("navigation", { name: "Project Zones" })
        .getByRole("button", { name: /Entrance/ })
        .click();
    await expect(page.getByLabel("Entrance", { exact: true }).first()).toHaveValue("");
    await page.getByLabel("Entrance", { exact: true }).first().fill("A narrow gate beside the old oak.");
    await page.getByRole("tab", { name: "Design & Spaces", exact: true }).click();
    await expect(page.getByLabel("Entrance", { exact: true }).first()).toHaveValue("A narrow gate beside the old oak.");
    await page.getByRole("tab", { name: "Overview & Progress", exact: true }).click();
    await expect(page.getByRole("tabpanel")).toContainText(longDesign.trim());
    await page.getByRole("button", { name: "Save design", exact: true }).click();
    await expect.poll(() => f.calls.at(-1)?.path).toBe("/projects/created/plan");
    assert.equal(f.calls.at(-1).body.form, longDesign);
    assert.equal(f.calls.at(-1).body.exteriorDescription, "A narrow gate beside the old oak.");
    const reopened = await openProjectPage(browser, width, structuredClone(f.snapshot));
    await reopened.page
      .getByRole("navigation", { name: "Projects", exact: true })
      .getByRole("button", { name: /New Garden/ })
      .click();
    await expect(reopened.page.getByRole("tabpanel")).toContainText(longDesign.trim());
    await reopened.page.getByRole("tab", { name: "Design & Spaces", exact: true }).click();
    await expect(reopened.page.getByLabel("Physical design", { exact: true })).toHaveValue(longDesign);
    await reopened.page.getByRole("button", { name: "Zones", exact: true }).click();
    if (width < 700)
      await reopened.page
        .getByRole("navigation", { name: "Project Zones" })
        .getByRole("button", { name: /Entrance/ })
        .click();
    await expect(reopened.page.getByLabel("Entrance", { exact: true }).first()).toHaveValue(
      "A narrow gate beside the old oak.",
    );
    await reopened.page.close();
    await page.close();

    // Six-Zone admission and private specifications are authored through the same selected-space editor.
    const data = projectSnapshot();
    data.projects[0].plan.spaces = Array.from({ length: 6 }, (_, i) => ({
      ...data.projects[0].plan.spaces[0],
      id: "art-" + i,
      name: "Art " + i,
    }));
    const limit = await openProjectPage(browser, width, data);
    await limit.page
      .getByRole("navigation", { name: "Projects", exact: true })
      .getByRole("button", { name: /Canvas Tent/ })
      .click();
    await limit.page.getByRole("tab", { name: "Design & Spaces", exact: true }).click();
    await limit.page.getByRole("button", { name: "Zones", exact: true }).click();
    await expect(limit.page.getByRole("button", { name: "Add Zone", exact: true })).toBeDisabled();
    await expect(limit.page.getByRole("button", { name: "Add private Zone", exact: true })).toBeDisabled();
    await limit.page.getByRole("navigation", { name: "Project Zones" }).getByRole("button", { name: /Art 0/ }).click();
    await limit.page.getByRole("button", { name: "Remove Zone", exact: true }).click();
    await limit.page.getByRole("button", { name: "Add private Zone", exact: true }).click();
    await limit.page.getByLabel("Zone Name", { exact: true }).fill("Quiet room");
    await limit.page.getByLabel("Room Specification", { exact: true }).fill("A quiet canvas alcove.");
    await expect(limit.page.getByLabel("Zone Appearance", { exact: true })).toHaveCount(0);
    await limit.page.getByRole("button", { name: "Save design", exact: true }).click();
    await expect.poll(() => limit.calls.length).toBe(1);
    assert.equal(limit.calls[0].body.spaces.length, 5);
    assert.equal(limit.calls[0].body.privateSpaces[0].roomSpecification, "A quiet canvas alcove.");
    assert.deepEqual(limit.calls[0].body.privateSpaces[0].connectedTo, ["exterior"]);
    const payload = limit.calls[0].body;
    const decoded = readBaseVenueLayout(
      { ...payload, description: payload.exteriorDescription },
      payload.classes,
      "",
      () => null,
    );
    assert.equal(decoded.length, 7, "the actual production decoder admits the authored six-Zone design");
    assert.equal(decoded.at(-1).access.mode, "permission-required");
    await limit.page.close();
    const restricted = await openProjectPage(browser, width);
    await restricted.page
      .getByRole("navigation", { name: "Projects", exact: true })
      .getByRole("button", { name: /Workshop/ })
      .click();
    await restricted.page.getByRole("tab", { name: "Design & Spaces", exact: true }).click();
    await restricted.page.getByRole("button", { name: "Zones", exact: true }).click();
    await restricted.page.getByRole("button", { name: "Add private Zone", exact: true }).click();
    await restricted.page.getByLabel("Zone Name", { exact: true }).fill("Archive");
    await restricted.page.getByLabel("Room Specification", { exact: true }).fill("Shelves and a reading desk.");
    if (width < 700) await restricted.page.getByRole("button", { name: "Options", exact: true }).click();
    await restricted.page
      .getByRole("group", { name: "Zone controllers" })
      .getByRole("button", { name: "You", exact: true })
      .click();
    await restricted.page.getByRole("button", { name: "Save design", exact: true }).click();
    await expect.poll(() => restricted.calls.length).toBe(1);
    const terms = restricted.calls[0].body;
    validateLayoutZones(restricted.snapshot.settings.venues[0], terms.zones, terms.classes, {
      villagers: restricted.snapshot.villagers,
    });
    assert.deepEqual(terms.zones.at(-1).controllerIds, ["player"], "new restricted authority is an explicit choice");
    await restricted.page.close();

    const changed = await openProjectPage(browser, width);
    await changed.page
      .getByRole("navigation", { name: "Projects", exact: true })
      .getByRole("button", { name: /Canvas Tent/ })
      .click();
    await changed.page.getByRole("tab", { name: "Design & Spaces", exact: true }).click();
    await changed.page.getByLabel("Physical design", { exact: true }).fill("Local edit");
    changed.snapshot.projects[0].plan.form = "A design saved elsewhere";
    changed.snapshot.projects[0].lifecycle.revision++;
    await changed.update();
    await expect(changed.page.getByRole("button", { name: "Save design", exact: true })).toBeDisabled();
    await expect(changed.page.getByLabel("Physical design", { exact: true })).toHaveValue("Local edit");
    await changed.page.getByRole("button", { name: "Discard edits", exact: true }).click();
    await expect(changed.page.getByLabel("Physical design", { exact: true })).toHaveValue("A design saved elsewhere");
    assert.equal(changed.calls.length, 0, "a stale local draft cannot overwrite a newer revision");
    await changed.page.getByLabel("Physical design", { exact: true }).fill("Another local edit");
    changed.snapshot.projects[0].status = changed.snapshot.projects[0].lifecycle.phase = "paused";
    changed.snapshot.projects[0].lifecycle.workOrder = {
      remainingMs: 60000,
      startsAt: "",
      completesAt: "",
      pausedAt: "",
    };
    await changed.update();
    await expect(changed.page.getByRole("button", { name: "Resume", exact: true })).toBeDisabled();
    await changed.page.getByRole("button", { name: "Discard edits", exact: true }).click();
    await expect(changed.page.getByRole("button", { name: "Resume", exact: true })).toBeEnabled();
    await expect(changed.page.getByLabel("Physical design", { exact: true })).toHaveCount(0);
    await changed.page.close();
  }
  console.log(
    "Blueprint Projects on desktop/phone: tabs, keyboard access, retained edits, explicit Start, deadline, cancellation, two Classes, six Zones and private specifications passed.",
  );
} finally {
  await browser.close();
}
