import { venueFixture } from "./helpers/venues.fixture.js";
import assert from "node:assert/strict";
import { foundingVenueIssues } from "../packages/villages/src/client/features/founding/villages-founding-workspace-state";
import type { VillageVenue } from "../packages/villages/src/shared/contracts/village.js";

const venue = venueFixture({
  residentIds: [null].filter((id) => typeof id === "string" && !!id),
  id: "home",
  name: "Home",
  form: "Cottage",
  description: "Stone doorway",
  classes: ["residence"],
  layoutVersion: 1,
  layout: "both",
  occupancy: { playerHome: true, residentCharacterId: null },
  presentation: { x: 0.2, y: 0.3, image: null },
  spaces: [
    {
      id: "living",
      name: "Living room",
      purpose: "Sharing meals",
      description: "A table by the window",
      access: { mode: "permission-required" },
      image: null,
    },
  ],
  privateSpaces: [
    {
      id: "bedroom",
      name: "Bedroom",
      purpose: "Sleeping",
      description: "A reviewed sleeping room",
      ownerId: "player",
      venueClass: "residence",
      image: null,
    },
  ],
}) as unknown as VillageVenue;
assert.deepEqual(foundingVenueIssues([venue]), [], "artwork is optional while starting appearances are reviewed");
const incomplete = structuredClone(venue);
incomplete.presentation.x = null;
incomplete.name = "";
incomplete.form = "";
incomplete.description = "";
incomplete.layout = undefined;
incomplete.spaces![0].purpose = "";
incomplete.spaces![0].description = "";
const issues = foundingVenueIssues([incomplete]);
assert.deepEqual(
  issues.map(({ field }) => field),
  ["placement", "name", "form", "description", "layout", "zone-purpose", "zone-appearance"],
);
assert.equal(issues.find(({ field }) => field === "description")?.zoneId, "exterior");
assert.equal(issues.find(({ field }) => field === "zone-purpose")?.zoneId, "living");
assert.ok(issues.every(({ venueId }) => venueId === "home"));
assert.equal(
  foundingVenueIssues([incomplete], true).some(({ field }) => field === "placement" || field === "layout"),
  false,
);
const sharedResident = {
  ...venue,
  residentIds: ["jim"],
  occupancy: { ...venue.occupancy, playerHome: false, residentCharacterId: null },
};
assert.equal(
  foundingVenueIssues([sharedResident, { ...sharedResident, id: "duplicate" }]).filter(
    ({ field }) => field === "assignment",
  ).length,
  2,
);
console.log(
  "Founding checklist: all missing fields, exact Zone IDs, optional artwork/private appearance and duplicate assignments passed.",
);
