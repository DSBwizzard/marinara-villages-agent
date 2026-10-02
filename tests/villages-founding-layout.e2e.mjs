import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

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
    const root = page.locator(".marinara-capability-villages-setup-root");
    const forward = () => root.getByRole("button", { name: "Next →", exact: true });
    const capture = async (name) => {
      if (!process.env.VILLAGES_SCREENSHOT_DIR || ![1366, 390].includes(width) || (width === 390 && height !== 844))
        return;
      await root.locator(".marinara-capability-villages-setup-body").evaluate((element) => {
        element.scrollTop = 0;
      });
      await page.screenshot({ path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, `${name}-${width}.png`) });
    };
    const checkBounds = async () => {
      assert.ok(
        await root
          .locator(".marinara-capability-villages-setup-rail")
          .evaluate(
            (element) =>
              element.clientHeight >=
              element.querySelector(".marinara-capability-villages-setup-rail-step").offsetHeight,
          ),
        "progress rail is not clipped",
      );
      assert.ok(
        await root.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
        "no horizontal wizard overflow",
      );
      const button = root.locator(".marinara-capability-villages-setup-footer button").last();
      const box = await button.boundingBox();
      assert.ok(box && box.y >= 0 && box.y + box.height <= height + 1, "wizard navigation stays visible");
    };
    await expect(root.getByText("Step 1 of 5 · Persona & Connections")).toBeVisible();
    await expect(root.getByLabel("Where are we?")).toHaveCount(0);
    await forward().click();
    await expect(root.getByRole("alert")).toContainText("Choose the Persona");
    await root.getByPlaceholder("Search Personas").fill("patient");
    await root.locator(".marinara-capability-villages-identity-card").click();
    await expect(root.getByRole("heading", { name: "Ada", exact: true })).toBeVisible();
    for (const label of ["System", "Narration", "Images"])
      await expect(root.getByLabel(label, { exact: true })).toBeVisible();
    await checkBounds();
    await capture("step-1");
    await forward().click();
    await expect(root.getByText("Step 2 of 5 · Your Role & Villagers")).toBeVisible();
    await expect(root.getByRole("region", { name: "Your selected Persona" })).toContainText("Ada");
    await expect(root.getByRole("checkbox", { name: "Recognized village role" })).toHaveCount(0);
    await expect(
      root.getByText("In Villages, you are the one who coordinates construction projects.", { exact: true }),
    ).toBeVisible();
    const roleTitle = root.getByRole("textbox", { name: "Role title", exact: true });
    await roleTitle.fill(" ");
    await forward().click();
    await expect(root.getByRole("alert")).toContainText("Give your village role a title");
    await roleTitle.fill("Harbor Patron");
    await root
      .getByRole("textbox", { name: "Why villagers turn to you", exact: true })
      .fill("Neighbors bring me plans because I coordinate harbor repairs.");
    await forward().click();
    await expect(root.getByRole("alert")).toContainText("Choose one to three");
    const grid = root.getByRole("group", { name: "Choose founding villagers" });
    await expect(grid.getByRole("button")).toHaveCount(characters.length);
    const dimensions = await grid.evaluate((element) => ({
      height: element.clientHeight,
      scroll: element.scrollHeight,
      columns: getComputedStyle(element).gridTemplateColumns.split(" ").length,
      card: element.querySelector("button").getBoundingClientRect().height,
    }));
    assert.equal(dimensions.columns, 2);
    assert.ok(dimensions.scroll > dimensions.height, "full library is browsable within one scrollable grid");
    assert.ok(
      dimensions.height >= dimensions.card * 3 && dimensions.height < dimensions.card * 4,
      "three rows fit within the grid",
    );
    const cardSearch = root.getByRole("searchbox", { name: "Search character cards by name" });
    await cardSearch.fill("other 11");
    await expect(grid.getByRole("button")).toHaveCount(1);
    await grid.getByRole("button", { name: "Other 11", exact: true }).click();
    await cardSearch.fill("");
    await grid.getByRole("button", { name: "Other 11", exact: true }).click();
    for (const name of ["Finn", "Rosa", "Lee"].slice(0, homeCount))
      await grid.getByRole("button", { name, exact: true }).click();
    await grid.evaluate((element) => {
      element.scrollTop = 0;
    });
    if (homeCount === 3) await expect(grid.getByRole("button", { name: "Other 0", exact: true })).toBeDisabled();
    await checkBounds();
    await capture("step-2");
    await forward().click();
    await expect(root.getByText("Step 3 of 5 · Village & Map")).toBeVisible();
    await expect(root.locator(".marinara-capability-villages-scenario-option")).toHaveCount(4);
    await expect(root.getByText("No preset", { exact: true })).toHaveCount(0);
    await root.getByLabel("What is this village called?").fill("Willowbrook");
    await root
      .getByLabel("Where are we?")
      .fill("A coastal shelter where neighbors live while their boats are repaired.");
    await root
      .getByLabel("What brings you and the others together here?")
      .fill("Neighbors share the coast because their boats need repair.");
    await root.locator(".marinara-capability-villages-scenario-option").filter({ hasText: "Custom" }).click();
    await expect(root.getByLabel("What brings you and the others together here?")).toHaveValue(
      "Neighbors share the coast because their boats need repair.",
    );
    await root.getByText("Choose lorebooks (0/24)").click();
    await root.getByRole("searchbox", { name: "Search lorebooks" }).fill("Lorebook 37");
    await root.getByRole("checkbox", { name: "Lorebook 37", exact: true }).check();
    await root.getByText("Choose lorebooks (1/24)").click();
    for (const label of ["Use Village lorebooks for the map", "Use Village lorebooks for new venues by default"])
      await expect(root.getByRole("checkbox", { name: label, exact: true })).toBeChecked();
    await root.getByRole("combobox", { name: "Scenery style preset" }).selectOption("Pixel art");
    await expect(root.getByLabel("Scenery style description")).toHaveValue(/Pixel art/);
    await root.getByRole("button", { name: "No background image", exact: true }).click();
    await checkBounds();
    await capture("step-3");
    await forward().click();
    await expect(root.getByText("Step 4 of 5 · Starting Spaces")).toBeVisible();
    await expect(root.getByLabel("Number of villager homes")).toHaveCount(0);
    await expect(root.getByLabel("Home image default")).toHaveCount(0);
    const canvas = root.locator(
      ".marinara-capability-villages-setup-map-viewport .marinara-capability-villages-canvas",
    );
    const spot = async (x, y) => {
      await canvas.scrollIntoViewIfNeeded();
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const box = await canvas.boundingBox();
      assert.ok(box);
      if (width < 600) await canvas.tap({ position: { x: box.width * x, y: box.height * y } });
      else await canvas.click({ position: { x: box.width * x, y: box.height * y } });
      await expect(root.getByRole("dialog")).toBeVisible();
    };
    await spot(0.15, 0.3);
    await root.getByRole("dialog").getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(root.getByRole("dialog")).toHaveCount(0);
    await expect(root.locator(".marinara-capability-villages-pin-photo-card")).toHaveCount(0);
    const positions = [
      [0.15, 0.3],
      [0.7, 0.3],
      [0.15, 0.65],
      [0.7, 0.65],
      [0.45, 0.85],
    ];
    for (let index = 0; index < homeCount + 2; index++) {
      await spot(...positions[index]);
      const dialog = root.getByRole("dialog");
      const done = dialog.getByRole("button", { name: "Done", exact: true });
      if (width >= 600) {
        const doneBox = await done.boundingBox();
        const footerBox = await root.locator(".marinara-capability-villages-setup-footer").boundingBox();
        assert.ok(doneBox.y + doneBox.height <= footerBox.y, "venue Done stays above wizard navigation");
      }
      await expect(dialog.getByRole("tab", { name: "Details", exact: true })).toHaveAttribute("aria-selected", "true");
      await expect(dialog.locator(".villages-layout-exterior")).toContainText("Exterior");
      if (index > 0 && index <= homeCount) {
        const select = dialog.getByLabel("Assigned villager", { exact: true });
        assert.equal(await select.locator("option").count(), homeCount + 1, "assignment uses only the selected roster");
        assert.equal(await select.locator('option[value="extra-0"]').count(), 0);
        await expect(select).toHaveValue(["finn", "rosa", "lee"][index - 1]);
        if (index > 1) await expect(select.locator('option[value="finn"]')).toHaveAttribute("disabled", "");
      }
      const name =
        index === 0
          ? "Your residence"
          : index <= homeCount
            ? ["Finn", "Rosa", "Lee"][index - 1] + "'s residence"
            : "Gathering Place";
      await dialog.getByLabel("Venue name", { exact: true }).fill(name);
      await done.click();
      await expect(dialog.getByRole("alert")).toContainText("form");
      await dialog
        .getByLabel("Venue form", { exact: true })
        .fill(index === homeCount + 1 ? "A communal fire pit" : "A modest stone home");
      if (index === 0) {
        const detailsTab = dialog.getByRole("tab", { name: "Details", exact: true });
        await detailsTab.focus();
        await detailsTab.press("ArrowRight");
        await expect(dialog.getByRole("tab", { name: "Exterior", exact: true })).toBeFocused();
        await dialog.getByRole("tab", { name: "Exterior", exact: true }).press("Home");
        await expect(detailsTab).toBeFocused();
      }
      const hasCommon = index === 0 || index === 2;
      const hasPrivate = index === 0 || index === 1;
      if (hasCommon) await dialog.getByRole("button", { name: "Add a Common Space", exact: true }).click();
      if (hasPrivate) await dialog.getByRole("button", { name: "Add a Private Space", exact: true }).click();
      await done.click();
      await expect(dialog.getByRole("tab", { name: "Exterior", exact: true })).toHaveAttribute("aria-selected", "true");
      await dialog.getByLabel("Exterior description", { exact: true }).fill("This place stands above the sea.");
      if (index === 1) {
        await dialog.getByRole("checkbox", { name: "Use assigned villager’s personality", exact: true }).uncheck();
        await dialog.getByRole("checkbox", { name: "Use Village lorebooks", exact: true }).uncheck();
      }
      if (index === 0) {
        if (width < 600) {
          await page.setViewportSize({ width, height: 400 });
          await dialog.getByLabel("Exterior description").focus();
          await expect
            .poll(async () => {
              const box = await done.boundingBox();
              return box.y + box.height;
            })
            .toBeLessThanOrEqual(401);
          await page.setViewportSize({ width, height });
        }
        await dialog.getByRole("button", { name: "Generate exterior image", exact: true }).click();
        await expect(dialog.getByRole("alert")).toContainText("Optional image unavailable");
        await expect(dialog.getByLabel("Exterior description")).toHaveValue("This place stands above the sea.");
        assert.equal(imageCalls, 1, "failed optional generation does not automatically retry");
        if (width === 1366) {
          await dialog.getByRole("button", { name: "Generate exterior image", exact: true }).click();
          await expect.poll(() => !!releaseImage).toBe(true);
          await dialog.getByLabel("Exterior description").fill("Changed while generating.");
          releaseImage();
          await expect(dialog.getByRole("button", { name: "Generate exterior image", exact: true })).toBeEnabled();
          await expect(dialog.locator("img")).toHaveCount(0);
          await dialog.getByLabel("Exterior description").fill("This place stands above the sea.");
          await dialog.getByRole("button", { name: "Generate exterior image", exact: true }).click();
          await expect(dialog.locator("img")).toHaveCount(1);
          await dialog.getByRole("button", { name: "Remove image", exact: true }).click();
        }
        await dialog.getByLabel("Upload exterior image").setInputFiles({
          name: "home.png",
          mimeType: "image/png",
          buffer: Buffer.from(imageRef.url.split(",")[1], "base64"),
        });
        await expect(dialog.locator("img")).toHaveCount(1);
        await capture("step-4-exterior");
      }
      if (hasCommon) {
        await dialog.getByRole("tab", { name: "Common Space", exact: true }).click();
        await dialog.getByLabel("Common Space description", { exact: true }).fill("A bright, simple room.");
      }
      if (hasPrivate) {
        await dialog.getByRole("tab", { name: "Private Space", exact: true }).click();
        if (index === 0)
          await dialog.getByLabel("Your personal-space description").fill("My hammock and traveling journal.");
        else {
          await expect(dialog.getByText(/details stay hidden/)).toBeVisible();
          await expect(dialog.getByLabel("Description · optional")).toHaveCount(0);
        }
      }
      if (index === 0) {
        await dialog.getByRole("tab", { name: "Details", exact: true }).click();
        await dialog.getByRole("button", { name: "Add a Common Space", exact: true }).click();
        await expect(dialog.getByRole("tab", { name: "Common Space", exact: true })).toHaveCount(0);
        await dialog.getByRole("button", { name: "Add a Common Space", exact: true }).click();
        await dialog.getByRole("tab", { name: "Common Space", exact: true }).click();
        await expect(dialog.getByLabel("Common Space description")).toHaveValue("A bright, simple room.");
        await dialog.getByRole("tab", { name: "Details", exact: true }).click();
        await dialog.getByRole("button", { name: "Add a Private Space", exact: true }).click();
        await expect(dialog.getByRole("tab", { name: "Private Space", exact: true })).toHaveCount(0);
        await dialog.getByRole("button", { name: "Add a Private Space", exact: true }).click();
        await dialog.getByRole("tab", { name: "Private Space", exact: true }).click();
        await expect(dialog.getByLabel("Your personal-space description")).toHaveValue(
          "My hammock and traveling journal.",
        );
      }
      await done.click();
      await expect(dialog).toHaveCount(0);
      await expect(root.locator(".marinara-capability-villages-setup-map-viewport")).toBeFocused();
    }
    await checkBounds();
    const cards = root.locator(".marinara-capability-villages-pin-photo-card");
    await expect(cards).toHaveCount(homeCount + 2);
    await page.mouse.move(0, 0);
    const idle = await cards.first().boundingBox();
    assert.ok(idle.width < 45, "idle photographs stay small");
    const firstPin = root.locator('.marinara-capability-villages-pin[data-kind="place"]').first();
    if (width >= 600) {
      await firstPin.hover();
      await expect.poll(async () => (await cards.first().boundingBox()).width).toBeGreaterThan(idle.width * 2);
      await page.mouse.move(0, 0);
      await firstPin.focus();
      await expect.poll(async () => (await cards.first().boundingBox()).width).toBeGreaterThan(idle.width * 2);
    }
    if (width < 600) await firstPin.tap();
    else await firstPin.click();
    await expect(root.getByRole("dialog")).toBeVisible();
    await expect.poll(async () => (await cards.first().boundingBox()).width).toBeGreaterThan(idle.width * 2);
    await capture("step-4-details");
    await root.getByRole("dialog").getByRole("button", { name: "Cancel", exact: true }).click();
    await root.getByRole("button", { name: "Review village", exact: true }).click();
    await expect(root.getByText("Step 5 of 5 · Review")).toBeVisible();
    await expect(root.getByRole("textbox")).toHaveCount(0);
    await expect(root.getByRole("region", { name: "Your place in the village" })).toContainText("Harbor Patron");
    await root.getByRole("button", { name: "Found the village", exact: true }).click();
    await expect.poll(() => foundingPayload).toBeTruthy();
    assert.deepEqual(foundingPayload.foundingCharacterIds, ["finn", "rosa", "lee"].slice(0, homeCount));
    assert.equal(foundingPayload.playerRole.enabled, true);
    assert.equal(foundingPayload.foundingReason, "custom");
    assert.deepEqual(foundingPayload.selectedLorebookIds, ["lore-37"]);
    assert.equal(foundingPayload.venues.length, homeCount + 2);
    assert.equal(foundingPayload.venues[0].layout, "both");
    assert.equal(foundingPayload.venues[0].privateSpaces[0].description, "My hammock and traveling journal.");
    assert.deepEqual(foundingPayload.venues[1].imageContext, {
      useAssignedVillagerContext: false,
      useVisualLore: false,
    });
    assert.deepEqual(errors, []);
    console.log(
      `Founding ${width}×${height}, ${fontSize}px: roster, tabs, draft preservation, images, compact pins and review passed`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}
