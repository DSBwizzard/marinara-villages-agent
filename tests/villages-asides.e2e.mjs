import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import { scenePlaybackFixtures } from "./fixtures/scene-browser.fixture.mjs";
const { authorSceneResponse } = await scenePlaybackFixtures();
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot, residents, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const tag = "marinara-capability-villages";
const browser = await chromium.launch({
  headless: true,
});
const output = resolve("artifacts/scene-asides");
mkdirSync(output, { recursive: true });
await withBrowser(browser, async () => {
  for (const { width, height } of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 360, height: 640 },
    { width: 1440, height: 900 },
  ]) {
    const mobile = width !== 1440;
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: mobile });
    await mockEngineLookups(page);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      const viewport = new EventTarget();
      Object.assign(viewport, { height: innerHeight, width: innerWidth, offsetTop: 0, scale: 1 });
      Object.defineProperty(window, "visualViewport", { configurable: true, value: viewport });
      window.sceneViewport = viewport;
    });
    const fixture = structuredClone(snapshot);
    const cast = residents.map((person, index) => (index === 1 ? { ...person, characterId: "npc:eli" } : person));
    fixture.settings.playerPersonaName = "Riley";
    const main = {
      id: "main",
      role: "assistant",
      speakerId: "mara",
      name: "Mara",
      kind: "dialogue",
      content: "The kettle is ready. There is a chair for everyone. Stay for a cup.",
      heardBy: residents.map((person) => person.characterId),
      at: now,
    };
    const session = {
      version: 2,
      id: "aside-scene",
      placeId: "mill",
      placeName: "The Mill",
      area: "public",
      zoneId: "exterior",
      startedAt: now,
      lastActivityAt: now,
      endedAt: "",
      status: "active",
      sceneRevision: 0,
      activeIds: cast.map((person) => person.characterId),
      participants: cast.map(({ characterId, name }) => ({ characterId, name, doing: "listening" })),
      lines: [
        {
          id: "intro",
          role: "assistant",
          speakerId: "__venue_scene__",
          kind: "narration",
          name: "",
          content: "A quiet afternoon.",
          at: now,
        },
        main,
      ],
      submissions: [],
    };
    const asides = cast.map((person, index) => ({
      id: `aside-${index}`,
      role: "assistant",
      speakerId: person.characterId,
      name: person.name,
      kind: index === 1 ? "whisper" : "side",
      ...(index === 1 ? { targetId: "player" } : {}),
      content: [
        "That kettle sounds furious.",
        "Save me the good chair.",
        "At least the tea is strong.",
        "I brought the biscuits.",
      ][index],
      asideFor: index === 0 ? "missing-main" : "main",
      heardBy: [person.characterId],
      at: now,
    }));
    let showNotice = false;
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = fixture;
      if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) value = { session };
      else if (path.endsWith(`/rooms/${session.id}/history`))
        value = { scope: fixture.worldScope, sceneId: session.id, version: "a".repeat(64), lines: session.lines };
      else if (path.endsWith("/debug/runtime")) value = { showUsageMeter: false };
      else if (path.endsWith("/changes"))
        value = {
          changes: [],
          notices: showNotice
            ? [{ id: "presence:fixture", kind: "venue", text: "Eli is no longer here.", at: now }]
            : [],
          dismissedNoticeIds: [],
          nextCursor: "",
          processingSummary: { pending: 0, failed: 0, rejected: 0 },
        };
      await fulfill(route, {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(authorSceneResponse(value, fixture.worldScope)),
      });
    });
    await page.route("http://asides.test/", (route) =>
      fulfill(route, {
        status: 200,
        contentType: "text/html",
        body: `<style>:root{--background:#101726;--foreground:#f2f2f5;--popover:#202938;--border:#4d5870;--primary:#af91eb;--secondary:#303b50;--muted-foreground:#bac4d7}html,body{margin:0;width:100%;height:100%;overflow:hidden;font-family:Arial}[data-component=HomeBrowserHub],.shell{height:100%;display:flex;flex-direction:column}.mari-home-browser-chrome{height:48px;flex-shrink:0}main{flex:1;min-height:0;overflow:auto}${tag}{display:block;width:100%;height:100%}</style><div data-component="HomeBrowserHub"><div class="shell"><header class="mari-home-browser-chrome">Home · Villages</header><main data-component="HomeBrowserHub.Content"><${tag}></${tag}></main></div></div>`,
      }),
    );
    async function load() {
      await page.goto("http://asides.test/");
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await expect(page.getByRole("textbox", { name: "Message at The Mill" })).toBeVisible();
    }
    await load();
    const reply = page.getByRole("region", { name: "Latest reply" });
    await expect(reply).toContainText(main.content);
    session.lines.push(...asides);
    await load();
    for (const aside of asides) await expect(reply).toContainText(aside.content);
    await expect(reply).toContainText("to you");
    await expect(reply.locator("img[data-npc-sprite]")).toHaveCount(1);
    await expect(page.locator('[data-character-id="npc:eli"]')).toBeVisible();
    const composer = page.getByRole("textbox", { name: "Message at The Mill" });
    await composer.fill("A draft to keep.");
    await page.getByRole("button", { name: "Transcript", exact: true }).click();
    await expect(page.getByRole("log", { name: "Scene history" })).toContainText("Save me the good chair.");
    await page.getByRole("button", { name: "Close transcript", exact: true }).click();
    await expect(composer).toHaveValue("A draft to keep.");
    asides[0].content = "**A long aside with every word preserved.** ".repeat(35);
    session.lines[2] = asides[0];
    await load();
    await expect(reply).toContainText("A long aside with every word preserved.");
    assert(await reply.evaluate((node) => node.scrollHeight > node.clientHeight));
    const box = await reply.boundingBox();
    assert(box.x >= 0 && box.x + box.width <= width + 1 && box.y + box.height <= height);
    if (mobile) {
      await composer.focus();
      await page.evaluate(() => {
        window.sceneViewport.height -= 200;
        window.sceneViewport.dispatchEvent(new Event("resize"));
      });
      await expect(reply).toBeHidden();
      await page.evaluate((height) => {
        window.sceneViewport.height = height;
        window.sceneViewport.dispatchEvent(new Event("resize"));
      }, height);
      await composer.blur();
      await expect(reply).toBeVisible();
    }
    await page.screenshot({ path: resolve(output, "inline-asides-" + width + ".png") });
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("Scene asides: two speaker bubbles, mobile stacking, editing, history and long-text scrolling passed.");
});
