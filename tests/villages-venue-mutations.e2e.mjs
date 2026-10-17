// Test cases: venues/mutations
import { chromium } from "@playwright/test";
import { runCase } from "../scripts/test-cases.mjs";
import { verifyVenueMutationLifetimes } from "./fixtures/villages-venue-mutation-lifetime.fixture.mjs";
const browser = await chromium.launch({ headless: true });
try {
  await runCase("venues/mutations", () => verifyVenueMutationLifetimes(browser));
} finally {
  await browser.close();
}
