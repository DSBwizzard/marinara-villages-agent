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
  publicSceneResponse,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-session.js";
import { extractSceneReply } from "../packages/villages/src/engine/packages/server/src/services/villages/scene-reply-json.js";
import { selectPromptMemories } from "../packages/villages/src/engine/packages/server/src/services/villages/memory-selection.js";
import { relationshipFor } from "../packages/villages/src/engine/packages/server/src/services/villages/relationship-store.js";

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
          if (fault === input.id && !faultAfter) throw new Error("injected write failure");
          writes++;
          const row = { ...prior, ...structuredClone(input), revision: prior.revision + 1 };
          records.set(input.id, row);
          if (fault === input.id && faultAfter) throw new Error("injected lost acknowledgement");
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
        throw new Error("Application must never generate");
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
        content: "We can plant the garden beds on Saturday.",
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
    assert.equal((await readVenueVisit("live")).memoryPending, false);
    assert.equal(requests, 0);
    console.log("villages-live-memory: ok (saved proposal fixtures; not live model accuracy)");
  } finally {
    release();
  }
}
void main();
