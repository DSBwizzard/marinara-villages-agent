// Test cases: settings/requests
import { chromium } from "@playwright/test";
import { runCase } from "../scripts/test-cases.mjs";
import { verifySettingsRequestLifetimes } from "./fixtures/villages-settings-request-lifetime.fixture.mjs";
const browser = await chromium.launch({ headless: true });
try {
  await runCase("settings/requests", () => verifySettingsRequestLifetimes(browser));
} finally {
  await browser.close();
}
