import { proposeRemap } from "../packages/villages/src/engine/packages/server/src/services/villages/native-remap.js";
import assert from "node:assert/strict";
import { completeWithRoom } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/application-runtime.js";
import {
  queueBackgroundJob,
  registerBackgroundHandler,
  settleBackgroundWork,
  backgroundWorkSummaries,
  retryBackgroundJob,
  startBackgroundWork,
  villageBackgroundPresence,
  hasVillagePresence,
  recoverBackgroundWork,
} from "../packages/villages/src/engine/packages/server/src/services/villages/background-work.js";
import {
  defaultVillageState,
  mutateVillageState,
  readVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import type { BackgroundInput } from "../packages/villages/src/engine/packages/server/src/services/villages/background-work.js";

const rows = new Map<string, any>();
let writesFail = false;
let conflictingWrites = 0;
let delayClaim = false;
let claimGate: (() => void) | null = null;
let claimWrites = 0;
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
      if (text === failStep) throw new Error("provider unavailable");
      await new Promise<void>((resolve) => setImmediate(resolve));
      return { content: text, finishReason: "stop", usage: { totalTokens: 11 } };
    } finally {
      active--;
    }
  },
};
const release = configureVillagesRuntime({
  persistence: { documents },
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
  now = 0;
  await mutateVillageState((state) => {
    Object.assign(state, defaultVillageState());
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
          completedWishes: [],
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
  try {
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
    assert.equal((await readVillageState()).setting, "");
    assert.equal((await summary("reset"))?.status, undefined, "old village work is hidden and cleaned");

    await reset();
    blockStep = "shutdown";
    await queueBackgroundJob(work("shutdown", ["shutdown"]));
    await until(() => !!providerGate);
    stop();
    providerGate!();
    await settleBackgroundWork();
    assert.equal((await readVillageState()).setting, "");
    blockStep = "";
    stop = startBackgroundWork({ now: () => now });
    await tick();
    await settleBackgroundWork();
    assert.equal((await summary("shutdown")).status, "interrupted");
    assert.deepEqual(calls, ["shutdown"], "teardown/restart never automatically repeats a dispatched request");
    const interrupted = await summary("shutdown");
    await retryBackgroundJob(interrupted.id, interrupted.attempt, "retry-shutdown");
    await settleBackgroundWork();
    assert.equal(calls.length, 2);

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
      completedWishes: [],
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
    assert.equal((await readVillageState()).setting, "recovered-local-result");

    await reset();
    blockStep = "old-input";
    await queueBackgroundJob(work("replace", ["old-input", "old-second-stage"]));
    await until(() => !!providerGate);
    await queueBackgroundJob({ ...work("replace", ["new-input"]), revision: "new" });
    providerGate!();
    await settleBackgroundWork();
    assert.deepEqual(calls, ["old-input", "new-input"], "replacement drops remaining obsolete paid stages");
    assert.deepEqual(effects, ["replace"]);
    assert.equal((await readVillageState()).setting, "new-input");

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
          completedWishes: [],
        } as any,
      ];
    });
    rows.get((await summary("cycle")).id).updatedAt = "2000-01-01T00:00:00.000Z";
    const beforePrune = calls.length;
    await backgroundWorkSummaries();
    await queueBackgroundJob({ ...work("cycle", ["cycle-39"]), revision: "39" });
    await settleBackgroundWork();
    assert.equal(calls.length, beforePrune, "compact receipt protects a live subject after payload record pruning");
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
