import assert from "node:assert/strict";
import { build } from "esbuild";
import { expect } from "@playwright/test";

/** Mounted startup restoration and real replacement actions, with synthetic HTTP. */
export async function verifySceneRestorationLifetimes(browser) {
  const bundle = await build({
    stdin: {
      loader: "tsx",
      resolveDir: process.cwd(),
      contents: `
import {createRoot} from 'react-dom/client';
import {StrictMode,useCallback,useEffect,useState} from 'react';
import {useSceneRecord} from './packages/villages/src/client/features/scenes/useSceneRecord.js';
import {useScenesState} from './packages/villages/src/client/features/scenes/useScenesState.js';
import {useActiveSceneRestoration} from './packages/villages/src/client/features/scenes/controller-hooks.js';
import {useContinueRoomWithoutGreeting,useCloseRoom,useOpenRoom,useGreetRoom} from './packages/villages/src/client/features/scenes/actions.js';
function scene(id,status='active',revision=0){return {id,version:1,sceneRevision:revision,placeId:'mill',placeName:id,status,activeIds:[],participants:[],lines:[],submissions:[],startedAt:'',endedAt:''};}
function Restore(ports){useActiveSceneRestoration(ports);return null}
function Harness(){
 const [room,writeRoom]=useSceneRecord(),[ready,setReady]=useState(false),[founded,setFounded]=useState(window.options.hydrate?undefined:true),
 [screen,setScreen]=useState('home'),[debug,setDebug]=useState(false);
 const state=useScenesState(founded),noop=()=>{};
 const setRoom=useCallback(next=>{window.publications.push('room');writeRoom(next)},[]),
 setRoomBusy=useCallback(next=>{window.publications.push('busy');state.setRoomBusy(next)},[]),
 setRoomGreetingError=useCallback(next=>{window.publications.push('greetingError');state.setRoomGreetingError(next)},[]),
 setDebugDiscardEnabled=useCallback(next=>{window.publications.push('debug');setDebug(next)},[]);
 const common={...state,room,isFounded:founded,setRoom,setRoomBusy,setRoomGreetingError,setScreen,
  loadSnapshot:async()=>{window.loads++},receiveRoomRecordEvents:noop};
 const next=useContinueRoomWithoutGreeting(common),close=useCloseRoom(common),greet=useGreetRoom(common),
 open=useOpenRoom({...common,greetRoom:greet,setOpenPlaceId:noop,setPlaceProblem:noop});
 useEffect(()=>{writeRoom(window.options.initial===null?null:scene(window.options.initial==='blank'?'':'A'));state.setRoomEnded(window.options.ended===true);
  if(window.options.marker)state.roomCompletionRef.current={roomId:'A',submissionId:'prior-marker'};
  setReady(true)},[]);
 window.h={select:(id='B')=>{writeRoom(scene(id));state.setRoomEnded(false);state.setRoomError(id+' error')},
 blank:()=>{writeRoom(scene('','opening'));state.setRoomEnded(false)},revise:()=>writeRoom(current=>({...current,sceneRevision:10})),
 reset:()=>{setFounded(false);writeRoom(null);state.setRoomBusy(false);state.setRoomError('reset error');setScreen('home')},
 refound:(id='B')=>{setFounded(true);writeRoom(scene(id));state.setRoomEnded(false)},hydrate:()=>setFounded(true),
 end:()=>state.setRoomEnded(true),closed:()=>writeRoom(current=>({...current,status:'closed'})),
 run:kind=>{const fn=kind==='close'?close:kind==='open'?()=>open({id:'other',name:'Other'}):()=>next(room.id);
  window.pending.push(fn());return window.pending.length-1},
 refs:()=>({flight:state.roomSendInFlightRef.current,completion:state.roomCompletionRef.current})};
 return <>{ready&&<Restore {...common} setDebugDiscardEnabled={setDebugDiscardEnabled}/>}
 <pre id='state'>{JSON.stringify({id:room?.id??null,status:room?.status??null,revision:room?.sceneRevision??null,
  busy:state.roomBusy,error:state.roomError,greetingError:state.roomGreetingError,screen,founded,debug,ended:state.roomEnded,mode:state.roomMode,open:state.roomOpen})}</pre></>;
}
window.pending=[];window.publications=[];window.loads=0;window.timeouts=[];
const timeout=AbortSignal.timeout.bind(AbortSignal);AbortSignal.timeout=ms=>{window.timeouts.push(ms);return timeout(ms)};
const root=createRoot(document.getElementById('root'));window.unmount=()=>root.render(null);
root.render(window.strict?<StrictMode><Harness/></StrictMode>:<Harness/>);
`,
    },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    jsx: "automatic",
  });
  function scene(id, status = "active", revision = 2) {
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
    let greeted = false;
    page.on("pageerror", (cause) => errors.push(cause.message));
    await page.route("http://restoration-lifetimes.test/", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: '<div id="root"></div>' }),
    );
    await page.route("**/api/villages**", (route) => {
      const request = route.request(),
        kind = new URL(request.url()).pathname.split("/").pop(),
        body = request.postDataJSON();
      const recovery = kind === "active" && greeted;
      if (kind === "greet") greeted = true;
      requests.push({ kind, recovery, method: request.method(), body });
      const value =
        kind === "active"
          ? {
              session:
                (recovery ? options.recovered : options.restored) === null
                  ? null
                  : scene(
                      recovery ? (options.recoveredId ?? "A") : "A",
                      recovery ? (options.recovered ?? "active") : (options.restored ?? "opening"),
                    ),
              debugDiscardEnabled: true,
            }
          : {
              session: scene(
                kind === "rooms" ? "B-new" : body.sessionId,
                kind === "end" ? "closed" : (options.greetedStatus ?? "active"),
              ),
              recordEvents: [],
            };
      const failed =
        (kind === "greet" && options.failGreet) ||
        (recovery && options.failRecovery) ||
        (kind === "active" && !recovery && options.failRead);
      const reply = {
        status: failed ? 502 : 200,
        contentType: "application/json",
        body: JSON.stringify(failed ? { error: "synthetic restoration failure" } : value),
      };
      const entry = { route, reply, kind, recovery };
      if (
        (!recovery && kind === "active" && options.holdRead) ||
        (recovery && options.holdRecovery) ||
        (request.method() === "POST" && options.holdPosts)
      )
        held.push(entry);
      else return route.fulfill(reply);
    });
    await page.goto("http://restoration-lifetimes.test/");
    await page.evaluate(
      ({ strict, options }) => {
        window.strict = strict;
        window.options = options;
      },
      { strict, options },
    );
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const state = async () => JSON.parse(await page.locator("#state").textContent());
    await expect.poll(async () => typeof (await page.evaluate(() => window.h))).toBe("object");
    const release = async (entry) => {
      try {
        await entry.route.fulfill(entry.reply);
      } catch (cause) {
        if (!/closed|cancel|abort/i.test(cause.message)) throw cause;
      }
    };
    return {
      context,
      page,
      state,
      held,
      requests,
      run: (kind) => page.evaluate((kind) => window.h.run(kind), kind),
      settle: (index) => page.evaluate((index) => window.pending[index], index),
      release,
      releaseReads: async () => {
        for (const entry of held.filter((h) => h.kind === "active" && !h.recovery)) await release(entry);
      },
      refs: () => page.evaluate(() => window.h.refs()),
      finish: async () => {
        assert.deepEqual(errors, []);
        await context.close();
      },
    };
  }
  for (const width of [1280, 390])
    for (const strict of [false, true]) {
      // Normal reloads preserve completion/ended state, counts, timeout and no snapshot launch.
      for (const restored of [null, "active", "opening", "closed"]) {
        const f = await mount(strict, width, { restored, marker: true, ended: restored === "closed" });
        await expect.poll(async () => (await f.state()).debug).toBe(true);
        if (restored !== null)
          await expect.poll(async () => (await f.state()).status).toBe(restored === "opening" ? "active" : restored);
        await expect.poll(async () => (await f.refs()).flight).toBe(false);
        assert.equal((await f.state()).busy, false);
        assert.equal((await f.state()).ended, restored === "closed");
        assert.deepEqual((await f.refs()).completion, { roomId: "A", submissionId: "prior-marker" });
        assert.equal(f.requests.filter((r) => r.method === "POST").length, restored === "opening" ? 1 : 0);
        assert.equal(await f.page.evaluate(() => window.loads), 0);
        assert.deepEqual(await f.page.evaluate(() => window.timeouts), restored === "opening" ? [30_000] : []);
        if (!strict) assert.equal(f.requests.filter((r) => r.kind === "active").length, 1);
        if (restored !== null) {
          assert.equal((await f.state()).screen, "room");
          assert.equal((await f.state()).mode, "chat");
          assert.equal((await f.state()).open, true);
        }
        await f.finish();
      }
      // A waiting read owns no admission. A same-selection real request defeats restoration adoption.
      for (const initial of [null, "blank"]) {
        const f = await mount(strict, width, { initial, marker: true });
        await expect.poll(async () => (await f.state()).id).toBe("A");
        await expect.poll(async () => (await f.state()).status).toBe("active");
        await expect.poll(async () => (await f.refs()).flight).toBe(false);
        assert.equal((await f.state()).id, "A");
        assert.deepEqual((await f.refs()).completion, { roomId: "A", submissionId: "prior-marker" });
        assert.equal(f.requests.filter((r) => r.method === "POST").length, 1);
        assert.equal(await f.page.evaluate(() => window.loads), 0);
        await f.finish();
      }
      const failedRead = await mount(strict, width, { failRead: true, holdRead: true });
      await expect.poll(() => failedRead.held.length).toBeGreaterThan(0);
      const failedReadBefore = await failedRead.state();
      await failedRead.releaseReads();
      await failedRead.page.waitForTimeout(25);
      assert.deepEqual(await failedRead.state(), failedReadBefore);
      assert.equal(failedRead.requests.filter((r) => r.method === "POST").length, 0);
      assert.equal((await failedRead.refs()).flight, false);
      await failedRead.finish();
      for (const kind of ["continue", "open"]) {
        const f = await mount(strict, width, { holdRead: true, holdPosts: true });
        await expect.poll(() => f.held.some((h) => h.kind === "active")).toBe(true);
        await f.run(kind);
        await expect.poll(() => f.held.some((h) => h.kind === (kind === "open" ? "rooms" : kind))).toBe(true);
        const before = await f.state(),
          refs = await f.refs();
        assert.equal(before.busy, true);
        assert.equal(refs.flight, true);
        await f.releaseReads();
        await f.page.waitForTimeout(25);
        const after = await f.state();
        assert.deepEqual({ ...after, debug: before.debug }, before);
        assert.deepEqual(await f.refs(), refs);
        assert.equal(f.requests.filter((r) => r.kind === "greet").length, 0);
        await f.release(f.held.find((h) => h.kind === (kind === "open" ? "rooms" : kind)));
        await f.settle(0);
        await expect.poll(async () => (await f.refs()).flight).toBe(false);
        await f.finish();
      }
      // Initial responses cannot revive a retired selection/reset or publish its debug setting.
      for (const change of ["select", "blank", "reset-refound", "ABA"]) {
        const f = await mount(strict, width, { holdRead: true });
        await expect.poll(() => f.held.length).toBeGreaterThan(0);
        if (change === "reset-refound") {
          await f.page.evaluate(() => window.h.reset());
          await expect.poll(async () => (await f.state()).founded).toBe(false);
          await f.page.evaluate(() => window.h.refound());
        } else if (change === "ABA") {
          await f.page.evaluate(() => window.h.select());
          await expect.poll(async () => (await f.state()).id).toBe("B");
          await f.page.evaluate(() => window.h.select("A"));
        } else await f.page.evaluate((change) => window.h[change](), change);
        await expect
          .poll(async () => (await f.state()).id)
          .toBe(change === "blank" ? "" : change === "ABA" ? "A" : "B");
        const before = await f.state(),
          publications = await f.page.evaluate(() => window.publications.length);
        await f.releaseReads();
        await f.page.waitForTimeout(25);
        assert.deepEqual(await f.state(), before);
        assert.equal(await f.page.evaluate(() => window.publications.length), publications);
        assert.equal(f.requests.filter((r) => r.method === "POST").length, 0);
        await f.finish();
      }
      // Old restored greetings cannot clean up real B requests, with or without a completion marker.
      for (const kind of ["continue", "close"]) {
        const f = await mount(strict, width, { holdPosts: true });
        await expect.poll(() => f.held.some((h) => h.kind === "greet")).toBe(true);
        await f.page.evaluate(() => window.h.select());
        await expect.poll(async () => (await f.state()).busy).toBe(false);
        await f.run(kind);
        await expect.poll(() => f.held.length).toBe(2);
        const before = await f.state(),
          refs = await f.refs();
        assert.equal(before.id, "B");
        assert.equal(before.busy, true);
        assert.equal(refs.flight, true);
        assert.equal(refs.completion === null, kind === "continue");
        await f.release(f.held[0]);
        await f.page.waitForTimeout(25);
        assert.deepEqual(await f.state(), before);
        assert.deepEqual(await f.refs(), refs);
        await f.release(f.held[1]);
        await f.settle(0);
        await f.finish();
      }
      // Current revision updates are retained; closure/reset/foreign blanks retire a held greeting.
      for (const change of ["revise", "end", "closed", "blank", "reset-refound"]) {
        const f = await mount(strict, width, { holdPosts: true });
        await expect.poll(() => f.held.length).toBe(1);
        if (change === "reset-refound") {
          await f.page.evaluate(() => window.h.reset());
          await expect.poll(async () => (await f.state()).founded).toBe(false);
          await f.page.evaluate(() => window.h.refound("A"));
        } else await f.page.evaluate((change) => window.h[change](), change);
        if (change !== "revise") await expect.poll(async () => (await f.state()).busy).toBe(false);
        const before = await f.state();
        await f.release(f.held[0]);
        if (change === "revise") {
          await expect.poll(async () => (await f.state()).busy).toBe(false);
          assert.equal((await f.state()).revision, 10);
          assert.equal((await f.state()).status, "opening", "the reducer retains the complete newer revision");
        } else {
          await f.page.waitForTimeout(25);
          assert.deepEqual(await f.state(), before);
        }
        assert.equal(f.requests.filter((r) => r.method === "POST").length, 1);
        await f.finish();
      }
      // Original recovery outcomes retain one POST, one subsequent GET and no snapshot.
      for (const recovered of ["active", "closed", "opening", null, "failure", "other"]) {
        const f = await mount(strict, width, {
          failGreet: true,
          recovered: recovered === "failure" || recovered === "other" ? "active" : recovered,
          failRecovery: recovered === "failure",
          recoveredId: recovered === "other" ? "other" : "A",
        });
        await expect.poll(() => f.requests.filter((r) => r.recovery).length).toBe(1);
        await expect.poll(async () => (await f.state()).busy).toBe(false);
        const value = await f.state();
        assert.equal(value.id, "A");
        assert.equal(value.status, ["active", "closed"].includes(recovered) ? recovered : "opening");
        assert.equal(value.greetingError === null, ["active", "closed"].includes(recovered));
        assert.equal(f.requests.filter((r) => r.method === "POST").length, 1);
        assert.deepEqual(await f.page.evaluate(() => window.timeouts), [30_000, 5_000]);
        assert.equal(await f.page.evaluate(() => window.loads), 0);
        await f.finish();
      }
      const recovery = await mount(strict, width, { failGreet: true, holdRecovery: true });
      await expect.poll(() => recovery.held.some((h) => h.recovery)).toBe(true);
      await recovery.page.evaluate(() => window.h.select());
      await expect.poll(async () => (await recovery.state()).busy).toBe(false);
      const recoveryBefore = await recovery.state();
      await recovery.release(recovery.held.find((h) => h.recovery));
      await recovery.page.waitForTimeout(25);
      assert.deepEqual(await recovery.state(), recoveryBefore);
      await recovery.finish();
      const hydrate = await mount(strict, width, { hydrate: true, holdRead: true });
      await expect.poll(() => hydrate.held.length).toBeGreaterThan(0);
      await hydrate.page.evaluate(() => window.h.hydrate());
      await hydrate.releaseReads();
      await expect.poll(async () => (await hydrate.state()).status).toBe("active");
      await expect.poll(async () => (await hydrate.state()).busy).toBe(false);
      await hydrate.finish();
      for (const stage of ["read", "greet"]) {
        const f = await mount(strict, width, { holdRead: stage === "read", holdPosts: stage === "greet" });
        await expect.poll(() => f.held.length).toBeGreaterThan(0);
        await f.page.evaluate(() => window.unmount());
        await expect(f.page.locator("#state")).toHaveCount(0);
        const count = await f.page.evaluate(() => window.publications.length);
        for (const held of f.held) await f.release(held);
        await f.page.waitForTimeout(25);
        assert.equal(await f.page.evaluate(() => window.publications.length), count);
        assert.equal(f.requests.filter((r) => r.method === "POST").length, stage === "read" ? 0 : 1);
        await f.finish();
      }
    }
  console.log(
    "Scene restoration lifetimes: unclaimed startup read, exact shared admission, owned greeting/recovery, reset/ABA/replacement, revision/closure, hydration and disposal passed (mounted hooks, synthetic HTTP; desktop/mobile and StrictMode).",
  );
}
