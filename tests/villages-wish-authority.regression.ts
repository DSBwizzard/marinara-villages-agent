import assert from "node:assert/strict";
import { mock } from "node:test";
import { bindWishProposals } from "../packages/villages/src/server/domain/rules/wish-progress-rules.js";
import {
  applyWishSource,
  captureWishAuthority,
  readSocialWishChanges,
  type SocialWishChange,
} from "../packages/villages/src/server/domain/rules/social-wishes.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { createWishes } from "../packages/villages/src/server/features/residents/wishes/service.js";
import { fixtureWish, wishTime, wishWorld } from "./helpers/social-wishes-fixture.js";

const lines = [
  {
    id: "owner",
    role: "assistant" as const,
    speakerId: "a",
    name: "Ada",
    content: "I want a conversation. Only at daybreak. I also want to hear a song.",
    heardBy: ["a", "b"],
    at: wishTime(1),
  },
  {
    id: "other",
    role: "assistant" as const,
    speakerId: "b",
    name: "Bryn",
    content: "We talk together at daybreak, then share a song.",
    heardBy: ["a", "b"],
    at: wishTime(1),
  },
];
const change = (overrides: Partial<SocialWishChange> = {}): SocialWishChange => ({
  actorId: "a",
  wishId: "target",
  intent: "progress",
  evidence: ["owner", "other"],
  reason: "A witnessed shared conversation.",
  ...overrides,
});
function source(world: ReturnType<typeof wishWorld>, changes: SocialWishChange[], id = "s:turn:one") {
  return {
    id,
    kind: "scene" as const,
    at: wishTime(1),
    recordedAt: wishTime(2),
    lines,
    currentLineIds: lines.map((line) => line.id),
    changes,
    authority: captureWishAuthority(world.villagers, changes),
    learn: false,
  };
}
const measured: unknown[] = [];
for (const count of [1000, 10_000, 25_000]) {
  const world = wishWorld(),
    owner = world.villagers[0];
  owner.wishes = Array.from({ length: count }, (_, index) =>
    fixtureWish({ wish: "A distinct desired conversation " + index }, index ? "wish:" + index : "target"),
  );
  owner.wishes[0].conditions = [
    { id: "condition", quote: "Only at daybreak.", at: wishTime(), sourceId: "original", lineIds: ["exact"] },
  ];
  Object.defineProperty(owner, "spriteManager", {
    enumerable: true,
    get() {
      throw Error("Application capture must not load resident media");
    },
  });
  Object.defineProperty(world.villagers[1], "wishes", {
    enumerable: true,
    get() {
      throw Error("Application capture must not load unrelated actors");
    },
  });
  const stringify = JSON.stringify;
  let jsonBytes = 0;
  mock.method(JSON, "stringify", (...args: unknown[]) => {
    const text = Reflect.apply(stringify, JSON, args);
    if (typeof text === "string") jsonBytes += Buffer.byteLength(text);
    return text;
  });
  let packet: ReturnType<typeof bindWishProposals>;
  let captureJsonBytes = 0;
  try {
    packet = bindWishProposals(
      Array.from({ length: 16 }, (_, index) => change({ reason: "Witnessed progress " + index })),
      world,
      lines,
      "",
      lines.map((line) => line.id),
    );
    JSON.stringify(packet);
    captureJsonBytes = jsonBytes;
    applyWishSource(world, {
      id: "growth:turn:one",
      kind: "scene",
      at: wishTime(1),
      recordedAt: wishTime(2),
      lines,
      currentLineIds: lines.map((line) => line.id),
      changes: packet.proposals,
      authority: packet.authority,
      learn: false,
    });
  } finally {
    mock.restoreAll();
  }
  const bytes = Buffer.byteLength(JSON.stringify(packet!));
  const applicationJsonBytes = jsonBytes - captureJsonBytes;
  measured.push({ count, bytes, captureJsonBytes, applicationJsonBytes });
  assert(
    bytes < 8192 && captureJsonBytes < 16384,
    "Retained application context cannot serialize or copy complete Wish/resident history per proposal",
  );
  assert(applicationJsonBytes < 256 * 1024, "Ordinary updates must not serialize unrelated Wish histories");
  assert.equal(owner.wishes[0].history.length, 16);
  assert.equal(packet!.authority.owners.length, 1);
  assert.equal(packet!.authority.owners[0].expected.length, 1);
  assert.equal(packet!.authority.owners[0].creationFingerprint, undefined);
  assert(!JSON.stringify(packet!).includes('"captured":'));
  assert(
    !JSON.stringify(packet!).includes("Only at daybreak"),
    "Application stores guards; the separate interpretation context retains exact conditions",
  );
}
console.log("Wish application-context growth:", JSON.stringify(measured));

for (const altered of ["target", "owner", "missing-target"] as const) {
  const world = wishWorld();
  if (altered !== "missing-target") world.villagers[0].wishes = [fixtureWish({ wish: "A conversation" }, "target")];
  const event = source(world, [change()]);
  if (altered === "target") world.villagers[0].wishes[0].revision++;
  if (altered === "owner") world.villagers[0].cardSnapshot.capturedAt = wishTime(3);
  if (altered === "missing-target") world.villagers[0].wishes.push(fixtureWish({ wish: "A later desire" }, "target"));
  applyWishSource(world, event);
  assert.equal(world.villagers[0].wishes[0].history.length, 0);
  assert(Object.values(world.exchangeReceipts).every((receipt) => receipt.status === "rejected"));
}
const create = (wishId = "new:conversation", wish = "A conversation"): SocialWishChange =>
  change({
    wishId,
    intent: "create",
    desire: { wish, reason: "The owner wants this shared experience." },
    quote: "I want a conversation.",
    evidence: ["owner"],
  });
for (const intent of ["progress", "reveal"] as const) {
  const world = wishWorld();
  world.villagers[0].wishes = [fixtureWish({ wish: "A conversation" }, "target")];
  const event = source(world, [change({ intent, quote: "I want a conversation." })]);
  event.changes.push(create());
  applyWishSource(world, event);
  assert.equal(world.villagers[0].wishes.length, 1, "An accepted update cannot invent missing create authority");
  assert.equal(Object.values(world.exchangeReceipts).at(-1)?.status, "rejected");
}
for (const altered of ["unrelated-addition", "history", "order"] as const) {
  const world = wishWorld();
  world.villagers[0].wishes = [
    fixtureWish({ wish: "Old desire" }, "old"),
    fixtureWish({ wish: "Another desire" }, "other"),
  ];
  const event = source(world, [create()]);
  if (altered === "unrelated-addition")
    world.villagers[0].wishes.push(fixtureWish({ wish: "New unrelated desire" }, "extra"));
  if (altered === "history")
    world.villagers[0].wishes[0].history.push({
      id: "later",
      at: wishTime(),
      kind: "progress",
      text: "Later history",
      sourceId: "later",
      lineIds: [],
    });
  if (altered === "order") world.villagers[0].wishes.reverse();
  const prior = structuredClone(world.villagers[0].wishes);
  applyWishSource(world, event);
  assert.deepEqual(
    world.villagers[0].wishes,
    prior,
    "Initial create guards preserve the complete original array/order/history contract",
  );
}
{
  const world = wishWorld();
  const changes = [
    create(),
    change({ wishId: "new:conversation", intent: "clarify", condition: "Only at daybreak.", evidence: ["owner"] }),
    change({ wishId: "new:conversation", intent: "fulfilled" }),
  ];
  const event = source(world, changes),
    authority = structuredClone(event.authority);
  const first = applyWishSource(world, event);
  assert.equal(world.villagers[0].wishes[0].status, "fulfilled");
  assert.equal(world.villagers[0].wishes[0].history.length, 3);
  assert.equal(world.villagers[0].wishes[0].conditions[0].quote, "Only at daybreak.");
  assert.deepEqual(
    event.authority,
    authority,
    "Ordered application evolves local maps without mutating the saved baseline",
  );
  const before = structuredClone(world);
  assert.deepEqual(applyWishSource(world, event).receiptIds, first.receiptIds);
  assert.deepEqual(world, before, "Purchased meaning replays without duplicate effects");
}
{
  const world = wishWorld();
  const changes = [create(), { ...create("new:song", "A shared song"), quote: "I also want to hear a song." }];
  applyWishSource(world, source(world, changes));
  assert.equal(world.villagers[0].wishes.length, 2, "Two accepted creates advance the local array guard in order");
}
{
  const world = wishWorld();
  world.villagers[0].wishes = [fixtureWish({ wish: "A conversation" }, "target")];
  const snapshots = [
    {
      actorId: "a",
      capturedAt: world.villagers[0].cardSnapshot.capturedAt,
      wishes: structuredClone(world.villagers[0].wishes),
    },
  ];
  const original = bindWishProposals(
    [change()],
    world,
    lines,
    "",
    lines.map((line) => line.id),
    snapshots,
  );
  world.villagers[0].wishes[0].revision++;
  const rebound = bindWishProposals(
    [change()],
    world,
    lines,
    "",
    lines.map((line) => line.id),
    snapshots,
  );
  assert.deepEqual(
    rebound.authority,
    original.authority,
    "Explicit reinterpretation still binds the complete original frozen context, never live Wishes",
  );
  world.villagers[0].cardSnapshot.capturedAt = wishTime(3);
  for (const malformed of [
    { actorId: "a", capturedAt: null, wishes: null },
    { actorId: "a", capturedAt: snapshots[0].capturedAt },
    { actorId: "a", wishes: snapshots[0].wishes },
  ]) {
    const before = structuredClone(world);
    assert.throws(
      () => bindWishProposals([change()], world, lines, "", ["owner", "other"], [malformed]),
      /Saved Wish interpretation context is incomplete/,
      "A malformed retained context cannot substitute current live authority",
    );
    assert.deepEqual(world, before);
  }
  const scene = coerceSession({
    version: 3,
    id: "s",
    villageSeed: world.seed,
    lines,
    submissions: [
      { id: "turn", wishProposals: original.proposals, wishAuthority: original.authority, wishContexts: snapshots },
    ],
  });
  assert.equal(Object.hasOwn(publicSceneResponse(scene).submissions[0], "wishAuthority"), false);
  assert(!JSON.stringify(publicSceneResponse(scene)).includes("creationFingerprint"));
  const service = createWishes({
    mutateVillageState: async () => {
      assert.fail("No Wish changes require no World read/write");
    },
  } as never);
  const noChanges = coerceSession({ version: 3, id: "s", submissions: [{ id: "empty", wishProposals: [] }] });
  assert.deepEqual((await service.processWishExchange(noChanges, "empty")).receiptIds, []);
  assert.throws(() => readSocialWishChanges([{ ...change(), captured: world.villagers }]), /Invalid/);
}
