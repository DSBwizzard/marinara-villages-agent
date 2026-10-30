// Test cases: memories-runtime/schema, memories-runtime/own-scene, memories-runtime/live-writer, memories-runtime/committed-recovery, memories-runtime/frozen-fields, memories-runtime/source-identity, memories-runtime/public-inspection, memories-runtime/acoustic-privacy, memories-runtime/protection-boundary
import assert from "node:assert/strict";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { bindLiveProposals, liveEvidence } from "../packages/villages/src/server/domain/rules/live-exchange.js";
import { readMemoryCollection } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import {
  estimatedMemoryTokens,
  memoryProtectionContext,
} from "../packages/villages/src/server/domain/rules/memory-protection.js";
import { projectMemories } from "../packages/villages/src/server/domain/rules/memory-views.js";
import {
  bindSceneMemorySuggestion,
  sceneMemoryContext,
  sceneMemoryUnit,
} from "../packages/villages/src/server/domain/rules/scene-memories.js";
import {
  applyVillageMemory,
  forgetVillageMemory,
  reserveMemoryScene,
  sceneMemories,
} from "../packages/villages/src/server/domain/rules/village-memories.js";
import { createLiveMemory } from "../packages/villages/src/server/features/residents/live-memory-service.js";
import { createWorldCoordination } from "../packages/villages/src/server/features/world/village-service.js";
import { runCase } from "../scripts/test-cases.mjs";
import {
  memoryProposal,
  memoryRepair,
  memoryTime,
  realisticMemoryHistory,
  targetOf,
} from "./helpers/memories-fixture.js";

function writerFixture() {
  let state = defaultVillageState();
  state.seed = "native-memory-world";
  state.villagers = ["aqua", "gidget", "ella"].map(
    (characterId) => ({ characterId, cardSnapshot: { name: characterId } }) as any,
  );
  const scene: any = {
    id: "native-scene",
    villageSeed: state.seed,
    startedAt: memoryTime(1),
    lines: [
      {
        id: "reply",
        role: "assistant",
        kind: "dialogue",
        speakerId: "aqua",
        name: "Aqua",
        content: "Ella said she might leave after the harvest.",
        heardBy: ["aqua", "gidget"],
        contactHidden: true,
        at: memoryTime(1),
      },
    ],
    submissions: [],
  };
  reserveMemoryScene(state, scene.id, memoryTime(1));
  const context = sceneMemoryContext(state, ["aqua", "gidget", "player"], "Ella harvest", scene.lines[0].content);
  const suggestion: any = {
    action: "create",
    kind: "information",
    text: "Aqua told Gidget that Ella might leave after harvest.",
    subjects: ["ella"],
    learners: Object.fromEntries(
      ["aqua", "gidget"].map((id) => [
        id,
        { basis: "report", attributedTo: "aqua", support: [{ lineId: 0, excerpt: scene.lines[0].content }] },
      ]),
    ),
    screening: { disposition: "clear", protectedRoots: [], fingerprint: context.saved.protection.fingerprint },
  };
  const turn: any = {
    id: "turn",
    at: memoryTime(1),
    replyLineIds: ["reply"],
    liveProposals: bindLiveProposals(
      { memoryChanges: [suggestion], memoryContexts: { [context.saved.protection.fingerprint]: context.saved } },
      "",
      ["reply"],
      scene.lines,
    ),
  };
  scene.submissions.push(turn);
  const service = createLiveMemory({
    now: () => new Date(memoryTime(20)),
    mutateVillageState: async (change: any) => {
      const draft = structuredClone(state);
      change(draft);
      state = draft;
      return state;
    },
  } as any);
  return {
    scene,
    turn,
    suggestion,
    service,
    state: () => state,
    replace: (value: typeof state) => {
      state = value;
    },
    context,
  };
}

await runCase("memories-runtime/schema", () => {
  const state = defaultVillageState();
  assert.equal(state.version, 9);
  assert.deepEqual(coerceVillageState(JSON.parse(JSON.stringify(state))).memories, state.memories);
  const missing = structuredClone(state);
  delete (missing as any).memories;
  assert.throws(() => coerceVillageState(missing), /memory data is missing/u);
});

await runCase("memories-runtime/own-scene", () => {
  const state = defaultVillageState();
  state.villagers = ["aqua", "gidget"].map((characterId) => ({ characterId }) as any);
  const first = reserveMemoryScene(state, "first", memoryTime(1));
  reserveMemoryScene(state, "other", memoryTime(1));
  const create = memoryProposal(state.memories, { audience: ["aqua", "player"] });
  create.proposal.source.sceneId = "first";
  applyVillageMemory(state, create.proposal, create.context);
  assert.equal(projectMemories(sceneMemories(state, "first"), ["aqua"]).length, 1);
  assert.equal(projectMemories(sceneMemories(state, "other"), ["aqua"]).length, 0);
  assert.equal(
    reserveMemoryScene(state, "first", memoryTime(100)).snapshot.capturedRevision,
    first.snapshot.capturedRevision,
    "Interrupted attachment never recaptures.",
  );
  const reinforce = memoryProposal(state.memories, {
    audience: ["aqua"],
    hour: 10,
    patch: {
      action: "reinforce",
      target: targetOf(state.memories),
      text: undefined,
      kind: undefined,
      subjects: undefined,
    },
  });
  reinforce.proposal.source.sceneId = "first";
  applyVillageMemory(state, reinforce.proposal, reinforce.context);
  assert.equal(
    Object.keys(state.memoryScenes.first.effects).length,
    1,
    "Own effects retain the latest value, not a full per-turn copy.",
  );
  assert.equal(projectMemories(sceneMemories(state, "first"), ["aqua"])[0].knowers.aqua.reinforcedAt, memoryTime(11));
  const frozen = JSON.stringify(projectMemories(sceneMemories(state, "first"), ["aqua", "player"]));
  forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["player"]), memoryTime(12));
  assert.equal(projectMemories(state.memories, ["player"]).length, 0);
  assert.equal(JSON.stringify(projectMemories(sceneMemories(state, "first"), ["aqua", "player"])), frozen);
  const recovered = coerceVillageState(JSON.parse(JSON.stringify(state)));
  assert.equal(JSON.stringify(projectMemories(sceneMemories(recovered, "first"), ["aqua", "player"])), frozen);
  assert.equal(projectMemories(sceneMemories(recovered, "other"), ["aqua"]).length, 0);
});

await runCase("memories-runtime/live-writer", async () => {
  const f = writerFixture();
  const forged = structuredClone(f.suggestion);
  forged.learners = { player: forged.learners.aqua };
  f.turn.liveProposals.memoryChanges.push(forged);
  const result = await f.service.processLiveMemories(f.scene, f.turn.id);
  assert.equal(
    result.status,
    "rejected",
    "Reject the affected forged audience without losing independently accepted memories.",
  );
  assert.equal(f.state().memories.records.length, 1);
  assert.equal(projectMemories(f.state().memories, ["player"]).length, 0);
  assert.equal(projectMemories(f.state().memories, ["ella"]).length, 0);
  assert.equal(projectMemories(f.state().memories, ["gidget"])[0].knowers.gidget.basis, "report");
  const revision = f.state().memories.revision;
  await f.service.processLiveMemories(f.scene, f.turn.id);
  assert.equal(f.state().memories.revision, revision);
  f.scene.lines[0].speakerId = "ella";
  assert.throws(() => liveEvidence(f.scene, f.turn.liveProposals), /source identity changed/u);
});

await runCase("memories-runtime/committed-recovery", async () => {
  const f = writerFixture();
  const effectId = `venue-chat:${f.scene.id}:${f.turn.id}`;
  f.turn.physicalOutcomeVersion = 1;
  f.suggestion.kind = "experience";
  f.suggestion.domainRef = { kind: "physical", id: "observatory" };
  f.suggestion.effectId = effectId;
  f.suggestion.learners = { aqua: { ...f.suggestion.learners.aqua, basis: "validated-event" } };
  assert.equal((await f.service.processLiveMemories(f.scene, f.turn.id)).status, "pending");
  assert.equal(
    f.state().memories.records.length,
    0,
    "Validated/prepared but uncommitted effects form no event memory.",
  );
  const committed = structuredClone(f.state());
  committed.exchangeReceipts[effectId] = {
    id: effectId,
    domain: "physical",
    status: "applied",
    sceneId: f.scene.id,
    submissionId: f.turn.id,
    at: memoryTime(1),
    committedAt: memoryTime(2),
    evidenceIds: ["reply"],
    reason: "Validated and committed",
    physicalOutcome: {
      id: effectId,
      venueId: "observatory",
      actionReceipt: { happened: true, witnessIds: ["aqua"] },
    } as any,
  };
  f.replace(committed);
  assert.equal((await f.service.processLiveMemories(f.scene, f.turn.id)).status, "applied");
  assert.equal(f.state().memories.records.length, 1);
  await f.service.processLiveMemories(f.scene, f.turn.id);
  assert.equal(f.state().memories.records.length, 1, "Recovery after commit and replay cannot duplicate the outcome.");
  assert.equal(f.state().memories.records[0].occurredAt, memoryTime(1));
  assert.equal(f.state().memories.records[0].recordedAt, memoryTime(20));
});

await runCase("memories-runtime/frozen-fields", () => {
  const state = defaultVillageState();
  state.villagers = [{ characterId: "aqua" }] as any;
  const initial = memoryProposal(state.memories, { audience: ["aqua"] });
  initial.proposal.learners.aqua.disclosed = { title: "Old public plan" };
  applyVillageMemory(state, initial.proposal, initial.context);
  reserveMemoryScene(state, "held", memoryTime(3));
  const external = memoryProposal(state.memories, {
    audience: ["aqua"],
    hour: 4,
    patch: {
      action: "reinforce",
      target: targetOf(state.memories),
      text: undefined,
      kind: undefined,
      subjects: undefined,
    },
  });
  external.proposal.learners.aqua.disclosed = { title: "NEW PRIVATE TARGET" };
  external.proposal.learners.aqua.attributedTo = "gidget";
  applyVillageMemory(state, external.proposal, external.context);
  const own = memoryProposal(state.memories, {
    audience: ["aqua"],
    hour: 6,
    patch: {
      action: "reinforce",
      target: targetOf(state.memories),
      text: undefined,
      kind: undefined,
      subjects: undefined,
    },
  });
  own.proposal.source.sceneId = "held";
  own.proposal.learners.aqua.basis = "observation";
  delete own.proposal.learners.aqua.attributedTo;
  const second = { ...structuredClone(own.proposal.learners.aqua.support[0]), lineId: "second-new-quote" };
  own.proposal.learners.aqua.support.push(second);
  own.context.evidence = structuredClone(own.proposal.learners.aqua.support);
  applyVillageMemory(state, own.proposal, own.context);
  const held = sceneMemories(state, "held");
  const knowledge = projectMemories(held, ["aqua"])[0].knowers.aqua;
  assert.equal(knowledge.disclosed?.title, "Old public plan");
  assert.notEqual(knowledge.attributedTo, "gidget");
  assert.equal(knowledge.basis, "observation");
  assert.equal(
    knowledge.support[0].source.id,
    initial.context.source.id,
    "Original useful support survives two new excerpts.",
  );
  assert.doesNotThrow(() => readMemoryCollection(JSON.parse(JSON.stringify(held))));
});

await runCase("memories-runtime/source-identity", () => {
  const f = writerFixture();
  const report = { ...f.scene.lines[0], id: "contact-report", contactReport: true };
  const lines = [...f.scene.lines, report];
  const saved = bindLiveProposals({ memoryChanges: [] }, "", ["reply", report.id], lines);
  assert.equal(
    liveEvidence({ ...f.scene, lines }, saved).length,
    1,
    "Reports are hashed consistently but never become evidence.",
  );
  const first = structuredClone(f.suggestion);
  first.target = { id: "root", revision: 1, rootRevision: 1 };
  first.learners.aqua.support = [
    { lineId: 0, excerpt: "one" },
    { lineId: "old-line", excerpt: "two" },
  ];
  first.learners = { aqua: first.learners.aqua };
  const second = structuredClone(first);
  second.target.revision = second.target.rootRevision = 9;
  second.learners.aqua.support = [
    { lineId: "old-line", excerpt: "reworded" },
    { lineId: "reply", excerpt: "newly bounded quote" },
  ];
  const resolve = (ref: unknown) => (ref === 0 ? "reply" : ref);
  assert.equal(
    sceneMemoryUnit(first, resolve),
    sceneMemoryUnit(second, resolve),
    "Guard revisions and source ordering cannot re-award a saved unit.",
  );
  assert.doesNotThrow(() => sceneMemoryUnit({ learners: { aqua: { support: {} } } }));
});

await runCase("memories-runtime/public-inspection", async () => {
  let state = defaultVillageState();
  state.seed = "memory-api-world";
  state.memories = realisticMemoryHistory(1000);
  state.villagers = [
    { characterId: "aqua", cardSnapshot: { name: "Aqua" } },
    { characterId: "ella", cardSnapshot: { name: "Ella" } },
  ] as any;
  let writes = 0;
  const api = createWorldCoordination({
    readVillageAuthority: async () => structuredClone(state),
    readVillageState: async () => {
      throw new Error("A memory read must not process background effects.");
    },
    readScene: async () => {
      throw new Error("Source Scene was deleted.");
    },
    mutateMemoryAuthority: async (mutate: any) => {
      const draft = structuredClone(state);
      mutate(draft);
      state = draft;
      writes++;
      return state;
    },
  } as any);
  const publicPage = await api.buildVillageMemories();
  assert.equal(publicPage.entries.length, 50);
  assert.equal(publicPage.characterId, "player");
  assert.equal((await api.buildVillageMemories({ characterId: "ella", query: "stolen telescope" })).total, 0);
  const privatePage = await api.buildVillageMemories({
    inspection: true,
    characterId: "ella",
    query: "stolen telescope",
  });
  assert.equal(privatePage.total, 1);
  assert.equal(writes, 0, "Inspect never learns.");
  await assert.rejects(() => api.readVillageMemoryEvidence("history-memory-1"), /unavailable/u);
  const source = await api.readVillageMemoryEvidence("history-memory-1", true, "ella");
  assert.match(source.knowers[0].support[0].excerpt, /stolen/u, "Retained private support survives source deletion.");
  const remembered = await api.buildVillageMemories({ query: "brass telescope" });
  const selected = remembered.entries[0];
  await api.forgetMemory(selected.id, {
    operationId: "forget-player-telescope",
    seed: state.seed,
    expectedCollectionRevision: remembered.revision,
    target: { id: selected.id, revision: selected.revision, rootRevision: selected.rootRevision },
    knowers: ["player"],
  });
  assert.equal((await api.buildVillageMemories({ query: "brass telescope" })).total, 0);
  assert.equal(
    (await api.buildVillageMemories({ inspection: true, characterId: "aqua", query: "brass telescope" })).total,
    1,
  );
  assert.ok(
    (await api.buildVillageMemories({ inspection: true, characterId: "player", query: "brass telescope" })).entries[0]
      .forgotten,
  );
  await assert.rejects(() => api.buildVillageMemories({ cursor: publicPage.next! }), /changed/u);
});

// Acoustic evidence cannot smuggle private disclosure fields or unseen attendance through shared metadata.
await runCase("memories-runtime/acoustic-privacy", () => {
  const source: any = { kind: "scene", id: "noise", revision: 1, fingerprint: "a".repeat(64) };
  const line: any = {
    id: "sound",
    role: "assistant",
    kind: "narration",
    speakerId: "__venue_scene__",
    content: "PRIVATE ATTIC MOVE",
    heardBy: ["aqua"],
    soundOnly: { text: "Footsteps sounded upstairs.", characterIds: [], player: true },
  };
  const suggestion: any = {
    action: "create",
    kind: "information",
    text: line.soundOnly.text,
    subjects: [],
    learners: { player: { basis: "observation", support: [{ lineId: "sound", excerpt: line.soundOnly.text }] } },
    screening: { disposition: "clear", protectedRoots: [], fingerprint: "a".repeat(64) },
  };
  const input: any = {
    source,
    operationId: "noise",
    proposalId: "noise",
    collectionRevision: 0,
    lines: [line],
    playerLineId: "",
    replyLineIds: ["sound"],
    residentIds: ["aqua"],
  };
  assert.doesNotThrow(() => bindSceneMemorySuggestion(suggestion, input));
  for (const patch of [
    { domainRef: { kind: "pursuit", id: "secret", characterId: "aqua" } },
    { subjects: ["aqua"] },
    {
      learners: {
        player: { ...suggestion.learners.player, disclosed: { title: "Move to secret attic", status: "arranged" } },
      },
    },
    { learners: { player: { ...suggestion.learners.player, attributedTo: "aqua" } } },
  ])
    assert.throws(() => bindSceneMemorySuggestion({ ...suggestion, ...patch }, input), /Sound alone/);
});

await runCase("memories-runtime/protection-boundary", () => {
  const state = defaultVillageState();
  state.memories = realisticMemoryHistory(10);
  for (const root of state.memories.records) {
    root.knowers = {
      player: {
        ...structuredClone(Object.values(root.knowers)[0]),
        forgotten: { at: memoryTime(100), operationId: "forgot" },
      },
    };
    root.text = "nebula " + "x".repeat(500);
  }
  let boundary = false;
  for (let length = 1; length <= 590; length++) {
    for (const root of state.memories.records) root.text = "nebula " + "x".repeat(length);
    const old = memoryProtectionContext(state.memories, { knowers: ["player"], query: "nebula " });
    const envelope = estimatedMemoryTokens(JSON.stringify({ administrative: JSON.parse(old.payload), memories: [] }));
    if (old.complete && envelope > 1796) {
      const context = sceneMemoryContext(state, ["player"], "nebula");
      assert.equal(context.saved.protection.complete, false);
      assert.equal(context.envelope.administrative.incomplete, true);
      assert.ok(estimatedMemoryTokens(JSON.stringify(context.envelope)) <= 1796);
      boundary = true;
      break;
    }
  }
  assert.ok(boundary, "Fixture must exercise protection fitting alone but exceeding its complete envelope");
});
