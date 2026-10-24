import assert from "node:assert/strict";
import { tsImport } from "tsx/esm/api";
const { readBaseVenueLayout, validateLayoutZones } = await tsImport(
  "../packages/villages/src/server/domain/rules/venue-layout.ts",
  import.meta.url,
);
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { openProjectPage, currentProject, projectSnapshot } from "./fixtures/villages-project-browser.fixture.mjs";
const output = process.env.VILLAGES_VISUAL_OUTPUT;
if (output) await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [1280, 390]) {
    const f = await openProjectPage(browser, width, undefined, async (path, body, snapshot) => {
      if (path === "/projects") {
        const project = currentProject("created");
        project.title = body.name;
        project.venueDraft.name = body.name;
        project.venueDraft.classes = body.classes;
        project.venueDraft.description = body.description;
        project.plan = null;
        project.lifecycle.builderId = "";
        project.lifecycle.candidates = [];
        snapshot.projects.push(project);
        return;
      }
      const [, id, action] = path.split("/").slice(1),
        project = snapshot.projects.find((p) => p.id === id);
      assert(project);
      assert(body.requestId);
      assert.equal(body.expectedRevision, project.lifecycle.revision);
      if (action === "plan") {
        project.plan = body;
        project.venueDraft.classes = body.classes;
        project.lifecycle.revision++;
      }
      if (action === "revise") {
        project.lifecycle.change = body;
        project.lifecycle.revision++;
      }
      if (action === "start") {
        project.status = project.lifecycle.phase = "working";
        project.venueId = "built";
        project.lifecycle.workOrder = {
          startsAt: "2026-10-23T12:00:00Z",
          completesAt: "2026-10-24T12:00:00Z",
          remainingMs: 86400000,
          pausedAt: "",
        };
      }
      if (action === "cancel") project.status = project.lifecycle.phase = "cancelled";
    });
    const { page } = f;
    const screenshot = async (name) => {
      if (output)
        await page.screenshot({ path: resolve(output, "projects-" + name + "-" + width + ".png"), fullPage: true });
    };
    const select = async (name) =>
      page.getByRole("navigation", { name: "Projects", exact: true }).getByRole("button", { name }).click();
    const back = async () => page.getByRole("button", { name: "‹ All Projects", exact: true }).click();
    await screenshot("index");
    await select(/Canvas Tent/);
    await expect(page.getByRole("button", { name: "Start · 24 hours", exact: true })).toBeEnabled();
    await page.getByRole("tab", { name: "Design", exact: true }).click();
    await page.getByRole("tab", { name: "Design", exact: true }).hover();
    const selectedContrast = await page.getByRole("tab", { name: "Design", exact: true }).evaluate((element) => {
      const style = getComputedStyle(element);
      const luminance = (color) =>
        color
          .match(/[0-9.]+/g)
          .slice(0, 3)
          .map(Number)
          .map((channel) => {
            const value = channel / 255;
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
          })
          .reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
      const a = luminance(style.color),
        b = luminance(style.backgroundColor);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    assert(selectedContrast >= 4.5, "a hovered selected tab retains readable contrast");
    await page.getByLabel("Physical design", { exact: true }).fill("An edited pavilion");
    await expect(page.getByRole("button", { name: "Start · 24 hours", exact: true })).toBeDisabled();
    // Keyboard navigation changes tabs, never the design or server.
    await page.getByRole("tab", { name: "Design", exact: true }).press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Zones", exact: true })).toBeFocused();
    await page
      .getByRole("navigation", { name: "Project Zones" })
      .getByRole("button", { name: /Art room/ })
      .click();
    await page.getByLabel("Zone Used For", { exact: true }).fill("Painting");
    await screenshot("zones");
    await page.getByRole("tab", { name: "People", exact: true }).click();
    await expect(
      page.getByRole("group", { name: "Willing leads" }).getByRole("button", { name: /Mara/ }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("group", { name: "Willing leads" }).getByRole("button")).toHaveCount(1);
    await screenshot("people");
    await back();
    await select(/Workshop/);
    await page.getByRole("tab", { name: "Design", exact: true }).click();
    await expect(
      page.getByRole("group", { name: "Classes", exact: true }).getByRole("button", { name: "Community", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.getByLabel("Physical design", { exact: true }).fill("A revised workshop");
    await back();
    await select(/Canvas Tent/);
    await page.getByRole("tab", { name: "Design", exact: true }).click();
    await expect(page.getByLabel("Physical design", { exact: true })).toHaveValue("An edited pavilion");
    await page.getByRole("button", { name: "Save design", exact: true }).click();
    await expect(page.getByRole("button", { name: "Start · 24 hours", exact: true })).toBeEnabled();
    assert.equal(f.calls.length, 1, "editing, saving and navigation never start work");
    assert.equal(f.calls[0].body.expectedRevision, 1);
    assert.equal(f.calls[0].body.spaces[0].purpose, "Painting");
    await screenshot("design");
    await page.getByRole("tab", { name: "Overview", exact: true }).click();
    await expect(page.getByRole("tabpanel")).toContainText("An edited pavilion");
    await expect(page.getByRole("tabpanel")).not.toContainText("A shared art pavilion.");
    await page.getByRole("button", { name: "Start · 24 hours", exact: true }).click();
    await expect(page.locator("time")).toHaveAttribute("datetime", "2026-10-24T12:00:00Z");
    await page.getByRole("tab", { name: "Design", exact: true }).click();
    await expect(page.getByLabel("Physical design", { exact: true })).toHaveCount(0);
    await page.getByRole("tab", { name: "Progress", exact: true }).click();
    await page.getByRole("button", { name: "Cancel Project", exact: true }).click();
    await back();
    await expect(
      page
        .getByRole("navigation", { name: "Projects", exact: true })
        .getByRole("button", { name: /Canvas Tent.*Cancelled/ }),
    ).toBeVisible();
    await select(/Workshop/);
    await expect(page.getByLabel("Physical design", { exact: true })).toHaveValue("A revised workshop");
    await page.getByRole("button", { name: "Save design", exact: true }).click();
    assert.deepEqual(
      f.calls.at(-1).body.classes,
      ["community", "workplace"],
      "saved Classes do not reset to the live target",
    );
    // All sections fit on desktop and phone, with a single visible section.
    for (const name of ["Overview", "Design", "Zones", "People", "Site", "Progress"]) {
      await page.getByRole("tab", { name, exact: true }).click();
      const box = await page.getByRole("main", { name: "Project portfolio" }).boundingBox();
      assert(box && box.x >= 0 && box.x + box.width <= width + 1, name + " stays within the viewport");
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        name + " does not overflow",
      );
    }
    await back();
    await page.getByRole("button", { name: "New Venue", exact: true }).click();
    await page.getByLabel("Name", { exact: true }).fill("New Garden");
    await page.getByLabel("Physical design", { exact: true }).fill("A shared garden.");
    await page
      .getByRole("group", { name: "Classes", exact: true })
      .getByRole("button", { name: "Workplace", exact: true })
      .click();
    await page.getByRole("button", { name: "Create draft", exact: true }).click();
    await expect(page.getByRole("heading", { name: "New Garden", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start · 24 hours", exact: true })).toBeDisabled();
    assert.deepEqual(f.calls.find((call) => call.path === "/projects").body.classes, ["community", "workplace"]);
    await page.getByRole("tab", { name: "Design", exact: true }).click();
    await expect(page.getByLabel("Physical design", { exact: true })).toHaveValue("A shared garden.");
    await expect(page.getByLabel("Entrance", { exact: true })).toHaveValue("");
    const longDesign = "A shared garden with sheltered work tables, winding paths and open planting beds. ".repeat(24);
    await page.getByLabel("Physical design", { exact: true }).fill(longDesign);
    await expect(page.getByLabel("Entrance", { exact: true })).toHaveValue("");
    await page.getByLabel("Entrance", { exact: true }).fill("A narrow gate beside the old oak.");
    await page.getByRole("tab", { name: "Zones", exact: true }).click();
    await expect(page.getByLabel("Entrance", { exact: true })).toHaveValue("A narrow gate beside the old oak.");
    await page.getByRole("tab", { name: "Overview", exact: true }).click();
    await expect(page.getByRole("tabpanel")).toContainText(longDesign.trim());
    await page.getByRole("button", { name: "Save design", exact: true }).click();
    await expect.poll(() => f.calls.at(-1)?.path).toBe("/projects/created/plan");
    assert.equal(f.calls.at(-1).body.form, longDesign);
    assert.equal(f.calls.at(-1).body.exteriorDescription, "A narrow gate beside the old oak.");
    const reopened = await openProjectPage(browser, width, structuredClone(f.snapshot));
    await reopened.page
      .getByRole("navigation", { name: "Projects", exact: true })
      .getByRole("button", { name: /New Garden/ })
      .click();
    await expect(reopened.page.getByRole("tabpanel")).toContainText(longDesign.trim());
    await reopened.page.getByRole("tab", { name: "Design", exact: true }).click();
    await expect(reopened.page.getByLabel("Physical design", { exact: true })).toHaveValue(longDesign);
    await expect(reopened.page.getByLabel("Entrance", { exact: true })).toHaveValue(
      "A narrow gate beside the old oak.",
    );
    await reopened.page.close();
    await page.close();

    // Six-Zone admission and private specifications are authored through the same selected-space editor.
    const data = projectSnapshot();
    data.projects[0].plan.spaces = Array.from({ length: 6 }, (_, i) => ({
      ...data.projects[0].plan.spaces[0],
      id: "art-" + i,
      name: "Art " + i,
    }));
    const limit = await openProjectPage(browser, width, data);
    await limit.page
      .getByRole("navigation", { name: "Projects", exact: true })
      .getByRole("button", { name: /Canvas Tent/ })
      .click();
    await limit.page.getByRole("tab", { name: "Zones", exact: true }).click();
    await expect(limit.page.getByRole("button", { name: "Add Zone", exact: true })).toBeDisabled();
    await expect(limit.page.getByRole("button", { name: "Add private Zone", exact: true })).toBeDisabled();
    await limit.page.getByRole("navigation", { name: "Project Zones" }).getByRole("button", { name: /Art 0/ }).click();
    await limit.page.getByRole("button", { name: "Remove Zone", exact: true }).click();
    await limit.page.getByRole("button", { name: "Add private Zone", exact: true }).click();
    await limit.page.getByLabel("Zone Name", { exact: true }).fill("Quiet room");
    await limit.page.getByLabel("Room Specification", { exact: true }).fill("A quiet canvas alcove.");
    await expect(limit.page.getByLabel("Zone Appearance", { exact: true })).toHaveCount(0);
    await limit.page.getByRole("button", { name: "Save design", exact: true }).click();
    await expect.poll(() => limit.calls.length).toBe(1);
    assert.equal(limit.calls[0].body.spaces.length, 5);
    assert.equal(limit.calls[0].body.privateSpaces[0].roomSpecification, "A quiet canvas alcove.");
    assert.deepEqual(limit.calls[0].body.privateSpaces[0].connectedTo, ["exterior"]);
    const payload = limit.calls[0].body;
    const decoded = readBaseVenueLayout(
      { ...payload, description: payload.exteriorDescription },
      payload.classes,
      "",
      () => null,
    );
    assert.equal(decoded.length, 7, "the actual production decoder admits the authored six-Zone design");
    assert.equal(decoded.at(-1).access.mode, "permission-required");
    await limit.page.close();
    const restricted = await openProjectPage(browser, width);
    await restricted.page
      .getByRole("navigation", { name: "Projects", exact: true })
      .getByRole("button", { name: /Workshop/ })
      .click();
    await restricted.page.getByRole("tab", { name: "Zones", exact: true }).click();
    await restricted.page.getByRole("button", { name: "Add private Zone", exact: true }).click();
    await restricted.page.getByLabel("Zone Name", { exact: true }).fill("Archive");
    await restricted.page.getByLabel("Room Specification", { exact: true }).fill("Shelves and a reading desk.");
    await restricted.page
      .getByRole("group", { name: "Zone controllers" })
      .getByRole("button", { name: "You", exact: true })
      .click();
    await restricted.page.getByRole("button", { name: "Save design", exact: true }).click();
    await expect.poll(() => restricted.calls.length).toBe(1);
    const terms = restricted.calls[0].body;
    validateLayoutZones(restricted.snapshot.settings.venues[0], terms.zones, terms.classes, {
      villagers: restricted.snapshot.villagers,
    });
    assert.deepEqual(terms.zones.at(-1).controllerIds, ["player"], "new restricted authority is an explicit choice");
    await restricted.page.close();

    const changed = await openProjectPage(browser, width);
    await changed.page
      .getByRole("navigation", { name: "Projects", exact: true })
      .getByRole("button", { name: /Canvas Tent/ })
      .click();
    await changed.page.getByRole("tab", { name: "Design", exact: true }).click();
    await changed.page.getByLabel("Physical design", { exact: true }).fill("Local edit");
    changed.snapshot.projects[0].plan.form = "A design saved elsewhere";
    changed.snapshot.projects[0].lifecycle.revision++;
    await changed.update();
    await expect(changed.page.getByRole("button", { name: "Save design", exact: true })).toBeDisabled();
    await expect(changed.page.getByLabel("Physical design", { exact: true })).toHaveValue("Local edit");
    await changed.page.getByRole("button", { name: "Discard edits", exact: true }).click();
    await expect(changed.page.getByLabel("Physical design", { exact: true })).toHaveValue("A design saved elsewhere");
    assert.equal(changed.calls.length, 0, "a stale local draft cannot overwrite a newer revision");
    await changed.page.getByLabel("Physical design", { exact: true }).fill("Another local edit");
    changed.snapshot.projects[0].status = changed.snapshot.projects[0].lifecycle.phase = "paused";
    changed.snapshot.projects[0].lifecycle.workOrder = {
      remainingMs: 60000,
      startsAt: "",
      completesAt: "",
      pausedAt: "",
    };
    await changed.update();
    await expect(changed.page.getByRole("button", { name: "Resume", exact: true })).toBeDisabled();
    await changed.page.getByRole("button", { name: "Discard edits", exact: true }).click();
    await expect(changed.page.getByRole("button", { name: "Resume", exact: true })).toBeEnabled();
    await expect(changed.page.getByLabel("Physical design", { exact: true })).toHaveCount(0);
    await changed.page.close();
  }
  console.log(
    "Blueprint Projects on desktop/phone: tabs, keyboard access, retained edits, explicit Start, deadline, cancellation, two Classes, six Zones and private specifications passed.",
  );
} finally {
  await browser.close();
}
