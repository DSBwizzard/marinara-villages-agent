import { mockEngineLookups, fulfill, abort } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as fixture, residents, now } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
try {
  for (const width of [1366, 390, 320]) {
    const snapshot = structuredClone(fixture);
    snapshot.villagers = residents.slice(0, 1);
    snapshot.settings.venues[0].zones = [
      { id: "exterior", name: "Exterior", kind: "exterior", venueClass: "workplace", state: {}, seen: true },
      { id: "hall", name: "Common Space", kind: "public", venueClass: "community", state: {}, seen: true },
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
      stagingVersion: 1,
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
      lastLeave,
      moves = 0;
    let staleMove = true;
    const navigation = new Map();
    const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: width === 390 });
    await mockEngineLookups(context);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await context.route("http://actions.test/", (route) =>
      fulfill(route, {
        status: 200,
        contentType: "text/html",
        body: `<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7;--secondary:#384253}html,body{margin:0;height:100%;background:var(--background);color:var(--foreground);font-family:Arial}marinara-capability-villages{display:block;height:calc(100% - 180px)}</style><header style="height:180px"></header><marinara-capability-villages></marinara-capability-villages><script>document.querySelector('marinara-capability-villages').capabilityProps={startScene:async()=>null}</script>`,
      }),
    );
    await context.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = snapshot;
      if (path.endsWith("/spinoffs/active")) value = { spinoff: null };
      else if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) value = { session: scene };
      else if (path.endsWith("/rooms/zone")) {
        const body = route.request().postDataJSON();
        if (staleMove || body.expectedSceneRevision !== scene.sceneRevision) {
          staleMove = false;
          return fulfill(route, {
            status: 409,
            contentType: "application/json",
            body: JSON.stringify({ code: "SCENE_STALE", error: "The Scene changed. Review it before moving." }),
          });
        }
        moves++;
        scene = {
          ...scene,
          sceneRevision: scene.sceneRevision + 1,
          zoneId: body.zoneId,
          area: "outside",
          activeIds: body.zoneId === "hall" ? ["mara"] : [],
          operation: { id: body.operationId, kind: "move", status: "complete", input: { zoneId: body.zoneId } },
        };
        navigation.set(body.operationId, scene.operation);
        if (width === 320) return abort(route, "failed");
        value = { session: scene };
      } else if (path.includes("/operations/")) {
        value = { operation: navigation.get(decodeURIComponent(path.split("/").at(-1))) ?? null };
      } else if (path.endsWith("/operation")) {
        value = { operation: scene.operation ?? null };
      } else if (path.endsWith("/rooms/leave")) {
        lastLeave = route.request().postDataJSON();
        scene = { ...scene, status: "closed" };
        value = { session: scene, recordEvents: [] };
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
              content: "No answer.\n\n" + "You wait by the quiet doorway. ".repeat(75),
              heardBy: ["mara"],
              at: now,
            },
          ],
        };
        value = { session: scene, recordEvents: [] };
      }
      await fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://actions.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const composer = page.getByRole("textbox", { name: "Message at The Mill" });
    await expect(composer).toBeVisible();
    await composer.fill("Keep this draft");
    await expect(page.getByRole("button", { name: "Start a spinoff", exact: false })).toHaveCount(0);
    const composerBefore = await composer.boundingBox();
    assert.ok(composerBefore && composerBefore.y + composerBefore.height <= 844, "text entry fits the host panel");
    await page.getByRole("button", { name: "Venue actions", exact: true }).click();
    await page.getByRole("menuitem", { name: "Start a spinoff", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Spinoff", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Spinoff", exact: true })).toHaveCount(0);
    await expect(composer).toHaveValue("Keep this draft");
    assert.deepEqual(await composer.boundingBox(), composerBefore, "opening and cancelling preserves Scene geometry");
    if (process.env.VILLAGES_VISUAL_OUTPUT)
      await page.screenshot({ path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, "spinoff-cancel-" + width + ".png") });
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
    await expect(composer).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Mode:.*Choose mode/ })).toHaveCount(0);
    await expect(page.getByLabel("Move to Zone")).toHaveCount(0);
    assert.equal(lastContact.mode, "contact");
    assert.equal(lastContact.contact.kind, "call");
    assert.equal(lastContact.contact.boundaryZoneId, "exterior");
    finishContact();
    await expect(page.getByRole("region", { name: "Current paragraph" })).toContainText("quiet doorway");
    const next = page.getByRole("button", { name: "Next paragraph", exact: true });
    while (await next.isEnabled()) {
      await expect(page.getByLabel("Move to Zone")).toHaveCount(0);
      await expect(composer).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Send", exact: true })).toHaveCount(0);
      await next.click();
    }
    await expect(page.getByLabel("Move to Zone")).toHaveCount(0);
    await expect(composer).toBeVisible();
    await page.getByRole("button", { name: "Mode: Contact. Choose mode", exact: true }).click();
    await page.getByRole("menuitemradio", { name: "Say / Do", exact: true }).click();
    const preservedDraft = "Draft survives Zone changes. ".repeat(35);
    await composer.fill(preservedDraft);
    const dockAtBottom = async (selector) => {
      const box = await page.locator(selector).boundingBox();
      assert.ok(box && Math.abs(box.y + box.height - 844) <= 1, "bottommost control has no padding below it");
    };
    await dockAtBottom('[class$="-chat-input"]');
    if (process.env.VILLAGES_VISUAL_OUTPUT)
      await page.screenshot({ path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, "chat-ready-" + width + ".png") });
    await page.getByRole("button", { name: "Previous paragraph", exact: true }).click();
    await expect(composer).toHaveCount(0);
    await dockAtBottom('[class$="-chat-vn-card"]');
    if (process.env.VILLAGES_VISUAL_OUTPUT)
      await page.screenshot({ path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, "chat-reading-" + width + ".png") });
    while (await next.isEnabled()) await next.click();
    await expect(composer).toHaveValue(preservedDraft);
    const selectMove = async () => {
      await page.getByRole("button", { name: /Mode:.*Choose mode/ }).click();
      await page.getByRole("menuitemradio", { name: "Move", exact: true }).click();
      await expect(composer).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Send", exact: true })).toHaveCount(0);
      await dockAtBottom('[class$="-chat-input"]');
    };
    scene.sceneRevision++;
    const lineCount = scene.lines.length;
    await selectMove();
    if (process.env.VILLAGES_VISUAL_OUTPUT)
      await page.screenshot({ path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, "chat-move-" + width + ".png") });
    await page.getByLabel("Move to Zone").selectOption("exterior");
    await page.getByRole("button", { name: /^1 Scene error$/ }).click();
    await page.getByRole("region", { name: "Scene errors" }).locator("summary").first().click();
    await expect(page.getByText(/Scene changed/).last()).toBeVisible();
    await page.getByRole("button", { name: "Close Scene errors" }).click();
    assert.equal(moves, 0);
    await expect(composer).toHaveCount(0);
    await page.getByLabel("Move to Zone").selectOption("exterior");
    await expect(page.getByRole("button", { name: "Mode: Say / Do. Choose mode", exact: true })).toBeVisible();
    await expect(composer).toHaveValue(preservedDraft);
    assert.equal(moves, 1);
    assert.equal(scene.lines.length, lineCount);
    assert.equal(scene.submissions.length, 0);
    for (const zoneId of ["hall", "exterior", "hall", "exterior"]) {
      await selectMove();
      await page.getByLabel("Move to Zone").selectOption(zoneId);
      await expect(composer).toHaveValue(preservedDraft);
      await expect(page.getByLabel("Move to Zone")).toHaveCount(0);
      await expect(page.locator('[class$="-chat-cast-person"]')).toHaveCount(zoneId === "hall" ? 1 : 0);
    }
    assert.equal(moves, 5, "selection immediately navigates repeatedly without Send");
    await expect(composer).toHaveValue(preservedDraft);
    assert.ok(await composer.evaluate((field) => field.scrollHeight > field.clientHeight));
    await expect(composer).toHaveCSS("overflow-y", "auto");
    const frame = await page.locator('[class$="-chat-input"]').boundingBox();
    const row = await page.locator('[class$="-composer-row"]').boundingBox();
    assert.ok(frame && row && frame.width >= row.width - 2, "composer uses full row width");
    assert.equal(await page.locator("[data-scene-scope]").count(), 0);
    await page.reload();
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    await expect(page.getByRole("region", { name: "Current paragraph" })).toBeVisible();
    while (await next.isEnabled()) await next.click();
    await expect(composer).toBeVisible();
    await expect(page.getByLabel("Move to Zone")).toHaveCount(0);
    assert.equal(moves, 5);
    assert.equal(scene.lines.length, lineCount);
    await page.getByRole("button", { name: "Mode: Say / Do. Choose mode", exact: true }).click();
    await page.getByRole("menuitemradio", { name: "Contact", exact: true }).click();
    await expect(page.getByLabel("Contact Zone")).toHaveValue("");
    if (process.env.VILLAGES_VISUAL_OUTPUT)
      await page.screenshot({ path: resolve(process.env.VILLAGES_VISUAL_OUTPUT, "scene-actions-" + width + ".png") });
    const finalMessage = width === 1366 ? "Goodbye." : "";
    await composer.fill(finalMessage);
    await page.getByRole("button", { name: "Mode: Contact. Choose mode", exact: true }).click();
    await page.getByRole("menuitemradio", { name: "Conclude", exact: true }).click();
    assert.equal(lastLeave, undefined, "selecting Conclude does not end the Scene");
    await expect(composer).toHaveValue(finalMessage);
    await expect(page.getByRole("button", { name: "Send", exact: true })).toBeEnabled();
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(page.getByRole("button", { name: "Return to map", exact: true }).first()).toBeVisible();
    assert.equal(lastLeave.message, finalMessage, "Conclude keeps its optional final message");
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log(
    "Scene actions browser: four modes, inline immediate movement, contact targeting, final-paragraph readiness, busy/stale/lost-response navigation, drafts, silent repeated moves and optional concluding messages passed",
  );
} finally {
  await browser.close();
}
