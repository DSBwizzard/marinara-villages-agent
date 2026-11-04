import { expect as base } from "@playwright/test";

// In-memory fixture state usually settles on the next event loop. Poll it sooner
// while retaining Playwright's original deadline and every existing assertion.
// Separate instance: this does not change other tests or product timers.
export function fastExpect(options = {}) {
  const instance = base.configure(options);
  const poll = instance.poll;
  instance.poll = (actual, options) =>
    poll(actual, { intervals: [10, 25, 50, 100], ...(typeof options === "string" ? { message: options } : options) });
  return instance;
}
export const expect = fastExpect();
