// Test cases: repair-people/navigation, repair-people/late-responses, repair-people/restore-draft
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, expect, fulfill, mockEngineLookups } from "./fixtures/browser-diagnostics.mjs";
const code = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `import {createRoot} from 'react-dom/client';import {useRepairController} from './packages/villages/src/client/features/repair/useRepairController.js';import {RepairPage} from './packages/villages/src/client/features/repair/RepairPage.js';function App(){const c=useRepairController(true,async()=>{window.refreshStarted=true;return window.delayRepairRefresh?await window.delayRepairRefresh:null;});window.repair=c;return <RepairPage controller={c} onBack={()=>{}}/>}createRoot(document.getElementById('root')).render(<App/>);`,
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
const people = [
  { id: "player", name: "Your Persona" },
  { id: "a", name: "Nora" },
  { id: "b", name: "Ellis" },
];
const sharedId = '["memory","shared"]',
  secretId = '["memory","secret"]';
const known = "Your recollection of the telescope.",
  privateText = "Nora's private recollection.",
  secretText = "Nora's private compass.";
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => (resolve = done));
  return { promise, resolve };
};
async function fixture(width) {
  const page = await browser.newPage({ viewport: { width, height: 950 } });
  await mockEngineLookups(page);
  const gates = new Map(),
    calls = [];
  const hold = (key) => {
    const start = deferred(),
      release = deferred(),
      done = deferred();
    const entry = { start, release, done };
    gates.set(key, entry);
    return { started: start.promise, release: () => release.resolve(), done: done.promise };
  };
  const reply = async (route, key, value, status = 200) => {
    const gate = gates.get(key);
    if (gate) {
      gate.start.resolve();
      await gate.release.promise;
    }
    await fulfill(route, { status, json: value });
    gate?.done.resolve();
  };
  const record = (id, spoilers, person) => ({
    id,
    token: `${person}-${spoilers}-${id}`,
    topic: "memories",
    title: id === secretId ? secretText : person === "b" ? "Ellis paints the harbor." : spoilers ? privateText : known,
    summary: "Information",
    fields: [
      {
        key: "text",
        label: "Memory",
        type: "text",
        value: id === secretId ? secretText : spoilers ? privateText : known,
      },
    ],
    source: ["Saved source"],
    people: spoilers
      ? id === secretId
        ? [people[1]]
        : [
            { ...people[0], text: known },
            { ...people[1], text: privateText },
          ]
      : [{ ...people[0], text: known }],
    actions: [{ id: "correct", label: "Correct" }],
    related: [],
    private: spoilers,
  });
  await page.route("http://repair-people.test/", (route) =>
    fulfill(route, { contentType: "text/html", body: '<div id="root"></div>' }),
  );
  await page.route("**/api/villages**", async (route) => {
    const url = new URL(route.request().url()),
      path = url.pathname.replace("/api/villages", ""),
      spoilers = url.searchParams.get("inspection") === "true",
      person = url.searchParams.get("personId");
    calls.push({ path, spoilers, person });
    if (path === "/repair")
      return reply(route, spoilers ? "index-on" : "index-off", {
        seed: "world",
        identity: "world-one",
        people,
        records: [],
        sceneOpen: false,
        historyOffset: 0,
        historyTotal: spoilers ? 1 : 0,
        history: spoilers
          ? [
              {
                id: "private-history",
                title: "Hidden correction",
                at: "2026-10-26T20:00:00Z",
                changes: [],
                affected: [],
                undone: false,
                canUndo: true,
              },
            ]
          : [],
        checkpoints: spoilers
          ? [{ id: "private-checkpoint", title: "Hidden checkpoint", at: "2026-10-26T20:00:00Z", records: 3 }]
          : [],
      });
    if (path === "/repair/records") {
      const rows =
        url.searchParams.get("section") === "details"
          ? spoilers
            ? [{ ...record("details", true, person), topic: "people", title: "Nora's character context" }]
            : []
          : person === "b"
            ? [record('["memory","ellis"]', spoilers, person)]
            : [record(sharedId, spoilers, person), ...(spoilers ? [record(secretId, true, person)] : [])];
      return reply(route, spoilers ? "list-on" : "list-off", { records: rows, total: rows.length, next: null });
    }
    if (path === "/repair/record") {
      const id = url.searchParams.get("id");
      if (id === secretId && !spoilers) return reply(route, "hidden-record", { error: "Turn on Spoilers." }, 404);
      return reply(route, spoilers ? "record-on" : "record-off", record(id, spoilers, person));
    }
    if (path === "/repair/apply") return reply(route, "apply", { applied: true });
    if (["/repair/review", "/repair/undo", "/repair/restore"].includes(path)) {
      const body = route.request().postDataJSON();
      calls.push({ body, path });
      const kind = path.endsWith("/undo") ? "undo" : path.endsWith("/restore") ? "restore" : "repair";
      return reply(route, kind, {
        kind,
        id: "plan",
        title: "Hidden review",
        changes: [{ label: "Memory", before: privateText, after: body.values?.text ?? "Private inverse" }],
        affected: [],
        related: [],
        checkpoint: kind === "restore",
        undoAvailable: true,
        memory: { creating: false, people: (body.knowers ?? ["a"]).map((id) => people.find((p) => p.id === id).name) },
      });
    }
    throw Error("Unexpected REPAIR fixture request: " + path);
  });
  await page.goto("http://repair-people.test/");
  await page.addScriptTag({ content: code.outputFiles[0].text });
  await expect(page.getByRole("heading", { name: "REPAIR", exact: true })).toBeVisible();
  return { page, root: page.locator(".villages-repair"), hold, calls, close: () => page.close() };
}
const openPeople = async (page) => {
  await page
    .getByRole("button", { name: "People Villagers, their memories, and character details.", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Nora", exact: true })).toBeVisible();
};
const spoilers = (page) => page.getByRole("switch", { name: "Spoilers", exact: true });
const goNora = async (page) => {
  await openPeople(page);
  await page.getByRole("button", { name: "Nora", exact: true }).click();
  await expect(spoilers(page)).not.toBeChecked();
};
try {
  await mkdir(".build-tmp/repair-people", { recursive: true });
  await runCase("repair-people/navigation", async () => {
    for (const width of [1440, 390]) {
      const f = await fixture(width),
        { page, root } = f;
      await expect(spoilers(page)).toHaveCount(0);
      await openPeople(page);
      for (const p of people) await expect(page.getByRole("button", { name: p.name, exact: true })).toBeVisible();
      await expect(root.getByText(known, { exact: true })).toHaveCount(0);
      await root.screenshot({ path: `.build-tmp/repair-people/roster-${width}.png` });
      const input = page.getByRole("searchbox", { name: "Search villagers", exact: true }),
        search = page.getByRole("button", { name: "Search", exact: true });
      if (width === 390) await root.evaluate((el) => (el.style.fontSize = "20px"));
      const fieldBox = await input.boundingBox(),
        buttonBox = await search.boundingBox();
      assert.ok(fieldBox.x + fieldBox.width <= buttonBox.x - 8);
      assert.equal(
        await search.evaluate((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          return range.getClientRects().length;
        }),
        1,
        "Search must stay on one line even at larger mobile font size",
      );
      await root.evaluate((el) => (el.style.fontSize = ""));
      await page.getByRole("button", { name: "Nora", exact: true }).click();
      await expect(spoilers(page)).not.toBeChecked();
      await expect(root.getByRole("button", { name: /Your recollection/ })).toBeVisible();
      await spoilers(page).check();
      await expect(root.getByRole("button", { name: /Nora's private recollection/ })).toBeVisible();
      await root.getByRole("button", { name: /Nora's private recollection/ }).click();
      await expect(page.getByRole("checkbox", { name: "Nora", exact: true })).toBeChecked();
      await expect(page.getByRole("checkbox", { name: "Your Persona", exact: true })).not.toBeChecked();
      const field = page.getByRole("textbox", { name: "Memory", exact: true });
      await expect(field).toHaveValue(privateText);
      await field.fill("The corrected shared recollection.");
      await page.getByRole("checkbox", { name: "Your Persona", exact: true }).check();
      await page.getByRole("button", { name: "Review changes", exact: true }).click();
      const sent = f.calls.findLast((call) => call.path === "/repair/review" && call.body).body;
      assert.deepEqual([...sent.knowers].sort(), ["a", "player"]);
      assert.equal(sent.personId, "a");
      assert.equal(sent.inspection, true);
      const scope = root
        .locator(".repair-panel")
        .filter({ has: page.getByRole("heading", { name: "Applies to", exact: true }) });
      await expect(scope).toContainText("Your Persona");
      await expect(scope).toContainText("Nora");
      await spoilers(page).uncheck();
      await expect(field).toHaveValue(known);
      await expect(page.getByRole("checkbox", { name: "Nora", exact: true })).toHaveCount(0);
      await spoilers(page).check();
      await expect(field).toHaveValue("The corrected shared recollection.");
      await page.getByRole("button", { name: "Back to records", exact: true }).click();
      await root.getByRole("button", { name: /Nora's private compass/ }).click();
      await field.fill("Edited private compass memory.");
      await spoilers(page).uncheck();
      await expect(root.getByRole("button", { name: /Your recollection/ })).toBeVisible();
      await expect(root).not.toContainText("Edited private compass");
      await spoilers(page).check();
      await root.getByRole("button", { name: /Nora's private compass/ }).click();
      await expect(field).toHaveValue("Edited private compass memory.");
      await page.getByRole("button", { name: "People", exact: true }).click();
      await page.getByRole("button", { name: "Ellis", exact: true }).click();
      await expect(spoilers(page)).not.toBeChecked();
      await expect(root).not.toContainText(secretText);
      await root.screenshot({ path: `.build-tmp/repair-people/person-${width}.png` });
      assert.equal(await root.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), true);
      await f.close();
    }
  });
  await runCase("repair-people/late-responses", async () => {
    const f = await fixture(390),
      { page, root } = f;
    await goNora(page);
    const index = f.hold("index-on");
    await spoilers(page).check();
    await index.started;
    await spoilers(page).uncheck();
    await expect(root.getByRole("button", { name: /Your recollection/ })).toBeVisible();
    index.release();
    await index.done;
    await expect(root).not.toContainText("Hidden correction");
    await expect(root).not.toContainText(secretText);
    await spoilers(page).check();
    await expect(root.getByRole("button", { name: /Nora's private compass/ })).toBeVisible();
    const open = f.hold("record-on");
    await root.getByRole("button", { name: /Nora's private compass/ }).click();
    await open.started;
    await spoilers(page).uncheck();
    open.release();
    await open.done;
    await expect(root.getByRole("button", { name: /Your recollection/ })).toBeVisible();
    await expect(root).not.toContainText(secretText);
    await spoilers(page).check();
    await root.getByRole("button", { name: /Nora's private recollection/ }).click();
    const field = page.getByRole("textbox", { name: "Memory", exact: true });
    await field.fill("Private pending draft.");
    const review = f.hold("repair");
    await page.getByRole("button", { name: "Review changes", exact: true }).click();
    await review.started;
    await spoilers(page).uncheck();
    review.release();
    await review.done;
    await expect(field).toHaveValue(known);
    await expect(root).not.toContainText("Hidden review");
    await page.getByRole("button", { name: "REPAIR", exact: true }).click();
    await page.getByRole("button", { name: "Repair history", exact: true }).click();
    await spoilers(page).check();
    await expect(root).toContainText("Hidden correction");
    const undo = f.hold("undo");
    await page.getByRole("button", { name: "Review undo", exact: true }).click();
    await undo.started;
    await spoilers(page).uncheck();
    undo.release();
    await undo.done;
    await expect(root).not.toContainText("Hidden correction");
    await expect(root).not.toContainText("Hidden review");
    await page.getByRole("button", { name: "REPAIR", exact: true }).click();
    await page
      .getByRole("button", { name: "Backups & repairs Review repairs, undo, or restore a checkpoint.", exact: true })
      .click();
    await spoilers(page).check();
    await expect(root).toContainText("Hidden checkpoint");
    const restore = f.hold("restore");
    await page.getByRole("button", { name: "Review restoration", exact: true }).click();
    await restore.started;
    await spoilers(page).uncheck();
    restore.release();
    await restore.done;
    await expect(root).not.toContainText("Hidden checkpoint");
    await expect(root).not.toContainText("Hidden review");
    await f.close();
  });
  await runCase("repair-people/restore-draft", async () => {
    const f = await fixture(390),
      { page, root } = f;
    await page
      .getByRole("button", { name: "Backups & repairs Review repairs, undo, or restore a checkpoint.", exact: true })
      .click();
    await spoilers(page).check();
    await page.getByRole("button", { name: "Review restoration", exact: true }).click();
    await page.getByRole("checkbox", { name: "Replace Village progress with this checkpoint", exact: true }).check();
    await page.evaluate(() => {
      window.delayRepairRefresh = new Promise((resolve) => (window.releaseRepairRefresh = resolve));
    });
    await page.getByRole("button", { name: "Restore checkpoint", exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.refreshStarted)).toBe(true);
    await expect(root.getByRole("heading", { name: "Checkpoint restored", exact: true })).toHaveCount(0);
    await expect(root.getByRole("button", { name: "Back", exact: true })).toBeDisabled();
    await expect(spoilers(page)).toBeDisabled();
    await page.evaluate(() =>
      window.releaseRepairRefresh({ title: "Previous Scene", text: "My unfinished Scene draft." }),
    );
    await expect(root.getByRole("heading", { name: "Checkpoint restored", exact: true })).toBeVisible();
    await expect(root.getByRole("textbox", { name: "Kept Scene draft", exact: true })).toHaveValue(
      "My unfinished Scene draft.",
    );
    await f.close();
  });
} finally {
  await browser.close();
}
