import assert from "node:assert/strict";
import { build } from "../../scripts/esbuild.mjs";
import { fulfill } from "./browser-diagnostics.mjs";
import { expect } from "./fast-browser-expect.mjs";
import { snapshot as fixture } from "./villages-scene-browser.fixture.mjs";

/** Actual editor and always-mounted command owner; held HTTP never reaches a provider. */
export async function verifyVenueLayoutDraft(browser) {
  const bundle = await build({
    stdin: {
      loader: "tsx",
      resolveDir: process.cwd(),
      contents: `
import {createRoot} from 'react-dom/client';import {StrictMode,useState,useRef,useMemo} from 'react';
import {useVenueScreenCommands} from './packages/villages/src/client/features/venues/screen-commands.js';
import {VenueScreen} from './packages/villages/src/client/features/venues/VenueScreen.js';
import {ConfirmationProvider} from './packages/villages/src/client/shared/confirmation.js';
import {DeskLeaveGuard} from './packages/villages/src/client/shared/DeskWorkspace.js';
function Harness(){
 const guard=useRef(null),[navigationDisabled,setDisabled]=useState(false),registration=useMemo(()=>({guard,setDisabled}),[]);
 const [snapshot,setSnapshot]=useState(window.seed),[screen,setScreen]=useState('venue'),[venueId,setVenueId]=useState('a'),[venueSection,setVenueSection]=useState('manage'),[venueZoneKey,setVenueZoneKey]=useState('exterior');
 const [room,setRoom]=useState(null),[busy,setBusy]=useState(false),[venueEditBusy,setVenueEditBusy]=useState(false),[venueEditError,setVenueEditError]=useState(''),[venueEditNotice,setVenueEditNotice]=useState(''),[venueEditDraft,setVenueEditDraft]=useState(null),[placeProblem,setPlaceProblem]=useState(null);
 const ports={snapshot,screen,venueId,venuePage:'view',venueZoneKey,setSnapshot,setBusy,setSettingsError:()=>{},setVenueEditBusy,setVenueEditError,setVenueEditNotice,setVenueEditDraft,setVenueProposalDraft:()=>{},setPlaceProblem};
 const commands=useVenueScreenCommands(ports);
 window.h={scene:setRoom,read:()=>({snapshot,screen,venueId,layouts:commands.venueLayouts}),reset:()=>setSnapshot({...window.seed,isFounded:false}),refound:()=>setSnapshot(window.seed),snapshot:next=>setSnapshot(next)};
 const openPlace=place=>{setVenueId(place.id);setScreen('venue')};
 return <DeskLeaveGuard value={registration}><pre id="state">{JSON.stringify(window.h.read())}</pre>{screen==='venue'?<><button disabled={navigationDisabled} onClick={async()=>{if(!guard.current||await guard.current())setScreen('home')}}>Return to village</button><VenueScreen controller={{...ports,...commands,venueSection,setVenueSection,setVenueZoneKey,venueEditBusy,venueEditError,venueEditNotice,venueEditDraft,placeProblem,busy,room,roomBusy:false,homeBuildings:[],placeBusyId:'',nameOfCharacter:id=>id,standingAt:()=>[],setScreen,
 goHome:()=>setScreen('home'),openMenu:()=>setScreen('menu'),openPlace,leaveVenue:()=>setScreen('home'),openRoom:async()=>{},planVenueRenovation:()=>{},openVenueProject:()=>{},openVenueRequests:()=>{},drawPlaceImage:async()=>{},dropPlaceImage:async()=>{},keepPlaceImage:async()=>{},retryWork:async()=>{},setPlayerMovePrivateZoneId:()=>{},setMoveTargetId:()=>{},setMovePrivateZoneId:()=>{}}}/></>:<button onClick={()=>openPlace(snapshot.settings.venues[0])}>Return to Places</button>}</DeskLeaveGuard>;
}
createRoot(document.getElementById('root')).render(<StrictMode><ConfirmationProvider><Harness/></ConfirmationProvider></StrictMode>);
`,
    },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    jsx: "automatic",
  });
  for (const width of [1366, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const requests = [],
      errors = [],
      dialogs = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("dialog", async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });
    const seed = structuredClone(fixture);
    seed.isFounded = true;
    const original = seed.settings.venues[0];
    const zones = ["exterior", "common", "other"].map((id, index) => ({
      ...original.spaces?.[0],
      id,
      name: id,
      kind: index ? "public" : "exterior",
      venueClass: "community",
      description: "Zone",
      seen: true,
      connectedTo: index ? ["exterior"] : ["common", "other"],
    }));
    seed.settings.venues = ["a", "b"].map((id) => ({
      ...original,
      id,
      name: "Venue " + id,
      zones: structuredClone(zones),
      classes: ["community"],
      spaces: structuredClone(zones.slice(1)),
      privateSpaces: [],
      accessView: { ...original.accessView, canManage: true },
      zoneLayout: { exterior: { x: 0, y: 0 }, common: { x: 0, y: 24 }, other: { x: 68, y: 12 } },
      occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    }));
    let server = structuredClone(seed);
    await page.route("http://autosave.test/", (route) =>
      fulfill(route, {
        status: 200,
        contentType: "text/html",
        body: '<style>body{margin:0}.villages-zone-map-canvas{position:relative;height:450px}.villages-zone-map-tile{position:absolute}.villages-zone-map svg{position:absolute;inset:0;width:100%;height:100%}</style><div id="root"></div>',
      }),
    );
    await page.route("**/api/villages**", (route) => requests.push({ route, body: route.request().postDataJSON() }));
    await page.goto("http://autosave.test/");
    await page.evaluate((seed) => (window.seed = seed), seed);
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const read = () => page.evaluate(() => window.h.read());
    const entranceX = async () => {
      const state = await read();
      return (
        state.layouts[state.venueId]?.change.positions ??
        state.snapshot.settings.venues.find((row) => row.id === state.venueId).zoneLayout
      ).exterior.x;
    };
    const reply = async (index, { fail = false, committed = false } = {}) => {
      const { body, route } = requests[index];
      if ((!fail || committed) && body) {
        const venue = server.settings.venues[0];
        for (const base of JSON.parse(body.base)) {
          assert.deepEqual(base.position, venue.zoneLayout[base.id], "queued save must use last acknowledged base");
          assert.deepEqual(base.connectedTo, [...venue.zones.find((zone) => zone.id === base.id).connectedTo].sort());
        }
        venue.zoneLayout = body.positions;
        venue.zones = venue.zones.map((z) => ({
          ...z,
          connectedTo: body.connections.find((c) => c.id === z.id).connectedTo,
        }));
      }
      await fulfill(route, {
        status: fail ? 502 : 200,
        contentType: "application/json",
        body: JSON.stringify(fail ? { error: "Layout unavailable" } : server),
      });
    };

    const map = page.locator(".villages-zone-map");
    const leave = () => page.getByRole("button", { name: /Return to village|← Village/, exact: true }).click();
    const manage = page.getByRole("button", { name: "Manage", exact: true });
    const save = page.getByRole("button", { name: "Save connections", exact: true });
    const openEditor = async () => {
      if ((await manage.getAttribute("aria-pressed")) !== "true") await manage.click();
      await page.getByRole("button", { name: "Zone connections", exact: true }).click();
    };
    const back = async () => {
      await page.getByRole("button", { name: "Return to Places" }).click();
      await openEditor();
    };
    const select = (id) => map.locator(`[data-layout-zone="${id}"]`).click();
    const connection = (name) => page.getByRole("checkbox", { name, exact: true });
    await openEditor();
    await select("exterior");
    await connection("common").uncheck();
    await expect(map.locator("svg line")).toHaveCount(1);
    await expect(save).toBeDisabled();
    await leave();
    const dialog = page.getByRole("dialog", { name: "Confirm", exact: true });
    await expect(dialog).toContainText("Some Zones cannot be reached.");
    await dialog.getByRole("button", { name: "Keep editing", exact: true }).click();
    await expect(connection("common")).not.toBeChecked();
    assert.equal(requests.length, 0);
    await leave();
    await dialog.getByRole("button", { name: "Discard and leave", exact: true }).click();
    await back();
    await expect.poll(entranceX).toBe(0);
    await expect(map.locator("svg line")).toHaveCount(2);
    assert.equal(requests.length, 0, "discard restores all saved positions and links without writing");
    await select("common");
    await connection("other").check();
    await save.click();
    await expect.poll(() => requests.length).toBe(1);
    await expect(page.getByRole("button", { name: "Manage", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "About", exact: true }).click();
    await expect(page.getByRole("button", { name: "About", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.evaluate(() =>
      window.h.snapshot({
        ...window.h.read().snapshot,
        settings: { ...window.h.read().snapshot.settings, name: "Newer name" },
      }),
    );
    await reply(0);
    await expect.poll(async () => Object.keys((await read()).layouts).length).toBe(0);
    await expect(page.getByRole("button", { name: "About", exact: true })).toHaveAttribute("aria-pressed", "true");
    assert.equal((await read()).snapshot.settings.name, "Newer name");
    await openEditor();
    await expect.poll(entranceX).toBe(0);
    await expect(map.locator("svg line")).toHaveCount(3);
    await select("common");
    await connection("other").uncheck();
    await leave();
    await expect.poll(() => requests.length).toBe(2);
    await expect(page.getByRole("button", { name: "Return to Places" })).toBeVisible();
    await reply(1, { fail: true });
    await back();
    await expect(page.getByRole("alert")).toContainText("Layout unavailable");
    await expect(map.locator("svg line")).toHaveCount(2);
    await leave();
    await expect.poll(() => requests.length).toBe(3);
    await reply(2);
    await expect.poll(() => requests.length).toBe(4);
    await reply(3);
    await expect.poll(async () => Object.keys((await read()).layouts).length).toBe(0);
    await expect(page.getByRole("button", { name: "Return to Places" })).toBeVisible();
    await back();
    await expect(map.locator("svg line")).toHaveCount(2);
    await select("common");
    await connection("other").check();
    await leave();
    await expect.poll(() => requests.length).toBe(5);
    await reply(4, { fail: true, committed: true });
    await back();
    await expect(page.getByRole("alert")).toBeVisible();
    await select("exterior");
    await connection("common").uncheck();
    await connection("other").uncheck();
    await leave();
    await dialog.getByRole("button", { name: "Discard and leave", exact: true }).click();
    await expect.poll(() => requests.length).toBe(6);
    await reply(5);
    await expect(page.getByRole("button", { name: "Return to Places" })).toBeVisible();
    assert.equal(
      requests.length,
      6,
      "discard after lost committed response reads actual saved layout without duplicate PUT",
    );
    await back();
    await expect.poll(entranceX).toBe(0);
    await expect(map.locator("svg line")).toHaveCount(3);
    await select("common");
    await connection("other").uncheck();
    await page.evaluate(() => window.h.scene({ id: "scene", status: "active", placeId: "b", zoneId: "exterior" }));
    await expect(connection("other")).toBeDisabled();
    await expect(save).toBeDisabled();
    await select("other");
    await expect(page.locator('[data-layout-zone="other"]')).toHaveAttribute("aria-pressed", "true");
    assert.equal(requests.length, 6);
    await leave();
    await expect(page.getByRole("button", { name: "Return to Places" })).toBeVisible();
    await back();
    assert.equal(requests.length, 6, "Scene navigation keeps pending draft without trying forbidden save");
    await page.evaluate(() => window.h.scene(null));
    await expect(save).toBeEnabled();
    await leave();
    await expect.poll(() => requests.length).toBe(7);
    await page.evaluate(() => window.h.reset());
    await expect.poll(async () => (await read()).snapshot.isFounded).toBe(false);
    await page.evaluate(() => window.h.refound());
    await reply(6);
    await expect.poll(async () => Object.keys((await read()).layouts).length).toBe(0);
    await back();
    await expect.poll(entranceX).toBe(0);
    assert.deepEqual(dialogs, []);
    assert.deepEqual(errors, []);
    await context.close();
  }
}
