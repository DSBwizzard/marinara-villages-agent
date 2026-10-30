import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { openProjectPage, projectSnapshot } from "./fixtures/villages-project-browser.fixture.mjs";
import { mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({ headless: true });
try {
  for (const [width, height] of [
    [1280, 900],
    [390, 740],
    [390, 568],
    [320, 568],
  ]) {
    const snapshot = projectSnapshot();
    snapshot.projects[0].plan.form = "A sheltered pavilion with room for music and gatherings. ".repeat(24);
    snapshot.projects[0].plan.exteriorImage = { ref: "pavilion", id: "pavilion", url: mapImage };
    snapshot.projects[0].plan.spaces[0].image = { ref: "art", id: "art", url: mapImage };
    const { page, calls } = await openProjectPage(browser, width, snapshot);
    await page.setViewportSize({ width, height });
    const fits = async (label) => {
      const size = await page.evaluate(() => {
        const root = document.querySelector(".marinara-capability-villages-project-root");
        const controls = [...root.querySelectorAll("button, input, textarea, select")]
          .filter((node) => {
            const r = node.getBoundingClientRect();
            return r.width && r.height && getComputedStyle(node).visibility !== "hidden";
          })
          .map((node) => {
            const r = node.getBoundingClientRect();
            return [node.getAttribute("aria-label") || node.textContent.trim(), r.top, r.bottom];
          });
        return { height: root.clientHeight, scrollHeight: root.scrollHeight, controls };
      });
      assert(
        size.scrollHeight <= size.height + 1,
        `${label} ${width}x${height}: page needs vertical scrolling (${size.scrollHeight}/${size.height})`,
      );
      for (const [name, top, bottom] of size.controls)
        assert(top >= -1 && bottom <= height + 1, `${label}: ${name} is outside the viewport`);
    };
    await fits("workspace");
    await page
      .getByRole("navigation", { name: "Projects", exact: true })
      .getByRole("button", { name: /Canvas Tent/ })
      .click();
    await fits("overview with long design");
    if (width < 700) {
      await page.getByRole("button", { name: "Artwork", exact: true }).click();
      await expect(page.getByRole("img", { name: "Canvas Tent" })).toBeVisible();
      await fits("artwork");
      await page.getByRole("button", { name: "Overview", exact: true }).click();
    }
    await page.getByRole("button", { name: "Full design" }).click();
    await expect(page.getByLabel("Physical design", { exact: true })).toHaveValue(snapshot.projects[0].plan.form);
    await fits("design");
    await page.getByRole("button", { name: "Zones", exact: true }).click();
    await fits("zone list");
    if (width < 700) {
      if (
        !(await page
          .getByRole("navigation", { name: "Project Zones" })
          .getByRole("button", { name: /Art room/ })
          .count())
      )
        await page.getByRole("button", { name: "Next", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Project Zones" })
        .getByRole("button", { name: /Art room/ })
        .click();
    }
    await fits("zone details");
    if (width < 700) {
      await page.getByRole("button", { name: "Long-term details", exact: true }).click();
      await fits("zone appearance");
      await page.getByRole("button", { name: "Options", exact: true }).click();
      await fits("zone options");
      await page
        .getByRole("group", { name: "Zone options" })
        .getByRole("button", { name: "Artwork", exact: true })
        .click();
      await fits("zone artwork");
    }
    await page.getByRole("button", { name: "Connections", exact: true }).click();
    await fits("connections");
    if (width < 700) {
      await page
        .getByRole("group", { name: "Connection pages" })
        .getByRole("button", { name: "Add", exact: true })
        .click();
      await fits("add connection");
    }
    for (const name of ["People", "Location"]) {
      await page.getByRole("tab", { name, exact: true }).click();
      await fits(name);
    }
    await page.getByRole("button", { name: "‹ All Projects" }).click();
    await page.getByRole("button", { name: "New Venue", exact: true }).first().click();
    await fits("new draft");
    await page.getByRole("button", { name: "‹ All Projects" }).click();
    await page.getByRole("button", { name: "Renovation", exact: true }).first().click();
    await fits("renovation draft");
    if (width < 700) {
      await page.getByRole("button", { name: "‹ All Projects" }).click();
      await page
        .getByRole("navigation", { name: "Projects", exact: true })
        .getByRole("button", { name: /Workshop/ })
        .click();
      await page.getByRole("tab", { name: "Design & Spaces", exact: true }).click();
      await page.getByRole("button", { name: "Zones", exact: true }).click();
      await page.getByRole("button", { name: "Add private Zone", exact: true }).click();
      await page.getByRole("button", { name: "Options", exact: true }).click();
      await page.getByRole("button", { name: "Controllers", exact: true }).click();
      await fits("private zone controllers");
      const controllers = page.getByRole("group", { name: "Zone controllers" });
      await controllers.getByRole("button", { name: "You", exact: true }).click();
      await page.getByRole("button", { name: "Next", exact: true }).click();
      await fits("next controller page");
      const secondName = (await controllers.getByRole("button").first().textContent()).trim();
      const secondId = snapshot.villagers.find((person) => person.name === secondName).characterId;
      await controllers.getByRole("button").first().click();
      await page.getByRole("button", { name: "Previous", exact: true }).click();
      await expect(controllers.getByRole("button", { name: "You", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await page.getByRole("button", { name: "Save design", exact: true }).click();
      await expect.poll(() => calls.length).toBeGreaterThan(0);
      assert.deepEqual(calls.at(-1).body.zones.at(-1).controllerIds, ["player", secondId]);
    }
    await page.close();
    const working = projectSnapshot();
    working.village.timeZone = "America/Los_Angeles";
    working.projects[0].status = working.projects[0].lifecycle.phase = "working";
    working.projects[0].lifecycle.workOrder = {
      startsAt: "2026-10-30T02:00:00Z",
      completesAt: "2026-10-31T02:00:00Z",
      pausedAt: "",
      remainingMs: 86_400_000,
      focus: { minutes: 360, nextPeriod: { startsAt: "2026-10-30T02:01:00Z", endsAt: "2026-10-30T08:01:00Z" } },
    };
    const { page: focusPage } = await openProjectPage(browser, width, working);
    await focusPage.setViewportSize({ width, height });
    if (width < 700) await focusPage.getByRole("button", { name: "Slot 2", exact: true }).click();
    await focusPage.getByRole("button", { name: /New Venue.*Canvas Tent.*Working/ }).click();
    await focusPage.getByRole("button", { name: "Progress", exact: true }).click();
    await expect(focusPage.getByText("6 hours", { exact: true })).toBeVisible();
    await expect(focusPage.getByText("Next work period", { exact: true })).toBeVisible();
    assert(
      await focusPage
        .locator(".vp-facts")
        .innerText()
        .then((text) => text.includes("7:01") && text.includes("1:01")),
      "focus times use the Village timezone",
    );
    if (process.env.VILLAGES_SCREENSHOT_DIR) {
      await mkdir(process.env.VILLAGES_SCREENSHOT_DIR, { recursive: true });
      await focusPage.screenshot({ path: join(process.env.VILLAGES_SCREENSHOT_DIR, `focus-${width}x${height}.png`) });
    }
    assert(
      await focusPage
        .locator(".marinara-capability-villages-project-root")
        .evaluate((root) => root.scrollHeight <= root.clientHeight + 1),
      `focus ${width}x${height} fits its viewport`,
    );
    await focusPage.close();
  }
  console.log("Project workspace and detail controls fit desktop and phone viewports.");
} finally {
  await browser.close();
}
