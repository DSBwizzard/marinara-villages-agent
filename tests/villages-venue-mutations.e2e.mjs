// Test cases: venues/mutations
import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { verifyVenueMutationLifetimes } from "./fixtures/villages-venue-mutation-lifetime.fixture.mjs";
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  await runCase("venues/mutations", () => verifyVenueMutationLifetimes(browser));
});
