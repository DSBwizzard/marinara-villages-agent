import assert from "node:assert/strict";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { applyVenueZoneLayout } from "../packages/villages/src/server/domain/rules/venue-layout.js";
import { captureSceneLayout, sceneLayoutVenue } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { parsePlace } from "../packages/villages/src/server/domain/rules/founding-record.js";
import { zoneSoundRange } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { newSetupVenue } from "../packages/villages/src/client/features/founding/FoundingPanels.js";
import {
  foundingLayoutProblem,
  removeFoundingZone,
} from "../packages/villages/src/client/features/founding/villages-founding-zones.js";
import {
  includeFoundingZone,
  resumeFoundingVenue,
} from "../packages/villages/src/client/features/founding/founding-template.js";
import {
  readZoneLayout,
  resolveZoneLayout,
  zoneLayoutKey,
  zonePositionFits,
} from "../packages/villages/src/shared/helpers/zone-layout.js";
import { contactNeighborIds } from "../packages/villages/src/shared/helpers/zone-contact.js";
import { fixture } from "./fixtures/villages-projects.fixture.js";
import type { VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
import type { VillageProject } from "../packages/villages/src/server/domain/models/world.js";

const f = fixture(),
  state = structuredClone(f.state()),
  venue = state.venues[0];
venue.access!.managerIds = ["player"];
venue.zones = Array.from({ length: 7 }, (_, i) => ({
  ...structuredClone(venue.zones![i ? 1 : 0]),
  id: i ? `zone:${i}` : "exterior",
  connectedTo: i ? [i === 1 ? "exterior" : `zone:${i - 1}`, ...(i < 6 ? [`zone:${i + 1}`] : [])] : ["zone:1"],
}));
const ids = venue.zones.map((z) => z.id);
const positions = resolveZoneLayout(ids);
assert.ok(ids.every((id) => zonePositionFits(positions, id, positions[id])));
assert.equal(
  readZoneLayout({ ...positions, "zone:1": positions.exterior }, ids),
  null,
  "Overlapping rectangles are refused",
);
for (const point of [
  { x: 69, y: 0 },
  { x: 0, y: 87 },
  { x: NaN, y: 0 },
  { x: -1, y: 0 },
  { x: Infinity, y: 0 },
])
  assert.equal(readZoneLayout({ exterior: point }, ids), null);
assert.equal(readZoneLayout({ unknown: { x: 0, y: 0 } }, ids), null);
const command = () => ({
  base: zoneLayoutKey(venue.zones!, venue.zoneLayout),
  positions: structuredClone(positions),
  connections: venue.zones!.map((z) => ({ id: z.id, connectedTo: contactNeighborIds(venue.zones!, z.id) })),
});
const first = command();
applyVenueZoneLayout(state, venue, first);
assert.deepEqual(JSON.parse(JSON.stringify(venue.zoneLayout)), JSON.parse(JSON.stringify(positions)));
assert.deepEqual(
  JSON.parse(JSON.stringify(coerceVillageState(state).venues[0].zoneLayout)),
  JSON.parse(JSON.stringify(positions)),
  "Positions survive saved-world decoding",
);
const snapshot = { sceneAttendance: { layout: captureSceneLayout(venue) } } as VenueScene;
const change = command();
change.connections.find((z) => z.id === "zone:1")!.connectedTo.push("zone:6");
change.connections.find((z) => z.id === "zone:6")!.connectedTo.push("zone:1");
applyVenueZoneLayout(state, venue, change);
assert.ok(contactNeighborIds(venue.zones!, "zone:1").includes("zone:6"));
assert.ok(
  !contactNeighborIds(sceneLayoutVenue(venue, snapshot).zones!, "zone:1").includes("zone:6"),
  "An active Scene retains its captured passages",
);
assert.throws(
  () => applyVenueZoneLayout(state, venue, change),
  /layout changed/,
  "A stale editor cannot overwrite a newer layout",
);
const invalid = command();
invalid.positions["zone:2"] = { ...invalid.positions.exterior };
assert.throws(() => applyVenueZoneLayout(state, venue, invalid), /without overlapping/);
assert.throws(() => applyVenueZoneLayout(state, venue, { ...command(), zones: [] }), /Only Zone positions/);
const disconnected = command();
disconnected.connections = disconnected.connections.map((z) => ({
  ...z,
  connectedTo: z.connectedTo.filter((id) => id !== "exterior"),
}));
disconnected.connections[0].connectedTo = [];
assert.throws(() => applyVenueZoneLayout(state, venue, disconnected), /Cannot save Venue layout: Unreachable Zones\./);
const missing = command();
missing.connections.pop();
assert.throws(() => applyVenueZoneLayout(state, venue, missing), /each current Zone/);
const original = JSON.stringify(venue);
venue.access!.managerIds = ["other"];
const unauthorized = command();
unauthorized.connections.find((z) => z.id === "zone:2")!.connectedTo.push("zone:6");
assert.throws(() => applyVenueZoneLayout(state, venue, unauthorized), /managers/);
venue.access!.managerIds = ["player"];
assert.equal(JSON.stringify(venue), original, "Denied rewiring does not change authored data");
const zone = venue.zones![2];
zone.access = {
  mode: "permission-required",
  managerIds: ["other"],
  memberIds: [],
  memberRoles: [],
  inviterIds: [],
  visitorHours: "inherit",
  accompanied: false,
};
assert.throws(
  () => applyVenueZoneLayout(state, venue, unauthorized),
  /managers/,
  "A Venue manager cannot rewire independently managed private boundaries",
);
delete zone.access;
state.projects.push({ venueId: venue.id, lifecycle: { phase: "planning" } } as VillageProject);
assert.throws(() => applyVenueZoneLayout(state, venue, unauthorized), /current Venue project/);
state.projects = [];
const cosmetic = command();
cosmetic.positions.exterior = { x: 2, y: 2 };
venue.access!.managerIds = ["other"];
applyVenueZoneLayout(state, venue, cosmetic);
assert.deepEqual(
  venue.zoneLayout!.exterior,
  { x: 2, y: 2 },
  "Cosmetic arrangement does not confer structural authority",
);
venue.zoneLayout!["removed"] = { x: 2, y: 16 };
assert.equal(
  coerceVillageState(state).venues[0].zoneLayout!.removed,
  undefined,
  "Removed structural IDs are pruned without discarding remaining positions",
);
const home = newSetupVenue("home", "residence", 0.2, 0.3, true);
home.form = "Cottage";
home.description = "A stone approach";
home.spaces![0].description = "A shared room";
home.privateSpaces![0].description = "A quiet bedroom";
const homeIds = ["exterior", ...home.spaces!.map((z) => z.id), ...home.privateSpaces!.map((z) => z.id)];
home.zoneLayout = resolveZoneLayout(homeIds);
assert.deepEqual(parsePlace(home, true).zoneLayout, home.zoneLayout, "Founding retains authored positions");
home.spaces![0].connectedTo = ["exterior", home.privateSpaces![0].id];
home.privateSpaces![0].connectedTo = [home.spaces![0].id];
const removalInput = {
  ...home,
  destinations: {
    player: { home: home.spaces![0].id, sleep: home.privateSpaces![0].id },
  },
};
const removed = removeFoundingZone(removalInput, home.privateSpaces![0].id);
assert.equal(removed.zoneLayout![home.privateSpaces![0].id], undefined);
assert.deepEqual(
  removed.destinations,
  { player: { home: home.spaces![0].id } },
  "Removed Zone destinations are cleared without changing other assignments",
);
assert.deepEqual(removed.spaces![0].connectedTo, ["exterior"], "Incoming connections are removed automatically");
assert.deepEqual(
  removeFoundingZone(
    { ...home, destinations: { player: { sleep: home.privateSpaces![0].id } } },
    home.privateSpaces![0].id,
  ).destinations,
  { player: {} },
  "All references can be cleared for an actor",
);
assert.doesNotThrow(() => parsePlace(removed, true), "Removing a moved Zone prunes positions and incoming links");
const legacy = newSetupVenue("legacy", "residence", 0.2, 0.3, true);
const removedHub = removeFoundingZone(legacy, legacy.spaces![0].id);
assert.deepEqual(removedHub.privateSpaces![0].connectedTo, [], "Deleting a legacy hub does not invent a new passage");
assert.equal(foundingLayoutProblem(removedHub), "Cannot save Venue layout: Unreachable Zones.");
assert.equal(removeFoundingZone(home, "exterior"), home, "Entrance cannot be removed");
const omitted = includeFoundingZone(home, {}, true, false);
assert.doesNotThrow(
  () => parsePlace(omitted.venue, true),
  "Omitting a moved collection prunes its active positions and links",
);
const restored = includeFoundingZone(omitted.venue, omitted.inactive, true, true);
assert.doesNotThrow(() => parsePlace(restored.venue, true));
assert.deepEqual(
  restored.venue.zoneLayout![home.privateSpaces![0].id],
  home.zoneLayout![home.privateSpaces![0].id],
  "Re-inclusion retains its prior drawing position",
);
const resumed = resumeFoundingVenue({ ...home, category: "public-center" }, {}).venue;
assert.equal(resumed.zoneLayout![home.privateSpaces![0].id], undefined);
assert.ok(!resumed.spaces![0].connectedTo!.includes(home.privateSpaces![0].id));
assert.doesNotThrow(() => parsePlace(resumed, true), "Resumed Community layouts prune private coordinates and links");
assert.throws(
  () => parsePlace({ ...home, zoneLayout: { ...home.zoneLayout, [homeIds[1]]: home.zoneLayout!.exterior } }, true),
  /without overlapping/,
);
assert.deepEqual(
  zoneSoundRange(snapshot, venue, "exterior"),
  ["exterior", "zone:1", "zone:2"],
  "Loud sound follows at most two captured connections",
);
console.log("Zone layout persistence, collisions, authority, concurrency and captured routing passed.");
