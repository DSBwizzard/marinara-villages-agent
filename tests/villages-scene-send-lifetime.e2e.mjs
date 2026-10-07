import assert from "node:assert/strict";
import { resolve } from "node:path";
import { build } from "esbuild";
import { chromium, expect } from "@playwright/test";
import { snapshot } from "./fixtures/villages-scene-browser.fixture.mjs";
const bundle = await build({
  stdin: {
    contents: `
import {createRoot} from 'react-dom/client';
import {StrictMode,useEffect,useRef,useState} from 'react';
import {useSceneRecord} from './packages/villages/src/client/features/scenes/useSceneRecord.js';
import {useSendRoom} from './packages/villages/src/client/features/scenes/actions.js';
const noop=()=>{};
function scene(id){return {id,version:1,sceneRevision:0,placeId:'mill',placeName:id,zoneId:'exterior',area:'public',
status:'active',startedAt:'2026-10-07T00:00:00Z',lastActivityAt:'2026-10-07T00:00:00Z',endedAt:'',participants:[],activeIds:[],lines:[],submissions:[]};}
function Harness(){
 const [room,setRoom]=useSceneRecord();
 const [draft,setDraft]=useState('A draft'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[ended,setEnded]=useState(false);
 const [screen,setScreen]=useState('room'),[mode,setMode]=useState('chat'),[target,setTarget]=useState(''),[snapshot,setSnapshot]=useState(window.snapshot);
 const inFlight=useRef(false),submission=useRef(null),completion=useRef(null),events=useRef(new Set());
 const send=useSendRoom({room,roomBusy:busy,roomDraft:draft,roomEnded:ended,roomMode:mode,roomTargetId:target,roomContactBoundary:'',roomContactKind:'knock',
 snapshot,roomCompletionRef:completion,roomSendInFlightRef:inFlight,roomSubmissionIdRef:submission,seenRoomEventIdsRef:events,
 loadSnapshot:async()=>{window.loads++},receiveRoomRecordEvents:noop,setLastSceneEnding:noop,setRoom,setRoomBusy:setBusy,setRoomContactKind:noop,
 setRoomDraft:setDraft,setRoomEnded:setEnded,setRoomError:setError,setRoomGreetingNotice:noop,setRoomMode:setMode,setRoomNotices:noop,
 setRoomOpen:noop,setRoomRuling:noop,setRoomTargetId:setTarget,setScreen});
 useEffect(()=>setRoom(scene('A')),[]);
 window.h={send:()=>{const promise=send();(window.promises??=[]).push(promise);return promise},setRoom,setDraft,setBusy,setSnapshot,scene,inFlight,submission,completion,
 select:(id='B',newOwner=false)=>{setRoom(scene(id));setDraft(id+' draft');if(newOwner){setBusy(true);inFlight.current=true;submission.current=id+' submission';completion.current={roomId:id,submissionId:id+' submission'}}},setMode};
 return <pre id='state'>{JSON.stringify({id:room?.id,revision:room?.sceneRevision,draft,busy,error,screen,mode,target,founded:snapshot?.isFounded,ended})}</pre>;
}
const root=createRoot(document.getElementById('root'));window.loads=0;window.unmount=()=>root.render(null);root.render(window.strict?<StrictMode><Harness/></StrictMode>:<Harness/>);
`,
    loader: "tsx",
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});

const browser = await chromium.launch({
  headless: true,
  args: ["--log-file=" + resolve(".build-tmp/scene-send-lifetime-chromium.log")],
});
function scene(id, submissions = []) {
  return {
    id,
    version: 1,
    sceneRevision: 2,
    placeId: "mill",
    placeName: id,
    zoneId: "exterior",
    area: "public",
    status: "active",
    startedAt: "2026-10-07T00:00:00Z",
    lastActivityAt: "2026-10-07T00:00:00Z",
    endedAt: "",
    participants: [],
    activeIds: [],
    lines: [],
    submissions,
  };
}
async function mount({
  width,
  strict,
  hold = "turn",
  rejectTurn = false,
  archive = false,
  close = false,
  missingClosed = false,
  hydrate = false,
  learnedRecovery = "",
}) {
  const page = await browser.newPage({ viewport: { width, height: 900 } }),
    requests = [],
    held = [],
    errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const submissions = new Map();
  let holdB = false;
  let activeReads = 0;
  await page.route("http://send-hooks.test/", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: '<div id="root"></div>' }),
  );
  await page.route("**/api/villages**", (route) => {
    const path = new URL(route.request().url()).pathname,
      body = route.request().postDataJSON();
    const id =
      body?.sessionId ??
      (path.includes("/archive/") ? path.split("/").at(-1) : /\/rooms\/([^/]+)\//.exec(path)?.[1]) ??
      "A";
    if (path.endsWith("/turn")) submissions.set(id, body.submissionId);
    requests.push({ path, id, body });
    const kind = path.endsWith("/activity")
      ? "activity"
      : path.endsWith("/turn")
        ? "turn"
        : path.endsWith("/operation")
          ? "operation"
          : path.includes("/operations/")
            ? "recovery-operation"
            : path.endsWith("/active")
              ? "active"
              : path.includes("/archive/")
                ? "archive"
                : "unknown";
    if ((id === "A" && kind === hold) || (id === "B" && kind === "turn" && holdB)) {
      held.push({ route, id, kind });
      return;
    }
    if (kind === "turn" && rejectTurn)
      return route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: "Synthetic lost reply" }),
      });
    if (learnedRecovery && kind === "active") {
      activeReads++;
      if (activeReads > 1 && learnedRecovery === "unavailable")
        return route.fulfill({
          status: 502,
          contentType: "application/json",
          body: '{"error":"Synthetic read failure"}',
        });
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ session: { ...scene(id), sceneRevision: activeReads === 1 ? 10 : 2 } }),
      });
    }
    if (learnedRecovery && kind === "archive")
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          visit: {
            ...scene(id, learnedRecovery === "recovered-older" ? [{ id: submissions.get(id) }] : []),
            status: learnedRecovery === "recovered-older" ? "closed" : "active",
          },
        }),
      });
    const saved = scene(id, [{ id: submissions.get(id) ?? "saved", at: "2026-10-07T00:00:00Z" }]);
    if (close) saved.status = "closed";
    const answer =
      kind === "turn"
        ? { session: saved, recordEvents: [], verdict: { reason: id + " accepted" }, action: null }
        : kind === "operation" || kind === "recovery-operation"
          ? { operation: null }
          : kind === "active"
            ? { session: archive ? null : missingClosed ? { ...saved, status: "closed", submissions: [] } : saved }
            : kind === "archive"
              ? { visit: missingClosed ? { ...saved, status: "closed" } : saved }
              : {};
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(answer) });
  });
  await page.goto("http://send-hooks.test/");
  await page.evaluate(
    (value) => {
      window.snapshot = value.hydrate ? null : value.snapshot;
      window.loadedSnapshot = value.snapshot;
      window.strict = value.strict;
    },
    { snapshot: structuredClone(snapshot), strict, hydrate },
  );
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  const state = () => page.locator("#state").textContent().then(JSON.parse),
    refs = () =>
      page.evaluate(() => ({
        flight: window.h.inFlight.current,
        submission: window.h.submission.current,
        completion: window.h.completion.current,
      }));
  await expect(page.locator("#state")).toContainText('"id":"A"');
  const send = async () => {
    const index = await page.evaluate(() => {
      const index = window.promises?.length ?? 0;
      window.h.send();
      return index;
    });
    return index;
  };
  const settle = (index) => page.evaluate((index) => window.promises[index], index);
  const release = async (id = "A", status = 200) => {
    const at = held.findIndex((item) => item.id === id);
    assert(at >= 0);
    const item = held.splice(at, 1)[0],
      saved = scene(id, [{ id: submissions.get(id) ?? "saved", at: "2026-10-07T00:00:00Z" }]);
    if (close) saved.status = "closed";
    const body =
      status !== 200
        ? { error: "Synthetic retired error" }
        : item.kind === "turn"
          ? { session: saved, recordEvents: [], verdict: { reason: id + " accepted" }, action: null }
          : item.kind === "active"
            ? { session: archive ? null : saved }
            : item.kind === "archive"
              ? { visit: missingClosed ? { ...saved, status: "closed" } : saved }
              : {};
    await item.route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  };
  return {
    page,
    requests,
    held,
    errors,
    state,
    refs,
    send,
    settle,
    release,
    holdB() {
      holdB = true;
    },
  };
}
try {
  for (const width of [390, 1440])
    for (const strict of [false, true]) {
      for (const stage of ["activity", "operation", "turn", "recovery-operation", "active", "archive"]) {
        const f = await mount({
          width,
          strict,
          hold: stage,
          rejectTurn: stage.startsWith("recovery") || stage === "active" || stage === "archive",
          archive: stage === "archive",
        });
        try {
          const pending = await f.send();
          await expect.poll(() => f.held.length).toBe(1);
          const count = f.requests.length;
          await f.page.evaluate(() => window.h.select("B", true));
          await expect(f.page.locator("#state")).toContainText('"id":"B"');
          await f.release();
          await f.settle(pending);
          const state = await f.state();
          assert.equal(state.id, "B");
          assert.equal(state.draft, "B draft");
          assert.equal(state.busy, true);
          assert.equal(state.error, "");
          assert.deepEqual(await f.refs(), {
            flight: true,
            submission: "B submission",
            completion: { roomId: "B", submissionId: "B submission" },
          });
          assert.equal(f.requests.length, count, "retired continuation must not begin another request");
          assert.deepEqual(f.errors, []);
        } finally {
          await f.page.close();
        }
      }
      for (const stage of ["activity", "turn"]) {
        const f = await mount({ width, strict, hold: stage });
        try {
          const old = await f.send();
          await expect.poll(() => f.held.length).toBe(1);
          await f.page.evaluate(() => window.h.select());
          await expect(f.page.locator("#state")).toContainText('"id":"B"');
          f.holdB();
          const current = await f.send();
          await expect.poll(() => f.held.length).toBe(2);
          await expect(f.page.locator("#state")).toContainText('"busy":true');
          const before = await f.refs();
          await f.release("A", 502);
          await f.settle(old);
          assert.equal((await f.state()).id, "B");
          assert.equal((await f.state()).busy, true);
          assert.deepEqual(await f.refs(), before);
          await f.release("B");
          await f.settle(current);
          assert.equal((await f.state()).id, "B");
          assert.equal((await f.state()).busy, false);
          assert.equal(f.requests.filter((row) => row.id === "B" && row.path.endsWith("/turn")).length, 1);
          assert.deepEqual(f.errors, []);
        } finally {
          await f.page.close();
        }
      }
      const callback = await mount({ width, strict, hold: "unused" });
      try {
        await callback.page.evaluate(() => {
          window.oldSend = window.h.send;
          window.h.select();
        });
        await expect(callback.page.locator("#state")).toContainText('"id":"B"');
        await callback.page.evaluate(() => window.h.select("A"));
        await expect(callback.page.locator("#state")).toContainText('"id":"A"');
        await callback.page.evaluate(() => window.oldSend());
        assert.equal(callback.requests.length, 0, "retained callback cannot join a later same-ID selection");
        const pending = await callback.send();
        await callback.settle(pending);
        assert.equal((await callback.state()).busy, false);
        assert.equal(callback.requests.filter((row) => row.path.endsWith("/turn")).length, 1);
      } finally {
        await callback.page.close();
      }
      for (const retirement of ["reset", "unmount"]) {
        const f = await mount({ width, strict, hold: "activity" });
        try {
          const pending = await f.send();
          await expect.poll(() => f.held.length).toBe(1);
          if (retirement === "unmount") await f.page.evaluate(() => window.unmount());
          else {
            await f.page.evaluate(() => window.h.setSnapshot({ ...window.snapshot, isFounded: false }));
            await expect(f.page.locator("#state")).toContainText('"founded":false');
            await f.page.evaluate(() => {
              window.h.setSnapshot(window.snapshot);
              window.h.setRoom({ ...window.h.scene("A"), sceneRevision: 17 });
              window.h.setDraft("Fresh A draft");
            });
            await expect(f.page.locator("#state")).toContainText('"revision":17');
          }
          await f.release();
          await f.settle(pending);
          assert.equal(f.requests.length, 1, "retired preflight admits no turn");
          if (retirement === "reset") {
            assert.equal((await f.state()).revision, 17);
            assert.equal((await f.state()).draft, "Fresh A draft");
          }
          assert.deepEqual(f.errors, []);
        } finally {
          await f.page.close();
        }
      }
      for (const close of [false, true]) {
        const f = await mount({ width, strict, hold: "turn", close });
        try {
          const pending = await f.send();
          await expect.poll(() => f.held.length).toBe(1);
          await f.page.evaluate(() => {
            window.h.setRoom({ ...window.h.scene("A"), sceneRevision: 10 });
            window.h.setDraft("New same-Scene draft");
          });
          await expect(f.page.locator("#state")).toContainText('"revision":10');
          await f.release();
          await f.settle(pending);
          assert.equal((await f.state()).revision, 10, "same-Scene revision reducer remains authoritative");
          assert.equal((await f.state()).draft, "New same-Scene draft");
          assert.equal((await f.state()).busy, false);
          assert.equal((await f.refs()).flight, false);
          if (close) {
            assert.equal((await f.state()).ended, true);
            assert.equal((await f.refs()).completion.roomId, "A");
          } else assert.equal((await f.refs()).completion, null);
          assert.deepEqual(f.errors, []);
        } finally {
          await f.page.close();
        }
      }
      const closedRecovery = await mount({ width, strict, hold: "archive", rejectTurn: true, missingClosed: true });
      try {
        const pending = await closedRecovery.send();
        await expect.poll(() => closedRecovery.held.length).toBe(1);
        assert.equal((await closedRecovery.state()).busy, true);
        await closedRecovery.release();
        await closedRecovery.settle(pending);
        assert.equal((await closedRecovery.state()).id, "A");
        assert.equal(
          (await closedRecovery.state()).ended,
          true,
          "intermediate closed lookup must not retire its own successful recovery",
        );
        assert.equal((await closedRecovery.state()).busy, false);
        assert.equal((await closedRecovery.refs()).flight, false);
        assert.equal((await closedRecovery.refs()).completion.roomId, "A");
        assert.deepEqual(closedRecovery.errors, []);
      } finally {
        await closedRecovery.page.close();
      }
      const hydrated = await mount({ width, strict, hold: "turn", hydrate: true });
      try {
        const pending = await hydrated.send();
        await expect.poll(() => hydrated.held.length).toBe(1);
        await hydrated.page.evaluate(() => window.h.setSnapshot(window.loadedSnapshot));
        await expect(hydrated.page.locator("#state")).toContainText('"founded":true');
        await hydrated.release();
        await hydrated.settle(pending);
        assert.equal((await hydrated.state()).revision, 2, "initial snapshot hydration is not an observed reset");
        assert.equal((await hydrated.state()).busy, false);
        assert.equal((await hydrated.refs()).flight, false);
        assert.deepEqual(hydrated.errors, []);
      } finally {
        await hydrated.page.close();
      }
      for (const learnedRecovery of ["older", "unavailable", "recovered-older"]) {
        const learned = await mount({ width, strict, hold: "none", rejectTurn: true, learnedRecovery });
        try {
          const pending = await learned.send();
          await learned.settle(pending);
          assert.equal((await learned.state()).revision, 10, "recovery retains its highest observed Scene revision");
          assert.equal((await learned.state()).busy, false);
          assert.equal((await learned.refs()).flight, false);
          assert.equal((await learned.state()).draft, learnedRecovery === "recovered-older" ? "" : "A draft");
          assert.equal(learned.requests.filter((row) => row.path.endsWith("/turn")).length, 1);
          assert.deepEqual(learned.errors, []);
        } finally {
          await learned.page.close();
        }
      }
      const duplicate = await mount({ width, strict, hold: "activity" });
      try {
        await duplicate.page.evaluate(() => {
          window.h.send();
          window.h.send();
          window.h.send();
        });
        await expect.poll(() => duplicate.held.length).toBe(1);
        assert.equal(duplicate.requests.length, 1);
        await duplicate.release();
        await duplicate.settle(0);
        assert.equal(duplicate.requests.filter((row) => row.path.endsWith("/turn")).length, 1);
        assert.equal((await duplicate.state()).busy, false);
        assert.deepEqual(duplicate.errors, []);
      } finally {
        await duplicate.page.close();
      }
    }
  console.log(
    "PASS mocked mounted Scene sends: selection tokens, preflight/recovery fences, independent pending owners, reset/disposal and ordinary admission",
  );
} finally {
  await browser.close();
}
