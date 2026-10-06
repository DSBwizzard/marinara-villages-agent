import type { VillageCompletedWish, VillageWish } from "./types.js";

export type WishPolicy = "lasting" | "recurring" | "unknown";
export type WishNeed = {
  id: string;
  subject: string;
  action: string;
  policy: WishPolicy;
  aliases: string[];
  state?: "active" | "fulfilled" | "expired" | "corrected";
  latestAt?: string;
  lastFulfilledAt: string;
  /** Latest valid fulfillment, retained even when a later recurring wish expires. */
  lastOutcomeSequence?: number;
};
export type WishActivity = {
  wishId: string;
  dateKey: string;
  startMinute: number;
  endMinute: number;
  venueId: string;
  zoneId?: string;
  activity: string;
  reason: string;
  baseRevision: string;
};
export type WishOutcome = VillageCompletedWish & {
  sequence: number;
  needId: string;
  kind: "fulfilled" | "expired";
  correctedAt?: string;
};
export type WishAttempt = {
  /** One finite replacement after the authorized Wish reset, independent of story pace. */
  resetRefill?: true;
  needComparison?: { matchedNeedId: string; certain: boolean; knownIds: string[] };
  routineIdea?: unknown;
  id: string;
  dateKey: string;
  at: string;
  stage: "reserved" | "generated" | "comparing" | "validated" | "done";
  candidate?: VillageWish;
  activity?: WishActivity;
  accepted?: boolean;
  matchedNeedId?: string;
  reason: string;
  calls: number;
  elapsedMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  revision: string;
};
export type WishLifecycle = {
  version: 1;
  needs: WishNeed[];
  attempt?: WishAttempt;
  lastPhaseKey: string;
  outcomeCount: number;
  pendingOutcomes: WishOutcome[];
};
