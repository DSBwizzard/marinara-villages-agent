import { scenePlaybackFixtures } from "./fixtures/scene-browser.fixture.mjs";
const { authorSceneResponse, fixturePlaybackPage } = await scenePlaybackFixtures();
import { mockEngineLookups, fulfill, abort } from "./fixtures/browser-diagnostics.mjs";
import { openSceneErrors, closeSceneErrors, expectSceneError } from "./fixtures/villages-scene-errors.fixture.mjs";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot, residents, now, venueSnapshotFixture } from "./fixtures/villages-scene-browser.fixture.mjs";

const tag = "marinara-capability-villages";
const browser = await chromium.launch({
  headless: true,
});
await withBrowser(browser, async () => {
  await mkdir(".build-tmp/scene-status", { recursive: true });
  for (const mobile of [false, true]) {
    const page = await browser.newPage({
      viewport: mobile ? { width: 390, height: 620 } : { width: 1440, height: 900 },
      hasTouch: mobile,
    });
    await mockEngineLookups(page);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.copiedSceneError = text;
          },
        },
      });
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const fixture = structuredClone(snapshot);
    fixture.settings.venues[0].zones = [
      { id: "exterior", name: "Outside", kind: "exterior", seen: true },
      { id: "hall", name: "Hall", kind: "public", seen: true },
    ];
    fixture.settings.venues[0] = venueSnapshotFixture(fixture.settings.venues[0]);
    const session = {
      version: 1,
      id: "send-recovery",
      placeId: "mill",
      placeName: "The Mill",
      zoneId: "exterior",
      spaceClass: "workplace",
      area: "public",
      startedAt: now,
      lastActivityAt: now,
      status: "active",
      sceneRevision: 0,
      activeIds: ["mara"],
      initialActiveIds: ["mara"],
      participants: residents.slice(0, 1).map(({ characterId, name }) => ({ characterId, name, doing: "listening" })),
      lines: [
        {
          id: "opening",
          role: "assistant",
          kind: "dialogue",
          speakerId: "mara",
          name: "Mara",
          content: "Good morning.",
          at: now,
        },
      ],
      submissions: [],
      operation: null,
    };
    let zonePosts = 0;
    let active = true;
    let holdReview = null;
    let failure = null;
    let liveStale = false;
    let loseSuccessResponse = false;
    let hideReads = false;
    let loseOperationRead = false;
    let staleRecovery = null;
    let savedChangeRecovery = null;
    let replays = 0;
    const turns = [];
    const settingsWrites = [];
    await page.route("**/api/villages**", async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      let value = fixture;
      if (path.endsWith("/changes/replay")) {
        assert.equal(request.method(), "POST");
        assert.equal(request.postData(), null);
        replays++;
        savedChangeRecovery = null;
        value = {
          processingSummary: { pending: 0, failed: 0, rejected: 0 },
          unresolved: [],
          notices: [],
          changes: [],
          hasMore: false,
          nextCursor: "0",
        };
      } else if (path.endsWith("/playback")) {
        const query = new URL(request.url()).searchParams;
        value = fixturePlaybackPage(
          session,
          snapshot.worldScope,
          query.get("cursor") || undefined,
          query.get("first") === "1",
        );
      } else if (path.endsWith("/connections"))
        value = { systemConnectionId: "", narrationConnectionId: "", imageConnectionId: "" };
      else if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) {
        if (path.endsWith("/rooms/active") && holdReview) {
          const held = holdReview;
          holdReview = null;
          await held;
        }
        if (hideReads) return fulfill(route, { status: 503, json: { error: "Read unavailable" } });
        value = { session: active ? session : null };
        if (path.endsWith("/rooms/active") && staleRecovery) {
          value = { session: staleRecovery };
          staleRecovery = null;
        }
      } else if (path.endsWith("/error-details")) {
        value = {
          errors: [
            {
              id: `operation:${session.operation.id}:${session.operation.attemptId}`,
              details: JSON.stringify({
                failure: {
                  cause: "missing_result",
                  stage: "sound-witnesses",
                  detail: "Exact sound validation field: attentionWitnesses.segment",
                },
              }),
            },
          ],
        };
      } else if (path.endsWith("/changes")) {
        value = {
          changes: [],
          notices: [],
          dismissedNoticeIds: [],
          processingSummary: { pending: 0, failed: 0, rejected: 0 },
          unresolved: [],
          nextCursor: "0",
          hasMore: false,
        };
        if (savedChangeRecovery) {
          value.processingSummary = { pending: 0, failed: 1, rejected: 0 };
          value.unresolved = [savedChangeRecovery];
        }
      } else if (/\/rooms\/[^/]+\/operations?/.test(path)) {
        if (hideReads) return fulfill(route, { status: 503, json: { error: "Read unavailable" } });
        if (loseOperationRead) return fulfill(route, { status: 404, json: { error: "Operation unavailable" } });
        value = { operation: session.operation };
      } else if (/\/rooms\/[^/]+\/recovery$/.test(path)) {
        if (hideReads) return fulfill(route, { status: 503, json: { error: "Read unavailable" } });
        value = { visit: session };
      } else if (path.endsWith("/settings") && request.method() === "PATCH") {
        const input = request.postDataJSON();
        settingsWrites.push(input);
        Object.assign(fixture.settings, input);
        value = fixture;
      } else if (path.endsWith("/rooms/zone")) {
        zonePosts++;
        value = { session };
      } else if (path.endsWith("/rooms/turn") || path.endsWith("/rooms/leave")) {
        const input = request.postDataJSON();
        turns.push(input);
        if (liveStale) {
          liveStale = false;
          session.activeIds = ["eli"];
          session.participants.push({ characterId: "eli", name: "Eli", doing: "Reading" });
          session.currentTime = "Monday, 2 November · 11:57";
          session.sceneRevision++;
          session.lines.push({
            id: "current-presence",
            role: "assistant",
            kind: "narration",
            speakerId: "__venue_scene__",
            content: "Mara is no longer here. Eli is here.",
            at: now,
            physicalIdsAfter: ["eli"],
          });
          return fulfill(route, {
            status: 409,
            json: {
              error: "The situation changed. Your message has not been sent. Review who is here and send again.",
              code: "SCENE_STALE",
            },
          });
        }
        if (failure) {
          const message =
            failure === "native-hold"
              ? "The reply would overcrowd a Zone. Your draft is preserved."
              : failure === "halt"
                ? "Village time cannot be skipped through narration."
                : failure === "sound"
                  ? "The reply used an invalid narrated sound. Your draft is preserved."
                  : "Invalid request details";
          session.operation = {
            id: input.submissionId,
            kind: "turn",
            status: "interrupted",
            attemptId: "failed-attempt",
            stage: "turn-reply",
            error: message,
            input: {
              message: input.message,
              mode: input.mode,
              targetId: input.targetId,
              ...(input.contact ? { contact: input.contact } : {}),
            },
          };
          const detail = failure;
          failure = null;
          if (detail === "reads") {
            hideReads = true;
            setTimeout(() => {
              hideReads = false;
            }, 1000);
          }
          return fulfill(route, { status: detail === "halt" ? 409 : 400, json: { error: message } });
        }
        const beforeSuccess = structuredClone(session);
        session.lines.push(
          {
            id: "player-" + input.submissionId,
            role: "user",
            speakerId: "player",
            name: "You",
            kind: "input",
            content: input.message,
            at: now,
          },
          {
            id: "reply-" + input.submissionId,
            role: "assistant",
            speakerId: "mara",
            kind: "dialogue",
            name: "Mara",
            content: "I hear you.",
            at: now,
          },
        );
        session.submissions.push({ mode: "chat", id: input.submissionId });
        session.sceneRevision++;
        session.operation = null;
        if (loseSuccessResponse) {
          if (loseSuccessResponse === "delayed") {
            const completed = structuredClone(session);
            Object.assign(session, beforeSuccess);
            session.operation = {
              id: input.submissionId,
              kind: "turn",
              status: "running",
              stage: "turn-reply",
              attemptId: "late",
            };
            hideReads = true;
            setTimeout(() => {
              hideReads = false;
            }, 2800);
            setTimeout(() => {
              Object.assign(session, completed);
            }, 4500);
          }
          if (loseSuccessResponse === "late") staleRecovery = beforeSuccess;
          if (loseSuccessResponse === "operation") loseOperationRead = true;
          loseSuccessResponse = false;
          return abort(route, "failed");
        }
        value = { session, recordEvents: [] };
      }
      await fulfill(route, { status: 200, json: authorSceneResponse(value, snapshot.worldScope) });
    });
    await page.route("http://scene-send.test/", (route) =>
      fulfill(route, {
        status: 200,
        contentType: "text/html",
        body: `<style>:root{--background:#101726;--foreground:#f2f2f5;--popover:#202938;--border:#4d5870;--primary:#af91eb;--secondary:#303b50;--muted-foreground:#bac4d7}html,body{margin:0;height:100%;font-family:Arial}${tag}{display:block;height:100%}</style><${tag}></${tag}>`,
      }),
    );
    const load = async () => {
      await page.goto("http://scene-send.test/");
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    };
    const composer = page.getByRole("textbox", { name: "Message at The Mill" });
    const send = page.getByRole("button", { name: "Send", exact: true });
    {
      const mode = "contact";
      for (const edit of [false, true]) {
        for (const status of ["interrupted", "complete"]) {
          const message = `Saved ${mode} action`;
          const original = {
            message,
            mode,
            targetId: "mara",
            ...(mode === "contact"
              ? {
                  contact: {
                    kind: "call",
                    boundaryZoneId: "interior",
                  },
                }
              : {}),
          };
          session.operation = {
            id: `old-${mode}-${edit}-${status}`,
            kind: "turn",
            status,
            attemptId: "old-attempt",
            error: "Interrupted",
            input: original,
          };
          const before = turns.length;
          await load();
          await expect(composer).toHaveValue(message);
          await expect(page.getByText(/Saved Contact action/)).toBeVisible();
          assert.equal(turns.length, before, "restoration never sends a request");
          if (edit) await composer.fill(message + " changed");
          await expect(send).toBeDisabled();
          await page
            .getByRole("button", { name: edit ? "Replace with Say / Do" : "Retry original action", exact: true })
            .click();
          await expect.poll(() => turns.length).toBe(before + 1);
          const sent = turns.at(-1);
          assert.equal(sent.retryOfAttemptId, "old-attempt");
          if (edit) {
            assert.equal(sent.mode, "chat");
            assert.equal(sent.replaceOfOperationId, `old-${mode}-${edit}-${status}`);
            assert.equal(sent.targetId, "");
            assert.equal(sent.contact, undefined);
          } else {
            assert.equal(sent.mode, mode);
            assert.equal(sent.submissionId, `old-${mode}-${edit}-${status}`);
            assert.equal(sent.targetId, "mara");
            assert.deepEqual(sent.contact, original.contact);
          }
          const next = page.getByRole("button", { name: "Next paragraph", exact: true });
          await expect
            .poll(
              async () =>
                (await next.isEnabled()) || ((await composer.isVisible()) && (await composer.inputValue()) === ""),
            )
            .toBe(true);
          while (await next.isEnabled()) await next.click();
          await expect(composer).toHaveValue("");
        }
      }
    }
    session.operation = null;
    await load();
    await page.getByRole("button", { name: "Mode: Say / Do. Choose mode", exact: true }).click();
    await page.getByRole("menuitemradio", { name: "Move", exact: true }).click();
    const zoneSelect = page.getByLabel("Move to Zone", { exact: true });
    session.operation = {
      id: "held-before-move",
      kind: "turn",
      status: "complete",
      attemptId: "held-attempt",
      error: "Interrupted",
      input: {
        message: "Saved call before moving",
        mode: "contact",
        contact: { kind: "call", boundaryZoneId: "hall" },
      },
    };
    await zoneSelect.selectOption("hall");
    await expectSceneError(page, "Review the saved action before moving");
    assert.equal(zonePosts, 0, "movement does not replace an unbound legacy hold");
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(page.getByText(/Saved Contact action/)).toBeVisible();
    await expect(zoneSelect).toHaveCount(0);
    await expect(composer).toBeVisible();
    session.operation = null;
    await page.getByRole("button", { name: "Review latest saved action", exact: true }).click();
    await expect(zoneSelect).toBeEnabled();
    await page.getByRole("button", { name: "Mode: Move. Choose mode", exact: true }).click();
    await page.getByRole("menuitemradio", { name: "Say / Do", exact: true }).click();
    await composer.fill("My newer unsent draft");
    session.operation = {
      id: "held-old",
      kind: "turn",
      status: "interrupted",
      attemptId: "attempt-one",
      error: "Interrupted",
      input: {
        message: "Earlier saved call",
        mode: "contact",
        targetId: "mara",
        contact: { kind: "call", boundaryZoneId: "interior" },
      },
    };
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(page.getByText(/Saved Contact action/)).toBeVisible();
    await expect(composer).toHaveValue("My newer unsent draft");
    const beforeConflict = turns.length;
    session.operation = {
      ...session.operation,
      attemptId: "attempt-two",
      input: { ...session.operation.input, message: "A newer saved call" },
    };
    const legacyErrors = await openSceneErrors(page);
    await legacyErrors.getByRole("button", { name: "Retry original message", exact: true }).click();
    await closeSceneErrors(page);
    await expectSceneError(page, "The Scene changed during the request.");
    assert.equal(turns.length, beforeConflict, "a newer attempt is never retried silently");
    let releaseReview;
    holdReview = new Promise((resolve) => {
      releaseReview = resolve;
    });
    await page.getByRole("button", { name: "Review latest saved action", exact: true }).click();
    await expect(page.getByRole("button", { name: "Review latest saved action", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Retry original action", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Replace with Say / Do", exact: true })).toHaveCount(0);
    const blockedErrors = await openSceneErrors(page);
    await expect(blockedErrors.getByRole("button", { name: "Retry original message", exact: true })).toBeDisabled();
    await closeSceneErrors(page);
    releaseReview();
    await expect(page.getByText("A newer saved call", { exact: true })).toBeVisible();
    await expect(composer).toHaveValue("My newer unsent draft");
    session.operation = { ...session.operation, attemptId: "attempt-three" };
    await page.getByRole("button", { name: "Replace with Say / Do", exact: true }).click();
    await expectSceneError(page, "The Scene changed during the request.");
    assert.equal(turns.length, beforeConflict, "replacement never adopts a newer attempt");
    session.operation = null;
    await page.getByRole("button", { name: "Review latest saved action", exact: true }).click();
    await expect(page.getByRole("button", { name: "Retry original action", exact: true })).toHaveCount(0);
    await expect(composer).toHaveValue("My newer unsent draft");
    assert.equal(turns.length, beforeConflict, "reviewing a completed action does not send");
    session.operation = {
      id: "held-outcome",
      kind: "turn",
      status: "interrupted",
      attemptId: "outcome-attempt",
      error: "Interrupted",
      input: {
        message: "Older saved request",
        mode: "contact",
        targetId: "mara",
        contact: { kind: "call", boundaryZoneId: "interior" },
      },
    };
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(page.getByText(/Saved Contact action/)).toBeVisible();
    failure = "native-hold";
    await page.getByRole("button", { name: "Retry original action", exact: true }).click();
    await expect.poll(() => turns.length).toBe(beforeConflict + 1);
    await expect(composer).toHaveValue("My newer unsent draft");
    session.operation = null;
    turns.length = 0;
    await load();
    await expect(composer).toBeVisible();
    await composer.fill("First line");
    await composer.press("Enter");
    await expect(composer).toHaveValue("First line\n");
    assert.equal(turns.length, 0, "Enter is disabled by default");

    failure = "sound";
    await composer.fill("Original draft");
    await send.click();
    await expect(composer).toBeEnabled();
    await expect(composer).toHaveValue("Original draft");
    const failurePanel = await openSceneErrors(page);
    await expect(page.getByRole("button", { name: "1 Scene error", exact: true })).toBeVisible();
    await expect(failurePanel.getByRole("group")).toHaveCount(1);
    await expect(
      failurePanel.getByText("The AI described a sound the game couldn’t place in the Scene.", { exact: true }),
    ).toHaveCount(1);
    const failedMessage = failurePanel.getByRole("group", { name: "Message failed", exact: true });
    await expect(failedMessage.getByRole("button", { name: "Retry original message", exact: true })).toHaveCount(1);
    await expect(failedMessage).toContainText("The AI described a sound the game couldn’t place in the Scene.");
    await expect(failedMessage).not.toContainText("invalid narrated sound");
    await expect(failurePanel).not.toContainText("send-recovery");
    await failurePanel.getByRole("button", { name: "Copy details", exact: true }).click();
    await expect(failurePanel.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
    const copied = await page.evaluate(() => window.copiedSceneError);
    assert.match(copied, /Original error: The reply used an invalid narrated sound/u);
    assert.ok(copied.includes("Request: " + turns[0].submissionId));
    assert.match(copied, /Scene ID: send-recovery/u);
    assert.match(copied, /Attempt: failed-attempt\nStage: turn-reply\nStatus: interrupted/u);
    assert.match(copied, /Exact sound validation field: attentionWitnesses.segment/u);
    await page.screenshot({ path: `.build-tmp/scene-status/friendly-error-${mobile ? "mobile" : "desktop"}.png` });
    await closeSceneErrors(page);
    assert.equal(turns.length, 1, "no automatic resend");
    await expect(page.getByText("Original draft", { exact: true }).and(page.locator(":not(textarea)"))).toHaveCount(0);
    await composer.fill("Revised draft");
    await send.click();
    await expect(composer).toHaveValue("");
    await expect(composer).toBeEnabled();
    assert.equal(turns.length, 2);
    assert.equal(turns[1].replaceOfOperationId, turns[0].submissionId);
    assert.equal(turns[1].retryOfAttemptId, "failed-attempt");
    assert.notEqual(turns[1].submissionId, turns[0].submissionId);

    failure = "normal";
    await composer.fill("Same draft");
    await send.click();
    await expect(composer).toHaveValue("Same draft");
    await expect(composer).toBeEnabled();
    await page.waitForTimeout(1700);
    assert.equal(turns.length, 3, "recovery waits do not send");
    const retryPanel = await openSceneErrors(page);
    await retryPanel.getByRole("button", { name: "Retry original message", exact: true }).click();
    await expect(retryPanel).toHaveCount(0);
    const retryNext = page.getByRole("button", { name: "Next paragraph", exact: true });
    await expect
      .poll(
        async () =>
          (await retryNext.isEnabled()) || ((await composer.isVisible()) && (await composer.inputValue()) === ""),
      )
      .toBe(true);
    while (await retryNext.isEnabled()) await retryNext.click();
    await expect(composer).toHaveValue("");
    await expect(composer).toBeEnabled();
    assert.equal(turns[3].message, "Same draft");
    assert.equal(turns[3].submissionId, turns[2].submissionId);
    assert.equal(turns[3].retryOfAttemptId, "failed-attempt");

    // Reload restores the failed input, but later edits remain in the box.
    failure = "normal";
    await composer.fill("Reload draft");
    await send.click();
    await expectSceneError(page, "The request contains invalid details.");
    await expect(composer).toHaveValue("Reload draft");
    await expect(composer).toBeEnabled();
    await load();
    await expect(composer).toHaveValue("Reload draft");
    await composer.fill("Edited after reload");
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(composer).toHaveValue("Edited after reload");
    await send.click();
    await expect(composer).toHaveValue("");
    await expect(composer).toBeEnabled();

    failure = "reads";
    await composer.fill("Unreadable recovery draft");
    const beforeUnreadable = turns.length;
    await send.click();
    // The preflight is async while the composer still looks enabled. Wait for
    // the failed POST and its recovery UI before testing an explicit resend.
    await expect.poll(() => turns.length).toBe(beforeUnreadable + 1);
    await expectSceneError(page, "The request contains invalid details.");
    await expect(composer).toBeEnabled();
    await expect(composer).toHaveValue("Unreadable recovery draft");
    await expect(
      page.getByText("Unreadable recovery draft", { exact: true }).and(page.locator(":not(textarea)")),
    ).toHaveCount(0);
    await expect.poll(() => hideReads).toBe(false);
    await send.click();
    await expect(composer).toHaveValue("");
    await expect(composer).toBeEnabled();
    assert.equal(turns.at(-1).retryOfAttemptId, "failed-attempt");

    for (const lost of [true, "late", "operation", "delayed"]) {
      loseSuccessResponse = lost;
      const message = "Successful lost response " + lost;
      await composer.fill(message);
      const beforeLost = turns.length;
      await send.click();
      await expect.poll(() => turns.length).toBe(beforeLost + 1);
      if (lost === "delayed") {
        const chip = page.getByRole("button", { name: /^\d+ Scene errors?$/ });
        await expect(chip).toBeVisible();
        await expect(page.getByRole("button", { name: "Check saved reply", exact: true })).toHaveCount(0);
        const panel = await openSceneErrors(page);
        await expect(panel.getByRole("group", { name: "Reply connection interrupted", exact: true })).toBeVisible();
        const canvas = page.locator(`.${tag}-chat`);
        const screen = page.locator(`.${tag}-room-screen`);
        const canvasBox = await canvas.boundingBox();
        const screenBox = await screen.boundingBox();
        assert.ok(Math.abs(canvasBox.y - screenBox.y) < 2, "recovery never shifts the Scene canvas");
        const inputBox = await page.locator(`.${tag}-chat-vn`).boundingBox();
        assert.ok(
          inputBox.y + inputBox.height <= screenBox.y + screenBox.height + 1,
          "dialogue dock stays inside the visible Scene",
        );
        await page.screenshot({ path: `.build-tmp/scene-status/recovery-${mobile ? "mobile" : "desktop"}.png` });
        await expect(page.getByRole("button", { name: "Check saved reply", exact: true })).toHaveCount(0, {
          timeout: 12000,
        });
        await page.keyboard.press("Escape");
      }
      const next = page.getByRole("button", { name: "Next paragraph", exact: true });
      await expect
        .poll(
          async () =>
            (await next.isEnabled()) ||
            ((await composer.isVisible()) && (await composer.isEnabled()) && (await composer.inputValue()) === ""),
        )
        .toBe(true);
      while (await next.isEnabled()) await next.click();
      await expect(composer).toBeEnabled();
      await expect(composer).toHaveValue("");
      await expect(page.locator("." + tag + "-room-error")).toHaveCount(0);
      assert.equal(session.submissions.filter((entry) => entry.id === turns.at(-1).submissionId).length, 1);
      assert.equal(turns.length, beforeLost + 1, "recovery never resends a completed turn");
      loseOperationRead = false;
    }

    failure = "halt";
    const haltedDraft = "I advance the Village clock by two days.";
    await composer.fill(haltedDraft);
    await send.click();
    await expectSceneError(page, "Village time cannot be skipped through narration.");
    await expect(composer).toHaveValue(haltedDraft);
    await load();
    await expect(composer).toHaveValue(haltedDraft);
    await composer.fill("A newer unsent draft");
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(composer).toHaveValue("A newer unsent draft");
    session.operation = null;

    // Reach General settings with no active Scene, then verify persistence.
    active = false;
    await load();
    await page.getByRole("button", { name: "More", exact: true }).click();
    const toggle = page.getByRole("checkbox", { name: "Send on Enter", exact: true });
    await expect(toggle).not.toBeChecked();
    await toggle.check();
    await expect(toggle).toBeChecked();
    assert.deepEqual(settingsWrites.at(-1), { sendOnEnter: true });
    await load();
    await page.getByRole("button", { name: "More", exact: true }).click();
    await expect(toggle).toBeChecked();
    active = true;
    await load();
    await expect(composer).toBeVisible();
    await composer.fill("Enabled Enter");
    const beforeEnter = turns.length;
    await composer.press("Shift+Enter");
    await expect(composer).toHaveValue("Enabled Enter\n");
    assert.equal(turns.length, beforeEnter);
    await composer.evaluate((input) =>
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true })),
    );
    assert.equal(turns.length, beforeEnter, "IME composition does not send");
    await composer.press("Enter");
    await expect(composer).toHaveValue("");
    await expect(composer).toBeEnabled();
    assert.equal(turns.length, beforeEnter + 1);
    savedChangeRecovery = {
      submissionId: "semantic-failure",
      status: "held",
      at: now,
      reason: "The saved reply needs review.",
    };
    await load();
    await expect(composer).toBeVisible();
    await composer.fill("Keep this draft during recovery");
    const recoveryPanel = await openSceneErrors(page);
    await expect(recoveryPanel.getByRole("button", { name: "Replay", exact: true })).toBeVisible();
    await page.screenshot({ path: `.build-tmp/scene-status/native-replay-${mobile ? "mobile" : "desktop"}.png` });
    await recoveryPanel.getByRole("button", { name: "Replay", exact: true }).click();
    await expect(recoveryPanel).toHaveCount(0);
    await expect(send).toBeEnabled();
    await expect(composer).toHaveValue("Keep this draft during recovery");
    assert.equal(replays, 1, "Replay is an explicit local request, never an automatic model retry");
    session.operation = null;
    session.currentTime = "Monday, 2 November · 09:57";
    await load();
    await expect(page.locator(`.${tag}-room-time`)).toHaveText(session.currentTime);
    const liveNext = page.getByRole("button", { name: "Next paragraph", exact: true });
    while (await liveNext.isEnabled()) await liveNext.click();
    await page.screenshot({ path: `.build-tmp/scene-status/live-initial-${mobile ? "mobile" : "desktop"}.png` });
    await composer.fill("Mara, dinner tomorrow sounds good.");
    const beforeLiveSend = turns.length;
    const acceptedBefore = session.submissions.length;
    liveStale = true;
    await send.click();
    await expect(page.locator(`.${tag}-room-time`)).toHaveText("Monday, 2 November · 11:57");
    while (await liveNext.isEnabled()) await liveNext.click();
    await expect(composer).toHaveValue("Mara, dinner tomorrow sounds good.");
    await expect(send).toBeEnabled();
    await expect(page.locator(`.${tag}-room-time`)).toHaveText("Monday, 2 November · 11:57");
    assert.equal(turns.length, beforeLiveSend + 1, "an audience change never automatically resends");
    assert.equal(session.submissions.length, acceptedBefore, "the stale input never becomes accepted dialogue");
    await page.screenshot({ path: `.build-tmp/scene-status/live-stale-${mobile ? "mobile" : "desktop"}.png` });
    await composer.fill("Hello Eli.");
    await send.click();
    await expect(composer).toHaveValue("");
    assert.equal(turns.at(-1).expectedSceneRevision, session.sceneRevision - 1);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Scene send recovery: detailed failures, editable drafts, explicit resends, reloads, lost responses and Enter settings passed on desktop and mobile.",
  );
});
