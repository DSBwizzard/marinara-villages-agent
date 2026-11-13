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
      { filename: "happy.png", label: "Happy", folderId: "front", url: picture(false), version: "100" },
      { filename: "happy-side.png", label: " FULL_HAPPY.png ", folderId: "side", url: picture(true), version: "100" },
      { filename: "neutral.png", label: "Neutral", folderId: "front", url: picture(false), version: "100" },
      { filename: "neutral-1.png", label: "Neutral", folderId: "side", url: picture(true), version: "100" },
      { filename: "neutral-2.png", label: "NEUTRAL", folderId: "side", url: picture(true), version: "100" },
      { filename: "thinking.png", label: "Thinking", folderId: "front", url: picture(false), version: "100" },
      { filename: "f1.png", label: "Grin_01", folderId: "front", url: picture(false, "#6192c3"), version: "100" },
      { filename: "f2.png", label: "Grin_02", folderId: "front", url: picture(false, "#a561c3"), version: "100" },
      { filename: "s2.png", label: "GRIN_02", folderId: "side", url: picture(true, "#a561c3"), version: "100" },
      { filename: "s1.png", label: "Grin_01", folderId: "side", url: picture(true, "#6192c3"), version: "100" },
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
            current.manager.artwork.push({
              id: choice.filename,
              name: source.label,
              rendered: { url: source.url },
              engineSource: { characterId: "mara", filename: choice.filename },
            });
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
    await expect(screen.getByRole("heading", { name: "Scene portrait" })).toBeVisible();
    const engineLink = screen.getByRole("button", {
      name: "Professor mari reminder to offer help with sprites!!!!!",
      exact: true,
    });
    await expect(engineLink).toHaveCount(0);
    for (const name of ["Add sprite set", "Add sprites manually"]) {
      await expect(screen.getByRole("button", { name, exact: true })).toHaveCount(0);
    }
    await screen.getByRole("button", { name: "Sprites", exact: true }).click();
    await engineLink.click();
    assert.deepEqual(await page.evaluate(() => window.engineOpen), ["mara", { tab: "sprites" }]);
    await screen.getByRole("button", { name: "Sprites", exact: true }).click();

    await screen.getByRole("button", { name: "Add sprite set" }).click();
    const picker = page.getByRole("dialog", { name: "Add sprite set" });
    const frontFolder = picker.getByRole("combobox", { name: "Front folder" });
    const sideFolder = picker.getByRole("combobox", { name: "Side folder" });
    await expect(frontFolder).toHaveValue("folder:front");
    await expect(sideFolder).toHaveValue("folder:side");
    const happy = picker.getByRole("row").filter({ hasText: "Happy" });
    await expect(happy.getByRole("img", { name: "Happy · Front" })).toBeVisible();
    await expect(happy.getByRole("img", { name: "Happy · Side" })).toBeVisible();
    await expect(picker.getByText("Grin · 2 variants", { exact: true })).toBeVisible();
    await expect(picker.getByRole("img", { name: "Grin_01 · Side" })).toHaveAttribute("src", files[9].url);
    await expect(picker.getByRole("img", { name: "Grin_02 · Side" })).toHaveAttribute("src", files[8].url);
    await expect(picker.getByRole("row").filter({ hasText: "Neutral" })).toContainText("Duplicate label");
    await expect(picker.getByRole("row").filter({ hasText: "Thinking" })).toContainText("No match");
    await sideFolder.selectOption("");
    await expect(happy.getByRole("img", { name: "Happy · Side" })).toHaveCount(0);
    await sideFolder.selectOption("folder:side");
    await expect(happy.getByRole("img", { name: "Happy · Side" })).toBeVisible();
    const pairBounds = await picker.getByRole("table").boundingBox();
    assert.ok(pairBounds && pairBounds.x >= 0 && pairBounds.x + pairBounds.width <= width);
    await picker.getByRole("button", { name: "Add to appearance" }).click();
    await screen.getByRole("button", { name: "Grin 2 variants", exact: true }).click();
    await expect(screen.getByRole("img", { name: "Grin_01 · Front" })).toHaveAttribute("src", files[6].url);
    await expect(screen.getByRole("img", { name: "Grin_01 · Side" })).toHaveAttribute("src", files[9].url);
    const variant = screen.getByRole("button", { name: "Variant 02", exact: true });
    await variant.click();
    await expect(variant).toHaveAttribute("aria-pressed", "true");
    await expect(screen.getByRole("img", { name: "Grin_02 · Front" })).toHaveAttribute("src", files[7].url);
    await expect(screen.getByRole("img", { name: "Grin_02 · Side" })).toHaveAttribute("src", files[8].url);
    await expect(screen.getByRole("textbox", { name: "Variant label" })).toHaveValue("Grin_02");
    await screen.getByRole("button", { name: "Neutral Default" }).click();
    await screen.getByRole("button", { name: "+ Add side view", exact: true }).click();
    const side = page.getByRole("dialog", { name: "Side view for Neutral" });
    await expect(side.getByRole("combobox", { name: "Sprite folder" })).toHaveValue("folder:side");
    await side.getByRole("radio", { name: "Neutral", exact: true }).first().check();
    await side.getByRole("button", { name: "Use as side view" }).click();
    await screen.getByRole("button", { name: "Happy", exact: true }).click();
    await expect(screen.getByRole("img", { name: "Happy · Front" })).toHaveAttribute("src", files[0].url);
    await expect(screen.getByRole("img", { name: "Happy · Side" })).toHaveAttribute("src", files[1].url);
    const frontBounds = await screen.getByRole("img", { name: "Happy · Front" }).boundingBox();
    const sideBounds = await screen.getByRole("img", { name: "Happy · Side" }).boundingBox();
    assert.ok(frontBounds && sideBounds && sideBounds.x > frontBounds.x && sideBounds.x + sideBounds.width <= width);
    assert.ok(Math.abs(frontBounds.y - sideBounds.y) < 1, "The paired artwork aligns at the top");
    const expressionName = screen.getByRole("textbox", { name: "Expression name" });
    const fields = await expressionName.boundingBox();
    assert.ok(fields && fields.y < frontBounds.y && fields.x + fields.width <= width);
    await expect(expressionName).toHaveValue("Happy");
    await expressionName.fill("Joyful");
    await engineLink.click();
    const confirm = page.getByRole("dialog", { name: "Confirm" });
    await expect(confirm).toContainText("Discard unsaved appearance changes?");
    await confirm.getByRole("button", { name: "Keep editing" }).click();
    await screen.getByRole("button", { name: "Set as default" }).click();
    await expect(screen.getByRole("button", { name: "Joyful Default" })).toHaveAttribute("aria-pressed", "true");
    assert.equal(saves.length, 0, "Picker choices do not write until Save");
    await screen.getByRole("button", { name: "Save", exact: true }).click();
    await expect(screen.getByRole("status")).toHaveText("Saved");
    assert.equal(saves[0].expressions.length, 5);
    assert.equal(saves[0].expressions[0].name, "Joyful");
    assert.equal(saves[0].defaultExpressionId, saves[0].expressions[0].id);
    assert.equal(saves[0].expressions[0].side.filename, "happy-side.png");
    assert.equal(saves[0].expressions[1].side.filename, "neutral-1.png");
    assert.equal(saves[0].expressions[2].side, undefined);
    assert.deepEqual(
      saves[0].expressions.slice(3).map((row) => [row.name, row.front.filename, row.side.filename]),
      [
        ["Grin_01", "f1.png", "s1.png"],
        ["Grin_02", "f2.png", "s2.png"],
      ],
    );
    await screen.getByRole("button", { name: "Add sprite set" }).click();
    await expect(picker).toContainText("5 front sprites already in use.");
    await expect(picker.getByRole("button", { name: "Add to appearance" })).toBeDisabled();
    await picker.getByRole("button", { name: "Cancel", exact: true }).click();
    await screen.getByRole("button", { name: "Remove side view" }).click();
    await expect(screen.getByRole("button", { name: "+ Add side view" })).toBeVisible();
    await screen.getByRole("button", { name: "Remove expression" }).click();
    await expect(screen.getByRole("button", { name: /^Joyful/ })).toHaveCount(0);
    await screen.getByRole("button", { name: "Discard changes" }).click();
    await screen.getByRole("button", { name: "Grin 2 variants", exact: true }).click();
    await variant.click();
    await screen.getByRole("button", { name: "Remove variant", exact: true }).click();
    await expect(screen.getByRole("button", { name: "Grin_01", exact: true })).toBeVisible();
    await screen.getByRole("button", { name: "Discard changes" }).click();
    await expect(screen.getByRole("button", { name: "Grin 2 variants", exact: true })).toBeVisible();
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
