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
const files = [
  { filename: "happy.png", label: "Happy_01", url: image, folderId: "body" },
  { filename: "bright.png", label: "Happy_02", url: image, folderId: "body" },
  { filename: "happy-side.png", label: "Happy_blush", url: image, folderId: "profile" },
  { filename: "neutral.png", label: "Neutral", url: image, folderId: "body" },
];
const existing = {
  version: 1,
  artwork: [{ id: "old", name: "Old Happy", rendered: { url: image } }],
  expressions: [{ id: "old-happy", name: "Old Happy" }],
  assignments: [{ expressionId: "old-happy", view: "front", artworkId: "old" }],
  defaultExpressionId: "old-happy",
  framing: { mode: "full" },
};
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  await mkdir(".build-tmp/founding-sprites", { recursive: true });
  for (const viewport of [
    { width: 1366, height: 850 },
    { width: 390, height: 844 },
  ]) {
    const name = viewport.width > 600 ? "founding/sprites/desktop" : "founding/sprites/phone";
    if (!wantsCase(name)) continue;
    await runCase(name, async () => {
      const page = await browser.newPage({ viewport, hasTouch: viewport.width < 600 });
      await mockEngineLookups(page);
      await page.route("**/api/characters/summaries", (route) =>
        route.fulfill({
          json: [
            {
              id: "aqua",
              avatarUrl: image,
              avatarCrop: { srcX: 0.3, srcY: 0.2, srcWidth: 0.25, srcHeight: 0.25 },
            },
          ],
        }),
      );
      const writes = [];
      let saved;
      const state = {
        revision: 1,
        token: "first",
        manager: structuredClone(existing),
        files,
        folders: [
          { id: "body", name: "Full-body sprites" },
          { id: "profile", name: "Profile artwork" },
        ],
      };
      await page.route("**/api/villages**", async (route) => {
        const path = new URL(route.request().url()).pathname;
        const method = route.request().method();
        const send = (value) => fulfill(route, { contentType: "application/json", body: JSON.stringify(value) });
        if (path.endsWith("/sprites/setup/settled")) return send(state);
        if (path.endsWith("/sprites/setup/save")) {
          const body = route.request().postDataJSON();
          writes.push(body);
          if (saved) {
            assert.deepEqual(body, writes[0], "Retry repeats the exact admitted request");
            return send(saved);
          }
          assert.equal(body.token, "first");
          assert.equal(body.resident, false);
          state.revision++;
          const rows = body.expressions;
          state.manager.expressions = rows.map(({ id, name }) => ({ id, name }));
          state.manager.assignments = rows.flatMap((row) =>
            ["front", "side"].flatMap((view) => {
              const choice = row[view];
              if (!choice) return [];
              return [
                {
                  expressionId: row.id,
                  view,
                  ...(choice.filename
                    ? { engineFilename: choice.filename, version: choice.version }
                    : { artworkId: choice.artworkId }),
                },
              ];
            }),
          );
          state.manager.useSprites = body.useSprites;
          state.manager.defaultExpressionId = body.defaultExpressionId;
          saved = structuredClone(state);
          return fulfill(route, {
            status: 503,
            contentType: "application/json",
            body: JSON.stringify({ message: "Save response lost." }),
          });
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
      await root.getByLabel("Location name", { exact: true }).fill("Harbour");
      await root.getByLabel("Location description", { exact: true }).fill("A village beside the sea.");
      await root.getByRole("button", { name: "Continue to People", exact: true }).click();
      for (const person of people) {
        await root.getByRole("button", { name: "+ Add villager", exact: true }).click();
        await page
          .getByRole("dialog", { name: "Choose founding villagers", exact: true })
          .getByRole("button", { name: person.name + " · Add", exact: true })
          .click();
      }
      const pane = root.getByRole("region", { name: "Aqua’s appearance", exact: true });
      await expect(pane.getByRole("button", { name: "Portrait", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(pane.getByRole("button", { name: "Add Front sprites", exact: true })).toHaveCount(0);
      const portrait = pane.locator(".appearance-portrait img");
      await expect(portrait).toHaveJSProperty("complete", true);
      const crop = await portrait.evaluate((image) => {
        const frame = image.parentElement;
        const bounds = frame.getBoundingClientRect();
        return {
          contained: image.offsetParent === frame && getComputedStyle(frame).overflow === "hidden",
          square: Math.abs(bounds.width - bounds.height) < 1,
          enlarged: image.getBoundingClientRect().width > bounds.width,
          fits: bounds.width > 0 && bounds.width <= 176,
        };
      });
      assert.deepEqual(crop, { contained: true, square: true, enlarged: true, fits: true });
      assert.equal(
        await page.evaluate(() => window.featureController.setupSpriteRevisions.aqua),
        undefined,
        "Opening an older character setup does not adopt it",
      );
      await pane.getByRole("button", { name: "Sprites", exact: true }).click();
      await expect(pane.getByRole("img", { name: "Old Happy · Front" })).toBeVisible();
      await pane.getByRole("button", { name: "Add Front sprites", exact: true }).click();
      const frontPicker = page.getByRole("dialog", { name: "Add Front sprites", exact: true });
      await frontPicker.getByRole("combobox", { name: "Sprite source" }).selectOption("body");
      await frontPicker.getByRole("checkbox", { name: "Happy_01", exact: true }).check();
      await frontPicker.getByRole("checkbox", { name: "Happy_02", exact: true }).check();
      await frontPicker.getByRole("button", { name: "Add 2 Front sprites", exact: true }).click();
      await pane.getByRole("button", { name: "Add Side sprites", exact: true }).click();
      const sidePicker = page.getByRole("dialog", { name: "Add Side sprites", exact: true });
      await sidePicker.getByRole("combobox", { name: "Sprite source" }).selectOption("profile");
      await sidePicker.getByRole("checkbox", { name: "Happy_blush", exact: true }).check();
      await sidePicker.getByRole("button", { name: "Add 1 Side sprite", exact: true }).click();
      await pane.getByRole("button", { name: "happy", exact: true }).click();
      await expect(pane.getByRole("heading", { name: "Front · 2" })).toBeVisible();
      await expect(pane.getByRole("heading", { name: "Side · 1" })).toBeVisible();
      await expect(pane.getByRole("img", { name: "Happy_01 · Front" })).toBeVisible();
      await expect(pane.getByRole("img", { name: "Happy_blush · Side" })).toBeVisible();
      await pane.getByRole("button", { name: "Set as default" }).click();
      await expect(next).toBeDisabled();
      assert.equal(writes.length, 0);
      await pane.getByRole("button", { name: "Save", exact: true }).click();
      await expect(pane.getByRole("button", { name: "Retry save", exact: true })).toBeEnabled();
      await expect(pane.getByRole("button", { name: "Portrait", exact: true })).toBeDisabled();
      assert.equal(await page.evaluate(() => window.featureController.setupSpriteRevisions.aqua), undefined);
      await pane.getByRole("button", { name: "Retry save", exact: true }).click();
      await expect(next).toBeEnabled();
      assert.equal(await page.evaluate(() => window.featureController.setupSpriteRevisions.aqua), 2);
      assert.equal(writes[0].expressions.length, 4);
      assert.equal(writes[0].expressions[0].front.artworkId, "old");
      assert.equal(writes[0].expressions[3].side.filename, "happy-side.png");
      await page.screenshot({ path: ".build-tmp/founding-sprites/appearance-" + viewport.width + ".png" });
      await page.close();
    });
  }
});
console.log("Founding Appearance selects Engine sprites by facing and adopts only an acknowledged save.");
