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
      { width: 2550, height: 1072, fontSize: 16, count: 3, housing: "separate" },
      { width: 1280, height: 584, fontSize: 16, count: 3, housing: "shared" },
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
          generatedImages = 0,
          generationImage,
          mapReceipt;
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
          if (path.endsWith("/maps/generate")) {
            generatedImages++;
            const body = route.request().postDataJSON();
            mapReceipt = {
              id: body.actionId,
              sourceKey: body.sourceKey,
              startedAt: new Date().toISOString(),
              status: "complete",
              error: "",
              result: { image: generationImage, width: 1536, height: 1024 },
            };
            return send({ ...mapReceipt, status: "running", result: null });
          }
          if (path.includes("/maps/generation/founding-map/")) return send(mapReceipt);
          if (path.endsWith("/setup/venues/suggest")) {
            suggestions++;
            const body = route.request().postDataJSON();
            assert.equal(body.communityVenueId, "founding-community");
            assert.equal(body.mode, "quick-start");
            assert.equal(body.draftEntranceImage, undefined);
            assert.equal(body.context.rules, "The sun never sets.");
            const result = {
              ...(body.draftEntranceImage
                ? {
                    entranceImage: {
                      id: "drafted-entrance",
                      ref: "global-gallery:drafted-entrance",
                      url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
                    },
                  }
                : {}),
              venues: body.venues
                .filter((row) => !body.targetVenueId || row.id === body.targetVenueId)
                .map((row) => {
                  const shared = row.residentIds.length + Number(row.playerHome) > 1;
                  const layout = row.venueClass === "residence" && !shared ? "both" : "common";
                  return {
                    ...(body.mode === "draft-venue"
                      ? {
                          zones: [...(body.targetVenue.spaces ?? []), ...(body.targetVenue.privateSpaces ?? [])].map(
                            (zone) => ({
                              id: zone.id,
                              name: zone.name,
                              purpose: zone.purpose,
                              description: "Drafted visible Zone appearance.",
                              private: body.targetVenue.privateSpaces?.some((room) => room.id === zone.id) ?? false,
                              ownerId: zone.ownerId ?? "",
                              connectedTo: zone.connectedTo ?? ["exterior"],
                            }),
                          ),
                        }
                      : {}),
                    id: row.id,
                    name:
                      row.venueClass === "residence"
                        ? shared
                          ? "Household home"
                          : row.playerHome
                            ? "Your home"
                            : (row.residentIds[0] ?? row.id) + " home"
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
        const frame = await root.boundingBox();
        const sheet = page.locator(".villages-quick-dialog");
        const showVenue = async (id) => {
          const previous = root.getByRole("button", { name: "Previous Venues page", exact: true });
          for (let attempt = 0; attempt < 6 && (await previous.count()) > 0 && (await previous.isEnabled()); attempt++)
            await previous.click();
          for (
            let attempt = 0;
            attempt < 6 && !(await root.locator('[data-venue-id="' + id + '"]').isVisible());
            attempt++
          )
            await root.getByRole("button", { name: "Next Venues page", exact: true }).click();
        };
        const editVenue = async (id, tab = "Venue") => {
          await showVenue(id);
          await root.locator('[data-venue-id="' + id + '"]').click();
          await sheet.getByRole("button", { name: tab, exact: true }).click();
        };

        const bounds = async (phase) => {
          assert.deepEqual(await root.boundingBox(), frame, "Founding frame stays the same size across pages");
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
            const widths = await root.locator(".villages-forging-body").evaluate((body) => {
              const style = getComputedStyle(body);
              return {
                available: body.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
                venues: body.querySelector(".villages-quick-start").getBoundingClientRect().width,
              };
            });
            assert.ok(Math.abs(widths.available - widths.venues) <= 1, "Venues use the full Founding content width");
            const map = root.locator(".villages-quick-map");
            assert.ok((await map.boundingBox()).height >= 200, "The actual playable map remains visible on phones");
            await map.scrollIntoViewIfNeeded();
          }
          if (phase === "review") {
            assert.equal(
              await root.locator(".villages-forging-body").evaluate((element) => getComputedStyle(element).overflowY),
              "auto",
              "Review remains scrollable",
            );
            const next = root.getByRole("button", { name: "Next Review Venues page", exact: true });
            for (
              let attempt = 0;
              attempt < 6 && !(await root.locator("details").filter({ hasText: "Community Courtyard" }).count());
              attempt++
            )
              await next.click();
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
          .getByLabel("Local area", { exact: true })
          .fill("An oceanfront expanse between the cliffs and river.");
        await root.getByLabel("World rules", { exact: true }).fill("The sun never sets.");
        await expect(root.getByLabel("Historical backstory", { exact: true })).toHaveCount(0);
        await button("Circumstances").click();
        const circumstance = root.getByRole("textbox", { name: "Starting circumstances", exact: true });
        await expect(circumstance).toHaveCount(1);
        await circumstance.fill("The ferries are delayed. A festival starts tonight.");
        const box = await circumstance.boundingBox(),
          controls = await root.getByRole("group", { name: "Village context", exact: true }).boundingBox();
        assert.ok(box.y - controls.y - controls.height < 80, "Circumstances starts directly below its controls");
        await button("World rules").click();
        await expect(root.getByLabel("Village Timezone", { exact: true })).toHaveCount(0);
        await bounds("setting");
        await button("Continue to People").click();
        await expect(root).toHaveAttribute("data-step", "1");
        for (const person of characters.slice(0, view.count)) {
          await button("+ Add villager").click();
          const picker = page.getByRole("dialog", { name: "Choose founding villagers", exact: true });
          await picker.getByRole("button", { name: person.name + " · Add", exact: true }).click();
        }
        await expect(root.getByRole("region", { name: "Housing", exact: true })).toHaveCount(0);
        const resident = root.locator(".villages-selected-villager").first();
        await resident.getByRole("button", { name: characters[0].name, exact: true }).click();
        const spritePane = page.getByRole("region", { name: characters[0].name + " sprite setup", exact: true });
        await expect(spritePane.getByRole("button", { name: "Use Portrait", exact: true })).toBeEnabled();
        await expect(resident.getByRole("button", { name: "Sprites", exact: true })).toHaveCount(0);
        await spritePane.getByRole("button", { name: "Use Portrait", exact: true }).click();
        await expect(button("Continue to Venues and Map")).toBeEnabled();
        await bounds("people");
        await button("Continue to Venues and Map").click();
        await expect(root).toHaveAttribute("data-step", "2");
        await expect.poll(() => root.evaluate((element) => element.scrollTop)).toBe(0);
        await expect(root.getByRole("region", { name: "Housing", exact: true })).toHaveCount(0);
        await expect(root.getByLabel("Community Venue", { exact: true })).toHaveCount(0);
        await expect(root.getByRole("combobox", { name: /household/i })).toHaveCount(0);
        const mapCanvas = root.locator(".villages-quick-map");
        const marker = mapCanvas.locator('[data-pin-id="founding-home:player"]');
        await marker.scrollIntoViewIfNeeded();
        const beforeDrag = await page.evaluate(
          () => window.featureController.setupVenues.find((row) => row.id === "founding-home:player").presentation,
        );
        const drag = async (dx, dy) => {
          const box = await marker.locator(".marinara-capability-villages-map-point").boundingBox();
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, { steps: 5 });
          await page.mouse.up();
        };
        await drag(24, 12);
        await expect
          .poll(() =>
            page.evaluate(
              () =>
                window.featureController.setupVenues.find((row) => row.id === "founding-home:player").presentation.x,
            ),
          )
          .not.toBe(beforeDrag.x);
        const afterDrag = await page.evaluate(
          () => window.featureController.setupVenues.find((row) => row.id === "founding-home:player").presentation,
        );
        assert.ok(afterDrag.y > beforeDrag.y);
        await expect(sheet).toBeVisible();
        if (view.width >= 1000) {
          const frameBeforeBadDrop = await marker.boundingBox();
          await drag(-frameBeforeBadDrop.x - 100, 0);
          await expect(root.getByRole("alert")).toContainText("inside the map");
          assert.deepEqual(
            await page.evaluate(
              () => window.featureController.setupVenues.find((row) => row.id === "founding-home:player").presentation,
            ),
            afterDrag,
            "Dropping outside the map keeps the previous saved position",
          );
        }
        await drag(12, 0);
        if (view.width === 390) {
          await marker.scrollIntoViewIfNeeded();
          const box = await marker.locator(".marinara-capability-villages-map-point").boundingBox(),
            beforeTouch = await page.evaluate(
              () =>
                window.featureController.setupVenues.find((row) => row.id === "founding-home:player").presentation.x,
            );
          const touch = await context.newCDPSession(page),
            x = box.x + box.width / 2,
            y = box.y + box.height / 2;
          await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] });
          await touch.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + 20, y, id: 1 }] });
          await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
          await touch.detach();
          await expect
            .poll(() =>
              page.evaluate(
                () =>
                  window.featureController.setupVenues.find((row) => row.id === "founding-home:player").presentation.x,
              ),
            )
            .not.toBe(beforeTouch);
        }
        const draggedPosition = await page.evaluate(
          () => window.featureController.setupVenues.find((row) => row.id === "founding-home:player").presentation,
        );
        if (view.width === 2550) {
          await expect(root.locator(".villages-quick-venue-card:visible")).toHaveCount(view.count + 2);
          await page.setViewportSize({ width: view.width, height: 480 });
          await expect
            .poll(() => root.locator(".villages-quick-venue-card:visible").count())
            .toBeLessThan(view.count + 2);
          const nextPage = root.getByRole("button", { name: "Next Venues page", exact: true });
          await nextPage.click();
          const fitting = () =>
            root.locator(".villages-quick-page-viewport").evaluate((view) => {
              const box = view.getBoundingClientRect();
              return [...view.querySelectorAll(".villages-quick-venue-card")]
                .filter((row) => getComputedStyle(row).visibility !== "hidden")
                .every((row) => {
                  const rect = row.getBoundingClientRect();
                  return rect.top >= box.top - 1 && rect.bottom <= box.bottom + 1;
                });
            });
          await expect
            .poll(fitting, { message: "Resized pages keep complete Venue rows inside the available height" })
            .toBe(true);
          await page.setViewportSize({ width: view.width, height: view.height });
          await expect(root.locator(".villages-quick-venue-card:visible")).toHaveCount(view.count + 2);
        }
        assert.equal(await page.evaluate(() => window.featureController.setupVenues.length), view.count + 2);
        await expect(button("Review village")).toBeDisabled();
        await expect(root.getByRole("button", { name: "Simple map", exact: true })).toHaveCount(0);
        await expect(root.getByRole("button", { name: "+ Add home", exact: true })).toHaveCount(0);
        await expect(root.getByRole("button", { name: "+ Add Venue", exact: true })).toHaveCount(0);
        await editVenue("founding-home:player");
        await expect(sheet.getByRole("button", { name: "People", exact: true })).toHaveCount(0);
        await expect(sheet.getByRole("button", { name: "Artwork", exact: true })).toBeHidden();
        await sheet.getByRole("button", { name: "Zones", exact: true }).click();
        await expect(sheet.getByRole("button", { name: "Artwork", exact: true })).toBeVisible();
        const image = await page.evaluate(() => {
          const canvas = document.createElement("canvas");
          canvas.width = 1536;
          canvas.height = 1024;
          const context = canvas.getContext("2d");
          context.fillStyle = "#7fba91";
          context.fillRect(0, 0, 1536, 1024);
          return canvas.toDataURL("image/png").split(",")[1];
        });
        generationImage = "data:image/png;base64," + image;
        if (view.width === 1366) {
          await button("Generate artwork").click();
          await expect.poll(() => page.evaluate(() => window.featureController.setupMapSource)).toBe("generate");
          assert.equal(generatedImages, 1, "Direct generation selects its recovered artwork without a source selector");
        } else
          await root
            .getByLabel("Upload map image", { exact: true })
            .setInputFiles({ name: "map.png", mimeType: "image/png", buffer: Buffer.from(image, "base64") });
        await expect(button("Review village")).toBeEnabled();
        if (view.width === 1366) {
          await button("Exit").click();
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await page.getByRole("button", { name: "Resume founding", exact: true }).click();
          await expect(root).toHaveAttribute("data-step", "2");
          assert.deepEqual(
            await page.evaluate(
              () => window.featureController.setupVenues.find((row) => row.id === "founding-home:player").presentation,
            ),
            draggedPosition,
          );
        }
        await button("Suggest").click();
        await page
          .getByRole("dialog", { name: "Suggest", exact: true })
          .getByRole("button", { name: "Cancel", exact: true })
          .click();
        assert.equal(suggestions, 0);
        await button("Suggest").click();
        await page
          .getByRole("dialog", { name: "Suggest", exact: true })
          .getByRole("button", { name: "Replace and suggest", exact: true })
          .click();
        await expect.poll(() => suggestions).toBe(1);
        await expect
          .poll(() =>
            page.evaluate(
              () => window.featureController.setupVenues.find((row) => row.id === "founding-community").name,
            ),
          )
          .toBe("Community Courtyard");
        assert.ok(
          await page.evaluate(() =>
            window.featureController.setupVenues
              .filter((row) => row.classes.includes("residence"))
              .every((row) => row.residentIds.length + Number(row.occupancy.playerHome) === 1),
          ),
        );
        if (view.width > 1000) {
          const options = await root.getByRole("region", { name: "Starting Venues", exact: true }).boundingBox();
          const map = await root.getByRole("region", { name: "Village map", exact: true }).boundingBox();
          assert.ok(map.x >= options.x + options.width, "Venue map sits beside actual Venue cards on desktop");
          assert.ok(map.width >= options.width, "Playable map gets the larger column");
        }
        await bounds("venues");
        await button("Review village").click();
        await expect(root).toHaveAttribute("data-step", "3");
        await expect(root.getByText("World rules: The sun never sets.", { exact: true })).toBeVisible();

        await bounds("review");
        await button("Found village").click();
        await expect.poll(() => payload).toBeTruthy();
        assert.equal(payload.communityVenueId, "founding-community");
        assert.equal(payload.worldRules, "The sun never sets.");
        assert.deepEqual(payload.circumstances, [
          { scope: "village", summary: "The ferries are delayed. A festival starts tonight.", venueId: "", zoneId: "" },
        ]);
        assert.equal(Object.hasOwn(payload, "foundingHistory"), false);
        assert.equal(
          payload.venues.length,
          view.count + 2,
          "Founding contains only the selected homes and Community Venue",
        );
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
        assert.equal(generatedImages, Number(view.width === 1366));
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
      const details = "x".repeat(4096);
      const village = structuredClone(snapshot);
      village.isFounded = founded;
      village.settings.worldRules = details;
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
      assert.equal(village.settings.worldRules, details, "Opening setup preserves saved standing rules");
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
