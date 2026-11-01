import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import { synchronizeVenueZones } from "../packages/villages/src/server/domain/rules/venue-zones.js";
import { ensureNarrative, admitNarrative } from "../packages/villages/src/server/domain/rules/narrative-development.js";
import {
  offerSceneNarrative,
  reserveSceneNarrative,
} from "../packages/villages/src/server/domain/rules/scene-narrative.js";
import {
  provisionalSceneNarrative,
  readSceneNarrativeReview,
  settleSceneNarrative,
} from "../packages/villages/src/server/domain/rules/scene-narrative-effects.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { sceneAccessState } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { sceneHaltWorldConflict } from "../packages/villages/src/server/domain/rules/scene-halt-world.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { activityDate, reserveEventAttempt } from "../packages/villages/src/server/domain/rules/event-attempts.js";
import { createSceneNarrative } from "../packages/villages/src/server/features/scenes/scene-narrative-service.js";
import {
  createSceneWriting,
  type SceneWritingPorts,
} from "../packages/villages/src/server/features/scenes/writing-service.js";
import { createSemanticService } from "../packages/villages/src/server/features/generation/semantic-service.js";
import { SCENE_DEVELOPMENT_OUTPUT } from "../packages/villages/src/server/domain/rules/narrative-prompts.js";

const at = "2026-10-29T12:00:00.000Z",
  now = new Date(at);
function fixture() {
  const state = defaultVillageState();
  Object.assign(state, {
    seed: "scene-narrative",
    name: "Harbor",
    setting: "A harbor town.",
    foundedAt: at,
    setupAt: at,
    timeZone: "UTC",
  });
  const venue = venueDraft(
    { id: "hall", name: "Hall", description: "A hall with a wooden sign.", category: "public" },
    null,
  );
  synchronizeVenueZones(venue);
  state.venues = [venue];
  ensureNarrative(state, at);
  const selected = admitNarrative(state, at, "selection")!.targets[0]!;
  const scene = coerceSession({
    version: 3,
    id: "scene",
    placeId: venue.id,
    placeName: venue.name,
    zoneId: selected.zoneId,
    area: selected.exterior ? "outside" : "public",
    villageSeed: state.seed,
    startedAt: at,
    status: "opening",
    semanticVersion: 2,
    activeIds: [],
    participants: [],
    lines: [],
    submissions: [],
  });
  scene.operation = {
    id: "greeting",
    input: {
      narrativeIntroductionVersion: 1,
      semanticPipelineVersion: 3,
      writingContractVersion: 3,
      sceneBoundaryVersion: 1,
      interactionScopeVersion: 6,
      playerAgencyVersion: 1,
      residentActionsVersion: 2,
      chosenAt: at,
      writingCapabilities: { management: false, movement: false, residences: false, residenceDecision: false },
    },
    checkpoints: {},
    attempts: {},
  } as any;
  scene.continuity = captureSceneContinuity(state, scene, now.getTime());
  return { state, scene };
}
function development(grant: NonNullable<ReturnType<typeof admitNarrative>>) {
  const target = grant.targets[0]!;
  return {
    severity: "gentle",
    occurrence: "A gust loosens the hall sign.",
    situation: { id: null, expectedRevision: 0, title: "Loose sign", summary: "A sign rattles.", status: "active" },
    physical: [
      {
        venueId: target.venueId,
        zoneId: target.zoneId,
        update: {
          narration: "The sign hangs loose.",
          expectedRevision: target.state.revision,
          appearanceChanged: true,
          append: "The sign hangs from one loose bracket.",
        },
      },
    ],
    conditions: [
      {
        id: null,
        expectedRevision: 0,
        venueId: target.venueId,
        zoneId: target.zoneId,
        observation: "The sign rattles in its bracket.",
        restriction: "none",
        remedy: "Secure the bracket.",
        endsAt: null,
        clear: false,
      },
    ],
    weather: null,
  } as any;
}
{
  const { state, scene } = fixture(),
    id = "scene:scene:greeting";
  const grant = offerSceneNarrative(state, scene, id, now)!;
  assert.ok(grant);
  assert.equal(offerSceneNarrative(state, { ...scene, zoneId: "elsewhere" }, id, now), null);
  const old = structuredClone(scene);
  old.continuity!.capturedAt = "2026-10-28T12:00:00.000Z";
  assert.equal(offerSceneNarrative(state, old, id, now), null, "Pre-adoption Scenes gain no historical grant.");
  const raced = structuredClone(state);
  reserveEventAttempt(raced, "resident-race", activityDate(raced, now), now.getTime());
  assert.equal(reserveSceneNarrative(raced, scene, grant, now), false);
  assert.equal(raced.eventAttempts!.attempts.length, 1);
  const arranged = structuredClone(state);
  arranged.relationshipContext = {
    socialPlans: [{ kind: "meeting", status: "planned", dateKey: "2026-10-29", startMinute: 720, endMinute: 740 }],
  } as any;
  assert.equal(offerSceneNarrative(arranged, scene, id, now), null);
  assert.equal(reserveSceneNarrative(state, scene, grant, now), true);
  assert.equal(
    reserveSceneNarrative(state, scene, grant, new Date("2026-10-30T12:00:00.000Z")),
    true,
    "A purchased source survives day rollover without a new slot.",
  );
  assert.equal(state.eventAttempts!.attempts.length, 1);
  const lines: any = [
    { kind: "narration", speakerId: "__venue_scene__", content: "A gust loosens the hall sign.", heardBy: [] },
  ];
  const review = { status: "introduced", segment: 0, quote: lines[0].content, development: development(grant) };
  assert.throws(() => readSceneNarrativeReview(review, null, lines, null), /admitted local/);
  assert.throws(
    () => readSceneNarrativeReview(review, grant, [{ ...lines[0], contactHidden: true }], null),
    /admitted local/,
  );
  assert.throws(() => readSceneNarrativeReview(review, grant, lines, { segment: 0 }), /must follow/);
  assert.throws(
    () => readSceneNarrativeReview({ status: "quiet", development: review.development }, grant, lines, null),
    /contradictory/,
  );
  const source = { grant, development: readSceneNarrativeReview(review, grant, lines, null) };
  const actorUpdate = {
    narration: "You secure the sign.",
    expectedRevision: grant.targets[0]!.state.revision + 1,
    appearanceChanged: true,
    edits: [{ before: "The sign hangs from one loose bracket.", after: "The sign is secure." }],
  };
  assert.equal(
    sceneHaltWorldConflict(scene, state, {
      narrativeSource: source,
      placeUpdate: actorUpdate,
      physicalContext: {
        zoneId: scene.zoneId,
        actorIds: ["player"],
        consentIds: [],
        witnessIds: ["player"],
        positions: { player: scene.zoneId },
      },
    }),
    false,
    "A supported actor action can use the exact environmental after-state.",
  );
  assert.equal(
    sceneHaltWorldConflict(scene, state, {
      narrativeSource: source,
      placeUpdate: actorUpdate,
      physicalContext: { zoneId: scene.zoneId, actorIds: ["invented"], consentIds: [], witnessIds: [], positions: {} },
    }),
    true,
    "An introduction cannot supply actor presence or physical authority.",
  );
  const before = JSON.stringify(state);
  assert.equal(sceneHaltWorldConflict(scene, state, { narrativeSource: source }), false);
  assert.equal(JSON.stringify(state), before);
  const provisional = provisionalSceneNarrative(sceneContinuityView(state, scene), state, source);
  assert.match(provisional.venues[0]!.zones!.find((z) => z.id === scene.zoneId)!.description, /loose bracket/);
  const lower = structuredClone(state);
  source.development!.severity = "moderate";
  source.grant.consequence = "moderate";
  assert.throws(() => settleSceneNarrative(lower, scene, source), /matching admission/);
  source.grant = grant;
  source.development!.severity = "gentle";
  // Restore original fingerprint after the intentional forged-grant check.
  source.grant.consequence = "gentle";
  settleSceneNarrative(state, scene, source);
  settleSceneNarrative(state, scene, source);
  scene.submissions.push({ id: "greeting", narrativeSource: source } as any);
  assert.equal(state.narrative!.receipts.length, 1);
  assert.equal(sceneContinuityView(state, scene).narrative!.conditions.length, 1);
  assert.equal(sceneAccessState(state, scene).narrative!.conditions.length, 1);
  const other = { ...scene, id: "other", submissions: [] };
  assert.equal(sceneContinuityView(state, other, false).narrative!.conditions.length, 0);
  assert.deepEqual(coerceSession({ ...scene, operation: undefined }).submissions[0]!.narrativeSource, source);
  assert.equal(JSON.stringify(publicSceneResponse(scene)).includes("narrativeSource"), false);
}
{
  const { state, scene } = fixture(),
    grant = offerSceneNarrative(state, scene, "scene:scene:greeting", now)!;
  const paused = structuredClone(state);
  paused.backgroundPace = "off";
  let writes = 0;
  const pausedService = createSceneNarrative({
    read: async () => paused,
    mutate: async () => {
      writes++;
    },
    relationships: async () => ({}) as any,
    now: () => now,
  });
  assert.equal(await pausedService.offer(scene, grant.id), null);
  assert.equal(writes, 0, "An ineligible ordinary turn must not mutate Village authority.");
  assert.equal(offerSceneNarrative(paused, scene, grant.id, now), null);
  assert.equal(reserveSceneNarrative(state, scene, grant, now), true);
  settleSceneNarrative(state, scene, { grant, development: null });
  assert.equal(state.narrative!.claims!.length, 0);
  assert.equal(state.eventAttempts!.attempts.length, 1, "Quiet consumes its shared opportunity.");
  assert.equal(state.narrative!.conditions.length, 0);
}
{
  const { state, scene } = fixture(),
    grant = offerSceneNarrative(state, scene, "scene:scene:greeting", now)!;
  reserveSceneNarrative(state, scene, grant, now);
  const service = createSceneNarrative({
    read: async () => state,
    mutate: async (work) => {
      await work(state);
    },
    relationships: async () => ({}) as any,
    now: () => now,
  });
  await service.discard(scene);
  await service.discard(scene);
  assert.equal(state.narrative!.claims!.length, 0);
  assert.equal(state.narrative!.receipts.filter((row) => row.rejected).length, 1);
  assert.equal(state.eventAttempts!.attempts.length, 1);
  assert.throws(() => settleSceneNarrative(state, scene, { grant, development: development(grant) }), /rejected/);
}

// Actual Narration + System calls, checkpoint-write gap and exact provider-free replay.
for (const variant of ["normal", "gap", "race-boundary", "quiet", "no-review", "legacy-review-retry"] as const) {
  const { state, scene } = fixture(),
    checkpoints = new Map<string, any>();
  let requests = 0,
    failReservationAck = variant === "gap",
    narrationCalls = 0,
    systemCalls = 0,
    explicitRetry = false;
  const raceBoundary = variant === "race-boundary";
  const quiet = variant === "quiet" || variant === "no-review";
  if (quiet) state.backgroundPace = "off";
  if (variant === "no-review") delete scene.operation!.input.narrativeIntroductionVersion;
  const checkpoint = async <T>(key: string, work: () => Promise<T>): Promise<T> => {
    if (checkpoints.has(key)) return structuredClone(checkpoints.get(key));
    const result = await work();
    if (variant === "legacy-review-retry" && key.startsWith("semantic-v2:exchange:") && key.endsWith(":input")) {
      const legacy = result as any;
      delete legacy.narrativeReviewOutputVersion;
      legacy.systemPrompt = legacy.systemPrompt.replace(
        "Return {sourceHash," + SCENE_DEVELOPMENT_OUTPUT + ",",
        "Return {sourceHash,",
      );
    }
    if (key.startsWith("narrative-dispatch:") && failReservationAck) {
      failReservationAck = false;
      throw Error("Dispatch checkpoint write failed");
    }
    checkpoints.set(key, structuredClone(result));
    return result;
  };
  const saved = <T>(key: string) => checkpoints.get(key) as T | undefined;
  const sceneNarrative = createSceneNarrative({
    read: async () => structuredClone(state),
    mutate: async (work) => {
      await work(state);
    },
    relationships: async () => ({ socialPlans: [] }) as any,
    now: () => now,
  });
  if (raceBoundary) {
    const reserve = sceneNarrative.reserve;
    sceneNarrative.reserve = async (...args) => {
      reserveEventAttempt(state, "resident-race", activityDate(state, now), now.getTime());
      return reserve(...args);
    };
  }
  const model: any = {
    model: "fixture",
    connectionId: "fixture",
    maxContext: 100000,
    maxOutputTokens: 4096,
    fitContext: (messages: any, options: any) => ({
      messages,
      ...options,
      estimatedTokensBefore: 10,
      estimatedTokensAfter: 10,
      trimmed: false,
    }),
  };
  const complete: any = async (_model: any, messages: any) => {
    requests++;
    if (!messages[0].content.startsWith("You interpret Villages gameplay.")) {
      narrationCalls++;
      if (raceBoundary || quiet) assert.doesNotMatch(messages[0].content, /Immutable local admission/);
      else assert.match(messages[0].content, /Immutable local admission/);
      return {
        finishReason: "stop",
        content: JSON.stringify({
          playerSpeechCapture: { status: "silent", utterances: [] },
          segments: [
            {
              kind: "narration",
              text: quiet
                ? "The room is quiet."
                : raceBoundary
                  ? narrationCalls === 1
                    ? "Everyone dies."
                    : "The room is quiet."
                  : "A gust loosens the hall sign.",
            },
          ],
          residentActions: [],
        }),
      };
    }
    const packet = JSON.parse(messages[1].content);
    systemCalls++;
    const declaration = messages[0].content.match(
      /Return \{sourceHash,[\s\S]*?\}\. Return exactly one JSON object\./,
    )?.[0];
    assert.ok(declaration, "System receives an explicit root response contract");
    assert.equal(
      declaration.includes("narrativeIntroduction:"),
      packet.input.narrativeGrant !== undefined && variant !== "legacy-review-retry",
      "The declared response shape includes every required introduction review",
    );
    if (variant === "legacy-review-retry")
      assert.equal(messages[0].content.includes("Required root JSON field: narrativeIntroduction:"), explicitRetry);
    return {
      finishReason: "stop",
      content: JSON.stringify({
        sourceHash: packet.sourceHash,
        consistent: true,
        playerAgencyViolation: null,
        halt:
          raceBoundary && systemCalls === 1
            ? { reason: "condition", source: "draft", quote: "Everyone dies.", appointments: [] }
            : { reason: "none", quote: "", appointments: [] },
        intent: { status: "resolved", reason: "", instructions: "", action: null, movement: null, timeline: [] },
        authority: { physical: false, access: false, projects: false, standing: false, social: false },
        action: null,
        openingSignal: null,
        memoryChanges: [],
        relationshipChanges: { changes: [], permissions: [], disclosures: [], intentions: [] },
        wishChanges: [],
        projectSpeech: [],
        access: [],
        events: { moves: [], departures: [], contactEnd: [] },
        narrativeIntroduction:
          variant === "no-review" || (variant === "legacy-review-retry" && systemCalls === 1)
            ? undefined
            : raceBoundary || quiet
              ? { status: "quiet", development: null }
              : {
                  status: "introduced",
                  segment: 0,
                  quote: "A gust loosens the hall sign.",
                  development: development(packet.input.narrativeGrant),
                },
        residentActionReview: {
          version: 1,
          additionalActions: [],
          decisions: [],
          coverage: [{ segment: 0, status: "none", actionIds: [], reason: "No access action." }],
        },
      }),
    };
  };
  const common: any = {
    readVillageState: async () => structuredClone(state),
    villagesLanguageModels: () => ({ resolveForRequest: async () => model }),
    villagesConnectionIdFor: async () => "fixture",
    completeWithRoom: complete,
    venueCheckpoint: checkpoint,
    venueSavedCheckpoint: saved,
    venueExplicitRetry: () => explicitRetry,
    venueOperationSignal: () => undefined,
    readVillageLore: async () => [],
    runtimeDebug() {},
    rejectVenueCompletion: async () => {},
  };
  const semantic = createSemanticService(common);
  const writer = createSceneWriting({
    ...common,
    semantic,
    sceneNarrative,
    venueOperationId: () => scene.operation!.id,
    venueOperationInput: () => scene.operation!.input,
    readEffectiveVillagerCard: () => assert.fail("No actors"),
    villagesLogger: () => ({ warn() {} }),
    measurePipeline: async (_name: string, _meta: any, work: any) => work(),
    refreshZoneParticipants: async (row: any) => row,
    interpretRoomReply: () => assert.fail("No additional interpretation"),
  } as SceneWritingPorts);
  if (variant === "gap") {
    await assert.rejects(writer.generate(scene, "", "greet", "", null), /checkpoint write failed/);
    assert.equal(requests, 0);
    assert.equal(state.eventAttempts!.attempts.length, 1);
  }
  let frozen: [string, unknown][] | undefined;
  if (variant === "legacy-review-retry") {
    await assert.rejects(writer.generate(scene, "", "greet", "", null), /introduction review is incomplete/);
    assert.equal(narrationCalls, 1);
    assert.equal(systemCalls, 1);
    assert.ok(![...checkpoints.keys()].some((key) => key.endsWith(":narrative-review-output-v1")));
    frozen = structuredClone(
      [...checkpoints.entries()].filter(([key]) => key.endsWith(":input") || key.endsWith(":prompt")),
    );
    explicitRetry = true;
  }
  const reply = await writer.generate(scene, "", "greet", "", null);
  if (variant === "legacy-review-retry") {
    assert.equal(narrationCalls, 1, "Explicit correction reuses purchased Narration");
    assert.equal(systemCalls, 2, "Only the failed System check is retried");
    for (const [key, value] of frozen!)
      assert.deepEqual(checkpoints.get(key), value, "Original source and prompt stay exact");
    const [, corrected] = [...checkpoints.entries()].find(([key]) => key.endsWith(":narrative-review-output-v1"))!;
    const [, original] = [...checkpoints.entries()].find(
      ([key]) => key.startsWith("semantic-v2:exchange:") && key.endsWith(":prompt"),
    )!;
    assert.deepEqual(corrected.input, original.input);
    assert.equal(corrected.sourceHash, original.sourceHash);
    assert.deepEqual(corrected.messages.slice(1), original.messages.slice(1));
    explicitRetry = false;
    await writer.generate(scene, "", "greet", "", null);
    assert.equal(systemCalls, 2, "A completed corrected check replays without another request");
    continue;
  }
  if (quiet) {
    assert.equal(reply.narrativeSource, undefined);
    assert.equal(requests, 2);
    await writer.generate(scene, "", "greet", "", null);
    assert.equal(requests, 2);
    continue;
  }
  if (raceBoundary) {
    assert.equal(reply.narrativeSource, undefined);
    assert.equal(requests, 4, "Only the existing HALT replacement pair is dispatched after the ordinary pair.");
    await writer.generate(scene, "", "greet", "", null);
    assert.equal(requests, 4);
    assert.equal(state.eventAttempts!.attempts.length, 1);
    continue;
  }
  assert.ok(reply.narrativeSource?.development);
  assert.equal(requests, 2, "One existing Narration and one existing System call; no environmental generation call.");
  const replay = await writer.generate(scene, "", "greet", "", null);
  assert.equal(requests, 2);
  assert.deepEqual(replay.narrativeSource, reply.narrativeSource);
  assert.equal(state.eventAttempts!.attempts.length, 1);
  const stale = structuredClone(state);
  stale.venues[0]!.zones!.find((z) => z.id === scene.zoneId)!.state.revision++;
  assert.throws(() => settleSceneNarrative(stale, scene, reply.narrativeSource!), /Zone changed/);
  assert.equal(stale.narrative!.receipts.length, 0);
  await sceneNarrative.settle(scene, reply.narrativeSource);
  assert.equal(state.narrative!.receipts.length, 1);
}
