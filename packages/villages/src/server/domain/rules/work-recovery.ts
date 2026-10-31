import type { BackgroundInput, Job } from "../models/background-model.js";
import { isBackgroundInstance } from "./background-revision.js";

export type WorkRecoveryState = "pending" | "recoverable" | "uncertain" | "completed" | "failed" | "abandoned";

/** Evidence wins over a terminal-looking label. This does not authorize deletion of replay protection. */
export function workRecoveryState(facts: {
  pending: boolean;
  uncertain: boolean;
  savedWork: boolean;
  completed: boolean;
  abandonmentFenced: boolean;
}): WorkRecoveryState {
  if (facts.uncertain) return "uncertain";
  if (facts.pending) return "pending";
  if (facts.savedWork) return "recoverable";
  if (facts.completed) return "completed";
  if (facts.abandonmentFenced) return "abandoned";
  return "failed";
}

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const kinds: Record<Job["kind"], true> = {
  "schedule-influence": true,
  "starting-ties": true,
  story: true,
  "resident-planning": true,
  "world-development": true,
  agenda: true,
  translation: true,
  wish: true,
  "personal-mail": true,
  "social-recovery": true,
};
export const isBackgroundKind = (value: unknown): value is Job["kind"] =>
  typeof value === "string" && Object.hasOwn(kinds, value);
export function isBackgroundInput(value: unknown): value is BackgroundInput {
  return (
    record(value) &&
    isBackgroundKind(value.kind) &&
    ["seed", "subjectId", "revision", "label"].every((key) => typeof value[key] === "string") &&
    typeof value.finite === "boolean" &&
    Object.hasOwn(value, "input")
  );
}

/** Minimum evidence/identity shape required for retention and summary projection, not a legacy decoder. */
export function isBackgroundRecoveryRecord(value: unknown): value is Job {
  if (!record(value)) return false;
  if (
    typeof value.status !== "string" ||
    !["queued", "running", "paused", "failed", "interrupted", "completed", "obsolete"].includes(value.status)
  )
    return false;
  if (!["id", "seed", "kind", "subjectId"].every((key) => typeof value[key] === "string")) return false;
  if (!isBackgroundInstance(value.instanceId)) return false;
  if (!isBackgroundKind(value.kind)) return false;
  if (!Number.isSafeInteger(value.requests) || Number(value.requests) < 0 || typeof value.hasResult !== "boolean")
    return false;
  if (
    !Array.isArray(value.steps) ||
    !value.steps.every(
      (step) =>
        record(step) &&
        typeof step.fingerprint === "string" &&
        typeof step.status === "string" &&
        ["running", "completed"].includes(step.status) &&
        (step.response == null || record(step.response)) &&
        (step.responseRef === undefined || record(step.responseRef)) &&
        (step.timing === undefined ||
          (record(step.timing) &&
            typeof step.timing.outcome === "string" &&
            ["pending", "complete", "unknown"].includes(step.timing.outcome))),
    )
  )
    return false;
  if (
    value.optionalAttempts !== undefined &&
    (!record(value.optionalAttempts) ||
      !Object.values(value.optionalAttempts).every(
        (attempt) =>
          record(attempt) &&
          typeof attempt.status === "string" &&
          ["dispatching", "complete", "unknown"].includes(attempt.status),
      ))
  )
    return false;
  if (value.partialResult !== undefined && typeof value.partialResult !== "boolean") return false;
  if (value.failure !== undefined && (!record(value.failure) || typeof value.failure.cause !== "string")) return false;
  if (value.replacement !== undefined && !isBackgroundInput(value.replacement)) return false;
  return true;
}

/** Background status alone cannot prove that a saved reply or interrupted request is disposable. */
export function backgroundRecoveryState(value: unknown): WorkRecoveryState {
  if (!isBackgroundRecoveryRecord(value)) return "uncertain";
  const job = value;
  const scheduled = ["queued", "running", "paused"].includes(job.status);
  const steps = job.steps ?? [];
  const optional = Object.values(job.optionalAttempts ?? {});
  return workRecoveryState({
    pending: scheduled || !!job.replacement,
    uncertain:
      !scheduled &&
      (steps.some(
        (step) =>
          step.status === "running" || (step.timing?.outcome === "unknown" && !step.response && !step.responseRef),
      ) ||
        optional.some((attempt) => ["dispatching", "unknown"].includes(attempt.status)) ||
        (job.failure?.cause === "unknown_request" &&
          !job.hasResult &&
          !steps.some((step) => step.response || step.responseRef))),
    savedWork:
      !!job.hasResult ||
      !!job.partialResult ||
      job.result !== undefined ||
      steps.some((step) => step.response != null || step.responseRef != null) ||
      optional.some((attempt) => attempt.status === "complete"),
    completed: job.status === "completed",
    // Obsolete is a scheduling label, not proof that every external callback/effect was reconciled.
    abandonmentFenced: false,
  });
}
