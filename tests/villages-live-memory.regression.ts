import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import {
  defaultVillageState,
  readVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/engine/packages/server/src/services/villages/agenda-plan.js";
import { createExchangeProcessing } from "../packages/villages/src/engine/packages/server/src/services/villages/exchange-processing.js";
import {
  bindLiveProposals,
  memoryVersion,
} from "../packages/villages/src/engine/packages/server/src/services/villages/live-memory.js";
import {
  processSavedExchange,
  closeVenueSession,
  endVenueSessionWithReceipts,
  publicSceneResponse,
  readSceneChanges,
  replaySceneChanges,
  dismissSceneNotice,
  deleteVenueVisit,
  retrySceneChangeInterpretation,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-session.js";
import { extractSceneReply } from "../packages/villages/src/engine/packages/server/src/services/villages/scene-reply-json.js";
import { selectPromptMemories } from "../packages/villages/src/engine/packages/server/src/services/villages/memory-selection.js";
import {
  relationshipFor,
  mutateRelationships,
} from "../packages/villages/src/engine/packages/server/src/services/villages/relationship-store.js";

async function main() {
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
  let allowInterpretation = false,
    unknownInterpretation = false;
  const readVenueVisit = async (_id: string) => structuredClone(records.get("villages-venue-visit-live").data);
  const release = configureVillagesRuntime({
    persistence: {
      documents: {
        async getById(_pkg: string, id: string) {
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
          async chatComplete() {
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
      wishProposalError: "",
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
    console.log("villages-live-memory: ok (saved proposal fixtures; not live model accuracy)");
  } finally {
    release();
  }
}
void main();
