import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium, expect } from "@playwright/test";
import { build } from "esbuild";
import { runCase, wantsCase } from "../scripts/test-cases.mjs";
// Test cases: founding/quick-start/desktop, founding/quick-start/phone

const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `
import {createRoot} from 'react-dom/client';
import {useState,useRef,useEffect} from 'react';
import {QuickStartVenues} from './packages/villages/src/client/features/founding/QuickStartVenues.js';
import {FoundingWorkspace} from './packages/villages/src/client/features/founding/villages-founding-workspace.js';
import {VILLAGES_FORGING_STYLES} from './packages/villages/src/client/features/founding/villages-forging-styles.js';
import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';
import {emptyFoundingWorkspace,foundingVenueIssues} from './packages/villages/src/client/features/founding/villages-founding-workspace-state.js';
import {newSetupVenue} from './packages/villages/src/client/features/founding/FoundingPanels.js';
import {createFoundingSuggestSetupVenues} from './packages/villages/src/client/features/founding/setup-controller.js';
import {usePatchSetupVenue} from './packages/villages/src/client/features/founding/actions.js';
import {arrangeQuickStartVenues} from './packages/villages/src/client/features/founding/quick-start-placement.js';
import {saveFoundingDraft,readFoundingDraft} from './packages/villages/src/client/features/founding/villages-founding-draft.js';
function Harness(){
  const initial=()=>['player','buster','feddy','mira','community'].map((id,index)=>{
    const row=newSetupVenue(id,id==='community'?'community':'residence',.5,.5,id==='player');
    return {...row,presentation:{...row.presentation,x:null,y:null},occupancy:{...row.occupancy,residentCharacterId:index>0&&index<4?id:null},privateSpaces:row.privateSpaces?.map(zone=>({...zone,ownerId:id}))};
  });
  const [venues,setVenues]=useState(initial),[workspace,setWorkspace]=useState(emptyFoundingWorkspace),[selected,setSelected]=useState(null);
  const [busy,setBusy]=useState(false),[suggestionsKey,setKey]=useState(''),[problem,setProblem]=useState(''),[source,setSource]=useState('coast');
  const [authored,setAuthored]=useState({}),[saved,setSaved]=useState(false),[review,setReview]=useState(false);
  const authoredRef=useRef(authored),rowsRef=useRef(venues),sourceRef=useRef(source),claim=useRef(false),image=useRef(null),revision=useRef(0);
  useEffect(()=>{authoredRef.current=authored;rowsRef.current=venues;sourceRef.current=source},[authored,venues,source]);
  const persist=async()=>{const result=await saveFoundingDraft('quick-start',{venues,workspace,authored,suggestionsKey},revision.current);revision.current=result.revision;setSaved(true)};
  useEffect(()=>{readFoundingDraft('quick-start').then(draft=>{if(draft){revision.current=draft.revision;setVenues(draft.data.venues);setWorkspace(draft.data.workspace);setAuthored(draft.data.authored);setKey(draft.data.suggestionsKey)}})},[]);
  window.quickState={venues,workspace,authored,suggestionsKey,problem};window.persist=persist;window.changeContext=()=>setSource('new setting');
  const suggest=createFoundingSuggestSetupVenues({setupWorkspace:workspace,setSetupWorkspace:setWorkspace,setupDraftData:{venues,workspace,authored,suggestionsKey},persistSetupDraft:async data=>{const result=await saveFoundingDraft('quick-start',data,revision.current);revision.current=result.revision},personaDraft:'driver',selectedResidentContexts:{},setSetupProblem:setProblem,setSetupSuggestionsBusy:setBusy,setSetupSuggestionsKey:setKey,setSetupVenues:setVenues,setupAuthoredFieldsRef:authoredRef,setupBeginningSourceKey:source,setupBeginningSourceKeyRef:sourceRef,setupFoundingDetails:'We reclaimed shelters at the harbor',setupImageTargetRef:image,setupLorebookDraft:['coast'],setupLoreTokenBudgetDraft:1600,setupSetting:'A dockside settlement of reclaimed shelters',setupName:'Tidebreak',setupWorldFacts:['The tide floods the lower street'],setupImprint:null,setupSuggestionsClaim:claim,setupVenues:venues,setupVenuesRef:rowsRef});
  const patch=usePatchSetupVenue({setSetupAuthoredFields:setAuthored,setSetupVenues:setVenues});
  const select=venue=>{setSelected(venue.id);setWorkspace(state=>({...state,view:'details',paused:true}))};
  const people=['buster','feddy','mira'].map(id=>({id,name:id[0].toUpperCase()+id.slice(1)}));
  return <><style>{VILLAGES_FORGING_STYLES}</style><div className="villages-forging-v2"><header className="marinara-capability-villages-setup-heading"><ol className="villages-forging-steps">{[1,2,3,4,5].map(n=><li key={n} data-active={n===4}>{n}</li>)}</ol><h1>Forging the Village</h1><p>Step 4 · Venues</p></header><main className="villages-forging-body"><h2>Starting Venues</h2><div className="villages-quick-switch"><button aria-pressed={workspace.mode==='quick'} onClick={()=>setWorkspace({...workspace,mode:'quick'})}>Quick Start</button><button aria-pressed={workspace.mode!=='quick'} onClick={()=>setWorkspace({...workspace,mode:'advanced'})}>Advanced</button></div>
  {workspace.mode==='quick'?<QuickStartVenues venues={venues} people={people} selectedId={selected} state={workspace} setting="A dockside settlement of reclaimed shelters" busy={busy} imageBusy={false} suggestionsChanged={!!suggestionsKey&&suggestionsKey!==source} suggestionsKey={suggestionsKey} focusIssue={null} problem={problem} map={<p>Map preview</p>} onState={setWorkspace} onSelect={select} onPatch={venue=>patch(venue.id,()=>venue)} onGenerate={venueId=>suggest({quickStart:true,venueId})} onArrange={()=>setVenues(rows=>arrangeQuickStartVenues(rows,true))} onMove={()=>{}}/>:<FoundingWorkspace venues={venues} people={people} selectedId={selected} placementId={null} state={workspace} map={<p>Map preview</p>} existing={false} mapReady={true} issues={foundingVenueIssues(venues)} focusIssue={null} imageTarget={null} imageBusy={false} suggestionsBusy={busy} suggestionsChanged={false} onState={setWorkspace} onSelect={select} onContinue={()=>{}} onPatch={venue=>patch(venue.id,()=>venue)} onDraft={()=>suggest()} onGenerate={()=>{}} onUpload={()=>{}}/>}
  {problem?<p role="alert">{problem}</p>:null}{saved?<p>Draft saved</p>:null}{review?<p>Review Tidebreak</p>:null}</main><footer className="villages-forging-footer"><button disabled={busy||!!foundingVenueIssues(venues,false,workspace.mode==='quick').length} onClick={()=>setReview(true)}>Review village</button><button onClick={persist}>Save draft</button></footer></div></>;
}
createRoot(document.getElementById('root')).render(<Harness/>);
syncVillagesStyles();
`,
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
});
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
try {
  for (const viewport of [
    { width: 1366, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ]) {
    const name = viewport.width > 600 ? "founding/quick-start/desktop" : "founding/quick-start/phone";
    if (!wantsCase(name)) continue;
    await runCase(name, async () => {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      let count = 0,
        fail = false,
        hold = false,
        release;
      let loseReply = false,
        savedReceipt;
      await page.route("**/api/villages**", async (route) => {
        if (route.request().method() === "GET") {
          assert.ok(route.request().url().includes("/setup/venues/suggestions/"));
          return route.fulfill({ contentType: "application/json", body: JSON.stringify(savedReceipt) });
        }
        assert.ok(route.request().url().endsWith("/setup/venues/suggest"), "no background image or model requests");
        count++;
        const body = route.request().postDataJSON();
        assert.equal(body.mode, "quick-start");
        assert.deepEqual(body.worldFacts, ["The tide floods the lower street"]);
        if (hold)
          await new Promise((resolve) => {
            release = resolve;
          });
        if (fail)
          return route.fulfill({
            status: 400,
            contentType: "application/json",
            body: JSON.stringify({ error: "System connection unavailable. Your draft is unchanged." }),
          });
        const forms = {
          player: "Converted hearse",
          buster: "Sheltered dumpster",
          feddy: "Retired train car",
          mira: "Apartment",
          community: "Covered market",
        };
        const result = {
          venues: body.venues
            .filter((row) => !body.targetVenueId || row.id === body.targetVenueId)
            .map((row) => ({
              id: row.id,
              name:
                row.id === "player" ? "The Last Ride" : row.id === "community" ? "Old Fish Market" : `${row.id} refuge`,
              form: forms[row.id],
              description: "A sheltered doorway beside the docks.",
              layout: row.venueClass === "community" ? "common" : "both",
              commonName: row.id === "player" ? "Front cabin" : "Meeting nook",
              commonPurpose: "Welcoming visitors",
              commonDescription: "Worn seats face a folding table.",
              privateName: "Curtained berth",
              privatePurpose: "Sleeping and storing belongings",
              privateDescription: row.residentCharacterId ? "" : "A padded berth behind a curtain.",
            })),
        };
        savedReceipt = { id: body.actionId, sourceKey: body.sourceKey, status: "complete", error: "", result };
        if (loseReply) {
          loseReply = false;
          return route.abort("failed");
        }
        return route.fulfill({ contentType: "application/json", body: JSON.stringify(savedReceipt) });
      });
      await page.route("http://quick-start.test/", (route) =>
        route.fulfill({
          contentType: "text/html",
          body: `<html><body style="margin:0;background:#121936;color:white;font:16px system-ui"><marinara-capability-villages style="display:block;height:100dvh"><div id="root" style="height:100dvh"></div></marinara-capability-villages><script>${bundle.outputFiles[0].text}</script></body></html>`,
        }),
      );
      await page.goto("http://quick-start.test/");
      const generate = page.getByRole("button", { name: "Generate starting Venues", exact: true });
      await expect(generate).toBeVisible();
      await expect(page.locator("dialog.villages-quick-dialog")).toBeHidden();
      await expect(page.getByRole("button", { name: "Review village", exact: true })).toBeDisabled();
      assert.equal(count, 0, "opening Quick Start is free of model requests");
      const capture = async (stage) => {
        const directory = process.env.VILLAGES_FEEDBACK_SCREENSHOTS ?? process.env.VILLAGES_SCREENSHOT_DIR;
        if (!directory) return;
        await mkdir(directory, { recursive: true });
        await page.screenshot({
          path: join(directory, `quick-start-${viewport.width}-${stage}.png`),
        });
      };
      await capture("generate");
      fail = true;
      await generate.click();
      await expect(page.getByRole("alert")).toHaveText(/System connection unavailable/);
      await expect(generate).toBeEnabled();
      assert.equal(count, 1, "failure does not automatically retry");
      assert.ok(
        (await page.evaluate(() => window.quickState.venues)).every((row) => !row.form && row.presentation.x === null),
      );
      fail = false;
      hold = true;
      await generate.click();
      await expect(page.getByRole("button", { name: "Preparing Venues…", exact: true })).toBeDisabled();
      await expect.poll(() => typeof release).toBe("function");
      hold = false;
      release();
      await expect(page.getByRole("button", { name: "Refresh suggestions", exact: true })).toBeEnabled();
      await expect(page.getByRole("button", { name: "Review village", exact: true })).toBeEnabled();
      assert.equal(count, 2);
      const rows = await page.evaluate(() => window.quickState.venues);
      assert.ok(
        rows
          .filter((row) => row.id !== "community")
          .every((row) => row.layout === "both" && row.spaces.length === 1 && row.privateSpaces.length === 1),
      );
      assert.equal(rows.at(-1).privateSpaces.length, 0);
      assert.ok(rows.every((row) => row.presentation.x !== null && row.presentation.y !== null));
      assert.equal(new Set(rows.map((row) => `${row.presentation.x}:${row.presentation.y}`)).size, 5);
      await capture("review-list");
      const edit = page.getByRole("button", { name: "Edit Your residence", exact: true });
      await edit.click();
      const sheet = page.getByRole("dialog");
      await expect(sheet).toBeVisible();
      await expect(sheet.getByLabel("Physical form", { exact: true })).toHaveValue("Converted hearse");
      await expect(sheet.getByLabel("Exterior appearance", { exact: true })).toBeHidden();
      await sheet.locator('[data-quick-area="exterior"] summary').click();
      await expect(sheet.getByLabel("Exterior appearance", { exact: true })).toHaveCount(1);
      await expect(sheet.getByLabel("Exterior appearance", { exact: true })).toBeVisible();
      await sheet.getByLabel("Venue name", { exact: true }).fill("My Last Ride");
      await capture("residence");
      await sheet.locator('[data-quick-area="exterior"] summary').click();
      const common = sheet.locator('[data-quick-area="common"]');
      const personal = sheet.locator('[data-quick-area="private"]');
      await common.locator("summary").click();
      await personal.locator("summary").click();
      await expect(common.getByLabel("Name", { exact: true })).toHaveValue("Front cabin");
      await common.getByLabel("Name", { exact: true }).fill("My cabin");
      await expect(personal.getByLabel("Appearance", { exact: true })).toHaveValue("A padded berth behind a curtain.");
      await expect(common.getByLabel("Appearance", { exact: true })).toBeVisible();
      await expect(sheet.getByText(/Access:|Invitation required|Visitors need permission/)).toHaveCount(0);
      const dimensions = await sheet.evaluate((node) => ({
        width: node.clientWidth,
        scroll: node.scrollWidth,
        box: node.getBoundingClientRect().toJSON(),
      }));
      assert.ok(dimensions.scroll <= dimensions.width + 1, "no horizontal overflow");
      assert.ok(
        dimensions.box.x >= 0 &&
          dimensions.box.y >= 0 &&
          dimensions.box.right <= viewport.width + 1 &&
          dimensions.box.bottom <= viewport.height + 1,
        "editor fits mobile and desktop",
      );
      await capture("expanded-spaces");
      const savedRows = await page.evaluate(() => window.quickState.venues);
      await sheet.getByRole("button", { name: "Regenerate this Venue", exact: true }).click();
      await expect(sheet.getByRole("button", { name: "Regenerate this Venue", exact: true })).toBeEnabled();
      await expect(sheet.getByLabel("Venue name", { exact: true })).toHaveValue("My Last Ride");
      await expect(common.getByLabel("Name", { exact: true })).toHaveValue("My cabin");
      assert.deepEqual(
        (await page.evaluate(() => window.quickState.venues)).slice(1),
        savedRows.slice(1),
        "single regeneration never rewrites other venues",
      );
      fail = true;
      const beforeFailure = await page.evaluate(() => window.quickState.venues);
      await sheet.getByRole("button", { name: "Regenerate this Venue", exact: true }).click();
      await expect(sheet.getByRole("alert")).toHaveText(/System connection unavailable/);
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues),
        beforeFailure,
        "regeneration failure keeps the complete draft",
      );
      fail = false;
      await sheet.getByRole("button", { name: "Save changes", exact: true }).click();
      await expect(sheet).not.toBeVisible();
      await expect(edit).toBeFocused();
      await page.getByRole("button", { name: "Edit Buster’s residence", exact: true }).click();
      await sheet.locator('[data-quick-area="private"] summary').click();
      await expect(sheet.getByLabel("Appearance", { exact: true })).toBeHidden();
      await expect(sheet.getByLabel("Room specification", { exact: true })).toBeVisible();
      await expect(sheet.getByText(/interior is prepared after founding/)).toBeVisible();
      await sheet.getByRole("button", { name: "Save changes", exact: true }).click();
      await page.getByRole("button", { name: "Advanced", exact: true }).click();
      await expect(page.locator(".villages-workspace")).toBeVisible();
      await page.getByRole("button", { name: "Quick Start", exact: true }).click();
      await expect(page.getByRole("button", { name: "Edit Your residence", exact: true })).toContainText(
        "My Last Ride",
      );
      await page.getByRole("button", { name: "Save draft", exact: true }).click();
      await expect(page.getByText("Draft saved", { exact: true })).toBeVisible();
      await page.reload();
      await expect(page.getByRole("button", { name: "Edit Your residence", exact: true })).toContainText(
        "My Last Ride",
      );
      await expect(page.getByRole("button", { name: "Quick Start", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      assert.equal(count, 4, "resume and view switches do not request models");
      loseReply = true;
      await page.getByRole("button", { name: "Refresh suggestions", exact: true }).click();
      await expect(page.getByRole("button", { name: "Check suggestions", exact: true })).toBeEnabled();
      assert.equal(count, 5);
      await page.reload();
      await expect(page.getByRole("button", { name: "Check suggestions", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Check suggestions", exact: true }).click();
      await expect(page.getByRole("button", { name: "Refresh suggestions", exact: true })).toBeEnabled();
      assert.equal(count, 5, "reloading and checking a lost reply uses GET without another model request");
      hold = true;
      release = undefined;
      await page.getByRole("button", { name: "Refresh suggestions", exact: true }).click();
      await expect.poll(() => typeof release).toBe("function");
      await page.evaluate(() => window.changeContext());
      await expect(page.getByText(/Founding choices changed/)).toBeVisible();
      hold = false;
      release();
      await expect(page.getByRole("alert")).toHaveText(/people or setting changed/);
      await expect(page.getByRole("button", { name: "Edit Your residence", exact: true })).toContainText(
        "My Last Ride",
      );
      await page.getByRole("button", { name: "Review village", exact: true }).click();
      await expect(page.getByText("Review Tidebreak", { exact: true })).toBeVisible();
      assert.deepEqual(errors, []);
      await context.close();
    });
  }
} finally {
  await browser.close();
}
console.log(
  "Quick Start mobile/desktop: inline space review, generation/retry fences, authored edits, modes and IndexedDB resume pass (mocked APIs).",
);
