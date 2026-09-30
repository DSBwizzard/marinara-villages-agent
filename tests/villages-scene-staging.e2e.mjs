import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
const now = new Date().toISOString();
const image = (color) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1000"><rect width="1500" height="1000" fill="${color}"/><path d="M0 500h1500M750 0v1000" stroke="#eee1bf" stroke-width="80"/></svg>`).toString("base64")}`;
const spriteImage = (color) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="700"><circle cx="150" cy="100" r="65" fill="${color}"/><path d="M90 175h120l45 360H45zM105 530h35v170h-45zM160 530h35l45 170h-45z" fill="${color}"/></svg>`).toString("base64")}`;
const residentNames = ["Mara", "Eli", "Lina", "Taro"];
const residents = residentNames.map((name, index) => ({
  characterId: name.toLowerCase(),
  name,
  sprite: {
    assetId: name.toLowerCase(),
    expressions: [],
    images: [
      { view: "front", label: "neutral", url: spriteImage(["#e8ba91", "#a7cdf2", "#d9a8cd", "#bbd59a"][index]) },
    ],
    framing: { mode: "full", cropPercent: 0 },
  },
  summary: "A resident of the village.",
  tags: [],
  missing: false,
  place: null,
}));
const longGreeting =
  "The mill hums softly while dust turns in the late light, and each villager pauses to listen. ".repeat(12);
const mapImage = image("#719b77");
const place = (id, x, y) => ({
  id,
  name: id === "mill" ? "The Mill" : id === "harbour" ? "The Harbour" : "The Market",
  classes: id === "mill" ? ["workplace", "gathering"] : ["other"],
  category: "destination",
  description: "A village place.",
  capabilities: [],
  presentation: { image: { ref: id, url: image(id === "mill" ? "#a77a54" : "#6e91aa"), id }, x, y },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  state: { condition: "sound", upgrades: [], furniture: [], publicFacts: [], updatedAt: now },
});
const snapshot = {
  status: "ready",
  isFounded: true,
  village: {
    name: "QA Village",
    setting: "",
    dateLabel: "Today",
    weekday: "Friday",
    season: "fall",
    dayPhase: "morning",
    instant: now,
    localTime: "7:00 AM",
    minuteOfDay: 420,
    timeZone: "UTC",
    hour: 7,
    minute: 0,
    weather: "clear",
    dayIndex: 1,
    nextTransitionAt: "",
  },
  noticeboard: [{ id: "note-1", text: "Market today", author: "Mara", at: now }],
  venueRequests: [],
  projects: [],
  villageCapabilities: [],
  upgradeRequests: [],
  residences: [],
  happenings: [],
  villagers: residents,
  recap: null,
  settings: {
    promptKnowledge: "",
    defaultPromptKnowledge: "",
    promptBoxMaxLength: 1000,
    storyPace: "normal",
    venues: [place("mill", 0.04, 0.08), place("harbour", 0.96, 0.92), place("market", 0.5, 0.5)],
    homeBuildingNames: {},
    homeBuildings: [],
    defaultHomeBuilding: "small-home",
    playerPersonaId: "",
    playerPersonaName: "",
    playerPersonaMissing: false,
    selectedLorebookIds: [],
    setting: "",
    foundingReason: "",
    foundingDetails: "",
    maxPlaces: 10,
    maxVenueNameLength: 80,
    maxVenueNoteLength: 2000,
    maxVenueImageUrlLength: 2000000,
    maxVenueImageIdLength: 100,
    maxVenueImageBytes: 1000000,
    villageGalleryFolderName: "QA Village",
    visitRetention: { mode: "forever", value: 0 },
    townMapImageSetAt: now,
    townMapExpectedWidth: 1500,
    townMapExpectedHeight: 1000,
    townMapView: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
    storyPaces: [],
    macros: [],
  },
};

try {
  for (const { width, height } of [
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
                    ...person.sprite.images,
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
      await page.route("**/api/villages**", async (route) => {
        const path = new URL(route.request().url()).pathname;
        let value = fixture;
        if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) value = { session };
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
      await expect(people).toHaveCount(count);
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
        if (i) assert.ok(sorted[i - 1].right <= sorted[i].x + 1, "shared-zone sprites do not overlap");
        assert.ok(Math.abs(sorted[i].bottom - sorted[0].bottom) < 1, "sprites retain a shared foot baseline");
      }
      await next.click();
      await expect(mara).toHaveAttribute("data-attention", "right", "side cue appears with the final paragraph");
      await next.click();
      await expect(mara.locator("img")).toHaveAttribute("src", thoughts);
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
      // Marking an older visit keeps the centered legacy row.
      await composer.fill("A legacy visit.");
      if (count === 1) phase = 2;
      await page.getByRole("button", { name: "Send", exact: true }).click();
      await expect(cast).toHaveAttribute("data-staging", "false");
      assert.equal(await mara.evaluate((node) => getComputedStyle(node).position), "relative");
      assert.deepEqual(errors, []);
      await page.close();
    }
  }
  console.log(
    "Villages staging browser checks: one through four residents, three viewports, shared zones, side timing, replay, refresh, departures, legacy visits, and reduced motion passed",
  );
} finally {
  await browser.close();
}
