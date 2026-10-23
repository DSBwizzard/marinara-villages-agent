import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { openProjectPage, currentProject } from "./fixtures/villages-project-browser.fixture.mjs";
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
    const { page } = f,
      nav = page.getByRole("navigation", { name: "Projects", exact: true });
    await nav.getByRole("button", { name: /Canvas Tent/ }).click();
    await expect(page.getByRole("button", { name: "Start · 24 hours", exact: true })).toBeEnabled();
    await page.getByLabel("Physical form", { exact: true }).fill("An edited pavilion");
    await expect(page.getByRole("button", { name: "Start · 24 hours", exact: true })).toBeDisabled();
    await nav.getByRole("button", { name: /Workshop/ }).click();
    await expect(page.getByLabel("community", { exact: true })).toBeChecked();
    await page.getByLabel("Physical result", { exact: true }).fill("A revised workshop");
    await nav.getByRole("button", { name: /Canvas Tent/ }).click();
    await expect(page.getByLabel("Physical form", { exact: true })).toHaveValue("An edited pavilion");
    await page.getByRole("button", { name: "Save design", exact: true }).click();
    await expect(page.getByRole("button", { name: "Start · 24 hours", exact: true })).toBeEnabled();
    assert.equal(f.calls.length, 1, "save and navigation never start work");
    assert.equal(f.calls[0].body.expectedRevision, 1);
    await page.getByRole("button", { name: "Start · 24 hours", exact: true }).click();
    await expect(page.locator("time")).toHaveAttribute("datetime", "2026-10-24T12:00:00Z");
    await expect(page.getByLabel("Physical form", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Cancel Project", exact: true }).click();
    await expect(nav.getByRole("button", { name: /Canvas Tent.*Cancelled/ })).toBeVisible();
    await nav.getByRole("button", { name: /Workshop/ }).click();
    await expect(page.getByLabel("Physical result", { exact: true })).toHaveValue("A revised workshop");
    await page.getByRole("button", { name: "Save design", exact: true }).click();
    assert.deepEqual(
      f.calls.at(-1).body.classes,
      ["community", "workplace"],
      "saved Classes do not reset to the live target",
    );
    const box = await page.locator("main").boundingBox();
    assert(box && box.x >= 0 && box.x + box.width <= width + 1);
    await page.getByRole("button", { name: "New Venue", exact: true }).click();
    await page.getByLabel("Name", { exact: true }).fill("New Garden");
    await page.getByLabel("Physical result", { exact: true }).fill("A shared garden.");
    await page.getByLabel("workplace", { exact: true }).check();
    await page.getByRole("button", { name: "Create draft", exact: true }).click();
    await expect(page.getByRole("heading", { name: "New Garden", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start · 24 hours", exact: true })).toBeDisabled();
    assert.deepEqual(f.calls.find((call) => call.path === "/projects").body.classes, ["community", "workplace"]);
    if (output) await page.screenshot({ path: resolve(output, "projects-" + width + ".png"), fullPage: true });
    await page.close();
  }
  console.log(
    "Desktop/phone current Projects: retained edits, saved revision, explicit Start, deadline, cancellation and two-Class drafts passed.",
  );
} finally {
  await browser.close();
}
