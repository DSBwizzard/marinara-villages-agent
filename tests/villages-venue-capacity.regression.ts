import assert from "node:assert/strict";
import {
  defaultVillageState,
  coerceVillageState,
  mutateVillageState,
  readVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.ts";
import {
  assertCanAddVillageVenue,
  assertVillageVenueCapacity,
  villageVenueLimit,
  villageVenueUsage,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-capacity.ts";
import {
  addVillageVenue,
  setVillageVenues,
  setVillageName,
  resetVillage,
  runVillageBootstrap,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village.ts";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.ts";
import {
  createNewVenueProject,
  placeNewVenueProject,
} from "../packages/villages/src/engine/packages/server/src/services/villages/project-lifecycle.ts";
import { draftBuildProject } from "../packages/villages/src/engine/packages/server/src/services/villages/build-projects.ts";
import { queueVenueCounteroffer } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-mailbox.ts";
import { defaultVenueSpace } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-model.ts";
import type { VillageVenue } from "../packages/villages/src/engine/packages/server/src/services/villages/types.ts";

async function main() {
  const venue = (index: number, residential = true): VillageVenue => ({
    id: "venue-" + index,
    name: "Venue " + index,
    classes: [residential ? "residence" : "other"],
    description: "A usable existing room.",
    category: "",
    spaces: [defaultVenueSpace(residential ? "residence" : "other", "An existing room.")],
    presentation: { image: null, x: null, y: null },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    capabilities: [],
    state: { condition: "standing", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
  });
  const fresh = defaultVillageState();
  assert.equal(villageVenueLimit(fresh), 16);
  assert.equal(coerceVillageState({ wishSystemVersion: 2 }).venueCapacityPolicy, "sixteen-total-v1");
  fresh.venues = Array.from({ length: 15 }, (_, i) => venue(i));
  addVillageVenue(fresh, venue(15));
  assert.equal(fresh.venues.length, 16);
  assert.throws(() => addVillageVenue(fresh, venue(16)), /maximum 16 total/);
  assert.throws(() => assertVillageVenueCapacity(fresh, [...fresh.venues, venue(16)]), /maximum 16 total/);
  assert.equal(coerceVillageState(fresh).venueCapacityPolicy, "sixteen-total-v1");

  const legacyRaw: any = {
    ...fresh,
    setupAt: "2026-10-03T12:00:00.000Z",
    venues: Array.from({ length: 30 }, (_, i) => venue(i)),
  };
  delete legacyRaw.venueCapacityPolicy;
  const legacy = coerceVillageState(legacyRaw);
  assert.equal(legacy.venueCapacityPolicy, "legacy-v1");
  assert.equal(villageVenueLimit(legacy), 48);
  assert.equal(legacy.venues.length, 30, "older saves are never truncated to sixteen");
  addVillageVenue(legacy, venue(31));
  assert.equal(coerceVillageState(legacy).venues.length, 31);
  legacy.venues = Array.from({ length: 24 }, (_, i) => venue(i, false));
  assert.throws(() => assertCanAddVillageVenue(legacy, ["other"]), /no room/);
  assert.doesNotThrow(() => assertCanAddVillageVenue(legacy, ["residence"]));

  const oldBuild = defaultVillageState();
  oldBuild.setupAt = "2026-10-03T12:00:00.000Z";
  oldBuild.venues = Array.from({ length: 15 }, (_, i) => venue(i));
  draftBuildProject(oldBuild, { name: "Workshop", classes: ["workplace"], description: "An adaptable room." });
  assert.equal(villageVenueUsage(oldBuild).total, 16, "older build drafts reserve one place");
  assert.throws(
    () => draftBuildProject(oldBuild, { name: "Another room", classes: ["gathering"], description: "A room." }),
    /maximum 16/,
  );
  const requestState = defaultVillageState();
  requestState.setupAt = oldBuild.setupAt;
  requestState.venues = Array.from({ length: 15 }, (_, i) => venue(i));
  const counter = () => {
    requestState.pendingDecisions = [
      {
        id: "request",
        kind: "venue",
        status: "pending",
        requesterCharacterId: "rosa",
        venueDraft: { name: "Original", classes: ["gathering"] },
      } as any,
    ];
    queueVenueCounteroffer(
      requestState,
      "request",
      { name: "Counter", classes: ["gathering"] },
      "A shared room.",
      new Date(oldBuild.setupAt),
    );
  };
  counter();
  assert.equal(requestState.venueMail.length, 1, "counteroffer may propose the sixteenth Venue");
  requestState.venues.push(venue(15));
  assert.throws(counter, /maximum 16/);
  legacy.projects = [];
  const residentialBuild = draftBuildProject(legacy, {
    name: "Legacy residence",
    classes: ["residence"],
    description: "Another existing room.",
  });
  assert.deepEqual(
    residentialBuild.venueDraft?.classes,
    ["residence"],
    "legacy non-residential limit permits a residential draft",
  );

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
  const seed = defaultVillageState();
  seed.setupAt = "2026-10-03T12:00:00.000Z";
  seed.foundedAt = seed.setupAt;
  seed.venues = Array.from({ length: 15 }, (_, i) => venue(i));
  records.set("villages-village", { id: "villages-village", kind: "village", data: seed, revision: 1 });
  try {
    await createNewVenueProject({
      name: "New shared room",
      description: "A room for shared activities.",
      venueClass: "gathering",
    });
    let state = await readVillageState();
    assert.equal(villageVenueUsage(state).total, 16, "a concept reserves its future Venue");
    await assert.rejects(
      mutateVillageState((current) => {
        current.venues.push(venue(99));
      }),
      /maximum 16/,
    );
    const project = state.projects.find((row) => row.kind === "new-venue")!;
    await placeNewVenueProject(project.id, { x: 0.5, y: 0.5 });
    state = await readVillageState();
    assert.equal(state.venues.length, 16);
    assert.equal(villageVenueUsage(state).total, 16, "worksite does not consume its reservation twice");
    await mutateVillageState((current) => {
      current.venues[0].description = "Renamed room.";
    });
    assert.equal((await readVillageState()).venues[0].description, "Renamed room.");
    const copy = structuredClone(state);
    copy.projects.push({ ...project, id: "renovation", kind: "renovation", venueId: copy.venues[0].id } as any);
    assert.equal(villageVenueUsage(copy).total, 16, "Renovations reserve no new Venue");
    copy.projects.find((row) => row.id === project.id)!.status = "complete";
    copy.venues.find((row) => row.buildProjectId === project.id)!.constructionStatus = "complete";
    assert.equal(villageVenueUsage(copy).total, 16, "completed worksite remains one Venue");
    assert.doesNotThrow(() => assertVillageVenueCapacity(copy));
    // Public settings do not own capacity; a normal persisted edit retains legacy policy.
    records.set("villages-village", { id: "villages-village", kind: "village", data: legacy, revision: 1 });
    await setVillageName("Legacy preserved");
    assert.equal((await readVillageState()).venueCapacityPolicy, "legacy-v1");
    const reset = await resetVillage();
    assert.equal(reset.settings.maxPlaces, 16);
    const bulk = defaultVillageState();
    records.set("villages-village", { id: "villages-village", kind: "village", data: bulk, revision: 1 });
    await setVillageVenues(Array.from({ length: 16 }, (_, i) => venue(i, false)));
    await assert.rejects(setVillageVenues(Array.from({ length: 17 }, (_, i) => venue(i, false))), /maximum 16/);
    assert.equal((await readVillageState()).venues.length, 16, "rejected bulk update is atomic");
    const bootstrap = defaultVillageState();
    bootstrap.setting = "An existing apartment complex.";
    bootstrap.venues = Array.from({ length: 15 }, (_, i) => venue(i));
    records.set("villages-village", { id: "villages-village", kind: "village", data: bootstrap, revision: 1 });
    await runVillageBootstrap();
    assert.equal((await readVillageState()).venues.length, 16, "bootstrap accommodates the sixteenth");
    proposedNames = ["Shared room", "Service room"];
    await assert.rejects(runVillageBootstrap(), /maximum 16/);
    assert.equal((await readVillageState()).venues.length, 16, "oversize bootstrap preserves all saved Venues");
    records.delete("villages-village");
    assert.equal(
      (await readVillageState()).venueCapacityPolicy,
      "sixteen-total-v1",
      "fresh/reset records adopt sixteen",
    );
  } finally {
    release();
  }
  console.log(
    "Villages capacity: total sixteen, legacy limits, reservations, atomic admission and worksite continuity ok",
  );
}
void main();
