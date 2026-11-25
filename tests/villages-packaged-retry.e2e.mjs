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
const server = await packagedSceneServer({
  configureScene(scene) {
    scene.zoneId = "exterior";
    scene.activeIds = [];
  },
});
const entrance = (await server.app.inject({ method: "GET", url: "/api/villages/rooms/active" })).json().session;
const moved = await server.app.inject({
  method: "POST",
  url: "/api/villages/rooms/zone",
  payload: {
    sessionId: entrance.id,
    zoneId: "common",
    operationId: "retry-test-arrival",
    expectedSceneRevision: entrance.sceneRevision,
  },
});
assert.equal(moved.statusCode, 200, moved.body);
assert.ok(moved.json().session.zoneArrivalId, "The saved Scene retains an actual Move before an ordinary reply");
assert.equal(server.calls(), 0, "Arrival does not purchase narration");
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
      const expectedStatus = url.pathname.endsWith("/rooms/browser/recovery")
        ? 404
        : failedRetryExpected && url.pathname.endsWith("/rooms/turn")
          ? 500
          : 200;
      assert.equal(response.statusCode, expectedStatus, `${request.method()} ${url.pathname}: ${response.body}`);
      await fulfill(route, { status: response.statusCode, headers: response.headers, body: response.rawPayload });
    });
    const page = await context.newPage();
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const composer = page.getByRole("textbox", { name: "Message at The Mill" });
    const desktopRetry = page.getByRole("menuitem", { name: "Retry Turn", exact: true });
    await page.getByRole("button", { name: "Venue actions" }).click();
    await expect(desktopRetry).toBeVisible();
    await expect(desktopRetry).toBeDisabled();
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
        if ((await next.isVisible()) && (await next.count()) > 0 && (await next.isEnabled())) await next.click();
        return page.locator("marinara-capability-villages").textContent();
      })
      .toContain("Hello there.");
    assert.equal(server.calls(), 1, "reload restores saved output without dispatch");

    let attempts = 0;
    server.model.chatComplete = async () => {
      attempts++;
      if (attempts === 1) throw Error("Fixture provider disconnected");
      return {
        content: JSON.stringify({
          segments: [{ kind: "dialogue", speakerId: "mara", text: "Let's wait for the shower to pass." }],
        }),
        finishReason: "stop",
      };
    };
    const phone = await context.newPage();
    await phone.setViewportSize({ width: 390, height: 844 });
    await phone.emulateMedia({ reducedMotion: "reduce" });
    await phone.goto("http://villages.test/");
    await phone.addScriptTag({ path: resolve("packages/villages/client.js") });
    const phoneComposer = phone.getByRole("textbox", { name: "Message at The Mill" });
    await expect(phoneComposer).toBeVisible();
    await phoneComposer.fill("Should we wait for the rain?");
    failedRetryExpected = true;
    await phone.getByRole("button", { name: "Send", exact: true }).click();
    const sceneError = phone.getByRole("button", { name: /Scene errors?/ });
    await sceneError.click();
    const retry = phone.getByRole("button", { name: "Retry", exact: true });
    await expect(retry).toBeEnabled();
    await expect(phoneComposer).toHaveValue("Should we wait for the rain?");
    assert.equal(attempts, 1);
    const failed = turns.at(-1).input;
    assert(!server.scene().lines.some((line) => line.inputOf === failed.submissionId));
    const failedScene = server.records.get(saved.id).data;
    assert.deepEqual(failedScene.operation.checkpoints, {});
    assert.deepEqual(failedScene.operation.attempts, {});
    assert.equal(failedScene.operation.snapshot, null);
    const receipts = () => [...server.records.keys()].filter((key) => key.startsWith("villages-generation-response-"));
    assert.deepEqual(receipts(), []);
    await phone.reload();
    await phone.addScriptTag({ path: resolve("packages/villages/client.js") });
    await sceneError.click();
    await expect(retry).toBeEnabled();
    assert.equal(attempts, 1, "reload does not retry a paid reply");
    failedRetryExpected = false;
    await retry.click();
    await expect(phone.getByRole("region", { name: "Current paragraph" })).toContainText(
      "Let's wait for the shower to pass.",
    );
    await expect(retry).toHaveCount(0);
    assert.equal(attempts, 2);
    const retried = turns.at(-1).input;
    assert.notEqual(retried.submissionId, failed.submissionId);
    assert.equal(retried.replaceOfOperationId, failed.submissionId);
    assert.equal(retried.message, failed.message);
    assert.equal(server.scene().lines.filter((line) => line.content === failed.message).length, 1);
    assert.deepEqual(receipts(), []);
    const active = await server.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    assert.equal(active.json().session.retryReply, undefined);
  });
});
console.log("Packaged browser send, duplicate acknowledgment, reload and failed-reply Retry passed.");
