import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { build } from "esbuild";
import { resolve } from "node:path";
import { snapshot as fixture } from "./fixtures/villages-scene-browser.fixture.mjs";
import { verifySettingsRequestLifetimes } from "./fixtures/villages-settings-request-lifetime.fixture.mjs";
import { verifyVenueMutationLifetimes } from "./fixtures/villages-venue-mutation-lifetime.fixture.mjs";
import { verifyVenueRequestLifetimes } from "./fixtures/villages-venue-request-lifetime.fixture.mjs";

function initialSnapshot() {
  const snapshot = structuredClone(fixture);
  Object.assign(snapshot.settings, {
    promptKnowledge: "Saved knowledge",
    playerPersonaId: "saved-persona",
    setting: "Saved setting",
    selectedLorebookIds: ["saved-book"],
    loreTokenBudget: 1600,
    sceneryArtStyle: "Saved scenery",
    personalizeVenueImagesByDefault: true,
    useVisualLoreByDefault: true,
  });
  return snapshot;
}
const bundle = await build({
  stdin: {
    contents: `
    import {createRoot} from 'react-dom/client';
    import {useState} from 'react';
    import {useSettingsState} from './packages/villages/src/client/features/settings/useSettingsState.js';
    import {useSettingsDraftSession} from './packages/villages/src/client/features/settings/draft-session.js';
    import {useSaveSettings} from './packages/villages/src/client/features/settings/actions.js';
    import {useScenesOpenMenu} from './packages/villages/src/client/shell/navigation-actions.js';
    import {useLoadPersonas} from './packages/villages/src/client/shared/data-controller.js';
    function Harness() {
      const settings=useSettingsState();
      const [snapshot,setSnapshot]=useState(window.initialSnapshot);
      const [screen,setScreen]=useState('home'); const [menuPage,setMenuPage]=useState('index');
      const [sceneryStyle,setSceneryStyle]=useState(''); const [personalizeHomes,setPersonalizeHomes]=useState(true);
      const [visualLoreDefault,setVisualLoreDefault]=useState(true); const [venuesDraft,setVenuesDraft]=useState([]);
      const [busy,setBusy]=useState(false); const [personas,setPersonas]=useState([]);
      const unused=()=>{};
      const session=useSettingsDraftSession({...settings,snapshot,setSceneryStyle,setPersonalizeHomes,setVisualLoreDefault,setVenuesDraft});
      const loadPersonas=useLoadPersonas({setError:unused,setPersonaDraft:settings.setPersonaDraft,setPersonas});
      const open=useScenesOpenMenu({snapshot,screen,menuPage,setScreen,setMenuPage,openSettings:session.openSettings,
        loadCatalog:async()=>{},loadLorebooks:async()=>{},loadPersonas,loadProgressDebug:async()=>{},setFocusedRequestId:unused,
        setSiteProjectId:unused,setSettingsError:settings.setSettingsError});
      const save=useSaveSettings({...settings,snapshot,setBusy,setSnapshot,acceptSavedSettings:session.acceptSavedSettings});
      window.settingsHarness={settings,open,save:()=>{const promise=save(); (window.pendingSettingsSaves??=[]).push(promise); return promise;},setSnapshot,setBusy,loadPersonas,setSceneryStyle,setPersonalizeHomes,setVisualLoreDefault,setVenuesDraft};
      return <pre id='state'>{JSON.stringify({knowledge:settings.knowledgeDraft,persona:settings.personaDraft,lore:settings.lorebookDraft,
        budget:settings.loreTokenBudgetDraft,setting:settings.settingDraft,scenery:sceneryStyle,personalizeHomes,visualLoreDefault,
        venues:venuesDraft,founded:snapshot.isFounded,screen,menuPage,busy,error:settings.settingsError,personas:personas.length})}</pre>;
    }
    const root=createRoot(document.getElementById('root'));
    window.mountSettings=()=>root.render(<Harness/>); window.unmountSettings=()=>root.render(null); window.mountSettings();
  `,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
async function checkHooks(width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const requests = [],
    errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("http://settings-hooks.test/", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: '<div id="root"></div>' }),
  );
  await page.route("**/api/villages**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/personas"))
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ personas: [{ id: "active-persona", name: "Active", isActive: true }] }),
      });
    if (path.endsWith("/settings") && route.request().method() === "PATCH") {
      requests.push(route);
      return;
    }
    throw Error(`Unexpected Settings request: ${path}`);
  });
  const snapshot = initialSnapshot();
  await page.goto("http://settings-hooks.test/");
  await page.evaluate((initial) => (window.initialSnapshot = initial), snapshot);
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  const state = () => page.locator("#state").textContent().then(JSON.parse);
  const call = (op) => page.evaluate(op);
  const open = async (tab) => {
    await page.evaluate((tab) => window.settingsHarness.open(tab), tab);
    await expect.poll(async () => (await state()).menuPage).toBe(tab);
  };
  const respond = async (index, response, status = 200, saveIndex = index, idle = true) => {
    const completed = page.waitForResponse((r) => r.url().endsWith("/settings"));
    await requests[index].fulfill({ status, contentType: "application/json", body: JSON.stringify(response) });
    await (await completed).finished();
    await page.evaluate((index) => window.pendingSettingsSaves[index], saveIndex);
    if (idle) await expect.poll(async () => (await state()).busy).toBe(false);
  };
  await open("village");
  await expect.poll(async () => (await state()).personas).toBe(1);
  assert.equal((await state()).knowledge, "Saved knowledge");
  assert.equal((await state()).persona, "saved-persona");
  await call(() => {
    const h = window.settingsHarness;
    h.settings.setKnowledgeDraft("Retained unsaved knowledge");
    h.settings.setPersonaDraft("");
    h.settings.setLorebookDraft(["edited-book"]);
    h.setSceneryStyle("Retained scenery");
    h.setPersonalizeHomes(false);
    h.setVisualLoreDefault(false);
    h.setVenuesDraft((current) =>
      current.map((venue, index) => (index ? venue : { ...venue, name: "Retained Venue draft" })),
    );
  });
  await expect.poll(async () => (await state()).knowledge).toBe("Retained unsaved knowledge");
  for (let i = 0; i < 2; i++) {
    await open("index");
    await open("village");
  }
  assert.equal((await state()).knowledge, "Retained unsaved knowledge");
  assert.equal((await state()).persona, "", "catalog loading must preserve an explicit None selection");
  assert.deepEqual((await state()).lore, ["edited-book"]);
  assert.equal((await state()).scenery, "Retained scenery");
  assert.equal((await state()).personalizeHomes, false);
  assert.equal((await state()).visualLoreDefault, false);
  assert.equal((await state()).venues[0].name, "Retained Venue draft");
  assert.equal(requests.length, 0, "navigation and editing never save automatically");

  const changed = structuredClone(snapshot);
  Object.assign(changed.settings, {
    setting: "Updated saved setting",
    promptKnowledge: "Externally saved knowledge",
    loreTokenBudget: 2200,
  });
  await page.evaluate((next) => window.settingsHarness.setSnapshot(next), changed);
  assert.equal(
    (await state()).knowledge,
    "Retained unsaved knowledge",
    "an incoming snapshot cannot reseed an open form",
  );
  await open("index");
  await open("village");
  assert.equal((await state()).setting, "Updated saved setting");
  assert.equal((await state()).budget, 2200, "untouched fields refresh on reopening");
  assert.equal((await state()).knowledge, "Retained unsaved knowledge");

  await call(() => void window.settingsHarness.save());
  await expect.poll(() => requests.length).toBe(1);
  assert.deepEqual(requests[0].request().postDataJSON(), {
    promptKnowledge: "Retained unsaved knowledge",
    playerPersonaId: "",
    setting: "Updated saved setting",
    selectedLorebookIds: ["edited-book"],
    loreTokenBudget: 2200,
  });
  await call(() => window.settingsHarness.settings.setKnowledgeDraft("Newer edit during save"));
  const saved = structuredClone(changed);
  Object.assign(saved.settings, {
    promptKnowledge: "Canonical saved knowledge",
    playerPersonaId: "",
    selectedLorebookIds: ["canonical-book"],
    loreTokenBudget: 2300,
  });
  await respond(0, saved);
  assert.equal(
    (await state()).knowledge,
    "Newer edit during save",
    "a completed save cannot overwrite a newer field edit",
  );
  assert.deepEqual((await state()).lore, ["canonical-book"]);
  assert.equal((await state()).budget, 2300);
  await open("index");
  await open("village");
  assert.equal((await state()).knowledge, "Newer edit during save");
  assert.equal((await state()).scenery, "Retained scenery");

  await call(() => void window.settingsHarness.save());
  await expect.poll(() => requests.length).toBe(2);
  await respond(1, { error: "Settings unavailable" }, 500);
  assert.equal((await state()).knowledge, "Newer edit during save");
  assert.match((await state()).error, /Settings unavailable/);
  assert.equal(requests.length, 2, "failure does not retry the request");

  const reset = { ...structuredClone(snapshot), isFounded: false };
  const beginSave = async () => {
    const requestIndex = requests.length;
    const saveIndex = await call(() => {
      const index = window.pendingSettingsSaves?.length ?? 0;
      void window.settingsHarness.save();
      return index;
    });
    await expect.poll(() => requests.length).toBe(requestIndex + 1);
    return { requestIndex, saveIndex };
  };
  const replaceWorld = async (knowledge) => {
    await page.evaluate((next) => window.settingsHarness.setSnapshot(next), reset);
    await expect.poll(async () => (await state()).founded).toBe(false);
    const next = structuredClone(snapshot);
    next.settings.promptKnowledge = knowledge;
    await page.evaluate((next) => window.settingsHarness.setSnapshot(next), next);
    await expect.poll(async () => (await state()).founded).toBe(true);
    await open("index");
    await open("village");
    return next;
  };
  const held = await beginSave();
  await call(() => {
    void window.settingsHarness.save();
    void window.settingsHarness.save();
  });
  assert.equal(requests.length, held.requestIndex + 1, "duplicate calls cannot dispatch another pending save");
  await page.evaluate((next) => window.settingsHarness.setSnapshot(next), reset);
  await expect.poll(async () => (await state()).founded).toBe(false);
  await call(() => window.settingsHarness.settings.setSettingsError("Reset owner marker"));
  await respond(held.requestIndex, saved, 200, held.saveIndex, false);
  assert.equal((await state()).founded, false, "a retired save cannot restore the reset world");
  assert.equal(
    (await state()).knowledge,
    "Newer edit during save",
    "a retired save cannot acknowledge old draft fields",
  );
  assert.equal((await state()).error, "Reset owner marker");
  assert.equal((await state()).busy, true, "a retired save cannot clear another operation busy state");
  await call(() => window.settingsHarness.setBusy(false));

  for (const failOld of [false, true]) {
    await replaceWorld("World A");
    const a = await beginSave();
    const bSnapshot = await replaceWorld("World B");
    const b = await beginSave();
    await call(() => window.settingsHarness.settings.setSettingsError("World B marker"));
    await respond(
      a.requestIndex,
      failOld ? { error: "Old save failed" } : saved,
      failOld ? 500 : 200,
      a.saveIndex,
      false,
    );
    assert.equal((await state()).knowledge, "World B");
    assert.equal((await state()).error, "World B marker");
    assert.equal((await state()).busy, true, "old completion cannot release the newer pending save");
    const accepted = structuredClone(bSnapshot);
    accepted.settings.promptKnowledge = "World B canonical";
    await respond(b.requestIndex, accepted, 200, b.saveIndex);
    assert.equal((await state()).knowledge, "World B canonical");
    const before = requests.length;
    await call(() => void window.settingsHarness.save());
    await expect.poll(() => requests.length).toBe(before + 1);
    const retryIndex = await call(() => window.pendingSettingsSaves.length - 1);
    await respond(before, accepted, 200, retryIndex);
  }

  const disposed = await beginSave();
  await call(() => window.unmountSettings());
  await expect(page.locator("#state")).toHaveCount(0);
  await call(() => window.mountSettings());
  await open("village");
  const remounted = await beginSave();
  await respond(disposed.requestIndex, saved, 200, disposed.saveIndex, false);
  assert.equal((await state()).knowledge, "Saved knowledge");
  assert.equal((await state()).busy, true, "disposal cleanup cannot release the remounted save");
  await respond(remounted.requestIndex, snapshot, 200, remounted.saveIndex);

  await page.evaluate((next) => window.settingsHarness.setSnapshot(next), reset);
  await open("index");
  const newWorld = structuredClone(snapshot);
  newWorld.settings.promptKnowledge = "New world knowledge";
  await page.evaluate((next) => window.settingsHarness.setSnapshot(next), newWorld);
  await open("village");
  assert.equal((await state()).knowledge, "New world knowledge", "reset retires the former draft baseline");
  await call(() => window.unmountSettings());
  await expect(page.locator("#state")).toHaveCount(0);
  await call(() => window.mountSettings());
  await open("village");
  assert.equal((await state()).knowledge, "Saved knowledge", "unmount/reload starts a fresh draft session");
  await call(() => window.settingsHarness.settings.setPersonaDraft(""));
  await call(() => window.settingsHarness.loadPersonas());
  await expect
    .poll(async () => (await state()).persona)
    .toBe("active-persona", "founding retains its explicit default active-Persona choice");
  assert.deepEqual(errors, []);
  await page.close();
}

async function checkPackage(width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } }),
    errors = [],
    scenerySaves = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const snapshot = initialSnapshot();
  await page.route("**/api/villages**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/settings") && route.request().method() === "PATCH") {
      scenerySaves.push(route);
      return;
    }
    if (route.request().method() !== "GET" && !path.endsWith("/presence") && !path.endsWith("/reconcile"))
      throw Error(`Unexpected mutation: ${path}`);
    const body =
      path === "/api/villages" || path.endsWith("/snapshot") || path.endsWith("/reconcile")
        ? snapshot
        : path.endsWith("/background")
          ? { work: [] }
          : path.endsWith("/personas")
            ? { personas: [] }
            : path.endsWith("/lorebooks")
              ? { books: [] }
              : path.endsWith("/connections")
                ? { systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" }
                : path.endsWith("/settings/writing")
                  ? {
                      styleText: "",
                      preferredLength: "medium",
                      preferredTense: "present",
                      extraGuidance: "",
                      residentGuidance: {},
                    }
                  : {};
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.route("**/api/connections", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ id: "talk", provider: "language", name: "Talk", defaultForAgents: true }]),
    }),
  );
  await page.route("http://settings-package.test/", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<style>html,body{margin:0;width:100%;height:100%}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
    }),
  );
  await page.goto("http://settings-package.test/");
  await page.addScriptTag({ path: resolve("packages/villages/client.js") });
  await page.getByRole("button", { name: /^(Open settings menu|More)$/ }).click();
  await page.getByRole("button", { name: "General Settings", exact: true }).click();
  await page.getByRole("button", { name: "Village Settings", exact: true }).click();
  await page.getByLabel("The information villagers know", { exact: true }).fill("Packaged retained draft");
  await page.getByRole("button", { name: "Back to menu", exact: true }).click();
  await page.getByRole("button", { name: "General Settings", exact: true }).click();
  await page.getByRole("button", { name: "Village Settings", exact: true }).click();
  await expect(page.getByLabel("The information villagers know", { exact: true })).toHaveValue(
    "Packaged retained draft",
  );
  await page.getByLabel("Scenery style description", { exact: true }).fill("Packaged scenery save");
  await page.getByLabel("Personalize new venue images by default", { exact: true }).uncheck();
  await page.getByLabel("Use visual lore by default", { exact: true }).check();
  await page.getByRole("button", { name: "Save scenery settings", exact: true }).click();
  await expect.poll(() => scenerySaves.length).toBe(1);
  assert.deepEqual(scenerySaves[0].request().postDataJSON(), {
    sceneryArtStyle: "Packaged scenery save",
    personalizeVenueImagesByDefault: false,
    useVisualLoreByDefault: true,
  });
  await expect(page.getByRole("button", { name: "Save scenery settings", exact: true })).toBeDisabled();
  await page.getByLabel("Scenery style description", { exact: true }).fill("Newer packaged scenery draft");
  await page.getByRole("button", { name: "Back to menu", exact: true }).click();
  const saved = structuredClone(snapshot);
  Object.assign(saved.settings, scenerySaves[0].request().postDataJSON());
  await scenerySaves[0].fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(saved) });
  await page.getByRole("button", { name: "Village Settings", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save scenery settings", exact: true })).toBeEnabled();
  await expect(page.getByLabel("Scenery style description", { exact: true })).toHaveValue(
    "Newer packaged scenery draft",
  );
  assert.equal(scenerySaves.length, 1);
  assert.deepEqual(errors, []);
  await page.close();
}
try {
  for (const width of [1366, 390]) {
    await checkHooks(width);
    await checkPackage(width);
  }
  await verifySettingsRequestLifetimes(browser);
  await verifyVenueMutationLifetimes(browser);
  await verifyVenueRequestLifetimes(browser);
  console.log(
    "Mocked desktop/mobile Settings draft navigation, save acknowledgement, reset and explicit Persona choices passed.",
  );
} finally {
  await browser.close();
}
