import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot as base, mapImage, image, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
const P = "marinara-capability-villages";
const output = resolve(process.env.VILLAGES_VISUAL_OUTPUT || ".build-tmp/dossier");
mkdirSync(output, { recursive: true });
try {
  for (const [width, height] of [
    [1440, 900],
    [1366, 600],
    [900, 800],
    [768, 1024],
    [390, 844],
    [390, 600],
    [320, 650],
  ].filter(([width]) => !process.env.VILLAGES_DOSSIER_WIDTH || width === Number(process.env.VILLAGES_DOSSIER_WIDTH))) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: width < 600 });
    const errors = [],
      writes = [],
      reads = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const village = structuredClone(base);
    village.villagers = village.villagers.slice(0, 2);
    village.villagers[0].summary = "A curious explorer who enjoys meeting people and sharing stories.";
    if (width === 390) village.villagers[0].summary = village.villagers[0].summary.repeat(12);
    village.villagers[0].identityDescription = { text: village.villagers[0].summary, revision: "description-1" };
    let failDescription = false;
    village.villagers[0].tags = ["explorer", "friendly"];
    const secondName = width <= 390 ? "Eli of the Very Long and Winding Riverside Road" : "Eli";
    village.villagers[1].name = secondName;
    village.villagers[1].summary = "";
    village.villagers[1].missing = true;
    village.villagers[0].signatureFallback = { name: "Mara", hand: "lively", slant: -3, spacing: 0.2, flourish: 3 };
    village.villagers[1].signatureFallback = { name: secondName, hand: "neat", slant: 1, spacing: -0.3, flourish: 0 };
    let signatureAttempt = 0;
    let failSignature = false;
    const signatureUrl = "http://villages.test/saved-signature.png";
    await page.route(signatureUrl, (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="180"><text x="20" y="120" font-size="100" font-style="italic">Mara</text></svg>',
      }),
    );
    village.settings.venues[0].residentIds = ["mara"];
    village.villagers[0].place = { id: "mill" };
    village.projects = [
      {
        id: "mara-project",
        kind: "renovation",
        title: "Mara's work",
        status: "active",
        requesterCharacterId: "mara",
        participantIds: [],
        venueId: "mill",
        updatedAt: now,
        progress: 0,
        lifecycle: { phase: "builder" },
      },
    ];
    village.venueRequests = [
      {
        id: "mara-request",
        requesterCharacterId: "mara",
        proposedAt: now,
        venueDraft: {
          name: "Mara's workshop",
          classes: ["workplace"],
          category: "destination",
          description: "A workshop",
        },
      },
      {
        id: "eli-request",
        requesterCharacterId: "eli",
        requesterName: "Mara",
        proposedAt: now,
        venueDraft: {
          name: "Other person's request",
          classes: ["other"],
          category: "destination",
          description: "A different request",
        },
      },
    ];
    const person = (id) => ({ id, name: id === "mara" ? "Mara" : "Eli" });
    let failMemories = false;
    const memory = (id, actor, text) => ({
      id,
      kind: "chat",
      scope: "private",
      dayIndex: 1,
      clock: "morning",
      occurredAt: now,
      dateLabel: "Today",
      text,
      actors: [person(actor)],
      subjects: [person(actor)],
      knownBy: [person(actor)],
      memoryCategory: "shared-experience",
      evidence: { visitId: "evidence", lineIds: ["line"] },
      legacy: false,
    });
    const library = {
      residents: [person("mara"), person("eli")],
      durable: [memory("m1", "mara", "PRIVATE MARA MEMORY"), memory("m2", "eli", "PRIVATE ELI MEMORY")],
      recollections: [],
      expiredRecollectionCount: 0,
      archive: { total: 2, recent: [] },
    };
    const relationships = {
      profiles: ["mara", "eli"].map((characterId) => ({
        characterId,
        name: person(characterId).name,
        warmth: 12,
        trust: 8,
        warmthLabel: "Friendly",
        trustLabel: "Open",
        familiarity: 1,
        friend: true,
        close: false,
        knownAt: now,
        closeKnownAt: "",
        routine: ["Often reads at the Mill"],
        interests: "Stories",
        wishes: characterId === "mara" ? ["Learn to swim"] : [],
        knownWishes:
          characterId === "mara"
            ? [{ wishId: "swim", text: "Learn to swim", learnedAt: now, status: "active", facts: [] }]
            : [],
        ties: [],
        learned: [],
        access: [{ venueId: "harbour", zoneId: "public", active: true, name: "Harbour" }],
      })),
      starting: { pending: false, spoilers: false, summaries: [], values: [] },
    };
    const agendas = {
      villagers: ["mara", "eli"].map((characterId) => ({
        characterId,
        name: person(characterId).name,
        missing: false,
        weekUnreadable: false,
        ingestSchedule: false,
        nativeSchedule: null,
        agenda: {
          wishes: [
            {
              id: characterId + "-private",
              wish: characterId === "mara" ? "PRIVATE MARA WISH" : "PRIVATE ELI WISH",
              tell: "",
              intensity: 2,
              addedAt: now,
              expiresAt: now,
            },
          ],
          routineSummary: "PRIVATE ROUTINE",
          generatedAt: now,
          activeDay: { blocks: [] },
        },
        effectiveDays: {
          Friday: [
            { startMinute: 480, endMinute: 540, activity: "Research", venueId: "market", reason: "", status: "idle" },
          ],
        },
        days: [{ weekday: "Friday", dateLabel: "Today", isToday: true }],
        wishHistoryCount: 0,
      })),
    };
    relationships.profiles[0].knownWishes.push(
      ...Array.from({ length: 12 }, (_, index) => ({
        wishId: `shared-${index}`,
        text: `Shared wish ${index + 1}`,
        learnedAt: now,
        status: "active",
        facts: [],
      })),
    );
    await page.route("**/api/characters/summaries", (route) =>
      route.fulfill({ contentType: "application/json", body: "[]" }),
    );
    await page.route("**/api/villages**", async (route) => {
      const request = route.request(),
        path = new URL(request.url()).pathname;
      if (request.method() === "GET") reads.push(path);
      else if (!path.endsWith("/background/presence") && !path.endsWith("/reconcile"))
        writes.push({ path, method: request.method(), body: request.postDataJSON() });
      let value = village;
      if (path.endsWith("/villagers/mara/description")) {
        if (failDescription)
          return route.fulfill({
            status: 409,
            contentType: "application/json",
            body: JSON.stringify({ error: "Description changed. Reopen the editor to try again." }),
          });
        const body = request.postDataJSON();
        assert.equal(body.revision, village.villagers[0].identityDescription.revision);
        village.villagers[0].identityDescription = { text: body.text, revision: "description-" + writes.length };
        village.villagers[0].summary = body.text;
      } else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (/\/villagers\/(mara|eli)\/signature$/.test(path)) {
        const resident = village.villagers.find((person) => path.includes(`/${person.characterId}/`));
        if (request.method() === "POST") {
          signatureAttempt++;
          if (!failSignature)
            resident.signature = {
              name: resident.name,
              generatedAt: now,
              image: { ref: "global-gallery:signature", id: "signature", url: signatureUrl },
              original: { ref: "global-gallery:original-signature", id: "original-signature", url: signatureUrl },
            };
        }
        value = {
          fallback: resident.signatureFallback,
          saved: resident.signature ?? null,
          available: resident.characterId === "mara",
          recoverable: false,
          unavailableReason: "No image connection is available.",
          attempt: signatureAttempt,
          status: failSignature ? "failed" : resident.signature ? "saved" : "local",
          error: failSignature ? "Signature provider unavailable" : "",
        };
      } else if (path.endsWith("/rooms/active")) value = { session: null };
      else if (path.endsWith("/catalog")) value = { characters: [] };
      else if (path.endsWith("/relationships/creator")) {
        relationships.starting.spoilers = true;
        relationships.starting.values = [
          { fromId: "mara", toId: "eli", fromName: "Mara", toName: "Eli", warmth: 33, trust: 44, proposed: false },
        ];
        value = relationships;
      } else if (path.endsWith("/relationships")) value = relationships;
      else if (path.endsWith("/memories")) {
        if (failMemories)
          return route.fulfill({
            status: 503,
            contentType: "application/json",
            body: '{"error":"Memory service unavailable"}',
          });
        value = library;
      } else if (path.endsWith("/memories/durable/m1")) {
        library.durable = library.durable.filter((entry) => entry.id !== "m1");
        value = {};
      } else if (path.endsWith("/rooms/archive/evidence"))
        value = {
          visit: {
            id: "evidence",
            placeName: "The Mill",
            participants: [{ characterId: "mara", name: "Mara" }],
            lines: [{ id: "line", name: "Mara", at: now, heardBy: ["mara"], content: "SOURCE EVIDENCE" }],
          },
        };
      else if (path.endsWith("/agendas/mara/influence")) {
        agendas.villagers[0].ingestSchedule = true;
        value = agendas;
      } else if (path.endsWith("/agendas/mara/regenerate") || path.endsWith("/agendas")) value = agendas;
      else if (path.endsWith("/usage/preview")) value = { requests: { min: 1, max: 1 }, warnings: [] };
      else if (path.endsWith("/villagers/mara/refresh"))
        value =
          request.method() === "GET"
            ? {
                characterId: "mara",
                current: { revision: 1 },
                proposed: { name: "Mara", revision: 2 },
                changed: true,
                sourceAvailable: true,
              }
            : village;
      else if (path.endsWith("/villagers/mara") && request.method() === "DELETE") {
        village.villagers = village.villagers.filter((entry) => entry.characterId !== "mara");
        value = village;
      } else if (path.endsWith("/wishes/swim/retire")) {
        relationships.profiles[0].knownWishes[0].status = "retired";
        value = relationships;
      } else if (/\/greet|\/turn|\/interpret/.test(path)) throw Error("Unexpected generation request " + path);
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.route("http://villages.test/", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: `<style>:root{--background:#29251f;--foreground:#f4f0e8;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}html,body{margin:0;font:16px Arial}${P}{display:block;height:100vh}</style><${P}></${P}>`,
      }),
    );
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const retainedMap = await page.locator(`.${P}-home-full`).elementHandle();
    const people = page
      .getByRole("navigation", { name: "Village exploration" })
      .getByRole("button", { name: "People", exact: true });
    await people.click();
    const selector = page.getByRole("main", { name: "Villagers directory" });
    await expect(page.locator(`.${P}-notebook-session`)).toHaveAttribute("data-phase", "open");
    await expect(selector.locator(`.${P}-directory-page`)).toHaveCount(2);
    const bookBox = await page.locator(`.${P}-dossier-book`).boundingBox();
    await page.screenshot({ path: resolve(output, `directory-${width}-${height}.png`) });
    await selector.getByRole("searchbox").fill("nobody-matches");
    await expect(selector.getByText("No villagers match your search.")).toBeVisible();
    await selector.getByRole("searchbox").fill("");
    await selector.getByRole("button", { name: "Open Mara profile" }).click();
    assert.deepEqual(
      await page.locator(`.${P}-dossier-book`).boundingBox(),
      bookBox,
      "Directory and profile share the same book dimensions",
    );
    await page.getByRole("button", { name: "← Back to Villagers" }).click();
    await selector.getByRole("button", { name: `Open ${secondName} profile` }).click();
    if (width === 390 && height === 844) await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole("button", { name: "Close ×" }).click();
    await expect(people).toBeFocused();
    if (width === 390 && height === 844) await page.setViewportSize({ width, height });
    assert.equal(
      await retainedMap.evaluate((node) => node.isConnected),
      true,
      "Map stays mounted throughout notebook browsing",
    );
    if (width === 1440 || (width === 390 && height === 844)) {
      const savedVillagers = village.villagers;
      village.villagers = [
        ...Array.from({ length: 40 }, (_, index) => ({
          ...savedVillagers[1],
          characterId: `extra-${index}`,
          name: `Neighbor ${index}`,
          summary: "",
          tags: [],
        })),
        ...savedVillagers,
      ];
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      await people.click();
      await expect(selector.getByRole("button", { name: /^Open .* profile$/ })).toHaveCount(42);
      const list = selector.locator(`.${P}-directory-reading`);
      const position = await list.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
        return node.scrollTop;
      });
      assert.ok(position > 0, "Large rosters scroll inside the book");
      await selector.getByRole("button", { name: `Open ${secondName} profile` }).click();
      await page.getByRole("button", { name: "← Back to Villagers" }).click();
      assert.equal(
        await list.evaluate((node) => node.scrollTop),
        position,
        "Directory reading position survives profile browsing",
      );
      await page.getByRole("button", { name: "Close ×" }).click();
      await expect(people).toBeFocused();
      village.villagers = savedVillagers;
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    }
    await page.getByRole("button", { name: "More", exact: true }).click();
    const menu = page.getByRole("navigation", { name: "Village menu pages" });
    for (const name of ["Relationships", "Memories", "Villager Agendas", "DEBUG: Villager Wishes"])
      await expect(menu.getByRole("button", { name, exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: /^Villagers \(/ }).click();
    const directory = page.getByRole("main", { name: "Villagers directory" });
    await expect(page.locator(`.${P}-notebook-session`)).toHaveAttribute("data-phase", "open");
    await expect(menu).toHaveCount(0);
    await directory.getByRole("searchbox", { name: "Search villagers" }).fill("explorer");
    await expect(directory.getByRole("button", { name: /^Open .* profile$/ })).toHaveCount(1);
    await directory.getByRole("button", { name: "Open Mara profile" }).click();
    const profile = page.getByRole("region", { name: "Mara profile", exact: true });
    const tabs = page.getByRole("navigation", { name: "Villager profile sections" });
    const settleTurn = () =>
      profile
        .locator(`.${P}-dossier-turn`)
        .evaluateAll((nodes) =>
          Promise.all(
            nodes.flatMap((node) => node.getAnimations().map((animation) => animation.finished.catch(() => {}))),
          ),
        );
    await expect(profile).toBeVisible();
    await expect(profile.getByRole("heading", { name: "Mara", exact: true })).toHaveCount(1);
    await expect(profile.getByRole("heading", { name: "Mara", exact: true })).toBeInViewport({ ratio: 1 });
    await expect(profile.locator(`.${P}-dossier-content`)).toBeEmpty();
    await tabs.getByRole("button", { name: "Venues", exact: true }).click();
    await expect(profile.getByText("Mara's workshop", { exact: true })).toBeVisible();
    await expect(profile.getByText("Other person's request", { exact: true })).toHaveCount(0);
    await profile.getByRole("button", { name: /Mara's workshop/ }).click();
    await expect(page.locator('[data-villager-request="request:mara-request"]')).toBeFocused();
    await page.getByRole("button", { name: /^Villagers \(/ }).click();
    await directory.getByRole("button", { name: "Open Mara profile" }).click();
    assert.equal(reads.filter((path) => path.endsWith("/memories") || path.endsWith("/agendas")).length, 0);
    assert.equal(writes.length, 0, JSON.stringify(writes));
    const signature = profile.getByRole("img", { name: "Mara's signature", exact: true });
    await expect(signature).toBeVisible();
    await expect(signature.locator('[data-hand="lively"]')).toHaveText("Mara");
    await profile.getByRole("button", { name: "Generate signature", exact: true }).click();
    await expect(profile.getByRole("button", { name: "Regenerate signature", exact: true })).toBeVisible();
    await expect(signature.locator("img")).toHaveAttribute("src", signatureUrl);
    assert.equal(writes.at(-1).path.endsWith("/villagers/mara/signature"), true);
    for (const [markWidth, markHeight] of [
      [200, 900],
      [1200, 120],
      [400, 400],
    ]) {
      const art = signature.locator("img");
      await art.evaluate(
        async (element, [w, h]) => {
          element.src =
            "data:image/svg+xml," +
            encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#c34b82"/></svg>`,
            );
          await element.decode();
        },
        [markWidth, markHeight],
      );
      const bounds = await art.boundingBox();
      assert.ok(bounds.width <= 280.5 && bounds.height <= 240.5, "Mark fits the responsive signature area");
      assert.ok(
        Math.abs(bounds.width / bounds.height - markWidth / markHeight) < 0.02,
        "Artwork keeps its proportions",
      );
      await art.scrollIntoViewIfNeeded();
      await page.screenshot({ path: resolve(output, `signature-${markWidth}x${markHeight}-${width}-${height}.png`) });
    }
    await signature.locator("img").evaluate((element, url) => {
      element.src = url;
    }, signatureUrl);

    assert.equal(writes.at(-1).body.expectedAttempt, 0);
    failSignature = true;
    await profile.getByRole("button", { name: "Regenerate signature", exact: true }).click();
    await expect(profile.getByRole("alert")).toContainText("Signature provider unavailable");
    await expect(signature.locator("img")).toHaveAttribute("src", signatureUrl);
    failSignature = false;
    await profile.getByRole("button", { name: "Retry signature", exact: true }).click();
    await expect(profile.getByRole("alert")).toHaveCount(0);
    await page.screenshot({ path: resolve(output, `overview-${width}-${height}.png`) });
    await expect.poll(() => page.evaluate(() => document.fonts.check('17px "Villages Notebook"'))).toBe(true);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
      false,
      "Profile fits viewport",
    );
    if (width === 390)
      assert.ok(
        await profile.locator(`.${P}-dossier-biography`).evaluate((node) => {
          node.scrollTop = node.scrollHeight;
          return node.scrollTop > 0;
        }),
        "Long summaries remain readable in their own scroll area",
      );
    await tabs.getByRole("button", { name: "Overview", exact: true }).focus();
    await page.keyboard.press("Tab");
    const relationshipTab = tabs.getByRole("button", { name: "Relationships", exact: true });
    await expect(relationshipTab).toBeFocused();
    assert.ok(
      await relationshipTab.evaluate((node) => parseFloat(getComputedStyle(node).outlineWidth) >= 3),
      "Keyboard focus is visible",
    );
    for (const label of ["Relationships", "Wishes", "Memories", "Agenda", "Venues"]) {
      await tabs.getByRole("button", { name: label, exact: true }).click();
      await expect(profile.getByRole("heading", { name: "Mara", exact: true, level: 1 })).toBeVisible();
      await expect(profile.getByText(/PRIVATE/)).toHaveCount(0);
      await expect(profile.getByRole("checkbox")).toHaveCount(0);
    }
    await expect(profile.getByText(/Harbour · Standing access/)).toBeVisible();
    await expect(profile.getByText("Agenda destination", { exact: true })).toHaveCount(0);
    await tabs.getByRole("button", { name: "Wishes", exact: true }).click();
    await expect(profile.getByText("Learn to swim", { exact: true }).first()).toBeVisible();
    const tabBefore = await tabs.boundingBox();
    const reading = profile.locator(`.${P}-dossier-content`);
    assert.ok(
      await reading.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
        return node.scrollTop > 0;
      }),
      "Long section content scrolls vertically",
    );
    const tabAfter = await tabs.boundingBox();
    assert.equal(tabAfter.y, tabBefore.y, "Sticky notes stay fixed while content scrolls");
    assert.equal(tabAfter.x, tabBefore.x);
    await expect(profile.getByText("Shared wish 12", { exact: true }).first()).toBeVisible();
    await settleTurn();
    await page.screenshot({ path: resolve(output, `wishes-${width}-${height}.png`) });
    await tabs.getByRole("button", { name: "Inspect", exact: true }).click();
    await expect(profile.getByText("PRIVATE MARA WISH", { exact: true })).toBeVisible();
    await expect(profile.getByText("PRIVATE ELI WISH", { exact: true })).toHaveCount(0);
    await tabs.getByRole("button", { name: "Agenda", exact: true }).click();
    await expect(profile.getByText("PRIVATE ROUTINE", { exact: true })).toBeVisible();
    await profile.getByRole("checkbox", { name: "Schedule influence" }).click();
    await expect(profile.getByRole("checkbox", { name: "Schedule influence" })).toBeChecked();
    assert.equal(writes.at(-1).path.endsWith("/agendas/mara/influence"), true);
    await profile.getByRole("button", { name: "Regenerate agenda", exact: true }).click();
    try {
      await expect.poll(() => writes.at(-1).path.endsWith("/agendas/mara/regenerate")).toBe(true);
    } catch (cause) {
      await page.screenshot({ path: resolve(output, `agenda-failure-${width}.png`) });
      console.error(
        JSON.stringify({
          width,
          writes: writes.slice(-6),
          errors,
          alerts: await profile.getByRole("alert").allTextContents(),
        }),
      );
      throw cause;
    }
    await tabs.getByRole("button", { name: "Venues", exact: true }).click();
    await expect(profile.getByText("Agenda destination", { exact: true })).toBeVisible();
    await tabs.getByRole("button", { name: "Relationships", exact: true }).click();
    await profile.getByText("Relationship creator", { exact: true }).click();
    await profile.getByRole("checkbox", { name: "I understand this reveals gameplay spoilers." }).check();
    await profile.getByRole("button", { name: "Reveal and edit relationship values" }).click();
    await expect(profile.getByRole("combobox", { name: "Directional relationship to edit" })).toBeVisible();
    await tabs.getByRole("button", { name: "Memories", exact: true }).click();
    await expect(profile.getByText("PRIVATE MARA MEMORY", { exact: true })).toBeVisible();
    await expect(profile.getByText("PRIVATE ELI MEMORY", { exact: true })).toHaveCount(0);
    if (width === 390) {
      const query = profile.getByRole("searchbox", { name: "Search memories" });
      await query.fill("PRIVATE");
      await page.setViewportSize({ width: 1440, height: 900 });
      await expect(query).toHaveValue("PRIVATE");
      await expect(tabs.getByRole("button", { name: "Memories", exact: true })).toHaveAttribute("aria-pressed", "true");
      await page.setViewportSize({ width, height });
      await expect(query).toHaveValue("PRIVATE");
      await query.fill("");
    }
    await profile
      .locator(`.${P}-memory-card`)
      .filter({ hasText: "PRIVATE MARA MEMORY" })
      .getByText("Details", { exact: true })
      .click();
    await profile.getByRole("button", { name: "View evidence" }).click();
    await expect(profile.getByText("SOURCE EVIDENCE", { exact: false })).toBeVisible();
    await settleTurn();
    await page.screenshot({ path: resolve(output, `inspect-${width}-${height}.png`) });
    page.once("dialog", (dialog) => dialog.accept());
    await profile.getByRole("button", { name: "Forget", exact: true }).click();
    await expect(profile.getByText("PRIVATE MARA MEMORY", { exact: true })).toHaveCount(0);
    failMemories = true;
    await profile.getByRole("button", { name: "Refresh", exact: true }).click();
    await expect(profile.getByRole("alert")).toContainText("Memory service unavailable");
    failMemories = false;
    await profile.getByRole("button", { name: "Refresh", exact: true }).click();
    await expect(profile.getByRole("alert")).toHaveCount(0);
    await profile.getByRole("button", { name: "← Back to Villagers", exact: true }).click();
    await expect(directory.getByRole("searchbox", { name: "Search villagers" })).toHaveValue("explorer");
    await expect(directory.getByRole("button", { name: "Open Mara profile" })).toBeFocused();
    await expect(page.locator(`.${P}-notebook-session`)).toHaveAttribute("data-phase", "open");
    await directory.getByRole("searchbox", { name: "Search villagers" }).fill("");
    await directory.getByRole("button", { name: `Open ${secondName} profile` }).click();
    await expect(tabs.getByRole("button", { name: "Inspect", exact: true })).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByText(/PRIVATE/)).toHaveCount(0);
    await expect(page.getByText("No character summary recorded.", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/Card missing · saved character remains available/)).toBeVisible();
    const otherSignature = page.getByRole("img", { name: `${secondName}'s signature`, exact: true });
    await expect(otherSignature).toBeVisible();
    await expect(otherSignature.locator('[data-hand="neat"]')).toHaveText(secondName);
    await expect(page.getByRole("button", { name: "Generate signature", exact: true })).toHaveCount(0);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
      false,
      "Long-name profile fits viewport",
    );
    if (width <= 390) await page.screenshot({ path: resolve(output, `long-name-${width}.png`) });
    await page.getByRole("button", { name: "← Back to Villagers", exact: true }).click();
    await directory.getByRole("button", { name: "Open Mara profile" }).click();
    await expect(profile.getByRole("img", { name: "Mara's signature", exact: true }).locator("img")).toHaveAttribute(
      "src",
      signatureUrl,
    );
    await profile.getByText("Manage", { exact: true }).click();

    await profile.getByRole("button", { name: "Edit description", exact: true }).click();
    const description = profile.getByRole("textbox", { name: "Description", exact: true });
    const initialDescription = village.villagers[0].summary;
    await description.fill("A reserved explorer with an interest in old machinery.");
    await profile.getByText("Manage", { exact: true }).click();
    await tabs.getByRole("button", { name: "Agenda", exact: true }).click();
    await profile.getByText("Manage", { exact: true }).click();
    await expect(description).toHaveValue("A reserved explorer with an interest in old machinery.");
    await profile.getByText("Manage", { exact: true }).click();
    await tabs.getByRole("button", { name: "Overview", exact: true }).click();
    await profile.getByText("Manage", { exact: true }).click();
    await profile.getByRole("button", { name: "Cancel", exact: true }).click();
    assert.equal(village.villagers[0].summary, initialDescription);
    await profile.getByRole("button", { name: "Edit description", exact: true }).click();
    await description.fill("A patient explorer who studies <b>old machinery</b>.");
    failDescription = true;
    await profile.getByRole("button", { name: "Save", exact: true }).click();
    await expect(profile.getByRole("alert")).toContainText("Description changed");
    await expect(description).toHaveValue("A patient explorer who studies <b>old machinery</b>.");
    failDescription = false;
    await profile.getByRole("button", { name: "Save", exact: true }).click();
    await expect(profile.locator("." + P + "-dossier-biography")).toHaveText(
      "A patient explorer who studies <b>old machinery</b>.",
    );
    await expect(profile.locator("." + P + "-dossier-biography b")).toHaveCount(0);
    await profile.getByRole("button", { name: "Edit description", exact: true }).click();
    await page.screenshot({ path: resolve(output, "description-editor-" + width + "-" + height + ".png") });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
      false,
      "Description editor fits viewport",
    );
    await description.fill("");
    await profile.getByRole("button", { name: "Save", exact: true }).click();
    await expect(profile.locator("." + P + "-dossier-biography p")).toHaveCount(0);
    await profile.getByRole("button", { name: "Compare card", exact: true }).click();
    await expect(profile.getByRole("button", { name: "Apply refresh", exact: true })).toBeVisible();
    await profile.getByRole("button", { name: "Apply refresh", exact: true }).click();
    await profile.getByText("Actions", { exact: true }).click();
    await profile.getByRole("button", { name: "Move out", exact: true }).click();
    await expect(page.getByRole("heading", { name: "This villager has moved out" })).toBeVisible();
    await page.getByRole("button", { name: "← Back to Villagers", exact: true }).click();
    await expect(directory.getByRole("button", { name: "Open Mara profile" })).toHaveCount(0);
    await page.getByRole("button", { name: "Close ×", exact: true }).click();
    await page.getByRole("button", { name: /^Villagers \(/ }).click();
    await expect(page.locator(`.${P}-notebook-session`)).toHaveAttribute("data-phase", "open");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(`.${P}-notebook-cover`)).toBeHidden();
    await directory.getByRole("button", { name: `Open ${secondName} profile` }).click();
    await tabs.getByRole("button", { name: "Wishes", exact: true }).click();
    await expect(page.locator(`.${P}-dossier-turn`)).toBeHidden();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
      false,
      "Directory fits viewport",
    );
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`Dossier ${width}×${height}: privacy, filtering, navigation, actions and layout passed`);
  }
} finally {
  await browser.close();
}
