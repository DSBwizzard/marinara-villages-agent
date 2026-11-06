import assert from "node:assert/strict";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { assertCurrentSceneGeneration } from "../packages/villages/src/server/domain/rules/scene-writing-contract.js";
import { createSceneWriting } from "../packages/villages/src/server/features/scenes/writing-service.js";

const scene = coerceSession({
  version: 4,
  id: "current",
  villageSeed: "current-village",
  semanticVersion: 2,
  status: "active",
  startedAt: "2026-11-01T12:00:00.000Z",
  participants: [],
  lines: [{ id: "paid-line", role: "assistant", kind: "narration", content: "Exact retained café 東京.", heardBy: [] }],
  submissions: [],
});
assertCurrentSceneGeneration(scene);
for (const source of [
  { ...scene, villageSeed: undefined },
  { ...scene, semanticVersion: undefined },
])
  assert.throws(() => assertCurrentSceneGeneration(source as any), /Unsupported Scene format/);
for (const version of [undefined, 1, 2, 3, "4", 5]) {
  const source = { ...structuredClone(scene), version };
  const retained = { content: "Exact paid response", finishReason: "stop" };
  const before = JSON.stringify({ source, retained });
  assert.throws(() => coerceSession(source), /Unsupported Scene format/);
  let hostWork = 0;
  const forbidden = () => {
    hostWork++;
    throw Error("Unsupported Scene reached host work");
  };
  const writer = createSceneWriting({
    venueSavedCheckpoint: () => retained,
    measurePipeline: async (_label: unknown, _metadata: unknown, work: () => unknown) => work(),
    sceneNarrative: { retire: forbidden },
    rejectVenueCompletion: forbidden,
    readVillageState: forbidden,
    completeWithRoom: forbidden,
    semantic: { exchange: forbidden },
  } as any);
  await assert.rejects(
    writer.generate(source as any, "A reply", "chat", "", null),
    (error: any) => error.statusCode === 409,
  );
  await assert.rejects(
    writer.prepareVenueTurnMessages(source as any, "A reply", "chat", "", null),
    (error: any) => error.statusCode === 409,
  );
  assert.equal(hostWork, 0, "Unsupported Scenes cannot purchase or replace retained responses");
  assert.equal(JSON.stringify({ source, retained }), before);
}
console.log("Current Scene format rejects unsupported sources before purchases or paid-response replacement.");
