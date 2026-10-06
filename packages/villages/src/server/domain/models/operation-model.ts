import type { InterpretationSettings } from "../rules/interpretation-policy.js";
import type { WorkFailure } from "../rules/work-failure.js";

export type VenueOperation = {
  failure?: WorkFailure;
  interpretationSettings?: InterpretationSettings;
  optionalAttempts?: Record<
    string,
    { status: "dispatching" | "complete" | "unknown"; elapsedMs: number; result?: unknown }
  >;
  id: string;
  kind: string;
  input: Record<string, unknown>;
  token: string;
  attemptId: string;
  status: "running" | "interrupted" | "complete";
  stage: string;
  startedAt: string;
  sceneRevision: number;
  snapshot: Record<string, unknown> | null;
  checkpoints: Record<string, unknown>;
  attempts: Record<
    string,
    { status: "dispatching" | "complete" | "interrupted" | "rejected"; elapsedMs?: number; result?: unknown }
  >;
  error: string;
};
export type VenueRequestMetrics = Array<{
  stage: string;
  status: "dispatching" | "complete" | "interrupted" | "rejected";
  elapsedMs?: number;
  usage: unknown;
}> | null;
