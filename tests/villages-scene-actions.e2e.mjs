import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot as fixture, residents, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
try {
  for (const width of [1366, 390, 320]) {
    const snapshot = structuredClone(fixture);
    snapshot.villagers = residents.slice(0, 1);
    snapshot.settings.venues[0].zones = [
      { id: "exterior", name: "Exterior", kind: "exterior", venueClass: "workplace", state: {}, seen: true },
      { id: "hall", name: "Common Space", kind: "public", venueClass: "gathering", state: {}, seen: true },
    ];
    let scene = {
      id: "actions",
      placeId: "mill",
      placeName: "The Mill",
      area: "public",
      zoneId: "hall",
      version: 1,
      sceneRevision: 1,
      status: "active",
      memoryMode: "live",
      startedAt: now,
      lastActivityAt: now,
      activeIds: ["mara"],
      participants: [{ characterId: "mara", name: "Mara", doing: "listening" }],
      submissions: [],
      lines: [
        {
          id: "opening",
          kind: "dialogue",
          role: "assistant",
          speakerId: "mara",
          name: "Mara",
          content: "Welcome to the mill.",
          at: now,
          heardBy: ["mara"],
        },
      ],
    };
    let releaseContact,
      heldContact,
      lastContact,
      moves = 0;
    const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: width === 390 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await context.route("http://actions.test/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7;--secondary:#384253}html,body{margin:0;height:100%;background:var(--background);color:var(--foreground);font-family:Arial}marinara-capability-villages{display:block;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await context.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = snapshot;
      if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) value = { session: scene };
      else if (path.endsWith("/rooms/zone")) {
        const body = route.request().postDataJSON();
        if (body.expectedSceneRevision !== scene.sceneRevision)
          return route.fulfill({
            status: 409,
            contentType: "application/json",
            body: JSON.stringify({ code: "SCENE_STALE", error: "The Scene changed. Review it before moving." }),
          });
        moves++;
        scene = {
          ...scene,
          sceneRevision: scene.sceneRevision + 1,
          zoneId: body.zoneId,
          area: "outside",
          activeIds: [],
          lines: [
            ...scene.lines,
            {
              id: "transition",
              role: "assistant",
              kind: "narration",
              speakerId: "__venue_scene__",
              name: "Narration",
              content: "You move from Common Space to Exterior.",
              at: now,
              heardBy: ["mara"],
            },
          ],
        };
        value = { session: scene };
      } else if (path.endsWith("/rooms/turn")) {
        lastContact = route.request().postDataJSON();
        releaseContact?.();
        await heldContact;
        scene = {
          ...scene,
          sceneRevision: scene.sceneRevision + 1,
          lines: [
            ...scene.lines,
            {
              id: "contact-answer",
              role: "assistant",
              kind: "narration",
              speakerId: "__venue_scene__",
              name: "Narration",
              content: "No answer.",
              heardBy: ["mara"],
              at: now,
            },
          ],
        };
        value = { session: scene, recordEvents: [] };
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://actions.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const composer = page.getByRole("textbox", { name: "Message at The Mill" });
    await expect(composer).toBeVisible();
    await composer.fill("Keep this draft");
    await page.getByRole("button", { name: "Mode: Say / Do. Choose mode" }).click();
    assert.deepEqual(
      await page.getByRole("menu", { name: "Scene mode" }).getByRole("menuitemradio").allTextContents(),
      ["Say / Do", "Move", "Contact", "Conclude"],
    );
    await page.getByRole("menuitemradio", { name: "Contact", exact: true }).click();
    await expect(composer).toHaveValue("Keep this draft");
    await page.getByLabel("Contact Zone", { exact: true }).selectOption("exterior");
    let finishContact;
    heldContact = new Promise((done) => {
      finishContact = done;
    });
    const contactStarted = new Promise((done) => {
      releaseContact = done;
    });
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await contactStarted;
    await page.getByRole("button", { name: "Mode: Contact. Choose mode", exact: true }).click();
    await expect(page.getByRole("menuitemradio", { name: "Move", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Mode: Contact. Choose mode", exact: true }).click();
    assert.equal(lastContact.mode, "contact");
    assert.equal(lastContact.contact.kind, "call");
    assert.equal(lastContact.contact.boundaryZoneId, "exterior");
    finishContact();
    await expect(composer).toBeEnabled();
    await expect(page.getByLabel("Contact Zone", { exact: true })).toHaveValue("exterior");
    const next = page.getByRole("button", { name: "Next paragraph", exact: true });
    while (await next.isEnabled()) await next.click();
    await composer.fill("Draft survives Zone changes");
    scene.sceneRevision++;
    await page.getByRole("button", { name: "Mode: Contact. Choose mode", exact: true }).click();
    await page.getByRole("menuitemradio", { name: "Move", exact: true }).click();
    await expect(composer).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Send", exact: true })).toBeDisabled();
    await page.getByLabel("Move to Zone").selectOption("exterior");
    assert.equal(moves, 0, "selection alone never moves");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(page.getByRole("alert").last()).toContainText("Scene changed");
    assert.equal(moves, 0);
    await expect(composer).toHaveCount(0);
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(page.getByRole("region", { name: "Current paragraph" })).toContainText(
      "You move from Common Space to Exterior.",
    );
    await expect(composer).toHaveValue("Draft survives Zone changes");
    assert.equal(moves, 1);
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await expect(page.getByRole("region", { name: "Current paragraph" })).toContainText(
      "You move from Common Space to Exterior.",
    );
    assert.equal(moves, 1);
    assert.equal(scene.lines.filter((line) => line.id === "transition").length, 1);
    await page.getByRole("button", { name: "Mode: Say / Do. Choose mode", exact: true }).click();
    await page.getByRole("menuitemradio", { name: "Contact", exact: true }).click();
    await expect(page.getByLabel("Contact Zone")).toHaveValue("");
    if (process.env.VILLAGES_VISUAL_OUTPUT)
      await page.screenshot({ path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, "scene-actions-" + width + ".png") });
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log(
    "Scene actions browser: desktop/mobile modes, doorway targeting, busy/stale movement, drafts and restored transitions passed",
  );
} finally {
  await browser.close();
}
