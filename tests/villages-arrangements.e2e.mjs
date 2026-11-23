import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, withBrowser, mockEngineLookups, fulfill, expect } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as fixture, venueSnapshotFixture } from "./fixtures/villages-scene-browser.fixture.mjs";
const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `
import {useState,useRef} from 'react';
import {installFeature} from './tests/fixtures/feature-root.js';
import {VenueScreen} from './packages/villages/src/client/features/venues/VenueScreen.js';
import {PersonArrangements} from './packages/villages/src/client/features/venues/PersonArrangements.js';
import {DeskWorkspace} from './packages/villages/src/client/shared/DeskWorkspace.js';
import {VillageActivity} from './packages/villages/src/client/shared/activity.js';
installFeature(function App(base){
 const [snapshot,setSnapshot]=useState(window.seed),[section,setSection]=useState('about'),[zone,setZone]=useState('bed'),[mode,setMode]=useState('venue'),[viewing,setViewing]=useState(true);
 const documentRef=useRef(null);window.arrangements={update:setSnapshot,mode:setMode,view:setViewing,read:()=>snapshot};
 const controller={...base,snapshot,setSnapshot,venueId:'cafe',venueZoneKey:zone,setVenueZoneKey:setZone,venueSection:section,setVenueSection:setSection,venuePage:'view',screen:mode==='venue'?'venue':'person',room:null,roomBusy:false,mobile:innerWidth<728,busy:false,venueEditBusy:false,venueEditDraft:null,venueProposalDraft:null,placeBusyId:'',placeProblem:null,venueEditError:'',venueEditNotice:'',portraits:{},standingAt:()=>[],nameOfCharacter:id=>id==='a'?'Alice':'Bob',leaveVenue:()=>{},setScreen:()=>{},loadSnapshot:async()=>{},setVenueEditDraft:()=>{},setVenueEditError:()=>{},setVenueEditNotice:()=>{}};
 return <VillageActivity value={{visible:viewing,viewing,backgroundRevision:'test'}}><div className='marinara-capability-villages-root marinara-capability-villages-home' style={{height:'100%'}}><DeskWorkspace active={mode==='venue'?'places':'people'} daylight venue={mode==='venue'} phase='open' disabled={false} artworkError='' documentRef={documentRef} onNavigate={()=>{}} onReturn={()=>{}} onKeyDown={()=>{}}>{mode==='venue'?<VenueScreen controller={controller}/>:<PersonArrangements person='b' controller={controller}/>}</DeskWorkspace></div></VillageActivity>;
});`,
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const width of [1366, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    await mockEngineLookups(context);
    const seed = structuredClone(fixture);
    seed.villagers = [
      { ...seed.villagers[0], characterId: "a", name: "Alice" },
      { ...seed.villagers[0], characterId: "b", name: "Bob" },
    ];
    seed.settings.venues = [
      venueSnapshotFixture({
        id: "cafe",
        name: "Cafe",
        residentIds: ["a", "b"],
        residenceCapacity: 2,
        destinations: { a: { sleep: "bed" }, b: { sleep: "bed" } },
        privateSpaces: [{ id: "bed", ownerId: "a", name: "Bedroom", description: "Two beds", image: null }],
        occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      }),
    ];
    const page = await context.newPage();
    const errors = [],
      posts = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/api/villages**", (route) => {
      if (
        route.request().method() === "POST" &&
        new URL(route.request().url()).pathname.endsWith("/residences/proposals")
      ) {
        posts.push(route);
        return;
      }
      return fulfill(route, { json: seed });
    });
    await page.route("http://arrangements.test/", (route) =>
      fulfill(route, {
        contentType: "text/html",
        body: "<style>html,body{margin:0;height:100%}marinara-capability-villages{display:block;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.goto("http://arrangements.test/");
    await page.evaluate((value) => (window.seed = value), seed);
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const profile = page.locator(".marinara-capability-villages-venue-profile");
    await expect(profile.getByRole("button", { name: "People", exact: true })).toHaveCount(0);
    await profile.getByRole("button", { name: "Zones", exact: true }).click();
    await profile.getByRole("button", { name: /^Private Space/ }).click();
    await expect(profile.getByRole("button", { name: /^Sleeps here.*2/ })).toBeVisible();
    await profile.getByRole("button", { name: /^Sleeps here/ }).click();
    await profile.getByRole("button", { name: "Bob", exact: true }).click();
    await expect(profile.getByLabel("Venue", { exact: true })).toHaveValue("cafe");
    await expect(profile.getByLabel("Sleeps in", { exact: true })).toHaveValue("bed");
    await expect(profile.getByRole("button", { name: "← Sleeps here", exact: true })).toHaveCount(1);
    await expect(profile.getByLabel("Room assignment", { exact: true })).toHaveCount(0);
    await expect(profile.getByRole("link")).toHaveCount(0);
    await profile.getByRole("button", { name: "Propose changes", exact: true }).click();
    await expect.poll(() => posts.length).toBe(1);
    assert.deepEqual(posts[0].request().postDataJSON(), { characterId: "b", venueId: "cafe", privateZoneId: "bed" });
    const newer = structuredClone(seed);
    newer.settings.venues[0].accessView.revision += 1;
    newer.village.name = "Newer";
    await page.evaluate((value) => window.arrangements.update(value), newer);
    await fulfill(posts[0], { json: seed });
    await expect.poll(() => page.evaluate(() => window.arrangements.read().village.name)).toBe("Newer");
    await expect(profile.getByRole("button", { name: "← Sleeps here", exact: true })).toBeEnabled();
    await page.evaluate(() => window.arrangements.mode("person"));
    await page.getByRole("button", { name: /^Home/ }).click();
    await expect(page.getByRole("button", { name: "← Arrangements", exact: true })).toHaveCount(1);
    await expect(page.getByLabel("Sleeps in", { exact: true })).toHaveValue("bed");
    await page.getByRole("button", { name: "Propose changes", exact: true }).click();
    await expect.poll(() => posts.length).toBe(2);
    await fulfill(posts[1], { json: newer });
    await expect(page.getByRole("button", { name: /^Home/ })).toBeVisible();
    assert.deepEqual(errors, []);
    await context.close();
  }
});
console.log(
  "Arrangements: shared-bedroom roster, one editor, scoped back controls and stale-response protection passed on desktop and phone.",
);
