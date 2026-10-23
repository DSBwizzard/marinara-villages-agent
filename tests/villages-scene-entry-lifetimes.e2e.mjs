import { chromium } from "./fixtures/browser-diagnostics.mjs";
import { verifySceneEntryLifetimes } from "./fixtures/villages-scene-entry-lifetime.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
try {
  await verifySceneEntryLifetimes(browser);
} finally {
  await browser.close();
}
