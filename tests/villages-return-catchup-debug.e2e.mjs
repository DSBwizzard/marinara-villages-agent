import assert from "node:assert/strict";
import { resolve } from "node:path";
import { chromium, expect, fulfill, mockEngineLookups } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as fixture, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({ headless: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: async (value) => {
            window.copiedCatchup = value;
          },
        },
        configurable: true,
      });
    });
    await mockEngineLookups(page);
    const resident = fixture.villagers[0];
    const venue = fixture.settings.venues[0];
    let account = {
      id: "batch-1",
      status: "completed",
      from: "2026-10-24T12:00:00.000Z",
      until: "2026-10-24T14:00:00.000Z",
      reason: "Sleeping intervals were skipped.",
      opportunities: [
        {
          id: "one",
          kind: "routine",
          actorIds: [resident.characterId],
          startsAt: "2026-10-24T13:00:00.000Z",
          facts: ["A resident may reflect privately."],
        },
        {
          id: "two",
          kind: "encounter",
          actorIds: [resident.characterId],
          venueId: venue.id,
          startsAt: "2026-10-24T13:30:00.000Z",
          facts: ["Routines overlapped."],
        },
      ],
      records: [
        {
          opportunityId: "one",
          status: "settled",
          outcome: {
            wishReflection: {
              reason: "They missed talking together.",
              attention: { reason: "The wish came to mind." },
            },
          },
        },
        {
          opportunityId: "two",
          status: "settled",
          outcome: {
            social: {
              encounter: {
                lines: [{ speakerId: resident.characterId, text: "Good to see you." }],
                memoryChanges: [{ text: "A pleasant meeting." }],
                relationshipReview: {
                  changes: [{ fromId: resident.characterId, toId: resident.characterId, reason: "Trust grew." }],
                },
                wishChanges: [{ actorId: resident.characterId, reason: "They want to meet again." }],
              },
            },
          },
        },
      ],
      jobs: [{ opportunityId: "one", activity: { id: "job", requests: 2, attempt: 1 } }],
      privateDiagnostic: "RAW-ONLY-SECRET",
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
      if (path.endsWith("/background/catchup")) value = { batch: null };
      else if (path.endsWith("/debug/return-catchup")) value = account;
      else if (path.endsWith("/rooms/active")) value = { session: null, debugDiscardEnabled: false };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/rooms/archive")) value = { visits: [], total: 0 };
      await fulfill(route, { status: 200, json: value });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: /^(Open settings menu|More)$/, exact: true }).click();
    if (width <= 700) await page.getByRole("combobox", { name: "Section" }).selectOption("progress");
    else await page.getByRole("button", { name: "Debug", exact: true }).click();
    await page.getByRole("button", { name: "Inspect catch-up" }).click();
    const reflection = page.getByRole("button", { name: new RegExp(`${resident.name} reflected`) });
    const encounter = page.getByRole("button", { name: new RegExp(`${resident.name} met`) });
    await expect(reflection).toBeVisible();
    await expect(encounter).toBeVisible();
    await expect(page.getByText("They missed talking together.")).toBeHidden();
    await expect(page.getByText("Sleeping intervals were skipped.")).toBeHidden();
    await expect(page.getByText(/Model requests/)).toBeHidden();
    await reflection.click();
    await expect(page.getByText("They missed talking together.")).toBeVisible();
    await expect(page.getByText("The wish came to mind.")).toBeVisible();
    await expect(encounter).toBeHidden();
    await page.getByRole("button", { name: "← Activities" }).click();
    await encounter.click();
    await expect(page.getByText(/Good to see you/)).toBeVisible();
    await expect(page.getByText("A pleasant meeting.")).toBeVisible();
    await expect(page.getByText(/Trust grew/)).toBeVisible();
    await expect(page.getByText(/They want to meet again/)).toBeVisible();
    await expect(page.getByText("RAW-ONLY-SECRET")).toBeHidden();
    await page.getByRole("button", { name: "Copy JSON" }).click();
    await expect(page.getByText("Copied JSON.")).toBeVisible();
    assert.deepEqual(JSON.parse(await page.evaluate(() => window.copiedCatchup)), account);
    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true }));
    await page.getByRole("button", { name: "Copy JSON" }).click();
    await expect(page.getByText(/Copy unavailable/)).toBeVisible();
    await expect(page.getByText(/RAW-ONLY-SECRET/)).toBeVisible();
    account = { batch: null };
    await page.getByRole("button", { name: "Refresh", exact: true }).click();
    await expect(page.getByText("No catch-up has been recorded.")).toBeVisible();
    await page.close();
  }
} finally {
  await browser.close();
}
