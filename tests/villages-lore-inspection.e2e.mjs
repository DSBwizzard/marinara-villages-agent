// Test cases: lore/inspection
import assert from "node:assert/strict";
import { chromium, fulfill, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { expect } from "./fixtures/fast-browser-expect.mjs";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { mkdir } from "node:fs/promises";

const bundle = await build({
  stdin: {
    contents: `import {createRoot} from 'react-dom/client';import {useState} from 'react';
import {LoreActivity,LoreActivitySlot} from './packages/villages/src/client/shared/LoreActivity.js';
import {VillageActivity} from './packages/villages/src/client/shared/activity.js';
import {RetainedView} from './packages/villages/src/client/shared/RetainedView.js';
import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';
const tag=document.createElement('marinara-capability-villages');tag.style.display='none';document.body.appendChild(tag);syncVillagesStyles();
function Harness(){const [options,setOptions]=useState({enabled:true,daylight:true,world:'a',sceneActive:true});window.showLore=next=>setOptions(prior=>({...prior,...next}));
return <VillageActivity value={{visible:true,worldScope:options.world,backgroundRevision:''}}><LoreActivity key={options.world} enabled={options.enabled} daylight={options.daylight}><main className="marinara-capability-villages-room-screen" style={{display:"block"}}><RetainedView active={options.sceneActive}><div style={{padding:'16px',display:'grid',gap:'8px',justifyItems:'start',alignContent:'start',width:'100%',boxSizing:'border-box'}}><div data-location>The Mill<br/>Saturday · 12:00</div><div data-lane className="marinara-capability-villages-scene-notice-chips" style={{position:"relative",width:"100%"}}><span style={{width:80,flexShrink:0}}>Other chip</span><LoreActivitySlot entries={options.replyEntries}/></div></div></RetainedView><p>Scene content stays in place.</p></main></LoreActivity></VillageActivity>}
createRoot(document.getElementById('root')).render(<Harness/>);`,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const entry = (id, name = id) => ({ id, name, bookId: "world", bookName: "World lore", targets: ["GM"] });
const records = [
  {
    id: "scene",
    purpose: "Scene · The Mill",
    at: "2026-11-21T12:00:00Z",
    revision: 2,
    entries: [entry("garden", "The winter garden"), entry("market", "Market customs")],
  },
  {
    id: "map",
    purpose: "Old map artwork",
    at: "2026-11-21T11:59:00Z",
    revision: 1,
    entries: [entry("old", "Old map entry")],
  },
];
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const width of [1440, 390])
    await runCase(`lore/inspection/${width}`, async () => {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      let scope = "a",
        revision = 0,
        current = records;
      const calls = [];
      await page.route("http://lore-chip.test/", (route) =>
        fulfill(route, {
          status: 200,
          contentType: "text/html",
          body: '<style>html,body{margin:0;height:100%;font-family:Georgia}#root{height:100vh}main{height:100%;background:#b7d5e2}</style><div id="root"></div>',
        }),
      );
      await page.route("**/api/villages/**", (route) => {
        const body =
          route.request().method() === "GET"
            ? { action: new URL(route.request().url()).searchParams.get("activity") }
            : route.request().postDataJSON();
        calls.push(body);
        assert(new URL(route.request().url()).pathname.endsWith("/debug/lore"), "reading never generates a reply");
        assert(["summary", "activity"].includes(body.action), "names-only popouts never fetch entry bodies");
        return fulfill(route, {
          status: 200,
          json: { scope, revision, records: body.action === "summary" ? [] : current },
        });
      });
      await page.goto("http://lore-chip.test/");
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      await expect.poll(() => calls.some((call) => call.action === "summary")).toBe(true);
      await expect(page.getByRole("button", { name: /Lorebooks ·/u })).toHaveCount(0);
      const notify = () => page.evaluate(() => window.dispatchEvent(new Event("focus")));
      revision = 2;
      await notify();
      const chip = page.getByRole("button", { name: "Lorebooks · 2 entries", exact: true });
      const popout = page.getByRole("region", { name: "Lorebooks used", exact: true });
      await expect(chip).toBeVisible();
      const locationBox = await page.locator("[data-location]").boundingBox(),
        chipBox = await chip.boundingBox();
      assert(
        chipBox.y >= locationBox.y + locationBox.height &&
          Math.abs((await page.locator("[data-lane]").boundingBox()).x - locationBox.x) < 1,
      );
      await chip.click();
      await expect(popout).toBeVisible();
      assert.deepEqual(await popout.locator("li").allTextContents(), ["The winter garden", "Market customs"]);
      assert.equal(await popout.locator("select, nav, small").count(), 0);
      assert.equal(await page.getByRole("dialog").count(), 0);
      await expect(popout).not.toContainText("Old map entry");
      await expect(popout).not.toContainText("World lore");
      let bounds = await popout.boundingBox();
      assert(bounds.width <= 322 && bounds.height < 180 && bounds.x >= 0 && bounds.x + bounds.width <= width);
      assert(Math.abs(bounds.x - locationBox.x) < 1, "other chips cannot push the popout past the notice lane");
      const dayColor = await popout.evaluate((node) => getComputedStyle(node).backgroundColor);
      await page.screenshot({ path: `artifacts/lorebook-chip-day-${width}.png` });
      await page.evaluate(() => window.showLore({ daylight: false }));
      await expect.poll(() => popout.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe(dayColor);
      await page.screenshot({ path: `artifacts/lorebook-chip-night-${width}.png` });
      await page.getByRole("button", { name: "Close Lorebooks used", exact: true }).click();
      await expect(popout).toHaveCount(0);
      await expect(chip).toBeFocused();
      await chip.click();
      await chip.click();
      await expect(popout).toHaveCount(0);
      await chip.click();
      await page.keyboard.press("Escape");
      await expect(popout).toHaveCount(0);
      await expect(chip).toBeFocused();
      await chip.click();
      await page.mouse.click(width - 20, 400);
      await expect(popout).toHaveCount(0);

      // Exact reply metadata takes precedence over newer unrelated background requests.
      const reply = [entry("reply", "Reply lore <img src=x onerror=alert(1)>")];
      await page.evaluate((replyEntries) => window.showLore({ replyEntries }), reply);
      const replyChip = page.getByRole("button", { name: "Lorebooks · 1 entry", exact: true });
      await expect(replyChip).toBeVisible();
      await replyChip.click();
      await expect(popout).toContainText(reply[0].name);
      assert.equal(await popout.locator("img").count(), 0);
      await page.evaluate(
        (replyEntries) => window.showLore({ replyEntries }),
        Array.from({ length: 24 }, (_, i) => entry(`long-${i}`, `Included entry ${i + 1}`)),
      );
      await page.getByRole("button", { name: "Lorebooks · 24 entries", exact: true }).click();
      bounds = await popout.boundingBox();
      assert(bounds.height <= 844 * 0.35 + 1, "long lists retain the other notice chips' height limit");
      await popout.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
      });
      assert(
        await popout.getByRole("button", { name: "Close Lorebooks used" }).evaluate((node) => {
          const box = node.getBoundingClientRect();
          return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest("button") === node;
        }),
        "Close stays reachable in a long list",
      );
      await page.evaluate((replyEntries) => window.showLore({ replyEntries }), reply);
      await replyChip.click();
      current = [{ ...records[1], id: "unrelated", revision: 3 }, ...records];
      revision = 3;
      const before = calls.length;
      await notify();
      await page.waitForTimeout(100);
      assert.equal(calls.length, before, "Scene reply provenance requires no activity-history reads");
      await expect(popout).not.toContainText("Old map entry");
      await page.evaluate(() => window.showLore({ replyEntries: [] }));
      await expect(replyChip).toHaveCount(0);
      await expect(popout).toHaveCount(0);
      await expect(page.getByRole("button", { name: /Lorebooks ·/u })).toHaveCount(0);
      await page.evaluate((replyEntries) => window.showLore({ replyEntries }), reply);
      await replyChip.click();
      await page.evaluate(() => window.showLore({ enabled: false }));
      await expect(popout).toHaveCount(0);
      await expect(replyChip).toHaveCount(0);
      const disabled = calls.length;
      await notify();
      await page.waitForTimeout(100);
      assert.equal(calls.length, disabled, "disabled chips do not read lore");

      scope = "b";
      revision = 0;
      current = [];
      await page.evaluate(() => window.showLore({ enabled: true, world: "b", replyEntries: [] }));
      await expect(page.getByRole("button", { name: /Lorebooks ·/u })).toHaveCount(0);
      await page.evaluate(() => window.showLore({ sceneActive: false }));
      await expect.poll(() => calls.length > disabled).toBe(true);
      revision = 1;
      current = [{ ...records[0], id: "world-b", revision: 1 }];
      await notify();
      await expect(page.locator(".villages-lore-global").getByRole("button")).toBeVisible();
      await page.locator(".villages-lore-global").getByRole("button").click();
      bounds = await popout.boundingBox();
      assert(bounds.x >= 0 && bounds.x + bounds.width <= width && bounds.y >= 0);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.close();
    });
});
