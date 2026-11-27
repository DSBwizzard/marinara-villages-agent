// Test cases: repair-people/navigation, repair-people/home-work-switching, repair-people/agenda, repair-people/reverted-edits, repair-people/letter-font, repair-people/visitor, repair-people/late-responses, repair-people/restore-draft
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
    await f.section("memories");
    await page.getByRole("button", { name: "The workshop key", exact: true }).click();
    const field = page.getByRole("textbox", { name: "Memory", exact: true });
    const review = page.getByRole("button", { name: "Review changes", exact: true });
    await expect(field).toHaveValue("Ellis lent me the workshop key.");
    await field.fill("A temporary account.");
    await expect(review).toBeEnabled();
    await field.fill("Ellis lent me the workshop key.");
    await expect(review).toBeDisabled();
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
    await f.section("memories");
    await page.getByRole("button", { name: "A quiet afternoon", exact: true }).click();
    await expect(field).toHaveValue("We read in the garden.");
    await page.getByRole("button", { name: "← People", exact: true }).click();
    await expect(page.getByRole("searchbox", { name: "Find a person" })).toHaveValue("Ellis");
    await page.getByRole("searchbox", { name: "Find a person" }).fill("Nora");
    await page.getByRole("button", { name: "Repair Nora", exact: true }).click();
    await f.section("memories");
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
  await runCase("repair-people/home-work-switching", async () => {
    for (const width of [1440, 390]) {
      const f = await repairBrowserFixture(browser, width, 900),
        { page } = f;
      await page.getByRole("button", { name: "Repair Nora", exact: true }).click();
      await f.section("home");
      const home = page.getByRole("combobox", { name: "Home", exact: true });
      await home.selectOption("inn");
      const workId = '["work","nora","house"]';
      const choose = async (id) => {
        if (width > 700)
          await page
            .locator(".repair-steps")
            .getByRole("button", { name: id === workId ? "3 Work" : "1 Home", exact: true })
            .click();
        else await page.getByRole("combobox", { name: "Home and work section" }).selectOption(id);
      };
      const toWork = f.hold("record:" + workId);
      await choose(workId);
      await toWork.started;
      await expect(home).toBeVisible();
      await expect(home).toBeDisabled();
      await expect(page.locator(".repair-record-list")).toHaveCount(0);
      toWork.release();
      const work = page.getByRole("textbox", { name: "Work", exact: true });
      await work.fill("Keep this work correction.");
      const homeId = '["home","nora"]';
      const toHome = f.hold("record:" + homeId);
      await choose(homeId);
      await toHome.started;
      await expect(work).toBeVisible();
      await expect(work).toBeDisabled();
      await expect(page.locator(".repair-record-list")).toHaveCount(0);
      toHome.release();
      await expect(home).toHaveValue("inn");
      await choose(workId);
      await expect(work).toHaveValue("Keep this work correction.");
      await page.getByRole("button", { name: "Review changes", exact: true }).click();
      assert.equal(f.calls.findLast((call) => call.path.endsWith("/review")).body.recordId, workId);
      await noRepairScroll(page);
      await page.close();
    }
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
  await runCase("repair-people/reverted-edits", async () => {
    const f = await repairBrowserFixture(browser),
      { page } = f;
    const review = page.getByRole("button", { name: "Review changes", exact: true });
    const lastReview = () => f.calls.findLast((call) => call.path.endsWith("/review"))?.body.values;
    await page.getByRole("button", { name: "Repair Nora", exact: true }).click();
    await f.section("home");
    const home = page.getByRole("combobox", { name: "Home", exact: true });
    await home.selectOption("inn");
    await expect(review).toBeEnabled();
    await home.selectOption("house");
    await expect(review).toBeDisabled();
    await page.getByRole("button", { name: "2 Sleeping Zone", exact: true }).click();
    const sleeping = page.getByRole("combobox", { name: "Sleeping Zone", exact: true });
    await expect(sleeping).toHaveValue("bedroom");
    await sleeping.selectOption("");
    await page.getByRole("button", { name: "1 Home", exact: true }).click();
    await home.selectOption("inn");
    await home.selectOption("house");
    await page.getByRole("button", { name: "2 Sleeping Zone", exact: true }).click();
    await expect(sleeping).toHaveValue("");
    await expect(review).toBeEnabled();
    await sleeping.selectOption("bedroom");
    await expect(review).toBeDisabled();

    await page.getByRole("button", { name: "3 Work", exact: true }).click();
    const invite = page.getByRole("checkbox", { name: "May invite guests", exact: true });
    await invite.uncheck();
    await expect(review).toBeEnabled();
    await invite.check();
    await expect(review).toBeDisabled();
    await page.getByRole("button", { name: "4 Days & times", exact: true }).click();
    const monday = page.getByRole("checkbox", { name: "Mon", exact: true });
    await monday.uncheck();
    await expect(review).toBeEnabled();
    await monday.check();
    await expect(review).toBeDisabled();
    await page.getByRole("button", { name: "3 Work", exact: true }).click();
    await page.getByRole("textbox", { name: "Work", exact: true }).fill("Repair books");
    await review.click();
    await expect(page.locator(".repair-review").getByRole("group", { name: "Work after" })).toHaveText("Repair books");
    assert.equal(lastReview().days, "Monday,Thursday,Friday,Saturday,Sunday");
    await expect(page.locator(".repair-review").getByRole("heading", { name: "Days", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Back", exact: true }).click();

    await f.section("agenda");
    await page.getByRole("button", { name: /Reading/ }).click();
    const advanceTo = async (field) => {
      for (let step = 0; step < 5 && !(await field.count()); step++)
        await page.getByRole("button", { name: "Next", exact: true }).click();
      await expect(field).toBeVisible();
    };
    const activity = page.getByRole("textbox", { name: "Activity", exact: true });
    await activity.fill("Read");
    await activity.fill("Reading");
    await expect(review).toBeDisabled();
    const endOfDay = page.getByRole("checkbox", { name: "End of day", exact: true });
    await advanceTo(endOfDay);
    await endOfDay.check();
    await expect(review).toBeEnabled();
    await endOfDay.uncheck();
    await expect(page.locator('[id="repair-field-end:0"]')).toHaveValue("10:00");
    await expect(review).toBeDisabled();
    const location = page.getByRole("combobox", { name: "Location", exact: true });
    await advanceTo(location);
    await location.selectOption("inn");
    await location.selectOption("house");
    await expect(review).toBeDisabled();
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
    await f.section("memories");
    const gate = f.hold('record:["memory","nora"]');
    await page.getByRole("button", { name: "The workshop key", exact: true }).click();
    await gate.started;
    await page.getByRole("button", { name: "← People", exact: true }).click();
    await page.getByRole("button", { name: "Repair Ellis", exact: true }).click();
    await f.section("memories");
    gate.release();
    await page.getByRole("button", { name: "A quiet afternoon", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Ellis", exact: true })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Memory", exact: true })).toHaveValue("We read in the garden.");
    await page.close();
  });
  await runCase("repair-people/restore-draft", async () => {
    const f = await repairBrowserFixture(browser),
      { page } = f;
    await f.snapshots();
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
    await expect(page.getByRole("button", { name: "← Return to village", exact: true })).toBeDisabled();
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
