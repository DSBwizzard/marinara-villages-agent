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
import {QuickStartVenues} from './packages/villages/src/client/features/founding/QuickStartVenues.js';
import {VILLAGES_FORGING_STYLES} from './packages/villages/src/client/features/founding/villages-forging-styles.js';
import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';
import {emptyFoundingWorkspace} from './packages/villages/src/client/features/founding/villages-founding-workspace-state.js';
import {newSetupVenue} from './packages/villages/src/client/features/founding/FoundingPanels.js';
import {reconcileFoundingRoster} from './packages/villages/src/client/features/founding/founding-homes.js';
import {createFoundingSuggestSetupVenues} from './packages/villages/src/client/features/founding/setup-controller.js';
import {usePatchSetupVenue} from './packages/villages/src/client/features/founding/actions.js';
import {arrangeQuickStartVenues} from './packages/villages/src/client/features/founding/quick-start-placement.js';
import {useActivitySignal,useVisibleInterval} from './packages/villages/src/client/shared/activity.js';
import {saveDeviceDraft,readDeviceDraft} from './packages/villages/src/client/shared/device-drafts.js';
function Harness(){
 const people=[{id:'ada',name:'Ada'},{id:'bryn',name:'Bryn'}];
 const [venues,setVenues]=useState(()=>arrangeQuickStartVenues(reconcileFoundingRoster([],[{id:'player',name:'Your'},...people],['player','ada','bryn'],'community')));
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
 const suggest=createFoundingSuggestSetupVenues({signal,setupWorkspace:workspace,setSetupWorkspace:setWorkspace,setupDraftData:data,persistSetupDraft:persist,personaDraft:'driver',selectedResidentAdmissions:{},setSetupProblem:setProblem,setSetupSuggestionsBusy:setBusy,setSetupSuggestionsKey:setKey,setSetupVenues:setVenues,setupAuthoredFieldsRef:authoredRef,setupBeginningSourceKey:source,setupBeginningSourceKeyRef:sourceRef,setupImageTargetRef:image,setupLorebookDraft:[],setupLoreTokenBudgetDraft:1600,setupSetting:'An oceanfront community',setupName:'Tidebreak',setupContext:{rules:'',circumstances:[],communityVenueId:'community'},setupSuggestionsClaim:claim,setupVenues:venues,setupVenuesRef:rowsRef});
 useVisibleInterval(signal=>{if(workspace.suggestionRequest&&!workspace.suggestionRequest.failure)return suggest(undefined,signal)},workspace.suggestionRequest&&!workspace.suggestionRequest.failure?2000:null,visible);
 window.setFoundingVisible=setVisible;
 const patch=usePatchSetupVenue({setSetupAuthoredFields:setAuthored,setSetupVenues:setVenues});
 const select=venue=>{setSelected(venue.id);setMoving(null);setWorkspace(state=>({...state,view:'details',paused:true}))};
 const upload=(venue,area,file,id)=>{const image={id:'fixture',ref:'global-gallery:fixture',url:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='};patch(venue.id,row=>area==='exterior'?{...row,presentation:{...row.presentation,image}}:{...row,[area==='private'?'privateSpaces':'spaces']:(row[area==='private'?'privateSpaces':'spaces']??[]).map(zone=>zone.id===id?{...zone,image}:zone)});};
 window.quickState={venues,workspace,authored,suggestionsKey:key,problem,moving};
 window.editDuringRequest=()=>patch('founding-home:player',row=>({...row,form:'A newer manual description'}));
 return <><style>{VILLAGES_FORGING_STYLES}</style><div className='villages-forging-v2'><header className='villages-forging-heading'><h1>Founding Venues</h1></header><main className='villages-forging-body'>
 <QuickStartVenues communityVenueId='community' venues={venues} people={people} selectedId={selected} busy={busy} imageBusy={false} focusIssue={null} problem={problem} map={<p>Map preview</p>} onSelect={select} onPatch={venue=>patch(venue.id,()=>venue)} onGenerateImage={()=>{}} onUploadImage={upload}
 actions={<QuickStartButton busy={busy} pending={!!workspace.suggestionRequest&&!workspace.suggestionRequest.failure} failed={!!workspace.suggestionRequest?.failure} onGenerate={()=>suggest({quickStart:true,separateHomes:true})}/>}/>
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
        loseReply = false,
        failReply = false,
        hold = false,
        release,
        receipt;
      await page.route("**/api/villages**", async (route) => {
        if (route.request().method() === "GET") {
          reads++;
          return fulfill(route, { contentType: "application/json", body: JSON.stringify(receipt) });
        }
        const input = route.request().postDataJSON();
        calls++;
        assert.equal(input.mode, "quick-start");
        assert.equal(input.venues.length, 4);
        assert.ok(
          input.venues.every(
            (row) => row.venueClass === "community" || row.residentIds.length + Number(row.playerHome) === 1,
          ),
        );
        receipt = {
          id: input.actionId,
          sourceKey: input.sourceKey,
          status: "complete",
          error: "",
          result: {
            venues: input.venues.map((row, index) => ({
              id: row.id,
              name: "Drafted " + index,
              form: "A coastal shelter",
              description: "A weathered door faces the sea.",
              layout: row.venueClass === "community" ? "common" : "both",
              commonName: "Living space",
              commonPurpose: "Daily life",
              commonDescription: "A warm living space.",
              privateName: row.venueClass === "community" ? "" : "Bedroom",
              privatePurpose: "Rest",
              privateDescription: "A quiet room.",
              connections:
                row.venueClass === "community"
                  ? [["exterior", "common:base"]]
                  : [
                      ["exterior", "common:base"],
                      ["common:base", "private:base"],
                    ],
            })),
          },
        };
        if (failReply) {
          failReply = false;
          receipt = { ...receipt, status: "failed", result: null, error: "Invalid synthetic draft" };
        }
        if (hold)
          await new Promise((resolve) => {
            release = resolve;
          });
        if (loseReply) {
          loseReply = false;
          return abort(route);
        }
        return fulfill(route, { contentType: "application/json", body: JSON.stringify(receipt) });
      });
      await page.route("http://page-three.test/", (route) =>
        fulfill(route, {
          contentType: "text/html",
          body:
            '<meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;background:#121936;color:white;font:16px system-ui"><marinara-capability-villages style="display:block;height:100dvh"><div id="root"></div></marinara-capability-villages><script>' +
            bundle.outputFiles[0].text +
            "</script>",
        }),
      );
      await page.goto("http://page-three.test/");
      const sheet = page.locator(".villages-quick-dialog");
      const button = (name) => page.getByRole("button", { name, exact: true });
      await expect(sheet).toBeVisible();
      assert.equal(calls, 0);
      await expect(button("+ Add home")).toHaveCount(0);
      await expect(button("+ Add Venue")).toHaveCount(0);
      await expect(sheet.getByRole("button", { name: "People", exact: true })).toHaveCount(0);
      await expect(sheet.getByRole("button", { name: "Artwork", exact: true })).toBeHidden();
      const first = page.locator('[data-venue-id="founding-home:player"]');
      await first.click();
      await expect(first).toHaveAttribute("aria-pressed", "true");
      await sheet.getByRole("button", { name: "Zones", exact: true }).click();
      const zones = sheet.getByRole("combobox", { name: "Selected Zone", exact: true });
      await zones.selectOption("common:base");
      await sheet.getByRole("button", { name: "Artwork", exact: true }).click();
      const upload = sheet.getByLabel("Upload Zone image", { exact: true });
      const file = { name: "zone.png", mimeType: "image/png", buffer: Buffer.from("fixture") };
      await upload.setInputFiles(file);
      await expect(sheet.getByRole("img", { name: "Artwork for Common Space", exact: true })).toBeVisible();
      await zones.selectOption("exterior");
      await sheet.getByRole("button", { name: "Artwork", exact: true }).click();
      await expect(sheet.getByRole("img")).toHaveCount(0);
      await upload.setInputFiles(file);
      await expect.poll(() => first.evaluate((node) => node.style.backgroundImage)).toContain("data:image");
      await expect(first.locator("img")).toHaveCount(0);
      await sheet.getByRole("button", { name: "Venue", exact: true }).click();
      await expect(sheet.getByRole("button", { name: "Artwork", exact: true })).toBeHidden();
      const confirm = async () => {
        await button(calls && receipt?.status === "failed" ? "Retry" : "Suggest").click();
        await page.getByRole("dialog").getByRole("button", { name: "Replace and suggest", exact: true }).click();
      };
      await button("Suggest").click();
      await page.getByRole("dialog").getByRole("button", { name: "Cancel", exact: true }).click();
      assert.equal(calls, 0);
      loseReply = true;
      await confirm();
      await expect.poll(() => calls).toBe(1);
      await expect.poll(() => page.evaluate(() => window.quickState.venues[0].name)).toBe("Drafted 0");
      assert.ok(reads > 0, "Lost POST response recovers by reading the same receipt");
      assert.equal(calls, 1, "Recovery never dispatches a second paid attempt");
      assert.ok(
        await page.evaluate(() =>
          window.quickState.venues
            .filter((row) => row.classes.includes("residence"))
            .every((row) => row.privateSpaces.length === 1 && Object.keys(row.destinations).length === 1),
        ),
      );
      failReply = true;
      await confirm();
      await expect(button("Retry")).toBeVisible();
      await page.waitForTimeout(250);
      assert.equal(calls, 2, "A confirmed failure waits for explicit Retry");
      await confirm();
      await expect.poll(() => calls).toBe(3);
      await expect(button("Suggest")).toBeEnabled();
      hold = true;
      await confirm();
      await expect.poll(() => calls).toBe(4);
      await page.evaluate(() => window.editDuringRequest());
      release();
      hold = false;
      await expect.poll(() => page.evaluate(() => window.quickState.problem)).toContain("changed");
      assert.equal(
        await page.evaluate(() => window.quickState.venues[0].form),
        "A newer manual description",
        "Newer manual edits survive a stale replacement",
      );
      await page.screenshot({ path: ".build-tmp/page-three-" + viewport.width + ".png" });
      await context.close();
    });
  }
});
