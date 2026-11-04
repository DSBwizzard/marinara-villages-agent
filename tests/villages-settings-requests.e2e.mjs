// Test cases: settings/requests
import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { verifySettingsRequestLifetimes } from "./fixtures/villages-settings-request-lifetime.fixture.mjs";
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  await runCase("settings/requests", () => verifySettingsRequestLifetimes(browser));
});
