import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { RelationshipState } from "../packages/villages/src/server/domain/models/relationship-types.js";
import type { SocialMailInput } from "../packages/villages/src/server/domain/models/social-mail.js";
import { emptyRelationshipReview } from "../packages/villages/src/server/domain/rules/relationship-review.js";
import {
  defaultRelationshipState,
  relationshipFor,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { sceneMemoryContext } from "../packages/villages/src/server/domain/rules/scene-memories.js";
import { knownSocialWishes } from "../packages/villages/src/server/domain/rules/social-wishes.js";
import {
  claimVisitPermission,
  evaluateZoneAccess,
  initializeVenueAccess,
} from "../packages/villages/src/server/domain/rules/venue-access.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  correctVillageMemory,
  forgetVillageMemory,
} from "../packages/villages/src/server/domain/rules/village-memories.js";
import { createLiveMemory } from "../packages/villages/src/server/features/residents/live-memory-service.js";
import { createSocialMail } from "../packages/villages/src/server/features/residents/social-mail-service.js";
const village = defaultVillageState();
village.seed = "mail";
village.foundedAt = new Date().toISOString();
village.villagers = [
  {
    characterId: "ada",
    cardSnapshot: { name: "Ada", capturedAt: "card-1", personality: "Candid" },
    wishes: [],
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
let failNativeWrite = "";
let afterSocialCommit: (() => Promise<void>) | undefined;
let failInvitationWrite = false,
  failMemoryWrite = false;
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
    const callback = afterSocialCommit;
    afterSocialCommit = undefined;
    if (callback) await callback();
    return structuredClone(social);
  },
  mutateVillageState: async (mutate: any) => {
    const next = { ...structuredClone(village), relationshipContext: structuredClone(social) };
    mutate(next);
    if (failMemoryWrite && next.memories.records.length > village.memories.records.length) {
      failMemoryWrite = false;
      throw Error("Memory publication unavailable");
    }
    if (failInvitationWrite && next.venues.some((venue) => venue.access?.permissions.length)) {
      failInvitationWrite = false;
      throw Error("Invitation permission storage unavailable");
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
    queued.push(structuredClone(job));
  },
  retryBackgroundJob: async () => assert.fail("No provider job recovery in this fixture"),
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
await service.readMailbox();
assert.equal(calls, 0);
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
assert.equal(
  village.memories.records.filter((r) => !!r.knowers.player).length,
  0,
  "Unread mail has not added notebook knowledge",
);
failMemoryWrite = true;
await assert.rejects(() => service.readThread(active.threadId), /Memory publication unavailable/);
assert.equal(
  social.mailThreads[active.threadId]!.messages.find((m) => m.id === active.messageId + ":reply")!.readAt,
  undefined,
  "A lost Memory write never marks mail read",
);
await service.readThread(active.threadId);
await service.readThread(active.threadId);
assert.equal(village.memories.records.filter((r) => !!r.knowers.player).length, 1);
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
assert.equal(village.memories.records.filter((r) => !!r.knowers.player).length, 1);
await service.readThread("personal:ada");
assert.equal(village.memories.records.filter((r) => !!r.knowers.player).length, 2);
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
const offer = (id: string, visitAccess?: { accompanied: boolean; outsideHours: boolean }) => {
  social.mailDeliveries[id] = { messageId: id, at: new Date().toISOString(), sourceHash: "source:" + id };
  social.invitations[id] = {
    id,
    threadId: "personal:ada",
    messageId: id,
    proposerId: "ada",
    participantIds: ["ada", "player"],
    revision: 1,
    terms: {
      title: "A visit",
      detail: "Come over for tea",
      venueId: home.id,
      zoneId: "living",
      ...(visitAccess ? { visitAccess } : {}),
    },
    status: "proposed",
  };
};
offer("meeting-only");
await service.respond("meeting-only", { expectedRevision: 1, accepted: true });
assert.equal(village.venues[0]!.access!.permissions.length, 0, "An old or general meeting invitation grants no access");
offer("hosted-visit", { accompanied: false, outsideHours: false });
failInvitationWrite = true;
await assert.rejects(service.respond("hosted-visit", { expectedRevision: 1, accepted: true }), /permission storage/);
assert.equal(
  social.invitations["hosted-visit"]!.status,
  "accepted",
  "The exact player decision survives a permission storage failure",
);
assert.equal(village.venues[0]!.access!.permissions.length, 0);
const beforeAccessRecovery = calls;
assert.equal(
  (await service.readMailbox()).invitations.find((row) => row.id === "hosted-visit")?.accessRecovery?.expectedRevision,
  1,
  "A refreshed Mailbox exposes local access recovery",
);
await service.respond("hosted-visit", { expectedRevision: 1, accepted: true });
await service.respond("hosted-visit", { expectedRevision: 1, accepted: true });
let currentHome = village.venues[0]!;
assert.equal(currentHome.access!.permissions.length, 1);
const permission = currentHome.access!.permissions[0]!;
assert.equal(permission.duration, "visit");
assert.deepEqual(permission.sourceLineIds, ["hosted-visit", "hosted-visit:accept"]);
assert.equal(
  evaluateZoneAccess(currentHome, currentHome.zones![0]!, "player", { sceneId: "one", accepting: true }).allowed,
  true,
);
claimVisitPermission(currentHome, permission.id, "one");
assert.equal(
  evaluateZoneAccess(currentHome, currentHome.zones![0]!, "player", { sceneId: "two", accepting: true }).allowed,
  false,
);
permission.revoked = true;
await service.respond("hosted-visit", { expectedRevision: 1, accepted: true });
assert.equal(
  village.venues[0]!.access!.permissions[0]!.revoked,
  true,
  "Replaying acceptance cannot revive revoked access",
);
offer("escorted-visit", { accompanied: true, outsideHours: false });
await service.respond("escorted-visit", { expectedRevision: 1, accepted: true });
currentHome = village.venues[0]!;
assert.equal(
  evaluateZoneAccess(currentHome, currentHome.zones![0]!, "player", { sceneId: "two", accepting: true }).reason,
  "accompaniment-required",
);
currentHome.access!.visitorHours = [{ days: ["Monday"], start: "09:00", end: "17:00" }];
assert.equal(
  evaluateZoneAccess(currentHome, currentHome.zones![0]!, "player", {
    at: new Date("2026-10-25T00:00:00Z"),
    sceneId: "two",
    accepting: true,
  }).reason,
  "outside-hours",
);
currentHome.access!.visitorHours = null;
currentHome.access!.bans.push({
  id: "ban",
  zoneId: "living",
  visitorId: "player",
  issuerId: "ada",
  active: true,
  issuedAt: new Date().toISOString(),
  sourceLineIds: [],
});
assert.equal(
  evaluateZoneAccess(currentHome, currentHome.zones![0]!, "player", {
    sceneId: "two",
    accepting: true,
    positions: { ada: "living" },
  }).reason,
  "banned",
);
offer("lost-authority", { accompanied: false, outsideHours: false });
currentHome.zones![0]!.access!.managerIds = ["player"];
currentHome.zones![0]!.access!.memberRoles = [];
await service.respond("lost-authority", { expectedRevision: 1, accepted: true });
assert.equal(village.venues[0]!.access!.permissions.length, 2);
assert.equal(village.venues[0]!.access!.receipts["lost-authority:accept:visit"]?.outcome, "rejected");
village.venues[0]!.zones![0]!.access!.managerIds = ["ada"];
await service.respond("lost-authority", { expectedRevision: 1, accepted: true });
assert.equal(
  village.venues[0]!.access!.permissions.length,
  2,
  "Restored authority cannot revive a rejected invitation",
);
for (const status of ["cancelled", "fulfilled"] as const) {
  offer(status, { accompanied: false, outsideHours: false });
  failInvitationWrite = true;
  await assert.rejects(service.respond(status, { expectedRevision: 1, accepted: true }), /permission storage/);
  social.sharedRecords[status]!.status = status;
  await service.respond(status, { expectedRevision: 1, accepted: true });
  assert.equal(village.venues[0]!.access!.receipts[status + ":accept:visit"]?.outcome, "rejected");
  social.sharedRecords[status]!.status = "accepted";
  await service.respond(status, { expectedRevision: 1, accepted: true });
  assert.equal(village.venues[0]!.access!.permissions.length, 2, "An inactive commitment cannot later recreate access");
}
offer("changed-policy", { accompanied: false, outsideHours: false });
failInvitationWrite = true;
await assert.rejects(service.respond("changed-policy", { expectedRevision: 1, accepted: true }), /permission storage/);
village.venues[0]!.access!.changes.push({
  id: "later-policy",
  revision: 3,
  actorId: "ada",
  zoneId: "living",
  action: "zone-policy",
  at: new Date(Date.now() + 1000).toISOString(),
  sourceLineIds: [],
});
await service.respond("changed-policy", { expectedRevision: 1, accepted: true });
assert.equal(village.venues[0]!.access!.receipts["changed-policy:accept:visit"]?.outcome, "rejected");
assert.equal(
  village.venues[0]!.access!.permissions.length,
  2,
  "Later policy changes fence delayed access even when current host authority is restored",
);
assert.equal(calls, beforeAccessRecovery, "Invitation acceptance and recovery dispatch no model requests");
await service.send({ residentId: "ada", requestId: "obsolete-source", text: "Please try again." });
const obsoleteInput = queued.at(-1).input as SocialMailInput;
backgroundStatuses = [
  { id: "obsolete-job", kind: "personal-mail", subjectId: obsoleteInput.messageId, status: "obsolete", attempt: 1 },
];
await service.retry(obsoleteInput.threadId, obsoleteInput.messageId, "new-admission");
assert.equal(
  queued.at(-1).revision,
  obsoleteInput.sourceHash + ":new-admission",
  "Deliberate recovery admits an obsolete pending source under a new revision",
);
assert.equal(
  queued.at(-1).input.sourceText,
  obsoleteInput.sourceText,
  "Re-admission preserves the exact unsent source",
);
assert.equal(calls, beforeAccessRecovery, "Re-admission only queues deliberate work");
await service.cancel(obsoleteInput.threadId, obsoleteInput.messageId);
await service.send({ residentId: "ada", requestId: "native-learning", text: "MEMORY: I collect amber fossils." });
failNativeWrite = "source";
await generateAndSave();
const nativeSource = active;
const recovery = (await service.readMailbox()).recovery!.find((r) => r.messageId === nativeSource.messageId)!;
assert(
  recovery && !recovery.cancellable && !recovery.reinterpretRequired,
  "Delivered-source Memory failures expose local replay",
);
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
await service.cancel(frozen.threadId, frozen.messageId);
await service.send({
  residentId: "ada",
  requestId: "native-forgotten",
  text: "What do you remember about my fossils?",
});
assert(!queued.at(-1).input.narrationMemories.includes("silver fossils"));
await service.cancel(queued.at(-1).input.threadId, queued.at(-1).input.messageId);
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
await service.retry(obsoleteNative.input.threadId, obsoleteNative.id, "obsolete-native-local");
assert.deepEqual(social.mailDeliveries[obsoleteNative.id], deliveredOnce);
assert(!village.memories.records.some((row) => row.text === "OLD INCARNATION ONLY"));
assert(
  Object.values(village.memoryReceipts).some((row) => /correspondent changed/.test(row.reason)),
  "A replaced correspondent rejects optional old learning locally",
);
assert.equal(village.socialMailOutbox!.length, 0, "Obsolete learning does not permanently block resident activity");

// Reading after delivery but before Wish facts attach must converge without another model call.
for (const failPublication of [false, true]) {
  const id = failPublication ? "wish-race-recovery" : "wish-race";
  const words = "I would like to talk about the river " + id + ".";
  const entry = service.automaticOutbox(
    await snapshot(),
    social,
    {
      senderId: "ada",
      text: words,
      relationshipReview: emptyRelationshipReview(),
      wishChanges: [
        {
          actorId: "ada",
          wishId: "new:" + id,
          intent: "create",
          desire: { wish: "Talk about the river " + id, reason: "Ada wants company." },
          quote: words,
          evidence: [0],
          reason: "Ada communicates this current desire.",
        },
      ],
    },
    id,
    new Date().toISOString(),
  );
  village.socialMailOutbox = [entry];
  let readAt = "";
  let reading: Promise<unknown> | undefined;
  afterSocialCommit = async function onDelivered() {
    if (!social.mailDeliveries[entry.id]) {
      afterSocialCommit = onDelivered;
      return;
    }
    reading = service.readThread(entry.input.threadId);
    for (
      let i = 0;
      i < 30 && !social.mailThreads[entry.input.threadId].messages.find((m) => m.id === entry.id)?.readAt;
      i++
    )
      await new Promise((resolve) => setImmediate(resolve));
    readAt = social.mailThreads[entry.input.threadId].messages.find((m) => m.id === entry.id)!.readAt!;
    assert.equal(
      knownSocialWishes(village, "ada").some((w) => w.text === words),
      false,
      "Undelivered facts have no player knowledge",
    );
    if (failPublication) {
      afterSocialCommit = async () => {
        failMemoryWrite = true;
      };
    }
  };
  const before = calls;
  await service.processOutbox(await snapshot());
  if (failPublication) {
    assert(village.socialMailOutbox?.[0]?.error, "Failed publication retains local recovery");
    await service.retry(entry.input.threadId, entry.id, id + "-retry");
  }
  await reading;
  const known = knownSocialWishes(village, "ada").find((w) => w.text === words)!;
  assert(known, "A letter read during delivery still teaches its frozen disclosure");
  assert.equal(known.at, readAt);
  assert.equal(village.socialMailOutbox?.length, 0);
  assert.equal(calls, before, "Publication and recovery are provider-free");
}

console.log(
  "Personal mail: exact outbox, failed delivery, failed reply, local replay, read privacy and automatic delivery passed.",
);
