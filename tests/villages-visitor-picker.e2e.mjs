import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as base, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await mockEngineLookups(page);
    const village = structuredClone(base);
    village.village.instant = "2026-11-20T13:00:00.000Z";
    village.worldScope = "a".repeat(64);
    village.settings.playerPersonaId = "player-card";
    village.visitors = [
      { ...village.villagers[0], characterId: "mari", name: "Professor Mari", met: true, visitsEnabled: true },
    ];
    const cards = [
      { id: village.villagers[0].characterId, name: "Existing Villager" },
      { id: "mari", name: "Professor Mari" },
      { id: "player-card", name: "Player Card" },
      { id: "another-world", name: "Another Village", inVillage: true },
      { id: "feddy", name: "Feddy Fastbayer" },
      { id: "no-portrait", name: "No Portrait" },
      ...Array.from({ length: 18 }, (_, i) => ({ id: "card-" + i, name: "Character " + i })),
    ].map((card) => ({ comment: "", summary: "", tags: [], inVillage: false, ...card }));
    let catalogReads = 0;
    let saves = 0;
    let releaseSave;
    await page.route("**/api/characters/summaries", async (route) => {
      const { ids } = route.request().postDataJSON();
      await fulfill(route, {
        json: ids.filter((id) => id !== "no-portrait").map((id) => ({ id, avatarUrl: mapImage, avatarCrop: null })),
      });
    });
    await page.route("**/api/villages**", async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (path.endsWith("/catalog")) {
        catalogReads++;
        return fulfill(
          route,
          catalogReads === 1
            ? { status: 503, json: { error: "Cards could not be loaded." } }
            : { json: { characters: cards } },
        );
      }
      if (path.endsWith("/visitors/feddy")) {
        assert.equal(request.method(), "PUT");
        assert.deepEqual(request.postDataJSON(), { scope: village.worldScope, enabled: true });
        saves++;
        if (saves === 1)
          return fulfill(route, { status: 409, json: { error: "The Village changed. Refresh People." } });
        await new Promise((done) => {
          releaseSave = done;
        });
        village.visitors.push({
          ...village.villagers[0],
          characterId: "feddy",
          name: "Feddy Fastbayer",
          met: false,
          visitsEnabled: true,
        });
      } else if (path.endsWith("/rooms/active")) return fulfill(route, { json: { session: null } });
      else if (/\/greet|\/turn|\/interpret/.test(path)) throw Error("Picker must not generate dialogue");
      await fulfill(route, { json: village });
    });
    await page.route("http://visitor-picker.test/", (route) =>
      fulfill(route, {
        contentType: "text/html",
        body: "<style>html,body{margin:0}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.goto("http://visitor-picker.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page
      .getByRole("navigation", { name: "Village exploration" })
      .getByRole("button", { name: "People", exact: true })
      .click();
    await page.getByRole("button", { name: "Visitors", exact: true }).click();
    await page.getByRole("button", { name: "Add Visitor", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Add Visitor", exact: true });
    await expect(dialog.getByRole("alert")).toHaveText("Cards could not be loaded.");
    await dialog.getByRole("button", { name: "Retry cards" }).click();
    const choices = dialog.getByRole("group", { name: "Available Character Cards" });
    await expect(choices.getByRole("button")).toHaveCount(20);
    await expect(choices.getByRole("button", { name: "No Portrait", exact: true })).toContainText("N");
    await expect(choices.getByRole("button", { name: "Feddy Fastbayer", exact: true }).locator("img")).toBeVisible();
    const search = dialog.getByRole("searchbox", { name: "Find a Character Card" });
    await search.fill("nobody");
    await expect(dialog.getByText("No matching Character Cards.")).toBeVisible();
    await search.fill(" FEDDY ");
    const feddy = dialog.getByRole("button", { name: "Feddy Fastbayer", exact: true });
    await feddy.click();
    await expect(feddy).toHaveAttribute("aria-pressed", "true");
    const submit = dialog.getByRole("button", { name: "Add Visitor", exact: true });
    await submit.click();
    await expect(dialog.getByRole("alert")).toHaveText("The Village changed. Refresh People.");
    await expect(feddy).toHaveAttribute("aria-pressed", "true");
    await submit.click();
    await expect(dialog.getByRole("button", { name: "Adding…", exact: true })).toBeDisabled();
    await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeDisabled();
    assert.equal(saves, 2);
    releaseSave();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open Feddy Fastbayer profile" })).toBeVisible();
    await page.getByRole("button", { name: "Add Visitor", exact: true }).click();
    await expect(choices.getByRole("button")).toHaveCount(19);
    await expect(choices.getByRole("button", { name: "Feddy Fastbayer", exact: true })).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Add Visitor", exact: true })).toBeDisabled();
    const footer = await dialog.getByRole("button", { name: "Add Visitor", exact: true }).boundingBox();
    const bounds = await dialog.boundingBox();
    assert(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= width + 1);
    assert(footer.y + footer.height <= 844, "Save stays visible with a long library");
    assert(await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth), "No sideways scrolling");
    mkdirSync(".build-tmp/visitor-picker", { recursive: true });
    await page.screenshot({ path: `.build-tmp/visitor-picker/${width}.png` });
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Add Visitor", exact: true })).toBeFocused();
    await page.close();
  }
});
