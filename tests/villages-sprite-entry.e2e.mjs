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
    const picture = (side) =>
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="192"><path fill="#658b80" d="M42 57h44l12 128H30z"/>' +
          (side
            ? '<path fill="#c39364" d="M52 13h24v16l10 8-10 5v10H52z"/>'
            : '<circle fill="#c39364" cx="64" cy="32" r="22"/>') +
          "</svg>",
      );
    const files = [
      { filename: "happy.png", label: "Happy", folderId: "front", url: picture(false), version: "100" },
      { filename: "happy-side.png", label: "Happy profile", folderId: "side", url: picture(true), version: "100" },
    ];
    const current = {
      revision: 0,
      token: "resident-0",
      folders: [
        { id: "front", name: "Front sprites" },
        { id: "side", name: "Side sprites" },
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
        for (const row of rows) {
          for (const view of ["front", "side"]) {
            const choice = row[view];
            if (!choice?.filename) continue;
            const source = files.find((file) => file.filename === choice.filename);
            assert.equal(choice.version, source.version);
            current.manager.artwork.push({ id: choice.filename, name: source.label, rendered: { url: source.url } });
          }
        }
        current.manager.expressions = rows.map(({ id, name }) => ({ id, name }));
        current.manager.assignments = rows.flatMap((row) =>
          ["front", "side"].flatMap((view) =>
            row[view] ? [{ expressionId: row.id, view, artworkId: row[view].artworkId ?? row[view].filename }] : [],
          ),
        );
        current.manager.defaultExpressionId = body.defaultExpressionId;
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
    await screen.getByRole("button", { name: "Edit art in Engine" }).click();
    assert.deepEqual(await page.evaluate(() => window.engineOpen), ["mara", { tab: "sprites" }]);

    await screen.getByRole("button", { name: "Choose from Engine" }).click();
    const picker = page.getByRole("dialog", { name: "Choose from Engine" });
    await picker.getByRole("combobox", { name: "Sprite folder" }).selectOption("front");
    await picker.getByRole("checkbox", { name: "Happy", exact: true }).check();
    await picker.getByRole("button", { name: "Add 1 sprite", exact: true }).click();
    await screen.getByRole("button", { name: "+ Add side view", exact: true }).click();
    const side = page.getByRole("dialog", { name: "Side view for Happy" });
    await side.getByRole("radio", { name: "Happy profile", exact: true }).check();
    await side.getByRole("button", { name: "Use as side view" }).click();
    await expect(screen.getByRole("img", { name: "Happy · Front" })).toHaveAttribute("src", files[0].url);
    await expect(screen.getByRole("img", { name: "Happy · Side" })).toHaveAttribute("src", files[1].url);
    const frontBounds = await screen.getByRole("img", { name: "Happy · Front" }).boundingBox();
    const sideBounds = await screen.getByRole("img", { name: "Happy · Side" }).boundingBox();
    assert.ok(frontBounds && sideBounds && sideBounds.x > frontBounds.x && sideBounds.x + sideBounds.width <= width);
    assert.equal(saves.length, 0, "Picker choices do not write until Save");
    await screen.getByRole("button", { name: "Save", exact: true }).click();
    await expect(screen.getByRole("status")).toHaveText("Saved");
    assert.equal(saves[0].expressions.length, 1);
    assert.equal(saves[0].expressions[0].side.filename, "happy-side.png");
    await screen.getByRole("button", { name: "Portrait", exact: true }).click();
    await screen.getByRole("button", { name: "Save", exact: true }).click();
    await expect(screen.getByRole("status")).toHaveText("Saved");
    assert.equal(saves[1].expressions[0].side.artworkId, "happy-side.png");
    await screen.getByRole("button", { name: "← Profile", exact: true }).click();
    await expect(entry).toBeFocused();
    assert.deepEqual(errors, []);
    await page.close();
  }
});
console.log("People Appearance pairs Front and Side, opens Engine, and saves on desktop and phone.");
