// Test cases: memories/formation, memories/repair, memories/guards, memories/authority, memories/continuity, memories/evidence, memories/protection, memories/consolidation, memories/review-regressions
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { wishCheckKnowledge } from "../packages/villages/src/server/domain/rules/wish-journal.js";
import { knownDevelopment } from "../packages/villages/src/server/domain/rules/development-knowledge.js";
import {
  defaultRelationshipState,
  neutralRelationship,
  relationshipKey,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { projectRelationshipProfiles } from "../packages/villages/src/server/domain/rules/relationship-knowledge.js";
import {
  applyMemoryProposal,
  applyMemoryRepair,
} from "../packages/villages/src/server/domain/rules/memory-application.js";
import { memoryHash, readMemoryCollection } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import {
  estimatedMemoryTokens,
  memoryProtectionContext,
} from "../packages/villages/src/server/domain/rules/memory-protection.js";
import { recallMemories } from "../packages/villages/src/server/domain/rules/memory-recall.js";
import {
  captureMemoryScene,
  inspectMemory,
  projectMemories,
  sceneMemoryCollection,
  readMemorySceneSnapshot,
} from "../packages/villages/src/server/domain/rules/memory-views.js";
import {
  addMemory,
  emptyMemories,
  memoryProposal,
  memoryRepair,
  memoryTime,
  targetOf,
} from "./helpers/memories-fixture.js";

await runCase("memories/formation", () => {
  let collection = addMemory(emptyMemories(), {
    audience: ["aqua", "gidget"],
    text: "Aqua told Gidget that Ella intends to leave.",
    patch: { subjects: ["ella"] },
  });
  assert.equal(projectMemories(collection, ["ella"]).length, 0, "Subjects are not knowers.");
  assert.equal(projectMemories(collection, ["player"]).length, 0);
  const row = projectMemories(collection, ["gidget"])[0];
  assert.equal(row.knowers.gidget.basis, "report");
  assert.equal(row.knowers.gidget.attributedTo, "aqua");
  assert.equal(row.occurredAt, memoryTime(1));
  assert.equal(row.recordedAt, memoryTime(2));
  const before = structuredClone(collection);
  const f = memoryProposal(collection, {
    audience: ["gidget"],
    hour: 50,
    text: "Aqua repeated her report about Ella.",
    patch: { action: "reinforce", target: targetOf(collection), text: undefined, kind: undefined, subjects: undefined },
  });
  collection = applyMemoryProposal(collection, f.proposal, f.context).collection;
  assert.deepEqual(collection.records[0].knowers.aqua, before.records[0].knowers.aqua, "Only actual learners refresh.");
  assert.equal(collection.records[0].knowers.gidget.reinforcedAt, memoryTime(51));
  assert.equal(collection.records[0].occurredAt, before.records[0].occurredAt);
  assert.equal(
    applyMemoryProposal(collection, JSON.parse(JSON.stringify(f.proposal)), f.context).status,
    "replayed",
    "Operation hashes survive JSON persistence.",
  );
  assert.deepEqual(before, readMemoryCollection(JSON.parse(JSON.stringify(before))));
  const corrected = memoryProposal(collection, {
    audience: ["gidget"],
    text: "Aqua clarified that Ella only considered a short trip.",
    patch: { action: "correct", target: targetOf(collection), kind: "information" },
  });
  collection = applyMemoryProposal(collection, corrected.proposal, corrected.context).collection;
  assert.match(projectMemories(collection, ["gidget"])[0].text, /short trip/u);
  assert.match(projectMemories(collection, ["aqua"])[0].text, /intends to leave/u);
  assert.equal(projectMemories(collection, ["player"]).length, 0);
  assert.doesNotThrow(() => readMemoryCollection(JSON.parse(JSON.stringify(collection))));
});

await runCase("memories/repair", () => {
  let collection = addMemory(emptyMemories());
  collection.records[0].knowers.player.disclosed = { title: "Move to the attic", status: "arranged", agreed: true };
  const original = structuredClone(collection),
    snapshot = captureMemoryScene(collection, "open", ["aqua", "player"], memoryTime(3));
  const operation = memoryRepair(
    collection,
    "repair",
    ["player"],
    "Aqua was asking about the garden, not moving home.",
  );
  const result = applyMemoryRepair(collection, operation, memoryTime(4), [snapshot]);
  collection = result.collection;
  const player = projectMemories(collection, ["player"])[0],
    aqua = projectMemories(collection, ["aqua"])[0];
  assert.equal(player.text, operation.text);
  assert.equal(player.knowers.player.disclosed, undefined);
  assert.equal(player.knowers.player.support.length, 0);
  assert.ok(player.knowers.player.sourceRefs?.length);
  assert.equal(aqua.text, original.records[0].text);
  assert.equal(
    projectMemories(sceneMemoryCollection(collection, result.snapshots[0]), ["player"])[0].text,
    original.records[0].text,
  );
  assert.equal(
    projectMemories(
      sceneMemoryCollection(collection, captureMemoryScene(collection, "next", ["player"], memoryTime(5))),
      ["player"],
    )[0].text,
    operation.text,
  );
  assert.deepEqual(
    inspectMemory(collection, collection.records[0].id)?.knowers.player.support,
    original.records[0].knowers.player.support,
  );
  assert.throws(
    () => applyMemoryRepair(collection, memoryRepair(collection, "repair", ["ella"], "Teach Ella"), memoryTime(6)),
    /cannot teach/u,
  );
  assert.deepEqual(applyMemoryRepair(collection, operation, memoryTime(6)).collection, collection);
  const separate = addMemory(collection, {
    sourceId: "independent-disclosure",
    text: "Aqua agreed to lend the garden tools to the player.",
    audience: ["player"],
  });
  const forgotten = applyMemoryRepair(separate, memoryRepair(separate, "forget", ["aqua"]), memoryTime(7)).collection;
  assert.equal(
    projectMemories(forgotten, ["player"]).length,
    2,
    "Targeting a resident does not hide player knowledge.",
  );
  const playerForgot = applyMemoryRepair(
    forgotten,
    memoryRepair(forgotten, "forget", ["player"]),
    memoryTime(8),
  ).collection;
  assert.equal(projectMemories(playerForgot, ["player"]).length, 1, "Independent player disclosures remain.");
  assert.match(projectMemories(playerForgot, ["player"])[0].text, /garden tools/u);
});

await runCase("memories/guards", () => {
  const f = memoryProposal(emptyMemories());
  const created = applyMemoryProposal(emptyMemories(), f.proposal, f.context);
  assert.equal(applyMemoryProposal(created.collection, f.proposal, f.context).status, "replayed");
  assert.throws(
    () => applyMemoryProposal(created.collection, { ...f.proposal, text: "Changed retry" }, f.context),
    /identity reused/u,
  );
  assert.throws(
    () =>
      applyMemoryProposal(emptyMemories(), f.proposal, {
        ...f.context,
        source: { ...f.context.source, fingerprint: memoryHash("changed") },
      }),
    /source identity/u,
  );
  const stale = memoryProposal(created.collection, {
    patch: {
      action: "reinforce",
      target: { ...targetOf(created.collection), revision: 999 },
      kind: undefined,
      text: undefined,
      subjects: undefined,
    },
  });
  assert.throws(() => applyMemoryProposal(created.collection, stale.proposal, stale.context), /stale target/u);
  const guessed = memoryProposal(created.collection, {
    patch: {
      action: "reinforce",
      target: targetOf(created.collection),
      kind: undefined,
      text: undefined,
      subjects: undefined,
    },
  });
  guessed.context.recall.targetIds = [];
  assert.throws(
    () => applyMemoryProposal(created.collection, guessed.proposal, guessed.context),
    /unambiguous recall/u,
  );
  const unwitnessed = structuredClone(f);
  unwitnessed.proposal.learners.ella = unwitnessed.proposal.learners.aqua;
  assert.throws(() => applyMemoryProposal(emptyMemories(), unwitnessed.proposal, unwitnessed.context), /unwitnessed/u);
  const fabricated = structuredClone(f);
  fabricated.proposal.learners.aqua.support[0].excerpt = "Invented quotation";
  assert.throws(() => applyMemoryProposal(emptyMemories(), fabricated.proposal, f.context), /unaccepted evidence/u);
  for (const corrupt of [
    null,
    {},
    { format: 0, revision: 0, records: [] },
    { ...created.collection, extra: true },
    { ...created.collection, records: [...created.collection.records, ...created.collection.records] },
  ])
    assert.throws(() => readMemoryCollection(corrupt), /Memory:/u);
  for (const change of [
    (r: any) => (r.text = "x".repeat(601)),
    (r: any) => (r.rootId = "absent"),
    (r: any) => (r.knowers.aqua.support[0].audience = ["player"]),
    (r: any) => (r.occurredAt = "yesterday"),
    (r: any) => (r.knowers.aqua.basis = "validated-event"),
    (r: any) => (r.corrects = r.id),
  ]) {
    const corrupt = structuredClone(created.collection);
    change(corrupt.records[0]);
    assert.throws(() => readMemoryCollection(corrupt), /Memory:/u);
  }
});

await runCase("memories/authority", () => {
  const f = memoryProposal(emptyMemories(), {
    sourceId: "committed-project",
    text: "The greenhouse roof repair was completed.",
    patch: { kind: "experience", domainRef: { kind: "project", id: "roof" }, effectId: "roof-completion" },
  });
  for (const learning of Object.values(f.proposal.learners)) learning.basis = "validated-event";
  const effect = {
    status: "committed" as const,
    id: "roof-completion",
    source: f.context.source,
    domainRef: f.proposal.domainRef!,
    occurredAt: f.context.occurredAt,
    committedAt: f.context.recordedAt,
    audience: ["aqua", "player"],
  };
  // Failure before validation, rejection, interruption and failure between validation and commit.
  for (const status of [undefined, "proposed", "rejected", "interrupted", "validated"]) {
    const context = { ...f.context, committedEffects: status ? [{ ...effect, status } as any] : [] };
    assert.throws(() => applyMemoryProposal(emptyMemories(), f.proposal, context), /committed/u);
    assert.equal(emptyMemories().records.length, 0);
  }
  // Effects committed, process dies before memory application: recover against saved receipt.
  f.context.committedEffects = [effect];
  const committed = applyMemoryProposal(emptyMemories(), f.proposal, f.context).collection;
  const recovered = readMemoryCollection(JSON.parse(JSON.stringify(committed)));
  assert.equal(applyMemoryProposal(recovered, f.proposal, f.context).status, "replayed");
  const renamed = {
    ...f.proposal,
    operationId: "replayed-operation",
    proposalId: "different-proposal",
    expectedCollectionRevision: recovered.revision,
  };
  assert.throws(() => applyMemoryProposal(recovered, renamed, f.context), /already recorded/u);
  const reinforce = memoryProposal(recovered, {
    text: "The completed greenhouse roof still stands.",
    patch: { action: "reinforce", target: targetOf(recovered), kind: undefined, text: undefined, subjects: undefined },
  });
  for (const state of Object.values(reinforce.proposal.learners)) state.basis = "validated-event";
  assert.equal(applyMemoryProposal(recovered, reinforce.proposal, reinforce.context).collection.records.length, 1);
  const claim = addMemory(emptyMemories(), {
    text: "Aqua claimed the greenhouse roof was complete.",
    patch: { kind: "information" },
  });
  assert.equal(claim.records[0].knowers.player.basis, "report");
  assert.equal(claim.records[0].committedEffect, undefined);
  const wrongAudience = { ...f.context, committedEffects: [{ ...effect, audience: ["aqua"] }] };
  assert.throws(() => applyMemoryProposal(emptyMemories(), f.proposal, wrongAudience), /mismatched/u);
});

await runCase("memories/continuity", () => {
  let collection = addMemory(emptyMemories());
  const start = structuredClone(collection);
  let snapshots = [
    captureMemoryScene(collection, "one", ["aqua"], memoryTime(3)),
    captureMemoryScene(collection, "two", ["player"], memoryTime(3)),
  ];
  const repair = applyMemoryRepair(
    collection,
    memoryRepair(collection, "repair", ["aqua"], "Aqua promised a star chart instead."),
    memoryTime(4),
    snapshots,
  );
  collection = repair.collection;
  snapshots = repair.snapshots;
  const next = memoryProposal(collection, { text: "Gidget privately discussed the bakery.", audience: ["gidget"] });
  const added = applyMemoryProposal(collection, next.proposal, next.context, snapshots);
  collection = added.collection;
  snapshots = added.snapshots;
  const forget = applyMemoryRepair(
    collection,
    memoryRepair(collection, "forget", ["player"]),
    memoryTime(10),
    snapshots,
  );
  collection = forget.collection;
  snapshots = forget.snapshots;
  assert.equal(Object.keys(snapshots[0].before).length, 1);
  assert.equal(Object.keys(snapshots[1].before).length, 1);
  assert.deepEqual(readMemorySceneSnapshot(JSON.parse(JSON.stringify(snapshots[0]))), snapshots[0]);
  assert.equal(
    projectMemories(sceneMemoryCollection(collection, snapshots[0]), ["aqua"])[0].text,
    start.records[0].text,
  );
  assert.equal(
    projectMemories(sceneMemoryCollection(collection, snapshots[1]), ["player"])[0].text,
    start.records[0].text,
  );
  assert.equal(projectMemories(collection, ["player"]).length, 0);
  assert.equal(projectMemories(collection, ["aqua"])[0].text, "Aqua promised a star chart instead.");
  assert.throws(() => sceneMemoryCollection(collection, { ...snapshots[0], before: {} }), /missing Scene preimage/u);
  assert.throws(
    () =>
      recallMemories(collection, { purpose: "narration", audience: ["player"], query: "lens", snapshot: snapshots[0] }),
    /captured audience/u,
  );
});

await runCase("memories/evidence", () => {
  let collection = addMemory(emptyMemories());
  const sceneId = collection.records[0].origin.id;
  const scenes = new Map([[sceneId, { lines: ["Transcript may be deleted"] }]]);
  scenes.delete(sceneId); // Both explicit deletion and archive retention remove the source Scene.
  collection = readMemoryCollection(JSON.parse(JSON.stringify(collection)));
  const recalled = recallMemories(collection, { purpose: "system", audience: ["aqua"], query: "brass telescope lens" });
  assert.equal(recalled.candidates.length, 1);
  assert.match(recalled.candidates[0].knowers.aqua.support[0].excerpt, /telescope/u);
  assert.equal(recalled.candidates[0].knowers.aqua.support[0].source.id, sceneId);
  assert.equal(
    recallMemories(collection, { purpose: "system", audience: ["ella"], query: "brass telescope lens" }).candidates
      .length,
    0,
  );
  const resolution = memoryProposal(collection, {
    audience: ["aqua"],
    text: "Aqua quietly finished polishing the lens.",
    patch: { action: "resolve", kind: "information", target: targetOf(collection) },
  });
  collection = applyMemoryProposal(collection, resolution.proposal, resolution.context).collection;
  const publicRecall = recallMemories(collection, { purpose: "system", audience: ["player"], query: "telescope" });
  assert.equal(publicRecall.candidates.length, 1);
  assert.doesNotMatch(publicRecall.serialized, /finished polishing/u);
  const privateRecall = recallMemories(collection, {
    purpose: "system",
    audience: ["aqua"],
    query: collection.records[0].id,
  });
  assert.equal(privateRecall.candidates.length, 2, "Follow an eligible resolution one hop.");
});

await runCase("memories/protection", () => {
  const initial = addMemory(emptyMemories());
  const repaired = applyMemoryRepair(
    initial,
    memoryRepair(initial, "repair", ["aqua"], "Aqua promised a star chart."),
    memoryTime(4),
  ).collection;
  const replayed = memoryProposal(repaired, { sourceId: initial.records[0].origin.id });
  replayed.proposal.proposalId = "reworded-replay";
  replayed.proposal.source.revision = replayed.context.source.revision = 2;
  replayed.proposal.source.fingerprint = replayed.context.source.fingerprint = memoryHash("revised source");
  for (const e of replayed.context.evidence) e.source = replayed.context.source;
  for (const state of Object.values(replayed.proposal.learners))
    for (const e of state.support) e.source = replayed.context.source;
  assert.throws(() => applyMemoryProposal(repaired, replayed.proposal, replayed.context), /protected source/u);
  const conflicting = memoryProposal(repaired, {
    audience: ["aqua"],
    patch: { action: "correct", target: targetOf(repaired) },
  });
  for (const disposition of ["conflict", "uncertain", "invalid"])
    assert.throws(
      () =>
        applyMemoryProposal(
          repaired,
          { ...conflicting.proposal, screening: { ...conflicting.proposal.screening, disposition } as any },
          conflicting.context,
        ),
      /screening/u,
    );
  assert.throws(
    () =>
      applyMemoryProposal(
        repaired,
        { ...conflicting.proposal, screening: { ...conflicting.proposal.screening, protectedRoots: [] } },
        conflicting.context,
      ),
    /unscreened/u,
  );
  assert.throws(
    () => applyMemoryProposal(repaired, conflicting.proposal, conflicting.context),
    /repaired target conflict/u,
  );
  const changed = applyMemoryRepair(
    repaired,
    memoryRepair(repaired, "repair", ["aqua"], "Aqua promised an atlas."),
    memoryTime(5),
  ).collection;
  const inFlight = { ...conflicting.proposal, expectedCollectionRevision: changed.revision, target: targetOf(changed) };
  inFlight.screening = { ...inFlight.screening, disposition: "clear" };
  // Fresh recall cannot make a stale administrative context acceptable.
  conflicting.context.recall = recallMemories(changed, {
    purpose: "system",
    audience: ["aqua"],
    query: changed.records[0].id,
  });
  assert.throws(() => applyMemoryProposal(changed, inFlight, conflicting.context), /protection changed/u);
  const unrelated = memoryProposal(repaired, {
    audience: ["aqua"],
    text: "Fern enjoys cinnamon biscuits beside the bakery.",
  });
  const tiny = memoryProtectionContext(repaired, conflicting.context.protection.selector, 1);
  unrelated.context.protection = tiny;
  unrelated.proposal.screening = { disposition: "clear", protectedRoots: [], fingerprint: tiny.fingerprint };
  assert.equal(
    applyMemoryProposal(repaired, unrelated.proposal, unrelated.context).status,
    "applied",
    "Oversized relevant protection does not suspend unrelated learning.",
  );
  const narration = recallMemories(repaired, { purpose: "narration", audience: ["aqua"], query: "star chart" });
  assert.doesNotMatch(narration.serialized, /brass telescope|Administrative/u);
  const system = recallMemories(repaired, {
    purpose: "system",
    audience: ["aqua"],
    query: "star chart",
    protection: conflicting.context.protection,
  });
  assert.ok(system.tokens <= 1800);
  assert.equal(system.tokens, estimatedMemoryTokens(system.serialized));
  assert.throws(
    () =>
      recallMemories(repaired, {
        purpose: "narration",
        audience: ["aqua"],
        query: "star",
        protection: conflicting.context.protection,
      }),
    /System-only/u,
  );
});

await runCase("memories/consolidation", () => {
  const village: any = {
    villagers: [{ characterId: "ella", cardSnapshot: { name: "Ella" }, agenda: { wishes: [] } }],
    venues: [{ id: "home", zones: [{ id: "door", name: "Front door" }] }],
    wishKnowledge: {
      ella: [
        {
          wishId: "lavender",
          text: "A quiet garden",
          learnedAt: memoryTime(1),
          lineIds: ["spoken"],
          facts: ["preference", "concern", "possibility", "condition"].map((kind, i) => ({
            id: "fact-" + i,
            kind,
            quote: "Exact " + kind,
            at: memoryTime(1),
            lineIds: ["spoken"],
            submissionId: "turn",
            sceneId: "scene",
            ...(kind === "condition" ? { conditionRevision: 2 } : {}),
          })),
        },
      ],
    },
    development: {
      residents: {
        ella: {
          pursuits: [
            {
              id: "move",
              targetVenueId: "private-attic",
              status: "arranged",
              consent: "refused",
              known: {
                title: "Move to the orchard",
                text: "Ella is considering the orchard.",
                status: "considering",
                at: memoryTime(1),
              },
            },
          ],
        },
      },
    },
  };
  const wish = wishCheckKnowledge(village, "ella", "lavender");
  assert.deepEqual(
    wish.discoveries.map((row) => row.kind),
    ["preference", "concern", "possibility"],
  );
  assert.equal(wish.conditionRevision, 2);
  assert.equal(wish.conditions[0].quote, "Exact condition");
  const development = knownDevelopment(village, "ella")[0];
  assert.equal(development.title, "Move to the orchard");
  assert.equal(development.status, "considering");
  assert.doesNotMatch(JSON.stringify(development), /private-attic|refused|arranged/u);
  const relationships = defaultRelationshipState("knowledge");
  relationships.edges[relationshipKey("ella", "player")] = {
    ...neutralRelationship("ella", "player"),
    friend: true,
    close: true,
  };
  relationships.edges[relationshipKey("ella", "gidget")] = {
    ...neutralRelationship("ella", "gidget"),
    warmth: 90,
    trust: 90,
  };
  relationships.knowledge.ella = {
    fromId: "ella",
    at: memoryTime(1),
    closeAt: memoryTime(1),
    routine: ["09:00 Bakery"],
    interests: "Reading",
    wishes: [],
    ties: [{ toId: "gidget", warmth: 10, trust: 20 }],
  };
  relationships.grants.door = {
    controllerId: "ella",
    visitorId: "player",
    venueId: "home",
    zoneId: "door",
    active: true,
    revoked: false,
  } as any;
  const profile = projectRelationshipProfiles(relationships, village)[0];
  assert.deepEqual(profile.routine, ["09:00 Bakery"]);
  assert.equal(profile.ties[0].warmth, 10);
  assert.equal(profile.access[0].active, true, "An established permission has its own mechanical authority.");
  // Characterize the observable contract PR 2 must preserve across domain-store removal.
  const domain = {
    wish: { status: "fulfilled", criteria: "plant lavender", proof: "receipt-1" },
    pursuit: { target: "private attic", consent: "refused", revision: 9 },
    relationship: { trust: 40, entryPermission: true },
    furniture: ["bench"],
  };
  let collection = emptyMemories();
  for (const [id, text] of [
    ["preference", "Ella prefers quiet mornings."],
    ["concern", "Ella worries about crowded rooms."],
    ["possibility", "Ella might enjoy a small book club."],
    ["boundary", "Ella asks visitors to knock."],
    ["reason", "Ella values the player's patience."],
  ])
    collection = addMemory(collection, {
      sourceId: id,
      audience: ["player"],
      text,
      patch: { kind: "information", domainRef: { kind: "relationship", id: "ella-player" } },
    });
  collection.records[0].knowers.player.disclosed = { title: "Move to the orchard", status: "considering" };
  const frozenDomain = structuredClone(domain),
    inspected = inspectMemory(collection, collection.records[0].id);
  assert.ok(inspected);
  assert.equal(projectMemories(collection, ["ella"]).length, 0, "Inspect is not learning.");
  assert.doesNotMatch(
    JSON.stringify(projectMemories(collection, ["player"])),
    /private attic|refused/u,
    "Domain reference cannot reveal current private values.",
  );
  collection = applyMemoryRepair(collection, memoryRepair(collection, "forget", ["player"]), memoryTime(20)).collection;
  assert.equal(projectMemories(collection, ["player"]).length, 4);
  assert.deepEqual(domain, frozenDomain);
  assert.ok(domain.relationship.entryPermission);
  assert.deepEqual(domain.furniture, ["bench"]);
  assert.doesNotMatch(JSON.stringify(projectMemories(collection, ["player"])), /Move to the orchard/u);
});
await runCase("memories/review-regressions", () => {
  let collection = addMemory(emptyMemories(), { audience: ["aqua"] });
  const first = memoryProposal(collection, {
    audience: ["aqua", "gidget"],
    text: "Aqua confirmed the observatory roof was completed.",
    patch: {
      action: "correct",
      target: targetOf(collection),
      kind: "experience",
      domainRef: { kind: "project", id: "observatory" },
      effectId: "observatory-complete",
    },
  });
  for (const state of Object.values(first.proposal.learners)) state.basis = "validated-event";
  first.context.committedEffects = [
    {
      status: "committed",
      id: first.proposal.effectId!,
      source: first.context.source,
      domainRef: first.proposal.domainRef!,
      occurredAt: first.context.occurredAt,
      committedAt: first.context.recordedAt,
      audience: ["aqua", "gidget"],
    },
  ];
  collection = applyMemoryProposal(collection, first.proposal, first.context).collection;
  assert.doesNotThrow(() => readMemoryCollection(JSON.parse(JSON.stringify(collection))));
  assert.equal(projectMemories(collection, ["gidget"])[0].knowers.gidget.basis, "validated-event");
  assert.ok(collection.records[0].knowers.gidget.learnedVia);
  const obsolete = memoryProposal(collection, {
    audience: ["gidget"],
    patch: { action: "reinforce", target: targetOf(collection), text: undefined, kind: undefined, subjects: undefined },
  });
  assert.throws(
    () => applyMemoryProposal(collection, obsolete.proposal, obsolete.context),
    /unambiguous recall/u,
    "Do not reinforce the suppressed old claim.",
  );
  const activeId = projectMemories(collection, ["gidget"])[0].id;
  const reinforce = memoryProposal(collection, {
    audience: ["gidget"],
    text: "The observatory roof is holding up.",
    patch: {
      action: "reinforce",
      target: targetOf(collection, activeId),
      text: undefined,
      kind: undefined,
      subjects: undefined,
    },
  });
  reinforce.proposal.learners.gidget.basis = "validated-event";
  collection = applyMemoryProposal(collection, reinforce.proposal, reinforce.context).collection;
  assert.doesNotThrow(() => readMemoryCollection(JSON.parse(JSON.stringify(collection))));
  const second = memoryProposal(collection, {
    audience: ["gidget"],
    text: "The roof work was actually only a temporary patch.",
    patch: { action: "correct", target: targetOf(collection), kind: "information" },
  });
  collection = applyMemoryProposal(collection, second.proposal, second.context).collection;
  assert.match(
    projectMemories(collection, ["gidget"])[0].text,
    /temporary patch/u,
    "Correct the canonical root even when recall supplies its current correction.",
  );

  let privatePromise = addMemory(emptyMemories(), { audience: ["aqua"] });
  const resolution = memoryProposal(privatePromise, {
    audience: ["aqua", "player"],
    text: "Aqua said the earlier arrangement was finished.",
    patch: { action: "resolve", target: targetOf(privatePromise), kind: "information" },
  });
  privatePromise = applyMemoryProposal(privatePromise, resolution.proposal, resolution.context).collection;
  const projected = projectMemories(privatePromise, ["aqua", "player"]);
  const playerResolution = projected.find((row) => row.knowers.player)!;
  assert.equal(
    playerResolution.resolves,
    undefined,
    "A shared resolution never exposes a private original's ID to another knower.",
  );

  const original = addMemory(emptyMemories(), { audience: ["aqua"] });
  const forgotten = applyMemoryRepair(original, memoryRepair(original, "forget", ["aqua"]), memoryTime(10)).collection;
  const unrelated = memoryProposal(forgotten, {
    audience: ["aqua"],
    sourceId: original.records[0].origin.id,
    text: "Fern enjoys cinnamon biscuits beside the bakery.",
    patch: { proposalId: "independent-meaning" },
  });
  const line = unrelated.context.evidence[0];
  line.lineId = "independent-accepted-line";
  const refreshedProtection = memoryProtectionContext(forgotten, {
    knowers: ["aqua"],
    query: unrelated.proposal.text!,
    sourceRefs: [{ source: line.source, lineId: line.lineId }],
  });
  unrelated.context.protection = refreshedProtection;
  unrelated.proposal.screening = {
    disposition: "clear",
    protectedRoots: [],
    fingerprint: refreshedProtection.fingerprint,
  };
  assert.equal(
    applyMemoryProposal(forgotten, unrelated.proposal, unrelated.context).status,
    "applied",
    "A forgotten line cannot pause unrelated learning in the same accepted exchange.",
  );
  assert.throws(
    () => applyMemoryRepair(original, memoryRepair(original, "forget", ["constructor"]), memoryTime(10)),
    /reserved/u,
  );
});
console.log(
  "Memories core: formation, per-knower repairs, authority, continuity, retained evidence and write protections passed.",
);
