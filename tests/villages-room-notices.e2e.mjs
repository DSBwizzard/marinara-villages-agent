import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

// Load the built custom element at phone size with a small server fixture.
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
const page = await browser.newPage({ viewport: { width: 375, height: 740 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const now = new Date().toISOString();
const newSession = (id) => ({
  version: 1,
  id,
  placeId: "park",
  placeName: "The Park",
  startedAt: now,
  lastActivityAt: now,
  endedAt: "",
  endReason: "",
  status: "active",
  activeIds: ["bob"],
  participants: [{ characterId: "bob", name: "Bob", doing: "sitting" }],
  lines: [
    {
      id: `${id}-hello`,
      role: "assistant",
      speakerId: "bob",
      name: "Bob",
      content: "Hello there.",
      kind: "dialogue",
      heardBy: ["bob"],
      at: now,
    },
  ],
});
const memoryEvent = (id, text, detail) => ({ id, kind: "memory", text, detail });
const naturalMemory = memoryEvent(
  "memory-natural",
  "Bob remembered the closing exchange.",
  "The player promised Bob to repair the bridge.",
);
const leaveMemory = memoryEvent(
  "memory-leave",
  "Bob remembered the farewell.",
  "The player said they would return after sunrise.",
);
const endMemory = memoryEvent(
  "memory-end",
  "Bob remembered the completed visit.",
  "The player entrusted Bob with the brass key.",
);
let session = newSession("visit-natural");
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
let turn = 0;
let serverExpired = false;
await page.route("**/api/villages**", async (route) => {
  const path = new URL(route.request().url()).pathname;
  let value = snapshot;
  if (path.endsWith("/rooms/active")) value = { session: serverExpired ? null : session, debugDiscardEnabled: true };
  else if (path.endsWith(`/rooms/archive/${session.id}`))
    value = { visit: { ...session, status: "closed", endReason: "inactivity" } };
  else if (path.endsWith("/rooms/activity")) value = { session };
  else if (path.endsWith("/rooms/turn")) {
    const body = route.request().postDataJSON();
    turn += 1;
    session = {
      ...session,
      lines: [
        ...session.lines,
        { id: `user-${turn}`, role: "user", speakerId: "", name: "", content: body.message, heardBy: ["bob"], at: now },
        {
          id: `reply-${turn}`,
          role: "assistant",
          speakerId: "bob",
          name: "Bob",
          content: "I hear you.",
          kind: "dialogue",
          heardBy: ["bob"],
          at: now,
        },
      ],
    };
    if (body.message === "Natural ending")
      session = { ...session, status: "closed", activeIds: [], endedAt: now, endReason: "scene" };
    value = {
      session,
      verdict: null,
      action: null,
      recordEvents: body.message === "Natural ending" ? [naturalMemory, naturalMemory] : [],
    };
  } else if (path.endsWith("/rooms/leave")) {
    session = {
      ...session,
      status: "closed",
      activeIds: [],
      endedAt: now,
      endReason: "player",
      lines: [
        ...session.lines,
        {
          id: `${session.id}-farewell`,
          role: "assistant",
          speakerId: "bob",
          name: "Bob",
          content: "Come back safely.",
          kind: "dialogue",
          heardBy: ["bob"],
          at: now,
        },
      ],
    };
    value = { session, verdict: null, action: null, recordEvents: [leaveMemory] };
  } else if (path.endsWith("/rooms/end")) {
    session = {
      ...session,
      status: "closed",
      activeIds: [],
      endedAt: now,
      endReason: "player",
      ...(session.id === "visit-pending" ? { memoryPending: true } : {}),
    };
    value = { session, recordEvents: session.id === "visit-end" ? [endMemory] : [] };
  } else if (path.endsWith("/catalog")) value = { characters: [] };
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
});
await page.route("http://villages.test/", (route) =>
  route.fulfill({
    status: 200,
    contentType: "text/html",
    body: "<style>html,body{margin:0;width:100%;height:100%}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
  }),
);

try {
  const mountVisit = async (id) => {
    session = newSession(id);
    serverExpired = false;
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
  };
  const composer = page.getByRole("textbox", { name: "Message at The Park" });
  const stack = page.locator("[aria-label='Village events']");
  const tray = page.getByRole("button", { name: /village notice/u });
  const returnToMap = async () => {
    await page.getByRole("button", { name: "Venue actions" }).click();
    await page.getByRole("menuitem", { name: "Return to map" }).click();
  };
  const expectMemory = async (memory) => {
    await expect(stack).toContainText(memory.text);
    await expect(tray).toHaveAttribute("aria-expanded", "true");
    const memoryTrigger = page.getByRole("button", { name: `View memory: ${memory.text}` });
    await memoryTrigger.click();
    const memoryDialog = page.getByRole("dialog", { name: memory.text });
    await expect(memoryDialog).toContainText(memory.detail);
    await expect(page.getByRole("button", { name: "Close memory" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(memoryDialog).toHaveCount(0);
    await expect(memoryTrigger).toBeFocused();
  };
  await mountVisit("visit-natural");
  await composer.waitFor();
  const send = async (message) => {
    await composer.fill(message);
    await Promise.all([
      page.waitForResponse((response) => response.url().endsWith("/rooms/turn")),
      page.getByRole("button", { name: "Send" }).click(),
    ]);
  };
  await send("Ordinary chat");
  await expect(tray).toHaveCount(0, "ordinary chat-time recollections stay silent");
  await send("Natural ending");
  await expectMemory(naturalMemory);
  await expect(page.locator(".marinara-capability-villages-room-star")).toHaveCount(
    1,
    "duplicate deterministic receipt IDs render once",
  );
  const stackBox = await stack.boundingBox();
  const controlsBox = await page.locator(".marinara-capability-villages-chat-head").boundingBox();
  assert.ok(stackBox && controlsBox);
  assert.ok(stackBox.x >= 0 && stackBox.x + stackBox.width <= 375, "notice fits a phone viewport");
  assert.ok(stackBox.y >= controlsBox.y + controlsBox.height, "notice sits below venue controls");
  assert.ok(stackBox.width <= 375 - 24, "mobile memory notice keeps the scene's side margins");
  assert.ok(stackBox.height <= 148, "mobile memory stack stays under twenty percent of the viewport");
  await tray.click();
  await expect(stack).toHaveCount(0, "the compact star control can collapse the cards");
  await tray.click();
  await expect(stack).toContainText(naturalMemory.text, "the compact star control can reopen the cards");
  const naturalTrigger = page.getByRole("button", { name: `View memory: ${naturalMemory.text}` });
  await naturalTrigger.click();
  const memoryDialog = page.getByRole("dialog", { name: naturalMemory.text });
  const dialogBox = await memoryDialog.boundingBox();
  assert.ok(dialogBox && dialogBox.x >= 0 && dialogBox.x + dialogBox.width <= 375, "memory dialog fits a phone");
  await page.locator(".marinara-capability-villages-memory-backdrop").click({ position: { x: 4, y: 4 } });
  await expect(memoryDialog).toHaveCount(0);
  await page.getByRole("button", { name: `Dismiss ${naturalMemory.text}` }).click();
  await expect(tray).toHaveCount(0, "dismissed durable-memory cards leave no empty tray");
  await returnToMap();

  await mountVisit("visit-leave");
  await composer.waitFor();
  await page.getByRole("button", { name: /Mode: Chat/u }).click();
  await page.getByRole("menuitemradio", { name: "Conclude" }).click();
  await Promise.all([
    page.waitForResponse((response) => response.url().endsWith("/rooms/leave")),
    page.getByRole("button", { name: "Send" }).click(),
  ]);
  await expectMemory(leaveMemory);
  await returnToMap();

  await mountVisit("visit-end");
  await composer.waitFor();
  await page.getByRole("button", { name: "Venue actions" }).click();
  await Promise.all([
    page.waitForResponse((response) => response.url().endsWith("/rooms/end")),
    page.getByRole("menuitem", { name: "End visit now" }).click(),
  ]);
  await expectMemory(endMemory);
  await expect(composer).toHaveCount(
    0,
    "an ended visit stays on its completed reading instead of returning immediately",
  );
  await returnToMap();

  await mountVisit("visit-pending");
  await composer.waitFor();
  await page.getByRole("button", { name: "Venue actions" }).click();
  await Promise.all([
    page.waitForResponse((response) => response.url().endsWith("/rooms/end")),
    page.getByRole("menuitem", { name: "End visit now" }).click(),
  ]);
  await expect(tray).toHaveCount(0, "a pending review creates no false durable-memory star");
  await returnToMap();

  // A second device ends this scene while its old desktop tab is left open.
  await mountVisit("visit-stale");
  await composer.waitFor();
  await composer.focus();
  serverExpired = true;
  await page.evaluate(() => {
    const clock = Date.now;
    Date.now = () => clock() + 50 * 60_000;
  });
  await page.keyboard.type("X");
  await expect(composer).toHaveCount(0, "stale composer stops accepting input");
  await expect(page.getByText(/Interrupted: Inactivity/u)).toBeVisible();
  assert.equal(turn, 2, "stale input never becomes a turn");
  await page.reload();
  await page.addScriptTag({ path: resolve("packages/villages/client.js") });
  await expect(composer).toHaveCount(0, "a phone refresh after expiry opens on the map");
  assert.deepEqual(errors, []);
  console.log("villages-room-notices: durable ending receipts, popup controls, pending review and stale input ok");
} finally {
  await browser.close();
}
