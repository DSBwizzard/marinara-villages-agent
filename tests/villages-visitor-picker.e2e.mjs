import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as base, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const [width, panelWidth] of [
    [1440, 1440],
    [390, 390],
    [1200, 500],
  ]) {
    const pageSize = panelWidth <= 700 ? 4 : 8;
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
        body: `<style>html,body{margin:0;height:100vh;overflow:hidden}#engine-header{display:block;height:160px;width:100%;border:0}#engine-content{height:calc(100vh - 160px);width:${panelWidth}px;max-width:100%}marinara-capability-villages{display:block;height:100%}</style><button id="engine-header" onclick="this.dataset.clicked='true'">Engine Header</button><div id="engine-content"><marinara-capability-villages></marinara-capability-villages></div>`,
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
    await expect(choices.getByRole("button")).toHaveCount(pageSize);
    await expect(dialog.getByText("Choose a Character Card", { exact: true })).toHaveCount(0);
    const pages = dialog.getByRole("navigation", { name: "Character Card pages" });
    await expect(pages).toContainText(`1 / ${Math.ceil(20 / pageSize)}`);
    await expect(pages.getByRole("button", { name: "Previous Character Card page" })).toBeDisabled();
    await pages.getByRole("button", { name: "Next Character Card page" }).click();
    await expect(choices.getByRole("button")).toHaveCount(pageSize);
    await expect(choices.getByRole("button", { name: "Feddy Fastbayer", exact: true })).toHaveCount(0);
    await pages.getByRole("button", { name: "Previous Character Card page" }).click();
    await page.getByRole("button", { name: "Engine Header", exact: true }).click();
    await expect(page.locator("#engine-header")).toHaveAttribute("data-clicked", "true");
    await expect(dialog).toBeVisible();
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
    await expect(choices.getByRole("button")).toHaveCount(pageSize);
    await expect(choices.getByRole("button", { name: "Feddy Fastbayer", exact: true })).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Add Visitor", exact: true })).toBeDisabled();
    const footer = await dialog.getByRole("button", { name: "Add Visitor", exact: true }).boundingBox();
    const bounds = await dialog.boundingBox();
    assert(
      bounds.x >= 0 && bounds.y >= 160 && bounds.x + bounds.width <= panelWidth + 1,
      "Picker stays inside Villages below Engine headers: " +
        JSON.stringify({
          width,
          panelWidth,
          bounds,
          scope: await page.locator(".marinara-capability-villages-desk-workspace").boundingBox(),
          host: await page.locator("marinara-capability-villages").boundingBox(),
        }),
    );
    assert(footer.y + footer.height <= 844, "Save stays visible with a long library");
    assert(await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth), "No sideways scrolling");
    assert(await dialog.evaluate((node) => node.scrollHeight <= node.clientHeight + 1), "Dialog never scrolls");
    const body = dialog.locator(".marinara-capability-villages-visitor-picker-body");
    assert(await body.evaluate((node) => node.scrollHeight <= node.clientHeight + 1), "Card list never scrolls");
    while (await pages.getByRole("button", { name: "Next Character Card page" }).isEnabled())
      await pages.getByRole("button", { name: "Next Character Card page" }).click();
    await expect(choices.getByRole("button")).toHaveCount(3);
    await search.fill("No Portrait");
    await expect(choices.getByRole("button")).toHaveCount(1);
    await expect(pages).toHaveCount(0);
    await search.fill("");
    await expect(pages).toContainText(`1 / ${Math.ceil(19 / pageSize)}`);
    mkdirSync(".build-tmp/visitor-picker", { recursive: true });
    await page.screenshot({ path: `.build-tmp/visitor-picker/${panelWidth}.png` });
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Add Visitor", exact: true })).toBeFocused();
    await page.close();
  }
});
