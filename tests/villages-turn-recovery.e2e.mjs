import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
const bundle = await build({
  stdin: {
    contents: `
import React,{useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {useTurnRecovery} from './packages/villages/src/client/features/scenes/turn-recovery.js';
function Harness(){
 const [room,setRoom]=useState(window.initial),[draft,setDraft]=useState('sent'),[error,setError]=useState(''),[ended,setEnded]=useState(false);
 const submission=useRef('submission'),editVersion=useRef(0);
 const recovery=useTurnRecovery({room,setRoom,setRoomEnded:setEnded,setRoomError:setError,setRoomDraft:setDraft,submission,editVersion});
 window.h={begin:()=>recovery.begin('submission','sent',0),check:recovery.check,select:()=>setRoom({...room,id:'B'}),
 edit:(value)=>{editVersion.current++;setDraft(value)}};
 return <pre id='state'>{JSON.stringify({room,draft,error,ended,status:recovery.status,pending:recovery.pending,submission:submission.current})}</pre>;
}createRoot(document.getElementById('root')).render(<Harness/>);
`,
    loader: "tsx",
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
const initial = { id: "A", sceneRevision: 1, status: "active", lines: [], submissions: [] };
try {
  // Hook state is viewport-independent; packaged layout suites retain desktop/phone coverage.
  for (const width of [1366]) {
    for (const mode of [
      "receipt",
      "error",
      "clarify",
      "stale-clarify",
      "draft",
      "same-draft",
      "selection",
      "unknown",
    ]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await mockEngineLookups(page);
      let scene = structuredClone(initial),
        unavailable = true;
      const requests = [],
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.route("http://recovery.test/", (r) =>
        fulfill(r, { status: 200, contentType: "text/html", body: '<div id="root"></div>' }),
      );
      await page.route("**/api/villages/**", (r) => {
        requests.push(r.request().method());
        if (unavailable) return fulfill(r, { status: 503, json: { error: "offline" } });
        const path = new URL(r.request().url()).pathname;
        return fulfill(r, {
          status: 200,
          json: path.includes("/operations/")
            ? { operation: scene.operation }
            : path.includes("/archive/")
              ? { visit: scene }
              : { session: scene },
        });
      });
      await page.goto("http://recovery.test/");
      await page.evaluate((value) => (window.initial = value), initial);
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      await expect(page.locator("#state")).toContainText('"pending":false');
      if (mode === "unknown") await page.clock.install();
      await page.evaluate(() => window.h.begin());
      await expect(page.locator("#state")).toContainText("Reconnecting");
      if (mode === "draft") await page.evaluate(() => window.h.edit("new draft"));
      if (mode === "same-draft") await page.evaluate(() => window.h.edit("sent"));
      if (mode === "selection") await page.evaluate(() => window.h.select());
      if (mode === "unknown") {
        await page.clock.fastForward(65000);
        await expect(page.locator("#state")).toContainText("outcome unknown");
      }
      unavailable = false;
      scene = { ...initial, sceneRevision: 2 };
      if (mode === "error")
        scene.operation = { id: "submission", status: "complete", error: "Confirmed validation failure" };
      else if (mode === "clarify")
        scene.attentionClarification = {
          id: "submission",
          message: "sent",
          question: "Which surface?",
          choices: [],
        };
      else scene.submissions = [{ id: "submission" }];
      if (mode === "stale-clarify") {
        scene.attentionClarification = {
          id: "old-submission",
          message: "sent",
          question: "Which surface?",
          choices: [],
        };
        scene.submissions = [];
        await page.evaluate(() => window.h.check());
        await expect(page.locator("#state")).toContainText('"pending":true');
        const current = JSON.parse(await page.locator("#state").textContent());
        assert.equal(current.submission, "submission");
        scene.attentionClarification = undefined;
        scene.submissions = [{ id: "submission" }];
      }
      await page.evaluate(() => window.h.check());
      if (mode === "selection") {
        await expect(page.locator("#state")).toContainText('"id":"B"');
      } else {
        await expect(page.locator("#state")).toContainText('"pending":false');
        const state = JSON.parse(await page.locator("#state").textContent());
        assert.equal(
          state.draft,
          mode === "draft"
            ? "new draft"
            : mode === "clarify" || mode === "error" || mode === "same-draft"
              ? "sent"
              : "",
        );
        assert.equal(state.error, mode === "error" ? "Confirmed validation failure" : "");
        if (mode !== "error") assert.equal(state.submission, null);
      }
      assert(requests.length > 0);
      assert(
        requests.every((method) => method === "GET"),
        "reconciliation never sends another turn",
      );
      assert.deepEqual(errors, []);
      await page.close();
    }
  }
  console.log(
    "Turn recovery: failed reads, terminal failures, clarification, timeout/manual check, newer drafts and selection fences passed at desktop/mobile widths.",
  );
} finally {
  await browser.close();
}
