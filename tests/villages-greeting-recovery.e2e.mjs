import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot, residents, now, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const windowsBrowser = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find(existsSync);
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && windowsBrowser ? { executablePath: windowsBrowser } : {}),
});
const bundle = resolve(process.env.VILLAGES_GREETING_CLIENT_BUNDLE || "packages/villages/client.js");
const errors = [];

async function fixture({ restored = true, recovery = "failed" } = {}) {
  const page = await browser.newPage({ viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true });
  page.on("pageerror", (error) => errors.push(error.message));
  let session = restored ? opening("visit-1") : null;
  let greetingCalls = 0;
  let recoveryPending = false;
  let releaseRecovery = null;
  let recoverySettled = false;
  let failActiveReads = false;
  let nextFailure = "";
  const archived = new Map();
  function opening(id) {
    return {
      version: 1,
      sceneRevision: 0,
      id,
      placeId: "mill",
      placeName: "The Mill",
      startedAt: now,
      lastActivityAt: now,
      endedAt: "",
      status: "opening",
      activeIds: ["mara"],
      participants: [{ characterId: "mara", name: "Mara", doing: "listening" }],
      submissions: [],
      lines: [],
    };
  }
  function complete() {
    session = {
      ...session,
      status: "active",
      sceneRevision: 1,
      operation: { id: "greeting", kind: "greet", status: "complete", stage: "complete" },
      lines: [
        {
          id: "hello",
          role: "assistant",
          kind: "dialogue",
          speakerId: "mara",
          name: "Mara",
          content: "The saved greeting.",
          at: now,
        },
      ],
    };
  }
  await page.route("**/*", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/")
      return route.fulfill({
        status: 200,
        contentType: "text/html",
        body: '<meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;height:100%}marinara-capability-villages{display:block;height:100%}</style><marinara-capability-villages></marinara-capability-villages>',
      });
    if (path.endsWith("/rooms/greet")) {
      greetingCalls++;
      recoveryPending = true;
      if (recovery === "immediate") complete();
      if (nextFailure)
        return route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({ error: nextFailure }),
        });
      return route.abort("failed");
    }
    if (path.endsWith("/rooms/active") && recoveryPending) {
      recoveryPending = false;
      if (recovery === "delayed" && !releaseRecovery) {
        await new Promise((done) => {
          releaseRecovery = done;
        });
        recoverySettled = true;
        return route.abort("failed");
      }
      if (recovery === "failed") {
        failActiveReads = true;
        return route.abort("failed");
      }
    }
    if (path.endsWith("/rooms/active") && failActiveReads) return route.abort("failed");
    if (path.endsWith("/rooms/turn")) return route.abort("failed");
    let value;
    if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity"))
      value = { session, debugDiscardEnabled: false };
    else if (path.endsWith("/rooms")) {
      session = opening("visit-" + (greetingCalls + 1));
      value = { session };
    } else if (path.includes("/rooms/archive/")) value = { visit: archived.get(path.split("/").at(-1)) || session };
    else if (path.includes("/operations/")) value = { operation: session?.operation || null };
    else if (path.endsWith("/town-map")) value = { image: mapImage };
    else if (path.startsWith("/api/villages"))
      value = {
        ...snapshot,
        villagers: residents.slice(0, 1),
        settings: {
          ...snapshot.settings,
          venues: snapshot.settings.venues
            .filter((venue) => venue.id === "mill")
            .map((venue) => ({
              ...venue,
              presentation: { ...venue.presentation, x: 0.5, y: 0.5 },
            })),
        },
      };
    else value = [];
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
  });
  async function mount() {
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: bundle });
    await expect(page.locator(".marinara-capability-villages-root").first()).toHaveAttribute("data-mobile", "true");
  }
  async function start() {
    // Clicking waits for the map pin to remain attached and settle after the
    // initial image/layout read; a key press can lose focus during that render.
    await page.locator('[data-pin-id="mill"]').click();
    await page
      .locator(".marinara-capability-villages-explore-sheet")
      .getByRole("button", { name: "Visit", exact: true })
      .click();
  }
  async function focus() {
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  }
  await mount();
  if (!restored) await start();
  return {
    page,
    mount,
    start,
    focus,
    complete,
    allowReads() {
      failActiveReads = false;
    },
    get calls() {
      return greetingCalls;
    },
    get held() {
      return releaseRecovery !== null;
    },
    get settled() {
      return recoverySettled;
    },
    release() {
      releaseRecovery();
    },
    replaceVisit() {
      archived.set(session.id, { ...session, status: "closed", endReason: "elsewhere", endedAt: now });
      session = null;
      nextFailure = "The second visit could not open.";
    },
  };
}

try {
  for (const restored of [false, true]) {
    const f = await fixture({ restored });
    await expect(f.page.getByRole("alert")).toContainText("Failed to fetch");
    await expect(f.page.getByRole("button", { name: "Retry opening", exact: true })).toBeVisible();
    await expect(f.page.getByRole("button", { name: "Continue without opening", exact: true })).toBeVisible();
    assert.equal(f.calls, 1, "a genuine opening failure does not retry generation");
    f.complete();
    f.allowReads();
    await f.focus();
    await expect(f.page.getByText("The saved greeting.", { exact: true })).toBeVisible();
    await expect(f.page.getByRole("alert")).toHaveCount(0);
    assert.equal(f.calls, 1, "focus recovery reads the saved greeting without generating again");
    // A successful focus read must leave an unrelated failed send and its draft visible.
    const composer = f.page.getByRole("textbox", { name: "Message at The Mill" });
    await composer.fill("Keep this unsent draft.");
    await f.page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(f.page.getByRole("alert")).toContainText("Failed to fetch");
    await f.focus();
    await expect(composer).toHaveValue("Keep this unsent draft.");
    await expect(f.page.getByRole("alert")).toContainText("Failed to fetch");
    await f.mount();
    await expect(f.page.getByText("The saved greeting.", { exact: true })).toBeVisible();
    await expect(f.page.getByRole("alert")).toHaveCount(0);
    assert.equal(f.calls, 1, "reload restores a completed opening without another greeting call");
    await f.page.close();
  }
  for (const restored of [false, true]) {
    const f = await fixture({ restored, recovery: "immediate" });
    await expect(f.page.getByText("The saved greeting.", { exact: true })).toBeVisible();
    await expect(f.page.getByRole("alert")).toHaveCount(0);
    assert.equal(f.calls, 1, "immediate recovery reads rather than retries");
    await f.page.close();
  }
  const late = await fixture({ recovery: "delayed" });
  await expect.poll(() => late.held).toBe(true);
  late.complete();
  await late.focus();
  await expect(late.page.getByText("The saved greeting.", { exact: true })).toBeVisible();
  late.release();
  await expect.poll(() => late.settled).toBe(true);
  await expect(late.page.getByRole("textbox", { name: "Message at The Mill" })).toBeEnabled();
  await expect(late.page.getByRole("alert")).toHaveCount(0);
  assert.equal(late.calls, 1, "late failures do not retry a completed opening");
  await late.page.close();

  const switched = await fixture({ recovery: "delayed" });
  await expect.poll(() => switched.held).toBe(true);
  switched.replaceVisit();
  await switched.focus();
  await switched.start();
  await expect(switched.page.getByRole("alert")).toContainText("The second visit could not open.");
  switched.release();
  await expect.poll(() => switched.settled).toBe(true);
  await expect(switched.page.getByRole("alert")).toContainText("The second visit could not open.");
  await expect(switched.page.getByRole("alert")).not.toContainText("Failed to fetch");
  assert.equal(switched.calls, 2, "each deliberate visit makes exactly one greeting request");
  await switched.page.close();
  assert.deepEqual(errors, []);
  console.log("villages-greeting-recovery browser: ok");
} finally {
  await browser.close();
}
