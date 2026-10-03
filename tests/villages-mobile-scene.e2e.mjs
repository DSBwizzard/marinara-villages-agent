import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot, residents, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const tag = "marinara-capability-villages";
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
const synthetic = (color) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536"><circle cx="512" cy="180" r="130" fill="${color}"/><path d="M340 320h344l90 620H250zM350 900h130v620H330zM544 900h130l30 620H544z" fill="${color}"/></svg>`).toString("base64")}`;
// Optional local artwork is read directly and never copied into source or committed.
const originals = process.env.VILLAGES_SPRITE_FILES
  ? JSON.parse(process.env.VILLAGES_SPRITE_FILES).map(
      (path) => `data:image/png;base64,${readFileSync(path).toString("base64")}`,
    )
  : null;
const art = originals ?? ["#5eb8ee", "#b99c71", "#426fe4", "#d4b38c"].map(synthetic);
const sizes = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 1440, height: 900 },
];
const cases = sizes.flatMap((size) => [1, 2, 3, 4].map((count) => ({ ...size, count, mode: "sprites" })));
cases.push(
  ...["mixed", "portraits", "initials", "broken-sprite", "broken-portrait"].map((mode) => ({
    width: 390,
    height: 844,
    count: 4,
    mode,
  })),
);
try {
  for (const { width, height, count, mode } of cases) {
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
    fixture.villagers = fixture.villagers.map((person, index) => ({
      ...person,
      sprite:
        ["portraits", "initials", "broken-portrait"].includes(mode) || (mode === "mixed" && index % 2 === 1)
          ? null
          : {
              ...person.sprite,
              images: [
                {
                  view: "front",
                  label: "neutral",
                  isDefault: true,
                  url: mode === "broken-sprite" ? "http://scene-groups.test/missing.png" : art[index],
                },
              ],
            },
    }));
    const castIds = residents.slice(0, count).map((person) => person.characterId);
    const session = {
      version: 1,
      stagingVersion: 1,
      memoryMode: "live",
      id: "grouped-scene",
      placeId: "mill",
      placeName: "The Mill",
      zoneId: "exterior",
      area: "public",
      startedAt: now,
      lastActivityAt: now,
      endedAt: "",
      status: "active",
      activeIds: castIds,
      participants: residents
        .slice(0, count)
        .map(({ characterId, name }) => ({ characterId, name, doing: "listening" })),
      lines: [
        {
          id: "intro",
          role: "assistant",
          speakerId: "__venue_scene__",
          kind: "narration",
          content: "The group gathers by the window.",
          at: now,
        },
        {
          id: "speech",
          role: "assistant",
          speakerId: castIds[Math.min(2, count - 1)],
          name: residents[Math.min(2, count - 1)].name,
          kind: "dialogue",
          content:
            "**The doorway could go here. We have plenty of space to talk. Everyone can see the rough sketch.** ".repeat(
              5,
            ),
          at: now,
        },
      ],
      submissions: [],
    };
    await page.route("http://scene-groups.test/missing.png", (route) =>
      route.fulfill({ status: 404, body: "missing" }),
    );
    await page.route("**/api/characters/summaries", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          residents.map((person, index) => ({
            id: person.characterId,
            avatarUrl:
              mode === "initials"
                ? ""
                : mode === "broken-portrait"
                  ? "http://scene-groups.test/missing.png"
                  : art[index],
            avatarCrop: null,
          })),
        ),
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = fixture;
      if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) value = { session };
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
      else if (path.endsWith("/rooms/turn")) {
        const { message, submissionId } = route.request().postDataJSON();
        const id = `reply-${session.lines.length}`;
        session.lines.push(
          { id: `player-${id}`, role: "user", speakerId: "", name: "", content: message, at: now },
          {
            id,
            role: "assistant",
            speakerId: castIds[0],
            name: residents[0].name,
            kind: "dialogue",
            content: "We can see one another clearly.",
            at: now,
            ...(message === "Move to center" ? { staging: [{ characterId: castIds[0], position: "center" }] } : {}),
          },
        );
        session.submissions.push({
          id: submissionId,
          replyLineIds: [id],
          activeIdsAtTurn: session.activeIds,
          activeIdsAfterTurn: session.activeIds,
        });
        value = { session, recordEvents: [] };
      } else if (path.endsWith("/rooms/end") || path.endsWith("/rooms/close")) {
        session.status = "closed";
        session.endedAt = now;
        value = { session, recordEvents: [] };
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.route("http://scene-groups.test/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#d94491;--muted-foreground:#c4cbd7;--secondary:#384253}html,body{margin:0;width:100%;height:100%;overflow:hidden;font-family:Arial}[data-component=HomeBrowserHub]{height:100%;display:flex;flex-direction:column}.mari-home-browser-chrome{height:48px;flex-shrink:0;display:flex;align-items:center;justify-content:space-around;background:#201c25;color:#eee}main{flex:1;min-height:0;overflow:auto}${tag}{display:block;width:100%;height:100%}</style><div data-component="HomeBrowserHub"><header class="mari-home-browser-chrome"><span>Marinara</span><span>⌂ Home</span><span>Professor Mari</span><strong>Villages</strong></header><main data-component="HomeBrowserHub.Content"><${tag}></${tag}></main></div>`,
      }),
    );
    await page.goto("http://scene-groups.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const host = page.locator(tag);
    const people = page.locator(`.${tag}-chat-cast-person`);
    const person = (id) => page.locator(`.${tag}-chat-cast-person[data-character-id="${id}"]`);
    const input = page.locator(`.${tag}-chat-input`);
    const composer = page.getByRole("textbox", { name: "Message at The Mill" });
    const reading = page.getByRole("region", { name: "Current paragraph" });
    const next = page.getByRole("button", { name: "Next paragraph" });
    const previous = page.getByRole("button", { name: "Previous paragraph" });
    const counter = page.locator(`.${tag}-chat-vn-counter`);
    const screenshot = async (state = "active") => {
      if (!process.env.VILLAGES_VISUAL_OUTPUT) return;
      mkdirSync(process.env.VILLAGES_VISUAL_OUTPUT, { recursive: true });
      await page.screenshot({
        path: resolve(
          process.env.VILLAGES_VISUAL_OUTPUT,
          `scene-groups-${count}-${mode}-${width}x${height}-${state}.png`,
        ),
      });
    };
    await expect(reading).toBeVisible();
    await expect(page.locator(".mari-home-browser-chrome")).toBeVisible();
    await expect(people).toHaveCount(count);
    await expect.poll(() => host.evaluate((el) => el.clientHeight)).toBe(height - 48);
    if (mobile) {
      const positions =
        count === 1 ? [0.5] : count === 2 ? [0.26, 0.74] : count === 3 ? [0.11, 0.26, 0.74] : [0.11, 0.26, 0.74, 0.89];
      for (let i = 0; i < count; i++) {
        await expect
          .poll(() => person(castIds[i]).evaluate((el) => parseFloat(el.style.getPropertyValue("--cast-center")) / 100))
          .toBe(positions[i]);
        await expect
          .poll(() => person(castIds[i]).evaluate((el) => getComputedStyle(el).opacity))
          .toBe(i === Math.min(2, count - 1) ? "1" : "0.72");
      }
      const scene = await page.locator(`.${tag}-room-screen`).boundingBox();
      const frame = await input.boundingBox();
      assert.ok(Math.abs(scene.y + scene.height - frame.y - frame.height) < 1, "composer frame touches Scene bottom");
      if (mode === "sprites") {
        await expect(people.locator(":scope > img")).toHaveCount(count);
        const canvas = await page.locator(`.${tag}-chat-cast`).boundingBox();
        for (const image of await people.locator(":scope > img").all()) {
          const box = await image.boundingBox();
          assert.ok(
            Math.abs(box.width - Math.min(canvas.width * 0.7, (canvas.height * 2) / 3)) < 1,
            "sprite scale is independent of cast count",
          );
          assert.ok(box.y >= canvas.y - 1, "sprite heads stay clear of top controls");
          if (width === 390) {
            const dock = await page.locator(`.${tag}-chat-vn`).boundingBox();
            assert.ok(dock.y - box.y >= box.height * 0.7, "majority of each character stays above ordinary dock");
          }
        }
      } else {
        const expectedFallbacks = mode === "mixed" ? 2 : 4;
        await expect(page.locator(`.${tag}-chat-cast-person[data-sprite="false"]`)).toHaveCount(expectedFallbacks);
        for (const fallback of await page.locator(`.${tag}-chat-cast-person[data-sprite="false"]`).all()) {
          const avatar = fallback.locator(`.${tag}-avatar`);
          assert.equal((await avatar.boundingBox()).width, 80);
          assert.equal((await avatar.boundingBox()).height, 80);
          if (["initials", "broken-portrait"].includes(mode)) {
            await expect(avatar.locator("img")).toHaveCount(0);
            await expect(avatar).not.toHaveText("");
          }
        }
      }
      const boxes = () =>
        people.evaluateAll((nodes) =>
          nodes.map((node) => {
            const { x, y, width, height } = node.getBoundingClientRect();
            return { x, y, width, height };
          }),
        );
      const baseline = await boxes();
      if (mode === "sprites") {
        await next.click();
        await expect(counter).toContainText("Page 2/");
        assert.deepEqual(await boxes(), baseline, "display paging does not move the cast");
        await previous.click();
        await previous.click();
        await expect(counter).toHaveText("Paragraph 1/2");
        for (const resident of await people.all())
          await expect.poll(() => resident.evaluate((el) => getComputedStyle(el).opacity)).toBe("0.72");
        await next.click();
        assert.deepEqual(await boxes(), baseline, "speaker changes do not rearrange the cast");
      }
      await composer.fill("A very long draft that wraps. ".repeat(35));
      assert.deepEqual(await boxes(), baseline, "draft height does not move the cast");
      assert.ok(await composer.evaluate((el) => el.scrollHeight > el.clientHeight));
      await composer.fill("Preserve this draft.");
      const text = await reading.innerText();
      await page.getByRole("button", { name: "Hide dialogue", exact: true }).click();
      await expect(reading).toBeHidden();
      assert.deepEqual(await boxes(), baseline, "hiding does not move the cast");
      await page.getByRole("button", { name: "Show dialogue", exact: true }).click();
      // Restore deliberately focuses the reading region on the next frame.
      // Finish that transition before simulating a tap into the composer.
      await expect(reading).toBeFocused();
      await expect(composer).toHaveValue("Preserve this draft.");
      assert.equal(await reading.innerText(), text);
      if (width === 390) {
        await composer.focus();
        await expect(composer).toBeFocused();
        await page.evaluate(() => {
          window.sceneViewport.height -= 280;
          window.sceneViewport.dispatchEvent(new Event("resize"));
        });
        await expect(host).toHaveAttribute("data-scene-keyboard", "");
        assert.deepEqual(await boxes(), baseline, "keyboard movement does not shrink or reposition the cast");
        assert.equal(await reading.innerText(), text);
        const keyboardInput = await input.boundingBox();
        assert.ok(Math.abs(keyboardInput.y + keyboardInput.height - (height - 280)) < 1);
        await screenshot("keyboard");
        await page.getByRole("button", { name: "Hide dialogue", exact: true }).click();
        assert.equal(
          await page.locator("textarea[data-villages-scene-composer]").evaluate((el) => el === document.activeElement),
          false,
          "hide dismisses keyboard focus",
        );
        await page.evaluate(() => {
          window.sceneViewport.height += 280;
          window.sceneViewport.dispatchEvent(new Event("resize"));
        });
        await expect(host).not.toHaveAttribute("data-scene-keyboard", "");
        await page.getByRole("button", { name: "Show dialogue", exact: true }).click();
        await expect(reading).toBeFocused();
      }
      await screenshot();
      if (count === 4 && mode === "sprites") {
        await composer.fill("Move to center");
        await page.getByRole("button", { name: "Send", exact: true }).click();
        await expect(counter).toContainText("Paragraph");
        await expect
          .poll(() => person(castIds[0]).evaluate((el) => el.style.getPropertyValue("--cast-center")))
          .toBe("50%");
      }
    } else {
      await expect(counter).toHaveText("2 / 2");
      await expect(page.getByRole("button", { name: "Hide dialogue", exact: true })).toBeHidden();
    }
    await page.getByRole("button", { name: "Venue actions" }).click();
    await page.getByRole("menuitem", { name: "End Scene now" }).click();
    await expect(composer).toHaveCount(0);
    await expect
      .poll(
        async () => {
          const ended = await page.locator(`.${tag}-chat-vn-card`).boundingBox();
          return Math.abs(ended.y + ended.height - height);
        },
        { message: `ended dialogue reaches its normal bottom position (${count}, ${mode}, ${width}x${height})` },
      )
      .toBeLessThanOrEqual(mobile ? 1 : 13);
    await screenshot("ended");
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Mobile Scenes: visible toolbar, grouped scale, speaker opacity, portrait/initial/error fallbacks, dock edges, keyboard, drafts and staging passed",
  );
} finally {
  await browser.close();
}
