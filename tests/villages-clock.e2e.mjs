import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as base } from "./fixtures/villages-scene-browser.fixture.mjs";

// Test cases: village-clock, founding-timezone
const browser = await chromium.launch({
  headless: true,
});
await mkdir(".build-tmp/clock-visual", { recursive: true });
await withBrowser(browser, async () => {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, timezoneId: "Asia/Tokyo" });
    await mockEngineLookups(context);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let founding = false;
    let foundingSceneChecks = 0;
    let holdSnapshot = false;
    let heldSnapshot;
    let serverInstant = "2026-10-15T02:30:00Z";
    const state = () => {
      const value = structuredClone(base);
      value.isFounded = !founding;
      value.village.timeZone = "America/Los_Angeles";
      value.village.instant = serverInstant;
      value.clock = { revision: 2, timeZone: "America/Los_Angeles" };
      return value;
    };
    await page.route("http://villages.test/", (route) =>
      fulfill(route, {
        contentType: "text/html",
        body: `<style>
          html,body{margin:0;background:#171b25;color:white;font:16px Arial}
          marinara-capability-villages{display:block;height:100vh}
          [data-marinara-accent-animation] :where(.mari-rgb-icon-scope) svg:not(.mari-rgb-static-icon){
            color:var(--marinara-chat-chrome-button-text-active);stroke:currentColor
          }
        </style><div class="mari-rgb-icon-scope"><marinara-capability-villages></marinara-capability-villages></div>`,
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (holdSnapshot && path === "/api/villages") {
        heldSnapshot = route;
        return;
      }
      if (path.endsWith("/background/presence"))
        return fulfill(route, { json: { status: "ready", snapshot: state() } });
      let value = state();
      const status = 200;
      if (path.endsWith("/rooms/active")) {
        if (founding) {
          foundingSceneChecks++;
          return fulfill(route, { status: 503, json: { error: "Scene check should not run during Founding" } });
        }
        value = { session: null };
      } else if (path.endsWith("/connections"))
        value = { systemConnectionId: "clock-test", narrationConnectionId: "clock-test", imageConnectionId: "" };
      else if (path.endsWith("/catalog")) value = { characters: [] };
      else if (path.endsWith("/personas")) value = { personas: [] };
      else if (path.endsWith("/lorebooks")) value = { books: [] };
      else if (path.endsWith("/debug/runtime")) value = { showUsageMeter: false, verbose: false, effective: false };
      else if (path.endsWith("/usage/preview")) value = { requests: 0, residents: [], dollars: null, unknownCosts: 0 };
      else if (path.endsWith("/usage"))
        value = {
          since: new Date().toISOString(),
          totals: { requests: 0, tokens: 0, dollars: 0, unknown: 0 },
          today: {},
          purposes: {},
          requests: [],
          running: 0,
        };
      else if (path.endsWith("/town-map")) value = { image: base.settings.townMapImage };
      await fulfill(route, { status, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.route("**/api/connections", (route) =>
      fulfill(route, { json: [{ id: "clock-test", name: "Clock fixture", provider: "language" }] }),
    );
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await runCase("village-clock/" + width, async () => {
      await expect(page.locator(".marinara-capability-villages-mobile-clock")).toContainText("07:30");
      assert.ok(await page.getByRole("button", { name: /^(Open settings menu|More)$/ }).isEnabled());
      await page.screenshot({ path: ".build-tmp/clock-visual/nonblocking-" + width + ".png" });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false);
      serverInstant = "2026-10-15T05:30:00Z";
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await expect(page.locator(".marinara-capability-villages-mobile-clock")).toContainText("10:30");
    });
    await runCase("founding-timezone/" + width, async () => {
      founding = true;
      serverInstant = "2026-10-15T02:59:57Z";
      await page.clock.install({ time: new Date("2030-01-01T12:00:00Z") });
      await page.clock.pauseAt(new Date("2030-01-01T12:01:00Z"));
      await page.reload();
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      const scene = page.locator(".villages-forging-v2");
      await expect(scene.locator(".villages-founding-title")).toBeVisible();
      await expect(scene).toHaveCSS("background-image", /mari-founding-overlook-day\.webp/);
      await page.evaluate(() => {
        document.documentElement.dataset.marinaraAccentAnimation = "true";
        document.documentElement.style.setProperty("--marinara-chat-chrome-button-text-active", "#ec4899");
      });
      const skyline = scene.locator(".villages-founding-logo path");
      await expect(skyline).toHaveCSS("fill", "rgb(224, 228, 201)");
      await expect(skyline).toHaveCSS("stroke", "none");
      await page.getByRole("button", { name: "START", exact: true }).click();
      const phases = page.getByRole("list", { name: "Founding phases" });
      const mari = scene.getByRole("region", { name: "Professor Mari", exact: true });
      await expect(scene).toHaveAttribute("aria-busy", "true");
      await expect(scene.locator(".villages-founding-title")).toHaveJSProperty("inert", true);
      await expect(scene.locator(".villages-founding-title")).toHaveCSS("animation-name", "villages-title-fade");
      await expect(scene.locator('.villages-setting-stage img[src$="mari-founding-looking-up.webp"]')).toHaveCount(1);
      await expect(scene).toHaveCSS("background-image", /mari-founding-overlook-day\.webp/);
      await page.clock.fastForward(350);
      const models = scene.getByRole(width === 390 ? "dialog" : "region", { name: "Choose your models" });
      await expect(models).toBeVisible();
      await expect(phases).toHaveCount(0);
      await expect(mari).toHaveCount(0);
      await models.getByRole("button", { name: "Next", exact: true }).click();
      await page
        .getByRole("dialog", { name: "Image connection", exact: true })
        .getByRole("button", { name: "Continue without images", exact: true })
        .click();
      await expect(scene).toHaveAttribute("data-mari-turning", "true");
      await page.clock.fastForward(500);
      await expect(scene.locator(".villages-founding-title")).toHaveCount(0);
      await expect(phases).toBeVisible();
      await expect(mari.getByText("Professor Mari", { exact: true })).toBeVisible();
      await expect(page.getByRole("combobox", { name: "Village Timezone" })).toHaveCount(0);
      await expect(scene).toHaveAttribute("data-lighting", "day");
      await expect(scene).toHaveCSS("background-image", /mari-founding-overlook-day\.webp/);
      if (width === 390) await expect(scene).toHaveCSS("background-position", /, 50% 100%$/);
      await page.screenshot({ path: ".build-tmp/clock-visual/founding-day-" + width + ".png" });
      const next = mari.getByRole("button", { name: "Next", exact: true });
      const advanceLine = async () => {
        for (let pageIndex = 0; pageIndex < 20; pageIndex++) {
          const anotherPage = await scene.locator(".villages-setting-dialogue[data-reader-next-page]:visible").count();
          await next.click();
          await page.clock.fastForward(17);
          if (!anotherPage) return;
        }
        throw Error("Founding line did not finish");
      };
      for (let line = 0; line < 6; line++) await advanceLine();
      const worldForm = width === 390 ? scene.getByRole("dialog", { name: "The wider world", exact: true }) : mari;
      const world = worldForm.getByLabel("World description");
      await world.fill("A string of settlements along the coast");
      await page.clock.fastForward(3000);
      await expect(scene).toHaveAttribute("data-lighting", "night");
      await expect(scene).toHaveCSS("background-image", /mari-founding-overlook\.webp/);
      if (width === 390) await expect(scene).toHaveCSS("background-position", /, 50% 100%$/);
      await expect(world).toHaveValue("A string of settlements along the coast");
      await page.screenshot({ path: ".build-tmp/clock-visual/founding-night-" + width + ".png" });
      holdSnapshot = true;
      await page.evaluate(async () => {
        const villages = document.querySelector("marinara-capability-villages");
        const parent = villages.parentElement;
        villages.remove();
        await Promise.resolve();
        parent.append(villages);
      });
      await expect.poll(() => !!heldSnapshot).toBe(true);
      await expect(page.locator(".marinara-capability-villages-root")).toHaveCount(0);
      holdSnapshot = false;
      await fulfill(heldSnapshot, { status: 503, json: { error: "Village snapshot unavailable" } });
      await expect(page.getByRole("alert")).toContainText("Village snapshot unavailable");
      await page.getByRole("button", { name: "Try again", exact: true }).click();
      await expect(worldForm).toBeVisible();
      await expect(world).toHaveValue("A string of settlements along the coast");
      assert.equal(foundingSceneChecks, 0, "Founding remounts never ask for an active Scene");
    });
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log("Desktop/mobile nonblocking server clock and automatic Engine founding timezone passed.");
});
