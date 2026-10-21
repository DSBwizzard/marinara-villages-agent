import assert from "node:assert/strict";
import { build } from "esbuild";
import { chromium, expect } from "@playwright/test";
const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `
import {createRoot} from 'react-dom/client';import {useState} from 'react';
import {FoundingAdmissions} from './packages/villages/src/client/features/founding/FoundingAdmissions.tsx';
import {VILLAGES_FORGING_STYLES} from './packages/villages/src/client/features/founding/villages-forging-styles.ts';
function App(){const [people,setPeople]=useState([]),[player,setPlayer]=useState(localStorage.getItem('player')||''),[contexts,setContexts]=useState(JSON.parse(localStorage.getItem('contexts')||'{}'));
return <><style>{VILLAGES_FORGING_STYLES+'textarea{box-sizing:border-box;width:100%;font:inherit}button{min-height:44px}'}</style><div className="villages-forging-v2" style={{maxWidth:700,margin:'auto'}}><button onClick={()=>setPeople([{id:'mara',name:'Mara'}])}>Select Mara</button><button onClick={()=>setPeople([{id:'mara',name:'Mara'},{id:'ellis',name:'Ellis'}])}>Select Ellis too</button><FoundingAdmissions people={people} playerBackground={player} admissions={contexts} onPlayer={v=>{setPlayer(v);localStorage.setItem('player',v)}} onAdmissions={v=>{setContexts(v);localStorage.setItem('contexts',JSON.stringify(v))}} disabled={false}/></div></>};createRoot(document.getElementById('root')).render(<App/>);
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
    let paid = 0;
    await page.route("http://cast.test/", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: '<meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div>',
      }),
    );
    await page.route("**/api/**", (route) => {
      paid++;
      return route.abort();
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
    await page.getByRole("textbox", { name: "Your backstory", exact: true }).fill("My own starting story.");
    const field = page.getByRole("textbox", { name: "Your backstory", exact: true });
    for (const label of ["Your backstory"]) {
      const help = page.getByRole("button", { name: "Help: " + label, exact: true });
      await help.scrollIntoViewIfNeeded();
      const before = await field.boundingBox();
      await help.click();
      const popup = page.getByRole("dialog", { name: label, exact: true });
      await expect(popup).toBeVisible();
      await page.screenshot({ path: ".build-tmp/help-" + label.replaceAll(" ", "-") + "-" + width + ".png" });
      await expect(popup.getByRole("note")).toContainText(
        "In Villages, you (the player) coordinate with Villagers on major changes, improvements, and developments.",
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
    await page.getByLabel("Mara homeworld", { exact: true }).fill("Othiras");
    await expect(page.getByLabel("Mara starting note", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "+ Add starting note", exact: true }).first().click();
    await page.getByLabel("Mara starting note", { exact: true }).fill("Already living here.");
    await load();
    await page.getByRole("button", { name: "Select Mara", exact: true }).click();
    await expect(page.getByLabel("Mara starting note", { exact: true })).toHaveValue("Already living here.");
    await expect(page.getByLabel("Your backstory", { exact: true })).toHaveValue("My own starting story.");
    assert.equal(paid, 0);
    await page.screenshot({ path: ".build-tmp/player-background-" + width + ".png" });
    await context.close();
  }
} finally {
  await browser.close();
}
console.log("Starting situations: player help, manual notes, reload and desktop/phone layout passed.");
