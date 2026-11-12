import { readPrivateDiagnostics } from "../packages/villages/src/server/adapters/observability/private-diagnostics.js";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readEffectiveVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  boundedRejectedText,
  privateRejectedText,
  REJECTED_RESPONSE_TEXT_LIMIT,
} from "../packages/villages/src/server/domain/rules/rejected-response.js";
import { responseDiagnostics } from "../packages/villages/src/server/domain/rules/response-diagnostics.js";
import { completeSceneObject } from "../packages/villages/src/server/domain/rules/scene-writing-contract.js";
import { buildResidentPlanningMessages } from "../packages/villages/src/server/domain/rules/resident-planning.js";
import { WorkFailureError } from "../packages/villages/src/server/domain/rules/work-failure.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { completeWithRoom } from "../packages/villages/src/server/features/generation/model-requests.js";
import { createResidentPlanning } from "../packages/villages/src/server/features/residents/resident-planning-service.js";
import {
  backgroundWorkSummaries,
  backgroundJobSnapshot,
  queueBackgroundJob,
  recoverBackgroundWork,
  registerBackgroundHandler,
  settleBackgroundWork,
  startBackgroundWork,
} from "../packages/villages/src/server/jobs/background-work.js";
import {
  coordinateVenue,
  readVenueOperation,
  rejectVenueCompletion,
} from "../packages/villages/src/server/jobs/venue-coordinator.js";
import { residentPlanningInput } from "./fixtures/resident-planning.fixture.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";

async function main() {
  const at = new Date().toISOString();
  const state = coerceVillageState({
    ...defaultVillageState(),
    seed: "response-format-fixture",
    name: "QA",
    setting: "A village",
    timeZone: "UTC",
    setupAt: at,
    foundedAt: at,
    villagers: [
      {
        characterId: "a",
        incarnation: "ada-one",
        letterFontId: "caveat",
        addedAt: at,
        cardSnapshot: { id: "a", name: "Ada", capturedAt: at, revision: 1, sourceStatus: "available" },
      },
    ],
  });
  const rows = new Map<string, any>([
    ["villages-village", { id: "villages-village", packageId: "villages", kind: "village", data: state, revision: 1 }],
  ]);
  let failDiagnostics = false;
  let conflictDiagnostics = false;
  const documents = {
    async getById(_p: string, id: string) {
      return structuredClone(rows.get(id) ?? null);
    },
    async list(_p: string, kind: string) {
      return structuredClone([...rows.values()].filter((row) => row.kind === kind));
    },
    async create(input: any) {
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(input.id, row);
      return structuredClone(row);
    },
    async update(input: any) {
      if (input.id === "villages-private-diagnostics") {
        if (failDiagnostics) throw Error("fixture diagnostic failure");
        if (conflictDiagnostics) {
          conflictDiagnostics = false;
          return null;
        }
      }
      const old = rows.get(input.id);
      if (!old || old.revision !== input.expectedRevision) return null;
      const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
      rows.set(input.id, row);
      return structuredClone(row);
    },
    async remove(_p: string, id: string) {
      return rows.delete(id);
    },
  };
  let calls = 0;
  let output = "{}";
  let finishReason = "stop";
  let providerError = false;
  const optionsSeen: any[] = [];
  const model = {
    model: "fixture",
    connectionId: "fixture",
    maxContext: 16000,
    maxOutputTokens: 4096,
    fitContext(messages: any[], options: any) {
      return { messages, ...options };
    },
    async chatComplete(_messages: any[], options: any) {
      calls++;
      optionsSeen.push(options);
      if (providerError) throw Error("response_format json_object is unsupported");
      return { content: output, finishReason, usage: { promptTokens: 2772, completionTokens: 16, totalTokens: 2788 } };
    },
  };
  const release = configureVillagesRuntime({
    isDebugAgentsEnabled: () => false,
    persistence: { documents: villageFixtureDocuments(documents) },
    languageModels: { resolveForRequest: async () => model },
    getAgentConfig: async () => null,
    logger: { debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} },
  } as any);
  const planningInput = residentPlanningInput(state, "a", at, "routine-a");
  const planning = createResidentPlanning({
    activeVenueSession: async () => null,
    readVillageState: async () => state,
    readEffectiveVillagerCard,
    queueBackgroundJob,
    backgroundJobSnapshot,
    villagesLanguageModels: () => ({ resolveForRequest: async () => model }) as any,
    villagesConnectionIdFor: async () => "fixture",
    completeWithRoom,
  }).handler;
  const jsonOptions = { temperature: 0, debugMode: false, responseFormat: { type: "json_object" } };
  const truncated = '{"segments":[{"kind":"narration","text":"The gate creaks."}],"keep":[{"text":"cut';
  assert.equal(completeSceneObject(truncated, "length"), null);
  assert.equal(
    responseDiagnostics(model, { content: truncated, finishReason: "length" }, 1600, null).parseStatus,
    "invalid",
  );
  const prompt = buildResidentPlanningMessages(planningInput.context);
  assert.match(String(prompt[0].content), /A quiet result \{\} is valid/);
  assert.deepEqual(JSON.parse(String(prompt[1].content)).opportunity, planningInput.context.narration.opportunity);
  const stop = startBackgroundWork();
  try {
    await completeWithRoom(model as any, [{ role: "user", content: "JSON" }], 3000, jsonOptions);
    assert.deepEqual(optionsSeen.at(-1).responseFormat, { type: "json_object" });
    await completeWithRoom(model as any, [{ role: "user", content: "Plain" }], 3000, {
      temperature: 0,
      debugMode: false,
    });
    assert.equal(optionsSeen.at(-1).responseFormat, undefined, "unrelated request formats are unchanged");
    const messages: any[] = [{ role: "user", content: "JSON" }];
    const priorHash = createHash("sha256")
      .update(JSON.stringify(["fixture", "fixture", messages, 3000, 0, undefined, undefined]))
      .digest("hex");
    const formatHash = createHash("sha256")
      .update(JSON.stringify(["fixture", "fixture", messages, 3000, 0, undefined, undefined, { type: "json_object" }]))
      .digest("hex");
    const makeSaved = (id: string, status: string, fingerprint = formatHash) => {
      rows.set("villages-venue-visit-" + id, {
        id: "villages-venue-visit-" + id,
        packageId: "villages",
        kind: "venue-visit",
        revision: 1,
        data: {
          version: 5,
          villageSeed: state.seed,
          id,
          status: "active",
          sceneRevision: 0,
          startedAt: at,
          lastActivityAt: at,
          lines: [],
          submissions: [],
          operation: {
            id,
            kind: "turn",
            input: {},
            token: "old",
            attemptId: "old",
            status: "interrupted",
            stage: "turn",
            startedAt: new Date().toISOString(),
            sceneRevision: 0,
            snapshot: null,
            checkpoints: {},
            attempts: {
              ["turn:0:" + fingerprint]: { status, result: { content: '{"saved":true}', finishReason: "stop" } },
            },
            error: "interrupted",
          },
        },
      });
    };
    makeSaved("saved-complete", "complete");
    const beforeReplay = calls;
    const replayed = await coordinateVenue(
      "saved-complete",
      "saved-complete",
      "turn",
      {},
      0,
      undefined,
      () => completeWithRoom(model as any, messages, 3000, jsonOptions),
      { recovery: true },
    );
    assert.equal(replayed.content, '{"saved":true}');
    assert.equal(calls, beforeReplay, "completed exact JSON request replays without another purchase");
    makeSaved("saved-unknown", "dispatching");
    await assert.rejects(
      coordinateVenue(
        "saved-unknown",
        "saved-unknown",
        "turn",
        {},
        0,
        undefined,
        () => completeWithRoom(model as any, messages, 3000, jsonOptions),
        { recovery: true },
      ),
      (error: any) => error.code === "OPERATION_INTERRUPTED" && error.statusCode === 409,
    );
    assert.equal(calls, beforeReplay, "unknown requests keep their explicit-retry refusal code and never dispatch");
    makeSaved("saved-rejected", "rejected");
    await assert.rejects(
      coordinateVenue(
        "saved-rejected",
        "saved-rejected",
        "turn",
        {},
        0,
        undefined,
        () => completeWithRoom(model as any, messages, 3000, jsonOptions),
        { recovery: true },
      ),
      (error: any) => error.code === "OPERATION_INTERRUPTED",
    );
    makeSaved("saved-superseded", "complete", priorHash);
    rows.get("villages-venue-visit-saved-superseded").data.operation.attempts["turn:0:" + formatHash] = {
      status: "rejected",
    };
    await assert.rejects(
      coordinateVenue(
        "saved-superseded",
        "saved-superseded",
        "turn",
        {},
        0,
        undefined,
        () => completeWithRoom(model as any, messages, 3000, jsonOptions),
        { recovery: true },
      ),
      (error: any) => error.code === "OPERATION_INTERRUPTED",
    );
    assert.equal(calls, beforeReplay, "rejected or superseded replies cannot resurrect an older completed response");
    makeSaved("saved-paid", "complete", priorHash);
    const paidScene = rows.get("villages-venue-visit-saved-paid").data;
    paidScene.operation.attempts["turn:0:" + formatHash] = { status: "rejected" };
    output = "not JSON";
    const beforePaid = calls;
    await assert.rejects(
      coordinateVenue("saved-paid", "saved-paid", "turn", {}, 0, "old", async () => {
        await completeWithRoom(model as any, messages, 3000, jsonOptions);
        await rejectVenueCompletion({ model: "fixture", connectionId: "fixture", reason: "invalid-json" });
        throw Error("fixture validation rejection");
      }),
      /fixture validation rejection/,
    );
    const diagnostic = readPrivateDiagnostics(rows.get("villages-private-diagnostics").data).entries.at(-1);
    assert.equal(diagnostic.content, "not JSON");
    assert.equal(diagnostic.reason, "invalid-json");
    assert.equal(diagnostic.model, "fixture");
    assert.equal(diagnostic.sceneId, "saved-paid");
    assert.equal(diagnostic.syntaxError, "No JSON object found");
    assert.equal(diagnostic.finishReason, "stop");
    assert.equal(diagnostic.responseLength, 8);
    assert.ok(diagnostic.attemptId && diagnostic.operationId && diagnostic.capturedAt);
    assert.ok(boundedRejectedText("x".repeat(50_000)).length <= REJECTED_RESPONSE_TEXT_LIMIT);
    assert.ok(!privateRejectedText("Bearer abc.def api_key=private-secret").includes("private-secret"));
    assert.ok(!privateRejectedText("Bearer abc.def").includes("abc.def"));
    assert.ok(
      !JSON.stringify(await readVenueOperation("saved-paid")).includes("not JSON"),
      "public recovery summary never exposes rejected text",
    );
    for (let index = 0; index < 107; index++) {
      const id = "diagnostic-bound-" + index;
      makeSaved(id, "rejected");
      await assert.rejects(
        coordinateVenue(id, id, "turn", {}, 0, "old", async () => {
          await completeWithRoom(model as any, messages, 3000, jsonOptions);
          await rejectVenueCompletion({ model: "fixture", connectionId: "fixture", reason: "invalid-json" });
          throw Error("diagnostic fixture");
        }),
        /diagnostic fixture/,
      );
    }
    assert.equal(
      readPrivateDiagnostics(rows.get("villages-private-diagnostics").data).entries.length,
      100,
      "diagnostics bounded globally across Scenes",
    );
    assert.equal(
      readPrivateDiagnostics(rows.get("villages-private-diagnostics").data).entries[0].sceneId,
      "diagnostic-bound-7",
    );
    const capture = async (id: string) => {
      makeSaved(id, "rejected");
      await assert.rejects(
        coordinateVenue(id, id, "turn", {}, 0, "old", async () => {
          await completeWithRoom(model as any, messages, 3000, jsonOptions);
          await rejectVenueCompletion({ model: "fixture", connectionId: "fixture", reason: "invalid-json" });
          throw Error("diagnostic fixture");
        }),
        /diagnostic fixture/,
      );
    };
    conflictDiagnostics = true;
    await Promise.all([capture("concurrent-diagnostic-a"), capture("concurrent-diagnostic-b")]);
    const concurrent = readPrivateDiagnostics(rows.get("villages-private-diagnostics").data).entries;
    assert.ok(concurrent.some((entry: any) => entry.sceneId === "concurrent-diagnostic-a"));
    assert.ok(concurrent.some((entry: any) => entry.sceneId === "concurrent-diagnostic-b"));
    assert.equal(concurrent.length, 100);
    failDiagnostics = true;
    await capture("diagnostic-write-failed");
    failDiagnostics = false;
    assert.equal(
      rows.get("villages-venue-visit-diagnostic-write-failed").data.operation.attempts["turn:0:" + formatHash].status,
      "rejected",
    );
    assert.equal(readPrivateDiagnostics(rows.get("villages-private-diagnostics").data).entries.length, 100);
    const afterDiagnosticFixtures = calls;
    const paidAttempts = rows.get("villages-venue-visit-saved-paid").data.operation.attempts;
    assert.equal(paidAttempts["turn:0:" + formatHash].status, "rejected", "rejection targets the exact paid retry");
    assert.equal(
      paidAttempts["turn:0:" + priorHash].status,
      "complete",
      "unrelated fingerprint response is not incorrectly rejected",
    );
    assert.equal(afterDiagnosticFixtures - beforePaid, 111);
    await assert.rejects(
      coordinateVenue(
        "saved-paid",
        "saved-paid",
        "turn",
        {},
        0,
        undefined,
        () => completeWithRoom(model as any, messages, 3000, jsonOptions),
        { recovery: true },
      ),
      (error: any) => error.code === "OPERATION_INTERRUPTED",
    );
    assert.equal(
      calls,
      afterDiagnosticFixtures,
      "free recovery neither replays invalid retry output nor dispatches again",
    );
    for (const [content, finish, cause] of [
      ["No entries yet — Events is empty.", "stop", "invalid_json"],
      ["", "stop", "empty_output"],
      ["{", "length", "output_limit"],
      ['{"encounter":{},"reflection":{}}', "stop", "missing_result"],
    ]) {
      output = content;
      finishReason = finish;
      const before = calls;
      await assert.rejects(planning.generate(planningInput), (error: any) => {
        assert.ok(error instanceof WorkFailureError, String(error.stack));
        assert.equal(error.failure.cause, cause);
        assert.equal(error.failure.responseDiagnostics.responseLength, content.trim().length);
        assert.equal(error.failure.responseDiagnostics.connectionId, "fixture");
        return true;
      });
      assert.equal(calls - before, 1, "invalid output never triggers an automatic replacement request");
    }
    output = "No entries yet — Events is empty.";
    finishReason = "stop";
    registerBackgroundHandler("agenda", {
      generate: () => planning.generate(planningInput),
      valid: () => true,
      apply() {
        throw Error("Invalid output cannot apply");
      },
    });
    const input: any = {
      kind: "agenda",
      subjectId: "format",
      residentId: "a",
      seed: state.seed,
      revision: "1",
      finite: true,
      label: "Events fixture",
      input: {},
    };
    await queueBackgroundJob(input);
    await settleBackgroundWork();
    const job = (await backgroundJobSnapshot("agenda", "format"))!;
    assert.equal(job.failure.cause, "invalid_json");
    assert.equal(job.steps[0].response.content, output);
    assert.equal(job.steps[0].responseDiagnostics.model, "fixture");
    assert.deepEqual(optionsSeen.at(-1).responseFormat, { type: "json_object" });
    const beforeRead = calls;
    await recoverBackgroundWork();
    await backgroundWorkSummaries();
    assert.equal(calls, beforeRead);
    const routineIdea = {
      characterId: "a",
      activity: "Read quietly",
      venueId: "park",
      zoneId: "exterior",
      flexible: true,
    };
    const supportedInput = {
      ...planningInput,
      context: {
        ...planningInput.context,
        housing: [{ characterId: "a", destinations: [{ id: "destination", name: "Open home" }] }],
        plans: [
          {
            id: "offered-plan",
            dateKey: planningInput.dateKey,
            actors: [{ id: "a", incarnation: "ada-one" }],
            venueId: "park",
            zoneId: "exterior",
            startMinute: 480,
            endMinute: 510,
            revisions: { a: "0".repeat(64) },
            kind: "avoidance",
            status: "planned",
          },
        ],
      },
    };
    const supported = {
      housingRequests: [{ characterId: "a", venueId: "destination" }],
      routineIdea,
      planId: "offered-plan",
    };
    for (const unsupported of ["happenings", "memory", "notices", "venueRequests", "featureEdits", "lapsed"]) {
      output = JSON.stringify({ ...supported, [unsupported]: [] });
      const before = calls;
      await assert.rejects(
        planning.generate(supportedInput),
        (error: any) => error.failure?.cause === "missing_result",
      );
      assert.equal(calls - before, 1);
    }
    output = JSON.stringify(supported);
    const beforeValid = calls;
    const valid = await planning.generate(supportedInput);
    assert.equal(calls - beforeValid, 1, "supported Events use one completion without repair");
    assert.deepEqual(valid.proposal, { ...supported, keep: [], requires: [], commands: [] });
    output = "{}";
    assert.deepEqual((await planning.generate(planningInput)).proposal, {
      keep: [],
      requires: [],
      commands: [],
      housingRequests: [],
    });
    providerError = true;
    const beforeError = calls;
    await assert.rejects(
      completeWithRoom(model as any, [{ role: "user", content: "JSON" }], 3000, jsonOptions),
      (error: any) => {
        assert.equal(error.failure.cause, "provider_exception");
        assert.equal(error.failure.model, model.model);
        assert.equal(error.failure.connectionId, model.connectionId);
        assert.equal(error.failure.detail, "response_format json_object is unsupported");
        assert.match(error.message, /rejected JSON mode/);
        return true;
      },
    );
    assert.equal(calls - beforeError, 1);
    await queueBackgroundJob({ ...input, subjectId: "unsupported", revision: "2" });
    await settleBackgroundWork();
    const failed = [...rows.values()].find(
      (row) => row.kind === "background-work" && row.data.subjectId === "unsupported",
    )!.data;
    assert.equal(failed.requests, 1, JSON.stringify(failed));
    assert.match(failed.error, /rejected JSON mode/);
    assert.equal(failed.failure.cause, "provider_exception");
    console.log(
      "villages-response-format: complete contracts, saved failure reproduction, JSON forwarding, typed diagnostics and manual-only recovery passed (mocked providers)",
    );
  } finally {
    stop();
    release();
  }
}
await main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
