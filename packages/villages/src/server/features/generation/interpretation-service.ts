import type { resolveVillagesDecisionBackend } from "../../adapters/engine/decisions-adapter.js";
import type { trackUsage } from "../../adapters/models/usage-ledger.js";
import type { venueOperationSignal } from "../../adapters/operations/operation-context.js";
import type { InterpretationCheck, InterpretationResult } from "../../domain/models/interpretation-check-model.js";
import type { InterpretationBatch, InterpretationTrace } from "../../domain/models/interpretation-model.js";
import { asRecord } from "../../domain/rules/coerce.js";
import {
  boundInterpretationEvidence,
  interpretationPayload,
} from "../../domain/rules/interpretation-evidence-rules.js";
import { fingerprint, readDecisionInterpretation } from "../../domain/rules/interpretation-rules.js";
import type { routeInterpretationChecks } from "../../domain/rules/interpretation-routing.js";
import type {
  coordinatedOptionalCompletion,
  venueCheckpoint,
  venueInterpretationSettings,
} from "../../jobs/venue-coordinator.js";
import type { writeInterpretationDiagnostics } from "./interpretation-diagnostics.js";
import type { systemInterpretations } from "./system-interpretation.js";
export type InterpretationPorts = {
  resolveVillagesDecisionBackend: typeof resolveVillagesDecisionBackend;
  trackUsage: typeof trackUsage;
  venueOperationSignal: typeof venueOperationSignal;
  coordinatedOptionalCompletion: typeof coordinatedOptionalCompletion;
  venueCheckpoint: typeof venueCheckpoint;
  venueInterpretationSettings: typeof venueInterpretationSettings;
  writeInterpretationDiagnostics: typeof writeInterpretationDiagnostics;
  systemInterpretations: typeof systemInterpretations;
  bindCallback<T extends (...args: never[]) => unknown>(callback: T): T;
};
/** Interpretation checkpoints and their deferred work use one application's connections. */
export function createInterpretation(ports: InterpretationPorts) {
  const {
    resolveVillagesDecisionBackend,
    trackUsage,
    venueOperationSignal,
    coordinatedOptionalCompletion,
    venueCheckpoint,
    venueInterpretationSettings,
    writeInterpretationDiagnostics,
    systemInterpretations,
    bindCallback,
  } = ports;

  async function interpretChecks(
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
    return venueCheckpoint(
      stage,
      bindCallback(async () => {
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
          const outcome = await coordinatedOptionalCompletion(
            `decisions:${fingerprint(eligible)}`,
            bindCallback(async (signal) => {
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
              const answers = await trackUsage(
                { model: backend.model, purpose: "checks", stage: "decisions" },
                bindCallback(() => backend.ask(state, questions)),
              );
              return {
                reason: answers ? "" : "Decision model supplied no usable answer",
                model: backend.model,
                threshold: backend.calibration.defaultThreshold,
                scores: answers ? Object.fromEntries(answers) : {},
              };
            }),
          );
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
                outcome?.reason ||
                (selected ? "" : "Missing, conflicting, or unresolved Decisions answer; using System"),
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
          const native = await venueCheckpoint(
            `${stage}-system`,
            bindCallback(() => nativeResolver(pending, venueOperationSignal())),
          );
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
      }),
    );
  }

  async function recordInterpretationRouting(sceneId: string, selection: ReturnType<typeof routeInterpretationChecks>) {
    const traces: InterpretationTrace[] = selection.skipped.map(({ check, reason }) => ({
      id: check.id + ":routing",
      domain: check.domain,
      question: check.question,
      evidence: check.evidence,
      decisions: { status: "off" },
      system: { status: "not-requested", reason },
      result: { outcome: "none", source: "system", evidenceIds: [], reason },
      applied: "Skipped by narration routing; no interpretation request",
      startedAt: new Date().toISOString(),
    }));
    for (const check of selection.checks)
      traces.push({
        id: check.id + ":routing",
        domain: check.domain,
        question: check.question,
        evidence: check.evidence,
        decisions: { status: "off" },
        system: { status: "not-requested", reason: selection.reasons.get(check.id) },
        result: {
          outcome: "unresolved",
          source: "system",
          evidenceIds: [],
          reason: selection.reasons.get(check.id) ?? "",
        },
        applied: "Selected for verification",
        startedAt: new Date().toISOString(),
      });
    if (traces.length) await writeInterpretationDiagnostics(sceneId, traces);
  }

  return { interpretChecks, recordInterpretationRouting };
}
export type InterpretationService = ReturnType<typeof createInterpretation>;
