import assert from "node:assert/strict";
import { build } from "esbuild";
import { expect } from "@playwright/test";

/** Actual mounted hooks; HTTP and authoritative selection/reset are controlled inputs. */
export async function verifySceneActionLifetimes(browser) {
  const bundle = await build({
    stdin: {
      contents: `
import {createRoot} from 'react-dom/client';
import {StrictMode,useEffect,useState} from 'react';
import {useSceneRecord} from './packages/villages/src/client/features/scenes/useSceneRecord.js';
import {useScenesState} from './packages/villages/src/client/features/scenes/useScenesState.js';
import {useMoveRoom,useContinueRoomWithoutGreeting} from './packages/villages/src/client/features/scenes/actions.js';
function scene(id,revision=0,status='active'){return {id,version:1,sceneRevision:revision,placeId:'mill',placeName:id,
 zoneId:'exterior',area:'public',status,startedAt:'2026-10-07T00:00:00Z',lastActivityAt:'2026-10-07T00:00:00Z',
 endedAt:'',participants:[],activeIds:[],lines:[],submissions:[]};}
function Harness(){
 const [room,setRoom]=useSceneRecord(),[founded,setFounded]=useState(window.hydrate?undefined:true);
 const state=useScenesState(founded);
 const common={room,isFounded:founded,roomBusy:state.roomBusy,roomEnded:state.roomEnded,
  roomCompletionRef:state.roomCompletionRef,roomSendInFlightRef:state.roomSendInFlightRef,
  setRoom,setRoomBusy:state.setRoomBusy,setRoomError:state.setRoomError};
 const move=useMoveRoom({...common,loadSnapshot:async()=>{window.loads++},
  roomMoveOperationIdRef:state.roomMoveOperationIdRef,roomMoveZoneId:state.roomMoveZoneId,
  setRoomContactBoundary:state.setRoomContactBoundary,setRoomMode:state.setRoomMode,setRoomMoveZoneId:state.setRoomMoveZoneId});
 const continueScene=useContinueRoomWithoutGreeting({...common,setRoomGreetingNotice:state.setRoomGreetingNotice});
 useEffect(()=>{setRoom(scene('A',0,window.opening?'opening':'active'));state.setRoomMoveZoneId('private-A');state.setRoomMode('move');
  state.setRoomContactBoundary('A-boundary');},[]);
 const launch=work=>{window.pending.push(work());return window.pending.length-1;};
 window.h={launch:kind=>launch(kind==='move'?move:()=>continueScene(room.id)),
  retain:kind=>{window.retained=kind==='move'?move:()=>continueScene(room.id)},old:()=>launch(window.retained),
  select:(id='B',pending=false,revision=0)=>{setRoom(scene(id,revision));state.setRoomMoveZoneId('private-'+id);
   state.setRoomMode('move');state.setRoomContactBoundary(id+'-boundary');state.setRoomError(id+' error');
   state.setRoomGreetingNotice(id+' notice');state.setRoomDraft(id+' draft');state.setRoomBusy(pending);
   state.roomSendInFlightRef.current=pending;state.roomMoveOperationIdRef.current=pending?id+'-move':null;
   state.roomSubmissionIdRef.current=pending?id+'-submission':null;
   state.roomCompletionRef.current=pending?{roomId:id,submissionId:id+'-submission'}:null;},
  reset:()=>{setFounded(false);setRoom(null);state.setRoomBusy(false);state.setRoomError('reset error');
   state.setRoomGreetingNotice('reset notice');state.roomSendInFlightRef.current=false;
   state.roomMoveOperationIdRef.current=null;state.roomSubmissionIdRef.current=null;state.roomCompletionRef.current=null;},
  refound:()=>{setFounded(true);setRoom(scene('A',10));state.setRoomMoveZoneId('private-A');},
  hydrate:()=>setFounded(true),unfound:()=>setFounded(false),
  marker:()=>{state.roomCompletionRef.current={roomId:'A',submissionId:'prior-marker'}},
  end:()=>state.setRoomEnded(true),close:()=>setRoom(scene('A',10,'closed')),
  refs:()=>({flight:state.roomSendInFlightRef.current,move:state.roomMoveOperationIdRef.current,
   submission:state.roomSubmissionIdRef.current,completion:state.roomCompletionRef.current})};
 return <pre id='state'>{JSON.stringify({id:room?.id??null,revision:room?.sceneRevision??null,zone:room?.zoneId??null,
  founded,busy:state.roomBusy,error:state.roomError,notice:state.roomGreetingNotice,mode:state.roomMode,
  target:state.roomMoveZoneId,boundary:state.roomContactBoundary,draft:state.roomDraft})}</pre>;
}
window.pending=[];window.loads=0;
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

  function scene(id, operationId, closed = false) {
    return {
      id,
      version: 1,
      sceneRevision: 2,
      placeId: "mill",
      zoneId: "private-" + id,
      status: closed ? "closed" : "active",
      participants: [],
      activeIds: [],
      lines: [],
      submissions: operationId ? [{ id: operationId }] : [],
    };
  }
  async function mount(strict, width, options = {}) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: width === 390 });
    const page = await context.newPage(),
      requests = [],
      held = [],
      errors = [];
    let operationId;
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("http://action-lifetimes.test/", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: '<div id="root"></div>' }),
    );
    await page.route("**/api/villages**", (route) => {
      const request = route.request(),
        path = new URL(request.url()).pathname,
        body = request.postDataJSON();
      const kind = path.includes("/operations/")
        ? "recovery-operation"
        : path.includes("/archive/")
          ? "archive"
          : path.endsWith("/operation")
            ? "preflight"
            : path.split("/").pop();
      requests.push({ kind, method: request.method(), body });
      if (body?.operationId) operationId = body.operationId;
      const answer =
        kind === "preflight"
          ? { operation: options.saved ?? null }
          : kind === "recovery-operation"
            ? { operation: null }
            : kind === "active"
              ? { session: options.archive ? null : scene("A", options.recovered ? operationId : null, options.closed) }
              : kind === "archive"
                ? { visit: scene("A", options.recovered ? operationId : null, options.closed) }
                : { session: scene(body.sessionId) };
      const status = options.fail && (kind === "zone" || kind === "continue") ? 502 : 200;
      const response = {
        status,
        contentType: "application/json",
        body: JSON.stringify(status === 502 ? { error: "Exact action failure" } : answer),
      };
      if (options.hold === kind) held.push({ route, response });
      else return route.fulfill(response);
    });
    await page.goto("http://action-lifetimes.test/");
    await page.evaluate(
      (value) => {
        window.strict = value.strict;
        window.hydrate = value.hydrate;
        window.opening = value.opening;
      },
      { strict, hydrate: options.hydrate, opening: options.opening },
    );
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await expect(page.locator("#state")).toContainText('"target":"private-A"');
    const state = async () => JSON.parse(await page.locator("#state").textContent());
    const refs = () => page.evaluate(() => window.h.refs());
    const snapshot = async () => ({
      state: await state(),
      refs: await refs(),
      loads: await page.evaluate(() => window.loads),
    });
    const settle = async (index) => {
      await page.evaluate((i) => window.pending[i], index);
      await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
    };
    const release = async () => {
      assert.equal(held.length, 1);
      const { route, response } = held.shift();
      await route.fulfill(response);
    };
    return {
      page,
      requests,
      held,
      state,
      refs,
      snapshot,
      settle,
      release,
      launch: (kind) => page.evaluate((value) => window.h.launch(value), kind),
      close: async () => {
        assert.deepEqual(errors, []);
        await context.close();
      },
    };
  }

  for (const strict of [false, true]) {
    for (const width of [1366, 390]) {
      for (const action of ["move", "continue"]) {
        const hold = action === "move" ? "preflight" : "continue";
        const control = await mount(strict, width, { hold });
        try {
          const [index, duplicate, other] = await control.page.evaluate(
            (kind) => [
              window.h.launch(kind),
              window.h.launch(kind),
              window.h.launch(kind === "move" ? "continue" : "move"),
            ],
            action,
          );
          await expect.poll(() => control.held.length).toBe(1);
          await control.settle(duplicate);
          await control.settle(other);
          assert.equal(control.requests.length, 1, "Duplicate admission does not dispatch another request");
          await control.release();
          await control.settle(index);
          const state = await control.state();
          assert.equal(state.id, "A");
          assert.equal(state.busy, false);
          assert.equal(state.error, "");
          assert.equal((await control.refs()).flight, false);
          assert.equal(control.requests.filter((request) => request.method === "POST").length, 1);
          if (action === "move") {
            assert.deepEqual(control.requests[1].body, {
              sessionId: "A",
              zoneId: "private-A",
              operationId: control.requests[1].body.operationId,
              expectedSceneRevision: 0,
            });
            assert.ok(control.requests[1].body.operationId);
            assert.equal(state.mode, "chat");
            assert.equal(state.target, "");
            assert.equal(state.boundary, "");
            assert.equal((await control.refs()).move, null);
            assert.equal(await control.page.evaluate(() => window.loads), 1);
          } else {
            assert.deepEqual(control.requests[0].body, { sessionId: "A" });
            assert.equal(state.notice, "The opening failed. You can continue the Scene now.");
          }
          assert.equal((await control.refs()).completion, null);
        } finally {
          await control.close();
        }

        for (const transition of ["replacement", "reset", "closed", "ended", "unmount"]) {
          const f = await mount(strict, width, { hold });
          try {
            const index = await f.launch(action);
            await expect.poll(() => f.held.length).toBe(1);
            await f.page.evaluate((kind) => {
              if (kind === "replacement") window.h.select("B", true);
              else if (kind === "reset") window.h.reset();
              else if (kind === "unmount") window.unmount();
              else if (kind === "closed") window.h.close();
              else window.h.end();
            }, transition);
            await expect(f.page.locator("#state"))[transition === "unmount" ? "toHaveCount" : "toContainText"](
              transition === "unmount"
                ? 0
                : transition === "replacement"
                  ? '"id":"B"'
                  : transition === "reset"
                    ? '"founded":false'
                    : '"busy":false',
            );
            const selected = transition === "unmount" ? await f.refs() : await f.snapshot();
            await f.release();
            await f.settle(index);
            assert.deepEqual(transition === "unmount" ? await f.refs() : await f.snapshot(), selected);
            assert.equal(f.requests.length, 1, "Retired preflight or reply admits no follow-up request");
          } finally {
            await f.close();
          }
        }

        for (const transition of ["selection", "refounding"]) {
          const aba = await mount(strict, width);
          try {
            await aba.page.evaluate((kind) => window.h.retain(kind), action);
            await aba.page.evaluate(
              (kind) => (kind === "selection" ? window.h.select() : window.h.reset()),
              transition,
            );
            await expect(aba.page.locator("#state")).toContainText(
              transition === "selection" ? '"id":"B"' : '"founded":false',
            );
            await aba.page.evaluate(
              (kind) => (kind === "selection" ? window.h.select("A", false, 10) : window.h.refound()),
              transition,
            );
            await expect(aba.page.locator("#state")).toContainText('"revision":10');
            const selected = await aba.snapshot();
            const index = await aba.page.evaluate(() => window.h.old());
            await aba.settle(index);
            assert.deepEqual(await aba.snapshot(), selected);
            assert.equal(aba.requests.length, 0, "A retained prior-selection callback cannot regain ownership by ID");
          } finally {
            await aba.close();
          }
        }

        const hydrate = await mount(strict, width, { hold, hydrate: true, opening: action === "continue" });
        try {
          const index = await hydrate.launch(action);
          await expect.poll(() => hydrate.held.length).toBe(1);
          await hydrate.page.evaluate(() => window.h.hydrate());
          await expect(hydrate.page.locator("#state")).toContainText('"founded":true');
          await hydrate.release();
          await hydrate.settle(index);
          assert.equal(
            (await hydrate.state()).revision,
            2,
            "Initial snapshot hydration does not retire a current action",
          );
          assert.equal((await hydrate.state()).busy, false);
          assert.equal(hydrate.requests.filter((request) => request.method === "POST").length, 1);
        } finally {
          await hydrate.close();
        }

        for (const retire of [false, true]) {
          const marker = await mount(strict, width, { hold });
          try {
            await marker.page.evaluate(() => window.h.marker());
            const pointer = (await marker.refs()).completion;
            const index = await marker.launch(action);
            await expect.poll(() => marker.held.length).toBe(1);
            assert.deepEqual(
              (await marker.refs()).completion,
              pointer,
              "Move/Continue do not publish a polling-suppression marker",
            );
            if (retire) {
              await marker.page.evaluate(() => window.h.unfound());
              await expect(marker.page.locator("#state")).toContainText('"busy":false');
              assert.deepEqual(
                (await marker.refs()).completion,
                pointer,
                "Retirement preserves the captured marker it did not publish",
              );
            }
            await marker.release();
            await marker.settle(index);
            assert.deepEqual(
              (await marker.refs()).completion,
              pointer,
              "Move/Continue completion preserves the prior marker",
            );
          } finally {
            await marker.close();
          }
        }

        const replacement = await mount(strict, width, { hold });
        try {
          const index = await replacement.launch(action);
          await expect.poll(() => replacement.held.length).toBe(1);
          await replacement.page.evaluate(() => window.h.select());
          await expect(replacement.page.locator("#state")).toContainText('"id":"B"');
          const second = await replacement.launch(action);
          if (action === "move") await expect.poll(() => replacement.held.length).toBe(2);
          else await expect.poll(() => replacement.requests.length).toBe(2);
          const old = replacement.held.shift();
          await old.route.fulfill(old.response);
          await replacement.settle(index);
          assert.equal((await replacement.state()).busy, true);
          const current = replacement.held.shift();
          await current.route.fulfill({
            ...current.response,
            body: JSON.stringify(action === "move" ? { operation: null } : { session: scene("B") }),
          });
          await replacement.settle(second);
          assert.equal((await replacement.state()).id, "B");
          assert.equal((await replacement.state()).busy, false);
        } finally {
          await replacement.close();
        }
      }

      for (const stage of ["zone", "recovery-operation", "active", "archive"]) {
        const f = await mount(strict, width, { hold: stage, fail: stage !== "zone", archive: stage === "archive" });
        try {
          const index = await f.launch("move");
          await expect.poll(() => f.held.length).toBe(1);
          await f.page.evaluate(() => window.h.select("B", true));
          await expect(f.page.locator("#state")).toContainText('"id":"B"');
          const selected = await f.snapshot(),
            count = f.requests.length;
          await f.release();
          await f.settle(index);
          assert.deepEqual(await f.snapshot(), selected, "Retired Move recovery preserves every replacement field/ref");
          assert.equal(f.requests.length, count, "Recovery stops before its next read after retirement");
        } finally {
          await f.close();
        }
      }

      for (const action of ["move", "continue"]) {
        const f = await mount(strict, width, { hold: action === "move" ? "zone" : "continue", fail: true });
        try {
          const index = await f.launch(action);
          await expect.poll(() => f.held.length).toBe(1);
          await f.page.evaluate(() => window.h.select("B", true));
          await expect(f.page.locator("#state")).toContainText('"id":"B"');
          const selected = await f.snapshot();
          await f.release();
          await f.settle(index);
          assert.deepEqual(
            await f.snapshot(),
            selected,
            "Retired failure preserves replacement error and pending state",
          );
        } finally {
          await f.close();
        }
      }

      for (const recovered of [false, true]) {
        const saved = {
          id: "saved-move",
          kind: "move",
          status: "failed",
          attemptId: "saved-attempt",
          input: { zoneId: "private-A" },
        };
        const f = await mount(strict, width, { fail: true, recovered, closed: recovered, archive: recovered, saved });
        try {
          const index = await f.launch("move");
          await f.settle(index);
          const state = await f.state();
          assert.equal(state.busy, false);
          assert.equal(state.error, recovered ? "" : "Exact action failure");
          assert.equal(state.mode, recovered ? "chat" : "move");
          assert.equal((await f.refs()).move, recovered ? null : "saved-move");
          assert.deepEqual(f.requests.find((request) => request.kind === "zone").body, {
            sessionId: "A",
            zoneId: "private-A",
            operationId: "saved-move",
            expectedSceneRevision: 0,
            retryOfAttemptId: "saved-attempt",
          });
          assert.equal(f.requests.filter((request) => request.method === "POST").length, 1);
          assert.equal(await f.page.evaluate(() => window.loads), recovered ? 1 : 0);
        } finally {
          await f.close();
        }
      }
      const failedContinue = await mount(strict, width, { fail: true, opening: true });
      try {
        const index = await failedContinue.launch("continue");
        await failedContinue.settle(index);
        assert.equal((await failedContinue.state()).error, "Exact action failure");
        assert.equal((await failedContinue.state()).busy, false);
        assert.equal((await failedContinue.refs()).flight, false);
        assert.deepEqual(
          failedContinue.requests.map((request) => request.body),
          [{ sessionId: "A" }],
        );
      } finally {
        await failedContinue.close();
      }
    }
  }
  console.log(
    "Mounted Scene actions: current/duplicate, replacement/reset/closure/disposal, ABA, independent admission, exact resend and recovery stages passed in normal/StrictMode desktop/mobile",
  );
}
