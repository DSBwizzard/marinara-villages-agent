// Test cases: state-service/read-only, state-service/retry, state-service/storage-capture, state-service/acceptance-lock
import assert from "node:assert/strict";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VillageRepository } from "../packages/villages/src/server/domain/models/world-repository.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createVillageStateService } from "../packages/villages/src/server/features/world/village-state-service.js";
import { runCase } from "../scripts/test-cases.mjs";
import { authorVillageFixture } from "./helpers/village-storage.fixture.js";

await runCase("state-service/read-only", async () => {
  const state = { ...defaultVillageState(), seed: "world" },
    calls: unknown[] = [];
  const service = createVillageStateService({
    async readAuthority(options) {
      calls.push(options);
      return structuredClone(state);
    },
    async mutateAuthority() {
      throw new Error("Reads must not settle fiction or change authority");
    },
  });
  await service.readVillageAuthority();
  await service.readVillageSnapshot({ memories: true });
  const snapshot = await service.readVillageState();
  assert.deepEqual(calls, [undefined, { memories: true }, undefined]);
  snapshot.name = "Local view";
  assert.equal(state.name, "");
});

await runCase("state-service/retry", async () => {
  let state = { ...defaultVillageState(), seed: "first" };
  const calls: string[] = [];
  const repository: VillageRepository = {
    async readAuthority() {
      return structuredClone(state);
    },
    async mutateAuthority(update) {
      const rejected = structuredClone(state);
      await update(rejected);
      state = { ...defaultVillageState(), seed: "concurrent-world" };
      const accepted = structuredClone(state);
      await update(accepted);
      state = accepted;
    },
  };
  const service = createVillageStateService(repository);
  const result = await service.mutateVillageState((world) => {
    calls.push(world.seed);
    world.name = "Saved title";
  });
  assert.deepEqual(calls, ["first", "concurrent-world"]);
  assert.equal(result, state, "only the successful CAS candidate is returned");
  assert.equal(result.name, "Saved title");
});

await runCase("state-service/storage-capture", async () => {
  const root = (seed: string) => ({
    id: "villages-village",
    packageId: "villages",
    kind: "village",
    revision: 1,
    data: authorVillageFixture(new Map(), { ...defaultVillageState(), seed }),
  });
  const first = root("first"),
    second = root("second");
  let accesses = 0,
    writes = 0,
    secondWrites = 0,
    selected: CapabilityDocumentStore;
  const secondDocuments = {
    async getById(_pkg: string, id: string) {
      return id === first.id ? structuredClone(second) : null;
    },
    async update() {
      secondWrites++;
      return second;
    },
  } as unknown as CapabilityDocumentStore;
  const firstDocuments = {
    async getById(_pkg: string, id: string) {
      selected = secondDocuments;
      return id === first.id ? structuredClone(first) : null;
    },
    async update(input: any) {
      writes++;
      if (writes === 1) {
        first.revision++;
        return null;
      }
      first.data = structuredClone(input.data);
      first.revision++;
      return structuredClone(first);
    },
    async list() {
      return [];
    },
  } as unknown as CapabilityDocumentStore;
  selected = firstDocuments;
  const repository = createVillageRepository(() => {
    accesses++;
    return selected;
  });
  await repository.mutateAuthority((state) => {
    state.name = "Updated";
  });
  assert.equal(writes, 2);
  assert.equal(secondWrites, 0, "a retry cannot switch the originating Engine document store");
  assert.equal(accesses, 1);
  assert.equal((await repository.readAuthority()).seed, "second", "the next operation resolves its store anew");
});

await runCase("state-service/acceptance-lock", async () => {
  const calls: string[] = [];
  const service = createVillageStateService({
    async readAuthority() {
      calls.push("read");
      return defaultVillageState();
    },
    async mutateAuthority() {},
    async withAuthorityLock(work) {
      calls.push("enter");
      try {
        return await work();
      } finally {
        calls.push("exit");
      }
    },
  });
  const result = await service.withVillageSceneAcceptance(async () => {
    calls.push("accept");
    return "accepted";
  });
  assert.equal(result, "accepted");
  assert.deepEqual(calls, ["enter", "read", "accept", "exit"]);
});
