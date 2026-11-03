import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { foundingFixture } from "./fixtures/founding-browser.fixture.mjs";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { runCase, wantsCase } from "../scripts/test-cases.mjs";
// Test cases: founding/sprites/desktop, founding/sprites/phone

const bundle = await foundingFixture();
const image =
  "data:image/svg+xml;base64," +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="192"><circle cx="64" cy="40" r="25" fill="#61b6d7"/><path d="M40 65h48l18 95H22z" fill="#c57e45"/><path d="M38 160h18v24H32zm34 0h18l6 24H72z" fill="#61b6d7"/></svg>',
  ).toString("base64");
const people = [
  { id: "aqua", name: "Aqua", summary: "A coastal resident" },
  { id: "mari", name: "Professor Mari", summary: "A patient teacher" },
];
const snapshot = {
  status: "ready",
  isFounded: false,
  village: { name: "", setting: "" },
  villagers: [],
  projects: [],
  residences: [],
  venueRequests: [],
  settings: {
    venues: [],
    worldRules: "",
    circumstances: [],
    communityVenueId: "",
    selectedLorebookIds: [],
    loreTokenBudget: 1600,
    maps: [],
    townMapExpectedWidth: 1536,
    townMapExpectedHeight: 1024,
    townMapGenerationWidth: 1536,
    townMapGenerationHeight: 1024,
    townMapView: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
    villageNameMaxLength: 80,
    settingMaxLength: 4096,
  },
};
const files = Array.from({ length: 18 }, (_, index) => ({
  filename: `sprite-${index}.png`,
  label: ["neutral", "happy", "angry", "wave"][index % 4] + (index > 3 ? ` ${index}` : ""),
  folderId: index < 10 ? "front" : index < 14 ? "side" : null,
  url: image,
}));
const artwork = (file) => ({
  id: "art:" + file.filename,
  name: file.label,
  origin: "engine",
  engineSource: { characterId: "aqua", filename: file.filename },
  rendered: { url: image },
  warnings: [],
});
const initial = (id) => ({
  revision: 1,
  useSprites: id === "aqua",
  defaultArtworkId: "art:sprite-0.png",
  assignments: [0, 1, 10].map((index) => ({
    artworkId: "art:" + files[index].filename,
    name: files[index].label,
    view: index === 10 ? "side" : "front",
    included: true,
    approved: true,
  })),
  manager: {
    version: 1,
    artwork: [0, 1, 10].map((index) => ({
      ...artwork(files[index]),
      engineSource: { characterId: id, filename: files[index].filename },
    })),
    expressions: [],
    assignments: [],
    framing: { mode: "full" },
  },
  files,
  folders: [
    { id: "front", name: "Front", category: "full-body" },
    { id: "side", name: "Side", category: "full-body" },
  ],
  folderSupport: true,
  errors: {},
  resident: false,
  residentToken: "",
});
await mkdir(".build-tmp/founding-sprites", { recursive: true });
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1280, height: 584 },
    { width: 390, height: 844 },
    { width: 320, height: 650 },
  ]) {
    const name = viewport.width > 600 ? "founding/sprites/desktop" : "founding/sprites/phone";
    if (!wantsCase(name)) continue;
    await runCase(name, async () => {
      const context = await browser.newContext({
        viewport,
        hasTouch: viewport.width < 600,
        isMobile: viewport.width < 600,
      });
      await mockEngineLookups(context);
      const page = await context.newPage();
      const states = { aqua: initial("aqua"), mari: initial("mari") };
      const writes = [],
        imports = [];
      let holdSave = false,
        releaseSave,
        loseSave = false,
        conflictSave = false,
        unknownConflict = false;
      await page.route("**/api/villages**", async (route) => {
        const path = new URL(route.request().url()).pathname;
        const method = route.request().method();
        const send = (value) => fulfill(route, { contentType: "application/json", body: JSON.stringify(value) });
        const match = path.match(/\/characters\/(aqua|mari)\/sprites\/setup\/(settled|prepare|save)$/);
        if (match) {
          const [, id, action] = match;
          if (action === "settled") return send(states[id]);
          const body = route.request().postDataJSON();
          assert.equal(body.revision, states[id].revision, "Every mutation uses the confirmed server revision");
          if (action === "prepare") {
            assert.deepEqual(body.filenames.length, 1);
            const file = files.find((file) => file.filename === body.filenames[0]);
            assert.equal(file.folderId, body.folderId);
            assert.equal(body.view, "unassigned", "Copying alone never assigns a sprite");
            assert(!states[id].manager.artwork.some((art) => art.engineSource.filename === file.filename));
            states[id].manager.artwork.push({
              ...artwork(file),
              engineSource: { characterId: id, filename: file.filename },
            });
            states[id].assignments.push({
              artworkId: "art:" + file.filename,
              name: file.label,
              view: "front",
              included: false,
              approved: false,
            });
            states[id].revision++;
            imports.push({ id, filename: file.filename });
            return send(states[id]);
          }
          assert.equal(action, "save");
          if (unknownConflict) {
            unknownConflict = false;
            states[id].revision++;
            states[id].useSprites = !body.useSprites;
            return fulfill(route, {
              status: 503,
              contentType: "application/json",
              body: JSON.stringify({ error: "The save response was lost." }),
            });
          }
          if (conflictSave) {
            conflictSave = false;
            states[id].revision++;
            states[id].useSprites = true;
            return fulfill(route, {
              status: 409,
              contentType: "application/json",
              body: JSON.stringify({ error: "Sprite setup changed." }),
            });
          }
          assert.equal(body.validateForUse, true);
          assert.equal(new Set(body.assignments.map((item) => item.artworkId)).size, body.assignments.length);
          assert(body.assignments.every((item) => item.approved === (item.included && Boolean(item.name.trim()))));
          states[id] = { ...states[id], ...body, revision: states[id].revision + 1 };
          writes.push({ id, body });
          if (holdSave)
            await new Promise((done) => {
              releaseSave = done;
            });
          if (loseSave) {
            loseSave = false;
            return fulfill(route, {
              status: 503,
              contentType: "application/json",
              body: JSON.stringify({ error: "The save response was lost." }),
            });
          }
          return send(states[id]);
        }
        if (method !== "GET") assert.fail("Unexpected mutation: " + method + " " + path);
        if (path.endsWith("/personas")) return send({ personas: [{ id: "driver", name: "You", isActive: true }] });
        if (path.endsWith("/personas/driver"))
          return send({ persona: { id: "driver", name: "You", description: "A visitor", identity: "A visitor" } });
        if (path.endsWith("/connections"))
          return send({ systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" });
        if (path.endsWith("/catalog")) return send({ characters: people });
        if (path.endsWith("/lorebooks")) return send({ books: [] });
        if (path.endsWith("/image-style-profiles")) return send({ defaultProfileId: "", profiles: [] });
        return send(snapshot);
      });
      await page.route("**/api/connections", (route) =>
        fulfill(route, {
          contentType: "application/json",
          body: JSON.stringify([
            { id: "talk", name: "Language model", provider: "language", defaultForAgents: true },
            { id: "image", name: "Image model", provider: "image_generation", defaultForAgents: true },
          ]),
        }),
      );
      await page.route("http://founding-sprites.test/", (route) =>
        fulfill(route, {
          contentType: "text/html",
          body: '<meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;width:100%;height:100%;font:16px Arial}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>',
        }),
      );
      await page.goto("http://founding-sprites.test/");
      await page.addScriptTag({ content: bundle });
      const root = page.locator(".villages-forging-v2"),
        next = root.getByRole("button", { name: "Continue to Venues and Map", exact: true });
      await root.getByLabel("Village Name", { exact: true }).fill("Tidebreak");
      await root.getByLabel("Local area", { exact: true }).fill("A village beside the sea.");
      await root.getByRole("button", { name: "Continue to People", exact: true }).click();
      for (const person of people) {
        await root.getByRole("button", { name: "+ Add villager", exact: true }).click();
        await page
          .getByRole("dialog", { name: "Choose founding villagers", exact: true })
          .getByRole("button", { name: person.name + " · Add", exact: true })
          .click();
      }
      const pane = root.getByRole("region", { name: "Aqua sprite setup", exact: true });
      await expect(next).toBeEnabled();
      const frame = await root.boundingBox();
      assert.equal(writes.length, 0, "Opening a resident never writes or imports artwork");
      assert.equal(
        await page.evaluate(() => window.featureController.setupSpriteRevisions.aqua),
        undefined,
        "Opening a reusable sprite set does not select it for this founding draft",
      );
      await expect(pane.getByRole("button", { name: "Use Portrait", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      loseSave = true;
      await pane.getByRole("button", { name: "Use Sprites", exact: true }).click();
      await expect(pane.getByRole("alert")).toHaveText(/save response was lost/);
      await expect(next).toBeDisabled();
      assert.equal(await page.evaluate(() => window.featureController.setupSpriteRevisions.aqua), undefined);
      const firstSaveCount = writes.length;
      await pane.getByRole("button", { name: "Reload sprites", exact: true }).click();
      await expect(next).toBeEnabled();
      await expect(pane.getByRole("button", { name: "Use Sprites", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      assert.equal(writes.length, firstSaveCount, "Recovering the first explicit save does not repeat it");
      assert.equal(await page.evaluate(() => window.featureController.setupSpriteRevisions.aqua), states.aqua.revision);
      const selectedRevision = states.aqua.revision;
      const writesBeforeDrag = writes.length;
      await expect(root.getByRole("button", { name: "Sprites", exact: true })).toHaveCount(0);
      await expect(pane.locator(".founding-sprite-check")).toHaveCount(1);
      const source = (index) => pane.locator(`[data-source="file:sprite-${index}.png"]`);
      const showSource = async (index) => {
        while (!(await source(index).count()))
          await pane.getByRole("button", { name: "Next Engine sprite page", exact: true }).click();
      };
      await expect(source(0)).toBeDisabled();
      await expect(source(0)).toHaveAttribute("data-assigned", "Front");
      const front = pane.getByRole("region", { name: "Front sprite folder", exact: true });
      const side = pane.getByRole("region", { name: "Side sprite folder", exact: true });
      await showSource(3);
      holdSave = true;
      if (viewport.width > 600) await source(3).dragTo(front);
      else {
        await source(3).click();
        await front.getByRole("button", { name: "Assign selected sprite to Front", exact: true }).click();
      }
      await expect.poll(() => typeof releaseSave).toBe("function");
      await expect(next).toBeDisabled();
      await expect(root.getByRole("button", { name: "Professor Mari", exact: true })).toBeDisabled();
      assert.equal(
        await page.evaluate(() => window.featureController.setupSpriteRevisions.aqua),
        selectedRevision,
        "An unconfirmed save cannot advance the founding revision",
      );
      holdSave = false;
      releaseSave();
      await expect(next).toBeEnabled();
      await expect(source(3)).toBeDisabled();
      await expect(source(3)).toHaveAttribute("data-assigned", "Front");
      assert.equal(imports.length, 1);
      assert.equal(writes.length, writesBeforeDrag + 1);
      await side.evaluate((element) => {
        const transfer = new DataTransfer();
        transfer.setData("text/plain", "file:sprite-3.png");
        element.dispatchEvent(new DragEvent("drop", { bubbles: true, dataTransfer: transfer }));
      });
      assert.equal(writes.length, writesBeforeDrag + 1, "An assigned sprite cannot be copied into the other folder");
      await page.screenshot({ path: `.build-tmp/founding-sprites/sprites-${viewport.width}.png`, fullPage: true });
      await front.getByRole("button", { name: "Set wave as Default", exact: true }).click();
      await expect(next).toBeEnabled();
      await expect(pane.locator(".founding-sprite-check")).toHaveCount(1);
      assert.equal(states.aqua.defaultArtworkId, "art:sprite-3.png");
      await front.getByRole("button", { name: "Remove wave from Front", exact: true }).click();
      await expect(next).toBeEnabled();
      await expect(source(3)).toBeEnabled();
      assert(!states.aqua.assignments.find((item) => item.artworkId === "art:sprite-3.png").included);
      await source(3).click();
      await side.getByRole("button", { name: "Assign selected sprite to Side", exact: true }).click();
      await expect(next).toBeEnabled();
      assert.equal(imports.length, 1, "Reassigning reuses the independent imported copy");
      await expect(source(3)).toHaveAttribute("data-assigned", "Side");
      await pane.getByRole("button", { name: "Use Portrait", exact: true }).click();
      await expect(next).toBeEnabled();
      await expect(pane.getByRole("region", { name: "Portrait scene preview", exact: true })).toBeVisible();
      await expect(pane.locator(".founding-sprite-folder")).toHaveCount(0);
      await pane.getByLabel("Engine folder", { exact: true }).selectOption("unfiled");
      await expect(source(14)).toBeDisabled();
      await pane.getByRole("button", { name: "Use Sprites", exact: true }).click();
      await expect(next).toBeEnabled();
      await expect(source(14)).toBeEnabled();
      await expect(pane.locator(".founding-sprite-card")).not.toHaveCount(0);
      assert.deepEqual(await root.boundingBox(), frame, "Portrait mode and folders preserve the full window");
      loseSave = true;
      await pane.getByRole("button", { name: "Use Portrait", exact: true }).click();
      await expect(pane.getByRole("alert")).toHaveText(/save response was lost/);
      await expect(next).toBeDisabled();
      const beforeRecovery = writes.length;
      await pane.getByRole("button", { name: "Reload sprites", exact: true }).click();
      await expect(next).toBeEnabled();
      await expect(pane.getByRole("region", { name: "Portrait scene preview", exact: true })).toBeVisible();
      assert.equal(writes.length, beforeRecovery, "Recovering an uncertain save is GET-only");
      assert.equal(await page.evaluate(() => window.featureController.setupSpriteRevisions.aqua), states.aqua.revision);
      await root.getByRole("button", { name: "Professor Mari", exact: true }).click();
      await expect(next).toBeEnabled();
      const mari = root.getByRole("region", { name: "Professor Mari sprite setup", exact: true });
      await mari.getByRole("button", { name: "Use Sprites", exact: true }).click();
      await expect(next).toBeEnabled();
      assert.equal(states.mari.useSprites, true);
      assert.equal(states.aqua.useSprites, false, "Residents have independent modes and assignments");
      await root.getByRole("button", { name: "Aqua", exact: true }).click();
      await expect(next).toBeEnabled();
      await expect(pane.getByRole("button", { name: "Use Portrait", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      assert.equal(await pane.getByRole("button", { name: /save/i }).count(), 0, "There is no manual save action");
      const chosenRevision = states.aqua.revision;
      states.aqua.useSprites = true;
      states.aqua.revision++;
      const beforeConflict = writes.length;
      await root.getByRole("button", { name: "Professor Mari", exact: true }).click();
      await expect(next).toBeEnabled();
      await root.getByRole("button", { name: "Aqua", exact: true }).click();
      await expect(pane.getByRole("alert")).toHaveText(/Sprite setup changed/);
      await expect(next).toBeDisabled();
      assert.equal(writes.length, beforeConflict);
      assert.equal(
        await page.evaluate(() => window.featureController.setupSpriteRevisions.aqua),
        chosenRevision,
        "An unrelated newer setup is not adopted by a read",
      );
      await pane.getByRole("button", { name: "Use Portrait", exact: true }).click();
      await expect(next).toBeEnabled();
      // Older setup sessions could retain an included, unnamed image.
      conflictSave = true;
      const beforeRefusal = states.aqua.revision;
      await pane.getByRole("button", { name: "Use Portrait", exact: true }).click();
      await expect(pane.getByRole("alert")).toHaveText(/Sprite setup changed/);
      await pane.getByRole("button", { name: "Reload sprites", exact: true }).click();
      await expect(pane.getByRole("alert")).toHaveText(/Choose Portrait or Sprites/);
      await expect(next).toBeDisabled();
      assert.equal(
        await page.evaluate(() => window.featureController.setupSpriteRevisions.aqua),
        beforeRefusal,
        "A refused save does not authorize adoption of another writer's revision",
      );
      await pane.getByRole("button", { name: "Use Portrait", exact: true }).click();
      await expect(next).toBeEnabled();
      unknownConflict = true;
      const beforeUnknown = states.aqua.revision;
      await pane.getByRole("button", { name: "Use Portrait", exact: true }).click();
      await expect(pane.getByRole("alert")).toHaveText(/save response was lost/);
      await pane.getByRole("button", { name: "Reload sprites", exact: true }).click();
      await expect(pane.getByRole("alert")).toHaveText(/Choose Portrait or Sprites/);
      await expect(next).toBeDisabled();
      assert.equal(
        await page.evaluate(() => window.featureController.setupSpriteRevisions.aqua),
        beforeUnknown,
        "An uncertain response cannot adopt another writer's different choice",
      );
      await pane.getByRole("button", { name: "Use Portrait", exact: true }).click();
      await expect(next).toBeEnabled();
      const incomplete = artwork(files[2]);
      states.aqua.manager.artwork.push(incomplete);
      states.aqua.assignments.push({
        artworkId: incomplete.id,
        name: "",
        included: true,
        approved: false,
        view: "front",
      });
      states.aqua.useSprites = true;
      await root.getByRole("button", { name: "Professor Mari", exact: true }).click();
      await expect(next).toBeEnabled();
      await root.getByRole("button", { name: "Aqua", exact: true }).click();
      await expect(pane.getByRole("alert")).toHaveText(/default sprite or use Portrait/);
      await expect(next).toBeDisabled();
      await pane.getByRole("button", { name: "Use Sprites", exact: true }).click();
      await expect(pane.getByRole("button", { name: "Use Portrait", exact: true })).toBeEnabled();
      await expect(next).toBeDisabled();
      await pane.getByRole("button", { name: "Use Portrait", exact: true }).click();
      await expect(next).toBeEnabled();
      assert.equal(states.aqua.useSprites, false, "An incomplete old set can always be repaired by choosing Portrait");
      const overflows = await pane.evaluate((element) =>
        [
          ...element.querySelectorAll(
            ".founding-sprite-source-grid,.founding-sprite-folder,.founding-sprite-assigned-grid,.founding-sprite-library",
          ),
        ].map((node) => ({
          name: node.className,
          width: node.clientWidth,
          sw: node.scrollWidth,
          height: node.clientHeight,
          sh: node.scrollHeight,
        })),
      );
      for (const box of overflows)
        assert(box.sw <= box.width + 1 && box.sh <= box.height + 1, JSON.stringify({ viewport, box }));
      await page.screenshot({ path: `.build-tmp/founding-sprites/people-${viewport.width}.png`, fullPage: true });
      await next.click();
      await expect(root).toHaveAttribute("data-step", "2");
      await root.getByRole("button", { name: "Back", exact: true }).click();
      await expect(next).toBeEnabled();
      await expect(pane.getByRole("status")).toHaveText("Saved");
      await page.evaluate(() => window.featureController.setSetupFoundingVillagerIds(["missing-character"]));
      const missing = root.getByRole("button", { name: "Unavailable character · Remove", exact: true });
      await expect(missing).toBeEnabled();
      await missing.click();
      await expect(root.locator(".villages-selected-villager")).toHaveCount(0);
      await context.close();
    });
  }
});
