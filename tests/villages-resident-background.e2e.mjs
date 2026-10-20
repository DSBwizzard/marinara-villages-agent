// Test cases: residents/background/desktop, residents/background/phone
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { build } from "esbuild";
import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `
import {createRoot} from 'react-dom/client';import {useState,StrictMode} from 'react';
import {RosterScreen} from './packages/villages/src/client/features/residents/RosterScreen.tsx';
import {ResidentBackgroundReview} from './packages/villages/src/client/shared/ResidentBackgroundReview.tsx';
import {WorldOriginSettings} from './packages/villages/src/client/features/settings/WorldOriginSettings.tsx';
import {VILLAGES_FORGING_STYLES} from './packages/villages/src/client/features/founding/villages-forging-styles.ts';
const defaults={historyMode:'continue',storyRole:'unspecified',background:'',customDescription:''};
function App(){const [roster,setRoster]=useState(false);const [context,setContext]=useState(()=>JSON.parse(localStorage.getItem('draft')||'null')||defaults),[open,setOpen]=useState(false),[initial,setInitial]=useState(false),[source,setSource]=useState({setting:'A harbor town',premise:'Visitors arrive through a portal.',worldOrigin:'different-worlds'});
window.changeSource=()=>setSource(s=>({...s,premise:'A new premise'}));window.context=context;window.source=source;
const change=value=>{localStorage.setItem('draft',JSON.stringify(value));setContext(value)};
const entry={id:"mara",name:"Mara",summary:"Guard",tags:[],inVillage:false};
if(roster)return <><style>{VILLAGES_FORGING_STYLES}</style><RosterScreen controller={{busy:false,catalog:[entry],visibleCatalog:[entry],error:"",menuPage:"villagers",openPerson:()=>{},pickerOpen:true,portraits:{},rosterSearch:"",screen:"menu",search:"",setMenuPage:()=>{},setPickerOpen:()=>{},setRosterSearch:()=>{},setSearch:()=>{},snapshot:{villagers:[],settings:{setting:source.setting,foundingDetails:source.premise,worldOrigin:source.worldOrigin}},addVillager:async(id,revision,context)=>{(window.admissions??=[]).push({id,revision,context});if(window.failAdmission){window.failAdmission=false;throw Error('Synthetic admission failure')}window.rosterAccepted=context;return true}}}/></>;
return <><style>{VILLAGES_FORGING_STYLES}</style><button onClick={()=>setRoster(true)}>Test move-in</button><WorldOriginSettings initial={source.worldOrigin} onSaved={saved=>setSource(s=>({...s,worldOrigin:saved.settings.worldOrigin}))}/>
<button onClick={()=>{change({...defaults,integration:{text:'',direction:'',accepted:false}});setInitial(true);setOpen(true)}}>Select Mara</button>
<button onClick={()=>{setInitial(false);setOpen(true)}}>Edit background</button>
{open?<ResidentBackgroundReview name='Mara' characterId='mara' source={source} context={context} initialRequest={initial} onChange={change} onAccept={value=>{change(value);window.accepted=value;setOpen(false)}} onCancel={()=>setOpen(false)}/>:null}</>}
createRoot(document.getElementById('root')).render(<StrictMode><App/></StrictMode>);`,
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
try {
  for (const [width, height] of [
    [1366, 900],
    [390, 844],
  ]) {
    await runCase(width >= 600 ? "residents/background/desktop" : "residents/background/phone", async () => {
      const context = await browser.newContext({
        viewport: { width, height },
        isMobile: width < 600,
        hasTouch: width < 600,
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const saved = new Map();
      let calls = 0,
        failResponse = false,
        hold = false,
        release;
      await page.route("http://background.test/", (route) =>
        route.fulfill({
          contentType: "text/html",
          body: '<meta name="viewport" content="width=device-width, initial-scale=1"><div id="root"></div>',
        }),
      );
      await page.route("**/api/villages/**", async (route) => {
        if (/\/characters\/[^/]+\/sprites\/setup(?:\/save)?$/.test(new URL(route.request().url()).pathname))
          return route.fulfill({
            contentType: "application/json",
            body: JSON.stringify({
              revision: 1,
              manager: { version: 1, artwork: [], expressions: [], assignments: [], framing: { mode: "full" } },
              files: [],
              assignments: [],
              suggestions: [],
              defaultArtworkId: "",
              useSprites: false,
              errors: {},
              analysisRequests: [],
              resident: false,
              residentToken: "",
            }),
          });
        const input = route.request().postDataJSON();
        if (route.request().url().endsWith("/settings"))
          return route.fulfill({
            contentType: "application/json",
            body: JSON.stringify({ settings: { worldOrigin: input.worldOrigin } }),
          });
        let text = saved.get(input.actionId);
        if (!text) {
          assert.equal(input.retrieveOnly, false);
          calls++;
          text = "Mara came to the harbor following a lead about her missing brother. She has stayed three weeks.";
          saved.set(input.actionId, text);
        }
        if (hold) {
          hold = false;
          await new Promise((resolve) => {
            release = resolve;
          });
        }
        if (failResponse) {
          failResponse = false;
          return route.abort();
        }
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ text }) });
      });
      const load = async () => {
        await page.goto("http://background.test/");
        await page.addScriptTag({ content: bundle.outputFiles[0].text });
      };
      await load();
      await page.getByLabel("Character origins", { exact: true }).selectOption("same-world");
      await expect.poll(() => page.evaluate(() => window.source.worldOrigin)).toBe("same-world");
      await page.getByRole("button", { name: "Select Mara", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Mara’s life here", exact: true });
      const text = dialog.getByLabel("Mara backstory", { exact: true });
      await expect(text).toHaveValue(/following a lead/);
      await expect(dialog.getByRole("button", { name: "Accept", exact: true })).toBeEnabled();
      await expect(dialog.getByRole("button", { name: "Retrieve result", exact: true })).toHaveCount(0);
      const bounds = await dialog.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width + 1);
      assert.ok(await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1));
      if (process.env.VILLAGES_SCREENSHOT_DIR) {
        mkdirSync(process.env.VILLAGES_SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({
          path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `resident-background-${width}.png`),
        });
      }
      await dialog.getByRole("button", { name: "Accept", exact: true }).click();
      assert.equal(await page.evaluate(() => window.accepted.historyMode), "adapt");
      await page.getByRole("button", { name: "Edit background", exact: true }).click();
      assert.equal(calls, 1, "editing does not generate");
      await text.fill("A manually authored background.");
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await page.getByRole("button", { name: "Edit background", exact: true }).click();
      await expect(text).toHaveValue("A manually authored background.");
      hold = true;
      await dialog.getByRole("button", { name: "Try again", exact: true }).click();
      await expect.poll(() => typeof release).toBe("function");
      await text.fill("My edits while the proposal is running.");
      release();
      await expect(dialog.getByRole("button", { name: "Accept", exact: true })).toBeEnabled();
      await expect(text).toHaveValue("My edits while the proposal is running.");
      hold = true;
      release = undefined;
      await dialog.getByRole("button", { name: "Try again", exact: true }).click();
      await expect.poll(() => typeof release).toBe("function");
      await page.evaluate(() => window.changeSource());
      release();
      await expect(dialog.getByRole("button", { name: "Accept", exact: true })).toBeEnabled();
      await expect(text).toHaveValue("My edits while the proposal is running.");
      // A response can be paid and saved even when the browser never receives it.
      failResponse = true;
      await dialog.getByRole("button", { name: "Try again", exact: true }).click();
      await expect(dialog.getByRole("alert")).toBeVisible();
      const count = calls;
      await load();
      await page.getByRole("button", { name: "Edit background", exact: true }).click();
      await dialog.getByRole("button", { name: "Retrieve result", exact: true }).click();
      await expect(text).toHaveValue(/following a lead/);
      assert.equal(calls, count, "restored request retrieves saved text without another provider call");
      await text.fill(" ");
      await expect(dialog.getByRole("button", { name: "Accept", exact: true })).toBeDisabled();
      await text.fill("Mara stays here while searching.");
      await dialog.getByRole("button", { name: "Accept", exact: true }).click();
      assert.equal(await page.evaluate(() => window.accepted.integration.accepted), true);
      await page.getByRole("button", { name: "Test move-in", exact: true }).click();
      await page.getByRole("button", { name: "Move in", exact: true }).click();
      await expect(text).toHaveValue(/following a lead/);
      await text.fill("A canceled move-in keeps this background.");
      const paidBeforeCancel = calls;
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await page.getByRole("button", { name: "Move in", exact: true }).click();
      await expect(text).toHaveValue("A canceled move-in keeps this background.");
      assert.equal(calls, paidBeforeCancel, "reopening a canceled move-in does not spend again");
      await dialog.getByRole("button", { name: "Accept", exact: true }).click();
      assert.equal(
        await page.evaluate(() => window.rosterAccepted),
        undefined,
        "background acceptance precedes roster mutation",
      );
      await page.evaluate(() => {
        window.failAdmission = true;
      });
      await page
        .getByRole("dialog", { name: "Mara sprite setup" })
        .getByRole("button", { name: "Add without using sprites", exact: true })
        .click();
      const sprites = page.getByRole("dialog", { name: "Mara sprite setup" });
      await expect(sprites.getByRole("alert")).toContainText("Synthetic admission failure");
      assert.equal(calls, paidBeforeCancel, "admission failure never regenerates the background");
      await sprites.getByRole("button", { name: "Add without using sprites", exact: true }).click();
      await expect
        .poll(() => page.evaluate(() => window.rosterAccepted?.integration?.text))
        .toBe("A canceled move-in keeps this background.");
      const admissions = await page.evaluate(() => window.admissions);
      assert.deepEqual(admissions[0], admissions[1], "admission retry retains accepted background and sprite revision");
      assert.equal(calls, paidBeforeCancel, "admission retry never regenerates the background");
      assert.equal(
        await page.evaluate(() => window.rosterAccepted.integration.text),
        "A canceled move-in keeps this background.",
      );
      assert.deepEqual(errors, []);
      await context.close();
    });
  }
  console.log(
    "Resident background review: desktop/phone, settings, manual editing, stale replies and restored paid results passed.",
  );
} finally {
  await browser.close();
}
