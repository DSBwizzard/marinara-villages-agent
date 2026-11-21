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
      village.worldScope = "a".repeat(64);
      const people = Array.from({ length: 6 }, (_, i) => ({
        characterId: "npc:person-" + i,
        name: i === 0 ? "Man in a red suit" : "Acquaintance " + i,
        at: `2026-11-${String(21 - i).padStart(2, "0")}T12:00:00.000Z`,
        placeName: "Old Mill Market",
        excerpt: i === 0 ? "I can look at your bicycle." : "See you around.",
      }));
      let memoryReads = 0,
        historyReads = 0,
        blockedSearch;
      const blocked = new Promise((resolve) => {
        blockedSearch = resolve;
      });
      await page.route("**/api/villages**", async (route) => {
        const url = new URL(route.request().url());
        if (url.pathname.endsWith("/rooms/active")) return fulfill(route, { json: { session: null } });
        if (url.pathname.endsWith("/memories/inspect")) {
          memoryReads++;
          throw Error("NPC browsing cannot inspect private memories");
        }
        if (url.pathname.endsWith("/npcs")) {
          assert.equal(url.searchParams.get("scope"), village.worldScope);
          const query = url.searchParams.get("query") ?? "";
          if (query === "stale") await blocked;
          const filtered = people.filter((person) => person.name.toLowerCase().includes(query.toLowerCase()));
          const offset = Number(url.searchParams.get("cursor")?.split(":")[1] ?? 0);
          return fulfill(route, {
            json: {
              scope: village.worldScope,
              revision: "b".repeat(64),
              items: filtered.slice(offset, offset + 4),
              nextCursor: offset + 4 < filtered.length ? "b".repeat(64) + ":4" : null,
            },
          });
        }
        if (url.pathname.endsWith("/encounters")) {
          historyReads++;
          assert(url.pathname.includes("npc%3Aperson-0"));
          return fulfill(route, {
            json: {
              scope: village.worldScope,
              revision: "c".repeat(64),
              nextCursor: null,
              items: [
                {
                  id: "latest",
                  at: people[0].at,
                  placeName: "Old Mill Market",
                  lines: [{ speaker: "Man in a red suit", text: "I can look at your bicycle." }],
                },
                {
                  id: "earlier",
                  at: "2026-11-20T12:00:00.000Z",
                  placeName: "Willow Café",
                  lines: [
                    { speaker: "You", text: "The wheel is bent." },
                    { speaker: "Man in a red suit", text: "Bring it tomorrow." },
                  ],
                },
              ],
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
          body: "<style>html,body{margin:0;height:100vh;overflow:hidden}marinara-capability-villages{display:block;height:100%}</style><marinara-capability-villages>",
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
        "all tabs fit",
      );
      const directory = page.getByRole("main", { name: "NPCs directory" });
      const rows = directory.locator("article > button[aria-expanded]");
      await expect(rows).toHaveCount(4);
      await expect(rows.first()).toContainText("Man in a red suit");
      assert.equal(historyReads, 0);
      await directory.getByRole("button", { name: "Next people page" }).click();
      await expect(rows).toHaveCount(2);
      await directory.getByRole("button", { name: "Previous people page" }).click();
      await directory.getByRole("button", { name: "Encounters with Man in a red suit", exact: true }).click();
      const history = directory.getByRole("region", { name: "Encounters with Man in a red suit" });
      await expect(history.getByText("Bring it tomorrow.", { exact: false })).toBeVisible();
      await expect(history.getByText("The wheel is bent.", { exact: false })).toBeVisible();
      await expect(history.locator("article")).toHaveCount(2);
      assert.equal(memoryReads, 0);
      await expect(page.getByRole("button", { name: /Track|Untrack|Inspect memories|Open .* profile/ })).toHaveCount(0);
      const search = directory.getByRole("searchbox", { name: "Find a person" });
      await search.fill("stale");
      await search.fill("Acquaintance 5");
      await expect(rows).toHaveCount(1);
      blockedSearch();
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toContainText("Acquaintance 5");
      await search.fill("");
      await expect(rows).toHaveCount(4);
      const nextPage = directory.getByRole("button", { name: "Next people page" });
      await nextPage.scrollIntoViewIfNeeded();
      assert(
        await nextPage.evaluate((button) => {
          const bounds = button.getBoundingClientRect(),
            area = button.closest("main").getBoundingClientRect();
          return bounds.top >= area.top && bounds.bottom <= area.bottom + 1;
        }),
        "all rows and paging remain reachable in the scrolling list",
      );
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      mkdirSync(".build-tmp/npc-people", { recursive: true });
      await page.screenshot({ path: ".build-tmp/npc-people/" + name + ".png", fullPage: true });
      await page.close();
    });
});
