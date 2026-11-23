import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, expect, fulfill, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { createVenueScreenHarness } from "./fixtures/villages-venue-screen-lifetime.fixture.mjs";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const styles = await build({
  stdin: {
    contents: "import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';import {DESK_STYLES} from './packages/villages/src/client/shared/desk-styles.js';syncVillagesStyles();const style=document.createElement('style');style.textContent=DESK_STYLES;document.head.append(style);",
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
});
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  const mount = await createVenueScreenHarness(browser);
  for (const width of [1366, 390]) {
    const f = await mount(false, width, { page: "edit", cleanName: true });
    const page = f.page;
    await page.evaluate(() => {
      const host=document.createElement("marinara-capability-villages");
      host.className="marinara-capability-villages-desk-container";
      document.body.append(host);host.append(document.getElementById("root"));
    });
    await page.addStyleTag({
      content:
        "#state{display:none}:root{font-size:18px;--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}body{margin:0}",
    });
    await page.addScriptTag({ content: styles.outputFiles[0].text });
    await page.getByRole("button", { name: "Manage", exact: true }).click();
    const panel = page.getByRole("region", { name: "Work arrangements" });
    const worker = f.seed.villagers[0];
    await panel.getByLabel("Propose work for", { exact: true }).selectOption(worker.characterId);
    await panel.getByLabel("Work activity", { exact: true }).fill("Serving coffee");
    await panel.getByLabel("Ends", { exact: true }).fill("15:00");
    await panel.getByRole("button", { name: "Propose work", exact: true }).click();
    await expect.poll(() => f.requests.length).toBe(1);
    const command = f.requests[0].body;
    assert.equal(command.action, "work-propose");
    assert.equal(command.zoneId, null);
    assert.equal(command.terms.endMinute, 900);
    assert.equal(command.terms.characterId, worker.characterId);
    assert.equal(Object.hasOwn(command, "actorId"), false);
    const snapshot = structuredClone(f.seed),
      place = snapshot.settings.venues[0];
    place.accessView = {
      ...place.accessView,
      revision: place.accessView.revision + 1,
      work: [],
      workOffers: [
        {
          id: command.operationId,
          proposerId: "player",
          characterId: worker.characterId,
          terms: command.terms,
          requiredIds: ["player", worker.characterId],
          approvedIds: ["player"],
        },
      ],
    };
    await fulfill(f.requests[0].route, {
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(snapshot),
    });
    await expect(panel.getByText(/Pending/)).toBeVisible();
    await expect(panel.getByText(/Work access:/)).toBeVisible();
    await expect(panel.getByRole("button", { name: "Agree to these terms", exact: true })).toHaveCount(0);
    if (process.env.VILLAGES_SCREENSHOT_DIR) {
      await mkdir(process.env.VILLAGES_SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({ path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `work-proposal-${width}.png`) });
    }
    const overflow=await page.evaluate(()=>[...document.querySelectorAll("body *")].filter((node)=>node.getBoundingClientRect().right>innerWidth+1).slice(-6).map((node)=>({tag:node.tagName,class:node.className,width:node.getBoundingClientRect().width,right:node.getBoundingClientRect().right})));
    assert.equal(overflow.length,0,"Work controls fit desktop and phone: "+JSON.stringify(overflow));
    await panel.getByRole("button", { name: "Withdraw", exact: true }).click();
    await expect.poll(() => f.requests.length).toBe(2);
    assert.equal(f.requests[1].body.action, "work-decide");
    assert.equal(f.requests[1].body.accept, false);
    await f.reply(1);
    await f.finish();
  }
});
