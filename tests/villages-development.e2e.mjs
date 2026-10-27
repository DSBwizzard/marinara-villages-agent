import { mockEngineLookups, fulfill, chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import { snapshot as fixture, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";
const browser = await chromium.launch({ headless: true });
const P = "marinara-capability-villages";
try {
  for (const width of [1440, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockEngineLookups(page);
    let enabled = true,
      reviewCount = 0,
      privateReads = 0,
      completed = false;
    let deferPrivateRead = false,
      releasePrivateRead;
    const village = structuredClone(fixture);
    village.villagers[0].name = "Ada";
    village.villagers[1].name = "Bram";
    const known = [
      {
        id: "move",
        title: "Move to Bram's home",
        status: "stalled",
        at: "2026-10-23T12:00:00Z",
        text: "Ada put the move on hold.",
        facts: [
          {
            at: "2026-10-23T12:00:00Z",
            text: "Bram declined; I will put this move on hold.",
            sceneId: "heard",
            lineIds: ["line"],
          },
        ],
        agreements: [{ characterId: "eli", name: "Bram", decision: "refuse", at: "2026-10-23T12:00:00Z" }],
      },
    ];
    const relationships = {
      profiles: [
        { characterId: "mara", name: "Ada", knownDevelopment: known },
        { characterId: "eli", name: "Bram", knownDevelopment: [] },
      ],
      starting: { pending: false, spoilers: false, summaries: [] },
    };
    const view = () => ({
      enabled,
      activatedAt: "2026-10-20T12:00:00Z",
      work: reviewCount
        ? {
            status: completed ? "completed" : "failed",
            error: completed ? "" : "Saved review needs deliberate recovery.",
            requests: 1,
          }
        : null,
      residents: [
        {
          characterId: "mara",
          name: "Ada",
          revision: 5,
          nextReviewAt: "2026-10-26T12:00:00Z",
          reason: "PRIVATE ADA REVIEW",
          pursuits: [
            {
              id: "move",
              title: "Move to Bram's home",
              status: "stalled",
              reason: "PRIVATE ADA REASON",
              sourceVenueId: "home-a",
              targetVenueId: "home-b",
              agreements: [],
            },
          ],
        },
        { characterId: "eli", name: "Bram", revision: 2, reason: "PRIVATE BRAM REVIEW", pursuits: [] },
      ],
      log: [
        {
          id: "review",
          actorId: "mara",
          outcome: "Wait",
          reason: "PRIVATE ADA HISTORY",
          at: "2026-10-23T12:00:00Z",
          effectiveAt: "2026-10-22T12:00:00Z",
        },
        {
          id: "other-review",
          actorId: "eli",
          outcome: "Reviewed",
          reason: "PRIVATE BRAM HISTORY",
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
      let value = village;
      if (path.endsWith("/rooms/active")) value = { session: null, debugDiscardEnabled: false };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/rooms/archive")) value = { visits: [], total: 0 };
      else if (path.endsWith("/relationships")) value = relationships;
      else if (path.endsWith("/development/review")) {
        assert.match(route.request().postDataJSON().actionId, /^[a-zA-Z0-9-]+$/);
        reviewCount++;
        value = view();
      } else if (path.endsWith("/development")) {
        if (route.request().method() === "PATCH") enabled = route.request().postDataJSON().enabled;
        else privateReads++;
        value = view();
        if (route.request().method() === "GET" && deferPrivateRead) {
          deferPrivateRead = false;
          await new Promise((resolve) => {
            releasePrivateRead = resolve;
          });
        }
      }
      await fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await page.getByRole("button", { name: "People", exact: true }).click();
    await page.getByRole("button", { name: "Open Ada profile", exact: true }).click();
    const actions = page.getByRole("group", { name: "Profile actions", exact: true });
    const pursuits = actions.getByRole("button", { name: "Pursuits", exact: true });
    await pursuits.click();
    await expect(page.getByRole("heading", { name: "Move to Bram's home", exact: true })).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Known pursuits", exact: true }).getByText("On hold", { exact: true }),
    ).toBeVisible();
    assert.equal(privateReads, 0, "Normal Pursuits never reads private development state.");
    assert.equal(reviewCount, 0);
    assert.deepEqual(
      await page
        .getByRole("navigation", { name: "Villager profile sections", exact: true })
        .locator("div > button")
        .allTextContents(),
      ["Overview", "Relationships", "Wishes", "Memories", "Agenda", "Venues"],
      "Pursuits is not a seventh paper tab.",
    );
    const buttonBox = await pursuits.boundingBox(),
      bookBox = await page.locator(`.${P}-dossier-book`).boundingBox();
    assert.ok(buttonBox.y + buttonBox.height <= bookBox.y, "Pursuits stays above the book.");
    const manageBox = await actions.getByText("Character tools", { exact: true }).boundingBox(),
      closeBox = await actions.getByRole("button", { name: "Close ×", exact: true }).boundingBox();
    assert.ok(
      buttonBox.x + buttonBox.width <= manageBox.x && manageBox.x + manageBox.width <= closeBox.x,
      "Toolbar buttons are adjacent and never overlap.",
    );
    assert.equal(await page.getByText(/PRIVATE ADA|PRIVATE BRAM/).count(), 0);
    await mkdir(".build-tmp/development-layout", { recursive: true });
    await page.screenshot({ path: `.build-tmp/development-layout/pursuits-${width}.png`, fullPage: true });
    await page.getByRole("button", { name: "Inspect", exact: true }).click();
    const inspection = page.getByRole("region", { name: "Inspect pursuits · private", exact: true });
    await expect(inspection.getByText("PRIVATE ADA REASON", { exact: true })).toBeVisible();
    assert.equal(await page.getByText(/PRIVATE BRAM/).count(), 0, "Inspect is scoped to the selected villager.");
    await inspection.getByText("Decision history", { exact: true }).click();
    await expect(inspection.getByText("PRIVATE ADA HISTORY", { exact: true })).toBeVisible();
    await inspection.getByText("Village controls", { exact: true }).click();
    const toggle = inspection.getByRole("checkbox", { name: "Enable Pursuits", exact: true });
    deferPrivateRead = true;
    const readsBefore = privateReads;
    await inspection.getByRole("button", { name: "Refresh", exact: true }).click();
    await expect.poll(() => privateReads).toBe(readsBefore + 1);
    await expect(toggle).toBeDisabled();
    await expect(inspection.getByRole("button", { name: "Review village pursuits", exact: true })).toBeDisabled();
    releasePrivateRead();
    await expect(toggle).toBeEnabled();
    await toggle.click();
    await expect(toggle).not.toBeChecked();
    await toggle.click();
    await expect(toggle).toBeChecked();
    await inspection.getByRole("button", { name: "Review village pursuits", exact: true }).click();
    await expect(inspection.getByText("Saved review needs deliberate recovery.", { exact: true })).toBeVisible();
    completed = true;
    await inspection.getByRole("button", { name: "Refresh", exact: true }).click();
    await expect(inspection.getByText("completed · 1 requests", { exact: true })).toBeVisible();
    assert.equal(reviewCount, 1, "Inspect and Refresh never buy additional reviews.");
    await page.screenshot({ path: `.build-tmp/development-layout/inspect-${width}.png`, fullPage: true });
    await page.getByRole("button", { name: "Leave Inspect", exact: true }).click();
    await expect(inspection).toHaveCount(0);
    assert.equal(await page.getByText(/PRIVATE ADA|PRIVATE BRAM/).count(), 0);
    await page.getByRole("button", { name: "← Back to Villagers", exact: true }).click();
    await page.getByRole("button", { name: "Open Bram profile", exact: true }).click();
    await page.getByRole("button", { name: "Pursuits", exact: true }).click();
    await expect(page.getByText("No pursuits shared with you.", { exact: true })).toBeVisible();
    assert.equal(
      await page.getByRole("heading", { name: "Move to Bram's home", exact: true }).count(),
      0,
      "Another profile never retains Ada's Pursuit.",
    );
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(
  "Pursuits journal: known/private boundaries, toolbar, explicit review identity and desktop/phone layout passed.",
);
