import { ZonedDate } from "../packages/villages/src/shared/helpers/zoned-date.js";
import assert from "node:assert/strict";
import { venueFixture } from "./helpers/venues.fixture.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { captureResidenceAgreement } from "../packages/villages/src/server/domain/rules/residence-agreement.js";
import {
  initializeVenueAccess,
  managesAccess,
  mayInvite,
  evaluateZoneAccess,
  applyAccessCommand,
  projectVenueAccess,
  projectZoneAccess,
} from "../packages/villages/src/server/domain/rules/venue-access.js";
import type { AccessCommand } from "../packages/villages/src/shared/helpers/venue-access.js";

const at = new ZonedDate("2026-11-23T10:00:00Z", "UTC");
const venue = venueFixture({
  id: "cafe",
  residentIds: ["a", "b", "friend"],
  occupancy: { playerHome: false, residentCharacterId: "a", homeKind: null },
  zones: [
    { id: "exterior", kind: "exterior", name: "Entrance", description: "", image: null },
    { id: "floor", kind: "public", name: "Café floor", description: "", image: null },
    { id: "bed", kind: "personal", ownerId: "a", name: "Bedroom", description: "", image: null },
  ],
});
initializeVenueAccess(venue);
venue.access!.managerIds = ["operator"];
venue.destinations = { a: { sleep: "bed" }, b: { sleep: "bed" }, friend: { sleep: "floor" } };
venue.access!.work = [
  {
    characterId: "worker",
    activity: "Serving",
    zoneId: "floor",
    accessZoneIds: ["floor"],
    days: ["Monday"],
    startMinute: 540,
    endMinute: 1020,
  },
];
const known = ["player", "a", "b", "operator", "worker", "friend", "guest"];
const command = (actor: string, value: Omit<AccessCommand, "operationId" | "expectedRevision">) =>
  applyAccessCommand(
    venue,
    {
      ...value,
      operationId: "op-" + venue.access!.revision,
      expectedRevision: venue.access!.revision,
    } as AccessCommand,
    actor,
    at.toISOString(),
    known,
  );
assert.equal(managesAccess(venue, "floor", "operator"), true);
venue.zones![1]!.access!.managerIds = ["a"];
assert.equal(managesAccess(venue, "floor", "operator"), true, "Legacy Zone delegates do not displace the operator");
assert.equal(managesAccess(venue, "bed", "operator"), false);
assert.equal(managesAccess(venue, "bed", "b"), true);
assert.equal(mayInvite(venue, venue.zones![2]!, "b"), true);
assert.equal(managesAccess(venue, "floor", "friend"), false, "A couch arrangement grants no café authority");
assert.equal(mayInvite(venue, venue.zones![1]!, "worker"), false);
venue.access!.work[0]!.inviteGuests = true;
assert.equal(mayInvite(venue, venue.zones![1]!, "worker"), true);
assert.equal(mayInvite(venue, venue.zones![2]!, "worker"), false);
venue.zones![1]!.access!.mode = "permission-required";
assert.equal(evaluateZoneAccess(venue, venue.zones![1]!, "worker", { at }).allowed, true);
assert.equal(
  evaluateZoneAccess(venue, venue.zones![1]!, "worker", { at: new ZonedDate("2026-11-23T20:00:00Z", "UTC") }).allowed,
  false,
);
const workVenue = structuredClone(venue);
applyAccessCommand(
  workVenue,
  {
    action: "invite",
    operationId: "worker-guest",
    expectedRevision: workVenue.access!.revision,
    zoneId: "floor",
    visitorId: "guest",
    duration: "standing",
    accompanied: false,
    outsideHours: false,
  },
  "worker",
  at.toISOString(),
  known,
);
const afterShift = new ZonedDate("2026-11-23T20:00:00Z", "UTC");
assert.equal(evaluateZoneAccess(workVenue, workVenue.zones![1]!, "guest", { at: afterShift }).allowed, true);
workVenue.access!.work[0]!.inviteGuests = false;
initializeVenueAccess(workVenue);
assert.equal(evaluateZoneAccess(workVenue, workVenue.zones![1]!, "guest", { at: afterShift }).allowed, false);
assert.throws(() => command("a", { action: "ban", zoneId: "bed", visitorId: "b" } as any), /Home arrangement/);
assert.throws(() => command("operator", { action: "ban", zoneId: null, visitorId: "guest" } as any), /manage/);
venue.access!.bans.push({
  id: "old-ban",
  zoneId: null,
  visitorId: "guest",
  issuerId: "operator",
  active: true,
  issuedAt: at.toISOString(),
  sourceLineIds: [],
});
venue.access!.permissions.push({
  id: "private-invitation",
  zoneId: "bed",
  visitorId: "guest",
  issuerId: "a",
  duration: "standing",
  sceneId: null,
  accompaniedBy: null,
  outsideHours: false,
  revoked: false,
  issuedAt: at.toISOString(),
  sourceLineIds: [],
});
assert.deepEqual(
  projectVenueAccess(venue, "operator")!.exceptionInvitations,
  [],
  "Operators cannot inspect private invitations",
);
const schedule = [{ days: ["Monday"], start: "08:00", end: "18:00" }];
venue.access!.visitorHours = schedule;
venue.zones![1]!.access!.visitorHours = "inherit";
initializeVenueAccess(venue);
assert.deepEqual(
  venue.zones![1]!.access!.visitorHours,
  schedule,
  "Saved schedules become explicit without changing them",
);
assert.deepEqual(projectZoneAccess(venue, venue.zones![1]!, "operator", { at }).visitorHours, schedule);
assert.throws(
  () => command("operator", { action: "venue-policy", zoneId: null, managerIds: [], visitorHours: schedule } as any),
  /specific Zone/,
);
command("operator", { action: "venue-policy", zoneId: null, managerIds: [] } as any);
assert.deepEqual(venue.access!.managerIds, []);
assert.equal(managesAccess(venue, null, "player"), true, "The player can manage an unclaimed Venue");
assert.equal(managesAccess(venue, "bed", "player"), false, "Unclaimed Venue responsibility never overrides a bedroom");
const emptyVenue = venueFixture({
  id: "empty",
  zones: [{ id: "room", kind: "public", name: "Room", description: "", image: null }],
});
emptyVenue.access!.managerIds = [];
const state = defaultVillageState();
state.venues = [emptyVenue];
assert.deepEqual(
  captureResidenceAgreement(state, emptyVenue, "guest", "room", "new-home", at.toISOString()).requiredIds,
  ["guest", "player"],
  "An unclaimed Venue still requires the player's Home approval",
);
const unclaimedRoom = emptyVenue.zones!.find((zone) => zone.id === "room")!;
unclaimedRoom.access!.mode = "permission-required";
assert.equal(managesAccess(emptyVenue, "room", "player"), true);
assert.equal(
  evaluateZoneAccess(emptyVenue, unclaimedRoom, "player", { at }).allowed,
  false,
  "Fallback editing authority does not grant physical entry",
);
unclaimedRoom.access!.mode = "public";
unclaimedRoom.access!.visitorHours = [{ days: ["Monday"], start: "17:00", end: "23:00" }];
assert.equal(
  evaluateZoneAccess(emptyVenue, unclaimedRoom, "player", { at }).allowed,
  false,
  "Fallback editing authority does not bypass visiting hours",
);
unclaimedRoom.access!.managerIds = ["guest"];
assert.equal(
  managesAccess(emptyVenue, "room", "player"),
  false,
  "An unclaimed Venue does not take over a Zone with an assigned controller",
);
console.log("Venue responsibility, shared bedrooms, scheduled work, private invitations and explicit hours passed.");
