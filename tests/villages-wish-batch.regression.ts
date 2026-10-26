import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import { knownWishes } from "../packages/villages/src/server/domain/rules/wish-journal.js";
import { configureSceneQueries, sceneQueries } from "../packages/villages/src/server/features/scenes/services.js";
import assert from "node:assert/strict";

import { mutateVillageState, readVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { interpretWishBatch } from "../packages/villages/src/server/features/residents/wishes/wish-interpretation.js";
import { wishFingerprint } from "../packages/villages/src/server/domain/rules/wish-interpretation-rules.js";
import { localWishRequirements } from "../packages/villages/src/server/domain/rules/wish-admission.js";
import { processWishExchange } from "../packages/villages/src/server/features/residents/wishes/wish-progress.js";
import { backgroundJobSnapshot, settleBackgroundWork } from "../packages/villages/src/server/jobs/background-work.js";
import { fixtureInterpretationChecks } from "./fixtures/villages-interpretation-payload.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";

async function main() {
  const at = new Date().toISOString(),
    state = defaultVillageState(),
    records = new Map<string, any>();
  state.seed = "wish-batch";
  state.setupAt = state.foundedAt = at;
  let calls = 0,
    outcome = "progress",
    proofKind = "conversation",
    wireCharacters = 0,
    malformed = false,
    truncated = false,
    historyRequired = false,
    historyObserved = false;
  const contexts = ["a", "b", "c"].map((actorId) => ({
    actorId,
    village: "Village",
    setting: "",
    moment: {} as any,
    card: { name: actorId },
    playerName: "Player",
    playerDescription: "",
    claim: "Check existing Wish",
    receipts: [],
    wishes: [
      {
        id: actorId,
        wish: "Talk about gardening and agree on a planting day",
        tell: "",
        intensity: 1,
        addedAt: at,
        expiresAt: "",
      },
    ],
    evidence: [
      { id: "p", speakerId: "player", name: "Player", content: "Saturday is a good planting day.", at, current: true },
      { id: actorId, speakerId: actorId, name: actorId, content: "Saturday works for me.", at, current: true },
    ],
    transcript: [],
    memory: [],
    worldState: [],
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
  records.set("villages-village", { id: "villages-village", kind: "village", data: state, revision: 1 });
  const release = configureVillagesRuntime({
    persistence: {
      documents: villageFixtureDocuments({
        async getById(_p: string, id: string) {
          return structuredClone(records.get(id) ?? null);
        },
        async list(_p: string, kind: string) {
          return structuredClone([...records.values()].filter((r) => r.kind === kind));
        },
        async create(value: any) {
          const row = { ...structuredClone(value), revision: 1 };
          records.set(value.id, row);
          return row;
        },
        async update(value: any) {
          const row = { ...structuredClone(value), revision: (records.get(value.id)?.revision ?? 0) + 1 };
          records.set(value.id, row);
          return row;
        },
      }),
    },
    languageModels: {
      async resolveForRequest() {
        return {
          model: "mock",
          connectionId: "mock",
          maxOutputTokens: 5000,
          fitContext(messages: any, options: any) {
            return { messages, ...options };
          },
          async chatComplete(messages: any, options: any) {
            calls++;
            assert.ok(!messages[0].content.startsWith("Prepare"));
            assert.ok(options.maxTokens >= 1024 && options.maxTokens <= 4096);
            wireCharacters += messages[1].content.length;
            assert.ok(messages[1].content.length <= 12000);
            const checks = fixtureInterpretationChecks(messages[1].content);
            const hasHistory = checks.some((check) =>
              check.evidence.some(
                (line: any) => line.content === "We both grow roses by the river." && line.current === false,
              ),
            );
            if (historyRequired) historyObserved = hasHistory;
            const content = JSON.stringify({
              results: malformed
                ? []
                : checks.map((check) => ({
                    id: check.id,
                    outcome: historyRequired && !hasHistory ? "none" : outcome,
                    evidenceIds: check.evidence
                      .filter((line: any) => (historyRequired ? line.kind !== "claim" : line.current))
                      .map((line: any) => line.id),
                    reason: "Actual planting agreement",
                    details: { proofKind },
                  })),
            });
            return { content, finishReason: truncated ? "length" : "stop" };
          },
        };
      },
    },
  } as any);
  try {
    const batch = await interpretWishBatch(contexts as any, "batch-test", "one");
    assert.equal(calls, 1, "three residents share one check without preparation");
    assert.equal(batch.results.length, 3);
    assert.ok(batch.results.every((r) => r.outcome === "progress"));
    assert.ok(wireCharacters < 9000, "shared input avoids repeating entire histories/cards");
    const mixed = structuredClone(contexts[0]);
    mixed.wishes[0].wish = "Repair the bridge and agree on an opening day";
    assert.equal(localWishRequirements(mixed.wishes[0]).criteria.requiresPhysical, true);
    const partial = await interpretWishBatch([mixed] as any, "mixed-test", "partial");
    assert.equal(partial.results[0].outcome, "progress");
    assert.equal(
      (partial.checks[0].facts as any).criteria.requiresPhysical,
      false,
      "conversation can advance one part of a mixed goal",
    );
    outcome = "fulfilled";
    const incomplete = await interpretWishBatch([mixed] as any, "mixed-full-test", "full");
    assert.equal(incomplete.results[0].outcome, "none", "conversation cannot complete the physical part");
    for (const wish of [
      "Repair trust between friends",
      "Establish a claim recognized by everyone",
      "Give me a blessing",
    ]) {
      assert.equal(localWishRequirements({ ...mixed.wishes[0], wish }).criteria.requiresPhysical, false, wish);
    }
    const physical = structuredClone(contexts[0]);
    physical.wishes[0].wish = "Find a high vantage point inside the mall where I can stretch my arms";
    const before = calls;
    assert.equal((await interpretWishBatch([physical] as any, "no-receipt", "physical")).results[0].outcome, "none");
    assert.equal(calls, before);
    proofKind = "physical";
    const wrong = await interpretWishBatch([contexts[0]] as any, "wrong-positive", "physical-claim");
    assert.equal(wrong.results[0].outcome, "none", "physical proof kind never bypasses server receipts");
    truncated = true;
    const limited = await interpretWishBatch([contexts[0]] as any, "truncated-test", "limited");
    assert.equal(limited.results[0].outcome, "unresolved");
    assert.match(limited.results[0].reason, /output limit/);
    truncated = false;
    const scene: any = {
      id: "batch-production",
      villageSeed: state.seed,
      lines: contexts[0].evidence.map((line) => ({
        ...line,
        role: line.speakerId === "player" ? "user" : "assistant",
        heardBy: ["a"],
      })),
      submissions: [
        {
          id: "turn",
          at,
          mode: "chat",
          replyLineIds: ["a"],
          wishProposalError: "",
          wishProposals: [
            {
              actorId: "a",
              wishId: "a",
              fingerprint: wishFingerprint(contexts[0].wishes[0]),
              intent: "check",
              lineIds: ["p", "a"],
            },
          ],
        },
      ],
    };
    records.set("villages-venue-visit-" + scene.id, {
      id: "villages-venue-visit-" + scene.id,
      kind: "venue-visit",
      revision: 1,
      data: structuredClone(scene),
    });
    malformed = true;
    await processWishExchange(scene, "turn");
    await settleBackgroundWork();
    const afterMalformed = calls;
    const status = await processWishExchange(scene, "turn");
    await settleBackgroundWork();
    assert.equal(status.status, "failed");
    assert.ok(records.get("villages-venue-visit-" + scene.id).data.submissions[0].progressProcessedAt);
    assert.equal(calls, afterMalformed, "invalid output cannot auto-repair or bill again");
    // An unrevealed Wish must retain accepted witnessed progress across Scene boundaries.
    malformed = false;
    proofKind = "conversation";
    outcome = "fulfilled";
    historyRequired = true;
    const prior = structuredClone(scene);
    prior.id = "earlier-private-progress";
    prior.processingVersion = 1;
    prior.lines = [
      {
        id: "earlier-player",
        speakerId: "",
        role: "user",
        name: "Player",
        kind: "dialogue",
        content: "We both grow roses by the river.",
        at,
        heardBy: ["a"],
        contactHidden: true,
        attentionEvidence: true,
      },
      {
        id: "earlier-a",
        speakerId: "a",
        role: "assistant",
        name: "a",
        kind: "dialogue",
        content: "Yes, we have talked about gardening. Let us choose a planting day next time.",
        at,
        heardBy: ["a"],
      },
    ];
    prior.submissions[0].replyLineIds = ["earlier-player", "earlier-a"];
    prior.submissions[0].wishProposals[0].intent = "progress";
    prior.submissions[0].wishProposals[0].lineIds = ["earlier-player", "earlier-a"];
    records.set("villages-venue-visit-" + prior.id, {
      id: "villages-venue-visit-" + prior.id,
      kind: "venue-visit",
      revision: 1,
      data: prior,
    });
    await mutateVillageState((live) => {
      live.exchangeReceipts["wish-change:earlier-private-progress:turn:a:progress"] = {
        id: "wish-change:earlier-private-progress:turn:a:progress",
        domain: "wishes",
        status: "applied",
        actorId: "a",
        wishId: "a",
        sceneId: prior.id,
        submissionId: "turn",
        at,
        evidenceIds: ["earlier-player", "earlier-a"],
        reason: "New Wish evidence accepted",
      };
    });
    const frozenBefore = await backgroundJobSnapshot("wish-check", "wish-batch:" + scene.id + ":turn");
    const beforeFrozenReplay = calls;
    let archivedReads = 0;
    const originalQueries = sceneQueries();
    const releaseQueries = configureSceneQueries({
      ...originalQueries,
      readWishTurnEvidence: async () => {
        archivedReads++;
        throw Error("Archived source unavailable");
      },
    });
    try {
      const frozenStatus = await processWishExchange(scene, "turn");
      assert.equal(frozenStatus.status, "failed");
      assert.equal(archivedReads, 0, "Existing frozen Wish work never rereads archives");
      assert.equal(calls, beforeFrozenReplay);
      assert.deepEqual(await backgroundJobSnapshot("wish-check", "wish-batch:" + scene.id + ":turn"), frozenBefore);
    } finally {
      releaseQueries();
      configureSceneQueries(originalQueries);
    }
    const next = structuredClone(scene);
    next.id = "later-private-completion";
    next.processingVersion = 1;
    next.submissions[0].id = "next-turn";
    records.set("villages-venue-visit-" + next.id, {
      id: "villages-venue-visit-" + next.id,
      kind: "venue-visit",
      revision: 1,
      data: next,
    });
    const recovered = await sceneQueries().readWishTurnEvidence({
      receiptId: "wish-change:earlier-private-progress:turn:a:progress",
      seed: state.seed,
      actorId: "a",
      wishId: "a",
      fingerprint: wishFingerprint(contexts[0].wishes[0]),
      at,
    });
    assert.equal(recovered.length, 2, "Accepted source turn is available to the private evidence query");
    const beforeContinuity = calls;
    await processWishExchange(next, "next-turn");
    await settleBackgroundWork();
    const completed = await readVillageState({ memories: true });
    assert.equal(
      historyObserved,
      true,
      "The one existing Wish check receives accepted earlier witnessed evidence as historical",
    );
    assert.equal(
      completed.villagers[0].agenda!.wishes.length,
      0,
      "Historical gardening plus the current agreement completes the original goal",
    );
    assert.equal(completed.villagers[0].wishLifecycle?.pendingOutcomes.at(-1)?.kind, "fulfilled");
    assert.equal(
      Object.values(completed.exchangeReceipts).filter(
        (entry) => entry.domain === "wishes" && entry.wishOutcome === "fulfilled",
      ).length,
      1,
    );
    assert.equal(knownWishes(completed, "a").length, 0, "Private proof does not disclose an unrevealed Wish");
    assert.equal(calls, beforeContinuity + 1, "Continuity adds storage reads, not another provider stage");
    await processWishExchange(next, "next-turn");
    await settleBackgroundWork();
    assert.equal(calls, beforeContinuity + 1, "Completed cross-Scene replay is provider-free");
    console.log(
      "Wish batch: three residents/one request, no preparation, mixed progress, receipt guards, idioms and invalid-output recovery passed",
    );
  } finally {
    release();
  }
}
void main();
