import assert from "node:assert/strict";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";

const legacy = {
  ...defaultVillageState(),
  version: 5,
  name: "Saved draft",
  setting: "A seaside village",
  selectedLorebookIds: ["test-book"],
  foundedAt: "2026-10-26T12:00:00Z",
  seed: "existing-seed",
  venueMail: [],
  projectWishOutbox: [],
  sceneWishProtections: {},
  wishRefillIntents: {},
};
const before = structuredClone(legacy);
const expected = structuredClone(legacy) as Record<string, unknown>;
expected.version = 6;
for (const key of ["venueMail", "projectWishOutbox", "sceneWishProtections", "wishRefillIntents"]) delete expected[key];
assert.deepEqual(coerceVillageState(legacy), coerceVillageState(expected));
assert.deepEqual(legacy, before, "Compatibility reads do not rewrite saved data");
for (const patch of [
  { setupAt: "2026-10-26T12:00:00Z" },
  { villagers: [{}] },
  { venues: [{}] },
  { projects: [{}] },
  { venueMail: [{}] },
  { projectWishOutbox: [{}] },
  { sceneWishProtections: { scene: {} } },
  { wishRefillIntents: { wish: {} } },
  { development: {} },
  { foundingPreparation: {} },
  { opening: {} },
  { socialOutbox: [{}] },
  { backgroundReceipts: { request: {} } },
  { exchangeReceipts: { request: {} } },
  { semanticRequestReceipts: { request: "saved" } },
  { memoryHead: {} },
  { memoryScenes: { scene: {} } },
  { memories: { format: 1, revision: 1, records: [] } },
  { projects: {} },
  { venueMail: "[]" },
  { sceneWishProtections: [] },
]) {
  assert.throws(() => coerceVillageState({ ...legacy, ...patch }), /Unsupported Village format/);
}
const { memories: _memories, memoryScenes: _scenes, memoryReceipts: _receipts, ...root } = legacy;
let record: any = {
  id: "villages-village",
  packageId: "villages",
  kind: "village",
  revision: 7,
  data: { ...root, memoryHead: null },
};
const original = structuredClone(record);
let writes = 0;
const store: any = {
  getById: async (_package: string, id: string) => (id === record.id ? structuredClone(record) : null),
  list: async () => [],
  update: async (input: any) => {
    assert.equal(input.expectedRevision, record.revision);
    writes++;
    record = { ...record, ...structuredClone(input), revision: record.revision + 1 };
    return structuredClone(record);
  },
};
const repository = createVillageRepository(() => store);
assert.equal((await repository.readAuthority()).version, 6);
assert.deepEqual(record, original, "The real root reader also preserves the v5 record");
assert.equal(writes, 0);
await repository.mutateAuthority(() => {});
assert.equal(record.data.version, 6, "Only an ordinary checked mutation persists the current format");
assert.equal(record.data.seed, legacy.seed);
assert.deepEqual(record.data.selectedLorebookIds, ["test-book"]);
assert.equal(record.revision, 8);
assert.equal(writes, 1);
record.data = { ...original.data, venueMail: [{ id: "saved-mail" }] };
await assert.rejects(repository.readAuthority(), /Unsupported Village format/);
assert.equal(writes, 1, "Rejected played/retired data is never rewritten");
console.log(
  "Empty legacy Village settings survive read and CAS save; played, retired and malformed state remains protected.",
);
