// Test cases: places/desktop, places/phone, places/social-project
import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, expect, fulfill, mockEngineLookups, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { currentProject, openProjectPage, projectSnapshot } from "./fixtures/villages-project-browser.fixture.mjs";
import { mkdir } from "node:fs/promises";
const bundle = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `import {createRoot} from "react-dom/client";import {PlacesDirectory} from "./packages/villages/src/client/features/exploration/PlacesDirectory.js";import {syncVillagesStyles} from "./packages/villages/src/client/entry/styles.js";syncVillagesStyles();createRoot(document.getElementById("root")).render(<PlacesDirectory snapshot={window.snapshot} mapId="map" onClose={()=>window.closed=true} onVisit={place=>window.visited=place.id} onProject={(_,id)=>window.project=id} onPlace={place=>window.placed=place.id}/>);`,
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
await mkdir(".build-tmp/places", { recursive: true });
await withBrowser(browser, async () => {
  for (const [name, width] of [
    ["desktop", 1440],
    ["phone", 390],
  ])
    await runCase("places/" + name, async () => {
      const page = await browser.newPage({ viewport: { width, height: 800 } });
      await mockEngineLookups(page);
      const snapshot = projectSnapshot();
      snapshot.worldScope = "world:test";
      const place = {
        id: "place:lantern",
        revision: 1,
        name: "The Lantern",
        description: "A restaurant at the square.",
        mapId: "map",
        x: null,
        y: null,
        report: false,
        prepared: false,
        location: { ...snapshot.settings.venues[0], id: "place:lantern", name: "The Lantern" },
      };
      let generations = 0;
      const bodies = [];
      const explorations = [];
      await page.route("http://places.test/", (route) =>
        fulfill(route, {
          status: 200,
          contentType: "text/html",
          body: '<style>html,body{margin:0;background:#16233a;color:#eee;font-family:Arial}:root{--background:#16233a;--foreground:#eee;--border:#718297;--popover:#24334c;--muted-foreground:#ddd}#root{height:100vh}</style><marinara-capability-villages><div class="marinara-capability-villages-root" id="root"></div></marinara-capability-villages>',
        }),
      );
      await page.route("**/api/villages/**", async (route) => {
        const url = new URL(route.request().url()),
          path = url.pathname.replace(/^.*\/api\/villages/, "");
        let value;
        if (path === "/places") value = { items: [place], nextCursor: null };
        else if (path === "/places/explore") {
          explorations.push(route.request().postDataJSON());
          value = { status: explorations.at(-1).intent === "A duck" ? "ready" : "failed", placeId: "" };
        } else if (path === "/places/place%3Alantern" || path === "/places/place:lantern") value = place;
        else if (path.endsWith("/prepare")) {
          generations++;
          place.prepared = true;
          value = { id: "prepare", attempt: 1, status: "ready", kind: "prepare", placeId: place.id };
        } else if (path === "/projects/establishments/place%3Alantern") {
          const body = route.request().postDataJSON();
          bodies.push(body);
          value = {
            ...snapshot,
            projects: [...snapshot.projects, { ...currentProject("new-establishment"), kind: "establishment" }],
          };
        } else throw Error("Unexpected Places route " + path);
        await fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(value) });
      });
      await page.goto("http://places.test/");
      await page.evaluate((value) => (window.snapshot = value), snapshot);
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      await expect(page.getByRole("dialog", { name: "Discover Places" })).toBeVisible();
      const explore = page.getByRole("button", { name: "Explore", exact: true });
      await explore.click();
      await expect.poll(() => explorations.length).toBe(1);
      await expect(explore).toBeEnabled();
      await page.getByLabel("Explore", { exact: true }).fill("A duck");
      await explore.click();
      await expect.poll(() => explorations.length).toBe(2);
      await expect(explore).toBeEnabled();
      assert.deepEqual(
        explorations.map((request) => request.intent),
        ["", "A duck"],
      );
      await expect(page.getByRole("alert")).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: /Retry request|Dismiss request|Resume saved request/ }),
      ).toHaveCount(0);
      assert.deepEqual(
        await page.evaluate(() =>
          Object.keys(sessionStorage).filter((key) => key.startsWith("villages-place-request:")),
        ),
        [],
      );
      await page.getByRole("button", { name: "The Lantern", exact: true }).click();
      assert.equal(generations, 0, "Browsing makes no model request");
      await page.getByRole("button", { name: "Prepare and visit", exact: true }).click();
      await expect.poll(() => page.evaluate(() => window.visited)).toBe(place.id);
      assert.equal(generations, 1);
      await page.getByRole("button", { name: "Visit", exact: true }).click();
      assert.equal(generations, 1, "Repeat visit reuses prepared layout");
      await page.getByRole("button", { name: "Establish as Venue", exact: true }).click();
      await page.getByLabel("Ongoing village use").fill("Hold a weekly village supper");
      await page.getByLabel("Objectives · one per line").fill("Agree a trial supper");
      await page.screenshot({ path: ".build-tmp/places/" + name + ".png", fullPage: true });
      assert(
        await page.getByRole("dialog").evaluate((element) => element.getBoundingClientRect().width <= innerWidth),
        "The dialog fits its viewport",
      );
      await page.getByRole("button", { name: "Create establishment draft", exact: true }).click();
      await expect.poll(() => page.evaluate(() => window.project)).toBe("new-establishment");
      assert.equal(bodies[0].establishment.physical, false);
      assert.deepEqual(bodies[0].establishment.objectives, ["Agree a trial supper"]);
      await page.close();
    });
  await runCase("places/social-project", async () => {
    const snapshot = projectSnapshot(),
      project = currentProject("establish", "renovation");
    project.kind = "establishment";
    project.title = "Establish The Lantern";
    project.venueId = "place:lantern";
    project.place = { ...snapshot.settings.venues[0], id: project.venueId };
    project.lifecycle.builderId = "";
    project.lifecycle.candidates = [];
    project.establishment = {
      goal: "A weekly village supper",
      physical: false,
      zoneIds: ["exterior"],
      objectives: [{ id: "meal", text: "Agree a trial supper", met: true, evidence: [] }],
    };
    snapshot.projects = [project];
    snapshot.settings.venues = [];
    const f = await openProjectPage(browser, 390, snapshot, async (path, _body, state) => {
      if (path.endsWith("/start")) {
        state.projects[0].status = "working";
        state.projects[0].lifecycle.phase = "working";
      }
      if (path.endsWith("/complete")) {
        state.projects[0].status = "complete";
        state.projects[0].lifecycle.phase = "complete";
      }
    });
    await f.page.getByRole("button", { name: /Establish The Lantern/ }).click();
    await expect(f.page.getByRole("button", { name: "Start establishment", exact: true })).toBeEnabled();
    await f.page.getByRole("button", { name: "Start establishment", exact: true }).click();
    await f.page.getByRole("button", { name: "Progress", exact: true }).click();
    await expect(f.page.getByRole("button", { name: "Complete establishment", exact: true })).toBeEnabled();
    await f.page.getByRole("button", { name: "Complete establishment", exact: true }).click();
    await expect(f.page.getByRole("button", { name: "Visit Venue", exact: true })).toBeVisible();
    await f.page.close();
  });
});
