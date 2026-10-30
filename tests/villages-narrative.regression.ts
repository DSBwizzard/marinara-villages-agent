import assert from "node:assert/strict";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import {
  synchronizeVenueZones,
  venueZones,
  zoneClosed,
  chooseAgendaZone,
} from "../packages/villages/src/server/domain/rules/venue-zones.js";
import {
  initializeVenueAccess,
  evaluateZoneAccess,
} from "../packages/villages/src/server/domain/rules/venue-access.js";
import {
  ensureNarrative,
  admitNarrative,
  readNarrativeDevelopment,
  applyNarrativeDevelopment,
} from "../packages/villages/src/server/domain/rules/narrative-development.js";
import {
  environmentObservations,
  ordinaryUseRestricted,
} from "../packages/villages/src/server/domain/rules/narrative-environment.js";
import { deriveVillageMoment } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { applyVenueSceneChange } from "../packages/villages/src/server/domain/rules/venue-scene-state.js";
import { contactCanEnter } from "../packages/villages/src/server/domain/rules/venue-contact.js";
import { backgroundRevision } from "../packages/villages/src/server/domain/rules/background-revision.js";
import { captureReturnContext } from "../packages/villages/src/server/domain/rules/return-catchup-capture.js";
import { discoverReturnBatch } from "../packages/villages/src/server/domain/rules/return-catchup-state.js";
import { createReturnCatchup } from "../packages/villages/src/server/features/background/return-catchup-service.js";
import { createNarrative } from "../packages/villages/src/server/features/narrative/narrative-service.js";
import { activityDate } from "../packages/villages/src/server/domain/rules/event-attempts.js";
import { preferredActivityLane } from "../packages/villages/src/server/domain/rules/activity-arbitration.js";
import { arrangementActivityAt } from "../packages/villages/src/server/domain/rules/activity-arbitration.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";

const start = "2026-10-29T08:00:00.000Z",
  at = "2026-10-29T09:00:00.000Z";
function world() {
  const state = defaultVillageState();
  Object.assign(state, {
    seed: "narrative",
    name: "Harbor",
    setting: "A harbor town.",
    foundedAt: start,
    setupAt: start,
    simulatedThrough: at,
    timeZone: "UTC",
  });
  const venue = venueDraft(
    { id: "hall", name: "Hall", description: "A broad hall with a wooden sign.", category: "public" },
    null,
  );
  synchronizeVenueZones(venue);
  initializeVenueAccess(venue);
  state.venues = [venue];
  const zone = venueZones(venue).find((row) => row.kind !== "exterior")!;
  ensureNarrative(state, start);
  return { state, venue, zone };
}
function admitted(fixture: ReturnType<typeof world>, id = "world:test", instant = at) {
  const grant = admitNarrative(fixture.state, instant, id, "world", {
    venueId: fixture.venue.id,
    zoneId: fixture.zone.id,
  })!;
  fixture.state.narrative!.claims = [
    {
      id,
      attemptId: "attempt:" + id,
      venueId: fixture.venue.id,
      zoneId: fixture.zone.id,
      fingerprint: backgroundRevision(grant),
    },
  ];
  return grant;
}
function proposal(grant: NonNullable<ReturnType<typeof admitNarrative>>) {
  const target = grant.targets[0]!;
  return {
    severity: "gentle",
    occurrence: "Wind loosens the hall sign.",
    situation: {
      id: null,
      expectedRevision: 0,
      title: "Loose sign",
      summary: "The sign needs securing.",
      status: "active",
    },
    physical: [
      {
        venueId: target.venueId,
        zoneId: target.zoneId,
        update: {
          narration: "The sign hangs loose.",
          expectedRevision: target.state.revision,
          appearanceChanged: true,
          append: "The sign hangs from one loose bracket.",
        },
      },
    ],
    conditions: [
      {
        id: null,
        expectedRevision: 0,
        venueId: target.venueId,
        zoneId: target.zoneId,
        observation: "The loose sign knocks against its bracket.",
        restriction: "ordinary-use",
        remedy: "A controller can enter and secure the bracket.",
        endsAt: null,
        clear: false,
      },
    ],
    weather: null,
  };
}
{
  const fixture = world(),
    grant = admitted(fixture);
  const raw = proposal(grant),
    effect = readNarrativeDevelopment(raw, grant);
  const oldScene: any = {
    id: "old",
    villageSeed: fixture.state.seed,
    startedAt: at,
    placeId: fixture.venue.id,
    zoneId: fixture.zone.id,
    area: "public",
    activeIds: [],
    participants: [],
    lines: [],
    submissions: [],
    status: "active",
  };
  oldScene.continuity = captureSceneContinuity(fixture.state, oldScene, Date.parse(at));
  assert.equal(fixture.state.villagers.length, 0, "Environmental admission needs no resident actor.");
  const image = fixture.zone.image;
  const receipt = applyNarrativeDevelopment(fixture.state, grant, effect);
  assert.equal(
    sceneContinuityView(fixture.state, oldScene).narrative!.conditions.length,
    0,
    "A background publication cannot rewrite an active Scene snapshot.",
  );
  assert.match(fixture.zone.description, /loose bracket/);
  assert.equal(fixture.zone.picture?.dirty, true, "Material edits reuse the existing artwork lifecycle.");
  assert.equal(fixture.zone.image, image, "The event does not replace artwork or request an image.");
  assert.equal(
    applyNarrativeDevelopment(fixture.state, grant, effect),
    receipt,
    "Exact source replay does not apply twice.",
  );
  assert.equal(fixture.zone.state.revision, grant.targets[0]!.state.revision + 1);
  assert.equal(
    zoneClosed(fixture.state, fixture.venue, fixture.zone),
    false,
    "Environmental use restrictions never become construction closures.",
  );
  const context = { at: new Date(at), environment: fixture.state.narrative };
  assert.equal(evaluateZoneAccess(fixture.venue, fixture.zone, "visitor", context).allowed, false);
  assert.equal(
    evaluateZoneAccess(fixture.venue, fixture.zone, "player", context).allowed,
    true,
    "A controller can enter for corrective work.",
  );
  assert.equal(ordinaryUseRestricted(fixture.state.narrative, at, fixture.venue.id, fixture.zone.id), true);
  assert.notEqual(
    chooseAgendaZone(fixture.venue, "player", "Reading", fixture.zone.id, fixture.state, { at: new Date(at) }).id,
    fixture.zone.id,
    "Ordinary routines select an available alternative.",
  );
  assert.equal(
    chooseAgendaZone(fixture.venue, "player", "Repairing", fixture.zone.id, fixture.state, { at: new Date(at) }).id,
    fixture.zone.id,
    "A controller's corrective activity remains possible.",
  );
  assert.deepEqual(
    Object.keys(environmentObservations(fixture.state.narrative, at, fixture.venue.id, fixture.zone.id)[0]!),
    ["id", "revision", "observation", "restriction", "remedy"],
    "Perception contains no raw source, hidden cause or global records.",
  );
  const condition = fixture.state.narrative!.conditions[0]!;
  const beforeRepair = structuredClone(fixture.state);
  const repairScene: any = { ...oldScene, id: "scene", submissions: [] };
  repairScene.continuity = captureSceneContinuity(fixture.state, repairScene, Date.parse(at));
  const update = {
    narration: "You secure the sign with its existing fastening.",
    expectedRevision: fixture.zone.state.revision,
    appearanceChanged: true,
    edits: [{ before: "The sign hangs from one loose bracket.", after: "The sign is secured firmly to its bracket." }],
    conditionClears: [{ id: condition.id, expectedRevision: condition.revision }],
  };
  const evidence = {
    actorIds: ["player"],
    witnessIds: ["player"],
    consentIds: [],
    positions: { player: fixture.zone.id },
  };
  assert.throws(
    () =>
      applyVenueSceneChange(
        structuredClone(beforeRepair),
        fixture.venue.id,
        { ...update, edits: undefined, recent: { text: "The sign was inspected." } },
        "scene",
        at,
        undefined,
        "public",
        "",
        fixture.zone.id,
        evidence,
        [condition],
      ),
    /enduring physical correction/,
    "A recent observation alone cannot reopen a damaged space.",
  );
  const worldRepair = structuredClone(beforeRepair);
  worldRepair.narrative!.claims = [];
  const repairGrant = admitted({ ...fixture, state: worldRepair }, "world:repair");
  const repairProposal = proposal(repairGrant);
  repairProposal.physical[0]!.update = {
    narration: "The sign was inspected.",
    expectedRevision: fixture.zone.state.revision,
    appearanceChanged: false,
    recent: { text: "The sign was inspected." },
  } as any;
  Object.assign(repairProposal.conditions[0]!, { id: condition.id, expectedRevision: condition.revision, clear: true });
  assert.throws(
    () => applyNarrativeDevelopment(worldRepair, repairGrant, readNarrativeDevelopment(repairProposal, repairGrant)),
    /matching physical work/,
    "Independent world developments cannot reopen damage through a recent observation either.",
  );
  repairProposal.physical = [];
  Object.assign(repairProposal.conditions[0]!, { clear: false, endsAt: "2026-10-29T10:00:00.000Z" });
  assert.throws(
    () => applyNarrativeDevelopment(worldRepair, repairGrant, readNarrativeDevelopment(repairProposal, repairGrant)),
    /cannot expire/,
    "Continuing a damage-linked condition cannot add a timer that bypasses repair.",
  );
  assert.throws(
    () =>
      applyVenueSceneChange(
        structuredClone(beforeRepair),
        fixture.venue.id,
        update,
        "scene",
        at,
        undefined,
        "public",
        "",
        fixture.zone.id,
        evidence,
      ),
    /captured source/,
  );
  assert.throws(
    () =>
      applyVenueSceneChange(
        structuredClone(beforeRepair),
        fixture.venue.id,
        update,
        "scene",
        at,
        undefined,
        "public",
        "",
        fixture.zone.id,
        { ...evidence, actorIds: ["outsider"] },
        [condition],
      ),
    /actual local actors/,
  );
  applyVenueSceneChange(
    fixture.state,
    fixture.venue.id,
    update,
    "scene",
    at,
    undefined,
    "public",
    "",
    fixture.zone.id,
    evidence,
    [condition],
  );
  assert.equal(ordinaryUseRestricted(fixture.state.narrative, at, fixture.venue.id, fixture.zone.id), false);
  assert.equal(evaluateZoneAccess(fixture.venue, fixture.zone, "visitor", context).allowed, true);
  assert.match(fixture.zone.description, /secured firmly/);
  fixture.state.venueEvents.push({
    id: "venue-chat:scene:repair",
    venueId: fixture.venue.id,
    zoneId: fixture.zone.id,
    venueName: fixture.venue.name,
    text: update.narration,
    at,
    actionReceipt: {
      ...update,
      happened: true,
      submissionId: "repair",
      witnessIds: ["player"],
      after: { description: fixture.zone.description, state: structuredClone(fixture.zone.state) },
    },
  });
  repairScene.submissions.push({ id: "repair" });
  fixture.state.exchangeReceipts["repair:physical"] = {
    sceneId: repairScene.id,
    submissionId: "repair",
    domain: "physical",
    status: "applied",
    physicalOutcome: {
      venueId: fixture.venue.id,
      zoneId: fixture.zone.id,
      actionReceipt: { after: { description: fixture.zone.description, state: structuredClone(fixture.zone.state) } },
    },
  } as any;
  assert.equal(contactCanEnter(beforeRepair, fixture.venue, fixture.zone.id, "visitor", repairScene), false);
  assert.equal(
    contactCanEnter(fixture.state, fixture.venue, fixture.zone.id, "visitor", repairScene),
    true,
    "Contact routing extends captured restrictions through this Scene's accepted repair.",
  );
  assert.equal(
    contactCanEnter(fixture.state, fixture.venue, fixture.zone.id, "visitor", oldScene),
    true,
    "An earlier Scene does not import a later restriction.",
  );
  delete fixture.state.exchangeReceipts["repair:physical"];
  assert.equal(
    ordinaryUseRestricted(
      sceneContinuityView(fixture.state, repairScene).narrative,
      at,
      fixture.venue.id,
      fixture.zone.id,
    ),
    false,
    "This Scene extends only through its exact accepted repair after-values.",
  );
  assert.deepEqual(
    coerceVillageState(fixture.state).narrative,
    fixture.state.narrative,
    "Current-format persistence retains effects and receipts.",
  );
  assert.equal(
    coerceVillageState({ ...fixture.state, narrative: undefined }).narrative,
    undefined,
    "Missing additive narrative state never invents historical events.",
  );
}
{
  const fixture = world();
  fixture.venue.access = undefined;
  fixture.zone.controllerIds = [];

  const grant = admitted(fixture),
    raw = proposal(grant);
  assert.equal(grant.targets[0]!.correctiveActorIds.length, 0);
  raw.physical = [];
  assert.throws(() => readNarrativeDevelopment(raw, grant), /accessible corrective work/);
  raw.conditions[0]!.endsAt = "2026-10-29T10:00:00.000Z" as any;
  const temporary = readNarrativeDevelopment(raw, grant);
  applyNarrativeDevelopment(fixture.state, grant, temporary);
  assert.equal(
    contactCanEnter(fixture.state, fixture.venue, fixture.zone.id, "visitor", {
      id: "legacy",
      startedAt: at,
      zoneId: "exterior",
    } as any),
    false,
    "Legacy public access obeys a current temporary closure.",
  );
  const damaged = world(),
    damageGrant = admitted(damaged),
    damage = proposal(damageGrant);
  damage.conditions[0]!.endsAt = "2026-10-29T10:00:00.000Z" as any;
  assert.throws(
    () => applyNarrativeDevelopment(damaged.state, damageGrant, readNarrativeDevelopment(damage, damageGrant)),
    /cannot expire/,
    "A timer cannot substitute for repairing enduring physical damage.",
  );
}
{
  const fixture = world();
  fixture.state.relationshipContext = {
    socialPlans: [{ kind: "meeting", status: "planned", dateKey: "2026-10-30", startMinute: 10, endMinute: 20 }],
  } as any;
  assert.equal(
    arrangementActivityAt(fixture.state, new Date("2026-10-29T23:55:00.000Z")),
    Date.parse("2026-10-30T00:10:00.000Z"),
    "Near accepted arrangements retain priority across midnight.",
  );
  const first = admitNarrative(fixture.state, at, "first")!;
  fixture.state.eventAttempts = {
    highWaterDate: "2026-10-29",
    lastAttemptAt: at,
    attempts: [
      { id: "world", date: "2026-10-29", at, origin: "world" },
      { id: "resident", date: "2026-10-29", at, origin: "resident" },
    ],
  };
  const second = admitNarrative(fixture.state, at, "second")!;
  assert.notEqual(
    first.targets[0]!.zoneId,
    second.targets[0]!.zoneId,
    "Intervening resident reviews cannot make world rotation skip half the Zones.",
  );
}
{
  const fixture = world(),
    grant = admitted(fixture),
    raw = proposal(grant);
  assert.throws(() => readNarrativeDevelopment({ ...raw, owners: ["player"] }, grant), /Unsupported/);
  assert.throws(
    () => readNarrativeDevelopment({ ...raw, physical: [{ ...raw.physical[0], zoneId: "remote" }] }, grant),
    /not admitted/,
  );
  assert.throws(
    () =>
      applyNarrativeDevelopment(
        fixture.state,
        { ...grant, targets: [...grant.targets, grant.targets[0]!] },
        readNarrativeDevelopment(raw, grant),
      ),
    /context changed/,
  );
  assert.throws(
    () =>
      applyNarrativeDevelopment(fixture.state, { ...grant, id: "fabricated" }, readNarrativeDevelopment(raw, grant)),
    /matching shared/,
  );
  fixture.state.narrativeConsequence = "moderate";
  const dramatic = readNarrativeDevelopment({ ...raw, severity: "dramatic" }, grant);
  assert.throws(() => applyNarrativeDevelopment(fixture.state, grant, dramatic), /Consequence was lowered/);
  fixture.zone.state.revision++;
  assert.throws(
    () => applyNarrativeDevelopment(fixture.state, grant, readNarrativeDevelopment(raw, grant)),
    /Zone changed/,
  );
}
{
  const fixture = world(),
    grant = admitted(fixture),
    raw = proposal(grant);
  raw.conditions = [];
  raw.physical = [];
  const weather = { description: "A brief hard rain.", endsAt: "2026-10-30T01:00:00.000Z", supersedes: null };
  applyNarrativeDevelopment(fixture.state, grant, readNarrativeDevelopment({ ...raw, weather }, grant));
  const moment = (instant: string, environment = fixture.state.narrative) =>
    deriveVillageMoment({
      foundedAt: start,
      seed: fixture.state.seed,
      timeZone: "UTC",
      now: new Date(instant),
      environment,
    });
  assert.equal(moment(at).weather, weather.description);
  assert.equal(moment(weather.endsAt).weather, moment(weather.endsAt, undefined).weather);
  const baseline = deriveVillageMoment({
    foundedAt: start,
    seed: fixture.state.seed,
    timeZone: "UTC",
    now: new Date(weather.endsAt),
  });
  assert.equal(moment(weather.endsAt).weather, baseline.weather, "Expiry reveals the current deterministic baseline.");
  const snapshot = structuredClone(fixture.state.narrative);
  fixture.state.narrative!.claims = [];
  const next = admitted(fixture, "world:second", "2026-10-29T10:00:00.000Z");
  assert.throws(
    () =>
      applyNarrativeDevelopment(fixture.state, next, readNarrativeDevelopment({ ...proposal(next), weather }, next)),
    /supersession/,
  );
  assert.throws(
    () => readNarrativeDevelopment({ ...proposal(next), weather }, { ...next, source: "scene" }),
    /Scene cannot/,
  );
  assert.equal(
    moment(at, snapshot).weather,
    weather.description,
    "Captured authority remains independent of later live weather.",
  );
}
{
  const fixture = world();
  fixture.state.returnCatchup = { capture: captureReturnContext(fixture.state, new Date(start)) };
  fixture.state.memories.revision++;
  discoverReturnBatch(fixture.state, new Date("2026-10-29T20:00:00.000Z"), "absence");
  const batch = fixture.state.returnCatchup!.batch!;
  assert.equal(batch.opportunities!.length, 6);
  assert.ok(batch.opportunities!.every((row) => row.kind === "world" && !row.actorIds.length));
  assert.equal(batch.opportunityLimit, 6);
  assert.ok(batch.opportunities!.every((row) => row.startsAt >= fixture.state.narrative!.adoptedAt));
  assert.equal(coerceVillageState(fixture.state).returnCatchup!.batch!.opportunities!.length, 6);
  let queued = 0;
  const service = createReturnCatchup({
    readAuthority: async () => fixture.state,
    mutateAuthority: async (change) => {
      change(fixture.state);
    },
    readSnapshot: async () => {
      throw new Error("Unrelated social sidecar is offline");
    },
    mutate: async (change) => {
      change(fixture.state);
      return fixture.state;
    },
    queue: async () => {
      queued++;
    },
    job: async () => null,
    retryJob: async () => {},
    cancel: async () => {},
    settle: async () => "settled",
    reinterpret: async () => {},
    hasPresence: () => true,
    now: () => new Date("2026-10-29T20:00:00.000Z"),
  });
  await service.advance();
  assert.equal(queued, 1, "A world-only absence source never hydrates or processes social state.");
}
{
  const fixture = world();
  let queued: any,
    residentReads = 0;
  const service = createNarrative({
    read: async () => fixture.state,
    mutate: async (update) => {
      update(fixture.state);
    },
    socialSnapshot: async () => {
      throw new Error("Social processing unavailable");
    },
    resident: async () => {
      residentReads++;
      throw new Error("Resident recovery held");
    },
    queue: async (job) => {
      queued = job;
    },
    job: async () => null,
    models: (() => {
      throw new Error("No provider needed for local admission");
    }) as any,
    connection: async () => "fixture",
    complete: async () => {
      throw new Error("No dispatch during candidate selection");
    },
    now: () => new Date(at),
    afterCatchup: async () => {},
  });
  await service.reconcile(new Date(at));
  assert.equal(queued.kind, "world-development");
  assert.equal(residentReads, 0);
  assert.equal(queued.automaticDate, activityDate(fixture.state, new Date(at)));
  assert.equal(queued.input.grant.targets.length, 1);
  assert.equal(service.handler.authority, "raw");
  service.handler.reserve!(fixture.state, queued.input, "saved-attempt");
  assert.equal(service.handler.valid(fixture.state, queued.input), true);
  assert.equal(
    admitNarrative(fixture.state, at, "other", "world", {
      venueId: fixture.venue.id,
      zoneId: queued.input.grant.targets[0].zoneId,
    }),
    null,
    "Unresolved claims suppress competing autonomous work at that target.",
  );
  fixture.state.eventAttempts = {
    highWaterDate: "2026-10-29",
    lastAttemptAt: at,
    attempts: [{ id: "saved-attempt", date: "2026-10-29", at, origin: "world" }],
  };
  assert.equal(preferredActivityLane(fixture.state), "resident");
}
