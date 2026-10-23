import assert from "node:assert/strict";
import { chromium, allowConsole, fulfill, mockEngineLookups } from "./fixtures/browser-diagnostics.mjs";

for (const kind of ["warning", "error", "pageerror", "popup", "allowed", "extra", "wrong-url", "http"]) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await mockEngineLookups(page);
  await page.route("http://diagnostics.test/", (route) =>
    fulfill(route, { contentType: "text/html", body: "<p>Ready</p>" }),
  );
  await page.goto("http://diagnostics.test/");
  if (kind === "pageerror") {
    const observed = page.waitForEvent("pageerror");
    await page.evaluate(() =>
      setTimeout(() => {
        throw Error("probe failure");
      }, 0),
    );
    await observed;
  } else if (kind === "popup") {
    const created = context.waitForEvent("page");
    await page.evaluate(() => window.open("about:blank"));
    await (await created).evaluate(() => console.warn("popup warning"));
  } else if (kind === "http") {
    await page.route("**/expected-failure", (route) => fulfill(route, { status: 503, json: { error: "expected" } }));
    await page.evaluate(() => fetch("/expected-failure"));
  } else if (["allowed", "extra", "wrong-url"].includes(kind)) {
    allowConsole(page, {
      type: "error",
      text: "expected error",
      url: kind === "wrong-url" ? "http://other.test/" : "",
    });
    await page.evaluate((twice) => {
      console.error("expected error");
      if (twice) console.error("expected error");
    }, kind === "extra");
  } else await page.evaluate((kind) => console[kind === "warning" ? "warn" : "error"]("unexpected diagnostic"), kind);
  if (kind === "allowed" || kind === "http") await browser.close();
  else await assert.rejects(browser.close(), /Unexpected browser diagnostics/);
}
console.log(
  "Browser diagnostics reject warnings, errors, page exceptions, popup errors and excess/mismatched allowances; explicit negative HTTP fixtures pass.",
);
