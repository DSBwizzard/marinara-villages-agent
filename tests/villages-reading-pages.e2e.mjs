import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import { scenePlaybackFixtures } from "./fixtures/scene-browser.fixture.mjs";
const { authorSceneResponse } = await scenePlaybackFixtures();
import { checkReadingSessionLifecycle } from "./fixtures/villages-reading-session.fixture.mjs";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot, residents, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const tag = "marinara-capability-villages";
const browser = await chromium.launch({
  headless: true,
});
const sentences = Array.from(
  { length: 12 },
  (_, index) => `Sentence ${index + 1} describes the quiet room and the people gathered beside its window.`,
);
const baseProse = `**${sentences.join(" ")}**`;
const baseExpected = sentences.join(" ");
mkdirSync("artifacts", { recursive: true });
await withBrowser(browser, async () => {
  await checkReadingSessionLifecycle(browser);
  for (const { width, height } of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 360, height: 640 },
    { width: 1440, height: 900 },
  ]) {
    const mobile = width !== 1440;
    const atomic = width === 360 || width === 1440;
    const prose = atomic
      ? "`" + "Unbroken".repeat(120) + "` [" + "LinkLabel".repeat(50) + "](https://example.com)"
      : baseProse;
    const expected = atomic ? "Unbroken".repeat(120) + " " + "LinkLabel".repeat(50) : baseExpected;
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
    const session = {
      version: 2,
      id: "reading-pages",
      placeId: "mill",
      placeName: "The Mill",
      area: "public",
      zoneId: "exterior",
      startedAt: now,
      lastActivityAt: now,
      endedAt: "",
      status: "active",
      sceneRevision: 0,
      activeIds: [residents[0].characterId],
      participants: residents.slice(0, 1).map(({ characterId, name }) => ({ characterId, name, doing: "listening" })),
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
        {
          id: "long",
          role: "assistant",
          speakerId: residents[0].characterId,
          kind: "dialogue",
          name: residents[0].name,
          content: prose,
          at: now,
        },
      ],
      submissions: [],
    };
    let events = [{ id: "heart", kind: "relationship-up", text: "Mara's warmth toward you increased (0 → 2)." }];
    const closedCursors = [];
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = snapshot;
      if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) value = { session };
      else if (path.endsWith("/changes") && session.status === "closed") {
        const cursor = new URL(route.request().url()).searchParams.get("cursor");
        closedCursors.push(cursor);
        const first = cursor !== "2:0:0";
        value = {
          changes: [
            {
              notices: [
                {
                  id: first ? "recovered-older" : "recovered-final",
                  kind: "memory",
                  text: first ? "Earlier turn recovered during close." : "Final recovery notice.",
                },
              ],
            },
          ],
          notices: [],
          dismissedNoticeIds: [],
          nextCursor: first ? "2:0:0" : "3:0:0",
          hasMore: first,
          processingSummary: { pending: 0, failed: 0, rejected: 0 },
        };
      } else if (path.endsWith("/changes"))
        value = {
          changes: [],
          notices: events,
          dismissedNoticeIds: [],
          nextCursor: "1:0:0",
          processingSummary: { pending: 0, failed: 0, rejected: 0 },
        };
      else if (path.endsWith("/rooms/close") || path.endsWith("/rooms/end")) {
        session.status = "closed";
        session.endedAt = now;
        session.memoryReview = { status: "complete", decisions: [] };
        value = { session, recordEvents: [] };
      }
      await fulfill(route, {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(authorSceneResponse(value, snapshot.worldScope)),
      });
    });
    await page.route("http://reading.test/", (route) =>
      fulfill(route, {
        status: 200,
        contentType: "text/html",
        body: `<style>:root{--background:#101726;--foreground:#f2f2f5;--popover:#202938;--border:#4d5870;--primary:#af91eb;--secondary:#303b50;--muted-foreground:#bac4d7}html,body{margin:0;width:100%;height:100%;overflow:hidden;font-family:Arial}[data-component=HomeBrowserHub],.shell{height:100%;display:flex;flex-direction:column}.mari-home-browser-chrome{height:80px;flex-shrink:0}main{flex:1;min-height:0;overflow:auto}${tag}{display:block;width:100%;height:100%}</style><div data-component="HomeBrowserHub"><div class="shell"><header class="mari-home-browser-chrome">Home</header><main data-component="HomeBrowserHub.Content"><${tag}></${tag}></main></div></div>`,
      }),
    );
    await page.goto("http://reading.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const reading = page.getByRole("region", { name: "Current paragraph" });
    const text = reading.locator("p").first();
    const next = page.getByRole("button", { name: "Next paragraph" });
    const draft = page.getByRole("textbox", { name: "Message at The Mill" });
    const dock = page.locator(`.${tag}-chat-vn`);
    const tray = page.getByRole("button", { name: /World changes?/ });
    await expect(text).toContainText(atomic ? "Unbroken" : "Sentence 1");
    await expect(draft).toBeDisabled();
    await expect(page.getByRole("button", { name: "Previous paragraph" })).toHaveCount(0);
    await expect(page.locator(`.${tag}-chat-vn-counter`)).toHaveCount(0);
    await expect(reading).toHaveCSS("overflow-y", "hidden");
    const theme = page.locator(`.${tag}-room-screen`);
    for (const [name, color] of [
      ["day", "rgb(247, 248, 245)"],
      ["night", "rgb(57, 48, 71)"],
    ]) {
      await theme.evaluate((node, value) => {
        node.dataset.readerTheme = value;
      }, name);
      await expect(page.locator(".villages-dialogue-reader")).toHaveCSS("background-color", color);
    }
    const before = await dock.boundingBox();
    const location = await page.locator(`.${tag}-room-place`).boundingBox();
    const chips = await page.locator(`.${tag}-scene-notice-chips`).boundingBox();
    assert.ok(
      chips.y >= location.y + location.height && Math.abs(chips.x - location.x) < 1,
      "chips stay below the location on the left",
    );
    if ((await tray.getAttribute("aria-expanded")) === "true") await tray.click();
    let combined = "",
      pageCount = 0;
    do {
      combined += await text.textContent();
      pageCount++;
      assert(await text.locator(atomic ? "code,a" : "strong").count(), "formatted text survives each chunk");
      assert(await reading.evaluate((n) => n.scrollHeight <= n.clientHeight + 2), "every chunk fits without scrolling");
      if (await next.isDisabled()) break;
      await next.click();
    } while (pageCount < 100);
    assert(pageCount > 1 && pageCount < 100, "long replies advance in small chunks on desktop and phones");
    assert.equal(combined, expected, "every character appears exactly once");
    await expect(draft).toBeEnabled();
    assert.deepEqual(await dock.boundingBox(), before, "the input occupies the same dock space while reading");
    await draft.fill("Draft retained across dossier navigation");
    const last = await text.textContent();
    await page.getByRole("button", { name: "Venue actions" }).click();
    const menu = page.getByRole("menu", { name: "Venue actions" });
    await expect(menu.getByRole("menuitem")).toHaveCount(9);
    await expect(menu.getByRole("menuitem", { name: "Transcript" })).toHaveCount(0);
    await expect(menu.getByRole("menuitem", { name: "Retry Turn" })).toBeDisabled();
    const items = await menu
      .getByRole("menuitem")
      .evaluateAll((nodes) => nodes.map((n) => ({ x: n.offsetLeft, delay: getComputedStyle(n).animationDelay })));
    assert.equal(new Set(items.map((i) => i.x)).size, mobile ? 3 : 1);
    assert.equal(items[8].delay, "0.16s");
    await page.keyboard.press("ArrowDown");
    await expect(menu.getByRole("menuitem", { name: "View Venue", exact: true })).toBeFocused();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(menu.getByRole("menuitem").first()).toHaveCSS("animation-name", "none");
    await page.getByRole("menuitem", { name: "View Venue", exact: true }).click();
    await page
      .locator(".marinara-capability-villages-desk-header")
      .getByRole("button", { name: "Return to Scene", exact: true })
      .click();
    await expect(text).toHaveText(last);
    await expect(draft).toHaveValue("Draft retained across dossier navigation");
    await expect(draft).toBeEnabled();
    if (mobile) {
      await draft.focus();
      await page.evaluate(() => {
        window.sceneViewport.height = Math.max(220, innerHeight - 280);
        window.sceneViewport.dispatchEvent(new Event("resize"));
      });
      await expect(reading).toBeHidden();
      await page.getByRole("button", { name: "Done", exact: true }).click();
      await page.evaluate(() => {
        window.sceneViewport.height = innerHeight;
        window.sceneViewport.dispatchEvent(new Event("resize"));
      });
      await expect(reading).toBeVisible();
      await expect(text).toHaveText(last);
    }
    events.push({ id: "memory", kind: "memory", text: "Mara remembered the exchange." });
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(tray).toHaveAccessibleName("2 World changes");
    if ((await tray.getAttribute("aria-expanded")) === "true") await tray.click();
    await page.screenshot({ path: `artifacts/scene-next-dock-${width}x${height}.png` });
    await page.getByRole("button", { name: "Venue actions" }).click();
    await page.getByRole("menuitem", { name: "Conclude" }).click();
    await expect(draft).toHaveCount(0);
    await expect(page.getByText("Review complete. No durable memories were made from this Scene.")).toHaveCount(0);
    await expect(tray).toHaveAccessibleName("4 World changes");
    assert.deepEqual(
      closedCursors,
      ["1:0:0", "2:0:0"],
      "Closing drains new pages after the existing cursor exactly once",
    );
    if ((await tray.getAttribute("aria-expanded")) !== "true") await tray.click();
    await expect(page.getByText("Earlier turn recovered during close.", { exact: true })).toBeVisible();
    await expect(page.getByText("Final recovery notice.", { exact: true })).toBeVisible();
    await tray.click();
    const box = await dock.boundingBox();
    assert.ok(Math.abs(box.y + box.height - height) <= 1, "ended dialogue dock reaches the bottom");
    await page.screenshot({ path: `artifacts/compact-scene-ended-${width}x${height}.png` });
    await page.getByRole("button", { name: "Venue actions" }).click();
    await page.getByRole("menuitem", { name: "Scene settings" }).click();
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "villages-reading-pages: mobile paging, formatting, sprites, keyboard, notices, hide/restore, reflow and ended docking passed",
  );
});
