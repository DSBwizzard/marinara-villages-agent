import assert from "node:assert/strict";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { currentProject, openProjectPage, projectSnapshot } from "./fixtures/villages-project-browser.fixture.mjs";

function sharedProject(snapshot, id = "shared-supper") {
  const actors = snapshot.villagers.slice(0, 2);
  return {
    ...currentProject(id),
    id,
    kind: "undertaking",
    title: "Thursday supper",
    venueId: snapshot.settings.venues[0].id,
    undertaking: {
      plan: {
        goal: "Cook and enjoy an unhurried supper together.",
        zoneId: "work",
        roles: actors.map((actor) => ({ actorId: actor.characterId, role: "Taking part" })),
        milestones: [
          { id: "prepare", title: "Prepare the table together", kind: "preparation" },
          { id: "meal", title: "Share the first supper", kind: "first-use" },
        ],
        schedule: { firstDate: "2026-11-26", startMinute: 1140, endMinute: 1200, weekly: true },
      },
      completed: [],
    },
    lifecycle: {
      ...currentProject(id).lifecycle,
      affectedIds: actors.map((actor) => actor.characterId),
      approvals: [],
      builderId: "",
      candidates: [],
      workOrder: null,
    },
  };
}
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const [width, height] of [
    [1280, 900],
    [850, 900],
    [390, 740],
    [320, 568],
  ]) {
    const snapshot = projectSnapshot();
    snapshot.projects = [sharedProject(snapshot)];
    const f = await openProjectPage(browser, width, snapshot, async (path, body, current) => {
      if (path === "/projects/undertakings") {
        const project = sharedProject(current, "new-reading-circle");
        Object.assign(project, {
          title: body.title,
          venueId: body.venueId,
          undertaking: { plan: body.plan, completed: [] },
        });
        current.projects.push(project);
      } else if (path.endsWith("/start")) {
        const project = current.projects.find((entry) => path.includes(entry.id));
        project.status = project.lifecycle.phase = "working";
      }
    });
    const { page } = f;
    await page.setViewportSize({ width, height });
    await expect(page.getByRole("heading", { name: "Thursday supper", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Open Project", exact: true }).click();
    await expect(page.getByRole("button", { name: "Begin together", exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: /Start.*24 hours/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Complete milestone|Mark complete/ })).toHaveCount(0);
    await page.getByRole("tab", { name: "Plan", exact: true }).click();
    await page.getByLabel("What we're making", { exact: true }).fill("An unhurried supper with space for new friends.");
    await page.getByRole("tab", { name: "Location", exact: true }).click();
    await page.getByRole("tab", { name: "Plan", exact: true }).click();
    await expect(page.getByLabel("What we're making", { exact: true })).toHaveValue(
      "An unhurried supper with space for new friends.",
    );
    await page.getByRole("button", { name: "‹ All Projects", exact: true }).click();
    await expect(page.getByText("Leave with an unsaved plan?", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(page.getByLabel("What we're making", { exact: true })).toHaveValue(
      "An unhurried supper with space for new friends.",
    );
    snapshot.projects[0].lifecycle.revision = 2;
    await f.update();
    await page.getByRole("button", { name: "Save plan", exact: true }).click();
    assert.equal(f.calls.at(-1).body.expectedRevision, 1);
    await page.getByRole("tab", { name: "People", exact: true }).click();
    await expect(page.getByText("People and agreements", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "People", exact: true }).click();
    assert.equal(await page.evaluate(() => window.peopleOpened), true);
    snapshot.projects[0].lifecycle.approvals = snapshot.projects[0].lifecycle.affectedIds.map((residentId) => ({
      residentId,
      source: "conversation",
    }));
    await f.update();
    await page.getByRole("button", { name: "Begin together", exact: true }).click();
    await expect(page.getByRole("button", { name: "Begin together", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "‹ All Projects", exact: true }).click();
    await page.getByRole("button", { name: "New Project", exact: true }).click();
    await page.getByLabel("Name", { exact: true }).fill("A reading circle of our own");
    await page.getByLabel("What we're making", { exact: true }).fill("Share books with friends in a quiet room.");
    await page.getByLabel("Venue", { exact: true }).selectOption(snapshot.settings.venues[0].id);
    await page.getByLabel("Zone", { exact: true }).selectOption("work");
    await page.getByRole("checkbox", { name: snapshot.villagers[0].name, exact: true }).check();
    await page.getByLabel("Role", { exact: true }).fill("Host the circle");
    await page.getByRole("button", { name: "Keep this plan", exact: true }).click();
    await expect(page.getByRole("heading", { name: "A reading circle of our own", exact: true })).toBeVisible();
    const created = f.calls.find((call) => call.path === "/projects/undertakings");
    assert.equal(created.body.plan.roles[0].role, "Host the circle");
    assert.equal(created.body.plan.milestones.at(-1).kind, "first-use");
    assert(created.body.requestId);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.close();
  }
});
console.log("Shared Project plans, consent controls, new undertakings, and phone layouts passed.");
