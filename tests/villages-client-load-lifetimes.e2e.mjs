import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { expect } from "./fixtures/fast-browser-expect.mjs";

const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useVillageSnapshot, useLoadVillageSnapshot, useVillagePresence } from './packages/villages/src/client/shared/data-controller.js';
import { useResidentPortraits } from './packages/villages/src/client/features/residents/workflow-controller.js';
function Harness() {
 const owner = useVillageSnapshot(window.seed), [error,setError] = useState('');
 const [wanted,setWanted] = useState(window.wanted), [portraits,setPortraits] = useState({}), [,redraw] = useState(0);
 const portraitsAsked = useRef(new Set()), presenceSession = useRef('');
 const load = useLoadVillageSnapshot({setError,beginSnapshotRead:owner.beginSnapshotRead});
 useVillagePresence({visible:document.visibilityState==='visible',presenceSession,beginSnapshotRead:owner.beginSnapshotRead,snapshot:window.presence?owner.snapshot:null});
 useResidentPortraits({portraitWanted:wanted,portraitsAsked,setPortraits});
 const launch = work => {window.pending.push(work());return window.pending.length-1};
 window.h = {load:options=>launch(()=>load(options||{})),abortLoad:()=>{window.abortRead=new AbortController();return launch(()=>load({signal:window.abortRead.signal}))},cancel:()=>window.abortRead.abort(),publish:owner.setSnapshot,error:setError,wanted:setWanted,redraw:()=>redraw(n=>n+1)};
 return <pre id="state">{JSON.stringify({snapshot:owner.snapshot,error,portraits,wanted})}</pre>;
}
window.pending=[];
const root=createRoot(document.getElementById('root'));
window.unmount=()=>root.render(null);
root.render(window.strict?<StrictMode><Harness/></StrictMode>:<Harness/>);
`,
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
});
const seed = {
  isFounded: true,
  village: { name: "initial" },
  backgroundWork: [{ kind: "resident-planning", attempt: 3 }],
};
const browser = await chromium.launch({ headless: true });
async function mount({ strict = false, width = 1280, presence = false, wanted = "" } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 844 }, hasTouch: width === 390 });
  await mockEngineLookups(page);
  const requests = [],
    errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("http://client-loads.test/", (route) =>
    fulfill(route, { contentType: "text/html", body: '<div id="root"></div>' }),
  );
  await page.route("**/api/**", (route) => {
    const request = route.request(),
      path = new URL(request.url()).pathname,
      body = request.postDataJSON();
    const entry = { route, path, body, method: request.method() };
    requests.push(entry);
    if (path.endsWith("/presence") && body.visible === false) return fulfill(route, { json: {} });
  });
  // Keep heartbeat scheduling explicit: native observer delivery can race held responses.
  await page.addInitScript(() => {
    window.IntersectionObserver = class {
      observe() {}
      disconnect() {}
    };
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
  });
  await page.goto("http://client-loads.test/");
  await page.evaluate((options) => Object.assign(window, options), { seed, strict, presence, wanted });
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await expect(page.locator("#state")).toBeVisible();
  const state = async () => JSON.parse(await page.locator("#state").textContent());
  const launch = (kind, force = false) => page.evaluate(({ kind, force }) => window.h[kind](force), { kind, force });
  const settle = (index) => page.evaluate((index) => window.pending[index], index);
  const reply = async (entry, json, status = 200) => {
    try {
      await fulfill(entry.route, { status, json });
    } catch (error) {
      if (!/closed|cancel|abort/i.test(error.message)) throw error;
    }
  };
  return {
    page,
    requests,
    state,
    launch,
    settle,
    reply,
    finish: async () => {
      assert.deepEqual(errors, []);
      await page.close();
    },
  };
}
await withBrowser(browser, async () => {
  for (const strict of [false, true]) {
    for (const boundary of ["newer-read", "save", "reset", "stale-error", "dispose"]) {
      const f = await mount({ strict });
      const old = await f.launch("load");
      await expect.poll(() => f.requests.length).toBe(1);
      if (boundary === "newer-read") {
        const next = await f.launch("load");
        await expect.poll(() => f.requests.length).toBe(2);
        await f.reply(f.requests[1], { ...seed, village: { name: "newer-read" } });
        await f.settle(next);
      } else if (boundary === "dispose") await f.page.evaluate(() => window.unmount());
      else {
        await f.page.evaluate((name) => {
          window.h.publish({ ...window.seed, isFounded: name !== "reset", village: { name } });
          window.h.error("new owner");
        }, boundary);
      }
      await f.reply(
        f.requests[0],
        boundary === "stale-error" ? { error: "old failure" } : { ...seed, village: { name: "old" } },
        boundary === "stale-error" ? 503 : 200,
      );
      await f.settle(old);
      if (boundary === "dispose") await expect(f.page.locator("#state")).toHaveCount(0);
      else {
        assert.equal((await f.state()).snapshot.village.name, boundary);
        if (boundary !== "newer-read") assert.equal((await f.state()).error, "new owner");
        if (boundary === "reset") assert.equal((await f.state()).snapshot.isFounded, false);
      }
      assert.equal(
        f.requests.length,
        boundary === "newer-read" ? 2 : 1,
        "Publishing state never automatically repeats reads",
      );
      await f.finish();
    }
    // A slow read can publish while a later request is still pending or unsuccessful.
    for (const later of ["pending", "quiet-failure", "failure", "abort"]) {
      const f = await mount({ strict });
      const first = await f.launch("load");
      await expect.poll(() => f.requests.length).toBe(1);
      const second = await f.launch(later === "abort" ? "abortLoad" : "load", { quiet: later === "quiet-failure" });
      await expect.poll(() => f.requests.length).toBe(2);
      if (later === "abort") {
        await f.page.evaluate(() => window.h.cancel());
        await f.settle(second);
      } else if (later.endsWith("failure")) {
        await f.reply(f.requests[1], { error: "newer read failed" }, 503);
        await f.settle(second);
      }
      await f.reply(f.requests[0], { ...seed, village: { name: "slow success" } });
      await f.settle(first);
      assert.equal(
        (await f.state()).snapshot.village.name,
        "slow success",
        "A pending, failed or aborted newer request cannot starve successful reads",
      );
      assert.equal((await f.state()).error, "");
      if (later === "pending") {
        await f.reply(f.requests[1], { ...seed, village: { name: "later success" } });
        await f.settle(second);
        assert.equal((await f.state()).snapshot.village.name, "later success");
      }
      await f.finish();
    }
  }
  for (const mode of ["invisible", "failed", "no-snapshot"]) {
    const f = await mount();
    const read = await f.launch("load");
    await expect.poll(() => f.requests.length).toBe(1);
    await f.page.evaluate((mode) => {
      if (mode === "invisible")
        Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
      window.presence = true;
      window.h.redraw();
    }, mode);
    if (mode === "invisible") {
      await f.page.evaluate(() => new Promise(requestAnimationFrame));
      assert(!f.requests.some((r) => r.path.endsWith("/presence")), "hidden capabilities do not start a lease");
    } else {
      await expect.poll(() => f.requests.some((r) => r.path.endsWith("/presence"))).toBe(true);
      for (const r of f.requests.filter((r) => r.path.endsWith("/presence")))
        await f.reply(r, mode === "failed" ? { error: "presence failed" } : {}, mode === "failed" ? 503 : 200);
      await f.page.evaluate(() => new Promise(requestAnimationFrame));
      assert(
        !f.requests.some((r) => r.path.endsWith("/reconcile")),
        "an empty presence response does not start duplicate reconciliation",
      );
    }
    await f.reply(f.requests[0], { ...seed, village: { name: "valid read" } });
    await f.settle(read);
    assert.equal(
      (await f.state()).snapshot.village.name,
      "valid read",
      "A heartbeat without a successful publication cannot discard a pending read",
    );
    await f.finish();
  }
  for (const mode of ["newer-read", "reset-presence"]) {
    const f = await mount({ presence: true });
    await expect.poll(() => f.requests.filter((r) => r.path.endsWith("/presence")).length).toBeGreaterThan(0);
    if (mode === "newer-read") {
      const index = await f.launch("load");
      await expect.poll(() => f.requests.some((r) => r.path === "/api/villages")).toBe(true);
      await f.reply(
        f.requests.find((r) => r.path === "/api/villages"),
        { ...seed, village: { name: "new read" } },
      );
      await f.settle(index);
      for (const r of f.requests.filter((r) => r.path.endsWith("/presence")))
        await f.reply(r, { snapshot: { ...seed, village: { name: "old heartbeat" } } });
      await f.page.evaluate(() => new Promise(requestAnimationFrame));
      assert.equal((await f.state()).snapshot.village.name, "new read");
    } else {
      await f.page.evaluate(() => window.h.publish({ ...window.seed, isFounded: false, village: { name: "reset" } }));
      await expect.poll(() => f.requests.some((r) => r.body?.visible === false)).toBe(true);
      for (const r of f.requests.filter((r) => r.path.endsWith("/presence") && r.body?.visible))
        await f.reply(r, { snapshot: seed });
      await f.page.evaluate(() => new Promise(requestAnimationFrame));
      assert.equal((await f.state()).snapshot.isFounded, false);
      assert.equal(
        f.requests.filter((r) => r.path === "/api/villages").length,
        0,
        "Retired presence cannot publish or launch an extra read",
      );
    }
    await f.finish();
  }
  for (const width of [1280, 390])
    for (const strict of [false, true]) {
      const f = await mount({ width, strict, wanted: "A" });
      await expect.poll(() => f.requests.length).toBeGreaterThan(0);
      await f.page.evaluate(() => window.h.wanted("A\nB"));
      await expect.poll(() => f.requests.some((r) => r.body?.ids?.includes("B"))).toBe(true);
      const batch = f.requests.findLast((r) => r.body?.ids?.includes("B"));
      assert.deepEqual(batch.body.ids, ["A", "B"], "Aborted A remains eligible in the replacement batch");
      await f.reply(batch, [{ id: "A", avatarUrl: "/A.png" }]);
      await expect.poll(async () => (await f.state()).portraits.A?.url).toBe("/A.png");
      const count = f.requests.length;
      await f.page.evaluate(() => window.h.wanted(""));
      await expect.poll(async () => (await f.state()).wanted).toBe("");
      await f.page.evaluate(() => window.h.wanted("A\nB"));
      await expect.poll(async () => (await f.state()).wanted).toBe("A\nB");
      await f.page.evaluate(() => new Promise(requestAnimationFrame));
      assert.equal(f.requests.length, count, "Completed portraits and confirmed absence remain cached");
      await f.finish();
    }
});
console.log(
  "Client loads: snapshot read/save/reset/disposal ordering, retired presence, and portrait cancellation/cache passed (mounted hooks, synthetic HTTP, desktop/phone and StrictMode).",
);
