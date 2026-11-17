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
        const context = await browser.newContext({
          viewport: { width: view.width, height: view.height },
          hasTouch: view.width < 600,
          isMobile: view.width < 600,
          reducedMotion: view.height === 650 ? "reduce" : "no-preference",
        });
        const draftWithLore = view.width === 1280 || view.width === 390;
        const worldBrief = "The Relay Belt is a chain of settlements on old cargo routes.";
        await mockEngineLookups(context);
        const page = await context.newPage();
        if (view.width === 390 && view.height === 844)
          await page.addInitScript(() => {
            const viewport = new EventTarget();
            Object.assign(viewport, { height: innerHeight, width: innerWidth, offsetTop: 0 });
            Object.defineProperty(window, "visualViewport", { configurable: true, value: viewport });
          });
        let payload,
          suggestions = 0,
          settingReceipt,
          settingCalls = 0,
          settingReady = false,
          failVenueConnection = false,
          holdConnectionRead = false,
          connectionReadHeld = false,
          generatedImages = 0,
          generationImage,
          mapReceipt;
        const artRequests = [];
        let modelSelection = { systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" };
        await page.route("**/api/villages**", async (route) => {
          const path = new URL(route.request().url()).pathname,
            method = route.request().method();
          const send = (value) =>
            fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(value) });
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
              status: "complete",
              error: "",
              result: { image: generationImage, width: 1536, height: 1024 },
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
                "worldBrief",
                "worldRules",
              ]);
              assert.equal(body.worldRules, "The sun never sets.");
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
                        : row.id === "founding-garden"
                          ? "Community Garden"
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
          if (path.endsWith("/catalog")) return send({ characters });
          if (path.endsWith("/lorebooks"))
            return send({ books: [{ id: "relay-belt", name: "Relay Belt", enabled: true }] });
          if (path.endsWith("/image-style-profiles"))
            return send({ defaultProfileId: "fixture-ink", profiles: [{ id: "fixture-ink", name: "Ink" }] });
          return send(snapshot);
        });
        await page.route("**/api/connections", (route) =>
          fulfill(route, {
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
              { id: "talk", name: "Language model", provider: "language", defaultForAgents: true },
              { id: "alt-talk", name: "Draft model", provider: "language" },
              { id: "image", name: "Image model", provider: "image_generation", profileImportReviewRequired: "true" },
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
        const phone = view.width <= 727;
        const work = root.locator(".villages-forging-body");
        const enterChapter = async () => {
          const guide = root.locator(".villages-chapter-guide");
          if (!phone || (await root.locator("dialog.villages-chapter-menu[open]").count())) return;
          await expect(work).toBeHidden();
          await expect(guide.getByText("Professor Mari", { exact: true })).toBeVisible();
          await expect(button("Next")).toBeInViewport({ ratio: 1 });
          await button("Next").click();
          await expect(root.locator("dialog.villages-chapter-menu[open]")).toBeVisible();
          await expect(work).toBeVisible();
        };
        const forward = (desktopLabel) => button(phone ? "Next" : desktopLabel);
        const settingNext = () => forward("Let’s meet the villagers");
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
        const editVenue = async (id) => {
          if (await sheet.count()) await sheet.getByRole("button", { name: "Done", exact: true }).click();
          await showVenue(id);
          await root.locator('[data-venue-id="' + id + '"]').click();
        };

        const bounds = async (phase) => {
          assert.deepEqual(await root.boundingBox(), frame, "Founding frame stays the same size across pages");
          assert.equal(
            await root.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
            true,
            "No horizontal overflow on " + phase,
          );
          assert.deepEqual(await stage.boundingBox(), stageBounds, "Mari keeps her standing mark between phases");
          if (phase !== "setting" && !phone) {
            const guide = root.locator(".villages-chapter-guide");
            const sprite = stage.locator("img");
            await expect.poll(() => sprite.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
            const guideBox = await guide.boundingBox();
            const workBox = await root.locator(".villages-forging-body").boundingBox();
            const spriteBox = await sprite.boundingBox();
            const dialogueBox = await guide.locator(".villages-setting-dialogue").boundingBox();
            assert.ok(spriteBox.x + spriteBox.width <= dialogueBox.x + 1, "Mari stands beside her dialogue");
            assert.ok(
              guideBox.x + guideBox.width <= workBox.x + 1 ||
                (phase === "venues" && guideBox.y + guideBox.height <= workBox.y + 1),
              "The dialogue leaves room for the desktop workspace",
            );
            if (process.env.VILLAGES_SCREENSHOT_DIR)
              await page.screenshot({
                path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `${phase}-mari-${view.width}.png`),
              });
          }
          await (
            phase === "setting"
              ? settingNext()
              : phase === "review"
                ? button("Found village")
                : forward(
                    phase === "people"
                      ? "Let’s set up their homes"
                      : phase === "venues"
                        ? "Let’s look it over"
                        : "Found village",
                  )
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
            assert.ok((await map.boundingBox()).height >= 200, "The playable map keeps enough room to place markers");
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
            await community.getByText("Opening gathering", { exact: true }).scrollIntoViewIfNeeded();
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
        const start = button("START");
        await expect(root.getByRole("heading", { name: "Villages", exact: true })).toBeInViewport({ ratio: 1 });
        await expect(start).toBeInViewport({ ratio: 1 });
        await expect(root.getByRole("region", { name: "Professor Mari", exact: true })).toHaveCount(0);
        await expect(root.getByRole("list", { name: "Founding phases" })).toHaveCount(0);
        const title = root.locator(".villages-founding-title");
        const stage = root.locator(".villages-setting-stage");
        const sidePose = stage.locator('img[src$="mari-founding-looking-up.webp"]');
        const frontPose = stage.locator('img[src$="mari-founding-happy.webp"]');
        await expect(sidePose).toBeInViewport({ ratio: 1 });
        await expect.poll(() => sidePose.evaluate((sprite) => sprite.naturalWidth)).toBeGreaterThan(0);
        await expect(frontPose).toHaveCSS("opacity", "0");
        const sideBounds = await sidePose.boundingBox();
        const titleBounds = await title.boundingBox();
        const stageBounds = await stage.boundingBox();
        assert.ok(
          phone ? sideBounds.y + sideBounds.height <= titleBounds.y : sideBounds.x + sideBounds.width <= titleBounds.x,
          "The title leaves room for Mari’s standing mark",
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
        await expect(frontPose).toHaveCSS("opacity", "0");
        await expect(sidePose).toHaveCSS("animation-name", "none");
        assert.deepEqual(
          await sidePose.boundingBox(),
          titlePose,
          "Mari holds her START position while models are chosen",
        );
        await expect(models.getByRole("button", { name: /^Images / })).toHaveCount(0);
        await expect(models.getByRole("button", { name: /^GM / })).toContainText("Language model");
        await expect(models.getByRole("button", { name: /^GM / })).toContainText("Scenes and dialogue");
        await expect(system).toContainText("Language model");
        await expect(system).toContainText("Drafts and village activity");
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
          await page.keyboard.press("Escape");
          await expect(modelGate.getByRole("button", { name: "Next" })).toBeDisabled();
          await page.evaluate(() => window.expireConnectionRead());
          const timedOut = models.getByRole("alert");
          await expect(timedOut).toContainText("Checking model connections timed out.");
          holdConnectionRead = false;
          await timedOut.getByRole("button", { name: "Retry", exact: true }).click();
          await system.click();
          await picker.getByRole("button", { name: /^Draft model/ }).click();
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
        await expect(root).toHaveCSS("background-image", titleBackdrop);
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
          ["Setting", "People", "Venues and Map", "Review"],
        );
        const scene = root.getByRole("region", { name: "Professor Mari", exact: true });
        await expect(title).toHaveCount(0);
        await expect(sidePose).toHaveCount(0);
        await expect(frontPose).toHaveCSS("opacity", "1");
        await expect(frontPose).toHaveCSS("animation-name", "none");
        assert.deepEqual(await stage.boundingBox(), stageBounds, "Mari turns without moving to a different spot");
        const currentStar = root.getByRole("list", { name: "Founding phases" }).locator('[aria-current="step"]');
        await expect(scene.locator('p[aria-live="polite"]')).toBeFocused();
        const line = scene.locator("p[aria-live=polite]");
        const nextLine = () => scene.getByRole("button", { name: "Next", exact: true }).click();
        await expect(line).toHaveText(/I’m Mari/);
        await expect(button("Draft with Mari")).toHaveCount(0);
        await nextLine();
        await expect(line).toHaveText(/^Welcome to Villages\./);
        await nextLine();
        await expect(line).toHaveText(/make a life with a community/);
        await nextLine();
        await expect(line).toHaveText(/Want to build it together/);
        await expect(button("Draft with Mari")).toBeVisible();
        await expect(button("Set it up myself")).toBeVisible();
        if (!phone) {
          const sprite = stage.locator("img");
          const portrait = await sprite.boundingBox();
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
        await expect(button("Draft with Mari")).toBeInViewport({ ratio: 1 });
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "founding-welcome-" + view.width + ".png"),
          });
        const settingPanel = root.getByRole(phone ? "dialog" : "region", { name: "Your setting" });
        const villageName = root.getByLabel("Village Name", { exact: true });
        const mapName = root.getByLabel("First map name", { exact: true });
        const mapDescription = root.getByLabel("Location description", { exact: true });
        if (view.width === 390 || view.width === 1366) {
          await button("Set it up myself").click();
          await expect(villageName).toBeVisible();
          await expect(root.getByLabel("Tell Mari about your village")).toHaveCount(0);
          await villageName.fill("Handmade Harbor");
          await expect
            .poll(() =>
              page.evaluate(() => {
                const saved = window.featureController.savedSetupDraft?.data;
                return [saved?.workspace?.settingManual, saved?.name];
              }),
            )
            .toEqual([true, "Handmade Harbor"]);
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await expect(villageName).toHaveValue("Handmade Harbor");
          assert.equal(settingCalls, 0, "Manual setup never dispatches a Mari draft");
          await villageName.fill(phone ? "Coastal Community" : "");
          if (phone) await mapName.fill("My starting location");
          if (phone) await settingPanel.getByRole("button", { name: "Close Your setting" }).click();
          await scene.getByRole("button", { name: "Back", exact: true }).click();
        }
        await button("Draft with Mari").click();
        await expect(currentStar).toHaveAttribute("aria-label", "Setting");
        const hierarchy = root.getByRole("img", { name: /^World, Village, Map, Venue, Zone/ });
        const layer = async (name) => {
          await expect(hierarchy).toHaveAccessibleName(`World, Village, Map, Venue, Zone. Current layer: ${name}`);
          await expect(hierarchy.locator("[data-active] text")).toHaveText(name);
          assert.deepEqual(await stage.boundingBox(), stageBounds, "The chart leaves Mari’s standing mark in place");
        };
        await layer("World");
        await expect(line).toHaveText(/^See these five layers\?/);
        await expect(button("Choose lorebooks")).toHaveCount(0);
        await expect(hierarchy).toHaveCSS("background-color", /^rgba\(.+, 0\.[1-9]/);
        const presenting = stage.locator('img[src$="mari-founding-presenting.webp"]');
        await expect(presenting).toHaveCSS("opacity", "1");
        await expect(presenting).toHaveJSProperty("naturalHeight", 600);
        const portraitBox = await presenting.boundingBox();
        const treeBox = await hierarchy.boundingBox();
        const railBox = await root.getByRole("list", { name: "Founding phases" }).boundingBox();
        const dialogueBox = await scene.locator(".villages-setting-dialogue").boundingBox();
        assert.ok(treeBox.y >= railBox.y + railBox.height, "The chart clears the phase rail");
        assert.ok(treeBox.x + treeBox.width <= portraitBox.x, "The chart sits to the viewer’s left of Mari’s gesture");
        assert.ok(
          phone
            ? Math.max(portraitBox.y + portraitBox.height, treeBox.y + treeBox.height) <= dialogueBox.y
            : portraitBox.x + portraitBox.width <= dialogueBox.x,
          "Dialogue sits below the illustration on phones and to its right on desktop",
        );
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
        await nextLine();
        await expect(line).toHaveText(/^Got Lorebooks\?/);
        await expect(button("Choose lorebooks")).toHaveCount(0);
        await nextLine();
        await expect(line).toHaveText(/^Which Lorebooks should I have/);
        await expect(root.getByRole("searchbox", { name: "Search Lorebooks" })).toHaveCount(0);
        if (draftWithLore) {
          await button("Choose lorebooks").click();
          const picker = root.getByRole("dialog", { name: "Choose Lorebooks", exact: true });
          const relay = picker.getByRole("checkbox", { name: "Relay Belt" });
          await relay.check();
          if (phone) {
            const budget = picker.getByRole("textbox", { name: "Lorebook Token Budget", exact: true });
            await budget.fill("1200");
            await picker.getByRole("button", { name: "Close Choose Lorebooks" }).click();
            await button("Choose lorebooks").click();
            await expect(relay).not.toBeChecked();
            await relay.check();
            await expect(budget).toHaveValue("1600");
          }
          await picker.getByRole("button", { name: "Done", exact: true }).click();
        } else await button("Skip for now").click();
        await layer("World");
        await expect(line).toHaveText(/^What’s out past the Village/);
        const worldField = root.getByLabel(phone ? "World description" : "The larger world");
        const worldPopup = root.getByRole("dialog", { name: "The wider world", exact: true });
        if (phone) {
          await expect(worldField).toHaveCount(0);
          await button("Describe world").click();
          await expect(worldPopup).toBeVisible();
        }
        await root.getByLabel("World rules", { exact: true }).fill("The sun never sets.");
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
          if (phone) await button("Describe world").click();
          await expect(worldField).toHaveValue(worldBrief);
        }
        if (phone) await worldPopup.getByRole("button", { name: "Done", exact: true }).click();
        else await button(draftWithLore ? "Use this world" : "Skip world description").click();
        await layer("Village");
        await expect(line).toHaveText(/^The Village is your whole community/);
        await expect(villageName).toBeHidden();
        await nextLine();
        await layer("Map");
        await expect(line).toHaveText(/^A Map is where we actually play/);
        await expect(villageName).toBeHidden();
        await nextLine();
        await expect(line).toHaveText(/^Each Map covers one locale/);
        await nextLine();
        await expect(line).toHaveText(/^What do we call the Village/);
        await expect(currentStar).toHaveAttribute("aria-label", "Setting");
        assert.equal(settingCalls, 0, "The opening beats do not call a model");
        const draftPopup = root.getByRole("dialog", { name: "Draft with Mari", exact: true });
        const villageBrief = root.getByLabel(phone ? "Village description" : "Tell Mari about your village", {
          exact: true,
        });
        const openBrief = async (label) => {
          if (phone) {
            await expect(villageBrief).toHaveCount(0);
            await scene.getByRole("button", { name: label, exact: true }).click();
            await expect(draftPopup).toBeVisible();
          }
        };
        const submitBrief = (label) =>
          (phone ? draftPopup : scene).getByRole("button", { name: label, exact: true }).click();
        const closeSetting = () =>
          settingPanel.getByRole("button", { name: "Close Your setting", exact: true }).click();
        if (phone) {
          await expect(settingPanel).toBeHidden();
          if (!draftWithLore) {
            await button("Enter my setting").click();
            await expect(settingPanel).toBeVisible();
            await villageName.fill("Coastal Community");
          }
        } else {
          await settingNext().click();
          await expect(villageName).toBeFocused();
          await villageName.fill("Coastal Community");
          await settingNext().click();
          await expect(mapName).toBeFocused();
          if (draftWithLore) await mapName.fill("My starting location");
        }
        if (draftWithLore) {
          const originalStage = phone ? null : await stage.boundingBox();
          await openBrief("Draft with Mari");
          if (view.width === 390 && view.height === 844) {
            await expect(draftPopup.getByText("1 lorebook selected for drafting")).toBeVisible();
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
          await villageBrief.fill("Our village is a converted cargo ship.");
          await submitBrief("Draft with Mari");
          await expect(line).toContainText("I’ll replace what’s in your setting");
          assert.equal(settingCalls, 0, "Mari asks before sending a replacement request");
          await button("Keep my setting").click();
          if (phone) await expect(settingPanel).toBeVisible();
          else await expect(button("Draft with Mari")).toBeFocused();
          await expect(villageName).toHaveValue("Coastal Community");
          assert.equal(settingCalls, 0, "Keeping the setting does not send a request");
          if (phone) await closeSetting();
          await openBrief("Draft with Mari");
          await submitBrief("Draft with Mari");
          await button("Replace and draft").click();
          await expect.poll(() => settingCalls).toBe(1);
          if (!phone) await mapName.fill("");
          else await expect(settingPanel).toBeHidden();
          settingReady = true;
          if (phone) await expect(settingPanel).toBeVisible();
          await expect(mapDescription).toHaveValue("A shared galley aboard a cargo ship.");
          await expect(villageName).toHaveValue("Wayfarer");
          await expect(mapName).toHaveValue(phone ? "Main Deck" : "");
          assert.equal(settingCalls, 1, "One explicit action dispatches one request");
          const originalEditorHeight = (await settingPanel.boundingBox()).height;
          if (phone) await closeSetting();
          await openBrief("Draft again with Mari");
          await villageBrief.fill("Our village is inside a dumpster.");
          await submitBrief("Draft again with Mari");
          await expect(line).toContainText("I’ll replace what’s in your setting");
          await button("Replace and draft").click();
          await expect.poll(() => settingCalls).toBe(2);
          if (phone) await expect(settingPanel).toBeVisible();
          else {
            await expect(button("Draft again with Mari")).toBeEnabled();
            assert.equal(
              (await stage.boundingBox()).height,
              originalStage?.height,
              "Another draft keeps Mari’s stage at the same size",
            );
          }
          const updatedEditorHeight = (await settingPanel.boundingBox()).height;
          assert.ok(updatedEditorHeight <= originalEditorHeight + 1, "A long draft must not expand the editor");
          await expect(villageName).toHaveValue("Glimmerdump");
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
        }

        await root.getByLabel("First map name", { exact: true }).fill("Old Harbour");
        await root
          .getByLabel("Location description", { exact: true })
          .fill("An oceanfront expanse between the cliffs and river.");
        if (phone && process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "mobile-setting-editor-" + view.width + ".png"),
          });
        await expect(root.getByRole("group", { name: "Village context" })).toHaveCount(0);
        await expect(button("Art settings")).toHaveCount(0);
        await expect(root.getByLabel("World rules", { exact: true })).toHaveCount(0);
        await expect(root.getByLabel("First day", { exact: true })).toHaveCount(0);
        await bounds("setting");
        await settingNext().click();
        await expect(root).toHaveAttribute("data-step", "1");
        await enterChapter();
        if (view.width === 390 && view.height === 844) {
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
          await picker.getByRole("button", { name: person.name + " · Add", exact: true }).click();
        }
        await expect(root.getByRole("region", { name: "Housing", exact: true })).toHaveCount(0);
        const resident = root.locator(".villages-selected-villager").first();
        await resident.getByRole("button", { name: characters[0].name, exact: true }).click();
        const spritePane = page.getByRole("region", { name: characters[0].name + "’s appearance", exact: true });
        await expect(spritePane.getByRole("button", { name: "Portrait", exact: true })).toHaveAttribute(
          "aria-pressed",
          "true",
        );
        await expect(resident.getByRole("button", { name: "Sprites", exact: true })).toHaveCount(0);
        await expect(forward("Let’s set up their homes")).toBeEnabled();
        await bounds("people");
        await forward("Let’s set up their homes").click();
        await expect(root).toHaveAttribute("data-step", "2");
        await enterChapter();
        await expect.poll(() => root.evaluate((element) => element.scrollTop)).toBe(0);
        await button("Art settings").click();
        const artSettings = page.getByRole("dialog", { name: "Art settings", exact: true });
        await expect(artSettings.getByRole("button", { name: /^Images / })).toContainText("Needs Engine review");
        await expect(artSettings.getByRole("button", { name: /^System / })).toHaveCount(0);
        await artSettings
          .getByRole("group", { name: "Scenery style preset" })
          .getByRole("button", { name: "Ink", exact: true })
          .click();
        await expect
          .poll(() => page.evaluate(() => window.featureController.sceneryStyleProfileId))
          .toBe("fixture-ink");
        await artSettings.getByRole("button", { name: "Custom description", exact: true }).click();
        await artSettings
          .getByLabel("Scenery style description", { exact: true })
          .fill("Watercolor with muted teal and warm amber.");
        await artSettings.getByLabel("Map details", { exact: true }).fill("A circular Village around a central pond.");
        await artSettings.getByLabel("Exclude from map", { exact: true }).fill("neon colors");
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "art-settings-" + view.width + ".png"),
          });
        await artSettings.getByRole("button", { name: "Done", exact: true }).click();
        await expect(artSettings).toHaveCount(0);
        assert.equal(generatedImages, 0, "Changing art settings never generates an image");
        assert.deepEqual(await root.boundingBox(), frame, "Art settings do not resize the Founding window");
        await button("Art settings").click();
        await expect(artSettings.getByLabel("Scenery style description", { exact: true })).toHaveValue(
          "Watercolor with muted teal and warm amber.",
        );
        await artSettings.getByRole("button", { name: "Close Art settings", exact: true }).click();
        await expect(root.getByRole("region", { name: "Housing", exact: true })).toHaveCount(0);
        await expect(root.getByLabel("Community Venue", { exact: true })).toHaveCount(0);
        await expect(root.getByRole("combobox", { name: /household/i })).toHaveCount(0);
        const cards = await root.locator(".villages-quick-venue-card").evaluateAll((nodes) =>
          nodes.map((node) => ({
            height: node.getBoundingClientRect().height,
            badgeTop:
              node.querySelector(".villages-quick-venue-badge").getBoundingClientRect().top -
              node.getBoundingClientRect().top,
            badgeRight:
              node.getBoundingClientRect().right -
              node.querySelector(".villages-quick-venue-badge").getBoundingClientRect().right,
          })),
        );
        assert.ok(
          cards.every((card) => card.height >= 76),
          "Taller Venue bars expose more artwork",
        );
        assert.ok(
          cards.every(
            (card) =>
              Math.abs(card.badgeTop - cards[0].badgeTop) <= 1 && Math.abs(card.badgeRight - cards[0].badgeRight) <= 1,
          ),
          "Residence and Community badges share one alignment",
        );
        await expect(
          root.locator('[data-venue-id="founding-community"]').getByText("Community", { exact: true }),
        ).toHaveCount(1);
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
        await expect(sheet).toHaveCount(0);
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
        if (view.width === 2550) {
          await expect(root.locator(".villages-quick-venue-card:visible")).toHaveCount(view.count + 3);
          await page.setViewportSize({ width: view.width, height: 480 });
          await expect
            .poll(() => root.locator(".villages-quick-venue-card:visible").count())
            .toBeLessThan(view.count + 3);
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
          await expect(root.locator(".villages-quick-venue-card:visible")).toHaveCount(view.count + 3);
        }
        assert.equal(await page.evaluate(() => window.featureController.setupVenues.length), view.count + 3);
        const mapWarning = root.getByText("Upload or generate a map image before continuing.", { exact: true });
        await expect(mapWarning).toHaveCount(0);
        await expect(forward("Let’s look it over")).toBeEnabled();
        await forward("Let’s look it over").click();
        await expect(root).toHaveAttribute("data-step", "2");
        await expect(mapWarning).toBeVisible();
        assert.deepEqual(await root.boundingBox(), frame, "Validation does not resize the Founding window");
        assert.equal(await mapWarning.evaluate((node) => getComputedStyle(node).color), "rgb(255, 155, 165)");
        if (phone) await button("Back").click();
        await button("Back").click();
        await expect(root).toHaveAttribute("data-step", "1");
        await enterChapter();
        await forward("Let’s set up their homes").click();
        await expect(root).toHaveAttribute("data-step", "2");
        await enterChapter();
        await expect(mapWarning).toHaveCount(0);

        await expect(root.getByRole("button", { name: "Simple map", exact: true })).toHaveCount(0);
        await expect(root.getByRole("button", { name: "+ Add home", exact: true })).toHaveCount(0);
        await expect(root.getByRole("button", { name: "+ Add Venue", exact: true })).toHaveCount(0);
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "venue-overview-" + view.width + ".png"),
          });
        await editVenue("founding-home:player");
        await expect(sheet).toHaveAttribute("open", "");
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
        await expect(sheet.getByRole("group", { name: "Who sleeps here?" })).toBeVisible();
        await expect(sheet.getByRole("group", { name: "Whose space is it?" })).toBeVisible();
        await expect(sheet.getByRole("group", { name: "Visitor access" })).toBeVisible();
        await expect(sheet.getByRole("button", { name: "← Zones", exact: true })).toBeVisible();
        await expect(sheet.locator(".villages-zone-map-canvas")).toHaveCount(0);
        await expect(
          sheet
            .getByRole("region", { name: "Zone artwork", exact: true })
            .getByRole("button", { name: "Generate artwork", exact: true }),
        ).toBeVisible();
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "zone-editing-" + view.width + ".png"),
          });
        await expect(sheet.getByRole("button", { name: "Art settings", exact: true })).toHaveCount(0);
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
        if (view.width === 390) {
          await sheet.getByRole("button", { name: "Done", exact: true }).click();
          await marker.scrollIntoViewIfNeeded();
          const box = await marker.locator(".marinara-capability-villages-map-point").boundingBox(),
            beforeTouch = await page.evaluate(
              () =>
                window.featureController.setupVenues.find((row) => row.id === "founding-home:player").presentation.x,
            );
          const touch = await context.newCDPSession(page),
            x = box.x + box.width / 2,
            y = box.y + box.height / 2;
          await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
          await touch.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + 20, y }] });
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
          await editVenue("founding-home:player");
          await sheet.getByRole("button", { name: "Zones", exact: true }).click();
          await common.tap();
        }
        const draggedPosition = await page.evaluate(
          () => window.featureController.setupVenues.find((row) => row.id === "founding-home:player").presentation,
        );

        if (view.width === 1366) {
          await sheet
            .getByRole("region", { name: "Zone artwork", exact: true })
            .getByRole("button", { name: "Generate artwork", exact: true })
            .click();
          await expect(sheet.getByRole("img", { name: "Artwork for Common Space", exact: true })).toBeVisible();
          await sheet.getByRole("button", { name: "Done", exact: true }).click();
          await root
            .getByRole("region", { name: "Starting location map", exact: true })
            .getByRole("button", { name: "Generate artwork", exact: true })
            .click();
          await expect.poll(() => page.evaluate(() => window.featureController.setupMapSource)).toBe("generate");
          assert.equal(generatedImages, 2, "Zone and map generate only after explicit clicks");
          assert.deepEqual(
            artRequests.map((row) => [row.target, row.sceneryStyleProfileId, row.sceneryArtStyle]),
            [
              ["venue", null, "Watercolor with muted teal and warm amber."],
              ["map", null, "Watercolor with muted teal and warm amber."],
            ],
            "Map and Venue requests use the same selected art style",
          );
          assert.equal(artRequests[1].structure, "A circular Village around a central pond.");
          assert.equal(artRequests[1].negative, "neon colors");
        } else {
          await sheet.getByRole("button", { name: "Done", exact: true }).click();
          await root
            .getByLabel("Upload map image", { exact: true })
            .setInputFiles({ name: "map.png", mimeType: "image/png", buffer: Buffer.from(image, "base64") });
        }
        await expect(forward("Let’s look it over")).toBeEnabled();
        await expect(mapWarning).toHaveCount(0);
        if (view.width === 1366) {
          await expect
            .poll(() =>
              page.evaluate(() => {
                const draft = window.featureController.savedSetupDraft?.data;
                return (
                  !!draft?.mapImage &&
                  draft.step === 2 &&
                  draft.venues.some((row) => row.id === "founding-home:player" && row.presentation.x !== null)
                );
              }),
            )
            .toBe(true);
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await expect(root).toHaveAttribute("data-step", "2");
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
        await button("Suggest").click();
        await page
          .getByRole("dialog", { name: "Suggest", exact: true })
          .getByRole("button", { name: "Cancel", exact: true })
          .click();
        assert.equal(suggestions, 0);
        failVenueConnection = true;
        await button("Suggest").click();
        await page
          .getByRole("dialog", { name: "Suggest", exact: true })
          .getByRole("button", { name: "Replace and suggest", exact: true })
          .click();
        await expect(root.getByText("The System connection is unavailable.", { exact: false })).toBeVisible();
        await expect(root.getByText("stale-model-id", { exact: false })).toHaveCount(0);
        await button("Check Model Connections").click();
        await expect(root).toHaveAttribute("data-step", "2");
        const repair = root.getByRole("dialog", { name: "Model Connections", exact: true });
        await expect(repair.getByRole("button", { name: /^System / })).toBeVisible();
        await repair.getByRole("button", { name: "Done", exact: true }).click();
        assert.equal(suggestions, 1, "checking connections never retries generation");
        failVenueConnection = false;
        await button("Retry").click();
        await page
          .getByRole("dialog", { name: "Retry", exact: true })
          .getByRole("button", { name: "Replace and suggest", exact: true })
          .click();
        await expect.poll(() => suggestions).toBe(2);
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
        if (view.width > 1100) {
          const options = await root.getByRole("region", { name: "Starting Venues", exact: true }).boundingBox();
          const map = await root.getByRole("region", { name: "Starting location map", exact: true }).boundingBox();
          await expect(sheet).toHaveCount(0);
          assert.ok(map.x >= options.x + options.width, "The map sits beside Starting Venues");
          assert.ok(map.width > options.width * 2, "The overview gives the map most of the room");
          assert.ok(Math.abs(map.height - options.height) <= 1, "Both overview panels use the whole available height");
        }
        await editVenue("founding-home:player");
        const appearance = sheet.getByLabel("Venue form", { exact: true });
        const savedAppearance = await appearance.inputValue();
        await appearance.fill("");
        await sheet.getByRole("button", { name: "Done", exact: true }).click();
        await forward("Let’s look it over").click();
        await expect(sheet).toBeVisible();
        await expect(appearance).toHaveAttribute("aria-invalid", "true");
        await expect(appearance).toBeFocused();
        await appearance.fill(savedAppearance);
        await sheet.getByRole("button", { name: "Done", exact: true }).click();
        await editVenue("founding-home:player");
        await sheet.getByRole("button", { name: "Zones", exact: true }).click();
        await common.click();
        await expect(sheet.getByRole("button", { name: "← Zones", exact: true })).toBeFocused();
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
        await sheet.getByRole("button", { name: "Done", exact: true }).click();
        await forward("Let’s look it over").click();
        await expect(sheet.locator(".villages-quick-selected-zone")).toHaveAttribute("data-zone-id", "common:base");
        await expect(purpose).toBeFocused();
        await purpose.fill(savedPurpose);
        await sheet.getByRole("button", { name: "Done", exact: true }).click();
        await bounds("venues");
        await forward("Let’s look it over").click();
        await expect(root).toHaveAttribute("data-step", "3");
        await enterChapter();
        await expect(root.getByText("World rules: The sun never sets.", { exact: true })).toBeVisible();

        await root
          .getByRole("textbox", { name: "First day", exact: true })
          .fill("The ferries are delayed. A festival starts tonight.");
        await bounds("review");
        await button("Found village").click();
        await expect.poll(() => payload).toBeTruthy();
        assert.equal(payload.name, draftWithLore ? "Glimmerdump" : "Coastal Community");
        assert.equal(payload.timeZone, snapshot.clock?.timeZone || snapshot.village.timeZone);
        assert.equal(
          payload.startingLocationName,
          "Old Harbour",
          "The saved draft retains the location separately from the Village",
        );
        assert.equal(payload.openingVenueId, "founding-community");
        assert.equal(payload.worldRules, "The sun never sets.");
        assert.deepEqual(payload.circumstances, [
          { scope: "village", summary: "The ferries are delayed. A festival starts tonight.", venueId: "", zoneId: "" },
        ]);
        assert.equal(Object.hasOwn(payload, "foundingHistory"), false);
        assert.equal(
          payload.venues.length,
          view.count + 3,
          "Founding contains the selected homes and two Community Venues",
        );
        const community = payload.venues.find((row) => row.id === payload.openingVenueId);
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
        assert.equal(generatedImages, 2 * Number(view.width === 1366));
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
