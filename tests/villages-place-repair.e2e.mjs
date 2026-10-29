// Test cases: place-repair/desktop, place-repair/phone
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, expect, fulfill, mockEngineLookups } from "./fixtures/browser-diagnostics.mjs";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { worldRepairRecords, applyWorldRepair } from "../packages/villages/src/server/domain/rules/repair-records.js";

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
try {
  for (const [name, width] of [
    ["desktop", 1440],
    ["phone", 390],
  ])
    await runCase("place-repair/" + name, async () => {
      const at = "2026-10-28T12:00:00.000Z";
      let state = coerceVillageState({
        ...defaultVillageState(),
        seed: "place-repair",
        venues: [
          {
            id: "hall",
            name: "Hall",
            classes: ["community"],
            description: "White walls. Two windows. A table.",
            layoutVersion: 1,
            zones: [
              {
                id: "exterior",
                name: "Entrance",
                kind: "exterior",
                venueClass: "community",
                description: "White walls. Two windows. A table.",
                image: null,
                state: {
                  revision: 2,
                  updatedAt: at,
                  recent: { text: "Cups after tea.", occurredAt: at, expiresAt: "2026-10-29T12:00:00.000Z" },
                },
              },
            ],
          },
        ],
      });
      const getRecord = () => ({
        ...worldRepairRecords(state, false).find((row) => JSON.parse(row.id)[0] === "zone"),
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
                  label: "Description",
                  before: state.venues[0].zones[0].description,
                  after: staged.venues[0].zones[0].description,
                },
                {
                  label: "Recent context",
                  before: state.venues[0].zones[0].state.recent?.text ?? "",
                  after: staged.venues[0].zones[0].state.recent?.text ?? "",
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
        await page.getByRole("button", { name: /Hall · Entrance Zone physical state/ }).click();
      };
      await open();
      await expect(page.getByRole("textbox", { name: "Description", exact: true })).toHaveValue(
        "White walls. Two windows. A table.",
      );
      await expect(page.getByRole("textbox", { name: "Recent context", exact: true })).toHaveValue("Cups after tea.");
      await expect(page.getByRole("button", { name: "Clear recent context", exact: true })).toBeVisible();
      await page
        .getByRole("textbox", { name: "Description", exact: true })
        .fill("White walls. Two windows. A table. Shelves beside the window.");
      await page.getByRole("textbox", { name: "Recent context", exact: true }).fill("Fresh cups after tea.");
      await page.getByRole("button", { name: "Renew for one day", exact: true }).click();
      await page.locator(".villages-repair").screenshot({ path: `.build-tmp/place-repair/${name}-editor.png` });
      assert.equal(await page.locator(".villages-repair").evaluate((el) => el.scrollWidth <= el.clientWidth + 1), true);
      await page.getByRole("button", { name: "Review changes", exact: true }).click();
      assert.equal(applied, 0, "review does not apply the correction");
      assert.equal(pending.action, "renew-recent");
      await page.getByRole("button", { name: "Save changes", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Changes saved", exact: true })).toBeVisible();
      assert.equal(applied, 1);
      assert.equal(state.venues[0].zones[0].state.revision, 3);
      assert.equal(state.venues[0].zones[0].state.recent.expiresAt, "2026-10-29T15:00:00.000Z");
      assert.match(state.venues[0].zones[0].description, /Two windows.*Shelves/);
      await page.getByRole("button", { name: "Back to REPAIR", exact: true }).click();
      await open();
      await page.getByRole("button", { name: "Clear recent context", exact: true }).click();
      await page.getByRole("button", { name: "Review changes", exact: true }).click();
      await page.getByRole("button", { name: "Save changes", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Changes saved", exact: true })).toBeVisible();
      assert.equal(state.venues[0].zones[0].state.recent, null);
      assert.match(state.venues[0].zones[0].description, /Shelves/);
      await page.close();
    });
} finally {
  await browser.close();
}
