import assert from "node:assert/strict";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { createProjectLifecycle } from "../packages/villages/src/server/features/projects/project-lifecycle-service.js";
import { createProjectEvidence } from "../packages/villages/src/server/features/projects/project-evidence-service.js";
import {
  draftNewVenueProject,
  draftRenovationProject,
} from "../packages/villages/src/server/features/projects/project-drafts.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import {
  recordProjectProgress,
  progressProject,
} from "../packages/villages/src/server/domain/rules/project-progress.js";
import { reconcileProjectLifecycles } from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
import {
  assignProjectDelivery,
  reconcileProjectDeliveries,
} from "../packages/villages/src/server/domain/rules/project-deliveries.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import {
  projectDeliveryReserved,
  projectSupplyKey,
} from "../packages/villages/src/server/domain/rules/project-supply-transfer.js";
import { renovationAffectedIds } from "../packages/villages/src/server/domain/rules/project-terms.js";
import { venueZones } from "../packages/villages/src/server/domain/rules/venue-zones.js";
import { agendaBlocksFor } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { ZonedDate } from "../packages/villages/src/shared/helpers/zoned-date.js";

async function fixture(material = true, recordedSource = true) {
  let state = defaultVillageState();
  state.seed = "passive-project";
  state.setupAt = new Date().toISOString();
  state.foundedAt = state.setupAt;
  state.timeZone = "Pacific/Auckland";
  state.villagers = ["a", "b", "c"].map((id) => ({
    characterId: id,
    cardSnapshot: { id, name: id, tags: [], revision: 1, sourceStatus: "available", capturedAt: state.setupAt },
    agenda: unwrittenVillageAgenda([], id),
    completedWishes: [],
  })) as any;
  const mutate = async (fn: any) => {
    const staged = structuredClone(state);
    fn(staged);
    state = staged;
    return state;
  };
  const service = createProjectLifecycle({
    mutateVillageState: mutate,
    villagesDebugAgentsEnabled: async () => false,
    outsideVenueOperation: (fn: any) => fn(),
    preparePrivateSpaces: async () => {},
    loadProjectWishProgress: async () => ({ processProjectWishOutbox: async () => {} }),
    draftNewVenueProject,
    draftRenovationProject,
  } as any);
  await service.createNewVenueProject({
    name: "Workshop",
    classes: ["workplace"],
    description: "A substantial shared workshop.",
  });
  const id = state.projects[0].id;
  await service.placeNewVenueProject(id, { x: 0.3, y: 0.3 });
  const plan = {
    layoutVersion: 1,
    layout: "common",
    form: "Timber workshop",
    exteriorDescription: "A workshop entrance",
    spaces: [
      {
        id: "workshop",
        venueClass: "workplace",
        name: "Workshop",
        purpose: "Making things",
        description: "A shared workshop with benches.",
      },
    ],
    privateSpaces: [],
  };
  await assert.rejects(service.startProjectConstruction(id), /Deliver every/);
  await service.saveProjectPlan(id, plan);
  let flow = state.projects[0].lifecycle!;
  flow.candidates.push({ residentId: "a", evidenceId: "build-agreement", at: new Date().toISOString() });
  flow.spokenProofs.push({
    lineId: "build-agreement",
    sessionId: "build",
    submissionId: "build",
    speakerId: "a",
    venueId: state.projects[0].venueId,
    quote: "I will build this workshop.",
    at: new Date().toISOString(),
  });
  await service.lockProjectBuilder(id, { residentId: "a" });
  flow = state.projects[0].lifecycle!;
  flow.requirements = ["structure", "equipment", "finish"].map((category) => ({
    id: category,
    category,
    title: category === "structure" ? "timber" : "None needed",
    needed: material && category === "structure",
    carriedAt: "",
    deliveredAt: "",
  })) as any;
  flow.requirementsEvidenceId = "requirements";
  flow.spokenProofs.push({
    lineId: "requirements",
    sessionId: "plan",
    submissionId: "plan",
    speakerId: "a",
    venueId: state.projects[0].venueId,
    quote: "Timber is the only supply needed.",
    at: new Date().toISOString(),
  });
  await service.acceptProjectRequirements(id);
  const sourceVenue = structuredClone(state.venues[0]);
  sourceVenue.id = "stock";
  sourceVenue.name = "Stock";
  sourceVenue.constructionStatus = "complete";
  delete sourceVenue.buildProjectId;
  sourceVenue.zones = venueZones(sourceVenue);
  state.venues.push(sourceVenue);
  if (material && recordedSource) {
    flow = state.projects[0].lifecycle!;
    flow.sources.push({
      requirementId: "structure",
      kind: "resident-offer",
      venueId: "stock",
      zoneId: "exterior",
      itemName: "timber",
      supplierId: "a",
      evidenceId: "offer",
      at: new Date().toISOString(),
      acquiredAt: "",
    });
    recordProjectProgress(
      state,
      state.projects[0],
      "source:structure",
      { id: "offer", kind: "project-source", at: new Date().toISOString(), sourceId: "offer", venueId: "stock" },
      "resident-offer",
    );
  }
  async function agree(residentId = "b", combined = false) {
    const project = state.projects[0],
      quote = combined
        ? "I have timber here at Stock; I will deliver it for the Workshop."
        : "I will collect and deliver the timber from Stock for the Workshop.",
      revision = progressProject(state, project)!.definition.revision;
    const turn = {
      sessionId: "delivery-" + residentId,
      submissionId: "agreement",
      venueId: "stock",
      zoneId: "exterior",
      semanticVersion: 2,
      mode: "chat",
      message: "Will you handle that timber delivery?",
      at: new Date().toISOString(),
      activeIdsAtTurn: [residentId],
      projectContexts: [{ projectId: id, revision, phase: "materials" }],
      projectSpeech: [
        {
          version: 1,
          kind: "delivery",
          projectId: id,
          revision,
          phase: "materials",
          requirementId: "structure",
          speakerId: residentId,
          contextual: { version: 1, source: "system", checkId: "delivery-check" },
          citations: [{ lineId: "delivery-line-" + residentId, quote }],
          checklist: [],
        },
      ],
      contextLines: [],
      lines: [
        {
          id: "delivery-line-" + residentId,
          kind: "dialogue",
          speakerId: residentId,
          content: quote,
          heardBy: [residentId],
        },
      ],
    };
    if (combined) turn.projectSpeech.push({ ...turn.projectSpeech[0], kind: "offer" });
    const evidence = createProjectEvidence({
      readVillageState: async () => state,
      mutateVillageState: mutate,
      sceneQueries: () => ({ readProjectTurnEvidence: async () => turn, activeVenueSession: async () => null }),
    } as any);
    await evidence.processProjectSpeechTurn(turn.sessionId, turn.submissionId);
  }
  return {
    service,
    id,
    plan,
    agree,
    get state() {
      return state;
    },
    reload() {
      state = coerceVillageState(state);
    },
  };
}

{
  const f = await fixture();
  await assert.rejects(f.service.delegateProjectSupply(f.id, { requirementId: "structure", residentId: "b" }), /agree/);
  await f.agree();
  await f.service.delegateProjectSupply(f.id, { requirementId: "structure", residentId: "b" });
  let job = f.state.projects[0].lifecycle!.deliveries![0];
  assert.equal(Date.parse(job.completesAt) - Date.parse(job.startsAt), 3600000);
  assert.equal(projectDeliveryReserved(f.state, "stock", "exterior", "a", "timber"), true);
  const ends = job.completesAt;
  f.reload();
  job = f.state.projects[0].lifecycle!.deliveries![0];
  assert.equal(job.completesAt, ends);
  assert.equal(f.state.villagers[1].agenda!.projectDelivery!.projectId, f.id);
  reconcileProjectDeliveries(f.state, new ZonedDate(Date.parse(ends) - 1, f.state.timeZone));
  assert.equal(f.state.projects[0].lifecycle!.requirements[0].deliveredAt, "");
  reconcileProjectDeliveries(f.state, new ZonedDate(ends, f.state.timeZone));
  assert.equal(f.state.projects[0].lifecycle!.requirements[0].deliveredAt, ends);
  const claims = f.state.projectSourceClaims.length;
  reconcileProjectDeliveries(f.state, new ZonedDate(Date.parse(ends) + 86400000, f.state.timeZone));
  assert.equal(f.state.projectSourceClaims.length, claims);
  const site = f.state.venues.find((venue) => venue.id === f.state.projects[0].venueId)!;
  site.zones = venueZones(site);
  site.zones[0].state.items = ["Player's marker"];
  const start = new ZonedDate(Date.parse(ends) + 1000, f.state.timeZone);
  await f.service.startProjectConstruction(f.id, start);
  const end = f.state.projects[0].lifecycle!.workOrder!.completesAt;
  assert.equal(Date.parse(end) - start.getTime(), 86400000);
  reconcileProjectLifecycles(f.state, new ZonedDate(Date.parse(end) - 1, f.state.timeZone));
  assert.equal(f.state.projects[0].status, "building");
  reconcileProjectLifecycles(f.state, new ZonedDate(end, f.state.timeZone));
  assert.equal(f.state.projects[0].status, "complete");
  assert.equal(f.state.venues.find((venue) => venue.id === f.state.projects[0].venueId)!.zones![1].id, "workshop");
  assert.deepEqual(f.state.venues.find((venue) => venue.id === f.state.projects[0].venueId)!.zones![0].state.items, [
    "Player's marker",
  ]);
  assert.equal(f.state.projectWishOutbox.length, 1);
  reconcileProjectLifecycles(f.state, new ZonedDate(end, f.state.timeZone));
  assert.equal(f.state.projectWishOutbox.length, 1);
}
{
  const f = await fixture();
  await f.agree();
  await f.agree("c");
  await f.service.delegateProjectSupply(f.id, { requirementId: "structure", residentId: "b" });
  await assert.rejects(
    f.service.delegateProjectSupply(f.id, { requirementId: "structure", residentId: "c" }),
    /reserved/,
  );
  await f.service.cancelProjectSupply(f.id, { requirementId: "structure" });
  assert.equal(projectDeliveryReserved(f.state, "stock", "exterior", "a", "timber"), false);
  await f.service.delegateProjectSupply(f.id, { requirementId: "structure", residentId: "c" });
  const end = f.state.projects[0].lifecycle!.deliveries!.find((job) => job.residentId === "c")!.completesAt;
  f.state.villagers = f.state.villagers.filter((person) => person.characterId !== "c");
  reconcileProjectDeliveries(f.state, new ZonedDate(end, f.state.timeZone));
  assert.equal(f.state.projectSourceClaims.length, 0);
  assert.equal(f.state.projects[0].lifecycle!.requirements[0].carriedAt, "");
}
{
  const f = await fixture();
  await f.agree();
  await f.service.delegateProjectSupply(f.id, { requirementId: "structure", residentId: "b" });
  const end = f.state.projects[0].lifecycle!.deliveries![0].completesAt;
  const task = progressProject(f.state, f.state.projects[0])!;
  task.definition.phases.find((phase) => phase.id === "materials")!.requirements = task.definition.phases
    .find((phase) => phase.id === "materials")!
    .requirements.filter((req) => req.id !== "acquired:structure");
  reconcileProjectDeliveries(f.state, new ZonedDate(end, f.state.timeZone));
  assert.equal(f.state.projectSourceClaims.length, 0);
  assert.equal(f.state.projects[0].lifecycle!.requirements[0].carriedAt, "");
  assert.match(f.state.projects[0].lifecycle!.deliveries![0].blockedReason, /current phase/);
}
{
  const f = await fixture(false);
  delete f.state.projects[0].plan;
  await assert.rejects(f.service.startProjectConstruction(f.id), /design/);
}
{
  const f = await fixture(false);
  await f.service.startProjectConstruction(f.id, new Date());
  const project = f.state.projects[0],
    end = project.lifecycle!.workOrder!.completesAt;
  project.plan!.spaces[0].connectedTo = ["missing-zone"];
  const before = structuredClone(f.state.venues.find((venue) => venue.id === project.venueId));
  reconcileProjectLifecycles(f.state, new Date(end));
  assert.equal(f.state.projects[0].status, "blocked");
  assert.deepEqual(
    f.state.venues.find((venue) => venue.id === project.venueId),
    before,
  );
}
{
  const f = await fixture(false);
  await f.service.startProjectConstruction(f.id, new Date());
  const project = f.state.projects[0];
  project.lifecycle!.workOrder!.pausedAt = new Date().toISOString();
  project.status = "blocked";
  const other = structuredClone(project);
  other.id = "other";
  other.kind = "renovation";
  other.lifecycle!.workOrder!.pausedAt = "";
  other.lifecycle!.builderId = "b";
  f.state.projects.push(other);
  project.lifecycle!.candidates.push({
    residentId: "b",
    evidenceId: "replacement",
    at: new Date(Date.now() + 1000).toISOString(),
  });
  await assert.rejects(f.service.lockProjectBuilder(f.id, { residentId: "b" }), /already working/);
  assert.equal(f.state.projects[0].lifecycle!.builderId, "a");
}
{
  const f = await fixture(false);
  const venue = f.state.venues[1];
  venue.access = { managerIds: ["a"] } as any;
  assert(
    renovationAffectedIds(venue, {
      detail: "A change",
      slot: 0,
      improvement: {
        id: "upgrade",
        title: "Workshop extension",
        description: "An extension",
        spaceId: "exterior",
        extraBeds: 0,
        approvedAt: "",
      },
    }).includes("a"),
  );
}
console.log(
  "Passive Projects: grounded delivery, reservations, restart, timezone, atomic failures, immutable plans, deadlines, completion and builder exclusivity passed.",
);

{
  const f = await fixture();
  await f.agree();
  const stock = f.state.venues.find((venue) => venue.id === "stock")!,
    zone = structuredClone(stock.zones![0]);
  zone.id = "yard";
  zone.kind = "public";
  stock.zones!.push(zone);
  initializeVenueAccess(stock);
  stock.access!.visitorHours = [
    {
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      start: "12:00",
      end: "16:00",
    },
  ];
  f.state.projects[0].lifecycle!.sources[0].zoneId = "yard";
  const agenda = f.state.villagers[1].agenda!;
  delete agenda.routineProfile;
  delete agenda.activeDay;
  agenda.week = Object.fromEntries(
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => [
      day,
      [{ startMinute: 600, endMinute: 1020, venueId: "", activity: "Free", flexible: true }],
    ]),
  );
  assignProjectDelivery(
    f.state,
    f.state.projects[0],
    "structure",
    "b",
    new ZonedDate("2026-11-02T10:00:00+13:00", f.state.timeZone),
  );
  const job = f.state.projects[0].lifecycle!.deliveries![0],
    start = new ZonedDate(job.startsAt, f.state.timeZone);
  assert.equal(start.getHours(), 12);
  assert.equal(start.getMinutes(), 0);
  assert.equal(
    projectDeliveryReserved(f.state, "stock", "another-zone", "a", "timber"),
    true,
    "a resident's one contribution is reserved across its Venue",
  );
  reconcileProjectDeliveries(f.state, new ZonedDate("2026-11-03T20:00:00+13:00", f.state.timeZone));
  assert.equal(
    f.state.projects[0].lifecycle!.requirements[0].deliveredAt,
    job.completesAt,
    "catch-up uses the scheduled pickup hours with current authority",
  );
}
{
  const f = await fixture();
  await f.agree();
  await f.service.delegateProjectSupply(f.id, { requirementId: "structure", residentId: "b" });
  await f.service.saveProjectPlan(f.id, f.plan);
  assert.equal(f.state.villagers[1].agenda!.projectDelivery, undefined);
  assert.equal(projectDeliveryReserved(f.state, "stock", "exterior", "a", "timber"), false);
  assert.equal(f.state.projects[0].lifecycle!.phase, "builder");
}
{
  const f = await fixture();
  const source = f.state.projects[0].lifecycle!.sources[0];
  source.kind = "existing-item";
  source.supplierId = "";
  const zone = f.state.venues.find((venue) => venue.id === "stock")!.zones![0];
  zone.state.items = ["timber"];
  f.state.projectSourceClaims.push({
    key: projectSupplyKey(source),
    projectId: "earlier",
    sourceId: "old-stock",
    submissionId: "old",
  });
  await f.agree();
  await f.service.delegateProjectSupply(f.id, { requirementId: "structure", residentId: "b" });
  const end = f.state.projects[0].lifecycle!.deliveries![0].completesAt;
  assert.equal(
    projectDeliveryReserved(f.state, "stock", "yard", "", "timber"),
    false,
    "separate physical stocks in another Zone remain available",
  );
  assert.notEqual(projectSupplyKey(source), projectSupplyKey({ ...source, zoneId: "yard" }));
  reconcileProjectDeliveries(f.state, new ZonedDate(end, f.state.timeZone));
  assert.deepEqual(f.state.venues.find((venue) => venue.id === "stock")!.zones![0].state.items, []);
  assert.equal(f.state.projects[0].lifecycle!.requirements[0].deliveredAt, end);
}
{
  const f = await fixture(false),
    venue = f.state.venues[1],
    zone = structuredClone(venue.zones![0]);
  zone.id = "personal";
  zone.kind = "restricted";
  zone.controllerIds = ["b"];
  zone.roomSpecification = "A quiet private workshop";
  venue.zones!.push(zone);
  const base = {
    id: zone.id,
    name: zone.name,
    kind: zone.kind,
    venueClass: zone.venueClass,
    purpose: zone.purpose,
    description: zone.description,
    preserveDescription: true,
    roomSpecification: "A larger private workshop",
    controllerIds: ["b"],
  };
  const ids = renovationAffectedIds(venue, { detail: "Improve the private workshop", baseZones: [base] });
  assert(ids.includes("b"), "specification changes retain the room controller's consent");
}

for (const [instant, earliest] of [
  ["2026-03-08T01:30:00-08:00", 180],
  ["2026-11-01T01:30:00-07:00", 120],
  ["2026-03-08T08:00:00-07:00", 480],
] as const) {
  const f = await fixture();
  f.state.timeZone = "America/Los_Angeles";
  progressProject(f.state, f.state.projects[0])!.definedAt = new Date(Date.parse(instant) - 86400000).toISOString();
  await f.agree();
  const agenda = f.state.villagers[1].agenda!;
  delete agenda.routineProfile;
  delete agenda.activeDay;
  agenda.week = Object.fromEntries(
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => [
      day,
      [{ startMinute: 0, endMinute: 1440, venueId: "", activity: "Free", flexible: true }],
    ]),
  );
  assignProjectDelivery(f.state, f.state.projects[0], "structure", "b", new ZonedDate(instant, f.state.timeZone));
  const job = f.state.projects[0].lifecycle!.deliveries![0],
    start = new ZonedDate(job.startsAt, f.state.timeZone);
  assert.equal(start.getHours() * 60 + start.getMinutes(), earliest);
  const block = agendaBlocksFor(agenda, false, start).find((row) => row.commitmentId === f.id)!;
  assert.equal(block.startMinute, earliest);
  assert.equal(block.endMinute, earliest + 60);
  reconcileProjectDeliveries(f.state, new ZonedDate(job.completesAt, f.state.timeZone));
  assert.equal(f.state.projects[0].lifecycle!.requirements[0].deliveredAt, job.completesAt);
}
{
  const f = await fixture(false),
    project = f.state.projects[0],
    venue = f.state.venues.find((venue) => venue.id === project.venueId)!;
  project.kind = "renovation";
  project.lifecycle!.change = { detail: "Install a structural workshop extension" };
  venue.access = { managerIds: ["c"] } as any;
  await assert.rejects(f.service.startProjectConstruction(f.id), /Renew.*approvals/);
  await f.service.renewRenovationApprovals(f.id);
  assert.equal(f.state.projects[0].lifecycle!.phase, "approval");
  assert.equal(f.state.projects[0].lifecycle!.builderId, "a");
  assert.equal(f.state.projects[0].lifecycle!.requirementsAcceptedAt.length > 0, true);
}
console.log(
  "Passive Project clock changes, replenished physical stock, upfront approval and retained site state passed.",
);

{
  const f = await fixture(true, false);
  await f.agree("b", true);
  const flow = f.state.projects[0].lifecycle!;
  assert.equal(flow.sources[0].supplierId, "b");
  assert.equal(flow.sources[0].evidenceId, flow.deliveries![0].evidenceId);
  assert.equal(flow.spokenProofs.filter((proof) => proof.lineId === flow.sources[0].evidenceId).length, 1);
  await f.agree("b", true);
  assert.equal(f.state.projects[0].lifecycle!.sources.length, 1);
  assert.equal(f.state.projects[0].lifecycle!.deliveries!.length, 1);
  await f.service.delegateProjectSupply(f.id, { requirementId: "structure", residentId: "b" });
  const job = f.state.projects[0].lifecycle!.deliveries![0];
  await f.agree("b", true);
  assert.equal(f.state.projects[0].lifecycle!.deliveries![0].startsAt, job.startsAt);
}
console.log("One witnessed offer and delivery commitment records once in either proposal order.");

function arrangeCrowdedSource(f: Awaited<ReturnType<typeof fixture>>, clearsAt = 1440) {
  const quiet = structuredClone(f.state.venues.find((venue) => venue.id === "stock")!);
  quiet.id = "quiet";
  quiet.name = "Quiet";
  quiet.zones!.push({
    ...structuredClone(quiet.zones![0]),
    id: "quiet-yard",
    kind: "public",
    name: "Quiet yard",
    connectedTo: ["exterior"],
  });
  f.state.venues.push(quiet);
  const ordinary = (venueId: string, startMinute = 0, endMinute = 1440) => ({
    startMinute,
    endMinute,
    venueId,
    zoneId: "exterior",
    activity: "Free",
    flexible: true,
  });
  for (const person of f.state.villagers) {
    const agenda = person.agenda!;
    delete agenda.routineProfile;
    delete agenda.activeDay;
    delete agenda.week;
    agenda.day = [ordinary("quiet")];
  }
  for (const id of ["aa", "ab", "ac", "ad"]) {
    const person = structuredClone(f.state.villagers[0]);
    person.characterId = id;
    person.cardSnapshot.id = id;
    person.agenda!.day = [ordinary("stock", 0, clearsAt), ...(clearsAt < 1440 ? [ordinary("quiet", clearsAt)] : [])];
    f.state.villagers.push(person);
  }
  for (const person of f.state.villagers)
    person.agenda!.week = Object.fromEntries(
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => [
        day,
        person.agenda!.day,
      ]),
    );
}
{
  const f = await fixture();
  await f.agree();
  arrangeCrowdedSource(f, 660);
  assignProjectDelivery(
    f.state,
    f.state.projects[0],
    "structure",
    "b",
    new ZonedDate("2026-11-02T10:00:00+13:00", f.state.timeZone),
  );
  const job = f.state.projects[0].lifecycle!.deliveries![0];
  assert.equal(
    new ZonedDate(job.startsAt, f.state.timeZone).getHours(),
    11,
    "a full source Zone defers the courier until a place is free",
  );
  assert.equal(new ZonedDate(job.startsAt, f.state.timeZone).getMinutes(), 0);
}
{
  const f = await fixture();
  await f.agree();
  await f.service.delegateProjectSupply(f.id, { requirementId: "structure", residentId: "b" });
  const end = f.state.projects[0].lifecycle!.deliveries![0].completesAt;
  arrangeCrowdedSource(f);
  reconcileProjectDeliveries(f.state, new ZonedDate(end, f.state.timeZone));
  assert.equal(f.state.projects[0].lifecycle!.requirements[0].deliveredAt, "");
  assert.equal(f.state.projectSourceClaims.length, 0);
  assert.equal(f.state.villagers.find((person) => person.characterId === "b")!.agenda!.projectDelivery, undefined);
  assert.match(f.state.projects[0].lifecycle!.deliveries![0].blockedReason, /source is unavailable/i);
  assert.doesNotMatch(f.state.projects[0].lifecycle!.deliveries![0].blockedReason, /\b(?:aa|ab|ac|ad)\b|crowd|four/i);
}
console.log("Project deliveries honor source Zone occupancy when assigned and before committing pickup.");
