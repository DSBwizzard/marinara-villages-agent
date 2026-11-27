// Test cases: place-repair/desktop, place-repair/phone, place-repair/chooser
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { repairBrowserFixture, expect, noRepairScroll } from "./fixtures/repair-browser.fixture.mjs";
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["phone", 390, 844],
  ])
    await runCase("place-repair/" + name, async () => {
      const f = await repairBrowserFixture(browser, width, height),
        { page } = f;
      await f.area("places");
      await expect(page.getByRole("searchbox", { name: "Find a location", exact: true })).toBeVisible();
      await expect(page.getByRole("combobox", { name: "Filter by map", exact: true })).toHaveCount(0);
      await expect(page.getByRole("combobox", { name: "Filter by location type", exact: true })).toHaveCount(0);
      await expect(page.getByRole("navigation", { name: "Pages", exact: true })).toHaveCount(0);
      await page.getByRole("button", { name: "Hearth Alms Rooms, Venue", exact: true }).click();
      await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue("Hearth Alms Rooms");
      if (width < 700)
        await page.getByRole("combobox", { name: "Location repairs", exact: true }).selectOption("people");
      else {
        const nav = page.getByRole("navigation", { name: "Location repairs", exact: true });
        const bounds = await nav
          .getByRole("button")
          .evaluateAll((nodes) =>
            nodes.map((el) => ({ x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y })),
          );
        assert(
          bounds.every((box, index) => box.x === bounds[0].x && (!index || box.y > bounds[index - 1].y)),
          "Venue repairs form a vertical notebook",
        );
        await nav.getByRole("button", { name: "People & roles", exact: true }).click();
      }
      await page.getByRole("button", { name: "Runs this Venue", exact: true }).click();
      await expect(page.getByRole("checkbox", { name: "Nora", exact: true })).toBeChecked();
      await noRepairScroll(page);
      if (width < 700)
        await page.getByRole("combobox", { name: "Location repairs", exact: true }).selectOption("zones");
      else
        await page
          .getByRole("navigation", { name: "Location repairs", exact: true })
          .getByRole("button", { name: "Zones", exact: true })
          .click();
      assert.equal(
        await page.locator('[class$="-venue-zones"]').evaluate((el) => getComputedStyle(el).backgroundImage),
        "none",
      );
      await page.getByRole("button", { name: "Dining room", exact: true }).click();
      await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue("Dining room");
      await expect(page.getByRole("heading", { name: "Dining room", exact: true })).toBeVisible();
      await page.getByRole("textbox", { name: "Name", exact: true }).fill("Dining room and library");
      await page.getByRole("button", { name: "Review changes", exact: true }).click();
      assert.equal(
        f.calls.findLast((call) => call.path.endsWith("/review")).body.values.name,
        "Dining room and library",
      );
      await noRepairScroll(page);
      assert(!f.calls.some((call) => /explore|\/visit|\/generate/.test(call.path)));
      await page.close();
    });
  await runCase("place-repair/chooser", async () => {
    const places = [
      ...Array.from({ length: 19 }, (_, i) => ({
        name: `Workshop ${String(i + 1).padStart(2, "0")}`,
        map: "village",
        venue: true,
      })),
      { name: "Workshop across the river", map: "riverside", venue: true },
      { name: "Workshop ruins", map: "village", venue: false },
    ].map(({ name, map, venue }, i) => {
      const record = {
        id: JSON.stringify([venue ? "venue" : "place", String(i)]),
        topic: "places",
        title: name,
        fields: [{ key: "name", label: "Name", type: "text", multiline: false, value: name }],
        source: [],
        related: [],
        actions: [{ id: "correct", label: "Modify" }],
        token: String(i),
      };
      const node = {
        id: JSON.stringify(["location", venue ? "venue" : "place", String(i)]),
        title: name,
        mapId: map,
        mapName: map === "village" ? "Village" : "Riverside",
        icon: venue ? "venue" : "places",
        children: [{ id: record.id, title: "Details", icon: "details" }],
      };
      return { record, node };
    });
    for (const [width, height] of [
      [1440, 900],
      [320, 568],
    ]) {
      const f = await repairBrowserFixture(browser, width, height, {
        records: places.map(({ record }) => record),
        directory: [
          { id: "venues", children: places.filter(({ node }) => node.icon === "venue").map(({ node }) => node) },
          { id: "places", children: places.filter(({ node }) => node.icon !== "venue").map(({ node }) => node) },
        ],
      });
      const { page } = f;
      await f.area("places");
      const chooser = page.getByRole("region", { name: "Known locations" });
      const search = chooser.getByRole("searchbox", { name: "Find a location" });
      const map = chooser.getByRole("combobox", { name: "Filter by map" });
      const type = chooser.getByRole("combobox", { name: "Filter by location type" });
      await search.fill("workshop");
      await map.selectOption({ label: "Village" });
      await type.selectOption("venues");
      await expect(chooser.getByRole("heading", { name: "Village", exact: true })).toHaveCount(1);
      await expect(chooser.getByRole("button", { name: /Workshop ruins|across the river/ })).toHaveCount(0);
      const entries = chooser.getByRole("button", { name: /Workshop \d+, Venue/ });
      const first = await entries.first().boundingBox();
      const second = await entries.nth(1).boundingBox();
      if (width > 700) {
        assert.equal(first.y, second.y);
        assert(second.x > first.x);
      } else {
        assert.equal(first.x, second.x);
        assert(second.y > first.y);
      }
      const pages = chooser.getByRole("navigation", { name: "Pages" });
      await pages.getByRole("button", { name: "Next →", exact: true }).click();
      const count = await pages.getByRole("status").textContent();
      const before = await entries.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("aria-label")));
      await noRepairScroll(page);
      await entries.first().click();
      await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue(
        before[0].replace(", Venue", ""),
      );
      await page.getByRole("button", { name: "← Locations", exact: true }).click();
      await expect(search).toHaveValue("workshop");
      await expect(map).toHaveValue("map:village");
      await expect(type).toHaveValue("venues");
      await expect(pages.getByRole("status")).toHaveText(count);
      await expect
        .poll(() => entries.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("aria-label"))))
        .toEqual(before);
      await noRepairScroll(page);
      await page.close();
    }
  });
});
