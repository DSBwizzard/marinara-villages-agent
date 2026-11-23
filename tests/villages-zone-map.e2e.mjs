// Test cases: zones/map/editor, zones/map/move
import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { createVenueScreenHarness } from "./fixtures/villages-venue-screen-lifetime.fixture.mjs";
import { snapshot as fixture, now, venueSnapshotFixture } from "./fixtures/villages-scene-browser.fixture.mjs";
import { scenePlaybackFixtures } from "./fixtures/scene-browser.fixture.mjs";
import { fulfill, mockEngineLookups } from "./fixtures/browser-diagnostics.mjs";
const { authorSceneResponse } = await scenePlaybackFixtures();

const styles = await build({
  stdin: {
    contents: `import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';
import {DESK_STYLES} from './packages/villages/src/client/shared/desk-styles.js';
syncVillagesStyles();const tag=document.createElement('style');tag.textContent=DESK_STYLES;document.head.append(tag);`,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
});
const browser = await chromium.launch({ headless: true });
const node = (map, id) => map.locator(`[data-layout-zone=${JSON.stringify(id)}]`);
async function assertNoOverlap(map) {
  const boxes = await map
    .locator("[data-layout-zone]")
    .evaluateAll((nodes) => nodes.map((n) => ({ id: n.dataset.layoutZone, rect: n.getBoundingClientRect().toJSON() })));
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i].rect,
        b = boxes[j].rect;
      assert.ok(
        a.right <= b.left + 0.1 || b.right <= a.left + 0.1 || a.bottom <= b.top + 0.1 || b.bottom <= a.top + 0.1,
        `${boxes[i].id} overlaps ${boxes[j].id}`,
      );
    }
}
await withBrowser(browser, async () => {
  await runCase("zones/map/editor", async () => {
    const mount = await createVenueScreenHarness(browser);
    const f = await mount(false, 1366, {
      page: "view",
      zone: "exterior",
      cleanName: true,
      prepareSeed(seed) {
        const place = seed.settings.venues[0],
          sample = place.zones[0];
        place.zones = Array.from({ length: 7 }, (_, i) => ({
          ...structuredClone(sample),
          id: i ? `zone:${i}` : "exterior",
          name: i ? `Room ${i}` : "Entrance",
          kind: i ? "public" : "exterior",
          connectedTo: i ? ["exterior"] : Array.from({ length: 6 }, (_, j) => `zone:${j + 1}`),
        }));
      },
    });
    await f.page.evaluate(() => {
      const tag = document.createElement("marinara-capability-villages");
      tag.className = "marinara-capability-villages-desk-container";
      document.body.append(tag);
      tag.append(document.getElementById("root"));
    });
    await f.page.addStyleTag({
      content:
        "#state{display:none} :root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}body{margin:0}",
    });
    await f.page.addScriptTag({ content: styles.outputFiles[0].text });
    await f.page.getByRole("button", { name: "Manage", exact: true }).click();
    await f.page.getByRole("button", { name: "Zone connections", exact: true }).click();
    const map = f.page.locator(".villages-zone-map");
    const save = f.page.getByRole("button", { name: "Save layout", exact: true });
    await expect(map.locator("[data-layout-zone]")).toHaveCount(7);
    await node(map, "exterior").press("ArrowRight");
    const entrance = await node(map, "exterior").boundingBox();
    const canvas = await map.locator(".villages-zone-map-canvas").boundingBox();
    await f.page.mouse.move(entrance.x + entrance.width / 2, entrance.y + entrance.height / 2);
    await f.page.mouse.down();
    await f.page.mouse.move(entrance.x + entrance.width / 2 + canvas.width * 0.05, entrance.y + entrance.height / 2, {
      steps: 5,
    });
    await f.page.mouse.up();
    await node(map, "zone:1").click();
    await f.page.getByRole("checkbox", { name: "Room 2", exact: true }).check();
    assert.equal(f.requests.length, 0, "seven-tile draft is local");
    await save.click();
    await expect.poll(() => f.requests.length).toBe(1);
    const body = f.requests[0].body;
    assert.ok(body.positions.exterior.x > 1, "Dragging persists the new arrangement together with the keyboard nudge");
    assert.equal(body.connections.length, 7);
    assert.ok(body.connections.find((z) => z.id === "zone:1").connectedTo.includes("zone:2"));
    assert.ok(body.connections.find((z) => z.id === "zone:2").connectedTo.includes("zone:1"));
    assert.ok(!JSON.stringify(body).includes("description"));
    f.seed.settings.venues[0].zoneLayout = body.positions;
    f.seed.settings.venues[0].zones.forEach(
      (zone) => (zone.connectedTo = body.connections.find((row) => row.id === zone.id).connectedTo),
    );
    await f.reply(0);
    await expect(f.page.getByText("Saving layout…", { exact: true })).toHaveCount(0);
    await node(map, "exterior").click();
    await f.page.getByRole("checkbox", { name: "Room 3", exact: true }).uncheck();
    await expect(map.locator("svg :is(line, polyline)")).toHaveCount(6);
    await expect(f.page.getByRole("alert")).toContainText("Unreachable Zones");
    await expect(save).toBeDisabled();
    assert.equal(f.requests.length, 1);
    await f.run("discard");
    await expect(map.locator("svg :is(line, polyline)")).toHaveCount(7);
    for (const width of [1366, 736, 390, 320]) {
      await f.page.setViewportSize({ width, height: 1000 });
      await assertNoOverlap(map);
      const metrics = await map.locator("[data-layout-zone]").evaluateAll((nodes) =>
        nodes.map((node) => ({
          width: node.getBoundingClientRect().width,
          height: node.getBoundingClientRect().height,
        })),
      );
      assert.ok(
        metrics.every((tile) => tile.width >= 44 && tile.height >= 44),
        "Visible nodes retain full-size touch targets",
      );
      assert.equal(f.requests.length, 1, "Resizing visual nodes never rewrites saved coordinates");
    }
    await f.page.evaluate(() => window.h.scene(true));
    await expect(f.page.getByText("End the Scene to edit the layout.", { exact: true })).toBeVisible();
    const layoutBefore = await node(map, "exterior").getAttribute("style");
    await node(map, "exterior").press("ArrowRight");
    assert.equal(await node(map, "exterior").getAttribute("style"), layoutBefore);
    await expect(save).toBeDisabled();
    assert.equal(f.requests.length, 1, "Active Scenes leave the saved arrangement unchanged");
    await f.finish();
  });
  await runCase("zones/map/move", async () => {
    const bundle = await build({
      stdin: {
        loader: "tsx",
        resolveDir: process.cwd(),
        contents: `
import {installFeature} from './tests/fixtures/feature-root.js';
import {SceneScreen} from './packages/villages/src/client/features/scenes/SceneScreen.js';
installFeature(controller=><SceneScreen controller={controller}/>);
`,
      },
      bundle: true,
      write: false,
      format: "iife",
      platform: "browser",
      jsx: "automatic",
    });
    for (const width of [1366, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await mockEngineLookups(page);
      const snapshot = structuredClone(fixture);
      const night = width !== 390;
      snapshot.village.instant = night ? "2026-11-19T22:00:00Z" : "2026-11-19T12:00:00Z";
      snapshot.village.timeZone = "UTC";
      let scene = {
        id: "move-map",
        version: 2,
        sceneRevision: 1,
        placeId: "mill",
        placeName: "Airfield",
        zoneId: "exterior",
        area: "outside",
        status: "active",
        activeIds: ["mara"],
        participants: [{ characterId: "mara", name: "Mara", doing: "Waiting" }],
        submissions: [],
        lines: [
          {
            id: "old-main",
            kind: "narration",
            role: "assistant",
            speakerId: "__venue_scene__",
            name: "Narration",
            content: "Mara glances toward the Garden.",
            at: now,
          },
          {
            id: "old-aside",
            kind: "side",
            role: "assistant",
            speakerId: "mara",
            name: "Mara",
            content: "I will sneak along with you.",
            presentation: "aside",
            asideFor: "old-main",
            at: now,
          },
        ],
        startedAt: now,
        endedAt: "",
        capturedContext: true,
      };
      const venue = venueSnapshotFixture({
        ...snapshot.settings.venues[0],
        zones: [
          { id: "exterior", name: "Entrance", kind: "exterior", connectedTo: ["walkway", "airstrip"] },
          { id: "walkway", name: "Walkway", kind: "public", connectedTo: ["exterior", "garden"] },
          { id: "garden", name: "Garden", kind: "public", connectedTo: ["walkway"] },
          { id: "airstrip", name: "Airstrip", kind: "restricted", connectedTo: ["exterior", "hangar"] },
          { id: "hangar", name: "Hangar", kind: "restricted", connectedTo: ["airstrip"] },
        ],
      });
      for (const zone of venue.zones) {
        const allowed = ["exterior", "walkway", "garden"].includes(zone.id);
        zone.accessView = {
          decision: {
            allowed,
            available: true,
            mode: allowed ? "public" : "permission-required",
            reason: allowed ? "public" : "permission-required",
            explanation: "Fixture",
            canManage: false,
            canInvite: false,
          },
          reachable: allowed,
          canTrespass: zone.id === "airstrip",
          ...(zone.id === "hangar" ? { accessNeededVia: "airstrip" } : {}),
        };
      }
      venue.zones.find((z) => z.id === "garden").image = { id: "known-day", url: "http://move-map.test/known-day.svg" };
      venue.zones.find((z) => z.id === "garden").accessView.companions = [
        { id: "mara", name: "Mara" },
        { id: "aqua", name: "Aqua", staying: true },
      ];
      venue.zones.find((z) => z.id === "airstrip").accessView.companions = [
        { id: "gidget", name: "Gidget", trespass: true },
      ];
      venue.zones.find((z) => z.id === "garden").dayNight = true;
      venue.zones.find((z) => z.id === "garden").nightImage = {
        id: "known-night",
        url: "http://move-map.test/known-night.svg",
      };
      snapshot.sceneVenue = { sceneId: scene.id, venue: structuredClone(venue) };
      const positions = {
        exterior: { x: 0, y: 0 },
        walkway: { x: 0, y: 24 },
        garden: { x: 0, y: 48 },
        airstrip: { x: 68, y: 12 },
        hangar: { x: 68, y: 42 },
      };
      snapshot.settings.venues = [{ ...structuredClone(venue), zoneLayout: positions }];
      snapshot.settings.venues[0].zones.find((z) => z.id === "garden").image = {
        id: "private-new",
        url: "http://move-map.test/private-new.svg",
      };
      snapshot.settings.venues[0].zones.find((z) => z.id === "hangar").image = {
        id: "private-unseen",
        url: "http://move-map.test/private-unseen.svg",
      };
      snapshot.settings.venues[0].zones[0].connectedTo.push("garden");
      snapshot.settings.venues[0].zones.push({
        id: "live-only",
        name: "Uncaptured Zone",
        kind: "public",
        connectedTo: ["exterior"],
      });
      const moves = [];
      const reactions = [];
      const layouts = [];
      const artRequests = [];
      await page.route("http://move-map.test/*.svg", async (route) => {
        artRequests.push(new URL(route.request().url()).pathname);
        await fulfill(route, {
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160"><rect width="320" height="160" fill="#a3aa72"/><path d="M0 150L140 30L320 150Z" fill="#315544"/></svg>',
        });
      });
      await page.route("http://move-map.test/", (r) =>
        fulfill(r, {
          contentType: "text/html",
          body: "<style>html,body{margin:0;height:100%}marinara-capability-villages{display:block;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
        }),
      );
      await page.route("**/api/villages**", async (route) => {
        const path = new URL(route.request().url()).pathname;
        let value = snapshot;
        if (path.endsWith("/venues/mill/layout")) {
          const body = route.request().postDataJSON();
          layouts.push(body);

          snapshot.settings.venues[0].zoneLayout = body.positions;
        } else if (path.endsWith("/rooms/zone")) {
          const body = route.request().postDataJSON();
          moves.push(body);
          const companions =
            venue.zones
              .find((row) => row.id === body.zoneId)
              ?.accessView.companions?.filter((row) => !row.staying)
              .map((row) => row.id) ?? [];
          const arrivalId = "arrival-fixture-" + moves.length;
          const destination = venue.zones.find((z) => z.id === body.zoneId).name;
          const names = companions.map((id) => (id === "mara" ? "Mara" : "Gidget"));
          scene = {
            ...scene,
            zoneArrivalId: arrivalId,
            lines: [
              ...scene.lines,
              {
                id: arrivalId,
                kind: "narration",
                role: "assistant",
                speakerId: "__venue_scene__",
                name: "Narration",
                content: `You arrive at ${destination}${names.length ? " with " + names.join(", ") : ""}.`,
                at: now,
                physicalIdsAfter: companions,
              },
            ],
            zoneId: body.zoneId,
            area: body.zoneId === "exterior" ? "outside" : "public",
            sceneRevision: scene.sceneRevision + 1,
            activeIds: companions,
            participants: [
              ...scene.participants.filter((p) => !companions.includes(p.characterId)),
              ...companions.map((id) => ({
                characterId: id,
                name: id === "mara" ? "Mara" : "Gidget",
                doing: "Crossing with you",
              })),
            ],
            ...(body.trespass ? { trespassing: true } : {}),
          };
          value = { session: scene };
        } else if (path.endsWith("/rooms/react")) {
          reactions.push(route.request().postDataJSON());
          scene = { ...scene, trespassReactionId: undefined, sceneRevision: scene.sceneRevision + 1 };
          value = { session: scene, recordEvents: [] };
        } else if (path.endsWith("/history"))
          value = { sceneId: scene.id, scope: snapshot.worldScope, version: "history-fixture", lines: scene.lines };
        else if (path.endsWith("/rooms/active")) value = { session: scene };
        await fulfill(route, { json: authorSceneResponse(value, snapshot.worldScope) });
      });
      await page.goto("http://move-map.test/");
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      const picker = page.getByRole("dialog", { name: "Move to Zone", exact: true });
      const open = async () => {
        await page.getByRole("button", { name: "Move", exact: true }).click();
      };
      await open();
      await expect(picker).toHaveClass(new RegExp(`villages-scene-move-${night ? "night" : "day"}`));
      const colors = await picker.evaluate((node) => ({
        bg: getComputedStyle(node).backgroundColor,
        ink: getComputedStyle(node).color,
      }));
      assert.deepEqual(
        colors,
        night
          ? { bg: "rgb(48, 45, 71)", ink: "rgb(240, 223, 188)" }
          : { bg: "rgb(183, 213, 226)", ink: "rgb(33, 62, 54)" },
      );
      await expect(picker.locator("svg :is(line, polyline)")).toHaveCount(4);
      const elbows = await picker
        .locator("svg polyline")
        .evaluateAll((nodes) => nodes.map((node) => [...node.points].map(({ x, y }) => [x, y])));
      assert.equal(elbows.length, 4);
      assert.ok(
        elbows.every((points) => points.slice(1).every((p, i) => p[0] === points[i][0] || p[1] === points[i][1])),
        "Every segment is angular",
      );
      await expect(picker.locator('[data-layout-zone="garden"] img')).toHaveAttribute(
        "src",
        `http://move-map.test/known-${night ? "night" : "day"}.svg`,
      );
      await expect
        .poll(() =>
          picker
            .locator('[data-layout-zone="garden"] img')
            .evaluate((img) => img.complete && img.naturalWidth > 0 && getComputedStyle(img).opacity !== "0"),
        )
        .toBe(true);
      await expect(picker.locator('[data-layout-zone="hangar"] img')).toHaveCount(0);
      assert.ok(
        !artRequests.some((url) => url.includes("private")),
        "Move never loads live/unseen artwork over captured presentation",
      );
      await expect(picker.getByRole("button", { name: "Arrange", exact: true })).toHaveCount(0);
      await expect(picker.getByRole("button", { name: "Uncaptured Zone", exact: true })).toHaveCount(0);
      await expect(picker.locator('[data-layout-zone="exterior"]')).toHaveAttribute("aria-current", "location");
      const gardenRatio = await picker
        .locator('[data-layout-zone="garden"]')
        .evaluate((node) => node.offsetTop / node.parentElement.clientHeight);
      assert.ok(Math.abs(gardenRatio - 0.48) < 0.01, "Move uses the live diagram arrangement with captured routes");
      const gardenBox = await picker.getByRole("button", { name: "Garden", exact: true }).boundingBox();
      await page.mouse.move(gardenBox.x + gardenBox.width / 2, gardenBox.y + gardenBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(gardenBox.x + gardenBox.width + 20, gardenBox.y + gardenBox.height + 20);
      await page.mouse.up();
      assert.equal(moves.length, 0, "Dragging off a read-only tile never activates a move");
      await picker.getByRole("button", { name: "Garden", exact: true }).click();
      await expect(picker.getByText("Coming with you: Mara", { exact: true })).toBeVisible();
      await expect(picker.getByText("Staying here: Aqua", { exact: true })).toBeVisible();
      await expect(picker.getByRole("checkbox")).toHaveCount(0);
      await expect(picker.getByText("Move to Garden?", { exact: true })).toBeVisible();
      assert.equal(moves.length, 0, "Selecting an open Zone never moves immediately");
      await picker.getByRole("button", { name: "Stay here", exact: true }).click();
      assert.equal(moves.length, 0, "Cancelling an ordinary move stays in the current Zone");
      await picker.getByRole("button", { name: "Garden", exact: true }).click();
      await picker.getByRole("button", { name: "Walkway", exact: true }).click();
      await expect(picker.getByText("Move to Walkway?", { exact: true })).toBeVisible();
      assert.equal(moves.length, 0, "Changing the selected destination does not move");
      await picker.getByRole("button", { name: "Entrance", exact: true }).click();
      await expect(picker.getByRole("button", { name: "Move", exact: true })).toHaveCount(0);
      await picker.getByRole("button", { name: "Garden", exact: true }).click();
      await page.evaluate(() => {
        window.beforeArrivalCheckpoint = structuredClone(window.featureController.sceneReading.checkpoint.current);
      });
      await picker.getByRole("button", { name: "Move", exact: true }).click();
      await expect.poll(() => moves.length).toBe(1);
      assert.equal(moves[0].zoneId, "garden");
      assert.equal(moves[0].trespass, undefined);
      assert.equal(moves[0].follow, true, "Ordinary movement includes the authoritative following party");
      assert.equal(moves[0].companions, undefined, "Players do not select a separate crossing party");
      await expect(page.getByText("You arrive at Garden with Mara.", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Without permission", exact: true })).toHaveCount(0);
      await expect(page.getByText("I will sneak along with you.", { exact: true })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Previous paragraph", exact: true })).toHaveCount(0);
      assert.equal(await page.evaluate(() => window.featureController.room.zoneId), "garden");
      await expect(page.locator('[data-character-id="mara"]')).toBeVisible();
      await page.evaluate(() => {
        const c = window.featureController;
        window.arrivedRoom = c.room;
        c.setRoom(null);
        c.sceneReading.checkpoint.current = window.beforeArrivalCheckpoint;
      });
      await expect(page.locator("[data-villages-scene-composer]")).toHaveCount(0);
      await page.evaluate(() => window.featureController.setRoom(window.arrivedRoom));
      await expect(page.getByText("You arrive at Garden with Mara.", { exact: true })).toBeVisible();
      await expect(page.getByText("I will sneak along with you.", { exact: true })).toHaveCount(0);
      await page.getByRole("button", { name: "Transcript", exact: true }).click();
      await expect(page.getByRole("log", { name: "Scene history", exact: true })).toContainText(
        "I will sneak along with you.",
      );
      await page.getByRole("button", { name: "Close Transcript", exact: true }).click();
      await page.reload();
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      await expect(page.getByText("You arrive at Garden with Mara.", { exact: true })).toBeVisible();
      await expect(page.getByText("I will sneak along with you.", { exact: true })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Previous paragraph", exact: true })).toHaveCount(0);
      await expect(page.locator("[data-villages-scene-composer]")).toBeVisible();
      await open();
      await picker.getByRole("button", { name: "Entrance", exact: true }).click();
      await picker.getByRole("button", { name: "Move", exact: true }).click();
      await expect.poll(() => moves.length).toBe(2);
      await open();
      await picker.getByRole("button", { name: "Hangar", exact: true }).click();
      await expect(picker.getByRole("button", { name: "Trespass…", exact: true })).toHaveCount(0);
      assert.equal(moves.length, 2);
      await picker.getByRole("button", { name: "Airstrip", exact: true }).click();
      await picker.getByRole("button", { name: "Trespass…", exact: true }).click();
      await expect(picker.getByText("Coming with you: Gidget (trespassing)", { exact: true })).toBeVisible();
      await picker.getByRole("button", { name: "Stay here", exact: true }).click();
      assert.equal(moves.length, 2);
      await picker.getByRole("button", { name: "Trespass…", exact: true }).click();
      await page.screenshot({ path: `.build-tmp/move-map-${width}.png` });
      assert.ok((await picker.boundingBox()).width <= width, "Move map fits phone width");
      await picker.getByRole("button", { name: "Attempt entry", exact: true }).click();
      await expect.poll(() => moves.length).toBe(3);
      assert.equal(moves[2].zoneId, "airstrip");
      assert.equal(moves[2].trespass, true);
      assert.equal(moves[2].follow, true);
      const permission = page.getByRole("button", { name: "Without permission", exact: true });
      const permissionPanel = page.getByRole("region", { name: "Without permission", exact: true });
      await expect(permission).toBeVisible();
      await expect(
        page.locator(".marinara-capability-villages-chat-head").getByText("Trespassing", { exact: true }),
      ).toHaveCount(0);
      await permission.click();
      await expect(permission).toHaveAttribute("aria-expanded", "true");
      await expect(permissionPanel).toHaveText("You are currently in this area without permission.");
      const chipBox = await permission.boundingBox(),
        panelBox = await permissionPanel.boundingBox();
      assert.ok(chipBox.width >= 44 && chipBox.height >= 44);
      assert.ok(panelBox.x >= 0 && panelBox.x + panelBox.width <= width);
      await page.screenshot({ path: `.build-tmp/permission-chip-${width}.png` });
      await page.keyboard.press("Escape");
      await expect(permissionPanel).toHaveCount(0);
      await expect(permission).toBeFocused();
      await permission.press("Enter");
      await expect(permissionPanel).toBeVisible();
      await page.locator("[data-villages-scene-composer]").click();
      await expect(permissionPanel).toHaveCount(0);
      await permission.click();
      await page.evaluate(() => {
        const c = window.featureController;
        c.setRoom({ ...c.room, trespassing: false });
      });
      await expect(permission).toHaveCount(0);
      await expect(permissionPanel).toHaveCount(0);
      await page.evaluate(() => {
        const c = window.featureController;
        c.setRoom({ ...c.room, trespassing: true });
      });
      assert.equal(moves.length, 3, "Permission details never move the player");
      assert.equal(reactions.length, 0, "Permission details never dispatch narration");
      await open();
      await expect(picker.getByRole("button", { name: "Arrange", exact: true })).toHaveCount(0);
      const garden = picker.locator('[data-layout-zone="garden"]');
      await garden.focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(layouts.length, 0, "An active Scene cannot arrange or save Zone positions");
      assert.deepEqual(snapshot.settings.venues[0].zoneLayout, positions);
      await picker.getByRole("button", { name: "Close Move to Zone", exact: true }).click();
      const composer = page.locator("[data-villages-scene-composer]");
      await composer.fill("My unsent cover story");
      await page.evaluate(() => {
        const c = window.featureController;
        c.setRoom({ ...c.room, trespassReactionId: "test-reaction" });
      });
      await expect.poll(() => reactions.length).toBe(1);
      await expect(composer).toHaveValue("My unsent cover story");
      assert.equal(reactions[0].reactionId, "test-reaction");
      await page.evaluate(async () => {
        await window.featureController.loadSnapshot();
      });
      assert.equal(reactions.length, 1, "Snapshot refresh never repeats an automatic response");
      await page.close();
    }
  });
});
