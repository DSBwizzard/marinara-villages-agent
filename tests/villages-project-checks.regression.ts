import assert from "node:assert/strict";
import {
  projectProposals,
  applyRecordedProjectPickup,
} from "../packages/villages/src/server/domain/rules/project-check-rules.js";
import {
  createProjectChecks,
  type ProjectChecksPorts,
} from "../packages/villages/src/server/features/projects/project-check-service.js";
import {
  configureProjectChecks,
  interpretProjectDraft,
  finalizeProjectDiagnostics,
  applyProjectPickup,
} from "../packages/villages/src/server/features/projects/project-checks.js";
import { boundInterpretationEvidence } from "../packages/villages/src/server/domain/rules/interpretation-evidence-rules.js";
import { routeInterpretationChecks } from "../packages/villages/src/server/domain/rules/interpretation-routing.js";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  active,
  configureMetricsContext,
  pipelineSignal,
} from "../packages/villages/src/server/adapters/observability/metrics-context.js";
import {
  createMetricsContext,
  type Metrics,
} from "../packages/villages/src/server/adapters/observability/metrics-context-service.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import type { InterpretationCheck } from "../packages/villages/src/server/domain/models/interpretation-check-model.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { readSystemInterpretations } from "../packages/villages/src/server/domain/rules/interpretation-rules.js";
import { readDecisionInterpretation } from "../packages/villages/src/server/domain/rules/interpretation-rules.js";
import { type InterpretationBatch } from "../packages/villages/src/server/domain/models/interpretation-model.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  coerceProjectSpeech,
  validateProjectSpeech,
} from "../packages/villages/src/server/domain/rules/project-interpretation.js";
import {
  createProjectProgress,
  recordProjectProgress,
} from "../packages/villages/src/server/domain/rules/project-progress.js";
const state = defaultVillageState();
state.progressEngineVersion = 1;
state.villagers = [{ characterId: "a", cardSnapshot: { name: "Aqua" } }] as any;
state.projects = [
  {
    id: "p",
    title: "Greenhouse",
    detail: "A garden house",
    kind: "new-venue",
    status: "draft",
    venueId: "garden",
    lifecycle: { phase: "builder", builderId: "", affectedIds: [], requirements: [] },
  },
] as any;
state.progressTasks = [
  { definition: { owner: { kind: "project", id: "p" }, revision: 4 }, transitions: [], resolvedAt: "" },
] as any;
const scene: any = { id: "scene", zoneId: "garden:outside", activeIds: ["a"], lines: [], submissions: [] };
const draft: any[] = [
  {
    speakerId: "a",
    name: "Aqua",
    kind: "dialogue",
    content: "Sure, I guess. I don't have the lumber though.",
    heardBy: ["a"],
  },
];
async function projectInterpretationChecks(
  ...args: Parameters<ReturnType<typeof createProjectChecks>["interpretProjectDraft"]>
) {
  const unused = () => {
    throw Error("Check assembly must not read Village or Scene storage");
  };
  const service = createProjectChecks({
    readVillageState: unused,
    mutateVillageState: unused,
    sceneQueries: unused,
    pipelineSignal() {},
    contextualChecks: async (_id, checks) =>
      checks.map((check) => ({ ...check, essentialEvidenceIds: check.essentialEvidenceIds ?? [] })),
    boundInterpretationEvidence,
    routeInterpretationChecks,
    recordInterpretationRouting: async () => {},
    interpretChecks: async (checks) => ({
      checks,
      results: [],
      traces: [],
      settings: { decisionsEnabled: false, compareSystem: false },
    }),
    saveInterpretationContext: async () => {},
    writeInterpretationDiagnostics: async () => {},
  });
  return (await service.interpretProjectDraft(...args))?.checks ?? [];
}
const checks = await projectInterpretationChecks(scene, state, "Would you build the greenhouse?", draft, ["a"], "turn");
assert.equal(
  (
    await projectInterpretationChecks(
      scene,
      state,
      "Would you like tea?",
      [{ ...draft[0], content: "Tea sounds lovely." }],
      ["a"],
      "tea",
    )
  ).length,
  0,
  "Unrelated conversation produces no Project interpretation candidates",
);
scene.submissions = [
  { message: "Would you build the Greenhouse?", projectContexts: [{ projectId: "p", revision: 4, phase: "builder" }] },
];
assert.equal(
  (
    await projectInterpretationChecks(
      scene,
      state,
      "And you?",
      [{ ...draft[0], content: "Yes, I'll do it." }],
      ["a"],
      "implicit",
    )
  ).length,
  1,
  "A witnessed Project question keeps its implicit answer relevant",
);
scene.submissions = [];
assert.equal(checks.length, 1, "State discovers candidates even without exact title phrasing");
function batch(outcome: string, source: "system" | "decisions" = "system", details?: unknown): InterpretationBatch {
  const result = {
    outcome,
    source,
    evidenceIds: ["draft:0"],
    reason: "Labeled fixture",
    ...(details ? { details } : {}),
  };
  return {
    checks,
    results: [result],
    settings: { decisionsEnabled: source === "decisions", compareSystem: true },
    traces: [
      {
        id: "check",
        question: checks[0].question,
        domain: "project",
        evidence: checks[0].evidence,
        decisions: { status: "off" },
        system: { status: "not-requested" },
        result,
        applied: "Not yet applied",
        startedAt: "",
      },
    ],
  };
}
for (const source of ["system", "decisions"] as const) {
  const proposal = projectProposals(batch("commit", source))[0];
  assert.equal(proposal.citations[0].quote, draft[0].content);
  assert.equal(
    validateProjectSpeech(proposal, [{ ...draft[0], id: "0" }]),
    "",
    "Caution and reluctant wording do not mechanically veto a commitment",
  );
  assert.equal(coerceProjectSpeech([proposal])[0].contextual?.source, source);
}
for (const outcome of ["none", "unresolved"]) assert.equal(projectProposals(batch(outcome)).length, 0);
const mislabeled = readSystemInterpretations(
  { results: [{ id: checks[0].id, outcome: "commit", evidenceIds: ["someone-else"] }] },
  checks,
);
assert.equal(mislabeled[0].outcome, "unresolved");
assert.equal(readDecisionInterpretation(checks[0], new Map([["0:0", NaN]]), 0.5, 0), null);
assert.equal(
  readDecisionInterpretation(checks[0], new Map([["0:0", 0.1]]), 0.5, 0),
  null,
  "A miss requires System, not denial",
);
const ambiguous = batch("commit", "decisions");
ambiguous.checks.push({ ...checks[0], id: "other", facts: { ...(checks[0].facts as any), projectId: "other" } });
ambiguous.results.push({ ...ambiguous.results[0] });
ambiguous.traces.push({ ...ambiguous.traces[0], id: "other" });
assert.equal(projectProposals(ambiguous).length, 0, "One ambiguous reply does not commit to every candidate");
assert(
  ambiguous.traces.every((trace) => trace.applied === "Unresolved: multiple Project targets require clarification"),
  "proposal binding deliberately updates the supplied traces",
);
state.projects[0].lifecycle!.phase = "requirements";
state.projects[0].lifecycle!.builderId = "a";
scene.lines = [
  {
    id: "older",
    role: "assistant",
    speakerId: "a",
    name: "Aqua",
    kind: "dialogue",
    content: "Use cedar for the frame and a small workbench.",
    heardBy: ["a"],
    at: "2026-10-01T10:00:00Z",
  },
  {
    id: "secret",
    role: "assistant",
    speakerId: "a",
    name: "Aqua",
    content: "Hidden plans",
    contactHidden: true,
    heardBy: ["a"],
    at: "2026-10-01T10:00:00Z",
  },
];
scene.submissions = [
  { replyLineIds: ["older"], projectContexts: [{ projectId: "p", revision: 4, phase: "requirements" }] },
];
draft[0].content = "That takes care of the finish already. No more to buy.";
const requirementChecks = await projectInterpretationChecks(
  scene,
  state,
  "And finishing?",
  draft,
  ["a"],
  "requirements",
);
assert.equal(requirementChecks[0].decisionEligible, false, "Open-ended faithful extraction stays native");
assert.ok(!requirementChecks[0].evidence.some((item) => item.id === "secret"));
checks.splice(0, checks.length, ...requirementChecks);
const requirementBatch = batch("requirements", "system", {
  citations: [
    { evidenceId: "draft:0", quote: draft[0].content },
    { evidenceId: "older", quote: scene.lines[0].content },
  ],
  checklist: [
    { category: "structure", title: "cedar frame", needed: true, citation: 1 },
    { category: "equipment", title: "small workbench", needed: true, citation: 1 },
    { category: "finish", title: "already finished; nothing to buy", needed: false, citation: 0 },
  ],
});
const proposal = projectProposals(requirementBatch)[0];
assert.equal(
  proposal.citations[1].lineId,
  "older",
  "Requirements can cite witnessed earlier exchanges in the same revision",
);
assert.equal(validateProjectSpeech(proposal, [{ ...draft[0], id: "0" }, scene.lines[0]]), "");
(requirementBatch.results[0].details as any).citations[1].evidenceId = "secret";
assert.equal(
  projectProposals(requirementBatch).length,
  0,
  "Unseen or unrelated citations cannot complete requirements",
);
let pickupCheckWorld: VillageState | undefined;
for (const version of [1] as const) {
  const stock = defaultVillageState();
  stock.progressEngineVersion = version;
  const at = "2026-10-01T10:00:00.000Z";
  const project: any = {
    id: "stock-project",
    title: "Workbench",
    kind: "renovation",
    status: "active",
    venueId: "shop",
    updatedAt: at,
    lifecycle: {
      version: 2,
      phase: "materials",
      builderId: "a",
      affectedIds: [],
      approvals: [],
      candidates: [],
      requirements: [
        { id: "wood", category: "structure", title: "cedar", needed: true, carriedAt: "", deliveredAt: "" },
      ],
      sources: [
        {
          requirementId: "wood",
          kind: "existing-item",
          venueId: "shop",
          zoneId: "shop:common",
          itemName: "cedar",
          supplierId: "",
          evidenceId: "source",
          at,
          acquiredAt: "",
        },
      ],
      recordedItems: [{ venueId: "shop", zoneId: "shop:common", itemName: "cedar" }],
      evidenceIds: [],
      spokenProofs: [],
      heldSupplies: [],
      completedAt: "",
      requirementsAcceptedAt: at,
    },
  };
  stock.projects.push(project);
  stock.venueEvents.push({
    id: "pickup",
    venueId: "shop",
    venueName: "Shop",
    zoneId: "shop:common",
    text: "Pat picks up cedar",
    at,
    actionReceipt: {
      submissionId: "act",
      happened: true,
      narration: "Pat picks up cedar",
      removeItem: "cedar",
      transferTo: "player",
      itemTransfer: { itemName: "cedar", recipientId: "player" },
      witnessIds: ["a"],
    },
  });
  if (version === 1) {
    createProjectProgress(stock, project, at);
    const task = stock.progressTasks[0];
    task.phaseIndex = task.definition.phases.findIndex((phase) => phase.id === "materials");
    recordProjectProgress(
      stock,
      project,
      "source:wood",
      {
        id: "source-proof",
        kind: "project-source",
        sourceId: "source",
        at,
        venueId: "shop",
      },
      "recorded-item",
    );
  }
  const revision = stock.progressTasks[0].definition.revision;
  pickupCheckWorld = structuredClone(stock);
  if (version === 1) {
    const absentSourceProof = structuredClone(stock);
    absentSourceProof.progressTasks[0].receipts = [];
    assert.equal(
      applyRecordedProjectPickup(absentSourceProof, "pickup", project.id, "wood", revision, "act"),
      false,
      "Missing canonical source proof rejects allocation without failing a saved action",
    );
  }
  assert.equal(applyRecordedProjectPickup(stock, "pickup", project.id, "wood", revision + 1, "act"), false);
  const missing = structuredClone(stock);
  delete missing.venueEvents[0].actionReceipt!.itemTransfer;
  assert.equal(
    applyRecordedProjectPickup(missing, "pickup", project.id, "wood", revision, "act"),
    false,
    "A statement or removal alone cannot establish acquired stock",
  );
  const wrong = structuredClone(stock);
  wrong.venueEvents[0].actionReceipt!.itemTransfer!.recipientId = "a";
  assert.equal(applyRecordedProjectPickup(wrong, "pickup", project.id, "wood", revision, "act"), false);
  assert.equal(applyRecordedProjectPickup(stock, "pickup", project.id, "wood", revision, "act"), true);
  assert.equal(project.lifecycle.requirements[0].carriedAt, at);
  assert.equal(
    applyRecordedProjectPickup(stock, "pickup", project.id, "wood", revision, "act"),
    false,
    "A replay cannot consume one physical pickup twice",
  );
  if (version === 1)
    assert.ok(stock.progressTasks[0].receipts.some((receipt) => receipt.requirementId === "acquired:wood"));
}
console.log(
  "Villages Project checks: contextual speech, current routing, exact evidence, ambiguity, and historical requirements ok",
);

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
}
function resultBatch(selected: InterpretationCheck[], label: string): InterpretationBatch {
  const results = selected.map((check) => ({
    outcome: check.outcomes[0]!.id,
    source: "system" as const,
    evidenceIds: check.evidence.filter((line) => line.current).map((line) => line.id),
    reason: label,
  }));
  return {
    checks: selected,
    results,
    settings: { decisionsEnabled: false, compareSystem: false },
    traces: selected.map((check, index) => ({
      id: "trace:" + check.id,
      question: check.question,
      domain: check.domain,
      evidence: check.evidence,
      decisions: { status: "off" as const },
      system: { status: "complete" as const },
      result: results[index]!,
      applied: "Not yet applied",
      startedAt: "2026-10-07T12:00:00Z",
    })),
  };
}
function checksOwner(label: string, pickup = false) {
  assert(pickupCheckWorld);
  const world = structuredClone(pickup ? pickupCheckWorld : state);
  world.name = label;
  if (!pickup) {
    world.projects[0]!.lifecycle!.phase = "builder";
    world.projects[0]!.lifecycle!.builderId = "";
    world.projects[0]!.lifecycle!.spokenProofs = [];
    world.progressTasks[0]!.attempts = [];
  }
  const scene = coerceSession({
    id: "same-scene",
    placeId: "shop",
    placeName: "Shop",
    status: "active",
    startedAt: "2026-10-07T12:00:00Z",
    activeIds: ["a"],
    participants: [{ characterId: "a", name: label, doing: "listening" }],
    submissions: [],
    lines: [],
  });
  const draft = [{ speakerId: "a", content: "I will build Greenhouse.", kind: "dialogue" as const, heardBy: ["a"] }];
  const calls: string[] = [],
    owners: unknown[] = [],
    batches: InterpretationBatch[] = [],
    diagnostics: InterpretationBatch["traces"][] = [];
  const entered = deferred(),
    gate = deferred(),
    exact = new Error(label + " exact connection failure");
  let paused = "",
    failed = "",
    losing: VillageState | undefined,
    beforeUpdate: (() => void) | undefined;
  function note(stage: string) {
    calls.push(stage);
    owners.push(scopedActivation());
    if (scopedActivation()?.active === false) throw Error("Original Project checks connection unavailable.");
    if (failed === stage) throw exact;
  }
  async function touch(stage: string) {
    note(stage);
    const owner = scopedActivation();
    if (stage === paused) {
      paused = "";
      entered.resolve();
      await gate.promise;
    }
    if (owner && !owner.active) throw Error("Original Project checks connection unavailable.");
    assert.equal(scopedActivation(), owner);
  }
  const ports: ProjectChecksPorts = {
    async readVillageState() {
      await touch("world");
      return world;
    },
    async mutateVillageState(update) {
      await touch("mutation");
      beforeUpdate?.();
      if (losing) update(losing);
      update(world);
      return world;
    },
    sceneQueries() {
      note("queries");
      return {
        async readProjectTurnEvidence(sessionId, submissionId) {
          await touch("turn");
          return {
            sessionId,
            submissionId,
            venueId: "shop",
            zoneId: "shop:common",
            mode: "chat" as const,
            message: label + " gathers cedar for Workbench",
            at: "2026-10-07T12:00:00Z",
            areaAtTurn: "shared" as const,
            activeIdsAtTurn: ["a"],
            action: null,
            projectContexts: [],
            projectSpeech: [],
            contextualInterpretation: false,
            contextLines: [],
            lines: [],
          };
        },
      };
    },
    pipelineSignal(name) {
      note("signal");
      pipelineSignal(name);
    },
    async contextualChecks(id, selected) {
      await touch("context");
      assert.equal(id, scene.id);
      return selected.map((check) => ({ ...check, essentialEvidenceIds: check.essentialEvidenceIds ?? [] }));
    },
    boundInterpretationEvidence(check) {
      note("bound");
      return boundInterpretationEvidence(check);
    },
    routeInterpretationChecks(selected, raw, context) {
      note("route");
      return routeInterpretationChecks(selected, raw, context);
    },
    async recordInterpretationRouting(id) {
      await touch("routing-record");
      assert.equal(id, scene.id);
    },
    async interpretChecks(selected, stage, id) {
      await touch("interpret");
      assert.equal(id, scene.id);
      assert.equal(stage, pickup ? "recorded-supply:act" : "project-interpretation:same-key");
      if (pickup) assert(selected.every((check) => check.decisionEligible === false));
      const batch = resultBatch(selected, label);
      batches.push(batch);
      return batch;
    },
    async saveInterpretationContext(id, supplied) {
      await touch("context-save");
      assert.equal(id, scene.id);
      assert.equal(supplied, batches[0]);
    },
    async writeInterpretationDiagnostics(id, traces) {
      await touch("diagnostics");
      assert.equal(id, scene.id);
      diagnostics.push(traces);
    },
  };
  return {
    world,
    scene,
    draft,
    calls,
    owners,
    batches,
    diagnostics,
    entered,
    gate,
    exact,
    service: createProjectChecks(ports),
    pause(stage: string) {
      paused = stage;
    },
    fail(stage: string) {
      failed = stage;
    },
    retry(discarded: VillageState) {
      losing = discarded;
    },
    beforeMutation(work: () => void) {
      beforeUpdate = work;
    },
    prepareDiagnostics() {
      const check: InterpretationCheck = {
        id: "diagnostic",
        domain: "project",
        question: "Builder?",
        outcomes: [{ id: "commit", statement: "Commits" }],
        evidence: [{ id: "draft:0", speakerId: "a", name: "Aqua", content: "I will build Greenhouse.", current: true }],
        facts: { projectId: "p", kind: "builder", actorId: "a", revision: 4, phase: "builder" },
      };
      const batch = resultBatch([check], label);
      batches.push(batch);
      return batch;
    },
  };
}

async function ownedChecks() {
  const plain = checksOwner("plain");
  assert.deepEqual(plain.calls, [], "construction must not read, interpret or signal");
  const reply = await plain.service.interpretProjectDraft(
    plain.scene,
    plain.world,
    "Will you build Greenhouse?",
    plain.draft,
    ["a"],
    "same-key",
  );
  assert(reply);
  assert.equal(reply.results[0]!.reason, "plain");
  assert.deepEqual(plain.calls, ["context", "bound", "route", "routing-record", "interpret"]);

  for (const [command, stages] of [
    ["draft", ["context", "routing-record", "interpret"]],
    ["diagnostic", ["context-save", "world", "diagnostics"]],
    ["pickup", ["world", "turn", "interpret", "mutation", "diagnostics"]],
  ] as const) {
    for (const stage of stages) {
      const a = createActivationScope(),
        b = createActivationScope();
      const fa = checksOwner("A", command === "pickup"),
        fb = checksOwner("B", command === "pickup");
      const ba = command === "diagnostic" ? fa.prepareDiagnostics() : null;
      const bb = command === "diagnostic" ? fb.prepareDiagnostics() : null;
      const releaseA = a.run(() => configureProjectChecks(fa.service));
      const releaseB = b.run(() => configureProjectChecks(fb.service));
      const clearA = installDefaultActivation(a, () => {});
      const invoke = (f: ReturnType<typeof checksOwner>, batch: InterpretationBatch | null) =>
        command === "draft"
          ? interpretProjectDraft(f.scene, f.world, "Will you build Greenhouse?", f.draft, ["a"], "same-key")
          : command === "diagnostic"
            ? finalizeProjectDiagnostics(f.scene.id, batch!, projectProposals(batch!), "turn")
            : applyProjectPickup(f.scene.id, "act");
      fa.pause(stage);
      const pending = invoke(fa, ba);
      await fa.entered.promise;
      const clearB = installDefaultActivation(b, () => {});
      releaseA();
      clearA();
      const current = await invoke(fb, bb);
      fa.gate.resolve();
      const prior = await pending;
      if (command === "draft") {
        assert(prior && current);
        assert.equal(prior.results[0]!.reason, "A");
        assert.equal(current.results[0]!.reason, "B");
      } else if (command === "diagnostic") {
        assert.equal(fa.diagnostics[0], ba!.traces);
        assert.equal(fb.diagnostics[0], bb!.traces);
        assert.match(ba!.traces[0]!.applied, /Rejected or deferred/);
      } else {
        assert.equal(fa.world.projectSourceClaims.length, 1);
        assert.equal(fb.world.projectSourceClaims.length, 1);
        assert.equal(fa.diagnostics[0], fa.batches[0]!.traces);
        assert.equal(fb.diagnostics[0], fb.batches[0]!.traces);
      }
      assert(fa.owners.every((owner) => owner === a));
      assert(fb.owners.every((owner) => owner === b));
      const repeat = await interpretProjectDraft(
        fb.scene,
        fb.world,
        "Will you build Greenhouse?",
        fb.draft,
        ["a"],
        "same-key",
      );
      if (command !== "pickup") {
        assert(repeat);
        assert.equal(repeat.results[0]!.reason, "B");
      }
      releaseB();
      clearB();
      a.dispose();
      b.dispose();
    }
  }

  for (const stage of ["context", "interpret"]) {
    const f = checksOwner(stage);
    f.fail(stage);
    await assert.rejects(
      f.service.interpretProjectDraft(f.scene, f.world, "Will you build Greenhouse?", f.draft, ["a"], "same-key"),
      (error) => error === f.exact,
    );
    assert.equal(f.calls.filter((call) => call === stage).length, 1, "fatal connections do not retry");
  }
  const routingFailure = checksOwner("routing");
  routingFailure.fail("routing-record");
  assert(
    await routingFailure.service.interpretProjectDraft(
      routingFailure.scene,
      routingFailure.world,
      "Will you build Greenhouse?",
      routingFailure.draft,
      ["a"],
      "same-key",
    ),
    "routing diagnostics remain best effort",
  );
  for (const stage of ["context-save", "diagnostics", "world"]) {
    const f = checksOwner(stage),
      batch = f.prepareDiagnostics();
    f.fail(stage);
    const pending = f.service.finalizeProjectDiagnostics(f.scene.id, batch, projectProposals(batch), "turn");
    if (stage === "world") await assert.rejects(pending, (error) => error === f.exact);
    else await pending;
    if (stage === "context-save") assert.match(batch.traces[0]!.applied, /Rejected or deferred/);
  }

  for (const winning of [true, false]) {
    const f = checksOwner("retry", true),
      lost = structuredClone(f.world);
    if (winning) lost.progressTasks[0]!.definition.revision++;
    else
      f.beforeMutation(() => {
        f.world.progressTasks[0]!.definition.revision++;
      });
    f.retry(lost);
    await f.service.applyProjectPickup(f.scene.id, "act");
    assert.equal(f.world.projectSourceClaims.length, winning ? 1 : 0);
    assert.equal(
      f.diagnostics[0]![0]!.applied.startsWith("Acquired supply"),
      winning,
      "diagnostics and allocation must reflect the winning CAS attempt",
    );
    const calls = f.calls.filter((call) => call === "interpret").length;
    if (winning) {
      await f.service.applyProjectPickup(f.scene.id, "act");
      assert.equal(
        f.calls.filter((call) => call === "interpret").length,
        calls,
        "duplicate pickup has no interpretation request",
      );
      assert.equal(f.world.projectSourceClaims.length, 1);
    }
  }

  for (const invalid of ["no-event", "not-happened", "other-recipient", "already-claimed", "source-acquired"]) {
    const f = checksOwner(invalid, true),
      event = f.world.venueEvents[0]!;
    if (invalid === "no-event") f.world.venueEvents = [];
    if (invalid === "not-happened") event.actionReceipt!.happened = false;
    if (invalid === "other-recipient") event.actionReceipt!.itemTransfer!.recipientId = "a";
    if (invalid === "already-claimed")
      f.world.projectSourceClaims.push({ key: "claimed", projectId: "other", sourceId: event.id, submissionId: "act" });
    if (invalid === "source-acquired") f.world.projects[0]!.lifecycle!.sources[0]!.acquiredAt = event.at;
    await f.service.applyProjectPickup(f.scene.id, "act");
    assert.equal(f.calls.includes("interpret"), false, "early authority gates must not request interpretation");
  }

  for (const change of ["source", "claim", "phase"]) {
    const f = checksOwner(change, true);
    f.beforeMutation(() => {
      if (change === "source") f.world.projects[0]!.lifecycle!.sources[0]!.acquiredAt = "2026-10-07T12:00:00Z";
      if (change === "phase") f.world.projects[0]!.lifecycle!.phase = "construction";
      if (change === "claim")
        f.world.projectSourceClaims.push({
          key: "earlier",
          projectId: "other",
          sourceId: "pickup",
          submissionId: "act",
        });
    });
    await f.service.applyProjectPickup(f.scene.id, "act");
    assert.equal(f.world.projects[0]!.lifecycle!.requirements[0]!.carriedAt, "");
    assert.equal(f.diagnostics[0]![0]!.applied, "Rejected: current transfer or Project state changed");
  }
  const ambiguousPickup = checksOwner("ambiguous", true);
  const second = structuredClone(ambiguousPickup.world.projects[0]!);
  second.id = "other-project";
  ambiguousPickup.world.projects.push(second);
  await ambiguousPickup.service.applyProjectPickup(ambiguousPickup.scene.id, "act");
  assert.equal(ambiguousPickup.batches[0]!.checks.length, 2);
  assert.equal(ambiguousPickup.world.projectSourceClaims.length, 0);
  assert(!ambiguousPickup.calls.includes("mutation"));
  assert(
    ambiguousPickup.diagnostics[0]!.every(
      (trace) => trace.applied === "Unresolved: choose which Project receives this acquired supply",
    ),
  );

  const owner = createActivationScope(),
    replacement = createActivationScope();
  const fa = checksOwner("metrics-A"),
    fb = checksOwner("metrics-B");
  const ma = createMetricsContext(),
    mb = createMetricsContext();
  const releaseMetricsA = owner.run(() => configureMetricsContext(ma));
  const releaseMetricsB = replacement.run(() => configureMetricsContext(mb));
  const releaseA = owner.run(() => configureProjectChecks(fa.service));
  const releaseB = replacement.run(() => configureProjectChecks(fb.service));
  const clearA = installDefaultActivation(owner, () => {});
  const blankMetrics = (): Metrics => ({
    reads: 0,
    writes: 0,
    requests: 0,
    reportedInputTokens: 0,
    reportedOutputTokens: 0,
    unknownUsageRequests: 0,
    failedRequests: 0,
    modelLatencyMs: 0,
    signals: {},
  });
  const countersA = blankMetrics(),
    countersB = blankMetrics();
  fa.pause("context");
  const pending = active.run(countersA, () =>
    interpretProjectDraft(
      fa.scene,
      fa.world,
      "Tea?",
      [{ ...fa.draft[0]!, content: "Tea sounds lovely." }],
      ["a"],
      "same-key",
    ),
  );
  await fa.entered.promise;
  const clearB = installDefaultActivation(replacement, () => {});
  releaseA();
  clearA();
  fa.gate.resolve();
  assert.equal(await pending, null);
  assert.equal(countersA.signals.projectRelevanceSkips, 1);
  assert.deepEqual(countersB.signals, {});
  assert.equal(
    await active.run(countersB, () =>
      interpretProjectDraft(
        fb.scene,
        fb.world,
        "Tea?",
        [{ ...fb.draft[0]!, content: "Tea sounds lovely." }],
        ["a"],
        "same-key",
      ),
    ),
    null,
  );
  assert.equal(countersB.signals.projectRelevanceSkips, 1);
  assert(!fa.calls.includes("interpret") && !fb.calls.includes("interpret"));
  releaseB();
  clearB();
  releaseMetricsA();
  releaseMetricsB();
  owner.dispose();
  replacement.dispose();

  const retired = createActivationScope(),
    f = checksOwner("retired", true);
  const release = retired.run(() => configureProjectChecks(f.service));
  const clear = installDefaultActivation(retired, () => {});
  f.pause("world");
  const finishing = applyProjectPickup(f.scene.id, "act");
  await f.entered.promise;
  retired.dispose();
  f.gate.resolve();
  await assert.rejects(finishing, /Original Project checks connection unavailable/);
  assert(!f.calls.includes("interpret"));
  release();
  clear();
  await assert.rejects(applyProjectPickup("same-scene", "act"), /not configured/);
  console.log("PASS owned Project checks, originating connections/metrics, CAS outcomes, early gates and diagnostics");
}
await ownedChecks();
