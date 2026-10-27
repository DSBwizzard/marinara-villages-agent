import { mockEngineLookups, fulfill, abort } from "./fixtures/browser-diagnostics.mjs";
import { openSceneErrors, closeSceneErrors, expectSceneError } from "./fixtures/villages-scene-errors.fixture.mjs";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { snapshot, residents, now, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
const bundle = resolve(process.env.VILLAGES_GREETING_CLIENT_BUNDLE || "packages/villages/client.js");
const errors = [];

async function fixture({ restored = true, recovery = "failed" } = {}) {
  const page = await browser.newPage({ viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true });
  await mockEngineLookups(page);
  page.on("pageerror", (error) => errors.push(error.message));
  let session = restored ? opening("visit-1") : null;
  let greetingCalls = 0;
  const greetingBodies = [];
  let recoveryPending = false;
  let releaseRecovery = null;
  let recoverySettled = false;
  let failActiveReads = false;
  let nextFailure = "";
  let changeAttemptOnRead = false;
  let succeedNextGreeting = false;
  const archived = new Map();
  function opening(id) {
    return {
      version: 2,
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
      return fulfill(route, {
        status: 200,
        contentType: "text/html",
        body: '<meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;height:100%}marinara-capability-villages{display:block;height:100%}</style><marinara-capability-villages></marinara-capability-villages>',
      });
    if (path.endsWith("/rooms/greet")) {
      greetingCalls++;
      const body = route.request().postDataJSON();
      greetingBodies.push(body);
      if (body.retryOfAttemptId === "failed-attempt" || body.recovery === true || succeedNextGreeting) {
        complete();
        return fulfill(route, { json: { session } });
      }
      recoveryPending = true;
      if (recovery === "immediate") complete();
      if (nextFailure)
        return fulfill(route, {
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({ error: nextFailure }),
        });
      return abort(route, "failed");
    }
    if (path.endsWith("/rooms/active") && recoveryPending) {
      recoveryPending = false;
      if (recovery === "delayed" && !releaseRecovery) {
        await new Promise((done) => {
          releaseRecovery = done;
        });
        recoverySettled = true;
        return abort(route, "failed");
      }
      if (recovery === "failed") {
        failActiveReads = true;
        return abort(route, "failed");
      }
    }
    if (path.endsWith("/rooms/active") && failActiveReads) return abort(route, "failed");
    if (path.endsWith("/rooms/turn"))
      return fulfill(route, { status: 400, json: { error: "This line could not be accepted." } });
    let value;
    if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity"))
      value = { session, debugDiscardEnabled: false };
    else if (path.endsWith("/rooms")) {
      session = opening("visit-" + (greetingCalls + 1));
      value = { session };
    } else if (/\/rooms\/[^/]+\/recovery$/.test(path))
      value = { visit: archived.get(path.split("/").at(-2)) || session };
    else if (path.includes("/operations/")) {
      if (changeAttemptOnRead) session.operation.attemptId = "newer-attempt";
      value = { operation: session?.operation || null };
    } else if (path.endsWith("/town-map")) value = { image: mapImage };
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
    await fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(value) });
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
    await page.getByRole("button", { name: "Visit venue", exact: true }).click();
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
    setTerminalFailure({ recoverable = false } = {}) {
      session.operation = {
        id: "greeting",
        kind: "greet",
        status: recoverable ? "interrupted" : "complete",
        recoverable,
        attemptId: "failed-attempt",
        error: "The Scene reply failed validation (invalid-json). Your draft is preserved; explicitly retry.",
        input: {},
      };
    },
    get bodies() {
      return greetingBodies;
    },
    changeAttemptOnRead() {
      changeAttemptOnRead = true;
    },
    succeedNextGreeting() {
      succeedNextGreeting = true;
    },
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
    await expectSceneError(f.page, "The connection was interrupted. Check the saved reply before sending again.");
    await openSceneErrors(f.page);
    await expect(f.page.getByRole("button", { name: "Retry opening", exact: true })).toBeVisible();
    await expect(f.page.getByRole("button", { name: "Continue without opening", exact: true })).toBeVisible();
    assert.equal(f.calls, 1, "a genuine opening failure does not retry generation");
    await closeSceneErrors(f.page);
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
    await expectSceneError(f.page, "This line could not be accepted.");
    await f.focus();
    await expect(composer).toHaveValue("Keep this unsent draft.");
    await expectSceneError(f.page, "This line could not be accepted.");
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
  const unsaved = await fixture();
  await expectSceneError(unsaved.page, "The connection was interrupted. Check the saved reply before sending again.");
  unsaved.succeedNextGreeting();
  await openSceneErrors(unsaved.page);
  await unsaved.page.getByRole("button", { name: "Retry opening", exact: true }).first().click();
  await expect(unsaved.page.getByText("The saved greeting.", { exact: true })).toBeVisible();
  assert.equal(
    unsaved.bodies[1].retryOfAttemptId,
    undefined,
    "an opening without a saved operation uses a fresh greeting",
  );
  await unsaved.page.close();

  const terminal = await fixture();
  await expectSceneError(terminal.page, "The connection was interrupted. Check the saved reply before sending again.");
  terminal.setTerminalFailure();
  terminal.allowReads();
  await terminal.focus();
  await expectSceneError(terminal.page, "The AI reply was incomplete or could not be read.");
  await openSceneErrors(terminal.page);
  await terminal.page.getByRole("button", { name: "Retry opening", exact: true }).first().click();
  await expect(terminal.page.getByText("The saved greeting.", { exact: true })).toBeVisible();
  await expect(terminal.page.getByRole("button", { name: /Scene errors?/ })).toHaveCount(0);
  assert.equal(terminal.calls, 2, "the explicit retry makes exactly one new greeting request");
  assert.equal(terminal.bodies[1].retryOfAttemptId, "failed-attempt", "the retry acknowledges the saved attempt");
  await terminal.page.close();

  const recoverable = await fixture();
  await expectSceneError(
    recoverable.page,
    "The connection was interrupted. Check the saved reply before sending again.",
  );
  recoverable.setTerminalFailure({ recoverable: true });
  recoverable.allowReads();
  await recoverable.focus();
  await openSceneErrors(recoverable.page);
  await recoverable.page.getByRole("button", { name: "Recover saved opening", exact: true }).first().click();
  await expect(recoverable.page.getByText("The saved greeting.", { exact: true })).toBeVisible();
  assert.equal(recoverable.bodies[1].recovery, true, "a saved greeting uses recovery rather than a paid retry");
  assert.equal(recoverable.bodies[1].retryOfAttemptId, undefined);
  await recoverable.page.close();

  const changed = await fixture();
  await expectSceneError(changed.page, "The connection was interrupted. Check the saved reply before sending again.");
  changed.setTerminalFailure();
  changed.allowReads();
  await changed.focus();
  await expectSceneError(changed.page, "The AI reply was incomplete or could not be read.");
  await openSceneErrors(changed.page);
  changed.changeAttemptOnRead();
  await changed.page.getByRole("button", { name: "Retry opening", exact: true }).first().click();
  await expectSceneError(changed.page, "The opening request changed. Review the current Scene before retrying.");
  assert.equal(changed.calls, 1, "a different saved attempt is never retried without a fresh click");
  await changed.page.close();

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
  await expectSceneError(switched.page, "The second visit could not open.");
  switched.release();
  await expect.poll(() => switched.settled).toBe(true);
  await expectSceneError(switched.page, "The second visit could not open.");
  await expect(await openSceneErrors(switched.page)).not.toContainText("Could not reach the server");
  assert.equal(switched.calls, 2, "each deliberate visit makes exactly one greeting request");
  await switched.page.close();
  assert.deepEqual(errors, []);
  console.log("villages-greeting-recovery browser: ok");
} finally {
  await browser.close();
}
