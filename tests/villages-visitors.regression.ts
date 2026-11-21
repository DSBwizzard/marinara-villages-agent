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
  visitorLodging,
} from "../packages/villages/src/server/domain/rules/visitors.js";
import { elapsed, socialWorldFixture } from "./fixtures/social-world.fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";

const world = socialWorldFixture();
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
});
assert.equal(visitingCharacter(coerceVillageState(world), firstMorning)?.trip?.lodging, undefined);
assert.equal(nextVisitorTransition(world, arrival), nightOne.getTime());
assert.equal(nextVisitorTransition(world, nightOne), firstMorning.getTime());
assert.equal(visitorPosition(world, nightOne, new Map()), undefined);
assert.equal(visitorPosition(world, nightTwo, new Map()), undefined);
assert.equal(visitorPosition(world, firstMorning, new Map())?.venueId, world.venues[0].id);
assert.equal(
  visitingCharacter(world, departure),
  undefined,
  "Departure is after the second local night, including DST.",
);
assert.equal(sameVisitorPhase(world, visitor.characterId, arrival, nightOne), false);
assert.equal(
  captureSceneAttendance(world, "inn", nightOne).occupants.find((person) => person.characterId === visitor.characterId)
    ?.zoneId,
  undefined,
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
const beforeOffer = structuredClone(world);
assert.throws(() => offerVisitorLodging(world, visitor.characterId, visitor.trip.arrivedAt, arrival), /unavailable/);
assert.deepEqual(world, beforeOffer, "A room name cannot create overnight access");
assert.equal(home.access?.permissions.length, 0);
const legacy = structuredClone(world);
const legacyHome = legacy.venues.find((venue) => venue.id === home.id)!;
const legacyVisitor = legacy.visitors!.find((person) => person.characterId === visitor.characterId)!;
legacyVisitor.trip!.lodging = { venueId: home.id, zoneId: zone.id, hostId: "player" };
legacyHome.access!.permissions.push({
  id: "previously-accepted-lodging",
  zoneId: zone.id,
  visitorId: visitor.characterId,
  issuerId: "player",
  duration: "lodging",
  expiresAt: departure.toISOString(),
  sceneId: null,
  accompaniedBy: null,
  outsideHours: true,
  revoked: false,
  issuedAt: arrival.toISOString(),
  sourceLineIds: [],
});
legacyHome.zones!.find((entry) => entry.id === zone.id)!.name = "Quiet Alcove";
assert.deepEqual(
  coerceVillageState(legacy).visitors!.find((person) => person.characterId === visitor.characterId)!.trip!.lodging,
  legacyVisitor.trip!.lodging,
);
assert(visitorLodging(legacy, legacyVisitor, nightOne), "Saved native permission survives renaming");
assert.equal(visitorPosition(legacy, nightOne, new Map())?.venueId, home.id);
offerVisitorLodging(legacy, visitor.characterId, visitor.trip.arrivedAt, arrival);
assert.equal(legacyHome.access!.permissions.length, 1, "Acknowledging an old grant does not duplicate it");
assert.equal(evaluateZoneAccess(home, zone, visitor.characterId, { at: departure }).allowed, false);
assert.equal(evaluateZoneAccess(home, zone, "uninvited", { at: nightOne }).allowed, false);
assert.throws(() => offerVisitorLodging(world, visitor.characterId, visitor.trip.arrivedAt, departure), /ended/i);

const afterCheckout = structuredClone(legacy);
afterCheckout.clock = { trustedAt: departure.toISOString(), revision: 1, replayUntilDate: "2026-11-02" };
settleVisitorTrip(afterCheckout, nightTwo);
assert.equal(visitingCharacter(afterCheckout, nightTwo), undefined);
assert.equal(afterCheckout.venues.find((venue) => venue.id === home.id)?.access?.permissions.length, 0);

legacyHome.access!.permissions[0].revoked = true;
assert.equal(
  visitorLodging(legacy, legacyVisitor, nightOne),
  undefined,
  "Revoked rooms cannot be displayed as lodging",
);
settleVisitorTrip(legacy, nightOne);
assert.equal(visitingCharacter(legacy, nightOne)?.trip.lodging, undefined);
assert.equal(visitorPosition(legacy, nightOne, new Map()), undefined, "A revoked room stays off the map.");
assert.equal(visitorPosition(world, firstMorning, new Map())?.venueId, world.venues[0].id);

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
assert.equal(
  visitingCharacter(residentHostWorld, firstMorning)?.trip.lodging,
  undefined,
  "Standing access does not select lodging",
);
assert.equal(visitorPosition(residentHostWorld, nightTwo, new Map()), undefined);
const namedPublicRoom = structuredClone(world);
namedPublicRoom.venues = [structuredClone(inn)];
const beforeRename = visitorPosition(namedPublicRoom, firstMorning, new Map());
namedPublicRoom.venues[0].name = "Market";
namedPublicRoom.venues[0].zones!.find((entry) => entry.id === "guest")!.name = "Arcade";
assert.deepEqual(
  visitorPosition(namedPublicRoom, firstMorning, new Map())?.zoneId,
  beforeRename?.zoneId,
  "Room names do not decide daytime entry",
);

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
