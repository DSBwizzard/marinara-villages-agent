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
      import {VillagesRuntimeDebug} from './packages/villages/src/client/features/settings/RuntimeDebug.js';
      createRoot(document.getElementById('root')).render(<VillagesRuntimeDebug/>);`,
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
      assert(
        calls.every(([, path]) => /\/debug\/(runtime|lore)$/.test(path)),
        "Inspection has no generation endpoint",
      );
      await page.close();
    });
});
