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
return <><style>{VILLAGES_FORGING_STYLES+'textarea{box-sizing:border-box;width:100%;font:inherit}button{min-height:44px}'}</style><div className="villages-forging-v2" style={{maxWidth:700,margin:'auto'}}><button onClick={()=>setPeople([{id:'mara',name:'Mara'}])}>Select Mara</button><button onClick={()=>setPeople([{id:'mara',name:'Mara'},{id:'ellis',name:'Ellis'}])}>Select Ellis too</button><FoundingBackgrounds villageName="Crystalwood" people={people} playerBackground={player} contexts={contexts} onPlayer={v=>{setPlayer(v);localStorage.setItem('player',v)}} onContexts={v=>{setContexts(v);localStorage.setItem('contexts',JSON.stringify(v))}} disabled={false} source={{founding:true,playerPersonaId:'scholar',foundingCharacterIds:people.map(p=>p.id),setting:'A harbor observatory',premise:'People gather to study the stars.',worldOrigin:'different-worlds'}}/></div></>};createRoot(document.getElementById('root')).render(<App/>);
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
    const field = page.getByRole("textbox", { name: "Your backstory", exact: true });
    for (const label of ["Backstories", "Your backstory"]) {
      const help = page.getByRole("button", { name: "Help: " + label, exact: true });
      await help.scrollIntoViewIfNeeded();
      const before = await field.boundingBox();
      await help.click();
      const popup = page.getByRole("dialog", { name: label, exact: true });
      await expect(popup).toBeVisible();
      await page.screenshot({ path: ".build-tmp/help-" + label.replaceAll(" ", "-") + "-" + width + ".png" });
      await expect(popup.getByRole("note")).toContainText(
        label === "Backstories"
          ? 'These backstories connect each person to Crystalwood. Use "Propose backstories" after adding the Villagers you want, and their narratives can intersect if appropriate.'
          : "In Villages, you (the player) coordinate with Villagers on major changes, improvements, and developments.",
      );
      assert.deepEqual(await field.boundingBox(), before, "opening help leaves fields unchanged");
      const box = await popup.boundingBox();
      if (width < 700) {
        await expect(popup).toHaveAttribute("aria-modal", "true");
        assert.ok(Math.abs(box.x + box.width / 2 - width / 2) < 2, "mobile help centers horizontally");
        assert.ok(Math.abs(box.y + box.height / 2 - 422) < 2, "mobile help centers vertically");
        assert.equal(
          await popup.evaluate((el) => getComputedStyle(el, "::backdrop").backgroundColor),
          "rgba(0, 0, 0, 0.25)",
        );
      } else {
        const surface = page.locator(".villages-forging-v2");
        const panel = await surface.boundingBox();
        assert.ok(
          box.x >= panel.x && box.x + box.width <= panel.x + panel.width,
          "help stays inside the Villages panel",
        );
        await surface.evaluate((el) => (el.style.width = "480px"));
        await expect
          .poll(async () => {
            const popupBox = await popup.boundingBox(),
              panelBox = await surface.boundingBox();
            return popupBox.x >= panelBox.x && popupBox.x + popupBox.width <= panelBox.x + panelBox.width;
          })
          .toBe(true);
        await expect(popup).toBeVisible();
        await surface.evaluate((el) => (el.style.width = ""));
      }
      await popup.getByRole("button", { name: "Close " + label + " help", exact: true }).click();
      await expect(popup).toHaveCount(0);
      await expect(help).toBeFocused();
    }
    await page.getByRole("button", { name: "Propose backstories", exact: true }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    assert.equal(paid, 1);
    await load();
    await page.getByRole("button", { name: "Select Ellis too" }).click();
    await page.getByRole("button", { name: "Retrieve result", exact: true }).click();
    await expect(page.getByLabel("Your backstory", { exact: true })).toHaveValue(/came to study/);
    await expect(page.getByLabel("Mara backstory", { exact: true })).toHaveValue(/visiting students/);
    await expect(page.getByLabel("Ellis backstory", { exact: true })).toHaveValue(/stars/);
    assert.equal(paid, 1, "retrieval after reload costs no generation");
    await page.getByLabel("Your backstory", { exact: true }).fill("My authored starting background.");
    hold = true;
    await page.getByRole("button", { name: "Try again", exact: true }).click();
    await expect.poll(() => typeof release).toBe("function");
    await page.getByLabel("Mara backstory", { exact: true }).fill("My revised Mara backstory.");
    release();
    await expect(page.getByRole("button", { name: "Proposing…", exact: true })).toHaveCount(0);
    await expect(page.getByLabel("Mara backstory", { exact: true })).toHaveValue("My revised Mara backstory.");
    await expect(page.getByLabel("Your backstory", { exact: true })).toHaveValue("My authored starting background.");
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
