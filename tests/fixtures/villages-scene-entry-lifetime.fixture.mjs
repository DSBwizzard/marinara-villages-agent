import assert from "node:assert/strict";
import { build } from "esbuild";
import { expect } from "@playwright/test";

/** Actual mounted entry/actions; synthetic HTTP owns each independently held reply. */
export async function verifySceneEntryLifetimes(browser) {
  const bundle = await build({
    stdin: {
      contents: `
import {createRoot} from 'react-dom/client';
import {StrictMode,useEffect,useState} from 'react';
import {useSceneRecord} from './packages/villages/src/client/features/scenes/useSceneRecord.js';
import {useScenesState} from './packages/villages/src/client/features/scenes/useScenesState.js';
import {useOpenRoom,useGreetRoom,useContinueRoomWithoutGreeting,useCloseRoom} from './packages/villages/src/client/features/scenes/actions.js';
function scene(id,revision=0,status='active'){return {id,version:1,sceneRevision:revision,placeId:'mill',placeName:id,
 status,activeIds:[],participants:[],lines:[],submissions:[],startedAt:'',endedAt:''};}
function Harness(){
 const [room,setRoom]=useSceneRecord(),[founded,setFounded]=useState(window.options.hydrate?undefined:true),[screen,setScreen]=useState('home');
 const state=useScenesState(founded),noop=()=>{};
 const common={...state,room,isFounded:founded,setRoom,setScreen,loadSnapshot:async()=>{window.loads++},receiveRoomRecordEvents:noop};
 const greet=useGreetRoom(common),continueRoom=useContinueRoomWithoutGreeting(common),closeRoom=useCloseRoom(common);
 const open=useOpenRoom({...common,greetRoom:greet,setLastSceneEnding:state.setLastSceneEnding,setOpenPlaceId:noop,setPlaceProblem:noop});
 useEffect(()=>{const initial=window.options.initial;
  setRoom(initial===null?null:scene(initial==='blank'?'':'A',0,initial==='closed'?'closed':'active'));
  state.setRoomEnded(initial==='closed');state.setRoomDraft('A draft');state.setRoomError('A error');
  if(window.options.marker)state.roomCompletionRef.current={roomId:'A',submissionId:'prior-marker'};
 },[]);
 const commands={open:()=>open({id:'other',name:'Other'},'workplace','owner','private','private-room'),
  zone:()=>open({id:'mill',name:'Mill'},undefined,'',undefined,'exterior'),greet:()=>greet(room?.id),
  continue:()=>continueRoom(room?.id),close:closeRoom};
 const launch=work=>{window.pending.push(work());return window.pending.length-1};
 window.h={run:kind=>launch(commands[kind]),twice:kind=>{launch(commands[kind]);launch(commands[kind])},
  cross:kind=>{launch(commands[kind]);launch(commands.continue)},retain:kind=>{window.retained=commands[kind]},old:()=>launch(window.retained),
  select:(id='B')=>{setRoom(scene(id));state.setRoomEnded(false);state.setRoomDraft(id+' draft');state.setRoomError(id+' error')},
  blank:label=>{setRoom({...scene('',0,'opening'),placeName:label});state.setRoomEnded(false)},
  reset:()=>{setFounded(false);setRoom(null);state.setRoomBusy(false);state.setRoomError('reset error');setScreen('home')},
  refound:()=>{setFounded(true);setRoom(scene('A',10));state.setRoomEnded(false)},hydrate:()=>setFounded(true),
  revise:()=>setRoom(current=>({...current,sceneRevision:10})),end:()=>state.setRoomEnded(true),
  close:()=>setRoom(scene('A',10,'closed')),
  refs:()=>({flight:state.roomSendInFlightRef.current,completion:state.roomCompletionRef.current,submission:state.roomSubmissionIdRef.current})};
 return <pre id='state'>{JSON.stringify({id:room?.id??null,revision:room?.sceneRevision??null,status:room?.status??null,
  busy:state.roomBusy,error:state.roomError,greetingError:state.roomGreetingError,notice:state.roomGreetingNotice,
  screen,founded,draft:state.roomDraft,ended:state.roomEnded,open:state.roomOpen})}</pre>;
}
window.pending=[];window.loads=0;window.timeouts=[];const timeout=AbortSignal.timeout.bind(AbortSignal);
AbortSignal.timeout=ms=>{window.timeouts.push(ms);return timeout(ms)};
const root=createRoot(document.getElementById('root'));window.unmount=()=>root.render(null);
root.render(window.strict?<StrictMode><Harness/></StrictMode>:<Harness/>);
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
  function scene(id, revision = 2, status = "active") {
    return {
      id,
      version: 1,
      sceneRevision: revision,
      placeId: "mill",
      placeName: id,
      status,
      activeIds: [],
      participants: [],
      lines: [],
      submissions: [],
      startedAt: "",
      endedAt: "",
    };
  }
  async function mount(strict, width, options = {}) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: width === 390 });
    const page = await context.newPage(),
      held = [],
      requests = [],
      errors = [];
    let openCount = 0,
      greetingId = "A";
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("http://entry-lifetimes.test/", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: '<div id="root"></div>' }),
    );
    await page.route("**/api/villages**", (route) => {
      const request = route.request(),
        path = new URL(request.url()).pathname,
        body = request.postDataJSON();
      const kind = path.endsWith("/rooms") ? "open" : path.split("/").pop();
      requests.push({ kind, method: request.method(), body });
      if (kind === "greet") greetingId = body.sessionId;
      const id = kind === "open" ? (++openCount === 1 ? "A-new" : "B-new") : (body?.sessionId ?? greetingId);
      const value =
        kind === "operation"
          ? { operation: null }
          : kind === "active"
            ? { session: options.recovered === null ? null : scene(greetingId, 2, options.recovered ?? "active") }
            : {
                session: scene(
                  id,
                  2,
                  kind === "open" ? (options.openStatus ?? "active") : kind === "end" ? "closed" : "active",
                ),
                recordEvents: [],
              };
      const failed = (options.fail && request.method() === "POST") || (options.recoveryFail && kind === "active");
      const reply = {
        status: failed ? 502 : 200,
        contentType: "application/json",
        body: JSON.stringify(failed ? { error: "synthetic failure" } : value),
      };
      if ((options.holdAllPosts && request.method() === "POST") || options.hold === kind)
        held.push({ route, reply, kind });
      else return route.fulfill(reply);
    });
    await page.goto("http://entry-lifetimes.test/");
    await page.evaluate(
      ({ strict, options }) => {
        window.strict = strict;
        window.options = options;
      },
      { strict, options: { initial: "A", ...options } },
    );
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const state = async () => JSON.parse(await page.locator("#state").textContent());
    await expect.poll(async () => (await state()).draft).toBe("A draft");
    return {
      context,
      page,
      state,
      held,
      requests,
      errors,
      run: (kind) => page.evaluate((kind) => window.h.run(kind), kind),
      settle: (index) => page.evaluate((index) => window.pending[index], index),
      release: async (index) => {
        await held[index].route.fulfill(held[index].reply);
      },
      refs: () => page.evaluate(() => window.h.refs()),
      loads: () => page.evaluate(() => window.loads),
      finish: async () => {
        assert.deepEqual(errors, []);
        await context.close();
      },
    };
  }
  for (const width of [1280, 390])
    for (const strict of [false, true]) {
      // Ordered handoffs survive null/blank/closed starts and immediate server/greeting replies.
      for (const initial of [null, "blank", "closed"]) {
        const f = await mount(strict, width, { initial, openStatus: "opening", marker: true });
        await f.run("open");
        await f.settle(0);
        await expect.poll(async () => (await f.state()).id).toBe("A-new");
        assert.equal((await f.state()).busy, false);
        assert.equal((await f.refs()).flight, false);
        assert.deepEqual(
          f.requests.map((r) => r.kind),
          ["open", "greet"],
        );
        assert.equal(await f.loads(), 2);
        assert.deepEqual(f.requests[0].body, {
          venueId: "other",
          spaceClass: "workplace",
          privateOwnerId: "owner",
          entryArea: "private",
          zoneId: "private-room",
          ...(initial === null ? {} : { expectedSceneRevision: 0 }),
        });
        assert.deepEqual(f.requests[1].body, { sessionId: "A-new" });
        assert.deepEqual(await f.page.evaluate(() => window.timeouts), [20_000, 30_000]);
        assert.equal(
          (await f.refs()).completion,
          null,
          "Open retains its original completion clear without a new sentinel",
        );
        await f.finish();
      }
      // All three current success paths retain exact request counts, payloads and revision high water.
      for (const kind of ["open", "greet", "zone"]) {
        const f = await mount(strict, width, { hold: kind });
        await f.run(kind);
        await expect.poll(() => f.held.length).toBe(1);
        if (kind !== "open") await f.page.evaluate(() => window.h.revise());
        await f.release(0);
        await f.settle(0);
        assert.equal((await f.state()).id, kind === "open" ? "A-new" : "A");
        assert.equal((await f.state()).revision, kind === "open" ? 2 : 10);
        assert.equal((await f.state()).busy, false);
        assert.equal(await f.loads(), 1);
        if (kind === "zone")
          assert.deepEqual(f.requests[0].body, { sessionId: "A", zoneId: "exterior", expectedSceneRevision: 0 });
        if (kind === "greet") assert.deepEqual(f.requests[0].body, { sessionId: "A" });
        await f.finish();
      }
      // A real B action with no completion marker remains admitted/busy after stale A settles.
      for (const kind of ["open", "greet", "zone"]) {
        const f = await mount(strict, width, { holdAllPosts: true });
        await f.run(kind);
        await expect.poll(() => f.held.length).toBe(1);
        await f.page.evaluate(() => window.h.select());
        await expect.poll(async () => (await f.state()).busy).toBe(false);
        await f.run("continue");
        await expect.poll(() => f.held.length).toBe(2);
        const before = await f.state(),
          refs = await f.refs();
        assert.equal(before.id, "B");
        assert.equal(before.busy, true);
        assert.equal(refs.completion, null);
        assert.equal(refs.flight, true);
        await f.release(0);
        await f.settle(0);
        assert.deepEqual(await f.state(), before);
        assert.deepEqual(await f.refs(), refs);
        assert.equal(await f.loads(), 0);
        assert.equal(f.requests.length, 2);
        await f.release(1);
        await f.settle(1);
        assert.equal((await f.state()).id, "B");
        assert.equal((await f.state()).busy, false);
        await f.finish();
      }
      // New B entry and B closing marker also survive old entry completion.
      for (const next of ["open", "close"]) {
        const f = await mount(strict, width, { holdAllPosts: true });
        await f.run("open");
        await expect.poll(() => f.held.length).toBe(1);
        await f.page.evaluate(() => window.h.select());
        await expect.poll(async () => (await f.state()).busy).toBe(false);
        await f.run(next);
        await expect.poll(() => f.held.length).toBe(2);
        const before = await f.state(),
          refs = await f.refs();
        assert.equal(before.busy, true);
        assert.equal(refs.flight, true);
        assert.equal(!!refs.completion, next === "close");
        await f.release(0);
        await f.settle(0);
        assert.deepEqual(await f.state(), before);
        assert.deepEqual(await f.refs(), refs);
        assert.equal(await f.loads(), 0);
        await f.release(1);
        await f.settle(1);
        assert.equal((await f.state()).id, next === "open" ? "B-new" : "B");
        await f.finish();
      }
      // Duplicate and competing actions share synchronous admission before React rerenders.
      for (const kind of ["open", "greet", "zone"]) {
        const f = await mount(strict, width, { holdAllPosts: true });
        await f.page.evaluate((kind) => window.h.cross(kind), kind);
        await expect.poll(() => f.held.length).toBe(1);
        await f.release(0);
        await f.settle(0);
        await f.settle(1);
        assert.equal(f.requests.length, 1);
        await f.finish();
      }
      // Recovery preserves completed results and the original lack of a snapshot launch.
      for (const recovered of ["active", null]) {
        const f = await mount(strict, width, { fail: true, recovered });
        await f.run("greet");
        await f.settle(0);
        assert.deepEqual(
          f.requests.map((r) => r.kind),
          ["greet", "active"],
        );
        assert.equal(await f.loads(), 0);
        assert.equal((await f.state()).busy, false);
        assert.equal(!!(await f.state()).greetingError, recovered === null);
        await f.finish();
      }
      // A paused recovery is retired before any recovered publication or B cleanup.
      {
        const f = await mount(strict, width, { fail: true, hold: "active" });
        await f.run("greet");
        await expect.poll(() => f.held.length).toBe(1);
        await f.page.evaluate(() => window.h.select());
        await expect.poll(async () => (await f.state()).busy).toBe(false);
        const before = await f.state();
        await f.release(0);
        await f.settle(0);
        assert.deepEqual(await f.state(), before);
        assert.equal(await f.loads(), 0);
        await f.finish();
      }
      // Automatic greeting remains under the entry claim and cannot publish after B starts.
      {
        const f = await mount(strict, width, { openStatus: "opening", holdAllPosts: true });
        await f.run("open");
        await expect.poll(() => f.held.length).toBe(1);
        await f.release(0);
        await expect.poll(() => f.held.length).toBe(2);
        assert.equal((await f.state()).id, "A-new");
        await f.page.evaluate(() => window.h.select());
        await expect.poll(async () => (await f.state()).busy).toBe(false);
        await f.run("continue");
        await expect.poll(() => f.held.length).toBe(3);
        const before = await f.state(),
          refs = await f.refs();
        await f.release(1);
        await f.settle(0);
        assert.deepEqual(await f.state(), before);
        assert.deepEqual(await f.refs(), refs);
        assert.equal(await f.loads(), 1);
        assert.deepEqual(
          f.requests.map((r) => r.kind),
          ["open", "greet", "continue"],
        );
        await f.release(2);
        await f.settle(1);
        await f.finish();
      }
      // Observed world reset/refounding, closure and foreign blank identities retire pending entry.
      for (const transition of ["reset", "end", "close", "blank"]) {
        const f = await mount(strict, width, { hold: "open", openStatus: "opening" });
        await f.run("open");
        await expect.poll(() => f.held.length).toBe(1);
        await f.page.evaluate((transition) => window.h[transition]("foreign"), transition);
        if (transition === "reset") {
          await expect.poll(async () => (await f.state()).founded).toBe(false);
          await f.page.evaluate(() => window.h.refound());
        }
        await expect.poll(async () => (await f.state()).busy).toBe(false);
        const before = await f.state();
        await f.release(0);
        await f.settle(0);
        assert.deepEqual(await f.state(), before);
        assert.equal(await f.loads(), 0);
        assert.equal(f.requests.length, 1);
        await f.finish();
      }
      // Captured callbacks cannot regain authority after observed A -> B -> A or blank -> B -> blank.
      for (const initial of ["A", "blank"]) {
        const f = await mount(strict, width, { initial });
        await f.page.evaluate(() => window.h.retain("open"));
        await f.page.evaluate(() => window.h.select());
        await expect.poll(async () => (await f.state()).id).toBe("B");
        await f.page.evaluate(
          (initial) => (initial === "blank" ? window.h.blank("returned") : window.h.select("A")),
          initial,
        );
        await expect.poll(async () => (await f.state()).id).toBe(initial === "blank" ? "" : "A");
        const before = await f.state();
        await f.page.evaluate(() => window.h.old());
        await f.settle(0);
        assert.deepEqual(await f.state(), before);
        assert.equal(f.requests.length, 0);
        await f.finish();
      }
      // Unknown -> founded hydration is retained, while unmount prevents any late followup.
      {
        const f = await mount(strict, width, { hydrate: true, hold: "open" });
        await f.run("open");
        await expect.poll(() => f.held.length).toBe(1);
        await f.page.evaluate(() => window.h.hydrate());
        await f.release(0);
        await f.settle(0);
        assert.equal((await f.state()).id, "A-new");
        await f.finish();
      }
      {
        const f = await mount(strict, width, { hold: "open", openStatus: "opening" });
        await f.run("open");
        await expect.poll(() => f.held.length).toBe(1);
        await f.page.evaluate(() => window.unmount());
        await expect(f.page.locator("#state")).toHaveCount(0);
        await f.release(0);
        await f.settle(0);
        assert.equal(f.requests.length, 1);
        assert.equal(await f.loads(), 0);
        await f.finish();
      }
    }
  console.log(
    "Scene entry lifetimes: owned placeholder/server/greeting handoffs, exact admission/payloads, recovery, revisions, real replacement requests, resets, closure, ABA, hydration and disposal passed (mounted hooks, synthetic HTTP; desktop/mobile and StrictMode).",
  );
}
