import assert from "node:assert/strict";
import {
  projectInterpretationChecks,
  projectProposals,
  applyRecordedProjectPickup,
} from "../packages/villages/src/engine/packages/server/src/services/villages/project-checks.js";
import {
  readSystemInterpretations,
  readDecisionInterpretation,
  type InterpretationBatch,
} from "../packages/villages/src/engine/packages/server/src/services/villages/interpretation.js";
import { defaultVillageState } from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import {
  coerceProjectSpeech,
  validateProjectSpeech,
} from "../packages/villages/src/engine/packages/server/src/services/villages/project-interpretation.js";
import {
  createProjectProgress,
  recordProjectProgress,
} from "../packages/villages/src/engine/packages/server/src/services/villages/project-progress.js";
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
const checks = projectInterpretationChecks(scene, state, "Would you build the greenhouse?", draft, ["a"], "turn");
assert.equal(
  projectInterpretationChecks(
    scene,
    state,
    "Would you like tea?",
    [{ ...draft[0], content: "Tea sounds lovely." }],
    ["a"],
    "tea",
  ).length,
  0,
  "Unrelated conversation produces no Project interpretation candidates",
);
scene.submissions = [
  { message: "Would you build the Greenhouse?", projectContexts: [{ projectId: "p", revision: 4, phase: "builder" }] },
];
assert.equal(
  projectInterpretationChecks(
    scene,
    state,
    "And you?",
    [{ ...draft[0], content: "Yes, I'll do it." }],
    ["a"],
    "implicit",
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
const requirementChecks = projectInterpretationChecks(scene, state, "And finishing?", draft, ["a"], "requirements");
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
