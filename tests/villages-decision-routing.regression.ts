import type { CapabilityDecisionResult } from "@marinara-engine/shared";
import assert from "node:assert/strict";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import type { InterpretationCheck } from "../packages/villages/src/server/domain/models/interpretation-check-model.js";
import {
  boundDecisionResult,
  decisionCandidates,
  validDecisionEvidence,
} from "../packages/villages/src/server/domain/rules/decision-candidates.js";
import { coerceInterpretationSettings } from "../packages/villages/src/server/domain/rules/interpretation-policy.js";
import { createInterpretation } from "../packages/villages/src/server/features/generation/interpretation-service.js";

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

const roomCheck: InterpretationCheck = {
  id: "room",
  domain: "room",
  question: "Does Ada invite Pat into the room now?",
  facts: { actorId: "ada", playerName: "Pat", venueName: "Home", zoneName: "Room" },
  outcomes: [{ id: "invite-now", statement: "Ada permits Pat to enter now." }],
  evidence: [{ id: "draft:0", speakerId: "ada", name: "Ada", content: "Come inside.", current: true }],
};
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
assert(validDecisionEvidence(good.checks[0], good.results[0]));
const legacy = structuredClone(good);
delete legacy.results[0].details;
assert(!validDecisionEvidence(legacy.checks[0], legacy.results[0]));
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

console.log("Decision grounding and narrow room/Project routing passed.");
