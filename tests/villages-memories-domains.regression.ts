import { createWishLifecycle } from "../packages/villages/src/server/features/residents/wishes/wish-lifecycle-service.js";
import {
  fillCommittedWishMemories,
  invalidateWishCompletion,
} from "../packages/villages/src/server/domain/rules/wish-memories.js";
// Test cases: memories-domains/disclosures, memories-domains/authority, memories-domains/goal-journal, memories-domains/completion, memories-domains/lifecycle, memories-domains/wish-fallback, memories-domains/correction-race
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceWish } from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import {
  addWishFacts,
  wishJournal,
  wishCheckKnowledge,
  knownWishes,
  rememberWishEvidence,
} from "../packages/villages/src/server/domain/rules/wish-journal.js";
import { knownDevelopment } from "../packages/villages/src/server/domain/rules/development-knowledge.js";
import { rememberDomainFact } from "../packages/villages/src/server/domain/rules/domain-memories.js";
import {
  applyVillageMemory,
  forgetVillageMemory,
  reserveMemoryScene,
} from "../packages/villages/src/server/domain/rules/village-memories.js";
import { applyMemoryRepair } from "../packages/villages/src/server/domain/rules/memory-application.js";
import { projectMemories } from "../packages/villages/src/server/domain/rules/memory-views.js";
import {
  applyPreparedWishVerdict,
  effectId,
} from "../packages/villages/src/server/domain/rules/wish-progress-rules.js";
import { wishFingerprint } from "../packages/villages/src/server/domain/rules/wish-interpretation-rules.js";
import { rememberWishNeed } from "../packages/villages/src/server/domain/rules/wish-policy.js";
import { releaseSceneMemories } from "../packages/villages/src/server/domain/rules/scene-memory-lifecycle.js";
import { memoryProposal, memoryRepair, memoryTime } from "./helpers/memories-fixture.js";
function world() {
  const state = defaultVillageState();
  state.seed = "memory-domains";
  state.foundedAt = state.setupAt = memoryTime();
  state.villagers = ["aqua", "gidget"].map((characterId) => ({
    characterId,
    addedAt: memoryTime(),
    cardSnapshot: {
      id: characterId,
      name: characterId,
      capturedAt: memoryTime(),
      revision: 1,
      sourceStatus: "available",
    },
    completedWishes: [],
    agenda: { wishes: [], day: [], routineSummary: "Ordinary day", generatedAt: memoryTime(), source: "village" },
  })) as any;
  return state;
}
function learn(
  state: ReturnType<typeof world>,
  text: string,
  domainRef: any,
  fields?: Record<string, string | boolean>,
  audience = ["player", "aqua"],
) {
  const next = memoryProposal(state.memories, { text, audience, patch: { kind: "information", domainRef } });
  if (fields) for (const learner of Object.values(next.proposal.learners)) learner.disclosed = fields;
  applyVillageMemory(state, next.proposal, next.context);
  return state.memories.records.at(-1)!;
}
await runCase("memories-domains/disclosures", () => {
  const state = world();
  state.development = {
    residents: {
      aqua: {
        pursuits: [
          {
            id: "move",
            targetVenueId: "secret-attic",
            status: "arranged",
            consents: { player: { decision: "refuse" } },
          },
        ],
      },
    },
  } as any;
  const ref = { kind: "pursuit", id: "move", characterId: "aqua" };
  const first = learn(state, "Aqua is considering an orchard home.", ref, {
    title: "Move to the orchard",
    status: "considering",
  });
  const second = learn(state, "Aqua likes the orchard's morning light.", ref);
  assert.equal(knownDevelopment(state, "aqua")[0].title, "Move to the orchard");
  state.memories = applyMemoryRepair(
    state.memories,
    memoryRepair(state.memories, "repair", ["player"], "Aqua was discussing the orchard's view.", first.id),
    memoryTime(20),
  ).collection;
  const publicView = knownDevelopment(state, "aqua")[0];
  assert.equal(publicView.title, undefined);
  assert.equal(publicView.status, undefined);
  assert.doesNotMatch(JSON.stringify(publicView), /secret-attic|arranged|refuse/u);
  const independent = learn(state, "Aqua separately said they were considering the orchard.", ref, {
    status: "considering",
  });
  forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["player"], undefined, second.id), memoryTime(30));
  assert.equal(
    knownDevelopment(state, "aqua")[0].status,
    "considering",
    "Independent disclosure survives another root's Forget.",
  );
  forgetVillageMemory(
    state,
    memoryRepair(state.memories, "forget", ["aqua"], undefined, independent.id),
    memoryTime(31),
  );
  assert.equal(
    knownDevelopment(state, "aqua")[0].status,
    "considering",
    "Forgetting a resident does not edit player views.",
  );
  const wish = learn(
    state,
    "Aqua shared a wish for a garden.",
    { kind: "wish", id: "garden", characterId: "aqua" },
    { title: "A quiet garden", status: "active" },
  );
  assert.equal(knownWishes(state, "aqua")[0].status, "active");
  forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["player"], undefined, wish.id), memoryTime(40));
  assert.deepEqual(knownWishes(state, "aqua"), []);
});
await runCase("memories-domains/authority", () => {
  const state = world(),
    ref = { kind: "pursuit" as const, id: "move", characterId: "aqua" };
  const prior = learn(state, "Aqua discussed moving to the orchard.", ref, undefined, ["aqua", "gidget", "player"]);
  forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["aqua"], undefined, prior.id), memoryTime(10));
  const fact = {
    id: "move-complete",
    at: memoryTime(11),
    recordedAt: memoryTime(25),
    text: "Aqua moved to the orchard.",
    subjects: ["aqua"],
    knowers: ["aqua", "gidget", "player"],
    domainRef: ref,
    event: true,
  };
  rememberDomainFact(state, fact);
  const saved = state.memories.records.at(-1)!;
  assert.deepEqual(Object.keys(saved.knowers), ["gidget", "player"]);
  assert.equal(saved.occurredAt, memoryTime(11));
  assert.equal(saved.recordedAt, memoryTime(25));
  assert.equal(saved.committedEffect?.committedAt, memoryTime(25));
  const count = state.memories.records.length;
  rememberDomainFact(state, fact);
  assert.equal(state.memories.records.length, count);
  assert.equal(projectMemories(state.memories, ["aqua"]).length, 0);
});
await runCase("memories-domains/goal-journal", () => {
  const state = world(),
    wish = coerceWish({ wish: "Experience swimming" }, "swim", memoryTime())!;
  state.villagers[0].agenda!.wishes = [wish];
  addWishFacts(
    state,
    "aqua",
    wish,
    [
      { kind: "goal", quote: "By swimming I mean feeling the water myself.", lineIds: ["goal"] },
      { kind: "condition", quote: "I must be able to stand.", lineIds: ["condition"] },
    ],
    "scene",
    "turn",
    memoryTime(1),
  );
  rememberWishEvidence(
    wishJournal(state, "aqua", "swim")!,
    [
      {
        id: "goal",
        speakerId: "aqua",
        name: "Aqua",
        content: "By swimming I mean feeling the water myself.",
        kind: "dialogue",
        at: memoryTime(1),
      },
    ],
    "scene",
    "turn",
  );
  const note = learn(
    state,
    "Aqua meant feeling the water, rather than watching.",
    { kind: "wish", id: "swim", characterId: "aqua" },
    undefined,
    ["aqua"],
  );
  forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["aqua"], undefined, note.id), memoryTime(10));
  const round = coerceVillageState(JSON.parse(JSON.stringify(state)));
  const journal = wishCheckKnowledge(round, "aqua", "swim");
  assert.equal(journal.conditionRevision, 2);
  assert.equal(journal.conditions[0].quote, "I must be able to stand.");
  assert.ok(journal.discoveries.some((row) => row.kind === "goal" && row.quote.includes("water myself")));
  assert.equal(journal.evidence[0].id, "goal");
  assert.deepEqual(knownWishes(round, "aqua"), [], "Owned goal proof cannot resurrect player disclosure.");
});
await runCase("memories-domains/completion", () => {
  const state = world(),
    wish = coerceWish({ wish: "Talk about the garden" }, "garden", memoryTime())!;
  const resident = state.villagers[0];
  resident.agenda!.wishes = [wish];
  rememberWishNeed(resident, wish);
  const fingerprint = wishFingerprint(wish);
  const input: any = {
    sceneId: "scene",
    submissionId: "first",
    seed: state.seed,
    proposal: { actorId: "aqua", wishId: wish.id, fingerprint, intent: "check", lineIds: ["speech"] },
    wish,
    at: memoryTime(2),
    context: {
      actorId: "aqua",
      card: { name: "Aqua" },
      evidence: [
        { id: "speech", speakerId: "player", name: "Player", content: "Let's discuss the garden.", at: memoryTime(2) },
      ],
      receipts: [],
    },
  };
  const verdict: any = {
    criteria: { kind: "conversation", goal: wish.wish, requiresPhysical: false },
    outcome: "fulfilled",
    evidenceIds: ["speech"],
    reason: "Conversation happened",
    memory: "",
    receiptIds: [],
  };
  applyPreparedWishVerdict(state, input, verdict, Date.parse(memoryTime(3)));
  assert.equal(state.exchangeReceipts[effectId("scene", "first", input.proposal)].wishOutcome, "fulfilled");
  assert.equal(resident.agenda!.wishes.length, 0);
  assert.equal(resident.wishLifecycle!.pendingOutcomes[0].wish.goalJournal!.evidence[0].id, "speech");
  resident.agenda!.wishes = [structuredClone(wish)];
  input.submissionId = "second";
  applyPreparedWishVerdict(state, input, verdict, Date.parse(memoryTime(3)));
  const rejected = state.exchangeReceipts[effectId("scene", "second", input.proposal)];
  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.wishOutcome, undefined);
  assert.match(rejected.reason, /already resolved/u);
  assert.equal(resident.agenda!.wishes.length, 1);
});
await runCase("memories-domains/lifecycle", () => {
  const state = world();
  reserveMemoryScene(state, "scene", memoryTime(1));
  const scene: any = {
    id: "scene",
    villageSeed: state.seed,
    status: "closed",
    submissions: [{ id: "turn", at: memoryTime(1) }],
  };
  releaseSceneMemories(state, scene);
  assert.ok(state.memoryScenes.scene, "Unsettled saved work retains its snapshot.");
  scene.submissions[0].progressProcessedAt = memoryTime(2);
  releaseSceneMemories(state, scene);
  assert.equal(state.memoryScenes.scene, undefined);
  assert.equal(state.memories.records.length, 0);
});

await runCase("memories-domains/wish-fallback", () => {
  const state = world(),
    goal = coerceWish({ wish: "Discuss the quiet garden" }, "garden", memoryTime())!;
  const resident = state.villagers[0];
  resident.agenda!.wishes = [goal];
  rememberWishNeed(resident, goal);
  const disclosure = learn(
    state,
    "Aqua shared the garden Wish.",
    { kind: "wish", id: "garden", characterId: "aqua" },
    { title: "A quiet garden", status: "active" },
  );
  const input: any = {
    sceneId: "private-completion",
    submissionId: "turn",
    seed: state.seed,
    proposal: {
      actorId: "aqua",
      wishId: goal.id,
      fingerprint: wishFingerprint(goal),
      intent: "check",
      lineIds: ["private-speech"],
    },
    wish: goal,
    at: memoryTime(2),
    context: {
      actorId: "aqua",
      card: { name: "Aqua" },
      playerEvidenceIds: [],
      evidence: [
        {
          id: "private-speech",
          speakerId: "aqua",
          name: "Aqua",
          content: "The garden discussion settled it.",
          at: memoryTime(2),
        },
      ],
      receipts: [],
    },
  };
  applyPreparedWishVerdict(
    state,
    input,
    {
      criteria: { kind: "conversation", goal: goal.wish, requiresPhysical: false },
      outcome: "fulfilled",
      evidenceIds: ["private-speech"],
      reason: "Goal completed privately",
      memory: "",
      receiptIds: [],
    },
    Date.parse(memoryTime(3)),
  );
  const receipt = state.exchangeReceipts[effectId(input.sceneId, input.submissionId, input.proposal)];
  assert.equal(receipt.notice, undefined, "Knowing a Wish does not reveal its private completion");
  assert.deepEqual(receipt.wishAudience, ["aqua"]);
  fillCommittedWishMemories(state, input.sceneId, input.submissionId, memoryTime(4));
  assert.equal(state.memories.records.length, 1, "Prepared/uncommitted receipt cannot create an event memory");
  receipt.committedAt = memoryTime(3);
  // Native System may have recorded the player's actual event before owner fallback.
  const shared = structuredClone(state);
  const native = memoryProposal(shared.memories, {
    hour: 2,
    text: "Wish fulfilled: " + goal.wish,
    audience: ["player"],
    patch: { kind: "experience", domainRef: { kind: "wish", id: "garden", characterId: "aqua" }, effectId: receipt.id },
  });
  native.proposal.learners.player.basis = "validated-event";
  delete native.proposal.learners.player.attributedTo;
  native.context.committedEffects = [
    {
      status: "committed",
      id: receipt.id,
      source: native.context.source,
      domainRef: native.proposal.domainRef!,
      occurredAt: memoryTime(2),
      committedAt: memoryTime(3),
      audience: ["aqua", "player"],
    },
  ];
  applyVillageMemory(shared, native.proposal, native.context);
  const original = structuredClone(shared.memories.records.at(-1)!);
  const privateExtra = structuredClone(shared);
  privateExtra.memories.records.at(-1)!.text += " Gidget privately told the player about a hidden gift.";
  fillCommittedWishMemories(privateExtra, input.sceneId, input.submissionId, memoryTime(5));
  assert.equal(
    projectMemories(privateExtra.memories, ["aqua"]).length,
    1,
    "A completion receipt cannot teach another learner richer private event prose",
  );
  fillCommittedWishMemories(shared, input.sceneId, input.submissionId, memoryTime(5));
  const merged = shared.memories.records.at(-1)!;
  assert.equal(shared.memories.records.length, 2);
  assert.deepEqual(Object.keys(merged.knowers).sort(), ["aqua", "player"]);
  assert.equal(merged.text, original.text);
  assert.deepEqual(merged.knowers.player, original.knowers.player);
  assert.deepEqual(merged.origin, original.origin);
  assert.equal(merged.knowers.aqua.basis, "validated-event");
  const restored = coerceVillageState(JSON.parse(JSON.stringify(shared)));
  invalidateWishCompletion(restored, receipt.id, memoryTime(6));
  fillCommittedWishMemories(restored, input.sceneId, input.submissionId, memoryTime(7));
  assert.equal(restored.exchangeReceipts[receipt.id].wishOutcome, "corrected");
  assert.equal(
    projectMemories(restored.memories, ["aqua"]).length,
    1,
    "Only the event root is suppressed; original Wish disclosure survives",
  );
  assert.equal(projectMemories(restored.memories, ["player"]).length, 1);
  const beforeFallback = structuredClone(state);
  invalidateWishCompletion(beforeFallback, receipt.id, memoryTime(4));
  fillCommittedWishMemories(beforeFallback, input.sceneId, input.submissionId, memoryTime(5));
  assert.equal(
    beforeFallback.memories.records.length,
    1,
    "A withdrawn completion cannot create delayed event learning",
  );
  fillCommittedWishMemories(state, input.sceneId, input.submissionId, memoryTime(5));
  assert.equal(state.memories.records.length, 2);
  const outcome = state.memories.records.at(-1)!;
  assert.deepEqual(Object.keys(outcome.knowers), ["aqua"]);
  assert.equal(outcome.committedEffect!.id, receipt.id);
  assert.equal(outcome.recordedAt, memoryTime(5));
  assert.equal(outcome.occurredAt, memoryTime(2));
  assert.equal(knownWishes(state, "aqua")[0].status, "active");
  fillCommittedWishMemories(state, input.sceneId, input.submissionId, memoryTime(6));
  assert.equal(
    state.memories.records.length,
    2,
    "Native or fallback event learning is deduplicated by actual effect/knower",
  );
  forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["aqua"], undefined, outcome.id), memoryTime(7));
  fillCommittedWishMemories(state, input.sceneId, input.submissionId, memoryTime(8));
  assert.equal(state.memories.records.length, 2, "Forget cannot resurrect through fallback replay");
  assert.equal(knownWishes(state, "aqua")[0].text, "A quiet garden");
  assert.ok(disclosure);
});

await runCase("memories-domains/correction-race", async () => {
  let state = world();
  const resident = state.villagers[0],
    wish = coerceWish({ wish: "Discuss the garden" }, "garden", memoryTime())!;
  resident.agenda!.wishes = [wish];
  rememberWishNeed(resident, wish);
  function complete(turn: string, hour: number) {
    const live = state.villagers[0].agenda!.wishes[0];
    const input: any = {
      sceneId: "correction-scene",
      submissionId: turn,
      seed: state.seed,
      proposal: {
        actorId: "aqua",
        wishId: live.id,
        fingerprint: wishFingerprint(live),
        intent: "check",
        lineIds: [turn],
      },
      wish: live,
      at: memoryTime(hour),
      context: {
        actorId: "aqua",
        card: { name: "Aqua" },
        playerEvidenceIds: [],
        receipts: [],
        evidence: [
          { id: turn, speakerId: "aqua", name: "Aqua", content: "We discussed the garden.", at: memoryTime(hour) },
        ],
      },
    };
    applyPreparedWishVerdict(
      state,
      input,
      {
        criteria: { kind: "conversation", goal: live.wish, requiresPhysical: false },
        outcome: "fulfilled",
        evidenceIds: [turn],
        reason: "Actual discussion",
        memory: "",
        receiptIds: [],
      },
      Date.parse(memoryTime(hour + 1)),
    );
    const receipt = state.exchangeReceipts[effectId(input.sceneId, turn, input.proposal)];
    assert.equal(receipt.wishOutcome, "fulfilled");
    receipt.committedAt = memoryTime(hour + 1);
    fillCommittedWishMemories(state, input.sceneId, turn, memoryTime(hour + 2));
    return receipt.id;
  }
  const firstId = complete("first", 2);
  const outcome = structuredClone(state.villagers[0].wishLifecycle!.pendingOutcomes[0]);
  assert.equal(outcome.memoryId, firstId);
  let entered!: () => void, release!: () => void;
  const blocked = new Promise<void>((done) => (entered = done)),
    gate = new Promise<void>((done) => (release = done));
  let calls = 0;
  const service = createWishLifecycle({
    readWishOutcome: async () => structuredClone(outcome),
    previousFulfilledNeed: async () => undefined,
    mutateVillageState: async (update: any) => {
      if (++calls === 1) {
        entered();
        await gate;
      }
      const draft = structuredClone(state);
      update(draft);
      state = draft;
      return state;
    },
    flushWishOutcomes: async () => {
      state.villagers[0].wishLifecycle!.pendingOutcomes = [];
    },
  } as any);
  const delayed = service.correctResidentWish("aqua", "garden", new Date(memoryTime(7)));
  await blocked;
  await service.correctResidentWish("aqua", "garden", new Date(memoryTime(6)));
  assert.equal(state.exchangeReceipts[firstId].wishOutcome, "corrected");
  assert.equal(state.villagers[0].agenda!.wishes[0].addedAt, memoryTime(6));
  const secondId = complete("genuine-later", 8);
  assert.equal(
    projectMemories(state.memories, ["aqua"]).length,
    0,
    "Protected roots defer optional deterministic learning",
  );
  const actual = memoryProposal(state.memories, {
    hour: 8,
    sourceId: "genuine-new",
    text: "The later garden discussion fulfilled the restored Wish.",
    audience: ["aqua"],
    patch: { kind: "experience", effectId: secondId, domainRef: { kind: "wish", id: "garden", characterId: "aqua" } },
  });
  actual.proposal.learners.aqua.basis = "validated-event";
  delete actual.proposal.learners.aqua.attributedTo;
  actual.context.committedEffects = [
    {
      status: "committed",
      id: secondId,
      source: actual.context.source,
      domainRef: actual.proposal.domainRef!,
      occurredAt: memoryTime(8),
      committedAt: memoryTime(9),
      audience: ["aqua"],
    },
  ];
  applyVillageMemory(state, actual.proposal, actual.context);
  state = coerceVillageState(JSON.parse(JSON.stringify(state)));
  release();
  await delayed;
  assert.equal(state.villagers[0].agenda!.wishes.length, 0, "Stale correction cannot restore a Wish fulfilled again");
  assert.equal(state.villagers[0].wishLifecycle!.needs[0].state, "fulfilled");
  assert.equal(state.exchangeReceipts[secondId].wishOutcome, "fulfilled");
  assert.equal(projectMemories(state.memories, ["aqua"]).length, 1, "Only the later genuine event is eligible");
});
