import assert from "node:assert/strict";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageVenue, VillageVillager } from "../packages/villages/src/server/domain/models/world.js";
import { agendaDateKey } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  contactNeighbors,
  contactPath,
  readContactDelivery,
  readContactIntent,
} from "../packages/villages/src/server/domain/rules/venue-contact.js";
const now = new Date(),
  stamp = now.toISOString(),
  dateKey = agendaDateKey(now),
  weekday = now.toLocaleDateString("en-US", { weekday: "long" });
function venue(id: string, classes: VillageVenue["classes"] = ["community"]): VillageVenue {
  return {
    id,
    name: id,
    classes,
    spaces: classes!.map((role) => defaultVenueSpace(role, "The " + role + " interior.")),
    description: "The outside of " + id,
    category: "",
    presentation: { image: null, x: 0.2, y: 0.3 },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    residentIds: [],
    workerIds: [],
    improvements: [null, null],
    residenceCapacity: 1,
    capabilities: [],
    state: {
      revision: 0,
      recent: null,
      updatedAt: stamp,
    },
  };
}
function villager(id: string, venueId: string, zoneId: string, activity = "Visiting"): VillageVillager {
  const block = {
    startMinute: 0,
    endMinute: 1440,
    venueId,
    zoneId,
    activity,
    reason: "Routine",
    status: "online" as const,
  };
  return {
    characterId: id,
    cardSnapshot: {
      id,
      name: id,
      revision: 1,
      sourceStatus: "available",
      capturedAt: stamp,
      comment: "",
      summary: "",
      tags: [],
      description: "",
      personality: "",
      systemPrompt: "",
      scenario: "",
      backstory: "",
      appearance: "",
      exampleDialogue: "",
    },
    addedAt: stamp,
    wishes: [],
    remap: null,
    ingestSchedule: false,
    agenda: {
      routineSummary: "",
      day: [block],
      week: { [weekday]: [block] },
      activeDay: { dateKey, weekday, blocks: [block], scheduleInformed: false },
      source: "village",
      generatedAt: stamp,
    },
  } as VillageVillager;
}

const state = defaultVillageState();
state.seed = "social-fixture";
state.foundedAt = state.setupAt = stamp;
state.visitMemoryBackfilled = true;
const house = venue("house", ["residence", "workplace"]);
house.residentIds = ["messenger", "alex"];
house.workerIds = ["alex"];
house.layoutVersion = 1;
house.zones = [
  { ...defaultVenueSpace("other"), id: "exterior", name: "Exterior", kind: "exterior", seen: true },
  { ...defaultVenueSpace("residence"), id: "common", name: "Common Space", kind: "shared-residence" },
  { ...defaultVenueSpace("workplace"), id: "public", name: "Workshop", kind: "public" },
  { ...defaultVenueSpace("workplace", "SECRET OFFICE DETAILS"), id: "office", name: "Office", kind: "staff" },
  {
    ...defaultVenueSpace("residence", "SECRET BEDROOM"),
    id: "private:alex",
    name: "Bedroom",
    kind: "private-residence",
    ownerId: "alex",
  },
];
state.venues = [house];
state.villagers = [villager("messenger", "house", "common"), villager("alex", "house", "office")];
const saved = coerceVillageState(state);

assert.deepEqual(contactNeighbors(house, "exterior").sort(), ["common", "public"]);
assert.deepEqual(contactPath(saved, house, "common", "public", "messenger"), ["common", "exterior", "public"]);
assert.equal(contactPath(saved, house, "common", "office", "messenger"), null, "staff permission is enforced");
assert.equal(contactPath(saved, house, "common", "private:alex", "messenger"), null, "private ownership is enforced");
const hypothetical = "If I knock on the door, would Alex hear?";
assert.equal(readContactIntent({ kind: "knock", quote: hypothetical }, hypothetical), null);
assert.equal(readContactIntent({ kind: "call", quote: "invented quote" }, "I call Alex."), null);
assert.throws(() => readContactDelivery({ delivery: "device" }, "I use an intercom."), /not supported/);

console.log("Contact geometry, private ownership and unsupported delivery passed without generation.");
