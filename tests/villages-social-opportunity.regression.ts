import assert from "node:assert/strict";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { residentPlanningOpportunity } from "../packages/villages/src/server/domain/rules/resident-planning.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { deriveVillageMoment } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import { returnCatchupOpportunities } from "../packages/villages/src/server/domain/rules/return-catchup-opportunities.js";
import {
  captureReturnContext,
  departureMemoriesAvailable,
} from "../packages/villages/src/server/domain/rules/return-catchup-capture.js";
import { initialOpening } from "../packages/villages/src/server/domain/rules/opening-project.js";
import { createReturnCatchup } from "../packages/villages/src/server/features/background/return-catchup-service.js";
import {
  discoverReturnBatch,
  recordReturnVisibility,
} from "../packages/villages/src/server/domain/rules/return-catchup-state.js";

const state = defaultVillageState();
state.seed = "social-opportunity";
state.venues = [{ id: "commons", classes: ["workplace"], occupancy: {} }] as any;
state.villagers = ["ada", "ben"].map((characterId) => ({
  characterId,
  cardSnapshot: { name: characterId },
  wishes: [],
  agenda: { day: [] },
})) as any;
const now = new Date("2026-10-26T17:00:00.000Z");
const moment = deriveVillageMoment({ foundedAt: now.toISOString(), seed: state.seed, now });
const opportunity = () => residentPlanningOpportunity(state, moment, now.toISOString())!;
assert.equal(
  opportunity().kind,
  "routine",
  "An available resident is a social opportunity without a physical encounter",
);
assert.deepEqual(opportunity().actorIds, ["ada"]);
state.eventAttempts = {
  highWaterDate: "2026-10-26",
  lastAttemptAt: now.toISOString(),
  attempts: [{ id: "first", date: "2026-10-26", at: now.toISOString() }],
};
assert.deepEqual(
  opportunity().actorIds,
  ["ben"],
  "Fallback contact consideration rotates rather than always choosing the first resident",
);
assert.equal(opportunity().kind, "routine", "Different residents are never asserted to share a Zone");
assert.equal(opportunity().venueId, "", "No current location is invented for an available correspondent");
state.villagers = [];
state.venues = [{ id: "commons", classes: ["workplace"], occupancy: {} }] as any;
assert.equal(opportunity(), null, "Weather alone does not admit paid resident activity");
const capture = defaultVillageState();
capture.seed = "captured";
capture.relationshipContext = defaultRelationshipState(capture.seed);
capture.foundedAt = now.toISOString();
capture.timeZone = "UTC";
const venue = venueDraft(
  { id: "commons", name: "Commons", form: "Hall", description: "A hall.", category: "public" },
  null,
);
capture.venues = [venue];
capture.villagers = ["ada", "ben"].map((characterId) => {
  const agenda = unwrittenVillageAgenda([venue], characterId, now);
  const block = { startMinute: 0, endMinute: 1440, venueId: venue.id, activity: "Visiting" };
  agenda.week.Monday = [block];
  agenda.activeDay!.blocks = [block];
  return {
    characterId,
    addedAt: now.toISOString(),
    cardSnapshot: { name: characterId, capturedAt: now.toISOString() },
    agenda,
    wishes: [],
  } as any;
});
const afterTwoHours = new Date(now.getTime() + 2 * 3_600_000);
const savedCapture = captureReturnContext(capture, now);
assert.deepEqual(
  coerceVillageState({ ...defaultVillageState(), returnCatchup: { capture: savedCapture } }).returnCatchup?.capture,
  savedCapture,
);
assert.throws(
  () =>
    coerceVillageState({
      ...defaultVillageState(),
      returnCatchup: { capture: { ...savedCapture, memoryRevision: -1 } },
    }),
  /departure capture/,
);
assert.throws(
  () =>
    coerceVillageState({
      ...defaultVillageState(),
      returnCatchup: { capture: { ...savedCapture, world: { ...savedCapture.world, villagers: [null] } } },
    }),
  /departure capture/,
);
assert.throws(
  () =>
    coerceVillageState({
      ...defaultVillageState(),
      returnCatchup: { capture: { ...savedCapture, world: { ...savedCapture.world, timeZone: "not/a-zone" } } },
    }),
  /departure capture/,
);
capture.venues[0]!.name = "Renamed later";
assert.equal(savedCapture.world.venues[0]!.name, "Commons", "Later changes cannot rewrite the departure capture.");
assert.equal(savedCapture.memoryRevision, capture.memories.revision);
assert.equal(Object.hasOwn(savedCapture.world, "memories"), false, "The capture does not duplicate the Memory ledger.");
assert.equal(departureMemoriesAvailable(savedCapture, capture), true);
const changedMemory = structuredClone(capture);
changedMemory.memories.revision++;
assert.equal(
  departureMemoriesAvailable(savedCapture, changedMemory),
  false,
  "Later Memory changes cannot be used as departure knowledge.",
);
const frozen = { ...defaultVillageState(), ...savedCapture.world };
const planned = returnCatchupOpportunities(frozen, now, afterTwoHours, 3);
assert.equal(planned.opportunities.length, 1, "Repeated overlapping routines do not invent repeated encounters.");
assert.equal(planned.opportunities[0]!.kind, "encounter");
assert.deepEqual(planned.opportunities[0]!.actorIds, ["ada", "ben"]);
assert.ok(Date.parse(planned.opportunities[0]!.startsAt) > now.getTime());
const openingWorld = structuredClone(frozen);
openingWorld.venues[0]!.residentIds = ["ada"];
openingWorld.opening = initialOpening(["ada"], venue.id, "opening");
openingWorld.opening.stage = "conversations";
const openingCapture = captureReturnContext(openingWorld, now);
openingWorld.opening.stage = "complete";
assert.ok(
  returnCatchupOpportunities(
    { ...defaultVillageState(), ...openingCapture.world },
    now,
    afterTwoHours,
    3,
  ).opportunities.every((row) => !row.actorIds.includes("ada")),
  "A resident held at an unrevealed opening position cannot be assigned an offscreen event.",
);
assert.deepEqual(returnCatchupOpportunities(capture, now, afterTwoHours, 0).opportunities, []);
assert.deepEqual(returnCatchupOpportunities(capture, now, new Date(now.getTime() + 59 * 60_000), 3).opportunities, []);
const tracking = { ...defaultVillageState(), ...structuredClone(savedCapture.world), setupAt: now.toISOString() };
const unavailable = { ...tracking, relationshipContext: undefined };
recordReturnVisibility(unavailable, now);
discoverReturnBatch(unavailable, afterTwoHours, "unknown-context");
assert.equal(unavailable.returnCatchup?.batch?.status, "completed");
assert.equal(
  unavailable.returnCatchup?.batch?.opportunities?.length,
  0,
  "Unavailable relationship context cannot authorize resident work even when both live and capture are unavailable",
);
discoverReturnBatch(tracking, afterTwoHours, "batch-before-first-visibility");
assert.equal(tracking.returnCatchup, undefined, "Existing saves do not invent a pre-feature absence.");
recordReturnVisibility(tracking, now);
discoverReturnBatch(tracking, new Date(now.getTime() + 59 * 60_000), "short-return");
assert.equal(tracking.returnCatchup?.batch, undefined, "Short breaks do not create a batch.");
discoverReturnBatch(tracking, afterTwoHours, "grounded-return");
assert.equal(tracking.returnCatchup?.batch?.status, "queued");
assert.equal(tracking.returnCatchup?.batch?.opportunities?.length, 1);
assert.equal(tracking.returnCatchup?.batch?.budgetDate, "2026-10-26");
assert.equal(tracking.returnCatchup?.batch?.opportunityLimit, 6);
assert.deepEqual(coerceVillageState(structuredClone(tracking)).returnCatchup, tracking.returnCatchup);
for (const [pace, expected] of [
  ["quiet", 2],
  ["balanced", 6],
  ["lively", 6],
] as const) {
  const world = structuredClone(tracking);
  world.returnCatchup = undefined;
  world.backgroundPace = pace;
  for (const resident of world.villagers) {
    const visiting = resident.agenda!.week!.Monday!;
    for (const day of ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const)
      resident.agenda!.week![day] = structuredClone(visiting);
  }
  recordReturnVisibility(world, now);
  discoverReturnBatch(world, new Date(now.getTime() + 7 * 86_400_000), "bounded-" + pace);
  assert.equal(world.returnCatchup!.batch!.opportunityLimit, expected);
  assert.equal(
    world.returnCatchup!.batch!.opportunities!.length,
    expected,
    "Busy's twelve reviews do not enlarge catch-up.",
  );
}
for (const patch of [{ opportunityLimit: 7 }, { budgetDate: 12 }, { budgetDate: undefined }]) {
  const malformed = structuredClone(tracking);
  Object.assign(malformed.returnCatchup!.batch!, patch);
  assert.throws(() => coerceVillageState(malformed), /catch-up allowance/);
}
const legacyBatch = structuredClone(tracking);
delete legacyBatch.returnCatchup!.batch!.budgetDate;
delete legacyBatch.returnCatchup!.batch!.opportunityLimit;
assert.deepEqual(coerceVillageState(legacyBatch).returnCatchup, legacyBatch.returnCatchup);
const malformedBatch = structuredClone(tracking);
malformedBatch.returnCatchup!.batch!.opportunities![0]!.actorIds.push("player");
assert.throws(() => coerceVillageState(malformedBatch), /catch-up opportunities/);
const historyWorld = structuredClone(tracking);
historyWorld.returnCatchup!.batch!.status = "completed";
const firstAccount = structuredClone(historyWorld.returnCatchup!.batch!);
recordReturnVisibility(historyWorld, afterTwoHours);
discoverReturnBatch(historyWorld, new Date(afterTwoHours.getTime() + 2 * 3_600_000), "second-return");
assert.deepEqual(historyWorld.returnCatchup!.history, [firstAccount], "Only a finished batch is archived.");
assert.equal(historyWorld.returnCatchup!.batch!.id, "second-return");
assert.deepEqual(coerceVillageState(structuredClone(historyWorld)).returnCatchup, historyWorld.returnCatchup);
const beforeActiveDiscovery = structuredClone(historyWorld.returnCatchup);
historyWorld.returnCatchup!.batch!.status = "running";
discoverReturnBatch(historyWorld, new Date(afterTwoHours.getTime() + 4 * 3_600_000), "third-return");
assert.deepEqual(
  historyWorld.returnCatchup!.history,
  beforeActiveDiscovery!.history,
  "Active work cannot be archived or replaced.",
);
const badHistory = structuredClone(historyWorld);
badHistory.returnCatchup!.history![0]!.status = "running";
assert.throws(() => coerceVillageState(badHistory), /unfinished work/);
const duplicateHistory = structuredClone(historyWorld);
duplicateHistory.returnCatchup!.history!.push(structuredClone(duplicateHistory.returnCatchup!.history![0]!));
assert.throws(() => coerceVillageState(duplicateHistory), /catch-up history/);
const empty = {
  ...defaultVillageState(),
  ...structuredClone(savedCapture.world),
  setupAt: now.toISOString(),
  villagers: [],
};
recordReturnVisibility(empty, now);
discoverReturnBatch(empty, afterTwoHours, "empty-return");
assert.equal(empty.returnCatchup?.batch?.status, "completed", "No grounded opportunities require no hold.");
discoverReturnBatch(empty, afterTwoHours, "duplicate-empty-return");
assert.equal(empty.returnCatchup?.batch?.id, "empty-return", "Repeated discovery cannot duplicate an absence.");
assert.equal(empty.returnCatchup?.history, undefined);
const off = {
  ...defaultVillageState(),
  ...structuredClone(savedCapture.world),
  setupAt: now.toISOString(),
  backgroundPace: "off" as const,
};
recordReturnVisibility(off, now);
discoverReturnBatch(off, afterTwoHours, "off-return");
assert.equal(off.returnCatchup?.batch?.status, "completed", "Disabled activity creates no queued model work.");
const boundedHistory = structuredClone(off);
for (let index = 1; index <= 23; index++) {
  const departure = new Date(now.getTime() + index * 2 * 3_600_000);
  recordReturnVisibility(boundedHistory, departure);
  discoverReturnBatch(boundedHistory, new Date(departure.getTime() + 3_600_000), `history-${index}`);
}
assert.equal(boundedHistory.returnCatchup!.history!.length, 20);
assert.equal(boundedHistory.returnCatchup!.history![0]!.id, "history-3");
assert.equal(boundedHistory.returnCatchup!.batch!.id, "history-23");
assert.deepEqual(coerceVillageState(structuredClone(boundedHistory)).returnCatchup, boundedHistory.returnCatchup);
const replayHistory = structuredClone(boundedHistory.returnCatchup);
recordReturnVisibility(boundedHistory, new Date(now.getTime() + 50 * 3_600_000));
discoverReturnBatch(boundedHistory, new Date(now.getTime() + 51 * 3_600_000), "history-10");
assert.deepEqual(
  boundedHistory.returnCatchup!.history,
  replayHistory!.history,
  "A historical identity cannot be reused.",
);
assert.equal(boundedHistory.returnCatchup!.batch!.id, "history-23");
const changedKnowledge = {
  ...defaultVillageState(),
  ...structuredClone(savedCapture.world),
  setupAt: now.toISOString(),
};
recordReturnVisibility(changedKnowledge, now);
changedKnowledge.memories.revision++;
discoverReturnBatch(changedKnowledge, afterTwoHours, "changed-memory-return");
assert.equal(changedKnowledge.returnCatchup?.batch?.status, "completed");
assert.match(changedKnowledge.returnCatchup?.batch?.reason ?? "", /memories changed/i);
let working = structuredClone(tracking);
const dispatched: string[] = [];
const coordinator = createReturnCatchup({
  readSnapshot: async () => structuredClone(working),
  mutate: async (change: any) => {
    change(working);
    return structuredClone(working);
  },
  queue: async (_batch: string, opportunity: any) => {
    dispatched.push(opportunity.id);
  },
  job: async () => null,
  retryJob: async () => {},
  cancel: async () => {
    working.returnCatchup!.batch!.status = "cancelled";
    delete working.returnCatchup!.capture;
  },
  settle: async () => "settled",
  hasPresence: () => true,
  now: () => afterTwoHours,
} as any);
await coordinator.advance();
assert.deepEqual(dispatched, [tracking.returnCatchup!.batch!.opportunities![0]!.id]);
assert.equal(working.returnCatchup!.batch!.records![0]!.status, "queued");
working.returnCatchup!.batch!.records![0]!.status = "settled";
await coordinator.advance();
assert.equal(working.returnCatchup!.batch!.status, "completed");
assert.equal(
  working.returnCatchup!.capture!.at,
  afterTwoHours.toISOString(),
  "A completed visible return establishes a new boundary.",
);
working = structuredClone(tracking);
working.returnCatchup!.batch!.opportunities = [];
working.returnCatchup!.batch!.records = [];
working.relationshipContext = { ...working.relationshipContext, seed: "changed-relationship-authority" } as any;
await coordinator.advance();
assert.equal(working.returnCatchup!.batch!.status, "failed", "An empty selection cannot hide a relationship race.");
assert.match(working.returnCatchup!.batch!.reason!, /relationships changed/i);
working = structuredClone(tracking);
working.returnCatchup!.batch!.status = "failed";
working.returnCatchup!.batch!.records![0]!.status = "queued";
let releaseRetry: (() => void) | undefined;
const retryCoordinator = createReturnCatchup({
  readSnapshot: async () => structuredClone(working),
  mutate: async (change: any) => {
    change(working);
    return structuredClone(working);
  },
  queue: async () => {},
  job: async () => ({ id: "job", status: "failed", attempt: 1, error: "failed" }),
  retryJob: async () =>
    new Promise<void>((resolve) => {
      releaseRetry = resolve;
    }),
  cancel: async () => {},
  settle: async () => "settled",
  hasPresence: () => true,
  now: () => afterTwoHours,
} as any);
const retrying = retryCoordinator.retry("grounded-return", "retry-action");
for (let count = 0; count < 20 && !releaseRetry; count++) await new Promise<void>((resolve) => setImmediate(resolve));
assert.ok(releaseRetry);
await retryCoordinator.advance();
assert.equal(working.returnCatchup!.batch!.status, "running", "A poll cannot undo an in-flight retry.");
releaseRetry();
await retrying;
working = structuredClone(tracking);
let rejectQueue: ((error: Error) => void) | undefined;
const raceCoordinator = createReturnCatchup({
  readSnapshot: async () => structuredClone(working),
  mutate: async (change: any) => {
    change(working);
    return structuredClone(working);
  },
  queue: async () =>
    new Promise<void>((_resolve, reject) => {
      rejectQueue = reject;
    }),
  job: async () => null,
  retryJob: async () => {},
  cancel: async () => {
    working.returnCatchup!.batch!.status = "cancelled";
    delete working.returnCatchup!.capture;
  },
  settle: async () => "settled",
  hasPresence: () => true,
  now: () => afterTwoHours,
} as any);
const pendingAdvance = raceCoordinator.advance();
for (let count = 0; count < 20 && !rejectQueue; count++) await new Promise<void>((resolve) => setImmediate(resolve));
assert.ok(rejectQueue);
await raceCoordinator.continueToVillage("grounded-return");
rejectQueue(new Error("queue interrupted"));
await pendingAdvance;
assert.equal(working.returnCatchup!.batch!.status, "cancelled", "A late queue error cannot reopen a cancelled batch.");
const inaccessible = structuredClone(capture);
for (const resident of inaccessible.villagers) resident.agenda!.activeDay!.blocks[0]!.zoneId = "missing-zone";
assert.ok(
  returnCatchupOpportunities(inaccessible, now, afterTwoHours, 3).opportunities.every(
    (row) => row.kind !== "encounter",
  ),
  "A fallback Zone does not turn an inaccessible scheduled Zone into an encounter.",
);
assert.match(returnCatchupOpportunities(inaccessible, now, afterTwoHours, 3).reason, /Zones could not be verified/);
const sleeping = structuredClone(capture);
for (const resident of sleeping.villagers) resident.agenda!.activeDay!.blocks[0]!.activity = "Sleeping";
assert.deepEqual(returnCatchupOpportunities(sleeping, now, afterTwoHours, 3).opportunities, []);
assert.match(returnCatchupOpportunities(sleeping, now, afterTwoHours, 3).reason, /Sleeping intervals/);
const longAbsence = structuredClone(capture);
for (const resident of longAbsence.villagers) {
  delete resident.agenda!.routineProfile;
  for (const weekday of Object.keys(resident.agenda!.week))
    resident.agenda!.week[weekday] = [{ startMinute: 0, endMinute: 1440, activity: "Sleeping", venueId: "" }];
  resident.agenda!.week.Monday = [
    { startMinute: 0, endMinute: 555, activity: "Sleeping", venueId: "" },
    { startMinute: 555, endMinute: 560, activity: "Visiting", venueId: venue.id },
    { startMinute: 560, endMinute: 1440, activity: "Sleeping", venueId: "" },
  ];
}
assert.ok(
  returnCatchupOpportunities(longAbsence, now, new Date(now.getTime() + 14 * 24 * 3_600_000), 3).opportunities.some(
    (row) => row.kind === "encounter",
  ),
  "A short weekly overlap remains discoverable after a long absence.",
);
const noInfluence = structuredClone(frozen);
for (const resident of noInfluence.villagers) {
  resident.addedAt = resident.cardSnapshot.capturedAt = "2026-10-24T12:00:00.000Z";
  resident.scheduleInfluence = {
    version: 1,
    enabled: false,
    categories: { rhythm: true, busyFree: true, weekdayWeekend: true, interests: true, establishedEntities: true },
  };
  resident.agenda!.activeDay = undefined;
  resident.agenda!.plannedDays = {};
  resident.agenda!.scheduleInfluenceSnapshot = {
    version: 1,
    signature: "test",
    available: true,
    enabled: true,
    rhythms: [{ weekday: "Monday", startMinute: 0, endMinute: 600 }],
    busy: [],
    interests: [],
    entities: [],
    adopted: [],
    unresolved: [],
  };
  resident.agenda!.routineProfile = {
    version: 1,
    activities: [
      { activity: "Visiting", venueId: venue.id, duration: 60, parts: [1], flexible: true, essential: false },
    ],
    days: Array.from({ length: 7 }, () => [0, 0, 0, 0, 0, 0, 0, 0]),
    rhythm: [],
    seedWeek: Object.fromEntries(
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => [
        day,
        day === "Monday"
          ? [
              { startMinute: 0, endMinute: 540, activity: "Sleeping", venueId: "", flexible: false },
              { startMinute: 540, endMinute: 600, activity: "Visiting", venueId: venue.id, flexible: true },
              { startMinute: 600, endMinute: 1440, activity: "Sleeping", venueId: "", flexible: false },
            ]
          : [{ startMinute: 0, endMinute: 1440, activity: "Sleeping", venueId: "", flexible: false }],
      ]),
    ),
  };
}
assert.ok(
  returnCatchupOpportunities(
    noInfluence,
    new Date("2026-10-25T12:00:00Z"),
    new Date("2026-10-26T10:00:00Z"),
    3,
  ).opportunities.some((row) => row.kind === "encounter" && row.startsAt < "2026-10-26T10:00"),
  "Selection uses the resident's disabled influence setting instead of shifting the saved routine.",
);
const dst = structuredClone(frozen);
dst.timeZone = "America/Los_Angeles";
for (const resident of dst.villagers) {
  resident.agenda!.activeDay!.dateKey = "2026-11-01";
  resident.agenda!.activeDay!.blocks = [
    { startMinute: 0, endMinute: 70, activity: "Sleeping", venueId: "" },
    { startMinute: 70, endMinute: 80, activity: "Visiting", venueId: venue.id },
    { startMinute: 80, endMinute: 1440, activity: "Sleeping", venueId: "" },
  ];
}
const repeated = returnCatchupOpportunities(dst, new Date("2026-11-01T09:00:00Z"), new Date("2026-11-01T10:05:00Z"), 3);
assert.ok(repeated.opportunities.some((row) => row.kind === "encounter" && row.startsAt >= "2026-11-01T09:10"));
for (const resident of dst.villagers) {
  resident.agenda!.activeDay!.dateKey = "2027-03-14";
  resident.agenda!.activeDay!.blocks = [
    { startMinute: 0, endMinute: 130, activity: "Sleeping", venueId: "" },
    { startMinute: 130, endMinute: 140, activity: "Visiting", venueId: venue.id },
    { startMinute: 140, endMinute: 1440, activity: "Sleeping", venueId: "" },
  ];
}
assert.deepEqual(
  returnCatchupOpportunities(dst, new Date("2027-03-14T09:30:00Z"), new Date("2027-03-14T10:35:00Z"), 3).opportunities,
  [],
  "A missing spring-forward time cannot host an encounter.",
);
capture.villagers[1]!.addedAt = afterTwoHours.toISOString();
assert.ok(
  returnCatchupOpportunities(capture, now, afterTwoHours, 3).opportunities.every(
    (row) => !row.actorIds.includes("ben"),
  ),
);
capture.villagers[0]!.cardSnapshot.capturedAt = "invalid";
assert.deepEqual(returnCatchupOpportunities(capture, now, afterTwoHours, 3).opportunities, []);
console.log("Resident fallback opportunities, rotation and weather-only classification passed.");
