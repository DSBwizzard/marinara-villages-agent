import { villageSettings } from "../packages/villages/src/server/domain/rules/world-snapshot.js";
import assert from "node:assert/strict";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { assertResidenceAgreement } from "../packages/villages/src/server/domain/rules/residence-agreement.js";
import {
  requestResidenceMove,
  completeResidenceMove,
} from "../packages/villages/src/server/domain/rules/residence-move.js";
import {
  evaluateZoneAccess,
  managesAccess,
  applyAccessCommand,
} from "../packages/villages/src/server/domain/rules/venue-access.js";
import { synchronizeVenueZones } from "../packages/villages/src/server/domain/rules/venue-zones.js";
import { newSetupVenue } from "../packages/villages/src/client/features/founding/FoundingPanels.js";
import { reconcileFoundingHome } from "../packages/villages/src/client/features/founding/founding-homes.js";
const at = new Date("2026-11-23T10:00:00Z");
const policy = {
  mode: "permission-required" as const,
  managerIds: ["a"],
  memberIds: ["a", "guest"],
  memberRoles: [],
  inviterIds: ["guest"],
  visitorHours: "always" as const,
  accompanied: false,
};
function fixture() {
  const state = defaultVillageState();
  state.timeZone = "UTC";
  state.villagers = ["a", "b", "c"].map((id) => ({
    characterId: id,
    incarnation: id,
    cardSnapshot: { id, name: id, capturedAt: at.toISOString() },
    addedAt: at.toISOString(),
    agenda: null,
    letterFontId: "lora",
  })) as any;
  const home = venueFixture({
    id: "home",
    name: "Cafe",
    residentIds: ["a", "b"],
    residenceCapacity: 2,
    privateSpaces: [
      {
        id: "bed",
        name: "Upstairs bedroom",
        ownerId: "a",
        description: "Two beds",
        image: null,
        access: structuredClone(policy),
      },
    ],
    destinations: { a: { sleep: "bed" }, b: { sleep: "other", work: "floor" } },
    spaces: [
      { id: "other", name: "Other bedroom", description: "A room", image: null },
      { id: "floor", description: "Tables", image: null },
    ],
  });
  home.access!.managerIds = ["a"];
  home.knownSleepDestinations = { a: "bed", b: "other" };
  const inn = venueFixture({
    id: "inn",
    name: "Inn",
    residenceCapacity: 3,
    spaces: [{ id: "room", description: "A bedroom", image: null }],
  });
  state.venues = [home, inn];
  return { state, home, inn };
}
function approve(state: ReturnType<typeof fixture>["state"], actor: string) {
  const move = state.residences.find((row) => row.characterId === actor)!;
  move.status = "moving";
  for (const id of move.agreement!.requiredIds) move.agreement!.approvals[id] = true;
  return move;
}
{
  const { state, home } = fixture();
  const zone = home.zones!.find((row) => row.id === "bed")!;
  const physical = structuredClone(zone);
  requestResidenceMove(state, "b", home.id, "player", "bed", "same", at);
  approve(state, "b");
  assert.equal(completeResidenceMove(state, "b", true, at), true);
  assert.deepEqual(home.destinations!.b, { sleep: "bed", work: "floor" });
  assert.deepEqual(home.residentIds, ["a", "b"]);
  assert.equal(home.residenceCapacity, 2);
  assert.deepEqual(zone, physical, "Changing bedrooms preserves physical room and access policy");
  assert.equal(evaluateZoneAccess(home, zone, "b", { at }).allowed, true);
  assert.equal(managesAccess(home, zone.id, "b"), false, "Sharing does not grant management");
  assert.equal(home.knownSleepDestinations!.b, "bed");
  home.access!.bans.push({
    id: "ban",
    zoneId: "bed",
    visitorId: "b",
    issuerId: "a",
    active: true,
    issuedAt: at.toISOString(),
    sourceLineIds: [],
  });
  assert.equal(evaluateZoneAccess(home, zone, "b", { at }).allowed, false, "Bans still apply to sleepers");
}
{
  const { state, home } = fixture();
  assert.throws(
    () => requestResidenceMove(state, "c", home.id, "player", "bed", "full", at),
    /unreserved resident place/,
  );
}

{
  const { state, home } = fixture();
  home.destinations!.b = { home: "bed", sleep: "bed", work: "floor" };
  requestResidenceMove(state, "b", home.id, "player", "other", "leave-bedroom", at);
  approve(state, "b");
  assert.equal(completeResidenceMove(state, "b", true, at), true);
  assert.equal(
    home.destinations!.b.home,
    "other",
    "Home follows the agreed bedroom when the prior private home becomes inaccessible",
  );
  assert.equal(home.destinations!.b.work, "floor");
}

{
  const { state, home } = fixture();
  home.residenceCapacity = 3;
  requestResidenceMove(state, "c", home.id, "player", "bed", "stale", at);
  const move = approve(state, "c");
  home.destinations!.b.sleep = "bed";
  assert.throws(
    () => assertResidenceAgreement(state, move),
    /changed/,
    "A new co-sleeper invalidates captured consent",
  );
  assert.equal(completeResidenceMove(state, "c", true, at), false);
  assert.equal(move.status, "pending");
  assert.deepEqual(move.agreement!.approvals, {});
}
{
  const { state, home, inn } = fixture();
  home.residenceCapacity = 3;
  home.destinations!.b.sleep = "bed";
  home.access!.managerIds = ["c"];
  requestResidenceMove(state, "a", inn.id, "player", "room", "leave", at);
  approve(state, "a");
  assert.equal(completeResidenceMove(state, "a", true, at), true);
  synchronizeVenueZones(home);
  const bed = home.zones!.find((row) => row.id === "bed")!;
  assert.equal(bed.ownerId, undefined);
  assert.equal(evaluateZoneAccess(home, bed, "b", { at }).allowed, true);
  assert.equal(
    managesAccess(home, bed.id, "c"),
    false,
    "A departing room manager does not automatically hand private control to a Venue manager",
  );
  assert.equal(evaluateZoneAccess(home, bed, "c", { at }).allowed, false);
  assert.deepEqual(bed.access!.memberIds, ["guest"]);
  assert.deepEqual(bed.access!.inviterIds, ["guest"]);
  assert.equal(home.archivedPrivateSpaces?.length ?? 0, 0, "Keep an occupied room live");
  home.destinations!.c = { work: "floor" };
  const before = structuredClone(bed.access);
  requestResidenceMove(state, "c", home.id, "player", "bed", "arrive", at);
  approve(state, "c");
  assert.equal(completeResidenceMove(state, "c", true, at), true);
  assert.deepEqual(home.destinations!.c, { work: "floor", sleep: "bed" });
  assert.equal(managesAccess(home, "bed", "c"), false);
  assert.deepEqual(bed.access, before, "Another sleeper does not replace existing access policy");
}
{
  const { state, home, inn } = fixture();
  inn.access!.managerIds = ["c"];
  requestResidenceMove(state, "b", inn.id, "villager", "room", "hidden", at);
  approve(state, "b");
  assert.equal(completeResidenceMove(state, "b", true, at), true);
  assert.equal(home.knownSleepDestinations!.b, "other", "Unknown moves preserve prior player knowledge");
  requestResidenceMove(state, "b", home.id, "player", "bed", "known", at);
  approve(state, "b");
  assert.equal(completeResidenceMove(state, "b", true, at), true);
  assert.equal(inn.knownSleepDestinations?.b, undefined);
  assert.equal(home.knownSleepDestinations!.b, "bed");
  const saved = coerceVillageState(JSON.parse(JSON.stringify(state)));
  assert.equal(saved.venues.find((row) => row.id === home.id)!.knownSleepDestinations!.b, "bed");
}
{
  const { home } = fixture();
  assert.throws(
    () =>
      applyAccessCommand(
        home,
        {
          action: "destinations",
          operationId: "bypass",
          expectedRevision: home.access!.revision,
          zoneId: null,
          visitorId: "b",
          sleep: "bed",
        },
        "b",
        at.toISOString(),
        ["a", "b", "c", "player"],
      ),
    /Propose sleeping/,
  );
  assert.equal(home.destinations!.b.sleep, "other");
}
{
  const draft = newSetupVenue("bedroom-only", 0.5, 0.5, false);
  draft.residentIds = ["a", "b"];
  draft.residenceCapacity = 2;
  draft.foundingCapacity = 2;
  draft.spaces = [];
  draft.privateSpaces = [
    {
      id: "bed",
      name: "Bedroom",
      ownerId: "a",
      description: "Two beds",
      image: null,
      connectedTo: ["exterior"],
      access: structuredClone(policy),
    },
  ];
  draft.destinations = { a: { sleep: "bed" }, b: { sleep: "bed" } };
  const next = reconcileFoundingHome(draft);
  assert.equal(next.destinations!.b.sleep, "bed", "Explicit shared bedroom survives every Founding patch");
  const remaining = reconcileFoundingHome(next, ["b"]);
  assert.equal(remaining.destinations!.b.sleep, "bed");
  assert.deepEqual(
    remaining.privateSpaces![0].access!.managerIds,
    [],
    "Removing the room steward grants no new authority",
  );
  assert.deepEqual(remaining.privateSpaces![0].access!.memberIds, ["guest"]);
  assert.deepEqual(remaining.privateSpaces![0].access!.inviterIds, ["guest"]);
  const moved = reconcileFoundingHome({
    ...next,
    spaces: [{ id: "new-bedroom", description: "A room", image: null, connectedTo: ["exterior"] }],
    destinations: { ...next.destinations, b: { home: "bed", sleep: "new-bedroom" } },
  });
  assert.equal(
    moved.destinations!.b.home,
    "new-bedroom",
    "Founding updates an inaccessible former home after a bedroom change",
  );
}
{
  const { state, home } = fixture();
  home.destinations!.b.sleep = "bed";
  const view = villageSettings(state, { name: "Player", description: "", personaId: "", missing: false }, null);
  const projected = view.venues.find((row) => row.id === "home")!;
  assert.deepEqual(
    projected.destinations!.b,
    { sleep: "other" },
    "Profiles use learned arrangements, not unseen canonical changes",
  );
  assert.equal((projected as any).knownSleepDestinations, undefined);
}
console.log("Shared bedrooms: consent, access, preservation, knowledge and Founding passed.");
