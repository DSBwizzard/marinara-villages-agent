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
 const suggest=createFoundingSuggestSetupVenues({signal,setupWorkspace:workspace,setSetupWorkspace:setWorkspace,setupDraftData:data,persistSetupDraft:persist,personaDraft:'driver',selectedResidentAdmissions:{},setSetupProblem:setProblem,setSetupSuggestionsBusy:setBusy,setSetupSuggestionsKey:setKey,setSetupVenues:setVenues,setupAuthoredFieldsRef:authoredRef,setupBeginningSourceKey:source,setupBeginningSourceKeyRef:sourceRef,setupImageTargetRef:image,setupLorebookDraft:[],setupLoreTokenBudgetDraft:1600,setupSetting:'An oceanfront community',setupName:'Tidebreak',setupContext:{rules:'',circumstances:[],openingVenueId:'community'},setupSuggestionsClaim:claim,setupVenues:venues,setupVenuesRef:rowsRef});
 useVisibleInterval(signal=>{if(workspace.suggestionRequest&&!workspace.suggestionRequest.failure)return suggest(undefined,signal)},workspace.suggestionRequest&&!workspace.suggestionRequest.failure?2000:null,visible);
 window.setFoundingVisible=setVisible;
 window.restoreMissingSuggestion=()=>setWorkspace(state=>({...state,suggestionRequest:{id:'absent-draft-result',sourceKey:source,quickStart:true}}));
 const patch=usePatchSetupVenue({setSetupAuthoredFields:setAuthored,setSetupVenues:setVenues});
 const select=venue=>{setSelected(venue.id);setMoving(null);setWorkspace(state=>({...state,view:'details',paused:true}))};
 const upload=(venue,area,file,id)=>{const image={id:'fixture',ref:'global-gallery:fixture',url:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='};patch(venue.id,row=>area==='exterior'?{...row,presentation:{...row.presentation,image}}:{...row,[area==='private'?'privateSpaces':'spaces']:(row[area==='private'?'privateSpaces':'spaces']??[]).map(zone=>zone.id===id?{...zone,image}:zone)});};
 window.quickState={venues,workspace,authored,suggestionsKey:key,problem,moving};
 window.replaceQuickVenues=setVenues;
 window.legacyPolicy=()=>setVenues(rows=>rows.map(row=>row.id!=='founding-home:player'?row:{...row,
 access:{version:1,revision:0,managerIds:['player'],visitorHours:null,permissions:[],bans:[],exceptions:[],changes:[],visitDenials:[],receipts:{}},
 spaces:row.spaces.map(zone=>zone.id!=='common:base'?zone:{...zone,access:{mode:'public',managerIds:null,memberIds:[],memberRoles:[],inviterIds:[],visitorHours:'inherit',accompanied:false}})}));
 window.editDuringRequest=()=>patch('founding-home:player',row=>({...row,form:'A newer manual description'}));
 return <><style>{VILLAGES_FORGING_STYLES}</style><div className='villages-forging-v2'><header className='villages-forging-heading'><h1>Founding Venues</h1></header><main className='villages-forging-body'>
 {workspace.venueReview && <FoundingVenueReview review={workspace.venueReview} current={venues} people={people} onUse={setVenues} onDismiss={()=>setWorkspace(state=>({...state,venueReview:undefined}))} onProblem={setProblem}/>}
 <QuickStartVenues venues={venues} people={people} selectedId={selected} busy={busy} imageBusy={false} focusIssue={null} problem={problem} map={<p>Map preview</p>} onSelect={select} onPatch={venue=>patch(venue.id,()=>venue)} onGenerateImage={()=>{}} onUploadImage={upload}
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
        unavailable = false,
        release,
        receipt;
      await page.route("**/api/villages**", async (route) => {
        if (route.request().method() === "GET") {
          reads++;
          if (unavailable)
            return fulfill(route, {
              status: 404,
              contentType: "application/json",
              body: JSON.stringify({
                code: "FOUNDING_DRAFT_UNAVAILABLE",
                error: "Founding draft result unavailable.",
              }),
            });
          return fulfill(route, { contentType: "application/json", body: JSON.stringify(receipt) });
        }
        const input = route.request().postDataJSON();
        calls++;
        assert.equal(input.mode, "quick-start");
        assert.equal(input.venues.length, 5);
        assert.ok(
          input.venues.every(
            (row) =>
              !(row.playerHome || !!row.residentIds?.length) || row.residentIds.length + Number(row.playerHome) === 1,
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
              layout: !(row.playerHome || !!row.residentIds?.length) ? "common" : "both",
              commonName: "Living space",
              commonPurpose: "Daily life",
              commonDescription: "A warm living space.",
              privateName: !(row.playerHome || !!row.residentIds?.length) ? "" : "Bedroom",
              privatePurpose: "Rest",
              privateDescription: "A quiet room.",
              connections: !(row.playerHome || !!row.residentIds?.length)
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
            '<meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;background:#121936;color:white;font:16px system-ui"><header id="engine-controls" style="height:96px;background:#111;display:flex;align-items:center;gap:16px"><button onclick="window.engineClicks=(window.engineClicks||0)+1">Engine control</button><button>Engine navigation</button></header><marinara-capability-villages style="display:block;height:calc(100dvh - 96px)"><div id="root" style="height:100%"></div></marinara-capability-villages><script>' +
            bundle.outputFiles[0].text +
            "</script>",
        }),
      );
      await page.goto("http://page-three.test/");
      const sheet = page.locator(".villages-quick-dialog");
      const button = (name) => page.getByRole("button", { name, exact: true });
      const closeVenue = async () => {
        await parentVenue();
        return sheet.getByRole("button", { name: "← Venues", exact: true }).click();
      };
      const parentVenue = async () => {
        for (
          let step = 0;
          step < 6 && !(await sheet.getByRole("navigation", { name: "Venue sections" }).count());
          step++
        )
          await sheet.locator(".marinara-capability-villages-venue-navigation button").click();
      };
      const openZones = async () => {
        await parentVenue();
        await sheet.getByRole("button", { name: "Zones", exact: true }).click();
      };
      const edit = async () => {
        const button = sheet.getByRole("button", { name: "Edit", exact: true });
        if (await button.count()) await button.click();
      };
      const manage = async () => {
        await parentVenue();
        await sheet.getByRole("button", { name: "About", exact: true }).click();
        await edit();
      };
      const connections = async () => {
        await openZones();
        await sheet.getByRole("button", { name: /Zone connections/ }).click();
      };
      await expect(sheet).toHaveCount(0);
      const first = page.locator('[data-venue-id="founding-home:player"]');
      const engine = page.locator("#engine-controls");
      const engineBefore = await engine.screenshot();
      await first.click();
      await expect(sheet).toBeVisible();
      const geometry = (row) =>
        row.evaluate((node) => {
          const box = node.getBoundingClientRect(),
            style = getComputedStyle(node);
          return {
            width: box.width,
            height: box.height,
            font: style.fontSize,
            fade: getComputedStyle(node.closest(".marinara-capability-villages-venue-profile"), "::before")
              .backgroundImage,
          };
        });
      await sheet.getByRole("button", { name: "Zones", exact: true }).click();
      const zoneGeometry = await geometry(sheet.getByRole("button", { name: /^Entrance/ }));
      await sheet.getByRole("button", { name: "Arrangements", exact: true }).click();
      const manageGeometry = await geometry(sheet.getByRole("button", { name: /^Residents/ }));
      assert.deepEqual(
        { font: manageGeometry.font, fade: manageGeometry.fade },
        { font: zoneGeometry.font, fade: zoneGeometry.fade },
        "Arrangements reuse the Zone font and backdrop fade",
      );
      if (viewport.width > 700)
        assert.equal(
          manageGeometry.width,
          zoneGeometry.width,
          "Desktop arrangements retain the compact Zone row width",
        );
      else
        assert.ok(
          manageGeometry.width >= zoneGeometry.width,
          "Phone arrangement rows keep their labels and counts readable",
        );
      assert.ok(
        manageGeometry.height >= 44 && manageGeometry.height <= zoneGeometry.height + 1,
        "Arrangements keep the Zone touch target without taller rows",
      );
      await sheet.getByRole("button", { name: "About", exact: true }).click();
      await expect(sheet).toHaveAttribute("open", "");
      assert.equal(
        await sheet.evaluate((node) => node.matches(":modal")),
        false,
        "The editor does not make the Engine document modal",
      );
      assert.deepEqual(
        await engine.screenshot(),
        engineBefore,
        "Engine chrome keeps identical pixels while Villages is dimmed",
      );
      const contained = async () => {
        const pane = await page.locator(".villages-forging-v2").boundingBox();
        const popup = await sheet.boundingBox();
        const overlay = await page.locator(".villages-founding-overlay").boundingBox();
        assert.deepEqual(overlay, pane, "Dimming covers exactly the Villages pane");
        assert.ok(
          popup.y >= pane.y &&
            popup.x >= pane.x &&
            popup.y + popup.height <= pane.y + pane.height + 1 &&
            popup.x + popup.width <= pane.x + pane.width + 1,
          "Popup stays inside Villages",
        );
      };
      await contained();
      await expect(page.locator(".villages-forging-body")).toHaveJSProperty("inert", true);
      await button("Engine control").click();
      assert.equal(await page.evaluate(() => window.engineClicks), 1, "Engine controls remain clickable");
      await page.keyboard.press("Tab");
      await expect(button("Engine navigation")).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(sheet).toBeVisible();
      await manage();
      const originalExterior = await page.evaluate(() => window.quickState.venues[0].description);
      await expect(sheet.getByRole("textbox", { name: "Description", exact: true })).toHaveCount(1);
      await sheet.getByLabel("Description", { exact: true }).fill("A timber cottage");
      assert.equal(
        await page.evaluate(() => window.quickState.venues[0].description),
        originalExterior,
        "Venue Description edits leave Entrance unchanged",
      );
      await closeVenue();
      await expect(sheet).toHaveCount(0);
      await expect(first).toBeFocused();
      await expect(page.locator(".villages-forging-body")).toHaveJSProperty("inert", false);
      await first.click();
      await manage();
      await expect(sheet.getByLabel("Description", { exact: true })).toHaveValue("A timber cottage");
      await sheet.getByRole("button", { name: "Done", exact: true }).click();
      await expect(sheet.getByText("A timber cottage", { exact: true })).toHaveCount(1);
      await expect(sheet.getByText(originalExterior, { exact: true })).toHaveCount(0);
      await openZones();
      await sheet.locator('[data-layout-zone="exterior"]').click();
      await expect(sheet.getByText(originalExterior, { exact: true })).toBeVisible();
      await edit();
      await sheet.getByLabel("Description", { exact: true }).fill("A sheltered porch beside the village path.");
      assert.equal(
        await page.evaluate(() => window.quickState.venues[0].form),
        "A timber cottage",
        "Entrance Description edits leave the Venue unchanged",
      );
      assert.equal(
        await page.evaluate(() => window.quickState.venues[0].description),
        "A sheltered porch beside the village path.",
      );
      await parentVenue();
      await page.keyboard.press("Escape");
      await expect(sheet).toBeVisible();
      await closeVenue();
      await expect(sheet).toHaveCount(0);
      await expect(first).toBeFocused();
      await first.click();
      assert.equal(calls, 0);
      await expect(button("+ Add home")).toHaveCount(0);
      await expect(button("+ Add Venue")).toHaveCount(0);
      await expect(sheet.getByRole("button", { name: "People", exact: true })).toHaveCount(0);
      await expect(sheet.getByRole("combobox")).toHaveCount(0);
      await expect(button("Zones")).toBeVisible();
      await closeVenue();
      await first.click();
      await expect(button("Zones")).toBeVisible();
      await expect(sheet.getByRole("button", { name: "Venue", exact: true })).toHaveCount(0);
      await expect(sheet.getByRole("switch")).toHaveCount(0);
      const zone = (id) => sheet.locator('[data-layout-zone="' + id + '"]');
      await expect(button("Arrangements")).toBeVisible();
      await expect(button("Add Zone")).toHaveCount(0);
      await expect(button("Remove Zone")).toHaveCount(0);
      await expect(button("Modify Zone Connections")).toHaveCount(0);
      await expect(sheet.locator(".villages-zone-map")).toHaveCount(0);
      const originalVenues = await page.evaluate(() => window.quickState.venues);
      await connections();
      await expect(sheet.locator(".villages-zone-map")).toBeVisible();
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues),
        originalVenues,
        "Entering layout mode never changes the draft",
      );
      await expect(zone("exterior")).toHaveAttribute("data-draggable", "true");
      await page.evaluate(() =>
        window.replaceQuickVenues((rows) =>
          rows.map((row, index) =>
            index
              ? row
              : {
                  ...row,
                  privateSpaces: [],
                  spaces: Array.from({ length: 6 }, (_, i) => ({
                    ...row.spaces[0],
                    id: i ? "compact:" + i : "common:base",
                    name: "Room " + i,
                    connectedTo: ["exterior"],
                  })),
                  zoneLayout: Object.fromEntries(
                    ["exterior", "common:base", "compact:1", "compact:2", "compact:3", "compact:4", "compact:5"].map(
                      (id, i) => [
                        id,
                        [
                          { x: 0, y: 0 },
                          { x: 0, y: 24 },
                          { x: 68, y: 12 },
                          { x: 68, y: 42 },
                          { x: 0, y: 48 },
                          { x: 0, y: 84 },
                          { x: 68, y: 84 },
                        ][i],
                      ],
                    ),
                  ),
                },
          ),
        ),
      );
      await expect(sheet.locator("[data-layout-zone]")).toHaveCount(7);
      const seededLayout = await page.evaluate(() => window.quickState.venues[0].zoneLayout);
      const assertGraph = async () => {
        const result = await sheet.locator(".villages-zone-map-canvas").evaluate((canvas) => {
          const box = canvas.getBoundingClientRect(),
            svg = canvas.querySelector("svg"),
            matrix = svg.getScreenCTM();
          const nodes = [...canvas.querySelectorAll("[data-layout-zone]")].map((node) => ({
            id: node.dataset.layoutZone,
            box: node.getBoundingClientRect().toJSON(),
          }));
          return {
            canvas: box.toJSON(),
            nodes,
            lines: [...svg.querySelectorAll("line")].map((line) =>
              [
                new DOMPoint(line.x1.baseVal.value, line.y1.baseVal.value).matrixTransform(matrix),
                new DOMPoint(line.x2.baseVal.value, line.y2.baseVal.value).matrixTransform(matrix),
              ].map((p) => ({ x: p.x, y: p.y })),
            ),
          };
        });
        for (const node of result.nodes) {
          const box = node.box;
          assert.ok(box.height >= 44, "Nodes retain full touch targets");
          assert.ok(
            Math.abs(box.width - (result.canvas.width - 2) * 0.32) < 1,
            "Visible nodes fill their reserved collision areas",
          );
          assert.ok(
            box.top >= result.canvas.top && box.bottom <= result.canvas.bottom,
            "Low authored Zones stay inside the canvas",
          );
          for (const other of result.nodes.filter((row) => row.id !== node.id))
            assert.ok(
              box.right <= other.box.left + 0.1 ||
                other.box.right <= box.left + 0.1 ||
                box.bottom <= other.box.top + 0.1 ||
                other.box.bottom <= box.top + 0.1,
              "Nodes do not overlap",
            );
        }
        for (const endpoint of result.lines.flat())
          assert.ok(
            result.nodes.some(
              ({ box }) =>
                Math.abs(box.x + box.width / 2 - endpoint.x) < 2 && Math.abs(box.y + box.height / 2 - endpoint.y) < 2,
            ),
            "Connections reach visual node centers",
          );
      };
      await assertGraph();
      const canvas = sheet.locator(".villages-zone-map-canvas");
      const canvasHeight = (await canvas.boundingBox()).height;
      assert.ok(canvasHeight >= 320, "The editor uses the full canvas height");
      await page.setViewportSize({ width: viewport.width === 1366 ? 390 : 1366, height: 900 });
      await contained();
      await assertGraph();
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues[0].zoneLayout),
        seededLayout,
        "Resizing never rewrites authored coordinates",
      );
      await page.setViewportSize(viewport);
      await zone("compact:4").scrollIntoViewIfNeeded();
      const low = await zone("compact:4").boundingBox();
      await page.mouse.move(low.x + low.width / 2, low.y + low.height / 2);
      await page.mouse.down();
      await page.mouse.move(low.x + low.width / 2, low.y + low.height / 2 + canvasHeight * 0.04, { steps: 3 });
      assert.equal((await canvas.boundingBox()).height, canvasHeight, "Dragging never changes the canvas height");
      await page.mouse.up();
      await expect.poll(() => page.evaluate(() => window.quickState.venues[0].zoneLayout["compact:4"].y)).toBe(86);
      await assertGraph();
      const sparse = structuredClone(originalVenues);
      sparse[0].zoneLayout = {
        exterior: { x: 0, y: 0 },
        "common:base": { x: 34, y: 42 },
        "private:base": { x: 68, y: 70 },
      };
      await page.evaluate((rows) => window.replaceQuickVenues(rows), sparse);
      await expect(sheet.locator("[data-layout-zone]")).toHaveCount(3);
      assert.equal((await canvas.boundingBox()).height, canvasHeight, "Sparse graphs keep the full canvas height");
      await zone("common:base").scrollIntoViewIfNeeded();
      const room = await zone("common:base").boundingBox();
      const entrance = await zone("exterior").boundingBox();
      await page.mouse.move(room.x + room.width / 2, room.y + room.height / 2);
      await page.mouse.down();
      await page.mouse.move(entrance.x + entrance.width + room.width / 2 + 1, entrance.y + entrance.height / 2 - 2);
      await page.mouse.up();
      await expect.poll(() => page.evaluate(() => window.quickState.venues[0].zoneLayout["common:base"].y)).toBe(0);
      const adjacent = await zone("common:base").boundingBox();
      assert.ok(
        adjacent.x >= entrance.x + entrance.width && adjacent.x < entrance.x + entrance.width + 4,
        "Zones can sit immediately beside another visible Zone without an invisible blocked margin",
      );
      await assertGraph();
      await zone("common:base").click();
      await button("Remove Zone").click();
      await expect
        .poll(() => page.evaluate(() => window.quickState.venues[0].destinations.player?.sleep ?? null))
        .toBe(null);
      await button("Modify Zone Connections").click();
      await zone("exterior").click();
      await zone("private:base").click();
      await expect
        .poll(() => page.evaluate(() => window.quickState.venues[0].destinations.player.sleep))
        .toBe("private:base");
      await sheet.locator(".villages-zone-map").getByRole("button", { name: "Done", exact: true }).click();
      await page.evaluate((rows) => window.replaceQuickVenues(rows), sparse);
      await expect(sheet.locator("[data-layout-zone]")).toHaveCount(3);
      await button("Add Zone").click();
      await expect(sheet.locator("[data-layout-zone]")).toHaveCount(4);
      const addedZone = await page.evaluate(() => window.quickState.venues[0].spaces.at(-1).id);
      await openZones();
      await page.evaluate(() => {
        window.heldFocus = [];
        window.nativeFrame = window.requestAnimationFrame;
        window.requestAnimationFrame = (callback) => {
          window.heldFocus.push(callback);
          return 0;
        };
      });
      await zone(addedZone).click();
      await edit();
      await sheet.getByLabel("Zone name", { exact: true }).fill("Reading nook");
      await page.evaluate(() => {
        window.requestAnimationFrame = window.nativeFrame;
        for (const callback of window.heldFocus) callback(performance.now());
      });
      await expect(sheet.getByLabel("Zone name", { exact: true })).toBeFocused();
      await sheet.getByLabel("Zone name", { exact: true }).press("Enter");
      await expect(sheet.getByRole("heading", { name: "Reading nook", exact: true })).toBeVisible();
      await sheet.getByLabel("Zone name", { exact: true }).focus();
      await expect(sheet.getByLabel("Zone name", { exact: true })).toBeFocused();
      await connections();
      const beforeConnect = await page.evaluate(() => window.quickState.venues);
      await button("Modify Zone Connections").click();
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues),
        beforeConnect,
        "Opening connection controls never changes the draft",
      );
      await zone("common:base").click();
      await zone(addedZone).click();
      await expect
        .poll(() =>
          page.evaluate(
            (id) => window.quickState.venues[0].spaces.find((row) => row.id === id).connectedTo.includes("common:base"),
            addedZone,
          ),
        )
        .toBe(true);
      await sheet.locator(".villages-zone-map").getByRole("button", { name: "Done", exact: true }).click();
      await button("Remove Zone").click();
      await expect(sheet.locator("[data-layout-zone]")).toHaveCount(3);
      await expect(zone("exterior")).toHaveAttribute("aria-pressed", "true");
      await button("Modify Zone Connections").click();
      await zone("exterior").click();
      const beforeFinish = await page.evaluate(() => window.quickState.venues);
      await openZones();
      await expect(button("Add Zone")).toHaveCount(0);
      await expect(button("Modify Zone Connections")).toHaveCount(0);
      await expect(sheet.locator(".villages-zone-map")).toHaveCount(0);
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues),
        beforeFinish,
        "Leaving layout mode preserves data and clears unfinished connection selection",
      );
      await zone("exterior").press("ArrowRight");
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues),
        beforeFinish,
        "The default Zone picker cannot move nodes accidentally",
      );

      await zone("common:base").click();
      await page.evaluate(() => window.legacyPolicy());
      await expect(sheet.getByRole("button", { name: "Arrangements", exact: true })).toHaveCount(0);
      await parentVenue();
      await sheet.getByRole("button", { name: "Arrangements", exact: true }).click();
      await sheet.getByRole("button", { name: /^Visitors/ }).click();
      const access = sheet.getByRole("region", { name: "Visitors", exact: true });
      await expect(access.getByLabel("Entry", { exact: true })).toHaveValue("public");
      const preserved = await page.evaluate(() => window.quickState.venues[0]);
      await access.getByLabel("Entry", { exact: true }).selectOption("permission-required");
      await access.getByRole("button", { name: "Save visitor rules", exact: true }).click();
      const expected = structuredClone(preserved);
      expected.spaces[0].access.mode = "permission-required";
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues[0]),
        expected,
        "Access preserves unrelated fields",
      );
      await openZones();
      await zone("common:base").click();
      await sheet.getByLabel("Zone name", { exact: true }).fill("Front Office");
      expected.spaces[0].name = "Front Office";
      await closeVenue();
      await first.click();
      await manage();
      await sheet.getByLabel("Description", { exact: true }).fill("A converted school bus");
      await closeVenue();
      await first.click();
      await openZones();
      await zone("common:base").click();
      await edit();
      expected.form = "A converted school bus";
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues[0]),
        expected,
        "Text edits preserve ownership, access and sleeping data",
      );
      const upload = sheet.getByLabel("Upload Front Office image", { exact: true });
      const file = { name: "zone.png", mimeType: "image/png", buffer: Buffer.from("fixture") };
      await upload.setInputFiles(file);
      await expect(sheet.getByRole("img", { name: "Artwork for Front Office", exact: true })).toHaveCount(0);
      await expect(sheet.getByRole("button", { name: "View fullsize", exact: true })).toBeEnabled();
      await parentVenue();
      await zone("exterior").click();
      await edit();
      await expect(access).toHaveCount(0);
      await expect(sheet.getByRole("img")).toHaveCount(0);
      await sheet.getByLabel("Upload Entrance image", { exact: true }).setInputFiles(file);
      await expect.poll(() => first.evaluate((node) => node.style.backgroundImage)).not.toContain("data:image");
      await expect(first.locator("img")).toHaveCount(0);
      const confirm = async () => {
        if (await sheet.count()) await closeVenue();
        await button(calls && receipt?.status === "failed" ? "Retry" : "Suggest").click();
        await page.getByRole("dialog").getByRole("button", { name: "Replace and suggest", exact: true }).click();
      };
      await closeVenue();
      await page.locator('[data-venue-id="founding-home:ada"]').click();
      await manage();
      await sheet.getByLabel("Venue Name", { exact: true }).fill("Ada’s café");
      const residents = async () => {
        await sheet.getByRole("button", { name: "Arrangements", exact: true }).click();
        await sheet.getByRole("button", { name: /^Residents/ }).click();
      };
      const workers = async () => {
        await sheet.getByRole("button", { name: "Arrangements", exact: true }).click();
        await sheet.getByRole("button", { name: /^Workers/ }).click();
      };
      const returnToVenue = () => sheet.getByRole("button", { name: "← Ada’s café", exact: true }).click();
      await residents();
      await sheet.getByRole("button", { name: "Ada", exact: true }).click();
      await expect(sheet.getByLabel("Resident capacity", { exact: true })).toHaveCount(0);
      await expect(sheet.getByRole("checkbox", { name: "Lives here", exact: true })).toHaveCount(0);
      await sheet.getByLabel("Sleeps in", { exact: true }).selectOption("common:base");
      await sheet.getByRole("button", { name: "Cancel", exact: true }).click();
      assert.equal(
        await page.evaluate(
          () => window.quickState.venues.find((row) => row.id === "founding-home:ada").destinations.ada.sleep,
        ),
        "private:base",
        "Cancel retains home",
      );
      await sheet.getByRole("button", { name: "Add resident", exact: true }).click();
      await sheet.getByRole("button", { name: "Bryn", exact: true }).click();
      await sheet.getByLabel("Sleeps in", { exact: true }).selectOption("private:base");
      await sheet.getByRole("button", { name: "Save home", exact: true }).click();
      let cafe = await page.evaluate(() => window.quickState.venues.find((row) => row.id === "founding-home:ada"));
      assert.deepEqual(cafe.residentIds, ["ada", "bryn"]);
      assert.equal(
        cafe.destinations.ada.sleep,
        cafe.destinations.bryn.sleep,
        "Two people share a bedroom through their Home editors",
      );
      await sheet.getByRole("button", { name: "Bryn", exact: true }).click();
      await sheet.getByRole("button", { name: "Remove resident", exact: true }).click();
      await returnToVenue();
      await workers();
      await sheet.getByRole("button", { name: "Add worker", exact: true }).click();
      await sheet.getByRole("button", { name: "Ada", exact: true }).click();
      await sheet.getByLabel("Work activity", { exact: true }).fill("Serving coffee");
      await sheet.getByRole("button", { name: "Cancel", exact: true }).click();
      assert.equal(
        await page.evaluate(
          () => window.quickState.venues.find((row) => row.id === "founding-home:ada").access?.work?.length ?? 0,
        ),
        0,
      );
      await sheet.getByRole("button", { name: "Add worker", exact: true }).click();
      await sheet.getByRole("button", { name: "Ada", exact: true }).click();
      await sheet.getByLabel("Work activity", { exact: true }).fill("Serving coffee");
      await sheet.getByLabel("Usual work Zone", { exact: true }).selectOption("common:base");
      await sheet.getByRole("button", { name: "Save work", exact: true }).click();
      cafe = await page.evaluate(() => window.quickState.venues.find((row) => row.id === "founding-home:ada"));
      assert.equal(cafe.access.work[0].activity, "Serving coffee");
      assert.deepEqual(cafe.access.work[0].accessZoneIds, ["common:base"]);
      await returnToVenue();
      await residents();
      await sheet.getByRole("button", { name: "Ada", exact: true }).click();
      await sheet.getByRole("button", { name: "Remove resident", exact: true }).click();
      const removed = await page.evaluate(() => window.quickState.venues.find((row) => row.id === "founding-home:ada"));
      assert.deepEqual(removed.residentIds, []);
      assert.equal("residenceCapacity" in removed, false);
      assert.deepEqual(removed.workerIds, ["ada"]);
      assert.deepEqual(removed.destinations.ada, { work: "common:base" });
      assert.deepEqual(removed.access.managerIds, cafe.access.managerIds);
      await sheet.getByRole("button", { name: "Add resident", exact: true }).click();
      await sheet.getByRole("button", { name: "Ada", exact: true }).click();
      await expect(sheet.getByRole("button", { name: "Remove resident", exact: true })).toHaveCount(0);
      await sheet.getByRole("button", { name: "Save home", exact: true }).click();
      await returnToVenue();
      assert(
        await sheet.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
        "Arrangements fit the Venue sheet",
      );
      await closeVenue();
      await button("Suggest").click();
      await page.setViewportSize({ width: viewport.width, height: 260 });
      const confirmation = page.getByRole("dialog", { name: "Suggest", exact: true });
      const shortPane = await page.locator(".villages-forging-v2").boundingBox();
      const shortDialog = await confirmation.boundingBox();
      assert.ok(
        shortDialog.y >= shortPane.y && shortDialog.y + shortDialog.height <= shortPane.y + shortPane.height + 1,
        "Compact confirmation fits a short Villages pane",
      );
      await confirmation.getByRole("button", { name: "Back", exact: true }).click();
      await page.setViewportSize(viewport);
      assert.equal(calls, 0);
      await page.evaluate(() =>
        window.replaceQuickVenues((rows) =>
          rows.map((row) =>
            row.id === "founding-home:ada"
              ? {
                  ...row,
                  id: "ada-original-home",
                  presentation: { ...row.presentation, mapId: "coast", x: 0.12, y: 0.83 },
                }
              : row,
          ),
        ),
      );
      loseReply = true;
      await confirm();
      await expect.poll(() => calls).toBe(1);
      await page.getByRole("button", { name: "Use changes", exact: true }).click();
      await expect.poll(() => page.evaluate(() => window.quickState.venues[0].name)).toBe("Drafted 0");
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues.find((row) => row.id === "founding-home:ada").presentation),
        { mapId: "coast", image: null, x: 0.12, y: 0.83 },
        "A resident keeps their home pin when the draft uses a different Venue ID",
      );
      assert.ok(reads > 0, "Lost POST response recovers by reading the same receipt");
      assert.equal(calls, 1, "Recovery never dispatches a second paid attempt");
      assert.ok(
        await page.evaluate(() =>
          window.quickState.venues
            .filter((row) => row.occupancy.playerHome || !!row.residentIds?.length)
            .every((row) => row.privateSpaces.length === 1 && Object.keys(row.destinations).length === 1),
        ),
      );
      await first.click();
      await openZones();
      await zone("private:base").click();
      await sheet.getByRole("button", { name: "Arrangements", exact: true }).click();
      await sheet.getByRole("button", { name: /^Visitors/ }).click();
      await expect(access.getByLabel("Entry", { exact: true })).toHaveValue("permission-required");
      await sheet.getByRole("button", { name: /^Change visitor rules/ }).click();
      await sheet.getByRole("button", { name: "You", exact: true }).click();
      await expect(sheet.getByRole("checkbox", { name: "Change visitor rules", exact: true })).toBeDisabled();
      await expect(sheet.getByRole("button", { name: "Save visitor rules", exact: true })).toBeDisabled();
      await sheet.getByRole("button", { name: "← Change visitor rules", exact: true }).click();
      await sheet.getByRole("button", { name: "Add person", exact: true }).click();
      await sheet.getByRole("button", { name: "Ada", exact: true }).click();
      await sheet.getByRole("checkbox", { name: "Change visitor rules", exact: true }).check();
      await sheet.getByRole("button", { name: "Save visitor rules", exact: true }).click();
      assert(
        (await page.evaluate(() => window.quickState.venues[0].privateSpaces[0].access.managerIds)).includes("ada"),
      );
      await sheet.locator(".marinara-capability-villages-venue-navigation").getByRole("button").click();
      const personalBefore = await page.evaluate(() => window.quickState.venues[0]);
      await access.getByLabel("Entry", { exact: true }).selectOption("public");
      await access.getByRole("button", { name: "Save visitor rules", exact: true }).click();
      const personalExpected = structuredClone(personalBefore);
      personalExpected.privateSpaces[0].access.mode = "public";
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues[0]),
        personalExpected,
        "Making a personal Zone public keeps its owner and sleeping assignment",
      );
      await access.getByLabel("Entry", { exact: true }).selectOption("permission-required");
      await access.getByRole("button", { name: "Save visitor rules", exact: true }).click();
      assert.deepEqual(await page.evaluate(() => window.quickState.venues[0]), personalBefore);
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
      const keptVenues = await page.evaluate(() => window.quickState.venues);
      await page.evaluate(() => {
        window.setFoundingVisible(false);
        window.restoreMissingSuggestion();
      });
      await button("Save draft").click();
      const beforeUnavailableReads = reads;
      unavailable = true;
      await page.reload();
      await expect(button("Retry")).toBeEnabled();
      await expect.poll(() => reads).toBe(beforeUnavailableReads + 1);
      assert.equal(calls, 4, "An unavailable saved result never generates automatically");
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues),
        keptVenues,
        "Recovery retains all Venue edits and map pins",
      );
      await first.click();
      await manage();
      await sheet.getByLabel("Description", { exact: true }).fill("Still editable after an unavailable result");
      await closeVenue();
      await page.waitForTimeout(2250);
      assert.equal(reads, beforeUnavailableReads + 1, "An authoritative missing result stops the recovery interval");
      await button("Save draft").click();
      await page.reload();
      await expect(button("Retry")).toBeEnabled();
      await expect
        .poll(() => page.evaluate(() => window.quickState.venues[0].form))
        .toBe("Still editable after an unavailable result");
      assert.equal(reads, beforeUnavailableReads + 1, "Reloading the saved failure does not resume polling");
      assert.equal(calls, 4);
      await button("Retry").click();
      await page.getByRole("dialog").getByRole("button", { name: "Replace and suggest", exact: true }).click();
      await expect.poll(() => calls).toBe(5);
      await expect(button("Suggest")).toBeEnabled();
      await page.screenshot({ path: ".build-tmp/page-three-" + viewport.width + ".png" });
      await context.close();
    });
  }
});
