import { chromium } from "./fixtures/browser-diagnostics.mjs";
// Test cases: scene/movement, scene/exit
import { verifySceneActionLifetimes } from "./fixtures/villages-scene-action-lifetime.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
try {
  await verifySceneActionLifetimes(browser);
} finally {
  await browser.close();
}
