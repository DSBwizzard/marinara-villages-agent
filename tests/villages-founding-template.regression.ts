import assert from "node:assert/strict";
import { newSetupVenue } from "../packages/villages/src/client/features/founding/FoundingPanels.js";
import {
  includeFoundingZone,
  resumeFoundingVenue,
} from "../packages/villages/src/client/features/founding/founding-template.js";
import { foundingVenueIssues } from "../packages/villages/src/client/features/founding/villages-founding-workspace-state.js";
import { parsePlace } from "../packages/villages/src/server/domain/rules/founding-record.js";
import { parseFoundingVenueSuggestions } from "../packages/villages/src/server/domain/rules/founding-draft-rules.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { villageSettings } from "../packages/villages/src/server/domain/rules/world-snapshot.js";

const residence = newSetupVenue("home", "residence", 0.2, 0.3, true);
residence.form = "Cottage";
residence.description = "Stone doorway";
residence.spaces![0] = { ...residence.spaces![0], name: "Living room", purpose: "Meals", description: "A low table" };
residence.privateSpaces![0] = {
  ...residence.privateSpaces![0],
  name: "Bedroom",
  purpose: "Rest",
  description: "A hammock",
};
assert.equal(residence.layout, "both");
assert.deepEqual(foundingVenueIssues([residence]), []);
const artwork = { id: "photo", ref: "global-gallery:photo", url: "/photo.webp" };
residence.privateSpaces![0].image = artwork;
residence.privateSpaces!.push({ ...residence.privateSpaces![0], id: "private:second", name: "Study" });
const disabled = includeFoundingZone(residence, {}, true, false);
assert.equal(disabled.venue.layout, "common");
assert.deepEqual(disabled.inactive.private, residence.privateSpaces);
const refused = includeFoundingZone(disabled.venue, disabled.inactive, false, false);
assert.match(refused.problem, /At least one/);
assert.equal(refused.venue, disabled.venue);
const restored = includeFoundingZone(disabled.venue, structuredClone(disabled.inactive), true, true);
assert.deepEqual(
  restored.venue.privateSpaces,
  residence.privateSpaces,
  "all names, IDs, values and artwork survive disable/save/re-enable",
);
for (const layout of ["common", "private", "both"] as const) {
  const source = {
    ...residence,
    layout,
    spaces: layout === "private" ? [] : residence.spaces,
    privateSpaces: layout === "common" ? [] : residence.privateSpaces,
  };
  const parsed = parsePlace(source, true);
  assert.equal(
    parsed.zones?.find((zone) => zone.id === "common:base")?.purpose,
    layout === "private" ? undefined : "Meals",
  );
}
assert.throws(
  () => parsePlace({ ...residence, layout: "exterior", spaces: [], privateSpaces: [] }, true),
  /at least one/,
);
assert.doesNotThrow(
  () => parsePlace({ ...residence, layout: "exterior", spaces: [], privateSpaces: [] }, false),
  "existing map editing remains compatible",
);
assert.throws(
  () => parsePlace({ ...residence, spaces: [{ ...residence.spaces![0], purpose: "" }] }, true),
  /name and purpose/,
);
assert.throws(
  () => parsePlace({ ...residence, privateSpaces: [{ ...residence.privateSpaces![0], description: "" }] }, true),
  /visible Zone/,
);
const community = newSetupVenue("park", "community", 0.7, 0.6);
community.form = "Park";
community.description = "Approach path";
community.spaces![0] = {
  ...community.spaces![0],
  name: "Park grounds",
  purpose: "Conversation",
  description: "Trees and benches",
};
const parsedPark = parsePlace(community, true);
assert.deepEqual(parsedPark.access?.managerIds, []);
assert.equal(parsedPark.zones?.find((zone) => zone.id === "common:base")?.access?.mode, "public");
for (const changed of [
  { ...community, classes: ["workplace"] },
  { ...community, layout: "both", privateSpaces: residence.privateSpaces },
  { ...community, spaces: [{ ...community.spaces![0], controllerIds: ["player"] }] },
  {
    ...community,
    spaces: [{ ...community.spaces![0], access: { ...community.spaces![0].access!, mode: "permission-required" } }],
  },
])
  assert.throws(() => parsePlace(changed, true));
const old = { ...community, layout: "both" as const, spaces: [], privateSpaces: residence.privateSpaces };
const resumed = resumeFoundingVenue(old, {});
assert.deepEqual(resumed.inactive.private, residence.privateSpaces);
assert.equal(resumed.venue.privateSpaces?.length, 0);
assert.equal(resumed.venue.spaces?.length, 1);
assert.ok(
  foundingVenueIssues([resumed.venue]).some((issue) => issue.field === "zone-purpose"),
  "new mandatory details need completion",
);
const suggestion = {
  id: "home",
  name: "Home",
  form: "Cottage",
  description: "Door",
  layout: "both",
  commonName: "Room",
  commonPurpose: "Meals",
  commonDescription: "Table",
  privateName: "Bedroom",
  privatePurpose: "Rest",
  privateDescription: "Hammock",
};
const template = [{ id: "home", venueClass: "residence", residentCharacterId: "" }];
assert.equal(
  parseFoundingVenueSuggestions({ venues: [suggestion] }, ["home"], template)[0].privateDescription,
  "Hammock",
);
assert.throws(() =>
  parseFoundingVenueSuggestions({ venues: [{ ...suggestion, layout: "exterior" }] }, ["home"], template),
);
assert.throws(() =>
  parseFoundingVenueSuggestions({ venues: [{ ...suggestion, commonPurpose: "" }] }, ["home"], template),
);
assert.throws(() =>
  parseFoundingVenueSuggestions(
    { venues: [{ ...suggestion, layout: "both" }] },
    ["home"],
    [{ id: "home", venueClass: "community" }],
  ),
);
assert.equal(
  parseFoundingVenueSuggestions({ venues: [suggestion] }, ["home"], [{ ...template[0], residentCharacterId: "npc" }])[0]
    .privateDescription,
  undefined,
);
const npc = parsePlace({ ...residence, occupancy: { playerHome: false, residentCharacterId: "npc" } }, true);
const world = defaultVillageState();
world.venues = [npc as (typeof world.venues)[number]];
const settings = villageSettings(
  world,
  { name: "Player", missing: false } as Parameters<typeof villageSettings>[1],
  null,
);
assert.ok(
  settings.venues[0].privateSpaces?.every((zone) => !zone.description && !zone.image && !zone.state.items.length),
  "unseen private interiors never reach the client",
);
console.log(
  "Founding template: inclusion retention, legacy recovery, neutral access, contract validation, purpose round-trip and server privacy passed.",
);
