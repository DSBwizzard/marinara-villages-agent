import type { ResponseDiagnostics } from "../rules/response-diagnostics.js";
import type { WorkFailure } from "../rules/work-failure.js";
import type { BackgroundCompletion } from "./background-completion-model.js";
import type { VillageState } from "./world.js";

export type BackgroundKind =
  | "schedule-influence"
  | "starting-ties"
  | "story" // Read-only compatibility for retired prose jobs.
  | "resident-planning"
  | "world-development"
  | "agenda"
  | "translation"
  | "wish"
  | "personal-mail"
  | "social-recovery";
export type BackgroundStatus = "queued" | "running" | "paused" | "failed" | "interrupted" | "completed" | "obsolete";
export type BackgroundSummary = {
  id: string;
  kind: BackgroundKind;
  subjectId: string;
  label: string;
  status: BackgroundStatus;
  attempt: number;
  completedSteps: number;
  requests: number;
  tokens: number | null;
  error: string;
  connectionPaused: boolean;
  failure?: WorkFailure;
  updatedAt?: string;
  failedAt?: string;
};
export type Step = {
  /** Raw late evidence has been adopted but not yet validated by its generator. */
  lateResponse?: boolean;
  key?: string;
  fingerprint: string;
  status: "running" | "completed";
  response?: Awaited<ReturnType<BackgroundCompletion>>;
  responseClaim?: { attempt: number; id: string };
  responseRef?: { id: string; digest: string };
  responseDiagnostics?: ResponseDiagnostics;
  timing?: {
    queuedAt: string;
    admittedAt: string;
    hostStartedAt?: string;
    hostFinishedAt?: string;
    queueMs: number;
    hostMs?: number;
    requestedOutputTokens: number;
    reasoningRequested?: string;
    outcome: "pending" | "complete" | "unknown";
    firstResponseMs: null;
  };
};
export type BackgroundInput = {
  residentIds?: string[];
  residentId?: string;
  kind: BackgroundKind;
  subjectId: string;
  seed: string;
  revision: string;
  finite: boolean;
  label: string;
  input: unknown;
  legacyError?: string;
  automaticDate?: string;
  expectedAttempt?: number;
  /** Server-owned explicit retry admission for a replacement with changed source inputs. */
  retryActionId?: string;
};
export type Job = BackgroundInput & {
  id: string;
  status: BackgroundStatus;
  owner: string;
  attempt: number;
  steps: Step[];
  optionalAttempts?: Record<
    string,
    { status: "dispatching" | "complete" | "unknown"; elapsedMs: number; result?: unknown }
  >;
  attemptHistory?: Array<{
    attempt: number;
    requests: number;
    tokens: number | null;
    failure?: WorkFailure;
    steps: Array<Pick<Step, "key" | "status" | "timing" | "responseDiagnostics">>;
  }>;
  settings: Record<string, unknown>;
  result?: unknown;
  hasResult: boolean;
  requests: number;
  tokens: number | null;
  error: string;
  failedStep: number | null;
  retryActions: string[];
  retrying: boolean;
  connectionId: string;
  highWaterDate: string;
  replacement?: BackgroundInput;
  connectionPaused: boolean;
  completedCount: number;
  usageComplete: boolean;
  failure?: WorkFailure;
  partialResult?: boolean;
  failedAt?: string;
};
export type Handler = {
  authority?: "raw";
  reserve?(state: VillageState, input: any, attemptId: string): void;
  generate(input: any): Promise<unknown>;
  valid(state: VillageState, input: any, admission?: { activityAttemptId: string; activityDate?: string }): boolean;
  apply(state: VillageState, input: any, result: any, context: { retrying: boolean }): void | WorkFailure;
  /** Pure local validation of saved replies on deliberate retry, before discarding failed steps. */
  recoverSavedResult?(input: any, steps: readonly Step[]): unknown;
  afterApply?(input: any, finite: boolean): Promise<void>;
  afterFailure?(input: any): Promise<void>;
};
export type Ticket = { start(): Promise<void>; reject(error: Error): void };
