import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { establishPlace, projectPlace } from "./helpers/places.fixture.js";

import { findLocation, findNpc, readPlaceRegistry } from "../packages/villages/src/server/domain/rules/places.js";
import {
  encodeContinuityPages,
  decodeContinuityPagesSync,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { memoryPayload } from "../packages/villages/src/server/adapters/storage/memory-payload-store.js";

const state = defaultVillageState();
state.seed = "world";
const place = establishPlace(
  state,
  {
    name: "The Lantern",
    description: "A restaurant facing the square.",
    controllers: ["jo"],
    people: [{ ref: "jo", name: "Jo", characterization: "A reserved, attentive host.", role: "Proprietor" }],
    zones: [
      { id: "dining", name: "Dining room", kind: "public", description: "Wooden tables beside the windows." },
      { id: "kitchen", name: "Kitchen", kind: "restricted", description: "The private kitchen.", controllers: ["jo"] },
    ],
  },
  "place:lantern",
  "map",
  "request:test",
  "2026-11-03T12:00:00.000Z",
  true,
);
assert.equal(state.venues.length, 0, "A discovered Place consumes no Venue slot");
assert.equal(findLocation(state, place.id), place.location);
assert.equal(findNpc(state, "npc:place:lantern:jo")?.name, "Jo");
assert.deepEqual(place.location.access?.managerIds, ["npc:place:lantern:jo"]);
const projected = projectPlace(state, place);
place.location.zones!.find((zone) => zone.id === "kitchen")!.picture = {
  base: { id: "secret", ref: "global-gallery:secret", url: "/api/global-gallery/file/secret.png" },
  baseline: "Private kitchen details",
  context: "Hidden interior context",
};
assert.equal(projectPlace(state, place).zones?.find((zone) => zone.id === "kitchen")?.picture, undefined);
assert.equal(projected.access, undefined);
assert.equal(projected.zones?.find((zone) => zone.id === "kitchen")?.name, "Kitchen");
assert.equal(projected.zones?.find((zone) => zone.id === "kitchen")?.description, "");
assert.equal(projected.zones?.find((zone) => zone.id === "kitchen")?.image, null);
assert.equal(projected.zones?.find((zone) => zone.id === "kitchen")?.access, undefined);
const encoded = encodeContinuityPages(memoryPayload(state), "a".repeat(32));
const decoded = decodeContinuityPagesSync(
  encoded.manifest,
  "a".repeat(32),
  state.seed,
  (id) => encoded.pages.get(id) ?? null,
);
assert.deepEqual(
  decoded.value.worldPlaces,
  JSON.parse(JSON.stringify(state.worldPlaces)),
  "Private history preserves Place and NPC identities",
);
const restored = readPlaceRegistry(decoded.value.worldPlaces);
for (const missing of ["ledger", "zone-policy"] as const) {
  const incomplete = structuredClone(state.worldPlaces);
  const location = incomplete.places[place.id].location;
  if (missing === "ledger") delete location.access;
  else delete location.zones!.find((zone) => zone.id === "kitchen")!.access;
  const before = structuredClone(incomplete);
  assert.throws(() => readPlaceRegistry(incomplete), missing === "ledger" ? /no access record/ : /access policy/);
  assert.deepEqual(incomplete, before, "decoding never constructs missing authority or changes saved evidence");
}
assert.deepEqual(restored.places[place.id].location.access, place.location.access);
assert.equal(projectPlace(state, place).access, undefined, "the required saved ledger stays private");

restored.places[place.id].location.name = "Renamed";
assert.equal(state.worldPlaces.places[place.id].location.name, "The Lantern");
assert.throws(
  () =>
    establishPlace(
      state,
      { name: "Forgery", description: "A building.", controllers: ["unknown"] },
      "place:forgery",
      "map",
      "test",
      "2026-11-03T12:00:00.000Z",
      true,
    ),
  /established identity/,
);
assert.throws(() =>
  establishPlace(
    state,
    {
      name: "Bad layout",
      description: "A building.",
      zones: [{ id: "room", name: "Room", kind: "public", description: "A room.", connectedTo: ["unknown"] }],
    },
    "place:bad",
    "map",
    "test",
    "2026-11-03T12:00:00.000Z",
    true,
  ),
);
const { admitLocation } = await import("../packages/villages/src/server/domain/rules/place-admission.js");
const { villageVenueUsage } = await import("../packages/villages/src/server/domain/rules/venue-capacity.js");
state.setupAt = "2026-11-03T12:00:00.000Z";
assert.throws(() => admitLocation(state, place.id), /Visit/);
assert.equal(villageVenueUsage(state).total, 0);
place.visited = true;
const sameZone = place.location.zones![1],
  sameNpc = state.worldPlaces.npcs["npc:place:lantern:jo"];
admitLocation(state, place.id);
assert.equal(
  Object.hasOwn(
    place.location.zones!.find((zone) => zone.kind === "restricted")!,
    "venueClass",
  ),
  false,
);
assert.equal(state.venues[0], place.location);
assert.equal(state.venues[0].zones![1], sameZone);
assert.equal(state.worldPlaces.npcs[sameNpc.id], sameNpc);
assert.equal(state.worldPlaces.places[place.id], undefined);
assert.equal(villageVenueUsage(state).total, 1);
assert.equal(state.projects.length, 0, "Admission creates no Project or work reservation");
assert.equal(state.venues[0].access?.managerIds.includes("player"), false, "Admission preserves controllers");
assert.equal(
  state.venues[0].zones!.find((zone) => zone.id === "kitchen")!.seen,
  false,
  "Admission reveals no private room",
);
const full = defaultVillageState();
full.venues = Array.from({ length: 16 }, (_, index) => ({ ...structuredClone(place.location), id: "venue:" + index }));
const waiting = establishPlace(
  full,
  { name: "Garden", description: "An existing garden." },
  "waiting",
  "map",
  "test",
  state.setupAt,
  true,
);
waiting.visited = true;
assert.throws(() => admitLocation(full, waiting.id), /no room/);
assert.equal(full.worldPlaces.places[waiting.id], waiting, "Rejected admission preserves the location");
const { applyAccessCommand } = await import("../packages/villages/src/server/domain/rules/venue-access.js");
const { sceneActorIds } = await import("../packages/villages/src/server/domain/rules/places.js");
applyAccessCommand(
  state.venues[0],
  {
    action: "invite",
    operationId: "standing-kitchen",
    expectedRevision: state.venues[0].access!.revision,
    zoneId: "kitchen",
    visitorId: "player",
    duration: "standing",
    accompanied: false,
    outsideHours: false,
  },
  sameNpc.id,
  state.setupAt,
  ["player", ...sceneActorIds(state)],
  ["standing"],
);
assert.equal(
  state.venues[0].access?.permissions.some((grant) => grant.issuerId === sameNpc.id && !grant.revoked),
  true,
  "A proprietor can issue a scoped native standing grant",
);
assert.throws(
  () =>
    applyAccessCommand(
      state.venues[0],
      {
        operationId: "takeover",
        expectedRevision: state.venues[0].access!.revision,
        zoneId: null,
        action: "recover-managers",
      } as any,
      "player",
      state.setupAt,
      ["player", ...sceneActorIds(state)],
    ),
  /manage|control|recover/i,
  "A living NPC proprietor cannot be recovered away",
);
{
  const world = defaultVillageState();
  const draft = {
    name: "Sunroom",
    description: "A conservatory with a glass roof.",
    dayNight: true,
    zones: [{ id: "cellar", name: "Cellar", kind: "public", description: "A windowless cellar.", dayNight: false }],
  };
  const first = establishPlace(world, draft, "light-place", "map", "test", "2026-11-05T12:00:00Z", true);
  assert.equal(first.location.zones![0].dayNight, true);
  first.location.zones![0].dayNight = false;
  const next = establishPlace(world, draft, "light-place", "map", "test", "2026-11-05T13:00:00Z", true, first);
  assert.equal(next.location.zones![0].dayNight, true, "preparing a Place uses its automatic lighting decision");
  assert.equal(next.location.zones![1].dayNight, false);
  assert.equal(projectPlace(world, next).zones![1].description, "");
  assert.equal(projectPlace(world, next).zones![1].dayNight, undefined, "hidden lighting metadata remains private");
}
