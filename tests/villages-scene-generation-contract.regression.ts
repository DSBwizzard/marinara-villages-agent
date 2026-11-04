import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { assertCurrentSceneGeneration } from "../packages/villages/src/server/domain/rules/scene-writing-contract.js";
import { createSceneWriting } from "../packages/villages/src/server/features/scenes/writing-service.js";
import { createSceneCommands } from "../packages/villages/src/server/features/scenes/command-service.js";

const current = {
  writingContractVersion: 3,
  semanticPipelineVersion: 3,
  residentActionsVersion: 2,
  interactionScopeVersion: 6,
};
const scene = coerceSession({
  version: 3,
  semanticVersion: 2,
  id: "retained-scene",
  villageSeed: "world13",
  placeId: "venue",
  zoneId: "exterior",
  status: "active",
  startedAt: "2026-10-31T12:00:00.000Z",
  participants: [],
  activeIds: [],
  lines: [{ id: "paid-line", role: "assistant", kind: "narration", content: "Exact retained café 東京.", heardBy: [] }],
  submissions: [],
});
assertCurrentSceneGeneration(scene, current, "chat");
assertCurrentSceneGeneration(scene, { ...current, interactionScopeVersion: undefined }, "greet");

for (const [field, values] of [
  ["writingContractVersion", [undefined, 1, 2, "3"]],
  ["semanticPipelineVersion", [undefined, 2, "3"]],
  ["residentActionsVersion", [undefined, 1, "2"]],
  ["interactionScopeVersion", [undefined, 1, 2, 3, 4, 5, "6", 7]],
  ["semanticVersion", [undefined]],
] as const)
  for (const value of values) {
    const source = structuredClone(scene);
    const input = { ...current, sceneBoundaryVersion: 1 } as Record<string, unknown>;
    if (field === "semanticVersion") delete source.semanticVersion;
    else input[field] = value;
    const requestKey = createHash("sha256")
      .update(JSON.stringify([source.id, "chat", "A reply"]))
      .digest("hex");
    const retained: Record<string, unknown> = {
      "scene-boundary-replacement": { requestKey, outcome: "halt-world" },
      ["writing-completion:" + requestKey]: { content: "Exact paid response", finishReason: "stop" },
      "turn-reply": { contactRelay: { targetId: "absent" } },
      "contact-response": { content: "Exact retained remote response" },
    };
    const before = JSON.stringify({ source, retained });
    let hostWork = 0;
    const forbidden = () => {
      hostWork++;
      throw Error("Retired generation reached host work");
    };
    const writer = createSceneWriting({
      venueOperationInput: () => input,
      venueSavedCheckpoint: (key: string) => retained[key],
      measurePipeline: async (_label: unknown, _metadata: unknown, work: () => unknown) => work(),
      sceneNarrative: { retire: forbidden },
      rejectVenueCompletion: forbidden,
      readVillageState: forbidden,
      completeWithRoom: forbidden,
      semantic: { preflight: forbidden, exchange: forbidden },
    } as any);
    await assert.rejects(
      writer.generate(source, "A reply", "chat", "", null),
      (error: any) => error.statusCode === 409,
    );
    await assert.rejects(
      writer.prepareVenueTurnMessages(source, "A reply", "chat", "", null),
      (error: any) => error.statusCode === 409,
    );
    assert.equal(hostWork, 0, `${field}:${value} cannot purchase, reinterpret or invalidate a paid draft`);
    assert.equal(
      JSON.stringify({ source, retained }),
      before,
      "Rejected generation preserves exact history and responses",
    );
    assert.equal(coerceSession(source).lines[0].content, source.lines[0].content, "History remains readable");
    const submission = {
      sessionId: source.id,
      submissionId: "retained",
      message: "A reply",
      mode: "chat" as const,
      targetId: "",
    };
    const commands = createSceneCommands({
      readSession: async () => source,
      requireLiveVenueSession: async () => source,
      sceneWork: () => ({ isMoving: () => false }),
      venueOperationInput: () => input,
      coordinateVenue: async (...args: any[]) => args[6](),
      readVillageState: forbidden,
    } as any);
    source.operation = { id: submission.submissionId, input } as any;
    const beforeCommand = JSON.stringify({ source, retained });
    await assert.rejects(commands.sendVenueTurn(submission), (error: any) => error.statusCode === 409);
    assert.equal(hostWork, 0, "The command refuses obsolete admissions before model or world work");
    assert.equal(JSON.stringify({ source, retained }), beforeCommand);
  }
{
  const source = structuredClone(scene);
  delete source.semanticVersion;
  const input = { message: "A reply", mode: "chat" as const, targetId: "" };
  source.operation = { id: "committed", input } as any;
  source.submissions = [
    {
      id: "committed",
      ...input,
      movement: {
        operationId: "move",
        originZoneId: "old",
        destinationZoneId: "exterior",
        transitionLineId: "paid-line",
      },
    },
  ] as any;
  const forbidden = () => assert.fail("Committed replay cannot reach generation or world work");
  const commands = createSceneCommands({
    readSession: async () => source,
    runtimeDebug() {},
    sceneWork: () => ({ isMoving: () => false }),
    venueOperationInput: () => input,
    coordinateVenue: async (...args: any[]) => args[6](),
    readVillageState: forbidden,
    generate: forbidden,
  } as any);
  const before = JSON.stringify(source);
  const replayed = await commands.sendVenueTurn({ sessionId: source.id, submissionId: "committed", ...input });
  assert.equal(replayed.session, source);
  assert.equal(JSON.stringify(source), before, "Committed old history replays before the generation guard");
}
console.log("Current Scene generation rejects retired contracts before purchases or paid-draft replacement.");
