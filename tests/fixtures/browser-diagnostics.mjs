import { STATUS_CODES } from "node:http";
import assert from "node:assert/strict";
import { chromium as browserType, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";

export { expect };
const expectations = new WeakMap();
const deskAsset = fileURLToPath(new URL("../../packages/villages/menu-desk.jpg", import.meta.url));
const mockDeskAsset = (context) =>
  context.route("**/api/capability-packages/villages/assets/menu-desk.jpg", (route) =>
    route.fulfill({ path: deskAsset, contentType: "image/jpeg" }),
  );

/** Register a bounded diagnostic for a deliberate negative fixture response. */
export function allowConsole(page, { type, text, url, count = 1 }) {
  assert.ok(Number.isInteger(count) && count > 0);
  const entries = expectations.get(page) ?? [];
  entries.push({ type, text, url, remaining: count });
  expectations.set(page, entries);
}

export const chromium = {
  async launch(options) {
    const browser = await browserType.launch(options);
    const watched = new WeakSet();
    const unexpected = [];
    const watch = (page) => {
      if (watched.has(page)) return;
      watched.add(page);
      page.on("pageerror", (error) => unexpected.push({ type: "pageerror", text: error.message, url: page.url() }));
      page.on("console", (message) => {
        const type = message.type();
        if (type !== "warning" && type !== "error") return;
        const text = message.text(),
          url = message.location().url;
        const allowed = expectations
          .get(page)
          ?.find(
            (entry) =>
              entry.remaining > 0 &&
              entry.type === type &&
              (typeof entry.text === "string" ? entry.text === text : entry.text.test(text)) &&
              entry.url === url,
          );
        if (allowed) allowed.remaining--;
        else unexpected.push({ type, text, url });
      });
    };
    const newContext = browser.newContext.bind(browser);
    browser.newContext = async (...args) => {
      const context = await newContext(...args);
      await mockDeskAsset(context);
      context.on("page", watch);
      return context;
    };
    const newPage = browser.newPage.bind(browser);
    browser.newPage = async (...args) => {
      const page = await newPage(...args);
      await mockDeskAsset(page.context());
      page.context().on("page", watch);
      watch(page);
      return page;
    };
    const close = browser.close.bind(browser);
    browser.close = async (...args) => {
      await close(...args);
      assert.deepEqual(unexpected, [], "Unexpected browser diagnostics");
    };
    return browser;
  },
};

/** Preserve the test failure as well as diagnostics collected during cleanup. */
export async function withBrowser(browser, work) {
  let value, failure, cleanupFailure;
  try {
    value = await work();
  } catch (error) {
    failure = { error };
  }
  try {
    await browser.close();
  } catch (error) {
    cleanupFailure = { error };
  }
  if (failure && cleanupFailure)
    throw new AggregateError([failure.error, cleanupFailure.error], "Browser test and cleanup failed", {
      cause: failure.error,
    });
  if (failure) throw failure.error;
  if (cleanupFailure) throw cleanupFailure.error;
  return value;
}

/** Synthetic Engine lists used by package fixtures; specific test routes take precedence. */
export async function mockEngineLookups(target) {
  await target.route("**/api/characters/personas/*", (route) => route.fulfill({ json: { avatarPath: "" } }));
  for (const path of ["characters/summaries", "connections"])
    await target.route("**/api/" + path, (route) => route.fulfill({ json: [] }));
}

/** A deliberate negative response may emit at most one matching browser resource diagnostic. */
export async function fulfill(route, options) {
  if (options.status >= 400) {
    const reason = options.statusText ?? STATUS_CODES[options.status] ?? "";
    allowConsole(route.request().frame().page(), {
      type: "error",
      url: route.request().url(),
      text: "Failed to load resource: the server responded with a status of " + options.status + " (" + reason + ")",
    });
  }
  return route.fulfill(options);
}

export async function abort(route, code = "failed") {
  const errors = {
    failed: "ERR_FAILED",
    aborted: "ERR_ABORTED",
    timedout: "ERR_TIMED_OUT",
    connectionrefused: "ERR_CONNECTION_REFUSED",
  };
  assert.ok(errors[code], "Declare the intended browser error for this failure fixture");
  allowConsole(route.request().frame().page(), {
    type: "error",
    url: route.request().url(),
    text: "Failed to load resource: net::" + errors[code],
  });
  return route.abort(code);
}
