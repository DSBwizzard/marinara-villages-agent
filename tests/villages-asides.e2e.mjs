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
const output = resolve("artifacts/scene-asides");
mkdirSync(output, { recursive: true });
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
    const fixture = structuredClone(snapshot);
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
      version: 1,
      stagingVersion: 1,
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
      activeIds: residents.map((person) => person.characterId),
      participants: residents.map(({ characterId, name }) => ({ characterId, name, doing: "listening" })),
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
    const asides = residents.map((person, index) => ({
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
      asideFor: "main",
      heardBy: [person.characterId],
      at: now,
    }));
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = fixture;
      if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) value = { session };
      else if (path.endsWith("/debug/runtime")) value = { showUsageMeter: false };
      else if (path.endsWith("/changes"))
        value = {
          changes: [],
          notices: [],
          dismissedNoticeIds: [],
          nextCursor: "",
          processingSummary: { pending: 0, failed: 0, rejected: 0 },
        };
      else if (path.endsWith("/interpretation-settings"))
        value = { settings: { decisionsEnabled: false, compareSystem: true }, status: { available: false } };
      else if (path.includes("/interpretation-diagnostics/")) value = { checks: [] };
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.route("http://asides.test/", (route) =>
      route.fulfill({
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
    const dock = page.locator(`.${tag}-chat-vn`);
    const reading = page.getByRole("region", { name: "Current paragraph" });
    const before = {
      dock: await dock.boundingBox(),
      reading: await reading.boundingBox(),
      text: await reading.textContent(),
    };
    session.lines.push(...asides);
    await load();
    const band = page.locator(`.${tag}-chat-vn-asides`);
    await expect(band).toContainText("Save me the good chair.");
    await expect(band).toContainText("→ Riley");
    await expect(band.locator(`.${tag}-chat-vn-aside`)).toHaveCount(4);
    const after = {
      dock: await dock.boundingBox(),
      reading: await reading.boundingBox(),
      text: await reading.textContent(),
    };
    assert.deepEqual(after, before, "four asides never change the main reading, paging or dock geometry");
    async function checkGeometry(label) {
      const geometry = await page.evaluate((tag) => {
        const rect = (node) => {
          const r = node.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
        };
        const band = document.querySelector(`.${tag}-chat-vn-asides`);
        return {
          band: rect(band),
          dock: rect(document.querySelector(`.${tag}-chat-vn`)),
          scene: rect(document.querySelector(`.${tag}-chat`)),
          bubbles: [...band.querySelectorAll(`.${tag}-chat-vn-aside`)].map(rect),
          mainSize: parseFloat(getComputedStyle(document.querySelector(`.${tag}-chat-vn-text`)).fontSize),
          asideSize: parseFloat(getComputedStyle(band.querySelector(`.${tag}-chat-vn-aside-text`)).fontSize),
        };
      }, tag);
      const available = await band.evaluate((node) =>
        parseFloat(node.style.getPropertyValue("--villages-aside-available-height")),
      );
      assert.ok(
        geometry.band.height > 0 || available === 0,
        `${label}: available stage space is used: ${JSON.stringify(geometry)}`,
      );
      assert.ok(geometry.band.y >= geometry.scene.y - 1, `${label}: no top clipping: ${JSON.stringify(geometry)}`);
      assert.ok(geometry.band.bottom <= geometry.dock.y + 1, `${label}: no dialogue overlap`);
      assert.ok(geometry.band.x >= 0 && geometry.band.right <= width, `${label}: no side clipping`);
      if (mobile) assert.ok(geometry.asideSize < geometry.mainSize, "Aside text is smaller than main dialogue");
      return geometry;
    }
    await checkGeometry("normal viewport");
    if (mobile) {
      await expect(band.locator(`.${tag}-scene-aside-stack[data-side="left"]`)).toContainText("Mara");
      await expect(band.locator(`.${tag}-scene-aside-stack[data-side="left"]`)).toContainText("Eli");
      await expect(band.locator(`.${tag}-scene-aside-stack[data-side="right"]`)).toContainText("Lina");
      await expect(band.locator(`.${tag}-scene-aside-stack[data-side="right"]`)).toContainText("Taro");
    }
    await page.screenshot({ path: resolve(output, `asides-${width}x${height}.png`) });
    const composer = page.getByRole("textbox", { name: "Message at The Mill" });
    if (mobile) {
      await composer.fill("A draft to keep.");
      await composer.focus();
      const visible = height - Math.min(280, Math.round(height * 0.4));
      await page.evaluate((visible) => {
        window.sceneViewport.height = visible;
        window.sceneViewport.dispatchEvent(new Event("resize"));
      }, visible);
      await expect(page.locator(tag)).toHaveAttribute("data-scene-keyboard", "");
      await expect
        .poll(async () => {
          const bandBox = await band.boundingBox();
          const sceneBox = await page.locator(`.${tag}-chat`).boundingBox();
          return bandBox.y - sceneBox.y;
        })
        .toBeGreaterThanOrEqual(0);
      await checkGeometry("keyboard viewport");
      await expect(composer).toHaveValue("A draft to keep.");
      await page.screenshot({ path: resolve(output, `asides-keyboard-${width}x${height}.png`) });
      await page.evaluate((height) => {
        window.sceneViewport.height = height;
        window.sceneViewport.dispatchEvent(new Event("resize"));
      }, height);
      await expect(page.locator(tag)).not.toHaveAttribute("data-scene-keyboard", "");
      await composer.blur();
      await page.getByRole("button", { name: "Hide dialogue", exact: true }).click();
      await expect(band).toBeHidden();
      await page.getByRole("button", { name: "Show dialogue", exact: true }).click();
      await expect(band).toBeVisible();
      await expect(composer).toHaveValue("A draft to keep.");
    }
    for (let count = 0; count < 10 && (await band.count()); count++)
      await page.getByRole("button", { name: "Previous paragraph" }).click();
    await expect(band).toHaveCount(0);
    await page.getByRole("button", { name: "Next paragraph" }).click();
    await expect(band).toHaveCount(1);
    await page.getByRole("button", { name: "History", exact: true }).click();
    await expect(page.getByRole("log", { name: "Scene history" })).toContainText("Save me the good chair.");
    await page.getByRole("button", { name: "Hide history" }).click();
    // Long speech remains complete and scrollable, while the dock stays unchanged.
    asides[0].content = "**A long aside with every word preserved.** ".repeat(35);
    session.lines[2] = asides[0];
    await load();
    await expect(band).toContainText("A long aside with every word preserved.");
    if (mobile) {
      const text = band.locator(`.${tag}-chat-vn-aside-text`).first();
      await expect.poll(() => text.evaluate((node) => node.scrollHeight - node.clientHeight)).toBeGreaterThan(0);
      const scrolled = await text.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
        return node.scrollTop;
      });
      assert.ok(scrolled > 0, "long Aside text can be scrolled independently");
      assert.equal(await text.locator("strong").count(), 35, "all Markdown and content survive");
    }
    assert.deepEqual(await dock.boundingBox(), before.dock);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Scene asides: four speaker bubbles, full dock preservation, keyboard bounds, smaller text, paging, history, hide/restore and long-text scrolling passed.",
  );
} finally {
  await browser.close();
}
