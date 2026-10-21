import assert from "node:assert/strict";
import Fastify from "fastify";
import {
  EMPTY_RESIDENT_ADMISSION,
  readResidentAdmission,
  readWorldName,
  sameWorld,
  sharedWorldContext,
  renderResidentAdmission,
  admissionLoreContext,
} from "../packages/villages/src/shared/helpers/resident-admission.js";
import { readFoundingResidentAdmissions } from "../packages/villages/src/server/domain/rules/resident-admission.js";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  readVillagerCard,
  readEffectiveVillagerCard,
} from "../packages/villages/src/server/adapters/engine/catalog.js";
import { createResidentRoster } from "../packages/villages/src/server/features/residents/resident-roster-service.js";
import { createResidentCards } from "../packages/villages/src/server/features/residents/resident-card-service.js";
import { registerResidentRoutes } from "../packages/villages/src/server/features/residents/routes.js";
import { projectVillager } from "../packages/villages/src/server/domain/rules/world-snapshot.js";
import {
  venueCardProfile,
  fitVenueWritingMessages,
} from "../packages/villages/src/server/domain/rules/venue-writing.js";
import { proposeStartingTies } from "../packages/villages/src/server/domain/rules/relationship-knowledge.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { agendaRevision } from "../packages/villages/src/server/domain/rules/agenda-revision.js";
import { wishRevision } from "../packages/villages/src/server/domain/rules/wish-policy.js";
import { privatePreparationKey } from "../packages/villages/src/server/jobs/private-space-service.js";
import { sceneryPrompt, sceneryImageKey } from "../packages/villages/src/server/domain/rules/scenery-context.js";
import { parsePlace } from "../packages/villages/src/server/domain/rules/founding-record.js";

assert.deepEqual(readResidentAdmission({ homeworld: " Koront ", startingSituation: " Already living here. " }), {
  homeworld: "Koront",
  startingSituation: "Already living here.",
});
for (const value of [
  null,
  [],
  {},
  { homeworld: 3, startingSituation: "" },
  { homeworld: "x".repeat(121), startingSituation: "" },
  { homeworld: "", startingSituation: false },
  { homeworld: "", startingSituation: "x".repeat(1201) },
])
  assert.equal(readResidentAdmission(value), null);
assert.equal(readWorldName(" Othiras "), "Othiras");
assert.equal(readWorldName(false), null);
assert.equal(readWorldName("x".repeat(121)), null);
assert.deepEqual({ ...readFoundingResidentAdmissions(undefined, ["buster"]).buster }, EMPTY_RESIDENT_ADMISSION);
assert.throws(() => readFoundingResidentAdmissions({ stranger: EMPTY_RESIDENT_ADMISSION }, ["buster"]), /selected/);
assert.throws(() => readFoundingResidentAdmissions({ buster: {} }, ["buster"]), /120/);
assert.ok(sameWorld(" OTHIRAS ", "Othiras"));
assert.ok(!sameWorld("", ""));
assert.ok(!sameWorld("Korant", "Koront"));
const shared = sharedWorldContext("Othiras", [
  { name: "A", admission: { homeworld: " othiras ", startingSituation: "" } },
  { name: "B", admission: { homeworld: "Othiras", startingSituation: "" } },
  { name: "C", admission: { ...EMPTY_RESIDENT_ADMISSION } },
]);
assert.match(shared, /A, B: homeworld/);
assert.match(shared, /the Village's world/);
assert.ok(!shared.includes("C:"));
assert.equal(
  admissionLoreContext("Othiras", [{ homeworld: "Koront", startingSituation: "PRIVATE-UNRELATED" }]),
  "Othiras\nKoront",
);

const state = defaultVillageState();
state.worldName = "Othiras";
state.playerName = "Player";
let card = readVillagerCard({
  id: "buster",
  data: {
    name: "Buster",
    description: "Buster is best friends with Felix",
    extensions: {
      backstory:
        "Born in Koront. Buster currently inhabits Othiras. He arrived after exploring a Stardust facility, with minor amnesia.",
    },
  },
});
const original = structuredClone(card);
let agendas = 0,
  ties = 0;
const revisions: unknown[] = [];
const service = createResidentRoster({
  readVillageState: async () => structuredClone(state),
  mutateVillageState: async (change) => {
    change(state);
    return structuredClone(state);
  },
  findVillagerCard: async () => structuredClone(card),
  preparedSpriteManager: async (_id, revision) => {
    revisions.push(revision);
    if (revision === 99) throw Error("Sprite revision changed");
    return null;
  },
  queueVillagerAgenda: async () => {
    agendas++;
  },
  queueStartingTies: async () => {
    ties++;
  },
  retireBackgroundResident() {},
});
await assert.rejects(service.addVillager("buster", 1, { homeworld: 3, startingSituation: "" }), /120/);
await assert.rejects(service.addVillager("buster", 99), /Sprite revision/);
assert.equal(state.villagers.length, 0);
await service.addVillager("buster", 1, { homeworld: " Koront ", startingSituation: " Visiting the Village. " });
assert.deepEqual(state.villagers[0].admission, { homeworld: "Koront", startingSituation: "Visiting the Village." });
assert.equal(state.villagers[0].cardSnapshot.backstory, original.backstory);
assert.deepEqual(card, original, "admission never rewrites source material");
await service.addVillager("buster", 1, { homeworld: "Another world", startingSituation: "Overwrite attempt" });
assert.equal(state.villagers.length, 1);
assert.equal(state.villagers[0].admission.homeworld, "Koront", "duplicate admission never overwrites saved context");
assert.equal(agendas, 1);
assert.equal(ties, 1);
const reloaded = coerceVillageState(structuredClone(state));
assert.equal(reloaded.worldName, "Othiras");
assert.deepEqual(reloaded.villagers[0].admission, state.villagers[0].admission);
const profile = venueCardProfile(readEffectiveVillagerCard(reloaded.villagers[0]));
assert.ok(profile.includes(original.backstory));
assert.match(profile, /Visiting the Village/);
assert.match(profile, /amnesia/);
assert.throws(
  () => fitVenueWritingMessages({ fitContext: () => ({ messages: [] }) } as any, [{ text: profile }], "Hello", 1000),
  /No reply was requested/,
);
const projected = projectVillager(state.villagers[0], "Buster", "", [], "", "", null);
assert.ok(!JSON.stringify(projected).includes("Visiting the Village"));
assert.ok(!Object.hasOwn(projected, "admission"));
const before = agendaRevision(state, "buster");
const beforeWish = wishRevision(state.villagers[0], state);
state.worldName = "Othiras revised";
assert.notEqual(agendaRevision(state, "buster"), before);
assert.notEqual(wishRevision(state.villagers[0], state), beforeWish);
const contextBefore = agendaRevision(state, "buster");
const wishContextBefore = wishRevision(state.villagers[0], state);
state.villagers[0].admission.startingSituation = "Settled here.";
assert.notEqual(agendaRevision(state, "buster"), contextBefore);
assert.notEqual(wishRevision(state.villagers[0], state), wishContextBefore);
const venue = parsePlace(
  {
    id: "home",
    name: "Home",
    classes: ["residence"],
    form: "Apartment",
    description: "A doorway",
    layoutVersion: 1,
    layout: "both",
    occupancy: { residentCharacterId: "buster", playerHome: false },
    presentation: { x: 0.5, y: 0.5 },
  },
  0,
) as any;
const zone = {
  id: "room",
  name: "Private room",
  purpose: "Rest",
  kind: "private-residence",
  ownerId: "buster",
  controllerIds: ["felix"],
  state: { updatedAt: "now" },
  preparation: { mode: "initial" },
} as any;
const preparationKey = privatePreparationKey(venue, zone, state);
assert.ok(!preparationKey.includes("Settled here"), "private recovery keys never embed private notes");
state.villagers[0].admission.startingSituation = "Owner's revised private context.";
assert.notEqual(
  privatePreparationKey(venue, zone, state),
  preparationKey,
  "the actual room owner fences generation even with a different controller",
);
const visualKey = sceneryImageKey(state, venue);
state.worldName = "Another setting";
assert.notEqual(sceneryImageKey(state, venue), visualKey);
const requiredNote = "START " + "a".repeat(1200) + " END";
assert.ok(
  sceneryPrompt(["A room", "A long description ".repeat(300)], ["optional ".repeat(300)], "", [requiredNote]).includes(
    requiredNote,
  ),
  "starting circumstances survive visual prompt fitting intact",
);
assert.throws(() => sceneryPrompt(["A room"], [], "", ["x".repeat(4001)]), /No image was requested/);
const refresh = createResidentCards({
  readVillageState: async () => structuredClone(state),
  mutateVillageState: async (change) => {
    change(state);
    return structuredClone(state);
  },
  buildVillageSnapshot: async () => ({}) as any,
  listVillagerCards: async () => [card],
  findVillagerCard: async () => card,
  toCatalogEntry: () => ({}) as any,
});
card = { ...card, personality: "Patient" };
await refresh.applyVillagerRefresh("buster");
assert.equal(state.villagers[0].admission.startingSituation, "Owner's revised private context.");
assert.equal(state.villagers[0].cardSnapshot.personality, "Patient");
const relationState = defaultRelationshipState(state.seed);
state.villagers.push({
  ...structuredClone(state.villagers[0]),
  characterId: "felix",
  cardSnapshot: {
    ...structuredClone(state.villagers[0].cardSnapshot),
    id: "felix",
    name: "Felix",
    description: "",
    backstory: "",
  },
});
const baseline = proposeStartingTies(state, relationState);
assert.ok(baseline.find((tie) => tie.fromId === "buster" && tie.toId === "felix")?.established);
assert.ok(
  !baseline.find((tie) => tie.fromId === "felix" && tie.toId === "buster")?.established,
  "shared origin never invents a reciprocal relationship",
);
relationState.reviewedActorIds = ["buster", "felix"];
assert.deepEqual(proposeStartingTies(state, relationState), [], "reviewed relationships are never reinitialized");
assert.match(renderResidentAdmission("Buster", EMPTY_RESIDENT_ADMISSION), /Preserve complete source identity/);
const app = Fastify();
registerResidentRoutes(app);
assert.equal((await app.inject({ method: "POST", url: "/villagers/background/draft", payload: {} })).statusCode, 404);
await app.close();
console.log(
  "Source-preserving admission: validation, no history rewriting, persistence, required context, private projections, refresh, revisions and directional source relationships passed.",
);
