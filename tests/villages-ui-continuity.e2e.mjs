import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, expect, fulfill, withBrowser } from "./fixtures/browser-diagnostics.mjs";

const bundle = await build({
  stdin: {
    contents: `
import React,{useState,useRef,useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {VillageActivity,useCapabilityVisibility} from './packages/villages/src/client/shared/activity.js';
import {RetainedView} from './packages/villages/src/client/shared/RetainedView.js';
import {request} from './packages/villages/src/client/shared/api.js';
import {VillagerDossier} from './packages/villages/src/client/features/residents/villages-dossier.js';
import {VillagerWishJournal} from './packages/villages/src/client/features/residents/villages-wish-journal.js';
import {VillagerMemoriesPanel} from './packages/villages/src/client/features/residents/MemoriesPanel.js';
import {useLoadMemoryLibrary,useLoadAgendas,useSetAgendaScheduleIngestion} from './packages/villages/src/client/features/residents/actions.js';
function Harness(){
 const [scope,setScope]=useState('world-a'),[actor,setActor]=useState('mara'),[revision,setRevision]=useState('0');
 const [active,setActive]=useState(true),[hidden,setHidden]=useState(false),[sprites,setSprites]=useState(false);
 const [library,setLibrary]=useState(null),[agendas,writeAgendas]=useState(null),[error,setError]=useState('');
 const agendaRevision=useRef(0),currentSnapshotRef=useRef(null);currentSnapshotRef.current={worldScope:scope};
 const setAgendas=useCallback(next=>{agendaRevision.current++;writeAgendas(next)},[]);
 const visible=useCapabilityVisibility(document.getElementById('root'))&&!hidden;
 const loadMemory=useLoadMemoryLibrary({worldScope:scope,setMemoryLibrary:setLibrary,setError});
 const loadAgendas=useLoadAgendas({worldScope:scope,setAgendas,setError,agendaRevision});
 const influence=useSetAgendaScheduleIngestion({currentSnapshotRef,setAgendas,setError,setBusy:()=>{}});
 window.h={scope:setScope,actor:setActor,refresh:()=>setRevision(value=>String(Number(value)+1)),active:setActive,hidden:setHidden,visible,sprites:setSprites,loadAgendas,influence,agendas};
 return <VillageActivity value={{visible,backgroundRevision:revision,worldScope:scope}}>
 <RetainedView active={active}><VillagerDossier key={scope+actor} navigation={{actorId:actor,returnTo:'home'}} villager={{characterId:actor,name:actor,summary:'A villager',missing:false}}
 portrait={null} request={request} venues={[]} links={[]} controls={<input aria-label='Identity draft'/>} spriteManager={sprites?<button onClick={()=>setSprites(false)}>Back to profile</button>:undefined}
 onInspectSection={()=>{}} onBack={()=>setActive(false)} onVenue={()=>{}} inspectors={{
 wishes:<VillagerWishJournal request={request} characterId={actor} prefix='v' inspect/>,
 memories:<VillagerMemoriesPanel characterId={actor} library={library} busy={false} onQuery={(query,signal)=>loadMemory(signal,query)} onForget={()=>{}}/>,
 agenda:<pre>{JSON.stringify(agendas)}</pre>
 }}/></RetainedView><p role='alert'>{error}</p></VillageActivity>;
}createRoot(document.getElementById('root')).render(<Harness/>);`,
    loader: "tsx",
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
});

const browser = await chromium.launch({ headless: process.env.VILLAGES_HEADED !== "1" });
await withBrowser(browser, async () => {
  for (const width of [1280, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await context.newPage();
    const reads = [];
    let hold = null;
    const pause = (path, status = 200) => {
      const gate = Promise.withResolvers();
      hold = { path, status, gate, started: 0 };
      return hold;
    };
    let summary = "Known relationship";
    let followed = false;
    let agendaName = "Current agenda";
    const profiles = () =>
      ["mara", "eli"].map((characterId) => ({
        characterId,
        name: characterId,
        summary,
        knownAt: "2026-11-05T00:00:00Z",
        routine: [],
        interests: "",
        ties: [],
        learned: [],
        access: [],
        knownWishes: [
          {
            wishId: characterId + "-wish",
            text: characterId + " shared Wish",
            at: "2026-11-05T00:00:00Z",
            facts: [],
            followed,
          },
        ],
      }));
    await page.route("http://continuity.test/", (route) =>
      fulfill(route, {
        contentType: "text/html",
        body: '<style>[hidden]{display:none!important}.marinara-capability-villages-dossier-content{height:180px;overflow:auto}input{max-width:90%}</style><div id="root"></div>',
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const url = new URL(route.request().url());
      reads.push(url.pathname);
      let json;
      if (url.pathname.endsWith("/follow")) {
        followed = route.request().postDataJSON().followed;
        json = { profiles: profiles() };
      } else if (url.pathname.endsWith("/relationships")) json = { profiles: profiles(), starting: { pending: false } };
      else if (url.pathname.endsWith("/wishes/inspect"))
        json = {
          wishes: [
            {
              id: "private",
              wish: "Private Wish",
              reason: "Private reason",
              status: "open",
              addedAt: "2026-11-05T00:00:00Z",
              history: [],
              conditions: [],
            },
          ],
        };
      else if (url.pathname.endsWith("/memories/inspect")) {
        const characterId = url.searchParams.get("characterId"),
          query = url.searchParams.get("query") ?? "";
        json = {
          characterId,
          query,
          seed: "a",
          revision: 1,
          residents: [{ id: characterId, name: characterId }],
          entries: [
            {
              id: "m1",
              kind: "experience",
              text: "Saved memory",
              occurredAt: "2026-11-05T00:00:00Z",
              knownBy: [],
              subjects: [],
            },
          ],
          total: 1,
          next: null,
        };
      } else if (url.pathname.endsWith("/agendas") || url.pathname.endsWith("/influence"))
        json = { villagers: [{ characterId: "mara", name: agendaName }] };
      else if (url.pathname.endsWith("/signature")) json = { status: "idle", attempt: 0 };
      else throw Error("Unexpected read " + url.pathname);
      const pending = hold?.path === url.pathname ? hold : null;
      if (pending) {
        pending.started++;
        await pending.gate.promise;
      }
      await fulfill(
        route,
        pending?.status >= 400 ? { status: pending.status, json: { error: "Read unavailable" } } : { json },
      );
    });
    await page.goto("http://continuity.test/");
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const tabs = page.getByRole("navigation", { name: "Villager profile sections" });
    const overview = page.getByRole("region", { name: "Overview content" });
    await expect(overview.getByText(summary)).toBeVisible();

    const scroller = page.locator(".marinara-capability-villages-dossier-content");
    const position = await scroller.evaluate((element) => {
      element.style.height = "80px";
      element.scrollTop = 60;
      return element.scrollTop;
    });
    assert.ok(position > 0);
    await tabs.getByRole("button", { name: "Agenda", exact: true }).click();
    await tabs.getByRole("button", { name: "Overview", exact: true }).click();
    assert.equal(await scroller.evaluate((element) => element.scrollTop), position);
    await page.getByText("Character tools", { exact: true }).click();
    const draft = page.getByRole("textbox", { name: "Identity draft" });
    await draft.fill("Unfinished identity");
    const draftNode = await draft.elementHandle();
    await page.evaluate(() => window.h.sprites(true));
    await page.getByRole("button", { name: "Back to profile" }).click();
    await expect(draft).toHaveValue("Unfinished identity");
    assert.equal(await draftNode.evaluate((element) => element.isConnected), true);
    await draft.focus();
    await page.evaluate(() => window.h.active(false));
    await page.evaluate(() => window.h.active(true));
    await expect(draft).toHaveValue("Unfinished identity");
    await expect(draft).toBeFocused();
    await page.getByText("Character tools", { exact: true }).click();
    await scroller.evaluate((element) => {
      element.style.height = "620px";
    });
    const node = await overview.getByText(summary).elementHandle();
    await tabs.getByRole("button", { name: "Overview", exact: true }).focus();
    const pending = pause("/api/villages/relationships");
    await page.evaluate(() => window.h.refresh());
    await expect.poll(() => pending.started).toBeGreaterThan(0);
    await expect(overview.getByText(summary)).toBeVisible();
    assert.equal(await node.evaluate((element) => element.isConnected), true);
    await expect(tabs.getByRole("button", { name: "Overview", exact: true })).toBeFocused();
    pending.gate.resolve();
    hold = null;
    summary = "Updated relationship";
    await page.evaluate(() => window.h.refresh());
    await expect(overview.getByText(summary)).toBeVisible();
    assert.equal(await node.evaluate((element) => element.isConnected), true, "Fresh content updates the same node");
    const failed = pause("/api/villages/relationships", 503);
    await page.evaluate(() => window.h.refresh());
    await expect.poll(() => failed.started).toBeGreaterThan(0);
    failed.gate.resolve();
    hold = null;
    await expect(page.getByRole("alert").filter({ hasText: "Read unavailable" })).toBeVisible();
    await expect(overview.getByText(summary)).toBeVisible();
    const denied = pause("/api/villages/relationships", 403);
    await page.evaluate(() => window.h.refresh());
    await expect.poll(() => denied.started).toBeGreaterThan(0);
    denied.gate.resolve();
    hold = null;
    await expect(overview.getByText(summary)).toHaveCount(0);
    await page.evaluate(() => window.h.refresh());
    await expect(overview.getByText(summary)).toBeVisible();

    await tabs.getByRole("button", { name: "Wishes", exact: true }).click();
    await page.getByRole("button", { name: "Open Wish: mara shared Wish" }).click();
    const beforeFollow = pause("/api/villages/relationships");
    await page.evaluate(() => window.h.refresh());
    await expect.poll(() => beforeFollow.started).toBeGreaterThan(0);
    const followedRead = page.waitForResponse((response) =>
      new URL(response.url()).pathname.endsWith("/relationships"),
    );
    await page.getByRole("button", { name: "Follow", exact: true }).click();
    await expect(page.getByRole("button", { name: "Following", exact: true })).toHaveAttribute("aria-pressed", "true");
    beforeFollow.gate.resolve();
    await (await followedRead).finished();
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    hold = null;
    await expect(page.getByRole("button", { name: "Following", exact: true })).toHaveAttribute("aria-pressed", "true");
    await tabs.getByRole("button", { name: "Overview", exact: true }).click();
    await tabs.getByRole("button", { name: "Wishes", exact: true }).click();
    await expect(page.getByRole("button", { name: "← Wishes", exact: true })).toBeVisible();
    await tabs.getByRole("button", { name: "Inspect", exact: true }).click();
    await page.getByRole("button", { name: "Open Wish: Private Wish" }).click();
    const privateNode = await page.getByText("Private reason", { exact: true }).elementHandle();
    const privateRead = pause(
      process.env.VILLAGES_HEADED === "1"
        ? "/api/villages/relationships"
        : "/api/villages/villagers/mara/wishes/inspect",
    );
    if (process.env.VILLAGES_HEADED === "1") {
      const primarySession = await context.newCDPSession(page);
      await primarySession.send("Emulation.setFocusEmulationEnabled", { enabled: false });
      const other = await page.context().newPage();
      await other.goto("data:text/html,<title>Other tab</title><p>Other tab</p>");
      const otherSession = await context.newCDPSession(other);
      await otherSession.send("Emulation.setFocusEmulationEnabled", { enabled: false });
      await other.bringToFront();
      await expect.poll(() => page.evaluate(() => document.hasFocus())).toBe(false);
      await page.bringToFront();
      await expect.poll(() => page.evaluate(() => document.hasFocus())).toBe(true);
      await other.close();
      await primarySession.detach();
    } else {
      await page.evaluate(() => window.h.hidden(true));
      await expect.poll(() => page.evaluate(() => window.h.visible)).toBe(false);
      await page.evaluate(() => window.h.hidden(false));
    }
    await expect.poll(() => privateRead.started).toBeGreaterThan(0);
    await expect(page.getByText("Private reason", { exact: true })).toBeVisible();
    assert.equal(await privateNode.evaluate((element) => element.isConnected), true);
    privateRead.gate.resolve();
    hold = null;
    await tabs.getByRole("button", { name: "Memories", exact: true }).click();
    await expect(page.getByText("Saved memory")).toBeVisible();
    await page.getByRole("searchbox", { name: "Search memories" }).fill("unfinished query");
    await tabs.getByRole("button", { name: "Agenda", exact: true }).click();
    await tabs.getByRole("button", { name: "Memories", exact: true }).click();
    await expect(page.getByRole("searchbox", { name: "Search memories" })).toHaveValue("unfinished query");
    const memoryRead = pause("/api/villages/memories/inspect");
    await page.getByRole("searchbox", { name: "Search memories" }).fill("");
    await page.getByRole("button", { name: "Refresh", exact: true }).click();
    await expect.poll(() => memoryRead.started).toBeGreaterThan(0);
    await expect(page.getByText("Saved memory")).toBeVisible();
    memoryRead.gate.resolve();
    hold = null;
    await tabs.getByRole("button", { name: "Leave Inspect", exact: true }).click();
    await expect(page.getByText("Private reason", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Saved memory")).toHaveCount(0);

    await tabs.getByRole("button", { name: "Wishes", exact: true }).click();
    await tabs.getByRole("button", { name: "Inspect", exact: true }).click();
    await page.getByRole("button", { name: "Open Wish: Private Wish" }).click();
    const siblingDenied = pause("/api/villages/memories/inspect", 403);
    await tabs.getByRole("button", { name: "Memories", exact: true }).click();
    await page.getByRole("button", { name: "Refresh", exact: true }).click();
    await expect.poll(() => siblingDenied.started).toBeGreaterThan(0);
    siblingDenied.gate.resolve();
    hold = null;
    await expect(tabs.getByRole("button", { name: "Inspect", exact: true })).toBeVisible();
    await expect(page.getByText("Private reason", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Saved memory")).toHaveCount(0);

    await page.evaluate(() => window.h.loadAgendas());
    const beforeInfluence = pause("/api/villages/agendas");
    await page.evaluate(() => {
      void window.h.loadAgendas();
    });
    await expect.poll(() => beforeInfluence.started).toBeGreaterThan(0);
    agendaName = "Updated agenda";
    await page.evaluate(() => window.h.influence("mara", true));
    beforeInfluence.gate.resolve();
    hold = null;
    await expect.poll(() => page.evaluate(() => window.h.agendas?.[0]?.name)).toBe("Updated agenda");
    const oldAgenda = pause("/api/villages/agendas");
    await page.evaluate(() => {
      void window.h.loadAgendas();
    });
    await expect.poll(() => oldAgenda.started).toBeGreaterThan(0);
    const oldProfile = pause("/api/villages/relationships");
    await page.evaluate(() => window.h.refresh());
    await expect.poll(() => oldProfile.started).toBeGreaterThan(0);
    const oldMutation = pause("/api/villages/agendas/mara/influence");
    await page.evaluate(() => {
      void window.h.influence("mara", false);
    });
    await expect.poll(() => oldMutation.started).toBeGreaterThan(0);
    await page.evaluate(() => {
      window.h.scope("world-b");
      window.h.actor("eli");
    });
    oldProfile.gate.resolve();
    oldAgenda.gate.resolve();
    oldMutation.gate.resolve();
    hold = null;
    await tabs.getByRole("button", { name: "Wishes", exact: true }).click();
    await expect(page.getByRole("button", { name: "Open Wish: eli shared Wish" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open Wish: mara shared Wish" })).toHaveCount(0);
    await expect(page.getByText("Saved memory")).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.h.agendas)).toBe(null);
    await context.close();
  }
});
console.log(
  "UI refresh continuity, state retention, errors and scoped invalidation passed at desktop and phone widths.",
);
