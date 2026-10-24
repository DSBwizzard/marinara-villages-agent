import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, expect, fulfill, mockEngineLookups } from "./fixtures/browser-diagnostics.mjs";

const bundle = await build({
  stdin: {
    contents: `
import React,{useState,useCallback,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {VillageActivity,useCapabilityVisibility} from './packages/villages/src/client/shared/activity.js';
import {useVillageSnapshot,useVillagePresence,usePendingWorkPolling} from './packages/villages/src/client/shared/data-controller.js';
import {useSceneChangesPolling} from './packages/villages/src/client/features/scenes/controller-hooks.js';
import {VillagerSignature} from './packages/villages/src/client/features/residents/villages-signature.js';
import {request} from './packages/villages/src/client/shared/api.js';
function Harness(){
 const visible=useCapabilityVisibility(document.getElementById('root'));
 const {snapshot,setSnapshot,beginSnapshotRead}=useVillageSnapshot(window.initialSnapshot);
 const [room,setRoom]=useState({id:'scene',memoryMode:'live',status:'active',sceneRevision:1});
 const [viewing,setViewing]=useState(true),[busy,setBusy]=useState(false),[notices,setNotices]=useState([]),[summary,setSummary]=useState({});
 const dismissed=useRef(new Set()),session=useRef('');
 const receive=useCallback(events=>setNotices(old=>[...old,...events.filter(event=>!old.some(saved=>saved.id===event.id))]),[]);
 const unresolved=useCallback(()=>{},[]);
 useVillagePresence({visible,presenceSession:session,beginSnapshotRead,snapshot});
 useSceneChangesPolling({visible,viewing,busy,room,snapshot,dismissedRoomEventIdsRef:dismissed,receiveRoomRecordEvents:receive,setRoomNotices:setNotices,setRoomChangeStatus:setSummary,setRoomUnresolvedChanges:unresolved});
 const load=useCallback(async ({signal}={})=>{const read=beginSnapshotRead();const next=await request('',{signal});if(!signal?.aborted)read.publish(next)},[beginSnapshotRead]);
 usePendingWorkPolling({visible,backgroundPending:snapshot.backgroundWork.some(job=>['queued','running'].includes(job.status)),loadSnapshot:load});
 window.h={snapshot:setSnapshot,room:setRoom,view:setViewing,busy:setBusy};
 return <VillageActivity value={{visible,backgroundRevision:''}}><pre id='state'>{JSON.stringify({visible,notices,summary})}</pre><VillagerSignature actorId='ada' name='Ada' request={request}/></VillageActivity>;
}createRoot(document.getElementById('root')).render(<Harness/>);`,
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
try {
  const page = await browser.newPage();
  await mockEngineLookups(page);
  await page.clock.install();
  const snapshot = { isFounded: true, backgroundWork: [], sceneChanges: { sceneId: "scene", revision: "one" } };
  let feed = {
    changes: [],
    notices: [],
    dismissedNoticeIds: [],
    unresolved: [],
    nextCursor: "0:0:0",
    hasMore: false,
    processingSummary: { pending: 0, failed: 0, rejected: 0 },
    activeRequest: { status: "complete" },
    backgroundChecks: [],
  };
  let signature = { status: "idle", attempt: 0 };
  let feedFailures = 0;
  const reads = { feed: 0, signature: 0, snapshot: 0, visible: 0, hidden: 0 };
  await page.route("http://polling.test/", (route) =>
    fulfill(route, { status: 200, contentType: "text/html", body: '<div id="root" style="height:600px"></div>' }),
  );
  await page.route("**/api/villages**", (route) => {
    const path = new URL(route.request().url()).pathname;
    let json;
    if (path.endsWith("/background/presence")) {
      reads[route.request().postDataJSON().visible ? "visible" : "hidden"]++;
      json = { snapshot };
    } else if (path.includes("/changes")) {
      reads.feed++;
      if (feedFailures-- > 0) return fulfill(route, { status: 503, json: { error: "temporarily offline" } });
      json = feed;
    } else if (path.endsWith("/signature")) {
      reads.signature++;
      json = signature;
    } else {
      reads.snapshot++;
      json = snapshot;
    }
    return fulfill(route, { status: 200, json });
  });
  await page.goto("http://polling.test/");
  await page.evaluate((value) => {
    window.initialSnapshot = value;
  }, snapshot);
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await expect.poll(() => reads.feed).toBe(1);
  await expect.poll(() => reads.signature).toBe(1);
  await page.clock.runFor(120_000);
  assert.equal(reads.feed, 1, "settled Scene makes no recurring feed request");
  assert.equal(reads.signature, 1, "idle signature makes no recurring request");
  assert.equal(reads.snapshot, 0, "presence replaces duplicate idle snapshot reads");

  // Pending bookkeeping without a running owner is recoverable state, not a polling lease.
  feed = { ...feed, activeRequest: { status: "running" }, processingSummary: { pending: 1, failed: 0, rejected: 0 } };
  await page.evaluate(() => window.h.room((room) => ({ ...room, sceneRevision: 2 })));
  await expect.poll(() => reads.feed).toBe(2);
  await page.clock.runFor(30_000);
  assert.equal(reads.feed, 2, "turn recovery owns operation monitoring; the feed does not duplicate it");

  // An actual asynchronous job owns monitoring, including a final settling read.
  feed = { ...feed, backgroundChecks: [{ status: "running" }] };
  await page.evaluate(() => window.h.room((room) => ({ ...room, sceneRevision: 3 })));
  await expect.poll(() => reads.feed).toBe(3);
  feed = {
    ...feed,
    backgroundChecks: [{ status: "completed" }],
    notices: [{ id: "late", kind: "memory", text: "Saved" }],
  };
  await page.clock.runFor(1600);
  await expect(page.locator("#state")).toContainText('"id":"late"');
  await page.clock.runFor(1600);
  await expect.poll(() => reads.feed).toBe(5);
  const settled = reads.feed;
  await page.clock.runFor(30_000);
  assert.equal(reads.feed, settled, "completion stops recurring feed reads");

  // A delayed afterApply write changes the shared marker after the job is already completed.
  feed = {
    ...feed,
    processingSummary: { pending: 0, failed: 0, rejected: 0 },
    notices: [{ id: "after-apply", kind: "memory", text: "Later commit" }],
  };
  snapshot.sceneChanges.revision = "after-apply";
  await page.evaluate((value) => window.h.snapshot(value), snapshot);
  await expect(page.locator("#state")).toContainText('"id":"after-apply"');
  await page.evaluate(() => window.h.view(false));
  const left = reads.feed;
  await page.evaluate(() => window.h.room((room) => ({ ...room, sceneRevision: 4 })));
  await page.clock.runFor(10_000);
  assert.equal(reads.feed, left, "leaving the Scene stops its observation");
  await page.evaluate(() => window.h.view(true));
  await expect.poll(() => reads.feed).toBe(left + 1);

  // Engine hides its capability independently of document.visibilityState.
  await page.evaluate(() => {
    document.getElementById("root").style.display = "none";
  });
  await expect(page.locator("#state")).toContainText('"visible":false');
  await expect.poll(() => reads.hidden).toBe(1);
  const hidden = { ...reads };
  await page.clock.runFor(120_000);
  assert.deepEqual(reads, hidden, "hidden capability makes no recurring requests");
  await page.evaluate(() => {
    document.getElementById("root").style.display = "block";
  });
  await expect.poll(() => reads.visible).toBe(hidden.visible + 1);
  await expect.poll(() => reads.feed).toBe(hidden.feed + 1);
  assert.equal(reads.hidden, 1, "one withdrawal replaces repeated invisible heartbeats");

  feedFailures = 3;
  const failed = reads.feed;
  await page.evaluate(() => window.h.room((room) => ({ ...room, sceneRevision: 5 })));
  await expect.poll(() => reads.feed).toBe(failed + 1);
  await page.clock.runFor(3100);
  await expect.poll(() => reads.feed).toBe(failed + 2);
  await page.clock.runFor(3100);
  await expect.poll(() => reads.feed).toBe(failed + 3);
  await page.clock.runFor(20_000);
  assert.equal(reads.feed, failed + 3, "failed reads have bounded automatic retries");
  feedFailures = 0;
  feed = { ...feed, notices: [{ id: "focus-recovered", kind: "memory", text: "Recovered" }] };
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.locator("#state")).toContainText('"id":"focus-recovered"');

  signature = { status: "running", attempt: 1, available: true };
  const beforeSignature = reads.signature;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => reads.signature).toBe(beforeSignature + 1);
  await expect(page.getByRole("button", { name: "Generating signature…", exact: true })).toBeVisible();
  signature = { status: "saved", attempt: 1, available: true };
  await page.clock.runFor(2100);
  await expect.poll(() => reads.signature).toBe(beforeSignature + 2);
  await expect(page.getByRole("button", { name: "Generate signature", exact: true })).toBeVisible();
  await page.clock.runFor(30_000);
  assert.equal(reads.signature, beforeSignature + 2, "signature completion stops its status checks");
  await page.close();
} finally {
  await browser.close();
}
console.log("idle polling and Scene completion browser checks passed");
