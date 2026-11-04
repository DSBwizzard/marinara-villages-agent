/** Preparation receipts contain no prompts, replies or private Wish contents. */
export type FoundingTaskKind = "routine" | "wish";
export type FoundingTask = {
  contract: 1;
  revision: string;
  jobId: string;
  status: "pending" | "running" | "failed" | "completed";
  attempt: number;
  error: string;
  receipt?: string;
  allowanceId?: string;
};
export type FoundingResidentTasks = Record<string, Partial<Record<FoundingTaskKind, FoundingTask>>>;
export type FoundingRetry = {
  characterId?: string;
  task?: FoundingTaskKind;
  expectedAttempt?: number;
  actionId?: string;
};
