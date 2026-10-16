import { villageNow } from "../../adapters/time/clock-gate.js";
import type { evaluateVillagesDecisions, decisionAdapterStatus } from "../../adapters/engine/decisions-adapter.js";
import type { trackUsage } from "../../adapters/models/usage-ledger.js";
import type { venueOperationSignal } from "../../adapters/operations/operation-context.js";
import type { InterpretationCheck, InterpretationResult } from "../../domain/models/interpretation-check-model.js";
import type { InterpretationBatch, InterpretationTrace } from "../../domain/models/interpretation-model.js";
import {
  boundDecisionResult,
  decisionCandidates,
  validDecisionEvidence,
} from "../../domain/rules/decision-candidates.js";
import { measureModel } from "../../adapters/observability/pipeline-metrics.js";
import type { backgroundCalls, backgroundSetting } from "../../adapters/operations/background-context.js";
import type { readInterpretationSettings } from "../settings/interpretation-settings.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { boundInterpretationEvidence } from "../../domain/rules/interpretation-evidence-rules.js";
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
  evaluateVillagesDecisions: typeof evaluateVillagesDecisions;
  decisionAdapterStatus: typeof decisionAdapterStatus;
  trackUsage: typeof trackUsage;
  backgroundCalls: typeof backgroundCalls;
  backgroundSetting: typeof backgroundSetting;
  readInterpretationSettings: typeof readInterpretationSettings;
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
    evaluateVillagesDecisions,
    decisionAdapterStatus,
    trackUsage,
    backgroundCalls,
    backgroundSetting,
    readInterpretationSettings,
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
    const background = backgroundCalls.getStore();
    const settings = background
      ? await backgroundSetting("interpretation-settings", readInterpretationSettings)
      : venueInterpretationSettings();
    const signal = background?.signal ?? venueOperationSignal();
    const optional = background ? background.optionalCompletion : coordinatedOptionalCompletion;
    return venueCheckpoint(
      stage,
      bindCallback(async () => {
        const startedAt = villageNow().toISOString();
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
        const candidates = new Map(checks.map((check) => [check, decisionCandidates(check)]));
        const eligible = checks.filter((check) => candidates.get(check));
        if (settings.decisionsEnabled && eligible.length && (await decisionAdapterStatus()).available) {
          const questions = eligible.flatMap((check, index) =>
            candidates.get(check)!.map((candidate, option) => ({
              id: `${index}:${option}`,
              question: candidate.question,
            })),
          );
          const outcome =
            questions.length <= 32
              ? await optional?.(
                  `decisions:v1:${fingerprint(eligible)}`,
                  bindCallback(async (signal) => {
                    const result = await measureModel(() =>
                      trackUsage(
                        { capability: "decisions", purpose: "checks", stage: "decisions" },
                        bindCallback(() =>
                          evaluateVillagesDecisions({ messages: [], questions, signal, debugMode: false }),
                        ),
                      ),
                    );
                    signal.throwIfAborted();
                    return result;
                  }),
                )
              : undefined;
          for (const [index, check] of checks.entries()) {
            const decisionIndex = eligible.indexOf(check);
            const selected =
              decisionIndex >= 0 && outcome && outcome.threshold !== undefined && outcome.answers
                ? readDecisionInterpretation(
                    check,
                    new Map(Object.entries(outcome.answers)),
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
                decisionIndex >= 0 && outcome?.answers
                  ? Object.fromEntries(
                      check.outcomes.map((option, optionIndex) => [
                        option.id,
                        outcome.answers![`${decisionIndex}:${optionIndex}`],
                      ]),
                    )
                  : undefined,
              reason: selected ? "" : "Missing, conflicting, or unresolved Decisions answer; using System",
            };
            if (selected) {
              const candidate = candidates.get(check)!.find((item) => item.outcome === selected)!;
              const result = boundDecisionResult(check, candidate);
              if (validDecisionEvidence(check, result)) traces[index].result = result;
              else traces[index].decisions.reason = "Decision evidence or outcome requires System validation";
            }
          }
        }
        for (const [index, check] of checks.entries())
          if (settings.decisionsEnabled && !candidates.get(check))
            traces[index].decisions.reason =
              check.decisionReason || "Complete witnessed evidence does not fit a narrow Decision; using System";
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
            bindCallback(() => nativeResolver(pending, signal)),
          );
          for (const [index, check] of checks.entries()) {
            const result = native[pending.findIndex((item) => item.id === check.id)];
            if (result) {
              traces[index].result = result;
              traces[index].system = { status: "complete", outcome: result.outcome, reason: result.reason };
            }
          }
        }
        signal?.throwIfAborted();
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
      startedAt: villageNow().toISOString(),
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
        startedAt: villageNow().toISOString(),
      });
    if (traces.length) await writeInterpretationDiagnostics(sceneId, traces);
  }

  return { interpretChecks, recordInterpretationRouting };
}
export type InterpretationService = ReturnType<typeof createInterpretation>;
