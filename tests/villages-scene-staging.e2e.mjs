import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import { sceneFixture, scenePlaybackFixtures } from "./fixtures/scene-browser.fixture.mjs";
const sceneBundle = await sceneFixture();
const { authorSceneResponse } = await scenePlaybackFixtures();
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";

const browser = await chromium.launch({
  headless: true,
});
import { now, residents, longGreeting, mapImage, snapshot } from "./fixtures/villages-scene-browser.fixture.mjs";

// Match the transparent canvas used by Sprite Manager rather than a narrow test image.
const spriteImage = (color) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536"><g transform="scale(2)"><circle cx="256" cy="100" r="70" fill="${color}"/><path d="M175 180h162l65 360H110zM175 530h60v238h-70zM277 530h60l35 238h-70z" fill="${color}"/></g></svg>`).toString("base64")}`;

try {
  for (const { width, height } of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 360, height: 640 },
    { width: 1440, height: 900 },
  ]) {
    for (let count = 1; count <= 4; count++) {
      const page = await browser.newPage({ viewport: { width, height } });
      await mockEngineLookups(page);
      await page.addInitScript(() => {
        window.spriteFlips = [];
        const animate = Element.prototype.animate;
        Element.prototype.animate = function (frames, options) {
          if (this.tagName === "IMG" && this.parentElement?.dataset.characterId === "mara")
            window.spriteFlips.push({
              frames,
              duration: options.duration,
              src: this.getAttribute("src"),
              facing: this.dataset.facing,
            });
          const animation = animate.call(this, frames, options);
          if (this.tagName === "IMG" && window.holdSpriteFlips) animation.pause();
          return animation;
        };
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const castIds = residents.slice(0, count).map((person) => person.characterId);
      const thoughts = spriteImage("#fadd70");
      const side = spriteImage("#e478ac");
      const fixture = {
        ...snapshot,
        settings: { ...snapshot.settings, ...(count === 4 ? { spriteCardFlipEnabled: false } : {}) },
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
                    {
                      view: "front",
                      label: "delayed",
                      expressionId: "e-delayed",
                      url: "http://villages.test/delayed.png",
                    },
                    {
                      view: "front",
                      label: "failed",
                      expressionId: "e-failed",
                      url: "http://villages.test/failed.png",
                    },
                  ],
                },
        })),
      };
      let session = {
        version: 2,
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
      let failSpriteSave = false;
      const api = async (route) => {
        const path = new URL(route.request().url()).pathname;
        if (path.endsWith("/background/presence"))
          return fulfill(route, { json: { status: "ready", snapshot: fixture } });
        let value = fixture;
        if (path.endsWith("/settings") && route.request().method() === "PATCH") {
          if (failSpriteSave)
            return fulfill(route, {
              status: 500,
              contentType: "application/json",
              body: JSON.stringify({ message: "Setting save failed" }),
            });
          Object.assign(fixture.settings, route.request().postDataJSON());
        } else if (path.endsWith("/interpretation-settings")) {
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
          if (body.message.startsWith("sprite:")) {
            const lineId = `sprite-${session.lines.length}`;
            session.lines.push(
              { id: lineId + "-player", role: "user", speakerId: "", name: "", content: body.message, at: now },
              {
                id: lineId,
                role: "assistant",
                kind: "dialogue",
                speakerId: "mara",
                name: "Mara",
                content: "A different expression.",
                expression: body.message.slice(7),
                at: now,
              },
            );
            session.submissions.push({
              id: body.submissionId,
              activeIdsAtTurn: castIds,
              activeIdsAfterTurn: castIds,
              replyLineIds: [lineId],
            });
          } else if (phase === 1) {
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
          }
          value = { session, verdict: null, action: null, recordEvents: [] };
        }
        await fulfill(route, {
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(authorSceneResponse(value, fixture.worldScope)),
        });
      };
      await page.route("**/api/villages**", api);
      async function mount(target = page) {
        await target.route("http://villages.test/", (route) =>
          fulfill(route, {
            status: 200,
            contentType: "text/html",
            body: '<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7;--secondary:#384253}html,body{margin:0;width:100%;height:100%;background:var(--background);color:var(--foreground);font-family:Arial}marinara-capability-villages{display:block;width:100%;height:100%}</style><header data-component="TopBar" style="height:44px;overflow:hidden;display:flex;align-items:flex-start"><button data-topbar-more style="width:44px;height:44px" aria-label="Engine menu">Menu</button></header><div style="height:calc(100% - 44px)"><marinara-capability-villages></marinara-capability-villages></div>',
          }),
        );
        await target.goto("http://villages.test/");
        await target.addScriptTag({ content: sceneBundle });
      }
      await mount();
      const cast = page.locator(".marinara-capability-villages-chat-cast");
      const people = cast.locator(".marinara-capability-villages-chat-cast-person");
      const mara = cast.locator('[data-character-id="mara"]');
      const composer = page.getByRole("textbox", { name: "Message at The Mill" });
      const mobile = width <= 704;
      await page.getByRole("button", { name: "Venue actions" }).click();
      await page.getByRole("menuitem", { name: "Scene settings", exact: true }).click();
      const flipEnabled = count < 4;
      await expect(page.getByRole("checkbox", { name: "Card-flip sprite changes" })).toHaveCount(0);
      const decisionSwitch = page.getByRole("switch", { name: "Use Decisions" });
      await expect(decisionSwitch).toBeVisible();
      await expect(decisionSwitch).toBeEnabled();
      await expect(decisionSwitch).toHaveAttribute("aria-checked", "false");
      await decisionSwitch.focus();
      await page.keyboard.press("Space");
      await expect(decisionSwitch).toHaveAttribute("aria-checked", "true");
      await expect(page.getByText("Using System fallback", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "0 checks", exact: true }).click();
      await expect(page.getByRole("checkbox", { name: "Compare with System" })).toHaveCount(0);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("region", { name: "Interpretation checks" })).toHaveCount(0);
      const switchBox = await decisionSwitch.boundingBox();
      assert.ok(switchBox.x >= 0 && switchBox.x + switchBox.width <= width && switchBox.y >= 0);
      await page.getByRole("button", { name: "Close Scene settings" }).click();
      async function checkSpriteSize(isMobile) {
        // ResizeObserver updates the Scene's container measurements after rotation.
        // Wait for the resulting layout, while still requiring the dock to fit.
        await expect
          .poll(
            async () => {
              const dock = await page.locator(".marinara-capability-villages-chat-vn").boundingBox();
              return dock !== null && dock.y >= 0 && dock.y + dock.height <= page.viewportSize().height + 1;
            },
            { message: "reading and composer stay on screen" },
          )
          .toBe(true);
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
            assert.ok(
              box.x < floor.right && box.right > floor.x,
              "large sprites can clip at screen edges while staying on stage",
            );
            assert.ok(box.y >= floor.y - 1 && box.bottom <= floor.bottom + 1, "artwork stays above the reading dock");
            assert.ok(
              Math.abs(box.width - Math.min(floor.width * 0.7, (floor.height * 2) / 3)) < 1,
              "mobile artwork is independent of slot width",
            );
            assert.ok(
              Math.abs(box.height - Math.min(floor.height, floor.width * 0.7 * 1.5)) < 1,
              "mobile image box keeps its 2:3 framing",
            );
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
      // The mobile composer appears only on the last page of the long greeting.
      const greetingNext = page.getByRole("button", { name: "Next paragraph" });
      for (
        let pageIndex = 0;
        pageIndex < 30 && !(await composer.count()) && (await greetingNext.isEnabled());
        pageIndex++
      )
        await greetingNext.click();
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
      await expect(mara.locator("img")).toHaveAttribute("data-flipping", "false");
      const firstFlips = await page.evaluate(() => window.spriteFlips);
      assert.equal(firstFlips.length, flipEnabled ? 2 : 0, "simultaneous artwork and facing changes share one flip");
      if (flipEnabled) {
        assert.deepEqual(
          firstFlips.map((flip) => flip.duration),
          [150, 150],
        );
        assert.notEqual(firstFlips[0].src, thoughts, "outgoing half retains old artwork");
        assert.equal(firstFlips[1].src, thoughts, "incoming half uses replacement artwork");
        assert.match(firstFlips[0].frames[1].transform, /rotateY\(90deg\)/);
        assert.match(firstFlips[1].frames[0].transform, /rotateY\(-90deg\)/);
        assert.equal(
          await mara.locator("span").evaluate((node) => node.getAnimations().length),
          0,
          "name does not rotate",
        );
      }
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
        if (mobile) assert.ok(sorted[i].right > 0 && sorted[i].x < width, "large grouped sprites intersect the Scene");
        else assert.ok(sorted[i].x >= 0 && sorted[i].right <= width, "desktop sprites fit within screen");
        if (i && !mobile)
          assert.ok(sorted[i - 1].right <= sorted[i].x + 1, "desktop shared-zone sprites do not overlap");
        if (!mobile)
          assert.ok(Math.abs(sorted[i].bottom - sorted[0].bottom) < 1, "desktop sprites retain a shared foot baseline");
      }
      await next.click();
      await expect(mara).toHaveAttribute("data-attention", "right", "side cue appears with the final paragraph");
      await expect(mara.locator("img")).toHaveAttribute("data-facing", "right");
      await expect(mara.locator("img")).toHaveAttribute("data-flipping", "false");
      assert.equal(
        await page.evaluate(() => window.spriteFlips.length),
        flipEnabled ? 4 : 0,
        "facing-only changes flip once",
      );
      await next.click();
      await expect(mara.locator("img")).toHaveAttribute("src", thoughts);
      assert.equal(
        await page.evaluate(() => window.spriteFlips.length),
        flipEnabled ? 4 : 0,
        "unchanged artwork and facing do not flip",
      );
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
      const flipsBeforeReducedMotion = await page.evaluate(() => window.spriteFlips.length);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await next.click();
      assert.equal(
        await page.evaluate(() => window.spriteFlips.length),
        flipsBeforeReducedMotion,
        "backward reading and reduced motion do not flip",
      );
      assert.equal(await mara.evaluate((node) => getComputedStyle(node).transitionDuration), "0s");
      await next.click();
      if (process.env.VILLAGES_VISUAL_OUTPUT)
        await page.screenshot({
          path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, `staging-${count}-${width}x${height}.png`),
        });
      // A refresh restores latest saved visual state without animation.
      await page.reload();
      await page.addScriptTag({ content: sceneBundle });
      await expect(mara).toHaveAttribute("data-position", "right");
      await expect(mara).toHaveAttribute("data-attention", "right");
      await expect(mara.locator("img")).toHaveAttribute("src", thoughts);
      await expect(cast).toHaveAttribute("data-animate", "false");
      assert.equal(await page.evaluate(() => window.spriteFlips.length), 0, "restored Scene does not flip");
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
      session = { ...session, id: "sprite-" + count, activeIds: castIds, lines: [session.lines[0]], submissions: [] };
      fixture.villagers[0].sprite.framing.mode = "half";
      await page.reload();
      await page.addScriptTag({ content: sceneBundle });
      await expect(mara.locator("img")).toHaveAttribute("data-framing", "half");
      await checkSpriteSize(mobile);
      if (count === 1 && width === 1440) {
        await page.emulateMedia({ reducedMotion: "no-preference" });
        const img = mara.locator("img");
        const initialArtwork = await img.getAttribute("src");
        const sendExpression = async (expression) => {
          await composer.fill("sprite:" + expression);
          await page.getByRole("button", { name: "Send", exact: true }).click();
        };
        await sendExpression("e-thinking");
        await expect(img).toHaveAttribute("src", thoughts);
        await expect(img).toHaveAttribute("data-flipping", "false");
        assert.equal(await page.evaluate(() => window.spriteFlips.length), 2, "artwork-only changes flip once");
        await previous.click();
        await expect(img).toHaveAttribute("src", initialArtwork);
        await page.evaluate(() => {
          window.holdSpriteFlips = true;
        });
        await next.click();
        await expect.poll(() => page.evaluate(() => window.spriteFlips.length)).toBeGreaterThan(2);
        await expect(img).toHaveAttribute("data-flipping", "out");
        await previous.click();
        await expect(img).toHaveAttribute("data-flipping", "false");
        assert.equal(
          await img.evaluate((node) => node.getAnimations().length),
          0,
          "rapid navigation cancels pending rotation",
        );
        await next.click();
        await expect(img).toHaveAttribute("data-flipping", "out");
        await page.emulateMedia({ reducedMotion: "reduce" });
        await expect(img).toHaveAttribute("data-flipping", "false");
        assert.equal(
          await img.evaluate((node) => node.getAnimations().length),
          0,
          "reduced motion cancels an active flip",
        );
        await page.evaluate(() => {
          window.holdSpriteFlips = false;
        });
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await expect(img).toHaveAttribute("src", thoughts);
        await expect(img).toHaveAttribute("data-flipping", "false");
        await previous.click();
        await page.evaluate(() => {
          window.holdSpriteFlips = true;
        });
        await next.click();
        await expect(img).toHaveAttribute("data-flipping", "out");
        await page.getByRole("button", { name: "Venue actions" }).click();
        await page.getByRole("menuitem", { name: "Scene settings", exact: true }).click();
        fixture.settings.spriteCardFlipEnabled = false;
        await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
        await expect(img).toHaveAttribute("data-flipping", "false");
        await expect(img).toHaveAttribute("src", thoughts);
        assert.equal(
          await img.evaluate((node) => node.getAnimations().length),
          0,
          "disabling the shared toggle cancels an active flip",
        );
        fixture.settings.spriteCardFlipEnabled = true;
        await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
        await page.getByRole("button", { name: "Close Scene settings" }).click();
        await page.evaluate(() => {
          window.holdSpriteFlips = false;
        });
        let releaseArtwork;
        const artworkReady = new Promise((resolve) => {
          releaseArtwork = resolve;
        });
        await page.route("http://villages.test/delayed.png", async (route) => {
          await artworkReady;
          await fulfill(route, { contentType: "image/svg+xml", body: Buffer.from(thoughts.split(",")[1], "base64") });
        });
        const beforeLoading = await page.evaluate(() => window.spriteFlips.length);
        const requested = page.waitForRequest("http://villages.test/delayed.png");
        await sendExpression("e-delayed");
        await requested;
        assert.equal(await img.getAttribute("src"), thoughts, "old artwork remains visible until replacement loads");
        assert.equal(
          await page.evaluate(() => window.spriteFlips.length),
          beforeLoading,
          "loading does not start a flip: " + JSON.stringify(await page.evaluate(() => window.spriteFlips)),
        );
        releaseArtwork();
        await expect(img).toHaveAttribute("src", "http://villages.test/delayed.png");
        await expect(img).toHaveAttribute("data-flipping", "false");
        await page.route("http://villages.test/failed.png", (route) =>
          fulfill(route, { status: 404, body: "missing" }),
        );
        await sendExpression("e-failed");
        await expect(img).toHaveAttribute("src", initialArtwork);
        await expect(img).toHaveAttribute("data-flipping", "false");
        assert.equal(
          await img.evaluate((node) => node.complete && node.naturalWidth > 0),
          true,
          "failed artwork returns to a loaded default",
        );
      }
      if (process.env.VILLAGES_VISUAL_OUTPUT)
        await page.screenshot({
          path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, `staging-half-${count}-${width}x${height}.png`),
        });
      assert.deepEqual(errors, []);
      await page.close();
    }
  }
  // A side-only expression must not override a later turn toward the player.
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    const page = await browser.newPage({ viewport });
    await mockEngineLookups(page);
    const front = spriteImage("#a7c7ff");
    const side = spriteImage("#fadd70");
    const castIds = residents.slice(0, 2).map((person) => person.characterId);
    const fixture = {
      ...snapshot,
      villagers: residents.slice(0, 2).map((person) => ({
        ...person,
        sprite: {
          ...person.sprite,
          images: [
            { view: "front", label: "neutral", expressionId: "e-neutral", isDefault: true, url: front },
            { view: "side", direction: "right", label: "smile", expressionId: "e-smile", url: side },
          ],
        },
      })),
    };
    const session = {
      version: 2,
      stagingVersion: 1,
      id: "attention-views",
      placeId: "mill",
      placeName: "The Mill",
      spaceClass: "workplace",
      area: "public",
      startedAt: now,
      lastActivityAt: now,
      endedAt: "",
      status: "active",
      activeIds: castIds,
      participants: residents.slice(0, 2).map(({ characterId, name }) => ({ characterId, name })),
      lines: [
        {
          id: "residents",
          role: "assistant",
          kind: "dialogue",
          speakerId: "mara",
          name: "Mara",
          content: "Let us discuss the landing.",
          at: now,
          staging: castIds.map((characterId, index) => ({
            characterId,
            expression: "e-smile",
            look: { target: "villager", characterId: castIds[1 - index] },
          })),
        },
        {
          id: "player",
          role: "assistant",
          kind: "dialogue",
          speakerId: "mara",
          name: "Mara",
          content: "Welcome. Come join us.",
          at: now,
          staging: castIds.map((characterId) => ({ characterId, look: { target: "player" } })),
        },
      ],
      submissions: [],
    };
    await page.route("**/api/villages**", (route) => {
      const path = new URL(route.request().url()).pathname;
      const value = path.endsWith("/rooms/active") ? { session } : fixture;
      return fulfill(route, {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(authorSceneResponse(value, fixture.worldScope)),
      });
    });
    await page.route("http://villages.test/", (route) =>
      fulfill(route, {
        contentType: "text/html",
        body: "<style>html,body{margin:0;width:100%;height:100%;background:#171b25;color:white}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.goto("http://villages.test/");
    await page.addScriptTag({ content: sceneBundle });
    const people = page.locator(".marinara-capability-villages-chat-cast-person");
    const previous = page.getByRole("button", { name: "Previous paragraph" });
    await expect(people).toHaveCount(2);
    await expect(people.first().locator("img")).toHaveAttribute("src", front);
    await expect(people.last().locator("img")).toHaveAttribute("src", front);
    await previous.click();
    await expect(people.first()).toHaveAttribute("data-attention", "right");
    await expect(people.last()).toHaveAttribute("data-attention", "left");
    await expect(people.first().locator("img")).toHaveAttribute("src", side);
    await expect(people.last().locator("img")).toHaveAttribute("src", side);
    await expect(people.first().locator("img")).toHaveCSS("transform", "none");
    await expect(people.last().locator("img")).toHaveCSS("transform", "matrix(-1, 0, 0, 1, 0, 0)");
    await page.getByRole("button", { name: "Next paragraph" }).click();
    for (const person of await people.all()) {
      await expect(person).toHaveAttribute("data-attention", "front");
      await expect(person.locator("img")).toHaveAttribute("src", front);
      await expect(person.locator("img")).toHaveAttribute("data-facing", "front");
      await expect(person.locator("img")).toHaveAttribute("data-flipping", "false");
    }
    if (process.env.VILLAGES_VISUAL_OUTPUT)
      await page.screenshot({
        path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, "facing-player-" + viewport.width + ".png"),
      });
    await page.reload();
    await page.addScriptTag({ content: sceneBundle });
    await expect(people.first().locator("img")).toHaveAttribute("src", front);
    await expect(people.last().locator("img")).toHaveAttribute("src", front);
    await page.close();
  }
  console.log(
    "Villages staging browser checks: one through four residents, four viewports, framing, movement, card flips, shared settings, failures, loading, cancellation, replay, refresh, departures, legacy visits, and reduced motion passed",
  );
} finally {
  await browser.close();
}
