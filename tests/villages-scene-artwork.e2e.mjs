import { scenePlaybackFixtures } from "./fixtures/scene-browser.fixture.mjs";
const { authorSceneResponse } = await scenePlaybackFixtures();
import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, expect, fulfill, mockEngineLookups } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as fixture, image, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `
import {installFeature} from './tests/fixtures/feature-root.js';
import {SceneScreen} from './packages/villages/src/client/features/scenes/SceneScreen.js';
import {VenueScreen} from './packages/villages/src/client/features/venues/VenueScreen.js';
import {venuePictureOf} from './packages/villages/src/client/shared/presentation.js';
window.pictureFor=venuePictureOf;
installFeature(c=>c.screen==='venue'?<VenueScreen controller={c}/>:<SceneScreen controller={c}/>);
`,
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
try {
  for (const [width, area] of [
    [1366, "public"],
    [390, "public"],
    [1366, "outside"],
    [390, "outside"],
  ]) {
    const targetId = area === "outside" ? "exterior" : "workroom";
    const targetName = area === "outside" ? "Entrance" : "Workroom";
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await mockEngineLookups(page);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const snapshot = structuredClone(fixture),
      venue = snapshot.settings.venues[0];
    const old = image("#635344"),
      generated = image("#346755"),
      uploaded = image("#664477");
    venue.zones = [
      {
        id: "exterior",
        kind: "exterior",
        name: "Entrance",
        venueClass: "community",
        seen: true,
        image: { url: old, id: "old-exterior", ref: "old-exterior" },
        connectedTo: ["workroom"],
      },
      {
        id: "workroom",
        kind: "public",
        name: "Workroom",
        venueClass: "community",
        seen: true,
        image: { url: old, id: "old", ref: "old" },
        description: "A captured workroom.",
        connectedTo: ["exterior"],
      },
    ];
    const scene = {
      id: "artwork-scene",
      version: 2,
      sceneRevision: 1,
      placeId: venue.id,
      placeName: venue.name,
      zoneId: targetId,
      area,
      status: "active",
      activeIds: [],
      participants: [],
      lines: [],
      submissions: [],
      startedAt: now,
      lastActivityAt: now,
      endedAt: "",
      capturedContext: { capturedAt: now },
    };
    snapshot.sceneVenue = { sceneId: scene.id, venue: structuredClone(venue) };
    const captured = structuredClone(snapshot.sceneVenue),
      originalScene = structuredClone(scene);
    const mutations = [];
    await page.route("http://scene-artwork.test/", (r) =>
      fulfill(r, {
        contentType: "text/html",
        body: "<style>html,body{margin:0;height:100%}marinara-capability-villages{display:block;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const req = route.request(),
        path = new URL(req.url()).pathname;
      let value = snapshot;
      if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) value = { session: scene };
      if (
        (path.endsWith("/locations/venue/image") || path.endsWith("/locations/venue/image/update")) &&
        req.method() !== "GET"
      ) {
        const body = req.postDataJSON();
        mutations.push({ path, method: req.method(), body });
        const zone = venue.zones.find((z) => z.id === body.zoneId);
        assert.ok(zone);
        zone.image =
          req.method() === "DELETE"
            ? null
            : {
                url: req.method() === "POST" ? generated : uploaded,
                id: "new-" + mutations.length,
                ref: "new-" + mutations.length,
              };
      } else if (req.method() !== "GET" && /\/rooms(?:\/|$)/.test(path))
        assert.fail("artwork must not mutate the Scene");
      await fulfill(route, { json: authorSceneResponse(value, snapshot.worldScope) });
    });
    await page.goto("http://scene-artwork.test/");
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const composer = page.getByRole("textbox", { name: "Message at " + venue.name });
    const backdrop = page.locator(".marinara-capability-villages-chat-scene-backdrop");
    await expect(composer).toBeVisible();
    await composer.fill("Keep this unsent Scene draft.");
    await expect(backdrop).toHaveAttribute("src", old);
    const openSettings = async () => {
      await page.getByRole("button", { name: "Venue actions", exact: true }).click();
      await page.getByRole("menuitem", { name: "View Venue", exact: true }).click();
      await page.getByRole("button", { name: "Zones", exact: true }).click();
      await page.locator(`[data-layout-zone="${targetId}"]`).click();
    };
    const returnToScene = () => page.getByRole("button", { name: "Back to Scene", exact: true }).click();
    await openSettings();
    await page.getByRole("button", { name: "Regenerate artwork", exact: true }).click();
    await expect.poll(() => mutations.length).toBe(1);
    await expect(page.getByRole("button", { name: "Regenerate artwork", exact: true })).toBeEnabled();
    await returnToScene();
    await expect(backdrop).toHaveAttribute("src", generated);
    await expect(composer).toHaveValue("Keep this unsent Scene draft.");
    await openSettings();
    await page.getByLabel(`Upload ${targetName} artwork`).setInputFiles({
      name: "upload.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB1cAAAAASUVORK5CYII=",
        "base64",
      ),
    });
    await expect.poll(() => mutations.length).toBe(2);
    await expect(page.getByRole("button", { name: "Remove artwork", exact: true })).toBeEnabled();
    await returnToScene();
    await expect(backdrop).toHaveAttribute("src", uploaded);
    await openSettings();
    await page.getByRole("button", { name: "Update artwork", exact: true }).click();
    await expect.poll(() => mutations.length).toBe(3);
    assert.ok(mutations.at(-1).path.endsWith("/image/update"));
    await returnToScene();
    await expect(backdrop).toHaveAttribute("src", generated);
    await openSettings();
    await page.getByRole("button", { name: "Remove artwork", exact: true }).click();
    await expect.poll(() => mutations.length).toBe(4);
    await expect(page.getByRole("button", { name: "Remove artwork", exact: true })).toHaveCount(0);
    await returnToScene();
    await expect(backdrop).toHaveCount(0);
    assert.deepEqual(snapshot.sceneVenue, captured, "artwork does not replace captured source facts");
    assert.deepEqual(scene, originalScene, "no Scene state/positions/attendance changes");
    await expect(composer).toHaveValue("Keep this unsent Scene draft.");
    await page.getByRole("button", { name: "Mode: Say / Do. Choose mode" }).click();
    await page.getByRole("menuitemradio", { name: "Move", exact: true }).click();
    await expect(
      page
        .getByRole("combobox", { name: "Move to Zone" })
        .locator(`option[value="${area === "outside" ? "workroom" : "exterior"}"]`),
    ).toHaveText(area === "outside" ? "Workroom" : "Entrance");
    scene.status = "closed";
    await page.evaluate(() => window.featureController.setRoom({ ...window.featureController.room, status: "closed" }));
    await expect(backdrop).toHaveAttribute("src", old);
    assert.equal(
      await page.evaluate(() =>
        window.pictureFor(
          [{ id: "legacy", presentation: { image: { url: "legacy-picture" } }, zones: [{ id: "exterior" }] }],
          { placeId: "legacy", zoneId: "exterior", area: "outside" },
        ),
      ),
      "legacy-picture",
      "old Entrance records keep Venue artwork fallback",
    );
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Scene artwork updates: generated/uploaded/removed images, retained captured facts and Scene draft, desktop and phone passed.",
  );
} finally {
  await browser.close();
}
