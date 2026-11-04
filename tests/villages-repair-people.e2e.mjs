// Test cases: repair-people/navigation, repair-people/letter-font, repair-people/late-responses, repair-people/restore-draft
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
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
  secretId = '["memory","secret"]',
  additionId = '["new-memory"]';
const known = "Your recollection of the telescope.",
  privateText = "Nora's private recollection.",
  secretText = "Nora's private compass.";
const deferred = () => {
  return Promise.withResolvers();
};
async function fixture(width) {
  const page = await browser.newPage({ viewport: { width, height: 950 } });
  await mockEngineLookups(page);
  const gates = new Map(),
    calls = [];
  const hold = (key, patch = {}) => {
    const start = deferred(),
      release = deferred(),
      done = deferred();
    gates.set(key, { start, release, done, patch });
    return { started: start.promise, release: () => release.resolve(), done: done.promise };
  };
  const reply = async (route, key, value) => {
    const gate = gates.get(key);
    if (gate) {
      gates.delete(key);
      gate.start.resolve();
      await gate.release.promise;
      value = { ...value, ...gate.patch };
    }
    await fulfill(route, { json: value });
    gate?.done.resolve();
  };
  const record = (id, person) => {
    const value =
      id === secretId
        ? secretText
        : person === "b"
          ? "Ellis paints the harbor."
          : person === "player"
            ? known
            : privateText;
    return {
      id,
      token: `${person}-${id}`,
      topic: "memories",
      title: value,
      summary: "Information",
      fields: [{ key: "text", label: "Memory", type: "text", value }],
      source: ["Saved source"],
      people:
        id === secretId
          ? [{ ...people[1], text: secretText }]
          : [
              { ...people[0], text: known },
              { ...people[1], text: privateText },
            ],
      actions: [{ id: "correct", label: "Modify" }],
      related: [],
    };
  };
  const fontRecord = {
    id: '["letter-font","a"]',
    token: "font-token",
    topic: "people",
    title: "Nora · letter style",
    summary: "Applies to existing and future letters",
    fields: [
      {
        key: "letterFontId",
        label: "Letter style",
        type: "choice",
        value: "patrick-hand",
        options: [
          { value: "patrick-hand", label: "Patrick Hand" },
          { value: "caveat", label: "Caveat" },
        ],
      },
    ],
    source: [],
    actions: [{ id: "correct", label: "Modify" }],
    related: [],
  };
  await page.route("**/api/capability-packages/villages/assets/letter-fonts/*.json", (route) => {
    const name = new URL(route.request().url()).pathname.split("/").at(-1);
    return fulfill(route, {
      contentType: "application/json",
      body: readFileSync("packages/villages/letter-fonts/" + name, "utf8"),
    });
  });
  const addition = {
    id: additionId,
    token: "addition",
    topic: "memories",
    title: "Add memory",
    summary: "",
    fields: [{ key: "text", label: "Memory", type: "text", value: "" }],
    source: [],
    people,
    actions: [{ id: "correct", label: "Modify" }],
    related: [],
    creating: true,
  };
  await page.route("http://repair-people.test/", (route) =>
    fulfill(route, { contentType: "text/html", body: '<div id="root"></div>' }),
  );
  await page.route("**/api/villages**", async (route) => {
    const url = new URL(route.request().url()),
      path = url.pathname.replace("/api/villages", ""),
      person = url.searchParams.get("personId");
    assert.equal(url.searchParams.has("inspection"), false, "REPAIR requests cannot carry a spoiler mode");
    calls.push({ path, person });
    if (path === "/repair")
      return reply(route, "index", {
        seed: "world",
        identity: "world-one",
        people,
        records: [],
        sceneOpen: false,
        historyOffset: 0,
        historyTotal: 1,
        history: [
          {
            id: "private-history",
            title: "Private correction",
            at: "2026-10-26T20:00:00Z",
            changes: [],
            affected: [],
            undone: false,
            canUndo: true,
          },
        ],
        checkpoints: [
          { id: "private-checkpoint", title: "Private checkpoint", at: "2026-10-26T20:00:00Z", records: 3 },
        ],
      });
    if (path === "/repair/records") {
      const details = url.searchParams.get("section") === "details";
      const rows = details
        ? [
            {
              id: "details",
              token: "details",
              topic: "people",
              title: "Nora's character context",
              summary: "Character",
              fields: [{ key: "context", label: "Context", type: "text", value: "Private character context" }],
              source: [],
              actions: [{ id: "correct", label: "Modify" }],
              related: [],
            },
            fontRecord,
          ]
        : person === "b"
          ? [record('["memory","ellis"]', person)]
          : [record(sharedId, person), record(secretId, person)];
      return reply(route, "list", {
        records: rows,
        total: rows.length,
        next: null,
        ...(!details ? { creation: addition } : {}),
      });
    }
    if (path === "/repair/record") {
      const id = url.searchParams.get("id");
      return reply(
        route,
        `record:${id}`,
        id === additionId ? addition : id === fontRecord.id ? fontRecord : record(id, person),
      );
    }
    if (path === "/repair/apply") return reply(route, "apply", { applied: true });
    if (path === "/repair/cancel") return reply(route, "cancel", { cancelled: true });
    if (["/repair/review", "/repair/undo", "/repair/restore"].includes(path)) {
      const body = route.request().postDataJSON();
      assert.equal("inspection" in body, false);
      calls.push({ path, body });
      const kind = path.endsWith("/undo") ? "undo" : path.endsWith("/restore") ? "restore" : "repair",
        creating = body.recordId === additionId;
      return reply(route, kind, {
        kind,
        id: "plan",
        token: "review-token",
        title: "Saved review",
        changes:
          kind === "restore"
            ? [{ label: "Village", before: "Current world", after: "Checkpoint world" }]
            : creating
              ? [{ label: "Memory", before: "", after: body.values.text }]
              : (body.knowers ?? ["a"]).map((id) => ({
                  label: `${people.find((p) => p.id === id).name} · memory`,
                  before: id === "player" ? known : privateText,
                  after: body.values?.text ?? "Saved inverse",
                })),
        affected: [],
        related: [],
        checkpoint: kind === "restore",
        undoAvailable: true,
        ...(kind !== "restore"
          ? { memory: { creating, people: (body.knowers ?? ["a"]).map((id) => people.find((p) => p.id === id).name) } }
          : {}),
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
const goNora = async (page) => {
  await openPeople(page);
  await page.getByRole("button", { name: "Nora", exact: true }).click();
};
const chooseEllis = async (page) => {
  await page.getByRole("button", { name: "REPAIR", exact: true }).click();
  await openPeople(page);
  await page.getByRole("button", { name: "Ellis", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Ellis", exact: true })).toBeVisible();
};
await withBrowser(browser, async () => {
  await mkdir(".build-tmp/repair-people", { recursive: true });
  await runCase("repair-people/navigation", async () => {
    for (const width of [1440, 390]) {
      const f = await fixture(width),
        { page, root } = f;
      await expect(page.getByRole("switch")).toHaveCount(0);
      await openPeople(page);
      for (const p of people) await expect(page.getByRole("button", { name: p.name, exact: true })).toBeVisible();
      await expect(root.getByText(privateText, { exact: true })).toHaveCount(0);
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
        "Search stays on one line at larger mobile font size",
      );
      await root.evaluate((el) => (el.style.fontSize = ""));
      await page.getByRole("button", { name: "Nora", exact: true }).click();
      await expect(root.getByRole("button", { name: /Nora's private recollection/ })).toBeVisible();
      await expect(root.getByRole("button", { name: /Nora's private compass/ })).toBeVisible();
      await expect(root.getByRole("button", { name: "Add memory", exact: true })).toBeEnabled();
      await expect(page.getByRole("switch")).toHaveCount(0);
      await root.screenshot({ path: `.build-tmp/repair-people/person-${width}.png` });
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
      const scope = root
        .locator(".repair-panel")
        .filter({ has: page.getByRole("heading", { name: "Applies to", exact: true }) });
      await expect(scope).toContainText("Your Persona");
      await expect(scope).toContainText("Nora");
      await expect(root.getByText(known, { exact: true })).toBeVisible();
      await expect(root.getByText(privateText, { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Back", exact: true }).click();
      await expect(field).toHaveValue("The corrected shared recollection.");
      await page.getByRole("button", { name: "Back to records", exact: true }).click();
      await page.getByRole("button", { name: "Add memory", exact: true }).click();
      await expect(page.getByRole("checkbox", { name: "Nora", exact: true })).toBeChecked();
      await expect(page.getByRole("checkbox", { name: "Your Persona", exact: true })).not.toBeChecked();
      await field.fill("A missing memory for Nora.");
      await page.getByRole("button", { name: "Review changes", exact: true }).click();
      assert.deepEqual(f.calls.findLast((call) => call.path === "/repair/review" && call.body).body.knowers, ["a"]);
      await expect(root.getByRole("region", { name: "Memory to add", exact: true })).toContainText(
        "A missing memory for Nora.",
      );
      await page.getByRole("button", { name: "Back", exact: true }).click();
      await page.getByRole("button", { name: "Back to records", exact: true }).click();
      await page.getByRole("button", { name: "Details", exact: true }).click();
      await expect(root.getByRole("button", { name: /Nora's character context/ })).toBeVisible();
      await page.getByRole("button", { name: "Memories", exact: true }).click();
      await root.getByRole("button", { name: /Nora's private compass/ }).click();
      await field.fill("Edited private compass memory.");
      await page.getByRole("button", { name: "People", exact: true }).click();
      await page.getByRole("button", { name: "Ellis", exact: true }).click();
      await expect(root).not.toContainText(secretText);
      await page.getByRole("button", { name: "People", exact: true }).click();
      await page.getByRole("button", { name: "Nora", exact: true }).click();
      await root.getByRole("button", { name: /Nora's private compass/ }).click();
      await expect(field).toHaveValue("Edited private compass memory.");
      assert.equal(await root.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), true);
      await f.close();
    }
  });
  await runCase("repair-people/letter-font", async () => {
    for (const width of [1440, 390]) {
      const f = await fixture(width),
        { page, root } = f;
      await goNora(page);
      await page.getByRole("button", { name: "Details", exact: true }).click();
      await root.getByRole("button", { name: /Nora · letter style/ }).click();
      const select = page.getByLabel("Letter style", { exact: true });
      await select.selectOption("caveat");
      await expect
        .poll(() =>
          page.evaluate(() =>
            Array.from(document.fonts).some(
              (face) => face.family === "village-letter-caveat" && face.status === "loaded",
            ),
          ),
        )
        .toBe(true);
      await expect(root.getByText("Dear friend, I hope this letter finds you well. 123")).toBeVisible();
      assert.equal(await root.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), true);
      await root.screenshot({ path: ".build-tmp/repair-people/letter-font-" + width + ".png" });
      await page.getByRole("button", { name: "Review changes", exact: true }).click();
      const sent = f.calls.findLast((call) => call.path === "/repair/review" && call.body).body;
      assert.equal(sent.values.letterFontId, "caveat");
      await f.close();
    }
  });
  await runCase("repair-people/late-responses", async () => {
    const f = await fixture(390),
      { page, root } = f;
    await goNora(page);
    const opened = f.hold(`record:${secretId}`);
    await root.getByRole("button", { name: /Nora's private compass/ }).click();
    await opened.started;
    await chooseEllis(page);
    opened.release();
    await opened.done;
    await expect(page.getByRole("heading", { name: "Ellis", exact: true })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Memory", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "People", exact: true }).click();
    await page.getByRole("button", { name: "Nora", exact: true }).click();
    await root.getByRole("button", { name: /Nora's private recollection/ }).click();
    await page.getByRole("textbox", { name: "Memory", exact: true }).fill("Pending Nora draft.");
    const review = f.hold("repair");
    await page.getByRole("button", { name: "Review changes", exact: true }).click();
    await review.started;
    await chooseEllis(page);
    review.release();
    await review.done;
    await expect(page.getByRole("heading", { name: "Ellis", exact: true })).toBeVisible();
    await expect(root).not.toContainText("Pending Nora draft.");
    for (const kind of ["undo", "restore"]) {
      await page.getByRole("button", { name: "REPAIR", exact: true }).click();
      await page
        .getByRole("button", {
          name: kind === "undo" ? "Repair history" : "Backups & repairs Review repairs, undo, or restore a checkpoint.",
          exact: true,
        })
        .click();
      await expect(root).toContainText(kind === "undo" ? "Private correction" : "Private checkpoint");
      const pending = f.hold(kind);
      await page
        .getByRole("button", { name: kind === "undo" ? "Review undo" : "Review restoration", exact: true })
        .click();
      await pending.started;
      await chooseEllis(page);
      pending.release();
      await pending.done;
      await expect(page.getByRole("heading", { name: "Ellis", exact: true })).toBeVisible();
    }
    await page.getByRole("button", { name: "REPAIR", exact: true }).click();
    await expect(page.getByRole("button", { name: "Repair history", exact: true })).toBeEnabled();
    const staleIndex = f.hold("index", { identity: "retired-world" });
    await page.getByRole("button", { name: "Repair history", exact: true }).click();
    await staleIndex.started;
    await chooseEllis(page);
    staleIndex.release();
    await staleIndex.done;
    await expect(page.getByRole("heading", { name: "Ellis", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "People", exact: true }).click();
    await page.getByRole("button", { name: "Nora", exact: true }).click();
    await root.getByRole("button", { name: /Nora's private recollection/ }).click();
    await expect(page.getByRole("textbox", { name: "Memory", exact: true })).toHaveValue("Pending Nora draft.");
    await f.close();
  });
  await runCase("repair-people/restore-draft", async () => {
    const f = await fixture(390),
      { page, root } = f;
    await page
      .getByRole("button", { name: "Backups & repairs Review repairs, undo, or restore a checkpoint.", exact: true })
      .click();
    await expect(root).toContainText("Private checkpoint");
    await page.getByRole("button", { name: "Review restoration", exact: true }).click();
    await page.getByRole("checkbox", { name: "Replace Village progress with this checkpoint", exact: true }).check();
    await page.evaluate(() => {
      window.delayRepairRefresh = new Promise((resolve) => (window.releaseRepairRefresh = resolve));
    });
    await page.getByRole("button", { name: "Restore checkpoint", exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.refreshStarted)).toBe(true);
    await expect(root.getByRole("heading", { name: "Checkpoint restored", exact: true })).toHaveCount(0);
    await expect(root.getByRole("button", { name: "Back", exact: true })).toBeDisabled();
    await expect(root.getByRole("button", { name: "Main menu", exact: true })).toBeDisabled();
    await page.evaluate(() =>
      window.releaseRepairRefresh({ title: "Previous Scene", text: "My unfinished Scene draft." }),
    );
    await expect(root.getByRole("heading", { name: "Checkpoint restored", exact: true })).toBeVisible();
    await expect(root.getByRole("textbox", { name: "Kept Scene draft", exact: true })).toHaveValue(
      "My unfinished Scene draft.",
    );
    await f.close();
  });
});
