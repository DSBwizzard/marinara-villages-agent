import { bindWishProposals } from "../packages/villages/src/server/domain/rules/wish-progress-rules.js";
import { sceneHaltWorldConflict } from "../packages/villages/src/server/domain/rules/scene-halt-world.js";
import { fixtureWish } from "./helpers/social-wishes-fixture.js";
// Test cases: social-wishes/source, social-wishes/privacy, social-wishes/replay, social-wishes/revisions, social-wishes/conditions, social-wishes/continuity, social-wishes/following, social-wishes/reflection, social-wishes/fresh-world
import assert from "node:assert/strict";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import type { WishSource } from "../packages/villages/src/server/domain/rules/social-wishes.js";
import {
  applyWishReflection,
  applyWishSource,
  knownSocialWishes,
  publishWishDisclosure,
} from "../packages/villages/src/server/domain/rules/social-wishes.js";
import { forgetVillageMemory } from "../packages/villages/src/server/domain/rules/village-memories.js";
import { createWishes } from "../packages/villages/src/server/features/residents/wishes/service.js";
import { runCase } from "../scripts/test-cases.mjs";
import { memoryRepair } from "./helpers/memories-fixture.js";
import { wishTime, wishWorld } from "./helpers/social-wishes-fixture.js";
const goal = "Share a conversation with Bryn";
function source(world: ReturnType<typeof wishWorld>, overrides: Partial<WishSource> = {}): WishSource {
  return {
    id: "scene:turn:one",
    kind: "scene",
    at: wishTime(1),
    recordedAt: wishTime(2),
    learn: true,
    residents: structuredClone(world.villagers),
    currentLineIds: ["a1", "b1"],
    lines: [
      { id: "a1", speakerId: "a", content: "I would like to talk with Bryn.", heardBy: ["a", "b"], playerHeard: true },
      {
        id: "b1",
        speakerId: "b",
        content: "I'd enjoy that. Let's talk about our day.",
        heardBy: ["a", "b"],
        playerHeard: true,
      },
    ],
    changes: [
      {
        actorId: "a",
        wishId: "new:talk",
        intent: "create",
        desire: { wish: goal, reason: "Ada wants to know Bryn better." },
        quote: "I would like to talk with Bryn.",
        evidence: [0],
        reason: "Ada expresses a particular desired conversation.",
      },
    ],
    ...overrides,
  };
}
await runCase("social-wishes/source", () => {
  const world = wishWorld(),
    event = source(world);
  applyWishSource(world, event);
  const wish = world.villagers[0]!.wishes[0]!;
  assert.equal(wish.wish, goal);
  assert.equal(wish.attention.state, "background");
  assert.equal(wish.approach, "");
  assert.equal(wish.status, "open");
  assert.equal(knownSocialWishes(world, "a")[0]!.text, "I would like to talk with Bryn.");
  assert.equal(world.villagers[1]!.wishes.length, 0);
  assert.match(bindWishProposals([null], wishWorld(), [], "", []).error, /explicitly retry/);
  const together = wishWorld();
  const immediate = source(together);
  (immediate.changes as any[])[0].fulfilled = true;
  (immediate.changes as any[])[0].evidence = [0, 1];
  applyWishSource(together, immediate);
  assert.equal(
    together.villagers[0]!.wishes[0]!.status,
    "fulfilled",
    "A clear experience can arise and resolve in one exchange",
  );
  assert.equal(together.villagers[0]!.wishes[0]!.history.length, 1);

  const sequenced = wishWorld(),
    sequenceEvent = source(sequenced, { id: "s0:turn:t" });
  (sequenceEvent.changes as any[]).push({
    actorId: "a",
    wishId: "new:talk",
    intent: "fulfilled",
    evidence: [0, 1],
    reason: "They have the actual desired conversation.",
  });
  const scene = coerceSession({
    id: "s0",
    villageSeed: sequenced.seed,
    lines: [],
    submissions: [],
    startedAt: wishTime(),
  });
  scene.continuity = captureSceneContinuity(sequenced, scene, Date.parse(wishTime()));
  assert.equal(
    sceneHaltWorldConflict(scene, sequenced, { wishChanges: sequenceEvent.changes }),
    false,
    "Same-source creation and outcome pass Scene preflight",
  );
  applyWishSource(sequenced, sequenceEvent);
  assert.equal(
    knownSocialWishes(sequenced, "a")[0].status,
    "fulfilled",
    "Same timestamp preserves accepted source order",
  );
  const privateWorld = wishWorld(),
    privateEvent = source(privateWorld, { learn: false });
  privateEvent.lines = privateEvent.lines.map((l) => ({ ...l, playerHeard: false, contactHidden: true }));
  (privateEvent.changes as any[])[0].fulfilled = true;
  applyWishSource(privateWorld, privateEvent);
  const closed = structuredClone(privateWorld.villagers[0].wishes[0]);
  const aftermath = source(privateWorld, {
    id: "later:turn:aftermath",
    changes: [
      {
        actorId: "a",
        wishId: closed.id,
        intent: "reveal",
        evidence: [0],
        quote: "I would like to talk with Bryn.",
        reason: "Owner shares the recorded desire and outcome.",
      },
    ],
  });
  const applied = applyWishSource(privateWorld, aftermath);
  assert.equal(
    knownSocialWishes(privateWorld, "a")[0].status,
    undefined,
    "Mentioning the desire cannot reveal its private outcome",
  );
  assert.deepEqual(privateWorld.villagers[0].wishes[0], closed, "Sharing an aftermath changes knowledge only");
  assert.equal(
    privateWorld.exchangeReceipts[applied.receiptIds[0]].wishOutcome,
    undefined,
    "Disclosure is not another fulfillment",
  );

  const reported = source(privateWorld, {
    id: "later:turn:reported",
    changes: [
      {
        actorId: "a",
        wishId: closed.id,
        intent: "reveal",
        evidence: [0],
        quote: "We had the conversation I wanted.",
        disclosedStatus: "fulfilled",
        statusQuote: "We had the conversation I wanted.",
        reason: "Owner explicitly communicates the outcome.",
      },
    ],
  });
  reported.lines[0].content = "We had the conversation I wanted.";
  applyWishSource(privateWorld, reported);
  assert.equal(knownSocialWishes(privateWorld, "a")[0].status, "fulfilled");
  const repaired = wishWorld(),
    bad = source(repaired);
  (bad.changes as any[])[0].quote = "Words nobody spoke";
  applyWishSource(repaired, bad);
  applyWishSource(repaired, source(repaired));
  assert.equal(repaired.villagers[0].wishes.length, 1, "Corrected interpretation can repair an invalid quotation");
});
await runCase("social-wishes/privacy", () => {
  const world = wishWorld(),
    event = source(world, { kind: "encounter", learn: false });
  event.lines = event.lines.map((l) => ({ ...l, playerHeard: false, contactHidden: true }));
  (event.changes as any[])[0].fulfilled = true;
  applyWishSource(world, event);
  assert.equal(world.villagers[0]!.wishes[0]!.status, "fulfilled");
  assert.deepEqual(knownSocialWishes(world, "a"), []);
  assert.equal(
    Object.values(world.exchangeReceipts).some((r) => r.notice),
    false,
  );
  assert.equal(
    world.memories.records.some((r) => r.knowers.player),
    false,
  );
  const secret = wishWorld();
  secret.villagers[0]!.wishes = [fixtureWish({ wish: "Discuss a private fear with Bryn", reason: "PRIVATE MOTIVE" })];
  const attention = source(secret, {
    changes: [
      {
        actorId: "a",
        wishId: "company",
        intent: "attention",
        attention: { state: "background", reason: "Something else matters now." },
        reason: "Turn attention elsewhere.",
        evidence: [0],
      },
    ],
  });
  attention.lines[0]!.content = "I have other things on my mind.";
  applyWishSource(secret, attention);
  assert.deepEqual(knownSocialWishes(secret, "a"), [], "Unrelated owner speech cannot disclose an unspoken goal");
  const mail = wishWorld(),
    written = source(mail, { kind: "mail", learn: false });
  const result = applyWishSource(mail, written);
  assert.deepEqual(knownSocialWishes(mail, "a"), [], "Delivery does not establish player reading");
  mail.villagers[0]!.wishes[0]!.reason = "LATER PRIVATE RECONSIDERATION";
  for (const fact of result.disclosures) publishWishDisclosure(mail, fact, wishTime(4));
  assert.doesNotMatch(JSON.stringify(knownSocialWishes(mail, "a")), /PRIVATE|RECONSIDERATION/);
  assert.equal(knownSocialWishes(mail, "a")[0]!.facts[0]!.at, wishTime(4));
  const entry = mail.memories.records.find((r) => r.knowers.player)!;
  forgetVillageMemory(mail, memoryRepair(mail.memories, "forget", ["player"], undefined, entry.id), wishTime(5));
  assert.deepEqual(knownSocialWishes(mail, "a"), [], "Retained private authority cannot undo player Forget");
});
await runCase("social-wishes/replay", () => {
  const world = wishWorld(),
    event = source(world);
  applyWishSource(world, event);
  const saved = JSON.stringify(world);
  applyWishSource(world, event);
  assert.equal(JSON.stringify(world), saved, "Replay creates no second desire, memory, history entry or notice");
  assert.deepEqual(
    coerceVillageState(world).villagers[0]!.wishes,
    world.villagers[0]!.wishes,
    "Exact saved Wish data survives decode/restart",
  );
});
await runCase("social-wishes/revisions", () => {
  const world = wishWorld();
  world.villagers[0]!.wishes = [fixtureWish({ wish: goal })];
  const delayed = source(world, {
    changes: [
      { actorId: "a", wishId: "company", intent: "fulfilled", evidence: [0, 1], reason: "Conversation took place." },
    ],
  });
  applyWishSource(
    world,
    source(world, {
      id: "scene:turn:withdraw",
      changes: [
        {
          actorId: "a",
          wishId: "company",
          intent: "withdrawn",
          evidence: [0],
          reason: "Ada no longer wants this conversation.",
        },
      ],
    }),
  );
  applyWishSource(world, delayed);
  assert.equal(world.villagers[0]!.wishes[0]!.status, "withdrawn");
  assert.equal(Object.values(world.exchangeReceipts).filter((r) => r.status === "rejected").length, 1);
  const stale = wishWorld(),
    creation = source(stale);
  stale.villagers[0]!.wishes.push(fixtureWish({ wish: goal }));
  applyWishSource(stale, creation);
  assert.equal(stale.villagers[0]!.wishes.length, 1, "An older Scene cannot recreate changed desire authority");
  const historical = wishWorld();
  historical.villagers[0]!.wishes = [fixtureWish({ wish: goal })];
  const oldSpeech = source(historical, {
    currentLineIds: ["b1"],
    changes: [
      { actorId: "a", wishId: "company", intent: "withdrawn", evidence: ["a1", "b1"], reason: "Claimed changed mind." },
    ],
  });
  applyWishSource(historical, oldSpeech);
  assert.equal(historical.villagers[0]!.wishes[0]!.status, "open", "Historical owner speech is not a new decision");
});
await runCase("social-wishes/conditions", () => {
  const world = wishWorld();
  world.villagers[0]!.wishes = [fixtureWish({ wish: goal })];
  const event = source(world, {
    changes: ["We must speak privately.", "It must be face to face."].map((condition, i) => ({
      actorId: "a",
      wishId: "company",
      intent: "clarify",
      condition,
      evidence: [i],
      reason: condition,
    })),
  });
  event.lines = ["We must speak privately.", "It must be face to face."].map((content, i) => ({
    id: i ? "b1" : "a1",
    speakerId: "a",
    content,
    heardBy: ["a"],
    playerHeard: true,
  }));
  applyWishSource(world, event);
  assert.equal(
    world.villagers[0]!.wishes[0]!.conditions.length,
    2,
    "Independent essential conditions from one exchange both survive",
  );
  assert.deepEqual(knownSocialWishes(world, "a"), [], "Conditions alone cannot reveal a private goal");
  const malformed = source(world, {
    changes: [
      {
        actorId: "a",
        wishId: "company",
        intent: "clarify",
        condition: "UNSPOKEN",
        evidence: [0],
        reason: "An invented prerequisite.",
      },
    ],
  });
  applyWishSource(world, malformed);
  assert.equal(world.villagers[0]!.wishes[0]!.conditions.length, 2);
});
await runCase("social-wishes/continuity", () => {
  const world = wishWorld();
  const scene = coerceSession({
    id: "scene",
    villageSeed: world.seed,
    startedAt: wishTime(),
    status: "active",
    activeIds: ["a", "b"],
    participants: [],
    lines: [],
    submissions: [{ id: "one", at: wishTime(1), mode: "chat", message: "", targetId: "" }],
  });
  scene.continuity = captureSceneContinuity(world, scene, Date.parse(wishTime()));
  applyWishSource(world, source(world));
  const view = sceneContinuityView(world, scene, false);
  assert.equal(
    view.villagers[0]!.wishes.length,
    1,
    "A newly created Wish is upserted into later replies in its own Scene",
  );
  world.villagers[0]!.wishes[0]!.approach = "LATER PRIVATE APPROACH";
  assert.equal(
    sceneContinuityView(world, scene, false).villagers[0]!.wishes[0]!.approach,
    "",
    "An active Scene receives its own committed after-value",
  );
});
await runCase("social-wishes/following", async () => {
  const world = wishWorld();
  applyWishSource(world, source(world));
  const before = structuredClone(world.villagers[0]!.wishes),
    wishId = before[0]!.id;
  const service = createWishes({
    mutateVillageState: async (fn: any) => {
      fn(world);
      return world;
    },
  } as any);
  await service.setWishFollowing("a", wishId, false);
  assert.deepEqual(world.villagers[0]!.wishes, before);
  assert.equal(knownSocialWishes(world, "a")[0]!.followed, false);
  await service.setWishFollowing("a", wishId, true);
  assert.deepEqual(world.villagers[0]!.wishes, before);
});
await runCase("social-wishes/reflection", () => {
  const world = wishWorld(),
    captured = structuredClone(world.villagers);
  applyWishReflection(
    world,
    { actorId: "a", desire: { wish: goal, reason: "Curious about Bryn." }, reason: "An ordinary private desire." },
    "quiet-opportunity",
    wishTime(1),
    captured,
  );
  assert.equal(world.villagers[0]!.wishes.length, 1);
  assert.equal(world.villagers[0]!.wishes[0]!.attention.state, "background");
  assert.deepEqual(knownSocialWishes(world, "a"), []);
  applyWishReflection(
    world,
    { actorId: "a", desire: { wish: goal, reason: "Curious about Bryn." }, reason: "An ordinary private desire." },
    "quiet-opportunity",
    wishTime(1),
    captured,
  );
  assert.equal(world.villagers[0]!.wishes.length, 1);
  for (let i = 0; i < 4; i++)
    world.villagers[0]!.wishes.push(fixtureWish({ wish: "Particular shared experience " + i }, "extra" + i));
  assert.equal(coerceVillageState(world).villagers[0]!.wishes.length, 5, "Retention has no two/three-slot cap");
  const before = structuredClone(world.villagers),
    id = world.villagers[0].wishes[0].id;
  applyWishReflection(
    world,
    {
      actorId: "a",
      wishId: id,
      decision: "approach",
      approach: "Ask Bryn when they have time.",
      reason: "Owner chooses an attempt.",
    },
    "attempt",
    wishTime(2),
    before,
  );
  assert.equal(world.villagers[0].wishes[0].approach, "Ask Bryn when they have time.");
  const beforeWithdrawal = structuredClone(world.villagers);
  applyWishReflection(
    world,
    { actorId: "a", wishId: id, decision: "withdrawn", reason: "Ada no longer wants this conversation." },
    "withdraw",
    wishTime(3),
    beforeWithdrawal,
  );
  assert.equal(world.villagers[0].wishes[0].status, "withdrawn");
  assert.deepEqual(knownSocialWishes(world, "a"), [], "Private reconsideration grants no player knowledge");
  applyWishReflection(
    world,
    {
      actorId: "a",
      wishId: id,
      attention: { state: "foreground", reason: "Old captured desire." },
      reason: "Stale thought.",
    },
    "stale-thought",
    wishTime(4),
    before,
  );
  assert.equal(world.villagers[0].wishes[0].status, "withdrawn");
});
await runCase("social-wishes/fresh-world", () => {
  const world = wishWorld();
  assert.throws(() => coerceVillageState({ ...world, version: 5 }), /fresh Village/);
  assert.throws(
    () =>
      coerceVillageState({
        ...world,
        villagers: [{ ...world.villagers[0], wishes: [{ id: "old", wish: goal }] }],
      }),
    /required|invalid|expected/i,
  );
});
console.log("Social Wishes source authority, privacy, continuity, retention and replay passed.");
