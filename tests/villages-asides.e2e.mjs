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
    const dock = page.locator(`.${tag}-chat-vn`);
    const reading = page.getByRole("region", { name: "Current paragraph" });
    const npc = page.locator('[data-character-id="npc:eli"][data-sprite="true"] > img[data-npc-sprite]');
    const spriteHeight = () => npc.evaluate((image) => image.getBoundingClientRect().height);
    const before = {
      dock: await dock.boundingBox(),
      reading: await reading.boundingBox(),
      text: await reading.textContent(),
    };
    const originalSpriteHeight = await spriteHeight();
    session.lines.push(...asides);
    await load();
    const band = page.locator(`.${tag}-scene-asides`);
    await expect(band).toContainText("Save me the good chair.");
    await expect(band).toContainText("to you");
    await expect(band.getByText("Whisper", { exact: true })).toHaveCount(0);
    await expect(npc).toBeVisible();
    await expect.poll(() => npc.evaluate((image) => image.naturalHeight)).toBe(768);
    await expect(npc).toHaveCSS("opacity", "0.78");
    await expect(band.locator('[data-register="whisper"] img[data-npc-sprite]')).toHaveAttribute(
      "src",
      /npc-silhouette\.webp$/,
    );
    await expect(band.locator(`.${tag}-chat-vn-aside`)).toHaveCount(2);
    const after = {
      dock: await dock.boundingBox(),
      reading: await reading.boundingBox(),
      text: await reading.textContent(),
    };
    assert.deepEqual(after, before, "aside bubbles leave the reading and dock geometry stable");
    async function checkGeometry(label) {
      const geometry = await page.evaluate((tag) => {
        const rect = (node) => {
          const r = node.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
        };
        const band = document.querySelector(`.${tag}-scene-asides`);
        return {
          band: rect(band),
          dock: rect(document.querySelector(`.${tag}-chat-vn`)),
          scene: rect(document.querySelector(`.${tag}-chat`)),
          bubbles: [...band.querySelectorAll(`.${tag}-chat-vn-aside`)].map(rect),
          mainSize: parseFloat(getComputedStyle(document.querySelector(`.${tag}-chat-vn-text`)).fontSize),
          asideSize: parseFloat(getComputedStyle(band.querySelector(`.${tag}-chat-vn-aside-text`)).fontSize),
        };
      }, tag);
      const available = await band.evaluate((node) => parseFloat(node.style.getPropertyValue("--aside-height")));
      assert.ok(
        geometry.band.height > 0 || available === 0,
        `${label}: available stage space is used: ${JSON.stringify(geometry)}`,
      );
      assert.ok(geometry.band.y >= geometry.scene.y - 1, `${label}: no top clipping: ${JSON.stringify(geometry)}`);
      assert.ok(geometry.band.bottom <= geometry.dock.y + 1, `${label}: no dialogue overlap`);
      assert.ok(geometry.band.x >= 0 && geometry.band.right <= width, `${label}: no side clipping`);
      if (mobile) {
        assert.ok(geometry.asideSize < geometry.mainSize, "Aside text is smaller than main dialogue");
        assert.ok(geometry.bubbles[1].y >= geometry.bubbles[0].bottom, "phone bubbles are stacked");
      }
      return geometry;
    }
    await checkGeometry("normal viewport");
    assert.equal(await spriteHeight(), originalSpriteHeight, "asides leave sprite scale unchanged");
    if (!mobile) {
      await expect
        .poll(async () => {
          const [sprite, asides, dialogue] = await Promise.all([
            npc.boundingBox(),
            band.boundingBox(),
            dock.boundingBox(),
          ]);
          return sprite.height - (dialogue.y - asides.y - asides.height);
        })
        .toBeGreaterThan(0);
      await expect
        .poll(() =>
          npc.evaluate((image) => {
            const sprite = image.getBoundingClientRect();
            const slot = image.parentElement.getBoundingClientRect();
            const aspect = image.naturalHeight / image.naturalWidth;
            return Math.min(sprite.height, sprite.width * aspect) - slot.width * aspect;
          }),
        )
        .toBeGreaterThan(0);
    }
    await expect(band.locator(`.${tag}-aside-slot[data-side="left"]`)).toHaveCount(2);
    await page.screenshot({ path: resolve(output, `asides-${width}x${height}.png`) });
    showNotice = true;
    await load();
    const noticePanel = page.locator(`.${tag}-room-stars`);
    await expect(noticePanel).toContainText("Eli is no longer here.");
    await expect
      .poll(() =>
        band.evaluate((element, tag) => {
          const notice = element.closest(`.${tag}-chat`).querySelector(`.${tag}-room-stars`);
          return element.getBoundingClientRect().top - notice.getBoundingClientRect().bottom;
        }, tag),
      )
      .toBeGreaterThanOrEqual(0);
    const belowNotice = (await band.boundingBox()).y;
    await checkGeometry("with the attendance notice open");
    await page.getByRole("button", { name: "1 World change", exact: true }).click();
    await expect(noticePanel).toBeHidden();
    await expect.poll(async () => (await band.boundingBox()).y).toBeLessThan(belowNotice);
    showNotice = false;
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
      await expect(band).toBeHidden();
      await expect(page.getByRole("region", { name: "Current paragraph" })).toBeHidden();
      await expect(page.getByRole("button", { name: "Retry reply", exact: true })).toBeHidden();
      const composerBox = await composer.boundingBox();
      assert.ok(composerBox.y >= 0 && composerBox.y + composerBox.height <= visible);
      const spriteBox = await npc.boundingBox();
      assert.equal(spriteBox.height, originalSpriteHeight, "keyboard leaves sprite scale unchanged");
      assert.ok(spriteBox.y + 24 < composerBox.y, "the keyboard posture keeps the cast above the composer");
      await expect(page.getByRole("button", { name: "Done", exact: true })).toBeVisible();
      await expect(composer).toHaveValue("A draft to keep.");
      await page.screenshot({ path: resolve(output, `asides-keyboard-${width}x${height}.png`) });
      await page.evaluate((height) => {
        window.sceneViewport.height = height;
        window.sceneViewport.dispatchEvent(new Event("resize"));
      }, height);
      await expect(page.locator(tag)).not.toHaveAttribute("data-scene-keyboard", "");
      await expect(band).toBeVisible();
      await checkGeometry("after closing the keyboard");
      await composer.blur();
      await page.getByRole("button", { name: "Venue actions" }).click();
      await page.getByRole("menuitem", { name: "Hide dialogue", exact: true }).click();
      await expect(band).toBeHidden();
      await page.getByRole("button", { name: "Venue actions" }).click();
      await page.getByRole("menuitem", { name: "Show dialogue", exact: true }).click();
      await expect(band).toBeVisible();
      await expect(composer).toHaveValue("A draft to keep.");
    }
    await page.getByRole("button", { name: "Transcript", exact: true }).click();
    await expect(page.getByRole("log", { name: "Scene history" })).toContainText("Save me the good chair.");
    await page.getByRole("button", { name: "Close Transcript", exact: true }).click();
    // Long speech remains complete and scrollable, while the dock stays unchanged.
    asides[0].content = "**A long aside with every word preserved.** ".repeat(35);
    session.lines[2] = asides[0];
    await load();
    await expect(band).toContainText("A long aside with every word preserved.");
    assert.equal(await spriteHeight(), originalSpriteHeight, "wrapping only changes the aside region");
    if (mobile) {
      const text = band.locator(`.${tag}-chat-vn-aside-text`).first();
      await expect.poll(() => band.evaluate((node) => node.scrollHeight - node.clientHeight)).toBeGreaterThan(0);
      const scrolled = await band.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
        return node.scrollTop;
      });
      assert.ok(scrolled > 0, "the bubble pair can be scrolled without moving the dock");
      assert.equal(await text.locator("strong").count(), 35, "all Markdown and content survive");
    }
    assert.deepEqual(await dock.boundingBox(), before.dock);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("Scene asides: two speaker bubbles, mobile stacking, editing, history and long-text scrolling passed.");
});
