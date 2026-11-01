import assert from "node:assert/strict";
import { normalizeVillageSnapshot } from "../packages/villages/src/client/shared/villages-snapshot-normalization";
import { playerDisplayName } from "../packages/villages/src/client/shared/presentation.js";
import type { VillageSnapshot } from "../packages/villages/src/shared/contracts/village.js";

assert.equal(playerDisplayName(undefined), "You");
for (const playerPersonaName of [undefined, null, 1, "", "   ", " Robin "]) {
  assert.equal(
    playerDisplayName({ settings: { playerPersonaName } } as unknown as VillageSnapshot),
    playerPersonaName === " Robin " ? "Robin" : "You",
  );
}

const validVenue = {
  id: "library",
  name: "Library",
  category: "destination",
  presentation: { image: null, x: 0.4, y: 0.6 },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  capabilities: ["reading"],
  state: { revision: 0, updatedAt: "", recent: null },
};
const malformedVenue = { id: "legacy-library", name: "Legacy Library" };
const normalizedSnapshot = normalizeVillageSnapshot({
  settings: { venues: [validVenue, malformedVenue] },
});
assert.deepEqual(
  normalizedSnapshot.settings.venues,
  [validVenue],
  "A truthy legacy venue without presentation and occupancy must be excluded before render helpers can dereference it, while valid venues remain unchanged.",
);

console.log("villages-client-scope: snapshot guards passed");
