import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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

try {
  for (const { width, height, fontSize } of [
    { width: 1917, height: 655, fontSize: 20 },
    { width: 1917, height: 600, fontSize: 20 },
    { width: 1366, height: 500, fontSize: 20 },
    { width: 1366, height: 768, fontSize: 20 },
    { width: 1024, height: 768, fontSize: 20 },
    { width: 1917, height: 655, fontSize: 16 },
    { width: 390, height: 844, fontSize: 20 },
    { width: 390, height: 844, fontSize: 16 },
    { width: 390, height: 650, fontSize: 20 },
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: width < 600 });
    const homeCount = width === 390 ? (height === 650 ? 3 : 2) : height === 500 ? 3 : 1;
    const expectedRole = {
      enabled: true,
      title: "Village Steward",
      explanation:
        "The village recognizes you as its trusted coordinator. Residents bring you proposals for improvements, and you help organize Projects, find willing builders, and see agreed plans through.",
    };
    const roleMode =
      width === 1917 && height === 655 && fontSize === 20
        ? "default"
        : width === 390 && height === 650
          ? "disabled"
          : "custom";
    let imageCalls = 0;
    let releaseImage;
    const imageRef = {
      id: "test-art",
      ref: "global-gallery:test-art",
      url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8AAAwAB/AGtLQAAAABJRU5ErkJggg==",
    };
    const availablePersonas = personas;
    let connectionSettings = { systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" };
    let foundingPayload = null;
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/setup/venue-image/generate")) {
        imageCalls++;
        if (imageCalls === 2)
          await new Promise((resolve) => {
            releaseImage = resolve;
          });
        if (imageCalls > 1)
          return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(imageRef) });
        return route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "Optional image unavailable" }),
        });
      }
      if (path.endsWith("/setup/venue-image") && route.request().method() === "PUT")
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...imageRef, id: "uploaded-art" }),
        });
      if (path.endsWith("/setup") && route.request().method() === "POST") {
        foundingPayload = JSON.parse(route.request().postData() ?? "{}");
      }
      if (path.endsWith("/connections") && route.request().method() === "PUT") {
        connectionSettings = { ...connectionSettings, ...JSON.parse(route.request().postData() ?? "{}") };
      }
      const value = path.endsWith("/personas/ada")
        ? { persona: personaPreview }
        : path.endsWith("/personas/bryn")
          ? {
              persona: {
                ...personaPreview,
                id: "bryn",
                name: "Bryn",
                description: "",
                appearance: "",
                personality: "",
                backstory: "Returned from a long journey.",
              },
            }
          : path.endsWith("/personas/active")
            ? { persona: { ...personaPreview, id: "active", name: "Zara", description: "A watchful traveler." } }
            : path.endsWith("/personas")
              ? { personas: availablePersonas }
              : path.endsWith("/connections")
                ? connectionSettings
                : path.endsWith("/lorebooks")
                  ? { books: lorebooks }
                  : path.endsWith("/catalog")
                    ? {
                        characters: [
                          { id: "finn", name: "Finn" },
                          { id: "rosa", name: "Rosa" },
                          { id: "lee", name: "Lee" },
                        ],
                      }
                    : snapshot;
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
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
    await page.route("**/api/capability-packages/villages/assets/founding-*.jpg", (route) => {
      const file = new URL(route.request().url()).pathname.split("/").at(-1);
      if (file === "founding-rebuild.jpg") return route.fulfill({ status: 404 });
      return route.fulfill({
        status: 200,
        contentType: "image/jpeg",
        body: readFileSync(resolve("packages/villages", file)),
      });
    });
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
    await expect(root).toBeVisible();
    await expect(root.locator(".marinara-capability-villages-mapbar")).toHaveCount(0);
    const cards = root.locator(".marinara-capability-villages-scenario-option");
    await expect(cards).toHaveCount(4);
    const artPanel = root.locator(".marinara-capability-villages-scenario-art-panel");
    await expect(artPanel).toBeVisible();
    const checkTheme = async () => {
      const background = await root.evaluate((element) => getComputedStyle(element).backgroundImage);
      assert.match(background, /radial-gradient/, "every page keeps the founding palette");
      const panel = root.locator(".marinara-capability-villages-side > .marinara-capability-villages-overlay");
      const border = await panel.evaluate((element) => getComputedStyle(element).borderColor);
      assert.equal(border, "rgb(82, 104, 184)", "every page keeps the indigo panel border");
      const pageWidth = await root.evaluate((element) => element.scrollWidth - element.clientWidth);
      assert.ok(pageWidth <= 1, "the wizard has no horizontal overflow");
    };
    const visibleForward = async (label = "Next →") => {
      const button = root.getByRole("button", { name: label });
      await button.scrollIntoViewIfNeeded();
      const bounds = await button.boundingBox();
      assert.ok(
        bounds && bounds.y >= 0 && bounds.y + bounds.height <= height + 1,
        `navigation remains reachable at ${width}×${height}: ${JSON.stringify(bounds)}`,
      );
      return button;
    };

    await checkTheme();
    await expect(root.getByText("Step 1 of 5 · Village Beginning")).toBeVisible();
    await expect(root.getByLabel("What is this village called?")).toBeVisible();
    await expect(root.getByLabel("What is this village like?")).toBeVisible();
    const dayOne = root.getByLabel("What happens on the village's first day?");
    await expect(dayOne).toHaveValue(/On Day 1/);
    await root.getByText("Pioneer", { exact: true }).click();
    await expect.poll(() => artPanel.locator("img").evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
    await dayOne.fill("On Day 1, neighbors arrive with damaged boats.");
    await root.getByText("Open beginning", { exact: true }).click();
    await expect(dayOne).toHaveValue("On Day 1, neighbors arrive with damaged boats.");
    await root.getByLabel("What is this village called?").fill("Willowbrook");
    await root.getByLabel("What is this village like?").fill("A fishing village on sea cliffs.");
    await root.getByText("Choose lorebooks (0/24)").click();
    await root.getByRole("searchbox", { name: "Search lorebooks" }).fill("Lorebook 37");
    await root.getByRole("checkbox", { name: "Lorebook 37" }).check();
    await expect(root.getByText(/In the next step, choose your place in this community/)).toBeVisible();
    await expect(root.getByRole("button", { name: "Remove Lorebook 37" })).toBeVisible();
    await (await visibleForward()).click();

    await expect(root.getByText("Step 2 of 5 · Connections & Persona")).toBeVisible();
    await checkTheme();
    const personaCards = root.locator(".marinara-capability-villages-identity-card");
    await expect(personaCards).toHaveCount(3);
    await root.getByPlaceholder("Search Personas").fill("patient");
    await personaCards.first().click();
    await expect(root.getByRole("heading", { name: "Ada" })).toBeVisible();
    const roleToggle = root.getByRole("checkbox", { name: "Recognized village role" });
    const roleTitle = root.getByRole("textbox", { name: "Role title", exact: true });
    const roleExplanation = root.getByRole("textbox", { name: "Why villagers turn to you", exact: true });
    await expect(roleToggle).toBeChecked();
    await expect(roleTitle).toHaveValue(expectedRole.title);
    await expect(roleExplanation).toHaveValue(expectedRole.explanation);
    await expect(roleTitle).toHaveAttribute("maxlength", "80");
    await expect(roleExplanation).toHaveAttribute("maxlength", "1000");
    if (roleMode !== "default") {
      await roleTitle.fill(" ");
      await (await visibleForward()).click();
      await expect(root.getByRole("alert")).toContainText("Give your village role a title");
      await expect(root.getByText("Step 2 of 5 · Connections & Persona")).toBeVisible();
      expectedRole.title = "Harbor Patron";
      expectedRole.explanation = "Neighbors bring me plans because I coordinate harbor repairs.";
      await roleTitle.fill(expectedRole.title);
      await roleExplanation.fill(expectedRole.explanation);
      await roleToggle.focus();
      await page.keyboard.press("Space");
      await expect(roleToggle).not.toBeChecked();
      await expect(roleTitle).toHaveCount(0);
      await expect(root.getByText(/You participate as an ordinary resident/)).toBeVisible();
      await page.keyboard.press("Space");
      await expect(roleTitle).toHaveValue(expectedRole.title);
      await expect(roleExplanation).toHaveValue(expectedRole.explanation);
      if (roleMode === "disabled") {
        await roleToggle.uncheck();
        expectedRole.enabled = false;
      }
    }
    await (await visibleForward("← Back")).click();
    await (await visibleForward()).click();
    await expect(roleToggle).toBeChecked({ checked: expectedRole.enabled });
    if (expectedRole.enabled) await expect(roleTitle).toHaveValue(expectedRole.title);
    for (const name of ["System", "Narration", "Images"])
      await expect(root.getByLabel(name, { exact: true })).toBeVisible();
    await (await visibleForward()).click();

    await expect(root.getByText("Step 3 of 5 · Village Map")).toBeVisible();
    await checkTheme();
    await expect(root.getByRole("combobox", { name: "Scenery style preset" })).toHaveValue("Painted illustration");
    await root.getByRole("combobox", { name: "Scenery style preset" }).selectOption("Pixel art");
    await expect(root.getByLabel("Scenery style description")).toHaveValue(/Pixel art/);
    await root.getByRole("combobox", { name: "Scenery style preset" }).selectOption("Painted illustration");
    await root.getByRole("button", { name: "Generate with AI" }).click();
    await root.getByText("Advanced map elements").click();
    for (const name of ["Roads and paths", "Structures", "Water"])
      await expect(root.getByRole("combobox", { name, exact: true })).toHaveValue("auto");
    await root.getByRole("button", { name: "No background image" }).click();
    await (await visibleForward()).click();

    await expect(root.getByText("Step 4 of 5 · Build the Village")).toBeVisible();
    await checkTheme();

    await root.getByLabel("Number of villager homes", { exact: true }).selectOption(String(homeCount));
    const canvas = root.locator(
      ".marinara-capability-villages-setup-map-viewport .marinara-capability-villages-canvas",
    );
    const spot = async (x, y) => {
      await canvas.scrollIntoViewIfNeeded();
      if (width < 600) await expect(canvas.locator(".marinara-capability-villages-mobile-logical")).toBeVisible();
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const box = await canvas.boundingBox();
      assert.ok(box);
      if (width < 600) await canvas.tap({ position: { x: box.width * x, y: box.height * y } });
      else await canvas.click({ position: { x: box.width * x, y: box.height * y } });
      await expect(root.getByRole("dialog")).toBeVisible();
    };
    if (width >= 600) {
      const map = root.locator(".marinara-capability-villages-setup-map-viewport");
      await map.focus();
      await page.keyboard.press("ArrowLeft");
      await expect(canvas.locator(".marinara-capability-villages-placement-cursor")).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(root.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(root.getByRole("dialog")).toHaveCount(0);
    }
    await spot(0.15, 0.3);
    await root.getByRole("dialog").getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(root.getByRole("dialog")).toHaveCount(0);
    await expect(root.getByRole("button", { name: /Your residence/ })).toHaveCount(0);
    const positions = [
      [0.15, 0.3],
      [0.7, 0.3],
      [0.15, 0.65],
      [0.7, 0.65],
      [0.45, 0.85],
    ];
    for (let index = 0; index < homeCount + 2; index++) {
      await spot(...positions[index]);
      if (index === 1) {
        await root.getByRole("dialog").getByRole("button", { name: "Move on map", exact: true }).click();
        await root.getByRole("button", { name: /Your residence ·/ }).click();
        await root.getByRole("dialog").getByLabel("Venue name", { exact: true }).fill("Discard while moving draft");
        await page.keyboard.press("Escape");
        await expect(root.getByRole("button", { name: /Your residence ·/ })).toBeVisible();
        await spot(...positions[index]);
      }
      const dialog = root.getByRole("dialog");
      const forward = dialog.getByRole("button", { name: "Continue", exact: true });
      if (index > 0 && index <= homeCount) {
        await dialog.getByLabel("Assigned villager").selectOption(["finn", "rosa", "lee"][index - 1]);
        await forward.click();
      }
      await dialog
        .getByLabel("Venue name", { exact: true })
        .fill(
          index === 0
            ? "Your residence"
            : index <= homeCount
              ? ["Finn", "Rosa", "Lee"][index - 1] + "'s residence"
              : "Gathering Place",
        );
      if (index === 0) {
        await forward.click();
        await expect(dialog.getByRole("alert")).toContainText("form");
      }
      await dialog
        .getByLabel("Venue form", { exact: true })
        .fill(index === homeCount + 1 ? "A communal fire pit" : "A modest stone home");
      await forward.click();
      const layout =
        index === 0 ? "both" : index === 1 ? "private" : index === 2 && index <= homeCount ? "common" : "exterior";
      await forward.click();
      await expect(dialog.getByRole("alert")).toContainText("Choose a venue layout");
      const layoutLabels = {
        exterior: "Exterior only",
        common: "Common Space only",
        private: "Private Space only",
        both: "Common Space and Private Space",
      };
      await dialog.getByRole("radio", { name: layoutLabels[layout], exact: true }).check();
      if (index === 0) {
        await dialog.getByRole("button", { name: "Remove Private Space", exact: true }).click();
        await expect(dialog.getByRole("status")).toContainText("0 Private Spaces");
        await dialog.getByRole("button", { name: "Add Private Space", exact: true }).click();
        await expect(dialog.getByLabel("Your personal-space description")).toBeFocused();
        await dialog.getByLabel("Your personal-space description").fill("Draft preserved through remove and add.");
        for (let back = 0; back < 3; back++) await dialog.getByRole("button", { name: "Back", exact: true }).click();
        await dialog.getByRole("button", { name: "Remove Private Space", exact: true }).click();
        await dialog.getByRole("button", { name: "Add Private Space", exact: true }).click();
        await expect(dialog.getByLabel("Your personal-space description")).toHaveValue(
          "Draft preserved through remove and add.",
        );
        for (let back = 0; back < 3; back++) await dialog.getByRole("button", { name: "Back", exact: true }).click();
      }
      await forward.click();
      await dialog.getByLabel("Exterior description", { exact: true }).fill("This place stands above the sea.");
      if (index === 1) {
        await dialog.getByRole("checkbox", { name: "Use assigned villager’s personality", exact: true }).uncheck();
        await dialog.getByRole("checkbox", { name: "Use selected visual lore", exact: true }).uncheck();
      }
      if (index === 0) {
        if (width < 600) {
          await page.setViewportSize({ width, height: 400 });
          await dialog.getByLabel("Exterior description").focus();
          await expect
            .poll(async () => (await forward.boundingBox()).y + (await forward.boundingBox()).height)
            .toBeLessThanOrEqual(400);
          await page.setViewportSize({ width, height });
        }
        if (
          process.env.VILLAGES_SCREENSHOT_DIR &&
          ((width === 1366 && height === 768) || (width === 390 && fontSize === 16))
        ) {
          await page.screenshot({ path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "founding-" + width + ".png") });
        }
        await dialog.getByRole("button", { name: "Generate exterior image", exact: true }).click();
        await expect(dialog.getByRole("alert")).toContainText("Optional image unavailable");
        await expect(dialog.getByLabel("Exterior description")).toHaveValue("This place stands above the sea.");
        if (width === 1366 && height === 768) {
          await dialog.getByRole("button", { name: "Generate exterior image", exact: true }).click();
          await expect.poll(() => !!releaseImage).toBe(true);
          await dialog.getByLabel("Exterior description").fill("Changed during image generation.");
          releaseImage();
          await expect(dialog.getByRole("button", { name: "Generate exterior image", exact: true })).toBeEnabled();
          await expect(dialog.locator("img")).toHaveCount(0);
          await dialog.getByLabel("Exterior description").fill("This place stands above the sea.");
          await dialog.getByRole("button", { name: "Generate exterior image", exact: true }).click();
          await expect(dialog.locator("img")).toHaveCount(1);
          await expect(dialog.getByRole("button", { name: "Regenerate exterior image", exact: true })).toBeEnabled();
          await dialog.getByRole("button", { name: "Regenerate exterior image", exact: true }).click();
          await expect(dialog.getByRole("button", { name: "Regenerate exterior image", exact: true })).toBeEnabled();
          await dialog.getByRole("button", { name: "Remove image", exact: true }).click();
          await expect(dialog.locator("img")).toHaveCount(0);
          await dialog.getByLabel("Upload exterior image").setInputFiles({
            name: "own-home.png",
            mimeType: "image/png",
            buffer: Buffer.from(imageRef.url.split(",")[1], "base64"),
          });
          await expect(dialog.locator("img")).toHaveCount(1);
          await dialog.getByRole("button", { name: "Remove image", exact: true }).click();
        }
      }
      if (layout === "common" || layout === "both") {
        await forward.click();
        await dialog.getByLabel("Common Space description", { exact: true }).fill("A bright, simple room.");
      }
      if (layout === "private" || layout === "both") {
        await forward.click();
        if (index === 0)
          await dialog.getByLabel("Your personal-space description").fill("My hammock and traveling journal.");
        else {
          await expect(dialog.getByText(/details stay hidden/)).toBeVisible();
          await expect(dialog.getByLabel("Description · optional")).toHaveCount(0);
        }
      }
      const done = dialog.getByRole("button", { name: "Done", exact: true });
      const box = await done.boundingBox();
      assert.ok(box && box.y >= 0 && box.y + box.height <= height + 1, "editor navigation stays in viewport");
      await done.focus();
      await page.keyboard.press("Enter");
      await expect(dialog).toHaveCount(0);
      await expect(root.locator(".marinara-capability-villages-setup-map-viewport")).toBeFocused();
      if (index === 2 && homeCount > 1) {
        await root.getByLabel("Number of villager homes", { exact: true }).selectOption("1");
        await expect(root.getByRole("button", { name: /Rosa's residence ·/ })).toBeVisible();
        await root.getByLabel("Number of villager homes", { exact: true }).selectOption(String(homeCount));
      }
      if (index === 0) {
        await root.getByLabel("Number of villager homes", { exact: true }).selectOption("3");
        await root.getByLabel("Number of villager homes", { exact: true }).selectOption(String(homeCount));
      }
    }
    // Reopening and cancelling an edit keeps the completed venue and next placement intact.
    await root.getByRole("button", { name: /Your residence ·/ }).click();
    await root.getByRole("dialog").getByLabel("Venue name", { exact: true }).fill("Discard this edit");
    await page.keyboard.press("Escape");
    await expect(root.getByRole("button", { name: /Your residence ·/ })).toBeVisible();
    if (homeCount > 1) {
      await root.getByLabel("Number of villager homes", { exact: true }).selectOption("1");
      await expect(root.getByRole("button", { name: /Rosa's residence ·/ })).toBeVisible();
    }
    await (await visibleForward("Review village")).click();

    await expect(root.getByText("Step 5 of 5 · Review")).toBeVisible();
    await checkTheme();
    await expect(root.getByText("On Day 1, neighbors arrive with damaged boats.", { exact: false })).toBeVisible();
    const roleReview = root.getByRole("region", { name: "Your place in the village" });
    await expect(roleReview).toContainText(expectedRole.enabled ? expectedRole.title : "Ordinary resident");
    if (expectedRole.enabled) await expect(roleReview).toContainText(expectedRole.explanation);
    else await expect(roleReview).not.toContainText(expectedRole.explanation);
    await expect(roleReview.getByRole("textbox")).toHaveCount(0);
    await expect(root.getByText("Starting details", { exact: true })).toHaveCount(0);
    await expect(root.getByText("Lorebook 37", { exact: false })).toBeVisible();
    await expect(root.getByRole("button", { name: "Found the village" })).toBeVisible();
    await root.getByRole("button", { name: "Found the village" }).click();
    await expect.poll(() => foundingPayload).not.toBeNull();
    assert.equal(foundingPayload.name, "Willowbrook");
    assert.equal(foundingPayload.setting, "A fishing village on sea cliffs.");
    assert.equal(foundingPayload.foundingDetails, "On Day 1, neighbors arrive with damaged boats.");
    assert.equal(foundingPayload.scenarioImprint, null);
    assert.deepEqual(
      foundingPayload.playerRole,
      expectedRole,
      "the reviewed role is submitted, including retained inactive text",
    );
    assert.deepEqual(foundingPayload.selectedLorebookIds, ["lore-37"]);
    assert.deepEqual(
      foundingPayload.venues.map((venue) => venue.form),
      [...Array(1 + homeCount).fill("A modest stone home"), "A communal fire pit"],
    );
    assert.equal(imageCalls, width === 1366 && height === 768 ? 4 : 1);
    assert.deepEqual(foundingPayload.venues[1].imageContext, {
      useAssignedVillagerContext: false,
      useVisualLore: false,
    });
    assert.deepEqual(foundingPayload.venues[0].imageContext, { useAssignedVillagerContext: true, useVisualLore: true });
    assert.match(foundingPayload.sceneryArtStyle, /Painted/);
    assert.equal(foundingPayload.venues[0].privateSpaces[0].description, "My hammock and traveling journal.");
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally {
  await browser.close();
}
