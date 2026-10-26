import { bindLiveProposals } from "../packages/villages/src/server/domain/rules/live-exchange.js";
import { createVenueCoordinator } from "../packages/villages/src/server/jobs/venue-coordinator-service.js";
import {
  createVenueOperationContext,
  type Context,
} from "../packages/villages/src/server/adapters/operations/operation-context-service.js";
import { VillagesRequestError } from "../packages/villages/src/server/domain/rules/errors.js";
import {
  projectMetadataRejected,
  rejectProjectMetadata,
  semanticBlocker,
} from "../packages/villages/src/server/domain/rules/semantic-continuity.js";
import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { initialOpening } from "../packages/villages/src/server/domain/rules/opening-project.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  createSceneCommands,
  type SceneCommandPorts,
} from "../packages/villages/src/server/features/scenes/command-service.js";
import {
  createLiveScenes,
  type LiveScenePorts,
} from "../packages/villages/src/server/features/scenes/live-session-service.js";
import { createSceneQueryService } from "../packages/villages/src/server/features/scenes/scene-query-service.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { ACTIVE_ID, SESSION_KIND } from "../packages/villages/src/server/adapters/storage/scene-slots.js";

const state = defaultVillageState();
state.seed = "recovery-village";
state.opening = initialOpening(["resident"], "community", "recovery-opening");
state.opening.gatheringSceneId = "gathering";
state.venues = [
  {
    id: "community",
    classes: ["community"],
    name: "Meeting Hall",
    form: "An established hall",
    description: "An entrance",
    presentation: { x: 0.5, y: 0.5, image: null },
    occupancy: { playerHome: false, residentCharacterId: null },
    spaces: [defaultVenueSpace("community", "A common room")],
    state: { condition: "Open", publicFacts: [], furniture: [], updatedAt: "" },
  },
] as any;
const old = new Date(Date.now() - 3_600_000).toISOString();
let saved = coerceSession({
  version: 2,
  id: "gathering",
  placeId: "community",
  placeName: "Meeting Hall",
  zoneId: "community",
  spaceClass: "community",
  area: "public",
  status: "active",
  startedAt: old,
  lastActivityAt: old,
  processingVersion: 1,
  villageSeed: state.seed,
  openingGatheringId: state.opening.id,
  sceneAttendance: { capturedAt: old, occupants: [] },
  lines: [
    {
      id: "original",
      role: "user",
      speakerId: "player",
      name: "Player",
      content: "I remember this conversation.",
      heardBy: [],
      at: old,
    },
  ],
});
let pointer = { sessionId: saved.id, placeId: saved.placeId };
const mutateVillageState = async (mutate: (value: typeof state) => void) => {
  mutate(state);
  return state;
};
const live = createLiveScenes({
  readActive: async () => pointer,
  readSession: async () => saved,
  changeSession: async (_id, change) => {
    change(saved);
    return saved;
  },
  clearActivePointer: async () => {
    pointer = { sessionId: "", placeId: "" };
  },
  hasVenueOperation: () => false,
  readVillageState: async () => state,
  mutateVillageState,
} as LiveScenePorts);
assert.equal((await live.activeVenueSession())?.id, saved.id, "an unattended gathering remains active");
assert.equal(state.opening.stage, "gathering");
saved.status = "closed";
saved.endReason = "player";
assert.equal(await live.activeVenueSession(), null);
assert.equal(saved.status, "closed");
assert.equal(state.opening.stage, "conversations");
assert.equal(saved.lines[0].content, "I remember this conversation.");

// Simulate a crash after closing the Scene and clearing its pointer, before the opening write.
state.opening.stage = "gathering";
let sceneWrites = 0;
const commands = createSceneCommands({
  activationScope: () => undefined,
  sceneWork: () => ({ serializeNavigation: async (work: () => Promise<unknown>) => work() }),
  readActive: async () => pointer,
  activeVenueSession: async () => null,
  hasVenueOperation: () => false,
  rollActiveAgendas: async () => false,
  readVillageState: async () => state,
  mutateVillageState,
  readSession: async () => saved,
  refreshZoneParticipants: async (scene: typeof saved) => scene,
  mutateDocument: async (id: string, _slot: unknown, mutate: (value: typeof pointer) => void) => {
    assert.equal(id, ACTIVE_ID, "recovery cannot replace a saved Scene");
    sceneWrites++;
    mutate(pointer);
  },
} as unknown as SceneCommandPorts);
const resumed = await commands.enterVenue("community", "community");
assert.equal(resumed.id, "gathering");
assert.equal(resumed.lines[0].content, "I remember this conversation.");
assert.equal(state.opening.stage, "conversations");
assert.equal(sceneWrites, 0, "a closed gathering is never restaged or regenerated");

// A saved live Scene with a missing pointer is reattached intact.
state.opening.stage = "gathering";
saved = { ...saved, status: "active", endedAt: "", lastActivityAt: new Date().toISOString() };
await commands.enterVenue("community", "community");
assert.equal(pointer.sessionId, "gathering");
assert.equal(saved.lines.length, 1);
assert.equal(sceneWrites, 1, "only the pointer is restored");

// A failed opening-receipt write stays discoverable even after other exchange domains finished.
const processing = createExchangeProcessing({
  seed: state.seed,
  sceneId: "gathering",
  submissionId: "use",
  order: 0,
  lineIds: [],
  actionReceiptIds: [],
});
for (const domain of Object.values(processing.domains)) domain.status = "applied";
saved.submissions = [
  {
    id: "use",
    mode: "chat",
    message: "We watch together.",
    targetId: "",
    verdict: null,
    wishId: "",
    wishMemory: "",
    processing,
    openingContext: { stage: "first-use", projectId: "project" },
    openingSignal: { kind: "first-use", residentId: "", quote: "The film begins.", playerQuote: "We watch together." },
  },
];
const queries = createSceneQueryService({
  readSession: async () => saved,
  readVillageState: async () => state,
  villagesDocuments: () => ({
    list: async (_packageId: string, kind: string) => {
      assert.equal(kind, SESSION_KIND);
      return [{ data: saved }];
    },
  }),
} as any);
assert.ok((await queries.progressBacklog()).some((entry) => entry.submissionId === "use"));
saved.submissions[0].openingProcessedAt = new Date().toISOString();
assert.ok(!(await queries.progressBacklog()).some((entry) => entry.submissionId === "use"));
console.log(
  "Opening recovery passed: persistent gathering, missing-pointer recovery, transcript preservation and interrupted opening receipts.",
);

// Invalid saved lead metadata is reassessed before replay can grant a commitment.
{
  const village = defaultVillageState();
  village.seed = "project-recovery";
  const processing = createExchangeProcessing({
    seed: village.seed,
    sceneId: "commitment",
    submissionId: "offer",
    order: 0,
    lineIds: ["player", "invite", "labor"],
    actionReceiptIds: [],
  });
  for (const domain of Object.values(processing.domains)) domain.status = "applied";
  processing.domains.projects = {
    ...processing.domains.projects,
    status: "failed",
    reason: "Project commitment metadata is invalid.",
    failure: {
      cause: "missing_result",
      stage: "metadata",
      message: "Project commitment metadata is invalid.",
    },
  };
  const scene = coerceSession({
    version: 2,
    id: "commitment",
    placeId: "venue",
    status: "active",
    processingVersion: 1,
    villageSeed: village.seed,
    lines: [
      {
        id: "player",
        role: "user",
        speakerId: "player",
        content: "Will you lead the Project?",
        heardBy: ["builder"],
      },
      {
        id: "invite",
        role: "assistant",
        kind: "dialogue",
        speakerId: "builder",
        content: "Come in.",
        heardBy: ["builder"],
      },
      {
        id: "labor",
        role: "assistant",
        kind: "dialogue",
        speakerId: "builder",
        content: "I can help sometimes; I cannot lead the work.",
        heardBy: ["builder"],
      },
    ],
    submissions: [
      {
        id: "offer",
        processing,
        semanticProvenance: {
          version: 2,
          pipelineVersion: 3,
          sourceHash: "original-system",
          authority: { projects: true, access: true, physical: false, standing: false },
        },
        action: null,
        projectContexts: [{ projectId: "rail", revision: 2, phase: "planning" }],
        projectSpeech: [
          {
            version: 1,
            projectId: "rail",
            revision: 2,
            phase: "planning",
            kind: "builder",
            speakerId: "builder",
            citations: [{ lineId: "labor", quote: "I can help sometimes;" }],
            contextual: { version: 1, source: "system", checkId: "original-system" },
          },
        ],
        invitationSignal: { residentId: "builder", sourceLineId: "invite" },
        liveProposals: {
          version: 1,
          playerLineId: "player",
          replyLineIds: ["invite", "labor"],
          earlierLineIds: [],
          memoryVersions: {},
          memoryChanges: [],
          relationshipChanges: { changes: [], permissions: [], disclosures: [] },
        },
        replyLineIds: ["invite", "labor"],
        at: old,
      },
    ],
  });
  for (const turn of scene.submissions)
    if (turn.liveProposals)
      turn.liveProposals = bindLiveProposals(
        turn.liveProposals,
        turn.liveProposals.playerLineId,
        turn.liveProposals.replyLineIds,
        scene.lines,
      );
  const originalLines = structuredClone(scene.lines),
    originalProposal = structuredClone(scene.submissions[0].projectSpeech),
    originalInvitation = structuredClone(scene.submissions[0].invitationSignal);
  let systemCalls = 0,
    replayedIncorrectOffer = false,
    automaticFixture = false,
    malformedRecovery = false;
  let recoveryFailure: Error | undefined;
  let failPersistence = false,
    useReplayGuard = false;
  const operations = createVenueOperationContext(() => ({ debug: () => {} }) as any);
  const coordinator = createVenueCoordinator({
    operations,
    villagesDocuments: () => ({ getById: async () => null }) as any,
    villagesLogger: () => ({ debug: () => {} }) as any,
    runtimeDebug: () => {},
    readInterpretationSettings: async () => ({}) as any,
  });
  const dispatch = async () => {
    systemCalls++;
    if (recoveryFailure) throw recoveryFailure;
    return { content: malformedRecovery ? "malformed" : JSON.stringify({ projectSpeech: [] }), finishReason: "stop" };
  };
  const originalTurn = structuredClone(scene.submissions[0]);
  const commands = createSceneCommands({
    sceneWork: () => ({ isMoving: () => false }),
    runtimeDebug: () => {},
    villagesLogger: () => ({ warn: () => {}, debug: () => {} }),
    readVillageSnapshot: async () => {
      throw Error("stop-after-semantic-settlement");
    },
    rejectVenueCompletion: async () => {},
    coordinateVenue: async (_id, _request, _kind, _input, _revision, _attempt, work) => work(),
    readSession: async () => scene,
    readVillageState: async () => village,
    mutateVillageState: async (update: any) => {
      update(village);
      return village;
    },
    changeSession: async (_id, update) => {
      if (
        failPersistence &&
        scene.submissions[0].interpretationHistory?.some((row) => row.source === "Automatic Project retry started")
      )
        throw new VillagesRequestError(502, "fixture storage failed");
      update(scene);
      return scene;
    },
    processSavedExchange: async () => {
      if (scene.submissions[0].processing!.domains.projects.status === "rejected") return;
      if (automaticFixture && scene.submissions[0].projectSpeech?.length) return;
      if (scene.submissions[0].projectSpeech?.length) replayedIncorrectOffer = true;
      scene.submissions[0].processing!.domains.projects.status = "applied";
    },
    villagesLanguageModels: () => ({
      resolveForRequest: async () => ({
        model: "fixture",
        maxOutputTokens: 4096,
        fitContext: (messages, options) => ({ messages, ...options }),
      }),
    }),
    villagesConnectionIdFor: async () => "system",
    venueCheckpoint: async (_key, work) => work(),
    venueOperationSignal: () => undefined,
    venueOperationId: () => "recovery",
    venueRequestMetrics: () => [],
    completeWithRoom: async () => {
      return useReplayGuard ? coordinator.coordinatedCompletion("project-recovery", dispatch) : dispatch();
    },
    readSceneChanges: async () => ({ recovered: true }),
  } as unknown as SceneCommandPorts);
  await commands.retrySceneChangeInterpretation(scene.id, "offer", "projects");
  assert.equal(systemCalls, 1, "Only System reinterprets the saved exchange; Narration never regenerates");
  assert.equal(replayedIncorrectOffer, false, "The invalid original proposal must not apply before reassessment");
  assert.deepEqual(scene.lines, originalLines);
  assert.deepEqual(scene.submissions[0].invitationSignal, originalInvitation);
  assert.deepEqual(scene.submissions[0].projectSpeech, []);
  assert.deepEqual(scene.submissions[0].interpretationHistory![0].proposals, originalProposal);
  assert.equal(scene.submissions[0].semanticProvenance?.sourceHash, "original-system");
  assert.equal(scene.submissions[0].semanticReady, true);

  assert.equal(scene.submissions[0].processing!.domains.projects.status, "applied");

  // Ordinary saved-turn recovery does one System-only reassessment without a player metadata decision.
  automaticFixture = true;
  for (const malformed of [false, true]) {
    scene.submissions = [structuredClone(originalTurn)];
    scene.submissions[0].message = "Will you lead the Project?";
    scene.submissions[0].mode = "chat";
    scene.submissions[0].targetId = "";
    scene.submissions[0].invitationSignal = { ...originalInvitation!, venueId: "venue", timing: "now" } as any;
    malformedRecovery = malformed;
    systemCalls = 0;
    const input = {
      sessionId: scene.id,
      submissionId: "offer",
      message: "Will you lead the Project?",
      mode: "chat" as const,
      targetId: "",
    };
    await assert.rejects(commands.sendVenueTurn(input), /stop-after-semantic-settlement/);
    assert.equal(systemCalls, 1);
    assert.equal(scene.submissions[0].semanticReady, true);
    assert.equal(semanticBlocker(scene), null);
    assert.deepEqual(scene.lines, originalLines);
    if (malformed) {
      assert.equal(projectMetadataRejected(scene.submissions[0]), true);
      assert.deepEqual(
        scene.submissions[0].projectSpeech,
        originalProposal,
        "Rejected original metadata remains intact and auditable",
      );
      const altered = structuredClone(scene.submissions[0]);
      altered.semanticProvenance!.sourceHash = "other-exchange";
      assert.equal(projectMetadataRejected(altered), false, "A disposition cannot settle another frozen exchange");
      const physical = structuredClone(originalTurn);
      physical.action = { happened: true, narration: "A completed action" };
      assert.throws(() => rejectProjectMetadata(physical, "invalid", old), /cannot be rejected/);
    }
    await assert.rejects(commands.sendVenueTurn(input), /stop-after-semantic-settlement/);
    assert.equal(systemCalls, 1, "Saved replay cannot repeatedly spend on interpretation recovery");
  }
  // Started is not a terminal result: cancellations, provider/storage errors and restart stay blocked.
  for (const failure of [
    new Error("fixture cancelled"),
    new VillagesRequestError(502, "fixture provider failed"),
    "storage",
    "restart",
    "replay-guard",
  ]) {
    scene.submissions = [structuredClone(originalTurn)];
    Object.assign(scene.submissions[0], { message: "Will you lead the Project?", mode: "chat", targetId: "" });
    scene.submissions[0].invitationSignal = { ...originalInvitation!, venueId: "venue", timing: "now" } as any;
    systemCalls = 0;
    malformedRecovery = true;
    recoveryFailure = failure instanceof Error ? failure : undefined;
    failPersistence = failure === "storage";
    useReplayGuard = failure === "replay-guard";
    if (failure === "restart")
      scene.submissions[0].interpretationHistory = [
        { at: old, domain: "projects", source: "Automatic Project retry started", proposals: {} },
      ];
    const input = {
      sessionId: scene.id,
      submissionId: "offer",
      message: "Will you lead the Project?",
      mode: "chat" as const,
      targetId: "",
    };
    const current: Context = {
      sessionId: scene.id,
      allowPaid: false,
      controller: new AbortController(),
      scope: "change-interpretation",
      counts: new Map(),
      usedAttemptKeys: new Map(),
      blocked: new Set(),
      operation: {
        id: "offer",
        kind: "turn",
        input: {},
        token: "test",
        attemptId: "test",
        status: "running",
        stage: "turn",
        startedAt: old,
        sceneRevision: 0,
        snapshot: null,
        checkpoints: {},
        attempts: {},
        error: "",
      },
    };
    await assert.rejects(operations.context.run(current, () => commands.sendVenueTurn(input)));
    assert.equal(projectMetadataRejected(scene.submissions[0]), false, String(failure));
    assert.notEqual(scene.submissions[0].semanticReady, true);
    const firstCalls = systemCalls;
    failPersistence = false;
    recoveryFailure = undefined;
    useReplayGuard = false;
    await assert.rejects(commands.sendVenueTurn(input), /saved immediate outcome needs recovery/);
    assert.equal(systemCalls, firstCalls, "Interrupted recovery cannot dispatch again automatically");
    assert.equal(projectMetadataRejected(scene.submissions[0]), false);
    assert.notEqual(scene.submissions[0].semanticReady, true);
    assert.deepEqual(scene.lines, originalLines);
    assert.deepEqual(scene.submissions[0].projectSpeech, originalProposal);
    if (failure === "replay-guard") assert.equal(systemCalls, 0, "Real coordinator forbids paid dispatch on replay");
  }
}
