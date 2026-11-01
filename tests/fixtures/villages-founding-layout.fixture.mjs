import { mockEngineLookups, fulfill } from "./browser-diagnostics.mjs";
import { foundingFixture } from "./founding-browser.fixture.mjs";
const foundingBundle = await foundingFixture();
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { PNG } from "pngjs";
import { chromium, withBrowser } from "./browser-diagnostics.mjs";
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
    for (const founded of [false, true]) {
      const reason = "custom",
        details = "x".repeat(2000);
      const village = structuredClone(snapshot);
      village.isFounded = founded;
      village.settings.foundingReason = reason;
      village.settings.foundingDetails = details;
      village.settings.foundingGuidance = " Authored narrative direction ";
      const values = await page.evaluate((village) => {
        window.values = {};
        window.openSetup(false, village);
        return window.values;
      }, village);
      if (founded) {
        assert.deepEqual(values, { setScreen: "home" }, "Founded Villages cannot reopen the wizard");
        continue;
      }
      assert.equal(values.setSetupName, "", "Unfounded drafts restore independently");
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
export async function verifyFoundingLayout(group) {
  await withBrowser(browser, async () => {
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
        if (width === 320)
          await page.addInitScript(() => {
            const keyboard = new EventTarget();
            keyboard.overlaysContent = false;
            keyboard.boundingRect = new DOMRect();
            Object.defineProperty(navigator, "virtualKeyboard", { configurable: true, value: keyboard });
          });
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
                defaultArtworkId: "",
                useSprites: false,
                errors: {},
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
                    privateDescription: "A comfortable hammock.",
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
          const overflow = await root.evaluate((element) => {
            const right = element.getBoundingClientRect().right;
            return [...element.querySelectorAll("*")]
              .filter((child) => child.getBoundingClientRect().right > right + 1)
              .slice(0, 5)
              .map((child) => `${child.tagName}.${child.className}`);
          });
          assert.ok(
            await root.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
            `no horizontal overflow: ${overflow}`,
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
        const keyboardOverlay = async (field, container, footer) => {
          if (width >= 600) return;
          const viewport = page.viewportSize();
          const initial = await container.boundingBox();
          const fieldHeight = (await field.boundingBox()).height;
          const footerPosition = () =>
            footer.evaluate((element) => {
              const scroller = element.closest("dialog[open]") ?? element.closest(".villages-forging-v2");
              const bounds = element.getBoundingClientRect();
              return {
                top: bounds.top - scroller.getBoundingClientRect().top + scroller.scrollTop,
                height: bounds.height,
              };
            });
          const before = await footerPosition();
          await field.focus();
          const reducedHeight = Math.round(viewport.height * 0.55);
          const cover = async (bottom) => {
            if (width === 320)
              await page.evaluate((bottom) => {
                const keyboard = navigator.virtualKeyboard;
                keyboard.boundingRect = bottom
                  ? new DOMRect(0, bottom, innerWidth, innerHeight - bottom)
                  : new DOMRect();
                keyboard.dispatchEvent(new Event("geometrychange"));
              }, bottom);
            else await page.setViewportSize({ ...viewport, height: bottom || viewport.height });
          };
          await cover(reducedHeight);
          await expect(container).toHaveAttribute("data-founding-keyboard", "true");
          const after = await container.boundingBox();
          assert.ok(Math.abs(initial.y - after.y) <= 1, "Keyboard does not push the form upward");
          assert.ok(Math.abs(initial.height - after.height) <= 1, "Keyboard does not squeeze the form");
          assert.ok(Math.abs(fieldHeight - (await field.boundingBox()).height) <= 1, "Fields keep their height");
          const footerAfter = await footerPosition();
          assert.ok(
            Math.abs(before.top - footerAfter.top) <= 1,
            `Footer retains its place in the form: ${JSON.stringify({ before, footerAfter, initial, after })}`,
          );
          assert.ok(Math.abs(before.height - footerAfter.height) <= 1, "Footer controls retain their height");
          if (width === 390 && height < 700) {
            await page.evaluate((offset) => {
              Object.defineProperty(visualViewport, "offsetTop", { configurable: true, value: offset });
              visualViewport.dispatchEvent(new Event("scroll"));
            }, viewport.height - reducedHeight);
            await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
            await expect(container).toHaveAttribute("data-founding-keyboard", "true");
            await page.evaluate(() => {
              delete visualViewport.offsetTop;
              visualViewport.dispatchEvent(new Event("scroll"));
            });
          }
          const reachable = async (control) => {
            await control.focus();
            await expect
              .poll(async () => {
                const box = await control.boundingBox();
                return box.y >= 0 && box.y + box.height <= reducedHeight;
              })
              .toBe(true);
          };
          await reachable(footer);
          if (process.env.VILLAGES_SCREENSHOT_DIR)
            await page.screenshot({
              path: resolve(
                process.env.VILLAGES_SCREENSHOT_DIR,
                `keyboard-footer-${width}x${height}-${fontSize}-${(await field.getAttribute("aria-label")) ?? "field"}.png`,
              ),
            });
          await reachable(field);
          await capture("keyboard-" + ((await field.getAttribute("aria-label")) ?? "field").replaceAll(" ", "-"));
          await cover(0);
          await expect(container).not.toHaveAttribute("data-founding-keyboard", "true");
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
        await expect(root.getByRole("note")).toContainText("Estimated token allowance per prompt.");
        await page.keyboard.press("Escape");
        const chooseLore = loreCard.getByRole("button", { name: "Choose Village Lorebooks", exact: true });
        await chooseLore.click();
        const loreDialog = root.getByRole("dialog", { name: "Choose Lorebooks", exact: true });
        const loreSearch = loreDialog.getByRole("searchbox", { name: "Search Lorebooks", exact: true });
        await expect(loreDialog.getByRole("button", { name: "Close Choose Lorebooks", exact: true })).toBeFocused();
        await keyboardOverlay(loreSearch, loreDialog, loreDialog.getByRole("button", { name: "Done", exact: true }));
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
          const system = connectionCard.getByLabel("System", { exact: true });
          await expect(system).toBeVisible();
          holdConnectionSave = true;
          await system.selectOption("");
          await expect.poll(() => heldConnectionSave !== null).toBe(true);
          await forward("Continue to People").click();
          await expect(root).toHaveAttribute("data-step", "0");
          await expect(connectionCard.getByText("Connections are still loading.")).toBeVisible();
          holdConnectionSave = false;
          await fulfill(heldConnectionSave, { status: 503, json: { error: "Save failed" } });
          await expect(system).toBeDisabled();
          await connectionCard.getByRole("button", { name: "Retry", exact: true }).click();
          await expect(system).toBeEnabled();
          await system.selectOption("talk");
          await expect(system).toHaveValue("talk");
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
        await keyboardOverlay(root.getByLabel("Your backstory", { exact: true }), root, forward("Continue to Map"));
        await bounds();
        await capture("people-backgrounds");
        await forward("Save & exit").click();
        if (width === 320)
          await expect
            .poll(
              () => page.evaluate(() => navigator.virtualKeyboard.overlaysContent),
              "Leaving founding restores keyboard behavior",
            )
            .toBe(false);
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
        await expect(mapDialog.getByRole("button", { name: "Simple map", exact: true })).toHaveAttribute(
          "aria-pressed",
          "true",
        );
        await expect(mapDialog.getByRole("img", { name: "Selected village map" })).toHaveAttribute(
          "src",
          /^data:image\/png;base64,/,
        );
        await expect
          .poll(() =>
            mapDialog
              .getByRole("img", { name: "Selected village map" })
              .evaluate((image) => [image.naturalWidth, image.naturalHeight]),
          )
          .toEqual([1536, 1024]);
        assert.equal(mapCalls, 0, "the simple map makes no image request");
        await mapDialog.getByRole("button", { name: "Generate artwork", exact: true }).click();
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
        await expect(mapDialog.getByRole("group", { name: "Map source", exact: true }).getByRole("button")).toHaveCount(
          3,
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
        await keyboardOverlay(mapDetails, root, forward("Continue to Venues"));
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
        if (width > 704) await root.getByRole("button", { name: "Arrange automatically", exact: true }).click();
        else await expect(root.locator(".villages-quick-arrange")).toBeHidden();
        await expect(root.getByRole("button", { name: "Advanced", exact: true })).toHaveCount(0);
        const inspector = root.locator("dialog.villages-quick-dialog");
        const placementMap = root.locator(".marinara-capability-villages-setup-map-viewport");
        const canvas = placementMap.locator(".marinara-capability-villages-canvas");
        const pins = canvas.locator("button[data-pin-id]");
        const selector = root.getByLabel("Move Venue", { exact: true });
        const entries = selector.locator('option:not([value=""])');
        const mapView = async () => {
          if (await inspector.isVisible()) await inspector.getByRole("button", { name: "Done", exact: true }).click();
          await canvas.scrollIntoViewIfNeeded();
        };
        const open = async (index = 0) => {
          if (await inspector.isVisible()) await inspector.getByRole("button", { name: "Done", exact: true }).click();
          await selector.selectOption(await entries.nth(index).getAttribute("value"));
          await root.getByRole("button", { name: "Edit Venue", exact: true }).click();
        };
        const zone = async (name) => {
          await inspector.getByRole("tab", { name: "Zone", exact: true }).click();
          const id = name === "Exterior" ? "exterior" : name === "Common" ? "common:base" : "private:base";
          const navigation = inspector.getByRole("group", { name: "Zone navigation", exact: true });
          for (let n = 0; n < 7; n++) {
            if ((await navigation.getAttribute("data-zone-id")) === id) return;
            await inspector.getByRole("button", { name: "Next Zone", exact: true }).click();
          }
          assert.fail("Missing Zone " + id);
        };
        await expect(entries).toHaveCount(homeCount + 2);
        await expect(root.locator("[class*=pin-photo]")).toHaveCount(0);
        await root.getByRole("button", { name: "Quick Start", exact: true }).click();
        const confirmation = root.getByRole("dialog", { name: "Quick Start", exact: true });
        await expect(confirmation).toBeVisible();
        await confirmation.getByRole("button", { name: "Cancel", exact: true }).click();
        assert.equal(suggestionCalls, 0);
        await root.getByRole("button", { name: "Quick Start", exact: true }).click();
        await confirmation.getByRole("button", { name: "Confirm", exact: true }).click();
        await expect(entries.first()).toHaveText("Your living space");
        assert.equal(suggestionCalls, 1);
        const mapBox = await canvas.boundingBox(),
          bodyBox = await root.locator(".villages-forging-body").boundingBox();
        await capture("map-sizing");
        assert.ok(
          width >= 728
            ? mapBox.height <= 481 && mapBox.width <= 1025 && mapBox.height >= 180
            : mapBox.height >= bodyBox.height * 0.6,
          JSON.stringify({
            mapBox,
            bodyBox,
            containers: await root
              .locator(
                ".villages-quick-start,.villages-quick-map,.villages-forging-map,.marinara-capability-villages-setup-map-viewport",
              )
              .evaluateAll((nodes) =>
                nodes.map((node) => ({
                  class: node.className,
                  height: node.clientHeight,
                  display: getComputedStyle(node).display,
                  flex: getComputedStyle(node).flex,
                })),
              ),
          }),
        );
        const wholePage = await root
          .locator(".villages-forging-body")
          .evaluate((node) => ({ height: node.clientHeight, scroll: node.scrollHeight }));
        assert.ok(wholePage.scroll <= wholePage.height + 1, "The Venue map needs no page scrolling");
        await expect(root.locator('[data-photo-pins="true"]')).toHaveCount(0);
        const playerId = await entries.first().getAttribute("value");
        await selector.selectOption(playerId);
        const playerMarker = canvas.locator('button[data-pin-id="' + playerId + '"]');
        const coordinates = () =>
          playerMarker.evaluate((node) => {
            const point = node.parentElement.getBoundingClientRect(),
              image = node.closest('[class$="-canvas"]').querySelector("img").getBoundingClientRect();
            return { x: (point.left - image.left) / image.width, y: (point.top - image.top) / image.height };
          });
        const beforeNudge = await coordinates();
        await playerMarker.press("ArrowRight");
        await expect
          .poll(async () => Math.round((await coordinates()).x * 10000))
          .toBe(Math.round((beforeNudge.x + 0.01) * 10000));
        const hit = await canvas.evaluate((node) => {
          const box = node.getBoundingClientRect();
          for (const [x, y] of [
            [0.83, 0.84],
            [0.2, 0.8],
            [0.7, 0.25],
            [0.15, 0.15],
          ]) {
            const point = { x: box.x + box.width * x, y: box.y + box.height * y },
              target = document.elementFromPoint(point.x, point.y);
            if (target && node.contains(target) && !target.closest("button")) return point;
          }
          throw Error("No clear map destination");
        });
        const target = await canvas.locator("img").evaluate((node, hit) => {
          const box = node.getBoundingClientRect();
          return {
            x: (hit.x - box.left) / box.width,
            y: (hit.y - box.top) / box.height,
            epsilonX: 1 / box.width + 0.0001,
            epsilonY: 1 / box.height + 0.0001,
          };
        }, hit);
        if (width < 600) await page.touchscreen.tap(hit.x, hit.y);
        else await page.mouse.click(hit.x, hit.y);
        await expect.poll(async () => Math.abs((await coordinates()).x - target.x)).toBeLessThan(target.epsilonX);
        await expect.poll(async () => Math.abs((await coordinates()).y - target.y)).toBeLessThan(target.epsilonY);
        const preserved = await coordinates();
        if (width <= 704) {
          await expect(root.locator(".marinara-capability-villages-map-camera-controls")).toBeHidden();
          const touchClient = await page.context().newCDPSession(page);
          const point = await playerMarker.evaluate((node) => {
            const box = node.parentElement.getBoundingClientRect();
            return { x: box.x, y: box.y };
          });
          const imageWidth = await canvas.locator("img").evaluate((node) => node.getBoundingClientRect().width);
          const touch = (type, points) =>
            touchClient.send("Input.dispatchTouchEvent", {
              type,
              touchPoints: points.map(([x, y], id) => ({ x, y, id })),
            });
          await touch("touchStart", [
            [point.x - 20, point.y],
            [point.x + 20, point.y],
          ]);
          await touch("touchMove", [
            [point.x - 30, point.y],
            [point.x + 30, point.y],
          ]);
          await touch("touchEnd", []);
          await expect
            .poll(() => canvas.locator("img").evaluate((node) => node.getBoundingClientRect().width))
            .toBeGreaterThan(imageWidth);
          await touchClient.detach();
        } else await root.getByRole("button", { name: "Zoom in", exact: true }).click();
        const afterZoom = await coordinates();
        assert.ok(
          Math.abs(preserved.x - afterZoom.x) < 0.0001 && Math.abs(preserved.y - afterZoom.y) < 0.0001,
          "Camera zoom never rewrites Venue coordinates",
        );
        if (width > 704) await root.getByRole("button", { name: "Reset map view", exact: true }).click();
        await capture("venue-map");
        await open();
        if (width <= 704) {
          const sheet = await inspector.boundingBox();
          const done = await inspector.getByRole("button", { name: "Done", exact: true }).boundingBox();
          const footerPadding = await inspector.locator(".villages-quick-footer").evaluate((node) => {
            const style = getComputedStyle(node);
            return { top: parseFloat(style.paddingTop), bottom: parseFloat(style.paddingBottom) };
          });
          assert.ok(Math.abs(footerPadding.top - footerPadding.bottom) <= 1, "Done has balanced padding");
          assert.ok(
            Math.abs(sheet.y + sheet.height - done.y - done.height - footerPadding.bottom) <= 3,
            "Only the matching footer padding remains below Done",
          );
          await zone("Common");
          assert.equal(
            await page.evaluate(() => document.activeElement?.matches("input,textarea")),
            false,
            "Opening Zone never focuses a text field",
          );
          await inspector.getByLabel("Used for", { exact: true }).focus();
          await keyboardOverlay(
            inspector.getByLabel("Used for", { exact: true }),
            inspector,
            inspector.getByRole("button", { name: "Done", exact: true }),
          );
          await inspector.getByRole("tab", { name: "Venue", exact: true }).click();
        }
        await zone("Common");
        const purposeField = inspector.getByLabel("Used for", { exact: true });
        const appearanceField = inspector.getByLabel("Long-term details", { exact: true });
        const originalPurpose = await purposeField.inputValue();
        const originalAppearance = await appearanceField.inputValue();
        await purposeField.fill("");
        await appearanceField.fill("");
        await expect(inspector.getByRole("alert")).toHaveCount(0);
        await inspector.getByRole("button", { name: "Done", exact: true }).click();
        await expect(inspector).toBeVisible();
        await expect(purposeField).toHaveAttribute("aria-invalid", "true");
        await expect(appearanceField).toHaveAttribute("aria-invalid", "true");
        await expect(purposeField.locator("..").getByRole("alert")).toHaveText("Describe what the Zone is used for.");
        await expect(appearanceField.locator("..").getByRole("alert")).toHaveText("Describe the Zone appearance.");
        await expect(inspector.getByLabel("Details needed", { exact: true })).toHaveCount(0);
        await purposeField.fill(originalPurpose);
        await appearanceField.fill(originalAppearance);
        await expect(inspector.getByRole("alert")).toHaveCount(0);
        await inspector.getByRole("button", { name: "Done", exact: true }).click();
        await expect(inspector).toBeHidden();
        await open();
        await inspector.getByLabel("Venue Name", { exact: true }).fill("My observatory quarters");
        await inspector.getByLabel("Physical Form", { exact: true }).fill("Converted observatory room");
        await zone("Exterior");
        await inspector
          .getByLabel("Long-term details", { exact: true })
          .fill("A blue door beside the telescope corridor.");
        await zone("Private");
        await inspector.getByLabel("Long-term details", { exact: true }).fill("My hammock and traveling journal.");
        await open(1);
        await zone("Private");
        await expect(inspector.getByLabel("Room Specification", { exact: true })).toHaveCount(0);
        await inspector
          .getByLabel("Long-term details", { exact: true })
          .fill("A small bedroom with a garden-facing window.");
        await capture("resident-room-specification");
        await mapView();
        await forward("Save & exit").click();
        // Older Advanced-mode drafts open in the current editor without rewriting authored content.
        await page.evaluate(async () => {
          const db = await new Promise((resolve) => {
            const request = indexedDB.open("villages-drafts-v4", 1);
            request.onsuccess = () => resolve(request.result);
          });
          await new Promise((resolve) => {
            const tx = db.transaction("drafts", "readwrite"),
              store = tx.objectStore("drafts"),
              keys = store.getAllKeys();
            keys.onsuccess = () => {
              const get = store.get(keys.result[0]);
              get.onsuccess = () => {
                const saved = get.result;
                saved.data.workspace.mode = "advanced";
                store.put({ ...saved, revision: saved.revision + 1 }, keys.result[0]);
              };
            };
            tx.oncomplete = resolve;
          });
          db.close();
        });
        await page.reload();
        await page.addScriptTag({ content: foundingBundle });
        await root.getByRole("button", { name: "Resume Venue placement", exact: true }).click();
        await expect(root.getByRole("button", { name: "Advanced", exact: true })).toHaveCount(0);
        await expect(entries.first()).toHaveText("My observatory quarters");
        await open();
        await expect(inspector.getByLabel("Physical Form", { exact: true })).toHaveValue("Converted observatory room");
        await zone("Private");
        await expect(inspector.getByLabel("Long-term details", { exact: true })).toHaveValue(
          "My hammock and traveling journal.",
        );
        await mapView();
        assert.equal(suggestionCalls, 1, "resume never generates or replaces Venues");
        const restoredPoint = await coordinates();
        assert.ok(
          Math.abs(restoredPoint.x - preserved.x) < 0.0001 && Math.abs(restoredPoint.y - preserved.y) < 0.0001,
          "Marker movement survives saving and reopening",
        );
        await capture("venue-details");
        if (width === 1366) {
          // Optional image failures and stale replies do not replace authored fields.
          await open(1);
          await zone("Common");
          await inspector.getByRole("button", { name: "Artwork", exact: true }).click();
          let artwork = root.getByRole("dialog", { name: "Artwork for Sitting area", exact: true });
          await artwork.getByRole("button", { name: "Generate image", exact: true }).click();
          await expect(root.getByRole("alert").filter({ hasText: "Optional image unavailable" }).first()).toBeVisible();
          await artwork.getByRole("button", { name: "Generate image", exact: true }).click();
          await expect.poll(() => !!releaseImage).toBe(true);
          await artwork.getByRole("button", { name: "Close artwork", exact: true }).click();
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
          await zone("Common");
          await inspector.getByRole("button", { name: "Artwork", exact: true }).click();
          artwork = root.getByRole("dialog", { name: "Artwork for Sitting area", exact: true });
          await artwork.getByRole("button", { name: "Generate image", exact: true }).click();
          await expect(artwork.getByRole("img", { name: "Artwork for Sitting area", exact: true })).toBeVisible();
          await artwork.getByRole("button", { name: "Close artwork", exact: true }).click();
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
          if (width > 704)
            await expect(root.getByRole("button", { name: "Arrange automatically", exact: true })).toBeVisible();
          else await expect(root.locator(".villages-quick-arrange")).toBeHidden();
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
          await root.getByRole("button", { name: "Resume Venue placement", exact: true }).click();
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
          await expect(selector).toBeVisible();
          await capture("artwork-spaces");
          await forward("Save & exit").click();
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await expect(root.getByRole("button", { name: "Resume Venue placement", exact: true })).toBeVisible();
          await root.getByRole("button", { name: "Resume Venue placement", exact: true }).click();
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
          await expect(root.getByRole("button", { name: "Resume Venue placement", exact: true })).toBeVisible();
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await root.getByRole("button", { name: "Resume Venue placement", exact: true }).click();
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
                name: legacyStep === 2 ? "Resume Venue placement" : "Resume founding",
                exact: true,
              })
              .click();
            await expect(root).toHaveAttribute("data-step", String(legacyStep + 1));
            await expect(root.locator(".marinara-capability-villages-explore-marker").first()).toBeVisible();
            await expect(root.locator("[class*=pin-photo]")).toHaveCount(0);
            if (legacyStep === 2) await forward("Review village").click();
            assert.equal(mapCalls, 3, "legacy resume does not generate new artwork");
          }
        }
        await expect(root.getByRole("button", { name: "Change starting Venues", exact: true })).toBeVisible();
        await bounds();
        await expect(root.locator(".marinara-capability-villages-explore-marker").first()).toBeVisible();
        await expect(root.locator("[class*=pin-photo]")).toHaveCount(0);
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
        assert.equal(foundingPayload.venues[0].name, "My observatory quarters");
        assert.equal(foundingPayload.venues[0].description, "A blue door beside the telescope corridor.");
        assert.equal(foundingPayload.venues[0].privateSpaces[0].description, "My hammock and traveling journal.");
        assert.equal(
          foundingPayload.venues[1].privateSpaces[0].description,
          "A small bedroom with a garden-facing window.",
        );
        assert.ok(
          foundingPayload.venues.every((venue) => venue.presentation.x !== null && venue.presentation.y !== null),
        );
        assert.ok(
          foundingPayload.venues
            .slice(1, -1)
            .every((venue) => venue.privateSpaces.every((room) => !!room.description && room.image === null)),
          "resident interior details survive founding",
        );
        assert.equal(errors.length, 0, JSON.stringify(errors));
        console.log(`Founding v2: ${width}x${height}, ${homeCount} villagers, saved/resumed, validated.`);
        await context.close();
      });
    }
    if (group === "desktop") await runCase("founding/reopening", verifyFoundingReopening);
  });
}
