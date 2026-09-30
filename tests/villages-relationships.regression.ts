import assert from "node:assert/strict";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import { defaultVenueSpace } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-model.js";
import {
  resolveVenueZone,
  canInviteToZone,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-zones.js";
import { agendaDateKey } from "../packages/villages/src/engine/packages/server/src/services/villages/agenda-week.js";
import {
  defaultRelationshipState,
  neutralRelationship,
  relationshipKey,
  relationshipFor,
  applyRelationshipReview,
  reconcileRelationships,
  relationshipZoneController,
  mutateRelationships,
  readRelationshipState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/relationship-store.js";
import {
  emptyRelationshipReview,
  parseRelationshipReview,
  substantiveContact,
} from "../packages/villages/src/engine/packages/server/src/services/villages/relationship-review.js";
import {
  captureRelationshipKnowledge,
  projectRelationshipProfiles,
  proposeStartingTies,
  relationshipClosingNotices,
  readRelationshipsView,
  changeRelationshipCreator,
} from "../packages/villages/src/engine/packages/server/src/services/villages/relationships.js";
import {
  socialPlanCandidates,
  socialPlanValid,
  socialContinuationValid,
  projectSocialActivities,
  reconcileSocialPlans,
  processSocialOutbox,
} from "../packages/villages/src/engine/packages/server/src/services/villages/relationship-social.js";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import type {
  VillageVenue,
  VillageVillager,
} from "../packages/villages/src/engine/packages/server/src/services/villages/types.js";
import type {
  RelationshipChange,
  RelationshipEvidenceLine,
} from "../packages/villages/src/engine/packages/server/src/services/villages/relationship-types.js";

const now = new Date(),
  stamp = now.toISOString(),
  weekday = now.toLocaleDateString("en-US", { weekday: "long" });
function venue(id: string, classes: VillageVenue["classes"]): VillageVenue {
  return {
    id,
    name: id,
    classes,
    spaces: classes!.map((role) => defaultVenueSpace(role, "Interior")),
    description: "Outside",
    category: "",
    presentation: { image: null, x: 0.2, y: 0.3 },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    residentIds: [],
    workerIds: [],
    improvements: [null, null],
    residenceCapacity: 3,
    capabilities: [],
    state: {
      condition: "standing",
      furniture: [],
      upgrades: [],
      publicFacts: [],
      features: [],
      traces: [],
      updatedAt: stamp,
    },
  };
}
function resident(id: string): VillageVillager {
  const block = {
    startMinute: 0,
    endMinute: 1440,
    venueId: "park",
    zoneId: "gathering",
    activity: "Reading",
    reason: "Free time",
    status: "online",
    flexible: true,
  };
  return {
    characterId: id,
    cardSnapshot: {
      id,
      revision: 1,
      name: id,
      sourceStatus: "available",
      capturedAt: stamp,
      comment: "",
      summary: "",
      tags: [],
      description: "",
      personality: "",
      systemPrompt: "",
      scenario: "",
      backstory: "",
      appearance: "",
      exampleDialogue: "",
    },
    addedAt: stamp,
    completedWishes: [],
    remap: null,
    ingestSchedule: false,
    agenda: {
      wishes: [{ id: "wish", wish: "A quiet garden", tell: "Looking outside", intensity: 1, addedAt: stamp }],
      routineSummary: "Enjoys reading",
      day: [block],
      week: { [weekday]: [block] },
      activeDay: { dateKey: agendaDateKey(now), weekday, blocks: [block], scheduleInformed: false },
      source: "village",
      generatedAt: stamp,
    },
  } as VillageVillager;
}
const raw = defaultVillageState();
raw.seed = "relationship-regression";
raw.foundedAt = stamp;
raw.setupAt = stamp;
raw.visitMemoryBackfilled = true;
raw.storyPace = "lively";
const home = venue("home", ["residence"]),
  park = venue("park", ["gathering"]),
  shop = venue("shop", ["workplace"]);
home.residentIds = ["Rosa"];
home.occupancy.residentCharacterId = "Rosa";
home.privateSpaces = [{ ...defaultVenueSpace("residence", "Private"), id: "private:Rosa", ownerId: "Rosa" }];
shop.workerIds = ["Rosa"];
raw.venues = [home, park, shop];
raw.villagers = [resident("Rosa"), resident("Ives")];
const village = coerceVillageState(raw);
const state = defaultRelationshipState(village.seed);
const set = (fromId: string, toId: string, warmth: number, trust: number, target = state) =>
  (target.edges[relationshipKey(fromId, toId)] = {
    ...neutralRelationship(fromId, toId),
    warmth,
    trust,
    lastContactAt: stamp,
  });
const change = (
  id: string,
  amount: number,
  dimension: RelationshipChange["dimension"] = "warmth",
  ordinary = false,
  fromId = "Rosa",
  toId = "player",
): RelationshipChange => ({
  id,
  amount,
  dimension,
  ordinary,
  fromId,
  toId,
  reason: "Shared experience",
  lineIds: [id + ":line"],
  disclosed: false,
  contact: true,
});
const apply = (changes: RelationshipChange[], source = changes[0]?.id ?? "empty", at = stamp, target = state) =>
  applyRelationshipReview(target, { ...emptyRelationshipReview(), changes }, village, source, at);

assert.equal(relationshipFor(state, "Rosa", "player").familiarity, 0);
set("Rosa", "Ives", 50, -25);
set("Ives", "Rosa", -50, 25);
assert.equal(relationshipFor(state, "Rosa", "Ives").warmth, 50);
assert.equal(relationshipFor(state, "Ives", "Rosa").warmth, -50, "directions remain independent");
apply([change("a", 2, "warmth", true), change("b", 2, "warmth", true)], "contact");
assert.equal(relationshipFor(state, "Rosa", "player").warmth, 2, "ordinary daily cap");
assert.equal(relationshipFor(state, "Rosa", "player").trust, 0);
assert.equal(relationshipFor(state, "Rosa", "player").familiarity, 1);
apply([change("a", 2, "warmth", true)], "contact");
assert.equal(relationshipFor(state, "Rosa", "player").familiarity, 1, "idempotent contact");
apply([change("major", 15, "trust"), change("loss", -5)], "mixed");
const beforeDuplicate = relationshipFor(state, "Rosa", "player").trust;
const beforeDuplicateFamiliarity = relationshipFor(state, "Rosa", "player").familiarity;
apply([{ ...change("same-evidence", 15, "trust"), lineIds: ["major:line"] }]);
assert.equal(
  relationshipFor(state, "Rosa", "player").trust,
  beforeDuplicate,
  "overlapping evidence cannot score twice",
);
assert.equal(
  relationshipFor(state, "Rosa", "player").familiarity,
  beforeDuplicateFamiliarity,
  "duplicate evidence cannot build familiarity",
);
const notices = relationshipClosingNotices(
  apply([change("up", 5), change("down", -5, "trust")], "two"),
  state,
  village,
);
assert.deepEqual(
  notices.map((row) => row.kind),
  ["relationship-up", "relationship-down"],
);
assert.ok(
  notices.every((row) => !row.detail),
  "inferred explanations are private",
);

const decay = defaultRelationshipState(village.seed),
  day = 86_400_000;
set("Rosa", "player", 20, 30, decay);
set("Ives", "player", -20, -30, decay);
reconcileRelationships(decay, village, now.getTime() + 7 * day);
assert.equal(relationshipFor(decay, "Rosa", "player").warmth, 20);
reconcileRelationships(decay, village, now.getTime() + 10 * day);
assert.equal(relationshipFor(decay, "Rosa", "player").warmth, 17);
assert.equal(relationshipFor(decay, "Ives", "player").warmth, -17);
assert.equal(relationshipFor(decay, "Rosa", "player").trust, 30);
reconcileRelationships(decay, village, now.getTime() + 10 * day);
assert.equal(relationshipFor(decay, "Ives", "player").warmth, -17, "decay reconciliation is idempotent");
const witnessed = defaultRelationshipState(village.seed);
apply(
  [{ ...change("witnessed", 15), contact: false }],
  "witnessed",
  new Date(now.getTime() - 10 * day).toISOString(),
  witnessed,
);
assert.equal(
  relationshipFor(witnessed, "Rosa", "player").warmth,
  12,
  "earned feelings decay even before direct substantive contact",
);
assert.equal(
  relationshipFor(witnessed, "Rosa", "player").lastContactAt,
  "",
  "observing evidence does not invent direct contact",
);
const delayed = defaultRelationshipState(village.seed);
set("Rosa", "player", 20, 30, delayed);
delayed.edges[relationshipKey("Rosa", "player")]!.lastContactAt = new Date(now.getTime() - 20 * day).toISOString();
reconcileRelationships(delayed, village);
apply([change("delayed", 0)], "delayed", new Date(now.getTime() - 10 * day).toISOString(), delayed);
assert.equal(
  relationshipFor(delayed, "Rosa", "player").warmth,
  14,
  "late settlement restores only decay after actual contact",
);

const shared = resolveVenueZone(village.venues[0]!, "residence")!,
  personal = resolveVenueZone(village.venues[0]!, "private:Rosa")!;
set("Rosa", "player", 25, 25);
set("Rosa", "Ives", 25, 25);
reconcileRelationships(state, village);
assert.equal(relationshipZoneController(state, village, village.venues[0]!, shared, "player"), "Rosa");
assert.equal(
  relationshipZoneController(state, village, village.venues[0]!, shared, "Ives"),
  "Rosa",
  "NPC visitor uses controller feelings",
);
assert.equal(canInviteToZone(village.venues[0]!, shared, "Ives"), false, "guest is not a controller");
const own = relationshipFor(state, "Rosa", "player");
own.warmth = 15;
own.trust = 15;
reconcileRelationships(state, village);
assert.ok(relationshipZoneController(state, village, village.venues[0]!, shared, "player"));
own.trust = 14;
reconcileRelationships(state, village);
assert.equal(relationshipZoneController(state, village, village.venues[0]!, shared, "player"), null);
own.trust = 24;
reconcileRelationships(state, village);
assert.equal(relationshipZoneController(state, village, village.venues[0]!, shared, "player"), null);
own.warmth = own.trust = 50;
applyRelationshipReview(
  state,
  {
    ...emptyRelationshipReview(),
    permissions: [
      {
        id: "invite",
        controllerId: "Rosa",
        visitorId: "player",
        venueId: "home",
        zoneId: personal.id,
        action: "grant",
        lineIds: ["invitation"],
      },
    ],
  },
  village,
  "invite",
  stamp,
);
assert.ok(relationshipZoneController(state, village, village.venues[0]!, personal, "player"));
own.warmth = own.trust = 35;
reconcileRelationships(state, village);
assert.ok(relationshipZoneController(state, village, village.venues[0]!, personal, "player"));
own.trust = 34;
reconcileRelationships(state, village);
assert.equal(relationshipZoneController(state, village, village.venues[0]!, personal, "player"), null);
own.warmth = own.trust = 50;
reconcileRelationships(state, village);
applyRelationshipReview(
  state,
  {
    ...emptyRelationshipReview(),
    permissions: [
      {
        id: "revoke",
        controllerId: "Rosa",
        visitorId: "player",
        venueId: "home",
        zoneId: personal.id,
        action: "revoke",
        lineIds: ["revocation"],
      },
    ],
  },
  village,
  "revoke",
  stamp,
);
reconcileRelationships(state, village);
assert.equal(
  relationshipZoneController(state, village, village.venues[0]!, personal, "player"),
  null,
  "score recovery cannot reverse revocation",
);
const changedController = structuredClone(village);
changedController.venues[0]!.residentIds = [];
changedController.venues[0]!.occupancy.residentCharacterId = null;
reconcileRelationships(state, changedController);
assert.equal(
  relationshipZoneController(state, village, village.venues[0]!, shared, "player"),
  null,
  "authority loss persists after reassignment",
);
const workplace = village.venues[2]!;
const staff = {
  ...defaultVenueSpace("workplace", "Stockroom"),
  id: "stock",
  name: "Stockroom",
  kind: "staff" as const,
};
workplace.zones!.push(staff);
const invitationLines: RelationshipEvidenceLine[] = [
  {
    id: "standing",
    speakerId: "Rosa",
    role: "assistant",
    kind: "dialogue",
    content: "You can enter the Stockroom whenever you like.",
    heardBy: ["Rosa"],
    playerHeard: true,
  },
];
const permission = {
  controllerId: "Rosa",
  visitorId: "player",
  venueId: "shop",
  zoneId: "stock",
  action: "grant",
  lineIds: ["standing"],
};
const standing = parseRelationshipReview(
  { changes: [], permissions: [permission], disclosures: [] },
  "staff",
  invitationLines,
  village,
);
assert.throws(
  () =>
    parseRelationshipReview(
      { changes: [], permissions: [{ ...permission, controllerId: "Ives" }], disclosures: [] },
      "guest",
      invitationLines,
      village,
    ),
  /controller/,
);
assert.throws(
  () =>
    parseRelationshipReview(
      { changes: [], permissions: [permission], disclosures: [] },
      "conditional",
      invitationLines.map((line) => ({
        ...line,
        content: "If you behave, you can enter the Stockroom whenever you like.",
      })),
      village,
    ),
  /unconditional/,
);
own.warmth = -75;
own.trust = 50;
applyRelationshipReview(state, standing, village, "staff", stamp);
assert.ok(
  relationshipZoneController(state, village, workplace, staff, "player"),
  "staff permission relies on trust independently of warmth",
);
own.trust = 35;
reconcileRelationships(state, village);
assert.ok(relationshipZoneController(state, village, workplace, staff, "player"));
own.trust = 34;
reconcileRelationships(state, village);
assert.equal(relationshipZoneController(state, village, workplace, staff, "player"), null);
own.trust = 49;
reconcileRelationships(state, village);
assert.equal(relationshipZoneController(state, village, workplace, staff, "player"), null);
own.trust = 50;
reconcileRelationships(state, village);
assert.ok(relationshipZoneController(state, village, workplace, staff, "player"));
workplace.constructionStatus = "worksite";
assert.equal(
  relationshipZoneController(state, village, workplace, staff, "player"),
  null,
  "construction closes relationship entry",
);
workplace.constructionStatus = "complete";
workplace.archivedZones = [{ zone: staff, archivedAt: stamp }];
workplace.zones = workplace.zones!.filter((zone) => zone.id !== staff.id);
reconcileRelationships(state, village);
workplace.zones.push(staff);
assert.equal(
  relationshipZoneController(state, village, workplace, staff, "player"),
  null,
  "archiving invalidates the old grant",
);
assert.equal(
  canInviteToZone(village.venues[0]!, personal, "Ives"),
  false,
  "private invitation belongs to the current owner",
);

const evidence: RelationshipEvidenceLine[] = [
  {
    id: "p",
    speakerId: "player",
    role: "user",
    content: "I enjoyed our conversation about gardening.",
    heardBy: ["Rosa"],
  },
  {
    id: "r",
    speakerId: "Rosa",
    role: "assistant",
    content: "I enjoyed sharing those stories with you.",
    heardBy: ["Rosa"],
  },
];
assert.ok(substantiveContact(evidence, "Rosa", "player"));
assert.equal(
  substantiveContact(
    evidence.map((line) => ({
      ...line,
      content: line.role === "user" ? "Hello, how are you doing today?" : "It is good to see you again!",
    })),
    "Rosa",
    "player",
  ),
  false,
  "greeting-only exchanges stay local",
);
assert.equal(
  substantiveContact(
    evidence.map((line) => ({ ...line, content: "Hello!" })),
    "Rosa",
    "player",
  ),
  false,
);
const decision = {
  fromId: "Rosa",
  toId: "player",
  dimension: "warmth",
  strength: "minor",
  direction: "increase",
  ordinary: true,
  reason: "Enjoyed company",
  lineIds: ["p", "r"],
  disclosed: false,
};
assert.equal(
  parseRelationshipReview({ changes: [decision], permissions: [], disclosures: [] }, "parse", evidence, village)
    .changes[0]!.amount,
  2,
);
assert.throws(
  () =>
    parseRelationshipReview(
      { changes: [{ ...decision, fromId: "Ives" }], permissions: [], disclosures: [] },
      "parse",
      evidence,
      village,
    ),
  /audience/,
);
assert.throws(
  () =>
    parseRelationshipReview(
      { changes: [decision, decision], permissions: [], disclosures: [] },
      "parse",
      evidence,
      village,
    ),
  /Repeated/,
);
assert.throws(
  () =>
    parseRelationshipReview(
      { changes: [{ ...decision, dimension: "trust" }], permissions: [], disclosures: [] },
      "parse",
      evidence,
      village,
    ),
  /Ordinary/,
);
assert.throws(
  () =>
    parseRelationshipReview(
      {
        changes: [],
        permissions: [],
        disclosures: [{ fromId: "Rosa", toId: "Ives", kind: "explanation", text: "Secret", lineIds: ["r"] }],
      },
      "parse",
      evidence.map((line) => ({ ...line, playerHeard: false })),
      village,
    ),
  /disclosure/,
);

const knowledge = defaultRelationshipState(village.seed);
set("Rosa", "player", 50, 50, knowledge);
set("Rosa", "Ives", -40, 10, knowledge);
reconcileRelationships(knowledge, village);
captureRelationshipKnowledge(knowledge, village);
assert.equal(
  projectRelationshipProfiles(knowledge, village)[0]!.knownAt,
  "",
  "creator values do not establish player knowledge",
);
knowledge.edges[relationshipKey("Rosa", "player")]!.playerContactAt = stamp;
captureRelationshipKnowledge(knowledge, village);
assert.equal(projectRelationshipProfiles(knowledge, village)[0]!.ties[0]!.reasons.length, 0);
assert.ok(projectRelationshipProfiles(knowledge, village)[0]!.wishes.length);
knowledge.edges[relationshipKey("Rosa", "player")]!.trust = 14;
reconcileRelationships(knowledge, village);
const oldKnowledge = structuredClone(knowledge.knowledge);
const later = structuredClone(village);
later.villagers[0]!.agenda!.wishes[0]!.wish = "Unknown new wish";
captureRelationshipKnowledge(knowledge, later, new Date(now.getTime() + day));
assert.deepEqual(knowledge.knowledge, oldKnowledge, "privilege loss retains dated values");
const spoilerKnowledge = structuredClone(knowledge);
spoilerKnowledge.edges[relationshipKey("Rosa", "player")]!.trust = 75;
spoilerKnowledge.edges[relationshipKey("Rosa", "player")]!.knowledgeBlockedUntilContact = true;
reconcileRelationships(spoilerKnowledge, later);
captureRelationshipKnowledge(spoilerKnowledge, later);
assert.deepEqual(
  spoilerKnowledge.knowledge,
  oldKnowledge,
  "creator edits also cannot refresh previously earned knowledge",
);
const history = structuredClone(village);
history.villagers[0]!.cardSnapshot.backstory = "Rosa is Ives's sister and works with Ives.";
assert.ok(proposeStartingTies(history, defaultRelationshipState(history.seed)).every((tie) => !tie.established));
history.villagers[0]!.cardSnapshot.backstory = "Rosa likes Ives. Rosa distrusts Ives.";
assert.deepEqual(
  proposeStartingTies(history, defaultRelationshipState(history.seed)).find((tie) => tie.toId === "Ives"),
  { fromId: "Rosa", toId: "Ives", warmth: 25, trust: -50, established: true },
);

const socialState = defaultRelationshipState(village.seed);
set("Rosa", "Ives", 30, 30, socialState);
set("Ives", "Rosa", 30, 30, socialState);
const socialVillage = { ...structuredClone(village), relationshipContext: socialState };
// A controlled morning timestamp avoids a midnight fixture losing all future slots.
const morning = new Date(now);
morning.setHours(8, 0, 0, 0);
const plans = socialPlanCandidates(socialVillage, morning);
assert.equal(plans.length, 1);
const plan = plans[0]!;
assert.ok(socialPlanValid(socialVillage, plan, morning));
socialState.socialPlans.push(plan);
const duringMeeting = new Date(morning);
duringMeeting.setHours(Math.floor(plan.startMinute / 60), plan.startMinute % 60);
assert.ok(
  socialContinuationValid(socialVillage, plan.id, plan, duringMeeting),
  "hydrated plan stays valid during the meeting",
);
assert.ok(
  socialContinuationValid({ ...socialVillage, relationshipContext: undefined }, plan.id, plan, duringMeeting),
  "the coordinator's raw Village CAS can apply the frozen plan",
);
assert.equal(socialContinuationValid(socialVillage, "unknown-plan", plan, duringMeeting), false);
projectSocialActivities(socialVillage, morning);
assert.equal(socialVillage.villagers[0]!.agenda!.socialActivities!.length, 1);
const busy = structuredClone(socialVillage);
busy.villagers[1]!.agenda!.week![weekday]![0]!.flexible = false;
busy.villagers[1]!.agenda!.activeDay!.blocks[0]!.flexible = false;
assert.equal(socialPlanValid(busy, plan, morning), false);
const inaccessible = structuredClone(socialVillage);
inaccessible.venues.find((place) => place.id === plan.venueId)!.constructionStatus = "worksite";
assert.equal(socialPlanValid(inaccessible, plan, morning), false, "social plans respect construction");
assert.equal(socialPlanValid(socialVillage, { ...plan, actorIds: ["Rosa", "player"] }, morning), false);
const committed = structuredClone(socialVillage);
const starts = new Date(morning);
starts.setHours(Math.floor(plan.startMinute / 60), plan.startMinute % 60);
const ends = new Date(morning);
ends.setHours(Math.floor(plan.endMinute / 60), plan.endMinute % 60);
committed.villagers[0]!.agenda!.projectWork = {
  projectId: "accepted",
  venueId: "park",
  zoneId: "gathering",
  startsAt: starts.toISOString(),
  endsAt: ends.toISOString(),
};
assert.equal(socialPlanValid(committed, plan, morning), false, "accepted work overrides flexible free time");
const absent = new Date(morning.getTime() + day);
reconcileSocialPlans(socialVillage, absent);
assert.equal(socialState.socialPlans[0]!.status, "cancelled");
assert.equal(socialState.receipts[plan.id], undefined, "missed plans do not reward relationships");
socialVillage.storyPace = "off";
assert.equal(socialPlanCandidates(socialVillage, morning).length, 0);

async function main() {
  const records = new Map<string, any>();
  records.set("villages-village", { id: "villages-village", kind: "village", revision: 1, data: village });
  let failWrite = false;
  configureVillagesRuntime({
    logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
    resources: {
      async listCharacters() {
        return [];
      },
    },
    persistence: {
      documents: {
        async getById(_package: string, id: string) {
          return structuredClone(records.get(id) ?? null);
        },
        async list(_package: string, kind: string) {
          return [...records.values()].filter((row) => row.kind === kind);
        },
        async create(input: any) {
          if (failWrite && input.kind === "relationships") throw new Error("relationship storage unavailable");
          const row = { ...input, revision: 1 };
          records.set(input.id, structuredClone(row));
          return row;
        },
        async update(input: any) {
          if (failWrite && input.id.startsWith("villages-relationships-"))
            throw new Error("relationship storage unavailable");
          const row = records.get(input.id);
          if (!row || row.revision !== input.expectedRevision) return null;
          const next = { ...row, ...input, revision: row.revision + 1 };
          records.set(input.id, structuredClone(next));
          return next;
        },
      },
    },
  } as any);
  failWrite = true;
  await assert.rejects(
    () => mutateRelationships(village.seed, (saved) => apply([change("storage", 5)], "storage", stamp, saved)),
    /unavailable/,
  );
  assert.equal(relationshipFor(await readRelationshipState(village.seed), "Rosa", "player").warmth, 0);
  failWrite = false;
  await mutateRelationships(village.seed, (saved) => apply([change("storage", 5)], "storage", stamp, saved));
  await mutateRelationships(village.seed, (saved) => apply([change("storage", 5)], "storage", stamp, saved));
  assert.equal(relationshipFor(await readRelationshipState(village.seed), "Rosa", "player").warmth, 5);
  const view = await readRelationshipsView();
  assert.ok(view.starting.pending);
  assert.equal("values" in view.starting, false);
  await assert.rejects(
    () => changeRelationshipCreator({ action: "edit", fromId: "Rosa", toId: "Ives", warmth: 75, trust: 50 }),
    /spoilers/,
  );
  await changeRelationshipCreator({ action: "acknowledge", spoilerAcknowledged: true });
  assert.ok((await readRelationshipsView()).starting.values);
  await changeRelationshipCreator({ action: "neutral" });
  await changeRelationshipCreator({ action: "hide" });
  assert.equal("values" in (await readRelationshipsView()).starting, false);

  const entry = {
    id: "encounter",
    seed: village.seed,
    at: stamp,
    opportunity: {
      id: "opportunity",
      kind: "encounter" as const,
      actorIds: ["Rosa", "Ives"],
      venueId: "park",
      zoneId: "gathering",
      startsAt: stamp,
      endsAt: stamp,
      facts: [],
    },
    candidates: [],
    proposal: {
      encounter: {
        opportunityId: "opportunity",
        lines: [
          { speakerId: "Rosa", text: "I enjoyed discussing our favorite books." },
          { speakerId: "Ives", text: "It was pleasant reading together here." },
        ],
        relationshipReview: {
          changes: [{ ...decision, toId: "Ives", evidence: [0, 1], lineIds: undefined }],
          permissions: [],
          disclosures: [],
        },
      },
    },
  };
  await processSocialOutbox({ ...village, socialOutbox: [entry] });
  await processSocialOutbox({ ...village, socialOutbox: [entry] });
  const settledSocial = await readRelationshipState(village.seed);
  assert.equal(relationshipFor(settledSocial, "Rosa", "Ives").warmth, 2);
  assert.equal(relationshipFor(settledSocial, "Ives", "Rosa").familiarity, 1);
  assert.equal(settledSocial.socialEncounters.length, 1, "typed encounter replays once");
  await processSocialOutbox({ ...village, storyPace: "off", socialOutbox: [{ ...entry, id: "off" }] });
  assert.equal((await readRelationshipState(village.seed)).socialEncounters.length, 1);
  await processSocialOutbox({
    ...village,
    socialOutbox: [{ ...entry, id: "obsolete-plan", requiredPlanId: "cancelled-or-missing" }],
  });
  assert.equal(
    (await readRelationshipState(village.seed)).socialEncounters.length,
    1,
    "obsolete planned encounters produce no reward",
  );
  console.log("villages-relationships: ok");
}
void main();
