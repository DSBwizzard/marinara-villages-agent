import { mockEngineLookups } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { build } from "../scripts/esbuild.mjs";
const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents:
      "\nimport {createRoot} from 'react-dom/client';\nimport {useState} from 'react';\nimport {SpaceConnections} from './packages/villages/src/client/shared/SpaceConnections.js';\nimport {FoundingConnections} from './packages/villages/src/client/features/founding/villages-founding-zones.js';\nimport {VILLAGES_FORGING_STYLES} from './packages/villages/src/client/features/founding/villages-forging-styles.js';\nlet saved={spaces:[],privateSpaces:[{id:'kitchen',name:'Kitchen',controllerIds:['player'],connectedTo:['exterior']},{id:'bedroom',name:'Bedroom',controllerIds:['player'],connectedTo:['exterior']}]};\nfunction Harness(){const [editing,setEditing]=useState(false);const [upgrade,setUpgrade]=useState([{id:\"exterior\",name:\"Exterior\",kind:\"exterior\",connectedTo:[\"kitchen\",\"bedroom\"]},{id:\"kitchen\",name:\"Kitchen\",connectedTo:[\"exterior\"]},{id:\"bedroom\",name:\"Bedroom\",connectedTo:[\"exterior\"]},{id:\"loft\",name:\"Loft\",connectedTo:[\"exterior\"]}]);window.upgrade=upgrade;const [venue,setVenue]=useState(saved);window.venue=venue;return <div className=\"villages-forging\"><style>{VILLAGES_FORGING_STYLES}</style>{editing ? <SpaceConnections spaces={upgrade} editableIds={[\"loft\"]} onChange={setUpgrade}/> : <FoundingConnections venue={venue} onPatch={v=>{saved=v;setVenue(v)}}/>}<button onClick={()=>setEditing(true)}>Edit Upgrade connections</button><button onClick={()=>setVenue(v=>({...v,privateSpaces:v.privateSpaces.map(s=>({...s,controllerIds:['npc']}))}))}>Change access</button></div>}\nlet root=createRoot(document.getElementById('root'));window.remount=()=>{root.unmount();root=createRoot(document.getElementById('root'));root.render(<Harness/>)};root.render(<Harness/>);\n",
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
try {
  for (const width of [1280, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 850 } });
    await mockEngineLookups(page);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const links = page.getByRole("group", { name: "Connections between spaces" });
    await expect(links.getByRole("listitem")).toHaveCount(2);
    const before = await page.evaluate(() => window.venue.privateSpaces.map((s) => s.connectedTo));
    await page.getByRole("button", { name: "Change access" }).click();
    assert.deepEqual(await page.evaluate(() => window.venue.privateSpaces.map((s) => s.connectedTo)), before);
    await links.getByRole("button", { name: "Remove connection Exterior to Kitchen" }).click();
    await expect(links.getByRole("status")).toContainText("Exterior");
    await links.getByLabel("From space").selectOption("kitchen");
    await links.getByLabel("To space").selectOption("bedroom");
    await links.getByRole("button", { name: "Add connection" }).click();
    await expect(links.getByRole("status")).toHaveCount(0);
    await expect(links.getByRole("listitem")).toHaveCount(2);
    const saved = await page.evaluate(() => JSON.stringify(window.venue));
    await page.evaluate(() => window.remount());
    await expect(links.getByRole("listitem")).toHaveCount(2);
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
} finally {
  await browser.close();
}
console.log(
  "Space connection editor: desktop, phone, compact phone, private-only layout, access independence, invalid graph feedback, rewiring and remount preservation passed",
);
