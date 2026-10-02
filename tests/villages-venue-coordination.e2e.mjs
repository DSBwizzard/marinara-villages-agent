import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot, residents, now, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.ts";
import {
  coordinateVenue,
  coordinatedCompletion,
  venueCheckpoint,
  operationSummary,
  readVenueOperation,
  assertVenueOwnership,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-coordinator.ts";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
let record = {
  id: "villages-venue-visit-browser",
  packageId: "villages",
  kind: "venue-visit",
  name: "Visit",
  description: "",
  revision: 1,
  data: {
    version: 1,
    sceneRevision: 0,
    id: "browser",
    placeId: "mill",
    placeName: "The Mill",
    area: "public",
    status: "active",
    startedAt: now,
    lastActivityAt: now,
    endedAt: "",
    participants: [{ characterId: "mara", name: "Mara", doing: "listening" }],
    activeIds: ["mara"],
    submissions: [],
    lines: [
      {
        id: "opening",
        role: "assistant",
        kind: "dialogue",
        speakerId: "mara",
        name: "Mara",
        content: "Welcome to the mill.",
        at: now,
      },
    ],
  },
};
const documents = {
  async getById(_packageId, id) {
    return id === record.id ? structuredClone(record) : null;
  },
  async update(input) {
    if (input.expectedRevision !== record.revision) return null;
    record = { ...record, ...structuredClone(input), revision: record.revision + 1 };
    return structuredClone(record);
  },
};
const release = configureVillagesRuntime({
  persistence: { documents },
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
});
let calls = 0,
  held = null,
  started = null,
  holdNext = true;
let disconnectNext = false;
const publicRoom = () => ({ ...structuredClone(record.data), operation: operationSummary(record.data.operation) });
const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.route("http://villages.test/", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7;--secondary:#384253}html,body{margin:0;height:100%;background:var(--background);color:var(--foreground);font-family:Arial}marinara-capability-villages{display:block;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
    }),
  );
  await context.route("**/api/villages**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    try {
      let value = { ...snapshot, villagers: residents.slice(0, 1) };
      if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) value = { session: publicRoom() };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.includes("/operations/"))
        value = { operation: await readVenueOperation("browser", decodeURIComponent(path.split("/").at(-1))) };
      else if (path.endsWith("/rooms/turn")) {
        const body = route.request().postDataJSON();
        await coordinateVenue(
          "browser",
          body.submissionId,
          "turn",
          { message: body.message, mode: body.mode, targetId: body.targetId },
          body.expectedSceneRevision,
          body.retryOfAttemptId,
          async () => {
            const answer = await venueCheckpoint("turn-reply", () =>
              coordinatedCompletion("browser-reply", async () => {
                calls++;
                if (holdNext) {
                  holdNext = false;
                  started?.();
                  await new Promise((done) => {
                    held = done;
                  });
                }
                if (disconnectNext) {
                  disconnectNext = false;
                  throw new Error("Provider connection interrupted");
                }
                return "I heard your new message.";
              }),
            );
            assertVenueOwnership(record.data);
            record.data.lines.push(
              {
                id: body.submissionId + ":player",
                role: "user",
                speakerId: "",
                name: "",
                content: body.message,
                at: now,
              },
              {
                id: body.submissionId + ":reply",
                role: "assistant",
                kind: "dialogue",
                speakerId: "mara",
                name: "Mara",
                content: answer,
                at: now,
              },
            );
            record.data.submissions.push({ id: body.submissionId });
            record.data.sceneRevision++;
          },
        );
        value = { session: publicRoom(), verdict: null, recordEvents: [] };
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
    } catch (error) {
      await route.fulfill({
        status: error.statusCode ?? 502,
        contentType: "application/json",
        body: JSON.stringify({ error: error.message, code: error.code }),
      });
    }
  });
  const one = await context.newPage(),
    two = await context.newPage();
  for (const page of [one, two]) {
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
  }
  const composer = (page) => page.getByRole("textbox", { name: "Message at The Mill" });
  const send = (page) => page.getByRole("button", { name: "Send", exact: true });
  await expect(composer(one)).toBeVisible();
  await expect(composer(two)).toBeVisible();
  const admission = new Promise((done) => {
    started = done;
  });
  await composer(one).fill("First tab message");
  await send(one).click();
  await admission;
  await composer(two).fill("Second tab draft");
  await send(two).click();
  await expect(composer(two)).toHaveValue("Second tab draft");
  await expect(two.getByText(/This Scene is responding/).first()).toBeVisible();
  assert.equal(calls, 1);
  held();
  await expect.poll(() => record.data.operation.status).toBe("complete");
  // Completion polling intentionally pauses in hidden tabs. Activate the tab
  // whose preserved draft and refreshed transcript this assertion exercises.
  await two.bringToFront();
  const next = two.getByRole("button", { name: "Next paragraph", exact: true });
  await expect(next).toBeVisible({ timeout: 10000 });
  await next.click();
  await expect(one.getByRole("button", { name: "Sending", exact: true })).toHaveCount(0);
  await expect(send(two)).toBeEnabled({ timeout: 10_000 });
  await expect(composer(two)).toHaveValue("Second tab draft");
  assert.equal(calls, 1, "completion polling never resends the second draft");
  await send(two).click();
  await expect.poll(() => record.data.operation.status).toBe("complete");
  if ((await next.isVisible()) && (await next.isEnabled())) await next.click();
  await expect(composer(two)).toHaveValue("");
  assert.equal(calls, 2);
  assert.equal(record.data.lines.filter((line) => line.content === "Second tab draft").length, 1);

  // A stale snapshot is refused and replaced before the player explicitly resends.
  record.data.sceneRevision++;
  record.data.lines.push({
    id: "external",
    role: "assistant",
    speakerId: "mara",
    name: "Mara",
    content: "The scene has changed elsewhere.",
    at: now,
  });
  await composer(two).fill("Review the updated scene");
  await send(two).click();
  await expect(two.getByRole("alert")).toContainText("scene changed");
  assert.equal(calls, 2);
  await expect(next).toBeVisible();
  await next.click();
  await expect(composer(two)).toHaveValue("Review the updated scene");
  await send(two).click();
  await expect.poll(() => record.data.submissions.length).toBe(3);
  if ((await next.isVisible()) && (await next.isEnabled())) await next.click();
  await expect(composer(two)).toHaveValue("");
  assert.equal(calls, 3);

  disconnectNext = true;
  await composer(two).fill("Preserve an interrupted request");
  await send(two).click();
  await expect(two.getByRole("button", { name: "Retry saved request" })).toBeVisible();
  await expect(composer(two)).toHaveValue("Preserve an interrupted request");
  assert.equal(calls, 4);
  await two.reload();
  await two.addScriptTag({ path: resolve("packages/villages/client.js") });
  await expect(two.getByRole("button", { name: "Retry saved request" })).toBeVisible();
  assert.equal(calls, 4, "reload never retries an uncertain paid request");
  await two.getByRole("button", { name: "Retry saved request" }).click();
  await expect(two.getByRole("button", { name: "Retry saved request" })).toHaveCount(0);
  assert.equal(calls, 5);
  assert.equal(record.data.submissions.length, 4);
  assert.deepEqual(errors, []);
  console.log(
    "villages-venue-coordination browser: busy draft, stale refresh, explicit resend, reload recovery, and cost counts passed",
  );
} finally {
  release();
  await browser.close();
}
