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
  for (const { width, height, cardsPerRow, fontSize } of [
    { width: 1917, height: 655, cardsPerRow: 5, fontSize: 20 },
    { width: 1917, height: 600, cardsPerRow: 5, fontSize: 20 },
    { width: 1366, height: 500, cardsPerRow: 3, fontSize: 20 },
    { width: 1366, height: 768, cardsPerRow: 3, fontSize: 20 },
    { width: 1024, height: 768, cardsPerRow: 3, fontSize: 20 },
    { width: 1917, height: 655, cardsPerRow: 5, fontSize: 16 },
    { width: 390, height: 844, cardsPerRow: 2, fontSize: 20 },
    { width: 390, height: 844, cardsPerRow: 2, fontSize: 16 },
    { width: 390, height: 650, cardsPerRow: 2, fontSize: 20 },
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    let availablePersonas = personas;
    let connectionSettings = { systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" };
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/villages**", (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/connections") && route.request().method() === "PUT") {
        connectionSettings = { ...connectionSettings, ...JSON.parse(route.request().postData() ?? "{}") };
      }
      const value = path.endsWith("/setup/scenario-imprint/draft")
        ? {
            imprint: {
              origin: "",
              worldFacts: ["The village overlooks the sea"],
              openingConditions: ["The group gathers on Day 1"],
              visualCues: ["Salt-worn cottages"],
            },
          }
        : path.endsWith("/personas/ada")
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
                      ? { characters: [] }
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
    await expect(cards).toHaveCount(5);
    await expect(root.getByRole("img", { name: "Village scene unavailable" })).toBeVisible();
    const artPanel = root.locator(".marinara-capability-villages-scenario-art-panel");
    const artBounds = await artPanel.boundingBox();
    assert.ok(artBounds && artBounds.width > 0 && artBounds.height > 0, "the missing artwork keeps its panel");
    const firstFooter = await root.locator(".marinara-capability-villages-setup-footer").boundingBox();
    const firstForm = await root.locator(".marinara-capability-villages-side").boundingBox();
    if (width > 1000) {
      assert.ok(firstFooter && firstForm && artBounds.height > firstForm.height * 0.6, "artwork fills the form height");
      assert.ok(
        Math.abs(firstFooter.y + firstFooter.height - firstForm.y - firstForm.height) < 3,
        "navigation aligns with the form bottom",
      );
    }
    await root.getByRole("button", { name: "Next →" }).scrollIntoViewIfNeeded();
    const firstNext = await root.getByRole("button", { name: "Next →" }).boundingBox();
    assert.ok(
      firstNext && firstNext.y >= 0 && firstNext.y + firstNext.height <= height,
      "page 1 navigation is reachable",
    );
    const first = await cards.nth(0).boundingBox();
    const lastInRow = await cards.nth(cardsPerRow - 1).boundingBox();
    assert.ok(first && lastInRow && Math.abs(first.y - lastInRow.y) < 2, "scenario cards fit their row");
    assert.ok(first.height < 100, "scenario cards are compact");

    if (width > 1000 && height >= 600) {
      const size = await root.evaluate((element) => ({ scroll: element.scrollHeight, visible: element.clientHeight }));
      assert.ok(
        size.scroll <= size.visible + 1,
        `Village Identity fits at ${width}×${height} without page scrolling (${size.scroll}/${size.visible})`,
      );
      const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      assert.ok(documentHeight <= height + 1, `the document fits at ${width}×${height} (${documentHeight})`);
      const scrollPosition = await root.evaluate((element) => {
        element.scrollTop = 100;
        window.scrollTo(0, 100);
        return { panel: element.scrollTop, page: window.scrollY };
      });
      assert.deepEqual(scrollPosition, { panel: 0, page: 0 }, "the desktop page cannot scroll");
      const controls = [root.getByRole("button", { name: "Next →" })];
      for (const control of controls) {
        const bounds = await control.boundingBox();
        assert.ok(
          bounds && bounds.y >= 0 && bounds.y + bounds.height <= height,
          `all controls fit at ${width}×${height}: ${JSON.stringify(bounds)}`,
        );
      }
    }

    await root.getByText("Pioneer", { exact: true }).click();
    await expect.poll(() => artPanel.locator("img").evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
    await root.getByText("Rebuild", { exact: true }).click();
    await expect(root.getByRole("img", { name: "Village scene unavailable" })).toBeVisible();
    await root.getByText("Custom", { exact: true }).click();
    await root.getByText("Rebuild", { exact: true }).click();
    await root.getByLabel("What is this village called?").fill("Willowbrook");
    await root.getByRole("button", { name: "Next →" }).click();
    await expect(root.getByText("Step 2 of 6 · Connections & Persona")).toBeVisible();
    const secondArt = await artPanel.boundingBox();
    const secondFooter = await root.locator(".marinara-capability-villages-setup-footer").boundingBox();
    const secondForm = await root.locator(".marinara-capability-villages-side").boundingBox();
    if (width > 1000) {
      assert.ok(
        secondArt && secondForm && secondArt.height > secondForm.height * 0.6,
        "page 2 artwork fills the form height",
      );
      assert.ok(
        secondFooter && Math.abs(secondFooter.y + secondFooter.height - secondForm.y - secondForm.height) < 3,
        "page 2 navigation aligns with the form bottom",
      );
    }
    await root.getByRole("button", { name: "Next →" }).scrollIntoViewIfNeeded();
    const secondNext = await root.getByRole("button", { name: "Next →" }).boundingBox();
    assert.ok(
      secondNext && secondNext.y >= 0 && secondNext.y + secondNext.height <= height,
      "page 2 navigation is reachable",
    );
    await root.getByLabel("Images", { exact: true }).scrollIntoViewIfNeeded();
    const imagesBounds = await root.getByLabel("Images", { exact: true }).boundingBox();
    assert.ok(
      imagesBounds && imagesBounds.y >= 0 && imagesBounds.y + imagesBounds.height <= height,
      "page 2 controls are reachable",
    );
    await expect(root.getByRole("img", { name: "Village scene unavailable" })).toBeVisible();
    const personaCards = root.locator(".marinara-capability-villages-identity-card");
    await expect(personaCards).toHaveCount(3);
    assert.equal(
      await personaCards
        .first()
        .textContent()
        .then((value) => value.includes("Ada")),
      true,
      "Personas are alphabetic, without promoting the Engine active Persona",
    );
    await expect(root.locator('.marinara-capability-villages-identity-card[aria-pressed="true"]')).toHaveCount(0);
    await root.getByPlaceholder("Search Personas").fill("patient");
    await expect(personaCards).toHaveCount(1);
    await personaCards.first().focus();
    await page.keyboard.press("Enter");
    await expect(personaCards.first()).toHaveAttribute("aria-pressed", "true");
    await expect(root.getByRole("heading", { name: "Ada" })).toBeVisible();
    await expect(root.getByText("A patient observer of small changes.")).toBeVisible();
    await expect(root.getByText("Appearance", { exact: true })).toBeVisible();
    await expect(root.getByText("Personality", { exact: true })).toBeVisible();
    await expect(root.getByText("Backstory", { exact: true })).toBeVisible();
    await root.getByPlaceholder("Search Personas").fill("returning");
    await personaCards.first().click();
    await expect(root.getByRole("heading", { name: "Bryn" })).toBeVisible();
    await expect(root.getByText("Returned from a long journey.").first()).toBeVisible();
    await expect(root.locator(".marinara-capability-villages-identity-details dt")).toHaveText(["Backstory"]);
    await root.getByPlaceholder("Search Personas").fill("");
    await root.getByRole("button", { name: /Zara/ }).click();
    await root.getByRole("button", { name: /Ada/ }).click();
    await expect(root.getByRole("heading", { name: "Ada" })).toBeVisible();
    for (const name of ["System", "Narration", "Images"])
      await expect(root.getByLabel(name, { exact: true })).toBeVisible();
    await expect(root.getByRole("button", { name: "← Back" })).toBeVisible();
    await expect(root.getByRole("button", { name: "Next →" })).toBeVisible();
    await root.getByRole("button", { name: "Next →" }).click();
    await expect(root.getByText("Step 3 of 6 · World & First Day")).toBeVisible();
    await expect(root.getByLabel("What is this village like?")).toBeVisible();
    await expect(root.getByLabel("What happens on the village's first day?")).toHaveValue(/On Day 1/);
    await expect(artPanel).toBeVisible();
    await expect(root.getByText("Choose lorebooks (0/24)")).toBeVisible();
    await root.getByText("Choose lorebooks (0/24)").click();
    await root.getByRole("searchbox", { name: "Search lorebooks" }).fill("Lorebook 37");
    await root.getByRole("checkbox", { name: "Lorebook 37" }).check();
    await expect(root.getByRole("button", { name: "Remove Lorebook 37" })).toBeVisible();
    await expect(root.getByRole("checkbox", { name: "Lorebook 1", exact: true })).toHaveCount(0);
    const thirdFooter = await root.locator(".marinara-capability-villages-setup-footer").boundingBox();
    const thirdForm = await root.locator(".marinara-capability-villages-side").boundingBox();
    const thirdArt = await artPanel.boundingBox();
    if (width > 1000) {
      assert.ok(thirdArt && thirdForm && thirdArt.height > thirdForm.height * 0.6, "page 3 keeps the artwork panel");
      assert.ok(
        thirdFooter && Math.abs(thirdFooter.y + thirdFooter.height - thirdForm.y - thirdForm.height) < 3,
        "page 3 navigation aligns with the form bottom",
      );
    }
    await root.getByLabel("What is this village like?").fill("A fishing village above the sea.");
    await root.getByRole("button", { name: "Preview starting details →" }).click();
    await expect(root.getByRole("region", { name: "Review starting details" })).toBeVisible();
    await expect(
      root
        .getByRole("region", { name: "Review starting details" })
        .locator("p")
        .filter({ hasText: "The group gathers on Day 1" }),
    ).toBeVisible();
    await root.getByRole("button", { name: "Use details and continue →" }).click();
    await expect(root.getByText("Step 4 of 6 · Village Map")).toBeVisible();
    await root.getByRole("button", { name: "← Back" }).click();
    await expect(root.getByText("Step 3 of 6 · World & First Day")).toBeVisible();
    await root.getByRole("button", { name: "← Back" }).click();
    if (width > 1000 && height >= 600) {
      const size = await root.evaluate((element) => ({ scroll: element.scrollHeight, visible: element.clientHeight }));
      assert.ok(
        size.scroll <= size.visible + 1,
        `Connections & Persona fits at ${width}×${height} (${size.scroll}/${size.visible})`,
      );
      const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      assert.ok(documentHeight <= height + 1, `page 2 document fits at ${width}×${height} (${documentHeight})`);
      for (const control of [
        root.getByPlaceholder("Search Personas"),
        root.getByLabel("Images"),
        root.getByRole("button", { name: "Next →" }),
      ]) {
        const bounds = await control.boundingBox();
        assert.ok(
          bounds && bounds.y >= 0 && bounds.y + bounds.height <= height,
          `page 2 controls fit at ${width}×${height}: ${JSON.stringify(bounds)}`,
        );
      }
    }
    await root.getByLabel("Images", { exact: true }).selectOption("__villages_image_disabled__");
    await root.getByRole("button", { name: "Next →" }).click();
    await expect(root.getByRole("alertdialog", { name: "Image connection recommendation" })).toBeVisible();
    await root.getByRole("button", { name: "Set up an image connection" }).click();
    await root.getByLabel("Images", { exact: true }).selectOption("image");
    availablePersonas = personas.filter((entry) => entry.id !== "ada");
    await root.getByRole("button", { name: "← Back" }).click();
    await root.getByRole("button", { name: "Next →" }).click();
    await expect(root.getByText("The saved Persona is no longer in your library.", { exact: false })).toBeVisible();
    await root.getByRole("button", { name: "Next →" }).click();
    await expect(root.getByText("Step 2 of 6 · Connections & Persona")).toBeVisible();
    await expect(root.getByText("That Persona is no longer in your library.", { exact: false })).toBeVisible();
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally {
  await browser.close();
}
