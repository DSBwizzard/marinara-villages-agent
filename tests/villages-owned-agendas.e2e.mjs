import { clickCharacterTool } from "./fixtures/browser-diagnostics.mjs";
import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }),
      errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await mockEngineLookups(page);
    let paid = 0;
    const block = {
      startMinute: 360,
      endMinute: 480,
      label: "Patrolling the Hiking Trail",
      activity: "Patrolling the Hiking Trail, memorizing escape routes and testing footing on the uneven ground",
    };
    const longBlock = {
      startMinute: 840,
      endMinute: 960,
      activity: "Sorting the maps and cataloguing new trail markers for the next neighborhood walking tour",
    };
    const failedAgenda = {
      id: "agenda-job",
      instanceId: "agenda-instance",
      kind: "agenda",
      subjectId: "mara",
      status: "failed",
      error: "Response reached the output limit; explicit retry required.",
      failure: { cause: "output_limit", stage: "weekly-agenda", requestedOutputTokens: 1040 },
      attempt: 1,
      requests: 1,
    };
    let agendaJob;
    let retryBody;
    const resident = { characterId: "mara", agenda: null };
    await page.route("http://villages.test/", (route) =>
      fulfill(route, {
        contentType: "text/html",
        body: "<style>html,body{margin:0;background:#171b25;color:white;font:16px Arial}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      let value = structuredClone(snapshot);
      if (agendaJob) value.backgroundWork = [agendaJob];
      if (path.endsWith("/agendas") && url.searchParams.has("characterId")) {
        const inspect = url.searchParams.get("inspect") === "true";
        value = {
          visibility: inspect ? "inspect" : "known",
          days: [{ date: "2026-11-10", weekday: "Tuesday", blocks: inspect ? [block, longBlock] : [] }],
        };
      } else if (path.endsWith("/agendas")) value = { villagers: [resident] };
      else if (path.endsWith("/relationships")) value = { profiles: [{ characterId: "mara", entries: [] }] };
      else if (path.endsWith("/usage/preview")) value = { requests: 1, residents: [], dollars: null, unknownCosts: 1 };
      else if (path.endsWith("/usage"))
        value = {
          since: new Date().toISOString(),
          totals: { requests: 0, tokens: 0, dollars: 0, unknown: 0 },
          today: {},
          purposes: {},
          requests: [],
          running: 0,
        };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/rooms/active")) value = { session: null };
      else if (path.endsWith("/catalog")) value = { characters: [] };
      else if (path.endsWith("/personas")) value = { personas: [] };
      else if (path.endsWith("/lorebooks")) value = { books: [] };
      else if (path.endsWith("/debug/runtime")) value = { showUsageMeter: false, verbose: false, effective: false };
      else if (path.endsWith("/agendas/mara/regenerate")) {
        paid++;
        agendaJob = failedAgenda;
        value = { villagers: [resident] };
      } else if (path.endsWith("/background/retry")) {
        retryBody = route.request().postDataJSON();
        agendaJob = { ...failedAgenda, status: "queued", error: "", failure: undefined };
        value.backgroundWork = [agendaJob];
      } else if (/generate|regenerate|remap/u.test(path)) paid++;
      await fulfill(route, { contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: /^(Open settings menu|More)$/, exact: true }).click();
    await page
      .getByRole("navigation", { name: "Village navigation" })
      .getByRole("button", { name: "People", exact: true })
      .click();
    await page.getByRole("button", { name: "Open Mara profile" }).click();
    const label = page.getByText(block.label, { exact: true });
    await expect(label).toHaveCount(0);
    await clickCharacterTool(page, "Inspect Agenda");
    await expect(label).toBeVisible();
    assert.ok(
      await page.getByText(longBlock.activity, { exact: true }).evaluate((node) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        return range.getClientRects().length > 1 && node.scrollWidth <= node.clientWidth;
      }),
      "The whole activity wraps within its column.",
    );
    await expect(page.getByRole("checkbox", { name: "Schedule influence", exact: true })).toHaveCount(0);
    const update = page.getByRole("button", { name: "Regenerate Agenda", exact: true });
    await expect(update).toBeVisible();
    const box = await update.boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= width);
    assert.equal(paid, 0);
    await page.screenshot({ path: resolve("artifacts/owned-agendas-" + width + ".png") });
    await update.click();
    const warning = page.getByRole("alert").filter({ hasText: "Couldn’t refresh the Agenda" });
    await expect(warning).toContainText("The model’s reply was cut short. Showing the saved plans.");
    await expect(page.getByText("Response reached the output limit", { exact: false })).toHaveCount(0);
    await expect(label).toBeVisible();
    const retry = page.getByRole("button", { name: "Retry Agenda", exact: true });
    await expect(retry).toBeVisible();
    const retryBox = await retry.boundingBox();
    assert.ok(retryBox && retryBox.height >= 44 && retryBox.x >= 0 && retryBox.x + retryBox.width <= width);
    await page.screenshot({ path: resolve("artifacts/agenda-refresh-error-" + width + ".png") });
    await retry.click();
    await expect(page.getByRole("status").filter({ hasText: "Preparing Agenda…" })).toBeVisible();
    await expect(warning).toHaveCount(0);
    await expect(update).toBeDisabled();
    assert.equal(paid, 1);
    assert.equal(retryBody.id, failedAgenda.id);
    assert.equal(retryBody.expectedInstanceId, failedAgenda.instanceId);
    assert.equal(retryBody.expectedAttempt, failedAgenda.attempt);
    await label.click();
    await expect(page.getByRole("status").filter({ hasText: block.activity })).toBeVisible();
    await clickCharacterTool(page, "Leave Inspect");
    await expect(label).toHaveCount(0);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("The profile Agenda uses one calendar for known and inspected views on desktop and phones.");
});
