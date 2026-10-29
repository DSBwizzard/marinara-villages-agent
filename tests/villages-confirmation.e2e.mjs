import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";

const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `import {createRoot} from 'react-dom/client';
import {useState} from 'react';
import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';
syncVillagesStyles();
import {ConfirmationProvider,useConfirmation} from './packages/villages/src/client/shared/confirmation.js';
window.results=[];
function Owner({id,subject}){const confirm=useConfirmation(subject);
return <><button onClick={async()=>window.results.push([id,await confirm('Continue '+id+'?')])}>Ask {id}</button><button onClick={async()=>window.results.push([id,await confirm('Some Zones cannot be reached.',{cancel:'Keep editing',confirm:'Discard and leave'})])}>Layout {id}</button></>}
function App({id}){const [subject,setSubject]=useState(0),[shown,setShown]=useState(true);
window['change'+id]=()=>setSubject(n=>n+1);window['remove'+id]=()=>setShown(false);
return <ConfirmationProvider>{shown?<Owner id={id} subject={subject}/>:null}</ConfirmationProvider>}
for(const id of ['A','B']){const root=createRoot(document.getElementById(id));window['unmount'+id]=()=>root.unmount();root.render(<App id={id}/>);}`,
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("dialog", (dialog) => {
    errors.push("Unexpected browser dialog: " + dialog.type());
    void dialog.dismiss();
  });
  await page.setContent(
    '<style>:root{font-size:20px}body{margin:0;background:#202f36}</style><marinara-capability-villages style="display:block;height:100dvh"><div id="A"></div><div id="B"></div></marinara-capability-villages>',
  );
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  const dialog = page.getByRole("dialog", { name: "Confirm", exact: true });
  for (const width of [1366, 390, 320]) {
    await page.setViewportSize({ width, height: 740 });
    await page.getByRole("button", { name: "Layout A", exact: true }).click();
    await expect(dialog).toContainText("Some Zones cannot be reached.");
    await expect(dialog.getByRole("button", { name: "Keep editing", exact: true })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Discard and leave", exact: true })).toBeVisible();
    await expect(dialog.locator("header")).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Close Confirm", exact: true })).toHaveCount(0);
    const bounds = await dialog.boundingBox();
    if (process.env.VILLAGES_FEEDBACK_SCREENSHOTS)
      await page.screenshot({ path: process.env.VILLAGES_FEEDBACK_SCREENSHOTS + "/confirmation-" + width + ".png" });
    assert.ok(
      bounds.height < 220,
      "confirmation height follows content on every viewport: " + JSON.stringify({ width, bounds }),
    );
    assert.ok(bounds.width <= width - 24 && bounds.x >= 0, "confirmation fits phone width");
    await page.keyboard.press("Escape");
  }
  await page.evaluate(() => {
    window.results = [];
  });
  await page.getByRole("button", { name: "Ask A", exact: true }).click();
  await expect(dialog).toContainText("Continue A?");
  await page.keyboard.press("Escape");
  await expect.poll(() => page.evaluate(() => window.results)).toEqual([["A", false]]);
  await expect(page.getByRole("button", { name: "Ask A", exact: true })).toBeFocused();

  await page.getByRole("button", { name: "Ask A", exact: true }).click();
  await page.evaluate(() => window.changeA());
  await expect(dialog).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.results.length)).toBe(2);
  assert.deepEqual(await page.evaluate(() => window.results[1]), ["A", false]);

  await page.getByRole("button", { name: "Ask A", exact: true }).click();
  await page.evaluate(() => window.unmountB());
  await expect(dialog).toContainText("Continue A?");
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.results.length)).toBe(3);
  assert.deepEqual(await page.evaluate(() => window.results[2]), ["A", true]);

  await page.getByRole("button", { name: "Ask A", exact: true }).click();
  await page.evaluate(() => window.removeA());
  await expect(dialog).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.results.length)).toBe(4);
  assert.deepEqual(await page.evaluate(() => window.results[3]), ["A", false]);
  assert.deepEqual(errors, []);
  console.log("Villages confirmations: cancel, focus, caller lifetime, semantic subject and root isolation passed.");
} finally {
  await browser.close();
}
