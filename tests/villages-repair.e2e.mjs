// Test cases: repair-ui/desktop, repair-ui/phone, repair-ui/retry, repair-ui/checkpoints
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { repairBrowserFixture, expect, noRepairScroll } from "./fixtures/repair-browser.fixture.mjs";
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["phone", 390, 844],
  ])
    await runCase("repair-ui/" + name, async () => {
      const f = await repairBrowserFixture(browser, width, height, { history: 57, extraMemories: 60 }),
        { page } = f;
      await page.getByRole("button", { name: "Repair Nora", exact: true }).click();
      await f.section("memories");
      const search = page.getByRole("searchbox", { name: "Find a memory", exact: true });
      await search.fill("Remote memory 59");
      await page.getByRole("button", { name: "Remote memory 59", exact: true }).click();
      const field = page.getByRole("textbox", { name: "Memory", exact: true });
      const text = "I kept every word.\n\n" + "The café has a brass key, a notebook and a 🌼 flower.\n".repeat(12);
      await field.fill(text);
      assert.equal(await page.evaluate(() => window.c.draft.values.text), text);
      await noRepairScroll(page);
      const previous = page.getByRole("button", { name: "Previous Memory page", exact: true });
      while ((await previous.count()) && !(await previous.isDisabled())) await previous.click();
      let read = "";
      for (let index = 0; index < 40; index++) {
        read += await field.inputValue();
        const next = page.getByRole("button", { name: "Next Memory page", exact: true });
        if (!(await next.count()) || (await next.isDisabled())) break;
        await next.click();
      }
      assert.equal(read, text);
      await f.area("history");
      await expect(page.getByRole("columnheader", { name: "Action", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: /Undo/i })).toHaveCount(0);
      for (
        let index = 0;
        index < 60 && !(await page.getByRole("button", { name: "Repair 56", exact: true }).count());
        index++
      ) {
        const status = page.locator(".repair-pages [role=status]");
        const before = await status.textContent();
        await page.getByRole("button", { name: "Next →", exact: true }).click();
        await expect(status).not.toHaveText(before);
      }
      await expect(page.getByRole("button", { name: "Repair 56", exact: true })).toBeVisible();
      assert(f.calls.some((call) => new URL(call.url).searchParams.get("historyOffset") >= "50"));
      await noRepairScroll(page);
      await page.close();
    });
  await runCase("repair-ui/retry", async () => {
    const job = {
      id: "routine-failed",
      instanceId: "routine-instance",
      attempt: 2,
      kind: "resident-planning",
      label: "Agenda",
      status: "failed",
      completedSteps: 2,
      requests: 1,
      tokens: 30,
      error: "The routine needs attention.",
    };
    const f = await repairBrowserFixture(browser, 390, 844, { jobs: [job] }),
      { page } = f;
    await f.area("progress");
    await page.getByRole("button", { name: "Retry unfinished work", exact: true }).click();
    assert.deepEqual(await page.evaluate(() => window.retryJobs), ["routine-failed"]);
    await noRepairScroll(page);
    await page.close();
  });
  await runCase("repair-ui/checkpoints", async () => {
    const f = await repairBrowserFixture(browser, 390, 844, { checkpoints: 53 }),
      { page } = f;
    await f.snapshots();
    for (let index = 0; index < 60 && !(await page.getByRole("button", { name: /^Snapshot 52/ }).count()); index++) {
      const status = page.locator(".repair-pages [role=status]");
      const before = await status.textContent();
      await page.getByRole("button", { name: "Next →", exact: true }).click();
      await expect(status).not.toHaveText(before);
    }
    await expect(page.getByRole("button", { name: /^Snapshot 52/ })).toBeVisible();
    assert(f.calls.some((call) => Number(new URL(call.url).searchParams.get("checkpointOffset")) > 0));
    await page.getByRole("button", { name: /^Snapshot 52/ }).click();
    await expect(page.getByRole("button", { name: "Restore Village", exact: true })).toBeDisabled();
    await noRepairScroll(page);
    await page.close();
  });
});
