import { clickCharacterTool } from "./fixtures/browser-diagnostics.mjs";
import { scenePlaybackFixtures } from "./fixtures/scene-browser.fixture.mjs";
const { authorSceneResponse } = await scenePlaybackFixtures();
import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { snapshot, mapImage, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
mkdirSync(".build-tmp/wish-journal", { recursive: true });
await withBrowser(browser, async () => {
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
        summary: "Feddy tends the orchard.",
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
    const profiles = village.villagers.map((person) => ({
      characterId: person.characterId,
      name: person.name,
      entries: [],
      access: [],
    }));
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
      if (path.endsWith("/relationships")) value = { profiles, starting: { pending: false } };
      else if (path.endsWith("/wishes")) value = { wishes: path.includes("/feddy/") ? [wish] : [] };
      else if (path.endsWith("/wishes/swim/follow")) {
        follows++;
        writes++;
        assert.equal(route.request().method(), "PATCH");
        wish.followed = JSON.parse(route.request().postData()).followed;
        value = { wishes: [wish] };
      } else if (path.endsWith("/wishes/inspect")) {
        privateReads++;
        value = {
          wishes: [
            {
              wishId: "private",
              text: "PRIVATE SOCIAL DESIRE",
              at: now,
              status: "open",
              followed: false,
              details: [
                {
                  id: "reason",
                  kind: "reason",
                  text:
                    "PRIVATE REASON. " +
                    "Unhurried company lets them speak honestly while retaining time for their ordinary life. ".repeat(
                      3,
                    ) +
                    "They want this.",
                },
                { id: "attention", kind: "attention", text: "Available when relevant." },
                { id: "approach", kind: "approach", text: "Ask Roxie about a quiet afternoon together." },
              ],
              facts: [
                { id: "quiet", text: "Somewhere quiet, please.", at: now },
                {
                  id: "attention",
                  at: new Date(Date.parse(now) + 60000).toISOString(),
                  text: "Other things need attention today.",
                },
                {
                  id: "approach",
                  at: new Date(Date.parse(now) + 120000).toISOString(),
                  text: "Chose to ask Roxie directly.",
                },
              ],
            },
            {
              wishId: "foreground",
              text: "PRIVATE FOREGROUND DESIRE",
              at: now,
              status: "open",
              followed: false,
              facts: [],
              details: [{ id: "attention", kind: "attention", text: "A recent conversation brought this to mind." }],
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
          version: 5,
          id: "visit",
          placeId: "mill",
          placeName: "The Mill",
          startedAt: now,
          lastActivityAt: now,
          endedAt: "",
          status: "active",
          activeIds: ["feddy"],
          participants: [{ characterId: "feddy", name: "Feddy" }],
          lines: [
            {
              id: "earlier",
              kind: "narration",
              role: "assistant",
              speakerId: "",
              name: "Narration",
              at: now,
              content: "The mill hums while light settles across the floor. ".repeat(30),
              heardBy: ["player", "feddy"],
            },
            {
              id: "latest",
              kind: "dialogue",
              role: "assistant",
              speakerId: "feddy",
              name: "Feddy",
              at: now,
              content: "Ready.",
              heardBy: ["player", "feddy"],
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
          nextCursor: "1",
          hasMore: false,
          processingSummary: {},
        };
      else if (path.endsWith("/rooms/activity")) value = { session };
      else if (/generate|regenerate|\/greet|\/turn|\/interpret/.test(path))
        throw Error("Unexpected model-capable request: " + path);
      await fulfill(route, {
        contentType: "application/json",
        body: JSON.stringify(authorSceneResponse(value, snapshot.worldScope)),
      });
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
    const chooseSection = async (label) => {
      if (["Agenda", "Venues"].includes(label))
        return clickCharacterTool(page, label === "Agenda" ? "Agenda records" : "Venue connections");
      return width <= 700
        ? page.getByRole("combobox", { name: "Section" }).selectOption({ label })
        : page
            .getByRole("navigation", { name: "Villager profile sections" })
            .getByRole("button", { name: label, exact: true })
            .click();
    };
    await nav.getByRole("button", { name: "People", exact: true }).click();
    await page.getByRole("button", { name: "Open Feddy profile" }).click();
    const profile = page.getByRole("region", { name: "Feddy profile" });
    await expect(profile.getByText("Feddy tends the orchard.")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const nameBox = await profile.getByRole("heading", { name: "Feddy", level: 1 }).boundingBox();
    const art = page.getByRole("complementary", { name: "Feddy artwork" });
    const artBox = await art.boundingBox();
    await chooseSection("Wishes");
    await expect(profile.getByRole("region", { name: "Known wishes" })).toBeVisible();
    await expect(profile.getByText("Feddy tends the orchard.")).toBeVisible();
    assert.deepEqual(await profile.getByRole("heading", { name: "Feddy", level: 1 }).boundingBox(), nameBox);
    assert.deepEqual(await art.boundingBox(), artBox, "Wishes retains the profile artwork and its position");
    assert.equal(privateReads, 0);
    await expect(profile.getByText("PRIVATE SOCIAL DESIRE")).toHaveCount(0);
    await expect(profile.getByText("Deep water makes me nervous.", { exact: true })).toHaveCount(0);
    await expect(profile.getByRole("region", { name: "Wish details", exact: true })).toHaveCount(0);
    const openWish = profile.getByRole("button", { name: "Open Wish: Go swimming with Roxie.", exact: true });
    await expect(openWish).toBeVisible();
    const hostScroll = () => page.evaluate(() => [window.scrollX, window.scrollY]);
    const before = await hostScroll();
    const readTo = async (target) => {
      await target.scrollIntoViewIfNeeded();
      await expect(target).toBeInViewport({ ratio: 0.99 });
      assert.deepEqual(await hostScroll(), before, "Wishes scroll within the profile");
    };
    await openWish.press("Enter");
    const details = profile.getByRole("region", { name: "Wish details", exact: true });
    await expect(details).toBeFocused();
    const section = details.getByRole("tablist", { name: "Wish sections" });
    await expect(details.getByRole("combobox")).toHaveCount(0);
    await expect(section.getByRole("tab")).toHaveCount(2);
    await readTo(section);
    const wishTab = section.getByRole("tab", { name: "Wish", exact: true });
    const historyTab = section.getByRole("tab", { name: "History", exact: true });
    await wishTab.press("End");
    await expect(historyTab).toBeFocused();
    await historyTab.press("Home");
    await expect(wishTab).toBeFocused();
    await wishTab.press("ArrowLeft");
    await expect(historyTab).toBeFocused();
    await expect(historyTab).toHaveAttribute("aria-selected", "true");
    await expect(details.getByRole("tabpanel", { name: "History", exact: true })).toBeVisible();
    await expect(details.getByRole("region", { name: "History" }).locator("time")).toHaveCount(4);
    await expect(profile.getByText("Deep water makes me nervous.", { exact: true })).toBeVisible();
    await expect(profile.getByText("I like the idea of lessons.", { exact: true })).toBeVisible();
    await expect(profile.getByText("I would prefer the lake.", { exact: true })).toBeVisible();
    await expect(profile.getByRole("checkbox")).toHaveCount(0);
    await expect(profile.getByRole("progressbar")).toHaveCount(0);
    assert.equal(writes, 0, "Browsing People and wishes makes no mutation or generation request");
    await expect(profile.getByText("I would prefer the lake.", { exact: true })).toBeVisible();
    await readTo(details.getByText("Actually, the shallow beach sounds better.", { exact: true }));
    await page.screenshot({ path: resolve(`.build-tmp/wish-journal/profile-${width}.png`), fullPage: true });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      "Profile fits the viewport",
    );
    await profile.getByRole("button", { name: "Following", exact: true }).click();
    await expect(profile.getByRole("button", { name: "Follow", exact: true })).toHaveAttribute("aria-pressed", "false");
    assert.equal(wish.status, "open");
    assert.equal(follows, 1);
    await clickCharacterTool(page, "Inspect");
    await expect(profile.getByText("PRIVATE SOCIAL DESIRE", { exact: true })).toBeVisible();
    assert.equal(privateReads, 1);
    await expect(profile.getByText(/PRIVATE REASON/)).toHaveCount(0);
    await profile.getByRole("button", { name: "Open Wish: PRIVATE SOCIAL DESIRE", exact: true }).click();
    await expect(section.getByRole("tab")).toHaveCount(5);
    const reasonTab = section.getByRole("tab", { name: "Why it matters", exact: true });
    await reasonTab.click();
    await expect(details.getByRole("region", { name: "Why it matters" })).toHaveText(/PRIVATE REASON/);
    assert(
      await details
        .getByRole("region", { name: "Why it matters" })
        .locator("p")
        .last()
        .evaluate((node, mobile) => {
          const frame = node.closest(
            mobile ? ".marinara-capability-villages-dossier-root" : ".marinara-capability-villages-dossier-book",
          );
          frame.scrollTop = frame.scrollHeight;
          const range = document.createRange();
          range.selectNodeContents(node);
          const last = [...range.getClientRects()].at(-1),
            bounds = frame.getBoundingClientRect();
          return (
            last.left >= bounds.left - 1 &&
            last.right <= bounds.right + 1 &&
            last.top >= bounds.top - 1 &&
            last.bottom <= bounds.bottom + 1
          );
        }, width <= 700),
      "The final line of a long reason is reachable in the profile reading area",
    );
    await reasonTab.press("ArrowRight");
    await expect(section.getByRole("tab", { name: "Attention", exact: true })).toBeFocused();
    await expect(details.getByRole("region", { name: "Attention", exact: true })).toHaveText(
      "Available when relevant.",
    );
    await readTo(section);
    await section.getByRole("tab", { name: "Approach", exact: true }).click();
    await expect(details.getByRole("region", { name: "Approach", exact: true })).toHaveText(
      /Ask Roxie about a quiet afternoon together\./,
    );
    await readTo(section);
    await section.getByRole("tab", { name: "History", exact: true }).click();
    await expect(details.getByRole("region", { name: "History" }).getByRole("listitem")).toHaveCount(3);
    await expect(details.getByRole("region", { name: "History" }).getByRole("listitem").last()).toContainText(
      "Chose to ask Roxie directly.",
    );
    await expect(details.getByText("Somewhere quiet, please.", { exact: true })).toBeVisible();
    await expect(details.getByText("Other things need attention today.", { exact: true })).toBeVisible();
    await readTo(details.getByText("Chose to ask Roxie directly.", { exact: true }));
    await page.screenshot({ path: resolve(`.build-tmp/wish-journal/inspect-${width}.png`), fullPage: true });
    await details.getByRole("button", { name: "← Wishes", exact: true }).click();
    await expect(details).toHaveCount(0);
    await expect(profile.getByRole("button", { name: "Open Wish: PRIVATE SOCIAL DESIRE", exact: true })).toBeFocused();
    await expect(profile.getByText(/PRIVATE REASON/)).toHaveCount(0);
    const foregroundWish = profile.getByRole("button", { name: "Open Wish: PRIVATE FOREGROUND DESIRE", exact: true });
    for (let page = 0; !(await foregroundWish.count()); page++) {
      assert(page < 20, "The foreground Wish is reachable through list pages");
      await profile.getByRole("button", { name: "Next Wishes page", exact: true }).click();
    }
    await foregroundWish.click();
    await section.getByRole("tab", { name: "Attention", exact: true }).click();
    await expect(details.getByRole("region", { name: "Attention", exact: true })).toHaveText(
      "A recent conversation brought this to mind.",
    );
    await readTo(section);
    await details.getByRole("button", { name: "← Wishes", exact: true }).click();
    await clickCharacterTool(page, "Leave Inspect");
    await expect(profile.getByText("PRIVATE SOCIAL DESIRE")).toHaveCount(0);
    await page
      .getByRole("navigation", { name: "Village navigation", exact: true })
      .getByRole("button", { name: "People", exact: true })
      .click();
    await page.getByRole("button", { name: "Open Roxie profile" }).click();
    await chooseSection("Wishes");
    await expect(page.getByText("No Wishes known yet.", { exact: true })).toBeVisible();
    await page
      .getByRole("navigation", { name: "Village navigation", exact: true })
      .getByRole("button", { name: "People", exact: true })
      .click();
    await page.getByRole("button", { name: "Open Feddy profile" }).click();
    await chooseSection("Venues");
    await expect(page.getByRole("button", { name: "View Venue", exact: true })).toHaveCount(0);
    await expect(page.locator("[data-desk=people]")).toHaveAttribute("data-phase", "open");
    await page
      .getByRole("navigation", { name: "Village navigation", exact: true })
      .getByRole("button", { name: "People", exact: true })
      .focus();
    await page.keyboard.press("Escape");
    await page
      .getByRole("navigation", { name: "Village exploration" })
      .getByRole("button", { name: "Places", exact: true })
      .click();
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
    await page
      .getByRole("navigation", { name: "Village navigation", exact: true })
      .getByRole("button", { name: "People", exact: true })
      .click();
    await page.getByRole("button", { name: "Open Roxie profile" }).click();
    await expect(page.locator("[data-desk=people]")).toHaveAttribute("data-phase", "open");
    await page
      .getByRole("navigation", { name: "Village navigation", exact: true })
      .getByRole("button", { name: "People", exact: true })
      .focus();
    await page.keyboard.press("Escape");
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
});
