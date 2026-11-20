import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, expect, withBrowser, mockEngineLookups } from "./fixtures/browser-diagnostics.mjs";

const built = await build({
  stdin: {
    contents: `
import {createRoot} from 'react-dom/client';
import {StrictMode,useState,useLayoutEffect} from 'react';
import {useSceneReadingSession} from './packages/villages/src/client/features/scenes/reading-session.js';
import {RoomPanel} from './packages/villages/src/client/features/scenes/ScenePanel.js';
import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';
import {authorSceneView} from './tests/helpers/scene-playback.fixture.ts';
const at='2026-11-20T12:00:00Z',noop=()=>{},scope='a'.repeat(64);
const line=(id,content,speakerId='__venue_scene__')=>({id,content,role:'assistant',kind:speakerId==='__venue_scene__'?'narration':'dialogue',speakerId,name:speakerId==='mara'?'Mara':'Narration',at});
const initial={id:'A',placeId:'mill',placeName:'The Mill',zoneId:'workshop',zoneArrivalId:'arrival-workshop',status:'active',startedAt:at,endedAt:'',activeIds:['mara','jo'],participants:[{characterId:'mara',name:'Mara',doing:''},{characterId:'jo',name:'Jo',doing:''}],lines:[line('old','Old Entrance dialogue.'),line('arrival-workshop','You arrive at Workshop.'),line('new-1','**Mara sets her cup down.**'),line('new-2','Welcome to the Workshop.','mara'),line('new-3','The workbench is covered in tools.')],submissions:[{id:'latest',replyLineIds:['new-1','new-2','new-3']}]};
function Harness(){const reading=useSceneReadingSession(true);const [room,setRoom]=useState(initial),[draft,setDraft]=useState('Unsent draft');
useLayoutEffect(syncVillagesStyles,[]);window.h={setRoom,room,line};
const props={sceneReading:reading,worldScope:scope,mobile:innerWidth<704,nameColors:{},speechColors:{},picture:'',draft,busy:false,error:'',greetingNotice:'',open:true,ended:false,playerName:'Player',portraits:{},sprites:{},onDraft:setDraft,onSend:noop,sendOnEnter:false,spriteCardFlipEnabled:false,onViewVenue:noop,onEnd:noop,onRetryGreeting:noop,onContinueWithoutGreeting:noop,notices:[],onDismissNotice:noop,debugDiscardEnabled:false,onDebugDiscard:noop,sceneSettings:null,movementZones:[],onMovementTarget:noop,currentZoneLabel:'Workshop'};
return <marinara-capability-villages><div className='marinara-capability-villages-root marinara-capability-villages-room-screen' data-mobile={innerWidth<704?'true':'false'}><RoomPanel {...props} room={authorSceneView(room,scope)}/></div></marinara-capability-villages>}
syncVillagesStyles();createRoot(document.getElementById('root')).render(<StrictMode><Harness/></StrictMode>);
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
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const width of [320, 390, 1366]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await mockEngineLookups(page);
    const errors = [],
      writes = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("http://latest.test/", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: `<style>:root{--background:#231c2d;--popover:#372e45;--foreground:#e8dcc0;--primary:#acb48b;--border:#786a80;--muted-foreground:#b9ada8}html,body,#root{margin:0;width:100%;height:100%;font-family:Arial}marinara-capability-villages{display:block;width:100%;height:100%}</style><div id='root'></div>`,
      }),
    );
    await page.route("**/api/villages/**", async (route) => {
      if (route.request().method() !== "GET") writes.push(route.request().url());
      const line = (id, content) => ({
        id,
        content,
        at: "2026-11-20T12:00:00Z",
        role: "assistant",
        kind: "narration",
        speakerId: "__venue_scene__",
        name: "Narration",
      });
      await route.fulfill({
        json: {
          sceneId: "A",
          scope: "a".repeat(64),
          version: "1".repeat(64),
          lines: [
            line("old", "Old Entrance dialogue."),
            line("arrival-airstrip", "You arrive at Airstrip."),
            line("back-entrance", "You return to Entrance."),
            line("arrival-workshop", "You arrive at Workshop."),
          ],
          visits: [
            { id: "A", name: "Entrance", at: "2026-11-20T12:00:00Z", lineIds: ["old"] },
            { id: "arrival-airstrip", name: "Airstrip", at: "2026-11-20T12:01:00Z", lineIds: ["arrival-airstrip"] },
            { id: "back-entrance", name: "Entrance", at: "2026-11-20T12:02:00Z", lineIds: ["back-entrance"] },
            { id: "arrival-workshop", name: "Workshop", at: "2026-11-20T12:03:00Z", lineIds: ["arrival-workshop"] },
          ],
        },
      });
    });
    await page.goto("http://latest.test/");
    await page.addScriptTag({ content: built.outputFiles[0].text });
    const reply = page.getByRole("region", { name: "Latest reply", exact: true });
    const next = page.getByRole("button", { name: "Next paragraph", exact: true }),
      previous = page.getByRole("button", { name: "Previous paragraph", exact: true });
    await expect(reply).toContainText("Mara sets her cup down.");
    await expect(reply).not.toContainText("Welcome to the Workshop.");
    await expect(reply.locator("strong")).toHaveText("Mara sets her cup down.");
    await expect(previous).toBeDisabled();
    await next.click();
    await expect(reply).toHaveText("Welcome to the Workshop.");
    await previous.click();
    await expect(reply).toHaveText("Mara sets her cup down.");
    await next.click();
    await next.click();
    await expect(reply).toHaveText("The workbench is covered in tools.");
    await expect(next).toBeDisabled();
    await expect(reply).not.toContainText("Old Entrance");
    const cast = page.locator('[class$="-chat-cast-person"]');
    await expect(cast).toHaveCount(2);
    const initialCast = await cast.evaluateAll((nodes) => nodes.map((node) => node.outerHTML));
    const trigger = page.getByRole("button", { name: "Transcript", exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Scene transcript", exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Entrance", exact: true })).toHaveCount(2);
    await expect(dialog.getByRole("log", { name: "Scene history" })).toContainText("Old Entrance dialogue.");
    const sceneBox = await page.locator('[class$="-room-screen"]').boundingBox(),
      box = await dialog.boundingBox();
    assert(Math.abs(box.height - sceneBox.height) < 2, JSON.stringify({ sceneBox, box, width }));
    assert(width < 704 ? Math.abs(box.width - sceneBox.width) < 2 : box.width < sceneBox.width * 0.6);
    assert(Math.abs(box.x + box.width - sceneBox.x - sceneBox.width) < 2, "desktop drawer is anchored to the right");
    assert.deepEqual(
      await cast.evaluateAll((nodes) => nodes.map((node) => node.outerHTML)),
      initialCast,
      "history does not change current cast",
    );
    assert.equal(await page.evaluate(() => window.h.room.zoneId), "workshop");
    await expect(page.getByRole("button", { name: "Close transcript", exact: true })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("log")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("textbox", { name: "Message at The Mill" })).toHaveValue("Unsent draft");
    await page.evaluate(() => {
      const h = window.h,
        arrival = h.line("arrival-return", "You arrive back at Workshop.");
      h.setRoom({ ...h.room, zoneArrivalId: arrival.id, lines: [...h.room.lines, arrival] });
    });
    await expect(reply).toContainText("You arrive back at Workshop.");
    await expect(reply).not.toContainText("Welcome to the Workshop.");
    await expect(previous).toBeDisabled();
    await expect(next).toBeDisabled();
    const long = Array.from(
      { length: 12 },
      (_, i) => "Sentence " + i + " stays complete while the paragraph is fitted to the phone. ",
    ).join("");
    await page.evaluate((long) => {
      const h = window.h,
        line = h.line("long", "**" + long + "**\n\nFinal reply paragraph.");
      h.setRoom({
        ...h.room,
        lines: [...h.room.lines, line],
        submissions: [...h.room.submissions, { id: "long", replyLineIds: [line.id] }],
      });
    }, long);
    await expect(reply).toContainText("Sentence 0");
    await expect(previous).toBeDisabled();
    const parts = [];
    for (let i = 0; i < 100; i++) {
      const text = await reply.textContent();
      if (text === "Final reply paragraph.") break;
      parts.push(text);
      await expect(next).toBeEnabled();
      await next.click();
    }
    assert.equal(parts.join(""), long, "all pages preserve the paragraph exactly");
    await expect(reply).toHaveText("Final reply paragraph.");
    await expect(next).toBeDisabled();
    const composer = await page.getByRole("textbox", { name: "Message at The Mill" }).boundingBox();
    assert(composer.y + composer.height <= 901);
    assert.deepEqual(writes, []);
    assert.deepEqual(errors, []);
    await page.close();
  }
});
console.log(
  "Paragraph-by-paragraph latest reply, Back/Next, fresh arrivals, repeat Zone transcript sections, live cast, desktop drawer, full-screen phones, focus and draft preservation passed.",
);
