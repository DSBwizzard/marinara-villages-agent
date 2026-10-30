import assert from "node:assert/strict";
import {
  encodeRelationshipPages,
  decodeRelationshipPages,
  decodeRelationshipPagesSync,
} from "../packages/villages/src/server/adapters/storage/relationship-pages.js";
import {
  defaultRelationshipState,
  coerceRelationshipState,
  neutralRelationship,
  relationshipKey,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { immutableMemoryValue } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
const world = "b".repeat(32),
  at = "2026-10-30T10:00:00.000Z",
  key = relationshipKey("ada", "player");
const metrics: unknown[] = [];
{
  const special = defaultRelationshipState("special-thread-ids");
  special.mailThreads = Object.fromEntries(
    ["__proto__", "constructor", "toString"].map((id) => [
      id,
      {
        id,
        participantIds: ["player", "ada"],
        revision: 1,
        messages: [
          {
            id: id + ":letter",
            requestId: "private",
            fromId: "ada",
            toId: "player",
            text: "Exact own-key correspondence",
            at,
            status: "delivered" as const,
          },
        ],
      },
    ]),
  );
  const encoded = encodeRelationshipPages(special, world);
  const decoded = decodeRelationshipPagesSync(encoded.manifest, world, (id) => encoded.pages.get(id) ?? null);
  assert.deepEqual(decoded.value, special);
  assert.ok(Object.hasOwn(decoded.value.mailThreads, "__proto__"));
}
for (const count of [1000, 10_000, 25_000]) {
  const state = defaultRelationshipState("paged-relationship");
  state.eventSequence = count;
  state.edges[key] = { ...neutralRelationship("ada", "player"), revision: count, connection: "Friends" };
  state.mailThreads.personal = { id: "personal", participantIds: ["player", "ada"], revision: count, messages: [] };
  const add = (value: typeof state, index: number) => {
    const id = "event:" + index;
    value.edges[key].records[id] = {
      id,
      revision: 1,
      kind: "history",
      text: "Exact history “café 🌼” " + index,
      participants: ["ada", "player"],
      knownBy: ["ada"],
      status: "stated",
      evidenceIds: ["line:" + index],
    };
    value.edges[key].experiences.push(id);
    value.receipts[id] = {
      id,
      sequence: index + 1,
      fromId: "ada",
      toId: "player",
      beforeRevision: index,
      sceneBeforeRevision: index,
      liveAfter: { connection: "Friends", stance: "Particular", expectations: [], concerns: [], records: [] },
      sourceId: "source:" + index,
      lineIds: ["line:" + index],
      reason: "Witnessed event",
      at,
      evidence: [
        {
          id: "line:" + index,
          sourceId: "source:" + index,
          speakerId: "ada",
          content: "Exact private evidence",
          hash: "source-digest",
          heardBy: ["ada"],
        },
      ],
    };
    value.applied[id] = true;
    value.mailThreads.personal.messages.push({
      id: "letter:" + index,
      requestId: "request:" + index,
      fromId: "ada",
      toId: "player",
      text: "Exact retained correspondence " + index,
      at,
      status: "delivered",
    });
  };
  for (let i = 0; i < count; i++) add(state, i);
  const frozen = immutableMemoryValue(state),
    encoded = encodeRelationshipPages(frozen, world);
  assert.ok([...encoded.pages.values()].every((page) => Buffer.byteLength(JSON.stringify(page)) <= 256 * 1024));
  const stored = new Map([...encoded.pages].map(([id, data]) => [id, JSON.parse(JSON.stringify(data))]));
  const decoded = decodeRelationshipPagesSync(
    JSON.parse(JSON.stringify(encoded.manifest)),
    world,
    (id) => stored.get(id) ?? null,
  );
  assert.deepEqual(
    decoded.value,
    state,
    "Every record, exact evidence, individual knower and complete letter survives native JSON storage",
  );
  let reads = 0;
  const asyncDecoded = await decodeRelationshipPages(encoded.manifest, world, async (id) => {
    reads++;
    return stored.get(id) ?? null;
  });
  assert.deepEqual(asyncDecoded.value, state);
  assert.equal(reads, decoded.pageIds.length, "Shared physical pages are fetched once per decoding scope");
  const next = coerceRelationshipState(frozen.seed, frozen);
  next.eventSequence = count + 1;
  next.edges[key].revision = count + 1;
  next.mailThreads.personal.revision = count + 1;
  add(next, count);
  const changed = encodeRelationshipPages(immutableMemoryValue(next), world, encoded.layout);
  const newBytes = [...changed.pages.values()].reduce((sum, page) => sum + Buffer.byteLength(JSON.stringify(page)), 0);
  assert.ok(newBytes < 700 * 1024, "Appending to a long pair and thread cannot rewrite their complete histories");
  assert.ok(
    changed.serializedBytes < 700 * 1024,
    "Publication cannot hide whole-history serialization behind bounded writes",
  );
  for (const [id, page] of changed.pages) stored.set(id, structuredClone(page));
  const replay = decodeRelationshipPagesSync(changed.manifest, world, (id) => stored.get(id) ?? null);
  assert.deepEqual(replay.value, next);
  assert.equal(frozen.mailThreads.personal.messages.length, count, "Publication cannot mutate a frozen Scene's source");
  assert.equal(frozen.edges[key].experiences.length, count);
  assert.throws(
    () => decodeRelationshipPagesSync(changed.manifest, "c".repeat(32), (id) => stored.get(id) ?? null),
    /reference/,
  );
  assert.throws(() => decodeRelationshipPagesSync(changed.manifest, world, () => null), /missing/);
  metrics.push({
    count,
    retainedBytes: [...stored.values()].reduce((sum, page) => sum + Buffer.byteLength(JSON.stringify(page)), 0),
    newBytes,
    serializedBytes: changed.serializedBytes,
  });
}
console.log("Relationship/mail page growth:", JSON.stringify(metrics));
console.log(
  "Relationship pages: exact sync/async restart, native size bounds, long pair/thread append, publication serialization and missing/foreign history holds passed.",
);
