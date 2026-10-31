import { EMPTY_RESIDENT_ADMISSION } from "../packages/villages/src/shared/helpers/resident-admission.js";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { registerFoundingRoutes } from "../packages/villages/src/server/features/founding/routes.js";
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
    worldName: "same-world",
    foundingResidentAdmissions: Object.fromEntries(
      ["same"].map((id) => [id, { homeworld: "Othiras", startingSituation: "Already living here." }]),
    ),
    setting: "An observatory village",
    townMapImage: "test-map",
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
      classes: [id === "hall" ? "community" : "residence"],
      layoutVersion: 1,
      layout: "common",
      spaces: [
        {
          id: "common:base",
          name: "Shared room",
          purpose: "Conversation",
          description: "A table",
          venueClass: id === "hall" ? "community" : "residence",
        },
      ],
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
    { id: "proposed", name: `${name} garden`, classes: ["community"], form: "Garden", description: "A quiet garden" },
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
    async peekVillageAuthority() {
      note("peek");
      if (pause) {
        pause = false;
        entered.resolve();
        await gate.promise;
        owners.push(scopedActivation());
      }
      return structuredClone(state);
    },
    async readVillageState() {
      note("read");
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
      return { village: { name: state.name, timeZone: state.timeZone } } as VillageSnapshot;
    },
    async prepareVillageMap(value) {
      note("map");
      assert.equal(value.image, "test-map");
      return {
        id: value.id,
        name: value.name,
        artwork: { ref: "global-gallery:map", id: "map", url: "/map.png" },
        width: 1440,
        height: 900,
        view: DEFAULT_TOWN_MAP_VIEW,
        revision: 1,
      };
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
    async preparedSpriteManager(id) {
      note("sprites:" + id);
      assert(
        !state.villagers.some((resident) => resident.characterId === id),
        "Existing residents retain their sprites.",
      );
      return null;
    },
    async prepareFoundedVillage() {
      note("prepare");
      assert.equal(state.villagers.length, 1);
      assert(state.setupAt);
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

// Exercise the real HTTP entry and setup coordinator with provider-free ports.
for (const invalid of ["missing-purpose", "layout-mismatch"]) {
  const api = fixture(invalid),
    payload = input(invalid);
  if (invalid === "layout-mismatch") payload.venues[0]!.spaces = [];
  if (invalid === "missing-purpose") payload.venues[0]!.spaces[0]!.purpose = "";
  const dispose = configureFoundingSetup(api.service),
    server = Fastify();
  registerFoundingRoutes(server);
  try {
    const response = await server.inject({ method: "POST", url: "/setup", payload });
    assert.equal(response.statusCode, 400, invalid);
    assert.ok(response.json().error, "HTTP validation explains the rejected template");
    assert.ok(
      !api.calls.some((call) => ["mutate", "propose", "names", "descriptions", "prepare", "schedule"].includes(call)),
      "Invalid initial templates cause no model work or world writes",
    );
    assert.equal(api.state.setupAt, "");
  } finally {
    dispose();
    await server.close();
  }
}
// Templates are defaults: the HTTP founding path accepts Entrance-only homes and Community.
{
  const api = fixture("Entrance-only"),
    server = Fastify();
  const dispose = configureFoundingSetup(api.service);
  registerFoundingRoutes(server);
  try {
    const payload = input("Entrance-only");
    for (const venue of payload.venues) Object.assign(venue, { layout: "exterior", spaces: [], privateSpaces: [] });
    const response = await server.inject({ method: "POST", url: "/setup", payload });
    assert.equal(response.statusCode, 200, response.body);
    assert.ok(api.state.venues.every((venue) => venue.zones?.length === 1 && venue.zones[0].id === "exterior"));
    assert.ok(
      !api.calls.some((call) => ["propose", "names", "descriptions"].includes(call)),
      "founding does not regenerate edited templates",
    );
  } finally {
    dispose();
    await server.close();
  }
}
// Exercise timezone selection through the HTTP adapter, including durable first-save semantics.
{
  const api = fixture("Timezone"),
    server = Fastify();
  const dispose = configureFoundingSetup(api.service);
  registerFoundingRoutes(server);
  try {
    const payload = { ...input("Timezone"), timeZone: "Asia/Tokyo" };
    const invalid = await server.inject({
      method: "POST",
      url: "/setup",
      payload: { ...payload, timeZone: "Not/A_Zone" },
    });
    assert.equal(invalid.statusCode, 400);
    assert.equal(api.calls.includes("mutate"), false, "Invalid timezone is rejected before saved-world changes");
    const saved = await server.inject({ method: "POST", url: "/setup", payload });
    assert.equal(saved.statusCode, 200, saved.body);
    assert.equal(saved.json().village.timeZone, "Asia/Tokyo");
    assert.equal(api.state.timeZone, "Asia/Tokyo", "The selected timezone reaches durable setup state");
    const before = structuredClone(api.state);
    const changed = await server.inject({
      method: "POST",
      url: "/setup",
      payload: { ...payload, timeZone: "America/Los_Angeles" },
    });
    assert.equal(changed.statusCode, 409);
    assert.deepEqual(api.state, before, "A second setup cannot change an existing world");
    const { timeZone: _timeZone, foundingResidentAdmissions: _admissions, ...legacyPayload } = payload;
    const legacy = await server.inject({ method: "POST", url: "/setup", payload: legacyPayload });
    assert.equal(legacy.statusCode, 409, legacy.body);
    assert.deepEqual(api.state, before, "Omitting founding fields cannot reopen setup");
  } finally {
    dispose();
    await server.close();
  }
}

const direct = fixture("Direct");
for (const setting of ["A farm", "An abandoned farm"]) {
  const everyday = fixture("Everyday");
  const payload = { ...input("Everyday"), setting };
  delete payload.foundingDetails;
  delete payload.foundingReason;
  await everyday.service.runVillageSetup(payload);
  assert.equal(everyday.state.setting, setting);
  assert.equal(everyday.state.foundingDetails, "");
  assert.equal(everyday.state.foundingReason, "none");
  assert.equal(everyday.state.opening?.stage, "gathering", "the tutorial is unchanged");
}
const noChangesFixture = fixture("No changes");
const noChangesInput = { ...input("No changes"), foundingResidentAdmissions: undefined, worldName: undefined };
await noChangesFixture.service.runVillageSetup(noChangesInput);
assert.deepEqual(noChangesFixture.state.villagers[0].admission, EMPTY_RESIDENT_ADMISSION);
const invalid = { ...input("Invalid"), foundingResidentAdmissions: { stranger: EMPTY_RESIDENT_ADMISSION } };
await assert.rejects(direct.service.runVillageSetup(invalid), /selected/);
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
const saved = structuredClone(direct.state);
const callsBeforeReopening = direct.calls.length;
await assert.rejects(
  direct.service.runVillageSetup({ ...input("Direct"), foundingDetails: "Changed starting history" }),
  /already founded/,
);
assert.deepEqual(direct.state, saved);
await assert.rejects(
  direct.service.runVillageSetup({
    ...input("Direct"),
    foundingResidentAdmissions: undefined,
    foundingSpriteRevisions: { same: -1 },
  }),
  /already founded/,
);
assert.deepEqual(direct.state, saved);
assert.deepEqual(direct.calls.slice(callsBeforeReopening), ["peek", "peek"], "Rejected setup has no side effects");

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
    venues: [{ id: "hall", name: "Hall", classes: ["community"] }],
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
