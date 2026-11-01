import { chromium, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { verifySceneEntryLifetimes } from "./fixtures/villages-scene-entry-lifetime.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
await withBrowser(browser, async () => {
  await verifySceneEntryLifetimes(browser);
});
