import assert from "node:assert/strict";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { captureSceneAttendance } from "../packages/villages/src/server/domain/rules/scene-attendance.js";
import { evaluateZoneAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  applyVisitPreference,
  nextVisitorTransition,
  offerVisitorLodging,
  sameVisitorPhase,
  settleVisitorTrip,
  visitingCharacter,
  visitorPosition,
} from "../packages/villages/src/server/domain/rules/visitors.js";
import { elapsed, socialWorldFixture } from "./fixtures/social-world.fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";

const world = socialWorldFixture();
world.communityVenueId = world.venues[0].id;
world.timeZone = "America/Los_Angeles";
world.visitors = world.villagers
  .splice(1)
  .map((person) => ({ ...person, visitsEnabled: true, visitsRevision: "initial" }));
const existingWorld = { ...world };
delete existingWorld.visitors;
assert.equal(coerceVillageState(existingWorld).visitors, undefined);

const arrival = new Date("2026-10-31T18:00:00.000Z");
const nightOne = new Date("2026-11-01T05:00:00.000Z");
const firstMorning = new Date("2026-11-01T15:00:00.000Z");
const nightTwo = new Date("2026-11-02T06:00:00.000Z");
const departure = new Date("2026-11-03T01:00:00.000Z");
const guestZone = (venueClass: "other" | "residence") => ({
  ...defaultVenueSpace(venueClass),
  id: "guest",
  name: "Guest Room",
  kind: venueClass === "residence" ? ("shared-residence" as const) : ("public" as const),
  purpose: "Guest lodging",
  seen: true,
});
const inn = venueFixture({ id: "inn", name: "Willowbank Inn", zones: [guestZone("other")] });
world.venues.push(inn);

for (let i = 0; !visitingCharacter(world, arrival) && i < 100; i++) {
  world.seed = "visit-" + i;
  settleVisitorTrip(world, arrival);
}
const visitor = visitingCharacter(world, arrival);
assert(visitor);
assert.deepEqual(visitor.trip, {
  arrivedAt: arrival.toISOString(),
  leavesAt: departure.toISOString(),
  lodging: { venueId: "inn", zoneId: "guest", hostId: undefined },
});
assert.deepEqual(visitingCharacter(coerceVillageState(world), firstMorning)?.trip?.lodging, {
  venueId: "inn",
  zoneId: "guest",
});
assert.equal(nextVisitorTransition(world, arrival), nightOne.getTime());
assert.equal(nextVisitorTransition(world, nightOne), firstMorning.getTime());
assert.equal(visitorPosition(world, nightOne, new Map())?.zoneId, "guest");
assert.equal(visitorPosition(world, nightTwo, new Map())?.sleeping, true);
assert.equal(visitorPosition(world, firstMorning, new Map())?.venueId, world.communityVenueId);
assert.equal(
  visitingCharacter(world, departure),
  undefined,
  "Departure is after the second local night, including DST.",
);
assert.equal(sameVisitorPhase(world, visitor.characterId, arrival, nightOne), false);
assert.equal(
  captureSceneAttendance(world, "inn", nightOne).occupants.find((person) => person.characterId === visitor.characterId)
    ?.zoneId,
  "guest",
);
settleVisitorTrip(world, firstMorning);
assert.equal(visitingCharacter(world, firstMorning)?.trip.arrivedAt, arrival.toISOString());

const home = venueFixture({
  id: "player-home",
  name: "My House",
  classes: ["residence"],
  occupancy: { playerHome: true, residentCharacterId: null, homeKind: null },
  zones: [guestZone("residence")],
});
home.destinations = { player: {} };
world.venues.push(home);
visitor.firstMetAt = arrival.toISOString();
const zone = home.zones!.find((entry) => entry.id === "guest")!;
offerVisitorLodging(world, visitor.characterId, visitor.trip.arrivedAt, arrival);
offerVisitorLodging(world, visitor.characterId, visitor.trip.arrivedAt, arrival);
assert.equal(home.access?.permissions.length, 1);
assert.equal(visitorPosition(world, nightOne, new Map())?.venueId, home.id);
assert.equal(evaluateZoneAccess(home, zone, visitor.characterId, { at: departure }).allowed, false);
assert.equal(evaluateZoneAccess(home, zone, "uninvited", { at: nightOne }).allowed, false);
assert.throws(() => offerVisitorLodging(world, visitor.characterId, visitor.trip.arrivedAt, departure), /ended/i);

const afterCheckout = structuredClone(world);
afterCheckout.clock = { trustedAt: departure.toISOString(), revision: 1, replayUntilDate: "2026-11-02" };
settleVisitorTrip(afterCheckout, nightTwo);
assert.equal(visitingCharacter(afterCheckout, nightTwo), undefined);
assert.equal(afterCheckout.venues.find((venue) => venue.id === home.id)?.access?.permissions.length, 0);

const onlyHouse = structuredClone(home);
onlyHouse.access!.permissions[0].revoked = true;
world.venues = world.venues.map((venue) => (venue === home ? onlyHouse : venue));
inn.constructionStatus = "worksite";
settleVisitorTrip(world, nightOne);
assert.equal(visitingCharacter(world, nightOne)?.trip.lodging, undefined);
assert.equal(visitorPosition(world, nightOne, new Map()), undefined, "A revoked room stays off the map.");
assert.equal(visitorPosition(world, firstMorning, new Map())?.venueId, world.communityVenueId);

const host = venueFixture({
  id: "friend-home",
  name: "Ada's House",
  classes: ["residence"],
  residentIds: ["a"],
  zones: [guestZone("residence")],
});
host.destinations = { a: {} };
host.access!.permissions.push({
  id: "approved-guest",
  duration: "standing",
  zoneId: "guest",
  visitorId: visitor.characterId,
  issuerId: "a",
  outsideHours: true,
  sceneId: null,
  accompaniedBy: null,
  revoked: false,
  issuedAt: firstMorning.toISOString(),
  sourceLineIds: [],
});
const residentHostWorld = structuredClone(world);
residentHostWorld.venues.push(host);
settleVisitorTrip(residentHostWorld, firstMorning);
assert.equal(visitingCharacter(residentHostWorld, firstMorning)?.trip.lodging?.hostId, "a");
assert.equal(visitorPosition(residentHostWorld, nightTwo, new Map())?.venueId, host.id);

const first = { id: "message-1", at: elapsed(1) };
applyVisitPreference(visitor, "invite", first, elapsed(1));
const saved = structuredClone(visitor.visitPreference);
applyVisitPreference(visitor, "invite", { id: "message-2", at: elapsed(2) }, elapsed(2));
assert.equal(visitor.visitPreference?.until, saved?.until, "a repeat invitation cannot extend the window");
assert.equal(visitor.visitPreference?.sourceId, saved?.sourceId, "a repeat invitation cannot reroll");
applyVisitPreference(visitor, "space", { id: "message-older", at: elapsed(1.5) }, elapsed(2.5));
assert.equal(visitor.visitPreference?.kind, "invite", "an older reply cannot override the latest agreement");
applyVisitPreference(visitor, "space", { id: "message-3", at: elapsed(3) }, elapsed(3));
applyVisitPreference(visitor, "invite", first, elapsed(4));
assert.equal(visitor.visitPreference?.kind, "space");
const spacing = structuredClone(world);
spacing.visitors = spacing.visitors!.filter((person) => person.characterId === visitor.characterId);
delete spacing.visitors![0].trip;
const duringSpace = new Date("2026-09-06T18:00:00.000Z");
settleVisitorTrip(spacing, duringSpace);
assert.equal(visitingCharacter(spacing, duringSpace), undefined);
visitor.visitsEnabled = false;
assert.equal(visitingCharacter(world, firstMorning), undefined);
