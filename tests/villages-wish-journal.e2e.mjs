import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { snapshot, mapImage, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
mkdirSync(".build-tmp/wish-journal", { recursive: true });
try {
  for (const [width, height] of [
    [390, 844],
    [1280, 844],
    [1366, 600],
    [320, 650],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await mockEngineLookups(page);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const village = structuredClone(snapshot);
    village.villagers = [
      {
        ...village.villagers[0],
        characterId: "feddy",
        name: "Feddy",
        place: { id: "mill", name: "The Mill" },
        agenda: null,
      },
      { ...village.villagers[1], characterId: "roxie", name: "Roxie", agenda: null },
    ];
    const wish = {
      wishId: "swim",
      text: "Go swimming with Roxie.",
      at: now,
      status: "open",
      followed: true,
      facts: [
        { id: "concern", text: "Deep water makes me nervous.", at: now },
        { id: "lead", text: "I like the idea of lessons.", at: now },
        { id: "old", text: "I would prefer the lake.", at: now },
        { id: "new", text: "Actually, the shallow beach sounds better.", at: now },
      ],
    };
    const profiles = [
      { characterId: "feddy", knownWishes: [wish] },
      { characterId: "roxie", knownWishes: [] },
    ];
    let follows = 0,
      privateReads = 0,
      writes = 0,
      session = null;
    const notice = {
      id: "wish-discovery",
      kind: "wish",
      text: "Wish shared · Feddy",
      detail: wish.text,
      wishUpdate: { actorId: "feddy", wishId: "swim", state: "progress" },
    };
    await page.route("**/api/characters/summaries", (route) =>
      fulfill(route, { contentType: "application/json", body: "[]" }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = village;
      if (path.endsWith("/relationships")) value = { profiles };
      else if (path.endsWith("/wishes/swim/follow")) {
        follows++;
        writes++;
        assert.equal(route.request().method(), "PATCH");
        wish.followed = JSON.parse(route.request().postData()).followed;
        value = { profiles };
      } else if (path.endsWith("/wishes/inspect")) {
        privateReads++;
        value = {
          wishes: [
            {
              id: "private",
              revision: 3,
              wish: "PRIVATE SOCIAL DESIRE",
              reason:
                "PRIVATE REASON. " +
                "Unhurried company lets them speak honestly while retaining time for their ordinary life. ".repeat(3) +
                "They want this.",
              status: "open",
              attention: { state: "background", reason: "Available when relevant." },
              approach: "Ask Roxie about a quiet afternoon together.",
              addedAt: now,
              changedAt: now,
              origin: { kind: "preparation", sourceId: "founding", lineIds: [] },
              conditions: [{ id: "quiet", quote: "Somewhere quiet, please.", at: now }],
              history: [
                {
                  id: "approach",
                  at: new Date(Date.parse(now) + 120000).toISOString(),
                  kind: "approach",
                  text: "Chose to ask Roxie directly.",
                },
                {
                  id: "attention",
                  at: new Date(Date.parse(now) + 60000).toISOString(),
                  kind: "attention",
                  text: "Other things need attention today.",
                },
              ],
            },
            {
              id: "foreground",
              revision: 1,
              wish: "PRIVATE FOREGROUND DESIRE",
              reason: "Another grounded social desire.",
              status: "open",
              attention: { state: "foreground", reason: "A recent conversation brought this to mind." },
              approach: "",
              conditions: [],
              history: [],
              addedAt: now,
              changedAt: now,
              origin: { kind: "reflection", sourceId: "reflection", lineIds: [] },
            },
          ],
        };
      } else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/rooms/active")) value = { session };
      else if (path.endsWith("/rooms/archive")) value = { visits: [], total: 0 };
      else if (path.endsWith("/catalog")) value = { characters: [] };
      else if (path.endsWith("/personas")) value = { personas: [] };
      else if (path.endsWith("/lorebooks")) value = { books: [] };
      else if (path.endsWith("/debug/runtime")) value = { showUsageMeter: false };
      else if (path.endsWith("/rooms") && route.request().method() === "POST") {
        writes++;
        session = {
          version: 2,
          id: "visit",
          placeId: "mill",
          placeName: "The Mill",
          startedAt: now,
          lastActivityAt: now,
          endedAt: "",
          status: "active",
          memoryMode: "live",
          activeIds: ["feddy"],
          participants: [{ characterId: "feddy", name: "Feddy" }],
          lines: [
            {
              id: "earlier",
              kind: "narration",
              speakerId: "",
              name: "Narration",
              at: now,
              content: "The mill hums while light settles across the floor. ".repeat(30),
              heardBy: ["feddy"],
            },
            {
              id: "latest",
              kind: "speech",
              speakerId: "feddy",
              name: "Feddy",
              at: now,
              content: "Ready.",
              heardBy: ["feddy"],
            },
          ],
          sceneRevision: 1,
        };
        value = { session };
      } else if (path.endsWith("/changes"))
        value = {
          sceneId: "visit",
          notices: [notice],
          changes: [],
          backgroundChecks: [],
          unresolved: [],
          nextCursor: "1:1:0",
          hasMore: false,
          processingSummary: {},
        };
      else if (path.endsWith("/rooms/activity")) value = { session };
      else if (/generate|regenerate|\/greet|\/turn|\/interpret/.test(path))
        throw Error("Unexpected model-capable request: " + path);
      await fulfill(route, { contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.route("http://villages.test/", (route) =>
      fulfill(route, {
        contentType: "text/html",
        body: "<style>:root{--background:#29251f;--foreground:#f4f0e8;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}html,body{margin:0;background:#29251f;color:#f4f0e8;font:16px Arial}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const nav = page.getByRole("navigation", { name: "Village exploration" });
    await nav.getByRole("button", { name: "People", exact: true }).click();
    await page.getByRole("button", { name: "Open Feddy profile" }).click();
    const profile = page.getByRole("region", { name: "Feddy profile" });
    const settleTurn = () =>
      profile
        .locator(".marinara-capability-villages-dossier-turn")
        .evaluateAll((nodes) =>
          Promise.all(
            nodes.flatMap((node) => node.getAnimations().map((animation) => animation.finished.catch(() => {}))),
          ),
        );
    await page
      .getByRole("navigation", { name: "Villager profile sections" })
      .getByRole("button", { name: "Wishes", exact: true })
      .click();
    await expect(profile.getByRole("region", { name: "Known wishes" })).toBeVisible();
    assert.equal(privateReads, 0);
    await expect(profile.getByText("PRIVATE SOCIAL DESIRE")).toHaveCount(0);
    await expect(profile.getByText("Deep water makes me nervous.", { exact: true })).toHaveCount(0);
    await expect(profile.getByRole("region", { name: "Wish details", exact: true })).toHaveCount(0);
    const openWish = profile.getByRole("button", { name: "Open Wish: Go swimming with Roxie.", exact: true });
    await expect(openWish).toBeVisible();
    await settleTurn();
    const camera = () =>
      page.evaluate(() => [
        window.scrollX,
        window.scrollY,
        ...[".marinara-capability-villages-dossier-root", ".marinara-capability-villages-dossier-content"].map(
          (selector) => document.querySelector(selector).scrollTop,
        ),
      ]);
    const beforeCamera = await camera();
    assert.deepEqual(
      await page.evaluate(() =>
        [".marinara-capability-villages-dossier-root", ".marinara-capability-villages-dossier-content"].map(
          (selector) => {
            const node = document.querySelector(selector);
            node.scrollTop = 100;
            node.scrollLeft = 100;
            return [node.scrollTop, node.scrollLeft];
          },
        ),
      ),
      [
        [0, 0],
        [0, 0],
      ],
      "Wish notebook cannot retain hidden scroll offsets that move its controls",
    );
    await openWish.press("Enter");
    const details = profile.getByRole("region", { name: "Wish details", exact: true });
    await expect(details).toBeFocused();
    assert.deepEqual(await camera(), beforeCamera, "Opening a Wish preserves the camera and notebook scroll positions");
    const section = details.getByRole("combobox", { name: "Wish detail section" });
    const noScroll = async () => {
      await expect(profile.getByRole("button", { name: "Close ×", exact: true })).toBeInViewport({ ratio: 1 });
      await expect(profile.getByRole("button", { name: /^(Inspect|Leave Inspect)$/ })).toBeInViewport({ ratio: 1 });
      await expect(details.getByRole("button", { name: "← Wishes", exact: true })).toBeInViewport({ ratio: 1 });
      await expect(section).toBeInViewport({ ratio: 1 });
      await expect(details.getByRole("button", { name: "Next detail page" })).toBeInViewport({ ratio: 1 });
      assert(
        await profile
          .locator(".marinara-capability-villages-dossier-content")
          .evaluate((node) => node.scrollHeight <= node.clientHeight + 1),
      );
      assert.deepEqual(await camera(), beforeCamera);
    };
    await noScroll();
    await section.selectOption("history");
    await expect(details.getByRole("region", { name: "Recorded statements" }).locator("time")).toHaveCount(4);
    await expect(profile.getByText("Deep water makes me nervous.", { exact: true })).toBeVisible();
    await expect(profile.getByText("I like the idea of lessons.", { exact: true })).toBeVisible();
    await expect(profile.getByText("I would prefer the lake.", { exact: true })).toBeVisible();
    await expect(profile.getByRole("checkbox")).toHaveCount(0);
    await expect(profile.getByRole("progressbar")).toHaveCount(0);
    assert.equal(writes, 0, "Browsing People and wishes makes no mutation or generation request");
    await expect(profile.getByText("I would prefer the lake.", { exact: true })).toBeVisible();
    await settleTurn();
    const nextPage = details.getByRole("button", { name: "Next detail page" });
    let pages = 0;
    while (await nextPage.isEnabled()) {
      await nextPage.click();
      await noScroll();
      assert(++pages < 30);
    }
    await expect(details.getByText("Actually, the shallow beach sounds better.", { exact: true })).toBeInViewport({
      ratio: 1,
    });
    await page.screenshot({ path: resolve(`.build-tmp/wish-journal/profile-${width}.png`), fullPage: true });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      "Profile fits the viewport",
    );
    await profile.getByRole("button", { name: "Following", exact: true }).click();
    await expect(profile.getByRole("button", { name: "Follow", exact: true })).toHaveAttribute("aria-pressed", "false");
    assert.equal(wish.status, "open");
    assert.equal(follows, 1);
    await profile.getByRole("button", { name: "Inspect", exact: true }).click();
    await expect(profile.getByText("PRIVATE SOCIAL DESIRE", { exact: true })).toBeVisible();
    assert.equal(privateReads, 1);
    await expect(profile.getByText(/PRIVATE REASON/)).toHaveCount(0);
    await profile.getByRole("button", { name: "Open Wish: PRIVATE SOCIAL DESIRE", exact: true }).click();
    await expect(details.getByRole("region", { name: "Wish summary" })).toHaveText(/PRIVATE REASON/);
    await noScroll();
    let summaryPages = 0;
    while (await nextPage.isEnabled()) {
      await nextPage.click();
      await noScroll();
      assert(++summaryPages < 30);
    }
    assert(
      await details
        .getByRole("region", { name: "Wish summary" })
        .locator("p")
        .last()
        .evaluate((node) => {
          const range = document.createRange();
          range.selectNodeContents(node);
          const last = [...range.getClientRects()].at(-1),
            frame = node.closest(".villages-wish-page-window").getBoundingClientRect();
          return (
            last.left >= frame.left - 1 &&
            last.right <= frame.right + 1 &&
            last.top >= frame.top - 1 &&
            last.bottom <= frame.bottom + 1
          );
        }),
      "The final line of a long reason is reachable without scrolling",
    );
    await section.selectOption("attention");
    await expect(details.getByRole("region", { name: "Attention", exact: true })).toHaveText(
      /In the background.*Available when relevant\./s,
    );
    await noScroll();
    await section.selectOption("approach");
    await expect(details.getByRole("region", { name: "Approach", exact: true })).toHaveText(
      /Ask Roxie about a quiet afternoon together\./,
    );
    await noScroll();
    await section.selectOption("conditions");
    await expect(details.getByRole("region", { name: "Conditions", exact: true })).toHaveText(
      /Somewhere quiet, please\./,
    );
    await noScroll();
    await section.selectOption("history");
    await expect(details.getByRole("region", { name: "Wish history" }).getByRole("listitem")).toHaveCount(3);
    await expect(details.getByRole("region", { name: "Wish history" }).getByRole("listitem").last()).toContainText(
      "Chose to ask Roxie directly.",
    );
    await expect(details.getByText("Other things need attention today.", { exact: true })).toBeVisible();
    while (await nextPage.isEnabled()) {
      await nextPage.click();
      await noScroll();
      assert(++pages < 30);
    }
    await expect(details.getByText("Chose to ask Roxie directly.", { exact: true })).toBeInViewport({ ratio: 1 });
    await settleTurn();
    await page.screenshot({ path: resolve(`.build-tmp/wish-journal/inspect-${width}.png`), fullPage: true });
    await details.getByRole("button", { name: "← Wishes", exact: true }).click();
    await expect(details).toHaveCount(0);
    await expect(profile.getByRole("button", { name: "Open Wish: PRIVATE SOCIAL DESIRE", exact: true })).toBeFocused();
    await expect(profile.getByText(/PRIVATE REASON/)).toHaveCount(0);
    await profile.getByRole("button", { name: "Open Wish: PRIVATE FOREGROUND DESIRE", exact: true }).click();
    await section.selectOption("attention");
    await expect(details.getByRole("region", { name: "Attention", exact: true })).toHaveText(
      /On their mind.*A recent conversation brought this to mind\./s,
    );
    await noScroll();
    await details.getByRole("button", { name: "← Wishes", exact: true }).click();
    await profile.getByRole("button", { name: "Leave Inspect", exact: true }).click();
    await expect(profile.getByText("PRIVATE SOCIAL DESIRE")).toHaveCount(0);
    await profile.getByRole("button", { name: "← Back to Villagers" }).click();
    await page.getByRole("button", { name: "Open Roxie profile" }).click();
    await page
      .getByRole("navigation", { name: "Villager profile sections" })
      .getByRole("button", { name: "Wishes", exact: true })
      .click();
    await expect(page.getByText("No Wishes known yet.", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "← Back to Villagers" }).click();
    await page.getByRole("button", { name: "Open Feddy profile" }).click();
    await page
      .getByRole("navigation", { name: "Villager profile sections" })
      .getByRole("button", { name: "Venues", exact: true })
      .click();
    await expect(page.getByRole("button", { name: "View Venue", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Close ×", exact: true }).click();
    await page.getByRole("button", { name: "Show places", exact: true }).click();
    const places = page.getByRole("complementary", { name: "Places navigator" });
    await places.getByRole("button", { name: /^The Mill/ }).click();
    await places.getByRole("button", { name: "View venue", exact: true }).click();
    await page.getByRole("button", { name: "Visit venue", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Message at The Mill" })).toBeVisible();
    const notices = page.getByRole("button", { name: "1 World change" });
    await expect(notices).toBeVisible();
    // Fresh notices open after rendering; clicking during that effect would race and close the panel.
    await expect(notices).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("textbox", { name: "Message at The Mill" }).fill("Unsaved Scene draft");
    await page.getByRole("button", { name: /Previous/ }).click();
    const reader = page.getByRole("region", { name: "Current paragraph" });
    const retainedReader = await reader.elementHandle();
    const readingText = await reader.textContent();
    await reader.evaluate((node) => {
      node.scrollTop = 20;
    });
    const readingScroll = await reader.evaluate((node) => node.scrollTop);
    await page.getByRole("button", { name: /View Wish update: Wish shared/ }).click();
    await expect(profile).toBeVisible();
    assert.equal(await retainedReader.evaluate((node) => node.isConnected), true, "Scene reader stays mounted");
    await expect(profile.locator('[data-wish-id="swim"]')).toBeFocused();
    await profile.getByRole("button", { name: "← Back to Villagers" }).click();
    await page.getByRole("button", { name: "Open Roxie profile" }).click();
    await page.getByRole("button", { name: "Close ×" }).click();
    await expect(page.getByRole("textbox", { name: "Message at The Mill" })).toHaveCount(0);
    await expect(reader).toHaveText(readingText);
    assert.equal(await retainedReader.evaluate((node) => node.isConnected), true);
    assert.equal(await reader.evaluate((node) => node.scrollTop), readingScroll);
    while (await page.getByRole("button", { name: "Next paragraph", exact: true }).isEnabled())
      await page.getByRole("button", { name: "Next paragraph", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Message at The Mill" })).toHaveValue("Unsaved Scene draft");
    assert.equal(writes, 2, "The only writes are explicit following and Scene entry");
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Wish journal browser: mobile/desktop profiles, timestamped statements, following, deliberate inspection, privacy, and Wish notice navigation passed without generation requests.",
  );
} finally {
  await browser.close();
}
