import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { build } from "esbuild";
import { snapshot as fixture } from "./fixtures/villages-scene-browser.fixture.mjs";

// Actual Settings UI/start-over hook with mocked HTTP and synthetic device-local data.
const bundle = await build({
  stdin: {
    resolveDir: process.cwd(),
    loader: "tsx",
    contents: `
    import {createRoot} from 'react-dom/client';
    import {useCallback,useRef,useState} from 'react';
    import {renderGeneralSettingsPage} from './packages/villages/src/client/features/settings/GeneralSettingsPage.js';
    import {useFoundingStartOver} from './packages/villages/src/client/features/founding/setup-controller.js';
    function Harness(){
      const [snapshot,setSnapshot]=useState(window.initialSnapshot);
      const [busy,setBusy]=useState(false),[resetArmed,setResetArmed]=useState(false),[settingsError,setSettingsError]=useState('');
      const [opened,setOpened]=useState(false),[draftReady,setDraftReady]=useState(false),[savedDraft,setSavedSetupDraft]=useState({retained:true});
      const draftRevision=useRef(9),draftSaveQueue=useRef(Promise.resolve());
      const openSetup=useCallback(()=>setOpened(true),[]);
      const startOver=useFoundingStartOver({draftRevision,draftSaveQueue,openSetup,setBusy,setCatalog:()=>{},setDraftReady,setResetArmed,setSavedSetupDraft,setSettingsError,setSnapshot});
      return <>{renderGeneralSettingsPage({backgroundPanel:null,busy,resetArmed,setResetArmed,settingsError,snapshot,startOver,
        saveCharacterSpeechColors:async()=>{},saveSendOnEnter:async()=>{},saveStoryPace:async()=>{},saveVisitRetention:async()=>{}})}
        <pre id='state'>{JSON.stringify({founded:snapshot.isFounded,busy,opened,draftReady,savedDraft,revision:draftRevision.current})}</pre></>;
    }
    createRoot(document.getElementById('root')).render(<Harness/>);
  `,
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const browser = await chromium.launch({
  headless: true,
});
try {
  for (const width of [1366, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    const errors = [];
    let resets = 0;
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("http://reset.test/", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: '<div id="root"></div>' }),
    );
    await page.route("**/api/**", (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path === "/api/villages/setup/reset") {
        resets++;
        if (resets === 1)
          return route.fulfill({
            status: 403,
            contentType: "text/plain",
            body: "The review gateway blocked POST /api/villages/setup/reset. Report this action in its Codex chat.",
          });
        if (resets === 2)
          return route.fulfill({ status: 200, contentType: "text/html", body: "<html>Broken response</html>" });
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...fixture, isFounded: false }),
        });
      }
      if (path === "/api/villages/connections")
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            systemConnectionId: "",
            narrationConnectionId: "",
            imageConnectionId: "__villages_image_disabled__",
          }),
        });
      if (path === "/api/connections")
        return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      throw Error("Unexpected reset fixture request: " + path);
    });
    await page.goto("http://reset.test/");
    await page.evaluate(async (initial) => {
      window.initialSnapshot = initial;
      const db = await new Promise((resolve) => {
        const open = indexedDB.open("villages-founding-v2", 1);
        open.onupgradeneeded = () => open.result.createObjectStore("drafts");
        open.onsuccess = () => resolve(open.result);
      });
      await new Promise((resolve) => {
        const tx = db.transaction("drafts", "readwrite");
        tx.objectStore("drafts").put({ revision: 9, data: { name: "Retained draft" } }, "/api/villages");
        tx.oncomplete = resolve;
      });
      db.close();
    }, structuredClone(fixture));
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const state = () => page.locator("#state").textContent().then(JSON.parse);
    const stored = () =>
      page.evaluate(async () => {
        const db = await new Promise((resolve) => {
          const open = indexedDB.open("villages-founding-v2", 1);
          open.onsuccess = () => resolve(open.result);
        });
        const record = await new Promise((resolve) => {
          const get = db.transaction("drafts").objectStore("drafts").get("/api/villages");
          get.onsuccess = () => resolve(get.result);
        });
        db.close();
        return record;
      });
    const reset = page.getByRole("button", { name: "Reset the village and start over", exact: true });
    await reset.click();
    assert.equal(resets, 0, "Arming reset never deletes data");
    await page.getByRole("button", { name: "Keep it", exact: true }).click();
    assert.equal(resets, 0);
    for (let attempt = 1; attempt <= 3; attempt++) {
      await reset.click();
      await page.getByRole("button", { name: "Yes, empty the village", exact: true }).click();
      await expect.poll(async () => !(await state()).busy).toBe(true);
      assert.equal(resets, attempt, "No automatic reset retry");
      if (attempt < 3) {
        await expect(
          page
            .getByRole("alert")
            .filter({ hasText: attempt === 1 ? "review gateway blocked" : "invalid or empty JSON response" }),
        ).toBeVisible();
        assert.equal((await state()).founded, true);
        assert.equal((await state()).opened, false);
        assert.equal((await stored()).data.name, "Retained draft");
      } else {
        await expect.poll(async () => (await state()).opened).toBe(true);
        assert.equal((await state()).founded, false);
        assert.equal((await state()).revision, 0);
        assert.equal(await stored(), undefined);
      }
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(
  "Mocked reset browser coverage passed at 1366/390/320px: confirmation, actionable alerts, failed/malformed response retains draft, successful reset clears draft and opens founding.",
);
