import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PNG } from "pngjs";
import { chromium, expect } from "@playwright/test";

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
try {
  for (const { width, height, fontSize, homeCount, chromeHeight = 0 } of [
    { width: 1366, height: 768, fontSize: 16, homeCount: 3 },
    { width: 1440, height: 650, fontSize: 16, homeCount: 1, chromeHeight: 200 },
    { width: 1917, height: 600, fontSize: 20, homeCount: 1 },
    { width: 1024, height: 768, fontSize: 20, homeCount: 2 },
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
              commonDescription: "A table beside a window.",
              privateName: "Bedroom",
              privatePurpose: "Personal resting space",
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
        box && box.y >= 0 && box.y + box.height <= height + 1,
        `navigation stays in viewport: ${JSON.stringify({ box, height, root: await root.boundingBox() })}`,
      );
    };
    const capture = async (name) => {
      if (process.env.VILLAGES_SCREENSHOT_DIR) {
        await root.locator(".villages-forging-body").evaluate((element) => {
          element.scrollTop = 0;
        });
        await page.screenshot({ path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `${name}-${width}.png`) });
      }
    };
    await expect(root.getByRole("button", { name: "1 People", exact: true })).toBeVisible();
    await expect(root.getByRole("heading", { name: "You", exact: true })).toBeVisible();
    await root.getByPlaceholder("Search Personas").fill("patient");
    await root.locator(".marinara-capability-villages-identity-card").click();
    if (width <= 704) await root.getByRole("button", { name: /^Your role ·/ }).click();
    await root.getByLabel("Role title", { exact: true }).fill(" ");
    await forward("Continue to place").click();
    await expect(root.getByRole("alert")).toContainText("title");
    await root.getByLabel("Role title", { exact: true }).fill("Harbor Patron");
    await root
      .getByLabel("Why villagers turn to you", { exact: true })
      .fill("I coordinate harbor construction Projects.");
    const grid = root.getByRole("group", { name: "Choose founding villagers" });
    for (const name of ["Finn", "Rosa", "Lee, Keeper of the Observatory’s Long Forgotten Archives"].slice(0, homeCount))
      await grid.getByRole("button", { name, exact: true }).click();
    const finn = root.locator(".villages-resident-background").first();
    if (width <= 704) await finn.getByRole("button").click();
    await expect(root.getByLabel("Finn character history", { exact: true })).toHaveValue("continue");
    await expect(root.getByLabel("Finn place in the Village's story", { exact: true })).toHaveValue("new-arrival");
    for (const role of ["lifelong", "returning", "visiting", "new-arrival"]) {
      await root.getByLabel("Finn place in the Village's story", { exact: true }).selectOption(role);
      if (role === "lifelong")
        await expect(root.getByText("Their life here before play", { exact: false })).toBeVisible();
    }
    for (const mode of ["adapt", "new", "continue"])
      await root.getByLabel("Finn character history", { exact: true }).selectOption(mode);
    if (width === 1366) {
      await forward("Save & exit").click();
      await page.evaluate(async () => {
        const db = await new Promise((resolve, reject) => {
          const request = indexedDB.open("villages-founding-v2", 1);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        await new Promise((resolve, reject) => {
          const transaction = db.transaction("drafts", "readwrite"),
            cursor = transaction.objectStore("drafts").openCursor();
          cursor.onsuccess = () => {
            const row = cursor.result;
            if (!row) return;
            const saved = row.value;
            delete saved.data.residentContexts;
            row.update(saved);
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
      await expect(root.getByLabel("Finn character history", { exact: true })).toHaveValue("continue");
      await expect(root.getByLabel("Finn place in the Village's story", { exact: true })).toHaveValue("new-arrival");
    }
    await root.getByLabel("Finn place in the Village's story", { exact: true }).selectOption("custom");
    await forward("Continue to place").click();
    await expect(root.getByRole("alert").filter({ hasText: "Describe their place here." })).toBeVisible();
    await root.getByLabel("Finn custom place", { exact: true }).fill("Guardian of a relic in the observatory.");
    await root
      .getByLabel("Finn starting background", { exact: true })
      .fill("Remembers a former life elsewhere. The observatory's wider world is undecided.");
    // Selection changes retain background drafts, but only selected residents submit.
    await grid.getByRole("button", { name: "Finn", exact: true }).click();
    await expect(root.locator(".villages-resident-background")).toHaveCount(homeCount - 1);
    await grid.getByRole("button", { name: "Finn", exact: true }).click();
    if (width <= 704) {
      const toggle = root.locator(".villages-resident-background").filter({ hasText: "Finn" }).getByRole("button");
      if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
    }
    await expect(root.getByLabel("Finn custom place", { exact: true })).toHaveValue(
      "Guardian of a relic in the observatory.",
    );
    assert.equal(suggestionCalls, 0);
    assert.equal(imageCalls, 0);
    if (width === 390 && height === 844) {
      await page.setViewportSize({ width: 1366, height: 844 });
      await expect(root.getByLabel("Finn starting background", { exact: true })).toHaveValue(
        "Remembers a former life elsewhere. The observatory's wider world is undecided.",
      );
      await page.setViewportSize({ width, height });
      // A reduced phone viewport exercises focus scrolling above the persistent footer.
      await page.setViewportSize({ width, height: 460 });
      const background = root.getByLabel("Finn starting background", { exact: true });
      await background.focus();
      await background.scrollIntoViewIfNeeded();
      const fieldBox = await background.boundingBox();
      const footerBox = await root.locator(".villages-forging-footer").boundingBox();
      assert.ok(fieldBox && footerBox && fieldBox.y + fieldBox.height <= footerBox.y + 1);
      await page.keyboard.press("Shift+Tab");
      await expect(root.getByLabel("Finn custom place", { exact: true })).toBeFocused();
      await page.setViewportSize({ width, height });
    }
    await bounds();
    await capture("people");
    if (process.env.VILLAGES_SCREENSHOT_DIR && [1366, 390, 320].includes(width)) {
      await root.getByLabel("Finn custom place", { exact: true }).scrollIntoViewIfNeeded();
      await page.screenshot({
        path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `resident-background-${width}-${height}.png`),
      });
    }
    await forward("Continue to place").click();
    await expect(root.getByText("Step 2 of 4 · Place")).toBeVisible();
    await root.getByLabel("Village name", { exact: true }).fill("Willowbrook");
    await root
      .getByLabel("Where are we?", { exact: true })
      .fill("A converted seaside observatory with bedrooms along an indoor corridor and one shared telescope hall.");
    await root
      .getByLabel("What brings you together?", { exact: true })
      .fill("We rented the observatory together because ordinary housing was too expensive.");
    await bounds();
    await capture("place");
    await root.getByRole("button", { name: "1 People", exact: true }).click();
    if (width <= 704)
      await root.locator(".villages-resident-background").filter({ hasText: "Finn" }).getByRole("button").click();
    await expect(root.getByLabel("Finn starting background", { exact: true })).toHaveValue(
      "Remembers a former life elsewhere. The observatory's wider world is undecided.",
    );
    await root.getByRole("button", { name: "2 Place", exact: true }).click();
    await forward("Continue to Venues").click();
    await expect(root).toHaveAttribute("data-step", "2");
    await expect(root.getByRole("button", { name: "Arrange automatically", exact: true })).toBeVisible();
    const list = root.locator(".villages-workspace-list");
    const inspector = root.locator(".villages-workspace-inspector");
    const detailsView = async () => {
      const toggle = root
        .getByRole("group", { name: "Workspace view" })
        .getByRole("button", { name: "Details", exact: true });
      if (await toggle.isVisible()) await toggle.click();
    };
    const mapView = async () => {
      const back = inspector.getByRole("button", { name: "Back to map", exact: true });
      if (await back.isVisible()) await back.click();
    };
    const open = async (index = 0) => {
      await detailsView();
      await list.locator("button").nth(index).click();
      await detailsView();
    };
    await expect(list.locator("button")).toHaveCount(homeCount + 2);
    await forward("Review village").click();
    await detailsView();
    await expect(inspector.getByRole("region", { name: "Details needed before Review" })).toBeVisible();
    await forward("Draft starting Venues").click();
    await expect(root.getByRole("button", { name: "Draft starting Venues", exact: true })).toBeEnabled();
    assert.equal(suggestionCalls, 1);
    await mapView();
    const placementMap = root.locator(".marinara-capability-villages-setup-map-viewport");
    const spots = Array.from({ length: homeCount + 2 }, (_, i) => ({
      x: homeCount === 3 ? 0.22 + (i % 3) * 0.28 : 0.22 + (i % 2) * 0.56,
      y: i < (homeCount === 3 ? 3 : 2) ? 0.28 : 0.72,
    }));
    const canvas = placementMap.locator(".marinara-capability-villages-canvas");
    await capture("venues-ready");
    for (const spot of spots) {
      const box = await canvas.boundingBox();
      await page.mouse.click(box.x + spot.x * box.width, box.y + spot.y * box.height);
    }
    await expect(root.locator(".villages-workspace-toolbar > strong")).toHaveText(
      `${homeCount + 2} / ${homeCount + 2} placed`,
    );
    if (chromeHeight)
      assert.ok(
        (await placementMap.boundingBox()).height >= 230,
        `short Engine tabs retain useful map height: ${JSON.stringify({ map: await placementMap.boundingBox(), root: await root.boundingBox(), toolbar: await root.locator(".villages-workspace-toolbar").boundingBox(), steps: await root.locator(".villages-forging-steps").boundingBox(), footer: await root.locator(".villages-forging-footer").boundingBox() })}`,
      );
    // One request + one click per Venue + Review, without any editor confirmation or image request.
    await forward("Review village").click();
    await expect(root.getByText("Step 4 of 4 · Review")).toBeVisible();
    assert.equal(imageCalls, 0);
    await root.getByRole("button", { name: "Change starting Venues", exact: true }).click();
    await open();
    await inspector.getByLabel("Venue name", { exact: true }).fill("Autosaved name");
    await expect(root.locator(".villages-forging-saved")).toContainText("Saved");
    if (width === 1366) {
      // A v2 modal checkpoint must load the saved current edits, never restore its old cancel copy.
      await page.evaluate(async () => {
        const db = await new Promise((resolve) => {
          const open = indexedDB.open("villages-founding-v2", 1);
          open.onsuccess = () => resolve(open.result);
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
              saved.data.editorOriginal = { ...saved.data.venues[0], name: "Old cancelled checkpoint" };
              store.put({ ...saved, revision: saved.revision + 1 }, keys.result[0]);
            };
          };
          tx.oncomplete = resolve;
        });
        db.close();
      });
    }
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await root.getByRole("button", { name: "Resume photograph placement", exact: true }).click();
    await detailsView();
    await expect(inspector.getByLabel("Venue name", { exact: true })).toHaveValue("Autosaved name");
    await expect(root.getByRole("dialog")).toHaveCount(0);
    await inspector.getByLabel("Venue name", { exact: true }).fill("My observatory quarters");
    await inspector.getByLabel("Physical form", { exact: true }).fill("Converted observatory room");
    await inspector.getByLabel("Venue Type", { exact: true }).fill("Home");
    await inspector.getByRole("button", { name: "Zones", exact: true }).click();
    await inspector
      .getByLabel("Exterior description", { exact: true })
      .fill("A blue door beside the telescope corridor.");
    await inspector.getByLabel("Selected Zone").selectOption("common:base");
    await inspector.getByLabel("Zone appearance", { exact: true }).fill("A quiet sitting room overlooking the sea.");
    await inspector.getByLabel("Zone used for", { exact: true }).fill("Relaxing together");
    await inspector.getByLabel("Selected Zone").selectOption("private:base");
    await inspector.getByLabel("Zone appearance", { exact: true }).fill("My hammock and traveling journal.");
    await forward("Draft starting Venues").click();
    if (width === 1366) {
      await expect.poll(() => !!releaseSuggestion).toBe(true);
      await expect(forward("Save & exit")).toBeDisabled();
      await inspector.getByRole("button", { name: "Venue", exact: true }).click();
      await inspector.getByLabel("Venue Type", { exact: true }).fill("Authored during suggestion");
      await inspector.getByLabel("Venue name", { exact: true }).fill("My observatory quarters");
      releaseSuggestion();
      await expect(inspector.getByLabel("Venue Type", { exact: true })).toHaveValue("Authored during suggestion");
      await inspector.getByRole("button", { name: "Zones", exact: true }).click();
    }
    await expect(root.getByRole("button", { name: "Draft starting Venues", exact: true })).toBeEnabled();
    await expect(forward("Save & exit")).toBeEnabled();
    await expect(list.locator("button").first()).toContainText("My observatory quarters");
    assert.equal(suggestionCalls, 2, "suggestions happen only on explicit request");
    // Fields, the selected Zone, and the map survive view switches and side-panel width changes.
    await mapView();
    await expect(canvas.locator("button[data-pin-id]")).toHaveCount(homeCount + 2);
    const before = await canvas.evaluate((el) =>
      [...el.querySelectorAll("button[data-pin-id]")].map((pin) => [
        pin.dataset.pinId,
        pin.parentElement.style.left,
        pin.parentElement.style.top,
      ]),
    );
    await mapView();
    await expect(canvas.locator("button[data-pin-id]")).toHaveCount(homeCount + 2);
    await expect(placementMap.locator(".marinara-capability-villages-pin-photo-card")).toHaveCount(homeCount + 2);
    const photo = placementMap.locator(".marinara-capability-villages-pin-photo-card").first();
    const initialWidth = (await photo.boundingBox()).width;
    await photo.hover();
    assert.equal((await photo.boundingBox()).width, initialWidth, "hover never enlarges photographs");
    assert.equal(Math.round(initialWidth), width >= 60 * fontSize ? 88 : 72);
    await detailsView();
    await expect(inspector.getByLabel("Selected Zone")).toHaveValue("private:base");
    await expect(inspector.getByLabel("Zone appearance")).toHaveValue("My hammock and traveling journal.");
    await mapView();
    await expect(canvas.locator("button[data-pin-id]")).toHaveCount(homeCount + 2);
    assert.deepEqual(
      await canvas.evaluate((el) =>
        [...el.querySelectorAll("button[data-pin-id]")].map((pin) => [
          pin.dataset.pinId,
          pin.parentElement.style.left,
          pin.parentElement.style.top,
        ]),
      ),
      before,
    );
    await bounds();
    await capture("venues");
    await forward("Save & exit").click();
    await expect(root.getByRole("button", { name: "Resume photograph placement", exact: true })).toBeVisible();
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    root = page.locator(".villages-forging-v2");
    await expect(root.getByRole("button", { name: "Resume photograph placement", exact: true })).toBeVisible();
    await root.getByRole("button", { name: "Resume photograph placement", exact: true }).click();
    await expect(root).toHaveAttribute("data-step", "2");
    await expect(list.locator("button").first()).toContainText("My observatory quarters");
    assert.equal(suggestionCalls, 2, "reload never repeats generation");
    if (width === 1366) {
      // Drag threshold, valid drops, rejected overlap, outside drop and cancel retain normalized coordinates.
      await mapView();
      const pins = canvas.locator("button[data-pin-id]");
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
      await expect(root.getByRole("alert").filter({ hasText: "inside the map" })).toBeVisible();
      assert.deepEqual(await position(), original);
      let firstBox = await pins.first().boundingBox();
      await dragTo({ x: firstBox.x + firstBox.width / 2 + 45, y: firstBox.y + firstBox.height / 2 });
      assert.notDeepEqual(await position(), original);
      const valid = await position();
      firstBox = await pins.first().boundingBox();
      await dragTo({ x: firstBox.x + firstBox.width / 2 + 5, y: firstBox.y + firstBox.height / 2 });
      assert.deepEqual(await position(), valid, "less than eight pixels selects without moving");
      await pins.first().dispatchEvent("pointercancel");
      assert.deepEqual(await position(), valid);
      const mapHeight = (await placementMap.boundingBox()).height;
      await inspector.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      assert.equal((await placementMap.boundingBox()).height, mapHeight, "inspector scroll never shrinks map");
      await open(1);
      await inspector.getByRole("button", { name: "Zones", exact: true }).click();
      await inspector.getByLabel("Selected Zone").selectOption("common:base");
      await inspector.getByText("Artwork · optional", { exact: true }).click();
      await inspector.getByRole("button", { name: "Generate image", exact: true }).click();
      await expect(root.getByRole("alert").filter({ hasText: "Optional image unavailable" })).toBeVisible();
      await inspector.getByRole("button", { name: "Generate image", exact: true }).click();
      await expect.poll(() => !!releaseImage).toBe(true);
      await expect(inspector.getByLabel("Zone appearance")).toBeDisabled();
      await expect(forward("Save & exit")).toBeDisabled();
      await expect(forward("Review village")).toBeDisabled();
      await open(0);
      await inspector.getByRole("button", { name: "Venue", exact: true }).click();
      await expect(inspector.getByLabel("Physical form")).toBeEnabled();
      releaseImage();
      await expect(forward("Review village")).toBeEnabled();
      await expect(forward("Save & exit")).toBeEnabled();
      await open(1);
      await expect(inspector.locator("img")).toHaveCount(1);
      await forward("Draft starting Venues").click();
      await expect(root.getByRole("button", { name: "Draft starting Venues", exact: true })).toBeEnabled();
      await expect(inspector.locator("img"), "refresh keeps unedited generated Zone artwork").toHaveCount(1);
      // The next pending response is stale after a Village-name change; it cannot attach to a new context.
      await inspector.getByLabel("Selected Zone").selectOption("exterior");
      await inspector.getByText("Artwork · optional", { exact: true }).click();
      await inspector.getByRole("button", { name: "Generate image", exact: true }).click();
      await expect(forward("Review village")).toBeEnabled();
      await inspector.getByRole("button", { name: "Generate again", exact: true }).click();
      await expect.poll(() => imageCalls === 4).toBe(true);
      await root.getByRole("button", { name: "2 Place", exact: true }).click();
      await root.getByLabel("Village name", { exact: true }).fill("Changed while generating");
      releaseImage();
      await expect(root.getByRole("alert").filter({ hasText: "changed while its image" })).toBeVisible();
      await root.getByLabel("Village name", { exact: true }).fill("Willowbrook");
      await root.getByRole("button", { name: "3 Venues", exact: true }).click();
      await open(1);
      await expect(inspector.locator("img")).toHaveCount(1);
      await open(0);
      // Only the selected Zone is rendered; custom Zones persist without applying a form.
      await open();
      await inspector.getByRole("button", { name: "Zones", exact: true }).click();
      await inspector.getByText("Add or change Zones", { exact: true }).click();
      await inspector.getByRole("button", { name: "Add Zone", exact: true }).click();
      await inspector.getByLabel("Selected Zone").selectOption({ label: "New Zone" });
      await inspector.getByLabel("Zone name", { exact: true }).fill("Study");
      await inspector.getByLabel("Zone used for", { exact: true }).fill("Reading and writing");
      await inspector.getByLabel("Zone appearance", { exact: true }).fill("A desk by the window.");
      await forward("Save & exit").click();
      await page.reload();
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await root.getByRole("button", { name: "Resume photograph placement", exact: true }).click();
      await expect(inspector.getByLabel("Zone used for", { exact: true })).toHaveValue("Reading and writing");
      await expect(inspector.getByLabel("Zone appearance", { exact: true })).toHaveValue("A desk by the window.");
      await expect(inspector.getByLabel("Zone appearance", { exact: true })).toHaveCount(1);
      await inspector.getByRole("button", { name: "Remove Zone", exact: true }).click();
      await expect(root.locator(".villages-forging-saved")).toContainText("Saved");
      // Quota errors keep the current choices visible and prevent a false saved claim.
      await page.evaluate(() => {
        window.draftPut = IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put = function () {
          throw new DOMException("Draft storage full", "QuotaExceededError");
        };
      });
      await root.getByRole("button", { name: "2 Place", exact: true }).click();
      await root.getByLabel("Village name", { exact: true }).fill("Willowbrook revised");
      await expect(root.locator(".villages-forging-saved")).toHaveText("Draft not saved");
      await root.getByRole("button", { name: "3 Venues", exact: true }).click();
      await open(1);
      await expect(root.locator(".villages-forging-saved")).toHaveText("Draft not saved");
      await expect(forward("Review village")).toBeDisabled();
      await root.getByRole("button", { name: "2 Place", exact: true }).click();
      await forward("Save & exit").click();
      await expect(root.getByText("Step 2 of 4 · Place")).toBeVisible();
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
    }
    if (width === 1366 || (width === 390 && height === 844)) {
      await root.getByRole("button", { name: "2 Place", exact: true }).click();
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
      await root.getByRole("button", { name: "2 Place", exact: true }).click();
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
      await root.getByRole("button", { name: "2 Place", exact: true }).click();
      await expect(root.getByText(/1280 × 720 pixels/)).toBeVisible();
      await root.getByLabel("Map layout", { exact: true }).fill("Same map with updated guidance.");
      await expect(root.getByRole("img", { name: "Selected village map", exact: true })).toBeVisible();
      await root.getByRole("button", { name: "Use this saved artwork", exact: true }).click();
      await forward("Continue to Venues").click();
      await root.getByRole("button", { name: "I checked all Venue photographs against this map", exact: true }).click();
      // A chosen upload replaces paused recovery, even when the old provider finishes later.
      await root.getByRole("button", { name: "2 Place", exact: true }).click();
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
      await root.getByRole("button", { name: "2 Place", exact: true }).click();
      await expect(root.getByRole("img", { name: "Selected village map", exact: true })).toBeVisible();
      await expect(root.getByText(/640 × 640 pixels/)).toBeVisible();
      assert.equal(mapCalls, 3, "upload and reload do not dispatch another image request");
      await forward("Continue to Venues").click();
    }
    await forward("Review village").click();
    await expect(root.getByText("Step 4 of 4 · Review")).toBeVisible();
    await expect(root.getByRole("button", { name: "Change people & role", exact: true })).toBeVisible();
    await expect(root.locator(".villages-resident-review").filter({ hasText: "Finn" })).toContainText(
      "Guardian of a relic",
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
    assert.equal(foundingPayload.foundingResidentContexts.finn.storyRole, "custom");
    assert.equal(
      foundingPayload.foundingResidentContexts.finn.customDescription,
      "Guardian of a relic in the observatory.",
    );
    assert.match(foundingPayload.foundingResidentContexts.finn.background, /wider world is undecided/);
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
} finally {
  await browser.close();
}
