import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
const residenceHints = [
  "A modest stone home, with ivy growing on the walls",
  "A tent and hammock pitched in the shade between two pine trees",
  "A mighty castle, with imposing obsidian pillars and multiple dungeons",
  "A dumpster behind the supermarket",
  "An armored cash transport car, converted into a mobile home",
];
const gatheringHints = [
  "A communal fire pit, with logs and stumps arranged around it in a semicircle",
  "A decommissioned pizzeria, complete with inert animatronic performers",
  "The situation room, with a round table bearing strategic maps",
  "The hardy Brandythrone tavern, where ale and fistfights are plentiful",
  "A meticulously-landscaped public park, where trampling the roses is punishable by fine",
];

const seededVenue = (id, name, venueClass, x, y, playerHome = false, residentCharacterId = null) => ({
  id,
  name,
  form: "",
  classes: [venueClass],
  spaces: [
    {
      id: venueClass,
      venueClass,
      description: "",
      image: null,
      state: { condition: "", items: [], publicFacts: [], features: [], traces: [], updatedAt: "" },
    },
  ],
  residenceCapacity: 1,
  residentIds: residentCharacterId ? [residentCharacterId] : [],
  improvements: [null, null],
  description: "",
  category: venueClass === "gathering" ? "public-center" : "",
  presentation: { image: null, x, y },
  occupancy: { playerHome, residentCharacterId, homeKind: null },
  capabilities: [],
  state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
});
const startingVenues = [
  seededVenue("home-player", "Your residence", "residence", 0.25, 0.3, true),
  seededVenue("home-finn", "Finn's residence", "residence", 0.65, 0.35, false, "finn"),
  seededVenue("gathering", "Gathering Place", "gathering", 0.5, 0.7),
];
const snapshot = {
  status: "ready",
  isFounded: false,
  village: { name: "", setting: "" },
  noticeboard: [],
  venueRequests: [],
  upgradeRequests: [],
  residences: [],
  happenings: [],
  villagers: [],
  recap: null,
  settings: {
    venues: startingVenues,
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
    const page = await browser.newPage({ viewport: { width, height } });
    const availablePersonas = personas;
    let connectionSettings = { systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" };
    let foundingPayload = null;
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/villages**", (route) => {
      const path = new URL(route.request().url()).pathname;
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
                    ? { characters: [{ id: "finn", name: "Finn" }] }
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
    await expect(root.getByRole("button", { name: "Remove Lorebook 37" })).toBeVisible();
    await (await visibleForward()).click();

    await expect(root.getByText("Step 2 of 5 · Connections & Persona")).toBeVisible();
    await checkTheme();
    const personaCards = root.locator(".marinara-capability-villages-identity-card");
    await expect(personaCards).toHaveCount(3);
    await root.getByPlaceholder("Search Personas").fill("patient");
    await personaCards.first().click();
    await expect(root.getByRole("heading", { name: "Ada" })).toBeVisible();
    for (const name of ["System", "Narration", "Images"])
      await expect(root.getByLabel(name, { exact: true })).toBeVisible();
    await (await visibleForward()).click();

    await expect(root.getByText("Step 3 of 5 · Village Map")).toBeVisible();
    await checkTheme();
    await root.getByRole("button", { name: "Generate with AI" }).click();
    await root.getByText("Advanced map elements").click();
    for (const name of ["Roads and paths", "Structures", "Water"])
      await expect(root.getByRole("combobox", { name, exact: true })).toHaveValue("auto");
    await root.getByRole("button", { name: "No background image" }).click();
    await (await visibleForward()).click();

    await expect(root.getByText("Step 4 of 5 · Build the Village")).toBeVisible();
    await checkTheme();
    const place = async (button, x, y, name, count) => {
      await root.getByRole("button", { name: button }).click();
      const canvas = root.locator(
        ".marinara-capability-villages-setup-map-viewport .marinara-capability-villages-canvas",
      );
      await canvas.scrollIntoViewIfNeeded();
      const box = await canvas.boundingBox();
      assert.ok(box);
      await canvas.click({ position: { x: box.width * x, y: box.height * y } });
      await expect(root.locator(".marinara-capability-villages-setup-venue-card")).toHaveCount(count);
      await root.getByLabel("Name", { exact: true }).fill(name);
    };
    await place("Place a Residence", 0.3, 0.35, "Your residence", 1);
    await place("Place a Residence", 0.7, 0.35, "Finn's residence", 2);
    await root.locator(".marinara-capability-villages-setup-venue-editor select").last().selectOption("finn");
    await place("Place a Gathering Place", 0.5, 0.7, "Gathering Place", 3);
    await expect(root.locator(".marinara-capability-villages-setup-venue-card")).toHaveCount(3);
    await root.locator(".marinara-capability-villages-setup-venue-card").first().click();
    await expect(root.getByText("What the Venue actually is")).toBeVisible();
    const form = root.locator("#marinara-capability-villages-setup-form");
    await expect(form).toHaveValue("");
    await expect(form).toHaveAttribute("placeholder", residenceHints[0]);
    if (width === 1917 && height === 655 && fontSize === 20) {
      await root.getByRole("button", { name: "Generate Exterior Image" }).click();
      await expect(root.getByRole("alert")).toContainText("exterior description");
      await expect(root.locator("#marinara-capability-villages-setup-exterior-description")).toBeFocused();
      await page.waitForTimeout(3000);
      await expect(form).toHaveAttribute("placeholder", residenceHints[0]);
      await expect(form).toHaveAttribute("placeholder", residenceHints[1], { timeout: 2500 });
      await form.focus();
      const paused = await form.getAttribute("placeholder");
      await page.waitForTimeout(4200);
      assert.equal(await form.getAttribute("placeholder"), paused, "focused Form pauses its examples");
      await form.blur();
      for (const hint of [...residenceHints.slice(2), residenceHints[0]])
        await expect(form).toHaveAttribute("placeholder", hint, { timeout: 5500 });
    }
    await (await visibleForward()).click();
    await expect(root.getByRole("alert")).toContainText("form");
    await expect(form).toBeFocused();
    for (let index = 0; index < 3; index++) {
      await root.locator(".marinara-capability-villages-setup-venue-card").nth(index).click();
      const name = index === 0 ? "Your residence" : index === 1 ? "Finn's residence" : "Gathering Place";
      const selectedForm = root.locator("#marinara-capability-villages-setup-form");
      await expect(selectedForm).toHaveValue("");
      if (index === 2) {
        await expect(selectedForm).toHaveAttribute("placeholder", gatheringHints[0]);
        if (width === 1917 && height === 655 && fontSize === 20)
          for (const hint of [...gatheringHints.slice(1), gatheringHints[0]])
            await expect(selectedForm).toHaveAttribute("placeholder", hint, { timeout: 5500 });
      }
      await selectedForm.fill(index === 2 ? "A communal fire pit" : "A modest stone home");
      if (index === 0 && width === 1917 && height === 655 && fontSize === 20) {
        const filledHint = await selectedForm.getAttribute("placeholder");
        await page.waitForTimeout(4200);
        assert.equal(await selectedForm.getAttribute("placeholder"), filledHint, "filled Form pauses its examples");
        await expect(selectedForm).toHaveValue("A modest stone home");
        await (await visibleForward()).click();
        await expect(root.getByRole("alert")).toContainText("exterior description");
        await expect(root.locator("#marinara-capability-villages-setup-exterior-description")).toBeFocused();
      }
      await root
        .locator("#marinara-capability-villages-setup-exterior-description")
        .fill(`${name} stands above the sea.`);
      if (index === 0 && width === 1917 && height === 655 && fontSize === 20) {
        await (await visibleForward()).click();
        await expect(root.getByRole("alert")).toContainText("interior description");
        await expect(root.locator("#marinara-capability-villages-setup-interior-description")).toBeFocused();
        await root.getByRole("button", { name: "Generate Interior Image" }).click();
        await expect(root.getByRole("alert")).toContainText("interior description");
      }
      await root.locator("#marinara-capability-villages-setup-interior-description").fill("A bright, simple room.");
    }
    await (await visibleForward()).click();

    await expect(root.getByText("Step 5 of 5 · Review")).toBeVisible();
    await checkTheme();
    await expect(root.getByText("On Day 1, neighbors arrive with damaged boats.", { exact: false })).toBeVisible();
    await expect(root.getByText("Starting details", { exact: true })).toHaveCount(0);
    await expect(root.getByText("Lorebook 37", { exact: false })).toBeVisible();
    await expect(root.getByRole("button", { name: "Found the village" })).toBeVisible();
    await root.getByRole("button", { name: "Found the village" }).click();
    await expect.poll(() => foundingPayload).not.toBeNull();
    assert.equal(foundingPayload.name, "Willowbrook");
    assert.equal(foundingPayload.setting, "A fishing village on sea cliffs.");
    assert.equal(foundingPayload.foundingDetails, "On Day 1, neighbors arrive with damaged boats.");
    assert.equal(foundingPayload.scenarioImprint, null);
    assert.deepEqual(foundingPayload.selectedLorebookIds, ["lore-37"]);
    assert.deepEqual(
      foundingPayload.venues.map((venue) => venue.form),
      ["A modest stone home", "A modest stone home", "A communal fire pit"],
    );
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally {
  await browser.close();
}
