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
      {
        filename: "f2.png",
        label: "Grin_pajamas_02",
        folderId: "front",
        url: picture(false, "#a561c3"),
        version: "100",
      },
      { filename: "s2.png", label: "GRIN_02", folderId: "side", url: picture(true, "#a561c3"), version: "100" },
      { filename: "s1.png", label: "Grin_01", folderId: "side", url: picture(true, "#6192c3"), version: "100" },
      { filename: "s3.png", label: "Grin_pajamas_04", folderId: "side", url: picture(true, "#d49845"), version: "100" },
    ];
    const loose = { filename: "unfiled.png", label: "Grin_wide", folderId: null, url: picture(false), version: "100" };
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
        current.manager.folders = body.folders;
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
    const frontFolder = screen.getByRole("combobox", { name: "Front folder" });
    const sideFolder = screen.getByRole("combobox", { name: "Side folder" });
    await expect(frontFolder).toHaveCount(0);
    await screen.getByRole("button", { name: "Sprites", exact: true }).click();
    await expect(frontFolder).toHaveValue("front");
    await expect(sideFolder).toHaveValue("side");
    await expect(frontFolder.getByRole("option", { name: "None", exact: true })).toHaveCount(0);
    await engineLink.click();
    const confirm = page.getByRole("dialog", { name: "Confirm" });
    await confirm.getByRole("button", { name: "Keep editing" }).click();
    const grin = screen.getByRole("button", { name: "grin", exact: true });
    await grin.click();
    const front = screen.getByRole("region", { name: "Front", exact: true });
    const side = screen.getByRole("region", { name: "Side", exact: true });
    await expect(front.getByRole("heading", { name: "Front · 2" })).toBeVisible();
    await expect(side.getByRole("heading", { name: "Side · 3" })).toBeVisible();
    await expect(front.getByRole("img", { name: "Grin_pajamas_02 · Front" })).toHaveAttribute("src", files[7].url);
    await expect(side.getByRole("img", { name: "Grin_pajamas_04 · Side" })).toHaveAttribute("src", files[10].url);
    const sideBounds = await side.boundingBox();
    assert.ok(sideBounds && sideBounds.x + sideBounds.width <= width);
    await screen.getByRole("button", { name: "Set as default" }).click();
    assert.equal(saves.length, 0);
    await screen.getByRole("button", { name: "Save", exact: true }).click();
    await expect(screen.getByRole("status")).toHaveText("Saved");
    assert.deepEqual(saves[0].folders, { front: "front", side: "side" });
    assert.equal(saves[0].expressions.length, files.length);
    assert.ok(saves[0].expressions.every((row) => Boolean(row.front) !== Boolean(row.side)));
    assert.equal(saves[0].expressions.filter((row) => row.name.toLowerCase() === "neutral").length, 3);
    await engineLink.click();
    assert.deepEqual(await page.evaluate(() => window.engineOpen), ["mara", { tab: "sprites" }]);
    await frontFolder.selectOption({ label: "No folder" });
    await screen.getByRole("button", { name: "grin", exact: true }).click();
    await expect(front.getByRole("heading", { name: "Front · 0" })).toBeVisible();
    await expect(side.getByRole("heading", { name: "Side · 3" })).toBeVisible();
    await screen.getByRole("button", { name: "Discard changes" }).click();
    await expect(frontFolder).toHaveValue("front");
    await screen.getByRole("button", { name: "← Profile", exact: true }).click();
    await expect(entry).toBeFocused();
    await entry.click();
    await expect(frontFolder).toHaveValue("front");
    await expect(sideFolder).toHaveValue("side");
    files.push(loose);
    await screen.getByRole("button", { name: "Refresh folders" }).click();
    await frontFolder.selectOption({ label: "No folder" });
    await sideFolder.selectOption({ label: "No folder" });
    await expect(front.getByRole("img", { name: "Grin_wide · Front" })).toBeVisible();
    await expect(side.getByRole("img", { name: "Grin_wide · Side" })).toBeVisible();
    await screen.getByRole("button", { name: "Save", exact: true }).click();
    await expect(screen.getByRole("status")).toHaveText("Saved");
    assert.deepEqual(saves[1].folders, { front: "", side: "" });
    assert.deepEqual(
      saves[1].expressions.map((row) => row.front?.filename ?? row.side?.filename),
      [loose.filename, loose.filename],
    );
    assert.deepEqual(errors, []);
    await page.close();
  }
});
console.log("People Appearance groups independent Front and Side folder sprites on desktop and phone.");
