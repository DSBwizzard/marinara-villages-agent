import { chromium } from "@playwright/test";
import { verifySceneRestorationLifetimes } from "./fixtures/villages-scene-restoration-lifetime.fixture.mjs";

const browser = await chromium.launch({
  headless: true,
});
try {
  await verifySceneRestorationLifetimes(browser);
} finally {
  await browser.close();
}
