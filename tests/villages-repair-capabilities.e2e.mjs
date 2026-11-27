// Test cases: repair-capabilities/desktop, repair-capabilities/phone, repair-capabilities/compact, repair-capabilities/reverted-scope, repair-capabilities/reverted-snapshot-schedule
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { build } from "../scripts/esbuild.mjs";
import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { repairBrowserFixture, expect, noRepairScroll } from "./fixtures/repair-browser.fixture.mjs";
const bundle = await build({
  entryPoints: ["tests/fixtures/repair-capability-records.fixture.ts"],
  platform: "node",
  format: "esm",
  bundle: true,
  write: false,
});
const { records } = await import(
  "data:text/javascript;base64," + Buffer.from(bundle.outputFiles[0].text).toString("base64")
);
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["phone", 390, 844],
    ["compact", 320, 568],
  ])
    await runCase("repair-capabilities/" + name, async () => {
      const { page } = await repairBrowserFixture(browser, width, height, { records });
      await page.evaluate(() => window.c.chooseTopic("world"));
      for (const record of records) {
        if (record.topic === "memories")
          await page.evaluate(() => window.c.choosePerson({ id: "nora", name: "Nora", hasAgenda: true }, "memories"));
        await page.evaluate((id) => window.c.open(id), record.id);
        await expect(page.locator(".repair-editor")).toBeVisible();
        for (let step = 0; step < 100; step++) {
          await page.evaluate(
            () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
          );
          try {
            await noRepairScroll(page);
          } catch (error) {
            throw new Error(record.id + ", step " + step + ": " + error.message, { cause: error });
          }
          await expect(page.getByRole("button", { name: "Review changes", exact: true })).toBeVisible();
          const next = page.getByRole("button", { name: "Next", exact: true });
          if (!(await next.count()) || (await next.isDisabled())) break;
          await next.click();
          if (step === 99) throw new Error("Unbounded editor: " + record.id);
        }
      }
      await page.close();
    });
  await runCase("repair-capabilities/reverted-scope", async () => {
    const template = records.find((record) => record.id === '["new-situation"]');
    const situation = {
      ...template,
      id: '["narrative-situation","saved"]',
      title: "Market day",
      actions: [{ id: "correct", label: "Modify" }],
      fields: template.fields.map((field) => ({
        ...field,
        value:
          { title: "Market day", summary: "The stalls are open.\r\nThe roads are clear." }[field.key] ?? field.value,
      })),
    };
    const { page, calls } = await repairBrowserFixture(browser, 1440, 900, { records: [situation] });
    await page.evaluate(async (id) => {
      await window.c.chooseTopic("world");
      await window.c.open(id);
    }, situation.id);

    const show = async (field) => {
      await expect(page.locator(".repair-editor")).toBeVisible();
      if (!(await field.count())) {
        const first = page.locator(".repair-steps").getByRole("button", { name: /^1 / });
        await first.click();
        for (let step = 0; step < situation.fields.length && !(await field.count()); step++)
          await page.getByRole("button", { name: "Next", exact: true }).click();
      }
      await expect(field).toBeVisible();
    };
    const review = page.getByRole("button", { name: "Review changes", exact: true });
    const scope = page.getByRole("combobox", { name: "Scope", exact: true });
    await show(scope);
    await scope.selectOption("zone");
    const location = page.getByRole("combobox", { name: "Location", exact: true });
    await show(location);
    const zoneOption = situation.fields.find((field) => field.key === "zoneId").options.find((option) => option.parent);
    await location.selectOption(zoneOption.parent);
    const zone = page.getByRole("combobox", { name: "Zone", exact: true });
    await show(zone);
    await zone.selectOption(zoneOption.value);
    await show(scope);
    await scope.selectOption("village");
    await expect(review).toBeDisabled();
    const summary = page.getByRole("textbox", { name: "Circumstances", exact: true });
    await show(summary);
    await summary.fill("Temporary description");
    await summary.fill("The stalls are open.\nThe roads are clear.");
    await expect(review).toBeDisabled();
    const title = page.getByRole("textbox", { name: "Title", exact: true });
    await show(title);
    await title.fill("Summer market");
    await review.click();
    const comparison = page.locator(".repair-review");
    await expect(comparison.getByRole("group", { name: "Title after" })).toHaveText("Summer market");
    const { values } = calls.findLast((call) => call.path.endsWith("/review")).body;
    assert.equal(values.summary, "The stalls are open.\r\nThe roads are clear.");
    assert.equal(values.venueId, "");
    assert.equal(values.zoneId, "");
    await expect(comparison.getByRole("heading", { name: "Location", exact: true })).toHaveCount(0);
    await page.close();
  });
  await runCase("repair-capabilities/reverted-snapshot-schedule", async () => {
    const template = records.find((record) => record.id === '["snapshot-schedule"]');
    for (const savedFrequency of ["daily", "off"]) {
      const schedule = {
        ...template,
        fields: template.fields.map((field) =>
          field.key === "frequency" ? { ...field, value: savedFrequency } : field,
        ),
      };
      const { page, calls } = await repairBrowserFixture(browser, 1440, 900, { records: [schedule] });
      await page.evaluate(async (id) => {
        await window.c.chooseTopic("world");
        await window.c.open(id);
      }, schedule.id);
      const review = page.getByRole("button", { name: "Review changes", exact: true });
      const frequency = page.getByRole("combobox", { name: "Schedule", exact: true });
      const day = page.getByRole("combobox", { name: "Day for weekly snapshots", exact: true });
      await frequency.selectOption("weekly");
      for (let step = 0; step < schedule.fields.length && !(await day.count()); step++)
        await page.getByRole("button", { name: "Next", exact: true }).click();
      await day.selectOption("4");
      await expect(review).toBeEnabled();
      await page.locator(".repair-steps").getByRole("button", { name: /^1 / }).click();
      await frequency.selectOption(savedFrequency);
      await expect(day).toHaveCount(0);
      await expect(review).toBeDisabled();

      if (savedFrequency === "daily") {
        await page.locator('[id="repair-field-time"]').fill("21:00");
        await review.click();
        await expect(page.locator(".repair-review").getByRole("group", { name: "Time after" })).toHaveText("21:00");
        const { values } = calls.findLast((call) => call.path.endsWith("/review")).body;
        assert.equal(values.weekday, "3");
        await expect(
          page.locator(".repair-review").getByRole("heading", { name: "Day for weekly snapshots" }),
        ).toHaveCount(0);
      }
      await page.close();
    }
  });
});
