import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import { build } from "../scripts/esbuild.mjs";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { snapshot, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
try {
  for (const width of [390, 1440])
    for (const restore of [false, true]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await mockEngineLookups(page);
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      let held,
        reads = 0;
      const session = {
        id: "navigation",
        version: 2,
        sceneRevision: 0,
        placeId: "mill",
        placeName: "The Mill",
        zoneId: "exterior",
        area: "public",
        status: "active",
        activeIds: [],
        participants: [],
        lines: [],
        submissions: [],
        startedAt: now,
        lastActivityAt: now,
        endedAt: "",
      };
      const sceneSnapshot = structuredClone(snapshot);
      const currentVenue = sceneSnapshot.settings.venues.find((venue) => venue.id === "mill");
      currentVenue.zones = [
        { id: "exterior", name: "Exterior", kind: "exterior", seen: true, connectedTo: ["workshop"] },
        {
          id: "workshop",
          name: "Captured workshop",
          kind: "public",
          seen: true,
          connectedTo: ["exterior"],
          closed: false,
        },
      ];
      sceneSnapshot.sceneVenue = { sceneId: session.id, venue: structuredClone(currentVenue) };
      // A later Village renovation closes/removes a destination without rewriting this Scene.
      currentVenue.zones = currentVenue.zones.filter((zone) => zone.id !== "workshop");
      await page.route("http://scene-navigation.test/", (route) =>
        fulfill(route, {
          contentType: "text/html",
          body: '<marinara-capability-villages style="display:block;height:900px"></marinara-capability-villages>',
        }),
      );
      await page.route("**/api/villages**", async (route) => {
        const path = new URL(route.request().url()).pathname;
        if (path.endsWith("/rooms/active")) {
          reads++;
          if (reads === 1) {
            held = route;
            return;
          }
          return fulfill(route, {
            contentType: "application/json",
            body: JSON.stringify({ session: restore ? session : null }),
          });
        }
        return fulfill(route, { contentType: "application/json", body: JSON.stringify(sceneSnapshot) });
      });
      await page.goto("http://scene-navigation.test/");
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await expect(page.getByRole("status")).toContainText("Loading Scene");
      await expect(page.locator(".marinara-capability-villages-home")).toHaveCount(0);
      await expect.poll(() => !!held).toBe(true);
      await fulfill(held, {
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Temporarily unavailable" }),
      });
      await expect(page.getByRole("button", { name: "Retry Scene check" })).toBeVisible();
      await expect(page.locator(".marinara-capability-villages-home")).toHaveCount(0);
      await page.getByRole("button", { name: "Retry Scene check" }).click();
      if (restore) {
        await expect(page.getByRole("textbox", { name: "Message at The Mill" })).toBeVisible();
        await expect(page.locator(".marinara-capability-villages-home")).toHaveCount(0);
        await page.getByRole("button", { name: "Mode: Say / Do. Choose mode" }).click();
        await expect(page.getByRole("menuitemradio", { name: "Move", exact: true })).toBeEnabled();
        await page.getByRole("menuitemradio", { name: "Move", exact: true }).click();
        await expect(page.getByRole("combobox", { name: "Move to Zone" }).locator("option[value=workshop]")).toHaveText(
          "Captured workshop",
        );
      } else await expect(page.locator(".marinara-capability-villages-home")).toBeVisible();
      assert.deepEqual(errors, []);
      await page.close();
    }

  const bundle = await build({
    stdin: {
      loader: "tsx",
      resolveDir: process.cwd(),
      contents: `
    import {createRoot} from 'react-dom/client';
    import {useVillageController} from './packages/villages/src/client/shell/useVillageController.js';
    import {VillagerDossier} from './packages/villages/src/client/features/residents/villages-dossier.js';
    const request=async(path,options)=>{if(options?.method==='POST')throw Error('Scene profile attempted a mutation');return path.endsWith('/signature')?{available:true,status:'ready'}:{profiles:[{characterId:'mara',knownWishes:[{wishId:'garden',text:'Share gardening stories',status:'open',at:'2026-10-26T00:00:00.000Z',followed:true,facts:[]}]}]}}; const noop=()=>{};
    function Harness(){const c=useVillageController({element:document.getElementById('root')});window.navigation=c;
      return <><pre id="screen">{!c.room && c.sceneRestoration.status!=='ready'?c.sceneRestoration.status:c.screen}</pre>{c.screen==='person'&&<VillagerDossier navigation={c.personProfile}
        villager={{characterId:'mara',name:'Mara',summary:'A resident',tags:[]}} portrait={null} request={request}
        venues={[{id:'mill',name:'The Mill',connections:['Home']}]} links={[{id:'project',title:'A project',onOpen:noop}]}
        controls={<button>Move out</button>} inspectors={{overview:<button>Manage village</button>}}
        onInspectSection={noop} onBack={()=>c.setScreen('room')} onVenue={noop}/>}</>;
    } createRoot(document.getElementById('root')).render(<Harness/>);
  `,
    },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    jsx: "automatic",
  });
  const page = await browser.newPage();
  await mockEngineLookups(page);
  const session = {
    id: "guard",
    version: 2,
    sceneRevision: 0,
    placeId: "mill",
    placeName: "The Mill",
    status: "active",
    activeIds: [],
    participants: [],
    lines: [],
    submissions: [],
    startedAt: now,
    lastActivityAt: now,
    endedAt: "",
  };
  await page.route("http://scene-guard.test/", (route) =>
    fulfill(route, { contentType: "text/html", body: '<div id="root"></div>' }),
  );
  let holdGuardRead = false,
    guardRead;
  await page.route("**/api/villages**", (route) => {
    if (route.request().url().endsWith("/rooms/active") && holdGuardRead) {
      guardRead = route;
      return;
    }
    return fulfill(route, {
      contentType: "application/json",
      body: JSON.stringify(route.request().url().endsWith("/rooms/active") ? { session } : snapshot),
    });
  });
  await page.goto("http://scene-guard.test/");
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await expect(page.locator("#screen")).toHaveText("room");
  for (const status of ["opening", "active", "closing"]) {
    await page.evaluate((status) => window.navigation.setRoom((current) => ({ ...current, status })), status);
    for (const destination of ["setup", "resume", "preparing"]) {
      await page.evaluate((destination) => window.navigation.setScreen(destination), destination);
      await expect(page.locator("#screen")).toHaveText("room");
    }
    for (const destination of ["home", "menu", "venue"]) {
      await page.evaluate((destination) => window.navigation.setScreen(destination), destination);
      await expect(page.locator("#screen")).toHaveText(destination);
    }
  }
  await page.evaluate(() => {
    window.navigation.setPersonProfile({ actorId: "mara", returnTo: "room" });
    window.navigation.setScreen("person");
  });
  await expect(page.locator("#screen")).toHaveText("person");
  await expect(page.getByRole("button", { name: "Inspect", exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Generate signature", exact: true })).toBeEnabled();
  await page.getByText("Manage", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Move out", exact: true })).toBeEnabled();
  await page.getByText("Manage", { exact: true }).click();
  await page
    .getByRole("navigation", { name: "Villager profile sections" })
    .getByRole("button", { name: "Venues", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "View Venue", exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "A project" })).toBeEnabled();
  await page.getByRole("button", { name: "Wishes", exact: true }).click();
  await expect(page.getByRole("button", { name: "Following", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "← Back to Villagers" }).click();
  await expect(page.locator("#screen")).toHaveText("room");
  await page.evaluate(() => {
    window.navigation.setRoom((current) => ({ ...current, status: "closed" }));
    window.navigation.setScreen("home");
  });
  await expect(page.locator("#screen")).toHaveText("home");
  holdGuardRead = true;
  await page.evaluate(() =>
    window.navigation.setRoom({
      id: "",
      version: 2,
      placeId: "mill",
      placeName: "The Mill",
      status: "opening",
      activeIds: [],
      participants: [],
      lines: [],
      startedAt: "",
      endedAt: "",
    }),
  );
  await expect(page.locator("#screen")).toHaveText("home");
  await page.evaluate(() => window.navigation.closeRoom());
  await expect(page.locator("#screen")).toHaveText("checking");
  await expect.poll(() => !!guardRead).toBe(true);
  await fulfill(guardRead, {
    contentType: "application/json",
    body: JSON.stringify({ session: { ...session, status: "opening" } }),
  });
  await expect(page.locator("#screen")).toHaveText("room");
  await expect.poll(() => page.evaluate(() => window.navigation.room?.id)).toBe("guard");
  await expect.poll(() => page.evaluate(() => window.navigation.room?.status)).toBe("opening");
  await page.close();
  console.log(
    "Scene startup navigation: delayed check, failed check, retry with and without active Scene on desktop and phone passed",
  );
} finally {
  await browser.close();
}
