import assert from "node:assert/strict";
import type { CapabilityDecisionResult } from "@marinara-engine/shared";
import { createInterpretation } from "../packages/villages/src/server/features/generation/interpretation-service.js";
import { createWishInterpretation } from "../packages/villages/src/server/features/residents/wishes/wish-interpretation-service.js";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { InterpretationCheck } from "../packages/villages/src/server/domain/models/interpretation-check-model.js";
import type { WishInterpretationContext } from "../packages/villages/src/server/domain/models/wish-interpretation-model.js";
import {
  boundDecisionResult,
  decisionCandidates,
  validDecisionEvidence,
} from "../packages/villages/src/server/domain/rules/decision-candidates.js";
import { coerceInterpretationSettings } from "../packages/villages/src/server/domain/rules/interpretation-policy.js";
import { projectProposals } from "../packages/villages/src/server/domain/rules/project-check-rules.js";
import { roomInterpretationChecks } from "../packages/villages/src/server/features/scenes/room-interpretation.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { applyPreparedWishVerdict } from "../packages/villages/src/server/domain/rules/wish-progress-rules.js";
import { wishFingerprint } from "../packages/villages/src/server/domain/rules/wish-interpretation-rules.js";
import type {
  PreparedWishVerdict,
  WishCheckInput,
} from "../packages/villages/src/server/domain/models/wish-check-model.js";

const narrow: InterpretationCheck = {
  id: "project",
  domain: "project",
  question: "Does Ada commit to the bench?",
  facts: { actorId: "ada", kind: "builder", title: "Bench", description: "Build a bench", projectId: "bench" },
  outcomes: [
    { id: "commit", statement: "Ada personally commits to building the bench now, not merely a plan or capability." },
  ],
  evidence: [
    { id: "request", speakerId: "player", name: "Pat", content: "Will you build the bench?" },
    { id: "draft:0", speakerId: "ada", name: "Ada", content: "Yes, I'll build it.", current: true },
  ],
};
const candidate = decisionCandidates(narrow)![0];
assert(candidate.question.includes("Will you build the bench?"));
assert(candidate.question.includes("Yes, I'll build it."));
assert(candidate.question.includes('"when":"history"'));
assert(candidate.question.includes('"when":"now"'));
assert(candidate.question.length <= 500);
const grounded = boundDecisionResult(narrow, candidate);
assert.deepEqual(grounded.evidenceIds, ["draft:0"]);
assert(validDecisionEvidence(narrow, grounded));
assert(!validDecisionEvidence(narrow, { ...grounded, details: undefined }), "legacy results are inert");
assert(!validDecisionEvidence({ ...narrow, facts: { ...(narrow.facts as object), title: "Bridge" } }, grounded));
assert(!validDecisionEvidence(narrow, { ...grounded, evidenceIds: ["request"] }));
for (const content of ["Maybe, if you pay me.", 'She said "I agree".', "No, I refuse.", "Hello."]) {
  const check = structuredClone(narrow);
  check.evidence[1].content = content;
  assert.equal(decisionCandidates(check), null, content + " defers to System");
}
assert.equal(
  decisionCandidates({
    ...narrow,
    evidence: [...narrow.evidence, { ...narrow.evidence[0], id: "long", content: "context ".repeat(100) }],
  }),
  null,
);
assert.equal(decisionCandidates({ ...narrow, essentialEvidenceIds: ["absent"] }), null);
assert.deepEqual(coerceInterpretationSettings({ compareSystem: true }), { decisionsEnabled: false });

const roomWorld = defaultVillageState();
const home = venueDraft({ name: "Home", description: "A small home", classes: ["residence"] }, null);
home.residentIds = ["ada"];
roomWorld.venues = [home];
roomWorld.playerPersonaName = "Pat";
const roomScene = coerceSession({
  id: "room",
  placeId: home.id,
  zoneId: "exterior",
  activeIds: ["ada"],
  participants: [{ characterId: "ada", name: "Ada", doing: "Talking" }],
  lines: [],
  submissions: [],
});
const roomChecks = roomInterpretationChecks(
  roomScene,
  roomWorld,
  "",
  [{ speakerId: "ada", content: "Come inside.", kind: "dialogue", heardBy: ["ada"] }],
  "room",
);
const roomCheck = roomChecks.find((check) => check.outcomes.some((outcome) => outcome.id === "invite-now"))!;
const roomCandidates = decisionCandidates(roomCheck);
assert(roomCandidates, "a normal narrow room check fits the public API without truncation");
assert(roomCandidates.every((candidate) => candidate.question.includes("Pat") && candidate.question.includes("Ada")));
assert(validDecisionEvidence(roomCheck, boundDecisionResult(roomCheck, roomCandidates[0])));
const policyOnly = { ...roomCheck, outcomes: [{ id: "ban-zone", statement: "Ada permanently bans Pat." }] };
assert.equal(decisionCandidates(policyOnly), null, "policy-only questions go directly to System");

const context = createBackgroundContext();
let enabled = true,
  available = true,
  decisionCalls = 0,
  systemCalls = 0,
  attempts = 0;
let answer: CapabilityDecisionResult | null = {
  model: null,
  threshold: 0.1,
  answers: { "0:0": 0.8, "0:1": 0 },
  choices: {},
};
let evaluateHook: (() => Promise<void>) | undefined;
const decisions = createInterpretation({
  ...context,
  readInterpretationSettings: async () => ({ decisionsEnabled: enabled }),
  decisionAdapterStatus: async () => ({ available, reason: "" }),
  evaluateVillagesDecisions: async (request) => {
    decisionCalls++;
    assert(request.questions.every((q) => q.question.length <= 500));
    assert.deepEqual(request.messages, []);
    await evaluateHook?.();
    request.signal?.throwIfAborted();
    return answer;
  },
  trackUsage: async (meta, work) => {
    assert.equal(meta.capability, "decisions");
    attempts++;
    return work();
  },
  venueOperationSignal: () => undefined,
  venueInterpretationSettings: () => ({ decisionsEnabled: enabled }),
  venueCheckpoint: async (_stage, work) => work(),
  coordinatedOptionalCompletion: async (_key, work) => {
    try {
      return await work(new AbortController().signal);
    } catch {
      return undefined;
    }
  },
  systemInterpretations: async (checks) => {
    systemCalls++;
    return checks.map((check) => ({
      outcome: "unresolved",
      source: "system" as const,
      evidenceIds: [],
      reason: check.id,
    }));
  },
  writeInterpretationDiagnostics: async () => {},
  bindCallback: (callback) => callback,
});
const run = () => decisions.interpretChecks([narrow], "test");
const good = await run();
assert.equal(good.results[0].source, "decisions");
assert.equal(systemCalls, 0);
assert.equal(good.traces[0].decisions.model, null);
assert.equal(projectProposals(good).length, 1);
const legacy = structuredClone(good);
delete legacy.results[0].details;
assert.equal(projectProposals(legacy).length, 0);
for (const malformed of [
  null,
  { ...answer!, threshold: 0 },
  { ...answer!, threshold: NaN },
  { ...answer!, threshold: 1.1 },
  { ...answer!, answers: {} },
  { ...answer!, answers: { "0:0": NaN } },
  { ...answer!, answers: { "0:0": 1.1 } },
  { ...answer!, answers: { "0:0": 0 } },
]) {
  answer = malformed;
  const before = systemCalls;
  assert.equal((await run()).results[0].source, "system");
  assert.equal(systemCalls, before + 1, "one fallback for unavailable/malformed/negative scores");
}
answer = { model: "fixture", threshold: 0.5, answers: { "0:0": 1, "1:0": 1 }, choices: {} };
const conflicts = await decisions.interpretChecks(
  [
    narrow,
    { ...narrow, id: "other", facts: { ...(narrow.facts as object), projectId: "other", title: "Other bench" } },
  ],
  "conflict",
);
assert(conflicts.results.every((row) => row.source === "system"));
const beforePreflight = decisionCalls;
await decisions.interpretChecks(
  [{ ...narrow, evidence: [{ ...narrow.evidence[1], content: "x".repeat(600) }] }],
  "long",
);
available = false;
await run();
available = true;
enabled = false;
await run();
enabled = true;
assert.equal(decisionCalls, beforePreflight, "oversized, unsupported and disabled checks make zero attempts");
assert.equal(attempts, decisionCalls);

const wish: WishInterpretationContext = {
  actorId: "ada",
  card: { name: "Ada" },
  playerName: "Pat",
  claim: "",
  wishes: [{ id: "wish", wish: "Talk about roses", tell: "", intensity: 1, addedAt: "2026-01-01", expiresAt: "" }],
  evidence: [
    { id: "spoken", speakerId: "player", name: "Pat", content: "My roses bloomed.", current: true, at: "2026-10-01" },
  ],
  receipts: [],
} as WishInterpretationContext;
const wishes = createWishInterpretation({
  VILLAGES_PACKAGE_ID: "villages",
  villagesDocuments: () => ({ getById: async () => null }),
  interpretChecks: decisions.interpretChecks,
  systemInterpretations: async (checks) => {
    systemCalls++;
    return checks.map(() => ({ outcome: "none", source: "system" as const, evidenceIds: [], reason: "" }));
  },
  bindCallback: (callback) => callback,
});
answer = { model: null, threshold: 0.5, answers: { "0:0": 1, "0:1": 0 }, choices: {} };
const beforeLegacy = decisionCalls;
await wishes.interpretWishBatch([wish], "scene", "v2", true, true);
assert.equal(decisionCalls, beforeLegacy, "legacy Wish profile remains System-only");
const v3 = await wishes.interpretWishBatch([wish], "scene", "v3", true, true, true);
assert.equal(v3.results[0].source, "decisions");
assert.equal((v3.results[0].details as any).proofKind, "conversation");
assert(validDecisionEvidence(v3.checks[0], v3.results[0]));
for (const change of ["none", "evidence", "binding", "wish"] as const) {
  const state = defaultVillageState();
  state.seed = "wish-application";
  state.foundedAt = "2026-01-01";
  const currentWish = structuredClone(wish.wishes[0]);
  state.villagers = [
    {
      characterId: "ada",
      cardSnapshot: { name: "Ada" },
      completedWishes: [],
      agenda: { ...unwrittenVillageAgenda([], "Ada"), wishes: [currentWish] },
    },
  ] as any;
  const input: WishCheckInput = {
    contractVersion: 3,
    sceneId: "scene",
    submissionId: "turn",
    seed: state.seed,
    at: "2026-10-01",
    wish: currentWish,
    context: structuredClone(wish),
    proposal: {
      actorId: "ada",
      wishId: currentWish.id,
      fingerprint: wishFingerprint(currentWish),
      intent: "check",
      lineIds: ["spoken"],
    },
  };
  const verdict: PreparedWishVerdict = {
    decision: { check: structuredClone(v3.checks[0]), result: structuredClone(v3.results[0]) },
    criteria: (v3.checks[0].facts as any).criteria,
    outcome: "fulfilled",
    evidenceIds: ["spoken"],
    receiptIds: [],
    reason: "",
    memory: "",
  };
  if (change === "evidence") input.context.evidence[0].content = "A different exchange";
  if (change === "binding") delete verdict.decision!.result.details;
  if (change === "wish") currentWish.wish = "Talk about trees";
  applyPreparedWishVerdict(state, input, verdict);
  assert.equal(
    state.villagers[0].agenda!.wishes.length,
    change === "none" ? 0 : 1,
    "Wish application revalidates the actual goal, evidence and Decision binding: " + change,
  );
}
const historical = structuredClone(v3.checks[0]);
historical.evidence[0].current = false;
assert.equal(decisionCandidates(historical), null, "historical fulfillment cannot bind to unrelated current speech");
const conditions = structuredClone(wish);
conditions.knowledge = {
  conditions: [{ text: "Only after sunset", at: "2026-10-01" }],
  discoveries: [],
  evidence: [],
} as any;
const beforeConditions = decisionCalls;
await wishes.interpretWishBatch([conditions], "scene", "conditions", true, true, true);
assert.equal(decisionCalls, beforeConditions);
const physical = structuredClone(wish);
physical.wishes[0].wish = "Receive a cupcake";
physical.evidence = [];
physical.receipts = [
  {
    id: "delivery",
    text: "Pat handed Ada a cupcake.",
    at: "2026-10-01",
    venueId: "cafe",
    venueName: "Cafe",
    actionReceipt: {
      happened: true,
      submissionId: "delivery",
      narration: "Delivered",
      witnessIds: ["ada"],
      removeItem: "cupcake",
      itemTransfer: { itemName: "cupcake", recipientId: "ada" },
    },
  },
];
const delivered = await wishes.interpretWishBatch([physical], "scene", "physical", true, true, true);
assert.equal(
  delivered.results[0].source,
  "decisions",
  "neutral physical Wish wording uses original goal and receipt meaning",
);
assert.deepEqual(delivered.results[0].evidenceIds, ["receipt:delivery"]);
physical.receipts[0].actionReceipt!.witnessIds = [];
const beforeUnwitnessed = decisionCalls;
await wishes.interpretWishBatch([physical], "scene", "unwitnessed", true, true, true);
assert.equal(decisionCalls, beforeUnwitnessed);

// Run the Wish judge under the real durable background owner, without a Scene operation.
const rows = new Map<string, any>();
let world = defaultVillageState();
world.seed = "seed";
world.villagers = [{ characterId: "ada", cardSnapshot: { name: "Ada" }, agenda: null }] as any;
let failApply = true;
const documents: any = {
  getById: async (_pkg: string, id: string) => structuredClone(rows.get(id) ?? null),
  list: async (_pkg: string, kind: string) => structuredClone([...rows.values()].filter((row) => row.kind === kind)),
  create: async (input: any) => {
    const row = { ...structuredClone(input), revision: 1 };
    rows.set(row.id, row);
    return row;
  },
  update: async (input: any) => {
    const old = rows.get(input.id);
    if (old?.revision !== input.expectedRevision) return null;
    const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
    rows.set(row.id, row);
    return row;
  },
};
const background = createBackgroundWork({
  villagesDocuments: () => documents,
  villagesLogger: () => ({ debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} }),
  readVillageState: async () => structuredClone(world),
  mutateVillageState: async (mutate) => {
    const next = structuredClone(world);
    await mutate(next);
    world = next;
    return world;
  },
  withUsagePurpose: (_purpose, work) => work(),
  measurePipeline: (_name, _tags, work) => work(),
  runtimeDebug() {},
  backgroundCalls: context.backgroundCalls,
  handlers: new Map([
    [
      "wish-check",
      {
        valid: () => true,
        generate: async () => wishes.interpretWishBatch([wish], "scene", "background", true, true, true),
        apply: (state: typeof world, _input: unknown, result: typeof v3) => {
          if (failApply) throw new Error("synthetic application failure");
          state.setting = result.results[0].source;
        },
      },
    ],
  ]),
});
const stop = background.startBackgroundWork({ now: () => 0 });
try {
  const before = decisionCalls,
    beforeSystem = systemCalls;
  evaluateHook = async () => {
    const job = [...rows.values()].find((row) => row.kind === "background-work").data;
    assert.equal(
      Object.values(job.optionalAttempts)[0] && (Object.values(job.optionalAttempts)[0] as any).status,
      "dispatching",
    );
    assert.equal(job.steps.length, 0, "optional attempts never masquerade as required System steps");
  };
  await background.queueBackgroundJob({
    kind: "wish-check",
    subjectId: "wish",
    residentIds: ["ada"],
    revision: "1",
    seed: "seed",
    finite: true,
    label: "Wish",
    input: { proposal: { actorId: "ada" } },
  });
  await background.settleBackgroundWork();
  assert.equal(decisionCalls, before + 1);
  assert.equal(systemCalls, beforeSystem, "background Wish Decisions avoid a System request");
  const summary = (await background.backgroundWorkSummaries())[0];
  assert.equal(summary.status, "failed");
  assert.equal(summary.requests, 1);
  assert.equal(summary.connectionPaused, false);
  enabled = false;
  failApply = false;
  await background.retryBackgroundJob(summary.id, summary.attempt, "retry-application");
  await background.settleBackgroundWork();
  assert.equal(decisionCalls, before + 1, "saved answer is reused on explicit application retry");
  assert.equal(world.setting, "decisions");
} finally {
  stop();
}
console.log("Decision grounding, conservative routing, Wish capability and durable background ownership: ok");
