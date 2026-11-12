// Test cases: scene-retirement/eligibility, scene-retirement/terminal, scene-retirement/operation-status, scene-retirement/notice-dismissal, scene-retirement/publication, scene-retirement/restart-cleanup, scene-retirement/fence
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { readNarrationSubmission } from "../packages/villages/src/server/domain/decoding/narration-submission.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import type { VenueOperation } from "../packages/villages/src/server/domain/models/operation-model.js";
import {
  sceneReadyForRetirement,
  sceneRetirementSourceIsValid,
} from "../packages/villages/src/server/domain/rules/scene-retirement.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { applyAcceptedSceneDelta } from "../packages/villages/src/server/domain/rules/scene-delta.js";
import { appendSceneInput } from "../packages/villages/src/server/domain/rules/scene-input.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import {
  sessionSlot,
  activeSlot,
  ACTIVE_ID,
  SESSION_PREFIX,
} from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import {
  terminalForScene,
  readSceneTerminal,
  createSceneTerminalStore,
} from "../packages/villages/src/server/features/scenes/scene-terminal.js";
import {
  createSceneRetirement,
  type SceneRetirementPorts,
} from "../packages/villages/src/server/features/scenes/scene-retirement-service.js";
import { createVenueCoordinator } from "../packages/villages/src/server/jobs/venue-coordinator-service.js";
import { createSceneChanges } from "../packages/villages/src/server/features/scenes/changes-service.js";
import { notFound } from "../packages/villages/src/server/domain/rules/errors.js";
import { createSceneWorkFence } from "../packages/villages/src/server/jobs/scene-work-fence.js";

const at = "2026-11-09T12:00:00.000Z";
function worldFixture() {
  return Object.assign(defaultVillageState(), {
    seed: "retirement",
    setupAt: at,
    foundedAt: at,
    timeZone: "UTC",
    venues: [venueFixture({ id: "hall", name: "Hall", description: "A quiet hall." })],
  });
}
function sceneFixture(
  id = "scene",
  world: VillageState = worldFixture(),
  status: "applied" | "held" | "abandoned" = "applied",
) {
  const venue = world.venues[0],
    message = "PRIVATE_INPUT_SENTINEL café 東京.\n*An unspoken thought.*",
    submissionId = "turn-" + id,
    scene = zoneEventScene(
      coerceSession({
        version: 5,
        id,
        villageSeed: world.seed,
        placeId: venue.id,
        placeName: venue.name,
        zoneId: "exterior",
        status: "active",
        startedAt: at,
        lastActivityAt: at,
        sceneAttendance: { capturedAt: at, layout: captureSceneLayout(venue), occupants: [] },
      }),
      venue,
    );
  scene.continuity = captureSceneContinuity(world, scene, Date.parse(at));
  const context = narrationContinuityContext(world, scene, venue, submissionId, message, at),
    readset = fittedNarrationReadset(
      world,
      context,
      context.parts.flatMap((part) => (part.block.evidenceId ? [part.block.evidenceId] : [])),
    ),
    raw = { segments: [{ id: "reply", kind: "narration", text: "PRIVATE_PROSE_SENTINEL: the hall stays quiet." }] },
    publication = { raw, readset, responseDigest: memoryHash(raw) },
    base = {
      id: submissionId,
      message,
      mode: "chat",
      targetId: "",
      at,
      requestFingerprint: memoryHash(["chat", "", null, message]),
      acceptance: { status, rejected: [] },
    };
  if (status === "applied") {
    const accepted = acceptNarration(world, publication, submissionId, at);
    assert(!accepted.held && accepted.episode);
    const episode = accepted.episode;
    applyAcceptedSceneDelta(scene, episode);
    scene.submissions = [
      readNarrationSubmission({
        ...base,
        episodeId: episode.id,
        replyLineIds: episode.segments.map((line) => line.id),
        progressProcessedAt: episode.acceptedAt,
      }),
    ];
    appendSceneInput(scene, scene.submissions[0]);
    scene.lines.push(...structuredClone(episode.segments));
  } else {
    scene.submissions = [readNarrationSubmission({ ...base, narration: publication })];
    appendSceneInput(scene, scene.submissions[0]);
  }
  scene.status = "closed";
  scene.endedAt = at;
  scene.endReason = "player";
  return { world, scene, publication };
}
function operation(): VenueOperation {
  return {
    id: "close",
    kind: "close",
    input: {},
    token: "owner",
    attemptId: "close-attempt",
    status: "complete",
    stage: "complete",
    startedAt: at,
    sceneRevision: 0,
    snapshot: null,
    checkpoints: {},
    attempts: {},
    error: "",
  };
}
async function storedFixture() {
  const f = sceneHistoryFixture(),
    world = createVillageRepository(() => f.gate.documents),
    terminal = createSceneTerminalStore({
      villagesDocuments: () => f.gate.documents,
      mutateDocument: f.mutateDocument,
    }),
    fence = createSceneWorkFence();
  await world.mutateAuthority((state) => Object.assign(state, worldFixture()), { memories: true });
  async function add(id: string, status: "applied" | "held" | "abandoned" = "applied", missingProof = false) {
    const state = await world.readAuthority({ memories: true }),
      built = sceneFixture(id, state, status);
    if (!missingProof) await world.mutateAuthority((saved) => Object.assign(saved, state), { memories: true });
    await f.mutateDocument(SESSION_PREFIX + id, sessionSlot(f.gate.documents), (saved) =>
      Object.assign(saved, built.scene),
    );
    return built;
  }
  await add("scene");
  const ports: SceneRetirementPorts = {
    villagesDocuments: () => f.gate.documents,
    readActive: () => f.repository.readActive(),
    readVillageState: () => world.readAuthority({ memories: true }),
    hasVenueOperation: () => false,
    saveTerminal: (scene, revision) => terminal.save(scene, revision),
    withRepairWork: (work) => f.gate.work(work),
    withSceneWork: (id, work) => fence.run(id, work),
    withLateResponseWork: (id, work) => fence.run(id, work),
  };
  return { ...f, world, terminal, ports, add, service: createSceneRetirement(ports) };
}

await runCase("scene-retirement/eligibility", () => {
  const { world, scene, publication } = sceneFixture(),
    turn = scene.submissions[0];
  assert.equal(sceneRetirementSourceIsValid(scene), true);
  assert.equal(sceneReadyForRetirement(scene, world, ""), true);
  for (const bad of [
    { version: 4 },
    { lines: null },
    { lines: [{ id: "line" }] },
    { submissions: [{ ...turn, at: "invalid" }] },
    { submissions: [turn, turn] },
    { submissions: [{ ...turn, progressProcessedAt: undefined }] },
  ])
    assert.equal(sceneRetirementSourceIsValid({ ...scene, ...bad }), false);
  for (const bad of [
    { delivery: "unknown" },
    { contactHidden: "yes" },
    { soundOnly: { player: true } },
    { targetId: 42 },
    { heardBy: [42] },
  ])
    assert.equal(
      sceneRetirementSourceIsValid({
        ...scene,
        lines: [{ ...scene.lines.at(-1)!, ...bad }],
      }),
      false,
    );
  assert.equal(sceneReadyForRetirement(scene, world, scene.id), false);
  assert.equal(sceneReadyForRetirement({ ...scene, status: "active" }, world, ""), false);
  assert.equal(sceneReadyForRetirement({ ...scene, villageSeed: "other" }, world, ""), false);
  for (const status of ["pending", "held", "abandoned"] as const) {
    const entry = readNarrationSubmission({
      ...turn,
      acceptance: { status, rejected: [] },
      narration: publication,
    });
    assert.equal(sceneRetirementSourceIsValid({ ...scene, submissions: [entry] }), true);
    assert.equal(sceneReadyForRetirement({ ...scene, submissions: [entry] }, world, ""), false);
  }
  for (const patch of [
    { status: "running" },
    { status: "interrupted" },
    { checkpoints: { unfinished: "saved" } },
    { attempts: { reply: { status: "dispatching" } } },
    { checkpointClaims: { reply: { token: "claim", bodyId: "reserved-body" } } },
    { error: "Unresolved storage failure" },
  ])
    assert.equal(
      sceneReadyForRetirement({ ...scene, operation: { ...operation(), ...patch } as VenueOperation }, world, ""),
      false,
    );
  assert.equal(sceneReadyForRetirement({ ...scene, operation: operation() }, world, ""), true);
  assert.equal(sceneReadyForRetirement({ ...scene, abandonedOperations: [operation()] }, world, ""), false);
  for (const patch of [
    { episodeId: "missing" },
    { id: "different" },
    { message: "changed private input" },
    { replyLineIds: ["different"] },
  ])
    assert.equal(sceneReadyForRetirement({ ...scene, submissions: [{ ...turn, ...patch }] }, world, ""), false);
  const changed = structuredClone(world);
  changed.episodes.records[0].sceneId = "other-scene";
  assert.equal(sceneReadyForRetirement(scene, changed, ""), false);
});

await runCase("scene-retirement/terminal", () => {
  const { scene, publication } = sceneFixture();
  scene.sceneRevision = 7;
  scene.navigationReceipts = [{ id: "move", originZoneId: "hall", destinationZoneId: "exterior", at }];
  scene.generationReceipts = [
    { operationId: "unknown", attemptId: "paid-attempt", stages: ["reply"], outcome: "unknown", acknowledgedAt: at },
  ];
  scene.submissions[0].recordEvents = [{ id: "notice", kind: "project", text: "Project recorded" }];
  scene.operation = {
    ...operation(),
    input: { message: "PRIVATE_OPERATION_SENTINEL" },
    checkpoints: { purchased: "PRIVATE_PURCHASE_SENTINEL" },
  };
  const receipt = terminalForScene(scene, 2),
    text = JSON.stringify(receipt);
  assert.deepEqual(readSceneTerminal(receipt, scene.id), receipt);
  assert.equal(receipt.version, 2);
  assert.equal(receipt.submissions[0].inputHash, scene.submissions[0].requestFingerprint);
  assert.deepEqual(receipt.navigationReceipts, scene.navigationReceipts);
  assert.deepEqual(receipt.generationReceipts, scene.generationReceipts);
  assert.deepEqual(receipt.recordEvents, scene.submissions[0].recordEvents);
  assert.deepEqual(receipt.operation, { id: "close", kind: "close", attemptId: "close-attempt", status: "complete" });
  assert(!text.includes("PRIVATE_"), "Terminal metadata contains neither original input, prose nor operation bodies");
  assert.throws(() => terminalForScene({ ...scene, status: "active" }, 1), /not ready/);
  assert.throws(
    () => terminalForScene({ ...scene, abandonedOperations: [operation()] }, 1),
    /still own retained evidence/,
  );
  for (const status of ["pending", "held", "abandoned"] as const)
    assert.throws(
      () =>
        terminalForScene(
          {
            ...scene,
            submissions: [
              {
                ...scene.submissions[0],
                acceptance: { status, rejected: [] },
                narration: publication,
              },
            ],
          },
          1,
        ),
      /still own retained evidence/,
    );
  for (const mode of ["chat", "leave", "contact"] as const) {
    const entry = {
      ...scene.submissions[0],
      mode,
      targetId: "target",
      requestFingerprint: memoryHash([
        mode,
        "target",
        { originalContact: "retained only in the request fingerprint" },
        scene.submissions[0].message,
      ]),
    };
    assert.equal(
      terminalForScene({ ...scene, submissions: [entry] }, 1).submissions[0].inputHash,
      entry.requestFingerprint,
      "Terminal preserves the admitted fingerprint without reconstructing lost request fields",
    );
  }
});

await runCase("scene-retirement/operation-status", async () => {
  const { scene } = sceneFixture(),
    turn = scene.submissions[0],
    terminal = terminalForScene(scene, 1);
  const coordinator = createVenueCoordinator({
    operations: { context: { getStore: () => undefined } },
    villagesDocuments: () => ({ getById: async () => null }),
    readTerminal: async () => terminal,
  } as never);
  assert.deepEqual(await coordinator.readVenueOperation(scene.id, turn.id), {
    id: turn.id,
    status: "complete",
    kind: "turn",
    attemptId: "",
    terminal: true,
    recordEvents: [],
  });
  const unknown = await coordinator.readVenueOperation(scene.id, "missing");
  assert.equal(unknown?.status, "interrupted");
  assert.equal(unknown?.terminal, true);
});

await runCase("scene-retirement/notice-dismissal", async () => {
  const { world, scene } = sceneFixture();
  scene.submissions[0].recordEvents = [{ id: "notice", kind: "project", text: "Saved" }];
  const terminal = terminalForScene(scene, 1),
    providerFree = () => assert.fail("Notice dismissal cannot execute gameplay");
  const service = createSceneChanges({
    readSession: async () => {
      throw notFound("Scene removed");
    },
    readTerminal: async () => terminal,
    readVillageState: async () => world,
    mutateVillageState: async (change) => {
      change(world);
      return world;
    },
    processSavedExchange: providerFree,
  });
  for (let retry = 0; retry < 2; retry++)
    assert.deepEqual(await service.dismissSceneNotice(scene.id, "notice"), { dismissed: true });
  assert.deepEqual(world.dismissedNoticeIds, ["notice"]);
  await assert.rejects(service.dismissSceneNotice(scene.id, "other"), /unavailable/);
  world.seed = "another-world";
  await assert.rejects(service.dismissSceneNotice(scene.id, "notice"), /identity changed/i);
});

await runCase("scene-retirement/publication", async () => {
  for (const ownership of ["active", "playback", "running"] as const) {
    const f = await storedFixture();
    try {
      if (ownership === "running") f.ports.hasVenueOperation = () => true;
      else
        await f.mutateDocument(ACTIVE_ID, activeSlot, (pointer) => {
          pointer.placeId = "hall";
          if (ownership === "active") pointer.sessionId = "scene";
          else pointer.playbackSceneId = "scene";
        });
      assert.equal(await f.service.retire("scene"), false);
      assert(f.rows.has(SESSION_PREFIX + "scene"));
      assert.equal(await f.terminal.read("scene"), null);
    } finally {
      f.release();
    }
  }
  for (const fault of [
    "before-save",
    "after-save",
    "revision",
    "active",
    "playback",
    "running",
    "canonical-proof",
  ] as const) {
    const f = await storedFixture();
    try {
      const before = await f.world.readAuthority({ memories: true }),
        save = f.ports.saveTerminal;
      f.ports.saveTerminal = async (scene, revision) => {
        if (fault === "before-save") throw Error("Terminal publication failed");
        await save(scene, revision);
        if (fault === "after-save") throw Error("Terminal acknowledgement lost");
        if (fault === "revision") f.rows.get(SESSION_PREFIX + scene.id).revision++;
        if (fault === "running") f.ports.hasVenueOperation = () => true;
        if (fault === "active" || fault === "playback")
          await f.mutateDocument(ACTIVE_ID, activeSlot, (pointer) => {
            pointer.placeId = "hall";
            if (fault === "active") pointer.sessionId = scene.id;
            else pointer.playbackSceneId = scene.id;
          });
        if (fault === "canonical-proof") f.rows.get("villages-village").data.memoryHead = null;
      };
      if (fault === "before-save" || fault === "after-save")
        await assert.rejects(f.service.retire("scene"), /Terminal/);
      else assert.equal(await f.service.retire("scene"), false);
      assert(f.rows.has(SESSION_PREFIX + "scene"), "An interrupted publication retains the complete Scene");
      assert.equal(!!(await f.terminal.read("scene")), fault !== "before-save");
      if (fault !== "canonical-proof")
        assert.deepEqual((await f.world.readAuthority({ memories: true })).episodes, before.episodes);
      if (["before-save", "after-save", "revision"].includes(fault)) {
        const sourceRevision = f.rows.get(SESSION_PREFIX + "scene").revision;
        f.ports.saveTerminal = save;
        assert.equal(await f.service.retire("scene"), true, "The same Scene recovers after publication failure");
        assert(!f.rows.has(SESSION_PREFIX + "scene"));
        assert.equal((await f.terminal.read("scene"))!.sourceRevision, sourceRevision);
        assert.deepEqual((await f.world.readAuthority({ memories: true })).episodes, before.episodes);
      }
    } finally {
      f.release();
    }
  }
  const f = await storedFixture();
  try {
    const before = await f.world.readAuthority({ memories: true });
    assert.equal(await f.service.retire("scene"), true);
    assert(!f.rows.has(SESSION_PREFIX + "scene"));
    const terminal = (await f.terminal.read("scene"))!;
    assert(terminal.submissions.length === 1);
    assert.deepEqual(
      (await f.world.readAuthority({ memories: true })).episodes,
      before.episodes,
      "Retiring transient prose preserves canonical history and its original private input",
    );
    assert.equal(await f.service.retire("scene"), false);
    assert.deepEqual(await f.terminal.read("scene"), terminal);
  } finally {
    f.release();
  }
});

await runCase("scene-retirement/restart-cleanup", async () => {
  const f = await storedFixture();
  try {
    await f.add("held", "held");
    await f.add("abandoned", "abandoned");
    await f.add("missing-proof", "applied", true);
    await f.add("save-fails");
    await f.add("after-failure");
    const failures: string[] = [],
      save = f.ports.saveTerminal;
    f.ports.onFailure = (id, error) => {
      assert.match(String(error), /saved terminal failure/);
      failures.push(id);
    };
    f.ports.saveTerminal = async (scene, revision) => {
      if (scene.id === "save-fails") throw Error("saved terminal failure");
      await save(scene, revision);
    };
    const before = await f.world.readAuthority({ memories: true });
    await f.service.retireSettled();
    for (const id of ["held", "abandoned", "missing-proof", "save-fails"]) assert(f.rows.has(SESSION_PREFIX + id), id);
    for (const id of ["scene", "after-failure"]) {
      assert(!f.rows.has(SESSION_PREFIX + id), id);
      assert(await f.terminal.read(id));
    }
    assert.deepEqual(failures, ["save-fails"], "One failure cannot stop the remaining eligible Scenes");
    assert.deepEqual((await f.world.readAuthority({ memories: true })).episodes, before.episodes);
  } finally {
    f.release();
  }
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
