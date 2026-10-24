import { mockEngineLookups, fulfill, chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import { snapshot as fixture, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await mockEngineLookups(page);
    let enabled = false,
      reviewCount = 0,
      completed = false;
    const view = () => ({
      enabled,
      activatedAt: enabled ? "2026-10-20T12:00:00Z" : null,
      work: reviewCount
        ? {
            status: completed ? "completed" : "failed",
            error: completed ? "" : "Saved review needs deliberate recovery.",
            requests: 1,
          }
        : null,
      residents: [
        {
          characterId: "a",
          name: "Ada",
          nextReviewAt: "2026-10-24T12:00:00Z",
          reason: "Bram needs privacy.",
          pursuits: [{ id: "move", status: "stalled", reason: "Waiting for Bram to reconsider." }],
        },
      ],
      log: [
        {
          id: "review",
          actorId: "a",
          outcome: "Rejected",
          reason: "The household has not agreed.",
          at: "2026-10-23T12:00:00Z",
          effectiveAt: "2026-10-22T12:00:00Z",
        },
      ],
    });
    await page.route("http://villages.test/", (route) =>
      fulfill(route, {
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
      else if (path.endsWith("/debug/runtime")) value = { verbose: false, effective: false, engineEnabled: false };
      else if (path.endsWith("/development/review")) {
        assert.match(route.request().postDataJSON().actionId, /^[a-zA-Z0-9-]+$/);
        reviewCount++;
        value = view();
      } else if (path.endsWith("/development")) {
        if (route.request().method() === "PATCH") enabled = route.request().postDataJSON().enabled;
        value = view();
      }
      await fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: /^(Open settings menu|More)$/, exact: true }).click();
    await page.getByRole("button", { name: "DEBUG Settings", exact: true }).click();
    const toggle = page.getByRole("checkbox", { name: "Enable prototype", exact: true });
    await expect(toggle).not.toBeChecked();
    await toggle.click();
    await expect(toggle).toBeChecked();
    await page.getByText("Inspect development · private", { exact: true }).click();
    await expect(page.getByText("Waiting for Bram to reconsider.", { exact: false })).toBeVisible();
    await expect(page.getByText("The household has not agreed.", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "Review due intentions", exact: true }).click();
    await expect(page.getByText(/Saved review needs deliberate recovery/)).toBeVisible();
    assert.equal(reviewCount, 1);
    completed = true;
    await page
      .getByRole("region", { name: "Resident development", exact: true })
      .getByRole("button", { name: "Refresh", exact: true })
      .click();
    await expect(page.getByText("Review: completed", { exact: true })).toBeVisible();
    await expect(page.getByText(/Saved review needs deliberate recovery/)).not.toBeVisible();
    assert.equal(reviewCount, 1, "Refreshing the inspector never buys another review.");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await mkdir(".build-tmp/development-layout", { recursive: true });
    await page.screenshot({ path: `.build-tmp/development-layout/${width}.png`, fullPage: true });
    await page.close();
  }
} finally {
  await browser.close();
}
console.log("Development controls: activation, private reasons, recovery identity and desktop/phone layout passed.");
