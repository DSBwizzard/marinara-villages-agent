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
  const rejected: any[] = [];
  let inputEstimate = 1000;
  let loreReads = 0;
  let accessRows: any[] = [];
  let behavior: "valid" | "wrong-hash" | "length" | "missing-domain" | "needs-context" = "valid";
  let lastPacket: any;
  const model = {
    model: "fake-system",
    name: "Fake",
    connectionId: "system",
    maxOutputTokens: 4000,
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
      assert.ok(output <= (isSystem ? 2400 : 4096));
      assert.equal(options.responseFormat && (options.responseFormat as { type: string }).type, "json_object");
      if (!isSystem) {
        calls.push("narration");
        return {
          finishReason: "stop",
          content: JSON.stringify({ segments: [{ kind: "narration", text: "The room is quiet." }], heardPlayerBy: [] }),
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
  console.log(
    "System ownership: connection routing, independent extraction, replay, failure isolation, evidence identity, privacy and legacy compatibility passed; fake providers only.",
  );
}
void main();
