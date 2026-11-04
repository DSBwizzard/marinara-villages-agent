// Test cases: memories-domains/disclosures, memories-domains/authority
import assert from "node:assert/strict";
import { rememberDomainFact } from "../packages/villages/src/server/domain/rules/domain-memories.js";
import { applyMemoryRepair } from "../packages/villages/src/server/domain/rules/memory-application.js";
import { projectMemories } from "../packages/villages/src/server/domain/rules/memory-views.js";
import {
  knownSocialWishes,
  publishWishDisclosure,
} from "../packages/villages/src/server/domain/rules/social-wishes.js";
import {
  applyVillageMemory,
  forgetVillageMemory,
} from "../packages/villages/src/server/domain/rules/village-memories.js";
import { runCase } from "../scripts/test-cases.mjs";
import { memoryProposal, memoryRepair, memoryTime } from "./helpers/memories-fixture.js";
import { fixtureWish, wishWorld } from "./helpers/social-wishes-fixture.js";
await runCase("memories-domains/disclosures", () => {
  const state = wishWorld();
  state.villagers[0]!.wishes = [fixtureWish({ wish: "Share a private concern", reason: "PRIVATE REASON" })];
  const first = {
    id: "heard",
    actorId: "a",
    wishId: "company",
    title: "I'd like to talk.",
    text: "I'd like to talk.",
    status: "open" as const,
    at: memoryTime(),
    sourceId: "source",
    lineIds: ["line"],
  };
  publishWishDisclosure(state, first, memoryTime(1));
  assert.equal(knownSocialWishes(state, "a")[0]!.text, first.title);
  assert.doesNotMatch(JSON.stringify(knownSocialWishes(state, "a")), /PRIVATE|concern/);
  const root = state.memories.records.find((r) => r.knowers.player)!;
  state.memories = applyMemoryRepair(
    state.memories,
    memoryRepair(state.memories, "repair", ["player"], "Ada asked whether there was time to talk.", root.id),
    memoryTime(2),
  ).collection;
  const repaired = knownSocialWishes(state, "a")[0]!;
  assert.equal(repaired.status, undefined, "Corrected memory cannot recover private live status");
  assert.equal(repaired.text, "Ada asked whether there was time to talk.");

  forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["player"], undefined, root.id), memoryTime(4));
  const independent = wishWorld();
  publishWishDisclosure(independent, first, memoryTime(1));
  publishWishDisclosure(independent, { ...first, id: "independent", at: memoryTime(3) }, memoryTime(3));
  forgetVillageMemory(
    independent,
    memoryRepair(independent.memories, "forget", ["player"], undefined, independent.memories.records[0].id),
    memoryTime(4),
  );
  assert.equal(
    knownSocialWishes(independent, "a")[0]!.status,
    "open",
    "An independent disclosure survives Forget of another root",
  );
});
await runCase("memories-domains/authority", () => {
  const state = wishWorld(),
    domainRef = { kind: "wish" as const, id: "company", characterId: "a" };
  const prior = memoryProposal(state.memories, {
    text: "Ada discussed a shared conversation.",
    audience: ["a", "b", "player"],
    patch: { kind: "information", domainRef },
  });
  applyVillageMemory(state, prior.proposal, prior.context);
  const root = state.memories.records.at(-1)!;
  forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["a"], undefined, root.id), memoryTime(10));
  const fact = {
    id: "conversation-complete",
    at: memoryTime(11),
    recordedAt: memoryTime(25),
    text: "Ada shared the conversation.",
    subjects: ["a"],
    knowers: ["a", "b", "player"],
    domainRef,
    event: true,
  };
  rememberDomainFact(state, fact);
  const saved = state.memories.records.at(-1)!;
  assert.deepEqual(Object.keys(saved.knowers), ["b", "player"]);
  assert.equal(saved.occurredAt, memoryTime(11));
  assert.equal(saved.recordedAt, memoryTime(25));
  const count = state.memories.records.length;
  rememberDomainFact(state, fact);
  assert.equal(state.memories.records.length, count);
  assert.equal(projectMemories(state.memories, ["a"]).length, 0, "Domain facts respect existing memory protection");
});
console.log("Wish notebook disclosures, correction, Forget and domain memory authority passed.");
