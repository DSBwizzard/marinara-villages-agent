import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { snapshot as fixture, now, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const snapshot = structuredClone(fixture);
    const remoteDelivery = width === 390 ? "loud" : width === 320 ? "device" : undefined;
    snapshot.settings.venues[0].zones = [
      { id: "exterior", kind: "exterior", name: "Exterior", seen: true },
      { id: "common", kind: "shared-residence", venueClass: "residence", name: "Common Space", seen: false },
      { id: "private:mara", kind: "private-residence", venueClass: "residence", name: "Secret bedroom", seen: false },
    ];
    let session = {
      id: "contact-browser",
      placeId: "mill",
      placeName: "The Mill",
      zoneId: "exterior",
      area: "outside",
      status: "active",
      startedAt: now,
      lastActivityAt: now,
      sceneRevision: 0,
      stagingVersion: 1,
      activeIds: [],
      participants: [],
      submissions: [],
      lines: [],
    };
    let submitted, entered;
    const submissions = [];
    let contactTurns = 0;
    await page.route("http://villages.test/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<style>:root{--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7;--secondary:#384253}html,body{margin:0;height:100%;background:var(--background);color:var(--foreground);font-family:Arial}marinara-capability-villages{display:block;height:100%}</style><marinara-capability-villages></marinara-capability-villages>",
      }),
    );
    await page.route("**/api/villages**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let value = snapshot;
      if (path.endsWith("/rooms/active") || path.endsWith("/rooms/activity")) value = { session };
      else if (path.endsWith("/town-map")) value = { image: mapImage };
      else if (path.endsWith("/rooms/turn")) {
        submitted = route.request().postDataJSON();
        submissions.push(submitted);
        if (submitted.mode === "contact") contactTurns++;
        session = {
          ...session,
          sceneRevision: submissions.length,
          participants: [{ characterId: "mara", name: "Mara", doing: "Answering a contact request" }],
          doorwayContacts: [{ characterId: "mara", playerZoneId: "exterior" }],
          entryOffers: [{ zoneId: "common", label: "Common Space", controllerId: "mara", accompanies: false }],
          lines: [
            ...session.lines,
            { id: "player", role: "user", speakerId: "", name: "", content: submitted.message, at: now },
            {
              id: "answer",
              role: "assistant",
              kind: "dialogue",
              speakerId: "mara",
              name: "Mara",
              content:
                contactTurns === 1 ? "Come into our Common Space." : "Yes, I am still listening through the doorway.",
              viaDoorway: true,
              remoteDelivery,
              at: now,
            },
          ],
          submissions: [
            { id: submitted.submissionId, activeIdsAtTurn: [], activeIdsAfterTurn: [], replyLineIds: ["answer"] },
          ],
        };
        if (submitted.mode === "chat") {
          session.participants = [];
          session.doorwayContacts = [];
          session.entryOffers = [];
          session.lines[session.lines.length - 1] = {
            id: "local-answer",
            role: "assistant",
            kind: "narration",
            speakerId: "__venue_scene__",
            name: "Narration",
            content: "You look around the quiet exterior.",
            at: now,
          };
        }
        value = { session, verdict: null, recordEvents: [] };
      } else if (path.endsWith("/rooms/zone")) {
        entered = route.request().postDataJSON();
        session = {
          ...session,
          zoneId: "common",
          area: "shared",
          sceneRevision: session.sceneRevision + 1,
          activeIds: ["mara"],
          doorwayContacts: [],
          entryOffers: [],
          lines: [
            ...session.lines,
            {
              id: "entry",
              role: "assistant",
              kind: "narration",
              speakerId: "__venue_scene__",
              name: "",
              content: "You enter the Common Space.",
              at: now,
            },
          ],
        };
        value = { session };
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const composer = page.getByRole("textbox", { name: "Message at The Mill", exact: true });
    const sendEmpty = page.getByRole("button", { name: "Send", exact: true });
    await expect(sendEmpty).toBeDisabled();
    await composer.fill("I look around.");
    await expect(sendEmpty).toBeEnabled();
    await sendEmpty.click();
    await expect.poll(() => submissions.length).toBe(1);
    const readNext = page.getByRole("button", { name: "Next paragraph", exact: true });
    while (await readNext.isEnabled()) await readNext.click();
    await expect(page.getByRole("region", { name: "Current paragraph" })).toContainText("quiet exterior");
    await page.getByRole("button", { name: "Mode: Say / Do. Choose mode", exact: true }).click();
    await page.getByRole("menuitemradio", { name: "Contact", exact: true }).click();
    const send = page.getByRole("button", { name: "Send", exact: true });
    await expect(send).toBeDisabled();
    await page.getByLabel("Contact Zone", { exact: true }).selectOption("common");
    await expect(send).toBeEnabled();
    await expect(page.locator("[data-scene-scope]")).toHaveText("Contacting Interior entrance");
    await expect(page.getByLabel("Who to contact")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Knock / Call", exact: true })).toHaveCount(0);
    assert.equal(
      await page
        .getByLabel("Contact Zone")
        .getByRole("option", { name: /Secret bedroom/ })
        .count(),
      0,
    );
    const box = await page.getByLabel("Contact Zone").boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= width);
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect.poll(() => submitted?.mode).toBe("contact");
    assert.equal(submitted.targetId, "");
    assert.deepEqual(submitted.contact, { kind: "call", boundaryZoneId: "common" });
    assert.match(submitted.message, /attention toward Interior entrance/);
    assert.equal(entered, undefined, "an invitation never automatically moves the player");
    await expect(page.getByRole("button", { name: "Move to Common Space", exact: true })).toBeVisible();
    const next = page.getByRole("button", { name: "Next paragraph", exact: true });
    if ((await next.isVisible()) && (await next.isEnabled())) await next.click();
    await expect(
      page
        .getByText(
          remoteDelivery === "loud"
            ? /calling from inside/i
            : remoteDelivery === "device"
              ? /over the intercom/i
              : /through the doorway/i,
        )
        .first(),
    ).toBeVisible();
    await expect(page.locator('[class$="-chat-cast-person"]')).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Mode: Contact. Choose mode", exact: true })).toBeVisible();
    await page.getByRole("textbox", { name: "Message at The Mill", exact: true }).fill("Thanks. How are you?");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect.poll(() => submissions.length).toBe(3);
    assert.equal(submitted.mode, "contact");
    assert.equal(submitted.targetId, "");
    await expect(page.locator('[class$="-chat-cast-person"]')).toHaveCount(0);
    await page.getByRole("button", { name: "Move to Common Space", exact: true }).click();
    assert.equal(entered, undefined, "the invitation only prepares Move");
    await expect(page.getByRole("button", { name: "Mode: Move. Choose mode", exact: true })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Message at The Mill", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect.poll(() => entered?.zoneId).toBe("common");
    assert.equal(entered.expectedSceneRevision, 3);
    await expect(page.getByRole("button", { name: "Mode: Say / Do. Choose mode", exact: true })).toBeVisible();
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("Contact controls, doorway speech, physical cast and explicit entry passed on desktop and phones.");
} finally {
  await browser.close();
}
