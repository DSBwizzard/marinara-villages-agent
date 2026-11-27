// Test cases: location-directory/desktop, location-directory/phone
import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { projectSnapshot } from "./fixtures/villages-project-browser.fixture.mjs";
import { placeDirectoryPage } from "./fixtures/villages-places.fixture.mjs";
import { mkdir } from "node:fs/promises";
const P = "marinara-capability-villages";
const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `
import {useState} from 'react';import {createRoot} from 'react-dom/client';
import {PlacesDirectory} from './packages/villages/src/client/features/exploration/PlacesDirectory.js';
import {RetainedView} from './packages/villages/src/client/shared/RetainedView.js';
import {DESK_STYLES} from './packages/villages/src/client/shared/desk-styles.js';
import {prepareDeskArtwork,deskArtworkStyle} from './packages/villages/src/client/shared/desk-art.js';
import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';syncVillagesStyles();
function App(){const[search,onSearch]=useState(''),[view,setView]=useState('directory'),[location,setLocation]=useState(null);
return <div className='${P}-desk-container'><style>{DESK_STYLES}</style><section className='${P}-desk-workspace' data-desk='places' data-theme='day' style={deskArtworkStyle('places',true)}>
<aside className='${P}-desk-header'><span className='${P}-menu-brand'>VILLAGES</span></aside><main className='${P}-desk-stage'><div className='${P}-desk-document'>
<RetainedView active={view==='directory'}><PlacesDirectory snapshot={window.snapshot} mapId='shore' search={search} onSearch={onSearch} focusSearch={false}
 onMap={map=>{window.map=map;setView('map')}} onLocation={place=>{window.opened=place.id;setLocation(place);setView('detail')}}/></RetainedView>
{view==='map'?<><h1>Map</h1><button onClick={()=>setView('directory')}>Back to Locations</button></>:null}
{view==='detail'?<><h1>{location.name}</h1><button onClick={()=>setView('directory')}>Back to Locations</button></>:null}
</div></main></section></div>;}void prepareDeskArtwork(true).then(()=>createRoot(document.getElementById('root')).render(<App/>));
`,
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
await mkdir(".build-tmp/location-directory", { recursive: true });
await withBrowser(browser, async () => {
  for (const [name, width] of [
    ["desktop", 1440],
    ["phone", 390],
  ])
    await runCase("location-directory/" + name, async () => {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      await mockEngineLookups(page);
      const snapshot = projectSnapshot();
      snapshot.worldScope = "directory:test";
      snapshot.settings.maps = ["shore", "ice"].map((id) => ({
        id,
        name: id === "shore" ? "The Shoreline Terraces" : "Outer Icefields",
      }));
      snapshot.settings.venues = snapshot.settings.venues.slice(0, 2).map((venue, n) => ({
        ...venue,
        id: "venue:" + n,
        name: n ? "Greenhouse Row" : "Window Commons",
        presentation: { ...venue.presentation, mapId: "shore" },
      }));
      const rows = [
        ...snapshot.settings.venues.map((venue) => ({
          id: venue.id,
          name: venue.name,
          mapId: "shore",
          venue: true,
          visited: true,
        })),
        ...Array.from({ length: 65 }, (_, n) => ({
          id: "archive:" + n,
          name: "Archive " + String(n).padStart(2, "0"),
          mapId: n % 2 ? "ice" : "shore",
          venue: false,
          visited: n % 3 === 0,
          description: "An archive.",
          revision: 1,
          report: false,
        })),
      ];
      let heldRow = false,
        releaseRow,
        heldExplore = false,
        releaseExplore;
      const paths = [],
        explorations = [];
      await page.route("http://directory.test/", (route) =>
        fulfill(route, {
          contentType: "text/html",
          body: `<style>html,body{margin:0;height:100%;}#root{height:100%;}</style><${P}><div id="root"></div></${P}>`,
        }),
      );
      await page.route("**/api/villages/**", async (route) => {
        const url = new URL(route.request().url()),
          path = url.pathname.replace(/^.*\/api\/villages/, "");
        paths.push(path + url.search);
        let value;
        if (path === "/places") value = placeDirectoryPage(rows, url.searchParams);
        else if (path === "/places/explore") {
          explorations.push(route.request().postDataJSON());
          if (heldExplore) {
            heldExplore = false;
            await new Promise((resolve) => {
              releaseExplore = resolve;
            });
            value = { status: "ready", placeId: "archive:64" };
          } else value = { status: "ready", placeId: "" };
        } else if (path.startsWith("/places/")) {
          const id = decodeURIComponent(path.slice(8));
          if (heldRow) {
            heldRow = false;
            await new Promise((resolve) => {
              releaseRow = resolve;
            });
          }
          const row = rows.find((row) => row.id === id);
          assert(row);
          value = {
            ...row,
            prepared: true,
            location: { ...snapshot.settings.venues[0], id: row.id, name: row.name },
          };
        } else throw Error("Unexpected directory route " + path);
        await fulfill(route, { status: 200, json: value });
      });
      await page.goto("http://directory.test/");
      await page.evaluate((value) => (window.snapshot = value), snapshot);
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      const directory = page.getByRole("region", { name: "Locations directory", exact: true });
      const categories = directory.getByRole("navigation", { name: "Location categories", exact: true });
      const search = directory.getByRole("searchbox", { name: "Search locations", exact: true });
      const next = directory.getByRole("button", { name: "Next", exact: true }),
        previous = directory.getByRole("button", { name: "Previous", exact: true });
      const scroll = directory.locator(`.${P}-locations-scroll`);
      await expect(directory.getByText("1–50 of 67", { exact: true })).toBeVisible();
      await expect(directory.locator(`.${P}-venue-badge`)).toHaveCount(2);
      await expect(directory.getByText("Location", { exact: true })).toHaveCount(0);
      await expect(categories.getByRole("button", { name: /^Venues/ })).toHaveText("Venues2");
      await expect(categories.getByRole("button", { name: /^Other locations/ })).toHaveText("Other locations65");
      await expect(directory.locator("[data-exploration-row]")).toHaveCount(50);
      await expect(directory.getByRole("button", { name: "Map", exact: true })).toBeInViewport();
      await expect(directory.getByRole("button", { name: "Explore", exact: true })).toHaveCount(1);
      await expect(next).toBeInViewport({ ratio: 1 });
      await expect(previous).toBeDisabled();
      await page.screenshot({ path: ".build-tmp/location-directory/" + name + "-all.png", fullPage: true });
      await categories.getByRole("button", { name: /^Venues/ }).click();
      await expect(directory.locator("[data-exploration-row]")).toHaveCount(2);
      await directory.getByRole("button", { name: "Greenhouse Row, Venue", exact: true }).click();
      await expect.poll(() => page.evaluate(() => window.opened)).toBe("venue:1");
      await page.getByRole("button", { name: "Back to Locations", exact: true }).click();
      await expect(categories.getByRole("button", { name: /^Venues/ })).toHaveAttribute("aria-pressed", "true");
      await categories.getByRole("button", { name: /^Other locations/ }).click();
      await expect(directory.getByText("1–50 of 65", { exact: true })).toBeVisible();
      await expect(directory.locator(`.${P}-venue-badge`)).toHaveCount(0);
      await next.click();
      await expect(directory.getByText("51–65 of 65", { exact: true })).toBeVisible();
      await expect(next).toBeDisabled();
      await expect(previous).toBeEnabled();
      const selected = directory.getByRole("button", { name: "Archive 63", exact: true });
      await selected.scrollIntoViewIfNeeded();
      const position = await scroll.evaluate((node) => node.scrollTop);
      assert(position > 0);
      await selected.click();
      await expect(page.getByRole("heading", { name: "Archive 63", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Back to Locations", exact: true }).click();
      await expect(directory.getByText("51–65 of 65", { exact: true })).toBeVisible();
      await expect.poll(() => scroll.evaluate((node) => node.scrollTop)).toBe(position);
      await previous.click();
      await expect(directory.getByText("1–50 of 65", { exact: true })).toBeVisible();
      await directory.getByRole("combobox", { name: "Filter by map", exact: true }).selectOption("ice");
      await expect(directory.getByText("1–32 of 32", { exact: true })).toBeVisible();
      await expect(directory.getByRole("button", { name: "Archive 00", exact: true })).toHaveCount(0);
      await search.fill("Archive 64");
      await expect(directory.getByRole("status")).toHaveText("No matching locations.");
      await directory.getByRole("combobox", { name: "Filter by map", exact: true }).selectOption("");
      await expect(directory.getByRole("button", { name: "Archive 64", exact: true })).toBeVisible();
      assert.equal(explorations.length, 0, "Search, maps, categories and page changes never Explore");
      heldRow = true;
      await directory.getByRole("button", { name: "Archive 64", exact: true }).click();
      await expect.poll(() => Boolean(releaseRow)).toBe(true);
      await directory.getByRole("button", { name: "Map", exact: true }).click();
      await page.getByRole("button", { name: "Back to Locations", exact: true }).click();
      releaseRow();
      await expect.poll(() => paths.filter((path) => path.startsWith("/places?")).length).toBeGreaterThan(5);
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await expect(directory).toBeVisible();
      await expect(search).toHaveValue("Archive 64");
      await expect(categories.getByRole("button", { name: /^Other locations/ })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      heldExplore = true;
      await directory.getByLabel("Discover somewhere new", { exact: true }).fill("A quiet archive");
      await directory.locator("form").evaluate((form) => {
        form.requestSubmit();
        form.requestSubmit();
      });
      await expect.poll(() => Boolean(releaseExplore)).toBe(true);
      assert.equal(explorations.length, 1, "Same-render submissions share one admitted request");
      await directory.getByRole("button", { name: "Map", exact: true }).click();
      await page.getByRole("button", { name: "Back to Locations", exact: true }).click();
      releaseExplore();
      await expect(directory.getByRole("button", { name: "Explore", exact: true })).toBeEnabled();
      await expect(directory).toBeVisible();
      await expect(page.getByRole("heading", { name: "Archive 64", exact: true })).toHaveCount(0);
      await directory.getByRole("button", { name: "Explore", exact: true }).click();
      await expect(directory.getByRole("status")).toHaveText("No new location found.");
      assert.equal(explorations.length, 2);
      assert(explorations.every((row) => row.mapId === "shore"));
      await search.fill("");
      await expect(directory.getByText("1–50 of 65", { exact: true })).toBeVisible();
      await page.screenshot({ path: ".build-tmp/location-directory/" + name + "-locations.png", fullPage: true });
      assert(
        await directory.evaluate((element) => element.getBoundingClientRect().width <= innerWidth),
        "The directory fits the viewport",
      );
      await page.close();
    });
});
