// Test cases: zones/map/founding, zones/map/editor
import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, expect, mockEngineLookups } from "./fixtures/browser-diagnostics.mjs";
import { createVenueScreenHarness } from "./fixtures/villages-venue-screen-lifetime.fixture.mjs";

const styles = await build({
  stdin: {
    contents: "import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';syncVillagesStyles();",
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
});
const founding = await build({
  stdin: {
    contents: `
import {createRoot} from 'react-dom/client';import {useState} from 'react';
import {FoundingWorkspace} from './packages/villages/src/client/features/founding/villages-founding-workspace.js';
import {newSetupVenue} from './packages/villages/src/client/features/founding/FoundingPanels.js';
function Harness(){const [venue,setVenue]=useState(()=>newSetupVenue('home','residence',.2,.3,true));
const [state,setState]=useState({view:'details',paused:false,sections:{},zones:{}}),[issue,setIssue]=useState(null);window.readVenue=()=>venue;
window.focusZone=id=>{setState(state=>({...state,sections:{home:'zones'},zones:{home:id}}));setIssue({venueId:'home',zoneId:id,field:'zone-name',message:'Name this Zone.'});};
return <div className='villages-forging-v2'><FoundingWorkspace venues={[venue]} people={[]} selectedId='home' placementId={null} state={state} map={null} existing={false} mapReady={true} issues={[]} focusIssue={issue} imageTarget={null} imageBusy={false} suggestionsBusy={false} suggestionsChanged={false} onState={setState} onSelect={()=>{}} onContinue={()=>{}} onPatch={setVenue} onDraft={()=>{}} onGenerate={()=>{}} onUpload={()=>{}} /></div>}
createRoot(document.querySelector('marinara-capability-villages')).render(<Harness/>);
`,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
const node = (map, id) => map.locator(`[data-layout-zone=${JSON.stringify(id)}]`);
async function assertNoOverlap(map) {
  const boxes = await map
    .locator("[data-layout-zone]")
    .evaluateAll((nodes) => nodes.map((n) => ({ id: n.dataset.layoutZone, rect: n.getBoundingClientRect().toJSON() })));
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i].rect,
        b = boxes[j].rect;
      assert.ok(
        a.right <= b.left + 0.1 || b.right <= a.left + 0.1 || a.bottom <= b.top + 0.1 || b.bottom <= a.top + 0.1,
        `${boxes[i].id} overlaps ${boxes[j].id}`,
      );
    }
}
try {
  await runCase("zones/map/founding", async () => {
    for (const width of [1366, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, hasTouch: width < 700 });
      await mockEngineLookups(page);
      await page.setContent(
        "<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}body{margin:0;font-family:Arial}marinara-capability-villages{display:block}</style><marinara-capability-villages></marinara-capability-villages>",
      );
      await page.addScriptTag({ content: styles.outputFiles[0].text });
      await page.addScriptTag({ content: founding.outputFiles[0].text });
      await page.getByRole("tab", { name: "Layout", exact: true }).click();
      const map = page.locator(".villages-zone-map");
      await expect(map.locator("[data-layout-zone]")).toHaveCount(3);
      await assertNoOverlap(map);
      await node(map, "common:base").focus();
      const start = await node(map, "common:base").boundingBox();
      await node(map, "common:base").press("ArrowRight");
      assert.ok((await node(map, "common:base").boundingBox()).x > start.x, "Keyboard rearranges a founding Zone");
      await page.getByRole("button", { name: "Add Zone", exact: true }).click();
      const selected = (await page.evaluate(() => window.readVenue())).spaces.at(-1).id;
      await page.getByLabel("Zone Name", { exact: true }).fill("A long named room for shared community gatherings");
      await page.getByRole("tab", { name: "Layout", exact: true }).click();
      await page.evaluate((id) => window.focusZone(id), selected);
      await expect(page.getByLabel("Zone Name", { exact: true })).toBeFocused();
      await page.getByRole("tab", { name: "Layout", exact: true }).click();
      await expect(map.locator("[data-layout-zone]")).toHaveCount(4);
      await expect(node(map, selected)).toContainText("A long named room");
      await map.getByRole("button", { name: "Connect Zones", exact: true }).click();
      await node(map, selected).click();
      await node(map, "common:base").click();
      await expect(map.locator("svg line")).toHaveCount(4);
      await map.getByRole("button", { name: "Done connecting", exact: true }).click();
      const source = await node(map, "common:base").boundingBox(),
        target = await node(map, "exterior").boundingBox();
      await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
      await page.mouse.down();
      await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 10 });
      await page.mouse.up();
      await assertNoOverlap(map);
      await expect(map.getByText(/Zones cannot overlap|Every space needs/)).toHaveCount(0);
      await page.setViewportSize({ width: 320, height: 1000 });
      await assertNoOverlap(map);
      await map.getByRole("button", { name: "Connect Zones", exact: true }).click();
      await map
        .getByRole("button", {
          name: /Remove connection Entrance to Common Space|Remove connection Common Space to Entrance/,
        })
        .click();
      await expect(map.locator("svg line")).toHaveCount(3);
      const cancelBox = await node(map, "common:base").boundingBox();
      await page.mouse.move(cancelBox.x + cancelBox.width / 2, cancelBox.y + cancelBox.height / 2);
      await page.mouse.down();
      await node(map, "common:base").dispatchEvent("pointercancel", { pointerId: 1 });
      await page.mouse.up();
      await assertNoOverlap(map);
      await page.close();
    }
  });
  await runCase("zones/map/editor", async () => {
    const mount = await createVenueScreenHarness(browser);
    const f = await mount(false, 1366, {
      page: "view",
      zone: "exterior",
      prepareSeed(seed) {
        const place = seed.settings.venues[0],
          sample = place.zones[0];
        place.zones = Array.from({ length: 7 }, (_, i) => ({
          ...structuredClone(sample),
          id: i ? `zone:${i}` : "exterior",
          name: i ? `Room ${i}` : "Entrance",
          kind: i ? "public" : "exterior",
          connectedTo: i ? ["exterior"] : Array.from({ length: 6 }, (_, j) => `zone:${j + 1}`),
        }));
      },
    });
    await f.page.evaluate(() => {
      const tag = document.createElement("marinara-capability-villages");
      document.body.append(tag);
      tag.append(document.getElementById("root"));
    });
    await f.page.addStyleTag({
      content:
        "#state{display:none} :root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}body{margin:0}",
    });
    await f.page.addScriptTag({ content: styles.outputFiles[0].text });
    const map = f.page.locator(".villages-zone-map");
    await expect(map.locator("[data-layout-zone]")).toHaveCount(7);
    await node(map, "exterior").press("ArrowRight");
    await map.getByRole("button", { name: "Connect Zones", exact: true }).click();
    await node(map, "zone:1").click();
    await node(map, "zone:2").click();
    await map.getByRole("button", { name: "Done connecting", exact: true }).click();
    await f.page.getByRole("button", { name: "Save layout", exact: true }).click();
    await expect.poll(() => f.requests.length).toBe(1);
    assert.equal(f.requests[0].path, "/api/villages/venues/A%20%2F%20venue/layout");
    assert.equal(f.requests[0].method, "PUT");
    const body = f.requests[0].body;
    assert.equal(body.positions.exterior.x, 1);
    assert.equal(body.connections.length, 7);
    assert.ok(body.connections.find((z) => z.id === "zone:1").connectedTo.includes("zone:2"));
    assert.ok(!JSON.stringify(body).includes("description"), "Layout request excludes interiors");
    f.seed.settings.venues[0].zoneLayout = body.positions;
    f.seed.settings.venues[0].zones.forEach(
      (zone) => (zone.connectedTo = body.connections.find((row) => row.id === zone.id).connectedTo),
    );
    await f.reply(0);
    await expect(f.page.getByRole("button", { name: "Save layout", exact: true })).toBeDisabled();
    await node(map, "exterior").press("ArrowRight");
    await f.page.getByRole("button", { name: "Cancel layout changes", exact: true }).click();
    await expect(f.page.getByRole("button", { name: "Save layout", exact: true })).toBeDisabled();
    await map.getByRole("button", { name: "Connect Zones", exact: true }).click();
    await map
      .getByRole("button", { name: /Remove connection Entrance to Room 3|Remove connection Room 3 to Entrance/ })
      .click();
    await expect(f.page.getByRole("alert")).toHaveCount(0);
    await f.page.getByRole("button", { name: "Save layout", exact: true }).click();
    await expect(f.page.getByRole("alert")).toHaveText("Cannot save Venue layout: Unreachable Zones.");
    assert.equal(f.requests.length, 1, "unreachable layout is rejected without a save request");
    await f.page.getByRole("button", { name: "Cancel layout changes", exact: true }).click();
    await expect(f.page.getByRole("alert")).toHaveCount(0);
    for (const width of [1366, 736, 390, 320]) {
      await f.page.setViewportSize({ width, height: 1000 });
      await assertNoOverlap(map);
    }
    await f.finish();
  });
} finally {
  await browser.close();
}
