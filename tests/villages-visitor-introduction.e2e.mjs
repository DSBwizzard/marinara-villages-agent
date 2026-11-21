import assert from "node:assert/strict";
import { resolve } from "node:path";
import { mkdirSync, readFileSync } from "node:fs";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { scenePlaybackFixtures } from "./fixtures/scene-browser.fixture.mjs";
import { snapshot, now } from "./fixtures/villages-scene-browser.fixture.mjs";
const { authorSceneResponse } = await scenePlaybackFixtures();
const tag = "marinara-capability-villages";
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await mockEngineLookups(page);
    const fixture = structuredClone(snapshot);
    const mari = { ...fixture.villagers[0], characterId: "__professor_mari__", name: "Professor Mari", met: true };
    const spriteUrl = "/api/capability-packages/villages/assets/mari-visitor-sprites/Neutral.png";
    mari.sprite = {
      assetId: mari.characterId,
      expressions: [],
      images: ["Neutral", "Thinking", "Surprised"].map((label) => ({
        view: "front",
        label,
        url: `/api/capability-packages/villages/assets/mari-visitor-sprites/${label}.png`,
      })),
      framing: { mode: "full", cropPercent: 0 },
    };
    fixture.visitors = [mari];
    let ended = false;
    let forbidden = 0;
    let closes = 0;
    let greetings = 0;
    const session = {
      version: 1,
      visitorIntroduction: true,
      id: "mari-first-visit",
      placeId: "mill",
      placeName: "The Mill",
      zoneId: "exterior",
      area: "outside",
      startedAt: now,
      lastActivityAt: now,
      endedAt: "",
      status: "opening",
      activeIds: [mari.characterId],
      participants: [{ characterId: mari.characterId, name: mari.name, doing: "visiting" }],
      lines: [],
      submissions: [],
    };
    const savedLines = [
      "A story can bump into you here.",
      "Wondering why I'm here?",
      "Me too!",
      "Do keep in touch.",
    ].map((content, i) => ({
      id: "mari-" + i,
      role: "assistant",
      speakerId: mari.characterId,
      name: mari.name,
      kind: "dialogue",
      content,
      at: now,
      staging: [{ characterId: mari.characterId, expression: ["Neutral", "Thinking", "Surprised", "Neutral"][i] }],
    }));
    await page.route("**/api/capability-packages/villages/assets/mari-visitor-sprites/*.png", (route) =>
      fulfill(route, {
        contentType: "image/png",
        body: readFileSync(
          `packages/villages/mari-visitor-sprites/${new URL(route.request().url()).pathname.split("/").at(-1)}`,
        ),
      }),
    );
    await page.route("http://visitors.test/", (route) =>
      fulfill(route, {
        contentType: "text/html",
        body: `<style>html,body{margin:0;background:#171b25;color:white} ${tag}{display:block;height:100vh}</style><${tag}></${tag}>`,
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = fixture;
      if (path.endsWith("/rooms/end")) {
        ended = true;
        closes++;
        value = { session: { ...session, status: "closed", endedAt: now }, recordEvents: [] };
      } else if (path.endsWith("/rooms/greet")) {
        greetings++;
        session.status = "active";
        session.lines = savedLines;
        value = { session };
      } else if (path.endsWith("/rooms/active")) value = { session: ended ? null : session };
      else if (path.endsWith("/rooms/activity")) value = { session };
      else if (/\/rooms\/(turn|zone)$/.test(path)) {
        forbidden++;
        throw Error("Scripted introduction must not generate or move");
      } else if (path.endsWith("/changes"))
        value = {
          changes: [],
          notices: [],
          dismissedNoticeIds: [],
          nextCursor: "",
          processingSummary: { pending: 0, failed: 0, rejected: 0 },
        };
      await fulfill(route, {
        contentType: "application/json",
        body: JSON.stringify(authorSceneResponse(value, route.request())),
      });
    });
    await page.goto("http://visitors.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const paragraph = page.getByRole("region", { name: "Latest reply" });
    await expect(paragraph).toContainText("A story can bump into you here.");
    const sprite = page.locator(`img[src="${spriteUrl}"]`).first();
    await expect(sprite).toBeVisible();
    await sprite.evaluate(async (image) => {
      await image.decode();
      if (image.naturalWidth !== 1024 || image.naturalHeight !== 1536) throw Error("Wrong Mari sprite");
    });
    await expect(page.getByRole("textbox", { name: /Message at/ })).toHaveCount(0);
    await page.getByRole("button", { name: "Next paragraph", exact: true }).click();
    await expect(paragraph).toContainText("Wondering why I'm here?");
    await expect(page.locator('img[src$="/Thinking.png"]').first()).toBeVisible();
    await page.getByRole("button", { name: "Next paragraph", exact: true }).click();
    await expect(paragraph).toContainText("Me too!");
    await expect(page.locator('img[src$="/Surprised.png"]').first()).toBeVisible();
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await expect(paragraph).toContainText("A story can bump into you here.");
    for (let i = 0; i < 20 && !(await page.getByRole("button", { name: "Continue", exact: true }).isVisible()); i++) {
      await page.getByRole("button", { name: "Next paragraph", exact: true }).click();
    }
    await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeVisible();
    await expect(paragraph).toContainText("Do keep in touch.");
    await expect(page.getByRole("textbox", { name: /Message at/ })).toHaveCount(0);
    mkdirSync(".build-tmp/visitor-introduction", { recursive: true });
    await page.screenshot({ path: `.build-tmp/visitor-introduction/${width}.png` });
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(paragraph).toHaveCount(0);
    assert.equal(closes, 1);
    assert.equal(forbidden, 0);
    assert.equal(greetings, 1, "Reload keeps the saved greeting instead of requesting a second opening");
    await page.close();
  }
});
