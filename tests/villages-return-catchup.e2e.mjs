import assert from "node:assert/strict";
import { resolve } from "node:path";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as fixture, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await mockEngineLookups(page);
    let reads = 0;
    let continued = 0;
    let agenda = null;
    let batch = {
      id: "batch",
      status: "failed",
      completed: 0,
      total: 1,
      settlementRequired: false,
      issue: "generation",
    };
    await page.route("http://villages.test/", (route) =>
      fulfill(route, {
        status: 200,
        contentType: "text/html",
        body: "<style>html,body{margin:0;font-family:Arial}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = structuredClone(fixture);
      if (path.endsWith("/background/catchup/continue")) {
        continued++;
        batch = null;
        value = { batch: null };
      } else if (path.endsWith("/background/catchup")) {
        if (++reads === 1) {
          await fulfill(route, { status: 500, json: { error: "Catch-up status is unavailable." } });
          return;
        }
        value = { batch, agenda };
      } else if (path.endsWith("/rooms/active")) value = { session: null, debugDiscardEnabled: false };
      else if (path.endsWith("/repair"))
        value = {
          seed: fixture.worldScope,
          identity: fixture.worldScope,
          records: [],
          history: [],
          historyOffset: 0,
          historyTotal: 0,
          checkpoints: [],
          checkpointOffset: 0,
          checkpointTotal: 0,
          people: [],
          sceneOpen: false,
        };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/rooms/archive")) value = { visits: [], total: 0 };
      await fulfill(route, { status: 200, json: value });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await expect(page.getByRole("alert").filter({ hasText: "Catch-up status is unavailable" })).toBeVisible();
    const dialog = page.getByRole("dialog", { name: "Welcome back" });
    await expect(dialog).toBeVisible({ timeout: 8000 });
    await expect(dialog).toContainText("An activity request could not finish");
    await expect(dialog).toContainText("additional model request");
    await expect(dialog.getByRole("button", { name: "Retry" })).toBeVisible();
    assert.ok((await dialog.boundingBox()).width <= 400, "Catch-up is a compact card on desktop and phone.");
    batch.issue = "preparation";
    await expect(dialog).toContainText("Catch-up could not get started", { timeout: 8000 });
    await expect(dialog).not.toContainText("additional model request");
    await page.screenshot({ path: resolve(`.build-tmp/catchup-${width}.png`) });
    await dialog.getByRole("button", { name: "Continue to Village" }).click();
    await expect(dialog).toBeHidden();
    assert.equal(continued, 1);
    agenda = { expired: false, completed: 1, total: 2 };
    const chip = page.getByRole("button", { name: "Preparing Agendas", exact: true });
    await expect(chip).toBeVisible({ timeout: 8000 });
    const mapChip = await chip.boundingBox();
    const people = page.getByRole("button", { name: "People", exact: true });
    if (!(await people.isVisible())) await page.getByRole("button", { name: "More", exact: true }).click();
    await people.click();
    await expect(page.locator("[data-desk=people]")).toHaveAttribute("data-phase", "open");
    const returnButton = page.getByRole("button", { name: /Return to village|← Village/, exact: true });
    await expect(returnButton).toBeVisible();
    const menuChip = await chip.boundingBox();
    assert.ok(mapChip.x < 20, "the chip stays on the left on the Map");
    assert.ok(menuChip.x < 20 && menuChip.y < 20, "the menu chip sits in the top-left corner");
    await chip.click();
    await expect(page.getByText("1 of 2 ready", { exact: true })).toBeVisible();
    await returnButton.click({ trial: true });
    await page.screenshot({ path: resolve(`.build-tmp/agenda-chip-menu-${width}.png`) });
    const menuNavigation = page.getByRole("navigation", { name: "Village navigation", exact: true });
    await menuNavigation.getByRole("button", { name: "Projects", exact: true }).click({ trial: true });
    await page.keyboard.press("Escape");
    await expect(chip).toHaveAttribute("aria-expanded", "false");
    await expect(chip).toBeFocused();
    agenda = {
      ...agenda,
      failure: {
        name: "Mara",
        message: "The model reply was cut short. Retry to finish preparing Mara’s Agenda.",
        id: "failed-agenda",
        expectedAttempt: 1,
        expectedInstanceId: "attempt-one",
      },
    };
    await page.getByRole("button", { name: "Agenda preparation needs attention" }).click({ timeout: 8000 });
    await expect(page.getByRole("button", { name: "Retry Mara" })).toBeVisible();
    await returnButton.click({ trial: true });
    await menuNavigation.getByRole("button", { name: "Projects", exact: true }).click({ trial: true });
    await menuNavigation.getByRole("button", { name: "Settings", exact: true }).click();
    delete agenda.failure;
    const sections = page.getByRole("combobox", { name: "Section", exact: true });
    if (width <= 700) await sections.selectOption("repair");
    else await page.getByRole("button", { name: "REPAIR", exact: true }).click();
    const repair = page.locator(".villages-repair");
    await expect(repair).toBeVisible();
    await expect(chip).toHaveCount(0);
    await repair.getByRole("button", { name: "Main menu", exact: true }).click();
    await expect(repair).toBeHidden();
    await expect(chip).toBeVisible({ timeout: 8000 });
    agenda.expired = true;
    await expect(chip).toBeVisible();
    await expect(dialog).toBeHidden();
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await expect(dialog).toContainText("Preparing today’s Agendas", { timeout: 8000 });
    await expect(dialog.getByRole("button", { name: "Back", exact: true })).toBeVisible();
    agenda = null;
    await expect(dialog).toBeHidden({ timeout: 8000 });
    await page.close();
  }
});
