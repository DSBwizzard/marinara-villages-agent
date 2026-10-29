import type { VenueRecordEvent } from "./scene-model.js";

export type ExchangeEffectReceipt = {
  wishOutcome?: "fulfilled" | "corrected";
  wishDisclosures?: import("../../../shared/contracts/wishes.js").WishDisclosure[];
  wishGoal?: string;
  wishAudience?: string[];
  wishDisclosure?: true;
  memoryProposal?: import("./memories.js").MemoryProposal;
  committedAt?: string;
  noticeSequence?: number;
  status?: "applied" | "rejected";
  actorId?: string;
  wishId?: string;
  id: string;
  sceneId: string;
  submissionId: string;
  domain: "wishes" | "memories" | "physical" | "development" | "relationships";
  /** Stable action/source identity for idempotent offscreen physical settlement. */
  sourceHash?: string;
  physicalOutcome?: import("./world.js").VillageVenueEvent;
  /** Immutable private writing context from this exact effect, never live authority. */
  sceneFacts?: import("../rules/scene-continuity.js").SceneEffectFacts;
  at: string;
  evidenceIds: string[];
  reason: string;
  notice?: VenueRecordEvent;
};
export type WishProposal = {
  actorId: string;
  wishId: string;
  fingerprint: string;
  intent: string;
  lineIds: string[];
  change: import("../rules/social-wishes.js").SocialWishChange;
  captured: import("./world.js").VillageVillager[];
};
