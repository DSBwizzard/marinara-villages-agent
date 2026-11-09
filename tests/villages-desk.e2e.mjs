import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";

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
    await page.setContent('<button id="outside">Engine control</button><div id="root" style="height:700px"></div>');
    await page.evaluate(() => {
      window.events = [];
      window.guardCalls = 0;
      window.rawGoHomeCalls = 0;
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (frames, options) {
        const duration = typeof options === "number" ? options : options.duration;
        window.events.push(
          duration === 0 ? "animate:0" : frames[0].transform.includes("calc") ? "animate:enter" : "animate:exit",
        );
        return animate.call(this, frames, options);
      };
    });
    await page.addScriptTag({ content: source });
    return page;
  }
  const settle = (page) => page.waitForFunction(() => document.querySelector("[data-desk]").dataset.phase === "open");
  async function people(page) {
    await page.getByRole("button", { name: "Open People", exact: true }).click();
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
    await normal.close();

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
