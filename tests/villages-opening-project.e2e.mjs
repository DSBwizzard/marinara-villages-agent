import assert from "node:assert/strict";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { openProjectPage, projectSnapshot, currentProject } from "./fixtures/villages-project-browser.fixture.mjs";
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [1280, 390]) {
    const snapshot = projectSnapshot();
    snapshot.projects = [];
    snapshot.opening = {
      id: "opening",
      version: 2,
      stage: "conversations",
      residentIds: ["mara", "eli", "lina"],
      heardIds: ["mara"],
      declinedIds: [],
      projectId: "",
      communityVenueId: "mill",
      gatheringSceneId: "",
      action: "Talk to residents",
      outcome: "",
      proposals: [
        {
          residentId: "mara",
          kind: "new-venue",
          name: "Canvas Tent",
          description: "An art pavilion.",
          work: "Lead the work.",
          venueClass: "community",
          established: false,
          provenance: "",
          firstUse: "Make art.",
        },
      ],
    };
    const f = await openProjectPage(browser, width, snapshot, (path, body, data) => {
        assert.equal(path, "/projects/opening");
        assert.equal(body.openingId, "opening");
        assert.equal(body.action, "accept");
        const project = currentProject("canvas");
        project.plan = null;
        project.lifecycle.candidates = [];
        project.lifecycle.builderId = "";
        data.projects.push(project);
        data.opening.projectId = project.id;
        data.opening.stage = "project";
      }),
      { page } = f;
    await expect(page.getByRole("button", { name: "New Venue", exact: true })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Renovation", exact: true })).toBeEnabled();
    await page.getByRole("navigation", { name: "Resident proposals" }).getByRole("button", { name: /Mara/ }).click();
    await expect(page.getByRole("button", { name: "Accept proposal", exact: true })).toBeEnabled();
    await page.getByRole("button", { name: "Accept proposal", exact: true }).click();
    await expect(page.getByRole("button", { name: "Start · 24 hours", exact: true })).toBeDisabled();
    assert.equal(f.calls.length, 1, "accepting a single heard proposal only creates planning");
    assert.equal(snapshot.projects[0].status, "planning");
    assert.equal(snapshot.projects[0].lifecycle.builderId, "", "a pitch is not consent or willingness to lead");
    await page.close();
  }
  console.log(
    "Optional opening on desktop/phone: ordinary Projects available, first heard proposal accepted immediately, no automatic Start.",
  );
} finally {
  await browser.close();
}
