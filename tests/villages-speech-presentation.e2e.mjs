import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { snapshot, residents, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const tag = "marinara-capability-villages";
const browser = await chromium.launch({
  headless: true,
});
const output = resolve("artifacts/speech-presentation");
mkdirSync(output, { recursive: true });
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await mockEngineLookups(page);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const session = {
      version: 1,
      stagingVersion: 1,
      id: "speech-placements",
      placeId: "mill",
      placeName: "The Mill",
      area: "public",
      zoneId: "exterior",
      startedAt: now,
      lastActivityAt: now,
      endedAt: "",
      status: "active",
      sceneRevision: 0,
      activeIds: residents.map((p) => p.characterId),
      participants: residents.map((p) => ({ ...p, doing: "listening" })),
      lines: [],
      submissions: [],
    };
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = snapshot;
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
        value = { settings: { decisionsEnabled: false }, status: { available: false } };
      else if (path.includes("/interpretation-diagnostics/")) value = { checks: [] };
      await fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.route("http://speech.test/", (route) =>
      fulfill(route, {
        status: 200,
        contentType: "text/html",
        body: `<style>:root{--background:#101726;--foreground:#f2f2f5;--popover:#202938;--border:#4d5870;--primary:#af91eb;--secondary:#303b50;--muted-foreground:#bac4d7}html,body{margin:0;width:100%;height:100%;overflow:hidden;font-family:Arial}[data-component=HomeBrowserHub],.shell{height:100%;display:flex;flex-direction:column}.mari-home-browser-chrome{height:48px;flex-shrink:0}main{flex:1;min-height:0;overflow:auto}${tag}{display:block;width:100%;height:100%}</style><div data-component="HomeBrowserHub"><div class="shell"><header class="mari-home-browser-chrome">Villages</header><main data-component="HomeBrowserHub.Content"><${tag}></${tag}></main></div></div>`,
      }),
    );
    for (const delivery of ["ordinary", "whisper", "shout"]) {
      const main = {
        id: "main",
        role: "assistant",
        speakerId: "mara",
        name: "Mara",
        kind: delivery === "whisper" ? "whisper" : "dialogue",
        delivery,
        presentation: "main",
        targetId: "player",
        content: `Main ${delivery} conversation.`,
        at: now,
      };
      session.lines = [
        main,
        ...["ordinary", "whisper", "shout"].map((voice, index) => ({
          id: `aside-${voice}`,
          role: "assistant",
          speakerId: residents[index].characterId,
          name: residents[index].name,
          kind: voice === "whisper" ? "whisper" : "side",
          delivery: voice,
          presentation: "aside",
          targetId: "player",
          content: `Floating ${voice} remark.`,
          // A pre-fix saved bubble can reference removed private player evidence.
          asideFor: "hidden-player-evidence",
          at: now,
        })),
      ];
      await page.goto("http://speech.test/");
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      const reading = page.getByRole("region", { name: "Current paragraph" });
      await expect(reading).toContainText(`Main ${delivery} conversation.`);
      await expect(page.locator(`.${tag}-chat-vn-card`)).toHaveAttribute("data-delivery", delivery);
      const band = page.locator(`.${tag}-chat-vn-asides`);
      await expect(band.locator(`.${tag}-chat-vn-aside`)).toHaveCount(3);
      for (const voice of ["ordinary", "whisper", "shout"])
        await expect(band.locator(`[data-register="${voice === "ordinary" ? "side" : voice}"]`)).toContainText(
          `Floating ${voice} remark.`,
        );
      await expect(page.getByRole("button", { name: "Next paragraph", exact: true })).toBeDisabled();
      await page.screenshot({ path: resolve(output, `${delivery}-${width}.png`) });
    }
    const prose = "Mara sets her cup on the railing with a clink, then turns back to you.";
    session.lines = [
      {
        id: "narrated-sound",
        role: "assistant",
        speakerId: "__venue_scene__",
        name: "Narration",
        kind: "narration",
        content: prose,
        at: now,
      },
      {
        id: "reply",
        role: "assistant",
        speakerId: "mara",
        name: "Mara",
        kind: "dialogue",
        content: "A good place to stop for a drink.",
        at: now,
      },
    ];
    await page.goto("http://speech.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const reading = page.getByRole("region", { name: "Current paragraph" });
    // Reopening an existing scene starts at its most recent line.
    await expect(reading).toContainText("A good place to stop for a drink.");
    await page.getByRole("button", { name: "Previous paragraph", exact: true }).click();
    await expect(reading).toContainText(prose);
    await expect(page.getByRole("button", { name: "Previous paragraph", exact: true })).toBeDisabled();
    await page.screenshot({ path: resolve(output, `narrated-sound-${width}.png`) });
    await page.getByRole("button", { name: "Next paragraph", exact: true }).click();
    await expect(reading).toContainText("A good place to stop for a drink.");
    await expect(page.getByRole("button", { name: "Next paragraph", exact: true })).toBeDisabled();
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(
  "Main and floating ordinary/whisper/shout speech, legacy main whispers, restored orphan anchors and desktop/mobile rendering passed.",
);
