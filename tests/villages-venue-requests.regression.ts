import assert from "node:assert/strict";
import {
  readConversationVenueRequest,
  readVenueRequestCore,
  venueRequestDraft,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-requests.ts";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.ts";
import {
  addVillageVenue,
  applyVillageVenueDecision,
  queueVillageVenueRequest,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village.ts";
import { remapVenues } from "../packages/villages/src/engine/packages/server/src/services/villages/prompt-preset.ts";
import {
  readHousingRequests,
  readTickVenueRequests,
  type VillageTickContext,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-bootstrap.ts";
import { normalizeVillageSnapshot } from "../packages/villages/src/engine/packages/client/src/villages-snapshot-normalization.ts";
import type {
  VillageVenue,
  VillageVillager,
} from "../packages/villages/src/engine/packages/server/src/services/villages/types.ts";

const at = "2026-09-22T12:00:00.000Z";
const core = { name: "The Glasshouse", classes: ["gathering"] as ["gathering"] };
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
state.foundedAt = at;
state.villagers.push({
  characterId: "rosa",
  cardSnapshot: { id: "rosa", revision: 1, sourceStatus: "available", name: "Rosa", capturedAt: at },
  agenda: null,
  addedAt: at,
  completedWishes: [],
} as VillageVillager);
state.noticeboard.push({ author: "Rosa", text: "Could we have somewhere to grow herbs?" });

assert.deepEqual(readVenueRequestCore({ name: "", classes: ["gathering"] }), null);
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
assert.deepEqual(readTickVenueRequests([{ who: "Rosa", ...core }], [{ characterId: "rosa", name: "Rosa" }], []), [
  { characterId: "rosa", core },
]);
assert.deepEqual(
  readTickVenueRequests([{ who: "A stranger", ...core }], [{ characterId: "rosa", name: "Rosa" }], []),
  [],
);
assert.deepEqual(
  readTickVenueRequests([{ who: "Rosa", ...core }], [{ characterId: "rosa", name: "Rosa" }], [core.name]),
  [],
);
const housingContext = {
  residents: [{ characterId: "rosa", name: "Rosa" }],
  venues: [
    {
      ...venue("Rosa's home"),
      id: "rosa-home",
      occupancy: { playerHome: false, residentCharacterId: "rosa", homeKind: "small-home" },
    },
    { ...venue("Open venue"), id: "open" },
    {
      ...venue("Occupied venue"),
      id: "occupied",
      occupancy: { playerHome: false, residentCharacterId: "someone-else", homeKind: "small-home" },
    },
  ],
  opportunities: [{ actorIds: ["rosa"] }],
  pendingHousingCharacterIds: [],
} as unknown as VillageTickContext;
assert.deepEqual(readHousingRequests([{ who: "rosa", kind: "move", venueId: "open" }], housingContext), [
  { characterId: "rosa", kind: "move", venueId: "open" },
]);
assert.deepEqual(readHousingRequests([{ who: "rosa", kind: "move", venueId: "occupied" }], housingContext), []);
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
persisted.noticeboard.splice(0, 1);
assert.equal(persisted.pendingDecisions[0]?.id, id, "removing a note does not dismiss its request");

applyVillageVenueDecision(persisted, id, true, core, "A shared glasshouse for herbs.", new Date(at));
assert.equal(persisted.pendingDecisions[0]?.status, "approved");
assert.equal(persisted.venues.length, 0, "approval begins planning without creating a venue");
assert.equal(persisted.projects[0]?.kind, "build-venue");
assert.equal(persisted.projects[0]?.status, "draft");
assert.deepEqual(persisted.projects[0]?.venueDraft?.classes, ["gathering"]);
assert.equal(persisted.projects[0]?.venueDraft?.description, "A shared glasshouse for herbs.");
assert.match(persisted.chronicle[0]?.text ?? "", /accepted Rosa's request to plan/u);
assert.throws(() => applyVillageVenueDecision(persisted, id, true, core, "A shared glasshouse.", new Date(at)));
assert.equal(coerceVillageState(persisted).projects[0]?.venueDraft?.name, core.name, "the project survives reload");

const denied = persisted.pendingDecisions.find((decision) => decision.venueDraft?.name === "The Mill")!;
applyVillageVenueDecision(persisted, denied.id, false, null, "", new Date(at));
assert.equal(denied.status, "denied");
assert.equal(persisted.venues.length, 0, "denial must leave the map unchanged");
assert.match(persisted.chronicle[0]?.text ?? "", /declined Rosa's request/u);

const competing = defaultVillageState();
competing.villagers.push({
  characterId: "rosa",
  cardSnapshot: { id: "rosa", revision: 1, sourceStatus: "available", name: "Rosa", capturedAt: at },
  agenda: null,
  addedAt: at,
  completedWishes: [],
} as VillageVillager);
queueVillageVenueRequest(competing, core, "rosa", "chat", "chat-competing", at);
addVillageVenue(competing, venue(core.name));
assert.equal(competing.venues.length, 1, "direct creation adds an ordinary map venue");
assert.throws(
  () =>
    applyVillageVenueDecision(
      competing,
      competing.pendingDecisions[0]!.id,
      true,
      core,
      "A shared glasshouse.",
      new Date(at),
    ),
  /already in use/u,
  "approval rechecks names after a player creates a competing venue",
);
assert.equal(competing.pendingDecisions[0]?.status, "pending", "a failed approval remains reviewable");

const full = defaultVillageState();
full.venues = Array.from({ length: 48 }, (_, index) => venue(`Place ${index}`));
assert.throws(() => addVillageVenue(full, venue("One more")), /no room/u);

console.log("Villages venue request regression: draft, dedup, persistence, review decisions and limits ok");
