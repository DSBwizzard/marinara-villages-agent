// Test cases: lore/inspection
import assert from "node:assert/strict";
import { chromium, fulfill, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { expect } from "./fixtures/fast-browser-expect.mjs";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const bundle = await build({
  stdin: {
    contents: `import {createRoot} from 'react-dom/client';
      import {flushSync} from 'react-dom';
      import {VillagesRuntimeDebug} from './packages/villages/src/client/features/settings/RuntimeDebug.js';
      import {LoreChip,FoundingLore} from './packages/villages/src/client/shared/LoreChip.js';
      import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';
      const first='00000000-0000-4000-8000-000000000001',second='00000000-0000-4000-8000-000000000002';
      const entries=[{id:'guild',bookId:'world',bookName:'Village customs',name:'Silver Guild',targets:['Narration','System'],inspections:[{target:'Narration',id:first},{target:'System',id:second}]},{id:'calendar',bookId:'world',bookName:'Village customs',name:'Calendar',targets:['Narration']}];
      const map=[{id:'texts',bookId:'gidget',bookName:'Gidget’s Lorebook',name:'Interpreting Gidget’s Texts',targets:['Image'],inspections:[{target:'Image',id:first}]}];
      const tag=document.createElement('marinara-capability-villages');document.body.appendChild(tag);syncVillagesStyles();
      const root=createRoot(document.getElementById('root'));
      const render=()=>root.render(<><VillagesRuntimeDebug/><section aria-label='Scene sources'><LoreChip entries={entries} label='Latest exchange'/></section><section aria-label='Map sources'><LoreChip entries={map} label='Map artwork'/></section><FoundingLore records={[{label:'Elias · Personal routine',entries}]}/></>);
      window.setLoreInspection=(id)=>{map[0]={...map[0],inspections:[{target:'Image',id}]};flushSync(render);};render();`,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const report = {
  purpose: "Scene Narration",
  stage: "prompt",
  budget: 1600,
  omittedDiagnostics: 0,
  entries: [
    { id: "guild", bookId: "world", name: "Silver Guild", match: "recent", status: "included" },
    { id: "calendar", bookId: "world", name: "Calendar", match: "constant", status: "context-limit" },
  ],
};
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const width of [1366, 390])
    await runCase(`lore/inspection/${width}`, async () => {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      let verbose = false,
        holdRefresh = false,
        expired = false,
        pendingTrigger,
        pendingRefresh;
      const calls = [];
      await page.route("http://lore-inspection.test/", (route) =>
        fulfill(route, { status: 200, contentType: "text/html", body: '<div id="root"></div>' }),
      );
      await page.route("**/api/villages/**", async (route) => {
        const request = route.request(),
          path = new URL(request.url()).pathname;
        calls.push([request.method(), path]);
        if (path.endsWith("/debug/runtime")) {
          if (request.method() === "PATCH") verbose = request.postDataJSON().verbose;
          return fulfill(route, { status: 200, json: { verbose, effective: verbose, engineEnabled: false } });
        }
        if (path.endsWith("/debug/lore")) {
          const body = request.method() === "POST" ? request.postDataJSON() : null;
          if (body?.inspectionId) {
            assert.equal(verbose, false, "Targeted notice inspection needs no verbose logging");
            if (body.inspectionId.endsWith("3")) {
              pendingTrigger = route;
              return;
            }
            const trigger = expired
              ? null
              : body.entryId === "texts"
                ? {
                    constant: false,
                    match: "setting",
                    key: "text",
                    caseSensitive: false,
                    matchWholeWords: false,
                    secondary: { logic: "not_all", matched: 1, total: 2 },
                  }
                : {
                    constant: body.inspectionId.endsWith("2"),
                    match: "recent",
                    key: "guild",
                    caseSensitive: true,
                    matchWholeWords: true,
                  };
            return fulfill(route, { status: 200, json: { trigger } });
          }
          assert(verbose, "The client only inspects after the explicit creator switch");
          if (request.method() === "POST") {
            assert.equal(request.postDataJSON().query, "What about the guild?");
            return fulfill(route, {
              status: 200,
              json: { report: { ...report, purpose: "Key test", stage: "selection" } },
            });
          }
          if (holdRefresh) {
            pendingRefresh = route;
            return;
          }
          return fulfill(route, { status: 200, json: { reports: [report] } });
        }
        throw Error("Unexpected lore inspection request: " + path);
      });
      await page.goto("http://lore-inspection.test/");
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      const toggle = page.getByRole("checkbox", { name: "Verbose runtime logging" });
      await expect(toggle).toBeEnabled();
      await expect(page.getByRole("region", { name: "Lorebook inspection" })).toHaveCount(0);
      assert.equal(calls.length, 1);
      await toggle.check();
      const panel = page.getByRole("region", { name: "Lorebook inspection" });
      await expect(panel).toBeVisible();
      await panel.getByLabel("Test keys").fill("What about the guild?");
      await panel.getByRole("button", { name: "Test selection" }).click();
      await expect(panel).toContainText("Selection only");
      await panel.getByRole("button", { name: "Refresh lore reports" }).click();
      await expect(panel).toContainText("Final prompt");
      await expect(panel).toContainText("Silver Guild · Recent shared dialogue · Included");
      await expect(panel).toContainText("Calendar · Constant · Removed for prompt space");
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
      if (process.env.VILLAGES_SCREENSHOT_DIR) {
        await mkdir(process.env.VILLAGES_SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({
          path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `lore-inspection-${width}.png`),
          fullPage: true,
        });
      }
      holdRefresh = true;
      await panel.getByRole("button", { name: "Refresh lore reports" }).click();
      await expect.poll(() => !!pendingRefresh).toBe(true);
      await toggle.uncheck();
      await fulfill(pendingRefresh, { status: 200, json: { reports: [report] } });
      await expect(panel).toHaveCount(0);
      await toggle.check();
      await expect(panel).not.toContainText("Silver Guild");
      await toggle.uncheck();
      assert(
        calls.every(([, path]) => /\/debug\/(runtime|lore)$/.test(path)),
        "Inspection has no generation endpoint",
      );
      const chip = page
        .getByRole("region", { name: "Scene sources" })
        .getByRole("button", { name: "2 Lorebook entries · Latest exchange", exact: true });
      await chip.click();
      const details = page.getByRole("dialog", { name: "Lorebooks", exact: true });
      await expect(details).toBeVisible();
      await expect(details).toContainText("Village customs");
      await expect(details).toContainText("Narration");
      await expect(details).toContainText("System");
      await expect(details.locator("li")).toHaveCount(2);
      const beforeExpand = calls.length;
      await details.getByText("Silver Guild", { exact: true }).click();
      await expect(details.getByRole("region", { name: "Narration trigger" })).toContainText(
        "Key “guild” matched recent shared dialogue.",
      );
      await expect(details.getByRole("region", { name: "System trigger" })).toContainText(
        "Constant entry · no key required.",
      );
      assert.equal(calls.length, beforeExpand + 2, "Only the selected entry’s two target records are fetched");
      await details.getByText("Calendar", { exact: true }).click();
      await expect(details).toContainText("Trigger details were not recorded.");
      await page.keyboard.press("Escape");
      await page.getByRole("region", { name: "Map sources" }).getByRole("button").click();
      const mapDialog = page.getByRole("dialog", { name: "Lorebooks", exact: true });
      const mapNotice = mapDialog.locator("summary");
      await mapNotice.focus();
      await page.keyboard.press("Enter");
      await expect(mapDialog).toContainText("Key “text” matched the setting / generation context.");
      await expect(mapDialog).toContainText("Case-insensitive · Substring matching");
      await expect(mapDialog).toContainText("At least one secondary key must be absent · 1 of 2 matched.");
      assert(await mapDialog.evaluate((element) => element.scrollWidth <= element.clientWidth));
      if (process.env.VILLAGES_SCREENSHOT_DIR)
        await page.screenshot({
          path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `lore-trigger-${width}.png`),
          fullPage: true,
        });
      const beforeRerender = calls.length;
      await page.evaluate(() => window.setLoreInspection("00000000-0000-4000-8000-000000000001"));
      assert.equal(
        calls.length,
        beforeRerender,
        "An unchanged inspection survives ordinary parent renders without refetching",
      );
      await page.evaluate(() => window.setLoreInspection("00000000-0000-4000-8000-000000000003"));
      await expect.poll(() => !!pendingTrigger).toBe(true);
      await expect(mapDialog.getByRole("status")).toContainText("Loading trigger");
      await expect(mapDialog).not.toContainText("Key “text”");
      await fulfill(pendingTrigger, {
        status: 200,
        json: { trigger: { constant: true, match: "constant", caseSensitive: false, matchWholeWords: false } },
      });
      await expect(mapDialog).toContainText("Constant entry · no key required.");
      await page.keyboard.press("Escape");
      expired = true;
      await chip.click();
      await page.getByRole("dialog").getByText("Silver Guild", { exact: true }).click();
      await expect(page.getByRole("dialog")).toContainText("Trigger details expired or the runtime restarted.");
      await page.keyboard.press("Escape");
      await expect(details).toHaveCount(0);
      await expect(chip).toBeFocused();
      await page.getByText("Founding Lorebooks", { exact: true }).click();
      await page.getByRole("button", { name: "2 Lorebook entries · Elias · Personal routine", exact: true }).click();
      await expect(page.getByRole("dialog", { name: "Lorebooks", exact: true })).toContainText(
        "Elias · Personal routine",
      );
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
      if (process.env.VILLAGES_SCREENSHOT_DIR)
        await page.screenshot({
          path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `lore-chip-${width}.png`),
          fullPage: true,
        });
      await page.keyboard.press("Escape");
      assert(
        calls.every(([, path]) => /\/debug\/(runtime|lore)$/.test(path)),
        "Opening saved chips needs neither logging nor generation calls",
      );
      await page.close();
    });
});
