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
 const upload=(venue,area,file,id)=>{const image={id:'fixture',ref:'global-gallery:fixture',url:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='};patch(venue.id,row=>area==='exterior'?{...row,pictureReference:image}:{...row,[area==='private'?'privateSpaces':'spaces']:(row[area==='private'?'privateSpaces':'spaces']??[]).map(zone=>zone.id===id?{...zone,pictureReference:image}:zone)});};
 window.quickState={venues,workspace,authored,suggestionsKey:key,problem,moving};
 window.replaceQuickVenues=setVenues;
 window.legacyPolicy=()=>setVenues(rows=>rows.map(row=>row.id!=='founding-home:player'?row:{...row,
 access:{version:1,revision:0,managerIds:['player'],visitorHours:null,permissions:[],bans:[],exceptions:[],changes:[],visitDenials:[],receipts:{}},
 spaces:row.spaces.map(zone=>zone.id!=='common:base'?zone:{...zone,access:{mode:'public',managerIds:null,memberIds:[],memberRoles:[],inviterIds:[],visitorHours:'inherit',accompanied:false}})}));
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
            '<meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;background:#121936;color:white;font:16px system-ui"><header id="engine-controls" style="height:96px;background:#111;display:flex;align-items:center;gap:16px"><button onclick="window.engineClicks=(window.engineClicks||0)+1">Engine control</button><button>Engine navigation</button></header><marinara-capability-villages style="display:block;height:calc(100dvh - 96px)"><div id="root" style="height:100%"></div></marinara-capability-villages><script>' +
            bundle.outputFiles[0].text +
            "</script>",
        }),
      );
      await page.goto("http://page-three.test/");
      const sheet = page.locator(".villages-quick-dialog");
      const button = (name) => page.getByRole("button", { name, exact: true });
      await expect(sheet).toHaveCount(0);
      const first = page.locator('[data-venue-id="founding-home:player"]');
      const engine = page.locator("#engine-controls");
      const engineBefore = await engine.screenshot();
      await first.click();
      await expect(sheet).toBeVisible();
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
      await sheet.getByLabel("Venue form", { exact: true }).fill("A timber cottage");
      await sheet.getByRole("button", { name: "Done", exact: true }).click();
      await expect(sheet).toHaveCount(0);
      await expect(first).toBeFocused();
      await expect(page.locator(".villages-forging-body")).toHaveJSProperty("inert", false);
      await first.click();
      if (viewport.width > 600) {
        await page.locator(".villages-founding-overlay").click({ position: { x: 2, y: 2 } });
        await expect(sheet).toHaveCount(0);
        await expect(first).toBeFocused();
        await first.click();
      }
      await expect(sheet.getByLabel("Venue form", { exact: true })).toHaveValue("A timber cottage");
      await page.keyboard.press("Escape");
      await expect(sheet).toHaveCount(0);
      await expect(first).toBeFocused();
      await first.click();
      assert.equal(calls, 0);
      await expect(button("+ Add home")).toHaveCount(0);
      await expect(button("+ Add Venue")).toHaveCount(0);
      await expect(sheet.getByRole("button", { name: "People", exact: true })).toHaveCount(0);
      await expect(sheet.getByRole("combobox")).toHaveCount(0);
      await expect(sheet.getByRole("button", { name: "Zones", exact: true })).toHaveCount(0);
      await expect(sheet.getByRole("button", { name: "Venue", exact: true })).toHaveCount(0);
      await expect(sheet.getByRole("switch")).toHaveCount(0);
      const zone = (id) => sheet.locator('[data-layout-zone="' + id + '"]');
      await expect(button("Edit layout")).toBeVisible();
      await expect(button("Add Zone")).toHaveCount(0);
      await expect(button("Remove Zone")).toHaveCount(0);
      await expect(button("Modify Zone Connections")).toHaveCount(0);
      await expect(sheet.locator(".villages-zone-map")).toHaveCount(0);
      const originalVenues = await page.evaluate(() => window.quickState.venues);
      await button("Edit layout").click();
      await expect(button("Finish layout")).toBeVisible();
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
      await page.evaluate((rows) => window.replaceQuickVenues(rows), originalVenues);
      await expect(sheet.locator("[data-layout-zone]")).toHaveCount(2);
      assert.equal((await canvas.boundingBox()).height, canvasHeight, "Sparse graphs keep the full canvas height");
      await zone("common:base").scrollIntoViewIfNeeded();
      const room = await zone("common:base").boundingBox();
      const entrance = await zone("exterior").boundingBox();
      await page.mouse.move(room.x + room.width / 2, room.y + room.height / 2);
      await page.mouse.down();
      await page.mouse.move(room.x + room.width * 1.51, entrance.y + entrance.height / 2 - 2, { steps: 1 });
      await page.mouse.up();
      await expect.poll(() => page.evaluate(() => window.quickState.venues[0].zoneLayout["common:base"].y)).toBe(0);
      const adjacent = await zone("common:base").boundingBox();
      assert.ok(
        adjacent.x >= entrance.x + entrance.width && adjacent.x < entrance.x + entrance.width + 4,
        "Zones can sit immediately beside another visible Zone without an invisible blocked margin",
      );
      await assertGraph();
      await button("Add Zone").click();
      await expect(sheet.locator("[data-layout-zone]")).toHaveCount(3);
      const addedZone = await sheet.locator(".villages-quick-selected-zone").getAttribute("data-zone-id");
      await button("Finish layout").click();
      await sheet.getByLabel("Zone name", { exact: true }).fill("Reading nook");
      await sheet.getByLabel("Zone name", { exact: true }).press("Enter");
      await expect(sheet.getByRole("heading", { name: "Reading nook", exact: true })).toBeVisible();
      await button("Rename Zone").click();
      await expect(sheet.getByLabel("Zone name", { exact: true })).toBeFocused();
      await button("Edit layout").click();
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
      await expect(sheet.locator("[data-layout-zone]")).toHaveCount(2);
      await expect(zone("exterior")).toHaveAttribute("aria-pressed", "true");
      await button("Modify Zone Connections").click();
      await zone("exterior").click();
      const beforeFinish = await page.evaluate(() => window.quickState.venues);
      await button("Finish layout").click();
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
      const access = sheet.getByRole("switch", { name: "Permission required", exact: true });
      await expect(access).not.toBeChecked();
      const preserved = await page.evaluate(() => window.quickState.venues[0]);
      await access.check();
      const expected = structuredClone(preserved);
      expected.spaces[0].access.mode = "permission-required";
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues[0]),
        expected,
        "Access changes preserve manager-owned legacy sleeping destinations and all unrelated fields",
      );
      await sheet.getByLabel("Zone name", { exact: true }).fill("Front Office");
      expected.spaces[0].name = "Front Office";
      await sheet.getByLabel("Venue form", { exact: true }).fill("A converted school bus");
      expected.form = "A converted school bus";
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues[0]),
        expected,
        "Text edits preserve ownership, access and sleeping data",
      );
      const upload = sheet.getByLabel("Upload Zone reference", { exact: true });
      const file = { name: "zone.png", mimeType: "image/png", buffer: Buffer.from("fixture") };
      await upload.setInputFiles(file);
      await expect(sheet.getByRole("img", { name: "Artwork for Front Office", exact: true })).toHaveCount(0);
      await expect(sheet.getByRole("status")).toHaveText("Reference saved. Generate artwork to use it.");
      await zone("exterior").click();
      await expect(access).toHaveCount(0);
      await expect(sheet.getByRole("img")).toHaveCount(0);
      await upload.setInputFiles(file);
      await expect.poll(() => first.evaluate((node) => node.style.backgroundImage)).not.toContain("data:image");
      await expect(first.locator("img")).toHaveCount(0);
      const confirm = async () => {
        if (await sheet.count()) await sheet.getByRole("button", { name: "Done", exact: true }).click();
        await button(calls && receipt?.status === "failed" ? "Retry" : "Suggest").click();
        await page.getByRole("dialog").getByRole("button", { name: "Replace and suggest", exact: true }).click();
      };
      await sheet.getByRole("button", { name: "Done", exact: true }).click();
      await button("Suggest").click();
      await page.setViewportSize({ width: viewport.width, height: 260 });
      const confirmation = page.getByRole("dialog", { name: "Suggest", exact: true });
      const shortPane = await page.locator(".villages-forging-v2").boundingBox();
      const shortDialog = await confirmation.boundingBox();
      assert.ok(
        shortDialog.y >= shortPane.y && shortDialog.y + shortDialog.height <= shortPane.y + shortPane.height + 1,
        "Compact confirmation fits a short Villages pane",
      );
      await confirmation.getByRole("button", { name: "Cancel", exact: true }).click();
      await page.setViewportSize(viewport);
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
      await first.click();
      await zone("private:base").click();
      await expect(access).toBeChecked();
      const personalBefore = await page.evaluate(() => window.quickState.venues[0]);
      await access.uncheck();
      const personalExpected = structuredClone(personalBefore);
      personalExpected.privateSpaces[0].access.mode = "public";
      assert.deepEqual(
        await page.evaluate(() => window.quickState.venues[0]),
        personalExpected,
        "Making a personal Zone public keeps its owner and sleeping assignment",
      );
      await access.check();
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
      await page.screenshot({ path: ".build-tmp/page-three-" + viewport.width + ".png" });
      await context.close();
    });
  }
});
