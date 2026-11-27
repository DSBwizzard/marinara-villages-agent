import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { foundingFixture } from "./fixtures/founding-browser.fixture.mjs";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { runCase, wantsCase } from "../scripts/test-cases.mjs";
// Test cases: founding/sprites/desktop, founding/sprites/phone

const bundle = await foundingFixture();
const image =
  "data:image/svg+xml;base64," +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="192"><circle cx="64" cy="40" r="25" fill="#61b6d7"/><path d="M40 65h48l18 95H22z" fill="#c57e45"/><path d="M38 160h18v24H32zm34 0h18l6 24H72z" fill="#61b6d7"/></svg>',
  ).toString("base64");
const people = [
  { id: "aqua", name: "Aqua", summary: "A coastal resident" },
  { id: "rosa", name: "Rosa", summary: "A patient resident" },
];
const catalog = [
  ...people,
  { id: "__professor_mari__", name: "Professor Mari", summary: "Your guide" },
  ...Array.from({ length: 24 }, (_, index) => ({
    id: "card-" + index,
    name: "Card " + (index + 1),
    summary: "Another coastal resident",
  })),
];
const snapshot = {
  status: "ready",
  isFounded: false,
  village: { name: "", setting: "" },
  villagers: [],
  projects: [],
  residences: [],
  venueRequests: [],
  settings: {
    venues: [],
    worldRules: "",
    circumstances: [],
    openingVenueId: "",
    selectedLorebookIds: [],
    loreTokenBudget: 1600,
    maps: [],
    townMapExpectedWidth: 1536,
    townMapExpectedHeight: 1024,
    townMapGenerationWidth: 1536,
    townMapGenerationHeight: 1024,
    townMapView: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
    villageNameMaxLength: 80,
    settingMaxLength: 4096,
  },
};
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  await mkdir(".build-tmp/founding-sprites", { recursive: true });
  for (const viewport of [
    { width: 1366, height: 850 },
    { width: 390, height: 620 },
  ]) {
    const phone = viewport.width <= 727;
    const name = phone ? "founding/sprites/phone" : "founding/sprites/desktop";
    if (!wantsCase(name)) continue;
    await runCase(name, async () => {
      snapshot.village.timeZone = "UTC";
      snapshot.village.instant = phone ? "2026-11-20T00:00:00.000Z" : "2026-11-20T12:00:00.000Z";
      const page = await browser.newPage({ viewport, hasTouch: phone, isMobile: phone });
      await mockEngineLookups(page);
      const writes = [],
        portraitLoads = [],
        opened = new Set();
      let spriteLoads = 0;
      await page.route("**/api/avatars/file/aqua.png?*", (route) => {
        portraitLoads.push(new URL(route.request().url()));
        return fulfill(route, {
          contentType: phone ? "image/png" : "image/svg+xml",
          body: phone ? "unreadable image" : Buffer.from(image.split(",")[1], "base64"),
        });
      });
      await page.route("**/api/sprites/**", (route) => {
        spriteLoads++;
        return fulfill(route, { contentType: "image/svg+xml", body: Buffer.from(image.split(",")[1], "base64") });
      });
      await page.route("**/api/characters/summaries", (route) =>
        fulfill(route, {
          contentType: "application/json",
          body: JSON.stringify([{ id: "aqua", avatarUrl: "/api/avatars/file/aqua.png?v=7" }]),
        }),
      );
      await page.route("**/api/villages**", (route) => {
        const url = new URL(route.request().url()),
          path = url.pathname;
        const send = (value) => fulfill(route, { contentType: "application/json", body: JSON.stringify(value) });
        if (path.endsWith("/connections") && route.request().method() === "PUT") {
          assert.deepEqual(route.request().postDataJSON(), { embedding: "off" });
          return send({
            systemConnectionId: "talk",
            narrationConnectionId: "talk",
            imageConnectionId: "image",
            embedding: "off",
          });
        }
        if (route.request().method() !== "GET") {
          writes.push(path);
          assert.fail("Unexpected mutation: " + path);
        }
        if (path.endsWith("/sprites/setup/settled")) {
          assert.equal(url.searchParams.get("automatic"), "true");
          const id = path.split("/").at(-4);
          opened.add(id);
          const assigned =
            id === "aqua"
              ? Array.from({ length: 6 }, (_, i) => ({
                  expressionId: "sprite-" + i,
                  view: "front",
                  engineFilename: "sprite-" + i + ".png",
                }))
              : [];
          return send({
            revision: 5,
            token: "card-sprites",
            automatic: true,
            manager: {
              version: 1,
              artwork: [],
              expressions: assigned.map((row) => ({ id: row.expressionId, name: row.expressionId })),
              assignments: assigned,
              framing: { mode: "full" },
            },
            files: [],
            folders: [],
          });
        }
        if (path.endsWith("/personas")) return send({ personas: [{ id: "driver", name: "You", isActive: true }] });
        if (path.endsWith("/personas/driver"))
          return send({ persona: { id: "driver", name: "You", description: "A visitor", identity: "A visitor" } });
        if (path.endsWith("/connections"))
          return send({ systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" });
        if (path.endsWith("/catalog")) return send({ characters: catalog });
        if (path.endsWith("/lorebooks")) return send({ books: [] });
        if (path.endsWith("/image-style-profiles")) return send({ defaultProfileId: "", profiles: [] });
        return send(snapshot);
      });
      await page.route("**/api/connections", (route) =>
        fulfill(route, {
          contentType: "application/json",
          body: JSON.stringify([
            { id: "talk", name: "Language model", provider: "language", defaultForAgents: true },
            { id: "image", name: "Image model", provider: "image_generation", defaultForAgents: true },
          ]),
        }),
      );
      await page.route("http://founding-sprites.test/", (route) =>
        fulfill(route, {
          contentType: "text/html",
          body: '<meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;width:100%;height:100%;font:16px Arial}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>',
        }),
      );
      await page.goto("http://founding-sprites.test/");
      await page.addScriptTag({ content: bundle });
      const root = page.locator(".villages-forging-v2"),
        next = root.getByRole("button", { name: "Next", exact: true });
      const advance = async () => {
        for (let attempt = 0; attempt < 30; attempt++) {
          const reader = root.locator(".villages-setting-dialogue:visible").first();
          if (!(await reader.count()) || (await reader.evaluate((node) => !!node.closest("[inert]")))) break;
          if ((await reader.getAttribute("data-reader-next-page")) === null) break;
          await next.click();
        }
        await next.click();
        const recommendation = root.getByRole("dialog", { name: "Image connection", exact: true });
        if (await recommendation.isVisible())
          await recommendation.getByRole("button", { name: "Continue without images", exact: true }).click();
        const embedding = root.getByRole("dialog", { name: "Embedding model", exact: true });
        if (await embedding.isVisible()) {
          await embedding.getByRole("button", { name: "Continue without embeddings", exact: true }).click();
        }
      };
      for (const reply of ["START", "Next", "Next", "Next", "Next", "Next", "Next", "Next"])
        if (reply === "Next") await advance();
        else await root.getByRole("button", { name: reply, exact: true }).click();
      if (phone)
        await root
          .getByRole("dialog", { name: "The wider world", exact: true })
          .getByRole("button", { name: "Next", exact: true })
          .click();
      else await advance();
      await advance();
      const lore = root.getByRole(phone ? "dialog" : "region", {
        name: phone ? "Choose Lorebooks" : "Village Lorebooks",
        exact: true,
      });
      await lore.getByRole("button", { name: "Next", exact: true }).click();
      await advance();
      if (phone) {
        await expect(root.getByRole("dialog", { name: "Your Village", exact: true })).toHaveCount(0);
        await advance();
      }
      await root.getByLabel("Village Name", { exact: true }).fill("Tidebreak");
      await root.getByLabel("What is the village like?", { exact: true }).fill("A village beside the sea.");
      if (phone)
        await root
          .getByRole("dialog", { name: "Your Village", exact: true })
          .getByRole("button", { name: "Next", exact: true })
          .click();
      else await advance();
      await advance();
      await advance();
      if (phone) await advance();
      await root.getByLabel("First map name", { exact: true }).fill("Harbour");
      await root.getByLabel("Location description", { exact: true }).fill("A village beside the sea.");
      await advance();
      const phase = root.getByRole("list", { name: "Founding phases" }).locator('[aria-current="step"]');
      await expect(phase).toHaveAttribute("aria-label", "People");
      if (phone) await advance();
      for (const person of people) {
        await root.getByRole("button", { name: "+ Add villager", exact: true }).click();
        const picker = page.getByRole("dialog", { name: "Choose founding villagers", exact: true });
        const add = picker.getByRole("button", { name: person.name + " · Add", exact: true });
        await expect(picker.getByRole("button", { name: "Professor Mari · Add", exact: true })).toHaveCount(0);
        if (person.id === "rosa") {
          const results = picker.getByRole("group", { name: "Choose founding villagers", exact: true });
          await results.hover();
          await page.mouse.wheel(0, 4000);
          await expect(add).toBeInViewport();
          await page.evaluate(() => window.visualViewport.dispatchEvent(new Event("scroll")));
          await expect(picker.getByRole("searchbox")).toBeInViewport();
          await expect(picker.getByRole("button", { name: "Confirm", exact: true })).toBeInViewport();
          await expect(add).toBeInViewport();
        }
        await add.click();
        await expect(picker.locator("footer").getByRole("button")).toHaveCount(1);
        await picker.getByRole("button", { name: "Confirm", exact: true }).click();
        await expect(picker).toHaveCount(0);
      }
      const row = (name) =>
        root.locator(".villages-selected-villager").filter({ has: page.getByText(name, { exact: true }) });
      await expect(row("Aqua").getByRole("status")).toHaveText("6 sprites");
      const missing = row("Rosa").getByRole("status");
      await expect(missing).toContainText("No Sprites Assigned!");
      await expect(missing).toHaveCSS("color", phone ? "rgb(243, 182, 183)" : "rgb(134, 47, 55)");
      for (const label of ["Portrait", "Sprites", "Assign Side"])
        await expect(root.getByRole("button", { name: label, exact: true })).toHaveCount(0);
      await expect(next).toBeEnabled();
      await expect(next).toBeInViewport();
      assert.ok((await row("Aqua").boundingBox()).height < 100, "People stays compact");
      assert.ok(
        (await row("Rosa").boundingBox()).height < 100,
        "Missing-sprite status does not squeeze the name into a column",
      );
      const avatar = row("Aqua").locator(".marinara-capability-villages-identity-card-face");
      await expect.poll(() => portraitLoads.length).toBeGreaterThan(0);
      assert.ok(portraitLoads.every((url) => url.searchParams.get("w") === "320"));
      if (phone) {
        await expect(avatar.locator("img")).toHaveCount(0);
        await expect(avatar.locator("svg")).toBeVisible();
      } else await expect(avatar.locator("img")).toHaveAttribute("loading", "lazy");
      assert.equal(spriteLoads, 0, "Counting sprites does not download full artwork");
      await page.screenshot({ path: ".build-tmp/founding-sprites/compact-" + viewport.width + ".png" });
      await advance();
      await expect(phase).toHaveAttribute("aria-label", "Maps");
      await expect(root.getByText(/^A new Village starts/)).toHaveCount(0);
      if (!phone) await expect(root.getByRole("region", { name: "Map artwork", exact: true })).toBeVisible();
      assert.deepEqual([...opened].sort(), ["aqua", "rosa"]);
      assert.equal(writes.length, 0, "Counts never save or require an appearance editor");
      await root.getByRole("button", { name: "Back", exact: true }).click();
      await expect(row("Aqua").getByRole("status")).toHaveText("6 sprites");
      await page.close();
    });
  }
});
