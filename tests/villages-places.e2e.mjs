// Test cases: places/desktop, places/phone
import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { projectSnapshot } from "./fixtures/villages-project-browser.fixture.mjs";
import { mkdir } from "node:fs/promises";
const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `import {useState} from "react";import {createRoot} from "react-dom/client";import {PlacesDirectory} from "./packages/villages/src/client/features/exploration/PlacesDirectory.js";import {syncVillagesStyles} from "./packages/villages/src/client/entry/styles.js";syncVillagesStyles();function App(){const [search,onSearch]=useState("");return <PlacesDirectory snapshot={window.snapshot} mapId="map" mobile={innerWidth<600} search={search} onSearch={onSearch} focusSearch={false} sceneActive={false} onClose={()=>window.closed=true} onVisit={place=>window.visited=place.id} onVenue={place=>window.venue=place.id} onAdmit={place=>window.admission={id:place.id}}/>}createRoot(document.getElementById("root")).render(<App/>);`,
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
await mkdir(".build-tmp/places", { recursive: true });
await withBrowser(browser, async () => {
  for (const [name, width] of [
    ["desktop", 1440],
    ["phone", 390],
  ])
    await runCase("places/" + name, async () => {
      const page = await browser.newPage({ viewport: { width, height: 800 } });
      await mockEngineLookups(page);
      const snapshot = projectSnapshot();
      snapshot.worldScope = "world:test";
      const place = {
        id: "place:lantern",
        revision: 1,
        name: "The Lantern",
        description: "A restaurant at the square.",
        mapId: "map",
        x: null,
        y: null,
        report: false,
        visited: false,
        venue: false,
        location: { ...snapshot.settings.venues[0], id: "place:lantern", name: "The Lantern" },
      };
      const venue = { ...place, id: snapshot.settings.venues[0].id, name: "Village Hall", venue: true, visited: true };
      const explorations = [],
        paths = [];
      await page.route("http://places.test/", (route) =>
        fulfill(route, {
          status: 200,
          contentType: "text/html",
          body: '<style>html,body{margin:0;background:#16233a;color:#eee;font-family:Arial}:root{--background:#16233a;--foreground:#eee;--border:#718297;--popover:#24334c;--muted-foreground:#ddd}#root{height:100vh;position:relative}</style><marinara-capability-villages><div class="marinara-capability-villages-root" id="root"></div></marinara-capability-villages>',
        }),
      );
      await page.route("**/api/villages/**", async (route) => {
        const url = new URL(route.request().url()),
          path = url.pathname.replace(/^.*\/api\/villages/, "");
        paths.push(path);
        let value;
        if (path === "/places")
          value = {
            items: [venue, place, { ...venue, id: "late", name: "New Venue" }].filter((row) =>
              row.name.toLowerCase().includes((url.searchParams.get("query") ?? "").trim().toLowerCase()),
            ),
            nextCursor: null,
          };
        else if (path === "/places/explore") {
          explorations.push(route.request().postDataJSON());
          value = { status: explorations.length === 1 ? "failed" : "ready", placeId: "" };
        } else if (path === "/places/place%3Alantern" || path === "/places/place:lantern") value = place;
        else throw Error("Unexpected Places route " + path);
        await fulfill(route, { status: 200, json: value });
      });
      await page.goto("http://places.test/");
      await page.evaluate((value) => (window.snapshot = value), snapshot);
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      await expect(page.getByRole("complementary", { name: "Places navigator" })).toBeVisible();
      await page.getByRole("button", { name: "Village Hall · Venue", exact: true }).click();
      await expect.poll(() => page.evaluate(() => window.venue)).toBe(venue.id);
      await page.getByLabel("Search places", { exact: true }).fill(" Lantern ");
      await expect(page.getByRole("button", { name: "The Lantern · Place", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "The Lantern · Place", exact: true }).click();
      await expect(page.getByRole("button", { name: "Add as Venue", exact: true })).toHaveCount(0);
      await page.getByRole("button", { name: "Visit", exact: true }).click();
      await expect.poll(() => page.evaluate(() => window.visited)).toBe(place.id);
      assert(!paths.some((path) => path.endsWith("/prepare")), "Visit delegates first arrival to ordinary Scene entry");
      place.visited = true;
      place.classified = true;
      await page.getByRole("button", { name: "The Lantern · Place", exact: true }).click();
      await page.getByRole("button", { name: "Add as Venue", exact: true }).click();
      await expect(page.getByRole("checkbox")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Choose map position", exact: true })).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => window.admission)).toEqual({ id: place.id });
      await page.getByRole("button", { name: "Explore", exact: true }).click();
      const submit = page
        .locator("form")
        .filter({ has: page.getByLabel("Explore", { exact: true }) })
        .getByRole("button", { name: "Explore", exact: true });
      await submit.click();
      await expect.poll(() => explorations.length).toBe(1);
      await expect(submit).toBeEnabled();
      await page.getByLabel("Explore", { exact: true }).fill("A duck");
      await submit.click();
      await expect.poll(() => explorations.length).toBe(2);
      await expect(submit).toBeEnabled();
      assert.deepEqual(
        explorations.map((row) => row.intent),
        ["", "A duck"],
      );
      await expect(page.getByRole("alert")).toHaveCount(0);
      await expect(page.getByRole("button", { name: /Prepare|Establish|Retry request|Dismiss request/ })).toHaveCount(
        0,
      );
      await page.screenshot({ path: ".build-tmp/places/" + name + ".png", fullPage: true });
      await page.getByLabel("Search places", { exact: true }).fill("New Venue");
      await page.getByRole("button", { name: "New Venue · Venue", exact: true }).click();
      await expect(page.getByRole("alert")).toHaveText("Refresh the Village to open this Venue.");
      assert(
        await page
          .getByRole("complementary")
          .evaluate((element) => element.getBoundingClientRect().width <= innerWidth),
        "The list fits the viewport",
      );
      await page.close();
    });
});
