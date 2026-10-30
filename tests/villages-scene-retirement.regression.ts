// Test cases: scene-retirement/eligibility, scene-retirement/project-evidence, scene-retirement/project-citations, scene-retirement/evidence-window, scene-retirement/terminal, scene-retirement/operation-status, scene-retirement/notice-dismissal, scene-retirement/publication, scene-retirement/restart-cleanup, scene-retirement/fence
import assert from "node:assert/strict";
import { authorSceneFixture } from "./helpers/village-storage.fixture.js";
import { createHash } from "node:crypto";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import {
  sceneReadyForRetirement,
  sceneRetirementSourceIsValid,
} from "../packages/villages/src/server/domain/rules/scene-retirement.js";
import type { VenueSubmission } from "../packages/villages/src/server/domain/models/scene-model.js";
import { projectSceneEvidence } from "../packages/villages/src/server/domain/rules/project-scene-evidence.js";
import { createProjectEvidenceIndex } from "../packages/villages/src/server/features/scenes/project-evidence-index.js";
import { terminalForScene } from "../packages/villages/src/server/features/scenes/scene-terminal.js";
import { createSceneRetirement } from "../packages/villages/src/server/features/scenes/scene-retirement-service.js";
import { createVenueCoordinator } from "../packages/villages/src/server/jobs/venue-coordinator-service.js";
import { createSceneChanges } from "../packages/villages/src/server/features/scenes/changes-service.js";
import { notFound } from "../packages/villages/src/server/domain/rules/errors.js";
import { createSceneWorkFence } from "../packages/villages/src/server/jobs/scene-work-fence.js";
import { validateProjectSpeech } from "../packages/villages/src/server/domain/rules/project-interpretation.js";

await runCase("scene-retirement/eligibility", () => {
  const world = defaultVillageState();
  world.seed = "test-village";
  const closed = coerceSession({ version: 3, id: "scene", villageSeed: world.seed, status: "closed" });
  assert.equal(sceneRetirementSourceIsValid(closed), true);
  assert.equal(
    sceneRetirementSourceIsValid({ ...closed, submissions: [{ id: "turn", processing: { version: 99 } }] }),
    false,
  );
  assert.equal(sceneRetirementSourceIsValid({ ...closed, lines: null }), false);
  assert.equal(sceneRetirementSourceIsValid({ ...closed, lines: [{ id: "line" }] }), false);
  for (const bad of [
    { delivery: "unknown" },
    { contactHidden: "yes" },
    { soundOnly: { player: true } },
    { targetId: 42 },
  ])
    assert.equal(
      sceneRetirementSourceIsValid({
        ...closed,
        lines: [{ id: "line", content: "private", role: "assistant", ...bad }],
      }),
      false,
    );
  assert.equal(sceneRetirementSourceIsValid({ ...closed, submissions: [{ id: "t", at: "invalid" }] }), false);
  assert.equal(
    sceneRetirementSourceIsValid({
      ...closed,
      submissions: [
        { id: "t", at: "2026-01-01" },
        { id: "t", at: "2026-01-01" },
      ],
    }),
    false,
  );
  assert.equal(
    sceneRetirementSourceIsValid({
      ...closed,
      submissions: [{ id: "t", at: "2026-01-01", openingSignal: { kind: "unknown" } }],
    }),
    false,
  );
  assert.equal(sceneReadyForRetirement(closed, world, ""), true);
  assert.equal(sceneReadyForRetirement(closed, world, closed.id), false);
  assert.equal(sceneReadyForRetirement({ ...closed, status: "active" }, world, ""), false);
  assert.equal(sceneReadyForRetirement({ ...closed, villageSeed: "other" }, world, ""), false);
  const processing = createExchangeProcessing({
    seed: world.seed,
    sceneId: closed.id,
    submissionId: "turn",
    order: 0,
    lineIds: [],
    actionReceiptIds: [],
  });
  const turn: VenueSubmission = {
    id: "turn",
    message: "saved",
    mode: "chat",
    targetId: "",
    verdict: null,
    wishId: "",
    wishMemory: "",
    at: "2026-10-27T12:00:00.000Z",
    processing,
  };
  assert.equal(sceneReadyForRetirement({ ...closed, submissions: [turn] }, world, ""), false);
  for (const domain of Object.values(processing.domains)) domain.status = "applied";
  assert.equal(sceneReadyForRetirement({ ...closed, submissions: [turn] }, world, ""), false);
  turn.progressProcessedAt = "2026-10-27T12:00:01.000Z";
  assert.equal(sceneReadyForRetirement({ ...closed, submissions: [turn] }, world, ""), true);
});

await runCase("scene-retirement/project-evidence", () => {
  const stamp = "2026-10-27T12:00:00.000Z";
  const scene = coerceSession({
    version: 3,
    id: "scene",
    villageSeed: "world",
    status: "closed",
    startedAt: stamp,
    participants: [{ characterId: "resident", name: "Resident", doing: "Talking" }],
    lines: [
      {
        id: "public",
        speakerId: "resident",
        name: "Resident",
        role: "assistant",
        kind: "dialogue",
        at: stamp,
        content: "I will lead the work.",
        heardBy: ["player"],
      },
      {
        id: "private",
        speakerId: "resident",
        name: "Resident",
        role: "assistant",
        kind: "dialogue",
        at: stamp,
        content: "Secret words",
        contactHidden: true,
        heardBy: ["resident"],
      },
      {
        id: "narration",
        speakerId: "narrator",
        role: "assistant",
        kind: "narration",
        at: stamp,
        content: "The entire transcript is not evidence.",
      },
    ],
    submissions: [
      {
        id: "turn",
        mode: "chat",
        at: stamp,
        message: "Player's private input",
        activeIdsAtTurn: ["resident"],
        replyLineIds: ["public", "private", "narration"],
        projectContexts: [{ projectId: "p", revision: 1, phase: "planning" }],
        projectSpeech: [
          {
            version: 1,
            projectId: "p",
            revision: 1,
            phase: "planning",
            kind: "builder",
            speakerId: "resident",
            citations: [{ lineId: "public", quote: "I will lead" }],
          },
        ],
      },
    ],
  });
  const result = projectSceneEvidence(scene);
  assert.deepEqual(
    result.lines.map((line) => line.id),
    ["public"],
  );
  assert.equal(result.submissions[0].projectSpeech?.[0].citations[0].quote, "I will lead");
  assert.ok(!JSON.stringify(result).includes("Player's private input"));
  assert.ok(!JSON.stringify(result).includes("Secret words"));
  assert.ok(!JSON.stringify(result).includes("entire transcript"));
});

await runCase("scene-retirement/project-citations", () => {
  const stamp = "2026-10-27T12:00:00.000Z";
  const lines = Array.from({ length: 81 }, (_, i) => ({
    id: `line-${i}`,
    role: "assistant",
    kind: "dialogue",
    speakerId: "resident",
    name: "Resident",
    at: stamp,
    content: i === 80 ? "I’ll lead the work and I agree to the plan." : `Line ${i}`,
  }));
  const scene = coerceSession({
    version: 3,
    id: "scene",
    villageSeed: "world",
    status: "closed",
    startedAt: stamp,
    participants: [{ characterId: "resident", name: "Resident", doing: "Talking" }],
    lines,
    submissions: [
      {
        id: "turn",
        mode: "chat",
        at: stamp,
        activeIdsAtTurn: ["resident"],
        replyLineIds: lines.map((line) => line.id),
        projectContexts: [{ projectId: "p", revision: 1, phase: "planning" }],
        projectSpeech: [
          {
            version: 1,
            projectId: "p",
            revision: 1,
            phase: "planning",
            kind: "builder",
            speakerId: "resident",
            citations: [{ lineId: "line-80", quote: "I'LL LEAD THE WORK" }],
          },
          {
            version: 1,
            projectId: "p",
            revision: 1,
            phase: "planning",
            kind: "approval",
            speakerId: "resident",
            citations: [{ lineId: "line-80", quote: "agree to the plan" }],
            contextual: { version: 1, source: "system", checkId: "check" },
          },
        ],
      },
    ],
  });
  const saved = projectSceneEvidence(scene);
  assert.equal(saved.lines.length, 81);
  for (const proposal of saved.submissions[0].projectSpeech ?? [])
    assert.equal(validateProjectSpeech(proposal, saved.lines), "");
  assert.equal(saved.lines.find((line) => line.id === "line-80")?.content, lines[80].content);
});

await runCase("scene-retirement/evidence-window", async () => {
  let data: unknown;
  const index = createProjectEvidenceIndex({
    villagesDocuments: () => ({ getById: async () => (data ? ({ data } as never) : null) }),
    mutateDocument: async (_id, slot, mutate) => {
      const current = slot.coerce(data);
      await mutate(current);
      data = structuredClone(current);
    },
  });
  for (let i = 0; i < 25; i++) {
    const stamp = new Date(Date.UTC(2026, 9, 1 + i)).toISOString();
    await index.save(
      coerceSession({ version: 3, id: `s${i}`, villageSeed: "world", status: "closed", startedAt: stamp }),
      1,
    );
  }
  const scenes = await index.read("world");
  assert.equal(scenes.length, 20);
  assert.equal(scenes[0].id, "s24");
  assert.equal(scenes.at(-1)?.id, "s5");
  await index.save(
    coerceSession({ version: 3, id: "s24", villageSeed: "world", status: "closed", startedAt: scenes[0].startedAt }),
    3,
  );
  await assert.rejects(() => index.save(scenes[0], 2), /source changed/);
  assert.equal((await index.read("world"))[0].id, "s24");
  assert.deepEqual(await index.read("another-world"), []);
  await assert.rejects(
    () => index.save(coerceSession({ version: 3, id: "other", villageSeed: "another-world", status: "closed" }), 1),
    /Village changed/,
  );
  const corrupted = data as { scenes: { scene: { placeName: string } }[] };
  corrupted.scenes[0].scene.placeName = "corrupt";
  await assert.rejects(() => index.read("world"), /invalid/);
  await assert.rejects(() => index.save(scenes[1], 4), /invalid/);
});

await runCase("scene-retirement/terminal", () => {
  const scene = coerceSession({
    version: 3,
    id: "scene",
    villageSeed: "world",
    status: "closed",
    sceneRevision: 7,
    lines: [{ id: "a", content: "A private generated reply", role: "assistant" }],
    submissions: [{ id: "turn", mode: "chat", message: "A private player message", targetId: "person" }],
  });
  const receipt = terminalForScene(scene, 1);
  assert.deepEqual(
    receipt.submissions.map((turn) => turn.id),
    ["turn"],
  );
  assert.match(receipt.submissions[0].inputHash, /^[a-f0-9]{64}$/u);
  assert.ok(!JSON.stringify(receipt).includes("private"));
  const operation = {
    id: "close",
    kind: "close",
    input: {},
    token: "token",
    attemptId: "close-attempt",
    status: "complete" as const,
    stage: "complete",
    startedAt: "",
    sceneRevision: 7,
    snapshot: null,
    checkpoints: {
      "abandoned-request": { id: "old", kind: "turn", attemptId: "old-attempt", input: { message: "private" } },
    },
    attempts: {},
    error: "",
    optionalAttempts: { fingerprint: { status: "unknown" as const, elapsedMs: 10 } },
  };
  const world = defaultVillageState();
  world.seed = "world";
  assert.equal(sceneReadyForRetirement({ ...scene, operation }, world, ""), true);
  const terminal = terminalForScene({ ...scene, operation }, 2);
  assert.deepEqual(terminal.abandonedRequest, { id: "old", kind: "turn", attemptId: "old-attempt" });
  assert.equal(terminal.optionalAttempts?.fingerprint.status, "unknown");
  assert.ok(!JSON.stringify(terminal).includes("private"));
  assert.equal(
    sceneReadyForRetirement(
      {
        ...scene,
        operation: { ...operation, optionalAttempts: { fingerprint: { status: "dispatching", elapsedMs: 10 } } },
      },
      world,
      "",
    ),
    false,
  );
  assert.throws(() => terminalForScene({ ...scene, status: "active" }, 1), /not ready/);
  for (const mode of ["act", "fulfill", "leave", "contact"] as const) {
    const turn = {
      ...scene.submissions[0],
      id: mode,
      mode: mode === "act" || mode === "fulfill" ? ("chat" as const) : mode,
      requestMode: mode === "act" || mode === "fulfill" ? mode : undefined,
    };
    const hash = terminalForScene({ ...scene, submissions: [turn] }, 1).submissions[0].inputHash;
    assert.equal(
      hash,
      createHash("sha256")
        .update(JSON.stringify([mode, turn.message, turn.targetId, turn.contact ?? null]))
        .digest("hex"),
    );
  }
});

await runCase("scene-retirement/operation-status", async () => {
  const scene = coerceSession({
    version: 3,
    id: "scene",
    villageSeed: "world",
    status: "closed",
    submissions: [{ id: "turn", mode: "chat", message: "hello" }],
  });
  const terminal = terminalForScene(scene, 1);
  const coordinator = createVenueCoordinator({
    operations: { context: { getStore: () => undefined } },
    villagesDocuments: () => ({ getById: async () => null }),
    readTerminal: async () => terminal,
  } as never);
  assert.deepEqual(await coordinator.readVenueOperation("scene", "turn"), {
    id: "turn",
    status: "complete",
    kind: "turn",
    attemptId: "",
    terminal: true,
    recordEvents: [],
  });
  const unknown = await coordinator.readVenueOperation("scene", "missing");
  assert.equal(unknown?.status, "interrupted");
  assert.equal(unknown?.terminal, true);
});

await runCase("scene-retirement/notice-dismissal", async () => {
  const world = defaultVillageState();
  world.seed = "world";
  const scene = coerceSession({
    version: 3,
    id: "scene",
    villageSeed: "world",
    status: "closed",
    submissions: [
      { id: "turn", mode: "chat", message: "", recordEvents: [{ id: "notice", kind: "project", text: "Saved" }] },
    ],
  });
  const terminal = terminalForScene(scene, 1);
  const service = createSceneChanges({
    readSession: async () => {
      throw notFound("Scene removed");
    },
    readTerminal: async () => terminal,
    readVillageState: async () => world,
    mutateVillageState: async (update) => {
      update(world);
      return world;
    },
  } as never);
  assert.deepEqual(await service.dismissSceneNotice("scene", "notice"), { dismissed: true });
  assert.deepEqual(world.dismissedNoticeIds, ["notice"]);
  await assert.rejects(() => service.dismissSceneNotice("scene", "other"), /unavailable/);
  world.seed = "other";
  await assert.rejects(() => service.dismissSceneNotice("scene", "notice"), /identity changed/i);
});

await runCase("scene-retirement/publication", async () => {
  const world = defaultVillageState();
  world.seed = "world";
  const scene = coerceSession({ version: 3, id: "scene", villageSeed: "world", status: "closed" });
  const revision = 1;
  world.exchangeReceipts["venue-chat:scene:turn"] = {
    id: "venue-chat:scene:turn",
    sceneId: "scene",
    submissionId: "turn",
    domain: "physical",
    at: "2026-10-28T12:00:00.000Z",
    status: "applied",
    evidenceIds: [],
    reason: "Saved",
    physicalOutcome: {
      id: "venue-chat:scene:turn",
      venueId: "cafe",
      venueName: "Cafe",
      text: "Shelves installed",
      at: "2026-10-28T12:00:00.000Z",
    },
  };
  const proof = () => world.exchangeReceipts["venue-chat:scene:turn"];
  let present = true;
  let failEvidence = false;
  let active = "";
  let responsePresent = true;
  let sceneConflict = false;
  const calls: string[] = [];
  const service = createSceneRetirement({
    villagesDocuments: () => ({
      getById: async (_package, id) =>
        present && id === "villages-venue-visit-scene"
          ? ({ id, data: authorSceneFixture(new Map(), scene, world), revision } as never)
          : null,
      list: async (_package, kind) =>
        kind === "generation-response" && responsePresent
          ? [
              {
                id: "late",
                revision: 4,
                data: { signature: JSON.stringify(["scene", "turn", 1, { message: "private" }, "reply"]) },
              } as never,
            ]
          : [],
      update: async () => null,
      remove: async (_package, id, expected) => {
        if (id === "late") {
          calls.push("remove-late");
          if (expected !== 4) return false;
          responsePresent = false;
          return true;
        }
        calls.push("remove");
        if (sceneConflict || revision !== expected) return false;
        present = false;
        return true;
      },
    }),
    readActive: async () => ({ sessionId: active, placeId: "" }),
    readVillageState: async () => world,
    readVillageMemoryState: async () => world,
    mutateVillageMemoryState: async (update) => {
      update(world);
      return world;
    },
    hasVenueOperation: () => false,
    saveProjectEvidence: async () => {
      calls.push("evidence");
      if (failEvidence) throw new Error("storage");
    },
    saveTerminal: async () => {
      calls.push("receipt");
    },
    readTerminal: async () => null,
    withRepairWork: async (work) => work(),
    withSceneWork: async (_id, work) => work(),
    withLateResponseWork: async (_id, work) => work(),
    removeInterpretationDiagnostics: async () => {
      calls.push("diagnostics");
    },
  });
  active = "scene";
  assert.equal(await service.retire("scene"), false);
  assert.deepEqual(calls, []);
  active = "";
  failEvidence = true;
  await assert.rejects(() => service.retire("scene"), /storage/);
  assert.equal(present, true);
  failEvidence = false;
  calls.length = 0;
  sceneConflict = true;
  assert.equal(await service.retire("scene"), false);
  assert.equal(present, true, "a Scene revision conflict keeps the Scene");
  assert.ok(proof().physicalOutcome, "failed retirement retains frozen Scene replay proof");
  assert.equal(responsePresent, true, "the purchased late response remains recoverable");
  sceneConflict = false;
  calls.length = 0;
  assert.equal(await service.retire("scene"), true);
  assert.deepEqual(calls, ["evidence", "receipt", "remove", "remove-late", "diagnostics"]);
  assert.equal(present, false);
  assert.equal(proof().physicalOutcome, undefined, "actual retirement releases full physical payload");
  assert.equal(proof().status, "applied", "replay protection survives retirement");
});

await runCase("scene-retirement/restart-cleanup", async () => {
  const world = defaultVillageState();
  world.seed = "world";
  const terminal = terminalForScene(
    coerceSession({ version: 3, id: "scene", villageSeed: "world", status: "closed" }),
    1,
  );
  world.exchangeReceipts["venue-chat:scene:turn"] = {
    id: "venue-chat:scene:turn",
    sceneId: "scene",
    submissionId: "turn",
    domain: "physical",
    at: "2026-10-28T12:00:00.000Z",
    status: "applied",
    evidenceIds: [],
    reason: "Saved",
    physicalOutcome: {
      id: "venue-chat:scene:turn",
      venueId: "cafe",
      venueName: "Cafe",
      text: "Shelves installed",
      at: "2026-10-28T12:00:00.000Z",
    },
  };
  let diagnosticExists = true,
    fail = true,
    responseExists = true;
  const service = createSceneRetirement({
    villagesDocuments: () => ({
      getById: async () => null,
      list: async (_pkg, kind) =>
        kind === "scene-terminal"
          ? [{ data: terminal } as never]
          : kind === "generation-response" && responseExists
            ? [
                {
                  id: "late",
                  revision: 1,
                  data: { signature: JSON.stringify(["scene", "turn", 1, {}, "reply"]) },
                } as never,
              ]
            : [],
      update: async () => null,
      remove: async () => {
        responseExists = false;
        return true;
      },
    }),
    readActive: async () => ({ sessionId: "", placeId: "" }),
    readVillageState: async () => world,
    readVillageMemoryState: async () => world,
    mutateVillageMemoryState: async (update) => {
      update(world);
      return world;
    },
    hasVenueOperation: () => false,
    saveProjectEvidence: async () => {},
    saveTerminal: async () => {},
    readTerminal: async () => terminal,
    removeInterpretationDiagnostics: async () => {
      if (fail) throw Error("diagnostic conflict");
      diagnosticExists = false;
    },
    withRepairWork: async (work) => work(),
    withSceneWork: async (_id, work) => work(),
    withLateResponseWork: async (_id, work) => work(),
  });
  await assert.rejects(service.retireSettled(), /diagnostic conflict/);
  assert.equal(responseExists, false);
  assert.equal(diagnosticExists, true);
  fail = false;
  await service.retireSettled();
  assert.equal(diagnosticExists, false, "restart retries diagnostics after source deletion");
  assert.equal(
    world.exchangeReceipts["venue-chat:scene:turn"].physicalOutcome,
    undefined,
    "terminal cleanup releases physical proof even without a Memory reservation",
  );
});

await runCase("scene-retirement/fence", async () => {
  const fence = createSceneWorkFence();
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  const events: string[] = [];
  const replay = fence.run("scene", async () => {
    events.push("replay-start");
    await fence.run("scene", async () => {
      events.push("nested");
    });
    await waiting;
    events.push("replay-end");
  });
  await Promise.resolve();
  const cleanup = fence.run("scene", async () => {
    events.push("cleanup");
  });
  const other = fence.run("other", async () => {
    events.push("other");
  });
  await other;
  assert.ok(!events.includes("cleanup"));
  release();
  await Promise.all([replay, cleanup]);
  assert.ok(events.indexOf("cleanup") > events.indexOf("replay-end"));
  await assert.rejects(
    () =>
      fence.run("scene", async () => {
        throw new Error("failure");
      }),
    /failure/,
  );
  await fence.run("scene", async () => {
    events.push("after-failure");
  });
  assert.equal(events.at(-1), "after-failure");
  let releaseChild!: () => void;
  const childBlocked = new Promise<void>((resolve) => {
    releaseChild = resolve;
  });
  let nested!: Promise<void>;
  const parent = fence.run("detached", async () => {
    nested = fence.run("detached", async () => {
      await childBlocked;
      events.push("child");
    });
  });
  await Promise.resolve();
  await Promise.resolve();
  const retirement = fence.run("detached", async () => {
    events.push("retired");
  });
  await Promise.resolve();
  assert.ok(!events.includes("retired"));
  releaseChild();
  await Promise.all([parent, nested, retirement]);
  assert.ok(events.indexOf("child") < events.indexOf("retired"));
  await assert.rejects(() => fence.run("a", () => fence.run("b", async () => {})), /another Scene/);
});
