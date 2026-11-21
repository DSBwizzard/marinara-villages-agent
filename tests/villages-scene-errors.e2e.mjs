import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { build } from "../scripts/esbuild.mjs";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";

const built = await build({
  stdin: {
    resolveDir: process.cwd(),
    loader: "tsx",
    contents: `
import {createRoot} from 'react-dom/client';
import {useState} from 'react';
import {SceneErrorChip} from './packages/villages/src/client/features/scenes/scene-errors.js';
import {VILLAGES_SCENE_STYLES} from './packages/villages/src/client/features/scenes/villages-scene-styles.js';
Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText(text){
  window.copyHadGesture=navigator.userActivation.isActive;
  if(window.failCopy) return Promise.reject(Error('Clipboard refused'));
  window.report=text;
  return Promise.resolve();
}}});
function App(){
  const [open,setOpen]=useState(false);
  return <><style>{VILLAGES_SCENE_STYLES}</style><div style={{position:'relative',margin:16}}>
    <SceneErrorChip open={open} onOpen={setOpen} context={{sceneStatus:'active',revision:4,mobile:true,draftRetained:true}} items={[
      {id:'private-scene-id',title:'Breakwater Bungalow',message:'A line can be at most 4000 characters.',
        trace:{action:'send',request:'POST /api/villages/rooms/turn',status:400,code:'SCENE_MESSAGE_TOO_LONG',elapsedMs:8}},
      {id:'private-request',title:'Private name',message:'The Scene response was not complete JSON. Hide raw response.',
        operation:{kind:'move',status:'interrupted',stage:'writing-completion:private-hash',failureCause:'invalid_json'}},
    ]}/>
  </div></>;
}
createRoot(document.getElementById('root')).render(<App/>);
`,
  },
  write: false,
  bundle: true,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  await mkdir(".build-tmp/scene-errors", { recursive: true });
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.setContent(
      `<style>:root{--popover:#191919;--foreground:#f4f4f4;--border:#555;--secondary:#242037;--primary:#ed6689;--villages-scene-visible-height:844px}body{margin:0;background:#485450;font:16px Arial}.marinara-capability-villages-visually-hidden{position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}</style><div id="root"></div>`,
    );
    await page.addScriptTag({ content: built.outputFiles[0].text });
    await page.getByRole("button", { name: "2 Scene errors", exact: true }).click();
    const panel = page.getByRole("region", { name: "Scene errors", exact: true });
    await expect(panel.getByText("A line can be at most 4000 characters.", { exact: true })).toBeVisible();
    await expect(panel.getByText("The AI returned a reply the game couldn’t read.", { exact: true })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Copy private details", exact: true })).toHaveCount(0);
    const box = await panel.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= width);
    await page.screenshot({ path: `.build-tmp/scene-errors/errors-${width}.png` });
    const copy = panel.getByRole("button", { name: "Copy Discord report", exact: true });
    await copy.click();
    await expect(panel.getByText("Anonymous report copied.")).toBeVisible();
    const report = await page.evaluate(() => window.report);
    assert.equal(await page.evaluate(() => window.copyHadGesture), true);
    assert.match(report, /HTTP 400 · SCENE_MESSAGE_TOO_LONG · 8 ms/);
    assert.match(report, /Stage: input validation, before model dispatch/);
    assert.match(report, /Move between Zones\nCause: invalid_json/);
    assert.doesNotMatch(report, /private-|Breakwater Bungalow|Private name|Hide raw response|What I was trying/i);
    await page.evaluate(() => {
      window.failCopy = true;
    });
    await copy.click();
    await expect(panel.getByRole("textbox", { name: "Anonymous Discord report" })).toHaveValue(report);
    await page.close();
  }
});
console.log("Discord traces, clipboard gesture, privacy and fallback passed at desktop and phone widths.");
