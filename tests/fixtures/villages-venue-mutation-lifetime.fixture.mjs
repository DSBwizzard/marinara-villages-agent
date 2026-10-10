import assert from "node:assert/strict";
import { build } from "esbuild";
import { expect } from "./fast-browser-expect.mjs";
import { snapshot as fixture } from "./villages-scene-browser.fixture.mjs";

/** Actual Venue commands, stable setter capabilities and independently held synthetic responses. */
export async function verifyVenueMutationLifetimes(browser) {
  const bundle = await build({
    stdin: {
      loader: "tsx",
      resolveDir: process.cwd(),
      contents: `
import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';import {StrictMode,useState,useCallback} from 'react';
import {useSaveVenue,useRemoveVenue,useDecideVenueRequest} from './packages/villages/src/client/features/venues/actions.js';
import {useSaveStoryPace,useSaveSettings} from './packages/villages/src/client/features/settings/actions.js';
function Harness(){
 const [snapshot,rawSnapshot]=useState(window.seed),[busy,rawBusy]=useState(false),[error,rawError]=useState(''),
 [venueEditDraft,rawEditor]=useState(window.draft),[venuesDraft,rawRows]=useState(window.initialRows),
 [requestEdits,rawEdits]=useState(window.overrides),[menu,rawMenu]=useState('village');
 const setSnapshot=useCallback(v=>{window.calls.snapshot++;rawSnapshot(v)},[]),setBusy=useCallback(v=>{window.calls.busy++;rawBusy(v)},[]),
 setSettingsError=useCallback(v=>{window.calls.error++;rawError(v)},[]),setVenueEditDraft=useCallback(v=>{window.calls.editor++;rawEditor(v)},[]),
 setVenuesDraft=useCallback(v=>{window.calls.rows++;rawRows(v)},[]),setRequestEdits=useCallback(v=>{window.calls.edits++;rawEdits(v)},[]),
 openMenu=useCallback(v=>{window.calls.menu++;rawMenu(v)},[]);
 const ports={snapshot,setSnapshot,setBusy,setSettingsError,setVenueEditDraft,setVenuesDraft,requestEdits,setRequestEdits,openMenu};
 const save=useSaveVenue(ports),remove=useRemoveVenue(ports),decide=useDecideVenueRequest(ports),pace=useSaveStoryPace(ports),settings=useSaveSettings({...ports,
 knowledgeDraft:'',personaDraft:'',settingDraft:'',lorebookDraft:[],loreTokenBudgetDraft:1600,acceptSavedSettings:()=>window.acks++});
 const commands={save:()=>save(venueEditDraft),remove:()=>remove(window.targetId),approve:()=>decide(window.entry,true),deny:()=>decide(window.entry,false),pace:()=>pace('quiet'),settings};
 const launch=fn=>{window.pending.push(fn());return window.pending.length-1},run=kind=>launch(commands[kind]);
 const reset=()=>{rawSnapshot({...window.seed,isFounded:false,settings:{...window.seed.settings,setting:'reset'}});rawBusy(true)};
 window.onConfirm=()=>{if(window.retireOnConfirm)flushSync(reset)};
 window.h={run,twice:kind=>{run(kind);run(kind)},cross:kinds=>kinds.forEach(run),retain:kind=>{window.old=commands[kind]},old:()=>launch(window.old),reset,
 resetDone:()=>rawBusy(false),refound:()=>{rawSnapshot({...window.seed,isFounded:true,settings:{...window.seed.settings,setting:'B'}});rawEditor({...window.draft,name:'B editor'})},
 hydrate:()=>rawSnapshot(current=>({...current,isFounded:true})),edit:patch=>rawEditor(current=>({...current,...patch})),
 editRequest:()=>rawEdits(current=>({...current,[window.entry.id]:{...window.entry.venueDraft,name:'newer request'}})),
 append:()=>rawRows(rows=>[...rows,{...window.draft,id:'returned',name:'Concurrent row'}]),local:()=>launch(()=>remove('local')),
 read:()=>({setting:snapshot.settings.setting,founded:snapshot.isFounded,busy,error,editor:venueEditDraft,rows:venuesDraft.map(v=>({id:v.id,name:v.name})),edits:requestEdits,menu})};
 return <pre id='state'>{JSON.stringify(window.h.read())}</pre>;
}window.pending=[];window.acks=0;window.confirms=[];window.calls={snapshot:0,busy:0,error:0,editor:0,rows:0,edits:0,menu:0};
window.confirm=note=>{window.confirms.push(note);window.onConfirm();return window.acceptConfirm!==false};
const root=createRoot(document.getElementById('root'));window.unmount=()=>root.render(null);root.render(window.strict?<StrictMode><Harness/></StrictMode>:<Harness/>);
`,
    },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    jsx: "automatic",
  });
  const emptyDependencies = {
    residentCharacterIds: [],
    playerHome: false,
    workerCharacterIds: [],
    pendingMailCount: 0,
    pendingResidenceCharacterIds: [],
    remapCount: 0,
    roomPresent: false,
    eventCount: 0,
  };
  async function mount(strict, width, options = {}) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage(),
      requests = [],
      errors = [];
    const seed = structuredClone(fixture);
    seed.isFounded = options.founded ?? true;
    if (options.hydrate) delete seed.isFounded;
    seed.settings.setting = "A";
    seed.settings.venues[0].id = "venue / A";
    const draft = structuredClone(seed.settings.venues[0]);
    if (options.create) Object.assign(draft, { id: "new draft", name: " New Café ", classes: ["gathering"] });
    const entry = {
      id: "request / A",
      venueDraft: { name: "Fallback name", classes: ["gathering"], description: "Fallback description" },
    };
    const overrides = { unrelated: { name: "Keep", classes: ["other"], description: "Keep" } };
    if (!options.fallback)
      overrides[entry.id] = { name: "Counteroffer", classes: ["workplace"], description: "Edited description" };
    // The local suggestion exists only in the editable rows, not the saved snapshot.
    const initialRows = options.local ? [...seed.settings.venues, { ...draft, id: "local" }] : seed.settings.venues;
    page.on("pageerror", (cause) => errors.push(cause.message));
    await page.route("http://venue-mutations.test/", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: '<div id="root"></div>' }),
    );
    await page.route("**/api/villages**", (route) =>
      requests.push({
        route,
        path: new URL(route.request().url()).pathname,
        method: route.request().method(),
        body: route.request().postDataJSON(),
      }),
    );
    await page.goto("http://venue-mutations.test/");
    await page.evaluate(
      ({ seed, draft, entry, overrides, strict, initialRows }) =>
        Object.assign(window, { seed, draft, entry, overrides, strict, initialRows }),
      { seed, draft, entry, overrides, strict, initialRows },
    );
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const state = async () => JSON.parse(await page.locator("#state").textContent());
    await expect.poll(async () => (await state()).setting).toBe("A");
    return {
      page,
      requests,
      state,
      seed,
      draft,
      entry,
      overrides,
      run: (kind) => page.evaluate((kind) => window.h.run(kind), kind),
      settle: (index) => page.evaluate((index) => window.pending[index], index),
      reply: async (index, options = {}) => {
        const snapshot = structuredClone(seed);
        snapshot.isFounded = options.founded ?? seed.isFounded ?? true;
        snapshot.settings.setting = "Reply " + index;
        snapshot.settings.venues[0].name = "Canonical saved Venue";
        if (requests[index].method === "DELETE")
          snapshot.settings.venues = snapshot.settings.venues.filter((venue) => venue.id !== "venue / A");
        if (options.returned)
          snapshot.settings.venues.push({ ...draft, id: "returned", name: options.create ? "new café" : "Returned" });
        await requests[index].route.fulfill({
          status: options.fail ? 502 : 200,
          contentType: "application/json",
          body: JSON.stringify(
            options.fail
              ? { error: "synthetic venue failure" }
              : requests[index].path.endsWith("/dependencies")
                ? { ...emptyDependencies, ...options.dependencies }
                : snapshot,
          ),
        });
      },
      finish: async () => {
        assert.deepEqual(errors, []);
        await context.close();
      },
    };
  }
  async function resetAndRefound(f) {
    await f.page.evaluate(() => window.h.reset());
    await expect.poll(async () => (await f.state()).founded).toBe(false);
    assert.equal((await f.state()).busy, true, "retirement cannot clear StartOver busy");
    await f.page.evaluate(() => {
      window.h.resetDone();
      window.h.refound();
    });
    await expect.poll(async () => (await f.state()).setting).toBe("B");
  }
  for (const width of [1280, 390])
    for (const strict of [false, true]) {
      // Current Save preserves existing PUT and new Project POST, including no immediate returned Venue.
      for (const create of [false, true])
        for (const fail of [false, true]) {
          const f = await mount(strict, width, { create });
          await f.run("save");
          await expect.poll(() => f.requests.length).toBe(1);
          assert.equal(
            f.requests[0].path,
            create ? "/api/villages/projects" : "/api/villages/locations/venue/venue%20%2F%20A",
          );
          assert.equal(f.requests[0].method, create ? "POST" : "PUT");
          assert.deepEqual(f.requests[0].body, {
            name: f.draft.name,
            ...(create ? { classes: ["gathering"] } : {}),
            description: f.draft.description,
          });
          await f.reply(0, { fail });
          await f.settle(0);
          const after = await f.state();
          assert.equal(after.busy, false);
          assert.equal(after.editor?.name ?? null, fail ? f.draft.name : null);
          assert.equal(after.menu, !fail && create ? "projects" : "village");
          if (fail) assert.match(after.error, /synthetic venue failure/);
          else assert.equal(after.setting, "Reply 0");
          assert.equal(f.requests.length, 1);
          await f.finish();
        }
      for (const id of ["venue / A", "another editor"]) {
        const f = await mount(strict, width);
        await f.run("save");
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page.evaluate((id) => window.h.edit({ id, name: "Newer editor" }), id);
        await f.reply(0);
        await f.settle(0);
        assert.equal((await f.state()).editor.name, "Newer editor");
        assert.equal((await f.state()).editor.id, id);
        await f.finish();
      }
      {
        const f = await mount(strict, width, { create: true });
        await f.run("save");
        await expect.poll(() => f.requests.length).toBe(1);
        await f.reply(0, { returned: true, create: true });
        await f.settle(0);
        assert.equal(
          (await f.state()).rows.some((row) => row.id === "returned"),
          true,
        );
        assert.equal((await f.state()).menu, "projects");
        await f.finish();
      }
      // Decide captures its override/fallback, preserves later edits, and merges against current rows.
      for (const fallback of [false, true])
        for (const approved of [false, true]) {
          const f = await mount(strict, width, { fallback });
          await f.run(approved ? "approve" : "deny");
          await expect.poll(() => f.requests.length).toBe(1);
          assert.equal(
            f.requests[0].path,
            `/api/villages/venue-requests/request%20%2F%20A/${approved ? "approve" : "deny"}`,
          );
          assert.equal(f.requests[0].method, "POST");
          assert.deepEqual(
            f.requests[0].body,
            approved ? (fallback ? f.entry.venueDraft : f.overrides[f.entry.id]) : null,
          );
          await f.reply(0, { returned: approved });
          await f.settle(0);
          const after = await f.state();
          assert.equal(after.busy, false);
          assert.deepEqual(after.edits, { unrelated: f.overrides.unrelated });
          assert.equal(
            after.rows.some((row) => row.id === "returned"),
            approved,
          );
          await f.finish();
        }
      for (const approved of [false, true])
        for (const fallback of [false, true]) {
          const f = await mount(strict, width, { fallback });
          await f.run(approved ? "approve" : "deny");
          await expect.poll(() => f.requests.length).toBe(1);
          await f.page.evaluate(() => {
            window.h.editRequest();
            window.h.append();
          });
          await f.reply(0, { returned: true });
          await f.settle(0);
          const after = await f.state();
          assert.equal(after.edits[f.entry.id].name, "newer request");
          assert.deepEqual(
            after.rows.filter((row) => row.id === "returned"),
            [{ id: "returned", name: "Concurrent row" }],
          );
          await f.finish();
        }
      for (const kind of ["approve", "deny"]) {
        const f = await mount(strict, width);
        const before = await f.state();
        await f.run(kind);
        await expect.poll(() => f.requests.length).toBe(1);
        await f.reply(0, { fail: true });
        await f.settle(0);
        const after = await f.state();
        assert.equal(after.setting, before.setting);
        assert.deepEqual(after.edits, before.edits);
        assert.deepEqual(after.rows, before.rows);
        assert.match(after.error, /synthetic venue failure/);
        assert.equal(after.busy, false);
        await f.finish();
      }
      // Removal keeps the complete dependency blocker precedence and exact confirmation behavior.
      for (const [dependencies, expected] of [
        [
          { roomPresent: true, pendingMailCount: 2, playerHome: true },
          "End the active Scene before deleting this Venue.",
        ],
        [{ pendingMailCount: 2, playerHome: true }, "Resolve pending Venue decisions before deleting this Venue."],
        [{ playerHome: true }, "Move every resident, including yourself, before deleting this Residence."],
        [
          { residentCharacterIds: ["resident"] },
          "Move every resident, including yourself, before deleting this Residence.",
        ],
      ]) {
        const f = await mount(strict, width);
        await f.page.evaluate(() => (window.targetId = "venue / A"));
        await f.run("remove");
        await expect.poll(() => f.requests.length).toBe(1);
        await f.reply(0, { dependencies });
        await f.settle(0);
        assert.equal((await f.state()).error, expected);
        assert.equal((await f.state()).busy, false);
        assert.equal(f.requests.length, 1);
        assert.deepEqual(await f.page.evaluate(() => window.confirms), []);
        await f.finish();
      }
      for (const accept of [false, true]) {
        const f = await mount(strict, width);
        await f.page.evaluate((accept) => {
          window.targetId = "venue / A";
          window.acceptConfirm = accept;
        }, accept);
        await f.run("remove");
        await expect.poll(() => f.requests.length).toBe(1);
        assert.equal(f.requests[0].method, "GET");
        await f.reply(0);
        if (accept) {
          await expect.poll(() => f.requests.length).toBe(2);
          assert.equal(f.requests[1].method, "DELETE");
          assert.deepEqual(f.requests[1].body, { confirmed: true });
          await f.reply(1);
        }
        await f.settle(0);
        assert.deepEqual(await f.page.evaluate(() => window.confirms), ["Delete The Mill?"]);
        assert.equal((await f.state()).busy, false);
        assert.equal(
          (await f.state()).rows.some((row) => row.id === "venue / A"),
          !accept,
        );
        await f.finish();
      }
      {
        const f = await mount(strict, width, { local: true });
        const before = await f.page.evaluate(() => ({ ...window.calls }));
        await f.page.evaluate(() => window.h.local());
        await f.settle(0);
        const calls = await f.page.evaluate(() => ({ ...window.calls }));
        assert.equal(f.requests.length, 0);
        assert.deepEqual(await f.page.evaluate(() => window.confirms), []);
        assert.equal(calls.busy, before.busy);
        assert.equal(calls.error, before.error);
        assert.equal(
          (await f.state()).rows.some((row) => row.id === "local"),
          false,
        );
        await f.run("pace");
        await expect.poll(() => f.requests.length).toBe(1);
        await f.reply(0);
        await f.settle(1);
        await f.finish();
      }
      for (const kind of ["save", "approve", "deny", "remove"]) {
        const f = await mount(strict, width);
        await f.page.evaluate((kind) => {
          window.targetId = "venue / A";
          window.h.twice(kind);
        }, kind);
        await expect.poll(() => f.requests.length).toBe(1);
        await f.reply(0);
        if (kind === "remove") {
          await expect.poll(() => f.requests.length).toBe(2);
          await f.reply(1);
        }
        await f.page.evaluate(() => Promise.all(window.pending));
        assert.equal(f.requests.length, kind === "remove" ? 2 : 1);
        await f.finish();
      }
      // Same-key admission also protects actual Settings commands in either order.
      for (const kinds of [
        ["save", "pace"],
        ["pace", "save"],
        ["approve", "save"],
        ["save", "approve"],
      ]) {
        const f = await mount(strict, width);
        await f.page.evaluate((kinds) => window.h.cross(kinds), kinds);
        await expect.poll(() => f.requests.length).toBe(1);
        await f.reply(0);
        await f.page.evaluate(() => Promise.all(window.pending));
        assert.equal(f.requests.length, 1);
        await f.finish();
      }
      for (const kind of ["save", "approve", "deny"])
        for (const fail of [false, true]) {
          const f = await mount(strict, width);
          await f.run(kind);
          await expect.poll(() => f.requests.length).toBe(1);
          await resetAndRefound(f);
          await f.run("settings");
          await expect.poll(() => f.requests.length).toBe(2);
          const before = await f.state();
          await f.reply(0, { fail });
          await f.settle(0);
          assert.deepEqual(await f.state(), before);
          assert.equal(await f.page.evaluate(() => window.acks), 0);
          await f.reply(1);
          await f.settle(1);
          assert.equal((await f.state()).busy, false);
          assert.equal(await f.page.evaluate(() => window.acks), 1);
          await f.finish();
        }
      for (const retireAt of ["dependencies", "delete", "confirm"]) {
        const f = await mount(strict, width);
        await f.page.evaluate((retireAt) => {
          window.targetId = "venue / A";
          window.retireOnConfirm = retireAt === "confirm";
        }, retireAt);
        await f.run("remove");
        await expect.poll(() => f.requests.length).toBe(1);
        if (retireAt === "dependencies") {
          await resetAndRefound(f);
          await f.reply(0);
        } else {
          await f.reply(0);
          if (retireAt === "delete") {
            await expect.poll(() => f.requests.length).toBe(2);
            await resetAndRefound(f);
            const before = await f.state();
            await f.reply(1);
            await f.settle(0);
            assert.deepEqual(await f.state(), before);
          }
        }
        await f.settle(0);
        if (retireAt !== "delete") assert.equal(f.requests.length, 1);
        if (retireAt === "dependencies") assert.deepEqual(await f.page.evaluate(() => window.confirms), []);
        await f.finish();
      }
      for (const kind of ["save", "approve", "deny", "remove"]) {
        const f = await mount(strict, width);
        await f.page.evaluate((kind) => {
          window.targetId = "venue / A";
          window.h.retain(kind);
        }, kind);
        await resetAndRefound(f);
        const before = await f.state();
        await f.page.evaluate(() => window.h.old());
        await f.settle(0);
        assert.equal(f.requests.length, 0);
        assert.deepEqual(await f.state(), before);
        await f.finish();
      }
      for (const kind of ["save", "approve", "remove"]) {
        const f = await mount(strict, width, { founded: false });
        await f.page.evaluate(() => (window.targetId = "venue / A"));
        await f.run(kind);
        await expect.poll(() => f.requests.length).toBe(1);
        await f.reply(0, { founded: false });
        if (kind === "remove") {
          await expect.poll(() => f.requests.length).toBe(2);
          await f.reply(1, { founded: false });
        }
        await f.settle(0);
        assert.equal((await f.state()).founded, false);
        assert.equal((await f.state()).busy, false);
        await f.finish();
      }
      {
        const f = await mount(strict, width, { hydrate: true });
        await f.run("approve");
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page.evaluate(() => window.h.hydrate());
        await f.reply(0);
        await f.settle(0);
        assert.equal((await f.state()).setting, "Reply 0");
        assert.equal((await f.state()).busy, false);
        await f.finish();
      }
      for (const kind of ["save", "approve", "deny", "remove"])
        for (const fail of [false, true]) {
          const f = await mount(strict, width);
          await f.page.evaluate(() => (window.targetId = "venue / A"));
          await f.run(kind);
          await expect.poll(() => f.requests.length).toBe(1);
          await f.page.evaluate(() => window.unmount());
          await expect(f.page.locator("#state")).toHaveCount(0);
          const before = await f.page.evaluate(() => ({ ...window.calls }));
          await f.reply(0, { fail });
          await f.settle(0);
          assert.deepEqual(await f.page.evaluate(() => window.calls), before);
          assert.equal(f.requests.length, 1);
          await f.finish();
        }
    }
  console.log(
    "Venue mutation lifetimes: current Save/Remove/Decide contracts, shared Settings admission, guarded delete continuation, newer drafts, replacement ownership and disposal passed (mounted hooks, synthetic HTTP; desktop/mobile and StrictMode).",
  );
}
