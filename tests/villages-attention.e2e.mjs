import { scenePlaybackFixtures } from "./fixtures/scene-browser.fixture.mjs";
const { authorSceneResponse } = await scenePlaybackFixtures();
import { mockEngineLookups, fulfill, abort } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as fixture, residents, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
await withBrowser(browser, async () => {
  mkdirSync(".build-tmp/attention-preview", { recursive: true });
  for (const width of [1366, 390, 320]) {
    const snapshot = structuredClone(fixture);
    snapshot.villagers = residents.slice(0, 1);
    let scene = {
      id: "attention",
      placeId: "mill",
      placeName: "The Mill",
      area: "public",
      zoneId: "hall",
      version: 2,
      sceneRevision: 1,
      status: "active",
      memoryMode: "live",
      startedAt: now,
      lastActivityAt: now,
      activeIds: ["mara"],
      participants: [{ characterId: "mara", name: "Mara", doing: "listening" }],
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
          heardBy: ["mara"],
        },
      ],
    };
    const bodies = [],
      errors = [];
    let loseClarification = width === 320;
    const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: width < 500 });
    await mockEngineLookups(context);
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await context.route("http://attention.test/", (route) =>
      fulfill(route, {
        status: 200,
        contentType: "text/html",
        body: "<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7;--secondary:#384253}html,body{margin:0;height:100%;background:var(--background);color:var(--foreground);font-family:Arial}marinara-capability-villages{display:block;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await context.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = snapshot;
      if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) value = { session: scene };
      else if (path.endsWith("/operation")) value = { operation: scene.operation ?? null };
      else if (path.includes("/operations/")) value = { operation: scene.operation ?? null };
      else if (path.endsWith("/rooms/turn")) {
        const body = route.request().postDataJSON();
        bodies.push(body);
        assert.equal(body.mode, "chat");
        if (!body.attentionChoice) {
          scene = {
            ...scene,
            operation: {
              id: body.submissionId,
              kind: "turn",
              status: "complete",
              attemptId: "clarified",
              input: { message: body.message, mode: "chat", targetId: "" },
            },
            attentionClarification: {
              id: body.submissionId,
              message: body.message,
              question: "The system wasn’t sure which space you meant.",
              choices: [
                { id: "exterior", label: "Exterior" },
                { id: "restricted", label: "Restricted doorway" },
              ],
            },
          };
          if (loseClarification) {
            loseClarification = false;
            return abort(route, "failed");
          }
        } else {
          assert.equal(body.attentionChoice.id, scene.attentionClarification.id);
          assert.equal(body.attentionChoice.zoneId, "exterior");
          assert.notEqual(
            body.submissionId,
            body.attentionChoice.id,
            "a choice continues the saved proposal using a fresh request identity",
          );
          scene = {
            ...scene,
            sceneRevision: scene.sceneRevision + 1,
            attentionClarification: undefined,
            operation: null,
            submissions: [...scene.submissions, { id: body.submissionId }],
            lines: [
              ...scene.lines,
              {
                id: "answer",
                role: "assistant",
                kind: "narration",
                speakerId: "__venue_scene__",
                name: "Narration",
                content: "No answer.",
                heardBy: ["mara"],
                at: now,
              },
            ],
          };
        }
        value = { session: scene, recordEvents: [] };
      }
      await fulfill(route, {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(authorSceneResponse(value, snapshot.worldScope)),
      });
    });
    await page.goto("http://attention.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    let composer = page.getByRole("textbox", { name: "Message at The Mill" });
    await expect(composer).toBeVisible();
    await composer.fill("I knock.");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(page.getByRole("group", { name: "Clarify who to reach" })).toBeVisible();
    await expect(composer).toHaveValue("I knock.");
    await expect(page.getByRole("button", { name: "Mode: Say / Do. Choose mode" })).toBeVisible();
    await composer.fill("");
    scene = { ...scene, lines: scene.lines.map((line) => ({ ...line, content: "The Scene refreshed." })) };
    const refreshed = page.waitForResponse((response) => new URL(response.url()).pathname.endsWith("/rooms/active"));
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await refreshed;
    await expect(page.getByRole("status").filter({ hasText: "Passage unavailable." })).toBeVisible();
    await page.getByRole("button", { name: "1 Scene error", exact: true }).click();
    await page.locator("summary").filter({ hasText: "Scene reading" }).click();
    await page.getByRole("button", { name: "Latest", exact: true }).click();
    await expect(page.getByText("The Scene refreshed.", { exact: true })).toBeVisible();
    await expect(composer).toHaveValue("");
    await expect(page.getByRole("group", { name: "Clarify who to reach" })).toHaveCount(0);
    await composer.fill("I knock on a different door.");
    await expect(page.getByRole("group", { name: "Clarify who to reach" })).toHaveCount(0);
    await composer.fill("I knock.");
    await expect(page.getByRole("group", { name: "Clarify who to reach" })).toBeVisible();
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    composer = page.getByRole("textbox", { name: "Message at The Mill" });
    await expect(composer).toHaveValue("I knock.");
    await expect(page.getByRole("group", { name: "Clarify who to reach" })).toBeVisible();
    await expect(page.getByText("The system wasn’t sure which space you meant.")).toBeVisible();
    await expect(page.getByText("Choose below, or edit your message.")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.equal(overflow, false, `clarification fits ${width}px`);
    await page.screenshot({ path: `.build-tmp/attention-preview/clarification-${width}.png`, fullPage: true });
    await page
      .getByRole("group", { name: "Clarify who to reach" })
      .getByRole("button", { name: "Exterior", exact: true })
      .press("Enter");
    await expect(page.getByRole("group", { name: "Clarify who to reach" })).toHaveCount(0);
    await expect(composer).toHaveValue("");
    assert.equal(bodies.length, 2, "reload and draft edits do not submit extra turns");
    assert.equal(scene.zoneId, "hall", "knocking does not move the player");
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log(
    "Natural attention browser: desktop and two phones, saved choices, draft edits, reload, lost response and fresh continuation identity passed",
  );
});
