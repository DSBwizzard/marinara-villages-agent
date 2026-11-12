// Test cases: zones/map/editor
import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { createVenueScreenHarness } from "./fixtures/villages-venue-screen-lifetime.fixture.mjs";

const styles = await build({
  stdin: {
    contents: `import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';
import {DESK_STYLES} from './packages/villages/src/client/shared/desk-styles.js';
syncVillagesStyles();const tag=document.createElement('style');tag.textContent=DESK_STYLES;document.head.append(tag);`,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
});
const browser = await chromium.launch({ headless: true });
const node = (map, id) => map.locator(`[data-layout-zone=${JSON.stringify(id)}]`);
async function assertNoOverlap(map) {
  const boxes = await map
    .locator("[data-layout-zone]")
    .evaluateAll((nodes) => nodes.map((n) => ({ id: n.dataset.layoutZone, rect: n.getBoundingClientRect().toJSON() })));
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i].rect,
        b = boxes[j].rect;
      assert.ok(
        a.right <= b.left + 0.1 || b.right <= a.left + 0.1 || a.bottom <= b.top + 0.1 || b.bottom <= a.top + 0.1,
        `${boxes[i].id} overlaps ${boxes[j].id}`,
      );
    }
}
await withBrowser(browser, async () => {
  await runCase("zones/map/editor", async () => {
    const mount = await createVenueScreenHarness(browser);
    const f = await mount(false, 1366, {
      page: "view",
      zone: "exterior",
      cleanName: true,
      prepareSeed(seed) {
        const place = seed.settings.venues[0],
          sample = place.zones[0];
        place.zones = Array.from({ length: 7 }, (_, i) => ({
          ...structuredClone(sample),
          id: i ? `zone:${i}` : "exterior",
          name: i ? `Room ${i}` : "Entrance",
          kind: i ? "public" : "exterior",
          connectedTo: i ? ["exterior"] : Array.from({ length: 6 }, (_, j) => `zone:${j + 1}`),
        }));
      },
    });
    await f.page.evaluate(() => {
      const tag = document.createElement("marinara-capability-villages");
      tag.className = "marinara-capability-villages-desk-container";
      document.body.append(tag);
      tag.append(document.getElementById("root"));
    });
    await f.page.addStyleTag({
      content:
        "#state{display:none} :root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}body{margin:0}",
    });
    await f.page.addScriptTag({ content: styles.outputFiles[0].text });
    await f.page.getByRole("button", { name: "Manage", exact: true }).click();
    await f.page.getByRole("button", { name: "Zone connections", exact: true }).click();
    const map = f.page.locator(".villages-zone-map");
    const save = f.page.getByRole("button", { name: "Save connections", exact: true });
    await expect(map.locator("[data-layout-zone]")).toHaveCount(7);
    await node(map, "exterior").press("ArrowRight");
    await node(map, "zone:1").click();
    await f.page.getByRole("checkbox", { name: "Room 2", exact: true }).check();
    assert.equal(f.requests.length, 0, "seven-tile draft is local");
    await save.click();
    await expect.poll(() => f.requests.length).toBe(1);
    const body = f.requests[0].body;
    assert.equal(body.positions.exterior.x, 0);
    assert.equal(body.connections.length, 7);
    assert.ok(body.connections.find((z) => z.id === "zone:1").connectedTo.includes("zone:2"));
    assert.ok(body.connections.find((z) => z.id === "zone:2").connectedTo.includes("zone:1"));
    assert.ok(!JSON.stringify(body).includes("description"));
    f.seed.settings.venues[0].zoneLayout = body.positions;
    f.seed.settings.venues[0].zones.forEach(
      (zone) => (zone.connectedTo = body.connections.find((row) => row.id === zone.id).connectedTo),
    );
    await f.reply(0);
    await expect(f.page.getByText("Saving layout…", { exact: true })).toHaveCount(0);
    await node(map, "exterior").click();
    await f.page.getByRole("checkbox", { name: "Room 3", exact: true }).uncheck();
    await expect(map.locator("svg line")).toHaveCount(6);
    await expect(f.page.getByRole("alert")).toContainText("Unreachable Zones");
    await expect(save).toBeDisabled();
    assert.equal(f.requests.length, 1);
    await f.run("discard");
    await expect(map.locator("svg line")).toHaveCount(7);
    for (const width of [1366, 736, 390, 320]) {
      await f.page.setViewportSize({ width, height: 1000 });
      await assertNoOverlap(map);
      const metrics = await map.locator("[data-layout-zone]").evaluateAll((nodes) =>
        nodes.map((node) => ({
          width: node.getBoundingClientRect().width,
          height: node.getBoundingClientRect().height,
        })),
      );
      assert.ok(
        metrics.every((tile) => tile.width >= 44 && tile.height >= 44),
        "Visible nodes retain full-size touch targets",
      );
      assert.equal(f.requests.length, 1, "Resizing visual nodes never rewrites saved coordinates");
    }
    await f.finish();
  });
});
