import { mockEngineLookups, fulfill, abort } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
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
import {emptyFoundingWorkspace,foundingVenueIssues} from './packages/villages/src/client/features/founding/villages-founding-workspace-state.js';
import {newSetupVenue} from './packages/villages/src/client/features/founding/FoundingPanels.js';
import {createFoundingSuggestSetupVenues} from './packages/villages/src/client/features/founding/setup-controller.js';
import {usePatchSetupVenue} from './packages/villages/src/client/features/founding/actions.js';
import {arrangeQuickStartVenues} from './packages/villages/src/client/features/founding/quick-start-placement.js';
import {saveDeviceDraft,readDeviceDraft} from './packages/villages/src/client/shared/device-drafts.js';
function Harness(){
  const initial=()=>arrangeQuickStartVenues(['player','buster','feddy','mira','community'].map((id,index)=>{
    const row=newSetupVenue(id,id==='community'?'community':'residence',.5,.5,id==='player');
    return {...row,presentation:{...row.presentation,x:null,y:null},occupancy:{...row.occupancy,residentCharacterId:index>0&&index<4?id:null},privateSpaces:row.privateSpaces?.map(zone=>({...zone,ownerId:id}))};
  }));
  const [venues,setVenues]=useState(initial),[workspace,setWorkspace]=useState(emptyFoundingWorkspace),[selected,setSelected]=useState(null);
  const [busy,setBusy]=useState(false),[suggestionsKey,setKey]=useState(''),[problem,setProblem]=useState(''),[source,setSource]=useState('coast');
  const [authored,setAuthored]=useState({}),[saved,setSaved]=useState(false),[review,setReview]=useState(false);
  const authoredRef=useRef(authored),rowsRef=useRef(venues),sourceRef=useRef(source),claim=useRef(false),image=useRef(null),revision=useRef(0);
  useEffect(()=>{authoredRef.current=authored;rowsRef.current=venues;sourceRef.current=source},[authored,venues,source]);
  const persist=async()=>{const result=await saveDeviceDraft('quick-start',{venues,workspace,authored,suggestionsKey},revision.current);revision.current=result.revision;setSaved(true)};
  useEffect(()=>{readDeviceDraft('quick-start').then(draft=>{if(draft){revision.current=draft.revision;setVenues(draft.data.venues);setWorkspace(draft.data.workspace);setAuthored(draft.data.authored);setKey(draft.data.suggestionsKey)}})},[]);
  window.quickState={venues,workspace,authored,suggestionsKey,problem};window.persist=persist;window.changeContext=()=>setSource('new setting');window.clearProblem=()=>setProblem('');
  const suggest=createFoundingSuggestSetupVenues({setupWorkspace:workspace,setSetupWorkspace:setWorkspace,onQuickStartApplied:()=>{setAuthored({});authoredRef.current={};setSelected(null)},setupDraftData:{venues,workspace,authored,suggestionsKey},persistSetupDraft:async data=>{const result=await saveDeviceDraft('quick-start',data,revision.current);revision.current=result.revision},personaDraft:'driver',selectedResidentAdmissions:{},setSetupProblem:setProblem,setSetupSuggestionsBusy:setBusy,setSetupSuggestionsKey:setKey,setSetupVenues:setVenues,setupAuthoredFieldsRef:authoredRef,setupBeginningSourceKey:source,setupBeginningSourceKeyRef:sourceRef,setupImageTargetRef:image,setupLorebookDraft:['coast'],setupLoreTokenBudgetDraft:1600,setupSetting:'A dockside settlement of reclaimed shelters',setupName:'Tidebreak',setupWorldFacts:['The tide floods the lower street'],setupSuggestionsClaim:claim,setupVenues:venues,setupVenuesRef:rowsRef});
  const patch=usePatchSetupVenue({setSetupAuthoredFields:setAuthored,setSetupVenues:setVenues});
  window.reassign=()=>setVenues(rows=>rows.map(row=>row.id==='buster'?{...row,occupancy:{...row.occupancy,residentCharacterId:'another-character'}}:row));
  window.referenceZone=id=>patch('player',venue=>({...venue,destinations:{player:{sleep:id,home:venue.spaces[0].id}},spaces:venue.spaces.map((zone,index)=>index===0?{...zone,connectedTo:[...(zone.connectedTo??[]),id]}:zone)}));
  const upload=(venue,area,file,id)=>{const image={id:'fixture',ref:'global-gallery:fixture',url:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='};patch(venue.id,row=>area==='exterior'?{...row,presentation:{...row.presentation,image}}:{...row,[area==='private'?'privateSpaces':'spaces']:(row[area==='private'?'privateSpaces':'spaces']??[]).map(zone=>zone.id===id?{...zone,image}:zone)});};
  const select=venue=>{setSelected(venue.id);setWorkspace(state=>({...state,view:'details',paused:true}))};
  const people=['buster','feddy','mira'].map(id=>({id,name:id[0].toUpperCase()+id.slice(1)}));
  return <><style>{VILLAGES_FORGING_STYLES}</style><div className="villages-forging-v2" data-map-first="true"><header className="marinara-capability-villages-setup-heading villages-forging-heading"><ol className="villages-forging-steps">{[1,2,3,4,5].map(n=><li key={n} data-active={n===4}>{n}</li>)}</ol><h1>Forging the Village</h1></header><main className="villages-forging-body"><h2>Starting Venues</h2><div className="villages-quick-switch"><QuickStartButton busy={busy} pending={!!workspace.suggestionRequest} onGenerate={()=>suggest({quickStart:true})}/></div>
  <QuickStartVenues venues={venues} people={people} selectedId={selected} state={workspace} busy={busy} imageBusy={false} focusIssue={null} problem={problem} map={<p>Map preview</p>} onState={setWorkspace} onSelect={select} onPatch={venue=>patch(venue.id,()=>venue)} onGenerateImage={()=>{}} onUploadImage={upload} onArrange={()=>setVenues(rows=>arrangeQuickStartVenues(rows,true))} onMove={venue=>{setSelected(venue?.id??null);setWorkspace(state=>({...state,view:"map",paused:!venue}))}}/>
  {problem?<p role="alert">{problem}</p>:null}{saved?<p>Draft saved</p>:null}{review?<p>Review Tidebreak</p>:null}</main><footer className="villages-forging-footer"><button disabled={busy||!!foundingVenueIssues(venues,false).length} onClick={()=>setReview(true)}>Review village</button><button onClick={persist}>Save draft</button></footer></div></>;
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
const browser = await chromium.launch({
  headless: true,
});
await withBrowser(browser, async () => {
  for (const viewport of [
    { width: 1366, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ]) {
    const name = viewport.width > 600 ? "founding/quick-start/desktop" : "founding/quick-start/phone";
    if (!wantsCase(name)) continue;
    await runCase(name, async () => {
      const context = await browser.newContext({ viewport });
      await mockEngineLookups(context);
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
          return fulfill(route, { contentType: "application/json", body: JSON.stringify(savedReceipt) });
        }
        assert.ok(route.request().url().endsWith("/setup/venues/suggest"), "no background image or model requests");
        count++;
        const body = route.request().postDataJSON();
        assert.equal(body.mode, "quick-start");
        assert.ok(body.venues.every((row) => !row.name && !row.form && !row.description && !row.spaceDescription));
        assert.deepEqual(body.worldFacts, ["The tide floods the lower street"]);
        if (hold)
          await new Promise((resolve) => {
            release = resolve;
          });
        if (fail)
          return fulfill(route, {
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
              privateDescription: row.residentCharacterId
                ? "A resident berth with a blue blanket."
                : "A padded berth behind a curtain.",
            })),
        };
        savedReceipt = { id: body.actionId, sourceKey: body.sourceKey, status: "complete", error: "", result };
        if (loseReply) {
          loseReply = false;
          return abort(route, "failed");
        }
        return fulfill(route, { contentType: "application/json", body: JSON.stringify(savedReceipt) });
      });
      await page.route("http://quick-start.test/", (route) =>
        fulfill(route, {
          contentType: "text/html",
          body: `<html><body style="margin:0;background:#121936;color:white;font:16px system-ui"><marinara-capability-villages style="display:block;height:100dvh"><div id="root" style="height:100dvh"></div></marinara-capability-villages><script>${bundle.outputFiles[0].text}</script></body></html>`,
        }),
      );
      await page.goto("http://quick-start.test/");
      const sheet = page.locator("dialog.villages-quick-dialog");
      const selector = page.getByLabel("Move Venue", { exact: true });
      const venueEntry = (id) => selector.locator('option[value="' + id + '"]');
      const openVenue = async (id) => {
        await selector.selectOption(id);
        await page.getByRole("button", { name: "Edit Venue", exact: true }).click();
      };
      const selectZone = async (id) => {
        const navigation = sheet.getByRole("group", { name: "Zone navigation", exact: true });
        for (let i = 0; i < 7; i++) {
          if ((await navigation.getAttribute("data-zone-id")) === id) return;
          await sheet.getByRole("button", { name: "Next Zone", exact: true }).click();
        }
        assert.fail(`Zone ${id} not reachable through navigation`);
      };
      const capture = async (stage) => {
        const directory = process.env.VILLAGES_FEEDBACK_SCREENSHOTS ?? process.env.VILLAGES_SCREENSHOT_DIR;
        if (!directory) return;
        await mkdir(directory, { recursive: true });
        await page.screenshot({
          path: join(directory, `quick-start-${viewport.width}-${stage}.png`),
        });
      };

      const generate = page.getByRole("button", { name: "Quick Start", exact: true });
      const confirm = page.getByRole("dialog", { name: "Quick Start", exact: true });
      const generateConfirmed = async () => {
        await page.getByRole("button", { name: /^(Quick Start|Check Quick Start)$/ }).click();
        await expect(confirm).toContainText("Quick Start will overwrite any changes you’ve made to the Venues.");
        await confirm.getByRole("button", { name: "Confirm", exact: true }).click();
      };
      await expect(generate).toBeVisible();
      await expect(page.locator("dialog.villages-quick-dialog")).toBeHidden();
      await expect(page.getByRole("button", { name: "Review village", exact: true })).toBeEnabled();
      await generate.click();
      await expect(confirm).toBeVisible();
      assert.equal(count, 0, "confirmation makes no model request");
      await confirm.getByRole("button", { name: "Cancel", exact: true }).click();
      assert.equal(count, 0, "cancelling a pristine template makes no model request");
      await openVenue("player");
      const quickLayout = page.locator("dialog.villages-quick-dialog").locator(".villages-zone-map");
      await expect(page.locator("dialog.villages-quick-dialog").locator("summary")).toHaveCount(0);
      await expect(
        page.locator("dialog.villages-quick-dialog").getByLabel("Selected Zone", { exact: true }),
      ).toHaveCount(0);
      const venueTab = page.getByRole("tab", { name: "Venue", exact: true });
      await venueTab.focus();
      await venueTab.press("ArrowRight");
      await expect(sheet.getByRole("tab", { name: "Zone", exact: true })).toBeFocused();
      await sheet.getByRole("tab", { name: "Zone", exact: true }).press("ArrowLeft");
      await expect(venueTab).toBeFocused();
      await expect(sheet.getByRole("tab")).toHaveCount(2);
      await expect(sheet.getByLabel("Physical Form", { exact: true })).toBeVisible();
      await expect(quickLayout.locator("[data-layout-zone]")).toHaveCount(3);
      await expect(sheet.getByRole("button", { name: "Add private Zone", exact: true })).toHaveCount(0);
      await expect(sheet.getByRole("button", { name: "Regenerate this Venue", exact: true })).toHaveCount(0);
      await expect(sheet.getByText(/Drag Zones|\d+\s*\/\s*6 Zones/)).toHaveCount(0);
      const toolbarButtons = await quickLayout
        .locator(".villages-zone-map-toolbar")
        .getByRole("button")
        .allTextContents();
      assert.deepEqual(toolbarButtons, ["Add Zone", "Remove Zone", "Connect Zones"]);
      const toolbarBoxes = await quickLayout
        .locator(".villages-zone-map-toolbar button")
        .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
      assert.ok(
        toolbarBoxes.every(
          (box) =>
            Math.abs(box.y - toolbarBoxes[0].y) < 1 && box.height >= 44 && box.x >= 0 && box.right <= viewport.width,
        ),
        "map controls share one row of touch targets within the viewport",
      );
      assert.ok(
        await quickLayout.evaluate((node) => node.parentElement.lastElementChild === node),
        "no extra Venue controls follow the map tool",
      );
      await quickLayout.locator('[data-layout-zone="common:base"]').click();
      await quickLayout.locator('[data-layout-zone="common:base"]').press("ArrowRight");
      assert.equal((await page.evaluate(() => window.quickState.venues))[0].zoneLayout["common:base"].x, 1);
      const rectangles = await quickLayout
        .locator("[data-layout-zone]")
        .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
      for (let i = 0; i < rectangles.length; i++)
        for (let j = i + 1; j < rectangles.length; j++) {
          const a = rectangles[i],
            b = rectangles[j];
          assert.ok(
            a.right <= b.left + 0.1 || b.right <= a.left + 0.1 || a.bottom <= b.top + 0.1 || b.bottom <= a.top + 0.1,
            "Quick Start Zones remain separate at this viewport",
          );
        }
      await capture("layout");
      await quickLayout.getByRole("button", { name: "Connect Zones", exact: true }).click();
      await quickLayout
        .getByRole("button", {
          name: /Remove connection Common Space to Entrance|Remove connection Entrance to Common Space/,
        })
        .click();
      await expect(sheet.getByText(/Every space needs|Zones cannot overlap/)).toHaveCount(0);
      await expect(sheet.getByRole("alert")).toHaveCount(0);
      await sheet.getByRole("button", { name: "Done", exact: true }).click();
      await expect(sheet).toBeVisible();
      await expect(sheet.getByRole("alert")).toHaveText("Cannot save Venue layout: Unreachable Zones.");
      await quickLayout.locator('[data-layout-zone="common:base"]').click();
      await quickLayout.locator('[data-layout-zone="exterior"]').click();
      await quickLayout.getByRole("button", { name: "Done connecting", exact: true }).click();
      await expect(sheet.getByRole("alert")).toHaveCount(0);
      await expect(sheet.getByRole("button", { name: "Edit Zone", exact: true })).toHaveCount(0);
      await page.locator("dialog.villages-quick-dialog").getByRole("tab", { name: "Zone", exact: true }).click();
      await expect(sheet.getByRole("group", { name: "Zone navigation", exact: true })).toHaveAttribute(
        "data-zone-id",
        "common:base",
      );
      await venueTab.click();
      await page
        .locator("dialog.villages-quick-dialog")
        .getByLabel("Physical Form", { exact: true })
        .fill("Authored vehicle");
      await page.locator("dialog.villages-quick-dialog").getByRole("button", { name: "Done", exact: true }).click();
      await capture("generate");
      fail = true;
      await generateConfirmed();
      await expect(page.getByRole("alert")).toHaveText(/System connection unavailable/);
      await expect(generate).toBeEnabled();
      assert.equal(count, 1, "failure does not automatically retry");
      assert.equal((await page.evaluate(() => window.quickState.venues))[0].form, "Authored vehicle");
      fail = false;
      hold = true;
      await generateConfirmed();
      await expect(page.getByRole("button", { name: "Generating Venues…", exact: true })).toBeDisabled();
      await expect.poll(() => typeof release).toBe("function");
      hold = false;
      release();
      await expect(page.getByRole("button", { name: "Quick Start", exact: true })).toBeEnabled();
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
      assert.deepEqual(
        await selector.locator('option:not([value=""])').allTextContents(),
        rows.map((row) => row.name),
      );
      const toolbarBox = await page.getByRole("group", { name: "Venue placement controls", exact: true }).boundingBox();
      assert.ok(toolbarBox.height <= 60, "One compact toolbar leaves room for the map");
      await capture("review-list");
      const edit = page.getByRole("button", { name: "Edit Venue", exact: true });
      await openVenue("player");
      await expect(sheet).toBeVisible();
      await expect(sheet.getByLabel("Physical Form", { exact: true })).toHaveValue("Converted hearse");
      await sheet.getByLabel("Venue Name", { exact: true }).fill("My Last Ride");
      await capture("residence");
      await sheet.getByRole("tab", { name: "Zone", exact: true }).click();
      await expect(sheet.getByLabel("Long-term details", { exact: true })).toHaveCount(1);
      await expect(sheet.getByLabel("Long-term details", { exact: true })).toBeVisible();
      await expect(sheet.getByLabel("Zone name", { exact: true })).toHaveCount(0);
      await expect(sheet.getByLabel("Zone access", { exact: true })).toHaveCount(0);
      await expect(sheet.getByLabel("Used for", { exact: true })).toHaveCount(0);
      await expect(sheet.getByRole("group", { name: "Zone navigation", exact: true })).toHaveAttribute(
        "data-zone-id",
        "exterior",
      );
      await selectZone("common:base");
      await expect(sheet.getByLabel("Zone name", { exact: true })).toHaveValue("Front cabin");
      await sheet.getByLabel("Zone name", { exact: true }).fill("My cabin");
      await expect(sheet.getByLabel("Long-term details", { exact: true })).toBeVisible();
      await expect(sheet.getByText(/Zone \d+ of \d+/)).toHaveCount(0);
      await sheet.getByRole("button", { name: "Public access", exact: true }).click();
      await expect(sheet.getByRole("button", { name: "Public access", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      assert.equal((await page.evaluate(() => window.quickState.venues))[0].spaces[0].access.mode, "public");
      await sheet.getByRole("button", { name: "Permission required", exact: true }).click();
      await expect(sheet.getByRole("button", { name: "Permission required", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      assert.equal(
        (await page.evaluate(() => window.quickState.venues))[0].spaces[0].access.mode,
        "permission-required",
      );
      const fieldStyles = await sheet.getByLabel("Zone name", { exact: true }).evaluate((node) => ({
        border: getComputedStyle(node).border,
        background: getComputedStyle(node).backgroundColor,
        radius: getComputedStyle(node).borderRadius,
      }));
      const otherStyles = await sheet.getByLabel("Used for", { exact: true }).evaluate((node) => ({
        border: getComputedStyle(node).border,
        background: getComputedStyle(node).backgroundColor,
        radius: getComputedStyle(node).borderRadius,
      }));
      assert.deepEqual(fieldStyles, otherStyles, "Zone name uses the same text box as other fields");
      const arrow = await sheet.getByRole("button", { name: "Previous Zone", exact: true }).evaluate((node) => ({
        width: node.clientWidth,
        height: node.clientHeight,
        background: getComputedStyle(node).backgroundColor,
      }));
      assert.ok(Math.abs(arrow.width - arrow.height) < 2 && arrow.width >= 42, "Zone arrows have square touch targets");
      assert.equal(arrow.background, "rgb(25, 44, 76)");
      const sheetBox = await sheet.boundingBox(),
        doneBox = await sheet.getByRole("button", { name: "Done", exact: true }).boundingBox();
      assert.ok(sheetBox.y + sheetBox.height - doneBox.y - doneBox.height <= 16, "Done has no extra padding below it");
      await capture("zone");
      await expect(sheet.getByRole("button", { name: "Generate image", exact: true })).toHaveCount(0);
      const countBeforeArtwork = count;
      await sheet.getByRole("button", { name: "Artwork", exact: true }).click();
      const firstArtwork = page.getByRole("dialog", { name: "Artwork for My cabin", exact: true });
      await expect(firstArtwork).toBeVisible();
      assert.equal(count, countBeforeArtwork, "opening artwork never requests a model");
      await firstArtwork.press("Escape");
      await expect(firstArtwork).toHaveCount(0);
      await expect(sheet.getByRole("button", { name: "Artwork", exact: true })).toBeFocused();
      if (viewport.width === 390) {
        await page.evaluate(() => (document.documentElement.style.fontSize = "20px"));
        const appearance = await sheet.getByLabel("Long-term details", { exact: true }).boundingBox();
        const footer = await sheet.getByRole("button", { name: "Done", exact: true }).boundingBox();
        assert.ok(appearance.y + appearance.height <= footer.y, "the complete Zone form fits a phone with larger text");
        await capture("zone-large-text");
        await page.evaluate(() => (document.documentElement.style.fontSize = ""));
      }
      await selectZone("private:base");
      await expect(sheet.getByLabel("Long-term details", { exact: true })).toHaveValue(
        "A padded berth behind a curtain.",
      );
      await expect(sheet.getByText(/Access:|Invitation required|Visitors need permission/)).toHaveCount(0);
      const dimensions = await sheet.evaluate((node) => ({
        width: node.clientWidth,
        scroll: node.scrollWidth,
        height: node.clientHeight,
        scrollHeight: node.scrollHeight,
        box: node.getBoundingClientRect().toJSON(),
      }));
      assert.ok(dimensions.scroll <= dimensions.width + 1, "no horizontal overflow");
      if (viewport.width > 600)
        assert.ok(
          dimensions.scrollHeight <= dimensions.height + 1,
          `desktop editor needs no internal scrolling: ${JSON.stringify(dimensions)}`,
        );
      assert.ok(
        dimensions.box.x >= 0 &&
          dimensions.box.y >= 0 &&
          dimensions.box.right <= viewport.width + 1 &&
          dimensions.box.bottom <= viewport.height + 1,
        "editor fits mobile and desktop",
      );
      await capture("expanded-spaces");
      await sheet.getByRole("tabpanel").evaluate((node) => node.scrollTo({ top: node.scrollHeight }));
      for (const control of [sheet.getByRole("tablist"), sheet.getByRole("button", { name: "Done", exact: true })]) {
        const box = await control.boundingBox();
        assert.ok(
          box.y >= 0 && box.y + box.height <= viewport.height + 1,
          "tabs and Done stay on screen while the panel scrolls",
        );
      }
      await sheet.getByRole("button", { name: "Done", exact: true }).click();
      await expect(sheet).not.toBeVisible();
      await expect(edit).toBeFocused();
      await openVenue("buster");
      await sheet.getByRole("tab", { name: "Zone", exact: true }).click();
      await selectZone("private:base");
      await expect(sheet.getByLabel("Long-term details", { exact: true })).toHaveValue(
        "A resident berth with a blue blanket.",
      );
      await expect(sheet.getByLabel("Room Specification", { exact: true })).toHaveCount(0);
      await expect(sheet.getByText(/private interior stays hidden/)).toHaveCount(0);
      await sheet.getByRole("button", { name: "Artwork", exact: true }).click();
      await expect(sheet.getByLabel("Zone artwork")).toBeVisible();
      await sheet.getByRole("button", { name: "Close artwork", exact: true }).click();
      await sheet.getByRole("button", { name: "Done", exact: true }).click();
      await openVenue("community");
      await sheet.getByRole("tab", { name: "Zone", exact: true }).click();
      await selectZone("common:base");
      await expect(sheet.getByRole("button", { name: "Permission required", exact: true })).toBeEnabled();
      await sheet.getByRole("button", { name: "Done", exact: true }).click();
      await openVenue("player");
      await sheet.getByRole("tab", { name: "Venue", exact: true }).click();
      await sheet.getByRole("button", { name: "Add Zone", exact: true }).click();
      await expect(sheet.getByRole("tab", { name: "Venue", exact: true })).toHaveAttribute("aria-selected", "true");
      await sheet.getByRole("tab", { name: "Zone", exact: true }).click();
      await expect(sheet.getByLabel("Used for", { exact: true })).toHaveValue("");
      await expect(sheet.getByLabel("Long-term details", { exact: true })).toHaveValue("");
      await sheet.getByLabel("Zone name", { exact: true }).fill("Kitchen");
      await sheet.getByLabel("Used for", { exact: true }).fill("Cooking");
      await sheet.getByLabel("Long-term details", { exact: true }).fill("A sunny kitchen.");
      await page.evaluate(() => window.clearProblem());
      await sheet.getByRole("button", { name: "Artwork", exact: true }).click();
      const artwork = page.getByRole("dialog", { name: "Artwork for Kitchen", exact: true });
      await artwork
        .getByLabel("Upload Zone image", { exact: true })
        .evaluate((input) => input.dispatchEvent(new Event("cancel", { bubbles: true })));
      await expect(sheet).toBeVisible();
      await expect(artwork.getByLabel("Upload Zone image", { exact: true })).toBeFocused();
      await artwork.getByLabel("Upload Zone image", { exact: true }).setInputFiles({
        name: "kitchen.png",
        mimeType: "image/png",
        buffer: Buffer.from("test"),
      });
      await expect(artwork.getByRole("img", { name: "Artwork for Kitchen" })).toBeVisible();
      await capture("artwork");
      await artwork.getByRole("button", { name: "Close artwork", exact: true }).click();
      await expect(sheet.getByRole("button", { name: "Edit Zone artwork", exact: true })).toBeFocused();
      await expect(
        sheet.getByRole("tabpanel").getByRole("img", { name: "Artwork for Kitchen", exact: true }),
      ).toBeVisible();
      await capture("inline-image");
      if (viewport.width < 600) {
        const panelSize = await sheet
          .getByRole("tabpanel")
          .evaluate((node) => ({ height: node.clientHeight, scroll: node.scrollHeight }));
        assert.ok(
          panelSize.scroll <= panelSize.height + 1,
          `the healthy Zone form with an assigned image needs no phone scrolling: ${viewport.width} ${JSON.stringify(panelSize)}`,
        );
        const image = await sheet
          .getByRole("tabpanel")
          .getByRole("img", { name: "Artwork for Kitchen", exact: true })
          .boundingBox();
        const footer = await sheet.getByRole("button", { name: "Done", exact: true }).boundingBox();
        assert.ok(
          image.y + image.height <= footer.y,
          "assigned image is visible beside Appearance without scrolling on a phone",
        );
      }
      await capture("inline-image");
      const added = (await page.evaluate(() => window.quickState.venues))[0].spaces.find(
        (zone) => zone.name === "Kitchen",
      );
      assert.ok(added.id.startsWith("zone:"));
      assert.deepEqual(added.connectedTo, ["exterior"]);
      assert.equal(added.access.mode, "permission-required");
      assert.equal(added.image.ref, "global-gallery:fixture");
      await sheet.getByRole("button", { name: "Done", exact: true }).click();
      await expect(page.getByRole("button", { name: "Advanced", exact: true })).toHaveCount(0);
      await expect(venueEntry("player")).toContainText("My Last Ride");
      await page.getByRole("button", { name: "Save draft", exact: true }).click();
      await expect(page.getByText("Draft saved", { exact: true })).toBeVisible();
      await page.reload();
      await expect(venueEntry("player")).toContainText("My Last Ride");

      await openVenue("player");
      await sheet.getByRole("tab", { name: "Zone", exact: true }).click();
      await selectZone(added.id);
      await expect(sheet.getByLabel("Long-term details", { exact: true })).toHaveValue("A sunny kitchen.");
      await expect(
        sheet.getByRole("tabpanel").getByRole("img", { name: "Artwork for Kitchen", exact: true }),
      ).toBeVisible();
      await sheet.getByRole("button", { name: "Edit Zone artwork", exact: true }).click();
      await expect(artwork.getByRole("img", { name: "Artwork for Kitchen" })).toBeVisible();
      await artwork.getByRole("button", { name: "Close artwork", exact: true }).click();
      await expect(sheet.getByRole("button", { name: "Edit Zone artwork", exact: true })).toBeFocused();
      await page.evaluate((id) => window.referenceZone(id), added.id);
      await sheet.getByRole("tab", { name: "Venue", exact: true }).click();
      await expect(sheet.getByRole("button", { name: "Remove Zone", exact: true })).toBeEnabled();
      await sheet.getByRole("button", { name: "Remove Zone", exact: true }).click();
      const afterRemoval = (await page.evaluate(() => window.quickState.venues))[0];
      assert.ok(
        ![...afterRemoval.spaces, ...afterRemoval.privateSpaces].some(
          (zone) => zone.id === added.id || zone.connectedTo?.includes(added.id),
        ),
        "removing a connected Zone prunes incoming connections",
      );
      assert.equal(afterRemoval.destinations.player.sleep, undefined);
      assert.equal(afterRemoval.destinations.player.home, "common:base");
      await sheet.getByRole("button", { name: "Done", exact: true }).click();
      assert.equal(count, 2, "resume and view switches do not request models");
      const edited = await page.evaluate(() => window.quickState.venues);
      await generate.click();
      await confirm.getByRole("button", { name: "Cancel", exact: true }).click();
      assert.deepEqual(await page.evaluate(() => window.quickState.venues), edited);
      assert.equal(count, 2, "cancelling after edits leaves them intact without a model request");
      loseReply = true;
      await generateConfirmed();
      await expect(page.getByRole("button", { name: "Check Quick Start", exact: true })).toBeEnabled();
      assert.equal(count, 3);
      await page.reload();
      await expect(page.getByRole("button", { name: "Check Quick Start", exact: true })).toBeVisible();
      await generateConfirmed();
      await expect(page.getByRole("button", { name: "Quick Start", exact: true })).toBeEnabled();
      assert.equal(count, 3, "reloading and checking a lost reply uses GET without another model request");
      const replaced = (await page.evaluate(() => window.quickState.venues))[0];
      assert.equal(replaced.name, "The Last Ride");
      assert.equal(replaced.spaces.length, 1);
      assert.equal(replaced.spaces[0].name, "Front cabin");
      assert.equal(replaced.spaces[0].image, null);
      assert.equal(replaced.destinations, undefined);
      assert.deepEqual(await page.evaluate(() => window.quickState.authored), {});
      loseReply = true;
      await generateConfirmed();
      await expect(page.getByRole("button", { name: "Check Quick Start", exact: true })).toBeEnabled();
      await page.evaluate(() => window.reassign());
      const reassigned = await page.evaluate(() => window.quickState.venues);
      await generateConfirmed();
      await expect(page.getByRole("alert")).toHaveText(/Founding choices changed/);
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues),
        reassigned,
        "a recovered template cannot be rebound to a different resident",
      );
      assert.equal(count, 4, "rejecting stale owner context only reads the old receipt");
      hold = true;
      release = undefined;
      await generateConfirmed();
      await expect.poll(() => typeof release).toBe("function");
      await page.evaluate(() => window.changeContext());

      hold = false;
      release();
      await expect(page.getByRole("alert")).toHaveText(/people or setting changed/);
      await expect(venueEntry("player")).toContainText("The Last Ride");
      await page.getByRole("button", { name: "Review village", exact: true }).click();
      await expect(page.getByText("Review Tidebreak", { exact: true })).toBeVisible();
      assert.deepEqual(errors, []);
      await context.close();
    });
  }
});
console.log(
  "Quick Start mobile/desktop: inline space review, generation/retry fences, confirmation, full overwrite, modes and IndexedDB resume pass (mocked APIs).",
);
