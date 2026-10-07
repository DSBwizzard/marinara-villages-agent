import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { coordinateVenue, rejectVenueCompletion } from "../packages/villages/src/server/jobs/venue-coordinator.js";
import { completeWithRoom } from "../packages/villages/src/server/features/generation/model-requests.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { buildTickMessages } from "../packages/villages/src/server/domain/rules/village-bootstrap-rules.js";
import { proposeHappenings } from "../packages/villages/src/server/features/founding/village-bootstrap.js";
import { buildVenueTextContract } from "../packages/villages/src/server/domain/rules/venue-response-contract.js";
import { extractSceneReply } from "../packages/villages/src/server/domain/rules/scene-reply-json.js";
import {
  responseDiagnostics,
  sceneMissingFields,
} from "../packages/villages/src/server/domain/rules/response-diagnostics.js";
import { WorkFailureError } from "../packages/villages/src/server/domain/rules/work-failure.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { deriveVillageMoment } from "../packages/villages/src/server/domain/rules/village-clock.js";
import {
  registerBackgroundHandler,
  queueBackgroundJob,
  startBackgroundWork,
  settleBackgroundWork,
  backgroundWorkSummaries,
  recoverBackgroundWork,
} from "../packages/villages/src/server/jobs/background-work.js";

async function main() {
  const state = defaultVillageState();
  state.seed = "response-format-fixture";
  state.setupAt = state.foundedAt = new Date().toISOString();
  const rows = new Map<string, any>([
    ["villages-village", { id: "villages-village", packageId: "villages", kind: "village", data: state, revision: 1 }],
  ]);
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
    persistence: { documents },
    languageModels: { resolveForRequest: async () => model },
    getAgentConfig: async () => null,
    logger: { debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} },
  } as any);
  const context: any = {
    village: "QA",
    setting: "A village",
    moment: deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now: new Date() }),
    residents: [
      { characterId: "a", name: "Ada", summary: "Ada", doing: "Resting", profile: "Ada", agenda: { wishes: [] } },
    ],
    venues: [],
    opportunities: [{ id: "opportunity", kind: "wish", actorIds: ["a"], venueId: "park", facts: ["A quiet morning"] }],
    recent: [],
    noticeboard: [],
    memory: [],
    pendingVenueNames: [],
  };
  const jsonOptions = { temperature: 0, debugMode: false, retryEmpty: false, responseFormat: { type: "json_object" } };
  const examples = buildVenueTextContract("a", ["a"], true)
    .split("\n")
    .filter((line) => line.startsWith("{"));
  assert.equal(examples.length, 2);
  for (const example of examples) {
    const raw = JSON.parse(example);
    assert.deepEqual(sceneMissingFields(raw), []);
    assert.deepEqual(raw.heardPlayerBy, []);
  }
  const truncated =
    '{"heardPlayerBy":[],"segments":[{"kind":"narration","text":"The gate creaks.","heardBy":[]}],"memoryChanges":[{"text":"cut';
  const salvaged = extractSceneReply(truncated);
  assert.ok(salvaged?.segments);
  assert.equal(salvaged.memoryChanges, undefined);
  assert.equal(
    responseDiagnostics(
      model,
      { content: truncated, finishReason: "length" },
      1600,
      salvaged,
      true,
      sceneMissingFields(salvaged),
    ).parseStatus,
    "salvaged",
  );
  const prompt = buildTickMessages(context);
  assert.match(prompt[1].content, /Generate the supplied opportunity/);
  assert.ok(!prompt[1].content.includes("What appears in Events?"));
  assert.match(prompt[0].content, /"opportunityId":"opportunity"/);
  const stop = startBackgroundWork();
  try {
    await completeWithRoom(model as any, [{ role: "user", content: "JSON" }], 3000, jsonOptions);
    assert.deepEqual(optionsSeen.at(-1).responseFormat, { type: "json_object" });
    await completeWithRoom(model as any, [{ role: "user", content: "Plain" }], 3000, {
      temperature: 0,
      debugMode: false,
      retryEmpty: false,
    });
    assert.equal(optionsSeen.at(-1).responseFormat, undefined, "unrelated request formats are unchanged");
    const legacyMessages: any[] = [{ role: "user", content: "JSON" }];
    const legacyHash = createHash("sha256")
      .update(JSON.stringify(["fixture", "fixture", legacyMessages, 3000, 0, undefined, undefined]))
      .digest("hex");
    const makeLegacy = (id: string, status: string) => {
      rows.set("villages-venue-visit-" + id, {
        id: "villages-venue-visit-" + id,
        packageId: "villages",
        kind: "venue-visit",
        revision: 1,
        data: {
          id,
          status: "active",
          sceneRevision: 0,
          lastActivityAt: new Date().toISOString(),
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
              ["turn:0:" + legacyHash]: { status, result: { content: '{"saved":true}', finishReason: "stop" } },
            },
            error: "interrupted",
          },
        },
      });
    };
    makeLegacy("legacy-complete", "complete");
    const beforeLegacy = calls;
    const legacy = await coordinateVenue(
      "legacy-complete",
      "legacy-complete",
      "turn",
      {},
      0,
      undefined,
      () => completeWithRoom(model as any, legacyMessages, 3000, jsonOptions),
      { recovery: true },
    );
    assert.equal(legacy.content, '{"saved":true}');
    assert.equal(calls, beforeLegacy, "completed purchased legacy JSON survives the new format option");
    makeLegacy("legacy-unknown", "dispatching");
    await assert.rejects(
      coordinateVenue(
        "legacy-unknown",
        "legacy-unknown",
        "turn",
        {},
        0,
        undefined,
        () => completeWithRoom(model as any, legacyMessages, 3000, jsonOptions),
        { recovery: true },
      ),
      (error: any) => error.code === "OPERATION_INTERRUPTED" && error.statusCode === 409,
    );
    assert.equal(calls, beforeLegacy, "unknown requests keep their explicit-retry refusal code and never dispatch");
    makeLegacy("legacy-rejected", "rejected");
    await assert.rejects(
      coordinateVenue(
        "legacy-rejected",
        "legacy-rejected",
        "turn",
        {},
        0,
        undefined,
        () => completeWithRoom(model as any, legacyMessages, 3000, jsonOptions),
        { recovery: true },
      ),
      (error: any) => error.code === "OPERATION_INTERRUPTED",
    );
    makeLegacy("legacy-superseded", "complete");
    const formatHash = createHash("sha256")
      .update(
        JSON.stringify(["fixture", "fixture", legacyMessages, 3000, 0, undefined, undefined, { type: "json_object" }]),
      )
      .digest("hex");
    rows.get("villages-venue-visit-legacy-superseded").data.operation.attempts["turn:0:" + formatHash] = {
      status: "rejected",
    };
    await assert.rejects(
      coordinateVenue(
        "legacy-superseded",
        "legacy-superseded",
        "turn",
        {},
        0,
        undefined,
        () => completeWithRoom(model as any, legacyMessages, 3000, jsonOptions),
        { recovery: true },
      ),
      (error: any) => error.code === "OPERATION_INTERRUPTED",
    );
    assert.equal(calls, beforeLegacy, "rejected or superseded replies cannot resurrect an older completed response");
    makeLegacy("legacy-paid", "complete");
    const paidScene = rows.get("villages-venue-visit-legacy-paid").data;
    paidScene.operation.attempts["turn:0:" + formatHash] = { status: "rejected" };
    paidScene.submissions = [{ id: "legacy-paid" }];
    output = "not JSON";
    const beforePaid = calls;
    await assert.rejects(
      coordinateVenue("legacy-paid", "legacy-paid", "turn", {}, 0, "old", async () => {
        await completeWithRoom(model as any, legacyMessages, 3000, jsonOptions);
        await rejectVenueCompletion();
        throw Error("fixture validation rejection");
      }),
      /fixture validation rejection/,
    );
    const paidAttempts = rows.get("villages-venue-visit-legacy-paid").data.operation.attempts;
    assert.equal(paidAttempts["turn:0:" + formatHash].status, "rejected", "rejection targets the exact paid retry");
    assert.equal(
      paidAttempts["turn:0:" + legacyHash].status,
      "complete",
      "legacy response is not incorrectly rejected",
    );
    assert.equal(calls - beforePaid, 1);
    await assert.rejects(
      coordinateVenue(
        "legacy-paid",
        "legacy-paid",
        "turn",
        {},
        0,
        undefined,
        () => completeWithRoom(model as any, legacyMessages, 3000, jsonOptions),
        { recovery: true },
      ),
      (error: any) => error.code === "OPERATION_INTERRUPTED",
    );
    assert.equal(calls - beforePaid, 1, "free recovery neither replays invalid retry output nor dispatches again");
    for (const [content, finish, cause] of [
      ["No entries yet — Events is empty.", "stop", "invalid_json"],
      ["", "stop", "empty_output"],
      ["{", "length", "output_limit"],
      ["{}", "stop", "missing_result"],
    ]) {
      output = content;
      finishReason = finish;
      const before = calls;
      await assert.rejects(proposeHappenings(context), (error: any) => {
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
      generate: () => proposeHappenings(context),
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
    const job = [...rows.values()].find((row) => row.kind === "background-work")!.data;
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
    const social = { planId: "offered-plan" };
    const supportedContext = {
      ...context,
      venues: [{ id: "destination", name: "Open home", occupancy: { playerHome: false, residentCharacterId: null } }],
      social: { candidates: [{ id: "offered-plan" }], relationships: [] },
    };
    output = JSON.stringify({
      happenings: [
        {
          opportunityId: "opportunity",
          kind: "wish",
          actorIds: ["a"],
          venueId: "park",
          narration: "Ada rests beside the gate.",
        },
      ],
      housingRequests: [{ who: "a", kind: "move", venueId: "destination" }],
      routineIdea,
      social,
      memory: [{ text: "A private fact was invented", who: ["Ada"], private: true }],
      notices: [{ author: "Ada", text: "A notice was invented" }],
      venueRequests: [{ who: "Ada", name: "Unrequested hall", classes: ["gathering"] }],
      featureEdits: [{ who: "Ada", venueId: "park", featureId: "wall", text: "An invented change" }],
      lapsed: [{ who: "Ada", wish: "An invented loss" }],
    });
    const beforeValid = calls;
    const valid = await proposeHappenings(supportedContext);
    assert.equal(valid.happenings.length, 1);
    assert.equal(valid.happenings[0].text, "Ada rests beside the gate.");
    assert.equal(calls - beforeValid, 1, "supported Events use one completion without repair");
    assert.deepEqual(valid.housingRequests, [{ characterId: "a", kind: "move", venueId: "destination" }]);
    assert.deepEqual(valid.routineIdea, routineIdea);
    assert.deepEqual(valid.social, social);
    for (const key of ["memory", "notices", "venueRequests", "featureEdits", "lapsed"])
      assert.equal(Object.hasOwn(valid, key), false, `Events never admit the unsupported ${key} effect channel`);
    providerError = true;
    const beforeError = calls;
    await assert.rejects(
      completeWithRoom(model as any, [{ role: "user", content: "JSON" }], 3000, jsonOptions),
      (error: any) => error.failure?.cause === "provider_exception" && /rejected JSON mode/.test(error.message),
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
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
