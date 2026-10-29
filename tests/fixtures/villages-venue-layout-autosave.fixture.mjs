import assert from "node:assert/strict";
import { build } from "../../scripts/esbuild.mjs";
import { fulfill } from "./browser-diagnostics.mjs";
import { expect } from "./fast-browser-expect.mjs";
import { snapshot as fixture } from "./villages-scene-browser.fixture.mjs";

/** Actual editor and always-mounted command owner; held HTTP never reaches a provider. */
export async function verifyVenueLayoutAutosave(browser) {
  const bundle = await build({
    stdin: {
      loader: "tsx",
      resolveDir: process.cwd(),
      contents: `
import {createRoot} from 'react-dom/client';import {StrictMode,useState} from 'react';
import {useVenueScreenCommands} from './packages/villages/src/client/features/venues/screen-commands.js';
import {VenueScreen} from './packages/villages/src/client/features/venues/VenueScreen.js';
import {ConfirmationProvider} from './packages/villages/src/client/shared/confirmation.js';
function Harness(){
 const [snapshot,setSnapshot]=useState(window.seed),[screen,setScreen]=useState('venue'),[venueId,setVenueId]=useState('a'),[venueSection,setVenueSection]=useState('zones'),[venueZoneKey,setVenueZoneKey]=useState('exterior');
 const [room,setRoom]=useState(null),[busy,setBusy]=useState(false),[venueEditBusy,setVenueEditBusy]=useState(false),[venueEditError,setVenueEditError]=useState(''),[venueEditNotice,setVenueEditNotice]=useState(''),[venueEditDraft,setVenueEditDraft]=useState(null),[placeProblem,setPlaceProblem]=useState(null);
 const ports={snapshot,screen,venueId,venuePage:'view',venueZoneKey,setSnapshot,setBusy,setSettingsError:()=>{},setVenueEditBusy,setVenueEditError,setVenueEditNotice,setVenueEditDraft,setVenueProposalDraft:()=>{},setPlaceProblem};
 const commands=useVenueScreenCommands(ports);
 window.h={scene:setRoom,read:()=>({snapshot,screen,venueId,layouts:commands.venueLayouts}),reset:()=>setSnapshot({...window.seed,isFounded:false}),refound:()=>setSnapshot(window.seed),snapshot:next=>setSnapshot(next)};
 const openPlace=place=>{setVenueId(place.id);setScreen('venue')};
 return <><pre id="state">{JSON.stringify(window.h.read())}</pre>{screen==='venue'?<VenueScreen controller={{...ports,...commands,venueSection,setVenueSection,setVenueZoneKey,venueEditBusy,venueEditError,venueEditNotice,venueEditDraft,placeProblem,busy,room,roomBusy:false,homeBuildings:[],placeBusyId:'',nameOfCharacter:id=>id,standingAt:()=>[],setScreen,
 goHome:()=>setScreen('home'),openMenu:()=>setScreen('menu'),openPlace,leaveVenue:()=>setScreen('home'),openRoom:async()=>{},planVenueRenovation:()=>{},openVenueProject:()=>{},openVenueRequests:()=>{},drawPlaceImage:async()=>{},dropPlaceImage:async()=>{},keepPlaceImage:async()=>{},retryWork:async()=>{},setPlayerMovePrivateZoneId:()=>{},setMoveTargetId:()=>{},setMovePrivateZoneId:()=>{}}}/>:<button onClick={()=>openPlace(snapshot.settings.venues[0])}>Return to Places</button>}</>;
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
    const tile = () => page.locator('[data-layout-zone="exterior"]');
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
    await expect(tile()).toBeVisible();
    await expect(page.getByRole("button", { name: "Save layout", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Cancel layout changes", exact: true })).toHaveCount(0);
    await tile().press("ArrowRight");
    await expect.poll(() => requests.length).toBe(1);
    await tile().press("ArrowRight");
    await tile().press("ArrowDown");
    assert.equal(requests.length, 1, "one layout request at a time");
    await page
      .getByRole("navigation", { name: "Village navigation" })
      .getByRole("button", { name: "Map", exact: true })
      .click();
    await expect(page.getByRole("button", { name: "Return to Places" })).toBeVisible();
    await page.getByRole("button", { name: "Return to Places" }).click();
    await expect(tile()).toHaveAttribute("style", /left: 2%; top: 1%;/);
    // A response must preserve a newer unrelated field in the current snapshot.
    await page.evaluate(() =>
      window.h.snapshot({
        ...window.h.read().snapshot,
        settings: { ...window.h.read().snapshot.settings, name: "Newer name" },
      }),
    );
    await reply(0);
    await expect.poll(() => requests.length).toBe(2);
    assert.deepEqual(requests[1].body.positions.exterior, { x: 2, y: 1 });
    await reply(1);
    await expect.poll(async () => Object.keys((await read()).layouts).length).toBe(0);
    assert.equal((await read()).snapshot.settings.name, "Newer name");
    await expect(tile()).toHaveAttribute("style", /left: 2%; top: 1%;/);
    // Unreachable connection changes are rejected inline without requesting a save.
    await page.getByRole("button", { name: "Connect Zones", exact: true }).click();
    await page.getByRole("button", { name: "Disconnect Zones", exact: true }).click();
    await page.locator('[data-layout-zone="common"]').click();
    await tile().click();
    await expect(page.getByRole("alert")).toContainText("Unreachable Zones");
    assert.equal(requests.length, 2);
    // A new connection automatically saves.
    await page.getByRole("button", { name: "Connect Zones", exact: true }).click();
    await page.locator('[data-layout-zone="common"]').click();
    await page.locator('[data-layout-zone="other"]').click();
    await expect.poll(() => requests.length).toBe(3);
    await reply(2);
    await expect.poll(async () => Object.keys((await read()).layouts).length).toBe(0);
    await page.getByRole("button", { name: "Done", exact: true }).click();
    await tile().press("ArrowRight");
    await expect.poll(() => requests.length).toBe(4);
    await reply(3, { fail: true });
    await expect(page.getByRole("alert").filter({ hasText: "Layout unavailable" })).toBeVisible();
    await page
      .getByRole("navigation", { name: "Village navigation" })
      .getByRole("button", { name: "Map", exact: true })
      .click();
    await page.getByRole("button", { name: "Return to Places" }).click();
    await expect(tile()).toHaveAttribute("style", /left: 3%; top: 1%;/);
    await expect(page.getByRole("button", { name: "Retry", exact: true })).toHaveCount(0);
    await tile().press("ArrowRight");
    await expect.poll(() => requests.length).toBe(5);
    await reply(4);
    await expect.poll(() => requests.length).toBe(6);
    await reply(5);
    await expect.poll(async () => Object.keys((await read()).layouts).length).toBe(0);
    // A failed reply after commit is read back, then the later queued intent saves.
    await tile().press("ArrowRight");
    await expect.poll(() => requests.length).toBe(7);
    await tile().press("ArrowDown");
    await reply(6, { fail: true, committed: true });
    await expect(page.getByRole("alert").filter({ hasText: "Layout unavailable" })).toBeVisible();
    await tile().press("ArrowRight");
    await expect.poll(() => requests.length).toBe(8);
    await reply(7);
    await expect.poll(() => requests.length).toBe(9);
    await reply(8);
    await expect.poll(async () => Object.keys((await read()).layouts).length).toBe(0);
    assert.deepEqual((await read()).snapshot.settings.venues[0].zoneLayout.exterior, { x: 6, y: 2 });
    // A late response cannot restore a reset village or launch its queued edit.
    await tile().press("ArrowRight");
    await expect.poll(() => requests.length).toBe(10);
    await tile().press("ArrowRight");
    await page.evaluate(() => window.h.reset());
    await expect.poll(async () => (await read()).snapshot.isFounded).toBe(false);
    await page.evaluate(() => window.h.refound());
    await expect.poll(async () => (await read()).snapshot.isFounded).toBe(true);
    await reply(9);
    await expect.poll(async () => Object.keys((await read()).layouts).length).toBe(0);
    assert.deepEqual((await read()).snapshot.settings.venues[0].zoneLayout.exterior, { x: 0, y: 0 });
    assert.equal(requests.length, 10);
    // Legacy class-based venues gain explicit structural rows after a connection save.
    const legacy = structuredClone(seed);
    const legacyVenue = legacy.settings.venues[0];
    legacyVenue.classes = ["community", "workplace"];
    delete legacyVenue.zones;
    legacyVenue.spaces = ["community", "workplace"].map((venueClass, index) => ({
      ...zones[index + 1],
      id: "class:" + venueClass,
      venueClass,
      connectedTo: undefined,
    }));
    legacyVenue.zoneLayout = {
      exterior: { x: 0, y: 0 },
      "class:community": { x: 0, y: 24 },
      "class:workplace": { x: 68, y: 12 },
    };
    server = structuredClone(legacy);
    server.settings.venues[0].zones = [
      { ...zones[0], connectedTo: ["class:community", "class:workplace"] },
      ...legacyVenue.spaces.map((zone) => ({ ...zone, kind: "public", connectedTo: ["exterior"] })),
    ];
    await page.evaluate((next) => window.h.snapshot(next), legacy);
    await page.getByRole("button", { name: "Connect Zones", exact: true }).click();
    await page.locator('[data-layout-zone="class:community"]').click();
    await page.locator('[data-layout-zone="class:workplace"]').click();
    await expect.poll(() => requests.length).toBe(11);
    await reply(10);
    await expect.poll(async () => Object.keys((await read()).layouts).length).toBe(0);
    assert.ok(
      (await read()).snapshot.settings.venues[0].zones
        .find((zone) => zone.id === "class:community")
        .connectedTo.includes("class:workplace"),
    );
    await expect(page.locator(".villages-zone-map svg line")).toHaveCount(3);
    await page.getByRole("button", { name: "Disconnect Zones", exact: true }).click();
    await page.locator('[data-layout-zone="class:community"]').click();
    await page.locator('[data-layout-zone="class:workplace"]').click();
    await expect.poll(() => requests.length).toBe(12);
    await reply(11);
    await expect.poll(async () => Object.keys((await read()).layouts).length).toBe(0);
    await expect(page.locator(".villages-zone-map svg line")).toHaveCount(2);
    await page.evaluate(() => window.h.scene({ id: "scene", status: "active", placeId: "b", zoneId: "exterior" }));
    await expect(tile()).toHaveAttribute("data-draggable", "false");
    await expect(page.getByRole("button", { name: "Connect Zones", exact: true })).toHaveCount(0);
    await tile().press("ArrowRight");
    await page.locator('[data-layout-zone="class:workplace"]').click();
    await expect(page.locator('[data-layout-zone="class:workplace"]')).toHaveAttribute("aria-pressed", "true");
    assert.equal(requests.length, 12, "Scene prevents layout writes while still allowing selection");
    assert.deepEqual(dialogs, []);
    assert.deepEqual(errors, []);
    await context.close();
  }
}
