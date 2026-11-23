import { approvalScope, renovationAffectedIds } from "../packages/villages/src/server/domain/rules/project-terms.js";
import { sameReturnResident } from "../packages/villages/src/server/domain/rules/return-catchup-authority.js";
import assert from "node:assert/strict";
import { venueFixture, sharedVenuesFixture } from "./helpers/venues.fixture.js";
import { socialWorldFixture } from "./fixtures/social-world.fixture.js";
import {
  applyAccessCommand,
  evaluateZoneAccess,
  projectVenueAccess,
  readVenueAccess,
} from "../packages/villages/src/server/domain/rules/venue-access.js";
import {
  assertWorkSchedules,
  refreshWorkReservations,
} from "../packages/villages/src/server/domain/rules/venue-work.js";
import { composeAgenda } from "../packages/villages/src/server/domain/rules/agenda-composition.js";
import { agendaBlocksFor } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { planRoutineDays } from "../packages/villages/src/server/domain/rules/resident-agenda.js";
import { ZonedDate } from "../packages/villages/src/shared/helpers/zoned-date.js";
import { parsePlaces } from "../packages/villages/src/server/domain/rules/founding-record.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { separateFoundingTemplates } from "../packages/villages/src/client/features/founding/quick-start-drafts.js";
import {
  narrationAccessPrompt,
  narrationAccessScopes,
} from "../packages/villages/src/server/domain/rules/narration-access.js";
import type { VenueWork } from "../packages/villages/src/shared/helpers/venue-work.js";

const at = "2026-11-02T12:00:00.000Z";
const cafe = venueFixture({
  id: "cafe",
  name: "Rowan’s cafe",
  form: "A cafe with an upstairs bedroom",
  residentIds: ["a"],
  residenceCapacity: 2,
  zones: [
    {
      id: "floor",
      name: "Cafe floor",
      kind: "public",
      description: "Tables and a counter",
      image: null,
      connectedTo: ["exterior", "bedroom", "store"],
    },
    {
      id: "bedroom",
      name: "Bedroom",
      kind: "personal",
      ownerId: "a",
      description: "A private upstairs bedroom",
      image: null,
      connectedTo: ["floor"],
    },
    {
      id: "store",
      name: "Store",
      kind: "restricted",
      description: "Stock shelves",
      image: null,
      controllerIds: ["a"],
      connectedTo: ["floor"],
    },
  ],
});
cafe.access!.managerIds = ["a"];
cafe.zones!.find((row) => row.id === "floor")!.access = {
  mode: "public",
  managerIds: null,
  memberIds: [],
  memberRoles: ["residents"],
  inviterIds: [],
  visitorHours: [{ days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], start: "09:00", end: "17:00" }],
  accompanied: false,
};
cafe.zones!.find((row) => row.id === "store")!.access!.memberRoles = [];
const known = ["player", "a", "b", "c"];
const terms: VenueWork = {
  characterId: "b",
  activity: "Serving coffee",
  zoneId: "floor",
  accessZoneIds: ["floor"],
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  startMinute: 540,
  endMinute: 1020,
};
const apply = (actor: string, details: object, id: string) =>
  applyAccessCommand(
    cafe,
    { ...details, zoneId: null, operationId: id, expectedRevision: cafe.access!.revision } as any,
    actor,
    at,
    known,
  );
apply("player", { action: "work-propose", characterId: "b", terms }, "offer");
assert.equal(!!cafe.workerIds?.includes("b"), false, "A proposal changes no current work");
apply("a", { action: "work-decide", offerId: "offer", accept: true }, "manager-agrees");
assert.equal(cafe.access!.work?.length ?? 0, 0, "A manager cannot agree for the worker");
assert.throws(() => apply("c", { action: "work-decide", offerId: "offer", accept: true }, "impostor"), /do not manage/);
apply("b", { action: "work-decide", offerId: "offer", accept: true }, "worker-agrees");
assert.deepEqual(cafe.access!.work, [terms]);
assert.deepEqual(readVenueAccess(JSON.parse(JSON.stringify(cafe.access)))!.work, [terms]);
const night = new ZonedDate("2026-11-02T23:00:00Z", "UTC");
assert.equal(
  evaluateZoneAccess(
    cafe,
    cafe.zones!.find((row) => row.id === "floor")!,
    "b",
    { at: night },
  ).allowed,
  true,
);
assert.equal(
  evaluateZoneAccess(
    cafe,
    cafe.zones!.find((row) => row.id === "store")!,
    "b",
    { at: night },
  ).allowed,
  false,
);
assert.equal(
  evaluateZoneAccess(
    cafe,
    cafe.zones!.find((row) => row.id === "bedroom")!,
    "b",
    { at: night },
  ).allowed,
  false,
);
assert.equal(
  evaluateZoneAccess(
    cafe,
    cafe.zones!.find((row) => row.id === "floor")!,
    "player",
    { at: night },
  ).allowed,
  false,
);
apply("player", { action: "work-propose", characterId: "b", terms: null }, "end-offer");
const publicView = projectVenueAccess(cafe, "player")!;
assert.equal(publicView.work.length, 0);
assert(!JSON.stringify(publicView).includes("previous"), "Proposing work cannot expose private previous terms");
assert(!JSON.stringify(publicView).includes("Serving coffee"));
const state = socialWorldFixture();
state.venues = [cafe, ...sharedVenuesFixture()];
assert.match(narrationAccessPrompt(narrationAccessScopes(state, ["a", "b"])), /work-decide/);
assertWorkSchedules(state.venues);
const duplicate = structuredClone(cafe);
duplicate.id = "other-cafe";
assert.throws(() => assertWorkSchedules([cafe, duplicate]), /overlapping/);
const routine = [
  { startMinute: 0, endMinute: 600, venueId: "", activity: "Sleeping", flexible: false },
  { startMinute: 600, endMinute: 720, venueId: "", activity: "Free", flexible: true },
  { startMinute: 720, endMinute: 780, venueId: "", activity: "Lunch", essential: true },
  { startMinute: 780, endMinute: 1440, venueId: "", activity: "Free", flexible: true },
];
const work = {
  id: "work",
  source: "work" as const,
  dateKey: "2026-11-02",
  startMinute: 540,
  endMinute: 1020,
  venueId: "cafe",
  zoneId: "floor",
  activity: "Serving coffee",
  replaces: "routine" as const,
};
const appointment = {
  ...work,
  id: "appointment",
  source: "appointment" as const,
  startMinute: 840,
  endMinute: 900,
  activity: "Meeting",
  replaces: "flexible" as const,
};
const day = composeAgenda(routine, [appointment, work]);
assert.equal(day.find((row) => row.startMinute === 0)!.activity, "Sleeping");
assert.equal(day.find((row) => row.startMinute === 720)!.activity, "Lunch");
assert.equal(day.find((row) => row.startMinute === 840)!.activity, "Meeting");
assert.equal(day.find((row) => row.startMinute === 900)!.activity, "Serving coffee");
assert.equal(day.find((row) => row.activity === "Serving coffee")!.commitmentId, undefined);
const project = {
  ...work,
  id: "project",
  source: "project" as const,
  startMinute: 900,
  endMinute: 960,
  activity: "Project",
};
assert.equal(composeAgenda(day, [project]).find((row) => row.startMinute === 900)!.activity, "Project");
assert.equal(
  composeAgenda(day, [{ ...appointment, startMinute: 900, endMinute: 960 }]).some(
    (row) => row.startMinute === 900 && row.activity === "Meeting",
  ),
  false,
);
state.timeZone = "America/Los_Angeles";
state.villagers[1]!.agenda = unwrittenVillageAgenda(new ZonedDate(at, state.timeZone));
for (const date of ["2026-11-02T12:00:00-08:00", "2026-12-07T12:00:00-08:00"]) {
  const now = new ZonedDate(date, state.timeZone);
  planRoutineDays(state, now);
  assert(
    agendaBlocksFor(state.villagers[1]!.agenda!, now).some((row) => row.activity === "Serving coffee"),
    "Work survives multiweek absence projection",
  );
}
refreshWorkReservations(state, new ZonedDate("2026-10-30T12:00:00-07:00", state.timeZone));
const claims = state.villagers[1]!.agenda!.reservations!.filter((row) => row.source === "work");
assert.equal(new Set(claims.map((row) => row.dateKey)).size, claims.length, "DST uses distinct civil days");
assert(claims.some((row) => row.dateKey === "2026-11-02"));
const reloaded = coerceVillageState(JSON.parse(JSON.stringify(state)));
assert.deepEqual(reloaded.venues[0]!.access!.work, [terms]);
const founders = separateFoundingTemplates(["a"], "square");
const home = founders.find((row) => row.residentIds?.includes("a"))!;
home.workerIds = ["a"];
home.access = {
  ...cafe.access!,
  managerIds: ["a"],
  work: [{ ...terms, characterId: "a", zoneId: "common:base", accessZoneIds: ["common:base"] }],
  workOffers: [],
};
founders.forEach((row, index) => {
  row.name = "Venue " + index;
  row.presentation.x = index / 10;
  row.presentation.y = 0.5;
});
const founded = parsePlaces(founders, new Set(["a"]), true, new Date(at));
assert.deepEqual(founded.find((row) => row.id === home.id)!.workerIds, ["a"]);
assert.equal(Object.hasOwn(founded[0]!, "classes"), false);

const departure = structuredClone(state);
const returned = new ZonedDate("2027-01-04T12:00:00-08:00", state.timeZone);
planRoutineDays(state, returned);
assert(
  sameReturnResident(departure.villagers[1]!, state.villagers[1]!, returned, departure, state),
  "A changed derived work window must not invalidate unchanged historical work",
);
state.venues[0]!.access!.work![0]!.startMinute++;
assert.equal(
  sameReturnResident(departure.villagers[1]!, state.villagers[1]!, returned, departure, state),
  false,
  "Changed accepted work invalidates historical acceptance",
);

const projectVenue = structuredClone(cafe);
projectVenue.residentIds = ["c"];
projectVenue.access!.work![0]!.accessZoneIds.push("store");
const store = projectVenue.zones!.find((zone) => zone.id === "store")!;
const firstDesign = { zones: [{ ...store, name: "Stock room" }] };
const nextDesign = { zones: [{ ...store, name: "A different stock room" }] };
const affected = renovationAffectedIds(projectVenue, firstDesign, ["store"]);
for (const actor of ["b", "c"]) {
  assert(affected.includes(actor), "Affected worker and household member must approve a restricted shared room");
  assert.notEqual(
    approvalScope(projectVenue, firstDesign, actor, ["store"]),
    approvalScope(projectVenue, nextDesign, actor, ["store"]),
    "Changing their room terms invalidates the approval",
  );
}
