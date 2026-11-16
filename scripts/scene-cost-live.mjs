import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, realpath, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { usageDollars } from "../packages/villages/src/server/adapters/models/usage-accounting.ts";

function logicalTurns(turns) {
  const groups = new Map();
  for (const turn of turns) {
    const key = JSON.stringify([turn.caseId, turn.mode]);
    const attempts = groups.get(key) ?? [];
    attempts.push(turn);
    groups.set(key, attempts);
  }
  return Array.from(groups.values(), (turns) => {
    const { caseId, mode, status } = turns.at(-1);
    const knownRatedSubtotalUsd = turns.reduce(
      (sum, turn) => sum + (turn.ratedCostUsd ?? turn.knownRatedSubtotalUsd ?? 0),
      0,
    );
    return {
      caseId,
      mode,
      status,
      submissionIds: [...new Set(turns.map((turn) => turn.submissionId))],
      submissions: turns.length,
      knownRatedSubtotalUsd,
      ratedCostUsd: turns.every((turn) => Number.isFinite(turn.ratedCostUsd)) ? knownRatedSubtotalUsd : null,
    };
  });
}

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
      redirect: "error",
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
  const installed = await call("/api/capability-packages/installed");
  const binding = {
    origin: base.origin,
    connectionId: config.connectionId,
    chatId: config.chatId,
    sessionId: config.sessionId,
    model: connection.model,
    provider: config.pricingProvider ?? connection.provider,
    settings: createHash("sha256")
      .update(
        JSON.stringify([
          connection.provider,
          connection.baseUrl,
          connection.maxContext,
          connection.maxTokensOverride,
          connection.enableCaching,
          connection.anthropicExtendedCacheTtl,
          connection.cachingAtDepth,
          connection.defaultParameters,
          connection.suppressModelParameters,
          connection.openrouterProvider,
        ]),
      )
      .digest("hex"),
    runtime: config.runtimeIdentity ?? null,
    rate: config.rate ?? null,
  };
  const previousPath = config.continueFrom && (await realpath(config.continueFrom));
  const prior = previousPath && JSON.parse(await readFile(previousPath, "utf8"));
  if (prior) {
    assert(isDeepStrictEqual(prior.binding, binding), "Continuation must use the same runtime, chat, Scene and rate");
    assert(isDeepStrictEqual(prior.installed, installed), "Installed package inventory changed");
    assert(Array.isArray(prior.turns), "Continuation needs the original benchmark report");
    assert(
      prior.endedAt && !prior.turns.some((turn) => turn.status === "running"),
      "Resolve the interrupted dispatch before continuing",
    );
  }
  const plan = [];
  const planned = new Set();
  for (const pair of config.pairs) {
    assert(typeof pair.id === "string" && pair.id && typeof pair.message === "string");
    assert(pair.mode === undefined || ["villages", "game"].includes(pair.mode), "Invalid comparison mode");
    if (pair.retryOfAttemptId)
      assert(typeof pair.retryOfAttemptId === "string" && typeof pair.submissionId === "string" && pair.submissionId);
    for (const mode of pair.mode ? [pair.mode] : ["villages", "game"]) {
      const key = JSON.stringify([pair.id, mode]);
      assert(!planned.has(key), "A comparison mode may run only once per case in a report");
      planned.add(key);
      assert(
        (prior?.turns ?? []).every((turn) => turn.caseId !== pair.id || turn.message === pair.message),
        "A continued case must keep the original player input",
      );
      const previous = prior?.turns.findLast((turn) => turn.caseId === pair.id && turn.mode === mode);
      if (previous) {
        assert.equal(previous.status, "failed", "Only a failed submission can be retried");
        if (mode === "villages") {
          assert(pair.retryOfAttemptId, "Village continuation needs the explicit native retry");
          assert(
            pair.replaceOfOperationId
              ? pair.replaceOfOperationId === previous.submissionId && pair.submissionId !== previous.submissionId
              : pair.submissionId === previous.submissionId,
            "Village retry must identify the original submission",
          );
        } else {
          assert(
            pair.retryGame === true && previous.gameHasAssistant === false,
            "Game continuation needs a failed native response",
          );
        }
      } else {
        assert(!pair.retryGame && !pair.replaceOfOperationId, "A replacement needs the prior benchmark report");
      }
      plan.push({ mode, pair, previous });
    }
  }
  const report = {
    format: 1,
    measurement: "live-engine-usage",
    startedAt: prior?.startedAt ?? new Date().toISOString(),
    binding,
    declaredRuntimeIdentity: config.runtimeIdentity ?? null,
    installed,
    model: connection.model,
    providedRate: config.rate ?? null,
    actualInvoiceCostUsd: null,
    reasoningAccounting:
      "Reported reasoning is a subset of completion for OpenAI-compatible providers; zero is not proof of no reasoning.",
    requestAccounting:
      "All Villages capability attempts are retained. Provider-internal retries are not exposed by the Capability API. Unknown billed usage is never counted as zero.",
    turns: prior?.turns ?? [],
    logicalTurns: [],
  };
  const rows = (value) => (Array.isArray(value) ? value : value.messages);
  const price = (usage) => usageDollars(usage, config.rate ?? null, config.pricingProvider ?? connection.provider);
  const intendedAttempt = (row) => row.connectionId === config.connectionId && row.model === connection.model;
  const accountVillageAttempts = (turn) => {
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
  };
  if (prior?.turns.some((turn) => turn.mode === "villages" && turn.unknownCostAttempts > 0)) {
    const observed = (await call("/api/villages/usage?details=1")).requests;
    for (const turn of report.turns) {
      if (turn.mode !== "villages" || !turn.unknownCostAttempts) continue;
      turn.attempts = turn.attempts.map((old) => {
        if (old.status === "complete") return old;
        const settled = observed.find((row) => row.id === old.id && row.status === "complete");
        if (!settled) return old;
        assert.equal(settled.connectionId, old.connectionId);
        assert.equal(settled.model, old.model);
        return settled;
      });
      accountVillageAttempts(turn);
    }
  }
  await mkdir(dirname(output), { recursive: true });
  const contents = () => {
    report.logicalTurns = logicalTurns(report.turns);
    return JSON.stringify(report, null, 2) + "\n";
  };
  await writeFile(output, contents(), { flag: "wx", flush: true });
  if (previousPath) {
    // A journal can authorize only one continuation, including across output paths.
    await writeFile(previousPath + ".continued", resolve(output) + "\n", { flag: "wx", flush: true });
  }
  const save = async () => {
    const pending = output + "." + randomUUID() + ".pending";
    await writeFile(pending, contents(), { flag: "wx", flush: true });
    await rename(pending, output);
  };
  const append = async ({ mode, pair, previous }) => {
    const turn = {
      mode,
      caseId: pair.id,
      message: pair.message,
      submissionId: mode === "villages" ? (pair.submissionId ?? randomUUID()) : randomUUID(),
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
        turn.gameHistoryTailId = before.at(-1)?.id ?? null;
        let savedPlayerInput = false;
        if (previous) {
          const priorPlayerInput = before.find((row) => {
            const extra = typeof row.extra === "string" ? JSON.parse(row.extra) : row.extra;
            return row.role === "user" && extra?.submissionId === previous.submissionId;
          });
          if (priorPlayerInput) {
            assert.equal(priorPlayerInput.id, turn.gameHistoryTailId, "Game history advanced past the failed input");
            assert.equal(priorPlayerInput.content, pair.message, "The saved Game input changed");
            savedPlayerInput = true;
          } else {
            assert.equal(turn.gameHistoryTailId, previous.gameHistoryTailId, "Game history changed after the failure");
          }
        }
        const text = await request("/api/generate", "POST", {
          chatId: config.chatId,
          connectionId: config.connectionId,
          ...(savedPlayerInput ? {} : { userMessage: pair.message, submissionId: turn.submissionId }),
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
        turn.gameHasAssistant = !!message;
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
        assert(!info.fallback, "The comparison must retain the selected connection");
        turn.knownRatedSubtotalUsd = price(turn.usage);
        assert.equal(turn.reportedRequestCount, 1, "Use a Game baseline with one observed generation request");
        turn.ratedCostUsd = turn.knownRatedSubtotalUsd;
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
          ...(pair.retryOfAttemptId ? { retryOfAttemptId: pair.retryOfAttemptId } : {}),
          ...(pair.replaceOfOperationId ? { replaceOfOperationId: pair.replaceOfOperationId } : {}),
        };
        const result = await call("/api/villages/rooms/turn", "POST", payload);
        turn.processingSummary = result.session?.processingSummary;
        const changes = await call(`/api/villages/rooms/${encodeURIComponent(config.sessionId)}/changes`);
        assert(Array.isArray(changes.unresolved), "Native consequence status must be available");
        assert(changes.unresolved.length < 50, "Native consequence status is incomplete; inspect the exact turn");
        turn.unresolvedConsequences = changes.unresolved.filter((row) => row.submissionId === turn.submissionId);
        assert.equal(
          turn.unresolvedConsequences.length,
          0,
          "A failed, pending or discarded consequence invalidates this comparison",
        );
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
          accountVillageAttempts(turn);
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
    for (const submission of plan) await append(submission);
    report.finishedAt = new Date().toISOString();
    return report;
  } finally {
    report.endedAt = new Date().toISOString();
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
