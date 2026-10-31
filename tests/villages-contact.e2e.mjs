import { mockEngineLookups, fulfill } from "./fixtures/browser-diagnostics.mjs";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { chromium, expect } from "./fixtures/browser-diagnostics.mjs";
import { snapshot as fixture, now, mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await mockEngineLookups(page);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const snapshot = structuredClone(fixture);
    const remoteDelivery = width === 390 ? "loud" : undefined;
    snapshot.settings.venues[0].zones = [
      { id: "exterior", kind: "exterior", name: "Exterior", seen: true },
      { id: "common", kind: "shared-residence", venueClass: "residence", name: "Common Space", seen: false },
      { id: "private:mara", kind: "private-residence", venueClass: "residence", name: "Secret bedroom", seen: false },
    ];
    let session = {
      version: 2,
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
      fulfill(route, {
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
        if (submitted.message !== "I look around.") contactTurns++;
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
        if (submitted.message === "I look around.") {
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
        };
        value = { session };
      }
      await fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(value) });
    });
    await page.goto("http://villages.test/");
    await page.addScriptTag({ path: resolve("packages/villages/client.js") });
    const composer = page.getByRole("textbox", { name: "Message at The Mill", exact: true });
    const readUntil = async (text) => {
      await expect
        .poll(async () => {
          if (text.test(await page.getByRole("region", { name: "Current paragraph" }).innerText())) return true;
          await page.getByRole("button", { name: "Next paragraph", exact: true }).evaluate((button) => {
            if (!button.disabled) button.click();
          });
          return false;
        })
        .toBe(true);
    };
    const sendEmpty = page.getByRole("button", { name: "Send", exact: true });
    await expect(sendEmpty).toBeDisabled();
    await composer.fill("I look around.");
    await expect(sendEmpty).toBeEnabled();
    await sendEmpty.click();
    await expect.poll(() => submissions.length).toBe(1);
    await expect(composer).toHaveValue("");
    await readUntil(/quiet exterior/);
    await expect(page.getByRole("region", { name: "Current paragraph" })).toContainText("quiet exterior");
    await page.getByRole("button", { name: "Mode: Say / Do. Choose mode", exact: true }).click();
    await expect(page.getByRole("menuitemradio", { name: "Contact", exact: true })).toHaveCount(0);
    await page.getByRole("menuitemradio", { name: "Say / Do", exact: true }).click();
    await composer.fill("I call through the entrance: Is anyone there?");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect.poll(() => submissions.length).toBe(2);
    await expect(composer).toHaveValue("");
    assert.equal(submitted.mode, "chat");
    assert.equal(submitted.targetId, "");
    assert.equal(submitted.contact, undefined);
    assert.match(submitted.message, /call through the entrance/);
    assert.equal(entered, undefined, "an invitation never automatically moves the player");
    await expect(page.getByRole("button", { name: "Move to Common Space", exact: true })).toHaveCount(0);
    await readUntil(/Come into our Common Space/);
    await expect(
      page.getByText(remoteDelivery === "loud" ? /calling from inside/i : /through the doorway/i).first(),
    ).toBeVisible();
    await expect(page.locator('[class$="-chat-cast-person"]')).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Mode: Say / Do. Choose mode", exact: true })).toBeVisible();
    await page.getByRole("textbox", { name: "Message at The Mill", exact: true }).fill("Thanks. How are you?");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect.poll(() => submissions.length).toBe(3);
    await expect(composer).toHaveValue("");
    assert.equal(submitted.mode, "chat");
    assert.equal(submitted.targetId, "");
    await expect(page.locator('[class$="-chat-cast-person"]')).toHaveCount(0);
    await readUntil(/still listening through the doorway/);
    await page.getByRole("button", { name: "Mode: Say / Do. Choose mode", exact: true }).click();
    await page.getByRole("menuitemradio", { name: "Move", exact: true }).click();
    await expect(page.getByLabel("Move to Zone").getByRole("option", { name: /invited/ })).toHaveText(
      "Interior entrance (invited)",
    );
    await page.getByLabel("Move to Zone").selectOption("common");
    await expect.poll(() => entered?.zoneId).toBe("common");
    assert.equal(entered.expectedSceneRevision, 3);
    await expect(page.getByRole("button", { name: "Mode: Say / Do. Choose mode", exact: true })).toBeVisible();
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("Say / Do doorway speech, physical cast and explicit entry passed on desktop and phones.");
} finally {
  await browser.close();
}
