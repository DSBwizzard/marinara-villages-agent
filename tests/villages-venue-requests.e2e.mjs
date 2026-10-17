// Test cases: venues/requests
import { chromium } from "@playwright/test";
import { runCase } from "../scripts/test-cases.mjs";
import { verifyVenueRequestLifetimes } from "./fixtures/villages-venue-request-lifetime.fixture.mjs";
const browser = await chromium.launch({ headless: true });
try {
  await runCase("venues/requests", () => verifyVenueRequestLifetimes(browser));
} finally {
  await browser.close();
}
