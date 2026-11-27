import { mockEngineLookups, fulfill, abort, chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { runCase, wantsCase } from "../scripts/test-cases.mjs";
// Test cases: founding/quick-start/desktop, founding/quick-start/phone

const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `
import {createRoot} from 'react-dom/client';
import {useState,useRef,useEffect} from 'react';
import {QuickStartButton} from './packages/villages/src/client/features/founding/QuickStartButton.js';
import {FoundingVenueReview} from './packages/villages/src/client/features/founding/FoundingVenueReview.js';
import {QuickStartVenues} from './packages/villages/src/client/features/founding/QuickStartVenues.js';
import {VILLAGES_FORGING_STYLES} from './packages/villages/src/client/features/founding/villages-forging-styles.js';
import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';
import {emptyFoundingWorkspace} from './packages/villages/src/client/features/founding/villages-founding-workspace-state.js';
import {newSetupVenue} from './packages/villages/src/client/features/founding/FoundingPanels.js';
import {assignFoundingHome} from './packages/villages/src/client/features/founding/founding-homes.js';
import {createFoundingSuggestSetupVenues} from './packages/villages/src/client/features/founding/setup-controller.js';
import {usePatchSetupVenue} from './packages/villages/src/client/features/founding/actions.js';
import {arrangeQuickStartVenues} from './packages/villages/src/client/features/founding/quick-start-placement.js';
import {useActivitySignal,useVisibleInterval} from './packages/villages/src/client/shared/activity.js';
import {saveDeviceDraft,readDeviceDraft} from './packages/villages/src/client/shared/device-drafts.js';
function Harness(){
 const people=[{id:'ada',name:'Ada'},{id:'bryn',name:'Bryn'}];
 const [venues,setVenues]=useState([]);
 const [workspace,setWorkspace]=useState(emptyFoundingWorkspace),[selected,setSelected]=useState(null),[moving,setMoving]=useState(null);
 const [busy,setBusy]=useState(false),[key,setKey]=useState(''),[problem,setProblem]=useState(''),[source,setSource]=useState('coast');
 const [visible,setVisible]=useState(true);
 const signal=useActivitySignal(visible);
 const [authored,setAuthored]=useState({}),[saved,setSaved]=useState(false);
 const authoredRef=useRef(authored),rowsRef=useRef(venues),sourceRef=useRef(source),claim=useRef(false),image=useRef(null),revision=useRef(0);
 useEffect(()=>{authoredRef.current=authored;rowsRef.current=venues;sourceRef.current=source},[authored,venues,source]);
 useEffect(()=>{readDeviceDraft('page-three').then(draft=>{if(draft){revision.current=draft.revision;setVenues(draft.data.venues);setWorkspace({...draft.data.workspace,view:'map',paused:true});setAuthored(draft.data.authored);setKey(draft.data.suggestionsKey)}})},[]);
 const persist=async data=>{const result=await saveDeviceDraft('page-three',data,revision.current);revision.current=result.revision;setSaved(true)};
 const data={venues,workspace,authored,suggestionsKey:key,roster:["ada","bryn"]};
 const suggest=createFoundingSuggestSetupVenues({signal,setupWorkspace:workspace,setSetupWorkspace:setWorkspace,setupDraftData:data,persistSetupDraft:persist,personaDraft:'driver',selectedResidentAdmissions:{},setSetupProblem:setProblem,setSetupSuggestionsBusy:setBusy,setSetupSuggestionsKey:setKey,setSetupVenues:setVenues,setupAuthoredFieldsRef:authoredRef,setupBeginningSourceKey:source,setupBeginningSourceKeyRef:sourceRef,setupImageTargetRef:image,setupLorebookDraft:[],setupLoreTokenBudgetDraft:1600,setupSetting:'An oceanfront community',setupName:'Tidebreak',setupContext:{rules:'',circumstances:[],openingVenueId:'community'},setupSuggestionsClaim:claim,setupVenues:venues,setupVenuesRef:rowsRef});
 useVisibleInterval(signal=>{if(workspace.suggestionRequest&&!workspace.suggestionRequest.failure)return suggest(undefined,signal)},workspace.suggestionRequest&&!workspace.suggestionRequest.failure?2000:null,visible);
 window.setFoundingVisible=setVisible;
 window.restoreMissingSuggestion=()=>setWorkspace(state=>({...state,suggestionRequest:{id:'absent-draft-result',sourceKey:source,quickStart:true}}));
 const patch=usePatchSetupVenue({setSetupAuthoredFields:setAuthored,setSetupVenues:setVenues});
 const select=venue=>{setSelected(venue.id);setMoving(null);setWorkspace(state=>({...state,view:'details',paused:true}))};
 const upload=(venue,area,file,id)=>{const image={id:'fixture',ref:'global-gallery:fixture',url:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='};patch(venue.id,row=>area==='exterior'?{...row,presentation:{...row.presentation,image}}:{...row,[area==='private'?'privateSpaces':'spaces']:(row[area==='private'?'privateSpaces':'spaces']??[]).map(zone=>zone.id===id?{...zone,image}:zone)});};
 window.quickState={venues,workspace,authored,suggestionsKey:key,problem,moving};
 window.replaceQuickVenues=setVenues;
 window.addManualVenue=()=>setVenues(rows=>[...rows,newSetupVenue('manual-venue',0.2,0.2)]);
 window.changeReviewSource=()=>setSource('changed-source');
 window.manualAssignments=()=>setVenues(rows=>{
  const next=assignFoundingHome(rows,rows[0].id,'player',true);const venue=next[0];
  venue.workerIds=['ada'];venue.destinations.ada={work:venue.spaces[0].id};
  venue.access={version:1,revision:0,managerIds:[],visitorHours:null,permissions:[],bans:[],exceptions:[],changes:[],visitDenials:[],receipts:{},work:[{characterId:'ada',activity:'Serving coffee',zoneId:venue.spaces[0].id,accessZoneIds:[venue.spaces[0].id],days:['Monday'],startMinute:540,endMinute:1020}]};return next;
 });
 window.legacyReview=()=>setWorkspace(state=>({...state,venueReview:{baseline:JSON.stringify(venues),sourceKey:source,venues:venues.slice(0,1)}}));
 window.redraftSelected=()=>suggest({venueId:venues[0].id,fullVenue:true});
 window.draftNewVenue=()=>suggest({venueId:'venue:single-cafe',addVenue:true,venueBrief:'A standalone cafe'});
 window.editDuringRequest=()=>patch(venues[0].id,row=>({...row,form:'A newer manual description'}));
 const dismissReview=()=>{setProblem('');setWorkspace(state=>({...state,venueReview:undefined}));};
 return <><style>{VILLAGES_FORGING_STYLES}</style><div className='villages-forging-v2'><header className='villages-forging-heading'><h1>Founding Venues</h1></header><main className='villages-forging-body'>
 {workspace.venueReview && <FoundingVenueReview review={workspace.venueReview} current={venues} sourceKey={source} onUse={setVenues} onDismiss={dismissReview}/>}
 <QuickStartVenues venues={venues} people={people} selectedId={selected} busy={busy} imageBusy={false} focusIssue={null} problem={problem} map={<p>Map preview</p>} onSelect={select} onPatch={venue=>patch(venue.id,()=>venue)} onGenerateImage={()=>{}} onUploadImage={upload}
 actions={<QuickStartButton busy={busy} pending={!!workspace.suggestionRequest&&!workspace.suggestionRequest.failure} onGenerate={()=>suggest({plan:true})}/>}/>
 {problem?<p role='alert'>{problem}</p>:null}</main><footer className='villages-forging-footer'><button onClick={()=>persist(data)}>Save draft</button></footer></div></>;
}
createRoot(document.getElementById('root')).render(<Harness/>);syncVillagesStyles();
`,
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const viewport of [
    { width: 1366, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ]) {
    const caseName = viewport.width > 600 ? "founding/quick-start/desktop" : "founding/quick-start/phone";
    if (!wantsCase(caseName)) continue;
    await runCase(caseName, async () => {
      const context = await browser.newContext({ viewport });
      await mockEngineLookups(context);
      const page = await context.newPage();
      let calls = 0,
        reads = 0,
        receipt,
        loseReply = false,
        hold = false,
        release;
      await page.route("**/api/villages**", async (route) => {
        if (route.request().method() === "GET") {
          reads++;
          return fulfill(route, { contentType: "application/json", body: JSON.stringify(receipt) });
        }
        const input = route.request().postDataJSON();
        calls++;
        const sources = input.mode === "draft-plan" ? input.sourceVenues : [input.targetVenue];
        if (input.targetVenueId === "venue:single-cafe") {
          assert.equal(input.mode, "draft-venue");
          assert.equal(input.venueBrief, "A standalone cafe");
          assert.deepEqual(
            input.venues.map((row) => row.id),
            [input.targetVenueId],
          );
          assert.equal(input.targetVenue.name, "");
        }
        if (input.mode === "draft-plan") {
          assert.equal(sources.length, 4);
          assert.ok(sources.every((row) => !row.occupancy.playerHome && !row.residentIds.length));
        }
        const venues = sources.slice(0, input.mode === "draft-plan" ? 3 : 1).map((row, index) => ({
          ...row,
          name: "Draft Cafe " + index,
          form: "A two-floor cafe.",
          description: "A brick entrance.",
          layout: "both",
          zones: [
            ...(row.spaces.length || row.privateSpaces.length
              ? [...row.spaces, ...row.privateSpaces].map((zone) => ({
                  ...zone,
                  private: row.privateSpaces.some((room) => room.id === zone.id),
                }))
              : [
                  {
                    id: "floor",
                    name: "Cafe floor",
                    purpose: "Coffee",
                    description: "Tables and a counter.",
                    private: false,
                    ownerId: "",
                    connectedTo: ["exterior"],
                    access: {
                      mode: "public",
                      managerIds: null,
                      memberIds: [],
                      memberRoles: [],
                      inviterIds: [],
                      visitorHours: "always",
                      accompanied: false,
                    },
                  },
                  {
                    id: "bedroom",
                    name: "Bedroom",
                    purpose: "Sleeping",
                    description: "A quiet bedroom.",
                    private: true,
                    ownerId: "",
                    connectedTo: ["floor"],
                    access: {
                      mode: "permission-required",
                      managerIds: null,
                      memberIds: [],
                      memberRoles: [],
                      inviterIds: [],
                      visitorHours: "always",
                      accompanied: false,
                    },
                  },
                ]),
          ],
        }));
        receipt = { id: input.actionId, sourceKey: input.sourceKey, status: "complete", result: { venues }, error: "" };
        if (hold) await new Promise((done) => (release = done));
        if (loseReply) {
          loseReply = false;
          return abort(route);
        }
        return fulfill(route, { contentType: "application/json", body: JSON.stringify(receipt) });
      });
      await page.route("http://page-three.test/", (route) =>
        fulfill(route, {
          contentType: "text/html",
          body: '<div id="root"></div><script>' + bundle.outputFiles[0].text + "</script>",
        }),
      );
      await page.goto("http://page-three.test/");
      const button = (name) => page.getByRole("button", { name, exact: true });
      await expect(button("Draft All Venues")).toBeEnabled();
      assert.deepEqual(await page.evaluate(() => window.quickState.venues), []);
      await button("Draft All Venues").click();
      await expect(button("Replace Venues")).toBeVisible();
      const review = page.getByRole("dialog", { name: "Venue drafts", exact: true });
      const details = review.getByRole("region", { name: "Venue draft details" });
      const replaceWarning = details.getByText("Applying this draft replaces all of your current Venues.");
      await expect(replaceWarning).toHaveCount(0);
      if (viewport.width > 727)
        await expect(details.getByRole("columnheader", { name: "Form", exact: true })).toBeVisible();
      await expect(details.getByRole("rowheader")).toHaveCount(3);
      await expect(review.locator("details")).toHaveCount(0);
      await expect(review.getByRole("button", { name: "Replace Venues" })).toBeInViewport({ ratio: 1 });
      assert.deepEqual(await page.evaluate(() => window.quickState.venues), [], "Generation waits for review");
      await button("Discard draft").click();
      assert.deepEqual(await page.evaluate(() => window.quickState.venues), []);
      await button("Draft All Venues").click();
      await button("Replace Venues").click();
      await expect.poll(() => page.evaluate(() => window.quickState.venues.length)).toBe(3);
      assert.ok(
        await page.evaluate(() =>
          window.quickState.venues.every(
            (row) =>
              !row.occupancy.playerHome &&
              !row.residentIds.length &&
              !row.workerIds.length &&
              !Object.keys(row.destinations).length,
          ),
        ),
      );
      await page.evaluate(() => window.manualAssignments());
      await expect.poll(() => page.evaluate(() => window.quickState.venues[0].occupancy.playerHome)).toBe(true);
      await page.evaluate(() => window.addManualVenue());
      await expect.poll(() => page.evaluate(() => window.quickState.venues.length)).toBe(4);
      const manual = await page.evaluate(() => structuredClone(window.quickState.venues));
      assert.equal(manual.at(-1).spaces[0].connectedTo, undefined, "A new Venue uses its default Entrance passage");
      await page.evaluate(() => window.redraftSelected());
      await expect
        .poll(() =>
          page.evaluate(() => (window.quickState.workspace.venueReview ? "review" : window.quickState.problem)),
        )
        .toBe("review");
      await button("Use changes").click();
      assert.deepEqual(await page.evaluate(() => window.quickState.venues[0].destinations), manual[0].destinations);
      assert.deepEqual(await page.evaluate(() => window.quickState.venues[0].access.work), manual[0].access.work);
      assert.equal(await page.evaluate(() => window.quickState.venues[0].occupancy.playerHome), true);
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues.slice(1)),
        manual.slice(1),
        "Applying a single Venue redraft leaves other Venues and their default passages intact",
      );
      await page.evaluate(() => window.legacyReview());
      await button("Use changes").click();
      await expect(page.getByRole("dialog", { name: "Review Venue draft" }).getByRole("alert")).toContainText(
        "Discard this older draft",
      );
      assert.equal(await page.evaluate(() => window.quickState.venues.length), 4);
      await button("Discard draft").click();
      await button("Draft All Venues").click();
      await expect(replaceWarning).toBeVisible();
      await button("Discard draft").click();
      assert.equal(
        await page.evaluate(() => window.quickState.venues[0].occupancy.playerHome),
        true,
        "Discard keeps existing assignments",
      );
      loseReply = true;
      await button("Draft All Venues").click();
      await expect.poll(() => reads).toBeGreaterThan(0);
      await expect(button("Replace Venues")).toBeVisible();
      await button("Replace Venues").click();
      assert.ok(
        await page.evaluate(() =>
          window.quickState.venues.every((row) => !row.occupancy.playerHome && !row.workerIds.length),
        ),
      );
      hold = true;
      await button("Draft All Venues").click();
      await expect.poll(() => !!release).toBe(true);
      await page.evaluate(() => window.editDuringRequest());
      release();
      hold = false;
      await expect.poll(() => page.evaluate(() => window.quickState.problem)).toContain("choices changed");
      assert.equal(await page.evaluate(() => window.quickState.venues[0].form), "A newer manual description");
      assert.equal(calls, 6, "Only explicit drafts dispatch requests");
      const beforeAddition = await page.evaluate(() => structuredClone(window.quickState.venues));
      const previousReads = reads;
      loseReply = true;
      await page.evaluate(() => window.draftNewVenue());
      await page.reload();
      await expect.poll(() => reads).toBeGreaterThan(previousReads);
      await expect.poll(() => page.evaluate(() => window.quickState.venues.at(-1)?.id)).toBe("venue:single-cafe");
      const added = await page.evaluate(() => structuredClone(window.quickState.venues));
      assert.deepEqual(added.slice(0, -1), beforeAddition);
      assert.equal(added.at(-1).name, "Draft Cafe 0");
      assert.equal(await page.evaluate(() => window.quickState.workspace.suggestionRequest), undefined);
      assert.equal(calls, 7, "Reload only reads the admitted Add Venue request");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      assert.equal(overflow, false);
      await page.screenshot({ path: ".build-tmp/page-three-" + viewport.width + ".png" });
      await context.close();
    });
  }
});
