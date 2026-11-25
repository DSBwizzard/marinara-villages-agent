import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import AdmZip from "adm-zip";
import { build } from "../scripts/esbuild.mjs";
import { abort, chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";

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
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.sceneReport = text;
          },
        },
      });
    });
    await context.route("http://villages.test/", (route) =>
      fulfill(route, {
        contentType: "text/html",
        body: "<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7;--secondary:#384253}html,body{margin:0;height:100%;font:16px Arial}marinara-capability-villages{display:block;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    const turns = [];
    let rejectFirstReply;
    let dropFailedResponse = false;
    const complete = server.model.chatComplete;
    server.model.chatComplete = (...args) => {
      if (!rejectFirstReply) return complete(...args);
      const rejected = rejectFirstReply;
      rejectFirstReply = undefined;
      if (rejected === "json")
        return {
          finishReason: "stop",
          content: '[unadmitted]: Private parser text.\n[keep]: {"text":"Private replacement"',
        };
      if (rejected === "format")
        return {
          finishReason: "stop",
          content:
            '[!mara]: Private model narration.\n[keep]: {"id":"private-effect-id","for":["mara"],"class":"information","text":"Private continuity note","source":99}',
        };
      if (rejected === "continuity")
        return {
          finishReason: "stop",
          content: JSON.stringify({
            segments: [
              {
                kind: "dialogue",
                speakerId: "mara",
                text: "Private fixture dialogue.",
                requires: ["private-attitude-id"],
              },
            ],
            keep: [
              {
                id: "private-attitude-id",
                class: "perspective",
                current: true,
                for: ["mara"],
                owner: "mara",
                about: ["player"],
                text: "Private relationship note.",
                relationship: { impact: "turning-negative" },
                source: [{ segment: 1, perceive: { kind: "seen", by: ["mara"] } }],
              },
              { for: ["room"], class: "experience", text: "Private room note.", source: [{ segment: 1 }] },
            ],
          }),
        };
      return {
        finishReason: "stop",
        content: JSON.stringify({
          segments: [
            {
              kind: "dialogue",
              speakerId: "mara",
              text: "Private model narration.",
            },
          ],
          input: [{ kind: "speech", text: "Unsupported inventory" }],
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
      if (url.pathname.endsWith("/rooms/turn")) {
        turns.push({ input: request.postDataJSON(), response });
        if (dropFailedResponse) {
          dropFailedResponse = false;
          assert.equal(response.statusCode, 502, response.body);
          assert.equal(server.scene().submissions.at(-1)?.acceptance.status, "abandoned");
          return abort(route);
        }
      }
      if (response.statusCode !== 200)
        assert(
          (url.pathname.endsWith("/rooms/turn") &&
            (response.statusCode === 502 || response.json().code === "SCENE_MESSAGE_TOO_LONG")) ||
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
        if ((await next.isVisible()) && (await next.count()) > 0 && (await next.isEnabled())) await next.click();
        return page.locator("marinara-capability-villages").textContent();
      })
      .toContain("Hello there.");
    assert.equal(server.calls(), 1, "reload restores saved output without dispatch");
    const send = page.getByRole("button", { name: "Send", exact: true });
    for (const edit of [false, true]) {
      rejectFirstReply = edit ? "format" : "legacy";
      const original = "An ordinary line " + edit;
      const beforeFailure = turns.length;
      await composer.fill(original);
      await send.click();
      await expect.poll(() => turns.length).toBe(beforeFailure + 1);
      const failed = turns.at(-1).input.submissionId;
      const failedTurn = () => server.scene().submissions.find((row) => row.id === failed);
      assert.equal(turns.at(-1).response.statusCode, 502);
      assert.notEqual(failedTurn()?.acceptance.status, "applied");
      assert.equal(failedTurn()?.narration, undefined);
      await expect(composer).toHaveValue(original);
      const chip = page.getByRole("button", { name: /^\d+ Scene errors?$/ });
      await expect(chip).toHaveCount(1);
      await expect(chip).toHaveAccessibleName("1 Scene error");
      if (edit) {
        await chip.click();
        await expect(page.getByRole("button", { name: "Replay", exact: true })).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Retry", exact: true })).toHaveCount(0);
        await page.getByRole("button", { name: "Copy Discord report", exact: true }).click();
        await expect(page.getByText("Anonymous report copied.")).toBeVisible();
        const report = await page.evaluate(() => window.sceneReport);
        assert.match(report, /Server build: [a-f0-9]{16}/);
        assert.match(report, /Result: HTTP 502/);
        assert.match(report, /Cause: invalid_reply\nPhase: reply validation/);
        assert.match(report, /Validator: invalid_type at source \(expected array\)/);
        assert.match(report, /parse complete.*finish stop.*token output limit/);
        assert.doesNotMatch(report, /reply held|writing-completion/);
        assert(!report.includes(failed));
        assert.doesNotMatch(
          report,
          /Private model narration|Private continuity note|private malformed reference|private-effect-id|An ordinary line|Mara|The Mill/iu,
        );
        await page.getByRole("button", { name: "Close Scene errors", exact: true }).click();
        await composer.fill(original + " with edits");
      }
      await send.click();
      await expect.poll(() => turns.length).toBe(beforeFailure + 2);
      await expect.poll(() => server.scene().submissions.at(-1)?.id).toBe(turns.at(-1).input.submissionId);
      assert.equal(server.scene().submissions.at(-1)?.acceptance.status, "applied");
      assert.equal(turns.at(-1).input.replaceOfOperationId, failed);
      assert.equal(turns.at(-1).input.message, edit ? original + " with edits" : original);
      assert.notEqual(failedTurn()?.acceptance.status, "applied");
      await expect
        .poll(async () => {
          const next = page.getByRole("button", { name: "Next paragraph", exact: true });
          if ((await next.isVisible()) && (await next.count()) > 0 && (await next.isEnabled())) await next.click();
          return composer.isVisible();
        })
        .toBe(true);
      await expect(composer).toHaveValue("");
    }
    assert.equal(server.calls(), 3, "each deliberate replacement makes one request");
    const receipt = await server.app.inject({
      method: "GET",
      url: "/api/villages/rooms/browser/operations/" + turns[0].input.submissionId,
    });
    assert.equal(receipt.statusCode, 200, receipt.body);
    assert.equal(receipt.json().operation.submittedMessage, turns[0].input.message);
    assert.equal(receipt.json().operation.committed, true);
    const oversized = "Private story text. ".repeat(220);
    await composer.fill(oversized);
    await send.click();
    await expect(page.getByRole("button", { name: "1 Scene error", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "1 Scene error", exact: true }).click();
    await page.getByRole("button", { name: "Copy Discord report", exact: true }).click();
    await expect(page.getByText("Anonymous report copied.")).toBeVisible();
    const report = await page.evaluate(() => window.sceneReport);
    assert.match(report, /Villages Scene error trace · \d+\.\d+\.\d+/);
    assert.match(
      report,
      /Send message\nRequest: POST \/api\/villages\/rooms\/turn\nResult: HTTP 400 · SCENE_MESSAGE_TOO_LONG/,
    );
    assert.match(report, /Cause: A line can be at most 4000 characters\./);
    assert.match(report, /Stage: input validation, before model dispatch/);
    assert.doesNotMatch(report, /Private story text|The Mill|Mara|Original error|Scene ID/);
    await expect(composer).toHaveValue(oversized);
    assert.equal(server.calls(), 3, "the repeatable error occurs before buying another reply");
    await page.getByRole("button", { name: "Close Scene errors", exact: true }).click();
    await composer.fill("I knock the cup to the floor.");
    rejectFirstReply = "continuity";
    dropFailedResponse = true;
    await send.click();
    await expect(composer).toHaveValue("I knock the cup to the floor.");
    await expect(send).toBeEnabled();
    const chip = page.getByRole("button", { name: /^\d+ Scene errors?$/ });
    await expect(chip).toHaveAccessibleName("1 Scene error");
    await chip.click();
    await expect(page.getByRole("button", { name: "Retry", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Copy Discord report", exact: true }).click();
    await expect(page.getByText("Anonymous report copied.")).toBeVisible();
    const droppedReport = await page.evaluate(() => window.sceneReport);
    assert.match(droppedReport, /Result: No HTTP response · NETWORK_ERROR/);
    assert.match(droppedReport, /Validator: room_target_in_actor_memory at for/);
    assert.doesNotMatch(droppedReport, /reply held|writing-completion/);
    assert(!droppedReport.includes(turns.at(-1).input.submissionId));
    assert.doesNotMatch(droppedReport, /Private |private-attitude-id|knock the cup|Mara|The Mill/i);
    await page.getByRole("button", { name: "Close Scene errors", exact: true }).click();
    const draft = "Private draft for JSON failure.";
    await composer.fill(draft);
    rejectFirstReply = "json";
    const nextTurn = turns.length + 1;
    await send.click();
    await expect.poll(() => turns.length).toBe(nextTurn);
    const malformed = turns.at(-1);
    assert.equal(malformed.response.statusCode, 502);
    assert.equal(malformed.response.json().sceneFailure.failureCause, "invalid_reply");
    assert.equal(server.scene().operation.failure.responseDiagnostics.parseStatus, "invalid");
    assert.doesNotMatch(JSON.stringify(server.scene().operation), /Private parser text|Private replacement/);
    await expect(composer).toHaveValue(draft);
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await expect(composer).toHaveValue(draft);
    await expect(chip).toHaveAccessibleName("1 Scene error");
    await chip.click();
    await expect(page.getByRole("button", { name: "Retry", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Copy Discord report", exact: true }).click();
    await expect(page.getByText("Anonymous report copied.")).toBeVisible();
    const parserReport = await page.evaluate(() => window.sceneReport);
    assert.match(parserReport, /Cause: invalid_reply/);
    assert.match(parserReport, /parse invalid/);
    assert.doesNotMatch(parserReport, /Private parser text|Private replacement|Private draft|Mara|The Mill/i);
    assert.equal(turns.length, nextTurn, "reload never submits the failed reply");
  });
});
console.log("Packaged browser send, native persistence, replay and reload passed.");
