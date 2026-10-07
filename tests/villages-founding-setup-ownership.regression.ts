import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageSnapshot, VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { DEFAULT_TOWN_MAP_VIEW } from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import { createFoundingSetup } from "../packages/villages/src/server/features/founding/founding-setup-service.js";
import {
  configureFoundingSetup,
  runVillageSetup,
  suggestFoundingVenueNames,
} from "../packages/villages/src/server/features/founding/founding-setup.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function input(name: string) {
  return {
    name,
    setting: "An observatory village",
    foundingReason: "none",
    foundingDetails: "We begin our first day as neighbours.",
    playerPersonaId: "player",
    foundingCharacterIds: ["same"],
    venues: ["player", "same", "hall"].map((id, index) => ({
      id,
      name: `${name} ${id}`,
      form: "A room",
      description: "A welcoming doorway",
      category: id === "hall" ? "public-center" : "house",
      classes: [id === "hall" ? "gathering" : "residence"],
      layoutVersion: 1,
      layout: "exterior",
      spaces: [],
      privateSpaces: [],
      occupancy: { playerHome: id === "player", residentCharacterId: id === "same" ? id : null, homeKind: null },
      presentation: { x: 0.2 + index * 0.2, y: 0.5 },
    })),
  };
}
function fixture(name: string) {
  const state = defaultVillageState();
  const card = readVillagerCard({ id: "same", comment: "", data: { name, description: `Private card ${name}` } });
  const proposal = venueDraft(
    { id: "proposed", name: `${name} garden`, classes: ["gathering"], form: "Garden", description: "A quiet garden" },
    null,
  );
  const calls: string[] = [],
    owners: unknown[] = [],
    attempts: VillageState[] = [],
    contexts: unknown[] = [];
  const entered = deferred(),
    gate = deferred();
  let pause = false,
    retry: ((state: VillageState) => void) | undefined,
    failure: Error | undefined;
  const note = (call: string) => {
    calls.push(call);
    owners.push(scopedActivation());
  };
  const service = createFoundingSetup({
    async readVillageState() {
      note("read");
      if (pause) {
        pause = false;
        entered.resolve();
        await gate.promise;
        owners.push(scopedActivation());
      }
      return structuredClone(state);
    },
    async mutateVillageState(update) {
      note("mutate");
      const first = structuredClone(state);
      update(first);
      attempts.push(first);
      if (retry) {
        retry(state);
        retry = undefined;
        const second = structuredClone(state);
        update(second);
        attempts.push(second);
        Object.assign(state, second);
      } else Object.assign(state, first);
      return structuredClone(state);
    },
    async buildVillageSnapshot() {
      note("snapshot");
      return { village: { name: state.name } } as VillageSnapshot;
    },
    async readTownMapSubmission(value) {
      note("map");
      assert.equal(value, "");
      return { image: "", size: null, view: DEFAULT_TOWN_MAP_VIEW };
    },
    async readVillageConnectionSettings() {
      note("connections");
      return {
        systemConnectionId: "talk",
        narrationConnectionId: "talk",
        imageConnectionId: "__villages_image_disabled__",
      };
    },
    async validateVillageSetupConnections() {
      note("validate-connections");
      if (failure) throw failure;
    },
    async readLinkedPersona(id) {
      note("persona:" + id);
      return { id: "player", name: `${name} player`, identity: `Private Persona ${name}` };
    },
    async listVillagerCards() {
      note("cards");
      return [structuredClone(card)];
    },
    async prepareFoundedVillage() {
      note("prepare");
      assert.equal(state.villagers.length, 1);
      assert(state.setupAt);
    },
    async queueVillagerAgenda(id) {
      note("agenda:" + id);
    },
    queueMicrotask(work) {
      note("schedule");
      globalThis.queueMicrotask(work);
    },
    async readVillageLore(...args) {
      note("lore");
      contexts.push(args);
      return [`Private lore ${name}`];
    },
    async proposeVillage(...args) {
      note("propose");
      contexts.push(args);
      return { venues: [structuredClone(proposal)], model: "mock" };
    },
    async proposePublicVenueNames(...args) {
      note("names");
      contexts.push(args);
      return [`${name} square`];
    },
    async draftVillageVenueDescriptions(...args) {
      note("descriptions");
      contexts.push(args);
      return { hall: `${name} description` };
    },
  });
  assert.deepEqual(calls, [], "Setup construction performs no validation, library reads, generation or preparation.");
  return {
    state,
    card,
    service,
    calls,
    owners,
    attempts,
    contexts,
    entered,
    gate,
    pause() {
      pause = true;
    },
    retryWith(change: (state: VillageState) => void) {
      retry = change;
    },
    failWith(error: Error) {
      failure = error;
    },
  };
}

const direct = fixture("Direct");
await assert.rejects(
  direct.service.runVillageSetup({ ...input("Direct"), foundingDetails: "" }),
  /first day|brings you/,
);
assert.deepEqual(direct.calls, ["read"], "First-day validation precedes external connections and generation.");
const result = await direct.service.runVillageSetup(input("Direct"));
assert.equal(result.village.name, "Direct");
assert.equal(direct.state.playerPersonaIdentity, "Private Persona Direct");
assert.equal(direct.state.villagers[0]!.cardSnapshot.description, "Private card Direct");
assert.equal(direct.state.villagers[0]!.agenda!.personalizationPending, true);
assert.equal(direct.state.progressEngineVersion, 1);
assert.equal(direct.state.foundingPreparation!.status, "pending");
assert.equal(direct.state.venues.length, 3);
assert(direct.calls.indexOf("validate-connections") < direct.calls.indexOf("persona:player"));
assert(direct.calls.indexOf("cards") < direct.calls.indexOf("mutate"));
assert.equal(direct.calls.filter((call) => call === "mutate").length, 2);
assert.equal(direct.calls.filter((call) => call === "schedule").length, 1);
assert.equal(direct.calls.filter((call) => call === "prepare").length, 1);
assert(!direct.calls.includes("propose"));
assert(
  !direct.calls.includes("agenda:same"),
  "Fresh setup schedules preparation rather than separate duplicate admission.",
);
const saved = structuredClone(direct.state);
await assert.rejects(
  direct.service.runVillageSetup({ ...input("Direct"), foundingDetails: "Changed starting history" }),
  /locked/,
);
assert.deepEqual(direct.state, saved);

const suggestions = fixture("Suggestions");
assert.deepEqual(await suggestions.service.suggestFoundingPlaces("Observatory", ["book"], 1600), {
  places: [{ name: "Suggestions garden" }],
});
assert.deepEqual(await suggestions.service.suggestFoundingVenueNames("Observatory", ["book"], 1600), {
  names: ["Suggestions square"],
});
assert.deepEqual(
  await suggestions.service.draftVenueDescriptions({
    setting: "Observatory",
    selectedLorebookIds: ["book"],
    venues: [{ id: "hall", name: "Hall", classes: ["gathering"] }],
  }),
  { descriptions: { hall: "Suggestions description" } },
);
assert(!suggestions.calls.includes("mutate"));
assert.equal(suggestions.calls.filter((call) => call === "propose").length, 1);
assert.equal(suggestions.calls.filter((call) => call === "names").length, 1);
assert.equal(suggestions.calls.filter((call) => call === "descriptions").length, 1);
assert(JSON.stringify(suggestions.contexts).includes("Private lore Suggestions"));
const beforeBootstrap = structuredClone(
  direct.state.venues.filter((venue) => venue.occupancy.playerHome || venue.occupancy.residentCharacterId),
);
await direct.service.runVillageBootstrap();
assert.deepEqual(direct.state.venues.slice(0, 2), beforeBootstrap, "Bootstrap retains the saved homes.");
assert.equal(direct.state.venues.at(-1)!.name, "Direct garden");

const changed = fixture("Changed");
changed.retryWith((state) => {
  state.setupAt = "concurrent-founded";
  state.name = "Concurrent village";
});
await assert.rejects(changed.service.runVillageSetup(input("Changed")), /changed during setup/);
assert(changed.attempts[0]!.setupAt);
assert.equal(changed.state.name, "Concurrent village");
assert.equal(changed.state.villagers.length, 0);
assert(!changed.calls.includes("schedule"));
const failed = fixture("Failed"),
  failure = Error("Connection validation unavailable");
failed.failWith(failure);
await assert.rejects(failed.service.runVillageSetup(input("Failed")), (error) => error === failure);
assert(!failed.calls.includes("persona:player"));
assert(!failed.calls.includes("mutate"));

const a = createActivationScope(),
  b = createActivationScope();
const original = fixture("Original"),
  current = fixture("Current");
const releaseA = a.run(() => configureFoundingSetup(original.service)),
  releaseB = b.run(() => configureFoundingSetup(current.service));
const clearA = installDefaultActivation(a, () => {});
original.pause();
const pending = runVillageSetup(input("Original"));
await original.entered.promise;
const clearB = installDefaultActivation(b, () => {});
await runVillageSetup(input("Current"));
original.gate.resolve();
assert.equal((await pending).village.name, "Original");
assert.equal(original.state.playerPersonaIdentity, "Private Persona Original");
assert.equal(current.state.playerPersonaIdentity, "Private Persona Current");
assert(original.owners.every((owner) => owner === a));
assert(current.owners.every((owner) => owner === b));
assert(original.calls.includes("prepare"));
assert(current.calls.includes("prepare"));
a.run(releaseA);
a.dispose();
clearA();
assert.deepEqual(await suggestFoundingVenueNames("Observatory", []), { names: ["Current square"] });
const missing = createActivationScope();
await assert.rejects(
  missing.run(() => runVillageSetup(input("Missing"))),
  /not configured/,
);
b.run(releaseB);
b.dispose();
clearB();
await assert.rejects(
  b.run(() => suggestFoundingVenueNames("Observatory", [])),
  /not configured/,
);
console.log(
  "Founding setup ownership: inert explicit connections, first save/preparation order, read-only scoped generation, locks/save retries and originating microtasks passed (mocked storage/library/generation/preparation).",
);
