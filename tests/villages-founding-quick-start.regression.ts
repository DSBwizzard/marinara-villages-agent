import assert from "node:assert/strict";
import {
  newFoundingPlanSources,
  physicalFoundingProposal,
} from "../packages/villages/src/client/features/founding/quick-start-drafts.js";
import { arrangeQuickStartVenues } from "../packages/villages/src/client/features/founding/quick-start-placement.js";
import { extractFoundingVenueReply } from "../packages/villages/src/server/domain/rules/founding-venue-reply.js";
const slots = newFoundingPlanSources();
assert.equal(slots.length, 4);
assert.equal(new Set(slots.map((row) => row.id)).size, 4);
assert.ok(
  slots.every(
    (row) =>
      !row.occupancy.playerHome &&
      !row.residentIds.length &&
      !row.workerIds.length &&
      !Object.keys(row.destinations).length,
  ),
);
assert.notDeepEqual(
  newFoundingPlanSources().map((row) => row.id),
  slots.map((row) => row.id),
);
const legacy: any = {
  id: "legacy",
  name: "Cafe",
  form: "A cafe",
  description: "A brick front",
  layout: "both",
  commonName: "Cafe floor",
  commonDescription: "Tables",
  privateName: "Bedroom",
  privatePurpose: "Rest",
};
const physical = physicalFoundingProposal(legacy);
assert.equal(physical.zones.length, 2);
assert.ok(physical.zones.every((zone) => !zone.ownerId));
for (const count of [3, 4, 6]) {
  const venues = Array.from({ length: count }, (_, index) => ({ ...slots[index % 4], id: String(index) }));
  const arranged = arrangeQuickStartVenues(venues);
  assert.equal(new Set(arranged.map((row) => row.presentation.x + ":" + row.presentation.y)).size, count);
  assert.deepEqual(arrangeQuickStartVenues(arranged), arranged);
}
const reply = { venues: [legacy] };
for (const text of [
  JSON.stringify(reply),
  "\x60\x60\x60json\n" + JSON.stringify(reply) + "\n\x60\x60\x60",
  "Here is the plan: " + JSON.stringify(reply),
])
  assert.deepEqual(extractFoundingVenueReply(text), reply);
assert.equal(extractFoundingVenueReply('{"venues":['), null);

const oldAuthority = physicalFoundingProposal({
  ...legacy,
  zones: [
    {
      id: "old-room",
      name: "Room",
      purpose: "Rest",
      description: "A room",
      private: true,
      ownerId: "ada",
      connectedTo: ["exterior"],
      access: {
        mode: "permission-required",
        managerIds: ["ada"],
        memberIds: ["bryn"],
        memberRoles: ["workers"],
        inviterIds: ["ada"],
        visitorHours: "always",
        accompanied: false,
      },
    },
  ],
});
assert.equal(oldAuthority.zones[0].ownerId, "");
assert.deepEqual(oldAuthority.zones[0].access.memberIds, []);
assert.deepEqual(oldAuthority.zones[0].access.memberRoles, []);
assert.equal(oldAuthority.zones[0].access.managerIds, null);
assert.deepEqual(oldAuthority.zones[0].access.inviterIds, []);
