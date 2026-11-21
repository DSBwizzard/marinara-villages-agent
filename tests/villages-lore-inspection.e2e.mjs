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
return <VillageActivity value={{visible:true,worldScope:options.world,backgroundRevision:''}}><LoreActivity key={options.world} enabled={options.enabled} daylight={options.daylight}><main><RetainedView active={options.sceneActive}><div style={{padding:'16px',display:'grid',gap:'8px',justifyItems:'start'}}><div data-location>The Mill<br/>Saturday · 12:00</div><LoreActivitySlot/></div></RetainedView><p>Scene content stays in place.</p></main></LoreActivity></VillageActivity>}
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
const first = "00000000-0000-4000-8000-000000000001";
const second = "00000000-0000-4000-8000-000000000002";
const entry = (id, inspectionId = first, target = "GM") => ({
  id,
  name: id === "garden" ? "The winter garden" : "Market customs",
  bookId: "world",
  bookName: "World lore",
  targets: [target],
  inspections: [{ target, id: inspectionId }],
});
const records = [
  {
    id: "scene",
    purpose: "Scene · The Mill",
    at: "2026-11-21T12:00:00Z",
    revision: 2,
    entries: [entry("garden"), entry("market")],
  },
  {
    id: "map",
    purpose: "Map artwork",
    at: "2026-11-21T11:59:00Z",
    revision: 1,
    entries: [entry("garden", second, "Image")],
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
        current = records,
        pendingDetail,
        holdDetail = false;
      const calls = [];
      await page.route("http://lore-chip.test/", (route) =>
        fulfill(route, {
          status: 200,
          contentType: "text/html",
          body: '<style>html,body{margin:0;height:100%;font-family:Georgia}#root{height:100vh}main{height:100%;background:#b7d5e2}</style><div id="root"></div>',
        }),
      );
      await page.route("**/api/villages/**", async (route) => {
        const body =
          route.request().method() === "GET"
            ? { action: new URL(route.request().url()).searchParams.get("activity") }
            : route.request().postDataJSON();
        calls.push(body);
        assert(
          new URL(route.request().url()).pathname.endsWith("/debug/lore"),
          "the reader never generates or retries a request",
        );
        if (body.action === "summary") return fulfill(route, { status: 200, json: { scope, revision, records: [] } });
        if (body.action === "activity")
          return fulfill(route, { status: 200, json: { scope, revision, records: current } });
        assert.equal(body.action, "entry");
        assert.equal(body.scope, scope);
        assert(body.inspectionId && body.bookId && body.entryId && body.target);
        if (holdDetail) {
          pendingDetail = route;
          return;
        }
        return fulfill(route, {
          status: 200,
          json: {
            text:
              body.entryId === "market"
                ? null
                : "Captured garden lore.\n<img src=x onerror=alert(1)>\n" + "The beds are quiet in winter. ".repeat(80),
          },
        });
      });
      await page.goto("http://lore-chip.test/");
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      await expect.poll(() => calls.some((call) => call.action === "summary")).toBe(true);
      await expect(page.getByRole("button", { name: /Lorebooks ·/u })).toHaveCount(0);
      assert(!calls.some((call) => call.action === "activity" || call.action === "entry"));
      const notify = () => page.evaluate(() => window.dispatchEvent(new Event("focus")));
      revision = 2;
      await notify();
      const chip = page.getByRole("button", { name: "Lorebooks · 2 requests", exact: true });
      await expect(chip).toBeVisible();
      await page.evaluate(() => window.showLore({ sceneActive: false }));
      await expect(page.locator(".villages-lore-global").getByRole("button")).toBeVisible();
      await page.evaluate(() => window.showLore({ sceneActive: true }));
      await expect(page.locator(".villages-lore-chip-slot").getByRole("button")).toBeVisible();
      assert(!calls.some((call) => call.action === "entry"), "entry bodies are read only on selection");
      const locationBox = await page.locator("[data-location]").boundingBox(),
        chipBox = await chip.boundingBox();
      assert(chipBox.y >= locationBox.y + locationBox.height && Math.abs(chipBox.x - locationBox.x) < 1);
      const dayColor = await chip.evaluate((node) => getComputedStyle(node).backgroundColor);
      await page.evaluate(() => window.showLore({ daylight: false }));
      await expect.poll(() => chip.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe(dayColor);
      await page.evaluate(() => window.showLore({ daylight: true }));
      await chip.click();
      const dialog = page.getByRole("dialog", { name: "Lorebooks used", exact: true });
      await expect(dialog).toBeVisible();
      await expect(page.getByRole("button", { name: "The winter garden World lore", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "The winter garden World lore", exact: true }).click();
      await expect(dialog.getByRole("region", { name: "The winter garden", exact: true })).toContainText(
        "Captured garden lore.",
      );
      assert.equal(await dialog.locator("img").count(), 0, "entry HTML is displayed as text");
      const close = dialog.getByRole("button", { name: "Close Lorebooks used", exact: true });
      await dialog.locator(".villages-lore-body").evaluate((node) => {
        node.scrollTop = node.scrollHeight;
      });
      assert(
        await close.evaluate((node) => {
          const r = node.getBoundingClientRect();
          return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest("button") === node;
        }),
      );
      await page.screenshot({ path: `artifacts/lorebook-chip-${width}.png` });
      await close.click();
      await expect(chip).toBeFocused();
      await chip.click();
      await page.getByRole("button", { name: "Market customs World lore", exact: true }).click();
      await expect(dialog).toContainText("This older request has no saved entry text.");
      await dialog.getByRole("combobox", { name: "Lorebook request" }).selectOption("map");
      await page.getByRole("button", { name: "The winter garden World lore", exact: true }).click();
      await expect.poll(() => calls.filter((call) => call.action === "entry").at(-1)?.target).toBe("Image");
      await dialog.getByRole("button", { name: "Dismiss", exact: true }).click();
      await expect(chip).toHaveCount(0);
      assert.equal(await page.evaluate(() => localStorage.getItem("villages:lore-dismissed:a")), "2");
      current = [{ ...records[0], id: "new", revision: 3 }, ...records];
      revision = 3;
      await notify();
      const fresh = page.getByRole("button", { name: "Lorebooks · 1 request", exact: true });
      await expect(fresh).toBeVisible();
      await fresh.click();
      holdDetail = true;
      await page.getByRole("button", { name: "The winter garden World lore", exact: true }).click();
      await expect.poll(() => !!pendingDetail).toBe(true);
      await page.evaluate(() => window.showLore({ enabled: false }));
      await expect(dialog).toHaveCount(0);
      await expect(fresh).toHaveCount(0);
      const count = calls.length;
      await notify();
      await page.waitForTimeout(100);
      assert.equal(calls.length, count, "disabled chips do not poll or inspect lore");
      await fulfill(pendingDetail, { status: 200, json: { text: "Late private reply" } });
      await expect(page.getByText("Late private reply", { exact: true })).toHaveCount(0);
      holdDetail = false;
      scope = "b";
      revision = 0;
      current = [];
      await page.evaluate(() => window.showLore({ enabled: true, world: "b" }));
      await expect(page.getByRole("button", { name: /Lorebooks ·/u })).toHaveCount(0);
      revision = 1;
      current = [{ ...records[0], id: "world-b", revision: 1 }];
      await notify();
      await expect(page.getByRole("button", { name: "Lorebooks · 1 request", exact: true })).toBeVisible();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.close();
    });
});
