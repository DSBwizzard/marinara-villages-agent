import { fixtureCapturedAdmissions } from "./helpers/village-storage.fixture.js";
import { captureResidentActivity } from "../packages/villages/src/server/domain/rules/world-context-copy.js";
import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  addRoutineIdea,
  deriveInfluence,
  influenceSettings,
  scheduleSemanticSource,
  type RoutineProfile,
} from "../packages/villages/src/server/domain/rules/owned-routine.js";
import {
  applyRelationshipReview,
  defaultRelationshipState,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import {
  emptyRelationshipReview,
  parseRelationshipReview,
} from "../packages/villages/src/server/domain/rules/relationship-review.js";
import { sceneMemoryContext } from "../packages/villages/src/server/domain/rules/scene-memories.js";
import { semanticContinuationKey } from "../packages/villages/src/server/domain/rules/semantic-continuity.js";
import { semanticHash } from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import { createLiveMemory } from "../packages/villages/src/server/features/residents/live-memory-service.js";
import { createRelationshipSocial } from "../packages/villages/src/server/features/residents/relationship-social-service.js";
import { createScheduleInfluence } from "../packages/villages/src/server/features/residents/schedule-influence-service.js";
import { createStartingTies } from "../packages/villages/src/server/features/residents/starting-ties-service.js";
import { projectRelationshipProfiles } from "../packages/villages/src/server/domain/rules/relationship-knowledge.js";

const state = defaultVillageState();
state.seed = "semantic-lifecycle";
state.foundedAt = new Date().toISOString();
state.playerBackground = "I have been a friend of a for years.";
state.villagers = ["a", "b"].map((id) => ({
  characterId: id,
  cardSnapshot: { id, name: id, revision: 1, description: "Authored context", sourceStatus: "available" },
  wishes: [],
})) as any;
const relationships = defaultRelationshipState(state.seed);
state.relationshipContext = relationships;
let calls = 0,
  queued: any,
  failApply = false,
  failMemory = false,
  changeSourceAtAdmission = false;
const saved = new Map<string, unknown>();
const service = createStartingTies({
  readVillageState: async () => state,
  mutateVillageState: async (update: any) => {
    if (failMemory) throw Error("Memory storage unavailable");
    if (changeSourceAtAdmission) {
      changeSourceAtAdmission = false;
      state.playerBackground = "Interleaved new source";
    }
    update(state);
    return state;
  },
  mutateRelationships: async (_seed: any, update: any) => {
    if (failApply) throw Error("Relationship storage unavailable");
    update(relationships);
    return relationships;
  },
  queueBackgroundJob: async (input: any) => {
    assert.equal(input.finite, true);
    assert.equal(input.kind, "starting-ties");
    queued = structuredClone(input);
  },
  settleBackgroundWork: async () => {
    const input = queued.input;
    assert(service.handler.valid(state, input));
    if (!saved.has(input.sourceHash)) saved.set(input.sourceHash, await service.handler.generate(input));
    service.handler.apply(state, input, saved.get(input.sourceHash));
    await service.handler.afterApply?.(input, saved.get(input.sourceHash));
  },
  villagesConnectionIdFor: async (role: any) => {
    assert.equal(role, "system");
    return "configured-system";
  },
  villagesLanguageModels: () => ({
    resolveForRequest: async (input: any) => {
      assert.equal(input.connectionId, "configured-system");
      return {
        model: "fake",
        connectionId: "configured-system",
        maxOutputTokens: 2400,
        fitContext: (messages: any, options: any) => ({ messages, ...options, estimatedTokensBefore: 13000 }),
        chatComplete: () => assert.fail("Real providers are forbidden"),
      };
    },
  }),
  completeWithRoom: async (_model: any, _messages: any, _limit: any, options: any) => {
    calls++;
    assert.equal(_limit, 2400, "Starting history respects the configured model's output ceiling");
    assert.equal(options.retryEmpty, false);
    return {
      finishReason: "stop",
      content: JSON.stringify({
        ties: [
          {
            fromId: "a",
            toId: "b",
            connection: "Old friends",
            stance: "Fond but cautious",
            expectations: [],
            concerns: [],
            history: [{ text: "Authored context", sourceIds: ["card:a:description"], knownBy: ["a"] }],
          },
        ],
        conflicts: [],
      }),
    };
  },
} as any);
await service.applySaved();
assert.equal(calls, 0, "Construction and view replay cannot start interpretation");
await service.queue();
assert.equal(calls, 0, "Admission queues finite preparation without dispatching inline");
assert(queued);
assert.equal(queued.input.source.playerBackground, state.playerBackground);
assert.equal(queued.input.source.playerId, "player", "The captured source separates the player ID from display text");
const longerConnection =
  "Two musicians sharing a city: one knows the other's small but growing public profile; nothing establishes that the other knows she exists.";
const purchased = {
  ties: [
    {
      fromId: "a",
      toId: "b",
      connection: longerConnection,
      stance: "Aware of their public work",
      expectations: [],
      concerns: [],
      history: [],
    },
  ],
  conflicts: [],
};
const recover = (value: unknown, finishReason = "stop", key = "starting-ties:" + queued.input.sourceHash) =>
  service.handler.recoverSavedResult!(queued.input, [
    { key, fingerprint: "saved", status: "completed", response: { finishReason, content: JSON.stringify(value) } },
  ]);
assert(longerConnection.length > 120);
assert.equal((recover(purchased) as any).ties[0].connection, longerConnection, "Local recovery retains the full text");
assert.equal(calls, 0, "Revalidating a purchased response cannot dispatch another request");
assert.equal(recover(purchased, "stop", "another-checkpoint"), undefined);
assert.throws(() => recover(purchased, "length"), /output-token limit/);
assert.throws(
  () => recover({ ...purchased, ties: [{ ...purchased.ties[0], connection: "x".repeat(401) }] }),
  /invalid ties · connection.*maximum 400 characters/,
);
for (const tie of [
  { ...purchased.ties[0], fromId: "player" },
  { ...purchased.ties[0], toId: "unknown" },
  { ...purchased.ties[0], history: [{ text: "Invalid", sourceIds: ["unknown"], knownBy: ["a"] }] },
  { ...purchased.ties[0], history: [{ text: "Invalid", sourceIds: ["card:a:description"], knownBy: ["unknown"] }] },
])
  assert.throws(() => recover({ ...purchased, ties: [tie] }), /identity or source/);
assert.throws(() => recover({ ...purchased, ties: [purchased.ties[0], purchased.ties[0]] }), /identity or source/);
assert.throws(
  () => recover({ ties: [], conflicts: [{ actorIds: ["player"], question: "Invalid", sourceIds: ["x", "y"] }] }),
  /Invalid authored relationship conflict/,
);
const socialConflict = {
  actorIds: ["a"],
  question: "Are these two people spouses or siblings?",
  sourceIds: ["card:a:description", "card:b:description"],
};
assert.deepEqual(
  (
    recover({
      ties: [],
      conflicts: [{ ...socialConflict, kind: "background", question: "Is this world Korant or Koront?" }],
    }) as any
  ).conflicts,
  [],
  "A background discrepancy cannot block starting relationships",
);
assert.deepEqual(
  (recover({ ties: [], conflicts: [{ ...socialConflict, kind: "social" }] }) as any).conflicts,
  [socialConflict],
  "Contradictory social facts still require clarification",
);
assert.deepEqual(
  (recover({ ties: [], conflicts: [socialConflict] }) as any).conflicts,
  [socialConflict],
  "Saved unclassified conflicts remain held until explicitly resolved",
);
assert.throws(() => recover({ ties: [], conflicts: [{ ...socialConflict, kind: "invented" }] }), /invalid conflicts/);
const originalBackground = state.playerBackground;
state.playerBackground = "Changed starting relationship";
assert.equal(
  service.handler.valid(state, queued.input),
  false,
  "player backstory is part of the frozen relationship source",
);
state.playerBackground = originalBackground;
failMemory = true;
await assert.rejects(service.prepare(), /Memory storage unavailable/);
assert.deepEqual(relationships.reviewedActorIds, [], "A failed Memory publication cannot unlock first Scene admission");
assert.equal(calls, 1);
failMemory = false;
changeSourceAtAdmission = true;
await assert.rejects(service.applySaved(), /Starting history source changed/);
assert.deepEqual(relationships.reviewedActorIds, []);
state.playerBackground = originalBackground;
failApply = true;
await assert.rejects(service.applySaved(), /storage unavailable/);
assert.equal(calls, 1);
assert(state.semanticStartingTies, "The interpreted result survives failed relationship application");
failApply = false;
await service.applySaved();
assert.equal(Object.values(relationships.edges)[0]?.connection, "Old friends");
Object.values(relationships.edges)[0]!.stance = "Later changed perspective";
await service.applySaved();
assert.equal(
  Object.values(relationships.edges)[0]?.stance,
  "Later changed perspective",
  "Reading never overwrites played developments",
);
await service.prepare();
assert.equal(calls, 1, "The finite saved preparation replays without dispatch");
assert.equal(Object.values(relationships.edges)[0]?.stance, "Later changed perspective");
state.villagers[0]!.cardSnapshot.description = "Changed source";
assert.equal(service.handler.valid(state, queued.input), false, "A changed source cannot receive the old preparation");
await service.applySaved();
assert.equal(calls, 1);

const retryState = structuredClone(state);
retryState.semanticStartingTies!.conflicts = [socialConflict];
const revisions: string[] = [];
const clarificationService = createStartingTies({
  readVillageState: async () => retryState,
  mutateVillageState: async (update: any) => {
    update(retryState);
    return retryState;
  },
  queueBackgroundJob: async (input: any) => {
    revisions.push(input.revision);
  },
} as any);
const clarification = {
  sourceHash: retryState.semanticStartingTies!.sourceHash,
  actorIds: ["a"],
  text: "They are siblings.",
};
await clarificationService.clarify(clarification);
await clarificationService.clarify(clarification);
assert.equal(retryState.socialClarifications?.length, 1, "Repeated submission retains one authored clarification");
assert.equal(
  revisions[0],
  revisions[1],
  "Repeated submission reuses the same finite job revision instead of admitting another paid request",
);

const profile: RoutineProfile = {
  version: 1,
  semanticVersion: 2,
  activities: [
    { activity: "Quiet time", venueId: "", flexible: true, essential: false, duration: 90, parts: [0, 1, 2, 3] },
  ],
  days: Array.from({ length: 7 }, () => Array(8).fill(0)),
  rhythm: [],
};
const resident = state.villagers[0]!;
resident.agenda = { routineProfile: profile } as any;
resident.scheduleInfluence = influenceSettings({ enabled: true });
const schedule = {
  characterId: "a",
  days: { Monday: [{ time: "00:00-06:00", activity: "Thinking about sleep while repairing a friendship" }] },
} as any;
const pending = deriveInfluence(schedule, resident, state);
assert.deepEqual(pending.rhythms, [], "A stale/missing new-contract interpretation never falls back to a sleep word");
assert.deepEqual(pending.unresolved, ["Schedule interpretation pending"]);
profile.influence = {
  ...pending,
  unresolved: [],
  interests: ["Quiet time"],
  rhythms: [{ weekday: "Monday", startMinute: 60, endMinute: 300 }],
};
profile.influenceSource = scheduleSemanticSource(schedule, resident.scheduleInfluence);
assert.equal(
  deriveInfluence(schedule, resident, state).rhythms[0]?.startMinute,
  60,
  "Prepared System meaning is reused locally",
);
const before = JSON.stringify([state.venues, state.projects]);
assert(
  addRoutineIdea(
    resident.agenda!,
    { activity: "Repairing a friendship over tea", venueId: "", flexible: true },
    resident,
    state,
  ),
);
assert.equal(
  JSON.stringify([state.venues, state.projects]),
  before,
  "A repertoire entry has no asset or physical authority",
);
assert.equal(calls, 1, "Routine reads and template expansion add no model work");
// Replay an accepted encounter after a crash between relationship and Village application.
const at = new Date().toISOString();
const encounter = {
  id: "accepted-social",
  at,
  venueId: "none",
  zoneId: "none",
  actorIds: ["a", "b"],
  semanticProvenance: { version: 2 as const, sourceHash: semanticHash("accepted-social"), interpretedAt: at },
  lines: [
    {
      id: "social-line-0",
      speakerId: "a",
      role: "assistant" as const,
      kind: "dialogue" as const,
      content: "Let us compare our sketches tomorrow.",
      heardBy: ["a", "b"],
      playerHeard: false,
    },
    {
      id: "social-line-1",
      speakerId: "b",
      role: "assistant" as const,
      kind: "dialogue" as const,
      content: "I would enjoy comparing those sketches.",
      heardBy: ["a", "b"],
      playerHeard: false,
    },
  ],
  review: { changes: [], permissions: [], disclosures: [] },
  memoryChanges: [] as any[],
  memoryContexts: {} as any,
};
const screen = sceneMemoryContext(state, ["a", "b"], "sketches");
encounter.memoryContexts[screen.saved.protection.fingerprint] = screen.saved;
encounter.memoryChanges = [
  {
    action: "create",
    kind: "open-matter",
    text: "They discussed comparing sketches tomorrow.",
    subjects: ["a", "b"],
    learners: Object.fromEntries(
      ["a", "b"].map((id) => [
        id,
        { basis: "report", attributedTo: "a", support: [{ lineId: 0, excerpt: encounter.lines[0].content }] },
      ]),
    ),
    screening: { disposition: "clear", protectedRoots: [], fingerprint: screen.saved.protection.fingerprint },
  },
];
relationships.socialEncounters.push(encounter);
relationships.applied[encounter.id] = true;
state.relationshipContext = relationships;
state.socialOutbox = [
  {
    id: encounter.id,
    seed: state.seed,
    at,
    opportunity: { id: "opportunity", actorIds: ["a", "b"], kind: "encounter", venueId: "none" } as any,
    candidates: [],
    admitted: captureResidentActivity(state),
    relationshipSnapshot: structuredClone(relationships),
    proposal: {},
  },
];
const memory = createLiveMemory({
  readVillageAuthority: async () => state,
  readVillageState: async () => state,
  mutateVillageState: async (update: any) => {
    await update(state);
    return state;
  },
  mutateRelationships: async (_seed: any, update: any) => {
    await update(relationships);
    return relationships;
  },
} as any);
let privateScene: any;
let failedMemory = true;
const social = createRelationshipSocial({
  withVillageSceneAcceptance: async (work: any) => work(state),
  readSocialEntry: fixtureCapturedAdmissions.readSocialEntry,
  socialIdentity: fixtureCapturedAdmissions.socialIdentity,
  mutateVillageState: async (update: any) => {
    await update(state);
    return state;
  },
  mutateRelationships: async (_seed: any, update: any) => {
    await update(relationships);
    return relationships;
  },
  processLiveMemories: async (scene: any, id: any) => {
    privateScene = scene;
    if (failedMemory) return { status: "failed", reason: "Injected memory metadata failure" };
    return memory.processLiveMemories(scene, id);
  },
} as any);
await social.processSocialOutbox(state);
assert.match(state.socialOutbox[0]!.error!, /Injected memory metadata failure/);
assert.equal(await social.processSocialOutbox(state), false, "Ordinary reads skip retained failures");
assert.equal(state.socialOutbox.length, 1, "A failed memory domain retains the accepted outbox for recovery");
failedMemory = false;
state.socialOutbox[0]!.error = undefined;
await social.processSocialOutbox(state);
assert(state.memories.records.some((row) => row.text === encounter.memoryChanges[0]!.text));
assert(
  Object.values(state.exchangeReceipts).every((row) => !row.notice),
  "Offscreen memories produce no player notice",
);
assert.equal(state.socialOutbox.length, 0, "Acknowledge only after private memory application");
const savedMemories = state.memories.records.length;
const duplicate = structuredClone(privateScene);
duplicate.submissions[0].liveProposals.memoryChanges = [
  encounter.memoryChanges[0],
  { ...encounter.memoryChanges[0], text: "Another fact about the same evidence" },
];
await memory.processLiveMemories(duplicate, encounter.id);
assert.equal(state.memories.records.length, savedMemories, "Repeated source units cannot duplicate stored knowledge");
await social.processSocialOutbox(state);
assert.equal(state.memories.records.length, savedMemories);
state.semanticContinuations = { [semanticContinuationKey(privateScene.id, encounter.id)]: ["memories"] };
privateScene.submissions[0].liveProposals.memoryChanges = [
  { ...encounter.memoryChanges[0], kind: "information", text: "LATE UPDATE MUST NOT APPLY" },
];
await memory.processLiveMemories(privateScene, encounter.id);
assert(
  !state.memories.records.some((row) => row.text === "LATE UPDATE MUST NOT APPLY"),
  "A saved continuation fences late domain writers",
);
assert.equal(calls, 1, "Offscreen saved application and recovery cannot dispatch providers");
let scheduleCalls = 0,
  scheduleJob: any;
const influence = createScheduleInfluence({
  readVillageState: async () => state,
  readNativeScheduleSnapshot: async () => ({ cardsReadable: true, schedules: [schedule] }),
  queueBackgroundJob: async (job: any) => {
    scheduleJob = structuredClone(job);
  },
  villagesConnectionIdFor: async (role: any) => {
    assert.equal(role, "system");
    return "system";
  },
  villagesLanguageModels: () => ({
    resolveForRequest: async () => ({
      model: "fake",
      maxOutputTokens: 2400,
      fitContext: (messages: any) => ({ messages, estimatedTokensBefore: 13000 }),
    }),
  }),
  completeWithRoom: async () => {
    scheduleCalls++;
    return { finishReason: "stop", content: JSON.stringify(profile.influence) };
  },
} as any);
resident.agenda!.routineProfile!.influenceSource = "stale";
const activeDay = JSON.stringify(resident.agenda!.activeDay);
await influence.queue("a");
assert.equal(scheduleCalls, 0, "Settings changes queue finite preparation, without an inline model request");
assert.equal(scheduleJob.finite, true);
assert.equal(scheduleJob.kind, "schedule-influence");
assert(influence.handler.valid(state, scheduleJob.input));
const preparedInfluence = await influence.handler.generate(scheduleJob.input);
influence.handler.apply(state, scheduleJob.input, preparedInfluence);
assert.equal(deriveInfluence(schedule, resident, state).rhythms[0].startMinute, 60);
assert.equal(JSON.stringify(resident.agenda!.activeDay), activeDay, "Preparation preserves the active day");
scheduleJob = undefined;
await influence.queue("a");
assert.equal(scheduleJob, undefined, "An unchanged prepared source queues nothing");
resident.scheduleInfluence!.categories.rhythm = false;
await influence.queue("a");
assert(scheduleJob);
resident.scheduleInfluence!.categories.rhythm = true;
assert.equal(influence.handler.valid(state, scheduleJob.input), false, "A superseded settings result cannot apply");
for (const historyKind of ["culture", "private", "marriage"]) {
  const privateHistory = historyKind === "private",
    marriage = historyKind === "marriage";
  const world = defaultVillageState();
  world.seed = "lore-history-" + historyKind;
  world.foundedAt = new Date().toISOString();
  world.selectedLorebookIds = ["world-book"];
  world.villagers = ["a", "b"].map((id) => ({
    characterId: id,
    wishes: [],
    cardSnapshot: { id, name: id, description: "A member of the Tidewatch Guild.", sourceStatus: "available" },
  })) as any;
  world.relationshipContext = defaultRelationshipState(world.seed);
  let reference = marriage
    ? "a and b are married."
    : privateHistory
      ? "Only a knows that b secretly left the guild."
      : "Guild members greet strangers politely. Membership alone establishes no meeting.";
  let job: any,
    capturedMessages: any,
    reads = 0;
  const starting = createStartingTies({
    readVillageState: async () => world,
    mutateVillageState: async (update: any) => {
      update(world);
      return world;
    },
    mutateRelationships: async (_seed: any, update: any) => {
      update(world.relationshipContext);
      return world.relationshipContext;
    },
    queueBackgroundJob: async (value: any) => {
      job = structuredClone(value);
    },
    settleBackgroundWork: async () => {},
    readVillageLore: async (_ids: any, query: string, _signal: any, _budget: any, options: any) => {
      reads++;
      assert.match(query, /Tidewatch Guild/);
      assert.doesNotMatch(query, /sourceStatus|selectedLorebookIds|playerId|description:/);
      options.inspect({
        purpose: "Starting history",
        stage: "selection",
        budget: 1600,
        omittedDiagnostics: 0,
        entries: [
          {
            id: "guild",
            bookId: "world-book",
            bookName: "Guild history",
            name: "Guild",
            status: "included",
            match: "setting",
          },
        ],
      });
      return ["Guild: " + reference];
    },
    villagesConnectionIdFor: async () => "system",
    villagesLanguageModels: () => ({
      resolveForRequest: async () => ({
        model: "fake",
        connectionId: "system",
        maxOutputTokens: 2400,
        fitContext: (messages: any, options: any) => ({ messages, ...options }),
      }),
    }),
    completeWithRoom: async (_model: any, messages: any) => {
      capturedMessages = structuredClone(messages);
      return {
        finishReason: "stop",
        content: JSON.stringify({
          ties: privateHistory
            ? [
                {
                  fromId: "a",
                  toId: "b",
                  connection: "Aware of b's departure",
                  stance: "Keeps the history private",
                  expectations: [],
                  concerns: [],
                  history: [{ text: reference, sourceIds: ["lore:0"], knownBy: ["a"] }],
                },
              ]
            : marriage
              ? ["a", "b"].map((fromId) => ({
                  fromId,
                  toId: fromId === "a" ? "b" : "a",
                  connection: "Married",
                  stance: "Their spouse",
                  expectations: [],
                  concerns: [],
                  history: [{ text: reference, sourceIds: ["lore:0"], knownBy: ["a", "b"] }],
                }))
              : [],
          conflicts: [],
        }),
      };
    },
  } as any);
  await starting.queue();
  assert.equal(
    Object.keys(world.relationshipContext.edges).length,
    0,
    "Selecting cultural lore alone creates no acquaintance",
  );
  assert.equal(job.input.sources.find((source: any) => source.id === "lore:0").content, "Guild: " + reference);
  const result = await starting.handler.generate(job.input);
  assert.equal(reads, 1, "Starting-history generation reuses the captured lore");
  assert(!capturedMessages[0].content.includes(reference), "Authored lore cannot enter starting-history instructions");
  assert(capturedMessages[1].content.includes(reference));
  starting.handler.apply(world, job.input, result);
  await starting.applySaved();
  assert.equal(Object.keys(world.relationshipContext.edges).length, marriage ? 2 : privateHistory ? 1 : 0);
  assert.deepEqual(
    world.semanticStartingTies?.lore?.map((entry) => entry.bookName),
    ["Guild history"],
  );
  assert(
    projectRelationshipProfiles(world.relationshipContext, world).every(
      (profile) => !profile.learned.some((row) => row.text.includes(reference)),
    ),
    "Private authored history remains absent from the player's learned relationships",
  );
  if (privateHistory) {
    const edge = Object.values(world.relationshipContext.edges)[0]!;
    assert.deepEqual(
      Object.values(edge.records)[0]!.knownBy,
      ["a"],
      "Starting history preserves asymmetric knowers without promoting b or the player",
    );
  }
  if (marriage) {
    for (const edge of Object.values(world.relationshipContext.edges)) {
      assert.equal(edge.connection, "Married");
      assert.deepEqual(Object.values(edge.records)[0]!.knownBy, ["a", "b"]);
    }
    assert.equal(Object.keys(world.relationshipContext.grants).length, 0, "Authored marriage grants no access");
    const line = {
      id: "separation",
      speakerId: "a",
      role: "assistant" as const,
      content: "Our marriage is over.",
      heardBy: ["a", "b"],
      playerHeard: false,
    };
    const after = { connection: "Separated", stance: "Former spouse", expectations: [], concerns: [], records: [] };
    const review = parseRelationshipReview(
      {
        ...emptyRelationshipReview(),
        changes: ["a", "b"].map((fromId) => ({
          fromId,
          toId: fromId === "a" ? "b" : "a",
          expectedRevision: 1,
          sceneAfter: after,
          liveAfter: after,
          reason: "Witnessed separation",
          lineIds: [line.id],
        })),
      },
      "separation",
      [line],
      world,
    );
    applyRelationshipReview(world.relationshipContext, review, world, "separation", new Date().toISOString());
    const separated = structuredClone(world.relationshipContext);
    await starting.applySaved();
    await starting.queue();
    assert.deepEqual(world.relationshipContext, separated, "Original marriage lore cannot replay over a separation");
    assert.equal(reads, 1, "Played residents do not repeat starting-history retrieval");

    reference = "a and b have reconciled and are married again.";
    await starting.queue();
    assert.equal(reads, 1, "Editing external lore alone does not reinitialize played residents");
    assert.deepEqual(world.relationshipContext, separated);

    world.villagers.push({
      ...world.villagers[0]!,
      characterId: "c",
      cardSnapshot: { ...world.villagers[0]!.cardSnapshot, id: "c", name: "c" },
    });
    await starting.queue();
    assert.equal(reads, 2, "A new resident retrieves the edited lore for their own starting history");
    assert.equal(job.input.sources.find((source: any) => source.id === "lore:0").content, "Guild: " + reference);
    starting.handler.apply(world, job.input, await starting.handler.generate(job.input));
    await starting.applySaved();
    assert.deepEqual(
      world.relationshipContext.edges,
      separated.edges,
      "Even a new starting-history result proposing remarriage cannot overwrite established separation",
    );
    assert.deepEqual(world.relationshipContext.receipts, separated.receipts, "The played evidence remains intact");
    assert(world.relationshipContext.reviewedActorIds.includes("c"));
  }
}
console.log(
  "Semantic lifecycle: finite starting-tie recovery, edits, source fences, prepared routines and zero read-time dispatch passed with synthetic providers.",
);
