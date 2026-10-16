import type { CapabilityLanguageModelCompletion } from "@marinara-engine/shared";

export type VillageCompletionOptions = {
  responseFormat?: Readonly<{ type: string; [key: string]: unknown }>;
  /** Stable background request identity; optional for legacy sequential generators. */
  checkpointId?: string;
  temperature: number | null;
  reasoningEffort?: "none" | "low" | "medium" | "high" | "xhigh" | "max" | null;
  verbosity?: "low" | "medium" | "high" | null;
  debugMode?: boolean;
  signal?: AbortSignal;
  onAttempt?: (completion: CapabilityLanguageModelCompletion, elapsedMs: number, maxTokens: number) => void;
  /** Scene turns disable blank retries; other callers retain their existing policy. */
  retryEmpty?: boolean;
  usagePurpose?: import("./usage-model.js").UsagePurpose;
};
