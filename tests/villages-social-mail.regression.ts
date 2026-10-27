import { sceneMemoryContext } from "../packages/villages/src/server/domain/rules/scene-memories.js";
import { createLiveMemory } from "../packages/villages/src/server/features/residents/live-memory-service.js";
import {
  correctVillageMemory,
  forgetVillageMemory,
} from "../packages/villages/src/server/domain/rules/village-memories.js";
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
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
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
let backgroundStatuses: any[] = [];
let calls = 0,
  failMeaning = false,
  failReplyWrite = false,
  failCleanup = false,
  truncateMeaning = false,
  sourceOnlyReply = false;
let failFirstIncoming = false;
let failNativeWrite = "";
let failMemoryWrite = false;
let failAdmission = false;
let failInputRead = false;
let changeBeforeReply = false;
let conflictClaimId = "";
let conflictRetirementId = "";
let competeAtReply: (() => void) | undefined;
const authorityGate = createVillageRepository(() => ({}) as any);
const retries: string[] = [];
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
const promptHistory: string[] = [];
const service = createSocialMail({
  withVillageSceneAcceptance: async (work: any) => authorityGate.withAuthorityLock!(async () => work(await snapshot())),
  processLiveMemories: async (scene: any, id: string, evidence: any, incarnations: any) => {
    if (failNativeWrite === (scene.lines.length === 1 ? "source" : "reply")) {
      failNativeWrite = "";
      throw Error("Native Memory storage unavailable");
    }
    return createLiveMemory({
      mutateVillageState: async (fn: any) => {
        fn(village);
        return snapshot();
      },
    } as any).processLiveMemories(scene, id, evidence, incarnations);
  },
  readVillageSnapshot: snapshot,
  readRelationshipState: async () => {
    if (failInputRead) {
      failInputRead = false;
      throw Error("Input storage unavailable");
    }
    return structuredClone(social);
  },
  mutateRelationships: async (_seed: string, mutate: (state: RelationshipState) => void) => {
    if (
      changeBeforeReply &&
      active &&
      social.mailDeliveries[active.messageId] &&
      !social.mailDeliveries[active.messageId + ":reply"]
    ) {
      changeBeforeReply = false;
      village.villagers[0]!.cardSnapshot.capturedAt = "card-during-reply";
      const source = social.mailThreads[active.threadId]!.messages.find((row) => row.id === active.messageId)!;
      source.replyUnavailable = true;
      source.replyStatus = "complete";
    }
    let next = structuredClone(social);
    await mutate(next);
    if (
      conflictRetirementId &&
      Object.values(next.mailThreads).some((thread) =>
        thread.messages.some((message) => message.id === conflictRetirementId && message.status === "cancelled"),
      )
    ) {
      const id = conflictRetirementId;
      conflictRetirementId = "";
      social.mailDeliveries[id] = { messageId: id, sourceHash: "concurrent-receipt", at: new Date().toISOString() };
      next = structuredClone(social);
      await mutate(next);
    }
    if (
      competeAtReply &&
      active &&
      !social.mailDeliveries[active.messageId + ":reply"] &&
      next.mailDeliveries[active.messageId + ":reply"]
    ) {
      competeAtReply();
      competeAtReply = undefined;
      await Promise.resolve();
      assert.equal(
        village.villagers[0]!.cardSnapshot.capturedAt,
        active.incarnation,
        "A concurrent resident update cannot pass the authority gate before the reply commits",
      );
    }
    if (
      failReplyWrite &&
      Object.values(next.mailThreads).some((thread) =>
        thread.messages.some((message) => message.fromId === "ada" && message.replyTo),
      )
    ) {
      failReplyWrite = false;
      throw Error("Reply write unavailable");
    }
    if (failFirstIncoming && next.mailThreads["personal:bea"] && !social.mailThreads["personal:bea"]) {
      failFirstIncoming = false;
      throw Error("Incoming thread write unavailable");
    }
    social = next;
    return structuredClone(social);
  },
  mutateVillageState: async (mutate: any) => {
    let next = { ...structuredClone(village), relationshipContext: structuredClone(social) };
    mutate(next);
    if (conflictClaimId && next.socialMailOutbox?.some((row: any) => row.id === conflictClaimId && row.retryClaim)) {
      const id = conflictClaimId;
      conflictClaimId = "";
      village.socialMailOutbox = village.socialMailOutbox?.filter((row) => row.id !== id);
      next = { ...structuredClone(village), relationshipContext: structuredClone(social) };
      mutate(next);
    }
    if (failMemoryWrite && next.memories.records.length > village.memories.records.length) {
      failMemoryWrite = false;
      throw Error("Memory publication unavailable");
    }
    if (failCleanup && (next.socialMailOutbox?.length ?? 0) < (village.socialMailOutbox?.length ?? 0)) {
      failCleanup = false;
      throw Error("Final cleanup unavailable");
    }
    delete next.relationshipContext;
    Object.assign(village, next);
    return snapshot();
  },
  queueBackgroundJob: async (job: any) => {
    if (failAdmission) {
      failAdmission = false;
      throw Error("Admission unavailable");
    }
    if (!queued.some((row) => row.subjectId === job.subjectId && row.revision === job.revision))
      queued.push(structuredClone(job));
  },
  retryBackgroundJob: async (id: string) => {
    retries.push(id);
    const job = backgroundStatuses.find((row) => row.id === id);
    if (job) job.status = "queued";
  },
  backgroundWorkSummaries: async () => backgroundStatuses,
  villagesConnectionIdFor: async (role: string) => role,
  villagesLanguageModels: () => ({
    resolveForRequest: async ({ connectionId }: any) => ({
      connectionId,
      model: "fixture",
      maxOutputTokens: 4096,
      fitContext: (messages: any, options: any) => ({ messages, ...options, estimatedTokensBefore: 13000 }),
      chatComplete: () => assert.fail("Real providers forbidden"),
    }),
  }),
  completeWithRoom: async (model: any, messages: any[], _maxTokens: number, options: any) => {
    promptHistory.push(JSON.stringify([model.connectionId, messages]));
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
        replyMemoryChanges: active.sourceText.startsWith("MEMORY:")
          ? [
              {
                action: "create",
                kind: "information",
                text: "Ada wants to stay friends.",
                subjects: ["ada"],
                learners: {
                  ada: {
                    basis: "report",
                    attributedTo: "ada",
                    support: [{ lineId: active.messageId + ":reply", excerpt: "I'd like to stay friends." }],
                  },
                },
                screening: {
                  disposition: "clear",
                  protectedRoots: [],
                  fingerprint: active.systemMemory!.saved.protection.fingerprint,
                },
              },
            ]
          : [],
        sourceMemoryChanges: active.sourceText.startsWith("MEMORY:")
          ? [
              {
                action: "create",
                kind: "information",
                text: "The player collects amber fossils.",
                subjects: ["player"],
                learners: {
                  ada: {
                    basis: "report",
                    attributedTo: "player",
                    support: [{ lineId: active.messageId, excerpt: active.sourceText }],
                  },
                },
                screening: {
                  disposition: "clear",
                  protectedRoots: [],
                  fingerprint: active.systemMemory!.saved.protection.fingerprint,
                },
              },
            ]
          : [],
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
// Isolate synthetic cases without pretending that sent letters can be cancelled.
function resetFixtureWork(input: SocialMailInput) {
  const thread = social.mailThreads[input.threadId];
  if (thread) thread.messages = thread.messages.filter((message) => message.id !== input.messageId);
  village.socialMailOutbox = village.socialMailOutbox?.filter((entry) => entry.id !== input.messageId);
  backgroundStatuses = [];
}
assert.equal("cancel" in service, false, "Sent letters cannot be cancelled");
await service.readMailbox();
assert.equal(calls, 0);
failAdmission = true;
await assert.rejects(
  () => service.send({ residentId: "ada", requestId: "admission", text: "A saved letter." }),
  /Admission unavailable/,
);
const admissionView = await service.readMailbox();
assert.equal(admissionView.threads[0]!.messages[0]!.retryAvailable, true, "A known admission failure is recoverable");
await service.retry("personal:ada", "personal:ada:admission", "admission-retry");
assert.equal(queued.at(-1).input.sourceText, "A saved letter.");
assert.equal((await service.readMailbox()).threads[0]!.messages[0]!.retryAvailable, false);
resetFixtureWork(queued.at(-1).input);
failInputRead = true;
await assert.rejects(
  () => service.send({ residentId: "ada", requestId: "input-read", text: "Retain this letter." }),
  /Input storage unavailable/,
);
assert.equal(
  (await service.readMailbox()).threads[0]!.messages[0]!.retryAvailable,
  true,
  "A failed input read is recoverable",
);
await service.retry("personal:ada", "personal:ada:input-read", "input-retry");
assert.equal(queued.at(-1).input.sourceText, "Retain this letter.");
resetFixtureWork(queued.at(-1).input);
await service.send({ residentId: "ada", requestId: "one", text: "Hello\n  exact text" });
assert.equal(calls, 0, "Sending first saves exact pending text before dispatch");
active = queued.at(-1).input;
const initialCalls = calls,
  initialPrompts = promptHistory.length;
await service.handler.generate(active);
await new Promise((resolve) => setTimeout(resolve, 25));
await service.handler.generate(active);
assert.deepEqual(
  promptHistory.slice(initialPrompts, initialPrompts + 2),
  promptHistory.slice(initialPrompts + 2),
  "A later retry must reuse identical admitted prompts so purchased responses remain replayable",
);
calls = initialCalls;
assert.equal(social.mailThreads["personal:ada"]!.messages[0]!.text, "Hello\n  exact text");
await service.send({ residentId: "ada", requestId: "one", text: "Hello\n  exact text" });
assert.equal(social.mailThreads["personal:ada"]!.messages.length, 1);
failMeaning = true;
active = queued.at(-1).input;
await assert.rejects(() => service.handler.generate(active), /Meaning provider unavailable/);
assert.equal(social.mailDeliveries[active.messageId], undefined);
await service.handler.afterFailure!(active);
for (const status of ["queued", "running", "paused"]) {
  backgroundStatuses = [{ id: "mail-job", kind: "personal-mail", subjectId: active.messageId, status, attempt: 1 }];
  assert.equal((await service.readMailbox()).threads[0]!.messages[0]!.retryAvailable, false, status);
  await assert.rejects(() => service.retry(active.threadId, active.messageId, "not-failed"), /already being processed/);
}
backgroundStatuses = [
  { id: "mail-job", kind: "personal-mail", subjectId: active.messageId, status: "failed", attempt: 1 },
];
assert.equal((await service.readMailbox()).threads[0]!.messages[0]!.retryAvailable, true);
await service.retry(active.threadId, active.messageId, "failed-retry");
assert.deepEqual(retries, ["mail-job"]);
assert.equal(
  (await service.readMailbox()).threads[0]!.messages[0]!.retryAvailable,
  false,
  "Retry is hidden while work runs",
);
backgroundStatuses = [];
await assert.rejects(() => service.retry(active.threadId, active.messageId, "not-failed"), /no failed processing/);
resetFixtureWork(active);
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
assert.equal(
  village.memories.records.filter((r) => !!r.knowers.player).length,
  0,
  "Unread mail has not added notebook knowledge",
);
failMemoryWrite = true;
await assert.rejects(
  () => service.readLetter(active.threadId, active.messageId + ":reply"),
  /Memory publication unavailable/,
);
assert.equal(
  social.mailThreads[active.threadId]!.messages.find((m) => m.id === active.messageId + ":reply")!.readAt,
  undefined,
  "A lost Memory write never marks mail read",
);
await service.readLetter(active.threadId, active.messageId + ":reply");
await service.readLetter(active.threadId, active.messageId + ":reply");
assert.equal(village.memories.records.filter((r) => !!r.knowers.player).length, 1);
assert.equal(calls, beforeRetryCalls, "Reading and polling buy no model calls");
await assert.rejects(
  () => service.send({ residentId: "ada", requestId: "two", text: "Changed source" }),
  /different message/,
);

// A first incoming letter retains its replay control when its thread write fails.
village.villagers.push({
  characterId: "bea",
  cardSnapshot: { name: "Bea", capturedAt: "bea-card" },
  completedWishes: [],
} as any);
const firstIncoming = service.automaticOutbox(
  await snapshot(),
  social,
  { senderId: "bea", text: "Hello from Bea.", relationshipReview: emptyRelationshipReview() },
  "first-incoming",
  new Date().toISOString(),
);
village.socialMailOutbox = [firstIncoming];
failFirstIncoming = true;
await service.processOutbox(await snapshot());
assert.equal(social.mailThreads["personal:bea"], undefined);
assert((await service.readMailbox()).recovery?.some((row) => row.messageId === firstIncoming.id));
await service.retry(firstIncoming.input.threadId, firstIncoming.id, "replay-first-incoming");
assert(social.mailDeliveries[firstIncoming.id]);
assert.equal(village.socialMailOutbox?.length, 0);

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
assert.equal(village.memories.records.filter((r) => !!r.knowers.player).length, 1);
const anotherLetter = service.automaticOutbox(
  await snapshot(),
  social,
  { senderId: "ada", text: "Another separate letter.", relationshipReview: emptyRelationshipReview() },
  "another-opportunity",
  new Date().toISOString(),
);
village.socialMailOutbox = [anotherLetter];
await service.processOutbox(await snapshot());
await service.readLetter("personal:ada", "opportunity:mail");
assert.equal(village.memories.records.filter((r) => !!r.knowers.player).length, 2);
assert.equal(
  social.mailThreads["personal:ada"]!.messages.find((m) => m.id === "opportunity:mail")!.readAt !== undefined,
  true,
);
assert.equal(
  social.mailThreads["personal:ada"]!.messages.find((m) => m.id === "another-opportunity:mail")!.readAt,
  undefined,
  "Reading one letter leaves the other unread",
);
await assert.rejects(() => service.readLetter("personal:ada", "not-a-letter"), /unavailable/);
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
resetFixtureWork(active);

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
assert(
  !JSON.stringify(heldView).includes("A private proposal."),
  "Recovery never exposes an undelivered resident message",
);
const heldSource = social.mailThreads[held.input.threadId]!.messages.find((row) => row.id === held.id)!;
const sourceFingerprint = heldSource.sourceHash;
const beforeClaimConflict = queued.length;
const savedHeld = structuredClone(village.socialMailOutbox);
conflictClaimId = held.id;
await service.retry(held.input.threadId, held.id, "conflicted-claim");
assert.equal(queued.length, beforeClaimConflict, "A lost CAS claim cannot dispatch a model request");
village.socialMailOutbox = savedHeld;
const queueBeforeReinterpret = queued.length;
await Promise.all([
  service.retry(held.input.threadId, held.id, "fresh-meaning"),
  service.retry(held.input.threadId, held.id, "another-attempt"),
]);
assert.equal(queued.length, queueBeforeReinterpret + 1, "Concurrent retries share one generation identity");
assert.equal(queued.at(-1).input.sourceHash, sourceFingerprint);
assert.equal(queued.at(-1).input.retainedReply, "", "Resident-source retry never starts a reply chain");
village.villagers[0]!.cardSnapshot.capturedAt = "card-2";
const retiredHeld = await service.readMailbox();
assert(
  !retiredHeld.recovery?.some((row) => row.messageId === held.id),
  "A stale failed incoming letter retires without a retry",
);
assert.equal(social.mailDeliveries[held.id], undefined);

// A changed correspondent cannot deliver an unseen incoming letter.
const obsolete = service.automaticOutbox(
  await snapshot(),
  social,
  { senderId: "ada", text: "Obsolete private message.", relationshipReview: emptyRelationshipReview() },
  "obsolete",
  new Date().toISOString(),
);
village.socialMailOutbox = [obsolete];
village.villagers[0]!.cardSnapshot.capturedAt = "card-3";
await service.processOutbox(await snapshot());
const obsoleteView = await service.readMailbox();
assert.equal(obsoleteView.recovery?.length, 0);
assert(!JSON.stringify(obsoleteView).includes("Obsolete private message."));
assert.equal(village.socialMailOutbox?.length, 0);
assert.equal(social.mailDeliveries[obsolete.id], undefined);
assert.equal(
  social.mailThreads[obsolete.input.threadId]!.messages.find((message) => message.id === obsolete.id)!.status,
  "cancelled",
);
resetFixtureWork(obsolete.input);
const casIncoming = service.automaticOutbox(
  await snapshot(),
  social,
  { senderId: "ada", text: "A letter with a concurrent receipt.", relationshipReview: emptyRelationshipReview() },
  "cas-incoming",
  new Date().toISOString(),
);
village.socialMailOutbox = [casIncoming];
village.villagers[0]!.cardSnapshot.capturedAt = "card-after-cas";
conflictRetirementId = casIncoming.id;
await service.processOutbox(await snapshot());
assert(social.mailDeliveries[casIncoming.id], "The concurrent delivery receipt is retained");
assert(
  village.socialMailOutbox?.some((row) => row.id === casIncoming.id),
  "A lost retirement CAS cannot discard saved work",
);
await service.readMailbox();
assert.equal(village.socialMailOutbox?.length, 0, "Delivered work can finish local recovery afterwards");
// Keep truncation independent of the deliberately retained applying source above.
social = defaultRelationshipState(village.seed);
social.reviewedActorIds = ["ada"];
await service.send({ residentId: "ada", requestId: "changed-card", text: "Keep my sent words." });
active = queued.at(-1).input;
const oldCardResult = await service.handler.generate(active);
service.handler.apply(village, active, oldCardResult, { retrying: false });
village.villagers[0]!.cardSnapshot.capturedAt = "card-4";
await service.processOutbox(await snapshot());
let terminal = (await service.readMailbox()).threads[0]!.messages.find((row) => row.id === active.messageId)!;
assert.equal(terminal.status, "undeliverable");
assert.equal(terminal.text, "Keep my sent words.");
assert.equal(terminal.retryAvailable, false);
backgroundStatuses = [
  { id: "stale-failed", kind: "personal-mail", subjectId: active.messageId, status: "failed", attempt: 1 },
];
assert.equal(
  (await service.readMailbox()).threads[0]!.messages.find((row) => row.id === active.messageId)!.retryAvailable,
  false,
);
await assert.rejects(() => service.retry(active.threadId, active.messageId, "stale-retry"), /no longer be delivered/);
backgroundStatuses = [];
assert.equal(village.socialMailOutbox?.length, 0);
await service.send({ residentId: "ada", requestId: "new-card", text: "A new letter." });
resetFixtureWork(queued.at(-1).input);
await service.send({ residentId: "ada", requestId: "partial-card", text: "Already delivered." });
failReplyWrite = true;
await generateAndSave();
const partial = active;
const partialReceipt = structuredClone(social.mailDeliveries[partial.messageId]);
village.villagers[0]!.cardSnapshot.capturedAt = "card-5";
backgroundStatuses = [
  { id: "stale-partial", kind: "personal-mail", subjectId: partial.messageId, status: "failed", attempt: 1 },
];
terminal = (await service.readMailbox()).threads[0]!.messages.find((row) => row.id === partial.messageId)!;
assert.deepEqual(
  social.mailDeliveries[partial.messageId],
  partialReceipt,
  "An already delivered source keeps its receipt",
);
assert.equal(terminal.replyPending, false);
assert.equal(terminal.retryAvailable, false);
await assert.rejects(
  () => service.retry(partial.threadId, partial.messageId, "partial-recovery"),
  /no longer be delivered/,
);
backgroundStatuses = [];
assert.equal(village.socialMailOutbox?.length, 0);
await service.send({ residentId: "ada", requestId: "after-partial", text: "Another letter." });
resetFixtureWork(queued.at(-1).input);
await service.send({ residentId: "ada", requestId: "reply-race", text: "Keep my delivered letter." });
changeBeforeReply = true;
await generateAndSave();
assert(social.mailDeliveries[active.messageId], "A delivered source keeps its receipt during reply retirement");
assert.equal(
  social.mailDeliveries[active.messageId + ":reply"],
  undefined,
  "A changed correspondent cannot deliver a late reply",
);
assert.equal(village.socialMailOutbox?.length, 0);
await service.send({ residentId: "ada", requestId: "authority-fence", text: "One more letter." });
const releaseCompeting = Promise.withResolvers<void>();
const concurrentChange = releaseCompeting.promise.then(() =>
  authorityGate.withAuthorityLock!(async () => {
    village.villagers[0]!.cardSnapshot.capturedAt = "card-after-reply";
  }),
);
competeAtReply = () => releaseCompeting.resolve();
await generateAndSave();
await concurrentChange;
assert(social.mailDeliveries[active.messageId + ":reply"], "The reply committed before the competing resident update");
social = defaultRelationshipState(village.seed);
social.reviewedActorIds = ["ada"];
await service.send({ residentId: "ada", requestId: "output-limit", text: "Please read this." });
active = queued.at(-1).input;
truncateMeaning = true;
await assert.rejects(() => service.handler.generate(active), /4,096 output-token limit \(4,096 reasoning tokens\)/);
assert.equal(social.mailDeliveries[active.messageId], undefined);
truncateMeaning = false;
resetFixtureWork(active);
const home = {
  id: "ada-home",
  name: "Ada's home",
  classes: ["residence"],
  residentIds: ["ada"],
  workerIds: [],
  occupancy: { playerHome: false, residentCharacterId: "ada", homeKind: null },
  zones: [
    { ...defaultVenueSpace("residence", "Living room"), id: "living", kind: "shared-residence", name: "Living room" },
  ],
} as any;
initializeVenueAccess(home);
village.venues = [home];
await service.send({ residentId: "ada", requestId: "no-mail-access", text: "Come into my room." });
active = queued.at(-1).input;
const saved = await service.handler.generate(active);
saved.source.permissions.push({
  id: "unexpected-permission",
  controllerId: "ada",
  visitorId: "player",
  venueId: home.id,
  zoneId: "living",
  action: "grant",
  lineIds: [active.messageId],
});
const terms = {
  id: "unexpected-commitment",
  revision: 1,
  kind: "commitment",
  text: "Meet tomorrow",
  participants: ["ada", "player"],
  status: "accepted",
  evidenceIds: [active.messageId],
} as const;
saved.source.changes[0]!.sceneAfter.records.push(terms as any);
saved.source.changes[0]!.liveAfter.records.push(terms as any);
service.handler.apply(village, active, saved, { retrying: false });
await service.processOutbox(await snapshot());
assert.equal(village.venues[0]!.access!.permissions.length, 0, "Retained mail cannot grant access");
assert.equal(social.sharedRecords[terms.id], undefined, "Retained mail cannot create a commitment");
const afterFenceCalls = calls;
await service.send({ residentId: "ada", requestId: "obsolete-source", text: "Please try again." });
const obsoleteInput = queued.at(-1).input as SocialMailInput;
backgroundStatuses = [
  { id: "obsolete-job", kind: "personal-mail", subjectId: obsoleteInput.messageId, status: "obsolete", attempt: 1 },
];
assert.equal(
  (await service.readMailbox()).threads[0]!.messages.find((row) => row.id === obsoleteInput.messageId)!.retryAvailable,
  false,
);
await assert.rejects(
  () => service.retry(obsoleteInput.threadId, obsoleteInput.messageId, "new-admission"),
  /no failed processing/,
);
assert.equal(calls, afterFenceCalls, "Obsolete work cannot dispatch a new request");
resetFixtureWork(obsoleteInput);
await service.send({ residentId: "ada", requestId: "native-learning", text: "MEMORY: I collect amber fossils." });
failNativeWrite = "source";
await generateAndSave();
const nativeSource = active;
const recovery = (await service.readMailbox()).recovery!.find((r) => r.messageId === nativeSource.messageId)!;
assert(recovery && !recovery.reinterpretRequired, "Delivered-source Memory failures expose local replay");
assert(social.mailDeliveries[nativeSource.messageId]);
const paidBeforeReplay = calls;
failNativeWrite = "reply";
await service.retry(nativeSource.threadId, nativeSource.messageId, "native-replay-source");
assert(
  (await service.readMailbox()).recovery!.some((r) => r.messageId === nativeSource.messageId),
  "Reply Memory failures remain recoverable after reply delivery",
);
assert(social.mailDeliveries[nativeSource.messageId + ":reply"]);
await service.retry(nativeSource.threadId, nativeSource.messageId, "native-replay-reply");
assert.equal(calls, paidBeforeReplay);
const native = village.memories.records.find((row) => row.text === "The player collects amber fossils.")!;
assert(native?.knowers.ada, "Delivery teaches the actual resident through native Memory in the existing System call");
assert.equal(native.knowers.player, undefined, "Resident Memory application never teaches the player early");
correctVillageMemory(
  village,
  {
    operationId: "mail-correct",
    action: "repair",
    expectedCollectionRevision: village.memories.revision,
    target: { id: native.id, revision: native.revision, rootRevision: native.revision },
    knowers: ["ada"],
    text: "The player collects silver fossils.",
  },
  new Date().toISOString(),
);
await service.send({ residentId: "ada", requestId: "native-recall", text: "What do you remember about my fossils?" });
const frozen = queued.at(-1).input as SocialMailInput;
assert(frozen.narrationMemories!.includes("silver fossils"));
assert(
  !frozen.narrationMemories!.includes("amber fossils"),
  "Repaired prior prose never comes back from the thread ledger",
);
const repaired = village.memories.records.find((row) => row.id === native.id)!;
forgetVillageMemory(
  village,
  {
    operationId: "mail-forget",
    action: "forget",
    expectedCollectionRevision: village.memories.revision,
    target: { id: repaired.id, revision: repaired.revision, rootRevision: repaired.revision },
    knowers: ["ada"],
  },
  new Date().toISOString(),
);
assert(frozen.narrationMemories!.includes("silver fossils"), "An admitted request retains its frozen recall on replay");
resetFixtureWork(frozen);
await service.send({
  residentId: "ada",
  requestId: "native-forgotten",
  text: "What do you remember about my fossils?",
});
assert(!queued.at(-1).input.narrationMemories.includes("silver fossils"));
resetFixtureWork(queued.at(-1).input);
await service.send({ residentId: "ada", requestId: "delivered-memory", text: "MEMORY: I collect amber fossils." });
failNativeWrite = "reply";
await generateAndSave();
const completeSource = active;
const completeReceipts = structuredClone([
  social.mailDeliveries[completeSource.messageId],
  social.mailDeliveries[completeSource.messageId + ":reply"],
]);
assert(village.socialMailOutbox?.[0]?.error, "A delivered reply can retain failed optional learning");
const callsBeforeLocalRecovery = calls;
village.villagers[0]!.cardSnapshot.capturedAt = "new-after-delivery";
await service.readMailbox();
assert.deepEqual(
  [social.mailDeliveries[completeSource.messageId], social.mailDeliveries[completeSource.messageId + ":reply"]],
  completeReceipts,
);
assert.equal(village.socialMailOutbox?.length, 0);
assert.equal(calls, callsBeforeLocalRecovery, "A changed correspondent only replays local optional learning");
const messageText = "I remember the hidden observatory.";
const capturedMemory = sceneMemoryContext(village, ["ada"], messageText);
const obsoleteNative = service.automaticOutbox(
  await snapshot(),
  social,
  {
    senderId: "ada",
    text: messageText,
    relationshipReview: emptyRelationshipReview(),
    memoryChanges: [
      {
        action: "create",
        kind: "information",
        text: "OLD INCARNATION ONLY",
        subjects: ["ada"],
        learners: { ada: { basis: "report", attributedTo: "ada", support: [{ lineId: 0, excerpt: messageText }] } },
        screening: {
          disposition: "clear",
          protectedRoots: [],
          fingerprint: capturedMemory.saved.protection.fingerprint,
        },
      },
    ],
  },
  "obsolete-native",
  new Date().toISOString(),
  capturedMemory,
);
village.socialMailOutbox = [obsoleteNative];
failNativeWrite = "source";
await service.processOutbox(await snapshot());
assert(social.mailDeliveries[obsoleteNative.id]);
const deliveredOnce = structuredClone(social.mailDeliveries[obsoleteNative.id]);
village.villagers[0]!.cardSnapshot.capturedAt = "replacement";
await service.readMailbox();
assert.deepEqual(social.mailDeliveries[obsoleteNative.id], deliveredOnce);
assert(!village.memories.records.some((row) => row.text === "OLD INCARNATION ONLY"));
assert(
  Object.values(village.memoryReceipts).some((row) => /correspondent changed/.test(row.reason)),
  "A replaced correspondent rejects optional old learning locally",
);
assert.equal(village.socialMailOutbox!.length, 0, "Obsolete learning does not permanently block resident activity");
console.log(
  "Personal mail: exact outbox, failed delivery, failed reply, local replay, read privacy and automatic delivery passed.",
);
