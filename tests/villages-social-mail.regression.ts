import assert from "node:assert/strict";
import { createSocialMail } from "../packages/villages/src/server/features/residents/social-mail-service.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  defaultRelationshipState,
  relationshipFor,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { emptyRelationshipReview } from "../packages/villages/src/server/domain/rules/relationship-review.js";
import type { SocialMailInput } from "../packages/villages/src/server/domain/models/social-mail.js";
import type { RelationshipState } from "../packages/villages/src/server/domain/models/relationship-types.js";
const village = defaultVillageState();
village.seed = "mail";
village.foundedAt = new Date().toISOString();
village.villagers = [
  {
    characterId: "ada",
    cardSnapshot: { name: "Ada", capturedAt: "card-1", personality: "Candid" },
    completedWishes: [],
  },
] as any;
let social = defaultRelationshipState(village.seed);
social.reviewedActorIds = ["ada"];
const queued: any[] = [];
let calls = 0,
  failMeaning = false,
  failReplyWrite = false,
  failCleanup = false,
  truncateMeaning = false,
  sourceOnlyReply = false;
const snapshot = async () => ({ ...structuredClone(village), relationshipContext: structuredClone(social) });
const projection = (connection: string) => ({
  connection,
  stance: "Particular stance",
  expectations: [],
  concerns: [],
  records: [],
});
const change = (input: SocialMailInput, revision: number, reply: boolean) => ({
  fromId: "ada",
  toId: "player",
  expectedRevision: revision,
  sceneAfter: projection(reply ? "Friends" : "Acquaintances"),
  liveAfter: projection(reply ? "Friends" : "Acquaintances"),
  reason: "Exact delivered correspondence",
  lineIds: [reply ? input.messageId + ":reply" : input.messageId],
});
let active: SocialMailInput;
const service = createSocialMail({
  readVillageSnapshot: snapshot,
  readRelationshipState: async () => structuredClone(social),
  mutateRelationships: async (_seed: string, mutate: (state: RelationshipState) => void) => {
    const next = structuredClone(social);
    await mutate(next);
    if (
      failReplyWrite &&
      Object.values(next.mailThreads).some((thread) =>
        thread.messages.some((message) => message.fromId === "ada" && message.replyTo),
      )
    ) {
      failReplyWrite = false;
      throw Error("Reply write unavailable");
    }
    social = next;
    return structuredClone(social);
  },
  mutateVillageState: async (mutate: any) => {
    const next = { ...structuredClone(village), relationshipContext: structuredClone(social) };
    mutate(next);
    if (failCleanup && (next.socialMailOutbox?.length ?? 0) < (village.socialMailOutbox?.length ?? 0)) {
      failCleanup = false;
      throw Error("Final cleanup unavailable");
    }
    delete next.relationshipContext;
    Object.assign(village, next);
    return snapshot();
  },
  queueBackgroundJob: async (job: any) => {
    queued.push(structuredClone(job));
  },
  retryBackgroundJob: async () => assert.fail("No provider job recovery in this fixture"),
  backgroundWorkSummaries: async () => [],
  villagesConnectionIdFor: async (role: string) => role,
  villagesLanguageModels: () => ({
    resolveForRequest: async ({ connectionId }: any) => ({
      connectionId,
      model: "fixture",
      maxOutputTokens: 4096,
      fitContext: (messages: any, options: any) => ({ messages, ...options }),
      chatComplete: () => assert.fail("Real providers forbidden"),
    }),
  }),
  completeWithRoom: async (model: any, messages: any[], _maxTokens: number, options: any) => {
    if (options.responseFormat?.type === "json_object")
      assert(
        messages.some((message) => message.role === "system" && /\bjson\b/iu.test(message.content)),
        "JSON mode requires JSON in the application instructions",
      );
    calls++;
    if (model.connectionId === "system") assert.equal(options.reasoningEffort, "low");
    if (model.connectionId === "narration")
      return { content: JSON.stringify({ text: "I'd like to stay friends." }), finishReason: "stop" };
    if (failMeaning) throw Error("Meaning provider unavailable");
    if (truncateMeaning) return { content: "", finishReason: "length", usage: { completionReasoningTokens: 4096 } };
    const replyChange = change(active, 0, true);
    if (sourceOnlyReply) replyChange.lineIds = [active.messageId];
    return {
      content: JSON.stringify({
        sourceReview: active.sourceDelivered
          ? emptyRelationshipReview()
          : {
              ...emptyRelationshipReview(),
              changes: [
                change(active, relationshipFor(active.admitted.relationshipContext, "ada", "player").revision, false),
              ],
            },
        replyReview: {
          ...emptyRelationshipReview(),
          changes: sourceOnlyReply
            ? [replyChange]
            : [
                change(
                  active,
                  active.sourceDelivered
                    ? relationshipFor(social, "ada", "player").revision
                    : relationshipFor(active.admitted.relationshipContext, "ada", "player").revision + 1,
                  true,
                ),
              ],
          disclosures: [
            {
              fromId: "ada",
              toId: "player",
              text: "I'd like to stay friends.",
              kind: "connection",
              lineIds: [active.messageId + ":reply"],
            },
          ],
        },
      }),
      finishReason: "stop",
    };
  },
} as any);
async function generateAndSave() {
  const job = queued.at(-1);
  active = job.input;
  const result = await service.handler.generate(job.input);
  service.handler.apply(village, job.input, result, { retrying: false });
  await service.processOutbox(await snapshot());
}
await service.readMailbox();
assert.equal(calls, 0);
await service.send({ residentId: "ada", requestId: "one", text: "Hello\n  exact text" });
assert.equal(calls, 0, "Sending first saves exact pending text before dispatch");
assert.equal(social.mailThreads["personal:ada"]!.messages[0]!.text, "Hello\n  exact text");
await service.send({ residentId: "ada", requestId: "one", text: "Hello\n  exact text" });
assert.equal(social.mailThreads["personal:ada"]!.messages.length, 1);
failMeaning = true;
active = queued.at(-1).input;
await assert.rejects(() => service.handler.generate(active), /Meaning provider unavailable/);
assert.equal(social.mailDeliveries[active.messageId], undefined);
await service.cancel(active.threadId, active.messageId);
assert.equal(social.mailThreads[active.threadId]!.messages[0]!.status, "cancelled");
failMeaning = false;
await service.send({ residentId: "ada", requestId: "two", text: "Can we be friends?" });
failReplyWrite = true;
await generateAndSave();
let view = await service.readMailbox();
const source = view.threads[0]!.messages.find((row) => row.id === active.messageId)!;
assert.equal(source.status, "delivered");
assert.equal(source.replyPending, true);
assert.equal(
  view.threads[0]!.messages.some((row) => row.fromId === "ada"),
  false,
  "Failed reply write never exposes the reply",
);
const sourceReceipt = structuredClone(social.mailDeliveries[active.messageId]);
const sourceRevisions = relationshipFor(social, "ada", "player").revision;
const beforeRetryCalls = calls;
await service.retry(active.threadId, active.messageId, "storage-retry");
assert.equal(calls, beforeRetryCalls, "A local storage retry must not buy another model response");
assert.deepEqual(social.mailDeliveries[active.messageId], sourceReceipt);
assert.equal(sourceRevisions, 1);
assert.equal(relationshipFor(social, "ada", "player").revision, 2);
view = await service.readMailbox();
assert.equal(view.threads[0]!.messages.filter((row) => row.replyPending).length, 0);
assert.equal(view.threads[0]!.messages.filter((row) => row.fromId === "ada").length, 1);
assert.equal(Object.values(social.disclosures).length, 0, "Unread mail has not added notebook knowledge");
await service.readThread(active.threadId);
await service.readThread(active.threadId);
assert.equal(Object.values(social.disclosures).length, 1);
assert.equal(calls, beforeRetryCalls, "Reading and polling buy no model calls");
await assert.rejects(() => service.cancel(active.threadId, active.messageId), /already been delivered/);
await assert.rejects(
  () => service.send({ residentId: "ada", requestId: "two", text: "Changed source" }),
  /different message/,
);

// Automatic mail is a single already interpreted source. Delivery creates no automatic reply chain.
const automatic = service.automaticOutbox(
  await snapshot(),
  social,
  {
    senderId: "ada",
    text: "I'd welcome another conversation.",
    relationshipReview: {
      ...emptyRelationshipReview(),
      disclosures: [
        { fromId: "ada", toId: "player", text: "I'd welcome another conversation.", kind: "connection", lineIds: [0] },
      ],
    },
  },
  "opportunity",
  new Date().toISOString(),
);
village.socialMailOutbox = [automatic];
await service.processOutbox(await snapshot());
const automaticView = (await service.readMailbox()).threads[0]!.messages.find((row) => row.id === "opportunity:mail")!;
assert.equal(automaticView.status, "delivered");
assert.equal(automaticView.replyPending, false);
assert.equal(calls, beforeRetryCalls);
assert.equal(
  queued.some((job) => job.subjectId === "opportunity:mail"),
  false,
);
assert.equal(Object.values(social.disclosures).length, 1);
await service.readThread("personal:ada");
assert.equal(Object.values(social.disclosures).length, 2);
await assert.rejects(() => service.send({ residentId: "ada", requestId: "two:reply", text: "Collision" }));
await service.send({ residentId: "ada", requestId: "cleanup", text: "Keep the original source." });
active = queued.at(-1).input;
const generated = await service.handler.generate(active);
service.handler.apply(village, active, generated, { retrying: false });
failCleanup = true;
await service.processOutbox(await snapshot());
const afterCleanupCalls = calls,
  afterCleanupRevision = relationshipFor(social, "ada", "player").revision;
assert(social.mailDeliveries[active.messageId + ":reply"]);
assert(village.socialMailOutbox?.[0]?.error);
await service.retry(active.threadId, active.messageId, "cleanup-local");
assert.equal(calls, afterCleanupCalls);
assert.equal(relationshipFor(social, "ada", "player").revision, afterCleanupRevision);
assert.equal(village.socialMailOutbox?.length, 0, "Final receipt cleanup replays locally");

await service.send({ residentId: "ada", requestId: "reply-evidence", text: "Exact original" });
active = queued.at(-1).input;
sourceOnlyReply = true;
await assert.rejects(() => service.handler.generate(active), /Every reply effect must cite/);
sourceOnlyReply = false;
await service.cancel(active.threadId, active.messageId);

const held = service.automaticOutbox(
  await snapshot(),
  social,
  {
    senderId: "ada",
    text: "A private proposal.",
    relationshipReview: {
      ...emptyRelationshipReview(),
      changes: [{ ...change(active, relationshipFor(social, "ada", "player").revision, false), lineIds: [0] }],
    },
  },
  "held",
  new Date().toISOString(),
);
village.socialMailOutbox = [held];
social.edges[JSON.stringify(["ada", "player"])]!.revision++;
await service.processOutbox(await snapshot());
const heldView = await service.readMailbox();
assert.equal(heldView.recovery?.[0]?.messageId, "held:mail");
assert.equal(heldView.recovery?.[0]?.reinterpretRequired, true);
assert.equal(heldView.recovery?.[0]?.cancellable, false);
await assert.rejects(() => service.cancel(held.input.threadId, held.id), /local recovery/);
assert(
  !JSON.stringify(heldView).includes("A private proposal."),
  "Recovery never exposes an undelivered resident message",
);
const heldSource = social.mailThreads[held.input.threadId]!.messages.find((row) => row.id === held.id)!;
const sourceFingerprint = heldSource.sourceHash;
await service.retry(held.input.threadId, held.id, "fresh-meaning");
assert.equal(queued.at(-1).input.sourceHash, sourceFingerprint);
assert.equal(queued.at(-1).input.retainedReply, "", "Resident-source retry never starts a reply chain");

// A card change before delivery remains private and can be discarded without applying effects.
const obsolete = service.automaticOutbox(
  await snapshot(),
  social,
  { senderId: "ada", text: "Obsolete private message.", relationshipReview: emptyRelationshipReview() },
  "obsolete",
  new Date().toISOString(),
);
village.socialMailOutbox = [obsolete];
village.villagers[0]!.cardSnapshot.capturedAt = "card-2";
await service.processOutbox(await snapshot());
const obsoleteView = await service.readMailbox();
assert.equal(obsoleteView.recovery?.[0]?.cancellable, true);
assert(!JSON.stringify(obsoleteView).includes("Obsolete private message."));
const beforeDiscardCalls = calls;
failCleanup = true;
await assert.rejects(() => service.cancel(obsolete.input.threadId, obsolete.id), /Final cleanup/);
assert.equal(social.mailThreads[obsolete.input.threadId]!.messages.at(-1)!.status, "cancelled");
await service.cancel(obsolete.input.threadId, obsolete.id);
assert.equal(village.socialMailOutbox?.length, 0);
// Even an already running job's late saved result cannot revive the cancelled source.
village.socialMailOutbox = [{ ...obsolete, error: undefined }];
await service.processOutbox(await snapshot());
assert.equal(village.socialMailOutbox?.length, 0);
assert.equal(social.mailDeliveries[obsolete.id], undefined);
assert.equal(calls, beforeDiscardCalls);
// Keep truncation independent of the deliberately retained applying source above.
social = defaultRelationshipState(village.seed);
social.reviewedActorIds = ["ada"];
await service.send({ residentId: "ada", requestId: "output-limit", text: "Please read this." });
active = queued.at(-1).input;
truncateMeaning = true;
await assert.rejects(() => service.handler.generate(active), /4,096 output-token limit \(4,096 reasoning tokens\)/);
assert.equal(social.mailDeliveries[active.messageId], undefined);
truncateMeaning = false;
await service.cancel(active.threadId, active.messageId);
console.log(
  "Personal mail: exact outbox, failed delivery, failed reply, local replay, read privacy and automatic delivery passed.",
);
