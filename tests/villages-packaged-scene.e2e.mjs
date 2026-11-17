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
    let rejectFirstReply = false;
    const complete = server.model.chatComplete;
    server.model.chatComplete = (...args) => {
      if (!rejectFirstReply) return complete(...args);
      rejectFirstReply = false;
      return {
        finishReason: "stop",
        content: JSON.stringify({
          input: [{ kind: "speech", text: "Unsupported inventory" }],
          segments: [{ kind: "dialogue", speakerId: "mara", text: "Retired reply shape." }],
        }),
      };
    };
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
      if (response.statusCode !== 200)
        assert(
          (url.pathname.endsWith("/rooms/turn") && server.scene().submissions.at(-1)?.acceptance.status === "held") ||
            (url.pathname.endsWith("/rooms/browser/recovery") && response.json().error === "That Scene is not closed."),
          `${request.method()} ${url.pathname}: ${response.body}`,
        );
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
    const send = page.getByRole("button", { name: "Send", exact: true });
    for (const edit of [false, true]) {
      rejectFirstReply = true;
      const original = "An ordinary line " + edit;
      const beforeHold = turns.length;
      await composer.fill(original);
      await send.click();
      await expect.poll(() => turns.length).toBe(beforeHold + 1);
      await expect.poll(() => server.scene().submissions.at(-1)?.acceptance.status).toBe("held");
      const held = turns.at(-1).input.submissionId;
      await expect(composer).toHaveValue(original);
      const chip = page.getByRole("button", { name: /^\d+ Scene errors?$/ });
      await expect(chip).toHaveCount(1);
      await expect(chip).toHaveAccessibleName("1 Scene error");
      if (edit) await composer.fill(original + " with edits");
      await send.click();
      await expect.poll(() => server.scene().submissions.at(-1)?.acceptance.status).toBe("applied");
      assert.equal(turns.at(-1).input.replaceOfOperationId, held);
      assert.equal(turns.at(-1).input.message, edit ? original + " with edits" : original);
      assert.equal(server.scene().submissions.find((row) => row.id === held).acceptance.status, "abandoned");
      await expect
        .poll(async () => {
          const next = page.getByRole("button", { name: "Next paragraph", exact: true });
          if ((await next.isVisible()) && (await next.isEnabled())) await next.click();
          return composer.isVisible();
        })
        .toBe(true);
      await expect(composer).toHaveValue("");
    }
    assert.equal(server.calls(), 3, "each deliberate replacement makes one request");
  });
});
console.log("Packaged browser send, native persistence, replay and reload passed.");
