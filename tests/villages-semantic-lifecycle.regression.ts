import assert from "node:assert/strict";
import { createStartingTies } from "../packages/villages/src/server/features/residents/starting-ties-service.js";
import { createScheduleInfluence } from "../packages/villages/src/server/features/residents/schedule-influence-service.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import {
  addRoutineIdea,
  deriveInfluence,
  influenceSettings,
  scheduleSemanticSource,
  type RoutineProfile,
} from "../packages/villages/src/server/domain/rules/owned-routine.js";
import { semanticHash } from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import { createRelationshipSocial } from "../packages/villages/src/server/features/residents/relationship-social-service.js";
import { createLiveMemory } from "../packages/villages/src/server/features/residents/live-memory-service.js";
import { semanticContinuationKey } from "../packages/villages/src/server/domain/rules/semantic-continuity.js";

const state = defaultVillageState();
state.seed = "semantic-lifecycle";
state.playerBackground = "I have been a friend of a for years.";
state.villagers = ["a", "b"].map((id) => ({
  characterId: id,
  cardSnapshot: { id, name: id, revision: 1, description: "Authored context", sourceStatus: "available" },
  completedWishes: [],
})) as any;
const relationships = defaultRelationshipState(state.seed);
state.relationshipContext = relationships;
let calls = 0,
  queued: any,
  failApply = false;
const saved = new Map<string, unknown>();
const service = createStartingTies({
  readVillageState: async () => state,
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
        fitContext: (messages: any, options: any) => ({ messages, ...options }),
        chatComplete: () => assert.fail("Real providers are forbidden"),
      };
    },
  }),
  completeWithRoom: async (_model: any, _messages: any, _limit: any, options: any) => {
    calls++;
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
const originalBackground = state.playerBackground;
state.playerBackground = "Changed starting relationship";
assert.equal(
  service.handler.valid(state, queued.input),
  false,
  "player backstory is part of the frozen relationship source",
);
state.playerBackground = originalBackground;
failApply = true;
await assert.rejects(service.prepare(), /storage unavailable/);
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
const before = JSON.stringify([state.venues, state.projects, state.narrativeItems]);
assert(
  addRoutineIdea(
    resident.agenda!,
    { activity: "Repairing a friendship over tea", venueId: "", flexible: true },
    resident,
    state,
  ),
);
assert.equal(
  JSON.stringify([state.venues, state.projects, state.narrativeItems]),
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
  memoryChanges: [
    {
      kind: "passing",
      text: "They discussed comparing sketches tomorrow.",
      category: "commitment",
      subjectCharacterIds: ["a", "b"],
      knownByCharacterIds: ["a", "b"],
      evidence: [0, 1],
    },
  ],
};
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
assert(state.recollections.some((row) => row.text === encounter.memoryChanges[0]!.text));
assert(
  Object.values(state.exchangeReceipts).every((row) => !row.notice),
  "Offscreen memories produce no player notice",
);
assert.equal(state.socialOutbox.length, 0, "Acknowledge only after private memory application");
const savedMemories = state.recollections.length;
const duplicate = structuredClone(privateScene);
duplicate.submissions[0].liveProposals.memoryChanges = [
  encounter.memoryChanges[0],
  { ...encounter.memoryChanges[0], text: "Another fact about the same evidence" },
];
await assert.rejects(memory.processLiveMemories(duplicate, encounter.id), /Duplicate memory units/);
assert.equal(state.recollections.length, savedMemories, "Ambiguous duplicate units fail before any write");
await social.processSocialOutbox(state);
assert.equal(state.recollections.length, savedMemories);
state.semanticContinuations = { [semanticContinuationKey(privateScene.id, encounter.id)]: ["memories"] };
privateScene.submissions[0].liveProposals.memoryChanges = [
  { ...encounter.memoryChanges[0], kind: "durable", text: "LATE UPDATE MUST NOT APPLY" },
];
await memory.processLiveMemories(privateScene, encounter.id);
assert(
  !state.chronicle.some((row) => row.text === "LATE UPDATE MUST NOT APPLY"),
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
      fitContext: (messages: any) => ({ messages, estimatedTokensBefore: 1000 }),
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
console.log(
  "Semantic lifecycle: finite starting-tie recovery, edits, source fences, prepared routines and zero read-time dispatch passed with synthetic providers.",
);
