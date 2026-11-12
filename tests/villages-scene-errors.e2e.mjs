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
window.detailReads=0; window.clipboardCalls=0;
window.ClipboardItem=class { constructor(data){this.data=data;} };
Object.defineProperty(navigator,'clipboard',{configurable:true,value:{write(items){
  window.clipboardCalls++; window.copyHadGesture=navigator.userActivation.isActive;
  if(window.failCopy) return Promise.reject(Error('Clipboard refused'));
  return items[0].data['text/plain'].then(blob=>blob.text()).then(text=>{window.copied=text;});
}}});
function App(){
  const [open,setOpen]=useState(false), [tick,setTick]=useState(0);
  window.rerenderErrors=()=>setTick(tick+1);
  return <><style>{VILLAGES_SCENE_STYLES}</style><div style={{position:'relative',margin:16}}>
    <SceneErrorChip open={open} onOpen={setOpen} loadDetails={()=>{
      window.detailReads++; return new Promise(resolve=>window.finishDetails=()=>resolve({errors:[
        {id:'reply-failure',details:JSON.stringify({failure:{cause:'invalid_json',stage:'scene-response',detail:'The Scene response was not complete JSON.'}})}
      ]}));
    }} items={[
      {id:'parse',title:'Reply',message:'The Scene response was not complete JSON.',diagnosticId:'reply-failure'},
      {id:'hearing',title:'Memory evidence',message:'The AI based a memory on words the resident didn’t hear.'},
      {id:'network',title:'AI connection',message:'The game couldn’t reach the AI service.'},
      {id:'length',title:'Response length',message:'The response was truncated.'},
    ].map(item=>({...item,fields:[{label:'Scene ID',value:'private-scene-id'},{label:'Scene',value:'Breakwater Bungalow'}]}))}/>
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
    const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 900 : 844 } });
    await page.setContent(
      `<style>:root{--popover:#191919;--foreground:#f4f4f4;--border:#555;--secondary:#242037;--primary:#ed6689;--villages-scene-visible-height:844px}body{margin:0;background:#485450;font:16px Arial}.marinara-capability-villages-visually-hidden{position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}</style><div id="root"></div>`,
    );
    await page.addScriptTag({ content: built.outputFiles[0].text });
    await page.getByRole("button", { name: "4 Scene errors", exact: true }).click();
    const panel = page.getByRole("region", { name: "Scene errors", exact: true });
    for (const message of [
      "The AI returned a reply the game couldn’t read.",
      "The AI based a memory on words the resident didn’t hear.",
      "The game couldn’t reach the AI service.",
      "The AI stopped before it finished the reply.",
    ])
      await expect(panel.getByText(message, { exact: true })).toBeVisible();
    await expect(panel).not.toContainText(/private-scene-id|retry required|transcript|complete JSON/);
    assert.equal(await page.evaluate(() => window.detailReads), 0, "opening errors never loads owner diagnostics");
    const box = await panel.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= width, "error text stays within the phone viewport");
    await page.screenshot({ path: `.build-tmp/scene-errors/errors-${width}.png` });
    await panel.getByRole("button", { name: "Copy details", exact: true }).click();
    await expect(panel.getByRole("button", { name: "Copying…", exact: true })).toBeDisabled();
    await page.evaluate(() => window.rerenderErrors());
    await expect(panel.getByRole("button", { name: "Copying…", exact: true })).toBeDisabled();
    assert.equal(await page.evaluate(() => window.clipboardCalls), 1);
    assert.equal(
      await page.evaluate(() => window.copyHadGesture),
      true,
      "the clipboard write starts inside the user gesture",
    );
    await page.evaluate(() => window.finishDetails());
    await expect(panel.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
    const copied = await page.evaluate(() => window.copied);
    assert.match(copied, /Original error: The Scene response was not complete JSON/);
    assert.match(copied, /"cause":"invalid_json"/);
    assert.match(copied, /private-scene-id/);
    assert.equal(copied.match(/Scene ID:/g)?.length, 1);
    assert.ok(copied.length < 2500);
    await page.evaluate(() => {
      window.failCopy = true;
    });
    await panel.getByRole("button", { name: "Copied", exact: true }).click();
    await expect(panel.getByRole("status")).toHaveText("The browser couldn’t copy the details.");
    await page.evaluate(() => window.finishDetails());
    await page.close();
  }
});
console.log(
  "Scene errors passed: four direct messages on desktop/phone, scoped diagnostic copy, user-gesture clipboard and failure feedback.",
);
