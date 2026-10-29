import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
// Test cases: venues/layout/exterior, venues/layout/common, venues/layout/private, venues/layout/both, venues/screen-lifetimes, venues/layout-draft
import { runCase, wantsCase } from "../scripts/test-cases.mjs";
import { resolve } from "node:path";
import { chromium } from "./fixtures/browser-diagnostics.mjs";
import { expect } from "./fixtures/fast-browser-expect.mjs";
import { snapshot as fixture } from "./fixtures/villages-scene-browser.fixture.mjs";
import { verifyVenueScreenLifetimes } from "./fixtures/villages-venue-screen-lifetime.fixture.mjs";
import { verifyVenueLayoutDraft } from "./fixtures/villages-venue-layout-draft.fixture.mjs";
const browser = await chromium.launch({
  headless: true,
});
try {
  for (const width of [1366, 390])
    for (const layout of ["exterior", "common", "private", "both"]) {
      if (!wantsCase("venues/layout/" + layout + "/" + width)) continue;
      const page = await browser.newPage({ viewport: { width, height: 844 }, hasTouch: width === 390 });
      await mockEngineLookups(page);
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const snapshot = structuredClone(fixture);
      const site = {
        ...snapshot.settings.venues[0],
        id: "tent",
        name: "Canvas Tent",
        classes: ["residence", "workplace"],
        constructionStatus: "worksite",
        residentIds: [],
        spaces: [],
        privateSpaces: [],
        zones: [],
        occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      };
      snapshot.projects = [
        {
          id: "tent-build",
          kind: "new-venue",
          title: "Canvas Tent",
          venueId: "",
          status: "planning",
          progress: 0,
          participantIds: [],
          updatedAt: new Date().toISOString(),
          venueDraft: {
            name: "Canvas Tent",
            classes: site.classes,
            description: "A canvas shelter",
            position: { x: null, y: null },
          },
          lifecycle: {
            phase: "planning",
            revision: 1,
            targetVenueId: "",
            change: null,
            affectedIds: [],
            approvals: [],
            candidates: [],
            builderId: "mara",
          },
        },
      ];
      let submitted;
      await page.route("**/api/villages**", async (route) => {
        const path = new URL(route.request().url()).pathname;
        if (path.endsWith("/projects/tent-build/plan")) submitted = route.request().postDataJSON();
        const value = path.endsWith("/connections")
          ? { systemConnectionId: "talk", narrationConnectionId: "talk", imageConnectionId: "image" }
          : path.endsWith("/lorebooks")
            ? { books: [] }
            : snapshot;
        await fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(value) });
      });
      await page.route("**/api/connections", (route) =>
        fulfill(route, {
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([{ id: "talk", provider: "language", name: "Talk", defaultForAgents: true }]),
        }),
      );
      await page.route("http://layout.test/", (route) =>
        fulfill(route, {
          status: 200,
          contentType: "text/html",
          body: "<style>:root{font-size:20px;--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}html,body{margin:0;width:100%;height:100%;font-family:Arial}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
        }),
      );
      await page.goto("http://layout.test/");
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await page.getByRole("button", { name: /^(Open settings menu|More)$/ }).click();
      await page.getByRole("button", { name: "Projects", exact: true }).click();
      await page.getByRole("button", { name: /Canvas Tent/ }).click();
      const editor = page.locator("main article");
      await page.getByRole("tab", { name: "Design & Spaces", exact: true }).click();
      await editor.getByLabel("Physical design", { exact: true }).fill("A tent, or a mat beneath a tree");
      await page.getByRole("button", { name: "Zones", exact: true }).click();
      if (width < 700)
        await editor
          .getByRole("navigation", { name: "Project Zones" })
          .getByRole("button", { name: /Entrance/ })
          .click();
      await editor.getByLabel("Entrance", { exact: true }).fill("A sheltered patch beneath a tree.");
      if (width < 700) await editor.getByRole("button", { name: "‹ Zones", exact: true }).click();
      if (layout === "common" || layout === "both") {
        await editor.getByRole("button", { name: "Add Zone", exact: true }).click();
        await editor.getByLabel("Zone Name", { exact: true }).first().fill("Workshop");
        await editor.getByLabel("Zone Used For", { exact: true }).first().fill("Making things");
        if (width < 700) await editor.getByRole("button", { name: "Appearance", exact: true }).click();
        await editor.getByLabel("Zone Appearance", { exact: true }).first().fill("A canvas workshop.");
        if (width < 700) await editor.getByRole("button", { name: "Options", exact: true }).click();
        await editor
          .getByRole("group", { name: "Zone Class" })
          .getByRole("button", { name: "Workplace", exact: true })
          .click();
      }
      if (layout === "private" || layout === "both") {
        if (width < 700 && layout === "both")
          await editor.getByRole("button", { name: "‹ Zones", exact: true }).click();
        await editor.getByRole("button", { name: "Add private Zone", exact: true }).click();
        await editor.getByLabel("Zone Name", { exact: true }).last().fill("Sleeping alcove");
        await editor.getByLabel("Zone Used For", { exact: true }).last().fill("Sleeping");
        if (width < 700) await editor.getByRole("button", { name: "Appearance", exact: true }).click();
        await editor.getByLabel("Room Specification", { exact: true }).fill("A quiet canvas sleeping alcove.");
        await expect(editor.getByText(/Private contents stay hidden/)).toBeVisible();
      }
      await editor.getByRole("button", { name: "Save design", exact: true }).click();
      await expect.poll(() => submitted).toBeTruthy();
      assert.equal(submitted.layout, layout);
      assert.equal(submitted.layoutVersion, 1);
      assert.equal(submitted.spaces.length, Number(layout === "common" || layout === "both"));
      assert.equal(submitted.privateSpaces.length, Number(layout === "private" || layout === "both"));
      if (submitted.privateSpaces.length)
        assert.equal(submitted.privateSpaces[0].roomSpecification, "A quiet canvas sleeping alcove.");
      if (submitted.spaces.length) assert.equal(submitted.spaces[0].venueClass, "workplace");
      else {
        assert.equal(submitted.interiorDescription, undefined);
        assert.equal(submitted.interiorImage, undefined);
      }
      assert.deepEqual(errors, []);
      await page.close();
      await runCase("venues/layout/" + layout + "/" + width, async () => {});
    }
  await runCase("venues/screen-lifetimes", () => verifyVenueScreenLifetimes(browser));
  await runCase("venues/layout-draft", () => verifyVenueLayoutDraft(browser));
  console.log("Selected Venue layout and screen-lifetime scenarios passed; the case report records exact coverage.");
} finally {
  await browser.close();
}
