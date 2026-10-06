import { asRecord } from "./coerce.js";
import { resolveVillagesDecisionBackend } from "./decisions-adapter.js";
import { writeInterpretationDiagnostics } from "./interpretation-diagnostics.js";
import { boundInterpretationEvidence, interpretationPayload } from "./interpretation-evidence.js";
import type { InterpretationSettings } from "./interpretation-policy.js";
import { venueOperationSignal } from "./operation-context.js";
import {
  fingerprint,
  type InterpretationCheck,
  type InterpretationEvidence,
  type InterpretationResult,
  systemInterpretations,
} from "./system-interpretation.js";
import { trackUsage } from "./usage-ledger.js";
import { coordinatedOptionalCompletion, venueCheckpoint, venueInterpretationSettings } from "./venue-coordinator.js";

export {
  type InterpretationEvidence,
  type InterpretationCheck,
  type InterpretationResult,
} from "./system-interpretation.js";

export { systemInterpretations, readSystemInterpretations, compactWishChecks } from "./system-interpretation.js";

export type InterpretationTrace = {
  id: string;
  question: string;
  domain: InterpretationCheck["domain"];
  evidence: InterpretationEvidence[];
  decisions: {
    status: "off" | "unavailable" | "answered";
    outcome?: string;
    model?: string;
    scores?: Record<string, number>;
    threshold?: number;
    reason?: string;
  };
  system: {
    status: "not-requested" | "pending" | "complete" | "unavailable" | "unknown";
    outcome?: string;
    reason?: string;
  };
  result: InterpretationResult;
  applied: string;
  startedAt: string;
};
export type InterpretationBatch = {
  results: InterpretationResult[];
  traces: InterpretationTrace[];
  settings: InterpretationSettings;
  checks: InterpretationCheck[];
};

/** Only wire IDs change; canonical evidence and each check's witness allowlist stay authoritative. */

export function readDecisionInterpretation(
  check: InterpretationCheck,
  scores: Map<string, number>,
  threshold: number,
  index: number,
): string | null {
  const positive = check.outcomes.filter((_entry, option) => {
    const score = scores.get(`${index}:${option}`);
    return typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 1 && score >= threshold;
  });
  // No is not refusal, dismissal, or proof that an event was absent. Native interpretation resolves misses.
  return positive.length === 1 &&
    check.outcomes.every((_entry, option) => {
      const score = scores.get(`${index}:${option}`);
      return typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 1;
    })
    ? positive[0].id
    : null;
}
export async function interpretChecks(
  checks: InterpretationCheck[],
  stage: string,
  sceneId?: string,
  nativeResolver: (
    checks: InterpretationCheck[],
    signal?: AbortSignal,
  ) => Promise<InterpretationResult[]> = systemInterpretations,
): Promise<InterpretationBatch> {
  checks = checks.map(boundInterpretationEvidence);
  const settings = venueInterpretationSettings();
  return venueCheckpoint(stage, async () => {
    const startedAt = new Date().toISOString();
    const traces: InterpretationTrace[] = checks.map((check) => ({
      id: `${stage}:${check.id}`,
      question: check.question,
      domain: check.domain,
      evidence: check.evidence,
      decisions: { status: settings.decisionsEnabled ? "unavailable" : "off" },
      system: { status: "not-requested" },
      result: { outcome: "unresolved", source: "system", evidenceIds: [], reason: "" },
      applied: "Not yet applied",
      startedAt,
    }));
    if (sceneId) await writeInterpretationDiagnostics(sceneId, traces).catch(() => {});
    const eligible = checks.filter((check) => check.decisionEligible !== false);
    if (settings.decisionsEnabled && eligible.length) {
      const outcome = await coordinatedOptionalCompletion(`decisions:${fingerprint(eligible)}`, async (signal) => {
        const backend = await resolveVillagesDecisionBackend(signal);
        signal.throwIfAborted();
        if (!backend) return { reason: "No usable Engine Decision model" };
        if (backend.deferPreGeneration) return { reason: "Engine defers this reasoning model; using System" };
        if (
          !Number.isFinite(backend.calibration?.defaultThreshold) ||
          backend.calibration.defaultThreshold < 0 ||
          backend.calibration.defaultThreshold > 1
        )
          return { reason: "Invalid backend calibration" };
        const wire = interpretationPayload(eligible);
        if (!wire.fits)
          return { reason: "Essential evidence is unavailable or exceeds the bounded checking allowance" };
        const state = {
          ...wire.payload,
          checks: wire.payload.checks.map(({ outcomes: _outcomes, ...check }) => check),
        };
        // Do not let Engine truncation remove the very evidence establishing permission.
        if (JSON.stringify(state).length > backend.maxStateTokens * 3)
          return { reason: "Essential evidence exceeds the Decision context budget" };
        const questions = eligible.flatMap((check, index) =>
          check.outcomes.map((option, optionIndex) => ({
            id: `${index}:${optionIndex}`,
            instructions: option.statement,
          })),
        );
        if (questions.length > 32 || questions.some((question) => question.instructions.length > 500))
          return { reason: "This batch exceeds the bounded Decision allowance" };
        const answers = await trackUsage({ model: backend.model, purpose: "checks", stage: "decisions" }, () =>
          backend.ask(state, questions),
        );
        return {
          reason: answers ? "" : "Decision model supplied no usable answer",
          model: backend.model,
          threshold: backend.calibration.defaultThreshold,
          scores: answers ? Object.fromEntries(answers) : {},
        };
      });
      for (const [index, check] of checks.entries()) {
        const decisionIndex = eligible.indexOf(check);
        const selected =
          decisionIndex >= 0 && outcome && outcome.threshold !== undefined && outcome.scores
            ? readDecisionInterpretation(
                check,
                new Map(Object.entries(outcome.scores)),
                outcome.threshold,
                decisionIndex,
              )
            : null;
        traces[index].decisions = {
          status: selected ? "answered" : "unavailable",
          ...(selected ? { outcome: selected } : {}),
          model: outcome?.model,
          threshold: outcome?.threshold,
          scores:
            decisionIndex >= 0 && outcome?.scores
              ? Object.fromEntries(
                  check.outcomes.map((option, optionIndex) => [
                    option.id,
                    outcome.scores![`${decisionIndex}:${optionIndex}`],
                  ]),
                )
              : undefined,
          reason:
            outcome?.reason || (selected ? "" : "Missing, conflicting, or unresolved Decisions answer; using System"),
        };
        if (selected)
          traces[index].result = {
            outcome: selected,
            source: "decisions",
            evidenceIds: check.evidence.filter((line) => line.current).map((line) => line.id),
            reason: "",
          };
      }
    }
    for (const [index, check] of checks.entries())
      if (settings.decisionsEnabled && check.decisionEligible === false)
        traces[index].decisions.reason = check.decisionReason || "Open-ended extraction uses System";
    // Independently positive alternatives for one actor are contradictory targets, not permission for every room.
    for (const [index, check] of checks.entries()) {
      const actor = asRecord(check.facts).actorId;
      const projectPositive =
        check.domain === "project" && ["approve", "commit"].includes(traces[index].result.outcome);
      if (!actor || (!traces[index].result.outcome.startsWith("invite") && !projectPositive)) continue;
      const conflicting = checks.some(
        (other, otherIndex) =>
          otherIndex !== index &&
          asRecord(other.facts).actorId === actor &&
          (projectPositive
            ? other.domain === "project" &&
              asRecord(other.facts).kind === asRecord(check.facts).kind &&
              ["approve", "commit"].includes(traces[otherIndex].decisions.outcome ?? "")
            : traces[otherIndex].decisions.outcome?.startsWith("invite")),
      );
      if (conflicting) {
        traces[index].result = { outcome: "unresolved", source: "system", evidenceIds: [], reason: "" };
        traces[index].decisions.reason = "Conflicting interpretation targets; using System";
      }
    }
    const pending = checks.filter((_check, index) => traces[index].result.source !== "decisions");
    if (pending.length) {
      const native = await venueCheckpoint(`${stage}-system`, () => nativeResolver(pending, venueOperationSignal()));
      for (const [index, check] of checks.entries()) {
        const result = native[pending.findIndex((item) => item.id === check.id)];
        if (result) {
          traces[index].result = result;
          traces[index].system = { status: "complete", outcome: result.outcome, reason: result.reason };
        }
      }
    }
    if (sceneId) await writeInterpretationDiagnostics(sceneId, traces).catch(() => {});
    return { results: traces.map((trace) => trace.result), traces, settings, checks };
  });
}
