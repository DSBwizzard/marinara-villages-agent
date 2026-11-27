// Test cases: repair-capabilities/desktop, repair-capabilities/phone, repair-capabilities/compact
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
});
