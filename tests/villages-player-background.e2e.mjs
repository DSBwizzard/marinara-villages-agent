import assert from "node:assert/strict";
import { build } from "esbuild";
import { chromium, expect } from "@playwright/test";
const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `
import {createRoot} from 'react-dom/client';import {useState} from 'react';
import {FoundingBackgrounds} from './packages/villages/src/client/features/founding/FoundingBackgrounds.tsx';
import {VILLAGES_FORGING_STYLES} from './packages/villages/src/client/features/founding/villages-forging-styles.ts';
function App(){const [people,setPeople]=useState([]),[player,setPlayer]=useState(localStorage.getItem('player')||''),[contexts,setContexts]=useState(JSON.parse(localStorage.getItem('contexts')||'{}'));
return <><style>{VILLAGES_FORGING_STYLES+'textarea{box-sizing:border-box;width:100%;font:inherit}button{min-height:44px}'}</style><div className="villages-forging-v2" style={{maxWidth:700,margin:'auto'}}><button onClick={()=>setPeople([{id:'mara',name:'Mara'}])}>Select Mara</button><button onClick={()=>setPeople([{id:'mara',name:'Mara'},{id:'ellis',name:'Ellis'}])}>Select Ellis too</button><FoundingBackgrounds people={people} playerBackground={player} contexts={contexts} onPlayer={v=>{setPlayer(v);localStorage.setItem('player',v)}} onContexts={v=>{setContexts(v);localStorage.setItem('contexts',JSON.stringify(v))}} disabled={false} source={{founding:true,playerPersonaId:'scholar',foundingCharacterIds:people.map(p=>p.id),setting:'A harbor observatory',premise:'People gather to study the stars.',worldOrigin:'different-worlds'}}/></div></>};createRoot(document.getElementById('root')).render(<App/>);
`,
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [1366, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 844 } }),
      page = await context.newPage();
    let paid = 0,
      drop = true,
      hold = false,
      release;
    const saved = new Map();
    await page.route("http://cast.test/", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: '<meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div>',
      }),
    );
    await page.route("**/api/villages/villagers/background/draft", async (route) => {
      const input = route.request().postDataJSON();
      assert.equal(input.foundingCast, true);
      assert.deepEqual(input.foundingCharacterIds, ["mara", "ellis"]);
      let output = saved.get(input.actionId);
      if (!output) {
        assert.equal(input.retrieveOnly, false);
        paid++;
        output = {
          player: "I came to study the observatory.",
          residents: { mara: "Mara helps visiting students.", ellis: "Ellis arrived to study the stars." },
        };
        saved.set(input.actionId, output);
      }
      if (hold) {
        hold = false;
        await new Promise((r) => (release = r));
      }
      if (drop) {
        drop = false;
        return route.abort();
      }
      return route.fulfill({ contentType: "application/json", body: JSON.stringify({ text: JSON.stringify(output) }) });
    });
    const load = async () => {
      await page.goto("http://cast.test/");
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
    };
    await load();
    await page.getByRole("button", { name: "Select Mara", exact: true }).click();
    assert.equal(paid, 0);
    await page.getByRole("button", { name: "Select Ellis too" }).click();
    assert.equal(paid, 0, "selection does not dispatch");
    await page.getByRole("button", { name: "Help: Your background", exact: true }).click();
    await expect(
      page.getByText(/In Villages, you oversee major changes, improvements, and developments./, { exact: false }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Help: Your background", exact: true }).click();
    await page.getByRole("button", { name: "Propose backgrounds", exact: true }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    assert.equal(paid, 1);
    await load();
    await page.getByRole("button", { name: "Select Ellis too" }).click();
    await page.getByRole("button", { name: "Retrieve result", exact: true }).click();
    await expect(page.getByLabel("Your background", { exact: true })).toHaveValue(/came to study/);
    await expect(page.getByLabel("Mara background", { exact: true })).toHaveValue(/visiting students/);
    await expect(page.getByLabel("Ellis background", { exact: true })).toHaveValue(/stars/);
    assert.equal(paid, 1, "retrieval after reload costs no generation");
    await page.getByLabel("Your background", { exact: true }).fill("My authored starting background.");
    hold = true;
    await page.getByRole("button", { name: "Try again", exact: true }).click();
    await expect.poll(() => typeof release).toBe("function");
    await page.getByLabel("Mara background", { exact: true }).fill("My revised Mara background.");
    release();
    await expect(page.getByRole("button", { name: "Proposing…", exact: true })).toHaveCount(0);
    await expect(page.getByLabel("Mara background", { exact: true })).toHaveValue("My revised Mara background.");
    await expect(page.getByLabel("Your background", { exact: true })).toHaveValue("My authored starting background.");
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      "background fields fit viewport",
    );
    assert.equal(await page.getByRole("textbox", { name: "Role Title", exact: true }).count(), 0);
    await page.screenshot({ path: ".build-tmp/player-background-" + width + ".png" });
    await context.close();
  }
} finally {
  await browser.close();
}
console.log(
  "Shared cast backgrounds: explicit single request, player help, no-paid retrieval, edit race and desktop/phone layout passed.",
);
