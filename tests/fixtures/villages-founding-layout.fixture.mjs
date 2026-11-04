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
        const artRequests = [];
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
          if (path.endsWith("/connections"))
            return send({ systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" });
          if (path.endsWith("/catalog")) return send({ characters });
          if (path.endsWith("/lorebooks")) return send({ books: [] });
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
        const mapWarning = root.getByText("Upload or generate a map image before continuing.", { exact: true });
        await expect(mapWarning).toHaveCount(0);
        await expect(button("Review village")).toBeEnabled();
        await button("Review village").click();
        await expect(root).toHaveAttribute("data-step", "2");
        await expect(mapWarning).toBeVisible();
        assert.deepEqual(await root.boundingBox(), frame, "Validation does not resize the Founding window");
        assert.equal(await mapWarning.evaluate((node) => getComputedStyle(node).color), "rgb(255, 155, 165)");
        await button("Back").click();
        await expect(root).toHaveAttribute("data-step", "1");
        await button("Continue to Venues and Map").click();
        await expect(root).toHaveAttribute("data-step", "2");
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
        await expect(sheet.getByRole("button", { name: "People", exact: true })).toHaveCount(0);
        await expect(sheet.getByRole("group", { name: "Venue sections", exact: true })).toHaveCount(0);
        await expect(sheet.getByRole("combobox")).toHaveCount(0);
        await expect(sheet.getByRole("switch")).toHaveCount(0);
        const common = sheet.locator('[data-layout-zone="common:base"]');
        if (view.width === 390) await common.tap();
        else await common.click();
        await expect(sheet.getByRole("group", { name: "Selected Zone", exact: true })).toHaveAttribute(
          "data-zone-id",
          "common:base",
        );
        await expect(sheet.getByRole("switch", { name: "Restricted access", exact: true })).toBeVisible();
        await expect(
          sheet
            .getByRole("region", { name: "Zone artwork", exact: true })
            .getByRole("button", { name: "Generate artwork", exact: true }),
        ).toBeVisible();
        if (view.width === 2550) {
          const name = await sheet.getByLabel("Venue Name", { exact: true }).boundingBox();
          const appearance = await sheet.getByLabel("Appearance", { exact: true }).boundingBox();
          const details = await sheet.locator(".villages-quick-zone-fields").boundingBox();
          const artwork = await sheet.getByRole("region", { name: "Zone artwork", exact: true }).boundingBox();
          assert.ok(name.x + name.width <= appearance.x, "Name and Appearance share the desktop header");
          assert.ok(
            Math.abs(name.y - appearance.y) < 1 && Math.abs(name.height - appearance.height) < 1,
            "Venue name and Appearance have aligned equal-sized boxes",
          );
          const nameStyle = await sheet
            .getByLabel("Venue Name", { exact: true })
            .evaluate((node) => getComputedStyle(node).fontSize);
          const appearanceStyle = await sheet
            .getByLabel("Appearance", { exact: true })
            .evaluate((node) => getComputedStyle(node).fontSize);
          assert.equal(nameStyle, appearanceStyle, "Venue header uses uniform type size");
          const list = await root.getByRole("region", { name: "Starting Venues", exact: true }).boundingBox();
          const editor = await sheet.boundingBox();
          assert.ok(editor.width > list.width * 2, "The popout provides a large editing surface");
          assert.ok(
            editor.x < list.x + list.width && editor.y < list.y + list.height,
            "The editor overlays the overview",
          );
          const zoneName = await sheet.getByLabel("Zone name", { exact: true }).boundingBox();
          const purpose = await sheet.getByLabel("Used for", { exact: true }).boundingBox();
          const description = await sheet.getByLabel("Long-term details", { exact: true }).boundingBox();
          const artworkPreview = await sheet.locator(".villages-quick-art img,.villages-quick-art-empty").boundingBox();
          assert.ok(Math.abs(description.y - artworkPreview.y) < 1, "Description and artwork start on the same row");
          assert.equal(
            await sheet.getByLabel("Zone name", { exact: true }).evaluate((node) => getComputedStyle(node).color),
            await sheet
              .getByRole("heading", { name: "Common Space", exact: true })
              .evaluate((node) => getComputedStyle(node).color),
            "Editable Zone heading retains the visible heading text color",
          );
          assert.ok(
            zoneName.y + zoneName.height <= description.y && description.y + description.height <= purpose.y,
            "Selected Zone heading leads the description, with purpose below",
          );
          await expect(sheet.getByRole("heading", { name: "Common Space", exact: true })).toBeVisible();
          await expect(sheet.getByRole("button", { name: "Edit layout", exact: true })).toBeVisible();
          await expect(sheet.getByRole("button", { name: "Add Zone", exact: true })).toHaveCount(0);
          await expect(sheet.getByRole("button", { name: "Modify Zone Connections", exact: true })).toHaveCount(0);
          await expect(sheet.locator(".villages-zone-map-canvas")).toHaveCount(0);
          const rail = await sheet.locator(".villages-founding-zone-choices").boundingBox();
          assert.ok(rail.x + rail.width < details.x, "A simple Zone rail sits beside the selected Zone");
          const scroll = await sheet
            .locator(".villages-quick-editor-body")
            .evaluate((node) => ({ height: node.clientHeight, content: node.scrollHeight }));
          assert.ok(scroll.content <= scroll.height + 1, "The main desktop editor fits without scrolling");
          assert.ok(details.x + details.width <= artwork.x, "Zone details and artwork sit beside each other");
        }
        if (process.env.VILLAGES_SCREENSHOT_DIR)
          await page.screenshot({
            path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "zone-editing-" + view.width + ".png"),
          });
        const nameBox = sheet.getByLabel("Venue Name", { exact: true });
        const appearanceBox = sheet.getByLabel("Appearance", { exact: true });
        const decoration = (locator) =>
          locator.evaluate((node) => {
            const style = getComputedStyle(node);
            return [style.backgroundColor, style.borderTopColor];
          });
        assert.deepEqual(
          await decoration(nameBox),
          await decoration(appearanceBox),
          "Venue name retains the standard input box while unfocused",
        );
        await sheet.getByRole("button", { name: "Art settings", exact: true }).click();
        const artSettings = page.getByRole("dialog", { name: "Art settings", exact: true });
        await artSettings.getByLabel("Scenery style preset", { exact: true }).selectOption("fixture-ink");
        await expect
          .poll(() => page.evaluate(() => window.featureController.sceneryStyleProfileId))
          .toBe("fixture-ink");
        await artSettings.getByLabel("Scenery style preset", { exact: true }).selectOption("@custom");
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
        await sheet.getByRole("button", { name: "Art settings", exact: true }).click();
        await expect(artSettings.getByLabel("Scenery style description", { exact: true })).toHaveValue(
          "Watercolor with muted teal and warm amber.",
        );
        await artSettings.getByRole("button", { name: "Close Art settings", exact: true }).click();
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
            .getByRole("region", { name: "Village map", exact: true })
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
        await expect(button("Review village")).toBeEnabled();
        await expect(mapWarning).toHaveCount(0);
        if (view.width === 1366) {
          await button("Exit").click();
          await page.reload();
          await page.addScriptTag({ content: foundingBundle });
          await page.getByRole("button", { name: "Resume founding", exact: true }).click();
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
        if (view.width > 1100) {
          const options = await root.getByRole("region", { name: "Starting Venues", exact: true }).boundingBox();
          const map = await root.getByRole("region", { name: "Village map", exact: true }).boundingBox();
          await expect(sheet).toHaveCount(0);
          assert.ok(map.x >= options.x + options.width, "The map sits beside Starting Venues");
          assert.ok(map.width > options.width * 2, "The overview gives the map most of the room");
          assert.ok(Math.abs(map.height - options.height) <= 1, "Both overview panels use the whole available height");
        }
        await editVenue("founding-home:player");
        const appearance = sheet.getByLabel("Appearance", { exact: true });
        const savedAppearance = await appearance.inputValue();
        await appearance.fill("");
        await sheet.getByRole("button", { name: "Done", exact: true }).click();
        await button("Review village").click();
        await expect(sheet).toBeVisible();
        await expect(appearance).toHaveAttribute("aria-invalid", "true");
        await expect(appearance).toBeFocused();
        await appearance.fill(savedAppearance);
        await sheet.getByRole("button", { name: "Done", exact: true }).click();
        await editVenue("founding-home:player");
        await sheet.locator('[data-layout-zone="common:base"]').click();
        const purpose = sheet.getByLabel("Used for", { exact: true });
        const savedPurpose = await purpose.inputValue();
        await purpose.fill("");
        await sheet.getByRole("button", { name: "Done", exact: true }).click();
        await button("Review village").click();
        await expect(sheet.locator(".villages-quick-selected-zone")).toHaveAttribute("data-zone-id", "common:base");
        await expect(purpose).toBeFocused();
        await purpose.fill(savedPurpose);
        await sheet.getByRole("button", { name: "Done", exact: true }).click();
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
        assert.equal(generatedImages, 2 * Number(view.width === 1366));
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
