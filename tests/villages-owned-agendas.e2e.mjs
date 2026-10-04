import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({ headless: true, ...(existsSync(chrome) ? { executablePath: chrome } : {}) });
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }),
      errors = [],
      patches = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let paid = 0;
    const categories = {
      rhythm: true,
      busyFree: true,
      weekdayWeekend: true,
      interests: true,
      establishedEntities: true,
    };
    const block = {
      startMinute: 0,
      endMinute: 1440,
      venueId: "",
      activity: "Reading by the window",
      reason: "An ordinary day",
      status: "idle",
      flexible: true,
    };
    const resident = {
      characterId: "mara",
      name: "Mara",
      missing: false,
      ingestSchedule: false,
      scheduleInfluence: { version: 1, enabled: false, categories },
      nativeSchedule: { weekStart: "", days: {} },
      weekUnreadable: false,
      days: [{ weekday: "Monday", dateLabel: "Today", isToday: true, blocks: [] }],
      effectiveDays: { Monday: [block] },
      agenda: {
        routineSummary: "Mara reads and tends herbs.",
        wishes: [],
        day: [],
        week: { Monday: [block] },
        scheduleInfluenceSnapshot: {
          adopted: ["Interest: Reading"],
          unresolved: ["Interest awaiting compatible village activity: Painting"],
        },
      },
    };
    await page.route("http://villages.test/", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<style>html,body{margin:0;background:#171b25;color:white;font:16px Arial}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = structuredClone(snapshot);
      if (path.endsWith("/influence")) {
        assert.equal(route.request().method(), "PATCH");
        const body = route.request().postDataJSON();
        patches.push(body);
        if (body.enabled !== undefined) resident.ingestSchedule = resident.scheduleInfluence.enabled = body.enabled;
        Object.assign(categories, body.categories ?? {});
        value = { villagers: [resident] };
      } else if (path.endsWith("/agendas")) value = { villagers: [resident] };
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
      else if (/generate|regenerate|remap/u.test(path)) paid++;
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: /^(Open settings menu|More)$/, exact: true }).click();
    await page.getByRole("button", { name: /^Villagers \(/ }).click();
    await page.getByRole("button", { name: "Open Mara profile" }).click();
    const sections = page.getByRole("navigation", { name: "Villager profile sections" });
    await sections.getByRole("button", { name: "Agenda", exact: true }).click();
    await sections.getByRole("button", { name: "Inspect", exact: true }).click();
    const master = page.getByRole("checkbox", { name: "Let Marinara schedule influence this Agenda" });
    const controls = [
      "Preferred sleep/wake rhythm",
      "Broad busy/free periods",
      "Weekday/weekend patterns",
      "Compatible hobbies and interests",
      "Established workplaces, vehicles and institutions",
    ];
    for (const name of controls) {
      await expect(page.getByRole("checkbox", { name, exact: true })).toBeDisabled();
      await expect(page.getByRole("checkbox", { name, exact: true })).toBeChecked();
    }
    await master.click();
    await expect(master).toBeChecked();
    for (const name of controls) await expect(page.getByRole("checkbox", { name, exact: true })).toBeEnabled();
    await page.getByRole("checkbox", { name: controls[0], exact: true }).click();
    await expect(page.getByRole("checkbox", { name: controls[0], exact: true })).not.toBeChecked();
    await expect(page.getByText("Interest: Reading", { exact: true })).toBeVisible();
    await expect(page.getByText(/waits for an existing generation request/)).toBeVisible();
    await expect(page.getByText("Reading by the window", { exact: true })).toBeVisible();
    await expect(page.getByText("Marinara schedule", { exact: true })).toHaveCount(0);
    assert.equal(paid, 0);
    assert.equal(patches.length, 2);
    assert.equal(patches[1].categories.rhythm, false);
    const box = await master.boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= width);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: resolve("artifacts/owned-agendas-" + width + ".png") });
    await page.close();
  }
  console.log(
    "Owned Agenda controls: opt-in, independent categories, preserved day and zero generation on desktop/phones.",
  );
} finally {
  await browser.close();
}
