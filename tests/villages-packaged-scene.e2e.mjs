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
      assert.equal(response.statusCode, 200, `${request.method()} ${url.pathname}: ${response.body}`);
      await fulfill(route, { status: response.statusCode, headers: response.headers, body: response.rawPayload });
    });
    const page = await context.newPage();
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const composer = page.getByRole("textbox", { name: "Message at The Mill" });
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
    server.model.chatComplete = async () => ({
      content: JSON.stringify({
        segments:
          ++retries === 1
            ? [{ kind: "dialogue", speakerId: "mara", text: "Good to see you by the window." }]
            : [
                { kind: "narration", text: "Rain patters on the mill roof." },
                { kind: "dialogue", speakerId: "mara", text: "Let's wait for the shower to pass." },
              ],
      }),
      finishReason: "stop",
    });
    await composer.fill("Keep this unsent draft");
    await page.getByRole("button", { name: "Retry reply", exact: true }).click();
    await expect(page.getByText("Good to see you by the window.", { exact: true })).toBeVisible();
    await expect(composer).toHaveValue("Keep this unsent draft");
    await expect(page.getByText("Hello there.", { exact: true })).toHaveCount(0);
    assert.equal(retries, 1);

    const phone = await context.newPage();
    await phone.setViewportSize({ width: 390, height: 844 });
    await phone.goto("http://villages.test/");
    await phone.addScriptTag({ path: resolve("packages/villages/client.js") });
    const retryReply = phone.getByRole("button", { name: "Retry reply", exact: true });
    await expect(retryReply).toBeInViewport();
    await retryReply.click();
    await expect(phone.getByText("Let's wait for the shower to pass.", { exact: true })).toBeVisible();
    await expect(phone.getByText("Good to see you by the window.", { exact: true })).toHaveCount(0);
    assert.equal(retries, 2);
  });
});
console.log("Packaged browser send, persistence, replay, reload and desktop/phone Retry passed.");
