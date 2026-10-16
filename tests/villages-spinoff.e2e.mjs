import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { build } from "esbuild";
import { chromium, expect } from "@playwright/test";

const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `
    import {createRoot} from 'react-dom/client';
    import {useContext,useState} from 'react';
    import {SpinoffPanel,SpinoffActionContext,SpinoffErrorContext} from './packages/villages/src/client/features/scenes/SpinoffPanel.js';
    const scene={id:'source',status:'active',sceneRevision:3,activeIds:['buster'],participants:[{characterId:'buster',name:'Buster'}]};
    const element=document.getElementById('root');
    element.capabilityProps={startScene:async options=>{window.startOptions=options; await fetch('/api/villages/test/claim'); return {chatId:'engine'}},openChat:id=>{window.openedChat=id}};
    function SceneContents(){const start=useContext(SpinoffActionContext);const error=useContext(SpinoffErrorContext);return <><output id="spinoff-error-state">{error}</output><button role="menuitem" disabled={!start} onClick={start}>Start a spinoff</button><button>Walk to another venue</button></>}
    function App(){const [locked,setLocked]=useState(false);const [activeScene,setActiveScene]=useState({...scene,placeName:"The Mill"});window.changeScene=()=>setActiveScene({...scene,id:"second",placeName:"The Harbour"});return <div style={{position:'relative',height:'100vh'}}><SpinoffPanel element={element} scene={activeScene} onLocked={setLocked} onResolved={async()=>{window.returned=true}}><div inert={locked}><SceneContents/></div></SpinoffPanel></div>}
    let root=createRoot(element);window.remount=()=>{root.unmount();root=createRoot(element);root.render(<App/>)};root.render(<App/>);
  `,
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
});
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
await mkdir(".build-tmp/spinoff", { recursive: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let spinoff = null;
    let failRead = false;
    const selections = [];
    await page.route("https://spinoff.test/", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: '<style>body{margin:0;background:#171923;color:white;font:16px Arial}button,select,textarea{font:inherit;max-width:100%}p,blockquote{overflow-wrap:anywhere}</style><div id="root"></div>',
      }),
    );
    await page.route("**/api/villages/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/active") && failRead)
        return route.fulfill({ status: 503, json: { error: "Spinoff source Scene read failed." } });
      if (path.endsWith("/begin"))
        spinoff = {
          id: "spinoff",
          sessionId: "source",
          residentName: "Buster",
          anchoredAt: "2026-10-15T23:30:00Z",
          chatId: null,
          status: "prepared",
          summary: "",
          eligibility: "unreviewed",
          explanation: "",
          memories: [],
          acceptedIds: [],
        };
      if (path.endsWith("/test/claim")) {
        spinoff.status = "running";
        spinoff.chatId = "engine";
      }
      if (path.endsWith("/prepare")) {
        spinoff.eligibility = "compatible";
        spinoff.explanation = "The complete outing fits this Village encounter.";
        spinoff.memories = [
          {
            id: "m1",
            text: "At the shrine, you stayed beside Buster as he spoke about his father.",
            evidence: [{ id: "e1", quote: "Thank you for listening." }],
          },
          {
            id: "m2",
            text: "Buster enjoyed choosing apples with you.",
            evidence: [{ id: "e2", quote: "These apples remind me of home." }],
          },
        ];
      }
      if (path.endsWith("/resolve")) {
        const body = route.request().postDataJSON();
        selections.push(body.acceptedIds);
        spinoff.status = "resolved";
        spinoff.acceptedIds = body.acceptedIds;
      }
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ spinoff }) });
    });
    await page.goto("https://spinoff.test/");
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await page.getByRole("menuitem", { name: "Start a spinoff", exact: true }).click();
    await expect(page.getByText("Spinoffs are freeform side stories", { exact: false })).toBeVisible();
    await page.getByLabel("Spinoff idea").fill("A short outing to the old shrine");
    await page.getByRole("button", { name: "Continue in Engine", exact: true }).click();
    await expect(page.getByRole("button", { name: "Go to spinoff", exact: true })).toBeVisible();
    assert.equal(await page.evaluate(() => window.startOptions.data.spinoffId), "spinoff");
    assert.equal(
      await page
        .getByRole("button", { name: "Walk to another venue", includeHidden: true })
        .evaluate((node) => !!node.closest("[inert]")),
      true,
    );
    await page.getByRole("button", { name: "Go to spinoff", exact: true }).click();
    assert.equal(await page.evaluate(() => window.openedChat), "engine");
    await page.getByRole("button", { name: "Browse Villages read-only" }).click();
    await expect(page.getByRole("button", { name: "Walk to another venue" })).toBeVisible();
    await page.getByRole("button", { name: "Return to spinoff controls" }).click();
    spinoff.status = "returned";
    spinoff.summary = "The original Engine recap remains available for review.";
    await page.getByRole("button", { name: "Check for return" }).click();
    await page.getByRole("button", { name: "Prepare memories", exact: false }).click();
    await expect(page.getByRole("checkbox")).toHaveCount(2);
    await page.getByRole("checkbox").nth(1).uncheck();
    await page.getByText("Supporting conversation", { exact: true }).first().click();
    await expect(page.getByText("Thank you for listening.", { exact: true })).toBeVisible();
    await page.screenshot({ path: `.build-tmp/spinoff/return-${width}.png`, fullPage: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "review fits viewport");
    await page.getByRole("button", { name: "Save selected memories and return" }).click();
    await expect(page.getByRole("menuitem", { name: "Start a spinoff", exact: true })).toBeVisible();
    assert.deepEqual(selections, [["m1"]]);
    // A saved subset survives remount after a partial application failure.
    spinoff.status = "returned";
    spinoff.selectionIds = ["m1"];
    await page.evaluate(() => window.remount());
    await expect(page.getByRole("checkbox").first()).toBeChecked();
    await expect(page.getByRole("checkbox").nth(1)).not.toBeChecked();
    await expect(page.getByRole("checkbox").first()).toBeDisabled();
    await expect(page.getByRole("button", { name: "Keep this spinoff separate and return" })).toBeDisabled();
    await page.getByRole("button", { name: "Save selected memories and return" }).click();
    assert.deepEqual(selections, [["m1"], ["m1"]]);
    failRead = true;
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(page.locator("#spinoff-error-state")).toContainText("Spinoff source Scene read failed.");
    failRead = false;
    await page.evaluate(() => window.changeScene());
    await expect(page.locator("#spinoff-error-state")).toBeEmpty();
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(
  "Spinoff launch, Engine navigation, player occupation, evidence review, partial-selection recovery and return passed on desktop and phone (mocked host/APIs).",
);
