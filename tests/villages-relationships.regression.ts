import assert from "node:assert/strict";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type {
  RelationshipEvidenceLine,
  RelationshipUpdate,
  SocialRecord,
} from "../packages/villages/src/server/domain/models/relationship-types.js";
import {
  eventAttemptAvailable,
  reserveEventAttempt,
} from "../packages/villages/src/server/domain/rules/event-attempts.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { projectRelationshipProfiles } from "../packages/villages/src/server/domain/rules/relationship-knowledge.js";
import { publishRelationshipDisclosures } from "../packages/villages/src/server/domain/rules/relationship-memories.js";
import {
  relationshipChangeNotices,
  relationshipWritingPrompt,
} from "../packages/villages/src/server/domain/rules/relationship-presentation.js";
import {
  emptyRelationshipReview,
  parseRelationshipReview,
  parseRelationshipProposals,
} from "../packages/villages/src/server/domain/rules/relationship-review.js";
import {
  applyRelationshipReview,
  coerceRelationshipState,
  defaultRelationshipState,
  neutralRelationship,
  reconcileRelationships,
  relationshipFor,
  relationshipKey,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import {
  beginMailDelivery,
  completeMailDelivery,
  queuePersonalMessage,
  readPersonalThread,
} from "../packages/villages/src/server/domain/rules/social-mail.js";
import { startVillagesApplication } from "../packages/villages/src/server/entry/application.js";
import { createRelationships } from "../packages/villages/src/server/features/residents/relationship-service.js";

const village = defaultVillageState();
village.seed = "social-v2";
village.foundedAt = "2026-10-22T10:00:00.000Z";
village.villagers = ["ada", "ben", "cy"].map((id) => ({
  characterId: id,
  cardSnapshot: { name: id },
  wishes: [],
})) as any;
village.relationshipContext = defaultRelationshipState(village.seed);
const state = village.relationshipContext;
const lines: RelationshipEvidenceLine[] = [
  {
    id: "p",
    speakerId: "player",
    role: "user",
    content: "I accept meeting at noon tomorrow.",
    heardBy: ["ada", "ben"],
    playerHeard: true,
  },
  {
    id: "a",
    speakerId: "ada",
    role: "assistant",
    content: "I can meet you at noon tomorrow.",
    heardBy: ["ada", "ben"],
    playerHeard: true,
  },
  {
    id: "b",
    speakerId: "ben",
    role: "assistant",
    content: "I agree to those terms.",
    heardBy: ["ada", "ben"],
    playerHeard: true,
  },
];
const after = (connection: string, records: any[] = []): RelationshipUpdate => ({
  connection,
  stance: "Particular perspective",
  expectations: [],
  concerns: [],
  records,
});
const proposal = (connection: string, revision = 0) => ({
  fromId: "ada",
  toId: "player",
  expectedRevision: revision,
  sceneAfter: after(connection),
  liveAfter: after(connection),
  reason: "Witnessed choice",
  lineIds: ["p", "a"],
});
const review = (row: any, source = "source") =>
  parseRelationshipReview({ ...emptyRelationshipReview(), changes: [row] }, source, lines, village, true);
const descriptiveConnection = "Old friends rebuilding trust after a difficult conversation. ".repeat(3);
assert.equal(review(proposal(descriptiveConnection)).changes[0]?.liveAfter.connection, descriptiveConnection);
assert.throws(() => review(proposal("x".repeat(401))), /400/);

// Directionality and player agency. No score, decay, familiarity or invented player perspective.
const initial = review(proposal("Friends"));
applyRelationshipReview(state, initial, village, "source", village.foundedAt);
assert.equal(relationshipFor(state, "ada", "player").connection, "Friends");
assert.equal(relationshipFor(state, "ben", "ada").connection, "");
assert.equal(
  Object.values(state.edges).some((edge) => edge.fromId === "player"),
  false,
);
const saved = structuredClone(state);
reconcileRelationships(state, village, Date.parse("2036-10-22T10:00:00Z"));
assert.deepEqual(state, saved, "Ordinary absence changes no social state");
applyRelationshipReview(state, initial, village, "source", village.foundedAt);
assert.deepEqual(state, saved, "Source replay is idempotent");
assert.throws(() => review({ ...proposal("Friends"), fromId: "player" }), /actor/);
assert.throws(() => review({ ...proposal("Friends"), lineIds: ["missing"] }), /missing source/);
assert.throws(() => review({ ...proposal("Friends"), fromId: "cy" }), /audience/);
assert.equal(
  relationshipChangeNotices(Object.values(state.receipts), state, village).length,
  0,
  "Private interpretation produces no public notice",
);

// A unilateral ending needs no invented acceptance and does not erase earlier history.
const history: SocialRecord = {
  id: "family",
  revision: 1,
  kind: "history",
  text: "They grew up together.",
  participants: ["ada", "player"],
  status: "stated",
  evidenceIds: ["card"],
};
state.edges[relationshipKey("ada", "player")]!.records.family = history;
const ending = review(proposal("Former friends", 1), "ending");
applyRelationshipReview(state, ending, village, "ending", "2026-10-23T10:00:00Z");
assert.equal(relationshipFor(state, "ada", "player").records.family.text, history.text);
assert.equal(Object.keys(state.grants).length, 0, "Relationships never create access permission");

// Stale live context fails before any sibling effect or disclosure can commit.
const stale = review(proposal("Friends", 1), "stale");
stale.disclosures.push({
  id: "leak",
  fromId: "ada",
  toId: "player",
  text: "Unpublished",
  kind: "connection",
  lineIds: ["a"],
});
const beforeStale = structuredClone(state);
assert.throws(
  () => applyRelationshipReview(state, stale, village, "stale", "2026-10-24T10:00:00Z"),
  /live relationship changed/,
);
assert.deepEqual(state, beforeStale);

// The old Scene stays in its own timeline while the live settlement preserves a later ending.
const scene: any = {
  id: "scene",
  villageSeed: village.seed,
  startedAt: village.foundedAt,
  lines: [],
  submissions: [],
  activeIds: ["ada"],
  sceneAttendance: { capturedAt: village.foundedAt },
};
const captured = structuredClone(village);
captured.relationshipContext!.edges[relationshipKey("ada", "player")] = {
  ...neutralRelationship("ada", "player"),
  revision: 1,
  connection: "Partners",
};
scene.continuity = captureSceneContinuity(captured, scene, Date.parse(village.foundedAt));
village.memoryScenes = structuredClone(captured.memoryScenes);
const dual = proposal("Former partners", 2);
dual.sceneAfter = after("Partners");
dual.liveAfter = after("Former partners");
const dualReview = review(dual, "dual");
applyRelationshipReview(
  state,
  dualReview,
  village,
  "dual",
  "2026-10-22T11:00:00Z",
  Date.now(),
  captured.relationshipContext,
);
const receipt = state.receipts[dualReview.changes[0]!.id]!;
receipt.sceneId = scene.id;
receipt.submissionId = "turn";
scene.submissions = [{ id: "turn" }];
assert.equal(
  sceneContinuityView(village, scene).relationshipContext!.edges[relationshipKey("ada", "player")]!.connection,
  "Partners",
);
assert.equal(relationshipFor(state, "ada", "player").connection, "Former partners");
assert.equal(receipt.at, "2026-10-22T11:00:00Z", "Event date survives delayed settlement");

// Actual mutual terms require all participants' communication and their access to the cited terms.
const terms: any = {
  id: "",
  expectedRevision: 0,
  kind: "commitment",
  text: "Meet at noon",
  participants: ["ada", "player"],
  status: "accepted",
  dueAt: "2026-10-25T12:00:00Z",
};
const withTerms = proposal("Friends", 3);
withTerms.sceneAfter = after("Friends", [terms]);
withTerms.liveAfter = after("Friends", [terms]);
assert.doesNotThrow(() => review(withTerms, "terms"));
assert.throws(() => review({ ...withTerms, lineIds: ["a"] }, "missing-consent"), /explicit communication/);
const unheard = lines.map((row) => (row.id === "a" ? { ...row, heardBy: ["ada"], playerHeard: false } : row));
assert.throws(
  () =>
    parseRelationshipReview({ ...emptyRelationshipReview(), changes: [withTerms] }, "unheard", unheard, village, true),
  /explicit communication/,
);
const accepted = review(withTerms, "terms");
applyRelationshipReview(state, accepted, village, "terms", "2026-10-24T10:00:00Z");
const canonical = Object.values(state.sharedRecords)[0]!;
assert.equal(canonical.status, "accepted");
{
  const conflictState = defaultRelationshipState(village.seed);
  const shared: SocialRecord = {
    id: "shared",
    revision: 1,
    kind: "commitment",
    text: "Meet tomorrow",
    participants: ["ada", "ben"],
    status: "accepted",
    evidenceIds: ["a", "b"],
  };
  conflictState.sharedRecords.shared = shared;
  const operation = (owner: string, target: string, status: SocialRecord["status"]) => ({
    id: "shared-update:" + owner,
    fromId: owner,
    toId: target,
    expectedRevision: 0,
    sceneAfter: after("Friends", [{ ...shared, revision: 2, status }]),
    liveAfter: after("Friends", [{ ...shared, revision: 2, status }]),
    reason: "Current shared event",
    lineIds: ["a", "b"],
    evidence: [],
  });
  const before = structuredClone(conflictState);
  assert.throws(
    () =>
      applyRelationshipReview(
        conflictState,
        {
          ...emptyRelationshipReview(),
          changes: [operation("ada", "ben", "cancelled"), operation("ben", "ada", "fulfilled")],
        },
        village,
        "contradictory",
        "2026-10-24T10:00:00Z",
      ),
    /Conflicting interpretations/,
  );
  assert.deepEqual(conflictState, before, "Contradictory canonical updates reject the whole source before mutation");
}
const changed = {
  ...terms,
  id: canonical.id,
  expectedRevision: canonical.revision,
  participants: ["ada", "player", "ben"],
};
const changedRow = proposal("Friends", 4);
changedRow.sceneAfter = after("Friends", [changed]);
changedRow.liveAfter = after("Friends", [changed]);
assert.throws(() => review(changedRow, "changed-participants"), /immutable/);
const historic = { ...terms, kind: "history", status: "overdue" };
const badHistory = proposal("Family", 4);
badHistory.sceneAfter = after("Family", [historic]);
badHistory.liveAfter = after("Family", [historic]);
assert.throws(() => review(badHistory), /History cannot/);

// Only source-published, actually shared information belongs in the notebook.
assert.equal(
  projectRelationshipProfiles(state, village)[0]!.learned.length,
  0,
  "Private authority does not teach the player",
);
const disclosures = [
  {
    id: "routine",
    fromId: "ada",
    toId: "player",
    text: "I visit the garden.",
    kind: "routine" as const,
    lineIds: ["routine"],
  },
  {
    id: "connection",
    fromId: "ada",
    toId: "player",
    text: "I consider you my friend.",
    kind: "connection" as const,
    lineIds: ["connection"],
  },
];
for (const row of disclosures)
  publishRelationshipDisclosures(
    village,
    [row],
    { kind: "domain", id: row.id, revision: 1, fingerprint: memoryHash(row.id) },
    [{ id: row.id, speakerId: "ada", role: "assistant", content: row.text, heardBy: ["player"], playerHeard: true }],
    row.id === "routine" ? "2026-10-28T00:00:00Z" : "2026-10-27T00:00:00Z",
    "2026-10-29T00:00:00Z",
  );
const publicProfile = projectRelationshipProfiles(state, village)[0]!;
assert.equal(
  publicProfile.summary,
  "I consider you my friend.",
  "Routine ordering cannot suppress an earlier connection",
);
assert.deepEqual(publicProfile.routine, ["I visit the garden."]);
assert.equal(JSON.stringify(publicProfile).includes("Unpublished"), false);
assert.equal("stance" in publicProfile, false);
assert.equal("warmth" in publicProfile, false);
state.edges[relationshipKey("ada", "ben")] = {
  ...neutralRelationship("ada", "ben"),
  revision: 1,
  connection: "",
  records: {
    secret: {
      id: "secret",
      revision: 1,
      kind: "history",
      text: "SECRET_SIBLING",
      participants: ["ada", "ben"],
      knownBy: ["ben"],
      status: "stated",
      evidenceIds: ["authored"],
    },
  },
};
assert.equal(
  relationshipWritingPrompt(village, "ada").includes("SECRET_SIBLING"),
  false,
  "Unknown objective history is not owner knowledge",
);

// Personal outbox ownership, irreversible delivery receipt, read disclosures and explicit invitations.
const mail = queuePersonalMessage(
  state,
  "ada",
  "request-1",
  "Exact text \n including whitespace",
  "2026-10-22T13:00:00Z",
);
assert.equal(queuePersonalMessage(state, "ada", "request-1", mail.text, mail.at).id, mail.id);
assert.throws(() => queuePersonalMessage(state, "ada", "request-1", "Different text", mail.at), /different message/);
const thread = state.mailThreads["personal:ada"]!;
beginMailDelivery(state, thread.id, mail.id);
completeMailDelivery(state, thread.id, mail.id, "source-hash", "2026-10-22T13:01:00Z");
assert.equal(mail.replyStatus, "pending");
const once = structuredClone(state.mailDeliveries);
completeMailDelivery(state, thread.id, mail.id, "other-hash", "2026-10-22T13:02:00Z");
assert.deepEqual(state.mailDeliveries, once, "A later write cannot replace delivery authority");
mail.replyStatus = "complete";
const cancelled = queuePersonalMessage(state, "ada", "request-2", "Earlier retained work", mail.at);
cancelled.status = "cancelled";
assert.throws(() => beginMailDelivery(state, thread.id, cancelled.id), /no longer be delivered/);
const incoming = {
  id: "incoming",
  requestId: "incoming",
  fromId: "ada",
  toId: "player",
  text: "Let's meet.",
  at: mail.at,
  status: "delivered" as const,
  disclosures: [
    {
      id: "read-only",
      fromId: "ada",
      toId: "player",
      text: "I enjoy gardening.",
      kind: "preference" as const,
      lineIds: ["incoming"],
    },
  ],
};
thread.messages.push(incoming);
state.mailDeliveries.incoming = { messageId: "incoming", at: mail.at, sourceHash: "incoming-hash" };
const countBeforeRead = village.memories.records.length;
publishRelationshipDisclosures(
  village,
  incoming.disclosures,
  { kind: "domain", id: "mail-incoming", revision: 1, fingerprint: memoryHash("incoming-hash") },
  [
    {
      id: incoming.id,
      speakerId: "ada",
      role: "assistant",
      content: incoming.text,
      heardBy: ["player"],
      playerHeard: true,
    },
  ],
  incoming.at,
  "2026-10-22T13:05:00Z",
);
readPersonalThread(state, thread.id, "2026-10-22T13:05:00Z");
assert.equal(village.memories.records.length, countBeforeRead + 1);
const readOnce = structuredClone(village.memories);
readPersonalThread(state, thread.id, "2026-10-22T13:06:00Z");
assert.deepEqual(village.memories, readOnce);
// Shared Events budget counts admitted attempts, including failed, empty and uncertain calls.
const budget = defaultVillageState();
budget.backgroundPace = "balanced";
budget.timeZone = "UTC";
assert.equal(
  eventAttemptAvailable(budget, "2026-10-21", Date.parse("2026-10-22T12:00:00Z")),
  false,
  "An unspent prior day cannot generate catch-up requests",
);
const instant = Date.parse("2026-10-22T12:00:00Z");
for (let index = 0; index < 6; index++) {
  assert.equal(eventAttemptAvailable(budget, "2026-10-22", instant + index * 1_800_000), true);
  reserveEventAttempt(budget, "attempt:" + index, "2026-10-22", instant + index * 1_800_000);
  reserveEventAttempt(budget, "attempt:" + index, "2026-10-22", instant + index * 1_800_000);
}
assert.equal(budget.eventAttempts!.attempts.length, 6);
assert.equal(eventAttemptAvailable(budget, "2026-10-22", instant + 10_800_000), false);
const restored = structuredClone(budget);
assert.equal(eventAttemptAvailable(restored, "2026-10-22", instant + 10_800_000), false, "Restart preserves attempts");
assert.equal(eventAttemptAvailable(restored, "2026-10-21", instant + 86400000), false, "No calendar replay");
assert.equal(eventAttemptAvailable(restored, "2026-10-23", instant + 86400000), true);
restored.backgroundPace = "off";
assert.equal(eventAttemptAvailable(restored, "2026-10-23", instant + 86400000), false);

// Raw contract rejection precedes fallback coercion and startup workers; reads never invoke preparation.
assert.throws(
  () => coerceVillageState({ ...village, socialContractVersion: undefined }),
  /unsupported relationship contract/,
);
assert.throws(
  () => coerceRelationshipState(village.seed, { seed: village.seed, version: 1 }),
  /unsupported relationship contract/,
);
let generated = 0,
  mutated = 0;
const views = createRelationships({
  backgroundWorkSummaries: async () => [
    {
      id: "history-job",
      attempt: 2,
      kind: "starting-ties",
      label: "Starting history",
      status: "failed",
      error: "Retry",
      requests: 1,
      tokens: 100,
    },
  ],
  readVillageState: async () => village,
  mutateRelationships: async () => {
    mutated++;
    return state;
  },
  prepareStartingTies: async () => {
    generated++;
  },
  readVillageLore: async () => [],
} as any);
await views.readRelationshipsView();
const inspection = await views.readRelationshipsInspect();
assert.equal(inspection.processing[0]?.id, "history-job");
assert.equal(inspection.processing[0]?.attempt, 2, "Inspect retains the retry revision");
assert.equal(generated, 0);
assert.equal(mutated, 0);
let workers = 0,
  recovery = 0,
  cleanups = 0;
await assert.rejects(
  () =>
    startVillagesApplication(
      { api: { runtime: {} } } as any,
      {
        configureRuntime: () => () => {
          cleanups++;
        },
        assertSocialContract: async () => {
          throw Error("Unsupported contract");
        },
        startTownMapGeneration: () => {
          workers++;
          return () => {};
        },
        recoverFoundingPreparation: async () => {
          recovery++;
        },
      } as any,
    ),
  /Unsupported contract/,
);
assert.equal(workers, 0);
assert.equal(recovery, 0);
assert.equal(cleanups, 1);
{
  const current = defaultRelationshipState(village.seed);
  const liveWorld = { ...village, relationshipContext: current };
  const parseLive = (raw: unknown, source: string) =>
    parseRelationshipProposals(raw, source, lines, liveWorld, (row) => row, true, current, true);
  const row = proposal("Friends");
  row.liveAfter = after("Friends", [terms]);
  row.sceneAfter = after("Unrelated older wording");
  const original = structuredClone(row);
  const first = parseLive({ ...emptyRelationshipReview(), changes: [row] }, "live-first");
  assert.deepEqual(first.rejections, []);
  assert.deepEqual(first.review.changes[0]!.sceneAfter, first.review.changes[0]!.liveAfter);
  assert.deepEqual(row, original, "the raw System proposal stays available for audit");
  applyRelationshipReview(current, first.review, liveWorld, "live-first", village.foundedAt, Date.now(), current);
  const record = Object.values(current.sharedRecords)[0]!;
  const update = proposal("Friends", 1);
  update.liveAfter = after("Friends", [
    { ...terms, id: record.id, expectedRevision: record.revision, status: "fulfilled" },
  ]);
  const source = { ...emptyRelationshipReview(), changes: [update] };
  const next = parseLive(source, "live-next");
  assert.deepEqual(next.rejections, []);
  applyRelationshipReview(current, next.review, liveWorld, "live-next", village.foundedAt, Date.now(), current);
  const replay = parseLive(source, "live-next");
  assert.deepEqual(replay.rejections, [], "already applied shared-record updates replay without stale revalidation");
  assert.equal(replay.review.changes.length, 0);
  assert.equal(relationshipFor(current, "ada", "player").revision, 2);

  const intention = {
    actorId: "ada",
    expectedRevision: 0,
    lineIds: ["a"],
    sceneItems: [],
    items: [{ id: "", targetIds: ["player"], text: "Send a dinner note", reason: "A shared plan", status: "active" }],
  };
  const intentions = parseLive({ ...emptyRelationshipReview(), intentions: [intention] }, "live-intentions");
  assert.deepEqual(intentions.rejections, []);
  applyRelationshipReview(
    current,
    intentions.review,
    liveWorld,
    "live-intentions",
    village.foundedAt,
    Date.now(),
    current,
  );
  const receipt = current.intentionReceipts["live-intentions:intentions:ada"]!;
  assert.equal(receipt.sceneRevision, 1, "aliased live authority does not double-advance the intention revision");
  assert.equal(receipt.liveRevision, 1);
  assert.deepEqual(receipt.sceneAfter, receipt.liveAfter);
  assert.deepEqual(
    parseLive({ ...emptyRelationshipReview(), intentions: [intention] }, "live-intentions").rejections,
    [],
  );
  const stale = parseLive({ ...emptyRelationshipReview(), changes: [proposal("Friends")] }, "another-source");
  assert.throws(
    () => applyRelationshipReview(current, stale.review, liveWorld, "another-source", village.foundedAt),
    /revision|changed/i,
  );
}
console.log("villages-relationships: ok");
