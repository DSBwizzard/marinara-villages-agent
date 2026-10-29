import { mockEngineLookups, fulfill } from "./browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { build } from "../../scripts/esbuild.mjs";
import { expect } from "./fast-browser-expect.mjs";
import { snapshot as fixture } from "./villages-scene-browser.fixture.mjs";

export async function createVenueScreenHarness(browser) {
  const bundle = await build({
    stdin: {
      loader: "tsx",
      resolveDir: process.cwd(),
      contents: `
import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';import {StrictMode,useState,useCallback} from 'react';
import {useVenueScreenCommands} from './packages/villages/src/client/features/venues/screen-commands.js';
import {VenueScreen} from './packages/villages/src/client/features/venues/VenueScreen.js';
import {VenueAccessPanel} from './packages/villages/src/client/features/venues/villages-venue-access.js';
import {useSaveBackgroundPace} from './packages/villages/src/client/features/settings/actions.js';
function Harness(){
const [snapshot,rawSnapshot]=useState(window.seed),[screen,setScreen]=useState('venue'),[venueId,setVenueId]=useState('A / venue'),[venuePage,setVenuePage]=useState(window.page),[venueZoneKey,setVenueZoneKey]=useState(window.initialZone);
const [busy,rawBusy]=useState(false),[settingsError,rawSettingsError]=useState(''),[venueEditBusy,rawEditBusy]=useState(false),[venueEditError,rawEditError]=useState(''),[venueEditNotice,rawNotice]=useState(''),
[venueEditDraft,rawDraft]=useState(window.draft),[venueProposalDraft,rawProposal]=useState(window.proposal),[placeProblem,rawProblem]=useState(null);
const setSnapshot=useCallback(v=>{window.calls.snapshot++;rawSnapshot(v)},[]),setBusy=useCallback(v=>{window.calls.busy++;rawBusy(v)},[]),setSettingsError=useCallback(v=>{window.calls.settingsError++;rawSettingsError(v)},[]),
setVenueEditBusy=useCallback(v=>{window.calls.editBusy++;rawEditBusy(v)},[]),setVenueEditError=useCallback(v=>{window.calls.editError++;rawEditError(v)},[]),setVenueEditNotice=useCallback(v=>{window.calls.notice++;rawNotice(v)},[]),
setVenueEditDraft=useCallback(v=>{window.calls.draft++;rawDraft(v)},[]),setVenueProposalDraft=useCallback(v=>{window.calls.proposal++;rawProposal(v)},[]),setPlaceProblem=useCallback(v=>{window.calls.problem++;rawProblem(v)},[]);
const ports={snapshot,screen,venueId,venuePage,venueZoneKey,venueEditDraft,venueProposalDraft,setSnapshot,setBusy,setSettingsError,setVenueEditBusy,setVenueEditError,setVenueEditNotice,setVenueEditDraft,setVenueProposalDraft,setPlaceProblem};
const commands=useVenueScreenCommands(ports),pace=useSaveBackgroundPace(ports),place=snapshot.settings.venues.find(v=>v.id===venueId);
const actions={name:()=>commands.saveVenueName(place,venueEditDraft.name),image:()=>commands.saveVenueImageContext(place,{useAssignedVillagerContext:false,useVisualLore:true}),player:()=>commands.requestPlayerMove(place.id,' private / target '),access:()=>commands.changeVenueAccess(place.id,window.accessCommand),retry:()=>commands.retryPrivateSpacePreparation(),
zone:()=>commands.saveVenueZone(place.id,venueZoneKey,window.zoneBody),residence:()=>commands.proposeResidenceMove('resident / A','target / B',' private / target '),
proposal:()=>commands.submitVenueProposal(place,venueProposalDraft),pace:()=>pace('quiet')};
const capture=p=>{window.pending.push(Promise.resolve(p).then(value=>({value}),cause=>({error:cause.message})));return window.pending.length-1};
const run=kind=>capture(actions[kind]());const ui=Object.fromEntries(Object.entries(commands).map(([key,fn])=>[key,(...args)=>{const p=fn(...args);capture(p);return p}]));
const jump=({id=venueId,page=venuePage,zone=venueZoneKey,active=true}={})=>flushSync(()=>{setVenueId(id);setVenuePage(page);setVenueZoneKey(zone);setScreen(active?'venue':'home');
const v=window.seed.settings.venues.find(v=>v.id===id);rawDraft(v?{...structuredClone(v),name:'Draft '+id}:null);rawProposal(structuredClone(window.proposal));rawEditError('B marker');rawNotice('B marker');rawSettingsError('B marker');rawProblem({id,text:'B marker'});});
window.h={run,cross:kinds=>kinds.forEach(run),retain:kind=>{window.old=actions[kind]},old:()=>capture(window.old()),jump,
edit:patch=>rawDraft(current=>({...current,...patch})),proposal:patch=>rawProposal(current=>({...current,...patch})),
reset:()=>flushSync(()=>{rawSnapshot({...window.seed,isFounded:false,settings:{...window.seed.settings,setting:'reset'}});rawBusy(true)}),
refound:()=>flushSync(()=>{rawSnapshot({...window.seed,isFounded:true,settings:{...window.seed.settings,setting:'B'}});rawBusy(false);rawEditBusy(false);rawEditError('B marker');rawNotice('B marker');rawSettingsError('B marker')}),
poll:()=>rawSnapshot(current=>structuredClone(current)),hydrate:()=>rawSnapshot(current=>({...current,isFounded:true})),
removeVenue:()=>rawSnapshot(current=>({...current,settings:{...current.settings,venues:current.settings.venues.filter(v=>v.id!==venueId)}})),
revision:()=>rawSnapshot(current=>({...current,settings:{...current.settings,venues:current.settings.venues.map(v=>v.id===venueId?{...v,accessView:{...v.accessView,revision:v.accessView.revision+1}}:v)}})),
read:()=>({setting:snapshot.settings.setting,founded:snapshot.isFounded,screen,venueId,venuePage,venueZoneKey,busy,settingsError,venueEditBusy,venueEditError,venueEditNotice,venueEditDraft,venueProposalDraft,placeProblem})};
const editorZone=place?.zones.find(z=>z.id===venueZoneKey)??place?.zones[0];
return <><pre id='state'>{JSON.stringify(window.h.read())}</pre><VenueScreen controller={{...ports,...ui,busy,settingsError,venueEditBusy,venueEditError,venueEditNotice,venueEditDraft,venueProposalDraft,placeProblem,
homeBuildings:[],room:null,roomBusy:false,drawPlaceImage:async()=>{},dropPlaceImage:async()=>{},keepPlaceImage:async()=>{},leaveVenue:()=>jump({id:null,active:false}),openRoom:async()=>{},retryWork:async()=>{},
moveTargetId:'target / B',movePrivateZoneId:' private / target ',playerMovePrivateZoneId:' private / target ',setMoveTargetId:()=>{},setMovePrivateZoneId:()=>{},setPlayerMovePrivateZoneId:()=>{},
placeBusyId:'',nameOfCharacter:id=>id??'',standingAt:()=>[],setScreen,setVenuePage,setVenueZoneKey,
venueSection:venuePage==='view'?'zones':'manage',setVenueSection:value=>setVenuePage(value==='zones'?'view':'edit'),planVenueRenovation:()=>{},openVenueRequests:()=>{}}}/>
{place && editorZone && venuePage==='view' ? <details><summary>Access options</summary><VenueAccessPanel key={JSON.stringify([place.id,editorZone.id,place.accessView.revision])} venue={place} zoneId={editorZone.id} people={[{id:'player',name:'Player'},{id:'mara',name:'Mara'}]} isFounded={snapshot.isFounded} onCommand={command=>ui.changeVenueAccess(place.id,command)} /></details> : null}
</>;
}
window.pending=[];window.calls={snapshot:0,busy:0,settingsError:0,editBusy:0,editError:0,notice:0,draft:0,proposal:0,problem:0};window.confirms=[];window.confirm=message=>{window.confirms.push(message);window.confirmHook?.();return window.confirmAnswer};
const root=createRoot(document.getElementById('root'));window.unmount=()=>root.render(null);root.render(window.strict?<StrictMode><Harness/></StrictMode>:<Harness/>);
`,
    },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    jsx: "automatic",
  });
  return async function mount(strict = false, width = 1280, options = {}) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } }),
      page = await context.newPage(),
      requests = [],
      errors = [];
    const seed = structuredClone(fixture);
    await mockEngineLookups(context);
    seed.settings.setting = "A";
    seed.isFounded = options.founded ?? true;
    if (options.hydrate) delete seed.isFounded;
    const policy = {
      mode: "public",
      managerIds: ["player"],
      memberIds: [],
      memberRoles: [],
      inviterIds: ["player"],
      regularVisitors: [],
      visitorHours: "always",
      accompanied: false,
    };
    const decision = {
      allowed: true,
      available: true,
      mode: "public",
      reason: "public",
      explanation: "Public",
      canManage: true,
      canInvite: true,
    };
    const state = {
      revision: 0,
      recent: null,
      updatedAt: seed.village.instant,
    };
    seed.settings.venues = ["A / venue", "B / venue"].map((id, index) => ({
      ...seed.settings.venues[0],
      id,
      name: id,
      classes: ["residence", "community"],
      form: "A building",
      venueType: "Home",
      layoutVersion: 1,
      workerIds: [],
      residentIds: ["mara"],
      state: { ...seed.settings.venues[0].state },
      spaces: [{ id: "common", venueClass: "residence", description: "Common description", state, image: null }],
      privateSpaces: [{ ownerId: "mara", description: "Private description", state, image: null }],
      accessView: { revision: 1, canManage: true, managerIds: ["player"], visitorHours: null, bans: [], changes: [] },
      zones: ["zone / same", "zone / other"].map((zoneId) => ({
        id: zoneId,
        kind: "public",
        name: (index ? "B" : "A") + " Zone",
        purpose: "Community",
        venueClass: "community",
        description: (index ? "B" : "A") + " Zone description",
        seen: true,
        state,
        image: null,
        accessView: {
          decision,
          policy: { ...policy, mode: index ? "permission-required" : "public" },
          permissions: [],
          bans: [],
          changes: [],
        },
      })),
    }));
    options.prepareSeed?.(seed);
    const draft = structuredClone(seed.settings.venues[0]);
    draft.name = " Draft A ";
    const proposal = {
      classes: ["residence", "community"],
      capacity: 2,
      title: " Improvement ",
      description: " Raw proposed detail ",
    };
    const accessCommand = {
      action: "zone-policy",
      zoneId: "zone / same",
      expectedRevision: 1,
      operationId: "operation / A",
      policy,
    };
    const zoneBody = { name: " Raw Zone " };
    page.on("pageerror", (cause) => errors.push(cause.message));
    await page.route("http://venue-screen.test/", (route) =>
      fulfill(route, { status: 200, contentType: "text/html", body: '<div id="root"></div>' }),
    );
    await page.route("**/api/villages**", (route) =>
      requests.push({
        route,
        path: new URL(route.request().url()).pathname,
        method: route.request().method(),
        body: route.request().postDataJSON(),
      }),
    );
    await page.goto("http://venue-screen.test/");
    await page.evaluate((values) => Object.assign(window, values), {
      seed,
      draft,
      proposal,
      accessCommand,
      zoneBody,
      strict,
      page: options.page ?? "edit",
      initialZone: options.zone ?? "zone / same",
      occupied: options.occupied ?? false,
      confirmAnswer: true,
    });
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const read = () => page.evaluate(() => window.h.read());
    await expect.poll(async () => (await read()).setting).toBe("A");
    return {
      page,
      requests,
      seed,
      draft,
      proposal,
      accessCommand,
      zoneBody,
      read,
      run: (kind) => page.evaluate((kind) => window.h.run(kind), kind),
      settle: (index) => page.evaluate((index) => window.pending[index], index),
      reply: async (index, options = {}) => {
        const snapshot = structuredClone(seed);
        snapshot.settings.setting = options.setting ?? "Reply " + index;
        snapshot.isFounded = options.founded ?? seed.isFounded ?? true;
        snapshot.settings.venues[0].name = "Saved A";
        snapshot.settings.venues[1].name = "Saved B";
        await fulfill(requests[index].route, {
          status: options.fail ? 502 : 200,
          contentType: "application/json",
          body: JSON.stringify(options.fail ? { error: "synthetic Venue failure" } : snapshot),
        });
      },
      finish: async () => {
        assert.deepEqual(errors, []);
        await context.close();
      },
    };
  };
}

/** Actual owner and delegated panels; HTTP is held independently and never reaches providers. */
export async function verifyVenueScreenLifetimes(browser) {
  const mount = await createVenueScreenHarness(browser);
  const kinds = ["name", "image", "player", "access", "retry", "zone", "residence", "proposal"];
  const paths = {
    name: "/locations/venue/A%20%2F%20venue",
    image: "/locations/venue/A%20%2F%20venue",
    player: "/locations/venue/A%20%2F%20venue/player-move",
    access: "/venues/A%20%2F%20venue/access",
    retry: "/private-spaces/retry",
    zone: "/venues/A%20%2F%20venue/zones/zone%20%2F%20same/name",
    residence: "/residences/proposals",
    proposal: "/locations/venue/A%20%2F%20venue/proposals",
  };
  const bodies = (f) => ({
    name: { name: "Draft A" },
    image: {
      name: "A / venue",
      imageContext: { useAssignedVillagerContext: false, useVisualLore: true },
    },

    player: { privateZoneId: " private / target " },
    access: f.accessCommand,
    retry: null,
    zone: f.zoneBody,
    residence: { characterId: "resident / A", venueId: "target / B", privateZoneId: " private / target " },
    proposal: {
      requestId: f.requests[0].body?.requestId,
      classes: f.proposal.classes,
      capacity: 2,
      title: f.proposal.title,
      detail: f.proposal.description,
    },
  });
  async function settled(f, index) {
    const outcome = await f.settle(index);
    await expect
      .poll(async () => {
        const s = await f.read();
        return !s.busy && !s.venueEditBusy;
      })
      .toBe(true);
    return outcome;
  }
  async function openAccess(f) {
    const options = f.page.getByText("Access options", { exact: true });
    if (!(await options.locator("..").evaluate((el) => el.open))) await options.click();
    await f.page.getByText("Manage access", { exact: true }).click();
    await f.page.getByText("Zone policy", { exact: true }).click();
  }
  // State-only lifetime scenarios need one width; responsive UI lives in universal-venue coverage.
  for (const width of [390])
    for (const strict of [true]) {
      {
        const f = await mount(strict, width, { page: "view" });
        await f.page.getByLabel("Zone name", { exact: true }).fill("Renamed Zone");
        await f.page.getByRole("button", { name: "Save zone name", exact: true }).click();
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page.evaluate(() => {
          window.h.reset();
          window.h.refound();
        });
        await expect(f.page.getByRole("button", { name: "Save zone name", exact: true })).toBeEnabled();
        await f.page.getByRole("button", { name: "Save zone name", exact: true }).click();
        await expect.poll(() => f.requests.length).toBe(2);
        await f.reply(0);
        await expect(f.page.getByRole("button", { name: "Saving…", exact: true })).toBeDisabled();
        await f.reply(1);
        await expect(f.page.getByRole("button", { name: "Save zone name", exact: true })).toBeEnabled();
        await f.finish();
      }
      for (const kind of kinds)
        for (const fail of [false, true]) {
          const f = await mount(strict, width, { page: kind === "proposal" ? "proposal" : "edit" });
          await f.run(kind);
          await expect.poll(() => f.requests.length).toBe(1);
          assert.equal(f.requests[0].path, "/api/villages" + paths[kind]);
          assert.equal(f.requests[0].method, ["name", "image", "name", "zone"].includes(kind) ? "PUT" : "POST");
          assert.deepEqual(f.requests[0].body, bodies(f)[kind]);
          await f.reply(0, { fail });
          const outcome = await settled(f, 0),
            s = await f.read();
          assert.equal(s.setting, fail ? "A" : "Reply 0");
          if (fail) {
            if (["image", "retry"].includes(kind)) assert.equal(s.settingsError, "synthetic Venue failure");
            else if (kind === "zone") {
              assert.equal(s.placeProblem.text, "synthetic Venue failure");
              assert.equal(outcome.error, "synthetic Venue failure");
            } else if (kind === "access") assert.equal(outcome.error, "synthetic Venue failure");
            else assert.equal(s.venueEditError, "synthetic Venue failure");
          } else {
            if (kind === "proposal") assert.equal(s.venueProposalDraft, null);
            if (["zone", "access"].includes(kind)) assert.equal(outcome.value, true);
          }
          await f.finish();
        }
      // Each existing admission group rejects an immediate second command.
      for (const group of [
        ["image", "retry", "pace"],
        ["name", "residence", "proposal"],
        ["player", "player"],
        ["access", "access"],
        ["zone", "zone"],
      ]) {
        const f = await mount(strict, width);
        await f.page.evaluate((group) => window.h.cross(group), group);
        await expect.poll(() => f.requests.length).toBe(1);
        await f.reply(0);
        await f.page.evaluate(() => Promise.all(window.pending));
        assert.equal(f.requests.length, 1);
        await f.finish();
      }
      // A retired request cannot change real B pending work, errors, drafts or cleanup.
      for (const kind of kinds)
        for (const fail of [false, true]) {
          const f = await mount(strict, width);
          await f.run(kind);
          await expect.poll(() => f.requests.length).toBe(1);
          await f.page.evaluate(() => window.h.jump({ id: "B / venue" }));
          await f.run(kind);
          await expect.poll(() => f.requests.length).toBe(2);
          const before = await f.read(),
            calls = await f.page.evaluate(() => window.calls);
          await f.reply(0, { fail });
          await f.settle(0);
          assert.deepEqual(await f.read(), before);
          assert.deepEqual(await f.page.evaluate(() => window.calls), calls);
          await f.reply(1);
          await settled(f, 1);
          assert.equal((await f.read()).setting, "Reply 1");
          await f.finish();
        }
      for (const kind of ["image", "name", "zone", "access"]) {
        const f = await mount(strict, width);
        await f.run(kind);
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page.evaluate(() => window.h.reset());
        assert.equal((await f.read()).busy, true, "reset retains its own busy flag");
        await f.page.evaluate(() => window.h.refound());
        await f.run(kind === "image" ? "pace" : kind);
        await expect.poll(() => f.requests.length).toBe(2);
        const before = await f.read();
        await f.reply(0, { fail: true });
        await f.settle(0);
        assert.deepEqual(await f.read(), before);
        await f.reply(1);
        await settled(f, 1);
        await f.finish();
      }
      for (const kind of kinds) {
        const f = await mount(strict, width);
        await f.page.evaluate((kind) => window.h.retain(kind), kind);
        await f.page.evaluate(() => {
          window.h.jump({ id: "B / venue" });
          window.h.jump({ id: "A / venue" });
        });
        const before = await f.page.evaluate(() => window.calls);
        const index = await f.page.evaluate(() => window.h.old());
        await f.settle(index);
        assert.equal(f.requests.length, 0);
        assert.deepEqual(await f.page.evaluate(() => window.calls), before);
        await f.finish();
      }
      for (const transition of ["page", "zone"]) {
        const f = await mount(strict, width);
        await f.page.evaluate((transition) => window.h.retain(transition === "page" ? "name" : "zone"), transition);
        await f.page.evaluate((transition) => {
          if (transition === "page") {
            window.h.jump({ page: "view" });
            window.h.jump({ page: "edit" });
          } else {
            window.h.jump({ zone: "zone / other" });
            window.h.jump({ zone: "zone / same" });
          }
        }, transition);
        const index = await f.page.evaluate(() => window.h.old());
        await f.settle(index);
        assert.equal(f.requests.length, 0);
        await f.finish();
      }
      for (const kind of ["name", "proposal"]) {
        const f = await mount(strict, width);
        await f.run(kind);
        await expect.poll(() => f.requests.length).toBe(1);
        if (kind === "proposal") await f.page.evaluate(() => window.h.proposal({ description: "Newer proposal" }));
        else await f.page.getByRole("textbox", { name: "Venue name", exact: true }).fill(" Newer name ");
        const before = await f.read();
        await f.reply(0);
        await settled(f, 0);
        const s = await f.read();
        assert.equal(s.setting, "Reply 0");
        assert.deepEqual(s.venueEditDraft, before.venueEditDraft);
        assert.deepEqual(s.venueProposalDraft, before.venueProposalDraft);
        await f.finish();
      }

      for (const hydrate of [false, true]) {
        const f = await mount(strict, width, hydrate ? { hydrate: true } : { founded: false });
        await f.run("name");
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page.evaluate(() => window.h.hydrate());
        await f.reply(0);
        await f.settle(0);
        assert.equal((await f.read()).setting, hydrate ? "Reply 0" : "A");
        await f.finish();
      }
      for (const kind of ["image", "name", "access", "zone", "player"]) {
        const f = await mount(strict, width);
        await f.run(kind);
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page.evaluate(() => window.unmount());
        await expect(f.page.locator("#state")).toHaveCount(0);
        const before = await f.page.evaluate(() => window.calls);
        await f.reply(0, { fail: true });
        await f.settle(0);
        assert.deepEqual(await f.page.evaluate(() => window.calls), before);
        await f.finish();
      }
      {
        const f = await mount(strict, width);
        await f.run("name");
        await expect.poll(() => f.requests.length).toBe(1);
        await f.page.evaluate(() => window.h.removeVenue());
        const before = await f.read();
        await f.reply(0);
        await f.settle(0);
        assert.deepEqual(await f.read(), before);
        await f.finish();
      }
      for (const retirement of ["venue", "revision"])
        for (const fail of [false, true]) {
          const f = await mount(strict, width, { page: "view" });
          await openAccess(f);
          await f.page.getByRole("button", { name: "Save Zone policy", exact: true }).click();
          await expect.poll(() => f.requests.length).toBe(1);
          assert.equal(f.requests[0].body.expectedRevision, 1);
          assert.equal(typeof f.requests[0].body.operationId, "string");
          assert(f.requests[0].body.operationId.length > 0);
          if (retirement === "venue") await f.page.evaluate(() => window.h.jump({ id: "B / venue", page: "view" }));
          else await f.page.evaluate(() => window.h.revision());
          await openAccess(f);
          await expect(f.page.getByRole("combobox", { name: "Zone access", exact: true })).toHaveValue(
            retirement === "venue" ? "permission-required" : "public",
          );
          await expect(f.page.getByRole("button", { name: "Save Zone policy", exact: true })).toBeEnabled();
          await f.page.getByRole("button", { name: "Save Zone policy", exact: true }).click();
          await expect.poll(() => f.requests.length).toBe(2);
          assert.equal(f.requests[1].body.expectedRevision, retirement === "revision" ? 2 : 1);
          assert.notEqual(f.requests[1].body.operationId, f.requests[0].body.operationId);
          await f.reply(0, { fail });
          await f.settle(0);
          await expect(f.page.getByRole("alert").filter({ hasText: "synthetic Venue failure" })).toHaveCount(0);
          await expect(f.page.getByRole("button", { name: "Save Zone policy", exact: true })).toBeDisabled();
          await f.reply(1);
          await f.settle(1);
          await f.finish();
        }
      {
        const f = await mount(strict, width, { page: "view" });
        await openAccess(f);
        await f.page.getByRole("button", { name: "Save Zone policy", exact: true }).click();
        await expect.poll(() => f.requests.length).toBe(1);
        await f.reply(0, { fail: true });
        await f.settle(0);
        await expect(f.page.getByRole("alert").filter({ hasText: "synthetic Venue failure" })).toBeVisible();
        await expect(f.page.getByRole("button", { name: "Save Zone policy", exact: true })).toBeEnabled();
        await f.finish();
      }
      for (const child of ["access"])
        for (const fail of [false, true]) {
          const f = await mount(strict, width, { page: child === "access" ? "view" : "edit" });
          if (child === "access") await openAccess(f);
          const name = child === "access" ? "Save Zone policy" : "Save zone details";
          await f.page.getByRole("button", { name, exact: true }).click();
          await expect.poll(() => f.requests.length).toBe(1);
          await f.page.evaluate(() => {
            window.h.reset();
            window.h.refound();
          });
          await expect(f.page.getByRole("button", { name, exact: true })).toBeEnabled();
          await f.page.getByRole("button", { name, exact: true }).click();
          await expect.poll(() => f.requests.length).toBe(2);
          const before = await f.read();
          await f.reply(0, { fail });
          await f.settle(0);
          assert.deepEqual(await f.read(), before);
          await expect(f.page.getByRole("alert").filter({ hasText: "synthetic Venue failure" })).toHaveCount(0);
          await expect(f.page.getByText("Zone saved.", { exact: true })).toHaveCount(0);
          await expect(
            f.page.getByRole("button", { name: child === "zone" ? "Saving…" : name, exact: true }),
          ).toBeDisabled();
          await f.reply(1);
          await f.settle(1);
          await expect(f.page.getByRole("button", { name, exact: true })).toBeEnabled();
          await f.finish();
        }
      {
        const f = await mount(strict, width, { page: "view" });
        await openAccess(f);
        await f.page.getByRole("button", { name: "Save Zone policy", exact: true }).click();
        await expect.poll(() => f.requests.length).toBe(1);
        const submitted = structuredClone(f.requests[0].body);
        await f.page.evaluate(() => window.h.poll());
        await expect(f.page.getByRole("button", { name: "Save Zone policy", exact: true })).toBeDisabled();
        await f.reply(0, { fail: true });
        await f.settle(0);
        assert.equal(f.requests.length, 1);
        assert.deepEqual(f.requests[0].body, submitted);
        await expect(f.page.getByRole("alert").filter({ hasText: "synthetic Venue failure" })).toBeVisible();
        await expect(f.page.getByRole("button", { name: "Save Zone policy", exact: true })).toBeEnabled();
        await f.finish();
      }
    }
  console.log(
    "Venue/Zone lifetimes: name-only saves, admission, replacement requests, draft acknowledgement, confirmations, ABA/reset/hydration/disposal and current Zone name/Access contracts passed (mounted client, synthetic HTTP, single-width state-only StrictMode harness).",
  );
}
