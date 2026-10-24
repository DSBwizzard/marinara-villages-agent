import type { InterpretationCheck, InterpretationResult } from "./interpretation-check-model.js";
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
  domain: "wishes" | "memories" | "physical" | "development" | "relationships";
  physicalOutcome?: import("./world.js").VillageVenueEvent;
  /** Immutable private writing context from this exact effect, never live authority. */
  sceneFacts?: import("../rules/scene-continuity.js").SceneEffectFacts;
  at: string;
  evidenceIds: string[];
  reason: string;
  notice?: VenueRecordEvent;
};
export type WishProposal = {
  semanticVerdict?: { outcome: "none" | "progress" | "fulfilled"; evidenceIds: string[]; reason: string };
  semanticCriteria?: WishCriteria;
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
  contractVersion?: 2 | 3;
  sceneId: string;
  submissionId: string;
  seed: string;
  proposal: WishProposal;
  wish: VillageWish;
  at: string;
  context: WishInterpretationContext;
};
export type PreparedWishVerdict = {
  decision?: { check: InterpretationCheck; result: InterpretationResult };
  criteria: WishCriteria;
  outcome: string;
  evidenceIds: string[];
  reason: string;
  memory: string;
  receiptIds: string[];
};
export type WishBatchInput = {
  contractVersion?: 2 | 3;
  sceneId: string;
  submissionId: string;
  seed: string;
  items: WishCheckInput[];
};
export type PreparedWishBatch = { items: { id: string; verdict: PreparedWishVerdict }[]; failures?: WorkFailure[] };
