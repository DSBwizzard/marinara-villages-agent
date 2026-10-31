import type { CapabilityLanguageModelCompletion } from "@marinara-engine/shared";

export type VillageCompletionOptions = {
  responseFormat?: Readonly<{ type: string; [key: string]: unknown }>;
  /** Stable background request identity; optional for legacy sequential generators. */
  checkpointId?: string;
  /** Background-only guard for new work, after saved-response replay and before any request reservation. */
  beforeBackgroundDispatch?: () => Promise<void>;
  /** Durable replay response for a standalone task, separate from applying its effects. */
  savedRequest?: {
    key: string;
    retry: boolean;
    valid?: (result: CapabilityLanguageModelCompletion) => boolean;
    /** Exact accepted domain projection, using the same parser as application. */
    replayContent?: (result: CapabilityLanguageModelCompletion) => string;
  };
  temperature: number | null;
  reasoningEffort?: "none" | "low" | "medium" | "high" | "xhigh" | "max" | null;
  /** Replay a completed response from the prior reasoning policy; never dispatch it. */
  replayReasoningEffort?: "low";
  verbosity?: "low" | "medium" | "high" | null;
  debugMode?: boolean;
  signal?: AbortSignal;
  onAttempt?: (completion: CapabilityLanguageModelCompletion, elapsedMs: number, maxTokens: number) => void;
  /** Legacy caller compatibility; empty responses never dispatch an automatic replacement. */
  retryEmpty?: boolean;
  usagePurpose?: import("./usage-model.js").UsagePurpose;
};
