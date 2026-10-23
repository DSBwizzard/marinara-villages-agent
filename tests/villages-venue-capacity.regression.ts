import assert from "node:assert/strict";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  assertCanAddVillageVenue,
  assertVillageVenueCapacity,
  villageVenueLimit,
  villageVenueUsage,
} from "../packages/villages/src/server/domain/rules/venue-capacity.js";
import { addVillageVenue } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import { setVillageVenues } from "../packages/villages/src/server/features/venues/services.js";
import { readVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { setVillageName } from "../packages/villages/src/server/features/settings/village-settings.js";
import { resetVillage } from "../packages/villages/src/server/features/world/village.js";
import { runVillageBootstrap } from "../packages/villages/src/server/features/founding/founding-setup.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { draftNewVenueProject } from "../packages/villages/src/server/features/projects/project-lifecycle.js";
import { fixture, venue as currentVenue } from "./fixtures/villages-projects.fixture.js";

async function main() {
  const venue = (index: number) => currentVenue("venue-" + index, "residence");
  const fresh = defaultVillageState();
  fresh.setupAt = fresh.foundedAt = "2026-10-23T12:00:00.000Z";
  assert.equal(villageVenueLimit(fresh), 16);
  fresh.venues = Array.from({ length: 15 }, (_, i) => venue(i));
  const draft = draftNewVenueProject(fresh, {
    name: "Workshop",
    classes: ["workplace"],
    description: "A shared room.",
  });
  assert.equal(villageVenueUsage(fresh).total, 15, "drafts reserve nothing");
  assert.doesNotThrow(() => assertCanAddVillageVenue(fresh, ["community"]));
  assert.deepEqual(coerceVillageState(JSON.parse(JSON.stringify(fresh))).projects, fresh.projects);
  addVillageVenue(fresh, venue(15));
  assert.throws(() => addVillageVenue(fresh, venue(16)), /maximum 16 total/);
  assert.throws(() => assertVillageVenueCapacity(fresh, [...fresh.venues, venue(16)]), /maximum 16/);
  assert.equal(draft.status, "planning");
  for (const incompatible of [0, 1, 2, 4, undefined])
    assert.throws(() => coerceVillageState({ ...fresh, version: incompatible }), /Unsupported Village format/);
  assert.equal(coerceVillageState(null).version, 3);
  const f = fixture();
  await f.mutate((state) => {
    state.venues = Array.from({ length: 15 }, (_, i) => venue(i));
  });
  const first = await f.newProject("One", "a", { x: 0.7, y: 0.7 });
  const second = await f.newProject("Two", "b", { x: 0.4, y: 0.7 });
  await f.service.startProjectConstruction(first, f.body(first));
  assert.equal(villageVenueUsage(f.state()).total, 16, "active worksite counts once");
  await assert.rejects(f.service.startProjectConstruction(second, f.body(second)), /maximum 16/);
  assert.equal(f.get(second).status, "planning", "failed admission is atomic");
  await f.service.cancelProject(first, f.body(first));
  assert.equal(villageVenueUsage(f.state()).total, 15);
  await f.service.startProjectConstruction(second, f.body(second));
  assert.equal(villageVenueUsage(f.state()).total, 16);
  const records = new Map<string, any>();
  let proposedNames = ["Shared room"];
  const documents = {
    async getById(_package: string, id: string) {
      return records.get(id) ?? null;
    },
    async list(_package: string, kind: string) {
      return [...records.values()].filter((row) => row.kind === kind);
    },
    async create(input: any) {
      const row = { ...input, revision: 1 };
      records.set(input.id, row);
      return row;
    },
    async update(input: any) {
      const prior = records.get(input.id);
      if (prior?.revision !== input.expectedRevision) return null;
      const row = { ...prior, ...input, revision: prior.revision + 1 };
      records.set(input.id, row);
      return row;
    },
    async remove(_package: string, id: string) {
      return records.delete(id);
    },
  };
  const release = configureVillagesRuntime({
    persistence: { documents },
    resources: { listCharacters: async () => [], listPersonas: async () => [] },
    getAgentConfig: async () => ({ connectionId: "capacity-fixture" }),
    isDebugAgentsEnabled: () => false,
    languageModels: {
      resolveForRequest: async () => ({
        connectionId: "capacity-fixture",
        model: "fixture",
        maxOutputTokens: 2000,
        fitContext: (messages: unknown[]) => ({ messages, maxTokens: 2000 }),
        chatComplete: async () => ({
          content: JSON.stringify({ venues: proposedNames.map((name) => ({ name })) }),
          finishReason: "stop",
        }),
      }),
    },
    logger: { info() {}, debug() {}, warn() {}, error() {}, debugOverride() {} },
  } as any);

  try {
    const incompatible = { ...fresh, version: 2 };
    records.set("villages-village", { id: "villages-village", kind: "village", data: incompatible, revision: 7 });
    await assert.rejects(readVillageState(), /Unsupported Village format/);
    await assert.rejects(setVillageName("Unadmitted edit"), /Unsupported Village format/);
    assert.equal(records.get("villages-village").revision, 7);
    assert.deepEqual(records.get("villages-village").data, incompatible, "rejected data is never rewritten");
    records.delete("villages-village");
    assert.equal((await readVillageState()).version, 3);
    const reset = await resetVillage();
    assert.equal(reset.settings.maxPlaces, 16);
    const bulk = defaultVillageState();
    records.set("villages-village", { id: "villages-village", kind: "village", data: bulk, revision: 1 });
    await setVillageVenues(Array.from({ length: 16 }, (_, i) => venue(i)));
    await assert.rejects(setVillageVenues(Array.from({ length: 17 }, (_, i) => venue(i))), /maximum 16/);
    assert.equal((await readVillageState()).venues.length, 16, "bulk admission is atomic");
    const bootstrap = defaultVillageState();
    bootstrap.setting = "An apartment complex.";
    bootstrap.venues = Array.from({ length: 15 }, (_, i) => venue(i));
    records.set("villages-village", { id: "villages-village", kind: "village", data: bootstrap, revision: 1 });
    await runVillageBootstrap();
    assert.equal((await readVillageState()).venues.length, 16);
    proposedNames = ["Shared room", "Service room"];
    await assert.rejects(runVillageBootstrap(), /maximum 16/);
    assert.equal((await readVillageState()).venues.length, 16);
  } finally {
    release();
  }
  console.log(
    "Villages current capacity: draft admission, worksite limits, atomic rejection, fresh saves and bootstrap passed",
  );
}
await main();
