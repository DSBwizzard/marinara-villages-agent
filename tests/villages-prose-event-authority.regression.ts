import assert from "node:assert/strict";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import { storyBackgroundHandler } from "../packages/villages/src/server/features/world/village.js";

const state = defaultVillageState();
state.seed = "visual-feed";
state.storyPace = "off";
const stamp = "2026-10-06T12:00:00.000Z";
state.venues = [
  venueDraft(
    { id: "square", name: "Square", form: "Square", description: "An open square.", category: "public" },
    null,
  ),
];
state.villagers = [
  {
    characterId: "resident",
    cardSnapshot: snapshotFromCard(readVillagerCard({ id: "resident", comment: "", data: { name: "Resident" } }), 1),
    addedAt: stamp,
    remap: null,
    remapFailure: null,
    completedWishes: [],
    agenda: {
      day: [],
      routineSummary: "A quiet day.",
      source: "village",
      generatedAt: stamp,
      wishes: [
        {
          id: "wish",
          wish: "Meet a neighbour",
          tell: "",
          intensity: 1,
          size: "everyday",
          addedAt: stamp,
          learnedAt: stamp,
          expiresAt: "2026-10-10T12:00:00.000Z",
        },
      ],
    },
  },
];
const authority = () =>
  structuredClone({
    chronicle: state.chronicle,
    notices: state.noticeboard,
    requests: state.pendingDecisions,
    features: state.venues.map((venue) => venue.state.features),
    wishes: state.villagers.map((resident) => resident.agenda?.wishes),
  });
const original = authority();
const input = {
  forced: true,
  dateKey: "2026-10-06",
  now: stamp,
  opportunity: { id: "opportunity", actorIds: ["resident"], venueId: "square" },
  moment: { instant: stamp, minuteOfDay: 720 },
  context: {},
};
const happening = { id: "event", text: "A neighbour waved in the square.", occurredAt: stamp };
// Deliberately hostile model fields must never become authoritative commands,
// even when a caller passes an unfiltered response to the application handler.
const proposal = {
  happenings: [happening],
  housingRequests: [],
  memory: [{ id: "invented-memory", text: "Invented shared memory" }],
  notices: [{ id: "invented-notice", text: "Invented notice" }],
  venueRequests: [{ characterId: "resident", core: { name: "Invented Venue" } }],
  featureEdits: [{ characterId: "resident", venueId: "square", text: "Invented feature" }],
  lapsed: [{ characterId: "resident", wishId: "wish" }],
};
storyBackgroundHandler.apply(state, input, proposal, { retrying: false });
assert.deepEqual(state.happenings, [happening]);
assert.deepEqual(authority(), original);
assert.equal(state.lastCreativeDate, input.dateKey);
assert.deepEqual(state.processedOpportunityIds, [input.opportunity.id]);
storyBackgroundHandler.apply(state, input, proposal, { retrying: false });
assert.deepEqual(state.happenings, [happening], "already applied opportunities do not repeat");
assert.deepEqual(authority(), original);
console.log("Prose Events retain visual-only authority and opportunity deduplication.");
