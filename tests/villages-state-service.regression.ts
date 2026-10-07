import assert from "node:assert/strict";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageRepository } from "../packages/villages/src/server/domain/models/world-repository.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { createVillageStateService } from "../packages/villages/src/server/features/world/village-state-service.js";
import type { WorldRelationships } from "../packages/villages/src/server/features/world/world-relationships.js";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";

// Synthetic stores and relationship collaborators; no Engine or model requests.
async function main() {
  let saved = { ...defaultVillageState(), seed: "initial" };
  const events: string[] = [];
  const repository: VillageRepository = {
    async readAuthority() {
      events.push("read:" + saved.seed);
      return structuredClone(saved);
    },
    async mutateAuthority(update) {
      events.push("attempt:initial");
      await update(structuredClone(saved));
      // Another writer replaced the seed before the first CAS could commit.
      saved = { ...defaultVillageState(), seed: "replacement" };
      events.push("attempt:replacement");
      const current = structuredClone(saved);
      await update(current);
      saved = current;
      events.push("commit:" + saved.seed);
    },
  };
  let outboxInput: VillageState | undefined;
  const relationships: WorldRelationships = {
    async readRelationshipState(seed) {
      events.push("relationships:" + seed);
      return defaultRelationshipState(seed);
    },
    reconcileRelationships(_relationships, state) {
      events.push("reconcile:" + state.seed);
    },
    async persistRelationshipAuthority(state) {
      events.push("persist:" + state.seed);
    },
    async processSocialOutbox(state) {
      outboxInput = state;
      events.push("outbox");
      saved.name = "After outbox";
      saved.seed = "after-outbox";
      return true;
    },
    reconcileSocialPlans(state) {
      events.push("social:" + state.seed);
    },
    projectSocialActivities(state) {
      events.push("project:" + state.seed);
    },
  };
  let captures = 0;
  const service = createVillageStateService(repository, () => {
    captures++;
    return relationships;
  });
  assert.equal(captures, 0, "construction does not resolve relationship or storage collaborators");
  await service.readVillageAuthority();
  assert.deepEqual(events, ["read:initial"], "raw authority does not hydrate or apply an outbox");
  events.length = 0;
  await service.readVillageSnapshot();
  assert.deepEqual(events, ["read:initial", "relationships:initial", "reconcile:initial"]);
  assert.equal(outboxInput, undefined, "a feed snapshot remains read-only");

  events.length = 0;
  captures = 0;
  const refreshed = await service.readVillageState();
  assert.equal(refreshed, outboxInput, "refresh updates the original hydrated object after outbox settlement");
  assert.equal(refreshed.name, "After outbox");
  assert.equal(refreshed.relationshipContext!.seed, "after-outbox");
  assert.equal(captures, 3, "the original separate collaboration captures stay at their call positions");
  assert.deepEqual(events, [
    "read:initial",
    "relationships:initial",
    "reconcile:initial",
    "outbox",
    "read:after-outbox",
    "relationships:after-outbox",
    "reconcile:after-outbox",
    "social:after-outbox",
    "project:after-outbox",
  ]);

  events.length = 0;
  saved = { ...defaultVillageState(), seed: "initial" };
  const result = await service.mutateVillageState((state) => {
    events.push("edit:" + state.seed);
    state.name = "Updated";
  });
  assert.equal(result.seed, "replacement");
  assert.deepEqual(events, [
    "attempt:initial",
    "relationships:initial",
    "reconcile:initial",
    "edit:initial",
    "attempt:replacement",
    "relationships:replacement",
    "reconcile:replacement",
    "edit:replacement",
    "commit:replacement",
    "persist:replacement",
  ]);
  assert.equal(result, saved, "only the successful attempt is returned and sent to relationship persistence");

  const persistenceError = new Error("Relationship save failed");
  relationships.persistRelationshipAuthority = async () => {
    throw persistenceError;
  };
  await assert.rejects(
    () =>
      service.mutateVillageState((state) => {
        state.name = "Committed before failure";
      }),
    (error) => error === persistenceError,
  );
  assert.equal(
    saved.name,
    "Committed before failure",
    "post-commit errors remain errors without changing rollback semantics",
  );

  const firstRecord = { id: "villages-village", revision: 1, data: { ...defaultVillageState(), seed: "first" } };
  const secondRecord = { id: "villages-village", revision: 1, data: { ...defaultVillageState(), seed: "second" } };
  let firstWrites = 0,
    secondWrites = 0,
    accesses = 0;
  let selected: CapabilityDocumentStore;
  const firstDocuments = {
    async getById() {
      selected = secondDocuments;
      return structuredClone(firstRecord);
    },
    async update(change: { data: VillageState }) {
      firstWrites++;
      if (firstWrites === 1) {
        firstRecord.revision++;
        return null;
      }
      firstRecord.data = structuredClone(change.data);
      return firstRecord;
    },
  } as unknown as CapabilityDocumentStore;
  const secondDocuments = {
    async getById() {
      return structuredClone(secondRecord);
    },
    async update() {
      secondWrites++;
      return secondRecord;
    },
  } as unknown as CapabilityDocumentStore;
  selected = firstDocuments;
  const raw = createVillageRepository(() => {
    accesses++;
    return selected;
  });
  assert.equal(accesses, 0, "the repository does not capture a runtime at construction");
  await raw.mutateAuthority((state) => {
    state.name = "First written";
  });
  assert.equal(accesses, 1, "one operation retains its document store across retries even after accessor replacement");
  assert.equal(firstWrites, 2);
  assert.equal(secondWrites, 0);
  assert.equal(firstRecord.data.name, "First written");
  assert.equal((await raw.readAuthority()).seed, "second", "the next operation resolves the accessor anew");
  console.log(
    "State service read-only hydration, outbox refresh, retry baselines, post-commit failures and storage capture passed.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
