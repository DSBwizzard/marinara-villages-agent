import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { build } from "esbuild";
import { snapshot as fixture, image } from "./fixtures/villages-scene-browser.fixture.mjs";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});

function projectSnapshot() {
  const snapshot = structuredClone(fixture);
  snapshot.projects = ["canvas", "workshop"].map((id, index) => {
    const venue = {
      ...snapshot.settings.venues[0],
      id,
      name: index ? "Workshop" : "Canvas Tent",
      classes: ["workplace"],
      constructionStatus: index ? undefined : "worksite",
      spaces: [],
      privateSpaces: [],
      zones: [],
      occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    };
    snapshot.settings.venues.push(venue);
    return {
      id: `${id}-build`,
      kind: index ? "renovation" : "new-venue",
      title: venue.name,
      venueId: id,
      status: "finishing",
      progress: 100,
      participantIds: [],
      updatedAt: new Date().toISOString(),
      venueDraft: { name: venue.name, classes: venue.classes, description: "A useful place" },
      lifecycle: {
        phase: "finishing",
        targetVenueId: id,
        change: index ? { detail: "Renovate the Workshop" } : null,
        affectedIds: [],
        approvals: [],
        candidates: [],
        builderId: "mara",
        requirements: [],
        builderAgreement: null,
        checklistAccepted: true,
      },
    };
  });
  return snapshot;
}

async function openPage(width, snapshot, imageHandler) {
  const page = await browser.newPage({ viewport: { width, height: 844 }, hasTouch: width === 390 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/villages**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/setup/venue-image/generate")) return imageHandler(route);
    const value = path.endsWith("/connections")
      ? { systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" }
      : path.endsWith("/lorebooks")
        ? { books: [] }
        : snapshot;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
  });
  await page.route("**/api/connections", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ id: "talk", provider: "language", name: "Talk", defaultForAgents: true }]),
    }),
  );
  await page.route("http://projects.test/", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<style>:root{font-size:20px;--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}html,body{margin:0;width:100%;height:100%;font-family:Arial}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
    }),
  );
  await page.goto("http://projects.test/");
  await page.addScriptTag({ path: resolve("packages/villages/client.js") });
  await page.getByRole("button", { name: /^(Open settings menu|More)$/ }).click();
  await page.getByRole("button", { name: /^Projects \(/ }).click();
  return { page, errors };
}

async function selectProject(page, name) {
  await page.getByRole("button", { name: "All Projects", exact: true }).click();
  await page.getByRole("button", { name }).click();
  await page.getByRole("button", { name: "Visit finished Venue", exact: true }).click();
}

// A mounted source-hook harness makes reset, repeated focus and application
// disposal deterministic without simulating the entire founding wizard.
async function checkControllerLifetime() {
  const bundle = await build({
    stdin: {
      contents: `
        import { createRoot } from "react-dom/client";
        import { useState } from "react";
        import { useProjectsController } from "./packages/villages/src/client/features/projects/useProjectsController.js";
        import { useProjectsState } from "./packages/villages/src/client/features/projects/useProjectsState.js";
        function Harness() {
          const [snapshot, setSnapshot] = useState(window.initialSnapshot);
          const focus = useProjectsState();
          const controller = useProjectsController({ snapshot,
            onSnapshot: next => { window.snapshotCallbacks++; setSnapshot(next); },
            focusProjectId: focus.focusedProjectId, focusProjectRequest: focus.projectFocusRequest });
          window.projectsHarness = { controller, setSnapshot, focus: focus.setFocusedProjectId };
          return <pre id="state">{JSON.stringify({
            project: controller.project?.id, form: controller.form, name: controller.name,
            preview: controller.imagePreview?.image.id, busy: controller.busy, error: controller.error,
            founded: snapshot?.isFounded, personality: controller.openingPersonality, lore: controller.openingLore,
            revision: controller.revisionEditor?.draft
          })}</pre>;
        }
        const root = createRoot(document.getElementById("root"));
        window.unmountProjects = () => root.render(null);
        window.mountProjects = () => root.render(<Harness />);
        window.mountProjects();
      `,
      resolveDir: process.cwd(),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    jsx: "automatic",
  });
  const page = await browser.newPage();
  const imageRequests = [];
  const mutationRequests = [];
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("http://project-hooks.test/", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: '<div id="root"></div>' }),
  );
  await page.route("**/api/villages**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/setup/venue-image/generate")) imageRequests.push(route);
    else if (path.endsWith("/projects/canvas-build/open")) mutationRequests.push(route);
    else throw new Error(`Unexpected controller request: ${path}`);
  });
  const snapshot = projectSnapshot();
  snapshot.settings.personalizeVenueImagesByDefault = false;
  snapshot.settings.useVisualLoreByDefault = false;
  await page.goto("http://project-hooks.test/");
  await page.evaluate((initial) => {
    window.initialSnapshot = initial;
    window.snapshotCallbacks = 0;
  }, snapshot);
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  const state = () => page.locator("#state").textContent().then(JSON.parse);
  const call = (operation) => page.evaluate(operation);
  const focusA = () => call(() => window.projectsHarness.focus("canvas-build"));
  const settle = () =>
    page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
  const respond = async (index, id) => {
    const completed = page.waitForResponse((response) => response.url().endsWith("/setup/venue-image/generate"));
    await imageRequests[index].fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id, url: image("#997755") }),
    });
    await (await completed).finished();
    await settle();
  };
  await focusA();
  await expect.poll(async () => (await state()).project).toBe("canvas-build");
  assert.equal((await state()).personality, false);
  assert.equal((await state()).lore, false);
  await call(() => window.projectsHarness.controller.setForm("Retained A"));
  await call(() => window.projectsHarness.controller.setSelectedId("workshop-build"));
  await expect.poll(async () => (await state()).project).toBe("workshop-build");
  await call(() => {
    const editor = window.projectsHarness.controller.revisionEditor;
    editor.setEditing(true);
    editor.setTitle("Batched revision title");
    editor.setChange({ ...editor.draft.change, detail: "Batched revision detail" });
  });
  await expect.poll(async () => (await state()).revision.title).toBe("Batched revision title");
  assert.equal((await state()).revision.editing, true);
  assert.equal((await state()).revision.change.detail, "Batched revision detail");
  await focusA();
  await expect.poll(async () => (await state()).project).toBe("canvas-build");
  assert.equal((await state()).form, "Retained A", "Repeated explicit focus must override a later local selection.");
  await call(() => {
    void window.projectsHarness.controller.generateImage("exterior");
    void window.projectsHarness.controller.generateImage("exterior");
  });
  await expect.poll(() => imageRequests.length).toBe(1);
  await call(() => window.projectsHarness.controller.setSelectedId("workshop-build"));
  const changed = structuredClone(snapshot);
  changed.settings.setting = "Changed global scenery";
  await page.evaluate((next) => window.projectsHarness.setSnapshot(next), changed);
  await respond(0, "stale-hidden-image");
  await focusA();
  await expect.poll(async () => (await state()).error).toContain("Venue changed while the image was being prepared");
  assert.equal((await state()).preview, undefined);

  await call(() => void window.projectsHarness.controller.generateImage("exterior"));
  await expect.poll(() => imageRequests.length).toBe(2);
  const reset = { ...structuredClone(snapshot), isFounded: false, projects: [] };
  await page.evaluate((next) => window.projectsHarness.setSnapshot(next), reset);
  await expect.poll(async () => (await state()).founded).toBe(false);
  await page.evaluate((next) => window.projectsHarness.setSnapshot(next), snapshot);
  await focusA();
  await expect.poll(async () => (await state()).project).toBe("canvas-build");
  assert.equal((await state()).form, "", "Explicit reset must discard the previous world's Project draft.");
  await call(() => void window.projectsHarness.controller.generateImage("exterior"));
  await expect.poll(() => imageRequests.length).toBe(3);
  await respond(1, "pre-reset-image");
  assert.equal((await state()).busy, true, "Pre-reset cleanup cannot clear the new attempt.");
  assert.equal((await state()).preview, undefined);
  await respond(2, "current-image");
  await expect.poll(async () => (await state()).preview).toBe("current-image");

  await call(() => void window.projectsHarness.controller.openVenue());
  await expect.poll(() => mutationRequests.length).toBe(1);
  await page.evaluate((next) => window.projectsHarness.setSnapshot(next), reset);
  await expect.poll(async () => (await state()).founded).toBe(false);
  const completedMutation = page.waitForResponse((response) => response.url().endsWith("/projects/canvas-build/open"));
  await mutationRequests[0].fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(snapshot) });
  await (await completedMutation).finished();
  await settle();
  assert.equal(
    await page.evaluate(() => window.snapshotCallbacks),
    0,
    "A pre-reset mutation reply cannot restore the old world.",
  );
  assert.equal((await state()).founded, false);

  await page.evaluate((next) => window.projectsHarness.setSnapshot(next), snapshot);
  await focusA();
  await expect.poll(async () => (await state()).project).toBe("canvas-build");
  await call(() => void window.projectsHarness.controller.generateImage("exterior"));
  await expect.poll(() => imageRequests.length).toBe(4);
  await call(() => window.unmountProjects());
  await expect(page.locator("#state")).toHaveCount(0);
  await call(() => window.mountProjects());
  await focusA();
  await expect.poll(async () => (await state()).project).toBe("canvas-build");
  await call(() => void window.projectsHarness.controller.generateImage("exterior"));
  await expect.poll(() => imageRequests.length).toBe(5);
  await respond(3, "disposed-image");
  assert.equal((await state()).busy, true);
  assert.equal((await state()).preview, undefined);
  await respond(4, "new-owner-image");
  await expect.poll(async () => (await state()).preview).toBe("new-owner-image");
  assert.equal(imageRequests.length, 5, "Duplicates, focus, reset and remount must not retry provider requests.");
  assert.deepEqual(errors, []);
  await page.close();
}

try {
  await checkControllerLifetime();
  for (const width of [1366, 390]) {
    // Draft state belongs to the application even when the Project panel is absent.
    const { page: draftPage, errors: draftErrors } = await openPage(width, structuredClone(fixture), () => {
      throw new Error("Editing a draft must not generate an image.");
    });
    await draftPage.getByRole("button", { name: /NEW VENUE.*Imagine a new place/ }).click();
    await draftPage.getByLabel("Venue name", { exact: true }).fill("Retained draft");
    await draftPage.getByLabel(/What would this place/).fill("An unsaved plan for the village.");
    await draftPage.getByRole("button", { name: "Back to menu", exact: true }).click();
    await draftPage.getByRole("button", { name: "Projects (0)", exact: true }).click();
    await expect(draftPage.getByLabel("Venue name", { exact: true })).toHaveValue("Retained draft");
    await expect(draftPage.getByLabel(/What would this place/)).toHaveValue("An unsaved plan for the village.");
    assert.deepEqual(draftErrors, []);
    await draftPage.close();

    const revisionSnapshot = projectSnapshot();
    revisionSnapshot.projects[1].lifecycle.phase = "approval";
    const { page: revisionPage, errors: revisionErrors } = await openPage(width, revisionSnapshot, () => {
      throw new Error("Editing a revision must not generate an image.");
    });
    await revisionPage.getByRole("button", { name: /RENOVATION.*Workshop/ }).click();
    await revisionPage.getByRole("button", { name: "Revise reviewed proposal", exact: true }).click();
    await revisionPage.getByLabel("Project name", { exact: true }).fill("Retained renovation revision");
    await revisionPage.getByLabel(/^Reviewed change/).fill("An unsaved revision of the reviewed terms.");
    await revisionPage.getByRole("button", { name: "Back to menu", exact: true }).click();
    await revisionPage.getByRole("button", { name: "Projects (2)", exact: true }).click();
    await expect(revisionPage.getByLabel("Project name", { exact: true })).toHaveValue("Retained renovation revision");
    await expect(revisionPage.getByLabel(/^Reviewed change/)).toHaveValue("An unsaved revision of the reviewed terms.");
    await revisionPage.getByRole("button", { name: "Cancel revision", exact: true }).click();
    await expect(revisionPage.getByLabel("Project name", { exact: true })).toHaveCount(0);
    assert.deepEqual(revisionErrors, []);
    await revisionPage.close();

    // Two paused requests prove per-Project admission, completion and cleanup.
    const requests = [];
    const { page, errors } = await openPage(width, projectSnapshot(), (route) => {
      requests.push(route);
    });
    await page.getByRole("button", { name: /NEW VENUE.*Canvas Tent/ }).click();
    await page.getByRole("button", { name: "Visit finished Venue", exact: true }).click();
    let editor = page.locator(".marinara-capability-villages-project-finish-visit");
    await editor.getByLabel("Physical form", { exact: true }).fill("A retained canvas shelter");
    await editor.getByLabel("Entrance appearance", { exact: true }).fill("Canvas in morning light.");
    await editor.getByRole("button", { name: "Use Entrance only", exact: true }).click();
    await editor.getByRole("button", { name: "Generate image", exact: true }).click();
    await expect.poll(() => requests.length).toBe(1);
    await page.getByRole("button", { name: "Back to menu", exact: true }).click();
    await page.getByRole("button", { name: "Projects (2)", exact: true }).click();
    editor = page.locator(".marinara-capability-villages-project-finish-visit");
    await expect(editor.getByLabel("Physical form", { exact: true })).toHaveValue("A retained canvas shelter");
    await expect(editor.getByRole("button", { name: "Generate image", exact: true })).toBeDisabled();
    await editor.getByRole("button", { name: "Back to Project", exact: true }).click();
    await selectProject(page, /RENOVATION.*Workshop/);
    await page.getByRole("button", { name: "Generate image", exact: true }).click();
    await expect.poll(() => requests.length).toBe(2);
    await requests[0].fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "canvas-image", url: image("#aa7744") }),
    });
    // A's completion cannot attach to B or clear B's pending request.
    await expect(page.getByRole("button", { name: "Generate image", exact: true })).toBeDisabled();
    await expect(page.getByAltText("Generated Venue candidate")).toHaveCount(0);
    await page.getByRole("button", { name: "Back to Project", exact: true }).click();
    await selectProject(page, /NEW VENUE.*Canvas Tent/);
    await expect(page.getByAltText("Generated Venue candidate")).toBeVisible();
    await page.getByRole("button", { name: "Use this image", exact: true }).click();
    await expect(page.getByAltText("exterior preview")).toBeVisible();
    await page.getByRole("button", { name: "Back to Project", exact: true }).click();
    await selectProject(page, /RENOVATION.*Workshop/);
    await requests[1].fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Workshop image failed" }),
    });
    await expect(page.getByRole("alert")).toContainText("Workshop image failed");
    await expect(page.getByRole("button", { name: "Generate image", exact: true })).toBeEnabled();
    assert.equal(requests.length, 2, "Navigation and failures must never retry image requests automatically.");
    await page.getByRole("button", { name: "Back to Project", exact: true }).click();
    await selectProject(page, /NEW VENUE.*Canvas Tent/);
    await page.getByRole("button", { name: "Generate image", exact: true }).click();
    await expect.poll(() => requests.length).toBe(3);
    await page.getByLabel("Physical form", { exact: true }).fill("A changed shelter");
    await page.getByRole("button", { name: "Back to Project", exact: true }).click();
    await selectProject(page, /RENOVATION.*Workshop/);
    await requests[2].fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "outdated-image", url: image("#4488aa") }),
    });
    await expect(page.getByRole("alert")).toContainText("Workshop image failed");
    await page.getByRole("button", { name: "Back to Project", exact: true }).click();
    await selectProject(page, /NEW VENUE.*Canvas Tent/);
    await expect(page.getByRole("alert")).toContainText("Venue changed while the image was being prepared");
    await expect(page.getByAltText("Generated Venue candidate")).toHaveCount(0);
    await expect(page.getByAltText("exterior preview")).toBeVisible();
    await page.getByRole("button", { name: "Generate image", exact: true }).click();
    await expect.poll(() => requests.length).toBe(4);
    await requests[3].fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "discarded-image", url: image("#44aa88") }),
    });
    await expect(page.getByAltText("Generated Venue candidate")).toBeVisible();
    await page.getByRole("button", { name: "Discard", exact: true }).click();
    await expect(page.getByAltText("Generated Venue candidate")).toHaveCount(0);
    await expect(page.getByAltText("exterior preview")).toBeVisible();
    assert.equal(requests.length, 4, "Changed inputs, selection and discard must not trigger extra requests.");
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Mocked desktop/mobile Project drafts, selection, pending image navigation and independent completion passed.",
  );
} finally {
  await browser.close();
}
