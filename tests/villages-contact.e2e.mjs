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
      lines: [
        {
          id: "opening",
          role: "assistant",
          kind: "narration",
          speakerId: "__venue_scene__",
          name: "",
          content: "You stand outside.",
          at: now,
        },
      ],
    };
    let submitted, entered;
    const submissions = [];
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
                submissions.length === 1
                  ? "Come into our Common Space."
                  : "Yes, I am still listening through the doorway.",
              viaDoorway: true,
              remoteDelivery,
              at: now,
            },
          ],
          submissions: [
            { id: submitted.submissionId, activeIdsAtTurn: [], activeIdsAfterTurn: [], replyLineIds: ["answer"] },
          ],
        };
        value = { session, verdict: null, recordEvents: [] };
      } else if (path.endsWith("/rooms/zone")) {
        entered = route.request().postDataJSON();
        session = {
          ...session,
          zoneId: "common",
          area: "shared",
          sceneRevision: 2,
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
    await page.getByRole("button", { name: "Knock / Call", exact: true }).click();
    await page.getByLabel("Knock or call").selectOption("call");
    await page.getByLabel("Doorway").selectOption("common");
    await page.getByLabel("Who to contact").selectOption("mara");
    assert.equal(
      await page
        .getByLabel("Doorway")
        .getByRole("option", { name: /Secret bedroom/ })
        .count(),
      0,
    );
    for (const name of ["Knock or call", "Doorway", "Who to contact"]) {
      const box = await page.getByLabel(name).boundingBox();
      assert.ok(box && box.x >= 0 && box.x + box.width <= width, name + " fits the viewport");
    }
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect.poll(() => submitted?.mode).toBe("contact");
    assert.equal(submitted.targetId, "mara");
    assert.deepEqual(submitted.contact, { kind: "call", boundaryZoneId: "common" });
    assert.match(submitted.message, /Mara/);
    assert.equal(entered, undefined, "an invitation never automatically moves the player");
    await expect(page.getByRole("button", { name: "Enter Common Space", exact: true })).toBeVisible();
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
    await expect(page.getByRole("button", { name: "Mode: Chat. Choose mode", exact: true })).toBeVisible();
    await page.getByRole("textbox", { name: "Message at The Mill", exact: true }).fill("Thanks. How are you?");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect.poll(() => submissions.length).toBe(2);
    assert.equal(submitted.mode, "chat");
    assert.equal(submitted.targetId, "");
    await expect(page.locator('[class$="-chat-cast-person"]')).toHaveCount(0);
    await page.getByRole("button", { name: "Enter Common Space", exact: true }).click();
    await expect.poll(() => entered?.zoneId).toBe("common");
    assert.equal(entered.expectedSceneRevision, 2);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("Contact controls, doorway speech, physical cast and explicit entry passed on desktop and phones.");
} finally {
  await browser.close();
}
