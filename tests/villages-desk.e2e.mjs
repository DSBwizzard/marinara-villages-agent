import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, withBrowser, fulfill } from "./fixtures/browser-diagnostics.mjs";

async function bundle() {
  const stubs = new Map([
    [
      "VillagesFrame.tsx",
      `export function VillagesFrame({controller,children}){return <div key={controller.snapshot.worldScope}>{children}</div>}`,
    ],
    [
      "useVillageController.tsx",
      `
      import {useState,useRef} from 'react';
      export function useVillageController(){
        const [screen,setScreen]=useState('home'),[menuPage,setMenuPage]=useState('index');
        const [snapshot,setSnapshot]=useState({worldScope:'world-a',settings:{venues:[]}});
        const [exploreSheet,setExploreSheet]=useState(null);
        const spriteLeaveGuard=useRef(async()=>{window.guardCalls++;return true});
        window.scopeChange=()=>setSnapshot({worldScope:'world-b',settings:{venues:[]}});
        return {screen,setScreen,menuPage,setMenuPage,snapshot,spriteLeaveGuard,exploreSheet,setExploreSheet,
          explorationReturnTab:useRef("map"),explorationOrigin:useRef(null),
          mailboxOpen:false,setMailboxOpen(){},room:null,sceneRestoration:{status:'ready'},
          openMenu(page){window.events.push('route:'+page);setMenuPage(page);setScreen('menu')},
          async goHome(){window.rawGoHomeCalls++;if(!(await spriteLeaveGuard.current()))return;setExploreSheet(null);setScreen('home')},
          setPersonProfile(){},setProfileInspection(){},setSpriteManagerId(){},setPickerOpen(){},setSettingsError(){},setOpenPlaceId(){}}
      }`,
    ],
    [
      "ExplorationScreen.tsx",
      `export function ExplorationScreen({controller}){return <button onClick={()=>controller.openMenu('villagers')}>Open People</button>}`,
    ],
    ["RosterScreen.tsx", `export function RosterScreen(){return <button>Resident</button>}`],
    ["Mailbox.tsx", `export function Mailbox(){return null}`],
    ["MenuScreen.tsx", `export function MenuScreen(){return <button>Project control</button>}`],
    ...["FoundingScreen", "PreparationScreen", "ResumeScreen", "ResidentsScreen", "SceneScreen", "VenueScreen"].map(
      (name) => [name + ".tsx", `export function ${name}(){return null}`],
    ),
  ]);
  const result = await build({
    stdin: {
      contents: `import {createRoot} from 'react-dom/client';import {VillagesView} from './packages/villages/src/client/shell/VillagesApp.js';createRoot(document.getElementById('root')).render(<VillagesView element={document.getElementById('root')}/>);`,
      resolveDir: process.cwd(),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    jsx: "automatic",
    format: "iife",
    plugins: [
      {
        name: "review-controller",
        setup(builder) {
          builder.onLoad({ filter: /\.tsx$/ }, (args) => {
            const name = args.path.split(/[\\/]/).pop();
            return stubs.has(name) ? { contents: stubs.get(name), loader: "tsx" } : null;
          });
        },
      },
    ],
  });
  return result.outputFiles[0].text;
}

async function run() {
  const source = await bundle();
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  async function makePage(reduced = false) {
    const page = await browser.newPage({
      viewport: { width: 1024, height: 800 },
      reducedMotion: reduced ? "reduce" : "no-preference",
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("https://desk.test/", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: '<button id="outside">Engine control</button><div id="root" style="height:700px"></div>',
      }),
    );
    await page.goto("https://desk.test/");
    await page.evaluate(() => {
      window.events = [];
      window.guardCalls = 0;
      window.rawGoHomeCalls = 0;
      window.departedPaperOffsets = [];
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (frames, options) {
        const duration = typeof options === "number" ? options : options.duration;
        window.events.push(
          duration === 0 ? "animate:0" : frames[0].transform.includes("calc") ? "animate:enter" : "animate:exit",
        );
        const animation = animate.call(this, frames, options);
        if (duration && !frames[0].transform.includes("calc")) {
          const cancel = animation.cancel.bind(animation);
          animation.cancel = () => {
            cancel();
            if (this.closest("[data-phase]")?.dataset.phase === "closing") {
              window.departedPaperOffsets.push({
                offset: new DOMMatrixReadOnly(getComputedStyle(this).transform).m42,
                height: this.clientHeight,
              });
            }
          };
        }
        return animation;
      };
    });
    await page.addScriptTag({ content: source });
    return page;
  }
  const settle = (page) => page.waitForFunction(() => document.querySelector("[data-desk]").dataset.phase === "open");
  async function people(page) {
    await page.getByRole("button", { name: "Open People", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("[data-desk]").dataset.desk === "people");
    await settle(page);
  }
  await withBrowser(browser, async () => {
    const normal = await makePage();
    await people(normal);
    await normal.getByRole("button", { name: "Resident", exact: true }).focus();
    await normal.keyboard.press("Tab");
    assert.equal(await normal.evaluate(() => document.activeElement.textContent.trim()), "People");
    await normal.getByRole("button", { name: "Projects", exact: true }).click();
    await normal.waitForFunction(() => document.querySelector("[data-desk]").dataset.desk === "projects");
    await settle(normal);
    assert.deepEqual(await normal.evaluate(() => window.events), [
      "route:villagers",
      "animate:enter",
      "animate:exit",
      "route:projects",
      "animate:enter",
    ]);
    const departed = await normal.evaluate(() => window.departedPaperOffsets);
    assert.equal(departed.length, 1);
    assert(departed[0].offset > departed[0].height, "The old paper stays below the desk until the new menu commits");
    await normal.close();

    const slow = await makePage();
    await people(slow);
    let releaseArt;
    let artRequests = 0;
    const waitingArt = new Promise((resolve) => {
      releaseArt = resolve;
    });
    await slow.route("**/desk-art/projects-desktop.webp", async (route) => {
      artRequests++;
      await waitingArt;
      await route.fallback();
    });
    await slow.getByRole("button", { name: "Projects", exact: true }).click();
    await slow.waitForFunction(() => document.querySelector("[data-phase]").dataset.phase === "preparing");
    assert.equal(await slow.locator("[data-desk]").getAttribute("data-desk"), "people");
    assert.equal(
      await slow.locator(".marinara-capability-villages-desk-document").evaluate((node) => node.inert),
      true,
    );
    assert.equal(
      await slow.getByRole("button", { name: "Resident", exact: true }).isVisible(),
      true,
      "Old paper stays visible while artwork loads",
    );
    releaseArt();
    await slow.waitForFunction(() => document.querySelector("[data-desk]").dataset.desk === "projects");
    await settle(slow);
    const art = () =>
      slow
        .locator(".marinara-capability-villages-desk-document")
        .evaluate((node) => getComputedStyle(node, "::before").backgroundImage);
    const desktopArt = await art();
    assert(desktopArt.includes("blob:"), "Menu paints retained image bytes rather than a no-store asset URL");
    await slow.getByRole("button", { name: "People", exact: true }).click();
    await slow.waitForFunction(() => document.querySelector("[data-desk]").dataset.desk === "people");
    await settle(slow);
    const cdp = await slow.context().newCDPSession(slow);
    await cdp.send("Network.clearBrowserCache");
    await cdp.send("Memory.simulatePressureNotification", { level: "critical" });
    await slow.getByRole("button", { name: "Projects", exact: true }).click();
    await slow.waitForFunction(() => document.querySelector("[data-desk]").dataset.desk === "projects");
    await settle(slow);
    assert.equal(await art(), desktopArt, "Inactive artwork survives HTTP cache eviction and memory pressure");
    assert.equal(artRequests, 1, "Returning to the menu never re-downloads its artwork");
    await slow.setViewportSize({ width: 390, height: 844 });
    assert(
      (await art()).includes("blob:") && (await art()) !== desktopArt,
      "Phone artwork is already retained when the viewport changes",
    );
    await slow.close();

    const failed = await makePage();
    await people(failed);
    let failArt = true;
    await failed.route("**/desk-art/projects-desktop.webp", (route) =>
      failArt ? fulfill(route, { status: 503, body: "Unavailable" }) : route.fallback(),
    );
    await failed.getByRole("button", { name: "Projects", exact: true }).click();
    await failed.getByRole("alert").waitFor();
    assert.equal(
      await failed.locator("[data-desk]").getAttribute("data-desk"),
      "people",
      "Failed art leaves the existing menu intact",
    );
    await settle(failed);
    assert.equal(
      await failed.locator(".marinara-capability-villages-desk-document").evaluate((node) => node.inert),
      false,
    );
    failArt = false;
    await failed.getByRole("button", { name: "Projects", exact: true }).click();
    await failed.waitForFunction(() => document.querySelector("[data-desk]").dataset.desk === "projects");
    await settle(failed);
    assert.equal(await failed.getByRole("alert").count(), 0, "Artwork failures can be retried normally");
    await failed.close();

    const firstLoad = await makePage();
    let failFirstArt = true;
    await firstLoad.route("**/people-desk.webp", (route) =>
      failFirstArt ? fulfill(route, { status: 503, body: "Unavailable" }) : route.fallback(),
    );
    await firstLoad.getByRole("button", { name: "Open People", exact: true }).click();
    await firstLoad.getByRole("alert").waitFor();
    assert.equal(
      await firstLoad.locator("[data-desk]").getAttribute("data-desk"),
      "none",
      "The first menu also waits for artwork",
    );
    failFirstArt = false;
    await people(firstLoad);
    await firstLoad.close();

    const scope = await makePage();
    await people(scope);
    await scope.getByRole("button", { name: "Projects", exact: true }).click();
    await scope.waitForFunction(() => document.querySelector("[data-desk]").dataset.phase === "closing");
    await scope.evaluate(() => window.scopeChange());
    await settle(scope);
    assert.equal(await scope.locator("[data-desk]").getAttribute("data-desk"), "people");
    assert.equal(await scope.locator("[inert]").count(), 0);
    assert.equal(await scope.evaluate(() => window.events.includes("route:projects")), false);
    await scope.getByRole("button", { name: "Resident", exact: true }).click();
    await scope.close();

    const entering = await makePage();
    await entering.getByRole("button", { name: "Open People", exact: true }).click();
    await entering.waitForFunction(() => document.querySelector("[data-desk]").dataset.phase === "opening");
    await entering.evaluate(() => window.scopeChange());
    await settle(entering);
    assert.equal(await entering.locator("[data-desk]").getAttribute("data-desk"), "people");
    assert.equal(await entering.locator("[inert]").count(), 0);
    await entering.close();

    const reduced = await makePage(true);
    await people(reduced);
    await reduced.getByRole("button", { name: "Projects", exact: true }).click();
    await reduced.waitForFunction(() => document.querySelector("[data-desk]").dataset.desk === "projects");
    await settle(reduced);
    assert.deepEqual(await reduced.evaluate(() => window.events), [
      "route:villagers",
      "animate:0",
      "route:projects",
      "animate:0",
    ]);
    await reduced.evaluate(() => {
      window.guardCalls = 0;
      window.rawGoHomeCalls = 0;
    });
    await reduced.getByRole("button", { name: "Return to village", exact: true }).click();
    await reduced.waitForFunction(() => document.querySelector("[data-desk]").dataset.desk === "none");
    assert.equal(await reduced.evaluate(() => window.guardCalls), 1);
    assert.equal(await reduced.evaluate(() => window.rawGoHomeCalls), 0);
    await reduced.close();
    assert.deepEqual(errors, []);
    console.log(
      "Passed: transition order, modal Tab wrap, identity changes during exit and entry, zero-duration reduced motion, one sprite guard on Return.",
    );
  });
}
await run();
