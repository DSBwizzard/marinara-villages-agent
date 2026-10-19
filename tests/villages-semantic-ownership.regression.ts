import {
  initialOpening,
  openingSceneDirection,
  openingProposalFingerprint,
} from "../packages/villages/src/server/domain/rules/opening-project.js";
import {
  applyRelationshipReview,
  defaultRelationshipState,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { applyAccessCommand, evaluateZoneAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { parseRelationshipReview } from "../packages/villages/src/server/domain/rules/relationship-review.js";
import {
  RESIDENT_ACTION_SHAPE,
  readResidentActions,
  reconcileResidentActions,
  assertResidentActionWitnesses,
} from "../packages/villages/src/server/domain/rules/resident-actions.js";
import {
  semanticEvidence,
  semanticContext,
  semanticImmediate,
} from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import assert from "node:assert/strict";
import {
  createSemanticService,
  type SemanticPorts,
} from "../packages/villages/src/server/features/generation/semantic-service.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import {
  readSemanticEffects,
  readSemanticWishCriteria,
  semanticUnit,
} from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import {
  localWishRequirements,
  wishEvidenceAdmission,
} from "../packages/villages/src/server/domain/rules/wish-admission.js";
import { bindWishFacts } from "../packages/villages/src/server/domain/rules/wish-journal.js";
import {
  createSceneWriting,
  type SceneWritingPorts,
} from "../packages/villages/src/server/features/scenes/writing-service.js";
import {
  semanticBlocker,
  continueSemanticDomain,
} from "../packages/villages/src/server/domain/rules/semantic-continuity.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";

async function main() {
  // A door-closing narration is not a resident statement ending contact.
  {
    const farewell = [
      { speakerId: "player", kind: "dialogue", content: "Good night!" },
      { speakerId: "buster", kind: "dialogue", content: "Good night. Watch the step." },
      { speakerId: "__venue_scene__", kind: "narration", content: "He holds the door." },
      { speakerId: "buster", kind: "dialogue", content: "See you tomorrow." },
      { speakerId: "__venue_scene__", kind: "narration", content: "The door clicks shut." },
    ] as any;
    const frozen = JSON.stringify(farewell);
    assert.throws(
      () => semanticImmediate({ moves: [], departures: [], contactEnd: [{ source: 4 }] }, farewell),
      /invalid source/,
    );
    assert.throws(
      () => semanticImmediate({ moves: [], departures: [], contactEnd: [], sceneEnded: { source: 0 } }, farewell),
      /invalid source/,
    );
    const ended = semanticImmediate({ moves: [], departures: [], contactEnd: [], sceneEnded: { source: 1 } }, farewell);
    assert.deepEqual(ended.sceneEnded, { source: 1, speakerId: "buster", quote: "Good night. Watch the step." });
    assert.equal(JSON.stringify(farewell), frozen, "Rejected event binding never rewrites saved prose");
  }

  // Ordinary multi-resident dialogue must not grow optional earlier history without a byte budget.
  {
    const historyState = defaultVillageState();
    historyState.seed = "bounded-system-history";
    historyState.villagers = ["a", "b", "c"].map((characterId) => ({
      characterId,
      cardSnapshot: { id: characterId, name: characterId },
      completedWishes: [],
    })) as any;
    const rows = Array.from({ length: 18 }, (_, index) => ({
      id: "earlier-" + index,
      speakerId: "a",
      role: "assistant",
      kind: "dialogue",
      content: "Unchanged witnessed supper conversation " + index + " " + "river ".repeat(100),
      heardBy: ["a", "b", "c"],
      at: "2026-10-19T06:00:00.000Z",
      zoneId: "common:base",
      delivery: "ordinary",
      contactHidden: false,
      staging: { prose: "render-only ".repeat(80) },
    }));
    const historyScene = {
      id: "supper",
      activeIds: ["a", "b", "c"],
      lines: rows,
      placeId: "missing",
      zoneId: "common:base",
      sceneRevision: 1,
    } as any;
    const original = JSON.stringify(historyScene);
    const bounded = semanticContext(historyScene, historyState, "Tell me about yourselves", true);
    assert(
      Buffer.byteLength(JSON.stringify(bounded.history), "utf8") <= 6000,
      "Earlier System history must stay bounded during ordinary three-resident conversation",
    );
    assert(bounded.history.length > 0 && bounded.history.length < rows.length);
    for (const line of bounded.history) {
      const source = rows.find((row) => row.id === line.id)!;
      assert.equal(line.content, source.content, "Whole evidence text stays exact");
      assert.deepEqual(line.heardBy, source.heardBy, "Witness scope stays exact");
      assert.equal(line.contactHidden, source.contactHidden);
      assert.equal(line.delivery, source.delivery);
    }
    assert.equal(bounded.history.at(-1)?.id, rows.at(-1)?.id, "Recent conversational context remains available");
    assert.equal(JSON.stringify(historyScene), original, "Prompt projection never edits saved dialogue");
    assert.equal(
      semanticContext(historyScene, historyState, "legacy", false).history.length,
      rows.length,
      "Legacy fresh admissions retain their existing context shape",
    );
  }

  // Enforce JSON-mode compatibility using actual Events and offscreen review prompts.
  const { createVillageBootstrap } =
    await import("../packages/villages/src/server/features/founding/village-bootstrap-service.js");
  const { deriveVillageMoment } = await import("../packages/villages/src/server/domain/rules/village-clock.js");
  const eventMoment = deriveVillageMoment({
    foundedAt: "2026-10-16T00:00:00.000Z",
    seed: "json-mode",
    now: new Date("2026-10-16T12:00:00.000Z"),
  });
  const opportunity = {
    id: "offered",
    kind: "routine",
    actorIds: ["a"],
    venueId: "room",
    startsAt: eventMoment.instant,
    endsAt: eventMoment.instant,
    facts: [],
  };
  const spokenLines = [{ speakerId: "a", text: "Tea is ready." }];
  const jsonCalls: string[] = [];
  const fakeSystem = {
    model: "fake-system",
    connectionId: "system",
    maxOutputTokens: 4096,
    fitContext: (messages: unknown, options: any) => ({ messages, ...options, trimmed: false }),
  };
  const events = createVillageBootstrap({
    villagesLanguageModels: () => ({ resolveForRequest: async () => fakeSystem }),
    villagesConnectionIdFor: async () => "system",
    backgroundCalls: { getStore: () => undefined },
    villagesDebugAgentsEnabled: () => false,
    villagesLogger: () => ({ debugOverride: () => {} }),
    completeWithRoom: async (_model: unknown, messages: any[], _tokens: number, options: any) => {
      assert.equal(options.responseFormat?.type, "json_object");
      assert(
        messages.some((message) => message.role === "system" && /\bjson\b/i.test(message.content)),
        "Strict provider rejects JSON mode without application-authored JSON instruction",
      );
      const review = messages[0].content.startsWith("Independently interpret");
      jsonCalls.push(review ? "review" : "events");
      if (review)
        assert.deepEqual(JSON.parse(messages[1].content).lines, spokenLines, "Review preserves supplied speech");
      return {
        finishReason: "stop",
        content: JSON.stringify(
          review
            ? { memoryChanges: [], relationshipReview: { changes: [], permissions: [], disclosures: [] } }
            : {
                happenings: [
                  {
                    opportunityId: opportunity.id,
                    kind: opportunity.kind,
                    actorIds: opportunity.actorIds,
                    venueId: opportunity.venueId,
                    narration: "A kettle steams.",
                  },
                ],
                housingRequests: [],
                social: { encounter: { lines: spokenLines } },
              },
        ),
      };
    },
  } as any);
  const eventResult = await events.proposeHappenings({
    semanticVersion: 2,
    village: "Test",
    setting: "A quiet village",
    moment: eventMoment,
    residents: [],
    recent: [],
    venues: [],
    opportunities: [opportunity],
    lastSimulatedAt: eventMoment.instant,
    forced: false,
    social: { candidates: [], relationships: [] },
  } as any);
  assert.deepEqual(jsonCalls, ["events", "review"]);
  assert.equal(eventResult.happenings.length, 1);
  assert.equal((eventResult.social?.encounter as any).semanticVersion, 2);
  assert.deepEqual((eventResult.social?.encounter as any).lines, spokenLines);

  const state = defaultVillageState();
  state.seed = "synthetic-semantic";
  const scene = coerceSession({
    id: "scene",
    placeId: "none",
    status: "active",
    startedAt: "2026-10-16T12:00:00.000Z",
    semanticVersion: 2,
    processingVersion: 1,
    villageSeed: state.seed,
    participants: [],
    activeIds: [],
    lines: [],
    submissions: [],
  });
  const checkpoints = new Map<string, unknown>();
  const calls: string[] = [];
  const outputRequests: number[] = [];
  let explicitRetry = false;
  let attemptIdentity = "initial";
  const rejected: any[] = [];
  let inputEstimate = 1000;
  let loreReads = 0;
  let accessRows: any[] = [];
  let actionReview: ((packet: any) => any) | undefined;
  let narrationPrompt = "",
    systemPrompt = "";
  let narrativeActions: unknown;
  let behavior: "valid" | "wrong-hash" | "length" | "missing-domain" | "needs-context" | "project-authority" = "valid";
  let lastPacket: any;
  let openingSignal: unknown = null;
  let spoofOpening = false;
  const model = {
    model: "fake-system",
    name: "Fake",
    connectionId: "system",
    maxOutputTokens: 16384,
    fitContext: (messages: unknown, options: { maxTokens: number }) => ({
      messages,
      maxTokens: options.maxTokens,
      estimatedTokensBefore: inputEstimate,
      estimatedTokensAfter: inputEstimate,
      trimmed: false,
    }),
    chatComplete: () => assert.fail("No real provider dispatch is allowed"),
  };
  const ports = {
    venueExplicitRetry: () => explicitRetry,
    venueDebugContext: () => ({ attemptId: attemptIdentity }),
    readVillageState: async () => state,
    readVillageLore: async () => {
      loreReads++;
      return ["Selected lore establishes the setting's supported capabilities."];
    },
    villagesConnectionIdFor: async (role: string) => {
      assert.equal(role, "system");
      return "system";
    },
    villagesLanguageModels: () => ({ resolveForRequest: async () => model }),
    venueOperationSignal: () => undefined,
    venueSavedCheckpoint: (key: string) => checkpoints.get(key),
    rejectVenueCompletion: async (detail: any, options: any) => {
      rejected.push({ detail, options });
    },
    venueCheckpoint: async (key: string, work: () => Promise<unknown>) => {
      if (checkpoints.has(key)) return structuredClone(checkpoints.get(key));
      const result = await work();
      checkpoints.set(key, structuredClone(result));
      return result;
    },
    completeWithRoom: async (
      _model: unknown,
      messages: { content: string }[],
      output: number,
      options: Record<string, unknown>,
    ) => {
      assert.equal(options.retryEmpty, false);
      const isSystem = messages[0].content.startsWith("You interpret Villages gameplay.");
      assert.equal(options.usagePurpose, isSystem ? "checks" : "conversation");
      assert.ok(output <= (isSystem ? 8192 : 4096));
      if (isSystem) {
        systemPrompt = messages.map((m) => m.content).join("\n");
        outputRequests.push(output);
        const combined = JSON.parse(messages[1].content).input.pipelineVersion === 3;
        assert.equal(options.reasoningEffort, combined ? "none" : "low");
        assert.equal(options.replayReasoningEffort, combined ? "low" : undefined);
      }
      assert.equal(options.responseFormat && (options.responseFormat as { type: string }).type, "json_object");
      if (!isSystem) {
        calls.push("narration");
        narrationPrompt = messages.map((m) => m.content).join("\n");
        return {
          finishReason: "stop",
          content: JSON.stringify({
            segments: [{ kind: "narration", text: "The room is quiet." }],
            heardPlayerBy: [],
            ...(spoofOpening
              ? { openingSignal: { kind: "pitch", residentId: "host", quote: "The room is quiet.", playerQuote: "" } }
              : {}),
            ...(narrativeActions !== undefined ? { residentActions: narrativeActions } : {}),
          }),
        };
      }
      const packet = JSON.parse(messages[1].content);
      lastPacket = packet;
      const intent = messages[0].content.includes("Interpret current player intent");
      calls.push(intent ? "intent" : "exchange");
      if (behavior === "needs-context")
        return {
          finishReason: "stop",
          content: JSON.stringify({ sourceHash: packet.sourceHash, needsContext: ["needed-memory"] }),
        };
      const result = intent
        ? {
            status: "resolved",
            timeline: [{ kind: "speech", text: packet.input.message }],
            instructions: "Current ordinary speech; no physical effects.",
            action: null,
            movement: null,
          }
        : {
            openingSignal,
            consistent: true,
            authority: {
              physical: false,
              access: accessRows.some((row) => row.outcome !== "unresolved"),
              projects: false,
              standing: false,
            },
            action: null,
            memoryChanges: [],
            relationshipChanges: { changes: [], permissions: [], disclosures: [] },
            wishChanges: [],
            projectSpeech: [],
            access: accessRows,
            events: { moves: [], departures: [], contactEnd: [] },
          };
      if (behavior === "project-authority" && !intent) Object.assign(result, { projectSpeech: [{}] });
      if (!intent && packet.input.pipelineVersion === 3)
        Object.assign(result, {
          intent: {
            status: "resolved",
            instructions: "",
            action: null,
            movement: null,
            timeline: packet.input.message ? [{ kind: "speech", text: packet.input.message }] : [],
          },
        });
      if (packet.input.residentActions && actionReview) {
        const review = actionReview(packet),
          actions = [...packet.input.residentActions, ...(review?.additionalActions ?? [])];
        Object.assign(result, {
          residentActionReview: review,
          access: [],
          authority: {
            physical: false,
            projects: false,
            access: actions.some((a) => a.duration === "visit"),
            standing: actions.some((a) => a.duration === "standing"),
          },
        });
      }
      Object.assign(result, { openingContext: { proposalFingerprint: "model-forgery" } });
      if (behavior === "missing-domain") delete (result as Record<string, unknown>).memoryChanges;
      return {
        finishReason: behavior === "length" ? "length" : "stop",
        content: JSON.stringify({ ...result, sourceHash: behavior === "wrong-hash" ? "wrong" : packet.sourceHash }),
      };
    },
  } as unknown as SemanticPorts;
  const service = createSemanticService(ports);
  const intent = await service.intent(scene, "We can discuss it.");
  assert.equal(intent.status, "resolved");
  const result = await service.exchange(scene, "We can discuss it.", [], intent);
  assert.deepEqual(result.effects.memoryChanges, []);
  assert.deepEqual(calls, ["intent", "exchange"]);
  assert.deepEqual(outputRequests, [4096, 8192], "Intent and exchange have distinct bounded allowances");
  await service.intent(scene, "We can discuss it.");
  await service.exchange(scene, "We can discuss it.", [], intent);
  assert.equal(calls.length, 2, "saved identical stage results replay without dispatch");
  assert.equal(loreReads, 2, "Each principal packet freezes selected lore once; replay fetches no new lore");
  assert(lastPacket.input.context.lore.includes("Selected lore establishes the setting's supported capabilities."));
  const intentKey = [...checkpoints.keys()].find(
    (key) => key.startsWith("semantic-v2:intent:") && !key.endsWith(":input"),
  )!;
  checkpoints.delete(intentKey);
  state.seed = "Changed after the request was saved";
  const resumed = await service.intent(scene, "We can discuss it.");
  assert.equal(
    resumed.sourceHash,
    intent.sourceHash,
    "Recovery uses the frozen source despite intervening world changes",
  );
  state.seed = scene.villageSeed!;
  const legacyKey = intentKey + ":input";
  const legacy = checkpoints.get(legacyKey) as any;
  legacy.output = 2400;
  delete legacy.outputPolicy;
  const frozenEvidence = structuredClone(legacy);
  checkpoints.delete(intentKey);
  await service.intent(scene, "We can discuss it.");
  assert.equal(outputRequests.at(-1), 2400, "Non-explicit recovery keeps its saved allowance");
  checkpoints.delete(intentKey);
  explicitRetry = true;
  attemptIdentity = "budget-retry-1";
  await service.intent(scene, "We can discuss it.");
  assert.equal(outputRequests.at(-1), 4096, "Explicit retry refreshes the legacy allowance");
  assert.deepEqual(
    checkpoints.get(legacyKey),
    frozenEvidence,
    "Budget refresh cannot reread or replace frozen evidence",
  );
  const replayCalls = calls.length;
  attemptIdentity = "completed-retry";
  await service.intent(scene, "We can discuss it.");
  assert.equal(calls.length, replayCalls, "Completed interpretation stays cached on explicit retry");
  checkpoints.delete(intentKey);
  model.maxOutputTokens = 3072;
  attemptIdentity = "budget-retry-2";
  await service.intent(scene, "We can discuss it.");
  assert.equal(outputRequests.at(-1), 3072, "Connection cap remains authoritative");
  assert.deepEqual(checkpoints.get(legacyKey), frozenEvidence);
  model.maxOutputTokens = 16384;
  const legacyExchange = checkpoints.get(result.checkpointKey + ":input") as any;
  legacyExchange.output = 2400;
  delete legacyExchange.outputPolicy;
  const originalExchange = structuredClone(legacyExchange);
  checkpoints.delete(result.checkpointKey);
  attemptIdentity = "exchange-budget-retry";
  await service.exchange(scene, "We can discuss it.", [], intent);
  assert.equal(outputRequests.at(-1), 8192, "Failed legacy exchange receives its task allowance on explicit retry");
  assert.deepEqual(checkpoints.get(result.checkpointKey + ":input"), originalExchange);
  explicitRetry = false;
  checkpoints.delete(result.checkpointKey);
  await service.exchange(scene, "We can discuss it.", [], intent);
  assert.equal(
    outputRequests.at(-1),
    8192,
    "Restart recovery reuses the admitted retry allowance, preserving the completion fingerprint",
  );
  assert.deepEqual(checkpoints.get(result.checkpointKey + ":input"), originalExchange);

  inputEstimate = 12001;
  const beforeBudget = calls.length;
  await assert.rejects(service.intent(scene, "A request exceeding the reserved context"), /does not fit/);
  assert.equal(calls.length, beforeBudget, "Budget exhaustion dispatches nothing");
  inputEstimate = 1000;
  behavior = "wrong-hash";
  await assert.rejects(service.intent(scene, "Another input"), /different source/);
  assert.equal(rejected.at(-1).options.preserveWriting, true);
  assert(
    rejected.at(-1).options.stages[0].startsWith("semantic-v2:intent:"),
    "Only the failed semantic stage is replaceable",
  );
  behavior = "length";
  await assert.rejects(service.intent(scene, "Truncated input"), /truncated/);
  behavior = "missing-domain";
  const partial = await service.exchange(scene, "Partial", [], null);
  assert.equal(partial.effects.memoryChanges, undefined, "missing is not an empty successful domain");
  assert.deepEqual(partial.effects.wishChanges, []);
  const sanitized = readSemanticEffects(
    { sourceHash: "x", memoryChanges: [{ systemVerification: "supported", semanticVersion: 2, text: "test" }] },
    "x",
  );
  assert.deepEqual(sanitized.memoryChanges, [{ text: "test" }]);
  const venue = {
    id: "access-venue",
    name: "House",
    residentIds: ["host"],
    classes: ["residence"],
    occupancy: { playerHome: false, residentCharacterId: "host" },
    zones: ["room", "other"].map((id) => ({
      ...defaultVenueSpace("residence"),
      id,
      name: id,
      kind: "restricted",
      ownerId: "host",
    })),
  } as any;
  initializeVenueAccess(venue);
  state.venues.push(venue);
  const accessLine = {
    kind: "dialogue",
    speakerId: "host",
    content: "Stay beside me; we can go through this way.",
    heardBy: ["host"],
    playerHeard: true,
  } as any;
  const row = {
    actorId: "host",
    visitorId: "player",
    venueId: venue.id,
    zoneId: "room",
    outcome: "invite-now",
    duration: "visit",
    conditions: ["accompanied"],
    accompanies: true,
    evidence: [0],
  };
  accessRows = [row, { ...row, zoneId: "other" }];
  behavior = "valid";
  const invitations = await service.exchange(scene, "Two scoped invitations", [accessLine], null);
  assert.equal(invitations.access?.checks.length, 2);
  assert.equal((invitations.access?.checks[0].facts as any).accessCommand.accompanied, true);
  accessRows = [{ ...row, outcome: "unresolved", conditions: ["after the meeting"] }];
  assert.equal((await service.exchange(scene, "Conditional scope", [accessLine], null)).authority.access, false);
  accessRows = [{ ...row, conditions: ["after the meeting"] }];
  await assert.rejects(
    service.exchange(scene, "Unsupported condition", [accessLine], null),
    /condition is unsupported/,
  );
  accessRows = [{ ...row, actorId: "stranger" }];
  await assert.rejects(service.exchange(scene, "Wrong issuer", [accessLine], null), /lacks current authority/);
  const command = {
    action: "invite",
    zoneId: "room",
    visitorId: "player",
    duration: "visit",
    accompanied: true,
    outsideHours: false,
  };
  for (const changed of [
    { zoneId: "other" },
    { visitorId: "host" },
    { duration: "standing" },
    { accompanied: false },
  ]) {
    accessRows = [{ ...row, outcome: "access-management", command: { ...command, ...changed } }];
    await assert.rejects(
      service.exchange(scene, "Scope mismatch " + JSON.stringify(changed), [accessLine], null),
      /does not match/,
    );
  }
  accessRows = [];
  state.venues = [];
  scene.activeIds = ["host"];
  state.chronicle = [
    {
      id: "needed-memory",
      kind: "event",
      scope: "private",
      text: "The exact condition is only after supper.",
      knownByCharacterIds: ["host"],
      actors: [{ id: "host" }],
      at: scene.startedAt,
    },
  ] as any;
  behavior = "needs-context";
  const beforeContext = calls.length;
  await assert.rejects(service.intent(scene, "Need historical context"), /Additional System context is saved/);
  assert.equal(calls.length, beforeContext + 1, "Context requests never automatically dispatch a second inference");
  behavior = "valid";
  await service.intent(scene, "Need historical context");
  assert.equal(calls.length, beforeContext + 2);
  assert.equal(lastPacket.input.context.expandedContext, true);
  assert(lastPacket.input.context.memories.some((row: any) => row.text === state.chronicle[0].text));
  scene.activeIds = [];
  state.chronicle = [];
  assert.equal(
    semanticUnit("memory", { kind: "passing", text: "one", evidence: [2, 1] }),
    semanticUnit("memory", { kind: "passing", text: "two", evidence: [1, 2] }),
  );
  behavior = "valid";
  checkpoints.clear();
  calls.length = 0;
  behavior = "project-authority";
  await assert.rejects(service.exchange(scene, "Invalid Project authority", [], null), /inconsistent \(projects\)/u);
  behavior = "valid";
  checkpoints.clear();
  calls.length = 0;
  const writerPorts = {
    ...ports,
    semantic: service,
    villagesConnectionIdFor: async () => "narration",
    readEffectiveVillagerCard: () => assert.fail("No actors in this fixture"),
    readVillageLore: async () => [],
    villagesLogger: () => ({ warn() {} }),
    measurePipeline: async (_label: string, _metadata: unknown, work: () => Promise<unknown>) => work(),
    runtimeDebug() {},
    venueOperationId: () => "operation",
    venueOperationInput: () => ({ interactionScopeVersion: 1 }),
    rejectVenueCompletion: () => assert.fail("A consistent synthetic turn should not be rejected"),
    wishFingerprint: () => "",
    refreshZoneParticipants: async (current: unknown) => current,
    interpretRoomReply: () => assert.fail("The legacy room/Decisions call must be replaced"),
  } as unknown as SceneWritingPorts;
  const generated = await createSceneWriting(writerPorts).generate(scene, "Ordinary conversation", "chat", "", null);
  assert.equal(generated.lines[0].content, "The room is quiet.");
  assert.equal(generated.semanticProvenance?.version, 2);
  assert.deepEqual(
    calls,
    ["intent", "narration", "exchange"],
    "actual Scene writer uses exactly the new three-stage call graph",
  );
  // Narration cannot advance the opening; only frozen, cited System evidence can.
  state.opening = initialOpening(["host"], "none", "system-opening");
  state.opening.stage = "conversations";
  state.opening.proposals = [
    {
      residentId: "host",
      name: "Sky Terrace",
      description: "A small shared terrace",
      situation: "Enjoying the sky",
      venueClass: "community",
      established: false,
      provenance: "The open sky",
      work: "Arrange a shared observation",
      firstUse: "Watch the sky together",
    },
  ];
  spoofOpening = true;
  checkpoints.clear();
  const forged = await createSceneWriting(writerPorts).generate(
    scene,
    "Another ordinary conversation",
    "chat",
    "",
    null,
  );
  assert.equal(
    forged.openingSignal,
    undefined,
    "Forged Narration metadata is ignored when System finds no opening event",
  );
  scene.activeIds = ["host"];
  const pitchLine = {
    speakerId: "host",
    role: "assistant",
    kind: "dialogue",
    content: "We could arrange Sky Terrace for watching the sky together.",
    heardBy: ["host"],
  } as any;
  assert(
    !openingSceneDirection(state, scene, false).includes("openingSignal"),
    "Narration receives story direction without semantic output instructions",
  );
  openingSignal = { kind: "pitch", residentId: "host", quote: pitchLine.content, playerQuote: "" };
  const pitched = await service.exchange(scene, "Tell me your idea", [pitchLine], null);
  assert.deepEqual(pitched.effects.openingSignal, openingSignal);
  assert.deepEqual(pitched.effects.openingContext, { stage: "conversations", projectId: "" });
  const bound = await service.exchange(
    { ...scene, operation: { input: { semanticPipelineVersion: 3 } } } as any,
    "Bound opening proposal",
    [pitchLine],
    null,
  );
  assert.equal(
    (bound.effects.openingContext as any).proposalFingerprint,
    openingProposalFingerprint(state.opening.proposals[0]),
    "System binds the actual frozen prepared proposal, never a field supplied by the model",
  );
  const boundCalls = calls.length,
    frozenFingerprint = (bound.effects.openingContext as any).proposalFingerprint;
  const originalWork = state.opening.proposals[0].work;
  state.opening.proposals[0].work = "Changed work under the same title";
  const boundReplay = await service.exchange(
    { ...scene, operation: { input: { semanticPipelineVersion: 3 } } } as any,
    "Bound opening proposal",
    [pitchLine],
    null,
  );
  assert.equal(calls.length, boundCalls, "Saved System result is reused without a new request");
  assert.equal(
    (boundReplay.effects.openingContext as any).proposalFingerprint,
    frozenFingerprint,
    "Replay retains frozen preparation identity",
  );
  state.opening.proposals[0].work = originalWork;
  const beforeReplay = calls.length;
  state.opening.stage = "ended";
  await service.exchange(scene, "Tell me your idea", [pitchLine], null);
  assert.equal(
    calls.length,
    beforeReplay,
    "Saved System opening result replays without another request after context changes",
  );
  state.opening.stage = "gathering";
  openingSignal = undefined;
  const gathering = await service.exchange(scene, "Ordinary gathering chat", [pitchLine], null);
  assert.equal(gathering.effects.openingSignal, undefined);
  assert.deepEqual(gathering.effects.openingContext, { stage: "gathering", projectId: "" });
  openingSignal = { kind: "pitch", residentId: "host", quote: pitchLine.content, playerQuote: "" };
  await assert.rejects(
    service.exchange(scene, "Forged gathering pitch", [pitchLine], null),
    /opening evidence did not validate/,
  );
  state.opening.stage = "conversations";
  openingSignal = undefined;
  await assert.rejects(
    service.exchange(scene, "Missing opening metadata", [pitchLine], null),
    /opening interpretation is incomplete/,
  );
  openingSignal = { kind: "pitch", residentId: "host", quote: "Invented evidence", playerQuote: "" };
  await assert.rejects(
    service.exchange(scene, "Invalid opening metadata", [pitchLine], null),
    /opening evidence did not validate/,
  );
  assert.equal(rejected.at(-1).options.preserveWriting, true, "Invalid System metadata retains the draft");
  openingSignal = { kind: "pitch", residentId: "host", quote: pitchLine.content, playerQuote: "" };
  await assert.rejects(
    service.exchange(scene, "Unheard opening metadata", [{ ...pitchLine, contactHidden: true }], null),
    /opening evidence did not validate/,
  );
  assert.doesNotMatch(
    systemPrompt,
    /intent belongs inside|Return \{sourceHash,intent:/,
    "Legacy exchange prompts do not require combined intent",
  );
  state.opening = undefined;
  scene.activeIds = [];
  openingSignal = null;
  spoofOpening = false;
  checkpoints.clear();
  calls.length = 0;
  const combinedScene = { ...scene, operation: { input: { semanticPipelineVersion: 3 } } } as typeof scene;
  const combinedWriter = createSceneWriting({
    ...writerPorts,
    venueOperationInput: () => ({ semanticPipelineVersion: 3 }),
  });
  const combined = await combinedWriter.generate(combinedScene, "Two request conversation", "chat", "", null);
  assert.deepEqual(calls, ["narration", "exchange"], "Current writer checks input and reply with one System request");
  assert.equal(combined.semanticProvenance?.pipelineVersion, 3);
  assert.equal(combined.semanticProvenance?.authority?.physical, false);
  // Invalid Project metadata must retain the exact bounded rejection reason.
  {
    const projectWorld = structuredClone(state);
    projectWorld.projects = [
      {
        id: "diagnostic-project",
        title: "Shared shelf",
        status: "active",
        lifecycle: { phase: "requirements", builderId: "host", affectedIds: [], requirements: [], sources: [] },
      },
    ] as any;
    projectWorld.progressTasks = [
      { definition: { owner: { kind: "project", id: "diagnostic-project" }, revision: 1 } },
    ] as any;
    const projectScene = {
      ...combinedScene,
      activeIds: ["host"],
      participants: [{ characterId: "host", name: "Host", doing: "Planning" }],
    } as typeof combinedScene;
    const speech = "We need timber, a clamp, and oil.";
    const validProject = {
      projectId: "diagnostic-project",
      revision: 1,
      kind: "requirements",
      speakerId: "host",
      citations: [{ segment: 0, quote: speech }],
      checklist: [
        { category: "structure", title: "timber", needed: true, citation: 0 },
        { category: "equipment", title: "clamp", needed: true, citation: 0 },
        { category: "finish", title: "oil", needed: true, citation: 0 },
      ],
    };
    const cases = [
      {
        change: (row: typeof validProject) => {
          row.projectId = "unavailable";
        },
        error: /unavailable context/u,
      },
      {
        change: (row: typeof validProject) => {
          row.revision = 2;
        },
        error: /stale revision/u,
      },
      {
        change: (row: typeof validProject) => {
          row.checklist[0].title = "x".repeat(101);
        },
        error: /1.100 characters/u,
      },
      {
        change: (row: typeof validProject) => {
          row.checklist.pop();
        },
        error: /all three checklist categories/u,
      },
      {
        change: (row: typeof validProject) => {
          row.citations[0].quote = "Unspoken consent";
        },
        error: /speaker's saved words/u,
      },
    ];
    for (const fixture of cases) {
      checkpoints.clear();
      const row = structuredClone(validProject);
      fixture.change(row);
      let narrationReads = 0;
      const before = JSON.stringify({ projectWorld, projectScene, row });
      const diagnosticWriter = createSceneWriting({
        ...writerPorts,
        readVillageState: async () => projectWorld,
        rejectVenueCompletion: async () => {},

        readEffectiveVillagerCard: async () => ({ id: "host", name: "Host", description: "Builder" }),
        venueOperationInput: () => ({
          semanticPipelineVersion: 3,
          writingContractVersion: 3,
          writingCapabilities: {
            management: false,
            movement: false,
            residences: false,
            residenceDecision: false,
            editApproval: false,
          },
        }),
        semantic: {
          exchange: async () => ({
            version: 2,
            sourceHash: "a".repeat(64),
            authority: { projects: true },
            effects: { projectSpeech: [row] },
            access: null,
          }),
        },
        completeWithRoom: async () => {
          narrationReads++;
          return {
            finishReason: "stop",
            content: JSON.stringify({
              playerSpeechCapture: { status: "silent", utterances: [] },
              heardPlayerBy: [],
              segments: [{ kind: "dialogue", speakerId: "host", text: speech, heardBy: ["host"] }],
            }),
          };
        },
      } as unknown as SceneWritingPorts);
      await assert.rejects(diagnosticWriter.generate(projectScene, "", "chat", "host", null), fixture.error);
      assert.equal(narrationReads, 1, "Validation never regenerates the already-read response");
      assert.equal(
        JSON.stringify({ projectWorld, projectScene, row }),
        before,
        "Rejected evidence and Scene remain intact",
      );
    }
  }
  const processing = createExchangeProcessing({
    seed: state.seed,
    sceneId: scene.id,
    submissionId: "t",
    order: 0,
    lineIds: ["l"],
    actionReceiptIds: [],
  });
  const turn = { id: "t", semanticProvenance: generated.semanticProvenance, semanticReady: false, processing } as any;
  const pendingScene = { ...scene, submissions: [turn] };
  assert.match(semanticBlocker(pendingScene)!, /recovery/);
  turn.semanticReady = true;
  for (const row of Object.values(processing.domains)) row.status = "applied";
  processing.domains.memories.status = "failed";
  assert.match(semanticBlocker(pendingScene)!, /Continue/);
  turn.semanticProvenance.pipelineVersion = 3;
  assert.equal(semanticBlocker(pendingScene), null, "Optional memory failure does not block new play");
  turn.semanticProvenance.pipelineVersion = undefined;
  continueSemanticDomain(turn, "memories");
  assert.equal(semanticBlocker(pendingScene), null);
  turn.semanticProvenance.authority = { standing: true };
  processing.domains.relationships.status = "failed";
  assert.throws(() => continueSemanticDomain(turn, "relationships"), /Only a failed semantic update/);
  processing.domains.relationships.status = "applied";
  turn.semanticProvenance.authority = {};
  processing.domains.wishes.status = "pending";
  assert.throws(() => continueSemanticDomain(turn, "wishes"), /Only a failed/);
  assert.equal(semanticBlocker(pendingScene), "Updates pending.");
  assert.equal(
    coerceSession({ ...scene, semanticVersion: undefined }).semanticVersion,
    undefined,
    "legacy Scenes are not upgraded on read",
  );
  assert.equal(coerceSession(scene).semanticVersion, 2);
  const visible = publicSceneResponse({
    semanticIntent: intent,
    semanticProvenance: { version: 2 },
    content: "Visible",
  }) as Record<string, unknown>;
  assert.equal(visible.semanticIntent, undefined);
  assert.equal(visible.semanticProvenance, undefined);
  assert.equal(visible.content, "Visible");
  const wish = { id: "wish", wish: "Help me navigate this difficult conversation" } as any;
  const criteria = readSemanticWishCriteria({ kind: "conversation", requiresPhysical: false }, wish.wish)!;
  assert.equal(
    readSemanticWishCriteria({ kind: "transfer", itemName: "cup", requiresPhysical: false }, "Transfer a cup"),
    undefined,
  );
  assert.equal(
    readSemanticWishCriteria(
      { kind: "action", predicate: "item-added", target: "cup", requiresPhysical: false },
      "Place a cup",
    ),
    undefined,
  );
  assert.equal(
    readSemanticWishCriteria(
      { kind: "action", predicate: "item-added", target: "", requiresPhysical: true },
      "Place a cup",
    ),
    undefined,
  );
  for (const predicate of ["item-added", "item-removed"]) {
    const itemCriteria = { kind: "action", predicate, itemName: "cup", requiresPhysical: true };
    assert.equal(readSemanticWishCriteria(itemCriteria, "A physical cup change")?.target, "cup");
    assert.equal(
      readSemanticWishCriteria({ ...itemCriteria, target: "" }, "A cup change"),
      undefined,
      "an explicitly empty target is not replaced by a different field",
    );
    assert.equal(readSemanticWishCriteria({ ...itemCriteria, requiresPhysical: false }, "A cup change"), undefined);
  }
  assert.equal(
    readSemanticWishCriteria(
      { kind: "action", predicate: "trace-resolved", itemName: "cup", requiresPhysical: true },
      "Resolve a trace",
    ),
    undefined,
    "an item name cannot guess a trace target",
  );
  assert.equal(localWishRequirements(wish, criteria).criteria, criteria);
  assert.ok(
    wishEvidenceAdmission(wish, [], [], criteria).admitted,
    "System classification is not overruled by greeting vocabulary",
  );
  const line = {
    id: "l",
    speakerId: "a",
    heardBy: ["a"],
    content: "A quiet room would make that possible.",
    kind: "dialogue",
  } as any;
  assert.equal(
    bindWishFacts([{ kind: "condition", quote: line.content, evidence: ["l"] }], "a", [line], String).length,
    0,
  );
  assert.equal(
    bindWishFacts([{ kind: "condition", quote: line.content, evidence: ["l"] }], "a", [line], String, true).length,
    1,
  );
  // New resident actions share a single contract between Narration, System and authoritative effects.
  const topologyVenue = structuredClone(venue);
  topologyVenue.zones = [
    { ...topologyVenue.zones[0], id: "exterior", name: "Entrance", kind: "exterior", seen: true, connectedTo: [] },
    {
      ...topologyVenue.zones[0],
      id: "unseen",
      name: "SECRET INTERIOR",
      kind: "private-residence",
      seen: false,
      connectedTo: ["exterior"],
    },
  ] as any;
  const topologyScene = {
    ...scene,
    placeId: topologyVenue.id,
    zoneId: "exterior",
    sceneAttendance: { capturedAt: scene.startedAt, occupants: [], layout: captureSceneLayout(topologyVenue) },
    operation: { kind: "turn", input: { interactionScopeVersion: 6 } },
  } as typeof scene;
  const topologyState = { ...state, venues: [topologyVenue] };
  const knownOnly = semanticContext(topologyScene, topologyState, "May I visit?", true);
  const authorityContext = semanticContext(topologyScene, topologyState, "May I visit?", true, true);
  assert.deepEqual(
    authorityContext.zones.map((z) => z.id),
    ["exterior"],
  );
  assert.deepEqual(authorityContext.accessScopes.find((z) => z.id === "exterior")?.adjacentZoneIds, ["unseen"]);
  assert.deepEqual(authorityContext.accessScopes.find((z) => z.id === "unseen")?.adjacentZoneIds, ["exterior"]);
  assert.equal(authorityContext.accessScopes.find((z) => z.id === "unseen")?.kind, "private-residence");
  assert.doesNotMatch(JSON.stringify(authorityContext.accessScopes), /SECRET INTERIOR|condition|items|occupants/);
  assert(
    !knownOnly.accessScopes.some((z) => Object.hasOwn(z, "adjacentZoneIds")),
    "Legacy packets keep their exact context shape",
  );
  const topologyService = createSemanticService({
    ...ports,
    readVillageState: async () => topologyState,
    venueSavedCheckpoint: () => undefined,
    venueCheckpoint: async (_key: string, work: () => Promise<any>) => work(),
    completeWithRoom: async (_model: any, messages: any[]) => {
      const packet = JSON.parse(messages[1].content);
      return {
        finishReason: "stop",
        content: JSON.stringify({
          sourceHash: packet.sourceHash,
          consistent: true,
          authority: { physical: false, access: false, projects: false, standing: false },
          action: null,
          access: [],
          memoryChanges: [],
          wishChanges: [],
          projectSpeech: [],
          relationshipChanges: { changes: [], permissions: [], disclosures: [] },
          events: { moves: [], departures: [], contactEnd: [] },
          intent: {
            status: "resolved",
            instructions: "",
            action: null,
            movement: null,
            timeline: [{ kind: "movement", text: packet.input.message, zoneId: "unseen" }],
          },
        }),
      };
    },
  } as any);
  const topologyAdmission = {
    ...topologyScene,
    operation: { input: { semanticPipelineVersion: 3, residentActionsVersion: 2 } },
  } as typeof scene;
  const topologyBefore = structuredClone(topologyScene);
  const movedIntent = await topologyService.exchange(topologyAdmission, "I step through the doorway.", [], null);
  assert.equal(
    movedIntent.intent!.timeline[0].zoneId,
    "unseen",
    "Server-supplied access topology IDs can identify movement destinations without interior knowledge",
  );
  assert.deepEqual(topologyScene, topologyBefore);
  assert.equal(
    topologyVenue.zones[1].seen,
    false,
    "Interpreting destination identity does not reveal its state or grant entry",
  );
  await assert.rejects(
    topologyService.exchange(
      {
        ...topologyAdmission,
        operation: { input: { semanticPipelineVersion: 3, residentActionsVersion: 1 } },
      } as typeof scene,
      "I step through the doorway.",
      [],
      null,
    ),
    /invalid or reordered spans/,
    "Legacy context without authoritative topology retains its visible-zone restriction",
  );
  const reviewFor = (evidence: any[], proposed: any[], additional: any[] = []) => ({
    version: 1,
    additionalActions: additional,
    decisions: [...proposed, ...additional].map((a) => ({
      id: a.id,
      status: "accepted",
      reason: "Current witnessed scope",
    })),
    coverage: evidence.flatMap((line, i) =>
      line.playerHeard && line.speakerId !== "player"
        ? [
            {
              segment: i,
              status: [...proposed, ...additional].some((a) => a.source.quote === line.content) ? "actions" : "none",
              actionIds: [...proposed, ...additional].filter((a) => a.source.quote === line.content).map((a) => a.id),
              reason: "Current segment checked",
            },
          ]
        : [],
    ),
  });
  const makeAction = (quote: string, changes: any = {}) => ({
    id: "invitation",
    actorId: "host",
    visitorId: "player",
    source: { speakerId: "host", quote },
    venueId: venue.id,
    zoneId: "room",
    outcome: "invite-now",
    duration: "visit",
    conditions: [],
    accompanies: false,
    ...changes,
  });
  const evidenceFor = (quote: string) => semanticEvidence([{ ...accessLine, content: quote }]);
  for (const quote of [
    "There's a place at my table for you.",
    "The front room is yours to visit while we talk.",
    "Come in, mind the crates.",
  ]) {
    const actions = readResidentActions([makeAction(quote)]),
      evidence = evidenceFor(quote);
    const reconciled = reconcileResidentActions(actions, reviewFor(evidence, actions), evidence);
    assert.equal(reconciled.access[0].zoneId, "room");
    assert.deepEqual(reconciled.access[0].evidence, [0]);
    assert.equal(reconciled.permissions.length, 0, "A natural invitation grants only a visit");
  }
  assert.throws(() => readResidentActions(undefined), /metadata is incomplete/);
  const actions = readResidentActions([makeAction("Sit beside me.")]),
    evidence = evidenceFor("Sit beside me."),
    review = reviewFor(evidence, actions);
  for (const change of [
    (r) => (r.decisions = []),
    (r) => (r.decisions[0].status = "rejected"),
    (r) => (r.decisions[0].status = "unresolved"),
    (r) => (r.coverage = []),
    (r) => (r.coverage[0].status = "none"),
    (r) => (r.coverage[0].actionIds = []),
    (r) => (r.additionalActions = [...actions]),
  ]) {
    const invalid = structuredClone(review);
    change(invalid);
    assert.throws(() => reconcileResidentActions(actions, invalid, evidence), /retained/);
  }
  // A redundant player:none row and same-actor corroboration do not change the scoped action.
  const redundantEvidence = semanticEvidence([
    { ...accessLine, role: "user", speakerId: "player", content: "May I visit?" },
    { ...accessLine, content: "Sit beside me." },
    { ...accessLine, content: "A short visit suits me." },
  ] as any);
  const redundantReview = reviewFor(redundantEvidence, actions);
  redundantReview.coverage.unshift({ segment: 0, status: "none", actionIds: [], reason: "Player request" });
  redundantReview.coverage[2] = {
    segment: 2,
    status: "actions",
    actionIds: ["invitation"],
    reason: "Same actor confirms the visit",
  };
  assert.deepEqual(reconcileResidentActions(actions, redundantReview, redundantEvidence).access[0].evidence, [1]);
  for (const mutation of [
    (r: any, e: any[]) => {
      r.coverage[0].status = "actions";
      r.coverage[0].actionIds = ["invitation"];
    },
    (_r: any, e: any[]) => {
      e[2].playerHeard = false;
    },
    (_r: any, e: any[]) => {
      e[2].speakerId = "other";
    },
    (_r: any, e: any[]) => {
      e[2].kind = "narration";
      e[2].speakerId = "__venue_scene__";
      e[2].heardBy = [];
    },
    (r: any) => {
      r.coverage[1] = { segment: 1, status: "none", actionIds: [], reason: "Missing primary source" };
    },
  ]) {
    const r = structuredClone(redundantReview),
      e = structuredClone(redundantEvidence);
    mutation(r, e);
    assert.throws(() => reconcileResidentActions(actions, r, e), /retained/);
  }
  // Redundant witnessed narration cannot broaden the exact accepted dialogue invitation.
  // Reduced provider-free reproduction; saved personal Scene data stays outside the repository.
  const doorwayEvidence = semanticEvidence([
    { ...accessLine, role: "user", speakerId: "player", content: "May I come in?" },
    { ...accessLine, kind: "narration", speakerId: "__venue_scene__", content: "The host opens the door." },
    { ...accessLine, content: "Come in, mind the bucket." },
    { ...accessLine, content: "There is a dry stool inside." },
  ] as any);
  const doorwayActions = readResidentActions([makeAction("Come in, mind the bucket.")]);
  const doorwayReview = reviewFor(doorwayEvidence, doorwayActions);
  doorwayReview.coverage.unshift({ segment: 0, status: "none", actionIds: [], reason: "Player request" });
  doorwayReview.coverage[1] = {
    segment: 1,
    status: "actions",
    actionIds: ["invitation"],
    reason: "Opening the door corroborates the spoken invitation",
  };
  const originalDoorwayReview = structuredClone(doorwayReview);
  const normalizedDoorway = reconcileResidentActions(doorwayActions, doorwayReview, doorwayEvidence);
  assert.deepEqual(normalizedDoorway.access[0].evidence, [2]);
  assert.deepEqual(normalizedDoorway.receipt.review, originalDoorwayReview);
  assert.deepEqual(doorwayReview, originalDoorwayReview);
  assert.deepEqual(normalizedDoorway.receipt.coverageNormalization, [{ segment: 1, actionIds: ["invitation"] }]);
  for (const mutate of [
    (r: any, e: any[]) => {
      r.coverage[1].actionIds.push("unknown");
    },
    (r: any, e: any[]) => {
      r.coverage[1].actionIds.push("invitation");
    },
    (r: any, e: any[]) => {
      e[1].playerHeard = false;
    },
    (r: any, e: any[]) => {
      e[1].heardBy = [];
    },
    (r: any) => {
      r.decisions[0].status = "rejected";
    },
    (r: any) => {
      r.decisions[0].status = "unresolved";
    },
    (r: any) => {
      r.coverage[1].status = "unresolved";
    },
    (r: any) => {
      r.coverage[2].actionIds = [];
      r.coverage[2].status = "none";
    },
  ]) {
    const r = structuredClone(doorwayReview),
      e = structuredClone(doorwayEvidence);
    mutate(r, e);
    assert.throws(() => reconcileResidentActions(doorwayActions, r, e), /retained/);
  }
  const primaryOnlyReview = structuredClone(doorwayReview);
  primaryOnlyReview.coverage[1] = {
    segment: 1,
    status: "none",
    actionIds: [],
    reason: "Door opening is not the primary permission source",
  };
  const primaryOnly = reconcileResidentActions(doorwayActions, primaryOnlyReview, doorwayEvidence);
  assert.deepEqual(primaryOnly.access[0].evidence, [2]);
  assert.equal(primaryOnly.access[0].zoneId, "room");
  assert.equal(primaryOnly.access[0].duration, "visit");
  assert.deepEqual(primaryOnly.permissions, []);
  const missingDoorwaySource = structuredClone(primaryOnlyReview);
  missingDoorwaySource.coverage[2] = { segment: 2, status: "none", actionIds: [], reason: "Source omitted" };
  assert.throws(
    () => reconcileResidentActions(doorwayActions, missingDoorwaySource, doorwayEvidence),
    /Resident action was omitted from its source review/,
  );
  const receipt = reconcileResidentActions(actions, review, evidence).receipt;
  assert.throws(() => assertResidentActionWitnesses(receipt, [{ ...evidence[0]!, playerHeard: false }]), /witnessed/);
  assert.throws(() => assertResidentActionWitnesses(receipt, [{ ...evidence[0]!, heardBy: [] }]), /witnessed/);
  const discovered = reconcileResidentActions([], reviewFor(evidence, [], actions), evidence);
  assert.equal(discovered.access.length, 1, "System can discover a Narration omission in the existing call");
  for (const outcome of ["refuse", "dismiss", "ban-zone"]) {
    const proposed = readResidentActions([makeAction("Please leave this space.", { outcome })]);
    assert.equal(
      reconcileResidentActions(
        proposed,
        reviewFor(evidenceFor("Please leave this space."), proposed),
        evidenceFor("Please leave this space."),
      ).access[0].outcome,
      outcome,
    );
  }
  for (const [first, second] of [
    ["invite-now", "dismiss"],
    ["invite-now", "revoke-standing"],
  ]) {
    const firstAction = makeAction("Sit beside me.", { outcome: first }),
      secondAction = makeAction("That offer has ended.", {
        id: "withdraw",
        outcome: second,
        duration: second === "revoke-standing" ? "standing" : "visit",
      });
    const ordered = [...evidence, ...evidenceFor("That offer has ended.")];
    for (const [proposed, additional] of [
      [[firstAction], [secondAction]],
      [[secondAction], [firstAction]],
    ]) {
      assert.throws(
        () =>
          reconcileResidentActions(readResidentActions(proposed), reviewFor(ordered, proposed, additional), ordered),
        /Conflicting/,
      );
    }
  }
  const conditional = readResidentActions([
    makeAction("Sit beside me.", { conditions: ["after supper"], outcome: "unresolved" }),
  ]);
  assert.throws(
    () => reconcileResidentActions(conditional, reviewFor(evidence, conditional), evidence),
    /clarification/,
  );
  const escorted = readResidentActions([
    makeAction("Sit beside me.", { conditions: ["accompanied"], accompanies: true }),
  ]);
  assert.equal(reconcileResidentActions(escorted, reviewFor(evidence, escorted), evidence).access[0].accompanies, true);
  for (const outcome of ["invite-now", "revoke-standing"]) {
    const proposed = readResidentActions([makeAction("Sit beside me.", { duration: "standing", outcome })]);
    const r = reconcileResidentActions(proposed, reviewFor(evidence, proposed), evidence);
    assert.equal(r.access.length, 0);
    assert.equal(r.permissions[0].action, outcome === "invite-now" ? "grant" : "revoke");
    const invalid = proposed.map((a) => ({ ...a, conditions: ["accompanied"] }));
    assert.throws(
      () => reconcileResidentActions(invalid, reviewFor(evidence, invalid), evidence),
      /Standing permission/,
    );
  }
  const repeated = readResidentActions([
    ...actions,
    { ...actions[0], id: "repeat", source: { speakerId: "host", quote: "Pull up the other chair." } },
  ]);
  const repeatedEvidence = [...evidence, ...evidenceFor("Pull up the other chair.")];
  const folded = reconcileResidentActions(repeated, reviewFor(repeatedEvidence, repeated), repeatedEvidence);
  assert.equal(folded.access.length, 1, "Repeated scoped invitations create one mechanical event");
  assert.deepEqual(folded.access[0].evidence, [0, 1]);
  assert.equal(
    (publicSceneResponse({ residentActionReceipt: receipt, content: "Visible" }) as any).residentActionReceipt,
    undefined,
  );

  behavior = "valid";
  accessRows = [];
  checkpoints.clear();
  calls.length = 0;
  narrativeActions = [];
  actionReview = (p) => reviewFor(p.input.evidence, p.input.residentActions);
  const actionScene = {
    ...combinedScene,
    operation: { input: { semanticPipelineVersion: 3, residentActionsVersion: 2 } },
  } as typeof scene;
  const actionWriter = createSceneWriting({
    ...writerPorts,
    venueOperationInput: () => ({
      semanticPipelineVersion: 3,
      residentActionsVersion: 2,
      writingContractVersion: 3,
      writingCapabilities: {
        management: false,
        movement: false,
        residences: false,
        residenceDecision: false,
        editApproval: false,
      },
    }),
  });
  const actionResult = await actionWriter.generate(actionScene, "A quiet conversation", "chat", "", null);
  assert.deepEqual(calls, ["narration", "exchange"], "Actions use exactly the existing two calls");
  assert.match(narrationPrompt, /Never put speakerId:"player" in segments/);
  assert.doesNotMatch(narrationPrompt, /Represent CURRENT player speech first/);
  assert.match(narrationPrompt, /Unquoted:\{text:"exact span",occurrence:1\}/);
  assert.doesNotMatch(systemPrompt, /access rows use|Permissions use|Relationship permissions describe standing/);
  assert.match(systemPrompt, /Return the complete exchange JSON, never needsContext/);
  assert.doesNotMatch(systemPrompt, /If more context is necessary, return/);
  assert.equal(actionResult.semanticProvenance?.residentActionsVersion, 2);
  assert(
    systemPrompt.includes(
      "events always includes moves, departures and contactEnd arrays, even when empty; never return events:{}",
    ),
  );
  assert(systemPrompt.includes("openingSignal:null,memoryChanges:[]"));
  const rootExchangeExample = systemPrompt.slice(
    systemPrompt.indexOf("Return {sourceHash"),
    systemPrompt.indexOf("Return exactly one JSON object."),
  );
  assert(
    rootExchangeExample.includes("residentActionReview:{version:1,additionalActions:[],decisions:[],coverage:[]}"),
    "The required V2 review belongs in the complete root response example even with no proposed access actions",
  );
  assert(systemPrompt.includes("residentActionReview is required even when residentActions is empty"));
  assert(
    systemPrompt.includes(
      "Every projectSpeech citation must be dialogue spoken by that row's speakerId; never cite narration or player speech",
    ),
    "A saved supply offer repeatedly cited narration as the resident commitment",
  );
  assert(
    systemPrompt.includes("For offer and handoff, requirementId is required"),
    "The live source offer omitted its mandatory supply target under the old optional-field schema",
  );
  assert(
    systemPrompt.includes("An offer alone sets projects:true and physical:false"),
    "Project metadata authority is independent of a completed physical action",
  );

  assert(
    systemPrompt.includes(
      'checklist:[{category:"structure|equipment|finish",title:"1-100 characters",needed:boolean,citation:0}]',
    ),
    "System must receive the checklist item schema required by Project validation",
  );
  assert(
    systemPrompt.includes(
      "For requirements, include exactly three checklist entries, one each for structure, equipment and finish",
    ),
    "An empty requirements checklist interrupted a live opening planning conversation",
  );
  assert(
    systemPrompt.includes("citation is a zero-based index into this row's citations array, not an evidence segment"),
    "Checklist references must bind to the declared speech citations",
  );
  assert(systemPrompt.includes("If the saved speech cannot support all three categories, omit the requirements row"));

  assert(
    systemPrompt.includes("Return {sourceHash,intent:{"),
    "The combined response example must contain required intent inside the single exchange object",
  );
  assert(
    systemPrompt.includes(RESIDENT_ACTION_SHAPE),
    "System needs the full additional-action schema even when Narration proposes []",
  );
  assert.throws(
    () =>
      readResidentActions([
        {
          id: "aqua-standing-afternoons",
          actorId: "host",
          kind: "grant-standing",
          venueId: "home",
          zoneId: "common:base",
          scope: "visit",
          conditions: "afternoons",
          source: 5,
        },
      ]),
    /incomplete|invalid/i,
    "The saved malformed additional action must remain rejected rather than inferred into permission",
  );
  assert(narrationPrompt.includes("within the player's already occupied public Zone do not change access"));
  assert(systemPrompt.includes("within the player's already occupied public Zone do not change access"));
  assert(systemPrompt.includes("Inspect each context.actors entry's wishes independently using actor.id and wish.id."));
  assert(
    systemPrompt.includes(
      "Opening proposals are not Projects: report their pitch only in openingSignal, never projectSpeech.",
    ),
  );
  assert(
    systemPrompt.includes(
      "Memory subjectCharacterIds and knownByCharacterIds contain resident IDs only, never player.",
    ),
  );
  assert(systemPrompt.includes("Never use an opening proposal, its name, or a newly spoken desire as a Wish ID."));
  assert.doesNotMatch(systemPrompt, /lineIds:\["player",0\]/);
  assert.doesNotMatch(systemPrompt, /evidence:\["player",0\]/);
  assert.doesNotMatch(systemPrompt, /"player" means the latest player line/);
  assert(
    systemPrompt.includes(
      'Cite captured player speech by its numeric evidence index; never cite the complete private input as "player".',
    ),
  );
  assert(narrationPrompt.includes("playerSpeechCapture, segments and residentActions (required even when [])"));
  assert(narrationPrompt.includes('"residentActions":[]'));
  assert.doesNotMatch(
    narrationPrompt,
    /omit unused fields\/empty arrays/u,
    "Required empty access-action arrays cannot also be forbidden",
  );
  assert.doesNotMatch(
    narrationPrompt,
    /No effect metadata:/,
    "The envelope cannot contradict required access proposals",
  );
  assert(actionResult.residentActionReceipt?.systemResponse?.includes("residentActionReview"));
  const decodedReceipt = coerceSession({
    ...actionScene,
    submissions: [{ id: "saved", residentActionReceipt: actionResult.residentActionReceipt }],
  }).submissions[0]!.residentActionReceipt;
  assert.deepEqual(
    decodedReceipt,
    actionResult.residentActionReceipt,
    "Complete action decisions and raw System response survive saved Scene decoding",
  );
  await createSceneWriting({
    ...writerPorts,
    semantic: createSemanticService(ports),
    venueOperationInput: () => ({
      semanticPipelineVersion: 3,
      residentActionsVersion: 2,
      writingContractVersion: 3,
      writingCapabilities: {
        management: false,
        movement: false,
        residences: false,
        residenceDecision: false,
        editApproval: false,
      },
    }),
  }).generate(actionScene, "A quiet conversation", "chat", "", null);
  assert.equal(calls.length, 2, "Service reconstruction reuses saved Narration and parsed System response");
  // Simulate interruption after a raw completion, before the parsed checkpoint commits.
  const rawReplies = new Map<string, unknown>();
  let interruptParsed = true;
  const upgradePorts = {
    ...ports,
    completeWithRoom: async (...args: Parameters<typeof ports.completeWithRoom>) => {
      const fingerprint = JSON.stringify(args[1]);
      if (rawReplies.has(fingerprint)) return structuredClone(rawReplies.get(fingerprint));
      const result = await ports.completeWithRoom(...args);
      rawReplies.set(fingerprint, structuredClone(result));
      return result;
    },
    venueCheckpoint: async (key: string, work: () => Promise<unknown>) => {
      if (checkpoints.has(key)) return structuredClone(checkpoints.get(key));
      const result = await work();
      if (interruptParsed && /^semantic-v2:exchange:[a-f0-9]{64}$/.test(key)) {
        interruptParsed = false;
        throw Error("Interrupted before parsed commit");
      }
      checkpoints.set(key, structuredClone(result));
      return result;
    },
  } as unknown as SemanticPorts;
  checkpoints.clear();
  const upgradeService = createSemanticService(upgradePorts);
  const legacyActionScene = {
    ...actionScene,
    operation: { input: { semanticPipelineVersion: 3, residentActionsVersion: 1 } },
  } as typeof scene;
  await assert.rejects(upgradeService.exchange(legacyActionScene, "Upgrade replay", [], null, []), /Interrupted/);
  const rawCallsBeforeReplay = calls.length;
  for (const [key, value] of checkpoints)
    if (key.endsWith(":input")) {
      delete (value as any).instruction;
      delete (value as any).systemPrompt;
      delete (value as any).currentEvidenceOnly;
    }
  await upgradeService.exchange(legacyActionScene, "Upgrade replay", [], null, []);
  assert.equal(calls.length, rawCallsBeforeReplay, "A v1 raw response survives upgrade without a parsed receipt");
  checkpoints.clear();
  interruptParsed = true;
  await assert.rejects(upgradeService.exchange(actionScene, "Frozen prompt", [], null, []), /Interrupted/);
  const frozenRawCalls = calls.length;
  const promptSnapshot = [...checkpoints].find(([key]) => key.endsWith(":input"))![1] as any;
  assert.equal(typeof promptSnapshot.instruction, "string");
  assert.equal(typeof promptSnapshot.systemPrompt, "string");
  // Changing the caller's contract cannot change the already-frozen request's messages.
  await upgradeService.exchange(legacyActionScene, "Frozen prompt", [], null, []);
  assert.equal(calls.length, frozenRawCalls, "Frozen instruction reuses the completed raw response");
  checkpoints.clear();
  state.chronicle = [
    {
      id: "needed-memory",
      kind: "event",
      scope: "private",
      text: "A historical condition.",
      actors: [{ id: "host", name: "Host" }],
      knownByCharacterIds: ["host"],
      at: scene.startedAt,
    },
  ] as any;
  const currentContextScene = { ...actionScene, activeIds: ["host"] };
  behavior = "needs-context";
  const beforeCurrentContext = calls.length;
  await assert.rejects(
    service.exchange(currentContextScene, "Current verdict", [], null, []),
    /did not finish the current Scene verdict/,
  );
  assert.equal(calls.length, beforeCurrentContext + 1, "Current-scene retrieval refusal adds no call");
  assert(![...checkpoints.keys()].some((key) => key.endsWith(":retrieval")));
  const oldPolicySnapshot = [...checkpoints].find(([key]) => key.endsWith(":input"))![1] as any;
  delete oldPolicySnapshot.currentEvidenceOnly;
  delete oldPolicySnapshot.systemPrompt;
  await assert.rejects(
    service.exchange(currentContextScene, "Current verdict", [], null, []),
    /Additional System context is saved/,
  );
  assert.equal(calls.length, beforeCurrentContext + 2, "Older frozen v2 policy retains explicit retrieval behavior");
  behavior = "valid";
  state.chronicle = [];
  state.venues = [venue];
  const checksBefore = calls.length;
  const accessScene = { ...actionScene, placeId: venue.id };
  const permitted = await service.exchange(
    accessScene,
    "A visit",
    [accessLine],
    null,
    readResidentActions([makeAction(accessLine.content)]),
  );
  const room = venue.zones[0],
    other = venue.zones[1],
    context = { sceneId: scene.id };
  assert.equal(evaluateZoneAccess(venue, room, "player", context).allowed, false);
  const accessCommand = (permitted.access!.checks[0].facts as any).accessCommand;
  const originalPosition = accessScene.zoneId,
    originalSeen = room.seen;
  applyAccessCommand(venue, accessCommand, "host", scene.startedAt, ["host", "player"], ["spoken-line"]);
  assert.equal(
    evaluateZoneAccess(venue, room, "player", context).allowed,
    true,
    "Accepted typed invitation opens movement permission",
  );
  assert.equal(
    evaluateZoneAccess(venue, other, "player", context).allowed,
    false,
    "Permission never broadens to another Zone",
  );
  assert.equal(accessScene.zoneId, originalPosition, "Invitation never moves the player");
  assert.equal(room.seen, originalSeen, "Permission never reveals unseen contents");
  const applied = structuredClone(venue.access);
  applyAccessCommand(venue, accessCommand, "host", scene.startedAt, ["host", "player"], ["spoken-line"]);
  assert.deepEqual(venue.access, applied, "Same validated action receipt cannot duplicate permission or revision");
  assert.equal(calls.length, checksBefore + 1);
  assert(lastPacket.input.residentActions.length === 1);
  const changed = readResidentActions([makeAction(accessLine.content, { zoneId: "other" })]);
  await service.exchange(accessScene, "A visit", [accessLine], null, changed);
  assert.equal(
    lastPacket.input.residentActions[0].zoneId,
    "other",
    "Changed action scope cannot reuse an old frozen System packet",
  );
  assert.equal(calls.length, checksBefore + 2);
  const unauthorized = readResidentActions([
    makeAction(accessLine.content, {
      actorId: "stranger",
      source: { speakerId: "__venue_scene__", quote: accessLine.content },
    }),
  ]);
  await assert.rejects(
    service.exchange(accessScene, "Bad authority", [accessLine], null, unauthorized),
    /source is missing/,
  );
  actionReview = () => undefined;
  await assert.rejects(
    service.exchange(accessScene, "Missing disposition", [accessLine], null, actions),
    /review is incomplete/,
  );
  assert(
    rejected.some((row) => row.detail?.reason === "semantic-exchange"),
    "Failed review uses the existing retained-response journal",
  );
  actionReview = (p) => reviewFor(p.input.evidence, p.input.residentActions);
  state.villagers = [{ characterId: "host", cardSnapshot: { name: "Host" } }] as any;
  venue.zones[0].closed = true;
  const standingGrant = readResidentActions([makeAction(accessLine.content, { duration: "standing" })]);
  await assert.rejects(
    service.exchange(accessScene, "Closed standing grant", [accessLine], null, standingGrant),
    /authority/,
  );
  const standingRevoke = readResidentActions([
    makeAction(accessLine.content, { duration: "standing", outcome: "revoke-standing" }),
  ]);
  actionReview = (p) => reviewFor(p.input.evidence, p.input.residentActions);
  const revoked = await service.exchange(accessScene, "Closed standing withdrawal", [accessLine], null, standingRevoke);
  const standingRows = (revoked.effects.relationshipChanges as any).permissions.map((p: any) => ({
    ...p,
    lineIds: ["saved-speech"],
  }));
  assert.equal(
    parseRelationshipReview(
      { changes: [], permissions: standingRows, disclosures: [] },
      "withdrawal",
      [{ ...accessLine, id: "saved-speech", role: "assistant", playerHeard: true }],
      state,
      true,
    ).permissions[0].action,
    "revoke",
    "A closed Zone can still lose standing permission",
  );
  const legacyVenue = structuredClone(venue);
  delete legacyVenue.access;
  legacyVenue.zones[0].kind = "private-residence";
  legacyVenue.zones[0].ownerId = "host";
  legacyVenue.zones[0].closed = false;
  const legacyVillage = { ...state, venues: [legacyVenue] },
    relationshipState = defaultRelationshipState(state.seed),
    stamp = scene.startedAt;
  const standingGrantReview = {
    changes: [],
    disclosures: [],
    permissions: [{ ...standingRows[0], id: "old-grant", action: "grant" }],
  } as any;
  applyRelationshipReview(relationshipState, standingGrantReview, legacyVillage, "grant", stamp, Date.parse(stamp));
  legacyVenue.zones[0].closed = true;
  const withdrawalReview = {
    changes: [],
    disclosures: [],
    permissions: [{ ...standingRows[0], id: "new-revoke", action: "revoke" }],
  } as any;
  const later = new Date(Date.parse(stamp) + 1000).toISOString();
  applyRelationshipReview(relationshipState, withdrawalReview, legacyVillage, "revoke", later, Date.parse(later));
  assert.equal(
    Object.values(relationshipState.grants)[0].revoked,
    true,
    "Closed legacy Zone withdrawal is applied, not silently skipped",
  );
  const once = structuredClone(relationshipState);
  applyRelationshipReview(relationshipState, withdrawalReview, legacyVillage, "revoke", later, Date.parse(later));
  assert.deepEqual(relationshipState, once, "Standing withdrawal replay is idempotent");
  venue.zones[0].closed = false;
  narrativeActions = undefined;
  actionReview = undefined;
  console.log(
    "System ownership: connection routing, independent extraction, replay, failure isolation, evidence identity, privacy and legacy compatibility passed; fake providers only.",
  );
}
void main();
