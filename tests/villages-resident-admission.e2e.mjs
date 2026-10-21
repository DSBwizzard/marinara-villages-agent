// Test cases: residents/admission/desktop, residents/admission/phone
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { build } from "esbuild";
import { chromium, expect } from "@playwright/test";
const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `
import {createRoot} from 'react-dom/client';import {StrictMode} from 'react';
import {RosterScreen} from './packages/villages/src/client/features/residents/RosterScreen.tsx';
import {VILLAGES_FORGING_STYLES} from './packages/villages/src/client/features/founding/villages-forging-styles.ts';
const entry={id:'buster',name:'Buster',summary:'Boxer',tags:[],inVillage:false};
const controller={busy:false,catalog:[entry],visibleCatalog:[entry],error:'',menuPage:'villagers',openPerson:()=>{},pickerOpen:true,portraits:{},rosterSearch:'',screen:'menu',search:'',setMenuPage:()=>{},setPickerOpen:()=>{},setRosterSearch:()=>{},setSearch:()=>{},snapshot:{villagers:[],settings:{setting:'A town in Othiras',foundingDetails:'',worldName:'Othiras'}},addVillager:async(id,revision,admission)=>{(window.admissions??=[]).push({id,revision,admission});if(window.failAdmission){window.failAdmission=false;throw Error('Synthetic admission failure')}window.savedAdmission=admission;return true}};
createRoot(document.getElementById('root')).render(<StrictMode><style>{VILLAGES_FORGING_STYLES}</style><RosterScreen controller={controller}/></StrictMode>);`,
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
  ])
    await runCase(width > 600 ? "residents/admission/desktop" : "residents/admission/phone", async () => {
      const context = await browser.newContext({
        viewport: { width, height },
        isMobile: width < 600,
        hasTouch: width < 600,
      });
      try {
        const page = await context.newPage(),
          errors = [],
          unexpected = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.route("http://admission.test/", (route) =>
          route.fulfill({
            contentType: "text/html",
            body: '<meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div>',
          }),
        );
        await page.route("**/api/connections", (route) =>
          route.fulfill({ contentType: "application/json", body: "[]" }),
        );
        await page.route("**/api/villages/**", (route) => {
          if (/\/characters\/buster\/sprites\/setup(?:\/save)?$/.test(new URL(route.request().url()).pathname))
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
          unexpected.push(route.request().url());
          return route.abort();
        });
        await page.goto("http://admission.test/");
        await page.addScriptTag({ content: bundle.outputFiles[0].text });
        const move = page.getByRole("button", { name: "Move in", exact: true });
        await move.click();
        let dialog = page.getByRole("dialog", { name: "Buster in your Village", exact: true });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByLabel("Buster homeworld", { exact: true })).toHaveValue("");
        await expect(dialog.getByLabel("Buster starting note", { exact: true })).toHaveCount(0);
        const addNote = dialog.getByRole("button", { name: "+ Add starting note", exact: true });
        const buttonStyle = (button) =>
          button.evaluate((node) => {
            const style = getComputedStyle(node);
            return [style.backgroundColor, style.borderColor, style.borderRadius, style.fontFamily];
          });
        assert.deepEqual(
          await buttonStyle(addNote),
          await buttonStyle(dialog.getByRole("button", { name: "Cancel", exact: true })),
        );
        await dialog.getByRole("button", { name: "Help: Buster homeworld", exact: true }).click();
        const homeworldHelp = page.getByRole("dialog", { name: "Buster homeworld", exact: true });
        await expect(homeworldHelp).toContainText("without assuming the characters know each other");
        await homeworldHelp.press("Escape");
        await expect(homeworldHelp).toHaveCount(0);
        await expect(dialog).toBeVisible();
        await dialog.getByLabel("Buster homeworld", { exact: true }).fill(" Koront ");
        await addNote.click();
        await dialog.getByLabel("Buster starting note", { exact: true }).fill("Temporary note");
        await dialog.getByRole("button", { name: "Remove note", exact: true }).click();
        await expect(dialog.getByLabel("Buster starting note", { exact: true })).toHaveCount(0);
        await addNote.click();
        await expect(dialog.getByLabel("Buster starting note", { exact: true })).toHaveValue("");
        await dialog.getByLabel("Buster starting note", { exact: true }).fill(" Already living here. ");
        await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
        assert.equal(await page.evaluate(() => window.admissions?.length ?? 0), 0);
        await move.click();
        dialog = page.getByRole("dialog", { name: "Buster in your Village", exact: true });
        await expect(dialog.getByLabel("Buster starting note", { exact: true })).toHaveValue(" Already living here. ");
        const box = await dialog.boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= width + 1);
        await page.screenshot({ path: ".build-tmp/resident-admission-" + width + ".png" });
        await dialog.getByRole("button", { name: "Continue", exact: true }).click();
        let sprites = page.getByRole("dialog", { name: "Buster sprite setup", exact: true });
        await expect(sprites).toBeVisible();
        await sprites.getByRole("button", { name: "Back", exact: true }).click();
        assert.equal(await page.evaluate(() => window.admissions?.length ?? 0), 0);
        await move.click();
        dialog = page.getByRole("dialog", { name: "Buster in your Village", exact: true });
        await expect(dialog.getByLabel("Buster homeworld", { exact: true })).toHaveValue("Koront");
        await dialog.getByRole("button", { name: "Continue", exact: true }).click();
        sprites = page.getByRole("dialog", { name: "Buster sprite setup", exact: true });
        await page.evaluate(() => (window.failAdmission = true));
        await sprites.getByRole("button", { name: "Add without sprites", exact: true }).click();
        await expect(sprites.getByRole("alert")).toContainText("Synthetic admission failure");
        await sprites.getByRole("button", { name: "Add without sprites", exact: true }).click();
        await expect
          .poll(() => page.evaluate(() => window.savedAdmission))
          .toEqual({ homeworld: "Koront", startingSituation: "Already living here." });
        const admissions = await page.evaluate(() => window.admissions);
        assert.deepEqual(admissions[0], admissions[1]);
        await move.click();
        dialog = page.getByRole("dialog", { name: "Buster in your Village", exact: true });
        await expect(dialog.getByLabel("Buster homeworld", { exact: true })).toHaveValue("");
        await dialog.getByRole("button", { name: "Continue", exact: true }).click();
        await page
          .getByRole("dialog", { name: "Buster sprite setup", exact: true })
          .getByRole("button", { name: "Add without sprites", exact: true })
          .click();
        await expect
          .poll(() => page.evaluate(() => window.savedAdmission))
          .toEqual({ homeworld: "", startingSituation: "" });
        assert.deepEqual(unexpected, [], "no model or proposal endpoint was requested");
        assert.deepEqual(errors, []);
      } finally {
        await context.close();
      }
    });
} finally {
  await browser.close();
}
console.log(
  "Admission UI: desktop/phone, blank notes, cancellation, sprite handoff, retry and no proposal requests passed.",
);
