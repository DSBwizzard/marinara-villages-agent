import { mockEngineLookups, fulfill } from "./browser-diagnostics.mjs";
import { scenePlaybackFixtures } from "./scene-browser.fixture.mjs";
import assert from "node:assert/strict";
import { build } from "../../scripts/esbuild.mjs";
import { expect } from "@playwright/test";

/** Mount the actual panel and feature-owned session to exercise lifecycle transitions. */
export async function checkReadingSessionLifecycle(browser) {
  const { fixturePlaybackPage } = await scenePlaybackFixtures();
  const built = await build({
    stdin: {
      contents: `
import {createRoot} from 'react-dom/client';
import {StrictMode,useState} from 'react';
import {RoomPanel} from './packages/villages/src/client/features/scenes/ScenePanel.js';
import {useSceneReadingSession} from './packages/villages/src/client/features/scenes/reading-session.js';
import {authorSceneView} from './tests/helpers/scene-playback.fixture.ts';
const noop=()=>{};
function make(id,texts,raw=false){
  const scene={id,version:1,placeId:'venue',placeName:'Venue',area:'public',zoneId:'exterior',
    status:'active',startedAt:'2026-10-07T12:00:00Z',endedAt:'',lastActivityAt:'2026-10-07T12:00:00Z',
    participants:[],activeIds:[],submissions:[],lines:texts.map((content,i)=>({id:id+'-'+i,
      role:'assistant',speakerId:'__venue_scene__',name:'',kind:'narration',content,at:'2026-10-07T12:00:00Z'}))};
  return raw?scene:authorSceneView(scene,'a'.repeat(64));
}
function Harness(){
  const [founded,setFounded]=useState(true),[shown,setShown]=useState(true),
    [room,setRoom]=useState(make('A',['A zero.','A one.']));
  const reading=useSceneReadingSession(founded);
  const publish=scene=>{window.playbackSource=scene;setRoom(authorSceneView(scene,'a'.repeat(64)))};
  window.r={reading,setFounded,setShown,setRoom,room,make,authorSceneView,publish};
  const props={worldScope:'a'.repeat(64),mobile:false,nameColors:{},speechColors:{},picture:'',draft:'',mode:'chat',
    targetId:'',busy:false,error:'',greetingNotice:'',ruling:'',open:true,ended:false,
    playerName:'Player',portraits:{},sprites:{},onDraft:noop,onMode:noop,onTarget:noop,
    onSend:noop,sendOnEnter:false,spriteCardFlipEnabled:false,onViewVenue:noop,onEnd:noop,
    onRetryGreeting:noop,onContinueWithoutGreeting:noop,notices:[],onDismissNotice:noop,
    debugDiscardEnabled:false,onDebugDiscard:noop,sceneSettings:null,contactDoors:[],
    contactBoundary:'',onContactBoundary:noop,onAcceptEntry:noop,movementZones:[],
    movementTarget:'',onMovementTarget:noop,currentZoneLabel:'Exterior'};
  return <marinara-capability-villages style={{display:'block',width:'900px',height:'700px'}}>
    <div data-mobile='false'>
      {shown?<RoomPanel {...props} room={room} sceneReading={reading}/>:null}
      <pre id='session'/>
    </div>
  </marinara-capability-villages>;
}
const root=createRoot(document.getElementById('root'));
window.mount=()=>root.render(window.strict?<StrictMode><Harness/></StrictMode>:<Harness/>);
window.unmount=()=>root.render(null);
window.mount();
`,
      resolveDir: process.cwd(),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    jsx: "automatic",
  });

  for (const strict of [false, true]) {
    const page = await browser.newPage();
    await mockEngineLookups(page);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const requests = [];
    let delayed,
      rejectOlder = false;
    await page.route("http://reading-session.test/", (route) =>
      route.fulfill({ contentType: "text/html", body: '<div id="root"></div>' }),
    );
    await page.route("**/rooms/*/playback?**", async (route) => {
      const url = new URL(route.request().url());
      if (rejectOlder) {
        rejectOlder = false;
        await fulfill(route, { status: 503, json: { error: "Could not load the older passage." } });
        return;
      }
      const source = await page.evaluate(() => window.playbackSource);
      requests.push(url);
      let result;
      try {
        if (!source) throw Error("That reading position changed. Reopen the Scene.");
        result = fixturePlaybackPage(
          source,
          url.searchParams.get("scope"),
          url.searchParams.get("cursor") ?? undefined,
          url.searchParams.get("first") === "1",
        );
      } catch (error) {
        await fulfill(route, { status: 409, json: { error: error.message } });
        return;
      }
      if (delayed) {
        const wait = delayed;
        delayed = undefined;
        await wait;
      }
      await route.fulfill({ json: result });
    });
    await page.goto("http://reading-session.test/");
    await page.evaluate((value) => (window.strict = value), strict);
    await page.addScriptTag({ content: built.outputFiles[0].text });
    const region = page.getByRole("region", { name: "Current paragraph" });
    const text = region.locator("p").first();
    const next = page.getByRole("button", { name: "Next paragraph" });
    await expect(text).toHaveText("A one.");
    await page.evaluate(() => window.r.setRoom(window.r.make("A", ["A zero.", "A one.", "A two.", "A three."])));
    await expect(text).toHaveText("A two.");
    await page.evaluate(() => window.r.setShown(false));
    await page.evaluate(() => window.r.setShown(true));
    await expect(text).toHaveText("A two.");
    await next.click();
    await expect(text).toHaveText("A three.");
    await page.evaluate(() => window.r.setRoom(window.r.make("A", ["A zero.", "A one.", "A two."])));
    await expect(text).toHaveText("Passage unavailable.");
    await page.getByRole("button", { name: "1 Scene error", exact: true }).click();
    await page.getByRole("button", { name: "Latest", exact: true }).click();
    await expect(text).toHaveText("A two.");
    await page.evaluate(() => {
      window.r.setShown(false);
      window.r.setFounded(false);
    });
    await expect.poll(() => page.evaluate(() => window.r.reading.checkpoint.current.bookmark)).toBe(undefined);
    await page.evaluate(() => {
      window.r.setFounded(true);
      window.r.setRoom(window.r.make("B", ["Fresh B zero.", "Fresh B one."]));
      window.r.setShown(true);
    });
    await expect(text).toHaveText("Fresh B one.");
    await page.evaluate(() => window.unmount());
    await page.evaluate(() => window.mount());
    await expect(text).toHaveText("A one.");
    const publish = (count, id = "paged") =>
      page.evaluate(
        ({ count, id }) =>
          window.r.publish(
            window.r.make(
              id,
              Array.from({ length: count }, (_, i) => "Page " + i + "."),
              true,
            ),
          ),
        { count, id },
      );
    await publish(100);
    await expect(text).toHaveText("Page 99.");
    await publish(180);
    await expect(text).toHaveText("Page 100.");
    await page.evaluate(() => window.r.setShown(false));
    await page.evaluate(() => window.r.setShown(true));
    await expect(text).toHaveText("Page 100.");
    for (let index = 0; index < 79; index++) await next.click();
    await expect(text).toHaveText("Page 179.");
    assert(requests.length > 0, "Continuation reads use server-owned windows");
    await publish(260);
    await expect(text).toHaveText("Page 180.");
    rejectOlder = true;
    for (let index = 0; index < 40; index++) await next.click();
    await page.getByRole("button", { name: "1 Scene error", exact: true }).click();
    await page.getByRole("button", { name: "Latest", exact: true }).click();
    await expect(text).toHaveText("Page 259.");
    await publish(360);
    await expect(text).toHaveText("Page 260.");
    while ((await text.textContent()) !== "Page 299.") await next.click();
    let release;
    delayed = new Promise((done) => {
      release = done;
    });
    const before = requests.length;
    await next.click();
    await expect.poll(() => requests.length).toBe(before + 1);
    await publish(3, "replacement");
    await expect(text).toHaveText("Page 2.");
    release();
    await expect(text).toHaveText("Page 2.");
    if (!strict) {
      for (const count of [1000, 10_000, 25_000]) {
        await page.evaluate((count) => {
          const source = window.r.make(
            "growth-" + count,
            Array.from({ length: count }, (_, index) => "Growth " + index + "."),
            true,
          );
          source.participants = [{ characterId: "speaker", name: "Speaker", doing: "Talking" }];
          source.activeIds = ["speaker"];
          for (const [index, line] of source.lines.entries()) {
            if (index % 2)
              Object.assign(line, {
                kind: "side",
                speakerId: "speaker",
                name: "Speaker",
                asideFor: source.lines[index - 1].id,
              });
          }
          const room = window.r.authorSceneView(source, "a".repeat(64));
          const metrics = { idReads: 0, includesWork: 0 };
          for (const line of room.lines) {
            const id = line.id;
            Object.defineProperty(line, "id", {
              enumerable: true,
              get() {
                metrics.idReads++;
                return id;
              },
            });
          }
          const lines = new Set(room.lines),
            includes = Array.prototype.includes;
          Array.prototype.includes = function (value, from) {
            if (lines.has(value)) metrics.includesWork += this.length;
            return includes.call(this, value, from);
          };
          metrics.idReads = 0;
          window.growth = {
            metrics,
            restore: () => {
              Array.prototype.includes = includes;
            },
          };
          window.r.setRoom(room);
        }, count);
        try {
          await expect(text).toHaveText("Growth " + (count - 2) + ".", { timeout: 60_000 });
          const metrics = await page.evaluate(() => window.growth.metrics);
          assert(metrics.idReads > 0 && metrics.idReads < 10_000, "Actual reader work follows the bounded window");
          assert(metrics.includesWork < 3200, "Main-line membership never rescans the transcript per line");
          console.log(
            `Actual RoomPanel ${count}: ${JSON.stringify(metrics)}; latest main paragraph and its aside remain readable.`,
          );
        } finally {
          await page.evaluate(() => window.growth.restore());
        }
      }
    }
    assert.deepEqual(errors, []);
    await page.close();
    console.log(
      `Actual RoomPanel lifecycle passed: StrictMode=${strict}, latest/new ID, retained return, hidden/mounted append, rollback, reset with same ID, unmount/remount.`,
    );
  }
}
