import { scenePlaybackFixtures } from "./fixtures/scene-browser.fixture.mjs";
const { authorSceneResponse } = await scenePlaybackFixtures();
import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";

const browser = await chromium.launch({
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 375, height: 740 } });
await mockEngineLookups(page);
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const now = new Date().toISOString();
const snapshot = {
  worldScope: "a".repeat(64),
  status: "ready",
  isFounded: true,
  village: {
    name: "QA Village",
    setting: "",
    dateLabel: "Today",
    weekday: "Friday",
    season: "fall",
    dayPhase: "morning",
    instant: now,
    localTime: "7:00 AM",
    minuteOfDay: 420,
    timeZone: "UTC",
    hour: 7,
    minute: 0,
    weather: "clear",
    dayIndex: 1,
    nextTransitionAt: "",
  },
  projects: [],
  venueRequests: [],
  residences: [],
  villagers: [],
  settings: {
    venues: [],
    visitRetention: { mode: "forever", value: 0 },
    maps: [],
    townMapView: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
    backgroundPaces: [],
    macros: [],
  },
};

const session = {
  version: 2,
  id: "live",
  memoryMode: "live",
  sceneRevision: 1,
  placeId: "park",
  placeName: "The Park",
  startedAt: now,
  lastActivityAt: now,
  status: "active",
  endedAt: "",
  endReason: "",
  activeIds: ["bob"],
  participants: [{ characterId: "bob", name: "Bob", doing: "sitting" }],
  lines: [
    {
      id: "greeting",
      role: "assistant",
      speakerId: "bob",
      name: "Bob",
      kind: "dialogue",
      content: "Hello there.",
      heardBy: ["bob"],
      at: now,
    },
  ],
};
const notices = [],
  dismissed = new Set();
let pending = true,
  failed = false,
  polls = 0,
  interpretations = 0,
  replays = 0,
  closingReviews = 0;
let failedDomain = "memories";
const interpretedDomains = [];
const api = async (route) => {
  const path = new URL(route.request().url()).pathname;
  let value = snapshot;
  if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity"))
    value = { session, debugDiscardEnabled: true };
  else if (path.endsWith("/changes"))
    value = {
      changes: [],
      notices: notices.filter((n) => !dismissed.has(n.id)),
      dismissedNoticeIds: [...dismissed],
      processingSummary: { pending: pending ? 1 : 0, failed: failed ? 1 : 0, rejected: 0 },
      unresolved: failed
        ? [
            {
              submissionId: "turn",
              domain: failedDomain,
              status: "failed",
              reason: "A citation is unavailable or was not witnessed by every affected resident.",
            },
          ]
        : [],
      nextCursor: String(++polls) + ":0:0",
      hasMore: false,
    };
  else if (path.endsWith("/dismiss")) {
    assert.equal(path, "/api/villages/rooms/live/notices/dismiss");
    assert.equal(route.request().method(), "POST");
    dismissed.add(route.request().postDataJSON().noticeId);
    value = { dismissed: true };
  } else if (path.endsWith("/interpret")) {
    interpretations++;
    interpretedDomains.push(route.request().postDataJSON().domain);
    failed = false;
    value = {};
  } else if (path.endsWith("/changes/replay")) {
    replays++;
    value = {};
  } else if (path.endsWith("/retry-memory") || path.endsWith("/leave-pending")) {
    closingReviews++;
    return fulfill(route, { status: 404, contentType: "application/json", body: '{"error":"Retired Scene route"}' });
  } else if (path.endsWith("/operation")) value = { operation: null };
  else if (path.endsWith("/catalog")) value = { characters: [] };
  else if (path.endsWith("/relationships")) value = { profiles: [], starting: { pending: false, summaries: [] } };
  await fulfill(route, {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(authorSceneResponse(value, snapshot.worldScope)),
  });
};
const html =
  "<style>:root{--background:#101726;--foreground:#f2f2f5;--popover:#202938;--border:#4d5870;--primary:#af91eb;--secondary:#303b50;--muted-foreground:#bac4d7}html,body{margin:0;width:100%;height:100%;font-family:Arial;color:var(--foreground)}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>";
async function refresh(tab = page) {
  await tab.evaluate(() => window.dispatchEvent(new Event("focus")));
}
async function mount(tab) {
  await tab.route("**/api/villages**", api);
  await tab.route("http://villages.test/", (route) =>
    fulfill(route, { status: 200, contentType: "text/html", body: html }),
  );
  await tab.goto("http://villages.test/");
  await tab.addScriptTag({ path: resolve("packages/villages/client.js") });
}
await withBrowser(browser, async () => {
  await mount(page);
  const composer = page.getByRole("textbox", { name: "Message at The Park" });
  const tray = page.getByRole("button", { name: /World changes?/ });
  const stack = page.locator("[aria-label='World changes']");
  await composer.waitFor();
  await composer.focus();
  await expect(page.getByRole("button", { name: /^\d+ Scene errors?$/ })).toHaveCount(0);
  const shared = {
    id: "3260cf01-1771-43b8-b72c-c050c713029d:989be974-b9ad-4ed3-9256-8e732575d6fa:relationship:077092eca1d088f3dd4a0440",
    kind: "wish",
    text: "Wish shared · Bob",
    detail: "Plant a garden together.",
    wishUpdate: { wishId: "garden", state: "revealed" },
  };
  notices.push(shared);
  await refresh();
  await expect(tray).toHaveAttribute("aria-expanded", "true");
  await expect(stack).toContainText(shared.text);
  await expect(composer).toBeFocused();
  assert.equal(session.status, "active");
  const trigger = page.getByRole("button", { name: "View Wish update: " + shared.text });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const detail = page.getByRole("dialog", { name: shared.text });
  await expect(detail).toContainText(shared.detail);
  await expect(page.getByRole("button", { name: "Close Wish update" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(detail).toHaveCount(0);
  await expect(trigger).toBeFocused();
  notices.push({
    id: "wish-progress",
    kind: "wish",
    text: "Wish progressed · Bob",
    detail: "Plant a garden together. A planting day remains undecided.",
    wishUpdate: { wishId: "garden", state: "progress" },
  });
  pending = false;
  await refresh();
  await expect(stack).toContainText("Wish progressed · Bob");
  notices.push({ id: "heart", kind: "relationship-up", text: "Bob's warmth toward you increased." });
  notices.push({ id: "memory", kind: "memory", text: "A memory was forged.", detail: "Saturday planting." });
  await refresh();
  await expect(stack).toContainText("♥");
  await expect(stack).toContainText("★");
  notices.push(shared);
  await refresh();
  await expect(page.locator(".marinara-capability-villages-room-star")).toHaveCount(4);
  await page.getByRole("button", { name: "Dismiss " + shared.text }).click();
  await expect.poll(() => dismissed.has(shared.id)).toBe(true);
  await page.reload();
  await page.addScriptTag({ path: resolve("packages/villages/client.js") });
  await expect(stack).not.toContainText(shared.text);
  await expect(stack).toContainText("Wish progressed");
  const fulfilled = {
    id: "wish-complete",
    kind: "wish",
    text: "Wish fulfilled · Bob",
    detail: "Plant a garden together.",
    wishUpdate: { wishId: "garden", state: "fulfilled" },
  };
  notices.push(fulfilled);
  await refresh();
  await expect(stack).toContainText(fulfilled.text);
  const second = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await mockEngineLookups(second);
  await mount(second);
  await expect(second.locator("[aria-label='World changes']")).toContainText(fulfilled.text);
  await page.getByRole("button", { name: "Dismiss " + fulfilled.text }).click();
  await expect.poll(() => dismissed.has(fulfilled.id)).toBe(true);
  await refresh(second);
  await expect(second.locator("[aria-label='World changes']")).not.toContainText(fulfilled.text);
  await second.close();
  assert.equal(interpretations, 0, "Wish display, polling, refresh and dismissal add no interpretation requests");
  assert.equal(closingReviews, 0);
  mkdirSync("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/live-wish-chips-phone.png" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: "artifacts/live-wish-chips-desktop.png" });
  failed = true;
  await refresh();
  const chip = page.getByRole("button", { name: /^\d+ Scene errors?$/ });
  await chip.click();
  const status = page.getByRole("region", { name: "Scene errors" });
  await status.locator("summary").filter({ hasText: "World change failed · memories" }).click();
  await expect(status).toContainText(
    "The game could not confirm this world change from what the residents saw or heard.",
  );
  await expect(status.getByRole("button", { name: "Retry memories" })).toBeVisible();
  await page.setViewportSize({ width: 375, height: 740 });
  await page.screenshot({ path: "artifacts/memory-cause-phone.png" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: "artifacts/memory-cause-desktop.png" });
  await status.getByRole("button", { name: "Replay" }).click();
  await expect.poll(() => replays).toBe(1);
  assert.equal(interpretations, 0);
  await status.getByRole("button", { name: "Retry memories" }).click();
  await expect.poll(() => interpretations).toBe(1);
  failedDomain = "projects";
  failed = true;
  await refresh();
  await expect(chip).toBeVisible();
  if ((await chip.getAttribute("aria-expanded")) !== "true") await chip.click();
  await status.locator("summary").filter({ hasText: "World change failed · projects" }).click();
  await page.setViewportSize({ width: 375, height: 740 });
  await page.screenshot({ path: "artifacts/project-recovery-phone.png" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: "artifacts/project-recovery-desktop.png" });
  await status.getByRole("button", { name: "Retry projects" }).click();
  await expect.poll(() => interpretations).toBe(2);
  assert.deepEqual(interpretedDomains, ["memories", "projects"]);
  assert.deepEqual(errors, []);
  console.log(
    "villages-room-notices: live Wish chips, stars/hearts, focus, details, duplicate receipts, refresh, two-tab dismissal, and explicit recovery passed",
  );
});
