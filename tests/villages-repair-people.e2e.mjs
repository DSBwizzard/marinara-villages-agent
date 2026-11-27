// Test cases: repair-people/navigation, repair-people/agenda, repair-people/letter-font, repair-people/visitor, repair-people/late-responses, repair-people/restore-draft
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { repairBrowserFixture, expect, noRepairScroll } from "./fixtures/repair-browser.fixture.mjs";
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  await runCase("repair-people/navigation", async () => {
    const f = await repairBrowserFixture(browser),
      { page } = f;
    await page.getByRole("button", { name: "Repair Nora", exact: true }).click();
    await page.getByRole("button", { name: "The workshop key", exact: true }).click();
    const field = page.getByRole("textbox", { name: "Memory", exact: true });
    await field.fill("A separate draft for Nora.");
    await page.getByRole("button", { name: "Forget", exact: true }).click();
    await expect(field).toHaveValue("Ellis lent me the workshop key.");
    await page.getByRole("button", { name: "Modify", exact: true }).click();
    await expect(field).toHaveValue("A separate draft for Nora.");
    await page.getByRole("button", { name: "Discard", exact: true }).click();
    await field.fill("Keep Nora’s unfinished correction.");
    await page.getByRole("button", { name: "← People", exact: true }).click();
    await page.getByRole("searchbox", { name: "Find a person" }).fill("Ellis");
    await page.getByRole("button", { name: "Repair Ellis", exact: true }).click();
    await page.getByRole("button", { name: "A quiet afternoon", exact: true }).click();
    await expect(field).toHaveValue("We read in the garden.");
    await page.getByRole("button", { name: "← People", exact: true }).click();
    await expect(page.getByRole("searchbox", { name: "Find a person" })).toHaveValue("Ellis");
    await page.getByRole("searchbox", { name: "Find a person" }).fill("Nora");
    await page.getByRole("button", { name: "Repair Nora", exact: true }).click();
    await page.getByRole("button", { name: "The workshop key", exact: true }).click();
    await expect(field).toHaveValue("Keep Nora’s unfinished correction.");
    await page.getByRole("button", { name: "Review changes", exact: true }).click();
    const edit = f.calls.findLast((call) => call.path.endsWith("/review")).body;
    assert.equal(edit.personId, "nora");
    assert.deepEqual(edit.knowers, ["nora"]);
    assert(!f.calls.some((call) => /explore|visit|generate/.test(call.path)));
    await noRepairScroll(page);
    await page.close();
  });
  await runCase("repair-people/agenda", async () => {
    const f = await repairBrowserFixture(browser, 390, 844),
      { page } = f;
    await page.getByRole("button", { name: "Repair Nora", exact: true }).click();
    await f.section("agenda");
    await page.getByRole("button", { name: /Meet Ellis/ }).click();
    await expect(page.getByRole("textbox", { name: "Activity", exact: true })).toHaveValue("Meet Ellis");
    await expect(page.getByRole("button", { name: "Edit agreed plan" })).toHaveCount(0);
    await page.getByRole("textbox", { name: "Activity", exact: true }).fill("Read with Ellis");
    await page.getByRole("button", { name: "Review changes", exact: true }).click();
    assert.equal(
      f.calls.findLast((call) => call.path.endsWith("/review")).body.recordId,
      '["appointment","nora","plan"]',
    );
    await noRepairScroll(page);
    await page.close();
  });
  await runCase("repair-people/letter-font", async () => {
    const f = await repairBrowserFixture(browser),
      { page } = f;
    await page.getByRole("button", { name: "Repair Nora", exact: true }).click();
    await f.section("details");
    await page.getByRole("button", { name: /Letter style/ }).click();
    await page.getByRole("combobox", { name: "Letter style" }).selectOption("lora");
    await expect(page.getByText("Dear friend, I hope this letter finds you well.")).toHaveCSS("font-family", /Lora/i);
    await page.getByRole("button", { name: "Review changes", exact: true }).click();
    assert.equal(f.calls.findLast((call) => call.path.endsWith("/review")).body.values.letterFontId, "lora");
    await page.close();
  });
  await runCase("repair-people/visitor", async () => {
    const f = await repairBrowserFixture(browser),
      { page } = f;
    await page.getByRole("button", { name: "Visitors", exact: true }).click();
    await page.getByRole("button", { name: "Repair Visitor", exact: true }).click();
    await f.section("details");
    await page.getByRole("button", { name: /Visits/ }).click();
    await page.getByRole("checkbox", { name: "Visits enabled" }).uncheck();
    await page.getByRole("button", { name: "Review changes", exact: true }).click();
    assert.equal(f.calls.findLast((call) => call.path.endsWith("/review")).body.values.visitsEnabled, false);
    await page.close();
  });
  await runCase("repair-people/late-responses", async () => {
    const f = await repairBrowserFixture(browser),
      { page } = f;
    await page.getByRole("button", { name: "Repair Nora", exact: true }).click();
    const gate = f.hold('record:["memory","nora"]');
    await page.getByRole("button", { name: "The workshop key", exact: true }).click();
    await gate.started;
    await page.getByRole("button", { name: "← People", exact: true }).click();
    await page.getByRole("button", { name: "Repair Ellis", exact: true }).click();
    gate.release();
    await page.getByRole("button", { name: "A quiet afternoon", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Ellis", exact: true })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Memory", exact: true })).toHaveValue("We read in the garden.");
    await page.close();
  });
  await runCase("repair-people/restore-draft", async () => {
    const f = await repairBrowserFixture(browser),
      { page } = f;
    await f.area("world");
    await page.getByRole("button", { name: "Village snapshots →" }).click();
    await page.getByRole("textbox", { name: "Snapshot name" }).fill("Before correction");
    await page.getByRole("button", { name: "Save snapshot", exact: true }).click();
    await page.getByRole("button", { name: /^Before correction/ }).click();
    await page.getByRole("checkbox", { name: "Replace Village progress with this snapshot" }).check();
    await page.evaluate(() => {
      window.repairRefresh = new Promise((resolve) => {
        window.resolveRepairRefresh = resolve;
      });
    });
    await page.getByRole("button", { name: "Restore Village", exact: true }).click();
    await expect(page.getByRole("button", { name: "Main menu", exact: true })).toBeDisabled();
    await page.evaluate(() =>
      window.resolveRepairRefresh({ title: "Preserved Scene draft", text: "I was about to ask about the library." }),
    );
    await expect(page.getByRole("heading", { name: "Village restored", exact: true })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Preserved Scene draft" })).toHaveValue(
      "I was about to ask about the library.",
    );
    await page.close();
  });
});
