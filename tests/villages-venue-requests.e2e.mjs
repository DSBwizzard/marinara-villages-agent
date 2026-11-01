// Test cases: venues/requests
import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { verifyVenueRequestLifetimes } from "./fixtures/villages-venue-request-lifetime.fixture.mjs";
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  await runCase("venues/requests", () => verifyVenueRequestLifetimes(browser));
});
