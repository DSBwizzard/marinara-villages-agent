import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
// Test cases: scene/movement, scene/exit
import { verifySceneActionLifetimes } from "./fixtures/villages-scene-action-lifetime.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
await withBrowser(browser, async () => {
  await verifySceneActionLifetimes(browser);
});
