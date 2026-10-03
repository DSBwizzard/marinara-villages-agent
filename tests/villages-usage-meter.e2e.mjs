import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot as fixture, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let showUsageMeter = true,
      usageReads = 0;
    let reset = false,
      group = "";
    let holdNextPoll = false,
      heldPoll;
    const usageView = () => ({
      since: new Date().toISOString(),
      totals: {
        requests: reset ? 0 : 18,
        tokens: reset ? 0 : 32000,
        dollars: reset ? 0 : 0.42,
        usd: 0,
        yuan: reset ? 0 : 2.94,
        unknown: reset ? 0 : 2,
      },
      today: { requests: 18, tokens: 32000, dollars: 0.42, usd: 0, yuan: 2.94, unknown: 2 },
      purposes: {},
      running: 1,
      requests: reset
        ? []
        : [
            {
              id: "one",
              connectionId: "link",
              model: "gemini-test",
              purpose: "conversation",
              stage: "reply",
              status: "complete",
              dollars: 0.42,
              yuan: 2.94,
              rate: null,
            },
          ],
      models: [
        {
          connectionId: "link",
          model: "gemini-test",
          isLinkApi: true,
          group,
          groups: [{ id: "gemini", label: "Official", multiplier: 1.6 }],
          rate: group
            ? {
                input: 2,
                output: 16,
                currency: "CNY",
                source: "https://linkapi.ai/pricing",
                checkedAt: new Date().toISOString(),
              }
            : null,
          note: group
            ? "Live LinkAPI prices; group gemini"
            : "Choose the group assigned to this connection's LinkAPI token",
        },
      ],
      exchangeRate: {
        yuanPerDollar: 7,
        checkedAt: new Date().toISOString(),
        source: "https://www.exchangerate-api.com",
      },
      scope: "Villages only",
      error: "",
    });
    let verbose = false,
      engineEnabled = false,
      patchCount = 0,
      failPatch = false;
    await page.route("http://villages.test/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<style>html,body{margin:0;background:#171b25;color:white;font-family:Arial}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = structuredClone(fixture);
      if (path.endsWith("/rooms/active")) value = { session: null, debugDiscardEnabled: false };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/rooms/archive")) value = { visits: [], total: 0 };
      else if (path.endsWith("/usage")) {
        usageReads++;
        value = usageView();
        if (holdNextPoll) {
          holdNextPoll = false;
          await new Promise((resolve) => {
            heldPoll = resolve;
          });
        }
      } else if (path.endsWith("/usage/reset")) {
        reset = true;
        value = usageView();
      } else if (path.endsWith("/usage/linkapi")) {
        assert.equal(route.request().postDataJSON().connectionId, "link");
        group = route.request().postDataJSON().group;
        value = usageView();
      } else if (path.endsWith("/debug/runtime")) {
        if (route.request().method() === "PATCH") {
          if (failPatch) {
            await route.fulfill({
              status: 500,
              contentType: "application/json",
              body: JSON.stringify({ error: "Could not save diagnostics" }),
            });
            return;
          }
          const body = route.request().postDataJSON();
          if (typeof body.verbose === "boolean") verbose = body.verbose;
          if (typeof body.showUsageMeter === "boolean") showUsageMeter = body.showUsageMeter;
          patchCount++;
        }
        value = { verbose, effective: verbose || engineEnabled, engineEnabled, showUsageMeter };
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: /^(Open settings menu|More)$/, exact: true }).click();
    await page.getByRole("button", { name: "DEBUG Settings", exact: true }).click();
    const meter = page.getByRole("complementary", { name: "Villages AI usage" });
    await expect(meter).toContainText("18 requests");
    await expect(meter).toContainText("¥2.9400 ≈ $0.4200");
    const assertFlow = async () => {
      const boxes = await page.evaluate(() => {
        const meter = document.querySelector('[aria-label="Villages AI usage"]');
        const content = meter.nextElementSibling;
        return {
          meter: meter.getBoundingClientRect().toJSON(),
          content: content.getBoundingClientRect().toJSON(),
          position: getComputedStyle(meter).position,
          scroll: document.documentElement.scrollWidth,
        };
      });
      assert.equal(boxes.position, "static");
      assert.ok(boxes.meter.bottom <= boxes.content.top + 1, "meter reserves space instead of overlaying controls");
      assert.ok(boxes.meter.right <= width && boxes.scroll <= width, "summary wraps without horizontal overflow");
    };
    await assertFlow();
    await meter.getByRole("button", { name: /^Villages AI usage/ }).click();
    await expect(meter).toContainText("1 USD ≈ ¥7.0000");
    await meter.getByLabel("Price connection and model").selectOption("link:gemini-test");
    await meter.getByLabel("LinkAPI token group").selectOption("gemini");
    await expect(meter).toContainText("¥2.0000 input / million · ¥16.0000 output / million");
    await assertFlow();
    holdNextPoll = true;
    await expect.poll(() => Boolean(heldPoll)).toBe(true);
    await meter.getByRole("button", { name: "Reset usage", exact: true }).click();
    await expect(meter).toContainText("0 requests · 0 tokens");
    heldPoll();
    await page.waitForTimeout(100);
    await expect(meter).toContainText("0 requests · 0 tokens");
    await expect(meter).toContainText("No requests in this period.");
    await expect(meter.getByLabel("LinkAPI token group")).toHaveValue("gemini");
    if (process.env.VILLAGES_USAGE_SCREENSHOT)
      await page.screenshot({ path: process.env.VILLAGES_USAGE_SCREENSHOT.replace(".png", "-" + width + ".png") });
    await meter.getByRole("button", { name: /^Villages AI usage/ }).click();
    const meterToggle = page.getByRole("checkbox", { name: "Show AI usage meter", exact: true });
    await meter.getByRole("button", { name: "Hide usage", exact: true }).click();
    await expect(meter).toHaveCount(0);
    await expect(meterToggle).not.toBeChecked();
    await meterToggle.click();
    await expect(meter).toBeVisible();
    await expect(meterToggle).toBeChecked();
    await meterToggle.click();
    await expect(meter).toHaveCount(0);
    const readsAfterHide = usageReads;
    await page.waitForTimeout(1800);
    assert.equal(usageReads, readsAfterHide);
    await meterToggle.click();
    await expect(meter).toBeVisible();
    patchCount = 0;
    const toggle = page.getByRole("checkbox", { name: "Verbose runtime logging", exact: true });
    await expect(toggle).toBeEnabled();
    await expect(toggle).not.toBeChecked();
    await toggle.click();
    await expect.poll(() => patchCount).toBe(1);
    await expect(page.getByText("Terminal logging: on.", { exact: true })).toBeVisible();
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: /^(Open settings menu|More)$/, exact: true }).click();
    await page.getByRole("button", { name: "DEBUG Settings", exact: true }).click();
    await expect(toggle).toBeChecked();
    failPatch = true;
    await toggle.click();
    await expect(page.getByRole("alert").filter({ hasText: "Could not save diagnostics" })).toBeVisible();
    await expect(toggle).toBeChecked();
    failPatch = false;
    await toggle.click();
    await expect(page.getByText("Terminal logging: off.", { exact: true })).toBeVisible();
    engineEnabled = true;
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: /^(Open settings menu|More)$/, exact: true }).click();
    await page.getByRole("button", { name: "DEBUG Settings", exact: true }).click();
    await expect(toggle).not.toBeChecked();
    await expect(page.getByText("Terminal logging: on (also enabled by DEBUG_AGENTS).", { exact: true })).toBeVisible();
    const box = await toggle.boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= width);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Usage layout, reset, LinkAPI prices, CNY/USD display, visibility and debug settings passed on desktop and phones.",
  );
} finally {
  await browser.close();
}
