import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, expect, withBrowser, fulfill } from "./fixtures/browser-diagnostics.mjs";

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
        const [screen,setScreen]=useState('home'),[menuPage,setMenuPage]=useState('index'),[personProfile,setPersonProfile]=useState(null);
        const [snapshot,setSnapshot]=useState({worldScope:'world-a',settings:{venues:[]}});
        const [exploreSheet,setExploreSheet]=useState(null);
        const spriteLeaveGuard=useRef(async()=>{window.guardCalls++;return true});
        window.scopeChange=()=>setSnapshot({worldScope:'world-b',settings:{venues:[]}});
        window.setDeskClock=village=>setSnapshot(value=>({...value,isFounded:!!village,village}));
        return {screen,setScreen,menuPage,setMenuPage,snapshot,spriteLeaveGuard,exploreSheet,setExploreSheet,personProfile,
          explorationReturnTab:useRef("map"),explorationOrigin:useRef(null),
          mailboxOpen:false,setMailboxOpen(){},room:null,sceneRestoration:{status:'ready'},
          openMenu(page){window.events.push('route:'+page);setMenuPage(page);setScreen('menu')},
          async goHome(){window.rawGoHomeCalls++;if(!(await spriteLeaveGuard.current()))return;setExploreSheet(null);setScreen('home')},
          setPersonProfile,async openPerson(person){if(!(await spriteLeaveGuard.current()))return false;setPersonProfile(person);setScreen('person');return true},setProfileInspection(){},setSpriteManagerId(){},setPickerOpen(){},setSettingsError(){},setOpenPlaceId(){}}
      }`,
    ],
    [
      "ExplorationScreen.tsx",
      `export function ExplorationScreen({controller}){return <button onClick={()=>controller.openMenu('villagers')}>Open People</button>}`,
    ],
    [
      "RosterScreen.tsx",
      `export function RosterScreen({controller}){return <button onClick={()=>controller.openPerson({actorId:'mara',returnTo:'menu'})}>Resident</button>}`,
    ],
    ["Mailbox.tsx", `export function Mailbox(){return null}`],
    [
      "MenuScreen.tsx",
      `export function MenuScreen(){return <><button hidden>Hidden draft</button><button>Project control</button></>}`,
    ],
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
  async function makePage(reduced = false, deviceTime = "2026-11-05T23:00:00Z") {
    const page = await browser.newPage({
      viewport: { width: 1024, height: 800 },
      reducedMotion: reduced ? "reduce" : "no-preference",
      timezoneId: "UTC",
    });
    await page.clock.setFixedTime(new Date(deviceTime));
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
        window.events.push(duration === 0 ? "animate:0" : frames[0].opacity === 0 ? "animate:enter" : "animate:exit");
        const animation = animate.call(this, frames, options);
        if (duration && frames[0].opacity !== 0) {
          const cancel = animation.cancel.bind(animation);
          animation.cancel = () => {
            cancel();
            if (this.closest("[data-phase]")?.dataset.phase === "closing") {
              window.departedPaperOffsets.push({
                opacity: getComputedStyle(this).opacity,
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
    for (const width of [1366, 390]) {
      const themed = await makePage(true, "2026-11-05T12:00:00Z");
      await themed.setViewportSize({ width, height: 844 });
      await people(themed);
      const desk = themed.locator("[data-desk]");
      const artwork = () => desk.evaluate((node) => getComputedStyle(node).backgroundImage);
      await expect(desk).toHaveAttribute("data-theme", "day");
      await expect(desk).toHaveCSS("color", "rgb(33, 62, 54)");
      const daylight = await artwork();
      assert.match(daylight, /blob:/, "The daytime scene is decoded before it is displayed");
      await themed.getByRole("button", { name: "Resident", exact: true }).focus();
      await themed.evaluate(() =>
        window.setDeskClock({ instant: "2026-11-05T04:00:00Z", timeZone: "America/Los_Angeles" }),
      );
      await expect(desk).toHaveAttribute("data-theme", "night");
      await expect(desk).toHaveCSS("color", "rgb(240, 223, 188)");
      assert.notEqual(await artwork(), daylight, "Village time selects different retained artwork");
      await expect(themed.getByRole("button", { name: "Resident", exact: true })).toBeFocused();
      await themed.getByRole("button", { name: "Settings", exact: true }).click();
      await expect(desk).toHaveAttribute("data-desk", "settings");
      await settle(themed);
      await expect(desk).toHaveAttribute("data-theme", "night");
      await themed.evaluate(() =>
        window.setDeskClock({ instant: "2026-11-05T13:00:00Z", timeZone: "America/Los_Angeles" }),
      );
      await expect(desk).toHaveAttribute("data-theme", "day");
      assert.equal(await artwork(), daylight, "The decoded village scene is reused across menus and clock changes");
      await themed.close();
    }

    const normal = await makePage();
    await people(normal);
    await normal.getByRole("button", { name: "Resident", exact: true }).focus();
    await normal.keyboard.press("Tab");
    assert.equal(await normal.evaluate(() => document.activeElement.textContent.trim()), "People");
    await normal.getByRole("button", { name: "Projects", exact: true }).click();
    await normal.waitForFunction(() => document.querySelector("[data-desk]").dataset.desk === "projects");
    await settle(normal);
    await normal.waitForFunction(() => document.activeElement?.textContent === "Project control");
    assert.deepEqual(await normal.evaluate(() => window.events), [
      "route:villagers",
      "animate:enter",
      "animate:exit",
      "route:projects",
      "animate:enter",
    ]);
    const departed = await normal.evaluate(() => window.departedPaperOffsets);
    assert.equal(departed.length, 1);
    assert.equal(departed[0].opacity, "0", "Departing content stays faded until its replacement commits");
    await normal.close();

    const slow = await makePage();
    let releaseArt;
    let artRequests = 0;
    const waitingArt = new Promise((resolve) => {
      releaseArt = resolve;
    });
    await slow.route("**/storybook-scenery-matte.webp", async (route) => {
      artRequests++;
      await waitingArt;
      await route.fallback();
    });
    await slow.getByRole("button", { name: "Open People", exact: true }).click();
    await slow.waitForFunction(() => document.querySelector("[data-phase]").dataset.phase === "preparing");
    assert.equal(await slow.locator("[data-desk]").getAttribute("data-desk"), "none");
    assert.equal(
      await slow.locator(".marinara-capability-villages-desk-document").evaluate((node) => node.inert),
      true,
    );
    assert.equal(
      await slow.getByRole("button", { name: "Open People", exact: true }).isVisible(),
      true,
      "The current view stays visible while the foreground layer loads",
    );
    releaseArt();
    await slow.waitForFunction(() => document.querySelector("[data-desk]").dataset.desk === "people");
    await settle(slow);
    const art = () =>
      slow
        .locator(".marinara-capability-villages-desk-workspace")
        .evaluate((node) => getComputedStyle(node).backgroundImage);
    const desktopArt = await art();
    assert(desktopArt.includes("blob:"), "Menu paints retained image bytes rather than a no-store asset URL");
    const matte = () =>
      slow
        .locator(".marinara-capability-villages-desk-workspace")
        .evaluate((node) => getComputedStyle(node, "::after").maskImage);
    const desktopMatte = await matte();
    assert(desktopMatte.includes("blob:"), "Foreground uses the preloaded matte");
    const cdp = await slow.context().newCDPSession(slow);
    await cdp.send("Network.clearBrowserCache");
    await cdp.send("Memory.simulatePressureNotification", { level: "critical" });
    await slow.getByRole("button", { name: "Projects", exact: true }).click();
    await slow.waitForFunction(() => document.querySelector("[data-desk]").dataset.desk === "projects");
    await settle(slow);
    assert.equal(await art(), desktopArt, "Inactive artwork survives HTTP cache eviction and memory pressure");
    assert.equal(await matte(), desktopMatte, "The foreground stays ready between menus");
    assert.equal(artRequests, 1, "Returning to the menu never re-downloads the foreground matte");
    await slow.setViewportSize({ width: 390, height: 844 });
    assert(
      (await art()).includes("blob:") && (await art()) === desktopArt,
      "The same background remains retained when the viewport changes",
    );
    await slow.setViewportSize({ width: 1440, height: 900 });
    await slow.locator("#root").evaluate((node) => (node.style.width = "480px"));
    await slow.waitForFunction(() => getComputedStyle(document.querySelector("nav button")).flexDirection === "column");
    assert.equal(
      await slow.getByRole("button", { name: "← Village", exact: true }).isVisible(),
      true,
      "A narrow Villages panel uses phone navigation even in a wide browser",
    );
    assert(
      await slow.locator("nav button").evaluateAll((buttons) =>
        buttons.every((button) => {
          const label = button.querySelector("span").getBoundingClientRect();
          const bounds = button.getBoundingClientRect();
          return label.left >= bounds.left && label.right <= bounds.right;
        }),
      ),
      "Every navigation label fits its own target",
    );
    await slow.close();

    const firstLoad = await makePage();
    let failFirstArt = true;
    await firstLoad.route("**/storybook-background-wide.webp", (route) =>
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

    const stalledFont = await makePage();
    await stalledFont.route("**/letter-fonts/lora.json", () => new Promise(() => {}));
    await people(stalledFont);
    assert.equal(
      await stalledFont.locator(".marinara-capability-villages-desk-document").evaluate((node) => node.inert),
      false,
      "Font timeout leaves a usable menu",
    );
    await stalledFont.close();

    const selection = await makePage();
    await people(selection);
    await selection.evaluate(() => (window.guardCalls = 0));
    await selection.getByRole("button", { name: "Resident", exact: true }).click();
    await selection.waitForFunction(() => window.guardCalls === 1);
    await selection.waitForTimeout(100);
    assert.equal(await selection.evaluate(() => window.guardCalls), 1, "Resident selection checks sprite drafts once");
    await selection.close();

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
