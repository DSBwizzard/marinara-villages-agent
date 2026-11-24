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
    openingVenueId: "",
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
        const daylight = view.height >= 768 || view.width === 1280;
        snapshot.village.timeZone = "UTC";
        snapshot.village.instant = daylight ? "2026-11-20T12:00:00.000Z" : "2026-11-20T00:00:00.000Z";
        const context = await browser.newContext({
          viewport: { width: view.width, height: view.height },
          hasTouch: view.width < 600,
          isMobile: view.width < 600,
          reducedMotion: view.height === 650 ? "reduce" : "no-preference",
        });
        const draftWithLore = view.width === 1280 || view.width === 390;
        const worldBrief = "The Relay Belt is a chain of settlements on old cargo routes.";
        await mockEngineLookups(context);
        let portraitReads = 0;
        await context.route("**/api/characters/summaries", (route) => {
          portraitReads++;
          return fulfill(route, {
            json: characters.slice(0, 2).map((person) => ({
              id: person.id,
              avatarUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
            })),
          });
        });
        const page = await context.newPage();
        if (view.width === 390 && view.height === 844)
          await page.addInitScript(() => {
            const viewport = new EventTarget();
            Object.assign(viewport, { height: innerHeight, width: innerWidth, offsetTop: 0 });
            Object.defineProperty(window, "visualViewport", { configurable: true, value: viewport });
          });
        let setupPosts = 0;
        let payload,
          suggestions = 0,
          settingReceipt,
          settingCalls = 0,
          settingReady = false,
          failVenueConnection = false,
          failMapGeneration = false,
          holdConnectionRead = false,
          connectionReadHeld = false,
          generatedImages = 0,
          generationImage,
          mapReceipt;
        const artRequests = [];
        let modelSelection = { systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" };
        const connectionRows = [
          { id: "talk", name: "Language model", provider: "language", defaultForAgents: true },
          { id: "alt-talk", name: "Draft model", provider: "language" },
          {
            id: "image",
            name: "Image model",
            provider: "image_generation",
            profileImportReviewRequired: view.width !== 2550,
          },
        ];
        await page.route("**/api/villages**", async (route) => {
          const path = new URL(route.request().url()).pathname,
            method = route.request().method();
          const send = (value) =>
            fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(value) });
          if (path.endsWith("/settings") && method === "PATCH") {
            Object.assign(snapshot.settings, route.request().postDataJSON());
            return send(snapshot);
          }
          if (/\/characters\/[^/]+\/sprites\/setup\/settled$/.test(path)) {
            return send({
              revision: 0,
              token: "appearance",
              manager: { version: 1, artwork: [], expressions: [], assignments: [], framing: { mode: "full" } },
              files: [],
              folders: [],
            });
          }
          if (path.endsWith("/maps/generate")) {
            generatedImages++;
            const body = route.request().postDataJSON();
            artRequests.push({ target: "map", ...body });
            mapReceipt = {
              id: body.actionId,
              sourceKey: body.sourceKey,
              startedAt: new Date().toISOString(),
              status: failMapGeneration ? "failed" : "complete",
              error: failMapGeneration ? "Map artwork could not be generated." : "",
              result: failMapGeneration ? null : { image: generationImage, width: 1536, height: 1024 },
            };
            return send({ ...mapReceipt, status: "running", result: null });
          }
          if (path.includes("/maps/generation/founding-map/")) return send(mapReceipt);
          if (settingReceipt && path.endsWith("/setup/venues/suggestions/" + settingReceipt.id))
            return send(settingReady ? settingReceipt : { ...settingReceipt, status: "running", result: null });
          if (path.endsWith("/setup/venues/suggest")) {
            const body = route.request().postDataJSON();
            if (body.mode === "draft-setting") {
              settingCalls++;
              assert.equal(
                body.brief,
                settingCalls === 1 ? "Our village is a converted cargo ship." : "Our village is inside a dumpster.",
              );
              assert.deepEqual(Object.keys(body).sort(), [
                "actionId",
                "brief",
                "loreTokenBudget",
                "mode",
                "selectedLorebookIds",
                "sourceKey",
                "villageName",
                "worldBrief",
                "worldRules",
              ]);
              assert.equal(body.worldRules, "The sun never sets.");
              assert.equal(body.villageName, "Coastal Community");
              assert.deepEqual(body.selectedLorebookIds, ["relay-belt"]);
              assert.equal(body.worldBrief, worldBrief);
              assert.equal(body.loreTokenBudget, 1600);
              settingReceipt = {
                id: body.actionId,
                sourceKey: body.sourceKey,
                status: "complete",
                error: "",
                result: {
                  venues: [],
                  setting:
                    settingCalls === 1
                      ? {
                          name: "Wayfarer",
                          startingLocationName: "Main Deck",
                          description: "A shared galley aboard a cargo ship.",
                          worldName: "",
                          rules: "",
                        }
                      : {
                          name: "Glimmerdump",
                          startingLocationName: "Scavenger Rim",
                          description: "Lanterns hang from the lip of the bin. ".repeat(90),
                          worldName: "",
                          rules: "",
                        },
                },
              };
              if (settingCalls === 2) return send(settingReceipt);
              return send({ ...settingReceipt, status: "running", result: null });
            }
            suggestions++;
            if (failVenueConnection)
              return send({
                id: body.actionId,
                sourceKey: body.sourceKey,
                status: "failed",
                result: null,
                error: "Language model connection not found: stale-model-id",
              });
            assert.equal(body.openingVenueId, "founding-community");
            assert.equal(body.mode, "draft-plan");
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
                  const layout = (row.playerHome || !!row.residentIds?.length) && !shared ? "both" : "common";
                  return {
                    ...(["draft-venue", "draft-plan"].includes(body.mode)
                      ? {
                          zones: [
                            ...((body.targetVenue ?? body.sourceVenues.find((source) => source.id === row.id)).spaces ??
                              []),
                            ...((body.targetVenue ?? body.sourceVenues.find((source) => source.id === row.id))
                              .privateSpaces ?? []),
                          ].map((zone) => ({
                            id: zone.id,
                            name: zone.name,
                            purpose: zone.purpose,
                            description: "Drafted visible Zone appearance.",
                            private:
                              (
                                body.targetVenue ?? body.sourceVenues.find((source) => source.id === row.id)
                              ).privateSpaces?.some((room) => room.id === zone.id) ?? false,
                            ownerId: zone.ownerId ?? "",
                            connectedTo: zone.connectedTo ?? ["exterior"],
                          })),
                        }
                      : {}),
                    id: row.id,
                    name:
                      row.playerHome || !!row.residentIds?.length
                        ? shared
                          ? "Household home"
                          : row.playerHome
                            ? "Your home"
                            : (row.residentIds[0] ?? row.id) + " home"
                        : row.id === "founding-garden"
                          ? "Community Garden"
                          : "Community Courtyard",
                    form: row.playerHome || !!row.residentIds?.length ? "A coastal home" : "An open courtyard",
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
            setupPosts++;
            if (view.width === 1366 && setupPosts === 1)
              return fulfill(route, {
                status: 503,
                contentType: "application/json",
                body: JSON.stringify({ error: "Fixture founding failure." }),
              });
            payload = route.request().postDataJSON();
            return send(snapshot);
          }
          if (path.endsWith("/setup/venue-image/generate")) {
            generatedImages++;
            artRequests.push({ target: "venue", ...route.request().postDataJSON() });
            return send({ id: "zone-art", ref: "global-gallery:zone-art", url: generationImage });
          }
          if (path.includes("/generate")) generatedImages++;
          if (path.endsWith("/personas")) return send({ personas });
          if (path.endsWith("/personas/ada"))
            return send({
              persona: { ...personas[0], description: "A patient observer.", identity: "A patient observer." },
            });
          if (path.endsWith("/connections")) {
            if (method === "PUT") modelSelection = { ...modelSelection, ...route.request().postDataJSON() };
            if (method === "GET" && holdConnectionRead) {
              connectionReadHeld = true;
              return;
            }
            return send(modelSelection);
          }
          if (path.endsWith("/catalog"))
            return send({
              characters: [...characters, { id: "__professor_mari__", name: "Professor Mari", summary: "Your guide" }],
            });
          if (path.endsWith("/lorebooks"))
            return send({
              books: [
                { id: "relay-belt", name: "Relay Belt", enabled: true },
                ...Array.from({ length: 17 }, (_, index) => ({
                  id: `archive-${index}`,
                  name: index === 1 ? "NOODLE Othiras Character Relationships" : `Community archive ${index + 1}`,
                  enabled: index !== 0,
                })),
              ],
            });
          if (path.endsWith("/image-style-profiles"))
            return send({ defaultProfileId: "fixture-ink", profiles: [{ id: "fixture-ink", name: "Ink" }] });
          return send(snapshot);
        });
        await page.route("**/api/connections", (route) =>
          fulfill(route, {
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(connectionRows),
          }),
        );
        await page.route("http://villages.test/", (route) =>
          fulfill(route, {
            status: 200,
            contentType: "text/html",
            body:
              '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>:root{font-size:' +
              view.fontSize +
              "px;--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}html,body{margin:0;width:100%;height:100%;font-family:Arial,sans-serif}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
          }),
        );
        await page.goto("http://villages.test/");
        await page.addScriptTag({ content: foundingBundle });
        const root = page.locator(".villages-forging-v2"),
          button = (name) => root.getByRole("button", { name, exact: true });
        const palette = (day) => ({
          ink: day ? "rgb(33, 62, 54)" : "rgb(240, 223, 188)",
          panel: day ? "rgb(212, 229, 222)" : "rgb(57, 48, 71)",
          card: day ? "rgb(218, 231, 210)" : "rgb(81, 65, 87)",
          primary: day ? "rgb(65, 107, 87)" : "rgb(150, 155, 126)",
        });
        const checkPalette = async (day = daylight) => {
          await expect(root).toHaveAttribute("data-lighting", day ? "day" : "night");
          await expect(root).toHaveCSS("color", palette(day).ink);
          for (const panel of await root
            .locator(".villages-setting-dialogue,dialog[open],.villages-forging-card:not(.villages-quick-map-panel)")
            .all()) {
            if (await panel.isVisible()) await expect(panel).toHaveCSS("background-color", palette(day).panel);
          }
          for (const primary of await root.locator(".villages-forging-primary").all()) {
            if (await primary.isVisible()) await expect(primary).toHaveCSS("background-color", palette(day).primary);
          }
          for (const row of await root.locator(".villages-selected-villager").all())
            await expect(row).toHaveCSS("background-color", palette(day).card);
        };
        const setDaylight = async (day) => {
          await page.evaluate(
            (day) =>
              window.featureController.setSnapshot((current) => ({
                ...current,
                village: {
                  ...current.village,
                  timeZone: "UTC",
                  instant: day ? "2026-11-20T12:00:00.000Z" : "2026-11-20T00:00:00.000Z",
                },
              })),
            day,
          );
          await checkPalette(day);
        };
        const phone = view.width <= 727;
        const work = root.locator(".villages-forging-body");
        const finishPassage = async (guide = root, direction = 1) => {
          const passages = [];
          for (let attempt = 0; attempt < 30; attempt++) {
            const reader = guide.locator(".villages-setting-dialogue:visible").first();
            if (!(await reader.count())) return passages.join("");
            if (await reader.evaluate((node) => !!node.closest('[inert],[aria-hidden="true"]')))
              return passages.join("");
            passages.push(await guide.locator('p[aria-live="polite"]').textContent());
            if ((await reader.getAttribute(direction === 1 ? "data-reader-next-page" : "data-reader-page")) === null)
              return passages.join("");
            await guide.getByRole("button", { name: direction === 1 ? "Next" : "Back", exact: true }).click();
          }
          assert.fail("Reading pages did not reach their boundary");
        };
        const advance = async () => {
          await finishPassage();
          await button("Next").click();
        };
        const retreat = async () => {
          await finishPassage(root, -1);
          await button("Back").click();
        };
        const enterChapter = async () => {
          const guide = root.locator(".villages-chapter-guide");
          if (await root.locator("[data-explanation]").count()) {
            const introduction = guide.getByText(/^Add or draft your Venues/);
            await expect(introduction).toBeVisible();
            await expect(work).toHaveCount(0);
            await layer("Venue");
            await expect(hierarchy).toBeInViewport({ ratio: 1 });
            await expect(button("Back")).toBeInViewport({ ratio: 1 });
            await expect(button("Next")).toBeInViewport({ ratio: 1 });
            await retreat();
            await expect(root).toHaveAttribute("data-step", "2");
            await expect(root.getByRole("region", { name: "Map artwork preview" })).toBeVisible();
            await advance();
            await expect(introduction).toBeVisible();
            await expect(work).toHaveCount(0);
            await expect(button("Next")).toBeInViewport({ ratio: 1 });
            if (process.env.VILLAGES_SCREENSHOT_DIR)
              await page.screenshot({
                path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `venue-intro-${view.width}.png`),
              });
            await finishPassage(guide);
            if (view.width === 1366) {
              const move = await page.evaluate(async () => {
                const root = document.querySelector(".villages-forging-v2");
                const stage = root.querySelector(".villages-setting-stage");
                const original = stage.getBoundingClientRect().toJSON();
                root.querySelector(".villages-founding-replies button:last-child").click();
                await new Promise(requestAnimationFrame);
                const body = root.querySelector(".villages-forging-body");
                const dialogue = root.querySelector(".villages-chapter-guide .villages-setting-dialogue");
                const dialogueStart = dialogue.getBoundingClientRect().toJSON();
                const slide = stage.getAnimations()[0];
                const reveal = body.getAnimations()[0];
                const speech = root.querySelector(".villages-chapter-guide").getAnimations()[0];
                slide.pause();
                reveal.pause();
                speech.pause();
                slide.currentTime = 0;
                reveal.currentTime = 0;
                speech.currentTime = 0;
                const start = stage.getBoundingClientRect().toJSON();
                slide.currentTime = 110;
                reveal.currentTime = 110;
                speech.currentTime = 110;
                const middle = stage.getBoundingClientRect().toJSON();
                const dialogueMiddle = dialogue.getBoundingClientRect().toJSON();
                const mapHidden = getComputedStyle(body).visibility === "hidden";
                const dialogueHidden = getComputedStyle(dialogue).visibility === "hidden";
                slide.finish();
                speech.finish();
                const end = stage.getBoundingClientRect().toJSON();
                const dialogueEnd = dialogue.getBoundingClientRect().toJSON();
                reveal.finish();
                const dialogueVisible = getComputedStyle(dialogue).visibility === "visible";
                return {
                  original,
                  start,
                  middle,
                  end,
                  mapHidden,
                  dialogueStart,
                  dialogueMiddle,
                  dialogueEnd,
                  dialogueHidden,
                  dialogueVisible,
                };
              });
              assert.ok(Math.abs(move.start.x - move.original.x) < 1, "Mari starts at her teaching position");
              assert.ok(move.end.x < move.middle.x && move.middle.x < move.start.x, "Mari slides left continuously");
              assert.ok(move.mapHidden, "The map waits until Mari has moved aside");
              assert.ok(
                move.dialogueHidden && move.dialogueVisible,
                "Dialogue appears only after Mari finishes sliding",
              );
              assert.deepEqual(
                move.dialogueStart,
                move.dialogueMiddle,
                "The dialogue appears at its normal size and position",
              );
              assert.deepEqual(move.dialogueMiddle, move.dialogueEnd, "Only Mari moves during the transition");
            } else await advance();
            await expect(work).toBeVisible();
            if (phone || view.height === 650)
              assert.equal(
                await root.locator(".villages-setting-stage").evaluate((stage) => stage.getAnimations().length),
                0,
                "Phone and reduced-motion layouts do not slide Mari",
              );
          }
          if (!phone || !(await root.locator("dialog.villages-chapter-menu[open]").count())) {
            const currentLayer = { 2: "Map", 3: "Venue" }[await root.getAttribute("data-step")];
            if (!phone && (currentLayer === "Map" || currentLayer === "Venue")) {
              await expect(hierarchy).toHaveCount(0);
            } else if (currentLayer) {
              await layer(currentLayer);
              await expect(hierarchy).toBeInViewport({ ratio: 1 });
              if (phone && process.env.VILLAGES_SCREENSHOT_DIR)
                await page.screenshot({
                  path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `hierarchy-${currentLayer}-${view.width}.png`),
                });
            }
          }
          if (!phone || (await root.locator("dialog.villages-chapter-menu[open]").count())) return;
          await expect(work).toBeHidden();
          await expect(guide.getByText("Professor Mari", { exact: true })).toBeVisible();
          await finishPassage(guide);
          await expect(button("Next")).toBeInViewport({ ratio: 1 });
          await advance();
          await expect(root.locator("dialog.villages-chapter-menu[open]")).toBeVisible();
          await expect(work).toBeVisible();
        };
        const settingNext = () => button("Next");
        const frame = await root.boundingBox();
        const sheet = page.locator(".villages-quick-dialog");
        const parentVenue = async () => {
          const back = sheet.locator(".marinara-capability-villages-venue-navigation button");
          for (let step = 0; step < 6; step++) {
            await expect(back).toBeVisible();
            if (
              (await sheet.getByRole("navigation", { name: "Venue sections" }).count()) ||
              /^← (Map|Venues)$/.test(await back.innerText())
            )
              return;
            await back.click();
          }
        };
        const closeVenue = async () => {
          await parentVenue();
          await sheet.getByRole("button", { name: /^← (Map|Venues)$/ }).click();
        };
        const showMap = async () => {
          if (phone && (await sheet.count())) await closeVenue();
        };
        const showVenuePin = async (id) => {
          if (!phone) return;
          const navigation = root.getByRole("group", { name: "Map navigation" });
          await navigation.press("Home");
          await navigation.evaluate(() => new Promise(requestAnimationFrame));
          const point = await page.evaluate(
            (id) => window.featureController.setupVenues.find((row) => row.id === id).presentation,
            id,
          );
          for (const [axis, negative, positive] of [
            ["x", "ArrowLeft", "ArrowRight"],
            ["y", "ArrowUp", "ArrowDown"],
          ]) {
            const steps = Math.round((point[axis] - 0.5) / 0.05);
            for (let step = 0; step < Math.abs(steps); step++) {
              await navigation.press(steps < 0 ? negative : positive);
              await navigation.evaluate(() => new Promise(requestAnimationFrame));
            }
          }
        };
        const editVenue = async (id) => {
          if (await sheet.count()) await closeVenue();
          await showVenuePin(id);
          await root.locator(`[${phone ? "data-pin-id" : "data-venue-id"}="${id}"]`).click();
        };
        const editProfile = async () => {
          const edit = sheet.getByRole("button", { name: "Edit", exact: true });
          if (await edit.count()) await edit.click();
        };
        const manageVenue = async () => {
          await parentVenue();
          await sheet.getByRole("button", { name: "About", exact: true }).click();
          await editProfile();
        };

        const bounds = async (phase) => {
          await checkPalette();
          await expect
            .poll(() =>
              stage.evaluate((node) => node.getAnimations().some((animation) => animation.playState === "running")),
            )
            .toBe(false);
          assert.deepEqual(await root.boundingBox(), frame, "Founding frame stays the same size across pages");
          assert.equal(
            await root.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
            true,
            "No horizontal overflow on " + phase,
          );
          const desktopMap = !phone && (phase === "maps" || phase === "venues" || phase === "review");
          if (!desktopMap)
            assert.deepEqual(await stage.boundingBox(), stageBounds, "Mari returns to her teaching mark");
          if (phase !== "setting" && !phone) {
            const guide = root.locator(".villages-chapter-guide");
            const sprite = await expectPose(
              { people: "happy", maps: "playful", venues: "playful", zones: "playful", review: "proud" }[phase],
            );
            const workBox = await root.locator(".villages-forging-body").boundingBox();
            const spriteBox = await sprite.boundingBox();
            const dialogueBox = await guide.locator(".villages-setting-dialogue").boundingBox();
            assert.ok(dialogueBox.x + dialogueBox.width < workBox.x, "The dialogue stays clear of the workspace");
            if (desktopMap) {
              const stageBox = await stage.boundingBox();
              assert.ok(stageBox.x + stageBox.width / 2 < stageBounds.x + stageBounds.width / 2 - frame.width * 0.06);
              assert.ok(spriteBox.x + spriteBox.width < workBox.x, "Mari leaves the map workspace clear");
              assert.ok(spriteBox.y + spriteBox.height >= frame.y + frame.height * 0.88, "Mari stands on the terrace");
              assert.ok(dialogueBox.y + dialogueBox.height <= spriteBox.y + 4, "The dialogue stays above Mari’s face");
            } else {
              assert.ok(spriteBox.x + spriteBox.width <= dialogueBox.x + 1, "Mari stands beside her dialogue");
            }
            if (process.env.VILLAGES_SCREENSHOT_DIR)
              await page.screenshot({
                path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `${phase}-mari-${view.width}.png`),
              });
          }
          await (phase === "review" ? button("Next") : settingNext()).scrollIntoViewIfNeeded();
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
            assert.ok((await map.boundingBox()).height >= 200, "The playable map keeps enough room to place markers");
            await map.scrollIntoViewIfNeeded();
          }
          if (phase === "review") {
            const overview = root.locator(".villages-founding-review");
            assert.equal(
              await overview.evaluate((node) => node.scrollHeight <= node.clientHeight + 1),
              true,
              "The complete overview fits without scrolling",
            );
            for (const section of await overview.locator(".villages-review-card,.villages-review-actions").all()) {
              await expect(section).toBeInViewport({ ratio: 0.99 });
              assert.equal(
                await section.evaluate((node) => node.scrollHeight <= node.clientHeight + 1),
                true,
                "Review sections keep their contents inside their cards",
              );
            }
            await expect(overview.locator("details")).toHaveCount(0);
          }
          if (process.env.VILLAGES_SCREENSHOT_DIR)
            await page.screenshot({
              path: resolve(
                process.env.VILLAGES_SCREENSHOT_DIR,
                phase + "-" + view.width + "x" + view.height + "-" + view.housing + ".png",
              ),
            });
          if (phase === "people" && process.env.VILLAGES_SCREENSHOT_DIR) {
            await setDaylight(!daylight);
            await page.screenshot({
              path: resolve(
                process.env.VILLAGES_SCREENSHOT_DIR,
                `people-${!daylight ? "day" : "night"}-${view.width}.png`,
              ),
            });
            await setDaylight(daylight);
          }
        };
        await expect(root).toHaveAttribute("data-step", "0");
        const start = button("START");
        await expect(root.getByRole("heading", { name: "Villages", exact: true })).toBeInViewport({ ratio: 1 });
        await expect(start).toBeInViewport({ ratio: 1 });
        await expect(root.getByRole("region", { name: "Professor Mari", exact: true })).toHaveCount(0);
        await expect(root.getByRole("list", { name: "Founding phases" })).toHaveCount(0);
        const title = root.locator(".villages-founding-title");
        const stage = root.locator(".villages-setting-stage");
        const expectPose = async (pose) => {
          const sprite = stage.locator(`img[src$="mari-founding-${pose}.webp"]`);
          await expect(sprite).toHaveAttribute("data-flipping", "false");
          await expect(sprite).toHaveJSProperty("naturalHeight", 600);
          return sprite;
        };
        const sidePose = await expectPose("looking-up");
        await expect(sidePose).toBeInViewport({ ratio: 0.999 });
        const sideBounds = await sidePose.boundingBox();
        const titleBounds = await title.boundingBox();
        const stageBounds = await stage.boundingBox();
        if (phone) {
          assert.ok(
            stageBounds.height >= Math.min(frame.height * 0.56, frame.width * 0.99),
            "Mari fills the phone stage at full-body scale",
          );
          const backdropHeight = await root.evaluate((element) => {
            const probe = document.createElement("div");
            probe.style.cssText = "position:absolute;visibility:hidden";
            probe.style.height = getComputedStyle(element)
              .backgroundSize.split(/,\s*auto /)
              .at(-1);
            element.append(probe);
            const height = probe.getBoundingClientRect().height;
            probe.remove();
            return height;
          });
          assert.ok(backdropHeight >= frame.height);
          const frameBottom = frame.y + frame.height;
          const cropLeft = (1311 - (frame.width * 820) / backdropHeight) / 2;
          const wallBase = frameBottom - (backdropHeight * (820 - 635)) / 820;
          const skyline = frameBottom - (backdropHeight * (820 - 425)) / 820;
          assert.ok(skyline >= frame.y + frame.height * 0.28, "The phone crop leaves room for the sky");
          assert.ok(cropLeft >= 148, "The centered crop keeps the lamp post offscreen");
          assert.ok(
            stageBounds.y + stageBounds.height >= wallBase + 8,
            "Mari stands forward of the wall on the paving",
          );
        }
        assert.ok(
          phone
            ? titleBounds.x + titleBounds.width <= sideBounds.x &&
                titleBounds.y < sideBounds.y + sideBounds.height &&
                titleBounds.y + titleBounds.height > sideBounds.y
            : sideBounds.x + sideBounds.width <= titleBounds.x,
          "The title sits beside Mari",
        );
        const titleBackdrop = await root.evaluate((element) => getComputedStyle(element).backgroundImage);
        assert.match(titleBackdrop, /mari-founding-overlook(?:-day)?\.webp/u);
        await expect(title.locator("h1")).toHaveCSS("text-transform", "uppercase");
        await expect(title.locator(".villages-founding-logo svg")).toBeInViewport({ ratio: 1 });
        await expect
          .poll(() =>
            page.evaluate(() =>
              [...document.fonts].some((font) => font.family === "village-letter-lora" && font.status === "loaded"),
            ),
          )
          .toBe(true);
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "founding-title-" + view.width + ".png"),
          });
        if (view.width === 390 && view.height === 844) {
          await expect
            .poll(() =>
              page.evaluate(() => window.featureController.savedSetupDraft?.data.workspace.settingIntroPending),
            )
            .toBe(true);
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await expect(start).toBeVisible();
        }
        const titlePose = await sidePose.boundingBox();
        await start.click();
        await expect(start).toHaveCount(0);
        const modelGate = root.getByRole(phone ? "dialog" : "region", { name: "Choose your models" });
        const models = modelGate.getByRole("region", { name: "Model Connections" });
        const system = models.getByRole("button", { name: /^System / });
        if (!phone) await expect(modelGate).toBeFocused();
        await expect(modelGate.getByRole("button", { name: "Back", exact: true })).toHaveCount(0);
        await expect(root.getByRole("region", { name: "Professor Mari" })).toHaveCount(0);
        await expect(root.getByRole("list", { name: "Founding phases" })).toHaveCount(0);
        await expect(sidePose).toHaveAttribute("data-flipping", "false");
        assert.deepEqual(
          await sidePose.boundingBox(),
          titlePose,
          "Mari holds her START position while models are chosen",
        );
        await expect(models.getByRole("button", { name: /^Images / })).toContainText("Image model");
        await expect(models.getByRole("button", { name: /^GM / })).toContainText("Language model");
        await expect(models.getByRole("button", { name: /^GM / })).toContainText("Scenes and dialogue");
        await expect(system).toContainText("Language model");
        await expect(system).toContainText("Drafts and village activity");
        await expect(system).toContainText("✓ Ready");
        await expect(models.getByRole("button", { name: /^GM / })).toContainText("✓ Ready");
        const recommendation = root.getByRole("dialog", { name: "Image connection", exact: true });
        await expect(recommendation).toHaveCount(0);
        await expect(modelGate.getByRole("button", { name: "Next", exact: true })).toBeEnabled();
        if (view.width === 1366 || (view.width === 390 && view.height === 844)) {
          await button("Menu appearance").click();
          const appearance = root.getByRole("dialog", { name: "Menu appearance", exact: true });
          const gateBounds = await modelGate.boundingBox();
          for (const [label, lighting] of [
            ["Night", "night"],
            ["Day", "day"],
            ["Day & night", daylight ? "day" : "night"],
          ]) {
            await appearance.getByRole("button", { name: label, exact: true }).click();
            await expect(root).toHaveAttribute("data-lighting", lighting);
            await expect(appearance.getByRole("button", { name: label, exact: true })).toHaveAttribute(
              "aria-pressed",
              "true",
            );
            if (process.env.VILLAGES_SCREENSHOT_DIR && label !== "Day & night")
              await page.screenshot({
                path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `appearance-${lighting}-${view.width}.png`),
              });
            assert.deepEqual(
              await modelGate.boundingBox(),
              gateBounds,
              "Appearance changes preserve the connection setup layout",
            );
          }
          await appearance.getByRole("button", { name: "Back", exact: true }).click();
          if (view.width === 1366) {
            const refreshConnections = async () => {
              await system.click();
              const picker = page.getByRole("dialog", { name: "System", exact: true });
              await picker.getByRole("button", { name: "Refresh list", exact: true }).click();
              await expect(picker.getByRole("button", { name: "Refresh list", exact: true })).toBeEnabled();
              await picker.getByRole("button", { name: "Back", exact: true }).click();
            };
            for (const role of ["systemConnectionId", "narrationConnectionId"]) {
              for (const value of ["", "deleted", "image", "alt-talk"]) {
                modelSelection[role] = value;
                connectionRows[1].profileImportReviewRequired = value === "alt-talk";
                await refreshConnections();
                await expect(modelGate.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
              }
              modelSelection[role] = "talk";
              connectionRows[1].profileImportReviewRequired = false;
              await refreshConnections();
              await expect(modelGate.getByRole("button", { name: "Next", exact: true })).toBeEnabled();
            }
            await modelGate.getByRole("button", { name: "Next", exact: true }).click();
            await expect(recommendation).toBeVisible();
            await expect(recommendation).toContainText("An image connection is highly recommended");
            await recommendation.getByRole("button", { name: "Choose image connection", exact: true }).click();
            const imageChoice = root.getByRole("dialog", { name: "Images", exact: true });
            await expect(imageChoice).toBeVisible();
            await imageChoice.getByRole("button", { name: "Back", exact: true }).click();
            await expect(modelGate).toBeVisible();
          }
        }
        assert.ok(
          await modelGate.evaluate((node) => node.scrollHeight <= node.clientHeight + 1),
          "Connection setup fits without a scrollable body",
        );
        await expect(modelGate.getByRole("button", { name: "Next" })).toBeInViewport({ ratio: 1 });
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "founding-models-" + view.width + ".png"),
          });
        if (view.width === 390 && view.height === 844) {
          await system.click();
          const picker = page.getByRole("dialog", { name: "System", exact: true });
          await expect(picker.getByRole("button", { name: /^Language model/ })).toHaveAttribute("aria-current", "true");
          await expect(picker.getByRole("button", { name: "Use Engine default" })).toHaveCount(0);
          await page.evaluate(() => {
            const deadline = AbortSignal.timeout.bind(AbortSignal);
            AbortSignal.timeout = (ms) => {
              if (ms !== 15_000) return deadline(ms);
              const controller = new AbortController();
              window.expireConnectionRead = () => controller.abort(new DOMException("Timed out", "TimeoutError"));
              return controller.signal;
            };
          });
          holdConnectionRead = true;
          await picker.getByRole("button", { name: "Refresh list", exact: true }).click();
          await expect.poll(() => connectionReadHeld).toBe(true);
          await picker.getByRole("button", { name: "Back", exact: true }).click();
          await expect(modelGate.getByRole("button", { name: "Next" })).toBeDisabled();
          await page.evaluate(() => window.expireConnectionRead());
          const timedOut = models.getByRole("alert");
          await expect(timedOut).toContainText("Checking model connections timed out.");
          holdConnectionRead = false;
          await timedOut.getByRole("button", { name: "Retry", exact: true }).click();
          await system.click();
          await picker.getByRole("button", { name: /^Draft model/ }).click();
          await expect(picker).toHaveCount(0);
          await expect(system).toContainText("Draft model");
          assert.equal(modelSelection.systemConnectionId, "alt-talk");
          assert.equal(modelSelection.narrationConnectionId, "talk");
          await expect
            .poll(() =>
              page.evaluate(() => window.featureController.savedSetupDraft?.data.workspace.settingIntroPending),
            )
            .toBe("connections");
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await expect(system).toContainText("Draft model");
        }
        await modelGate.getByRole("button", { name: "Next" }).click();
        if (view.width !== 2550) {
          await expect(recommendation).toBeVisible();
          await expect(root).toHaveAttribute("data-prelude", "true");
          assert.ok(
            await recommendation.evaluate((node) => node.scrollHeight <= node.clientHeight + 1),
            "The optional image acknowledgement fits without scrolling",
          );
          assert.ok(
            await recommendation.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
            "Image acknowledgement actions fit the narrow screen",
          );
          if (view.width === 320) {
            const enlarged = await recommendation.evaluate((node) => {
              node.style.fontSize = "22px";
              const fits = node.scrollWidth <= node.clientWidth + 1;
              node.style.fontSize = "";
              return fits;
            });
            assert.ok(enlarged, "Acknowledgement labels wrap at enlarged text size without horizontal scrolling");
          }
          if (process.env.VILLAGES_SCREENSHOT_DIR)
            await page.screenshot({
              path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `image-recommendation-${view.width}.png`),
            });
          await recommendation.getByRole("button", { name: "Continue without images", exact: true }).click();
        } else await expect(recommendation).toHaveCount(0);
        await expect(root).toHaveCSS("background-image", titleBackdrop);
        await expect(
          root.locator(".villages-reader-counter,.villages-founding-lore,.villages-lore-chip-slot"),
        ).toHaveCount(0);
        await expect.poll(() => root.evaluate((element) => getComputedStyle(element, "::before").content)).toBe("none");
        await expect(
          root.locator(".villages-forging-heading, .villages-forging-footer, .villages-forging-saved"),
        ).toHaveCount(0);
        await expect(button("Exit")).toHaveCount(0);
        await expect(
          root.getByRole("list", { name: "Founding phases" }).locator('[aria-current="step"]'),
        ).toHaveAttribute("aria-label", "Setting");
        assert.deepEqual(
          await root
            .getByRole("list", { name: "Founding phases" })
            .locator("li")
            .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("aria-label"))),
          ["Setting", "People", "Maps", "Venues", "Review"],
        );
        const railRows = await root
          .getByRole("list", { name: "Founding phases" })
          .locator("li")
          .evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().top)));
        assert.equal(new Set(railRows).size, 1, "All five chapters fit on one row");
        const scene = root.getByRole("region", { name: "Professor Mari", exact: true });
        await expect(title).toHaveCount(0);
        await expectPose("wave");
        await expect(sidePose).toHaveCount(0);
        assert.deepEqual(await stage.boundingBox(), stageBounds, "Mari turns without moving to a different spot");
        const currentStar = root.getByRole("list", { name: "Founding phases" }).locator('[aria-current="step"]');
        await expect(scene.locator('p[aria-live="polite"]')).toBeFocused();
        const line = scene.locator("p[aria-live=polite]");
        const nextLine = async () => {
          const next = scene.getByRole("button", { name: "Next", exact: true });
          await finishPassage(scene);
          if (phone) {
            await expect(next).toBeInViewport({ ratio: 0.99 });
            const back = scene.getByRole("button", { name: "Back", exact: true });
            if (await back.count()) await expect(back).toBeInViewport({ ratio: 0.99 });
          }
          await next.click();
        };
        const previousLine = async () => {
          await finishPassage(scene, -1);
          await scene.getByRole("button", { name: "Back", exact: true }).click();
          await finishPassage(scene, -1);
        };
        await expect(line).toHaveText("Oh, hello! I’m Mari. I was hoping you’d stop by.");
        await expect(button("Draft with Mari")).toHaveCount(0);
        await nextLine();
        await expect(line).toHaveText(/^Welcome to Villages\./);
        await expectPose("happy");
        await nextLine();
        await expect(line).toHaveText(/make a life with a community/);
        assert.equal(
          await finishPassage(scene),
          "You’ll make a life with a community here. That could mean a dockside town, a spaceship crew, or six neighbors with one catastrophically shared laundry room.",
        );
        await expectPose("happy");
        await nextLine();
        await expect(line).toHaveText(/^Let’s give your people a place to call home/);
        const greetingPose = await expectPose("neutral");
        await expect(button("Set it up myself")).toHaveCount(0);
        await expect(button("Draft with Mari")).toHaveCount(0);
        if (phone) {
          for (const reply of ["Back", "Next"])
            await expect(scene.getByRole("button", { name: reply, exact: true })).toBeInViewport({ ratio: 0.99 });
        }
        if (!phone) {
          const portrait = await greetingPose.boundingBox();
          const dialogue = await scene.locator(".villages-setting-dialogue").boundingBox();
          const artworkHeight = Math.max(frame.height, (frame.width * 820) / 1311);
          assert.ok(
            portrait.x >= frame.x - 0.5 &&
              portrait.y >= frame.y - 0.5 &&
              portrait.x + portrait.width <= frame.x + frame.width + 0.5 &&
              portrait.y + portrait.height <= frame.y + frame.height + 0.5,
            "Mari’s whole sprite fits on the stage",
          );
          assert.ok(
            portrait.y + portrait.height > frame.y + frame.height - artworkHeight * 0.2,
            "Mari stands on the terrace",
          );
          assert.ok(dialogue.x >= portrait.x + portrait.width, "Dialogue sits beside Mari");
        }
        await expect(button("Next")).toBeInViewport({ ratio: 1 });
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "founding-welcome-" + view.width + ".png"),
          });
        const settingPanel = root.getByRole(phone ? "dialog" : "region", { name: "Your first Map" });
        const villageName = root.getByLabel("Village Name", { exact: true });
        const mapName = root.getByLabel("First map name", { exact: true });
        const mapDescription = root.getByLabel("Location description", { exact: true });
        await nextLine();
        await expect(currentStar).toHaveAttribute("aria-label", "Setting");
        const hierarchy = root.getByRole("img", { name: /^World, Village, Map, Venue, Zone/ });
        const layer = async (name) => {
          await expect
            .poll(() =>
              stage.evaluate((node) => node.getAnimations().some((animation) => animation.playState === "running")),
            )
            .toBe(false);
          await expect(hierarchy).toHaveAccessibleName(`World, Village, Map, Venue, Zone. Current layer: ${name}`);
          await expect(hierarchy.locator("[data-active] text")).toHaveText(name);
          const activeCount = name === "Venue" ? 2 : name === "Zone" ? 4 : 1;
          assert.deepEqual(
            await hierarchy
              .locator("[data-active] .villages-founding-hierarchy-star path")
              .evaluateAll((stars) => stars.map((star) => getComputedStyle(star).fill)),
            Array(activeCount).fill(daylight ? "rgb(255, 227, 160)" : "rgb(255, 240, 195)"),
          );
          const inactiveStars = await hierarchy
            .locator("g:not([data-active],[data-complete]) > .villages-founding-hierarchy-star path")
            .evaluateAll((stars) => stars.map((star) => getComputedStyle(star).fill));
          assert.ok(
            inactiveStars.every((fill) => fill === "none"),
            "Future hierarchy stars remain unlit outlines",
          );
          assert.deepEqual(await stage.boundingBox(), stageBounds, "The chart leaves Mari’s standing mark in place");
        };
        await layer("World");
        await expect(hierarchy.locator(".villages-founding-hierarchy-star")).toHaveCount(9);
        await expect(line).toHaveText(/^See these five layers\?/);
        await expect(root.getByRole("button", { name: "Transcript", exact: true })).toHaveCount(0);
        if (daylight) {
          await expect(hierarchy.locator("circle").first()).toHaveCSS("fill", "rgb(33, 72, 62)");
          await expect(currentStar.locator(".villages-founding-star")).toHaveCSS("background-color", "rgb(33, 72, 62)");
          await expect(currentStar.locator(".villages-founding-star")).toHaveCSS("color", "rgb(255, 227, 160)");
          await expect(currentStar.locator(".villages-founding-star")).not.toHaveCSS("box-shadow", "none");
        }
        await expect(line).toHaveCSS("color", palette(daylight).ink);
        await expect(line).toHaveCSS(
          "font-size",
          await page.evaluate(() => getComputedStyle(document.documentElement).fontSize),
        );
        await expect(button("Choose lorebooks")).toHaveCount(0);
        await expect(hierarchy).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        if (daylight) await expect(hierarchy).toHaveCSS("background-color", palette(daylight).panel);
        const presenting = await expectPose("presenting");
        const portraitBox = await presenting.boundingBox();
        const treeBox = await hierarchy.boundingBox();
        const railBox = await root.getByRole("list", { name: "Founding phases" }).boundingBox();
        const dialogueBox = await scene.locator(".villages-setting-dialogue").boundingBox();
        assert.ok(treeBox.y >= railBox.y + railBox.height, "The chart clears the phase rail");
        if (phone) {
          assert.ok(treeBox.width >= Math.min(frame.width * 0.4, 176), "The mobile chart keeps its labels readable");
          assert.ok(treeBox.x + treeBox.width < stageBounds.x + stageBounds.width / 2, "The chart clears Mari’s face");
          assert.ok(
            treeBox.y + treeBox.height <= portraitBox.y + portraitBox.height * 0.43,
            "The chart sits by Mari’s presenting hand",
          );
        } else {
          assert.ok(
            treeBox.x + treeBox.width <= portraitBox.x,
            "The chart sits to the viewer’s left of Mari’s gesture",
          );
        }
        if (phone) {
          assert.ok(treeBox.y + treeBox.height <= dialogueBox.y, "The chart clears the bottom dialogue");
          const overlap = portraitBox.y + portraitBox.height - dialogueBox.y;
          assert.ok(overlap < portraitBox.height * 0.45, "The dialogue leaves Mari’s upper body visible");
          if (view.height < 700) assert.ok(overlap > 0, "The bottom dialogue can cover Mari’s lower legs");
          assert.ok(dialogueBox.y + dialogueBox.height <= frame.y + frame.height, "The bottom dialogue fits onscreen");
        } else {
          assert.ok(portraitBox.x + portraitBox.width <= dialogueBox.x, "Dialogue sits to Mari’s right on desktop");
        }
        assert.equal(
          portraitBox.y + portraitBox.height,
          stageBounds.y + stageBounds.height,
          "Mari’s shoes stay grounded",
        );
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `founding-world-${view.width}-${view.height}.png`),
          });
        await nextLine();
        await expect(line).toHaveText(/^The World is the big backdrop/);
        await expect(hierarchy).toBeVisible();
        await expect(presenting).toHaveAttribute("data-flipping", "false");
        await page.evaluate(() => {
          const animate = Element.prototype.animate;
          window.mariFlips = [];
          Element.prototype.animate = function (keyframes, options) {
            if (this.matches(".villages-setting-stage img"))
              window.mariFlips.push([this.dataset.flipping, this.getAttribute("src").split("/").at(-1), keyframes]);
            return animate.call(this, keyframes, options);
          };
        });
        await nextLine();
        const facingPlayer = await expectPose("thoughtful");
        await expect(facingPlayer).toHaveAttribute("data-facing", "front");
        assert.deepEqual(
          await page.evaluate(() => window.mariFlips),
          view.height === 650
            ? []
            : [
                [
                  "out",
                  "mari-founding-presenting.webp",
                  [{ transform: "rotateY(0deg) scaleX(1)" }, { transform: "rotateY(90deg) scaleX(1)" }],
                ],
                [
                  "in",
                  "mari-founding-thoughtful.webp",
                  [{ transform: "rotateY(-90deg) scaleX(1)" }, { transform: "rotateY(0deg) scaleX(1)" }],
                ],
              ],
          "The sprite swaps at the edge of the paper flip, or immediately with reduced motion",
        );
        assert.deepEqual(await stage.boundingBox(), stageBounds, "Mari turns toward the player in place");
        await expect(button("Choose lorebooks")).toHaveCount(0);
        const worldField = root.getByLabel("World description");
        const worldRules = root.getByLabel("World rules", { exact: true });
        const worldPopup = root.getByRole("dialog", { name: "The wider world", exact: true });
        if (phone) {
          await expect(worldPopup).toBeVisible();
          await expect(worldPopup.locator("header")).toBeFocused();
          await expect(worldPopup.getByRole("button", { name: "Next", exact: true })).toBeInViewport({ ratio: 0.99 });
          const popupBounds = await worldPopup.boundingBox();
          assert.ok(popupBounds.x >= frame.x + 10 && popupBounds.x + popupBounds.width <= frame.x + frame.width - 10);
          assert.ok(popupBounds.height < frame.height * 0.86, "The World form leaves the terrace visible around it");
          await expect(worldPopup.getByRole("button", { name: /^Close / })).toHaveCount(0);
          await page.mouse.click(frame.x + 2, frame.y + 2);
          await expect(worldPopup).toBeVisible();
          await worldPopup.press("Escape");
          await expect(worldPopup).toBeVisible();
          await worldPopup.evaluate((node) =>
            node.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true })),
          );
          await expect(worldPopup).toBeVisible();
        }
        const worldForm = phone ? worldPopup : scene;
        if (phone) {
          await expect(worldForm.getByText(/^What World does your Village take place in\?/)).toHaveCount(0);
          await expect(worldForm.getByRole("textbox").first()).not.toBeFocused();
          const worldFields = worldPopup.locator(".villages-setting-fields");
          assert.ok(
            await worldFields.evaluate((node) => node.scrollHeight <= node.clientHeight + 1),
            "All World fields fit without scrolling",
          );
        } else await expect(worldForm.getByText(/^What World does your Village take place in\?/)).toBeVisible();
        await expect(worldForm.locator(".villages-founding-field-heading label")).toHaveText([
          /^World name/,
          /^World description/,
          /^World rules/,
        ]);
        await expect(worldField).toBeVisible();
        assert.equal(
          await worldField.evaluate((field) => getComputedStyle(field, "::placeholder").fontStyle),
          "italic",
        );
        await expect(worldField).toHaveAttribute("placeholder", /^e\.g\./);
        if (!phone) {
          const chartLabel = hierarchy.locator("text").first();
          await worldField.focus();
          await expect(chartLabel).toHaveCSS("stroke", "none");
          const star = hierarchy.locator("[data-active] .villages-founding-hierarchy-star path");
          await expect(star).toHaveCSS("stroke", "none");
          await expect(star).not.toHaveCSS("filter", "none");
          await worldField.blur();
          await expect(chartLabel).toHaveCSS("stroke", "none");
          await expect(chartLabel).toHaveCSS("text-shadow", "none");
          await expect(star).toHaveCSS("stroke", "none");
          await expect(star).not.toHaveCSS("filter", "none");
        }
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `founding-world-form-${view.width}-${view.height}.png`),
          });
        await worldRules.fill("The sun never sets.");
        if (draftWithLore) {
          await worldField.fill(worldBrief);
          await expect
            .poll(() =>
              page.evaluate(() => {
                const workspace = window.featureController.savedSetupDraft?.data.workspace;
                return [workspace?.settingBeat, workspace?.settingWorldBrief];
              }),
            )
            .toEqual(["world", worldBrief]);
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await expect(currentStar).toHaveAttribute("aria-label", "Setting");
          if (phone) await nextLine();
          await expect(worldField).toHaveValue(worldBrief);
        }
        if (phone) await worldPopup.getByRole("button", { name: "Next", exact: true }).click();
        else await nextLine();
        await layer("World");
        await expect(line).toHaveText(/^Got Lorebooks\?/);
        await expectPose("thoughtful");
        await expect(button("Choose lorebooks")).toHaveCount(0);
        if (draftWithLore) {
          await scene.getByRole("button", { name: "Back", exact: true }).click();
          await expect(worldField).toHaveValue(worldBrief);
          if (phone) await worldPopup.getByRole("button", { name: "Next", exact: true }).click();
          else await nextLine();
        }
        await expect(root.getByRole("searchbox", { name: "Search Lorebooks" })).toHaveCount(0);
        await nextLine();
        const loreDialog = root.getByRole("dialog", { name: "Choose Lorebooks", exact: true });
        const picker = phone ? loreDialog : scene.getByRole("region", { name: "Village Lorebooks", exact: true });
        await expect(picker.getByRole("searchbox", { name: "Search Lorebooks" })).toBeVisible();
        await expectPose("happy");
        if (phone) await expect(picker.locator("header")).toBeFocused();
        const loreResults = picker.getByRole("group", { name: "Lorebooks", exact: true });
        const lorePageSize = phone ? 6 : 12;
        await expect(loreResults.getByRole("checkbox")).toHaveCount(lorePageSize);
        if (phone) {
          await expect(picker.getByRole("button", { name: /^Close / })).toHaveCount(0);
          await page.mouse.click(frame.x + 2, frame.y + 2);
        }
        await picker.getByRole("searchbox", { name: "Search Lorebooks" }).press("Escape");
        await expect(loreResults.getByRole("checkbox")).toHaveCount(lorePageSize);
        const loreBudget = picker.getByRole("textbox", { name: "Lorebook Token Budget", exact: true });
        await expect(loreBudget).toBeVisible();
        await expect(loreBudget).toHaveAccessibleDescription(
          "Maximum lorebook information added to each model request.",
        );
        const loreFooter = picker.locator(".villages-lorebook-footer");
        await expect(loreFooter.getByText(/selected$/)).toHaveCount(0);
        if (!phone) {
          const back = await loreFooter.getByRole("button", { name: "Back", exact: true }).boundingBox();
          const next = await loreFooter.getByRole("button", { name: "Next", exact: true }).boundingBox();
          const pages = await picker.getByRole("navigation", { name: "Lorebooks pages" }).boundingBox();
          assert.ok(
            back.x + back.width <= pages.x && pages.x + pages.width <= next.x,
            "Lorebook pagination sits between Back and Next",
          );
        }
        const loreElements = [
          phone ? picker : scene.locator(".villages-setting-dialogue"),
          loreResults,
          loreBudget,
          loreFooter,
        ];
        const unselectedLayout = await Promise.all(loreElements.map((element) => element.boundingBox()));
        const firstChoice = loreResults.getByRole("checkbox", { name: "Relay Belt", exact: true });
        await firstChoice.check();
        assert.deepEqual(
          await Promise.all(loreElements.map((element) => element.boundingBox())),
          unselectedLayout,
          "Selecting the first Lorebook keeps the grid, budget and navigation stationary",
        );
        await firstChoice.uncheck();
        const loreCards = loreResults.locator(".villages-lorebook-option");
        assert.ok(
          await loreCards.evaluateAll((cards) => {
            const heights = cards.map((card) => card.getBoundingClientRect().height);
            return Math.max(...heights) - Math.min(...heights) < 1;
          }),
          "Disabled and long-titled Lorebooks use the same card height",
        );
        assert.ok(
          await loreCards.evaluateAll((cards) =>
            cards.every((card) => {
              const label = card.getBoundingClientRect();
              const text = card.querySelector(".villages-lorebook-name").getBoundingClientRect();
              return text.bottom <= label.bottom + 1 && text.right <= label.right + 1;
            }),
          ),
          "Long titles and disabled status stay inside their Lorebook cards",
        );
        const firstBook = await loreCards.nth(0).boundingBox();
        const secondBook = await loreCards.nth(1).boundingBox();
        assert.ok(
          secondBook.x > firstBook.x + firstBook.width && Math.abs(secondBook.y - firstBook.y) < 1,
          "Lorebooks use two columns",
        );
        await expect(loreResults.getByRole("checkbox", { name: /Community archive 1.*Disabled/ })).toBeDisabled();
        const unavailableCheck = loreResults.locator(".villages-lorebook-check[data-unavailable]").first();
        assert.deepEqual(
          await unavailableCheck.locator(".villages-lorebook-state").boundingBox(),
          await unavailableCheck.getByRole("checkbox").boundingBox(),
          "The disabled symbol occupies the checkbox position",
        );
        if (phone) {
          const popup = await loreDialog.boundingBox();
          assert.ok(
            popup.x >= frame.x + 8 &&
              popup.x + popup.width <= frame.x + frame.width - 8 &&
              popup.y >= frame.y + 12 &&
              popup.y + popup.height <= frame.y + frame.height - 12,
            "The phone Lorebook popup leaves background visible on every side",
          );
        }
        await picker.getByRole("button", { name: "Next Lorebooks page", exact: true }).click();
        await expect(loreResults.getByRole("checkbox")).toHaveCount(6);
        assert.deepEqual(
          await Promise.all(loreElements.map((element) => element.boundingBox())),
          unselectedLayout,
          "A partial Lorebook page keeps the full panel and controls stationary",
        );
        await loreResults.getByRole("checkbox").first().check();
        await picker.getByRole("button", { name: "Previous Lorebooks page", exact: true }).click();
        await expect(loreResults.getByRole("checkbox")).toHaveCount(lorePageSize);
        for (const card of await loreCards.all()) await expect(card).toBeInViewport({ ratio: 0.99 });
        await picker.getByRole("button", { name: "Next Lorebooks page", exact: true }).click();
        await expect(loreResults.getByRole("checkbox").first()).toBeChecked();
        await loreResults.getByRole("checkbox").first().uncheck();
        await picker.getByRole("searchbox", { name: "Search Lorebooks" }).fill("Relay");
        await expect(loreResults.getByRole("checkbox")).toHaveCount(1);
        assert.deepEqual(
          await Promise.all(loreElements.map((element) => element.boundingBox())),
          unselectedLayout,
          "One search result keeps the full Lorebook panel size",
        );
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `lorebooks-one-${view.width}-${view.height}.png`),
          });
        await expect(picker.getByRole("navigation", { name: "Lorebooks pages" })).toHaveCount(0);
        await picker.getByRole("searchbox", { name: "Search Lorebooks" }).fill("No matching book");
        await expect(loreResults.getByText("No matches", { exact: true })).toBeVisible();
        assert.deepEqual(
          await Promise.all(loreElements.map((element) => element.boundingBox())),
          unselectedLayout,
          "No search results keep the full Lorebook panel size",
        );
        await picker.getByRole("searchbox", { name: "Search Lorebooks" }).fill("");
        await expect(loreResults.getByRole("checkbox", { name: "Relay Belt", exact: true })).toBeVisible();
        assert.ok(
          await loreResults.evaluate((node) => node.scrollHeight <= node.clientHeight + 1),
          "Lorebooks paginate instead of scrolling",
        );
        for (const card of await loreCards.all()) await expect(card).toBeInViewport({ ratio: 0.99 });
        await expect(button("Choose lorebooks")).toHaveCount(0);
        if (!phone) {
          await expect(line).toHaveText(/^Which Lorebooks should I have/);
          await expect(loreDialog).toHaveCount(0);
          await expect(picker.getByRole("searchbox", { name: "Search Lorebooks" })).toBeFocused();
          await expect(scene.getByRole("button", { name: "Next", exact: true })).toHaveCount(1);
        }
        if (draftWithLore) {
          const relay = picker.getByRole("checkbox", { name: "Relay Belt" });
          await relay.check();
          const budget = picker.getByRole("textbox", { name: "Lorebook Token Budget", exact: true });
          await budget.fill("1200");
          await picker.getByRole("button", { name: "Back", exact: true }).click();
          await nextLine();
          await expect(relay).not.toBeChecked();
          await relay.check();
          await expect(budget).toHaveValue("1600");
        }
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `lorebooks-${view.width}-${view.height}.png`),
          });
        for (const card of await loreCards.all()) await expect(card).toBeInViewport({ ratio: 0.99 });
        await expect(picker.getByRole("button", { name: "Next", exact: true })).toBeInViewport({
          ratio: 0.99,
        });
        if (phone)
          assert.ok(
            await picker.evaluate((node) => node.scrollHeight <= node.clientHeight + 1),
            "The Lorebook page and actions fit without scrolling",
          );
        await picker.getByRole("button", { name: "Next", exact: true }).click();
        await layer("Village");
        await expectPose("presenting");
        await expect(line).toHaveText(/^The Village is your whole community/);
        await expect(villageName).toBeHidden();
        await nextLine();
        const namingDialog = root.getByRole("dialog", { name: "Your Village", exact: true });
        const villageBrief = root.getByLabel("What is the village like?", { exact: true });
        const finishNaming = () =>
          phone ? namingDialog.getByRole("button", { name: "Next", exact: true }).click() : nextLine();
        if (phone) {
          await expect(line).toHaveText(/^What should we call your Village/);
          await expect(line).toBeFocused();
          await expect(namingDialog).toHaveCount(0);
          await expect(button("Next")).toBeInViewport({ ratio: 1 });
          await nextLine();
          await expect(namingDialog.getByRole("textbox", { name: "Village Name" })).toBeVisible();
          await expect(namingDialog.locator("header")).toBeFocused();
          await expect(namingDialog.getByText(/^What should we call your Village/)).toHaveCount(0);
          await expect(namingDialog.getByRole("button", { name: "Next" })).toBeInViewport({ ratio: 0.99 });
        } else {
          await expect(namingDialog).toHaveCount(0);
          await expect(line).toHaveText(/^What should we call your Village/);
          await expect(scene.getByRole("textbox", { name: "Village Name" })).toBeVisible();
          await expect(line).toBeFocused();
          await page.keyboard.press("Tab");
          await expect(villageName).toBeFocused();
        }
        await expect(villageBrief).toBeVisible();
        if (view.width === 390 && view.height === 844) {
          await villageBrief.focus();
          await page.evaluate(() => {
            window.visualViewport.height = innerHeight - 300;
            window.visualViewport.dispatchEvent(new Event("resize"));
          });
          await expect(root).toHaveAttribute("data-founding-keyboard", "true");
          const description = await villageBrief.boundingBox();
          assert.ok(description.y + description.height < view.height - 300, "The village field clears the keyboard");
          await villageBrief.blur();
          await page.evaluate(() => {
            window.visualViewport.height = innerHeight;
            window.visualViewport.dispatchEvent(new Event("resize"));
          });
          await expect(root).not.toHaveAttribute("data-founding-keyboard", "true");
        }
        await expect(mapName).toBeHidden();
        const checkVillageValidation = view.width === 320 || view.width === 1366;
        const initialBrief = draftWithLore ? "Our village is a converted cargo ship." : "A coastal community.";
        if (checkVillageValidation) {
          await expect(villageName).toHaveValue("");
          await finishNaming();
          await expect(villageName).toHaveAttribute("aria-invalid", "true");
          await expect(villageBrief).toHaveAttribute("aria-invalid", "true");
        }
        await villageName.fill("Coastal Community");
        if (checkVillageValidation) {
          await villageBrief.fill("   ");
          await finishNaming();
          await expect(villageBrief).toHaveAttribute("aria-invalid", "true");
          await expect(mapName).toBeHidden();
        }
        await villageBrief.fill(initialBrief);
        await finishNaming();
        await layer("Map");
        const mapPose = await expectPose("happy-side");
        await expect(mapPose).toHaveAttribute("data-facing", "left");
        await expect(mapPose).toHaveCSS("transform", "matrix(-1, 0, 0, 1, 0, 0)");
        const mapPortrait = await mapPose.boundingBox();
        assert.ok(
          phone
            ? treeBox.y + treeBox.height <= mapPortrait.y + mapPortrait.height * 0.43
            : treeBox.x + treeBox.width <= mapPortrait.x + 0.5,
          "Mari’s left-facing gesture clears the chart",
        );
        assert.ok(Math.abs(mapPortrait.y + mapPortrait.height - portraitBox.y - portraitBox.height) < 0.5);
        await expect(line).toHaveText(/^A Map is where we actually play/);
        await expect(villageName).toHaveCount(0);
        await expect(villageBrief).toHaveCount(0);
        await previousLine();
        if (phone) {
          await expect(namingDialog).toBeVisible();
        }
        await expect(villageName).toHaveValue("Coastal Community");
        await expect(villageBrief).toHaveValue(initialBrief);
        await finishNaming();
        await nextLine();
        await expect(line).toHaveText(/^Each Map covers one locale/);
        await nextLine();
        await expect(line).toHaveText(/^Where should your first Map take us/);
        const mapMessage = await line.textContent();
        if (phone) {
          await expect(settingPanel).toBeHidden();
          await expect(button("Suggest")).toHaveCount(0);
          await expect(button("Edit Map")).toHaveCount(0);
          await advance();
          await expect(settingPanel).toBeVisible();
          await expect(settingPanel.getByRole("button", { name: "Suggest", exact: true })).toBeVisible();
        }
        const draftMapButton = button("Suggest");
        const draftMapBounds = await draftMapButton.boundingBox();
        const mapReplies = await draftMapButton.locator("..").boundingBox();
        assert.ok(
          Math.abs(draftMapBounds.x + draftMapBounds.width - mapReplies.x - mapReplies.width) < 1,
          "Suggest sits at the right edge of its action row",
        );
        if (!phone) {
          const backBounds = await button("Back").boundingBox();
          const nextBounds = await button("Next").boundingBox();
          assert.ok(
            backBounds.x + backBounds.width <= nextBounds.x && nextBounds.x + nextBounds.width <= draftMapBounds.x,
            "Map Back/Next stay together on the left",
          );
        }
        await expect(currentStar).toHaveAttribute("aria-label", "Setting");
        assert.equal(settingCalls, 0, "The opening beats do not call a model");
        await expect(villageBrief).toHaveCount(0);
        await expect(villageName).toHaveCount(0);
        const closeSetting = () => settingPanel.getByRole("button", { name: "Back", exact: true }).click();
        if (!phone) {
          const dialogue = scene.locator(".villages-setting-dialogue");
          await expect(dialogue.getByRole("region", { name: "Your first Map" })).toBeVisible();
          await expect(dialogue.getByRole("button", { name: "Back", exact: true })).toBeVisible();
          await expect(dialogue.getByRole("button", { name: "Next", exact: true })).toBeVisible();
          await expect(root.locator(".villages-place-panels > .villages-founding-setting")).toHaveCount(0);
          await advance();
          await expect(mapName).toBeFocused();
          if (draftWithLore) await mapName.fill("My starting location");
        }
        if (draftWithLore) {
          const originalStage = phone ? null : await stage.boundingBox();
          await button("Suggest").click();
          if (!phone) {
            await expect(line).toContainText("I’ll replace your first Map details");
            assert.equal(settingCalls, 0, "Mari asks before replacing existing map details");
            await button("Keep my Map").click();
            await expect(button("Suggest")).toBeFocused();
            assert.equal(settingCalls, 0, "Keeping the setting does not send a request");
            await button("Suggest").click();
            await finishPassage(scene);
            await button("Replace and draft").click();
          }
          await expect.poll(() => settingCalls).toBe(1);
          if (!phone) await mapName.fill("");
          else await expect(settingPanel).toBeHidden();
          settingReady = true;
          if (phone) await expect(settingPanel).toBeVisible();
          await expect(mapDescription).toHaveValue("A shared galley aboard a cargo ship.");
          await expect(villageName).toHaveCount(0);
          await expect(mapName).toHaveValue(phone ? "Main Deck" : "");
          assert.equal(settingCalls, 1, "One explicit action dispatches one request");
          const originalEditorHeight = (await settingPanel.boundingBox()).height;
          if (phone) await closeSetting();
          await expect(line).toHaveText(mapMessage);
          if (phone) await expect(button("Suggest")).toHaveCount(0);
          else await expect(button("Suggest")).toBeEnabled();
          if (process.env.VILLAGES_SCREENSHOT_DIR)
            await page.screenshot({
              path: resolve(
                process.env.VILLAGES_SCREENSHOT_DIR,
                `drafted-map-message-${view.width}-${view.height}.png`,
              ),
            });
          await previousLine();
          await expect(line).toHaveText(/^Each Map covers one locale/);
          await previousLine();
          await expect(line).toHaveText(/^A Map is where we actually play/);
          await previousLine();
          if (phone) {
            await expect(namingDialog).toBeVisible();
          }
          await expect(villageName).toHaveValue("Coastal Community");
          await villageBrief.fill("Our village is inside a dumpster.");
          await finishNaming();
          await expect(line).toHaveText(/^A Map is where we actually play/);
          await expect(mapName).toBeHidden();
          await nextLine();
          await expect(line).toHaveText(/^Each Map covers one locale/);
          await nextLine();
          await expect(line).toHaveText(mapMessage);
          if (phone) {
            await expect(settingPanel).toBeHidden();
            await advance();
          }
          await button("Suggest").click();
          await expect(line).toContainText("I’ll replace your first Map details");
          await finishPassage(scene);
          await button("Replace and draft").click();
          await expect.poll(() => settingCalls).toBe(2);
          if (phone) await expect(settingPanel).toBeVisible();
          else {
            await expect(button("Suggest")).toBeEnabled();
            assert.equal(
              (await stage.boundingBox()).height,
              originalStage?.height,
              "Another draft keeps Mari’s stage at the same size",
            );
          }
          const updatedEditorHeight = (await settingPanel.boundingBox()).height;
          assert.ok(updatedEditorHeight <= originalEditorHeight + 1, "A long draft must not expand the editor");
          await expect(villageName).toHaveCount(0);
          await expect(villageBrief).toHaveCount(0);
          await expect(mapName).toHaveValue("Scavenger Rim");
          await expect(mapDescription).toHaveValue("Lanterns hang from the lip of the bin. ".repeat(90));
          if (phone && view.height === 844) {
            await expect
              .poll(() =>
                page.evaluate(() => window.featureController.savedSetupDraft?.data.workspace.settingEditorOpen),
              )
              .toBe(true);
            await page.reload();
            await page.addScriptTag({ content: foundingBundle });
            await expect(settingPanel).toBeVisible();
            await expect(mapName).toHaveValue("Scavenger Rim");
          }
          if (phone) {
            await closeSetting();
            await expect(line).toHaveText(mapMessage);
            await expect(button("Suggest")).toHaveCount(0);
            await advance();
          }
        }

        await root.getByLabel("First map name", { exact: true }).fill("Old Harbour");
        await root
          .getByLabel("Location description", { exact: true })
          .fill("An oceanfront expanse between the cliffs and river.");
        if (checkVillageValidation) {
          // Older drafts could reach the Map without a Village description.
          await page.evaluate(() =>
            window.featureController.setSetupWorkspace((workspace) => ({ ...workspace, settingBrief: "" })),
          );
          await advance();
          if (phone) {
            await expect(line).toHaveText(/^What should we call your Village/);
            await expect(namingDialog).toHaveCount(0);
            await nextLine();
          }
          await expect(villageBrief).toHaveAttribute("aria-invalid", "true");
          await expect(villageName).toHaveValue("Coastal Community");
          await finishNaming();
          await expect(villageBrief).toHaveAttribute("aria-invalid", "true");
          await villageBrief.fill(initialBrief);
          await finishNaming();
          await nextLine();
          await nextLine();
          if (phone) await advance();
          await expect(mapName).toHaveValue("Old Harbour");
        }
        if (phone && process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "mobile-setting-editor-" + view.width + ".png"),
          });
        await expect(root.getByRole("group", { name: "Village context" })).toHaveCount(0);
        await expect(button("Art settings")).toHaveCount(0);
        await expect(root.getByLabel("World rules", { exact: true })).toHaveCount(0);
        await expect(root.getByLabel("First day", { exact: true })).toHaveCount(0);
        await bounds("setting");
        await advance();
        await expect(root).toHaveAttribute("data-step", "1");
        await expect(root.locator(".villages-chapter-guide")).toContainText(
          "Choose who you’ll play and who lives here.",
        );
        await expect(root.locator(".villages-chapter-guide")).not.toContainText("gets a home");
        await enterChapter();
        if (view.width === 390 && view.height === 844) {
          await root.locator(".marinara-capability-villages-founding-persona").getByRole("button").click();
          const personas = page.getByRole("dialog", { name: "Choose Persona", exact: true });
          await personas.getByRole("group", { name: "Choose a Persona" }).getByRole("button").first().click();
          await expect(personas).toBeVisible();
          await personas.press("Escape");
          await expect(personas).toBeVisible();
          await expect(personas.getByRole("button", { name: "Next", exact: true })).toHaveCount(0);
          await personas.getByRole("button", { name: "Confirm", exact: true }).click();
          await expect
            .poll(() => page.evaluate(() => window.featureController.savedSetupDraft?.data.workspace.mobileMenu))
            .toBe("people");
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await expect(root.getByRole("dialog", { name: "People", exact: true })).toBeVisible();
        }
        for (const person of characters.slice(0, view.count)) {
          await button("+ Add villager").click();
          const picker = page.getByRole("dialog", { name: "Choose founding villagers", exact: true });
          await expect(picker.getByRole("button", { name: "Professor Mari · Add", exact: true })).toHaveCount(0);
          await picker.getByRole("button", { name: person.name + " · Add", exact: true }).click();
          await expect(picker.locator("footer").getByRole("button")).toHaveCount(1);
          await checkPalette();
          await expect(picker.getByRole("button", { name: "Confirm", exact: true })).toHaveCSS(
            "background-color",
            palette(daylight).primary,
          );
          if (person.id === characters[0].id) {
            const search = picker.getByRole("searchbox");
            await search.fill(person.name);
            const selectedIds = await page.evaluate(() => window.featureController.setupFoundingVillagerIds);
            const pickerBounds = await picker.boundingBox();
            await setDaylight(!daylight);
            await expect(search).toHaveValue(person.name);
            assert.deepEqual(await page.evaluate(() => window.featureController.setupFoundingVillagerIds), selectedIds);
            assert.deepEqual(
              await picker.boundingBox(),
              pickerBounds,
              "Changing the palette leaves the open picker in place",
            );
            if (process.env.VILLAGES_SCREENSHOT_DIR)
              await page.screenshot({
                path: resolve(
                  process.env.VILLAGES_SCREENSHOT_DIR,
                  `villager-picker-${!daylight ? "day" : "night"}-${view.width}.png`,
                ),
              });
            await setDaylight(daylight);
            await search.clear();
          }
          if (process.env.VILLAGES_SCREENSHOT_DIR && person.id === characters[0].id)
            await page.screenshot({
              path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `villager-confirm-${view.width}-${view.height}.png`),
            });
          await picker.getByRole("button", { name: "Confirm", exact: true }).click();
        }
        await expect(root.getByRole("region", { name: "Housing", exact: true })).toHaveCount(0);
        const resident = root.locator(".villages-selected-villager").first();
        await button("Model Connections").click();
        const modelSettings = root.getByRole("dialog", { name: "Model Connections", exact: true });
        await modelSettings.getByRole("button", { name: /^GM / }).click();
        const gmPicker = page.getByRole("dialog", { name: "GM", exact: true });
        await expect(gmPicker.getByRole("button", { name: "Use Engine default", exact: true })).toHaveCount(0);
        await gmPicker.getByRole("button", { name: /^Draft model/ }).click();
        await expect(gmPicker).toHaveCount(0);
        await expect(modelSettings.getByRole("button", { name: /^GM / })).toContainText("Draft model");
        await modelSettings.getByRole("button", { name: /^Images / }).click();
        const imagePicker = page.getByRole("dialog", { name: "Images", exact: true });
        await expect(imagePicker.getByRole("button", { name: "Use Engine default", exact: true })).toBeVisible();
        await imagePicker.getByRole("button", { name: "Disabled", exact: true }).click();
        await expect(imagePicker).toHaveCount(0);
        await expect(modelSettings.getByRole("button", { name: /^Images / })).toContainText("Disabled");
        await modelSettings.getByRole("button", { name: "Back", exact: true }).click();
        await button("Model Connections").click();
        await expect(modelSettings.getByRole("button", { name: /^GM / })).toContainText("Draft model");
        await expect(modelSettings.getByRole("button", { name: /^Images / })).toContainText("Disabled");
        await modelSettings.getByRole("button", { name: /^GM / }).click();
        await gmPicker.getByRole("button", { name: /^Language model/ }).click();
        await expect(gmPicker).toHaveCount(0);
        await modelSettings.getByRole("button", { name: /^Images / }).click();
        await imagePicker.getByRole("button", { name: /^Image model/ }).click();
        await expect(imagePicker).toHaveCount(0);
        await modelSettings.getByRole("button", { name: "Back", exact: true }).click();
        await expect(button("Model Connections")).toBeFocused();
        await expect(resident.getByText("No Sprites Assigned!", { exact: false })).toBeVisible();
        await expect(resident.getByRole("button", { name: "Portrait", exact: true })).toHaveCount(0);
        await expect(resident.getByRole("button", { name: "Assign Side", exact: true })).toHaveCount(0);
        await expect(settingNext()).toBeEnabled();
        // Verify compact starters, then exercise restored separate-home drafts across the full wizard.
        await page.evaluate(() => {
          const c = window.featureController,
            rows = c.setupVenues,
            actors = ["player", ...c.setupFoundingVillagerIds];
          if (rows.length >= actors.length + 2) throw Error("Fresh starters should share a building");
          const base = rows.find((row) => row.occupancy.playerHome);
          const homes = actors.map((actor, index) => {
            const source = rows.find((row) =>
              actor === "player" ? row.occupancy.playerHome : row.residentIds.includes(actor),
            );
            const common = {
              ...structuredClone(source.spaces[0]),
              id: "common:base",
              connectedTo: ["exterior", "private:base"],
            };
            const room = {
              ...structuredClone(source.privateSpaces.find((room) => room.ownerId === actor)),
              id: "private:base",
              connectedTo: ["common:base"],
            };
            return {
              ...source,
              id: "founding-home:" + actor,
              name: actor === "player" ? "Your home" : c.catalog.find((person) => person.id === actor).name + " home",
              residentIds: actor === "player" ? [] : [actor],
              occupancy: { ...source.occupancy, playerHome: actor === "player" },
              access: undefined,
              spaces: [common],
              privateSpaces: [room],
              destinations: { [actor]: { home: common.id, sleep: room.id } },
              presentation: { ...base.presentation, x: 0.12 + index * 0.18, y: 0.3 },
            };
          });
          const positions = [
            [0.5, 0.5],
            [0.32, 0.5],
            [0.68, 0.5],
            [0.14, 0.5],
            [0.86, 0.5],
            [0.5, 0.32],
          ];
          c.setSetupVenues(
            [...homes, ...rows.filter((row) => !row.occupancy.playerHome && !row.residentIds.length)].map(
              (row, index) => ({
                ...row,
                presentation: { ...row.presentation, x: positions[index][0], y: positions[index][1] },
              }),
            ),
          );
        });
        await bounds("people");
        await advance();
        await expect(root).toHaveAttribute("data-step", "2");
        await expect(root.getByText(/^Add or draft your Venues/)).toHaveCount(0);
        await enterChapter();
        await expect.poll(() => root.evaluate((element) => element.scrollTop)).toBe(0);
        await button("Art settings").click();
        const artSettings = page.getByRole("dialog", { name: "Art settings", exact: true });
        await expect(artSettings.getByRole("button", { name: "Back", exact: true })).toHaveCSS(
          "background-color",
          daylight ? "rgb(212, 229, 222)" : "rgb(81, 65, 87)",
        );
        await expect(artSettings.locator(".villages-scenery-fields")).toHaveCSS(
          "border-top-color",
          daylight ? "rgb(120, 148, 131)" : "rgba(180, 127, 146, 0.667)",
        );
        if (view.width !== 2550)
          await expect(artSettings.getByRole("button", { name: /^Images / })).toContainText("Needs Engine review");
        await expect(artSettings.getByRole("button", { name: /^System / })).toHaveCount(0);
        await expect(artSettings.getByRole("button", { name: /^GM / })).toHaveCount(0);
        await expect(root.getByRole("dialog", { name: "Model Connections", exact: true })).toHaveCount(0);
        await expect(
          root
            .getByRole("region", { name: "Map artwork", exact: true })
            .getByRole("button", { name: "Art settings", exact: true }),
        ).toHaveCount(0);
        await artSettings
          .getByRole("combobox", { name: "Scenery style preset", exact: true })
          .selectOption("fixture-ink");
        await expect
          .poll(() => page.evaluate(() => window.featureController.sceneryStyleProfileId))
          .toBe("fixture-ink");
        await artSettings.getByRole("combobox", { name: "Scenery style preset", exact: true }).selectOption("@custom");
        await artSettings
          .getByLabel("Scenery style description", { exact: true })
          .fill("Watercolor with muted teal and warm amber.");
        await artSettings.getByLabel("Map details", { exact: true }).fill("A circular Village around a central pond.");
        await artSettings.getByLabel("Exclude from map", { exact: true }).fill("neon colors");
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "art-settings-" + view.width + ".png"),
          });
        await artSettings.getByRole("button", { name: "Back", exact: true }).click();
        await expect(artSettings).toHaveCount(0);
        assert.equal(generatedImages, 0, "Changing art settings never generates an image");
        assert.deepEqual(await root.boundingBox(), frame, "Art settings do not resize the Founding window");
        await button("Art settings").click();
        await expect(artSettings.getByLabel("Scenery style description", { exact: true })).toHaveValue(
          "Watercolor with muted teal and warm amber.",
        );
        await artSettings.getByRole("button", { name: "Back", exact: true }).click();
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
        const mapWarning = root.getByText("Upload or generate a map image before continuing.", { exact: true });
        await expect(root.locator(".villages-quick-venue-card")).toHaveCount(0);
        await expect(root.getByRole("navigation", { name: "Venue sections" })).toHaveCount(0);
        await advance();
        await expect(root).toHaveAttribute("data-step", "2");
        await expect(mapWarning).toBeVisible();
        assert.deepEqual(await root.boundingBox(), frame, "Missing artwork keeps the player on Maps");
        if (view.width === 1366) {
          failMapGeneration = true;
          await button("Generate artwork").click();
          await expect(
            root.getByRole("alert").filter({ hasText: "Map artwork could not be generated." }),
          ).toBeVisible();
          await expect(button("Generate artwork")).toBeEnabled();
          await expect(button("Upload image")).toBeEnabled();
          assert.equal(generatedImages, 1, "Reading the failed attempt never generates another image");
          assert.equal(await page.evaluate(() => window.featureController.setupMapRequest), null);
          assert.equal(await page.evaluate(() => window.featureController.setupMapBusy), false);
          await expect(root).toHaveAttribute("data-step", "2");
          await expect(settingNext()).toBeEnabled();
          await advance();
          await expect(root).toHaveAttribute("data-step", "2");
          failMapGeneration = false;
          await button("Generate artwork").click();
          await expect.poll(() => page.evaluate(() => window.featureController.setupMapSource)).toBe("generate");
          assert.equal(generatedImages, 2);
        } else {
          await root.getByLabel("Upload map image", { exact: true }).setInputFiles({
            name: "map.png",
            mimeType: "image/png",
            buffer: Buffer.from(image, "base64"),
          });
          await expect.poll(() => page.evaluate(() => window.featureController.setupMapSource)).toBe("upload");
        }
        await expect(root.getByRole("region", { name: "Map artwork preview" })).toBeVisible();
        const mapPreview = root.getByRole("region", { name: "Map artwork preview" });
        await expect(mapPreview.locator("img")).toBeVisible();
        const stillMap = await mapPreview.evaluate(async (node) => {
          const image = node.querySelector("img");
          const samples = [];
          for (let frame = 0; frame < 45; frame++) {
            await new Promise(requestAnimationFrame);
            samples.push(image.getBoundingClientRect().toJSON());
          }
          return samples;
        });
        for (const dimension of ["x", "y", "width", "height"]) {
          const values = stillMap.map((sample) => sample[dimension]);
          assert.ok(
            Math.max(...values) - Math.min(...values) < 0.5,
            `The idle Map image keeps its ${dimension}; it never grows or moves on its own`,
          );
        }
        const mapTitle = await root
          .getByRole("region", { name: "Map artwork", exact: true })
          .getByRole("heading")
          .boundingBox();
        const mapActions = await button("Generate artwork").boundingBox();
        if (phone) {
          assert.ok(mapTitle.y + mapTitle.height <= mapActions.y, "The map title stays above its artwork controls");
        } else {
          assert.ok(
            mapTitle.y + mapTitle.height <= mapActions.y || mapTitle.x + mapTitle.width <= mapActions.x,
            "The map title and artwork controls stay separate",
          );
          const map = await root.getByRole("region", { name: "Map artwork preview" }).boundingBox();
          assert.ok(map.width >= frame.width * 0.55, "Artwork previews use most of the desktop width");
          assert.ok(map.height >= frame.height * 0.48, "Artwork previews use most of the available height");
        }
        await bounds("maps");
        await retreat();
        if (phone) {
          await expect(root).toHaveAttribute("data-step", "2");
          await expect(root.getByRole("region", { name: "Map artwork preview" })).toBeHidden();
          await retreat();
        }
        await expect(root).toHaveAttribute("data-step", "1");
        await expect(root.locator(".villages-selected-villager")).toHaveCount(view.count);
        if (phone) await expect(root.getByRole("dialog", { name: "People", exact: true })).toBeVisible();
        await advance();
        await enterChapter();
        await expect(root.getByRole("region", { name: "Map artwork preview" })).toBeVisible();
        await advance();
        await expect(root).toHaveAttribute("data-step", "3");
        await expect(root.locator("[data-explanation]")).toHaveCount(1);
        await expect(root.getByText(/^Add or draft your Venues/)).toBeVisible();
        await expect(work).toHaveCount(0);
        await enterChapter();
        await retreat();
        await expect(root).toHaveAttribute("data-step", "3");
        await expect(root.locator("[data-explanation]")).toHaveCount(1);
        if (phone)
          await expect(root.locator(".villages-setting-dialogue:visible")).not.toHaveAttribute("data-reader-next-page");
        await finishPassage(root, -1);
        await expect(root.getByText(/^Add or draft your Venues/)).toBeVisible();
        await expect(work).toHaveCount(0);
        await retreat();
        await expect(root).toHaveAttribute("data-step", "2");
        await expect(root.locator("[data-explanation]")).toHaveCount(0);
        await expect(root.getByRole("region", { name: "Map artwork preview" })).toBeVisible();
        await advance();
        await expect(root).toHaveAttribute("data-step", "3");
        await enterChapter();
        await expect(work).toBeVisible();
        await expect(root.getByRole("button", { name: "Upload image", exact: true })).toHaveCount(0);
        await expect(root.getByRole("region", { name: "Housing", exact: true })).toHaveCount(0);
        await expect(root.getByLabel("Community Venue", { exact: true })).toHaveCount(0);
        await expect(root.getByRole("combobox", { name: /household/i })).toHaveCount(0);
        await expect(root.locator(".villages-quick-venue-card:visible")).toHaveCount(phone ? 0 : view.count + 3);
        if (view.width === 390 && view.height === 844) {
          const keptVenues = await page.evaluate(() => structuredClone(window.featureController.setupVenues));
          const selectedPeople = await page.evaluate(() => window.featureController.setupFoundingVillagerIds);
          await button("Add Venue").click();
          await expect(sheet).toBeVisible();
          await sheet.getByRole("button", { name: "Redraft Venue", exact: true }).click();
          const redraft = page.getByRole("dialog", { name: "Redraft Venue", exact: true });
          await redraft.getByLabel("Venue ideas", { exact: true }).fill("A small library");
          await redraft.getByRole("button", { name: "Back", exact: true }).click();
          assert.equal(suggestions, 0, "Opening a local draft prompt spends nothing");
          await sheet.getByRole("button", { name: "Remove Venue", exact: true }).click();
          await page
            .getByRole("dialog", { name: "Confirm", exact: true })
            .getByRole("button", { name: "Remove Venue", exact: true })
            .click();
          await expect(sheet).toBeHidden();
          assert.deepEqual(
            await page.evaluate(() => window.featureController.setupVenues),
            keptVenues,
            "Removing a manual Venue preserves other places",
          );
          assert.deepEqual(
            await page.evaluate(() => window.featureController.setupFoundingVillagerIds),
            selectedPeople,
          );
          const sharedVenues = await page.evaluate(() => {
            const original = window.featureController.setupVenues;
            window.featureController.setSetupVenues(
              original.map((venue) =>
                venue.id === "founding-garden"
                  ? {
                      ...venue,
                      spaces: venue.spaces.map((zone) => ({
                        ...zone,
                        access: { ...zone.access, mode: "permission-required" },
                      })),
                    }
                  : venue,
              ),
            );
            return original;
          });
          await expect(
            root.getByText("Keep shared Zones open around the clock in at least two Venues.", { exact: true }),
          ).toBeVisible();
          await expect(button("Use starter homes")).toHaveCount(0);
          await page.evaluate((venues) => window.featureController.setSetupVenues(venues), sharedVenues);
        }
        await expect(settingNext()).toBeInViewport({ ratio: 1 });
        await expect(root.getByRole("button", { name: "Next Venues page", exact: true })).toHaveCount(0);
        if (!phone)
          await expect(
            root.locator('[data-venue-id="founding-community"]').getByText("Community Venue", { exact: true }),
          ).toBeVisible();
        const placementPane = root.getByRole("region", { name: "Venue placement", exact: true, includeHidden: true });
        const mobileWorkspaceBounds = phone
          ? await root.locator(".villages-chapter-map>.villages-forging-body").boundingBox()
          : null;
        const placementBounds = phone ? null : await placementPane.boundingBox();
        if (placementBounds) {
          const options = await root.getByRole("region", { name: "Starting Venues", exact: true }).boundingBox();
          assert.ok(
            placementBounds.x + placementBounds.width <= options.x,
            "Starting Venues sits to the right of the map",
          );
          assert.ok(placementBounds.width >= options.width * 1.65, "The map gets most of the desktop workspace");
          assert.ok(Math.abs(placementBounds.y - options.y) <= 1, "Starting Venues aligns with the map artwork");
          await bounds("venues");
        }
        await editVenue("founding-home:player");
        await expect(sheet.getByRole("navigation", { name: "Venue sections" })).toBeVisible();
        await expect(sheet.locator(".marinara-capability-villages-venue-metadata")).toHaveCount(0);
        await expect(sheet.locator(".marinara-capability-villages-workspace-venue-header svg")).toHaveCount(0);
        const headerGap = await sheet.evaluate((node) => {
          const navigation = node
            .querySelector(".marinara-capability-villages-venue-navigation")
            .getBoundingClientRect();
          const heading = node.querySelector("h1").getBoundingClientRect();
          return heading.top - navigation.bottom;
        });
        assert.ok(headerGap >= 0 && headerGap <= 24, "The Venue title follows Map without an oversized spacer");
        await expect(sheet.getByRole("button", { name: "Visit", exact: true })).toHaveCount(0);
        await expect(sheet.getByRole("group", { name: "Who lives here?" })).toHaveCount(0);
        await manageVenue();
        await expect(sheet.getByLabel("Resident capacity", { exact: true })).toHaveCount(0);
        await sheet.getByRole("button", { name: "Assignments", exact: true }).click();
        await sheet.getByRole("button", { name: /^Residents/ }).click();
        await sheet.getByRole("button", { name: "You", exact: true }).click();
        await expect(sheet.getByLabel("Resident capacity", { exact: true })).toHaveCount(0);
        await expect(sheet.getByRole("checkbox", { name: "Lives here", exact: true })).toHaveCount(0);
        const saveHome = sheet.getByRole("button", { name: "Save home", exact: true });
        await expect(saveHome).toHaveCSS("background-color", palette(daylight).primary);
        await expect(saveHome).toHaveCSS("color", daylight ? "rgb(232, 242, 236)" : "rgb(41, 41, 56)");
        await expect(sheet.getByRole("button", { name: "Remove resident", exact: true })).toBeVisible();
        await sheet.getByRole("button", { name: "Cancel", exact: true }).click();
        await sheet.locator(".marinara-capability-villages-venue-navigation").getByRole("button").click();
        await sheet.getByRole("button", { name: "Assignments", exact: true }).click();
        await sheet.getByRole("button", { name: /^Workers/ }).click();
        await sheet.getByRole("button", { name: "Add worker", exact: true }).click();
        await sheet.locator(".marinara-capability-villages-directory-card").first().click();
        const host = page.locator("marinara-capability-villages");
        if (view.width === 2550)
          await host.evaluate((node) => {
            node.style.width = "calc(100% - 600px)";
          });
        await expect
          .poll(() =>
            sheet
              .locator(".villages-work-times input")
              .first()
              .evaluate((node) => node.getBoundingClientRect().width),
          )
          .toBeGreaterThanOrEqual(144);
        assert.ok(
          await sheet.locator(".villages-work-access label").evaluateAll((labels) =>
            labels.every((label) => {
              const check = label.querySelector("input").getBoundingClientRect(),
                text = label.querySelector("span").getBoundingClientRect();
              return text.x >= check.right && text.right <= label.getBoundingClientRect().right + 1;
            }),
          ),
          "Work access keeps each label beside its checkbox",
        );
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "work-editor-" + view.width + ".png"),
          });
        if (view.width === 2550)
          await host.evaluate((node) => {
            node.style.width = "";
          });
        await sheet.getByRole("button", { name: "Cancel", exact: true }).click();
        await sheet.locator(".marinara-capability-villages-venue-navigation").getByRole("button").click();
        await sheet.getByRole("button", { name: "About", exact: true }).click();
        const venuePage = await sheet.boundingBox();
        assert.deepEqual(
          venuePage,
          placementBounds ? await placementPane.boundingBox() : mobileWorkspaceBounds,
          "The Venue fills the workspace above the fixed actions",
        );
        const homeRow = root.locator('[data-venue-id="founding-home:player"]');
        if (placementBounds) {
          await expect(root.getByRole("dialog")).toHaveCount(0);
          await expect(placementPane).toBeHidden();
          await expect(
            root.getByRole("region", { name: "Starting Venues", exact: true, includeHidden: true }),
          ).toBeHidden();
          await expect(root.getByRole("complementary", { name: "Professor Mari" })).toBeVisible();
          await expect(homeRow).toHaveAttribute("aria-expanded", "true");
          await expect(
            root.getByRole("region", { name: "Starting Venues", exact: true, includeHidden: true }),
          ).toBeHidden();
          const community = root.locator('[data-venue-id="founding-community"]');
          await closeVenue();
          await expect(root.getByRole("region", { name: "Starting Venues", exact: true })).toBeVisible();
          await community.click();
          await sheet.getByRole("button", { name: "Assignments", exact: true }).click();
          await sheet.getByRole("button", { name: /^Residents/ }).click();
          await expect(sheet.locator(".marinara-capability-villages-directory-card")).toHaveCount(0);
          await closeVenue();
          await homeRow.click();
          await expect(sheet.getByRole("button", { name: "← Map", exact: true })).toBeFocused();
        }
        if (frame.width <= 700) {
          const tabs = await sheet.getByRole("navigation", { name: "Venue sections" }).boundingBox();
          assert.ok(tabs.width >= frame.width - 40, "The Venue uses the full-width gameplay layout on phones");
        }
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "venue-profile-" + view.width + ".png"),
          });
        await closeVenue();
        if (placementBounds) {
          await expect(homeRow).toBeFocused();
          await expect(root.getByRole("region", { name: "Starting Venues", exact: true })).toBeVisible();
        }
        await editVenue("founding-garden");
        const openingGathering = sheet.getByRole("button", { name: "Opening gathering", exact: true });
        await expect(openingGathering).toHaveCount(0);
        await closeVenue();
        if (phone) await expect(root.getByRole("region", { name: "Venue placement", exact: true })).toBeVisible();
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "venue-list-" + view.width + ".png"),
          });
        await showMap();
        if (phone) {
          await expect(root.getByRole("dialog")).toHaveCount(1);
          await expect(root.getByLabel("Venue to place")).toHaveCount(0);
          await expect(settingNext()).toBeInViewport({ ratio: 1 });
          await expect(hierarchy).toHaveCount(0);
          await expect(root.getByRole("list", { name: "Founding phases" })).toBeInViewport({ ratio: 1 });
        }
        const mapCanvas = root.locator(".villages-quick-map");
        if (phone) {
          const canvasBounds = await mapCanvas.getByRole("group", { name: "Map navigation" }).boundingBox();
          assert.ok(
            Math.abs(canvasBounds.y + canvasBounds.height - mobileWorkspaceBounds.y - mobileWorkspaceBounds.height) < 2,
            "The map fills the workspace above navigation",
          );
        }
        const marker = mapCanvas.locator('[data-pin-id="founding-home:player"]');
        await showVenuePin("founding-home:player");
        if (placementBounds || phone) {
          const stage = mapCanvas.locator("[data-navigation-zoom]");
          const initialZoom = await stage.getAttribute("data-navigation-zoom");
          await mapCanvas.getByRole("button", { name: "Zoom in", exact: true }).click();
          await expect(stage).not.toHaveAttribute("data-navigation-zoom", initialZoom);
          const zoom = await stage.getAttribute("data-navigation-zoom");
          await marker.press("Enter");
          const backToMap = sheet.getByRole("button", { name: "← Map", exact: true });
          await expect(backToMap).toBeFocused();
          await backToMap.press("Escape");
          await expect(backToMap).toBeFocused();
          await backToMap.click();
          await expect(marker).toBeFocused();
          await expect(stage).toHaveAttribute("data-navigation-zoom", zoom);
          await mapCanvas.getByRole("button", { name: "Reset map view", exact: true }).click();
          await showVenuePin("founding-home:player");
        }
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
        if (phone) {
          const fullMap = root.getByRole("dialog", { name: "Venues", exact: true });
          const workspace = await fullMap.boundingBox();
          assert.equal(workspace.width, frame.width, "Mobile map uses the full Villages width");
          assert.ok(workspace.y <= frame.y + 80 && workspace.y + workspace.height >= frame.y + frame.height - 1);
          await expect(root.getByRole("button", { name: "Move on map", exact: true })).toHaveCount(0);
          await showVenuePin("founding-home:finn");
          const finnX = await page.evaluate(
            () => window.featureController.setupVenues.find((row) => row.id === "founding-home:finn").presentation.x,
          );
          await mapCanvas.locator('[data-pin-id="founding-home:finn"]').press("ArrowRight");
          assert.ok(
            Math.abs(
              (await page.evaluate(
                () =>
                  window.featureController.setupVenues.find((row) => row.id === "founding-home:finn").presentation.x,
              )) -
                finnX -
                0.01,
            ) < 0.0001,
            "A focused Venue icon can be moved with the keyboard",
          );
          await expect(fullMap.getByRole("button", { name: "Cancel", exact: true })).toHaveCount(0);
          await showVenuePin("founding-home:player");
          await mapCanvas.getByRole("button", { name: "Zoom in", exact: true }).click();
          await mapCanvas.getByRole("button", { name: "Zoom in", exact: true }).click();
          const zoomedPicture = await mapCanvas.getByRole("img", { name: "Map of Old Harbour" }).boundingBox();
          const zoomedViewport = await mapCanvas.getByRole("group", { name: "Map navigation" }).boundingBox();
          const point = await marker.locator(".marinara-capability-villages-map-point").boundingBox();
          assert.ok(zoomedPicture.x + zoomedPicture.width > zoomedViewport.x + zoomedViewport.width + 24);
          await drag(zoomedViewport.x + zoomedViewport.width + 12 - point.x - point.width / 2, 0);
          await expect(root.getByRole("alert")).toContainText("inside the map");
          assert.deepEqual(
            await page.evaluate(
              () => window.featureController.setupVenues.find((row) => row.id === "founding-home:player").presentation,
            ),
            beforeDrag,
            "A drop outside the visible map keeps the saved pin, even when it is inside the zoomed image",
          );
          await showVenuePin("founding-home:player");
          const picture = await mapCanvas.getByRole("img", { name: "Map of Old Harbour" }).boundingBox();
          const viewport = await mapCanvas.getByRole("group", { name: "Map navigation" }).boundingBox();
          assert.ok(
            picture.x <= viewport.x + 1 && picture.x + picture.width >= viewport.x + viewport.width - 1,
            "The game map fills the workspace width",
          );
          assert.ok(
            picture.y <= viewport.y + 1 && picture.y + picture.height >= viewport.y + viewport.height - 1,
            "The game map fills the workspace height",
          );
          const start = await marker.locator(".marinara-capability-villages-map-point").boundingBox();
          await drag(
            viewport.x + viewport.width * 0.65 - start.x - start.width / 2,
            viewport.y + viewport.height * 0.65 - start.y - start.height / 2,
          );
          if (process.env.VILLAGES_SCREENSHOT_DIR)
            await page.screenshot({
              path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "mobile-map-placement-" + view.width + ".png"),
            });
        } else await drag(24, 12);
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
        if (phone) {
          assert.ok(afterDrag.x >= 0 && afterDrag.x <= 1);
          assert.ok(afterDrag.y >= 0 && afterDrag.y <= 1);
        }
        assert.ok(afterDrag.y > beforeDrag.y);
        await expect(sheet).toHaveCount(0);
        if (view.width >= 1000) {
          const point = await marker.locator(".marinara-capability-villages-map-point").boundingBox();
          const leftOfMap = (await mapCanvas.getByRole("img", { name: "Map of Old Harbour" }).boundingBox()).x - 24;
          await drag(leftOfMap - point.x - point.width / 2, 0);
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
        await showMap();
        assert.equal(await page.evaluate(() => window.featureController.setupVenues.length), view.count + 3);
        await expect(root.getByRole("button", { name: "Simple map", exact: true })).toHaveCount(0);
        await expect(root.getByRole("button", { name: "+ Add home", exact: true })).toHaveCount(0);
        await expect(root.getByRole("button", { name: "+ Add Venue", exact: true })).toHaveCount(0);
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "venue-overview-" + view.width + ".png"),
          });
        const prepared = await page.evaluate(() => window.featureController.setupVenues);
        for (const venue of prepared) {
          const community = !(venue.occupancy.playerHome || !!venue.residentIds?.length);
          assert.equal(venue.spaces.length, community ? 2 : 1);
          assert.equal(venue.privateSpaces.length, community ? 0 : 1);
          if (!community) {
            const owner = venue.occupancy.playerHome ? "player" : venue.residentIds[0];
            assert.equal(venue.privateSpaces[0].ownerId, owner);
            assert.equal(venue.destinations[owner].sleep, "private:base");
          }
        }
        await expect(root.locator(".villages-quick-zone-summary")).toHaveCount(phone ? 0 : prepared.length);
        await expect(root.getByRole("button", { name: "Next Venues page", exact: true })).toHaveCount(0);
        await expect(settingNext()).toBeInViewport({ ratio: 1 });
        await expect(sheet).toHaveCount(0);
        await advance();
        await expect(root).toHaveAttribute("data-step", "4");
        if (phone) await enterChapter();
        if (phone) await retreat();
        await retreat();
        await expect(root).toHaveAttribute("data-step", "3");
        await enterChapter();
        assert.deepEqual(
          await page.evaluate(() => window.featureController.setupVenues),
          prepared,
          "Accepting ready layouts requires no room edits",
        );
        await editVenue("founding-home:player");
        await expect(sheet).toBeVisible();
        await expect(sheet.getByLabel("Description", { exact: true })).toHaveCount(0);
        await expect(sheet.getByRole("navigation", { name: "Venue sections" })).toBeVisible();
        await expect(sheet.getByRole("combobox")).toHaveCount(0);
        await sheet.getByRole("button", { name: "Zones", exact: true }).click();
        const common = sheet.locator('[data-layout-zone="common:base"]');
        if (view.width === 390) await common.tap();
        else await common.click();
        await expect(sheet.getByRole("group", { name: "Selected Zone", exact: true })).toHaveAttribute(
          "data-zone-id",
          "common:base",
        );
        await expect(sheet.getByRole("group", { name: "Who sleeps here?" })).toHaveCount(0);
        await expect(sheet.getByRole("group", { name: "Whose space is it?" })).toHaveCount(0);
        await expect(sheet.getByRole("navigation", { name: "Zone sections" })).toHaveCount(0);
        await expect(sheet.getByRole("button", { name: "Assignments", exact: true })).toHaveCount(0);
        await editProfile();
        await expect(sheet.getByRole("button", { name: "← Your home", exact: true })).toBeVisible();
        await expect(sheet.locator(".villages-zone-map-canvas")).toHaveCount(0);
        await expect(
          sheet
            .getByRole("region", { name: "Zone image", exact: true })
            .getByRole("button", { name: "Generate Image", exact: true }),
        ).toBeVisible();
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "zone-editing-" + view.width + ".png"),
          });
        await expect(sheet.getByRole("button", { name: "Art settings", exact: true })).toHaveCount(0);
        if (view.width === 390) {
          await closeVenue();
          await showVenuePin("founding-home:player");
          const touch = await context.newCDPSession(page);
          const readPosition = () =>
            page.evaluate(
              () => window.featureController.setupVenues.find((row) => row.id === "founding-home:player").presentation,
            );
          const pinPoint = async () => {
            const box = await marker.locator(".marinara-capability-villages-map-point").boundingBox();
            return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
          };
          const beforeTouch = await readPosition();
          const point = await pinPoint();
          await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
          await touch.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{ x: point.x + 20, y: point.y + 12 }],
          });
          await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
          await expect.poll(async () => (await readPosition()).x).toBeGreaterThan(beforeTouch.x);
          const moved = await readPosition();
          assert.ok(moved.y > beforeTouch.y, "Dragging a Venue icon moves it on both axes");
          await expect(sheet).toHaveCount(0);
          const movedPoint = await pinPoint();
          await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [movedPoint] });
          await touch.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{ x: movedPoint.x + 20, y: movedPoint.y + 12 }],
          });
          await touch.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
          assert.deepEqual(await readPosition(), moved, "Cancelling a touch drag keeps the saved position");
          const canvas = await mapCanvas.getByRole("group", { name: "Map navigation" }).boundingBox();
          const picture = mapCanvas.getByRole("img", { name: "Map of Old Harbour" });
          await mapCanvas.getByRole("button", { name: "Zoom in", exact: true }).click();
          await mapCanvas.getByRole("button", { name: "Zoom in", exact: true }).click();
          const beforePan = await picture.boundingBox();
          assert.ok(beforePan.width > canvas.width + 60, "Zoomed map has room for a horizontal pan");
          const panStart = await page.evaluate((bounds) => {
            const controls = [...document.querySelectorAll(".villages-quick-map button")].map((node) =>
              node.getBoundingClientRect(),
            );
            for (const y of [0.1, 0.3, 0.5, 0.7, 0.9])
              for (const x of [0.8, 0.6, 0.4, 0.2]) {
                const point = { x: bounds.x + bounds.width * x, y: bounds.y + bounds.height * y };
                const target = document.elementFromPoint(point.x, point.y);
                const nearControl = controls.some(
                  (box) =>
                    point.x > box.left - 32 &&
                    point.x < box.right + 32 &&
                    point.y > box.top - 32 &&
                    point.y < box.bottom + 32,
                );
                if (!nearControl && target?.closest('[aria-label="Map navigation"]') && !target.closest("button"))
                  return point;
              }
            throw Error("No map background available for the pan gesture");
          }, canvas);
          await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [panStart] });
          await touch.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{ x: panStart.x - 30, y: panStart.y }],
          });
          await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
          await expect.poll(async () => (await picture.boundingBox()).x).not.toBe(beforePan.x);
          assert.deepEqual(await readPosition(), moved, "Dragging the background pans without moving pins");
          await showVenuePin("founding-home:player");
          const oldZoom = Number(
            await mapCanvas.locator("[data-navigation-zoom]").getAttribute("data-navigation-zoom"),
          );
          const pinchStart = await pinPoint();
          await touch.send("Input.dispatchTouchEvent", {
            type: "touchStart",
            touchPoints: [{ ...pinchStart, id: 0 }],
          });
          await touch.send("Input.dispatchTouchEvent", {
            type: "touchStart",
            touchPoints: [
              { ...pinchStart, id: 0 },
              { x: pinchStart.x - 60, y: pinchStart.y, id: 1 },
            ],
          });
          await touch.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [
              { x: pinchStart.x + 30, y: pinchStart.y, id: 0 },
              { x: pinchStart.x - 90, y: pinchStart.y, id: 1 },
            ],
          });
          await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
          await touch.detach();
          await expect
            .poll(async () =>
              Number(await mapCanvas.locator("[data-navigation-zoom]").getAttribute("data-navigation-zoom")),
            )
            .toBeGreaterThan(oldZoom);
          assert.deepEqual(await readPosition(), moved, "A pinch starting on a Venue icon zooms without saving a drag");
          await expect(sheet).toHaveCount(0);
          await showVenuePin("founding-home:player");
          const target = await pinPoint();
          await page.touchscreen.tap(target.x, target.y);
          await expect(sheet).toBeVisible();
          await expect(sheet.getByRole("button", { name: "← Map", exact: true })).toBeFocused();
          assert.deepEqual(await readPosition(), moved, "A tap opens the Venue without moving it");
          await manageVenue();
          await expect(sheet.getByRole("button", { name: "Move on map", exact: true })).toHaveCount(0);
          await sheet.getByRole("button", { name: "Zones", exact: true }).click();
          await common.tap();
        }
        const draggedPosition = await page.evaluate(
          () => window.featureController.setupVenues.find((row) => row.id === "founding-home:player").presentation,
        );

        if (view.width === 1366) {
          await sheet
            .getByRole("region", { name: "Zone image", exact: true })
            .getByRole("button", { name: "Generate Image", exact: true })
            .click();
          await expect(sheet.locator(".marinara-capability-villages-venue-zone-photo")).toBeVisible();
          await expect(sheet.getByRole("button", { name: "View fullsize", exact: true })).toBeEnabled();
          await closeVenue();
          assert.equal(generatedImages, 3, "Map and Zone artwork require explicit clicks");
          assert.deepEqual(
            artRequests.slice(1).map((row) => [row.target, row.sceneryStyleProfileId, row.sceneryArtStyle]),
            [
              ["map", null, "Watercolor with muted teal and warm amber."],
              ["venue", null, "Watercolor with muted teal and warm amber."],
            ],
          );
          assert.equal(artRequests[0].structure, "A circular Village around a central pond.");
          assert.equal(artRequests[0].negative, "neon colors");
        } else {
          await closeVenue();
        }
        await expect(settingNext()).toBeEnabled();
        await expect(mapWarning).toHaveCount(0);
        if (view.width === 1366) {
          await expect
            .poll(() =>
              page.evaluate(() => {
                const draft = window.featureController.savedSetupDraft?.data;
                return (
                  !!draft?.mapImage &&
                  draft.phase === "Venues" &&
                  draft.venues.some((row) => row.id === "founding-home:player" && row.presentation.x !== null)
                );
              }),
            )
            .toBe(true);
          const readsBeforeVenueReload = portraitReads;
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await expect(root).toHaveAttribute("data-step", "3");
          await expect.poll(() => portraitReads).toBeGreaterThan(readsBeforeVenueReload);
          const founderHome = await page.evaluate(
            () =>
              window.featureController.setupVenues.find((row) =>
                row.residentIds?.includes(window.featureController.setupFoundingVillagerIds[0]),
              ).id,
          );
          await editVenue(founderHome);
          await sheet.getByRole("button", { name: "Assignments", exact: true }).click();
          await sheet.getByRole("button", { name: /^Residents/ }).click();
          const residentCard = sheet.locator(".marinara-capability-villages-directory-card").first();
          await expect(residentCard.locator("img")).toBeVisible();
          assert.ok(
            (await residentCard.boundingBox()).width <= 146,
            "Home cards keep a compact portrait width after reload",
          );
          await closeVenue();
          await expect
            .poll(() =>
              page.evaluate(() => [
                window.featureController.sceneryStyleProfileId,
                window.featureController.sceneryStyle,
                window.featureController.setupMapPrompt,
                window.featureController.setupMapNegativePrompt,
              ]),
            )
            .toEqual([
              null,
              "Watercolor with muted teal and warm amber.",
              "A circular Village around a central pond.",
              "neon colors",
            ]);
          assert.deepEqual(
            await page.evaluate(
              () => window.featureController.setupVenues.find((row) => row.id === "founding-home:player").presentation,
            ),
            draggedPosition,
          );
        }
        const readPins = () =>
          page.evaluate(() =>
            Object.fromEntries(
              window.featureController.setupVenues.map(({ id, presentation: { mapId, x, y } }) => [
                id,
                { mapId, x, y },
              ]),
            ),
          );
        const savedPins = await readPins();
        await expect(button("Draft Venues")).toBeEnabled();
        assert.equal(suggestions, 0);
        failVenueConnection = true;
        await button("Draft Venues").click();
        await expect(root.getByText("The System connection is unavailable.", { exact: false })).toBeVisible();
        await button("Check Model Connections").click();
        const repair = root.getByRole("dialog", { name: "Model Connections", exact: true });
        await repair.getByRole("button", { name: "Back", exact: true }).click();
        assert.equal(suggestions, 1, "Checking connections never retries generation");
        failVenueConnection = false;
        await button("Retry draft").click();
        await expect.poll(() => suggestions).toBe(2);
        await root.getByRole("button", { name: "Use changes", exact: true }).click();
        await expect
          .poll(() =>
            page.evaluate(
              () => window.featureController.setupVenues.find((row) => row.id === "founding-community").name,
            ),
          )
          .toBe("Community Courtyard");
        assert.deepEqual(await readPins(), savedPins, "Drafted Venue text keeps each existing map pin");
        assert.ok(
          await page.evaluate(() =>
            window.featureController.setupVenues
              .filter((row) => row.occupancy.playerHome || !!row.residentIds?.length)
              .every((row) => row.residentIds.length + Number(row.occupancy.playerHome) === 1),
          ),
        );
        await editVenue("founding-home:player");
        await manageVenue();
        const appearance = sheet.getByLabel("Description", { exact: true });
        const savedAppearance = await appearance.inputValue();
        await appearance.fill("");
        await closeVenue();
        await advance();
        await expect(sheet).toBeVisible();
        await expect(appearance).toHaveAttribute("aria-invalid", "true");
        if (phone) await expect(appearance).not.toBeFocused();
        else await expect(appearance).toBeFocused();
        await appearance.fill(savedAppearance);
        await closeVenue();
        await editVenue("founding-home:player");
        await sheet.getByRole("button", { name: "Zones", exact: true }).click();
        await common.click();
        await expect(sheet.getByRole("button", { name: "← Your home", exact: true })).toBeFocused();
        await editProfile();
        const purpose = sheet.getByLabel("Used for", { exact: true });
        const savedPurpose = await purpose.inputValue();
        await purpose.fill("");
        await expect
          .poll(() =>
            page.evaluate(
              () =>
                window.featureController.setupVenues.find((row) => row.id === "founding-home:player").spaces[0].purpose,
            ),
          )
          .toBe("");
        await closeVenue();
        await advance();
        await expect(sheet.locator(".villages-quick-selected-zone")).toHaveAttribute("data-zone-id", "common:base");
        if (phone) await expect(purpose).not.toBeFocused();
        else await expect(purpose).toBeFocused();
        await purpose.fill(savedPurpose);
        await closeVenue();
        await expect(root).toHaveAttribute("data-step", "3");
        await expect(sheet).toHaveCount(0);
        await editVenue("founding-home:player");
        await manageVenue();
        await expect(sheet.getByLabel("Description", { exact: true })).toHaveValue(savedAppearance);
        await closeVenue();
        await advance();
        await expect(root).toHaveAttribute("data-step", "4");
        await expectPose("proud");
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `mari-proud-${view.width}-${view.height}.png`),
          });
        await enterChapter();
        const overview = root.locator(".villages-founding-review");
        if (view.width === 1366)
          await page.evaluate(() =>
            window.featureController.setSetupContext((context) => ({
              ...context,
              circumstances: [
                { scope: "village", summary: "An existing saved village fact.", venueId: "", zoneId: "" },
              ],
            })),
          );
        await bounds("review");
        await expect(overview).toHaveAttribute("data-page", "people");
        if (view.width === 390 && view.height === 844) {
          const originalHome = await page.evaluate(() =>
            window.featureController.setupVenues.find((venue) => venue.residentIds?.includes("finn")),
          );
          await overview.getByRole("button", { name: "Finn · Remove", exact: true }).click();
          await expect
            .poll(() => page.evaluate(() => window.featureController.setupWorkspace.unusedHomes?.length))
            .toBe(1);
          assert.equal(
            await page.evaluate(() =>
              window.featureController.setupVenues.some((venue) => venue.residentIds?.includes("finn")),
            ),
            false,
          );
          await expect
            .poll(() =>
              page.evaluate(() => window.featureController.savedSetupDraft?.data.workspace.unusedHomes?.length),
            )
            .toBe(1);
          await page.reload();
          const readsBeforeReview = portraitReads;
          await page.addScriptTag({ content: foundingBundle });
          await expect(overview).toHaveAttribute("data-page", "people");
          await expect.poll(() => portraitReads).toBeGreaterThan(readsBeforeReview);
          await expect(overview.locator(".villages-selected-villager img")).toHaveCount(1);
          await overview.getByRole("button", { name: "+ Add villager", exact: true }).click();
          const picker = page.getByRole("dialog", { name: "Choose founding villagers", exact: true });
          await picker.getByRole("button", { name: "Finn · Add", exact: true }).click();
          await picker.getByRole("button", { name: "Confirm", exact: true }).click();
          assert.deepEqual(
            await page.evaluate(() =>
              window.featureController.setupVenues.find((venue) => venue.residentIds?.includes("finn")),
            ),
            originalHome,
            "Removing, saving, reloading and re-adding a founder restores their edited home and pin",
          );
          await expect(overview.locator(".villages-selected-villager img")).toHaveCount(2);
        }
        await expect(overview.getByRole("heading", { name: "You", exact: true })).toBeVisible();
        await expect(overview.getByRole("heading", { name: "Initial residents", exact: true })).toBeVisible();
        await expect(overview.getByRole("button", { name: / · Change$/ })).toBeVisible();
        await expect(overview.getByRole("button", { name: "Edit People", exact: true })).toHaveCount(0);
        await expect(overview.getByRole("button", { name: "Next", exact: true })).toBeInViewport({ ratio: 1 });
        for (const row of await overview.locator(".villages-selected-villager").all()) {
          await row.evaluate((node) => node.scrollIntoView({ block: "center", inline: "nearest" }));
          await expect(row).toBeInViewport({ ratio: 1 });
          assert.equal(await row.evaluate((node) => node.scrollHeight <= node.clientHeight + 1), true);
        }
        const arrangements = overview.getByRole("region", { name: "Home and work arrangements", exact: true });
        await arrangements.locator("h3").last().scrollIntoViewIfNeeded();
        await expect(arrangements.locator("h3").last()).toBeInViewport({ ratio: 1 });
        await expect(overview.getByRole("button", { name: "Next", exact: true })).toBeInViewport({ ratio: 1 });
        if (view.width === 320 || view.width === 1366) {
          const residentIds = await page.evaluate(() => window.featureController.setupFoundingVillagerIds);
          await page.evaluate(() => window.featureController.setSetupFoundingVillagerIds([]));
          await overview.getByRole("button", { name: "Next", exact: true }).click();
          await expect(overview).toHaveAttribute("data-page", "people");
          await expect(overview.locator("[data-founding-problem]")).toContainText(
            "Choose one to three available founding villagers.",
          );
          await page.evaluate((ids) => window.featureController.setSetupFoundingVillagerIds(ids), residentIds);
        }
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `review-people-${view.width}-${view.height}.png`),
          });
        await overview.getByRole("button", { name: "Next", exact: true }).click();
        await expect(overview).toHaveAttribute("data-page", "setting");
        await overview.getByRole("button", { name: "Back", exact: true }).click();
        await expect(overview).toHaveAttribute("data-page", "people");
        await overview.getByRole("button", { name: "Next", exact: true }).click();
        await expect(overview.getByLabel("Location description", { exact: true })).toHaveValue(
          await page.evaluate(() => window.featureController.setupSetting),
        );
        if (view.width === 320 || view.width === 1366) {
          const description = overview.getByLabel("Location description", { exact: true });
          const original = await description.inputValue();
          await description.fill("");
          await overview.getByRole("button", { name: "Next", exact: true }).click();
          await expect(overview).toHaveAttribute("data-page", "setting");
          await expect(description).toHaveAttribute("aria-invalid", "true");
          await description.fill(original);
        }
        await overview.getByRole("button", { name: "World", exact: true }).click();
        await expect(overview.getByLabel("World rules", { exact: true })).toHaveValue("The sun never sets.");
        await overview.getByRole("button", { name: "Lorebooks", exact: true }).click();
        await expect(loreDialog).toHaveCount(0);
        const inlineLore = overview.getByRole("region", { name: "Village Lorebooks", exact: true });
        await expect(inlineLore).toBeVisible();
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `review-lorebooks-${view.width}-${view.height}.png`),
          });
        await expect(overview.getByRole("button", { name: "Lorebooks", exact: true })).toHaveAttribute(
          "aria-pressed",
          "true",
        );
        for (const control of await inlineLore.locator("input,button").all())
          await expect(control).toBeInViewport({ ratio: 1 });
        assert.equal(
          await inlineLore.evaluate((node) => node.scrollHeight <= node.clientHeight + 1),
          true,
          "Lorebooks fits inside Setting review without a scrolling body",
        );
        assert.equal(await overview.evaluate((node) => node.scrollHeight <= node.clientHeight + 1), true);
        const loreBounds = await inlineLore.boundingBox();
        const reviewFooter = await overview.locator(".villages-review-actions").boundingBox();
        assert.ok(
          loreBounds.y + loreBounds.height <= reviewFooter.y + 1,
          "Inline Lorebooks stays above the shared Review navigation",
        );
        await expect(overview.getByRole("button", { name: "Next", exact: true })).toHaveCount(1);
        await inlineLore.getByRole("button", { name: "Next Lorebooks page", exact: true }).click();
        await inlineLore.getByRole("searchbox", { name: "Search Lorebooks", exact: true }).fill("Community archive 3");
        const loreChoice = inlineLore.getByRole("checkbox", { name: "Community archive 3", exact: true });
        await loreChoice.check();
        await inlineLore.getByRole("textbox", { name: "Lorebook Token Budget", exact: true }).fill("1700");
        await overview.getByRole("button", { name: "World", exact: true }).click();
        await overview.getByRole("button", { name: "Lorebooks", exact: true }).click();
        await inlineLore.getByRole("searchbox", { name: "Search Lorebooks", exact: true }).fill("Community archive 3");
        await expect(loreChoice).toBeChecked();
        await expect(inlineLore.getByRole("textbox", { name: "Lorebook Token Budget", exact: true })).toHaveValue(
          "1700",
        );
        await loreChoice.uncheck();
        await inlineLore.getByRole("textbox", { name: "Lorebook Token Budget", exact: true }).fill("1600");
        await inlineLore.getByRole("searchbox", { name: "Search Lorebooks", exact: true }).fill("");
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `review-setting-${view.width}-${view.height}.png`),
          });
        await advance();
        await expect(root).toHaveAttribute("data-review-stage", "map");
        await expect(overview).toHaveCount(0);
        const positions = await page.evaluate(() =>
          window.featureController.setupVenues.map((venue) => [venue.id, venue.presentation.x, venue.presentation.y]),
        );
        const reviewMap = root.getByRole("group", { name: "Map navigation", exact: true });
        const mapStage = root.locator(".marinara-capability-villages-stage");
        await expect(root.locator("[data-pin-id]").first()).toBeVisible();
        await expect(mapStage).toHaveAttribute("data-pin-movable", "true");
        await expect(button("Reset map view")).toBeVisible();
        if (phone) {
          const box = await reviewMap.boundingBox();
          if (process.env.VILLAGES_SCREENSHOT_DIR)
            await page.screenshot({
              path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `review-map-initial-${view.width}-${view.height}.png`),
            });
          assert.ok(
            box.height >= frame.height * 0.65 && box.width >= frame.width * 0.95,
            `Review reuses the full-screen Founding map workspace: ${JSON.stringify(box)} in ${JSON.stringify(frame)}`,
          );
        }
        await showVenuePin("founding-home:player");
        const camera = await reviewMap.locator("img").getAttribute("style");
        await root.locator('[data-pin-id="founding-home:player"]').click();
        await expect(sheet.getByRole("button", { name: "About", exact: true })).toBeVisible();
        await expect(sheet.getByRole("button", { name: "Zones", exact: true })).toBeVisible();
        await expect(sheet.getByRole("button", { name: "Assignments", exact: true })).toBeVisible();
        await sheet.getByRole("button", { name: "← Map", exact: true }).click();
        await expect(reviewMap.locator("img")).toHaveAttribute("style", camera);
        assert.deepEqual(
          await page.evaluate(() =>
            window.featureController.setupVenues.map((venue) => [venue.id, venue.presentation.x, venue.presentation.y]),
          ),
          positions,
          "Inspecting Venues preserves saved placements",
        );
        const homeMarker = root.locator('[data-pin-id="founding-home:player"]');
        const homeX = positions.find(([id]) => id === "founding-home:player")[1];
        const currentHomeX = () =>
          page.evaluate(
            () =>
              window.featureController.setupVenues.find((venue) => venue.id === "founding-home:player").presentation.x,
          );
        await homeMarker.press("ArrowRight");
        await expect.poll(currentHomeX).not.toBe(homeX);
        await homeMarker.press("ArrowLeft");
        await expect.poll(currentHomeX).toBe(homeX);
        const options = root.getByRole("button", { name: "Map options", exact: true });
        await options.click();
        await expect(button("Move markers")).toHaveCount(0);
        await button("Map artwork").click();
        const mapEditor = page.getByRole("dialog", { name: "Review map", exact: true });
        await expect(mapEditor.getByRole("region", { name: "Map artwork preview", exact: true })).toBeVisible();
        await mapEditor.getByRole("button", { name: "Done", exact: true }).click();
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(
              process.env.VILLAGES_SCREENSHOT_DIR,
              "review-workspace-" + view.width + "-" + view.height + ".png",
            ),
          });
        await advance();
        await expect(root).toHaveAttribute("data-review-stage", "confirm");
        await expect(root.getByText("Ready to found Coastal Community?", { exact: true })).toBeVisible();
        await retreat();
        await expect(root).toHaveAttribute("data-review-stage", "map");
        await expect(button("Reset map view")).toBeVisible();
        await advance();
        await button("Found village").click();
        await expect(root).toHaveAttribute("data-review-stage", "sendoff");
        assert.equal(setupPosts, 0, "Confirmation and scripted dialogue do not dispatch founding or model requests");
        await expectPose("presenting");
        await retreat();
        await expect(root).toHaveAttribute("data-review-stage", "confirm");
        await button("Found village").click();
        await advance();
        await expect(root).toHaveAttribute("data-review-stage", "playful");
        await expect(root.getByText("Maybe I'll see you there!", { exact: true })).toBeVisible();
        await expectPose("playful");
        if (view.width === 320 || view.width === 1366) {
          await page.evaluate(() =>
            window.featureController.updateSetupMapRequest({
              id: "paused-review-map",
              sourceKey: "review-map",
              startedAt: new Date().toISOString(),
              phase: "paused",
            }),
          );
          await expect(button("Enter village")).toBeDisabled();
          assert.equal(setupPosts, 0, "A paused map attempt still blocks Enter village after confirmation");
          await page.evaluate(() => window.featureController.updateSetupMapRequest(null));
        }
        await expect(button("Enter village")).toBeEnabled();
        const mariBox = await stage.boundingBox();
        assert.ok(
          mariBox.x + mariBox.width / 2 < frame.x + frame.width * 0.5,
          "Mari stays on the left during her send-off",
        );
        await expect(button("Enter village")).toBeInViewport({ ratio: 1 });
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(
              process.env.VILLAGES_SCREENSHOT_DIR,
              "review-sendoff-" + view.width + "-" + view.height + ".png",
            ),
          });
        await button("Enter village").click();
        if (view.width === 1366) {
          await expect(root.getByRole("alert")).toContainText("Fixture founding failure.");
          await expect(root).toHaveAttribute("data-review-stage", "playful");
          await expect(button("Enter village")).toBeEnabled();
          await button("Enter village").click();
        }
        await expect.poll(() => payload).toBeTruthy();
        assert.equal(
          setupPosts,
          view.width === 1366 ? 2 : 1,
          "Only the final action submits, with one explicit retry on failure",
        );
        assert.equal(payload.name, "Coastal Community");
        assert.equal(payload.timeZone, snapshot.clock?.timeZone || snapshot.village.timeZone);
        assert.equal(
          payload.startingLocationName,
          "Old Harbour",
          "The saved draft retains the location separately from the Village",
        );
        assert.equal(payload.openingVenueId, undefined, "The server chooses the opening host");
        assert.equal(payload.worldRules, "The sun never sets.");
        assert.deepEqual(
          payload.circumstances,
          view.width === 1366
            ? [{ scope: "village", summary: "An existing saved village fact.", venueId: "", zoneId: "" }]
            : [],
          "Removing First day preserves facts from existing saved drafts",
        );
        assert.equal(Object.hasOwn(payload, "foundingHistory"), false);
        assert.equal(
          payload.venues.length,
          view.count + 3,
          "Founding contains the selected homes and two Community Venues",
        );
        const community = payload.venues.find((row) => row.id === "founding-community");
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
        assert.equal(generatedImages, 3 * Number(view.width === 1366));
        assert.equal(suggestions, 2);
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
      assert.equal(values.setSetupLocationName, "");
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
    assert.equal(fresh.setSetupLocationName, "");
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
