import { venueFixture } from "./helpers/venues.fixture.js";
import assert from "node:assert/strict";
import { normalizeVillageSnapshot } from "../packages/villages/src/client/shared/villages-snapshot-normalization.ts";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageVenue, VillageVillager } from "../packages/villages/src/server/domain/models/world.js";
import { routineVenues } from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import { continuityViews } from "../packages/villages/src/server/domain/rules/continuity.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { assertCanAddVillageVenue } from "../packages/villages/src/server/domain/rules/venue-capacity.js";
import {
  readVenueRequestCore,
  venueRequestDraft,
} from "../packages/villages/src/server/domain/rules/venue-requests.js";
import { draftNewVenueProject } from "../packages/villages/src/server/features/projects/project-lifecycle.js";
import { createVenueRequests } from "../packages/villages/src/server/features/venues/venue-request-service.js";
import { queueVillageVenueRequest } from "../packages/villages/src/server/features/venues/venue-requests.js";

const { applyVillageVenueDecision } = createVenueRequests({
  async mutateVillageState() {
    throw Error("Unexpected persistence in a pure request decision probe.");
  },
  async buildVillageSnapshot() {
    throw Error("Unexpected projection in a pure request decision probe.");
  },
  draftNewVenueProject,
});
const at = "2026-09-22T12:00:00.000Z";
const core = { name: "The Glasshouse", classes: ["community"] as ["community"] };
const venue = (name: string): VillageVenue => {
  const draft = venueRequestDraft({ ...core, name });
  return venueFixture({
    residentIds: [null].filter((id) => typeof id === "string" && !!id),
    id: `draft-${name}`,
    name: draft.name,
    classes: draft.classes,
    description: "A glasshouse where neighbours grow herbs together.",
    category: draft.category,
    presentation: { image: null, x: null, y: null },
    occupancy: draft.occupancy,
    capabilities: draft.capabilities,
    state: draft.state,
  });
};
const requester: VillageVillager = {
  letterFontId: "caveat",
  characterId: "rosa",
  incarnation: "rosa-first",
  admission: { homeworld: "", startingSituation: "" },
  cardSnapshot: snapshotFromCard(readVillagerCard({ id: "rosa", comment: "", data: { name: "Rosa" } }), 1),
  agenda: null,
  addedAt: at,
};
const state = { ...defaultVillageState(), seed: "requests", setupAt: at, foundedAt: at, villagers: [requester] };

assert.deepEqual(readVenueRequestCore({ name: "", classes: ["community"] }), null);
assert.deepEqual(readVenueRequestCore({ name: "Glasshouse", classes: ["unknown"] }), null);
assert.deepEqual(readVenueRequestCore(core), core);
assert.deepEqual(normalizeVillageSnapshot({ settings: { venues: [] }, venueRequests: undefined }).venueRequests, []);
assert.deepEqual(
  normalizeVillageSnapshot({ settings: { venues: [] }, venueRequests: [{ id: "bad", venueDraft: null }] })
    .venueRequests,
  [],
);
const classOnlyRequest = { id: "glasshouse-request", venueDraft: { ...core, category: "destination" } };
assert.deepEqual(
  normalizeVillageSnapshot({ settings: { venues: [] }, venueRequests: [classOnlyRequest] }).venueRequests,
  [classOnlyRequest],
  "a request without a Purpose remains visible in the client snapshot",
);
queueVillageVenueRequest(state, core, "rosa", "background", "opportunity-1", at);
assert.equal(state.pendingDecisions.length, 1);
assert.equal(state.venues.length, 0, "a pending request must not create a map place");
assert.equal(routineVenues(state.venues).length, 0, "a pending request must not enter location prompts");
queueVillageVenueRequest(state, core, "rosa", "background", "opportunity-1", at);
queueVillageVenueRequest(state, core, "rosa", "chat", "chat-1", at);
assert.equal(state.pendingDecisions.length, 1, "retries and cross-source duplicates produce one review item");
queueVillageVenueRequest(state, { ...core, name: "The Mill" }, "rosa", "chat", "chat-2", at);

const persisted = coerceVillageState(state);
assert.equal(persisted.pendingDecisions[0]?.venueDraft?.name, core.name);
assert.equal(persisted.pendingDecisions[0]?.source, "background");
assert.equal(persisted.pendingDecisions[0]?.requesterCharacterId, "rosa");
const id = persisted.pendingDecisions[0]!.id;

applyVillageVenueDecision(persisted, id, true, core, "A shared glasshouse for herbs.", new Date(at));
assert.equal(persisted.pendingDecisions[0]?.status, "approved");
assert.equal(persisted.venues.length, 0, "approval begins planning without creating a venue");
assert.equal(persisted.projects[0]?.kind, "new-venue");
assert.equal(persisted.projects[0]?.status, "planning");
assert.equal(persisted.projects[0]?.lifecycle?.phase, "planning");
assert.deepEqual(persisted.projects[0]?.venueDraft?.classes, ["community"]);
assert.equal(persisted.projects[0]?.venueDraft?.description, "A shared glasshouse for herbs.");
function decisionFacts(actorId: string) {
  return continuityViews(persisted.continuity, continuityActor(persisted, actorId)!, at, new Set()).map(
    ({ version }) => version.text,
  );
}
assert.match(decisionFacts("player").join("\n"), /accepted Rosa's request to plan/u);
assert.match(decisionFacts("rosa").join("\n"), /Construction has not begun/u);
assert.throws(() => applyVillageVenueDecision(persisted, id, true, core, "A shared glasshouse.", new Date(at)));
assert.equal(coerceVillageState(persisted).projects[0]?.venueDraft?.name, core.name, "the project survives reload");

const denied = persisted.pendingDecisions.find((decision) => decision.venueDraft?.name === "The Mill")!;
applyVillageVenueDecision(persisted, denied.id, false, null, "", new Date(at));
assert.equal(denied.status, "denied");
assert.equal(persisted.venues.length, 0, "denial must leave the map unchanged");
assert.match(decisionFacts("player").join("\n"), /declined Rosa's request for The Mill/u);

const competing = { ...defaultVillageState(), seed: "competing", setupAt: at, foundedAt: at, villagers: [requester] };
queueVillageVenueRequest(competing, core, "rosa", "chat", "chat-competing", at);
competing.venues.push(venue(core.name));
assert.equal(competing.venues.length, 1, "An independently completed Project adds an ordinary map Venue");
applyVillageVenueDecision(
  competing,
  competing.pendingDecisions[0]!.id,
  true,
  core,
  "A shared glasshouse.",
  new Date(at),
);
assert.equal(competing.pendingDecisions[0]?.status, "approved", "acceptance creates a non-reserving draft");
assert.equal(competing.projects[0]?.status, "planning", "Start rechecks the live name and location");

const full = defaultVillageState();
full.venues = Array.from({ length: 16 }, (_, index) => venue(`Place ${index}`));
assert.throws(() => assertCanAddVillageVenue(full, ["community"]), /maximum 16/u);

const drafts = defaultVillageState();
drafts.setupAt = drafts.foundedAt = at;
for (let index = 0; index < 6; index++)
  draftNewVenueProject(
    drafts,
    { ...core, name: `Draft ${index}`, description: "A place to gather." },
    "",
    `draft:${index}`,
  );
assert.equal(
  draftNewVenueProject(drafts, { ...core, description: "Ignored on replay" }, "", "draft:0").id,
  "draft:0",
  "idempotent replay remains valid at capacity",
);
assert.throws(
  () => draftNewVenueProject(drafts, { ...core, description: "Another place." }),
  /Six Project drafts maximum/u,
);
drafts.projects[0]!.status = "working";
draftNewVenueProject(drafts, { ...core, description: "A newly available draft." });
assert.equal(drafts.projects.filter((project) => project.status === "planning").length, 6);

console.log("Villages venue request regression: draft, dedup, persistence, review decisions and limits ok");
