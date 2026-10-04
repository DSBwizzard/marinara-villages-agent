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
  { id: "lee", name: "Lee", summary: "Curious and resourceful" },
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
  for (const { width, height, fontSize, homeCount } of [
    { width: 1366, height: 768, fontSize: 16, homeCount: 3 },
    { width: 1917, height: 600, fontSize: 20, homeCount: 1 },
    { width: 1024, height: 768, fontSize: 20, homeCount: 2 },
    { width: 390, height: 844, fontSize: 16, homeCount: 2 },
    { width: 390, height: 650, fontSize: 20, homeCount: 3 },
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: width < 600 });
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
        if (imageCalls === 2)
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
        body: `<style>:root{font-size:${fontSize}px;--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}html,body{margin:0;width:100%;height:100%;font-family:Arial,sans-serif}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>`,
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
      assert.ok(box && box.y >= 0 && box.y + box.height <= height + 1, "navigation stays in viewport");
    };
    const capture = async (name) => {
      if (process.env.VILLAGES_SCREENSHOT_DIR && [1366, 390].includes(width) && (width !== 390 || height === 844)) {
        await root.locator(".villages-forging-body").evaluate((element) => {
          element.scrollTop = 0;
        });
        await page.screenshot({ path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `${name}-${width}.png`) });
      }
    };
    await expect(root.getByText("Step 1 of 4 · People")).toBeVisible();
    await root.getByPlaceholder("Search Personas").fill("patient");
    await root.locator(".marinara-capability-villages-identity-card").click();
    await root.getByText("Customize role title and explanation", { exact: true }).click();
    await root.getByLabel("Role title", { exact: true }).fill(" ");
    await forward("Continue to place").click();
    await expect(root.getByRole("alert")).toContainText("title");
    await root.getByLabel("Role title", { exact: true }).fill("Harbor Patron");
    await root
      .getByLabel("Why villagers turn to you", { exact: true })
      .fill("I coordinate harbor construction Projects.");
    const grid = root.getByRole("group", { name: "Choose founding villagers" });
    for (const name of ["Finn", "Rosa", "Lee"].slice(0, homeCount))
      await grid.getByRole("button", { name, exact: true }).click();
    await bounds();
    await capture("people");
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
    await forward("Continue to spaces").click();
    await expect(root.getByText("Step 3 of 4 · Spaces")).toBeVisible();
    await expect(root.getByRole("button", { name: "Arrange automatically", exact: true })).toBeVisible();
    await expect(root.locator(".villages-forging-venue")).toHaveCount(homeCount + 2);
    await forward("Review village").click();
    await expect(root.getByRole("alert")).toContainText("pin");
    await forward("Suggest names & descriptions").click();
    await expect(root.getByRole("button", { name: "Refresh suggestions", exact: true })).toBeVisible();
    const first = root.locator(".villages-forging-venue").first();
    await first.getByRole("button", { name: /^Edit / }).click();
    await root.getByRole("dialog").getByLabel("Venue name", { exact: true }).fill("Cancelled name");
    // An open editor and its cancellation checkpoint survive reload.
    await expect(root.locator(".villages-forging-saved")).toContainText("Saved");
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await root.getByRole("button", { name: "Resume pin placement", exact: true }).click();
    await expect(root.getByRole("dialog").getByLabel("Venue name", { exact: true })).toHaveValue("Cancelled name");
    await root.getByRole("dialog").getByRole("button", { name: "Cancel edits", exact: true }).click();
    await expect(first).not.toContainText("Cancelled name");
    await first.getByRole("button", { name: /^Edit / }).click();
    const dialog = root.getByRole("dialog");
    await dialog.getByLabel("Venue name", { exact: true }).fill("My observatory quarters");
    await dialog.getByLabel("Venue form", { exact: true }).fill("Converted observatory room");
    await dialog.getByLabel("Exterior description", { exact: true }).fill("A blue door beside the telescope corridor.");
    await dialog
      .getByLabel("Common Space description", { exact: true })
      .fill("A quiet sitting room overlooking the sea.");
    await dialog
      .getByLabel("Your personal-space description", { exact: true })
      .fill("My hammock and traveling journal.");
    await dialog.getByRole("button", { name: "Use these details", exact: true }).click();
    await forward("Refresh suggestions").click();
    await expect(root.getByRole("button", { name: "Refresh suggestions", exact: true })).toBeEnabled();
    await expect(first).toContainText("My observatory quarters");
    assert.equal(suggestionCalls, 2, "suggestions happen only on explicit request");
    await forward("Arrange automatically").click();
    const placementMap = root.locator(".marinara-capability-villages-setup-map-viewport");
    await expect
      .poll(() =>
        placementMap.evaluate((element) => {
          const canvas = element.querySelector(".marinara-capability-villages-canvas").getBoundingClientRect();
          const pins = [...element.querySelectorAll("button[data-pin-id]")];
          return (
            pins.length > 0 &&
            pins.every((pin) => {
              const box = pin.getBoundingClientRect();
              return (
                box.x >= canvas.x &&
                box.y >= canvas.y &&
                box.x + box.width <= canvas.x + canvas.width + 1 &&
                box.y + box.height <= canvas.y + canvas.height + 1
              );
            })
          );
        }),
      )
      .toBe(true);
    await expect(root.locator(".villages-forging-placement")).toHaveText(
      `${homeCount + 2} of ${homeCount + 2} pins placed`,
    );
    await bounds();
    await capture("spaces");
    await forward("Save & exit").click();
    await expect(root.getByRole("button", { name: "Resume pin placement", exact: true })).toBeVisible();
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    root = page.locator(".villages-forging-v2");
    await expect(root.getByRole("button", { name: "Resume pin placement", exact: true })).toBeVisible();
    await root.getByRole("button", { name: "Resume pin placement", exact: true }).click();
    await expect(root.getByText("Step 3 of 4 · Spaces")).toBeVisible();
    await expect(root.locator(".villages-forging-venue").first()).toContainText("My observatory quarters");
    assert.equal(suggestionCalls, 2, "reload never repeats generation");
    if (width === 1366) {
      // Optional Zone drafts survive hiding them and a reload.
      await root
        .locator(".villages-forging-venue")
        .first()
        .getByRole("button", { name: /^Edit / })
        .click();
      await root.getByRole("dialog").getByRole("button", { name: "Add a Common Space", exact: true }).click();
      await root.getByRole("dialog").getByRole("button", { name: "Use these details", exact: true }).click();
      await forward("Save & exit").click();
      await page.reload();
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await root.getByRole("button", { name: "Resume pin placement", exact: true }).click();
      await root
        .locator(".villages-forging-venue")
        .first()
        .getByRole("button", { name: /^Edit / })
        .click();
      await root.getByRole("dialog").getByRole("button", { name: "Add a Common Space", exact: true }).click();
      await expect(root.getByRole("dialog").getByLabel("Common Space description", { exact: true })).toHaveValue(
        "A quiet sitting room overlooking the sea.",
      );
      await root.getByRole("dialog").getByRole("button", { name: "Use these details", exact: true }).click();
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
      await forward("Save & exit").click();
      await expect(root.getByText("Step 2 of 4 · Place")).toBeVisible();
      await page.evaluate(() => {
        IDBObjectStore.prototype.put = window.draftPut;
      });
      await forward("Retry saving draft").click();
      await expect(root.locator(".villages-forging-saved")).toContainText("Saved");
      // Another tab's newer revision wins; this tab must not overwrite it.
      await page.evaluate(async () => {
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
      await forward("Continue to spaces").click();
      await expect(root.getByText("Step 3 of 4 · Spaces")).toBeVisible();
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
      await forward("Continue to spaces").click();
      await expect(root.locator(".villages-forging-placement")).toContainText("Waiting for map artwork");
      // Reload while the provider is still drawing: the resumed draft only reads status.
      await forward("Save & exit").click();
      await page.reload();
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await root.getByRole("button", { name: "Resume pin placement", exact: true }).click();
      await expect(root.locator(".villages-forging-placement")).toContainText("Waiting for map artwork");
      assert.equal(mapCalls, 2, "resuming an unfinished attempt must not generate again");
      failMapStatus = true;
      await expect(root.getByRole("button", { name: "Check map status", exact: true })).toBeVisible();
      failMapStatus = false;
      releaseMap();
      await root.getByRole("button", { name: "Check map status", exact: true }).click();
      await expect(
        root.getByRole("button", { name: "I checked all pins against this map", exact: true }),
      ).toBeVisible();
      await forward("Review village").click();
      await expect(root.getByRole("alert")).toContainText("Check all");
      await root.getByRole("button", { name: "I checked all pins against this map", exact: true }).click();
      await root
        .locator(".villages-forging-venue")
        .first()
        .getByRole("button", { name: /^Move / })
        .click();
      await root
        .getByLabel("Venue placement map. Arrow keys choose a spot; Enter places a Venue.", { exact: true })
        .press("Enter");
      await expect(root.locator(".villages-forging-placement")).toHaveText(
        `${homeCount + 2} of ${homeCount + 2} pins placed`,
      );
      await capture("artwork-spaces");
      await forward("Save & exit").click();
      await page.reload();
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await expect(root.getByRole("button", { name: "Resume pin placement", exact: true })).toBeVisible();
      await root.getByRole("button", { name: "Resume pin placement", exact: true }).click();
      assert.equal(mapCalls, 2, "only deliberate retry generates again; finished artwork is restored on reload");
      await root.getByRole("button", { name: "2 Place", exact: true }).click();
      await expect(root.getByText(/1280 × 720 pixels/)).toBeVisible();
      await root.getByLabel("Map layout", { exact: true }).fill("Same map with updated guidance.");
      await expect(root.getByRole("img", { name: "Selected village map", exact: true })).toBeVisible();
      await root.getByRole("button", { name: "Use this saved artwork", exact: true }).click();
      await forward("Continue to spaces").click();
      await root.getByRole("button", { name: "I checked all pins against this map", exact: true }).click();
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
      await forward("Continue to spaces").click();
      await root.getByRole("button", { name: "I checked all pins against this map", exact: true }).click();
      await forward("Save & exit").click();
      await expect(root.getByRole("button", { name: "Resume pin placement", exact: true })).toBeVisible();
      await page.reload();
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await root.getByRole("button", { name: "Resume pin placement", exact: true }).click();
      await root.getByRole("button", { name: "2 Place", exact: true }).click();
      await expect(root.getByRole("img", { name: "Selected village map", exact: true })).toBeVisible();
      await expect(root.getByText(/640 × 640 pixels/)).toBeVisible();
      assert.equal(mapCalls, 3, "upload and reload do not dispatch another image request");
      await forward("Continue to spaces").click();
    }
    await forward("Review village").click();
    await expect(root.getByText("Step 4 of 4 · Review")).toBeVisible();
    await expect(root.getByRole("button", { name: "Change people & role", exact: true })).toBeVisible();
    await expect(root.getByRole("button", { name: "Change place & map", exact: true })).toBeVisible();
    await expect(root.getByRole("button", { name: "Change starting spaces", exact: true })).toBeVisible();
    await bounds();
    await capture("review");
    await forward("Found village").click();
    await expect.poll(() => foundingPayload).toBeTruthy();
    assert.equal(foundingPayload.venues.length, homeCount + 2);
    assert.equal(foundingPayload.playerRole.title, "Harbor Patron");
    assert.deepEqual(foundingPayload.foundingCharacterIds, ["finn", "rosa", "lee"].slice(0, homeCount));
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
    await page.close();
  }
} finally {
  await browser.close();
}
