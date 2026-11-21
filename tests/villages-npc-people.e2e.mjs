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
        name: i === 0 ? "Tomas Reed" : "Acquaintance " + i,
        role: i === 0 ? "Parts trader" : "Baker",
        appearance:
          i === 0
            ? "A lanky man in a red suit with a charcoal waistcoat and a neat silver pocket watch."
            : "A blue coat.",
        personality:
          i === 0
            ? "A courteous traveling parts trader who enjoys discussing well-made machinery; he is a customer at Feddy’s garage, not its owner."
            : "Quiet and patient.",
        at: `2026-11-${String(21 - i).padStart(2, "0")}T12:00:00.000Z`,
        placeName: "Feddy Fastbayer’s Garage",
      }));
      let blockedSearch,
        denyNpcRead = false,
        holdNpcRead = false,
        releaseNpcRead,
        badScope = false;
      const blocked = new Promise((resolve) => {
        blockedSearch = resolve;
      });
      await page.route("**/api/villages**", async (route) => {
        const url = new URL(route.request().url());
        if (url.pathname.endsWith("/rooms/active")) return fulfill(route, { json: { session: null } });
        if (/\/encounters$|\/memories\/inspect|\/greet|\/turn|\/npcs\/prepare|\/agendas/.test(url.pathname))
          throw Error("NPC overview must not request transcripts, private Memories, generation or Agendas");
        if (url.pathname.endsWith("/mailbox"))
          return fulfill(route, { status: 403, json: { message: "Mailbox access temporarily unavailable." } });
        if (url.pathname.endsWith("/npcs")) {
          assert.equal(url.searchParams.get("scope"), village.worldScope);
          if (denyNpcRead) {
            denyNpcRead = false;
            return fulfill(route, { status: 403, json: { message: "NPC access temporarily unavailable." } });
          }
          if (holdNpcRead)
            await new Promise((resolve) => {
              releaseNpcRead = resolve;
            });
          const query = url.searchParams.get("query") ?? "";
          if (query === "stale") await blocked;
          const filtered = people.filter((person) => person.name.toLowerCase().includes(query.toLowerCase()));
          const offset = Number(url.searchParams.get("cursor")?.split(":")[1] ?? 0);
          const scope = badScope ? "d".repeat(64) : village.worldScope;
          badScope = false;
          return fulfill(route, {
            json: {
              scope,
              revision: "b".repeat(64),
              items: filtered.slice(offset, offset + 4),
              nextCursor: offset + 4 < filtered.length ? "b".repeat(64) + ":4" : null,
            },
          });
        }
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
      const tabs = page.getByRole("navigation", { name: "People sections" });
      await expect(tabs.getByRole("button")).toHaveText(["Villagers", "Visitors", "NPCs"]);
      await tabs.getByRole("button", { name: "NPCs", exact: true }).click();
      const directory = page.getByRole("main", { name: "NPCs directory" });
      const rows = directory.locator("article > button[aria-pressed]");
      await expect(rows).toHaveCount(4);
      await expect(rows.first()).toContainText("Tomas Reed");
      await directory.getByRole("button", { name: "Next people page" }).click();
      await expect(rows).toHaveCount(2);
      await directory.getByRole("button", { name: "Previous people page" }).click();
      await directory.getByRole("button", { name: "View Tomas Reed", exact: true }).click();
      const overview = directory.getByRole("region", { name: "Tomas Reed overview" });
      await expect(overview.getByRole("heading", { name: "Tomas Reed", exact: true })).toBeVisible();
      await expect(overview.getByText(people[0].appearance, { exact: true })).toBeVisible();
      await expect(overview.getByText(people[0].personality, { exact: true })).toBeVisible();
      await expect(overview.getByRole("heading", { name: "Last met", exact: true })).toBeVisible();
      await expect(
        directory.getByText(/What you know|Unfinished business|Bring it tomorrow|The wheel is bent/),
      ).toHaveCount(0);
      await expect(page.getByRole("button", { name: /Track|Untrack|Inspect memories|Open .* profile/ })).toHaveCount(0);
      mkdirSync(".build-tmp/npc-people", { recursive: true });
      await page.screenshot({ path: ".build-tmp/npc-people/" + name + "-overview.png", fullPage: true });
      if (name === "phone") {
        await overview.getByRole("heading", { name: "Last met", exact: true }).scrollIntoViewIfNeeded();
        await expect(overview.getByRole("heading", { name: "Last met", exact: true })).toBeInViewport();
        await directory.getByRole("button", { name: "Back to NPCs", exact: true }).click();
        await expect(directory.getByRole("button", { name: "View Tomas Reed", exact: true })).toBeFocused();
      }
      const search = directory.getByRole("searchbox", { name: "Find a person" });
      await search.fill("stale");
      await search.fill("Acquaintance 5");
      await expect(search).toBeFocused();
      await expect(rows).toHaveCount(1);
      blockedSearch();
      await expect(rows.first()).toContainText("Acquaintance 5");
      await search.fill("");
      await expect(rows).toHaveCount(4);
      denyNpcRead = true;
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await expect(directory.getByRole("alert")).toContainText("NPC access temporarily unavailable.");
      await expect(directory.getByText("Reading people…", { exact: true })).toHaveCount(0);
      await expect(rows).toHaveCount(0);
      await expect(directory.getByRole("heading", { name: "Tomas Reed", exact: true })).toHaveCount(0);
      await directory.getByRole("button", { name: "Refresh", exact: true }).click();
      await expect(rows).toHaveCount(4);
      badScope = true;
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await expect(directory.getByRole("alert")).toContainText("The Village changed. Open People again.");
      await expect(rows).toHaveCount(0);
      await directory.getByRole("button", { name: "Refresh", exact: true }).click();
      await expect(rows).toHaveCount(4);
      await page
        .getByRole("navigation", { name: "Village navigation" })
        .getByRole("button", { name: "Mailbox", exact: true })
        .click();
      const mailbox = page.getByRole("dialog", { name: "Mailbox", exact: true });
      await expect(mailbox.getByText("Mailbox access temporarily unavailable.", { exact: true })).toBeVisible();
      holdNpcRead = true;
      await mailbox.getByRole("button", { name: "Close Mailbox", exact: true }).click();
      await expect.poll(() => !!releaseNpcRead).toBe(true);
      await expect(rows).toHaveCount(0);
      holdNpcRead = false;
      releaseNpcRead();
      await expect(rows).toHaveCount(4);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      await page.close();
    });
});
