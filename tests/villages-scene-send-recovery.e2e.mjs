import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot, residents, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const tag = "marinara-capability-villages";
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
try {
  for (const mobile of [false, true]) {
    const page = await browser.newPage({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      hasTouch: mobile,
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const fixture = structuredClone(snapshot);
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
    let active = true;
    let failure = null;
    let loseSuccessResponse = false;
    let hideReads = false;
    const turns = [];
    const settingsWrites = [];
    await page.route("**/api/villages**", async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      let value = fixture;
      if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) {
        if (hideReads) return route.fulfill({ status: 503, json: { error: "Read unavailable" } });
        value = { session: active ? session : null };
      } else if (/\/rooms\/[^/]+\/operations?/.test(path)) {
        if (hideReads) return route.fulfill({ status: 503, json: { error: "Read unavailable" } });
        value = { operation: session.operation };
      } else if (path.includes("/rooms/archive/")) {
        if (hideReads) return route.fulfill({ status: 503, json: { error: "Read unavailable" } });
        value = { visit: session };
      } else if (path.endsWith("/interpretation-settings")) {
        value = { settings: { decisionsEnabled: false, compareSystem: true }, status: { available: false } };
      } else if (path.includes("/interpretation-diagnostics/")) value = { checks: [] };
      else if (path.endsWith("/settings") && request.method() === "PATCH") {
        const input = request.postDataJSON();
        settingsWrites.push(input);
        Object.assign(fixture.settings, input);
        value = fixture;
      } else if (path.endsWith("/rooms/turn")) {
        const input = request.postDataJSON();
        turns.push(input);
        if (failure) {
          session.operation = {
            id: input.submissionId,
            kind: "turn",
            status: "interrupted",
            attemptId: "failed-attempt",
            stage: "turn-reply",
            error: "Invalid request details",
            input: { message: input.message, mode: input.mode, targetId: input.targetId },
          };
          const detail = failure;
          failure = null;
          if (detail === "reads") {
            hideReads = true;
            setTimeout(() => {
              hideReads = false;
            }, 1000);
          }
          return route.fulfill({ status: 400, json: { error: "Bad Request", message: "Invalid request details" } });
        }
        session.lines.push(
          { id: "player-" + turns.length, role: "user", speakerId: "", name: "", content: input.message, at: now },
          {
            id: "reply-" + turns.length,
            role: "assistant",
            speakerId: "mara",
            kind: "dialogue",
            name: "Mara",
            content: "I hear you.",
            at: now,
          },
        );
        session.submissions.push({ id: input.submissionId });
        session.sceneRevision++;
        session.operation = null;
        if (loseSuccessResponse) {
          loseSuccessResponse = false;
          return route.abort("failed");
        }
        value = { session, recordEvents: [] };
      }
      await route.fulfill({ status: 200, json: value });
    });
    await page.route("http://scene-send.test/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `<style>:root{--background:#101726;--foreground:#f2f2f5;--popover:#202938;--border:#4d5870;--primary:#af91eb;--secondary:#303b50;--muted-foreground:#bac4d7}html,body{margin:0;height:100%;font-family:Arial}${tag}{display:block;height:100%}</style><${tag}></${tag}>`,
      }),
    );
    const load = async () => {
      await page.goto("http://scene-send.test/");
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    };
    await load();
    const composer = page.getByRole("textbox", { name: "Message at The Mill" });
    const send = page.getByRole("button", { name: "Send", exact: true });
    await expect(composer).toBeVisible();
    await composer.fill("First line");
    await composer.press("Enter");
    await expect(composer).toHaveValue("First line\n");
    assert.equal(turns.length, 0, "Enter is disabled by default");

    failure = "normal";
    await composer.fill("Original draft");
    await send.click();
    await expect(composer).toBeEnabled();
    await expect(composer).toHaveValue("Original draft");
    await expect(page.locator(`.${tag}-room-error`).filter({ hasText: "Invalid request details" })).toContainText(
      "Invalid request details",
    );
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
    await send.click();
    await expect(composer).toHaveValue("");
    await expect(composer).toBeEnabled();
    assert.equal(turns[3].submissionId, turns[2].submissionId);
    assert.equal(turns[3].retryOfAttemptId, "failed-attempt");

    // Reload restores the failed input, but later edits remain in the box.
    failure = "normal";
    await composer.fill("Reload draft");
    await send.click();
    await expect(page.locator(`.${tag}-room-error`).filter({ hasText: "Invalid request details" })).toContainText(
      "Invalid request details",
    );
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
    await expect(page.locator("." + tag + "-room-error")).toContainText("Invalid request details");
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

    loseSuccessResponse = true;
    await composer.fill("Successful lost response");
    await send.click();
    await expect(composer).toHaveValue("");
    await expect(composer).toBeEnabled();
    assert.equal(session.submissions.filter((entry) => entry.id === turns.at(-1).submissionId).length, 1);

    // Reach General settings with no active Scene, then verify persistence.
    active = false;
    await load();
    await page.getByRole("button", { name: mobile ? "More" : "Open settings menu", exact: true }).click();
    await page.getByRole("button", { name: "General settings", exact: true }).click();
    const toggle = page.getByRole("checkbox", { name: "Send on Enter", exact: true });
    await expect(toggle).not.toBeChecked();
    await toggle.check();
    await expect(toggle).toBeChecked();
    assert.deepEqual(settingsWrites.at(-1), { sendOnEnter: true });
    await load();
    await page.getByRole("button", { name: mobile ? "More" : "Open settings menu", exact: true }).click();
    await page.getByRole("button", { name: "General settings", exact: true }).click();
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
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Scene send recovery: detailed failures, editable drafts, explicit resends, reloads, lost responses and Enter settings passed on desktop and mobile.",
  );
} finally {
  await browser.close();
}
