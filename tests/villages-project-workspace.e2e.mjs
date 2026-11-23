import assert from "node:assert/strict";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { currentProject, openProjectPage, projectSnapshot } from "./fixtures/villages-project-browser.fixture.mjs";
function gathering(snapshot, id = "supper") {
  const actors = snapshot.villagers.slice(0, 2);
  return {
    ...currentProject(id),
    id,
    kind: "undertaking",
    title: "Thursday supper",
    venueId: snapshot.settings.venues[0].id,
    undertaking: {
      plan: {
        goal: "Share an unhurried supper",
        zoneId: "work",
        roles: actors.map((a) => ({ actorId: a.characterId, role: "Taking part" })),
        milestones: [{ id: "meal", title: "Share the first supper", kind: "first-use" }],
      },
      completed: [],
    },
    lifecycle: {
      ...currentProject(id).lifecycle,
      affectedIds: actors.map((a) => a.characterId),
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
    snapshot.projects = [gathering(snapshot)];
    const f = await openProjectPage(browser, width, snapshot, async (path, body, current) => {
      if (path === "/projects/undertakings") {
        const p = gathering(current, "stories");
        p.title = body.title;
        p.venueId = "";
        p.undertaking.plan = {
          goal: body.description || body.title,
          zoneId: "",
          roles: [],
          milestones: [{ id: "first-use", title: "Get together for the first time", kind: "first-use" }],
        };
        p.lifecycle.affectedIds = [];
        current.projects.push(p);
      } else if (path === "/projects") {
        const p = currentProject("arcade");
        p.title = body.name;
        Object.assign(p.venueDraft, { name: body.name, description: body.description, position: { x: null, y: null } });
        delete p.plan;
        p.firstUse = { goal: "Enjoy the first visit together" };
        p.lifecycle.builderId = "";
        p.lifecycle.candidates = [];
        current.projects.push(p);
      } else if (path.includes("/renovations/")) {
        const p = currentProject("garden", "renovation");
        p.title = body.title;
        p.venueId = current.settings.venues[0].id;
        p.lifecycle.designReady = false;
        current.projects.push(p);
      } else {
        const p = current.projects.find((p) => path.includes(p.id));
        assert(p);
        if (path.endsWith("/undertaking-plan")) {
          p.title = body.title;
          p.venueId = body.venueId;
          p.undertaking.plan = body.plan;
          p.lifecycle.affectedIds = body.plan.roles.map((r) => r.actorId);
          p.lifecycle.approvals = [];
          p.lifecycle.revision++;
        }
        if (path.endsWith("/start")) p.status = p.lifecycle.phase = "working";
      }
    });
    const { page } = f;
    await page.setViewportSize({ width, height });
    const targetId = snapshot.settings.venues[0].id;
    assert.equal(
      await page.evaluate((id) => window.projectVenuePins.find((pin) => pin.id === id)?.image, targetId),
      snapshot.settings.venues[0].presentation.image?.url ?? null,
      "Shared Projects retain ordinary Venue artwork",
    );
    await page.evaluate((id) => window.projectVenuePins.find((pin) => pin.id === id)?.onSelect(), targetId);
    assert.equal(await page.evaluate(() => window.lastVisit), targetId, "The map opens the usable Venue");
    await page.getByRole("button", { name: "Thursday supper", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Next · Ask/ })).toBeVisible();
    assert.equal(await page.getByLabel(/Milestones|What we're making|Physical work|Role/, { exact: true }).count(), 0);
    await page.getByRole("button", { name: "Edit idea", exact: true }).click();
    await page.getByLabel("Idea", { exact: true }).fill("A quiet supper with new friends.");
    await page.getByRole("button", { name: "Place", exact: true }).click();
    await page.getByRole("button", { name: "Edit idea", exact: true }).click();
    await expect(page.getByLabel("Idea", { exact: true })).toHaveValue("A quiet supper with new friends.");
    await page.getByRole("button", { name: "‹ All Projects", exact: true }).click();
    await expect(page.getByText("Leave with an unsaved plan?", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    snapshot.projects[0].lifecycle.revision = 2;
    await f.update();
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    assert.equal(
      f.calls.at(-1).body.expectedRevision,
      1,
      "Dirty edits keep their admitted revision after a snapshot refresh",
    );
    await expect(page.getByLabel("Idea", { exact: true })).toBeHidden();
    snapshot.projects[0].lifecycle.approvals = snapshot.projects[0].lifecycle.affectedIds.map((residentId) => ({
      residentId,
      source: "conversation",
    }));
    await f.update();
    await page.getByRole("button", { name: "Begin together", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Next · Share the first supper", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "‹ All Projects", exact: true }).click();
    await page.getByRole("button", { name: "New Project", exact: true }).click();
    await page.getByRole("button", { name: "Plan a gathering", exact: true }).click();
    await page.getByLabel("Name", { exact: true }).fill("Our story night");
    assert.equal(await page.getByRole("checkbox").count(), 0, "Creation requires no assigned people");
    await page.getByRole("button", { name: "Save idea", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Next · Choose a place", exact: true })).toBeVisible();
    const created = f.calls.find((c) => c.path === "/projects/undertakings");
    assert(created.body.requestId);
    assert(!Object.hasOwn(created.body, "plan"), "The server supplies steps");
    await page.getByRole("button", { name: "Choose a place", exact: true }).click();
    await page.getByLabel("Place", { exact: true }).selectOption(snapshot.settings.venues[0].id);
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Next · Invite someone", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Invite someone", exact: true }).click();
    await page.getByRole("checkbox", { name: snapshot.villagers[0].name, exact: true }).check();
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Next · Ask/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Begin together", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "‹ All Projects", exact: true }).click();
    await page.evaluate(() => window.projectsHarness.beginIdea("An arcade could give us somewhere to hang out."));
    await page.getByRole("button", { name: "Build a place", exact: true }).click();
    await expect(page.getByLabel("Idea", { exact: true })).toHaveValue(
      "An arcade could give us somewhere to hang out.",
    );
    await page.getByLabel("Name", { exact: true }).fill("Arcade");
    await page.getByRole("button", { name: "Save idea", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Next · Choose a site", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Choose on map", exact: true }).click();
    assert.equal(await page.evaluate(() => window.lastPlacement), "arcade");
    assert.equal(f.calls.find((c) => c.path === "/projects").body.firstUse, true);
    await page.getByRole("button", { name: "‹ All Projects", exact: true }).click();
    await page.getByRole("button", { name: "New Project", exact: true }).click();
    await page.getByRole("button", { name: "Improve a place", exact: true }).click();
    await page.getByLabel("Place", { exact: true }).selectOption(snapshot.settings.venues[0].id);
    await page.getByLabel("Name", { exact: true }).fill("A brighter room");
    await page.getByRole("button", { name: "Save idea", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Next · Design the place", exact: true })).toBeVisible();
    const improvement = snapshot.projects.find((p) => p.id === "garden");
    improvement.lifecycle.designReady = true;
    improvement.lifecycle.change = { ...improvement.lifecycle.change, capacity: 3 };
    await f.update();
    await expect(page.getByRole("heading", { name: "Next · Ready to begin work", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Begin work", exact: true }).click();
    assert.equal(f.calls.at(-1).path, "/projects/garden/start");
    await page.getByRole("button", { name: "‹ All Projects", exact: true }).click();
    const arcade = snapshot.projects.find((p) => p.id === "arcade");
    arcade.status = arcade.lifecycle.phase = "complete";
    arcade.venueId = snapshot.settings.venues[0].id;
    await f.update();
    await page.getByRole("button", { name: "Arcade", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Next · Enjoy the first visit together", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("New Venue · Ready to open", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Visit Arcade", exact: true }).click();
    assert.equal(await page.evaluate(() => window.lastVisit), arcade.venueId);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.close();
  }
});
console.log("Manual Project paths, deferred planning, invitations, next actions and phone layouts passed.");
