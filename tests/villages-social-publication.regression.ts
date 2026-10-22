import assert from "node:assert/strict";
import { createSceneCommands } from "../packages/villages/src/server/features/scenes/command-service.js";
import { createSceneChanges } from "../packages/villages/src/server/features/scenes/changes-service.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
const village = defaultVillageState();
village.seed = "publication";
let scene = coerceSession({
  id: "scene",
  villageSeed: village.seed,
  status: "active",
  lines: [],
  submissions: [
    {
      id: "source",
      at: new Date().toISOString(),
      semanticProvenance: {
        version: 2,
        sourceHash: "meaning",
        authority: { social: false, physical: false, access: false, projects: false, standing: false },
      },
    },
  ],
});
let failScene = true,
  failWorld = false,
  worldWrites = 0;
const read = async () => structuredClone(village),
  readSession = async () => structuredClone(scene);
const mutate = async (update: any) => {
  if (failWorld) {
    failWorld = false;
    throw Error("World publication write failed");
  }
  const next = structuredClone(village);
  update(next);
  Object.assign(village, next);
  worldWrites++;
  return read();
};
const commands = createSceneCommands({
  readSession,
  readVillageState: read,
  mutateVillageState: mutate,
  changeSession: async (_id: string, update: any) => {
    if (failScene) {
      failScene = false;
      throw Error("Scene acknowledgement failed");
    }
    const next = structuredClone(scene);
    update(next);
    scene = next;
    return readSession();
  },
} as any);
await assert.rejects(() => commands.finishSemanticScene(scene.id), /Scene acknowledgement failed/);
assert.equal(village.socialPublications?.["scene:source"], undefined);
assert.equal(worldWrites, 0);
assert(!scene.submissions[0]!.semanticReady, "Failed transcript publication cannot reveal notebook knowledge");
failWorld = true;
await assert.rejects(() => commands.finishSemanticScene(scene.id), /World publication write failed/);
assert.equal(scene.submissions[0]!.semanticReady, true);
assert.equal(village.socialPublications?.["scene:source"], undefined);
const changes = createSceneChanges({
  readSession,
  readVillageSnapshot: read,
  readVillageState: read,
  mutateVillageState: mutate,
  finishSemanticScene: commands.finishSemanticScene,
  processSavedExchange: () => assert.fail("Already-applied effects must not replay"),
  villagesDocuments: () => ({ list: async () => [] }),
  venueRequestMetrics: () => [],
} as any);
await changes.replaySceneChanges(scene.id);
assert.equal(
  village.socialPublications?.["scene:source"],
  true,
  "Explicit replay repairs a lost knowledge acknowledgement after the source is ready",
);
const after = worldWrites;
await changes.replaySceneChanges(scene.id);
assert.equal(worldWrites, after, "Published source replay is a read-only no-op");
console.log("Social publication: failed transcript ack, lost knowledge ack and explicit local replay passed.");
