import assert from "node:assert/strict";
import { resolve } from "node:path";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, hasTouch: width === 390 });
    await mockEngineLookups(page);
    const errors = [],
      saves = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const picture = (side, color = "#658b80") =>
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="192"><path fill="${color}" d="M42 57h44l12 128H30z"/>` +
          (side
            ? '<path fill="#c39364" d="M52 13h24v16l10 8-10 5v10H52z"/>'
            : '<circle fill="#c39364" cx="64" cy="32" r="22"/>') +
          "</svg>",
      );
    const files = [
      { filename: "front-a.png", label: "Happy", folderId: null, url: picture(false), version: "100" },
      { filename: "front-b.png", label: "Happy_2", folderId: null, url: picture(false, "#a561c3"), version: "100" },
      ...Array.from({ length: 17 }, (_, index) => ({
        filename: "side-" + (index + 1) + ".png",
        label: index === 16 ? "Happy" : "Happy_" + (index + 1) + "_side",
        folderId: null,
        url: picture(true, "#6192c3"),
        version: "100",
      })),
      { filename: "folder.png", label: "Thinking", folderId: "side", url: picture(true), version: "100" },
    ];
    const current = {
      revision: 0,
      token: "resident-0",
      folders: [
        { id: "front", name: "Front" },
        { id: "side", name: "Side" },
      ],
      files,
      manager: { version: 1, artwork: [], expressions: [], assignments: [], framing: { mode: "full" } },
    };
    await page.route("http://sprite-entry.test/", (route) =>
      fulfill(route, {
        contentType: "text/html",
        body: "<style>html,body{margin:0}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/sprites/**", (route) => {
      const file = files.find((item) => item.filename === new URL(route.request().url()).pathname.split("/").at(-1));
      assert.ok(file);
      return fulfill(route, { contentType: "image/svg+xml", body: decodeURIComponent(file.url.split(",")[1]) });
    });
    await page.route("**/api/villages**", (route) => {
      const path = new URL(route.request().url());
      let value = snapshot;
      if (path.pathname.endsWith("/sprites/setup/settled")) {
        assert.equal(path.searchParams.get("resident"), "true");
        value = current;
      } else if (path.pathname.endsWith("/sprites/setup/save")) {
        const body = route.request().postDataJSON();
        assert.equal(body.resident, true);
        assert.equal(body.token, current.token);
        saves.push(body);
        const rows = body.expressions;
        current.manager.expressions = rows.map(({ id, name }) => ({ id, name }));
        current.manager.assignments = rows.flatMap((row) =>
          ["front", "side"].flatMap((view) =>
            row[view]
              ? [{ expressionId: row.id, view, engineFilename: row[view].filename, version: row[view].version }]
              : [],
          ),
        );
        current.manager.defaultExpressionId = body.defaultExpressionId;
        current.manager.defaultView = body.defaultView;
        current.manager.useSprites = body.useSprites;
        current.token = "resident-" + saves.length;
        value = current;
      } else if (path.pathname.endsWith("/debug/runtime")) value = { showUsageMeter: false };
      else if (path.pathname.endsWith("/rooms/active")) value = { session: null };
      else if (path.pathname.endsWith("/town-map")) value = { image: mapImage };
      else if (path.pathname.endsWith("/catalog")) value = { characters: [] };
      else if (path.pathname.endsWith("/lorebooks")) value = { books: [] };
      else if (path.pathname.endsWith("/personas")) value = { personas: [] };
      return fulfill(route, { contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://sprite-entry.test/");
    await page.evaluate(() => {
      document.querySelector("marinara-capability-villages").capabilityProps = {
        openCharacter: (id, options) => {
          window.engineOpen = [id, options];
        },
      };
    });
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: "More", exact: true }).click();
    await page
      .getByRole("navigation", { name: "Village navigation" })
      .getByRole("button", { name: "People", exact: true })
      .click();
    await page.getByRole("button", { name: "Open Mara profile" }).click();
    await page.getByRole("button", { name: "Character Tools", exact: true }).click();
    const entry = page.getByRole("button", { name: "Appearance", exact: true }).first();
    await entry.focus();
    await page.keyboard.press("Enter");
    const screen = page.getByRole("region", { name: "Mara’s appearance" });
    await expect(screen.getByRole("heading", { name: "Mara’s appearance" })).toBeFocused();
    await expect(screen.getByRole("heading", { name: "Scene portrait" })).toBeVisible();
    const engineLink = screen.getByRole("button", {
      name: "Open Character sprites",
      exact: true,
    });
    await expect(engineLink).toHaveCount(0);
    await screen.getByRole("button", { name: "Sprites", exact: true }).click();
    await screen.getByText("Show expressions", { exact: true }).click();
    await expect(screen.getByText("Hide expressions", { exact: true })).toBeVisible();
    await expect(screen.getByText("No sprites added.")).toBeVisible();
    const add = screen.getByRole("button", { name: "Add sprites", exact: true }).first();
    await add.click();
    const picker = page.getByRole("dialog", { name: "Add sprites", exact: true });
    await expect(picker.getByRole("combobox", { name: "Sprite source" })).toHaveValue("");
    await expect(picker.getByRole("checkbox")).toHaveCount(19);
    for (const checkbox of await picker.getByRole("checkbox").all()) await checkbox.check();
    await picker.getByRole("button", { name: "Add 19 sprites", exact: true }).click();
    const gallery = screen.getByRole("region", { name: "Sprites", exact: true });
    await expect(gallery.getByRole("heading", { name: "Sprites · 19" })).toBeVisible();
    await expect(screen.getByText("Right-facing", { exact: true })).toHaveCount(0);
    await gallery.getByRole("button", { name: "Happy_1_side", exact: true }).click();
    await gallery.getByRole("button", { name: "Set as default", exact: true }).click();
    await engineLink.click();
    await page.getByRole("dialog", { name: "Confirm" }).getByRole("button", { name: "Keep editing" }).click();
    assert.equal(saves.length, 0);
    await screen.getByRole("button", { name: "Save", exact: true }).click();
    await expect(screen.getByRole("status")).toHaveText("Saved");
    assert.equal(saves[0].expressions.length, 19);
    assert.ok(
      saves[0].expressions.every((row) => row.front && !row.side),
      "New sprites have one ordinary assignment",
    );
    await engineLink.click();
    assert.deepEqual(await page.evaluate(() => window.engineOpen), ["mara", { tab: "sprites" }]);
    await screen.getByRole("button", { name: "← Profile", exact: true }).click();
    await expect(entry).toBeFocused();
    const first = current.manager.expressions[0].id;
    current.manager.assignments.push({
      expressionId: first,
      view: "side",
      engineFilename: "folder.png",
      version: "100",
    });
    const retained = structuredClone(current.manager.assignments);
    await entry.click();
    await expect(screen.getByRole("img", { name: "Sprite preview", exact: true })).toBeVisible();
    await screen.getByRole("button", { name: "Portrait", exact: true }).click();
    await screen.getByRole("button", { name: "Save", exact: true }).click();
    await expect(screen.getByRole("status")).toHaveText("Saved");
    assert.deepEqual(
      new Map(current.manager.assignments.map((slot) => [slot.expressionId + ":" + slot.view, slot])),
      new Map(retained.map((slot) => [slot.expressionId + ":" + slot.view, slot])),
      "Saving appearance preserves old paired artwork without a Side editor",
    );
    await screen.getByRole("button", { name: "Sprites", exact: true }).click();
    await screen.getByText("Show expressions", { exact: true }).click();
    await gallery.getByRole("button", { name: "Happy_1_side", exact: true }).click();
    await gallery.getByRole("button", { name: "Remove Happy_1_side from Sprites", exact: true }).click();
    await screen.getByRole("button", { name: "Save", exact: true }).click();
    await expect(screen.getByRole("status")).toHaveText("Saved");
    assert.equal(current.manager.expressions.length, 18);
    assert.ok(
      files.some((file) => file.filename === "side-1.png"),
      "Removing an assignment does not delete source artwork",
    );
    assert.deepEqual(errors, []);
    await page.close();
  }
});
console.log("People uses one sprite gallery and preserves legacy artwork on desktop and phone.");
