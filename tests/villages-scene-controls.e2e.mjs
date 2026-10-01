import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot, residents, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const tag = "marinara-capability-villages";
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
try {
  for (const { width, height } of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 1440, height: 900 },
  ]) {
    for (const count of [1, 2, 3, 4]) {
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
      const home = count % 2 === 1;
      const fixture = structuredClone(snapshot);
      fixture.settings.venues[0].occupancy.playerHome = home;
      fixture.settings.venues[0].classes = home ? ["residence"] : ["workplace"];
      const session = {
        version: 1,
        stagingVersion: 1,
        id: "scene-controls",
        placeId: "mill",
        placeName: "The Mill",
        spaceClass: home ? "residence" : "workplace",
        area: "public",
        zoneId: "exterior",
        startedAt: now,
        lastActivityAt: now,
        endedAt: "",
        status: "active",
        sceneRevision: 0,
        activeIds: residents.slice(0, count).map((person) => person.characterId),
        participants: residents
          .slice(0, count)
          .map(({ characterId, name }) => ({ characterId, name, doing: "listening" })),
        lines: [
          {
            id: "narration",
            role: "assistant",
            speakerId: "__venue_scene__",
            kind: "narration",
            name: "",
            content: "Rain taps against the window.",
            at: now,
          },
          {
            id: "dialogue",
            role: "assistant",
            speakerId: "mara",
            kind: "dialogue",
            name: "Mara",
            content: "Come in. I just put the kettle on.",
            at: now,
          },
        ],
        submissions: [],
      };
      let turns = 0;
      await page.route("**/api/villages**", async (route) => {
        const path = new URL(route.request().url()).pathname;
        let value = fixture;
        if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) value = { session };
        else if (path.endsWith("/interpretation-settings"))
          value = { settings: { decisionsEnabled: false, compareSystem: true }, status: { available: false } };
        else if (path.includes("/interpretation-diagnostics/")) value = { checks: [] };
        else if (path.endsWith("/rooms/turn")) {
          turns++;
          const { message } = route.request().postDataJSON();
          session.lines.push({ id: "player", role: "user", speakerId: "", name: "", content: message, at: now });
          value = { session, recordEvents: [] };
        }
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
      });
      await page.route("http://scene-controls.test/", (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/html",
          body: `<style>:root{--background:#101726;--foreground:#f2f2f5;--popover:#202938;--border:#4d5870;--primary:#af91eb;--secondary:#303b50;--muted-foreground:#bac4d7}html,body{margin:0;width:100%;height:100%;overflow:hidden;font-family:Arial} [data-component=HomeBrowserHub],.shell{height:100%;display:flex;flex-direction:column}.mari-home-browser-chrome{height:80px;flex-shrink:0}main{flex:1;min-height:0;overflow:auto}${tag}{display:block;width:100%;height:100%}</style><div data-component="HomeBrowserHub"><div class="shell"><header class="mari-home-browser-chrome">Marinara · Professor Mari · Villages</header><main data-component="HomeBrowserHub.Content"><${tag}></${tag}></main></div></div>`,
        }),
      );
      await page.goto("http://scene-controls.test/");
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      const host = page.locator(tag);
      const composer = page.getByRole("textbox", { name: "Message at The Mill" });
      const send = page.getByRole("button", { name: "Send", exact: true });
      const dock = page.locator(`.${tag}-chat-vn`);
      const images = page.locator(`.${tag}-chat-cast-person > img`);
      await expect(composer).toBeVisible();
      await expect(page.locator(".mari-home-browser-chrome")).toBeHidden();
      await expect(page.locator(`.${tag}-chat-vn-portrait`)).toBeVisible();
      await expect.poll(() => host.evaluate((el) => el.clientHeight)).toBe(height);
      const buttonBox = await send.boundingBox();
      assert.equal(buttonBox.width, mobile ? 36 : 32);
      assert.equal((await send.locator("svg").boundingBox()).width, 15);
      assert.equal(await send.innerText(), "", "send control has no large text label");
      await composer.fill("Tea sounds perfect.");
      await page.getByRole("button", { name: "Previous paragraph" }).click();
      await expect(page.getByRole("region", { name: "Current paragraph" })).toContainText("Rain taps");
      await expect(composer).toHaveValue("Tea sounds perfect.");
      await expect(send).toBeDisabled();
      await page.getByRole("button", { name: "History", exact: true }).click();
      await expect(page.getByRole("log", { name: "Scene history" })).toBeVisible();
      await expect(page.getByRole("region", { name: "Current paragraph" })).toBeHidden();
      await composer.fill("A draft while reading history.");
      await expect(send).toBeDisabled();
      await page.getByRole("button", { name: "Hide history" }).click();
      await page.getByRole("button", { name: "Next paragraph" }).click();
      await expect(send).toBeEnabled();
      await page.getByRole("button", { name: "Mode: Chat. Choose mode" }).click();
      for (const mode of ["Chat", "Knock / Call", "Conclude"])
        await expect(page.getByRole("menuitemradio", { name: mode, exact: true })).toBeVisible();
      await expect(page.getByRole("menuitemradio", { name: "Fulfill", exact: true })).toHaveCount(0);
      await page.getByRole("menuitemradio", { name: "Chat", exact: true }).click();
      await page.getByRole("button", { name: "Venue actions" }).click();
      await expect(page.getByRole("menuitem", { name: "Projects", exact: true })).toBeVisible();
      await expect(page.getByRole("menuitem", { name: "Proposals", exact: true })).toBeVisible();
      await expect(page.getByRole("menuitem", { name: "View Mailbox" })).toHaveCount(home ? 1 : 0);
      assert.equal(await dock.getByRole("button", { name: /Mailbox|Projects|Proposals/ }).count(), 0);
      await page.getByRole("menuitem", { name: "Scene settings", exact: true }).click();
      await expect(page.getByRole("switch", { name: "Use Decisions" })).toBeVisible();
      await page.getByRole("button", { name: "Close Scene settings" }).click();

      if (mobile) {
        const baseline = await images.evaluateAll((nodes) =>
          nodes.map((node) => {
            const { x, y, width, height } = node.getBoundingClientRect();
            return { x, y, width, height };
          }),
        );
        const keyboardHeight = Math.min(300, Math.round(height * 0.45));
        const visible = height - keyboardHeight;
        for (const resizesLayout of [false, true]) {
          await composer.focus();
          await page.evaluate((height) => {
            window.sceneViewport.height = height;
            window.sceneViewport.dispatchEvent(new Event("resize"));
          }, visible);
          if (resizesLayout) await page.setViewportSize({ width, height: visible });
          await expect(host).toHaveAttribute("data-scene-keyboard", "");
          await expect
            .poll(async () => Math.round((await dock.boundingBox()).y + (await dock.boundingBox()).height))
            .toBeLessThanOrEqual(visible);
          const after = await images.evaluateAll((nodes) =>
            nodes.map((node) => {
              const { x, y, width, height } = node.getBoundingClientRect();
              return { x, y, width, height };
            }),
          );
          for (let i = 0; i < baseline.length; i++)
            for (const key of ["x", "y", "width", "height"])
              assert.ok(
                Math.abs(baseline[i][key] - after[i][key]) < 1,
                `keyboard preserves sprite ${i} ${key} (${resizesLayout ? "layout" : "visual"} viewport)`,
              );
          assert.ok((await dock.boundingBox()).y >= 0, "dock stays inside the visible screen");
          assert.ok(
            after.some((box) => box.y + box.height > visible),
            "keyboard covers sprites without shrinking them",
          );
          await composer.fill("Keyboard draft\n" + "A longer line to wrap. ".repeat(20));
          const input = await composer.evaluate((el) => ({ client: el.clientHeight, scroll: el.scrollHeight }));
          assert.ok(input.scroll > input.client, "long drafts scroll inside the composer");
          await composer.fill("Keyboard draft");
          await page.evaluate((height) => {
            window.sceneViewport.height = height;
            window.sceneViewport.dispatchEvent(new Event("resize"));
          }, height);
          if (resizesLayout) await page.setViewportSize({ width, height });
          await expect(host).not.toHaveAttribute("data-scene-keyboard", "");
          await expect(composer).toHaveValue("Keyboard draft");
        }
        // Viewport panning moves the dock, not the artwork.
        await page.evaluate(
          ({ visible }) => {
            window.sceneViewport.height = visible - 30;
            window.sceneViewport.offsetTop = 30;
            document.querySelector(".shell").style.transform = "translateY(30px)";
            window.sceneViewport.dispatchEvent(new Event("scroll"));
          },
          { visible },
        );
        await expect(host).toHaveAttribute("data-scene-keyboard", "");
        await expect
          .poll(async () => Math.round((await images.first().boundingBox()).y))
          .toBe(Math.round(baseline[0].y));
        await page.evaluate((height) => {
          window.sceneViewport.height = height;
          window.sceneViewport.offsetTop = 0;
          document.querySelector(".shell").style.transform = "";
          window.sceneViewport.dispatchEvent(new Event("resize"));
        }, height);
        await expect(host).not.toHaveAttribute("data-scene-keyboard", "");
        // iOS-style panning may offset the entire lost height, keeping the bottom unchanged.
        await page.evaluate(
          ({ visible, keyboardHeight }) => {
            window.sceneViewport.height = visible;
            window.sceneViewport.offsetTop = keyboardHeight;
            const shell = document.querySelector(".shell");
            shell.style.height = `${visible}px`;
            shell.style.transform = `translateY(${keyboardHeight}px)`;
            window.sceneViewport.dispatchEvent(new Event("scroll"));
          },
          { visible, keyboardHeight },
        );
        await expect(host).toHaveAttribute("data-scene-keyboard", "");
        await expect.poll(() => host.evaluate((el) => el.clientHeight)).toBe(height);
        await expect
          .poll(async () => Math.round((await images.first().boundingBox()).y))
          .toBe(Math.round(baseline[0].y));
        await page.evaluate((height) => {
          window.sceneViewport.height = height;
          window.sceneViewport.offsetTop = 0;
          const shell = document.querySelector(".shell");
          shell.style.height = "";
          shell.style.transform = "";
          window.sceneViewport.dispatchEvent(new Event("resize"));
        }, height);
        await expect(host).not.toHaveAttribute("data-scene-keyboard", "");
      }
      if (process.env.VILLAGES_VISUAL_OUTPUT && count === 1)
        await page.screenshot({
          path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, `scene-controls-${width}x${height}.png`),
        });
      await composer.fill("Ready to send.");
      await send.click();
      await expect(composer).toHaveValue("");
      assert.equal(turns, 1);
      if (count === 4) {
        await host.evaluate((el) => {
          window.removedSceneHost = el;
          el.remove();
        });
        await expect
          .poll(() => page.evaluate(() => window.removedSceneHost.hasAttribute("data-scene-play")))
          .toBe(false);
        assert.equal(
          await page.evaluate(() => window.removedSceneHost.style.getPropertyValue("--villages-scene-canvas-height")),
          "",
        );
      } else {
        await page.getByRole("button", { name: "Venue actions" }).click();
        await page.getByRole("menuitem", { name: "Proposals", exact: true }).click();
        await expect(host).not.toHaveAttribute("data-scene-play", "");
        assert.equal(await host.evaluate((el) => el.style.getPropertyValue("--villages-scene-canvas-height")), "");
      }
      await expect(page.locator(".mari-home-browser-chrome")).toBeVisible();
      assert.deepEqual(errors, []);
      await page.close();
    }
  }
  console.log(
    "Scene controls passed: icons, narration, history drafts, modes, utilities, shell restoration, and stable sprites across keyboard viewport changes.",
  );
} finally {
  await browser.close();
}
