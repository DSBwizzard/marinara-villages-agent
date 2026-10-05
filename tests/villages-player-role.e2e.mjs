import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot as savedSnapshot } from "./fixtures/villages-scene-browser.fixture.mjs";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
const steward = {
  enabled: true,
  title: "Village Steward",
  explanation:
    "The village recognizes you as its trusted coordinator. Residents bring you proposals for improvements, and you help organize Projects, find willing builders, and see agreed plans through.",
};
const cases = [
  { founded: false, playerRole: null, label: "founding" },
  { founded: true, playerRole: steward, label: "steward" },
  {
    founded: true,
    playerRole: {
      enabled: true,
      title: "Harbor Patron",
      explanation: "Neighbors bring me plans because I coordinate harbor repairs.",
    },
    label: "custom",
  },
  { founded: true, playerRole: { ...steward, enabled: false }, label: "ordinary" },
  { founded: true, playerRole: null, label: "legacy" },
];
const screenshot = async (page, name) => {
  if (!process.env.VILLAGES_ROLE_SCREENSHOTS) return;
  mkdirSync(resolve("artifacts/role-ui"), { recursive: true });
  await page.screenshot({ path: resolve("artifacts/role-ui", name + ".png") });
};
try {
  for (const width of [1366, 390])
    for (const scenario of cases) {
      const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 768 } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const snapshot = {
        ...savedSnapshot,
        isFounded: scenario.founded,
        village: { ...savedSnapshot.village, setting: "A fishing village on sea cliffs." },
        settings: {
          ...savedSnapshot.settings,
          setting: "A fishing village on sea cliffs.",
          playerRole: scenario.playerRole,
          foundingReason: "none",
          foundingGuidance: "",
          foundingDetails: "Neighbors arrived with damaged boats.",
          playerPersonaId: "ada",
          playerPersonaName: "Ada",
          worldFacts: [],
          loreTokenBudget: 1600,
        },
      };
      await page.route("**/api/villages**", (route) => {
        const url = new URL(route.request().url()).pathname;
        const value = url.endsWith("/personas")
          ? { personas: [{ id: "ada", name: "Ada", summary: "A patient observer", isActive: true, avatarPath: null }] }
          : url.endsWith("/personas/ada")
            ? {
                persona: {
                  id: "ada",
                  name: "Ada",
                  description: "A patient observer",
                  appearance: "",
                  personality: "",
                  backstory: "",
                  avatarPath: null,
                },
              }
            : url.endsWith("/connections")
              ? { systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" }
              : url.endsWith("/lorebooks")
                ? { books: [] }
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
      await page.route("http://role.test/", (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/html",
          body: "<style>:root{font-size:20px;--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}html,body{margin:0;width:100%;height:100%;font-family:Arial,sans-serif}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
        }),
      );
      await page.goto("http://role.test/");
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      if (scenario.founded) {
        await page.getByRole("button", { name: /^(Open settings menu|More)$/ }).click();
        await page.getByRole("button", { name: "Village Settings", exact: true }).click();
        const summary = page.getByRole("region", { name: "Your place in the village" });
        await expect(summary).toContainText(
          scenario.playerRole
            ? scenario.playerRole.enabled
              ? scenario.playerRole.title
              : "Ordinary resident"
            : "No founding role recorded",
        );
        await expect(summary.getByRole("textbox")).toHaveCount(0);
        await summary.scrollIntoViewIfNeeded();
        if (scenario.label === "steward") await screenshot(page, "settings-" + width);
        await page.getByRole("button", { name: "Run setup again" }).click();
      } else {
        await page.locator(".marinara-capability-villages-identity-card").filter({ hasText: "Ada" }).click();
        await page.locator("summary").filter({ hasText: "Connections · Ready" }).click();
        await expect(page.getByLabel("System", { exact: true })).toBeVisible();
      }
      await expect(page.getByRole("button", { name: "1 People", exact: true })).toBeVisible();
      if (scenario.founded) {
        const summary = page.getByRole("region", { name: "Your place in the village" });
        await expect(summary).toContainText(
          scenario.playerRole
            ? scenario.playerRole.enabled
              ? scenario.playerRole.title
              : "Ordinary resident"
            : "No founding role recorded",
        );
        await expect(page.getByRole("checkbox", { name: "Recognized village role" })).toHaveCount(0);
        await expect(page.getByRole("textbox", { name: "Role title" })).toHaveCount(0);
      } else {
        if (width <= 704) await page.getByRole("button", { name: /^Your role ·/ }).click();
        await expect(page.getByRole("checkbox", { name: "Recognized village role" })).toHaveCount(0);
        const role = page.getByRole("group", { name: "Your role", exact: true });
        await expect(role.getByRole("textbox", { name: "Role title", exact: true })).toHaveValue("Project Coordinator");
        await role.scrollIntoViewIfNeeded();
        await screenshot(page, "founding-" + width);
        await expect(role.getByRole("textbox", { name: "Why villagers turn to you" })).toHaveValue(
          /People here recognize you as the coordinator for shared Projects\./,
        );
        assert.ok(
          await role.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
          "role controls fit the panel",
        );
      }
      assert.deepEqual(errors, []);
      console.log("Role UI " + width + ": " + scenario.label + " passed");
      await page.close();
    }
} finally {
  await browser.close();
}
