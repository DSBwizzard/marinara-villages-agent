// Test cases: repair-ui/desktop, repair-ui/phone, repair-ui/retry
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, expect, fulfill, mockEngineLookups } from "./fixtures/browser-diagnostics.mjs";
import { snapshot, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `
import {createRoot} from 'react-dom/client';
import {useVillageController} from './packages/villages/src/client/shell/useVillageController.js';
import {MenuScreen} from './packages/villages/src/client/shell/MenuScreen.js';
function Harness(){const c=useVillageController({element:document.getElementById('root')});window.repairController=c;
return <><button onClick={()=>c.openMenu('index')}>Open main menu</button>{c.screen==='menu'?<MenuScreen controller={c}/>:<textarea aria-label="Scene draft" value={c.roomDraft} onChange={e=>c.setRoomDraft(e.target.value)}/>}</>}
createRoot(document.getElementById('root')).render(<Harness/>);`,
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
await mkdir(".build-tmp/repair-ui", { recursive: true });
try {
  for (const [name, width] of [
    ["desktop", 1440],
    ["phone", 390],
  ])
    await runCase(`repair-ui/${name}`, async () => {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await mockEngineLookups(page);
      let text = "Nora gave you a workshop key.",
        applied = 0;
      const record = {
        id: '["memory","key"]',
        token: "current-token",
        topic: "memories",
        title: "The workshop key",
        summary: "Shared recollection",
        fields: [{ key: "text", label: "Remembered wording", type: "text", value: text }],
        source: ["Nora: “You can borrow my key until Friday.”"],
        people: [
          { id: "player", name: "Your Persona", text },
          { id: "nora", name: "Nora", text },
        ],
        actions: [
          { id: "correct", label: "Correct" },
          { id: "forget", label: "Forget" },
        ],
        related: [],
      };
      const session = {
        id: "repair-scene",
        version: 2,
        sceneRevision: 0,
        placeId: "mill",
        placeName: "The Mill",
        zoneId: "exterior",
        area: "public",
        status: "active",
        activeIds: [],
        participants: [],
        lines: [],
        submissions: [],
        startedAt: now,
        lastActivityAt: now,
        endedAt: "",
      };
      const index = () => ({
        seed: "repair-world",
        sceneOpen: true,
        records: [],
        history: applied
          ? [
              {
                id: "saved",
                title: "The workshop key",
                at: now,
                changes: [{ label: "Your Persona · memory", before: record.fields[0].value, after: text }],
                affected: ["Your Persona"],
                undone: false,
                canUndo: true,
              },
            ]
          : [],
        checkpoints: [],
      });
      await page.route("http://repair.test/", (route) =>
        fulfill(route, { contentType: "text/html", body: '<div id="root" style="height:1000px"></div>' }),
      );
      await page.route("**/api/villages**", async (route) => {
        const url = new URL(route.request().url()),
          path = url.pathname.replace("/api/villages", "");
        const json = (value) => fulfill(route, { json: value });
        if (path === "/rooms/active") return json({ session });
        if (path === "/repair") return json(index());
        if (path === "/repair/records") return json({ records: [record], total: 1, next: null });
        if (path === "/repair/record") return json(record);
        if (path === "/repair/review") {
          const body = route.request().postDataJSON();
          text = body.values.text;
          return json({
            kind: "repair",
            id: body.operationId,
            title: record.title,
            changes: [{ label: "Your Persona · memory", before: record.fields[0].value, after: text }],
            affected: ["Your Persona", "Physical gameplay state stays separate."],
            related: [],
            checkpoint: false,
          });
        }
        if (path === "/repair/apply") {
          applied++;
          return json({ applied: true });
        }
        if (path === "/repair/undo")
          return json({
            kind: "undo",
            id: "undo",
            title: "Undo the workshop key",
            changes: [{ label: "Memory", before: text, after: record.fields[0].value }],
            affected: ["Your Persona"],
            related: [],
            checkpoint: false,
          });
        if (path.includes("/changes"))
          return json({
            changes: [],
            notices: [],
            nextCursor: "",
            hasMore: false,
            processingSummary: { pending: 0, failed: 0, rejected: 0 },
            unresolved: [],
          });
        if (path === "/agendas") return json({ agendas: [] });
        return json(snapshot);
      });
      await page.goto("http://repair.test/");
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      await expect.poll(() => page.evaluate(() => window.repairController?.room?.id)).toBe(session.id);
      await page.getByRole("textbox", { name: "Scene draft", exact: true }).fill("My unfinished Scene draft.");
      await page.getByRole("button", { name: "Open main menu", exact: true }).click();
      await page.getByRole("button", { name: "REPAIR", exact: true }).first().click();
      await expect(page.getByRole("heading", { name: "REPAIR", exact: true })).toBeVisible();
      const repair = page.locator(".villages-repair");
      await repair.screenshot({ path: `.build-tmp/repair-ui/${name}-hub.png` });
      const colors = await repair.evaluate((el) => ({
        background: getComputedStyle(el).backgroundColor,
        color: getComputedStyle(el).color,
      }));
      assert.equal(colors.background, "rgb(246, 245, 239)");
      await page
        .getByRole("button", { name: "Memories Correct, forget, or record a missing detail.", exact: true })
        .click();
      await page.getByRole("button", { name: /The workshop key Shared recollection/ }).click();
      await page
        .getByRole("textbox", { name: "Remembered wording", exact: true })
        .fill("Nora lent you her workshop key until Friday.");
      await page.getByRole("button", { name: "Main menu", exact: true }).click();
      await page.getByRole("button", { name: "Back to Scene", exact: true }).click();
      await expect(page.getByRole("textbox", { name: "Scene draft", exact: true })).toHaveValue(
        "My unfinished Scene draft.",
      );
      await page.getByRole("button", { name: "Open main menu", exact: true }).click();
      await page.getByRole("button", { name: "REPAIR", exact: true }).first().click();
      await expect(page.getByRole("textbox", { name: "Remembered wording", exact: true })).toHaveValue(
        "Nora lent you her workshop key until Friday.",
      );
      await page.getByRole("button", { name: "Review repair", exact: true }).click();
      await expect(page.getByRole("heading", { name: "What this affects", exact: true })).toBeVisible();
      await repair.screenshot({ path: `.build-tmp/repair-ui/${name}-review.png` });
      assert.equal(await repair.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), true);
      await page.getByRole("button", { name: "Apply repair", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Repair applied", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Back to REPAIR", exact: true }).click();
      await page
        .getByRole("button", { name: "Memories Correct, forget, or record a missing detail.", exact: true })
        .click();
      await page.getByRole("button", { name: /The workshop key Shared recollection/ }).click();
      await page
        .getByRole("textbox", { name: "Remembered wording", exact: true })
        .fill("An unfinished repair draft stays here.");
      await page.getByRole("button", { name: "REPAIR", exact: true }).click();
      await page.getByRole("button", { name: "Repair history", exact: true }).click();
      await expect(page.getByRole("button", { name: "Review undo", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Review undo", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Review repair", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Apply repair", exact: true }).click();
      await page.getByRole("button", { name: "Back to REPAIR", exact: true }).click();
      await page
        .getByRole("button", { name: "Memories Correct, forget, or record a missing detail.", exact: true })
        .click();
      await page.getByRole("button", { name: /The workshop key Shared recollection/ }).click();
      await expect(page.getByRole("textbox", { name: "Remembered wording", exact: true })).toHaveValue(
        "An unfinished repair draft stays here.",
      );
      await page.getByRole("button", { name: "Main menu", exact: true }).click();
      await page.getByRole("button", { name: "Back to Scene", exact: true }).click();
      await expect(page.getByRole("textbox", { name: "Scene draft", exact: true })).toHaveValue(
        "My unfinished Scene draft.",
      );
      await page.close();
    });
  await runCase("repair-ui/retry", async () => {
    // The server suites exercise uncertain save replay. Here exercise retained editor state after rejection.
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    await mockEngineLookups(page);
    const code = await build({
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
    const item = {
      id: '["world"]',
      token: "fresh",
      topic: "world",
      title: "Village setting",
      summary: "Setting",
      fields: [{ key: "setting", label: "Place description", type: "text", value: "Old setting" }],
      actions: [{ id: "correct", label: "Correct" }],
      source: [],
      related: [],
    };
    await page.route("http://repair-retry.test/", (route) =>
      fulfill(route, { contentType: "text/html", body: '<div id="root"></div>' }),
    );
    await page.route("**/api/villages**", (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/review"))
        return fulfill(route, { status: 409, json: { error: "A reviewed record changed. Your draft is kept." } });
      return fulfill(route, {
        json: path.endsWith("/records")
          ? { records: [item], total: 1 }
          : path.endsWith("/record")
            ? item
            : { seed: "s", records: [], history: [], checkpoints: [], sceneOpen: false },
      });
    });
    await page.goto("http://repair-retry.test/");
    await page.addScriptTag({ content: code.outputFiles[0].text });
    await page
      .getByRole("button", { name: "World & history Setting, founding details, and Scene corrections." })
      .click();
    await page.getByRole("button", { name: "Village setting Setting", exact: true }).click();
    await page
      .getByRole("textbox", { name: "Place description", exact: true })
      .fill("My correction survives this conflict.");
    await page.getByRole("button", { name: "Review repair", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("Your draft is kept");
    await expect(page.getByRole("textbox", { name: "Place description", exact: true })).toHaveValue(
      "My correction survives this conflict.",
    );
    await page.close();
  });
} finally {
  await browser.close();
}
