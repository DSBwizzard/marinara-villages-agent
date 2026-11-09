import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { usageDollars } from "../packages/villages/src/server/adapters/models/usage-accounting.ts";

/** Deliberately paid, opt-in integration measurement; preparation never changes saved model settings. */
export async function runLiveSceneComparison(config, output) {
  const base = new URL(process.env.VILLAGES_ENGINE_URL);
  assert(
    ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname) && base.port !== "8500",
    "Use an isolated loopback Engine, never 8500",
  );
  assert(config.chatId && config.sessionId && config.connectionId && config.pairs?.length);
  if (config.rate) {
    for (const key of ["input", "output"])
      assert(
        Number.isFinite(config.rate[key]) && config.rate[key] >= 0,
        "Provide current nonnegative rates per million tokens",
      );
  }
  const headers = {
    "Content-Type": "application/json",
    Origin: base.origin,
    "x-marinara-csrf": "1",
    ...(process.env.VILLAGES_ENGINE_ADMIN_SECRET ? { "X-Admin-Secret": process.env.VILLAGES_ENGINE_ADMIN_SECRET } : {}),
  };
  const request = async (path, method = "GET", body) => {
    const response = await fetch(new URL(path, base), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(600_000),
    });
    const text = await response.text();
    if (!response.ok) throw Error(`${method} ${path}: HTTP ${response.status}: ${text.slice(0, 500)}`);
    return text;
  };
  const call = async (...args) => JSON.parse(await request(...args));
  const listed = await call("/api/connections/");
  const connection = listed.find((row) => row.id === config.connectionId);
  assert(
    connection && connection.profileImportReviewRequired === "false",
    "Prepare the copied connection normally before measurement",
  );
  const chat = await call(`/api/chats/${config.chatId}`);
  assert.equal(chat.mode, "game");
  assert.equal(chat.connectionId, config.connectionId);
  assert.equal((await call("/api/villages/connections")).narrationConnectionId, config.connectionId);
  const report = {
    format: 1,
    measurement: "live-engine-usage",
    startedAt: new Date().toISOString(),
    declaredRuntimeIdentity: config.runtimeIdentity ?? null,
    installed: await call("/api/capability-packages/installed"),
    model: connection.model,
    providedRate: config.rate ?? null,
    actualInvoiceCostUsd: null,
    reasoningAccounting:
      "Reported reasoning is a subset of completion for OpenAI-compatible providers; zero is not proof of no reasoning.",
    requestAccounting:
      "All Villages capability attempts are retained. Provider-internal retries are not exposed by the Capability API. Unknown billed usage is never counted as zero.",
    turns: [],
  };
  await mkdir(dirname(output), { recursive: true });
  const save = () => writeFile(output, JSON.stringify(report, null, 2) + "\n");
  const rows = (value) => (Array.isArray(value) ? value : value.messages);
  const price = (usage) => usageDollars(usage, config.rate ?? null, config.pricingProvider ?? connection.provider);
  const intendedAttempt = (row) => row.connectionId === config.connectionId && row.model === connection.model;
  const append = async (mode, pair) => {
    const turn = {
      mode,
      caseId: pair.id,
      message: pair.message,
      submissionId: randomUUID(),
      startedAt: new Date().toISOString(),
      status: "running",
      actualInvoiceCostUsd: null,
      ratedCostUsd: null,
      reportedRequestCount: null,
    };
    report.turns.push(turn);
    await save();
    const started = performance.now();
    let beforeUsage;
    try {
      if (mode === "game") {
        const before = rows(await call(`/api/chats/${config.chatId}/messages`));
        const text = await request("/api/generate", "POST", {
          chatId: config.chatId,
          connectionId: config.connectionId,
          userMessage: pair.message,
          submissionId: turn.submissionId,
          streaming: true,
        });
        const events = text
          .split(/\r?\n/u)
          .filter((line) => line.startsWith("data: "))
          .flatMap((line) => {
            try {
              return [JSON.parse(line.slice(6))];
            } catch {
              return [];
            }
          });
        turn.errors = events.filter((event) => /error/iu.test(event.type ?? ""));
        const after = rows(await call(`/api/chats/${config.chatId}/messages`));
        const message = after
          .filter((row) => row.role === "assistant" && !before.some((old) => old.id === row.id))
          .at(-1);
        assert(message, "Game Mode must save a new response");
        const extra = typeof message.extra === "string" ? JSON.parse(message.extra) : message.extra;
        const info = extra.generationInfo ?? {};
        turn.gameToolPlanning = extra.gameToolPlanning ?? null;
        turn.generationInfo = info;
        turn.usage = Object.fromEntries(
          Object.entries({
            promptTokens: info.tokensPrompt,
            completionTokens: info.tokensCompletion,
            cachedPromptTokens: info.tokensCachedPrompt,
            cacheWritePromptTokens: info.tokensCacheWritePrompt,
            completionReasoningTokens: info.tokensReasoning,
          }).filter(([, value]) => typeof value === "number"),
        );
        turn.reportedRequestCount = info.requestCount ?? null;
        turn.promptCharacters = extra.cachedPrompt?.reduce((sum, row) => sum + row.content.length, 0) ?? null;
        turn.promptSha256 = extra.cachedPrompt
          ? createHash("sha256").update(JSON.stringify(extra.cachedPrompt)).digest("hex")
          : null;
        turn.outputCharacters = message.content.length;
        assert(
          !turn.gameToolPlanning,
          "Use a controlled Game baseline without a separate tool-planning request; its usage is retained for inspection",
        );
        assert.equal(info.model, connection.model, "The comparison must retain the selected model");
        turn.ratedCostUsd = price(turn.usage);
        assert.equal(turn.errors.length, 0, "Game Mode reported a generation error");
      } else {
        beforeUsage = await call("/api/villages/usage?details=1");
        assert.equal(beforeUsage.running, 0, "Use a quiet isolated world");
        const active = await call("/api/villages/rooms/active");
        const payload = {
          sessionId: config.sessionId,
          submissionId: turn.submissionId,
          message: pair.message,
          mode: "chat",
          targetId: "",
          expectedSceneRevision: active.session.sceneRevision,
        };
        const result = await call("/api/villages/rooms/turn", "POST", payload);
        turn.processingSummary = result.session?.processingSummary;
        turn.turnOutcome = result.turnOutcome ?? null;
        assert(!turn.turnOutcome, "Villages retained a failed turn");
        assert.equal(turn.processingSummary?.failed, 0, "Check rejected consequences before comparing costs");
        assert.equal(turn.processingSummary?.pending, 0);
        const after = await call("/api/villages/usage?details=1");
        turn.attempts = after.requests.filter((row) => !beforeUsage.requests.some((old) => old.id === row.id));
        assert(
          turn.attempts.every((row) => row.status !== "complete" || intendedAttempt(row)),
          "Unrelated or changed-model usage invalidates a controlled comparison",
        );
        await call("/api/villages/rooms/turn", "POST", payload);
        const replay = await call("/api/villages/usage?details=1");
        turn.replayAttempts = replay.requests.filter((row) => !after.requests.some((old) => old.id === row.id));
        assert.equal(turn.replayAttempts.length, 0, "Replay purchased another response");
      }
      turn.status = "complete";
    } catch (error) {
      turn.status = "failed";
      turn.error = String(error);
      throw error;
    } finally {
      if (beforeUsage) {
        try {
          const after = await call("/api/villages/usage?details=1");
          turn.attempts = after.requests.filter((row) => !beforeUsage.requests.some((old) => old.id === row.id));
          turn.capabilityAttemptCount = turn.attempts.length;
          turn.additionalAttempts = Math.max(0, turn.attempts.length - 1);
          turn.identityMismatch = turn.attempts.some((row) => row.status === "complete" && !intendedAttempt(row));
          if (turn.identityMismatch) {
            turn.status = "failed";
            turn.error = "Unrelated or changed-model usage invalidates a controlled comparison";
          }
          const costs = turn.attempts.map((row) =>
            row.status === "complete" && intendedAttempt(row) ? price(row.usage) : null,
          );
          turn.knownRatedSubtotalUsd = costs.reduce((sum, value) => sum + (value ?? 0), 0);
          turn.unknownCostAttempts = costs.filter((value) => value === null).length;
          turn.ratedCostUsd = turn.attempts.length && !turn.unknownCostAttempts ? turn.knownRatedSubtotalUsd : null;
        } catch (error) {
          turn.usageReadError = String(error);
        }
      }
      turn.latencyMs = Math.round(performance.now() - started);
      await save();
      assert(!turn.identityMismatch, turn.error);
    }
  };
  try {
    for (const pair of config.pairs) {
      assert(typeof pair.id === "string" && typeof pair.message === "string");
      await append("villages", pair);
      await append("game", pair);
    }
    report.finishedAt = new Date().toISOString();
    return report;
  } finally {
    await save();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert(
    process.argv.length === 3 || process.argv.length === 4,
    "Use npm run bench:scene:live -- config.json [report.json]; this purchases provider requests",
  );
  const config = JSON.parse(await readFile(process.argv[2], "utf8"));
  const report = await runLiveSceneComparison(config, resolve(process.argv[3] ?? ".build-tmp/scene-cost/live.json"));
  console.log(
    `${report.turns.length} native comparison turns recorded; inspect usage, unknown costs and accepted consequences in the report.`,
  );
}
