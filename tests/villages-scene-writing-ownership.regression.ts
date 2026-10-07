import assert from "node:assert/strict";
import {
  createSceneWriting,
  type SceneWritingPorts,
} from "../packages/villages/src/server/features/scenes/writing-service.js";
import {
  configureSceneWriting,
  generate,
  prepareVenueTurnMessages,
} from "../packages/villages/src/server/features/scenes/writing.js";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { readEffectiveVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { wishFingerprint } from "../packages/villages/src/server/features/residents/wishes/wish-interpretation.js";
const stamp = "2026-10-07T12:00:00.000Z";
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
}
function fixture(label: string) {
  const world = defaultVillageState();
  world.seed = "same-seed";
  world.name = label;
  world.foundedAt = world.setupAt = stamp;
  const scene = coerceSession({
    id: "same-scene",
    placeId: "same-place",
    placeName: "Common room",
    area: "public",
    status: "active",
    startedAt: stamp,
    zoneId: "exterior",
    villageSeed: world.seed,
    participants: [],
    activeIds: [],
    lines: [],
    submissions: [],
  });
  const calls: string[] = [],
    owners: unknown[] = [];
  const entered = deferred(),
    gate = deferred();
  const exact = new Error(label + " exact failure");
  let paused = "",
    failure = "",
    usedPause = false,
    guardDisposed = false,
    brokenReply = false;
  const owner = createActivationScope();
  async function touch(stage: string) {
    calls.push(stage);
    owners.push(scopedActivation());
    if (guardDisposed && !owner.active) throw exact;
    if (stage === failure) throw exact;
    if (stage === paused && !usedPause) {
      usedPause = true;
      entered.resolve();
      await gate.promise;
      if (guardDisposed && !owner.active) throw exact;
    }
  }
  type Model = Awaited<ReturnType<ReturnType<SceneWritingPorts["villagesLanguageModels"]>["resolveForRequest"]>>;
  const model: Model = {
    name: label,
    model: label,
    connectionId: label,
    maxContext: 100000,
    maxOutputTokens: 2000,
    chatComplete: async () => assert.fail("Only the injected completion port may request a reply"),
    fitContext(messages, options) {
      calls.push("fit");
      owners.push(scopedActivation());
      return {
        messages,
        maxTokens: options?.maxTokens,
        estimatedTokensBefore: 10,
        estimatedTokensAfter: 10,
        trimmed: false,
      };
    },
  };
  const ports: SceneWritingPorts = {
    readVillageState: async () => {
      await touch("world");
      return world;
    },
    villagesConnectionIdFor: async (purpose) => {
      assert.equal(purpose, "narration");
      await touch("connection");
      return label;
    },
    readVillageLore: async () => {
      await touch("lore");
      return [label + " lore"];
    },
    villagesLanguageModels: () => ({
      resolveForRequest: async (request) => {
        assert.equal(request.connectionId, label);
        await touch("model");
        return model;
      },
    }),
    readEffectiveVillagerCard,
    wishFingerprint,
    villagesLogger: () => ({
      warn: () => {
        calls.push("warning");
      },
    }),
    measurePipeline: async (_name, _tags, run) => {
      calls.push("pipeline");
      return run();
    },
    runtimeDebug: () => {
      calls.push("debug");
    },
    venueOperationId: () => label + " operation",
    venueOperationInput: () => ({ interactionScopeVersion: 1 }),
    venueOperationSignal: () => undefined,
    rejectVenueCompletion: async () => {
      calls.push("reject");
    },
    completeWithRoom: async (selected, _messages, _tokens, options) => {
      assert.equal(selected, model);
      assert.equal(options.retryEmpty, false);
      assert.equal(options.usagePurpose, "conversation");
      assert.equal(options.temperature, 0.85);
      await touch("completion");
      return {
        content: brokenReply
          ? "invalid"
          : JSON.stringify({
              segments: [{ kind: "narration", text: label + " room remains quiet." }],
              heardPlayerBy: [],
              wishChanges: [],
              memoryChanges: [],
              relationshipChanges: { changes: [], permissions: [], disclosures: [] },
            }),
        finishReason: "stop",
      };
    },
    refreshZoneParticipants: async (selected) => {
      assert.equal(selected, scene);
      await touch("refresh");
      return scene;
    },
    interpretRoomReply: async (selected, current) => {
      assert.equal(selected, scene);
      assert.equal(current, world);
      await touch("interpretation");
      return null;
    },
  };
  const service = createSceneWriting(ports);
  return {
    world,
    scene,
    calls,
    owners,
    owner,
    service,
    entered,
    gate,
    exact,
    pause(stage: string) {
      paused = stage;
    },
    fail(stage: string) {
      failure = stage;
    },
    guardDisposal() {
      guardDisposed = true;
    },
    invalidReply() {
      brokenReply = true;
    },
    run() {
      return service.generate(scene, "I wait.", "chat", "", null);
    },
  };
}
const direct = fixture("A");
assert.deepEqual(direct.calls, [], "constructing the service starts no work");
const prompt = await direct.service.prepareVenueTurnMessages(direct.scene, "I wait.", "chat", "", null);
assert.equal(prompt.model.model, "A");
assert.equal(prompt.village, direct.world);
assert.equal(prompt.maxTokens, 2000);
assert.ok(prompt.fitted.messages[0].content.includes("A lore"));
assert.equal(direct.calls.includes("completion"), false, "prompt fitting requests no completion");
assert.equal(direct.calls.includes("interpretation"), false);
const complete = fixture("A");
const reply = await complete.run();
assert.equal(reply.lines[0]?.content, "A room remains quiet.");
assert.equal(reply.roomInterpretation, null);
assert.equal(complete.calls.filter((x) => x === "completion").length, 1);
assert.equal(complete.calls.filter((x) => x === "interpretation").length, 1);
for (const stage of ["world", "connection", "lore", "model", "completion", "refresh", "interpretation"]) {
  const failed = fixture("failed");
  failed.fail(stage);
  await assert.rejects(failed.run(), (error) => error === failed.exact);
  assert.ok(
    failed.calls.filter((x) => x === "completion").length <= 1,
    "connection errors do not repeat model spending",
  );
}
const invalid = fixture("invalid");
invalid.invalidReply();
await assert.rejects(invalid.run(), /failed validation/);
assert.equal(
  invalid.calls.filter((x) => x === "completion").length,
  1,
  "parser rejection never automatically repairs with another request",
);
assert.equal(invalid.calls.includes("interpretation"), false);
const aborted = fixture("aborted");
const controller = new AbortController();
controller.abort(aborted.exact);
await assert.rejects(
  aborted.service.prepareVenueTurnMessages(aborted.scene, "I wait.", "chat", "", null, controller.signal),
  (error) => error === aborted.exact,
);
assert.equal(aborted.calls.includes("model"), false);
assert.equal(aborted.calls.includes("completion"), false);

for (const stage of ["world", "connection", "lore", "model", "completion", "refresh", "interpretation"]) {
  const a = fixture("A"),
    b = fixture("B");
  a.pause(stage);
  const clearA = installDefaultActivation(a.owner, () => {});
  const releaseA = a.owner.run(() => configureSceneWriting(a.service));
  const pending = generate(a.scene, "I wait.", "chat", "", null);
  await a.entered.promise;
  const clearB = installDefaultActivation(b.owner, () => {});
  const releaseB = b.owner.run(() => configureSceneWriting(b.service));
  releaseA();
  clearA();
  const current = await generate(b.scene, "I wait.", "chat", "", null);
  assert.equal(current.lines[0]?.content, "B room remains quiet.");
  a.gate.resolve();
  const old = await pending;
  assert.equal(old.lines[0]?.content, "A room remains quiet.");
  assert.ok(
    a.owners.every((owner) => owner === a.owner),
    stage + " retains A scope",
  );
  assert.ok(
    b.owners.every((owner) => owner === b.owner),
    stage + " retains B scope",
  );
  assert.equal(a.calls.filter((x) => x === "completion").length, 1);
  assert.equal(b.calls.filter((x) => x === "completion").length, 1);
  assert.equal(
    (await prepareVenueTurnMessages(b.scene, "I wait.", "chat", "", null)).model.model,
    "B",
    "old cleanup cannot remove the new binding",
  );
  releaseB();
  clearB();
  a.owner.dispose();
  b.owner.dispose();
}
const disposed = fixture("disposed"),
  replacement = fixture("replacement");
disposed.pause("world");
disposed.guardDisposal();
const clearDisposed = installDefaultActivation(disposed.owner, () => {}),
  releaseDisposed = disposed.owner.run(() => configureSceneWriting(disposed.service));
const pending = generate(disposed.scene, "I wait.", "chat", "", null);
await disposed.entered.promise;
disposed.owner.dispose();
const clearReplacement = installDefaultActivation(replacement.owner, () => {}),
  releaseReplacement = replacement.owner.run(() => configureSceneWriting(replacement.service));
disposed.gate.resolve();
await assert.rejects(pending, (error) => error === disposed.exact);
assert.equal(disposed.calls.includes("completion"), false);
assert.deepEqual(replacement.calls, [], "disposed originating guard never borrows the replacement");
releaseDisposed();
clearDisposed();
releaseReplacement();
clearReplacement();
replacement.owner.dispose();
await assert.rejects(generate(replacement.scene, "I wait.", "chat", "", null), /not configured/);
console.log(
  "Scene writing ownership passed: inert fitting, exact errors, bounded mocked spending, paused connections, actual scopes and guarded disposal; no Engine or paid providers.",
);
