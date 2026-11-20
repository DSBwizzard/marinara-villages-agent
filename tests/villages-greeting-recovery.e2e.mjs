import { scenePlaybackFixtures } from "./fixtures/scene-browser.fixture.mjs";
const { authorSceneResponse } = await scenePlaybackFixtures();
import { mockEngineLookups, fulfill, abort } from "./fixtures/browser-diagnostics.mjs";
import { openSceneErrors, closeSceneErrors, expectSceneError } from "./fixtures/villages-scene-errors.fixture.mjs";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot, residents, now, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
const bundle = resolve(process.env.VILLAGES_GREETING_CLIENT_BUNDLE || "packages/villages/client.js");
const errors = [];

async function fixture({
  restored = true,
  recovery = "failed",
  connectionError = "",
  width = 375,
  visitorIntroduction = false,
} = {}) {
  const page = await browser.newPage({
    viewport: { width, height: 740 },
    isMobile: width < 600,
    hasTouch: width < 600,
  });
  await mockEngineLookups(page);
  page.on("pageerror", (error) => errors.push(error.message));
  let session = restored ? opening("visit-1") : null;
  let greetingCalls = 0;
  let endCalls = 0;
  const greetingBodies = [];
  let recoveryPending = false;
  let releaseRecovery = null;
  let recoverySettled = false;
  let failActiveReads = false;
  let nextFailure = connectionError;
  let changeAttemptOnRead = false;
  let succeedNextGreeting = false;
  let activeReads = 0;
  const initialValidation = Promise.withResolvers();
  const archived = new Map();
  function opening(id) {
    return {
      version: 5,
      sceneRevision: 0,
      id,
      placeId: "mill",
      placeName: "The Mill",
      startedAt: now,
      lastActivityAt: now,
      endedAt: "",
      status: "opening",
      ...(visitorIntroduction ? { visitorIntroduction: true } : {}),
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
          heardBy: ["player", "mara"],
        },
      ],
    };
  }
  await page.route("**/*", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.startsWith("/api/capability-packages/villages/assets/")) return route.fallback();
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
        return fulfill(route, { json: authorSceneResponse({ session }, snapshot.worldScope) });
      }
      if (recovery === "delayed" && greetingCalls === 1) await initialValidation.promise;
      recoveryPending = true;
      if (recovery === "immediate") complete();
      if (nextFailure) {
        if (connectionError)
          session.operation = {
            id: "greeting",
            kind: "greet",
            status: "complete",
            stage: "complete",
            attemptId: "configuration-attempt",
            error: connectionError,
          };
        return fulfill(route, {
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({ error: nextFailure }),
        });
      }
      return abort(route, "failed");
    }
    if (path.endsWith("/rooms/active") && ++activeReads === 2 && recovery === "delayed") {
      // Hold the recovery read, after the normal selection validation has completed.
      await fulfill(route, { json: authorSceneResponse({ session }, snapshot.worldScope) });
      initialValidation.resolve();
      return;
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
      return fulfill(route, { status: 400, json: { error: "A line can be at most 4000 characters." } });
    if (path.endsWith("/rooms/end")) endCalls++;
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
    else if (path === "/api/villages/connections")
      value = { systemConnectionId: "", narrationConnectionId: "missing-gm", imageConnectionId: "" };
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
    await fulfill(route, {
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(authorSceneResponse(value, snapshot.worldScope)),
    });
  });
  async function mount() {
    await page.goto("http://villages.test/");
    // Restoration has its own read deadline; scenario assertions start after that read completes.
    const initialSceneRead = page
      .waitForResponse((response) => new URL(response.url()).pathname.endsWith("/rooms/active"), { timeout: 10_000 })
      .then(async (response) => assert.equal(await response.finished(), null));
    await Promise.all([page.addScriptTag({ path: bundle }), initialSceneRead]);
    await expect(page.locator(".marinara-capability-villages-root").first()).toHaveAttribute(
      "data-mobile",
      width < 600 ? "true" : "false",
    );
  }
  async function start() {
    // Clicking waits for the map pin to remain attached and settle after the
    // initial image/layout read; a key press can lose focus during that render.
    await page.locator('[data-pin-id="mill"]').click();
    await page
      .getByRole("region", { name: "Venue", exact: true })
      .getByRole("button", { name: "Visit venue", exact: true })
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
    setClosingConnectionFailure() {
      session.status = "closing";
      session.operation = {
        id: "conclude",
        kind: "close",
        status: "interrupted",
        error: 'GM connection is not configured: "missing-gm".\n401 unauthorized',
      };
    },
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
    get ends() {
      return endCalls;
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

await withBrowser(browser, async () => {
  await mkdir(".build-tmp/scene-errors", { recursive: true });
  const intro = await fixture({
    visitorIntroduction: true,
    recovery: "configuration",
    connectionError: 'GM connection is not configured: "missing-gm".\nLanguage model connection not found',
  });
  const introDock = intro.page.getByRole("group", { name: "Scene opening", exact: true });
  await introDock.getByRole("button", { name: "Back to map", exact: true }).click();
  await expect(intro.page.locator('[data-pin-id="mill"]')).toBeVisible();
  assert.equal(intro.ends, 0, "Leaving a failed Mari opening keeps mandatory onboarding pending");
  await intro.page.getByRole("button", { name: "Return to Scene", exact: true }).click();
  await expect(introDock.getByRole("button", { name: "Retry opening", exact: true })).toBeVisible();
  assert.equal(intro.calls, 1, "Returning to the saved introduction never dispatches an automatic retry");
  await intro.page.close();
  for (const width of [1440, 390, 320]) {
    const connectionError = 'GM connection is not configured: "missing-gm".\nLanguage model connection not found';
    const f = await fixture({ connectionError, recovery: "configuration", width });
    const panel = await openSceneErrors(f.page);
    await expect(f.page.getByRole("button", { name: "1 Scene error", exact: true })).toBeVisible();
    await expect(panel.getByRole("button", { name: /Retry|Continue without/ })).toHaveCount(0);
    await expect(f.page.getByRole("button", { name: "Continue without opening", exact: true })).toHaveCount(0);
    await f.page.screenshot({ path: `.build-tmp/scene-errors/connection-${width}.png` });
    assert.equal(f.calls, 1, "opening error details never dispatch a retry");
    await panel
      .getByRole("button", { name: /GM connection is not configured: "missing-gm".*Manage AI connections/s })
      .click();
    await expect(f.page.getByRole("button", { name: "Return to Scene", exact: true })).toBeVisible();
    await expect(f.page.getByRole("button", { name: /GM.*Missing connection/s })).toBeVisible();
    assert.equal(f.calls, 1, "opening connection settings never dispatches a retry");
    await f.page.getByRole("button", { name: "Return to Scene", exact: true }).click();
    await closeSceneErrors(f.page);
    const dock = f.page.getByRole("group", { name: "Scene opening", exact: true });
    const retry = dock.getByRole("button", { name: "Retry opening", exact: true });
    await expect(retry).toBeVisible();
    const bounds = await retry.boundingBox();
    assert(bounds.x >= 0 && bounds.x + bounds.width <= width && bounds.y > 370 && bounds.y + bounds.height <= 740);
    assert(bounds.height >= 44, "opening retry has a usable touch target");
    f.succeedNextGreeting();
    await retry.click();
    await expect(f.page.getByText("The saved greeting.", { exact: true })).toBeVisible();
    assert.equal(f.calls, 2, "the dock retry makes exactly one explicit opening request");
    await f.page.close();
  }
  const closing = await fixture({ recovery: "configuration" });
  await expectSceneError(closing.page, "The game couldn’t reach the server.");
  closing.setClosingConnectionFailure();
  await closing.focus();
  const closingErrors = await openSceneErrors(closing.page);
  await expect(closingErrors.getByRole("button", { name: /Manage AI connections/ })).toBeVisible();
  await expect(closingErrors.getByRole("button", { name: "Retry saved request", exact: true })).toBeVisible();
  await closing.page.close();
  for (const restored of [false, true]) {
    const f = await fixture({ restored });
    await expectSceneError(f.page, "The game couldn’t reach the server.");
    const panel = await openSceneErrors(f.page);
    await expect(panel.getByRole("button", { name: "Retry opening", exact: true })).toHaveCount(0);
    await expect(panel.getByRole("button", { name: "Continue without opening", exact: true })).toHaveCount(0);
    await closeSceneErrors(f.page);
    const dock = f.page.getByRole("group", { name: "Scene opening", exact: true });
    await expect(dock.getByRole("button", { name: "Retry opening", exact: true })).toBeVisible();
    await expect(dock.getByRole("button", { name: "Continue without opening", exact: true })).toBeVisible();
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
    await expectSceneError(f.page, "A line can be at most 4000 characters.");
    await f.focus();
    await expect(composer).toHaveValue("Keep this unsent draft.");
    await expectSceneError(f.page, "A line can be at most 4000 characters.");
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
  await expectSceneError(unsaved.page, "The game couldn’t reach the server.");
  unsaved.succeedNextGreeting();
  await closeSceneErrors(unsaved.page);
  await unsaved.page.getByRole("button", { name: "Retry opening", exact: true }).first().click();
  await expect(unsaved.page.getByText("The saved greeting.", { exact: true })).toBeVisible();
  assert.equal(
    unsaved.bodies[1].retryOfAttemptId,
    undefined,
    "an opening without a saved operation uses a fresh greeting",
  );
  await unsaved.page.close();

  const terminal = await fixture();
  await expectSceneError(terminal.page, "The game couldn’t reach the server.");
  terminal.setTerminalFailure();
  terminal.allowReads();
  await terminal.focus();
  await expectSceneError(terminal.page, "The AI returned a reply the game couldn’t read.");
  await closeSceneErrors(terminal.page);
  await terminal.page.getByRole("button", { name: "Retry opening", exact: true }).first().click();
  await expect(terminal.page.getByText("The saved greeting.", { exact: true })).toBeVisible();
  await expect(terminal.page.getByRole("button", { name: /Scene errors?/ })).toHaveCount(0);
  assert.equal(terminal.calls, 2, "the explicit retry makes exactly one new greeting request");
  assert.equal(terminal.bodies[1].retryOfAttemptId, "failed-attempt", "the retry acknowledges the saved attempt");
  await terminal.page.close();

  const recoverable = await fixture();
  await expectSceneError(recoverable.page, "The game couldn’t reach the server.");
  recoverable.setTerminalFailure({ recoverable: true });
  recoverable.allowReads();
  await recoverable.focus();
  await closeSceneErrors(recoverable.page);
  await recoverable.page.getByRole("button", { name: "Recover saved opening", exact: true }).first().click();
  await expect(recoverable.page.getByText("The saved greeting.", { exact: true })).toBeVisible();
  assert.equal(recoverable.bodies[1].recovery, true, "a saved greeting uses recovery rather than a paid retry");
  assert.equal(recoverable.bodies[1].retryOfAttemptId, undefined);
  await recoverable.page.close();

  const changed = await fixture();
  await expectSceneError(changed.page, "The game couldn’t reach the server.");
  changed.setTerminalFailure();
  changed.allowReads();
  await changed.focus();
  await expectSceneError(changed.page, "The AI returned a reply the game couldn’t read.");
  await closeSceneErrors(changed.page);
  changed.changeAttemptOnRead();
  await changed.page.getByRole("button", { name: "Retry opening", exact: true }).first().click();
  await expectSceneError(changed.page, "The Scene changed during the request.");
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
});
