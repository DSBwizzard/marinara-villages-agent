import assert from "node:assert/strict";
import { build } from "esbuild";
import { expect } from "@playwright/test";
import { snapshot as fixture } from "./villages-scene-browser.fixture.mjs";

/** Actual Settings hooks and independently held synthetic HTTP responses. */
export async function verifySettingsRequestLifetimes(browser) {
  const kinds = ["save", "scenery", "flip", "pace", "enter", "colors", "retention", "add", "remove"];
  const bundle = await build({
    stdin: {
      loader: "tsx",
      resolveDir: process.cwd(),
      contents: `
import {createRoot} from 'react-dom/client';import {StrictMode,useState} from 'react';
import {useSettingsState} from './packages/villages/src/client/features/settings/useSettingsState.js';
import {useSaveSettings,useSaveScenerySettings,useSaveSpriteCardFlip,useSaveStoryPace,useSaveSendOnEnter,useSaveCharacterSpeechColors,useSaveVisitRetention,useAddNotice,useRemoveNotice} from './packages/villages/src/client/features/settings/actions.js';
function Harness(){
 const settings=useSettingsState(),[snapshot,setSnapshot]=useState(window.seed),[busy,setBusy]=useState(false),
 [flipDraft,setSpriteFlipDraft]=useState(null),[flipError,setSpriteFlipError]=useState(''),[flipSaving,setSpriteFlipSaving]=useState(false),
 [archive,setArchiveVersion]=useState(0),[noticeDraft,setNoticeDraft]=useState(' A notice '),
 [sceneryStyle,setSceneryStyle]=useState(' Exact scenery A '),[personalizeHomes,setPersonalizeHomes]=useState(false),[visualLoreDefault,setVisualLoreDefault]=useState(true);
 const ports={...settings,snapshot,setSnapshot,setBusy,setSpriteFlipDraft,setSpriteFlipError,setSpriteFlipSaving,setArchiveVersion,noticeDraft,setNoticeDraft,
  sceneryStyle,personalizeHomes,visualLoreDefault,acceptSavedSettings:()=>{window.acks++}};
 const save=useSaveSettings(ports),scenery=useSaveScenerySettings(ports),flip=useSaveSpriteCardFlip(ports),pace=useSaveStoryPace(ports),enter=useSaveSendOnEnter(ports),colors=useSaveCharacterSpeechColors(ports),retention=useSaveVisitRetention(ports),add=useAddNotice(ports),remove=useRemoveNotice(ports);
 const commands={save,scenery,flip:()=>flip(window.flipValue??true),pace:()=>pace('quiet'),enter:()=>enter(true),colors:()=>colors(false),retention:()=>retention({mode:'count',value:20}),add,remove:()=>remove(0)};
 const launch=work=>{window.pending.push(work());return window.pending.length-1},run=kind=>launch(commands[kind]);
 window.h={run,twice:kind=>{run(kind);run(kind)},cross:()=>{run('pace');run('enter')},crossScenery:reverse=>{run(reverse?'pace':'scenery');run(reverse?'scenery':'pace')},independent:()=>{run('flip');run('pace')},
  editScenery:()=>{setSceneryStyle('Newer scenery');setPersonalizeHomes(true);setVisualLoreDefault(false)},
  retain:kind=>{window.old=commands[kind]},old:()=>launch(window.old),edit:value=>setNoticeDraft(value),
  reset:()=>{setSnapshot({...window.seed,isFounded:false,settings:{...window.seed.settings,setting:'reset'}});setBusy(true);setNoticeDraft('reset notice')},
  resetDone:()=>setBusy(false),refound:()=>{setSnapshot({...window.seed,isFounded:true,settings:{...window.seed.settings,setting:'B',sendOnEnter:true,characterSpeechColors:false}});setNoticeDraft('B notice')},
  hydrate:()=>setSnapshot(current=>({...current,isFounded:true})),
  read:()=>({setting:snapshot.settings.setting,founded:snapshot.isFounded,busy,error:settings.settingsError,flipDraft,flipError,flipSaving,archive,noticeDraft,sceneryStyle,personalizeHomes,visualLoreDefault,enter:snapshot.settings.sendOnEnter,colors:snapshot.settings.characterSpeechColors})};
 return <pre id='state'>{JSON.stringify(window.h.read())}</pre>;
}window.pending=[];window.acks=0;
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
  async function mount(strict, width, options = {}) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width === 390 });
    const page = await context.newPage(),
      requests = [],
      errors = [];
    const seed = structuredClone(fixture);
    seed.isFounded = options.founded ?? true;
    if (options.hydrate) delete seed.isFounded;
    Object.assign(seed.settings, { setting: "A", sendOnEnter: false, characterSpeechColors: true });
    page.on("pageerror", (cause) => errors.push(cause.message));
    await page.route("http://settings-lifetimes.test/", (r) =>
      r.fulfill({ status: 200, contentType: "text/html", body: '<div id="root"></div>' }),
    );
    await page.route("**/api/villages**", (route) =>
      requests.push({
        route,
        method: route.request().method(),
        path: new URL(route.request().url()).pathname,
        body: route.request().postDataJSON(),
      }),
    );
    await page.goto("http://settings-lifetimes.test/");
    await page.evaluate(
      ({ seed, strict }) => {
        window.seed = seed;
        window.strict = strict;
      },
      { seed, strict },
    );
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const state = async () => JSON.parse(await page.locator("#state").textContent());
    await expect.poll(async () => (await state()).setting).toBe("A");
    return {
      context,
      page,
      state,
      requests,
      run: (kind) => page.evaluate((kind) => window.h.run(kind), kind),
      respond: async (index, fail = false) => {
        const answer = structuredClone(seed);
        answer.isFounded = options.founded ?? true;
        answer.settings.setting = "saved " + index;
        Object.assign(answer.settings, requests[index].body);
        await requests[index].route.fulfill({
          status: fail ? 502 : 200,
          contentType: "application/json",
          body: JSON.stringify(fail ? { error: "synthetic settings failure" } : answer),
        });
      },
      settle: (index) => page.evaluate((index) => window.pending[index], index),
      finish: async () => {
        assert.deepEqual(errors, []);
        await context.close();
      },
    };
  }
  const payloads = {
    save: { promptKnowledge: "", playerPersonaId: "", setting: "", selectedLorebookIds: [], loreTokenBudget: 1600 },
    scenery: {
      sceneryArtStyle: " Exact scenery A ",
      personalizeVenueImagesByDefault: false,
      useVisualLoreByDefault: true,
    },
    flip: { spriteCardFlipEnabled: true },
    pace: { storyPace: "quiet" },
    enter: { sendOnEnter: true },
    colors: { characterSpeechColors: false },
    retention: { visitRetention: { mode: "count", value: 20 } },
    add: { notice: "A notice" },
    remove: null,
  };
  for (const width of [1280, 390])
    for (const strict of [false, true]) {
      // Current success and failure retain payloads, optimistic updates, rollback and acknowledgement.
      for (const kind of kinds)
        for (const fail of [false, true]) {
          const f = await mount(strict, width);
          await f.run(kind);
          await expect.poll(() => f.requests.length).toBe(1);
          assert.equal(f.requests[0].method, kind === "add" ? "POST" : kind === "remove" ? "DELETE" : "PATCH");
          assert.deepEqual(f.requests[0].body, payloads[kind]);
          if (kind === "enter") assert.equal((await f.state()).enter, true);
          if (kind === "colors") assert.equal((await f.state()).colors, false);
          await f.respond(0, fail);
          await f.settle(0);
          const after = await f.state();
          assert.equal(after.busy, false);
          assert.equal(after.flipSaving, false);
          assert.equal(after.archive, !fail && kind === "retention" ? 1 : 0);
          if (fail) {
            assert.equal(after.setting, "A");
            assert.equal(after.enter, false);
            assert.equal(after.colors, true);
            assert.match(kind === "flip" ? after.flipError : after.error, /synthetic settings failure/);
          } else {
            assert.equal(after.setting, kind === "save" ? "" : "saved 0");
            assert.equal(after.noticeDraft, kind === "add" ? "" : " A notice ");
          }
          assert.equal(await f.page.evaluate(() => window.acks), !fail && kind === "save" ? 1 : 0);
          await f.finish();
        }
      // Retired A success/error/rollback/finally cannot affect a real pending B request.
      for (const kind of kinds)
        for (const fail of [false, true]) {
          const f = await mount(strict, width);
          await f.run(kind);
          await expect.poll(() => f.requests.length).toBe(1);
          await f.page.evaluate(() => window.h.reset());
          await expect.poll(async () => (await f.state()).founded).toBe(false);
          assert.equal((await f.state()).busy, true, "Settings retirement must not clear StartOver busy");
          if (kind === "flip") {
            assert.equal((await f.state()).flipSaving, false);
            assert.equal((await f.state()).flipDraft, null);
          }
          await f.page.evaluate(() => {
            window.h.resetDone();
            window.h.refound();
            window.flipValue = false;
          });
          await expect.poll(async () => (await f.state()).setting).toBe("B");
          const replacement = kind === "flip" ? "flip" : kind === "pace" ? "enter" : "pace";
          await f.run(replacement);
          await expect.poll(() => f.requests.length).toBe(2);
          const before = await f.state();
          assert.equal(kind === "flip" ? before.flipSaving : before.busy, true);
          await f.respond(0, fail);
          await f.settle(0);
          assert.deepEqual(await f.state(), before);
          assert.equal(await f.page.evaluate(() => window.acks), 0);
          await f.respond(1);
          await f.settle(1);
          await f.finish();
        }
      // All same-tick duplicates and cross-group busy writers admit only one owned command.
      for (const kind of kinds) {
        const f = await mount(strict, width);
        await f.page.evaluate((kind) => window.h.twice(kind), kind);
        await expect.poll(() => f.requests.length).toBe(1);
        await f.respond(0);
        await f.page.evaluate(() => Promise.all(window.pending));
        assert.equal(f.requests.length, 1);
        await f.finish();
      }
      const cross = await mount(strict, width);
      await cross.page.evaluate(() => window.h.cross());
      await expect.poll(() => cross.requests.length).toBe(1);
      assert.deepEqual(cross.requests[0].body, { storyPace: "quiet" });
      assert.equal((await cross.state()).enter, false, "refused Enter must not apply optimism");
      await cross.respond(0);
      await cross.page.evaluate(() => Promise.all(window.pending));
      assert.equal(cross.requests.length, 1);
      await cross.finish();
      for (const reverse of [false, true]) {
        const f = await mount(strict, width);
        await f.page.evaluate((reverse) => window.h.crossScenery(reverse), reverse);
        await expect.poll(() => f.requests.length).toBe(1);
        assert.deepEqual(f.requests[0].body, reverse ? payloads.pace : payloads.scenery);
        await f.respond(0);
        await f.page.evaluate(() => Promise.all(window.pending));
        assert.equal(f.requests.length, 1);
        await f.finish();
      }
      // Saving the captured scenery does not acknowledge or overwrite newer drafts.
      for (const fail of [false, true]) {
        const f = await mount(strict, width);
        await f.run("scenery");
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page.evaluate(() => window.h.editScenery());
        await expect.poll(async () => (await f.state()).sceneryStyle).toBe("Newer scenery");
        assert.deepEqual(f.requests[0].body, payloads.scenery);
        await f.respond(0, fail);
        await f.settle(0);
        const after = await f.state();
        assert.equal(after.sceneryStyle, "Newer scenery");
        assert.equal(after.personalizeHomes, true);
        assert.equal(after.visualLoreDefault, false);
        assert.equal(await f.page.evaluate(() => window.acks), 0);
        await f.finish();
      }
      // Flip retains its separate Scene control group; finishing it leaves shared busy intact.
      const independent = await mount(strict, width);
      await independent.page.evaluate(() => window.h.independent());
      await expect.poll(() => independent.requests.length).toBe(2);
      await independent.respond(0);
      await independent.settle(0);
      assert.equal((await independent.state()).busy, true);
      assert.equal((await independent.state()).flipSaving, false);
      await independent.respond(1);
      await independent.settle(1);
      await independent.finish();
      // Current notice acknowledgement compares raw submitted text, including whitespace edits.
      for (const draft of ["newer notice", " A notice  "]) {
        const f = await mount(strict, width);
        await f.run("add");
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page.evaluate((draft) => window.h.edit(draft), draft);
        await f.respond(0);
        await f.settle(0);
        assert.equal((await f.state()).noticeDraft, draft);
        await f.finish();
      }
      const empty = await mount(strict, width);
      await empty.page.evaluate(() => window.h.edit("  "));
      await expect.poll(async () => (await empty.state()).noticeDraft).toBe("  ");
      await empty.run("add");
      await empty.settle(0);
      assert.equal(empty.requests.length, 0);
      await empty.run("pace");
      await expect.poll(() => empty.requests.length).toBe(1);
      await empty.respond(0);
      await empty.settle(1);
      await empty.finish();
      // Old callbacks do not revive after reset/refounding; new pre-founding saves are allowed.
      for (const kind of kinds) {
        const f = await mount(strict, width);
        await f.page.evaluate((kind) => window.h.retain(kind), kind);
        await f.page.evaluate(() => window.h.reset());
        await expect.poll(async () => (await f.state()).founded).toBe(false);
        await f.page.evaluate(() => {
          window.h.resetDone();
          window.h.refound();
        });
        await expect.poll(async () => (await f.state()).setting).toBe("B");
        const before = await f.state();
        await f.page.evaluate(() => window.h.old());
        await f.settle(0);
        assert.equal(f.requests.length, 0);
        assert.deepEqual(await f.state(), before);
        await f.finish();
      }
      for (const founded of [false, true]) {
        const f = await mount(strict, width, { founded });
        await f.run("pace");
        await expect.poll(() => f.requests.length).toBe(1);
        await f.respond(0);
        await f.settle(0);
        assert.equal((await f.state()).founded, founded);
        await f.finish();
      }
      const prefounded = await mount(strict, width, { founded: false });
      await prefounded.run("enter");
      await expect.poll(() => prefounded.requests.length).toBe(1);
      await prefounded.page.evaluate(() => window.h.refound());
      await expect.poll(async () => (await prefounded.state()).founded).toBe(true);
      const foundedBefore = await prefounded.state();
      await prefounded.respond(0);
      await prefounded.settle(0);
      assert.deepEqual(await prefounded.state(), foundedBefore);
      await prefounded.finish();
      const hydrate = await mount(strict, width, { hydrate: true });
      await hydrate.run("pace");
      await expect.poll(() => hydrate.requests.length).toBe(1);
      await hydrate.page.evaluate(() => window.h.hydrate());
      await hydrate.respond(0);
      await hydrate.settle(0);
      assert.equal((await hydrate.state()).setting, "saved 0");
      assert.equal((await hydrate.state()).founded, true);
      assert.equal((await hydrate.state()).busy, false);
      await hydrate.finish();
      for (const kind of kinds) {
        const f = await mount(strict, width);
        await f.run(kind);
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page.evaluate(() => window.unmount());
        await expect(f.page.locator("#state")).toHaveCount(0);
        const before = await f.page.evaluate(() => window.h.read());
        await f.respond(0, true);
        await f.settle(0);
        assert.deepEqual(await f.page.evaluate(() => window.h.read()), before);
        assert.equal(await f.page.evaluate(() => window.acks), 0);
        await f.finish();
      }
    }
  console.log(
    "Settings request lifetimes: current contracts/rollback, shared synchronous admission, real replacement requests, raw notice acknowledgement, reset/founding/hydration, retained callbacks and disposal passed (mounted hooks, synthetic HTTP; desktop/mobile and StrictMode).",
  );
}
