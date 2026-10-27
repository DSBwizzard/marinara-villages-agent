import { mockEngineLookups, fulfill } from "./browser-diagnostics.mjs";
import { foundingFixture } from "./founding-browser.fixture.mjs";
const foundingBundle = await foundingFixture();
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { PNG } from "pngjs";
import { chromium } from "./browser-diagnostics.mjs";
import { expect } from "./fast-browser-expect.mjs";
import { build } from "../../scripts/esbuild.mjs";
import { wantsCase, runCase } from "../../scripts/test-cases.mjs";

const art = new PNG({ width: 1536, height: 1024 });
art.data.fill(90);
const generatedArt = new PNG({ width: 1536, height: 1024 });
generatedArt.data.fill(110);
const mapImage = "data:image/png;base64," + PNG.sync.write(generatedArt).toString("base64");
const browser = await chromium.launch({
  headless: true,
});
const snapshot = {
  status: "ready",
  isFounded: false,
  village: { name: "Willowbrook", setting: "" },
  noticeboard: [],
  projects: [],
  venueRequests: [],
  residences: [],
  villagers: [],
  settings: {
    venues: [],
    foundingReason: "",
    foundingDetails: "",
    foundingGuidance: "",
    scenarioImprint: null,
    worldFacts: [],
    selectedLorebookIds: [],
    loreTokenBudget: 1600,
    maps: [],
    townMapExpectedWidth: 1536,
    townMapExpectedHeight: 1024,
    townMapGenerationWidth: 1536,
    townMapGenerationHeight: 1024,
    townMapView: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
    villageNameMaxLength: 80,
    foundingDetailsMaxLength: 2000,
    foundingGuidanceMaxLength: 500,
  },
};

const personas = [
  { id: "active", name: "Zara", summary: "A watchful traveler", isActive: true, avatarPath: null, avatarCrop: null },
  { id: "ada", name: "Ada", summary: "A patient observer", isActive: false, avatarPath: null, avatarCrop: null },
  { id: "bryn", name: "Bryn", summary: "A returning wanderer", isActive: false, avatarPath: null, avatarCrop: null },
];
const lorebooks = Array.from({ length: 60 }, (_, index) => ({
  id: `lore-${index + 1}`,
  name: `Lorebook ${index + 1}`,
  enabled: index !== 1,
  hiddenFromLibrary: index === 2,
}));
const personaPreview = {
  id: "ada",
  name: "Ada",
  description: "A patient observer of small changes.",
  appearance: "Wears a green traveling coat and carries a weathered leather satchel.",
  personality: "Reserved at first, attentive to people around her.",
  backstory: "Traveled through the northern passes before arriving here.",
  avatarPath: null,
  avatarCrop: null,
};

const characters = [
  { id: "finn", name: "Finn", summary: "Patient and practical" },
  { id: "rosa", name: "Rosa", summary: "Thoughtful and direct" },
  { id: "lee", name: "Lee, Keeper of the Observatory’s Long Forgotten Archives", summary: "Curious and resourceful" },
  ...Array.from({ length: 12 }, (_, index) => ({
    id: `extra-${index}`,
    name: `Other ${index}`,
    summary: "Another character card",
  })),
];
const imageRef = {
  id: "test-art",
  ref: "global-gallery:test-art",
  url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8AAAwAB/AGtLQAAAABJRU5ErkJggg==",
};

async function verifyFoundingReopening() {
  const bundle = await build({
    stdin: {
      loader: "tsx",
      resolveDir: process.cwd(),
      contents: `
import {createRoot} from 'react-dom/client';import {StrictMode} from 'react';
import {useOpenSetup} from './packages/villages/src/client/features/founding/actions.js';
const setters=new Map();window.values={};
const ports=new Proxy({}, {get(_target,key){if(!setters.has(key))setters.set(key,value=>{window.values[key]=value});return setters.get(key)}});
function Harness(){window.openSetup=useOpenSetup(ports);return <div>Ready</div>}
createRoot(document.getElementById('root')).render(window.strict?<StrictMode><Harness/></StrictMode>:<Harness/>);
`,
    },
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    jsx: "automatic",
  });
  for (const strict of [false, true]) {
    const context = await browser.newContext();
    await mockEngineLookups(context);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent('<div id="root"></div>');
    await page.evaluate((strict) => (window.strict = strict), strict);
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await expect.poll(() => page.evaluate(() => typeof window.openSetup)).toBe("function");
    for (const reason of ["rebuild", "pioneer", "prosper", "custom", "none"])
      for (const founded of [false, true])
        for (const details of ["Authored starting circumstances", "x".repeat(2000)]) {
          const village = structuredClone(snapshot);
          village.isFounded = founded;
          village.settings.foundingReason = reason;
          village.settings.foundingDetails = details;
          village.settings.foundingGuidance = " Authored narrative direction ";
          const values = await page.evaluate((village) => {
            window.openSetup(false, village);
            return window.values;
          }, village);
          assert.equal(
            values.setSetupName,
            founded ? "Willowbrook" : "",
            "Only founded names prefill; drafts restore independently",
          );
          assert.equal(values.setSetupWorldName, "", "World identity is optional and has no generated default");
          assert.equal(Object.hasOwn(values, "setSetupFoundingReason"), false);
          assert.equal(Object.hasOwn(values, "setSetupFoundingDetails"), false);
          assert.equal(village.settings.foundingDetails, details, "Opening setup preserves saved history");
          assert.equal(Object.hasOwn(values, "setSetupFoundingGuidance"), false);
          assert.equal(values.setScreen, "setup");
        }
    const fresh = await page.evaluate(() => {
      window.openSetup(true, null);
      return window.values;
    });
    assert.equal(fresh.setSetupName, "");
    assert.equal(Object.hasOwn(fresh, "setSetupFoundingReason"), false);
    assert.equal(Object.hasOwn(fresh, "setSetupFoundingGuidance"), false);
    assert.notEqual(fresh.setSetupFoundingDetails, "x".repeat(2000));
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log(
    "Actual Founding hook: current short/full-length drafts, founded reopening and fresh setup retain authored state (normal/StrictMode; isolated ports).",
  );
}
async function verifySavedZoneSelection() {
  const bundle = await build({
    stdin: {
      loader: "tsx",
      resolveDir: process.cwd(),
      contents: `
import {createRoot} from 'react-dom/client';import {useState} from 'react';
import {FoundingWorkspace} from './packages/villages/src/client/features/founding/villages-founding-workspace.tsx';
const zone=(id)=>({id,name:id,purpose:'Use '+id,description:'Appearance '+id,venueClass:'residence',ownerId:'player'});
const initial={id:'saved',name:'Saved residence',classes:['residence'],occupancy:{playerHome:true},presentation:{x:10,y:10,image:null},spaces:[zone('common-a'),zone('common-b')],privateSpaces:[zone('private-a'),zone('private-b')]};
function Harness(){const [venue,setVenue]=useState(initial),[state,setState]=useState({view:'details',sections:{saved:'zones'},zones:{saved:'common'}}),[issue,setIssue]=useState(null);
window.savedVenue=venue;return <><button onClick={()=>{const next={venueId:'saved',zoneId:'private-b',section:'zones',field:'zone-purpose',message:'Purpose needed'};setState({...state,zones:{saved:'private-b'}});setIssue(next)}}>Review second Private</button>
<FoundingWorkspace venues={[venue]} people={[]} selectedId='saved' placementId={null} state={state} map={<div>Map</div>} existing={true} mapReady={true} issues={[]} focusIssue={issue} imageTarget={null} imageBusy={false} suggestionsBusy={false} suggestionsChanged={false} onState={setState} onSelect={()=>{}} onContinue={()=>{}} onPatch={setVenue} onDraft={()=>{}} onGenerate={()=>{}} onUpload={()=>{}}/></>}
createRoot(document.getElementById('root')).render(<Harness/>);
`,
    },
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    jsx: "automatic",
  });
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await mockEngineLookups(context);
  const page = await context.newPage();
  await page.setContent('<div id="root"></div>');
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  const selector = page.getByLabel("Selected Zone", { exact: true });
  for (const id of ["common-a", "common-b", "private-a", "private-b"]) {
    await page
      .getByRole("tab", { name: id.startsWith("private") ? "Private Space" : "Common Space", exact: true })
      .click();
    await selector.selectOption(id);
    await expect(page.getByLabel("Zone Name", { exact: true })).toHaveCount(1);
    await expect(page.getByLabel("Zone Name", { exact: true })).toHaveValue(id);
    await page.getByLabel("Zone Name", { exact: true }).fill("Named " + id);
    await page.getByLabel("Zone Appearance", { exact: true }).fill("Described " + id);
    await page.getByLabel("Zone Used For", { exact: true }).fill("Edited " + id);
  }
  await page.getByRole("tab", { name: "Common Space", exact: true }).click();
  await selector.selectOption("common-a");
  await expect(selector).toHaveValue("common-a");
  await page.getByRole("tab", { name: "Private Space", exact: true }).click();
  await selector.selectOption("private-a");
  await expect(selector).toHaveValue("private-a");
  await page.getByRole("button", { name: "Review second Private" }).evaluate((button) => button.click());
  await expect(selector).toHaveValue("private-b");
  await expect(page.getByLabel("Zone Used For", { exact: true })).toBeFocused();
  const saved = await page.evaluate(() => window.savedVenue);
  assert.equal(saved.name, "Saved residence", "space header edits preserve Venue name");
  assert.deepEqual(
    [...saved.spaces, ...saved.privateSpaces].map((zone) => zone.name),
    ["Named common-a", "Named common-b", "Named private-a", "Named private-b"],
  );
  assert.deepEqual(
    [...saved.spaces, ...saved.privateSpaces].map((zone) => zone.description),
    ["Described common-a", "Described common-b", "Described private-a", "Described private-b"],
  );
  assert.deepEqual(
    [...saved.spaces, ...saved.privateSpaces].map((zone) => zone.purpose),
    ["Edited common-a", "Edited common-b", "Edited private-a", "Edited private-b"],
  );
  await page.getByRole("button", { name: "Remove Zone", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Exterior", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByLabel("Exterior Description", { exact: true })).toBeVisible();
  await context.close();
  console.log(
    "Existing-world inspector: multiple saved Common/Private IDs, independent edits and exact Review focus (isolated React fixture).",
  );
}
export async function verifyFoundingLayout(group) {
  try {
    if (group === "desktop") await runCase("founding/saved-zone-selection", verifySavedZoneSelection);
    for (const { width, height, fontSize, homeCount, chromeHeight = 44 } of [
      { width: 1366, height: 768, fontSize: 16, homeCount: 3 },
      { width: 1440, height: 650, fontSize: 16, homeCount: 1, chromeHeight: 200 },
      { width: 1917, height: 600, fontSize: 20, homeCount: 1 },
      { width: 1024, height: 768, fontSize: 20, homeCount: 2 },
      { width: 727, height: 768, fontSize: 16, homeCount: 1 },
      { width: 728, height: 768, fontSize: 16, homeCount: 1 },
      { width: 390, height: 844, fontSize: 16, homeCount: 2 },
      { width: 320, height: 568, fontSize: 16, homeCount: 1 },
      { width: 390, height: 650, fontSize: 20, homeCount: 3 },
    ]
      .filter((row) => !process.env.VILLAGES_VIEWPORT || row.width === Number(process.env.VILLAGES_VIEWPORT))
      .filter((row) =>
        group === "desktop"
          ? row.width >= 600
          : group === "phone"
            ? row.width < 600 && row.height >= 700
            : row.width < 600 && row.height < 700,
      )) {
      const caseName =
        width >= 600
          ? "founding/layout/desktop"
          : height < 700
            ? "founding/layout/compact-phone"
            : "founding/layout/phone";
      if (!wantsCase(caseName)) continue;
      await runCase(caseName, async () => {
        const context = await browser.newContext({
          viewport: { width, height },
          hasTouch: width < 600,
          isMobile: width < 600,
        });
        await mockEngineLookups(context);
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        let foundingPayload;
        let imageCalls = 0;
        let releaseImage;
        let releaseMap;
        let mapCalls = 0;
        let mapReceipt;
        let failMapStatus = false;
        let suggestionCalls = 0;
        let releaseSuggestion;
        let connections = { systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" };
        let holdConnectionSave = false;
        let heldConnectionSave = null;
        const spriteRevisions = {};
        await page.route("**/api/villages**", async (route) => {
          const path = new URL(route.request().url()).pathname;
          if (path.endsWith("/villagers/background/draft")) {
            const body = route.request().postDataJSON();
            return fulfill(route, {
              contentType: "application/json",
              body: JSON.stringify({
                text: JSON.stringify({
                  player: "I came to help restore the observatory.",
                  residents: Object.fromEntries(
                    body.foundingCharacterIds.map((id) => [
                      id,
                      (characters.find((person) => person.id === id)?.name ?? "The resident") +
                        " settled here to study the archives.",
                    ]),
                  ),
                }),
              }),
            });
          }
          if (/\/characters\/[^/]+\/sprites\/setup(?:\/(?:save|settled))?$/.test(path)) {
            const id = decodeURIComponent(path.match(/\/characters\/([^/]+)/)[1]);
            if (path.endsWith("/save")) {
              assert.equal(route.request().postDataJSON().revision, spriteRevisions[id] ?? 0);
              spriteRevisions[id] = (spriteRevisions[id] ?? 0) + 1;
            }
            return fulfill(route, {
              contentType: "application/json",
              body: JSON.stringify({
                revision: spriteRevisions[id] ?? 0,
                manager: { version: 1, artwork: [], expressions: [], assignments: [], framing: { mode: "full" } },
                files: [],
                assignments: [],
                suggestions: [],
                defaultArtworkId: "",
                useSprites: false,
                errors: {},
                analysisRequests: [],
                resident: false,
                residentToken: "",
              }),
            });
          }
          if (path.endsWith("/setup/venue-image/generate")) {
            imageCalls++;
            const imageBody = route.request().postDataJSON();
            assert.equal(imageBody.useAssignedVillagerContext, true, "assigned personality is automatic");
            assert.equal(imageBody.useVisualLore, true, "selected lore context is automatic");
            if (imageCalls === 1)
              return fulfill(route, {
                status: 503,
                contentType: "application/json",
                body: JSON.stringify({ error: "Optional image unavailable" }),
              });
            if (imageCalls === 2 || imageCalls === 4)
              await new Promise((resolve) => {
                releaseImage = resolve;
              });
            return fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(imageRef) });
          }
          if (path.endsWith("/setup/venue-image") && route.request().method() === "PUT")
            return fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(imageRef) });
          if (path.endsWith("/setup") && route.request().method() === "POST") {
            foundingPayload = route.request().postDataJSON();
            for (const id of foundingPayload.foundingCharacterIds ?? [])
              assert.equal(
                foundingPayload.foundingSpriteRevisions[id],
                spriteRevisions[id],
                "founding uses the exact reviewed sprite revision",
              );
          }
          if (path.endsWith("/connections") && route.request().method() === "PUT") {
            connections = { ...connections, ...route.request().postDataJSON() };
            if (holdConnectionSave) {
              heldConnectionSave = route;
              return;
            }
          }
          if (path.endsWith("/setup/venues/suggest")) {
            suggestionCalls++;
            const body = route.request().postDataJSON();
            if (width === 1366 && suggestionCalls === 2)
              await new Promise((resolve) => {
                releaseSuggestion = resolve;
              });
            return fulfill(route, {
              status: 200,
              contentType: "application/json",
              body: JSON.stringify(
                ((result) =>
                  body.actionId
                    ? { id: body.actionId, sourceKey: body.sourceKey, status: "complete", result, error: "" }
                    : result)({
                  venues: body.venues.map((row, index) => ({
                    id: row.id,
                    name:
                      index === 0
                        ? suggestionCalls === 1
                          ? "Your living space"
                          : "Renewed observatory quarters"
                        : row.venueClass === "community"
                          ? "Community Place"
                          : `${characters.find((person) => person.id === row.residentCharacterId)?.name}'s living space`,
                    form: "Indoor room",
                    description: "An entrance off the shared corridor.",
                    layout: row.venueClass === "community" ? "common" : "both",
                    connections:
                      row.venueClass === "community"
                        ? [["exterior", "common:base"]]
                        : [
                            ["exterior", "common:base"],
                            ["common:base", "private:base"],
                          ],
                    commonName: "Sitting area",
                    commonPurpose: "Sharing meals",
                    commonDescription: "A table beside a window.",
                    privateName: "Bedroom",
                    privatePurpose: "Personal resting space",
                    privateDescription: row.residentCharacterId ? "" : "A comfortable hammock.",
                  })),
                }),
              ),
            });
          }
          if (path.endsWith("/maps/generate")) {
            assert.equal(route.request().postDataJSON().sceneryStyleProfileId, "engine-paint");
            mapCalls++;
            const body = route.request().postDataJSON();
            assert.equal(Object.hasOwn(body, "options"), false, "map generation has no hidden element toggles");
            assert.equal(
              Object.hasOwn(JSON.parse(body.sourceKey), "options"),
              false,
              "toggle choices are absent from generation identity",
            );
            mapReceipt = {
              id: body.actionId,
              sourceKey: body.sourceKey,
              startedAt: new Date().toISOString(),
              status: "running",
              error: "",
              result: null,
            };
            releaseMap = () => {
              mapReceipt = {
                ...mapReceipt,
                status: mapCalls === 1 ? "failed" : "complete",
                error: mapCalls === 1 ? "The generated map is too large to store." : "",
                result: mapCalls === 1 ? null : { image: mapImage, width: 1536, height: 1024 },
              };
            };
            return fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(mapReceipt) });
          }
          if (path.includes("/maps/generation/founding-map/")) {
            if (failMapStatus)
              return fulfill(route, {
                status: 503,
                contentType: "application/json",
                body: JSON.stringify({ error: "Connection interrupted" }),
              });
            return fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(mapReceipt) });
          }
          if (path.endsWith("/image-style-profiles"))
            return fulfill(route, {
              status: 200,
              contentType: "application/json",
              body: JSON.stringify({
                defaultProfileId: "user-ink",
                profiles: [
                  { id: "user-ink", name: "My ink map" },
                  { id: "engine-paint", name: "Engine painting" },
                ],
              }),
            });
          const value = path.endsWith("/personas/ada")
            ? { persona: personaPreview }
            : path.endsWith("/personas")
              ? { personas }
              : path.endsWith("/connections")
                ? connections
                : path.endsWith("/lorebooks")
                  ? { books: lorebooks }
                  : path.endsWith("/catalog")
                    ? { characters }
                    : snapshot;
          await fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(value) });
        });
        await page.route("**/api/characters/summaries", (route) =>
          fulfill(route, { status: 200, contentType: "application/json", body: "[]" }),
        );
        await page.route("**/api/connections", (route) =>
          fulfill(route, {
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
              { id: "talk", name: "Language model", provider: "language", defaultForAgents: true },
              { id: "image", name: "Image model", provider: "image_generation", defaultForAgents: true },
            ]),
          }),
        );
        await page.route("http://villages.test/", (route) =>
          fulfill(route, {
            status: 200,
            contentType: "text/html",
            body: `<meta name="viewport" content="width=device-width,initial-scale=1"><style>:root{font-size:${fontSize}px;--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}html,body{margin:0;width:100%;height:100%;font-family:Arial,sans-serif}marinara-capability-villages{display:block;width:100%;height:100%}</style><header data-component="TopBar" style="height:${chromeHeight}px;overflow:hidden;display:flex;align-items:flex-start"><button data-topbar-more style="width:44px;height:44px" aria-label="Engine menu">☰</button></header><div style="height:calc(100% - ${chromeHeight}px)"><marinara-capability-villages></marinara-capability-villages></div>`,
          }),
        );
        await page.goto("http://villages.test/");
        if (width === 390 && height === 844) await page.clock.install();
        await page.addScriptTag({ content: foundingBundle });
        let root = page.locator(".villages-forging-v2");
        const forward = (name) => root.getByRole("button", { name, exact: true });
        const bounds = async () => {
          assert.ok(
            await root.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
            "no horizontal overflow",
          );
          const footer = root.locator(".villages-forging-footer");
          const box = await footer.boundingBox();
          assert.ok(
            box && (await footer.evaluate((element) => getComputedStyle(element).position)) === "static",
            `navigation stays in document flow: ${JSON.stringify({ box, height, root: await root.boundingBox() })}`,
          );
        };
        const capture = async (name) => {
          if (process.env.VILLAGES_SCREENSHOT_DIR) {
            await root.evaluate((element) => {
              element.scrollTop = 0;
            });
            await page.screenshot({
              path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `${name}-${width}x${height}-${fontSize}.png`),
            });
          }
        };
        await expect(root.locator('.villages-forging-steps [aria-current="step"]')).toHaveAttribute(
          "aria-label",
          "Place",
        );
        await expect(root.locator(".villages-forging-steps button")).toHaveCount(0);
        await expect(root.getByRole("heading", { name: "Forging the Village", exact: true })).toBeVisible();
        await expect(root.locator(".villages-founding-connections")).toBeVisible();
        await expect(root.getByText("Story direction", { exact: true })).toHaveCount(0);
        await expect(root.getByLabel("Narrative direction", { exact: true })).toHaveCount(0);
        await expect(root.getByText(/Step [1-4] of 4/)).toHaveCount(0);
        await expect(root.getByText("Starting circumstance examples")).toHaveCount(0);
        await expect(root.getByLabel("Starting Scenario", { exact: true })).toHaveCount(0);
        await expect(root.getByLabel("Village Name", { exact: true })).toHaveValue("");
        await expect(root.getByLabel("Village Name", { exact: true })).toHaveAttribute(
          "placeholder",
          "Crystalwood Heights",
        );
        await expect(root.getByRole("textbox", { name: "Place", exact: true })).toHaveAttribute(
          "placeholder",
          "An abandoned farm beside a forest in a present-day world without magic.",
        );
        assert.ok(
          (await root.getByLabel("Village world", { exact: true }).boundingBox()).y <
            (await root.getByRole("textbox", { name: "Place", exact: true }).boundingBox()).y,
          "Village world is above Place",
        );
        await forward("Continue to People").click();
        const nameField = root.getByLabel("Village Name", { exact: true });
        await expect(nameField).toBeFocused();
        await expect(nameField).toHaveAttribute("aria-invalid", "true");
        await expect(nameField.locator(".. ").getByRole("alert")).toHaveText("Give the village a name.");
        await expect(
          root.getByRole("textbox", { name: "Place", exact: true }).locator("..").getByRole("alert"),
        ).toHaveText("Describe the place.");
        await nameField.fill("Willowbrook");
        await page.evaluate(
          () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
        await expect(nameField).toBeFocused();
        await forward("Continue to People").click();
        await expect(root.getByRole("textbox", { name: "Place", exact: true })).toBeFocused();
        await expect(root.getByRole("button", { name: "Help: Village Name", exact: true })).toHaveCount(0);

        await expect(root.getByRole("note").filter({ hasText: "surrounding world" })).toHaveCount(0);
        await bounds();
        await capture("place-fields");
        for (const [label, text] of [
          ["Village Timezone", "Villages runs on real-time. Select the timezone you wish for Villages' clock to use."],
          [
            "Village world",
            "Optionally name the world where the Village is located. Use the same name for a character’s Homeworld if they come from this world. Matching names identify a shared world, without assuming acquaintance or shared private knowledge. Leave blank if unspecified; source cards and lore still apply.",
          ],
        ]) {
          const help = root.getByRole("button", { name: "Help: " + label, exact: true });
          const labelBox = await help.locator("..").locator("..").locator("label").boundingBox();
          const helpBox = await help.boundingBox();
          assert.ok(Math.abs(helpBox.x - labelBox.x - labelBox.width) < 8, label + " help follows its label");
          await help.click();
          await expect(help).toHaveAttribute("aria-expanded", "true");
          await expect(root.getByRole("note")).toHaveText(text);
          await bounds();
          await capture(label.toLowerCase().replaceAll(" ", "-") + "-help");
          await page.keyboard.press("Escape");
          await expect(help).toBeFocused();
          await expect(root.getByRole("note")).toHaveCount(0);
        }
        const loreCard = root.getByRole("region", { name: "Village Lorebooks", exact: true });
        await expect(loreCard.getByRole("heading", { name: "Village Lorebooks", exact: true })).toHaveCount(1);
        await expect(loreCard.locator("details, summary")).toHaveCount(0);
        const loreHelp = loreCard.getByRole("button", { name: "Help: Village Lorebooks", exact: true });
        const loreLabelBox = await loreCard.getByRole("heading").boundingBox();
        const loreHelpBox = await loreHelp.boundingBox();
        assert.ok(
          Math.abs(loreHelpBox.x - loreLabelBox.x - loreLabelBox.width) < 8,
          "Lorebook help follows its top-level title",
        );
        await loreHelp.click();
        await expect(loreCard.getByRole("note")).toHaveText(
          "Selected lorebooks enrich your Village with information for places, stories, village life and image generation.",
        );
        await page.keyboard.press("Escape");
        const loreBudget = root.getByLabel("Lorebook Token Budget", { exact: true });
        await expect(loreBudget).toHaveValue("1600");
        await expect(loreBudget).toHaveAttribute("autocomplete", "off");
        await expect(root.getByLabel("Village Name", { exact: true })).toHaveAttribute("autocomplete", "off");
        await expect(loreBudget).toHaveAttribute("type", "text");
        await expect(loreBudget).toHaveAttribute("inputmode", "numeric");
        await loreBudget.fill("800");
        await expect(loreBudget).toHaveValue("800");
        await loreBudget.fill("");
        await expect(loreBudget).toHaveValue("");
        await expect(loreBudget).toHaveAttribute("placeholder", "1600");
        const budgetHelp = root.getByRole("button", { name: "Help: Lorebook Token Budget", exact: true });
        await budgetHelp.click();
        await expect(root.getByRole("note")).toContainText(
          "Maximum tokens lorebooks can use in any lorebook-enabled prompt.",
        );
        await page.keyboard.press("Escape");
        const chooseLore = loreCard.getByRole("button", { name: "Choose Village Lorebooks", exact: true });
        await chooseLore.click();
        const loreDialog = root.getByRole("dialog", { name: "Choose Lorebooks", exact: true });
        const loreSearch = loreDialog.getByRole("searchbox", { name: "Search Lorebooks", exact: true });
        await expect(loreSearch).toBeFocused();
        await loreSearch.fill("Lorebook 60");
        await loreDialog.getByRole("checkbox", { name: "Lorebook 60", exact: true }).check();
        await loreDialog.getByRole("button", { name: "Close Choose Lorebooks", exact: true }).click();
        await expect(chooseLore).toBeFocused();
        await expect(loreCard.getByRole("button", { name: "Remove Lorebook 60", exact: true })).toHaveCount(0);
        await chooseLore.click();
        await loreSearch.fill("Lorebook 60");
        await expect(loreDialog.getByRole("checkbox", { name: "Lorebook 60", exact: true })).not.toBeChecked();
        await loreDialog.getByRole("checkbox", { name: "Lorebook 60", exact: true }).check();
        await capture("lorebook-picker");
        await loreDialog.getByRole("button", { name: "Done", exact: true }).click();
        const editLore = loreCard.getByRole("button", { name: "Choose Village Lorebooks", exact: true });
        await expect(editLore).toBeFocused();
        await expect(loreCard.getByText("Lorebook 60", { exact: true })).toBeVisible();
        await loreBudget.fill("0");
        await expect(loreBudget).not.toHaveAttribute("aria-invalid", "true");
        await expect(loreBudget.locator("..").getByRole("alert")).toHaveCount(0);
        await loreBudget.fill("");
        await expect(loreBudget).toHaveValue("");
        await expect(loreBudget).not.toHaveAttribute("aria-invalid", "true");
        if (process.env.VILLAGES_SCREENSHOT_DIR) {
          await loreCard.locator("..").screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `lorebook-card-${width}x${height}-${fontSize}.png`),
          });
        }
        await editLore.click();
        await expect(loreDialog.getByRole("checkbox", { name: "Lorebook 60", exact: true })).toHaveCount(0);
        await loreSearch.fill("Lorebook 60");
        await expect(loreDialog.getByRole("checkbox", { name: "Lorebook 60", exact: true })).toBeChecked();
        await loreDialog.getByRole("checkbox", { name: "Lorebook 60", exact: true }).uncheck();
        await loreSearch.press("Escape");
        await expect(editLore).toBeFocused();
        await expect(loreCard.getByText("Lorebook 60", { exact: true })).toBeVisible();
        await editLore.click();
        await loreSearch.fill("Lorebook 60");
        await expect(loreDialog.getByRole("checkbox", { name: "Lorebook 60", exact: true })).toBeChecked();
        await loreDialog.getByRole("checkbox", { name: "Lorebook 60", exact: true }).uncheck();
        await loreDialog.getByRole("button", { name: "Done", exact: true }).click();
        await expect(chooseLore).toBeFocused();
        await expect(loreCard.getByRole("button", { name: "Remove Lorebook 60", exact: true })).toHaveCount(0);
        await expect(chooseLore).toBeVisible();
        if (width === 1366) {
          await chooseLore.click();
          await expect(loreDialog.getByRole("checkbox", { name: /^Lorebook 2\b/u })).toBeDisabled();
          await expect(loreDialog.getByRole("checkbox", { name: "Lorebook 3", exact: true })).toHaveCount(0);
          for (let number = 4; number <= 27; number++) {
            await loreDialog.getByRole("checkbox", { name: "Lorebook " + number, exact: true }).check();
          }
          await expect(loreDialog.getByText("24 / 24", { exact: true })).toBeVisible();
          await expect(loreDialog.getByRole("checkbox", { name: "Lorebook 28", exact: true })).toBeDisabled();
          await loreDialog.getByRole("checkbox", { name: "Lorebook 4", exact: true }).uncheck();
          await expect(loreDialog.getByRole("checkbox", { name: "Lorebook 28", exact: true })).toBeEnabled();
          await loreDialog.getByRole("button", { name: "Done", exact: true }).click();
          while (await loreCard.getByRole("button", { name: /^Remove / }).count()) {
            await loreCard
              .getByRole("button", { name: /^Remove / })
              .first()
              .click();
          }
        }
        assert.equal(imageCalls, 0, "Lorebook selection does not generate images");
        await bounds();
        await root
          .getByRole("textbox", { name: "Place", exact: true })
          .fill("An abandoned farm with a habitable farmhouse and one shared barn.");
        await expect(root.getByRole("group", { name: "Map source", exact: true })).toHaveCount(0);
        await capture("place");
        if (width === 390 && height === 844) {
          const connectionCard = root.locator(".villages-founding-connections");
          await expect(connectionCard.getByText("Connections · Ready")).toBeVisible();
          await connectionCard.getByText("Connections · Ready").click();
          const system = connectionCard.getByLabel("System", { exact: true });
          holdConnectionSave = true;
          await system.selectOption("");
          await expect.poll(() => heldConnectionSave !== null).toBe(true);
          await forward("Continue to People").click();
          await expect(root).toHaveAttribute("data-step", "0");
          await expect(connectionCard.getByRole("alert")).toContainText("Connections are still loading");
          holdConnectionSave = false;
          await fulfill(heldConnectionSave, { status: 503, json: { error: "Save failed" } });
          await expect(system).toBeDisabled();
          await forward("Continue to People").click();
          await expect(root).toHaveAttribute("data-step", "0");
          await connectionCard.getByRole("button", { name: "Retry", exact: true }).click();
          await expect(system).toBeEnabled();
          await system.selectOption("talk");
          await expect(connectionCard.getByText("Connections · Ready")).toBeVisible();
        }
        await forward("Continue to People").click();
        await expect(root).toHaveAttribute("data-step", "1");
        await expect(root.getByRole("heading", { name: "You", exact: true })).toBeVisible();
        await root.getByRole("button", { name: /Zara.*Change/ }).click();
        const personaDialog = page.getByRole("dialog", { name: "Choose Persona", exact: true });
        await personaDialog.getByPlaceholder("Search Personas").fill("patient");
        await personaDialog.getByRole("button").filter({ hasText: "Ada" }).click();
        await expect(root.getByText("View Persona details", { exact: true })).toHaveCount(0);
        await expect(root.getByRole("textbox", { name: "Role Title", exact: true })).toHaveCount(0);
        await root.getByRole("button", { name: "Help: Your backstory", exact: true }).click();
        await expect(root.getByRole("note")).toContainText(
          "In Villages, you (the player) coordinate with Villagers on major changes, improvements, and developments.",
        );
        await root.getByRole("button", { name: "Close Your backstory help", exact: true }).click();
        const selectResidents = async (names) => {
          for (const name of names) {
            await root.getByRole("button", { name: "+ Add villager", exact: true }).click();
            const picker = page.getByRole("dialog", { name: "Choose founding villagers", exact: true });
            await expect(picker.getByRole("heading")).toHaveCount(0);
            const search = picker.getByRole("searchbox");
            await expect(search).toHaveAttribute("placeholder", "Search character cards...");
            const close = await picker
              .getByRole("button", { name: "Close Choose founding villagers", exact: true })
              .boundingBox();
            const searchBox = await search.boundingBox();
            assert.ok(
              Math.abs(close.y + close.height / 2 - searchBox.y - searchBox.height / 2) < 2,
              "search and compact close share a row",
            );
            const add = picker.getByRole("button", { name: name + " · Add", exact: true });
            const addBox = await add.boundingBox();
            assert.equal(addBox.width, addBox.height, "Add control is square");
            await add.click();
            const sprites = page.getByRole("dialog", { name: name + " sprite setup", exact: true });
            await expect(sprites.getByRole("button", { name: "Add without sprites", exact: true })).toBeVisible();
            const spriteBox = await sprites.boundingBox();
            assert.ok(
              Math.abs(spriteBox.x + spriteBox.width / 2 - width / 2) < 2,
              "sprite window centers horizontally",
            );
            assert.ok(
              Math.abs(spriteBox.y + spriteBox.height / 2 - height / 2) < 2,
              "sprite window centers vertically",
            );
            await page
              .getByRole("dialog", { name: name + " sprite setup" })
              .getByRole("button", { name: "Add without sprites", exact: true })
              .click();
          }
        };
        await selectResidents(
          ["Finn", "Rosa", "Lee, Keeper of the Observatory’s Long Forgotten Archives"].slice(0, homeCount),
        );
        await expect(page.getByRole("dialog", { name: "Finn’s life here", exact: true })).toHaveCount(0);
        await expect(root.getByText(/of 3 selected/)).toHaveCount(0);
        await expect(root.getByRole("button", { name: "+ Add villager", exact: true })).toHaveCount(
          homeCount < 3 ? 1 : 0,
        );
        await expect(root.locator(".villages-founding-connections")).toBeHidden();
        const cast = root.locator(".villages-people-columns>section").first();
        const backstories = root.getByRole("region", { name: "Starting notes", exact: true });
        await expect(cast.getByLabel("Character origins", { exact: true })).toHaveCount(0);
        const castBox = await cast.boundingBox(),
          storyBox = await backstories.boundingBox();
        assert.ok(
          width > 1000 ? storyBox.x >= castBox.x + castBox.width : storyBox.y >= castBox.y + castBox.height,
          "backstories sit beside the cast on desktop and below it on phone",
        );

        const past = root.getByLabel("Finn starting note", { exact: true });
        await expect(past).toHaveCount(0);
        await root.getByLabel("Finn homeworld", { exact: true }).fill("Othiras");
        await forward("Continue to Map").click();
        await expect(root).toHaveAttribute("data-step", "2");
        await forward("Back").click();
        await expect(root).toHaveAttribute("data-step", "1");
        await backstories.getByRole("button", { name: "+ Add starting note", exact: true }).first().click();
        await expect(past).toHaveValue("");
        await past.fill("Finn has always been guardian of a relic in the observatory.");
        await root.getByLabel("Your backstory", { exact: true }).fill("I came to help restore the observatory.");
        await bounds();
        await capture("people-backgrounds");
        await forward("Save & exit").click();
        await page.reload();
        await page.addScriptTag({ content: foundingBundle });
        await root.getByRole("button", { name: "Resume founding", exact: true }).click();
        await expect(past).toHaveValue("Finn has always been guardian of a relic in the observatory.");
        assert.equal(suggestionCalls, 0);
        assert.equal(imageCalls, 0);
        await bounds();
        await capture("people");
        await forward("Continue to Map").click();
        await expect(root).toHaveAttribute("data-step", "2");
        assert.deepEqual(
          await root
            .getByRole("list", { name: "Founding phases" })
            .locator("li")
            .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("aria-label"))),
          ["Place", "People", "Map", "Venues", "Review"],
        );
        await expect(root.getByLabel("Village Name", { exact: true })).toHaveCount(0);
        const mapDialog = root.getByRole("region", { name: "Map artwork", exact: true });
        await expect(mapDialog).toBeVisible();
        const stylePicker = mapDialog.getByLabel("Scenery style preset", { exact: true });
        await expect(stylePicker).toHaveValue("");
        await expect(stylePicker.getByRole("option", { name: "Engine default (My ink map)", exact: true })).toHaveCount(
          1,
        );
        await stylePicker.selectOption("engine-paint");
        await expect(stylePicker).toHaveValue("engine-paint");
        await expect(mapDialog.getByRole("button", { name: "Help: Map", exact: true })).toHaveCount(0);
        for (const label of ["Map Details"]) {
          const mapHelp = mapDialog.getByRole("button", { name: "Help: " + label, exact: true });
          const panelHeight = (await mapDialog.boundingBox()).height;
          await mapHelp.click();
          await expect(mapHelp).toHaveAttribute("aria-expanded", "true");
          const note = mapDialog.getByRole("note");
          await expect(note).toBeVisible();
          assert.equal(
            (await mapDialog.boundingBox()).height,
            panelHeight,
            label + " help floats without expanding Map",
          );
          await bounds();
          await capture("map-details-help");
          await note.click();
          await expect(mapHelp).toHaveAttribute("aria-expanded", "true");
          await page.keyboard.press("Escape");
          await expect(mapHelp).toBeFocused();
          await expect(mapHelp).toHaveAttribute("aria-expanded", "false");
          await mapHelp.click();
          await mapDialog.getByRole("button", { name: "Close Map Details help", exact: true }).click();
          await expect(mapHelp).toHaveAttribute("aria-expanded", "false");
        }
        await expect(mapDialog.getByRole("button", { name: "Simple map", exact: true })).toHaveCount(0);
        await expect(mapDialog.getByRole("group", { name: "Map source", exact: true }).getByRole("button")).toHaveCount(
          2,
        );
        await expect(mapDialog.getByRole("button", { name: "Generate artwork", exact: true })).toHaveAttribute(
          "aria-pressed",
          "true",
        );
        await forward("Continue to Venues").click();
        await expect(root).toHaveAttribute("data-step", "2");
        await expect(root.getByRole("alert").filter({ hasText: "Generate or upload map artwork" })).toBeVisible();
        assert.equal(mapCalls, 0, "missing artwork does not start generation");
        const assertMapFooter = async () => {
          await expect(forward("Continue to Venues")).toBeVisible();
          assert.ok(
            await mapDialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
            "Map page has no horizontal overflow",
          );
        };
        await assertMapFooter();
        await bounds();
        await capture("map-dialog");
        await mapDialog.getByRole("button", { name: "Generate artwork", exact: true }).click();
        await expect(mapDialog.getByText("Based on your Setting description.", { exact: true })).toHaveCount(0);
        const mapDetails = mapDialog.getByLabel("Map Details", { exact: true });
        await expect(mapDetails).toHaveValue("");
        const mapHints = [
          "An inn beside the river, with homes around a central square.",
          "Bedrooms along an indoor corridor, with a shared kitchen at one end.",
          "Leave out cars and parking lots; connect the shops with covered paths.",
          "Show only the station interior; leave out planets, stars, and exterior views.",
        ];
        assert.ok(mapHints.includes(await mapDetails.getAttribute("placeholder")));
        if (width === 390 && height === 844) {
          await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
          const firstHint = await mapDetails.getAttribute("placeholder");
          const seen = new Set([firstHint]);
          for (let tick = 1; tick <= 4; tick++) {
            await page.clock.fastForward(4000);
            const hint = await mapDetails.getAttribute("placeholder");
            if (tick < 4) {
              assert.ok(mapHints.includes(hint) && !seen.has(hint));
              seen.add(hint);
            } else assert.equal(hint, firstHint, "Map details cycle back after four hints");
          }
          await expect(mapDetails).toHaveValue("");
          await mapDetails.fill("Keep this map detail intact.");
          const hint = await mapDetails.getAttribute("placeholder");
          await page.clock.fastForward(8000);
          await expect(mapDetails).toHaveValue("Keep this map detail intact.");
          assert.equal(await mapDetails.getAttribute("placeholder"), hint, "Authored Map details stop hint rotation");
          assert.equal(mapCalls, 0, "Hint rotation makes no generation requests");
          await mapDetails.fill("");
          await page.clock.resume();
        }
        await mapDialog.getByRole("button", { name: "Help: Map Details", exact: true }).click();
        await expect(mapDialog.getByRole("note")).toHaveText(
          "Describe what you want shown, arranged, or left out of the artwork.",
        );
        await mapDialog.getByRole("button", { name: "Close Map Details help", exact: true }).click();
        await expect(mapDialog.getByRole("note")).toHaveCount(0);
        await capture("map-details");
        const customStyle = mapDialog.getByLabel("Scenery Style Description", { exact: true });
        await expect(customStyle).toHaveCount(0);
        await stylePicker.selectOption("@custom");
        await expect(customStyle).toBeVisible();
        await expect(customStyle.locator("xpath=ancestor::details")).toHaveCount(0);
        assert.ok(
          await customStyle.evaluate((node) =>
            Boolean(
              node.compareDocumentPosition(node.parentElement.nextElementSibling) & Node.DOCUMENT_POSITION_FOLLOWING,
            ),
          ),
          "Custom style appears above More options",
        );
        await capture("map-custom-style");
        await customStyle.fill("Soft watercolor washes.");
        await mapDialog.getByText("More options", { exact: true }).click();
        await mapDialog.getByText("More options", { exact: true }).click();
        await expect(customStyle).toBeVisible();
        await expect(customStyle).toHaveValue("Soft watercolor washes.");
        await stylePicker.selectOption("engine-paint");
        await expect(customStyle).toHaveCount(0);
        assert.equal(mapCalls, 0, "Changing custom style visibility makes no generation requests");
        await mapDialog.getByText("More options", { exact: true }).click();
        await expect(mapDialog.getByText("Things to Avoid", { exact: true })).toBeVisible();
        for (const name of ["Roads and paths", "Structures", "Water"]) {
          await expect(mapDialog.getByLabel(name, { exact: true })).toHaveCount(0);
        }
        // Inline Map controls must hand scrolling to the same root as People and Place.
        await root.evaluate((node) => {
          node.scrollTop = 0;
        });
        const mapContext = mapDialog.locator(".villages-founding-field-heading");
        const contextBox = await mapContext.boundingBox();
        assert.ok(contextBox);
        const scrollX = contextBox.x + contextBox.width / 2;
        const scrollY = contextBox.y + contextBox.height / 2;
        await page.mouse.move(scrollX, scrollY);
        await page.mouse.wheel(0, 260);
        await expect.poll(() => root.evaluate((node) => node.scrollTop)).toBeGreaterThan(40);
        if (width < 600) {
          await root.evaluate((node) => {
            node.scrollTop = 0;
          });
          const touch = await context.newCDPSession(page);
          await touch.send("Input.dispatchTouchEvent", {
            type: "touchStart",
            touchPoints: [{ x: scrollX, y: scrollY }],
          });
          for (let step = 1; step <= 6; step++) {
            await touch.send("Input.dispatchTouchEvent", {
              type: "touchMove",
              touchPoints: [{ x: scrollX, y: scrollY - step * 24 }],
            });
            await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
          }
          await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
          await expect.poll(() => root.evaluate((node) => node.scrollTop)).toBeGreaterThan(40);
          await touch.detach();
        }
        await capture("map-page-scroll");
        await assertMapFooter();
        await mapDialog.getByRole("button", { name: "Upload image", exact: true }).click();
        await expect(mapDialog.getByLabel("Upload map image", { exact: true })).toBeVisible();
        await assertMapFooter();
        assert.equal(mapCalls, 0, "browsing map choices never generates artwork");
        await mapDialog.getByRole("button", { name: "Generate artwork", exact: true }).click();
        await mapDialog.getByLabel("Map Details", { exact: true }).fill("Keep this authored map detail.");
        await forward("Save & exit").click();
        await expect(root.getByText(/Resume: Map/)).toBeVisible();
        if (width === 1366) {
          await page.evaluate(async () => {
            const db = await new Promise((resolve) => {
              const open = indexedDB.open("villages-drafts-v4", 1);
              open.onsuccess = () => resolve(open.result);
            });
            await new Promise((resolve, reject) => {
              const tx = db.transaction("drafts", "readwrite");
              const cursor = tx.objectStore("drafts").openCursor();
              cursor.onsuccess = () => {
                const row = cursor.result;
                if (!row) return;
                const saved = row.value;
                delete saved.data.phase;
                delete saved.data.descriptionVersion;
                saved.data.circumstances = "We chose to live among the ruins.";
                saved.data.step = 2;
                saved.data.mapSource = "none";
                row.update({ ...saved, revision: saved.revision + 1 });
                row.continue();
              };
              tx.oncomplete = resolve;
              tx.onerror = () => reject(tx.error);
            });
            db.close();
          });
        }
        await page.reload();
        await page.addScriptTag({ content: foundingBundle });
        await expect(root.getByText(/Resume: Map/)).toBeVisible();
        await root.getByRole("button", { name: "Resume founding", exact: true }).click();
        await expect(root).toHaveAttribute("data-step", "2");
        await expect(mapDialog.getByLabel("Map Details", { exact: true })).toHaveValue(
          "Keep this authored map detail.",
        );
        await mapDialog.getByRole("button", { name: "Upload image", exact: true }).click();
        await mapDialog
          .getByLabel("Upload map image", { exact: true })
          .setInputFiles({ name: "starting-map.png", mimeType: "image/png", buffer: PNG.sync.write(art) });
        await expect(mapDialog.getByRole("img", { name: "Selected village map", exact: true })).toBeVisible();
        await expect(
          mapDialog.getByText("Use a landscape image. Recommended size is 2560 x 1440px (16:9).", {
            exact: true,
          }),
        ).toBeVisible();
        const selectedMap = mapDialog.getByRole("img", { name: "Selected village map", exact: true });
        const acceptedSrc = await selectedMap.getAttribute("src");
        for (const [width, height, problem] of [
          [300, 2056, "higher-resolution"],
          [1024, 2048, "Choose a wider image"],
        ]) {
          await mapDialog.getByLabel("Upload map image", { exact: true }).setInputFiles({
            name: "invalid-map.png",
            mimeType: "image/png",
            buffer: PNG.sync.write(new PNG({ width, height })),
          });
          await expect(mapDialog.getByRole("alert").filter({ hasText: problem })).toBeVisible();
          await expect(selectedMap).toHaveAttribute("src", acceptedSrc);
          assert.equal(mapCalls, 0, "Rejected uploads make no generation requests");
        }
        const generateChoice = mapDialog.getByRole("button", { name: "Generate artwork", exact: true });
        await expect(generateChoice).toContainText("Generate a map from the information provided so far");
        await generateChoice.click();
        await expect(mapDialog.getByRole("alert").filter({ hasText: "Choose a wider image" })).toHaveCount(0);
        await mapDialog.getByRole("button", { name: "Upload image", exact: true }).click();
        await expect(mapDialog.getByRole("alert").filter({ hasText: "Choose a wider image" })).toHaveCount(0);
        await expect(selectedMap).toHaveAttribute("src", acceptedSrc);
        await expect(mapDialog.getByText(/\d+ × \d+ pixels/)).toHaveCount(0);
        assert.equal(mapCalls, 0, "Changing source after an upload error does not generate artwork");
        await mapDialog
          .getByLabel("Upload map image", { exact: true })
          .setInputFiles({ name: "starting-map.png", mimeType: "image/png", buffer: PNG.sync.write(art) });
        await expect(mapDialog.getByRole("alert").filter({ hasText: "Choose a wider image" })).toHaveCount(0);
        await bounds();
        await capture("map-page");
        await forward("Back").click();
        await expect(past).toHaveValue("Finn has always been guardian of a relic in the observatory.");
        await forward("Back").click();
        await expect(root.getByLabel("Village Name", { exact: true })).toHaveValue("Willowbrook");
        await forward("Continue to People").click();
        await forward("Continue to Map").click();
        await forward("Continue to Venues").click();
        await expect(root).toHaveAttribute("data-step", "3");
        await root.getByRole("button", { name: "Advanced", exact: true }).click();
        const phaseHeading = root.locator(".villages-forging-heading");
        await expect(phaseHeading).toBeVisible();
        assert.equal(await phaseHeading.evaluate((element) => getComputedStyle(element).position), "static");
        await expect(root.getByRole("button", { name: "Arrange automatically", exact: true })).toHaveCount(0);

        const inspector = root.locator(".villages-workspace-inspector");
        const placementMap = root.locator(".marinara-capability-villages-setup-map-viewport");
        const canvas = placementMap.locator(".marinara-capability-villages-canvas");
        const pins = canvas.locator("button[data-pin-id]");
        const mapView = async () => {
          const back = inspector.getByRole("button", { name: "Done", exact: true });
          if (await back.isVisible()) await back.click();
          await canvas.scrollIntoViewIfNeeded();
        };
        const open = async (index = 0) => {
          await mapView();
          await pins.nth(index).click();
        };
        const zone = async (name) => {
          await inspector
            .getByRole("tab", { name: name === "Exterior" ? "Exterior" : name + " Space", exact: true })
            .click();
          await expect(inspector.getByRole("tabpanel")).toHaveCount(1);
          await expect(inspector.getByRole("button", { name: "Done", exact: true })).toBeInViewport();
          const sheetBox = await inspector.boundingBox();
          assert.ok(
            sheetBox.x >= 0 &&
              sheetBox.y >= 0 &&
              sheetBox.x + sheetBox.width <= width + 1 &&
              sheetBox.y + sheetBox.height <= height + 1,
            "sheet fits viewport",
          );
        };
        await expect(root.locator(".villages-workspace-tray")).toBeVisible();
        await expect(root.locator("[data-venue-id]")).toHaveCount(homeCount + 2);
        await expect(forward("Review village")).toBeDisabled();
        await root.locator("[data-venue-id]").first().click();
        await expect(inspector.getByLabel("Venue Name", { exact: true })).toBeVisible();
        await expect(inspector.getByLabel("Exterior Description", { exact: true })).toBeVisible();
        await expect(root.getByRole("dialog", { name: "Venue editor", exact: true })).toHaveCount(1);
        const initialActions = await inspector.locator(".villages-workspace-image-actions > button").all();
        assert.equal(initialActions.length, 3);
        const initialBoxes = await Promise.all(initialActions.map((button) => button.boundingBox()));
        assert.ok(
          initialBoxes.every((box) => Math.abs(box.y - initialBoxes[0].y) < 1),
          "three image actions stay side by side at every viewport",
        );
        if (width === 390 && height === 844) {
          const pickerReady = page.waitForEvent("filechooser");
          await inspector.getByRole("button", { name: "Upload image", exact: true }).click();
          const picker = await pickerReady;
          await picker.setFiles({ name: "venue.png", mimeType: "image/png", buffer: PNG.sync.write(art) });
          const thumbnail = inspector.getByRole("button", { name: "View image", exact: true });
          await expect(thumbnail).toBeVisible();
          await thumbnail.click();
          const phoneViewer = root.getByRole("dialog", { name: "Venue image viewer" });
          await expect(phoneViewer).toBeVisible();
          await page.mouse.click(0, 0);
          await expect(phoneViewer).not.toBeVisible();
          await expect(inspector).toBeVisible();
          await expect(thumbnail).toBeFocused();
          const cancelReady = page.waitForEvent("filechooser");
          await inspector.getByRole("button", { name: "Upload image", exact: true }).click();
          const cancelPicker = await cancelReady;
          await cancelPicker.setFiles([]);
          await inspector
            .getByLabel("Upload exterior image", { exact: true })
            .evaluate((input) => input.dispatchEvent(new Event("cancel", { bubbles: true })));
          await expect(inspector).toBeVisible();
          await expect(inspector.getByRole("button", { name: "Upload image", exact: true })).toBeFocused();
          await capture("venue-image-preview");
        }
        await inspector.getByRole("button", { name: "Done", exact: true }).click();
        await expect(root.locator("[data-venue-id]").first()).toBeFocused();
        await mapView();
        assert.equal(imageCalls, 0, "editing an unplaced Venue starts no image generation");
        await expect(root.locator(".villages-workspace-overview")).toHaveCSS("border-color", "rgb(67, 84, 125)");
        await expect(root).toHaveCSS("background-color", "rgb(18, 25, 54)");
        await capture("venue-placement");
        await forward("Suggest names & descriptions").click();
        await expect(forward("Suggest names & descriptions")).toBeEnabled();
        assert.equal(suggestionCalls, 1);
        await expect(root.locator("[data-venue-id]")).toHaveCount(homeCount + 2);
        await expect(forward("Review village")).toBeDisabled();
        const spots = Array.from({ length: homeCount + 2 }, (_, i) => ({
          x: homeCount === 3 ? 0.22 + (i % 3) * 0.28 : 0.22 + (i % 2) * 0.56,
          y: i < (homeCount === 3 ? 3 : 2) ? 0.28 : 0.72,
        }));
        for (const [index, spot] of spots.entries()) {
          await canvas.scrollIntoViewIfNeeded();
          const box = await canvas.boundingBox();
          await page.mouse.click(box.x + spot.x * box.width, box.y + spot.y * box.height);
          await expect(pins).toHaveCount(index + 1);
        }
        await expect(pins).toHaveCount(homeCount + 2);
        await expect(root.locator(".villages-workspace-summary")).toContainText("Ready for review");

        // A complete suggested draft proceeds without visiting each editor or making image requests.
        await forward("Review village").click();
        await expect(root).toHaveAttribute("data-step", "4");
        assert.equal(imageCalls, 0);
        await forward("Change starting Venues").click();
        await open();
        const narrow = (await root.locator(".villages-workspace").getAttribute("data-narrow")) === "true";
        assert.equal(narrow, (await root.locator(".villages-workspace").boundingBox()).width < 704);
        await expect(root.getByRole("dialog", { name: "Venue editor" })).toBeVisible();
        if (width === 1366) {
          // Resume a legacy modal checkpoint using current authored fields and retained prohibited Zone data.
          await inspector.getByLabel("Venue Name", { exact: true }).fill("Legacy current edit");
          await mapView();
          await forward("Save & exit").click();
          await page.evaluate(async () => {
            const db = await new Promise((resolve) => {
              const request = indexedDB.open("villages-drafts-v4", 1);
              request.onsuccess = () => resolve(request.result);
            });
            await new Promise((resolve) => {
              const tx = db.transaction("drafts", "readwrite"),
                store = tx.objectStore("drafts");
              const keys = store.getAllKeys();
              keys.onsuccess = () => {
                const get = store.get(keys.result[0]);
                get.onsuccess = () => {
                  const saved = get.result;
                  for (const venue of saved.data.venues)
                    venue.imageContext = { useAssignedVillagerContext: false, useVisualLore: false };
                  saved.data.interruptedGeneration = true;
                  delete saved.data.workspace;
                  saved.data.editorOpen = true;
                  saved.data.editorOriginal = { ...saved.data.venues[0], name: "Old cancel copy" };
                  const park = saved.data.venues.find((venue) => venue.category === "public-center");
                  park.layout = "both";
                  park.privateSpaces = [
                    {
                      ...saved.data.venues[0].privateSpaces[0],
                      id: "old:private",
                      name: "Legacy private draft",
                      purpose: "Stored old purpose",
                      description: "Kept old description",
                    },
                  ];
                  store.put({ ...saved, revision: saved.revision + 1 }, keys.result[0]);
                };
              };
              tx.oncomplete = resolve;
            });
            db.close();
          });
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await root.getByRole("button", { name: "Resume photograph placement", exact: true }).click();
          await expect(root.getByText(/generation request was interrupted and may have been billed/)).toHaveCount(0);
          await expect(inspector.getByLabel("Venue Name", { exact: true })).toHaveValue("Legacy current edit");
          await open(homeCount + 1);
          await zone("Private");
          await expect(inspector.getByText(/previous draft and images are kept/)).toBeVisible();
          await open();
          await zone("Exterior");
        }
        await expect(inspector.getByRole("heading", { name: "Before Review", exact: true })).toHaveCount(0);
        await expect(inspector.getByRole("region", { name: "Details needed before Review", exact: true })).toHaveCount(
          0,
        );
        await inspector.getByLabel("Venue Name", { exact: true }).fill("Autosaved name");
        await expect(root.locator(".villages-forging-saved")).toContainText("Saved");
        if (narrow) {
          const returnButton = inspector.getByRole("button", { name: "Done", exact: true });
          await returnButton.focus();
          await page.keyboard.press("Tab");
          assert.ok(await inspector.evaluate((el) => el.contains(document.activeElement)), "Tab stays in the sheet");
          await page.keyboard.press("Shift+Tab");
          assert.equal(await inspector.getAttribute("aria-modal"), "true");
          await returnButton.focus();
          await page.keyboard.press("Escape");
          await expect(pins.first()).toBeFocused();
          await open();
          await expect(inspector.getByLabel("Venue Name", { exact: true })).toHaveValue("Autosaved name");
        }
        await inspector.getByLabel("Venue Name", { exact: true }).fill("My observatory quarters");
        await inspector.getByLabel("Physical Form", { exact: true }).fill("Converted observatory room");
        await expect(inspector.getByLabel("Venue Type", { exact: true })).toHaveCount(0);
        await expect(inspector.getByLabel("Assigned villager", { exact: true })).toHaveCount(0);
        await zone("Exterior");
        await inspector
          .getByLabel("Exterior Description", { exact: true })
          .fill("A blue door beside the telescope corridor.");
        await expect(inspector.getByLabel("Zone Used For", { exact: true })).toHaveCount(0);
        await expect(inspector.locator(".villages-workspace-photo")).toHaveCount(0);
        const formBox = await inspector.getByLabel("Physical Form", { exact: true }).boundingBox();
        const tabsBox = await inspector.getByRole("tablist").boundingBox();
        assert.ok(formBox.y + formBox.height <= tabsBox.y, "Venue identity precedes zone tabs");
        await expect(inspector.getByLabel("Venue Name", { exact: true })).toHaveValue("My observatory quarters");
        await expect(inspector.getByRole("button", { name: "Close Venue editor" })).toHaveCount(0);
        await expect(inspector.getByRole("button", { name: "Edit Venue name" })).toHaveCount(0);
        await expect(inspector.getByRole("button", { name: "Edit Physical form" })).toHaveCount(0);
        await expect(inspector.locator("header").getByRole("textbox")).toHaveCount(2);
        assert.deepEqual(
          await inspector
            .locator("header textarea")
            .evaluateAll((fields) => fields.map((field) => field.getAttribute("aria-label"))),
          ["Venue Name", "Physical Form"],
        );
        await expect(inspector.getByLabel("Exterior Description", { exact: true })).toHaveAttribute(
          "placeholder",
          "Zone Appearance",
        );
        await expect(inspector.getByLabel("Venue Name", { exact: true })).toHaveAttribute("placeholder", "Venue Name");
        await expect(inspector.getByLabel("Physical Form", { exact: true })).toHaveAttribute(
          "placeholder",
          "Venue Form",
        );
        await expect(inspector.locator("header label")).toHaveCount(2);
        const entranceHelp = inspector.getByRole("button", { name: "Help: Exterior and Approach", exact: true });
        await entranceHelp.click();
        await expect(inspector.getByRole("note")).toHaveText(
          "Describe the entrance, approach and visible exterior of this Venue.",
        );
        await page.keyboard.press("Escape");
        const formHelp = inspector.getByRole("button", { name: "Help: Form", exact: true });
        const formLabel = await formHelp.locator("..").locator("..").locator("label").boundingBox();
        const formButton = await formHelp.boundingBox();
        assert.ok(Math.abs(formButton.x - formLabel.x - formLabel.width) < 8, "Form help follows its label");
        const beforeHelp = await inspector.getByLabel("Physical Form", { exact: true }).boundingBox();
        await expect(formHelp).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await expect(formHelp).toHaveCSS("border-top-width", "0px");
        await expect(formHelp.locator("span")).toHaveCSS("border-radius", "50%");
        await expect(inspector.getByText("Changes saved", { exact: true })).toHaveCount(0);
        const doneBox = await inspector.getByRole("button", { name: "Done", exact: true }).boundingBox();
        await expect(inspector.getByRole("button", { name: "Move photograph", exact: true })).toHaveCount(0);
        assert.ok(doneBox.height <= 33 && doneBox.width < 100, "compact Done button");
        const dialogBox = await inspector.boundingBox();
        const footerBox = await inspector.locator("footer").boundingBox();
        assert.ok(
          Math.abs(dialogBox.y + dialogBox.height - (footerBox.y + footerBox.height)) < 2,
          "footer flush with actual dialog bottom",
        );
        assert.ok(dialogBox.y + dialogBox.height - (doneBox.y + doneBox.height) < 10, "Done sits at bottom of sheet");
        await inspector.evaluate((el) => el.style.setProperty("padding-bottom", "80px", "important"));
        const paddedDialog = await inspector.boundingBox();
        const anchoredFooter = await inspector.locator("footer").boundingBox();
        assert.ok(
          Math.abs(paddedDialog.y + paddedDialog.height - (anchoredFooter.y + anchoredFooter.height)) < 2,
          "footer ignores extra inherited bottom spacing",
        );
        await inspector.evaluate((el) => el.style.removeProperty("padding-bottom"));
        const descriptionBeforeHelp = await inspector.getByLabel("Exterior Description", { exact: true }).boundingBox();
        await formHelp.click();
        await expect(inspector.getByRole("note")).toBeVisible();
        assert.deepEqual(
          await inspector.getByLabel("Exterior Description", { exact: true }).boundingBox(),
          descriptionBeforeHelp,
          "help floats without shifting description",
        );
        assert.deepEqual(
          await inspector.getByLabel("Physical Form", { exact: true }).boundingBox(),
          beforeHelp,
          "floating help does not shift fields",
        );
        await page.keyboard.press("Escape");
        await expect(formHelp).toBeFocused();
        await expect(inspector.getByRole("note")).toHaveCount(0);
        await formHelp.evaluate((element) => element.blur());
        await capture("venue-details");
        await zone("Common");
        await expect(
          inspector.locator(".villages-workspace-zone-fields").getByLabel("Zone Name", { exact: true }),
        ).toBeVisible();
        await expect(
          inspector.locator(".villages-workspace-zone-fields").getByLabel("Zone Appearance", { exact: true }),
        ).toBeVisible();
        await expect(inspector.locator(".villages-workspace-zone-fields").getByRole("textbox")).toHaveCount(3);
        await expect(inspector.locator(".villages-workspace-zone-fields textarea").nth(0)).toHaveAttribute(
          "aria-label",
          "Zone Name",
        );
        await expect(inspector.locator(".villages-workspace-zone-fields textarea").nth(0)).toHaveAttribute(
          "placeholder",
          "Zone Name",
        );
        await expect(inspector.locator(".villages-workspace-zone-fields textarea").nth(1)).toHaveAttribute(
          "aria-label",
          "Zone Used For",
        );
        await expect(inspector.locator(".villages-workspace-zone-fields textarea").nth(2)).toHaveAttribute(
          "aria-label",
          "Zone Appearance",
        );
        await expect(inspector.getByLabel("Zone Used For", { exact: true })).toHaveAttribute(
          "placeholder",
          "Zone Purpose",
        );
        await expect(inspector.getByLabel("Venue Name", { exact: true })).toHaveValue("My observatory quarters");
        await expect(inspector.getByLabel("Physical Form", { exact: true })).toHaveValue("Converted observatory room");
        await expect(inspector.getByLabel("Zone Appearance", { exact: true })).toHaveCount(1);
        await expect(inspector.locator(".villages-workspace-sheet-body > header")).toBeVisible();
        assert.equal(
          await inspector.getByLabel("Zone Used For", { exact: true }).evaluate((el) => el.tagName),
          "TEXTAREA",
        );
        await expect(inspector.getByRole("button", { name: "Edit Zone used for" })).toHaveCount(0);
        await expect(inspector.getByText("Access", { exact: true })).toHaveCount(0);
        await expect(inspector.getByRole("button", { name: "Help: Zone access" })).toHaveCount(0);
        await expect(inspector.getByLabel("Venue Name", { exact: true })).toHaveValue("My observatory quarters");
        const commonHeaderBox = await inspector.locator(".villages-workspace-zone-fields").boundingBox();
        const commonTabsBox = await inspector.getByRole("tablist").boundingBox();
        assert.ok(commonTabsBox.y + commonTabsBox.height <= commonHeaderBox.y, "Common tab precedes its space fields");
        const scrollBody = inspector.locator(".villages-workspace-sheet-body");
        const headerBeforeScroll = await inspector.locator("header").boundingBox();
        await scrollBody.evaluate((el) => {
          el.style.height = "150px";
          el.style.flex = "none";
          el.scrollTop = 60;
        });
        const headerAfterScroll = await inspector.locator("header").boundingBox();
        assert.ok(headerAfterScroll.y < headerBeforeScroll.y - 30, "name and description scroll with tab content");
        await scrollBody.evaluate((el) => {
          el.style.removeProperty("height");
          el.style.removeProperty("flex");
          el.scrollTop = 0;
        });
        const commonInclude = await inspector.getByLabel("Include Common Space", { exact: true }).boundingBox();
        const commonName = await inspector.getByLabel("Zone Name", { exact: true }).boundingBox();
        assert.ok(commonInclude.y < commonName.y, "Included precedes Common Zone name");
        await capture("venue-common-sheet");
        await inspector
          .getByLabel("Zone Appearance", { exact: true })
          .fill("A quiet sitting room overlooking the sea.");
        await inspector.getByLabel("Zone Used For", { exact: true }).fill("Relaxing together");
        await zone("Private");
        await expect(
          inspector.locator(".villages-workspace-zone-fields").getByLabel("Zone Name", { exact: true }),
        ).toBeVisible();
        await expect(
          inspector.locator(".villages-workspace-zone-fields").getByLabel("Zone Appearance", { exact: true }),
        ).toBeVisible();
        await expect(inspector.locator(".villages-workspace-zone-fields").getByRole("textbox")).toHaveCount(3);
        await expect(inspector.locator(".villages-workspace-zone-fields textarea").nth(0)).toHaveAttribute(
          "aria-label",
          "Zone Name",
        );
        await expect(inspector.locator(".villages-workspace-zone-fields textarea").nth(0)).toHaveAttribute(
          "placeholder",
          "Zone Name",
        );
        await expect(inspector.locator(".villages-workspace-zone-fields textarea").nth(1)).toHaveAttribute(
          "aria-label",
          "Zone Used For",
        );
        await expect(inspector.locator(".villages-workspace-zone-fields textarea").nth(2)).toHaveAttribute(
          "aria-label",
          "Zone Appearance",
        );
        await expect(inspector.getByLabel("Zone Used For", { exact: true })).toHaveAttribute(
          "placeholder",
          "Zone Purpose",
        );
        await expect(inspector.getByLabel("Zone Appearance", { exact: true })).toHaveCount(1);
        await expect(inspector.getByLabel("Venue Name", { exact: true })).toHaveValue("My observatory quarters");
        const privateInclude = await inspector.getByLabel("Include Private Space", { exact: true }).boundingBox();
        const privateName = await inspector.getByLabel("Zone Name", { exact: true }).boundingBox();
        assert.ok(privateInclude.y < privateName.y, "Included precedes Private Zone name");
        await capture("venue-private-sheet");
        await inspector.getByLabel("Zone Appearance", { exact: true }).fill("My hammock and traveling journal.");
        await inspector.getByLabel("Include Private Space", { exact: true }).uncheck();
        await expect(inspector.getByLabel("Zone Appearance", { exact: true })).toHaveCount(0);
        await zone("Common");
        await inspector.getByLabel("Include Common Space", { exact: true }).click();
        await expect(inspector.getByLabel("Include Common Space", { exact: true })).toBeChecked();
        await expect(inspector.getByRole("alert")).toContainText("At least one");
        await zone("Private");
        await mapView();
        await forward("Save & exit").click();
        await page.reload();
        await page.addScriptTag({ content: foundingBundle });
        await root.getByRole("button", { name: "Resume photograph placement", exact: true }).click();
        await open();
        await zone("Private");
        await expect(inspector.getByLabel("Include Private Space", { exact: true })).not.toBeChecked();
        await inspector.getByLabel("Include Private Space", { exact: true }).check();
        await expect(inspector.getByLabel("Zone Appearance", { exact: true })).toHaveValue(
          "My hammock and traveling journal.",
        );
        await inspector.getByLabel("Zone Appearance", { exact: true }).fill("");
        await mapView();
        await expect(forward("Review village")).toBeDisabled();
        await open();
        await zone("Private");
        await expect(inspector.getByLabel("Zone Appearance", { exact: true })).toBeVisible();
        await expect(forward("Review village")).toBeDisabled();
        await inspector.getByLabel("Zone Appearance", { exact: true }).fill("My hammock and traveling journal.");
        await open(homeCount + 1);
        await zone("Common");
        await expect(inspector.getByLabel("Include Common Space", { exact: true })).toBeChecked();
        await expect(inspector.getByLabel("Include Common Space", { exact: true })).toBeDisabled();
        await zone("Private");
        await expect(inspector.getByLabel("Include Private Space", { exact: true })).not.toBeChecked();
        await expect(inspector.getByLabel("Include Private Space", { exact: true })).toBeDisabled();
        await expect(inspector.getByLabel("Zone Appearance", { exact: true })).toHaveCount(0);
        await open(1);
        await zone("Private");
        await expect(inspector.getByLabel("Zone Appearance", { exact: true })).toHaveCount(0);
        await expect(inspector.getByLabel("Room Specification", { exact: true })).toBeVisible();
        await inspector
          .getByLabel("Room Specification", { exact: true })
          .fill("A small bedroom with a garden-facing window.");
        await expect(inspector.getByText(/will personalize this interior/)).toBeVisible();
        await expect(inspector.getByRole("button", { name: "Generate image", exact: true })).toHaveCount(0);
        await inspector.getByLabel("Include Private Space", { exact: true }).uncheck();
        await inspector.getByLabel("Include Private Space", { exact: true }).check();
        await expect(inspector.getByLabel("Room Specification", { exact: true })).toHaveValue(
          "A small bedroom with a garden-facing window.",
        );
        await capture("resident-room-specification");
        await inspector.getByRole("button", { name: "Help: Private interior", exact: true }).click();
        await expect(inspector.getByText(/prepared privately/)).toBeVisible();
        await inspector.getByRole("button", { name: "Close Private interior help", exact: true }).click();
        await open();
        await mapView();
        await forward("Suggest names & descriptions").click();
        if (width === 1366) {
          await expect.poll(() => !!releaseSuggestion).toBe(true);
          await open();
          await zone("Exterior");
          await inspector.getByLabel("Physical Form", { exact: true }).fill("Authored during suggestion");
          await inspector.getByLabel("Venue Name", { exact: true }).fill("Edited while suggesting");
          releaseSuggestion();
          await mapView();
          await expect(forward("Suggest names & descriptions")).toBeEnabled();
          await open();
          await expect(inspector.getByLabel("Physical Form", { exact: true })).toHaveValue(
            "Authored during suggestion",
          );
        }
        await mapView();
        await expect(forward("Suggest names & descriptions")).toBeEnabled();
        assert.equal(suggestionCalls, 2);
        await open();
        await expect(inspector.getByLabel("Venue Name", { exact: true })).toHaveValue(
          width === 1366 ? "Edited while suggesting" : "Renewed observatory quarters",
        );
        await inspector.getByLabel("Venue Name", { exact: true }).fill("My observatory quarters");
        await mapView();
        await page.mouse.move(0, 0);
        await pins.first().evaluate((el) => el.blur());
        const photo = pins.first().locator(".marinara-capability-villages-pin-photo-card");
        await expect.poll(async () => Math.round((await photo.boundingBox()).width)).toBe(36);
        const hit = await pins.first().boundingBox();
        assert.ok(hit.width >= 44 && hit.height >= 44);
        if (width >= 600) {
          await pins.first().hover();
          await expect.poll(async () => Math.round((await photo.boundingBox()).width)).toBe(72);
          await page.mouse.move(0, 0);
        }
        await page.keyboard.press("Tab");
        await pins.first().focus();
        await expect.poll(async () => Math.round((await photo.boundingBox()).width)).toBe(72);
        await pins.first().evaluate((el) => el.blur());
        await expect.poll(async () => Math.round((await photo.boundingBox()).width)).toBe(36);
        if (width === 1366) {
          const position = () =>
            pins.first().evaluate((pin) => [pin.parentElement.style.left, pin.parentElement.style.top]);
          const dragTo = async (destination) => {
            const box = await pins.first().boundingBox();
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(destination.x, destination.y, { steps: 4 });
            await page.mouse.up();
          };
          const original = await position(),
            second = await pins.nth(1).boundingBox();
          await dragTo({ x: second.x + second.width / 2, y: second.y + second.height / 2 });
          await expect(root.getByRole("alert").filter({ hasText: "overlap" })).toBeVisible();
          assert.deepEqual(await position(), original);
          await dragTo({ x: -10, y: 100 });
          assert.deepEqual(await position(), original);
          const box = await pins.first().boundingBox();
          await dragTo({ x: box.x + box.width / 2 + 45, y: box.y + box.height / 2 });
          assert.notDeepEqual(await position(), original);
          const mapHeight = (await placementMap.boundingBox()).height;
          await open();
          await expect(inspector.locator(".villages-workspace-sheet-body")).toHaveCSS("overflow-y", "auto");
          await mapView();
          assert.equal((await placementMap.boundingBox()).height, mapHeight);
          // Optional image failures and saved responses keep unrelated editing available.
          await open(1);
          await zone("Common");
          await expect(inspector.getByText("Artwork context", { exact: true })).toHaveCount(0);
          await expect(inspector.getByRole("checkbox", { name: "Use assigned resident’s personality" })).toHaveCount(0);
          await expect(inspector.getByText(/expected AI request|Read-only forecast/)).toHaveCount(0);
          await inspector.getByRole("button", { name: "Generate image", exact: true }).click();
          await expect(root.getByRole("alert").filter({ hasText: "Optional image unavailable" })).toBeVisible();
          await inspector.getByRole("button", { name: "Generate image", exact: true }).click();
          await expect.poll(() => !!releaseImage).toBe(true);
          await expect(inspector.getByLabel("Zone Appearance", { exact: true })).toBeDisabled();
          await expect(forward("Save & exit")).toBeDisabled();
          await open();
          await zone("Exterior");
          await expect(inspector.getByLabel("Physical Form", { exact: true })).toBeEnabled();
          releaseImage();
          await expect(forward("Save & exit")).toBeEnabled();
          await open(1);
          await zone("Common");
          await expect(inspector.locator(".villages-workspace-artwork img")).toHaveCount(1);
          await expect(inspector.locator(".villages-workspace-artwork img")).toBeVisible();
          await expect(inspector.locator(".villages-workspace-artwork summary")).toHaveCount(0);
          await expect(inspector.locator(".villages-workspace-image-actions > button")).toHaveCount(3);
          const imageButtons = await inspector.locator(".villages-workspace-image-actions > button").all();
          const imageButtonBoxes = await Promise.all(imageButtons.map((button) => button.boundingBox()));
          assert.ok(
            imageButtonBoxes.every((box) => Math.abs(box.y - imageButtonBoxes[0].y) < 1),
            "image actions share one row",
          );
          await expect(inspector.getByLabel("Upload interior image", { exact: true })).toBeHidden();
          const filePickerPromise = page.waitForEvent("filechooser");
          await inspector.getByRole("button", { name: "Upload image", exact: true }).click();
          const filePicker = await filePickerPromise;
          assert.equal(await filePicker.element().getAttribute("aria-label"), "Upload interior image");
          await inspector.evaluate((dialog) => dialog.dispatchEvent(new Event("cancel", { cancelable: true })));
          await expect(inspector).toBeVisible();
          await filePicker.setFiles([]);
          await inspector
            .getByLabel("Upload interior image", { exact: true })
            .evaluate((input) => input.dispatchEvent(new Event("cancel", { bubbles: true })));
          // Cancellation restores the picker opener on the next animation frame.
          // Wait for that restoration before checking a later, unrelated focus event.
          await page.evaluate(
            () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
          );
          await expect(inspector.getByRole("button", { name: "Upload image", exact: true })).toBeFocused();
          await inspector.evaluate((dialog) =>
            dialog.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 0, clientY: 0 })),
          );
          await expect(inspector).toBeVisible();
          await inspector.getByLabel("Zone Appearance", { exact: true }).focus();
          await page.evaluate(() => {
            window.dispatchEvent(new Event("focus"));
            return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          });
          await expect(inspector.getByLabel("Zone Appearance", { exact: true })).toBeFocused();
          const smallPreview = inspector.getByRole("button", { name: "View image", exact: true });
          const previewBox = await smallPreview.boundingBox();
          const actionsBox = await inspector.locator(".villages-workspace-image-actions").boundingBox();
          assert.ok(previewBox.y >= actionsBox.y + actionsBox.height, "preview below action buttons");
          assert.ok(
            Math.abs(previewBox.x + previewBox.width / 2 - (actionsBox.x + actionsBox.width / 2)) < 2,
            "preview centered",
          );
          await smallPreview.click();
          const imageViewer = root.getByRole("dialog", { name: "Venue image viewer" });
          await expect(imageViewer).toBeVisible();
          await page.keyboard.press("Escape");
          await expect(imageViewer).not.toBeVisible();
          await expect(inspector).toBeVisible();
          await expect(smallPreview).toBeFocused();
          await smallPreview.click();
          await expect(imageViewer).toBeVisible();
          await page.mouse.click(0, 0);
          await expect(imageViewer).not.toBeVisible();
          await expect(inspector).toBeVisible();
          await expect(smallPreview).toBeFocused();
          await mapView();
          await forward("Suggest names & descriptions").click();
          await expect(forward("Suggest names & descriptions")).toBeEnabled();
          await open(1);
          await zone("Common");
          await expect(inspector.locator(".villages-workspace-artwork img")).toHaveCount(1);
          await zone("Exterior");
          await inspector.getByRole("button", { name: "Generate image", exact: true }).click();
          await expect(inspector.getByRole("button", { name: "Generate again", exact: true })).toBeVisible();
          await inspector.getByRole("button", { name: "Generate again", exact: true }).click();
          await expect.poll(() => imageCalls === 4).toBe(true);
          await mapView();
          await forward("Back").click();
          await forward("Back").click();
          await forward("Back").click();
          await root.getByLabel("Village Name", { exact: true }).fill("Changed while generating");
          releaseImage();
          await expect(root.getByRole("alert").filter({ hasText: "changed while its image" })).toBeVisible();
          await root.getByLabel("Village Name", { exact: true }).fill("Willowbrook");
          await forward("Continue to People").click();
          await forward("Continue to Map").click();
          await forward("Continue to Venues").click();
          await open(1);
          await zone("Exterior");
          await expect(inspector.locator(".villages-workspace-artwork img")).toHaveCount(1);
          await mapView();
          // Quota errors keep the current choices visible and prevent a false saved claim.
          await page.evaluate(() => {
            window.draftPut = IDBObjectStore.prototype.put;
            IDBObjectStore.prototype.put = function () {
              throw new DOMException("Draft storage full", "QuotaExceededError");
            };
          });
          await forward("Back").click();
          await forward("Back").click();
          await forward("Back").click();
          await root.getByLabel("Village Name", { exact: true }).fill("Willowbrook revised");
          await expect(root.locator(".villages-forging-saved")).toHaveText("Draft not saved");
          await expect(forward("Continue to People")).toBeDisabled();
          await expect(root.getByLabel("Village Name", { exact: true })).toHaveValue("Willowbrook revised");
          await forward("Save & exit").click();
          await expect(root).toHaveAttribute("data-step", "0");
          await page.evaluate(() => {
            IDBObjectStore.prototype.put = window.draftPut;
          });
          await forward("Retry saving draft").click();
          await expect(root.locator(".villages-forging-saved")).toContainText("Saved");
          // Another tab's newer revision wins; this tab must not overwrite it.
          const competingTab = await page.context().newPage();
          await competingTab.route("http://villages.test/", (route) =>
            fulfill(route, { status: 200, contentType: "text/html", body: "<title>Competing draft tab</title>" }),
          );
          await competingTab.goto("http://villages.test/");
          await competingTab.evaluate(async () => {
            const db = await new Promise((resolve) => {
              const open = indexedDB.open("villages-drafts-v4", 1);
              open.onsuccess = () => resolve(open.result);
            });
            await new Promise((resolve) => {
              const tx = db.transaction("drafts", "readwrite");
              const store = tx.objectStore("drafts");
              const all = store.getAllKeys();
              all.onsuccess = () => {
                const key = all.result[0];
                const get = store.get(key);
                get.onsuccess = () => store.put({ ...get.result, revision: get.result.revision + 1 }, key);
              };
              tx.oncomplete = resolve;
            });
            db.close();
          });
          await root.getByLabel("Village Name", { exact: true }).fill("Unsaved competing choice");
          await expect(root.getByRole("alert").filter({ hasText: "This draft changed in another tab" })).toBeVisible();
          await forward("Save & exit").click();
          await expect(root.getByLabel("Village Name", { exact: true })).toHaveValue("Unsaved competing choice");
          await competingTab.close();
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await root.getByRole("button", { name: "Resume founding", exact: true }).click();
          await expect(root.getByLabel("Village Name", { exact: true })).toHaveValue("Willowbrook revised");
          await forward("Continue to People").click();
          await forward("Continue to Map").click();
          await forward("Continue to Venues").click();
        }
        await mapView();
        await bounds();
        await capture("venues");
        if (width === 1366 || (width === 390 && height === 844)) {
          await forward("Back").click();
          await root.getByRole("button", { name: "Generate artwork", exact: true }).click();
          const artworkDialog = root.getByRole("region", { name: "Map artwork", exact: true });
          await expect(artworkDialog.getByText(/expected AI request|Read-only forecast/)).toHaveCount(0);
          await expect(artworkDialog.getByText("Choose artwork here, or use Simple map.", { exact: true })).toHaveCount(
            0,
          );
          await expect(artworkDialog.getByText("More options", { exact: true })).toBeVisible();
          await capture("map-artwork-options");
          await root.getByLabel("Map Details", { exact: true }).fill("One floor; bedrooms east, telescope hall west.");
          await root.getByRole("button", { name: "Generate map", exact: true }).click();
          await expect.poll(() => !!releaseMap).toBe(true);
          await forward("Continue to Venues").click();
          await expect(root).toHaveAttribute("data-step", "3");
          await expect(root.getByRole("button", { name: "Arrange automatically", exact: true })).toHaveCount(0);
          releaseMap();
          await expect(
            root.getByRole("alert").filter({ hasText: "The generated map is too large to store." }),
          ).toBeVisible();
          await expect(root.locator(".villages-forging-placement")).toContainText("Map artwork failed");
          await forward("Back").click();
          await expect(
            root.getByRole("alert").filter({ hasText: "The generated map is too large to store." }),
          ).toBeVisible();
          releaseMap = undefined;
          await root.getByRole("button", { name: "Generate map", exact: true }).click();
          await expect.poll(() => !!releaseMap).toBe(true);
          await expect(
            root.getByRole("alert").filter({ hasText: "The generated map is too large to store." }),
          ).toHaveCount(0);
          await forward("Continue to Venues").click();
          await expect(
            root.getByText(/Waiting for map artwork|Image generation can take several minutes|Creating map artwork/),
          ).toHaveCount(0);
          // Reload while the provider is still drawing: the resumed draft only reads status.
          await forward("Save & exit").click();
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await root.getByRole("button", { name: "Resume photograph placement", exact: true }).click();
          await expect(
            root.getByText(/Waiting for map artwork|Image generation can take several minutes|Creating map artwork/),
          ).toHaveCount(0);
          assert.equal(mapCalls, 2, "resuming an unfinished attempt must not generate again");
          failMapStatus = true;
          await expect(root.getByRole("button", { name: "Check map status", exact: true })).toBeVisible();
          failMapStatus = false;
          releaseMap();
          await root.getByRole("button", { name: "Check map status", exact: true }).click();
          // The status request is asynchronous; old uploaded artwork is still visible while it runs.
          await expect(root.getByRole("img", { name: /^Map of / })).toHaveAttribute("src", mapImage);
          await expect(
            root.getByRole("button", { name: "I checked all Venue photographs against this map", exact: true }),
          ).toHaveCount(0);
          await forward("Review village").click();
          await expect(root).toHaveAttribute("data-step", "4");
          await forward("Change starting Venues").click();
          await open();
          await mapView();
          await expect(root.locator(".villages-workspace-toolbar > strong")).toHaveText(
            `Venues${homeCount + 2} of ${homeCount + 2} placed`,
          );
          await capture("artwork-spaces");
          await forward("Save & exit").click();
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await expect(root.getByRole("button", { name: "Resume photograph placement", exact: true })).toBeVisible();
          await root.getByRole("button", { name: "Resume photograph placement", exact: true }).click();
          assert.equal(mapCalls, 2, "only deliberate retry generates again; finished artwork is restored on reload");
          await forward("Back").click();
          assert.deepEqual(
            await root
              .getByRole("img", { name: "Selected village map", exact: true })
              .evaluate((node) => [node.naturalWidth, node.naturalHeight]),
            [1536, 1024],
          );
          await expect(root.getByText(/\d+ × \d+ pixels/)).toHaveCount(0);
          await expect(root.getByLabel("Map Details", { exact: true })).toHaveValue(
            "One floor; bedrooms east, telescope hall west.",
          );
          await root.getByLabel("Map Details", { exact: true }).fill("Same map with updated guidance.");
          await expect(root.getByRole("img", { name: "Selected village map", exact: true })).toBeVisible();
          await expect(root.getByText(/Your inputs changed/)).toHaveCount(0);
          await expect(root.getByRole("button", { name: "Use this saved artwork", exact: true })).toHaveCount(0);
          await forward("Continue to Venues").click();
          await forward("Review village").click();
          await expect(root).toHaveAttribute("data-step", "4");
          await forward("Change map").click();
          await expect(root).toHaveAttribute("data-step", "2");
          await forward("Continue to Venues").click();
          // A chosen upload replaces paused recovery, even when the old provider finishes later.
          await forward("Back").click();
          failMapStatus = true;
          await root.getByRole("button", { name: "Generate again", exact: true }).click();
          await expect(root.getByRole("button", { name: "Check map status", exact: true })).toBeVisible();
          await root
            .getByRole("group", { name: "Map source", exact: true })
            .getByRole("button", { name: "Upload image", exact: true })
            .click();
          const uploadArt = new PNG({ width: 1024, height: 1024 });
          uploadArt.data.fill(110);
          await root
            .getByLabel("Upload map image", { exact: true })
            .setInputFiles({ name: "chosen-map.png", mimeType: "image/png", buffer: PNG.sync.write(uploadArt) });
          assert.deepEqual(
            await root
              .getByRole("img", { name: "Selected village map", exact: true })
              .evaluate((node) => [node.naturalWidth, node.naturalHeight]),
            [1024, 1024],
          );
          await expect(root.getByText(/\d+ × \d+ pixels/)).toHaveCount(0);
          await expect(root.getByRole("button", { name: "Check map status", exact: true })).toHaveCount(0);
          failMapStatus = false;
          releaseMap();
          await forward("Continue to Venues").click();
          await forward("Review village").click();
          await forward("Change starting Venues").click();
          await forward("Save & exit").click();
          await expect(root.getByRole("button", { name: "Resume photograph placement", exact: true })).toBeVisible();
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await root.getByRole("button", { name: "Resume photograph placement", exact: true }).click();
          await forward("Back").click();
          await expect(root.getByRole("img", { name: "Selected village map", exact: true })).toBeVisible();
          assert.deepEqual(
            await root
              .getByRole("img", { name: "Selected village map", exact: true })
              .evaluate((node) => [node.naturalWidth, node.naturalHeight]),
            [1024, 1024],
          );
          await expect(root.getByText(/\d+ × \d+ pixels/)).toHaveCount(0);
          assert.equal(mapCalls, 3, "upload and reload do not dispatch another image request");
          await forward("Continue to Venues").click();
        }
        await forward("Review village").click();
        await expect(root).toHaveAttribute("data-step", "4");
        await expect(root.getByRole("button", { name: "Change people & starting notes", exact: true })).toBeVisible();
        await expect(root.locator(".villages-resident-review").filter({ hasText: "Finn" })).toContainText(
          /[Gg]uardian of a relic/,
        );
        await expect(root.getByRole("button", { name: "Change place", exact: true })).toBeVisible();
        await root.getByRole("button", { name: "Change map", exact: true }).click();
        await expect(root).toHaveAttribute("data-step", "2");
        await forward("Continue to Venues").click();
        await forward("Review village").click();
        if (width === 1366) {
          for (const legacyStep of [2, 3]) {
            await forward("Save & exit").click();
            await page.evaluate(async (legacyStep) => {
              const db = await new Promise((resolve) => {
                const open = indexedDB.open("villages-drafts-v4", 1);
                open.onsuccess = () => resolve(open.result);
              });
              await new Promise((resolve, reject) => {
                const tx = db.transaction("drafts", "readwrite");
                const cursor = tx.objectStore("drafts").openCursor();
                cursor.onsuccess = () => {
                  const row = cursor.result;
                  if (!row) return;
                  const saved = row.value;
                  delete saved.data.phase;
                  delete saved.data.descriptionVersion;
                  saved.data.circumstances = "We chose to live among the ruins.";
                  saved.data.step = legacyStep;
                  row.update({ ...saved, revision: saved.revision + 1 });
                  row.continue();
                };
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
              });
              db.close();
            }, legacyStep);
            await page.reload();
            await page.addScriptTag({ content: foundingBundle });
            await expect(
              root.getByText(new RegExp("Resume: " + (legacyStep === 2 ? "Venues" : "Review"))),
            ).toBeVisible();
            await root
              .getByRole("button", {
                name: legacyStep === 2 ? "Resume photograph placement" : "Resume founding",
                exact: true,
              })
              .click();
            await expect(root).toHaveAttribute("data-step", String(legacyStep + 1));
            await expect(root.locator(".marinara-capability-villages-pin-photo-card")).toHaveCount(homeCount + 2);
            if (legacyStep === 2) await forward("Review village").click();
            assert.equal(mapCalls, 3, "legacy resume does not generate new artwork");
          }
        }
        await expect(root.getByRole("button", { name: "Change starting Venues", exact: true })).toBeVisible();
        await bounds();
        await expect(root.locator(".marinara-capability-villages-pin-photo-card")).toHaveCount(homeCount + 2);
        await expect(root.locator('[class*="pin-tack"], [class*="photo-tack"]')).toHaveCount(0);
        await capture("review");
        await forward("Found village").click();
        await expect.poll(() => foundingPayload).toBeTruthy();
        assert.equal(foundingPayload.venues.length, homeCount + 2);
        assert.ok(foundingPayload.townMapImage.startsWith("data:image/png;base64,"));
        assert.equal(foundingPayload.playerBackground, "I came to help restore the observatory.");
        assert.equal(foundingPayload.foundingResidentAdmissions.finn.homeworld, "Othiras");
        assert.match(foundingPayload.foundingResidentAdmissions.finn.startingSituation, /always been guardian/);
        assert.deepEqual(
          Object.keys(foundingPayload.foundingResidentAdmissions).sort(),
          foundingPayload.foundingCharacterIds.slice().sort(),
        );
        assert.deepEqual(
          foundingPayload.foundingCharacterIds.slice().sort(),
          ["finn", "rosa", "lee"].slice(0, homeCount).sort(),
        );
        assert.equal(
          foundingPayload.venues[0].name,
          width === 1366 ? "Renewed observatory quarters" : "My observatory quarters",
        );
        assert.equal(foundingPayload.venues[0].description, "A blue door beside the telescope corridor.");
        assert.equal(foundingPayload.venues[0].privateSpaces[0].description, "My hammock and traveling journal.");
        assert.equal(
          foundingPayload.venues[1].privateSpaces[0].roomSpecification,
          "A small bedroom with a garden-facing window.",
        );
        assert.ok(
          foundingPayload.venues.every((venue) => venue.presentation.x !== null && venue.presentation.y !== null),
        );
        assert.ok(
          foundingPayload.venues
            .slice(1, -1)
            .every((venue) => venue.privateSpaces.every((room) => room.description === "" && room.image === null)),
          "private contents stay hidden",
        );
        assert.equal(errors.length, 0, JSON.stringify(errors));
        console.log(`Founding v2: ${width}x${height}, ${homeCount} villagers, saved/resumed, validated.`);
        await context.close();
      });
    }
    if (group === "desktop") await runCase("founding/reopening", verifyFoundingReopening);
  } finally {
    await browser.close();
  }
}
