import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
const page = await browser.newPage({ viewport: { width: 375, height: 740 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const now = new Date().toISOString();
const snapshot = {
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
  noticeboard: [],
  venueRequests: [],
  upgradeRequests: [],
  residences: [],
  happenings: [],
  villagers: [],
  recap: null,
  settings: {
    venues: [],
    visitRetention: { mode: "forever", value: 0 },
    townMapImageSetAt: "",
    townMapView: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
    storyPaces: [],
    macros: [],
  },
};

const session = {
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
              domain: "memories",
              reason:
                "Required response metadata is missing or incomplete. Replay cannot reconstruct it; explicitly retry interpretation.",
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
    failed = false;
    value = {};
  } else if (path.endsWith("/changes/replay")) {
    replays++;
    value = {};
  } else if (path.endsWith("/retry-memory") || path.endsWith("/leave-pending")) {
    closingReviews++;
    value = {};
  } else if (path.endsWith("/operation")) value = { operation: null };
  else if (path.endsWith("/catalog")) value = { characters: [] };
  else if (path.endsWith("/relationships")) value = { profiles: [], starting: { pending: false, summaries: [] } };
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
};
const html =
  "<style>:root{--background:#101726;--foreground:#f2f2f5;--popover:#202938;--border:#4d5870;--primary:#af91eb;--secondary:#303b50;--muted-foreground:#bac4d7}html,body{margin:0;width:100%;height:100%;font-family:Arial;color:var(--foreground)}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>";
async function mount(tab) {
  await tab.route("**/api/villages**", api);
  await tab.route("http://villages.test/", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: html }),
  );
  await tab.goto("http://villages.test/");
  await tab.addScriptTag({ path: resolve("packages/villages/client.js") });
}
try {
  await mount(page);
  const composer = page.getByRole("textbox", { name: "Message at The Park" });
  const tray = page.getByRole("button", { name: /village notice/ });
  const stack = page.locator("[aria-label='Village events']");
  await composer.waitFor();
  await composer.focus();
  await expect(page.getByRole("status", { name: "Saved change status" })).toContainText("still being checked");
  const shared = {
    id: "3260cf01-1771-43b8-b72c-c050c713029d:989be974-b9ad-4ed3-9256-8e732575d6fa:relationship:077092eca1d088f3dd4a0440",
    kind: "wish",
    text: "Wish shared · Bob",
    detail: "Plant a garden together.",
    wishUpdate: { wishId: "garden", state: "revealed" },
  };
  notices.push(shared);
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
  await expect(stack).toContainText("Wish progressed · Bob");
  notices.push({ id: "heart", kind: "relationship-up", text: "Bob's warmth toward you increased." });
  notices.push({ id: "memory", kind: "memory", text: "A memory was forged.", detail: "Saturday planting." });
  await expect(stack).toContainText("♥");
  await expect(stack).toContainText("★");
  notices.push(shared);
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
  await expect(stack).toContainText(fulfilled.text);
  const second = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await mount(second);
  await expect(second.locator("[aria-label='Village events']")).toContainText(fulfilled.text);
  await page.getByRole("button", { name: "Dismiss " + fulfilled.text }).click();
  await expect(second.locator("[aria-label='Village events']")).not.toContainText(fulfilled.text);
  await second.close();
  assert.equal(interpretations, 0, "Wish display, polling, refresh and dismissal add no interpretation requests");
  assert.equal(closingReviews, 0);
  mkdirSync("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/live-wish-chips-phone.png" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: "artifacts/live-wish-chips-desktop.png" });
  failed = true;
  const status = page.getByRole("status", { name: "Saved change status" });
  await expect(status).toContainText("need attention");
  await status.locator("summary").click();
  await expect(status).toContainText("memories: Required response metadata is missing or incomplete");
  await expect(status).toContainText("Replay cannot reconstruct it");
  await status.getByRole("button", { name: "Replay saved work · no model request" }).click();
  await expect.poll(() => replays).toBe(1);
  assert.equal(interpretations, 0);
  await status.getByRole("button", { name: "Retry memories interpretation · may use model requests" }).click();
  await expect.poll(() => interpretations).toBe(1);
  assert.deepEqual(errors, []);
  console.log(
    "villages-room-notices: live Wish chips, stars/hearts, focus, details, duplicate receipts, refresh, two-tab dismissal, and explicit recovery passed",
  );
} finally {
  await browser.close();
}
