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
let session = {
  version: 1,
  id: "visit-1",
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
      id: "hello",
      role: "assistant",
      speakerId: "bob",
      name: "Bob",
      content: "Hello there.",
      kind: "dialogue",
      heardBy: ["bob"],
      at: now,
    },
  ],
};
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
    const event =
      body.message === "First memory" || body.message === "Repeat receipt"
        ? { id: "memory-1", kind: "memory", text: "Bob remembered the first exchange." }
        : body.message === "Second memory"
          ? { id: "memory-2", kind: "memory", text: "Bob remembered the second exchange." }
          : null;
    value = { session, verdict: null, action: null, recordEvents: event ? [event] : [] };
  } else if (path.endsWith("/rooms/end")) {
    session = { ...session, status: "closed", endedAt: now, endReason: "player" };
    value = { session };
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
  await page.goto("http://villages.test/");
  await page.addScriptTag({ path: resolve("packages/villages/client.js") });
  const composer = page.getByRole("textbox", { name: "Message at The Park" });
  const stack = page.locator("[aria-label='Village events']");
  await composer.waitFor();
  const send = async (message) => {
    await composer.fill(message);
    await Promise.all([
      page.waitForResponse((response) => response.url().endsWith("/rooms/turn")),
      page.getByRole("button", { name: "Send" }).click(),
    ]);
  };
  await send("Ordinary chat");
  await expect(stack).toHaveCount(0);
  await send("First memory");
  await expect(stack).toContainText("Bob remembered the first exchange.");
  const stackBox = await stack.boundingBox();
  const controlsBox = await page.locator(".marinara-capability-villages-chat-head").boundingBox();
  assert.ok(stackBox && controlsBox);
  assert.ok(stackBox.x >= 0 && stackBox.x + stackBox.width <= 375, "notice fits a phone viewport");
  assert.ok(stackBox.y >= controlsBox.y + controlsBox.height, "notice sits below venue controls");
  await page.getByRole("button", { name: "Dismiss Bob remembered the first exchange." }).click();
  await expect(stack).toHaveCount(0);
  await send("Repeat receipt");
  await expect(stack).toHaveCount(0, "dismissed event ID stays dismissed");
  await send("Second memory");
  await expect(stack).toContainText("Bob remembered the second exchange.");
  await page.getByRole("button", { name: "End visit and leave" }).click();
  await expect(stack).toHaveCount(0, "notices clear on scene exit");

  // A second device ends this scene while its old desktop tab is left open.
  session = {
    ...session,
    id: "visit-2",
    status: "active",
    endedAt: "",
    endReason: "",
    lines: session.lines.slice(0, 1),
  };
  await page.reload();
  await page.addScriptTag({ path: resolve("packages/villages/client.js") });
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
  assert.equal(turn, 4, "stale input never becomes a turn");
  await page.reload();
  await page.addScriptTag({ path: resolve("packages/villages/client.js") });
  await expect(composer).toHaveCount(0, "a phone refresh after expiry opens on the map");
  assert.deepEqual(errors, []);
  console.log("villages-room-notices: mobile notices, dismissal, exit clearing, stale input and refresh ok");
} finally {
  await browser.close();
}
