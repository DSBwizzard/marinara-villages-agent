import { mockEngineLookups } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { build } from "../scripts/esbuild.mjs";
const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `
import {createRoot} from 'react-dom/client';
import {useState} from 'react';
import {SpaceConnections} from './packages/villages/src/client/shared/SpaceConnections.js';
import {FoundingConnections} from './packages/villages/src/client/features/founding/villages-founding-zones.js';
import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';
syncVillagesStyles();
let saved={spaces:[],privateSpaces:[{id:'kitchen',name:'Kitchen',controllerIds:['player'],connectedTo:['exterior']},{id:'bedroom',name:'Bedroom',controllerIds:['player'],connectedTo:['exterior']}]};
function Harness(){
  const [editing,setEditing]=useState(false);
  const [upgrade,setUpgrade]=useState([{id:'exterior',name:'Exterior',kind:'exterior',connectedTo:['kitchen','bedroom']},{id:'kitchen',name:'Kitchen',connectedTo:['exterior']},{id:'bedroom',name:'Bedroom',connectedTo:['exterior']},{id:'loft',name:'Loft',connectedTo:['exterior']}]);
  window.upgrade=upgrade;
  const [venue,setVenue]=useState(saved);window.venue=venue;
  return <div>{editing ? <SpaceConnections spaces={upgrade} editableIds={['loft']} onChange={setUpgrade}/> : <FoundingConnections venue={venue} onPatch={v=>{saved=v;setVenue(v)}}/>}
    <button onClick={()=>setEditing(true)}>Edit Upgrade connections</button>
    <button onClick={()=>setVenue(v=>({...v,privateSpaces:v.privateSpaces.map(s=>({...s,controllerIds:['npc']}))}))}>Change access</button>
  </div>
}
let root=createRoot(document.getElementById('root'));
window.remount=()=>{root.unmount();root=createRoot(document.getElementById('root'));root.render(<Harness/>)};
root.render(<Harness/>);
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
  for (const width of [1280, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 850 } });
    await mockEngineLookups(page);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setContent(
      '<style>body{margin:0}</style><marinara-capability-villages><div id="root"></div></marinara-capability-villages>',
    );
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const links = page.getByRole("group", { name: "Connections between spaces" });
    const map = page.getByRole("region", { name: "Zone layout", exact: true });
    await expect(map.locator("svg line")).toHaveCount(2);
    const before = await page.evaluate(() => window.venue.privateSpaces.map((s) => s.connectedTo));
    await page.getByRole("button", { name: "Change access" }).click();
    assert.deepEqual(await page.evaluate(() => window.venue.privateSpaces.map((s) => s.connectedTo)), before);
    await map.getByRole("button", { name: "Connect Zones", exact: true }).click();
    await map.getByRole("button", { name: "Remove connection Entrance to Kitchen" }).click();
    await expect(map.locator("svg line")).toHaveCount(1);
    assert.deepEqual(
      await page.evaluate(() => window.venue.privateSpaces.find((s) => s.id === "kitchen").connectedTo),
      [],
    );
    await map.locator('[data-layout-zone="kitchen"]').click();
    await map.locator('[data-layout-zone="bedroom"]').click();
    await expect(map.locator("svg line")).toHaveCount(2);
    assert.deepEqual(
      await page.evaluate(() => window.venue.privateSpaces.find((s) => s.id === "kitchen").connectedTo),
      ["bedroom"],
    );
    const saved = await page.evaluate(() => JSON.stringify(window.venue));
    await page.evaluate(() => window.remount());
    await expect(map.locator("svg line")).toHaveCount(2);
    assert.equal(await page.evaluate(() => JSON.stringify(window.venue)), saved);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "editor fits width " + width);
    await page.getByRole("button", { name: "Edit Upgrade connections" }).click();
    await expect(links.getByRole("button", { name: "Remove connection Exterior to Kitchen" })).toBeDisabled();
    assert.deepEqual(
      await links
        .getByLabel("From space")
        .locator("option")
        .evaluateAll((rows) => rows.map((row) => row.value)),
      ["", "loft"],
    );
    await links.getByLabel("From space").selectOption("loft");
    await links.getByLabel("To space").selectOption("kitchen");
    await links.getByRole("button", { name: "Add connection" }).click();
    assert(
      (await page.evaluate(() => window.upgrade.find((row) => row.id === "loft").connectedTo)).includes("kitchen"),
    );
    await page.screenshot({ path: ".build-tmp/space-connections-" + width + ".png", fullPage: true });
    assert.deepEqual(errors, []);
    await page.close();
  }
});
console.log(
  "Space connection editors: desktop, phone, compact phone, private-only map, access independence, graph rewiring, remount preservation and Upgrade edit boundaries passed",
);
