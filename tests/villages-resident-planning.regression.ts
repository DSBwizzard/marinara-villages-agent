import { fixtureWishIdentity, fixtureRelationshipIdentity } from "./helpers/village-storage.fixture.js";
import assert from "node:assert/strict";
import { authorBackgroundFixture } from "./helpers/village-storage.fixture.js";
import { validateBackgroundResponse } from "../packages/villages/src/server/adapters/storage/background-responses.js";
import {
  readEffectiveVillagerCard,
  readVillagerCard,
} from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { backgroundRevision } from "../packages/villages/src/server/domain/rules/background-revision.js";
import {
  eventAttemptAvailable,
  reserveEventAttempt,
} from "../packages/villages/src/server/domain/rules/event-attempts.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { activateVillagerDay, planRoutineDays } from "../packages/villages/src/server/domain/rules/resident-agenda.js";
import { captureReturnContext } from "../packages/villages/src/server/domain/rules/return-catchup-capture.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { localDateKey } from "../packages/villages/src/server/domain/rules/resident-planning.js";
import { VILLAGE_ACTIVITY_POLICY } from "../packages/villages/src/shared/helpers/activity-policy.js";
import { nextEventAttemptAt } from "../packages/villages/src/server/domain/rules/event-attempts.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import { venueZones } from "../packages/villages/src/server/domain/rules/venue-zones.js";
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
    venueDraft(
      {
        id: "home",
        name: "Empty home",
        form: "House",
        description: "A home.",
        category: "residence",
        classes: ["residence"],
      },
      null,
    ),
  ];
  state.venues[0].occupancy.residentCharacterId = "a";
  state.venues[0].residentIds = ["a"];
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
    memoryChanges: any[] = [],
    legacy: any = null;
  const model: any = {
    connectionId: "fixture",
    model: "fixture",
    maxOutputTokens: 4096,
    maxContext: 100000,
    fitContext: (messages: any, options: any) => ({ messages, ...options }),
  };
  const service = createResidentPlanning({
    relationshipIdentity: fixtureRelationshipIdentity,
    wishIdentity: fixtureWishIdentity,
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
                memoryChanges,
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
    memoryChanges: (value: any[]) => (memoryChanges = value),
    legacy: (value: any) => (legacy = value),
  };
}
const f = fixture();
await f.service.reconcile(now);
assert.equal(f.calls.length, 0, "Discovery queues work without dispatching a model");
assert.equal(f.queued[0].kind, "resident-planning");
assert.equal(f.queued[0].finite, false);
const input = f.queued[0].input;
assert.equal(input.admitted.seed, f.state.seed);
assert.equal(input.admitted.setupAt, f.state.setupAt);
assert.equal(input.context.residents[0].capturedAt, f.state.villagers[0].cardSnapshot.capturedAt);
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
const paidRollover = structuredClone(f.state);
paidRollover.simulatedThrough = new Date(now.getTime() + 86_400_000).toISOString();
assert.equal(f.service.handler.valid(paidRollover, input), false, "Unreserved old live work remains stale.");
assert.equal(
  f.service.handler.valid(paidRollover, input, { activityAttemptId: "unrelated" }),
  false,
  "Another job's reservation cannot authorize this source.",
);
assert.equal(
  f.service.handler.valid(paidRollover, input, { activityAttemptId: f.queued[0].revision }),
  true,
  "The matching live reservation survives a day rollover.",
);
paidRollover.eventAttempts = undefined;
assert.equal(
  f.service.handler.valid(paidRollover, input, { activityAttemptId: "purchased", activityDate: dateKey }),
  true,
  "Trusted saved-job dispatch evidence survives retirement of its old ledger row.",
);

const spending = fixture().state;
assert.equal(coerceVillageState(structuredClone(spending)).returnCatchup, undefined, "Older villages need no batch.");
assert.throws(
  () =>
    coerceVillageState({ ...structuredClone(spending), returnCatchup: { batch: { id: "batch", status: "invalid" } } }),
  /catch-up batch/,
);
assert.throws(() => coerceVillageState({ ...structuredClone(spending), returnCatchup: [] }), /catch-up/);
spending.backgroundPace = "balanced";
spending.returnCatchup = { batch: { id: "batch", status: "running" } };
assert.equal(eventAttemptAvailable(spending, dateKey, now.getTime()), false, "Ordinary activity waits for catch-up.");
assert.equal(eventAttemptAvailable(spending, dateKey, now.getTime(), "other"), false);
reserveEventAttempt(spending, "one", dateKey, now.getTime(), "batch");
reserveEventAttempt(spending, "two", dateKey, now.getTime() + 1, "batch");
reserveEventAttempt(spending, "three", dateKey, now.getTime() + 2, "batch");
reserveEventAttempt(spending, "one", dateKey, now.getTime() + 3, "batch");
assert.throws(
  () => reserveEventAttempt(spending, "one", dateKey, now.getTime() + 3, "other"),
  /batch is no longer active/,
);
for (let index = 4; index <= 6; index++)
  reserveEventAttempt(spending, "review-" + index, dateKey, now.getTime() + index, "batch");
assert.equal(eventAttemptAvailable(spending, dateKey, now.getTime() + 7, "batch"), false, "The daily limit is shared.");
assert.equal(spending.eventAttempts!.attempts.length, 6, "A replay does not reserve another attempt.");
spending.returnCatchup.batch!.status = "completed";
assert.equal(eventAttemptAvailable(spending, dateKey, now.getTime() + 3), false, "Normal spacing remains in effect.");
assert.throws(
  () => reserveEventAttempt(spending, "one", dateKey, now.getTime() + 3, "batch"),
  /batch is no longer active/,
  "An existing reservation does not admit another dispatch after cancellation or completion.",
);

for (const [pace, count, minutes] of [
  ["quiet", 2, 60],
  ["balanced", 6, 30],
  ["lively", 12, 15],
] as const) {
  const state = fixture().state;
  state.backgroundPace = pace;
  state.timeZone = "UTC";
  const instant = new Date("2026-10-29T23:55:00Z");
  reserveEventAttempt(state, "first", "2026-10-29", instant.getTime());
  assert.equal(eventAttemptAvailable(state, "2026-10-29", instant.getTime() + 1), false);
  assert.equal(nextEventAttemptAt(state, instant), instant.getTime() + minutes * 60_000);
  const ready = new Date(instant.getTime() + minutes * 60_000);
  assert.equal(
    eventAttemptAvailable(state, "2026-10-30", ready.getTime() - 1),
    false,
    "Midnight does not clear cadence.",
  );
  assert.equal(eventAttemptAvailable(state, "2026-10-30", ready.getTime()), true);
  state.returnCatchup = { batch: { id: "quota", status: "running" } };
  for (let index = 0; index < count; index++)
    reserveEventAttempt(state, "quota-" + index, "2026-10-30", ready.getTime() + index, "quota");
  assert.equal(eventAttemptAvailable(state, "2026-10-30", ready.getTime() + count, "quota"), false);
  state.returnCatchup.batch!.status = "completed";
  assert.equal(nextEventAttemptAt(state, ready), Date.parse("2026-10-31T00:00:00Z"));
  assert.equal(VILLAGE_ACTIVITY_POLICY[pace].reviews, count);
  state.backgroundPace = "off";
  assert.equal(nextEventAttemptAt(state, ready), null);
}

const historical = fixture();
await historical.service.reconcile(now);
const historicalInput = historical.queued[0].input;
historicalInput.context.catchup = true;
for (const forbidden of [
  { social: null, routineIdea: { characterId: "a" }, housingRequests: [] },
  { social: null, routineIdea: null, housingRequests: [{ who: "a", kind: "move", venueId: "home" }] },
  { social: { mail: { senderId: "a", text: "Hello" } }, routineIdea: null, housingRequests: [] },
  { social: { planId: "future" }, routineIdea: null, housingRequests: [] },
  { social: { mail: null }, routineIdea: null, housingRequests: [] },
  { social: {}, routineIdea: null, housingRequests: [] },
]) {
  historical.payload(forbidden);
  await assert.rejects(historical.service.handler.generate(historicalInput));
  assert.throws(() =>
    historical.service.handler.apply(historical.state, historicalInput, forbidden, { retrying: false }),
  );
}
historical.payload({ social: null, routineIdea: null, housingRequests: [], wishReflection: null });
await historical.service.handler.generate(historicalInput);
assert.match(
  String(historical.calls.at(-1).messages[0].content),
  /no mail, housing request, routine change or future plan/i,
);
const queuedReturn = fixture();
queuedReturn.state.villagers[0]!.agenda!.activeDay = {
  dateKey,
  weekday: "Monday",
  blocks: [],
  scheduleInformed: false,
};
await queuedReturn.service.reconcile(now);
const returnOpportunity = structuredClone(queuedReturn.queued[0].input.opportunity);
returnOpportunity.venueId = "";
returnOpportunity.zoneId = undefined;
const returnCapture = captureReturnContext(queuedReturn.state, now);
queuedReturn.state.returnCatchup = {
  batch: {
    id: "batch-one",
    status: "running",
    from: returnCapture.at,
    until: now.toISOString(),
    opportunities: [returnOpportunity],
    records: [{ opportunityId: returnOpportunity.id, status: "queued" }],
  },
  capture: returnCapture,
};
queuedReturn.queued.length = 0;
await queuedReturn.service.queueReturnOpportunity("batch-one", returnOpportunity, returnCapture);
assert.equal(queuedReturn.calls.length, 0, "Queueing a return opportunity does not dispatch a model request.");
assert.equal(queuedReturn.queued[0].input.context.catchup, true);
assert.deepEqual(queuedReturn.queued[0].input.context.social.candidates, []);
assert.equal(queuedReturn.service.handler.valid(queuedReturn.state, queuedReturn.queued[0].input), true);
const rolledDay = structuredClone(queuedReturn.state);
rolledDay.villagers[0]!.agenda!.activeDay!.dateKey = "2099-01-01";
assert.equal(
  queuedReturn.service.handler.valid(rolledDay, queuedReturn.queued[0].input),
  true,
  "A normal day rollover does not erase a historical opportunity.",
);
const changedRoutine = structuredClone(queuedReturn.state);
changedRoutine.villagers[0]!.agenda!.routineSummary = "A different routine";
assert.equal(queuedReturn.service.handler.valid(changedRoutine, queuedReturn.queued[0].input), false);
const changedOpening = structuredClone(queuedReturn.state);
changedOpening.opening = { version: 2, stage: "conversations" } as any;
assert.equal(queuedReturn.service.handler.valid(changedOpening, queuedReturn.queued[0].input), false);
queuedReturn.service.handler.apply(queuedReturn.state, queuedReturn.queued[0].input, quiet, { retrying: false });
assert.equal(
  queuedReturn.state.returnCatchup!.batch!.records![0]!.status,
  "settled",
  "A quiet result is saved as a settled opportunity.",
);
assert.deepEqual(queuedReturn.state.returnCatchup!.batch!.records![0]!.outcome, quiet);
queuedReturn.state.memories.revision++;
assert.equal(queuedReturn.service.handler.valid(queuedReturn.state, queuedReturn.queued[0].input), false);
await assert.rejects(
  queuedReturn.service.queueReturnOpportunity("batch-one", returnOpportunity, returnCapture),
  /memories changed/,
);
const longReturn = fixture();
const departedAt = new Date(now.getTime() - 9 * 86_400_000);
longReturn.state.foundedAt = longReturn.state.setupAt = longReturn.state.simulatedThrough = departedAt.toISOString();
longReturn.state.villagers[0]!.addedAt = departedAt.toISOString();
longReturn.state.villagers[0]!.cardSnapshot.capturedAt = departedAt.toISOString();
longReturn.state.villagers[0]!.agenda!.generatedAt = departedAt.toISOString();
const longCapture = captureReturnContext(longReturn.state, departedAt);
planRoutineDays(longReturn.state, now);
activateVillagerDay(longReturn.state.villagers[0]!, now, longReturn.state);
longReturn.state.simulatedThrough = now.toISOString();
const eventAt = new Date(now.getTime() - 5_000).toISOString();
const longOpportunity = {
  id: "later-reflection",
  kind: "routine" as const,
  startsAt: eventAt,
  endsAt: eventAt,
  actorIds: ["a"],
  venueId: "",
  facts: [],
};
longReturn.state.returnCatchup = {
  batch: {
    id: "long-return",
    status: "running",
    from: longCapture.at,
    until: now.toISOString(),
    opportunities: [longOpportunity],
  },
  capture: longCapture,
};
await longReturn.service.queueReturnOpportunity("long-return", longOpportunity, longCapture);
assert.equal(
  longReturn.service.handler.valid(longReturn.state, longReturn.queued[0].input),
  true,
  "A generated day after a long absence is compared with the captured routine.",
);
const alteredCapture = structuredClone(longCapture);
alteredCapture.world.setting = "Different past";
await assert.rejects(
  longReturn.service.queueReturnOpportunity("long-return", longReturn.queued[0].input.opportunity, alteredCapture),
  /departure interval/,
  "The batch cannot use an arbitrary replacement capture.",
);
const afterReturn = new Date(now.getTime() + 1000).toISOString();
await assert.rejects(
  longReturn.service.queueReturnOpportunity(
    "long-return",
    { ...longReturn.queued[0].input.opportunity, startsAt: afterReturn, endsAt: afterReturn },
    longCapture,
  ),
  /departure interval/,
  "A catch-up event cannot happen after the fixed return instant.",
);
const privateReturn = fixture();
const otherResident = structuredClone(privateReturn.state.villagers[0]!);
otherResident.characterId = "b";
otherResident.cardSnapshot.id = "b";
otherResident.cardSnapshot.name = "B";
privateReturn.state.villagers.push(otherResident);
privateReturn.state.relationshipContext!.reviewedActorIds.push("b");
const meetingVenue = privateReturn.state.venues[0]!;
const meetingZone = venueZones(meetingVenue)[0]!;
meetingZone.description = "SHARED-ZONE-DETAIL";
meetingVenue.zones = [
  meetingZone,
  { ...structuredClone(meetingZone), id: "hidden-room", name: "Hidden", description: "PRIVATE-ROOM-SENTINEL" },
];
meetingVenue.state.traces = [{ id: "private-note", kind: "note", text: "PRIVATE-NOTE-SENTINEL" } as any];
const privateCapture = captureReturnContext(privateReturn.state, now);
const privateOpportunity = {
  id: "private-event",
  kind: "encounter" as const,
  startsAt: now.toISOString(),
  endsAt: now.toISOString(),
  actorIds: ["a", "b"],
  venueId: meetingVenue.id,
  zoneId: meetingZone.id,
  facts: [],
};
privateReturn.state.returnCatchup = {
  batch: {
    id: "private-return",
    status: "running",
    from: privateCapture.at,
    until: now.toISOString(),
    opportunities: [privateOpportunity],
  },
  capture: privateCapture,
};
await privateReturn.service.queueReturnOpportunity("private-return", privateOpportunity, privateCapture);
privateReturn.payload({
  routineIdea: null,
  housingRequests: [],
  social: {
    encounter: {
      opportunityId: privateOpportunity.id,
      lines: [
        { speakerId: "a", text: "Hello." },
        { speakerId: "b", text: "Hello." },
      ],
    },
  },
});
await privateReturn.service.handler.generate(privateReturn.queued[0].input);
assert.match(
  String(privateReturn.calls[0].messages[0].content),
  /SHARED-ZONE-DETAIL/,
  "The writing model can see the selected Zone.",
);
assert.match(
  String(privateReturn.calls[1].messages[1].content),
  /SHARED-ZONE-DETAIL/,
  "Interpretation sees the selected Zone.",
);
assert.doesNotMatch(
  JSON.stringify(privateReturn.calls),
  /PRIVATE-ROOM-SENTINEL|PRIVATE-NOTE-SENTINEL/,
  "Unseen Zones and notes are not sent to either model request.",
);

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
si.context.catchup = true;
si.context.residents.push({
  ...si.context.residents[0],
  characterId: "c",
  wishes: [{ wish: "UNRELATED-PRIVATE-WISH" }],
});
// This checks propagation to the outbox; settlement validates the complete Memory contract separately.
const proposedMemory = {
  action: "create",
  kind: "information",
  text: "Ada and Bram agreed to compare sketches after breakfast.",
  subjects: ["a", "b"],
  learners: { a: { support: [{ lineId: 1, excerpt: "Yes, after breakfast." }] } },
};
social.memoryChanges([proposedMemory]);
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
assert.doesNotMatch(
  social.calls[1].messages[1].content,
  /UNRELATED-PRIVATE-WISH/,
  "Nonparticipants' private Wishes stay out of catch-up interpretation.",
);
assert.equal(accepted.social.encounter.semanticVersion, 2);
assert.deepEqual(accepted.social.encounter.memoryChanges, [proposedMemory]);
assert.doesNotMatch(social.calls[1].messages[0].content, /Return memoryChanges:\[\] under the native Memory contract/);
si.context.catchup = false;
social.service.handler.apply(social.state, si, accepted, { retrying: false });
assert.equal(social.state.socialOutbox!.length, 1);
assert.deepEqual((social.state.socialOutbox![0]!.proposal.encounter as any).memoryChanges, [proposedMemory]);
assert.equal(social.state.memories.records.length, 0, "Only encounter settlement can create witnessed memory");
const invalid = fixture();
await invalid.service.reconcile(now);
invalid.payload({});
await assert.rejects(invalid.service.handler.generate(invalid.queued[0].input), /incomplete choices/);
assert.equal(invalid.calls.length, 1, "Malformed output never buys an automatic repair");

const actionLetter = fixture();
await actionLetter.service.reconcile(now);
actionLetter.payload({
  social: { mail: { senderId: "a", text: "Hello! *Ada dusts her hands and smiles.*" } },
  routineIdea: null,
  housingRequests: [],
});
await assert.rejects(actionLetter.service.handler.generate(actionLetter.queued[0].input), /roleplay action/);
assert.equal(actionLetter.calls.length, 1, "An invalid automatic letter never triggers interpretation or repair");
assert.match(actionLetter.calls[0].messages[0].content, /only the words the resident puts in a personal letter/i);

const savedAction = fixture();
await savedAction.service.reconcile(now);
const savedInput = savedAction.queued[0].input;
savedAction.service.handler.apply(
  savedAction.state,
  savedInput,
  {
    social: { mail: { senderId: "a", text: "Hello. *Ada dusts her paws.*" } },
    routineIdea: { characterId: "a", activity: "Reading by the window", venueId: "", flexible: true },
    housingRequests: [],
  },
  { retrying: true },
);
assert.equal(savedAction.state.socialMailOutbox?.length ?? 0, 0, "Previously saved invalid mail is not delivered");
assert(
  savedAction.state.villagers[0].agenda!.routineProfile!.activities.some(
    (row) => row.activity === "Reading by the window",
  ),
  "Other saved choices are retained",
);
assert.equal(savedAction.calls.length, 0, "Applying a saved result never triggers a model request");

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
for (const row of [...rows.values()]) {
  row.data = authorBackgroundFixture(rows, row.data);
  row.packageId = "villages";
}
const stop = work.startBackgroundWork();
await work.recoverBackgroundWork();
await work.settleBackgroundWork();
for (const id of ids) {
  assert.equal(rows.get(id).data.status, "obsolete");
  assert.deepEqual(
    validateBackgroundResponse(rows.get(rows.get(id).data.steps[0].responseRef.id)).response,
    rawResponse,
  );
  await assert.rejects(work.retryBackgroundJob(id, 1, "retry-old"), /retired/);
}
assert.equal(dispatched, 0);
assert.equal(applied, 0);
assert.deepEqual(await work.backgroundWorkSummaries(), []);
assert.equal(
  [...rows.values()].filter((row) => row.kind === "background-work").length,
  ids.length,
  "Current-world purchased evidence is retained",
);
state.seed = "reset-world";
await work.backgroundWorkSummaries();
assert.equal(
  [...rows.values()].filter((row) => row.kind === "background-work").length,
  0,
  "Reset still removes another world's private job records",
);
stop();
console.log(
  "Resident planning preserves quiet outcomes, routine/housing proposals, independent social checks, pacing, legacy spending floors and private recovery boundaries.",
);
