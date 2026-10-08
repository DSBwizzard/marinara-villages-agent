import type { ResponseDiagnostics } from "../rules/response-diagnostics.js";
import type { WorkFailure } from "../rules/work-failure.js";
import type { BackgroundCompletion } from "./background-completion-model.js";
import type { VillageState } from "./world.js";

export type BackgroundKind = "story" | "agenda" | "translation" | "wish" | "wish-check" | "mail" | "adaptation";
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
  key?: string;
  fingerprint: string;
  status: "running" | "completed";
  response?: Awaited<ReturnType<BackgroundCompletion>>;
  responseDiagnostics?: ResponseDiagnostics;
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
};
export type Job = BackgroundInput & {
  id: string;
  status: BackgroundStatus;
  owner: string;
  attempt: number;
  steps: Step[];
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
  generate(input: any): Promise<unknown>;
  valid(state: VillageState, input: any): boolean;
  apply(state: VillageState, input: any, result: any, context: { retrying: boolean }): void | WorkFailure;
  /** Pure local validation of saved replies on deliberate retry, before discarding failed steps. */
  recoverSavedResult?(input: any, steps: readonly Step[]): unknown;
  afterApply?(input: any, finite: boolean): Promise<void>;
  afterFailure?(input: any): Promise<void>;
};
export type Ticket = { start(): Promise<void>; reject(error: Error): void };
