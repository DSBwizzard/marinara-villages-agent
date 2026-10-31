import { captureResidentActivity } from "../packages/villages/src/server/domain/rules/world-context-copy.js";
import { fixtureCapturedAdmissions, fixtureRelationshipIdentity } from "./helpers/village-storage.fixture.js";
import assert from "node:assert/strict";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { SocialOutboxEntry } from "../packages/villages/src/server/domain/models/social-outbox-model.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { agendaDateKey } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import {
  emptyRelationshipReview,
  parseRelationshipReview,
} from "../packages/villages/src/server/domain/rules/relationship-review.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { sceneMemoryContext } from "../packages/villages/src/server/domain/rules/scene-memories.js";
import { projectMemories } from "../packages/villages/src/server/domain/rules/memory-views.js";
import { readEncounter } from "../packages/villages/src/server/domain/rules/social-encounter.js";
import { deriveVillageMoment } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { WorkFailureError, metadataFailure } from "../packages/villages/src/server/domain/rules/work-failure.js";
import { createRelationshipSocial } from "../packages/villages/src/server/features/residents/relationship-social-service.js";
import { createLiveMemory } from "../packages/villages/src/server/features/residents/live-memory-service.js";
import { createReturnCatchupSettlement } from "../packages/villages/src/server/features/background/return-catchup-settlement.js";
import { createReturnCatchup } from "../packages/villages/src/server/features/background/return-catchup-service.js";
import { readEffectiveVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { planRoutineDays } from "../packages/villages/src/server/domain/rules/resident-agenda.js";
import { socialContextState } from "../packages/villages/src/server/domain/rules/social-context.js";
import { createRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import {
  captureReturnContext,
  departureMemoriesAvailable,
} from "../packages/villages/src/server/domain/rules/return-catchup-capture.js";
import { createResidentPlanning } from "../packages/villages/src/server/features/residents/resident-planning-service.js";
import { ZonedDate } from "../packages/villages/src/shared/helpers/zoned-date.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { villagesRoutes } from "../packages/villages/src/server/entry/routes.js";
import {
  mutateVillageMemoryState,
  readVillageMemorySnapshot,
} from "../packages/villages/src/server/features/world/village-store.js";
import { mutateRelationships } from "../packages/villages/src/server/features/residents/relationship-store.js";
import Fastify from "fastify";
const village = coerceVillageState({
  ...defaultVillageState(),
  seed: "events",
  foundedAt: "2026-10-22T18:00:00Z",
  timeZone: "America/New_York",
  venues: [{ id: "cafe", name: "Cafe", classes: ["community"] }],
  villagers: ["a", "b"].map((id) => ({
    characterId: id,
    addedAt: "2026-10-22T18:00:00Z",
    cardSnapshot: { id, name: id, capturedAt: "card-" + id, revision: 1, sourceStatus: "available" },
  })),
});
const zone = village.venues[0]!.zones!.find((row) => row.kind !== "exterior")!;
const at = "2026-10-22T19:00:00.000Z",
  sourceDate = new ZonedDate(at, village.timeZone);
assert.equal(sourceDate.getHours(), 15);
for (const person of village.villagers) {
  person.agenda = unwrittenVillageAgenda(village.venues, person.cardSnapshot.name);
  const block = {
    startMinute: 900,
    endMinute: 960,
    activity: "Talking",
    venueId: "cafe",
    zoneId: zone.id,
    status: "online",
    flexible: true,
  };
  person.agenda.activeDay!.blocks = [block];
  person.agenda.activeDay!.dateKey = agendaDateKey(sourceDate);
  person.agenda.activeDay!.weekday = sourceDate.toLocaleDateString("en-US", { weekday: "long" });
  person.agenda.day = [block];
  person.agenda.week[person.agenda.activeDay!.weekday] = [block];
}
let social = defaultRelationshipState(village.seed);
social.reviewedActorIds = ["a", "b"];
const projection = {
  connection: "Friends",
  stance: "Values this conversation",
  expectations: [],
  concerns: [],
  records: [],
};
const entry: SocialOutboxEntry = {
  id: "encounter",
  seed: village.seed,
  at,
  candidates: [],
  opportunity: { id: "occasion", kind: "encounter", actorIds: ["a", "b"], venueId: "cafe", zoneId: zone.id } as any,
  admitted: captureResidentActivity(village),
  relationshipSnapshot: structuredClone(social),
  proposal: {
    encounter: {
      opportunityId: "occasion",
      semanticVersion: 2,
      semanticSourceHash: "initial",
      lines: [
        { speakerId: "a", text: "I would like to spend more time together." },
        { speakerId: "b", text: "Let's talk again." },
      ],
      wishChanges: [],
      relationshipReview: {
        ...emptyRelationshipReview(),
        changes: [
          {
            fromId: "a",
            toId: "b",
            expectedRevision: 0,
            sceneAfter: projection,
            liveAfter: projection,
            reason: "A stated hope",
            lineIds: [0],
          },
        ],
      },
      memoryChanges: [{ malformed: true }],
    },
  },
};
assert(
  readEncounter(entry.proposal.encounter, entry, village),
  "Source admission uses village time even after its day has passed",
);
const renovated = structuredClone(village);
renovated.projects = [
  { kind: "renovation", venueId: "cafe", lifecycle: { phase: "working", changedZoneIds: [zone.id] } },
] as any;
assert(
  readEncounter(entry.proposal.encounter, entry, renovated),
  "Later construction cannot rewrite an admitted encounter",
);
const originallyClosed = structuredClone(entry);
originallyClosed.admitted!.projects = renovated.projects;
assert.equal(
  readEncounter(entry.proposal.encounter, originallyClosed, village),
  null,
  "A closed Zone cannot be admitted retroactively",
);
village.socialOutbox = [structuredClone(entry)];
let queued: any,
  providerCalls = 0,
  invalidMemory = true;
const snapshot = async () => ({ ...structuredClone(village), relationshipContext: structuredClone(social) });
const service = createRelationshipSocial({
  withVillageSceneAcceptance: async (work: any) => work(await snapshot()),
  readSocialEntry: fixtureCapturedAdmissions.readSocialEntry,
  socialIdentity: fixtureCapturedAdmissions.socialIdentity,
  readVillageSnapshot: snapshot,
  mutateVillageState: async (update: any) => {
    const next = await snapshot();
    update(next);
    delete next.relationshipContext;
    Object.assign(village, next);
    return snapshot();
  },
  mutateRelationships: async (_seed: string, update: any) => {
    const next = structuredClone(social);
    await update(next);
    social = next;
    return structuredClone(next);
  },
  processLiveMemories: async (scene: any) => {
    if (invalidMemory) throw new WorkFailureError(metadataFailure("Invalid memory fixture"));
    assert.deepEqual(scene.submissions[0].liveProposals.memoryChanges, []);
    return { status: "applied", receiptIds: [], reason: "No memories" };
  },
  queueBackgroundJob: async (job: any) => {
    queued = structuredClone(job);
  },
  interpretSocialSource: async (lines: any) => {
    providerCalls++;
    assert.deepEqual(lines, (entry.proposal.encounter as any).lines);
    return {
      semanticVersion: 2,
      semanticSourceHash: "corrected",
      relationshipReview: emptyRelationshipReview(),
      memoryChanges: [],
    };
  },
} as any);
await service.processSocialOutbox(await snapshot());
assert.equal(village.socialOutbox![0]!.reinterpretRequired, true);
assert(social.applied[entry.id]);
assert.equal(Object.values(social.edges)[0]!.revision, 1);
const socialReceipt = structuredClone(social.receipts);
assert.equal(
  await service.processSocialOutbox(await snapshot()),
  false,
  "Failed sources do not break or loop on ordinary reads",
);
await service.recover(entry.id, { requestId: "correct-memory", reinterpret: true });
const corrected = await service.handler.generate(queued.input);
service.handler.apply(village, queued.input, corrected, { retrying: false });
invalidMemory = false;
await service.processSocialOutbox(await snapshot());
assert.equal(village.socialOutbox!.length, 0);
assert.equal(providerCalls, 1);
assert.deepEqual(social.receipts, socialReceipt, "Correcting memory never reapplies an accepted social source");
assert.deepEqual(social.socialEncounters[0]!.memoryChanges, []);

// A source-supported offscreen memory passes through real social and memory settlement.
const remembered = structuredClone(entry);
remembered.id = "remembered-encounter";
remembered.catchupBatchId = "return-batch";
remembered.relationshipSnapshot = structuredClone(social);
const memoryContext = sceneMemoryContext(village, ["a", "b"], "talk again");
const rememberedSource = remembered.proposal.encounter as any;
rememberedSource.relationshipReview = emptyRelationshipReview();
rememberedSource.memoryContexts = { [memoryContext.saved.protection.fingerprint]: memoryContext.saved };
rememberedSource.memoryChanges = [
  {
    action: "create",
    kind: "information",
    text: "B said they would talk again.",
    subjects: ["b"],
    learners: {
      a: { basis: "report", attributedTo: "b", support: [{ lineId: 1, excerpt: "Let's talk again." }] },
    },
    screening: { disposition: "clear", protectedRoots: [], fingerprint: memoryContext.saved.protection.fingerprint },
  },
];
const unrelated = structuredClone(entry);
unrelated.id = "unrelated-pending";
village.socialOutbox = [remembered, unrelated];
const applyWorld = async (update: any) => {
  const next = await snapshot();
  update(next);
  delete next.relationshipContext;
  Object.assign(village, next);
  return snapshot();
};
const liveMemory = createLiveMemory({ now: () => new Date(at), mutateVillageState: applyWorld } as any);
const memorySettlement = createRelationshipSocial({
  withVillageSceneAcceptance: async (work: any) => work(await snapshot()),
  readSocialEntry: fixtureCapturedAdmissions.readSocialEntry,
  socialIdentity: fixtureCapturedAdmissions.socialIdentity,
  readVillageSnapshot: snapshot,
  mutateVillageState: applyWorld,
  mutateRelationships: async (_seed: string, update: any) => {
    const next = structuredClone(social);
    await update(next);
    social = next;
    return structuredClone(next);
  },
  processLiveMemories: liveMemory.processLiveMemories,
} as any);
village.socialOutbox = [remembered];
await assert.rejects(
  () => memorySettlement.recover(remembered.id, { requestId: "legacy-retry", reinterpret: false }),
  /catch-up/,
);
assert.equal(
  await memorySettlement.processSocialOutbox(await snapshot()),
  false,
  "Ordinary reads cannot settle a return-owned source out of order.",
);
village.socialOutbox = [remembered, unrelated];
await memorySettlement.processSocialOutbox(await snapshot(), remembered.id);
assert.deepEqual(
  village.socialOutbox!.map((row) => row.id),
  ["unrelated-pending"],
  "Targeted settlement leaves other sources untouched.",
);
assert.equal(
  projectMemories(village.memories, ["a"]).some((row) => row.text === "B said they would talk again."),
  true,
);
assert.equal(projectMemories(village.memories, ["player"]).length, 0, "A private event does not teach the player.");

// The next dated opportunity can use the first one's settled Memory baseline.
village.socialOutbox = [];
const batchCapture = captureReturnContext(await snapshot(), new Date(at));
const batchMemories = structuredClone(village.memories);
const batchOpportunity = { ...entry.opportunity, id: "return-first", startsAt: at, endsAt: at, facts: ["a walk"] };
const secondAt = new Date(Date.parse(at) + 60_000).toISOString();
const secondOpportunity = { ...batchOpportunity, id: "return-second", startsAt: secondAt, endsAt: secondAt };
village.returnCatchup = {
  capture: batchCapture,
  batch: {
    id: "return-batch",
    status: "running",
    from: at,
    until: secondAt,
    opportunities: [batchOpportunity, secondOpportunity],
    records: [
      { opportunityId: batchOpportunity.id, status: "settling" },
      { opportunityId: secondOpportunity.id, status: "queued" },
    ],
  },
};
const batchContext = sceneMemoryContext(village, ["a", "b"], "a walk");
const batchSource = structuredClone(entry);
batchSource.id = batchOpportunity.id + ":social";
batchSource.catchupBatchId = "return-batch";
batchSource.opportunity = batchOpportunity;
batchSource.relationshipSnapshot = socialContextState(
  social,
  batchOpportunity.actorIds,
  batchOpportunity.facts.join(" "),
);
const projectedBatch = structuredClone({ ...(await snapshot()), ...batchCapture.world });
planRoutineDays(projectedBatch, new ZonedDate(at, village.timeZone));
batchSource.admitted = captureResidentActivity(projectedBatch, true);
const batchEncounter = batchSource.proposal.encounter as any;
batchEncounter.opportunityId = batchOpportunity.id;
batchEncounter.relationshipReview = emptyRelationshipReview();
batchEncounter.lines = [
  { speakerId: "a", text: "A walk?" },
  { speakerId: "b", text: "Yes, tomorrow." },
];
batchEncounter.memoryContexts = { [batchContext.saved.protection.fingerprint]: batchContext.saved };
batchEncounter.memoryChanges = [
  {
    action: "create",
    kind: "information",
    text: "B agreed to a walk tomorrow.",
    subjects: ["b"],
    learners: { a: { basis: "report", attributedTo: "b", support: [{ lineId: 1, excerpt: "Yes, tomorrow." }] } },
    screening: { disposition: "clear", protectedRoots: [], fingerprint: batchContext.saved.protection.fingerprint },
  },
];
village.socialOutbox = [batchSource];
village.returnCatchup!.batch!.records![0]!.outcome = { social: structuredClone(batchSource.proposal) };
batchSource.error = "Interpretation needs retry";
batchSource.reinterpretRequired = true;
village.returnCatchup!.batch!.status = "recovering";
const interpretationJobs: any[] = [];
const retrySocial = createRelationshipSocial({
  withVillageSceneAcceptance: async (work: any) => work(await snapshot()),
  readSocialEntry: fixtureCapturedAdmissions.readSocialEntry,
  socialIdentity: fixtureCapturedAdmissions.socialIdentity,
  readVillageSnapshot: snapshot,
  mutateVillageState: applyWorld,
  mutateRelationships: async () => structuredClone(social),
  queueBackgroundJob: async (work: any) => {
    interpretationJobs.push(work);
  },
  interpretSocialSource: async (_lines: unknown, context: any) => {
    assert.equal(context.at, at, "A retry uses the historical event time.");
    assert.deepEqual(
      context.residents.map((resident: any) => resident.characterId),
      ["a", "b"],
    );
    return {
      relationshipReview: batchEncounter.relationshipReview,
      memoryContexts: batchEncounter.memoryContexts,
      memoryChanges: batchEncounter.memoryChanges,
      wishChanges: [],
      semanticVersion: 2,
      semanticSourceHash: "retry-result",
    };
  },
} as any);
await retrySocial.recoverCatchup("return-batch", batchOpportunity.id, "explicit-retry");
assert.equal(interpretationJobs.length, 1, "Only an explicit retry queues a replacement interpretation.");
const retryInput = interpretationJobs[0].input;
assert.equal(retrySocial.handler.valid(await snapshot(), retryInput), true);
const retryResult = await retrySocial.handler.generate(retryInput);
await applyWorld((state: any) => retrySocial.handler.apply(state, retryInput, retryResult, { retrying: true }));
assert.equal(village.returnCatchup!.batch!.status, "running");
assert.equal((village.returnCatchup!.batch!.records![0]!.outcome as any).social.encounter.memoryChanges.length, 1);
batchSource.error = undefined;
batchSource.reinterpretRequired = undefined;
const batchSettlement = createReturnCatchupSettlement({
  socialIdentity: fixtureCapturedAdmissions.socialIdentity,
  relationshipIdentity: fixtureRelationshipIdentity,
  gate: { simulate: async (work: any) => ({ value: await work(), transaction: {} }), commit: async () => {} },
  readSnapshot: snapshot,
  mutate: applyWorld,
  processSocialOutbox: memorySettlement.processSocialOutbox,
} as any);
village.socialOutbox![0]!.at = secondAt;
await assert.rejects(() => batchSettlement.settle("return-batch", batchOpportunity.id), /does not match/);
village.socialOutbox![0]!.at = at;
assert.equal(await batchSettlement.settle("return-batch", batchOpportunity.id), "settled");
assert.equal(village.returnCatchup!.batch!.records![0]!.status, "settled");
assert.equal(departureMemoriesAvailable(village.returnCatchup!.capture!, await snapshot()), true);
assert.ok(projectMemories(village.memories, ["a"]).some((row) => row.text === "B agreed to a walk tomorrow."));
const nextJobs: any[] = [];
const nextPlanner = createResidentPlanning({
  relationshipIdentity: fixtureRelationshipIdentity,
  readVillageState: snapshot,
  readEffectiveVillagerCard,
  queueBackgroundJob: async (work: any) => {
    nextJobs.push(work);
  },
} as any);
await nextPlanner.queueReturnOpportunity("return-batch", secondOpportunity, village.returnCatchup!.capture!);
assert.equal(
  Object.hasOwn(nextJobs[0].input, "relationships"),
  false,
  "A comparison-only job cannot duplicate the ledger",
);
assert.match(nextJobs[0].input.relationshipRevision, /^villages-relationship-history-[a-f0-9]{32}-[a-f0-9]{64}$/);
assert.match(
  nextJobs[0].input.context.narrationMemories.a,
  /B agreed to a walk tomorrow/,
  "A later opportunity sees the prior settled Memory.",
);

// Exercise the real multi-document gate: failed staged effects never escape, and
// an interrupted commit is replayed without a replacement model request.
const rawRows = new Map<string, any>();
let failWorldWrite = false;
const rawStore: any = {
  async getById(_package: string, id: string) {
    return structuredClone(rawRows.get(id) ?? null);
  },
  async list(_package: string, kind: string) {
    return structuredClone([...rawRows.values()].filter((row) => row.kind === kind));
  },
  async create(input: any) {
    const row = { ...structuredClone(input), revision: 1 };
    rawRows.set(input.id, row);
    return structuredClone(row);
  },
  async update(input: any) {
    if (failWorldWrite && input.id === "return-test-world") {
      failWorldWrite = false;
      throw new Error("simulated interruption");
    }
    const previous = rawRows.get(input.id);
    if (!previous || previous.revision !== input.expectedRevision) return null;
    const row = { ...previous, ...structuredClone(input), revision: previous.revision + 1 };
    rawRows.set(input.id, row);
    return structuredClone(row);
  },
  async remove(_package: string, id: string, revision: number) {
    if (rawRows.get(id)?.revision !== revision) return false;
    rawRows.delete(id);
    return true;
  },
};
const storedWorld = structuredClone(village);
storedWorld.memories = structuredClone(batchMemories);
storedWorld.socialOutbox = [structuredClone(batchSource)];
storedWorld.returnCatchup = {
  capture: structuredClone(batchCapture),
  batch: {
    id: "return-batch",
    status: "running",
    from: at,
    until: secondAt,
    opportunities: [batchOpportunity],
    records: [
      {
        opportunityId: batchOpportunity.id,
        status: "settling",
        outcome: { social: structuredClone(batchSource.proposal) },
      },
    ],
  },
};
delete storedWorld.relationshipContext;
rawRows.set("return-test-world", {
  id: "return-test-world",
  packageId: "villages",
  kind: "test-world",
  name: "World",
  description: "",
  revision: 1,
  data: storedWorld,
});
rawRows.set("return-test-social", {
  id: "return-test-social",
  packageId: "villages",
  kind: "test-social",
  name: "Social",
  description: "",
  revision: 1,
  data: structuredClone(batchCapture.world.relationshipContext),
});
let realGate = createRepairGate(rawStore);
const readGated = async () => {
  const world = (await realGate.documents.getById("villages", "return-test-world"))!.data as any;
  const relationships = (await realGate.documents.getById("villages", "return-test-social"))!.data;
  return { ...structuredClone(world), relationshipContext: structuredClone(relationships) };
};
const mutateGated = async (update: any) => {
  const row = (await realGate.documents.getById("villages", "return-test-world"))!;
  const current = await readGated();
  update(current);
  delete current.relationshipContext;
  await realGate.documents.update({
    id: row.id,
    packageId: "villages",
    expectedRevision: row.revision,
    name: row.name,
    description: row.description,
    data: current,
    updatedAt: new Date().toISOString(),
  });
  return readGated();
};
let failSettlement = true;
const processGated = async () => {
  const row = (await realGate.documents.getById("villages", "return-test-social"))!;
  const relationships = structuredClone(row.data) as any;
  relationships.applied[batchSource.id] = true;
  await realGate.documents.update({
    id: row.id,
    packageId: "villages",
    expectedRevision: row.revision,
    name: row.name,
    description: row.description,
    data: relationships,
    updatedAt: new Date().toISOString(),
  });
  await mutateGated((state: any) => {
    if (failSettlement) state.socialOutbox[0].error = "Memory application failed";
    else {
      state.socialOutbox = [];
      state.memories.revision++;
    }
  });
  return true;
};
const realSettlement = () =>
  createReturnCatchupSettlement({
    socialIdentity: fixtureCapturedAdmissions.socialIdentity,
    relationshipIdentity: fixtureRelationshipIdentity,
    gate: realGate,
    readSnapshot: readGated,
    mutate: mutateGated,
    processSocialOutbox: processGated,
  } as any);
// A web request owns a repair epoch. After committing, the coordinator must
// return without another read in that old context; a fresh poll continues it.
const preEpochRows = structuredClone([...rawRows.entries()]);
failSettlement = false;
const epochCoordinator = createReturnCatchup({
  readSnapshot: readGated,
  mutate: mutateGated,
  queue: async () => {},
  job: async () => null,
  retryJob: async () => {},
  cancel: async () => {},
  settle: (...args: any[]) => (realSettlement().settle as any)(...args),
  hasPresence: () => true,
  now: () => new Date(secondAt),
} as any);
await Promise.all([realGate.work(() => epochCoordinator.advance()), realGate.work(() => epochCoordinator.advance())]);
assert.notEqual(
  (await readGated()).returnCatchup.batch.status,
  "recovering",
  "Concurrent polls do not create a recovery failure.",
);
await realGate.work(() => epochCoordinator.advance());
assert.equal((await readGated()).returnCatchup.batch.records[0].status, "settled");
await realGate.work(() => epochCoordinator.advance());
assert.equal((await readGated()).returnCatchup.batch.status, "completed");
realGate.dispose();

// A public poll uses the production root, relationship and immutable Memory
// stores, including the repair fence around the HTTP request.
const routeRows = new Map<string, any>();
const routeStore = {
  async getById(_package: string, id: string) {
    return structuredClone(routeRows.get(id) ?? null);
  },
  async list(_package: string, kind: string) {
    return structuredClone([...routeRows.values()].filter((row) => row.kind === kind));
  },
  async create(input: any) {
    const row = { ...structuredClone(input), revision: 1 };
    routeRows.set(input.id, row);
    return structuredClone(row);
  },
  async update(input: any) {
    const old = routeRows.get(input.id);
    if (!old || old.revision !== input.expectedRevision) return null;
    const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
    routeRows.set(input.id, row);
    return structuredClone(row);
  },
  async remove(_package: string, id: string, revision: number) {
    if (routeRows.get(id)?.revision !== revision) return false;
    return routeRows.delete(id);
  },
};
const releaseRouteRuntime = configureVillagesRuntime({
  persistence: { documents: routeStore },
  resources: {},
  languageModels: {
    resolveForRequest() {
      throw new Error("This settlement must not request a model.");
    },
  },
  isDebugAgentsEnabled: () => false,
  getAgentConfig: async () => ({ connectionId: "" }),
  json: { parseJsonish: (value: string) => JSON.parse(value) },
} as any);
const app = Fastify();
try {
  await mutateVillageMemoryState((state) => {
    Object.assign(state, structuredClone(storedWorld));
    delete state.returnCatchup;
    state.socialOutbox = [];
    for (const [id, receipt] of Object.entries(state.memoryReceipts))
      if (receipt.sceneId === "offscreen:" + batchSource.id) delete state.memoryReceipts[id];
  });
  await mutateRelationships(storedWorld.seed, (state) =>
    Object.assign(state, structuredClone(batchCapture.world.relationshipContext)),
  );
  const live = await readVillageMemorySnapshot();
  const captured = captureReturnContext(live, new Date(at));
  const projected = structuredClone({ ...live, ...captured.world });
  planRoutineDays(projected, new ZonedDate(at, live.timeZone));
  const routeSource = structuredClone(batchSource);
  routeSource.relationshipSnapshot = socialContextState(
    captured.world.relationshipContext,
    batchOpportunity.actorIds,
    batchOpportunity.facts.join(" "),
  );
  routeSource.admitted = captureResidentActivity(projected, true);
  const routeMemory = sceneMemoryContext(live, batchOpportunity.actorIds, batchOpportunity.facts.join(" "));
  const routeEncounter = routeSource.proposal.encounter as any;
  routeEncounter.memoryContexts = { [routeMemory.saved.protection.fingerprint]: routeMemory.saved };
  routeEncounter.memoryChanges[0].screening.fingerprint = routeMemory.saved.protection.fingerprint;
  await mutateVillageMemoryState((state) => {
    state.socialOutbox = [routeSource];
    state.returnCatchup = {
      capture: captured,
      batch: {
        id: "return-batch",
        status: "running",
        from: at,
        until: secondAt,
        opportunities: [batchOpportunity],
        records: [
          {
            opportunityId: batchOpportunity.id,
            status: "settling",
            outcome: { social: structuredClone(routeSource.proposal) },
          },
        ],
      },
    };
  });
  await villagesRoutes(app);
  const firstPoll = await app.inject({ url: "/background/catchup" });
  assert.equal(firstPoll.statusCode, 200, firstPoll.body);
  const secondPoll = await app.inject({ url: "/background/catchup" });
  assert.equal(secondPoll.statusCode, 200, secondPoll.body);
  const settled = await readVillageMemorySnapshot();
  assert.equal(
    settled.returnCatchup?.batch?.records?.[0]?.status,
    "settled",
    JSON.stringify({ outbox: settled.socialOutbox, batch: settled.returnCatchup?.batch }),
  );
  assert.ok(
    projectMemories(settled.memories, ["a"]).some((memory) => memory.text === "B agreed to a walk tomorrow."),
    JSON.stringify({
      memories: projectMemories(settled.memories, ["a"]).map((memory) => memory.text),
      revision: settled.memories.revision,
      head: routeRows.get("villages-village")?.data?.memoryHead,
      entries: [...routeRows.keys()].filter((key) => key.startsWith("villages-memory-")),
    }),
  );
  assert.equal(
    projectMemories(settled.memories, ["player"]).some((memory) => memory.text === "B agreed to a walk tomorrow."),
    false,
  );
} finally {
  await app.close();
  releaseRouteRuntime();
}
rawRows.clear();
for (const [id, row] of preEpochRows) rawRows.set(id, row);
realGate = createRepairGate(rawStore);
const revisionBefore = storedWorld.memories.revision;
failSettlement = false;
const conflictSettlement = createReturnCatchupSettlement({
  socialIdentity: fixtureCapturedAdmissions.socialIdentity,
  relationshipIdentity: fixtureRelationshipIdentity,
  gate: {
    simulate: realGate.simulate,
    commit: async (id: string, transaction: any) => {
      const row = rawRows.get("return-test-social");
      row.data.applied["unrelated-change"] = true;
      row.revision++;
      return realGate.commit(id, transaction);
    },
  },
  readSnapshot: readGated,
  mutate: mutateGated,
  processSocialOutbox: processGated,
} as any);
await assert.rejects(() => conflictSettlement.settle("return-batch", batchOpportunity.id), /changed/);
assert.equal(
  (rawRows.get("return-test-world").data as any).memories.revision,
  revisionBefore,
  "A concurrent change rejects the staged settlement.",
);
rawRows.get("return-test-social").data = structuredClone(batchCapture.world.relationshipContext);
rawRows.get("return-test-social").revision++;
failSettlement = true;
assert.equal(await realSettlement().settle("return-batch", batchOpportunity.id), "recovering");
assert.equal(
  (rawRows.get("return-test-social").data as any).applied[batchSource.id],
  undefined,
  "Failed staged relationship changes do not escape.",
);
assert.equal((rawRows.get("return-test-world").data as any).memories.revision, revisionBefore);
assert.equal((rawRows.get("return-test-world").data as any).socialOutbox[0].error, "Memory application failed");
failSettlement = false;
failWorldWrite = true;
await assert.rejects(
  () => realSettlement().settle("return-batch", batchOpportunity.id, true),
  /simulated interruption/,
);
realGate.dispose();
realGate = createRepairGate(rawStore);
const recovered = await readGated();
assert.equal(recovered.socialOutbox.length, 0, "Restart replays the retained local transaction.");
assert.equal(recovered.memories.revision, revisionBefore + 1);
assert.equal(recovered.returnCatchup.batch.records[0].status, "settled");
realGate.dispose();

// A concurrent later social development holds the exact original automatic source.
const stale = structuredClone(entry);
stale.id = "stale";
stale.proposal.encounter = { ...(stale.proposal.encounter as object), memoryChanges: [] };
village.socialOutbox = [stale];
await service.processSocialOutbox(await snapshot());
assert.equal(village.socialOutbox[0]!.reinterpretRequired, true);
assert.equal(Object.values(social.edges)[0]!.revision, 1);
assert.equal(await service.processSocialOutbox(await snapshot()), false);

// A maximum-size existing commitment remains cancellable without shortening its terms.
social.sharedRecords.invite = {
  id: "invite",
  revision: 1,
  kind: "commitment",
  text: "D".repeat(400),
  participants: ["a", "player"],
  status: "accepted",
  evidenceIds: ["message"],
};
const cancel = { ...social.sharedRecords.invite!, expectedRevision: 1, status: "cancelled" };
const review = parseRelationshipReview(
  {
    ...emptyRelationshipReview(),
    changes: [
      {
        fromId: "a",
        toId: "player",
        expectedRevision: 1,
        sceneAfter: { ...projection, records: [cancel] },
        liveAfter: { ...projection, records: [cancel] },
        reason: "The invitation was withdrawn",
        lineIds: ["withdraw"],
      },
    ],
  },
  "withdraw-source",
  [
    {
      id: "withdraw",
      speakerId: "a",
      role: "assistant",
      content: "I must cancel our meeting.",
      heardBy: ["a", "player"],
      kind: "mail",
      playerHeard: true,
    },
  ],
  { ...village, relationshipContext: social },
  true,
);
assert.equal(review.changes[0]!.liveAfter.records[0]!.status, "cancelled");
console.log(
  "Automatic social Events: historical timezone, retained errors, exact-source memory correction, stale revisions and full invitation terms passed.",
);
let automaticCalls = 0;
const writer = createResidentPlanning({
  relationshipIdentity: fixtureRelationshipIdentity,
  villagesLanguageModels: () => ({
    resolveForRequest: async () => ({
      model: "fixture",
      fitContext: (messages: any, options: any) => ({ messages, ...options }),
    }),
  }),
  villagesConnectionIdFor: async () => "system",
  backgroundCalls: { getStore: () => undefined },
  villagesDebugAgentsEnabled: () => false,
  villagesLogger: () => ({ debugOverride: () => {} }),
  completeWithRoom: async () => ({
    finishReason: "stop",
    content: JSON.stringify(
      ++automaticCalls === 1
        ? {
            routineIdea: null,
            housingRequests: [],
            social: { mail: { senderId: "a", text: "Hello.", invitation: { title: "Forged invitation" } } },
          }
        : { wishChanges: [], relationshipReview: emptyRelationshipReview(), memoryChanges: [] },
    ),
  }),
} as any);
const proposed = (await writer.handler.generate({
  context: {
    version: 1,
    village: "Preview",
    setting: "A quiet cafe",
    moment: deriveVillageMoment({ foundedAt: at, seed: "events", now: new ZonedDate(at, village.timeZone) }),
    residents: [],
    recent: [],
    venues: [],
    opportunities: [{ ...entry.opportunity, facts: [] }],
    forced: false,
    lastSimulatedAt: at,
    opportunity: { ...entry.opportunity, facts: [] },
    memory: sceneMemoryContext(village, ["a"], "Hello"),
    pendingHousingCharacterIds: [],
    social: { state: social, candidates: [], relationships: [] },
  },
} as any)) as any;
assert.equal(automaticCalls, 2);
assert.equal(
  (proposed.social!.mail as any).invitation,
  undefined,
  "Writer metadata cannot bypass independent invitation adjudication",
);
