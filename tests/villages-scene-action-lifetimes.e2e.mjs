import { existsSync } from "node:fs";
import { chromium } from "@playwright/test";
import { verifySceneActionLifetimes } from "./fixtures/villages-scene-action-lifetime.fixture.mjs";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" && existsSync(chrome) ? { executablePath: chrome } : {}),
});
try {
  await verifySceneActionLifetimes(browser);
} finally {
  await browser.close();
}
