import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import { openSceneErrors, closeSceneErrors } from "./fixtures/villages-scene-errors.fixture.mjs";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as fixture, now, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
await mkdir(".build-tmp/doorway-continuity", { recursive: true });
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await mockEngineLookups(page);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const snapshot = structuredClone(fixture);
    let issues = [
      {
        submissionId: "join",
        domain: "memories",
        status: "rejected",
        at: now,
        reason:
          "The proposed memory cited words that were not witnessed by everyone. It wasn’t saved; the conversation remains in the transcript.",
      },
    ];
    let summary = { pending: 0, failed: 0, rejected: 1 };
    let mutatingRequests = 0;
    const line = (id, kind, speakerId, content, extra = {}) => ({
      id,
      kind,
      speakerId,
      content,
      role: "assistant",
      name: speakerId === "mara" ? "Mara" : "Narration",
      at: now,
      heardBy: speakerId === "mara" ? ["mara"] : [],
      ...extra,
    });
    const session = {
      version: 2,
      id: "doorway-browser",
      placeId: "mill",
      placeName: "The Mill",
      zoneId: "exterior",
      area: "outside",
      status: "active",
      memoryMode: "live",
      startedAt: now,
      lastActivityAt: now,
      sceneRevision: 2,
      stagingVersion: 1,
      activeIds: [],
      participants: [{ characterId: "mara", name: "Mara", doing: "Talking" }],
      lines: [
        line("remote", "dialogue", "mara", "One moment, I am inside.", { viaDoorway: true }),
        line("arrival", "narration", "__venue_scene__", "Mara steps into the Exterior to talk with you.", {
          physicalIdsAfter: ["mara"],
        }),
        line("local", "dialogue", "mara", "Good to meet you out here."),
        line("departure", "narration", "__venue_scene__", "Mara steps back inside.", { physicalIdsAfter: [] }),
        line("after", "narration", "__venue_scene__", "You wait in the Exterior."),
      ],
      submissions: [
        { id: "join", activeIdsAtTurn: [], activeIdsAfterTurn: ["mara"], replyLineIds: ["remote", "arrival", "local"] },
        { id: "return", activeIdsAtTurn: ["mara"], activeIdsAfterTurn: [], replyLineIds: ["departure", "after"] },
      ],
    };
    await page.route("http://villages.test/", (route) =>
      fulfill(route, {
        status: 200,
        contentType: "text/html",
        body: "<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7;--secondary:#384253}html,body{margin:0;height:100%;background:var(--background);color:var(--foreground);font-family:Arial}marinara-capability-villages{display:block;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (route.request().method() !== "GET" && /\/(?:turn|generate|interpret|replay)(?:\/|$)/u.test(path))
        mutatingRequests++;
      const value =
        path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")
          ? { session }
          : path.endsWith("/changes")
            ? {
                changes: [],
                notices: [],
                dismissedNoticeIds: [],
                processingSummary: summary,
                unresolved: issues,
                nextCursor: "0:0",
                hasMore: false,
              }
            : path.endsWith("/town-map")
              ? { image: mapImage }
              : snapshot;
      await fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const chip = page.getByRole("button", { name: "1 Scene error", exact: true });
    await expect(chip).toBeVisible();
    await expect(page.getByText("not witnessed by everyone", { exact: false })).toHaveCount(0);
    let status = await openSceneErrors(page);
    await expect(status).toContainText("World change not saved · memories");
    await expect(status).toContainText("Not saved");
    await expect(status).toContainText("residents saw or heard");
    await expect(status).toContainText("conversation is still in the transcript");
    await expect(status.getByRole("button", { name: /Retry|Replay/ })).toHaveCount(0);
    await page.screenshot({ path: `.build-tmp/doorway-continuity/errors-${width}.png` });
    await closeSceneErrors(page);
    const next = page.getByRole("button", { name: "Next paragraph", exact: true });
    const previous = page.getByRole("button", { name: "Previous paragraph", exact: true });
    while (await previous.isEnabled()) await previous.click();
    await expect(page.getByRole("region", { name: "Current paragraph" })).toContainText("I am inside");
    await expect(page.locator('[class$="-chat-cast-person"]')).toHaveCount(0);
    await next.click();
    await expect(page.getByRole("region", { name: "Current paragraph" })).toContainText("steps into the Exterior");
    await expect(page.locator('[class$="-chat-cast-person"]')).toHaveCount(1);
    await next.click();
    const current = page.getByRole("region", { name: "Current paragraph" });
    await expect(current).toContainText("Good to meet you out here");
    await expect(current).not.toContainText("Through the doorway");
    await expect(page.locator('[class$="-chat-cast-person"]')).toHaveCount(1);
    await page.screenshot({ path: `.build-tmp/doorway-continuity/arrival-${width}.png` });
    await next.click();
    await expect(page.locator('[class$="-chat-cast-person"]')).toHaveCount(0);
    issues = [
      {
        submissionId: "later",
        domain: "relationships",
        status: "failed",
        at: now,
        reason: "Saved changes could not be applied. Replay saved work first.",
      },
      ...issues,
      {
        submissionId: "later",
        domain: "wishes",
        status: "pending",
        at: now,
        reason: "This proposed update is still being checked.",
      },
    ];
    summary = { pending: 1, failed: 1, rejected: 1 };
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(page.getByRole("button", { name: "2 Scene errors", exact: true })).toBeVisible();
    status = await openSceneErrors(page);
    await expect(status).toContainText("World change failed · relationships");
    await expect(status).not.toContainText("World change failed · wishes");
    await expect(status.getByRole("button", { name: /Retry relationships/ })).toBeVisible();
    await expect(status.getByRole("button", { name: /Retry memories/ })).toHaveCount(0);
    await expect(status.getByRole("button", { name: /Retry wishes/ })).toHaveCount(0);
    issues = [];
    summary = { pending: 0, failed: 0, rejected: 1 };
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await closeSceneErrors(page);
    status = await openSceneErrors(page);
    await expect(status).toContainText("World change diagnostics for details");
    assert.equal(mutatingRequests, 0, "reading feedback never retries interpretation or replays saved work");
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("Doorway arrival/departure playback and nonempty save feedback passed on desktop and phones.");
} finally {
  await browser.close();
}
