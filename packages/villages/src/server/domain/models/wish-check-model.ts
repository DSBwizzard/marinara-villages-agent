import type { WishFactCandidate } from "../rules/wish-journal.js";
import type { WorkFailure } from "../rules/work-failure.js";
import type { VenueRecordEvent } from "./scene-model.js";
import type { WishCriteria, WishInterpretationContext } from "./wish-interpretation-model.js";
import type { VillageWish } from "./world.js";

export type ExchangeEffectReceipt = {
  committedAt?: string;
  noticeSequence?: number;
  status?: "applied" | "rejected";
  actorId?: string;
  wishId?: string;
  id: string;
  sceneId: string;
  submissionId: string;
  domain: "wishes" | "memories" | "physical";
  physicalOutcome?: import("./world.js").VillageVenueEvent;
  at: string;
  evidenceIds: string[];
  reason: string;
  notice?: VenueRecordEvent;
};
export type WishProposal = {
  conditionRevision?: number;
  conditionAt?: string;
  facts?: WishFactCandidate[];
  receiptIds?: string[];
  actorId: string;
  wishId: string;
  fingerprint: string;
  intent: "reveal" | "journal" | "progress" | "check";
  lineIds: string[];
};
export type WishCheckInput = {
  contractVersion?: 2;
  sceneId: string;
  submissionId: string;
  seed: string;
  proposal: WishProposal;
  wish: VillageWish;
  at: string;
  context: WishInterpretationContext;
};
export type PreparedWishVerdict = {
  criteria: WishCriteria;
  outcome: string;
  evidenceIds: string[];
  reason: string;
  memory: string;
  receiptIds: string[];
};
export type WishBatchInput = {
  contractVersion?: 2;
  sceneId: string;
  submissionId: string;
  seed: string;
  items: WishCheckInput[];
};
export type PreparedWishBatch = { items: { id: string; verdict: PreparedWishVerdict }[]; failures?: WorkFailure[] };
