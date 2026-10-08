import assert from "node:assert/strict";
import { build } from "esbuild";
import { expect } from "@playwright/test";

/** Mount the actual panel and feature-owned session to exercise lifecycle transitions. */
export async function checkReadingSessionLifecycle(browser) {
  const built = await build({
    stdin: {
      contents: `
import {createRoot} from 'react-dom/client';
import {StrictMode,useState} from 'react';
import {RoomPanel} from './packages/villages/src/client/features/scenes/ScenePanel.js';
import {useSceneReadingSession} from './packages/villages/src/client/features/scenes/reading-session.js';
const noop=()=>{};
function make(id,texts){
  return {id,version:1,placeId:'venue',placeName:'Venue',area:'public',zoneId:'exterior',
    status:'active',startedAt:'2026-10-07T12:00:00Z',endedAt:'',lastActivityAt:'2026-10-07T12:00:00Z',
    participants:[],activeIds:[],submissions:[],lines:texts.map((content,i)=>({id:id+'-'+i,
      role:'assistant',speakerId:'__venue_scene__',name:'',kind:'narration',content,at:'2026-10-07T12:00:00Z'}))};
}
function Harness(){
  const [founded,setFounded]=useState(true),[shown,setShown]=useState(true),
    [room,setRoom]=useState(make('A',['A zero.','A one.']));
  const reading=useSceneReadingSession(founded);
  window.r={reading,setFounded,setShown,setRoom,make};
  const props={mobile:false,nameColors:{},speechColors:{},picture:'',draft:'',mode:'chat',
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
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent('<div id="root"></div>');
    await page.evaluate((value) => (window.strict = value), strict);
    await page.addScriptTag({ content: built.outputFiles[0].text });
    const region = page.getByRole("region", { name: "Current paragraph" });
    const text = region.locator("p").first();
    const state = () =>
      page.evaluate(() => ({
        step: window.r.reading.checkpoint.current.readStep,
        previous: window.r.reading.previousReading.current,
        cursor: window.r.reading.checkpoint.current.cursor,
        anchor: window.r.reading.anchor.current,
        end: window.r.reading.enterAtEnd.current,
      }));

    await expect(text).toHaveText("A one.");
    await page.getByRole("button", { name: "Previous paragraph" }).click();
    await expect(text).toHaveText("A zero.");
    await page.evaluate(() => window.r.setShown(false));
    await expect(region).toHaveCount(0);
    await page.evaluate(() => window.r.setShown(true));
    await expect(text).toHaveText("A zero.");

    await page.evaluate(() => {
      window.r.setShown(false);
      window.r.setRoom(window.r.make("A", ["A zero.", "A one.", "A two.", "A three."]));
    });
    await expect(region).toHaveCount(0);
    await page.evaluate(() => window.r.setShown(true));
    await expect(text).toHaveText("A two.");
    await page.evaluate(() =>
      window.r.setRoom(window.r.make("A", ["A zero.", "A one.", "A two.", "A three.", "A four."])),
    );
    await expect(text).toHaveText("A four.");
    await page.evaluate(() => window.r.setRoom(window.r.make("A", ["A zero.", "A one.", "A two."])));
    await expect(text).toHaveText("A two.");

    await page.evaluate(() => window.r.setRoom(window.r.make("B", ["B zero.", "B one.", "B two.", "B three."])));
    await expect(text).toHaveText("B three.");

    await page.evaluate(() => window.r.setFounded(false));
    await expect(text).toHaveText("B zero.");
    await expect.poll(async () => (await state()).previous).toBe(null);
    const activeReset = await state();
    assert.equal(activeReset.step, 0);
    assert.deepEqual(activeReset.cursor, { key: "", offset: 0 });
    assert.deepEqual(activeReset.anchor, { key: "", offset: 0 });
    assert.equal(activeReset.end, false);
    await page.evaluate(() => {
      window.r.setFounded(true);
      window.r.setRoom(window.r.make("B", ["Fresh B zero.", "Fresh B one.", "Fresh B two.", "Fresh B three."]));
    });
    await expect(text).toHaveText("Fresh B three.");

    await page.evaluate(() => {
      window.r.setShown(false);
      window.r.setFounded(false);
    });
    await expect.poll(async () => (await state()).step).toBe(0);
    const reset = await state();
    assert.equal(reset.previous, null);
    assert.deepEqual(reset.cursor, { key: "", offset: 0 });
    assert.deepEqual(reset.anchor, { key: "", offset: 0 });
    assert.equal(reset.end, false);
    await page.evaluate(() => {
      window.r.setFounded(true);
      window.r.setRoom(window.r.make("A", ["Fresh A zero.", "Fresh A one."]));
      window.r.setShown(true);
    });
    await expect(text).toHaveText("Fresh A one.");
    await page.getByRole("button", { name: "Previous paragraph" }).click();
    await expect(text).toHaveText("Fresh A zero.");

    await page.evaluate(() => window.unmount());
    await expect(page.locator("#session")).toHaveCount(0);
    await page.evaluate(() => window.mount());
    await expect(text).toHaveText("A one.");
    assert.deepEqual(errors, []);
    await page.close();
    console.log(
      `Actual RoomPanel lifecycle passed: StrictMode=${strict}, latest/new ID, retained return, hidden/mounted append, rollback, reset with same ID, unmount/remount.`,
    );
  }
}
