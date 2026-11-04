import assert from "node:assert/strict";
import { mock } from "node:test";
import { getEventListeners } from "node:events";
import {
  PROVIDER_REQUEST_TIMEOUT_MS,
  withProviderDeadline,
} from "../packages/villages/src/server/adapters/models/provider-deadline.js";

async function main() {
  assert.equal(PROVIDER_REQUEST_TIMEOUT_MS, 120_000);
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    let calls = 0;
    let signal!: AbortSignal;
    let resolveLate!: (value: string) => void;
    const parent = new AbortController();
    const pending = withProviderDeadline((s) => {
      calls++;
      signal = s;
      return new Promise<string>((resolve) => {
        resolveLate = resolve;
      });
    }, parent.signal);
    let settled = false;
    void pending.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    const rejected = assert.rejects(pending, /timed out after 120 seconds.*may have been billed.*explicitly retry/);
    await Promise.resolve();
    mock.timers.tick(119_999);
    await Promise.resolve();
    assert.equal(settled, false);
    mock.timers.tick(1);
    await rejected;
    assert.equal(signal.aborted, true);
    assert.equal(calls, 1);
    assert.equal(getEventListeners(parent.signal, "abort").length, 0);
    resolveLate("late reply");
    await Promise.resolve();
    mock.timers.tick(60_000);
    assert.equal(calls, 1, "No automatic retry after timeout or late completion");
    const error = new Error("original provider error");
    await assert.rejects(
      withProviderDeadline(async () => {
        throw error;
      }),
      (e) => e === error,
    );
    await assert.rejects(
      withProviderDeadline(() => {
        throw error;
      }),
      (e) => e === error,
    );
    const preAborted = new AbortController();
    preAborted.abort(error);
    await assert.rejects(
      withProviderDeadline(async () => {
        assert.fail("Aborted request must not dispatch");
      }, preAborted.signal),
      (e) => e === error,
    );
    const cancel = new AbortController();
    const cancelled = withProviderDeadline(async () => new Promise<never>(() => {}), cancel.signal);
    const cancellation = assert.rejects(cancelled, (e) => e === error);
    await Promise.resolve();
    cancel.abort(error);
    await cancellation;
    assert.equal(getEventListeners(cancel.signal, "abort").length, 0);
    let finish!: (value: string) => void;
    const first = withProviderDeadline(
      () =>
        new Promise<string>((resolve) => {
          finish = resolve;
        }),
    );
    await Promise.resolve();
    mock.timers.tick(20_000);
    finish("first");
    assert.equal(await first, "first");
    let secondSignal!: AbortSignal;
    const second = withProviderDeadline((s) => {
      secondSignal = s;
      return new Promise<never>(() => {});
    });
    const secondFailure = assert.rejects(second, /120 seconds/);
    await Promise.resolve();
    mock.timers.tick(119_999);
    assert.equal(secondSignal.aborted, false);
    mock.timers.tick(1);
    await secondFailure;
    const completeParent = new AbortController();
    assert.equal(await withProviderDeadline(async () => "ok", completeParent.signal), "ok");
    assert.equal(getEventListeners(completeParent.signal, "abort").length, 0);
    mock.timers.tick(60_000);
    console.log(
      "Provider deadline: firm 120 seconds, ignored abort, late completion, independent requests, cancellation and cleanup passed; fake providers only.",
    );
  } finally {
    mock.timers.reset();
  }
}
void main();
