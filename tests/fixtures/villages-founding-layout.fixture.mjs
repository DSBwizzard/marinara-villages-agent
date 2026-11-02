import assert from "node:assert/strict";
import { resolve } from "node:path";
import { build } from "../../scripts/esbuild.mjs";
import { wantsCase, runCase } from "../../scripts/test-cases.mjs";
import { chromium, withBrowser, mockEngineLookups, fulfill, expect } from "./browser-diagnostics.mjs";
import { foundingFixture } from "./founding-browser.fixture.mjs";
const foundingBundle = await foundingFixture();
const browser = await chromium.launch({ headless: true });
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
    worldRules: "",
    foundingHistory: "",
    circumstances: [],
    communityVenueId: "",
    selectedLorebookIds: [],
    loreTokenBudget: 1600,
    maps: [],
    townMapExpectedWidth: 1536,
    townMapExpectedHeight: 1024,
    townMapGenerationWidth: 1536,
    townMapGenerationHeight: 1024,
    townMapView: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
    villageNameMaxLength: 80,
    settingMaxLength: 4096,
  },
};
const characters = [
  { id: "finn", name: "Finn", summary: "Patient and practical" },
  { id: "rosa", name: "Rosa", summary: "Thoughtful and direct" },
  { id: "lee", name: "Lee, Keeper of the Observatory’s Long Forgotten Archives", summary: "Curious and resourceful" },
];
const personas = [
  { id: "ada", name: "Ada", summary: "A patient observer", isActive: true, avatarPath: null, avatarCrop: null },
];
export async function verifyFoundingLayout(group) {
  await withBrowser(browser, async () => {
    const viewports = [
      { width: 1366, height: 768, fontSize: 16, count: 3, housing: "separate" },
      { width: 1440, height: 650, fontSize: 16, count: 1, housing: "shared" },
      { width: 1917, height: 600, fontSize: 20, count: 3, housing: "custom" },
      { width: 1024, height: 768, fontSize: 20, count: 2, housing: "shared" },
      { width: 727, height: 768, fontSize: 16, count: 1, housing: "separate" },
      { width: 728, height: 768, fontSize: 16, count: 2, housing: "custom" },
      { width: 390, height: 844, fontSize: 16, count: 2, housing: "shared" },
      { width: 320, height: 568, fontSize: 16, count: 1, housing: "separate" },
      { width: 390, height: 650, fontSize: 20, count: 3, housing: "custom" },
    ]
      .filter((row) => !process.env.VILLAGES_VIEWPORT || row.width === Number(process.env.VILLAGES_VIEWPORT))
      .filter((row) =>
        group === "desktop"
          ? row.width >= 600
          : group === "phone"
            ? row.width < 600 && row.height >= 700
            : row.width < 600 && row.height < 700,
      );
    for (const view of viewports) {
      const caseName =
        view.width >= 600
          ? "founding/layout/desktop"
          : view.height < 700
            ? "founding/layout/compact-phone"
            : "founding/layout/phone";
      if (!wantsCase(caseName)) continue;
      await runCase(caseName, async () => {
        const context = await browser.newContext({
          viewport: { width: view.width, height: view.height },
          hasTouch: view.width < 600,
          isMobile: view.width < 600,
        });
        await mockEngineLookups(context);
        const page = await context.newPage();
        let payload,
          suggestions = 0,
          generatedImages = 0;
        const sprites = {};
        await page.route("**/api/villages**", async (route) => {
          const path = new URL(route.request().url()).pathname,
            method = route.request().method();
          const send = (value) =>
            fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(value) });
          if (/\/characters\/[^/]+\/sprites\/setup(?:\/(?:save|settled))?$/.test(path)) {
            const id = decodeURIComponent(path.match(/\/characters\/([^/]+)/)[1]);
            if (path.endsWith("/save")) sprites[id] = (sprites[id] ?? 0) + 1;
            return send({
              revision: sprites[id] ?? 0,
              manager: { version: 1, artwork: [], expressions: [], assignments: [], framing: { mode: "full" } },
              files: [],
              assignments: [],
              defaultArtworkId: "",
              useSprites: false,
              errors: {},
              resident: false,
              residentToken: "",
            });
          }
          if (path.endsWith("/setup/venues/suggest")) {
            suggestions++;
            const body = route.request().postDataJSON();
            assert.equal(body.communityVenueId, "founding-community");
            assert.equal(body.context.rules, "The sun never sets.");
            const result = {
              venues: body.venues.map((row) => {
                const shared = row.residentIds.length + Number(row.playerHome) > 1;
                const layout = row.venueClass === "residence" && !shared ? "both" : "common";
                return {
                  id: row.id,
                  name:
                    row.venueClass === "residence"
                      ? shared
                        ? "Household home"
                        : row.playerHome
                          ? "Your home"
                          : row.residentIds[0] + " home"
                      : "Community Courtyard",
                  form: row.venueClass === "residence" ? "A coastal home" : "An open courtyard",
                  description: "A sheltered approach beside the coast.",
                  layout,
                  commonName: "Common room",
                  commonPurpose: "Conversation and rest",
                  commonDescription: "A comfortable common space.",
                  privateName: layout === "both" ? "Bedroom" : "",
                  privatePurpose: layout === "both" ? "Rest" : "",
                  privateDescription: layout === "both" ? "A quiet sleeping space." : "",
                  connections:
                    layout === "both"
                      ? [
                          ["exterior", "common:base"],
                          ["common:base", "private:base"],
                        ]
                      : [["exterior", "common:base"]],
                };
              }),
            };
            return send(
              body.actionId
                ? { id: body.actionId, sourceKey: body.sourceKey, status: "complete", result, error: "" }
                : result,
            );
          }
          if (path.endsWith("/setup") && method === "POST") {
            payload = route.request().postDataJSON();
            return send(snapshot);
          }
          if (path.includes("/generate")) generatedImages++;
          if (path.endsWith("/personas")) return send({ personas });
          if (path.endsWith("/personas/ada"))
            return send({
              persona: { ...personas[0], description: "A patient observer.", identity: "A patient observer." },
            });
          if (path.endsWith("/connections"))
            return send({ systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" });
          if (path.endsWith("/catalog")) return send({ characters });
          if (path.endsWith("/lorebooks")) return send({ books: [] });
          if (path.endsWith("/image-style-profiles")) return send({ defaultProfileId: "", profiles: [] });
          return send(snapshot);
        });
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
            body:
              '<meta name="viewport" content="width=device-width,initial-scale=1"><style>:root{font-size:' +
              view.fontSize +
              "px;--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}html,body{margin:0;width:100%;height:100%;font-family:Arial,sans-serif}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
          }),
        );
        await page.goto("http://villages.test/");
        await page.addScriptTag({ content: foundingBundle });
        const root = page.locator(".villages-forging-v2"),
          button = (name) => root.getByRole("button", { name, exact: true });
        const bounds = async (phase) => {
          assert.equal(
            await root.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
            true,
            "No horizontal overflow on " + phase,
          );
          await button(
            phase === "setting"
              ? "Continue to People"
              : phase === "people"
                ? "Continue to Venues and Map"
                : phase === "venues"
                  ? "Review village"
                  : "Found village",
          ).scrollIntoViewIfNeeded();
          if (phase === "venues") {
            const map = root.locator(".villages-quick-map");
            assert.ok((await map.boundingBox()).height >= 200, "The actual playable map remains visible on phones");
            await map.scrollIntoViewIfNeeded();
          }
          if (phase === "review") {
            assert.equal(
              await root.evaluate((element) => getComputedStyle(element).overflowY),
              "auto",
              "Review remains scrollable",
            );
            const community = root.locator("details").filter({ hasText: "Community Courtyard" });
            await community.locator("summary").click();
            await community
              .getByText("Community Venue · public and unowned at Founding", { exact: true })
              .scrollIntoViewIfNeeded();
          }
          if (process.env.VILLAGES_SCREENSHOT_DIR)
            await page.screenshot({
              path: resolve(
                process.env.VILLAGES_SCREENSHOT_DIR,
                phase + "-" + view.width + "x" + view.height + "-" + view.housing + ".png",
              ),
            });
        };
        await expect(root).toHaveAttribute("data-step", "0");
        assert.deepEqual(
          await root
            .getByRole("list", { name: "Founding phases" })
            .locator("li")
            .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("aria-label"))),
          ["Setting", "People", "Venues and Map", "Review"],
        );
        await button("Continue to People").click();
        await expect(root.getByLabel("Village Name", { exact: true })).toBeFocused();
        await root.getByLabel("Village Name", { exact: true }).fill("Coastal Community");
        await root
          .getByLabel("Local geography and boundary", { exact: true })
          .fill("An oceanfront expanse between the cliffs and river.");
        await root.getByLabel("Standing world rules", { exact: true }).fill("The sun never sets.");
        await root.getByLabel("Historical backstory", { exact: true }).fill("Families arrived by sea.");
        await bounds("setting");
        await button("Continue to People").click();
        await expect(root).toHaveAttribute("data-step", "1");
        for (const person of characters.slice(0, view.count)) {
          await button("+ Add villager").click();
          const picker = page.getByRole("dialog", { name: "Choose founding villagers", exact: true });
          await picker.getByRole("button", { name: person.name + " · Add", exact: true }).click();
          await page
            .getByRole("dialog", { name: person.name + " sprite setup", exact: true })
            .getByRole("button", { name: "Add without sprites", exact: true })
            .click();
        }
        if (view.housing === "shared") await button("One shared home").click();
        if (view.housing === "custom") await root.getByLabel("Finn household", { exact: true }).selectOption("player");
        await bounds("people");
        await button("Continue to Venues and Map").click();
        await expect(root).toHaveAttribute("data-step", "2");
        assert.equal(suggestions, 0, "Choosing housing never generates suggestions");
        assert.equal(generatedImages, 0, "The simple map requires no model call");
        const expectedHomes = view.housing === "shared" ? 1 : view.housing === "custom" ? view.count : view.count + 1;
        await expect
          .poll(() => page.evaluate(() => window.featureController.setupVenues.length))
          .toBe(expectedHomes + 1);
        await expect(root.getByLabel("Community Venue", { exact: true })).toHaveValue("founding-community");
        await button("Quick Start").click();
        await page
          .getByRole("dialog", { name: "Quick Start", exact: true })
          .getByRole("button", { name: "Cancel", exact: true })
          .click();
        assert.equal(suggestions, 0, "Cancel makes no model request");
        await button("Quick Start").click();
        await page
          .getByRole("dialog", { name: "Quick Start", exact: true })
          .getByRole("button", { name: "Confirm", exact: true })
          .click();
        await expect.poll(() => suggestions).toBe(1);
        await expect
          .poll(() =>
            page.evaluate(() => window.featureController.setupVenues.every((row) => row.name !== "Community Venue")),
          )
          .toBe(true);
        await root.getByRole("button", { name: "Arrange automatically", exact: true }).click();
        await bounds("venues");
        await button("Review village").click();
        await expect(root).toHaveAttribute("data-step", "3");
        await expect(root.getByText("Standing rules: The sun never sets.", { exact: true })).toBeVisible();
        await expect(root.getByText("History: Families arrived by sea.", { exact: true })).toBeVisible();
        await expect(root.getByRole("button", { name: "Community Courtyard", exact: true })).toBeVisible();
        await bounds("review");
        await button("Found village").click();
        await expect.poll(() => payload).toBeTruthy();
        assert.equal(payload.communityVenueId, "founding-community");
        assert.equal(payload.worldRules, "The sun never sets.");
        assert.equal(payload.foundingHistory, "Families arrived by sea.");
        assert.equal(payload.venues.length, expectedHomes + 1);
        const community = payload.venues.find((row) => row.id === payload.communityVenueId);
        assert.equal(community.residentIds.length, 0);
        assert.equal(community.occupancy.playerHome, false);
        const assigned = payload.venues.flatMap((row) => row.residentIds);
        assert.deepEqual(
          assigned.sort(),
          characters
            .slice(0, view.count)
            .map((row) => row.id)
            .sort(),
        );
        assert.equal(generatedImages, 0);
        assert.equal(suggestions, 1);
        await context.close();
      });
    }
    if (group === "desktop") await runCase("founding/reopening", verifyFoundingReopening);
  });
}

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
      const details = "x".repeat(2000);
      const village = structuredClone(snapshot);
      village.isFounded = founded;
      village.settings.foundingHistory = details;
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
      assert.equal(village.settings.foundingHistory, details, "Opening setup preserves saved history");
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
