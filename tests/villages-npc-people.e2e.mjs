// Test cases: npc-people/desktop, npc-people/phone
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as base } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const [name, width] of [
    ["desktop", 1440],
    ["phone", 390],
  ])
    await runCase("npc-people/" + name, async () => {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      await mockEngineLookups(page);
      const village = structuredClone(base);
      village.npcs = Array.from({ length: 6 }, (_, i) => ({
        characterId: "npc:seed-" + i,
        name: "Local " + i,
        mapId: "map",
        mapName: "Town",
        met: i === 0,
        appearance: i === 0 ? "A red suit and round glasses." : "",
      }));
      village.npcPreparation = [{ mapId: "map", mapName: "Town", status: "ready" }];
      let memoryReads = 0;
      await page.route("**/api/capability-packages/villages/assets/npc-silhouette.webp", (route) =>
        route.fulfill({ path: resolve("packages/villages/npc-silhouette.webp") }),
      );
      await page.route("**/api/villages**", async (route) => {
        const url = new URL(route.request().url());
        if (url.pathname.endsWith("/rooms/active")) return fulfill(route, { json: { session: null } });
        if (url.pathname.endsWith("/memories/inspect")) {
          memoryReads++;
          assert.equal(url.searchParams.get("characterId"), "npc:seed-0");
          return fulfill(route, {
            json: {
              inspection: true,
              seed: village.seed,
              characterId: "npc:seed-0",
              revision: 1,
              query: "",
              residents: [{ id: "npc:seed-0", name: "Local 0" }],
              entries: [
                {
                  id: "memory",
                  revision: 1,
                  kind: "information",
                  text: "PRIVATE_NPC_BICYCLE_MEMORY",
                  occurredAt: "2026-11-21T12:00:00.000Z",
                  recordedAt: "2026-11-21T12:00:00.000Z",
                  subjects: [],
                  knownBy: [],
                },
              ],
              total: 1,
              next: null,
            },
          });
        }
        if (/\/greet|\/turn|\/npcs\/prepare|\/agendas/.test(url.pathname))
          throw Error("NPC browsing must not generate or request Agendas");
        return fulfill(route, { json: village });
      });
      await page.route("http://npc-people.test/", (route) =>
        fulfill(route, {
          contentType: "text/html",
          body: "<style>html,body{margin:0;height:100vh;overflow:hidden}marinara-capability-villages{display:block;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
        }),
      );
      await page.goto("http://npc-people.test/");
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await page
        .getByRole("navigation", { name: "Village exploration" })
        .getByRole("button", { name: "People", exact: true })
        .click();
      const sections = page.getByRole("navigation", { name: "People sections" });
      await expect(sections.getByRole("button")).toHaveText(["Villagers", "Visitors", "NPCs"]);
      await sections.getByRole("button", { name: "NPCs", exact: true }).click();
      assert(
        await sections.evaluate((nav) =>
          [...nav.querySelectorAll("button")].every((button) => {
            const bounds = button.getBoundingClientRect(),
              parent = nav.getBoundingClientRect();
            return bounds.left >= parent.left && bounds.right <= parent.right + 1;
          }),
        ),
        "all three People tabs fit their directory",
      );
      const directory = page.getByRole("main", { name: "NPCs directory" });
      await expect(directory.getByRole("button", { name: /Open Local .* profile/ })).toHaveCount(4);
      await directory.getByRole("button", { name: "Next people page" }).click();
      await expect(directory.getByRole("button", { name: /Open Local .* profile/ })).toHaveCount(2);
      await directory.getByRole("searchbox", { name: "Find a person" }).fill("Local 0");
      await directory.getByRole("button", { name: "Open Local 0 profile" }).click();
      const profile = page.getByRole("region", { name: "Local 0 profile" });
      await expect(profile.getByRole("heading", { name: "Local 0", exact: true })).toBeVisible();
      await expect(profile.getByText("A red suit and round glasses.")).toBeVisible();
      assert.equal(memoryReads, 0);
      await expect(page.getByText("PRIVATE_NPC_BICYCLE_MEMORY")).toHaveCount(0);
      if (name === "phone")
        await profile.getByRole("combobox", { name: "Section", exact: true }).selectOption("memories");
      else await profile.getByRole("button", { name: "Inspect memories", exact: true }).click();
      await expect(profile.getByText("PRIVATE_NPC_BICYCLE_MEMORY")).toBeVisible();
      await expect(profile.getByRole("button", { name: "Correct", exact: true })).toBeVisible();
      if (name === "phone")
        await profile.getByRole("combobox", { name: "Section", exact: true }).selectOption("overview");
      else await profile.getByRole("button", { name: "Overview", exact: true }).click();
      await expect(profile.getByText("PRIVATE_NPC_BICYCLE_MEMORY")).toHaveCount(0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      mkdirSync(".build-tmp/npc-people", { recursive: true });
      await page.screenshot({ path: ".build-tmp/npc-people/" + name + ".png", fullPage: true });
      await page.close();
    });
});
