// Test cases: common-wishes/founding, common-wishes/save-recovery, common-wishes/empty, common-wishes/knowledge, common-wishes/incarnation, common-wishes/consumed-protection, common-wishes/founding-coordinator, common-wishes/routine-protection, common-wishes/prior-protection
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { createWishes } from "../packages/villages/src/server/features/residents/wishes/service.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createVillageStateService } from "../packages/villages/src/server/features/world/village-state-service.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  continuityWishes,
  changeContinuityMemory,
  inspectContinuityMemory,
  continuityPreparationContext,
} from "../packages/villages/src/server/domain/rules/continuity-library.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import {
  seedFoundingCircumstances,
  readFoundingCircumstances,
} from "../packages/villages/src/server/domain/rules/founding-circumstances.js";
import { createFoundingPreparation } from "../packages/villages/src/server/features/founding/preparation-service.js";
import { createResidentAgendas } from "../packages/villages/src/server/features/residents/resident-agenda-service.js";
import { foundingSlot } from "../packages/villages/src/server/domain/rules/founding-tasks.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
const at = "2026-11-09T12:00:00.000Z",
  wish = "Mara wants to sail her own boat because choosing her destination matters to her, once she feels ready.";
async function fixture(value: string | null = wish, screening?: "clear" | "uncertain") {
  const storage = sceneHistoryFixture(),
    repository = createVillageRepository(() => storage.gate.documents),
    stateService = createVillageStateService(repository),
    context = createBackgroundContext();
  const world = coerceVillageState({
    ...defaultVillageState(),
    seed: "wish-world",
    setupAt: at,
    foundedAt: at,
    foundingPreparation: { status: "pending", tasksVersion: 1, tasks: {} },
    villagers: [
      {
        characterId: "mara",
        incarnation: "mara-one",
        letterFontId: "caveat",
        addedAt: at,
        agenda: null,
        wishes: [],
        cardSnapshot: {
          id: "mara",
          name: "Mara",
          revision: 1,
          sourceStatus: "available",
          capturedAt: at,
          backstory: "Mara values choosing her own path.",
        },
      },
    ],
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
      input.id === "villages-village" && input.data?.foundingPreparation?.tasks?.mara?.wish?.status === "completed"
        ? fault
        : undefined;
    if (failing) fault = undefined;
    if (failing === "before") throw Error("Synthetic initial Wish save failure");
    const saved = await update(input);
    if (failing === "after") throw Error("Synthetic initial Wish lost acknowledgement");
    return saved;
  };
  const model: any = {
    connectionId: "synthetic",
    model: "synthetic",
    name: "synthetic",
    maxContext: 32000,
    maxOutputTokens: 8192,
    fitContext: (messages: any, options: any) => ({ messages, maxTokens: options.maxTokens }),
    chatComplete: async (messages: any[]) => {
      calls++;
      await beforeModel?.();
      if (screening) assert(JSON.parse(messages[1].content).protections.length > 0);
      return {
        content: JSON.stringify({
          wish: value,
          ...(screening ? { protection: { roots: [], disposition: screening } } : {}),
        }),
        finishReason: "stop",
        usage: { totalTokens: 13 },
      };
    },
  };
  const feature = createWishes({
    readVillageState: (options) => repository.readAuthority({ ...options, memories: true }),
    mutateVillageState: (mutate, options) => stateService.mutateVillageState(mutate, { ...options, memories: true }),
    queueBackgroundJob: (input) => service.queueBackgroundJob(input),
    villagesLanguageModels: () => ({ resolveForRequest: async () => model }) as any,
    villagesConnectionIdFor: async () => "synthetic",
    completeWithRoom: async (model, messages, maxTokens, options) =>
      context.backgroundCalls.getStore()!(model, messages, maxTokens, options),
  });
  const service = createBackgroundWork({
    villagesDocuments: () => storage.gate.documents,
    villagesLogger: () => ({ debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} }),
    withCurrentJobWrite: (work) => repository.withAuthorityLock(work),
    withRepairWork: (work) => storage.gate.work(work),
    readVillageState: (options) => repository.readAuthority(options),
    mutateVillageState: (mutate, options) => stateService.mutateVillageState(mutate, { ...options, memories: true }),
    withUsagePurpose: (_purpose, work) => work(),
    measurePipeline: (_name, _tags, work) => work(),
    runtimeDebug() {},
    backgroundCalls: context.backgroundCalls,
    handlers: [["wish", feature.handler]],
  });
  const stop = service.startBackgroundWork();
  await service.recoverBackgroundWork();
  const input = {
    village: "Village",
    setting: "A village.",
    home: "A small cottage.",
    card: world.villagers[0].cardSnapshot,
    venues: [],
    lore: [],
    wishes: [],
    schedule: null,
  };
  return {
    storage,
    repository,
    feature,
    service,
    calls: () => calls,
    cold: () => createVillageRepository(() => storage.gate.documents).readAuthority({ memories: true }),
    job: () => [...storage.rows.values()].find((row) => row.kind === "background-work")!,
    fault: (value: "before" | "after") => {
      fault = value;
    },
    beforeModel: (work: () => Promise<void>) => {
      beforeModel = work;
    },
    prepare: async () => {
      const captured = continuityPreparationContext(await repository.readAuthority({ memories: true }), "mara", at);
      await feature.queueFoundingWish("mara", {
        ...input,
        continuity: {
          fingerprint: captured.fingerprint,
          sources: captured.sources,
          protectionFingerprint: captured.protectionFingerprint,
          protections: captured.protections,
        },
        wishes: captured.wishes,
        circumstances: { worldFacts: captured.circumstances },
      });
      await service.settleBackgroundWork();
    },
    close: () => {
      stop();
      storage.release();
    },
  };
}
await runCase("common-wishes/prior-protection", async () => {
  for (const action of ["forget", "repair"] as const)
    for (const screening of ["clear", "uncertain", undefined] as const) {
      const f = await fixture(wish, screening);
      try {
        await f.repository.mutateAuthority(
          (state) => {
            retainNativeFact(
              state,
              {
                id: "prior-note",
                kind: "initialization",
                targetId: "mara",
                revision: 1,
                text: "Mara recalls an old secret about a lighthouse.",
                witnesses: ["mara"],
              },
              at,
            );
            const root = state.continuity.records[0],
              view = inspectContinuityMemory(state, root.id, "mara", true, at);
            state.continuity = changeContinuityMemory(
              state,
              root.id,
              {
                seed: state.seed,
                operationId: "before-wish-" + action,
                target: view.target!,
                knowers: ["mara"],
                ...(action === "repair" ? { text: "Mara remembers visiting a different lighthouse." } : {}),
              },
              action,
              at,
            );
          },
          { memories: true },
        );
        await f.prepare();
        const state = await f.cold();
        assert.equal(f.calls(), 1);
        assert.equal(f.job().data.status, screening === "clear" ? "completed" : "failed", f.job().data.error);
        assert.equal(
          continuityWishes(state, "mara", true, at).length,
          screening === "clear" ? 1 : 0,
          "unrelated protection allows screened initial knowledge without unsafe bypass",
        );
        assert.equal(state.foundingPreparation?.tasks?.mara?.wish?.status === "completed", screening === "clear");
      } finally {
        f.close();
      }
    }
});
await runCase("common-wishes/founding", async () => {
  const f = await fixture();
  try {
    await f.prepare();
    const state = await f.cold();
    assert.equal(f.job().data.status, "completed", f.job().data.error);
    assert.equal(state.foundingPreparation?.tasks?.mara?.wish?.status, "completed");
    assert.equal(f.calls(), 1);
    assert.equal(state.continuity.records.length, 1);
    assert.equal(state.continuity.versions.length, 1);
    const own = continuityWishes(state, "mara", true, at);
    assert.equal(own.length, 1);
    assert.equal(own[0].text, wish);
    assert.equal(own[0].facts.length, 1);
    assert.deepEqual(continuityWishes(state, "mara", false, at), [], "preparation grants no Player knowledge");
    await assert.rejects(f.feature.setWishFollowing("mara", own[0].wishId, false), /unavailable/);
  } finally {
    f.close();
  }
});
await runCase("common-wishes/save-recovery", async () => {
  for (const fault of ["before", "after"] as const) {
    const f = await fixture();
    try {
      f.fault(fault);
      await f.prepare();
      let state = await f.cold();
      assert.equal(state.continuity.records.length, fault === "after" ? 1 : 0);
      assert.equal(state.foundingPreparation?.tasks?.mara?.wish?.status === "completed", fault === "after");
      const job = f.job();
      await f.service.retryBackgroundJob(job.id, job.data.attempt, "retry-" + fault, job.data.instanceId);
      await f.service.settleBackgroundWork();
      state = await f.cold();
      assert.equal(f.job().data.status, "completed", f.job().data.error);
      assert.equal(state.continuity.records.length, 1);
      assert.equal(f.calls(), 1);
      assert.equal(state.foundingPreparation?.tasks?.mara?.wish?.status, "completed");
    } finally {
      f.close();
    }
  }
});
await runCase("common-wishes/empty", async () => {
  const f = await fixture(null);
  try {
    await f.prepare();
    const state = await f.cold();
    assert.equal(f.job().data.status, "completed", f.job().data.error);
    assert.equal(state.continuity.records.length, 0);
    assert.equal(state.foundingPreparation?.tasks?.mara?.wish?.status, "completed");
    assert.equal(f.calls(), 1);
  } finally {
    f.close();
  }
});
await runCase("common-wishes/knowledge", async () => {
  const f = await fixture();
  try {
    await f.prepare();
    const state = await f.cold(),
      owner = continuityActor(state, "mara")!;
    retainNativeFact(
      state,
      {
        id: "shared-wish",
        kind: "initialization",
        targetId: "mara",
        revision: 1,
        text: "Mara hopes to share a quiet meal, when ready.",
        witnesses: ["mara", "player"],
      },
      at,
      { class: "desire", owner, current: true, about: ["mara"] },
    );
    const shared = continuityWishes(state, "mara", false, at)[0];
    assert.equal(shared.text, "Mara hopes to share a quiet meal, when ready.");
    const inspected = inspectContinuityMemory(state, shared.wishId, "mara", true, at);
    state.continuity = changeContinuityMemory(
      state,
      shared.wishId,
      {
        seed: state.seed,
        operationId: "private-correction",
        target: inspected.target!,
        knowers: ["mara"],
        text: "Mara now wants solitude, and has told nobody.",
      },
      "repair",
      at,
    );
    assert.deepEqual(
      continuityWishes(state, "mara", false, at),
      [shared],
      "private correction cannot update public facts, history or status",
    );
    const own = continuityWishes(state, "mara", true, at).find((row) => row.wishId === shared.wishId)!;
    assert.equal(own.text, "Mara now wants solitude, and has told nobody.");
    assert.equal(own.facts.length, 1);
    assert.equal(own.facts[0].text, own.text);
    await f.repository.mutateAuthority(
      (saved) => {
        saved.continuity = state.continuity;
        saved.episodes = state.episodes;
      },
      { memories: true },
    );
    await f.feature.setWishFollowing("mara", shared.wishId, false);
    assert.equal(continuityWishes(await f.cold(), "mara", false, at)[0].followed, false);
    const current = await f.cold(),
      view = inspectContinuityMemory(current, shared.wishId, "player", true, at);
    current.continuity = changeContinuityMemory(
      current,
      shared.wishId,
      { seed: current.seed, operationId: "forget-player", target: view.target!, knowers: ["player"] },
      "forget",
      at,
    );
    assert.deepEqual(continuityWishes(current, "mara", false, at), []);
    assert(continuityWishes(current, "mara", true, at).length > 0);
  } finally {
    f.close();
  }
});
await runCase("common-wishes/incarnation", async () => {
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
    await f.prepare();
    assert.equal(f.job().data.status, "obsolete");
    assert.equal((await f.cold()).continuity.records.length, 0);
    assert.equal(f.calls(), 1);
  } finally {
    f.close();
  }
});
await runCase("common-wishes/consumed-protection", async () => {
  for (const action of ["forget", "repair"] as const) {
    const f = await fixture("Mara hopes to help with the damaged bridge once the repairs are safe.");
    try {
      await f.repository.mutateAuthority(
        (state) => {
          seedFoundingCircumstances(
            state,
            readFoundingCircumstances(
              [{ scope: "village", summary: "The bridge is damaged and closed for repairs." }],
              [],
              at,
            ),
            ["mara"],
            at,
          );
        },
        { memories: true },
      );
      await f.prepare();
      let state = await f.cold();
      assert.equal(f.job().data.status, "completed", f.job().data.error);
      assert.equal(continuityWishes(state, "mara", true, at).length, 1);
      const circumstance = state.continuity.records.find((record) =>
        state.continuity.versions.some(
          (version) => version.rootId === record.id && version.text === "The bridge is damaged and closed for repairs.",
        ),
      )!;
      const selected = inspectContinuityMemory(state, circumstance.id, "mara", true, at);
      await f.repository.mutateAuthority(
        (state) => {
          state.continuity = changeContinuityMemory(
            state,
            circumstance.id,
            {
              seed: state.seed,
              operationId: "protect-circumstance-" + action,
              target: selected.target!,
              knowers: ["mara"],
              ...(action === "repair" ? { text: "Mara remembers that the bridge has already been repaired." } : {}),
            },
            action,
            at,
          );
        },
        { memories: true },
      );
      state = await f.cold();
      assert.equal(
        continuityWishes(state, "mara", true, at).length,
        0,
        "derived Wish cannot prime a protected consumed circumstance",
      );
      assert.equal(f.calls(), 1);
    } finally {
      f.close();
    }
  }
});
await runCase("common-wishes/founding-coordinator", async () => {
  const f = await fixture();
  try {
    const states = createVillageStateService(f.repository);
    await f.repository.mutateAuthority(
      (state) => {
        state.foundingPreparation!.tasks!.mara = {
          routine: {
            contract: 1,
            status: "completed",
            revision: memoryHash("routine"),
            jobId: foundingSlot("routine", "mara"),
            attempt: 1,
            error: "",
          },
        };
        seedFoundingCircumstances(
          state,
          readFoundingCircumstances([{ scope: "village", summary: "A quiet village." }], [], at),
          ["mara"],
          at,
        );
      },
      { memories: true },
    );
    const preparation = createFoundingPreparation({
      readVillageState: (options) => f.repository.readAuthority(options),
      mutateVillageState: (mutate, options) => states.mutateVillageState(mutate, { ...options, memories: true }),
      backgroundJobSnapshot: f.service.backgroundJobSnapshot,
      backgroundWorkSummaries: f.service.backgroundWorkSummaries,
      queueFoundingWish: f.feature.queueFoundingWish,
      retryBackgroundJob: f.service.retryBackgroundJob,
      settleBackgroundWork: f.service.settleBackgroundWork,
      readFoundingResidentContext: async () => {
        const state = await f.cold(),
          continuity = continuityPreparationContext(state, "mara", at);
        return {
          continuity: {
            fingerprint: continuity.fingerprint,
            sources: continuity.sources,
            protectionFingerprint: continuity.protectionFingerprint,
            protections: continuity.protections,
          },
          village: "Village",
          setting: "A village.",
          home: "A cottage.",
          card: state.villagers[0].cardSnapshot,
          venues: [],
          lore: [],
          wishes: continuity.wishes,
          circumstances: { worldFacts: continuity.circumstances },
          schedule: null,
        };
      },
      preparePrivateSpaces: async () => {},
      reportFoundingProgress: async () => {},
      queueVillagerAgenda: async () => {
        throw Error("Completed routine must not be regenerated");
      },
      buildVillageSnapshot: async () => ({}) as any,
      villagesLogger: () => ({ debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} }),
    });
    await preparation.prepareFoundedVillage();
    const state = await f.cold();
    assert.equal(state.foundingPreparation?.status, "ready", state.foundingPreparation?.error);
    assert.equal(continuityWishes(state, "mara", true, at).length, 1);
    assert.equal(f.calls(), 1);
    await preparation.prepareFoundedVillage();
    assert.equal(f.calls(), 1, "repeated coordinator entry makes no further purchase");
  } finally {
    f.close();
  }
});
await runCase("common-wishes/routine-protection", async () => {
  for (const action of ["forget", "repair"] as const) {
    const f = await fixture();
    try {
      const states = createVillageStateService(f.repository);
      await f.repository.mutateAuthority(
        (state) => {
          seedFoundingCircumstances(
            state,
            readFoundingCircumstances([{ scope: "village", summary: "The bridge is closed for repairs." }], [], at),
            ["mara"],
            at,
          );
        },
        { memories: true },
      );
      let routineCalls = 0;
      const agendas = createResidentAgendas({
        readVillageState: (options) => f.repository.readAuthority(options),
        mutateVillageState: (mutate, options) => states.mutateVillageState(mutate, options),
        reportFoundingProgress: async () => {},
        readEffectiveVillagerCard: async () => (await f.cold()).villagers[0].cardSnapshot as any,
        readVillageLore: async () => [],
        queueBackgroundJob: f.service.queueBackgroundJob,
        backgroundWorkSummaries: f.service.backgroundWorkSummaries,
        readNativeScheduleSnapshot: async () => ({ schedules: [] }) as any,
        parseCompactFoundingCompletion: () => {
          throw Error("No saved response needed");
        },
        proposeCompactFounding: async (input) => {
          routineCalls++;
          assert(JSON.stringify(input.circumstances).includes("bridge"));
          const state = await f.cold(),
            root = state.continuity.records[0],
            selected = inspectContinuityMemory(state, root.id, "mara", true, at);
          await f.repository.mutateAuthority(
            (state) => {
              state.continuity = changeContinuityMemory(
                state,
                root.id,
                {
                  seed: state.seed,
                  operationId: "during-routine-" + action,
                  target: selected.target!,
                  knowers: ["mara"],
                  ...(action === "repair" ? { text: "Mara remembers that the bridge is safe and open." } : {}),
                },
                action,
                at,
              );
            },
            { memories: true },
          );
          return { agenda: { routine: "A stale bridge-derived routine." } as any };
        },
      });
      f.service.registerBackgroundHandler("agenda", agendas.agendaBackgroundHandler);
      await agendas.queueVillagerAgenda("mara");
      await f.service.settleBackgroundWork();
      const job = [...f.storage.rows.values()].find(
        (row) => row.kind === "background-work" && row.data.kind === "agenda",
      )!;
      assert.equal(job.data.status, "obsolete", job.data.error);
      assert.equal((await f.cold()).villagers[0].agenda, null);
      assert.equal(routineCalls, 1);
      assert.equal(f.calls(), 0);
    } finally {
      f.close();
    }
  }
});
