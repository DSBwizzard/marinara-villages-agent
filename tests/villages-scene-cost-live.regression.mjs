import assert from "node:assert/strict";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { runLiveSceneComparison } from "../scripts/scene-cost-live.mjs";

// This server supplies invented usage; no provider credentials or real model requests are involved.
const usage = { promptTokens: 100, completionTokens: 50, cachedPromptTokens: 20, completionReasoningTokens: 30 };
const attempts = [],
  messages = [],
  submissions = new Set();
let generations = 0;
let baselineProblem = "";
const server = createServer(async (request, response) => {
  const path = new URL(request.url, "http://localhost").pathname;
  let body = "";
  for await (const chunk of request) body += chunk;
  const input = body ? JSON.parse(body) : null;
  const send = (value) => response.end(JSON.stringify(value));
  response.setHeader("Content-Type", "application/json");
  if (request.method === "GET" && path === "/api/connections/")
    return send([{ id: "model", model: "fixture", provider: "custom", profileImportReviewRequired: "false" }]);
  if (path === "/api/chats/game") return send({ mode: "game", connectionId: "model" });
  if (path === "/api/capability-packages/installed")
    return send([{ id: "villages", version: "0.8.1", status: "active" }]);
  if (path === "/api/villages/connections") return send({ narrationConnectionId: "model" });
  if (path === "/api/villages/usage") return send({ requests: attempts, running: 0 });
  if (path === "/api/villages/rooms/active") return send({ session: { sceneRevision: submissions.size + 1 } });
  if (path === "/api/chats/game/messages") return send(messages);
  if (path === "/api/generate") {
    assert.equal(input.reasoningEffort, undefined);
    assert.equal(input.maxTokens, undefined);
    generations++;
    messages.push({
      id: "game:" + generations,
      role: "assistant",
      content: "A reply.",
      extra: {
        ...(baselineProblem === "planning"
          ? { gameToolPlanning: { usage: { promptTokens: 200, completionTokens: 30 } } }
          : {}),
        cachedPrompt: [{ role: "system", content: "Complete authored identity." }],
        generationInfo: {
          model: baselineProblem === "model" ? "unexpected" : "fixture",
          tokensPrompt: 100,
          tokensCompletion: 50,
          tokensCachedPrompt: 20,
          tokensReasoning: 30,
          requestCount: 1,
        },
      },
    });
    return response.end('data: {"type":"done"}\n\n');
  }
  if (path === "/api/villages/rooms/turn") {
    if (input.submissionId === "explicit-retry") assert.equal(input.retryOfAttemptId, "previous-attempt");
    if (!submissions.has(input.submissionId)) {
      submissions.add(input.submissionId);
      if (submissions.size === 2) attempts.push({ id: "uncertain", status: "unknown" });
      attempts.push({
        id: "village:" + submissions.size,
        status: "complete",
        connectionId: "model",
        model: baselineProblem === "village-model" ? "unexpected" : "fixture",
        usage,
      });
    }
    return send({ session: { processingSummary: { failed: 0, pending: 0, rejected: 0 } } });
  }
  response.statusCode = 404;
  send({ error: path });
});
await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const previous = process.env.VILLAGES_ENGINE_URL;
process.env.VILLAGES_ENGINE_URL = `http://127.0.0.1:${server.address().port}`;
try {
  const report = await runLiveSceneComparison(
    {
      chatId: "game",
      sessionId: "scene",
      connectionId: "model",
      rate: { input: 0.3, cached: 0.006, output: 1.2, currency: "USD" },
      pairs: [
        { id: "ordinary", message: "Hello." },
        { id: "unknown-attempt", message: "Another turn." },
      ],
    },
    resolve(".build-tmp", `scene-cost-live-test-${randomUUID()}.json`),
  );
  const expected = (80 * 0.3 + 20 * 0.006 + 50 * 1.2) / 1_000_000;
  assert.equal(report.turns[0].ratedCostUsd, expected, "Reasoning is already included in completion");
  assert.equal(report.turns[1].ratedCostUsd, expected);
  assert.equal(report.turns[2].capabilityAttemptCount, 2);
  assert.equal(report.turns[2].additionalAttempts, 1);
  assert.equal(report.turns[2].unknownCostAttempts, 1);
  assert.equal(report.turns[2].ratedCostUsd, null, "Unknown billed attempts cannot be priced as zero");
  assert.equal(report.turns[2].knownRatedSubtotalUsd, expected);
  assert.equal(report.turns[2].replayAttempts.length, 0);
  assert.equal(generations, 2);
  assert.equal(report.actualInvoiceCostUsd, null);
  const retried = await runLiveSceneComparison(
    {
      chatId: "game",
      sessionId: "scene",
      connectionId: "model",
      pairs: [{ id: "retry", message: "Hello.", submissionId: "explicit-retry", retryOfAttemptId: "previous-attempt" }],
    },
    resolve(".build-tmp", `scene-cost-live-test-${randomUUID()}.json`),
  );
  assert.equal(retried.turns[0].submissionId, "explicit-retry");
  assert.equal(retried.turns[0].capabilityAttemptCount, 1);
  assert.equal(retried.turns[0].replayAttempts.length, 0);
  for (const problem of ["planning", "model", "village-model"]) {
    baselineProblem = problem;
    const output = resolve(".build-tmp", `scene-cost-live-test-${randomUUID()}.json`);
    await assert.rejects(
      runLiveSceneComparison(
        {
          chatId: "game",
          sessionId: "scene",
          connectionId: "model",
          rate: { input: 0.3, cached: 0.006, output: 1.2, currency: "USD" },
          pairs: [{ id: problem, message: "Another paid result must remain accountable." }],
        },
        output,
      ),
    );
    const failed = JSON.parse(await readFile(output, "utf8")).turns.at(-1);
    assert.equal(failed.status, "failed");
    if (problem === "village-model") {
      assert.equal(failed.attempts[0].usage.completionTokens, 50);
      assert.equal(failed.unknownCostAttempts, 1);
      assert.equal(failed.identityMismatch, true);
    } else {
      assert.equal(failed.usage.completionTokens, 50, "A disqualified purchased baseline retains its available usage");
      assert(failed.promptSha256);
    }
    assert.equal(failed.ratedCostUsd, null);
    if (problem === "planning") assert.equal(failed.gameToolPlanning.usage.promptTokens, 200);
  }
} finally {
  if (previous === undefined) delete process.env.VILLAGES_ENGINE_URL;
  else process.env.VILLAGES_ENGINE_URL = previous;
  await new Promise((done) => server.close(done));
}
console.log(
  "Native comparison accounting retains all attempts, unknown billing and replay checks without double-counting reasoning; mocked HTTP only.",
);
