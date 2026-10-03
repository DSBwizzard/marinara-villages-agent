import assert from "node:assert/strict";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import { defaultVillageState } from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import {
  interpretWishBatch,
  wishFingerprint,
} from "../packages/villages/src/engine/packages/server/src/services/villages/wish-interpretation.js";
import { localWishRequirements } from "../packages/villages/src/engine/packages/server/src/services/villages/wish-admission.js";
import { processWishExchange } from "../packages/villages/src/engine/packages/server/src/services/villages/wish-progress.js";
import { settleBackgroundWork } from "../packages/villages/src/engine/packages/server/src/services/villages/background-work.js";
import { fixtureInterpretationChecks } from "./fixtures/villages-interpretation-payload.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/engine/packages/server/src/services/villages/agenda-plan.js";

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
    truncated = false;
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
    happenings: [],
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
      documents: {
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
      },
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
            assert.ok(options.maxTokens <= 1024);
            wireCharacters += messages[1].content.length;
            assert.ok(messages[1].content.length <= 12000);
            const checks = fixtureInterpretationChecks(messages[1].content);
            const content = JSON.stringify({
              results: malformed
                ? []
                : checks.map((check) => ({
                    id: check.id,
                    outcome,
                    evidenceIds: check.evidence.filter((line: any) => line.current).map((line: any) => line.id),
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
    malformed = true;
    await processWishExchange(scene, "turn");
    await settleBackgroundWork();
    const afterMalformed = calls;
    const status = await processWishExchange(scene, "turn");
    await settleBackgroundWork();
    assert.equal(status.status, "failed");
    assert.equal(calls, afterMalformed, "invalid output cannot auto-repair or bill again");
    console.log(
      "Wish batch: three residents/one request, no preparation, mixed progress, receipt guards, idioms and invalid-output recovery passed",
    );
  } finally {
    release();
  }
}
void main();
