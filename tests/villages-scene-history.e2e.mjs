import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";

const built = await build({
  stdin: {
    contents: `
import {createRoot} from 'react-dom/client';
import {StrictMode,useState} from 'react';
import {SceneHistory} from './packages/villages/src/client/features/scenes/SceneHistory.js';
const noop=()=>undefined;
window.pending=[];
// Deliberately ignore abort: the response guard must also reject late transports.
window.fetch=(url,options)=>new Promise(resolve=>window.pending.push({url,signal:options.signal,
  finish:(value,status=200)=>resolve(new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}}))}));
function Harness(){
  const [sceneId,setScene]=useState('A'),[scope,setScope]=useState('a'.repeat(64)),[shown,setShown]=useState(true);
  window.historyHarness={setScene,setScope,setShown};
  return shown?<SceneHistory sceneId={sceneId} scope={scope} playerName='Player' nameStyle={noop} speechStyle={noop}/>:null;
}
const root=createRoot(document.getElementById('root'));
root.render(window.strict?<StrictMode><Harness/></StrictMode>:<Harness/>);
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
try {
  for (const strict of [false, true]) {
    const page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
    await page.evaluate((value) => (window.strict = value), strict);
    await page.addScriptTag({ content: built.outputFiles[0].text });
    const rows = page.locator("p.marinara-capability-villages-chat-vn-text");
    const older = page.getByRole("button", { name: "Older", exact: true });
    const newer = page.getByRole("button", { name: "Newer", exact: true });
    const version = "1".repeat(64);
    const payload = (start, extra = {}) => ({
      scope: "a".repeat(64),
      sceneId: "A",
      version,
      lines: Array.from({ length: 40 }, (_, index) => ({
        id: "line-" + (start + index),
        role: "assistant",
        speakerId: "__venue_scene__",
        kind: "narration",
        content: "Exact paragraph " + (start + index),
      })),
      ...extra,
    });
    let delivered = 0;
    const pending = async () => {
      await expect.poll(() => page.evaluate(() => window.pending.length)).toBeGreaterThan(delivered);
      const index = await page.evaluate(() => window.pending.length - 1);
      delivered = index + 1;
      return index;
    };
    const finish = (index, value, status = 200) =>
      page.evaluate(({ index, value, status }) => window.pending[index].finish(value, status), {
        index,
        value,
        status,
      });
    const first = await pending();
    await finish(first, payload(80, { olderCursor: "older-80" }));
    await expect(rows).toHaveCount(40);
    await expect(rows.first()).toContainText("Exact paragraph 80");
    await expect(newer).toBeDisabled();
    await older.click();
    const second = await pending();
    assert.match(await page.evaluate((i) => window.pending[i].url, second), /cursor=older-80/);
    await finish(second, payload(40, { olderCursor: "older-40", newerCursor: "newer-80" }));
    await expect(rows).toHaveCount(40);
    await expect(rows.first()).toContainText("Exact paragraph 40");
    await expect(page.getByText("Exact paragraph 119", { exact: true })).toHaveCount(0);
    await newer.click();
    await finish(await pending(), payload(80, { olderCursor: "older-80" }));
    await expect(rows.first()).toContainText("Exact paragraph 80");
    await page.getByRole("button", { name: "Refresh", exact: true }).click();
    await finish(await pending(), payload(81, { version: "2".repeat(64), olderCursor: "older-81" }));
    await expect(rows.last()).toContainText("Exact paragraph 120");

    await older.click();
    await finish(await pending(), payload(0, { version: "3".repeat(64) }));
    await expect(page.getByRole("alert")).toContainText("Scene history changed");
    await expect(rows.first()).toContainText("Exact paragraph 81");
    await page.getByRole("button", { name: "Refresh", exact: true }).click();
    await finish(await pending(), { error: "History temporarily unavailable" }, 503);
    await expect(page.getByRole("alert")).toContainText("History temporarily unavailable");
    await page.getByRole("button", { name: "Refresh", exact: true }).click();
    await finish(await pending(), payload(120, { version: "2".repeat(64), olderCursor: "older-120" }));
    await expect(rows.first()).toContainText("Exact paragraph 120");
    await expect(page.getByRole("alert")).toHaveCount(0);

    await older.click();
    const staleScene = await pending();
    await page.evaluate(() => window.historyHarness.setScene("B"));
    const freshScene = await pending();
    assert(await page.evaluate((i) => window.pending[i].signal.aborted, staleScene));
    await expect(rows).toHaveCount(0);
    await finish(freshScene, payload(200, { sceneId: "B" }));
    await expect(rows.first()).toContainText("Exact paragraph 200");
    await finish(staleScene, payload(0));
    await expect(rows.first()).toContainText("Exact paragraph 200");

    await page.evaluate(() => window.historyHarness.setScope("b".repeat(64)));
    const staleScope = await pending();
    await expect(rows).toHaveCount(0);
    await page.evaluate(() => window.historyHarness.setScope("c".repeat(64)));
    const freshScope = await pending();
    await finish(freshScope, payload(300, { sceneId: "B", scope: "c".repeat(64), olderCursor: "older-300" }));
    await finish(staleScope, payload(0, { sceneId: "B", scope: "b".repeat(64) }));
    await expect(rows.first()).toContainText("Exact paragraph 300");
    assert(await page.evaluate((i) => window.pending[i].signal.aborted, staleScope));

    await older.click();
    const unmounted = await pending();
    await page.evaluate(() => window.historyHarness.setShown(false));
    await expect(rows).toHaveCount(0);
    assert(await page.evaluate((i) => window.pending[i].signal.aborted, unmounted));
    await finish(unmounted, payload(0, { sceneId: "B", scope: "c".repeat(64) }));
    await expect(rows).toHaveCount(0);
    await page.close();
    console.log(
      `Scene History: bounded pages, refresh, stale Scene/world/aborted responses and unmount; StrictMode=${strict}.`,
    );
  }
} finally {
  await browser.close();
}
