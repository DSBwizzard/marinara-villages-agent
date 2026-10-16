import assert from "node:assert/strict";
import { createServer } from "node:http";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createDecisionsAdapter } from "../packages/villages/src/server/adapters/engine/decisions-adapter.js";

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
    // Test-only imports exercise the official capability implementation in an existing built runtime.
    const runtimeModule = (path: string) =>
      import(pathToFileURL(join(process.env.MARINARA_ENGINE_ROOT!, "packages/server/dist", path)).href);
    const { createCapabilityDecisionHost } = await runtimeModule(
      "services/capability-packages/capability-decision.service.js",
    );
    const { resolveDecisionBackend } = await runtimeModule("services/decision/decision-default.js");
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
    let limit = "32";
    const database = { select: () => ({ from: () => ({ where: async () => [{ value: limit }] }) }) };
    const capability = createCapabilityDecisionHost(database, (request: any) =>
      resolveDecisionBackend(deps, request.signal),
    );
    const adapter = createDecisionsAdapter({ decisions: capability } as any);
    const messages = [
      { role: "user" as const, name: "Player", content: "Can I look?" },
      { role: "assistant" as const, name: "Aqua", content: "Oh yeah." },
    ];
    const questions = [
      {
        id: "invite",
        question:
          'Player asks "Can I enter your room?"; Aqua answers "Oh yeah." Does Aqua permit the player to enter now?',
      },
    ];
    const request = { messages, questions };
    assert.equal((await adapter.status()).available, true);
    assert.equal(requests.length, 0);
    const result = await adapter.evaluate(request);
    assert.equal(result?.threshold, 0.5);
    assert.equal(result?.answers.invite, 0.8);
    assert.equal(requests[0].url, "/v1/systemone");
    assert.equal(requests[0].authorization, "Bearer fixture-one");
    assert.equal(requests[0].body.model, "fixture-model");
    linkedKey = "fixture-two";
    await adapter.evaluate(request);
    assert.equal(requests[1].authorization, "Bearer fixture-two", "Engine re-resolves linked credentials");
    linkedOrigin = "http://different-origin.invalid";
    assert.equal(await adapter.evaluate(request), null);
    assert.equal(requests.length, 2, "Engine origin rules preserved");
    linkedOrigin = baseUrl;
    hold = true;
    const started = performance.now();
    assert.equal(await adapter.evaluate(request), null);
    assert.ok(performance.now() - started < 2500, "Engine per-statement timeout retained");
    const controller = new AbortController();
    const cancelled = adapter.evaluate({ ...request, signal: controller.signal });
    controller.abort();
    await assert.rejects(cancelled, /abort/iu);
    hold = false;
    const beforeInvalid = requests.length;
    await assert.rejects(
      adapter.evaluate({ ...request, questions: [{ id: "long", question: "x".repeat(501) }] }),
      TypeError,
    );
    limit = "1";
    await assert.rejects(
      adapter.evaluate({ ...request, questions: [...questions, { id: "extra", question: "Second?" }] }),
      TypeError,
    );
    assert.equal(requests.length, beforeInvalid, "invalid or over-limit requests never reach transport");
    let witnessed: any;
    const trimmed = createCapabilityDecisionHost(database, async () => ({
      model: undefined,
      maxStateTokens: 1,
      calibration: { defaultThreshold: 0.1 },
      async askMixed(state: unknown, asked: unknown) {
        witnessed = { state, asked };
        return { answers: new Map([["invite", 0.8]]), choices: new Map() };
      },
    }));
    const tiny = await trimmed.evaluate({
      messages: [{ role: "user", content: "irrelevant ".repeat(1000) }],
      questions,
    });
    assert.equal(tiny.model, null);
    assert.equal(
      witnessed.asked[0].instructions,
      questions[0].question,
      "full question survives Engine state trimming",
    );
    adapter.dispose();
    console.log(
      "Villages public capability transport: validation, calibration, trimming, linked-key rotation/origin, timeout and cancellation ok",
    );
  } finally {
    if (originalPolicy === undefined) delete process.env.PROVIDER_LOCAL_URLS_ENABLED;
    else process.env.PROVIDER_LOCAL_URLS_ENABLED = originalPolicy;
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
void main();
