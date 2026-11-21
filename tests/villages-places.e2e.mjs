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
    contents: `
import {useState,useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {PlacesDirectory} from './packages/villages/src/client/features/exploration/PlacesDirectory.js';
import {VenueScreen} from './packages/villages/src/client/features/venues/VenueScreen.js';
import {RetainedView} from './packages/villages/src/client/shared/RetainedView.js';
import {ConfirmationProvider} from './packages/villages/src/client/shared/confirmation.js';
import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';
syncVillagesStyles();
function App(){
 const [snapshot,setSnapshot]=useState(window.snapshot),[search,onSearch]=useState('');
 const [location,setLocation]=useState(null),[section,setSection]=useState('about');
 const [zone,setZone]=useState('exterior'),[screen,setScreen]=useState('home');
 const loadSnapshot=useCallback(async()=>{},[]);
 const open=place=>{setLocation(place);setScreen('venue');setSection('about');window.locationOpened=place.id};
 window.poll=()=>setSnapshot(current=>structuredClone(current));
 window.reopen=()=>setScreen('venue');
 return <>
  <div hidden={screen!=='home'}><PlacesDirectory snapshot={snapshot} mapId='map' mobile={innerWidth<600}
   search={search} onSearch={onSearch} focusSearch={false} onClose={()=>window.closed=true}
   onLocation={open} onVenue={place=>window.venue=place.id}/></div>
  {location?<RetainedView active={screen==='venue'}><VenueScreen controller={{
   snapshot,venueId:location.id,screen:'venue',mobile:innerWidth<600,
   venueSection:section,setVenueSection:setSection,venueZoneKey:zone,setVenueZoneKey:setZone,
   venueLayouts:{},room:null,roomBusy:false,venueEditBusy:false,loadSnapshot,
   leaveVenue:()=>setScreen('home'),setScreen,
   openRoom:async place=>{window.visited=place.id},
   beginPlaceAdmission:place=>{window.admission={id:place.id};setScreen('home')}
  }}/></RetainedView>:null}
 </>;
}
createRoot(document.getElementById('root')).render(<ConfirmationProvider><App/></ConfirmationProvider>);
`,
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
        classified: false,
        venue: false,
        location: {
          ...snapshot.settings.venues[0],
          id: "place:lantern",
          name: "The Lantern",
          description: "A restaurant at the square.",
          zones: [
            {
              id: "exterior",
              name: "Entrance",
              kind: "exterior",
              seen: true,
              description: "A restaurant at the square.",
              connectedTo: ["dining"],
            },
            {
              id: "dining",
              name: "Dining room",
              kind: "public",
              seen: true,
              description: "A warm dining room.",
              connectedTo: ["exterior"],
            },
            {
              id: "private",
              name: "Private kitchen",
              kind: "public",
              seen: false,
              description: "",
              connectedTo: ["exterior"],
            },
          ],
        },
      };
      const venue = { ...place, id: snapshot.settings.venues[0].id, name: "Village Hall", venue: true, visited: true };
      const discovered = {
        ...place,
        id: "place:lookout",
        name: "Cliff Lookout",
        location: { ...place.location, id: "place:lookout", name: "Cliff Lookout" },
      };
      let found = false,
        unavailable = false,
        promoted = false;
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
            items: [venue, place, { ...venue, id: "late", name: "New Venue" }, ...(found ? [discovered] : [])].filter(
              (row) => row.name.toLowerCase().includes((url.searchParams.get("query") ?? "").trim().toLowerCase()),
            ),
            nextCursor: null,
          };
        else if (path === "/places/explore") {
          explorations.push(route.request().postDataJSON());
          value = { status: explorations.length === 1 ? "failed" : "ready", placeId: "" };
          if (explorations.length === 3) {
            found = true;
            value.placeId = discovered.id;
          }
        } else if (path === "/places/place%3Alantern" || path === "/places/place:lantern") {
          if (unavailable) return fulfill(route, { status: 404, json: { error: "Location unavailable" } });
          value = promoted ? { promoted: true, id: place.id } : place;
        } else if (path === "/places/place%3Alookout" || path === "/places/place:lookout") value = discovered;
        else throw Error("Unexpected Places route " + path);
        await fulfill(route, { status: 200, json: value });
      });
      await page.goto("http://places.test/");
      await page.evaluate((value) => (window.snapshot = value), snapshot);
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      await expect(page.getByRole("complementary", { name: "Locations navigator" })).toBeVisible();
      await page.getByRole("button", { name: "Village Hall · Venue", exact: true }).click();
      await expect.poll(() => page.evaluate(() => window.venue)).toBe(venue.id);
      await page.getByLabel("Search locations", { exact: true }).fill(" Lantern ");
      await expect(page.getByRole("button", { name: "The Lantern · Location", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "The Lantern · Location", exact: true }).click();
      const profile = page.getByRole("region", { name: "Location", exact: true });
      await expect(profile).toBeVisible();
      await expect(profile.getByText(place.description, { exact: true })).toHaveCount(1);
      await expect(profile.getByRole("button", { name: "Manage", exact: true })).toHaveCount(0);
      await expect(profile.getByText("Assigned villagers", { exact: true })).toHaveCount(0);
      await profile.getByRole("button", { name: "Zones", exact: true }).click();
      await profile.getByRole("button", { name: /Dining room/ }).click();
      await expect(profile.getByText("A warm dining room.", { exact: true })).toBeVisible();
      await expect(profile.getByRole("textbox")).toHaveCount(0);
      await expect(
        profile.getByRole("button", { name: /Generate artwork|Upload reference|Retry artwork/ }),
      ).toHaveCount(0);
      await expect(profile.getByRole("switch")).toHaveCount(0);
      await profile.getByRole("button", { name: "About", exact: true }).click();
      await expect(profile.getByRole("button", { name: "Add as Venue", exact: true })).toHaveCount(0);
      await profile.getByRole("button", { name: "Visit location", exact: true }).click();
      await expect.poll(() => page.evaluate(() => window.visited)).toBe(place.id);
      await profile.getByRole("button", { name: "← Back to map", exact: true }).click();
      const detailReads = () => paths.filter((path) => /\/places\/place(?::|%3A)lantern$/.test(path)).length;
      const hiddenReads = detailReads();
      await page.evaluate(() => window.poll());
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.equal(detailReads(), hiddenReads, "A hidden retained location does not refresh");
      await expect(page.getByLabel("Explore", { exact: true })).toBeInViewport();
      await expect(page.getByRole("button", { name: "Explore", exact: true })).toBeInViewport();
      await expect(page.getByRole("button", { name: "Add as Venue", exact: true })).toHaveCount(0);
      assert(!paths.some((path) => path.endsWith("/prepare")), "Visit delegates first arrival to ordinary Scene entry");
      place.visited = true;
      place.classified = true;
      await page.evaluate(() => window.reopen());
      await expect(profile.getByRole("button", { name: "Add as Venue", exact: true })).toBeVisible();
      assert(detailReads() > hiddenReads, "Reopening the retained page reads current admission eligibility");
      await page.getByRole("button", { name: "Add as Venue", exact: true }).click();
      await expect(page.getByRole("checkbox")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Choose map position", exact: true })).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => window.admission)).toEqual({ id: place.id });
      await expect(page.getByRole("button", { name: "Explore", exact: true })).toHaveCount(1);
      await expect(page.getByLabel("Explore", { exact: true })).toBeVisible();
      assert.equal(explorations.length, 0, "Search and browsing do not Explore");
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
      await expect(page.getByRole("status")).toHaveText("No new location found.");
      await expect(page.getByLabel("Search locations", { exact: true })).toHaveValue(" Lantern ");
      await page.getByLabel("Explore", { exact: true }).fill("A lookout");
      await submit.click();
      await expect(profile).toBeVisible();
      await expect.poll(() => page.evaluate(() => window.locationOpened)).toBe(discovered.id);
      await profile.getByRole("button", { name: "← Back to map", exact: true }).click();
      await expect(page.getByRole("button", { name: "Cliff Lookout · Location", exact: true })).toBeVisible();
      await expect(page.getByLabel("Search locations", { exact: true })).toHaveValue("Cliff Lookout");
      await expect(page.getByRole("button", { name: "Explore", exact: true })).toHaveCount(1);
      await expect(page.getByLabel("Explore", { exact: true })).toBeInViewport();
      await expect(page.getByRole("alert")).toHaveCount(0);
      await expect(page.getByRole("button", { name: /Prepare|Establish|Retry request|Dismiss request/ })).toHaveCount(
        0,
      );
      await page.screenshot({ path: ".build-tmp/places/" + name + ".png", fullPage: true });
      await page.getByLabel("Search locations", { exact: true }).fill("New Venue");
      await page.getByRole("button", { name: "New Venue · Venue", exact: true }).click();
      await expect(page.getByRole("alert")).toHaveText("Refresh the Village to open this Venue.");
      await page.getByLabel("Search locations", { exact: true }).fill("Lantern");
      await page.getByRole("button", { name: "The Lantern · Location · Visited", exact: true }).click();
      await expect(profile).toBeVisible();
      promoted = true;
      await page.evaluate(() => window.poll());
      await expect(profile).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Add as Venue", exact: true })).toHaveCount(0);
      await expect(
        page.getByRole("heading", { name: "This location is now a Venue. Refresh the Village.", exact: true }),
      ).toBeVisible();
      promoted = false;
      await page.evaluate(() => window.poll());
      await expect(profile).toBeVisible();
      unavailable = true;
      await page.evaluate(() => window.poll());
      await expect(profile).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Visit location", exact: true })).toHaveCount(0);
      await expect(page.getByRole("heading", { name: "Location unavailable", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Back", exact: true }).click();
      assert(
        await page
          .getByRole("complementary")
          .evaluate((element) => element.getBoundingClientRect().width <= innerWidth),
        "The list fits the viewport",
      );
      await page.close();
    });
});
