import assert from "node:assert/strict";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import {
  defaultVillageState,
  readVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/engine/packages/server/src/services/villages/agenda-plan.js";
import {
  bindWishProposals,
  processWishExchange,
  applyPreparedWishVerdict,
} from "../packages/villages/src/engine/packages/server/src/services/villages/wish-progress.js";
import {
  settleBackgroundWork,
  backgroundWorkSummaries,
  recoverBackgroundWork,
} from "../packages/villages/src/engine/packages/server/src/services/villages/background-work.js";
import { wishFingerprint } from "../packages/villages/src/engine/packages/server/src/services/villages/wish-interpretation.js";
import { bindLiveProposals } from "../packages/villages/src/engine/packages/server/src/services/villages/live-memory.js";
import { createExchangeProcessing } from "../packages/villages/src/engine/packages/server/src/services/villages/exchange-processing.js";
import {
  readSceneChanges,
  processSavedExchange,
  publicSceneResponse,
  retrySceneChangeInterpretation,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-session.js";

async function main() {
  const at = new Date().toISOString(),
    state = defaultVillageState();
  state.seed = "wish-live";
  state.setupAt = state.foundedAt = new Date(Date.now() - 1000).toISOString();
  state.progressEngineVersion = 1;
  const wish = {
    id: "company",
    wish: "Talk about the garden and agree on a planting day",
    tell: "Thinking about planting",
    intensity: 2,
    addedAt: state.foundedAt,
    expiresAt: "",
  };
  state.villagers = [
    {
      characterId: "a",
      cardSnapshot: { id: "a", name: "Ada", capturedAt: at, revision: 1, sourceStatus: "available" },
      addedAt: at,
      completedWishes: [],
      agenda: { ...unwrittenVillageAgenda(state.venues, "Ada"), wishes: [wish] },
    } as any,
  ];
  const lines = [
    {
      id: "p",
      role: "user",
      speakerId: "",
      name: "Player",
      content: "Saturday would work for planting those garden beds.",
      at,
      heardBy: ["a"],
    },
    {
      id: "r",
      role: "assistant",
      speakerId: "a",
      name: "Ada",
      content: "I want to plant the garden with you. Let's meet Saturday.",
      at,
      kind: "dialogue",
      heardBy: ["a"],
    },
  ];
  const scene: any = {
    id: "s",
    villageSeed: state.seed,
    processingVersion: 1,
    placeId: "mill",
    placeName: "Mill",
    status: "active",
    participants: [{ characterId: "a", name: "Ada" }],
    activeIds: ["a"],
    lines,
    submissions: [
      {
        id: "t",
        mode: "chat",
        at,
        message: lines[0].content,
        activeIdsAtTurn: ["a"],
        replyLineIds: ["r"],
        wishProposals: [],
        wishProposalError: "",
      },
    ],
  };
  scene.submissions[0].processing = createExchangeProcessing({
    seed: state.seed,
    sceneId: "s",
    submissionId: "t",
    order: 0,
    lineIds: ["p", "r"],
    actionReceiptIds: [],
  });
  scene.submissions[0].processing.domains.projects.status = "applied";
  scene.submissions[0].processing.domains.memories.status = "applied";
  scene.submissions[0].processing.domains.relationships.status = "applied";
  const records = new Map<string, any>([
    ["villages-village", { id: "villages-village", kind: "village", data: state, revision: 1 }],
    ["villages-venue-visit-s", { id: "villages-venue-visit-s", kind: "venue-visit", data: scene, revision: 1 }],
  ]);
  let calls = 0,
    outcome = "fulfilled",
    fail = false;
  let storageFault = false,
    lostAcknowledgement = false;
  let failJudgment = false;
  const release = configureVillagesRuntime({
    persistence: {
      documents: {
        async getById(_package: string, id: string) {
          return structuredClone(records.get(id) ?? null);
        },
        async list(_package: string, kind: string) {
          return structuredClone([...records.values()].filter((record) => record.kind === kind));
        },
        async create(input: any) {
          const row = { ...structuredClone(input), revision: 1 };
          records.set(input.id, row);
          return row;
        },
        async update(input: any) {
          const prior = records.get(input.id);
          if (!prior || prior.revision !== input.expectedRevision) return null;
          if (storageFault && input.id === "villages-village" && !lostAcknowledgement)
            throw new Error("Wish owner write failure");
          const row = { ...prior, ...structuredClone(input), revision: prior.revision + 1 };
          records.set(input.id, row);
          if (storageFault && input.id === "villages-village" && lostAcknowledgement)
            throw new Error("Wish owner acknowledgement lost");
          return row;
        },
        async remove(_package: string, id: string) {
          return records.delete(id);
        },
      },
    },
    async getAgentConfig() {
      return null;
    },
    logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
    languageModels: {
      async resolveForRequest() {
        return {
          connectionId: "fixture",
          model: "labeled-fixture",
          maxOutputTokens: 4096,
          fitContext(messages: any[], options: any) {
            return { messages, ...options };
          },
          async chatComplete(messages: any[]) {
            calls++;
            if (fail) throw new Error("unknown provider outcome");
            if (messages[0].content.startsWith("Prepare faithful"))
              return {
                content: JSON.stringify({
                  complete: true,
                  kind: "conversation",
                  goal: wish.wish,
                  requiresPhysical: false,
                }),
                finishReason: "stop",
              };
            const { checks } = JSON.parse(messages[1].content);
            if (failJudgment) throw new Error("judgment outcome unknown after successful preparation");
            return {
              content: JSON.stringify({
                results: checks.map((check: any) => ({
                  id: check.id,
                  outcome,
                  evidenceIds: check.evidenceIds?.slice(0, 2) ?? ["p", "r"],
                  reason: "Both conditions supported by labeled evidence",
                })),
              }),
              finishReason: "stop",
            };
          },
        };
      },
    },
  } as any);
  try {
    assert.match(bindWishProposals(undefined, state, lines as any, "p", ["r"]).error, /missing/);
    assert.match(
      bindWishProposals(
        [{ actorId: "other", wishId: "company", intent: "reveal", evidence: [0] }],
        state,
        lines as any,
        "p",
        ["r"],
      ).error,
      /unknown/,
    );
    const naturalLines = structuredClone(lines);
    naturalLines[1].content = "I would like to sit in the garden and agree on a planting day.";
    assert.equal(
      bindWishProposals(
        [{ actorId: "a", wishId: "company", intent: "reveal", evidence: [0] }],
        state,
        naturalLines as any,
        "p",
        ["r"],
      ).error,
      "",
      "Would like is a natural disclosure",
    );
    naturalLines[1].content = "If we had time, perhaps I would ask for a garden.";
    assert.ok(
      bindWishProposals(
        [{ actorId: "a", wishId: "company", intent: "reveal", evidence: [0] }],
        state,
        naturalLines as any,
        "p",
        ["r"],
      ).error,
    );
    const reveal = bindWishProposals(
      [{ actorId: "a", wishId: "company", intent: "reveal", evidence: [0] }],
      state,
      lines as any,
      "p",
      ["r"],
    );
    scene.submissions[0].wishProposals = reveal.proposals;
    await processSavedExchange("s", "t");
    assert.equal(calls, 0, "disclosure adds no paid request");
    assert.ok((await readVillageState()).villagers[0].agenda?.wishes[0].learnedAt);
    const sharedNotice = (await readSceneChanges("s")).notices.find((notice) => notice.kind === "wish")!;
    assert.equal(sharedNotice.wishUpdate?.state, "revealed");
    assert.equal(sharedNotice.detail, wish.wish);
    assert.match(sharedNotice.text, /Wish shared/);
    const proposals = bindWishProposals(
      [{ actorId: "a", wishId: "company", intent: "check", evidence: ["player", 0] }],
      state,
      lines as any,
      "p",
      ["r"],
    );
    const turn = records.get("villages-venue-visit-s").data.submissions[0];
    turn.wishProposals = proposals.proposals;
    turn.processing.domains.wishes.status = "pending";
    await processSavedExchange("s", "t");
    await settleBackgroundWork();
    await processSavedExchange("s", "t");
    const current = await readVillageState();
    assert.equal(calls, 1, "one shared interpretation without condition preparation");
    assert.equal(current.villagers[0].agenda?.wishes.length, 0);
    const fulfilledNotice = (await readSceneChanges("s")).notices.find(
      (notice) => notice.wishUpdate?.state === "fulfilled",
    )!;
    assert.equal(fulfilledNotice.wishUpdate?.wishId, wish.id);
    assert.equal(fulfilledNotice.detail, wish.wish);
    assert.equal(records.get("villages-venue-visit-s").data.status, "active", "Wish chips arrive before Scene close");
    assert.equal(
      current.progressTasks.filter((task) => task.definition.owner.kind === "wish" && task.resolvedAt).length,
      1,
    );
    assert.match(current.progressTasks[0].definition.phases[0].requirements[0].title, /garden and agree/);
    await processSavedExchange("s", "t");
    await settleBackgroundWork();
    assert.equal(calls, 1, "saved replay does not bill again");
    assert.equal(
      (await backgroundWorkSummaries()).filter((job) => job.kind === "wish-check").length,
      1,
      "completed checks retain their owner when input is compacted",
    );
    assert.equal((publicSceneResponse(scene) as any).submissions[0].wishProposals, undefined);
    // Physical assertions cannot fulfill a transfer without an authoritative receipt, even with a positive mock verdict.
    const physical = { ...wish, id: "cake", wish: "Bring me a cupcake", learnedAt: at };
    const physicalState = structuredClone(state);
    physicalState.villagers[0].agenda!.wishes = [physical];
    const proposal: any = {
      actorId: "a",
      wishId: "cake",
      fingerprint: wishFingerprint(physical),
      intent: "check",
      lineIds: ["p"],
    };
    applyPreparedWishVerdict(
      physicalState,
      {
        sceneId: "s",
        submissionId: "fake",
        seed: state.seed,
        proposal,
        wish: physical,
        at,
        context: { actorId: "a", evidence: [{ id: "p", at }], card: { name: "Ada" } },
      } as any,
      {
        criteria: { kind: "transfer", goal: physical.wish, requiresPhysical: true, itemName: "cupcake" },
        outcome: "fulfilled",
        evidenceIds: ["p"],
        receiptIds: [],
        reason: "wrong positive",
        memory: "",
      },
    );
    assert.equal(physicalState.villagers[0].agenda?.wishes.length, 1);
    assert.match(Object.values(physicalState.exchangeReceipts)[0].reason, /receipt absent/);
    const progressState = structuredClone(state);
    const first = { ...wish, id: "partial-one", learnedAt: at };
    const second = { ...wish, id: "partial-two", learnedAt: at };
    const hidden = { ...wish, id: "partial-hidden" };
    progressState.villagers[0].agenda!.wishes = [first, second, hidden];
    const progressVerdict: any = {
      criteria: { kind: "conversation", goal: wish.wish, requiresPhysical: false },
      outcome: "progress",
      evidenceIds: ["p"],
      receiptIds: [],
      reason: "Garden discussed; planting day not yet agreed",
      memory: "",
    };
    const applyPartial = (entry: any, submissionId: string) =>
      applyPreparedWishVerdict(
        progressState,
        {
          sceneId: "progress",
          submissionId,
          seed: state.seed,
          at,
          wish: entry,
          proposal: {
            actorId: "a",
            wishId: entry.id,
            fingerprint: wishFingerprint(entry),
            intent: "progress",
            lineIds: ["p"],
          },
          context: { actorId: "a", evidence: [{ id: "p", at }], card: { name: "Ada" } },
        } as any,
        progressVerdict,
      );
    applyPartial(first, "one");
    applyPartial(first, "duplicate");
    applyPartial(second, "two");
    applyPartial(hidden, "hidden");
    assert.equal(
      Object.values(progressState.exchangeReceipts).filter((entry) => entry.notice).length,
      2,
      "new evidence notifies each learned Wish once, with no hidden notice",
    );
    assert.equal(progressState.villagers[0].agenda!.wishes.length, 3, "partial evidence cannot settle a compound goal");
    assert.equal(progressState.progressTasks.filter((entry) => entry.resolvedAt).length, 0);
    const pendingWish = { ...wish, id: "uncertain" };
    const villageDocument = records.get("villages-village");
    villageDocument.data.villagers[0].agenda.wishes = [pendingWish];
    const pendingScene = structuredClone(scene);
    pendingScene.id = "uncertain-scene";
    pendingScene.startedAt = pendingScene.lastActivityAt = at;
    pendingScene.submissions[0].liveProposals = bindLiveProposals(
      { memoryChanges: [], relationshipChanges: { changes: [], permissions: [], disclosures: [] } },
      "p",
      ["r"],
    );
    pendingScene.submissions[0].id = "uncertain-turn";
    pendingScene.submissions[0].wishProposals = [
      {
        actorId: "a",
        wishId: pendingWish.id,
        fingerprint: wishFingerprint(pendingWish),
        intent: "check",
        lineIds: ["p", "r"],
      },
    ];
    pendingScene.submissions[0].processing = createExchangeProcessing({
      seed: state.seed,
      sceneId: pendingScene.id,
      submissionId: "uncertain-turn",
      order: 0,
      lineIds: ["p", "r"],
      actionReceiptIds: [],
    });
    records.set("villages-venue-visit-uncertain-scene", {
      id: "villages-venue-visit-uncertain-scene",
      kind: "venue-visit",
      revision: 1,
      data: pendingScene,
    });
    fail = true;
    await processWishExchange(pendingScene, "uncertain-turn");
    await settleBackgroundWork();
    const afterUnknown = calls;
    await processWishExchange(pendingScene, "uncertain-turn");
    await settleBackgroundWork();
    assert.equal(calls, afterUnknown, "unknown provider outcomes never trigger an automatic retry");
    const failedJob = (await backgroundWorkSummaries()).find(
      (job) => job.status === "failed" || job.status === "interrupted",
    )!;
    assert.ok(failedJob);
    assert.ok(
      (await readSceneChanges("uncertain-scene")).backgroundChecks.some(
        (job) => job.status === "failed" || job.status === "interrupted",
      ),
      "Scene diagnostics include failed Wish batches",
    );
    fail = false;
    outcome = "fulfilled";
    await retrySceneChangeInterpretation("uncertain-scene", "uncertain-turn", "wishes");
    await retrySceneChangeInterpretation("uncertain-scene", "uncertain-turn", "wishes");
    await settleBackgroundWork();
    assert.equal((await readVillageState()).villagers[0].agenda?.wishes.length, 0);
    assert.equal(calls, afterUnknown + 1, "explicit retry needs only one judgment");
    const cachedWish = { ...wish, id: "cached-retry" };
    records.get("villages-village").data.villagers[0].agenda.wishes = [cachedWish];
    const cachedScene = structuredClone(pendingScene);
    cachedScene.id = "cached-scene";
    cachedScene.submissions[0].wishProposals[0] = {
      ...cachedScene.submissions[0].wishProposals[0],
      wishId: cachedWish.id,
      fingerprint: wishFingerprint(cachedWish),
    };
    cachedScene.submissions[0].processing = createExchangeProcessing({
      seed: state.seed,
      sceneId: cachedScene.id,
      submissionId: "uncertain-turn",
      order: 0,
      lineIds: ["p", "r"],
      actionReceiptIds: [],
    });
    records.set("villages-venue-visit-cached-scene", {
      id: "villages-venue-visit-cached-scene",
      kind: "venue-visit",
      revision: 1,
      data: cachedScene,
    });
    failJudgment = true;
    await processWishExchange(cachedScene, "uncertain-turn");
    await settleBackgroundWork();
    const cachedCalls = calls;
    assert.equal(
      records.get("villages-venue-visit-cached-scene").data.submissions[0].processing.domains.wishes.status,
      "failed",
      "Failed background judgment must not leave the Scene queued",
    );
    assert.ok((await backgroundWorkSummaries()).some((job) => job.status === "failed"));
    failJudgment = false;
    await retrySceneChangeInterpretation("cached-scene", "uncertain-turn", "wishes");
    await settleBackgroundWork();
    assert.equal(calls, cachedCalls + 1, "Cached preparation does not shift or repeat paid stages");
    assert.equal((await readVillageState()).villagers[0].agenda?.wishes.length, 0);
    const retiredWish = { ...wish, id: "retired-wish" };
    records.get("villages-village").data.villagers[0].agenda.wishes = [retiredWish];
    const retiredScene = structuredClone(cachedScene);
    retiredScene.id = "retired-scene";
    retiredScene.submissions[0].wishProposals[0].wishId = retiredWish.id;
    retiredScene.submissions[0].wishProposals[0].fingerprint = wishFingerprint(retiredWish);
    retiredScene.submissions[0].processing = createExchangeProcessing({
      seed: state.seed,
      sceneId: retiredScene.id,
      submissionId: "uncertain-turn",
      order: 0,
      lineIds: ["p", "r"],
      actionReceiptIds: [],
    });
    for (const domain of ["projects", "memories", "relationships"])
      retiredScene.submissions[0].processing.domains[domain].status = "applied";
    records.set("villages-venue-visit-retired-scene", {
      id: "villages-venue-visit-retired-scene",
      kind: "venue-visit",
      revision: 1,
      data: retiredScene,
    });
    failJudgment = true;
    await processWishExchange(retiredScene, "uncertain-turn");
    await settleBackgroundWork();
    assert.equal((await readSceneChanges("retired-scene")).changes[0].processing?.domains.wishes.status, "failed");
    const callsBeforeRetirement = calls;
    records.get("villages-village").data.villagers[0].agenda.wishes = [];
    await recoverBackgroundWork();
    await settleBackgroundWork();
    assert.equal(
      (await readSceneChanges("retired-scene")).changes[0].processing?.domains.wishes.status,
      "applied",
      "retiring an inapplicable check settles Scene bookkeeping",
    );
    assert.equal(calls, callsBeforeRetirement, "retirement performs no paid repair");
    failJudgment = false;
    const callsBeforeStorage = calls;
    for (const after of [false, true]) {
      const sceneId = "wish-storage-" + after,
        submissionId = "fault-turn";
      const restored = { ...wish, id: "storage-wish-" + after };
      records.get("villages-village").data.villagers[0].agenda.wishes = [restored];
      const saved: any = structuredClone(scene);
      saved.id = sceneId;
      saved.villageSeed = state.seed;
      saved.submissions = [
        {
          id: submissionId,
          at,
          mode: "chat",
          message: lines[0].content,
          activeIdsAtTurn: ["a"],
          replyLineIds: ["r"],
          wishProposals: [
            {
              actorId: "a",
              wishId: restored.id,
              fingerprint: wishFingerprint(restored),
              intent: "reveal",
              lineIds: ["r"],
            },
          ],
          wishProposalError: "",
        },
      ];
      saved.submissions[0].processing = createExchangeProcessing({
        seed: state.seed,
        sceneId,
        submissionId,
        order: 0,
        lineIds: ["p", "r"],
        actionReceiptIds: [],
      });
      for (const domain of ["projects", "memories", "relationships"])
        saved.submissions[0].processing.domains[domain].status = "applied";
      records.set("villages-venue-visit-" + sceneId, {
        id: "villages-venue-visit-" + sceneId,
        kind: "venue-visit",
        revision: 1,
        data: saved,
      });
      storageFault = true;
      lostAcknowledgement = after;
      await processSavedExchange(sceneId, submissionId);
      storageFault = false;
      await processSavedExchange(sceneId, submissionId);
      await processSavedExchange(sceneId, submissionId);
      assert.equal(
        Object.values((await readVillageState()).exchangeReceipts).filter(
          (receipt) => receipt.sceneId === sceneId && receipt.notice,
        ).length,
        1,
      );
      assert.equal((await readSceneChanges(sceneId)).changes[0].processing?.domains.wishes.status, "applied");
    }
    assert.equal(calls, callsBeforeStorage, "Wish storage replay reuses evidence without interpretation requests");
    console.log(
      "Live Wishes: free disclosure, relevant background check, faithful compound goal, fulfillment, physical rejection and free replay passed. Mocked judgments do not establish live model accuracy.",
    );
  } finally {
    release();
  }
}
void main();
