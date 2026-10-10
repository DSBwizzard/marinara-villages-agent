import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PNG } from "pngjs";
import { chromium, expect } from "@playwright/test";
import { build } from "esbuild";

const art = new PNG({ width: 1280, height: 720 });
art.data.fill(90);
const mapImage = "data:image/png;base64," + PNG.sync.write(art).toString("base64");
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
const snapshot = {
  status: "ready",
  isFounded: false,
  village: { name: "", setting: "" },
  noticeboard: [],
  projects: [],
  venueRequests: [],
  upgradeRequests: [],
  residences: [],
  happenings: [],
  villagers: [],
  recap: null,
  settings: {
    venues: [],
    foundingReason: "",
    foundingDetails: "",
    foundingGuidance: "",
    scenarioImprint: null,
    worldFacts: [],
    selectedLorebookIds: [],
    loreTokenBudget: 1600,
    townMapImageSetAt: "",
    townMapExpectedWidth: 1280,
    townMapExpectedHeight: 720,
    townMapGenerationWidth: 1280,
    townMapGenerationHeight: 720,
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
  enabled: true,
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
          assert.equal(values.setSetupFoundingReason, reason);
          assert.equal(values.setSetupFoundingDetails, details);
          assert.equal(values.setSetupFoundingGuidance, reason === "none" ? "" : village.settings.foundingGuidance);
          assert.equal(values.setScreen, "setup");
        }
    const fresh = await page.evaluate(() => {
      window.openSetup(true, null);
      return window.values;
    });
    assert.equal(fresh.setSetupFoundingReason, "custom");
    assert.equal(fresh.setSetupFoundingGuidance, "");
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
<FoundingWorkspace venues={[venue]} people={[]} selectedId='saved' placementId={null} state={state} map={<div>Map</div>} existing={true} mapReady={true} issues={[]} focusIssue={issue} imageTarget={null} imageBusy={false} suggestionsBusy={false} suggestionsChanged={false} usagePreview={null} saveStatus='Saved' onState={setState} onMove={()=>{}} onContinue={()=>{}} onPatch={setVenue} onDraft={()=>{}} onGenerate={()=>{}} onUpload={()=>{}}/></>}
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
  const page = await context.newPage();
  await page.setContent('<div id="root"></div>');
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  const selector = page.getByLabel("Selected Zone", { exact: true });
  for (const id of ["common-a", "common-b", "private-a", "private-b"]) {
    await selector.selectOption(id);
    await expect(page.getByLabel("Zone name", { exact: true })).toHaveCount(1);
    await expect(page.getByLabel("Zone name", { exact: true })).toHaveValue(id);
    await page.getByLabel("Zone used for", { exact: true }).fill("Edited " + id);
  }
  await page.getByRole("button", { name: "Common", exact: true }).click();
  await expect(selector).toHaveValue("common-a");
  await page.getByRole("button", { name: "Private", exact: true }).click();
  await expect(selector).toHaveValue("private-a");
  await page.getByRole("button", { name: "Review second Private" }).click();
  await expect(selector).toHaveValue("private-b");
  await expect(page.getByLabel("Zone used for", { exact: true })).toBeFocused();
  const saved = await page.evaluate(() => window.savedVenue);
  assert.deepEqual(
    [...saved.spaces, ...saved.privateSpaces].map((zone) => zone.purpose),
    ["Edited common-a", "Edited common-b", "Edited private-a", "Edited private-b"],
  );
  await page.getByRole("button", { name: "Remove Zone", exact: true }).click();
  await expect(selector).toHaveValue("exterior");
  await expect(page.getByLabel("Exterior description", { exact: true })).toBeVisible();
  await context.close();
  console.log(
    "Existing-world inspector: multiple saved Common/Private IDs, independent edits and exact Review focus (isolated React fixture).",
  );
}
try {
  await verifySavedZoneSelection();
  for (const { width, height, fontSize, homeCount, chromeHeight = 0 } of [
    { width: 1366, height: 768, fontSize: 16, homeCount: 3 },
    { width: 1440, height: 650, fontSize: 16, homeCount: 1, chromeHeight: 200 },
    { width: 1917, height: 600, fontSize: 20, homeCount: 1 },
    { width: 1024, height: 768, fontSize: 20, homeCount: 2 },
    { width: 727, height: 768, fontSize: 16, homeCount: 1 },
    { width: 728, height: 768, fontSize: 16, homeCount: 1 },
    { width: 390, height: 844, fontSize: 16, homeCount: 2 },
    { width: 320, height: 568, fontSize: 16, homeCount: 1 },
    { width: 390, height: 650, fontSize: 20, homeCount: 3 },
  ].filter((row) => !process.env.VILLAGES_VIEWPORT || row.width === Number(process.env.VILLAGES_VIEWPORT))) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 600 });
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
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/setup/venue-image/generate")) {
        imageCalls++;
        if (imageCalls === 1)
          return route.fulfill({
            status: 503,
            contentType: "application/json",
            body: JSON.stringify({ error: "Optional image unavailable" }),
          });
        if (imageCalls === 2 || imageCalls === 4)
          await new Promise((resolve) => {
            releaseImage = resolve;
          });
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(imageRef) });
      }
      if (path.endsWith("/setup/venue-image") && route.request().method() === "PUT")
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(imageRef) });
      if (path.endsWith("/setup") && route.request().method() === "POST")
        foundingPayload = route.request().postDataJSON();
      if (path.endsWith("/connections") && route.request().method() === "PUT")
        connections = { ...connections, ...route.request().postDataJSON() };
      if (path.endsWith("/setup/venues/suggest")) {
        suggestionCalls++;
        const body = route.request().postDataJSON();
        if (width === 1366 && suggestionCalls === 2)
          await new Promise((resolve) => {
            releaseSuggestion = resolve;
          });
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            venues: body.venues.map((row, index) => ({
              id: row.id,
              name:
                index === 0
                  ? "Your living space"
                  : row.venueClass === "gathering"
                    ? "Gathering Place"
                    : `${characters.find((person) => person.id === row.residentCharacterId)?.name}'s living space`,
              form: "Indoor room",
              description: "An entrance off the shared corridor.",
              layout: row.venueClass === "gathering" ? "common" : "both",
              commonName: "Sitting area",
              commonPurpose: "Sharing meals",
              commonDescription: "A table beside a window.",
              privateName: "Bedroom",
              privatePurpose: "Personal resting space",
              privateDescription: row.residentCharacterId ? "" : "A comfortable hammock.",
            })),
          }),
        });
      }
      if (path.endsWith("/setup/town-map/generate")) {
        mapCalls++;
        const body = route.request().postDataJSON();
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
            result: mapCalls === 1 ? null : { image: mapImage, width: 1280, height: 720 },
          };
        };
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mapReceipt) });
      }
      if (path.includes("/setup/town-map/generation/")) {
        if (failMapStatus)
          return route.fulfill({
            status: 503,
            contentType: "application/json",
            body: JSON.stringify({ error: "Connection interrupted" }),
          });
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mapReceipt) });
      }
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
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.route("**/api/characters/summaries", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
    );
    await page.route("**/api/connections", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: "talk", name: "Language model", provider: "language", defaultForAgents: true },
          { id: "image", name: "Image model", provider: "image_generation", defaultForAgents: true },
        ]),
      }),
    );
    await page.route("http://villages.test/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `<style>:root{font-size:${fontSize}px;--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}html,body{margin:0;width:100%;height:100%;font-family:Arial,sans-serif}marinara-capability-villages{display:block;width:100%;height:100%}</style><header style="height:${chromeHeight}px;overflow:hidden">Engine chrome fixture</header><div style="height:calc(100% - ${chromeHeight}px)"><marinara-capability-villages></marinara-capability-villages></div>`,
      }),
    );
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
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
        await page.screenshot({ path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `${name}-${width}.png`) });
      }
    };
    await expect(root.locator('.villages-forging-steps [aria-current="step"]')).toHaveAttribute("aria-label", "People");
    await expect(root.locator(".villages-forging-steps button")).toHaveCount(0);
    await expect(root.getByRole("heading", { name: "Forging the Village", exact: true })).toBeVisible();
    await expect(root.getByRole("heading", { name: "You", exact: true })).toBeVisible();
    await root.getByRole("button", { name: /Zara.*Change/ }).click();
    const personaDialog = page.getByRole("dialog", { name: "Choose Persona", exact: true });
    await personaDialog.getByPlaceholder("Search Personas").fill("patient");
    await personaDialog.getByRole("button").filter({ hasText: "Ada" }).click();
    await expect(root.getByText("View Persona details", { exact: true })).toHaveCount(0);
    await root.getByLabel("Role title", { exact: true }).fill(" ");
    await forward("Continue to place").click();
    await expect(root.getByRole("alert")).toContainText("title");
    await root.getByLabel("Role title", { exact: true }).fill("Harbor Patron");
    await expect(root.getByLabel("Why villagers turn to you", { exact: true })).toHaveCount(0);
    const selectResidents = async (names) => {
      await root.getByRole("button", { name: "+ Add villager", exact: true }).click();
      const picker = page.getByRole("dialog", { name: "Choose founding villagers", exact: true });
      for (const name of names) await picker.getByRole("button", { name: name + " · Select", exact: true }).click();
      await picker.getByRole("button", { name: "Done", exact: true }).click();
    };
    await selectResidents(
      ["Finn", "Rosa", "Lee, Keeper of the Observatory’s Long Forgotten Archives"].slice(0, homeCount),
    );
    const choice = root.getByLabel("Finn backstory", { exact: true });
    await expect(choice).toHaveValue("continue");
    await expect(root.locator(".villages-backstories")).toHaveCount(0);
    const finnCard = root
      .locator(".villages-selected-villager")
      .filter({ has: page.getByLabel("Finn backstory", { exact: true }) });
    await expect(finnCard.getByRole("button", { name: "Finn \u00b7 Remove", exact: true })).toBeVisible();
    await expect(finnCard.getByText("Finn", { exact: true })).toHaveCount(1);
    await bounds();
    await capture("people-merged");
    const helpBackstory = finnCard.getByRole("button", { name: "Help: Finn backstory", exact: true });
    const cardHeightBeforeHelp = await finnCard.evaluate((node) => node.getBoundingClientRect().height);
    await helpBackstory.click();
    await expect(finnCard.getByRole("note").locator("span")).toHaveText([
      "Use original backstory: Preserves the character’s existing history wherever their card describes it.",
      "Write custom backstory: Describe a custom backstory for Villages to use for this character.",
    ]);
    await bounds();
    assert.equal(
      await finnCard.evaluate((node) => node.getBoundingClientRect().height),
      cardHeightBeforeHelp,
      "help floats without expanding the card",
    );
    await capture("backstory-help");
    await helpBackstory.press("Escape");
    await expect(helpBackstory).toBeFocused();
    await choice.selectOption("village");
    const editBackstory = finnCard.getByRole("button", { name: "Edit Finn backstory", exact: true });
    const backstoryEditor = root.getByRole("dialog", { name: "Finn’s backstory", exact: true });
    const past = backstoryEditor.getByLabel("Backstory for this village", { exact: true });
    await expect(editBackstory).toBeVisible();
    await expect(backstoryEditor).toHaveCount(0);
    await expect(finnCard.getByRole("textbox")).toHaveCount(0);
    await editBackstory.click();
    await expect(backstoryEditor).toBeVisible();
    await past.fill("Discard this draft.");
    await backstoryEditor.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(choice).toHaveValue("village");
    await expect(editBackstory).toBeFocused();
    await editBackstory.click();
    await expect(past).toHaveValue("");
    await past.fill("Discard with Escape.");
    await past.press("Escape");
    await expect(backstoryEditor).toHaveCount(0);
    await expect(editBackstory).toBeFocused();
    await editBackstory.click();
    await backstoryEditor.getByRole("button", { name: "Use backstory", exact: true }).click();
    await expect(backstoryEditor.getByRole("alert")).toContainText("Write a backstory");
    await past.fill("Finn has always been guardian of a relic in the observatory.");
    if (width === 390 && height === 844) {
      await page.setViewportSize({ width, height: 460 });
      await past.focus();
      await past.scrollIntoViewIfNeeded();
      const box = await past.boundingBox();
      assert.ok(box && box.x >= 0 && box.x + box.width <= width + 1, "popup field fits phone keyboard width");
      await page.setViewportSize({ width: 1366, height: 844 });
      await expect(past).toHaveValue("Finn has always been guardian of a relic in the observatory.");
      await page.setViewportSize({ width, height });
    }
    await bounds();
    await capture("people-popup");
    if (process.env.VILLAGES_SCREENSHOT_DIR) {
      await backstoryEditor.scrollIntoViewIfNeeded();
      await page.screenshot({ path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `backstory-editor-${width}.png`) });
    }
    await backstoryEditor.getByRole("button", { name: "Use backstory", exact: true }).click();
    await expect(choice).toHaveValue("village");
    await root.getByRole("button", { name: "Finn · Remove", exact: true }).click();
    await expect(root.locator(".villages-backstory-row")).toHaveCount(homeCount - 1);
    await selectResidents(["Finn"]);
    await root.getByRole("button", { name: "Edit Finn backstory", exact: true }).click();
    await expect(past).toHaveValue("Finn has always been guardian of a relic in the observatory.");
    await backstoryEditor.getByRole("button", { name: "Cancel", exact: true }).click();
    // Preserve and repair a partially authored legacy Custom draft after reload.
    if (width === 1366) {
      await forward("Save & exit").click();
      await expect(root.getByRole("button", { name: "Resume founding", exact: true })).toBeVisible();
      await page.reload();
      await page.evaluate(async () => {
        const db = await new Promise((resolve, reject) => {
          const request = indexedDB.open("villages-founding-v2", 1);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        await new Promise((resolve, reject) => {
          const transaction = db.transaction("drafts", "readwrite");
          const cursor = transaction.objectStore("drafts").openCursor();
          cursor.onsuccess = () => {
            const row = cursor.result;
            if (!row) return;
            const saved = row.value;
            saved.data.residentContexts.finn = {
              historyMode: "adapt",
              storyRole: "custom",
              customDescription: "",
              background: "Remembers a former life elsewhere. The observatory's wider world is undecided.",
            };
            row.update({ ...saved, revision: saved.revision + 1 });
            row.continue();
          };
          transaction.oncomplete = resolve;
          transaction.onerror = () => reject(transaction.error);
        });
        db.close();
      });
      await page.reload();
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await root.getByRole("button", { name: "Resume founding", exact: true }).click();
      await expect(choice).toHaveValue("adapt");
      await forward("Continue to place").click();
      await root.getByRole("button", { name: "Edit Finn backstory", exact: true }).click();
      await expect(backstoryEditor.getByLabel("Finn custom place", { exact: true })).toHaveValue("");
      await backstoryEditor.getByRole("button", { name: "Use backstory", exact: true }).click();
      await expect(backstoryEditor.getByRole("alert")).toContainText("Describe their place here");
      await backstoryEditor
        .getByLabel("Finn custom place", { exact: true })
        .fill("Guardian of a relic in the observatory.");
      await backstoryEditor.getByRole("button", { name: "Use backstory", exact: true }).click();
    }
    assert.equal(suggestionCalls, 0);
    assert.equal(imageCalls, 0);
    await bounds();
    await capture("people");
    await forward("Continue to place").click();
    await expect(root).toHaveAttribute("data-step", "1");
    await expect(root.getByText(/Step [1-4] of 4/)).toHaveCount(0);
    await expect(root.getByText("Starting circumstance examples")).toHaveCount(0);
    const circumstance = root.getByLabel("What brings you together?", { exact: true });
    await expect(circumstance).toHaveValue("");
    if (width === 390 && height === 844) {
      const first = await circumstance.getAttribute("placeholder");
      await page.waitForTimeout(4100);
      const second = await circumstance.getAttribute("placeholder");
      assert.notEqual(first, second, "empty circumstance rotates its ghost example after four seconds");
      await page.waitForTimeout(4100);
      const third = await circumstance.getAttribute("placeholder");
      assert.notEqual(third, second);
      assert.notEqual(third, first);
      await expect(circumstance).toHaveValue("");
      assert.equal(suggestionCalls, 0);
      assert.equal(imageCalls, 0);
    }
    await forward("Continue to Venues").click();
    const nameField = root.getByLabel("Village name", { exact: true });
    await expect(nameField).toBeFocused();
    await expect(nameField).toHaveAttribute("aria-invalid", "true");
    await expect(nameField.locator(".. ").getByRole("alert")).toHaveText("Give the village a name.");
    await nameField.fill("Willowbrook");
    await forward("Continue to Venues").click();
    await expect(root.getByLabel("Where are we?", { exact: true })).toBeFocused();
    const help = root.getByRole("button", { name: "Help: Where are we?", exact: true });
    await help.click();
    await expect(help).toHaveAttribute("aria-expanded", "true");
    await expect(root.getByRole("note").filter({ hasText: "surrounding world" })).toBeVisible();
    await help.press("Escape");
    await expect(help).toBeFocused();
    await expect(help).toHaveAttribute("aria-expanded", "false");
    await root
      .getByLabel("Where are we?", { exact: true })
      .fill("A converted seaside observatory with bedrooms along an indoor corridor and one shared telescope hall.");
    await forward("Continue to Venues").click();
    await expect(circumstance).toBeFocused();
    await circumstance.fill("We rented the observatory together because ordinary housing was too expensive.");
    if (width === 390 && height === 844) {
      const hint = await circumstance.getAttribute("placeholder");
      await page.waitForTimeout(4100);
      await expect(circumstance).toHaveValue(
        "We rented the observatory together because ordinary housing was too expensive.",
      );
      assert.equal(await circumstance.getAttribute("placeholder"), hint, "authored text stops placeholder rotation");
    }

    await bounds();
    await capture("place");
    await forward("Back").click();
    await root.getByRole("button", { name: "Edit Finn backstory", exact: true }).click();
    if (width === 1366)
      await expect(backstoryEditor.getByLabel("Finn starting background", { exact: true })).toHaveValue(
        "Remembers a former life elsewhere. The observatory's wider world is undecided.",
      );
    else await expect(past).toHaveValue("Finn has always been guardian of a relic in the observatory.");
    await backstoryEditor.getByRole("button", { name: "Cancel", exact: true }).click();
    await forward("Continue to place").click();
    await forward("Continue to Venues").click();
    await expect(root).toHaveAttribute("data-step", "2");
    const phaseHeading = root.locator(".villages-forging-heading");
    await expect(phaseHeading).toBeVisible();
    assert.equal(await phaseHeading.evaluate((element) => getComputedStyle(element).position), "static");
    await expect(root.getByRole("button", { name: "Arrange automatically", exact: true })).toBeVisible();

    const inspector = root.locator(".villages-workspace-inspector");
    const placementMap = root.locator(".marinara-capability-villages-setup-map-viewport");
    const canvas = placementMap.locator(".marinara-capability-villages-canvas");
    const pins = canvas.locator("button[data-pin-id]");
    const mapView = async () => {
      const back = inspector.getByRole("button", { name: "Return to map", exact: true });
      if (await back.isVisible()) await back.click();
    };
    const open = async (index = 0) => {
      await mapView();
      await pins.nth(index).click();
    };
    const zone = async (name) => {
      await inspector.getByRole("button", { name: "Zones", exact: true }).click();
      await inspector.getByRole("button", { name, exact: true }).click();
    };
    await expect(root.locator(".villages-workspace-list")).toHaveCount(0);
    await forward("Draft starting Venues").click();
    await expect(forward("Draft starting Venues")).toBeEnabled();
    assert.equal(suggestionCalls, 1);
    const spots = Array.from({ length: homeCount + 2 }, (_, i) => ({
      x: homeCount === 3 ? 0.22 + (i % 3) * 0.28 : 0.22 + (i % 2) * 0.56,
      y: i < (homeCount === 3 ? 3 : 2) ? 0.28 : 0.72,
    }));
    for (const spot of spots) {
      const box = await canvas.boundingBox();
      await page.mouse.click(box.x + spot.x * box.width, box.y + spot.y * box.height);
    }
    await expect(pins).toHaveCount(homeCount + 2);
    // A complete suggested draft proceeds without visiting each editor or making image requests.
    await forward("Review village").click();
    await expect(root).toHaveAttribute("data-step", "3");
    assert.equal(imageCalls, 0);
    await forward("Change starting Venues").click();
    await open();
    const narrow = (await root.locator(".villages-workspace").getAttribute("data-narrow")) === "true";
    assert.equal(narrow, width - 24 < 704, "704px available-workspace breakpoint");
    await expect(root.getByRole("dialog")).toHaveCount(narrow ? 1 : 0);
    if (width === 1366) {
      // Resume a legacy modal checkpoint using current authored fields and retained prohibited Zone data.
      await inspector.getByLabel("Venue name", { exact: true }).fill("Legacy current edit");
      await forward("Save & exit").click();
      await page.evaluate(async () => {
        const db = await new Promise((resolve) => {
          const request = indexedDB.open("villages-founding-v2", 1);
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
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await root.getByRole("button", { name: "Resume photograph placement", exact: true }).click();
      await expect(inspector.getByLabel("Venue name", { exact: true })).toHaveValue("Legacy current edit");
      await open(homeCount + 1);
      await zone("Private");
      await expect(inspector.getByText(/previous draft and photographs are kept/)).toBeVisible();
      await open();
      await inspector.getByRole("button", { name: "Venue", exact: true }).click();
    }
    await expect(inspector.getByRole("heading", { name: "Before Review", exact: true })).toHaveCount(0);
    await expect(inspector.getByRole("region", { name: "Details needed before Review", exact: true })).toHaveCount(0);
    await inspector.getByLabel("Venue name", { exact: true }).fill("Autosaved name");
    await expect(root.locator(".villages-forging-saved")).toContainText("Saved");
    if (narrow) {
      const returnButton = inspector.getByRole("button", { name: "Return to map", exact: true });
      await returnButton.focus();
      await page.keyboard.press("Shift+Tab");
      assert.ok(await inspector.evaluate((el) => el.contains(document.activeElement)), "sheet traps keyboard focus");
      await page.keyboard.press("Escape");
      await expect(pins.first()).toBeFocused();
      await open();
      await expect(inspector.getByLabel("Venue name", { exact: true })).toHaveValue("Autosaved name");
    }
    await inspector.getByLabel("Venue name", { exact: true }).fill("My observatory quarters");
    await inspector.getByLabel("Physical form", { exact: true }).fill("Converted observatory room");
    await expect(inspector.getByLabel("Venue Type", { exact: true })).toHaveCount(0);
    await expect(inspector.getByLabel("Assigned villager", { exact: true })).toHaveCount(0);
    await zone("Exterior");
    await inspector
      .getByLabel("Exterior description", { exact: true })
      .fill("A blue door beside the telescope corridor.");
    await expect(inspector.getByLabel("Zone used for", { exact: true })).toHaveCount(0);
    await zone("Common");
    await inspector.getByLabel("Zone appearance", { exact: true }).fill("A quiet sitting room overlooking the sea.");
    await inspector.getByLabel("Zone used for", { exact: true }).fill("Relaxing together");
    await zone("Private");
    await inspector.getByLabel("Zone appearance", { exact: true }).fill("My hammock and traveling journal.");
    await inspector.getByLabel("Include Private Space", { exact: true }).uncheck();
    await expect(inspector.getByLabel("Zone appearance", { exact: true })).toHaveCount(0);
    await zone("Common");
    await inspector.getByLabel("Include Common Space", { exact: true }).click();
    await expect(inspector.getByLabel("Include Common Space", { exact: true })).toBeChecked();
    await expect(inspector.getByRole("alert")).toContainText("At least one");
    await zone("Private");
    await mapView();
    await forward("Save & exit").click();
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await root.getByRole("button", { name: "Resume photograph placement", exact: true }).click();
    await open();
    await zone("Private");
    await expect(inspector.getByLabel("Include Private Space", { exact: true })).not.toBeChecked();
    await inspector.getByLabel("Include Private Space", { exact: true }).check();
    await expect(inspector.getByLabel("Zone appearance", { exact: true })).toHaveValue(
      "My hammock and traveling journal.",
    );
    await inspector.getByLabel("Zone appearance", { exact: true }).fill("");
    await mapView();
    await forward("Review village").click();
    await expect(inspector.getByLabel("Zone appearance", { exact: true })).toBeFocused();
    await expect(inspector.getByRole("alert").filter({ hasText: "Describe the Zone appearance." })).toHaveCSS(
      "color",
      "rgb(255, 155, 165)",
    );
    await inspector.getByLabel("Zone appearance", { exact: true }).fill("My hammock and traveling journal.");
    await open(homeCount + 1);
    await zone("Common");
    await expect(inspector.getByLabel("Include Common Space", { exact: true })).toBeChecked();
    await expect(inspector.getByLabel("Include Common Space", { exact: true })).toBeDisabled();
    await zone("Private");
    await expect(inspector.getByLabel("Include Private Space", { exact: true })).not.toBeChecked();
    await expect(inspector.getByLabel("Include Private Space", { exact: true })).toBeDisabled();
    await expect(inspector.getByLabel("Zone appearance", { exact: true })).toHaveCount(0);
    await open(1);
    await zone("Private");
    await expect(inspector.getByLabel("Zone appearance", { exact: true })).toHaveCount(0);
    await inspector.getByRole("button", { name: "Help: Private interior", exact: true }).click();
    await expect(inspector.getByText(/hidden until invited/)).toBeVisible();
    await open();
    await mapView();
    await forward("Draft starting Venues").click();
    if (width === 1366) {
      await expect.poll(() => !!releaseSuggestion).toBe(true);
      await open();
      await inspector.getByRole("button", { name: "Venue", exact: true }).click();
      await inspector.getByLabel("Physical form", { exact: true }).fill("Authored during suggestion");
      releaseSuggestion();
      await expect(forward("Draft starting Venues")).toBeEnabled();
      await expect(inspector.getByLabel("Physical form", { exact: true })).toHaveValue("Authored during suggestion");
    }
    await mapView();
    await expect(forward("Draft starting Venues")).toBeEnabled();
    assert.equal(suggestionCalls, 2);
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
      await inspector.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      assert.equal((await placementMap.boundingBox()).height, mapHeight);
      // Optional image failures and saved responses keep unrelated editing available.
      await open(1);
      await zone("Common");
      await inspector.getByText("Add photo", { exact: true }).click();
      await inspector.getByRole("button", { name: "Generate image", exact: true }).click();
      await expect(root.getByRole("alert").filter({ hasText: "Optional image unavailable" })).toBeVisible();
      await inspector.getByRole("button", { name: "Generate image", exact: true }).click();
      await expect.poll(() => !!releaseImage).toBe(true);
      await expect(inspector.getByLabel("Zone appearance", { exact: true })).toBeDisabled();
      await expect(forward("Save & exit")).toBeDisabled();
      await open();
      await inspector.getByRole("button", { name: "Venue", exact: true }).click();
      await expect(inspector.getByLabel("Physical form", { exact: true })).toBeEnabled();
      releaseImage();
      await expect(forward("Save & exit")).toBeEnabled();
      await open(1);
      await zone("Common");
      await expect(inspector.locator("img")).toHaveCount(1);
      await forward("Draft starting Venues").click();
      await expect(forward("Draft starting Venues")).toBeEnabled();
      await expect(inspector.locator("img")).toHaveCount(1);
      await zone("Exterior");
      await inspector.getByText("Add photo", { exact: true }).click();
      await inspector.getByRole("button", { name: "Generate image", exact: true }).click();
      await expect(inspector.getByRole("button", { name: "Generate again", exact: true })).toBeVisible();
      await inspector.getByRole("button", { name: "Generate again", exact: true }).click();
      await expect.poll(() => imageCalls === 4).toBe(true);
      await forward("Back").click();
      await root.getByLabel("Village name", { exact: true }).fill("Changed while generating");
      releaseImage();
      await expect(root.getByRole("alert").filter({ hasText: "changed while its image" })).toBeVisible();
      await root.getByLabel("Village name", { exact: true }).fill("Willowbrook");
      await forward("Continue to Venues").click();
      await open(1);
      await zone("Exterior");
      await expect(inspector.locator("img")).toHaveCount(1);
      await mapView();
      // Quota errors keep the current choices visible and prevent a false saved claim.
      await page.evaluate(() => {
        window.draftPut = IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put = function () {
          throw new DOMException("Draft storage full", "QuotaExceededError");
        };
      });
      await forward("Back").click();
      await root.getByLabel("Village name", { exact: true }).fill("Willowbrook revised");
      await expect(root.locator(".villages-forging-saved")).toHaveText("Draft not saved");
      await expect(forward("Continue to Venues")).toBeDisabled();
      await expect(root.getByLabel("Village name", { exact: true })).toHaveValue("Willowbrook revised");
      await forward("Save & exit").click();
      await expect(root).toHaveAttribute("data-step", "1");
      await page.evaluate(() => {
        IDBObjectStore.prototype.put = window.draftPut;
      });
      await forward("Retry saving draft").click();
      await expect(root.locator(".villages-forging-saved")).toContainText("Saved");
      // Another tab's newer revision wins; this tab must not overwrite it.
      const competingTab = await page.context().newPage();
      await competingTab.route("http://villages.test/", (route) =>
        route.fulfill({ status: 200, contentType: "text/html", body: "<title>Competing draft tab</title>" }),
      );
      await competingTab.goto("http://villages.test/");
      await competingTab.evaluate(async () => {
        const db = await new Promise((resolve) => {
          const open = indexedDB.open("villages-founding-v2", 1);
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
      await root.getByLabel("Village name", { exact: true }).fill("Unsaved competing choice");
      await expect(root.getByRole("alert").filter({ hasText: "This draft changed in another tab" })).toBeVisible();
      await forward("Save & exit").click();
      await expect(root.getByLabel("Village name", { exact: true })).toHaveValue("Unsaved competing choice");
      await competingTab.close();
      await page.reload();
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await root.getByRole("button", { name: "Resume founding", exact: true }).click();
      await expect(root.getByLabel("Village name", { exact: true })).toHaveValue("Willowbrook revised");
      await forward("Continue to Venues").click();
    }
    await mapView();
    await bounds();
    await capture("venues");
    if (width === 1366 || (width === 390 && height === 844)) {
      await forward("Back").click();
      await root.getByRole("button", { name: "Generate artwork", exact: true }).click();
      await root.getByLabel("Map layout", { exact: true }).fill("One floor; bedrooms east, telescope hall west.");
      await root.getByRole("button", { name: "Generate map", exact: true }).click();
      await expect.poll(() => !!releaseMap).toBe(true);
      await forward("Continue to Venues").click();
      await expect(root).toHaveAttribute("data-step", "2");
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
      await expect(root.getByRole("alert").filter({ hasText: "The generated map is too large to store." })).toHaveCount(
        0,
      );
      await forward("Continue to Venues").click();
      await expect(root.locator(".villages-forging-placement")).toContainText("Waiting for map artwork");
      // Reload while the provider is still drawing: the resumed draft only reads status.
      await forward("Save & exit").click();
      await page.reload();
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await root.getByRole("button", { name: "Resume photograph placement", exact: true }).click();
      await expect(root.locator(".villages-forging-placement")).toContainText("Waiting for map artwork");
      assert.equal(mapCalls, 2, "resuming an unfinished attempt must not generate again");
      failMapStatus = true;
      await expect(root.getByRole("button", { name: "Check map status", exact: true })).toBeVisible();
      failMapStatus = false;
      releaseMap();
      await root.getByRole("button", { name: "Check map status", exact: true }).click();
      await expect(
        root.getByRole("button", { name: "I checked all Venue photographs against this map", exact: true }),
      ).toBeVisible();
      await forward("Review village").click();
      await expect(root.getByRole("alert")).toContainText("Check all");
      await root.getByRole("button", { name: "I checked all Venue photographs against this map", exact: true }).click();
      await open();
      await inspector.getByRole("button", { name: "Move", exact: true }).click();
      await root
        .getByLabel("Venue placement map. Arrow keys choose a spot; Enter places a Venue.", { exact: true })
        .press("Enter");
      await expect(root.locator(".villages-workspace-toolbar > strong")).toHaveText(
        `${homeCount + 2} / ${homeCount + 2} placed`,
      );
      await capture("artwork-spaces");
      await forward("Save & exit").click();
      await page.reload();
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await expect(root.getByRole("button", { name: "Resume photograph placement", exact: true })).toBeVisible();
      await root.getByRole("button", { name: "Resume photograph placement", exact: true }).click();
      assert.equal(mapCalls, 2, "only deliberate retry generates again; finished artwork is restored on reload");
      await forward("Back").click();
      await expect(root.getByText(/1280 × 720 pixels/)).toBeVisible();
      await root.getByLabel("Map layout", { exact: true }).fill("Same map with updated guidance.");
      await expect(root.getByRole("img", { name: "Selected village map", exact: true })).toBeVisible();
      await root.getByRole("button", { name: "Use this saved artwork", exact: true }).click();
      await forward("Continue to Venues").click();
      await root.getByRole("button", { name: "I checked all Venue photographs against this map", exact: true }).click();
      // A chosen upload replaces paused recovery, even when the old provider finishes later.
      await forward("Back").click();
      failMapStatus = true;
      await root.getByRole("button", { name: "Generate again", exact: true }).click();
      await expect(root.getByRole("button", { name: "Check map status", exact: true })).toBeVisible();
      await root
        .getByRole("group", { name: "Map source", exact: true })
        .getByRole("button", { name: "Upload", exact: true })
        .click();
      const uploadArt = new PNG({ width: 640, height: 640 });
      uploadArt.data.fill(110);
      await root
        .getByLabel("Upload map image", { exact: true })
        .setInputFiles({ name: "chosen-map.png", mimeType: "image/png", buffer: PNG.sync.write(uploadArt) });
      await expect(root.getByText(/640 × 640 pixels/)).toBeVisible();
      await expect(root.getByRole("button", { name: "Check map status", exact: true })).toHaveCount(0);
      failMapStatus = false;
      releaseMap();
      await forward("Continue to Venues").click();
      await root.getByRole("button", { name: "I checked all Venue photographs against this map", exact: true }).click();
      await forward("Save & exit").click();
      await expect(root.getByRole("button", { name: "Resume photograph placement", exact: true })).toBeVisible();
      await page.reload();
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await root.getByRole("button", { name: "Resume photograph placement", exact: true }).click();
      await forward("Back").click();
      await expect(root.getByRole("img", { name: "Selected village map", exact: true })).toBeVisible();
      await expect(root.getByText(/640 × 640 pixels/)).toBeVisible();
      assert.equal(mapCalls, 3, "upload and reload do not dispatch another image request");
      await forward("Continue to Venues").click();
    }
    await forward("Review village").click();
    await expect(root).toHaveAttribute("data-step", "3");
    await expect(root.getByRole("button", { name: "Change people & role", exact: true })).toBeVisible();
    await expect(root.locator(".villages-resident-review").filter({ hasText: "Finn" })).toContainText(
      /[Gg]uardian of a relic/,
    );
    await expect(root.getByRole("button", { name: "Change place & map", exact: true })).toBeVisible();
    await expect(root.getByRole("button", { name: "Change starting Venues", exact: true })).toBeVisible();
    await bounds();
    await expect(root.locator(".marinara-capability-villages-pin-photo-card")).toHaveCount(homeCount + 2);
    await expect(root.locator('[class*="pin-tack"], [class*="photo-tack"]')).toHaveCount(0);
    await capture("review");
    await forward("Found village").click();
    await expect.poll(() => foundingPayload).toBeTruthy();
    assert.equal(foundingPayload.venues.length, homeCount + 2);
    assert.equal(foundingPayload.playerRole.title, "Harbor Patron");
    if (width === 1366) {
      assert.equal(foundingPayload.foundingResidentContexts.finn.storyRole, "custom");
      assert.equal(
        foundingPayload.foundingResidentContexts.finn.customDescription,
        "Guardian of a relic in the observatory.",
      );
      assert.match(foundingPayload.foundingResidentContexts.finn.background, /wider world is undecided/);
    } else {
      assert.equal(foundingPayload.foundingResidentContexts.finn.historyMode, "village");
      assert.equal(foundingPayload.foundingResidentContexts.finn.storyRole, "unspecified");
      assert.match(foundingPayload.foundingResidentContexts.finn.villageBackstory, /always been guardian/);
    }
    assert.equal(foundingPayload.playerRole.explanation, "");
    assert.deepEqual(
      Object.keys(foundingPayload.foundingResidentContexts).sort(),
      foundingPayload.foundingCharacterIds.slice().sort(),
    );
    assert.deepEqual(
      foundingPayload.foundingCharacterIds.slice().sort(),
      ["finn", "rosa", "lee"].slice(0, homeCount).sort(),
    );
    assert.equal(foundingPayload.venues[0].name, "My observatory quarters");
    assert.equal(foundingPayload.venues[0].description, "A blue door beside the telescope corridor.");
    assert.equal(foundingPayload.venues[0].privateSpaces[0].description, "My hammock and traveling journal.");
    assert.ok(foundingPayload.venues.every((venue) => venue.presentation.x !== null && venue.presentation.y !== null));
    assert.ok(
      foundingPayload.venues
        .slice(1, -1)
        .every((venue) => venue.privateSpaces.every((room) => room.description === "" && room.image === null)),
      "private contents stay hidden",
    );
    assert.equal(errors.length, 0, JSON.stringify(errors));
    console.log(`Founding v2: ${width}x${height}, ${homeCount} villagers, saved/resumed, validated.`);
    await context.close();
  }
  await verifyFoundingReopening();
} finally {
  await browser.close();
}
