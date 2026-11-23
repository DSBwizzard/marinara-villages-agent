import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, expect, fulfill, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { createVenueScreenHarness } from "./fixtures/villages-venue-screen-lifetime.fixture.mjs";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const styles = await build({
  stdin: {
    contents:
      "import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';import {DESK_STYLES} from './packages/villages/src/client/shared/desk-styles.js';syncVillagesStyles();const style=document.createElement('style');style.textContent=DESK_STYLES;document.head.append(style);",
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
      const host = document.createElement("marinara-capability-villages");
      host.className = "marinara-capability-villages-desk-container";
      document.body.append(host);
      host.append(document.getElementById("root"));
    });
    await page.addStyleTag({
      content:
        "#state{display:none}:root{font-size:18px;--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}body{margin:0}",
    });
    await page.addScriptTag({ content: styles.outputFiles[0].text });
    await page.getByRole("button", { name: "Arrangements", exact: true }).click();
    const worker = f.seed.villagers[0];
    await page.getByRole("button", { name: /^Workers/ }).click();
    await page.getByRole("button", { name: "Add worker", exact: true }).click();
    await page.getByRole("button", { name: worker.name, exact: true }).click();
    const panel = page.getByRole("region", { name: "Work arrangements", exact: true });
    await panel.getByLabel("Work activity", { exact: true }).fill("Serving coffee");
    await panel.getByLabel("Ends", { exact: true }).fill("15:00");
    await panel.getByRole("button", { name: "Propose changes", exact: true }).click();
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
    await expect(panel.getByText("Work access", { exact: true })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Agree to these terms", exact: true })).toHaveCount(0);
    if (process.env.VILLAGES_SCREENSHOT_DIR) {
      await mkdir(process.env.VILLAGES_SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({ path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `work-proposal-${width}.png`) });
    }
    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((node) => node.getBoundingClientRect().right > innerWidth + 1)
        .slice(-6)
        .map((node) => ({
          tag: node.tagName,
          class: node.className,
          width: node.getBoundingClientRect().width,
          right: node.getBoundingClientRect().right,
        })),
    );
    assert.equal(overflow.length, 0, "Work controls fit desktop and phone: " + JSON.stringify(overflow));
    await panel.getByRole("button", { name: "Withdraw", exact: true }).click();
    await expect.poll(() => f.requests.length).toBe(2);
    assert.equal(f.requests[1].body.action, "work-decide");
    assert.equal(f.requests[1].body.accept, false);
    await f.reply(1);
    await f.finish();
  }
  for (const width of [1366, 390]) {
    const home = await mount(false, width, {
      cleanName: true,
      prepareSeed(seed) {},
    });
    await home.page.getByRole("button", { name: "Arrangements", exact: true }).click();
    await home.page.getByRole("button", { name: /^Residents/ }).click();
    await home.page.getByRole("button", { name: home.seed.villagers[0].name, exact: true }).click();
    await expect(home.page.getByRole("combobox", { name: "Venue", exact: true })).toHaveCount(0);
    await home.page.getByLabel("Sleeps in", { exact: true }).selectOption("zone / same");
    await home.page.getByRole("button", { name: "Propose changes", exact: true }).click();
    await expect.poll(() => home.requests.length).toBe(1);
    assert.equal(home.requests[0].path, "/api/villages/residences/proposals");
    assert.deepEqual(home.requests[0].body, {
      characterId: home.seed.villagers[0].characterId,
      venueId: "A / venue",
      privateZoneId: "zone / same",
    });
    await home.reply(0);
    await home.finish();
    for (const count of [3, 8]) {
      const f = await mount(false, width, {
        page: "edit",
        cleanName: true,
        prepareSeed(seed) {
          seed.villagers = Array.from({ length: count }, (_, index) => ({
            ...seed.villagers[0],
            characterId: `worker-${index}`,
            name: `Worker ${index + 1}`,
          }));
          const place = seed.settings.venues[0];
          place.workerIds = seed.villagers.map((row) => row.characterId);
          place.accessView.work = seed.villagers.map((row) => ({
            characterId: row.characterId,
            activity: "Serving coffee",
            zoneId: "zone / same",
            accessZoneIds: ["zone / same"],
            days: ["Monday"],
            startMinute: 540,
            endMinute: 1020,
          }));
        },
      });
      await f.page.getByRole("button", { name: "Arrangements", exact: true }).click();
      await f.page.getByRole("button", { name: /^Workers/ }).click();
      const people = f.page.locator(".marinara-capability-villages-venue-profile");
      const card = people.locator(".marinara-capability-villages-directory-card").first();
      assert.ok((await card.boundingBox()).width <= 146, "Cards stay compact");
      assert.deepEqual(
        await people.locator(".marinara-capability-villages-directory-card strong").allTextContents(),
        f.seed.villagers.map((row) => row.name).slice(0, 4),
      );
      if (count > 4) {
        await people.getByRole("button", { name: "Next workers page", exact: true }).click();
        await expect(people.getByRole("button", { name: "Worker 7", exact: true })).toBeVisible();
        await people.getByRole("button", { name: "Worker 7", exact: true }).click();
      } else await people.getByRole("button", { name: "Worker 3", exact: true }).click();

      await expect(f.page.getByLabel("Work activity", { exact: true })).toHaveValue("Serving coffee");
      await f.page.getByLabel("Work activity", { exact: true }).fill("A cancelled change");
      await f.page.getByRole("button", { name: "Cancel", exact: true }).click();
      assert.equal(f.requests.length, 0, "Browsing pages and cancelling never sends a work proposal");
      await f.finish();
    }
  }
  {
    const f = await mount(false, 390, {
      cleanName: true,
      prepareSeed(seed) {
        seed.settings.venues[0].accessView.managerIds = ["player", "mara"];
      },
    });
    await f.page.getByRole("button", { name: "Arrangements", exact: true }).click();
    await f.page.getByRole("button", { name: /^Visitors/ }).click();
    await f.page.getByLabel("Visitor Zone").selectOption("");
    await f.page.getByRole("button", { name: /^Change visitor rules/ }).click();
    await f.page.getByRole("button", { name: "You", exact: true }).click();
    await f.page.getByRole("checkbox", { name: "Change visitor rules", exact: true }).uncheck();
    await f.page.getByRole("button", { name: "Save visitor rules", exact: true }).click();
    await expect.poll(() => f.requests.length).toBe(1);
    assert.equal(f.requests[0].body.action, "venue-policy");
    assert.equal(f.requests[0].body.expectedRevision, 1);
    assert.deepEqual(f.requests[0].body.managerIds, ["mara"]);
    await expect(f.page.getByRole("button", { name: "← Change visitor rules", exact: true })).toBeDisabled();
    await f.page.evaluate(() => window.h.revision());
    await expect(f.page.getByRole("checkbox", { name: "Change visitor rules", exact: true })).toBeChecked();
    await f.reply(0);
    await expect(f.page.getByRole("heading", { name: "player", exact: true })).toBeVisible();
    await expect(f.page.getByRole("checkbox", { name: "Change visitor rules", exact: true })).toBeChecked();
    await f.page.getByRole("button", { name: "← Change visitor rules", exact: true }).click();
    await f.page.getByRole("button", { name: "← Visitors", exact: true }).click();
    await f.page.getByLabel("Hours", { exact: true }).selectOption("schedule");
    await f.page.evaluate(() => window.h.revision());
    await expect(f.page.getByLabel("Hours", { exact: true })).toHaveValue("always");
    await f.finish();
  }
});
