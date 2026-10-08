import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { createHash } from "node:crypto";
import {
  activationScope,
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { readVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";

import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { bindLiveProposals, memoryVersion } from "../packages/villages/src/server/domain/rules/live-exchange.js";
import {
  processLiveMemories,
  processLiveRelationships,
} from "../packages/villages/src/server/features/residents/live-memory.js";
import {
  closeVenueSession,
  endVenueSessionWithReceipts,
  retrySceneChangeInterpretation,
} from "../packages/villages/src/server/features/scenes/venue-session.js";
import {
  readSceneChanges,
  replaySceneChanges,
  dismissSceneNotice,
} from "../packages/villages/src/server/features/scenes/changes.js";
import { processSavedExchange } from "../packages/villages/src/server/features/scenes/progress.js";
import { deleteVenueVisit } from "../packages/villages/src/server/features/scenes/archive.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { responseDiagnostics } from "../packages/villages/src/server/domain/rules/response-diagnostics.js";
import { extractSceneReply } from "../packages/villages/src/server/domain/rules/scene-reply-json.js";
import { selectPromptMemories } from "../packages/villages/src/server/domain/rules/memory-selection.js";
import {
  defaultRelationshipState,
  relationshipFor,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { mutateRelationships } from "../packages/villages/src/server/features/residents/relationship-store.js";

async function liveConnectionOwnership() {
  function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => {
      resolve = done;
    });
    return { promise, resolve };
  }
  const seed = "equal-live-owner";
  const relationshipId = "villages-relationships-" + createHash("sha256").update(seed).digest("hex").slice(0, 24);
  function fixture(label: string, stage?: string) {
    const scope = createActivationScope(),
      entered = deferred(),
      gate = deferred();
    const at = new Date().toISOString(),
      state = defaultVillageState();
    state.seed = seed;
    state.foundedAt = state.setupAt = at;
    state.progressEngineVersion = 1;
    state.villagers = [
      {
        characterId: "a",
        cardSnapshot: { id: "a", name: label, capturedAt: at, revision: 1, sourceStatus: "available" },
        addedAt: at,
        completedWishes: [],
        agenda: unwrittenVillageAgenda(state.venues, "a"),
      } as any,
    ];
    const scene: any = {
      id: "equal-scene",
      villageSeed: seed,
      status: "active",
      memoryMode: "live",
      processingVersion: 1,
      startedAt: at,
      lastActivityAt: at,
      placeId: "mill",
      placeName: "Mill",
      activeIds: ["a"],
      participants: [{ characterId: "a", name: label }],
      lines: [
        {
          id: "player-line",
          role: "user",
          speakerId: "",
          name: "Player",
          content: "We can plant the garden beds on Saturday.",
          at,
          heardBy: ["a"],
        },
        {
          id: "reply-line",
          role: "assistant",
          speakerId: "a",
          name: label,
          kind: "dialogue",
          content: "I will bring seedlings for our Saturday garden planting.",
          at,
          heardBy: ["a"],
        },
      ],
      submissions: [
        {
          id: "equal-turn",
          at,
          liveProposals: bindLiveProposals(
            {
              memoryChanges: [
                {
                  kind: "durable",
                  category: "commitment",
                  text: label + " will bring seedlings on Saturday.",
                  subjectCharacterIds: ["a"],
                  knownByCharacterIds: ["a"],
                  evidence: ["player", 0],
                  memoryIds: [],
                },
              ],
              relationshipChanges: {
                changes: [
                  {
                    fromId: "a",
                    toId: "player",
                    dimension: "warmth",
                    strength: "minor",
                    direction: "increase",
                    ordinary: true,
                    reason: label + " planning together",
                    lineIds: ["player", 0],
                    disclosed: false,
                  },
                ],
                permissions: [],
                disclosures: [],
              },
            },
            "player-line",
            ["reply-line"],
          ),
        },
      ],
    };
    const records = new Map<string, any>([
      ["villages-village", { id: "villages-village", kind: "village", revision: 1, data: state }],
      [
        relationshipId,
        { id: relationshipId, kind: "relationships", revision: 1, data: defaultRelationshipState(seed) },
      ],
    ]);
    const writes: string[] = [];
    let held = false,
      worldReads = 0,
      conflicts = stage === "relationship-save" ? 1 : 0;
    let failure: Error | undefined;
    async function pause(candidate: string) {
      if (!held && stage === candidate) {
        held = true;
        entered.resolve();
        await gate.promise;
      }
    }
    const documents = {
      async getById(_packageId: string, id: string) {
        assert.equal(activationScope(), scope, label + " read owner");
        if (id === "villages-village") await pause(++worldReads === 1 ? "world" : "authority");
        if (failure) throw failure;
        return structuredClone(records.get(id) ?? null);
      },
      async list() {
        return [];
      },
      async create(input: any) {
        throw new Error("Unexpected create: " + input.id);
      },
      async update(input: any) {
        assert.equal(activationScope(), scope, label + " save owner");
        await pause(input.id === relationshipId ? "relationship-save" : "village-save");
        if (failure) throw failure;
        const old = records.get(input.id);
        if (input.id === relationshipId && conflicts-- > 0) {
          records.set(input.id, {
            ...old,
            revision: old.revision + 1,
            data: { ...old.data, reviewedActorIds: ["concurrent"] },
          });
          return null;
        }
        if (!old || old.revision !== input.expectedRevision) return null;
        const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
        records.set(input.id, row);
        writes.push(input.id);
        return structuredClone(row);
      },
      async remove() {
        return false;
      },
    };
    const release = scope.run(() =>
      configureVillagesRuntime({
        persistence: { documents },
        getAgentConfig: async () => {
          throw new Error("Live settlement must not resolve a model");
        },
        logger: { debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} },
      } as any),
    );
    assert.deepEqual(writes, [], "assembly performs no saved-live processing");
    return {
      scope,
      entered,
      gate,
      records,
      writes,
      release,
      scene,
      fail(error?: Error) {
        failure = error;
      },
    };
  }
  for (const stage of ["world", "authority", "village-save", "relationship-save"]) {
    const a = fixture("A", stage),
      b = fixture("B"),
      clearA = installDefaultActivation(a.scope, () => {});
    let clearB = () => {};
    try {
      const pending = processLiveRelationships(a.scene, "equal-turn");
      await Promise.race([
        a.entered.promise,
        pending.then(() => assert.fail("Live processing completed before controlled " + stage + " pause")),
      ]);
      clearB = installDefaultActivation(b.scope, () => {});
      const resultB = await processLiveRelationships(b.scene, "equal-turn");
      clearA();
      a.gate.resolve();
      const resultA = await pending;
      assert.deepEqual(resultA.receiptIds, resultB.receiptIds, "equal IDs stay separate in independent saved worlds");
      for (const owned of [a, b]) {
        const label = owned === a ? "A" : "B",
          relationships = owned.records.get(relationshipId).data;
        assert.equal(relationshipFor(relationships, "a", "player").warmth, 2);
        assert(
          Object.values(relationships.receipts).every(
            (receipt: any) => !receipt.reason || !receipt.reason.includes((label === "A" ? "B" : "A") + " planning"),
          ),
        );
        const before = JSON.stringify(relationships);
        await owned.scope.run(() => processLiveRelationships(owned.scene, "equal-turn"));
        assert.equal(
          relationshipFor(owned.records.get(relationshipId).data, "a", "player").warmth,
          2,
          "saved relationship replay spends no second reward",
        );
        assert.equal(JSON.stringify(owned.records.get(relationshipId).data), before);
        await owned.scope.run(() => processLiveMemories(owned.scene, "equal-turn"));
        const memories = owned.records.get("villages-village").data.chronicle;
        assert.equal(memories.length, 1);
        assert.equal(memories[0].text, label + " will bring seedlings on Saturday.");
        await owned.scope.run(() => processLiveMemories(owned.scene, "equal-turn"));
        assert.equal(owned.records.get("villages-village").data.chronicle.length, 1);
      }
      if (stage === "relationship-save")
        assert(a.records.get(relationshipId).data.reviewedActorIds.includes("concurrent"));
      console.log("Owned live settlement stage passed:", stage);
    } finally {
      a.gate.resolve();
      clearA();
      clearB();
      a.release();
      b.release();
      a.scope.dispose();
      b.scope.dispose();
    }
  }
  const a = fixture("A"),
    b = fixture("B"),
    clearA = installDefaultActivation(a.scope, () => {});
  let clearB = () => {};
  try {
    const exact = new Error("exact live authority failure");
    a.fail(exact);
    await assert.rejects(processLiveRelationships(a.scene, "equal-turn"), (error) => error === exact);
    await assert.rejects(processLiveMemories(a.scene, "equal-turn"), (error) => error === exact);
    assert.deepEqual(a.writes, []);
    a.fail();
    clearB = installDefaultActivation(b.scope, () => {});
    a.scope.dispose();
    await assert.rejects(
      a.scope.run(() => processLiveRelationships(a.scene, "equal-turn")),
      /not configured/,
    );
    await assert.rejects(
      a.scope.run(() => processLiveMemories(a.scene, "equal-turn")),
      /not configured/,
    );
    assert.deepEqual(b.writes, []);
    await processLiveMemories(b.scene, "equal-turn");
    assert.equal(b.records.get("villages-village").data.chronicle.length, 1);
  } finally {
    clearA();
    clearB();
    a.release();
    b.release();
    a.scope.dispose();
    b.scope.dispose();
  }
}

async function main() {
  await liveConnectionOwnership();
  const at = new Date().toISOString(),
    state = defaultVillageState();
  state.seed = "live-memory-fixture";
  state.foundedAt = state.setupAt = new Date(Date.now() - 1000).toISOString();
  state.progressEngineVersion = 1;
  state.villagers = ["a", "b"].map(
    (id) =>
      ({
        characterId: id,
        cardSnapshot: { id, name: id === "a" ? "Ada" : "Bea", capturedAt: at, revision: 1, sourceStatus: "available" },
        addedAt: at,
        completedWishes: [],
        agenda: unwrittenVillageAgenda(state.venues, id),
      }) as any,
  );
  const scene: any = {
    id: "live",
    status: "active",
    memoryMode: "live",
    processingVersion: 1,
    villageSeed: state.seed,
    startedAt: at,
    lastActivityAt: at,
    placeId: "mill",
    placeName: "Mill",
    activeIds: ["a", "b"],
    participants: state.villagers.map((person) => ({
      characterId: person.characterId,
      name: person.cardSnapshot.name,
    })),
    lines: [],
    submissions: [],
  };
  const records = new Map<string, any>([
    ["villages-village", { id: "villages-village", kind: "village", data: state, revision: 1 }],
    ["villages-venue-visit-live", { id: "villages-venue-visit-live", kind: "venue-visit", data: scene, revision: 1 }],
  ]);
  let requests = 0,
    writes = 0,
    fault = "",
    faultAfter = false;
  let authorityReadCountdown = 0;
  let allowInterpretation = false,
    unknownInterpretation = false;
  const readVenueVisit = async (_id: string) => structuredClone(records.get("villages-venue-visit-live").data);
  const release = configureVillagesRuntime({
    persistence: {
      documents: {
        async getById(_pkg: string, id: string) {
          if (id === "villages-village" && authorityReadCountdown > 0 && --authorityReadCountdown === 0) {
            const row = records.get(id);
            row.data.villagers = row.data.villagers.filter((person: any) => person.characterId !== "a");
            row.revision++;
          }
          return structuredClone(records.get(id) ?? null);
        },
        async list(_pkg: string, kind: string) {
          return structuredClone([...records.values()].filter((row) => row.kind === kind));
        },
        async create(input: any) {
          writes++;
          const row = { ...structuredClone(input), revision: 1 };
          records.set(input.id, row);
          return structuredClone(row);
        },
        async update(input: any) {
          const prior = records.get(input.id);
          if (!prior || prior.revision !== input.expectedRevision) return null;
          const injected =
            fault === input.id ||
            (fault === "relationships" && input.id.startsWith("villages-relationships-")) ||
            (fault.startsWith("status:") &&
              input.id === "villages-venue-visit-live" &&
              input.data.submissions.some((turn: any) => {
                const previous = prior.data.submissions.find((entry: any) => entry.id === turn.id);
                const domain = fault.slice(7);
                return (
                  JSON.stringify(previous?.processing?.domains[domain]) !==
                  JSON.stringify(turn.processing?.domains[domain])
                );
              }));
          if (injected && !faultAfter) throw new Error("injected write failure");
          writes++;
          const row = { ...prior, ...structuredClone(input), revision: prior.revision + 1 };
          records.set(input.id, row);
          if (injected && faultAfter) throw new Error("injected lost acknowledgement");
          return structuredClone(row);
        },
        async remove(_pkg: string, id: string) {
          return records.delete(id);
        },
      },
    },
    async getAgentConfig() {
      return null;
    },
    logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
    languageModels: {
      async resolveForRequest() {
        requests++;
        if (!allowInterpretation) throw new Error("Application must never generate");
        return {
          model: "labeled-fixture",
          fitContext(messages: any[], options: any) {
            return { messages, ...options };
          },
          async chatComplete(_messages: any[], options: any) {
            assert.deepEqual(options.responseFormat, { type: "json_object" });
            if (unknownInterpretation) throw new Error("unknown paid-request outcome");
            return {
              content: JSON.stringify({
                memoryChanges: [],
                relationshipChanges: { changes: [], permissions: [], disclosures: [] },
                wishChanges: [],
              }),
              finishReason: "stop",
              usage: { inputTokens: 100, outputTokens: 12 },
            };
          },
        };
      },
    },
  } as any);
  const emptyRelations = { changes: [], permissions: [], disclosures: [] };
  function saveExchange(
    id: string,
    memoryChanges: unknown,
    relationshipChanges: unknown = emptyRelations,
    options: any = {},
  ) {
    const stored = records.get("villages-venue-visit-live").data;
    const playerId = id + ":p",
      replyId = id + ":r";
    stored.lines.push(
      {
        id: playerId,
        role: "user",
        speakerId: "",
        name: "Player",
        content: options.playerText ?? "We can plant the garden beds on Saturday.",
        at,
        heardBy: options.knowers ?? ["a"],
      },
      {
        id: replyId,
        role: "assistant",
        speakerId: "a",
        name: "Ada",
        kind: options.whisper ? "whisper" : "dialogue",
        ...(options.whisper ? { targetId: "b" } : {}),
        content: options.text ?? "I will bring seedlings for our Saturday garden planting.",
        at,
        heardBy: options.knowers ?? ["a"],
      },
    );
    const processing = createExchangeProcessing({
      seed: state.seed,
      sceneId: "live",
      submissionId: id,
      order: stored.submissions.length,
      lineIds: [playerId, replyId],
      actionReceiptIds: [],
    });
    processing.domains.projects.status = "applied";
    const liveProposals = bindLiveProposals(
      {
        responseDiagnostics: options.responseDiagnostics,
        memoryChanges,
        relationshipChanges,
        memoryVersions: options.memoryVersions ?? {},
        earlierLineIds: options.earlierLineIds ?? [],
      },
      playerId,
      [replyId],
    );
    stored.submissions.push({
      id,
      at,
      mode: "chat",
      message: "Saturday",
      replyLineIds: [replyId],
      activeIdsAtTurn: ["a"],
      wishProposals: [],
      wishProposalError: options.wishProposalError ?? "",
      processing,
      liveProposals,
    });
    records.get("villages-venue-visit-live").revision++;
  }
  const memory = {
    kind: "durable",
    category: "commitment",
    text: "Ada will bring seedlings on Saturday.",
    subjectCharacterIds: ["a"],
    knownByCharacterIds: ["a"],
    evidence: ["player", 0],
    memoryIds: [],
  };
  try {
    const parsed = extractSceneReply(
      '{"heardPlayerBy":["a"],"segments":[{"kind":"dialogue","speakerId":"a","text":"Hello","heardBy":["a"]}],"memoryChanges":[{"text":"cut',
    );
    assert.ok(parsed?.segments);
    assert.equal(parsed.memoryChanges, undefined);
    assert.equal(extractSceneReply('{"heardPlayerBy":["a"],"segments":[{"text":"cut'), null);
    saveExchange("one", [memory], {
      changes: [
        {
          fromId: "a",
          toId: "player",
          dimension: "warmth",
          strength: "minor",
          direction: "increase",
          ordinary: true,
          reason: "Planning together",
          lineIds: ["player", 0],
          disclosed: false,
        },
      ],
      permissions: [],
      disclosures: [],
    });
    await processSavedExchange("live", "one");
    let village = await readVillageState();
    assert.equal(village.chronicle[0].text, memory.text);
    assert.equal(relationshipFor(village.relationshipContext, "a", "player").warmth, 2);
    let saved = await readVenueVisit("live");
    assert.equal(saved.submissions[0].recordEvents?.filter((event) => event.kind === "memory").length, 1);
    assert.equal(saved.submissions[0].recordEvents?.filter((event) => event.kind === "relationship-up").length, 1);
    assert.equal((publicSceneResponse(saved) as any).submissions[0].liveProposals, undefined);
    const before = JSON.stringify(village.chronicle);
    await processSavedExchange("live", "one");
    assert.equal(JSON.stringify((await readVillageState()).chronicle), before);
    const original = village.chronicle[0];
    saveExchange(
      "correct",
      [{ ...memory, kind: "supersede", text: "Ada will bring seedlings on Sunday.", memoryIds: [original.id] }],
      emptyRelations,
      { memoryVersions: { [original.id]: memoryVersion(original) } },
    );
    await processSavedExchange("live", "correct");
    village = await readVillageState();
    assert.equal(village.chronicle.find((entry) => entry.id === original.id)?.supersededBy, "live:correct:memory:0");
    assert.ok(
      selectPromptMemories(village.chronicle, ["a"], "Saturday", 600).every((entry) => entry.id !== original.id),
    );
    saveExchange("late", [{ ...memory, kind: "supersede", memoryIds: [original.id] }], emptyRelations, {
      memoryVersions: { [original.id]: memoryVersion(original) },
    });
    await processSavedExchange("live", "late");
    assert.equal((await readVenueVisit("live")).submissions.at(-1)?.processing?.domains.memories.status, "rejected");
    saveExchange(
      "privacy",
      [{ ...memory, text: "Ada told Bea a private commitment.", knownByCharacterIds: ["a", "b"] }],
      emptyRelations,
      { knowers: ["a", "b"], whisper: true },
    );
    await processSavedExchange("live", "privacy");
    assert.equal(
      (await readVenueVisit("live")).submissions.at(-1)?.recordEvents?.filter((event) => event.kind === "memory")
        .length,
      0,
    );
    saveExchange("wrong-witness", [{ ...memory, knownByCharacterIds: ["b"] }]);
    await processSavedExchange("live", "wrong-witness");
    assert.match((await readVenueVisit("live")).submissions.at(-1)!.processing!.domains.memories.reason, /not heard/);
    saveExchange("missing", undefined, { changes: [], permissions: [], disclosures: [] });
    await processSavedExchange("live", "missing");
    saved = await readVenueVisit("live");
    assert.equal(saved.submissions.at(-1)?.processing?.domains.memories.status, "failed");
    assert.equal(saved.submissions.at(-1)?.processing?.domains.relationships.status, "applied");
    const openingDiagnostics = responseDiagnostics(
      { model: "fixture", connectionId: "fixture" },
      { content: "{}", finishReason: "stop" },
      1600,
      {},
      false,
      ["wishChanges", "memoryChanges"],
    );
    saveExchange("opening-missing", undefined, emptyRelations, {
      responseDiagnostics: openingDiagnostics,
      wishProposalError: "Required wishChanges metadata is missing or invalid",
    });
    await processSavedExchange("live", "opening-missing");
    const opening = (await readVenueVisit("live")).submissions.at(-1)!;
    assert.equal(opening.processing.domains.wishes.failure.cause, "missing_result");
    assert.equal(opening.processing.domains.memories.failure.cause, "missing_result");
    assert.equal(opening.processing.domains.relationships.status, "applied");
    const beforeRead = requests;
    const diagnosticFeed = await readSceneChanges("live", "", 50);
    assert.deepEqual(
      diagnosticFeed.changes.find((change: any) => change.submissionId === "opening-missing")?.responseDiagnostics,
      openingDiagnostics,
    );
    assert.match(
      diagnosticFeed.unresolved.find((change: any) => change.submissionId === "opening-missing")!.reason,
      /Replay cannot reconstruct/,
    );
    assert.ok(!JSON.stringify(publicSceneResponse(opening)).includes("requestedOutputTokens"));
    await replaySceneChanges("live");
    assert.equal(requests, beforeRead, "saved diagnostics and free replay make no model requests");
    saveExchange("salvaged", undefined, emptyRelations, {
      responseDiagnostics: { ...openingDiagnostics, parseStatus: "salvaged", finishReason: "length" },
    });
    await processSavedExchange("live", "salvaged");
    assert.equal(
      (await readVenueVisit("live")).submissions.at(-1)!.processing.domains.memories.failure.cause,
      "output_limit",
    );
    saveExchange("complete-empty", [], emptyRelations, { responseDiagnostics: openingDiagnostics });
    await processSavedExchange("live", "complete-empty");
    assert.equal((await readVenueVisit("live")).submissions.at(-1)!.processing.domains.memories.status, "applied");
    saveExchange(
      "relationships-missing",
      [],
      { changes: [], permissions: [] },
      { responseDiagnostics: openingDiagnostics },
    );
    await processSavedExchange("live", "relationships-missing");
    const relationMissing = (await readVenueVisit("live")).submissions.at(-1)!;
    assert.equal(relationMissing.processing.domains.relationships.failure.cause, "missing_result");
    assert.equal(relationMissing.processing.domains.memories.status, "applied");
    assert.equal(relationMissing.processing.domains.wishes.status, "applied");
    saveExchange("passing", [{ ...memory, kind: "passing", text: "The seedlings are beside the bench." }]);
    await processSavedExchange("live", "passing");
    assert.equal((await readVillageState()).recollections[0].text, "The seedlings are beside the bench.");
    // Human-labeled narration outputs exercise application, not a live model's interpretation accuracy.
    for (const fixture of [
      { label: "greeting", player: "Hello.", reply: "Hello!", proposals: [], durable: 0 },
      { label: "repetition", player: "Saturday, then.", reply: "Yes, Saturday.", proposals: [], durable: 0 },
      { label: "ambiguous", player: "Maybe sometime?", reply: "We will see.", proposals: [], durable: 0 },
      { label: "ordinary-company", player: "Nice weather.", reply: "It is.", proposals: [], durable: 0 },
      { label: "conditional", player: "Would you help?", reply: "If I have time, perhaps.", proposals: [], durable: 0 },
      {
        label: "quoted",
        player: "What did Bea say?",
        reply: "Bea said 'I will bring tools'.",
        proposals: [],
        durable: 0,
      },
      {
        label: "commitment",
        player: "Can you bring a spade?",
        reply: "I will bring my spade tomorrow.",
        proposals: [{ ...memory, text: "Ada will bring her spade tomorrow." }],
        durable: 1,
      },
      {
        label: "stable-fact",
        player: "What food should we avoid?",
        reply: "I am allergic to peanuts.",
        proposals: [{ ...memory, category: "personal-fact", text: "Ada is allergic to peanuts." }],
        durable: 1,
      },
    ]) {
      const beforeCount = (await readVillageState()).chronicle.length;
      saveExchange("labeled-" + fixture.label, fixture.proposals, emptyRelations, {
        playerText: fixture.player,
        text: fixture.reply,
      });
      await processSavedExchange("live", "labeled-" + fixture.label);
      assert.equal((await readVillageState()).chronicle.length - beforeCount, fixture.durable, fixture.label);
    }
    for (const after of [false, true]) {
      const id = after ? "after-write" : "before-write";
      saveExchange(id, [{ ...memory, text: "Commitment " + id }]);
      fault = "villages-village";
      faultAfter = after;
      await processSavedExchange("live", id);
      assert.equal((await readVenueVisit("live")).submissions.at(-1)?.processing?.domains.memories.status, "failed");
      fault = "";
      await processSavedExchange("live", id);
      assert.equal((await readVillageState()).chronicle.filter((entry) => entry.text === "Commitment " + id).length, 1);
    }
    const longMemory = "Ada will help in the garden. ".repeat(18) + "Exception: never on Sunday.";
    saveExchange("long-memory", [{ ...memory, text: longMemory }], emptyRelations, { text: longMemory });
    await processSavedExchange("live", "long-memory");
    assert.equal(
      (await readVillageState()).chronicle.find((entry) => entry.text === longMemory)?.text,
      longMemory,
      "The trailing exception survives persistence and readback",
    );
    saveExchange("oversized-memory", [{ ...memory, text: "x".repeat(601) }]);
    await processSavedExchange("live", "oversized-memory");
    assert.equal((await readVenueVisit("live")).submissions.at(-1)?.processing?.domains.memories.status, "rejected");
    assert.ok(!(await readVillageState()).chronicle.some((entry) => entry.text === "x".repeat(600)));
    const positiveRelationship = {
      changes: [
        {
          fromId: "a",
          toId: "player",
          dimension: "warmth",
          strength: "minor",
          direction: "increase",
          ordinary: false,
          reason: "Working together",
          lineIds: ["player", 0],
          disclosed: false,
        },
      ],
      permissions: [],
      disclosures: [],
    };
    const warmthBeforeMixed = relationshipFor((await readVillageState()).relationshipContext, "a", "player").warmth;
    saveExchange("mixed-relationships", [], {
      ...positiveRelationship,
      changes: [
        ...positiveRelationship.changes,
        { ...positiveRelationship.changes[0], fromId: "outsider" },
        { ...positiveRelationship.changes[0], lineIds: [999] },
      ],
      permissions: [
        {
          controllerId: "a",
          visitorId: "player",
          venueId: "missing",
          zoneId: "missing",
          action: "grant",
          lineIds: [0],
        },
      ],
    });
    await processSavedExchange("live", "mixed-relationships");
    const mixed = (await readVenueVisit("live")).submissions.at(-1)!.processing!.domains.relationships;
    assert.equal(mixed.status, "applied");
    assert.equal(mixed.rejectedProposals?.length, 3);
    assert.equal(
      relationshipFor((await readVillageState()).relationshipContext, "a", "player").warmth,
      warmthBeforeMixed + 2,
    );
    const trustBeforeContact = relationshipFor((await readVillageState()).relationshipContext, "a", "player").trust;
    saveExchange("brief-contact", [], emptyRelations, { playerText: "I am sorry.", text: "I forgive you." });
    await processSavedExchange("live", "brief-contact");
    assert.ok(
      Object.values((await readVillageState()).relationshipContext!.receipts).some(
        (receipt) => receipt.submissionId === "brief-contact",
      ),
    );
    assert.equal(
      relationshipFor((await readVillageState()).relationshipContext, "a", "player").trust,
      trustBeforeContact,
    );
    for (const after of [false, true]) {
      const id = "relationship-write-" + after;
      saveExchange(id, [{ ...memory, text: "Commitment " + id }], positiveRelationship);
      fault = "relationships";
      faultAfter = after;
      await processSavedExchange("live", id);
      fault = "";
      await processSavedExchange("live", id);
      assert.equal((await readVillageState()).chronicle.filter((entry) => entry.text === "Commitment " + id).length, 1);
      const context = (await readVillageState()).relationshipContext!;
      const count = Object.keys(context.receipts).length;
      await processSavedExchange("live", id);
      assert.equal(Object.keys((await readVillageState()).relationshipContext!.receipts).length, count);
    }
    for (const domain of ["projects", "wishes", "memories", "relationships"])
      for (const after of [false, true]) {
        const id = "bookkeeping-" + domain + "-" + after;
        saveExchange(id, [{ ...memory, text: "Commitment " + id }], positiveRelationship);
        records.get("villages-venue-visit-live").data.submissions.at(-1).processing.domains.projects.status = "pending";
        fault = "status:" + domain;
        faultAfter = after;
        await processSavedExchange("live", id).catch(() => {});
        assert.equal(
          (await readVillageState()).chronicle.filter((entry) => entry.text === "Commitment " + id).length,
          1,
          "another domain's status failure must not block memory commitment",
        );
        const independentFeed = await readSceneChanges("live", "", 50);
        let remaining = independentFeed;
        while (remaining.hasMore) {
          remaining = await readSceneChanges("live", remaining.nextCursor, 50);
          independentFeed.notices.push(...remaining.notices);
        }
        if (domain === "relationships") {
          const ledger = (await readVillageState()).relationshipContext!;
          const committed = Object.values(ledger.receipts).find(
            (receipt) => receipt.submissionId === id && receipt.before !== receipt.after,
          )!;
          assert.ok(
            independentFeed.notices.some((notice) => notice.id === committed.id),
            "Committed heart survives failed Scene bookkeeping",
          );
          assert.ok(
            !independentFeed.notices.find((notice) => notice.id === committed.id)?.detail,
            "Private reasons stay hidden",
          );
          await dismissSceneNotice("live", committed.id);
          assert.ok(!(await readSceneChanges("live")).notices.some((notice) => notice.id === committed.id));
        }
        fault = "";
        await processSavedExchange("live", id);
        assert.ok(
          Object.values((await readVenueVisit("live")).submissions.at(-1).processing.domains).every(
            (result: any) => result.status === "applied",
          ),
        );
      }
    for (const count of [97, 125]) {
      const started = performance.now(),
        initialWrites = writes;
      for (let i = 0; i < count; i++) {
        const id = `long-${count}-${i}`;
        saveExchange(id, [], emptyRelations, { text: "Hello!", knowers: [] });
        await processSavedExchange("live", id);
      }
      console.log(
        `live saved application ${count} exchanges: ${Math.round(performance.now() - started)}ms, ${writes - initialWrites} writes, 0 generation requests (mock storage; no model accuracy claim)`,
      );
    }
    await closeVenueSession("live");
    assert.equal((await readVenueVisit("live")).status, "closed");
    assert.equal(requests, 0);
    await assert.rejects(deleteVenueVisit("live"), /unfinished saved changes/);
    const firstPage = await readSceneChanges("live", "", 1);
    assert.equal(firstPage.changes.length, 1);
    assert.equal(firstPage.hasMore, true);
    let cursor = firstPage.nextCursor,
      pages = 1;
    while (true) {
      const page = await readSceneChanges("live", cursor, 50);
      cursor = page.nextCursor;
      pages++;
      if (!page.hasMore) break;
    }
    assert.ok(pages > 2);
    assert.equal((await readSceneChanges("live", cursor)).changes.length, 0);
    const forgedId = "live:one:memory:0";
    await dismissSceneNotice("live", forgedId);
    assert.ok((await readSceneChanges("live")).dismissedNoticeIds.includes(forgedId));
    assert.ok((await readSceneChanges("live")).notices.every((event) => event.id !== forgedId));
    await replaySceneChanges("live");
    assert.equal(requests, 0, "reads, dismissal and saved recovery never generate");
    allowInterpretation = true;
    unknownInterpretation = true;
    await assert.rejects(retrySceneChangeInterpretation("live", "missing", "memories"), /unknown paid/);
    const afterUnknown = requests;
    await assert.rejects(retrySceneChangeInterpretation("live", "missing", "memories"), /explicit|retry|billed/);
    await replaySceneChanges("live");
    assert.equal(requests, afterUnknown, "an unknown interpretation is never automatically repeated");
    const attemptId = (await readVenueVisit("live")).operation.attemptId;
    unknownInterpretation = false;
    await retrySceneChangeInterpretation("live", "missing", "memories", attemptId);
    assert.equal(requests, afterUnknown + 1, "explicit retry authorizes one new interpretation");
    assert.equal(
      (await readVenueVisit("live")).submissions.find((turn: any) => turn.id === "missing").processing.domains.memories
        .status,
      "applied",
    );
    const updates = await readSceneChanges("live", cursor);
    assert.ok(
      updates.changes.some((change) => change.submissionId === "missing"),
      "cursor receives an update to an earlier exchange",
    );
    assert.ok(
      updates.changes.find((change) => change.submissionId === "missing")?.requests?.some((request) => request.usage),
    );
    const unchangedId = "cached-contact-only";
    await mutateRelationships(state.seed, (relationships) => {
      relationships.receipts[unchangedId] = {
        id: unchangedId,
        fromId: "a",
        toId: "player",
        dimension: "warmth",
        before: 2,
        after: 2,
        reason: "Recorded contact",
        at,
        sourceId: "live",
        lineIds: [],
      };
    });
    const falseNotice = {
      id: unchangedId,
      kind: "relationship-down",
      text: "Ada's warmth toward you decreased (2 → 2).",
    };
    const storedScene = records.get("villages-venue-visit-live");
    storedScene.data.submissions[0].recordEvents.push(falseNotice);
    assert.ok(
      !(await readSceneChanges("live")).changes
        .flatMap((change) => change.notices)
        .some((event) => event.id === unchangedId),
      "refresh filters a cached false decrease",
    );
    await replaySceneChanges("live");
    assert.ok(
      !(await readSceneChanges("live")).changes
        .flatMap((change) => change.notices)
        .some((event) => event.id === unchangedId),
      "saved replay does not reintroduce a false decrease",
    );
    const legacy = structuredClone(storedScene);
    legacy.id = "villages-venue-visit-legacy-cached";
    legacy.data.id = "legacy-cached";
    legacy.data.status = "closed";
    legacy.data.memoryMode = "tiered";
    legacy.data.memoryPending = false;
    legacy.data.operation = undefined;
    legacy.data.memoryReview = { status: "complete", decisions: [], attempts: 0, error: "", nextRecollection: 0 };
    legacy.data.relationshipReview = { seed: state.seed, applied: true, batches: [], receipts: [falseNotice] };
    records.set(legacy.id, legacy);
    assert.ok(
      !(await endVenueSessionWithReceipts("legacy-cached")).recordEvents.some((event) => event.id === unchangedId),
      "legacy closing receipts are filtered against the same ledger",
    );
    const beforeAuthorityRace = structuredClone(records.get("villages-village"));
    saveExchange("authority-race", [], { ...emptyRelations, changes: [{ ...positiveRelationship.changes[0] }] });
    const raceScene = await readVenueVisit("live");
    authorityReadCountdown = 2;
    const race = await processLiveRelationships(raceScene, "authority-race");
    assert.ok(race.rejectedProposals?.length, "Resident removal between validation and commit rejects stale authority");
    assert.ok(
      !Object.values((await readVillageState()).relationshipContext!.receipts).some(
        (receipt) => receipt.submissionId === "authority-race",
      ),
      "Stale resident authority produces no success receipt",
    );
    records.set("villages-village", beforeAuthorityRace);
    records.get("villages-village").data.socialOutbox = [
      {
        id: "feed-read-only",
        seed: state.seed,
        at,
        opportunity: { id: "feed-opportunity", kind: "encounter", actorIds: ["a", "b"], venueId: "missing" },
        proposal: { encounter: null },
        candidates: [],
      },
    ];
    const writesBeforeFeed = writes;
    await readSceneChanges("live");
    assert.equal(writes, writesBeforeFeed, "Notification and diagnostic reads create no storage writes");
    assert.equal(
      records.get("villages-village").data.socialOutbox.length,
      1,
      "Feed reads leave pending outbox work untouched",
    );
    records.get("villages-village").data.socialOutbox = [];

    console.log("villages-live-memory: ok (saved proposal fixtures; not live model accuracy)");
  } finally {
    release();
  }
}
await main();
