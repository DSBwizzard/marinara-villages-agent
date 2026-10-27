import assert from "node:assert/strict";
import { normalizeVillageSnapshot } from "../packages/villages/src/client/shared/villages-snapshot-normalization.ts";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageVenue, VillageVillager } from "../packages/villages/src/server/domain/models/world.js";
import { remapVenues } from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import {
  readResidentPlanningProposal,
  type ResidentPlanningContext,
} from "../packages/villages/src/server/domain/rules/resident-planning.js";
import { addVillageVenue } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import {
  readConversationVenueRequest,
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
  return {
    id: `draft-${name}`,
    name: draft.name,
    classes: draft.classes,
    description: "A glasshouse where neighbours grow herbs together.",
    category: draft.category,
    presentation: { image: null, x: null, y: null },
    occupancy: draft.occupancy,
    capabilities: draft.capabilities,
    state: draft.state,
  };
};
const state = defaultVillageState();
state.setupAt = state.foundedAt = at;
state.foundedAt = at;
state.villagers.push({
  characterId: "rosa",
  cardSnapshot: { id: "rosa", revision: 1, sourceStatus: "available", name: "Rosa", capturedAt: at },
  agenda: null,
  addedAt: at,
  wishes: [],
} as VillageVillager);

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
const quoted = { ...core, quote: "Could we have a glasshouse for herbs?" };
assert.deepEqual(
  readConversationVenueRequest(quoted, [
    { role: "user", content: "What do you need?", at },
    { role: "assistant", content: quoted.quote, at },
  ]),
  core,
);
assert.equal(
  readConversationVenueRequest(quoted, [
    { role: "assistant", content: quoted.quote, at, speakerId: "someone-else", speakerName: "Ives" },
  ]),
  null,
  "a room participant cannot file another villager's request as their own",
);
const readHousingRequests = (value: unknown, context: ResidentPlanningContext) =>
  readResidentPlanningProposal({ social: null, routineIdea: null, housingRequests: value }, context).housingRequests;
const housingContext = {
  residents: [{ characterId: "rosa", name: "Rosa" }],
  venues: [
    {
      ...venue("Rosa's home"),
      id: "rosa-home",
      occupancy: { playerHome: false, residentCharacterId: "rosa", homeKind: "small-home" },
    },
    { ...venue("Open venue"), id: "open", classes: ["residence"] },
    {
      ...venue("Occupied venue"),
      id: "occupied",
      classes: ["residence"],
      residentIds: ["someone-else"],
      occupancy: { playerHome: false, residentCharacterId: "someone-else", homeKind: "small-home" },
    },
  ],
  opportunity: { actorIds: ["rosa"] },
  pendingHousingCharacterIds: [],
} as unknown as ResidentPlanningContext;
assert.deepEqual(readHousingRequests([{ who: "rosa", kind: "move", venueId: "open" }], housingContext), [
  { characterId: "rosa", kind: "move", venueId: "open" },
]);
assert.deepEqual(readHousingRequests([{ who: "rosa", kind: "move", venueId: "occupied" }], housingContext), []);

const modernOccupied = {
  ...housingContext,
  venues: housingContext.venues.map((v) => (v.id === "open" ? { ...v, residentIds: ["someone-else"] } : v)),
};
assert.deepEqual(readHousingRequests([{ who: "rosa", kind: "move", venueId: "open" }], modernOccupied), []);
const unfinished = {
  ...housingContext,
  venues: housingContext.venues.map((v) => (v.id === "open" ? { ...v, constructionStatus: "worksite" as const } : v)),
};
assert.deepEqual(readHousingRequests([{ who: "rosa", kind: "move", venueId: "open" }], unfinished), []);
const nonResidence = {
  ...housingContext,
  venues: housingContext.venues.map((v) => (v.id === "open" ? { ...v, classes: ["community" as const] } : v)),
};
assert.deepEqual(readHousingRequests([{ who: "rosa", kind: "move", venueId: "open" }], nonResidence), []);

assert.deepEqual(readHousingRequests([{ who: "stranger", kind: "move", venueId: "open" }], housingContext), []);
assert.deepEqual(
  readHousingRequests([{ who: "rosa", kind: "upgrade", venueId: "rosa-home" }], housingContext),
  [],
  "home improvements go through the separate resident proposal flow",
);
assert.deepEqual(readHousingRequests([{ who: "rosa", kind: "upgrade", venueId: "open" }], housingContext), []);
assert.deepEqual(
  readHousingRequests([{ who: "rosa", kind: "move", venueId: "open" }], {
    ...housingContext,
    pendingHousingCharacterIds: ["rosa"],
  }),
  [],
);

queueVillageVenueRequest(state, core, "rosa", "background", "opportunity-1", at);
assert.equal(state.pendingDecisions.length, 1);
assert.equal(state.venues.length, 0, "a pending request must not create a map place");
assert.equal(remapVenues(state.venues).length, 0, "a pending request must not enter location prompts");
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
assert.match(persisted.memories.records[0]?.text ?? "", /accepted Rosa's request to plan/u);
assert.throws(() => applyVillageVenueDecision(persisted, id, true, core, "A shared glasshouse.", new Date(at)));
assert.equal(coerceVillageState(persisted).projects[0]?.venueDraft?.name, core.name, "the project survives reload");

const denied = persisted.pendingDecisions.find((decision) => decision.venueDraft?.name === "The Mill")!;
applyVillageVenueDecision(persisted, denied.id, false, null, "", new Date(at));
assert.equal(denied.status, "denied");
assert.equal(persisted.venues.length, 0, "denial must leave the map unchanged");
assert.match(persisted.memories.records.at(-1)?.text ?? "", /declined Rosa's request/u);

const competing = defaultVillageState();
competing.setupAt = competing.foundedAt = at;
competing.villagers.push({
  characterId: "rosa",
  cardSnapshot: { id: "rosa", revision: 1, sourceStatus: "available", name: "Rosa", capturedAt: at },
  agenda: null,
  addedAt: at,
  wishes: [],
} as VillageVillager);
queueVillageVenueRequest(competing, core, "rosa", "chat", "chat-competing", at);
addVillageVenue(competing, venue(core.name));
assert.equal(competing.venues.length, 1, "direct creation adds an ordinary map venue");
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
full.venues = Array.from({ length: 48 }, (_, index) => venue(`Place ${index}`));
assert.throws(() => addVillageVenue(full, venue("One more")), /no room/u);

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
const legacy = structuredClone(drafts);
const legacyDraft = structuredClone(legacy.projects[0]!);
legacyDraft.id = "legacy-extra";
legacy.projects.push(legacyDraft);
assert.equal(
  coerceVillageState(legacy).projects.filter((project) => project.status === "planning").length,
  7,
  "existing drafts above the new limit remain readable",
);
drafts.projects[0]!.status = "working";
draftNewVenueProject(drafts, { ...core, description: "A newly available draft." });
assert.equal(drafts.projects.filter((project) => project.status === "planning").length, 6);

console.log("Villages venue request regression: draft, dedup, persistence, review decisions and limits ok");
