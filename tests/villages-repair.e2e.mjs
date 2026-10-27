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
        applied = 0,
        reviewed;
      const record = {
        id: '["memory","key"]',
        token: "current-token",
        topic: "memories",
        title: text,
        summary: "Shared recollection",
        fields: [{ key: "text", label: "Memory", type: "text", value: text }],
        source: [
          text,
          text,
          "Nora: “You can borrow my key until Friday.”",
          "Nora: “You can borrow my key until Friday.”",
        ],
        people: [
          { id: "player", name: "Your Persona", text },
          { id: "nora", name: "Nora", text },
        ],
        actions: [
          { id: "correct", label: "Modify" },
          { id: "forget", label: "Forget" },
        ],
        related: [],
      };
      const addition = {
        id: '["new-memory"]',
        token: "current-addition",
        topic: "memories",
        title: "Add memory",
        summary: "",
        creating: true,
        fields: [{ key: "text", label: "Memory", type: "text", value: "" }],
        source: [],
        people: [{ id: "player", name: "Your Persona" }],
        actions: [{ id: "correct", label: "Modify" }],
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
        if (path === "/repair/records") return json({ records: [record, addition], total: 2, next: null });
        if (path === "/repair/record") return json(url.searchParams.get("id") === addition.id ? addition : record);
        if (path === "/repair/review") {
          const body = route.request().postDataJSON();
          reviewed = body;
          if (body.action === "forget")
            return json({
              kind: "repair",
              id: body.operationId,
              title: record.title,
              changes: body.knowers.map((id) => ({
                label: `${record.people.find((person) => person.id === id).name} · memory`,
                before: record.people.find((person) => person.id === id).text,
                after: "Forgotten",
              })),
              affected: [],
              related: [],
              checkpoint: false,
              undoAvailable: true,
              memory: {
                creating: false,
                people: body.knowers.map((id) => record.people.find((person) => person.id === id).name),
              },
            });
          text = body.values.text;
          if (body.recordId === addition.id)
            return json({
              kind: "repair",
              id: body.operationId,
              title: addition.title,
              changes: [{ label: "Memory", before: "", after: text }],
              affected: ["Your Persona · Memories"],
              related: [],
              checkpoint: false,
              undoAvailable: true,
              memory: { creating: true, people: ["Your Persona"] },
            });
          return json({
            kind: "repair",
            id: body.operationId,
            title: record.title,
            changes: [{ label: "Your Persona · memory", before: record.fields[0].value, after: text }],
            affected: ["Your Persona", "Physical gameplay state stays separate."],
            related: [],
            checkpoint: false,
            undoAvailable: true,
            memory: { creating: false, people: ["Your Persona"] },
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
      await page.getByRole("button", { name: "Memories Edit, add, or forget a memory.", exact: true }).click();
      await page.getByRole("button", { name: /Nora gave you a workshop key. Shared recollection/ }).click();
      await expect(repair.getByRole("heading", { name: "Modify memory", exact: true })).toBeVisible();
      await expect(repair.locator(".repair-current")).toHaveCount(0);
      await expect(repair.locator("blockquote")).toHaveCount(1);
      await expect(repair.locator("h1,p,blockquote").filter({ hasText: text })).toHaveCount(0);
      if (width === 390) {
        const editor = await repair.locator(".repair-editor").boundingBox(),
          source = await repair.locator(".repair-source").boundingBox();
        assert.ok(source.y >= editor.y + editor.height, "Source follows the editor on phones");
      }
      await repair.screenshot({ path: `.build-tmp/repair-ui/${name}-memory-editor.png` });
      const unfinished = "An unfinished modification must not become the memory being forgotten.";
      await page.getByRole("textbox", { name: "Memory", exact: true }).fill(unfinished);
      await page.getByRole("button", { name: "Forget", exact: true }).click();
      await expect(page.getByRole("textbox", { name: "Memory", exact: true })).toHaveCount(0);
      await expect(repair.getByText(record.fields[0].value, { exact: true })).toBeVisible();
      await expect(repair).not.toContainText(unfinished);
      await page.getByRole("checkbox", { name: "Nora", exact: true }).check();
      await repair.screenshot({ path: `.build-tmp/repair-ui/${name}-forget.png` });
      await page.getByRole("button", { name: "Review forgetting", exact: true }).click();
      assert.equal(reviewed.action, "forget");
      assert.equal(reviewed.values.text, record.fields[0].value);
      assert.deepEqual(reviewed.knowers, ["player", "nora"]);
      await expect(repair.getByText("Forgotten", { exact: true })).toHaveCount(2);
      await expect(repair.getByRole("button", { name: "Forget memory", exact: true })).toBeEnabled();
      await expect(repair).not.toContainText(unfinished);
      assert.equal(applied, 0, "Choosing Forget and reviewing it cannot save a text edit");
      await page.getByRole("button", { name: "Back", exact: true }).click();
      await page.getByRole("button", { name: "Modify", exact: true }).click();
      await expect(page.getByRole("textbox", { name: "Memory", exact: true })).toHaveValue(unfinished);
      await page.getByRole("checkbox", { name: "Nora", exact: true }).uncheck();
      await page
        .getByRole("textbox", { name: "Memory", exact: true })
        .fill("Nora lent you her workshop key until Friday.");
      await page.getByRole("button", { name: "Main menu", exact: true }).click();
      await page.getByRole("button", { name: "Back to Scene", exact: true }).click();
      await expect(page.getByRole("textbox", { name: "Scene draft", exact: true })).toHaveValue(
        "My unfinished Scene draft.",
      );
      await page.getByRole("button", { name: "Open main menu", exact: true }).click();
      await page.getByRole("button", { name: "REPAIR", exact: true }).first().click();
      await expect(page.getByRole("textbox", { name: "Memory", exact: true })).toHaveValue(
        "Nora lent you her workshop key until Friday.",
      );
      await page.getByRole("button", { name: "Review changes", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Applies to", exact: true })).toBeVisible();
      await repair.screenshot({ path: `.build-tmp/repair-ui/${name}-review.png` });
      assert.equal(await repair.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), true);
      await page.getByRole("button", { name: "Save changes", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Changes saved", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Back to REPAIR", exact: true }).click();
      await page.getByRole("button", { name: "Memories Edit, add, or forget a memory.", exact: true }).click();
      await page.getByRole("button", { name: /Nora gave you a workshop key. Shared recollection/ }).click();
      await page.getByRole("textbox", { name: "Memory", exact: true }).fill("An unfinished repair draft stays here.");
      await page.getByRole("button", { name: "REPAIR", exact: true }).click();
      await page.getByRole("button", { name: "Repair history", exact: true }).click();
      await expect(page.getByRole("button", { name: "Review undo", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Review undo", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Review changes", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Undo changes", exact: true }).click();
      await page.getByRole("button", { name: "Back to REPAIR", exact: true }).click();
      await page.getByRole("button", { name: "Memories Edit, add, or forget a memory.", exact: true }).click();
      await page.getByRole("button", { name: /Nora gave you a workshop key. Shared recollection/ }).click();
      await expect(page.getByRole("textbox", { name: "Memory", exact: true })).toHaveValue(
        "An unfinished repair draft stays here.",
      );
      await page.getByRole("button", { name: "Main menu", exact: true }).click();
      await page.getByRole("button", { name: "Back to Scene", exact: true }).click();
      await expect(page.getByRole("textbox", { name: "Scene draft", exact: true })).toHaveValue(
        "My unfinished Scene draft.",
      );
      await page.getByRole("button", { name: "Open main menu", exact: true }).click();
      await page.getByRole("button", { name: "REPAIR", exact: true }).first().click();
      await page.getByRole("button", { name: "REPAIR", exact: true }).click();
      await page.getByRole("button", { name: "Memories Edit, add, or forget a memory.", exact: true }).click();
      await page.getByRole("button", { name: "Add memory", exact: true }).click();
      await expect(repair.locator(".repair-current")).toHaveCount(0);
      await expect(repair.getByRole("heading", { name: "Source", exact: true })).toHaveCount(0);
      const addedText = "I had the most slamming ham and cheese sandwich";
      await page.getByRole("textbox", { name: "Memory", exact: true }).fill(addedText);
      await repair.screenshot({ path: `.build-tmp/repair-ui/${name}-add-editor.png` });
      await page.getByRole("button", { name: "Review changes", exact: true }).click();
      await expect(repair.getByRole("region", { name: "Memory to add", exact: true })).toContainText(addedText);
      assert.equal((await repair.innerText()).split(addedText).length - 1, 1);
      await expect(repair.getByRole("heading", { name: "Who remembers this?", exact: true })).toBeVisible();
      await expect(repair.getByText("Before", { exact: true })).toHaveCount(0);
      await repair.screenshot({ path: `.build-tmp/repair-ui/${name}-add-review.png` });
      assert.equal(await repair.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), true);
      await repair.getByRole("button", { name: "Back", exact: true }).click();
      await expect(page.getByRole("textbox", { name: "Memory", exact: true })).toHaveValue(addedText);
      await repair.getByRole("button", { name: "Review changes", exact: true }).click();
      await repair.getByRole("button", { name: "Add memory", exact: true }).click();
      await expect(repair.getByRole("heading", { name: "Memory added", exact: true })).toBeVisible();
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
      actions: [{ id: "correct", label: "Modify" }],
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
    await page.getByRole("button", { name: "Review changes", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("Your draft is kept");
    await expect(page.getByRole("textbox", { name: "Place description", exact: true })).toHaveValue(
      "My correction survives this conflict.",
    );
    await page.close();
  });
} finally {
  await browser.close();
}
