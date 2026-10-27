import assert from "node:assert/strict";
import {
  readEffectiveVillagerCard,
  readVillagerCard,
} from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { backgroundRevision } from "../packages/villages/src/server/domain/rules/background-revision.js";
import { reserveEventAttempt } from "../packages/villages/src/server/domain/rules/event-attempts.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { localDateKey } from "../packages/villages/src/server/domain/rules/resident-planning.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import { createResidentPlanning } from "../packages/villages/src/server/features/residents/resident-planning-service.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";

const now = new Date(),
  at = now.toISOString(),
  dateKey = localDateKey(now);
function fixture() {
  const state = defaultVillageState();
  state.seed = "planning";
  state.name = "Test";
  state.setting = "A shared village";
  state.setupAt = state.foundedAt = state.simulatedThrough = at;
  state.backgroundPace = "lively";
  state.venues = [
    venueDraft(
      { id: "square", name: "Square", form: "Square", description: "An open square.", category: "public" },
      null,
    ),
    venueDraft({ id: "home", name: "Empty home", form: "House", description: "A home.", category: "residence" }, null),
  ];
  state.venues[0].occupancy.residentCharacterId = "a";
  state.villagers = [
    {
      characterId: "a",
      cardSnapshot: snapshotFromCard(readVillagerCard({ id: "a", comment: "", data: { name: "Ada" } }), 1),
      addedAt: at,
      wishes: [],
      remap: null,
      remapFailure: null,
      agenda: {
        day: [],
        routineSummary: "A quiet day",
        source: "village",
        generatedAt: at,
        routineProfile: {
          version: 1,
          activities: [
            { activity: "Resting", venueId: "", flexible: true, essential: false, duration: 90, parts: [0, 1, 2, 3] },
          ],
          days: Array.from({ length: 7 }, () => [0, 0, 0, 0, 0, 0, 0, 0]),
          rhythm: [],
        },
      },
    },
  ] as any;
  state.relationshipContext = defaultRelationshipState(state.seed);
  state.relationshipContext.reviewedActorIds = ["a"];
  const queued: any[] = [],
    calls: any[] = [];
  let payload: any = { social: null, routineIdea: null, housingRequests: [] },
    legacy: any = null;
  const model: any = {
    connectionId: "fixture",
    model: "fixture",
    maxOutputTokens: 4096,
    maxContext: 100000,
    fitContext: (messages: any, options: any) => ({ messages, ...options }),
  };
  const service = createResidentPlanning({
    readVillageState: async () => state,
    readEffectiveVillagerCard,
    queueBackgroundJob: async (input) => {
      queued.push(input);
    },
    backgroundJobSnapshot: async (kind) => (kind === "story" ? legacy : null),
    villagesLanguageModels: () => ({ resolveForRequest: async () => model }) as any,
    villagesConnectionIdFor: async () => "fixture",
    completeWithRoom: async (_model, messages, _tokens, options) => {
      calls.push({ messages, options });
      return {
        finishReason: "stop",
        content: JSON.stringify(
          messages[0].content.startsWith("Independently interpret")
            ? {
                wishChanges: [],
                memoryChanges: [],
                relationshipReview: { changes: [], permissions: [], disclosures: [] },
              }
            : payload,
        ),
      } as any;
    },
  });
  return {
    state,
    service,
    queued,
    calls,
    payload: (value: any) => (payload = value),
    legacy: (value: any) => (legacy = value),
  };
}
const f = fixture();
await f.service.reconcile(now);
assert.equal(f.calls.length, 0, "Discovery queues work without dispatching a model");
assert.equal(f.queued[0].kind, "resident-planning");
assert.equal(f.queued[0].finite, false);
const input = f.queued[0].input;
assert.equal(input.opportunity.kind, "routine", "A lone resident still gets routine and housing choices");
const quiet: any = await f.service.handler.generate(input);
assert.equal(f.calls.length, 1);
assert.deepEqual(quiet, { housingRequests: [], routineIdea: undefined, social: undefined, wishReflection: null });
assert.equal(f.service.handler.valid(f.state, input), true);
reserveEventAttempt(f.state, f.queued[0].revision, dateKey, now.getTime());
f.service.handler.apply(f.state, input, quiet, { retrying: false });
assert.equal(f.state.lastPlanningDate, dateKey);
assert.equal(f.state.planningUsage.count, 1);
await f.service.reconcile(now);
assert.equal(f.queued.length, 1, "A quiet result retains the 15 minute spacing");
f.service.handler.apply(f.state, input, quiet, { retrying: true });
assert.equal(f.state.planningUsage.count, 1, "Replay cannot spend or apply the allowance twice");
assert.equal(Object.hasOwn(f.state, "happenings"), false);
assert.equal(Object.hasOwn(quiet, "happenings"), false);

const effects = fixture();
await effects.service.reconcile(now);
const e = effects.queued[0].input;
effects.payload({
  social: null,
  routineIdea: { characterId: "a", activity: "Reading by the window", venueId: "", flexible: true },
  housingRequests: [{ who: "a", kind: "move", venueId: "home" }],
  memory: [{ text: "forged" }],
  notices: [{ text: "forged" }],
  featureEdits: [{}],
});
const proposal: any = await effects.service.handler.generate(e);
effects.service.handler.apply(effects.state, e, proposal, { retrying: false });
assert.equal(effects.state.residences[0].status, "pending");
assert.equal(effects.state.residences[0].requestedBy, "villager");
assert.equal(effects.state.venues[1].occupancy.residentCharacterId, null, "A request never moves its resident");
assert(
  effects.state.villagers[0].agenda!.routineProfile!.activities.some((row) => row.activity === "Reading by the window"),
);
assert.equal(effects.state.memories.records.length, 0);
assert.equal(effects.state.noticeboard.length, 0);
assert.equal(Object.hasOwn(proposal, "memory"), false);
const changed = structuredClone(effects.state);
changed.villagers[0].cardSnapshot.capturedAt = "changed";
assert.equal(effects.service.handler.valid(changed, e), false);
const off = fixture();
off.state.backgroundPace = "off";
await off.service.reconcile(now);
assert.equal(off.queued.length, 0);
for (const status of ["failed", "interrupted", "paused", "obsolete", "completed"]) {
  const old = fixture();
  old.legacy({ seed: old.state.seed, status, highWaterDate: dateKey });
  await old.service.reconcile(now);
  assert.equal(old.queued.length, 0, status + " legacy attempts retain their spending floor");
}
const oldWorld = fixture();
oldWorld.legacy({ seed: "previous", highWaterDate: dateKey });
await oldWorld.service.reconcile(now);
assert.equal(oldWorld.queued.length, 1, "Another world's job cannot block this world");

const social = fixture();
await social.service.reconcile(now);
const si = social.queued[0].input;
si.opportunity.kind = "encounter";
si.opportunity.actorIds = ["a", "b"];
social.payload({
  routineIdea: null,
  housingRequests: [],
  social: {
    encounter: {
      opportunityId: si.opportunity.id,
      lines: [
        { speakerId: "a", text: "Shall we compare sketches tomorrow?" },
        { speakerId: "b", text: "Yes, after breakfast." },
      ],
      memoryChanges: [{ text: "forged" }],
      semanticVersion: 99,
    },
  },
});
const accepted: any = await social.service.handler.generate(si);
assert.equal(social.calls.length, 2, "An offered encounter retains independent interpretation");
assert.equal(accepted.social.encounter.semanticVersion, 2);
assert.deepEqual(accepted.social.encounter.memoryChanges, []);
social.service.handler.apply(social.state, si, accepted, { retrying: false });
assert.equal(social.state.socialOutbox!.length, 1);
assert.equal(social.state.memories.records.length, 0, "Only encounter settlement can create witnessed memory");
const invalid = fixture();
await invalid.service.reconcile(now);
invalid.payload({});
await assert.rejects(invalid.service.handler.generate(invalid.queued[0].input), /incomplete choices/);
assert.equal(invalid.calls.length, 1, "Malformed output never buys an automatic repair");

const legacyRaw: any = { ...effects.state };
delete legacyRaw.backgroundPace;
delete legacyRaw.lastPlanningDate;
delete legacyRaw.planningUsage;
delete legacyRaw.processedActionIds;
Object.assign(legacyRaw, {
  storyPace: "off",
  lastCreativeDate: "2026-10-24",
  timeZone: "",
  lastKnownTimeZone: "America/Los_Angeles",
  processedOpportunityIds: ["accepted-move"],
  happenings: Array.from({ length: 3 }, (_, i) => ({
    id: String(i),
    occurredAt: "2026-10-25T06:30:00.000Z",
    text: "old prose",
  })),
  scheduledEvents: [{ id: "unused" }],
  socialOutbox: [
    {
      id: "accepted-social",
      seed: effects.state.seed,
      at,
      opportunity: {
        id: "original",
        kind: "encounter",
        actorIds: ["a", "b"],
        venueId: "square",
        startsAt: at,
        endsAt: at,
        facts: [],
      },
      candidates: [],
      proposal: {},
    },
  ],
});
const migrated = coerceVillageState(legacyRaw);
assert.equal(migrated.backgroundPace, "off");
assert.equal(migrated.lastPlanningDate, "2026-10-24");
assert.deepEqual(
  migrated.planningUsage,
  { dateKey: "2026-10-24", count: 3 },
  "Legacy counts use their local calendar across UTC midnight",
);
assert(migrated.processedActionIds.includes("accepted-move"));
assert.deepEqual(migrated.memories, effects.state.memories);
assert.equal(migrated.socialOutbox![0].opportunity.id, "original");
assert.equal(migrated.residences[0].status, "pending");
assert.equal(migrated.residences[0].proposedVenueId, "home");
assert.equal(Object.hasOwn(migrated, "happenings"), false);
assert.equal(Object.hasOwn(migrated, "scheduledEvents"), false);
assert.deepEqual(coerceVillageState(JSON.parse(JSON.stringify(migrated))).planningUsage, migrated.planningUsage);

// Retired purchased responses are never dispatched, applied or retried, but retain normal reset cleanup.
const rows = new Map<string, any>(),
  state = defaultVillageState();
state.seed = "retirement";
let dispatched = 0,
  applied = 0;
const work = createBackgroundWork({
  villagesDocuments: () =>
    ({
      getById: async (_p: string, id: string) => structuredClone(rows.get(id) ?? null),
      list: async (_p: string, kind: string) =>
        [...rows.values()].filter((row) => row.kind === kind).map((row) => structuredClone(row)),
      create: async (input: any) => {
        const row = { ...input, revision: 1, updatedAt: at };
        rows.set(row.id, row);
        return row;
      },
      update: async (input: any) => {
        const previous = rows.get(input.id);
        if (!previous || previous.revision !== input.expectedRevision) return null;
        const row = { ...previous, ...input, revision: previous.revision + 1, updatedAt: at };
        rows.set(row.id, row);
        return row;
      },
      remove: async (_p: string, id: string) => rows.delete(id),
    }) as any,
  villagesLogger: () => ({ warn() {}, debug() {}, info() {}, error() {} }) as any,
  readVillageState: async () => state,
  mutateVillageState: async (edit) => {
    edit(state);
    return state;
  },
  withUsagePurpose: async (_purpose: any, fn: any) => fn(),
  measurePipeline: async (_name: any, _meta: any, fn: any) => fn(),
  runtimeDebug: () => {},
  backgroundCalls: { run: (_complete: any, fn: any) => fn() } as any,
  handlers: [
    [
      "story",
      {
        generate: async () => {
          dispatched++;
        },
        valid: () => true,
        apply: () => {
          applied++;
        },
      },
    ],
  ],
} as any);
const rawResponse = { content: "purchased private response", finishReason: "stop" };
const ids: string[] = [];
for (const status of ["queued", "paused", "failed", "interrupted", "completed"]) {
  const id = "villages-background-" + backgroundRevision(["story", status]);
  ids.push(id);
  rows.set(id, {
    id,
    kind: "background-work",
    updatedAt: at,
    revision: 1,
    data: {
      id: "job-" + status,
      kind: "story",
      subjectId: status,
      seed: state.seed,
      status,
      owner: "old",
      attempt: 1,
      steps: [{ fingerprint: "old", status: "completed", response: rawResponse }],
      input: { context: { setting: "private" } },
      result: { housingRequests: [] },
      hasResult: true,
      highWaterDate: dateKey,
      requests: 1,
      tokens: 12,
      retryActions: [],
    },
  });
}
const stop = work.startBackgroundWork();
await work.recoverBackgroundWork();
await work.settleBackgroundWork();
for (const id of ids) {
  assert.equal(rows.get(id).data.status, "obsolete");
  assert.deepEqual(rows.get(id).data.steps[0].response, rawResponse);
  await assert.rejects(work.retryBackgroundJob(id, 1, "retry-old"), /retired/);
}
assert.equal(dispatched, 0);
assert.equal(applied, 0);
assert.deepEqual(await work.backgroundWorkSummaries(), []);
assert.equal(rows.size, ids.length, "Current-world purchased evidence is retained");
state.seed = "reset-world";
await work.backgroundWorkSummaries();
assert.equal(rows.size, 0, "Reset still removes another world's private job records");
stop();
console.log(
  "Resident planning preserves quiet outcomes, routine/housing proposals, independent social checks, pacing, legacy spending floors and private recovery boundaries.",
);
