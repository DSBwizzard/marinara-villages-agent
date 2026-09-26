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
    {
      id: "hello-aside",
      role: "assistant",
      speakerId: "bob",
      name: "Bob",
      content: "A quiet aside.",
      kind: "side",
      asideFor: "hello",
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
        ? {
            id: "memory-1",
            kind: "memory",
            text: "Bob: New memory",
            detail: "Bob remembers the first exchange exactly.",
          }
        : body.message === "Second memory"
          ? {
              id: "memory-2",
              kind: "memory",
              text: "Bob: New memory",
              detail: "Bob remembers the second exchange exactly.",
            }
          : null;
    value = { session, verdict: null, action: null, recordEvents: event ? [event] : [] };
  } else if (path.endsWith("/rooms/leave")) {
    session = {
      ...session,
      status: "closed",
      endedAt: now,
      endReason: "player",
      lines: [
        ...session.lines,
        { id: "leaving", role: "user", speakerId: "", name: "", content: "I say goodbye and leave.", at: now },
        {
          id: "goodbye",
          role: "assistant",
          speakerId: "bob",
          name: "Bob",
          content: "Goodbye for now.",
          kind: "dialogue",
          at: now,
        },
      ],
    };
    value = { session, recordEvents: [] };
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
  const panel = page.locator(".marinara-capability-villages-chat-vn");
  const aside = page.locator(".marinara-capability-villages-chat-vn-asides");
  for (const viewport of [
    { width: 375, height: 740 },
    { width: 1440, height: 900 },
    { width: 640, height: 360 },
  ]) {
    await page.setViewportSize(viewport);
    const panelBox = await panel.boundingBox();
    const asideBox = await aside.boundingBox();
    assert.ok(panelBox && asideBox);
    assert.ok(panelBox.x >= 0 && panelBox.x + panelBox.width <= viewport.width, "panel fits the viewport");
    assert.ok(
      panelBox.y + panelBox.height <= viewport.height + 1,
      `panel stays above the bottom edge: ${JSON.stringify({ viewport, panelBox })}`,
    );
    assert.ok(asideBox.y + asideBox.height <= panelBox.y + 1, "aside floats above the panel");
    if (viewport.width === 1440) assert.ok(panelBox.width <= 950, "desktop panel remains compact");
  }
  await page.setViewportSize({ width: 375, height: 740 });
  const send = async (message) => {
    await composer.fill(message);
    await Promise.all([
      page.waitForResponse((response) => response.url().endsWith("/rooms/turn")),
      page.getByRole("button", { name: "Send" }).click(),
    ]);
    await page.getByRole("button", { name: "Previous paragraph" }).click();
    await expect(composer).toHaveCount(0, "input hides while reading an older paragraph");
    await page.getByRole("button", { name: "Next paragraph" }).click();
    await expect(composer).toBeVisible();
  };
  await page.getByRole("button", { name: /Mode: Chat/u }).click();
  await page.getByRole("menuitemradio", { name: "Fulfill" }).click();
  await expect(page.getByRole("combobox", { name: "Whose wish you fulfilled" })).toBeVisible();
  await page.getByRole("button", { name: /Mode: Fulfill/u }).click();
  await page.getByRole("menuitemradio", { name: "Chat" }).click();
  await send("Ordinary chat");
  await expect(stack).toHaveCount(0);
  await send("First memory");
  await expect(stack).toContainText("Bob: New memory");
  await page.getByRole("button", { name: "Read Bob: New memory" }).click();
  await expect(page.getByRole("dialog", { name: "Bob: New memory" })).toContainText(
    "Bob remembers the first exchange exactly.",
  );
  await page.getByRole("button", { name: "Close memory" }).click();
  const stackBox = await stack.boundingBox();
  const controlsBox = await page.locator(".marinara-capability-villages-chat-head").boundingBox();
  assert.ok(stackBox && controlsBox);
  assert.ok(stackBox.x >= 0 && stackBox.x + stackBox.width <= 375, "notice fits a phone viewport");
  assert.ok(stackBox.y >= controlsBox.y + controlsBox.height, "notice sits below venue controls");
  await page.getByRole("button", { name: "Dismiss Bob: New memory" }).click();
  await expect(stack).toHaveCount(0);
  await send("Repeat receipt");
  await expect(stack).toHaveCount(0, "dismissed event ID stays dismissed");
  await send("Second memory");
  await expect(stack).toContainText("Bob: New memory");
  await page.getByRole("button", { name: "End scene" }).click();
  await expect(composer).toHaveCount(0);
  await page.getByRole("button", { name: "Next paragraph" }).click();
  await page.getByRole("button", { name: "Return to map" }).click();
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
  serverExpired = false;
  session = {
    ...session,
    id: "visit-3",
    status: "active",
    endedAt: "",
    endReason: "",
    lines: session.lines.slice(0, 1),
  };
  await page.reload();
  await page.addScriptTag({ path: resolve("packages/villages/client.js") });
  await composer.waitFor();
  await page.getByRole("button", { name: "DEBUG: End immediately" }).click();
  await expect(composer).toHaveCount(0, "DEBUG end returns to the map without a goodbye");
  assert.equal(session.endReason, "player");
  assert.deepEqual(errors, []);
  console.log("villages-room-notices: responsive panel, memory detail, natural and DEBUG exits, stale input ok");
} finally {
  await browser.close();
}
