import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot as fixture, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({ headless: true });
const output = process.env.VILLAGES_VISUAL_OUTPUT;
if (output) await mkdir(output, { recursive: true });
const proposal = (residentId, index) => ({
  residentId,
  name: ["Old Theatre", "Sky Terrace", "Shared Workshop"][index],
  description: [
    "A theatre that has long been part of this village.",
    "A small terrace for watching the skies.",
    "A place to make useful things together.",
  ][index],
  work: "Arrange shared evenings and coordinate the practical preparations.",
  established: !index,
  provenance: "",
  firstUse: "Watch a performance together.",
  venueClass: "community",
});
function data(stage) {
  const snapshot = structuredClone(fixture);
  snapshot.villagers = snapshot.villagers.slice(0, 3);
  snapshot.foundingPreparation = {
    status: "ready",
    completedIds: snapshot.villagers.map((resident) => resident.characterId),
    currentId: "",
    error: "",
  };
  snapshot.opening = {
    id: "opening-browser",
    version: 1,
    stage,
    communityVenueId: "mill",
    gatheringSceneId: "",
    residentIds: snapshot.villagers.map((resident) => resident.characterId),
    heardIds: stage === "gathering" ? [] : ["mara"],
    proposals: stage === "gathering" ? [] : [proposal("mara", 0)],
    declinedIds: [],
    projectId: "",
    action: stage === "gathering" ? "Community gathering" : "Talk to Eli · 1/3",
    outcome: "",
  };
  return snapshot;
}
async function open(width, stage, version = 1) {
  const snapshot = data(stage);
  snapshot.opening.version = version;
  const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width < 700 });
  const errors = [],
    calls = [];
  let scene = null;
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/villages**", async (route) => {
    const request = route.request(),
      path = new URL(request.url()).pathname.replace(/^.*\/api\/villages/, "");
    let value = snapshot;
    if (request.method() === "POST") calls.push({ path, body: request.postDataJSON() });
    if (path === "/rooms/active") value = { session: scene };
    else if (path === "/rooms" && request.method() === "POST") {
      snapshot.opening.gatheringSceneId = "gathering-browser";
      scene = {
        version: 1,
        openingReader: version === 2 ? true : undefined,
        id: "gathering-browser",
        sceneRevision: 0,
        placeId: "mill",
        placeName: "The Mill",
        zoneId: "community",
        spaceClass: "community",
        area: "public",
        startedAt: now,
        lastActivityAt: now,
        endedAt: "",
        status: "opening",
        activeIds: snapshot.opening.residentIds,
        participants: snapshot.villagers.map((resident) => ({
          characterId: resident.characterId,
          name: resident.name,
          doing: "at the gathering",
        })),
        lines: [],
        submissions: [],
      };
      value = { session: scene };
    } else if (path === "/rooms/greet") {
      scene.status = "active";
      scene.lines = [
        {
          id: "intro",
          kind: "narration",
          role: "assistant",
          speakerId: "__venue_scene__",
          name: "Narration",
          content: "The neighbours gather around the familiar table.",
          heardBy: scene.activeIds,
          at: now,
        },
      ];
      if (version === 2)
        scene.lines.push(
          ...snapshot.villagers.map((resident, index) => ({
            id: `idea-${resident.characterId}`,
            kind: "dialogue",
            role: "assistant",
            speakerId: resident.characterId,
            name: resident.name,
            content: `I have been thinking about ${proposal(resident.characterId, index).name}. We could make something useful here.`,
            heardBy: scene.activeIds,
            at: now,
          })),
        );
      value = { session: scene };
    } else if (path === "/rooms/end") {
      scene.status = "closed";
      scene.endedAt = now;
      snapshot.opening.stage = "conversations";
      snapshot.opening.action = "Talk to Eli · 1/3";
      value = { session: scene, recordEvents: [] };
    } else if (path === "/rooms/activity") value = { session: scene };
    else if (/\/rooms\/.*\/operation$/.test(path)) value = { operation: null };
    else if (path === "/projects/opening") {
      const body = request.postDataJSON();
      assert.equal(body.openingId, snapshot.opening.id);
      if (body.action === "accept") {
        snapshot.opening.stage = "project";
        snapshot.opening.projectId = "opening-project";
        snapshot.opening.action = "Choose a site";
        snapshot.projects = [
          {
            id: "opening-project",
            title: "Old Theatre",
            kind: "new-venue",
            status: "draft",
            venueId: "",
            progress: 0,
            participantIds: ["mara"],
            updatedAt: now,
            venueDraft: {
              name: "Old Theatre",
              description: proposal("mara", 0).description,
              classes: ["community"],
              position: { x: null, y: null },
            },
            opening: {
              version: 1,
              established: true,
              work: proposal("mara", 0).work,
              firstUse: "Watch a performance together.",
              durationMs: 43_200_000,
              provenance: "",
            },
            lifecycle: {
              version: 2,
              phase: "concept",
              affectedIds: [],
              approvals: [],
              candidates: [],
              builderId: "",
              requirements: [],
              spokenProofs: [],
              sources: [],
              heldSupplies: [],
            },
          },
        ];
        const selected = snapshot.opening.proposals.find((entry) => entry.residentId === body.residentId);
        if (selected?.kind === "renovation") {
          Object.assign(snapshot.projects[0], { kind: "renovation", title: selected.name, venueId: "mill" });
          Object.assign(snapshot.projects[0].lifecycle, {
            phase: "approval",
            affectedIds: ["mara"],
            change: {
              detail: selected.description,
              slot: 0,
              improvement: {
                title: selected.name,
                description: selected.description,
                extraBeds: 0,
                spaceId: "community",
              },
            },
          });
          snapshot.opening.action = "Ask affected villagers";
        }
      } else if (body.action === "skip") {
        snapshot.opening.stage = "ended";
        snapshot.opening.action = "";
        snapshot.opening.outcome = "Skipped";
      }
    } else if (path === "/projects/opening-project/open") {
      const body = request.postDataJSON();
      assert.equal(body.spaces[0].id, "community", "finishing preserves the actual established Zone identity");
      assert.equal(body.form, "A familiar theatre", "player edits survive leaving and returning to finishing");
      snapshot.projects[0].status = "complete";
      snapshot.projects[0].lifecycle.phase = "complete";
      snapshot.opening.stage = "first-use";
      snapshot.opening.action = "Experience its first use";
    } else if (path === "/connections")
      value = { systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "" };
    else if (path === "/lorebooks") value = { books: [] };
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
  });
  await page.route("**/api/connections", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route("http://opening.test/", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<style>:root{font-size:18px;--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}html,body{margin:0;width:100%;height:100%;font-family:Arial}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
    }),
  );
  await page.goto("http://opening.test/");
  await page.addScriptTag({ path: resolve("packages/villages/client.js") });
  return { page, snapshot, calls, errors };
}
try {
  for (const width of [1366, 390]) {
    const reader = await open(width, "gathering", 2);
    await expect.poll(() => reader.calls.filter((entry) => entry.path === "/rooms/greet").length).toBe(1);
    await expect(reader.page.locator(".marinara-capability-villages-composer")).toHaveCount(0);
    for (
      let step = 0;
      step < 30 && !(await reader.page.getByRole("button", { name: "Continue", exact: true }).isVisible());
      step++
    ) {
      await reader.page.getByRole("button", { name: "Next paragraph", exact: true }).click();
    }
    await expect(reader.page.getByRole("button", { name: "Continue", exact: true })).toBeVisible();
    if (output) await reader.page.screenshot({ path: resolve(output, `opening-reader-${width}.png`) });
    await reader.page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(reader.page.getByRole("button", { name: "Talk to Eli · 1/3", exact: true })).toBeVisible();
    await expect(reader.page.locator(".marinara-capability-villages-room-screen")).toHaveCount(0);
    assert.equal(reader.calls.filter((entry) => entry.path === "/rooms/end").length, 1);
    assert.equal(reader.calls.filter((entry) => /turn|send/.test(entry.path)).length, 0);
    assert.deepEqual(reader.errors, []);
    await reader.page.close();

    const gathering = await open(width, "gathering");
    await expect.poll(() => gathering.calls.filter((entry) => entry.path === "/rooms/greet").length).toBe(1);
    assert.equal(gathering.calls.filter((entry) => entry.path === "/rooms").length, 1);
    await expect(
      gathering.page.getByText("The neighbours gather around the familiar table.", { exact: true }).first(),
    ).toBeVisible();
    assert.equal(gathering.calls.filter((entry) => entry.path === "/projects/opening").length, 0);
    if (output) await gathering.page.screenshot({ path: resolve(output, `opening-gathering-${width}.png`) });
    assert.deepEqual(gathering.errors, []);
    await gathering.page.close();

    const improvement = await open(width, "conversations", 2);
    improvement.snapshot.opening.heardIds = [...improvement.snapshot.opening.residentIds];
    improvement.snapshot.opening.proposals = improvement.snapshot.opening.residentIds.map(proposal);
    Object.assign(improvement.snapshot.opening.proposals[0], {
      kind: "renovation",
      name: "Reading corner",
      description: "A shared reading corner for quiet afternoons.",
      work: "Prepare the corner, fit shelves and seating, and finish the surfaces.",
      renovation: {
        venueId: "mill",
        spaceId: "community",
        slot: 0,
        title: "Reading corner",
        description: "Add a shared reading corner",
      },
    });
    await improvement.page.getByRole("button", { name: /^(Open settings menu|More)$/ }).click();
    await improvement.page.getByRole("button", { name: /^Projects \(/ }).click();
    if (width < 700) await improvement.page.getByRole("button", { name: /Mara.*Reading corner/ }).click();
    await expect(improvement.page.getByText("Improvement", { exact: true })).toBeVisible();
    await improvement.page.getByRole("button", { name: "Accept proposal", exact: true }).click();
    await expect(
      improvement.page.getByRole("heading", { name: "People affected by this change", exact: true }),
    ).toBeVisible();
    await expect(improvement.page.getByRole("button", { name: "Place on Village map", exact: true })).toHaveCount(0);
    if (output) await improvement.page.screenshot({ path: resolve(output, `opening-improvement-${width}.png`) });
    improvement.snapshot.opening.ordinaryProjectsUnlocked = true;
    improvement.snapshot.projects[0].status = "building";
    improvement.snapshot.projects[0].lifecycle.phase = "construction";
    improvement.snapshot.projects[0].lifecycle.workOrder = {
      startsAt: now,
      completesAt: new Date(Date.parse(now) + 43_200_000).toISOString(),
      remainingMs: 43_200_000,
      pausedAt: "",
    };
    await improvement.page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await improvement.page.getByRole("button", { name: "All Projects", exact: true }).click();
    await expect(improvement.page.getByRole("button", { name: /NEW VENUE.*Imagine a new place/ })).toBeVisible();
    assert.deepEqual(improvement.errors, []);
    await improvement.page.close();

    const { page, snapshot, calls, errors } = await open(width, "conversations");
    await expect(page.getByRole("button", { name: "Talk to Eli · 1/3", exact: true })).toBeVisible();
    await page.getByRole("button", { name: /^(Open settings menu|More)$/ }).click();
    await page.getByRole("button", { name: /^Projects \(/ }).click();
    await expect(page.getByRole("heading", { name: "Opening Project", exact: true })).toBeVisible();
    if (width < 700) await page.getByRole("button", { name: /Mara.*Old Theatre/ }).click();
    await expect(page.getByRole("button", { name: "Accept proposal", exact: true })).toBeDisabled();
    await expect(page.getByRole("heading", { name: "Sky Terrace", exact: true })).toHaveCount(0);
    snapshot.opening.heardIds = [...snapshot.opening.residentIds];
    snapshot.opening.proposals = snapshot.opening.residentIds.map(proposal);
    snapshot.opening.action = "Choose a proposal";
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(page.getByRole("button", { name: "Accept proposal", exact: true })).toBeEnabled();
    if (output) await page.screenshot({ path: resolve(output, `opening-proposals-${width}.png`) });
    await page.getByRole("button", { name: "Accept proposal", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Choose a site", exact: true })).toBeVisible();
    assert.equal(
      calls.filter((entry) => entry.path === "/projects/opening" && entry.body.action === "accept").length,
      1,
    );
    await expect(page.getByRole("button", { name: "Place on Village map", exact: true })).toBeVisible();
    const card = page.locator(".marinara-capability-villages-project-record-detail");
    const box = await card.boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= width + 1, "Project detail fits the viewport");
    if (output) await page.screenshot({ path: resolve(output, `opening-project-${width}.png`) });
    // Exercise the real finishing workspace after earlier Project actions created its draft.
    const venue = {
      ...structuredClone(snapshot.settings.venues[0]),
      id: "theatre",
      name: "Old Theatre",
      form: "An existing theatre",
      classes: ["community"],
      constructionStatus: "complete",
      description: "A familiar entrance",
      spaces: [
        {
          id: "community",
          name: "Auditorium",
          purpose: "Performances",
          venueClass: "community",
          description: "A familiar auditorium",
          image: null,
          state: {
            items: ["Borrowed chair"],
            publicFacts: [],
            features: [],
            traces: [],
            condition: "Open",
            updatedAt: now,
          },
        },
      ],
      privateSpaces: [],
    };
    snapshot.settings.venues.push(venue);
    snapshot.projects[0].venueId = venue.id;
    snapshot.projects[0].status = "finishing";
    snapshot.projects[0].lifecycle.phase = "finishing";
    snapshot.opening.action = "Open the Venue";
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await page.getByRole("button", { name: "Visit finished Venue", exact: true }).click();
    await expect(page.getByLabel("Physical form", { exact: true })).toHaveValue("An existing theatre");
    await page.getByLabel("Physical form", { exact: true }).fill("A familiar theatre");
    await page.getByRole("button", { name: "Back to Project", exact: true }).click();
    await page.getByRole("button", { name: "Visit finished Venue", exact: true }).click();
    await expect(page.getByLabel("Physical form", { exact: true })).toHaveValue("A familiar theatre");
    await expect(page.getByRole("button", { name: "Open Venue", exact: true })).toBeEnabled();
    if (output) await page.screenshot({ path: resolve(output, `opening-finish-${width}.png`) });
    await page.getByRole("button", { name: "Open Venue", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Venue open", exact: true })).toBeVisible();
    assert.equal(snapshot.opening.stage, "first-use");
    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Skip opening", exact: true }).click();
    await page.getByRole("button", { name: "All Projects", exact: true }).click();
    await expect(page.getByRole("button", { name: /RENOVATION.*Change an existing Venue/ })).toBeVisible();
    assert.equal(snapshot.projects.length, 1, "skipping preserves the real Project");
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    "Mocked desktop/phone opening passed: automatic gathering, revealed proposals, roster gate, selection, Project controls and skip unlocks.",
  );
} finally {
  await browser.close();
}
