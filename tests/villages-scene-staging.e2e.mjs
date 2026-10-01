import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
import { now, residents, longGreeting, mapImage, snapshot } from "./fixtures/villages-scene-browser.fixture.mjs";

// Match the transparent canvas used by Sprite Studio rather than a narrow test image.
const spriteImage = (color) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="768"><circle cx="256" cy="100" r="70" fill="${color}"/><path d="M175 180h162l65 360H110zM175 530h60v238h-70zM277 530h60l35 238h-70z" fill="${color}"/></svg>`).toString("base64")}`;

try {
  for (const { width, height } of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 1440, height: 900 },
  ]) {
    for (let count = 1; count <= 4; count++) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const castIds = residents.slice(0, count).map((person) => person.characterId);
      const thoughts = spriteImage("#fadd70");
      const side = spriteImage("#e478ac");
      const fixture = {
        ...snapshot,
        villagers: residents.map((person, index) => ({
          ...person,
          sprite:
            index === 3
              ? null
              : {
                  ...person.sprite,
                  images: [
                    { view: "front", label: "neutral", url: spriteImage("#e8ba91") },
                    { view: "side", label: "neutral", url: side },
                    { view: "front", label: "thinking", expressionId: "e-thinking", url: thoughts },
                    { view: "side", label: "thinking", expressionId: "e-thinking", url: thoughts },
                  ],
                },
        })),
      };
      let session = {
        version: 1,
        stagingVersion: 1,
        id: `staging-${count}`,
        placeId: "mill",
        placeName: "The Mill",
        spaceClass: "workplace",
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
            id: "opening",
            role: "assistant",
            speakerId: "__venue_scene__",
            kind: "narration",
            name: "",
            content: longGreeting,
            at: now,
          },
        ],
        submissions: [],
      };
      let phase = 0;
      let interpretationSettings = { decisionsEnabled: false, compareSystem: true };
      await page.route("**/api/villages**", async (route) => {
        const path = new URL(route.request().url()).pathname;
        let value = fixture;
        if (path.endsWith("/interpretation-settings")) {
          if (route.request().method() === "PATCH")
            interpretationSettings = { ...interpretationSettings, ...route.request().postDataJSON() };
          value = {
            settings: interpretationSettings,
            status: { available: false, reason: "No selected Decision model", engineBuild: null },
          };
        } else if (path.includes("/interpretation-diagnostics/")) value = { checks: [] };
        else if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) value = { session };
        else if (path.endsWith("/town-map")) value = { image: mapImage };
        else if (path.endsWith("/rooms/turn")) {
          const body = route.request().postDataJSON();
          phase++;
          if (phase === 1) {
            session.lines.push(
              { id: "player", role: "user", speakerId: "", name: "", content: body.message, at: now },
              {
                id: "movement",
                role: "assistant",
                kind: "narration",
                speakerId: "__venue_scene__",
                name: "",
                at: now,
                content:
                  "They make room near the right-hand window.\n\nThe conversation pauses while Mara considers the suggestion.",
                staging: castIds.map((characterId) => ({
                  characterId,
                  position: "right",
                  expression: "e-thinking",
                  look: characterId === "mara" ? { target: "direction", direction: "left" } : { target: "player" },
                })),
              },
              {
                id: "aside",
                role: "assistant",
                kind: "side",
                speakerId: "mara",
                name: "Mara",
                asideFor: "movement",
                content: "One more thought.",
                at: now,
                staging: [{ characterId: "mara", look: { target: "direction", direction: "right" } }],
              },
              {
                id: "ordinary",
                role: "assistant",
                kind: "dialogue",
                speakerId: "mara",
                name: "Mara",
                content: "We can think it through.",
                at: now,
              },
            );
            session.submissions.push({
              id: body.submissionId,
              activeIdsAtTurn: castIds,
              activeIdsAfterTurn: castIds,
              replyLineIds: ["movement", "aside", "ordinary"],
            });
          } else if (phase === 2) {
            session.lines.push(
              { id: "player-2", role: "user", speakerId: "", name: "", content: body.message, at: now },
              {
                id: "bye",
                role: "assistant",
                kind: "dialogue",
                speakerId: castIds.at(-1),
                name: "Departing resident",
                content: "I am heading out now.",
                at: now,
              },
            );
            session.activeIds = castIds.slice(0, -1);
            session.submissions.push({
              id: body.submissionId,
              activeIdsAtTurn: castIds,
              activeIdsAfterTurn: session.activeIds,
              replyLineIds: ["bye"],
            });
          } else {
            session = {
              ...session,
              stagingVersion: undefined,
              activeIds: castIds,
              lines: [session.lines[0]],
              submissions: [],
            };
          }
          value = { session, verdict: null, action: null, recordEvents: [] };
        }
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
      });
      async function mount() {
        await page.route("http://villages.test/", (route) =>
          route.fulfill({
            status: 200,
            contentType: "text/html",
            body: "<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7;--secondary:#384253}html,body{margin:0;width:100%;height:100%;background:var(--background);color:var(--foreground);font-family:Arial}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
          }),
        );
        await page.goto("http://villages.test/");
        await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      }
      await mount();
      const cast = page.locator(".marinara-capability-villages-chat-cast");
      const people = cast.locator(".marinara-capability-villages-chat-cast-person");
      const mara = cast.locator('[data-character-id="mara"]');
      const composer = page.getByRole("textbox", { name: "Message at The Mill" });
      const mobile = width <= 704 || (width <= 880 && height <= 512);
      const decisionSwitch = page.getByRole("switch", { name: "Use Decisions" });
      await expect(decisionSwitch).toBeVisible();
      await expect(decisionSwitch).toHaveAttribute("aria-checked", "false");
      await decisionSwitch.focus();
      await page.keyboard.press("Space");
      await expect(decisionSwitch).toHaveAttribute("aria-checked", "true");
      await expect(page.getByText("Using System fallback", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "0 checks", exact: true }).click();
      await expect(page.getByRole("checkbox", { name: "Compare with System" })).toBeChecked();
      await page.getByRole("checkbox", { name: "Compare with System" }).uncheck();
      await expect.poll(() => interpretationSettings.compareSystem).toBe(false);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("region", { name: "Interpretation checks" })).toHaveCount(0);
      const switchBox = await decisionSwitch.boundingBox();
      assert.ok(switchBox.x >= 0 && switchBox.x + switchBox.width <= width && switchBox.y >= 0);
      async function checkSpriteSize(isMobile) {
        const measurements = await cast.evaluate((node) => {
          const floor = node.getBoundingClientRect();
          return [...node.querySelectorAll('[data-sprite="true"] > img')].map((image) => {
            const box = image.getBoundingClientRect();
            return {
              floor: {
                x: floor.x,
                right: floor.right,
                y: floor.y,
                bottom: floor.bottom,
                width: floor.width,
                height: floor.height,
              },
              box: { x: box.x, right: box.right, y: box.y, bottom: box.bottom, width: box.width, height: box.height },
              renderedHeight: Math.min(box.height, (box.width * image.naturalHeight) / image.naturalWidth),
              fit: getComputedStyle(image).objectFit,
              framing: image.dataset.framing,
            };
          });
        });
        for (const { floor, box, renderedHeight, fit, framing } of measurements) {
          assert.equal(fit, isMobile && framing === "half" ? "cover" : "contain");
          if (isMobile) {
            assert.ok(box.x >= floor.x - 1 && box.right <= floor.right + 1, "artwork stays within stage edges");
            assert.ok(box.y >= floor.y - 1 && box.bottom <= floor.bottom + 1, "artwork stays above the reading dock");
            assert.ok(
              Math.abs(box.width - Math.min(floor.width * 0.7, (floor.height * 2) / 3)) < 1,
              "mobile artwork is independent of slot width",
            );
            assert.ok(Math.abs(box.height - floor.height) < 1, "mobile image box fills stage height");
            if (framing === "full")
              assert.ok(
                Math.abs(renderedHeight - Math.min(floor.height, floor.width * 0.7 * 1.5)) < 1,
                "full-body art reaches its intended visible size",
              );
          }
        }
        const dock = await page.locator(".marinara-capability-villages-chat-vn").boundingBox();
        const viewport = page.viewportSize();
        assert.ok(dock.y >= 0 && dock.y + dock.height <= viewport.height + 1, "reading and composer stay on screen");
      }
      await expect(people).toHaveCount(count);
      await checkSpriteSize(mobile);
      await expect(cast).toHaveAttribute("data-staging", "true");
      await expect(mara).toHaveAttribute("data-position", "left");
      const defaults = await people.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-position")));
      assert.deepEqual(
        defaults,
        count === 1
          ? ["left"]
          : count === 2
            ? ["left", "right"]
            : count === 3
              ? ["left", "center", "right"]
              : ["left", "left", "right", "right"],
      );
      await composer.fill("Let us make room.");
      await page.getByRole("button", { name: "Send", exact: true }).click();
      const next = page.getByRole("button", { name: "Next paragraph" });
      const previous = page.getByRole("button", { name: "Previous paragraph" });
      await expect(page.getByRole("region", { name: "Current paragraph" })).toContainText(
        "They make room near the right-hand window.",
      );
      await expect(mara).toHaveAttribute("data-position", "right");
      await expect(mara).toHaveAttribute("data-attention", "left");
      await expect(mara.locator("img")).toHaveAttribute("data-facing", "left");
      await expect(mara.locator("img")).toHaveAttribute("src", thoughts);
      await expect(cast).toHaveAttribute("data-animate", "true");
      if (count > 1 && count < 4) await expect(people.last().locator("img")).toHaveAttribute("src", thoughts);
      if (count === 4) await expect(people.last().locator(".marinara-capability-villages-avatar")).toHaveCount(1);
      await expect.poll(() => mara.evaluate((node) => getComputedStyle(node).left)).not.toBe("0px");
      await page.waitForTimeout(250);
      const boxes = await people.evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return { x: r.x, right: r.right, y: r.y, bottom: r.bottom };
        }),
      );
      const sorted = [...boxes].sort((a, b) => a.x - b.x);
      for (let i = 0; i < sorted.length; i++) {
        assert.ok(sorted[i].x >= 0 && sorted[i].right <= width, "sprites fit within screen");
        if (i && !mobile)
          assert.ok(sorted[i - 1].right <= sorted[i].x + 1, "desktop shared-zone sprites do not overlap");
        assert.ok(Math.abs(sorted[i].bottom - sorted[0].bottom) < 1, "sprites retain a shared foot baseline");
      }
      await next.click();
      await expect(mara).toHaveAttribute("data-attention", "right", "side cue appears with the final paragraph");
      await next.click();
      await expect(mara.locator("img")).toHaveAttribute("src", thoughts);
      await checkSpriteSize(mobile);
      if (count > 1) {
        const layers = await people.evaluateAll((nodes) =>
          nodes.map((node) => ({
            active: node.dataset.active,
            layer: Number(getComputedStyle(node).zIndex) || 0,
            x: node.getBoundingClientRect().x,
            right: node.getBoundingClientRect().right,
          })),
        );
        assert.ok(
          layers.filter((person) => person.active !== "true").every((person) => person.layer < layers[0].layer),
          "current speaker paints above listeners",
        );
        if (mobile && count > 2) assert.ok(layers[0].right > layers[1].x, "crowded mobile sprites can overlap");
      }
      await previous.click();
      await previous.click();
      await expect(mara).toHaveAttribute("data-attention", "left");
      await expect(cast).toHaveAttribute("data-animate", "false");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await next.click();
      assert.equal(await mara.evaluate((node) => getComputedStyle(node).transitionDuration), "0s");
      await next.click();
      if (process.env.VILLAGES_VISUAL_OUTPUT)
        await page.screenshot({
          path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, `staging-${count}-${width}x${height}.png`),
        });
      // A refresh restores latest saved visual state without animation.
      await page.reload();
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await expect(mara).toHaveAttribute("data-position", "right");
      await expect(mara).toHaveAttribute("data-attention", "right");
      await expect(mara.locator("img")).toHaveAttribute("src", thoughts);
      await expect(cast).toHaveAttribute("data-animate", "false");
      if (count > 1) {
        const before = await mara.evaluate((node) => node.offsetLeft);
        await composer.fill("Until next time.");
        await page.getByRole("button", { name: "Send", exact: true }).click();
        await expect(people).toHaveCount(count - 1);
        assert.equal(await mara.evaluate((node) => node.offsetLeft), before, "departures preserve survivor positions");
        await previous.click();
        await expect(people).toHaveCount(count, "backward reading restores departed residents");
        await next.click();
      }
      if (width === 390) {
        await page.setViewportSize({ width: 844, height: 390 });
        await checkSpriteSize(true);
        await expect(mara).toHaveAttribute("data-position", "right");
        await page.setViewportSize({ width, height });
        await checkSpriteSize(true);
      }
      // Older visits retain their row centers with enlarged mobile artwork.
      await composer.fill("A legacy visit.");
      if (count === 1) phase = 2;
      await page.getByRole("button", { name: "Send", exact: true }).click();
      await expect(cast).toHaveAttribute("data-staging", "false");
      assert.equal(await mara.evaluate((node) => getComputedStyle(node).position), mobile ? "absolute" : "relative");
      await checkSpriteSize(mobile);
      fixture.villagers[0].sprite.framing.mode = "half";
      await page.reload();
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await expect(mara.locator("img")).toHaveAttribute("data-framing", "half");
      await checkSpriteSize(mobile);
      if (process.env.VILLAGES_VISUAL_OUTPUT)
        await page.screenshot({
          path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, `staging-half-${count}-${width}x${height}.png`),
        });
      assert.deepEqual(errors, []);
      await page.close();
    }
  }
  console.log(
    "Villages staging browser checks: one through four residents, four viewports, mobile sizing, overlap, rotation, waist-up framing, shared zones, side timing, replay, refresh, departures, legacy visits, and reduced motion passed",
  );
} finally {
  await browser.close();
}
