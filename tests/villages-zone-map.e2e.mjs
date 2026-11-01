// Test cases: zones/map/editor
import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, expect, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { createVenueScreenHarness } from "./fixtures/villages-venue-screen-lifetime.fixture.mjs";

const styles = await build({
  stdin: {
    contents: "import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';syncVillagesStyles();",
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
      document.body.append(tag);
      tag.append(document.getElementById("root"));
    });
    await f.page.addStyleTag({
      content:
        "#state{display:none} :root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}body{margin:0}",
    });
    await f.page.addScriptTag({ content: styles.outputFiles[0].text });
    const map = f.page.locator(".villages-zone-map");
    await expect(map.locator("[data-layout-zone]")).toHaveCount(7);
    await node(map, "exterior").press("ArrowRight");
    await map.getByRole("button", { name: "Modify Zone Connections", exact: true }).click();
    await node(map, "zone:1").click();
    await node(map, "zone:2").click();
    assert.equal(f.requests.length, 0, "seven-tile draft is local");
    await f.run("layout");
    await expect.poll(() => f.requests.length).toBe(1);
    const body = f.requests[0].body;
    assert.equal(body.positions.exterior.x, 1);
    assert.equal(body.connections.length, 7);
    assert.ok(body.connections.find((z) => z.id === "zone:1").connectedTo.includes("zone:2"));
    assert.ok(!JSON.stringify(body).includes("description"));
    f.seed.settings.venues[0].zoneLayout = body.positions;
    f.seed.settings.venues[0].zones.forEach(
      (zone) => (zone.connectedTo = body.connections.find((row) => row.id === zone.id).connectedTo),
    );
    await f.reply(0);
    await expect(f.page.getByText("Saving layout…", { exact: true })).toHaveCount(0);
    await node(map, "exterior").click();
    await node(map, "zone:3").click();
    await expect(map.locator("svg line")).toHaveCount(6);
    await expect(f.page.getByRole("alert")).toHaveCount(0);
    const attempt = await f.run("layout");
    const result = await f.settle(attempt);
    assert.equal(result.value, false);
    assert.equal(f.requests.length, 1);
    await f.run("discard");
    await expect(map.locator("svg line")).toHaveCount(7);
    for (const width of [1366, 736, 390, 320]) {
      await f.page.setViewportSize({ width, height: 1000 });
      await assertNoOverlap(map);
    }
    await f.finish();
  });
});
