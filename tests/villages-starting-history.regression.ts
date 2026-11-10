// Test cases: starting-history/cold-authority, starting-history/save-recovery, starting-history/source-validation, starting-history/creator-conflict, starting-history/incarnation-fence, starting-history/established-perspective
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";
import { createStartingTies } from "../packages/villages/src/server/features/residents/starting-ties-service.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { createVillageStateService } from "../packages/villages/src/server/features/world/village-state-service.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  continuityHolderKey,
  continuityViews,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import { startingHistoryReady } from "../packages/villages/src/server/domain/rules/starting-history.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
const at = "2026-11-09T12:00:00.000Z",
  authored = "Mara taught Leo pottery. Mara worries that Leo takes dangerous risks.";
const result = () => ({
  notes: [
    {
      for: ["mara", "leo"],
      about: ["mara", "leo"],
      text: "Mara taught Leo pottery.",
      class: "experience",
      citations: [{ sourceId: "card:mara:backstory", quote: "Mara taught Leo pottery." }],
    },
    {
      for: ["mara"],
      about: ["leo"],
      text: "Mara worries about Leo taking dangerous risks.",
      class: "perspective",
      citations: [{ sourceId: "card:mara:backstory", quote: "Mara worries that Leo takes dangerous risks." }],
    },
  ],
  conflicts: [],
});
async function fixture(answer: () => unknown = result) {
  const storage = sceneHistoryFixture(),
    context = createBackgroundContext();
  const repository = createVillageRepository(() => storage.gate.documents),
    stateService = createVillageStateService(repository);
  const world = coerceVillageState({
    ...defaultVillageState(),
    seed: "starting-world",
    setupAt: at,
    foundedAt: at,
    villagers: ["mara", "leo"].map((id) => ({
      characterId: id,
      incarnation: id + "-one",
      letterFontId: "caveat",
      addedAt: at,
      agenda: null,
      wishes: [],
      cardSnapshot: {
        id,
        name: id,
        revision: 1,
        sourceStatus: "available",
        capturedAt: at,
        backstory: id === "mara" ? authored : "Leo is a potter.",
      },
    })),
  });
  await repository.mutateAuthority(
    (state) => {
      Object.assign(state, world);
    },
    { memories: true },
  );
  let calls = 0,
    fault: "before" | "after" | undefined,
    beforeModel: (() => Promise<void>) | undefined;
  const update = storage.documents.update;
  storage.documents.update = async (input: any) => {
    const failing =
      input.id === "villages-village" && Object.keys(input.data?.startingHistory?.reviewed ?? {}).length
        ? fault
        : undefined;
    if (failing) fault = undefined;
    if (failing === "before") throw Error("Synthetic initial history save failure");
    const saved = await update(input);
    if (failing === "after") throw Error("Synthetic initial history lost acknowledgement");
    return saved;
  };
  const model: any = {
    connectionId: "synthetic",
    model: "synthetic",
    name: "synthetic",
    maxContext: 32000,
    maxOutputTokens: 8192,
    fitContext: (messages: any, options: any) => ({ messages, maxTokens: options.maxTokens }),
    chatComplete: async () => {
      calls++;
      await beforeModel?.();
      return { content: JSON.stringify(answer()), finishReason: "stop", usage: { totalTokens: 23 } };
    },
  };
  const feature = createStartingTies({
    readVillageState: (options) => repository.readAuthority({ ...options, memories: true }),
    mutateVillageState: (mutate, options) => stateService.mutateVillageState(mutate, { ...options, memories: true }),
    queueBackgroundJob: (input) => service.queueBackgroundJob(input),
    settleBackgroundWork: () => service.settleBackgroundWork(),
    villagesLanguageModels: () => ({ resolveForRequest: async () => model }) as any,
    villagesConnectionIdFor: async () => "synthetic",
    completeWithRoom: async (model, messages, maxTokens, options) =>
      context.backgroundCalls.getStore()!(model, messages, maxTokens, options),
  });
  const service = createBackgroundWork({
    withCurrentJobWrite: (work) => repository.withAuthorityLock(work),
    withRepairWork: (work) => storage.gate.work(work),
    villagesDocuments: () => storage.gate.documents,
    villagesLogger: () => ({ debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} }),
    readVillageState: (options) => repository.readAuthority(options),
    mutateVillageState: (mutate, options) => stateService.mutateVillageState(mutate, { ...options, memories: true }),
    withUsagePurpose: (_purpose, work) => work(),
    measurePipeline: (_name, _tags, work) => work(),
    runtimeDebug() {},
    backgroundCalls: context.backgroundCalls,
    handlers: [["starting-ties", feature.handler]],
  });
  const stop = service.startBackgroundWork();
  await service.recoverBackgroundWork();
  return {
    storage,
    repository,
    feature,
    service,
    calls: () => calls,
    fault: (value: "before" | "after") => {
      fault = value;
    },
    beforeModel: (work: () => Promise<void>) => {
      beforeModel = work;
    },
    cold: () => createVillageRepository(() => storage.gate.documents).readAuthority({ memories: true }),
    job: () => [...storage.rows.values()].find((row) => row.kind === "background-work")!,
    close: () => {
      stop();
      storage.release();
    },
  };
}
await runCase("starting-history/cold-authority", async () => {
  const f = await fixture();
  try {
    await f.feature.prepare();
    const state = await f.cold();
    assert(startingHistoryReady(state), JSON.stringify(f.job().data));
    assert.equal(f.calls(), 1);
    assert.equal(state.continuity.records.length, 2);
    assert.equal(state.episodes.records.length, 2);
    const history = state.episodes.records[0],
      source = history.grounding.find((source) => source.kind === "context")!;
    assert.equal(source.fingerprint, memoryHash(authored));
    assert.deepEqual(source.range, { start: 0, end: 24 });
    assert.equal(source.excerpt, "Mara taught Leo pottery.");
    assert.deepEqual(source.perceptions, []);
    assert(history.dependencies[history.grounding.find((source) => source.kind === "native")!.unitId].length === 1);
    const mara = continuityActor(state, "mara")!,
      leo = continuityActor(state, "leo")!;
    assert.equal(continuityViews(state.continuity, mara, at, new Set()).length, 2);
    assert.equal(continuityViews(state.continuity, leo, at, new Set()).length, 1);
    assert.equal(continuityViews(state.continuity, continuityActor(state, "player")!, at, new Set()).length, 0);
    const view = continuityViews(state.continuity, mara, at, new Set())[0];
    await f.repository.mutateAuthority(
      (world) => {
        world.continuity = protectContinuity(
          world.continuity,
          {
            id: view.id,
            recordRevision: view.recordRevision,
            heads: { [continuityHolderKey(mara)]: view.headRevision },
          },
          [mara],
          "forget-starting",
          at,
          { forget: true },
        );
      },
      { memories: true },
    );
    await f.feature.prepare();
    assert.equal(f.calls(), 1);
    assert.equal(continuityViews((await f.cold()).continuity, mara, at, new Set()).length, 1);
  } finally {
    f.close();
  }
});
await runCase("starting-history/save-recovery", async () => {
  for (const fault of ["before", "after"] as const) {
    const f = await fixture();
    try {
      f.fault(fault);
      await f.feature.prepare();
      let state = await f.cold();
      assert.equal(startingHistoryReady(state), fault === "after");
      assert.equal(state.continuity.records.length, fault === "after" ? 2 : 0);
      const job = f.job();
      assert.equal(f.calls(), 1);
      assert.equal(job.data.hasResult, true);
      await f.service.retryBackgroundJob(job.id, job.data.attempt, "retry-" + fault, job.data.instanceId);
      await f.service.settleBackgroundWork();
      state = await f.cold();
      assert(startingHistoryReady(state));
      assert.equal(state.continuity.records.length, 2);
      assert.equal(state.episodes.records.length, 2);
      assert.equal(f.calls(), 1, "saved initial knowledge replays without another provider request");
      assert.equal(f.job().data.status, "completed");
    } finally {
      f.close();
    }
  }
});
await runCase("starting-history/source-validation", async () => {
  for (const invalid of ["source", "quote", "private-player", "audience"] as const) {
    const f = await fixture(() => {
      const value = result();
      if (invalid === "source") value.notes[0].citations[0].sourceId = "invented";
      if (invalid === "quote") value.notes[0].citations[0].quote = "Mara and Leo are married.";
      if (invalid === "private-player") value.notes[1].for = ["player"];
      if (invalid === "audience") value.notes[0].for = ["outsider"];
      return value;
    });
    try {
      await f.feature.prepare();
      const state = await f.cold();
      assert(!startingHistoryReady(state));
      assert.equal(state.continuity.records.length, 0);
      assert.equal(f.calls(), 1);
      assert.equal(f.job().data.status, "failed");
    } finally {
      f.close();
    }
  }
});
await runCase("starting-history/creator-conflict", async () => {
  let clarified = false;
  const f = await fixture(() =>
    clarified
      ? result()
      : {
          notes: [],
          conflicts: [
            {
              actorIds: ["mara", "leo"],
              question: "Which account establishes their prior connection?",
              citations: [
                { sourceId: "card:mara:backstory", quote: "Mara taught Leo pottery." },
                { sourceId: "card:leo:backstory", quote: "Leo is a potter." },
              ],
            },
          ],
        },
  );
  try {
    await f.feature.prepare();
    const state = await f.cold();
    assert(!startingHistoryReady(state));
    assert.equal(state.startingHistory.conflicts.length, 1);
    await f.feature.prepare();
    assert.equal(f.calls(), 1, "an unresolved creator decision does not buy another request");
    await assert.rejects(
      f.feature.clarify({ sourceHash: memoryHash("stale"), actorIds: ["mara"], text: "They know each other." }),
      /changed/,
    );
    clarified = true;
    await f.feature.clarify({
      sourceHash: state.startingHistory.sourceHash,
      actorIds: ["mara", "leo"],
      text: "Mara taught Leo; both know this.",
    });
    await f.service.settleBackgroundWork();
    const resolved = await f.cold();
    assert(startingHistoryReady(resolved));
    assert.equal(resolved.startingHistory.clarifications.length, 1);
    assert.equal(f.calls(), 2);
  } finally {
    f.close();
  }
});
await runCase("starting-history/incarnation-fence", async () => {
  const f = await fixture();
  try {
    f.beforeModel(() =>
      f.repository.mutateAuthority(
        (state) => {
          state.villagers[0].incarnation = "mara-two";
        },
        { memories: true },
      ),
    );
    await f.feature.prepare();
    const state = await f.cold();
    assert(!startingHistoryReady(state));
    assert.equal(state.continuity.records.length, 0);
    assert.equal(f.calls(), 1);
    assert.equal(f.job().data.status, "obsolete");
  } finally {
    f.close();
  }
});
await runCase("starting-history/established-perspective", async () => {
  const f = await fixture();
  try {
    await f.repository.mutateAuthority(
      (state) => {
        retainNativeFact(
          state,
          {
            id: "prior-information",
            kind: "initialization",
            targetId: "leo",
            revision: 1,
            text: "Mara saw Leo at the library.",
            witnesses: ["mara"],
          },
          at,
          { class: "information", about: ["leo"] },
        );
      },
      { memories: true },
    );
    await f.feature.prepare();
    let state = await f.cold();
    assert(startingHistoryReady(state));
    assert.equal(
      state.continuity.records.length,
      3,
      "mere prior knowledge does not erase authored history or perspective",
    );
    const view = continuityViews(state.continuity, continuityActor(state, "mara")!, at, new Set()).find(
      (row) => row.version.class === "perspective",
    )!;
    await f.repository.mutateAuthority(
      (state) => {
        state.continuity = protectContinuity(
          state.continuity,
          {
            id: view.id,
            recordRevision: view.recordRevision,
            heads: { [continuityHolderKey(view.holder)]: view.headRevision },
          },
          [view.holder],
          "forget-perspective",
          at,
          { forget: true },
        );
        delete state.startingHistory.reviewed.mara;
      },
      { memories: true },
    );
    await f.feature.prepare();
    state = await f.cold();
    assert(startingHistoryReady(state));
    assert.equal(
      state.continuity.records.filter((row) => row.owner?.id === "mara").length,
      1,
      "preparation cannot overwrite or reteach the established protected perspective",
    );
    assert.equal(
      continuityViews(state.continuity, continuityActor(state, "mara")!, at, new Set()).filter(
        (row) => row.version.class === "perspective",
      ).length,
      0,
    );
  } finally {
    f.close();
  }
});
