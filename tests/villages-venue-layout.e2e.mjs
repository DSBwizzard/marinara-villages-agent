import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { expect } from "./fixtures/fast-browser-expect.mjs";
import { snapshot as fixture } from "./fixtures/villages-scene-browser.fixture.mjs";
import { verifyVenueScreenLifetimes } from "./fixtures/villages-venue-screen-lifetime.fixture.mjs";
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
try {
  for (const width of [1366, 390])
    for (const layout of ["exterior", "common", "private", "both"]) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, hasTouch: width === 390 });
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
      snapshot.settings.venues.push(site);
      snapshot.projects = [
        {
          id: "tent-build",
          kind: "new-venue",
          title: "Canvas Tent",
          venueId: "tent",
          status: "finishing",
          progress: 100,
          participantIds: [],
          updatedAt: new Date().toISOString(),
          venueDraft: { name: "Canvas Tent", classes: site.classes, description: "A canvas shelter" },
          lifecycle: {
            phase: "finishing",
            targetVenueId: "tent",
            change: null,
            affectedIds: [],
            approvals: [],
            candidates: [],
            builderId: "mara",
            requirements: [],
            builderAgreement: null,
            checklistAccepted: true,
          },
        },
      ];
      let submitted;
      await page.route("**/api/villages**", async (route) => {
        const path = new URL(route.request().url()).pathname;
        if (path.endsWith("/projects/tent-build/open")) submitted = route.request().postDataJSON();
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
      await page.route("http://layout.test/", (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/html",
          body: "<style>:root{font-size:20px;--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}html,body{margin:0;width:100%;height:100%;font-family:Arial}marinara-capability-villages{display:block;width:100%;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
        }),
      );
      await page.goto("http://layout.test/");
      await page.addScriptTag({ path: resolve("packages/villages/client.js") });
      await page.getByRole("button", { name: /^(Open settings menu|More)$/ }).click();
      await page.getByRole("button", { name: "Projects (1)", exact: true }).click();
      await page.getByRole("button", { name: /NEW VENUE.*Canvas Tent/ }).click();
      await page.getByRole("button", { name: "Visit finished Venue", exact: true }).click();
      const editor = page.locator(".marinara-capability-villages-project-finish-visit");
      await editor.getByLabel("Physical form", { exact: true }).fill("A tent, or a mat beneath a tree");
      await editor.getByLabel("Entrance appearance", { exact: true }).fill("A sheltered patch beneath a tree.");
      await expect(editor.getByRole("button", { name: "Open Venue", exact: true })).toBeDisabled();
      if (layout === "exterior") await editor.getByRole("button", { name: "Use Entrance only", exact: true }).click();
      if (layout === "common" || layout === "both") {
        await editor.getByRole("button", { name: "Add Zone", exact: true }).click();
        await editor.getByLabel("Zone name", { exact: true }).first().fill("Workshop");
        await editor.getByLabel("Zone used for", { exact: true }).first().fill("Making things");
        await editor.getByLabel("Zone appearance", { exact: true }).first().fill("A canvas workshop.");
        await editor
          .getByLabel(/^Zone role/)
          .first()
          .selectOption("workplace");
      }
      if (layout === "private" || layout === "both") {
        await editor.getByRole("button", { name: "Add personal Zone", exact: true }).click();
        await editor.getByLabel("Zone name", { exact: true }).last().fill("Sleeping alcove");
        await editor.getByLabel("Zone used for", { exact: true }).last().fill("Sleeping");
        await expect(editor.getByText(/Appearance is prepared for the assigned resident/)).toBeVisible();
      }
      await editor.getByRole("button", { name: "Open Venue", exact: true }).click();
      await expect.poll(() => submitted).toBeTruthy();
      assert.equal(submitted.layout, layout);
      assert.equal(submitted.layoutVersion, 1);
      assert.equal(submitted.spaces.length, Number(layout === "common" || layout === "both"));
      assert.equal(submitted.privateSpaces.length, Number(layout === "private" || layout === "both"));
      if (submitted.spaces.length) assert.equal(submitted.spaces[0].venueClass, "workplace");
      else {
        assert.equal(submitted.interiorDescription, undefined);
        assert.equal(submitted.interiorImage, undefined);
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
  await verifyVenueScreenLifetimes(browser);
  console.log(
    "Desktop and phone new-venue layouts: Entrance-only and multiple Zone selection, separated name/use/appearance, class association, and submissions passed.",
  );
} finally {
  await browser.close();
}
