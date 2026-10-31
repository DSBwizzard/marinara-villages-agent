import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { BackgroundInput } from "../packages/villages/src/server/domain/models/background-model.js";
import { connectionFailureKind } from "../packages/villages/src/server/domain/rules/connection-failure.js";
import { localDateKey } from "../packages/villages/src/server/domain/rules/resident-planning.js";
import { villageNow } from "../packages/villages/src/server/adapters/time/clock-gate.js";
import { proposeRemap } from "../packages/villages/src/server/domain/rules/native-remap.js";
import { deriveVillageMoment } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { completeWithRoom } from "../packages/villages/src/server/features/generation/model-requests.js";
import {
  mutateVillageMemoryState,
  mutateVillageState,
  readVillageState,
} from "../packages/villages/src/server/features/world/village-store.js";
import {
  backgroundWorkSummaries,
  cancelReturnCatchup,
  hasVillagePresence,
  queueBackgroundJob,
  recoverBackgroundWork,
  registerBackgroundHandler,
  retryBackgroundJob,
  settleBackgroundWork,
  startBackgroundWork,
  villageBackgroundPresence,
} from "../packages/villages/src/server/jobs/background-work.js";
import { buildResidentPlanningMessages } from "./fixtures/resident-planning.fixture.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import { addMemory } from "./helpers/memories-fixture.js";
import { mutateRelationships } from "../packages/villages/src/server/features/residents/relationship-store.js";
import { backgroundCalls } from "../packages/villages/src/server/adapters/operations/background-context.js";

const rows = new Map<string, any>();
let writesFail = false;
let conflictingWrites = 0;
let delayClaim = false;
let claimGate: (() => void) | null = null;
let claimWrites = 0;
let holdPendingTiming = false;
let releasePendingTiming: (() => void) | null = null;
let holdRequestCount = false;
let releaseRequestCount: (() => void) | null = null;
const documents = {
  async list(packageId: string, kind: string) {
    return structuredClone([...rows.values()].filter((row) => row.packageId === packageId && row.kind === kind));
  },
  async getById(_packageId: string, id: string) {
    return structuredClone(rows.get(id) ?? null);
  },
  async create(input: any) {
    if (writesFail) throw new Error("disk unavailable");
    if (delayClaim && input.kind === "background-work") {
      claimWrites++;
      await new Promise<void>((resolve) => {
        claimGate = resolve;
      });
    }
    if (rows.has(input.id)) throw new Error("duplicate document");
    const row = { ...structuredClone(input), revision: 1 };
    rows.set(input.id, row);
    return row;
  },
  async update(input: any) {
    if (writesFail) throw new Error("disk unavailable");
    if (
      holdRequestCount &&
      input.id.startsWith("villages-background-") &&
      input.data?.requests === 1 &&
      input.data?.steps?.some((step: any) => step.timing?.outcome === "pending" && !step.timing.hostStartedAt)
    ) {
      holdRequestCount = false;
      await new Promise<void>((resolve) => {
        releaseRequestCount = resolve;
      });
    }
    if (
      holdPendingTiming &&
      input.id.startsWith("villages-background-") &&
      input.data?.steps?.some((step: any) => step.timing?.outcome === "pending" && !step.timing.hostStartedAt)
    ) {
      holdPendingTiming = false;
      await new Promise<void>((resolve) => {
        releasePendingTiming = resolve;
      });
    }
    const row = rows.get(input.id);
    if (input.id === "villages-village" && conflictingWrites-- > 0) return null;
    if (!row || row.revision !== input.expectedRevision) return null;
    const next = { ...row, ...structuredClone(input), revision: row.revision + 1 };
    rows.set(input.id, next);
    return next;
  },
  async remove(_packageId: string, id: string, revision: number) {
    if (rows.get(id)?.revision !== revision) return false;
    return rows.delete(id);
  },
};
let calls: string[] = [],
  active = 0,
  maximum = 0;
let failStep = "";
let failure = "401 Invalid API key";
let translationMode = false;
let translationFail = false;
let translationCalls = 0;
let providerGate: (() => void) | null = null;
let blockStep = "";
const model = {
  connectionId: "fixture",
  model: "fixture",
  name: "fixture",
  maxContext: 16000,
  maxOutputTokens: 4096,
  fitContext(messages: any[], options: any) {
    return { messages, maxTokens: options.maxTokens };
  },
  async chatComplete(messages: any[]) {
    const text = messages[0].content;
    if (translationMode) {
      translationCalls++;
      if (translationFail && translationCalls === 2) return { content: "{}", finishReason: "stop" };
      const ranges = [...String(messages[1]?.content).matchAll(/^- ([0-9:]+-[0-9:]+):/gm)].map((match) => match[1]);
      calls.push("translation-" + ranges.length);
      return {
        content: JSON.stringify({ moves: ranges.map((time) => ({ day: "Monday", time, here: "Studying", place: 0 })) }),
        finishReason: "stop",
      };
    }
    calls.push(text);
    active++;
    maximum = Math.max(maximum, active);
    try {
      if (text === blockStep)
        await new Promise<void>((resolve) => {
          providerGate = resolve;
        });
      if (text === failStep) throw new Error(failure);
      await new Promise<void>((resolve) => setImmediate(resolve));
      return { content: text, finishReason: "stop", usage: { totalTokens: 11 } };
    } finally {
      active--;
    }
  },
};
const release = configureVillagesRuntime({
  persistence: { documents: villageFixtureDocuments(documents) },
  languageModels: {
    async resolveForRequest() {
      return model;
    },
  },
  async getAgentConfig() {
    return { connectionId: null };
  },
  isDebugAgentsEnabled() {
    return false;
  },
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
} as any);
let stop: () => void;
let now = 0;
const effects: string[] = [];
registerBackgroundHandler("agenda", {
  async generate(input) {
    const result: string[] = [];
    if (input.optional)
      await backgroundCalls.getStore()!.optionalCompletion!("uncertain-optional", async () => {
        calls.push("optional-original");
        await new Promise<void>((resolve) => {
          providerGate = resolve;
        });
        throw new Error("Optional request outcome unavailable");
      });
    for (const step of input.steps) {
      const reply = await completeWithRoom(model as any, [{ role: "user", content: step }], 100, {
        temperature: 0,
        debugMode: false,
      });
      if (reply.content === "invalid") throw new Error("invalid response");
      result.push(reply.content!);
    }
    return result;
  },
  valid: (state, input) => state.name === input.expectedName,
  apply(state, input, result) {
    effects.push(input.subject);
    state.setting = result.join("|");
  },
});
registerBackgroundHandler("translation", {
  async generate(input) {
    const answer = await proposeRemap(input);
    if (answer.failure) throw new Error(answer.failure);
    return answer.remap;
  },
  valid: () => true,
  apply(state, _input, result) {
    state.setting = "translated-" + result.moves.length;
  },
});
registerBackgroundHandler("resident-planning", {
  async generate(input) {
    const opening = await completeWithRoom(model as any, buildResidentPlanningMessages(input.context), 100, {
      temperature: 0,
      debugMode: false,
    });
    await completeWithRoom(model as any, [{ role: "user", content: "story-followup" }], 100, {
      temperature: 0,
      debugMode: false,
    });
    return opening.content;
  },
  valid: () => true,
  apply() {
    effects.push("legacy-story");
  },
});
const work = (subject: string, steps: string[], finite = true): BackgroundInput => ({
  kind: "agenda",
  subjectId: subject,
  seed: "fixture",
  revision: subject,
  finite,
  label: subject,
  input: { subject, steps, expectedName: "Willowbrook" },
});
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
async function until(predicate: () => boolean) {
  for (let attempt = 0; attempt < 200 && !predicate(); attempt++) await tick();
  assert.ok(predicate(), "controlled asynchronous operation started");
}
async function reset() {
  stop?.();
  await settleBackgroundWork();
  rows.clear();
  calls = [];
  effects.length = 0;
  maximum = 0;
  writesFail = false;
  conflictingWrites = 0;
  failStep = "";
  blockStep = "";
  providerGate = null;
  holdPendingTiming = false;
  releasePendingTiming = null;
  holdRequestCount = false;
  releaseRequestCount = null;
  now = 0;
  await mutateVillageState((state) => {
    Object.assign(state, defaultVillageState());
    state.name = "Willowbrook";
    state.seed = "fixture";
    state.villagers = [
      "same",
      "write-race",
      "week",
      "other",
      "a",
      "b",
      "recurring",
      "finite",
      "hide",
      "disk",
      "conflict",
      "reset",
      "shutdown",
      "saved",
      "unapplied",
      "replace",
      "invalid",
      "cycle",
      "rosa",
      "offline",
    ].map(
      (id) =>
        ({
          characterId: id,
          cardSnapshot: {
            id,
            revision: 1,
            sourceStatus: "available",
            name: id,
            capturedAt: "2026-09-01T00:00:00.000Z",
          },
          wishes: [],
          addedAt: "2026-09-01T00:00:00.000Z",
        }) as any,
    );
  });
  stop = startBackgroundWork({ now: () => now });
}
async function summary(subject: string) {
  return (await backgroundWorkSummaries()).find((job) => job.subjectId === subject)!;
}
async function main() {
  for (const message of [
    "The selected language model connection has no model.",
    "Language model connection not found: gone",
    "The selected connection has no base URL.",
    "Choose a language model connection before generating content.",
    "No language model connection is available in the random pool.",
  ])
    assert.equal(connectionFailureKind(new Error(message)), "configuration", message);
  for (const message of [
    "429 Too many requests",
    "502 upstream unavailable",
    "Provider request exceeded 30 seconds.",
    "Invalid JSON response",
  ])
    assert.equal(connectionFailureKind(new Error(message), true), "request", message);
  try {
    await reset();
    const frozenStory = {
      village: "Willowbrook",
      setting: "Fields and trees. ".repeat(50) + "A flood is ongoing.",
      moment: deriveVillageMoment({
        seed: "fixture",
        foundedAt: "2026-09-01T00:00:00Z",
        now: new Date("2026-09-02T00:00:00Z"),
      }),
      residents: [],
      recent: [],
      venues: [],
      opportunities: [],
      lastSimulatedAt: "2026-09-01T00:00:00Z",
      forced: false,
    };
    failStep = "story-followup";
    failure = "503 Service Unavailable";
    await queueBackgroundJob({
      kind: "resident-planning",
      subjectId: "saved-story",
      seed: "fixture",
      revision: "legacy-story",
      finite: true,
      label: "Saved story",
      input: { context: frozenStory },
    });
    await settleBackgroundWork();
    const story = await summary("saved-story");
    assert.equal(calls.length, 2);
    assert.equal(calls[0].includes(frozenStory.setting), true, "planning keeps complete authored context");
    stop();
    stop = startBackgroundWork({ now: () => now });
    await settleBackgroundWork();
    assert.equal(calls.length, 2, "restart does not retry a failed story");
    failStep = "";
    await retryBackgroundJob(story.id, (await summary("saved-story")).attempt, "resume-legacy-story");
    await settleBackgroundWork();
    assert.equal((await summary("saved-story")).status, "completed");
    assert.equal(calls.length, 3, "the purchased first story response replays without another call");
    assert.deepEqual(effects, ["legacy-story"]);
    failure = "401 Invalid API key";

    await reset();
    blockStep = "first";
    await Promise.all([queueBackgroundJob(work("same", ["first"])), queueBackgroundJob(work("same", ["first"]))]);
    await until(() => !!providerGate);
    assert.deepEqual(calls, ["first"], "browser and timer admission spends once before either can commit");
    providerGate!();
    await settleBackgroundWork();
    assert.deepEqual(effects, ["same"]);
    await queueBackgroundJob(work("same", ["first"]));
    await settleBackgroundWork();
    assert.equal(calls.length, 1, "completed job replays without another model request");

    await reset();
    delayClaim = true;
    claimWrites = 0;
    const firstAdmission = queueBackgroundJob(work("write-race", ["write-race"]));
    const secondAdmission = queueBackgroundJob(work("write-race", ["write-race"]));
    await until(() => !!claimGate);
    assert.equal(claimWrites, 1, "ownership is reserved before an awaited document create");
    assert.equal(calls.length, 0, "generation cannot precede claim persistence");
    delayClaim = false;
    claimGate!();
    await Promise.all([firstAdmission, secondAdmission]);
    await settleBackgroundWork();
    assert.deepEqual(calls, ["write-race"]);

    await reset();
    failStep = "Wednesday";
    await queueBackgroundJob(work("week", ["routine", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]));
    await settleBackgroundWork();
    const failed = await summary("week");
    assert.equal(failed.status, "failed");
    assert.equal(failed.completedSteps, 3);
    await queueBackgroundJob(work("week", ["routine", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]));
    await queueBackgroundJob(work("other", ["other"]));
    await settleBackgroundWork();
    assert.deepEqual(
      calls,
      ["routine", "Monday", "Tuesday", "Wednesday"],
      "failed stage and failing connection never auto-retry",
    );
    failStep = "";
    await Promise.all([
      retryBackgroundJob(failed.id, failed.attempt, "retry-one"),
      retryBackgroundJob(failed.id, failed.attempt, "retry-one"),
    ]);
    await settleBackgroundWork();
    assert.deepEqual(calls, ["routine", "Monday", "Tuesday", "Wednesday", "Wednesday", "Thursday", "Friday", "other"]);
    assert.equal((await summary("week")).status, "completed");
    await retryBackgroundJob(failed.id, failed.attempt, "retry-one");
    await settleBackgroundWork();
    assert.equal(calls.length, 8, "lost retry HTTP response reuses the same action");
    await recoverBackgroundWork();
    await settleBackgroundWork();
    assert.equal(calls.at(-1), "other", "successful explicit retry resumes the connection");

    await reset();
    failure = "Provider request exceeded 30 seconds.";
    failStep = "offline";
    await queueBackgroundJob(work("offline", ["offline"]));
    await settleBackgroundWork();
    const timedOut = await summary("offline");
    assert.equal(timedOut.connectionPaused, false);
    assert.equal(timedOut.failure?.connectionIssue, "request");
    const failedTiming = rows.get(timedOut.id).data.steps[0].timing;
    assert.equal(failedTiming.outcome, "unknown");
    assert.equal(failedTiming.firstResponseMs, null, "public host does not expose first-token timing");
    assert.ok(failedTiming.hostMs >= 0 && failedTiming.queueMs >= 0);
    await queueBackgroundJob(work("other", ["other"]));
    await queueBackgroundJob(work("offline", ["offline"]));
    await settleBackgroundWork();
    assert.deepEqual(calls, ["offline", "other"], "transient failure blocks its own retry, not other work");
    failStep = "";
    await retryBackgroundJob(timedOut.id, timedOut.attempt, "retry-timeout");
    await settleBackgroundWork();
    const history = rows.get(timedOut.id).data.attemptHistory;
    assert.equal(history.length, 1);
    assert.equal(history[0].steps[0].timing.outcome, "unknown");
    assert.equal(history[0].tokens, null);
    assert.equal(history[0].steps[0].response, undefined);
    await retryBackgroundJob(timedOut.id, timedOut.attempt, "retry-timeout");
    assert.equal(rows.get(timedOut.id).data.attemptHistory.length, 1, "duplicate retry does not duplicate diagnostics");
    failure = "401 Invalid API key";

    await reset();
    failStep = "offline";
    await queueBackgroundJob(work("offline", ["offline"]));
    await settleBackgroundWork();
    await queueBackgroundJob({ ...work("offline", ["offline"]), revision: "replacement" });
    await settleBackgroundWork();
    assert.equal(calls.length, 1);
    stop();
    stop = startBackgroundWork({ now: () => now });
    await tick();
    await settleBackgroundWork();
    assert.equal(calls.length, 1, "connection pause survives replacement of the failed job and a restart");
    failStep = "";
    const pausedOffline = await summary("offline");
    await retryBackgroundJob(pausedOffline.id, pausedOffline.attempt, "recover-offline");
    await settleBackgroundWork();
    assert.equal(calls.length, 2);

    await reset();
    await Promise.all([queueBackgroundJob(work("a", ["a1", "a2", "a3"])), queueBackgroundJob(work("b", ["b1", "b2"]))]);
    await settleBackgroundWork();
    assert.equal(maximum, 1, "all background requests share one provider admission");
    assert.ok(calls.indexOf("b1") < calls.indexOf("a3"), "large jobs yield to other jobs");

    await reset();
    let catchUpGate: (() => void) | null = null;
    const slowPresence = villageBackgroundPresence("out-of-order-tab", true, {
      beforeResume: () =>
        new Promise<void>((resolve) => {
          catchUpGate = resolve;
        }),
    });
    await until(() => !!catchUpGate);
    await villageBackgroundPresence("out-of-order-tab", false);
    catchUpGate!();
    await slowPresence;
    assert.equal(hasVillagePresence(), false, "a late visible heartbeat cannot overwrite a newer hidden message");

    await reset();
    let confirmedBoundaries = 0;
    const onHidden = async () => {
      confirmedBoundaries++;
    };
    await villageBackgroundPresence("never-visible", false, { onHidden });
    assert.equal(confirmedBoundaries, 0, "A hidden message cannot initialize tracking without confirmed visibility.");
    await villageBackgroundPresence("confirmed-tab", true);
    await villageBackgroundPresence("confirmed-tab", false, { onHidden });
    assert.equal(confirmedBoundaries, 1, "The final confirmed session establishes a departure boundary.");
    await villageBackgroundPresence("expired-tab", true);
    now += 90_001;
    await villageBackgroundPresence("expired-tab", false, { onHidden });
    assert.equal(confirmedBoundaries, 1, "A late hidden message cannot move an expired departure boundary.");

    await reset();
    let finishResume: (() => void) | undefined;
    let pendingBoundary = 0;
    const firstReturn = villageBackgroundPresence("first-return", true, {
      beforeResume: () =>
        new Promise<void>((resolve) => {
          finishResume = resolve;
        }),
      onVisible: async () => {
        await villageBackgroundPresence("first-return", false, {
          onHidden: async () => {
            pendingBoundary++;
          },
        });
        await villageBackgroundPresence("pending-return", false);
      },
    });
    await until(() => !!finishResume);
    const pendingReturn = villageBackgroundPresence("pending-return", true);
    finishResume!();
    await Promise.all([firstReturn, pendingReturn]);
    assert.equal(pendingBoundary, 1, "A pending return cannot erase the last confirmed departure.");
    assert.equal(hasVillagePresence(), false);

    await reset();
    let catchUps = 0;
    const beforeResume = async () => {
      catchUps++;
    };
    await villageBackgroundPresence("renewal-a", true, { beforeResume });
    await villageBackgroundPresence("renewal-a", true, { beforeResume });
    await villageBackgroundPresence("renewal-b", true, { beforeResume });
    assert.equal(catchUps, 1, "Live heartbeat renewal and another visible tab do not repeat full catch-up.");
    now += 90_001;
    await villageBackgroundPresence("renewal-a", true, { beforeResume });
    assert.equal(catchUps, 2, "Expired presence must catch up before admitting recurring work again.");

    await reset();
    await queueBackgroundJob(work("recurring", ["visible1", "visible2"], false));
    await settleBackgroundWork();
    assert.equal(calls.length, 0);
    await villageBackgroundPresence("tab-a", true);
    await villageBackgroundPresence("tab-b", true);
    await villageBackgroundPresence("tab-a", false);
    assert.ok(hasVillagePresence(), "another visible tab retains permission");
    await settleBackgroundWork();
    assert.equal(calls.length, 2);
    now = 90_001;
    assert.equal(hasVillagePresence(), false, "stale browser presence expires");
    await queueBackgroundJob(work("finite", ["finite"]));
    await settleBackgroundWork();
    assert.equal(calls.at(-1), "finite", "finite requested work finishes while away");

    await reset();
    await villageBackgroundPresence("tab", true);
    blockStep = "visible1";
    await queueBackgroundJob(work("hide", ["visible1", "visible2"], false));
    await until(() => !!providerGate);
    await villageBackgroundPresence("tab", false);
    providerGate!();
    await settleBackgroundWork();
    assert.equal((await summary("hide")).status, "paused");
    assert.deepEqual(calls, ["visible1"], "visibility ends between paid stages");
    blockStep = "";
    await villageBackgroundPresence("tab", true);
    await settleBackgroundWork();
    assert.deepEqual(calls, ["visible1", "visible2"], "visibility resumes saved progress without repetition");

    await reset();
    writesFail = true;
    await assert.rejects(queueBackgroundJob(work("disk", ["disk"])), /disk unavailable/);
    assert.equal(calls.length, 0, "reservation persistence failure spends nothing");
    writesFail = false;
    conflictingWrites = 2;
    await queueBackgroundJob(work("conflict", ["conflict"]));
    await settleBackgroundWork();
    assert.deepEqual(calls, ["conflict"], "local commit conflicts never regenerate");

    await reset();
    blockStep = "late";
    await queueBackgroundJob(work("reset", ["late"]));
    await until(() => !!providerGate);
    await mutateVillageState((state) => {
      state.seed = "replacement";
      state.name = "New village";
    });
    providerGate!();
    await settleBackgroundWork();
    assert.equal((await readVillageState({ memories: true })).setting, "");
    assert.equal((await summary("reset"))?.status, undefined, "old village work is hidden and cleaned");

    await reset();
    blockStep = "shutdown";
    await queueBackgroundJob(work("shutdown", ["shutdown"]));
    await until(() => !!providerGate);
    stop();
    providerGate!();
    await settleBackgroundWork();
    assert.equal((await readVillageState({ memories: true })).setting, "");
    blockStep = "";
    stop = startBackgroundWork({ now: () => now });
    await tick();
    await settleBackgroundWork();
    assert.equal((await summary("shutdown")).status, "interrupted");
    assert.deepEqual(calls, ["shutdown"], "teardown/restart never automatically repeats a dispatched request");
    const interrupted = await summary("shutdown");
    await retryBackgroundJob(interrupted.id, interrupted.attempt, "retry-shutdown");
    await settleBackgroundWork();
    assert.equal(calls.length, 1, "deliberate recovery reuses the reply saved after shutdown");

    await reset();
    await queueBackgroundJob(work("saved", ["saved"]));
    await settleBackgroundWork();
    const saved = await summary("saved"),
      row = rows.get(saved.id);
    row.data.status = "running";
    row.data.owner = "old-runtime";
    row.data.input = { subject: "saved", steps: ["saved"], expectedName: "Willowbrook" };
    row.data.hasResult = true;
    row.data.result = ["saved"];
    row.data.steps = [];
    stop();
    stop = startBackgroundWork({ now: () => now });
    await tick();
    await settleBackgroundWork();
    assert.equal(calls.length, 1);
    assert.deepEqual(effects, ["saved"], "saved commit receipt repairs completion without generation or effects");

    await reset();
    translationMode = true;
    translationFail = true;
    translationCalls = 0;
    const translationContext = {
      village: "Willowbrook",
      setting: "",
      lore: [],
      loreKey: "",
      wishes: [],
      venues: [],
      wishes: [],
      name: "Rosa",
      characterId: "rosa",
      summary: "",
      tags: [],
      description: "",
      weekStart: "2026-09-28",
      blocks: Array.from({ length: 13 }, (_, index) => ({
        day: "Monday",
        time: String(index).padStart(2, "0") + ":00-" + String(index + 1).padStart(2, "0") + ":00",
        activity: "Study " + index,
        status: "online",
      })),
    };
    const translationWork: BackgroundInput = {
      kind: "translation",
      subjectId: "rosa",
      seed: "fixture",
      revision: "schedule-pattern",
      finite: true,
      label: "Rosa's translation",
      input: translationContext,
    };
    await queueBackgroundJob(translationWork);
    await settleBackgroundWork();
    const partialTranslation = await summary("rosa");
    assert.equal(partialTranslation.status, "obsolete", "retired translation never dispatches");
    assert.equal(partialTranslation.completedSteps, 0);
    await queueBackgroundJob(translationWork);
    await settleBackgroundWork();
    assert.equal(translationCalls, 0);
    assert.equal(model.maxOutputTokens, 4096);
    translationMode = false;

    await reset();
    await queueBackgroundJob(work("unapplied", ["unapplied"]));
    await settleBackgroundWork();
    const unapplied = rows.get((await summary("unapplied")).id);
    unapplied.data.status = "running";
    unapplied.data.owner = "old-runtime";
    unapplied.data.input = { subject: "unapplied", steps: ["unapplied"], expectedName: "Willowbrook" };
    unapplied.data.hasResult = true;
    unapplied.data.result = ["recovered-local-result"];
    await mutateVillageState((state) => {
      delete state.backgroundReceipts[unapplied.id];
      state.setting = "";
    });
    effects.length = 0;
    stop();
    stop = startBackgroundWork({ now: () => now });
    await tick();
    await settleBackgroundWork();
    assert.deepEqual(calls, ["unapplied"]);
    assert.deepEqual(effects, ["unapplied"], "persisted generation is applied without another paid request");
    assert.equal((await readVillageState({ memories: true })).setting, "recovered-local-result");

    await reset();
    blockStep = "old-input";
    await queueBackgroundJob(work("replace", ["old-input", "old-second-stage"]));
    await until(() => !!providerGate);
    await queueBackgroundJob({ ...work("replace", ["new-input"]), revision: "new" });
    providerGate!();
    await settleBackgroundWork();
    assert.deepEqual(calls, ["old-input", "new-input"], "replacement drops remaining obsolete paid stages");
    assert.deepEqual(effects, ["replace"]);
    assert.equal((await readVillageState({ memories: true })).setting, "new-input");

    for (const status of ["completed", "running", "obsolete"] as const) {
      await reset();
      await queueBackgroundJob(work("replace", ["original-before-restart"]));
      await settleBackgroundWork();
      stop();
      const parent = rows.get((await summary("replace")).id);
      parent.data.status = status;
      parent.data.owner = "former-activation";
      parent.data.replacement = { ...work("replace", ["replacement-after-restart"]), revision: "new" };
      if (status === "obsolete")
        await mutateVillageState((state) => {
          delete state.backgroundReceipts[parent.id];
        });
      stop = startBackgroundWork({ now: () => now });
      await recoverBackgroundWork();
      await settleBackgroundWork();
      await recoverBackgroundWork();
      await settleBackgroundWork();
      assert.deepEqual(calls, ["original-before-restart", "replacement-after-restart"], status);
      assert.deepEqual(effects, ["replace", "replace"], "An accepted replacement applies exactly once after restart.");
      assert.equal(rows.get(parent.id).data.replacement, undefined);
      assert.equal((await readVillageState()).setting, "replacement-after-restart");
    }

    await reset();
    failStep = "held-original";
    failure = "401 Invalid API key";
    await queueBackgroundJob(work("replace", ["held-original"]));
    await settleBackgroundWork();
    stop();
    const heldParent = rows.get((await summary("replace")).id);
    heldParent.data.replacement = { ...work("replace", ["held-replacement"]), revision: "next" };
    stop = startBackgroundWork({ now: () => now });
    await recoverBackgroundWork();
    await settleBackgroundWork();
    assert.deepEqual(calls, ["held-original"], "A queued replacement cannot bypass a saved connection hold.");
    assert.equal(rows.get(heldParent.id).data.replacement.revision, "next");

    for (const optional of [false, true]) {
      await reset();
      blockStep = failStep = "uncertain-original";
      failure = "Request outcome unavailable";
      const original = work("replace", ["uncertain-original"]);
      if (optional) original.input = { ...(original.input as object), optional: true };
      await queueBackgroundJob(original);
      await until(() => !!providerGate);
      await queueBackgroundJob({ ...work("replace", ["replacement-must-wait"]), revision: "next" });
      providerGate!();
      await settleBackgroundWork();
      const held = rows.get((await summary("replace")).id);
      assert.equal(held.data.status, "interrupted", "Supersession preserves the uncertain original request.");
      assert.equal(held.data.replacement.revision, "next");
      if (optional) assert.equal(held.data.optionalAttempts["uncertain-optional"].status, "dispatching");
      else assert.equal(held.data.steps[0].status, "running");
      const expectedCalls = [optional ? "optional-original" : "uncertain-original"];
      assert.deepEqual(calls, expectedCalls, "A replacement cannot dispatch while the original remains uncertain.");
      stop();
      stop = startBackgroundWork({ now: () => now });
      await recoverBackgroundWork();
      await settleBackgroundWork();
      assert.deepEqual(calls, expectedCalls, "Restart preserves the original uncertainty hold.");
      const interrupted = await summary("replace");
      await retryBackgroundJob(interrupted.id, interrupted.attempt, "retry-held-replacement");
      await settleBackgroundWork();
      await retryBackgroundJob(interrupted.id, interrupted.attempt, "retry-held-replacement");
      await settleBackgroundWork();
      assert.deepEqual(
        calls,
        [...expectedCalls, "replacement-must-wait"],
        "Explicit Retry admits the replacement once.",
      );
      const retained = [...rows.values()].find(
        (row) => row.kind === "background-history" && row.data.id === held.data.id,
      );
      assert.ok(retained, "Replacement Retry retains the original uncertain request and its captured source.");
      if (optional) assert.equal(retained.data.optionalAttempts["uncertain-optional"].status, "dispatching");
      else assert.equal(retained.data.steps[0].status, "running");
    }

    for (const status of ["running", "completed"] as const) {
      await reset();
      await queueBackgroundJob(work("replace", ["committed-original"]));
      await settleBackgroundWork();
      stop();
      const parent = rows.get((await summary("replace")).id);
      parent.data.status = status;
      parent.data.input = work("replace", ["committed-original"]).input;
      parent.data.optionalAttempts = { review: { status: "unknown", elapsedMs: 10 } };
      parent.data.replacement = { ...work("replace", ["committed-replacement-must-wait"]), revision: "next" };
      stop = startBackgroundWork({ now: () => now });
      await recoverBackgroundWork();
      await settleBackgroundWork();
      assert.deepEqual(calls, ["committed-original"], "A committed main effect does not settle optional uncertainty.");
      assert.equal(rows.get(parent.id).data.status, "interrupted");
      assert.equal(rows.get(parent.id).data.optionalAttempts.review.status, "unknown");
      assert.equal(rows.get(parent.id).data.replacement.revision, "next");
    }

    for (const replacement of [{}, { ...work("other", ["wrong-slot"]), revision: "foreign" }]) {
      await reset();
      await queueBackgroundJob(work("replace", ["valid-parent"]));
      await settleBackgroundWork();
      stop();
      const parent = rows.get((await summary("replace")).id);
      parent.data.replacement = replacement;
      const before = structuredClone([...rows.entries()]);
      stop = startBackgroundWork({ now: () => now });
      await recoverBackgroundWork();
      await settleBackgroundWork();
      assert.deepEqual(
        [...rows.entries()],
        before,
        "Invalid or foreign-slot replacement cannot write over its parent.",
      );
      assert.deepEqual(calls, ["valid-parent"]);
    }

    await reset();
    await queueBackgroundJob(work("invalid", ["invalid"]));
    await settleBackgroundWork();
    await queueBackgroundJob(work("invalid", ["invalid"]));
    await settleBackgroundWork();
    assert.deepEqual(calls, ["invalid"], "invalid output blocks only its own stage");
    for (let iteration = 0; iteration < 40; iteration++) {
      await queueBackgroundJob({ ...work("cycle", ["cycle-" + iteration]), revision: String(iteration) });
      await settleBackgroundWork();
    }
    assert.equal(
      [...rows.values()].filter((row) => row.kind === "background-work").length,
      2,
      "job slots and payloads stay bounded",
    );
    const current = rows.get((await summary("cycle")).id).data;
    assert.equal(current.input, null);
    assert.deepEqual(current.steps, []);
    await mutateVillageState((state) => {
      state.villagers = [
        {
          characterId: "cycle",
          cardSnapshot: {
            id: "cycle",
            revision: 1,
            sourceStatus: "available",
            name: "Cycle",
            capturedAt: new Date().toISOString(),
          },
          wishes: [],
        } as any,
      ];
    });
    rows.get((await summary("cycle")).id).updatedAt = "2000-01-01T00:00:00.000Z";
    const beforePrune = calls.length;
    await backgroundWorkSummaries();
    await queueBackgroundJob({ ...work("cycle", ["cycle-39"]), revision: "39" });
    await settleBackgroundWork();
    assert.equal(calls.length, beforePrune, "compact receipt protects a live subject after payload record pruning");
    for (const kind of ["personal-mail", "social-recovery"] as const) {
      registerBackgroundHandler(kind, {
        valid: () => true,
        generate: async () => {
          throw Error("Retained social failure");
        },
        apply: () => {},
      });
      await queueBackgroundJob({
        kind,
        subjectId: kind + ":message-source",
        seed: (await readVillageState()).seed,
        revision: "source",
        finite: true,
        label: "Social recovery",
        input: {},
      });
      await settleBackgroundWork();
      for (let read = 0; read < 2; read++) {
        const retained = (await backgroundWorkSummaries()).find((job) => job.kind === kind);
        assert.equal(retained?.status, "failed", "A social message/encounter source is not a resident ID");
        assert(rows.has(retained!.id), "Inspect polling preserves failed work for deliberate recovery");
      }
    }
    await reset();
    await mutateVillageState((state) => {
      state.backgroundPace = "balanced";
      state.eventAttempts = undefined;
      state.returnCatchup = { batch: { id: "return-batch", status: "running" } };
    });
    await villageBackgroundPresence("return-session", true);
    await queueBackgroundJob(work("recurring", ["ordinary-during-return"], false));
    await settleBackgroundWork();
    assert.equal(calls.includes("ordinary-during-return"), false, "The active return holds unrelated recurring work.");
    registerBackgroundHandler("resident-planning", {
      async generate(input) {
        await completeWithRoom(model as any, [{ role: "user", content: input.step }], 100, { debugMode: false });
        return {};
      },
      valid: () => true,
      apply(_state, input) {
        effects.push(input.step);
      },
    });
    const currentDate = localDateKey(villageNow());
    const catchupWork = (subject: string, step: string): BackgroundInput => ({
      kind: "resident-planning",
      subjectId: subject,
      seed: "fixture",
      revision: subject,
      finite: false,
      label: "Catch-up",
      automaticDate: currentDate,
      input: { context: { catchup: true }, catchupBatchId: "return-batch", step },
    });
    await queueBackgroundJob(catchupWork("return-one", "return-one"));
    await settleBackgroundWork();
    assert.ok(effects.includes("return-one"), "Catch-up can run while ordinary work is held.");
    blockStep = "return-late";
    await queueBackgroundJob(catchupWork("return-late", "return-late"));
    await until(() => providerGate !== null);
    await cancelReturnCatchup("return-batch");
    providerGate!();
    await settleBackgroundWork();
    assert.equal(effects.includes("return-late"), false, "A late response cannot apply after cancellation.");
    assert.equal((await readVillageState()).eventAttempts!.attempts.length, 2, "Cancelled dispatch remains charged.");
    await reset();
    await mutateVillageState((state) => {
      state.backgroundPace = "quiet";
      state.returnCatchup = { batch: { id: "return-batch", status: "running" } };
    });
    await queueBackgroundJob(catchupWork("retry-before-dispatch", "retry-before-dispatch"));
    await settleBackgroundWork();
    let pending = await summary("retry-before-dispatch");
    assert.equal(pending.status, "paused");
    await retryBackgroundJob(pending.id, pending.attempt, "retry-before-visible");
    await settleBackgroundWork();
    assert.equal(calls.includes("retry-before-dispatch"), false, "An explicit retry cannot dispatch while hidden.");
    await villageBackgroundPresence("retry-session", true);
    await settleBackgroundWork();
    assert.ok(calls.includes("retry-before-dispatch"));
    assert.equal(
      (await readVillageState()).eventAttempts!.attempts.length,
      1,
      "The first retried dispatch reserves its allowance.",
    );
    await villageBackgroundPresence("retry-session", false);
    await villageBackgroundPresence("retry-session", true);
    await queueBackgroundJob(catchupWork("quiet-second", "quiet-second"));
    await settleBackgroundWork();
    assert.ok(calls.includes("quiet-second"), "Quiet permits a second review in its shared daily allowance.");
    await villageBackgroundPresence("retry-session", false);
    await queueBackgroundJob(catchupWork("retry-over-budget", "retry-over-budget"));
    await settleBackgroundWork();
    pending = await summary("retry-over-budget");
    await retryBackgroundJob(pending.id, pending.attempt, "retry-without-allowance");
    await settleBackgroundWork();
    await villageBackgroundPresence("retry-session", true);
    await settleBackgroundWork();
    assert.equal(calls.includes("retry-over-budget"), false, "A retry cannot bypass an exhausted daily allowance.");
    await reset();
    await mutateVillageState((state) => {
      state.backgroundPace = "quiet";
      state.returnCatchup = { batch: { id: "return-batch", status: "running" } };
    });
    await villageBackgroundPresence("admission-session", true);
    holdPendingTiming = true;
    await queueBackgroundJob(catchupWork("cancel-before-dispatch", "cancel-before-dispatch"));
    await until(() => releasePendingTiming !== null);
    await cancelReturnCatchup("return-batch");
    releasePendingTiming!();
    await settleBackgroundWork();
    assert.equal(
      calls.includes("cancel-before-dispatch"),
      false,
      "Cancellation before admission prevents a paid request.",
    );
    assert.equal(
      (await summary("cancel-before-dispatch")).requests,
      0,
      "No request is counted before provider dispatch.",
    );
    const cancelledRecord = rows.get((await summary("cancel-before-dispatch")).id).data;
    assert.equal(cancelledRecord.status, "obsolete");
    assert.deepEqual(
      cancelledRecord.steps,
      [],
      "Cancelled undispatched work cannot leave a running-step restore hold.",
    );
    assert.equal(
      [...rows.values()].some(
        (row) => row.kind === "background-history" && row.data.subjectId === "cancel-before-dispatch",
      ),
      false,
      "An explicitly undispatched cancellation needs no recovery history.",
    );
    await reset();
    await mutateVillageState((state) => {
      state.backgroundPace = "quiet";
      state.returnCatchup = { batch: { id: "return-batch", status: "running" } };
    });
    await villageBackgroundPresence("hide-before-admission", true);
    holdPendingTiming = true;
    await queueBackgroundJob(catchupWork("hidden-before-dispatch", "hidden-before-dispatch"));
    await until(() => releasePendingTiming !== null);
    await villageBackgroundPresence("hide-before-admission", false);
    releasePendingTiming!();
    await settleBackgroundWork();
    const hidden = await summary("hidden-before-dispatch");
    assert.equal(hidden.status, "paused", "No request began, so hiding is a pause rather than an interruption.");
    assert.equal(hidden.requests, 0);
    assert.deepEqual(rows.get(hidden.id).data.steps, []);
    assert.equal(
      [...rows.values()].some(
        (row) => row.kind === "background-history" && row.data.subjectId === "hidden-before-dispatch",
      ),
      false,
    );
    await villageBackgroundPresence("hide-before-admission", true);
    await settleBackgroundWork();
    assert.ok(
      calls.includes("hidden-before-dispatch"),
      "Visibility resumes the unstarted request without explicit retry.",
    );
    await reset();
    await mutateVillageState((state) => {
      state.backgroundPace = "quiet";
      state.returnCatchup = { batch: { id: "return-batch", status: "running" } };
    });
    await villageBackgroundPresence("hide-during-count", true);
    holdRequestCount = true;
    await queueBackgroundJob(catchupWork("hidden-during-count", "hidden-during-count"));
    await until(() => releaseRequestCount !== null);
    await villageBackgroundPresence("hide-during-count", false);
    releaseRequestCount!();
    await settleBackgroundWork();
    const countPaused = await summary("hidden-during-count");
    assert.equal(countPaused.status, "paused");
    assert.equal(countPaused.requests, 0, "A pre-dispatch hide does not count a provider request.");
    assert.equal(calls.includes("hidden-during-count"), false);
    assert.equal(
      [...rows.values()].some(
        (row) => row.kind === "background-history" && row.data.subjectId === "hidden-during-count",
      ),
      false,
    );
    await villageBackgroundPresence("hide-during-count", true);
    await settleBackgroundWork();
    assert.ok(calls.includes("hidden-during-count"), "The unstarted request resumes after visibility returns.");
    await reset();
    await mutateVillageState((state) => {
      state.backgroundPace = "quiet";
      state.returnCatchup = { batch: { id: "return-batch", status: "running" } };
    });
    await villageBackgroundPresence("stale-saved-response", true);
    registerBackgroundHandler("resident-planning", {
      async generate(input) {
        await completeWithRoom(model as any, [{ role: "user", content: input.step }], 100, { debugMode: false });
        await mutateVillageState((state) => {
          state.setting = "Source changed after response storage";
        });
        return {};
      },
      valid: (state) => state.setting !== "Source changed after response storage",
      apply() {
        throw new Error("An obsolete source cannot apply");
      },
    });
    await queueBackgroundJob(catchupWork("stale-after-response", "stale-after-response"));
    await settleBackgroundWork();
    assert.equal(calls.filter((step) => step === "stale-after-response").length, 1);
    assert.equal(
      (await summary("stale-after-response")).status,
      "obsolete",
      "A saved reply is already dispatched work",
    );
    const staleAttempt = [...rows.values()].find(
      (row) => row.kind === "background-history" && row.data.subjectId === "stale-after-response",
    );
    assert.equal(staleAttempt.data.steps[0].status, "completed");
    assert.ok(staleAttempt.data.steps[0].responseRef);
    assert.equal(staleAttempt.data.hasResult, true, "The paid result remains owned after its source becomes obsolete");
    await reset();
    await mutateVillageMemoryState((state) => {
      state.backgroundPace = "quiet";
      state.returnCatchup = { batch: { id: "return-batch", status: "running" } };
      state.memories = addMemory(state.memories, { sourceId: "before-return" });
    });
    registerBackgroundHandler("resident-planning", {
      async generate(input) {
        await completeWithRoom(model as any, [{ role: "user", content: input.step }], 100, { debugMode: false });
        return {};
      },
      valid: (state) => state.memories.revision > 0,
      apply(state, input) {
        assert.ok(state.memories.revision > 0, "Application receives the committed Memory payload.");
        effects.push(input.step);
      },
    });
    await villageBackgroundPresence("memory-session", true);
    await queueBackgroundJob(catchupWork("loaded-memory", "loaded-memory"));
    await settleBackgroundWork();
    assert.ok(effects.includes("loaded-memory"), "Catch-up validates and applies with a real persisted Memory head.");
    await reset();
    await mutateVillageMemoryState((state) => {
      state.returnCatchup = { batch: { id: "return-batch", status: "recovering" } };
      state.memories = addMemory(state.memories, { sourceId: "before-interpretation" });
    });
    registerBackgroundHandler("social-recovery", {
      async generate(input) {
        await completeWithRoom(model as any, [{ role: "user", content: input.step }], 100, { debugMode: false });
        return {};
      },
      valid: (state) => state.memories.revision > 0,
      apply(_state, input) {
        effects.push(input.step);
      },
    });
    const reinterpret = (step: string): BackgroundInput => ({
      kind: "social-recovery",
      subjectId: step,
      seed: "fixture",
      revision: step,
      finite: true,
      label: "Encounter meaning",
      input: { entry: { catchupBatchId: "return-batch" }, step },
    });
    await villageBackgroundPresence("interpretation-session", true);
    holdPendingTiming = true;
    await queueBackgroundJob(reinterpret("cancel-interpretation"));
    await until(() => releasePendingTiming !== null);
    await cancelReturnCatchup("return-batch");
    releasePendingTiming!();
    await settleBackgroundWork();
    assert.equal(calls.includes("cancel-interpretation"), false, "Cancelled interpretation does not dispatch.");
    await reset();
    await mutateVillageMemoryState((state) => {
      state.returnCatchup = { batch: { id: "return-batch", status: "recovering" } };
      state.memories = addMemory(state.memories, { sourceId: "before-interpretation" });
    });
    await villageBackgroundPresence("interpretation-hidden", true);
    holdPendingTiming = true;
    await queueBackgroundJob(reinterpret("hidden-interpretation"));
    await until(() => releasePendingTiming !== null);
    await villageBackgroundPresence("interpretation-hidden", false);
    releasePendingTiming!();
    await settleBackgroundWork();
    assert.equal(calls.includes("hidden-interpretation"), false, "Hidden interpretation does not dispatch.");
    await villageBackgroundPresence("interpretation-hidden", true);
    await settleBackgroundWork();
    assert.ok(effects.includes("hidden-interpretation"), "Interpretation resumes with the persisted Memory payload.");
    await reset();
    await mutateVillageState((state) => {
      const instant = villageNow().toISOString();
      state.returnCatchup = {
        batch: {
          id: "return-batch",
          status: "running",
          from: instant,
          until: instant,
          opportunities: [
            {
              id: "safe",
              kind: "routine",
              startsAt: instant,
              endsAt: instant,
              actorIds: ["a"],
              venueId: "",
              facts: [],
            },
          ],
          records: [{ opportunityId: "safe", status: "settling" }],
        },
      };
      state.socialOutbox = [{ id: "safe:social", catchupBatchId: "return-batch" }, { id: "unrelated:social" }] as any;
    });
    await cancelReturnCatchup("return-batch");
    const skipped = await readVillageState();
    assert.deepEqual(
      skipped.socialOutbox?.map((row) => row.id),
      ["unrelated:social"],
      "Continue discards only the uncommitted return source.",
    );
    assert.equal(skipped.returnCatchup?.batch?.records?.[0]?.status, "rejected");
    await reset();
    await mutateRelationships("fixture", (state) => {
      state.applied["partial:social"] = true;
    });
    await mutateVillageState((state) => {
      state.returnCatchup = { batch: { id: "return-batch", status: "running" } };
      state.socialOutbox = [{ id: "partial:social", catchupBatchId: "return-batch" }] as any;
    });
    await assert.rejects(() => cancelReturnCatchup("return-batch"), /recovering the saved encounter/);
    console.log(
      "villages-background-work: concurrency, checkpoint retry, fairness, presence, recovery, stale results, bounded storage ok",
    );
  } finally {
    stop?.();
    await settleBackgroundWork();
    release();
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
