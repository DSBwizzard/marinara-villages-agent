import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { request, requestHost, VillageApiError } from "../packages/villages/src/client/shared/api.js";

const engineAccess = JSON.parse(
  readFileSync(new URL("../sources/engine-public/privileged-access.json", import.meta.url), "utf8"),
);
assert.match(engineAccess.revision, /^[a-f0-9]{40}$/u);
assert.match(engineAccess.sourceSha256, /^[a-f0-9]{64}$/u);
const hint = engineAccess.privilegedAccessHint;
const originalFetch = globalThis.fetch;
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
let response: Response;
let sent: { url: string; init: RequestInit };
globalThis.fetch = async (input, init) => {
  sent = { url: String(input), init: init ?? {} };
  return response;
};

function storage(value: string | null) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => {
          assert.equal(key, engineAccess.adminSecretStorageKey);
          return value;
        },
      },
    },
  });
}

try {
  for (const [send, path] of [
    [request, "/api/villages/probe"],
    [requestHost, "/probe"],
  ] as const) {
    const call = (init?: RequestInit) => send("/probe", init);
    const headers = async (init?: RequestInit) => {
      response = Response.json({ ok: true });
      assert.deepEqual(await call(init), { ok: true });
      assert.equal(sent.url, path);
      if (send === requestHost) {
        assert.equal(sent.init.cache, "no-store");
        assert.equal(sent.init.credentials, "same-origin");
      }
      return new Headers(sent.init.headers);
    };

    storage("  s3cret  ");
    assert.equal((await headers()).get("X-Admin-Secret"), "s3cret");
    const post = await headers({ method: "POST", headers: { "x-marinara-csrf": "1" }, body: "{}" });
    assert.equal(post.get("X-Admin-Secret"), "s3cret");
    assert.equal(post.get("x-marinara-csrf"), "1");
    assert.equal(post.get("Content-Type"), "application/json");
    for (const value of [null, "   "]) {
      storage(value);
      assert.equal((await headers()).has("X-Admin-Secret"), false);
    }
    assert.equal((await headers({ method: "POST" })).has("Content-Type"), false);
    assert.equal((await headers({ body: new FormData() })).has("Content-Type"), false);
    assert.equal(
      (await headers({ body: "{}", headers: { "Content-Type": "text/plain" } })).get("Content-Type"),
      "text/plain",
    );
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem: () => {
            throw new Error("blocked");
          },
        },
      },
    });
    assert.equal((await headers()).has("X-Admin-Secret"), false);
    Reflect.deleteProperty(globalThis, "window");
    assert.equal((await headers()).has("X-Admin-Secret"), false);
    storage(null);

    for (const detail of ["ADMIN_SECRET is required for privileged APIs", "Invalid or missing X-Admin-Secret header"]) {
      response = Response.json({ error: detail }, { status: 403 });
      await assert.rejects(
        call(),
        (error: unknown) =>
          error instanceof VillageApiError && error.status === 403 && error.message === `${hint} (${detail})`,
      );
    }
    for (const detail of [
      "Non-loopback access requires authentication because no Basic Auth credentials are configured.",
      "Privileged API is loopback-only",
    ]) {
      response = Response.json({ error: detail }, { status: 403 });
      await assert.rejects(call(), (error: unknown) => error instanceof VillageApiError && error.message === detail);
    }
    response = Response.json({ error: "Unauthorized" }, { status: 401 });
    await assert.rejects(call(), /Authentication is required\./u);
    response = new Response("<html>gateway failed</html>", { status: 500, headers: { "Content-Type": "text/html" } });
    await assert.rejects(
      call(),
      (error: unknown) =>
        error instanceof VillageApiError &&
        /The server could not complete the request/u.test(error.message) &&
        !error.message.includes("<html>"),
    );
    response = Response.json(
      { error: "Bad Request", message: "Invalid Scene revision", code: "SCENE_STALE" },
      { status: 400 },
    );
    await assert.rejects(
      call(),
      (error: unknown) =>
        error instanceof VillageApiError && error.message === "Invalid Scene revision" && error.code === "SCENE_STALE",
    );
    response = Response.json({ error: "Package failure", message: " " }, { status: 400 });
    await assert.rejects(call(), /Package failure/u);
    response = Response.json({ error: { message: "Unreadable" } }, { status: 400 });
    await assert.rejects(call(), /The server rejected the request/u);
    const snapshot = { settings: { venues: [{ id: "legacy", name: "Missing required objects" }] } };
    response = Response.json(snapshot);
    assert.deepEqual(
      await call(),
      send === request ? { settings: { venues: [] }, venueRequests: [] } : snapshot,
      "Villages snapshots cross the normalization boundary; Engine payloads keep their own shape.",
    );
  }
} finally {
  globalThis.fetch = originalFetch;
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
}

console.log("Villages remote access: actual package and Engine requests preserve authentication and refusals");
