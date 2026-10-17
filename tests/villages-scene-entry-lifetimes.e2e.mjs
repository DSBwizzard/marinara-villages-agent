import { chromium } from "@playwright/test";
import { verifySceneEntryLifetimes } from "./fixtures/villages-scene-entry-lifetime.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
try {
  await verifySceneEntryLifetimes(browser);
} finally {
  await browser.close();
}
