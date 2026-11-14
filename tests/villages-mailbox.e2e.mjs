// Test cases: mailbox/desktop, mailbox/phone
import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, expect, fulfill, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { captureContinuityContext } from "../packages/villages/src/server/domain/rules/continuity-context.js";
import {
  acceptResidentLetter,
  readDeliveredLetter,
} from "../packages/villages/src/server/domain/rules/mail-delivery.js";
import { createMailboxPresentation, readKeepsakes } from "../packages/villages/src/server/domain/rules/mailbox-view.js";
import { villageWorldScope } from "../packages/villages/src/server/domain/rules/village-identity.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { snapshot as base, image } from "./fixtures/villages-scene-browser.fixture.mjs";

const bundle = await build({
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  minify: true,
  entryPoints: ["tests/fixtures/mailbox-entry.tsx"],
});
const output = resolve(".build-tmp/mailbox");
mkdirSync(output, { recursive: true });
const at = "2026-11-09T12:00:00.000Z",
  later = "2026-11-09T13:00:00.000Z";
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["phone", 390, 844],
  ])
    await runCase("mailbox/" + name, async () => {
      const state = { ...defaultVillageState(), seed: "mailbox-browser", setupAt: at };
      state.villagers = [
        { characterId: "mara", incarnation: "one", letterFontId: "caveat", cardSnapshot: { name: "Mara" } },
      ];
      const mara = continuityActor(state, "mara"),
        player = continuityActor(state, "player");
      acceptResidentLetter(
        state,
        captureContinuityContext(state, ["mara", "player"], "garden", at),
        { id: "letter", at, from: mara, to: player },
        "I planted the café garden. 🌼",
        "request",
        {
          keep: [
            {
              id: "garden",
              for: ["mara", "player"],
              class: "information",
              text: "Mara reports planting the café garden.",
              source: ["letter"],
            },
          ],
          requires: ["garden"],
        },
        memoryHash("one already generated response"),
        at,
      );
      state.residentPlans.activities = {
        garden: {
          id: "garden",
          resident: { id: mara.id, incarnation: mara.incarnation },
          playerIncarnation: player.incarnation,
          sceneId: "cafe-garden",
          endedAt: at,
          outcome: "letter",
          keepsake: { letterId: "letter", caption: "The café garden", moment: "flowers" },
        },
      };
      const snapshot = structuredClone(base);
      snapshot.worldScope = villageWorldScope(state);
      const signatureImage = { id: "signature", ref: "signature", url: "http://mailbox.test/signature.svg" };
      snapshot.villagers = [
        {
          ...snapshot.villagers[0],
          name: "Mara",
          letterFontId: "caveat",
          signature: { image: signatureImage, original: signatureImage, name: "Mara", generatedAt: at },
        },
      ];
      const portraits = { mara: { url: image("#996655"), crop: null } };
      let failRead = true,
        readCommands = 0;
      const page = await browser.newPage({ viewport: { width, height } });
      await page.route("http://mailbox.test/", (route) =>
        fulfill(route, {
          contentType: "text/html",
          body: "<style>html,body{margin:0;height:100%;font:16px Arial}marinara-capability-villages{display:block;height:100vh}</style><marinara-capability-villages></marinara-capability-villages>",
        }),
      );
      await page.route("**/signature.svg", (route) =>
        fulfill(route, {
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><text x="0" y="30">Mara signature</text></svg>',
        }),
      );
      for (const font of ["caveat", "lora"])
        await page.route(`**/assets/letter-fonts/${font}.json`, (route) =>
          fulfill(route, {
            contentType: "application/json",
            body: readFileSync(`packages/villages/letter-fonts/${font}.json`, "utf8"),
          }),
        );
      await page.route("**/api/villages/**", async (route) => {
        const request = route.request(),
          url = new URL(request.url()),
          body = request.method() === "POST" ? request.postDataJSON() : null;
        const presentation = createMailboxPresentation(state, state.mailbox, []);
        assert.equal(body?.scope ?? url.searchParams.get("scope"), snapshot.worldScope);
        if (url.pathname.endsWith("/read")) {
          readCommands++;
          if (failRead) {
            failRead = false;
            return fulfill(route, { status: 503, json: { error: "Read publication failed" } });
          }
          readDeliveredLetter(state, "letter", later);
          return fulfill(route, {
            json: {
              scope: snapshot.worldScope,
              threadId: "personal:mara",
              messageId: "letter",
              token: presentation.letter("personal:mara", "letter").message.token,
            },
          });
        }
        if (url.pathname.endsWith("/messages/letter"))
          return fulfill(route, { json: presentation.letter("personal:mara", "letter") });
        if (url.pathname.endsWith("/keepsakes")) return fulfill(route, { json: { keepsakes: readKeepsakes(state) } });
        if (url.pathname.endsWith("/illustration")) return fulfill(route, { json: { image: "" } });
        assert(url.pathname.endsWith("/mailbox"));
        return fulfill(route, { json: presentation.mailbox(Object.fromEntries(url.searchParams)) });
      });
      await page.goto("http://mailbox.test/");
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      const show = () =>
        page.evaluate(({ snapshot, portraits }) => window.showMailbox(snapshot, portraits), { snapshot, portraits });
      await show();
      const mail = page.getByRole("dialog", { name: "Mailbox", exact: true });
      await mail.locator(".villages-letter-row").first().click();
      await expect(mail.getByRole("button", { name: "Retry reading" })).toBeVisible();
      await expect(
        mail.getByLabel("Personal mail").getByText("I planted the café garden. 🌼", { exact: true }),
      ).toHaveCount(0);
      assert.equal(state.mailbox.messages.letter.readAt, undefined);
      await mail.getByRole("button", { name: "Retry reading" }).click();
      await expect(
        mail.getByLabel("Personal mail").getByText("I planted the café garden. 🌼", { exact: true }),
      ).toBeVisible();
      assert.equal(state.mailbox.messages.letter.readAt, later);
      assert.equal(readCommands, 2);
      await expect(mail.locator('.villages-letter-pages img[src="http://mailbox.test/signature.svg"]')).toBeVisible();
      const bounds = await mail.boundingBox();
      assert(
        bounds.x >= 0 &&
          bounds.y >= 0 &&
          bounds.x + bounds.width <= width + 1 &&
          bounds.y + bounds.height <= height + 1,
        "Mailbox fits its viewport",
      );
      await page.screenshot({ path: resolve(output, name + ".png") });
      state.villagers[0].incarnation = "replacement";
      state.formerLetterFonts = { mara: "great-vibes" };
      snapshot.villagers[0].name = "Replacement Mara";
      await show();
      const row = mail.locator(".villages-letter-row").first();
      await expect(row).toContainText("Former resident");
      await expect(row.locator("img")).toHaveCount(0);
      await row.click();
      await expect(
        mail.getByLabel("Personal mail").getByText("I planted the café garden. 🌼", { exact: true }),
      ).toBeVisible();
      await expect(mail.locator(".villages-letter-pages img")).toHaveCount(0);
      await expect(mail.getByRole("button", { name: "Write back" })).toHaveCount(0);
      assert.equal(readCommands, 2, "an already read former author's letter needs no further publication");
      await page.screenshot({ path: resolve(output, name + "-former.png") });
      await expect(mail.getByText(/The café garden · Former resident/)).toBeVisible();
      if (name === "phone") await mail.getByRole("button", { name: /Back to letters/ }).click();
      await mail.getByRole("button", { name: "Keepsakes", exact: true }).click();
      await expect(mail.getByRole("heading", { name: "Keepsakes Journal" })).toBeVisible();
      await mail.getByRole("button", { name: "The café garden", exact: true }).click();
      await expect(mail.getByRole("button", { name: "Generate illustration" })).toBeVisible();
      if (name === "phone") {
        await mail.getByRole("button", { name: /Back to letters/ }).click();
        await expect(mail.getByRole("button", { name: "Inbox", exact: true })).toBeVisible();
      }
      await page.close();
    });
});
