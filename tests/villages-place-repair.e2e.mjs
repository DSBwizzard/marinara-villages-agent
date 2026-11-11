import { venueFixture } from "./helpers/venues.fixture.js";
// Test cases: place-repair/desktop, place-repair/phone
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { worldRepairRecords, applyWorldRepair } from "../packages/villages/src/server/domain/rules/repair-records.js";
import { initializeRoomContinuity } from "../packages/villages/src/server/domain/rules/native-continuity.js";

const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `import {createRoot} from 'react-dom/client';import {useRepairController} from './packages/villages/src/client/features/repair/useRepairController.js';import {RepairPage} from './packages/villages/src/client/features/repair/RepairPage.js';function App(){const c=useRepairController(true,async()=>null);return <RepairPage controller={c} onBack={()=>{}}/>}createRoot(document.getElementById('root')).render(<App/>);`,
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
await mkdir(".build-tmp/place-repair", { recursive: true });
await withBrowser(browser, async () => {
  for (const [name, width] of [
    ["desktop", 1440],
    ["phone", 390],
  ])
    await runCase("place-repair/" + name, async () => {
      const at = "2026-10-28T12:00:00.000Z";
      const description = "White walls. Two windows.\n\nA table.";
      let state = coerceVillageState({
        ...defaultVillageState(),
        seed: "place-repair",
        setupAt: at,
        foundedAt: at,
        venues: [
          venueFixture({
            id: "hall",
            name: "Hall",
            classes: ["community"],
            description,
            layoutVersion: 1,
            zones: [
              {
                id: "exterior",
                name: "Entrance",
                kind: "exterior",
                venueClass: "community",
                description,
                image: null,
              },
            ],
          }),
        ],
      });
      initializeRoomContinuity(state, "hall", "exterior", description, "founding", at);
      const roomRecords = (world = state) =>
        worldRepairRecords(world, false).filter((row) => row.summary === "Room description");
      const original = roomRecords();
      const wall = original.find((row) => row.fields[0].value === "White walls. Two windows.");
      const table = original.find((row) => row.fields[0].value === "A table.");
      assert(wall && table);
      const getRecord = (world = state) => ({
        ...roomRecords(world).find((row) => row.id === wall.id),
        token: "current",
      });
      const index = () => ({
        seed: state.seed,
        identity: state.seed,
        records: [],
        history: [],
        checkpoints: [],
        people: [],
        sceneOpen: false,
      });
      let pending,
        staged,
        applied = 0;
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await mockEngineLookups(page);
      await page.route("http://place-repair.test/", (route) =>
        fulfill(route, { contentType: "text/html", body: '<div id="root"></div>' }),
      );
      await page.route("**/api/villages**", (route) => {
        const path = new URL(route.request().url()).pathname;
        if (path.endsWith("/records")) return fulfill(route, { json: { records: [getRecord()], total: 1 } });
        if (path.endsWith("/record")) return fulfill(route, { json: getRecord() });
        if (path.endsWith("/review")) {
          pending = route.request().postDataJSON();
          staged = structuredClone(state);
          applyWorldRepair(staged, getRecord(), pending, "2026-10-28T15:00:00.000Z");
          return fulfill(route, {
            json: {
              kind: "repair",
              id: pending.operationId,
              title: getRecord().title,
              changes: [
                {
                  label: "Text",
                  before: getRecord().fields[0].value,
                  after: getRecord(staged).fields[0].value,
                },
              ],
              affected: ["Hall"],
              related: [],
              checkpoint: true,
              undoAvailable: true,
            },
          });
        }
        if (path.endsWith("/apply")) {
          state = staged;
          applied++;
          return fulfill(route, { json: {} });
        }
        return fulfill(route, { json: index() });
      });
      await page.goto("http://place-repair.test/");
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      const open = async () => {
        await page.getByRole("button", { name: "Places Venues, Zones, homes, and access.", exact: true }).click();
        await page.getByRole("button", { name: /Hall · Entrance Room description/ }).click();
      };
      await open();
      await expect(page.getByText("Current", { exact: true })).toHaveCount(0);
      const editor = page.getByRole("textbox", { name: "Text", exact: true });
      const correction = "White walls. Two windows. Shelves beside the window.";
      await expect(editor).toHaveValue("White walls. Two windows.");
      await editor.fill(correction);
      await page.locator(".villages-repair").screenshot({ path: `.build-tmp/place-repair/${name}-editor.png` });
      assert.equal(await page.locator(".villages-repair").evaluate((el) => el.scrollWidth <= el.clientWidth + 1), true);
      await page.getByRole("button", { name: "Review changes", exact: true }).click();
      assert.equal(applied, 0, "review does not apply the correction");
      assert.equal(pending.action, "correct");
      assert.equal(pending.recordId, wall.id);
      assert.equal(getRecord().fields[0].value, "White walls. Two windows.");
      await page.getByRole("button", { name: "Save changes", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Changes saved", exact: true })).toBeVisible();
      assert.equal(applied, 1);
      assert.equal(getRecord().fields[0].value, correction);
      assert.deepEqual(
        roomRecords().find((row) => row.id === table.id),
        table,
      );
      assert.equal(state.venues[0].zones[0].description, description);
      await page.getByRole("button", { name: "Back to REPAIR", exact: true }).click();
      await open();
      await expect(editor).toHaveValue(correction);
      await page.close();
    });
});
