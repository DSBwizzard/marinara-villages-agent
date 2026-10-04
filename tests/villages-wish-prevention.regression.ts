import assert from "node:assert/strict";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import { defaultVillageState } from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import {
  compactWishChecks,
  readSystemInterpretations,
  systemInterpretations,
} from "../packages/villages/src/engine/packages/server/src/services/villages/interpretation.js";
import { completionFailure } from "../packages/villages/src/engine/packages/server/src/services/villages/work-failure.js";
import { wishFingerprint } from "../packages/villages/src/engine/packages/server/src/services/villages/wish-interpretation.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/engine/packages/server/src/services/villages/agenda-plan.js";
import "../packages/villages/src/engine/packages/server/src/services/villages/wish-progress.js";
import {
  queueBackgroundJob,
  startBackgroundWork,
  settleBackgroundWork,
  backgroundWorkSummaries,
  retryBackgroundJob,
  recoverBackgroundWork,
} from "../packages/villages/src/engine/packages/server/src/services/villages/background-work.js";
import { fixtureInterpretationChecks } from "./fixtures/villages-interpretation-payload.js";

async function main() {
  const at = new Date().toISOString();
  const check: any = {
    id: "long-canonical-check-id",
    domain: "wish",
    question: "Did they agree?",
    facts: {},
    outcomes: [{ id: "progress", statement: "Meaningful agreement" }],
    evidence: [
      { id: "private-player", speakerId: "player", name: "Player", content: "Saturday?", current: true },
      { id: "private-a", speakerId: "a", name: "A", content: "Agreed.", current: true },
    ],
  };
  const second = {
    ...check,
    id: "second",
    evidence: [{ id: "private-b", speakerId: "b", name: "B", content: "Friday.", current: true }],
  };
  const compact = compactWishChecks([check, second]);
  assert.ok(compact.outputTokens >= 1024 && compact.outputTokens <= 4096);
  const alias = (id: string) =>
    compact.wireChecks
      .flatMap((c) => c.evidence)
      .find((e) => e.content === check.evidence.find((line: any) => line.id === id)?.content)?.id;
  const good = { id: "c0", outcome: "progress", evidenceIds: [alias("private-player")], reason: "Agreement" };
  assert.equal(readSystemInterpretations(compact.decode({ results: [good] }), [check, second])[0].outcome, "progress");
  const foreign = compact.wireChecks[1].evidence[0].id;
  assert.equal(
    readSystemInterpretations(compact.decode({ results: [{ ...good, evidenceIds: [foreign] }] }), [check, second])[0]
      .failure?.cause,
    "invalid_citation",
  );
  assert.equal(
    readSystemInterpretations({ results: [{ id: check.id, outcome: "none" }] }, [check], false)[0].failure,
    undefined,
    "legacy negative responses retain their optional citation-array layout",
  );
  assert.equal(
    readSystemInterpretations({ results: [{ id: check.id, outcome: "none" }] }, [check])[0].failure?.cause,
    "invalid_citation",
    "new contracts require the declared citation array",
  );
  assert.equal(
    readSystemInterpretations(compact.decode({ results: [{ ...good, evidenceIds: ["private-player"] }] }), [
      check,
      second,
    ])[0].failure?.cause,
    "invalid_citation",
    "canonical IDs cannot bypass aliases",
  );
  assert.equal(readSystemInterpretations({ results: [] }, [check])[0].failure?.cause, "missing_result");
  assert.equal(
    readSystemInterpretations(
      {
        results: [
          { ...good, id: check.id },
          { ...good, id: check.id },
        ],
      },
      [check],
    )[0].failure?.cause,
    "duplicate_result",
  );
  assert.equal(readSystemInterpretations(null, [check])[0].failure?.cause, "invalid_json");
  assert.equal(
    readSystemInterpretations({ results: [{ id: check.id, outcome: "magic", evidenceIds: [] }] }, [check])[0].failure
      ?.cause,
    "unsupported_outcome",
  );
  assert.equal(
    readSystemInterpretations({ results: [{ id: check.id, outcome: "none", evidenceIds: [17] }] }, [check])[0].failure
      ?.cause,
    "invalid_citation",
  );
  assert.equal(
    readSystemInterpretations(
      { results: [{ id: check.id, outcome: "unresolved", evidenceIds: [], reason: "Meaning unclear" }] },
      [check],
    )[0].failure,
    undefined,
  );
  assert.equal(completionFailure({ content: "{}", finishReason: "length" }, "wish", 1024)?.cause, "output_limit");
  assert.equal(completionFailure({ content: " ", finishReason: "stop" }, "wish", 1024)?.cause, "empty_output");

  const state = defaultVillageState();
  state.seed = "prevention";
  state.foundedAt = state.setupAt = at;
  const records = new Map<string, any>();
  const contexts = ["a", "b", "c"].map((actorId) => ({
    actorId,
    village: "Village",
    setting: "",
    moment: {},
    card: { name: actorId },
    playerName: "Player",
    playerDescription: "",
    claim: "Check witnessed agreement",
    receipts: [],
    transcript: [],
    happenings: [],
    memory: [],
    worldState: [],
    wishes: [
      {
        id: "wish-" + actorId,
        wish: "Talk about gardening and agree on a planting day",
        intensity: 1,
        tell: "",
        addedAt: at,
        expiresAt: "",
        learnedAt: at,
      },
    ],
    evidence: [
      {
        id: "player-" + actorId,
        speakerId: "player",
        name: "Player",
        content: "Saturday is a good planting day.",
        at,
        current: true,
      },
      {
        id: "reply-" + actorId,
        speakerId: actorId,
        name: actorId,
        content: "Saturday works for me.",
        at,
        current: true,
      },
    ],
  }));
  state.villagers = contexts.map((context) => ({
    characterId: context.actorId,
    cardSnapshot: {
      id: context.actorId,
      name: context.actorId,
      capturedAt: at,
      revision: 1,
      sourceStatus: "available",
    },
    completedWishes: [],
    agenda: { ...unwrittenVillageAgenda(state.venues, context.actorId), wishes: context.wishes },
  })) as any;
  records.set("villages-village", { id: "villages-village", kind: "village", revision: 1, data: state });
  let calls = 0,
    omit = "b",
    fault: "none" | "before-effect" | "after-effect" | "response" | "result" = "none",
    ceiling = 4096,
    fittedCeiling = 4096,
    responseMode = "normal";
  const requested: number[] = [];
  const targets: string[][] = [];
  const release = configureVillagesRuntime({
    logger: { info() {}, debug() {}, debugOverride() {}, warn() {}, error() {} },
    persistence: {
      documents: {
        async getById(_p: string, id: string) {
          return structuredClone(records.get(id) ?? null);
        },
        async list(_p: string, kind: string) {
          return structuredClone([...records.values()].filter((r) => r.kind === kind));
        },
        async create(value: any) {
          const row = { ...structuredClone(value), revision: 1 };
          records.set(value.id, row);
          return structuredClone(row);
        },
        async update(value: any) {
          const prior = records.get(value.id);
          if (!prior || prior.revision !== value.expectedRevision) return null;
          if (fault === "before-effect" && value.id === "villages-village") {
            fault = "none";
            throw new Error("effect unavailable");
          }
          if (
            fault === "response" &&
            prior.kind === "background-work" &&
            value.data.steps?.some((s: any) => s.status === "completed")
          ) {
            fault = "none";
            throw new Error("response storage unavailable");
          }
          if (fault === "result" && prior.kind === "background-work" && value.data.hasResult) {
            fault = "none";
            throw new Error("result storage unavailable");
          }
          const row = { ...prior, ...structuredClone(value), revision: prior.revision + 1 };
          records.set(value.id, row);
          if (fault === "after-effect" && value.id === "villages-village") {
            fault = "none";
            throw new Error("effect acknowledgement lost");
          }
          return structuredClone(row);
        },
        async remove(_p: string, id: string) {
          return records.delete(id);
        },
      },
    },
    languageModels: {
      async resolveForRequest() {
        return {
          name: "Fixture",
          model: "mock",
          connectionId: "fixture",
          maxOutputTokens: ceiling,
          fitContext(messages: any, options: any) {
            return { messages, ...options, maxTokens: Math.min(options.maxTokens, fittedCeiling) };
          },
          async chatComplete(messages: any, options: any) {
            calls++;
            requested.push(options.maxTokens);
            const checks = fixtureInterpretationChecks(messages[1].content);
            targets.push(checks.map((c) => c.facts.actorId));
            if (responseMode === "blank") return { content: "", finishReason: "stop" };
            if (responseMode === "json") return { content: "unfinished {", finishReason: "stop" };
            if (responseMode === "length") return { content: "{}", finishReason: "length" };
            return {
              finishReason: "stop",
              content: JSON.stringify({
                results: checks
                  .filter((c) => c.facts.actorId !== omit)
                  .map((c) => ({
                    id: c.id,
                    outcome: "progress",
                    evidenceIds: c.evidence
                      .filter((line: any) => line.current && line.kind !== "claim")
                      .map((line: any) => line.id),
                    reason: "The planting day was agreed",
                    details: { proofKind: "conversation" },
                  })),
              }),
            };
          },
        };
      },
    },
  } as any);
  let stop = startBackgroundWork();
  const items = contexts.map((context) => ({
    sceneId: "project:prevention",
    submissionId: "turn",
    seed: state.seed,
    at,
    context,
    wish: context.wishes[0],
    proposal: {
      actorId: context.actorId,
      wishId: context.wishes[0].id,
      fingerprint: wishFingerprint(context.wishes[0] as any),
      intent: "check",
      lineIds: context.evidence.map((e) => e.id),
    },
  }));
  const work = (subject: string, inputItems = items) => ({
    kind: "wish-check" as const,
    subjectId: subject,
    seed: state.seed,
    revision: subject,
    finite: true,
    residentIds: inputItems.map((i) => i.proposal.actorId),
    label: subject,
    input: {
      contractVersion: 2,
      sceneId: "project:prevention",
      submissionId: subject,
      seed: state.seed,
      items: inputItems.map((item) => ({ ...item, submissionId: subject })),
    },
  });
  try {
    await queueBackgroundJob(work("partial"));
    await settleBackgroundWork();
    let job = (await backgroundWorkSummaries()).find((j) => j.subjectId === "partial")!;
    assert.equal(job.status, "failed");
    assert.equal(job.failure?.cause, "missing_result");
    assert.equal(
      Object.keys(records.get("villages-village").data.exchangeReceipts).length,
      2,
      "valid rows commit despite missing third row",
    );
    assert.ok(job.failedAt);
    await recoverBackgroundWork();
    await settleBackgroundWork();
    assert.equal(calls, 1, "no paid repair on recovery");
    stop();
    stop = startBackgroundWork();
    await settleBackgroundWork();
    assert.equal(calls, 1, "partial batch survives restart without requests");
    omit = "";
    await retryBackgroundJob(job.id, job.attempt, "retry-partial");
    await settleBackgroundWork();
    job = (await backgroundWorkSummaries()).find((j) => j.subjectId === "partial")!;
    assert.equal(job.status, "completed");
    assert.deepEqual(targets.at(-1), ["b"], "retry contains only unfinished row");
    assert.equal(Object.keys(records.get("villages-village").data.exchangeReceipts).length, 3);
    await retryBackgroundJob(job.id, job.attempt - 1, "retry-partial");
    await settleBackgroundWork();
    assert.equal(calls, 2, "lost retry response is idempotent");

    for (const mode of ["blank", "json", "length"]) {
      responseMode = mode;
      await queueBackgroundJob(work(mode, [items[0]]));
      await settleBackgroundWork();
      const failed = (await backgroundWorkSummaries()).find((j) => j.subjectId === mode)!;
      assert.equal(
        failed.failure?.cause,
        mode === "blank" ? "empty_output" : mode === "json" ? "invalid_json" : "output_limit",
      );
      const before = calls;
      await recoverBackgroundWork();
      await settleBackgroundWork();
      assert.equal(calls, before);
    }
    responseMode = "normal";
    const legacyWork = work("legacy", [items[0]]);
    delete (legacyWork.input as any).contractVersion;
    fault = "result";
    const beforeLegacy = calls;
    await queueBackgroundJob(legacyWork);
    await settleBackgroundWork();
    const legacyJob = (await backgroundWorkSummaries()).find((j) => j.subjectId === "legacy")!;
    assert.equal(legacyJob.status, "failed");
    assert.equal(requested.at(-1), 512, "legacy responses retain their request layout and allowance");
    await retryBackgroundJob(legacyJob.id, legacyJob.attempt, "retry-legacy");
    await settleBackgroundWork();
    assert.equal(calls, beforeLegacy + 1, "legacy purchased response replays without a replacement request");
    assert.equal((await backgroundWorkSummaries()).find((j) => j.subjectId === "legacy")?.status, "completed");
    for (const phase of ["before-effect", "after-effect", "result"] as const) {
      fault = phase;
      const before = calls;
      await queueBackgroundJob(work(phase, [items[0]]));
      await settleBackgroundWork();
      const failed = (await backgroundWorkSummaries()).find((j) => j.subjectId === phase)!;
      assert.equal(failed.status, "failed");
      assert.equal(failed.failure?.cause, "storage_application");
      await retryBackgroundJob(failed.id, failed.attempt, "retry-" + phase);
      await settleBackgroundWork();
      assert.equal(calls, before + 1, "application and acknowledgement retry reuse saved response");
      assert.equal((await backgroundWorkSummaries()).find((j) => j.subjectId === phase)?.status, "completed");
    }
    for (const phase of ["before-effect", "after-effect"] as const) {
      fault = phase;
      const before = calls;
      await queueBackgroundJob(work("restart-" + phase, [items[0]]));
      await settleBackgroundWork();
      assert.equal((await backgroundWorkSummaries()).find((j) => j.subjectId === "restart-" + phase)?.status, "failed");
      stop();
      stop = startBackgroundWork();
      await recoverBackgroundWork();
      await settleBackgroundWork();
      assert.equal(calls, before + 1, "restart performs local saved-result recovery without paid requests");
      assert.equal(
        (await backgroundWorkSummaries()).find((j) => j.subjectId === "restart-" + phase)?.status,
        "completed",
      );
    }
    fault = "response";
    await queueBackgroundJob(work("lost-response", [items[0]]));
    await settleBackgroundWork();
    const lost = (await backgroundWorkSummaries()).find((j) => j.subjectId === "lost-response")!;
    assert.equal(lost.failure?.cause, "unknown_request");
    const before = calls;
    stop();
    stop = startBackgroundWork();
    await settleBackgroundWork();
    assert.equal(calls, before, "unknown response storage never auto-retries");
    ceiling = 300;
    const beforePreflight = calls;
    const low = await systemInterpretations([check]);
    assert.equal(low[0].failure?.cause, "insufficient_budget");
    assert.equal(calls, beforePreflight, "impossible output allowance is caught before spending");

    ceiling = 4096;
    fittedCeiling = 500;
    const fittedLow = await systemInterpretations([check]);
    assert.equal(fittedLow[0].failure?.cause, "insufficient_budget");
    assert.equal(calls, beforePreflight, "context fitting cannot silently reduce the safe output floor");

    const live = records.get("villages-village");
    live.data.villagers = [];
    live.revision++;
    await recoverBackgroundWork();
    await settleBackgroundWork();
    const retired = (await backgroundWorkSummaries()).filter(
      (j) => j.status === "failed" || j.status === "interrupted",
    );
    assert.equal(retired.length, 0, "removed Wishes retire blocked jobs without model requests");
    assert.equal(calls, beforePreflight);
    console.log(
      "Wish prevention: aliases, witnesses, failure causes, partial commits, unfinished-only retries, restart, injected storage faults, preflight and retirement passed.",
    );
  } finally {
    stop();
    release();
  }
}
void main();
