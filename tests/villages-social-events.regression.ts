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
import { readEncounter } from "../packages/villages/src/server/domain/rules/social-encounter.js";
import { deriveVillageMoment } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { WorkFailureError, metadataFailure } from "../packages/villages/src/server/domain/rules/work-failure.js";
import { createRelationshipSocial } from "../packages/villages/src/server/features/residents/relationship-social-service.js";
import { createResidentPlanning } from "../packages/villages/src/server/features/residents/resident-planning-service.js";
import { ZonedDate } from "../packages/villages/src/shared/helpers/zoned-date.js";
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
  admitted: structuredClone({
    villagers: village.villagers,
    venues: village.venues,
    residences: village.residences,
    projects: village.projects,
    timeZone: village.timeZone,
  }),
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
