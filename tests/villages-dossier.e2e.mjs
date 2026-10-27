import { fixtureWish } from "./helpers/social-wishes-fixture.js";
import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { PNG } from "pngjs";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
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
    [977, 932],
    [900, 800],
    [768, 1024],
    [390, 844],
    [390, 600],
    [320, 650],
  ].filter(
    ([width, height]) =>
      (!process.env.VILLAGES_DOSSIER_WIDTH || width === Number(process.env.VILLAGES_DOSSIER_WIDTH)) &&
      (!process.env.VILLAGES_DOSSIER_HEIGHT || height === Number(process.env.VILLAGES_DOSSIER_HEIGHT)),
  )) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: width < 600 });
    await mockEngineLookups(page);
    const errors = [],
      writes = [],
      reads = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const village = structuredClone(base);
    village.villagers = village.villagers.slice(0, 2);
    village.villagers[0].letterFontId = "caveat";
    await page.route("**/api/capability-packages/villages/assets/letter-fonts/caveat.json", (route) =>
      fulfill(route, {
        contentType: "application/json",
        body: readFileSync("packages/villages/letter-fonts/caveat.json", "utf8"),
      }),
    );
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
      fulfill(route, {
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="180"><text x="20" y="120" font-size="100" font-style="italic">Mara</text></svg>',
      }),
    );
    // Legacy worlds may use the single-resident occupancy field.
    village.settings.venues[0].occupancy.residentCharacterId = "mara";
    village.settings.venues[1].workerIds = ["mara"];
    village.settings.venues[2].workerIds = ["mara"];
    village.villagers[0].place = { id: "mill" };
    village.settings.venues.push({
      ...structuredClone(village.settings.venues[1]),
      id: "secret-place",
      name: "Unseen private place",
      workerIds: [],
      zones: [{ id: "secret-zone", name: "Secret", kind: "private-residence", seen: false, ownerId: "mara" }],
    });
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
    const corrections = [];
    let staleCorrection = false;
    let holdCorrection = false;
    let releaseCorrection;
    const memory = (id, actor, text) => ({
      id,
      rootId: id,
      revision: 1,
      rootRevision: 1,
      kind: "experience",
      text,
      occurredAt: now,
      recordedAt: now,
      subjects: [person(actor)],
      knownBy: [person(actor)],
      forgotten: false,
      playerCorrection: false,
    });
    const library = {
      inspection: true,
      seed: "dossier-world",
      revision: 1,
      residents: [person("mara"), person("eli")],
      entries: [memory("m1", "mara", "PRIVATE MARA MEMORY"), memory("m2", "eli", "PRIVATE ELI MEMORY")],
      total: 2,
      next: null,
    };
    const relationships = {
      profiles: ["mara", "eli"].map((characterId) => ({
        characterId,
        name: person(characterId).name,
        summary: "Mara has expressed an interest in talking again.",
        knownAt: now,
        closeKnownAt: "",
        routine: ["Often reads at the Mill"],
        interests: "Stories",
        wishes: characterId === "mara" ? ["Learn to swim"] : [],
        knownWishes:
          characterId === "mara"
            ? [{ wishId: "swim", text: "Learn to swim", at: now, status: "open", followed: true, facts: [] }]
            : [],
        ties: [],
        learned:
          characterId === "mara"
            ? [{ text: "Mara and Eli are friends", kind: "connection", at: now, aboutName: "Eli" }]
            : [],
        access: [{ venueId: "harbour", zoneId: "public", active: true, name: "Harbour" }],
      })),
      starting: { pending: false },
    };
    let failMailRead = false;
    let failMailResponse = false;
    const mailbox = {
      threads: [
        {
          id: "personal:mara",
          residentId: "mara",
          residentName: "Mara",
          revision: 1,
          messages: [
            {
              id: "first-letter",
              fromId: "mara",
              text: "A first letter from Mara.",
              at: now,
              status: "delivered",
              read: false,
              replyPending: false,
              retryAvailable: false,
            },
            {
              id: "second-letter",
              fromId: "mara",
              text: "A second letter from Mara.",
              at: now,
              status: "delivered",
              read: false,
              replyPending: false,
            },
          ],
        },
      ],
      recovery: [],
    };
    let historyRetried = false;
    const agendas = {
      villagers: ["mara", "eli"].map((characterId) => ({
        characterId,
        name: person(characterId).name,
        missing: false,
        weekUnreadable: false,
        ingestSchedule: false,
        nativeSchedule: null,
        wishes: [
          fixtureWish(
            {
              wish: characterId === "mara" ? "PRIVATE MARA WISH" : "PRIVATE ELI WISH",
              reason: "Grounded social fixture desire",
            },
            characterId + "-private",
            now,
          ),
        ],
        agenda: {
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
        at: now,
        followed: true,
        status: "open",
        facts: [],
      })),
    );
    await page.route("**/api/characters/summaries", (route) =>
      fulfill(route, { contentType: "application/json", body: "[]" }),
    );
    await page.route("**/api/villages**", async (route) => {
      const request = route.request(),
        path = new URL(request.url()).pathname;
      if (request.method() === "GET") reads.push(path);
      else if (!path.endsWith("/background/presence") && !path.endsWith("/reconcile"))
        writes.push({ path, method: request.method(), body: request.postDataJSON() });
      if (path.endsWith("/background/presence"))
        return fulfill(route, { json: { status: "ready", snapshot: village } });
      let value = village;
      if (path.endsWith("/background/retry")) {
        const body = request.postDataJSON();
        assert.equal(body.id, "history-job");
        assert.equal(body.expectedAttempt, 1);
        assert.ok(body.actionId);
        historyRetried = true;
      } else if (path.includes("/mailbox")) {
        if (path.endsWith("/mailbox/threads") && request.method() === "POST") {
          const body = request.postDataJSON();
          let thread = mailbox.threads.find((row) => row.residentId === body.residentId);
          if (!thread) {
            thread = {
              id: "personal:" + body.residentId,
              residentId: body.residentId,
              residentName: person(body.residentId).name,
              revision: 1,
              messages: [],
            };
            mailbox.threads.push(thread);
          }
          if (!thread.messages.some((message) => message.id === body.requestId))
            thread.messages.push({
              id: body.requestId,
              fromId: "player",
              text: body.text,
              at: now,
              status: "pending",
              read: false,
              replyPending: false,
            });
          if (failMailResponse) {
            failMailResponse = false;
            return fulfill(route, { status: 503, json: { error: "Reply lost" } });
          }
        }
        if (path.endsWith("/retry")) {
          const failed = mailbox.threads.flatMap((thread) => thread.messages).find((message) => message.retryAvailable);
          if (failed) {
            failed.retryAvailable = false;
            delete failed.error;
          }
        }
        if (path.endsWith("/read") && failMailRead) {
          failMailRead = false;
          return fulfill(route, { status: 503, json: { error: "Read failed" } });
        }
        if (path.endsWith("/read"))
          mailbox.threads[0].messages.find((message) => message.id === request.postDataJSON().messageId).read = true;
        value = mailbox;
      } else if (path.endsWith("/villagers/mara/description")) {
        if (failDescription)
          return fulfill(route, {
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
      else if (path.endsWith("/relationships/inspect"))
        value = {
          processing: [
            {
              id: "history-job",
              attempt: historyRetried ? 2 : 1,
              label: "Interpret starting relationships",
              status: historyRetried ? "completed" : "failed",
              message: historyRetried ? "" : "Starting history returned an invalid connection.",
              requests: 1,
              tokens: 100,
            },
          ],
          conflicts: [],
          residents: [
            {
              characterId: "mara",
              name: "Mara",
              initialized: true,
              intentions: [
                {
                  text: "Seek another conversation",
                  reason: "Enjoyed the last one",
                  targets: ["Player"],
                  status: "active",
                },
              ],
              perspectives: [
                {
                  aboutName: "Player",
                  connection: "Acquaintances",
                  stance: "PRIVATE MARA STANCE",
                  expectations: [],
                  concerns: [],
                  updatedAt: now,
                  revision: 1,
                  records: [],
                  experiences: [
                    {
                      reason: "A welcome conversation",
                      at: now,
                      sourceId: "source",
                      evidence: [{ speaker: "Mara", text: "I enjoyed talking." }],
                    },
                  ],
                  technical: { fromId: "mara", toId: "player", receiptIds: ["saved"] },
                },
              ],
            },
          ],
        };
      else if (path.endsWith("/relationships")) value = relationships;
      else if (path.endsWith("/memories/inspect")) {
        if (failMemories)
          return fulfill(route, {
            status: 503,
            contentType: "application/json",
            body: '{"error":"Memory service unavailable"}',
          });
        const query = new URL(request.url()).searchParams,
          characterId = query.get("characterId") || "player",
          search = query.get("query") || "";
        const entries = library.entries.filter(
          (entry) =>
            entry.knownBy.some((person) => person.id === characterId) &&
            entry.text.toLowerCase().includes(search.toLowerCase()),
        );
        value = { ...library, characterId, query: search, entries, total: entries.length };
      } else if (path.endsWith("/memories/m1/forget")) {
        const body = request.postDataJSON();
        assert.deepEqual(body.knowers, ["mara"]);
        assert.equal(body.target.id, "m1");
        assert.equal(body.seed, library.seed);
        assert.equal(body.expectedCollectionRevision, library.revision);
        library.entries[0].forgotten = true;
        library.revision++;
        value = { forgotten: true };
      } else if (path.endsWith("/memories/m1/correct")) {
        const body = request.postDataJSON();
        corrections.push(body);
        if (holdCorrection) {
          await new Promise((resolve) => {
            releaseCorrection = resolve;
          });
          return fulfill(route, { json: { corrected: true } });
        }
        if (staleCorrection)
          return fulfill(route, { status: 409, json: { error: "Memories changed. Refresh the list." } });
        assert.deepEqual(body.knowers, ["mara"]);
        assert.equal(body.seed, library.seed);
        assert.equal(body.target.id, "m1");
        if (corrections.length === 1) {
          assert.equal(body.expectedCollectionRevision, library.revision);
          library.entries[0].text = body.text;
          library.entries[0].playerCorrection = true;
          library.entries[0].revision++;
          library.entries[0].rootRevision++;
          library.revision++;
          return fulfill(route, { status: 503, json: { error: "Saved response unavailable. Try again." } });
        }
        assert.deepEqual(body, corrections[0], "An uncertain result retries the identical operation.");
        value = { corrected: true };
      } else if (path.endsWith("/memories/inspect/m1"))
        value = {
          seed: library.seed,
          revision: library.revision,
          entry: library.entries[0],
          knowers: [
            {
              person: person("mara"),
              basis: "observation",
              learnedAt: now,
              reinforcedAt: now,
              forgotten: library.entries[0].forgotten,
              playerCorrection: library.entries[0].playerCorrection,
              text: library.entries[0].text,
              support: [{ sourceId: "deleted-source-scene", lineId: "line", excerpt: "SOURCE EVIDENCE" }],
            },
          ],
        };
      else if (path.endsWith("/wishes/inspect"))
        value = { wishes: agendas.villagers.find((v) => path.includes("/" + v.characterId + "/"))?.wishes ?? [] };
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
      } else if (/\/greet|\/turn|\/interpret/.test(path)) throw Error("Unexpected generation request " + path);
      await fulfill(route, { contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.route("http://villages.test/", (route) =>
      fulfill(route, {
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
    await expect(selector.getByRole("searchbox")).toHaveCount(0);
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
    const menu = page.getByRole("navigation", { name: "More sections" });
    for (const name of ["Relationships", "Memories", "Villager Agendas", "DEBUG: Villager Wishes"])
      await expect(menu.getByRole("button", { name, exact: true })).toHaveCount(0);
    await page.getByRole("navigation", { name: "Village navigation" }).getByRole("button", { name: "People" }).click();
    const directory = page.getByRole("main", { name: "Villagers directory" });
    await expect(page.locator(`.${P}-notebook-session`)).toHaveAttribute("data-phase", "open");
    await expect(menu).toHaveCount(0);
    await expect(directory.getByRole("searchbox", { name: "Search villagers" })).toHaveCount(0);
    await expect(directory.getByRole("button", { name: "Add a villager" })).toHaveCount(0);
    await expect(directory.getByText("explorer", { exact: true })).toHaveCount(0);
    await expect(directory.getByRole("button", { name: /^Open .* profile$/ })).toHaveCount(2);
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
    const overview = profile.getByRole("region", { name: "Overview content" });
    await expect(overview.getByText("Mara has expressed an interest in talking again.")).toBeVisible();
    await expect(overview.getByText("Mara and Eli are friends")).toBeVisible();
    await expect(overview.getByText("Learn to swim")).toBeVisible();
    await expect(overview.getByText("Often reads at the Mill")).toBeVisible();
    await expect(overview.getByText("Home · The Mill", { exact: true })).toBeVisible();
    await expect(overview.getByText("Work · The Harbour", { exact: true })).toBeVisible();
    await expect(overview.getByText("Work · The Market", { exact: true })).toBeVisible();
    await expect(overview.getByText(/PRIVATE/)).toHaveCount(0);
    if (width === 1440) {
      village.settings.venues[0].occupancy.residentCharacterId = null;
      village.settings.venues[1].residentIds = ["mara"];
      village.settings.venues[1].name = "New Harbour";
      village.settings.venues[2].workerIds = [];
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await expect(overview.getByText("Home · New Harbour", { exact: true })).toBeVisible();
      await expect(overview.getByText("Work · New Harbour", { exact: true })).toBeVisible();
      await expect(overview.getByText("Home · The Mill", { exact: true })).toHaveCount(0);
      await expect(overview.getByText("Work · The Market", { exact: true })).toHaveCount(0);
      village.settings.venues[0].occupancy.residentCharacterId = "mara";
      village.settings.venues[1].residentIds = [];
      village.settings.venues[1].name = "The Harbour";
      village.settings.venues[2].workerIds = ["mara"];
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await expect(overview.getByText("Home · The Mill", { exact: true })).toBeVisible();
    }
    const savedProfiles = structuredClone(relationships.profiles);
    relationships.profiles = [];
    relationships.starting.pending = true;
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(overview.getByText("Profile information is still being prepared.")).toBeVisible();
    await expect(overview.getByText("Home · The Mill", { exact: true })).toBeVisible();
    await expect(overview.getByText("No relationship shared yet.")).toHaveCount(0);
    relationships.profiles = savedProfiles;
    relationships.starting.pending = false;
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(overview.getByText("Mara and Eli are friends")).toBeVisible();
    assert.equal(reads.filter((path) => path.endsWith("/memories/inspect") || path.endsWith("/agendas")).length, 0);
    await tabs.getByRole("button", { name: "Venues", exact: true }).click();
    await expect(profile.getByRole("heading", { name: "The Mill", exact: true })).toBeVisible();
    await expect(profile.getByRole("heading", { name: "The Harbour", exact: true })).toBeVisible();
    await expect(profile.getByText("Mara's workshop", { exact: true })).toHaveCount(0);
    await expect(profile.getByText("Unseen private place", { exact: true })).toHaveCount(0);
    await expect(profile.getByRole("button", { name: /Projects Open Projects/ })).toBeVisible();
    await expect(profile.getByRole("button", { name: /Venue Requests Open Venue Requests/ })).toBeVisible();
    await tabs.getByRole("button", { name: "Inspect", exact: true }).click();
    await expect(profile.getByText("Mara's workshop", { exact: true })).toBeVisible();
    await expect(profile.getByRole("heading", { name: "Unseen private place", exact: true })).toBeVisible();
    await expect(profile.getByText("Other person's request", { exact: true })).toHaveCount(0);
    await profile.getByRole("button", { name: /Mara's workshop/ }).click();
    await expect(page.locator('[data-villager-request="request:mara-request"]')).toBeFocused();
    await page.getByRole("navigation", { name: "Village navigation" }).getByRole("button", { name: "People" }).click();
    await directory.getByRole("button", { name: "Open Mara profile" }).click();
    assert.equal(writes.length, 0, JSON.stringify(writes));
    const signature = profile.getByRole("img", { name: "Mara's signature", exact: true });
    await expect(signature).toBeVisible();
    await expect(signature.locator('[data-hand="lively"]')).toHaveText("Mara");
    await profile.getByRole("button", { name: "Generate signature", exact: true }).click();
    await expect(profile.getByRole("button", { name: "Regenerate signature", exact: true })).toBeVisible();
    await expect(signature.locator("img")).toHaveAttribute("src", signatureUrl);
    assert.equal(writes.at(-1).path.endsWith("/villagers/mara/signature"), true);
    // Old saved derivatives may contain both enclosed white fills and matte edges.
    // Verify the actual notebook pixels, rather than only checking the CSS rule.
    const oldArt = signature.locator("img");
    await oldArt.evaluate(async (element) => {
      element.src =
        "data:image/svg+xml," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="120"><rect width="180" height="120" fill="white"/><rect x="20" y="30" width="140" height="70" fill="black"/><rect x="40" y="45" width="100" height="40" fill="white"/><rect x="70" y="10" width="40" height="8" fill="rgb(230,230,230)"/></svg>',
        );
      await element.decode();
    });
    await oldArt.scrollIntoViewIfNeeded();
    // Chromium can round a clipped edge by a fraction of one pixel after scrolling.
    await expect(oldArt).toBeInViewport({ ratio: 0.99 });
    // Element screenshots use the same scroll-aware clip for both captures.
    // boundingBox is viewport-relative; a page screenshot clip is not.
    const oldVisible = PNG.sync.read(await oldArt.screenshot({ animations: "disabled" }));
    await oldArt.evaluate((element) => {
      element.style.opacity = "0";
    });
    const notebookOnly = PNG.sync.read(await oldArt.screenshot({ animations: "disabled" }));
    await oldArt.evaluate((element) => {
      element.style.opacity = "";
    });
    const sample = (png, x, y) => Array.from(png.data.slice((y * png.width + x) * 4, (y * png.width + x) * 4 + 3));
    // Separate browser composites can differ by a few 8-bit levels at subpixel
    // positions. Opaque white paper differs by dozens of levels on this notebook.
    const pixelTolerance = 4;
    for (const [x, y] of [
      [5, 5],
      [90, 65],
    ]) {
      const visible = sample(oldVisible, x, y),
        paper = sample(notebookOnly, x, y);
      assert.ok(
        visible.every((value, channel) => Math.abs(value - paper[channel]) <= pixelTolerance),
        `Existing saved white fills reveal the notebook unchanged at ${width}x${height} (${x},${y}): ${JSON.stringify({ visible, paper })}`,
      );
    }
    const faintVisible = sample(oldVisible, 90, 14),
      faintPaper = sample(notebookOnly, 90, 14);
    assert.ok(
      faintVisible.every((value, channel) => value <= faintPaper[channel] + pixelTolerance),
      "Old matte edges cannot brighten the notebook",
    );
    await page.screenshot({ path: resolve(output, `signature-white-matte-${width}-${height}.png`) });

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
    let wishPages = 0;
    while (!(await profile.getByText("Shared wish 12", { exact: true }).first().isVisible())) {
      await profile.getByRole("button", { name: "Next Wishes page", exact: true }).click();
      assert(++wishPages < 20);
    }
    assert.ok(
      await reading.evaluate((node) => node.scrollHeight <= node.clientHeight + 1),
      "Wishes use bounded pages instead of scrolling",
    );
    const tabAfter = await tabs.boundingBox();
    assert.equal(tabAfter.y, tabBefore.y, "Sticky notes stay fixed while changing Wish pages");
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
    await expect(profile.getByText(/Agenda destination/)).toBeVisible();
    await tabs.getByRole("button", { name: "Relationships", exact: true }).click();
    await expect(profile.getByText("PRIVATE MARA STANCE", { exact: true })).toBeVisible();
    await expect(profile.getByText("Starting history returned an invalid connection.", { exact: false })).toBeVisible();
    await profile.getByRole("button", { name: "Retry unfinished work", exact: true }).click();
    await expect(profile.getByRole("button", { name: "Retry unfinished work", exact: true })).toHaveCount(0);
    assert.equal(writes.findLast((row) => row.path.endsWith("/background/retry")).body.expectedAttempt, 1);
    await profile.getByText(/^A welcome conversation/).click();
    await expect(profile.locator("blockquote")).toContainText("I enjoyed talking.");
    await expect(profile.getByRole("spinbutton")).toHaveCount(0);
    await page.screenshot({ path: resolve(output, `relationships-${width}-${height}.png`) });
    await tabs.getByRole("button", { name: "Overview", exact: true }).click();
    await page.evaluate((tag) => {
      const game = document.querySelector(tag);
      game.style.height = "calc(100vh - 80px)";
      game.style.marginTop = "80px";
      const control = document.createElement("button");
      control.id = "engine-control";
      control.textContent = "Engine control";
      control.style.cssText = "position:fixed;top:0;left:0;height:60px;z-index:10";
      control.addEventListener("click", () => {
        control.dataset.clicked = "true";
      });
      document.body.append(control);
    }, P);
    await profile.getByText("Message", { exact: true }).click();
    const mail = page.getByRole("dialog", { name: "Mailbox", exact: true });
    const bounds = await page.evaluate((tag) => {
      const game = document.querySelector(tag).getBoundingClientRect();
      const overlay = document.querySelector(".villages-mailbox-overlay").getBoundingClientRect();
      return {
        game: { top: game.top, bottom: game.bottom, left: game.left, right: game.right },
        overlay: { top: overlay.top, bottom: overlay.bottom, left: overlay.left, right: overlay.right },
      };
    }, P);
    assert(
      bounds.overlay.top >= bounds.game.top &&
        bounds.overlay.bottom <= bounds.game.bottom &&
        bounds.overlay.left >= bounds.game.left &&
        bounds.overlay.right <= bounds.game.right,
      "Mailbox stays within the game window",
    );
    const dialogBounds = await mail.evaluate((node) => {
      const dialog = node.getBoundingClientRect();
      const overlay = node.closest(".villages-mailbox-overlay").getBoundingClientRect();
      return {
        top: dialog.top,
        bottom: dialog.bottom,
        overlayTop: overlay.top,
        overlayBottom: overlay.bottom,
        css: {
          height: getComputedStyle(node).height,
          maxHeight: getComputedStyle(node).maxHeight,
          minHeight: getComputedStyle(node).minHeight,
          overlayGrid: getComputedStyle(node.closest(".villages-mailbox-overlay")).gridTemplateRows,
        },
      };
    });
    assert(
      dialogBounds.top >= dialogBounds.overlayTop - 1 && dialogBounds.bottom <= dialogBounds.overlayBottom + 1,
      `Mailbox dialog fits inside its overlay: ${JSON.stringify({ width, height, dialogBounds })}`,
    );
    await page.locator("#engine-control").click();
    await expect(page.locator("#engine-control")).toHaveAttribute("data-clicked", "true");
    await expect(mail.getByLabel("Recipient")).toHaveValue("mara");
    const draft = mail.getByRole("textbox", { name: "Personal message" });
    const exactMessage = "Let's talk later.\n  Exact text";
    await draft.fill(exactMessage);
    await mail.getByRole("button", { name: "Close Mailbox" }).click();
    await expect(profile.getByRole("button", { name: "Message", exact: true })).toBeFocused();
    await profile.getByText("Message", { exact: true }).click();
    await expect(draft).toHaveValue(exactMessage);
    await mail.getByRole("button", { name: "Send letter", exact: true }).click();
    await expect(mail.getByLabel("Personal mail").getByText(exactMessage, { exact: true })).toBeVisible();
    assert.equal(writes.findLast((row) => row.path.endsWith("/mailbox/threads")).body.text, exactMessage);
    assert.equal(
      await mail.evaluate((node) => node.scrollWidth > node.clientWidth + 1),
      false,
      "Mailbox fits desktop and phone",
    );
    if (width <= 704) {
      await expect(mail.getByRole("navigation", { name: "Letters" })).toBeHidden();
      await expect(mail.getByRole("button", { name: "Back to letters" })).toBeVisible();
    }
    await page.screenshot({ path: resolve(output, `mailbox-${width}-${height}.png`) });
    await expect(mail.getByRole("button", { name: /Cancel letter|Retry/ })).toHaveCount(0);
    await expect(mail.getByText("pending", { exact: true })).toHaveCount(0);
    if (width === 390) {
      const outgoing = mailbox.threads[0].messages.findLast((message) => message.fromId === "player");
      outgoing.retryAvailable = true;
      outgoing.error = "Letter processing needs attention.";
      await expect(mail.getByRole("button", { name: "Retry", exact: true })).toBeVisible({ timeout: 10000 });
      await mail.getByRole("button", { name: "Retry", exact: true }).click();
      await expect(mail.getByRole("button", { name: "Retry", exact: true })).toHaveCount(0);
      assert.equal(outgoing.text, exactMessage, "Recovery retains the sent letter");
    }
    const firstMailId = writes.findLast((row) => row.path.endsWith("/mailbox/threads")).body.requestId;
    if (width <= 704) await mail.getByRole("button", { name: "Back to letters" }).click();
    await mail.getByRole("button", { name: "Write a letter", exact: true }).click();
    await mail.getByLabel("Recipient").selectOption("mara");
    await draft.fill(exactMessage);
    const mailWrites = writes.filter((row) => row.path.endsWith("/mailbox/threads")).length;
    await mail.getByRole("button", { name: "Send letter", exact: true }).click();
    await expect.poll(() => writes.filter((row) => row.path.endsWith("/mailbox/threads")).length).toBe(mailWrites + 1);
    assert.notEqual(
      writes.findLast((row) => row.path.endsWith("/mailbox/threads")).body.requestId,
      firstMailId,
      "A distinct acknowledged send can repeat the same words",
    );
    if (width <= 704) await mail.getByRole("button", { name: "Back to letters" }).click();
    await mail.getByRole("button", { name: "Inbox", exact: true }).click();
    const letterRows = mail.getByRole("navigation", { name: "Letters" }).getByRole("button", { name: /Mara/ });
    await expect(letterRows).toHaveCount(2);
    await page.screenshot({ path: resolve(output, `mailbox-inbox-${width}-${height}.png`) });
    if (width === 390) failMailRead = true;
    await letterRows.first().click();
    await expect(mail.getByLabel("Personal mail").getByText("A first letter from Mara.")).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() =>
          Array.from(document.fonts).some(
            (face) => face.family === "village-letter-caveat" && face.status === "loaded",
          ),
        ),
      )
      .toBe(true);
    const readingMode = mail.getByRole("button", { name: "Simple text" });
    const paperView = mail.getByLabel("Personal mail");
    await expect(paperView.locator(".villages-letter-heading")).toHaveCount(0);
    assert(await readingMode.evaluate((node) => !!node.closest("header")), "Reading mode sits beside Mailbox");
    const portrait = paperView.locator(".villages-letter-portrait");
    await expect(portrait).toBeVisible();
    assert(
      await portrait.evaluate((node) => {
        const face = node.getBoundingClientRect();
        const paper = node.closest(".villages-letter-paper").getBoundingClientRect();
        const text = node.closest(".villages-letter-pages").querySelector(".villages-letter-text");
        const range = document.createRange();
        range.selectNodeContents(text);
        const overlaps = Array.from(range.getClientRects()).some(
          (line) =>
            line.width > 1 &&
            line.height > 1 &&
            line.left < face.right - 1 &&
            line.right > face.left + 1 &&
            line.top < face.bottom - 1 &&
            line.bottom > face.top + 1,
        );
        return paper.right - face.right < 45 && !overlaps;
      }),
      "The sender portrait sits at the upper right without covering the letter",
    );
    await expect(readingMode).toHaveAttribute("aria-pressed", "false");
    await readingMode.click();
    await expect(readingMode).toHaveAttribute("aria-pressed", "true");
    assert.equal(await page.evaluate(() => localStorage.getItem("villages-letter-simple")), "true");
    assert.match(
      await mail
        .locator(".villages-letter-text")
        .first()
        .evaluate((node) => getComputedStyle(node).fontFamily),
      /system-ui/,
    );
    const letterSignature = mail.getByRole("img", { name: "Mara's signature" });
    await expect(letterSignature).toBeVisible();
    const placement = await letterSignature.evaluate((node) => {
      const signature = node.getBoundingClientRect();
      const paper = node.closest(".villages-letter-paper").getBoundingClientRect();
      return {
        signatureRight: signature.right,
        paperRight: paper.right,
        signatureTop: signature.top,
        paperTop: paper.top,
      };
    });
    assert(
      placement.paperRight - placement.signatureRight < 45 && placement.signatureTop > placement.paperTop,
      "Signature is aligned to the right of the letter",
    );
    await expect(mail.getByLabel("Personal mail").getByText("A second letter from Mara.")).toHaveCount(0);
    await page.screenshot({ path: resolve(output, `mailbox-letter-${width}-${height}.png`) });
    if (width === 390) {
      await expect(mail.getByRole("button", { name: "Retry reading" })).toBeVisible();
      assert.equal(mailbox.threads[0].messages.find((message) => message.id === "first-letter").read, false);
      await mail.getByRole("button", { name: "Retry reading" }).click();
      await expect
        .poll(() => mailbox.threads[0].messages.find((message) => message.id === "first-letter").read)
        .toBe(true);
    }
    await expect.poll(() => writes.findLast((row) => row.path.endsWith("/read"))?.body.messageId).toBe("first-letter");
    assert.equal(mailbox.threads[0].messages.find((message) => message.id === "second-letter").read, false);
    if ([1366, 977, 390, 320].includes(width)) {
      const paper = mail.locator(".villages-letter-paper");
      const pageBody = mail.locator(".villages-letter-pages");
      const pageCounter = mail.getByLabel("Letter pages");
      const pageCount = () =>
        pageCounter
          .locator("span")
          .textContent()
          .then((text) => Number(text.split("/")[1]));
      const lastCharacterVisible = () =>
        pageBody.evaluate((node) => {
          const textNode = Array.from(node.querySelectorAll(".villages-letter-text")).at(-1).firstChild;
          const end = textNode.textContent.trimEnd().length;
          const range = document.createRange();
          range.setStart(textNode, end - 1);
          range.setEnd(textNode, end);
          const character = range.getBoundingClientRect();
          const viewport = node.getBoundingClientRect();
          return (
            character.left >= viewport.left - 1 &&
            character.right <= viewport.right + 1 &&
            character.top >= viewport.top - 1 &&
            character.bottom <= viewport.bottom + 1
          );
        });
      const shortLetter =
        "Dear friend,\n\nThe rain finally stopped this morning, so I took the long path past the mill. The garden is coming back to life, one little green shoot at a time.\n\nWould you like to walk there with me tomorrow? I will bring the tea.\n\nUntil then,\nMara";
      mailbox.threads[0].messages.find((message) => message.id === "first-letter").text = shortLetter;
      await expect
        .poll(
          () =>
            mail
              .locator(".villages-letter-text")
              .allTextContents()
              .then((parts) => parts.join("")),
          { timeout: 10000 },
        )
        .toBe(shortLetter);
      await readingMode.click();
      if (width === 977) assert.equal(await pageCount(), 1, "A letter that fits uses one sheet");
      const nextPage = mail.locator('button[aria-label="Next page"]');
      const previousPage = mail.locator('button[aria-label="Previous page"]');
      while (await nextPage.isEnabled()) await nextPage.click();
      assert(await lastCharacterVisible(), "The final paper includes the end of the letter with the signature");
      assert(
        await letterSignature.evaluate((node) => {
          const signature = node.getBoundingClientRect();
          const viewport = node.closest(".villages-letter-pages").getBoundingClientRect();
          return (
            signature.right > viewport.left &&
            signature.left < viewport.right &&
            signature.bottom > viewport.top &&
            signature.top < viewport.bottom
          );
        }),
        "The signature is visible on that same paper",
      );
      if (width === 977) {
        for (const { size, singlePage } of [
          { size: { width: 720, height: 600 }, singlePage: false },
          { size: { width: 1200, height: 900 }, singlePage: null },
          { size: { width, height }, singlePage: true },
        ]) {
          await page.setViewportSize(size);
          await page.evaluate(
            () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
          );
          if (singlePage !== null)
            await expect
              .poll(async () => (await pageCount()) === 1, {
                message: `Page count after resizing to ${size.width}×${size.height}`,
              })
              .toBe(singlePage);
          while (await nextPage.isEnabled()) await nextPage.click();
          assert(await lastCharacterVisible(), "Resizing retains text on the signature's page");
        }
      }
      while (await previousPage.isEnabled()) await previousPage.click();
      await readingMode.click();

      const longLetter = "A page of words from Mara, written carefully for a friend. ".repeat(45) + "The final word.";
      mailbox.threads[0].messages.find((message) => message.id === "first-letter").text = longLetter;
      await expect
        .poll(
          () =>
            mail
              .locator(".villages-letter-text")
              .allTextContents()
              .then((parts) => parts.join("")),
          { timeout: 10000 },
        )
        .toBe(longLetter);
      for (const simple of [true, false]) {
        if (!simple) await readingMode.click();
        await expect.poll(pageCount).toBeGreaterThan(1);
        await expect(readingMode).toHaveAttribute("aria-pressed", String(simple));
        assert.equal(
          await mail
            .locator(".villages-letter-text")
            .first()
            .evaluate((node) => node.style.fontStyle),
          simple ? "" : "oblique 3deg",
          "Personality-inspired styling is only applied in expressive mode",
        );
        assert.equal(
          await paper.evaluate((node) => node.scrollHeight > node.clientHeight + 1),
          false,
          "Letter paper does not scroll",
        );
        assert.equal(await paper.evaluate((node) => getComputedStyle(node).overflow), "hidden");
        const count = await pageCount();
        for (let index = 0; index < count; index++) {
          await expect(pageCounter).toContainText(`${index + 1} / ${count}`);
          if (!simple && (index === 0 || index === count - 1))
            await page.screenshot({
              path: resolve(output, `mailbox-pages-${width}-${height}-${index === 0 ? "first" : "last"}.png`),
            });
          const signaturePosition = await letterSignature.evaluate((node) => {
            const signature = node.getBoundingClientRect();
            const viewport = node.closest(".villages-letter-pages").getBoundingClientRect();
            return {
              left: signature.left - viewport.left,
              right: signature.right - viewport.left,
              width: viewport.width,
              scrollWidth: node.closest(".villages-letter-pages").scrollWidth,
              visible:
                signature.right > viewport.left + 1 &&
                signature.left < viewport.right - 1 &&
                signature.bottom > viewport.top + 1 &&
                signature.top < viewport.bottom - 1,
            };
          });
          assert.equal(
            signaturePosition.visible,
            index === count - 1,
            `Signature appears only on the final paper: ${JSON.stringify({ index, count, simple, signaturePosition })}`,
          );
          if (index === count - 1)
            assert(await lastCharacterVisible(), "The final paper includes the end of the letter with the signature");
          if (index < count - 1) await mail.getByRole("button", { name: "Next page" }).click();
        }
        if (simple) {
          while (await mail.getByRole("button", { name: "Previous page" }).isEnabled())
            await mail.getByRole("button", { name: "Previous page" }).click();
        }
      }
    }
    if (width === 390) {
      await mail.getByRole("button", { name: "Back to letters" }).click();
      await mail.getByRole("button", { name: "Write a letter", exact: true }).click();
      await mail.getByLabel("Recipient").selectOption("mara");
      await draft.fill("A letter with a lost response.");
      failMailResponse = true;
      await mail.getByRole("button", { name: "Send letter" }).click();
      await expect(mail.getByRole("alert")).toBeVisible();
      const firstAttempt = writes.findLast((row) => row.path.endsWith("/mailbox/threads")).body.requestId;
      await mail.getByLabel("Recipient").selectOption("eli");
      await draft.fill("A note for Eli.");
      await mail.getByRole("button", { name: "Send letter" }).click();
      await expect(mail.getByLabel("Personal mail").getByText("A note for Eli.")).toBeVisible();
      await mail.getByRole("button", { name: "Back to letters" }).click();
      await mail.getByRole("button", { name: "Write a letter", exact: true }).click();
      await mail.getByLabel("Recipient").selectOption("mara");
      await expect(draft).toHaveValue("A letter with a lost response.");
      await mail.getByRole("button", { name: "Send letter" }).click();
      await expect
        .poll(() => writes.filter((row) => row.path.endsWith("/mailbox/threads")).at(-1).body.requestId)
        .toBe(firstAttempt);
      assert.equal(mailbox.threads[0].messages.filter((message) => message.id === firstAttempt).length, 1);
    }
    await mail.getByRole("button", { name: "Close Mailbox" }).click();
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
    await profile.getByRole("button", { name: "Inspect", exact: true }).last().click();
    await expect(profile.getByText("SOURCE EVIDENCE", { exact: false })).toBeVisible();
    await settleTurn();
    await page.screenshot({ path: resolve(output, `inspect-${width}-${height}.png`) });
    await profile.getByRole("button", { name: "Correct", exact: true }).click();
    const correction = profile.getByRole("form", { name: "Correct memory" });
    await expect(correction.getByRole("textbox", { name: "Corrected memory" })).toHaveValue("PRIVATE MARA MEMORY");
    await expect(correction.getByRole("checkbox", { name: "Mara", exact: true })).toBeChecked();
    await expect(correction.getByRole("checkbox", { name: "Eli", exact: true })).toHaveCount(0);
    await correction.getByRole("checkbox", { name: "Mara", exact: true }).uncheck();
    await expect(correction.getByRole("button", { name: "Save correction" })).toBeDisabled();
    await correction.getByRole("checkbox", { name: "Mara", exact: true }).check();
    await correction.getByRole("textbox").fill("é".repeat(301));
    await expect(correction.getByRole("alert")).toContainText("too long");
    await expect(correction.getByRole("button", { name: "Save correction" })).toBeDisabled();
    await correction.getByRole("textbox").fill("PRIVATE corrected wording");
    await correction.getByRole("button", { name: "Cancel", exact: true }).click();
    assert.equal(corrections.length, 0, "Cancel makes no write.");
    await profile.getByRole("button", { name: "Correct", exact: true }).click();
    await correction.getByRole("textbox").fill("PRIVATE corrected wording");
    await settleTurn();
    await page.screenshot({ path: resolve(output, `correct-${width}-${height}.png`) });
    await correction.getByRole("button", { name: "Save correction" }).click();
    await expect(correction.getByRole("alert")).toContainText("Saved response unavailable");
    await expect(correction.getByRole("textbox")).toHaveValue("PRIVATE corrected wording");
    await correction.getByRole("button", { name: "Save correction" }).click();
    await expect(correction).toHaveCount(0);
    await expect(profile.getByText("Player correction", { exact: true })).toBeVisible();
    await profile.getByRole("button", { name: "Inspect", exact: true }).last().click();
    await expect(profile.getByText("SOURCE EVIDENCE", { exact: false })).toBeVisible();
    staleCorrection = true;
    await profile.getByRole("button", { name: "Correct", exact: true }).click();
    await correction.getByRole("textbox").fill("Uncommitted correction");
    await correction.getByRole("button", { name: "Save correction" }).click();
    await expect(correction.getByRole("alert")).toContainText("Memories changed");
    await expect(correction.getByRole("textbox")).toHaveValue("Uncommitted correction");
    await correction.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(profile.getByText("PRIVATE corrected wording", { exact: true })).toBeVisible();
    staleCorrection = false;
    holdCorrection = true;
    await profile.getByRole("button", { name: "Correct", exact: true }).click();
    await correction.getByRole("textbox").fill("Deferred correction");
    await correction.getByRole("button", { name: "Save correction" }).click();
    await expect.poll(() => !!releaseCorrection).toBe(true);
    await expect(correction.getByRole("textbox")).toBeDisabled();
    await tabs.getByRole("button", { name: "Overview", exact: true }).click();
    await tabs.getByRole("button", { name: "Memories", exact: true }).click();
    await expect(profile.getByText("PRIVATE corrected wording", { exact: true })).toBeVisible();
    await profile.getByRole("combobox", { name: "Memory knower" }).selectOption("eli");
    await expect(profile.getByText("PRIVATE ELI MEMORY", { exact: true })).toBeVisible();
    const readsBeforeRelease = reads.filter((path) => path.endsWith("/memories/inspect")).length;
    const finishedCorrection = page.waitForResponse((response) => response.url().endsWith("/memories/m1/correct"));
    releaseCorrection();
    await (await finishedCorrection).finished();
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(
      reads.filter((path) => path.endsWith("/memories/inspect")).length,
      readsBeforeRelease,
      "An unmounted editor cannot refresh or abort the new view.",
    );
    await expect(profile.getByText("PRIVATE ELI MEMORY", { exact: true })).toBeVisible();
    await profile.getByRole("combobox", { name: "Memory knower" }).selectOption("mara");
    await expect(profile.getByText("PRIVATE corrected wording", { exact: true })).toBeVisible();
    await profile.getByRole("button", { name: "Forget", exact: true }).click();
    await expect(profile.getByRole("button", { name: "Forget", exact: true })).toBeDisabled();
    await expect(profile.getByText("Forgotten", { exact: true }).first()).toBeVisible();
    await tabs.getByRole("button", { name: "Overview", exact: true }).click();
    await expect(profile.getByText("Home · The Mill", { exact: true })).toBeVisible();
    await tabs.getByRole("button", { name: "Memories", exact: true }).click();
    failMemories = true;
    await profile.getByRole("button", { name: "Refresh", exact: true }).click();
    await expect(profile.getByRole("alert")).toContainText("Memory service unavailable");
    failMemories = false;
    await profile.getByRole("button", { name: "Refresh", exact: true }).click();
    await expect(profile.getByRole("alert")).toHaveCount(0);
    await profile.getByRole("button", { name: "← Back to Villagers", exact: true }).click();
    await expect(directory.getByRole("searchbox", { name: "Search villagers" })).toHaveCount(0);
    await expect(directory.getByRole("button", { name: "Open Mara profile" })).toBeFocused();
    await expect(page.locator(`.${P}-notebook-session`)).toHaveAttribute("data-phase", "open");
    await directory.getByRole("button", { name: `Open ${secondName} profile` }).click();
    await expect(page.getByText("No home or workplace assigned.", { exact: true })).toBeVisible();
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
    await profile.getByText("Character tools", { exact: true }).click();

    await profile.getByRole("button", { name: "Edit description", exact: true }).click();
    const description = profile.getByRole("textbox", { name: "Description", exact: true });
    const initialDescription = village.villagers[0].summary;
    await description.fill("A reserved explorer with an interest in old machinery.");
    await profile.getByText("Character tools", { exact: true }).click();
    await tabs.getByRole("button", { name: "Agenda", exact: true }).click();
    await profile.getByText("Character tools", { exact: true }).click();
    await expect(description).toHaveValue("A reserved explorer with an interest in old machinery.");
    await profile.getByText("Character tools", { exact: true }).click();
    await tabs.getByRole("button", { name: "Overview", exact: true }).click();
    await profile.getByText("Character tools", { exact: true }).click();
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
    await expect(profile.getByRole("button", { name: "Move out", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "← Back to Villagers", exact: true }).click();
    await expect(directory.getByRole("button", { name: "Open Mara profile" })).toBeVisible();
    await page.getByRole("button", { name: "Close ×", exact: true }).click();
    await page.getByRole("navigation", { name: "Village navigation" }).getByRole("button", { name: "People" }).click();
    await expect(page.locator(`.${P}-notebook-session`)).toHaveAttribute("data-phase", "open");
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await page.locator(`.${P}-notebook-motion`).evaluate((node) => getComputedStyle(node).animationName),
      "none",
      "Reduced motion disables the notebook transition",
    );
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
