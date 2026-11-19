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
const catalog = [
  ...people,
  ...Array.from({ length: 24 }, (_, index) => ({
    id: "card-" + index,
    name: "Card " + (index + 1),
    summary: "Another coastal resident",
  })),
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
    openingVenueId: "",
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
  { filename: "neutral-side.png", label: "Neutral_2", url: image, folderId: "profile" },
  { filename: "thinking-side.png", label: "Thinking", url: image, folderId: "profile" },
  { filename: "neutral.png", label: "Neutral", url: "/api/sprites/aqua/file/neutral.png", folderId: "body" },
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
    { width: 390, height: 620 },
  ]) {
    const phone = viewport.width <= 727;
    const name = phone ? "founding/sprites/phone" : "founding/sprites/desktop";
    if (!wantsCase(name)) continue;
    await runCase(name, async () => {
      const page = await browser.newPage({ viewport, hasTouch: phone, reducedMotion: "reduce" });
      await mockEngineLookups(page);
      const portraitLoads = [];
      let spriteLoads = 0;
      await page.route("**/api/avatars/file/aqua.png?*", (route) => {
        portraitLoads.push(new URL(route.request().url()));
        return fulfill(route, {
          contentType: phone ? "image/png" : "image/svg+xml",
          body: phone ? "unreadable image" : Buffer.from(image.split(",")[1], "base64"),
        });
      });
      await page.route("**/api/sprites/aqua/file/neutral.png", (route) => {
        spriteLoads++;
        return fulfill(route, { contentType: "image/svg+xml", body: Buffer.from(image.split(",")[1], "base64") });
      });
      await page.route("**/api/characters/summaries", (route) =>
        route.fulfill({
          json: [
            {
              id: "aqua",
              avatarUrl: "/api/avatars/file/aqua.png?v=7",
              avatarCrop: { srcX: 0.3, srcY: 0.2, srcWidth: 0.25, srcHeight: 0.25 },
            },
          ],
        }),
      );
      const writes = [];
      const opened = new Set();
      const receipts = new Map();
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
      const automatic = {
        ...structuredClone(state),
        automatic: true,
        manager: {
          version: 1,
          artwork: [],
          expressions: files.map(({ filename, label }) => ({ id: filename, name: label })),
          assignments: files.map(({ filename }) => ({
            expressionId: filename,
            view: "front",
            engineFilename: filename,
            automatic: true,
          })),
          defaultExpressionId: "neutral.png",
          defaultView: "front",
          framing: { mode: "full" },
        },
      };
      await page.route("**/api/villages**", async (route) => {
        const url = new URL(route.request().url());
        const path = url.pathname;
        const method = route.request().method();
        const send = (value) => fulfill(route, { contentType: "application/json", body: JSON.stringify(value) });
        if (path.endsWith("/sprites/setup/settled")) {
          opened.add(path.split("/").at(-4));
          return send(url.searchParams.get("automatic") ? automatic : state);
        }
        if (path.endsWith("/sprites/setup/save")) {
          const body = route.request().postDataJSON();
          writes.push(body);
          const prior = receipts.get(body.requestId);
          if (prior) {
            assert.deepEqual(body, prior.body, "Retry repeats the exact admitted request");
            return send(prior.saved);
          }
          assert.equal(body.token, state.token);
          assert.equal(body.resident, false);
          state.revision++;
          state.token = "revision-" + state.revision;
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
          state.manager.defaultView = body.defaultView;
          const saved = structuredClone(state);
          receipts.set(body.requestId, { body, saved });
          return writes.length === 2
            ? fulfill(route, {
                status: phone ? 200 : 503,
                contentType: "application/json",
                body: JSON.stringify(phone ? {} : { message: "Save response lost." }),
              })
            : send(saved);
        }
        if (method !== "GET") assert.fail("Unexpected mutation: " + method + " " + path);
        if (path.endsWith("/personas")) return send({ personas: [{ id: "driver", name: "You", isActive: true }] });
        if (path.endsWith("/personas/driver"))
          return send({ persona: { id: "driver", name: "You", description: "A visitor", identity: "A visitor" } });
        if (path.endsWith("/connections"))
          return send({ systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" });
        if (path.endsWith("/catalog")) return send({ characters: catalog });
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
        next = root.getByRole("button", { name: "Next", exact: true });
      for (const reply of ["START", "Next", "Next", "Next", "Next", "Set it up myself"])
        await root.getByRole("button", { name: reply, exact: true }).click();
      await root.getByLabel("Village Name", { exact: true }).fill("Tidebreak");
      await root.getByLabel("First map name", { exact: true }).fill("Harbour");
      await root.getByLabel("Location description", { exact: true }).fill("A village beside the sea.");
      for (const reply of ["Next", "Next", "Next"])
        await root.getByRole("button", { name: reply, exact: true }).click();
      const phase = root.getByRole("list", { name: "Founding phases" }).locator('[aria-current="step"]');
      await expect(phase).toHaveAttribute("aria-label", "Maps");
      if (phone) await next.click();
      const mapImage = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 768;
        return canvas.toDataURL().split(",")[1];
      });
      await root.getByLabel("Upload map image", { exact: true }).setInputFiles({
        name: "map.png",
        mimeType: "image/png",
        buffer: Buffer.from(mapImage, "base64"),
      });
      await expect(root.getByRole("region", { name: "Map artwork preview" })).toBeVisible();
      await next.click();
      await expect(phase).toHaveAttribute("aria-label", "People");
      if (phone && !(await root.getByRole("dialog", { name: "People", exact: true }).count())) await next.click();
      for (const person of people) {
        await root.getByRole("button", { name: "+ Add villager", exact: true }).click();
        const picker = page.getByRole("dialog", { name: "Choose founding villagers", exact: true });
        await expect(picker.getByRole("button", { name: "Close Choose founding villagers" })).toBeFocused();
        const add = picker.getByRole("button", { name: person.name + " · Add", exact: true });
        if (person.id === "mari") {
          const results = picker.getByRole("group", { name: "Choose founding villagers", exact: true });
          await expect(add).not.toBeInViewport();
          await results.hover();
          await page.mouse.wheel(0, 4000);
          await expect(add).toBeInViewport();
          await page.evaluate(() => window.visualViewport.dispatchEvent(new Event("scroll")));
          await expect(picker.getByRole("searchbox")).toBeInViewport({ ratio: 0.99 });
          await expect(picker.getByRole("button", { name: "Done" })).toBeInViewport({ ratio: 0.99 });
          await expect(add).toBeInViewport({ ratio: 0.99 });
        }
        await add.click();
        await expect(picker).toBeHidden();
        await expect(root.getByRole("button", { name: person.name, exact: true })).toBeVisible();
      }
      const row = (name) =>
        root.locator(".villages-selected-villager").filter({
          has: page.getByRole("button", { name, exact: true }),
        });
      const pane = row("Aqua").getByRole("region", { name: "Aqua’s appearance", exact: true });
      await expect(pane.getByRole("button", { name: "Sprites", exact: true })).toHaveAttribute("aria-pressed", "true");
      const avatar = row("Aqua").locator(".marinara-capability-villages-identity-card-face");
      await expect(avatar).toHaveCount(1);
      await expect(pane.locator("img")).toHaveCount(0);
      await expect.poll(() => portraitLoads.length).toBeGreaterThan(0);
      assert.ok(portraitLoads.every((url) => url.searchParams.get("w") === "320" && url.searchParams.get("v") === "7"));
      if (phone) {
        await expect(avatar.locator("img")).toHaveCount(0);
        await expect(avatar.locator("svg")).toBeVisible();
      } else {
        await expect(avatar.locator("img")).toBeVisible();
        await expect(avatar.locator("img")).toHaveAttribute("loading", "lazy");
        await expect(avatar.locator("img")).toHaveCSS("object-fit", "fill");
      }
      assert.equal(spriteLoads, 0, "The compact People row does not download a full sprite");
      await expect(pane.getByText("6 Front · 0 Side", { exact: true })).toBeVisible();
      await expect(pane.getByText("Manage expressions")).toHaveCount(0);
      await expect(pane.getByRole("button", { name: "Save", exact: true })).toHaveCount(0);
      const compactBounds = await row("Aqua").boundingBox();
      await page.screenshot({ path: ".build-tmp/founding-sprites/compact-" + viewport.width + ".png" });
      assert.ok(compactBounds.height < (phone ? 210 : 160), `The compact People row is ${compactBounds.height}px tall`);
      await expect(next).toBeInViewport({ ratio: 0.99 });
      await expect(next).toBeEnabled();
      await next.click();
      await expect(phase).toHaveAttribute("aria-label", "Venues");
      assert.deepEqual([...opened], ["aqua"], "No Appearance action or load for the other resident is needed");
      await root.getByRole("button", { name: "Back", exact: true }).click();
      await expect(phase).toHaveAttribute("aria-label", "People");
      if (phone && !(await root.getByRole("dialog", { name: "People", exact: true }).count())) await next.click();
      await row("Professor Mari").getByRole("button", { name: "Professor Mari", exact: true }).click();
      await expect(row("Professor Mari").getByRole("region", { name: "Professor Mari’s appearance" })).toBeVisible();
      await expect(pane).toHaveCount(0);
      await row("Aqua").getByRole("button", { name: "Aqua", exact: true }).click();
      await pane.getByRole("button", { name: "Review previous appearance", exact: true }).click();
      await expect(pane.getByText("1 Front · 0 Side", { exact: true })).toBeVisible();
      await pane.getByRole("button", { name: "Reload appearance", exact: true }).click();
      await expect(pane.getByText("6 Front · 0 Side", { exact: true })).toBeVisible();
      assert.equal(
        await page.evaluate(() => window.featureController.setupSpriteRevisions.aqua),
        undefined,
        "Opening an older character setup does not adopt it",
      );
      const openPicker = () => pane.getByRole("button", { name: "Assign side-facing sprites" }).click();
      await openPicker();
      const sidePicker = page.getByRole("dialog", { name: "Assign side-facing sprites", exact: true });
      await sidePicker.getByRole("combobox", { name: "Folder" }).selectOption("profile");
      if (phone) {
        for (const name of ["Happy_blush", "Neutral_2", "Thinking"])
          await sidePicker.getByRole("checkbox", { name, exact: true }).check();
      } else await sidePicker.getByRole("button", { name: "Select folder", exact: true }).click();
      const move = sidePicker.getByRole("button", { name: "Move 3 to Side", exact: true });
      await expect(move).toBeInViewport({ ratio: 0.99 });
      assert.equal(writes.length, 0);
      await move.click();
      await expect(sidePicker).toBeHidden();
      await expect(pane.getByText("3 Front · 3 Side", { exact: true })).toBeVisible();
      await expect(next).toBeEnabled();
      assert.equal(writes.length, 1, "The whole batch is saved with one click");
      assert.equal(await page.evaluate(() => window.featureController.setupSpriteRevisions.aqua), 2);
      assert.deepEqual(writes[0].expressions.flatMap((row) => (row.side ? [row.side.filename] : [])).sort(), [
        "happy-side.png",
        "neutral-side.png",
        "thinking-side.png",
      ]);
      assert.equal(writes[0].expressions.filter((row) => row.front).length, 3);
      await page.screenshot({ path: ".build-tmp/founding-sprites/appearance-" + viewport.width + ".png" });
      await openPicker();
      await sidePicker.getByRole("button", { name: "Side (3)", exact: true }).click();
      await sidePicker.getByRole("checkbox", { name: "Happy_blush", exact: true }).check();
      await sidePicker.getByRole("button", { name: "Move 1 to Front", exact: true }).click();
      const retry = sidePicker.getByRole("button", { name: "Retry save", exact: true });
      await expect(retry).toBeEnabled();
      await expect(sidePicker.getByRole("button", { name: "Cancel", exact: true })).toBeDisabled();
      assert.equal(await page.evaluate(() => window.featureController.setupSpriteRevisions.aqua), 2);
      await retry.click();
      await expect(sidePicker).toBeHidden();
      await expect(pane.getByText("4 Front · 2 Side", { exact: true })).toBeVisible();
      await expect(next).toBeEnabled();
      assert.equal(receipts.size, 2);
      assert.equal(writes.length, 3);
      assert.equal(await page.evaluate(() => window.featureController.setupSpriteRevisions.aqua), 3);

      const portrait = pane.getByRole("button", { name: "Portrait", exact: true });
      await portrait.click();
      await expect(portrait).toHaveAttribute("aria-pressed", "true");
      await expect(next).toBeEnabled();
      assert.equal(writes[3].useSprites, false);
      await page.close();
    });
  }
});
console.log("Compact Founding Appearance proceeds untouched, saves a batch, and retries an unacknowledged move.");
