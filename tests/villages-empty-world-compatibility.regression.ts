import assert from "node:assert/strict";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";

// Fresh-world contract: neither an empty setup nor a played old world is converted.
for (const version of [0, 5, 6, 7, 8, 9, 10, 11, 12]) {
  for (const played of [false, true]) {
    const state = {
      ...defaultVillageState(),
      version,
      name: "Saved draft",
      seed: "original",
      selectedLorebookIds: ["test-book"],
      setupAt: played ? "2026-10-26T12:00:00Z" : "",
    };
    const before = structuredClone(state);
    assert.throws(() => coerceVillageState(state), /Unsupported Village format/);
    assert.deepEqual(state, before);
    const { memories: _memories, memoryScenes: _scenes, memoryReceipts: _receipts, ...root } = state;
    const record = {
      id: "villages-village",
      packageId: "villages",
      kind: "village",
      revision: 7,
      data: { ...root, memoryHead: null },
    };
    const saved = structuredClone(record);
    let writes = 0;
    const repository = createVillageRepository(
      () =>
        ({
          getById: async () => structuredClone(record),
          update: async () => {
            writes++;
            throw Error("Must not rewrite incompatible data");
          },
        }) as any,
    );
    await assert.rejects(() => repository.readAuthority(), /Unsupported Village format/);
    await assert.rejects(() => repository.mutateAuthority(() => {}), /Unsupported Village format/);
    assert.equal(writes, 0);
    assert.deepEqual(record, saved);
  }
}
assert.equal(coerceVillageState(undefined).version, 13);
const fresh = coerceVillageState(defaultVillageState());
assert.deepEqual(coerceVillageState(JSON.parse(JSON.stringify(fresh))), fresh);
console.log("Fresh worlds reload; incompatible setup and played worlds remain untouched.");
