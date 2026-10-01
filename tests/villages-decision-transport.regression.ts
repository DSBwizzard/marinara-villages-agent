import assert from "node:assert/strict";
import { createServer } from "node:http";
import { join } from "node:path";
import { loadDecisionEngineModules } from "../packages/villages/src/engine/packages/server/src/services/villages/decisions-adapter.js";

// Synthetic local provider, never a configured paid connection or an Engine server.
async function main() {
  assert.ok(process.env.MARINARA_ENGINE_ROOT);
  const requests: { url: string; authorization?: string; body: any }[] = [];
  let hold = false,
    linkedKey = "fixture-one";
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString());
    requests.push({ url: request.url!, authorization: request.headers.authorization, body });
    if (hold) return;
    response.setHeader("content-type", "application/json");
    response.end(
      JSON.stringify({
        answers: Object.fromEntries(Object.keys(body.questions).map((id) => [id, { type: "noul", noul: 0.8 }])),
      }),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const originalPolicy = process.env.PROVIDER_LOCAL_URLS_ENABLED;
  process.env.PROVIDER_LOCAL_URLS_ENABLED = "true";
  try {
    const { resolveDecisionBackend } = await loadDecisionEngineModules(
      join(process.env.MARINARA_ENGINE_ROOT!, "packages/server/dist/index.js"),
    );
    const connection = {
      id: "decision-fixture",
      provider: "decision",
      decisionSource: "custom",
      baseUrl,
      model: "fixture-model",
      apiKey: "",
      credentialsFromConnectionId: "linked-fixture",
      decisionTimeoutMs: 500,
    };
    let linkedOrigin = baseUrl;
    const deps = {
      getLocalDefault: async () => null,
      getThinkingPreGeneration: async () => false,
      getDefaultConnection: async () => connection,
      getConnectionWithKey: async () => ({
        id: "linked-fixture",
        provider: "custom",
        baseUrl: linkedOrigin,
        model: "fixture",
        apiKey: linkedKey,
      }),
      debugMode: false,
    };
    const state = {
      recent_messages: [
        { role: "user", name: "Player", content: "Can I look?" },
        { role: "assistant", name: "Aqua", content: "Oh yeah." },
      ],
    };
    const questions = [{ id: "invite", instructions: "Aqua permits the player to enter now." }];
    const backend = await resolveDecisionBackend(deps);
    assert.ok(backend);
    assert.equal(backend.calibration.defaultThreshold, 0.5);
    assert.equal((await backend.ask(state, questions))?.get("invite"), 0.8);
    assert.equal(requests[0].url, "/v1/systemone");
    assert.equal(requests[0].authorization, "Bearer fixture-one");
    assert.equal(requests[0].body.model, "fixture-model");
    linkedKey = "fixture-two";
    const rotated = await resolveDecisionBackend(deps);
    assert.ok(rotated);
    await rotated.ask(state, questions);
    assert.equal(requests[1].authorization, "Bearer fixture-two", "Engine re-resolves linked credentials");
    linkedOrigin = "http://different-origin.invalid";
    assert.equal(await resolveDecisionBackend(deps), null);
    assert.equal(requests.length, 2, "Engine origin rules preserved");
    linkedOrigin = baseUrl;
    hold = true;
    const limited = await resolveDecisionBackend(deps);
    assert.ok(limited);
    const started = performance.now();
    assert.equal((await limited.ask(state, questions))?.size ?? 0, 0);
    assert.ok(performance.now() - started < 2500, "Engine per-statement timeout retained");
    const controller = new AbortController();
    const cancelled = await resolveDecisionBackend(deps, controller.signal);
    assert.ok(cancelled);
    const request = cancelled.ask(state, questions);
    controller.abort();
    assert.equal((await request)?.size ?? 0, 0, "Engine transport cancellation retained");
    console.log(
      "Villages live-module transport proof: synthetic protocol, linked-key rotation/origin, calibration, timeout and cancellation ok",
    );
  } finally {
    if (originalPolicy === undefined) delete process.env.PROVIDER_LOCAL_URLS_ENABLED;
    else process.env.PROVIDER_LOCAL_URLS_ENABLED = originalPolicy;
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
void main();
