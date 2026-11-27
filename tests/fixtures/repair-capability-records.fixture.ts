import { defaultVillageFixture, sharedVenuesFixture } from "../helpers/venues.fixture.js";
import { worldRepairRecords } from "../../packages/villages/src/server/domain/rules/repair-records.js";
import { addRepairMemory } from "../../packages/villages/src/server/domain/rules/repair-memory.js";
import { snapshotScheduleRecord } from "../../packages/villages/src/server/domain/rules/snapshot-schedule.js";
import { draftRenovationProject } from "../../packages/villages/src/server/features/projects/project-drafts.js";
import { emptyContinuity } from "../../packages/villages/src/server/domain/rules/continuity.js";

const state = defaultVillageFixture(),
  at = "2026-11-24T12:00:00.000Z";
Object.assign(state, {
  seed: "browser-capabilities",
  setupAt: at,
  foundedAt: at,
  timeZone: "America/Los_Angeles",
  playerPersonaId: "persona",
  playerPersonaName: "You",
  playerPersonaIdentity: "A visitor",
  continuity: emptyContinuity(),
});
state.venues = sharedVenuesFixture();
state.villagers = [
  {
    characterId: "nora",
    incarnation: "one",
    letterFontId: "caveat",
    addedAt: at,
    admission: { homeworld: "A distant town", startingSituation: "A bookbinder" },
    cardSnapshot: {
      id: "nora",
      name: "Nora",
      capturedAt: at,
      revision: 1,
      sourceStatus: "available",
      tags: [],
      personality: "Thoughtful",
      summary: "A bookbinder",
    },
    agenda: null,
  },
];
state.visitors = [
  {
    ...state.villagers[0]!,
    characterId: "guest",
    cardSnapshot: { ...state.villagers[0]!.cardSnapshot, id: "guest", name: "Ellis" },
    visitsEnabled: true,
    visitsRevision: "one",
    trip: { arrivedAt: at, leavesAt: "2026-11-25T12:00:00.000Z" },
    visitPreference: {
      kind: "invite",
      sentAt: at,
      sourceId: "letter",
      latestSourceId: "letter",
      from: at,
      until: "2026-12-01T12:00:00.000Z",
    },
  },
];
const memory = addRepairMemory(
  state,
  "browser-memory",
  "nora",
  "Ellis lent me the workshop key until Friday.",
  at,
  undefined,
  { class: "information", subjects: ["guest"], current: true },
);
const venue = state.venues[0]!;
draftRenovationProject(
  state,
  venue.id,
  { title: "Repair the workshop", form: "A timber workshop", detail: "Repair the exterior" },
  "browser-project",
);
const all = worldRepairRecords(state, true, "nora", at);
const kinds = [
  "home",
  "visitor",
  "project",
  "access-extra",
  "new-grant",
  "hours-period",
  "new-zone",
  "zone-details",
  "zone-connections",
  "zone-artwork",
  "location-artwork",
  "new-situation",
  "new-condition",
  "narrative-weather",
  "person",
];
export const records = [
  ...kinds.flatMap((kind) => {
    const record = all.find((r) => JSON.parse(r.id)[0] === kind);
    return record ? [record] : [];
  }),
  all.find((r) => r.id === JSON.stringify(["memory", memory]))!,
  snapshotScheduleRecord({
    seed: state.seed,
    setupAt: at,
    generation: "one",
    enabledAt: at,
    frequency: "weekly",
    time: "20:00",
    timeZone: state.timeZone,
    weekday: "3",
    retain: "14",
  }),
]
  .filter(Boolean)
  .map((record) => ({ ...record, token: "capability:" + record.id }));
