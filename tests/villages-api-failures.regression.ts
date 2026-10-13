import assert from "node:assert/strict";
import { request, requestHost, VillageApiError } from "../packages/villages/src/client/shared/api.js";

// Synthetic transport responses exercise the shipped request helpers; no server/provider requests.
const originalFetch = globalThis.fetch;
let calls = 0;
function respond(response: Response) {
  globalThis.fetch = async () => {
    calls++;
    return response;
  };
}
try {
  respond(new Response("", { status: 403 }));
  await assert.rejects(request("/setup/reset", { method: "POST" }), (error: unknown) => {
    assert.ok(error instanceof VillageApiError);
    assert.equal(error.status, 403);
    assert.match(error.message, /Could not reset the village/);
    assert.match(error.message, /Access was denied by the server or review gateway/);
    assert.match(error.message, /POST \/api\/villages\/setup\/reset/);
    return true;
  });

  respond(
    new Response("This review gateway blocks village reset.", {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    }),
  );
  await assert.rejects(request("/setup/reset", { method: "POST" }), /gateway blocks village reset.*HTTP 403/);

  respond(
    new Response(
      JSON.stringify({
        error: "Forbidden",
        message: "Reset is unavailable in this review. Open its Codex chat.",
        code: "REVIEW_ROUTE_DENIED",
      }),
      { status: 403 },
    ),
  );
  await assert.rejects(request("/setup/reset", { method: "POST" }), (error: unknown) => {
    assert.ok(error instanceof VillageApiError);
    assert.equal(error.code, "REVIEW_ROUTE_DENIED");
    assert.equal(error.status, 403);
    assert.equal(error.message, "Reset is unavailable in this review. Open its Codex chat.");
    return true;
  });

  for (const contentType of ["text/html", "text/plain"]) {
    for (const html of [
      "<!DOCTYPE html><html><body>proxy debug secret</body></html>",
      "<html><body>proxy debug secret</body></html>",
    ]) {
      respond(new Response(html, { status: 502, headers: { "Content-Type": contentType } }));
      await assert.rejects(requestHost("/api/connections?private-query=hidden"), (error: unknown) => {
        assert.ok(error instanceof VillageApiError);
        assert.match(error.message, /server could not complete the request/);
        assert.match(error.message, /HTTP 502; GET \/api\/connections/);
        assert.doesNotMatch(error.message, /debug secret|hidden|private-query|html/i);
        return true;
      });
    }
  }

  for (const [body, type] of [
    ["Forbidden", "text/plain"],
    [JSON.stringify({ error: "Forbidden" }), "application/json"],
  ]) {
    respond(new Response(body, { status: 403, headers: { "Content-Type": type } }));
    await assert.rejects(request("/setup/reset", { method: "POST" }), /Could not reset the village.*Access was denied/);
  }

  respond(
    new Response(JSON.stringify({ error: "Bad Request", message: "Scene revision changed", code: "SCENE_STALE" }), {
      status: 409,
    }),
  );
  await assert.rejects(request("/rooms/turn", { method: "POST" }), (error: unknown) => {
    assert.ok(error instanceof VillageApiError);
    assert.equal(error.message, "Scene revision changed");
    assert.equal(error.status, 409);
    assert.equal(error.code, "SCENE_STALE");
    return true;
  });

  respond(
    new Response(JSON.stringify({ error: "Invalid or missing X-Admin-Secret header", code: "ADMIN_REQUIRED" }), {
      status: 403,
    }),
  );
  await assert.rejects(requestHost("/api/connections"), (error: unknown) => {
    assert.ok(error instanceof VillageApiError);
    assert.match(error.message, /Settings → Advanced → Admin Access/);
    assert.equal(error.status, 403);
    assert.equal(error.code, "ADMIN_REQUIRED");
    return true;
  });

  for (const body of ["", "<html>unavailable</html>", "{truncated", "null"]) {
    respond(new Response(body, { status: 200 }));
    await assert.rejects(request("/setup/reset", { method: "POST" }), (error: unknown) => {
      assert.ok(error instanceof VillageApiError);
      assert.equal(error.code, "INVALID_RESPONSE");
      assert.match(error.message, /invalid or empty JSON response/);
      assert.match(error.message, /Reload to check the current state before trying again/);
      return true;
    });
  }

  const beforeNetwork = calls;
  globalThis.fetch = async () => {
    calls++;
    throw new TypeError("Failed to fetch");
  };
  await assert.rejects(request("/setup/reset", { method: "POST" }), (error: unknown) => {
    assert.ok(error instanceof VillageApiError);
    assert.equal(error.code, "NETWORK_ERROR");
    assert.equal(error.status, 0);
    assert.match(error.message, /reload to see whether the action completed before trying again/);
    return true;
  });
  assert.equal(calls, beforeNetwork + 1, "Failed mutations are never automatically retried");

  const aborted = new DOMException("Cancelled", "AbortError");
  globalThis.fetch = async () => {
    throw aborted;
  };
  await assert.rejects(requestHost("/api/connections"), (error: unknown) => error === aborted);
  for (const cause of [aborted, new Error("Disconnected")]) {
    respond(
      new Response(
        new ReadableStream({
          start(controller) {
            controller.error(cause);
          },
        }),
        { status: 200 },
      ),
    );
    await assert.rejects(request("/setup/reset", { method: "POST" }), (error: unknown) => {
      if (cause === aborted) assert.equal(error, aborted);
      else {
        assert.ok(error instanceof VillageApiError);
        assert.equal(error.code, "RESPONSE_READ_FAILED");
        assert.match(error.message, /check whether the action completed/);
      }
      return true;
    });
  }

  respond(new Response(null, { status: 204 }));
  assert.equal(await request("/memories/events/test", { method: "DELETE" }), null);
  respond(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  assert.deepEqual(await requestHost("/api/connections"), { ok: true });
} finally {
  globalThis.fetch = originalFetch;
}
console.log(
  "API failure regression passed: meaningful JSON/text/status/network errors, invalid responses, cancellation and no automatic mutation retry.",
);
