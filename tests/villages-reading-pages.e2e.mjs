import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot, residents, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const tag = "marinara-capability-villages";
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
const sentences = Array.from(
  { length: 12 },
  (_, index) => `Sentence ${index + 1} describes the quiet room and the people gathered beside its window.`,
);
const prose = `**${sentences.join(" ")}**`;
const expected = sentences.join(" ");
mkdirSync("artifacts", { recursive: true });
try {
  for (const { width, height } of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 1440, height: 900 },
  ]) {
    const mobile = width !== 1440;
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: mobile });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      const viewport = new EventTarget();
      Object.assign(viewport, { height: innerHeight, width: innerWidth, offsetTop: 0, scale: 1 });
      Object.defineProperty(window, "visualViewport", { configurable: true, value: viewport });
      window.sceneViewport = viewport;
    });
    const session = {
      version: 1,
      stagingVersion: 1,
      memoryMode: "live",
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
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = snapshot;
      if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) value = { session };
      else if (path.endsWith("/changes"))
        value = {
          changes: [],
          notices: events,
          dismissedNoticeIds: [],
          nextCursor: "",
          processingSummary: { pending: 0, failed: 0, rejected: 0 },
        };
      else if (path.endsWith("/rooms/close") || path.endsWith("/rooms/end")) {
        session.status = "closed";
        session.endedAt = now;
        session.memoryReview = { status: "complete", decisions: [] };
        value = { session, recordEvents: events };
      } else if (path.endsWith("/interpretation-settings"))
        value = { settings: { decisionsEnabled: false, compareSystem: true }, status: { available: false } };
      else if (path.includes("/interpretation-diagnostics/")) value = { checks: [] };
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.route("http://reading.test/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `<style>:root{--background:#101726;--foreground:#f2f2f5;--popover:#202938;--border:#4d5870;--primary:#af91eb;--secondary:#303b50;--muted-foreground:#bac4d7}html,body{margin:0;width:100%;height:100%;overflow:hidden;font-family:Arial}[data-component=HomeBrowserHub],.shell{height:100%;display:flex;flex-direction:column}.mari-home-browser-chrome{height:80px;flex-shrink:0}main{flex:1;min-height:0;overflow:auto}${tag}{display:block;width:100%;height:100%}</style><div data-component="HomeBrowserHub"><div class="shell"><header class="mari-home-browser-chrome">Home</header><main data-component="HomeBrowserHub.Content"><${tag}></${tag}></main></div></div>`,
      }),
    );
    await page.goto("http://reading.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const reading = page.getByRole("region", { name: "Current paragraph" });
    const text = reading.locator(`p:not(.${tag}-reading-measure)`).first();
    const counter = page.locator(`.${tag}-chat-vn-counter`);
    const next = page.getByRole("button", { name: "Next paragraph" });
    const previous = page.getByRole("button", { name: "Previous paragraph" });
    const draft = page.getByRole("textbox", { name: "Message at The Mill" });
    const dock = page.locator(`.${tag}-chat-vn`);
    const tray = page.getByRole("button", { name: /village notice/ });
    await expect(reading).toBeVisible();
    await expect(page.locator(".mari-home-browser-chrome")).toBeVisible();
    if (mobile) {
      const scene = await page.locator(`.${tag}-room-screen`).boundingBox();
      const input = await page.locator(`.${tag}-chat-input`).boundingBox();
      assert.ok(Math.abs(scene.y + scene.height - input.y - input.height) < 1, "actual composer touches Scene bottom");
    }
    await expect(tray).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByLabel("Village events")).toBeVisible();
    events.push({ id: "memory", kind: "memory", text: "Mara remembered the exchange." });
    await expect(tray).toHaveAccessibleName("2 village notices");
    await expect(tray).toHaveAttribute("aria-expanded", "true");
    await tray.click();
    await expect(tray).toHaveAttribute("aria-expanded", "false");
    if (mobile) {
      await expect(counter).toContainText("Page 1/");
      await previous.click();
      await expect(text).toHaveText("A quiet afternoon.");
      await expect(counter).toHaveText("Paragraph 1/2");
      await next.click();
      await expect(counter).toContainText("Page 1/");
      assert.equal((await page.locator(`.${tag}-chat-vn-portrait`).boundingBox()).width, 32);
      assert.ok((await reading.boundingBox()).width > width - 48, "text spans the card width");
      await draft.fill("Preserve this draft");
      const initialText = await text.textContent();
      await page.screenshot({ path: `artifacts/compact-before-hide-${width}x${height}.png` });
      await page.getByRole("button", { name: "Hide dialogue", exact: true }).click();
      await expect(reading).toBeHidden();
      await page.getByRole("button", { name: "Show dialogue", exact: true }).click();
      await expect(draft).toHaveValue("Preserve this draft");
      assert.equal(await text.textContent(), initialText);
      const images = page.locator(`.${tag}-chat-cast-person > img`);
      const baseline = await images.first().boundingBox();
      let combined = "",
        pageCount = 0;
      do {
        await expect(counter).toContainText(`Page ${pageCount + 1}/`);
        const rendered = await text.evaluate((el) => ({
          height: el.getBoundingClientRect().height,
          line: parseFloat(getComputedStyle(el).lineHeight),
        }));
        assert.ok(
          rendered.height <= 3 * rendered.line + 1,
          `at most three rendered dialogue lines (${width}x${height}, page ${pageCount + 1}, ${JSON.stringify(rendered)}, ${await text.textContent()})`,
        );
        combined += await text.textContent();
        assert.ok(await text.locator("strong").count(), "bold survives each page boundary");
        assert.ok(
          await reading.evaluate((el) => el.scrollHeight <= el.clientHeight + 2),
          "ordinary page fits without scrolling",
        );
        assert.deepEqual(await images.first().boundingBox(), baseline, "paging does not replay sprite staging");
        pageCount++;
        if (await next.isDisabled()) break;
        await next.click();
      } while (pageCount < 100);
      assert.ok(pageCount > 1 && pageCount < 100);
      assert.equal(combined, expected, "every rendered character appears exactly once");
      await previous.click();
      const beforeKeyboard = await text.textContent(),
        counterBeforeKeyboard = await counter.textContent();
      await draft.focus();
      await page.evaluate(() => {
        window.sceneViewport.height = Math.max(220, innerHeight - 280);
        window.sceneViewport.dispatchEvent(new Event("resize"));
      });
      await expect(page.locator(tag)).toHaveAttribute("data-scene-keyboard", "");
      assert.equal(await text.textContent(), beforeKeyboard);
      assert.equal(await counter.textContent(), counterBeforeKeyboard);
      assert.deepEqual(await images.first().boundingBox(), baseline);
      await page.evaluate(() => {
        window.sceneViewport.height = innerHeight;
        window.sceneViewport.dispatchEvent(new Event("resize"));
      });
      await expect(page.locator(tag)).not.toHaveAttribute("data-scene-keyboard", "");
      await draft.blur();
      if (width === 320) {
        const anchor = (await text.textContent()).trim().split(/\s+/).slice(0, 3).join(" ");
        await page.setViewportSize({ width: 390, height });
        await expect(text).toContainText(anchor);
        await page.setViewportSize({ width, height });
        await expect(text).toContainText(anchor);
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "18px";
        });
        await expect(text).toContainText(anchor);
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "";
        });
      }
      await page.screenshot({ path: `artifacts/compact-scene-active-${width}x${height}.png` });
    } else {
      await expect(counter).not.toContainText("Page");
      assert.equal(await text.textContent(), expected);
      await expect(page.getByRole("button", { name: "Hide dialogue", exact: true })).toBeHidden();
    }
    await page.getByRole("button", { name: "Venue actions" }).click();
    await page.getByRole("menuitem", { name: "End Scene now" }).click();
    await expect(draft).toHaveCount(0);
    await expect(page.getByText("Review complete. No durable memories were made from this Scene.")).toHaveCount(0);
    await expect(tray).toHaveAttribute("aria-expanded", "false");
    const box = await dock.boundingBox();
    assert.ok(Math.abs(box.y + box.height - height) <= 1, "ended dialogue dock reaches the bottom");
    await page.screenshot({ path: `artifacts/compact-scene-ended-${width}x${height}.png` });
    await page.getByRole("button", { name: "Venue actions" }).click();
    await page.getByRole("menuitem", { name: "Scene settings" }).click();
    await expect(page.getByRole("dialog", { name: "Scene settings" })).toContainText(
      "Ending the Scene does not run another review",
    );
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "villages-reading-pages: mobile paging, formatting, sprites, keyboard, notices, hide/restore, reflow and ended docking passed",
  );
} finally {
  await browser.close();
}
