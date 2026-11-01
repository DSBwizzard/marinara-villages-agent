import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { verifySceneRestorationLifetimes } from "./fixtures/villages-scene-restoration-lifetime.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
await withBrowser(browser, async () => {
  await verifySceneRestorationLifetimes(browser);
});
