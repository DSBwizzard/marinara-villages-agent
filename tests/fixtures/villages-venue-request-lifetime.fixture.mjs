import assert from "node:assert/strict";
import { build } from "esbuild";
import { expect } from "@playwright/test";
import { snapshot as fixture } from "./villages-scene-browser.fixture.mjs";

/** Actual request-page commands and UI, with independently held provider-free HTTP. */
export async function createVenueRequestHarness(browser) {
  const bundle = await build({
    stdin: {
      loader: "tsx",
      resolveDir: process.cwd(),
      contents: `
import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';import {StrictMode,useState,useCallback} from 'react';
import {useVenueRequestCommands} from './packages/villages/src/client/features/venues/request-commands.js';
import {renderVenueRequestsPage} from './packages/villages/src/client/features/venues/VenueRequestsPage.js';
import {useSaveStoryPace} from './packages/villages/src/client/features/settings/actions.js';
function Harness(){
 const [snapshot,rawSnapshot]=useState(window.seed),[busy,rawBusy]=useState(false),[error,rawError]=useState(''),[edits,rawEdits]=useState(window.overrides);
 const setSnapshot=useCallback(v=>{window.calls.snapshot++;rawSnapshot(v)},[]),setBusy=useCallback(v=>{window.calls.busy++;rawBusy(v)},[]),
 setSettingsError=useCallback(v=>{window.calls.error++;rawError(v)},[]),setRequestEdits=useCallback(v=>{window.calls.edits++;rawEdits(v)},[]);
 const ports={snapshot,setSnapshot,setBusy,setSettingsError,setRequestEdits,requestEdits:edits};
 const commands=useVenueRequestCommands(ports),pace=useSaveStoryPace(ports);
 const launch=fn=>{const promise=fn();window.pending.push(Promise.resolve(promise));return window.pending.length-1};
 const actions={description:()=>commands.generateRequestDescription(window.entry,edits[window.entry.id]??snapshot.venueRequests[0].venueDraft),
 upgradeApprove:()=>commands.decideHomeUpgrade({id:'upgrade / A'},true),upgradeDeny:()=>commands.decideHomeUpgrade({id:'upgrade / A'},false),
 complete:()=>commands.completeResidenceMove({characterId:'resident / A'}),
 residenceApprove:()=>commands.decideResidenceMove({characterId:'resident / A'},true),residenceDeny:()=>commands.decideResidenceMove({characterId:'resident / A'},false),pace:()=>pace('quiet')};
 const ui=Object.fromEntries(Object.entries(commands).map(([name,fn])=>[name,(...args)=>{const promise=fn(...args);window.pending.push(Promise.resolve(promise));return promise}]));
 window.h={run:kind=>launch(actions[kind]),twice:kind=>{launch(actions[kind]);launch(actions[kind])},cross:kinds=>kinds.forEach(kind=>launch(actions[kind])),
 retain:kind=>{window.old=actions[kind]},old:()=>launch(window.old),edit:patch=>rawEdits(current=>({...current,[window.entry.id]:{...(current[window.entry.id]??snapshot.venueRequests[0].venueDraft),...patch}})),
 source:patch=>rawSnapshot(current=>({...current,venueRequests:patch===null?[]:current.venueRequests.map(entry=>({...entry,venueDraft:{...entry.venueDraft,...patch}}))})),
 replaceSource:draft=>rawSnapshot(current=>({...current,venueRequests:current.venueRequests.map(entry=>({...entry,venueDraft:draft}))})),
 reset:()=>flushSync(()=>{rawSnapshot({...window.seed,isFounded:false,settings:{...window.seed.settings,setting:'reset'}});rawBusy(true)}),
 refound:()=>flushSync(()=>{rawSnapshot({...window.seed,isFounded:true,settings:{...window.seed.settings,setting:'B'}});rawBusy(false);rawError('B marker')}),
 hydrate:()=>rawSnapshot(current=>({...current,isFounded:true})),protect:()=>rawError('B marker'),
 read:()=>({setting:snapshot.settings.setting,founded:snapshot.isFounded,busy,error,edits})};
 return <><pre id='state'>{JSON.stringify(window.h.read())}</pre>{renderVenueRequestsPage({...ui,snapshot,busy,settingsError:error,requestEdits:edits,setRequestEdits,
 decideVenueRequest:async()=>{},nameOfCharacter:()=> 'Resident'})}</>;
}
window.pending=[];window.calls={snapshot:0,busy:0,error:0,edits:0};const root=createRoot(document.getElementById('root'));
window.unmount=()=>root.render(null);root.render(window.strict?<StrictMode><Harness/></StrictMode>:<Harness/>);
`,
    },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    jsx: "automatic",
  });
  return async function mount(strict = false, width = 1280, options = {}) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage(),
      requests = [],
      errors = [];
    const seed = structuredClone(fixture);
    seed.isFounded = options.founded ?? true;
    if (options.hydrate) delete seed.isFounded;
    seed.settings.setting = "A";
    const entry = {
      id: "request / A",
      requesterName: "Resident",
      venueDraft: { name: " Fallback ", classes: ["gathering"], description: "Fallback description" },
    };
    seed.venueRequests = [entry];
    seed.upgradeRequests = [];
    seed.residences = [];
    const overrides = { unrelated: { name: "Keep", classes: ["other"], description: "Keep" } };
    if (!options.fallback)
      overrides[entry.id] = { name: " Counteroffer ", classes: ["workplace"], description: "Original description" };
    page.on("pageerror", (cause) => errors.push(cause.message));
    await page.route("http://venue-requests.test/", (route) =>
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
    await page.goto("http://venue-requests.test/");
    await page.evaluate((values) => Object.assign(window, values), { seed, entry, overrides, strict });
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const state = () => page.evaluate(() => window.h.read());
    await expect.poll(async () => (await state()).setting).toBe("A");
    return {
      page,
      requests,
      state,
      seed,
      entry,
      overrides,
      run: (kind) => page.evaluate((kind) => window.h.run(kind), kind),
      settle: (index) => page.evaluate((index) => window.pending[index], index),
      reply: async (index, options = {}) => {
        const snapshot = structuredClone(seed);
        snapshot.isFounded = options.founded ?? seed.isFounded ?? true;
        snapshot.settings.setting = options.setting ?? "Reply " + index;
        const body = options.fail
          ? { error: "synthetic request failure" }
          : requests[index].path.endsWith("/descriptions/draft")
            ? { descriptions: options.missing ? {} : { [entry.id]: "Generated description" } }
            : snapshot;
        await requests[index].route.fulfill({
          status: options.fail ? 502 : 200,
          contentType: "application/json",
          body: JSON.stringify(body),
        });
      },
      finish: async () => {
        assert.deepEqual(errors, []);
        await context.close();
      },
    };
  };
}

export async function verifyVenueRequestLifetimes(browser) {
  const mount = await createVenueRequestHarness(browser);
  const commands = ["description", "upgradeApprove", "upgradeDeny", "complete", "residenceApprove", "residenceDeny"];
  const paths = {
    description: "/locations/venue/descriptions/draft",
    upgradeApprove: "/venue-upgrades/upgrade%20%2F%20A/approve",
    upgradeDeny: "/venue-upgrades/upgrade%20%2F%20A/deny",
    complete: "/residences/debug/complete-now",
    residenceApprove: "/residences/approvals",
    residenceDeny: "/residences/denials",
  };
  async function reset(f) {
    await f.page.evaluate(() => window.h.reset());
    await expect.poll(async () => (await f.state()).founded).toBe(false);
    assert.equal((await f.state()).busy, true);
    await f.page.evaluate(() => window.h.refound());
    await expect.poll(async () => (await f.state()).setting).toBe("B");
  }
  for (const width of [1280, 390])
    for (const strict of [false, true]) {
      for (const kind of commands)
        for (const fail of [false, true]) {
          const f = await mount(strict, width);
          await f.run(kind);
          await expect.poll(() => f.requests.length).toBe(1);
          assert.equal(f.requests[0].path, "/api/villages" + paths[kind]);
          assert.equal(f.requests[0].method, "POST");
          assert.deepEqual(
            f.requests[0].body,
            kind === "description"
              ? { venues: [{ id: f.entry.id, name: " Counteroffer ", classes: ["workplace"] }] }
              : kind.startsWith("upgrade")
                ? null
                : { characterId: "resident / A" },
          );
          await f.reply(0, { fail });
          await f.settle(0);
          await expect.poll(async () => (await f.state()).busy).toBe(false);
          const current = await f.state();
          assert.equal(current.error, fail ? "synthetic request failure" : "");
          if (kind === "description")
            assert.equal(
              current.edits[f.entry.id].description,
              fail ? "Original description" : "Generated description",
            );
          else assert.equal(current.setting, fail ? "A" : "Reply 0");
          assert.deepEqual(current.edits.unrelated, f.overrides.unrelated);
          await f.finish();
        }
      for (const missing of [false, true]) {
        const f = await mount(strict, width, { fallback: true });
        await f.run("description");
        await expect.poll(() => f.requests.length).toBe(1);
        assert.deepEqual(f.requests[0].body, {
          venues: [{ id: f.entry.id, name: " Fallback ", classes: ["gathering"] }],
        });
        await f.reply(0, { missing });
        await f.settle(0);
        assert.equal((await f.state()).edits[f.entry.id].description, missing ? "" : "Generated description");
        await f.finish();
      }
      // Exercise the actual page input handlers while the generator response waits.
      {
        const f = await mount(strict, width);
        await f.page.getByRole("button", { name: "Generate description draft", exact: true }).click();
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page
          .getByRole("textbox", { name: "Requested place name from Resident", exact: true })
          .fill("Newer name");
        await f.page
          .getByRole("combobox", { name: "Requested place class from Resident", exact: true })
          .selectOption("other");
        await f.page
          .getByRole("textbox", { name: "Requested place description from Resident", exact: true })
          .fill(" Newer raw description ");
        const submitted = (await f.state()).edits[f.entry.id];
        await f.reply(0);
        await f.settle(0);
        assert.deepEqual((await f.state()).edits[f.entry.id], submitted);
        await f.finish();
      }
      for (const source of [{ name: "New fallback" }, null]) {
        const f = await mount(strict, width, { fallback: true });
        await f.run("description");
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page.evaluate((source) => window.h.source(source), source);
        await f.reply(0);
        await f.settle(0);
        assert.equal(
          (await f.state()).edits[f.entry.id],
          undefined,
          "changed or removed fallback source is not overwritten",
        );
        await f.finish();
      }
      {
        const f = await mount(strict, width, { fallback: true });
        await f.run("description");
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page.evaluate(() => {
          const { name, classes, description } = window.entry.venueDraft;
          window.h.replaceSource({ description, classes, name });
        });
        await f.reply(0);
        await f.settle(0);
        await expect.poll(async () => (await f.state()).edits[f.entry.id]?.description).toBe("Generated description");
        assert.equal((await f.state()).edits[f.entry.id].name, " Fallback ");
        assert.deepEqual((await f.state()).edits.unrelated, f.overrides.unrelated);
        await f.finish();
      }
      {
        const f = await mount(strict, width);
        await f.run("description");
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page.evaluate(() => window.h.source(null));
        await f.reply(0);
        await f.settle(0);
        assert.deepEqual(
          (await f.state()).edits[f.entry.id],
          f.overrides[f.entry.id],
          "deleted request cannot update a retained override",
        );
        await f.finish();
      }
      for (const first of ["description", "pace"]) {
        const f = await mount(strict, width);
        await f.page.evaluate(({ first, commands }) => window.h.cross([first, ...commands, "pace"]), {
          first,
          commands,
        });
        await expect.poll(() => f.requests.length).toBe(1);
        await f.reply(0);
        await f.page.evaluate(() => Promise.all(window.pending));
        assert.equal(f.requests.length, 1, "same-tick duplicate and cross-family/Settings admission is shared");
        await f.finish();
      }
      for (const kind of commands)
        for (const fail of [false, true]) {
          const f = await mount(strict, width);
          await f.run(kind);
          await expect.poll(() => f.requests.length).toBe(1);
          await reset(f);
          await f.page.evaluate(() => window.h.edit({ description: "B draft" }));
          await f.run("pace");
          await expect.poll(() => f.requests.length).toBe(2);
          await f.page.evaluate(() => window.h.protect());
          await f.reply(0, { fail });
          await f.settle(0);
          const current = await f.state();
          assert.equal(current.setting, "B");
          assert.equal(current.busy, true);
          assert.equal(current.error, "B marker");
          assert.equal(current.edits[f.entry.id].description, "B draft");
          await f.reply(1, { setting: "B saved" });
          await f.settle(1);
          await expect.poll(async () => (await f.state()).busy).toBe(false);
          assert.equal((await f.state()).setting, "B saved");
          await f.finish();
        }
      for (const kind of commands) {
        const f = await mount(strict, width);
        await f.page.evaluate((kind) => window.h.retain(kind), kind);
        await reset(f);
        const before = await f.page.evaluate(() => window.calls);
        const index = await f.page.evaluate(() => window.h.old());
        await f.settle(index);
        assert.equal(f.requests.length, 0);
        assert.deepEqual(await f.page.evaluate(() => window.calls), before);
        await f.finish();
      }
      for (const hydrate of [false, true]) {
        const f = await mount(strict, width, hydrate ? { hydrate: true } : { founded: false });
        await f.run("upgradeApprove");
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page.evaluate(() => window.h.hydrate());
        await expect.poll(async () => (await f.state()).founded).toBe(true);
        await f.reply(0);
        await f.settle(0);
        assert.equal((await f.state()).setting, hydrate ? "Reply 0" : "A");
        await f.finish();
      }
      for (const kind of ["description", "complete"]) {
        const f = await mount(strict, width);
        await f.run(kind);
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page.evaluate(() => window.unmount());
        await expect(f.page.locator("#state")).toHaveCount(0);
        const before = await f.page.evaluate(() => window.calls);
        await f.reply(0);
        await f.settle(0);
        assert.deepEqual(await f.page.evaluate(() => window.calls), before);
        await f.finish();
      }
    }
  console.log(
    "Venue request lifetimes: exact current requests, draft sources, shared admission, replacement Settings requests, reset/hydration, retained callbacks and disposal passed (actual hooks/page, synthetic HTTP; desktop/mobile and StrictMode).",
  );
}
