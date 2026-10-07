import assert from "node:assert/strict";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { readVillageState, mutateVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { coerceWish } from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import {
  selectWishSize,
  wishExpired,
  wishGenerationDirection,
} from "../packages/villages/src/server/domain/rules/wish-definition.js";
import {
  discloseWish,
  knownWish,
  addWishFacts,
  bindWishFacts,
  rememberWishEvidence,
  wishCheckKnowledge,
} from "../packages/villages/src/server/domain/rules/wish-journal.js";
import {
  bindWishProposals,
  processWishExchange,
  applyPreparedWishVerdict,
} from "../packages/villages/src/server/features/residents/wishes/wish-progress.js";
import {
  wishFingerprint,
  interpretWishBatch,
} from "../packages/villages/src/server/features/residents/wishes/wish-interpretation.js";
import { localWishRequirements } from "../packages/villages/src/server/domain/rules/wish-admission.js";
import {
  retireResidentWish,
  expireResidentWishes,
} from "../packages/villages/src/server/features/residents/wishes/wish-lifecycle.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { projectRelationshipProfiles } from "../packages/villages/src/server/domain/rules/relationship-knowledge.js";
import { readRelationshipsView } from "../packages/villages/src/server/features/residents/relationships.js";

import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { fixtureInterpretationChecks } from "./fixtures/villages-interpretation-payload.js";

async function main() {
  const at = new Date().toISOString();
  const state = defaultVillageState();
  state.seed = "journal-test";
  state.foundedAt = state.setupAt = at;
  state.name = "Village";
  const swim = coerceWish({ wish: "Experience swimming", size: "larger", intensity: 3 }, "swim", at)!;
  state.villagers = [
    {
      characterId: "f",
      cardSnapshot: { id: "f", name: "Feddy", revision: 1, capturedAt: at, sourceStatus: "available" },
      completedWishes: [],
      agenda: {
        wishes: [swim],
        day: [],
        generatedAt: at,
        routineSummary: "An ordinary day",
        personalizationPending: false,
        source: "village",
      },
    },
  ] as any;
  const line = (id: string, content: string, hidden = false): any => ({
    id,
    role: "assistant",
    speakerId: "f",
    name: "Feddy",
    content,
    kind: "dialogue",
    at,
    heardBy: ["f"],
    contactHidden: hidden,
  });
  const player = {
    id: "player",
    role: "user",
    speakerId: "",
    name: "Player",
    content: "Tell me about swimming.",
    at,
    heardBy: ["f"],
  };
  const lines = [
    player,
    line("wish", "I want to experience swimming."),
    line("concern", "Deep water makes me nervous."),
    line("lead", "I like the idea of taking lessons."),
    line("condition", "I only want to try where I can stand."),
    line("hidden", "I require a secret golden pool.", true),
  ];
  const scene: any = {
    version: 1,
    id: "first",
    villageSeed: state.seed,
    placeId: "pond",
    placeName: "Pond",
    status: "active",
    activeIds: ["f"],
    participants: [{ characterId: "f", name: "Feddy" }],
    lines,
    submissions: [],
  };
  const records = new Map<string, any>([
    ["villages-village", { id: "villages-village", kind: "village", revision: 1, data: state }],
  ]);
  let calls = 0;
  const release = configureVillagesRuntime({
    persistence: {
      documents: {
        async getById(_p: string, id: string) {
          return structuredClone(records.get(id) ?? null);
        },
        async list(_p: string, kind: string) {
          return structuredClone([...records.values()].filter((row) => row.kind === kind));
        },
        async create(input: any) {
          const row = { ...structuredClone(input), revision: 1 };
          records.set(input.id, row);
          return row;
        },
        async update(input: any) {
          const prior = records.get(input.id);
          if (!prior || prior.revision !== input.expectedRevision) return null;
          const row = { ...prior, ...structuredClone(input), revision: prior.revision + 1 };
          records.set(input.id, row);
          return row;
        },
        async remove(_p: string, id: string) {
          return records.delete(id);
        },
      },
    },
    getAgentConfig: async () => null,
    logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
    languageModels: {
      async resolveForRequest() {
        return {
          connectionId: "fixture",
          model: "fixture",
          maxOutputTokens: 4096,
          fitContext(messages: any, options: any) {
            return { messages, ...options };
          },
          async chatComplete(messages: any[]) {
            calls++;
            assert.ok(!messages[0].content.startsWith("Prepare"));
            const checks = fixtureInterpretationChecks(messages[1].content);
            assert.ok(messages[1].content.length <= 12000);
            return {
              finishReason: "stop",
              content: JSON.stringify({
                results: checks.map((check: any) => {
                  assert.match(messages[0].content, /different route/);
                  const receipts = check.evidence.filter((entry: any) => entry.kind === "receipt");
                  const interaction = check.evidence.find(
                    (entry: any) => entry.speakerId === "player" && entry.kind !== "claim" && entry.kind !== "receipt",
                  );
                  const fulfilled = check.facts.wishText.includes("tune") ? !!interaction : receipts.length > 0;
                  if (check.facts.wishText === "Experience swimming") {
                    assert.ok(
                      check.facts.discoveries.some((fact: any) => fact.quote.includes("lessons")),
                      "The old approach is remembered across Scenes",
                    );
                    assert.equal(check.facts.conditions.length, 1);
                    assert.ok(
                      check.evidence.some((entry: any) => entry.content.includes("nervous")),
                      "Witnessed excerpts survive Scene boundaries",
                    );
                  }
                  return {
                    id: check.id,
                    outcome: fulfilled ? "fulfilled" : "none",
                    reason: "The witnessed result satisfies the desired outcome through an alternative route",
                    evidenceIds: fulfilled ? (receipts.length ? [receipts[0].id] : [interaction.id]) : [],
                    ...(fulfilled ? { details: { proofKind: receipts.length ? "physical" : "conversation" } } : {}),
                  };
                }),
              }),
            };
          },
        };
      },
    },
  } as any);
  try {
    const distribution = { everyday: 0, modest: 0, larger: 0 };
    for (let index = 0; index < 10_000; index++) distribution[selectWishSize("attempt-" + index)]++;
    assert.ok(Math.abs(distribution.everyday / 10000 - 0.65) < 0.02);
    assert.ok(Math.abs(distribution.modest / 10000 - 0.25) < 0.02);
    assert.ok(Math.abs(distribution.larger / 10000 - 0.1) < 0.02);
    assert.equal(selectWishSize("retry"), selectWishSize("retry"));
    assert.match(wishGenerationDirection("everyday"), /neutral description/);
    const journalTurn = async (id: string, raw: any[]) => {
      const live = await readVillageState();
      const bound = bindWishProposals(
        raw,
        live,
        lines,
        "player",
        lines.slice(1).map((entry) => entry.id),
      );
      assert.equal(bound.error, "");
      const turn: any = {
        id,
        mode: "chat",
        at,
        message: player.content,
        activeIdsAtTurn: ["f"],
        replyLineIds: lines.slice(1).map((entry) => entry.id),
        wishProposals: bound.proposals,
        processing: createExchangeProcessing({
          seed: state.seed,
          sceneId: scene.id,
          submissionId: id,
          order: scene.submissions.length,
          lineIds: lines.map((entry) => entry.id),
          actionReceiptIds: [],
        }),
      };
      scene.submissions.push(turn);
      records.set("villages-venue-visit-first", {
        id: "villages-venue-visit-first",
        kind: "venue-visit",
        revision: 1,
        data: scene,
      });
      await processWishExchange(scene, id);
      return turn;
    };
    await journalTurn("reveal", [{ actorId: "f", wishId: "swim", intent: "reveal", evidence: [0] }]);
    await journalTurn("learn", [
      {
        actorId: "f",
        wishId: "swim",
        intent: "journal",
        evidence: [1, 2],
        facts: [
          { kind: "concern", quote: lines[2].content, evidence: [1] },
          { kind: "possibility", quote: lines[3].content, evidence: [2] },
        ],
      },
    ]);
    let live = await readVillageState();
    assert.equal(calls, 0, "Disclosure, discoveries and reads make no LLM request");
    assert.equal(
      live.villagers[0].agenda!.wishes[0].conditionRevision,
      0,
      "A concern and an approach are not requirements",
    );
    assert.equal(knownWish(live, "f", "swim")!.facts!.length, 2);
    await processWishExchange(scene, "learn");
    live = await readVillageState();
    assert.equal(knownWish(live, "f", "swim")!.facts!.length, 2, "Replaying metadata cannot duplicate discoveries");
    assert.equal(calls, 0);
    const duplicateChecks = bindWishProposals(
      [
        { actorId: "f", wishId: "swim", intent: "progress", evidence: ["player"] },
        { actorId: "f", wishId: "swim", intent: "check", evidence: [0] },
      ],
      live,
      lines,
      "player",
      lines.slice(1).map((entry) => entry.id),
    );
    assert.equal(duplicateChecks.proposals.length, 1, "One wish cannot occupy two fulfillment batch rows");
    assert.equal(
      bindWishFacts([{ kind: "condition", quote: lines[2].content, evidence: ["concern"] }], "f", lines, String).length,
      0,
      "Nervousness cannot be mislabeled an essential condition",
    );
    assert.equal(
      bindWishFacts([{ kind: "condition", quote: lines[5].content, evidence: ["hidden"] }], "f", lines, String).length,
      0,
      "Private speech cannot leak into the journal",
    );
    assert.equal(
      bindWishProposals(
        [
          {
            actorId: "f",
            wishId: "swim",
            intent: "journal",
            evidence: [1, 4],
            facts: [{ kind: "concern", quote: lines[2].content, evidence: [1] }],
          },
        ],
        live,
        lines,
        "player",
        lines.slice(1).map((entry) => entry.id),
      ).proposals.length,
      0,
      "A visible discovery cannot smuggle an unrelated hidden excerpt into saved evidence",
    );
    assert.equal(
      bindWishFacts([{ kind: "result", quote: "He swam", evidence: ["wish"] }], "f", lines, String).length,
      0,
      "Narration metadata cannot manufacture physical results",
    );
    const oldProposal = {
      actorId: "f",
      wishId: swim.id,
      fingerprint: wishFingerprint(swim),
      conditionRevision: 0,
      intent: "check" as const,
      lineIds: ["player"],
    };
    await journalTurn("condition", [
      {
        actorId: "f",
        wishId: "swim",
        intent: "journal",
        evidence: [3],
        facts: [{ kind: "condition", quote: lines[4].content, evidence: [3] }],
      },
    ]);
    live = await readVillageState();
    const current = live.villagers[0].agenda!.wishes[0];
    assert.equal(current.conditionRevision, 1);
    assert.equal(
      wishFingerprint(current),
      oldProposal.fingerprint,
      "Discoveries do not change the original goal identity",
    );
    applyPreparedWishVerdict(
      live,
      {
        sceneId: "stale",
        submissionId: "old",
        seed: live.seed,
        proposal: oldProposal,
        wish: swim,
        at,
        context: { evidence: [{ ...player, current: true }] },
      } as any,
      {
        criteria: { kind: "complex", goal: swim.wish, requiresPhysical: false, conditionRevision: 0 },
        outcome: "fulfilled",
        evidenceIds: ["player"],
        reason: "outdated condition snapshot",
        memory: "",
        receiptIds: [],
      },
    );
    assert.equal(live.villagers[0].agenda!.wishes.length, 1, "Late judgments cannot apply against outdated conditions");
    const beforeCondition = new Date(Date.parse(at) - 1).toISOString();
    const priorKnowledge = wishCheckKnowledge(live, "f", "swim", beforeCondition);
    assert.equal(priorKnowledge.conditionRevision, 0, "Later conditions do not invalidate an earlier action's check");
    assert.deepEqual(priorKnowledge.conditions, []);
    assert.deepEqual(priorKnowledge.evidence, [], "Pending checks cannot see future discoveries");
    const priorState = structuredClone(live);
    const priorResult = { ...player, at, current: true };
    applyPreparedWishVerdict(
      priorState,
      {
        sceneId: "earlier",
        submissionId: "pending",
        seed: priorState.seed,
        proposal: { ...oldProposal, conditionAt: beforeCondition },
        wish: swim,
        at,
        context: { evidence: [priorResult] },
      } as any,
      {
        criteria: { kind: "complex", goal: swim.wish, requiresPhysical: false, conditionRevision: 0 },
        outcome: "none",
        evidenceIds: ["player"],
        reason: "Earlier action retains its conditions",
        memory: "",
        receiptIds: [],
      },
    );
    assert.ok(
      Object.values(priorState.exchangeReceipts).some((receipt) => receipt.submissionId === "pending"),
      "A later condition does not discard the result of an already pending action",
    );
    const secondAt = new Date(Date.parse(at) + 60_000).toISOString();
    const lesson = {
      id: "started-lessons",
      venueId: "pond",
      venueName: "Pond",
      at,
      text: "Feddy started a dry introductory swimming lesson with Player; he has not yet swum.",
      actionReceipt: {
        happened: true,
        submissionId: "lesson",
        witnessIds: ["f"],
        narration: "They practiced beside the water.",
      },
    };
    live.venueEvents.push(lesson as any);
    applyPreparedWishVerdict(
      live,
      {
        sceneId: "first",
        submissionId: "lesson",
        seed: live.seed,
        proposal: { ...oldProposal, intent: "progress", conditionRevision: 1 },
        wish: current,
        at,
        context: { evidence: [], card: { name: "Feddy" } },
      } as any,
      {
        criteria: { kind: "complex", goal: swim.wish, requiresPhysical: true, conditionRevision: 1 },
        outcome: "progress",
        evidenceIds: ["receipt:" + lesson.id],
        receiptIds: [lesson.id],
        reason: "A witnessed lesson started, without establishing swimming",
        memory: "",
      },
    );
    assert.equal(live.villagers[0].agenda!.wishes.length, 1, "Starting lessons does not fulfill swimming");
    assert.ok(
      knownWish(live, "f", "swim")!.facts!.some((fact) => fact.lineIds.includes("receipt:" + lesson.id)),
      "Abandoned preparations remain sourced history",
    );
    assert.equal(
      live.progressTasks.find((task) => task.definition.owner.kind === "wish")!.definition.phases.length,
      1,
      "Starting an approach creates no additional required phases",
    );
    const result = {
      id: "actual-swim",
      venueId: "beach",
      venueName: "Beach",
      text: "Feddy swam with Player in shallow water where he could stand, without taking lessons.",
      at: secondAt,
      actionReceipt: {
        happened: true,
        submissionId: "swam",
        witnessIds: ["f"],
        narration: "They swam in shallow water.",
      },
    };
    live.venueEvents.push(result as any);
    const knowledge = wishCheckKnowledge(live, "f", "swim");
    const context: any = {
      actorId: "f",
      village: "Village",
      setting: "",
      card: { name: "Feddy" },
      moment: {},
      playerName: "Player",
      playerDescription: "",
      claim: "Check swimming",
      wishes: [current],
      evidence: [
        ...knowledge.evidence,
        {
          id: "new-player",
          speakerId: "player",
          name: "Player",
          content: "Let's try the shallow beach instead of lessons.",
          at: secondAt,
          current: true,
        },
      ],
      receipts: [result],
      currentReceiptIds: [result.id],
      knowledge,
      transcript: [],
      happenings: [],
      memory: [],
    };
    const batch = await interpretWishBatch([context], "second", "swam");
    assert.equal(calls, 1, "A changed approach uses one ordinary fulfillment check with no preparation call");
    assert.equal(batch.results[0].outcome, "fulfilled");
    const input: any = {
      sceneId: "second",
      submissionId: "swam",
      seed: live.seed,
      proposal: { ...oldProposal, conditionRevision: 1, lineIds: ["new-player"] },
      wish: current,
      at: secondAt,
      context,
    };
    const verdict: any = {
      criteria: batch.checks[0].facts.criteria,
      outcome: "fulfilled",
      evidenceIds: batch.results[0].evidenceIds,
      reason: batch.results[0].reason,
      memory: "",
      receiptIds: [result.id],
    };
    applyPreparedWishVerdict(live, input, verdict);
    assert.equal(live.villagers[0].agenda!.wishes.length, 0);
    assert.equal(knownWish(live, "f", "swim")!.status, "fulfilled");
    assert.ok(knownWish(live, "f", "swim")!.facts!.some((fact) => fact.kind === "result"));
    applyPreparedWishVerdict(live, input, verdict);
    assert.equal(live.chronicle.length, 1, "Fulfillment replay is idempotent");
    // Simple tangible and conversational outcomes use the same bounded batch.
    const chocolate = coerceWish({ wish: "Have a chocolate bar", size: "everyday" }, "chocolate", at)!;
    const tune = coerceWish({ wish: "Identify the tune stuck in my head", size: "everyday" }, "tune", at)!;
    const rock = coerceWish({ wish: "Have the rock in my yard moved away", size: "everyday" }, "rock", at)!;
    assert.equal(localWishRequirements(chocolate).physicalOnly, true);
    assert.equal(localWishRequirements(rock).physicalOnly, true);
    assert.equal(localWishRequirements(tune).criteria.requiresPhysical, false);
    const contexts = [chocolate, tune, rock].map((wish, index) => ({
      ...context,
      knowledge: undefined,
      wishes: [wish],
      evidence: [
        {
          id: "answer",
          speakerId: "player",
          name: "Player",
          content: "That tune is Greensleeves.",
          at: secondAt,
          current: true,
        },
      ],
      currentReceiptIds: index === 1 ? [] : ["simple-" + index],
      receipts:
        index === 1
          ? []
          : [
              {
                ...result,
                id: "simple-" + index,
                text: index === 0 ? "Player gave Feddy a chocolate bar." : "Player moved the rock out of the yard.",
              },
            ],
    }));
    const simpleBatch = await interpretWishBatch(contexts, "simple", "simple-results");
    assert.deepEqual(
      simpleBatch.results.map((row) => row.outcome),
      ["fulfilled", "fulfilled", "fulfilled"],
    );
    assert.equal(calls, 2, "Three simple outcomes share one check call");
    // Corrected information retains its sources and changes only binding-condition revisions.
    const correctionState = structuredClone(state);
    const correctionWish = correctionState.villagers[0].agenda!.wishes[0];
    const entry = discloseWish(correctionState, "f", correctionWish, at, ["wish"]);
    addWishFacts(
      correctionState,
      "f",
      correctionWish,
      [{ kind: "concern", quote: "Deep water makes me nervous.", lineIds: ["concern"] }],
      "first",
      "learn",
      at,
    );
    const fact = entry.facts![0];
    assert.equal(
      addWishFacts(
        correctionState,
        "f",
        correctionWish,
        [
          {
            kind: "preference",
            quote: "Actually, deep water no longer worries me.",
            lineIds: ["correct"],
            supersedes: fact.id,
          },
        ],
        "third",
        "correct",
        secondAt,
      ),
      1,
    );
    assert.equal(fact.supersededBy, entry.facts![1].id);
    assert.equal(correctionWish.conditionRevision, 0);
    rememberWishEvidence(
      entry,
      [
        {
          id: "correct",
          speakerId: "f",
          name: "Feddy",
          kind: "dialogue",
          content: "Actually, deep water no longer worries me.",
          at: secondAt,
        },
      ],
      "third",
      "correct",
    );
    assert.equal(
      coerceVillageState(correctionState).wishKnowledge.f[0].facts!.length,
      2,
      "Corrections and evidence survive restart",
    );
    // Size-specific expiry and discovered retention.
    for (const size of ["everyday", "modest", "larger"] as const) {
      const wish = coerceWish({ wish: "A clear outcome", size }, "expiry-" + size, at)!;
      const days = (Date.parse(wish.expiresAt) - Date.parse(at)) / 86_400_000;
      assert.ok(
        size === "everyday"
          ? days >= 1 && days <= 7
          : size === "modest"
            ? days >= 7 && days <= 14
            : days >= 14 && days <= 28,
      );
      assert.equal(wishExpired(wish, Date.parse(at) + 60 * 86_400_000), true);
      wish.learnedAt = at;
      assert.equal(wishExpired(wish, Date.parse(at) + 60 * 86_400_000), size === "everyday");
    }
    const retiredState = coerceVillageState(correctionState);
    records.get("villages-village").data = retiredState;
    await readRelationshipsView();
    await retireResidentWish("f", "swim");
    const retired = await readVillageState();
    assert.equal(retired.villagers[0].agenda!.wishes.length, 0);
    assert.equal(knownWish(retired, "f", "swim")!.status, "retired");
    assert.equal(retired.chronicle.length, 0, "Retirement awards no favor memory");
    assert.equal(calls, 2, "Profile reads and retirement add no model calls");
    const hiddenState = defaultRelationshipState(state.seed);
    hiddenState.knowledge.f = {
      wishes: ["Private secret"],
      at,
      closeAt: at,
      routine: [],
      interests: "",
      ties: [],
    } as any;
    assert.deepEqual(
      projectRelationshipProfiles(hiddenState, state)[0].wishes,
      [],
      "Stored friendship snapshots cannot expose undisclosed wishes",
    );
    const legacy: any = structuredClone(correctionState);
    delete legacy.wishSystemVersion;
    legacy.exchangeReceipts = {
      old: { domain: "wishes", id: "old" },
      physical: { domain: "physical", physicalOutcome: result },
    };
    legacy.venueEvents = [result];
    legacy.chronicle = [
      {
        id: "memory",
        text: "A remembered friendship",
        kind: "favour",
        actors: [{ id: "f", name: "Feddy" }],
        weight: 1,
      },
    ];
    const reset = coerceVillageState(legacy);
    assert.equal(reset.wishSystemVersion, 3);
    assert.deepEqual(reset.wishKnowledge, {});
    assert.equal(reset.villagers[0].agenda!.wishes.length, 0);
    assert.equal(reset.villagers[0].wishLifecycle, undefined);
    assert.ok(reset.exchangeReceipts.physical);
    assert.equal(reset.venueEvents.length, 1);
    assert.equal(reset.chronicle.length, 1);
    discloseWish(reset, "f", chocolate, at, ["new"]);
    reset.villagers[0].agenda!.wishes.push(chocolate);
    assert.equal(
      coerceVillageState(reset).villagers[0].agenda!.wishes.length,
      1,
      "The reset does not repeat after restart",
    );
    records.get("villages-village").data = reset;
    await mutateVillageState(() => {});
    assert.equal((await readVillageState()).villagers[0].agenda!.wishes.length, 1);
    const expiryResident = structuredClone(state.villagers[0]);
    expiryResident.agenda!.wishes = [coerceWish({ wish: "An undertaking", size: "modest" }, "retained", at)!];
    expiryResident.agenda!.wishes[0].learnedAt = at;
    expireResidentWishes(expiryResident, new Date(Date.parse(at) + 100 * 86_400_000));
    assert.equal(expiryResident.agenda!.wishes.length, 1);
    console.log(
      "Wish journal: free discoveries, route changes, cross-Scene evidence, conditions, physical receipts, corrections, privacy, lifetime, retirement, and one-time reset passed. Mocked checks do not establish live model accuracy.",
    );
  } finally {
    release();
  }
}
void main();
