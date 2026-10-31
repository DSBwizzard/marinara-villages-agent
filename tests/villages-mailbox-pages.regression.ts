import { fixtureCapturedAdmissions } from "./helpers/village-storage.fixture.js";
// Test cases: mailbox-pages/growth, mailbox-pages/navigation, mailbox-pages/privacy, mailbox-pages/identities, mailbox-pages/recovery, mailbox-pages/commands
import assert from "node:assert/strict";
import { mock } from "node:test";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import {
  createMailboxPresentation,
  readMailboxQuery,
  mailboxLetterIdentity,
} from "../packages/villages/src/server/domain/rules/mailbox-view.js";
import { villageWorldScope } from "../packages/villages/src/server/domain/rules/village-identity.js";
import type { SocialMailMessage } from "../packages/villages/src/server/domain/models/social-mail.js";
import { createSocialMail } from "../packages/villages/src/server/features/residents/social-mail-service.js";
import { coerceRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";

function fixture(count: number) {
  const village = { ...defaultVillageState(), seed: "mailbox-pages", setupAt: "2026-10-30T12:00:00.000Z" };
  const state = defaultRelationshipState(village.seed);
  const thread = (state.mailThreads.personal = {
    id: "personal",
    participantIds: ["player", "ada"],
    revision: 1,
    messages: [],
  });
  for (let i = 0; i < count; i++) {
    const id = "letter:" + String(i).padStart(6, "0");
    const message: SocialMailMessage = {
      id,
      requestId: id,
      fromId: "ada",
      toId: "player",
      at: village.setupAt,
      text: "Exact café 🌼 evidence ".repeat(30) + i,
      status: "delivered",
      readAt: village.setupAt,
    };
    thread.messages.push(message);
    state.mailDeliveries[id] = { messageId: id, at: village.setupAt, sourceHash: "source:" + i };
  }
  return { village, state, thread, present: () => createMailboxPresentation(village, state, []) };
}
await runCase("mailbox-pages/growth", async () => {
  const metrics: unknown[] = [];
  for (const count of [1000, 10_000, 25_000]) {
    const f = fixture(count),
      stringify = JSON.stringify;
    let jsonBytes = 0,
      textReads = 0;
    for (const message of f.thread.messages) {
      const text = message.text;
      Object.defineProperty(message, "text", {
        get() {
          textReads++;
          return text;
        },
        enumerable: true,
      });
    }
    mock.method(JSON, "stringify", (...args: unknown[]) => {
      const output = Reflect.apply(stringify, JSON, args);
      if (typeof output === "string") jsonBytes += Buffer.byteLength(output);
      return output;
    });
    let bytes = 0;
    try {
      const page = f.present().mailbox({ folder: "inbox" });
      assert.equal(page.letters.length, 50);
      assert.equal(page.total, count);
      assert(page.nextCursor);
      assert(page.letters.every((letter) => !Object.hasOwn(letter.message, "text")));
      bytes = Buffer.byteLength(JSON.stringify(page));
    } finally {
      mock.restoreAll();
    }
    assert(bytes < 96 * 1024);
    assert(jsonBytes < 256 * 1024, "Summary construction must not serialize all retained correspondence");
    assert(textReads <= 100, "Only the selected page may inspect full text for previews/identity");
    metrics.push({ count, responseBytes: bytes, serializedBytes: jsonBytes, textReads });
  }
  console.log("Mailbox summary response growth:", JSON.stringify(metrics));
});
await runCase("mailbox-pages/navigation", async () => {
  const f = fixture(113),
    first = f.present().mailbox({});
  const newer = { ...f.thread.messages[0], id: "newer", at: "2026-10-31T12:00:00.000Z" };
  f.thread.messages.push(newer);
  f.state.mailDeliveries.newer = { messageId: "newer", at: newer.at, sourceHash: "newer" };
  const ids = first.letters.map((row) => row.message.id);
  let cursor = first.nextCursor;
  while (cursor) {
    const page = f.present().mailbox({ cursor });
    ids.push(...page.letters.map((row) => row.message.id));
    cursor = page.nextCursor;
  }
  assert.equal(ids.length, 113);
  assert.equal(new Set(ids).size, ids.length);
  assert(!ids.includes("newer"));
  assert.equal(f.present().mailbox({}).letters[0].message.id, "newer");
  assert.throws(() => f.present().mailbox({ folder: "sent", cursor: first.nextCursor }), /mailbox changed/);
  assert.throws(() => f.present().mailbox({ cursor: "not+a+cursor" }), /valid mailbox page/);
  f.village.setupAt = "another-world";
  assert.throws(() => f.present().mailbox({ cursor: first.nextCursor }), /mailbox changed/);
  assert.throws(() => readMailboxQuery({ folder: "all" }));
});
await runCase("mailbox-pages/privacy", async () => {
  const f = fixture(1),
    message = f.thread.messages[0];
  message.readAt = undefined;
  assert.equal(f.present().mailbox({}).letters[0].message.preview, "");
  const detail = f.present().letter(f.thread.id, message.id);
  assert.equal(detail.message.text, message.text);
  assert.equal(message.readAt, undefined, "Fetching a body cannot publish disclosures or mark it read");
  delete f.state.mailDeliveries[message.id];
  assert.equal(f.present().mailbox({}).letters.length, 0);
  assert.throws(() => f.present().letter(f.thread.id, message.id), /unavailable/);
  message.fromId = "player";
  message.toId = "ada";
  message.status = "pending";
  assert.equal(f.present().mailbox({ folder: "sent" }).letters.length, 1);
  assert.equal(f.present().letter(f.thread.id, message.id).message.text, message.text);
  f.thread.participantIds = ["ada", "ben"];
  assert.throws(() => f.present().letter(f.thread.id, message.id), /unavailable/);
  assert.throws(() => f.present().letter("__proto__", message.id), /unavailable/);
});
await runCase("mailbox-pages/identities", async () => {
  const f = fixture(1),
    message = f.thread.messages[0];
  const identity = () => mailboxLetterIdentity(f.village, f.state, f.thread.id, message);
  const original = identity();
  message.readAt = undefined;
  message.error = "An ordinary diagnostic";
  message.status = "applying";
  assert.equal(identity(), original, "Read, status and diagnostic changes cannot invalidate the selected content");
  message.text += " Changed after restoration";
  assert.notEqual(identity(), original, "Same-world request-ID reuse cannot act on a different letter");
  const changed = identity();
  message.disclosures = [
    { fromId: "ada", toId: "player", text: "Exact new disclosure", kind: "connection", lineIds: [message.id] },
  ];
  assert.notEqual(identity(), changed, "Accepted disclosure payloads belong to the selected content");
  const worldScope = villageWorldScope(f.village);
  f.village.setupAt += "-new";
  assert.notEqual(villageWorldScope(f.village), worldScope);
});
await runCase("mailbox-pages/recovery", async () => {
  const f = fixture(0);
  f.village.socialMailOutbox = Array.from({ length: 105 }, (_, i) => ({
    id: "orphan:" + String(i).padStart(3, "0"),
    error: "Storage held",
    reinterpretRequired: true,
    input: {
      threadId: "private-thread",
      sourceAt: f.village.setupAt,
      sourceHash: "source:" + i,
      admittedAt: f.village.setupAt,
    },
    result: { replyText: "Unseen purchased reply sentinel" },
  })) as any;
  const ids: string[] = [];
  let cursor: string | undefined;
  do {
    const page = f.present().mailbox({ recoveryCursor: cursor });
    assert(page.recovery.length <= 50);
    assert.equal(page.recoveryTotal, 105);
    assert(Buffer.byteLength(JSON.stringify(page)) < 96 * 1024);
    assert(!JSON.stringify(page).includes("Unseen purchased reply sentinel"));
    ids.push(...page.recovery.map((row) => row.messageId));
    assert(page.recovery.every((row) => /^[a-f0-9]{64}$/.test(row.token)));
    cursor = page.recoveryNextCursor;
  } while (cursor);
  assert.equal(ids.length, 105);
  assert.equal(new Set(ids).size, 105, "Orphaned recovery remains independently reachable beyond the letter page");
});
await runCase("mailbox-pages/commands", async () => {
  const f = fixture(1),
    message = f.thread.messages[0];
  message.readAt = undefined;
  let worldWrites = 0,
    relationshipWrites = 0,
    modelRequests = 0,
    failWrite = false;
  const service = createSocialMail({
    readMailInput: fixtureCapturedAdmissions.readMailInput,
    withWork: async (work: any) => work(),
    withVillageSceneAcceptance: async (work: any) => work(f.village),
    readVillageSnapshot: async (options?: { memories?: boolean }) => {
      const snapshot = { ...f.village, relationshipContext: coerceRelationshipState(f.village.seed, f.state) };
      if (!options?.memories)
        for (const key of ["memories", "memoryScenes", "memoryReceipts"])
          Object.defineProperty(snapshot, key, {
            enumerable: false,
            get() {
              throw Error("Unrelated Memories were loaded");
            },
          });
      return snapshot;
    },
    readRelationshipState: async () => coerceRelationshipState(f.village.seed, f.state),
    backgroundWorkSummaries: async () => [],
    mutateVillageState: async (work: any) => {
      worldWrites++;
      if (failWrite) throw Error("Memory storage unavailable");
      work(f.village);
      return f.village;
    },
    mutateRelationships: async (_seed: string, work: any) => {
      relationshipWrites++;
      await work(f.state);
      return f.state;
    },
    queueBackgroundJob: async () => {
      modelRequests++;
      throw Error("No model work is permitted");
    },
    completeWithRoom: async () => {
      modelRequests++;
      throw Error("No provider is configured");
    },
  } as any);
  const scope = villageWorldScope(f.village),
    original = mailboxLetterIdentity(f.village, f.state, f.thread.id, message);
  assert.equal((await service.readMailbox({ scope })).letters.length, 1);
  assert.equal((await service.getLetter(f.thread.id, message.id, scope, original)).message.text, message.text);
  assert.equal(worldWrites + relationshipWrites, 0, "GET detail cannot publish knowledge or mark a letter read");
  message.text += " Different content under the same restored ID";
  await assert.rejects(service.getLetter(f.thread.id, message.id, scope, original), /letter changed/);
  await assert.rejects(service.readLetter(f.thread.id, message.id, scope, original), /letter changed/);
  await assert.rejects(
    service.retry(f.thread.id, message.id, "retry-old-branch", scope, original),
    /saved mail changed/,
  );
  assert.equal(
    worldWrites + relationshipWrites + modelRequests,
    0,
    "Stale restored identities cannot publish or purchase effects",
  );
  const token = mailboxLetterIdentity(f.village, f.state, f.thread.id, message);
  failWrite = true;
  await assert.rejects(service.readLetter(f.thread.id, message.id, scope, token), /Memory storage/);
  assert.equal(message.readAt, undefined);
  assert.equal(relationshipWrites, 0, "Disclosure publication must succeed before the read acknowledgement");
  failWrite = false;
  await service.readLetter(f.thread.id, message.id, scope, token);
  assert(f.thread.messages[0].readAt);
  await service.readLetter(f.thread.id, message.id, scope, token);
  assert.equal(modelRequests, 0);
  f.village.setupAt += "-replacement";
  const writes = worldWrites + relationshipWrites;
  await assert.rejects(service.readLetter(f.thread.id, message.id, scope, token), /Village changed/);
  assert.equal(worldWrites + relationshipWrites, writes);
});
