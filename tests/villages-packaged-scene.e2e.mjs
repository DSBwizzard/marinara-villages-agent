import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import AdmZip from "adm-zip";
import { build } from "../scripts/esbuild.mjs";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";

const receipt = JSON.parse(await readFile(".build-tmp/package-build.json", "utf8"));
const archive = new AdmZip(receipt.retainedArchivePath);
for (const file of ["server.mjs", "client.js"]) {
  assert.deepEqual(
    archive
      .getEntries()
      .find((entry) => entry.entryName === file)
      .getData(),
    await readFile("packages/villages/" + file),
  );
}
await mkdir(".build-tmp", { recursive: true });
const entry = resolve(".build-tmp/packaged-scene-server.mjs");
const bundle = await build({
  entryPoints: ["tests/fixtures/packaged-scene-server.fixture.ts"],
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
  packages: "external",
});
await writeFile(entry, bundle.outputFiles[0].contents);
const { packagedSceneServer } = await import(pathToFileURL(entry).href);
const server = await packagedSceneServer();
await withBrowser({ close: server.stop }, async () => {
  const browser = await chromium.launch({ headless: true });
  await withBrowser(browser, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await mockEngineLookups(context);
    await context.route("http://villages.test/", (route) =>
      fulfill(route, {
        contentType: "text/html",
        body: "<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7;--secondary:#384253}html,body{margin:0;height:100%;font:16px Arial}marinara-capability-villages{display:block;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    const turns = [];
    let failedRetryExpected = false;
    await context.route("**/api/villages**", async (route) => {
      const request = route.request(),
        url = new URL(request.url());
      const payload = request.postDataBuffer();
      const response = await server.app.inject({
        method: request.method(),
        url: url.pathname + url.search,
        headers: request.headers(),
        ...(payload ? { payload } : {}),
      });
      if (url.pathname.endsWith("/rooms/turn")) turns.push({ input: request.postDataJSON(), response });
      const expectedStatus = failedRetryExpected && url.pathname.endsWith("/rooms/retry") ? 500 : 200;
      assert.equal(response.statusCode, expectedStatus, `${request.method()} ${url.pathname}: ${response.body}`);
      await fulfill(route, { status: response.statusCode, headers: response.headers, body: response.rawPayload });
    });
    const page = await context.newPage();
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const composer = page.getByRole("textbox", { name: "Message at The Mill" });
    const desktopRetry = page.getByRole("button", { name: "Retry reply", exact: true });
    await expect(desktopRetry).toBeVisible();
    await expect(desktopRetry).toBeDisabled();
    const checkRetryPlacement = async (page, button) => {
      const card = page.locator(".marinara-capability-villages-chat-vn-card");
      const speakerRow = card.locator(".marinara-capability-villages-scene-speaker-row");
      const [control, dialogue, row] = await Promise.all([
        button.boundingBox(),
        card.boundingBox(),
        speakerRow.boundingBox(),
      ]);
      assert.ok(control && dialogue && row);
      assert.ok(control.y >= dialogue.y && control.y + control.height <= dialogue.y + dialogue.height);
      assert.ok(Math.abs(control.x + control.width - row.x - row.width) <= 2, "Retry trails the speaker row");
      assert.ok(Math.abs(control.y + control.height / 2 - row.y - row.height / 2) <= 2);
      assert.ok(control.width <= 64, "Retry has a compact label");
      await expect(button).toHaveText("Retry");
      await expect(button).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(button.locator("svg path")).toHaveCount((await button.isDisabled()) ? 2 : 1);
    };
    await checkRetryPlacement(page, desktopRetry);
    await expect(composer).toBeVisible();
    await composer.fill("Hello from browser");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect.poll(() => turns.length).toBe(1);
    assert.equal(server.calls(), 1, "one combined GM response");
    assert(server.scene().lines.some((line) => line.speakerId === "mara" && line.content === "Hello there."));
    const saved = structuredClone(server.records.get("villages-venue-visit-browser"));
    const replay = await server.app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: turns[0].input,
    });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.equal(server.calls(), 1, "replaying the actual browser submission buys no new model request");
    for (const field of ["transcript", "submissionHistory", "sceneRevision"]) {
      assert.deepEqual(
        server.records.get(saved.id).data[field],
        saved.data[field],
        "replay preserves saved content and its revision",
      );
    }
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await expect
      .poll(async () => {
        const next = page.getByRole("button", { name: "Next paragraph", exact: true });
        if ((await next.isVisible()) && (await next.isEnabled())) await next.click();
        return page.locator("marinara-capability-villages").textContent();
      })
      .toContain("Hello there.");
    assert.equal(server.calls(), 1, "reload restores saved output without dispatch");

    let retries = 0;
    const firstRetry = Promise.withResolvers();
    const firstReply =
      "Good to see you by the window. I just set out a fresh pot of tea, and there is an extra cup on the bench.";
    server.model.chatComplete = async () => {
      const attempt = ++retries;
      if (attempt === 1) await firstRetry.promise;
      if (attempt === 3) throw Error("fixture provider disconnected");
      return {
        content: JSON.stringify({
          segments:
            attempt === 1
              ? [{ kind: "dialogue", speakerId: "mara", text: firstReply, delivery: "normal", textNote: "" }]
              : attempt === 2
                ? [
                    { kind: "narration", text: "Rain patters on the mill roof." },
                    { kind: "dialogue", speakerId: "mara", text: "Let's wait for the shower to pass." },
                  ]
                : [
                    { kind: "narration", text: "The rain eases over the mill." },
                    ...Array.from({ length: 23 }, (_, index) => ({
                      kind: "narration",
                      text: `Passage ${index + 1}. ${"霧".repeat(1900)}`,
                    })),
                  ],
        }),
        finishReason: "stop",
      };
    };
    await composer.fill("Keep this unsent draft");
    const current = page.getByRole("region", { name: "Current paragraph" });
    await expect(desktopRetry).toBeEnabled();
    await checkRetryPlacement(page, desktopRetry);
    try {
      await desktopRetry.click();
      await expect(current).toHaveText("Retrying reply…");
      await expect(desktopRetry).toBeDisabled();
      await expect(page.locator(".marinara-capability-villages-scene-reply-actions button")).toHaveCount(1);
      await expect(desktopRetry).toHaveText("Retry");
      await expect(page.getByText("Hello there.", { exact: true })).toHaveCount(0);
    } finally {
      firstRetry.resolve();
    }
    await expect(current).toHaveAttribute("aria-busy", "true");
    await page.getByRole("button", { name: "Next paragraph", exact: true }).click();
    await expect(current).toHaveText(firstReply);
    await expect(composer).toHaveValue("Keep this unsent draft");
    assert.equal(retries, 1);

    const phone = await context.newPage();
    await phone.setViewportSize({ width: 390, height: 844 });
    await phone.emulateMedia({ reducedMotion: "reduce" });
    await phone.goto("http://villages.test/");
    await phone.addScriptTag({ path: resolve("packages/villages/client.js") });
    const retryReply = phone.getByRole("button", { name: "Retry reply", exact: true });
    const phoneCurrent = phone.getByRole("region", { name: "Current paragraph" });
    const phoneNext = phone.getByRole("button", { name: "Next paragraph", exact: true });
    await expect
      .poll(async () => {
        if (await retryReply.isEnabled()) return true;
        if ((await phoneNext.isVisible()) && (await phoneNext.isEnabled())) await phoneNext.click();
        return retryReply.isEnabled();
      })
      .toBe(true);
    await expect(retryReply).toBeInViewport();
    await checkRetryPlacement(phone, retryReply);
    assert.equal((await retryReply.boundingBox()).height, 44);
    await retryReply.click();
    await expect(phoneCurrent).toHaveText("Rain patters on the mill roof.");
    await expect(retryReply).toBeVisible();
    await expect(retryReply).toBeDisabled();
    await checkRetryPlacement(phone, retryReply);
    await expect(phoneCurrent).toHaveAttribute("aria-busy", "false");
    await phoneNext.click();
    await expect(phoneCurrent).toHaveText("Let's wait for the shower to pass.");
    assert.equal(retries, 2);

    const phoneComposer = phone.getByRole("textbox", { name: "Message at The Mill" });
    await phoneComposer.fill("Keep talking after a failed retry");
    failedRetryExpected = true;
    await retryReply.click();
    await expect(retryReply).toBeEnabled();
    failedRetryExpected = false;
    await expect(phoneCurrent).toHaveText("Let's wait for the shower to pass.");
    await expect(phone.getByRole("button", { name: "Send", exact: true })).toBeEnabled();
    await expect(phone.locator(".marinara-capability-villages-scene-reply-actions button")).toHaveCount(1);
    await expect(retryReply).toHaveText("Retry");
    assert.equal(retries, 3);
    await phone.reload();
    await phone.addScriptTag({ path: resolve("packages/villages/client.js") });
    await expect
      .poll(async () => {
        if (await retryReply.isEnabled()) return true;
        if ((await phoneNext.isVisible()) && (await phoneNext.isEnabled())) await phoneNext.click();
        return retryReply.isEnabled();
      })
      .toBe(true);
    await retryReply.click();
    await expect(phoneCurrent).toHaveText("The rain eases over the mill.");
    assert.equal(retries, 4);
    const active = await server.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    const { session } = active.json();
    assert.ok(session.retryStart, "the retried reply has a public reading anchor");
    assert.ok(
      session.retryStart.index < session.playback.moments[0].index,
      "the reader found the start of the replacement outside the latest playback window",
    );
  });
});
console.log("Packaged browser send, persistence, replay, reload and desktop/phone Retry passed.");
