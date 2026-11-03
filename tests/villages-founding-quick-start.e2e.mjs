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
import {assignFoundingHome,reconcileFoundingRoster} from './packages/villages/src/client/features/founding/founding-homes.js';
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
 const data={venues,workspace,authored,suggestionsKey:key};
 const suggest=createFoundingSuggestSetupVenues({signal,setupWorkspace:workspace,setSetupWorkspace:setWorkspace,setupDraftData:data,persistSetupDraft:persist,personaDraft:'driver',selectedResidentAdmissions:{},setSetupProblem:setProblem,setSetupSuggestionsBusy:setBusy,setSetupSuggestionsKey:setKey,setSetupVenues:setVenues,setupAuthoredFieldsRef:authoredRef,setupBeginningSourceKey:source,setupBeginningSourceKeyRef:sourceRef,setupImageTargetRef:image,setupLorebookDraft:[],setupLoreTokenBudgetDraft:1600,setupSetting:'An oceanfront community',setupName:'Tidebreak',setupContext:{rules:'',circumstances:[],communityVenueId:'community'},setupSuggestionsClaim:claim,setupVenues:venues,setupVenuesRef:rowsRef});
 useVisibleInterval(signal=>{if(workspace.suggestionRequest&&!workspace.suggestionRequest.failure)return suggest(undefined,signal)},workspace.suggestionRequest&&!workspace.suggestionRequest.failure?2000:null,visible);
 window.setFoundingVisible=setVisible;
 const patch=usePatchSetupVenue({setSetupAuthoredFields:setAuthored,setSetupVenues:setVenues});
 const select=venue=>{setSelected(venue.id);setMoving(null);setWorkspace(state=>({...state,view:'details',paused:true}))};
 const upload=(venue,area,file,id)=>{const image={id:'fixture',ref:'global-gallery:fixture',url:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='};patch(venue.id,row=>area==='exterior'?{...row,presentation:{...row.presentation,image}}:{...row,[area==='private'?'privateSpaces':'spaces']:(row[area==='private'?'privateSpaces':'spaces']??[]).map(zone=>zone.id===id?{...zone,image}:zone)});};
 window.quickState={venues,workspace,authored,suggestionsKey:key,problem,moving};
 window.reassign=()=>setVenues(rows=>assignFoundingHome(rows,'founding-home:bryn','ada',true));
 window.changeContext=()=>setSource('changed setting');
 return <><style>{VILLAGES_FORGING_STYLES}</style><div className='villages-forging-v2'><header className='villages-forging-heading'><h1>Founding Venues</h1></header><main className='villages-forging-body'>
 <QuickStartVenues communityVenueId='community' venues={venues} people={people} selectedId={selected} movingVenueId={moving} state={workspace} busy={busy} imageBusy={false} focusIssue={null} problem={problem} map={<p>Map preview</p>} onState={setWorkspace} onSelect={select} onPatch={venue=>patch(venue.id,()=>venue)} onAssignHome={(venue,id,assigned)=>{try{setVenues(assignFoundingHome(venues,venue.id,id,assigned));setProblem('')}catch(e){setProblem(e.message)}}} onGenerateImage={()=>{}} onUploadImage={upload} onArrange={()=>setVenues(rows=>arrangeQuickStartVenues(rows,true))} onMove={venue=>{setMoving(venue?.id??null);setWorkspace(state=>({...state,view:'map',paused:!venue}))}} onRemove={venue=>setVenues(rows=>rows.filter(row=>row.id!==venue.id))}
 actions={<>{['residence','other'].map(kind=><button key={kind} onClick={()=>{const venue=newSetupVenue('new-'+kind,kind,.5,.5);venue.name=kind==='residence'?'New home':'New Venue';venue.presentation={...venue.presentation,x:null,y:null};setVenues(rows=>[...rows,venue]);select(venue)}}>{kind==='residence'?'+ Add home':'+ Add Venue'}</button>)}{workspace.suggestionRequest?<QuickStartButton busy={busy} pending={!workspace.suggestionRequest.failure} failed={!!workspace.suggestionRequest.failure} onGenerate={()=>suggest({...workspace.suggestionRequest})}/>:null}</>}
 suggestions={<QuickStartButton busy={busy} pending={!!workspace.suggestionRequest&&!workspace.suggestionRequest.failure} failed={!!workspace.suggestionRequest?.failure&&workspace.suggestionRequest.venueId===selected} onGenerate={()=>suggest({venueId:selected})}/>}/>
 {problem&&workspace.view!=='details'?<p role='alert'>{problem}</p>:null}{saved?<p>Draft saved</p>:null}</main><footer className='villages-forging-footer'><button onClick={()=>persist(data)}>Save draft</button></footer></div></>;
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
    const name = viewport.width > 600 ? "founding/quick-start/desktop" : "founding/quick-start/phone";
    if (!wantsCase(name)) continue;
    await runCase(name, async () => {
      const context = await browser.newContext({ viewport });
      await mockEngineLookups(context);
      const page = await context.newPage();
      let count = 0,
        loseReply = false,
        hold = false,
        failReply = false,
        release,
        savedReceipt,
        lastInput;
      await page.route("**/api/villages**", async (route) => {
        if (route.request().method() === "GET")
          return fulfill(route, { contentType: "application/json", body: JSON.stringify(savedReceipt) });
        const input = route.request().postDataJSON();
        lastInput = input;
        count++;
        assert.equal(input.mode, undefined, "New suggestions never replace the whole Village template");
        assert.ok(input.targetVenueId);
        savedReceipt = {
          id: input.actionId,
          sourceKey: input.sourceKey,
          status: "complete",
          result: {
            venues: [
              {
                id: input.targetVenueId,
                name: "The Tide House",
                form: "Reclaimed boathouse",
                description: "A weathered door faces the sea.",
                layout: "both",
                commonName: "Unused proposed room",
                commonPurpose: "Unused",
                commonDescription: "Unused proposed room",
                privateName: "Unused bedroom",
                privatePurpose: "Unused",
                privateDescription: "Unused proposed bedroom",
              },
            ],
          },
          error: "",
        };
        if (failReply) {
          failReply = false;
          savedReceipt = { ...savedReceipt, status: "failed", result: null, error: "Invalid synthetic draft" };
        }
        if (hold)
          await new Promise((resolve) => {
            release = resolve;
          });
        if (loseReply) {
          loseReply = false;
          return abort(route);
        }
        return fulfill(route, { contentType: "application/json", body: JSON.stringify(savedReceipt) });
      });
      await page.route("http://page-three.test/", (route) =>
        fulfill(route, {
          contentType: "text/html",
          body: `<html><body style="margin:0;background:#121936;color:white;font:16px system-ui"><marinara-capability-villages style="display:block;height:100dvh"><div id="root"></div></marinara-capability-villages><script>${bundle.outputFiles[0].text}</script></body></html>`,
        }),
      );
      await page.goto("http://page-three.test/");
      assert.equal(
        await page.evaluate(() => typeof crypto.subtle),
        "undefined",
        "Scoped suggestions work on ordinary HTTP LAN origins without WebCrypto",
      );
      const card = (id) => page.locator(`[data-venue-id="${id}"]`);
      const home = card("founding-home:player");
      const sheet = page.locator(".villages-quick-dialog");
      const close = async () => {
        await sheet.getByRole("button", { name: "Close Venue details", exact: true }).click();
        await expect(sheet).toBeHidden();
      };
      const open = async (id, tab = "Venue") => {
        if (await sheet.isVisible()) await close();
        const previous = page.getByRole("button", { name: "Previous Venues page", exact: true });
        while (!(await card(id).isVisible()) && (await previous.count()) > 0 && (await previous.isEnabled()))
          await previous.click();
        while (!(await card(id).isVisible()))
          await page.getByRole("button", { name: "Next Venues page", exact: true }).click();
        await card(id)
          .getByRole("button", { name: /^Edit / })
          .click();
        await expect(sheet).toBeVisible();
        await sheet.getByRole("button", { name: tab, exact: true }).click();
      };
      const chooseZone = async (id) => {
        await sheet.getByRole("button", { name: "Zones", exact: true }).click();
        await sheet.getByRole("combobox", { name: "Selected Zone", exact: true }).selectOption(id);
        await expect(sheet.getByRole("group", { name: "Selected Zone", exact: true })).toHaveAttribute(
          "data-zone-id",
          id,
        );
      };
      const confirm = async () => {
        await sheet.getByRole("button", { name: "Venue", exact: true }).click();
        await sheet.getByRole("button", { name: /^(Suggest details|Retry)$/ }).click();
        const dialog = page.getByRole("dialog", { name: /^(Suggest details|Retry)$/ });
        await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
      };
      await open("founding-home:player", "People");
      await expect(sheet.getByLabel("Capacity for Your home")).toHaveValue("auto");
      assert.ok(
        (await page.evaluate(() => window.quickState.venues))
          .filter((row) => row.classes.includes("residence"))
          .every((row) => row.privateSpaces.length === 0),
      );
      await sheet.getByRole("checkbox", { name: "Ada", exact: true }).check();
      await expect(sheet.getByLabel("Capacity for Your home")).toContainText("Automatic (2)");
      await sheet.getByRole("button", { name: "Next Sleeping residents page", exact: true }).click();
      await expect(sheet.getByLabel("Ada sleeping Zone in Your home")).toHaveValue("common:base");
      await sheet.getByLabel("Ada sleeping Zone in Your home").selectOption("new-private");
      const privateZone = (await page.evaluate(() => window.quickState.venues))[0].privateSpaces[0];
      assert.equal(privateZone.ownerId, "ada");
      await expect(sheet.getByLabel("Ada sleeping Zone in Your home")).toHaveValue(privateZone.id);
      await sheet.getByRole("button", { name: "Previous Sleeping residents page", exact: true }).click();
      assert.ok(
        !(
          await sheet
            .getByLabel("You sleeping Zone in Your home")
            .locator("option")
            .evaluateAll((nodes) => nodes.map((node) => node.value))
        ).includes(privateZone.id),
      );
      await open("founding-home:ada", "People");
      await sheet.getByRole("checkbox", { name: "Ada", exact: true }).check();
      const vacatedRoom = (await page.evaluate(() => window.quickState.venues))[0].privateSpaces[0];
      assert.equal(vacatedRoom.id, privateZone.id);
      assert.equal(vacatedRoom.ownerId, "");
      await open("founding-home:player", "People");
      await sheet.getByLabel("Capacity for Your home").selectOption("3");
      await sheet.getByRole("checkbox", { name: "Ada", exact: true }).check();
      await open("founding-home:ada", "People");
      await sheet.getByRole("checkbox", { name: "Ada", exact: true }).check();
      await open("founding-home:player", "People");
      await expect(sheet.getByLabel("Capacity for Your home")).toHaveValue("3");
      await sheet.getByLabel("Capacity for Your home").selectOption("1");
      await sheet.getByRole("checkbox", { name: "Ada", exact: true }).click();
      await expect(page.getByRole("alert")).toHaveText(/home is full/);
      assert.ok(
        (await page.evaluate(() => window.quickState.venues))
          .find((row) => row.id === "founding-home:ada")
          .residentIds.includes("ada"),
      );
      await sheet.getByLabel("Capacity for Your home").selectOption("auto");
      await sheet.getByRole("checkbox", { name: "Ada", exact: true }).check();
      await expect(sheet.getByRole("tab")).toHaveCount(0);
      await chooseZone(privateZone.id);
      await sheet.getByRole("button", { name: "Access", exact: true }).click();
      await sheet.getByLabel("Zone use", { exact: true }).selectOption("ada");
      await sheet.getByRole("button", { name: "Details", exact: true }).click();
      await expect(sheet.getByLabel("Zone name", { exact: true })).toHaveValue("Ada's private Zone");
      await sheet.getByLabel("Long-term details", { exact: true }).fill("A private berth with a blue quilt.");
      await sheet.getByRole("button", { name: "Connections", exact: true }).click();
      const map = sheet.getByRole("region", { name: "Zone layout", exact: true });
      await map.getByRole("button", { name: "Modify Zone Connections", exact: true }).click();
      await map.locator('[data-layout-zone="exterior"]').click();
      await map.locator(`[data-layout-zone="${privateZone.id}"]`).click();
      assert.ok(
        !(await page.evaluate(() => window.quickState.venues))[0].privateSpaces[0].connectedTo.includes("exterior"),
      );
      await map.locator('[data-layout-zone="exterior"]').click();
      await map.locator(`[data-layout-zone="${privateZone.id}"]`).click();
      await map.getByRole("button", { name: "Done", exact: true }).click();
      await chooseZone("common:base");
      await sheet.getByLabel("Zone name", { exact: true }).fill("Living space");
      const beforeSuggest = await page.evaluate(() => window.quickState.venues);
      await sheet.getByRole("button", { name: "Venue", exact: true }).click();
      await sheet.getByRole("button", { name: "Suggest details", exact: true }).click();
      await page
        .getByRole("dialog", { name: "Suggest details", exact: true })
        .getByRole("button", { name: "Cancel", exact: true })
        .click();
      assert.equal(count, 0);
      await confirm();
      await expect(sheet.getByLabel("Venue Name", { exact: true })).toHaveValue("The Tide House");
      assert.equal(count, 1);
      assert.equal(lastInput.targetVenueId, "founding-home:player");
      let after = await page.evaluate(() => window.quickState.venues);
      for (const key of [
        "spaces",
        "privateSpaces",
        "zoneLayout",
        "residentIds",
        "destinations",
        "presentation",
        "residenceCapacity",
        "foundingCapacity",
      ])
        assert.deepEqual(after[0][key], beforeSuggest[0][key], key + " survives suggestions");
      assert.deepEqual(after.slice(1), beforeSuggest.slice(1), "Unselected Venues are unchanged");
      await close();
      await expect(home.getByRole("button", { name: "Place The Tide House on map", exact: true })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      assert.equal((await page.evaluate(() => window.quickState.workspace)).paused, true);
      await page.getByRole("button", { name: "+ Add home", exact: true }).click();
      await expect(sheet.getByLabel("Venue Name", { exact: true })).toHaveValue("New home");
      await close();
      await expect(card("new-residence").getByText("Vacant home", { exact: true })).toBeVisible();
      await open("new-residence");
      await sheet.getByRole("button", { name: "Remove New home", exact: true }).click();
      await expect(card("new-residence")).toHaveCount(0);
      await page.getByRole("button", { name: "+ Add Venue", exact: true }).click();
      await close();
      await open("new-other");
      await sheet.getByRole("button", { name: "Remove New Venue", exact: true }).click();
      await open("founding-home:player");
      await chooseZone("common:base");
      await sheet.getByRole("button", { name: "Add Zone", exact: true }).click();
      await sheet.getByLabel("Zone name", { exact: true }).fill("Kitchen");
      await sheet.getByLabel("Used for", { exact: true }).fill("Cooking");
      await sheet.getByLabel("Long-term details", { exact: true }).fill("A sunny kitchen.");
      await expect(
        sheet
          .getByRole("group", { name: "Zone sections", exact: true })
          .getByRole("button", { name: "Artwork", exact: true }),
      ).toHaveCount(0);
      await sheet.getByRole("button", { name: "Artwork for Kitchen", exact: true }).click();
      const artwork = page.getByRole("dialog", { name: "Artwork for Kitchen", exact: true });
      await artwork
        .getByLabel("Upload Zone image", { exact: true })
        .setInputFiles({ name: "kitchen.png", mimeType: "image/png", buffer: Buffer.from("fixture") });
      await expect(artwork.getByRole("img", { name: "Artwork for Kitchen", exact: true })).toBeVisible();
      await artwork.getByRole("button", { name: "Close artwork", exact: true }).click();
      await expect(sheet.getByRole("button", { name: "Artwork for Kitchen", exact: true })).toBeFocused();
      const added = (await page.evaluate(() => window.quickState.venues))[0].spaces.find(
        (zone) => zone.name === "Kitchen",
      );
      await close();
      await page.getByRole("button", { name: "Save draft", exact: true }).click();
      await expect(page.getByText("Draft saved", { exact: true })).toBeVisible();
      await page.reload();
      await expect(home.locator("h3")).toContainText("The Tide House");
      await open("founding-home:player", "People");
      await sheet.getByRole("button", { name: "Next Sleeping residents page", exact: true }).click();
      await expect(sheet.getByLabel("Ada sleeping Zone in The Tide House")).toHaveValue(privateZone.id);
      await open("founding-home:player");
      await chooseZone(added.id);
      await expect(sheet.getByLabel("Long-term details", { exact: true })).toHaveValue("A sunny kitchen.");
      await expect(
        sheet.getByRole("button", { name: "Artwork for Kitchen", exact: true }).locator("img"),
      ).toBeVisible();
      await sheet.getByRole("button", { name: "Venue", exact: true }).click();
      await expect(sheet.getByRole("button", { name: "Artwork for Entrance", exact: true })).toBeVisible();
      loseReply = true;
      await confirm();
      await expect(sheet.getByRole("button", { name: "Recovering…", exact: true })).toBeDisabled();
      await expect(sheet.getByRole("button", { name: "Retry", exact: true })).toHaveCount(0);
      assert.equal(count, 2);
      await close();
      await page.reload();
      await expect(page.getByRole("button", { name: "Recovering…", exact: true })).toBeDisabled();
      await open("founding-home:player");
      await expect(sheet.getByRole("button", { name: "Suggest details", exact: true })).toBeEnabled();
      assert.equal(count, 2, "Lost reply recovery uses GET only");
      loseReply = true;
      await confirm();
      await expect(sheet.getByRole("button", { name: "Recovering…", exact: true })).toBeDisabled();
      await sheet.getByLabel("Venue Name", { exact: true }).fill("My revised home");
      const edited = await page.evaluate(() => window.quickState.venues);
      await expect(sheet.getByRole("alert")).toHaveText(/Founding choices changed/);
      assert.equal(count, 3);
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues),
        edited,
        "A stale receipt cannot overwrite edited text",
      );
      loseReply = true;
      await confirm();
      await expect(sheet.getByRole("button", { name: "Recovering…", exact: true })).toBeDisabled();
      await page.evaluate(() => window.reassign());
      const reassigned = await page.evaluate(() => window.quickState.venues);
      await expect(sheet.getByRole("alert")).toHaveText(/Founding choices changed/);
      assert.equal(count, 4);
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues),
        reassigned,
        "A stale receipt cannot rebind to changed residents",
      );
      failReply = true;
      await confirm();
      await expect(sheet.getByRole("button", { name: "Retry", exact: true })).toBeEnabled();
      await expect(sheet.getByRole("alert")).toHaveText("Invalid synthetic draft");
      const failedCount = count;
      await page.waitForTimeout(2500);
      assert.equal(count, failedCount, "A confirmed failure never retries itself");
      await confirm();
      await expect(sheet.getByRole("button", { name: "Suggest details", exact: true })).toBeEnabled();
      assert.equal(count, failedCount + 1, "Only explicit Retry starts another generation");
      hold = true;
      release = undefined;
      const request = confirm();
      await expect.poll(() => typeof release).toBe("function");
      await page.evaluate(() => window.setFoundingVisible(false));
      await request;
      hold = false;
      await expect(sheet.getByRole("button", { name: "Recovering…", exact: true })).toBeDisabled();
      await expect(sheet.getByRole("alert")).toHaveCount(0);
      const interruptedCount = count;
      await page.evaluate(() => window.setFoundingVisible(true));
      await expect(sheet.getByRole("button", { name: "Suggest details", exact: true })).toBeEnabled();
      assert.equal(count, interruptedCount, "Returning to Founding only retrieves the saved attempt");
      release();
      hold = true;
      release = undefined;
      const changedRequest = confirm();
      await expect.poll(() => typeof release).toBe("function");
      await page.evaluate(() => window.changeContext());
      hold = false;
      release();
      await changedRequest;
      await expect(sheet.getByRole("alert")).toHaveText(/people or setting changed/);
      await sheet.scrollIntoViewIfNeeded();
      const size = await sheet.evaluate((node) => ({
        width: node.clientWidth,
        scroll: node.scrollWidth,
        box: node.getBoundingClientRect().toJSON(),
      }));
      assert.ok(size.scroll <= size.width + 1);
      assert.ok(size.box.x >= 0 && size.box.right <= viewport.width + 1, "Editor fits desktop and phone");
      await sheet.locator(".villages-quick-panel").evaluate((node) => node.scrollTo({ top: node.scrollHeight }));
      await sheet.getByRole("button", { name: "Done", exact: true }).scrollIntoViewIfNeeded();
      const footer = await sheet
        .locator(".villages-quick-footer")
        .getByRole("button", { name: "Done", exact: true })
        .boundingBox();
      assert.ok(
        footer.y >= 0 && footer.y + footer.height <= viewport.height + 1,
        "Done remains reachable while scrolling",
      );
      await page.screenshot({ path: ".build-tmp/page-three-" + viewport.width + ".png" });
      await context.close();
    });
  }
});
console.log(
  "Founding Page 3: direct homes, sleeping/private Zones, capacity, scoped suggestions, receipt fences, artwork, connections, persistence and responsive editor passed.",
);
