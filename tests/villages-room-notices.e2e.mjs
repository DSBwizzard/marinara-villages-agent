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
const dismissedLive = new Set();
let disconnected = false;
let liveEvents = [],
  livePending = false,
  liveFailed = false,
  livePolls = 0,
  liveReplays = 0,
  liveInterpretRequests = 0;
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
let releaseReview = null;
const improvement = {
  id: "warmth-up",
  kind: "relationship-up",
  text: "Bob's warmth toward you increased (0 → 2).",
  detail: "Bob shared that he enjoyed your company.",
};
const deterioration = {
  id: "trust-down",
  kind: "relationship-down",
  text: "Bob's trust toward you decreased (0 → -5).",
};
const relationships = {
  profiles: [
    {
      characterId: "bob",
      name: "Bob",
      warmth: 2,
      trust: -5,
      warmthLabel: "Neutral",
      trustLabel: "Neutral",
      familiarity: 1,
      friend: false,
      close: false,
      knownAt: now,
      closeKnownAt: now,
      routine: ["08:00 · Reading"],
      interests: "Books",
      wishes: ["A garden"],
      ties: [{ toId: "ives", name: "Ives", warmth: 50, trust: -25, reasons: [] }],
      learned: [],
      access: [],
    },
  ],
  starting: {
    pending: true,
    spoilers: false,
    summaries: [{ fromId: "bob", toId: "ives", fromName: "Bob", toName: "Ives", status: "Mixed" }],
  },
};
const creatorValues = [
  { fromId: "bob", toId: "ives", fromName: "Bob", toName: "Ives", warmth: 50, trust: -25, proposed: true },
];
const apiHandler = async (route) => {
  const path = new URL(route.request().url()).pathname;
  if (disconnected && route.request().frame().page() === page && path.endsWith("/changes")) return route.abort();
  let value = snapshot;
  if (path.endsWith("/rooms/active")) value = { session: serverExpired ? null : session, debugDiscardEnabled: true };
  else if (path.endsWith("/changes") && session.memoryMode === "live") {
    livePolls++;
    value = {
      changes: [],
      notices: liveEvents.filter((event) => !dismissedLive.has(event.id)),
      dismissedNoticeIds: [...dismissedLive],
      processingSummary: { pending: livePending ? 1 : 0, failed: liveFailed ? 1 : 0, rejected: 0 },
      unresolved: liveFailed ? [{ submissionId: "saved-turn", domain: "memories" }] : [],
      nextCursor: String(livePolls) + ":" + String(liveEvents.length),
      hasMore: false,
    };
  } else if (path.endsWith("/dismiss")) {
    dismissedLive.add(decodeURIComponent(path.split("/").at(-2)));
    value = { dismissed: true };
  } else if (path.endsWith("/interpret")) {
    liveInterpretRequests++;
    liveFailed = false;
    value = {};
  } else if (path.endsWith("/changes/replay")) {
    liveReplays++;
    value = {};
  } else if (path.endsWith(`/rooms/archive/${session.id}/retry-memory`)) {
    if (session.id !== "visit-pending") {
      await new Promise((resolve) => {
        releaseReview = resolve;
      });
      session = {
        ...session,
        memoryPending: false,
        memoryReview: {
          status: "complete",
          attempts: 1,
          error: "",
          nextRecollection: 1,
          decisions:
            session.id === "visit-none"
              ? []
              : [
                  {
                    id: `${session.id}-decision`,
                    action: "promote",
                    recollectionIds: ["memory-source"],
                    reason: "commitment",
                  },
                ],
        },
      };
    }
    const event =
      session.id === "visit-natural" ? naturalMemory : session.id === "visit-leave" ? leaveMemory : endMemory;
    value = {
      session,
      recordEvents:
        session.id === "visit-pending" || session.id === "visit-none"
          ? []
          : session.id === "visit-mixed"
            ? [event, improvement, deterioration, improvement, deterioration]
            : [event, event],
    };
  } else if (path.endsWith(`/rooms/archive/${session.id}`))
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
      session = { ...session, status: "closed", activeIds: [], endedAt: now, endReason: "scene", memoryPending: true };
    value = {
      session,
      verdict: null,
      action: null,
      recordEvents: [],
    };
  } else if (path.endsWith("/rooms/leave")) {
    session = {
      ...session,
      status: "closed",
      activeIds: [],
      endedAt: now,
      endReason: "player",
      memoryPending: true,
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
    value = { session, verdict: null, action: null, recordEvents: [] };
  } else if (path.endsWith("/rooms/end")) {
    session = {
      ...session,
      status: "closed",
      activeIds: [],
      endedAt: now,
      endReason: "player",
      memoryPending: true,
    };
    value = { session, recordEvents: [] };
  } else if (path.endsWith("/rooms/leave-pending")) {
    value = { session };
  } else if (path.endsWith("/relationships/creator")) {
    const body = route.request().postDataJSON();
    if (body.action === "acknowledge") {
      assert.equal(body.spoilerAcknowledged, true);
      relationships.starting.spoilers = true;
      relationships.starting.values = creatorValues;
    }
    if (body.action === "hide") {
      relationships.starting.spoilers = false;
      delete relationships.starting.values;
    }
    if (body.action === "edit") {
      assert.equal(body.fromId, "bob");
      assert.equal(body.toId, "ives");
      creatorValues[0].warmth = body.warmth;
      creatorValues[0].trust = body.trust;
    }
    value = relationships;
  } else if (path.endsWith("/relationships")) value = relationships;
  else if (path.endsWith("/catalog")) value = { characters: [] };
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
};
await page.route("**/api/villages**", apiHandler);
await page.route("http://villages.test/", (route) =>
  route.fulfill({
    status: 200,
    contentType: "text/html",
    body: "<style>:root{--background:#101726;--foreground:#f2f2f5;--popover:#202938;--border:#4d5870;--primary:#af91eb;--secondary:#303b50;--muted-foreground:#bac4d7}html,body{margin:0;width:100%;height:100%;font-family:Arial;color:var(--foreground)}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
  }),
);

try {
  const mountVisit = async (id, live = false) => {
    session = newSession(id);
    if (live) session.memoryMode = "live";
    serverExpired = false;
    releaseReview = null;
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
  const completeReview = async () => {
    await expect.poll(() => releaseReview !== null).toBe(true);
    releaseReview();
    releaseReview = null;
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
  await expect(page.getByText(/Closing review in progress/u)).toBeVisible();
  await expect(tray).toHaveCount(0, "the farewell is readable before review finishes");
  await completeReview();
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

  await mountVisit("visit-mixed");
  await composer.waitFor();
  await page.getByRole("button", { name: "Venue actions" }).click();
  await page.getByRole("menuitem", { name: "End Scene now" }).click();
  await completeReview();
  await expect(stack).toContainText(improvement.text);
  await expect(stack).toContainText(deterioration.text);
  await expect(page.locator(".marinara-capability-villages-room-star")).toHaveCount(3);
  await expect(stack).toContainText("♥");
  await expect(stack).toContainText("♡");
  await page.getByRole("button", { name: "View relationship change: " + improvement.text }).click();
  const heartDialog = page.getByRole("dialog", { name: improvement.text });
  await expect(heartDialog).toContainText(improvement.detail);
  await page.getByRole("button", { name: "Close relationship change" }).click();
  await page.getByRole("button", { name: "Dismiss " + improvement.text }).click();
  await page.getByRole("button", { name: "Dismiss " + deterioration.text }).click();
  await expect(stack).not.toContainText(improvement.text);
  await returnToMap();

  await mountVisit("visit-leave");
  await composer.waitFor();
  await page.getByRole("button", { name: /Mode: Chat/u }).click();
  await page.getByRole("menuitemradio", { name: "Conclude" }).click();
  await Promise.all([
    page.waitForResponse((response) => response.url().endsWith("/rooms/leave")),
    page.getByRole("button", { name: "Send" }).click(),
  ]);
  await expect(page.getByText("Come back safely.")).toBeVisible();
  await expect(tray).toHaveCount(0, "the saved farewell appears before its durable notice");
  await completeReview();
  await expectMemory(leaveMemory);
  await returnToMap();

  await mountVisit("visit-end");
  await composer.waitFor();
  await page.getByRole("button", { name: "Venue actions" }).click();
  await Promise.all([
    page.waitForResponse((response) => response.url().endsWith("/rooms/end")),
    page.getByRole("menuitem", { name: "End Scene now" }).click(),
  ]);
  await completeReview();
  await expectMemory(endMemory);
  await expect(composer).toHaveCount(
    0,
    "an ended visit stays on its completed reading instead of returning immediately",
  );
  await returnToMap();

  await mountVisit("visit-none");
  await composer.waitFor();
  await page.getByRole("button", { name: "Venue actions" }).click();
  await Promise.all([
    page.waitForResponse((response) => response.url().endsWith("/rooms/end")),
    page.getByRole("menuitem", { name: "End Scene now" }).click(),
  ]);
  await completeReview();
  await expect(page.getByText("Review complete. No durable memories were made from this Scene.")).toBeVisible();
  await returnToMap();

  await mountVisit("visit-pending");
  await composer.waitFor();
  await page.getByRole("button", { name: "Venue actions" }).click();
  await Promise.all([
    page.waitForResponse((response) => response.url().endsWith("/rooms/end")),
    page.getByRole("menuitem", { name: "End Scene now" }).click(),
  ]);
  await expect(tray).toHaveCount(0, "a pending review creates no false durable-memory star");
  await page.getByRole("button", { name: "Venue actions" }).click();
  await page.getByRole("menuitem", { name: "Leave with memory pending" }).click();

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
  await page.getByRole("button", { name: /^(Open settings menu|More)$/ }).click();
  await page.getByRole("button", { name: "Relationships", exact: true }).click();
  await expect(page.getByRole("meter", { name: /Warmth toward you/u })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Directional relationship to edit" })).toHaveCount(0);
  const reveal = page.getByRole("button", { name: "Reveal and edit relationship values" });
  await expect(reveal).toBeDisabled();
  await page.getByRole("checkbox", { name: /gameplay spoilers/u }).check();
  await reveal.click();
  await page.getByRole("combobox", { name: "Directional relationship to edit" }).selectOption("bob:ives");
  await page.getByRole("spinbutton", { name: "Warmth", exact: true }).fill("60");
  await page.getByRole("button", { name: "Save suggestion" }).click();
  await expect(page.getByRole("spinbutton", { name: "Warmth", exact: true })).toHaveValue("60");
  await page.getByRole("button", { name: "Hide spoiler values" }).click();
  await expect(page.getByRole("combobox", { name: "Directional relationship to edit" })).toHaveCount(0);
  await page.getByText("Review starting ties", { exact: true }).click();
  await page.getByText("Feelings toward other villagers", { exact: true }).click();
  await expect(page.getByText("Why: Not yet shared.")).toBeVisible();
  await page.getByText("Personal life", { exact: true }).click();
  await expect(page.getByText(/Last known information/u)).toBeVisible();
  const profile = page.locator(".villages-relationships");
  assert.ok(
    await profile.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
    "relationship controls fit phone width",
  );
  await page.screenshot({ path: "artifacts/relationships-phone.png" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByRole("meter", { name: /Warmth toward you/u })).toBeVisible();
  assert.ok(
    await profile.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
    "relationship controls fit desktop width",
  );
  await page.screenshot({ path: "artifacts/relationships-desktop.png" });
  await mountVisit("visit-live", true);
  await composer.waitFor();
  livePending = true;
  const immediate = memoryEvent("live-forged", "A memory was forged.", "Bob will bring seedlings on Saturday.");
  liveEvents = [
    immediate,
    {
      id: "live-heart",
      kind: "relationship-up",
      text: "Bob's warmth toward you increased.",
      detail: "Planting together",
    },
  ];
  await expect(page.getByRole("status", { name: "Saved change status" })).toContainText("still being checked");
  await expect(stack).toContainText(immediate.text);
  await expect(stack).toContainText("♥");
  assert.equal(session.status, "active", "memory and relationship notices appear before closing");
  liveEvents.push({ id: "live-wish", kind: "wish", text: "Bob shared a wish." });
  liveEvents.push({ id: "live-progress", kind: "wish", text: "New evidence for Bob's wish was accepted." });
  livePending = false;
  await expect(stack).toContainText("New evidence for Bob's wish");
  await expect(page.getByRole("status", { name: "Saved change status" })).toHaveCount(0);
  await page.getByRole("button", { name: "Dismiss A memory was forged." }).click();
  await expect.poll(() => dismissedLive.has(immediate.id)).toBe(true);
  const turnsBeforeRefresh = turn;
  await page.reload();
  await page.addScriptTag({ path: resolve("packages/villages/client.js") });
  await expect(stack).toContainText("Bob shared a wish.");
  await expect(stack).not.toContainText(immediate.text);
  assert.equal(turn, turnsBeforeRefresh, "refresh restores committed notices without generating a reply");
  assert.equal(liveInterpretRequests, 0, "polling and dismissal never request interpretation");
  liveEvents.push({ id: "live-complete", kind: "wish", text: "Bob's wish was fulfilled." });
  await expect(stack).toContainText("Bob's wish was fulfilled.");
  const second = await browser.newPage({ viewport: { width: 375, height: 740 } });
  await second.route("**/api/villages**", apiHandler);
  await second.route("http://villages.test/", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<style>:root{--background:#101726;--foreground:#f2f2f5;--popover:#202938;--border:#4d5870;--primary:#af91eb;--secondary:#303b50;--muted-foreground:#bac4d7}html,body{margin:0;width:100%;height:100%;font-family:Arial;color:var(--foreground)}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
    }),
  );
  await second.goto("http://villages.test/");
  await second.addScriptTag({ path: resolve("packages/villages/client.js") });
  const secondStack = second.locator("[aria-label='Village events']");
  await expect(secondStack).toContainText("Bob shared a wish.");
  await page.getByRole("button", { name: "Dismiss Bob shared a wish." }).click();
  await expect(secondStack).not.toContainText("Bob shared a wish.");
  disconnected = true;
  const missed = { id: "disconnected-notice", kind: "wish", text: "Evidence was saved while disconnected." };
  liveEvents.push(missed);
  await expect(secondStack).toContainText(missed.text);
  disconnected = false;
  await expect(stack).toContainText(missed.text);
  await second.close();
  assert.equal(liveInterpretRequests, 0, "tabs and reconnection only read saved work");
  await page.getByRole("button", { name: "Venue actions" }).click();
  await page.getByRole("menuitem", { name: "Scene settings" }).click();
  const settings = page.getByRole("dialog", { name: "Scene settings" });
  await settings.getByText("Saved change diagnostics · includes private evidence", { exact: true }).click();
  await expect(settings.locator("pre")).toContainText("processingSummary");
  await settings.getByRole("button", { name: "Refresh saved records" }).click();
  await expect(settings.locator("pre")).toContainText("dismissedNoticeIds");
  assert.equal(liveInterpretRequests, 0, "diagnostic reads make no interpretation request");
  await page.screenshot({ path: "artifacts/live-change-diagnostics-desktop.png" });
  await page.setViewportSize({ width: 375, height: 740 });
  await expect(settings).toBeVisible();
  assert.ok(
    await settings.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
    "saved diagnostics fit phone width",
  );
  await page.screenshot({ path: "artifacts/live-change-diagnostics-phone.png" });
  await settings.getByRole("button", { name: "Close Scene settings" }).click();
  liveFailed = true;
  const failedStatus = page.getByRole("status", { name: "Saved change status" });
  await expect(failedStatus).toContainText("need attention");
  await failedStatus.locator("summary").click();
  await failedStatus.getByRole("button", { name: "Replay saved work · no model request" }).click();
  assert.equal(liveInterpretRequests, 0, "replay does not authorize paid repair");
  await expect.poll(() => liveReplays).toBe(1);
  await failedStatus.getByRole("button", { name: "Retry memories interpretation · may use model requests" }).click();
  await expect.poll(() => liveInterpretRequests).toBe(1);
  await expect(failedStatus).toHaveCount(0);
  assert.deepEqual(errors, []);
  console.log(
    "villages-room-notices: live stars/hearts, pending status, refresh and persisted dismissal, plus legacy controls passed (mock server; not model accuracy)",
  );
} finally {
  await browser.close();
}
